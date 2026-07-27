// -----------------------------------------
// Tawfeer — Auth Routes
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// -----------------------------------------

var express  = require('express');
var router   = express.Router();
var bcrypt   = require('bcryptjs');
var crypto   = require('crypto');
var db       = require('../utils/supabase');

var VALID_EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
];

var DANGEROUS_PATTERN = /<|>|script|drop\s+table|insert\s+into|delete\s+from|select\s+\*/i;

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// POST /api/auth/register
router.post('/register', function(req, res) {
  var name     = (req.body.name     || '').trim();
  var email    = (req.body.email    || '').trim().toLowerCase();
  var password = (req.body.password || '');
  var emirate  = (req.body.emirate  || '').trim();

  if (!name || !email || !password || !emirate) {
    return res.status(400).json({ success: false, error: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
  }
  if (!VALID_EMIRATES.includes(emirate)) {
    return res.status(400).json({ success: false, error: 'Invalid emirate.' });
  }
  if (name.length > 200) {
    return res.status(400).json({ success: false, error: 'Name too long.' });
  }
  if (DANGEROUS_PATTERN.test(name)) {
    return res.status(400).json({ success: false, error: 'Invalid characters in name.' });
  }

  // Check if email already exists
  db.supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()
    .then(function(result) {
      if (result.data) {
        return res.status(409).json({
          success: false,
          code:    'EMAIL_EXISTS',
          error:   'An account with this email already exists. Please sign in.'
        });
      }

      var hash  = bcrypt.hashSync(password, 10);
      var token = generateToken();

      return db.supabase
        .from('users')
        .insert([{ name: name, email: email, password_hash: hash, emirate: emirate }])
        .select()
        .single()
        .then(function(insertResult) {
          if (insertResult.error) throw insertResult.error;
          var user = insertResult.data;

          return db.supabase
            .from('user_sessions')
            .insert([{ user_id: user.id, token: token }])
            .then(function() {
              return db.supabase
                .from('cumulative_impact')
                .update({ total_users: db.supabase.rpc ? undefined : undefined })
                .eq('id', 1)
                .then(function() {
                  return db.supabase.rpc('increment_user_count');
                })
                .catch(function() {});
            })
            .then(function() {
              return res.json({
                success: true,
                token:   token,
                user: {
                  id:      user.id,
                  name:    user.name,
                  email:   user.email,
                  emirate: user.emirate
                }
              });
            });
        });
    })
    .catch(function(err) {
      console.error('Register error:', err.message);
      return res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
    });
});

// POST /api/auth/login
router.post('/login', function(req, res) {
  var email    = (req.body.email    || '').trim().toLowerCase();
  var password = (req.body.password || '');

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  db.supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
    .then(function(result) {
      if (!result.data) {
        return res.status(404).json({
          success: false,
          code:    'USER_NOT_FOUND',
          error:   'No account found with this email.'
        });
      }

      var user = result.data;

      if (!user.password_hash) {
        return res.status(401).json({
          success: false,
          code:    'NO_PASSWORD',
          error:   'Please sign up again to set a password.'
        });
      }

      var valid = bcrypt.compareSync(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({
          success: false,
          code:    'WRONG_PASSWORD',
          error:   'Incorrect password.'
        });
      }

      var token = generateToken();

      return db.supabase
        .from('user_sessions')
        .insert([{ user_id: user.id, token: token }])
        .then(function() {
          return db.supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id);
        })
        .then(function() {
          return res.json({
            success: true,
            token:   token,
            user: {
              id:      user.id,
              name:    user.name,
              email:   user.email,
              emirate: user.emirate
            }
          });
        });
    })
    .catch(function(err) {
      console.error('Login error:', err.message);
      return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    });
});

// POST /api/auth/logout
router.post('/logout', function(req, res) {
  var authHeader = req.headers['authorization'] || '';
  var token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.json({ success: true });
  }

  db.supabase
    .from('user_sessions')
    .delete()
    .eq('token', token)
    .then(function() {
      return res.json({ success: true });
    })
    .catch(function() {
      return res.json({ success: true });
    });
});

module.exports = router;