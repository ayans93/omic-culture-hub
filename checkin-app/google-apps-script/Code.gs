// OMIC Door Check-In -- standalone Apps Script backend.
//
// This is a SEPARATE Apps Script project from the one behind the main
// omic.spot website (that one handles event registrations and lives in its
// own project). This script only serves the door check-in app in this
// checkin-app/ folder, and only talks to the "Final List" Google Sheet
// below. Keeping it separate means a mistake here can never affect the
// live registration forms, and vice versa.
//
// Setup:
//   1. Open this sheet (docs.google.com/spreadsheets/d/1sHlIgHW2MNuZrkQ9PbtTx76SFcB_JAneYamtkcWg2Gg),
//      then Extensions > Apps Script (this creates a new script bound to
//      that sheet, which already has edit access to it -- simplest option,
//      and matches the owner account for this check-in app).
//   2. Replace the default Code.gs content with this file.
//   3. Deploy > New deployment > type "Web app".
//        Execute as: Me
//        Who has access: Anyone
//   4. Copy the deployment's /exec URL into src/config.js's
//      CHECKIN_ENDPOINT in this folder, rebuild, and redeploy the frontend.
//   5. To ship a later change to this file, paste the update here, then
//      Deploy > Manage deployments > Edit (pencil) > New version > Deploy,
//      so the existing /exec URL keeps serving the updated code.

// https://docs.google.com/spreadsheets/d/1sHlIgHW2MNuZrkQ9PbtTx76SFcB_JAneYamtkcWg2Gg
// A standalone copy of the "Final List" tab, owned by this check-in app's
// Google account -- separate from the original sheet used by the main
// omic.spot site's registration flow.
var CHECKIN_SHEET_ID = '1sHlIgHW2MNuZrkQ9PbtTx76SFcB_JAneYamtkcWg2Gg';
var CHECKIN_SHEET_TAB_NAME = 'Final List';

// "Final List" column order (1-indexed, matches the sheet's header row).
// Columns 10 (Invite Confirmation) and 11 (2nd Guest Contact) were added to
// the sheet later. INVITE_CONFIRMATION (column J) holds one of three text
// values -- "Confirmed", "No response", "Cancelled" -- shown in the Guest
// List with matching colors. SECOND_GUEST_CONTACT (column K) holds the
// optional contact info collected for a guest's second ticket.
var CHECKIN_COL = {
  NAME: 1,
  PHONE: 2,
  EMAIL: 3,
  TIMESTAMP: 4,
  GUESTS: 5,
  STATUS: 6,
  BOOKING_CODE: 7,
  USER_TYPE: 8,
  CHECKED_IN: 9,
  INVITE_CONFIRMATION: 10,
  SECOND_GUEST_CONTACT: 11,
};

// The 5 admin accounts allowed into the check-in app, all sharing one
// password for this event. This is checked on EVERY checkin* request below
// (not just at login) -- the Apps Script Web App URL itself has no other
// access control, so a request that skipped the login screen entirely
// still has to pass this same check.
var CHECKIN_ADMIN_USERS = {
  'ayan@dviu.in': 'Omic@2026',
  'cinema@omic.spot': 'Omic@2026',
  'gallery@omic.spot': 'Omic@2026',
  'labellaarthub@gmail.com': 'Omic@2026',
  'gauravjain@drishyamfilms.com': 'Omic@2026',
};

// True for a Status value like "WL 1", "WL1", "wl 23" -- the "Final List"
// sheet's waitlist marker is "WL" followed by a number, optionally with a
// space (confirmed from the live sheet: "WL 1", "WL 17", etc., alongside
// "CNF 1", "CNF 2" for confirmed seats). Waitlisted guests should NOT be
// marked present by a scan -- they're asked to wait in the cafe until all
// confirmed guests are seated, per the door process this app exists for.
function checkinIsWaitlisted_(status) {
  return /^wl\s*\d+/i.test(String(status || '').trim());
}

function checkinAuthOk_(params) {
  var email = String((params && params.email) || '').trim().toLowerCase();
  var password = String((params && params.password) || '');
  return Object.prototype.hasOwnProperty.call(CHECKIN_ADMIN_USERS, email)
    && CHECKIN_ADMIN_USERS[email] === password;
}

// Wraps a JS object as a JSONP response when the caller passed ?callback=,
// otherwise plain JSON. JSONP is what lets the browser read this response
// at all: a plain cross-origin fetch() to an Apps Script Web App gets no
// CORS headers back, so the only readable path is a <script src="...">
// tag whose response body calls back into the page.
function checkinRespond_(payload, params) {
  var json = JSON.stringify(payload);
  if (params && params.callback) {
    return ContentService
      .createTextOutput(params.callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function handleCheckinLogin_(params) {
  return checkinRespond_({ ok: checkinAuthOk_(params) }, params);
}

// Reads one row of the "Final List" sheet (1-indexed `row`, values already
// fetched via getDataRange()) into the guest object shape the frontend uses.
function checkinRowToGuest_(row, values) {
  return {
    row: row,
    name: values[CHECKIN_COL.NAME - 1] || '',
    phone: values[CHECKIN_COL.PHONE - 1] || '',
    email: values[CHECKIN_COL.EMAIL - 1] || '',
    guests: values[CHECKIN_COL.GUESTS - 1] || '',
    status: values[CHECKIN_COL.STATUS - 1] || '',
    bookingCode: values[CHECKIN_COL.BOOKING_CODE - 1] || '',
    userType: values[CHECKIN_COL.USER_TYPE - 1] || '',
    checkedIn: values[CHECKIN_COL.CHECKED_IN - 1] === true,
    inviteConfirmation: values[CHECKIN_COL.INVITE_CONFIRMATION - 1] || '',
    secondGuestContact: values[CHECKIN_COL.SECOND_GUEST_CONTACT - 1] || '',
  };
}

// A 2-guest booking occupies two rows that share the same registrant and
// the same submission instant (name, phone, email, timestamp all equal),
// but each row got its own Booking Code/QR when the confirmation email
// went out. For tonight, scanning EITHER of those two QR codes should
// check both guests in -- so once the scanned row is matched, this finds
// any other row from the same booking. Manually-added "Guest" rows have no
// phone/email/timestamp at all, so they never accidentally match each
// other here.
function checkinFindSiblingRows_(data, matchedIndex) {
  var m = data[matchedIndex];
  var name = String(m[CHECKIN_COL.NAME - 1] || '').trim();
  var phone = String(m[CHECKIN_COL.PHONE - 1] || '').trim();
  var email = String(m[CHECKIN_COL.EMAIL - 1] || '').trim().toLowerCase();
  var timestamp = String(m[CHECKIN_COL.TIMESTAMP - 1] || '').trim();
  if (!phone && !email && !timestamp) return [];

  var siblings = [];
  for (var i = 1; i < data.length; i++) {
    if (i === matchedIndex) continue;
    var row = data[i];
    if (
      String(row[CHECKIN_COL.NAME - 1] || '').trim() === name &&
      String(row[CHECKIN_COL.PHONE - 1] || '').trim() === phone &&
      String(row[CHECKIN_COL.EMAIL - 1] || '').trim().toLowerCase() === email &&
      String(row[CHECKIN_COL.TIMESTAMP - 1] || '').trim() === timestamp
    ) {
      siblings.push(i);
    }
  }
  return siblings;
}

// Marks every not-yet-checked-in, non-waitlisted sibling of `matchedIndex`
// as checked in too, and returns the guest objects for whichever ones this
// call actually marked (so the frontend can tell the door staff "2 guests
// marked as present" instead of just one). Keeps `data` in sync so a
// second lookup in the same request sees the fresh CHECKED_IN value.
function checkinMarkSiblingRows_(sheet, data, matchedIndex) {
  var siblingIndexes = checkinFindSiblingRows_(data, matchedIndex);
  var marked = [];
  for (var s = 0; s < siblingIndexes.length; s++) {
    var idx = siblingIndexes[s];
    var siblingGuest = checkinRowToGuest_(idx + 1, data[idx]);
    if (siblingGuest.checkedIn) continue;
    if (checkinIsWaitlisted_(siblingGuest.status)) continue;
    sheet.getRange(idx + 1, CHECKIN_COL.CHECKED_IN).setValue(true);
    data[idx][CHECKIN_COL.CHECKED_IN - 1] = true;
    siblingGuest.checkedIn = true;
    marked.push(siblingGuest);
  }
  return marked;
}

// Scanner tab: looks up a scanned booking code. LockService keeps two
// doors scanning the same code at the same instant from both marking it
// "newly" present -- the second one to get the lock sees checkedIn already
// true and reports alreadyMarked instead.
function handleCheckinLookup_(params) {
  if (!checkinAuthOk_(params)) {
    return checkinRespond_({ ok: false, error: 'unauthorized' }, params);
  }

  var code = String((params && params.code) || '').trim().toUpperCase();
  if (!code) {
    return checkinRespond_({ ok: true, found: false }, params);
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    // Another scan was mid-write and we couldn't get the lock in time --
    // report this as a normal (catchable) error instead of letting Apps
    // Script throw all the way up to an HTML error page, which would
    // silently break the <script> JSONP callback and leave the scanner
    // stuck on "Checking..." until the client-side 20s timeout.
    return checkinRespond_({ ok: false, error: 'busy_try_again' }, params);
  }

  try {
    var sheet = SpreadsheetApp.openById(CHECKIN_SHEET_ID).getSheetByName(CHECKIN_SHEET_TAB_NAME);
    if (!sheet) {
      return checkinRespond_({ ok: false, error: 'sheet_unavailable' }, params);
    }

    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var rowBookingCode = String(data[i][CHECKIN_COL.BOOKING_CODE - 1] || '').trim().toUpperCase();
      if (!rowBookingCode || rowBookingCode !== code) continue;

      var rowNumber = i + 1;
      var guest = checkinRowToGuest_(rowNumber, data[i]);

      // Ground truth first: if the sheet already says this guest is
      // checked in (whether from an earlier scan or a manual Guest List
      // mark), report that -- regardless of waitlist status, since
      // someone already made the call to let them in. Still catch up a
      // companion from the same 2-guest booking if THEY haven't been
      // marked yet (e.g. only one of the pair's codes was scanned, or one
      // was marked from the Guest List tab).
      if (guest.checkedIn) {
        var caughtUp = checkinMarkSiblingRows_(sheet, data, i);
        return checkinRespond_({ ok: true, found: true, alreadyMarked: true, guest: guest, linkedGuests: caughtUp }, params);
      }

      // Waitlisted and not yet checked in: don't mark present. Door staff
      // asks them to wait in the cafe instead.
      if (checkinIsWaitlisted_(guest.status)) {
        return checkinRespond_({ ok: true, found: true, waitlisted: true, guest: guest }, params);
      }

      sheet.getRange(rowNumber, CHECKIN_COL.CHECKED_IN).setValue(true);
      data[i][CHECKIN_COL.CHECKED_IN - 1] = true;
      guest.checkedIn = true;

      // A 2-guest booking's pair shares one scan: whichever of their two
      // QR codes shows up at the door checks both of them in.
      var linkedGuests = checkinMarkSiblingRows_(sheet, data, i);
      return checkinRespond_({ ok: true, found: true, alreadyMarked: false, guest: guest, linkedGuests: linkedGuests }, params);
    }

    return checkinRespond_({ ok: true, found: false }, params);
  } catch (err) {
    // Same reasoning as the lock-timeout branch above: never let an
    // unexpected error (a transient Sheets API hiccup, etc.) propagate
    // into an Apps Script HTML error page -- always hand back valid
    // JS/JSON so the frontend can show a real error message instead of
    // hanging silently.
    return checkinRespond_({ ok: false, error: 'unexpected_error' }, params);
  } finally {
    lock.releaseLock();
  }
}

// Guest List tab: the full roster, for client-side search/select. ~100 rows
// at most for this event, so one round trip is simplest and fast enough.
function handleCheckinList_(params) {
  if (!checkinAuthOk_(params)) {
    return checkinRespond_({ ok: false, error: 'unauthorized' }, params);
  }

  var sheet = SpreadsheetApp.openById(CHECKIN_SHEET_ID).getSheetByName(CHECKIN_SHEET_TAB_NAME);
  if (!sheet) {
    return checkinRespond_({ ok: false, error: 'sheet_unavailable' }, params);
  }

  var data = sheet.getDataRange().getValues();
  var guests = [];
  for (var i = 1; i < data.length; i++) {
    var rowNumber = i + 1;
    var row = data[i];
    // Skip fully blank rows (e.g. a trailing empty row at the end of the sheet).
    if (!row[CHECKIN_COL.NAME - 1] && !row[CHECKIN_COL.STATUS - 1]) continue;
    guests.push(checkinRowToGuest_(rowNumber, row));
  }

  return checkinRespond_({ ok: true, guests: guests }, params);
}

// Guest List tab: bulk "Mark as present" over a multi-select. Identified by
// sheet row number (not Booking Code) because manually-added guest rows can
// have a blank Booking Code, so row number is the only key guaranteed
// unique across every row. `rows` is a comma-separated list, e.g. "5,6,9".
function handleCheckinBulkMark_(params) {
  if (!checkinAuthOk_(params)) {
    return checkinRespond_({ ok: false, error: 'unauthorized' }, params);
  }

  var rowsParam = String((params && params.rows) || '').trim();
  var rowNumbers = rowsParam
    ? rowsParam.split(',').map(function (v) { return parseInt(v, 10); }).filter(function (n) { return !isNaN(n) && n > 1; })
    : [];

  if (!rowNumbers.length) {
    return checkinRespond_({ ok: true, marked: 0 }, params);
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return checkinRespond_({ ok: false, error: 'busy_try_again' }, params);
  }

  try {
    var sheet = SpreadsheetApp.openById(CHECKIN_SHEET_ID).getSheetByName(CHECKIN_SHEET_TAB_NAME);
    if (!sheet) {
      return checkinRespond_({ ok: false, error: 'sheet_unavailable' }, params);
    }

    var marked = 0;
    for (var i = 0; i < rowNumbers.length; i++) {
      var rowNumber = rowNumbers[i];
      if (rowNumber < 2 || rowNumber > sheet.getLastRow()) continue;
      sheet.getRange(rowNumber, CHECKIN_COL.CHECKED_IN).setValue(true);
      marked++;
    }

    return checkinRespond_({ ok: true, marked: marked }, params);
  } catch (err) {
    return checkinRespond_({ ok: false, error: 'unexpected_error' }, params);
  } finally {
    lock.releaseLock();
  }
}

// Scanner tab (post-login home): counts of already-checked-in rows, split
// by the "Final List" sheet's User Type column ("Website" for an online
// registration, "Guest" for a manually-added plus-one/walk-in). Any row
// whose User Type is blank or doesn't say "Guest" is counted as a website
// registration, so the two numbers always add up to the same total the
// Guest List tab would show as "Checked in" -- a typo'd User Type value
// just lands on the website side instead of silently vanishing from both
// counts.
function handleCheckinStats_(params) {
  if (!checkinAuthOk_(params)) {
    return checkinRespond_({ ok: false, error: 'unauthorized' }, params);
  }

  var sheet = SpreadsheetApp.openById(CHECKIN_SHEET_ID).getSheetByName(CHECKIN_SHEET_TAB_NAME);
  if (!sheet) {
    return checkinRespond_({ ok: false, error: 'sheet_unavailable' }, params);
  }

  var data = sheet.getDataRange().getValues();
  var websiteCheckedIn = 0;
  var guestCheckedIn = 0;

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip fully blank rows, same rule as handleCheckinList_.
    if (!row[CHECKIN_COL.NAME - 1] && !row[CHECKIN_COL.STATUS - 1]) continue;
    if (row[CHECKIN_COL.CHECKED_IN - 1] !== true) continue;

    var userType = String(row[CHECKIN_COL.USER_TYPE - 1] || '').trim().toLowerCase();
    if (userType === 'guest') {
      guestCheckedIn++;
    } else {
      websiteCheckedIn++;
    }
  }

  return checkinRespond_({
    ok: true,
    websiteCheckedIn: websiteCheckedIn,
    guestCheckedIn: guestCheckedIn,
    totalCheckedIn: websiteCheckedIn + guestCheckedIn,
  }, params);
}

// One-off admin action: clears the Checked In column for every row, so the
// door can start a fresh check-in run (used ahead of tonight's Andha Yug
// show, after testing with the Newton data). Not exposed in the UI --
// triggered by opening a URL with this formType plus valid admin
// credentials, same auth check as every other action here.
function handleCheckinResetAll_(params) {
  if (!checkinAuthOk_(params)) {
    return checkinRespond_({ ok: false, error: 'unauthorized' }, params);
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return checkinRespond_({ ok: false, error: 'busy_try_again' }, params);
  }

  try {
    var sheet = SpreadsheetApp.openById(CHECKIN_SHEET_ID).getSheetByName(CHECKIN_SHEET_TAB_NAME);
    if (!sheet) {
      return checkinRespond_({ ok: false, error: 'sheet_unavailable' }, params);
    }

    var lastRow = sheet.getLastRow();
    var reset = 0;
    if (lastRow >= 2) {
      var checkedInRange = sheet.getRange(2, CHECKIN_COL.CHECKED_IN, lastRow - 1, 1);
      var values = checkedInRange.getValues();
      for (var i = 0; i < values.length; i++) {
        if (values[i][0] === true) reset++;
        values[i][0] = false;
      }
      checkedInRange.setValues(values);
    }

    return checkinRespond_({ ok: true, reset: reset }, params);
  } catch (err) {
    return checkinRespond_({ ok: false, error: 'unexpected_error' }, params);
  } finally {
    lock.releaseLock();
  }
}

// Lets you sanity-check the deployment by opening the Web App URL directly
// in a browser (a plain GET with no formType).
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.formType === 'checkinLogin') {
    return handleCheckinLogin_(params);
  }

  if (params.formType === 'checkinLookup') {
    return handleCheckinLookup_(params);
  }

  if (params.formType === 'checkinList') {
    return handleCheckinList_(params);
  }

  if (params.formType === 'checkinBulkMark') {
    return handleCheckinBulkMark_(params);
  }

  if (params.formType === 'checkinStats') {
    return handleCheckinStats_(params);
  }

  if (params.formType === 'checkinResetAll') {
    return handleCheckinResetAll_(params);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'OMIC check-in endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
