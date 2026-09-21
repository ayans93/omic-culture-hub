/**
 * Apps Script Web App that receives event registrations (and Art Contest
 * artwork submissions) from the landing page and emails a notification for
 * each one.
 *
 * Setup instructions: see EMAIL_NOTIFICATIONS_SETUP.md in the project root.
 */

var NOTIFY_EMAIL = 'ayan@dviu.in';

// Display name the registrant-facing confirmation emails are sent under.
// The email still goes out through whichever Google account authorized
// this script (see EMAIL_NOTIFICATIONS_SETUP.md) — this only changes the
// "From" name shown to the recipient, not the underlying sending address.
var SENDER_NAME = 'OMIC Cultural Hub';

// Name of the Google Drive folder artwork submission files are saved into.
// The folder is created automatically on first submission if it doesn't
// already exist.
var ARTWORK_DRIVE_FOLDER_NAME = 'OMIC Art Contest Submissions';

function doPost(e) {
  var params = (e && e.parameter) || {};
  var formType = params.formType || 'registration';

  if (formType === 'artwork') {
    return handleArtworkSubmission(params);
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
  var medium = params.medium || '';
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
    'Medium / Materials: ' + medium,
    'Dimensions: ' + dimensions,
    'Year of Completion: ' + yearCompleted,
    'Artist Statement: ' + artistStatement,
    'Short Artist Biography: ' + artistBio,
    'Artwork File: ' + (fileUrl || '(no file received)'),
    'Submitted: ' + timestamp,
  ].join('\n');

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateArtworkFolder() {
  var folders = DriveApp.getFoldersByName(ARTWORK_DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(ARTWORK_DRIVE_FOLDER_NAME);
}

// Lets you sanity-check the deployment by opening the Web App URL directly
// in a browser (a GET request).
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Registration notification endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
