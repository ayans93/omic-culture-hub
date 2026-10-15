import { juryApiCall, requireAuth, clearStoredAuth, escapeHtml, downloadAdminExportCsv } from './api.js';

const auth = requireAuth('admin');

// Shared label for a raw vote value ('love' / 'reject' / 'save_for_later' /
// 'skip') wherever the admin dashboard shows an individual juror's vote.
const VOTE_LABELS = { love: 'Loved', reject: 'Rejected', save_for_later: 'Saved for Later', skip: 'Skipped' };
function voteLabel(vote) {
  return VOTE_LABELS[vote] || '—';
}

const adminName = document.getElementById('adminName');
const logoutBtn = document.getElementById('logoutBtn');

const tabs = {
  overview: { btn: document.getElementById('tabBtnOverview'), panel: document.getElementById('panelOverview'), load: loadOverview },
  results: { btn: document.getElementById('tabBtnResults'), panel: document.getElementById('panelResults'), load: loadResults },
  submissions: { btn: document.getElementById('tabBtnSubmissions'), panel: document.getElementById('panelSubmissions'), load: loadSubmissions },
  jurors: { btn: document.getElementById('tabBtnJurors'), panel: document.getElementById('panelJurors'), load: loadJurors },
};

if (auth) {
  adminName.textContent = auth.name || auth.username;
  const exportBtn = document.getElementById('exportCsvLink');
  exportBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const original = exportBtn.textContent;
    exportBtn.textContent = 'Exporting…';
    const tieWrap = document.getElementById('tieBannerWrap');
    try {
      await downloadAdminExportCsv(auth);
    } catch (err) {
      if (tieWrap) tieWrap.insertAdjacentHTML('afterbegin', `<p class="empty-state">${escapeHtml(err.message || 'Could not export results.')}</p>`);
    } finally {
      exportBtn.textContent = original;
    }
  });
}

logoutBtn.addEventListener('click', () => {
  clearStoredAuth();
  window.location.href = '/index.html';
});

function setActiveTab(key) {
  Object.entries(tabs).forEach(([k, t]) => {
    t.btn.classList.toggle('is-active', k === key);
    t.panel.hidden = k !== key;
  });
  tabs[key].load();
}

Object.entries(tabs).forEach(([key, t]) => {
  t.btn.addEventListener('click', () => setActiveTab(key));
});

// ---------------------------------------------------------------------------
// Overview

async function loadOverview() {
  const panel = tabs.overview.panel;
  panel.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('adminOverview', { ...auth });
    if (!result || !result.ok) {
      panel.innerHTML = '<p class="empty-state">Could not load the overview. Please try again.</p>';
      return;
    }
    panel.innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><p class="stat-card__value">${result.totalSubmissions}</p><p class="stat-card__label">Submissions</p></div>
        <div class="stat-card"><p class="stat-card__value">${result.eligibleSubmissions}</p><p class="stat-card__label">Eligible</p></div>
        <div class="stat-card"><p class="stat-card__value">${result.jurorCount}</p><p class="stat-card__label">Jurors</p></div>
        <div class="stat-card"><p class="stat-card__value">${result.reviewsCompleted} / ${result.totalReviewsRequired}</p><p class="stat-card__label">Reviews completed</p></div>
        <div class="stat-card"><p class="stat-card__value">${result.percentComplete}%</p><p class="stat-card__label">Complete</p></div>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Juror</th><th>Progress</th><th>Status</th></tr></thead>
          <tbody>
            ${result.jurors
              .map(
                (j) => `
                  <tr>
                    <td data-label="Juror">${escapeHtml(j.name)}</td>
                    <td data-label="Progress">${j.completed} / ${j.required}</td>
                    <td data-label="Status">${j.finalized ? '<span class="pill pill--locked">Finalized</span>' : '<span class="pill pill--open">In progress</span>'}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    panel.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load the overview.')}</p>`;
  }
}

// ---------------------------------------------------------------------------
// Results & Top 20

async function loadResults() {
  const wrap = document.getElementById('resultsTableWrap');
  const tieWrap = document.getElementById('tieBannerWrap');
  wrap.innerHTML = '<p class="empty-state">Loading…</p>';
  tieWrap.innerHTML = '';
  try {
    const result = await juryApiCall('adminResults', { ...auth });
    if (!result || !result.ok) {
      wrap.innerHTML = '<p class="empty-state">Could not load results. Please try again.</p>';
      return;
    }
    const { ranked, unranked, jurors, tieFlag } = result;

    if (tieFlag) {
      tieWrap.innerHTML = `
        <div class="tie-banner">
          <strong>Tie at the Top 20 cutoff:</strong> ${tieFlag.submissionIds.length} submissions are tied at ${tieFlag.loveCount} Love votes
          spanning ranks ${Math.min(...tieFlag.ranks)}–${Math.max(...tieFlag.ranks)}. This needs a manual decision — it is not resolved automatically.
        </div>
      `;
    }

    const rows = [...ranked, ...unranked];
    const jurorCols = jurors.map((j) => `<th>${escapeHtml(j.name)}</th>`).join('');

    wrap.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Rank</th><th>ID</th><th>Title</th>${jurorCols}<th>Loved</th><th>Rejected</th><th>Saved for Later</th><th>Skipped</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((r) => {
                const inTop20 = r.rank && r.rank <= 20;
                const jurorCells = jurors
                  .map((j) => {
                    const v = r.byJuror[j.id];
                    return `<td data-label="${escapeHtml(j.name)}">${voteLabel(v)}</td>`;
                  })
                  .join('');
                return `
                  <tr class="${inTop20 ? 'is-top20' : ''}">
                    <td data-label="Rank">${r.rank || '—'}</td>
                    <td data-label="ID">${escapeHtml(r.id)}</td>
                    <td data-label="Title">${escapeHtml(r.title || '—')}</td>
                    ${jurorCells}
                    <td data-label="Loved">${r.loveCount}</td>
                    <td data-label="Rejected">${r.rejectCount}</td>
                    <td data-label="Saved for Later">${r.savedForLaterCount}</td>
                    <td data-label="Skipped">${r.skipCount}</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="empty-state" style="padding:8px 0;text-align:left">Highlighted rows are the current Top 20. A submission only appears ranked once every juror has voted on it. Ranking is by Love votes only.</p>
    `;
  } catch (err) {
    wrap.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load results.')}</p>`;
  }
}

// ---------------------------------------------------------------------------
// Submissions

async function loadSubmissions() {
  const wrap = document.getElementById('submissionsTableWrap');
  wrap.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('adminSubmissions', { ...auth });
    if (!result || !result.ok) {
      wrap.innerHTML = '<p class="empty-state">Could not load submissions. Please try again.</p>';
      return;
    }
    wrap.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Artist</th><th>Title</th><th>Medium</th><th>Year</th><th>Eligible</th><th>Reviews</th><th>Loved</th><th>Rejected</th><th>Saved for Later</th><th>Skipped</th><th>Comments</th><th>Rank</th></tr>
          </thead>
          <tbody>
            ${result.submissions
              .map(
                (s) => `
                  <tr class="${s.inTop20 ? 'is-top20' : ''} submission-row" data-id="${escapeHtml(s.id)}">
                    <td data-label="ID">${escapeHtml(s.id)}</td>
                    <td data-label="Artist">${escapeHtml(s.artistName || '—')}</td>
                    <td data-label="Title">${escapeHtml(s.title || '—')}</td>
                    <td data-label="Medium">${escapeHtml(s.medium || '—')}</td>
                    <td data-label="Year">${escapeHtml(s.year || '—')}</td>
                    <td data-label="Eligible">${s.eligible ? 'Yes' : 'No'}</td>
                    <td data-label="Reviews">${s.reviewsCompleted}</td>
                    <td data-label="Loved">${s.loveCount}</td>
                    <td data-label="Rejected">${s.rejectCount}</td>
                    <td data-label="Saved for Later">${s.savedForLaterCount}</td>
                    <td data-label="Skipped">${s.skipCount}</td>
                    <td data-label="Comments">${s.commentCount > 0 ? `<span class="pill pill--open">${s.commentCount}</span>` : '—'}</td>
                    <td data-label="Rank">${s.rank || '—'}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="empty-state" style="padding:8px 0;text-align:left">Click any row to see the full artwork, its votes, and any juror comments. To add or change submissions, edit the Submissions tab in the Jury Sheet directly.</p>
    `;
    wrap.querySelectorAll('.submission-row').forEach((row) => {
      row.addEventListener('click', () => openSubmissionModal(row.dataset.id));
    });
  } catch (err) {
    wrap.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load submissions.')}</p>`;
  }
}

// ---------------------------------------------------------------------------
// Submission detail modal

const submissionModal = document.getElementById('submissionModal');
const submissionModalContent = document.getElementById('submissionModalContent');
const submissionModalCloseBtn = document.getElementById('submissionModalCloseBtn');

function closeSubmissionModal() {
  submissionModal.hidden = true;
  submissionModalContent.innerHTML = '';
}
submissionModalCloseBtn.addEventListener('click', closeSubmissionModal);
submissionModal.addEventListener('click', (event) => {
  if (event.target === submissionModal) closeSubmissionModal();
});

async function openSubmissionModal(id) {
  submissionModal.hidden = false;
  submissionModalContent.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('adminSubmissionDetail', { ...auth, id });
    if (!result || !result.ok) {
      submissionModalContent.innerHTML = `<p class="empty-state">${escapeHtml((result && result.error) || 'Could not load this submission.')}</p>`;
      return;
    }
    const { submission, votes } = result;
    const image = submission.image;
    const imageHtml = image
      ? (image.type === 'image'
          ? `<img src="${escapeHtml(image.url)}" alt="${escapeHtml(submission.title || '')}" class="modal-card__image" />`
          : `<a href="${escapeHtml(image.url)}" target="_blank" rel="noopener" class="artwork-file-link">Open submission file</a>`)
      : '<div class="artwork-image-wrap artwork-image-wrap--empty"><p>Image not available yet</p></div>';

    submissionModalContent.innerHTML = `
      ${imageHtml}
      <h2 class="detail-pane__title">${escapeHtml(submission.title || 'Untitled')}</h2>
      <p class="detail-pane__meta">${escapeHtml(submission.discipline || '—')} · ${escapeHtml(submission.medium || '—')} · ${escapeHtml(submission.dimensions || '—')} · ${escapeHtml(submission.year || '—')}</p>
      <p class="detail-pane__meta">Artist: ${escapeHtml(submission.artistName || '—')} &nbsp;·&nbsp; ${escapeHtml(submission.mobile || '—')} &nbsp;·&nbsp; ${escapeHtml(submission.email || '—')}</p>
      <div class="detail-pane__statement">${escapeHtml(submission.statement || 'No artist statement provided.')}</div>
      <h3 class="side-panel__heading" style="margin-top:20px">Juror votes &amp; comments</h3>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead><tr><th>Juror</th><th>Vote</th><th>Comment</th></tr></thead>
          <tbody>
            ${votes
              .map(
                (v) => `
                  <tr>
                    <td data-label="Juror">${escapeHtml(v.jurorName)}</td>
                    <td data-label="Vote">${voteLabel(v.vote)}</td>
                    <td data-label="Comment">${v.comment ? escapeHtml(v.comment) : '—'}</td>
                  </tr>
                `
              )
              .join('') || '<tr><td colspan="3" data-label="">No votes yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    submissionModalContent.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load this submission.')}</p>`;
  }
}

// ---------------------------------------------------------------------------
// Jurors

async function loadJurors() {
  const wrap = document.getElementById('jurorsTableWrap');
  wrap.innerHTML = '<p class="empty-state">Loading…</p>';
  try {
    const result = await juryApiCall('adminJurors', { ...auth });
    if (!result || !result.ok) {
      wrap.innerHTML = '<p class="empty-state">Could not load jurors. Please try again.</p>';
      return;
    }
    wrap.innerHTML = `
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Name</th><th>Username</th><th>Progress</th><th>Loved</th><th>Rejected</th><th>Saved for Later</th><th>Skipped</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            ${result.jurors
              .map(
                (j) => `
                  <tr data-juror="${escapeHtml(j.id)}">
                    <td data-label="Name">${escapeHtml(j.name)}</td>
                    <td data-label="Username">${escapeHtml(j.username)}</td>
                    <td data-label="Progress">${j.reviewsCompleted} / ${j.reviewsRequired}</td>
                    <td data-label="Loved">${j.loveCount}</td>
                    <td data-label="Rejected">${j.rejectCount}</td>
                    <td data-label="Saved for Later">${j.savedForLaterCount}</td>
                    <td data-label="Skipped">${j.skipCount}</td>
                    <td data-label="Status">${j.finalized ? '<span class="pill pill--locked">Finalized</span>' : '<span class="pill pill--open">In progress</span>'}</td>
                    <td data-label="">${j.finalized ? '<button type="button" class="btn btn--secondary unlock-btn">Unlock</button>' : ''}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;
    wrap.querySelectorAll('.unlock-btn').forEach((btn) => {
      btn.addEventListener('click', async (event) => {
        const row = event.target.closest('[data-juror]');
        const id = row.dataset.juror;
        btn.disabled = true;
        btn.textContent = 'Unlocking…';
        try {
          await juryApiCall('adminJurorUnlock', { ...auth, id });
        } catch (err) {
          // fall through to refresh regardless -- re-loading shows the true state
        }
        loadJurors();
      });
    });
  } catch (err) {
    wrap.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load jurors.')}</p>`;
  }
}

// ---------------------------------------------------------------------------
// Init

if (auth) loadOverview();
