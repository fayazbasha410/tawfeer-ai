class BasePage {
  constructor(page) {
    this.page = page;
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  }

  async navigate(path = '') {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  async getTitle() {
    return this.page.title();
  }

  async waitForSelector(selector, timeout = 10000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async isVisible(selector) {
    return this.page.locator(selector).isVisible();
  }

  async waitForNetworkIdle(timeout = 5000) {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async setLocalStorage(key, value) {
    await this.page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [key, value]
    );
  }

  async getLocalStorage(key) {
    return this.page.evaluate(k => localStorage.getItem(k), key);
  }

  async setLanguage(lang) {
    await this.setLocalStorage('tawfeer_lang', lang);
  }

  async reload() {
    await this.page.reload();
    await this.waitForNetworkIdle();
  }

  async getPageDirection() {
    return this.page.evaluate(
      () => document.documentElement.getAttribute('dir')
    );
  }

  async getPageLang() {
    return this.page.evaluate(
      () => document.documentElement.getAttribute('lang')
    );
  }

  uniqueEmail(prefix = 'test') {
    return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@tawfeer-test.invalid`;
  }
}

module.exports = { BasePage };
