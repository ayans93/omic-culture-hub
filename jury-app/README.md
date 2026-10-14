# Shared Ground — Jury &amp; Scoring App

A jury/scoring web app for the Shared Ground Art Competition (OMIC Art Prize
2026): blind review, a Love/Skip reaction (with an optional comment to the
admin) per artwork, visibility of other jurors' reactions once you've cast
your own, a personal Loved/Skipped review with finalize, and an
administrator dashboard with ranking, tie detection, per-submission comment
viewing, and CSV export.

This is a SEPARATE Vercel project and a SEPARATE Apps Script project from
both the main omic.spot site and the door check-in app. Nothing here can
affect either of those.

## How the Love/Comment/Skip flow works

1. **Blind review**: on the "Yet to Evaluate" tab, a juror sees one artwork
   at a time with a clear, large image fixed on the left and only four
   details on the right — **Artist Statement** (also where "the story of
   the art" lives, since the sheet has no separate column for that), the
   **Medium / Material**, and the **Discipline**, plus the artwork's own
   title. Nothing that identifies the artist (name, mobile, email, bio) is
   ever sent to a juror — enforced server-side in `juryBlindView_()`.
2. **Zoom**: click the artwork image to open a fullscreen zoom view with
   zoom-in/out/reset controls.
3. **React**: below the image/details, three actions — a **Love** icon, an
   optional **Comment** icon (toggles a note to the admin team), and a
   **Skip to next** icon, each with a caption underneath.
4. **See other jurors' reactions**: as soon as a juror has reacted to a
   piece, the page reveals how other jurors who have already reacted to
   that same piece voted (jurors who haven't yet show as "Not yet
   reviewed"). Enforced server-side — a juror can never see others'
   reactions on a piece before reacting themselves.
5. **Loved / Skipped tabs**: everything a juror has already reacted to
   sorts into a "Loved" or "Skipped" tab (with any comment shown inline);
   a juror can move an item between the two at any time before finalizing.
6. **Finalize**: once every eligible artwork has a reaction, the juror can
   click **Finalize My Votes**, which locks their reactions read-only
   until an administrator unlocks them again (Jurors tab → Unlock).
7. **Ranking**: submissions are ranked by total Love count, highest first.
   A submission only appears in the ranked list once every juror has
   reacted to it.
8. **Top 20 & ties**: the system flags — but never auto-resolves — a tie
   at the Top 20 cutoff, i.e. when the boundary between "in" and "out"
   falls in the middle of a group of submissions with the same Love count.

## Admin dashboard

- **Overview**: submission/juror counts, total reviews required vs.
  completed, and each juror's progress and finalize status.
- **Results & Top 20**: full ranked table (Love/Skip per juror, totals,
  Top 20 highlighting, tie banner), with CSV export (comments included).
- **Submissions**: every submission with its artist, votes, a comment
  count, and ranking (not blind — this is the admin view). Click any row
  to open the full artwork — image, artist identity, and every juror's
  vote with their comment.
- **Jurors**: each juror's Love/Skip totals and finalize status, and an
  unlock action for a finalized juror who needs to revise their reactions.

Adding or editing submissions and juror accounts is done by editing the
Jury Sheet directly (see below), not through the app.

## 1. Set up the Jury Sheet

The live Jury Sheet already has 5 tabs. `ImageCache` is created
automatically by the backend the first time it needs it — you don't need
to add it yourself.

### Tab: `Users`

```
ID	Username	Password	Role	Name	Finalized	FinalizedAt
```

One row per account — jurors plus one admin. Passwords are plain text in
this sheet (same trust model as the check-in app's shared password): only
people with edit access to the Sheet or the Apps Script project can see
them. Change a password by overwriting the Password cell — no redeploy
needed.

### Tab: `Submissions`

```
ID	Name	Mobile Number	Email Address	UAE Resident	Artwork Title	Discipline	Medium / Material:	Dimensions	Year of Completion	Artist Statement:	Short Bio (Artist) - Optional	Art Link	Eligibility	Reason For Ineligibility
```

- **ID** can be blank — a blank ID is given a stable synthesized one
  (`SG-R<row number>`) automatically, so every row is still reviewable.
- **Eligibility** / **Reason For Ineligibility** can also be blank — a
  submission is treated as eligible *unless* it's explicitly marked
  otherwise (Eligibility = No/False/Ineligible/Disqualified, or any text
  typed into Reason For Ineligibility). Mark a specific row ineligible to
  exclude just that one from the jurors' queue and from ranking.
- **Art Link** is a bare filename (e.g. `IMG_9501.jpeg`), not a link — see
  the next section for how that filename becomes an actual image a juror
  can see.
- Name/Mobile Number/Email Address/Short Bio are identity fields — read
  for the admin side only, never sent to a juror.

### Artwork images (Drive folder)

The artwork files live in a Google Drive folder, not in the Sheet. The
backend matches each row's **Art Link** filename to the actual file in
that folder (`JURY_IMAGES_FOLDER_ID` in `Code.gs`), and the first time it
resolves a given filename it:

- automatically sets that file to "Anyone with the link — Viewer" (a juror
  signs in with a username/password, not a Google account, so without this
  an image would hit a Google sign-in wall), and
- caches the filename → file lookup in the auto-created `ImageCache` tab,
  so a repeat view is a cheap sheet lookup instead of another folder scan.

A real photo/image file renders directly and clearly (`sz=w1600` Drive
thumbnail URL); a non-image file (e.g. a submitted PDF) shows an "Open
submission file" link instead. If a filename doesn't match anything in the
folder, the juror sees an "Image not available yet" placeholder rather
than a broken image.

### Tab: `JurorOrders`

```
JurorID	OrderCSV
```

Just the header row — filled in automatically (one row per juror, caching
their randomized-but-stable review order). If new submissions are added to
the Sheet after a juror has already started, their cached order is topped
up automatically with the new eligible IDs (freshly shuffled), rather than
hiding them from that juror forever.

### Tab: `Votes`

```
JurorID	SubmissionID	Vote	Comment	UpdatedAt
```

Just the header row — filled in automatically as jurors react. **Note the
Comment column** — it sits between Vote and UpdatedAt. If your live sheet
still has the older 4-column layout (`JurorID  SubmissionID  Vote
UpdatedAt`, no Comment), insert a new column between Vote and UpdatedAt
and head it `Comment` before deploying the Code.gs version described in
this README, or comments will be saved into the wrong column.

A vote of `keep` (the old label, from before the Love/Skip rename) is
still read correctly — the backend normalizes it to `love` wherever votes
are read.

## 2. Deploy the Apps Script backend

1. Open the Jury Sheet, then **Extensions → Apps Script**.
2. Replace the `Code.gs` content with
   `jury-app/google-apps-script/Code.gs` from this folder.
3. At the top of the file, set `JURY_SHEET_ID` to this Sheet's ID (the
   long string in its URL between `/d/` and `/edit`), and
   `JURY_IMAGES_FOLDER_ID` to the artwork images Drive folder's ID (the
   long string in that folder's URL after `/folders/`).
4. **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**
   on the existing Web app deployment, so the current `/exec` URL keeps
   serving the updated code (or **Deploy → New deployment** → type **Web
   app**, Execute as **Me**, Who has access **Anyone**, if this is a fresh
   deployment — then copy the new `/exec` URL into
   `jury-app/js/config.js`'s `JURY_ENDPOINT`).

## 3. Deploy the frontend on Vercel

Plain static site (HTML/CSS/JS, no build step):

1. In Vercel: **Add New… → Project**, import the `omic-culture-hub`
   GitHub repo again as a **separate** project.
2. Root Directory: `jury-app`.
3. Framework Preset: **Other** (or "None"). Leave Build Command and
   Output Directory empty.
4. Deploy.

## Project structure

```
jury-app/
  index.html               — login screen
  juror.html                — blind review: Yet to Evaluate / Loved / Skipped tabs
  admin.html                 — overview, results/Top 20/export, submissions (+ detail modal), jurors
  css/style.css
  js/
    config.js                — the Apps Script Web App URL (paste after deploying)
    api.js                     — shared JSONP fetch/retry + auth storage helper
    login.js, juror.js, admin.js — per-page logic
  google-apps-script/
    Code.gs                    — the entire backend: auth, image resolution, voting,
                                   ranking, tie detection, CSV export, all against the Jury Sheet
```

## Architecture notes

- **Auth**: the juror/admin's username+password is sent on every request,
  same as the check-in app — Apps Script Web Apps are stateless between
  requests, so there's no server memory to hold a session in.
- **Mutations over GET**: Apps Script Web App responses carry no CORS
  headers, so the frontend can only read a response via a `<script
  src="...">` tag (JSONP), which only supports GET. Voting, finalizing,
  and unlocking are therefore GET requests with their data as query
  params.
- **Concurrency**: vote/finalize/unlock all take `LockService.getScriptLock()`
  before touching the sheet, so two simultaneous requests can't corrupt
  each other's writes.
- **CSV export** is a plain link (not JSONP) — clicking it navigates the
  browser directly to the Apps Script URL, the only way to get a real file
  download out of a stateless Web App.
