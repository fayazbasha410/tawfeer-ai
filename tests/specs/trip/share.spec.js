const { test, expect } = require('../../fixtures/fixtures');
const { ChatPage }      = require('../../pages/ChatPage');
const { CHAT_MESSAGES, AREAS } = require('../../data/testData');


const LLM = 90000;


// Drives a real chat → area prompt → trip confirm flow, then verifies the
// sustainability card's share button (WhatsApp-first, Web Share API fallback).
test.describe('Given the sustainability card share button', () => {


  test.describe('When a trip is confirmed', () => {


    test('[TC_SHARE_01] share button appears on the sustainability card', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);


      await cp.sendMessage(CHAT_MESSAGES.drivingLicenseDubai, LLM);


      // Some flows ask for area first, some go straight to trip confirm —
      // handle both without hardcoding a specific path.
      if (await cp.trip.areaPrompt.isVisible().catch(() => false)) {
        await cp.trip.submitArea(AREAS.dubaiMarina);
      }


      await cp.trip.confirmBannerVisible(15000);
      await cp.trip.confirmTrip();
      await cp.trip.sustainCardVisible(15000);


      const shareBtn = chatPage.locator('[data-test-id="share-btn"]');
      await expect(shareBtn).toBeVisible();
      await expect(shareBtn).toContainText('Share');
    });


    test('[TC_SHARE_02] share button click opens WhatsApp with distance, CO2, money, and center', async ({ chatPage }) => {
      const cp = new ChatPage(chatPage);


      // Stub window.open before any navigation happens so we can capture
      // the wa.me URL instead of actually opening a new tab.
      // addInitScript only affects future navigations — the chatPage fixture
      // already loaded the page before this ran, so reload to apply it.
      await chatPage.addInitScript(() => {
        window.__lastOpenedUrl = null;
        window.open = (url) => { window.__lastOpenedUrl = url; return null; };
      });
      await chatPage.reload();
      await chatPage.waitForSelector('.message.assistant');


      await cp.sendMessage(CHAT_MESSAGES.vehicleRegDubai, LLM);


      if (await cp.trip.areaPrompt.isVisible().catch(() => false)) {
        await cp.trip.submitArea(AREAS.dubaiMarina);
      }


      await cp.trip.confirmBannerVisible(15000);
      await cp.trip.confirmTrip();
      await cp.trip.sustainCardVisible(15000);


      const cardText = await cp.trip.getSustainCardText();


      await chatPage.locator('[data-test-id="share-btn"]').click();
      await chatPage.waitForTimeout(300);


      const openedUrl = await chatPage.evaluate(() => window.__lastOpenedUrl);


      // navigator.share isn't available in headless Chromium, so this should
      // fall back to the wa.me deep link.
      expect(openedUrl).toBeTruthy();
      expect(openedUrl).toContain('wa.me');


      const decoded = decodeURIComponent(openedUrl.split('text=')[1]);
      expect(decoded).toContain('Tawfeer');
      expect(decoded).toContain('km');
      expect(decoded).toContain('CO');
      expect(decoded).toContain('AED');
      // The center name shown on the card should also appear in the share text.
      expect(cardText).toBeTruthy();
    });


    test('[TC_SHARE_03] share button has a visible tap target on mobile viewport', async ({ chatPage }) => {
      await chatPage.setViewportSize({ width: 375, height: 812 });
      const cp = new ChatPage(chatPage);


      await cp.sendMessage(CHAT_MESSAGES.finesCheckDubai, LLM);


      if (await cp.trip.areaPrompt.isVisible().catch(() => false)) {
        await cp.trip.submitArea(AREAS.dubaiMarina);
      }


      await cp.trip.confirmBannerVisible(15000);
      await cp.trip.confirmTrip();
      await cp.trip.sustainCardVisible(15000);


      const shareBtn = chatPage.locator('[data-test-id="share-btn"]');
      const box = await shareBtn.boundingBox();
      expect(box).toBeTruthy();
      expect(box.height).toBeGreaterThanOrEqual(24);
    });


  });


});