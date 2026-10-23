import { juryApiCall, requireAuth, clearStoredAuth, escapeHtml } from './api.js';
import { installExitGuard } from './exit-guard.js';

const auth = requireAuth('juror');
if (auth) installExitGuard();

const jurorNameEl = document.getElementById('jurorName');
const logoutBtn = document.getElementById('logoutBtn');
const statusBarWrap = document.getElementById('statusBarWrap');

const tabs = {
  pending: { btn: document.getElementById('tabBtnPending'), panel: document.getElementById('panelPending'), load: loadPendingPanel },
  loved: { btn: document.getElementById('tabBtnLoved'), panel: document.getElementById('panelLoved'), load: () => loadListPanel('loved') },
  rejected: { btn: document.getElementById('tabBtnRejected'), panel: document.getElementById('panelRejected'), load: () => loadListPanel('rejected') },
  savedForLater: { btn: document.getElementById('tabBtnSavedForLater'), panel: document.getElementById('panelSavedForLater'), load: () => loadListPanel('savedForLater') },
  all: { btn: document.getElementById('tabBtnAll'), panel: document.getElementById('panelAll'), load: loadAllArtworkPanel },
  comments: { btn: document.getElementById('tabBtnComments'), panel: document.getElementById('panelComments'), load: loadCommentsPanel },
};

const countPending = document.getElementById('countPending');
const countLoved = document.getElementById('countLoved');
const countRejected = document.getElementById('countRejected');
const countSavedForLater = document.getElementById('countSavedForLater');
const countAll = document.getElementById('countAll');
const countComments = document.getElementById('countComments');

const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');
const zoomCloseBtn = document.getElementById('zoomCloseBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

const compareOverlay = document.getElementById('compareOverlay');
const compareContent = document.getElementById('compareContent');
const compareCloseBtn = document.getElementById('compareCloseBtn');

const toastWrap = document.getElementById('toastWrap');

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
const ICON_COMPARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="16" rx="1.5"/><rect x="13" y="4" width="8" height="16" rx="1.5"/></svg>`;

// Solid/filled variants -- used only for the "All Artwork" tile badge, so a
// reviewed tile reads unmistakably at a glance (vs. the thin outline icons
// used everywhere else, which are easy to miss at tile size).
const ICON_LOVE_SOLID = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 20.5s-7.5-4.6-9.8-9.3C.6 7.8 2 4.5 5.4 3.8c2-.4 3.9.6 4.9 2.2.3.5.9.5 1.2 0 1-1.6 2.9-2.6 4.9-2.2 3.4.7 4.8 4 3.2 7.4-2.3 4.7-9.6 9.3-9.6 9.3z"/></svg>`;
const ICON_REJECT_SOLID = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const ICON_SAVE_SOLID = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V21l-6-4-6 4V3.75z"/></svg>`;

const VOTE_ORDER = ['love', 'reject', 'save_for_later'];
const VOTE_META = {
  love: { label: 'Shortlisted', icon: ICON_LOVE, badgeIcon: ICON_LOVE_SOLID, verb: 'You shortlisted this piece' },
  reject: { label: 'Rejected', icon: ICON_REJECT, badgeIcon: ICON_REJECT_SOLID, verb: 'You rejected this piece' },
  save_for_later: { label: 'Saved for Later', icon: ICON_SAVE, badgeIcon: ICON_SAVE_SOLID, verb: 'You saved this piece for later' },
};
const VOTE_TO_TAB = { love: 'loved', reject: 'rejected', save_for_later: 'savedForLater' };

// ---------------------------------------------------------------------------
// Toast -- a brief confirmation banner at the top of the screen, shown only
// when an artwork's vote state actually changes (never for a comment-only
// save). A single timer means a rapid second state change restarts the
// auto-dismiss clock instead of letting two toasts overlap or the first one
// vanish mid-read.

let toastTimeout = null;

function showToast(message) {
  if (!toastWrap) return;
  clearTimeout(toastTimeout);
  toastWrap.textContent = message;
  toastWrap.classList.add('is-visible');
  toastTimeout = setTimeout(() => {
    toastWrap.classList.remove('is-visible');
  }, 3200);
}

function showVoteToast(title, vote) {
  const meta = VOTE_META[vote];
  showToast(`${title || 'This artwork'} has been moved to ${meta ? meta.label : vote}`);
}

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
  // "Yet to Evaluate" always gets the full evaluator, even when this
  // artwork already carries a Save-for-Later vote -- that's exactly the
  // case of revisiting it to make a final Shortlist/Reject call, not a
  // quick state switch. The compact state-switch view (3-icon row + edit
  // comment) is only for an artwork opened from one of the Shortlisted/
  // Rejected/Save for Later list tabs, the Comments tab, or an "All
  // Artwork" tile, where by definition a vote already exists.
  if (myVote && opts.context !== 'pending') {
    renderStateSwitchDetail(panelEl, submission, myVote, othersVotes, opts, artworkPaneHtml);
  } else {
    renderFreshEvalDetail(panelEl, submission, othersVotes, opts, artworkPaneHtml, myVote);
  }
}

// Mode 1: the 3-option evaluation row (Shortlist / Reject / Save for
// later) plus a standalone Compare row below it, then an always-visible,
// always-optional comments field -- pre-filled with any previous comment
// when revisiting a Saved-for-Later artwork from the priority queue. This
// is the only place the artwork's submission id (e.g. "SG-R10") is shown,
// in bigger type right above the title -- it's not repeated on the All
// Artworks grid or the Shortlisted/Rejected/Saved for Later tabs.
function renderFreshEvalDetail(panelEl, submission, othersVotes, opts, artworkPaneHtml, existingVote) {
  panelEl.innerHTML = `
    <div class="review-layout">
      <div class="artwork-pane">${artworkPaneHtml}</div>
      <div class="detail-pane">
        <p class="detail-pane__id">${escapeHtml(submission.id || '')}</p>
        <h2 class="detail-pane__title">${escapeHtml(submission.title || 'Untitled')}</h2>
        <p class="detail-pane__meta">${escapeHtml(submission.discipline || '—')} · ${escapeHtml(submission.medium || '—')}${submission.dimensions ? ` · ${escapeHtml(submission.dimensions)}` : ''}</p>
        <div class="detail-pane__statement">${escapeHtml(submission.statement || 'No artist statement provided.')}</div>

        <div class="action-grid">
          <div class="action-grid__row action-grid__row--three">
            <button type="button" class="action-btn action-btn--love" id="loveBtn">
              <span class="action-btn__icon">${ICON_LOVE}</span>
              <span class="action-btn__caption">Shortlist</span>
            </button>
            <button type="button" class="action-btn action-btn--reject" id="rejectBtn">
              <span class="action-btn__icon">${ICON_REJECT}</span>
              <span class="action-btn__caption">Reject</span>
            </button>
            <button type="button" class="action-btn action-btn--save_for_later" id="saveBtn">
              <span class="action-btn__icon">${ICON_SAVE}</span>
              <span class="action-btn__caption">Save for later</span>
            </button>
          </div>
          <div class="action-grid__row action-grid__row--single">
            <button type="button" class="action-btn action-btn--compare" id="compareBtn">
              <span class="action-btn__icon">${ICON_COMPARE}</span>
              <span class="action-btn__caption">Compare</span>
            </button>
          </div>
        </div>

        <div class="comment-box">
          <label for="commentInput">Comments (optional)</label>
          <textarea id="commentInput" rows="3" placeholder="Any notes or comments on the artwork? Type here.">${escapeHtml((existingVote && existingVote.comment) || '')}</textarea>
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

  const attemptVote = (vote) => {
    castVoteFreshEval(panelEl, submission, vote, commentInput.value);
  };

  loveBtn.addEventListener('click', () => attemptVote('love'));
  rejectBtn.addEventListener('click', () => attemptVote('reject'));
  saveBtn.addEventListener('click', () => attemptVote('save_for_later'));
  compareBtn.addEventListener('click', () => openCompareModal(submission));
}

async function castVoteFreshEval(panelEl, submission, vote, comment) {
  const buttons = panelEl.querySelectorAll('.action-btn');
  buttons.forEach((el) => { el.disabled = true; });
  // Immediate feedback the instant a button is clicked -- without this, a
  // slow network retry or a backend error that takes a couple of seconds
  // to surface just looks like the click did nothing.
  showToast('Saving…');
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId: submission.id, vote, comment: comment || '' });
    if (!result || !result.ok) {
      const msg = (result && result.error) || 'Could not save your reaction. Please try again.';
      showToast(msg);
      panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(msg)}</p>`);
      buttons.forEach((el) => { el.disabled = false; });
      return;
    }
    allArtworksCache = null; // this juror's vote state changed -- stale badges/filters otherwise
    showVoteToast(submission.title, vote);
    await refreshStatus();
    // Whichever tab this was opened from, casting a fresh vote always
    // continues the normal priority queue on "Yet to Evaluate".
    setTabUI('pending');
    await loadPendingPanel();
  } catch (err) {
    const msg = err.message || 'Could not save your reaction.';
    showToast(msg);
    panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(msg)}</p>`);
    buttons.forEach((el) => { el.disabled = false; });
  }
}

// Mode 2: this artwork already has a vote -- show which state it's in,
// let the juror switch to any of the other two states via the same icon
// set used on the list rows, and let them edit their comment (always
// optional, on any vote state).
function renderStateSwitchDetail(panelEl, submission, myVote, othersVotes, opts, artworkPaneHtml) {
  const vote = myVote.vote;
  const meta = VOTE_META[vote] || { label: vote, verb: 'You reacted to this piece' };

  panelEl.innerHTML = `
    <div class="review-layout">
      <div class="artwork-pane">${artworkPaneHtml}</div>
      <div class="detail-pane">
        <h2 class="detail-pane__title">${escapeHtml(submission.title || 'Untitled')}</h2>
        <p class="detail-pane__meta">${escapeHtml(submission.discipline || '—')} · ${escapeHtml(submission.medium || '—')}${submission.dimensions ? ` · ${escapeHtml(submission.dimensions)}` : ''}</p>
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
          <label for="commentEditInput">Comments (optional)</label>
          <textarea id="commentEditInput" rows="3" placeholder="Any notes or comments on the artwork? Type here.">${escapeHtml(myVote.comment || '')}</textarea>
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
      switchVoteState(panelEl, submission, newVote, commentEditInput.value, opts, vote);
    });
  });

  const saveCommentBtn = document.getElementById('saveCommentBtn');
  saveCommentBtn.addEventListener('click', () => {
    const commentEditInput = document.getElementById('commentEditInput');
    switchVoteState(panelEl, submission, vote, commentEditInput.value, opts, vote);
  });

  if (opts.context === 'pending') {
    const continueBtn = document.getElementById('continueBtn');
    continueBtn.addEventListener('click', loadPendingPanel);
  } else {
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', opts.onBack);
  }
}

async function switchVoteState(panelEl, submission, newVote, comment, opts, oldVote) {
  panelEl.querySelectorAll('button').forEach((el) => { el.disabled = true; });
  showToast('Saving…');
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId: submission.id, vote: newVote, comment: comment || '' });
    if (!result || !result.ok) {
      const msg = (result && result.error) || 'Could not save that change. Please try again.';
      showToast(msg);
      panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(msg)}</p>`);
      panelEl.querySelectorAll('button').forEach((el) => { el.disabled = false; });
      return;
    }
    allArtworksCache = null;
    if (newVote !== oldVote) showVoteToast(submission.title, newVote);
    await refreshStatus();
    const fresh = await juryApiCall('jurorSubmission', { ...auth, id: submission.id });
    if (fresh && fresh.ok) {
      renderSubmissionDetail(panelEl, fresh.submission, fresh.myVote, fresh.othersVotes, opts);
    }
  } catch (err) {
    const msg = err.message || 'Could not save that change.';
    showToast(msg);
    panelEl.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(msg)}</p>`);
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
    const key = VOTE_TO_TAB[result.myVote.vote];
    if (!key) {
      // Defensive only -- the backend now filters any stale 'skip' vote
      // out of myVote entirely, so this shouldn't be reachable in
      // practice. Fall back to the fresh-evaluation view just in case.
      setTabUI('pending');
      refreshStatus();
      renderSubmissionDetail(tabs.pending.panel, result.submission, null, result.othersVotes, { context: 'pending' });
      return;
    }
    setTabUI(key);
    refreshStatus();
    renderSubmissionDetail(tabs[key].panel, result.submission, result.myVote, result.othersVotes, { context: 'list', onBack: () => tabs[key].load() });
  } catch (err) {
    tabs.pending.panel.innerHTML = renderRetryState(err.message || 'Could not load this artwork.', () => openArtworkFromAnywhere(id));
  }
}

// ---------------------------------------------------------------------------
// "Yet to Evaluate" tab -- one artwork at a time, in priority order:
// untouched submissions first, then anything saved for later. Once every
// eligible submission is Shortlisted or Rejected, there's nothing left to
// show.

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

  const untouched = order.find((id) => !lovedIds.has(id) && !rejectedIds.has(id) && !savedIds.has(id));
  if (untouched) return untouched;

  const savedForLater = order.find((id) => savedIds.has(id));
  if (savedForLater) return savedForLater;

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
// "Shortlisted" / "Rejected" / "Save for Later" tabs -- clickable lists of
// already-reviewed artwork, each row carrying its own 3-icon state switcher.

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
    const itemsByKey = { loved: result.loved, rejected: result.rejected, savedForLater: result.savedForLater };
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
  showToast('Saving…');
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId, vote: newVote, comment });
    if (!result || !result.ok) {
      // Previously swallowed silently here -- a failed quick-switch click
      // from a list row looked exactly like a click that did nothing at
      // all, with zero feedback either way.
      showToast((result && result.error) || 'Could not save that change. Please try again.');
      return;
    }
    allArtworksCache = null;
    showVoteToast(current ? current.title : '', newVote);
    await refreshStatus();
    tabs[key].load();
  } catch (err) {
    showToast(err.message || 'Could not save that change. Please try again.');
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
  { value: 'love', label: 'Shortlisted' },
  { value: 'reject', label: 'Rejected' },
  { value: 'save_for_later', label: 'Saved for Later' },
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
      const badge = a.myVote ? `<span class="all-artwork-tile__badge all-artwork-tile__badge--${a.myVote}">${VOTE_META[a.myVote].badgeIcon}</span>` : '';
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
    dimensions: item.dimensions,
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
              <p class="compare-view__meta">${escapeHtml(a.discipline || '—')} · ${escapeHtml(a.medium || '—')}${a.dimensions ? ` · ${escapeHtml(a.dimensions)}` : ''}</p>
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
// "Comments" tab -- every comment any juror has left, across every
// submission, newest first. Public to all jurors (not just the ones who
// wrote them). Clicking a comment opens that artwork through the normal
// openArtworkFromAnywhere() flow, so the current juror lands on whichever
// view fits their own relationship to it (fresh evaluator if they haven't
// voted, state-switch/edit-comment view if they have).

async function loadCommentsPanel() {
  const panel = tabs.comments.panel;
  panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorComments', { ...auth });
    if (!result || !result.ok) {
      panel.innerHTML = renderRetryState('Could not load comments. Please try again.', loadCommentsPanel);
      return;
    }
    countComments.textContent = result.comments.length;
    renderCommentsFeed(panel, result.comments);
  } catch (err) {
    panel.innerHTML = renderRetryState(err.message || 'Could not load comments.', loadCommentsPanel);
  }
}

function renderCommentsFeed(panel, comments) {
  if (!comments || !comments.length) {
    panel.innerHTML = '<p class="empty-state">No comments yet. Comments any juror leaves on an artwork will show up here.</p>';
    return;
  }
  panel.innerHTML = comments
    .map((c) => {
      const meta = VOTE_META[c.vote];
      const pillClass = meta ? `vote-pill--${c.vote}` : 'vote-pill--pending';
      const label = meta ? meta.label : c.vote;
      const when = c.updatedAt ? new Date(c.updatedAt).toLocaleString() : '';
      return `
        <div class="comment-feed-item" data-submission="${escapeHtml(c.submissionId)}">
          <div class="comment-feed-item__head">
            <span class="comment-feed-item__artwork">${escapeHtml(c.title || c.submissionId)}</span>
            <span class="vote-pill ${pillClass}">${escapeHtml(label)}</span>
          </div>
          <p class="comment-feed-item__text">“${escapeHtml(c.comment)}”</p>
          <div class="comment-feed-item__foot">
            <span>${escapeHtml(c.jurorName)}</span>
            ${when ? `<span>${escapeHtml(when)}</span>` : ''}
          </div>
        </div>
      `;
    })
    .join('');

  panel.querySelectorAll('.comment-feed-item').forEach((row) => {
    row.addEventListener('click', () => openArtworkFromAnywhere(row.dataset.submission));
  });
}

// ---------------------------------------------------------------------------
// Tutorial -- a 4-page walkthrough shown automatically each time a juror
// lands here. No backdrop-click or close button on purpose (see the "I
// understand" button on the last page) -- this is meant to be seen, not
// dismissed in passing. Pages 1-3 advance with "Next"; page 4 ("Comments")
// closes the modal with "I understand".

const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialContent = document.getElementById('tutorialContent');
let tutorialStep = 0;

const TUTORIAL_PAGES = [
  {
    render: () => `
      <p class="tutorial-card__eyebrow">1 of 4</p>
      <h2 class="detail-pane__title">What the buttons mean</h2>
      <div class="tutorial-buttons-demo">
        <div class="tutorial-buttons-demo__item">
          <span class="tutorial-buttons-demo__icon tutorial-buttons-demo__icon--love">${ICON_LOVE}</span>
          <div>
            <p class="tutorial-buttons-demo__label">Shortlist</p>
            <p class="tutorial-buttons-demo__desc">A strong yes -- this piece is in the running for the prize.</p>
          </div>
        </div>
        <div class="tutorial-buttons-demo__item">
          <span class="tutorial-buttons-demo__icon tutorial-buttons-demo__icon--reject">${ICON_REJECT}</span>
          <div>
            <p class="tutorial-buttons-demo__label">Reject</p>
            <p class="tutorial-buttons-demo__desc">A clear no -- this piece is out of the running.</p>
          </div>
        </div>
        <div class="tutorial-buttons-demo__item">
          <span class="tutorial-buttons-demo__icon tutorial-buttons-demo__icon--save">${ICON_SAVE}</span>
          <div>
            <p class="tutorial-buttons-demo__label">Save for later</p>
            <p class="tutorial-buttons-demo__desc">Not ready to decide yet -- come back to it before you finalize.</p>
          </div>
        </div>
      </div>
    `,
  },
  {
    render: () => `
      <p class="tutorial-card__eyebrow">2 of 4</p>
      <h2 class="detail-pane__title">Comparing artwork</h2>
      <p class="detail-pane__meta" style="margin-bottom:14px">Not sure between two pieces? Open "Compare" on any artwork to see it side by side with up to three others before you decide.</p>
      <img class="tutorial-gif" src="/assets/tutorial-compare-demo.gif" alt="Demonstration of comparing two artworks side by side" />
    `,
  },
  {
    render: () => `
      <p class="tutorial-card__eyebrow">3 of 4</p>
      <h2 class="detail-pane__title">Comments are always optional</h2>
      <p class="detail-pane__meta">You're never required to leave a comment on an artwork -- but if you do want to drop one, it's easiest to do it before you mark the piece, while it's right in front of you.</p>
      <p class="detail-pane__meta" style="margin-top:10px">You're never locked in, either way -- you can always come back and add or edit your comment on any artwork later, from its Shortlisted, Rejected, or Save for Later tab.</p>
    `,
  },
  {
    render: () => `
      <p class="tutorial-card__eyebrow">4 of 4</p>
      <h2 class="detail-pane__title">Comments tab</h2>
      <p class="detail-pane__meta">The Comments tab shows every comment any juror has left, on any artwork, newest first -- so you can see what your fellow jurors are noticing.</p>
      <p class="detail-pane__meta" style="margin-top:10px">Click any comment there to jump straight to that artwork, where you can change your own vote or add your own comment.</p>
    `,
  },
];

function renderTutorialStep() {
  const page = TUTORIAL_PAGES[tutorialStep];
  const isLast = tutorialStep === TUTORIAL_PAGES.length - 1;
  tutorialContent.innerHTML = `
    ${page.render()}
    <div class="tutorial-card__dots">
      ${TUTORIAL_PAGES.map((_, i) => `<span class="tutorial-card__dot${i === tutorialStep ? ' is-active' : ''}"></span>`).join('')}
    </div>
    <button type="button" class="btn btn--primary btn--block tutorial-card__next" id="tutorialNextBtn">${isLast ? 'I understand' : 'Next'}</button>
    ${isLast ? '' : '<button type="button" class="btn btn--text tutorial-card__skip" id="tutorialSkipBtn">Skip</button>'}
  `;
  document.getElementById('tutorialNextBtn').addEventListener('click', () => {
    if (isLast) {
      closeTutorial();
    } else {
      tutorialStep += 1;
      renderTutorialStep();
    }
  });
  const skipBtn = document.getElementById('tutorialSkipBtn');
  if (skipBtn) skipBtn.addEventListener('click', closeTutorial);
}

function openTutorial() {
  tutorialStep = 0;
  tutorialOverlay.hidden = false;
  renderTutorialStep();
}

function closeTutorial() {
  tutorialOverlay.hidden = true;
  tutorialContent.innerHTML = '';
}

// ---------------------------------------------------------------------------
// Init

// setActiveTab() already calls refreshStatus() itself -- calling it again
// here first would just fire a second, redundant jurorReview request
// alongside the jurorQueue request setActiveTab triggers, adding avoidable
// concurrent load on the backend for no benefit.
if (auth) {
  setActiveTab('pending');
  openTutorial();
}
