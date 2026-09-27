/*
 * Funcionalidades interactivas del portafolio — Kevin Naranjo
 *   1. Menú lateral (drawer) para móvil y tablet
 *   2. Switch de tema claro/oscuro con persistencia en localStorage
 *   3. Filtro de proyectos por categoría
 *   4. Validación del formulario de contacto
 *   (Extra) Valores en vivo de los colores en el Design System
 */

document.addEventListener('DOMContentLoaded', function () {
  initDrawer();
  initThemeSwitch();
  initProjectFilter();
  initContactForm();
  initColorTokens();
});

/* 1. Menú lateral (drawer)
   ========================================================================== */
function initDrawer() {
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('nav-drawer');
  var overlay = document.querySelector('.nav-overlay');
  if (!toggle || !drawer || !overlay) return;

  var desktopQuery = window.matchMedia('(min-width: 56.25em)');

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
    document.body.classList.add('no-scroll');
    var firstLink = drawer.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  function closeDrawer(returnFocus) {
    drawer.classList.remove('is-open');
    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
    document.body.classList.remove('no-scroll');
    if (returnFocus) toggle.focus();
  }

  function isOpen() {
    return drawer.classList.contains('is-open');
  }

  toggle.addEventListener('click', function () {
    if (isOpen()) {
      closeDrawer(false);
    } else {
      openDrawer();
    }
  });

  overlay.addEventListener('click', function () {
    closeDrawer(false);
  });

  drawer.addEventListener('click', function (event) {
    if (event.target.closest('a')) closeDrawer(false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isOpen()) closeDrawer(true);
  });

  // Si la ventana pasa a tamaño escritorio con el menú abierto, se cierra.
  desktopQuery.addEventListener('change', function (event) {
    if (event.matches && isOpen()) closeDrawer(false);
  });
}

/* 2. Switch de tema claro/oscuro
   ========================================================================== */
function initThemeSwitch() {
  var switches = document.querySelectorAll('.theme-switch');
  if (!switches.length) return;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  // Sincroniza todos los switches de la página con el tema activo.
  function syncSwitches() {
    var isDark = currentTheme() === 'dark';
    switches.forEach(function (button) {
      button.setAttribute('aria-checked', String(isDark));
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (error) {
      // Sin acceso a localStorage el tema funciona igual, solo no se recuerda.
    }
    syncSwitches();
    document.dispatchEvent(new CustomEvent('themechange'));
  }

  switches.forEach(function (button) {
    button.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  });

  syncSwitches();
}

/* 3. Filtro de proyectos
   ========================================================================== */
function initProjectFilter() {
  var buttons = document.querySelectorAll('.filter-btn[data-filter]');
  var items = document.querySelectorAll('.project-grid__item');
  var status = document.querySelector('.filter-status');
  if (!buttons.length || !items.length) return;

  function applyFilter(filter, label) {
    var visible = 0;

    items.forEach(function (item) {
      var matches = filter === 'todos' || item.dataset.category === filter;
      item.hidden = !matches;
      if (matches) visible++;
    });

    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });

    if (!status) return;
    if (visible === 0) {
      status.textContent = 'Aún no hay proyectos en la categoría ' + label + '.';
    } else if (filter === 'todos') {
      status.textContent = 'Mostrando todos los proyectos (' + visible + ').';
    } else {
      status.textContent = 'Mostrando ' + visible + (visible === 1 ? ' proyecto' : ' proyectos') + ' de la categoría ' + label + '.';
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      applyFilter(button.dataset.filter, button.textContent.trim());
    });
  });
}

/* 4. Validación del formulario de contacto
   ========================================================================== */
function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var rules = {
    nombre: function (value) {
      if (!value) return 'Escribe tu nombre.';
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/.test(value)) return 'El nombre solo puede contener letras y espacios.';
      return '';
    },
    correo: function (value) {
      if (!value) return 'Escribe tu correo electrónico.';
      if (!emailPattern.test(value)) return 'Ingresa un correo electrónico válido, por ejemplo nombre@dominio.com.';
      return '';
    },
    mensaje: function (value) {
      if (!value) return 'Escribe tu mensaje.';
      if (value.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
      return '';
    }
  };

  function validateField(field) {
    var message = rules[field.name](field.value.trim());
    var errorElement = document.getElementById(field.name + '-error');

    errorElement.textContent = message;
    if (message) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
    return !message;
  }

  Object.keys(rules).forEach(function (name) {
    var field = form.elements[name];

    // Valida al salir del campo, y mientras se escribe si ya tenía un error.
    field.addEventListener('blur', function () {
      if (field.value.trim()) validateField(field);
    });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (!validateField(field) && !firstInvalid) firstInvalid = field;
    });

    status.className = 'form-status';

    if (firstInvalid) {
      status.classList.add('form-status--error');
      status.textContent = 'Revisa los campos marcados antes de enviar.';
      firstInvalid.focus();
      return;
    }

    var name = form.elements.nombre.value.trim().split(/\s+/)[0];
    status.classList.add('form-status--success');
    status.textContent = '¡Gracias, ' + name + '! Tu mensaje fue validado correctamente.';
    form.reset();
  });
}

/* Extra: valores de color en vivo en el Design System
   ========================================================================== */
function initColorTokens() {
  var values = document.querySelectorAll('[data-token]');
  if (!values.length) return;

  function update() {
    var styles = getComputedStyle(document.documentElement);
    values.forEach(function (element) {
      var value = styles.getPropertyValue(element.dataset.token).trim();
      if (value) element.textContent = value;
    });
  }

  update();
  document.addEventListener('themechange', update);
}
