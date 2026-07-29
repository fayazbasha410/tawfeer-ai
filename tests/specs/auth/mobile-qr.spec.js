const { test, expect } = require('../../fixtures/fixtures');
const { AuthPage }     = require('../../pages/AuthPage');

// Pure UI feature — no LLM, no Groq calls, safe to run anytime.
test.describe('Given the mobile QR toggle on auth pages', () => {

  test.describe('When on the login page', () => {

    test('[QR-001] QR panel is hidden by default', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();

      const panel = page.locator('[data-test-id="qr-panel"]');
      await expect(panel).not.toHaveClass(/show/);
      const isVisible = await panel.evaluate(el => window.getComputedStyle(el).display !== 'none');
      expect(isVisible).toBe(false);
    });

    test('[QR-002] clicking the toggle reveals the QR code and generates a valid image src', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();

      const toggle = page.locator('[data-test-id="qr-toggle-btn"]');
      await toggle.click();

      const panel = page.locator('[data-test-id="qr-panel"]');
      await expect(panel).toHaveClass(/show/);

      const img = page.locator('[data-test-id="qr-image"]');
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('qrserver.com');
      expect(src).toContain(encodeURIComponent('/pages/login.html'));
    });

    test('[QR-003] toggle button is keyboard accessible and updates aria-expanded', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();

      const toggle = page.locator('[data-test-id="qr-toggle-btn"]');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });

    test('[QR-004] toggle label changes between show/hide states', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();

      const toggle = page.locator('[data-test-id="qr-toggle-btn"]');
      const collapsedText = (await toggle.textContent()).trim();
      expect(collapsedText.length).toBeGreaterThan(0);

      await toggle.click();
      const expandedText = (await toggle.textContent()).trim();
      expect(expandedText).not.toBe(collapsedText);

      await toggle.click();
      const collapsedAgain = (await toggle.textContent()).trim();
      expect(collapsedAgain).toBe(collapsedText);
    });

  });

  test.describe('When on the register page', () => {

    test('[QR-005] QR panel is hidden by default and reveals correctly', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();

      const panel = page.locator('[data-test-id="qr-panel"]');
      await expect(panel).not.toHaveClass(/show/);

      const toggle = page.locator('[data-test-id="qr-toggle-btn"]');
      await toggle.click();
      await expect(panel).toHaveClass(/show/);

      const img = page.locator('[data-test-id="qr-image"]');
      const src = await img.getAttribute('src');
      expect(src).toContain(encodeURIComponent('/pages/register.html'));
    });

  });

  test.describe('When the language is toggled while the QR panel is open', () => {

    test('[QR-006] toggle label stays correct (Hide) after switching to Arabic', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToLogin();

      const toggle = page.locator('[data-test-id="qr-toggle-btn"]');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');

      await page.locator('[data-test-id="lang-toggle-btn"]').click();

      // Panel should still be open, and the button's data-i18n should still
      // point at the "hide" string, not have reverted to "show" on toggle.
      const panel = page.locator('[data-test-id="qr-panel"]');
      await expect(panel).toHaveClass(/show/);
      await expect(toggle).toHaveAttribute('data-i18n', 'qrHide');
    });

  });

});