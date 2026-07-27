const BASE_URL  = process.env.BASE_URL  || 'http://localhost:3000';
const ADMIN_KEY = process.env.ADMIN_KEY || 'tawfeer2026dast';

const TEST_USER = {
  name:     process.env.TEST_USER_NAME     || 'Test User',
  email:    process.env.TEST_USER_EMAIL    || 'test@test.com',
  password: process.env.TEST_USER_PASSWORD || 'test123',
  emirate:  process.env.TEST_USER_EMIRATE  || 'Dubai'
};

class GovAssistApiClient {
  constructor(request) {
    this.request = request;
    this.baseUrl = BASE_URL;
  }

  async getHealth() {
    const res = await this.request.get(`${this.baseUrl}/api/health`);
    return { status: res.status(), body: await res.json() };
  }

  async register(payload) {
    const res = await this.request.post(`${this.baseUrl}/api/auth/register`, { data: payload });
    return { status: res.status(), body: await res.json() };
  }

  async login(payload) {
    const res = await this.request.post(`${this.baseUrl}/api/auth/login`, { data: payload });
    return { status: res.status(), body: await res.json() };
  }

  async loginAsTestUser() {
    return this.login({ email: TEST_USER.email, password: TEST_USER.password });
  }

  async logout(token) {
    const res = await this.request.post(`${this.baseUrl}/api/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }

  async sendChat(message, sessionId = null, userEmirate = 'Dubai', userArea = '') {
    const payload = { message, userEmirate, userArea };
    if (sessionId) payload.sessionId = sessionId;
    const res = await this.request.post(`${this.baseUrl}/api/chat`, { data: payload });
    return { status: res.status(), body: await res.json() };
  }

  async sendChatRaw(payload) {
    const res = await this.request.post(`${this.baseUrl}/api/chat`, { data: payload });
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }

  async clearSession(sessionId) {
    const res = await this.request.delete(
      `${this.baseUrl}/api/session/${sessionId}`
    );
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }  

  async sendConversation(messages, sessionId) {
    const responses = [];
    for (const message of messages) {
      responses.push(await this.sendChat(message, sessionId));
    }
    return responses;
  }

  async calculateImpact(emirate, area) {
    const res = await this.request.post(`${this.baseUrl}/api/impact/calculate`, {
      data: { emirate, area }
    });
    return { status: res.status(), body: await res.json() };
  }

  async getImpact() {
    const res = await this.request.get(`${this.baseUrl}/api/impact`);
    return { status: res.status(), body: await res.json() };
  }

  async logTrip(payload) {
    const res = await this.request.post(`${this.baseUrl}/api/impact/trip`, { data: payload });
    return { status: res.status(), body: await res.json() };
  }

  async getAdminData() {
    const res = await this.request.get(`${this.baseUrl}/api/impact/admin`, {
      headers: { 'x-admin-key': ADMIN_KEY }
    });
    return { status: res.status(), body: await res.json() };
  }

  async getAdminDataWithKey(key) {
    const res = await this.request.get(`${this.baseUrl}/api/impact/admin`, {
      headers: { 'x-admin-key': key }
    });
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }

  async searchPolicies(query) {
    const res = await this.request.get(
      `${this.baseUrl}/api/policies/search?q=${encodeURIComponent(query)}`
    );
    return { status: res.status(), body: await res.json() };
  }

  async searchPoliciesRaw(queryString = '') {
    const url = queryString
      ? `${this.baseUrl}/api/policies/search?${queryString}`
      : `${this.baseUrl}/api/policies/search`;
    const res = await this.request.get(url);
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }  

  async getFines(plateNumber) {
    const res = await this.request.get(`${this.baseUrl}/api/tools/fines/${plateNumber}`);
    return { status: res.status(), body: await res.json() };
  }

  async bookAppointment(service, date) {
    const res = await this.request.post(`${this.baseUrl}/api/tools/appointment`, {
      data: { service, date }
    });
    return { status: res.status(), body: await res.json() };
  }

  async bookAppointmentRaw(payload) {
    const res = await this.request.post(`${this.baseUrl}/api/tools/appointment`, {
      data: payload
    });
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }

  async setSessionArea(sessionId, userArea) {
    const res = await this.request.post(`${this.baseUrl}/api/session/${sessionId}/area`, {
      data: { userArea }
    });
    return { status: res.status(), body: await res.json().catch(() => ({})) };
  }

  // Only for adversarial registration tests — generates a throwaway email
  uniqueEmail(prefix = 'attack') {
    return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2)}@tawfeer-test.invalid`;
  }
}

module.exports = { GovAssistApiClient, TEST_USER };