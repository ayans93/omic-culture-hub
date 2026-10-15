import { juryApiCall, requireAuth, clearStoredAuth, escapeHtml } from './api.js';

const auth = requireAuth('juror');

const jurorNameEl = document.getElementById('jurorName');
const logoutBtn = document.getElementById('logoutBtn');
const statusBarWrap = document.getElementById('statusBarWrap');

const tabs = {
  pending: { btn: document.getElementById('tabBtnPending'), panel: document.getElementById('panelPending'), load: loadPendingPanel },
  loved: { btn: document.getElementById('tabBtnLoved'), panel: document.getElementById('panelLoved'), load: () => loadListPanel('loved') },
  rejected: { btn: document.getElementById('tabBtnRejected'), panel: document.getElementById('panelRejected'), load: () => loadListPanel('rejected') },
  savedForLater: { btn: document.getElementById('tabBtnSavedForLater'), panel: document.getElementById('panelSavedForLater'), load: () => loadListPanel('savedForLater') },
  skipped: { btn: document.getElementById('tabBtnSkipped'), panel: document.getElementById('panelSkipped'), load: () => loadListPanel('skipped') },
  all: { btn: document.getElementById('tabBtnAll'), panel: document.getElementById('panelAll'), load: loadAllArtworkPanel },
};

const countPending = document.getElementById('countPending');
const countLoved = document.getElementById('countLoved');
const countRejected = document.getElementById('countRejected');
const countSavedForLater = document.getElementById('countSavedForLater');
const countSkipped = document.getElementById('countSkipped');
const countAll = document.getElementById('countAll');

const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');
const zoomCloseBtn = document.getElementById('zoomCloseBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

const compareOverlay = document.getElementById('compareOverlay');
const compareContent = document.getElementById('compareContent');
const compareCloseBtn = document.getElementById('compareCloseBtn');

if (auth) jurorNameEl.textContent = auth.name || auth.username;

logoutBtn.addEventListener('click', () => {
  clearStoredAuth();
  window.location.href = '/index.html';
});

// Icon markup -- simple inline SVGs so the action row doesn't depend on an
// icon font/library; stroke uses currentColor so hover/active/current
// states just recolor the button text.
const ICON_LOVE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.8-9.3C.6 7.8 2 4.5 5.4 3.8c2-.4 3.9.6 4.9 2.2.3.5.9.5 1.2 0 1-1.6 2.9-2.6 4.9-2.2 3.4.7 4.8 4 3.2 7.4-2.3 4.7-9.6 9.3-9.6 9.3z"/></svg>`;
const ICON_REJECT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>`;
const ICON_SAVE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V21l-6-4-6 4V3.75z"/></svg>`;
const ICON_SKIP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l9 7-9 7V5z"/><path d="M18 5v14"/></svg>`;
const ICON_COMPARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/></svg>`;

const VOTE_ORDER = ['love', 'reject', 'save_for_later', 'skip'];
const VOTE_META = {
  love: { label: 'Loved', icon: ICON_LOVE, verb: 'You loved this piece' },
  reject: { label: 'Needs Improvement', icon: ICON_REJECT, verb: 'You marked this piece as needing improvement' },
  save_for_later: { label: 'Saved for Later', icon: ICON_SAVE, verb: 'You saved this piece for later' },
  skip: { label: 'Skipped', icon: ICON_SKIP, verb: 'You skipped this piece' },
};
const VOTE_TO_TAB = { love: 'loved', reject: 'rejected', save_for_later: 'savedForLater', skip: 'skipped' };

// ---------------------------------------------------------------------------
// Zoom overlay

let zoomScale = 1;

function openZoom(src, alt) {
  if (!src) return;
  zoomImage.src = src;
  zoomImage.alt = alt || '';
  zoomScale = 1;
  zoomImage.style.transform = 'scale(1)';
  zoomOverlay.hidden = false;
}

function closeZoom() {
  zoomOverlay.hidden = true;
  zoomImage.src = '';
}

zoomCloseBtn.addEventListener('click', closeZoom);
zoomOverlay.addEventListener('click', (event) => {
  if (event.target === zoomOverlay) closeZoom();
});
zoomInBtn.addEventListener('click', () => {
  zoomScale = Math.min(zoomScale + 0.5, 4);
  zoomImage.style.transform = `scale(${zoomScale})`;
});
zoomOutBtn.addEventListener('click', () => {
  zoomScale = Math.max(zoomScale - 0.5, 1);
  zoomImage.style.transform = `scale(${zoomScale})`;
});
zoomResetBtn.addEventListener('click', () => {
  zoomScale = 1;
  zoomImage.style.transform = 'scale(1)';
});

// ---------------------------------------------------------------------------
// Shared status (progress + finalize), kept in sync across all tabs

let latestReview = null;

async function refreshStatus() {
  try {
    const result = await juryApiCall('jurorReview', { ...auth });
    if (result && result.ok) {
      latestReview = result;
      renderTabCounts();
      renderStatusBar();
    }
  } catch (err) {
    // Non-fatal -- the active panel still shows its own error state if the
    // underlying call fails too.
  }
  return latestReview;
}

function renderTabCounts() {
  if (!latestReview) return;
  const pendingCount = Math.max(0, latestReview.reviewsRequired - latestReview.reviewsCompleted);
  countPending.textContent = pendingCount;
  countLoved.textContent = latestReview.loved.length;
  countRejected.textContent = latestReview.rejected.length;
  countSavedForLater.textContent = latestReview.savedForLater.length;
  countSkipped.textContent = latestReview.skipped.length;
  countAll.textContent = latestReview.reviewsRequired;
}

function renderStatusBar() {
  if (!latestReview) return;
  if (latestReview.finalized) {
    statusBarWrap.innerHTML = `
      <div class="finalize-banner finalize-banner--locked">
        <p>Your votes are finalized${latestReview.finalizedAt ? ` (${new Date(latestReview.finalizedAt).toLocaleString()})` : ''}. Ask an administrator to unlock your review if you need to make changes.</p>
      </div>
    `;
    return;
  }
  const allDone = latestReview.reviewsCompleted >= latestReview.reviewsRequired;
  statusBarWrap.innerHTML = `
    <div class="finalize-banner">
      <p>${latestReview.reviewsCompleted} of ${latestReview.reviewsRequired} artworks reviewed.${allDone ? ' Ready to finalize.' : ''}</p>
      <button type="button" class="btn btn--primary" id="finalizeBtn" ${allDone ? '' : 'disabled'}>Finalize My Votes</button>
    </div>
  `;
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) finalizeBtn.addEventListener('click', finalizeVotes);
}

async function finalizeVotes() {
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) {
    finalizeBtn.disabled = true;
    finalizeBtn.textContent = 'Finalizing…';
  }
  try {
    const result = await juryApiCall('jurorFinalize', { ...auth });
    if (!result || !result.ok) {
      statusBarWrap.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not finalize your votes.')}</p>`);
    }
  } catch (err) {
    statusBarWrap.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(err.message || 'Could not finalize your votes.')}</p>`);
  }
  await refreshStatus();
}

// ---------------------------------------------------------------------------
// Tab switching
//
// setTabUI() just flips which tab/panel looks active, with no data loading
// -- used when we already know exactly which artwork we're about to render
// into a panel (see openArtworkFromAnywhere) and calling a tab's normal
// load() would just throw away that work and re-fetch a list we don't want
// yet. setActiveTab() is the normal path for an actual tab-bar click.

function setTabUI(key) {
  Object.entries(tabs).forEach(([k, t]) => {
    t.btn.classList.toggle('is-active', k === key);
    t.panel.hidden = k !== key;
  });
}

function setActiveTab(key) {
  setTabUI(key);
  refreshStatus();
  tabs[key].load();
}

Object.entries(tabs).forEach(([key, t]) => {
  t.btn.addEventListener('click', () => setActiveTab(key));
});

// ---------------------------------------------------------------------------
// Shared helpers

function renderArtworkPane(image, title) {
  if (!image) {
    return `<div class="artwork-image-wrap artwork-image-wrap--empty"><p>Image not available yet</p></div>`;
  }
  if (image.type === 'image') {
    return `
      <div class="artwork-image-wrap" id="artworkImageWrap">
        <img src="${escapeHtml(image.url)}" alt="${escapeHtml(title || 'Artwork')}" />
      </div>
    `;
  }
  return `
    <div class="artwork-image-wrap artwork-image-wrap--file">
      <a href="${escapeHtml(image.url)}" target="_blank" rel="noopener" class="artwork-file-link">Open submission file</a>
    </div>
  `;
}

function wireArtworkZoom(submission) {
  const imageWrap = document.getElementById('artworkImageWrap');
  if (imageWrap && submission.image && submission.image.type === 'image') {
    imageWrap.addEventListener('click', () => openZoom(submission.image.url, submission.title));
  }
}

// A handful of submissions is a fast, lightweight read, but the network call
// still crosses the network once per screen, and can occasionally fail
// transiently. juryApiCall already retries each call silently up to 3 times
// before giving up -- this is the explicit fallback for when even that
// isn't enough, so a juror never has to reload the whole page to recover.
function renderRetryState(message, retryFn) {
  const id = 'retryBtn' + Math.random().toString(36).slice(2, 8);
  setTimeout(() => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', retryFn);
  }, 0);
  return `
    <div class="empty-state">
      <p>${escapeHtml(message)}</p>
      <button type="button" class="btn btn--secondary" id="${id}" style="margin-top:10px">Try again</button>
    </div>
  `;
}

function renderOthersVotes(othersVotes) {
  if (!othersVotes || !othersVotes.length) {
    return '<p class="empty-state" style="padding:20px 0">No other jurors yet.</p>';
  }
  return othersVotes
    .map((o) => {
      const meta = VOTE_META[o.vote];
      const pillClass = meta ? `vote-pill--${o.vote}` : 'vote-pill--pending';
      const label = meta ? meta.label : 'Not yet reviewed';
      return `
        <div class="others-votes-row">
          <span>${escapeHtml(o.jurorName)}</span>
          <span class="vote-pill ${pillClass}">${label}</span>
        </div>
      `;
    })
    .join('');
}

// ---------------------------------------------------------------------------
// Unified single-artwork detail view -- used by the "Yet to Evaluate" tab,
// by a clicked row in any of the Loved/Rejected/Save for Later/Skipped
// lists, and by a clicked tile in "All Artwork". Which of the two modes
// below renders depends only on whether this juror has already voted on
// this submission.

function renderSubmissionDetail(panelEl, submission, myVote, othersVotes, opts) {
  const artworkPaneHtml = renderArtworkPane(submission.image, submission.title);
  // "Yet to Evaluate" always gets the full 5-option evaluator, even when
  // this artwork already carries a Save-for-Later or Skip vote -- that's
  // exactly the case of revisiting it to make a final Love/Needs
  // Improvement call, not a quick state switch. The compact state-switch
  // view (4-icon row + edit comment) is only for an artwork opened from one
  // of the Loved/Rejected/Save for Later/Skipped list tabs or an "All
  // Artwork" tile, where by definition a vote already exists.
  if (myVote && opts.context !== 'pending') {
    renderStateSwitchDetail(panelEl, submission, myVote, othersVotes, opts, artworkPaneHtml);
  } else {
    renderFreshEvalDetail(panelEl, submission, othersVotes, opts, artworkPaneHtml, myVote);
  }
}

// Mode 1: the 5-option evaluation row (Love / Needs Improvement on row
// one, Save for later / Compare / Skip on row two) plus an always-visible,
// optional comments field -- pre-filled with any previous comment when
// revisiting a Saved-for-Later or Skipped artwork from the priority queue.
function renderFreshEvalDetail(panelEl, submission, othersVotes, opts, artworkPaneHtml, existingVote) {
  panelEl.innerHTML = `
    <div class="review-layout">
      <div class="artwork-pane">${artworkPaneHtml}</div>
      <div class="detail-pane">
        <h2 class="detail-pane__title">${escapeHtml(submission.title || 'Untitled')}</h2>
        <p class="detail-pane__meta">${escapeHtml(submission.discipline || '—')} · ${escapeHtml(submission.medium || '—')}</p>
        <div class="detail-pane__statement">${escapeHtml(submission.statement || 'No artist statement provided.')}</div>

        <div class="action-grid">
          <div class="action-grid__row">
            <button type="button" class="action-btn action-btn--love" id="loveBtn">
              <span class="action-btn__icon">${ICON_LOVE}</span>
              <span class="action-btn__caption">Love</span>
            </button>
            <button type="button" class="action-btn action-btn--reject" id="rejectBtn">
              <span class="action-btn__icon">${ICON_REJECT}</span>
              <span class="action-btn__caption">Needs Improvement</span>
            </button>
          </div>
          <div class="action-grid__row">
            <button type="button" class="action-btn action-btn--save_for_later" id="saveBtn">
              <span class="action-btn__icon">${ICON_SAVE}</span>
              <span class="action-btn__caption">Save for later</span>
            </button>
            <button type="button" class="action-btn action-btn--compare" id="compareBtn">
              <span class="action-btn__icon">${ICON_COMPARE}</span>
              <span class="action-btn__caption">Compare</span>
            </button>
            <button type="button" class="action-btn action-btn--skip" id="skipBtn">
              <span class="action-btn__icon">${ICON_SKIP}</span>
              <span class="action-btn__caption">Skip</span>
            </button>
          </div>
        </div>

        <div class="comment-box">
          <label for="commentInput">Comments (Optional)</label>
          <textarea id="commentInput" rows="3" placeholder="Anything you want the admin to know about this piece…">${escapeHtml((existingVote && existingVote.comment) || '')}</textarea>
        </div>
      </div>
    </div>
  `;

  wireArtworkZoom(submission);

  const commentInput = document.getElementById('commentInput');
  const loveBtn = document.getElementById('loveBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  const saveBtn = document.getElementById('saveBtn');
  const compareBtn = document.getElementById('compareBtn');
  const skipBtn = document.getElementById('skipBtn');

  loveBtn.addEventListener('click', () => castVoteFreshEval(panelEl, submission.id, 'love', commentInput.value));
  rejectBtn.addEventListener('click', () => castVoteFreshEval(panelEl, submission.id, 'reject', commentInput.value));
  saveBtn.addEventListener('click', () => castVoteFreshEval(panelEl, submission.id, 'save_for_later', commentInput.value));
  skipBtn.addEventListener('click', () => castVoteFreshEval(panelEl, submission.id, 'skip', commentInput.value));
  compareBtn.addEventListener('click', () => openCompareModal(submission));
}

async function castVoteFreshEval(panelEl, submissionId, vote, comment) {
  const buttons = panelEl.querySelectorAll('.action-btn');
  buttons.forEach((el) => { el.disabled = true; });
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId, vote, comment: comment || '' });
    if (!result || !result.ok) {
      panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not save your reaction. Please try again.')}</p>`);
      buttons.forEach((el) => { el.disabled = false; });
      return;
    }
    allArtworksCache = null; // this juror's vote state changed -- stale badges/filters otherwise
    await refreshStatus();
    // Whichever tab this was opened from, casting a fresh vote always
    // continues the normal priority queue on "Yet to Evaluate".
    setTabUI('pending');
    await loadPendingPanel();
  } catch (err) {
    panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(err.message || 'Could not save your reaction.')}</p>`);
    buttons.forEach((el) => { el.disabled = false; });
  }
}

// Mode 2: this artwork already has a vote -- show which state it's in,
// let the juror switch to any of the other three states via the same
// icon set used on the list rows, and let them edit their comment.
function renderStateSwitchDetail(panelEl, submission, myVote, othersVotes, opts, artworkPaneHtml) {
  const vote = myVote.vote;
  const meta = VOTE_META[vote] || { label: vote, verb: 'You reacted to this piece' };

  panelEl.innerHTML = `
    <div class="review-layout">
      <div class="artwork-pane">${artworkPaneHtml}</div>
      <div class="detail-pane">
        <h2 class="detail-pane__title">${escapeHtml(submission.title || 'Untitled')}</h2>
        <p class="detail-pane__meta">${escapeHtml(submission.discipline || '—')} · ${escapeHtml(submission.medium || '—')}</p>
        <div class="detail-pane__statement">${escapeHtml(submission.statement || 'No artist statement provided.')}</div>

        <div class="my-vote-banner my-vote-banner--${vote}">${escapeHtml(meta.verb)}${myVote.comment ? ' — comment saved' : ''}.</div>

        <div class="state-icon-row" id="stateIconRow">
          ${VOTE_ORDER.map((v) => `
            <button type="button" class="state-icon-btn${v === vote ? ' is-current is-current--' + v : ''}" data-vote="${v}" title="${escapeHtml(VOTE_META[v].label)}" ${v === vote ? 'disabled' : ''}>
              ${VOTE_META[v].icon}
            </button>
          `).join('')}
        </div>

        <div class="comment-box">
          <label for="commentEditInput">Comments (Optional)</label>
          <textarea id="commentEditInput" rows="3">${escapeHtml(myVote.comment || '')}</textarea>
          <button type="button" class="btn btn--secondary comment-box__save" id="saveCommentBtn">Save comment</button>
        </div>

        <h3 class="side-panel__heading" style="margin-top:20px">Other jurors</h3>
        <div id="othersVotesWrap">${renderOthersVotes(othersVotes)}</div>

        ${opts.context === 'pending'
          ? `<button type="button" class="btn btn--primary btn--block" id="continueBtn" style="margin-top:16px">Next artwork</button>`
          : `<button type="button" class="btn btn--secondary btn--block" id="backBtn" style="margin-top:16px">← Back to list</button>`}
      </div>
    </div>
  `;

  wireArtworkZoom(submission);

  document.querySelectorAll('#stateIconRow [data-vote]').forEach((btn) => {
    if (btn.disabled) return;
    btn.addEventListener('click', () => {
      const newVote = btn.dataset.vote;
      const commentEditInput = document.getElementById('commentEditInput');
      switchVoteState(panelEl, submission, newVote, commentEditInput.value, opts);
    });
  });

  const saveCommentBtn = document.getElementById('saveCommentBtn');
  saveCommentBtn.addEventListener('click', () => {
    const commentEditInput = document.getElementById('commentEditInput');
    switchVoteState(panelEl, submission, vote, commentEditInput.value, opts);
  });

  if (opts.context === 'pending') {
    const continueBtn = document.getElementById('continueBtn');
    continueBtn.addEventListener('click', loadPendingPanel);
  } else {
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', opts.onBack);
  }
}

async function switchVoteState(panelEl, submission, newVote, comment, opts) {
  panelEl.querySelectorAll('button').forEach((el) => { el.disabled = true; });
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId: submission.id, vote: newVote, comment: comment || '' });
    if (!result || !result.ok) {
      panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not save that change. Please try again.')}</p>`);
      panelEl.querySelectorAll('button').forEach((el) => { el.disabled = false; });
      return;
    }
    allArtworksCache = null;
    await refreshStatus();
    const fresh = await juryApiCall('jurorSubmission', { ...auth, id: submission.id });
    if (fresh && fresh.ok) {
      renderSubmissionDetail(panelEl, fresh.submission, fresh.myVote, fresh.othersVotes, opts);
    }
  } catch (err) {
    panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(err.message || 'Could not save that change.')}</p>`);
    panelEl.querySelectorAll('button').forEach((el) => { el.disabled = false; });
  }
}

// Opens a specific artwork no matter where it's coming from (a list row, an
// "All Artwork" tile, or a search/filter pick) and routes the juror to the
// right tab for it: untouched -> "Yet to Evaluate" to react to it fresh;
// already-voted -> whichever tab matches that vote, with this artwork open
// and "← Back to list" returning to that tab's normal list.
async function openArtworkFromAnywhere(id) {
  setTabUI('pending');
  tabs.pending.panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorSubmission', { ...auth, id });
    if (!result || !result.ok) {
      tabs.pending.panel.innerHTML = renderRetryState('Could not load this artwork. Please try again.', () => openArtworkFromAnywhere(id));
      return;
    }
    if (!result.myVote) {
      setTabUI('pending');
      refreshStatus();
      renderSubmissionDetail(tabs.pending.panel, result.submission, result.myVote, result.othersVotes, { context: 'pending' });
      return;
    }
    const key = VOTE_TO_TAB[result.myVote.vote] || 'skipped';
    setTabUI(key);
    refreshStatus();
    renderSubmissionDetail(tabs[key].panel, result.submission, result.myVote, result.othersVotes, { context: 'list', onBack: () => tabs[key].load() });
  } catch (err) {
    tabs.pending.panel.innerHTML = renderRetryState(err.message || 'Could not load this artwork.', () => openArtworkFromAnywhere(id));
  }
}

// ---------------------------------------------------------------------------
// "Yet to Evaluate" tab -- one artwork at a time, in priority order:
// untouched submissions first, then anything saved for later, then
// anything skipped. Once every eligible submission is Loved or marked
// Needs Improvement, there's nothing left to show.

async function loadPendingPanel() {
  tabs.pending.panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const [queueResult, review] = await Promise.all([
      juryApiCall('jurorQueue', { ...auth }),
      refreshStatus(),
    ]);
    if (!queueResult || !queueResult.ok) {
      tabs.pending.panel.innerHTML = renderRetryState('Could not load your review queue. Please try again.', loadPendingPanel);
      return;
    }
    if (queueResult.finalized) {
      tabs.pending.panel.innerHTML = '<p class="empty-state">Your votes are finalized. Ask an administrator to unlock your review if you need to make changes.</p>';
      return;
    }
    if (!review) {
      tabs.pending.panel.innerHTML = renderRetryState('Could not load your review queue. Please try again.', loadPendingPanel);
      return;
    }
    const nextId = computePriorityNextId(queueResult.order, review);
    if (!nextId) {
      tabs.pending.panel.innerHTML = '<p class="empty-state">You have reviewed all the artwork.</p>';
      return;
    }
    await loadPendingSubmission(nextId);
  } catch (err) {
    tabs.pending.panel.innerHTML = renderRetryState(err.message || 'Could not load your review queue.', loadPendingPanel);
  }
}

function computePriorityNextId(order, review) {
  const lovedIds = new Set(review.loved.map((i) => i.submissionId));
  const rejectedIds = new Set(review.rejected.map((i) => i.submissionId));
  const savedIds = new Set(review.savedForLater.map((i) => i.submissionId));
  const skippedIds = new Set(review.skipped.map((i) => i.submissionId));

  const untouched = order.find((id) => !lovedIds.has(id) && !rejectedIds.has(id) && !savedIds.has(id) && !skippedIds.has(id));
  if (untouched) return untouched;

  const savedForLater = order.find((id) => savedIds.has(id));
  if (savedForLater) return savedForLater;

  const skipped = order.find((id) => skippedIds.has(id));
  if (skipped) return skipped;

  return null;
}

async function loadPendingSubmission(id) {
  tabs.pending.panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorSubmission', { ...auth, id });
    if (!result || !result.ok) {
      tabs.pending.panel.innerHTML = renderRetryState('Could not load this artwork. Please try again.', () => loadPendingSubmission(id));
      return;
    }
    renderSubmissionDetail(tabs.pending.panel, result.submission, result.myVote, result.othersVotes, { context: 'pending' });
  } catch (err) {
    tabs.pending.panel.innerHTML = renderRetryState(err.message || 'Could not load this artwork.', () => loadPendingSubmission(id));
  }
}

// ---------------------------------------------------------------------------
// "Loved" / "Rejected" / "Save for Later" / "Skipped" tabs -- clickable
// lists of already-reviewed artwork, each row carrying its own 4-icon
// state switcher (no more "Move to X" buttons now that there are 4 states).

async function loadListPanel(key) {
  const panel = tabs[key].panel;
  panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorReview', { ...auth });
    if (!result || !result.ok) {
      panel.innerHTML = renderRetryState('Could not load this list. Please try again.', () => loadListPanel(key));
      return;
    }
    latestReview = result;
    renderTabCounts();
    renderStatusBar();
    const itemsByKey = { loved: result.loved, rejected: result.rejected, savedForLater: result.savedForLater, skipped: result.skipped };
    renderVoteList(key, panel, itemsByKey[key], result.finalized);
  } catch (err) {
    panel.innerHTML = renderRetryState(err.message || 'Could not load this list.', () => loadListPanel(key));
  }
}

function renderVoteList(key, container, items, finalized) {
  if (!items || !items.length) {
    container.innerHTML = '<p class="empty-state">Nothing here yet.</p>';
    return;
  }
  container.innerHTML = items
    .map((item) => {
      const image = item.image && item.image.type === 'image' ? item.image.url : '';
      return `
        <div class="review-item" data-submission="${escapeHtml(item.submissionId)}">
          ${image ? `<img src="${escapeHtml(image)}" alt="" class="review-item__thumb" />` : '<div class="review-item__thumb review-item__thumb--empty"></div>'}
          <div class="review-item__body">
            <span class="review-item__title">${escapeHtml(item.title || item.submissionId)}</span>
            ${item.comment ? `<span class="review-item__comment">“${escapeHtml(item.comment)}”</span>` : ''}
          </div>
          ${finalized ? '' : `
            <div class="review-item__states">
              ${VOTE_ORDER.map((v) => `
                <button type="button" class="review-item__state-btn${v === item.vote ? ' is-current is-current--' + v : ''}" data-vote="${v}" title="${escapeHtml(VOTE_META[v].label)}" ${v === item.vote ? 'disabled' : ''}>
                  ${VOTE_META[v].icon}
                </button>
              `).join('')}
            </div>
          `}
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('.review-item__thumb:not(.review-item__thumb--empty)').forEach((img) => {
    img.addEventListener('click', (event) => {
      event.stopPropagation();
      openZoom(img.src, img.alt);
    });
  });

  container.querySelectorAll('.review-item__state-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      if (btn.disabled) return;
      const row = btn.closest('[data-submission]');
      switchRowVoteState(key, row.dataset.submission, btn.dataset.vote);
    });
  });

  container.querySelectorAll('.review-item').forEach((row) => {
    row.addEventListener('click', () => openArtworkFromAnywhere(row.dataset.submission));
  });
}

async function switchRowVoteState(key, submissionId, newVote) {
  const current = ((latestReview && latestReview[key]) || []).find((i) => i.submissionId === submissionId);
  const comment = current ? current.comment : '';
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId, vote: newVote, comment });
    if (!result || !result.ok) return;
    allArtworksCache = null;
    await refreshStatus();
    tabs[key].load();
  } catch (err) {
    // leave the list as-is; the juror can just click the icon again
  }
}

// ---------------------------------------------------------------------------
// "All Artwork" tab -- every eligible submission as a tile, with a symbol
// for this juror's own state on each one, filterable by discipline,
// medium, and "my review".

let allArtworksCache = null;
let currentAllArtworks = [];
const allArtworkFilters = { discipline: '', medium: '', myTake: '' };

async function ensureAllArtworksLoaded(forceRefresh) {
  if (allArtworksCache && !forceRefresh) return allArtworksCache;
  const result = await juryApiCall('jurorAllArtworks', { ...auth });
  if (result && result.ok) {
    allArtworksCache = result.artworks;
  }
  return allArtworksCache || [];
}

async function loadAllArtworkPanel() {
  tabs.all.panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    currentAllArtworks = await ensureAllArtworksLoaded(true);
    renderAllArtworkPanel();
  } catch (err) {
    tabs.all.panel.innerHTML = renderRetryState(err.message || 'Could not load all artwork.', loadAllArtworkPanel);
  }
}

const MY_TAKE_OPTIONS = [
  { value: '', label: 'My review: all' },
  { value: 'none', label: 'Yet to evaluate' },
  { value: 'love', label: 'Loved' },
  { value: 'reject', label: 'Needs Improvement' },
  { value: 'save_for_later', label: 'Saved for Later' },
  { value: 'skip', label: 'Skipped' },
];

function renderAllArtworkPanel() {
  const disciplines = Array.from(new Set(currentAllArtworks.map((a) => a.discipline).filter(Boolean))).sort();
  const mediums = Array.from(new Set(currentAllArtworks.map((a) => a.medium).filter(Boolean))).sort();

  tabs.all.panel.innerHTML = `
    <div class="filter-bar">
      <select id="allFilterDiscipline">
        <option value="">Discipline: all</option>
        ${disciplines.map((d) => `<option value="${escapeHtml(d)}" ${allArtworkFilters.discipline === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
      </select>
      <select id="allFilterMedium">
        <option value="">Medium: all</option>
        ${mediums.map((m) => `<option value="${escapeHtml(m)}" ${allArtworkFilters.medium === m ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
      </select>
      <select id="allFilterMyTake">
        ${MY_TAKE_OPTIONS.map((o) => `<option value="${o.value}" ${allArtworkFilters.myTake === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>
    </div>
    <div class="all-artwork-grid" id="allArtworkGrid"></div>
  `;

  document.getElementById('allFilterDiscipline').addEventListener('change', (e) => { allArtworkFilters.discipline = e.target.value; renderAllArtworkGrid(); });
  document.getElementById('allFilterMedium').addEventListener('change', (e) => { allArtworkFilters.medium = e.target.value; renderAllArtworkGrid(); });
  document.getElementById('allFilterMyTake').addEventListener('change', (e) => { allArtworkFilters.myTake = e.target.value; renderAllArtworkGrid(); });

  renderAllArtworkGrid();
}

function renderAllArtworkGrid() {
  const grid = document.getElementById('allArtworkGrid');
  if (!grid) return;
  const filtered = currentAllArtworks.filter((a) => {
    if (allArtworkFilters.discipline && a.discipline !== allArtworkFilters.discipline) return false;
    if (allArtworkFilters.medium && a.medium !== allArtworkFilters.medium) return false;
    if (allArtworkFilters.myTake === 'none' && a.myVote) return false;
    if (allArtworkFilters.myTake && allArtworkFilters.myTake !== 'none' && a.myVote !== allArtworkFilters.myTake) return false;
    return true;
  });

  if (!filtered.length) {
    grid.innerHTML = '<p class="empty-state">No artwork matches these filters.</p>';
    return;
  }

  grid.innerHTML = filtered
    .map((a) => {
      const image = a.image && a.image.type === 'image' ? a.image.url : '';
      const badge = a.myVote ? `<span class="all-artwork-tile__badge all-artwork-tile__badge--${a.myVote}">${VOTE_META[a.myVote].icon}</span>` : '';
      return `
        <button type="button" class="all-artwork-tile" data-id="${escapeHtml(a.id)}">
          ${badge}
          ${image
            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(a.title || 'Artwork')}" class="all-artwork-tile__image" />`
            : `<div class="all-artwork-tile__image all-artwork-tile__image--empty">Image not available yet</div>`}
          <div class="all-artwork-tile__body">
            <p class="all-artwork-tile__title">${escapeHtml(a.title || 'Untitled')}</p>
            <p class="all-artwork-tile__meta">${escapeHtml(a.discipline || '—')} · ${escapeHtml(a.medium || '—')}</p>
          </div>
        </button>
      `;
    })
    .join('');

  grid.querySelectorAll('.all-artwork-tile').forEach((tile) => {
    tile.addEventListener('click', () => openArtworkFromAnywhere(tile.dataset.id));
  });
}

// ---------------------------------------------------------------------------
// Compare modal -- 2 to 4 artworks side by side. Opened only from the
// "Compare" option on a not-yet-evaluated artwork; the artwork it was
// opened from fills slot 1 and can't be removed.

let compareState = null;

function normalizeForCompare(item) {
  return {
    id: item.id,
    title: item.title,
    discipline: item.discipline,
    medium: item.medium,
    statement: item.statement,
    image: item.image,
    myVote: item.myVote || null,
  };
}

function openCompareModal(seedSubmission) {
  compareState = { mode: 'slots', slots: [normalizeForCompare(seedSubmission), null, null, null], pickingIndex: null, search: '', filters: { discipline: '', medium: '', myTake: '' } };
  compareOverlay.hidden = false;
  renderCompareModal();
}

function closeCompareModal() {
  compareOverlay.hidden = true;
  compareState = null;
}

compareCloseBtn.addEventListener('click', closeCompareModal);
compareOverlay.addEventListener('click', (event) => {
  if (event.target === compareOverlay) closeCompareModal();
});

function renderCompareModal() {
  if (!compareState) return;
  if (compareState.mode === 'picking') {
    renderComparePickerView();
  } else if (compareState.mode === 'comparing') {
    renderCompareFinalView();
  } else {
    renderCompareSlotsView();
  }
}

function renderCompareSlotsView() {
  const filledCount = compareState.slots.filter(Boolean).length;
  compareContent.innerHTML = `
    <h2 class="detail-pane__title" style="margin-bottom:4px">Compare artwork</h2>
    <p class="detail-pane__meta" style="margin-bottom:0">Pick 1 to 3 more artworks (up to 4 total) to see them side by side.</p>
    <div class="compare-slots" id="compareSlots"></div>
    <button type="button" class="btn btn--primary" id="compareGoBtn" ${filledCount >= 2 ? '' : 'disabled'}>Compare (${filledCount})</button>
  `;

  const slotsWrap = document.getElementById('compareSlots');
  slotsWrap.innerHTML = compareState.slots
    .map((slot, index) => {
      if (!slot) {
        return `
          <div class="compare-slot" data-index="${index}">
            <span class="compare-slot__add-icon">+</span>
            <span class="compare-slot__add-label">Add artwork</span>
          </div>
        `;
      }
      const image = slot.image && slot.image.type === 'image' ? slot.image.url : '';
      return `
        <div class="compare-slot compare-slot--filled" data-index="${index}">
          ${index > 0 ? `<button type="button" class="compare-slot__remove" data-remove="${index}" aria-label="Remove">&times;</button>` : ''}
          ${image ? `<img src="${escapeHtml(image)}" alt="" />` : `<div class="all-artwork-tile__image--empty">No image</div>`}
          <p class="compare-slot__title">${escapeHtml(slot.title || 'Untitled')}</p>
          <p class="compare-slot__meta">${escapeHtml(slot.discipline || '—')}</p>
        </div>
      `;
    })
    .join('');

  slotsWrap.querySelectorAll('.compare-slot').forEach((el) => {
    el.addEventListener('click', (event) => {
      if (event.target.closest('[data-remove]')) return;
      const index = Number(el.dataset.index);
      if (index === 0) return; // seed artwork can't be replaced
      openComparePicker(index);
    });
  });
  slotsWrap.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const index = Number(btn.dataset.remove);
      compareState.slots[index] = null;
      renderCompareSlotsView();
    });
  });

  document.getElementById('compareGoBtn').addEventListener('click', () => {
    compareState.mode = 'comparing';
    renderCompareModal();
  });
}

function openComparePicker(index) {
  compareState.mode = 'picking';
  compareState.pickingIndex = index;
  compareState.search = '';
  compareState.filters = { discipline: '', medium: '', myTake: '' };
  renderCompareModal();
}

async function renderComparePickerView() {
  compareContent.innerHTML = '<p class="empty-state">Loading…</p>';
  const all = await ensureAllArtworksLoaded();
  renderComparePickerList(all);
}

function renderComparePickerList(all) {
  const disciplines = Array.from(new Set(all.map((a) => a.discipline).filter(Boolean))).sort();
  const mediums = Array.from(new Set(all.map((a) => a.medium).filter(Boolean))).sort();
  const takenIds = new Set(compareState.slots.filter(Boolean).map((s) => s.id));

  compareContent.innerHTML = `
    <h2 class="detail-pane__title" style="margin-bottom:12px">Add artwork to compare</h2>
    <div class="filter-bar">
      <input type="text" id="comparePickerSearch" placeholder="Search by exact title…" value="${escapeHtml(compareState.search)}" />
      <select id="comparePickerDiscipline">
        <option value="">Discipline: all</option>
        ${disciplines.map((d) => `<option value="${escapeHtml(d)}" ${compareState.filters.discipline === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
      </select>
      <select id="comparePickerMedium">
        <option value="">Medium: all</option>
        ${mediums.map((m) => `<option value="${escapeHtml(m)}" ${compareState.filters.medium === m ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
      </select>
      <select id="comparePickerMyTake">
        ${MY_TAKE_OPTIONS.map((o) => `<option value="${o.value}" ${compareState.filters.myTake === o.value ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}
      </select>
    </div>
    <div class="compare-picker-list" id="comparePickerList"></div>
    <button type="button" class="btn btn--secondary" id="comparePickerBackBtn" style="margin-top:14px">← Back</button>
  `;

  const renderList = () => {
    const query = document.getElementById('comparePickerSearch').value.trim().toLowerCase();
    const matches = all.filter((a) => {
      if (takenIds.has(a.id)) return false;
      if (compareState.filters.discipline && a.discipline !== compareState.filters.discipline) return false;
      if (compareState.filters.medium && a.medium !== compareState.filters.medium) return false;
      if (compareState.filters.myTake === 'none' && a.myVote) return false;
      if (compareState.filters.myTake && compareState.filters.myTake !== 'none' && a.myVote !== compareState.filters.myTake) return false;
      if (query && (a.title || '').trim().toLowerCase() !== query) return false;
      return true;
    });
    const listEl = document.getElementById('comparePickerList');
    if (!matches.length) {
      listEl.innerHTML = '<p class="empty-state">No matching artwork.</p>';
      return;
    }
    listEl.innerHTML = matches
      .map((a) => {
        const image = a.image && a.image.type === 'image' ? a.image.url : '';
        return `
          <div class="compare-picker-row" data-id="${escapeHtml(a.id)}">
            ${image ? `<img src="${escapeHtml(image)}" alt="" />` : '<div class="compare-picker-row__thumb-empty" style="width:34px;height:42px;background:#1c1a15;border-radius:5px;flex-shrink:0"></div>'}
            <div>
              <div class="compare-picker-row__title">${escapeHtml(a.title || 'Untitled')}</div>
              <div class="compare-picker-row__meta">${escapeHtml(a.discipline || '—')} · ${escapeHtml(a.medium || '—')}</div>
            </div>
          </div>
        `;
      })
      .join('');
    listEl.querySelectorAll('.compare-picker-row').forEach((row) => {
      row.addEventListener('click', () => {
        const picked = all.find((a) => a.id === row.dataset.id);
        if (!picked) return;
        compareState.slots[compareState.pickingIndex] = normalizeForCompare(picked);
        compareState.mode = 'slots';
        renderCompareModal();
      });
    });
  };

  document.getElementById('comparePickerSearch').addEventListener('input', (e) => { compareState.search = e.target.value; renderList(); });
  document.getElementById('comparePickerDiscipline').addEventListener('change', (e) => { compareState.filters.discipline = e.target.value; renderList(); });
  document.getElementById('comparePickerMedium').addEventListener('change', (e) => { compareState.filters.medium = e.target.value; renderList(); });
  document.getElementById('comparePickerMyTake').addEventListener('change', (e) => { compareState.filters.myTake = e.target.value; renderList(); });
  document.getElementById('comparePickerBackBtn').addEventListener('click', () => { compareState.mode = 'slots'; renderCompareModal(); });

  renderList();
}

function renderCompareFinalView() {
  const items = compareState.slots.filter(Boolean);
  const layoutClass = items.length === 4 ? 'compare-view--quad' : 'compare-view--pair';
  compareContent.innerHTML = `
    <h2 class="detail-pane__title" style="margin-bottom:12px">Comparing ${items.length} artworks</h2>
    <div class="compare-view ${layoutClass}">
      ${items
        .map((a) => {
          const image = a.image && a.image.type === 'image' ? a.image.url : '';
          return `
            <div class="compare-view__item">
              ${image ? `<img src="${escapeHtml(image)}" alt="" />` : '<div class="all-artwork-tile__image--empty" style="height:220px;background:#1c1a15;border-radius:10px">No image</div>'}
              <h4>${escapeHtml(a.title || 'Untitled')}</h4>
              <p class="compare-view__meta">${escapeHtml(a.discipline || '—')} · ${escapeHtml(a.medium || '—')}</p>
              <p class="compare-view__statement">${escapeHtml(a.statement || 'No artist statement provided.')}</p>
            </div>
          `;
        })
        .join('')}
    </div>
    <button type="button" class="btn btn--secondary" id="compareBackToSlotsBtn" style="margin-top:16px">← Back to selection</button>
  `;
  document.getElementById('compareBackToSlotsBtn').addEventListener('click', () => { compareState.mode = 'slots'; renderCompareModal(); });
}

// ---------------------------------------------------------------------------
// Init

// setActiveTab() already calls refreshStatus() itself -- calling it again
// here first would just fire a second, redundant jurorReview request
// alongside the jurorQueue request setActiveTab triggers, adding avoidable
// concurrent load on the backend for no benefit.
if (auth) {
  setActiveTab('pending');
}
