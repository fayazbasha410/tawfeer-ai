// ─────────────────────────────────────────
// Tawfeer — Agent Tools
// Emirate-aware appointment booking
// Fine status check
// ─────────────────────────────────────────

var BOOKING_SYSTEMS = {
  'Dubai':          { name: 'RTA Dubai',       prefix: 'RTA',  portal: 'rta.ae',                           app: 'Dubai Drive App' },
  'Abu Dhabi':      { name: 'TAMM Abu Dhabi',  prefix: 'TAMM', portal: 'tamm.abudhabi',                    app: 'TAMM App' },
  'Sharjah':        { name: 'Sharjah Police',  prefix: 'SHJ',  portal: 'shjpolice.gov.ae',                 app: 'MOI UAE App' },
  'Ajman':          { name: 'Ajman Police',    prefix: 'AJM',  portal: 'ajmanpolice.ae',                   app: 'AjmanOne App' },
  'Ras Al Khaimah': { name: 'RAK Police',      prefix: 'RAK',  portal: 'rakpolice.gov.ae',                 app: 'MOI UAE App' },
  'Fujairah':       { name: 'Fujairah Police', prefix: 'FUJ',  portal: 'eservice.fujairahpolice.gov.ae',   app: 'MOI UAE App' },
  'Umm Al Quwain':  { name: 'UAQ Police',      prefix: 'UAQ',  portal: 'uaqpolice.gov.ae',                 app: 'MOI UAE App' },
};

var SERVICE_LABELS = {
  'driving-license':      'Driving License',
  'vehicle-registration': 'Vehicle Registration',
  'emirates-id':          'Emirates ID',
  'residency-visa':       'Residency Visa',
  'health-card':          'Health Card',
};

// Simulate fine lookup
// In production: connect to MOI UAE API
var FINES_DB = {
  'AD-1234':   { unpaidTotal: 400,  fines: [{ type: 'Speeding 20km/h over limit', amount: 400,  date: '2026-06-15', location: 'Sheikh Zayed Road, Abu Dhabi' }] },
  'DXB-5678':  { unpaidTotal: 800,  fines: [{ type: 'Red light violation',         amount: 800,  date: '2026-05-20', location: 'Al Maktoum Bridge, Dubai' }] },
  'SHJ-9999':  { unpaidTotal: 200,  fines: [{ type: 'Illegal parking',             amount: 200,  date: '2026-07-01', location: 'Rolla Square, Sharjah' }] },
  'AJM-1111':  { unpaidTotal: 600,  fines: [{ type: 'Mobile phone while driving',  amount: 600,  date: '2026-06-30', location: 'Sheikh Ammar Road, Ajman' }] },
};

function checkFineStatus(plateNumber) {
  var plate = (plateNumber || '').toUpperCase().replace(/\s/g, '-');
  var record = FINES_DB[plate];

  if (record && record.unpaidTotal > 0) {
    var fineDetails = record.fines.map(function(f) {
      return f.type + ' — AED ' + f.amount + ' (' + f.date + ')';
    }).join(', ');
    return {
      plateNumber:  plateNumber,
      unpaidTotal:  record.unpaidTotal,
      fines:        record.fines,
      message:      'You have AED ' + record.unpaidTotal + ' in unpaid fines for plate ' + plateNumber + '. ' +
                    'Violation: ' + fineDetails + '. ' +
                    'Pay online at moi.gov.ae, the MOI UAE app, Dubai Drive app (Dubai), or TAMM app (Abu Dhabi).',
    };
  }

  return {
    plateNumber:  plateNumber,
    unpaidTotal:  0,
    fines:        [],
    message:      'No outstanding fines found for plate ' + plateNumber + '. Your record is clear. ✅',
  };
}

function bookAppointment(service, date, emirate) {
  // Use emirate to pick correct booking authority
  var normalizedEmirate = emirate || 'Dubai';

  // Normalize common variations
  var emirateMap = {
    'abu dhabi': 'Abu Dhabi',
    'abudhabi':  'Abu Dhabi',
    'tamm':      'Abu Dhabi',
    'dubai':     'Dubai',
    'rta':       'Dubai',
    'sharjah':   'Sharjah',
    'ajman':     'Ajman',
    'rak':       'Ras Al Khaimah',
    'ras al khaimah': 'Ras Al Khaimah',
    'fujairah':  'Fujairah',
    'uaq':       'Umm Al Quwain',
    'umm al quwain': 'Umm Al Quwain',
  };

  var key = emirateMap[normalizedEmirate.toLowerCase()] || normalizedEmirate;
  var system = BOOKING_SYSTEMS[key] || BOOKING_SYSTEMS['Dubai'];
  var serviceLabel = SERVICE_LABELS[service] || service;
  var today = new Date();
  today.setDate(today.getDate() + 3);
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0');
  var yyyy = today.getFullYear();
  var appointmentDate = yyyy + '-' + mm + '-' + dd;
  if (!date || date.startsWith('2024')) date = appointmentDate;
  var ref = system.prefix + '-' + Math.random().toString(36).slice(2, 10).toUpperCase();

  return {
    success:            true,
    confirmationNumber: ref,
    service:            serviceLabel,
    date:               date,
    system:             system.name,
    portal:             system.portal,
    app:                system.app,
    location:           system.name + ' Service Centre',
    emirate:            key,
    message:            'Appointment confirmed via ' + system.name + '! Reference: ' + ref +
                        '. Service: ' + serviceLabel + '. Date: ' + date + '.',
  };
}

module.exports = { checkFineStatus, bookAppointment, BOOKING_SYSTEMS };