// ─────────────────────────────────────────
// Tawfeer — Auth Helper
// ─────────────────────────────────────────

var AUTH_TOKEN_KEY = 'tawfeer_token';
var AUTH_USER_KEY  = 'tawfeer_user';

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getStoredUser() {
  var raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function storeAuth(token, user) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function isLoggedIn() {
  return !!getStoredToken() && !!getStoredUser();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

function requireGuest() {
  if (isLoggedIn()) {
    window.location.href = '/pages/chat.html';
    return false;
  }
  return true;
}

function logout() {
  var token = getStoredToken();
  if (token) {
    fetch('/api/auth/logout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    }).catch(function() {});
  }
  clearAuth();
  window.location.href = '/pages/login.html';
}