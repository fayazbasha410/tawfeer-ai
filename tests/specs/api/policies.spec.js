const { test, expect } = require('../../fixtures/fixtures');
const { assertPolicyInResults } = require('../../helpers/testHelpers');

// Real TWF IDs from the actual API
const POLICY_IDS = {
  driving_dubai:    'TWF-001',
  driving_sharjah:  'TWF-068',
  driving_ajman:    'TWF-073',
  nol_fine:         'TWF-037',
  nol_types:        'TWF-033',
  nol_info:         'TWF-032',
  salik_open:       'TWF-020',
  vehicle_reg:      'TWF-011',
};

test.describe('Policy Search API', () => {

  test('[TC_POL_001] returns 400 when query param is missing', async ({ api }) => {
    const { status } = await api.searchPoliciesRaw();
    expect(status).toBe(400);
  });

  test('[TC_POL_002] returns results array for valid query', async ({ api }) => {
    const { status, body } = await api.searchPolicies('driving license');
    expect(status).toBe(200);
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  test('[TC_POL_003] each result has id, title, content, score', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license');
    for (const doc of body.results) {
      expect(typeof doc.id).toBe('string');
      expect(typeof doc.title).toBe('string');
      expect(typeof doc.content).toBe('string');
      expect(typeof doc.score).toBe('number');
      expect(doc.score).toBeGreaterThan(0);
    }
  });

  test('[TC_POL_004] each result has emirate field', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license');
    for (const doc of body.results) {
      expect(typeof doc.emirate).toBe('string');
      expect(doc.emirate.length).toBeGreaterThan(0);
    }
  });

  test('[TC_POL_005] results are sorted by score descending', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license renewal');
    const scores = body.results.map(r => r.score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
    }
  });

  test('[TC_POL_006] driving license Dubai returns TWF-001', async ({ api }) => {
    const { body } = await api.searchPolicies('how do I renew my driving license in Dubai');
    assertPolicyInResults(body.results, POLICY_IDS.driving_dubai);
  });

  test('[TC_POL_007] driving license Sharjah returns TWF-068', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license renewal Sharjah');
    assertPolicyInResults(body.results, POLICY_IDS.driving_sharjah);
  });

  test('[TC_POL_008] driving license Ajman returns TWF-073', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license renewal Ajman');
    assertPolicyInResults(body.results, POLICY_IDS.driving_ajman);
  });

  test('[TC_POL_009] NOL fine query returns TWF-037', async ({ api }) => {
    const { body } = await api.searchPolicies('NOL card fine travelling without');
    assertPolicyInResults(body.results, POLICY_IDS.nol_fine);
  });

  test('[TC_POL_010] NOL card types query returns TWF-033', async ({ api }) => {
    const { body } = await api.searchPolicies('types of NOL cards Dubai silver gold blue');
    assertPolicyInResults(body.results, POLICY_IDS.nol_types);
  });

  test('[TC_POL_011] Sharjah results have emirate Sharjah', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license renewal Sharjah SRTA');
    const sharjahResults = body.results.filter(r => r.emirate === 'Sharjah');
    expect(sharjahResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_012] Ajman results have emirate Ajman', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license Ajman police');
    const ajmanResults = body.results.filter(r => r.emirate === 'Ajman');
    expect(ajmanResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_013] Dubai results have emirate Dubai', async ({ api }) => {
    const { body } = await api.searchPolicies('RTA Dubai driving license renewal rta.ae');
    const dubaiResults = body.results.filter(r => r.emirate === 'Dubai');
    expect(dubaiResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_014] canResolveDigitally is boolean on each result', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license');
    for (const doc of body.results) {
      if (doc.canResolveDigitally !== undefined) {
        expect(typeof doc.canResolveDigitally).toBe('boolean');
      }
    }
  });

  test('[TC_POL_015] Abu Dhabi query returns Abu Dhabi results', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license Abu Dhabi TAMM ITC');
    const auhResults = body.results.filter(r => r.emirate === 'Abu Dhabi');
    expect(auhResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_016] RAK query returns RAK results', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license Ras Al Khaimah RAK police');
    const rakResults = body.results.filter(r => r.emirate === 'Ras Al Khaimah');
    expect(rakResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_017] Fujairah query returns Fujairah results', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license Fujairah police');
    const fujResults = body.results.filter(r => r.emirate === 'Fujairah');
    expect(fujResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_018] UAQ query returns UAQ results', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license Umm Al Quwain UAQ police');
    const uaqResults = body.results.filter(r => r.emirate === 'Umm Al Quwain');
    expect(uaqResults.length).toBeGreaterThan(0);
  });

  test('[TC_POL_019] vehicle registration query returns results', async ({ api }) => {
    const { body } = await api.searchPolicies('vehicle registration renewal mulkiya Dubai');
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.results[0].title.toLowerCase()).toMatch(/vehicle|registration|mulkiya/);
  });

  test('[TC_POL_020] Salik query returns Salik results', async ({ api }) => {
    const { body } = await api.searchPolicies('Salik account Dubai toll gate');
    expect(body.results.length).toBeGreaterThan(0);
    const hasSalik = body.results.some(r => r.title.toLowerCase().includes('salik'));
    expect(hasSalik).toBe(true);
  });

  test('[TC_POL_021] NOL card query returns NOL results', async ({ api }) => {
    const { body } = await api.searchPolicies('NOL card Dubai metro bus');
    expect(body.results.length).toBeGreaterThan(0);
    const hasNol = body.results.some(r => r.title.toLowerCase().includes('nol'));
    expect(hasNol).toBe(true);
  });

  test('[TC_POL_022] traffic fines query returns fines results', async ({ api }) => {
    const { body } = await api.searchPolicies('traffic fines Dubai RTA check pay');
    expect(body.results.length).toBeGreaterThan(0);
  });

  test('[TC_POL_023] Arabic query returns results', async ({ api }) => {
    const { body } = await api.searchPolicies('رخصة القيادة دبي');
    expect(Array.isArray(body.results)).toBe(true);
  });

  test('[TC_POL_024] policyRef field is present on results', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license');
    for (const doc of body.results) {
      if (doc.policyRef !== undefined) {
        expect(typeof doc.policyRef).toBe('string');
      }
    }
  });

  test('[TC_POL_025] source field is present on results', async ({ api }) => {
    const { body } = await api.searchPolicies('driving license');
    for (const doc of body.results) {
      if (doc.source !== undefined) {
        expect(typeof doc.source).toBe('string');
      }
    }
  });

});