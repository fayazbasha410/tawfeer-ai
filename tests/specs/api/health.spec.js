const { test, expect } = require('../../fixtures/fixtures');
const { measureTime, assertResponseTime } = require('../../helpers/testHelpers');

test.describe('Health Check API', () => {

  test('[TC_H_001] returns 200 with status ok', async ({ api }) => {
    const { status, body } = await api.getHealth();
    expect(status).toBe(200);
    expect(body.status).toBe('ok');
  });

  test('[TC_H_002] returns name as Tawfeer', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.name).toBe('Tawfeer');
  });

  test('[TC_H_003] returns Arabic name as توفير', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.nameAr).toBe('توفير');
  });

  test('[TC_H_004] returns version as string', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(typeof body.version).toBe('string');
    expect(body.version.length).toBeGreaterThan(0);
  });

  test('[TC_H_005] returns model referencing groq', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.model.toLowerCase()).toContain('groq');
  });

  test('[TC_H_006] returns DAST 2026 in dast field', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.dast).toContain('DAST 2026');
  });

  test('[TC_H_007] returns tagline mentioning UAE', async ({ api }) => {
    const { body } = await api.getHealth();
    expect(body.tagline).toContain('UAE');
  });

  test('[TC_H_008] health check responds within 500ms', async ({ api }) => {
    const { durationMs } = await measureTime(() => api.getHealth());
    assertResponseTime(durationMs, 500, 'Health check');
  });

  test('[TC_H_009] repeated health checks all return 200', async ({ api }) => {
    for (let i = 0; i < 3; i++) {
      const { status } = await api.getHealth();
      expect(status).toBe(200);
    }
  });

});