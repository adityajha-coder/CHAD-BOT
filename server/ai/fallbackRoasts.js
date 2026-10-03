const BANK = {
  1: [
    'bro tu mid nahi hai, bas thoda "kal se" type banda hai',
    'tu wo friend hai jo "on my way" bolke abhi uthta hai, {name}',
    'ngl vibes theek hain {name}, bas confidence ka wifi thoda weak hai',
    'main character hai tu, bas script kisi ne padhi nahi',
    '{name} ka enthusiasm 10/10, execution abhi loading',
    'wo banda jo 5 min type karke sirf "hmm" bhejta hai, {name} yahi hai 😭',
    'tera "bas 5 min" mere liye ek alag time zone hai {name}',
    'plan banana tera passion hai, plan pe aana tera hobby nahi',
    'tu bura nahi hai {name}, bas thoda "kal se padhunga" wala hai',
    'ok {name} you ate, bas plate ka half salad tha',
    'teri baatein logic-free hain, bilkul tere plans ki tarah',
    'seen karke gayab hone ka brand ambassador hai tu',
    'deadline tujhe remind karte karte thak gayi hai {name}',
    'mast banda hai {name}, bas alarm se dushmani chal rahi hai',
  ],
  2: [
    '"5 min me aaya" bolke 3 ghante gayab, nalla hai tu {name}',
    'tera track record aisa hai ki log expectations basement me rakhte hain',
    'confidence dekho {name} ka, aur result dekho. dono alag duniya ke hain',
    '{name} ka plan: step 1 confidence, step 2 bolna, step 3 wifi ko blame',
    'tu group me bas "lol" aur "kya hua" ka contract leke baitha hai',
    'tera "almost done" matlab abhi uthke chai bana raha hai',
    'skill issue {name}, sorry par true hai',
    'main character banta hai par dialogue npc wale hain',
    'procrastination ko full-time job bana liya hai {name} ne, salary bhi nahi',
    'nalla hona koi crime nahi {name}, bas tu professional ban gaya',
    'teri "last time" wali kasam ka toh court me case banta hai',
    'itna slow hai ki loading wheel tujhse tips leti hai',
    'lazy nahi hai tu {name}, bas permanently power saving mode pe hai',
    'pagal hai tu, par organised pagal. lists banata hai, karta kuch nahi',
    'ullu hai tu {name}, aur wo bhi night shift wala',
  ],
  3: [
    'tu wo banda hai jo "bas ek episode" bolke poora season nipta deta hai',
    'saale {name} har baar "last time" bolta hai aur phir wahi galti, loop me phas gaya hai kya',
    'L take, L excuse, L life update. consistent hai {name}',
    'damn {name}, confidence 100x aur dimaag 0.1x, ratio hi galat hai',
    'touch grass {name}, tera phone bhi bol raha hai reham kar',
    'kamina hai tu, par lazy kamina. wo sabse bekaar category hai',
    'bakchodi me bhi half-hearted hai tu {name}, commitment issues',
    'WTF {name}, jitna time tune waste kiya, utna fixed deposit hota toh ameer hota',
    'aura negative, battery low, tu sach me power saving mode pe jee raha hai',
    'saala tu itna cringe hai ki autocomplete bhi sharma jata hai',
    'tu wo hai jiska "aaj pakka karunga" ek meme ban chuka hai',
    'tu gym ki membership jaisa hai {name}, paise jaate hain, tu nahi aata',
    'WTF {name}, itna drama toh daily soap me bhi nahi hota',
    'sach bolu {name}? tu entertaining hai, bas galat wajah se',
  ],
  4: [
    'bc {name}, tu galti nahi karta, poora blunder hai',
    'teri aukat itni hai ki loading screen bhi tujhe skip kar deta hai',
    'bkl tera logic, bolta rehta hai aur samajh kisi ko nahi aata',
    'itna bakwas banda hai {name} ki bakwas bhi apna naam badalne ka soch rahi hai',
    'saale tu har baar "last time" bolta hai, last time ka bhi last time ho gaya',
    'bc confidence dekh tera, jaise kabhi kisi ne tujhe "nahi" bola hi nahi',
    'chutiyapa tera full-time kaam hai {name}, overtime bhi free me karta hai',
    'touch grass bol raha tha, par tere liye grass bhi bhaag jayegi',
    'rizz null, confidence 100, bc ye combination illegal hona chahiye',
    'tujhe snail bhi overtake karke bolti hogi "bhai thoda tez"',
    'bkl tu nalla nahi, nalla ka CEO hai',
    'group me tu isliye hai taaki baaki log khud ko achha feel kar sakein, thanks {name}',
    'tera pura personality ek loading bar hai bc, 99% pe atka hua',
    'chutiye, tu fell off nahi hua, tu kabhi on tha hi nahi',
  ],
  5: [
    'bc {name}, tujhse baat karke dimaag ki dahi ho gayi',
    'bkl {name}, tera aura itna negative hai ki tere paas aate hi wifi disconnect ho jata hai',
    'abe saale {name}, tu itna bekaar hai ki bekaari ne bhi tujhse resign maar diya',
    'chutiya level confidence hai {name}, aur result? zero. bilkul zero',
    'saale tu wo hai jiski "last time" ki kasam pe pura server hans chuka hai',
    'bc {name}, tu cringe me PhD kar chuka hai, ab post-doc chal raha hai',
    'abe {name}, pura server tera naam sunke ek saath sigh karta hai',
    'rizz ne tera number block kar diya hai bc',
    'saale {name}, itna bakchod hai ki bakchodi ke liye alag se award banana padega',
    'abe chutiye, tu galti nahi, galti ki factory hai bc',
    'bkl {name} cooked nahi, jal ke raakh ho gaya hai. ab sirf dhuan bacha hai 💀',
    'saale tu har jagah gyaan baantta hai jaise duniya ka thekedaar yahi hai',
    'tere dimaag me jo chal raha hai usko "thought" bolna thought ki beizzati hai {name}',
    'abe {name} tu itna nalla hai ki nalle bhi tujhse career advice lete hain',
    'bc itna drama? daily soap wale bhi tujhse royalty maangenge',
  ],
};

const GENERIC = {
  verdict: [
    'itna lamba padhne ka mood nahi, par dono bakchodi hi kar rahe the. VERDICT: dono L ⚖️',
    'dono ki baat sunke meri chai thandi ho gayi. VERDICT: draw, jao so jao ☕',
    'jury ghar chali gayi, kal aana. VERDICT: case pending, tab tak dono hare',
    'sach bolu? dono ke points mid the. VERDICT: dono touch grass',
    'mai neutral hu, matlab mujhe farak hi nahi padta. VERDICT: jo bhi jeete, mujhe kya',
    'popcorn khatam ho gaya par jeet kisi ki nahi hui. VERDICT: dono barabar ke ullu',
    'itni energy se ladne ki jagah assignment kar lete. VERDICT: dono L, assignment 1-0',
    'dono ne dimaag lagaya, bas lagana galat jagah tha. VERDICT: split decision, ghar jao ⚖️',
  ],
  reply: [
    'ruk bhai, khana kha raha hu, 2 min',
    'abhi mummy ne bula liya, baad me bolta hu',
    'net ne dhoka de diya yaar, ruk',
    'charger dhundh raha hu, 2% pe hu bhai',
    'ek second, chai pi ke aata hu ☕',
    'neend aa rhi hai bhai, kal puchna',
    'chain se sone to de',
    'abhi mood nahi hai, thodi der baad bol',
    'aaj meri chutti hai, kal aana',
    'tera msg dekha, jaan bujh ke ignore kiya 😌',
    'seen kar diya hai, reply ka paisa nahi mil raha',
    'abhi busy hu bhai, 2 min me aata hu 😎',
    'ruk, pehle ye reel khatam kar lu',
    'bot hu bhai par bot ko bhi chutti chahiye, baad me aa',
    'dimaag chhutti pe hai, thodi der baad pooch',
  ],
};

const bags = new Map();
function pickNoRepeat(key, list) {
  let bag = bags.get(key);
  if (!bag || bag.length === 0) {
    bag = [...list].sort(() => Math.random() - 0.5);
    const last = bags.get(`${key}:last`);
    if (bag.length > 1 && bag[bag.length - 1] === last) bag.unshift(bag.pop());
    bags.set(key, bag);
  }
  const line = bag.pop();
  bags.set(`${key}:last`, line);
  return line;
}

export function fallbackFor(mode, spice, name) {
  const lvl = BANK[spice] ? spice : 3;
  const list = mode === 'roast' ? BANK[lvl] : GENERIC[mode] ?? GENERIC.reply;
  const key = mode === 'roast' ? `roast:${lvl}` : mode;
  return pickNoRepeat(key, list).replaceAll('{name}', name ?? 'bhai');
}