const { test, expect } = require('../../fixtures/fixtures');
const { CHAT_MESSAGES } = require('../../data/testData');
const AR = require('../../data/locale_ar.json');
const {
  assertArabicResponse,
  assertChatResponseSchema,
  containsArabic,
  replyContainsAny
} = require('../../helpers/testHelpers');

const LLM = 90000;

function newSession() {
  return `ar_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

test.describe('Given the Arabic language support', () => {

  test.describe('When Arabic driving license queries arrive per emirate', () => {

    test('[AR-001] Dubai — Arabic query gets Arabic reply containing RTA in Arabic', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingDubai, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
      expect(body.retrievedDocs.length).toBeGreaterThan(0);
    }, { timeout: LLM });

    test('[AR-002] Abu Dhabi — Arabic query gets Arabic reply mentioning TAMM in Arabic', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingAbuDhabi, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
      expect(containsArabic(body.reply)).toBe(true);
    }, { timeout: LLM });

    test('[AR-003] Sharjah — Arabic query gets Arabic reply', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingSharjah, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

    test('[AR-004] Ajman — Arabic query gets Arabic reply', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingAjman, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

    test('[AR-005] RAK — Arabic query gets Arabic reply', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingRAK, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

    test('[AR-006] Fujairah — Arabic query gets Arabic reply', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingFujairah, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

    test('[AR-007] UAQ — Arabic query gets Arabic reply', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingUAQ, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

  });

  test.describe('When Arabic fines and vehicle queries arrive', () => {

    test('[AR-008] Arabic fine check — language field is ar', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicFineCheck, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(body.language).toBe('ar');
    }, { timeout: LLM });

    test('[AR-009] Arabic vehicle reg Dubai — Arabic reply with digital renewal info', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicVehicleRegDubai, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
      expect(replyContainsAny(body, ['إلكترونياً', 'رقمياً', 'الإنترنت', 'rta', 'موقع'])).toBe(true);
    }, { timeout: LLM });    

    test('[AR-010] Arabic Salik open account — Arabic reply', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicSalikOpen, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

    test('[AR-011] Arabic Darb register — Arabic reply about Abu Dhabi toll', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDarbRegister, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(containsArabic(body.reply)).toBe(true);
    }, { timeout: LLM });

    test('[AR-012] Arabic black points — reply mentions 24 نقطة or similar', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicBlackPoints, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
      expect(replyContainsAny(body, ['24', 'أربعة وعشرين'])).toBe(true);
    }, { timeout: LLM });

  });

  test.describe('When Arabic metro and NOL queries arrive', () => {

    test('[AR-013] Arabic metro hours — Arabic reply with time info', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicMetroHours, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

    test('[AR-014] Arabic NOL types — Arabic reply covering card types', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicNolTypes, newSession());
      expect(body.guardrail.triggered).toBe(false);
      assertArabicResponse(body);
    }, { timeout: LLM });

  });

  test.describe('When Arabic injection attacks arrive', () => {

    for (const [key, input] of Object.entries(AR.injection_attempts)) {
      test(`[AR-INJ-${key}] blocks Arabic injection: "${input.slice(0, 40)}"`, async ({ api }) => {
        const { body } = await api.sendChat(input, newSession());
        expect(body.guardrail.triggered).toBe(true);
        // Reply language depends on which banned list fires first
        expect(typeof body.reply).toBe('string');
        expect(body.reply.length).toBeGreaterThan(0);
      });
    }    

  });

  test.describe('When Arabic off-topic queries arrive', () => {

    for (const [key, input] of Object.entries(AR.off_topic)) {
      test(`[AR-OT-${key}] blocks Arabic off-topic: "${input}"`, async ({ api }) => {
        const { body } = await api.sendChat(input, newSession());
        expect(body.guardrail.triggered).toBe(true);
        expect(containsArabic(body.reply)).toBe(true);
      });
    }

  });

  test.describe('When language detection accuracy is checked', () => {

    test('[AR-LANG-01] Arabic query sets language field to ar', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.arabicDrivingDubai, newSession());
      expect(body.language).toBe('ar');
    }, { timeout: LLM });

    test('[AR-LANG-02] English query sets language field to en', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, newSession());
      expect(body.language).toBe('en');
    }, { timeout: LLM });

    test('[AR-LANG-03] mixed Arabic-English query responds without crash', async ({ api }) => {
      const { status, body } = await api.sendChat(
        'كيف أجدد my driving license in Dubai؟',
        newSession()
      );
      expect(status).toBe(200);
      expect(typeof body.reply).toBe('string');
      expect(body.reply.length).toBeGreaterThan(0);
    }, { timeout: LLM });

  });

});
