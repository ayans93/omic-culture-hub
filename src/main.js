import { REGISTRATION_NOTIFY_ENDPOINT } from './config.js';

// The staging deployment (omic-hub.vercel.app, and any other Vercel preview
// URL) and the real production site (omic.spot) currently share the exact
// same Apps Script backend, spreadsheet, and inbox-routing logic. Without
// this, every form submitted while testing on staging would notify the
// real team addresses (gallery@omic.spot / cinema@omic.spot) exactly like a
// real submission would. Sending this along lets the backend redirect its
// team notification to a test address instead when it's not production —
// see isStagingRequest_ in google-apps-script/Code.gs. It's sent as an
// ordinary form field rather than inferred server-side from anything else,
// since Apps Script has no reliable way to see the page's origin on its own.
const SITE_ORIGIN = window.location.hostname.endsWith('.vercel.app') ? 'staging' : 'production';

const form = document.getElementById('registerForm');

// Pages without a registration form (e.g. the Shows page, or a concluded
// event) can still include this script harmlessly.
if (form) {
  initRegisterForm();
}

const artworkForm = document.getElementById('artworkForm');

// Only the Art Contest page has the full artwork submission form.
if (artworkForm) {
  initArtworkForm();
}

const newtonForm = document.getElementById('newtonForm');

// Only the Newton show page has this dedicated registration form (its own
// UAE/India phone country select, guest-count picker, and seat/waitlist
// capacity logic).
if (newtonForm) {
  initNewtonForm();
}

const newtonPosterCarousel = document.getElementById('newtonPosterCarousel');

// Only the Newton show page has the poster/trailer carousel.
if (newtonPosterCarousel) {
  initPosterCarousel(newtonPosterCarousel);
}

const artistModal = document.getElementById('artistModal');

// Pages without a Featured Artists modal (e.g. Cafe, Shows) can
// still include this script harmlessly.
if (artistModal) {
  initArtistModal();
}

const rulesModalTrigger = document.getElementById('rulesModalTrigger');

// Only the Art Contest page has the Rules & Regulations consent link + modal.
if (rulesModalTrigger) {
  initRulesModal();
}

const navToggle = document.getElementById('navToggle');

// The mobile "burger" menu button is on every page's shared header.
if (navToggle) {
  initMobileNav();
}

const jumpToFormButtons = document.querySelectorAll('[data-jump-to-field]');

// "Take me to the form" buttons (the one at the very bottom of the page,
// and — on the Art Contest page — the one right after Submission
// Guidelines) scroll the named field into view and focus it, so the visitor
// can start typing immediately instead of hunting for the form themselves.
if (jumpToFormButtons.length) {
  initJumpToFormButtons();
}

function initMobileNav() {
  const navPills = document.getElementById('navPills');
  if (!navPills) return;

  function closeNav() {
    navPills.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    navPills.classList.add('is-open');
    navToggle.classList.add('is-active');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  navToggle.addEventListener('click', () => {
    if (navPills.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  // Closing on link click keeps the menu from staying open after
  // navigating to a new page, and closing on outside click / Escape
  // makes it behave like a normal dropdown.
  navPills.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  document.addEventListener('click', (event) => {
    if (!navPills.classList.contains('is-open')) return;
    if (navPills.contains(event.target) || navToggle.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navPills.classList.contains('is-open')) {
      closeNav();
      navToggle.focus();
    }
  });

  // If the viewport is resized past the mobile breakpoint while the menu
  // is open (e.g. rotating a tablet), drop the open state so it doesn't
  // linger as a stray dropdown once .nav-pills is shown inline again.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeNav();
  });
} // end initMobileNav

function initJumpToFormButtons() {
  jumpToFormButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const field = document.getElementById(btn.dataset.jumpToField);
      if (!field) return;

      field.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Let the smooth scroll get moving before focusing — focusing
      // immediately can make some mobile browsers jump straight to the
      // final scroll position (to keep the focused field clear of the
      // on-screen keyboard) instead of scrolling smoothly.
      window.setTimeout(() => field.focus({ preventScroll: true }), 400);
    });
  });
} // end initJumpToFormButtons

function goToThankYou(eventName, type) {
  const params = new URLSearchParams({ event: eventName });
  if (type) params.set('type', type);
  window.location.href = `thank-you.html?${params.toString()}`;
}

function initRegisterForm() {
const registerCard = document.getElementById('registerCard');
// registerSubmitBottom used to be a second real submit button; it's now a
// "Take me to the form" link (see initJumpToFormButtons), so only the form's
// own submit button needs the submitting/disabled treatment below.
const submitButtons = [
  document.getElementById('registerSubmit'),
].filter(Boolean);

// Lets each page label its registrations distinctly in the notification
// email, e.g. <body data-event-name="Art Competition">. The date/time/venue/
// blurb attributes are optional — when a page sets them, the registrant's
// confirmation email includes full event details; when it doesn't, the
// email still sends, just without that section.
const eventName = document.body.dataset.eventName || document.title;
const eventDate = document.body.dataset.eventDate || '';
const eventTime = document.body.dataset.eventTime || '';
const eventVenue = document.body.dataset.eventVenue || '';
const eventBlurb = document.body.dataset.eventBlurb || '';

const UAE_PHONE_PATTERN = /^\+971[0-9]{8,9}$/;

const fields = {
  name: {
    input: document.getElementById('name'),
    error: document.getElementById('nameError'),
    validate(value) {
      const trimmed = value.trim();
      if (!trimmed) return 'Please enter your name.';
      if (trimmed.length < 2) return 'Name looks too short.';
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(trimmed)) {
        return 'Name can only contain letters, spaces, apostrophes and hyphens.';
      }
      return '';
    },
  },
  phone: {
    input: document.getElementById('phone'),
    error: document.getElementById('phoneError'),
    validate(value) {
      const trimmed = value.trim();
      if (!trimmed) return 'Please enter your phone number.';

      // Normalize spaces/dashes/parentheses before checking the pattern.
      const normalized = trimmed.replace(/[\s()-]/g, '');

      if (!normalized.startsWith('+971')) {
        return 'Please use a Dubai (+971) phone number to register.';
      }
      if (!UAE_PHONE_PATTERN.test(normalized)) {
        return 'Enter a valid UAE phone number, e.g. +971 5X XXX XXXX.';
      }
      return '';
    },
  },
  email: {
    input: document.getElementById('email'),
    error: document.getElementById('emailError'),
    validate(value) {
      const trimmed = value.trim();
      if (!trimmed) return 'Please enter your email.';
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmed)) return 'Enter a valid email address.';
      return '';
    },
  },
};

function setFieldError(field, message) {
  field.error.textContent = message;
  if (message) {
    field.error.classList.add('is-visible');
    field.input.classList.add('is-invalid');
  } else {
    field.error.classList.remove('is-visible');
    field.input.classList.remove('is-invalid');
  }
}

function clearAllErrors() {
  Object.values(fields).forEach((field) => setFieldError(field, ''));
}

function validateField(key) {
  const field = fields[key];
  const message = field.validate(field.input.value);
  setFieldError(field, message);
  return !message;
}

// Validate on blur for immediate feedback, and clear the error as the user retypes.
Object.keys(fields).forEach((key) => {
  const field = fields[key];
  field.input.addEventListener('blur', () => validateField(key));
  field.input.addEventListener('input', () => {
    if (field.error.classList.contains('is-visible')) {
      validateField(key);
    }
  });
});

function setSubmitting(isSubmitting) {
  submitButtons.forEach((btn) => {
    btn.disabled = isSubmitting;
  });
  if (submitButtons[0]) {
    submitButtons[0].textContent = isSubmitting ? 'Applying…' : 'Apply';
  }
}

async function notifyByEmail(data) {
  if (!REGISTRATION_NOTIFY_ENDPOINT || REGISTRATION_NOTIFY_ENDPOINT.includes('PASTE_YOUR')) {
    console.warn(
      'Registration notification endpoint is not configured yet — see ' +
        'EMAIL_NOTIFICATIONS_SETUP.md. Skipping; no email was sent for this registration:',
      data
    );
    return;
  }

  const body = new URLSearchParams({
    origin: SITE_ORIGIN,
    timestamp: new Date().toISOString(),
    event: eventName,
    eventDate,
    eventTime,
    eventVenue,
    eventBlurb,
    name: data.name,
    phone: data.phone,
    email: data.email,
  });

  // navigator.sendBeacon queues the request with the browser and returns
  // immediately, without waiting for (or being able to read) a response —
  // and unlike fetch, it's specifically designed to keep delivering the
  // request even if the page navigates away right afterwards. Apps Script
  // Web Apps can take several seconds to respond, and since the response is
  // opaque anyway (no-cors), there's nothing gained by waiting for it — this
  // is what removes that wait from the "Registering…" button. The payload
  // here is a handful of short fields, well under sendBeacon's ~64KB limit.
  if (navigator.sendBeacon) {
    try {
      if (navigator.sendBeacon(REGISTRATION_NOTIFY_ENDPOINT, body)) return;
    } catch (err) {
      // Fall through to fetch below.
    }
  }

  try {
    // Fallback for browsers without sendBeacon (or where it failed to
    // queue). Apps Script Web Apps don't return CORS headers, so the
    // response is opaque here — "no-cors" is what lets the browser fire the
    // request at all; we can't read success/failure back from it.
    await fetch(REGISTRATION_NOTIFY_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body,
    });
  } catch (err) {
    console.error('Could not reach the registration notification endpoint:', err);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const results = Object.keys(fields).map((key) => validateField(key));
  const allValid = results.every(Boolean);

  if (!allValid) {
    registerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const firstInvalidKey = Object.keys(fields).find(
      (key) => fields[key].input.classList.contains('is-invalid')
    );
    if (firstInvalidKey) {
      fields[firstInvalidKey].input.focus();
    }
    return;
  }

  const data = {
    name: fields.name.input.value.trim(),
    phone: fields.phone.input.value.trim(),
    email: fields.email.input.value.trim(),
  };

  setSubmitting(true);
  await notifyByEmail(data);
  goToThankYou(eventName, 'registration');
});

} // end initRegisterForm

// The Art Contest page's full submission form: many more fields than the
// simple register form above (open text, dropdowns, a character-limited
// statement, and a file upload), plus a consent checkbox that must be
// checked before the Submit button is even clickable.
function initArtworkForm() {
  const formCard = document.getElementById('artworkFormCard');
  const eventName = document.body.dataset.eventName || document.title;

  // artworkSubmitBottom / artworkJumpToFormGuidelines used to be real submit
  // buttons; they're now "Take me to the form" links (see
  // initJumpToFormButtons), so only the form's own submit button needs the
  // submitting/disabled treatment below.
  const submitButtons = [
    document.getElementById('artworkSubmit'),
  ].filter(Boolean);

  const consentCheckbox = document.getElementById('exhibitionConsent');

  const ANY_PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
  const CURRENT_YEAR = new Date().getFullYear();
  // Rules & Regulations, Section 6: "Artist statement (maximum 150 words)".
  const STATEMENT_WORD_LIMIT = 150;

  function countWords(value) {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  const fields = {
    artistName: {
      input: document.getElementById('artistName'),
      error: document.getElementById('artistNameError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your full name.';
        if (trimmed.length < 2) return 'Name looks too short.';
        return '';
      },
    },
    artistPhone: {
      input: document.getElementById('artistPhone'),
      error: document.getElementById('artistPhoneError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your mobile number.';
        const normalized = trimmed.replace(/[\s()-]/g, '');
        if (!ANY_PHONE_PATTERN.test(normalized)) {
          return 'Enter a valid mobile number, including your country code.';
        }
        return '';
      },
    },
    artistEmail: {
      input: document.getElementById('artistEmail'),
      error: document.getElementById('artistEmailError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your email.';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmed)) return 'Enter a valid email address.';
        return '';
      },
    },
    uaeResident: {
      input: document.getElementById('uaeResident'),
      error: document.getElementById('uaeResidentError'),
      validate(value) {
        if (!value) return 'Please select an option.';
        if (value === 'No') return 'The content is only open to UAE residents.';
        return '';
      },
    },
    artworkTitle: {
      input: document.getElementById('artworkTitle'),
      error: document.getElementById('artworkTitleError'),
      validate(value) {
        if (!value.trim()) return 'Please enter the title of your artwork.';
        return '';
      },
    },
    discipline: {
      input: document.getElementById('discipline'),
      error: document.getElementById('disciplineError'),
      validate(value) {
        if (!value) return 'Please select a discipline.';
        return '';
      },
    },
    mediumMaterial: {
      input: document.getElementById('mediumMaterial'),
      error: document.getElementById('mediumMaterialError'),
      validate(value) {
        if (!value.trim()) return 'Please enter the medium / material used.';
        return '';
      },
    },
    dimensions: {
      input: document.getElementById('dimensions'),
      error: document.getElementById('dimensionsError'),
      validate(value) {
        if (!value.trim()) return 'Please enter the dimensions of your artwork.';
        return '';
      },
    },
    yearCompleted: {
      input: document.getElementById('yearCompleted'),
      error: document.getElementById('yearCompletedError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter the year of completion.';
        if (!/^[0-9]{4}$/.test(trimmed)) return 'Enter a valid 4-digit year.';
        const year = Number(trimmed);
        if (year < 1900 || year > CURRENT_YEAR) {
          return `Enter a year between 1900 and ${CURRENT_YEAR}.`;
        }
        return '';
      },
    },
    artistStatement: {
      input: document.getElementById('artistStatement'),
      error: document.getElementById('artistStatementError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter an artist statement.';
        if (countWords(trimmed) > STATEMENT_WORD_LIMIT) {
          return `Keep your statement to ${STATEMENT_WORD_LIMIT} words or fewer.`;
        }
        return '';
      },
    },
    artistBio: {
      input: document.getElementById('artistBio'),
      error: document.getElementById('artistBioError'),
      validate(value) {
        if (!value.trim()) return 'Please enter a short biography.';
        return '';
      },
    },
    artworkFile: {
      input: document.getElementById('artworkFile'),
      error: document.getElementById('artworkFileError'),
      validate() {
        const input = document.getElementById('artworkFile');
        if (!input.files || input.files.length === 0) {
          return 'Please upload an image or PDF of your artwork.';
        }
        const allowed = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/avif', 'application/pdf'];
        const file = input.files[0];
        const extOk = /\.(jpe?g|png|pdf|svg|avif)$/i.test(file.name);
        if (!allowed.includes(file.type) && !extOk) {
          return 'Supported file types: JPEG, PNG, PDF, SVG, AVIF.';
        }
        return '';
      },
    },
  };

  function setFieldError(field, message) {
    field.error.textContent = message;
    if (message) {
      field.error.classList.add('is-visible');
      field.input.classList.add('is-invalid');
    } else {
      field.error.classList.remove('is-visible');
      field.input.classList.remove('is-invalid');
    }
  }

  function clearAllErrors() {
    Object.values(fields).forEach((field) => setFieldError(field, ''));
  }

  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.input.value);
    setFieldError(field, message);
    return !message;
  }

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    const eventType = field.input.type === 'file' || field.input.tagName === 'SELECT' ? 'change' : 'blur';
    field.input.addEventListener(eventType, () => validateField(key));
    field.input.addEventListener('input', () => {
      if (field.error.classList.contains('is-visible')) {
        validateField(key);
      }
    });
  });

  // Live word counter for the artist statement.
  const statementInput = fields.artistStatement.input;
  const statementCounter = document.getElementById('artistStatementCounter');
  function updateStatementCounter() {
    const words = countWords(statementInput.value);
    statementCounter.textContent = `${words}/${STATEMENT_WORD_LIMIT} words`;
    statementCounter.classList.toggle('is-limit', words > STATEMENT_WORD_LIMIT);
  }
  statementInput.addEventListener('input', updateStatementCounter);
  updateStatementCounter();

  // The Submit button stays disabled until the exhibition-availability
  // checkbox is checked, regardless of what else is filled in.
  function updateSubmitAvailability() {
    submitButtons.forEach((btn) => {
      btn.disabled = !consentCheckbox.checked;
    });
  }
  consentCheckbox.addEventListener('change', updateSubmitAvailability);
  updateSubmitAvailability();

  function setSubmitting(isSubmitting) {
    submitButtons.forEach((btn) => {
      btn.disabled = isSubmitting || !consentCheckbox.checked;
    });
    if (submitButtons[0]) {
      submitButtons[0].textContent = isSubmitting ? 'Uploading…' : 'Apply';
    }
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // reader.result looks like "data:<mime>;base64,<data>" — we only
        // want the part after the comma.
        const commaIndex = reader.result.indexOf(',');
        resolve(reader.result.slice(commaIndex + 1));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // The Art Contest's Apps Script endpoint has to finish saving the artwork
  // to Drive, emailing the team, and logging the sheet row — all
  // synchronously — before it can respond, and the browser has to finish
  // uploading the whole (base64-encoded, ~33% larger than the original)
  // file before that even starts. That combined wait is what leaves
  // "Applying…" on screen for a long time, especially for a multi-megabyte
  // photo straight off someone's phone. We can't hide that wait behind an
  // early redirect: the visitor needs to actually land on thank-you.html
  // (not just see something that looks like it) because that page's view is
  // what Google Ad Manager's conversion tracking counts. So instead, this
  // shrinks the thing that's actually slow — the file itself — before it's
  // sent, by downscaling and re-encoding large images client-side. A phone
  // photo often drops from several MB to a few hundred KB with no visible
  // quality loss at the size a jury reviews it on screen, which cuts both
  // the upload time and Apps Script's Drive-save time by roughly the same
  // ratio. PDFs and SVGs are left untouched (not worth rasterizing), and if
  // anything goes wrong, or the "compressed" version doesn't come out
  // smaller, the original file is uploaded as-is.
  const COMPRESSIBLE_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/avif'];
  const COMPRESS_ABOVE_BYTES = 1.5 * 1024 * 1024; // don't bother under ~1.5MB
  const COMPRESS_MAX_DIMENSION = 1920; // longest side, in pixels
  const COMPRESS_JPEG_QUALITY = 0.82;

  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => resolve({ img, url });
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  }

  async function compressArtworkFile(file) {
    if (!COMPRESSIBLE_IMAGE_TYPES.includes(file.type) || file.size <= COMPRESS_ABOVE_BYTES) {
      return file;
    }

    let img;
    let objectUrl;
    try {
      ({ img, url: objectUrl } = await loadImageFromFile(file));

      const longestSide = Math.max(img.naturalWidth, img.naturalHeight);
      const scale = Math.min(1, COMPRESS_MAX_DIMENSION / longestSide);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', COMPRESS_JPEG_QUALITY)
      );

      if (!blob || blob.size >= file.size) {
        return file; // Compression didn't actually help — keep the original.
      }

      const newName = file.name.replace(/\.[^./\\]+$/, '') + '.jpg';
      return new File([blob], newName, { type: 'image/jpeg' });
    } catch (err) {
      console.error('Could not compress artwork image, uploading the original file instead:', err);
      return file;
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  async function notifySubmissionByEmail(data, file) {
    if (!REGISTRATION_NOTIFY_ENDPOINT || REGISTRATION_NOTIFY_ENDPOINT.includes('PASTE_YOUR')) {
      console.warn(
        'Registration notification endpoint is not configured yet — see ' +
          'EMAIL_NOTIFICATIONS_SETUP.md. Skipping; no email was sent for this submission:',
        data
      );
      return;
    }

    const fileBase64 = await fileToBase64(file);

    const body = new URLSearchParams({
      formType: 'artwork',
      origin: SITE_ORIGIN,
      timestamp: new Date().toISOString(),
      event: eventName,
      name: data.artistName,
      phone: data.artistPhone,
      email: data.artistEmail,
      uaeResident: data.uaeResident,
      artworkTitle: data.artworkTitle,
      discipline: data.discipline,
      mediumMaterial: data.mediumMaterial,
      dimensions: data.dimensions,
      yearCompleted: data.yearCompleted,
      artistStatement: data.artistStatement,
      artistBio: data.artistBio,
      fileName: file.name,
      fileMimeType: file.type || 'application/octet-stream',
      fileData: fileBase64,
    });

    try {
      // Apps Script Web Apps don't return CORS headers, so the response is
      // opaque here — "no-cors" is what lets the browser fire the request
      // at all, and we can't read success/failure back from it.
      await fetch(REGISTRATION_NOTIFY_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body,
      });
    } catch (err) {
      console.error('Could not reach the registration notification endpoint:', err);
    }
  }

  const form = document.getElementById('artworkForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!consentCheckbox.checked) return;

    const results = Object.keys(fields).map((key) => validateField(key));
    const allValid = results.every(Boolean);

    if (!allValid) {
      formCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInvalidKey = Object.keys(fields).find(
        (key) => fields[key].input.classList.contains('is-invalid')
      );
      if (firstInvalidKey) {
        fields[firstInvalidKey].input.focus();
      }
      return;
    }

    const data = {
      artistName: fields.artistName.input.value.trim(),
      artistPhone: fields.artistPhone.input.value.trim(),
      artistEmail: fields.artistEmail.input.value.trim(),
      uaeResident: fields.uaeResident.input.value,
      artworkTitle: fields.artworkTitle.input.value.trim(),
      discipline: fields.discipline.input.value,
      mediumMaterial: fields.mediumMaterial.input.value.trim(),
      dimensions: fields.dimensions.input.value.trim(),
      yearCompleted: fields.yearCompleted.input.value.trim(),
      artistStatement: fields.artistStatement.input.value.trim(),
      artistBio: fields.artistBio.input.value.trim(),
    };
    setSubmitting(true);

    // Ad Manager's conversion tracking fires on an actual view of
    // thank-you.html, so this has to land there for real — no showing a
    // stand-in confirmation and redirecting later. See compressArtworkFile's
    // comment above for how the wait itself is kept down instead.
    const file = await compressArtworkFile(fields.artworkFile.input.files[0]);
    await notifySubmissionByEmail(data, file);
    goToThankYou(eventName, 'submission');
  });
} // end initArtworkForm

// The Newton show page's registration form: name, number of guests (1 or
// 2), a phone number (UAE or India only — a country select next to a
// local-digits-only field), email, and a consent checkbox that gates the
// Register button. Seats are capped (45 confirmed, then a 25-person
// waitlist), so the page also checks current availability on load and
// swaps the form out for a "registrations are full" notice if capacity's
// already been reached (or trims the guest-count options if only one seat
// is left).
function initNewtonForm() {
  const formWrap = document.getElementById('newtonFormWrap');
  const closedNotice = document.getElementById('newtonClosedNotice');
  const submitButton = document.getElementById('newtonSubmit');
  const consentCheckbox = document.getElementById('newtonConsent');
  const countrySelect = document.getElementById('newtonPhoneCountry');
  const guestCountInputs = Array.from(document.querySelectorAll('input[name="newtonGuestCount"]'));
  const guestCountHint = document.getElementById('newtonGuestCountHint');

  const eventName = document.body.dataset.eventName || document.title;
  const eventDate = document.body.dataset.eventDate || '';
  const eventTime = document.body.dataset.eventTime || '';
  const eventVenue = document.body.dataset.eventVenue || '';
  const eventBlurb = document.body.dataset.eventBlurb || '';

  // Local-digit length (after the country code) for each of the two
  // countries this form accepts — no other country code is offered.
  const PHONE_LENGTHS = {
    971: { min: 8, max: 9, label: 'Enter a valid UAE number, e.g. 5X XXX XXXX.' },
    91: { min: 10, max: 10, label: 'Enter a valid 10-digit Indian mobile number.' },
  };

  const fields = {
    name: {
      input: document.getElementById('newtonName'),
      error: document.getElementById('newtonNameError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your name.';
        if (trimmed.length < 2) return 'Name looks too short.';
        if (!/^[A-Za-z][A-Za-z .'-]*$/.test(trimmed)) {
          return 'Name can only contain letters, spaces, apostrophes and hyphens.';
        }
        return '';
      },
    },
    phone: {
      input: document.getElementById('newtonPhone'),
      error: document.getElementById('newtonPhoneError'),
      validate(value) {
        // The country code is a separate <select>, not part of this
        // field's value — so this only validates the local digits the
        // visitor actually typed, against whichever country is selected.
        const normalized = value.trim().replace(/[\s()-]/g, '');
        if (!normalized) return 'Please enter your phone number.';
        const rule = PHONE_LENGTHS[countrySelect.value] || PHONE_LENGTHS[971];
        if (!/^[0-9]+$/.test(normalized) || normalized.length < rule.min || normalized.length > rule.max) {
          return rule.label;
        }
        return '';
      },
    },
    email: {
      input: document.getElementById('newtonEmail'),
      error: document.getElementById('newtonEmailError'),
      validate(value) {
        const trimmed = value.trim();
        if (!trimmed) return 'Please enter your email.';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmed)) return 'Enter a valid email address.';
        return '';
      },
    },
  };

  function setFieldError(field, message) {
    field.error.textContent = message;
    if (message) {
      field.error.classList.add('is-visible');
      field.input.classList.add('is-invalid');
    } else {
      field.error.classList.remove('is-visible');
      field.input.classList.remove('is-invalid');
    }
  }

  function validateField(key) {
    const field = fields[key];
    const message = field.validate(field.input.value);
    setFieldError(field, message);
    return !message;
  }

  // Validate on blur for immediate feedback, and clear the error as the
  // user retypes — same pattern as the other forms on this site.
  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    field.input.addEventListener('blur', () => validateField(key));
    field.input.addEventListener('input', () => {
      if (field.error.classList.contains('is-visible')) {
        validateField(key);
      }
    });
  });

  // Switching country re-checks the phone field against the new country's
  // length, if an error is already showing.
  countrySelect.addEventListener('change', () => {
    if (fields.phone.error.classList.contains('is-visible')) {
      validateField('phone');
    }
  });

  function getGuestCount() {
    const checked = guestCountInputs.find((input) => input.checked);
    return checked ? parseInt(checked.value, 10) : 1;
  }

  // The Register button stays disabled until the consent checkbox is
  // checked, regardless of what else is filled in — same pattern as the
  // Art Contest's exhibition-consent checkbox.
  function updateSubmitAvailability() {
    submitButton.disabled = !consentCheckbox.checked;
  }
  consentCheckbox.addEventListener('change', updateSubmitAvailability);
  updateSubmitAvailability();

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting || !consentCheckbox.checked;
    submitButton.textContent = isSubmitting ? 'Registering…' : 'Register';
  }

  async function notifyByEmail(data) {
    if (!REGISTRATION_NOTIFY_ENDPOINT || REGISTRATION_NOTIFY_ENDPOINT.includes('PASTE_YOUR')) {
      console.warn(
        'Registration notification endpoint is not configured yet — see ' +
          'EMAIL_NOTIFICATIONS_SETUP.md. Skipping; no email was sent for this registration:',
        data
      );
      return;
    }

    const body = new URLSearchParams({
      formType: 'newtonRegistration',
      origin: SITE_ORIGIN,
      timestamp: new Date().toISOString(),
      event: eventName,
      eventDate,
      eventTime,
      eventVenue,
      eventBlurb,
      name: data.name,
      phone: data.phone,
      email: data.email,
      guestCount: String(data.guestCount),
    });

    // Same fire-and-forget pattern as the other forms on this site: Apps
    // Script Web Apps can take several seconds, and the response is opaque
    // either way (no-cors / sendBeacon), so there's nothing to gain by
    // waiting for it here — see initRegisterForm's notifyByEmail for the
    // full reasoning.
    if (navigator.sendBeacon) {
      try {
        if (navigator.sendBeacon(REGISTRATION_NOTIFY_ENDPOINT, body)) return;
      } catch (err) {
        // Fall through to fetch below.
      }
    }

    try {
      await fetch(REGISTRATION_NOTIFY_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body,
      });
    } catch (err) {
      console.error('Could not reach the registration notification endpoint:', err);
    }
  }

  // Best-effort "seats left" check on page load, using a JSONP-style
  // <script> tag: Apps Script Web Apps don't send CORS headers, so an
  // ordinary cross-origin fetch can't read the response, but loading a
  // <script src="..."> tag isn't subject to CORS at all — the endpoint
  // wraps its JSON in a call to this one-off callback instead. If this
  // can't be reached for any reason (offline, ad blocker, endpoint not
  // configured yet), we fail open and leave the form up; the Apps Script
  // side still enforces the real 45+25 limit (and the 2-guests-per-booking
  // cap) when it processes a submission, so nothing can actually overbook
  // from this check failing.
  function checkNewtonCapacity() {
    if (!REGISTRATION_NOTIFY_ENDPOINT || REGISTRATION_NOTIFY_ENDPOINT.includes('PASTE_YOUR')) return;

    const callbackName = '__newtonCapacity' + Date.now();
    const script = document.createElement('script');

    function cleanup() {
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (data) => {
      if (data && data.closed) {
        formWrap.hidden = true;
        closedNotice.hidden = false;
      } else if (data && data.remaining === 1) {
        // Only one seat left in total -- booking for 2 would always fail,
        // so don't offer that option in the first place.
        const twoGuestsInput = guestCountInputs.find((input) => input.value === '2');
        if (twoGuestsInput) {
          twoGuestsInput.disabled = true;
          twoGuestsInput.closest('.radio-bubble').classList.add('is-disabled');
          if (twoGuestsInput.checked) {
            const oneGuestInput = guestCountInputs.find((input) => input.value === '1');
            if (oneGuestInput) oneGuestInput.checked = true;
          }
        }
        if (guestCountHint) guestCountHint.textContent = 'Only 1 seat left — bookings for 2 are unavailable right now.';
      }
      cleanup();
    };

    script.onerror = cleanup;
    script.src = REGISTRATION_NOTIFY_ENDPOINT + '?formType=newtonCapacity&callback=' + callbackName;
    document.body.appendChild(script);
  }

  checkNewtonCapacity();

  document.getElementById('newtonForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!consentCheckbox.checked) return;

    const results = Object.keys(fields).map((key) => validateField(key));
    const allValid = results.every(Boolean);

    if (!allValid) {
      const firstInvalidKey = Object.keys(fields).find(
        (key) => fields[key].input.classList.contains('is-invalid')
      );
      if (firstInvalidKey) {
        fields[firstInvalidKey].input.focus();
      }
      return;
    }

    const data = {
      name: fields.name.input.value.trim(),
      phone: '+' + countrySelect.value + fields.phone.input.value.trim().replace(/[\s()-]/g, ''),
      email: fields.email.input.value.trim(),
      guestCount: getGuestCount(),
    };

    setSubmitting(true);
    await notifyByEmail(data);
    goToThankYou(eventName, 'registration');
  });
} // end initNewtonForm

// Cross-fades between the poster image and a YouTube trailer thumbnail:
// poster visible for 2s, then the trailer frame for 5s, looping forever.
// Takes the carousel's root element so a page can wire up more than one of
// these if it ever needs to. Clicking the trailer frame opens the trailer
// on YouTube in a new tab (it's a real <a>, so this works even if the JS
// below never runs); clicking the poster frame does nothing special.
function initPosterCarousel(root) {
  const layers = Array.from(root.querySelectorAll('.poster-carousel__layer'));
  if (layers.length < 2) return;

  // Respect reduced-motion: leave whichever frame is already marked
  // visible in the HTML (the poster) showing, and don't auto-rotate.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const DURATIONS = [2000, 5000]; // poster, then trailer
  let activeIndex = layers.findIndex((layer) => layer.classList.contains('is-visible'));
  if (activeIndex === -1) activeIndex = 0;

  function showNext() {
    const nextIndex = (activeIndex + 1) % layers.length;
    layers[activeIndex].classList.remove('is-visible');
    layers[nextIndex].classList.add('is-visible');
    activeIndex = nextIndex;
    setTimeout(showNext, DURATIONS[activeIndex]);
  }

  setTimeout(showNext, DURATIONS[activeIndex]);
}

function initArtistModal() {
  const modalPhoto = document.getElementById('artistModalPhoto');
  const modalName = document.getElementById('artistModalName');
  const modalClose = document.getElementById('artistModalClose');
  const artistButtons = document.querySelectorAll('.artist-card[data-artist-name]');

  function initials(name) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }

  function openModal(name, photoUrl) {
    modalName.textContent = name;
    modalPhoto.innerHTML = '';
    if (photoUrl) {
      const img = document.createElement('img');
      img.src = photoUrl;
      img.alt = name;
      modalPhoto.appendChild(img);
    } else {
      modalPhoto.textContent = initials(name);
    }
    artistModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    artistModal.hidden = true;
    document.body.style.overflow = '';
  }

  artistButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      openModal(btn.dataset.artistName, btn.dataset.artistPhoto);
    });
  });

  modalClose.addEventListener('click', closeModal);
  artistModal.addEventListener('click', (event) => {
    if (event.target === artistModal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !artistModal.hidden) closeModal();
  });
} // end initArtistModal

// The consent checkbox's "Rules & Regulations" link opens the PDF in a
// modal viewer instead of navigating away, so the applicant can read it
// without losing their place (or their in-progress form). The href still
// points straight at the PDF, so the link degrades gracefully (opens the
// file directly) for anyone browsing with JavaScript disabled.
function initRulesModal() {
  const rulesModal = document.getElementById('rulesModal');
  const rulesModalFrame = document.getElementById('rulesModalFrame');
  const rulesModalClose = document.getElementById('rulesModalClose');
  const pdfUrl = rulesModalTrigger.getAttribute('href');

  function openModal() {
    // Only point the iframe at the PDF once it's actually needed, rather
    // than loading it on every page visit.
    if (!rulesModalFrame.src) {
      rulesModalFrame.src = pdfUrl;
    }
    rulesModal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    rulesModal.hidden = true;
    document.body.style.overflow = '';
  }

  rulesModalTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    openModal();
  });

  rulesModalClose.addEventListener('click', closeModal);
  rulesModal.addEventListener('click', (event) => {
    if (event.target === rulesModal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !rulesModal.hidden) closeModal();
  });
} // end initRulesModal
