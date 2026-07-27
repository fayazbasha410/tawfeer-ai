const { test, expect } = require('../../fixtures/fixtures');
const { measureTime, assertResponseTime } = require('../../helpers/testHelpers');

const VALID_SERVICES = [
  'driving-license',
  'vehicle-registration',
  'emirates-id',
  'residency-visa',
  'health-card'
];

const FUTURE_DATE = '2025-06-15';

test.describe('Appointments Tool API', () => {

  test('[TC_APPT_001] valid booking returns success true', async ({ api }) => {
    const { status, body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(status).toBe(200);
    expect(body.success).toBe(true);
  });

  test('[TC_APPT_002] response contains confirmationNumber', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(typeof body.confirmationNumber).toBe('string');
    expect(body.confirmationNumber.length).toBeGreaterThan(0);
  });

  test('[TC_APPT_003] response contains service field', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(typeof body.service).toBe('string');
    expect(body.service.length).toBeGreaterThan(0);
  });

  test('[TC_APPT_004] response contains date field matching request', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(body.date).toBe(FUTURE_DATE);
  });

  test('[TC_APPT_005] response contains message field', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(typeof body.message).toBe('string');
    expect(body.message.length).toBeGreaterThan(0);
  });

  test('[TC_APPT_006] response contains system and portal fields', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(typeof body.system).toBe('string');
    expect(typeof body.portal).toBe('string');
  });

  test('[TC_APPT_007] confirmationNumber is unique per request', async ({ api }) => {
    const r1 = await api.bookAppointment('driving-license', FUTURE_DATE);
    const r2 = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(r1.body.confirmationNumber).not.toBe(r2.body.confirmationNumber);
  });

  test('[TC_APPT_008] missing service returns error', async ({ api }) => {
    const { body } = await api.bookAppointmentRaw({ date: FUTURE_DATE });
    expect(body.error).toBeTruthy();
    expect(body.success).toBeUndefined();
  });

  test('[TC_APPT_009] missing date returns error', async ({ api }) => {
    const { body } = await api.bookAppointmentRaw({ service: 'driving-license' });
    expect(body.error).toBeTruthy();
  });

  test('[TC_APPT_010] empty payload returns error', async ({ api }) => {
    const { body } = await api.bookAppointmentRaw({});
    expect(body.error).toBeTruthy();
  });

  test('[TC_APPT_011] message contains confirmationNumber', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(body.message).toContain(body.confirmationNumber);
  });

  test('[TC_APPT_012] response contains emirate field', async ({ api }) => {
    const { body } = await api.bookAppointment('driving-license', FUTURE_DATE);
    expect(typeof body.emirate).toBe('string');
    expect(body.emirate.length).toBeGreaterThan(0);
  });

  test('[TC_APPT_013] all valid transport services return success', async ({ api }) => {
    for (const service of VALID_SERVICES) {
      const { body } = await api.bookAppointment(service, FUTURE_DATE);
      expect(body.success, `Failed for service: ${service}`).toBe(true);
    }
  });

  test('[TC_APPT_014] location field is present', async ({ api }) => {
    const { body } = await api.bookAppointment('vehicle-registration', FUTURE_DATE);
    expect(typeof body.location).toBe('string');
    expect(body.location.length).toBeGreaterThan(0);
  });

  test('[TC_APPT_015] appointment booking responds within 3000ms', async ({ api }) => {
    const { durationMs } = await measureTime(() =>
      api.bookAppointment('driving-license', FUTURE_DATE)
    );
    assertResponseTime(durationMs, 3000, 'Appointment booking');
  });

});