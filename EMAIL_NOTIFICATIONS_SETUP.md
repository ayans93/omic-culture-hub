# Emailing ayan@dviu.in on every registration

A static site can't send email by itself — there's no mail server behind
it. The standard, no-backend way to bridge the two is a small Google Apps
Script "Web App" that the landing page calls on every successful
registration; the script sends the email for you. This takes about five
minutes to set up once, using any Google account.

## 1. Create the Apps Script project

1. Go to https://script.google.com/home
2. Click **New project**.
3. Give it a name, e.g. "Nothing Unusual — Registration Notifier" (top left,
   where it says "Untitled project").

## 2. Add the script

1. Delete any placeholder code in the editor (`Code.gs`).
2. Copy everything from `google-apps-script/Code.gs` in this project and
   paste it in.
3. Click the save icon (or Ctrl/Cmd+S).

The script emails `ayan@dviu.in` with the registrant's name, phone, email,
and submission time every time a simple registration form is submitted
(Video + Art Talk). For the Art Contest's artwork submission form, it also
saves the uploaded file to a Google Drive folder named "OMIC Art Contest
Submissions" and includes a shareable link to it in the email, along with
all the artwork fields. If you ever want to notify a different address,
change the `NOTIFY_EMAIL` constant at the top of the file.

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**.
5. The first time, Google will ask you to authorize the script — click
   through the consent screen (choose your account → Advanced → Go to
   project (unsafe) → Allow). This is expected for scripts you write
   yourself; it's what lets `MailApp.sendEmail` send mail from your account.
6. Copy the **Web app URL** it gives you — it looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 4. Paste the URL into the project

Open `src/config.js` and replace the placeholder:

```js
export const REGISTRATION_NOTIFY_ENDPOINT = "https://script.google.com/macros/s/AKfycb.../exec";
```

Save the file. Restart `npm run dev` if it's already running.

## 5. Test it

1. Open the site, fill in the registration form with a valid UAE number
   (e.g. `+971 50 123 4567`), and submit.
2. You should see the success screen, and an email should land in
   `ayan@dviu.in`'s inbox within a few seconds (check spam the first time).

## Notes

- The email is sent from whichever Google account you authorized the
  script with (not literally "from" the person who registered) — that's
  just how Apps Script's mail sending works.
- Consumer Gmail accounts can send up to 100 emails/day through
  `MailApp`; Google Workspace accounts get a higher quota. That's far more
  than a single event's registrations should need.
- If you ever change the script's code, you need to create a **new
  deployment** (or use "Manage deployments → Edit → New version") for the
  changes to take effect — saving the file alone isn't enough. This is
  required now: the artwork-submission handling (saving files to Drive) was
  added after the first deployment, so you must push a new version for it
  to work.
- The updated script saves uploaded artwork files to Google Drive, which
  needs an extra permission scope beyond sending mail. The **first**
  artwork submission after you redeploy will likely need you to
  re-authorize the script (you may see a new consent screen, or the
  submission may silently fail server-side until you do). To pre-authorize
  it yourself: open the script in the Apps Script editor, select the
  `handleArtworkSubmission` function from the function dropdown next to
  "Debug", click **Run** once, and step through the consent screen when
  prompted (choose your account → Advanced → Go to project (unsafe) →
  Allow). After that, submissions from the site will work without further
  prompts.
- The request is sent with `mode: 'no-cors'`, which is required for a
  browser to call an Apps Script Web App directly. This means the page
  can't read the response back, so it can't detect a failure on Google's
  side — the site always redirects to the thank-you page once the form
  itself validates, regardless of whether the email/Drive save succeeded.
  If emails aren't arriving, double-check the deployment access is set to
  "Anyone" and that the URL in `src/config.js` ends in `/exec`.
