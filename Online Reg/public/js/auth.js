/**
 * Admin auth: login, token storage, protected redirect
 */
var PCHSAuth = (function () {
  var TOKEN_KEY = 'pchs_admin_token';
  var USER_KEY = 'pchs_admin_user';

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function setUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  function apiBase() {
    return window.location.origin || '';
  }

  function login(username, password) {
    return fetch(apiBase() + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (_ref) {
        var ok = _ref.ok,
          data = _ref.data;
        if (ok && data.token) {
          setToken(data.token);
          setUser(data.user || { username: username });
          return { success: true, user: data.user };
        }
        return { success: false, message: (data && data.message) || 'Login failed' };
      });
  }

  function requireAuth() {
    if (!getToken()) {
      window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname || 'admin.html');
      return false;
    }
    return true;
  }

  return {
    getToken: getToken,
    getUser: getUser,
    logout: logout,
    login: login,
    requireAuth: requireAuth,
  };
})();

// Login form on login.html
var loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    var errEl = document.getElementById('login-error');
    var submitBtn = loginForm.querySelector('button[type="submit"]');
    errEl.hidden = true;
    errEl.textContent = '';

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Signing in...';
    }

    PCHSAuth.login(username, password)
      .then(function (result) {
        if (result.success) {
          var params = new URLSearchParams(window.location.search);
          var redirect = params.get('redirect') || 'admin.html';
          window.location.href = redirect;
        } else {
          errEl.textContent = result.message || 'Invalid login name or password.';
          errEl.hidden = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
          }
        }
      })
      .catch(function (err) {
        var origin = window.location.origin;
        if (!origin || origin === 'file://' || origin === 'null') {
          errEl.textContent = 'Open this page through the server (e.g. http://localhost:3000/login.html), not as a file.';
        } else {
          errEl.textContent = 'Cannot reach server. Is the backend running at ' + origin + '?';
        }
        errEl.hidden = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Sign In';
        }
      });
  });
}
