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

function sudo(args, term) {
  const joined = args.join(" ").toLowerCase();
  if (joined.includes("coffee")) {
    term.println("☕ permission denied: you are not root (but nice try)");
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

function ls(_args, term) {
  term.println("about  interests  publications  contact  secret.txt", "muted");
}

function cat(args, term) {
  const f = (args[0] || "").toLowerCase();
  if (f === "secret.txt") {
    term.println("la mejor IA es la que te devuelve tiempo, no la que te lo roba.", "bright");
  } else if (f) {
    term.println(`cat: ${args[0]}: No such file or directory`, "error");
  } else {
    term.println("usage: cat <file>", "muted");
  }
}

function exit(_args, term) {
  term.println("nice try 🙂  (no hay salida de la matrix)");
}

function echo(args, term) {
  term.println(args.join(" "));
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
  exit,
  echo,
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
