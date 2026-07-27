class InputBar {
  constructor(page) {
    this.page            = page;
    this.input           = page.locator('#user-input');
    this.sendButton      = page.locator('#send-btn');
    this.voiceButton     = page.locator('#voice-btn');
    this.voiceStatus     = page.locator('#voice-status');
    this.suggestionButtons = page.locator('.suggestion-btn');
  }

  async type(message) {
    await this.input.fill(message);
  }

  async send() {
    await this.sendButton.click();
  }

  async typeAndSend(message) {
    await this.type(message);
    await this.send();
  }

  async sendWithEnter(message) {
    await this.type(message);
    await this.input.press('Enter');
  }

  async clickSuggestion(index = 0) {
    await this.suggestionButtons.nth(index).click();
  }

  async clickSuggestionByText(text) {
    await this.suggestionButtons.filter({ hasText: text }).first().click();
  }

  async getSuggestionCount() {
    return this.suggestionButtons.count();
  }

  async getSuggestionTexts() {
    const count = await this.getSuggestionCount();
    const texts = [];
    for (let i = 0; i < count; i++) {
      texts.push(await this.suggestionButtons.nth(i).innerText());
    }
    return texts;
  }

  async isSendButtonDisabled() {
    return this.sendButton.isDisabled();
  }

  async isInputVisible() {
    return this.input.isVisible();
  }

  async isVoiceButtonVisible() {
    return this.voiceButton.isVisible();
  }

  async getCurrentInputValue() {
    return this.input.inputValue();
  }

  async getVoiceStatusText() {
    return this.voiceStatus.innerText();
  }

  async inputIsEmpty() {
    const val = await this.getCurrentInputValue();
    return val.trim() === '';
  }

  async sendButtonIsEnabled() {
    return !(await this.sendButton.isDisabled());
  }

  async shiftEnterDoesNotSend(message) {
    await this.type(message);
    await this.input.press('Shift+Enter');
    return this.input.inputValue();
  }
}

module.exports = { InputBar };
