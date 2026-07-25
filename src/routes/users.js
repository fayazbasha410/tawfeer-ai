// -----------------------------------------
// Tawfeer - User Registration Routes
// -----------------------------------------

var express = require('express');
var router  = express.Router();
var db      = require('../utils/supabase');

// POST /api/users/register
router.post('/register', function(req, res) {
  var name    = req.body.name;
  var email   = req.body.email;
  var emirate = req.body.emirate;

  if (!name || !email || !emirate) {
    return res.status(400).json({
      error: 'Missing required fields: name, email, emirate'
    });
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  db.registerUser({ name: name, email: email, emirate: emirate })
    .then(function(result) {
      var user  = result.user;
      var isNew = result.isNew;
      return res.json({
        success: true,
        isNew:   isNew,
        user: {
          id:      user.id,
          name:    user.name,
          emirate: user.emirate,
          email:   user.email
        },
        message: isNew
          ? 'Welcome to Tawfeer ' + user.name + '! Every question you ask here is a trip saved.'
          : 'Welcome back ' + user.name + '! Ready to save more trips?'
      });
    })
    .catch(function(err) {
      console.error('Registration error:', err.message);
      return res.status(500).json({ error: 'Registration failed', detail: err.message });
    });
});

module.exports = router;