const {
  calculateDynamicMitigation,
  UAE_METRICS,
  REGIONAL_HUBS
} = require('../../src/utils/carbonCalculator');

describe('carbonCalculator — UAE MoCCAE methodology', () => {

  describe('UAE_METRICS constants', () => {

    it('CO2 per km is exactly 192g as per MoCCAE baseline', () => {
      expect(UAE_METRICS.CO2_PER_KM_GRAMS).toBe(192);
    });

    it('fuel consumption is 0.08 L/km', () => {
      expect(UAE_METRICS.FUEL_LITERS_PER_KM).toBe(0.08);
    });

    it('petrol price is AED 2.89/L (Special 95, July 2026)', () => {
      expect(UAE_METRICS.PETROL_PRICE_AED).toBe(2.89);
    });

  });

  describe('calculateDynamicMitigation — emirate routing', () => {

    it('routes "Dubai" to RTA hub with correct round trip km', () => {
      const result = calculateDynamicMitigation('Dubai', '');
      expect(result.centerName).toContain('RTA');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.DUBAI.roundTripKm);
    });

    it('routes "Abu Dhabi" to TAMM hub', () => {
      const result = calculateDynamicMitigation('Abu Dhabi', '');
      expect(result.centerName).toContain('TAMM');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.ABU_DHABI.roundTripKm);
    });

    it('routes "Sharjah" emirate to SRTA hub', () => {
      const result = calculateDynamicMitigation('Sharjah', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.SHARJAH.roundTripKm);
    });

    it('routes "Ajman" to Ajman hub', () => {
      const result = calculateDynamicMitigation('Ajman', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.AJMAN.roundTripKm);
    });

    it('routes "Ras Al Khaimah" correctly', () => {
      const result = calculateDynamicMitigation('Ras Al Khaimah', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.RAK.roundTripKm);
    });

    it('routes "RAK" abbreviation correctly', () => {
      const result = calculateDynamicMitigation('RAK', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.RAK.roundTripKm);
    });

    it('routes "Fujairah" correctly', () => {
      const result = calculateDynamicMitigation('Fujairah', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.FUJAIRAH.roundTripKm);
    });

    it('routes "Umm Al Quwain" correctly', () => {
      const result = calculateDynamicMitigation('Umm Al Quwain', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.UAQ.roundTripKm);
    });

    it('routes "UAQ" abbreviation correctly', () => {
      const result = calculateDynamicMitigation('UAQ', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.UAQ.roundTripKm);
    });

    it('falls back to DEFAULT hub for unknown emirate', () => {
      const result = calculateDynamicMitigation('Antarctica', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.DEFAULT.roundTripKm);
    });

    it('falls back to DEFAULT for empty emirate string', () => {
      const result = calculateDynamicMitigation('', '');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.DEFAULT.roundTripKm);
    });

    it('falls back to DEFAULT for null emirate', () => {
      const result = calculateDynamicMitigation(null, null);
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.DEFAULT.roundTripKm);
    });

    it('routes by entity — RTA keyword maps to Dubai hub', () => {
      const result = calculateDynamicMitigation('', 'RTA Customer Happiness Centre');
      expect(result.centerName).toContain('RTA');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.DUBAI.roundTripKm);
    });

    it('routes by entity — TAMM keyword maps to Abu Dhabi hub', () => {
      const result = calculateDynamicMitigation('', 'TAMM Service Centre Abu Dhabi');
      expect(result.centerName).toContain('TAMM');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.ABU_DHABI.roundTripKm);
    });

    it('SRTA entity triggers RTA substring match — returns Dubai hub (known app behavior)', () => {
      // "SRTA" contains "RTA" so the Dubai if-branch fires first in the chain
      // This documents a known limitation in carbonCalculator.js entity routing
      const result = calculateDynamicMitigation('', 'SRTA office');
      expect(result.distanceSavedKm).toBe(REGIONAL_HUBS.DUBAI.roundTripKm);
    });

  });

  describe('CO2 math — exact formula validation', () => {

    it('Dubai CO2 = roundTripKm x 192g / 1000', () => {
      const result   = calculateDynamicMitigation('Dubai', '');
      const expected = parseFloat(((REGIONAL_HUBS.DUBAI.roundTripKm * 192) / 1000).toFixed(2));
      expect(result.co2SavedKg).toBe(expected);
    });

    it('Abu Dhabi CO2 = roundTripKm x 192g / 1000', () => {
      const result   = calculateDynamicMitigation('Abu Dhabi', '');
      const expected = parseFloat(((REGIONAL_HUBS.ABU_DHABI.roundTripKm * 192) / 1000).toFixed(2));
      expect(result.co2SavedKg).toBe(expected);
    });

    it('Fujairah CO2 = roundTripKm x 192g / 1000', () => {
      const result   = calculateDynamicMitigation('Fujairah', '');
      const expected = parseFloat(((REGIONAL_HUBS.FUJAIRAH.roundTripKm * 192) / 1000).toFixed(2));
      expect(result.co2SavedKg).toBe(expected);
    });

    it('co2SavedKg has at most 2 decimal places', () => {
      const result   = calculateDynamicMitigation('Dubai', '');
      const decimals = (result.co2SavedKg.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });

  });

  describe('Fuel math', () => {

    it('Dubai fuel = roundTripKm x 0.08 L/km', () => {
      const result   = calculateDynamicMitigation('Dubai', '');
      const expected = parseFloat((REGIONAL_HUBS.DUBAI.roundTripKm * 0.08).toFixed(2));
      expect(result.fuelSavedLiters).toBe(expected);
    });

    it('fuelSavedLiters has at most 2 decimal places', () => {
      const result   = calculateDynamicMitigation('Sharjah', '');
      const decimals = (result.fuelSavedLiters.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });

  });

  describe('Money math', () => {

    it('money = fuelSavedLiters x AED 2.89', () => {
      const result   = calculateDynamicMitigation('Dubai', '');
      const expected = parseFloat((result.fuelSavedLiters * 2.89).toFixed(2));
      expect(result.moneySavedAed).toBe(expected);
    });

    it('moneySavedAed has at most 2 decimal places', () => {
      const result   = calculateDynamicMitigation('Ajman', '');
      const decimals = (result.moneySavedAed.toString().split('.')[1] || '').length;
      expect(decimals).toBeLessThanOrEqual(2);
    });

  });

  describe('Return value schema', () => {

    it('result contains all required fields', () => {
      const result = calculateDynamicMitigation('Dubai', '');
      expect(typeof result.centerName).toBe('string');
      expect(result.centerName.length).toBeGreaterThan(0);
      expect(typeof result.distanceSavedKm).toBe('number');
      expect(typeof result.co2SavedKg).toBe('number');
      expect(typeof result.fuelSavedLiters).toBe('number');
      expect(typeof result.moneySavedAed).toBe('number');
    });

    it('all numeric values are positive for every valid emirate', () => {
      const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
      for (const emirate of emirates) {
        const r = calculateDynamicMitigation(emirate, '');
        expect(r.distanceSavedKm).toBeGreaterThan(0);
        expect(r.co2SavedKg).toBeGreaterThan(0);
        expect(r.fuelSavedLiters).toBeGreaterThan(0);
        expect(r.moneySavedAed).toBeGreaterThan(0);
      }
    });

  });

});