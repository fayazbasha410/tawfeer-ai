const { BasePage } = require('./BasePage');

class TripConfirmPage extends BasePage {
  constructor(page) {
    super(page);

    this.areaPrompt   = page.locator('[data-test-id="area-prompt-banner"]');
    this.areaInput    = page.locator('[data-test-id="area-input"]');
    this.areaSubmit   = page.locator('[data-test-id="area-submit-btn"]');
    this.confirmBanner = page.locator('[data-test-id="trip-confirm-banner"]');
    this.yesBtn       = page.locator('[data-test-id="trip-yes-btn"]');
    this.noBtn        = page.locator('[data-test-id="trip-no-btn"]');
    this.sustainCard  = page.locator('.sustain-card');
    this.totalKm      = page.locator('#total-km');
  }

  async areaPromptVisible(timeout = 5000) {
    await this.areaPrompt.waitFor({ state: 'visible', timeout });
    return this.areaPrompt.isVisible();
  }

  async submitArea(areaName) {
    await this.areaInput.fill(areaName);
    await this.areaSubmit.click();
  }

  async submitAreaWithEnter(areaName) {
    await this.areaInput.fill(areaName);
    await this.areaInput.press('Enter');
  }

  async confirmBannerVisible(timeout = 8000) {
    await this.confirmBanner.waitFor({ state: 'visible', timeout });
    return this.confirmBanner.isVisible();
  }

  async confirmTrip() {
    await this.yesBtn.click();
  }

  async skipTrip() {
    await this.noBtn.click();
  }

  async sustainCardVisible(timeout = 10000) {
    await this.sustainCard.waitFor({ state: 'visible', timeout });
    return this.sustainCard.isVisible();
  }

  async getSustainCardText() {
    return this.sustainCard.innerText();
  }

  async getTotalKmText() {
    return this.totalKm.innerText();
  }

  async waitForKmUpdate(previousKm, timeout = 10000) {
    await this.page.waitForFunction(
      ([el, prev]) => {
        const span = document.getElementById('total-km');
        return span && span.innerText !== prev && span.innerText !== '0';
      },
      [null, previousKm],
      { timeout }
    );
  }
}

module.exports = { TripConfirmPage };
