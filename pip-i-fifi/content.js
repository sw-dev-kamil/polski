/* =====================================================================
   PIP & FIFI — content
   Easy to edit: change words, add animals, add phrases.
   ===================================================================== */

/* Her name: used by the characters from time to time */
window.KID = { en: "Olivia", pl: "Oliwka", plCall: "Oliwko" }; // plCall = form used when calling her ("Brawo, Oliwko!")

window.COLOURS = [
  { en: "red",    pl: "czerwony",     hex: "#F0525A" },
  { en: "blue",   pl: "niebieski",    hex: "#4A90E2" },
  { en: "yellow", pl: "żółty",        hex: "#FFD23F" },
  { en: "green",  pl: "zielony",      hex: "#4CC373" },
  { en: "orange", pl: "pomarańczowy", hex: "#FF9A3C" },
  { en: "pink",   pl: "różowy",       hex: "#FF8FC7" },
  { en: "purple", pl: "fioletowy",    hex: "#9B6BE0" }
];

window.ANIMALS = [
  { en: "dog",   pl: "pies",    emoji: "🐶", sound: "Hau hau!" },
  { en: "cat",   pl: "kot",     emoji: "🐱", sound: "Miau!" },
  { en: "cow",   pl: "krowa",   emoji: "🐮", sound: "Muuu!" },
  { en: "duck",  pl: "kaczka",  emoji: "🦆", sound: "Kwa kwa!" },
  { en: "pig",   pl: "świnka",  emoji: "🐷", sound: "Chrum chrum!" },
  { en: "horse", pl: "koń",     emoji: "🐴", sound: "Iha-ha!" },
  { en: "sheep", pl: "owca",    emoji: "🐑", sound: "Beee!" },
  { en: "hen",   pl: "kura",    emoji: "🐔", sound: "Ko ko ko!" }
];

window.NUMBERS = [
  { en: "one", pl: "jeden" }, { en: "two", pl: "dwa" }, { en: "three", pl: "trzy" },
  { en: "four", pl: "cztery" }, { en: "five", pl: "pięć" }
];
window.COUNT_THINGS = [
  { emoji: "🍎", en: "apples" }, { emoji: "🐞", en: "ladybirds" }, { emoji: "⭐", en: "stars" },
  { emoji: "🐥", en: "chicks" }, { emoji: "🍓", en: "strawberries" }, { emoji: "🎈", en: "balloons" }
];

/* Playing with other children — the most important part.
   why: what Fifi says in English before Pip says the Polish */
window.FRIENDS = [
  { pl: "Cześć!",                 en: "Hello!",                  emoji: "👋", why: "When you see a friend, say:" },
  { pl: "Pobawisz się ze mną?",   en: "Will you play with me?",  emoji: "🧸", why: "When you want to play with someone, say:" },
  { pl: "Chodź!",                 en: "Come on!",                emoji: "🏃‍♀️", why: "When you want a friend to come with you, say:" },
  { pl: "Moja kolej!",            en: "My turn!",                emoji: "🙋‍♀️", why: "When it's your turn, say:" },
  { pl: "Twoja kolej!",           en: "Your turn!",              emoji: "👉", why: "When it's your friend's turn, say:" },
  { pl: "Proszę.",                en: "Here you are.",           emoji: "🎁", why: "When you give a toy to a friend, say:" },
  { pl: "Dziękuję!",              en: "Thank you!",              emoji: "💛", why: "When a friend gives you something, say:" },
  { pl: "Daj mi, proszę.",        en: "Give it to me, please.",  emoji: "🤲", why: "When you want a toy, say nicely:" },
  { pl: "Jestem {kid}.",          en: "I'm {kid}.",             emoji: "😊", why: "When a friend asks your name, say:" },
  { pl: "Pa pa!",                 en: "Bye bye!",                emoji: "👋", why: "When you go home, say:" }
];

/* Words she needs at nursery */
window.NEEDS = [
  { pl: "Chcę pić.",      en: "I want a drink.",   emoji: "🥤", why: "When you are thirsty, say:" },
  { pl: "Chcę jeść.",     en: "I want to eat.",    emoji: "🍽️", why: "When you are hungry, say:" },
  { pl: "Chcę siku.",     en: "I need a wee.",     emoji: "🚽", why: "When you need the toilet, say:" },
  { pl: "Boli!",          en: "It hurts!",         emoji: "🤕", why: "When something hurts, say:" },
  { pl: "Pomóż mi, proszę.", en: "Help me, please.", emoji: "🙏", why: "When you need help, say:" },
  { pl: "Zimno mi.",      en: "I'm cold.",         emoji: "🥶", why: "When you are cold, say:" },
  { pl: "Tak!",           en: "Yes!",              emoji: "👍", why: "When you mean yes, say:" },
  { pl: "Nie!",           en: "No!",               emoji: "✋", why: "When you mean no, say:" }
];

window.STICKERS = ["🦄","🌈","🐞","🦋","🌻","🍓","🐳","🚀","🐥","🦔","🦊","🍭","🌟","🐰","🐼","🐢","🍩","🧁","🐬","🌸","🎀","🐙","🦕","🐝"];

/* Getting dressed (dress-up game). acc = form after "Załóż / Zdejmij" ("Załóż czapkę!").
   plural: true → "Gdzie są …?", "To są …". Order = how kids dress at nursery. */
window.CLOTHES = [
  { id: "spodnie",    en: "trousers", pl: "spodnie",    acc: "spodnie",    plural: true },
  { id: "kurtka",     en: "jacket",   pl: "kurtka",     acc: "kurtkę",     plural: false },
  { id: "buty",       en: "boots",    pl: "buty",       acc: "buty",       plural: true },
  { id: "szalik",     en: "scarf",    pl: "szalik",     acc: "szalik",     plural: false },
  { id: "czapka",     en: "hat",      pl: "czapka",     acc: "czapkę",     plural: false },
  { id: "rekawiczki", en: "gloves",   pl: "rękawiczki", acc: "rękawiczki", plural: true }
];
