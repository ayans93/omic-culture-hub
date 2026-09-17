/**
 * Apps Script Web App that receives event registrations from the landing
 * page and emails a notification for each one.
 *
 * Setup instructions: see EMAIL_NOTIFICATIONS_SETUP.md in the project root.
 */

var NOTIFY_EMAIL = 'ayan@dviu.in';

function doPost(e) {
  var params = (e && e.parameter) || {};

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

// Lets you sanity-check the deployment by opening the Web App URL directly
// in a browser (a GET request).
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Registration notification endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
