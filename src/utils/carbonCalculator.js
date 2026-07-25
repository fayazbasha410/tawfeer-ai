// -----------------------------------------
// Tawfeer - Carbon Calculator
// UAE MoCCAE Methodology
// 192g CO2/km · Special 95 AED 2.89/L
// -----------------------------------------

const REGIONAL_HUBS = {
  DUBAI:     { name: 'RTA Customer Happiness Center (Al Barsha)',     roundTripKm: 18.4 },
  ABU_DHABI: { name: 'TAMM Customer Happiness Center (Khalifa City)', roundTripKm: 24.6 },
  SHARJAH:   { name: 'SRTA Customer Happiness Center (Al Jubail)',    roundTripKm: 22.1 },
  AJMAN:     { name: 'Ajman Police Traffic Department',               roundTripKm: 28.3 },
  RAK:       { name: 'RAK Police HQ Traffic and Licensing',           roundTripKm: 11.2 },
  FUJAIRAH:  { name: 'Fujairah Police Traffic and Licensing Centre',  roundTripKm: 34.8 },
  UAQ:       { name: 'UAQ Police Traffic Department Al Ramlah',       roundTripKm: 31.5 },
  DEFAULT:   { name: 'Regional Government Service Centre',            roundTripKm: 15.0 }
};

const UAE_METRICS = {
  CO2_PER_KM_GRAMS:  192,
  FUEL_LITERS_PER_KM: 0.08,
  PETROL_PRICE_AED:   2.89
};

function calculateDynamicMitigation(emirate, entity) {
  var target = ((emirate || '') + ' ' + (entity || '')).toUpperCase();
  var hub = REGIONAL_HUBS.DEFAULT;

  if (target.indexOf('DUBAI') !== -1 || target.indexOf('RTA') !== -1) {
    hub = REGIONAL_HUBS.DUBAI;
  } else if (target.indexOf('ABU DHABI') !== -1 || target.indexOf('TAMM') !== -1) {
    hub = REGIONAL_HUBS.ABU_DHABI;
  } else if (target.indexOf('SHARJAH') !== -1 || target.indexOf('SRTA') !== -1) {
    hub = REGIONAL_HUBS.SHARJAH;
  } else if (target.indexOf('AJMAN') !== -1) {
    hub = REGIONAL_HUBS.AJMAN;
  } else if (target.indexOf('RAK') !== -1 || target.indexOf('RAS AL') !== -1) {
    hub = REGIONAL_HUBS.RAK;
  } else if (target.indexOf('FUJAIRAH') !== -1) {
    hub = REGIONAL_HUBS.FUJAIRAH;
  } else if (target.indexOf('UAQ') !== -1 || target.indexOf('UMM AL') !== -1) {
    hub = REGIONAL_HUBS.UAQ;
  }

  var distanceSavedKm  = hub.roundTripKm;
  var co2SavedKg       = parseFloat(((distanceSavedKm * UAE_METRICS.CO2_PER_KM_GRAMS) / 1000).toFixed(2));
  var fuelSavedLiters  = parseFloat((distanceSavedKm * UAE_METRICS.FUEL_LITERS_PER_KM).toFixed(2));
  var moneySavedAed    = parseFloat((fuelSavedLiters * UAE_METRICS.PETROL_PRICE_AED).toFixed(2));

  return {
    centerName:     hub.name,
    distanceSavedKm: distanceSavedKm,
    co2SavedKg:      co2SavedKg,
    fuelSavedLiters: fuelSavedLiters,
    moneySavedAed:   moneySavedAed
  };
}

module.exports = {
  calculateDynamicMitigation: calculateDynamicMitigation,
  UAE_METRICS:                UAE_METRICS,
  REGIONAL_HUBS:              REGIONAL_HUBS
};