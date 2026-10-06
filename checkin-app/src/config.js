// This app has its own, separate Google Apps Script deployment -- it does
// NOT share the one used by the main omic.spot site. Create a new Apps
// Script project (e.g. from Extensions > Apps Script inside the "Final
// List" Google Sheet, so it already has access to that sheet), paste in
// google-apps-script/Code.gs from this same folder, deploy it as a Web App
// ("Execute as: Me", "Who has access: Anyone"), and paste the resulting
// /exec URL below.
export const CHECKIN_ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_DEPLOYMENT_URL_HERE";
