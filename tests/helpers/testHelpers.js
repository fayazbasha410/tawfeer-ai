const ARABIC_PATTERN = /[\u0600-\u06FF]/;

function containsArabic(text) {
  return ARABIC_PATTERN.test(text);
}

function assertArabicResponse(body) {
  if (!containsArabic(body.reply)) {
    throw new Error(`Expected Arabic in reply but got: ${body.reply.slice(0, 120)}`);
  }
  if (body.language !== 'ar') {
    throw new Error(`Expected language 'ar' but got '${body.language}'`);
  }
}

function assertEnglishResponse(body) {
  if (body.language !== 'en') {
    throw new Error(`Expected language 'en' but got '${body.language}'`);
  }
}

function assertChatResponseSchema(body) {
  if (typeof body.reply !== 'string' || body.reply.length === 0)
    throw new Error('reply must be a non-empty string');
  if (typeof body.guardrail !== 'object')
    throw new Error('guardrail must be an object');
  if (typeof body.guardrail.triggered !== 'boolean')
    throw new Error('guardrail.triggered must be a boolean');
  if (!Array.isArray(body.retrievedDocs))
    throw new Error('retrievedDocs must be an array');
  if (body.language !== undefined && !['en', 'ar'].includes(body.language))
    throw new Error(`language must be 'en' or 'ar', got '${body.language}'`);
}

function assertImpactSchema(impact) {
  const required = ['distanceSavedKm', 'co2SavedKg', 'fuelSavedLiters', 'moneySavedAed', 'centerName'];
  for (const key of required) {
    if (impact[key] === undefined) throw new Error(`impact missing field: ${key}`);
  }
  if (impact.distanceSavedKm <= 0) throw new Error('distanceSavedKm must be positive');
  if (impact.co2SavedKg <= 0)      throw new Error('co2SavedKg must be positive');
  if (impact.fuelSavedLiters <= 0) throw new Error('fuelSavedLiters must be positive');
  if (impact.moneySavedAed <= 0)   throw new Error('moneySavedAed must be positive');
  if (!impact.centerName)          throw new Error('centerName must not be empty');
}

function assertCarbonMath(impact) {
  const expectedCo2 = parseFloat(((impact.distanceSavedKm * 192) / 1000).toFixed(2));
  const expectedFuel = parseFloat((impact.distanceSavedKm * 0.08).toFixed(2));
  const expectedMoney = parseFloat((expectedFuel * 2.89).toFixed(2));

  const co2Diff = Math.abs(impact.co2SavedKg - expectedCo2);
  const fuelDiff = Math.abs(impact.fuelSavedLiters - expectedFuel);
  const moneyDiff = Math.abs(impact.moneySavedAed - expectedMoney);

  if (co2Diff > 0.02)   throw new Error(`CO2 math wrong: got ${impact.co2SavedKg}, expected ~${expectedCo2}`);
  if (fuelDiff > 0.02)  throw new Error(`Fuel math wrong: got ${impact.fuelSavedLiters}, expected ~${expectedFuel}`);
  if (moneyDiff > 0.02) throw new Error(`Money math wrong: got ${impact.moneySavedAed}, expected ~${expectedMoney}`);
}

function assertPolicyInResults(results, expectedId) {
  const ids = results.map(r => r.id);
  if (!ids.includes(expectedId)) {
    throw new Error(`Expected policy ${expectedId} in results. Got: [${ids.join(', ')}]`);
  }
}

function assertMemorySchema(body) {
  if (typeof body.sessionId !== 'string')
    throw new Error('sessionId must be string');
  if (typeof body.topicChanged !== 'boolean')
    throw new Error('topicChanged must be boolean');
}

function assertFinesResponseSchema(body) {
  if (typeof body.success !== 'boolean')   throw new Error('success must be boolean');
  if (typeof body.plateNumber !== 'string') throw new Error('plateNumber must be string');
  if (!Array.isArray(body.fines))           throw new Error('fines must be an array');
  if (typeof body.unpaidTotal !== 'number') throw new Error('unpaidTotal must be number');
  if (typeof body.message !== 'string')     throw new Error('message must be string');
}

function assertAppointmentSchema(body) {
  if (typeof body.success !== 'boolean') throw new Error('success must be boolean');
  if (body.success) {
    if (!body.confirmationNumber || !body.confirmationNumber.startsWith('TAMM-'))
      throw new Error('confirmationNumber must start with TAMM-');
    if (typeof body.service !== 'string')  throw new Error('service must be string');
    if (typeof body.date !== 'string')     throw new Error('date must be string');
    if (typeof body.location !== 'string') throw new Error('location must be string');
    if (typeof body.time !== 'string')     throw new Error('time must be string');
  } else {
    if (typeof body.message !== 'string')  throw new Error('failed appointment must have message string');
  }
}

async function measureTime(asyncFn) {
  const start = Date.now();
  const result = await asyncFn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

function assertResponseTime(durationMs, thresholdMs, label = 'Response') {
  if (durationMs > thresholdMs) {
    throw new Error(`${label} took ${durationMs}ms — exceeds threshold of ${thresholdMs}ms`);
  }
}

function replyContains(body, keyword) {
  return body.reply.toLowerCase().includes(keyword.toLowerCase());
}

function replyContainsAny(body, keywords) {
  return keywords.some(k => replyContains(body, k));
}

module.exports = {
  containsArabic,
  assertArabicResponse,
  assertEnglishResponse,
  assertChatResponseSchema,
  assertImpactSchema,
  assertCarbonMath,
  assertPolicyInResults,
  assertMemorySchema,
  assertFinesResponseSchema,
  assertAppointmentSchema,
  measureTime,
  assertResponseTime,
  replyContains,
  replyContainsAny
};
