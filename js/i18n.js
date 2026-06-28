// Cadenas de interfaz (no de contenido) en ES/EN.
export const STRINGS = {
  es: {
    booting: [
      "NCompany BIOS v4.8 — POST",
      "  CPU ........... Javier Fuentes [OK]",
      "  RAM ........... cafeina suficiente [OK]",
      "  GPU ........... imaginacion [OK]",
      "  loading personality matrix ........ OK",
      "  mounting /interests /publications /bot ... OK",
      "",
    ],
    welcome: [
      "Bienvenido a javierfuentes.me",
      "",
      "Escribe 'help' para ver los comandos. Prueba 'ask <tu pregunta>' para",
      "preguntarle cualquier cosa al bot sobre mi.",
      "",
    ],
    helpTitle: "Comandos disponibles:",
    helpHint: "psst... hay mas comandos de los que se listan aqui. los hackers de verdad exploran. prueba 'ls -a', 'neofetch', 'fortune'...",
    help: [
      ["help", "muestra esta ayuda"],
      ["about", "quien soy (alias: whoami)"],
      ["interests", "mis intereses"],
      ["publications", "mis publicaciones y charlas (alias: writing)"],
      ["ask <pregunta>", "preguntale al bot sobre mi"],
      ["contact", "como contactarme"],
      ["lang [es|en]", "cambia el idioma"],
      ["theme [green|amber]", "cambia el color del fosforo"],
      ["clear", "limpia la pantalla"],
    ],
    notFound: (cmd) => `command not found: ${cmd}`,
    didYouMean: (s) => `  quiza querias decir '${s}'?`,
    askUsage: "uso: ask <tu pregunta>   p.ej.  ask que hace Javier en NCompany?",
    thinking: "pensando",
    botError:
      "El bot no esta disponible ahora mismo. Intentalo de nuevo en un momento.",
    langSet: (l) => `idioma cambiado a ${l === "es" ? "espanol" : "ingles"}`,
    themeSet: (t) => `tema cambiado a ${t}`,
    themeUsage: "uso: theme [green|amber]",
    interrupted: "^C",
  },
  en: {
    booting: [
      "NCompany BIOS v4.8 — POST",
      "  CPU ........... Javier Fuentes [OK]",
      "  RAM ........... enough caffeine [OK]",
      "  GPU ........... imagination [OK]",
      "  loading personality matrix ........ OK",
      "  mounting /interests /publications /bot ... OK",
      "",
    ],
    welcome: [
      "Welcome to javierfuentes.me",
      "",
      "Type 'help' to see the commands. Try 'ask <your question>' to ask",
      "the bot anything about me.",
      "",
    ],
    helpTitle: "Available commands:",
    helpHint: "psst... there are more commands than the ones listed here. real hackers explore. try 'ls -a', 'neofetch', 'fortune'...",
    help: [
      ["help", "show this help"],
      ["about", "who I am (alias: whoami)"],
      ["interests", "my interests"],
      ["publications", "my writing and talks (alias: writing)"],
      ["ask <question>", "ask the bot about me"],
      ["contact", "how to reach me"],
      ["lang [es|en]", "switch language"],
      ["theme [green|amber]", "switch phosphor color"],
      ["clear", "clear the screen"],
    ],
    notFound: (cmd) => `command not found: ${cmd}`,
    didYouMean: (s) => `  did you mean '${s}'?`,
    askUsage: "usage: ask <your question>   e.g.  ask what does Javier do at NCompany?",
    thinking: "thinking",
    botError: "The bot is unavailable right now. Please try again in a moment.",
    langSet: (l) => `language set to ${l === "es" ? "Spanish" : "English"}`,
    themeSet: (t) => `theme set to ${t}`,
    themeUsage: "usage: theme [green|amber]",
    interrupted: "^C",
  },
};

export function detectLang() {
  const stored = localStorage.getItem("lang");
  if (stored === "es" || stored === "en") return stored;
  const nav = (navigator.language || "es").toLowerCase();
  return nav.startsWith("es") ? "es" : "en";
}
