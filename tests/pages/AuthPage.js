const { BasePage } = require('./BasePage');

class AuthPage extends BasePage {
  constructor(page) {
    super(page);

    this.nameInput      = page.locator('[data-test-id="register-name"]');
    this.emailInput     = page.locator('[data-test-id="register-email"]');
    this.passwordInput  = page.locator('[data-test-id="register-password"]');
    this.emirateSelect  = page.locator('[data-test-id="register-emirate"]');
    this.registerBtn    = page.locator('[data-test-id="register-btn"]');
    this.registerError  = page.locator('[data-test-id="register-error"]');
    this.registerSuccess = page.locator('[data-test-id="register-success"]');

    this.loginEmail     = page.locator('[data-test-id="login-email"]');
    this.loginPassword  = page.locator('[data-test-id="login-password"]');
    this.loginBtn       = page.locator('[data-test-id="login-btn"]');
    this.loginError     = page.locator('[data-test-id="login-error"]');

    this.heroUsers      = page.locator('#hero-users');
    this.heroTrips      = page.locator('#hero-trips');
    this.heroKm         = page.locator('#hero-km');
    this.langToggle     = page.locator('[data-test-id="lang-toggle-btn"]');
  }

  async goToRegister() {
    await this.navigate('/pages/register.html');
    await this.waitForSelector('[data-test-id="register-btn"]');
  }

  async goToLogin() {
    await this.navigate('/pages/login.html');
    await this.waitForSelector('[data-test-id="login-btn"]');
  }

  async fillRegister({ name, email, password, emirate }) {
    if (name     !== undefined) await this.nameInput.fill(name);
    if (email    !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
    if (emirate  !== undefined) await this.emirateSelect.selectOption(emirate);
  }

  async submitRegister() {
    await this.registerBtn.click();
  }

  async register(user) {
    await this.fillRegister(user);
    await this.submitRegister();
  }

  async fillLogin({ email, password }) {
    if (email    !== undefined) await this.loginEmail.fill(email);
    if (password !== undefined) await this.loginPassword.fill(password);
  }

  async submitLogin() {
    await this.loginBtn.click();
  }

  async login(credentials) {
    await this.fillLogin(credentials);
    await this.submitLogin();
  }

  async loginWithEnter(credentials) {
    await this.fillLogin(credentials);
    await this.loginPassword.press('Enter');
  }

  async getRegisterErrorText() {
    return this.registerError.innerText();
  }

  async getLoginErrorText() {
    return this.loginError.innerText();
  }

  async heroCounterIsVisible() {
    return (
      await this.heroUsers.isVisible() &&
      await this.heroTrips.isVisible() &&
      await this.heroKm.isVisible()
    );
  }

  async getHeroNumbers() {
    return {
      users: await this.heroUsers.innerText(),
      trips: await this.heroTrips.innerText(),
      km:    await this.heroKm.innerText()
    };
  }

  async toggleLanguage() {
    await this.langToggle.click();
  }

  async getLangToggleText() {
    return this.langToggle.innerText();
  }

  async registerAndRedirectToChat(user) {
    await this.goToRegister();
    await this.register(user);
    await this.page.waitForURL('**/chat.html', { timeout: 10000 });
  }

  async loginAndRedirectToChat(credentials) {
    await this.goToLogin();
    await this.login(credentials);
    await this.page.waitForURL('**/chat.html', { timeout: 10000 });
  }
}

module.exports = { AuthPage };
