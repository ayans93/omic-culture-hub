// Shared "confirm before leaving" guard for the browser Back/Forward
// buttons on juror.html and admin.html.
//
// Neither page has any real client-side routing (switching tabs, opening
// an artwork, etc. never touches browser history), so the only history
// entry under this page is the login screen. Pressing Back used to take
// jurors/admins straight there, and since the stored session survives in
// localStorage, login.js immediately bounced them right back here with a
// full page reload -- which still reset whatever tab/scroll position/
// draft comment they had, so it never actually felt like "nothing
// happened" even though no one was truly logged out either.
//
// This intercepts that first Back press with a confirm dialog instead of
// letting the navigation happen outright. "Leave" is a real, explicit
// logout (clears the stored session via the logout callback passed in),
// so the dialog's copy can say so plainly and mean it.
//
// Call installExitGuard(logoutFn) once, only once a valid session is
// confirmed (i.e. after requireAuth() has returned a truthy auth object)
// -- no point guarding a page that's already redirecting away. logoutFn
// is the page's clearStoredAuth, called right before navigating to the
// login screen on "Leave".

let installed = false;

function buildOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'exitGuardOverlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="modal-card exit-guard-card">
      <h2 class="detail-pane__title exit-guard-card__title">Are you sure you want to exit?</h2>
      <p class="exit-guard-card__help">Leaving now will log you out, you will need to login again later to resume evaluation.</p>
      <div class="exit-guard-card__actions">
        <button type="button" class="btn btn--secondary" id="exitGuardStayBtn">Stay</button>
        <button type="button" class="btn btn--primary" id="exitGuardLeaveBtn">Leave</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

export function installExitGuard(logoutFn) {
  if (installed) return;
  installed = true;

  const overlay = buildOverlay();
  const stayBtn = overlay.querySelector('#exitGuardStayBtn');
  const leaveBtn = overlay.querySelector('#exitGuardLeaveBtn');

  function showDialog() {
    overlay.hidden = false;
  }
  function hideDialog() {
    overlay.hidden = true;
  }

  // One extra history entry (same URL, just a marker) so the first Back
  // press lands on it instead of actually navigating away -- that's what
  // we intercept below instead of a real page transition.
  history.pushState({ exitGuard: true }, '', location.href);

  window.addEventListener('popstate', () => {
    // Put the marker entry back immediately so the page itself never
    // actually navigates -- Stay then needs no further action, and the
    // juror's/admin's current tab, scroll position and any draft comment
    // are untouched because nothing reloaded.
    history.pushState({ exitGuard: true }, '', location.href);
    showDialog();
  });

  stayBtn.addEventListener('click', hideDialog);

  // Backdrop click/Escape behave like Stay -- dismissing without an
  // explicit choice should never be the destructive option.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) hideDialog();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) hideDialog();
  });

  leaveBtn.addEventListener('click', () => {
    hideDialog();
    if (typeof logoutFn === 'function') logoutFn();
    window.location.href = '/index.html';
  });
}
