// -----------------------------------------
// Tawfeer - Impact Routes
// -----------------------------------------

var express = require('express');
var router  = express.Router();
var db      = require('../utils/supabase');

// GET /api/impact
router.get('/', function(req, res) {
  db.getCumulativeImpact()
    .then(function(impact) {
      return res.json({
        totalUsers:  impact.total_users,
        totalTrips:  impact.total_trips,
        totalKm:     impact.total_km,
        totalCo2:    impact.total_co2,
        lastUpdated: impact.last_updated
      });
    })
    .catch(function(err) {
      console.error('Impact fetch error:', err.message);
      return res.status(500).json({ error: 'Could not fetch impact data' });
    });
});

// POST /api/impact/trip
router.post('/trip', function(req, res) {
  var userId        = req.body.userId;
  var questionAsked = req.body.questionAsked;
  var centerName    = req.body.centerName;
  var distanceKm    = req.body.distanceKm;
  var co2Kg         = req.body.co2Kg;
  var fuelLiters    = req.body.fuelLiters;
  var moneyAed      = req.body.moneyAed;
  var emirate       = req.body.emirate;

  if (!userId || !distanceKm) {
    return res.status(400).json({ error: 'Missing userId or distanceKm' });
  }
  if (typeof distanceKm !== 'number' || distanceKm <= 0) {
    return res.status(400).json({ error: 'distanceKm must be a positive number' });
  }  

  db.logTrip({
    userId:        userId,
    questionAsked: questionAsked,
    centerName:    centerName,
    distanceKm:    distanceKm,
    co2Kg:         co2Kg,
    fuelLiters:    fuelLiters,
    moneyAed:      moneyAed,
    emirate:       emirate
  })
    .then(function(trip) {
      return db.getCumulativeImpact().then(function(impact) {
        return res.json({
          success: true,
          trip:    trip,
          newTotals: {
            totalKm:    impact.total_km,
            totalCo2:   impact.total_co2,
            totalTrips: impact.total_trips
          }
        });
      });
    })
    .catch(function(err) {
      console.error('Trip log error:', err.message);
      return res.status(500).json({ error: 'Could not log trip', detail: err.message });
    });
});

// GET /api/impact/admin
router.get('/admin', function(req, res) {
  var adminKey = req.headers['x-admin-key'];
  if ((adminKey || '').trim() !== (process.env.ADMIN_KEY || '').trim()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  Promise.all([
    db.getAllUsers(),
    db.getAllTrips(),
    db.getCumulativeImpact()
  ])
    .then(function(results) {
      return res.json({
        users:  results[0],
        trips:  results[1],
        impact: results[2]
      });
    })
    .catch(function(err) {
      return res.status(500).json({ error: err.message });
    });
});

module.exports = router;