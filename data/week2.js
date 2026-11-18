/* =====================================================================
   WEEK 2 — "Cu Mama": chatting with Kamil's mum
   She calls her "Mamo" and uses the informal "ty" forms (Mamo, co gotujesz?).
   Same structure as data/lessons.js. Day 8 opens after Day 2.
   ===================================================================== */

window.WEEKS = [
  { week: 1, title: "Primii pași", subtitle: "Salutări, numere, magazin, familie" },
  { week: 2, title: "Cu Mama", subtitle: "Bucătărie, grădină și povești cu mama lui Kamil" }
];

window.LESSONS.push(

  /* ----------------------------------------------------------------- */
  {
    day: 8, week: 2, after: 2,
    title: "Bună, Mamo!",
    subtitle: "Salutări și cafea cu mama lui Kamil",
    emoji: "☕",
    color: "#C2410C",
    words: [
      { id: "d8w1", pl: "Cześć, Mamo!", ro: "Bună, mamă!", say: "ceșci, mamo", emoji: "👋" },
      { id: "d8w2", pl: "Co słychać?", ro: "Ce mai e nou?", say: "țo suîhaci?", emoji: "💬" },
      { id: "d8w3", pl: "Wszystko dobrze", ro: "Totul e bine", say: "fșîstko dobje", emoji: "👍" },
      { id: "d8w4", pl: "A u ciebie?", ro: "Și la tine?", say: "a u ciebie?", emoji: "🔁" },
      { id: "d8w5", pl: "Jak się czujesz?", ro: "Cum te simți?", say: "iak șe ciuieș?", emoji: "🙂" },
      { id: "d8w6", pl: "Napijesz się kawy?", ro: "Bei o cafea?", say: "napiieș șe kavî?", emoji: "☕" },
      { id: "d8w7", pl: "Chętnie!", ro: "Cu plăcere! / Bucuroasă!", say: "hentnie", emoji: "😊" },
      { id: "d8w8", pl: "Siadaj!", ro: "Stai jos! / Ia loc!", say: "șiadai", emoji: "🪑" },
      { id: "d8w9", pl: "Wejdź!", ro: "Intră!", say: "veici", emoji: "🚪" },
      { id: "d8w10", pl: "kochanie", ro: "draga mea / dragule", say: "kohanie", emoji: "💕" }
    ],
    dialogue: {
      title: "Mama vine în vizită",
      lines: [
        { who: "Mama", pl: "Cześć, kochanie!", ro: "Bună, draga mea!" },
        { who: "Tu", me: true, pl: "Cześć, Mamo! Wejdź!", ro: "Bună, mamă! Intră!" },
        { who: "Mama", pl: "Co słychać?", ro: "Ce mai e nou?" },
        { who: "Tu", me: true, pl: "Wszystko dobrze. A u ciebie?", ro: "Totul e bine. Și la tine?" },
        { who: "Mama", pl: "Też dobrze, dziękuję.", ro: "Tot bine, mulțumesc." },
        { who: "Tu", me: true, pl: "Siadaj! Napijesz się kawy?", ro: "Ia loc! Bei o cafea?" },
        { who: "Mama", pl: "Chętnie!", ro: "Cu plăcere!" }
      ]
    },
    pronounce: ["Cześć, Mamo!", "Co słychać?", "Wszystko dobrze", "A u ciebie?", "Napijesz się kawy?", "Chętnie!"],
    grammar: {
      title: "Când vorbești cu Mama: forma „ty” (tu)",
      html: `
        <p>Cu Mama vorbești ca o fiică, la persoana a II-a: <b>ty</b> (tu). În română verbul se termină de obicei în <b>-i</b> (ai, faci, vrei). În polonă se termină în <b>-sz</b> — un mic „ș” la final!</p>
        <table class="g-table">
          <tr><th>Eu</th><th>Tu</th><th>Română</th></tr>
          <tr><td>mam</td><td><b>masz</b></td><td>am / ai</td></tr>
          <tr><td>robię</td><td><b>robisz</b></td><td>fac / faci</td></tr>
          <tr><td>gotuję</td><td><b>gotujesz</b></td><td>gătesc / gătești</td></tr>
          <tr><td>chcę</td><td><b>chcesz</b></td><td>vreau / vrei</td></tr>
          <tr><td>lubię</td><td><b>lubisz</b></td><td>îmi place / îți place</td></tr>
        </table>
        <p>„Mamo” este forma de chemare (vocativ) a lui „mama” — exact ca în română „mamă!”.</p>
        <p class="g-tip">💡 Ca să pui o întrebare, ridici doar tonul: <b>Masz czas?</b> — Ai timp?</p>`,
      quiz: [
        { q: "„Ce gătești?” = Co ___?", options: ["gotuję", "gotujesz", "gotować"], answer: 1 },
        { q: "„Vrei cafea?” = ___ kawę?", options: ["Chcesz", "Chcę", "Chce"], answer: 0 },
        { q: "Formele cu „ty” se termină de obicei în…", options: ["-m", "-sz", "-my"], answer: 1 }
      ]
    }
  },

  /* ----------------------------------------------------------------- */
  {
    day: 9, week: 2,
    title: "În bucătărie",
    subtitle: "Gătim împreună cu Mama",
    emoji: "🍲",
    color: "#B45309",
    words: [
      { id: "d9w1", pl: "kuchnia", ro: "bucătărie", say: "kuhnia", emoji: "🏠" },
      { id: "d9w2", pl: "gotować", ro: "a găti", say: "gotovaci", emoji: "👩‍🍳" },
      { id: "d9w3", pl: "garnek", ro: "oală", say: "garnek", emoji: "🍲" },
      { id: "d9w4", pl: "nóż", ro: "cuțit", say: "nuș", emoji: "🔪" },
      { id: "d9w5", pl: "cebula", ro: "ceapă", say: "țebula", emoji: "🧅" },
      { id: "d9w6", pl: "ziemniaki", ro: "cartofi", say: "jiemniaki", emoji: "🥔" },
      { id: "d9w7", pl: "marchewka", ro: "morcov", say: "marhefka", emoji: "🥕" },
      { id: "d9w8", pl: "sól", ro: "sare", say: "sul", emoji: "🧂" },
      { id: "d9w9", pl: "Co gotujesz?", ro: "Ce gătești?", say: "țo gotuieș?", emoji: "❓" },
      { id: "d9w10", pl: "Mogę pomóc?", ro: "Pot să ajut?", say: "moghe pomuț?", emoji: "🙋‍♀️" },
      { id: "d9w11", pl: "Co mam zrobić?", ro: "Ce să fac?", say: "țo mam zrobici?", emoji: "🤔" },
      { id: "d9w12", pl: "Ale pięknie pachnie!", ro: "Ce frumos miroase!", say: "ale pienknie pahnie", emoji: "😋" }
    ],
    dialogue: {
      title: "Supa de duminică",
      lines: [
        { who: "Tu", me: true, pl: "Mamo, co gotujesz?", ro: "Mamă, ce gătești?" },
        { who: "Mama", pl: "Rosół.", ro: "Supă de pui (rosół)." },
        { who: "Tu", me: true, pl: "Ale pięknie pachnie! Mogę pomóc?", ro: "Ce frumos miroase! Pot să ajut?" },
        { who: "Mama", pl: "Tak. Pokrój cebulę.", ro: "Da. Taie ceapa." },
        { who: "Tu", me: true, pl: "Dobrze. Gdzie jest nóż?", ro: "Bine. Unde e cuțitul?" },
        { who: "Mama", pl: "W szufladzie.", ro: "În sertar." },
        { who: "Tu", me: true, pl: "Dziękuję!", ro: "Mulțumesc!" }
      ]
    },
    pronounce: ["Co gotujesz?", "Mogę pomóc?", "Co mam zrobić?", "Ale pięknie pachnie!", "ziemniaki", "marchewka"],
    grammar: {
      title: "Ce îți spune Mama: imperativul",
      html: `
        <p>În bucătărie Mama va spune multe <b>„comenzi”</b> scurte — ca în română „taie!”, „dă!”, „ia!”. E important mai ales să le <b>înțelegi</b>:</p>
        <table class="g-table">
          <tr><th>Polonă</th><th>Citește</th><th>Română</th></tr>
          <tr><td><b>Pokrój!</b></td><td><i>pokrui</i></td><td>Taie!</td></tr>
          <tr><td><b>Daj!</b></td><td><i>dai</i></td><td>Dă!</td></tr>
          <tr><td><b>Weź!</b></td><td><i>veș</i></td><td>Ia!</td></tr>
          <tr><td><b>Spróbuj!</b></td><td><i>sprubui</i></td><td>Gustă! / Încearcă!</td></tr>
          <tr><td><b>Zobacz!</b></td><td><i>zobaci</i></td><td>Uite! / Uită-te!</td></tr>
          <tr><td><b>Poczekaj!</b></td><td><i>pocekai</i></td><td>Așteaptă!</td></tr>
          <tr><td><b>Siadaj!</b></td><td><i>șiadai</i></td><td>Stai jos!</td></tr>
        </table>
        <p class="g-tip">💡 Multe se termină în <b>-j</b> (citit „i”): daj, spróbuj, poczekaj — ușor de recunoscut!</p>`,
      quiz: [
        { q: "Mama spune „Spróbuj!”. Ce faci?", options: ["Tai ceva", "Guști mâncarea", "Te așezi"], answer: 1 },
        { q: "Mama spune „Daj mi sól”. Ce îi dai?", options: ["Sare", "Ceapă", "Cuțitul"], answer: 0 },
        { q: "„Uite!” = ?", options: ["Weź!", "Zobacz!", "Pokrój!"], answer: 1 }
      ]
    }
  },

  /* ----------------------------------------------------------------- */
  {
    day: 10, week: 2,
    title: "Mâncăruri poloneze",
    subtitle: "La masă — și sarmale vs. gołąbki",
    emoji: "🥟",
    color: "#A16207",
    words: [
      { id: "d10w1", pl: "pierogi", ro: "colțunași (pierogi)", say: "pieroghi", emoji: "🥟" },
      { id: "d10w2", pl: "rosół", ro: "supă de pui", say: "rosuu", emoji: "🍜" },
      { id: "d10w3", pl: "gołąbki", ro: "un fel de sarmale", say: "gouompki", emoji: "🥬" },
      { id: "d10w4", pl: "schabowy", ro: "șnițel de porc", say: "s-habovî", emoji: "🍖" },
      { id: "d10w5", pl: "żurek", ro: "ciorbă acră (cu borș de făină)", say: "jurek", emoji: "🥣" },
      { id: "d10w6", pl: "bigos", ro: "varză călită cu carne", say: "bigos", emoji: "🍲" },
      { id: "d10w7", pl: "Smacznego!", ro: "Poftă bună!", say: "smacinego", emoji: "🍽️" },
      { id: "d10w8", pl: "Pyszne!", ro: "Delicios!", say: "pîșne", emoji: "😋" },
      { id: "d10w9", pl: "Jak to się robi?", ro: "Cum se face?", say: "iak to șe robi?", emoji: "📝" },
      { id: "d10w10", pl: "W Rumunii robimy sarmale", ro: "În România facem sarmale", say: "v rumunii robimî sarmale", emoji: "🇷🇴" },
      { id: "d10w11", pl: "To prawie to samo!", ro: "E aproape același lucru!", say: "to pravie to samo", emoji: "🤝" },
      { id: "d10w12", pl: "Już się najadłam", ro: "M-am săturat deja", say: "iuș șe naiaduam", emoji: "😌" }
    ],
    dialogue: {
      title: "Prânzul la Mama",
      lines: [
        { who: "Mama", pl: "Smacznego!", ro: "Poftă bună!" },
        { who: "Tu", me: true, pl: "Smacznego! Mmm, pyszne!", ro: "Poftă bună! Mmm, delicios!" },
        { who: "Mama", pl: "To są gołąbki. Weź jeszcze!", ro: "Sunt gołąbki. Mai ia!" },
        { who: "Tu", me: true, pl: "W Rumunii robimy sarmale. To prawie to samo!", ro: "În România facem sarmale. E aproape același lucru!" },
        { who: "Mama", pl: "Naprawdę? Zrobisz mi kiedyś?", ro: "Serios? Îmi faci și mie odată?" },
        { who: "Tu", me: true, pl: "Tak! Dziękuję, ale już się najadłam.", ro: "Da! Mulțumesc, dar m-am săturat deja." }
      ]
    },
    pronounce: ["Smacznego!", "Pyszne!", "gołąbki", "Jak to się robi?", "To prawie to samo!", "Już się najadłam"],
    grammar: null
  },

  /* ----------------------------------------------------------------- */
  {
    day: 11, week: 2,
    title: "Prăjituri și borcane",
    subtitle: "Copt, gemuri și murături",
    emoji: "🫙",
    color: "#BE185D",
    words: [
      { id: "d11w1", pl: "sernik", ro: "prăjitură cu brânză", say: "sernik", emoji: "🍰" },
      { id: "d11w2", pl: "szarlotka", ro: "plăcintă cu mere", say: "șarlotka", emoji: "🥧" },
      { id: "d11w3", pl: "jabłka", ro: "mere", say: "iapka", emoji: "🍎" },
      { id: "d11w4", pl: "truskawki", ro: "căpșuni", say: "truskafki", emoji: "🍓" },
      { id: "d11w5", pl: "śliwki", ro: "prune", say: "șlifki", emoji: "🟣" },
      { id: "d11w6", pl: "dżem", ro: "gem", say: "gem", emoji: "🍯" },
      { id: "d11w7", pl: "słoik", ro: "borcan", say: "suoik", emoji: "🫙" },
      { id: "d11w8", pl: "ogórki kiszone", ro: "castraveți murați", say: "ogurki kișone", emoji: "🥒" },
      { id: "d11w9", pl: "Sama to zrobiłaś?", ro: "Ai făcut-o singură?", say: "sama to zrobiuaș?", emoji: "😮" },
      { id: "d11w10", pl: "Daj mi przepis", ro: "Dă-mi rețeta", say: "dai mi pșepis", emoji: "📝" },
      { id: "d11w11", pl: "Pyszny dżem!", ro: "Ce gem delicios!", say: "pîșnî gem", emoji: "😋" }
    ],
    dialogue: {
      title: "În cămară",
      lines: [
        { who: "Mama", pl: "Zobacz, to są ogórki kiszone.", ro: "Uite, sunt castraveți murați." },
        { who: "Tu", me: true, pl: "Sama je zrobiłaś?", ro: "Le-ai făcut singură?" },
        { who: "Mama", pl: "Tak! I dżem z truskawek.", ro: "Da! Și gem de căpșuni." },
        { who: "Tu", me: true, pl: "Super! W Rumunii też robimy kiszonki.", ro: "Super! Și în România facem murături." },
        { who: "Mama", pl: "Weź słoik do domu!", ro: "Ia un borcan acasă!" },
        { who: "Tu", me: true, pl: "Dziękuję, Mamo! Daj mi przepis.", ro: "Mulțumesc, mamă! Dă-mi rețeta." }
      ]
    },
    pronounce: ["sernik", "szarlotka", "truskawki", "ogórki kiszone", "Sama to zrobiłaś?", "Daj mi przepis"],
    grammar: null
  },

  /* ----------------------------------------------------------------- */
  {
    day: 12, week: 2,
    title: "În grădină",
    subtitle: "Legume, plantat și udat",
    emoji: "🍅",
    color: "#15803D",
    words: [
      { id: "d12w1", pl: "ogród", ro: "grădină", say: "ogrut", emoji: "🏡" },
      { id: "d12w2", pl: "warzywa", ro: "legume", say: "vajîva", emoji: "🥬" },
      { id: "d12w3", pl: "pomidory", ro: "roșii", say: "pomidorî", emoji: "🍅" },
      { id: "d12w4", pl: "ogórki", ro: "castraveți", say: "ogurki", emoji: "🥒" },
      { id: "d12w5", pl: "koper", ro: "mărar", say: "koper", emoji: "🌿" },
      { id: "d12w6", pl: "pietruszka", ro: "pătrunjel", say: "pietrușka", emoji: "🌱" },
      { id: "d12w7", pl: "podlewać", ro: "a uda", say: "podlevaci", emoji: "💧" },
      { id: "d12w8", pl: "sadzić", ro: "a planta", say: "sagici", emoji: "🪴" },
      { id: "d12w9", pl: "Co sadzisz?", ro: "Ce plantezi?", say: "țo sagiș?", emoji: "❓" },
      { id: "d12w10", pl: "Ale duże pomidory!", ro: "Ce roșii mari!", say: "ale duje pomidorî", emoji: "😮" },
      { id: "d12w11", pl: "Mogę podlać?", ro: "Pot să ud?", say: "moghe podlaci?", emoji: "🚿" },
      { id: "d12w12", pl: "Pięknie rosną!", ro: "Cresc frumos!", say: "pienknie rosnom", emoji: "🌻" }
    ],
    dialogue: {
      title: "Plimbare prin grădină",
      lines: [
        { who: "Mama", pl: "Chodź, zobacz ogród!", ro: "Hai, uită-te la grădină!" },
        { who: "Tu", me: true, pl: "Ale duże pomidory!", ro: "Ce roșii mari!" },
        { who: "Mama", pl: "Tak, w tym roku pięknie rosną.", ro: "Da, anul ăsta cresc frumos." },
        { who: "Tu", me: true, pl: "A co to jest?", ro: "Și ce e asta?" },
        { who: "Mama", pl: "To jest koper. Do ogórków.", ro: "Asta e mărar. Pentru castraveți." },
        { who: "Tu", me: true, pl: "Mogę podlać?", ro: "Pot să ud?" },
        { who: "Mama", pl: "Pewnie! Tu jest konewka.", ro: "Sigur! Aici e stropitoarea." }
      ]
    },
    pronounce: ["ogród", "warzywa", "pietruszka", "Co sadzisz?", "Ale duże pomidory!", "Pięknie rosną!"],
    grammar: {
      title: "Pluralul: un pomidor → multe pomidory",
      html: `
        <p>În grădină totul e la plural! Regula de bază pentru început:</p>
        <table class="g-table">
          <tr><th>Unul</th><th>Mai multe</th><th>Română</th></tr>
          <tr><td>pomidor</td><td>pomidor<b>y</b></td><td>roșie → roșii</td></tr>
          <tr><td>kwiat</td><td>kwiat<b>y</b></td><td>floare → flori</td></tr>
          <tr><td>truskawka</td><td>truskawk<b>i</b></td><td>căpșună → căpșuni</td></tr>
          <tr><td>ogórek</td><td>ogórk<b>i</b></td><td>castravete → castraveți</td></tr>
          <tr><td>jabłko</td><td>jabłk<b>a</b></td><td>măr → mere</td></tr>
        </table>
        <p>Pluralul se face de obicei cu <b>-y</b>. După <b>k</b> și <b>g</b> devine <b>-i</b> (truskawki, ogórki). Cuvintele neutre în <b>-o</b> primesc <b>-a</b> (jabłko → jabłka).</p>
        <p class="g-tip">💡 Ca în română, uneori cuvântul se schimbă puțin în interior: ogór<b>e</b>k → ogórki.</p>`,
      quiz: [
        { q: "Plural de „pomidor”:", options: ["pomidora", "pomidory", "pomidori"], answer: 1 },
        { q: "Plural de „truskawka”:", options: ["truskawki", "truskawky", "truskawka"], answer: 0 },
        { q: "Plural de „jabłko”:", options: ["jabłki", "jabłky", "jabłka"], answer: 2 }
      ]
    }
  },

  /* ----------------------------------------------------------------- */
  {
    day: 13, week: 2,
    title: "Flori și vreme",
    subtitle: "Complimente pentru grădina Mamei",
    emoji: "🌷",
    color: "#DB2777",
    words: [
      { id: "d13w1", pl: "kwiaty", ro: "flori", say: "kfiatî", emoji: "💐" },
      { id: "d13w2", pl: "róża", ro: "trandafir", say: "ruja", emoji: "🌹" },
      { id: "d13w3", pl: "tulipan", ro: "lalea", say: "tulipan", emoji: "🌷" },
      { id: "d13w4", pl: "słonecznik", ro: "floarea-soarelui", say: "suonecinik", emoji: "🌻" },
      { id: "d13w5", pl: "wiosna", ro: "primăvară", say: "viosna", emoji: "🌱" },
      { id: "d13w6", pl: "jesień", ro: "toamnă", say: "ieșieni", emoji: "🍂" },
      { id: "d13w7", pl: "ciepło", ro: "cald", say: "ciepuo", emoji: "☀️" },
      { id: "d13w8", pl: "zimno", ro: "frig", say: "jimno", emoji: "🥶" },
      { id: "d13w9", pl: "Pada deszcz", ro: "Plouă", say: "pada deșci", emoji: "🌧️" },
      { id: "d13w10", pl: "Jakie piękne kwiaty!", ro: "Ce flori frumoase!", say: "iakie pienkne kfiatî", emoji: "😍" },
      { id: "d13w11", pl: "Jak się nazywa ten kwiat?", ro: "Cum se numește floarea asta?", say: "iak șe nazîva ten kfiat?", emoji: "🤔" },
      { id: "d13w12", pl: "Lubię róże", ro: "Îmi plac trandafirii", say: "lubie ruje", emoji: "💗" }
    ],
    dialogue: {
      title: "Cafea în grădină",
      lines: [
        { who: "Tu", me: true, pl: "Mamo, jakie piękne kwiaty!", ro: "Mamă, ce flori frumoase!" },
        { who: "Mama", pl: "Dziękuję! To są róże, a to tulipany.", ro: "Mulțumesc! Ăștia sunt trandafiri, iar astea lalele." },
        { who: "Tu", me: true, pl: "Jak się nazywa ten kwiat?", ro: "Cum se numește floarea asta?" },
        { who: "Mama", pl: "To słonecznik.", ro: "E floarea-soarelui." },
        { who: "Tu", me: true, pl: "Lubię róże!", ro: "Îmi plac trandafirii!" },
        { who: "Mama", pl: "Dzisiaj jest ciepło. Napijemy się kawy w ogrodzie?", ro: "Azi e cald. Bem o cafea în grădină?" },
        { who: "Tu", me: true, pl: "Chętnie!", ro: "Cu plăcere!" }
      ]
    },
    pronounce: ["kwiaty", "róża", "słonecznik", "Pada deszcz", "Jakie piękne kwiaty!", "Jak się nazywa ten kwiat?"],
    grammar: null
  },

  /* ----------------------------------------------------------------- */
  {
    day: 14, week: 2,
    title: "Povești și la revedere",
    subtitle: "Despre Olivia, weekend și invitații",
    emoji: "🤗",
    color: "#7C3AED",
    words: [
      { id: "d14w1", pl: "wnuczka", ro: "nepoțică", say: "vnucika", emoji: "👧" },
      { id: "d14w2", pl: "Jak tam Oliwka?", ro: "Ce face Olivia?", say: "iak tam olifka?", emoji: "💬" },
      { id: "d14w3", pl: "Coraz lepiej mówi po polsku", ro: "Vorbește tot mai bine poloneză", say: "țoras lepiei muvi po polsku", emoji: "🗣️" },
      { id: "d14w4", pl: "Co robisz w weekend?", ro: "Ce faci în weekend?", say: "țo robiș v uikend?", emoji: "📅" },
      { id: "d14w5", pl: "Przyjdziesz w niedzielę?", ro: "Vii duminică?", say: "pșîigieș v niegiele?", emoji: "🚗" },
      { id: "d14w6", pl: "Zapraszamy na obiad", ro: "Te invităm la prânz", say: "zaprașamî na obiat", emoji: "🍽️" },
      { id: "d14w7", pl: "Lubię gotować", ro: "Îmi place să gătesc", say: "lubie gotovaci", emoji: "👩‍🍳" },
      { id: "d14w8", pl: "Do zobaczenia!", ro: "Pe curând! / Ne vedem!", say: "do zobacienia", emoji: "👋" },
      { id: "d14w9", pl: "Dziękuję za wszystko", ro: "Mulțumesc pentru tot", say: "gienkuie za fșîstko", emoji: "💛" },
      { id: "d14w10", pl: "Uważaj na siebie!", ro: "Ai grijă de tine!", say: "uvajai na șiebie", emoji: "🤗" }
    ],
    dialogue: {
      title: "La plecare",
      lines: [
        { who: "Mama", pl: "Jak tam Oliwka?", ro: "Ce face Olivia?" },
        { who: "Tu", me: true, pl: "Dobrze! Coraz lepiej mówi po polsku.", ro: "Bine! Vorbește tot mai bine poloneză." },
        { who: "Mama", pl: "Brawo! A co robisz w weekend?", ro: "Bravo! Și ce faci în weekend?" },
        { who: "Tu", me: true, pl: "Nic. Przyjdziesz w niedzielę? Zapraszamy na obiad.", ro: "Nimic. Vii duminică? Te invităm la prânz." },
        { who: "Mama", pl: "Chętnie! Upiekę sernik.", ro: "Cu plăcere! Fac o prăjitură cu brânză." },
        { who: "Tu", me: true, pl: "Super! Dziękuję za wszystko. Do zobaczenia, Mamo!", ro: "Super! Mulțumesc pentru tot. Pe curând, mamă!" },
        { who: "Mama", pl: "Uważaj na siebie!", ro: "Ai grijă de tine!" }
      ]
    },
    pronounce: ["Jak tam Oliwka?", "Co robisz w weekend?", "Przyjdziesz w niedzielę?", "Zapraszamy na obiad", "Dziękuję za wszystko", "Uważaj na siebie!"],
    grammar: {
      title: "„Lubię…” — îmi place",
      html: `
        <p>Pentru „îmi place” polona folosește un verb simplu: <b>lubić</b>. Funcționează invers decât în română — <b>eu</b> sunt subiectul: „Lubię kawę” = literal „Eu iubesc cafeaua”.</p>
        <table class="g-table">
          <tr><th>Polonă</th><th>Română</th></tr>
          <tr><td><b>Lubię</b> gotować.</td><td>Îmi place să gătesc.</td></tr>
          <tr><td><b>Lubię</b> róże.</td><td>Îmi plac trandafirii.</td></tr>
          <tr><td><b>Lubię</b> kaw<b>ę</b>.</td><td>Îmi place cafeaua.</td></tr>
          <tr><td><b>Nie lubię</b> zimna.</td><td>Nu-mi place frigul.</td></tr>
          <tr><td><b>Lubisz</b> pierogi?</td><td>Îți plac pierogii?</td></tr>
        </table>
        <p>Ține minte regula din Ziua 7: cuvintele feminine în <b>-a</b> devin <b>-ę</b>: kawa → Lubię kaw<b>ę</b>, herbata → Lubię herbat<b>ę</b>.</p>
        <p class="g-tip">💡 Întrebare perfectă pentru o conversație cu Mama: <b>„Co lubisz gotować?”</b> — Ce-ți place să gătești?</p>`,
      quiz: [
        { q: "„Îmi place să gătesc” =", options: ["Lubię gotować", "Lubisz gotować", "Gotuję lubię"], answer: 0 },
        { q: "„Îți plac pierogii?” = ___ pierogi?", options: ["Lubię", "Lubisz", "Lubi"], answer: 1 },
        { q: "Lubię ___ (herbata)", options: ["herbata", "herbatę", "herbaty"], answer: 1 }
      ]
    }
  }
);

/* Practice together — here the Polish speaker can be Kamil OR Mama herself */
Object.assign(window.PARTNER, {
  8: [
    { q: "Cześć! Co słychać?", ro: "Bună! Ce mai e nou?", a: "Wszystko dobrze. A u ciebie?" },
    { q: "Jak się czujesz?", ro: "Cum te simți?", a: "Dobrze, dziękuję." },
    { q: "Napijesz się kawy?", ro: "Bei o cafea?", a: "Chętnie! / Poproszę herbatę." },
    { q: "Siadaj!", ro: "Ia loc!", a: "Dziękuję." },
    { q: "Do widzenia!", ro: "La revedere!", a: "Do widzenia, Mamo! / Na razie!" }
  ],
  9: [
    { q: "Pomożesz mi?", ro: "Mă ajuți?", a: "Tak! Co mam zrobić?" },
    { q: "Pokrój cebulę.", ro: "Taie ceapa.", a: "Dobrze. Gdzie jest nóż?" },
    { q: "Spróbuj!", ro: "Gustă!", a: "Mmm, pyszne!" },
    { q: "Daj mi sól.", ro: "Dă-mi sarea.", a: "Proszę." },
    { q: "Ładnie pachnie?", ro: "Miroase frumos?", a: "Tak, ale pięknie pachnie!" }
  ],
  10: [
    { q: "Smacznego!", ro: "Poftă bună!", a: "Smacznego!" },
    { q: "Smakuje ci?", ro: "Îți place (gustul)?", a: "Tak, pyszne!" },
    { q: "Weź jeszcze!", ro: "Mai ia!", a: "Dziękuję, już się najadłam." },
    { q: "Co się je w Rumunii?", ro: "Ce se mănâncă în România?", a: "Sarmale, ciorbă, mămăligă…" },
    { q: "Lubisz pierogi?", ro: "Îți plac pierogii?", a: "Tak, lubię!" }
  ],
  11: [
    { q: "Lubisz sernik?", ro: "Îți place prăjitura cu brânză?", a: "Tak, bardzo!" },
    { q: "Spróbuj dżemu!", ro: "Gustă gemul!", a: "Mmm, pyszny dżem!" },
    { q: "Weź słoik do domu!", ro: "Ia un borcan acasă!", a: "Dziękuję, Mamo!" },
    { q: "Robicie w Rumunii kiszonki?", ro: "Faceți murături în România?", a: "Tak, robimy!" },
    { q: "Dać ci przepis?", ro: "Să-ți dau rețeta?", a: "Tak, poproszę!" }
  ],
  12: [
    { q: "Chodź do ogrodu!", ro: "Hai în grădină!", a: "Dobrze, idę!" },
    { q: "Co to jest? (arată spre legume)", ro: "Ce e asta?", a: "To są pomidory. / To jest koper." },
    { q: "Podlejesz kwiaty?", ro: "Uzi florile?", a: "Tak, mogę podlać." },
    { q: "Lubisz ogród?", ro: "Îți place grădina?", a: "Tak, bardzo!" },
    { q: "Zobacz, jakie duże!", ro: "Uite ce mari sunt!", a: "Ale duże pomidory!" }
  ],
  13: [
    { q: "Jaka dzisiaj pogoda?", ro: "Cum e vremea azi?", a: "Ciepło. / Zimno. / Pada deszcz." },
    { q: "Jakie kwiaty lubisz?", ro: "Ce flori îți plac?", a: "Lubię róże." },
    { q: "Lubisz wiosnę czy jesień?", ro: "Îți place primăvara sau toamna?", a: "Lubię wiosnę." },
    { q: "Jak się nazywa ten kwiat? (arată)", ro: "Cum se numește floarea asta?", a: "To róża. / To tulipan." },
    { q: "Zimno ci?", ro: "Ți-e frig?", a: "Tak, trochę. / Nie, jest dobrze." }
  ],
  14: [
    { q: "Jak tam Oliwka?", ro: "Ce face Olivia?", a: "Dobrze! Coraz lepiej mówi po polsku." },
    { q: "Co robisz w weekend?", ro: "Ce faci în weekend?", a: "Nic. Przyjdziesz na obiad?" },
    { q: "Co lubisz robić?", ro: "Ce-ți place să faci?", a: "Lubię gotować." },
    { q: "Uważaj na siebie!", ro: "Ai grijă de tine!", a: "Ty też, Mamo!" },
    { q: "Do zobaczenia!", ro: "Pe curând!", a: "Do zobaczenia! Dziękuję za wszystko." }
  ]
});
