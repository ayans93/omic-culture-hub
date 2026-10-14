// Shared Ground Jury App -- standalone Apps Script backend.
//
// This is a SEPARATE Apps Script project from the one behind the main
// omic.spot website AND from the one behind the door check-in app. It only
// serves this jury-app/ folder, and only talks to the Jury Sheet below.
// Keeping every mini-app on its own Apps Script project + Sheet means a
// mistake in one can never affect the others.
//
// This is a from-scratch port of a Node.js prototype a colleague built
// (plain http server + in-memory sessions + a local JSON file as the
// "database") onto Google Apps Script + a Google Sheet, so it can be
// hosted the same free, serverless way as the other OMIC mini-apps:
// static frontend on Vercel, this Web App as the backend, a Sheet as the
// database.
//
// Review model: a juror sees one artwork at a time (image fixed on one
// side, blind details on the other -- no artist name/email/bio, ever) and
// reacts with Love, an optional Comment, or Skip to move to the next one.
// Everything the juror has already reacted to sorts into a "Loved" or
// "Skipped" tab; everything else stays in "Yet to Evaluate". Reveal of
// other jurors' reactions on a piece only unlocks after this juror has
// reacted to it too (vote independence), and a juror can only finalize
// once every eligible submission has a reaction -- all carried over
// unchanged from the original prototype, only the plumbing is different.
//
// Setup:
//   1. Create a new Google Sheet (see jury-app/README.md for the exact
//      tabs/columns), then from that Sheet:
//      Extensions > Apps Script (this creates a new script bound to the
//      Sheet, which already has edit access to it).
//   2. Replace the default Code.gs content with this file.
//   3. Set JURY_SHEET_ID below to that Sheet's ID (from its URL), and
//      JURY_IMAGES_FOLDER_ID to the Drive folder the artwork image files
//      live in (from that folder's URL -- the part after /folders/).
//   4. Deploy > New deployment > type "Web app".
//        Execute as: Me
//        Who has access: Anyone
//   5. Copy the deployment's /exec URL into jury-app/js/config.js's
//      JURY_ENDPOINT, then redeploy the frontend.
//   6. To ship a later change to this file, paste the update here, then
//      Deploy > Manage deployments > Edit (pencil) > New version > Deploy,
//      so the existing /exec URL keeps serving the updated code.

// Paste the Jury Sheet's ID here (the long string in its URL between
// /d/ and /edit).
var JURY_SHEET_ID = '1mLqfbcQz2u7sGEqfbUlOZSTw3WiJARxAx9mqEKdpdo4';

// Paste the Drive folder ID the artwork image/PDF files live in (the long
// string in the folder's URL after /folders/). The "Art Link" column in
// the Submissions tab only holds a bare filename (e.g. "IMG_9501.jpeg"),
// not a link -- this is where that filename gets resolved into an actual
// file Google Drive can serve.
var JURY_IMAGES_FOLDER_ID = '1TqK64NxfrUpXZe9mfCbBkjz88yGrt3oC';

var JURY_TAB_USERS = 'Users';
var JURY_TAB_SUBMISSIONS = 'Submissions';
var JURY_TAB_JUROR_ORDERS = 'JurorOrders';
var JURY_TAB_VOTES = 'Votes';
var JURY_TAB_IMAGE_CACHE = 'ImageCache';

// Column order (1-indexed) for each tab -- matches the header row each tab
// should have. See README.md for the exact headers to type in.
var USERS_COL = { ID: 1, USERNAME: 2, PASSWORD: 3, ROLE: 4, NAME: 5, FINALIZED: 6, FINALIZED_AT: 7 };

// Matches the real "Submissions" tab as it exists today: ID, Name, Mobile
// Number, Email Address, UAE Resident, Artwork Title, Discipline,
// Medium / Material:, Dimensions, Year of Completion, Artist Statement:,
// Short Bio (Artist) - Optional, Art Link, Eligibility, Reason For
// Ineligibility. NAME/MOBILE/EMAIL/BIO are identity fields -- read for the
// admin side only, never sent to a juror (see juryBlindView_).
var SUB_COL = {
  ID: 1,
  NAME: 2,
  MOBILE: 3,
  EMAIL: 4,
  UAE_RESIDENT: 5,
  TITLE: 6,
  DISCIPLINE: 7,
  MEDIUM: 8,
  DIMENSIONS: 9,
  YEAR: 10,
  STATEMENT: 11,
  BIO: 12,
  ART_LINK: 13,
  ELIGIBILITY: 14,
  INELIGIBLE_REASON: 15,
};

var ORDERS_COL = { JUROR_ID: 1, ORDER_CSV: 2 };
var VOTES_COL = { JUROR_ID: 1, SUBMISSION_ID: 2, VOTE: 3, COMMENT: 4, UPDATED_AT: 5 };
var IMAGE_CACHE_COL = { FILENAME: 1, FILE_ID: 2, MIME_TYPE: 3 };

function jurySheet_(tabName) {
  var sheet = SpreadsheetApp.openById(JURY_SHEET_ID).getSheetByName(tabName);
  if (!sheet) throw new Error('Missing tab: ' + tabName);
  return sheet;
}

function juryRespond_(payload, params) {
  var json = JSON.stringify(payload);
  if (params && params.callback) {
    return ContentService
      .createTextOutput(params.callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function juryTruthy_(value) {
  return value === true || String(value).trim().toUpperCase() === 'TRUE';
}

// A vote of 'keep' is the old name for what the UI now calls 'love' --
// normalized on read everywhere so the one real vote cast before this
// rename (and any future direct sheet edits) still counts correctly.
function juryNormalizeVote_(vote) {
  var v = String(vote || '').trim().toLowerCase();
  return v === 'keep' ? 'love' : v;
}

// --- Users -----------------------------------------------------------
function juryFindUser_(username) {
  var sheet = jurySheet_(JURY_TAB_USERS);
  var data = sheet.getDataRange().getValues();
  var uname = String(username || '').trim().toLowerCase();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][USERS_COL.USERNAME - 1] || '').trim().toLowerCase() === uname) {
      return juryRowToUser_(i + 1, data[i]);
    }
  }
  return null;
}

function juryFindUserById_(id) {
  var sheet = jurySheet_(JURY_TAB_USERS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][USERS_COL.ID - 1] || '').trim() === id) {
      return juryRowToUser_(i + 1, data[i]);
    }
  }
  return null;
}

function juryRowToUser_(rowNumber, row) {
  return {
    row: rowNumber,
    id: String(row[USERS_COL.ID - 1] || ''),
    username: String(row[USERS_COL.USERNAME - 1] || ''),
    password: String(row[USERS_COL.PASSWORD - 1] || ''),
    role: String(row[USERS_COL.ROLE - 1] || '').trim().toLowerCase(),
    name: String(row[USERS_COL.NAME - 1] || ''),
    finalized: juryTruthy_(row[USERS_COL.FINALIZED - 1]),
    finalizedAt: row[USERS_COL.FINALIZED_AT - 1] || null,
  };
}

function juryListJurors_() {
  var sheet = jurySheet_(JURY_TAB_USERS);
  var data = sheet.getDataRange().getValues();
  var jurors = [];
  for (var i = 1; i < data.length; i++) {
    var u = juryRowToUser_(i + 1, data[i]);
    if (u.role === 'juror') jurors.push(u);
  }
  return jurors;
}

// Verifies username+password (sent on every request, like the check-in
// app -- Apps Script Web Apps are stateless between requests, so there's
// no server-held session to check instead) and optionally requires a role.
function juryAuthUser_(params, requiredRole) {
  var user = juryFindUser_(params && params.username);
  if (!user) return null;
  if (user.password !== String((params && params.password) || '')) return null;
  if (requiredRole && user.role !== requiredRole) return null;
  return user;
}

// --- Submissions -------------------------------------------------------

// A blank ID cell (common on rows pasted in from elsewhere) gets a stable
// synthesized one from the row number instead of being silently skipped,
// so every row in the sheet is reviewable.
function jurySubmissionId_(rowNumber, row) {
  var id = String(row[SUB_COL.ID - 1] || '').trim();
  if (id) return id;
  return 'SG-R' + rowNumber;
}

// Eligibility/Reason For Ineligibility are blank on every row right now
// (this sheet was just repopulated from a wider export), so a submission
// is treated as eligible UNLESS it's explicitly marked otherwise -- either
// a negative-looking Eligibility value, or any text in Reason For
// Ineligibility. Mark a specific entry ineligible in the sheet to exclude
// just that one.
function jurySubmissionEligible_(row) {
  var reason = String(row[SUB_COL.INELIGIBLE_REASON - 1] || '').trim();
  if (reason) return false;
  var raw = String(row[SUB_COL.ELIGIBILITY - 1] || '').trim().toLowerCase();
  if (!raw) return true;
  return !(raw === 'no' || raw === 'false' || raw === 'n' || raw === 'ineligible' || raw === 'disqualified');
}

function jurySubmissionRowToObj_(rowNumber, row) {
  return {
    row: rowNumber,
    id: jurySubmissionId_(rowNumber, row),
    artistName: String(row[SUB_COL.NAME - 1] || ''),
    mobile: String(row[SUB_COL.MOBILE - 1] || ''),
    email: String(row[SUB_COL.EMAIL - 1] || ''),
    title: String(row[SUB_COL.TITLE - 1] || ''),
    discipline: String(row[SUB_COL.DISCIPLINE - 1] || ''),
    medium: String(row[SUB_COL.MEDIUM - 1] || ''),
    dimensions: String(row[SUB_COL.DIMENSIONS - 1] || ''),
    year: String(row[SUB_COL.YEAR - 1] || ''),
    statement: String(row[SUB_COL.STATEMENT - 1] || ''),
    bio: String(row[SUB_COL.BIO - 1] || ''),
    artLink: String(row[SUB_COL.ART_LINK - 1] || '').trim(),
    eligible: jurySubmissionEligible_(row),
  };
}

function juryListSubmissions_() {
  var sheet = jurySheet_(JURY_TAB_SUBMISSIONS);
  var data = sheet.getDataRange().getValues();
  var subs = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip fully blank rows (e.g. a trailing empty row at the end of the
    // sheet) -- but NOT rows that just have a blank ID, those still get a
    // synthesized one above.
    if (!row[SUB_COL.TITLE - 1] && !row[SUB_COL.NAME - 1] && !row[SUB_COL.ART_LINK - 1]) continue;
    subs.push(jurySubmissionRowToObj_(i + 1, row));
  }
  return subs;
}

function juryGetSubmission_(id) {
  var sheet = jurySheet_(JURY_TAB_SUBMISSIONS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[SUB_COL.TITLE - 1] && !row[SUB_COL.NAME - 1] && !row[SUB_COL.ART_LINK - 1]) continue;
    if (jurySubmissionId_(i + 1, row) === id) {
      return jurySubmissionRowToObj_(i + 1, row);
    }
  }
  return null;
}

// --- Artwork image resolution (Drive folder lookup, cached) -------------
//
// "Art Link" in the sheet is usually a bare filename to look up inside
// JURY_IMAGES_FOLDER_ID -- but a batch of later submissions have a full
// Drive share URL (or occasionally a bare Drive file ID) in that column
// instead, e.g. "https://drive.google.com/file/d/FILE_ID/view?usp=drivesdk".
// juryExtractDriveFileId_ detects that case and goes straight to the file
// by ID rather than searching the images folder by name, since a URL will
// never match a filename there. The ImageCache tab (created automatically
// the first time it's needed) remembers artLink -> {fileId, mimeType} so a
// repeat view of the same artwork is a cheap sheet lookup instead of
// another Drive lookup. The first time a file is resolved, it's also set
// to "Anyone with the link can view" if it isn't already -- otherwise a
// plain <img>/<a> pointed at it would hit a Google sign-in wall for
// jurors, who aren't signed into this app with a Google account at all.

// Pulls a Drive file ID out of a full share URL ("file/d/ID", "?id=ID")
// or recognizes a bare Drive file ID pasted with no URL around it at all.
// Returns null when none of those shapes match, so the caller falls back
// to treating the value as a plain filename.
function juryExtractDriveFileId_(value) {
  var v = String(value || '').trim();
  if (!v) return null;

  var m = v.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];

  m = v.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m) return m[1];

  if (/^[a-zA-Z0-9_-]{25,}$/.test(v)) return v;

  return null;
}

function juryImageCacheSheet_() {
  var ss = SpreadsheetApp.openById(JURY_SHEET_ID);
  var sheet = ss.getSheetByName(JURY_TAB_IMAGE_CACHE);
  if (!sheet) {
    sheet = ss.insertSheet(JURY_TAB_IMAGE_CACHE);
    sheet.appendRow(['Filename', 'FileId', 'MimeType']);
  }
  return sheet;
}

function juryResolveArtworkFile_(filename) {
  var name = String(filename || '').trim();
  if (!name) return null;

  var cacheSheet = juryImageCacheSheet_();
  var cached = cacheSheet.getDataRange().getValues();
  for (var i = 1; i < cached.length; i++) {
    if (String(cached[i][IMAGE_CACHE_COL.FILENAME - 1] || '') === name) {
      return {
        fileId: String(cached[i][IMAGE_CACHE_COL.FILE_ID - 1] || ''),
        mimeType: String(cached[i][IMAGE_CACHE_COL.MIME_TYPE - 1] || ''),
      };
    }
  }

  if (!JURY_IMAGES_FOLDER_ID || JURY_IMAGES_FOLDER_ID.indexOf('PASTE_YOUR') === 0) {
    return null;
  }

  var file = null;

  var driveId = juryExtractDriveFileId_(name);
  if (driveId) {
    try {
      file = DriveApp.getFileById(driveId);
    } catch (idErr) {
      file = null; // looked like a Drive ID but isn't accessible/doesn't exist
    }
  }

  if (!file) {
    var folder = DriveApp.getFolderById(JURY_IMAGES_FOLDER_ID);
    var files = folder.getFilesByName(name);
    if (!files.hasNext()) return null;
    file = files.next();
  }

  try {
    if (file.getSharingAccess() !== DriveApp.Access.ANYONE_WITH_LINK) {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }
  } catch (shareErr) {
    // Sharing couldn't be changed (e.g. restricted by a Workspace policy) --
    // still cache and return what we have; the file may already be
    // viewable some other way.
  }

  var resolved = { fileId: file.getId(), mimeType: file.getMimeType() };
  cacheSheet.appendRow([name, resolved.fileId, resolved.mimeType]);
  return resolved;
}

// Turns a resolved Drive file into the shape the frontend renders: a real
// image gets a direct-viewable thumbnail URL (sz=w1600 for a genuinely
// clear, large view, not a tiny preview); anything else (a submitted PDF,
// mainly) gets a normal Drive viewer link instead and the frontend shows a
// "View file" link rather than an <img>.
function juryArtworkImage_(artLink) {
  var resolved = juryResolveArtworkFile_(artLink);
  if (!resolved || !resolved.fileId) return null;
  var isImage = resolved.mimeType && resolved.mimeType.indexOf('image/') === 0;
  return {
    type: isImage ? 'image' : 'file',
    mimeType: resolved.mimeType,
    url: isImage
      ? 'https://drive.google.com/thumbnail?id=' + resolved.fileId + '&sz=w1600'
      : 'https://drive.google.com/file/d/' + resolved.fileId + '/view',
  };
}

// Fields a juror is allowed to see (blind review -- no artist name, email,
// mobile, or bio, ever) -- just the four the review portal shows: Artist
// Statement, Medium / Material, Discipline, plus the artwork image/title.
function juryBlindView_(sub) {
  return {
    id: sub.id,
    title: sub.title,
    discipline: sub.discipline,
    medium: sub.medium,
    statement: sub.statement,
    image: juryArtworkImage_(sub.artLink),
  };
}

// --- Juror ordering (randomized once per juror, then stable; topped up
// with any newly-added eligible submissions the juror hasn't seen yet) ---
function juryGetJurorOrder_(jurorId) {
  var sheet = jurySheet_(JURY_TAB_JUROR_ORDERS);
  var data = sheet.getDataRange().getValues();
  var eligibleIds = juryListSubmissions_().filter(function (s) { return s.eligible; }).map(function (s) { return s.id; });
  var eligibleSet = {};
  eligibleIds.forEach(function (id) { eligibleSet[id] = true; });

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][ORDERS_COL.JUROR_ID - 1] || '').trim() !== jurorId) continue;

    var csv = String(data[i][ORDERS_COL.ORDER_CSV - 1] || '');
    var existing = csv.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var existingSet = {};
    existing.forEach(function (id) { existingSet[id] = true; });

    // New submissions added to the sheet since this juror's order was first
    // generated (e.g. the Submissions tab was just repopulated with many
    // more entries) -- append them in a freshly shuffled batch rather than
    // leaving them permanently invisible to this juror.
    var newIds = eligibleIds.filter(function (id) { return !existingSet[id]; });
    for (var j = newIds.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var tmp = newIds[j]; newIds[j] = newIds[k]; newIds[k] = tmp;
    }

    // Also drop any order entries for submissions that no longer exist or
    // are no longer eligible, so a stale/removed ID doesn't dead-end the
    // queue.
    var kept = existing.filter(function (id) { return eligibleSet[id]; });
    var finalOrder = kept.concat(newIds);

    if (newIds.length > 0 || kept.length !== existing.length) {
      sheet.getRange(i + 1, ORDERS_COL.ORDER_CSV).setValue(finalOrder.join(','));
    }
    return finalOrder;
  }

  // Not seen before -- shuffle the eligible submission IDs once (Fisher-Yates)
  // and cache the order so this juror always sees the same sequence.
  var ids = eligibleIds.slice();
  for (var m = ids.length - 1; m > 0; m--) {
    var n = Math.floor(Math.random() * (m + 1));
    var tmp2 = ids[m]; ids[m] = ids[n]; ids[n] = tmp2;
  }
  sheet.appendRow([jurorId, ids.join(',')]);
  return ids;
}

// --- Votes (Love / Skip, with an optional comment) -----------------------
function juryAllVotes_() {
  var sheet = jurySheet_(JURY_TAB_VOTES);
  var data = sheet.getDataRange().getValues();
  var votes = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][VOTES_COL.JUROR_ID - 1]) continue;
    votes.push({
      row: i + 1,
      jurorId: String(data[i][VOTES_COL.JUROR_ID - 1] || ''),
      submissionId: String(data[i][VOTES_COL.SUBMISSION_ID - 1] || ''),
      vote: juryNormalizeVote_(data[i][VOTES_COL.VOTE - 1]),
      comment: String(data[i][VOTES_COL.COMMENT - 1] || ''),
      updatedAt: data[i][VOTES_COL.UPDATED_AT - 1] || '',
    });
  }
  return votes;
}

function juryVotesForJuror_(jurorId) {
  return juryAllVotes_().filter(function (v) { return v.jurorId === jurorId; });
}

function juryVotesForSubmission_(submissionId) {
  return juryAllVotes_().filter(function (v) { return v.submissionId === submissionId; });
}

function juryGetVote_(jurorId, submissionId) {
  var votes = juryAllVotes_();
  for (var i = 0; i < votes.length; i++) {
    if (votes[i].jurorId === jurorId && votes[i].submissionId === submissionId) return votes[i];
  }
  return null;
}

// Other jurors' reactions on this submission, with names -- only meant to
// be returned to a juror AFTER confirming they've already reacted to this
// same submission themselves (the independence rule).
function juryOthersVotesFor_(submissionId, excludingJurorId) {
  var jurors = juryListJurors_().filter(function (j) { return j.id !== excludingJurorId; });
  var votes = juryVotesForSubmission_(submissionId);
  return jurors.map(function (j) {
    var v = votes.filter(function (vote) { return vote.jurorId === j.id; })[0];
    return { jurorId: j.id, jurorName: j.name, vote: v ? v.vote : null };
  });
}

// `comment` is optional and, when present (even as an empty string, which
// clears a previous one), is saved alongside the vote in the same write --
// the frontend always sends whatever's currently in the comment box
// together with whichever action (Love/Skip) was tapped. Passing
// `undefined`/omitting it entirely leaves any existing comment untouched.
function jurySaveVote_(jurorId, submissionId, vote, comment) {
  var juror = juryFindUserById_(jurorId);
  if (juror && juror.finalized) {
    throw new Error('Your votes are finalized. Ask an administrator to unlock your review to make changes.');
  }
  var sheet = jurySheet_(JURY_TAB_VOTES);
  var data = sheet.getDataRange().getValues();
  var now = new Date().toISOString();
  var hasComment = typeof comment === 'string';
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][VOTES_COL.JUROR_ID - 1] || '') === jurorId &&
        String(data[i][VOTES_COL.SUBMISSION_ID - 1] || '') === submissionId) {
      sheet.getRange(i + 1, VOTES_COL.VOTE).setValue(vote);
      if (hasComment) sheet.getRange(i + 1, VOTES_COL.COMMENT).setValue(comment);
      sheet.getRange(i + 1, VOTES_COL.UPDATED_AT).setValue(now);
      return {
        jurorId: jurorId,
        submissionId: submissionId,
        vote: vote,
        comment: hasComment ? comment : String(data[i][VOTES_COL.COMMENT - 1] || ''),
        updatedAt: now,
      };
    }
  }
  sheet.appendRow([jurorId, submissionId, vote, hasComment ? comment : '', now]);
  return { jurorId: jurorId, submissionId: submissionId, vote: vote, comment: hasComment ? comment : '', updatedAt: now };
}

// --- Finalize / unlock ---------------------------------------------------
function juryFinalizeJuror_(jurorId) {
  var juror = juryFindUserById_(jurorId);
  if (!juror) throw new Error('Juror not found');
  var eligibleIds = juryListSubmissions_().filter(function (s) { return s.eligible; }).map(function (s) { return s.id; });
  var votedIds = {};
  juryVotesForJuror_(jurorId).forEach(function (v) { votedIds[v.submissionId] = true; });
  var missing = eligibleIds.filter(function (id) { return !votedIds[id]; });
  if (missing.length > 0) {
    throw new Error('You still have ' + missing.length + ' artwork(s) to react to before finalizing.');
  }
  var sheet = jurySheet_(JURY_TAB_USERS);
  var now = new Date().toISOString();
  sheet.getRange(juror.row, USERS_COL.FINALIZED).setValue(true);
  sheet.getRange(juror.row, USERS_COL.FINALIZED_AT).setValue(now);
  return { finalized: true, finalizedAt: now };
}

function juryUnlockJuror_(jurorId) {
  var juror = juryFindUserById_(jurorId);
  if (!juror) throw new Error('Juror not found');
  var sheet = jurySheet_(JURY_TAB_USERS);
  sheet.getRange(juror.row, USERS_COL.FINALIZED).setValue(false);
  sheet.getRange(juror.row, USERS_COL.FINALIZED_AT).setValue('');
  return { unlocked: true };
}

// --- Aggregation ---------------------------------------------------------
function juryComputeResults_() {
  var jurors = juryListJurors_();
  var submissions = juryListSubmissions_();
  var votes = juryAllVotes_();

  var results = submissions.map(function (sub) {
    var subVotes = votes.filter(function (v) { return v.submissionId === sub.id; });
    var byJuror = {};
    jurors.forEach(function (j) {
      var v = subVotes.filter(function (vote) { return vote.jurorId === j.id; })[0];
      byJuror[j.id] = v ? v.vote : null;
    });
    var loveCount = subVotes.filter(function (v) { return v.vote === 'love'; }).length;
    var skipCount = subVotes.filter(function (v) { return v.vote === 'skip'; }).length;
    return {
      id: sub.id,
      title: sub.title,
      eligible: sub.eligible,
      reviewsCompleted: subVotes.length,
      reviewsRequired: jurors.length,
      loveCount: loveCount,
      skipCount: skipCount,
      byJuror: byJuror,
    };
  });

  var ranked = results
    .filter(function (r) { return r.eligible && r.reviewsCompleted === jurors.length; })
    .sort(function (a, b) { return b.loveCount - a.loveCount; })
    .map(function (r, i) {
      var copy = {}; for (var k in r) copy[k] = r[k];
      copy.rank = i + 1;
      return copy;
    });

  var unranked = results.filter(function (r) { return !(r.eligible && r.reviewsCompleted === jurors.length); });

  // Tie detection at the Top 20 cutoff (by Love count) -- flagged, never
  // auto-resolved, exactly like the original prototype.
  var tieFlag = null;
  if (ranked.length > 20) {
    var cutoffCount = ranked[19].loveCount;
    var tiedAtCutoff = ranked.filter(function (r) { return r.loveCount === cutoffCount; });
    if (tiedAtCutoff.length > 1 && ranked[20] && ranked[20].loveCount === cutoffCount) {
      tieFlag = {
        loveCount: cutoffCount,
        ranks: tiedAtCutoff.map(function (r) { return r.rank; }),
        submissionIds: tiedAtCutoff.map(function (r) { return r.id; }),
      };
    }
  }

  return { ranked: ranked, unranked: unranked, jurors: jurors, tieFlag: tieFlag, top20: ranked.slice(0, 20) };
}

function juryJurorStats_(jurorId) {
  var votes = juryVotesForJuror_(jurorId);
  var total = juryListSubmissions_().filter(function (s) { return s.eligible; }).length;
  var juror = juryFindUserById_(jurorId);
  return {
    reviewsCompleted: votes.length,
    reviewsRequired: total,
    loveCount: votes.filter(function (v) { return v.vote === 'love'; }).length,
    skipCount: votes.filter(function (v) { return v.vote === 'skip'; }).length,
    finalized: juror ? juror.finalized : false,
    finalizedAt: juror ? juror.finalizedAt : null,
    votes: votes,
  };
}

// --- Route handlers ------------------------------------------------------
function handleJuryLogin_(params) {
  var user = juryAuthUser_(params);
  if (!user) return juryRespond_({ ok: false }, params);
  return juryRespond_({ ok: true, role: user.role, name: user.name, id: user.id }, params);
}

function handleJurorQueue_(params) {
  var user = juryAuthUser_(params, 'juror');
  if (!user) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var order = juryGetJurorOrder_(user.id);
  var votedSet = {};
  juryVotesForJuror_(user.id).forEach(function (v) { votedSet[v.submissionId] = true; });
  return juryRespond_({
    ok: true,
    order: order,
    completed: order.filter(function (id) { return votedSet[id]; }),
    total: order.length,
    finalized: juryJurorStats_(user.id).finalized,
  }, params);
}

function handleJurorSubmission_(params) {
  var user = juryAuthUser_(params, 'juror');
  if (!user) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var sub = juryGetSubmission_(String(params.id || ''));
  if (!sub) return juryRespond_({ ok: false, error: 'not_found' }, params);
  var myVote = juryGetVote_(user.id, sub.id);
  // Independence rule: only reveal other jurors' reactions to this piece
  // once this juror has reacted to it themselves.
  var othersVotes = myVote ? juryOthersVotesFor_(sub.id, user.id) : [];
  return juryRespond_({ ok: true, submission: juryBlindView_(sub), myVote: myVote, othersVotes: othersVotes }, params);
}

function handleJurorVote_(params) {
  var user = juryAuthUser_(params, 'juror');
  if (!user) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var submissionId = String(params.submissionId || '');
  var vote = String(params.vote || '');
  if (!submissionId || (vote !== 'love' && vote !== 'skip')) {
    return juryRespond_({ ok: false, error: 'bad_request' }, params);
  }
  if (!juryGetSubmission_(submissionId)) {
    return juryRespond_({ ok: false, error: 'not_found' }, params);
  }
  var comment = typeof params.comment === 'string' ? params.comment : undefined;
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return juryRespond_({ ok: false, error: 'busy_try_again' }, params);
  }
  try {
    var saved = jurySaveVote_(user.id, submissionId, vote, comment);
    var othersVotes = juryOthersVotesFor_(submissionId, user.id);
    return juryRespond_({ ok: true, saved: saved, othersVotes: othersVotes }, params);
  } catch (err) {
    return juryRespond_({ ok: false, error: err.message }, params);
  } finally {
    lock.releaseLock();
  }
}

function handleJurorReview_(params) {
  var user = juryAuthUser_(params, 'juror');
  if (!user) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var stats = juryJurorStats_(user.id);
  var items = stats.votes.map(function (v) {
    var sub = juryGetSubmission_(v.submissionId);
    return {
      submissionId: v.submissionId,
      title: sub ? sub.title : null,
      image: sub ? juryArtworkImage_(sub.artLink) : null,
      vote: v.vote,
      comment: v.comment,
    };
  });
  return juryRespond_({
    ok: true,
    finalized: stats.finalized,
    finalizedAt: stats.finalizedAt,
    reviewsCompleted: stats.reviewsCompleted,
    reviewsRequired: stats.reviewsRequired,
    loved: items.filter(function (i) { return i.vote === 'love'; }),
    skipped: items.filter(function (i) { return i.vote === 'skip'; }),
  }, params);
}

function handleJurorFinalize_(params) {
  var user = juryAuthUser_(params, 'juror');
  if (!user) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return juryRespond_({ ok: false, error: 'busy_try_again' }, params);
  }
  try {
    juryFinalizeJuror_(user.id);
    return juryRespond_({ ok: true, finalized: true }, params);
  } catch (err) {
    return juryRespond_({ ok: false, error: err.message }, params);
  } finally {
    lock.releaseLock();
  }
}

function handleAdminOverview_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var subs = juryListSubmissions_();
  var jurors = juryListJurors_();
  var eligible = subs.filter(function (s) { return s.eligible; });
  var totalRequired = eligible.length * jurors.length;
  var completed = juryAllVotes_().length;
  return juryRespond_({
    ok: true,
    totalSubmissions: subs.length,
    eligibleSubmissions: eligible.length,
    jurorCount: jurors.length,
    totalReviewsRequired: totalRequired,
    reviewsCompleted: completed,
    reviewsRemaining: totalRequired - completed,
    percentComplete: totalRequired ? Math.round((completed / totalRequired) * 1000) / 10 : 0,
    jurors: jurors.map(function (j) {
      var s = juryJurorStats_(j.id);
      return { id: j.id, name: j.name, completed: s.reviewsCompleted, required: s.reviewsRequired, finalized: s.finalized };
    }),
  }, params);
}

function handleAdminSubmissions_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var results = juryComputeResults_();
  var rankMap = {};
  results.ranked.forEach(function (r) { rankMap[r.id] = r.rank; });
  var all = results.ranked.concat(results.unranked);
  var votes = juryAllVotes_();
  var full = juryListSubmissions_().map(function (sub) {
    var row = all.filter(function (r) { return r.id === sub.id; })[0];
    var rank = rankMap[sub.id] || null;
    var out = {};
    for (var k in sub) out[k] = sub[k];
    out.reviewsCompleted = row ? row.reviewsCompleted : 0;
    out.loveCount = row ? row.loveCount : 0;
    out.skipCount = row ? row.skipCount : 0;
    out.rank = rank;
    out.inTop20 = rank ? rank <= 20 : false;
    out.commentCount = votes.filter(function (v) { return v.submissionId === sub.id && v.comment; }).length;
    return out;
  });
  return juryRespond_({ ok: true, submissions: full }, params);
}

function handleAdminSubmissionDetail_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var sub = juryGetSubmission_(String(params.id || ''));
  if (!sub) return juryRespond_({ ok: false, error: 'not_found' }, params);
  var votes = juryVotesForSubmission_(sub.id).map(function (v) {
    var juror = juryFindUserById_(v.jurorId);
    var out = {}; for (var k in v) out[k] = v[k];
    out.jurorName = juror ? juror.name : '';
    return out;
  });
  var results = juryComputeResults_();
  var resultRow = results.ranked.concat(results.unranked).filter(function (r) { return r.id === sub.id; })[0] || null;
  var out = {}; for (var k in sub) out[k] = sub[k];
  out.image = juryArtworkImage_(sub.artLink);
  return juryRespond_({ ok: true, submission: out, votes: votes, result: resultRow }, params);
}

function handleAdminResults_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var results = juryComputeResults_();
  return juryRespond_(Object.assign({ ok: true }, results), params);
}

function handleAdminJurors_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var jurors = juryListJurors_().map(function (j) {
    var stats = juryJurorStats_(j.id);
    return Object.assign({ id: j.id, name: j.name, username: j.username }, stats);
  });
  return juryRespond_({ ok: true, jurors: jurors }, params);
}

function handleAdminJurorDetail_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var juror = juryFindUserById_(String(params.id || ''));
  if (!juror || juror.role !== 'juror') return juryRespond_({ ok: false, error: 'not_found' }, params);
  var stats = juryJurorStats_(juror.id);
  var detailed = stats.votes.map(function (v) {
    var sub = juryGetSubmission_(v.submissionId);
    return { submissionId: v.submissionId, title: sub ? sub.title : null, vote: v.vote, comment: v.comment, updatedAt: v.updatedAt };
  });
  return juryRespond_({ ok: true, juror: { id: juror.id, name: juror.name }, stats: stats, votes: detailed }, params);
}

function handleAdminJurorUnlock_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return juryRespond_({ ok: false, error: 'busy_try_again' }, params);
  }
  try {
    juryUnlockJuror_(String(params.id || ''));
    return juryRespond_({ ok: true, unlocked: true }, params);
  } catch (err) {
    return juryRespond_({ ok: false, error: err.message }, params);
  } finally {
    lock.releaseLock();
  }
}

// Not JSONP -- meant to be opened directly (window.open), same way the
// base Web App URL can be opened directly to sanity-check a deployment.
// Credentials travel as query params because there's no other way to
// authenticate a plain top-level navigation against a stateless Web App;
// only the admin, already signed in, ever clicks this link.
function handleAdminExportCsv_(params) {
  var admin = juryAuthUser_(params, 'admin');
  if (!admin) {
    return ContentService.createTextOutput('Unauthorized').setMimeType(ContentService.MimeType.TEXT);
  }
  var results = juryComputeResults_();
  var rows = results.ranked.concat(results.unranked);
  var jurors = results.jurors;
  var header = ['Rank', 'Submission ID', 'Artist Name', 'Artwork Title']
    .concat(jurors.map(function (j) { return j.name; }))
    .concat(['Total Love', 'Total Skip', 'Shortlisted (Top 20)', 'Comments']);
  var lines = [header.join(',')];
  var csvSafe = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
  var voteLabel = function (v) { return v === 'love' ? 'Love' : v === 'skip' ? 'Skip' : ''; };
  rows.forEach(function (r) {
    var sub = juryGetSubmission_(r.id);
    var votes = juryVotesForSubmission_(r.id);
    var comments = votes
      .filter(function (v) { return v.comment; })
      .map(function (v) {
        var juror = juryFindUserById_(v.jurorId);
        return (juror ? juror.name : v.jurorId) + ': ' + v.comment;
      })
      .join(' | ');
    var line = [r.rank || '', r.id, csvSafe(sub.artistName), csvSafe(sub.title)]
      .concat(jurors.map(function (j) { return voteLabel(r.byJuror[j.id]); }))
      .concat([r.loveCount, r.skipCount, r.rank && r.rank <= 20 ? 'Yes' : 'No', csvSafe(comments)]);
    lines.push(line.join(','));
  });
  return ContentService.createTextOutput(lines.join('\n')).setMimeType(ContentService.MimeType.CSV);
}

// One-time utility -- NOT wired into doGet, never reachable over the web.
// Walks every submission and resolves+caches its Drive image via the same
// juryArtworkImage_/juryResolveArtworkFile_ logic the live app already
// uses (sharing each file "Anyone with the link" and recording filename ->
// {fileId, mimeType} in the ImageCache tab along the way), so ImageCache
// ends up fully populated in one pass instead of only as jurors happen to
// view each piece. Run this manually from the Apps Script editor: pick
// "resolveAllImages_" from the function dropdown next to the Run button,
// click Run, approve the permission prompt if asked, then check View >
// Logs (or Executions) for the summary line.
//
// Deliberately named WITHOUT a trailing underscore (unlike every other
// helper in this file) -- Apps Script's editor hides underscore-suffixed
// functions from the "Select function to run" dropdown, treating that as
// a private-helper convention, so this one needs a plain name to be
// selectable there at all.
function resolveAllImages() {
  var subs = juryListSubmissions_();
  var resolved = 0;
  var missing = [];
  subs.forEach(function (sub) {
    var img = juryArtworkImage_(sub.artLink);
    if (img) {
      resolved++;
    } else {
      missing.push(sub.id + ' (' + sub.artLink + ')');
    }
  });
  Logger.log('Resolved ' + resolved + ' of ' + subs.length + ' submissions.');
  if (missing.length) {
    Logger.log('No matching Drive file for: ' + missing.join(', '));
  }
}

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.formType === 'login') return handleJuryLogin_(params);
  if (params.formType === 'jurorQueue') return handleJurorQueue_(params);
  if (params.formType === 'jurorSubmission') return handleJurorSubmission_(params);
  if (params.formType === 'jurorVote') return handleJurorVote_(params);
  if (params.formType === 'jurorReview') return handleJurorReview_(params);
  if (params.formType === 'jurorFinalize') return handleJurorFinalize_(params);
  if (params.formType === 'adminOverview') return handleAdminOverview_(params);
  if (params.formType === 'adminSubmissions') return handleAdminSubmissions_(params);
  if (params.formType === 'adminSubmissionDetail') return handleAdminSubmissionDetail_(params);
  if (params.formType === 'adminResults') return handleAdminResults_(params);
  if (params.formType === 'adminJurors') return handleAdminJurors_(params);
  if (params.formType === 'adminJurorDetail') return handleAdminJurorDetail_(params);
  if (params.formType === 'adminJurorUnlock') return handleAdminJurorUnlock_(params);
  if (params.formType === 'adminExportCsv') return handleAdminExportCsv_(params);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Shared Ground jury endpoint is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
