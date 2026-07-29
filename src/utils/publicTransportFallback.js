// ─────────────────────────────────────────
// Tawfeer — Physical Visit Public Transport Fallback
// When a service genuinely requires an in-person visit (can't be
// resolved digitally), suggest public transport instead of driving
// as a lower-carbon alternative, and estimate the emissions reduction.
// Source facts: src/data/policies.js (public transport option entries
// per emirate) — this module only formats/calculates, doesn't invent facts.
// ─────────────────────────────────────────

const { findNearestCentre, UAE_METRICS } = require('./govCentres');

// Per-emirate public transport summary. Dubai is the only emirate with
// a metro system; every other emirate is bus/taxi-based per the app's
// existing verified policy data.
const PUBLIC_TRANSPORT = {
  'Dubai': {
    hasMetro:  true,
    card:      'NOL card',
    authority: 'RTA',
    summary:   "Dubai Metro (Red & Green lines), buses, tram, and water bus. Plan your route with the S'hail app."
  },
  'Abu Dhabi': {
    hasMetro:  false,
    card:      'Hafilat card',
    authority: 'ITC (Integrated Transport Centre)',
    summary:   'City buses (ICAD/Transdev), Al Reem Bus, and water taxis. No metro system yet.'
  },
  'Sharjah': {
    hasMetro:  false,
    card:      'Sayer card',
    authority: 'SRTA (Sharjah Roads and Transport Authority)',
    summary:   'SRTA city buses and Mowasalat services. No metro system.'
  },
  'Ajman': {
    hasMetro:  false,
    card:      null,
    authority: 'Ajman city buses / RTA inter-emirate buses',
    summary:   "Limited city bus network. RTA inter-emirate bus (route E401) connects to Dubai's Union Metro Station — pay with a NOL card. No metro or tram."
  },
  'Ras Al Khaimah': {
    hasMetro:  false,
    card:      null,
    authority: 'RAK Transport Authority',
    summary:   'Limited city bus routes, plus an RAK–Dubai intercity bus to Union Metro Station. No metro or tram.'
  },
  'Fujairah': {
    hasMetro:  false,
    card:      null,
    authority: 'Fujairah city buses',
    summary:   'Limited city routes, plus a Fujairah–Dubai intercity bus to Union Metro Station. No metro or tram.'
  },
  'Umm Al Quwain': {
    hasMetro:  false,
    card:      null,
    authority: 'Local taxi / shared transport',
    summary:   'Minimal public transport — mainly taxis and shared transport to Sharjah or Dubai. No metro, tram, or extensive bus network.'
  }
};

const DEFAULT_TRANSPORT_INFO = {
  hasMetro:  false,
  card:      null,
  authority: 'Local transport authority',
  summary:   'Public transport details are limited for this area — check with the local transport authority or use a taxi service.'
};

// Illustrative estimate: choosing public transport over a private car for
// the SAME physical trip reduces per-trip emissions by roughly this factor.
// This is NOT full trip avoidance — the visit still happens, just via a
// lower-carbon mode of transport instead of driving.
const MODAL_SHIFT_REDUCTION_FACTOR = 0.65;

function hasMetroSystem(emirate) {
  const info = PUBLIC_TRANSPORT[emirate];
  return !!(info && info.hasMetro);
}

function getPublicTransportInfo(emirate) {
  return PUBLIC_TRANSPORT[emirate] || DEFAULT_TRANSPORT_INFO;
}

function calculateModalShiftImpact(roundTripKm) {
  const km = (typeof roundTripKm === 'number' && roundTripKm > 0) ? roundTripKm : 0;

  const fullCarCo2Kg    = +((km * UAE_METRICS.CO2_PER_KM_GRAMS) / 1000).toFixed(2);
  const fullCarFuelL    = +(km * UAE_METRICS.FUEL_LITERS_PER_KM).toFixed(2);
  const fullCarMoneyAed = +(fullCarFuelL * UAE_METRICS.PETROL_PRICE_AED).toFixed(2);

  const co2SavedKg    = +(fullCarCo2Kg * MODAL_SHIFT_REDUCTION_FACTOR).toFixed(2);
  const moneySavedAed = +(fullCarMoneyAed * MODAL_SHIFT_REDUCTION_FACTOR).toFixed(2);

  return {
    fullCarCo2Kg:    fullCarCo2Kg,
    co2SavedKg:      co2SavedKg,
    moneySavedAed:   moneySavedAed,
    reductionFactor: MODAL_SHIFT_REDUCTION_FACTOR,
    methodology:     'Illustrative estimate: public transport reduces per-trip emissions by ~65% vs a private car for the same distance. This is a reduction, not full avoidance — the visit still takes place.'
  };
}

// Main entry point: given an emirate and (optionally) the user's area,
// return a full public-transport fallback suggestion for a visit that
// cannot be resolved digitally.
function getPhysicalVisitFallback(emirate, area) {
  const transitInfo  = getPublicTransportInfo(emirate);
  const centreResult = findNearestCentre(emirate, area);
  let   distKm       = centreResult.distanceKm;

  // Safety check — never return 0 (same defaults as govCentres.calculateImpact)
  if (!distKm || distKm <= 0) {
    const defaults = {
      'Dubai': 10.0, 'Abu Dhabi': 15.0, 'Sharjah': 8.0,
      'Ajman': 6.0, 'Ras Al Khaimah': 9.0,
      'Fujairah': 7.0, 'Umm Al Quwain': 5.0
    };
    distKm = defaults[emirate] || 10.0;
  }

  const roundTripKm = +(distKm * 2).toFixed(1);
  const impact      = calculateModalShiftImpact(roundTripKm);

  return {
    emirate:       emirate,
    hasMetro:      transitInfo.hasMetro,
    authority:     transitInfo.authority,
    card:          transitInfo.card,
    summary:       transitInfo.summary,
    centerName:    centreResult.centre.name,
    centerAddress: centreResult.centre.address,
    distanceKm:    roundTripKm,
    fullCarCo2Kg:    impact.fullCarCo2Kg,
    co2SavedKg:      impact.co2SavedKg,
    moneySavedAed:   impact.moneySavedAed,
    reductionFactor: impact.reductionFactor,
    methodology:     impact.methodology
  };
}

module.exports = {
  PUBLIC_TRANSPORT,
  hasMetroSystem,
  getPublicTransportInfo,
  calculateModalShiftImpact,
  getPhysicalVisitFallback
};