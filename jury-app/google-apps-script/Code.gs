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
// database. The feature set (blind review, Keep/Skip voting, reveal other
// jurors' votes only after you've voted, review-and-finalize with a lock,
// admin dashboard with ranking/tie detection/CSV export) is unchanged from
// that prototype -- only the plumbing is different.
//
// Setup:
//   1. Create a new Google Sheet (see jury-app/README.md for the exact
//      tabs/columns/seed rows to set up), then from that Sheet:
//      Extensions > Apps Script (this creates a new script bound to the
//      Sheet, which already has edit access to it).
//   2. Replace the default Code.gs content with this file.
//   3. Set JURY_SHEET_ID below to that Sheet's ID (from its URL).
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
var JURY_SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE';

var JURY_TAB_USERS = 'Users';
var JURY_TAB_SUBMISSIONS = 'Submissions';
var JURY_TAB_JUROR_ORDERS = 'JurorOrders';
var JURY_TAB_VOTES = 'Votes';

// Column order (1-indexed) for each tab -- matches the header row each tab
// should have. See README.md for the exact headers to type in.
var USERS_COL = { ID: 1, USERNAME: 2, PASSWORD: 3, ROLE: 4, NAME: 5, FINALIZED: 6, FINALIZED_AT: 7 };
var SUB_COL = { ID: 1, ARTIST_NAME: 2, EMAIL: 3, TITLE: 4, MEDIUM: 5, DIMENSIONS: 6, YEAR: 7, STATEMENT: 8, ELIGIBLE: 9, IMAGES: 10 };
var ORDERS_COL = { JUROR_ID: 1, ORDER_CSV: 2 };
var VOTES_COL = { JUROR_ID: 1, SUBMISSION_ID: 2, VOTE: 3, UPDATED_AT: 4 };

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
function jurySubmissionRowToObj_(rowNumber, row) {
  var imagesRaw = String(row[SUB_COL.IMAGES - 1] || '');
  var images = imagesRaw.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
  return {
    row: rowNumber,
    id: String(row[SUB_COL.ID - 1] || ''),
    artistName: String(row[SUB_COL.ARTIST_NAME - 1] || ''),
    email: String(row[SUB_COL.EMAIL - 1] || ''),
    title: String(row[SUB_COL.TITLE - 1] || ''),
    medium: String(row[SUB_COL.MEDIUM - 1] || ''),
    dimensions: String(row[SUB_COL.DIMENSIONS - 1] || ''),
    year: String(row[SUB_COL.YEAR - 1] || ''),
    statement: String(row[SUB_COL.STATEMENT - 1] || ''),
    eligible: juryTruthy_(row[SUB_COL.ELIGIBLE - 1]),
    images: images,
  };
}

function juryListSubmissions_() {
  var sheet = jurySheet_(JURY_TAB_SUBMISSIONS);
  var data = sheet.getDataRange().getValues();
  var subs = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][SUB_COL.ID - 1]) continue;
    subs.push(jurySubmissionRowToObj_(i + 1, data[i]));
  }
  return subs;
}

function juryGetSubmission_(id) {
  var sheet = jurySheet_(JURY_TAB_SUBMISSIONS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][SUB_COL.ID - 1] || '').trim() === id) {
      return jurySubmissionRowToObj_(i + 1, data[i]);
    }
  }
  return null;
}

// Fields a juror is allowed to see (blind review -- no identity data).
function juryBlindView_(sub) {
  return {
    id: sub.id,
    title: sub.title,
    medium: sub.medium,
    dimensions: sub.dimensions,
    year: sub.year,
    statement: sub.statement,
    images: sub.images,
  };
}

// --- Juror ordering (randomized once per juror, then stable) ---------
function juryGetJurorOrder_(jurorId) {
  var sheet = jurySheet_(JURY_TAB_JUROR_ORDERS);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][ORDERS_COL.JUROR_ID - 1] || '').trim() === jurorId) {
      var csv = String(data[i][ORDERS_COL.ORDER_CSV - 1] || '');
      return csv.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    }
  }
  // Not seen before -- shuffle the eligible submission IDs once (Fisher-Yates)
  // and cache the order so this juror always sees the same sequence.
  var ids = juryListSubmissions_().filter(function (s) { return s.eligible; }).map(function (s) { return s.id; });
  for (var j = ids.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var tmp = ids[j]; ids[j] = ids[k]; ids[k] = tmp;
  }
  sheet.appendRow([jurorId, ids.join(',')]);
  return ids;
}

// --- Votes (Keep / Skip) ------------------------------------------------
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
      vote: String(data[i][VOTES_COL.VOTE - 1] || ''),
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

// Other jurors' votes on this submission, with names -- only meant to be
// returned to a juror AFTER confirming they've already voted on this same
// submission themselves (the independence rule).
function juryOthersVotesFor_(submissionId, excludingJurorId) {
  var jurors = juryListJurors_().filter(function (j) { return j.id !== excludingJurorId; });
  var votes = juryVotesForSubmission_(submissionId);
  return jurors.map(function (j) {
    var v = votes.filter(function (vote) { return vote.jurorId === j.id; })[0];
    return { jurorId: j.id, jurorName: j.name, vote: v ? v.vote : null };
  });
}

function jurySaveVote_(jurorId, submissionId, vote) {
  var juror = juryFindUserById_(jurorId);
  if (juror && juror.finalized) {
    throw new Error('Your votes are finalized. Ask an administrator to unlock your review to make changes.');
  }
  var sheet = jurySheet_(JURY_TAB_VOTES);
  var data = sheet.getDataRange().getValues();
  var now = new Date().toISOString();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][VOTES_COL.JUROR_ID - 1] || '') === jurorId &&
        String(data[i][VOTES_COL.SUBMISSION_ID - 1] || '') === submissionId) {
      sheet.getRange(i + 1, VOTES_COL.VOTE).setValue(vote);
      sheet.getRange(i + 1, VOTES_COL.UPDATED_AT).setValue(now);
      return { jurorId: jurorId, submissionId: submissionId, vote: vote, updatedAt: now };
    }
  }
  sheet.appendRow([jurorId, submissionId, vote, now]);
  return { jurorId: jurorId, submissionId: submissionId, vote: vote, updatedAt: now };
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
    throw new Error('You still have ' + missing.length + ' artwork(s) to vote on before finalizing.');
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
    var keepCount = subVotes.filter(function (v) { return v.vote === 'keep'; }).length;
    var skipCount = subVotes.filter(function (v) { return v.vote === 'skip'; }).length;
    return {
      id: sub.id,
      title: sub.title,
      eligible: sub.eligible,
      reviewsCompleted: subVotes.length,
      reviewsRequired: jurors.length,
      keepCount: keepCount,
      skipCount: skipCount,
      byJuror: byJuror,
    };
  });

  var ranked = results
    .filter(function (r) { return r.eligible && r.reviewsCompleted === jurors.length; })
    .sort(function (a, b) { return b.keepCount - a.keepCount; })
    .map(function (r, i) {
      var copy = {}; for (var k in r) copy[k] = r[k];
      copy.rank = i + 1;
      return copy;
    });

  var unranked = results.filter(function (r) { return !(r.eligible && r.reviewsCompleted === jurors.length); });

  // Tie detection at the Top 20 cutoff (by Keep count) -- flagged, never
  // auto-resolved, exactly like the original prototype.
  var tieFlag = null;
  if (ranked.length > 20) {
    var cutoffCount = ranked[19].keepCount;
    var tiedAtCutoff = ranked.filter(function (r) { return r.keepCount === cutoffCount; });
    if (tiedAtCutoff.length > 1 && ranked[20] && ranked[20].keepCount === cutoffCount) {
      tieFlag = {
        keepCount: cutoffCount,
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
    keepCount: votes.filter(function (v) { return v.vote === 'keep'; }).length,
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
  // Independence rule: only reveal other jurors' votes on this piece once
  // this juror has cast their own vote on it.
  var othersVotes = myVote ? juryOthersVotesFor_(sub.id, user.id) : [];
  return juryRespond_({ ok: true, submission: juryBlindView_(sub), myVote: myVote, othersVotes: othersVotes }, params);
}

function handleJurorVote_(params) {
  var user = juryAuthUser_(params, 'juror');
  if (!user) return juryRespond_({ ok: false, error: 'unauthorized' }, params);
  var submissionId = String(params.submissionId || '');
  var vote = String(params.vote || '');
  if (!submissionId || (vote !== 'keep' && vote !== 'skip')) {
    return juryRespond_({ ok: false, error: 'bad_request' }, params);
  }
  if (!juryGetSubmission_(submissionId)) {
    return juryRespond_({ ok: false, error: 'not_found' }, params);
  }
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (lockErr) {
    return juryRespond_({ ok: false, error: 'busy_try_again' }, params);
  }
  try {
    var saved = jurySaveVote_(user.id, submissionId, vote);
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
      image: sub && sub.images && sub.images[0] ? sub.images[0] : null,
      vote: v.vote,
    };
  });
  return juryRespond_({
    ok: true,
    finalized: stats.finalized,
    finalizedAt: stats.finalizedAt,
    reviewsCompleted: stats.reviewsCompleted,
    reviewsRequired: stats.reviewsRequired,
    keep: items.filter(function (i) { return i.vote === 'keep'; }),
    skip: items.filter(function (i) { return i.vote === 'skip'; }),
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
  var full = juryListSubmissions_().map(function (sub) {
    var row = all.filter(function (r) { return r.id === sub.id; })[0];
    var rank = rankMap[sub.id] || null;
    var out = {};
    for (var k in sub) out[k] = sub[k];
    out.reviewsCompleted = row ? row.reviewsCompleted : 0;
    out.keepCount = row ? row.keepCount : 0;
    out.skipCount = row ? row.skipCount : 0;
    out.rank = rank;
    out.inTop20 = rank ? rank <= 20 : false;
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
  return juryRespond_({ ok: true, submission: sub, votes: votes, result: resultRow }, params);
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
    return { submissionId: v.submissionId, title: sub ? sub.title : null, vote: v.vote, updatedAt: v.updatedAt };
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
    .concat(['Total Keep', 'Total Skip', 'Shortlisted (Top 20)']);
  var lines = [header.join(',')];
  var csvSafe = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; };
  var voteLabel = function (v) { return v === 'keep' ? 'Keep' : v === 'skip' ? 'Skip' : ''; };
  rows.forEach(function (r) {
    var sub = juryGetSubmission_(r.id);
    var line = [r.rank || '', r.id, csvSafe(sub.artistName), csvSafe(sub.title)]
      .concat(jurors.map(function (j) { return voteLabel(r.byJuror[j.id]); }))
      .concat([r.keepCount, r.skipCount, r.rank && r.rank <= 20 ? 'Yes' : 'No']);
    lines.push(line.join(','));
  });
  return ContentService.createTextOutput(lines.join('\n')).setMimeType(ContentService.MimeType.CSV);
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
