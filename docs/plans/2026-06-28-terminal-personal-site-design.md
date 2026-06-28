# javierfuentes.me — Diseño de la web personal (terminal CRT fósforo verde)

Fecha: 2026-06-28
Autor: Javier Fuentes (con Claude Code)

## Contexto

La web anterior (Replit, sin repo en GitHub) se perdió. Se reconstruye desde cero,
esta vez con repo en condiciones y deploy automático. Recupera el espíritu de la
original: una **terminal CRT de fósforo verde** con información sobre Javier
(bio, intereses, publicaciones) y un **bot integrado** al que se le puede preguntar
cualquier cosa sobre él. Dialoga con la marca de empresa (ncompany.es) sin copiarla:
la personal es el "rincón hacker" de Javier.

## Decisiones (brainstorming)

- **Estética:** fósforo verde puro. CRT con scanlines, glow, flicker, cursor parpadeante.
- **Interacción:** CLI real — el visitante teclea comandos (`about`, `ask ...`, etc.).
- **Bot:** Claude (Anthropic). Modelo por defecto `claude-haiku-4-5` (barato/rápido para Q&A de bio), configurable por env.
- **Hosting:** Vercel. Deploy automático desde GitHub + función serverless para esconder la API key.
- **Idioma:** bilingüe ES/EN con comando `lang` y autodetección.
- **Comandos:** help, about/whoami, interests, publications/writing, ask, contact, lang, clear, theme + easter eggs.

## Arquitectura

```
javierfuentes.me (Vercel)
├─ Frontend estático (sin framework, vanilla JS)
│  ├─ index.html            la "pantalla" CRT
│  ├─ css/crt.css           fósforo verde, scanlines, glow, flicker
│  ├─ js/terminal.js        motor CLI (input, historial, autocompletado, typing)
│  ├─ js/commands.js        implementación de cada comando
│  ├─ js/i18n.js            cadenas de interfaz ES/EN
│  └─ content/javier.json   datos (bio, intereses, publicaciones, contacto) bilingües
└─ Backend serverless
   └─ api/ask.js            llama a Claude; ANTHROPIC_API_KEY como env var
```

Vanilla JS porque una terminal es manipulación directa de texto/foco; un framework
estorba, pesa más y complica el efecto retro. Control total y carga instantánea.

## Terminal CRT

- Fondo negro, texto `#33ff33` (fósforo P1). Tema `amber` opcional como easter egg.
- Scanlines, text-glow, flicker leve, cursor `█` parpadeante.
- Tipografía monoespaciada: `VT323` (Google Fonts) con fallback a monoespaciada del sistema.
- Prompt: `javier@javierfuentes.me:~$`.
- Boot al cargar: secuencia tipo POST + banner ASCII con el nombre + hint `type 'help'`.
- Efecto typing en respuestas (saltable con tecla).
- Responsive: terminal a pantalla completa en móvil, input fijo abajo.

## Comandos

| Comando | Acción |
|---|---|
| `help` | Lista de comandos |
| `about` / `whoami` | Bio |
| `interests` | Intereses |
| `publications` / `writing` | Publicaciones con enlaces |
| `ask <pregunta>` | Bot Claude (streaming) |
| `contact` | Email + redes |
| `lang [es\|en]` | Cambia idioma |
| `clear` | Limpia pantalla |
| `theme [green\|amber]` | Cambia fósforo |

Utilidades: historial ↑/↓, autocompletado `Tab`, `Ctrl+C` cancela, "command not found"
con sugerencia.

Easter eggs (ocultos): `sudo make me a coffee`, `matrix`, `ls`/`cat secret.txt`,
`exit`, Konami code.

## Bot (`ask`)

- Frontend: `POST /api/ask` con `{question, lang}` → respuesta en streaming, impresa con typing.
- Backend (`api/ask.js`, Node + `@anthropic-ai/sdk`):
  - Modelo `claude-haiku-4-5` (env `BOT_MODEL`).
  - System prompt construido desde `content/javier.json`: responde como asistente que
    conoce a Javier, en el idioma pedido, tono retro; si no sabe, lo dice (no inventa).
  - Guardarraíles: límite de longitud, rechazo amable de off-topic, rate-limit básico por IP.
  - API key en `ANTHROPIC_API_KEY` (env de Vercel; nunca en el repo).

## Contenido (pendiente de confirmar con Javier)

- `about`: consultor de IA / socio en NCompany (Madrid); keynotes y formación; clientes BBVA, Mapfre, Telefónica.
- `interests`: por confirmar.
- `publications`: newsletters NCompany + charlas — faltan enlaces.
- `contact`: javier@ncompany.es, ncompany.es, + LinkedIn/X/GitHub (handles por confirmar).

## Plan de construcción

1. Repo + git + estructura + package.json / vercel.json / .gitignore.
2. Terminal CRT (HTML/CSS): pantalla, scanlines, glow, boot.
3. Motor CLI (input, historial, autocompletado, typing).
4. Comandos + contenido bilingüe + easter eggs.
5. Backend api/ask.js con Claude (+ .env.example).
6. README con deploy a Vercel y configuración del dominio javierfuentes.me.
