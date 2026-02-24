/**
 * Dark / Light theme toggle – preference saved in localStorage
 */
(function () {
  var STORAGE_KEY = 'pchs_theme';

  function getTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch (e) {
      return 'light';
    }
  }

  function setTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
    document.body.classList.toggle('theme-dark', value === 'dark');
    updateToggleLabels();
  }

  function updateToggleLabels() {
    var isDark = document.body.classList.contains('theme-dark');
    document.querySelectorAll('.theme-toggle .theme-label').forEach(function (el) {
      el.textContent = isDark ? 'Light' : 'Dark';
    });
    document.querySelectorAll('.theme-toggle .theme-icon').forEach(function (el) {
      el.innerHTML = isDark ? sunSvg() : moonSvg();
    });
  }

  function sunSvg() {
    return '<svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/></svg>';
  }

  function moonSvg() {
    return '<svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>';
  }

  function init() {
    var theme = getTheme();
    document.body.classList.toggle('theme-dark', theme === 'dark');
    updateToggleLabels();

    document.querySelectorAll('.theme-toggle').forEach(function (btn) {
      btn.removeEventListener('click', onToggle);
      btn.addEventListener('click', onToggle);
    });
  }

  function onToggle() {
    var isDark = document.body.classList.contains('theme-dark');
    setTheme(isDark ? 'light' : 'dark');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PCHSTheme = { getTheme: getTheme, setTheme: setTheme };
})();
