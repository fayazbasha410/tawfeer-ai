const { test, expect } = require('../../fixtures/fixtures');
const AxeBuilder = require('@axe-core/playwright').default;


const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';


test.describe('Tawfeer — WCAG 2.1 AA Accessibility', () => {


  test('[ACC-001] login page has no critical accessibility violations', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    await page.waitForSelector('[data-test-id="login-btn"]');


    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();


    const critical = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    if (critical.length > 0) {
      critical.forEach(v => console.log(`[${v.impact}] ${v.id}: ${v.description}`));
    }
    expect(critical).toHaveLength(0);
  });


  test('[ACC-002] register page has no critical accessibility violations', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`);
    await page.waitForSelector('[data-test-id="register-btn"]');


    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();


    const critical = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(critical).toHaveLength(0);
  });


  test('[ACC-003] login page has valid lang attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
    expect(['en', 'ar']).toContain(lang);
  });


  test('[ACC-004] register page has valid lang attribute', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`);
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBeTruthy();
  });


  test('[ACC-005] all images on login page have alt text', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    const results = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });


  test('[ACC-006] login form inputs have labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });


  test('[ACC-007] register form inputs have labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`);
    const results = await new AxeBuilder({ page })
      .withRules(['label'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });


  test('[ACC-008] login button is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    const results = await new AxeBuilder({ page })
      .include('[data-test-id="login-btn"]')
      .withRules(['button-name'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });


  test('[ACC-009] register button is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`);
    const results = await new AxeBuilder({ page })
      .include('[data-test-id="register-btn"]')
      .withRules(['button-name'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });


  test('[ACC-010] chat page has no critical violations when authenticated', async ({ chatPage }) => {
    const results = await new AxeBuilder({ page: chatPage })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
  
  
    const critical = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    if (critical.length > 0) {
      critical.forEach(v => console.log(`[${v.impact}] ${v.id}: ${v.description}`));
    }
    expect(critical).toHaveLength(0);
  });
  


  test('[ACC-011] chat send button is accessible', async ({ chatPage }) => {
    const results = await new AxeBuilder({ page: chatPage })
      .include('#send-btn')
      .withRules(['button-name'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });  


  test('[ACC-012] chat input area has no aria violations', async ({ chatPage }) => {
    const results = await new AxeBuilder({ page: chatPage })
      .include('#input-area')
      .withRules(['aria-required-attr', 'aria-valid-attr'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });
  


  test('[ACC-013] RTL direction is set correctly in Arabic mode', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    await page.locator('[data-test-id="lang-toggle-btn"]').click();
    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('ar');
  });


  test('[ACC-014] UAE stripe has 4 color segments', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/login.html`);
    const segments = page.locator('.uae-stripe > div');
    await expect(segments).toHaveCount(4);
  });


  test('[ACC-015] page heading structure is valid on register page', async ({ page }) => {
    await page.goto(`${BASE_URL}/pages/register.html`);
    const results = await new AxeBuilder({ page })
      .withRules(['heading-order', 'empty-heading'])
      .analyze();
    expect(results.violations).toHaveLength(0);
  });


});