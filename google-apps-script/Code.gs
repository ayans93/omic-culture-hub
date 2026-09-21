/**
 * Apps Script Web App that receives event registrations (and Art Contest
 * artwork submissions) from the landing page and emails a notification for
 * each one.
 *
 * Setup instructions: see EMAIL_NOTIFICATIONS_SETUP.md in the project root.
 */

var NOTIFY_EMAIL = 'ayan@dviu.in';

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
  var name = params.name || '';
  var phone = params.phone || '';
  var email = params.email || '';

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

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
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
