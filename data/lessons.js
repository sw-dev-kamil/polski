/* =====================================================================
   LESSON CONTENT — Romanian → Polish
   ---------------------------------------------------------------------
   To add a new day: copy one { day: ... } block, change the number,
   give every word a NEW unique id, and keep the same structure.
   Fields:
     pl    – Polish text (what is spoken and checked)
     ro    – Romanian translation
     say   – how to read it, written with Romanian letters (optional)
     emoji – small picture for the card (optional)
   Dialogue lines with  me: true  are HER lines (she practises them).
   ===================================================================== */

window.LESSONS = [
  /* ----------------------------------------------------------------- */
  {
    day: 1,
    title: "Salutări",
    subtitle: "Primele cuvinte și sunetele limbii",
    emoji: "👋",
    color: "#E5484D",
    words: [
      { id: "d1w1", pl: "Dzień dobry", ro: "Bună ziua", say: "gien dobrî", emoji: "☀️" },
      { id: "d1w2", pl: "Cześć", ro: "Salut / Bună", say: "ceșci", emoji: "👋" },
      { id: "d1w3", pl: "Dobry wieczór", ro: "Bună seara", say: "dobrî vieciur", emoji: "🌆" },
      { id: "d1w4", pl: "Do widzenia", ro: "La revedere", say: "do vigenia", emoji: "🚪" },
      { id: "d1w5", pl: "Na razie", ro: "Pa / Pe curând", say: "na rajie", emoji: "✌️" },
      { id: "d1w6", pl: "Dziękuję", ro: "Mulțumesc", say: "gienkuie", emoji: "🙏" },
      { id: "d1w7", pl: "Proszę", ro: "Te rog / Poftim", say: "proșe", emoji: "🤲" },
      { id: "d1w8", pl: "Przepraszam", ro: "Scuze / Pardon", say: "pșeprașam", emoji: "😅" },
      { id: "d1w9", pl: "Tak", ro: "Da", say: "tak", emoji: "✅" },
      { id: "d1w10", pl: "Nie", ro: "Nu", say: "nie", emoji: "❌" }
    ],
    dialogue: {
      title: "La ușa magazinului",
      lines: [
        { who: "Vânzătoare", pl: "Dzień dobry!", ro: "Bună ziua!" },
        { who: "Tu", me: true, pl: "Dzień dobry!", ro: "Bună ziua!" },
        { who: "Vânzătoare", pl: "Proszę.", ro: "Poftiți." },
        { who: "Tu", me: true, pl: "Dziękuję! Do widzenia!", ro: "Mulțumesc! La revedere!" },
        { who: "Vânzătoare", pl: "Do widzenia!", ro: "La revedere!" }
      ]
    },
    pronounce: ["Dzień dobry", "Cześć", "Dziękuję", "Przepraszam", "Do widzenia", "Proszę"],
    grammar: {
      title: "Sunetele polonei, pentru o vorbitoare de română",
      html: `
        <p>Vestea bună: multe sunete poloneze <b>există deja în română</b>, doar că se scriu altfel.</p>
        <table class="g-table">
          <tr><th>Polonă</th><th>Sună ca în română</th><th>Exemplu</th></tr>
          <tr><td><b>sz</b></td><td><b>ș</b></td><td>proszę → <i>proșe</i></td></tr>
          <tr><td><b>cz</b></td><td><b>ce / ci</b></td><td>wieczór → <i>vieciur</i></td></tr>
          <tr><td><b>c</b></td><td><b>ț</b></td><td>noc → <i>noț</i></td></tr>
          <tr><td><b>ż / rz</b></td><td><b>j</b></td><td>żona → <i>jona</i></td></tr>
          <tr><td><b>ch</b></td><td><b>h</b></td><td>chleb → <i>hlep</i></td></tr>
          <tr><td><b>w</b></td><td><b>v</b></td><td>woda → <i>voda</i></td></tr>
          <tr><td><b>j</b></td><td><b>i</b></td><td>jak → <i>iak</i></td></tr>
          <tr><td><b>y</b></td><td><b>î / â</b></td><td>dobry → <i>dobrî</i></td></tr>
          <tr><td><b>ł</b></td><td><b>u</b> scurt (ca „w” englez)</td><td>masło → <i>masuo</i></td></tr>
          <tr><td><b>ó</b></td><td><b>u</b></td><td>wieczór → <i>vieciur</i></td></tr>
        </table>
        <p><b>Sunete „moi”</b> (limba lipită de cerul gurii, ca la un zâmbet):
        <b>ś / si</b> ≈ ș moale, <b>ć / ci</b> ≈ ci moale, <b>ź / zi</b> ≈ j moale,
        <b>dź / dzi</b> ≈ gi moale, <b>ń / ni</b> ≈ ni topit, ca „gn” din „coniac” (cognac).</p>
        <p><b>Vocale nazale:</b> <b>ą</b> ≈ „on”, <b>ę</b> ≈ „en”. La sfârșitul cuvântului
        <b>ę</b> se citește aproape ca un simplu <b>e</b>: dziękuję → <i>gienkuie</i>.</p>
        <p class="g-tip">💡 Accentul cade aproape mereu pe <b>penultima silabă</b>: dzię-<b>ku</b>-ję, prze-<b>pra</b>-szam.</p>`,
      quiz: [
        { q: "Ce literă poloneză sună ca „ș”?", options: ["sz", "cz", "ż", "c"], answer: 0 },
        { q: "Cum se citește „w” în polonă?", options: ["u", "v", "w englez", "f"], answer: 1 },
        { q: "Pe ce silabă cade de obicei accentul?", options: ["Prima", "Ultima", "Penultima", "Oricare"], answer: 2 }
      ]
    }
  },

  /* ----------------------------------------------------------------- */
  {
    day: 2,
    title: "Mă prezint",
    subtitle: "Cum te cheamă, de unde ești",
    emoji: "🙋‍♀️",
    color: "#8E4EC6",
    words: [
      { id: "d2w1", pl: "Jak masz na imię?", ro: "Cum te cheamă?", say: "iak maș na imie?", emoji: "❓" },
      { id: "d2w2", pl: "Mam na imię Maria", ro: "Mă numesc Maria", say: "mam na imie maria", emoji: "🙋‍♀️" },
      { id: "d2w3", pl: "Miło mi", ro: "Încântată", say: "miuo mi", emoji: "😊" },
      { id: "d2w4", pl: "Skąd jesteś?", ro: "De unde ești?", say: "skont iesteș?", emoji: "🗺️" },
      { id: "d2w5", pl: "Jestem z Rumunii", ro: "Sunt din România", say: "iestem z rumunii", emoji: "🇷🇴" },
      { id: "d2w6", pl: "Mieszkam tutaj", ro: "Locuiesc aici", say: "mieșkam tutai", emoji: "🏠" },
      { id: "d2w7", pl: "Nie rozumiem", ro: "Nu înțeleg", say: "nie rozumiem", emoji: "🤷‍♀️" },
      { id: "d2w8", pl: "Mówię trochę po polsku", ro: "Vorbesc puțin poloneză", say: "muvie trohe po polsku", emoji: "🇵🇱" },
      { id: "d2w9", pl: "Czy mówisz po angielsku?", ro: "Vorbești engleză?", say: "cî muviș po anghielsku?", emoji: "🇬🇧" },
      { id: "d2w10", pl: "Powoli, proszę", ro: "Mai rar, te rog", say: "povoli, proșe", emoji: "🐢" }
    ],
    dialogue: {
      title: "Noua vecină",
      lines: [
        { who: "Kasia", pl: "Cześć! Jestem Kasia. Jak masz na imię?", ro: "Salut! Sunt Kasia. Cum te cheamă?" },
        { who: "Tu", me: true, pl: "Cześć! Mam na imię Maria.", ro: "Salut! Mă numesc Maria." },
        { who: "Kasia", pl: "Miło mi. Skąd jesteś?", ro: "Încântată. De unde ești?" },
        { who: "Tu", me: true, pl: "Jestem z Rumunii. Mieszkam tutaj.", ro: "Sunt din România. Locuiesc aici." },
        { who: "Kasia", pl: "Super! Mówisz po polsku?", ro: "Super! Vorbești poloneză?" },
        { who: "Tu", me: true, pl: "Trochę. Powoli, proszę.", ro: "Puțin. Mai rar, te rog." }
      ]
    },
    pronounce: ["Jak masz na imię?", "Miło mi", "Jestem z Rumunii", "Mieszkam tutaj", "Nie rozumiem", "Powoli, proszę"],
    grammar: {
      title: "Verbul „być” (a fi)",
      html: `
        <p>Ca în română, verbul „a fi” este neregulat. Pronumele se pot omite — terminația arată persoana, exact ca la noi („sunt” în loc de „eu sunt”).</p>
        <table class="g-table">
          <tr><th>Polonă</th><th>Citește</th><th>Română</th></tr>
          <tr><td>(ja) <b>jestem</b></td><td><i>iestem</i></td><td>(eu) sunt</td></tr>
          <tr><td>(ty) <b>jesteś</b></td><td><i>iesteș</i></td><td>(tu) ești</td></tr>
          <tr><td>(on/ona) <b>jest</b></td><td><i>iest</i></td><td>(el/ea) este</td></tr>
          <tr><td>(my) <b>jesteśmy</b></td><td><i>iesteșmî</i></td><td>(noi) suntem</td></tr>
          <tr><td>(wy) <b>jesteście</b></td><td><i>iesteșcie</i></td><td>(voi) sunteți</td></tr>
          <tr><td>(oni/one) <b>są</b></td><td><i>son</i></td><td>(ei/ele) sunt</td></tr>
        </table>
        <p class="g-tip">💡 Ca în română, se spune <b>„Jestem z Rumunii”</b> fără „ja”. „Ja jestem…” sună apăsat, ca „Eu sunt…”.</p>`,
      quiz: [
        { q: "„Eu sunt din România” = ___ z Rumunii", options: ["Jest", "Jestem", "Jesteś", "Są"], answer: 1 },
        { q: "„Ești aici?” = ___ tutaj?", options: ["Jesteś", "Jestem", "Jesteśmy", "Jest"], answer: 0 },
        { q: "Cum spui „ei sunt”?", options: ["jesteście", "jest", "są", "jesteśmy"], answer: 2 }
      ]
    }
  },

  /* ----------------------------------------------------------------- */
  {
    day: 3,
    title: "Numere 1–10",
    subtitle: "Numărăm și dăm un număr de telefon",
    emoji: "🔢",
    color: "#0091FF",
    words: [
      { id: "d3w1", pl: "jeden", ro: "unu", say: "ieden", emoji: "1️⃣" },
      { id: "d3w2", pl: "dwa", ro: "doi", say: "dva", emoji: "2️⃣" },
      { id: "d3w3", pl: "trzy", ro: "trei", say: "tșî", emoji: "3️⃣" },
      { id: "d3w4", pl: "cztery", ro: "patru", say: "cterî", emoji: "4️⃣" },
      { id: "d3w5", pl: "pięć", ro: "cinci", say: "pienci", emoji: "5️⃣" },
      { id: "d3w6", pl: "sześć", ro: "șase", say: "șeșci", emoji: "6️⃣" },
      { id: "d3w7", pl: "siedem", ro: "șapte", say: "șiedem", emoji: "7️⃣" },
      { id: "d3w8", pl: "osiem", ro: "opt", say: "oșiem", emoji: "8️⃣" },
      { id: "d3w9", pl: "dziewięć", ro: "nouă", say: "gievienci", emoji: "9️⃣" },
      { id: "d3w10", pl: "dziesięć", ro: "zece", say: "gieșienci", emoji: "🔟" },
      { id: "d3w11", pl: "Ile?", ro: "Cât? / Câte?", say: "ile?", emoji: "🤔" }
    ],
    dialogue: {
      title: "Numărul de telefon",
      lines: [
        { who: "Kasia", pl: "Jaki masz numer telefonu?", ro: "Ce număr de telefon ai?" },
        { who: "Tu", me: true, pl: "Pięć, sześć, siedem, osiem.", ro: "Cinci, șase, șapte, opt." },
        { who: "Kasia", pl: "Powoli, proszę!", ro: "Mai rar, te rog!" },
        { who: "Tu", me: true, pl: "Pięć… sześć… siedem… osiem.", ro: "Cinci… șase… șapte… opt." },
        { who: "Kasia", pl: "Dziękuję! Na razie!", ro: "Mulțumesc! Pa!" },
        { who: "Tu", me: true, pl: "Na razie!", ro: "Pa!" }
      ]
    },
    pronounce: ["trzy", "cztery", "pięć", "sześć", "dziewięć", "dziesięć"],
    grammar: null
  },

  /* ----------------------------------------------------------------- */
  {
    day: 4,
    title: "La magazin",
    subtitle: "Cumpărături simple și plata",
    emoji: "🛒",
    color: "#30A46C",
    words: [
      { id: "d4w1", pl: "sklep", ro: "magazin", say: "sklep", emoji: "🏪" },
      { id: "d4w2", pl: "chleb", ro: "pâine", say: "hlep", emoji: "🍞" },
      { id: "d4w3", pl: "mleko", ro: "lapte", say: "mleko", emoji: "🥛" },
      { id: "d4w4", pl: "woda", ro: "apă", say: "voda", emoji: "💧" },
      { id: "d4w5", pl: "ser", ro: "brânză / cașcaval", say: "ser", emoji: "🧀" },
      { id: "d4w6", pl: "jajka", ro: "ouă", say: "iaika", emoji: "🥚" },
      { id: "d4w7", pl: "masło", ro: "unt", say: "masuo", emoji: "🧈" },
      { id: "d4w8", pl: "Poproszę…", ro: "Aș dori… / Vă rog…", say: "poproșe", emoji: "🙋‍♀️" },
      { id: "d4w9", pl: "Ile to kosztuje?", ro: "Cât costă?", say: "ile to koștuie?", emoji: "🏷️" },
      { id: "d4w10", pl: "Coś jeszcze?", ro: "Altceva?", say: "țoș ieșce?", emoji: "➕" },
      { id: "d4w11", pl: "To wszystko", ro: "Asta e tot", say: "to fșîstko", emoji: "👌" },
      { id: "d4w12", pl: "Kartą czy gotówką?", ro: "Cu cardul sau cash?", say: "kartom cî gotufkom?", emoji: "💳" }
    ],
    dialogue: {
      title: "La casa de marcat",
      lines: [
        { who: "Vânzător", pl: "Dzień dobry!", ro: "Bună ziua!" },
        { who: "Tu", me: true, pl: "Dzień dobry. Poproszę chleb i mleko.", ro: "Bună ziua. Aș dori pâine și lapte." },
        { who: "Vânzător", pl: "Coś jeszcze?", ro: "Altceva?" },
        { who: "Tu", me: true, pl: "To wszystko, dziękuję.", ro: "Asta e tot, mulțumesc." },
        { who: "Vânzător", pl: "Dwanaście złotych. Kartą czy gotówką?", ro: "Doisprezece zloți. Cu cardul sau cash?" },
        { who: "Tu", me: true, pl: "Kartą.", ro: "Cu cardul." },
        { who: "Vânzător", pl: "Dziękuję, do widzenia!", ro: "Mulțumesc, la revedere!" },
        { who: "Tu", me: true, pl: "Do widzenia!", ro: "La revedere!" }
      ]
    },
    pronounce: ["chleb", "masło", "Poproszę chleb", "Ile to kosztuje?", "To wszystko", "Kartą"],
    grammar: null
  },

  /* ----------------------------------------------------------------- */
  {
    day: 5,
    title: "Familia",
    subtitle: "Cei dragi și genul cuvintelor",
    emoji: "👨‍👩‍👧",
    color: "#F76B15",
    words: [
      { id: "d5w1", pl: "rodzina", ro: "familie", say: "rogina", emoji: "👨‍👩‍👧" },
      { id: "d5w2", pl: "mama", ro: "mama", say: "mama", emoji: "👩" },
      { id: "d5w3", pl: "tata", ro: "tata", say: "tata", emoji: "👨" },
      { id: "d5w4", pl: "córka", ro: "fiică", say: "țurka", emoji: "👧" },
      { id: "d5w5", pl: "syn", ro: "fiu", say: "sîn", emoji: "👦" },
      { id: "d5w6", pl: "mąż", ro: "soț", say: "monș", emoji: "🤵" },
      { id: "d5w7", pl: "żona", ro: "soție", say: "jona", emoji: "👰" },
      { id: "d5w8", pl: "dziecko", ro: "copil", say: "giețko", emoji: "👶" },
      { id: "d5w9", pl: "brat", ro: "frate", say: "brat", emoji: "🧑" },
      { id: "d5w10", pl: "siostra", ro: "soră", say: "șiostra", emoji: "👩‍🦰" },
      { id: "d5w11", pl: "To jest moja córka", ro: "Aceasta este fiica mea", say: "to iest moia țurka", emoji: "💕" }
    ],
    dialogue: {
      title: "În parc",
      lines: [
        { who: "Kasia", pl: "Cześć! To jest twoja córka?", ro: "Salut! Aceasta e fiica ta?" },
        { who: "Tu", me: true, pl: "Tak, to jest moja córka.", ro: "Da, aceasta e fiica mea." },
        { who: "Kasia", pl: "Jest super! A to jest mój syn.", ro: "E super! Iar acesta e fiul meu." },
        { who: "Tu", me: true, pl: "Cześć! Miło mi.", ro: "Salut! Încântată." }
      ]
    },
    pronounce: ["rodzina", "córka", "mąż", "żona", "dziecko", "To jest moja córka"],
    grammar: {
      title: "Genul cuvintelor (rodzaj)",
      html: `
        <p>Ca în română, substantivele poloneze au <b>gen</b>. De cele mai multe ori îl vezi după terminație:</p>
        <table class="g-table">
          <tr><th>Gen</th><th>Terminație</th><th>Exemple</th><th>„meu/mea”</th></tr>
          <tr><td>Feminin</td><td><b>-a</b></td><td>córka, żona, woda</td><td><b>moja</b> córka</td></tr>
          <tr><td>Masculin</td><td><b>consoană</b></td><td>syn, mąż, chleb</td><td><b>mój</b> syn</td></tr>
          <tr><td>Neutru</td><td><b>-o / -e</b></td><td>dziecko, mleko</td><td><b>moje</b> dziecko</td></tr>
        </table>
        <p>Diferență față de română: în polonă <b>nu există articol</b>. „córka” poate fi „fiică” sau „fiica” — contextul decide.</p>
        <p class="g-tip">💡 Excepții simpatice: <b>tata</b> se termină în -a, dar e masculin — exact ca în română!</p>`,
      quiz: [
        { q: "„fiica mea” = ___ córka", options: ["mój", "moja", "moje"], answer: 1 },
        { q: "Ce gen are „mleko”?", options: ["Feminin", "Masculin", "Neutru"], answer: 2 },
        { q: "„fiul meu” = ___ syn", options: ["mój", "moja", "moje"], answer: 0 }
      ]
    }
  },

  /* ----------------------------------------------------------------- */
  {
    day: 6,
    title: "La grădiniță",
    subtitle: "Discuții scurte cu educatoarea",
    emoji: "🧸",
    color: "#D6409F",
    words: [
      { id: "d6w1", pl: "przedszkole", ro: "grădiniță", say: "pșetșkole", emoji: "🏫" },
      { id: "d6w2", pl: "pani", ro: "doamna (educatoarea)", say: "pani", emoji: "👩‍🏫" },
      { id: "d6w3", pl: "dzisiaj", ro: "azi", say: "gișiai", emoji: "📅" },
      { id: "d6w4", pl: "jutro", ro: "mâine", say: "iutro", emoji: "🌅" },
      { id: "d6w5", pl: "O której?", ro: "La ce oră?", say: "o kturei?", emoji: "🕒" },
      { id: "d6w6", pl: "chora", ro: "bolnavă", say: "hora", emoji: "🤒" },
      { id: "d6w7", pl: "kurtka", ro: "geacă", say: "kurtka", emoji: "🧥" },
      { id: "d6w8", pl: "obiad", ro: "prânz", say: "obiat", emoji: "🍲" },
      { id: "d6w9", pl: "Jak było dzisiaj?", ro: "Cum a fost azi?", say: "iak bîuo gișiai?", emoji: "💬" },
      { id: "d6w10", pl: "Wszystko w porządku?", ro: "E totul în regulă?", say: "fșîstko f pojondku?", emoji: "👍" },
      { id: "d6w11", pl: "Córka jest chora", ro: "Fiica e bolnavă", say: "țurka iest hora", emoji: "🤒" },
      { id: "d6w12", pl: "Do jutra!", ro: "Pe mâine!", say: "do iutra", emoji: "👋" }
    ],
    dialogue: {
      title: "Venim după copil",
      lines: [
        { who: "Educatoarea", pl: "Dzień dobry!", ro: "Bună ziua!" },
        { who: "Tu", me: true, pl: "Dzień dobry! Jak było dzisiaj?", ro: "Bună ziua! Cum a fost azi?" },
        { who: "Educatoarea", pl: "Dobrze. Zjadła cały obiad.", ro: "Bine. A mâncat tot prânzul." },
        { who: "Tu", me: true, pl: "Super! Dziękuję.", ro: "Super! Mulțumesc." },
        { who: "Educatoarea", pl: "Jutro idziemy na spacer.", ro: "Mâine mergem la plimbare." },
        { who: "Tu", me: true, pl: "Dobrze. Do jutra!", ro: "Bine. Pe mâine!" }
      ]
    },
    pronounce: ["przedszkole", "dzisiaj", "Jak było dzisiaj?", "Wszystko w porządku?", "Córka jest chora", "Do jutra"],
    grammar: null
  },

  /* ----------------------------------------------------------------- */
  {
    day: 7,
    title: "La brutărie",
    subtitle: "Recapitulare + o cafea la pachet",
    emoji: "🥐",
    color: "#AD7F58",
    words: [
      { id: "d7w1", pl: "piekarnia", ro: "brutărie", say: "piekarnia", emoji: "🥖" },
      { id: "d7w2", pl: "bułka", ro: "chiflă", say: "buuka", emoji: "🥯" },
      { id: "d7w3", pl: "ciasto", ro: "prăjitură", say: "ciasto", emoji: "🍰" },
      { id: "d7w4", pl: "kawa", ro: "cafea", say: "kava", emoji: "☕" },
      { id: "d7w5", pl: "herbata", ro: "ceai", say: "herbata", emoji: "🍵" },
      { id: "d7w6", pl: "Na wynos", ro: "La pachet", say: "na vînos", emoji: "🛍️" },
      { id: "d7w7", pl: "Na miejscu", ro: "Aici (pe loc)", say: "na mieisțu", emoji: "🪑" },
      { id: "d7w8", pl: "Miłego dnia!", ro: "O zi bună!", say: "miuego dnia", emoji: "🌞" },
      { id: "d7w9", pl: "Nawzajem!", ro: "La fel!", say: "navzaiem", emoji: "🤝" }
    ],
    dialogue: {
      title: "Dimineața la brutărie",
      lines: [
        { who: "Vânzătoare", pl: "Dzień dobry, co dla pani?", ro: "Bună ziua, ce doriți?" },
        { who: "Tu", me: true, pl: "Poproszę dwie bułki i kawę.", ro: "Aș dori două chifle și o cafea." },
        { who: "Vânzătoare", pl: "Na miejscu czy na wynos?", ro: "Aici sau la pachet?" },
        { who: "Tu", me: true, pl: "Na wynos.", ro: "La pachet." },
        { who: "Vânzătoare", pl: "Dziesięć złotych.", ro: "Zece zloți." },
        { who: "Tu", me: true, pl: "Proszę.", ro: "Poftiți." },
        { who: "Vânzătoare", pl: "Dziękuję, miłego dnia!", ro: "Mulțumesc, o zi bună!" },
        { who: "Tu", me: true, pl: "Dziękuję, nawzajem!", ro: "Mulțumesc, la fel!" }
      ]
    },
    pronounce: ["piekarnia", "bułka", "Poproszę dwie bułki", "Na wynos", "Miłego dnia", "Nawzajem"],
    grammar: {
      title: "Poproszę kawę — de ce „kawę”?",
      html: `
        <p>Polona are <b>cazuri</b>, ca româna (care are „casa / casei”). După <b>„Poproszę…”</b> (aș dori) cuvântul își schimbă puțin terminația.</p>
        <p>Regula ușoară pentru început: cuvintele <b>feminine în -a</b> devin <b>-ę</b>:</p>
        <table class="g-table">
          <tr><th>Cuvânt</th><th>Poproszę…</th></tr>
          <tr><td>kawa</td><td>Poproszę <b>kawę</b></td></tr>
          <tr><td>woda</td><td>Poproszę <b>wodę</b></td></tr>
          <tr><td>herbata</td><td>Poproszę <b>herbatę</b></td></tr>
          <tr><td>bułka</td><td>Poproszę <b>bułkę</b></td></tr>
        </table>
        <p>Masculinele de lucruri și neutrele <b>rămân la fel</b>: Poproszę <b>chleb</b>, Poproszę <b>mleko</b>, Poproszę <b>ser</b>.</p>
        <p class="g-tip">💡 Nu-ți face griji dacă greșești — polonezii te vor înțelege perfect și așa.</p>`,
      quiz: [
        { q: "Poproszę ___ (herbata)", options: ["herbata", "herbatę", "herbato"], answer: 1 },
        { q: "Poproszę ___ (mleko)", options: ["mlekę", "mleka", "mleko"], answer: 2 },
        { q: "Poproszę ___ (woda)", options: ["wodę", "woda", "wody"], answer: 0 }
      ]
    }
  }
];

/* Reference: Polish alphabet sounds for the "Sunete" tab */
window.SOUNDS = [
  { pl: "sz", ro: "ș", ex: "szkoła", exRo: "școală" },
  { pl: "cz", ro: "ce / ci", ex: "czas", exRo: "timp" },
  { pl: "c", ro: "ț", ex: "noc", exRo: "noapte" },
  { pl: "rz / ż", ro: "j", ex: "rzeka", exRo: "râu" },
  { pl: "ch / h", ro: "h", ex: "chleb", exRo: "pâine" },
  { pl: "w", ro: "v", ex: "woda", exRo: "apă" },
  { pl: "j", ro: "i", ex: "jajko", exRo: "ou" },
  { pl: "y", ro: "î / â", ex: "ryba", exRo: "pește" },
  { pl: "ł", ro: "u scurt", ex: "łyżka", exRo: "lingură" },
  { pl: "ó / u", ro: "u", ex: "góra", exRo: "munte" },
  { pl: "ś / si", ro: "ș moale", ex: "się", exRo: "se" },
  { pl: "ć / ci", ro: "ci moale", ex: "ciocia", exRo: "mătușă" },
  { pl: "ź / zi", ro: "j moale", ex: "zima", exRo: "iarnă" },
  { pl: "dź / dzi", ro: "gi moale", ex: "dziecko", exRo: "copil" },
  { pl: "dż", ro: "ge / gi", ex: "dżem", exRo: "gem" },
  { pl: "ń / ni", ro: "ni", ex: "koń", exRo: "cal" },
  { pl: "ą", ro: "on (nazal)", ex: "mąż", exRo: "soț" },
  { pl: "ę", ro: "en (nazal)", ex: "ręka", exRo: "mână" }
];

/* =====================================================================
   PRACTICE TOGETHER — short speaking games with a Polish speaker
   q    – what the partner says (in Polish)
   ro   – Romanian translation
   a    – a good answer she can give (shown after she tries)
   ===================================================================== */
window.PARTNER = {
  1: [
    { q: "Dzień dobry!", ro: "Bună ziua!", a: "Dzień dobry!" },
    { q: "Cześć!", ro: "Salut!", a: "Cześć!" },
    { q: "Proszę. (îți dă ceva)", ro: "Poftim.", a: "Dziękuję!" },
    { q: "Dobry wieczór!", ro: "Bună seara!", a: "Dobry wieczór!" },
    { q: "Do widzenia!", ro: "La revedere!", a: "Do widzenia! / Na razie!" }
  ],
  2: [
    { q: "Jak masz na imię?", ro: "Cum te cheamă?", a: "Mam na imię …" },
    { q: "Skąd jesteś?", ro: "De unde ești?", a: "Jestem z Rumunii." },
    { q: "Gdzie mieszkasz?", ro: "Unde locuiești?", a: "Mieszkam tutaj. / Mieszkam w Polsce." },
    { q: "Mówisz po polsku?", ro: "Vorbești poloneză?", a: "Trochę." },
    { q: "Rozumiesz?", ro: "Înțelegi?", a: "Tak. / Nie rozumiem. Powoli, proszę." }
  ],
  3: [
    { q: "Policz do dziesięciu!", ro: "Numără până la zece!", a: "Jeden, dwa, trzy … dziesięć." },
    { q: "Ile to jest dwa plus trzy?", ro: "Cât fac doi plus trei?", a: "Pięć." },
    { q: "Ile? (arată câteva degete)", ro: "Câte?", a: "Cztery. / Siedem. …" },
    { q: "Jaki masz numer telefonu?", ro: "Ce număr de telefon ai?", a: "Cifră cu cifră: pięć, sześć …" },
    { q: "Ile to jest dziesięć minus jeden?", ro: "Cât fac zece minus unu?", a: "Dziewięć." }
  ],
  4: [
    { q: "Dzień dobry, co podać?", ro: "Bună ziua, ce să vă dau?", a: "Poproszę chleb." },
    { q: "Coś jeszcze?", ro: "Altceva?", a: "Poproszę mleko. / To wszystko." },
    { q: "(ea întreabă prețul)", ro: "Întreabă: Cât costă?", a: "Ile to kosztuje?" },
    { q: "Kartą czy gotówką?", ro: "Cu cardul sau cash?", a: "Kartą. / Gotówką." },
    { q: "Dziękuję, do widzenia!", ro: "Mulțumesc, la revedere!", a: "Dziękuję, do widzenia!" }
  ],
  5: [
    { q: "Kto to jest? (arată spre fiică)", ro: "Cine e aceasta?", a: "To jest moja córka." },
    { q: "Masz brata?", ro: "Ai un frate?", a: "Tak. / Nie." },
    { q: "Masz siostrę?", ro: "Ai o soră?", a: "Tak. / Nie." },
    { q: "Kto to jest? (arată spre el)", ro: "Cine e acesta?", a: "To jest mój mąż. / mój partner." },
    { q: "Twoja rodzina jest w Rumunii?", ro: "Familia ta e în România?", a: "Tak. / Mama i tata są w Rumunii." }
  ],
  6: [
    { q: "Dzień dobry! (el e educatoarea)", ro: "Bună ziua!", a: "Dzień dobry! Jak było dzisiaj?" },
    { q: "Dobrze. Zjadła cały obiad.", ro: "Bine. A mâncat tot prânzul.", a: "Super! Dziękuję." },
    { q: "Jutro idziemy na spacer.", ro: "Mâine mergem la plimbare.", a: "Dobrze. Do jutra!" },
    { q: "(dimineața, fetița e bolnavă)", ro: "Spune-i educatoarei că fiica e bolnavă.", a: "Córka jest chora." },
    { q: "Wszystko w porządku?", ro: "E totul în regulă?", a: "Tak, dziękuję!" }
  ],
  7: [
    { q: "Dzień dobry, co dla pani?", ro: "Bună ziua, ce doriți?", a: "Poproszę dwie bułki i kawę." },
    { q: "Na miejscu czy na wynos?", ro: "Aici sau la pachet?", a: "Na wynos. / Na miejscu." },
    { q: "Herbata czy kawa?", ro: "Ceai sau cafea?", a: "Poproszę herbatę. / Poproszę kawę." },
    { q: "Dziesięć złotych.", ro: "Zece zloți.", a: "Proszę. (îi dai banii)" },
    { q: "Miłego dnia!", ro: "O zi bună!", a: "Dziękuję, nawzajem!" }
  ]
};
