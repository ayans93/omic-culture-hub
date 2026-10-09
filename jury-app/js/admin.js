import { juryApiCall, requireAuth, clearStoredAuth, escapeHtml, buildExportUrl } from './api.js';

const auth = requireAuth('admin');

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
  document.getElementById('exportCsvLink').href = buildExportUrl(auth);
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
          <strong>Tie at the Top 20 cutoff:</strong> ${tieFlag.submissionIds.length} submissions are tied at ${tieFlag.keepCount} Keep votes
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
              <th>Rank</th><th>ID</th><th>Title</th>${jurorCols}<th>Keep</th><th>Skip</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((r) => {
                const inTop20 = r.rank && r.rank <= 20;
                const jurorCells = jurors
                  .map((j) => {
                    const v = r.byJuror[j.id];
                    const label = v === 'keep' ? 'Keep' : v === 'skip' ? 'Skip' : '—';
                    return `<td data-label="${escapeHtml(j.name)}">${label}</td>`;
                  })
                  .join('');
                return `
                  <tr class="${inTop20 ? 'is-top20' : ''}">
                    <td data-label="Rank">${r.rank || '—'}</td>
                    <td data-label="ID">${escapeHtml(r.id)}</td>
                    <td data-label="Title">${escapeHtml(r.title || '—')}</td>
                    ${jurorCells}
                    <td data-label="Keep">${r.keepCount}</td>
                    <td data-label="Skip">${r.skipCount}</td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="empty-state" style="padding:8px 0;text-align:left">Highlighted rows are the current Top 20. A submission only appears ranked once every juror has voted on it.</p>
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
            <tr><th>ID</th><th>Artist</th><th>Title</th><th>Medium</th><th>Year</th><th>Eligible</th><th>Reviews</th><th>Keep</th><th>Skip</th><th>Rank</th></tr>
          </thead>
          <tbody>
            ${result.submissions
              .map(
                (s) => `
                  <tr class="${s.inTop20 ? 'is-top20' : ''}">
                    <td data-label="ID">${escapeHtml(s.id)}</td>
                    <td data-label="Artist">${escapeHtml(s.artistName || '—')}</td>
                    <td data-label="Title">${escapeHtml(s.title || '—')}</td>
                    <td data-label="Medium">${escapeHtml(s.medium || '—')}</td>
                    <td data-label="Year">${escapeHtml(s.year || '—')}</td>
                    <td data-label="Eligible">${s.eligible ? 'Yes' : 'No'}</td>
                    <td data-label="Reviews">${s.reviewsCompleted}</td>
                    <td data-label="Keep">${s.keepCount}</td>
                    <td data-label="Skip">${s.skipCount}</td>
                    <td data-label="Rank">${s.rank || '—'}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <p class="empty-state" style="padding:8px 0;text-align:left">To add or change submissions, edit the Submissions tab in the Jury Sheet directly.</p>
    `;
  } catch (err) {
    wrap.innerHTML = `<p class="empty-state">${escapeHtml(err.message || 'Could not load submissions.')}</p>`;
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
            <tr><th>Name</th><th>Username</th><th>Progress</th><th>Keep</th><th>Skip</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            ${result.jurors
              .map(
                (j) => `
                  <tr data-juror="${escapeHtml(j.id)}">
                    <td data-label="Name">${escapeHtml(j.name)}</td>
                    <td data-label="Username">${escapeHtml(j.username)}</td>
                    <td data-label="Progress">${j.reviewsCompleted} / ${j.reviewsRequired}</td>
                    <td data-label="Keep">${j.keepCount}</td>
                    <td data-label="Skip">${j.skipCount}</td>
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
