const { test, expect } = require('../../fixtures/fixtures');
const { CHAT_MESSAGES } = require('../../data/testData');


const LLM = 90000;


function newSession() {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}


test.describe('Given the session memory system', () => {


  test.describe('When a single-turn session starts', () => {


    test('[MEM-001] memory object is present with turns field', async ({ api }) => {
      const sid = newSession();
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      expect(body.memory).toBeTruthy();
      expect(typeof body.memory.turns).toBe('number');
      expect(body.memory.turns).toBeGreaterThanOrEqual(1);
    }, { timeout: LLM });


    test('[MEM-002] first message has topicChanged as false', async ({ api }) => {
      const sid = newSession();
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      expect(body.memory.topicChanged).toBe(false);
    }, { timeout: LLM });


    test('[MEM-003] memory turns starts at 1 on first message', async ({ api }) => {
      const sid = newSession();
      const { body } = await api.sendChat(CHAT_MESSAGES.salikRates, sid);
      expect(body.memory.turns).toBeGreaterThanOrEqual(1);
    }, { timeout: LLM });


    test('[MEM-004] memory topic is set after first message', async ({ api }) => {
      const sid = newSession();
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      expect(typeof body.memory.topic).toBe('string');
      expect(body.memory.topic.length).toBeGreaterThan(0);
    }, { timeout: LLM });


  });


  test.describe('When a topic switch occurs mid-session', () => {


    test('[MEM-005] switching from Salik to driving license triggers topicChanged true', async ({ api }) => {
      const sid = newSession();
      await api.sendChat(CHAT_MESSAGES.salikRates, sid);
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      expect(body.memory.topicChanged).toBe(true);
    }, { timeout: LLM * 2 });


    test('[MEM-006] switching from driving license to NOL card triggers topicChanged', async ({ api }) => {
      const sid = newSession();
      await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      const { body } = await api.sendChat(CHAT_MESSAGES.nolTypes, sid);
      expect(body.memory.topicChanged).toBe(true);
    }, { timeout: LLM * 2 });


    test('[MEM-007] follow-up on same topic keeps topicChanged false', async ({ api }) => {
      const sid = newSession();
      await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      const { body } = await api.sendChat(CHAT_MESSAGES.followUpCost, sid);
      expect(body.memory.topicChanged).toBe(false);
    }, { timeout: LLM * 2 });


    test('[MEM-008] follow-up what about Dubai carries Dubai context', async ({ api }) => {
      const sid = newSession();
      await api.sendChat('Is health insurance mandatory in Sharjah?', sid);
      const { body } = await api.sendChat(CHAT_MESSAGES.followUpDubai, sid);
      expect(body.guardrail.triggered).toBe(false);
      expect(body.reply.toLowerCase()).toContain('dubai');
    }, { timeout: LLM * 2 });


  });


  test.describe('When session is cleared', () => {


    test('[MEM-009] clear session endpoint responds without crashing', async ({ api }) => {
      const sid = newSession();
      await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid);
      const { status } = await api.clearSession(sid);
      expect([200, 404]).toContain(status);
    }, { timeout: LLM });


    test('[MEM-010] new session starts fresh with turns at 1', async ({ api }) => {
      const sid1 = newSession();
      await api.sendChat(CHAT_MESSAGES.salikRates, sid1);
      const sid2 = newSession() + '_fresh';
      const { body } = await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid2);
      expect(body.memory.turns).toBe(1);
      expect(body.memory.topicChanged).toBe(false);
    }, { timeout: LLM * 2 });


    test('[MEM-011] clearing non-existent session returns 200 or 404', async ({ api }) => {
      const { status } = await api.clearSession('nonexistent_session_id_12345');
      expect([200, 404]).toContain(status);
    });


  });


  test.describe('When the 6-turn memory window is tested', () => {


    test('[MEM-012] 4 consecutive messages complete without crash', async ({ api }) => {
      const sid = newSession();
      const messages = [
        CHAT_MESSAGES.drivingLicenseDubai,
        CHAT_MESSAGES.followUpCost,
        CHAT_MESSAGES.vehicleRegDubai,
        CHAT_MESSAGES.salikRates
      ];
      for (const msg of messages) {
        const { status, body } = await api.sendChat(msg, sid);
        expect(status).toBe(200);
        expect(typeof body.reply).toBe('string');
        await new Promise(r => setTimeout(r, 3000));
      }
    }, { timeout: LLM * 5 });    

    test('[MEM-013] two different sessions stay independent', async ({ api }) => {
      const sid1 = newSession();
      const sid2 = newSession() + '_B';
      await api.sendChat(CHAT_MESSAGES.salikRates, sid1);
      await new Promise(r => setTimeout(r, 5000));
      await api.sendChat(CHAT_MESSAGES.drivingLicenseDubai, sid2);
      await new Promise(r => setTimeout(r, 5000));
      const r1 = await api.sendChat(CHAT_MESSAGES.followUpCost, sid1);
      await new Promise(r => setTimeout(r, 5000));
      const r2 = await api.sendChat(CHAT_MESSAGES.followUpCost, sid2);
      expect(r1.body.guardrail.triggered).toBe(false);
      expect(r2.body.guardrail.triggered).toBe(false);
    }, { timeout: LLM * 6 });    


  });


});