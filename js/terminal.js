import { COMMANDS, PUBLIC_COMMANDS } from "./commands.js";
import { STRINGS, detectLang } from "./i18n.js";

const $ = (id) => document.getElementById(id);
const screen = $("screen");
const output = $("output");
const inputLine = $("input-line");
const inputMirror = $("input-mirror");
const cmdline = $("cmdline");
const promptEl = $("prompt");
const crt = $("crt");

const term = {
  lang: detectLang(),
  content: null,
  history: [],
  histIdx: -1,
  busy: false,
  skipTyping: false,
};

// ---------- utilidades de impresion ----------

function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function linkify(text) {
  let html = escapeHtml(text);
  // URLs
  html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  // emails
  html = html.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    '<a href="mailto:$1">$1</a>'
  );
  return html;
}

function newLine(cls) {
  const div = document.createElement("div");
  div.className = "line" + (cls ? " " + cls : "");
  output.appendChild(div);
  return div;
}

term.println = function (text = "", cls) {
  const div = newLine(cls);
  div.innerHTML = linkify(text);
  scrollDown();
  return div;
};

term.printLines = function (lines, cls) {
  for (const l of lines) term.println(l, cls);
};

function scrollDown() {
  screen.scrollTop = screen.scrollHeight;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Imprime lineas con efecto "typing", saltable con cualquier tecla.
term.typeLines = async function (lines, cls) {
  term.skipTyping = false;
  for (const line of lines) {
    const div = newLine(cls);
    if (term.skipTyping || line.length === 0) {
      div.innerHTML = linkify(line);
      scrollDown();
      continue;
    }
    for (let i = 0; i < line.length; i++) {
      div.textContent += line[i];
      scrollDown();
      if (term.skipTyping) {
        div.textContent = line;
        break;
      }
      // mas rapido en espacios y signos
      await sleep(line[i] === " " ? 4 : 9);
    }
    div.innerHTML = linkify(div.textContent);
    scrollDown();
  }
};

term.clear = function () {
  output.innerHTML = "";
};

// ---------- idioma y tema ----------

term.setLang = function (l) {
  term.lang = l;
  localStorage.setItem("lang", l);
  document.documentElement.lang = l;
};

term.setTheme = function (t) {
  if (t === "amber") crt.classList.add("amber");
  else crt.classList.remove("amber");
  localStorage.setItem("theme", t);
};

// ---------- bot (streaming) ----------

term.streamAsk = async function (question) {
  const t = STRINGS[term.lang];
  // indicador "pensando..."
  const thinkingEl = term.println(t.thinking + "...", "muted");
  let dots = 0;
  const timer = setInterval(() => {
    dots = (dots + 1) % 4;
    thinkingEl.textContent = t.thinking + ".".repeat(dots);
  }, 350);

  try {
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang: term.lang }),
    });

    clearInterval(timer);
    thinkingEl.remove();

    if (!res.ok || !res.body) {
      term.println(t.botError, "error");
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const div = newLine("bright");
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      div.textContent = buf;
      scrollDown();
    }
    div.innerHTML = linkify(buf);
    scrollDown();
  } catch (e) {
    clearInterval(timer);
    thinkingEl.remove();
    term.println(t.botError, "error");
  }
};

// ---------- easter egg: lluvia matrix ----------

term.matrixRain = async function () {
  const cols = 40;
  const rows = 14;
  const chars = "01アイウエカキ$#%&JAVIER<>/\\";
  const grid = newLine("bright");
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      line += chars[Math.floor((Math.sin(r * c + r) + 1) * chars.length) % chars.length] || " ";
    }
    grid.textContent += line + "\n";
    scrollDown();
    await sleep(60);
  }
  await sleep(400);
  grid.remove();
};

// ---------- ejecucion de comandos ----------

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
  return d[m][n];
}

function suggest(cmd) {
  let best = null, bestD = 99;
  for (const c of PUBLIC_COMMANDS) {
    const dd = levenshtein(cmd, c);
    if (dd < bestD) { bestD = dd; best = c; }
  }
  return bestD <= 2 ? best : null;
}

async function run(raw) {
  const t = STRINGS[term.lang];
  const line = raw.trim();
  // eco del comando en pantalla
  const echo = newLine();
  echo.innerHTML =
    '<span class="prompt">' + promptEl.innerHTML + "</span>" + escapeHtml(raw);
  scrollDown();

  if (!line) return;
  term.history.push(raw);
  term.histIdx = term.history.length;

  const [cmd, ...args] = line.split(/\s+/);
  const handler = COMMANDS[cmd.toLowerCase()];
  if (!handler) {
    term.println(t.notFound(cmd), "error");
    const s = suggest(cmd.toLowerCase());
    if (s) term.println(t.didYouMean(s), "muted");
    return;
  }
  await handler(args, term);
}

// ---------- entrada de teclado ----------

function refreshMirror() {
  inputMirror.textContent = cmdline.value;
}

function focusInput() {
  cmdline.focus();
}

document.addEventListener("click", focusInput);
cmdline.addEventListener("input", refreshMirror);

cmdline.addEventListener("keydown", async (e) => {
  // saltar el efecto typing con cualquier tecla mientras escribe
  if (term.busy) {
    term.skipTyping = true;
    if (e.key === "c" && e.ctrlKey) {
      // permitir Ctrl+C aunque este busy
    } else {
      e.preventDefault();
      return;
    }
  }

  if (e.key === "Enter") {
    e.preventDefault();
    const raw = cmdline.value;
    cmdline.value = "";
    refreshMirror();
    inputLine.classList.add("hidden");
    term.busy = true;
    try {
      await run(raw);
    } finally {
      term.busy = false;
      inputLine.classList.remove("hidden");
      scrollDown();
      focusInput();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (term.histIdx > 0) {
      term.histIdx--;
      cmdline.value = term.history[term.histIdx] || "";
      refreshMirror();
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (term.histIdx < term.history.length - 1) {
      term.histIdx++;
      cmdline.value = term.history[term.histIdx] || "";
    } else {
      term.histIdx = term.history.length;
      cmdline.value = "";
    }
    refreshMirror();
  } else if (e.key === "Tab") {
    e.preventDefault();
    const v = cmdline.value.trim();
    if (v) {
      const matches = PUBLIC_COMMANDS.filter((c) => c.startsWith(v));
      if (matches.length === 1) {
        cmdline.value = matches[0] + " ";
        refreshMirror();
      } else if (matches.length > 1) {
        term.println(matches.join("  "), "muted");
      }
    }
  } else if (e.key === "c" && e.ctrlKey) {
    e.preventDefault();
    term.println(promptEl.textContent + cmdline.value + STRINGS[term.lang].interrupted);
    cmdline.value = "";
    refreshMirror();
  } else if (e.key === "l" && e.ctrlKey) {
    e.preventDefault();
    term.clear();
  }
});

// ---------- codigo Konami ----------

const KONAMI = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
let konamiPos = 0;
document.addEventListener("keydown", (e) => {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (key === KONAMI[konamiPos]) {
    konamiPos++;
    if (konamiPos === KONAMI.length) {
      konamiPos = 0;
      crt.classList.toggle("amber");
      term.println(
        term.lang === "en"
          ? "🎮 KONAMI CODE ACCEPTED — god mode. (now try 'xyzzy')"
          : "🎮 CODIGO KONAMI ACEPTADO — god mode. (ahora prueba 'xyzzy')",
        "bright"
      );
      scrollDown();
    }
  } else {
    konamiPos = key === KONAMI[0] ? 1 : 0;
  }
});

// ---------- arranque ----------

async function boot() {
  document.documentElement.lang = term.lang;
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "amber") crt.classList.add("amber");

  // cargar contenido
  try {
    const res = await fetch("/content/javier.json");
    term.content = await res.json();
  } catch (e) {
    term.content = { about: { es: ["(error cargando contenido)"], en: ["(content load error)"] } };
  }

  const t = STRINGS[term.lang];
  inputLine.classList.add("hidden");
  term.busy = true;

  // secuencia de boot rapida
  for (const l of t.booting) {
    term.println(l, "muted");
    await sleep(70);
  }
  await sleep(150);
  await term.typeLines(t.welcome);

  term.busy = false;
  inputLine.classList.remove("hidden");
  focusInput();
}

boot();
