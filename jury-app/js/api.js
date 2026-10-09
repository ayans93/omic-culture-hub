// Shared Ground Jury App -- API helper.
//
// Apps Script Web App responses carry no CORS headers, so a plain
// cross-origin fetch() can't read them. This uses the same JSONP pattern
// as the door check-in app: a <script src="...?callback=..."> tag whose
// response body calls back into the page.
import { JURY_ENDPOINT } from './config.js';

const STORAGE_KEY = 'sharedGroundAuth';

function juryApiCallOnce(formType, extraParams) {
  return new Promise((resolve, reject) => {
    if (!JURY_ENDPOINT || JURY_ENDPOINT.includes('PASTE_YOUR')) {
      reject(new Error('Jury endpoint is not configured.'));
      return;
    }

    const callbackName = '__jury' + formType + Date.now() + Math.floor(Math.random() * 1e6);
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
      reject(new Error('Could not reach the jury service.'));
    };

    const params = new URLSearchParams({ formType, callback: callbackName, ...extraParams });
    script.src = JURY_ENDPOINT + '?' + params.toString();
    document.body.appendChild(script);
  });
}

function juryWait_(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Transparent retry for transient network blips (a dropped <script> load or
// a slow response), same pattern proven in the door check-in app: up to 3
// attempts total with a short backoff. "Endpoint not configured" is a
// permanent misconfiguration, not a network blip, so it fails immediately.
// `onRetry(nextAttempt, maxAttempts)` is called before each retry so a
// caller can show live "(attempt 2 of 3)" feedback.
export async function juryApiCall(formType, extraParams, onRetry, attempt) {
  attempt = attempt || 1;
  const MAX_ATTEMPTS = 3;
  try {
    return await juryApiCallOnce(formType, extraParams);
  } catch (err) {
    const isPermanent = /not configured/i.test((err && err.message) || '');
    if (isPermanent || attempt >= MAX_ATTEMPTS) {
      throw err;
    }
    if (onRetry) onRetry(attempt + 1, MAX_ATTEMPTS);
    await juryWait_(attempt * 700);
    return juryApiCall(formType, extraParams, onRetry, attempt + 1);
  }
}

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.username && parsed.password) return parsed;
  } catch (err) {
    // ignore malformed storage
  }
  return null;
}

export function setStoredAuth(username, password, role, name) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password, role, name }));
  } catch (err) {
    // ignore (e.g. private browsing storage restrictions) -- login still
    // works for this session, it just won't be remembered next time
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

// Sends every juror/admin back to the login screen if they land on
// juror.html / admin.html without a stored session (typed URL, bookmark,
// expired localStorage, etc.) -- call at the top of those pages.
export function requireAuth(requiredRole) {
  const auth = getStoredAuth();
  if (!auth || (requiredRole && auth.role !== requiredRole)) {
    window.location.href = '/index.html';
    return null;
  }
  return auth;
}

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Builds the direct (non-JSONP) Apps Script URL for the admin CSV export
// link -- meant to be opened in a new tab, not fetched.
export function buildExportUrl(auth) {
  const params = new URLSearchParams({ formType: 'adminExportCsv', username: auth.username, password: auth.password });
  return JURY_ENDPOINT + '?' + params.toString();
}
