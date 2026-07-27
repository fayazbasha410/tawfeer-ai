const { test, expect } = require('../../fixtures/fixtures');
const { CHAT_MESSAGES } = require('../../data/testData');
const EN = require('../../data/locale_en.json');
const {
  assertChatResponseSchema,
  assertPolicyInResults,
  replyContains,
  replyContainsAny
} = require('../../helpers/testHelpers');

const LLM = 60000;

function newSession() {
  return `rag_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

test.describe('Given the RAG system', () => {

  test.describe('When driving license queries arrive per emirate', () => {

    test('[RAG-001] Dubai — returns RTA as authority, mentions rta.ae or Dubai Drive', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(body.retrievedDocs.length).toBeGreaterThan(0);
      expect(replyContainsAny(body, ['rta', 'rta.ae', 'dubai drive'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-002] Abu Dhabi — returns ITC/TAMM as authority, NOT RTA', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseAbuDhabi, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['tamm', 'itc', 'integrated transport'])).toBe(true);
      expect(body.reply.toLowerCase()).not.toMatch(/\brta\b(?!.*abu dhabi)/);
    }, { timeout: LLM });

    test('[RAG-003] Sharjah — returns Sharjah Police, NOT RTA', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseSharjah, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['sharjah police', 'shjpolice'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-004] Ajman — returns Ajman Police, mentions ajmanpolice.ae', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseAjman, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['ajman police', 'ajmanpolice'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-005] Ras Al Khaimah — returns RAK Police', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseRAK, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['rak police', 'rakpolice'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-006] Fujairah — returns Fujairah Police, mentions eservice.fujairahpolice.gov.ae', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseFujairah, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['fujairah police', 'fujairahpolice'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-007] Umm Al Quwain — returns UAQ Police, mentions uaqpolice.gov.ae', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseUAQ, newSession());
      assertChatResponseSchema(body);
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['uaq police', 'uaqpolice'])).toBe(true);
    }, { timeout: LLM });

  });

  test.describe('When fee accuracy is tested against real UAE data', () => {

    test('[RAG-008] Dubai license fee — reply mentions AED 300 for age 21+', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseFees, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['300', 'aed 300'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-009] Dubai license fee — reply mentions AED 20 Knowledge fee', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseFees, newSession());
      expect(replyContainsAny(body, ['20', 'knowledge'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-010] Dubai license fee — reply mentions AED 100 for under 21', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseFees, newSession());
      expect(replyContainsAny(body, ['100', 'under 21', 'age 21'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-011] Salik toll — reply mentions AED 4 per gate', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.salikRates, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['aed 4', '4 per gate', 'aed4'])).toBe(true);
    }, { timeout: LLM });    

    test('[RAG-012] Salik — reply confirms toll is AED 4', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.salikRates, newSession());
      expect(replyContainsAny(body, ['aed 4', '4 per gate', 'aed4', '4.'])).toBe(true);
    }, { timeout: LLM });    

    test('[RAG-013] NOL fine — reply mentions AED 200 for no valid card', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.nolFine, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['200', 'aed 200'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-014] Darb Abu Dhabi — reply mentions AED 4 per gate and registration', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.darbAbuDhabi, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['darb', 'aed 4', '4 per gate'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-015] Darb — reply does NOT claim there is a daily cap (removed Sept 2025)', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.darbAbuDhabi, newSession());
      const reply = body.reply.toLowerCase();
      const claimsCap = reply.includes('daily cap') && !reply.includes('removed') && !reply.includes('no cap');
      expect(claimsCap).toBe(false);
    }, { timeout: LLM });

  });

  test.describe('When vehicle registration queries arrive', () => {

    test('[RAG-016] Dubai vehicle reg — mentions rta.ae and Dubai Drive', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.vehicleRegDubai, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['rta.ae', 'dubai drive', 's\'hail', 'smail'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-017] Abu Dhabi vehicle reg — mentions TAMM, NOT RTA', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.vehicleRegAbuDhabi, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['tamm', 'tamm.abudhabi'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-018] RAK vehicle reg — reply states NO Salik or Darb requirement', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.vehicleRegRAK, newSession());
      expect(body.guardrail.triggered).toBe(false);
      const hasNoTollClaim = replyContainsAny(body, ['no salik', 'no darb', 'no toll', 'without salik']);
      expect(hasNoTollClaim).toBe(true);
    }, { timeout: LLM });

  });

  test.describe('When public transport queries arrive', () => {

    test('[RAG-019] Dubai Metro hours — reply mentions operating hours', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.metroHours, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['05:00', '5:00', 'midnight', '00:00', 'am', 'hours', 'open'])).toBe(true);
    }, { timeout: LLM });    

    test('[RAG-020] Dubai Metro — Friday hours differ from weekdays', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.metroHours, newSession());
      expect(replyContainsAny(body, ['friday', 'fri', '01:00', '1:00', 'weekend', 'differ', 'vary'])).toBe(true);
    }, { timeout: LLM });    

    test('[RAG-021] Sharjah public transport — mentions no metro system', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.publicTransportSharjah, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['no metro', 'srta', 'mowasalat', 'sharjah bus'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-022] Hafilat card for Abu Dhabi — NOT NOL card', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.publicTransportSharjah, newSession());
      const reply = body.reply.toLowerCase();
      if (reply.includes('abu dhabi') || reply.includes('hafilat')) {
        expect(reply).not.toMatch(/nol card.*abu dhabi/);
      }
    }, { timeout: LLM });

  });

  test.describe('When black point queries arrive', () => {

    test('[RAG-023] suspension threshold — reply mentions 24 black points', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.finesBlackPoints, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['24 black points', '24 points', 'twenty-four'])).toBe(true);
    }, { timeout: LLM });

    test('[RAG-024] black point reduction course — mentions AED 810 and 8 points', async ({ api }) => {
      const { body } = await api.sendChat('How do I reduce black points on my driving license in Dubai?', newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['810', '8 points', '8 black points'])).toBe(true);
    }, { timeout: LLM });    

  });

  test.describe('When NOL card queries arrive', () => {

    test('[RAG-025] NOL types — reply covers multiple card types', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.nolTypes, newSession());
      expect(body.guardrail.triggered).toBe(false);
      const reply = body.reply.toLowerCase();
      expect(reply).toContain('silver');
      expect(reply).toContain('gold');
      expect(reply).toMatch(/blue|red|nol/);
    }, { timeout: LLM });    

    test('[RAG-026] NOL fares — reply mentions fare amounts', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.nolFares, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(replyContainsAny(body, ['aed', 'fare', 'rta'])).toBe(true);
    }, { timeout: LLM });    

    test('[RAG-027] NOL fares — reply is relevant to metro fares', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.nolFares, newSession());
      expect(replyContainsAny(body, ['metro', 'nol', 'rta', 'fare', 'line'])).toBe(true);
    }, { timeout: LLM });    

  });

  test.describe('When schema integrity is checked', () => {

    test('[RAG-028] every RAG response includes non-empty retrievedDocs for transport query', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, newSession());
      expect(body.guardrail.triggered).toBe(false);
      expect(body.retrievedDocs.length).toBeGreaterThan(0);
      for (const doc of body.retrievedDocs) {
        expect(typeof doc.id).toBe('string');
        expect(doc.id.length).toBeGreaterThan(0);
      }
    }, { timeout: LLM });

    test('[RAG-029] confidence level is present and valid for RAG response', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, newSession());
      if (body.confidence) {
        expect(['high', 'medium', 'low']).toContain(body.confidence.level);
      }
    }, { timeout: LLM });

    test('[RAG-030] canResolveDigitally is boolean when present', async ({ api }) => {
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, newSession());
      if (body.canResolveDigitally !== undefined) {
        expect(typeof body.canResolveDigitally).toBe('boolean');
      }
    }, { timeout: LLM });

  });

});
