import { REGISTRATION_NOTIFY_ENDPOINT } from './config.js';

const form = document.getElementById('registerForm');

// Pages without a registration form (e.g. the Shows page) can
// still include this script harmlessly.
if (form) {
  initRegisterForm();
}

const artistModal = document.getElementById('artistModal');

// Pages without a Featured Artists modal (e.g. Cafe, Shows) can
// still include this script harmlessly.
if (artistModal) {
  initArtistModal();
}

function initRegisterForm() {
const registerCard = document.getElementById('registerCard');
const successOverlay = document.getElementById('successOverlay');
const successClose = document.getElementById('successClose');
const submitButtons = [
  document.getElementById('registerSubmit'),
  document.getElementById('registerSubmitBottom'),
].filter(Boolean);

// Lets each page label its registrations distinctly in the notification
// email, e.g. <body data-event-name="Art Competition">.
const eventName = document.body.dataset.eventName || document.title;

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

function showSuccess() {
  successOverlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function hideSuccess() {
  successOverlay.hidden = true;
  document.body.style.overflow = '';
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
    name: data.name,
    phone: data.phone,
    email: data.email,
  });

  try {
    // Apps Script Web Apps don't return CORS headers, so the response is
    // opaque here. "no-cors" is what lets the browser fire the request at
    // all; we can't read success/failure back from it.
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
  setSubmitting(false);

  clearAllErrors();
  form.reset();
  showSuccess();
});

successClose.addEventListener('click', hideSuccess);
successOverlay.addEventListener('click', (event) => {
  if (event.target === successOverlay) hideSuccess();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !successOverlay.hidden) hideSuccess();
});

} // end initRegisterForm

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
