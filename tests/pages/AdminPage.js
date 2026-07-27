const { BasePage } = require('./BasePage');

const ADMIN_KEY = process.env.ADMIN_KEY || 'tawfeer2026dast';

class AdminPage extends BasePage {
  constructor(page) {
    super(page);

    this.keyInput    = page.locator('#admin-key-input');
    this.keySubmit   = page.locator('#admin-key-submit');
    this.dashboard   = page.locator('#admin-dashboard');
    this.userTable   = page.locator('#admin-user-table, table').first();
    this.tripTable   = page.locator('#admin-trip-table, table').nth(1);
    this.totalUsers  = page.locator('[data-test-id="admin-user-count"], #admin-user-count');
    this.totalTrips  = page.locator('[data-test-id="admin-trip-count"], #admin-trip-count');
    this.totalKm     = page.locator('[data-test-id="admin-total-km"],   #admin-total-km');
    this.totalCo2    = page.locator('[data-test-id="admin-total-co2"],  #admin-total-co2');
    this.csvExport   = page.locator('[data-test-id="csv-export"], #csv-export, button').filter({ hasText: /csv|export/i }).first();
    this.errorMsg    = page.locator('.error, #admin-error, [data-test-id="admin-error"]');
  }

  async goToAdmin() {
    await this.navigate('/pages/admin.html');
  }

  async enterKey(key) {
    await this.keyInput.fill(key);
    await this.keySubmit.click();
  }

  async openWithValidKey() {
    await this.goToAdmin();
    await this.enterKey(ADMIN_KEY);
    await this.page.waitForSelector('#admin-dashboard, .admin-content, table', { timeout: 10000 });
  }

  async dashboardIsVisible() {
    return this.dashboard.isVisible().catch(() => false);
  }

  async getUserCount() {
    const text = await this.totalUsers.innerText();
    return parseInt(text.replace(/\D/g, ''), 10);
  }

  async getTripCount() {
    const text = await this.totalTrips.innerText();
    return parseInt(text.replace(/\D/g, ''), 10);
  }

  async userTableRowCount() {
    return this.userTable.locator('tbody tr').count();
  }

  async tripTableRowCount() {
    return this.tripTable.locator('tbody tr').count();
  }

  async methodologyFooterVisible() {
    const footer = this.page.locator('footer, .methodology, [data-test-id="methodology"]');
    return footer.filter({ hasText: /192|MoCCAE|methodology/i }).isVisible();
  }
}

module.exports = { AdminPage };
