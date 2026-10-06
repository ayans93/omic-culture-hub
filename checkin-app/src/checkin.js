import { Html5Qrcode } from 'html5-qrcode';
import { CHECKIN_ENDPOINT } from './config.js';

const STORAGE_KEY = 'omicCheckinAuth';

// ---------------------------------------------------------------------------
// Apps Script JSONP helper (same convention as checkNewtonCapacity in
// main.js -- Apps Script Web App responses carry no CORS headers, so a
// <script> tag + callback is what lets us read a response at all).
function checkinApiCallOnce(formType, extraParams) {
  return new Promise((resolve, reject) => {
    if (!CHECKIN_ENDPOINT || CHECKIN_ENDPOINT.includes('PASTE_YOUR')) {
      reject(new Error('Check-in endpoint is not configured.'));
      return;
    }

    const callbackName = '__checkin' + formType + Date.now() + Math.floor(Math.random() * 1e6);
    const script = document.createElement('script');

    function cleanup() {
      delete window[callbackName];
      script.remove();
      clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Request timed out. Please check your connection and try again.'));
    }, 20000);

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('Could not reach the check-in service.'));
    };

    const params = new URLSearchParams({ formType, callback: callbackName, ...extraParams });
    script.src = CHECKIN_ENDPOINT + '?' + params.toString();
    document.body.appendChild(script);
  });
}

function checkinWait_(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Door venues routinely have patchy wifi/cellular -- a single dropped
// <script> load (script.onerror above) or a slow response (the 20s
// timeout above) shouldn't force the admin to manually retry every time.
// This transparently retries transient network failures up to twice more
// (3 attempts total, with a short backoff) before giving up and surfacing
// an error. "Endpoint not configured" is a permanent misconfiguration, not
// a network blip, so it fails immediately instead of retrying.
async function checkinApiCall(formType, extraParams, onRetry, attempt) {
  attempt = attempt || 1;
  const MAX_ATTEMPTS = 3;
  const startedAt = Date.now();
  try {
    const result = await checkinApiCallOnce(formType, extraParams);
    if (attempt > 1) {
      console.log(`[checkin] ${formType} succeeded on attempt ${attempt}/${MAX_ATTEMPTS} (${Date.now() - startedAt}ms)`);
    }
    return result;
  } catch (err) {
    console.log(`[checkin] ${formType} attempt ${attempt}/${MAX_ATTEMPTS} failed after ${Date.now() - startedAt}ms: ${(err && err.message) || err}`);
    const isPermanent = /not configured/i.test((err && err.message) || '');
    if (isPermanent || attempt >= MAX_ATTEMPTS) {
      throw err;
    }
    if (onRetry) onRetry(attempt + 1, MAX_ATTEMPTS);
    await checkinWait_(attempt * 700);
    return checkinApiCall(formType, extraParams, onRetry, attempt + 1);
  }
}

function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.email && parsed.password) return parsed;
  } catch (err) {
    // ignore malformed storage
  }
  return null;
}

function setStoredAuth(email, password) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ email, password }));
  } catch (err) {
    // ignore (e.g. private browsing storage restrictions) -- login still
    // works for this session, it just won't be remembered next time
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

let currentAuth = null; // { email, password }

// ---------------------------------------------------------------------------
// Elements

const loginView = document.getElementById('loginView');
const appView = document.getElementById('appView');
const logoutBtn = document.getElementById('logoutBtn');

const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loginSubmit = document.getElementById('loginSubmit');

const tabBtnScanner = document.getElementById('tabBtnScanner');
const tabBtnGuestList = document.getElementById('tabBtnGuestList');
const panelScanner = document.getElementById('panelScanner');
const panelGuestList = document.getElementById('panelGuestList');

const scannerIdle = document.getElementById('scannerIdle');
const openScannerBtn = document.getElementById('openScannerBtn');
const scannerCameraWrap = document.getElementById('scannerCameraWrap');
const scannerCameraStatus = document.getElementById('scannerCameraStatus');
const closeScannerBtn = document.getElementById('closeScannerBtn');
const scannerResult = document.getElementById('scannerResult');

const guestSearchForm = document.getElementById('guestSearchForm');
const guestSearchInput = document.getElementById('guestSearchInput');
const guestListStatus = document.getElementById('guestListStatus');
const guestListTableWrap = document.getElementById('guestListTableWrap');
const guestListTbody = document.getElementById('guestListTbody');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const markPresentBtn = document.getElementById('markPresentBtn');

const confirmMarkModal = document.getElementById('confirmMarkModal');
const confirmMarkText = document.getElementById('confirmMarkText');
const confirmMarkYes = document.getElementById('confirmMarkYes');
const confirmMarkBack = document.getElementById('confirmMarkBack');

// ---------------------------------------------------------------------------
// Login / session

function showLogin() {
  loginView.hidden = false;
  appView.hidden = true;
  logoutBtn.hidden = true;
}

function showApp() {
  loginView.hidden = true;
  appView.hidden = false;
  logoutBtn.hidden = false;
}

async function attemptLogin(email, password) {
  loginError.textContent = '';
  loginError.classList.remove('is-visible');
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Logging in…';

  try {
    const result = await checkinApiCall('checkinLogin', { email, password }, (nextAttempt, maxAttempts) => {
      // Lets the admin see that a retry is happening (vs. one long, silent
      // wait), so a slow login reads as "still working, retrying" instead
      // of "stuck" -- this was added specifically to help tell apart a
      // single slow-but-successful Apps Script call from several
      // fast-failing attempts in a row.
      loginSubmit.textContent = `Logging in… (attempt ${nextAttempt} of ${maxAttempts})`;
    });
    if (result && result.ok) {
      currentAuth = { email, password };
      setStoredAuth(email, password);
      showApp();
    } else {
      loginError.textContent = 'Incorrect email or password.';
      loginError.classList.add('is-visible');
    }
  } catch (err) {
    loginError.textContent = err.message || 'Something went wrong. Please try again.';
    loginError.classList.add('is-visible');
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Log In';
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  if (!email) {
    loginError.textContent = 'Please select your email.';
    loginError.classList.add('is-visible');
    return;
  }
  if (!password) {
    loginError.textContent = 'Please enter your password.';
    loginError.classList.add('is-visible');
    return;
  }
  attemptLogin(email, password);
});

logoutBtn.addEventListener('click', () => {
  currentAuth = null;
  clearStoredAuth();
  stopScanner();
  loginPassword.value = '';
  showLogin();
});

async function restoreSession() {
  const stored = getStoredAuth();
  if (!stored) {
    showLogin();
    return;
  }
  try {
    const result = await checkinApiCall('checkinLogin', stored);
    if (result && result.ok) {
      currentAuth = stored;
      loginEmail.value = stored.email;
      showApp();
      return;
    }
  } catch (err) {
    // Network hiccup on load -- fall back to asking the admin to log in
    // again rather than silently locking them out forever.
  }
  clearStoredAuth();
  showLogin();
}

// ---------------------------------------------------------------------------
// Tabs

function setActiveTab(tab) {
  const isScanner = tab === 'scanner';
  tabBtnScanner.classList.toggle('is-active', isScanner);
  tabBtnGuestList.classList.toggle('is-active', !isScanner);
  tabBtnScanner.setAttribute('aria-selected', String(isScanner));
  tabBtnGuestList.setAttribute('aria-selected', String(!isScanner));
  panelScanner.hidden = !isScanner;
  panelGuestList.hidden = isScanner;

  if (!isScanner) {
    // Leaving the scanner tab -- release the camera rather than leaving it
    // running in the background.
    stopScanner();
    scannerCameraWrap.hidden = true;
    scannerIdle.hidden = false;
    scannerResult.hidden = true;
  }
}

tabBtnScanner.addEventListener('click', () => setActiveTab('scanner'));
tabBtnGuestList.addEventListener('click', () => setActiveTab('guestlist'));

// ---------------------------------------------------------------------------
// Scanner tab

let html5QrCode = null;
let scanHandled = false;

function resetScannerToIdle() {
  scannerResult.hidden = true;
  scannerResult.innerHTML = '';
  scannerCameraWrap.hidden = true;
  scannerIdle.hidden = false;
}

async function stopScanner() {
  if (html5QrCode) {
    try {
      await html5QrCode.stop();
    } catch (err) {
      // already stopped / never started -- fine
    }
    try {
      html5QrCode.clear();
    } catch (err) {
      // ignore
    }
    html5QrCode = null;
  }
}

async function startScanner() {
  scanHandled = false;
  scannerIdle.hidden = true;
  scannerResult.hidden = true;
  scannerCameraWrap.hidden = false;
  scannerCameraStatus.textContent = "Point the camera at the guest's QR code";

  html5QrCode = new Html5Qrcode('scannerCameraView');
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      () => {
        // Per-frame "nothing decoded yet" callback -- expected constantly
        // while the guest lines their QR code up, nothing to do here.
      }
    );
  } catch (err) {
    scannerCameraStatus.textContent =
      'Could not access the camera. Please allow camera access and try again.';
  }
}

function onScanSuccess(decodedText) {
  if (scanHandled) return;
  scanHandled = true;
  const code = (decodedText || '').trim();
  stopScanner().then(() => {
    scannerCameraWrap.hidden = true;
    lookupBookingCode(code);
  });
}

openScannerBtn.addEventListener('click', startScanner);
closeScannerBtn.addEventListener('click', async () => {
  await stopScanner();
  resetScannerToIdle();
});

function guestDetailRows(guest) {
  return `
    <div class="checkin-detail-row"><span>Name</span><strong>${escapeHtml(guest.name || '—')}</strong></div>
    <div class="checkin-detail-row"><span>Email</span><strong>${escapeHtml(guest.email || '—')}</strong></div>
    <div class="checkin-detail-row"><span>Phone</span><strong>${escapeHtml(guest.phone || '—')}</strong></div>
    <div class="checkin-detail-row"><span>Status</span><strong>${escapeHtml(guest.status || '—')}</strong></div>
    <div class="checkin-detail-row"><span>User Type</span><strong>${escapeHtml(guest.userType || '—')}</strong></div>
    <div class="checkin-detail-row"><span>Number of Guests</span><strong>${escapeHtml(String(guest.guests || '—'))}</strong></div>
    <div class="checkin-detail-row"><span>Booking Code</span><strong>${escapeHtml(guest.bookingCode || '—')}</strong></div>
  `;
}

function renderMarkedPresent(guest) {
  scannerResult.innerHTML = `
    <div class="checkin-result-card checkin-result-card--success">
      <div class="checkin-result-icon" aria-hidden="true">&#10003;</div>
      <h2 class="checkin-result-title">User marked as present</h2>
      <div class="checkin-detail-list">${guestDetailRows(guest)}</div>
      <div class="checkin-result-actions">
        <button type="button" class="btn btn--secondary" id="resultHomeBtn">Home</button>
        <button type="button" class="btn btn--primary" id="resultScanNextBtn">Scan Next</button>
      </div>
    </div>
  `;
  wireResultActions();
}

function renderWaitlisted(guest) {
  scannerResult.innerHTML = `
    <div class="checkin-result-card checkin-result-card--waitlist">
      <div class="checkin-result-icon checkin-result-icon--waitlist" aria-hidden="true">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <h2 class="checkin-result-title">User is on waitlist</h2>
      <p class="checkin-result-desc">Please ask the guest to take a seat in the cafe until confirmed guests are seated.</p>
      <div class="checkin-detail-list">${guestDetailRows(guest)}</div>
      <div class="checkin-result-actions">
        <button type="button" class="btn btn--secondary" id="resultHomeBtn">Home</button>
        <button type="button" class="btn btn--primary" id="resultScanNextBtn">Scan Next</button>
      </div>
    </div>
  `;
  wireResultActions();
}

function renderAlreadyMarked(guest) {
  scannerResult.innerHTML = `
    <div class="checkin-result-card checkin-result-card--warn">
      <div class="checkin-result-icon checkin-result-icon--warn" aria-hidden="true">!</div>
      <h2 class="checkin-result-title">User already marked as present</h2>
      <div class="checkin-detail-list">${guestDetailRows(guest)}</div>
      <div class="checkin-result-actions">
        <button type="button" class="btn btn--secondary" id="resultHomeBtn">Home</button>
        <button type="button" class="btn btn--primary" id="resultScanNextBtn">Scan Next</button>
      </div>
    </div>
  `;
  wireResultActions();
}

function renderNotFound() {
  scannerResult.innerHTML = `
    <div class="checkin-result-card checkin-result-card--error">
      <div class="checkin-result-icon checkin-result-icon--error" aria-hidden="true">&times;</div>
      <h2 class="checkin-result-title">Could not validate QR</h2>
      <div class="checkin-result-actions">
        <button type="button" class="btn btn--secondary" id="resultHomeBtn">Home</button>
        <button type="button" class="btn btn--primary" id="resultTryAgainBtn">Try again</button>
      </div>
    </div>
  `;
  wireResultActions();
}

function renderLookupError(message) {
  scannerResult.innerHTML = `
    <div class="checkin-result-card checkin-result-card--error">
      <div class="checkin-result-icon checkin-result-icon--error" aria-hidden="true">&times;</div>
      <h2 class="checkin-result-title">Could not validate QR</h2>
      <p class="checkin-result-desc">${escapeHtml(message)}</p>
      <div class="checkin-result-actions">
        <button type="button" class="btn btn--secondary" id="resultHomeBtn">Home</button>
        <button type="button" class="btn btn--primary" id="resultTryAgainBtn">Try again</button>
      </div>
    </div>
  `;
  wireResultActions();
}

function wireResultActions() {
  const homeBtn = document.getElementById('resultHomeBtn');
  const tryAgainBtn = document.getElementById('resultTryAgainBtn');
  const scanNextBtn = document.getElementById('resultScanNextBtn');
  if (homeBtn) homeBtn.addEventListener('click', resetScannerToIdle);
  if (tryAgainBtn) tryAgainBtn.addEventListener('click', startScanner);
  if (scanNextBtn) scanNextBtn.addEventListener('click', startScanner);
}

async function lookupBookingCode(code) {
  scannerResult.hidden = false;
  scannerResult.innerHTML = '<p class="checkin-list-status">Checking…</p>';

  try {
    const result = await checkinApiCall('checkinLookup', { code, ...currentAuth });
    if (!result || !result.ok) {
      const message = result && result.error === 'busy_try_again'
        ? 'Another scan is being processed right now -- please try again in a moment.'
        : 'The check-in service could not process this scan.';
      renderLookupError(message);
      return;
    }
    if (!result.found) {
      renderNotFound();
      return;
    }
    if (result.alreadyMarked) {
      renderAlreadyMarked(result.guest);
    } else if (result.waitlisted) {
      renderWaitlisted(result.guest);
    } else {
      renderMarkedPresent(result.guest);
    }
  } catch (err) {
    renderLookupError(err.message || 'Could not reach the check-in service.');
  }
}

// ---------------------------------------------------------------------------
// Guest List tab

let allGuests = [];
let selectedRows = new Set();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function matchesQuery(guest, query) {
  if (!query) return true;
  const haystack = `${guest.name} ${guest.email} ${guest.phone}`.toLowerCase();
  return haystack.includes(query);
}

function renderGuestRows(guests) {
  selectedRows = new Set();
  markPresentBtn.disabled = true;
  selectAllCheckbox.checked = false;
  selectAllCheckbox.indeterminate = false;

  if (!guests.length) {
    guestListTableWrap.hidden = true;
    guestListStatus.hidden = false;
    guestListStatus.textContent = 'No guests matched your search.';
    return;
  }

  guestListStatus.hidden = true;
  guestListTableWrap.hidden = false;

  guestListTbody.innerHTML = guests
    .map((guest) => {
      const checkedInLabel = guest.checkedIn ? 'Checked in' : 'Yet to arrive';
      const checkedInClass = guest.checkedIn ? 'checkin-pill checkin-pill--in' : 'checkin-pill checkin-pill--out';
      return `
        <tr data-row="${guest.row}">
          <td class="checkin-table__check">
            <input type="checkbox" class="guest-row-checkbox" data-row="${guest.row}" ${guest.checkedIn ? 'disabled' : ''} />
          </td>
          <td>${escapeHtml(guest.name || '—')}</td>
          <td>${escapeHtml(guest.phone || '—')}</td>
          <td>${escapeHtml(guest.email || '—')}</td>
          <td>${escapeHtml(String(guest.guests || '—'))}</td>
          <td>${escapeHtml(guest.status || '—')}</td>
          <td>${escapeHtml(guest.userType || '—')}</td>
          <td><span class="${checkedInClass}">${checkedInLabel}</span></td>
        </tr>
      `;
    })
    .join('');

  guestListTbody.querySelectorAll('.guest-row-checkbox').forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const row = Number(checkbox.dataset.row);
      if (checkbox.checked) selectedRows.add(row);
      else selectedRows.delete(row);
      updateSelectAllState(guests);
      markPresentBtn.disabled = selectedRows.size === 0;
    });
  });
}

function updateSelectAllState(guests) {
  const selectable = guests.filter((g) => !g.checkedIn);
  const selectedCount = selectable.filter((g) => selectedRows.has(g.row)).length;
  selectAllCheckbox.checked = selectable.length > 0 && selectedCount === selectable.length;
  selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < selectable.length;
}

let currentFiltered = [];

async function runGuestSearch() {
  guestListStatus.hidden = false;
  guestListTableWrap.hidden = true;
  guestListStatus.textContent = 'Loading guests…';

  try {
    const result = await checkinApiCall('checkinList', { ...currentAuth });
    if (!result || !result.ok) {
      guestListStatus.textContent = 'Could not load the guest list. Please try again.';
      return;
    }
    allGuests = result.guests || [];
    const query = guestSearchInput.value.trim().toLowerCase();
    currentFiltered = allGuests.filter((guest) => matchesQuery(guest, query));
    renderGuestRows(currentFiltered);
  } catch (err) {
    guestListStatus.textContent = err.message || 'Could not load the guest list.';
  }
}

guestSearchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  runGuestSearch();
});

selectAllCheckbox.addEventListener('change', () => {
  const selectable = currentFiltered.filter((g) => !g.checkedIn);
  if (selectAllCheckbox.checked) {
    selectable.forEach((g) => selectedRows.add(g.row));
  } else {
    selectable.forEach((g) => selectedRows.delete(g.row));
  }
  guestListTbody.querySelectorAll('.guest-row-checkbox:not([disabled])').forEach((checkbox) => {
    checkbox.checked = selectAllCheckbox.checked;
  });
  markPresentBtn.disabled = selectedRows.size === 0;
});

markPresentBtn.addEventListener('click', () => {
  if (!selectedRows.size) return;
  confirmMarkText.textContent = `Please confirm if you want to mark all ${selectedRows.size} as Present.`;
  confirmMarkModal.hidden = false;
});

confirmMarkBack.addEventListener('click', () => {
  confirmMarkModal.hidden = true;
});

confirmMarkModal.addEventListener('click', (event) => {
  if (event.target === confirmMarkModal) confirmMarkModal.hidden = true;
});

confirmMarkYes.addEventListener('click', async () => {
  const rows = Array.from(selectedRows);
  confirmMarkYes.disabled = true;
  confirmMarkYes.textContent = 'Marking…';
  try {
    await checkinApiCall('checkinBulkMark', { rows: rows.join(','), ...currentAuth });
  } catch (err) {
    // fall through to refresh regardless -- re-searching will show the
    // true current state either way
  }
  confirmMarkYes.disabled = false;
  confirmMarkYes.textContent = 'Yes';
  confirmMarkModal.hidden = true;
  runGuestSearch();
});

// ---------------------------------------------------------------------------
// Init

restoreSession();
