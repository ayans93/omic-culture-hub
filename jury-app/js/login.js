import { juryApiCall, getStoredAuth, setStoredAuth } from './api.js';

const loginForm = document.getElementById('loginForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loginSubmit = document.getElementById('loginSubmit');

function showError(message) {
  loginError.textContent = message;
  loginError.classList.add('is-visible');
}

async function attemptLogin(username, password) {
  loginError.textContent = '';
  loginError.classList.remove('is-visible');
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Signing in…';

  try {
    const result = await juryApiCall('login', { username, password }, (nextAttempt, maxAttempts) => {
      loginSubmit.textContent = `Signing in… (attempt ${nextAttempt} of ${maxAttempts})`;
    });
    if (result && result.ok) {
      setStoredAuth(username, password, result.role, result.name);
      window.location.href = result.role === 'admin' ? '/admin.html' : '/juror.html';
    } else {
      showError('Incorrect username or password.');
    }
  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = 'Sign In';
  }
}

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  if (!username) return showError('Please enter your username.');
  if (!password) return showError('Please enter your password.');
  attemptLogin(username, password);
});

// Already signed in? Skip straight past the login screen.
const existing = getStoredAuth();
if (existing && existing.role) {
  window.location.href = existing.role === 'admin' ? '/admin.html' : '/juror.html';
}
