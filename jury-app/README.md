# Shared Ground — Jury &amp; Scoring App

A jury/scoring web app for the Shared Ground Art Competition (OMIC Art Prize
2026): blind review, a Keep/Skip vote per artwork, visibility of other
jurors' votes once you've cast your own, a personal review-and-finalize
screen, and an administrator dashboard with ranking, tie detection, and CSV
export.

This is a from-scratch port of a working Node.js prototype (plain `http`
server + in-memory sessions + a local JSON file as the database) onto the
same architecture as the door check-in app in `checkin-app/`: a static
frontend on Vercel, a Google Apps Script Web App as the backend, and a
Google Sheet as the database. The feature set is the same as the
prototype — only the plumbing changed, so it can run on free, serverless
hosting with no server to maintain.

This is a SEPARATE Vercel project and a SEPARATE Apps Script project from
both the main omic.spot site and the door check-in app. Nothing here can
affect either of those.

## How the Keep/Skip flow works

1. **Blind review**: jurors only ever see submission ID, title, medium,
   dimensions, year, artist statement, and images — never artist identity.
2. **Zoom**: click the artwork image to open a fullscreen zoom view with
   zoom-in/out/reset controls.
3. **Vote**: the juror picks **Keep** or **Skip** for the artwork.
4. **See other jurors' votes**: as soon as a juror has voted on a piece,
   the page reveals how other jurors who have already voted on that same
   piece voted (jurors who haven't voted on it yet show as "Not yet
   voted"). This is enforced server-side — a juror can never see others'
   votes on a piece before casting their own.
5. **Review My Votes**: at any point (and automatically once the queue is
   finished), a juror can open a screen showing all their votes split into
   Keep / Skip columns, and move any item between the two.
6. **Finalize**: once every artwork has a vote, the juror can click
   **Finalize My Votes**, which locks their votes. A finalized juror's
   votes are read-only until an administrator unlocks them again (Jurors
   tab → Unlock).
7. **Ranking**: submissions are ranked by total Keep-vote count, highest
   first. A submission only appears in the ranked list once every juror
   has voted on it.
8. **Top 20 & ties**: the system flags — but never auto-resolves — a tie
   at the Top 20 cutoff, i.e. when the boundary between "in" and "out"
   falls in the middle of a group of submissions with the same Keep count.

## Admin dashboard

- **Overview**: submission/juror counts, total reviews required vs.
  completed, and each juror's progress and finalize status.
- **Results & Top 20**: full ranked table (Keep/Skip per juror, totals,
  Top 20 highlighting, tie banner), with CSV export.
- **Submissions**: see every submission with votes and ranking (not
  blind — this is the admin view).
- **Jurors**: see each juror's Keep/Skip totals and finalize status, and
  unlock a finalized juror if they need to revise their votes.

Adding or editing submissions and juror accounts is done by editing the
Jury Sheet directly (see below), not through the app — the same way the
check-in app's guest list is managed straight from its Google Sheet.

## 1. Set up the Jury Sheet

Create a new Google Sheet (any name, e.g. "Shared Ground Jury Data") and
add 4 tabs with these exact names and column headers. Google Sheets
auto-splits pasted text into columns, so you can paste each block below
directly into cell A1 of its tab.

### Tab: `Users`

Header row, then one row per account. The 5 real jurors from the Shared
Ground jury (matching the names on the art-competition page) plus one
admin account:

```
ID	Username	Password	Role	Name	Finalized	FinalizedAt
U-admin	admin	admin123	admin	Competition Administrator	FALSE	
U-juror1	patricia	patricia123	juror	Patricia Millns FRSA	FALSE	
U-juror2	jalal	jalal123	juror	Jalal Luqman	FALSE	
U-juror3	khalil	khalil123	juror	Khalil Abdulwahid	FALSE	
U-juror4	manish	manish123	juror	Manish Mundra	FALSE	
U-juror5	robin	robin123	juror	Robin Corcos	FALSE	
```

These are the same default passwords the original prototype shipped with
— change them in this sheet (just overwrite the Password cell, no app
redeploy needed) before the real competition starts, and share each
juror's own username/password with them directly rather than over a
channel everyone can see.

### Tab: `Submissions`

Header row, then one row per artwork. The 6 rows below are **placeholder
sample data** (generated colored rectangles, fake artist names) so the
app has something to show immediately — replace them with real
submissions once judging is ready to start. The Image column holds a
self-contained `data:image/svg+xml;...` placeholder; a real submission's
Image column should hold one or more actual image URLs, separated by
` | ` if there's more than one (e.g. a Google Drive share link set to
"Anyone with the link can view").

```
ID	ArtistName	Email	Title	Medium	Dimensions	Year	Statement	Eligible	Image
SG-0001	Amina Hassan	amina.hassan@example.com	Untitled Study No. 1	Oil on canvas	60 x 80 cm	2025	This work explores the tension between memory and impermanence, using everyday material as a vessel for transformation.	TRUE	data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjMmIyYjJiIi8+PHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZmNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGFjZWhvbGRlciAxPC90ZXh0Pjwvc3ZnPg==
SG-0002	Leo Marchetti	leo.marchetti@example.com	Untitled Study No. 2	Mixed media	70 x 90 cm	2025	This work explores the tension between memory and impermanence, using everyday material as a vessel for transformation.	TRUE	data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjNWM0MDMzIi8+PHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZmNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGFjZWhvbGRlciAyPC90ZXh0Pjwvc3ZnPg==
SG-0003	Yuki Tanaka	yuki.tanaka@example.com	Untitled Study No. 3	Photography	50 x 70 cm	2024	This work explores the tension between memory and impermanence, using everyday material as a vessel for transformation.	TRUE	data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjM2Q1YTViIi8+PHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZmNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGFjZWhvbGRlciAzPC90ZXh0Pjwvc3ZnPg==
SG-0004	Sofia Reyes	sofia.reyes@example.com	Untitled Study No. 4	Sculpture (bronze)	40 x 40 x 90 cm	2025	This work explores the tension between memory and impermanence, using everyday material as a vessel for transformation.	TRUE	data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjNmI0YzZiIi8+PHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZmNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGFjZWhvbGRlciA0PC90ZXh0Pjwvc3ZnPg==
SG-0005	Daniel Okafor	daniel.okafor@example.com	Untitled Study No. 5	Acrylic on canvas	60 x 90 cm	2025	This work explores the tension between memory and impermanence, using everyday material as a vessel for transformation.	TRUE	data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjNGE1ZDNhIi8+PHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZmNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGFjZWhvbGRlciA1PC90ZXh0Pjwvc3ZnPg==
SG-0006	Priya Nair	priya.nair@example.com	Untitled Study No. 6	Charcoal on paper	50 x 65 cm	2024	This work explores the tension between memory and impermanence, using everyday material as a vessel for transformation.	TRUE	data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iMTAwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSIjN2E0YTNhIi8+PHRleHQgeD0iNDAwIiB5PSI1MDAiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC1zaXplPSIyOCIgZmlsbD0iI2ZmZmZmZmNjIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5QbGFjZWhvbGRlciA2PC90ZXh0Pjwvc3ZnPg==
```

When real submissions are ready: delete these placeholder rows (or keep
them and set their `Eligible` column to `FALSE`, which excludes them from
voting and ranking without deleting history) and add real rows with the
same 10 columns. `ID` should keep the `SG-00NN` pattern so it stays
unique. **There is no in-app "add submission" screen by design** — editing
the sheet directly is simpler and avoids needing an image-upload feature
this prototype never had either.

### Tab: `JurorOrders`

Just the header row — the app fills this in automatically (one row per
juror, caching their randomized-but-stable review order the first time
they open the queue):

```
JurorID	OrderCSV
```

### Tab: `Votes`

Just the header row — the app fills this in automatically as jurors vote:

```
JurorID	SubmissionID	Vote	UpdatedAt
```

## 2. Deploy the Apps Script backend

1. Open the Jury Sheet you just set up, then **Extensions → Apps Script**
   (this creates a new script bound to that sheet, which already has edit
   access to it).
2. Replace the default `Code.gs` content with
   `jury-app/google-apps-script/Code.gs` from this folder.
3. At the top of the file, set `JURY_SHEET_ID` to this Sheet's ID (the
   long string in its URL between `/d/` and `/edit`).
4. **Deploy → New deployment** → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment's `/exec` URL.
6. Paste that URL into `jury-app/js/config.js`'s `JURY_ENDPOINT`.
7. To ship a later change to `Code.gs`: paste the update into the Apps
   Script editor, then **Deploy → Manage deployments → Edit (pencil) →
   New version → Deploy**, so the same `/exec` URL keeps serving the
   updated code.

## 3. Deploy the frontend on Vercel

This is a plain static site (HTML/CSS/JS, no build step, no npm install)
— the same way the original prototype needed no build step, just serving
it directly:

1. In Vercel: **Add New… → Project**, import the `omic-culture-hub`
   GitHub repo again as a **separate** project (same repo, separate
   project — exactly how `checkin-app` was set up).
2. Root Directory: `jury-app`.
3. Framework Preset: **Other** (or "None"). Leave Build Command and
   Output Directory empty — there's nothing to build.
4. Deploy. Vercel gives this project its own free `*.vercel.app` domain.

## Project structure

```
jury-app/
  index.html              — login screen
  juror.html               — blind review, Keep/Skip voting, Review My Votes, finalize
  admin.html                — overview, results/Top 20/export, submissions, jurors
  css/style.css
  js/
    config.js                — the Apps Script Web App URL (paste after deploying)
    api.js                     — shared JSONP fetch/retry + auth storage helper
    login.js, juror.js, admin.js — per-page logic
  google-apps-script/
    Code.gs                    — the entire backend: auth, voting, ranking, tie
                                   detection, CSV export, all against the Jury Sheet
```

## Architecture notes

- **Auth**: unlike the original prototype (password hashing + server-held
  session tokens), this sends the juror's username+password on every
  request, same as the check-in app — Apps Script Web Apps are stateless
  between requests, so there's no server memory to hold a session in.
  Passwords live in plain text in the `Users` tab, same trust model as the
  check-in app's shared admin password: only people with edit access to
  the Sheet (or the Apps Script project) can see them.
- **Mutations over GET**: Apps Script Web App responses carry no CORS
  headers, so the frontend can only read a response via a `<script
  src="...">` tag (JSONP), which only supports GET. Voting, finalizing,
  and unlocking are therefore GET requests with their data as query
  params, same pattern as the check-in app's bulk-mark endpoint.
- **Concurrency**: vote/finalize/unlock all take `LockService.getScriptLock()`
  before touching the sheet, so two simultaneous requests can't corrupt
  each other's writes.
- **CSV export** is a plain link (not JSONP) — clicking it navigates the
  browser directly to the Apps Script URL, which is the only way to get a
  real file download out of a stateless Web App.
