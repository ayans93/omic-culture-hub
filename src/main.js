import { REGISTRATION_NOTIFY_ENDPOINT } from './config.js';

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

const artistModal = document.getElementById('artistModal');

// Pages without a Featured Artists modal (e.g. Cafe, Shows) can
// still include this script harmlessly.
if (artistModal) {
  initArtistModal();
}

const navToggle = document.getElementById('navToggle');

// The mobile "burger" menu button is on every page's shared header.
if (navToggle) {
  initMobileNav();
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

function goToThankYou(eventName, type) {
  const params = new URLSearchParams({ event: eventName });
  if (type) params.set('type', type);
  window.location.href = `thank-you.html?${params.toString()}`;
}

function initRegisterForm() {
const registerCard = document.getElementById('registerCard');
const submitButtons = [
  document.getElementById('registerSubmit'),
  document.getElementById('registerSubmitBottom'),
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
    submitButtons[0].textContent = isSubmitting ? 'Registering…' : 'Register';
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

  const submitButtons = [
    document.getElementById('artworkSubmit'),
    document.getElementById('artworkSubmitBottom'),
  ].filter(Boolean);

  const consentCheckbox = document.getElementById('exhibitionConsent');

  const ANY_PHONE_PATTERN = /^\+?[0-9]{7,15}$/;
  const CURRENT_YEAR = new Date().getFullYear();
  const STATEMENT_LIMIT = 150;

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
    medium: {
      input: document.getElementById('medium'),
      error: document.getElementById('mediumError'),
      validate(value) {
        if (!value) return 'Please select a medium.';
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
        if (trimmed.length > STATEMENT_LIMIT) {
          return `Keep your statement to ${STATEMENT_LIMIT} characters or fewer.`;
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

  // Live character counter for the artist statement.
  const statementInput = fields.artistStatement.input;
  const statementCounter = document.getElementById('artistStatementCounter');
  function updateStatementCounter() {
    const length = statementInput.value.length;
    statementCounter.textContent = `${length}/${STATEMENT_LIMIT}`;
    statementCounter.classList.toggle('is-limit', length > STATEMENT_LIMIT);
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
      submitButtons[0].textContent = isSubmitting ? 'Submitting…' : 'Submit';
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
      timestamp: new Date().toISOString(),
      event: eventName,
      name: data.artistName,
      phone: data.artistPhone,
      email: data.artistEmail,
      uaeResident: data.uaeResident,
      artworkTitle: data.artworkTitle,
      medium: data.medium,
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
      medium: fields.medium.input.value,
      dimensions: fields.dimensions.input.value.trim(),
      yearCompleted: fields.yearCompleted.input.value.trim(),
      artistStatement: fields.artistStatement.input.value.trim(),
      artistBio: fields.artistBio.input.value.trim(),
    };
    const file = fields.artworkFile.input.files[0];

    setSubmitting(true);
    await notifySubmissionByEmail(data, file);
    goToThankYou(eventName, 'submission');
  });
} // end initArtworkForm

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
