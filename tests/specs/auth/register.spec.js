const { test, expect } = require('../../fixtures/fixtures');
const { AuthPage }     = require('../../pages/AuthPage');
const { UAE_EMIRATES } = require('../../data/testData');

const VALID_PASSWORD = 'TestPass123!';

test.describe('Given the registration page', () => {

  test.describe('When a valid user registers', () => {

    test('[REG-001] redirects to chat on successful registration', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({
        name:     'Ahmed Al Mansouri',
        email:    auth.uniqueEmail('reg001'),
        password: VALID_PASSWORD,
        emirate:  'Dubai'
      });
      await expect(page).toHaveURL(/chat\.html/, { timeout: 10000 });
    });

    test('[REG-002] stores auth token in localStorage after registration', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.register({
        name:     'Sara Al Zaabi',
        email:    auth.uniqueEmail('reg002'),
        password: VALID_PASSWORD,
        emirate:  'Abu Dhabi'
      });
      await page.waitForURL(/chat\.html/, { timeout: 10000 });
      const token = await auth.getLocalStorage('tawfeer_token');
      expect(token).toBeTruthy();
      expect(token.length).toBeGreaterThan(10);
    });

    test('[REG-003] accepts all 7 UAE emirates', async ({ api }) => {
      for (const emirate of UAE_EMIRATES) {
        const { status, body } = await api.register({
          name:     `User ${emirate}`,
          email:    api.uniqueEmail(),
          password: VALID_PASSWORD,
          emirate
        });
        expect(status, `Register failed for emirate: ${emirate}`).toBe(200);
        expect(body.success, `Success false for emirate: ${emirate}`).toBe(true);
      }
    });

    test('[REG-004] hero counter bar shows real numbers', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await page.waitForTimeout(1000);
      const nums = await auth.getHeroNumbers();
      expect(nums.users).not.toBe('—');
      expect(nums.trips).not.toBe('—');
      expect(nums.km).not.toBe('—');
    });

  });

  test.describe('When registration fields are invalid', () => {

    test('[REG-005] blocks empty name', async ({ api }) => {
      const { body } = await api.register({
        name: '', email: api.uniqueEmail(), password: VALID_PASSWORD, emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-006] blocks empty email', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: '', password: VALID_PASSWORD, emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-007] blocks malformed email — missing @', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: 'notanemail', password: VALID_PASSWORD, emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-008] blocks malformed email — no domain', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: 'test@', password: VALID_PASSWORD, emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-009] blocks password shorter than 6 characters', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: api.uniqueEmail(), password: '123', emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-010] blocks missing emirate', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: api.uniqueEmail(), password: VALID_PASSWORD, emirate: ''
      });
      expect(body.success).toBe(false);
    });

    test('[REG-011] blocks invalid emirate value', async ({ api }) => {
      const { body } = await api.register({
        name: 'Test User', email: api.uniqueEmail(), password: VALID_PASSWORD, emirate: 'Antarctica'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-012] blocks duplicate email with EMAIL_EXISTS code', async ({ api }) => {
      const email = api.uniqueEmail();
      await api.register({ name: 'First User', email, password: VALID_PASSWORD, emirate: 'Dubai' });
      const { body } = await api.register({
        name: 'Second User', email, password: VALID_PASSWORD, emirate: 'Sharjah'
      });
      expect(body.success).toBe(false);
      expect(body.code).toBe('EMAIL_EXISTS');
    });

    test('[REG-013] blocks SQL injection in name field', async ({ api }) => {
      const { body } = await api.register({
        name:    "Robert'); DROP TABLE users; --",
        email:   api.uniqueEmail(),
        password: VALID_PASSWORD,
        emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-014] blocks XSS payload in name field', async ({ api }) => {
      const { body } = await api.register({
        name:    '<script>alert("xss")</script>',
        email:   api.uniqueEmail(),
        password: VALID_PASSWORD,
        emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-015] blocks empty payload', async ({ api }) => {
      const { status } = await api.register({});
      expect([400, 422, 500]).toContain(status);
    });

    test('[REG-016] blocks name longer than 200 characters', async ({ api }) => {
      const { body } = await api.register({
        name:    'A'.repeat(201),
        email:   api.uniqueEmail(),
        password: VALID_PASSWORD,
        emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

    test('[REG-017] blocks whitespace-only name', async ({ api }) => {
      const { body } = await api.register({
        name:    '     ',
        email:   api.uniqueEmail(),
        password: VALID_PASSWORD,
        emirate: 'Dubai'
      });
      expect(body.success).toBe(false);
    });

  });

  test.describe('When a logged-in user visits the register page', () => {

    test('[REG-018] redirects away from register page when token exists', async ({ page }) => {
      const auth = new AuthPage(page);
      // Navigate first so localStorage is accessible
      await auth.goToRegister();
      await auth.setLocalStorage('tawfeer_token', 'fake-but-present-token');
      await auth.setLocalStorage('tawfeer_user', JSON.stringify({ name: 'Test', emirate: 'Dubai' }));
      await auth.reload();
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).not.toContain('register.html');
    });

  });

  test.describe('When the language is toggled', () => {

    test('[REG-019] hero counter labels switch to Arabic on toggle', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.toggleLanguage();
      const labelEl = page.locator('#hero-l-users');
      await expect(labelEl).toHaveText(/مستخدم/, { timeout: 3000 });
    });

    test('[REG-020] RTL direction is set when Arabic is toggled', async ({ page }) => {
      const auth = new AuthPage(page);
      await auth.goToRegister();
      await auth.toggleLanguage();
      const dir = await auth.getPageDirection();
      expect(dir).toBe('rtl');
    });

  });

});