const { BasePage }        = require('./BasePage');
const { Header }          = require('./components/Header');
const { MessageList }     = require('./components/MessageList');
const { InputBar }        = require('./components/InputBar');
const { TripConfirmPage } = require('./TripConfirmPage');

class ChatPage extends BasePage {
  constructor(page) {
    super(page);
    this.header  = new Header(page);
    this.messages = new MessageList(page);
    this.input   = new InputBar(page);
    this.trip    = new TripConfirmPage(page);

    this.langToggle  = page.locator('[data-test-id="lang-toggle-btn"]');
    this.newChatBtn  = page.locator('[data-test-id="new-chat-btn"]');
    this.logoutBtn   = page.locator('[data-test-id="logout-btn"]');
    this.impactPill  = page.locator('[data-test-id="impact-pill"]');
    this.userBadge   = page.locator('[data-test-id="user-badge"]');
    this.totalKm     = page.locator('#total-km');
  }

  async gotoAuthenticated(authToken, user) {
    await this.navigate('/pages/chat.html');
    await this.page.evaluate(
      ([token, u]) => {
        localStorage.setItem('tawfeer_token', token);
        localStorage.setItem('tawfeer_user', JSON.stringify(u));
      },
      [authToken, user]
    );
    await this.navigate('/pages/chat.html');
    await this.waitForSelector('.message.assistant');
  }

  async goto() {
    await this.navigate('/pages/chat.html');
    await this.waitForSelector('.message.assistant');
  }

  async sendMessage(message, timeout = 60000) {
    await this.input.typeAndSend(message);
    return this.messages.getLastAssistantMessage(timeout);
  }

  async sendMessageWithEnter(message, timeout = 60000) {
    await this.input.sendWithEnter(message);
    return this.messages.getLastAssistantMessage(timeout);
  }

  async clickSuggestion(index = 0, timeout = 60000) {
    await this.input.clickSuggestion(index);
    return this.messages.getLastAssistantMessage(timeout);
  }

  async toggleLanguage() {
    await this.langToggle.click();
  }

  async getLangToggleText() {
    return this.langToggle.innerText();
  }

  async startNewConversation() {
    await this.newChatBtn.click();
    await this.page.waitForTimeout(300);
  }

  async logout() {
    await this.logoutBtn.click();
  }

  async getTotalKm() {
    return this.totalKm.innerText();
  }

  async getUserBadgeText() {
    return this.userBadge.innerText();
  }

  async getImpactPillText() {
    return this.impactPill.innerText();
  }
}

module.exports = { ChatPage };
