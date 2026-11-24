/* ==========================================================================
   Click & Fix Computer Services — site scripts (no libraries)
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------- Mobile navigation ---------------- */
  var navToggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');

  function closeNav() {
    if (!nav || !navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 820) closeNav();
    });
  }

  /* ---------------- Gallery filters ---------------- */
  var filterButtons = document.querySelectorAll('.filter');
  var galleryItems = document.querySelectorAll('.gallery-item');

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var filter = button.getAttribute('data-filter');

      filterButtons.forEach(function (other) {
        var active = other === button;
        other.classList.toggle('is-active', active);
        other.setAttribute('aria-pressed', String(active));
      });

      galleryItems.forEach(function (item) {
        var show = filter === 'all' || item.getAttribute('data-cat') === filter;
        item.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---------------- "Book This Service" preselect ---------------- */
  var bookingSection = document.getElementById('booking');
  var bookingForm = document.getElementById('booking-form');
  var serviceSelect = document.getElementById('bk-service');

  document.querySelectorAll('[data-service]').forEach(function (button) {
    button.addEventListener('click', function () {
      var value = button.getAttribute('data-service');
      if (serviceSelect && value) {
        var match = Array.prototype.some.call(serviceSelect.options, function (option) {
          if (option.value === value) {
            serviceSelect.value = value;
            return true;
          }
          return false;
        });
        if (!match) serviceSelect.value = '';
      }
      if (bookingSection) bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------------- Validation helpers ---------------- */
  function errorSlot(field) {
    return document.querySelector('.error[data-error-for="' + field.id + '"]');
  }

  function messageFor(field) {
    var value = (field.value || '').trim();

    if (field.validity.valueMissing) {
      if (field.tagName === 'SELECT') return 'Please choose an option.';
      if (field.type === 'date') return 'Please pick a date.';
      if (field.type === 'time') return 'Please pick a time.';
      return 'This field is required.';
    }
    if (field.validity.tooShort) {
      return 'Please enter at least ' + field.minLength + ' characters.';
    }
    if (field.validity.patternMismatch) {
      return 'Enter an 11-digit mobile number, e.g. 09171234567.';
    }
    if (field.validity.typeMismatch && field.type === 'email') {
      return 'Enter a valid email address, e.g. you@email.com.';
    }
    if (field.validity.rangeUnderflow || field.validity.rangeOverflow) {
      return 'Please choose a time between 9:00 AM and 7:00 PM.';
    }
    if (field.validity.badInput) return 'Please check the value you entered.';
    if (!value && field.required) return 'This field is required.';
    return '';
  }

  function showError(field) {
    var slot = errorSlot(field);
    var message = messageFor(field);
    if (slot) slot.textContent = message;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  function wireValidation(form) {
    if (!form) return;
    var fields = form.querySelectorAll('input, select, textarea');

    fields.forEach(function (field) {
      field.addEventListener('blur', function () {
        if (field.value || field.getAttribute('aria-invalid') === 'true') showError(field);
      });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') showError(field);
      });
      field.addEventListener('change', function () {
        if (field.getAttribute('aria-invalid') === 'true' || field.tagName === 'SELECT') showError(field);
      });
    });
  }

  function validateForm(form) {
    var fields = form.querySelectorAll('input, select, textarea');
    var firstBad = null;

    fields.forEach(function (field) {
      if (field.type === 'hidden') return;
      var ok = showError(field);
      if (!ok && !firstBad) firstBad = field;
    });

    if (firstBad) {
      firstBad.focus({ preventScroll: true });
      firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  }

  /* ---------------- Booking form ---------------- */
  var bookingSuccess = document.getElementById('booking-success');
  var bookAgain = document.getElementById('book-again');
  var dateField = document.getElementById('bk-date');

  if (dateField) {
    var today = new Date();
    var iso = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
    dateField.min = iso;
  }

  var photoInput = document.getElementById('bk-photo');
  var photoName = document.getElementById('bk-photo-name');

  if (photoInput && photoName) {
    photoInput.addEventListener('change', function () {
      var file = photoInput.files && photoInput.files[0];
      photoName.textContent = file ? 'Selected: ' + file.name : '';
    });
  }

  wireValidation(bookingForm);

  if (bookingForm) {
    bookingForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateForm(bookingForm)) return;

      /* No backend on this static page: the request is confirmed on screen.
         Hook up a form endpoint here (e.g. fetch to your form service) if needed. */
      if (bookingForm) bookingForm.hidden = true;
      if (bookingSuccess) {
        bookingSuccess.hidden = false;
        bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        var heading = bookingSuccess.querySelector('h3');
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }
    });
  }

  if (bookAgain && bookingForm) {
    bookAgain.addEventListener('click', function () {
      bookingForm.reset();
      bookingForm.querySelectorAll('[aria-invalid]').forEach(function (field) {
        field.removeAttribute('aria-invalid');
      });
      bookingForm.querySelectorAll('.error').forEach(function (slot) {
        slot.textContent = '';
      });
      if (photoName) photoName.textContent = '';
      bookingSuccess.hidden = true;
      bookingForm.hidden = false;
      var firstField = bookingForm.querySelector('input');
      if (firstField) firstField.focus({ preventScroll: true });
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------------- Contact form ---------------- */
  var contactForm = document.getElementById('contact-form');
  var contactSuccess = document.getElementById('contact-success');

  wireValidation(contactForm);

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!validateForm(contactForm)) return;

      /* No backend: show confirmation. Replace with your endpoint if needed. */
      contactForm.reset();
      if (contactSuccess) {
        contactSuccess.hidden = false;
        contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

})();
