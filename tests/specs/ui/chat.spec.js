const { test, expect } = require('../../fixtures/fixtures');
const { ChatPage }     = require('../../pages/ChatPage');
const { AuthPage }     = require('../../pages/AuthPage');
const { CHAT_MESSAGES, GUARDRAIL_INPUTS } = require('../../data/testData');
const { containsArabic } = require('../../helpers/testHelpers');


const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const LLM      = 90000;


test.describe('Tawfeer Chat UI', () => {


  test.describe('When the register and login pages load', () => {


    test('[TC_UI_001] register page shows Tawfeer branding', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      const title = await page.title();
      expect(title).toContain('Tawfeer');
    });


    test('[TC_UI_002] login page shows Tawfeer branding', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      const title = await page.title();
      expect(title).toContain('Tawfeer');
    });


    test('[TC_UI_003] hero counter bar is visible on register page', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await page.waitForTimeout(1500);
      const visible = await auth.heroCounterIsVisible();
      expect(visible).toBe(true);
    });


    test('[TC_UI_004] hero counter bar is visible on login page', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await page.waitForTimeout(1500);
      const visible = await auth.heroCounterIsVisible();
      expect(visible).toBe(true);
    });


    test('[TC_UI_005] UAE flag stripe has 4 segments on login page', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      const segments = page.locator('.uae-stripe > div');
      await expect(segments).toHaveCount(4);
    });


    test('[TC_UI_006] language toggle switches to Arabic on login page', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.toggleLanguage();
      const dir = await auth.getPageDirection();
      expect(dir).toBe('rtl');
    });


    test('[TC_UI_007] language toggle switches back to English', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();
      await auth.toggleLanguage();
      await auth.toggleLanguage();
      const dir = await auth.getPageDirection();
      expect(dir).toBe('ltr');
    });


  });


  test.describe('When the chat page loads authenticated', () => {


    test('[TC_UI_008] chat page shows welcome message', async ({ chatPage }) => {
      const welcome = new ChatPage(chatPage).messages.getAssistantMessages().first();
      await expect(welcome).toBeVisible();
    });


    test('[TC_UI_009] header is visible', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      expect(await cp.header.isVisible()).toBe(true);
    });


    test('[TC_UI_010] header contains Tawfeer branding', async ({ chatPage }) => {
      const title = await chatPage.locator('header h1').innerText();
      expect(title).toContain('Tawfeer');
    });


    test('[TC_UI_011] input bar is visible', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      expect(await cp.input.isInputVisible()).toBe(true);
    });


    test('[TC_UI_012] at least 7 suggestion buttons are present', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      const count = await cp.input.getSuggestionCount();
      expect(count).toBeGreaterThanOrEqual(7);
    });


    test('[TC_UI_013] impact pill is visible in header', async ({ chatPage }) => {
      const pill = chatPage.locator('[data-test-id="impact-pill"]');
      await expect(pill).toBeVisible();
    });


    test('[TC_UI_014] user badge is visible in header', async ({ chatPage }) => {
      const badge = chatPage.locator('[data-test-id="user-badge"]');
      await expect(badge).toBeVisible();
    });


    test('[TC_UI_015] footer contains developer name', async ({ chatPage }) => {
      const footer = chatPage.locator('footer');
      await expect(footer).toContainText('Fayaz Basha Shaik');
    });


    test('[TC_UI_016] footer contains DAST 2026', async ({ chatPage }) => {
      const footer = chatPage.locator('footer');
      await expect(footer).toContainText('DAST 2026');
    });


    test('[TC_UI_017] UAE stripe has 4 segments', async ({ chatPage }) => {
      const segments = chatPage.locator('.uae-stripe > div');
      await expect(segments).toHaveCount(4);
    });


  });


  test.describe('When user interacts with the chat', () => {


    test('[TC_UI_018] user message appears after sending', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.type(CHAT_MESSAGES.drivingLicenseDubai);
      await cp.input.send();
      const userMsg = cp.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
      await expect(userMsg).toContainText('driving license');
    });


    test('[TC_UI_019] input clears after sending', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.typeAndSend(CHAT_MESSAGES.salikRates);
      const val = await cp.input.getCurrentInputValue();
      expect(val).toBe('');
    });


    test('[TC_UI_020] Enter key sends message', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.sendWithEnter(CHAT_MESSAGES.salikRates);
      const userMsg = cp.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
    });


    test('[TC_UI_021] Shift+Enter does not send message', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.type('test');
      await chatPage.locator('#user-input').press('Shift+Enter');
      const count = await cp.messages.getUserMessages().count();
      expect(count).toBe(0);
    });


    test('[TC_UI_022] suggestion button sends predefined message', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.clickSuggestion(0);
      const userMsg = cp.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
    });


    test('[TC_UI_023] Arabic suggestion button sends Arabic message', async ({ chatPage }) => {
      const arabicBtn = chatPage.locator('.suggestion-btn').filter({ hasText: 'تجديد الرخصة' });
      await expect(arabicBtn).toBeVisible();
      await arabicBtn.click();
      const cp = new ChatPage(chatPage);
      const userMsg = cp.messages.getUserMessages().first();
      await expect(userMsg).toBeVisible();
      const text = await userMsg.innerText();
      expect(containsArabic(text)).toBe(true);
    });


  });


  test.describe('When guardrails trigger in the UI', () => {


    test('[TC_UI_024] prompt injection shows blocked tag', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.typeAndSend(GUARDRAIL_INPUTS.promptInjection[0]);
      const tag = await cp.messages.waitForBlockedTag(5000);
      await expect(tag).toBeVisible();
    });


    test('[TC_UI_025] off-topic request shows blocked tag', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      const tag = await cp.messages.waitForBlockedTag(5000);
      await expect(tag).toBeVisible();
    });


    test('[TC_UI_026] blocked reply contains Tawfeer redirect text', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      await cp.messages.waitForBlockedTag(5000);
      const reply = cp.messages.getAssistantMessages().nth(1);
      await expect(reply).toContainText('Tawfeer');
    });


  });


  test.describe('When new conversation is started', () => {


    test('[TC_UI_027] new conversation button clears messages', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      await cp.messages.waitForBlockedTag(5000);
      await chatPage.locator('[data-test-id="new-chat-btn"]').click();
      await chatPage.waitForTimeout(500);
      const count = await cp.messages.getAssistantMessageCount();
      expect(count).toBe(1);
    });


    test('[TC_UI_028] new conversation shows fresh welcome', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);
      await cp.input.typeAndSend(GUARDRAIL_INPUTS.offTopic[0]);
      await cp.messages.waitForBlockedTag(5000);
      await chatPage.locator('[data-test-id="new-chat-btn"]').click();
      await chatPage.waitForTimeout(500);
      const welcome = cp.messages.getAssistantMessages().first();
      await expect(welcome).toContainText('Tawfeer');
    });


  });


  test.describe('When language is toggled in chat', () => {


    test('[TC_UI_029] language toggle switches to Arabic RTL', async ({ chatPage }) => {
      await chatPage.locator('[data-test-id="lang-toggle-btn"]').click();
      const dir = await chatPage.evaluate(() => document.documentElement.getAttribute('dir'));
      expect(dir).toBe('rtl');
    });


    test('[TC_UI_030] language toggle switches back to English LTR', async ({ chatPage }) => {
      await chatPage.locator('[data-test-id="lang-toggle-btn"]').click();
      await chatPage.locator('[data-test-id="lang-toggle-btn"]').click();
      const dir = await chatPage.evaluate(() => document.documentElement.getAttribute('dir'));
      expect(dir).toBe('ltr');
    });


  });


});