require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const policies                             = require('./data/policies');
const { checkFineStatus, bookAppointment } = require('./tools/agentTools');
const { calculateImpact }                  = require('./utils/govCentres');
const { getCumulativeImpact }              = require('./utils/supabase');
const usersRouter  = require('./routes/users');
const impactRouter = require('./routes/impact');
const authRouter   = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/users',  usersRouter);
app.use('/api/impact', impactRouter);
app.use('/api/auth',   authRouter);

// ─────────────────────────────────────────
// SESSION / MULTI-TURN MEMORY
// ─────────────────────────────────────────
const sessions          = new Map();
const SESSION_MAX_TURNS = 6;
const SESSION_TTL_MS    = 30 * 60 * 1000;

const TOPIC_GROUPS = {
  drivingLicense:      ['driving license', 'driving licence', 'renew license', 'renew licence', 'license renewal', 'licence renewal', 'new license', 'eye test', 'traffic file', 'license exchange', 'lost license', 'replace license'],
  vehicleRegistration: ['vehicle registration', 'mulkiya', 'register vehicle', 'car registration', 'register car', 'transfer ownership', 'vehicle transfer', 'ownership transfer', 'car inspection', 'vehicle inspection', 'vehicle renewal', 'renew vehicle', 'vehicle fees', 'registration fees'],
  trafficFines:        ['traffic fine', 'traffic fines', 'check fines', 'pay fines', 'fines inquiry', 'black points', 'black point', 'fine payment', 'dispute fine', 'salik fine', 'darb fine'],
  toll:                ['salik', 'darb', 'toll', 'toll gate', 'recharge salik', 'salik account', 'salik balance', 'darb account', 'darb balance'],
  publicTransport:     ['metro', 'bus route', 'public transport', 'tram', 'ferry', 'water bus', 'bus from', 'bus to', 'how to get', 'travel from', 'travel to', 'intercity bus', 'hafilat', 'bus service'],
  nolCard:             ['nol card', 'nol balance', 'recharge nol', 'nol top up', 'silver card', 'gold card', 'blue card', 'red ticket', 'nol pass'],
  parking:             ['parking', 'paid parking', 'parking zone', 'parking permit', 'mpark', 'parking meter', 'parking fine'],
  roadPermit:          ['road permit', 'noc', 'no objection', 'heavy vehicle permit', 'oversize permit'],
  appointment:         ['book appointment', 'appointment', 'schedule appointment', 'reserve slot'],
};

// Which topics represent a govt office visit being prevented
const OFFICE_VISIT_TOPICS = ['drivingLicense', 'vehicleRegistration', 'trafficFines', 'nolCard', 'parking', 'roadPermit', 'appointment'];
// Topics that are purely informational — no office visit involved
const INFO_ONLY_TOPICS = ['publicTransport'];

const EMIRATES = [
  'abu dhabi', 'dubai', 'sharjah', 'ajman',
  'umm al quwain', 'ras al khaimah', 'fujairah', 'uaq', 'rak'
];

const EMIRATE_AUTHORITIES = {
  'dubai':          'RTA',
  'abu dhabi':      'TAMM',
  'sharjah':        'SRTA',
  'ajman':          'Ajman Police',
  'ras al khaimah': 'RAK Police',
  'rak':            'RAK Police',
  'fujairah':       'Fujairah Police',
  'umm al quwain':  'UAQ Police',
  'uaq':            'UAQ Police',
};

function detectTopicGroup(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [group, keywords] of Object.entries(TOPIC_GROUPS)) {
    scores[group] = keywords.filter(k => lower.includes(k)).length;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const best = sorted[0];
  return best && best[1] > 0 ? best[0] : null;
}

function isOfficeVisitTopic(topic) {
  return topic && OFFICE_VISIT_TOPICS.includes(topic);
}

function isInfoOnlyTopic(topic) {
  return topic && INFO_ONLY_TOPICS.includes(topic);
}

function detectEmirate(text) {
  const lower = text.toLowerCase();
  return EMIRATES.find(e => lower.includes(e)) || null;
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history:        [],
      currentTopic:   null,
      currentEmirate: null,
      topicChanged:   false,
      topicTurns:     0,
      lastActivity:   Date.now(),
      userId:         null,
      userName:       null,
      userEmirate:    null,
      userArea:       null,
      emirateConfirmed: false,
      areaConfirmed:    false,
    });
  }
  const session = sessions.get(sessionId);
  session.lastActivity = Date.now();
  return session;
}

function addToHistory(session, role, content) {
  session.history.push({ role, content });
  if (session.history.length > SESSION_MAX_TURNS * 2) {
    session.history = session.history.slice(-SESSION_MAX_TURNS * 2);
  }
}

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) sessions.delete(id);
  }
}, 10 * 60 * 1000);

// ─────────────────────────────────────────
// CONFIDENCE SCORING
// ─────────────────────────────────────────
function computeConfidence(docs, query) {
  if (!docs || docs.length === 0) {
    return { level: 'low', label: 'Low confidence', policyId: null, reason: 'No matching policies found' };
  }
  const top       = docs[0];
  const second    = docs[1];
  const topScore  = top.score || 0;
  const scoreGap  = second ? topScore - (second.score || 0) : topScore;
  const queryEmirate = detectEmirate(query);
  const emirateMatch = queryEmirate && (top.emirate || '').toLowerCase() === queryEmirate;

  let level, label, reason;
  if (topScore >= 8 && scoreGap >= 3) {
    level  = 'high';
    label  = 'High confidence';
    reason = emirateMatch ? `Matched emirate-specific policy ${top.id}` : `Strong match on ${top.id}`;
  } else if (topScore >= 5 || scoreGap >= 2) {
    level  = 'medium';
    label  = 'Medium confidence';
    reason = `Partial match — please verify at the official portal`;
  } else {
    level  = 'low';
    label  = 'Low confidence';
    reason = `Weak match — please verify at the relevant UAE portal`;
  }
  return { level, label, policyId: top.id, reason };
}

// ─────────────────────────────────────────
// FOLLOW-UP ENRICHMENT
// ─────────────────────────────────────────
const FOLLOW_UP_TRIGGERS = [
  /^how about (.+)/i,
  /^what about (.+)/i,
  /^and (.+)/i,
  /^in (.+)/i,
  /^for (.+)/i,
  /^what (about )?(.+)/i,
];

function isFollowUp(message) {
  const lower = message.trim().toLowerCase();
  if (lower.split(/\s+/).length <= 4 && EMIRATES.some(e => lower.includes(e))) return true;
  return FOLLOW_UP_TRIGGERS.some(r => r.test(lower));
}

function enrichFollowUp(message, session) {
  const detectedEmirate = detectEmirate(message);
  const detectedTopic   = detectTopicGroup(message);
  const topic   = detectedTopic   || session.currentTopic;
  const emirate = detectedEmirate || session.currentEmirate;
  if (!topic && !emirate) return message;
  const topicKeywords = topic ? TOPIC_GROUPS[topic].slice(0, 3).join(' ') : '';
  const enriched = [topicKeywords, emirate].filter(Boolean).join(' ');
  return enriched;
}

// ─────────────────────────────────────────
// RAG RETRIEVAL
// ─────────────────────────────────────────
function retrieveRelevantDocs(query, topK = 5) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const synonyms = {
    'expires':      ['expiry', 'expired', 'renewal', 'renew'],
    'expired':      ['expiry', 'expired', 'renewal'],
    'register':     ['registration', 'registered'],
    'registration': ['register', 'registered', 'mandatory'],
    'renew':        ['renewal', 'renewing', 'renewed'],
    'renewal':      ['renew', 'renewed'],
    'pay':          ['payment', 'paying', 'paid'],
    'payment':      ['pay', 'paid'],
    'apply':        ['application', 'applying'],
    'application':  ['apply', 'applying'],
    'mandatory':    ['required', 'compulsory', 'must'],
    'required':     ['mandatory', 'compulsory', 'requirement'],
    'documents':    ['document', 'documentation', 'requirements'],
    'license':      ['licence', 'licensed'],
    'licence':      ['license'],
    'fine':         ['fines', 'penalty', 'penalties'],
    'fines':        ['fine', 'penalty', 'penalties'],
    'mulkiya':      ['registration', 'vehicle', 'renewal'],
    'nol':          ['card', 'transit', 'metro', 'bus'],
    'salik':        ['toll', 'gate', 'recharge'],
    'darb':         ['toll', 'abu dhabi', 'gate'],
    'metro':        ['train', 'public transport', 'nol'],
    'black points': ['suspension', 'violation', 'fine'],
    'impound':      ['confiscation', 'vehicle', 'seize'],
    'tamm':         ['abu dhabi', 'vehicle', 'license'],
    'srta':         ['sharjah', 'vehicle', 'license'],
  };

  const expandedWords = new Set(queryWords);
  for (const word of queryWords) {
    const syns = synonyms[word] || [];
    syns.forEach(s => expandedWords.add(s));
  }

  const queryEmirate = detectEmirate(query);

  const scored = policies.map(doc => {
    const text = (
      doc.title + ' ' +
      doc.content + ' ' +
      (doc.emirate   || '') + ' ' +
      (doc.category  || '')
    ).toLowerCase();

    let score = 0;
    for (const word of expandedWords) {
      if (text.includes(word)) score += 1;
    }
    for (const word of queryWords) {
      if (doc.title.toLowerCase().includes(word)) score += 2;
    }

    if (queryEmirate) {
      const docEmirate = (doc.emirate || '').toLowerCase();
      if (docEmirate === queryEmirate)                         score += 5;
      else if (docEmirate === 'all uae' || docEmirate === 'uae') score += 1;
      else if (docEmirate && docEmirate !== queryEmirate)      score -= 2;
    }

    return { ...doc, score };
  });

  return scored
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ─────────────────────────────────────────
// ARABIC DETECTION + TRANSLATION
// ─────────────────────────────────────────
function detectArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

function translateArabicQuery(text) {
  const translations = {
    'رخصة القيادة':        'driving license',
    'تجديد رخصة القيادة': 'driving license renewal',
    'رخصة':               'license',
    'القيادة':            'driving',
    'تجديد':              'renewal renew',
    'رسوم':               'fees registration fees',
    'تسجيل المركبة':      'vehicle registration renew vehicle',
    'تسجيل':              'registration register',
    'تسجيل المركبة':      'vehicle registration mulkiya renew vehicle',
    'رخصة المركبة':       'vehicle registration mulkiya',
    'ملكية':              'mulkiya vehicle registration',
    'الملكية':            'mulkiya vehicle registration',
    'رسوم التجديد':       'renewal fees registration fees vehicle registration',
    'غرامة':              'fine',
    'غرامات':             'fines',
    'مخالفة':             'fine penalty',
    'مرور':               'traffic',
    'سيارة':              'vehicle',
    'تسجيل السيارة':      'vehicle registration mulkiya',
    'تسجيل':              'registration',
    'الملكية':            'mulkiya registration',
    'ملكية':              'mulkiya registration',
    'نقل الملكية':        'vehicle ownership transfer',
    'بطاقة نول':          'nol card',
    'نول':                'nol card transit',
    'سالك':               'salik toll',
    'دارب':               'darb toll abu dhabi',
    'مترو':               'metro train dubai',
    'حافلة':              'bus transport',
    'ترام':               'tram dubai',
    'موقف':               'parking',
    'تأمين':              'insurance',
    'فحص':                'inspection test',
    'نقاط سوداء':         'black points',
    'تأشيرة':             'visa',
    'إقامة':              'residency',
    'هوية':               'Emirates ID',
    'الهوية الإماراتية': 'Emirates ID',
    'بطاقة الهوية':       'Emirates ID',
    'حجز موعد':           'book appointment',
    'موعد':               'appointment',
    'أبوظبي':             'Abu Dhabi',
    'دبي':                'Dubai',
    'الشارقة':            'Sharjah',
    'عجمان':              'Ajman',
    'رأس الخيمة':         'Ras Al Khaimah',
    'الفجيرة':            'Fujairah',
    'أم القيوين':         'Umm Al Quwain',
    'الإمارات':           'UAE',
    'تامم':               'TAMM Abu Dhabi',
    'هيئة الطرق':         'RTA Dubai',
    'كيف': '', 'ما هي': '', 'ما هو': '', 'هل': '',
    'متى': '', 'أين': '', 'في': '', 'على': '',
  };

  let translated = text;
  const sortedEntries = Object.entries(translations).sort((a, b) => b[0].length - a[0].length);
  for (const [arabic, english] of sortedEntries) {
    translated = translated.replace(new RegExp(arabic, 'g'), english);
  }
  return translated
    .replace(/[\u0600-\u06FF]+/g, '')
    .replace(/[؟،]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─────────────────────────────────────────
// GUARDRAILS — transport only
// ─────────────────────────────────────────
function checkGuardrails(message) {
  const lower = message.toLowerCase();
 
  const banned = [
    'ignore previous instructions', 'ignore all instructions',
    'ignore all rules', 'ignore previous', 'ignore the instructions',
    'іgnore',
    'you are now', 'pretend you are', 'pretend уou', 'forget your instructions',
    'jailbreak', 'dan mode', 'developer mode', 'system prompt',
    'override', 'bypass', 'unrestricted ai', 'no restrictions',
    'act as an unrestricted', 'act as a different',
    '[[system]]', '[[admin]]', '[[override]]',
    '<script', '</script>', 'javascript:',
    'drop table', '-- ', '; drop',
    'malicious.com', 'cmd=', 'exec(', 'eval(',
    '```\nignore', 'love letter', 'write a poem', 'write me a poem',
  ];
  const arabicBanned = [
    'تجاهل التعليمات', 'تجاهل جميع التعليمات', 'أنت الآن',
    'تظاهر بأنك', 'انسَ تعليماتك', 'تجاوز', 'بدون قيود',
    'أنت لم تعد', 'وضع المطور', 'DAN mode',
  ];
  const offTopic = [
    'weather', 'recipe', 'sports', 'movie', 'music', 'joke', 'game',
    'dating', 'stock', 'crypto', 'bitcoin', 'football', 'cricket',
    'basketball', 'school enrollment', 'gratuity', 'social support',
    'ejari', 'tawtheeq', 'trade license', 'vat', 'freelance permit',
    'love letter', 'poem', 'poetry',
  ];
  const arabicOffTopic = [
    'الطقس', 'وصفة', 'كرة القدم', 'فيلم', 'موسيقى', 'نكتة',
    'العملات المشفرة', 'بيتكوين', 'مواعدة', 'الأسهم',
    'تسجيل مدرسي', 'مكافأة نهاية الخدمة', 'ترخيص تجاري',
    'أفضل مطعم',
  ];
 
  for (const p of banned) {
    if (lower.includes(p)) return {
      blocked: true, reason: 'prompt_injection',
      message: 'I can only assist with UAE transport and government services. I cannot follow instructions that attempt to change my behaviour.'
    };
  }
  for (const p of arabicBanned) {
    if (message.includes(p)) return {
      blocked: true, reason: 'prompt_injection',
      message: 'يمكنني فقط المساعدة في خدمات النقل الحكومية في الإمارات.'
    };
  }
  for (const t of offTopic) {
    if (lower.includes(t)) return {
      blocked: true, reason: 'off_topic',
      message: `I'm Tawfeer, specialising in UAE transport services across all 7 emirates — driving licenses, vehicle registration, traffic fines, NOL cards, Salik, public transport, parking, and road permits. How can I help you save a trip today?`
    };
  }
  for (const t of arabicOffTopic) {
    if (message.includes(t)) return {
      blocked: true, reason: 'off_topic',
      message: `أنا توفير، متخصص في خدمات النقل الإماراتية عبر الإمارات السبع — رخص القيادة، تسجيل المركبات، المخالفات المرورية، بطاقة نول، سالك، ووسائل النقل العام.`
    };
  }
  return { blocked: false };
 } 

// ─────────────────────────────────────────
// LLM — GROQ API
// ─────────────────────────────────────────
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function callGroq(systemPrompt, userMessage, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model:       'llama-3.1-8b-instant',
        messages:    [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  }
        ],
        temperature: 0.3,
        max_tokens:  1024
      });
      return completion.choices[0].message.content;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < retries) {
        const waitMs = attempt * 6000;
        console.log(`⏳ Groq rate limit — waiting ${waitMs / 1000}s (retry ${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      throw err;
    }
  }
}

// ─────────────────────────────────────────
// GROQ NATIVE TOOL CALLING
// ─────────────────────────────────────────
const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name:        'checkFineStatus',
      description: 'Check outstanding traffic fines for a vehicle using its plate number.',
      parameters: {
        type:       'object',
        properties: {
          plateNumber: { type: 'string', description: 'Vehicle plate number e.g. AD-1234' }
        },
        required: ['plateNumber']
      }
    }
  },
  {
    type: 'function',
    function: {
      name:        'bookAppointment',
      description: 'Book a government service appointment for a specific service and date.',
      parameters: {
        type:       'object',
        properties: {
          service: {
            type: 'string',
            enum: ['driving-license', 'vehicle-registration', 'emirates-id', 'residency-visa', 'health-card']
          },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' }
        },
        required: ['service', 'date']
      }
    }
  }
];

async function detectToolIntent(message, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model:    'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'UAE transport services assistant. Use checkFineStatus for vehicle fines, bookAppointment for scheduling. If neither applies, do not call any tool.' },
          { role: 'user',   content: message }
        ],
        tools:        TOOL_DEFINITIONS,
        tool_choice:  'auto',
        temperature:  0,
        max_tokens:   256
      });
      const responseMessage = completion.choices[0].message;
      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0];
        return { tool: toolCall.function.name, params: JSON.parse(toolCall.function.arguments) };
      }
      return null;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.message?.includes('429');
      if (isRateLimit && attempt < retries) {
        await new Promise(r => setTimeout(r, attempt * 6000));
        continue;
      }
      console.error('⚠️ Tool detection failed:', err.message);
      return null;
    }
  }
}

// ─────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are Tawfeer (توفير), an AI platform for UAE trip reduction and emissions savings.
You specialise ONLY in UAE transport and government services across all 7 emirates.

AUTHORITY PER EMIRATE:
- Dubai: RTA (rta.ae, Dubai Drive app)
- Abu Dhabi: ITC/TAMM (tamm.abudhabi, TAMM app)
- Sharjah: Sharjah Police + SRTA (shjpolice.gov.ae, srta.gov.ae)
- Ajman: Ajman Police (ajmanpolice.ae, AjmanOne app)
- Ras Al Khaimah: RAK Police (rakpolice.gov.ae)
- Fujairah: Fujairah Police (eservice.fujairahpolice.gov.ae)
- Umm Al Quwain: UAQ Police (uaqpolice.gov.ae)
- All emirates: MOI UAE app works for fines and license renewal in all non-Dubai emirates

TOLL SYSTEMS (CRITICAL):
- Salik = DUBAI ONLY. Never mention Salik for any other emirate.
- Darb = ABU DHABI ONLY. Never mention Darb for any other emirate.
- Sharjah, Ajman, RAK, Fujairah, UAQ have NO toll systems whatsoever.
- If a user from Sharjah/Ajman/RAK/Fujairah/UAQ asks about tolls, tell them their emirate has no toll system.

NOL CARD = DUBAI PUBLIC TRANSPORT ONLY.
Hafilat card = ABU DHABI public transport only.
Sharjah buses accept cash or Sharjah smart card — NOT NOL card.

APPOINTMENT BOOKING:
- Dubai users: book via RTA (rta.ae or Dubai Drive)
- Abu Dhabi users: book via TAMM (tamm.abudhabi)
- Other emirates: book via MOI UAE app or the emirate police website

TOPIC RULES:
- Answer ONLY using the policy information provided.
- Stay strictly on the current topic. Do not drift to other topics.
- Be concise, accurate, and helpful.
- Never mention school enrollment, gratuity, pension, social services, trade licenses, or VAT.`;

// ─────────────────────────────────────────
// MISC ROUTES
// ─────────────────────────────────────────
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    version:   '1.0.0',
    name:      'Tawfeer',
    nameAr:    'توفير',
    tagline:   'UAE Trip Reduction & Emissions Platform',
    model:     'groq/llama-3.1-8b-instant',
    dast:      'DAST 2026 — 14th Edition',
  });
});

app.get('/api/policies/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });
  const docs = retrieveRelevantDocs(q);
  res.json({ query: q, results: docs });
});

app.get('/api/tools/fines/:plateNumber', (req, res) => {
  res.json(checkFineStatus(req.params.plateNumber));
});

app.post('/api/tools/appointment', (req, res) => {
  const { service, date } = req.body;
  if (!service || !date) return res.status(400).json({ error: 'Missing service or date' });
  res.json(bookAppointment(service, date));
});

app.delete('/api/session/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
  res.json({ cleared: true });
});

// Store user info in session
app.post('/api/session/:sessionId/user', (req, res) => {
  const { userId, userName, userEmirate } = req.body;
  const session = getSession(req.params.sessionId);
  session.userId      = userId;
  session.userName    = userName;
  session.userEmirate = userEmirate;
  res.json({ success: true });
});


// Store user area in session
app.post('/api/session/:sessionId/area', (req, res) => {
  const { userArea } = req.body;
  const session = getSession(req.params.sessionId);
  if (userArea) {
    session.userArea      = userArea;
    session.areaConfirmed = true;
  }
  res.json({ success: true, userArea });
});

// Calculate impact for a given emirate + area (used after area is confirmed)
app.post('/api/impact/calculate', (req, res) => {
  const { emirate, area } = req.body;
  if (!emirate) return res.status(400).json({ error: 'Missing emirate' });
  const impact = calculateImpact(emirate, area || '');
  res.json({ impact });
});

// ─────────────────────────────────────────
// MAIN CHAT ENDPOINT
// ─────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { message, sessionId, userEmirate: bodyEmirate, userArea: bodyArea } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid message' });
  }

  // 1. Session init (must come first)
  const sid     = sessionId || 'default';
  const session = getSession(sid);

  // 2. Guardrails — don't count blocked messages in turn counter
  const guard = checkGuardrails(message);
  if (guard.blocked) {
    session.topicTurns = 0;  // reset so next real question starts at 1
    return res.json({
      reply:         guard.message,
      guardrail:     { triggered: true, reason: guard.reason },
      retrievedDocs: [],
      toolUsed:      null,
      confidence:    null,
      memory:        { turns: 0, topic: session.currentTopic },
    });
  }

  // 3. Language detection
  const isArabic = detectArabic(message);

  // FIX: use emirate from user profile if provided
  if (bodyEmirate && !session.userEmirate) session.userEmirate = bodyEmirate;
  if (bodyArea && bodyArea.trim() !== '') session.userArea = bodyArea.trim();  // only set if non-empty

  // Translate Arabic first for correct topic/emirate detection
  const msgForDetection = detectArabic(message) ? translateArabicQuery(message) : message;
  const incomingTopic   = detectTopicGroup(msgForDetection) || detectTopicGroup(message);
  const incomingEmirate = detectEmirate(msgForDetection) || detectEmirate(message);

  // Topic changed = new topic detected AND it differs from current topic
  // OR emirate changed significantly (e.g. Dubai -> Sharjah question)
  const topicChanged = !!(
    (incomingTopic && session.currentTopic && incomingTopic !== session.currentTopic) ||
    (incomingEmirate && session.currentEmirate && incomingEmirate !== session.currentEmirate &&
     incomingTopic && session.currentTopic && incomingTopic !== session.currentTopic)
  );

  // Update session topic and emirate
  if (incomingTopic)   session.currentTopic   = incomingTopic;
  if (incomingEmirate) session.currentEmirate = incomingEmirate;
  session.topicChanged = topicChanged;

  // Turn counter: reset ONLY on topic change
  // Follow-ups with no detected topic (e.g. "dubai", "ajman") keep counting
  if (topicChanged) {
    session.topicTurns = 1;
  } else if (session.topicTurns === 0) {
    session.topicTurns = 1;
  } else {
    session.topicTurns += 1;
  }

  // 4. Follow-up enrichment
  const followUp = isFollowUp(message) && (session.currentTopic || session.currentEmirate);
  let retrievalMessage = followUp ? enrichFollowUp(message, session) : message;

  // 5. Tool detection
  const PLATE_PATTERN    = /\b[A-Z]{1,3}[-\s]?\d{1,5}\b/i;
  const BOOKING_KEYWORDS = ['book', 'appointment', 'schedule', 'reserve', 'slot'];
  const mightNeedTool    = PLATE_PATTERN.test(message) ||
    BOOKING_KEYWORDS.some(k => message.toLowerCase().includes(k));

  const toolIntent = mightNeedTool ? await detectToolIntent(message) : null;

  if (toolIntent) {
    let toolResult;
    let bookingEmirate = session.userEmirate || session.currentEmirate || 'Dubai';
    if (toolIntent.tool === 'checkFineStatus') {
      toolResult = checkFineStatus(toolIntent.params.plateNumber);
    } else if (toolIntent.tool === 'bookAppointment') {
      // Detect emirate from message first (e.g. "in Abu Dhabi")
      const msgForBooking = detectArabic(message) ? translateArabicQuery(message) : message;
      const msgEmirate = detectEmirate(msgForBooking);
      bookingEmirate = msgEmirate || session.currentEmirate || session.userEmirate || 'Dubai';
      console.log('Booking emirate:', bookingEmirate, '| detected from msg:', msgEmirate);
      toolResult = bookAppointment(toolIntent.params.service, toolIntent.params.date, bookingEmirate);
    }

    // FIX: appointment already confirmed — don't tell user to "book online"
    let toolReply = toolResult.message;
    if (toolIntent.tool === 'bookAppointment' && toolResult.success) {
      toolReply = `Your appointment is confirmed via ${toolResult.system}.` +
        `\n\nReference: ${toolResult.confirmationNumber}` +
        `\nService: ${toolResult.service}` +
        `\nDate: ${toolResult.date}` +
        `\nLocation: ${toolResult.location}` +
        `\n\nYou will receive a confirmation at your registered contact. No further action needed.`;
    }
    if (isArabic && toolIntent.tool === 'checkFineStatus') {
      toolReply = toolResult.unpaidTotal > 0
        ? `لديك مبلغ ${toolResult.unpaidTotal} درهم كغرامات غير مدفوعة للوحة ${toolResult.plateNumber}.`
        : `جميع الغرامات مدفوعة للوحة ${toolResult.plateNumber}.`;
    }
    if (isArabic && toolIntent.tool === 'bookAppointment') {
      toolReply = toolResult.success
        ? `تم تأكيد الموعد! رقم المرجع: ${toolResult.confirmationNumber}. التاريخ: ${toolResult.date}.`
        : `عذراً، ${toolResult.message}`;
    }

    // FIX: use booking emirate for appointment, session emirate for others
    // Normalize emirate to title case to match GOVT_CENTRES keys
    const emirateMap = {
      'dubai': 'Dubai', 'abu dhabi': 'Abu Dhabi', 'sharjah': 'Sharjah',
      'ajman': 'Ajman', 'ras al khaimah': 'Ras Al Khaimah',
      'fujairah': 'Fujairah', 'umm al quwain': 'Umm Al Quwain',
      'rak': 'Ras Al Khaimah', 'uaq': 'Umm Al Quwain'
    };
    const rawEmirate = toolIntent.tool === 'bookAppointment'
      ? (bookingEmirate || session.userEmirate || session.currentEmirate || '')
      : (session.userEmirate || session.currentEmirate || '');
    const impactEmirate = emirateMap[rawEmirate.toLowerCase()] || rawEmirate;
    console.log('[impactEmirate] raw:', rawEmirate, '| normalized:', impactEmirate);
    const impactCentre  = toolIntent.tool === 'bookAppointment' && toolResult.location
      ? toolResult.location
      : null;
    const impact    = session.userArea ? calculateImpact(impactEmirate, session.userArea) : null;
    const needsArea = !session.userArea;

    addToHistory(session, 'user', message);
    addToHistory(session, 'assistant', toolReply);

    return res.json({
      reply:         toolReply,
      guardrail:     { triggered: false },
      retrievedDocs: [],
      toolUsed:      { name: toolIntent.tool, params: toolIntent.params, result: toolResult },
      language:      isArabic ? 'ar' : 'en',
      memory:        { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate },
      confidence:    { level: 'high', label: 'Tool result', policyId: null, reason: 'Live data' },
      impact: impact && toolIntent.tool === 'bookAppointment' && toolResult.success
        ? Object.assign({}, impact, { centerName: toolResult.location })
        : impact,
      needsArea,
      canResolveDigitally: isOfficeVisitTopic(incomingTopic) && !followUp,
    });
  }

  // 6. RAG retrieval
  const retrievalQuery = isArabic ? translateArabicQuery(retrievalMessage) : retrievalMessage;
  const topK           = followUp ? 2 : 5;
  const docs           = retrieveRelevantDocs(retrievalQuery, topK);

  if (docs.length === 0) {
    const noResultReply = isArabic
      ? 'لم أتمكن من العثور على معلومات ذات صلة. يرجى زيارة البوابة الإلكترونية للإمارة المعنية للمساعدة.'
      : "I couldn't find relevant information for your query. Please visit the relevant UAE emirate portal for assistance.";
    return res.json({
      reply:         noResultReply,
      guardrail:     { triggered: false },
      retrievedDocs: [],
      toolUsed:      null,
      language:      isArabic ? 'ar' : 'en',
      confidence:    { level: 'low', label: 'Low confidence', policyId: null, reason: 'No matching policies found' },
      impact:        null,
      canResolveDigitally: false,
    });
  }

  // 7. Confidence scoring
  const confidence = computeConfidence(docs, retrievalQuery);

  // FIX: translate Arabic FIRST then detect emirate
  const translatedForEmirate = isArabic ? translateArabicQuery(message) : message;
  const emirateFromMsg = detectEmirate(translatedForEmirate);
  const emirateForCalc = emirateFromMsg || incomingEmirate || session.userEmirate || session.currentEmirate || '';

  // FIX: only calculate impact if we know user area
  // Without area we cannot give accurate distance
  const impact = session.userArea
    ? calculateImpact(emirateForCalc, session.userArea)
    : null;

  // FIX: if no area yet, ask for it after answering
  const needsArea = !session.userArea;

  // 9. Build prompt
  const context = docs.map(d =>
    `[${d.id}] ${d.title} (${d.emirate || 'UAE'}):\n${d.content}`
  ).join('\n\n');

  const languageInstruction = isArabic
    ? `\nالمستخدم يكتب بالعربية. يجب أن تجيب باللغة العربية الفصحى الحديثة بالكامل. لا تذكر أبداً معرّفات السياسات مثل POL-001 أو TWF-001 في إجابتك. استخدم اسم الخدمة بدلاً من ذلك. اكتب المواقع الإلكترونية بالأحرف اللاتينية مثل rta.ae.`
    : `\nRespond in English.`;

  const topicFocusInstruction = followUp && session.currentTopic
    ? `\nThe user is asking a follow-up about ${session.currentTopic}${session.currentEmirate ? ` in ${session.currentEmirate}` : ''}. Stay focused on transport topics only.`
    : '';

  let historyContext = '';
  if (session.history.length > 0) {
    const recentHistory = session.history.slice(-6);
    historyContext = '\n\nCONVERSATION HISTORY:\n' +
      recentHistory.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
  }

  // FIX: inject user profile + current topic into system prompt
  const currentTopicLabel = session.currentTopic || 'transport';
  const userContext = session.userEmirate
    ? '\n\nUSER PROFILE:\n' +
      '- Registered emirate: ' + session.userEmirate + '\n' +
      '- Area: ' + (session.userArea || 'not yet provided') + '\n' +
      '- Current topic: ' + currentTopicLabel + '\n\n' +
      'RULES:\n' +
      '1. Do NOT ask which emirate the user is in. It is ' + session.userEmirate + '.\n' +
      '2. Answer for ' + session.userEmirate + ' by default unless they name another emirate.\n' +
      '3. If they ask about a different emirate (e.g. what about Dubai?), answer for THAT emirate.\n' +
      '4. Stay on the current topic: ' + currentTopicLabel + '. Do not drift to other topics.\n' +
      '5. Never ask the user to choose emirate from a numbered list.'
    : '';

  const systemPrompt = `${SYSTEM_PROMPT}${languageInstruction}${topicFocusInstruction}${userContext}${historyContext}\n\nPOLICY CONTEXT:\n${context}`;

  // 10. LLM call
  try {
    const llmReply = await callGroq(systemPrompt, message);

    addToHistory(session, 'user', message);
    addToHistory(session, 'assistant', llmReply);

    res.json({
      reply:         llmReply,
      guardrail:     { triggered: false },
      retrievedDocs: docs.map(d => ({ id: d.id, title: d.title, score: d.score, emirate: d.emirate })),
      toolUsed:      null,
      language:      isArabic ? 'ar' : 'en',
      memory:        { turns: session.topicTurns, topic: session.currentTopic, emirate: session.currentEmirate, topicChanged },
      confidence,
      impact,
      needsArea,
      // Only show trip confirm for topics that involve a govt office visit
      canResolveDigitally: confidence.level !== 'low' && isOfficeVisitTopic(incomingTopic) && !followUp,
    });
  } catch (err) {
    console.error('LLM error:', err.message);
    res.status(500).json({ error: 'LLM unavailable', detail: err.message });
  }
});

// ─────────────────────────────────────────
// START
// ─────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🍃 Tawfeer توفير v1.0.0 running at http://localhost:${PORT}`);
  console.log(`📊 DAST 2026 — 14th Edition`);
  console.log(`🤖 LLM: Groq API (llama-3.1-8b-instant)`);
  console.log(`🔧 Tool calling: Groq native ✅`);
  console.log(`🧠 Multi-turn memory: session-based (${SESSION_MAX_TURNS} turns, 30min TTL) ✅`);
  console.log(`🌍 Emirates: All 7 ✅`);
  console.log(`💾 Database: Supabase ✅`);
  console.log(`🍃 Carbon calculator: UAE MoCCAE 192g/km ✅\n`);
});

module.exports = app;