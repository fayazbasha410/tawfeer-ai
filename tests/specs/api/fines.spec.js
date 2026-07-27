const { test, expect } = require('../../fixtures/fixtures');
const { PLATES }       = require('../../data/testData');
const { measureTime, assertResponseTime } = require('../../helpers/testHelpers');

test.describe('Fines Tool API', () => {

  test('[TC_FINE_001] returns 200 with unpaid fines for plate AD-1234', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.abudhabi);
    expect(status).toBe(200);
    expect(Array.isArray(body.fines)).toBe(true);
    expect(body.fines.length).toBeGreaterThan(0);
    expect(body.unpaidTotal).toBeGreaterThan(0);
  });

  test('[TC_FINE_002] response contains plateNumber, fines, unpaidTotal, message', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    expect(typeof body.plateNumber).toBe('string');
    expect(Array.isArray(body.fines)).toBe(true);
    expect(typeof body.unpaidTotal).toBe('number');
    expect(typeof body.message).toBe('string');
  });

  test('[TC_FINE_003] returns correct plate number in response', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    expect(body.plateNumber.toUpperCase()).toBe(PLATES.abudhabi.toUpperCase());
  });

  test('[TC_FINE_004] unpaid total is a non-negative number', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    expect(body.unpaidTotal).toBeGreaterThanOrEqual(0);
  });

  test('[TC_FINE_005] every fine has type, amount, date, location', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    for (const fine of body.fines) {
      expect(typeof fine.type).toBe('string');
      expect(typeof fine.amount).toBe('number');
      expect(typeof fine.date).toBe('string');
      expect(typeof fine.location).toBe('string');
    }
  });

  test('[TC_FINE_006] fine amounts are positive numbers', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    for (const fine of body.fines) {
      expect(fine.amount).toBeGreaterThan(0);
    }
  });

  test('[TC_FINE_007] fine dates are valid ISO date strings', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    for (const fine of body.fines) {
      expect(new Date(fine.date).toString()).not.toBe('Invalid Date');
    }
  });

  test('[TC_FINE_008] message mentions the plate number', async ({ api }) => {
    const { body } = await api.getFines(PLATES.abudhabi);
    expect(body.message).toContain(PLATES.abudhabi);
  });

  test('[TC_FINE_009] returns empty fines array for unknown plate', async ({ api }) => {
    const { body } = await api.getFines(PLATES.noRecord);
    expect(Array.isArray(body.fines)).toBe(true);
    expect(body.fines).toHaveLength(0);
    expect(body.unpaidTotal).toBe(0);
  });

  test('[TC_FINE_010] message is defined for unknown plate', async ({ api }) => {
    const { body } = await api.getFines(PLATES.noRecord);
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('[TC_FINE_011] unpaidTotal is 0 for plate with no records', async ({ api }) => {
    const { body } = await api.getFines(PLATES.noRecord);
    expect(body.unpaidTotal).toBe(0);
  });

  test('[TC_FINE_012] handles Dubai plate format DXB-5678', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.dubai);
    expect(status).toBe(200);
    expect(typeof body.plateNumber).toBe('string');
    expect(Array.isArray(body.fines)).toBe(true);
  });

  test('[TC_FINE_013] handles Sharjah plate format SHJ-1111', async ({ api }) => {
    const { status, body } = await api.getFines(PLATES.sharjah);
    expect(status).toBe(200);
    expect(typeof body.plateNumber).toBe('string');
    expect(Array.isArray(body.fines)).toBe(true);
  });

  test('[TC_FINE_014] plate number is echoed back correctly', async ({ api }) => {
    const { body } = await api.getFines(PLATES.dubai);
    expect(body.plateNumber.toUpperCase()).toBe(PLATES.dubai.toUpperCase());
  });

  test('[TC_FINE_015] fine check responds within 3000ms', async ({ api }) => {
    const { durationMs } = await measureTime(() => api.getFines(PLATES.abudhabi));
    assertResponseTime(durationMs, 3000, 'Fine check');
  });

});