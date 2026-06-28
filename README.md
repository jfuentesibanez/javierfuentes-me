# javierfuentes.me

Web personal de **Javier Fuentes** — una terminal CRT de fósforo verde con bio,
intereses, publicaciones y un bot (Claude) al que se le puede preguntar cualquier
cosa sobre Javier.

Frontend estático (vanilla JS, sin framework) + una función serverless que llama a
la API de Anthropic escondiendo la clave.

## Estructura

```
index.html            la "pantalla" CRT
css/crt.css           fósforo verde, scanlines, glow, flicker
js/terminal.js        motor de la CLI (input, historial, autocompletado, typing)
js/commands.js        cada comando (about, interests, ask, ...)
js/i18n.js            cadenas de interfaz ES/EN
content/javier.json   tus datos (bio, intereses, publicaciones, contacto), bilingüe
api/ask.js            función serverless: bot con Claude (streaming)
docs/plans/           documento de diseño
```

## Comandos de la terminal

`help`, `about`/`whoami`, `interests`, `publications`/`writing`, `ask <pregunta>`,
`contact`, `lang [es|en]`, `theme [green|amber]`, `clear`.
Hay algún easter egg escondido. ↑/↓ recorren el historial, `Tab` autocompleta.

## Desarrollo local

Requiere [Node](https://nodejs.org) y la CLI de Vercel (`npm i -g vercel`).

```bash
npm install
cp .env.example .env.local      # y pon tu ANTHROPIC_API_KEY
vercel dev                       # sirve frontend + la función /api/ask
```

Abre http://localhost:3000

> Solo para ver el frontend sin el bot, vale cualquier servidor estático
> (p.ej. `npx serve .`), pero `ask` necesita la función serverless de `vercel dev`.

## Despliegue (Vercel + GitHub)

1. Crea un repo en GitHub y sube esto:
   ```bash
   git add -A && git commit -m "..."   # ya inicializado
   git branch -M main
   git remote add origin git@github.com:<tu-usuario>/javierfuentes-me.git
   git push -u origin main
   ```
2. En [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. En **Settings → Environment Variables** añade:
   - `ANTHROPIC_API_KEY` = tu clave de https://console.anthropic.com
   - (opcional) `BOT_MODEL` = `claude-haiku-4-5` (por defecto), o `claude-sonnet-4-6`.
4. Deploy. Cada `git push` a `main` vuelve a desplegar automáticamente.

## Dominio javierfuentes.me

En Vercel → **Settings → Domains** → añade `javierfuentes.me` y sigue las
instrucciones de DNS (un registro `A`/`CNAME` en tu proveedor de dominio).

## El bot

`api/ask.js` construye el system prompt a partir de `content/javier.json`, así que
**para mejorar lo que sabe el bot basta con editar ese JSON** (no hace falta tocar
código). El modelo es configurable con la variable `BOT_MODEL`.

## Pendiente de rellenar (busca `PENDIENTE`/`TODO` en `content/javier.json`)

- Intereses reales.
- Enlaces de las publicaciones / newsletters / charlas.
- Handles de LinkedIn, X y GitHub.
