/* ============================================================
   CRDECORADORES® — main.js
   - Header scroll state
   - Mobile menu toggle
   - Smooth scroll + offset for fixed header
   - Intersection Observer scroll reveals
   - Hero parallax
   - Contact form validation
   ============================================================ */

(function () {
  'use strict';

  const header      = document.getElementById('header');
  const menuToggle  = document.getElementById('menuToggle');
  const headerNav   = document.getElementById('headerNav');
  const heroBg      = document.getElementById('heroBg');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const submitBtn   = document.getElementById('submitBtn');

  /* ==================== HEADER — scroll state ==================== */
  function updateHeader() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ==================== MOBILE MENU ==================== */
  if (menuToggle && headerNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = headerNav.classList.toggle('open');
      menuToggle.classList.toggle('active', isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen.toString());
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    headerNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        headerNav.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && headerNav.classList.contains('open')) {
        headerNav.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuToggle.focus();
      }
    });
  }

  /* ==================== SMOOTH SCROLL (offset for header) ==================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '72',
        10
      );
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ==================== SCROLL REVEAL (Intersection Observer) ==================== */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all immediately
    revealEls.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ==================== HERO PARALLAX ==================== */
  if (heroBg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let ticking = false;

    function updateParallax() {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + (scrolled * 0.28) + 'px)';
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ==================== CONTACT FORM VALIDATION ==================== */
  if (contactForm) {
    const fields = {
      nombre:   { el: document.getElementById('nombre'),   err: document.getElementById('nombreError') },
      email:    { el: document.getElementById('email'),    err: document.getElementById('emailError') },
      proyecto: { el: document.getElementById('proyecto'), err: document.getElementById('proyectoError') },
      mensaje:  { el: document.getElementById('mensaje'),  err: document.getElementById('mensajeError') },
    };

    function validateEmail(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    }

    function setFieldError(field, msg) {
      field.el.classList.toggle('error', !!msg);
      field.err.textContent = msg || '';
    }

    function clearError(field) {
      setFieldError(field, '');
    }

    // Clear errors on input
    Object.values(fields).forEach(function (field) {
      field.el.addEventListener('input', function () { clearError(field); });
      field.el.addEventListener('change', function () { clearError(field); });
    });

    function validate() {
      let valid = true;

      if (!fields.nombre.el.value.trim()) {
        setFieldError(fields.nombre, 'El nombre es obligatorio.');
        valid = false;
      }

      if (!fields.email.el.value.trim()) {
        setFieldError(fields.email, 'El email es obligatorio.');
        valid = false;
      } else if (!validateEmail(fields.email.el.value)) {
        setFieldError(fields.email, 'Ingresá un email válido.');
        valid = false;
      }

      if (!fields.proyecto.el.value) {
        setFieldError(fields.proyecto, 'Seleccioná el tipo de proyecto.');
        valid = false;
      }

      if (!fields.mensaje.el.value.trim() || fields.mensaje.el.value.trim().length < 10) {
        setFieldError(fields.mensaje, 'Escribí un mensaje de al menos 10 caracteres.');
        valid = false;
      }

      return valid;
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      formSuccess.classList.remove('visible');

      if (!validate()) {
        // Focus first invalid field
        const firstError = contactForm.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simula envío (reemplazá esto con tu integración real: Formspree, EmailJS, etc.)
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      setTimeout(function () {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        contactForm.reset();
        formSuccess.textContent = 'Tu consulta fue enviada. Te respondemos a la brevedad.';
        formSuccess.classList.add('visible');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 1600);
    });
  }

  /* ==================== GALLERY KEYBOARD ACCESSIBILITY ==================== */
  document.querySelectorAll('.gallery-item').forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        // Extendible: abrir lightbox en el futuro
      }
    });
  });

})();
