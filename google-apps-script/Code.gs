/**
 * Apps Script Web App that receives event registrations (and Art Contest
 * artwork submissions) from the landing page and emails a notification for
 * each one.
 *
 * Setup instructions: see EMAIL_NOTIFICATIONS_SETUP.md in the project root.
 */

var NOTIFY_EMAIL = 'gallery@omic.spot';

// Display name the registrant-facing confirmation emails are sent under.
// The email still goes out through whichever Google account authorized
// this script (see EMAIL_NOTIFICATIONS_SETUP.md) — this only changes the
// "From" name shown to the recipient, not the underlying sending address.
var SENDER_NAME = 'OMIC Cultural Hub';

// Name of the Google Drive folder artwork submission files are saved into.
// The folder is created automatically on first submission if it doesn't
// already exist.
var ARTWORK_DRIVE_FOLDER_NAME = 'OMIC Art Contest Submissions';

// The "Copy of Art Prize Entries" tracking spreadsheet that Art Contest
// submissions get logged to automatically (see appendArtworkSubmissionToSheet_
// below). The account this script runs as must have edit access to it.
// https://docs.google.com/spreadsheets/d/1gC0ZrcfEyCKFFlMKQHbNzErxD9QVE8FfBIoQjIB9I7U
var ART_PRIZE_SHEET_ID = '1gC0ZrcfEyCKFFlMKQHbNzErxD9QVE8FfBIoQjIB9I7U';
var ART_PRIZE_SHEET_TAB_NAME = 'Sheet1';

// The "Newton Show Registrations" tracking spreadsheet. Same deal as the Art
// Prize sheet above: the account this script runs as needs edit access to it.
// https://docs.google.com/spreadsheets/d/1F6b2quflVCcglnJbVw4ZynmxL1u8Lt9O-h3y4d97Y1o
var NEWTON_SHEET_ID = '1F6b2quflVCcglnJbVw4ZynmxL1u8Lt9O-h3y4d97Y1o';
var NEWTON_SHEET_TAB_NAME = 'Sheet1';

// Newton has 45 confirmed seats, then a 25-person waitlist (70 total)
// before registrations close.
var NEWTON_CONFIRMED_SEATS = 45;
var NEWTON_WAITLIST_SEATS = 25;

function doPost(e) {
  var params = (e && e.parameter) || {};
  var formType = params.formType || 'registration';

  if (formType === 'artwork') {
    return handleArtworkSubmission(params);
  }

  if (formType === 'newtonRegistration') {
    return handleNewtonRegistration(params);
  }

  return handleRegistration(params);
}

function handleRegistration(params) {
  var timestamp = params.timestamp || new Date().toISOString();
  var eventName = params.event || 'OMIC Cultural Hub';
  var eventDate = params.eventDate || '';
  var eventTime = params.eventTime || '';
  var eventVenue = params.eventVenue || '';
  var eventBlurb = params.eventBlurb || '';
  var name = params.name || '';
  var phone = params.phone || '';
  var email = params.email || '';

  // 1. Notify the team, same as before.
  var subject = 'New registration: ' + eventName;
  var body = [
    'A new registration was just submitted on the event landing page.',
    '',
    'Event: ' + eventName,
    'Name: ' + name,
    'Phone: ' + phone,
    'Email: ' + email,
    'Submitted: ' + timestamp,
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  // 2. Confirm the registration to the person who just signed up. This is
  // best-effort: if it fails for any reason (e.g. a malformed address that
  // slipped past client-side validation), the team notification above has
  // already gone out, so we don't want that failure to surface as an error
  // to the visitor's browser.
  if (email) {
    try {
      sendRegistrantConfirmation_({
        email: email,
        name: name,
        eventName: eventName,
        eventDate: eventDate,
        eventTime: eventTime,
        eventVenue: eventVenue,
        eventBlurb: eventBlurb,
      });
    } catch (err) {
      // Swallow — the admin notification already succeeded above.
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Sends the registrant their own "you're confirmed" email. `eventDate`,
// `eventTime`, and `eventVenue` are optional — a page that doesn't set the
// corresponding data-event-* attribute (see src/main.js) just gets a
// shorter email without that section, instead of blank/undefined values.
function sendRegistrantConfirmation_(info) {
  var firstName = (info.name || '').trim().split(/\s+/)[0] || 'there';

  var hasDetails = info.eventDate || info.eventTime || info.eventVenue;

  var textLines = [
    'Hi ' + firstName + ',',
    '',
    "You're all set — thanks for registering for " + info.eventName + '.',
  ];

  if (hasDetails) {
    textLines.push('', 'EVENT DETAILS');
    if (info.eventDate) textLines.push('Date: ' + info.eventDate);
    if (info.eventTime) textLines.push('Time: ' + info.eventTime);
    if (info.eventVenue) textLines.push('Venue: ' + info.eventVenue);
  }

  if (info.eventBlurb) {
    textLines.push('', info.eventBlurb);
  }

  textLines.push(
    '',
    "We'll be in touch if there's anything else you need before the event. See you there!",
    '',
    '— OMIC Cultural Hub'
  );

  var textBody = textLines.join('\n');
  var htmlBody = buildRegistrantConfirmationHtml_(info, firstName, hasDetails);

  MailApp.sendEmail({
    to: info.email,
    subject: "You're registered: " + info.eventName,
    body: textBody,
    htmlBody: htmlBody,
    name: SENDER_NAME,
  });
}

function buildRegistrantConfirmationHtml_(info, firstName, hasDetails) {
  var escape = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  var detailsRows = '';
  if (info.eventDate) {
    detailsRows += '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Date</td>' +
      '<td style="padding:4px 0;color:#17140f;font-size:14px;">' + escape(info.eventDate) + '</td></tr>';
  }
  if (info.eventTime) {
    detailsRows += '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Time</td>' +
      '<td style="padding:4px 0;color:#17140f;font-size:14px;">' + escape(info.eventTime) + '</td></tr>';
  }
  if (info.eventVenue) {
    detailsRows += '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Venue</td>' +
      '<td style="padding:4px 0;color:#17140f;font-size:14px;">' + escape(info.eventVenue) + '</td></tr>';
  }

  var detailsBlock = hasDetails
    ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">' +
      detailsRows +
      '</table>'
    : '';

  var blurbBlock = info.eventBlurb
    ? '<p style="margin:0 0 20px;color:#4a4438;font-size:14px;line-height:1.6;">' + escape(info.eventBlurb) + '</p>'
    : '';

  return (
    '<div style="background:#f4ede1;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6dcc9;border-radius:16px;padding:32px;">' +
        '<p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#4a6fe8;">OMIC Cultural Hub</p>' +
        '<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#17140f;">You’re confirmed, ' + escape(firstName) + '!</h1>' +
        '<p style="margin:0 0 4px;color:#17140f;font-size:15px;line-height:1.6;">' +
          'Thanks for registering for <strong>' + escape(info.eventName) + '</strong>.' +
        '</p>' +
        detailsBlock +
        blurbBlock +
        '<p style="margin:24px 0 0;color:#8a8378;font-size:13px;line-height:1.6;">' +
          "We'll be in touch if there's anything else you need before the event. See you there!" +
        '</p>' +
      '</div>' +
    '</div>'
  );
}

function handleArtworkSubmission(params) {
  var timestamp = params.timestamp || new Date().toISOString();
  var eventName = params.event || 'The OMIC Art Contest';

  var name = params.name || '';
  var phone = params.phone || '';
  var email = params.email || '';
  var uaeResident = params.uaeResident || '';
  var artworkTitle = params.artworkTitle || '';
  var discipline = params.discipline || '';
  var mediumMaterial = params.mediumMaterial || '';
  var dimensions = params.dimensions || '';
  var yearCompleted = params.yearCompleted || '';
  var artistStatement = params.artistStatement || '';
  var artistBio = params.artistBio || '';

  var fileName = params.fileName || '';
  var fileMimeType = params.fileMimeType || 'application/octet-stream';
  var fileData = params.fileData || '';

  var fileUrl = '';
  if (fileData) {
    try {
      var bytes = Utilities.base64Decode(fileData);
      var blob = Utilities.newBlob(bytes, fileMimeType, fileName || 'artwork-upload');
      var folder = getOrCreateArtworkFolder();
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileUrl = file.getUrl();
    } catch (err) {
      fileUrl = 'Could not save the uploaded file: ' + err;
    }
  }

  var subject = 'New Art Contest submission: ' + artworkTitle;
  var body = [
    'A new artwork was just submitted on the Art Contest page.',
    '',
    'Event: ' + eventName,
    'Full Name: ' + name,
    'Mobile Number: ' + phone,
    'Email Address: ' + email,
    'UAE Resident: ' + uaeResident,
    'Artwork Title: ' + artworkTitle,
    'Discipline: ' + discipline,
    'Medium / Material: ' + mediumMaterial,
    'Dimensions: ' + dimensions,
    'Year of Completion: ' + yearCompleted,
    'Artist Statement: ' + artistStatement,
    'Short Artist Biography: ' + artistBio,
    'Artwork File: ' + (fileUrl || '(no file received)'),
    'Submitted: ' + timestamp,
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  // Log the entry to the tracking spreadsheet, the same way it's been
  // transcribed by hand from these emails so far. Best-effort: if the sheet
  // is unreachable (e.g. a permissions issue) or its layout changed, that
  // shouldn't fail the submission — the team notification above already
  // went out, and this is a convenience on top of it, not the source of
  // truth.
  try {
    appendArtworkSubmissionToSheet_({
      name: name,
      phone: phone,
      email: email,
      uaeResident: uaeResident,
      artworkTitle: artworkTitle,
      discipline: discipline,
      mediumMaterial: mediumMaterial,
      dimensions: dimensions,
      yearCompleted: yearCompleted,
      artistStatement: artistStatement,
      artistBio: artistBio,
      fileUrl: fileUrl,
      timestamp: timestamp,
    });
  } catch (err) {
    // Swallow -- see comment above -- but log it so it's visible in the
    // Apps Script project's Executions log (left sidebar → clock icon) if
    // rows ever stop showing up. A caught error here never surfaces as a
    // red "Error" line in a manual test run, only in that log.
    Logger.log('appendArtworkSubmissionToSheet_ failed: ' + err);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Appends one row to the Art Prize tracking spreadsheet, in the same column
// order the sheet uses: Name, Mobile Number, Email Address, UAE Resident,
// Artwork Title, Discipline, Medium / Material, Dimensions, Year of
// Completion, Artist Statement, Short bio, Art link, Submission Timestamp.
//
// "Short bio" is its own column (added after this integration was first
// written -- earlier entries had it folded into the Artist Statement cell
// by hand instead), so the statement and bio are written separately now,
// matching the current layout.
//
// "Art link" has been sitting empty on every existing row -- nobody's been
// pasting in the uploaded artwork's Drive link by hand. This fills it in
// automatically from the file this script just saved to Drive, if any.
//
// "Submission Timestamp" (column M) was added later too -- rows logged
// before this column existed are simply blank here, same as "Art link" was
// for rows logged before that one existed.
function appendArtworkSubmissionToSheet_(info) {
  var sheet = SpreadsheetApp.openById(ART_PRIZE_SHEET_ID).getSheetByName(ART_PRIZE_SHEET_TAB_NAME);
  if (!sheet) return;

  sheet.appendRow([
    info.name,
    info.phone,
    info.email,
    info.uaeResident,
    info.artworkTitle,
    info.discipline,
    info.mediumMaterial,
    info.dimensions,
    info.yearCompleted,
    info.artistStatement || '',
    info.artistBio || '',
    info.fileUrl || '',
    info.timestamp || '',
  ]);
}

// Newton's registration form: name, phone, email. Seats are limited (45
// confirmed, then a 25-person waitlist), so this atomically hands out the
// next confirmation/waitlist number, generates a booking code + QR code,
// emails the registrant their confirmation (or a "we're full" note once
// capacity's gone), and logs the row to the tracking spreadsheet.
function handleNewtonRegistration(params) {
  var timestamp = params.timestamp || new Date().toISOString();
  var name = params.name || '';
  var phone = params.phone || '';
  var email = params.email || '';

  // LockService serializes concurrent submissions so two people landing at
  // the same instant can't both be handed the same confirmation number —
  // each caller waits its turn before reading/incrementing the seat count.
  var lock = LockService.getScriptLock();
  var allocation = { status: null, bookingCode: '' };
  try {
    lock.waitLock(30000);
    allocation = allocateNewtonSeat_();
    try {
      appendNewtonRegistrationToSheet_({
        name: name,
        phone: phone,
        email: email,
        timestamp: timestamp,
        status: allocation.status || 'Closed - Not Accepted',
        bookingCode: allocation.bookingCode,
      });
    } catch (err) {
      // Best-effort, same as the Art Prize sheet logging -- see comment
      // there. Logged so it's visible in Executions if rows go missing.
      Logger.log('appendNewtonRegistrationToSheet_ failed: ' + err);
    }
  } catch (err) {
    Logger.log('Newton seat allocation failed: ' + err);
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // Ignore -- nothing more we can do if releasing itself fails.
    }
  }

  // 1. Notify the team, same pattern as the other form handlers.
  var subject = 'New Newton registration: ' + (allocation.status || 'CLOSED (already full)');
  var body = [
    'A new registration was just submitted on the Newton page.',
    '',
    'Name: ' + name,
    'Phone: ' + phone,
    'Email: ' + email,
    'Status: ' + (allocation.status || 'Registrations were already full when this arrived -- logged for reference only, no confirmation email sent.'),
    'Booking code: ' + (allocation.bookingCode || '(none)'),
    'Submitted: ' + timestamp,
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  // 2. Confirm (or apologize) to the person who just registered. Best-effort,
  // same reasoning as sendRegistrantConfirmation_ above.
  if (email) {
    try {
      if (allocation.status) {
        sendNewtonConfirmation_({
          email: email,
          name: name,
          status: allocation.status,
          bookingCode: allocation.bookingCode,
        });
      } else {
        sendNewtonClosedNotice_({ email: email, name: name });
      }
    } catch (err) {
      Logger.log('Newton confirmation email failed: ' + err);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Reads the current row count from the Newton sheet and hands out the next
// seat: "CNF 1".."CNF 45", then "WL 1".."WL 25", then closed (status: null)
// once both are full. Counting existing rows (rather than keeping a
// separate counter cell) means the sheet itself is always the source of
// truth -- and since rows keep accumulating even after capacity is reached
// (see handleNewtonRegistration, which still logs a "Closed - Not Accepted"
// row), the count only ever grows, so once this starts returning closed it
// stays closed. Must be called while holding the script lock.
function allocateNewtonSeat_() {
  var sheet = SpreadsheetApp.openById(NEWTON_SHEET_ID).getSheetByName(NEWTON_SHEET_TAB_NAME);
  var currentCount = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  var seatNumber = currentCount + 1;
  var totalCapacity = NEWTON_CONFIRMED_SEATS + NEWTON_WAITLIST_SEATS;

  if (seatNumber > totalCapacity) {
    return { status: null, bookingCode: '', seatNumber: seatNumber };
  }

  var status = seatNumber <= NEWTON_CONFIRMED_SEATS
    ? 'CNF ' + seatNumber
    : 'WL ' + (seatNumber - NEWTON_CONFIRMED_SEATS);

  return { status: status, bookingCode: generateNewtonBookingCode_(), seatNumber: seatNumber };
}

// 8-character alphanumeric booking code formatted like "68NF-O8R3".
function generateNewtonBookingCode_() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  function randomPart(length) {
    var out = '';
    for (var i = 0; i < length; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return out;
  }
  return randomPart(4) + '-' + randomPart(4);
}

// Fetches a QR code PNG for the booking code from a free, key-less QR API,
// for embedding in the confirmation email. Returns null (rather than
// throwing) on any failure, since a missing QR image shouldn't block the
// email itself from sending -- the booking code in the email text still
// works as a fallback reference.
function fetchNewtonQrBlob_(bookingCode) {
  try {
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(bookingCode);
    var response = UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return null;
    return response.getBlob().setName('newton-booking-qr.png');
  } catch (err) {
    Logger.log('fetchNewtonQrBlob_ failed: ' + err);
    return null;
  }
}

function sendNewtonConfirmation_(info) {
  var firstName = (info.name || '').trim().split(/\s+/)[0] || 'there';
  var isWaitlist = info.status.indexOf('WL') === 0;
  var qrBlob = fetchNewtonQrBlob_(info.bookingCode);

  var textLines = [
    'Hi ' + firstName + ',',
    '',
    isWaitlist
      ? "You're on the waitlist (" + info.status + ') for Newton.'
      : "You're confirmed (" + info.status + ') for Newton.',
    '',
    'Booking code: ' + info.bookingCode,
    '',
    isWaitlist
      ? "We'll reach out if a confirmed seat opens up before the screening."
      : 'Please keep this code (and the attached QR code) handy -- show it at check-in.',
    '',
    'Newton screens Saturday, October 10, 2026 at 6:00 PM at OMIC Cultural Hub, followed by a Q&A with director Amit Masurkar, actor Pankaj Tripathi, and producer Manish Mundra.',
    '',
    '— OMIC Cultural Hub',
  ];

  var mailOptions = {
    to: info.email,
    subject: isWaitlist ? "You're on the waitlist: Newton" : "You're confirmed: Newton",
    body: textLines.join('\n'),
    htmlBody: buildNewtonConfirmationHtml_(info, firstName, isWaitlist, !!qrBlob),
    name: SENDER_NAME,
  };
  if (qrBlob) {
    mailOptions.inlineImages = { newtonQr: qrBlob };
  }

  MailApp.sendEmail(mailOptions);
}

function buildNewtonConfirmationHtml_(info, firstName, isWaitlist, hasQr) {
  var escape = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  var qrImg = hasQr
    ? '<img src="cid:newtonQr" width="180" height="180" alt="Booking QR code" style="display:block;margin:16px auto 0;border-radius:8px;" />'
    : '';

  var introText = isWaitlist
    ? "You've been added to the waitlist for <strong>Newton</strong>. We'll reach out if a confirmed seat opens up before the screening."
    : "You're booked in for <strong>Newton</strong> — a screening followed by a Q&amp;A with director Amit Masurkar, actor Pankaj Tripathi, and producer Manish Mundra.";

  var checkInNote = isWaitlist
    ? ''
    : '<p style="margin:0;color:#8a8378;font-size:13px;line-height:1.6;">Please keep this code (and the QR below) handy — show it at check-in.</p>';

  return (
    '<div style="background:#f4ede1;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6dcc9;border-radius:16px;padding:32px;">' +
        '<p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#4a6fe8;">OMIC Cultural Hub</p>' +
        '<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#17140f;">' +
          (isWaitlist ? "You're on the waitlist, " : "You're confirmed, ") + escape(firstName) + '!' +
        '</h1>' +
        '<p style="margin:0 0 16px;color:#17140f;font-size:15px;line-height:1.6;">' + introText + '</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse;">' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Status</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;font-weight:700;">' + escape(info.status) + '</td></tr>' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Booking code</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;font-weight:700;letter-spacing:0.04em;">' + escape(info.bookingCode) + '</td></tr>' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Date</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;">Saturday, October 10, 2026</td></tr>' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Time</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;">6:00 PM</td></tr>' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Venue</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;">OMIC Cultural Hub</td></tr>' +
        '</table>' +
        checkInNote +
        qrImg +
      '</div>' +
    '</div>'
  );
}

function sendNewtonClosedNotice_(info) {
  var firstName = (info.name || '').trim().split(/\s+/)[0] || 'there';
  var textBody = [
    'Hi ' + firstName + ',',
    '',
    "Thanks for your interest in Newton -- unfortunately registrations (including the waitlist) are already full.",
    '',
    "We've noted your interest and will keep you in mind if anything opens up. Keep an eye on our Shows page for future screenings.",
    '',
    '— OMIC Cultural Hub',
  ].join('\n');

  MailApp.sendEmail({
    to: info.email,
    subject: 'Newton registrations are full',
    body: textBody,
    name: SENDER_NAME,
  });
}

// Appends one row to the Newton tracking spreadsheet: Name, Phone number,
// Email, Registration timestamp, Status, Booking Code. The first five match
// the sheet's existing header row; "Booking Code" is a 6th column this
// integration adds -- add that header yourself in column F if it isn't
// there yet (see EMAIL_NOTIFICATIONS_SETUP.md).
function appendNewtonRegistrationToSheet_(info) {
  var sheet = SpreadsheetApp.openById(NEWTON_SHEET_ID).getSheetByName(NEWTON_SHEET_TAB_NAME);
  if (!sheet) return;

  sheet.appendRow([
    info.name,
    info.phone,
    info.email,
    info.timestamp,
    info.status,
    info.bookingCode || '',
  ]);
}

// Answers the Newton page's on-load "how many seats are left" check. Reads
// straight from the sheet (no lock needed -- this is a best-effort display
// hint, not the source of truth; the real limit is enforced atomically in
// allocateNewtonSeat_ when a submission actually comes in). Returns plain
// JSON normally, or a JSONP-style "callback(...)" wrapper when the caller
// passes one -- see checkNewtonCapacity in src/main.js for why: Apps Script
// Web App responses don't carry CORS headers, so a same-origin <script> tag
// is what lets the page read this cross-origin at all.
function handleNewtonCapacityCheck_(params) {
  var sheet = SpreadsheetApp.openById(NEWTON_SHEET_ID).getSheetByName(NEWTON_SHEET_TAB_NAME);
  var count = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  var totalCapacity = NEWTON_CONFIRMED_SEATS + NEWTON_WAITLIST_SEATS;

  var payload = JSON.stringify({
    totalRegistered: count,
    seatsLeft: Math.max(0, NEWTON_CONFIRMED_SEATS - count),
    waitlistLeft: count >= NEWTON_CONFIRMED_SEATS ? Math.max(0, totalCapacity - count) : NEWTON_WAITLIST_SEATS,
    closed: count >= totalCapacity,
  });

  if (params.callback) {
    return ContentService
      .createTextOutput(params.callback + '(' + payload + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}

// One-time helper for authorizing this script's access to the Newton sheet
// (and, the first time, its external-request access for the QR code API --
// see fetchNewtonQrBlob_). Run THIS function (not handleNewtonRegistration
// directly -- same reasoning as test_handleArtworkSubmission below). Sends
// one real test email to NOTIFY_EMAIL and to the fake registrant address
// below, and appends one real test row to the Newton sheet, all clearly
// labelled "Authorization test" -- check they landed correctly (including
// the QR image), then delete that test row and both test emails.
function test_handleNewtonRegistration() {
  handleNewtonRegistration({
    timestamp: new Date().toISOString(),
    name: 'Authorization test -- delete me',
    phone: '+971500000000',
    email: NOTIFY_EMAIL,
  });
}

// One-time helper for authorizing this script and confirming the Art Prize
// spreadsheet logging works end to end. Run THIS function (not
// handleArtworkSubmission directly -- the editor's Run button calls a
// function with no arguments, so handleArtworkSubmission(params) crashes
// immediately trying to read params.timestamp off undefined; this wrapper
// supplies fake params instead). Running it will prompt you to authorize
// Gmail/Sheets access if you haven't already, then it sends one real test
// email to NOTIFY_EMAIL and appends one real test row to the spreadsheet --
// both clearly labelled "Authorization test", safe to delete afterward. It
// deliberately leaves the artwork file fields empty, so it does not touch
// Drive or create anything in the submissions folder.
function test_handleArtworkSubmission() {
  handleArtworkSubmission({
    timestamp: new Date().toISOString(),
    event: 'The OMIC Art Contest',
    name: 'Authorization test -- delete me',
    phone: '+971500000000',
    email: 'test@example.com',
    uaeResident: 'Yes',
    artworkTitle: 'Authorization test',
    discipline: 'Painting',
    mediumMaterial: 'Test',
    dimensions: '10x10cm',
    yearCompleted: '2026',
    artistStatement: 'One-off test run to authorize the script and confirm the spreadsheet logging works end to end.',
    artistBio: 'Safe to delete this row and the matching test email.',
    fileName: '',
    fileMimeType: '',
    fileData: '',
  });
}

function getOrCreateArtworkFolder() {
  var folders = DriveApp.getFoldersByName(ARTWORK_DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(ARTWORK_DRIVE_FOLDER_NAME);
}

// Lets you sanity-check the deployment by opening the Web App URL directly
// in a browser (a GET request) -- and, with ?formType=newtonCapacity, is
// also what the Newton page calls to check remaining seats (see
// handleNewtonCapacityCheck_ above).
function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.formType === 'newtonCapacity') {
    return handleNewtonCapacityCheck_(params);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Registration notification endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
