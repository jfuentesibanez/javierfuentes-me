// Registro de comandos. Cada comando recibe (args, term) donde `term` es la API
// del motor de terminal (js/terminal.js). Los comandos pueden ser async.

import { STRINGS } from "./i18n.js";

// --- Comandos visibles (aparecen en `help`) ---

async function about(_args, term) {
  await term.typeLines(term.content.about[term.lang]);
}

async function interests(_args, term) {
  await term.typeLines(term.content.interests[term.lang]);
}

async function publications(_args, term) {
  await term.typeLines(term.content.publications[term.lang]);
}

async function contact(_args, term) {
  await term.typeLines(term.content.contact[term.lang]);
}

function help(_args, term) {
  const t = STRINGS[term.lang];
  term.println(t.helpTitle, "bright");
  const pad = Math.max(...t.help.map(([c]) => c.length)) + 2;
  for (const [cmd, desc] of t.help) {
    term.println("  " + cmd.padEnd(pad) + desc);
  }
  term.println("");
  term.println(t.helpHint, "muted");
  term.println("");
}

async function ask(args, term) {
  const t = STRINGS[term.lang];
  const question = args.join(" ").trim();
  if (!question) {
    term.println(t.askUsage, "muted");
    return;
  }
  await term.streamAsk(question);
}

function clear(_args, term) {
  term.clear();
}

function lang(args, term) {
  const t = STRINGS[term.lang];
  const target = (args[0] || "").toLowerCase();
  if (target === "es" || target === "en") {
    term.setLang(target);
    term.println(STRINGS[target].langSet(target), "muted");
  } else {
    term.setLang(term.lang === "es" ? "en" : "es");
    term.println(STRINGS[term.lang].langSet(term.lang), "muted");
  }
}

function theme(args, term) {
  const t = STRINGS[term.lang];
  const target = (args[0] || "").toLowerCase();
  if (target === "green" || target === "amber") {
    term.setTheme(target);
    term.println(t.themeSet(target), "muted");
  } else {
    term.println(t.themeUsage, "muted");
  }
}

// --- Easter eggs (ocultos, no salen en `help`) ---

function coffee(_args, term) {
  term.println(
    term.lang === "en"
      ? "☕❌ plot twist: Javier never drinks coffee. this machine runs on pure curiosity. try 'fortune'."
      : "☕❌ giro de guion: Javier nunca toma cafe. esta maquina funciona a pura curiosidad. prueba 'fortune'.",
    "bright"
  );
}

function sudo(args, term) {
  const joined = args.join(" ").toLowerCase();
  if (joined.includes("coffee")) {
    return coffee(args, term);
  } else {
    term.println("we trust you have received the usual lecture from the", "muted");
    term.println("local System Administrator. password:", "muted");
    term.println("");
    term.println("Sorry, try again. (this is a website, not your shell)");
  }
}

async function matrix(_args, term) {
  await term.matrixRain();
}

const SECTIONS = ["about", "interests", "publications", "contact"];

// Ficheros "ocultos" para la caza del tesoro (se ven con `ls -a`).
const DOTFILES = {
  ".secret": {
    es: [
      "# .secret",
      "Construir cosas es la mejor forma de entender el futuro.",
      "Has llegado lejos. Ultima pista: el sprint nunca acaba. prueba 'xyzzy'.",
    ],
    en: [
      "# .secret",
      "Building things is the best way to understand the future.",
      "You've come far. Last clue: the sprint never ends. try 'xyzzy'.",
    ],
  },
  ".bashrc": {
    es: [
      "# ~/.bashrc",
      "alias coffee='echo \"Javier no toma cafe\"'   # de verdad, nunca",
      "alias think='ask'",
      "# tip: hay comandos sin documentar -> neofetch, tree, fortune, cowsay, hack",
      "# y un viejo truco de consola: el codigo Konami ↑↑↓↓←→←→ B A",
    ],
    en: [
      "# ~/.bashrc",
      "alias coffee='echo \"Javier never drinks coffee\"'   # really, never",
      "alias think='ask'",
      "# tip: there are undocumented commands -> neofetch, tree, fortune, cowsay, hack",
      "# and an old console trick: the Konami code ↑↑↓↓←→←→ B A",
    ],
  },
  ".ssh/id_rsa": {
    es: ["nice try. mis claves no viven en una web :)"],
    en: ["nice try. my keys don't live on a website :)"],
  },
};

function ls(args, term) {
  const all = args.includes("-a") || args.includes("-la") || args.includes("-al");
  if (all) {
    term.println(".  ..  .bashrc  .secret  .ssh", "muted");
  }
  term.println("about  interests  publications  contact  secret.txt", "muted");
}

function cat(args, term) {
  const raw = (args[0] || "").toLowerCase();
  const f = raw.replace(/\.txt$/, "");
  if (raw === "secret.txt") {
    term.println("la mejor IA es la que te devuelve tiempo, no la que te lo roba.", "bright");
  } else if (DOTFILES[raw]) {
    term.printLines(DOTFILES[raw][term.lang] || DOTFILES[raw].es, "bright");
  } else if (SECTIONS.includes(f)) {
    return COMMANDS[f]([], term);
  } else if (raw) {
    term.println(`cat: ${args[0]}: No such file or directory`, "error");
  } else {
    term.println("usage: cat <file>", "muted");
  }
}

async function cd(args, term) {
  const target = (args[0] || "").toLowerCase().replace(/\/$/, "");
  if (!target || target === "~" || target === ".." || target === "/" || target === ".") {
    term.println(
      term.lang === "en"
        ? "you're already home. there's only one directory here :)"
        : "ya estas en casa. aqui solo hay un directorio :)",
      "muted"
    );
    return;
  }
  if (SECTIONS.includes(target)) {
    return COMMANDS[target]([], term);
  }
  term.println(`cd: ${args[0]}: No such file or directory`, "error");
}

function exit(_args, term) {
  term.println("nice try 🙂  (no hay salida de la matrix)");
}

// Easter eggs tematicos (sacados de la newsletter The Independent Sentinel).
const FACTS = {
  jevons: {
    es: "Paradoja de Jevons: cuanto mas eficiente es usar un recurso, mas se consume. Spoiler: con la IA esta pasando justo eso.",
    en: "Jevons paradox: the more efficient a resource gets, the more we consume it. Spoiler: it's happening with AI right now.",
  },
  navier: {
    es: "Navier-Stokes: uno de los 7 problemas del milenio. Describimos el agua... pero no sabemos demostrar que la descripcion siempre funciona.",
    en: "Navier-Stokes: one of the 7 millennium problems. We can describe water... but can't prove the description always holds.",
  },
  pompeya: {
    es: "Pompeya quedo congelada en un instante. A veces la tecnologia hace lo mismo: fija un momento para siempre.",
    en: "Pompeii was frozen in an instant. Technology sometimes does the same: it pins a moment forever.",
  },
  sentinel: {
    es: "Escribo The Independent Sentinel: IA, curiosidades e historias. -> https://theindependentsentinel.substack.com",
    en: "I write The Independent Sentinel: AI, curiosities and stories. -> https://theindependentsentinel.substack.com",
  },
  codeback: {
    es: "Codeback Software (2013): mi primera empresa. Todo empezo escribiendo codigo.",
    en: "Codeback Software (2013): my first company. It all started by writing code.",
  },
  akoios: {
    es: "Akoios: una de las startups que cofunde, llevando modelos a produccion.",
    en: "Akoios: one of the startups I co-founded, taking models to production.",
  },
};

function fact(name) {
  return (_args, term) => term.println(FACTS[name][term.lang] || FACTS[name].es, "bright");
}

function vibe(_args, term) {
  term.println(
    term.lang === "en"
      ? "vibe coding detected. this whole terminal was built that way. 🛠️"
      : "vibe coding detectado. esta terminal se construyo asi. 🛠️",
    "bright"
  );
}

function echo(args, term) {
  term.println(args.join(" "));
}

// --- Comandos "de sistema" ocultos (para hackers curiosos) ---

function pwd(_args, term) {
  term.println("/home/javier", "muted");
}

function date_(_args, term) {
  term.println(new Date().toString());
}

function uname(args, term) {
  if (args.includes("-a")) {
    term.println("JavierOS 4.8 phosphor x86_64 GNU/Curiosity #1 SMP retro");
  } else {
    term.println("JavierOS");
  }
}

function uptime(_args, term) {
  term.println(
    term.lang === "en"
      ? " up 20+ years,  1 user,  load average: ideas, curiosity, momentum"
      : " up 20+ anos,  1 usuario,  carga media: ideas, curiosidad, impulso",
    "muted"
  );
}

function id_(_args, term) {
  term.println("uid=1000(javier) gid=1000(builders) groups=ai,defense,startups,teaching", "muted");
}

function history_(_args, term) {
  if (!term.history.length) {
    term.println(term.lang === "en" ? "(no history yet)" : "(historial vacio)", "muted");
    return;
  }
  term.history.forEach((h, i) => term.println(String(i + 1).padStart(4) + "  " + h));
}

function tree(_args, term) {
  term.printLines([
    ".",
    "├── about",
    "├── interests",
    "├── publications",
    "├── contact",
    "└── secret.txt",
  ]);
}

function neofetch(_args, term) {
  const c = term.content || {};
  const lines = [
    "        _.-._        javier@javierfuentes.me",
    "       / \\_/ \\       -----------------------",
    "       >-(_)-<       OS:      JavierOS 4.8 \"phosphor\"",
    "       \\_/ \\_/       Host:    javierfuentes.me",
    "        `-'-'        Shell:   js-sh 1.0",
    "                     Uptime:  20+ years in tech",
    "                     CPU:     curiosity-powered (no coffee, ever)",
    "                     Memory:  enough / plenty",
    "                     Role:    AI consultant @ N Company",
    "                     Theme:   green phosphor",
  ];
  term.printLines(lines, "bright");
}

const FORTUNES = {
  es: [
    "La mejor IA es la que te devuelve tiempo, no la que te lo roba.",
    "Innovar no es tener ideas; es reducir la incertidumbre antes de invertir.",
    "Paradoja de Jevons: cuanto mas eficiente es un recurso, mas se consume.",
    "No automatices el caos. Primero entiende el proceso, luego acelera.",
    "El futuro ya esta aqui; solo hay que rediseñar los procesos a su alrededor.",
    "Construir cosas es la mejor forma de entender el futuro.",
  ],
  en: [
    "The best AI is the one that gives you time back, not the one that steals it.",
    "Innovation isn't having ideas; it's reducing uncertainty before you invest.",
    "Jevons paradox: the more efficient a resource, the more we consume it.",
    "Don't automate chaos. Understand the process first, then accelerate.",
    "The future is already here; you just have to redesign processes around it.",
    "Building things is the best way to understand the future.",
  ],
};

function fortune(_args, term) {
  const arr = FORTUNES[term.lang] || FORTUNES.es;
  term.println("“" + arr[Math.floor(Math.random() * arr.length)] + "”", "bright");
}

function cowsay(args, term) {
  const arr = FORTUNES[term.lang] || FORTUNES.es;
  const msg = args.join(" ").trim() || arr[Math.floor(Math.random() * arr.length)];
  const top = " " + "_".repeat(msg.length + 2);
  const bot = " " + "-".repeat(msg.length + 2);
  term.printLines([
    top,
    "< " + msg + " >",
    bot,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ]);
}

async function hack(_args, term) {
  term.println(
    term.lang === "en" ? "HACK THE PLANET! 🌍" : "HACK THE PLANET! 🌍",
    "bright"
  );
  await term.matrixRain();
  term.println(
    term.lang === "en"
      ? "...just kidding. the only thing getting hacked here is your curiosity."
      : "...es broma. lo unico que se hackea aqui es tu curiosidad.",
    "muted"
  );
}

function ping(args, term) {
  const host = args[0] || "javierfuentes.me";
  term.println(`PING ${host}: 56 data bytes`, "muted");
  term.println(`64 bytes from ${host}: icmp_seq=0 ttl=42 time=0.042 ms`, "muted");
  term.println(term.lang === "en" ? "pong 🏓" : "pong 🏓", "bright");
}

function rm(args, term) {
  const joined = args.join(" ");
  if (joined.includes("-rf") || joined.includes("/")) {
    term.println(
      term.lang === "en"
        ? "rm: 'whew, that was close'. nothing was deleted. it's just a website :)"
        : "rm: 'uf, por poco'. no se borro nada. es solo una web :)",
      "muted"
    );
  } else {
    term.println("rm: " + (args[0] || "") + ": Operation not permitted", "error");
  }
}

function xyzzy(_args, term) {
  term.printLines(
    term.lang === "en"
      ? [
          "A hollow voice says: 'the infinite sprint continues...'",
          "🏆 Achievement unlocked: TRUE HACKER. You found the end of the rabbit hole.",
          "Now go build something. And maybe read the newsletter: theindependentsentinel.substack.com",
        ]
      : [
          "Una voz cavernosa dice: 'el sprint infinito continua...'",
          "🏆 Logro desbloqueado: HACKER DE VERDAD. Encontraste el final de la madriguera.",
          "Ahora ve a construir algo. Y quiza lee la newsletter: theindependentsentinel.substack.com",
        ],
    "bright"
  );
}

const MAN = {
  ask: "ask <pregunta> — pregunta cualquier cosa sobre Javier al bot (IA).",
  about: "about — quien es Javier. alias: whoami.",
  ls: "ls [-a] — lista las secciones. con -a, tambien las ocultas.",
  cd: "cd <seccion> — entra en una seccion (about, interests, ...).",
  fortune: "fortune — una frase al azar.",
  hack: "hack — definitely hacks the planet.",
};

function man(args, term) {
  const c = (args[0] || "").toLowerCase();
  if (!c) {
    term.println(term.lang === "en" ? "What manual page do you want?" : "Que pagina de manual quieres?", "muted");
    return;
  }
  if (MAN[c]) {
    term.println(MAN[c]);
  } else if (COMMANDS[c]) {
    term.println(
      term.lang === "en"
        ? `${c} — a command best understood by running it.`
        : `${c} — un comando que se entiende mejor ejecutandolo.`,
      "muted"
    );
  } else {
    term.println(`No manual entry for ${args[0]}`, "error");
  }
}

// --- Registro + alias ---

export const COMMANDS = {
  help,
  about,
  whoami: about,
  interests,
  publications,
  writing: publications,
  contact,
  ask,
  clear,
  lang,
  theme,
  // easter eggs
  sudo,
  matrix,
  ls,
  cat,
  cd,
  exit,
  echo,
  // easter eggs tematicos (newsletter)
  jevons: fact("jevons"),
  navier: fact("navier"),
  "navier-stokes": fact("navier"),
  pompeya: fact("pompeya"),
  pompeii: fact("pompeya"),
  sentinel: fact("sentinel"),
  newsletter: fact("sentinel"),
  codeback: fact("codeback"),
  akoios: fact("akoios"),
  vibe,
  // comandos de sistema ocultos
  pwd,
  date: date_,
  uname,
  uptime,
  id: id_,
  history: history_,
  tree,
  neofetch,
  fortune,
  cowsay,
  hack,
  ping,
  rm,
  man,
  xyzzy,
  coffee,
};

// Comandos que aparecen en autocompletado y sugerencias "did you mean".
export const PUBLIC_COMMANDS = [
  "help",
  "about",
  "whoami",
  "interests",
  "publications",
  "writing",
  "ask",
  "contact",
  "lang",
  "theme",
  "clear",
];
