import { juryApiCall, requireAuth, clearStoredAuth, escapeHtml } from './api.js';

const auth = requireAuth('juror');

const jurorNameEl = document.getElementById('jurorName');
const logoutBtn = document.getElementById('logoutBtn');
const statusBarWrap = document.getElementById('statusBarWrap');

const tabs = {
  pending: { btn: document.getElementById('tabBtnPending'), panel: document.getElementById('panelPending'), load: loadPendingPanel },
  loved: { btn: document.getElementById('tabBtnLoved'), panel: document.getElementById('panelLoved'), load: () => loadListPanel('loved') },
  skipped: { btn: document.getElementById('tabBtnSkipped'), panel: document.getElementById('panelSkipped'), load: () => loadListPanel('skipped') },
};

const countPending = document.getElementById('countPending');
const countLoved = document.getElementById('countLoved');
const countSkipped = document.getElementById('countSkipped');

const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');
const zoomCloseBtn = document.getElementById('zoomCloseBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

if (auth) jurorNameEl.textContent = auth.name || auth.username;

logoutBtn.addEventListener('click', () => {
  clearStoredAuth();
  window.location.href = '/index.html';
});

// Icon markup -- simple inline SVGs so the action row doesn't depend on an
// icon font/library; stroke uses currentColor so hover/active states just
// recolor the button text.
const ICON_LOVE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.8-9.3C.6 7.8 2 4.5 5.4 3.8c2-.4 3.9.6 4.9 2.2.3.5.9.5 1.2 0 1-1.6 2.9-2.6 4.9-2.2 3.4.7 4.8 4 3.2 7.4-2.3 4.7-9.6 9.3-9.6 9.3z"/></svg>`;
const ICON_COMMENT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-1.2 4.4L21 20l-4.3-1.1a8.5 8.5 0 1 1 4.3-7.4z"/></svg>`;
const ICON_SKIP = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 5l9 7-9 7V5z"/><path d="M18 5v14"/></svg>`;

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
// Shared status (progress + finalize), kept in sync across all 3 tabs

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
  countSkipped.textContent = latestReview.skipped.length;
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

function setActiveTab(key) {
  Object.entries(tabs).forEach(([k, t]) => {
    t.btn.classList.toggle('is-active', k === key);
    t.panel.hidden = k !== key;
  });
  refreshStatus();
  tabs[key].load();
}

Object.entries(tabs).forEach(([key, t]) => {
  t.btn.addEventListener('click', () => setActiveTab(key));
});

// ---------------------------------------------------------------------------
// "Yet to Evaluate" tab -- one artwork at a time

const panelPending = document.getElementById('panelPending');

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

async function loadPendingPanel() {
  panelPending.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorQueue', { ...auth });
    if (!result || !result.ok) {
      panelPending.innerHTML = '<p class="empty-state">Could not load your review queue. Please try again.</p>';
      return;
    }
    if (result.finalized) {
      panelPending.innerHTML = '<p class="empty-state">Your votes are finalized. Ask an administrator to unlock your review if you need to make changes.</p>';
      return;
    }
    const completedSet = new Set(result.completed);
    const nextId = result.order.find((id) => !completedSet.has(id));
    if (!nextId) {
      panelPending.innerHTML = '<p class="empty-state">You’ve reviewed every artwork. Nice work — head to the Loved or Skipped tabs, or finalize your votes above.</p>';
      return;
    }
    await loadPendingSubmission(nextId);
  } catch (err) {
    panelPending.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load your review queue.')}</p>`;
  }
}

async function loadPendingSubmission(id) {
  panelPending.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorSubmission', { ...auth, id });
    if (!result || !result.ok) {
      panelPending.innerHTML = '<p class="empty-state">Could not load this artwork. Please try again.</p>';
      return;
    }
    renderPendingSubmission(result.submission, result.myVote, result.othersVotes);
  } catch (err) {
    panelPending.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load this artwork.')}</p>`;
  }
}

function renderPendingSubmission(submission, myVote, othersVotes) {
  const hasVoted = !!myVote;

  panelPending.innerHTML = `
    <div class="review-layout">
      <div class="artwork-pane">
        ${renderArtworkPane(submission.image, submission.title)}
      </div>
      <div class="detail-pane">
        <h2 class="detail-pane__title">${escapeHtml(submission.title || 'Untitled')}</h2>
        <p class="detail-pane__meta">${escapeHtml(submission.discipline || '—')} · ${escapeHtml(submission.medium || '—')}</p>
        <div class="detail-pane__statement">${escapeHtml(submission.statement || 'No artist statement provided.')}</div>

        ${hasVoted ? `
          <div class="my-vote-banner my-vote-banner--${myVote.vote}">You ${myVote.vote === 'love' ? 'loved' : 'skipped'} this piece${myVote.comment ? ' — comment saved' : ''}.</div>
          <h3 class="side-panel__heading">Other jurors</h3>
          <div id="othersVotesWrap">${renderOthersVotes(othersVotes)}</div>
          <button type="button" class="btn btn--primary btn--block" id="continueBtn" style="margin-top:16px">Next artwork</button>
        ` : `
          <div class="action-row">
            <button type="button" class="action-btn action-btn--love" id="loveBtn">
              <span class="action-btn__icon">${ICON_LOVE}</span>
              <span class="action-btn__caption">Love this piece</span>
            </button>
            <button type="button" class="action-btn action-btn--comment" id="commentToggleBtn">
              <span class="action-btn__icon">${ICON_COMMENT}</span>
              <span class="action-btn__caption">Add a comment</span>
            </button>
            <button type="button" class="action-btn action-btn--skip" id="skipBtn">
              <span class="action-btn__icon">${ICON_SKIP}</span>
              <span class="action-btn__caption">Skip to next</span>
            </button>
          </div>
          <div class="comment-box" id="commentBox" hidden>
            <label for="commentInput">Comment for the admin team (optional)</label>
            <textarea id="commentInput" rows="3" placeholder="Anything you want the admin to know about this piece…"></textarea>
          </div>
        `}
      </div>
    </div>
  `;

  const imageWrap = document.getElementById('artworkImageWrap');
  if (imageWrap && submission.image && submission.image.type === 'image') {
    imageWrap.addEventListener('click', () => openZoom(submission.image.url, submission.title));
  }

  if (hasVoted) {
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) continueBtn.addEventListener('click', loadPendingPanel);
    return;
  }

  const commentToggleBtn = document.getElementById('commentToggleBtn');
  const commentBox = document.getElementById('commentBox');
  const commentInput = document.getElementById('commentInput');
  commentToggleBtn.addEventListener('click', () => {
    const willShow = commentBox.hidden;
    commentBox.hidden = !willShow;
    commentToggleBtn.classList.toggle('is-active', willShow);
    if (willShow) commentInput.focus();
  });

  const loveBtn = document.getElementById('loveBtn');
  const skipBtn = document.getElementById('skipBtn');
  loveBtn.addEventListener('click', () => castVote(submission.id, 'love', commentInput.value));
  skipBtn.addEventListener('click', () => castVote(submission.id, 'skip', commentInput.value));
}

function renderOthersVotes(othersVotes) {
  if (!othersVotes || !othersVotes.length) {
    return '<p class="empty-state" style="padding:20px 0">No other jurors yet.</p>';
  }
  return othersVotes
    .map((o) => {
      const pillClass = o.vote === 'love' ? 'vote-pill--love' : o.vote === 'skip' ? 'vote-pill--skip' : 'vote-pill--pending';
      const label = o.vote === 'love' ? 'Loved' : o.vote === 'skip' ? 'Skipped' : 'Not yet reviewed';
      return `
        <div class="others-votes-row">
          <span>${escapeHtml(o.jurorName)}</span>
          <span class="vote-pill ${pillClass}">${label}</span>
        </div>
      `;
    })
    .join('');
}

async function castVote(submissionId, vote, comment) {
  const loveBtn = document.getElementById('loveBtn');
  const skipBtn = document.getElementById('skipBtn');
  const commentToggleBtn = document.getElementById('commentToggleBtn');
  [loveBtn, skipBtn, commentToggleBtn].forEach((el) => { if (el) el.disabled = true; });
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId, vote, comment: comment || '' });
    if (!result || !result.ok) {
      panelPending.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not save your reaction. Please try again.')}</p>`);
      [loveBtn, skipBtn, commentToggleBtn].forEach((el) => { if (el) el.disabled = false; });
      return;
    }
    await refreshStatus();
    // Re-render this same submission now that a vote exists, so the "other
    // jurors" panel reveals immediately without a round trip.
    await loadPendingSubmission(submissionId);
  } catch (err) {
    panelPending.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(err.message || 'Could not save your reaction.')}</p>`);
    [loveBtn, skipBtn, commentToggleBtn].forEach((el) => { if (el) el.disabled = false; });
  }
}

// ---------------------------------------------------------------------------
// "Loved" / "Skipped" tabs -- lists of already-reviewed artwork

async function loadListPanel(key) {
  const panel = tabs[key].panel;
  panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = latestReview && latestReview.ok ? latestReview : await juryApiCall('jurorReview', { ...auth });
    if (!result || !result.ok) {
      panel.innerHTML = '<p class="empty-state">Could not load this list. Please try again.</p>';
      return;
    }
    latestReview = result;
    renderTabCounts();
    renderStatusBar();
    const items = key === 'loved' ? result.loved : result.skipped;
    const moveTo = key === 'loved' ? 'skip' : 'love';
    renderVoteList(panel, items, moveTo, result.finalized);
  } catch (err) {
    panel.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load this list.')}</p>`;
  }
}

function renderVoteList(container, items, moveTo, finalized) {
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
          ${finalized ? '' : `<button type="button" class="btn btn--secondary review-item__move" data-move="${moveTo}">Move to ${moveTo === 'love' ? 'Loved' : 'Skipped'}</button>`}
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('.review-item__thumb:not(.review-item__thumb--empty)').forEach((img) => {
    img.addEventListener('click', () => openZoom(img.src, img.alt));
  });

  if (!finalized) {
    container.querySelectorAll('[data-move]').forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const row = event.target.closest('[data-submission]');
        const submissionId = row.dataset.submission;
        const vote = event.target.dataset.move;
        btn.disabled = true;
        try {
          await juryApiCall('jurorVote', { ...auth, submissionId, vote });
          await refreshStatus();
          const activeKey = Object.keys(tabs).find((k) => !tabs[k].panel.hidden);
          tabs[activeKey].load();
        } catch (err) {
          btn.disabled = false;
        }
      });
    });
  }
}

// ---------------------------------------------------------------------------
// Init

if (auth) {
  refreshStatus().then(() => setActiveTab('pending'));
}
