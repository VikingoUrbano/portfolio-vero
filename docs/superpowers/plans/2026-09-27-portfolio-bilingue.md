# Portfolio bilingüe de Verónica Ramírez — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el sitio bilingüe estático de Verónica Ramírez, verificable localmente, y dejarlo listo para desplegar en Netlify.

**Architecture:** HTML y CSS estáticos sin paso de compilación. Tres páginas de contenido (`/`, `/es/`, `/en/`) y dos de confirmación, una hoja de tokens compartidos, una de maquetación, y un archivo de JavaScript para detección de idioma, navegación móvil y envío del formulario. Netlify Forms como único back-end. Verificación automatizada con Node sin dependencias y Chrome headless de Windows.

**Tech Stack:** HTML5, CSS3 (custom properties, Grid, Flexbox), JavaScript vanilla, Netlify Forms, Node 22 para las herramientas de verificación, Chrome headless para las pruebas de maquetación.

**Spec:** `docs/superpowers/specs/2026-09-27-portfolio-bilingue-design.md`

---

## Global Constraints

- **Sin framework, sin bundler, sin gestor de contenidos, sin paso de compilación.** El sitio se sirve tal cual está en el repositorio.
- **Sin dependencias de npm.** Las herramientas de verificación usan solo módulos nativos de Node 22 y nada más. `node_modules/` no debe aparecer nunca.
- **Las fotos van sin convertir:** JPEG tal cual, sin EXIF ni WebP. `assets/img/`.
- **Fuentes alojadas en el propio sitio:** cuatro archivos woff2 (latin y latin-ext de Inter y de Fraunces) más el texto de la licencia OFL.
- **`assets/styles.css` no existe.** El CSS se divide en `assets/tokens.css` (variables, fuentes, reset, tipografía base) y `assets/layout.css` (componentes y responsive). Las dos páginas enlazan ambos.
- **Los identificadores de sección son los mismos en español y en inglés:** `inicio`, `servicios`, `presupuesto`, `sobre-mi`, `credenciales`, `contacto`.
- **Las URLs de las imágenes y los scripts son relativas**, con `assets/` a la raíz del dominio, para que funcionen igual en local y en producción.
- **Ningún texto del sitio se genera con traducción automática.** La versión inglesa se escribe de forma nativa.
- **El sitio no menciona la asignatura, la entrega, la nota ni el docente.** Las credenciales propias sí se publican.
- **Paleta exacta:** fondo `#FBF9F6`, texto `#1F2933`, acento `#0F766E`. Si la prueba de contraste rechaza el acento, se oscurece y se actualizan las tres apariciones.
- **Las fotos no se pueden ver desde la sesión de implementación** (el modelo no tiene visión). Su colocación la confirma la titular en el navegador.

## Review Focus

Cinco modos de fallo que la especificación implica pero que ninguna prueba de tarea exercise por omisión. Cada uno tiene su prueba asignada a la tarea que posee el código.

1. **El autocompletado del navegador rellena el campo trampa del formulario y Netlify descarta la solicitud de un cliente real.** Un campo invisible de tipo texto es exactamente lo que los gestores de contraseñas y el autocompletado del navegador rellenan solos. Quien pide un presupuesto y nunca recibe respuesta se entera por la ausencia de noticias. Prueba: en la tarea 7, el primer control enfocable del formulario es el campo visible de nombre, y el campo trampa lleva `autocomplete="off"` y un `name` que ningún gestor reconoce.
2. **El texto inglés es más largo que el español y `/en/` se desborda en horizontal a 360 px.** Es el defecto más frecuente en sitios bilingües. Prueba: en la tarea 6, medición de desbordamiento horizontal en `/en/` a 360 px y a 320 px con el contenido definitivo.
3. **Doble envío por un doble clic o una conexión inestable**, y el cliente recibe dos presupuestos. Prueba: en la tarea 7, un segundo clic mientras la petición está en vuelo no lanza una segunda llamada.
4. **JavaScript deshabilitado**: no hay forma de cambiar de idioma y el formulario pierde su confirmación. Prueba: en la tarea 7, la página renderizada con scripts desactivados conserva los botones de idioma, el `action` del formulario y los campos con sus valores.
5. **Un texto muy largo escrito por el visitante rompe la maqueta**, y un teléfono de 320 px de ancho la rompe por completo. Prueba: en la tarea 6, se inyecta una cadena de 200 caracteres en el área de comentarios y se vuelve a medir el desbordamiento a 320 px.

---

## Estructura de archivos

```
portfolio-vero/
├── index.html                      raíz: selector de idioma
├── netlify.toml
├── sitemap.xml
├── robots.txt
├── favicon.svg
├── es/
│   ├── index.html                  página de contenido
│   └── confirmacion.html
├── en/
│   ├── index.html                  página de contenido
│   └── confirmation.html
├── assets/
│   ├── tokens.css
│   ├── layout.css
│   ├── main.js
│   ├── fonts/                      4 woff2 + OFL.txt
│   └── img/                        2 fotos + 2 tarjetas sociales
└── tools/
    ├── contrast.mjs                cálculo WCAG, sin dependencias
    ├── contrast.test.mjs
    ├── check.html                  arnés de aserciones en navegador
    └── social-card.html            plantilla 1200x630
```

Cada archivo tiene una responsabilidad única. `tools/` no se despliega en producción más allá de lo inofensivo que es: no hay referencias a él desde el sitio, así que nunca se descarga.

---

### Tarea 1: Contraste WCAG

**Archivos:**
- Crear: `tools/contrast.mjs`
- Crear: `tools/contrast.test.mjs`

**Interfaces:**
- Consume: nada
- Produce: `contrastRatio(hexA: string, hexB: string): number` y `wcagAA(hexA: string, hexB: string, size: "normal" | "large"): boolean`, exportadas desde `tools/contrast.mjs`. `wcagAA` toma `"large"` para texto de 18.66 px o más, o de 14 px en negrita, y aplica 3:1; en otro caso aplica 4.5:1. Ambas aceptan `#RRGGBB` con o sin almohadilla, en mayúsculas o minúsculas, y lanzan si el valor no es un color hexadecimal válido.

- [ ] **Paso 1: Escribir la prueba que falla**

`tools/contrast.test.mjs`, con `import { test } from "node:test"` y `import assert from "node:assert/strict"`. Siete casos:

```js
test("blanco sobre negro es 21:1", () =>
  assert.equal(contrastRatio("#ffffff", "#000000"), 21));

test("un color contra sí mismo es 1:1", () =>
  assert.equal(contrastRatio("#0F766E", "#0F766E"), 1));

test("acepta la almohadilla opcional", () =>
  assert.equal(contrastRatio("0F766E", "#FBF9F6"), contrastRatio("#0F766E", "#FBF9F6")));

test("no distingue mayúsculas de minúsculas", () =>
  assert.equal(contrastRatio("#0f766e", "#fbf9f6"), contrastRatio("#0F766E", "#FBF9F6")));

test("rechaza un valor que no es hexadecimal", () =>
  assert.throws(() => contrastRatio("#0F766", "#000000")));

test("wcagAA con texto normal exige 4.5:1", () =>
  assert.equal(wcagAA("#0F766E", "#FBF9F6", "normal"), false));

test("wcagAA con texto grande exige 3:1", () =>
  assert.equal(wcagAA("#0F766E", "#FBF9F6", "large"), true));
```

Los dos últimos casos son el umbral de la paleta del sitio: el verde petróleo **no llega a 4.5:1 sobre crema, pero sí a 3:1**. Esa prueba es la que decide si el acento se puede usar en texto pequeño.

- [ ] **Paso 2: Ejecutar para verificar que falla**

Run: `node --test tools/contrast.test.mjs`
Expected: FALLA con `Cannot find module .../tools/contrast.mjs`.

- [ ] **Paso 3: Implementar en `tools/contrast.mjs`**

`parseHex(hex: string): [number, number, number]` valida con `/^#?[0-9a-fA-F]{6}$/` y lanza `Error` si no coincide. `luminance([r, g, b])` devuelve el valor WCAG: normalizar cada canal a `[0, 1]`, y si el canal es mayor que `0.03928` elevarlo a la potencia `2.4`, si no dividirlo por `12.92`; devolver `0.2126 * r + 0.7152 * g + 0.0722 * b`. `contrastRatio` devuelve `((max + 0.05) / (min + 0.05))` sobre las luminancias. `wcagAA` compara contra `4.5` o `3` según el tamaño.

- [ ] **Paso 4: Ejecutar para verificar que pasa**

Run: `node --test tools/contrast.test.mjs`
Expected: PASA, 7 de 7.

- [ ] **Paso 5: Medir la paleta real e informar**

Run: `node --input-type=module -e "import {contrastRatio} from './tools/contrast.mjs'; for (const [a,b,etq] of [['#0F766E','#FBF9F6','acento sobre crema'],['#1F2933','#FBF9F6','texto sobre crema'],['#FFFFFF','#0F766E','blanco sobre acento']]) console.log(etq, contrastRatio(a,b).toFixed(2))"`

Expected: texto sobre crema en torno a 13:1 y blanco sobre acento en torno a 5:1, ambos por encima del umbral. El acento sobre crema queda por debajo de 4.5:1, lo que significa que **el verde petróleo no se usa en texto de cuerpo**: se usa para enlaces underlines, líneas y elementos de tamaño grande. Si la medición real difiere de estos valores, se registra y se decide antes de escribir el CSS de la tarea 3.

- [ ] **Paso 6: Commitar**

```bash
git add tools/contrast.mjs tools/contrast.test.mjs
git commit -m "test: add WCAG contrast calculator and pin the site palette to it"
```

---

### Tarea 2: Arnés de verificación en navegador

**Archivos:**
- Crear: `tools/check.html`

**Interfaces:**
- Consume: la tarea 1 no aporta nada aquí; el arnés se apoya en `window.__CHECK__` para inyectar medidas.
- Produce: una página que recibe la lista de páginas a verificar por la cadena de consulta `?p=/es/index.html&w=360&js=1` y escribe un bloque `<pre id="resultado">` con una línea `PASS` o `FAIL` por aserción. La ejecuta Chrome headless con `--dump-dom` y se lee con `grep`.

**Por qué esta tarea va segunda:** es el instrumento con el que se revisa todo lo demás. Sin él, las tareas 4 a 8 no tienen forma de demostrar nada.

- [ ] **Paso 1: Escribir el arnés**

`tools/check.html`, un archivo autónomo. Estructura:

```html
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Verificación</title></head>
<body>
<pre id="resultado">ejecutando</pre>
<script type="module">
const params = new URLSearchParams(location.search);
const ruta   = params.get("p") || "/es/index.html";
const ancho  = Number(params.get("w") || 360);
const lineas = [];

const ok = (nombre, cond, detalle = "") =>
  lineas.push(`${cond ? "PASS" : "FAIL"} ${nombre}${detalle ? " :: " + detalle : ""}`);

const doc = await (await fetch(ruta)).text();
const d = new DOMParser().parseFromString(doc, "text/html");

// --- aserciones de estructura, sobre el documento analizado ---
ok("lang correcto", d.documentElement.lang === "es" || d.documentElement.lang === "en",
   d.documentElement.lang);
ok("un solo h1", d.querySelectorAll("h1").length === 1,
   String(d.querySelectorAll("h1").length));
ok("h1 no vacio", (d.querySelector("h1")?.textContent || "").trim().length > 0);
const niveles = [...d.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(e => +e.tagName[1]);
ok("la jerarquia de encabezados no salta de nivel",
   niveles.every((n, i) => i === 0 || n - niveles[i - 1] <= 1), niveles.join(">"));
ok("sin h1 duplicado por id", new Set([...d.querySelectorAll("[id]")].map(e => e.id)).size
   === d.querySelectorAll("[id]").length);
ok("todo img tiene alt", [...d.querySelectorAll("img")].every(i => i.hasAttribute("alt")));
ok("todo img tiene width y height", [...d.querySelectorAll("img")]
   .every(i => i.hasAttribute("width") && i.hasAttribute("height")));
ok("todo input y textarea tiene label", [...d.querySelectorAll("input:not([type=hidden]), textarea, select")]
   .every(c => d.querySelector(`label[for="${c.id}"]`) || c.getAttribute("aria-label")));
ok("sin href vacio", ![...d.querySelectorAll("a")].some(a => a.getAttribute("href") === ""));
ok("sin target=_blank sin rel", [...d.querySelectorAll('a[target="_blank"]')]
   .every(a => (a.getAttribute("rel") || "").includes("noopener")));

// --- aserciones de red: cada href y src local existe ---
const base = new URL(ruta, location.origin);
const rutas = [...d.querySelectorAll("[href], [src]")]
  .map(e => e.getAttribute("href") || e.getAttribute("src"))
  .filter(v => v && !/^(https?:|mailto:|tel:|#|data:)/.test(v));
const rotas = [];
for (const r of rutas) {
  const u = new URL(r, base);
  const destino = u.pathname.endsWith("/") ? u.pathname + "index.html" : u.pathname;
  const res = await fetch(destino, { method: "GET" });
  if (!res.ok) rotas.push(`${r} (HTTP ${res.status})`);
}
ok("todos los recursos locales existen", rotas.length === 0, rotas.join("; "));

// --- aserciones de maquetacion, en un iframe del ancho pedido ---
const marco = document.createElement("iframe");
marco.style.cssText = `width:${ancho}px;height:900px;border:0;position:absolute;left:-9999px`;
marco.src = ruta;
document.body.appendChild(marco);
await new Promise(r => (marco.onload = r));
await new Promise(r => setTimeout(r, 400));   // deja asentar las fuentes

const v = marco.contentDocument.documentElement;
ok(`sin desbordamiento horizontal a ${ancho}px`,
   v.scrollWidth <= v.clientWidth + 1, `${v.scrollWidth} > ${v.clientWidth}`);

ok("ningun texto se sale del viewport", [...marco.contentDocument.querySelectorAll("body *")]
   .filter(e => e.getBoundingClientRect().right > ancho + 1)
   .slice(0, 3).map(e => e.tagName + "." + e.className).join("; ") === "",
   [...marco.contentDocument.querySelectorAll("body *")]
     .filter(e => e.getBoundingClientRect().right > ancho + 1)
     .slice(0, 3).map(e => `${e.tagName}.${e.className}`).join("; "));

// la altura del documento no puede ser cero: si el CSS fallo, el iframe esta vacio
ok("la pagina renderiza contenido", v.scrollHeight > 400, String(v.scrollHeight));

document.getElementById("resultado").textContent =
  "RESULTADO\n" + lineas.join("\n") + "\nFIN";
</script>
</body>
</html>
```

- [ ] **Paso 2: Probar el arnés contra una página trivial**

Levantar un servidor y comprobar que devuelve líneas PASS y no se queda en "ejecutando":

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
nohup python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1 &
sleep 1
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --no-sandbox --virtual-time-budget=8000 --window-size=400,900 \
  --dump-dom "http://localhost:8000/tools/check.html?p=/index.html&w=360" 2>/dev/null \
  | sed -n '/RESULTADO/,/FIN/p'
```

Expected: un bloque con líneas `PASS`/`FAIL` terminado en `FIN`. En esta tarea el resultado importa `FAIL`, porque `index.html` todavía no existe; lo que se verifica es que el arnés **responde** y no se cuelga.

- [ ] **Paso 3: Probar el arnés con los scripts desactivados**

Repetir el comando anterior añadiendo `--blink-settings=scriptEnabled=false`.

Expected: no aparece el bloque `RESULTADO`. Esa es la comprobación de que la flag sirve, y se usa en la tarea 7 para probar la degradación sin JavaScript.

- [ ] **Paso 4: Commitar**

```bash
git add tools/check.html
git commit -m "test: add browser assertion harness for structure, assets and overflow"
```

---

### Tarea 3: Fuentes, tokens y tipografía base

**Archivos:**
- Crear: `assets/tokens.css`
- Crear: `assets/fonts/inter-latin.woff2`, `assets/fonts/inter-latin-ext.woff2`, `assets/fonts/fraunces-latin.woff2`, `assets/fonts/fraunces-latin-ext.woff2`, `assets/fonts/OFL.txt`

**Interfaces:**
- Consume: el resultado medido de `contrastRatio` de la tarea 1.
- Produce: en `assets/tokens.css`, las propiedades personalizadas `--fondo`, `--texto`, `--acento`, `--texto-suave`, `--error`, `--borde`, `--ancho-maximo`, `--serif`, `--sans`. Cualquier tarea posterior usa solo estas variables y no escribe colores ni tamaños de fuente literales.

- [ ] **Paso 1: Descargar las cuatro fuentes**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
mkdir -p assets/fonts
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
for f in "inter|Inter:wght@400..700" "fraunces|Fraunces:opsz,wght,SOFT,WONK@9..144,100..900,0..100,0..1"; do
  nombre="${f%%|*}"; familia="${f#*|}"
  css=$(curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=${familia}&display=swap")
  for sub in latin latin-ext; do
    url=$(printf '%s' "$css" | tr -d '\n' \
      | sed 's|/\* \([a-z-]*\) \*/|@\1@|g' \
      | grep -o "@${sub}@{[^@]*}" | head -1 \
      | grep -o 'https://[^)]*\.woff2')
    curl -s -o "assets/fonts/${nombre}-${sub}.woff2" "$url"
  done
done
ls -la assets/fonts/
```

Expected: cuatro archivos `.woff2` de entre 15 y 90 KB cada uno. Un archivo de menos de 5 KB significa que el `sed` no extrajo la URL correcta y hay que rehacerlo: el filtro por subconjunto es la parte frágil de este paso.

- [ ] **Paso 2: Verificar que los woff2 son reales**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
for f in assets/fonts/*.woff2; do
  printf "%-40s " "$f"; head -c 4 "$f" | od -c | head -1
done
```

Expected: cada archivo empieza con la firma `wOF2` (bytes `77 4f 46 32`). Si alguno empieza con `<` o con texto HTML, la descarga falló y devolvió una página de error.

- [ ] **Paso 3: Descargar la licencia**

```bash
curl -s -o assets/fonts/OFL.txt "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/OFL.txt"
head -3 assets/fonts/OFL.txt
```

Expected: empieza con `Copyright 2016 The Inter Project Authors`. Inter y Fraunces comparten la misma licencia SIL Open Font License 1.1, así que un solo archivo la cubre, pero se deja nota en el `README.md` del repositorio indicando las dos familias.

- [ ] **Paso 4: Escribir `assets/tokens.css`**

Declarar primero las cuatro reglas `@font-face`, una por archivo, todas con `font-display: swap`:

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("fonts/inter-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
```

`inter-latin.woff2` lleva el rango `U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`. Fraunces usa los mismos dos conjuntos, y su regla declara `font-weight: 100 900` más `font-stretch` y los ejes `SOFT` y `WONK` mediante `font-variation-settings` en la regla de la variable, no en la de fuente.

Después, el bloque `:root` con estas variables exactas:

```css
:root {
  --fondo: #FBF9F6;
  --texto: #1F2933;
  --acento: #0F766E;
  --texto-suave: #52606D;
  --error: #B3261E;
  --borde: #E4E0DA;
  --ancho-maximo: 68rem;

  --serif: "Fraunces", Georgia, "Times New Roman", serif;
  --sans: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

Y el reset: `box-sizing: border-box` universal, `margin: 0` en `body`, `img { max-width: 100%; height: auto; display: block }`, `:focus-visible { outline: 2px solid var(--acento); outline-offset: 3px }`, y la tipografía base `body { font-family: var(--sans); font-size: 1.0625rem; line-height: 1.65; color: var(--texto); background: var(--fondo) }`. Los encabezados usan `var(--serif)` con `line-height: 1.15` y `font-weight: 600`.

**Restricción del paso 5 de la tarea 1:** `--acento` no se usa en texto de cuerpo en ninguna regla de este archivo, porque la medición dio menos de 4.5:1. Solo en elementos de 1.17rem o más, en subrayados, y en bordes.

- [ ] **Paso 5: Commitar**

```bash
git add assets/tokens.css assets/fonts
git commit -m "feat: self-hosted Fraunces and Inter with the verified palette as tokens"
```

---

### Tarea 4: Página española

**Archivos:**
- Crear: `es/index.html`

**Interfaces:**
- Consume: los nombres de variables de `assets/tokens.css` (solo al escribir CSS; esta tarea es markup).
- Produce: un documento con los identificadores `inicio`, `servicios`, `presupuesto`, `sobre-mi`, `credenciales`, `contacto`, y un formulario cuyo `name` es `presupuesto` y cuyo `action` es `/es/confirmacion.html`. La tarea 6 y la 7 enlazan contra esos nombres.

- [ ] **Paso 1: Escribir el documento completo**

`es/index.html`, con `<!DOCTYPE html>`, `<html lang="es">`, `<meta charset="utf-8">`, `<meta name="viewport" content="width=device-width, initial-scale=1">`, `<title>Verónica Ramírez · Traductora e intérprete de inglés</title>`, la descripción, y en el `<head>` las tres etiquetas `hreflang` alternas más `x-default` apuntando a `https://veronicaramirez.netlify.app/es/`, más `og:*` y `twitter:card`, más los dos `<link rel="stylesheet" href="/assets/tokens.css">` y `/assets/layout.css`, más `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.

**Contenido exacto.** Encabezado de salto, primer elemento del `<body>`: `Saltar al contenido principal`, con `href="#inicio"`.

Navegación, `<nav aria-label="Principal">`, con la marca a la izquierda y a la derecha el selector de idioma y un botón de menú que solo existe en el CSS como botón visible en móvil. Enlaces de sección a `#servicios`, `#presupuesto`, `#sobre-mi`, `#credenciales`. El selector de idioma es un enlace a `/en/#inicio` con el texto `English`.

Portada, `<section id="inicio">`:

```html
<h1>Verónica Ramírez</h1>
<p class="inicio-oficio">Traductora e intérprete de inglés</p>
<p class="inicio-resumen">Traducción, subtitulado, localización e interpretación entre español e
inglés. Certificación C2 en inglés por la University of Michigan y cuarto año del Traductorado
Público, Literario y Científico-Técnico de Inglés.</p>
<p class="inicio-acciones">
  <a class="boton" href="#presupuesto">Solicitar presupuesto</a>
  <a class="enlace-suave" href="mailto:vero22ramm@gmail.com">Escríbime</a>
</p>
<p class="inicio-lugar">Rosario, Santa Fe, Argentina</p>
```

Servicios, `<section id="servicios">` con `<h2>Servicios</h2>` y cinco `<article class="servicio">`, cada uno con `<h3>` y un párrafo:

- *Traducción general* — «Textos generales entre español e inglés, con revisión de estilo y adaptación al público destinatario: artículos, correspondencia, material de marketing y documentación.»
- *Subtitulado y localización* — «Subtitulado de video y localización de contenido audiovisual y digital, con ajuste de tiempos, consistencia de tono y adaptación de referencias culturales.»
- *Traducción técnica y científica* — «Textos técnicos, científicos y de investigación, con investigación terminológica y consistencia de la terminología del sector a lo largo de todo el documento.»
- *Traducción jurada* — «Traducciones juradas para los trámites legales, académicos y administrativos que las requieren.»
- *Interpretación* — «Interpretación simultánea y consecutiva en español e inglés.»

Solicitar presupuesto, `<section id="presupuesto">` con `<h2>Solicitar presupuesto</h2>`, un párrafo de introducción, y el formulario. Cada campo lleva su `<label for>` y un `id` propio: `nombre`, `email`, `servicio`, `volumen`, `fecha`, `comentarios`, más los ocultos `form-name` e `idioma`, más el campo trampa con `name="sitio-web"`, `autocomplete="off"`, `tabindex="-1"` y `aria-hidden="true"`, envuelto en un `<p class="trampa">` que el CSS saca de la vista con posicionamiento, **no** con `display: none`. El `<textarea>` lleva `rows="6"`. El botón es `<button type="submit" class="boton">Enviar solicitud</button>`. Junto al botón, un `<p class="form-estado" role="status" aria-live="polite">` vacío, que es donde el JavaScript escribe el resultado.

El `select` de volumen lleva estas seis opciones, con `value` en minúsculas y sin acentos para que la comparación sea trivial: `hasta-1000`, `1000-5000`, `5000-20000`, `20000-100000`, `mas-100000`, `no-se`. El `select` de servicio lleva los cinco valores `general`, `subtitulado`, `tecnica`, `jurada`, `interpretacion`, y su primera opción es `Elegí un servicio` con `value=""` y `disabled selected`.

Sobre mí, `<section id="sobre-mi">` con `<h2>Sobre mí</h2>`, la foto en un `<figure>` con `width="400" height="400" loading="lazy" decoding="async" alt="Verónica Ramírez"`, y tres párrafos:

> Soy traductora e intérprete de inglés. Cursé el cuarto año del Traductorado Público, Literario y Científico-Técnico de Inglés del Instituto Belgrano, y tengo certificación C2 en inglés de la University of Michigan.
>
> Antes de dedicarme a la traducción pasé seis años estudiando inglés americano en A.R.I.C.A.N.A., y un año dando clases a hablantes nativos de español. Esa parte de enseñar me dejó algo que se sigue notando en el trabajo: una traducción no se entiende porque esté bien escrita, se entiende porque alguien la pueda usar.
>
> Me interesan los idiomas por el puente que levantan entre las culturas. Traducir no es cambiar una palabra por otra: es lograr que un texto signifique lo mismo para otra persona, en otro contexto. Eso es el trabajo.

Credenciales, `<section id="credenciales">` con `<h2>Credenciales</h2>` y tres bloques: **Certificaciones** (ECPE C2, Universidad de Michigan, diciembre 2024 – febrero 2025; ECCE C1, Universidad de Michigan, diciembre 2023 – febrero 2024), **Formación** (el Traductorado con la etiqueta explícita *en curso, finalización en diciembre de 2026*; Alemán A1, Ikaruga Escuela de Idiomas; Curso de Lengua Inglesa Americana, A.R.I.C.A.N.A., 2007–2013), y **Experiencia** (Alianza, profesor de inglés, enero – diciembre 2024, con las tres responsabilidades del CV resumidas en una línea). El Traductorado va en su propio bloque, separado de las certificaciones, con la fecha de finalización a la vista.

Pie, `<footer id="contacto">` con el email como enlace `mailto:`, el teléfono como `tel:+543417180942`, el LinkedIn como enlace externo con `rel="noopener"`, y la ubicación como texto.

- [ ] **Paso 2: Verificar la estructura con el arnés**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
"/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu \
  --no-sandbox --virtual-time-budget=8000 --dump-dom \
  "http://localhost:8000/tools/check.html?p=/es/index.html&w=360" 2>/dev/null \
  | sed -n '/RESULTADO/,/FIN/p' | grep -E 'FAIL|FIN'
```

Expected: los `FAIL` son solo de recursos inexistentes, porque `assets/layout.css`, `assets/main.js` y las imágenes todavía no están. **`lang`, `un solo h1`, `alt`, `width`/`height` y los `label` tienen que pasar todos.** Cualquier otro `FAIL` es un defecto del markup y se corrige antes de seguir.

- [ ] **Paso 3: Commitar**

```bash
git add es/index.html
git commit -m "feat: add the Spanish page with all six sections and the quote form"
```

---

### Tarea 5: Página inglesa

**Archivos:**
- Crear: `en/index.html`

**Interfaces:**
- Consume: los identificadores de sección de la tarea 4, que se reutilizan sin cambios.
- Produce: `/en/index.html`, con `lang="en"`, `hreflang` cruzados, y el mismo formulario con `action="/en/confirmation.html"` y el campo oculto `idioma` con valor `en`.

- [ ] **Paso 1: Escribir el documento completo**

Misma estructura, mismos identificadores, mismo orden de secciones, mismas clases. Todo el texto en inglés.

**Contenido exacto.** Encabezado de salto: `Skip to main content`. Navegación: `Main` como etiqueta, `Services`, `Request a quote`, `About me`, `Credentials`, y el selector de idioma como `Español` apuntando a `/es/#inicio`.

Portada:

```html
<h1>Verónica Ramírez</h1>
<p class="inicio-oficio">English and Spanish translator and interpreter</p>
<p class="inicio-resumen">Translation, subtitling, localization and interpreting between Spanish
and English. C2 certified in English by the University of Michigan, and in the final year of a
degree in Literary and Scientific-Technical Translation.</p>
<p class="inicio-acciones">
  <a class="boton" href="#presupuesto">Request a quote</a>
  <a class="enlace-suave" href="mailto:vero22ramm@gmail.com">Email me</a>
</p>
<p class="inicio-lugar">Rosario, Santa Fe, Argentina</p>
```

Servicios:

- *General translation* — «General texts between Spanish and English, edited for style and adapted to the reader: articles, correspondence, marketing copy and documentation.»
- *Subtitling and localization* — «Video subtitling and localization of audiovisual and digital content, with timing, consistent tone and adapted cultural references.»
- *Technical and scientific translation* — «Technical, scientific and research documents, with terminology research and consistent sector vocabulary throughout.»
- *Sworn translation* — «Sworn translations for the legal, academic and administrative proceedings that require them.»
- *Interpreting* — «Simultaneous and consecutive interpreting in Spanish and English.»

Formulario: `Request a quote`, con la introducción «Tell me what you need and I'll reply within two business days.», los campos *Name*, *Email*, *Service*, *Approximate volume*, *Deadline*, *Comments*, las mismas seis opciones de volumen en inglés, el botón `Send request`, y el párrafo de estado vacío con `role="status"`.

Sobre mí:

> I'm a translator and interpreter working between Spanish and English. I'm in the fourth and final year of a degree in Literary and Scientific-Technical Translation at the Instituto Belgrano, and I hold a C2 certification in English from the University of Michigan.
>
> Before moving into translation I spent six years studying American English at A.R.I.C.A.N.A., and a year teaching English to native Spanish speakers. Teaching taught me something that still shows in the work: a translation isn't clear because it's well written, it's clear because someone can actually use it.
>
> I care about languages because of the bridge they build between cultures. Translating isn't swapping one word for another — it's getting a text to mean the same thing to someone else, in a different context. That's the job.

Credenciales: **Certifications** (ECPE C2, University of Michigan, December 2024 – February 2025; ECCE C1, the same, December 2023 – February 2024), **Education** (the degree with the explicit label *in progress, completing December 2026*; German A1; American English course, A.R.I.C.A.N.A., 2007–2013), **Experience** (Alianza, English teacher, January – December 2024).

Pie: `Email`, `Phone`, `LinkedIn`, y `Rosario, Santa Fe, Argentina`.

**Regla de escritura, no negociable:** este texto no es la traducción del español. `Certificate of Proficiency in English` no se escribe como `Certificado de Aptitud`, porque no es su traducción: es el nombre del examen. Donde el español dice «Traductorado Público, Literario y Científico-Técnico de Inglés», el inglés describe lo mismo con sus propias palabras. Si una frase en inglés se siente como calcada, se reescribe.

- [ ] **Paso 2: Verificar la estructura con el arnés**

Repetir el comando de la tarea 4 con `p=/en/index.html`.

Expected: los mismos resultados que en español en cuanto a estructura, y `lang` ahora `en`.

- [ ] **Paso 3: Comprobar que no hay contaminación entre idiomas**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
grep -nP '[áéíóúñ¿¡]' en/index.html | grep -vP 'Ramírez|Rosario|Santa Fe' || echo "sin acentos españoles fuera de los nombres propios"
```

Expected: `sin acentos españoles fuera de los nombres propios`. Un acento español en `en/index.html` es un texto sin traducir.

- [ ] **Paso 4: Commitar**

```bash
git add en/index.html
git commit -m "feat: add the English page, natively written rather than translated"
```

---

### Tarea 6: Maquetación

**Archivos:**
- Crear: `assets/layout.css`

**Interfaces:**
- Consume: las variables de la tarea 3 y las clases usadas en las tareas 4 y 5.
- Produce: todos los estilos. La tarea 7 solo añade estilos al bloque `.trampa` y a `.form-estado`, que ya están definidos aquí como estados inicial y de error.

- [ ] **Paso 1: Escribir la base de la maqueta**

`assets/layout.css` empieza con el contenedor:

```css
.contenedor {
  width: 100%;
  max-width: var(--ancho-maximo);
  margin-inline: auto;
  padding-inline: clamp(1.25rem, 5vw, 3rem);
}
```

Y las secciones, que comparten un mismo ritmo vertical y un encabezado con el serif:

```css
section { padding-block: clamp(3rem, 8vw, 6rem); }
section + section { border-top: 1px solid var(--borde); }
h2 {
  font-family: var(--serif);
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 600;
  margin-bottom: 1.5rem;
}
```

- [ ] **Paso 2: La portada**

Rejilla de dos columnas en escritorio, una en móvil, con la foto a la derecha en `md` y arriba en `lg`. El nombre va en `clamp(2.5rem, 7vw, 4.5rem)` con el serif. El resumen en `1.25rem` y ancho máximo de 46 caracteres por línea. El botón principal es un subrayado grueso, no un relleno:

```css
.boton {
  display: inline-block;
  padding: 0.85rem 1.75rem;
  border: 1.5px solid var(--acento);
  border-radius: 2px;
  color: var(--acento);
  text-decoration: none;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
  font-family: var(--sans);
  font-size: 1.0625rem;
}
.boton:hover, .boton:focus-visible { background: var(--acento); color: #FBF9F6; }
```

La portada usa la fotografía panorámica de 1400 × 349 como franja a ancho completo bajo el texto, con `object-fit: cover` y una altura de `clamp(9rem, 22vw, 15rem)`. En móvil la franja se recorta más, nunca se deforma.

- [ ] **Paso 3: Servicios**

Rejilla de `repeat(auto-fit, minmax(16rem, 1fr))` con `gap: 2rem`. Cada `.servicio` es una tarjeta con borde inferior de 2 px en `--acento`, título en serif de `1.25rem` y párrafo en `--texto-suave`. Sin sombras, sin esquinas redondeadas grandes, sin degradados: la dirección visual es cálida y sobria.

- [ ] **Paso 4: El formulario**

`display: grid` con `grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))` y `gap: 1.25rem`. Los campos 1 y 2 ocupan media fila, el 3 y el 4 también, y el 5 y el 6 ocupan la fila completa con `grid-column: 1 / -1`. Cada etiqueta se muestra en vertical, en 0.875rem, con `color: var(--texto-suave)`. Los campos tienen `padding: 0.7rem 0.9rem`, `border: 1px solid var(--borde)`, `border-radius: 2px` y `background: #FFFFFF`.

```css
.trampa {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

Este bloque es importante: **el campo trampa se saca de la vista con posicionamiento, nunca con `display: none` ni `visibility: hidden`**, porque Netlify solo descarta el envío cuando el campo no está en el flujo de la página, y muchos robots completan los campos invisibles.

`.form-estado` arranca vacío y oculto con `min-height: 1.5rem` para que el texto de estado no salte la maqueta al aparecer. `.form-estado.error` en `var(--error)`, `.form-estado.exito` en `var(--acento)`. El botón deshabilitado lleva `opacity: 0.6` y `cursor: not-allowed`.

- [ ] **Paso 5: Sobre mí y credenciales**

Sobre mí, dos columnas: foto de 400 × 400 con `border-radius: 50%` y `max-width: 14rem` en escritorio, apilada y centrada en móvil. Los párrafos van con `max-width: 38rem` y `line-height: 1.7`.

Credenciales, tres bloques con `h3` en serif y una lista sin viñetas, con la línea de cada credencial en rejilla de dos columnas: `grid-template-columns: 1fr auto` para el rótulo y la fecha. El Traductorado, por ser el único bloque en curso, lleva un `border-left: 3px solid var(--acento)` y `padding-left: 1rem` para que se lea como un bloque destacado sin necesidad de una etiqueta de advertencia.

- [ ] **Paso 6: Navegación, pie y responsive**

La navegación es `position: sticky; top: 0` con fondo `--fondo` y `backdrop-filter: blur(8px)`, y una línea inferior de 1 px. En menos de 48rem de ancho, los enlaces de sección se ocultan y aparece un botón de menú que alterna la clase `.abierto` en la lista. En más de 48rem, el botón se oculta con `display: none` y la lista se muestra siempre en fila.

La dirección del responsive es **móvil primero**: los estilos base se escriben para la pantalla
mínima y cada ajuste vive en un `min-width`. Es lo que evita que se olvide un caso, porque un
bloque sin media query ya funciona en el móvil sin que nadie tenga que acordarse de adaptarlo.

```css
/* base: una columna, mobile */
.servicios { grid-template-columns: 1fr; }

/* ajuste: dos columnas desde 48rem hacia arriba */
@media (min-width: 48rem) {
  .servicios { grid-template-columns: repeat(2, 1fr); }
}
```

Ninguna regla usa `max-width`. La navegación es el único bloque que necesita lo contrario, y
por eso se invierte explícitamente allí: en lugar de ocultar la lista con `max-width`, el botón
de menú es `display: none` por defecto y aparece con `max-width: 48rem`. Ocultar por defecto es
lo que garantiza que sin CSS la lista de enlaces se vea y el sitio siga siendo navegable.

- [ ] **Paso 7: Verificar la maquetación con el arnés**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
CH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
for p in /es/index.html /en/index.html; do
  for w in 320 360 768 1440; do
    echo "--- $p a ${w}px"
    "$CH" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 \
      --window-size=1400,1000 --dump-dom \
      "http://localhost:8000/tools/check.html?p=${p}&w=${w}" 2>/dev/null \
      | sed -n '/RESULTADO/,/FIN/p' | grep -E 'FAIL|desbordamiento|ningun texto' 
  done
done
```

Expected: ninguna línea `FAIL` que mencione desbordamiento, texto fuera del viewport o contenido vacío.

En esta tarea los `FAIL` de recursos sí son esperables: las dos fotos y `assets/main.js` se crean en las tareas 7 y 8, así que las afirmaciones de imágenes y de script tienen que fallar. Lo que **no** puede fallar aquí es nada de lo visual, y la franja de la portada se mide sin su foto, con el alto del `clamp` puesto. La verificación completa de la franja con la imagen real ocurre en el paso 6 de la tarea 8.

- [ ] **Paso 8: Probar el texto largo, del punto 5 de Review Focus**

Añadir temporalmente al `en/index.html`, dentro del `textarea`, `value="A very long single line that a visitor might paste in, containing no spaces at all: translationlocalizationinterpretationsubtitlingcertifiedsworntechnicalscientificsimultaneousconsecutive"` y volver a medir a 320 px.

Expected: `sin desbordamiento horizontal a 320px`. Si falla, el culpable es casi siempre un elemento con un `width` fijo en lugar de `max-width`; se corrige en este archivo y se repite la medición. Después de la prueba, **se saca el texto temporal antes de commitear**.

- [ ] **Paso 9: Commitar**

```bash
git add assets/layout.css
git commit -m "feat: add responsive layout for all six sections"
```

---

### Tarea 7: Formulario, navegación y JavaScript

**Archivos:**
- Crear: `assets/main.js`
- Crear: `es/confirmacion.html`
- Crear: `en/confirmation.html`
- Modificar: `es/index.html` y `en/index.html`, para añadir `<script src="/assets/main.js" defer>` y el botón de menú

**Interfaces:**
- Consume: el formulario con `name="presupuesto"` de las tareas 4 y 5, y los identificadores de sección.
- Produce: `assets/main.js` sin exportaciones, un IIFE que hace las tres cosas. No expone API global.

- [ ] **Paso 1: Escribir `assets/main.js`**

Un solo IIFE, sin dependencias, con tres bloques independientes.

**Detección de idioma**, solo si `document.documentElement.lang` no está definido y la ruta es la raíz:

```js
const raiz = /^\/(index\.html)?$/.test(location.pathname);
if (raiz) {
  location.replace(/^es\b/i.test(navigator.language) ? "/es/" : "/en/");
}
```

`location.replace` y no `location.href`: con `href`, el botón "atrás" devuelve a la raíz, que redirige otra vez, y el visitante queda en un ciclo de dos clics.

**Navegación móvil**, por el botón `#menu`:

```js
const menu = document.getElementById("menu");
const lista = document.getElementById("menu-lista");
if (menu && lista) {
  menu.addEventListener("click", () => {
    const abierto = lista.classList.toggle("abierto");
    menu.setAttribute("aria-expanded", String(abierto));
  });
}
```

El botón lleva `aria-expanded="false"` y `aria-controls="menu-lista"` en el marcado de las dos páginas.

**Envío del formulario**, completo y sin omitir el `r.ok`:

```js
const form = document.querySelector('form[name="presupuesto"]');
if (form) {
  const estado = form.querySelector(".form-estado");
  const boton = form.querySelector('button[type="submit"]');
  let enVuelo = false;

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (enVuelo) return;
    enVuelo = true;
    boton.disabled = true;
    boton.textContent = boton.dataset.enviando;
    estado.className = "form-estado";
    estado.textContent = "";

    const cuerpo = new URLSearchParams(new FormData(form)).toString();

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: cuerpo
    })
      .then((r) => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        form.replaceWith(mensajeExito());
      })
      .catch(() => {
        estado.className = "form-estado error";
        estado.textContent =
          "No pude enviar el mensaje. Escribime a vero22ramm@gmail.com y lo vemos.";
      })
      .finally(() => {
        enVuelo = false;
        boton.disabled = false;
        boton.textContent = boton.dataset.original;
      });
  });
}

function mensajeExito() {
  const div = document.createElement("div");
  div.className = "form-exito";
  div.setAttribute("role", "status");
  div.innerHTML =
    "<h3>Mensaje enviado</h3><p>Gracias. Te respondo dentro de dos días hábiles.</p>";
  return div;
}
```

**Los cuatro errores que este diseño evita, y por qué cada uno importa:**

1. **El `fetch` va a `/`, no a `form.action`.** `action` es el destino del envío sin JavaScript. Un `fetch` a `/es/confirmacion.html` devuelve esa página con estado 200 aunque la entrega haya fallado, y el visitante ve un agradecimiento por un presupuesto que nunca llegó.
2. **Se comprueba `r.ok`.** Netlify devuelve estados que no son de éxito cuando rechaza un envío. Sin esta comprobación, el `catch` nunca se dispara y todo parece funcionar.
3. **La bandera `enVuelo` bloquea el segundo envío.** Un doble clic, o un segundo toque en un teléfono con la red lenta, no generan dos peticiones.
4. **El `catch` no borra los campos.** Los valores siguen en el DOM, así que el visitante no pierde lo que escribió. Solo `form.replaceWith` en el camino de éxito, y nunca con un `.reset()`.

- [ ] **Paso 2: Escribir las dos páginas de confirmación**

`es/confirmacion.html`: documento mínimo, `lang="es"`, que reutiliza `tokens.css` y `layout.css`, con un `<h1>Mensaje enviado</h1>` y «Gracias por escribirme. Te respondo dentro de dos días hábiles.» y un enlace de vuelta a `/es/#inicio`.

`en/confirmation.html`: el mismo documento con `lang="en"`, `<h1>Message sent</h1>`, «Thank you for writing. I'll reply within two business days.» y un enlace a `/en/#inicio`.

Ninguna de las dos declara `hreflang` alternas ni aparece en el `sitemap.xml`: son páginas de confirmación, no contenido.

- [ ] **Paso 3: Añadir el script y el botón de menú a las dos páginas**

En `es/index.html` y `en/index.html`, antes de `</body>`: `<script src="/assets/main.js" defer></script>`.

En la navegación, antes de la lista, un botón que solo se ve en móvil:

```html
<button id="menu" class="menu-boton" aria-expanded="false" aria-controls="menu-lista">
  <span class="visualmente-oculto">Menú</span>
  <span aria-hidden="true">☰</span>
</button>
```

Y a la `<ul>` que contiene los enlaces de sección, `id="menu-lista"`. La clase `visualmente-oculto` se define en `layout.css` con la técnica de recorte estándar: `position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%)`.

- [ ] **Paso 4: Probar el envío real, no un simulacro**

Hay una restricción que no se puede esquivar: **Netlify Forms no funciona en un servidor local**. El endpoint que captura el formulario se detecta en el despliegue. Así que el envío real se prueba después de desplegar, y es el punto de control de la tarea 8.

Lo que sí se verifica en local es el camino de error y la bandera `enVuelo`, con un arnés pequeño que sustituye `fetch` por una versión que rechaza, y otro que cuenta las llamadas.

- [ ] **Paso 5: Probar la degradación sin JavaScript**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
CH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CH" --headless=new --disable-gpu --no-sandbox --blink-settings=scriptEnabled=false \
  --virtual-time-budget=8000 --dump-dom "http://localhost:8000/es/index.html" 2>/dev/null \
  > /tmp/sin-js.html
grep -c 'action="/es/confirmacion.html"' /tmp/sin-js.html | sed 's/^/  action del formulario presente: /'
grep -c 'name="form-name" value="presupuesto"' /tmp/sin-js.html | sed 's/^/  form-name oculto presente: /'
grep -c '<h1' /tmp/sin-js.html | sed 's/^/  h1 presente: /'
```

Expected: los tres contadores en 1 o más. Un cero en cualquiera de los tres significa que sin JavaScript el formulario no se puede enviar, que es el punto 4 de Review Focus.

- [ ] **Paso 6: Probar que el primer control del formulario no es la trampa**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
python3 - <<'PY'
import re
for ruta in ("es/index.html", "en/index.html"):
    html = open(ruta, encoding="utf-8").read()
    bloque = re.search(r'<form[^>]*name="presupuesto".*?</form>', html, re.S).group(0)
    controles = re.findall(r'<(?:input|select|textarea)\b[^>]*>', bloque)
    visibles = [c for c in controles if 'type="hidden"' not in c]
    primero = visibles[0]
    trampa = 'name="sitio-web"' in primero
    print(f"  {ruta}: primero={re.search(r'name=.([a-z-]+)', primero).group(1)} "
          f"trampa_en_primero={trampa} autocomplete_off={'autocomplete=\"off\"' in bloque}")
PY
```

Expected: `trampa_en_primero=False` en las dos, y `autocomplete_off=True` en las dos. Es la prueba del punto 1 de Review Focus: si la trampa fuera el primer control, el autocompletado del navegador la llenaría y Netlify descartaría presupuestos de clientes reales.

- [ ] **Paso 7: Commitar**

```bash
git add assets/main.js es/confirmacion.html en/confirmation.html es/index.html en/index.html
git commit -m "feat: add language detection, mobile nav and the Netlify Forms submission contract"
```

---

### Tarea 8: Raíz, SEO, recursos y despliegue

**Archivos:**
- Crear: `index.html`, `netlify.toml`, `sitemap.xml`, `robots.txt`, `favicon.svg`
- Crear: `tools/social-card.html`
- Copiar: `recursos/veronica.jpg` → `assets/img/veronica-400.jpg`
- Copiar: `recursos/top.jpg` → `assets/img/portada-1400.jpg`
- Crear: `assets/img/social-es.png`, `assets/img/social-en.png`
- Modificar: `README.md`

**Interfaces:**
- Consume: todo lo anterior.
- Produce: el sitio completo, y un `README.md` que documenta los dos pasos manuales que quedan.

- [ ] **Paso 1: Copiar las dos imágenes**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
mkdir -p assets/img
cp recursos/veronica.jpg assets/img/veronica-400.jpg
cp recursos/top.jpg     assets/img/portada-1400.jpg
ls -la assets/img/
```

Se copian sin tocar: verificado que ninguna tiene bloque EXIF ni coordenadas GPS, y no hay herramienta de conversión. Los nombres llevan las dimensiones para que se vea que el archivo no se vuelve a cambiar nunca, y porque el `width` y el `height` del marcado tienen que coincidir con las dimensiones reales.

- [ ] **Paso 2: Escribir `index.html`, la raíz**

Página real, no una redirección. `lang="es"`, `<meta name="robots" content="noindex, follow">`, `canonical` a `https://veronicaramirez.netlify.app/es/`, los `hreflang` de `es`, `en` y `x-default`, `tokens.css` y `layout.css`, y `main.js`.

Cuerpo: el nombre, un texto de una línea, y dos botones grandes con `class="boton boton-grande"`, uno con `href="/es/"` que dice `Español` y otro con `href="/en/"` que dice `English`. Los botones son **enlaces**, no elementos `<div>` con manejadores: funcionan sin JavaScript, que es el punto entero de esta página.

- [ ] **Paso 3: Generar las dos tarjetas sociales**

`tools/social-card.html`, con variables en la URL: `?lang=es` y `?lang=en`. Cuerpo de exactamente 1200 × 630 px, con la misma crema, el mismo verde y el mismo Fraunces del sitio, el nombre en grande y el oficio debajo.

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
CH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
mkdir -p /mnt/c/_vero_shots
for lang in es en; do
  "$CH" --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
    --virtual-time-budget=6000 --window-size=1200,630 \
    --screenshot="C:\\_vero_shots\\social-${lang}.png" \
    "http://localhost:8000/tools/social-card.html?lang=${lang}" 2>/dev/null
  cp "/mnt/c/_vero_shots/social-${lang}.png" "assets/img/social-${lang}.png"
done
rm -rf /mnt/c/_vero_shots
ls -la assets/img/
```

Expected: dos PNG de 1200 × 630. **La ruta de salida tiene que ser de Windows** (`C:\...`), porque el proceso es un Chrome de Windows y no puede escribir en una ruta WSL: si se omite la conversión, falla con *Acceso denegado*.

- [ ] **Paso 4: Escribir `favicon.svg`**

Un SVG cuadrado con el fondo `#FBF9F6` y las iniciales **VR** en Fraunces o en un serif genérico, en `#0F766E`. El `rect` de fondo es obligatorio: sin él el favicon se ve como un cuadrado transparente en las pestañas claras.

- [ ] **Paso 5: Escribir `netlify.toml`, `sitemap.xml` y `robots.txt`**

`netlify.toml`, exactamente el contenido de la sección 5 de la especificación: sin comando de compilación, publicación en `.`, las cuatro cabeceras de seguridad, `immutable` de un año para `assets/fonts/` y `assets/img/`, y `no-cache` para `assets/tokens.css`, `assets/layout.css`, `assets/main.js`, `/es/` y `/en/`.

`sitemap.xml`, con las dos URL, `hreflang` alternos y `xhtml:link` de referencia cruzada, y `lastmod` con la fecha del despliegue.

`robots.txt` con `Allow: /`, la línea `Sitemap:` y nada más. **No lleva `Disallow: /`**: esa línea impediría leer el `noindex` de la raíz y la página quedaría indexada igual.

- [ ] **Paso 6: Verificación completa antes de commitear**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
CH="/mnt/c/Program Files/Google/Chrome/Application/chrome.exe"
fallos=0
for p in /index.html /es/index.html /en/index.html /es/confirmacion.html /en/confirmation.html; do
  for w in 320 768 1440; do
    out=$("$CH" --headless=new --disable-gpu --no-sandbox --virtual-time-budget=8000 \
      --window-size=1400,1000 --dump-dom \
      "http://localhost:8000/tools/check.html?p=${p}&w=${w}" 2>/dev/null \
      | sed -n '/RESULTADO/,/FIN/p')
    n=$(printf '%s' "$out" | grep -c '^FAIL' || true)
    printf "  %-26s %5spx  FAIL=%s\n" "$p" "$w" "$n"
    fallos=$((fallos + n))
  done
done
echo "TOTAL DE FALLOS: $fallos"
```

Expected: `TOTAL DE FALLOS: 0`.

- [ ] **Paso 7: Validar el HTML contra el validador de W3C**

```bash
cd /mnt/d/PROGRAMACION/VERO/portfolio-vero
for f in index.html es/index.html en/index.html es/confirmacion.html en/confirmation.html; do
  printf "%-26s " "$f"
  curl -s -H "Content-Type: text/html; charset=utf-8" --data-binary "@$f" \
    https://validator.w3.org/nu/?out=json \
    | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const m=JSON.parse(d).messages.filter(x=>x.type==='error');console.log(m.length===0?'valido':m.length+' errores: '+m.map(e=>e.message).join(' | '))})"
done
```

Expected: `valido` en las cinco. Los avisos que no son errores, como el `type` redundante en un `<button>`, se pueden ignorar; los errores no.

- [ ] **Paso 8: Actualizar el `README.md`**

Quitar los marcadores `_Pending_` del stack y del desarrollo local, y añadir una sección **Pasos manuales pendientes** con exactamente dos entradas:

1. En el panel de Netlify, *Forms → Notification settings*, poner `vero22ramm@gmail.com` como dirección de notificación del formulario `presupuesto`.
2. Después del primer despliegue, enviar un formulario de prueba de verdad y confirmar que el correo llega. **Un formulario que nunca se probó contra Netlify Forms es un formulario que no funciona, y no se sabe hasta que llega el primer cliente.**

- [ ] **Paso 9: Commitar**

```bash
git add -A
git commit -m "feat: add language chooser, SEO files, images and social cards"
```

- [ ] **Paso 10: Parar el servidor local y entregar**

```bash
pkill -f "http.server 8000"
git log --oneline -8
```

Y entregar a la titular: la dirección local, las tres tareas manuales del `README.md`, y la lista de lo que hay que mirar en el navegador, que es lo único que la implementación no puede verificar sola:

- que la foto de 400 × 400 no se vea suave en su pantalla,
- que la franja panorámica de la portada se recorte bien en móvil,
- que el inglés de `/en/` suene natural, porque esa es la revisión bloqueante de la especificación,
- que el formulario se vea bien con el teclado.

---

## Cobertura de la especificación

| Sección de la especificación | Tarea |
|---|---|
| 2 Sujeto, credenciales y datos | 4, 5 |
| 3 Servicios y encuadre de interpretación | 4, 5 |
| 3 Traducción jurada y calendario | 4, 5, bloque de formación separado |
| 4 Redacción, inglés nativo | 5, paso 3 |
| 4 Punto de control bloqueante | 8, paso 8 y la entrega final |
| 5 HTML estático, estructura de archivos | 4, 5, 8 |
| 5 `netlify.toml` | 8, paso 5 |
| 6 Detección de idioma, `location.replace` | 7, paso 1 |
| 6 `hreflang`, `noindex` en la raíz, sitemap | 8, pasos 2 y 5 |
| 6 Identificadores de sección en ambos idiomas | 4, 5 |
| 7 Paleta y contraste | 1, 3 |
| 7 Fuentes alojadas, `latin-ext`, OFL | 3 |
| 7 Open Graph, tarjetas sociales, favicon | 8, pasos 3 y 4 |
| 8 Orden de secciones | 4, 5 |
| 9 Campos del formulario | 4, 5 |
| 9 Contrato de envío AJAX | 7, paso 1 |
| 9 Honeypot sin autocompletado | 7, paso 6 |
| 9 Degradación sin JavaScript | 7, paso 5 |
| 9 Dirección de notificación | 8, paso 8 |
| 10 Manejo de errores | 6, paso 4 y 7, pasos 1 y 5 |
| 11 Recursos, fotos sin convertir | 8, paso 1 |
| 12 Estrategia de pruebas | 2, y los pasos de verificación de 4, 6, 7 y 8 |
