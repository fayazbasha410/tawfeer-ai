class MessageList {
  constructor(page) {
    this.page = page;
    this.container = page.locator('#messages');
  }

  getUserMessages() {
    return this.page.locator('.message.user');
  }

  getAssistantMessages() {
    return this.page.locator('.message.assistant');
  }

  getErrorMessages() {
    return this.page.locator('.message.error');
  }

  async getLastAssistantMessage(timeout = 60000) {
    await this.page.locator('.message.assistant').nth(1)
      .waitFor({ state: 'visible', timeout });
    const all = this.getAssistantMessages();
    const count = await all.count();
    return all.nth(count - 1);
  }

  async getLastUserMessage() {
    const all = this.getUserMessages();
    const count = await all.count();
    return all.nth(count - 1);
  }

  async getMessageCount() {
    return this.page.locator('.message').count();
  }

  async getAssistantMessageCount() {
    return this.getAssistantMessages().count();
  }

  getRagTag() {
    return this.page.locator('.tag.rag');
  }

  getToolTag() {
    return this.page.locator('.tag.tool');
  }

  getBlockedTag() {
    return this.page.locator('.tag.blocked');
  }

  getMemoryTag() {
    return this.page.locator('.tag.memory');
  }

  getConfidenceTag() {
    return this.page.locator('.tag.confidence-high, .tag.confidence-medium, .tag.confidence-low');
  }

  async waitForRagTag(timeout = 60000) {
    await this.page.locator('.tag.rag').waitFor({ state: 'visible', timeout });
    return this.getRagTag();
  }

  async waitForToolTag(timeout = 15000) {
    await this.page.locator('.tag.tool').waitFor({ state: 'visible', timeout });
    return this.getToolTag();
  }

  async waitForBlockedTag(timeout = 10000) {
    await this.page.locator('.tag.blocked').waitFor({ state: 'visible', timeout });
    return this.getBlockedTag();
  }

  async waitForMemoryTag(timeout = 15000) {
    await this.page.locator('.tag.memory').waitFor({ state: 'visible', timeout });
    return this.getMemoryTag();
  }

  async lastAssistantContainsArabic() {
    const msg = await this.getLastAssistantMessage();
    const text = await msg.innerText();
    return /[\u0600-\u06FF]/.test(text);
  }

  async lastAssistantText(timeout = 60000) {
    const msg = await this.getLastAssistantMessage(timeout);
    return msg.innerText();
  }

  async allAssistantTexts() {
    const msgs = this.getAssistantMessages();
    const count = await msgs.count();
    const texts = [];
    for (let i = 0; i < count; i++) {
      texts.push(await msgs.nth(i).innerText());
    }
    return texts;
  }
}

module.exports = { MessageList };
