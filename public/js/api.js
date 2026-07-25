// ─────────────────────────────────────────
// Tawfeer — API Helper
// ─────────────────────────────────────────

function authHeaders() {
    var token = getStoredToken();
    return {
      'Content-Type':  'application/json',
      'Authorization': token ? 'Bearer ' + token : ''
    };
  }
  
  var TawfeerAPI = {
  
    register: function(name, email, password, emirate) {
      return fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name, email: email, password: password, emirate: emirate })
      }).then(function(r) { return r.json(); });
    },
  
    login: function(email, password) {
      return fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email, password: password })
      }).then(function(r) { return r.json(); });
    },
  
    chat: function(message, sessionId) {
      return fetch('/api/chat', {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify({ message: message, sessionId: sessionId })
      }).then(function(r) { return r.json(); });
    },
  
    logTrip: function(data) {
      return fetch('/api/impact/trip', {
        method:  'POST',
        headers: authHeaders(),
        body:    JSON.stringify(data)
      }).then(function(r) { return r.json(); });
    },
  
    getImpact: function() {
      return fetch('/api/impact').then(function(r) { return r.json(); });
    },
  
    clearSession: function(sessionId) {
      return fetch('/api/session/' + sessionId, {
        method:  'DELETE',
        headers: authHeaders()
      }).then(function(r) { return r.json(); });
    }
  
  };  