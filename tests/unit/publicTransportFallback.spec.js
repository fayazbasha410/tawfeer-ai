const {
    hasMetroSystem,
    getPublicTransportInfo,
    calculateModalShiftImpact,
    getPhysicalVisitFallback,
    PUBLIC_TRANSPORT
  } = require('../../src/utils/publicTransportFallback');
  
  const ALL_EMIRATES = [
    'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
    'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
  ];
  
  describe('publicTransportFallback — metro/bus physical visit fallback', () => {
  
    describe('hasMetroSystem — only Dubai has a metro', () => {
  
      it('Dubai has a metro system', () => {
        expect(hasMetroSystem('Dubai')).toBe(true);
      });
  
      it('every other emirate does NOT have a metro system', () => {
        const others = ALL_EMIRATES.filter(e => e !== 'Dubai');
        others.forEach(emirate => {
          expect(hasMetroSystem(emirate)).toBe(false);
        });
      });
  
      it('unknown emirate defaults to no metro', () => {
        expect(hasMetroSystem('Nowhereistan')).toBe(false);
      });
  
    });
  
    describe('getPublicTransportInfo — data integrity', () => {
  
      it('all 7 emirates have an entry', () => {
        ALL_EMIRATES.forEach(emirate => {
          expect(PUBLIC_TRANSPORT[emirate]).toBeDefined();
        });
      });
  
      it('every entry has authority and summary fields', () => {
        ALL_EMIRATES.forEach(emirate => {
          const info = getPublicTransportInfo(emirate);
          expect(typeof info.authority).toBe('string');
          expect(info.authority.length).toBeGreaterThan(0);
          expect(typeof info.summary).toBe('string');
          expect(info.summary.length).toBeGreaterThan(0);
        });
      });
  
      it('Dubai uses NOL card', () => {
        expect(getPublicTransportInfo('Dubai').card).toBe('NOL card');
      });
  
      it('Abu Dhabi uses Hafilat card, NOT NOL', () => {
        const info = getPublicTransportInfo('Abu Dhabi');
        expect(info.card).toBe('Hafilat card');
        expect(info.card).not.toBe('NOL card');
      });
  
      it('Sharjah uses Sayer card, NOT NOL', () => {
        const info = getPublicTransportInfo('Sharjah');
        expect(info.card).toBe('Sayer card');
        expect(info.card).not.toBe('NOL card');
      });
  
      it('unknown emirate falls back to a safe default, never throws', () => {
        const info = getPublicTransportInfo('Nowhereistan');
        expect(info.authority).toBeTruthy();
        expect(info.summary).toBeTruthy();
      });
  
    });
  
    describe('calculateModalShiftImpact — modal shift math', () => {
  
      it('0 km distance returns 0 impact, never throws', () => {
        const result = calculateModalShiftImpact(0);
        expect(result.fullCarCo2Kg).toBe(0);
        expect(result.co2SavedKg).toBe(0);
        expect(result.moneySavedAed).toBe(0);
      });
  
      it('negative or invalid distance is treated as 0, never negative output', () => {
        const result = calculateModalShiftImpact(-5);
        expect(result.co2SavedKg).toBeGreaterThanOrEqual(0);
        const result2 = calculateModalShiftImpact(undefined);
        expect(result2.co2SavedKg).toBeGreaterThanOrEqual(0);
      });
  
      it('CO2 saved is always less than full car CO2 (this is a reduction, not full avoidance)', () => {
        const result = calculateModalShiftImpact(20);
        expect(result.co2SavedKg).toBeLessThan(result.fullCarCo2Kg);
        expect(result.co2SavedKg).toBeGreaterThan(0);
      });
  
      it('reduction factor is exactly 0.65 and is exposed in the result', () => {
        const result = calculateModalShiftImpact(10);
        expect(result.reductionFactor).toBe(0.65);
      });
  
      it('full car CO2 matches the app-wide 192g/km constant for round trip', () => {
        // 20km round trip * 192g/km / 1000 = 3.84 kg
        const result = calculateModalShiftImpact(20);
        expect(result.fullCarCo2Kg).toBe(3.84);
      });
  
      it('co2SavedKg scales with distance', () => {
        const short = calculateModalShiftImpact(10);
        const long  = calculateModalShiftImpact(40);
        expect(long.co2SavedKg).toBeGreaterThan(short.co2SavedKg);
      });
  
      it('methodology string is present and non-empty (transparency requirement)', () => {
        const result = calculateModalShiftImpact(15);
        expect(typeof result.methodology).toBe('string');
        expect(result.methodology.length).toBeGreaterThan(0);
      });
  
    });
  
    describe('getPhysicalVisitFallback — full integration', () => {
  
      it('returns a complete result for every emirate with no area given', () => {
        ALL_EMIRATES.forEach(emirate => {
          const result = getPhysicalVisitFallback(emirate, null);
          expect(result.emirate).toBe(emirate);
          expect(result.centerName).toBeTruthy();
          expect(result.distanceKm).toBeGreaterThan(0);
          expect(result.co2SavedKg).toBeGreaterThan(0);
        });
      });
  
      it('never returns 0 distance even when area coordinates match the centre exactly', () => {
        // Dubai Marina area coords are effectively identical to the Marina/JBR
        // service point's own coords — this previously produced a 0km result.
        const result = getPhysicalVisitFallback('Dubai', 'Dubai Marina');
        expect(result.distanceKm).toBeGreaterThan(0);
        expect(result.co2SavedKg).toBeGreaterThan(0);
      });
  
      it('Dubai result reflects metro availability', () => {
        const result = getPhysicalVisitFallback('Dubai', 'Al Barsha');
        expect(result.hasMetro).toBe(true);
      });
  
      it('Sharjah result reflects no metro', () => {
        const result = getPhysicalVisitFallback('Sharjah', 'Muweilah');
        expect(result.hasMetro).toBe(false);
      });
  
      it('result includes real government centre data from govCentres', () => {
        const result = getPhysicalVisitFallback('Sharjah', 'Muweilah');
        expect(result.centerName).toContain('Sharjah');
        expect(result.centerAddress.length).toBeGreaterThan(0);
      });
  
      it('unknown area for a known emirate still returns a usable result', () => {
        const result = getPhysicalVisitFallback('Ajman', 'Some Unknown Place');
        expect(result.emirate).toBe('Ajman');
        expect(result.distanceKm).toBeGreaterThan(0);
      });
  
    });
  
  });  