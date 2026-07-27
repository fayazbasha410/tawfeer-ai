const { test, expect } = require('../../fixtures/fixtures');
const { AREAS, CARBON_CASES } = require('../../data/testData');
const { assertImpactSchema, assertCarbonMath } = require('../../helpers/testHelpers');
const { TEST_USER } = require('../../fixtures/fixtures');


function newSession() {
  return `trip_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}


test.describe('Given the trip confirmation flow', () => {


  test.describe('When /api/impact/calculate is called with known areas', () => {


    for (const [key, tc] of Object.entries(CARBON_CASES)) {
      test(`[TRIP-CALC-${key.toUpperCase()}] ${tc.emirate} / ${tc.area} — returns valid impact`, async ({ api }) => {
        const { status, body } = await api.calculateImpact(tc.emirate, tc.area);
        expect(status).toBe(200);
        expect(body.impact).toBeTruthy();
        assertImpactSchema(body.impact);
        assertCarbonMath(body.impact);
        expect(body.impact.centerName.toLowerCase()).toContain(
          tc.expectCenterContains.toLowerCase()
        );
      });
    }


  });


  test.describe('When impact math is boundary-tested', () => {


    test('[TRIP-MATH-01] distanceSavedKm is round trip — greater than 5km', async ({ api }) => {
      const { body } = await api.calculateImpact('Dubai', AREAS.dubaiMarina);
      expect(body.impact.distanceSavedKm).toBeGreaterThan(5);
    });


    test('[TRIP-MATH-02] CO2 never zero for any valid emirate', async ({ api }) => {
      const { body } = await api.calculateImpact('Umm Al Quwain', AREAS.uaqCity);
      expect(body.impact.co2SavedKg).toBeGreaterThan(0);
    });


    test('[TRIP-MATH-03] money saving is positive for all emirates', async ({ api }) => {
      const { body } = await api.calculateImpact('Fujairah', AREAS.fujairahCity);
      expect(body.impact.moneySavedAed).toBeGreaterThan(0);
    });


    test('[TRIP-MATH-04] unknown area falls back to default distance not zero', async ({ api }) => {
      const { body } = await api.calculateImpact('Dubai', AREAS.unknown);
      expect(body.impact.distanceSavedKm).toBeGreaterThan(0);
    });


    test('[TRIP-MATH-05] empty area string uses emirate-level default', async ({ api }) => {
      const { body } = await api.calculateImpact('Sharjah', '');
      expect(body.impact.distanceSavedKm).toBeGreaterThan(0);
      expect(body.impact.centerName).toBeTruthy();
    });


  });


  test.describe('When trips are logged via /api/impact/trip', () => {


    test('[TRIP-LOG-01] valid trip log with real user ID returns success', async ({ api }) => {
      // Login as test user to get real UUID
      const { body: loginBody } = await api.loginAsTestUser();
      expect(loginBody.success).toBe(true);
      const userId = loginBody.user.id;


      const calc = await api.calculateImpact('Dubai', AREAS.dubaiMarina);
      const impact = calc.body.impact;


      const { status, body } = await api.logTrip({
        userId:        userId,
        questionAsked: 'How do I renew my driving license in Dubai?',
        centerName:    impact.centerName,
        distanceKm:    impact.distanceSavedKm,
        co2Kg:         impact.co2SavedKg,
        fuelLiters:    impact.fuelSavedLiters,
        moneyAed:      impact.moneySavedAed,
        emirate:       'Dubai'
      });
      expect(status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.newTotals).toBeTruthy();
      expect(body.newTotals.totalKm).toBeGreaterThan(0);
    });


    test('[TRIP-LOG-02] missing userId returns 400', async ({ api }) => {
      const { status } = await api.logTrip({
        distanceKm: 10,
        co2Kg:      1.92,
        emirate:    'Dubai'
      });
      expect(status).toBe(400);
    });


    test('[TRIP-LOG-03] missing distanceKm returns 400', async ({ api }) => {
      const { status } = await api.logTrip({
        userId:  'some-user-id',
        emirate: 'Dubai'
      });
      expect(status).toBe(400);
    });


    test('[TRIP-LOG-04] zero distanceKm is rejected', async ({ api }) => {
      const { status } = await api.logTrip({
        userId:     'some-user-id',
        distanceKm: 0,
        emirate:    'Dubai'
      });
      expect(status).toBe(400);
    });


    test('[TRIP-LOG-05] negative distanceKm is rejected', async ({ api }) => {
      const { status } = await api.logTrip({
        userId:     'some-user-id',
        distanceKm: -5,
        emirate:    'Dubai'
      });
      expect(status).toBe(400);
    });


  });


  test.describe('When /api/impact cumulative counter is checked', () => {


    test('[TRIP-CTR-01] GET /api/impact returns all required fields', async ({ api }) => {
      const { status, body } = await api.getImpact();
      expect(status).toBe(200);
      expect(typeof body.totalUsers).toBe('number');
      expect(typeof body.totalTrips).toBe('number');
      expect(typeof body.totalKm).toBe('number');
      expect(typeof body.totalCo2).toBe('number');
    });


    test('[TRIP-CTR-02] totalKm is non-negative', async ({ api }) => {
      const { body } = await api.getImpact();
      expect(body.totalKm).toBeGreaterThanOrEqual(0);
    });


    test('[TRIP-CTR-03] totalUsers is non-negative', async ({ api }) => {
      const { body } = await api.getImpact();
      expect(body.totalUsers).toBeGreaterThanOrEqual(0);
    });


  });


});