// Shared Ground Jury App -- API helper.
//
// Backend lives in Supabase now (Postgres + a set of jury_* RPC functions,
// see jury-app/supabase/01_schema_and_functions.sql) instead of a Google
// Apps Script Web App. This file keeps the exact same exported shape it
// had before (juryApiCall(formType, extraParams), getStoredAuth/
// setStoredAuth/clearStoredAuth, requireAuth, escapeHtml) so login.js,
// juror.js and admin.js didn't need to change at all -- only what happens
// inside juryApiCall changed, from a JSONP <script> tag against Apps
// Script to a real fetch() against Supabase's REST API (which has proper
// CORS, so no JSONP trick is needed here).
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const STORAGE_KEY = 'sharedGroundAuth';

// Maps the old Apps Script "formType" names the rest of the app already
// uses to the Postgres function (see the .sql file) that replaces each
// one, and how to build that function's named parameters from the params
// object callers pass today.
const FORM_TYPE_MAP = {
  login: { fn: 'jury_login', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  jurorQueue: { fn: 'jury_queue', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  jurorSubmission: { fn: 'jury_submission', toParams: (p) => ({ p_username: p.username, p_password: p.password, p_id: p.id }) },
  jurorVote: { fn: 'jury_vote', toParams: (p) => ({ p_username: p.username, p_password: p.password, p_submission_id: p.submissionId, p_vote: p.vote, p_comment: p.comment ?? '' }) },
  jurorReview: { fn: 'jury_review', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  jurorAllArtworks: { fn: 'jury_all_artworks', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  jurorComments: { fn: 'jury_comments', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  jurorFinalize: { fn: 'jury_finalize', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  adminOverview: { fn: 'jury_admin_overview', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  adminSubmissions: { fn: 'jury_admin_submissions', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  adminSubmissionDetail: { fn: 'jury_admin_submission_detail', toParams: (p) => ({ p_username: p.username, p_password: p.password, p_id: p.id }) },
  adminResults: { fn: 'jury_admin_results', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  adminJurors: { fn: 'jury_admin_jurors', toParams: (p) => ({ p_username: p.username, p_password: p.password }) },
  adminJurorUnlock: { fn: 'jury_admin_juror_unlock', toParams: (p) => ({ p_username: p.username, p_password: p.password, p_id: p.id }) },
};

function isConfigured() {
  return SUPABASE_URL && !SUPABASE_URL.includes('PASTE_YOUR') && SUPABASE_ANON_KEY && !SUPABASE_ANON_KEY.includes('PASTE_YOUR');
}

async function juryApiCallOnce(formType, extraParams) {
  if (!isConfigured()) {
    throw new Error('Jury service is not configured.');
  }
  const mapping = FORM_TYPE_MAP[formType];
  if (!mapping) {
    throw new Error('Unknown request type.');
  }

  let res;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${mapping.fn}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(mapping.toParams(extraParams || {})),
    });
  } catch (err) {
    throw new Error('Could not reach the jury service.');
  }

  if (!res.ok) {
    throw new Error('Could not reach the jury service.');
  }
  return res.json();
}

function juryWait_(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Transparent retry for transient network blips: up to 3 attempts total
// with a short backoff. "not configured" is a permanent misconfiguration,
// not a network blip, so it fails immediately. `onRetry(nextAttempt,
// maxAttempts)` is called before each retry so a caller can show live
// "(attempt 2 of 3)" feedback.
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

// CSV export. Unlike the old Apps Script version, this can't just be a
// plain <a href> -- getting Supabase/PostgREST to return CSV instead of
// JSON requires an "Accept: text/csv" header, which a top-level browser
// navigation can't send. So this fetches the CSV text itself and triggers
// a normal file download via a throwaway <a download> click, which is the
// standard way to turn an in-memory string into a saved file.
export async function downloadAdminExportCsv(auth) {
  if (!isConfigured()) {
    throw new Error('Jury service is not configured.');
  }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/rpc/jury_admin_export_rows?p_username=${encodeURIComponent(auth.username)}&p_password=${encodeURIComponent(auth.password)}`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, Accept: 'text/csv' } }
  );
  if (!res.ok) {
    throw new Error('Could not export results.');
  }
  const csvText = await res.text();
  const blob = new Blob([csvText], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'shared-ground-results.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
