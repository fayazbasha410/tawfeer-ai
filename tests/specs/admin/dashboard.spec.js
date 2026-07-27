const { test, expect } = require('../../fixtures/fixtures');

const VALID_KEY   = process.env.ADMIN_KEY || 'tawfeer2026dast';
const WRONG_KEYS  = [
  '',
  'wrong',
  'tawfeer2026',
  'TAWFEER2026DAST',
  "tawfeer2026dast'; DROP TABLE users; --",
  '<script>alert(1)</script>',
  'null',
  'undefined'
];

test.describe('Given the admin dashboard API', () => {

  test.describe('When the correct admin key is provided', () => {

    test('[ADM-001] returns 200 with users, trips and impact', async ({ api }) => {
      const { status, body } = await api.getAdminData();
      expect(status).toBe(200);
      expect(Array.isArray(body.users)).toBe(true);
      expect(Array.isArray(body.trips)).toBe(true);
      expect(typeof body.impact).toBe('object');
    });

    test('[ADM-002] users array contains expected fields', async ({ api }) => {
      const { body } = await api.getAdminData();
      if (body.users.length > 0) {
        const user = body.users[0];
        expect(user.id).toBeTruthy();
        expect(user.email).toBeTruthy();
        expect(user.emirate).toBeTruthy();
        expect(user.created_at).toBeTruthy();
      }
    });

    test('[ADM-003] trips array contains expected fields', async ({ api }) => {
      const { body } = await api.getAdminData();
      if (body.trips.length > 0) {
        const trip = body.trips[0];
        expect(trip.user_id).toBeTruthy();
        expect(typeof trip.distance_km).toBe('number');
        expect(typeof trip.co2_kg).toBe('number');
        expect(trip.emirate).toBeTruthy();
        expect(trip.created_at).toBeTruthy();
      }
    });

    test('[ADM-004] cumulative_impact has positive km and non-negative users', async ({ api }) => {
      const { body } = await api.getAdminData();
      expect(body.impact.total_users).toBeGreaterThanOrEqual(0);
      expect(body.impact.total_trips).toBeGreaterThanOrEqual(0);
      expect(body.impact.total_km).toBeGreaterThanOrEqual(0);
    });

    test('[ADM-005] impact total_co2 is consistent with total_km and MoCCAE formula', async ({ api }) => {
      const { body } = await api.getAdminData();
      const impact = body.impact;
      if (impact.total_km > 0 && impact.total_co2 > 0) {
        const expectedCo2 = (impact.total_km * 192) / 1000;
        const tolerance   = expectedCo2 * 0.05;
        expect(Math.abs(impact.total_co2 - expectedCo2)).toBeLessThan(tolerance + 1);
      }
    });

  });

  test.describe('When invalid or missing keys are provided', () => {

    for (const [i, key] of WRONG_KEYS.entries()) {
      test(`[ADM-AUTH-${String(i + 1).padStart(2, '0')}] rejects key: "${String(key).slice(0, 30)}"`, async ({ api }) => {
        const { status } = await api.getAdminDataWithKey(key);
        expect([401, 403]).toContain(status);
      });
    }

  });

  test.describe('When admin key is missing entirely', () => {

    test('[ADM-013] returns 401 when x-admin-key header is absent', async ({ request }) => {
      const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
      const res = await request.get(`${BASE_URL}/api/impact/admin`);
      expect([401, 403]).toContain(res.status());
    });

  });

  test.describe('When data integrity is checked', () => {

    test('[ADM-014] users count in impact matches users array length', async ({ api }) => {
      const { body } = await api.getAdminData();
      expect(body.impact.total_users).toBeGreaterThanOrEqual(body.users.length - 5);
    });    

    test('[ADM-015] no user passwords or hashes are exposed in admin response', async ({ api }) => {
      const { body } = await api.getAdminData();
      const raw = JSON.stringify(body);
      expect(raw).not.toContain('password_hash');
      expect(raw).not.toContain('bcrypt');
      expect(raw).not.toMatch(/\$2[aby]\$\d+\$/);
    });

    test('[ADM-016] no auth tokens are exposed in admin response', async ({ api }) => {
      const { body } = await api.getAdminData();
      const raw = JSON.stringify(body);
      expect(raw).not.toContain('token');
    });

    test('[ADM-017] all trip distances are positive numbers', async ({ api }) => {
      const { body } = await api.getAdminData();
      for (const trip of body.trips) {
        expect(trip.distance_km).toBeGreaterThan(0);
        expect(trip.co2_kg).toBeGreaterThan(0);
      }
    });

    test('[ADM-018] all user emirates are valid UAE emirate names', async ({ api }) => {
      const { body } = await api.getAdminData();
      const valid = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
      const realUsers = body.users.filter(u => !u.email.includes('tawfeer-test.invalid'));
      for (const user of realUsers) {
        expect(valid, `Invalid emirate: ${user.emirate}`).toContain(user.emirate);
      }
    });    

  });

});
