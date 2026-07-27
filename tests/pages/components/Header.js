class Header {
  constructor(page) {
    this.page     = page;
    this.root     = page.locator('header');
    this.title    = page.locator('header h1');
    this.subtitle = page.locator('header p').first();
    this.uaeStripe = page.locator('.uae-stripe');
  }

  async getTitle() {
    return this.title.innerText();
  }

  async getSubtitle() {
    return this.subtitle.innerText();
  }

  async isVisible() {
    return this.root.isVisible();
  }

  async isSticky() {
    const position = await this.root.evaluate(el => getComputedStyle(el).position);
    return position === 'sticky' || position === 'fixed';
  }

  async uaeStripeVisible() {
    return this.uaeStripe.isVisible();
  }

  async uaeStripeSegmentCount() {
    return this.page.locator('.uae-stripe > div').count();
  }
}

module.exports = { Header };
