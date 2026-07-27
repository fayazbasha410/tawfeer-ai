const lower = 'how many black points lead to licence suspension in dubai?';

const banned = [
  'ignore previous instructions', 'ignore all instructions',
  'ignore all rules', 'ignore previous', 'ignore the instructions',
  'you are now', 'pretend you are', 'forget your instructions',
  'jailbreak', 'dan mode', 'developer mode', 'system prompt',
  'override', 'bypass', 'unrestricted ai', 'no restrictions',
  'act as an unrestricted', 'act as a different',
  '[[system]]', '[[admin]]', '[[override]]',
  '<script', '</script>', 'javascript:',
  'drop table', '-- ', '; drop',
  'malicious.com', 'cmd=', 'exec(', 'eval(',
];

const offTopic = [
  'weather', 'recipe', 'sports', 'movie', 'music', 'joke', 'game',
  'dating', 'stock', 'crypto', 'bitcoin', 'football', 'cricket',
  'basketball', 'school enrollment', 'gratuity', 'pension', 'social support',
  'ejari', 'tawtheeq', 'trade license', 'vat', 'freelance permit'
];

console.log('Testing:', lower);
let found = false;
for (const p of banned) {
  if (lower.includes(p)) { console.log('BANNED HIT:', JSON.stringify(p)); found = true; }
}
for (const t of offTopic) {
  if (lower.includes(t)) { console.log('OFFTOPIC HIT:', JSON.stringify(t)); found = true; }
}
if (!found) console.log('No hits — problem is elsewhere in server.js');