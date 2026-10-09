// This app has its own, separate Google Apps Script deployment -- it does
// NOT share the one used by the main omic.spot site or the door check-in
// app. See google-apps-script/Code.gs in this same folder for the backend
// source; to ship an update to it, paste the change into that Apps Script
// project and use Deploy > Manage deployments > Edit > New version so this
// same /exec URL keeps serving the updated code.
export const JURY_ENDPOINT = "https://script.google.com/macros/s/AKfycbzfkIpQ1DZgAER5K7zDgDXoD2trkgmocWn5Pw2KniRgdindcyt_jQCAB1EQwFgsgfU1yw/exec";
