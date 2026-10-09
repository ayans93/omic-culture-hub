import { juryApiCall, requireAuth, clearStoredAuth, escapeHtml } from './api.js';

const auth = requireAuth('juror');

const jurorName = document.getElementById('jurorName');
const reviewVotesBtn = document.getElementById('reviewVotesBtn');
const logoutBtn = document.getElementById('logoutBtn');
const backToQueueBtn = document.getElementById('backToQueueBtn');

const queueScreen = document.getElementById('queueScreen');
const myVotesScreen = document.getElementById('myVotesScreen');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const queueContent = document.getElementById('queueContent');

const finalizeBannerWrap = document.getElementById('finalizeBannerWrap');
const keepList = document.getElementById('keepList');
const skipList = document.getElementById('skipList');

const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImage = document.getElementById('zoomImage');
const zoomCloseBtn = document.getElementById('zoomCloseBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');

if (auth) jurorName.textContent = auth.name || auth.username;

logoutBtn.addEventListener('click', () => {
  clearStoredAuth();
  window.location.href = '/index.html';
});

// ---------------------------------------------------------------------------
// Zoom overlay

let zoomScale = 1;

function openZoom(src, alt) {
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
// Screen switching

function showQueueScreen() {
  queueScreen.hidden = false;
  myVotesScreen.hidden = true;
  loadQueue();
}

function showMyVotesScreen() {
  queueScreen.hidden = true;
  myVotesScreen.hidden = false;
  loadMyVotes();
}

reviewVotesBtn.addEventListener('click', showMyVotesScreen);
backToQueueBtn.addEventListener('click', showQueueScreen);

// ---------------------------------------------------------------------------
// Queue / voting flow

async function loadQueue() {
  queueContent.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorQueue', { ...auth });
    if (!result || !result.ok) {
      queueContent.innerHTML = '<p class="empty-state">Could not load your review queue. Please try again.</p>';
      return;
    }
    const { order, completed, total, finalized } = result;
    const completedSet = new Set(completed);
    progressFill.style.width = total ? `${Math.round((completed.length / total) * 100)}%` : '0%';
    progressLabel.textContent = `${completed.length} of ${total} reviewed`;

    if (finalized || completed.length >= total) {
      // Nothing left to vote on (or votes are locked) -- go straight to the
      // review/finalize screen, same as the original prototype.
      showMyVotesScreen();
      return;
    }

    const nextId = order.find((id) => !completedSet.has(id));
    if (!nextId) {
      showMyVotesScreen();
      return;
    }
    await loadSubmission(nextId);
  } catch (err) {
    queueContent.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load your review queue.')}</p>`;
  }
}

async function loadSubmission(id) {
  queueContent.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('jurorSubmission', { ...auth, id });
    if (!result || !result.ok) {
      queueContent.innerHTML = '<p class="empty-state">Could not load this artwork. Please try again.</p>';
      return;
    }
    renderSubmission(result.submission, result.myVote, result.othersVotes);
  } catch (err) {
    queueContent.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load this artwork.')}</p>`;
  }
}

function renderSubmission(submission, myVote, othersVotes) {
  const image = submission.images && submission.images[0] ? submission.images[0] : '';
  const hasVoted = !!myVote;

  queueContent.innerHTML = `
    <div class="review-layout">
      <div class="artwork-card">
        <div class="artwork-image-wrap" id="artworkImageWrap">
          ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(submission.title || 'Artwork')}" />` : ''}
        </div>
        <div class="artwork-card__body">
          <h2 class="artwork-card__title">${escapeHtml(submission.title || 'Untitled')}</h2>
          <p class="artwork-card__meta">${escapeHtml(submission.medium || '—')} · ${escapeHtml(submission.dimensions || '—')} · ${escapeHtml(submission.year || '—')}</p>
          <p class="artwork-card__statement">${escapeHtml(submission.statement || '')}</p>
        </div>
        ${hasVoted ? '' : `
          <div class="vote-actions">
            <button type="button" class="btn btn--skip" id="skipBtn">Skip</button>
            <button type="button" class="btn btn--keep" id="keepBtn">Keep</button>
          </div>
        `}
      </div>
      <div class="side-panel">
        ${hasVoted ? `<div class="my-vote-banner my-vote-banner--${myVote.vote}">You voted: ${myVote.vote === 'keep' ? 'Keep' : 'Skip'}</div>` : ''}
        <h3>Other jurors</h3>
        <div id="othersVotesWrap">${renderOthersVotes(othersVotes, hasVoted)}</div>
        ${hasVoted ? '<button type="button" class="btn btn--primary btn--block" id="continueBtn" style="margin-top:16px">Continue</button>' : ''}
      </div>
    </div>
  `;

  const imageWrap = document.getElementById('artworkImageWrap');
  if (imageWrap && image) {
    imageWrap.addEventListener('click', () => openZoom(image, submission.title));
  }

  const skipBtn = document.getElementById('skipBtn');
  const keepBtn = document.getElementById('keepBtn');
  if (skipBtn) skipBtn.addEventListener('click', () => castVote(submission.id, 'skip'));
  if (keepBtn) keepBtn.addEventListener('click', () => castVote(submission.id, 'keep'));

  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) continueBtn.addEventListener('click', loadQueue);
}

function renderOthersVotes(othersVotes, revealed) {
  if (!revealed) {
    return '<p class="empty-state" style="padding:20px 0">Cast your vote to see how other jurors voted on this piece.</p>';
  }
  if (!othersVotes || !othersVotes.length) {
    return '<p class="empty-state" style="padding:20px 0">No other jurors yet.</p>';
  }
  return othersVotes
    .map((o) => {
      const pillClass = o.vote === 'keep' ? 'vote-pill--keep' : o.vote === 'skip' ? 'vote-pill--skip' : 'vote-pill--pending';
      const label = o.vote === 'keep' ? 'Keep' : o.vote === 'skip' ? 'Skip' : 'Not yet voted';
      return `
        <div class="others-votes-row">
          <span>${escapeHtml(o.jurorName)}</span>
          <span class="vote-pill ${pillClass}">${label}</span>
        </div>
      `;
    })
    .join('');
}

async function castVote(submissionId, vote) {
  const skipBtn = document.getElementById('skipBtn');
  const keepBtn = document.getElementById('keepBtn');
  if (skipBtn) skipBtn.disabled = true;
  if (keepBtn) keepBtn.disabled = true;
  try {
    const result = await juryApiCall('jurorVote', { ...auth, submissionId, vote });
    if (!result || !result.ok) {
      queueContent.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not save your vote. Please try again.')}</p>`);
      if (skipBtn) skipBtn.disabled = false;
      if (keepBtn) keepBtn.disabled = false;
      return;
    }
    // Re-render this same submission now that a vote exists, so the "other
    // jurors" panel reveals immediately without a round trip.
    await loadSubmission(submissionId);
  } catch (err) {
    queueContent.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(err.message || 'Could not save your vote.')}</p>`);
    if (skipBtn) skipBtn.disabled = false;
    if (keepBtn) keepBtn.disabled = false;
  }
}

// ---------------------------------------------------------------------------
// Review My Votes / Finalize

async function loadMyVotes() {
  finalizeBannerWrap.innerHTML = '';
  keepList.innerHTML = '<p class="empty-state">Loading…</p>';
  skipList.innerHTML = '';
  try {
    const result = await juryApiCall('jurorReview', { ...auth });
    if (!result || !result.ok) {
      keepList.innerHTML = '<p class="empty-state">Could not load your votes. Please try again.</p>';
      return;
    }
    renderFinalizeBanner(result);
    renderVoteList(keepList, result.keep, 'skip', result.finalized);
    renderVoteList(skipList, result.skip, 'keep', result.finalized);
  } catch (err) {
    keepList.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load your votes.')}</p>`;
  }
}

function renderFinalizeBanner(review) {
  if (review.finalized) {
    finalizeBannerWrap.innerHTML = `
      <div class="finalize-banner finalize-banner--locked">
        <p>Your votes are finalized${review.finalizedAt ? ` (${new Date(review.finalizedAt).toLocaleString()})` : ''}. Ask an administrator to unlock your review if you need to make changes.</p>
      </div>
    `;
    return;
  }
  const allDone = review.reviewsCompleted >= review.reviewsRequired;
  finalizeBannerWrap.innerHTML = `
    <div class="finalize-banner">
      <p>${review.reviewsCompleted} of ${review.reviewsRequired} artworks reviewed.${allDone ? ' Ready to finalize.' : ' Finish reviewing every artwork before finalizing.'}</p>
      <button type="button" class="btn btn--primary" id="finalizeBtn" ${allDone ? '' : 'disabled'}>Finalize My Votes</button>
    </div>
  `;
  const finalizeBtn = document.getElementById('finalizeBtn');
  if (finalizeBtn) finalizeBtn.addEventListener('click', finalizeVotes);
}

function renderVoteList(container, items, moveTo, finalized) {
  if (!items || !items.length) {
    container.innerHTML = '<p class="empty-state">Nothing here yet.</p>';
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
        <div class="review-item" data-submission="${escapeHtml(item.submissionId)}">
          ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" />` : ''}
          <span class="review-item__title">${escapeHtml(item.title || item.submissionId)}</span>
          ${finalized ? '' : `<button type="button" class="btn btn--secondary review-item__move" data-move="${moveTo}">Move to ${moveTo === 'keep' ? 'Keep' : 'Skip'}</button>`}
        </div>
      `
    )
    .join('');

  if (!finalized) {
    container.querySelectorAll('[data-move]').forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const row = event.target.closest('[data-submission]');
        const submissionId = row.dataset.submission;
        const vote = event.target.dataset.move;
        btn.disabled = true;
        try {
          await juryApiCall('jurorVote', { ...auth, submissionId, vote });
          await loadMyVotes();
        } catch (err) {
          btn.disabled = false;
        }
      });
    });
  }
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
      finalizeBannerWrap.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not finalize your votes.')}</p>`);
    }
  } catch (err) {
    finalizeBannerWrap.insertAdjacentHTML('beforeend', `<p class="empty-state">${escapeHtml(err.message || 'Could not finalize your votes.')}</p>`);
  }
  loadMyVotes();
}

// ---------------------------------------------------------------------------
// Init

if (auth) showQueueScreen();
