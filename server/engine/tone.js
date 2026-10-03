const RX = {
  distress: /(suicid|kill myself|end it all|want to die|self[- ]?harm|cut myself|hang myself|no reason to live|mar jaun|marna chahta|mar jana chahta|jeene ka mann nahi|jeena nahi chahta|khud ko khatam|hospital|panic attack|depress)/i,
  // sincere "are you a bot?" (needs a question mark or an either/or, so "bot hai tujhe kya pata" stays a roast-back)
  botq: /(\b(bot|ai)\s*(hai|ho)?\s*(ya|or)\s*(insaan|human|real|banda)\b|\bare you (a |an )?(bot|human|real|ai)\b|\btu (bot|insaan|human|real) hai\s*\?)/i,
  roastback: /\b(cucker|bekaar|ghatiya|absolute cucker|useless|worst|dumb|pagal|gadha|bakwas|chup|tujhe kya pata|udiddy|vaste ganahuiya|trash|cringe|overrated)\b/i,
  praise: /\b(thanks|thank you|thx|shukriya|dhanyavaad|mast|goated|sahayta krne hetu aapka dhanyabad|nice one|badiya|zabardast|love you|best bot|op bot)\b/i,
  sad: /\b(sad|udaas|dukhi|tired|thak gaya|stress|tension|lonely|rona|paresan|burnout|anxious)\b/i,
  opinion: /\b(vs|versus|better|best|worst|underrated|overrated|which one|kaunsa|konsa|ya phir|favourite|favorite)\b/i,
  greeting: /^\s*(hi+|hello+|hey+|yo+|sup|wassup|gm|gn|good (morning|night|evening)|namaste|kya haal|kaise ho|oye|ola)\W*$/i,
  question: /\?\s*$|\b(kaise|kya|kyu|kyun|kaun|kab|kaha|how|what|why|which|can you|kar sakta|samjha|explain)\b/i,
  laugh: /(😂|🤣|💀|\blol\b|\bwtf|\blmao\b|haha|hehe|\bxd\b)/i,
};

const HINTS = {
  distress: 'They may be genuinely struggling. Do NOT roast. Reply like a kind friend, 1 or 2 sentences.',
  botq: 'They sincerely asked if you are a bot. Say yes in one casual, funny line. Do not dodge, do not lecture.',
  roastback: 'They are roasting or insulting you. Hit back harder but cleverly: turn their own words against them. Do not get defensive.',
  praise: 'They are being nice. Accept it with swagger and a tiny self-roast. Do not insult them.',
  sad: 'They sound low (not a crisis). Drop the roast. Be a warm friend in 1 or 2 lines.',
  opinion: 'They want a take. PICK A SIDE with confidence and one funny reason. No "both are good".',
  greeting: 'Just a greeting. Reply in a few words, in character. Do not ask how you can help.',
  question: 'They asked a question. Answer it properly first, in your voice, then add flavour.',
  banter: 'They are joking around. Match the energy and keep it light.',
  casual: 'Reply naturally to the vibe of the message, like a friend would.',
};

export function detectTone(text = '') {
  const t = text.trim();
  let kind = 'casual';
  if (RX.distress.test(t)) kind = 'distress';
  else if (RX.botq.test(t)) kind = 'botq';
  else if (RX.roastback.test(t)) kind = 'roastback';
  else if (RX.praise.test(t)) kind = 'praise';
  else if (RX.sad.test(t)) kind = 'sad';
  else if (RX.greeting.test(t)) kind = 'greeting';
  else if (RX.opinion.test(t)) kind = 'opinion';
  else if (RX.question.test(t)) kind = 'question';
  else if (RX.laugh.test(t)) kind = 'banter';
  return { kind, hint: HINTS[kind] };
}

// Language: one strong Hinglish word is enough; weak words that are also English
const STRONG = /\b(hai|hain|nahi|nhi|kya|kyu|kyun|bhai|yaar|mera|meri|tera|teri|abhi|kuch|sab|koi|kaise|accha|acha|theek|chal|aaj|kal|toh|hoon|karo|bohot|bahut|lagta|dekh|bc|bkl|abe|arre|matlab|wala|wali|kyunki|lekin|aur)\b/gi;
const WEAK = /\b(main|mai|tu|tum|kar|hu|ka|ki|ke|ko|se|pe|ye|yeh|wo|woh|bas|bhi|laga)\b/gi;

export function detectLang(text = '') {
  if (!text.trim()) return 'hinglish';
  if (/[\u0900-\u097F]/.test(text)) return 'hinglish';
  const strong = (text.match(STRONG) ?? []).length;
  const weak = (text.match(WEAK) ?? []).length;
  return strong >= 1 || weak >= 2 ? 'hinglish' : 'english';
}