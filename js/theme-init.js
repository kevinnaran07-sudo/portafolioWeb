/*
 * Aplica el tema guardado antes de que se pinte la página,
 * para evitar un destello del tema claro al recargar en modo oscuro.
 * Se carga en el <head> sin defer a propósito.
 */
(function () {
  var theme = null;

  try {
    theme = localStorage.getItem('theme');
  } catch (error) {
    theme = null;
  }

  if (theme !== 'light' && theme !== 'dark') {
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', theme);
})();
