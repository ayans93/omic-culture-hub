/**
 * Apps Script Web App that receives event registrations (and Art Contest
 * artwork submissions) from the landing page and emails a notification for
 * each one.
 *
 * Setup instructions: see EMAIL_NOTIFICATIONS_SETUP.md in the project root.
 */

// Team notification address for every event EXCEPT Newton (the general
// registration form, and Art Contest submissions). Newton has its own
// address below -- see NEWTON_NOTIFY_EMAIL.
var NOTIFY_EMAIL = 'gallery@omic.spot';

// Team notification address specifically for Newton registrations (used in
// handleNewtonRegistration below). Every other event on the site keeps
// using NOTIFY_EMAIL above.
var NEWTON_NOTIFY_EMAIL = 'cinema@omic.spot';

// Address the one-off test_* helpers at the bottom of this file send their
// simulated registrant/submitter email to, so test runs don't land in a
// real visitor's inbox or in one of the team addresses above. Also where
// every form's team notification gets redirected when the submission came
// from the staging site -- see isStagingRequest_ below.
var TEST_RECIPIENT_EMAIL = 'ayan@dviu.in';

// The staging deployment (omic-hub.vercel.app, or any other Vercel preview
// URL) and the real production site (omic.spot) both point at this exact
// same Web App -- there's only one Apps Script project, one spreadsheet,
// and one set of team addresses behind both. Without this check, testing a
// registration on staging would notify the real team inboxes exactly like
// a real submission on omic.spot would. src/main.js sends which site a
// submission came from as `origin` ('staging' or 'production') on every
// form; this is what each handler below checks before deciding whether its
// team notification goes to the real team address or to
// TEST_RECIPIENT_EMAIL instead. It only affects the TEAM notification --
// the registrant's own confirmation email always goes to the address they
// typed into the form, regardless of which site they used.
function isStagingRequest_(params) {
  return !!(params && params.origin === 'staging');
}

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

// Newton has 50 confirmed seats, then a 30-person waitlist (80 total)
// before registrations close.
var NEWTON_CONFIRMED_SEATS = 50;
var NEWTON_WAITLIST_SEATS = 30;

// Shown on the Newton event page under "Things to Note", and copied into
// every registrant's confirmation email (see buildNewtonConfirmationHtml_
// and sendNewtonConfirmation_ below) so the two stay in sync.
var NEWTON_THINGS_TO_NOTE = [
  'Please arrive 30 minutes before the show starts to allow time for seating and parking.',
  "While you're here, grab some drinks and popcorn at our café.",
  'Paid parking is available at the venue.',
  'Please keep your ticket ready before you enter the theatre.',
  'The theatre can get cool, so bring a light layer.',
];

// A single booking can reserve at most this many seats. The form only ever
// sends 1 or 2 (see the "Number of Guests" radio bubbles in newton.html /
// src/main.js), but this is clamped server-side too so a malformed or
// tampered request can't request more.
var NEWTON_MAX_GUESTS_PER_BOOKING = 2;

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
  var staging = isStagingRequest_(params);

  // 1. Notify the team, same as before -- unless this came from the
  // staging site, in which case redirect it to TEST_RECIPIENT_EMAIL (see
  // isStagingRequest_) so testing on staging doesn't land in the real
  // team inbox.
  var teamEmail = staging ? TEST_RECIPIENT_EMAIL : NOTIFY_EMAIL;
  var subject = (staging ? '[STAGING] ' : '') + 'New registration: ' + eventName;
  var body = [
    'A new registration was just submitted on the event landing page.',
    '',
    'Event: ' + eventName,
    'Name: ' + name,
    'Phone: ' + phone,
    'Email: ' + email,
    'Submitted: ' + timestamp,
  ].join('\n');

  MailApp.sendEmail(teamEmail, subject, body);

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

  var staging = isStagingRequest_(params);
  var teamEmail = staging ? TEST_RECIPIENT_EMAIL : NOTIFY_EMAIL;
  var subject = (staging ? '[STAGING] ' : '') + 'New Art Contest submission: ' + artworkTitle;
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

  MailApp.sendEmail(teamEmail, subject, body);

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

// Newton's registration form: name, phone, email, and a guest count of 1 or
// 2. Seats are limited (50 confirmed, then a 30-person waitlist), so this
// atomically hands out the next 1 or 2 confirmation/waitlist numbers (the
// whole party at once -- see allocateNewtonSeats_), generates one booking
// code + QR code per seat, emails the registrant a single confirmation with
// every seat's code/QR (or a "we're full" note if the whole party doesn't
// fit), and logs one row per seat to the tracking spreadsheet.
function handleNewtonRegistration(params) {
  var timestamp = params.timestamp || new Date().toISOString();
  var name = params.name || '';
  var phone = params.phone || '';
  var email = params.email || '';

  var guestCount = parseInt(params.guestCount, 10);
  if (!guestCount || guestCount < 1) guestCount = 1;
  if (guestCount > NEWTON_MAX_GUESTS_PER_BOOKING) guestCount = NEWTON_MAX_GUESTS_PER_BOOKING;

  // Optional "I'd like to hear about upcoming screenings and events"
  // checkbox -- unlike the mandatory consent checkbox, this doesn't gate
  // submission at all, it's just recorded for the team's awareness (not
  // written to the tracking sheet, which the user doesn't want a new column
  // added to).
  var marketingOptIn = params.marketingOptIn === 'yes';

  // LockService serializes concurrent submissions so two parties landing at
  // the same instant can't both be handed the same confirmation number --
  // each caller waits its turn before reading/incrementing the seat count.
  var lock = LockService.getScriptLock();
  var allocations = [];
  try {
    lock.waitLock(30000);
    allocations = allocateNewtonSeats_(guestCount);
    try {
      if (allocations.length) {
        allocations.forEach(function (allocation) {
          appendNewtonRegistrationToSheet_({
            name: name,
            phone: phone,
            email: email,
            timestamp: timestamp,
            guests: guestCount,
            status: allocation.status,
            bookingCode: allocation.bookingCode,
          });
        });
      } else {
        appendNewtonRegistrationToSheet_({
          name: name,
          phone: phone,
          email: email,
          timestamp: timestamp,
          guests: guestCount,
          status: 'Closed - Not Accepted',
          bookingCode: '',
        });
      }
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

  // 1. Notify the team, same pattern as the other form handlers -- unless
  // this came from the staging site, in which case redirect it to
  // TEST_RECIPIENT_EMAIL (see isStagingRequest_) instead of the real
  // Newton team address.
  var staging = isStagingRequest_(params);
  var teamEmail = staging ? TEST_RECIPIENT_EMAIL : NEWTON_NOTIFY_EMAIL;
  var statusSummary = allocations.length
    ? allocations.map(function (a) { return a.status; }).join(', ')
    : 'CLOSED (already full)';
  var subject = (staging ? '[STAGING] ' : '') + 'New Newton registration (' + guestCount + (guestCount === 1 ? ' guest' : ' guests') + '): ' + statusSummary;
  var body = [
    'A new registration was just submitted on the Newton page.',
    '',
    'Name: ' + name,
    'Phone: ' + phone,
    'Email: ' + email,
    'Guests: ' + guestCount,
    'Wants updates on future screenings: ' + (marketingOptIn ? 'Yes' : 'No'),
    'Status: ' + (allocations.length
      ? statusSummary
      : 'Registrations were already full when this arrived -- logged for reference only, no confirmation email sent.'),
    'Booking code(s): ' + (allocations.length ? allocations.map(function (a) { return a.bookingCode; }).join(', ') : '(none)'),
    'Submitted: ' + timestamp,
  ].join('\n');

  MailApp.sendEmail(teamEmail, subject, body);

  // 2. Confirm (or apologize) to the person who just registered. Best-effort,
  // same reasoning as sendRegistrantConfirmation_ above.
  if (email) {
    try {
      if (allocations.length) {
        sendNewtonConfirmation_({
          email: email,
          name: name,
          allocations: allocations,
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
// `guestCount` seats as one all-or-nothing block: "CNF 1".."CNF 50", then
// "WL 1".."WL 30", then closed once both are full. A party is never split
// across "fits" and "doesn't fit" -- if there isn't room for every seat the
// party asked for, none are allocated (empty array back) and the whole
// booking is treated as closed, same as handleNewtonRegistration's single-
// seat behaviour before this. Counting existing rows (rather than keeping a
// separate counter cell) means the sheet itself is always the source of
// truth -- and since rows keep accumulating even after capacity is reached
// (see handleNewtonRegistration, which still logs a "Closed - Not Accepted"
// row), the count only ever grows, so once this starts returning closed it
// stays closed. Must be called while holding the script lock.
function allocateNewtonSeats_(guestCount) {
  var sheet = SpreadsheetApp.openById(NEWTON_SHEET_ID).getSheetByName(NEWTON_SHEET_TAB_NAME);
  var currentCount = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  var totalCapacity = NEWTON_CONFIRMED_SEATS + NEWTON_WAITLIST_SEATS;

  if (currentCount + guestCount > totalCapacity) {
    return [];
  }

  var allocations = [];
  for (var i = 0; i < guestCount; i++) {
    var seatNumber = currentCount + 1 + i;
    var status = seatNumber <= NEWTON_CONFIRMED_SEATS
      ? 'CNF ' + seatNumber
      : 'WL ' + (seatNumber - NEWTON_CONFIRMED_SEATS);
    allocations.push({ status: status, bookingCode: generateNewtonBookingCode_(), seatNumber: seatNumber });
  }
  return allocations;
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

// Fetches a QR code PNG for a booking code from a free, key-less QR API,
// for embedding in the confirmation email. Returns null (rather than
// throwing) on any failure, since a missing QR image shouldn't block the
// email itself from sending -- the booking code in the email text still
// works as a fallback reference. `index` keeps each seat's blob filename
// distinct when a single booking sends more than one.
function fetchNewtonQrBlob_(bookingCode, index) {
  try {
    var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(bookingCode);
    var response = UrlFetchApp.fetch(qrUrl, { muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return null;
    return response.getBlob().setName('newton-booking-qr-' + (index || 0) + '.png');
  } catch (err) {
    Logger.log('fetchNewtonQrBlob_ failed: ' + err);
    return null;
  }
}

// Sends one confirmation email covering every seat in the booking (1 or 2).
// `info.allocations` is the array allocateNewtonSeats_ returned: each entry
// gets its own QR code, inlined as cid "newtonQr0", "newtonQr1", etc.
function sendNewtonConfirmation_(info) {
  var firstName = (info.name || '').trim().split(/\s+/)[0] || 'there';
  var allocations = info.allocations;
  var seatCount = allocations.length;
  var confirmedCount = allocations.filter(function (a) { return a.status.indexOf('CNF') === 0; }).length;
  var waitlistCount = seatCount - confirmedCount;
  var allWaitlist = confirmedCount === 0;
  var allConfirmed = waitlistCount === 0;

  var inlineImages = {};
  var qrBlobs = allocations.map(function (allocation, index) {
    var blob = fetchNewtonQrBlob_(allocation.bookingCode, index);
    if (blob) inlineImages['newtonQr' + index] = blob;
    return blob;
  });

  var headline = allConfirmed
    ? "You're confirmed"
    : allWaitlist
      ? "You're on the waitlist"
      : "You're partly confirmed";

  var textLines = [
    'Hi ' + firstName + ',',
    '',
    headline + ' for Newton' + (seatCount > 1 ? ' (' + seatCount + ' guests)' : '') + '.',
    '',
  ];
  allocations.forEach(function (allocation, index) {
    textLines.push('Seat ' + (index + 1) + ' -- Status: ' + allocation.status + ', Booking code: ' + allocation.bookingCode);
  });
  textLines.push(
    '',
    allConfirmed
      ? 'Please keep these codes (and the attached QR codes) handy -- show them at check-in.'
      : allWaitlist
        ? "We'll reach out if confirmed seats open up before the screening."
        : "The confirmed seat(s) above are set -- we'll reach out if the waitlisted seat(s) open up before the screening.",
    '',
    'Newton screens Saturday, October 10, 2026 at 6:00 PM at OMIC Cultural Hub, followed by a Q&A with director Amit Masurkar, actor Pankaj Tripathi, producer Manish Mundra, and moderator Rashmi Devi Sawhney.',
    '',
    'Things to note:'
  );
  NEWTON_THINGS_TO_NOTE.forEach(function (note) {
    textLines.push('- ' + note);
  });
  textLines.push(
    '',
    '— OMIC Cultural Hub'
  );

  var mailOptions = {
    to: info.email,
    subject: allConfirmed ? "You're confirmed: Newton" : allWaitlist ? "You're on the waitlist: Newton" : "Your Newton booking",
    body: textLines.join('\n'),
    htmlBody: buildNewtonConfirmationHtml_(info, firstName, allocations, qrBlobs),
    name: SENDER_NAME,
  };
  if (Object.keys(inlineImages).length) {
    mailOptions.inlineImages = inlineImages;
  }

  MailApp.sendEmail(mailOptions);
}

function buildNewtonConfirmationHtml_(info, firstName, allocations, qrBlobs) {
  var escape = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  var seatCount = allocations.length;
  var confirmedCount = allocations.filter(function (a) { return a.status.indexOf('CNF') === 0; }).length;
  var allWaitlist = confirmedCount === 0;
  var allConfirmed = confirmedCount === seatCount;

  var introText = allConfirmed
    ? "You're booked in for <strong>Newton</strong>" + (seatCount > 1 ? ' (' + seatCount + ' guests)' : '') + " — a screening followed by a Q&amp;A with director Amit Masurkar, actor Pankaj Tripathi, producer Manish Mundra, and moderator Rashmi Devi Sawhney."
    : allWaitlist
      ? "You've been added to the waitlist for <strong>Newton</strong>" + (seatCount > 1 ? ' (' + seatCount + ' guests)' : '') + ". We'll reach out if confirmed seats open up before the screening."
      : "Part of your booking for <strong>Newton</strong> is confirmed, and part is on the waitlist — see the breakdown below.";

  var checkInNote = allConfirmed
    ? '<p style="margin:0 0 16px;color:#8a8378;font-size:13px;line-height:1.6;">Please keep these codes (and the QR codes below) handy — show them at check-in.</p>'
    : '';

  var seatRows = allocations.map(function (allocation, index) {
    return (
      '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Seat ' + (index + 1) + '</td>' +
        '<td style="padding:4px 0;color:#17140f;font-size:14px;font-weight:700;">' + escape(allocation.status) +
        ' <span style="color:#8a8378;font-weight:400;letter-spacing:0.04em;">(' + escape(allocation.bookingCode) + ')</span></td></tr>'
    );
  }).join('');

  var qrBlock = qrBlobs.map(function (blob, index) {
    if (!blob) return '';
    return '<img src="cid:newtonQr' + index + '" width="160" height="160" alt="Booking QR code ' + (index + 1) + '" style="display:inline-block;margin:8px;border-radius:8px;" />';
  }).join('');

  var thingsToNoteItems = NEWTON_THINGS_TO_NOTE.map(function (note) {
    return '<li style="margin:0 0 8px;">' + escape(note) + '</li>';
  }).join('');

  var thingsToNoteBlock =
    '<h2 style="margin:24px 0 10px;font-size:15px;color:#17140f;">Things to Note</h2>' +
    '<ul style="margin:0;padding-left:18px;color:#37332b;font-size:13px;line-height:1.6;">' + thingsToNoteItems + '</ul>';

  return (
    '<div style="background:#f4ede1;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e6dcc9;border-radius:16px;padding:32px;">' +
        '<p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#4a6fe8;">OMIC Cultural Hub</p>' +
        '<h1 style="margin:0 0 20px;font-size:22px;line-height:1.3;color:#17140f;">' +
          (allConfirmed ? "You're confirmed, " : allWaitlist ? "You're on the waitlist, " : 'Hi ') + escape(firstName) + '!' +
        '</h1>' +
        '<p style="margin:0 0 16px;color:#17140f;font-size:15px;line-height:1.6;">' + introText + '</p>' +
        '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse;">' +
          seatRows +
          '<tr><td style="padding:8px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Date</td>' +
            '<td style="padding:8px 0 4px;color:#17140f;font-size:14px;">Saturday, October 10, 2026</td></tr>' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Time</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;">6:00 PM</td></tr>' +
          '<tr><td style="padding:4px 12px 4px 0;color:#8a8378;font-size:13px;white-space:nowrap;">Venue</td>' +
            '<td style="padding:4px 0;color:#17140f;font-size:14px;">OMIC Theatre, OMIC Cultural Hub</td></tr>' +
        '</table>' +
        checkInNote +
        '<div style="text-align:center;">' + qrBlock + '</div>' +
        thingsToNoteBlock +
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

// Appends one row to the Newton tracking spreadsheet, matching the sheet's
// live column order: Name, Phone number, Email, Registration timestamp,
// Guests, Status, Booking Code. A 2-guest booking calls this once per seat
// (see handleNewtonRegistration), so two rows share the same Name/Phone/
// Email/Timestamp/Guests but each carry their own seat's Status and Booking
// Code.
function appendNewtonRegistrationToSheet_(info) {
  var sheet = SpreadsheetApp.openById(NEWTON_SHEET_ID).getSheetByName(NEWTON_SHEET_TAB_NAME);
  if (!sheet) return;

  sheet.appendRow([
    info.name,
    info.phone,
    info.email,
    info.timestamp,
    info.guests || 1,
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
    // Total seats left of any kind (confirmed or waitlist) before
    // registrations close entirely. src/main.js disables the "2 guests"
    // option on the form when this drops to 1, since a 2-seat booking
    // can't fit in a single remaining seat.
    remaining: Math.max(0, totalCapacity - count),
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
// one real test email to NEWTON_NOTIFY_EMAIL (the Newton team address) and
// one to TEST_RECIPIENT_EMAIL (standing in for the registrant), and appends
// one real test row to the Newton sheet, all clearly labelled "Authorization
// test" -- check they landed correctly (including the QR image), then
// delete that test row and both test emails.
function test_handleNewtonRegistration() {
  handleNewtonRegistration({
    timestamp: new Date().toISOString(),
    name: 'Authorization test -- delete me',
    phone: '+971500000000',
    email: TEST_RECIPIENT_EMAIL,
    guestCount: '1',
  });
}

// Same as test_handleNewtonRegistration above, but exercises the 2-guest
// booking path: this should append TWO rows to the sheet (same name/phone/
// email/timestamp/guests, each with its own Status -- e.g. "CNF 4, CNF 5" --
// and its own Booking Code), and send a single confirmation email containing
// two distinct QR codes. Delete both test rows and the test email afterward.
function test_handleNewtonRegistrationTwoGuests() {
  handleNewtonRegistration({
    timestamp: new Date().toISOString(),
    name: 'Authorization test (2 guests) -- delete me',
    phone: '+971500000000',
    email: TEST_RECIPIENT_EMAIL,
    guestCount: '2',
  });
}

// One-time helper for authorizing this script and confirming the Art Prize
// spreadsheet logging works end to end. Run THIS function (not
// handleArtworkSubmission directly -- the editor's Run button calls a
// function with no arguments, so handleArtworkSubmission(params) crashes
// immediately trying to read params.timestamp off undefined; this wrapper
// supplies fake params instead). Running it will prompt you to authorize
// Gmail/Sheets access if you haven't already, then it sends one real test
// email to NOTIFY_EMAIL (the Art Contest's team address) and one to
// TEST_RECIPIENT_EMAIL (standing in for the submitter), and appends one real
// test row to the spreadsheet -- both clearly labelled "Authorization test",
// safe to delete afterward. It deliberately leaves the artwork file fields
// empty, so it does not touch Drive or create anything in the submissions
// folder.
function test_handleArtworkSubmission() {
  handleArtworkSubmission({
    timestamp: new Date().toISOString(),
    event: 'The OMIC Art Contest',
    name: 'Authorization test -- delete me',
    phone: '+971500000000',
    email: TEST_RECIPIENT_EMAIL,
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
