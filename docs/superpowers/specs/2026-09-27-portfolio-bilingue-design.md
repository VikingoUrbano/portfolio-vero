# Portfolio bilingüe de Verónica Ramírez — Especificación de diseño

- **Fecha:** 2026-09-27
- **Estado:** aprobado en conversación, pendiente de revisión del documento
- **Repositorio:** https://github.com/VikingoUrbano/portfolio-vero
- **Producción:** https://veronicaramirez.netlify.app

---

## 1. Objetivo

Portfolio personal bilingüe (español / inglés) de **Verónica Ramírez**, traductora e intérprete
de inglés. El sitio existe para **conseguir clientes**: cada sección tiene que llevar a una
conversación comercial.

### Restricción de contenido

El sitio se escribe y se lee **como un portfolio profesional real**. No menciona la asignatura
para la que existe, ni la institución donde se cursó esa asignatura, ni la entrega, ni la nota,
ni el docente, ni el trabajo práctico. Nada de eso aparece en el texto visible, en el marcado ni
en los metadatos.

Esta restricción **no alcanza a las credenciales propias**. Publicar el título que se está
obteniendo, las universidades que emiten las certificaciones y los empleadores anteriores es
justamente lo que hace un portfolio real, y es el contenido de las secciones de Credenciales y
Sobre mí. Un portfolio que oculta dónde se estudió no es más honesto: es menos creíble.

## 2. Sujeto

Datos extraídos de `recursos/Veronica Ramirez.pdf` (exportación de LinkedIn). Copia de trabajo
en `recursos/datos-persona.md`, que no se versiona.

| Campo | Valor |
|---|---|
| Nombre | Verónica Ramírez |
| Ubicación | Rosario, Santa Fe, Argentina |
| Email | vero22ramm@gmail.com |
| Teléfono | +54 341 718-0942 |
| LinkedIn | linkedin.com/in/veronica-p-ramirez |

El teléfono se normaliza a formato internacional con prefijo de país. El PDF lo traía en formato
local, sin código de país.

### Idiomas

| Idioma | Nivel | Fuente |
|---|---|---|
| Español | Nativo | CV |
| Inglés | **C2** (ECPE, University of Michigan) | CV |
| Alemán | A1 | CV |

El PDF de origen lista el inglés como "Native or Bilingual" en una sección autogenerada por
LinkedIn. **Es incorrecto y no se usa.** En el sitio figura siempre: español nativo · inglés C2
certificado.

### Formación

| Centro | Título | Fechas |
|---|---|---|
| Instituto Belgrano | Traductorado Público, Literario y Científico Técnico en Inglés — *Language Interpretation and Translation* | mar 2023 – dic 2026 (en curso, cuarto año) |
| University of Michigan | ECPE — Certificate of Proficiency in English (C2) | dic 2024 – feb 2025 |
| University of Michigan | ECCE — Certificate of Competency in English (C1) | dic 2023 – feb 2024 |
| Ikaruga Escuela de Idiomas | Alemán A1 | feb 2024 – jul 2024 |
| A.R.I.C.A.N.A. | Curso de Lengua Inglesa Americana | 2007 – 2013 |

### Experiencia

**Alianza — Profesor** · enero 2024 – diciembre 2024 (1 año)

- Clases de inglés para hablantes nativos de español, de niños, adolescentes y adultos.
- Programas de estudio personalizados de A1 a B2 según el MCER.
- Competencia comunicativa, comprensión lectora y estructuras gramaticales complejas.

### Aptitudes declaradas

Inglés / español nativo · Edición · Investigación terminológica.

## 3. Servicios

Cinco. Se presentan en `/es/` y `/en/`, con el mismo orden y la misma jerarquía visual.

1. **Traducción general** español ↔ inglés
2. **Subtitulado y localización**
3. **Traducción técnica y científica**
4. **Traducción jurada**
5. **Interpretación** — simultánea y consecutiva

### Encuadre de la interpretación

La experiencia documentada de la traductora es docente, no interpretativa, aunque el plan de
estudios incluye interpretación. La ficha del servicio de interpretación se ofrece sin etiqueta
de "en formación": una etiqueta así se lee como una señal de alarma en la tarjeta misma y
desvía la atención. Lo que resuelve el problema es **no declararlo en ningún lado**: el sitio
no afirma años de experiencia interpretativa porque no los tiene. En la sección de credenciales,
la formación en interpretación aparece como parte del plan de estudios, que es exactamente lo
que es. No hace falta ninguna marca de agua.

### Traducción jurada y calendario de publicación

Decisión cerrada: **el sitio se publica de inmediato, antes de la graduación** de diciembre de
2026. En consecuencia:

- La ficha de traducción jurada se publica desde el primer día, sin condiciones ni letra
  pequeña. Es decisión de la titular y no se vuelve a discutir.
- El Traductorado se presenta como **en curso, con fecha de finalización**, nunca como título
  obtenido.
- En la sección Credenciales, el Traductorado aparece en bloque separado del resto, con la
  etiqueta de fecha explícita, para que nadie pueda leer "traductora pública" en otro punto del
  sitio sin ver que el título está en trámite.

El riesgo asumido queda registrado en la sección 14.

## 4. Redacción del contenido

Regla que gobierna todos los textos del sitio.

**El español se redacta a partir de los datos de la sección 2. La versión inglesa se escribe de
forma nativa, no por traducción automática ni por traducción literal de la española.** Un
portfolio de traductora con inglés torpe se contradice a sí mismo en la primera frase, y es el
único defecto del proyecto que no se puede arreglar con maquetación.

Los borradores en ambos idiomas los escribe quien implemente. Cada idioma tiene su propio texto,
escrito como una página propia y no como una traducción de la otra: la expansión textual no es
el único problema, porque el inglés tiene otros usos, otros registros y otra densidad de
información.

Ningún texto de la web se genera con traducción automática. Es el producto que se vende.

### Punto de control bloqueante

**La titular revisa y corrige la versión inglesa antes de publicar.** Es el único paso del
proyecto que no se puede cerrar con trabajo técnico, y por eso va en la lista de verificación de
cierre con criterio de terminado explícito:

- Leída completa de `/en/` de punta a punta por la titular, que es hablante nativa del inglés.
- Confirmación explícita de que el inglés suena natural y no literal.
- Sin ese paso, `/en/` no se despliega. `/es/` sí puede desplegarse.

## 5. Arquitectura

### Enfoque: HTML y CSS estáticos, sin compilación

Sin framework, sin bundler, sin paso de build. Tres páginas de contenido, dos páginas de
confirmación, una hoja de estilos compartida, un archivo de JavaScript.

Motivos:

- El resultado visual no depende del stack, depende del criterio. Ningún framework mejora por sí
  solo un diseño.
- La compatibilidad con navegadores y dispositivos es máxima: no hay runtime de JavaScript que
  pueda fallar.
- Despliegue instantáneo y sin fallos de compilación.
- Editable por alguien sin conocimientos técnicos.
- El valor de integración está en los servicios, no en un framework: Git, GitHub, Netlify,
  formularios, i18n, SEO y despliegue automático.

Migrar a Astro más adelante es trivial. Migrar desde Astro a HTML plano, no.

### Estructura de archivos

```
portfolio-vero/
├── index.html                  selector de idioma + detección
├── favicon.svg
├── favicon.ico
├── netlify.toml
├── sitemap.xml
├── robots.txt
├── es/
│   ├── index.html              página de contenido
│   └── confirmacion.html       destino del POST sin JavaScript
├── en/
│   ├── index.html              página de contenido
│   └── confirmation.html
├── assets/
│   ├── styles.css              único, compartido por los dos idiomas
│   ├── main.js                 detección de idioma, menú móvil, envío AJAX
│   ├── fonts/                  Fraunces e Inter en woff2, subconjuntos latin y latin-ext
│   └── img/                    fotos y social card
├── .gitignore
├── recursos/                   material local, no versionado
└── docs/
```

### Por qué dos páginas y no un interruptor de JavaScript

Cada idioma es un archivo distinto, en una URL distinta. Un sitio que muestra español y lo cambia
a inglés con un botón de JavaScript lo indexa Google como una sola página en español: la mitad
del trabajo bilingüe queda invisible para el buscador. En un sitio cuyo producto **es** la
bilingüidad, eso anula el argumento comercial del proyecto.

El costo es duplicación de marcado. Se asume: la hoja de estilos es una sola, y ahí es donde se
evita la deriva entre versiones.

### Contenido de `netlify.toml`

Sin comando de compilación y directorio de publicación `.`.

**Cabeceras de seguridad**, en todas las respuestas: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y
`Permissions-Policy` restringida a lo imprescindible.

**Caché.** `assets/fonts/` y `assets/img/` sirven con `Cache-Control: public, max-age=31536000,
immutable`, porque esos archivos cambian de nombre cuando cambian.

`assets/styles.css` y `assets/main.js` sirven con `no-cache`, **no** con caché inmutable. No hay
paso de compilación, así que los nombres de archivo no llevan huella digital: una regla inmutable
sobre ellos significaría que una corrección de CSS no llegaría nunca a quien ya visitó el sitio.
Sin build, no hay forma de purgar por URL.

`es/` y `en/` también con `no-cache`, por el mismo motivo.

## 6. URLs e idiomas

```
/            index.html real: detecta el idioma y redirige
/es/         página española
/en/         página inglesa
```

`/` **no** es una regla de redirección de Netlify. Si lo fuera, el JavaScript no llegaría a
ejecutarse y la detección sería imposible. Es una página real.

### Detección de idioma

Regla exacta: si `navigator.language` empieza por `es`, va a `/es/`; cualquier otro caso, a
`/en/`. Sin lista de idiomas, sin configuración.

La redirección usa `location.replace()`, no `location.href`. Con `href`, el botón "atrás" del
navegador devuelve a `/`, que redirige otra vez, y el visitante queda atrapado en un ciclo de
dos clics.

En paralelo, la misma página muestra dos botones grandes, visibles sin JavaScript. Quien tiene
JavaScript aterriza en su idioma sin clicks; quien no lo tiene ve los botones y elige.

### SEO y descubrimiento

Cada página de contenido declara en el `<head>`:

```html
<link rel="alternate" hreflang="es" href="https://veronicaramirez.netlify.app/es/">
<link rel="alternate" hreflang="en" href="https://veronicaramirez.netlify.app/en/">
<link rel="alternate" hreflang="x-default" href="https://veronicaramirez.netlify.app/es/">
```

Y `<html lang="es">` o `<html lang="en">` según la página. En un sitio bilingüe no es un detalle:
los lectores de pantalla eligen la pronunciación con ese atributo.

`/` declara `<meta name="robots" content="noindex, follow">` y `canonical` a `/es/`. Es una
bisagra, no contenido: no debe competir en el índice con las dos páginas reales, y no debe
bloquearse en `robots.txt`, porque un `Disallow` impide que el rastreador lea el `noindex` y la
página terminaría indexada igual.

Sobre cómo descubren los buscadores las dos versiones: por los `hreflang` de cada página, que
cruzan las dos URL, y por el selector de idioma de la navegación, presente en las dos páginas y
siempre en el marcado. Los botones de `/` **no** son una tercera vía: la redirección por
JavaScript se ejecuta antes de que un rastreador con JavaScript llegue a mostrarlos. La
afirmación de que el sitio se descubre por tres caminos independientes no es correcta y no se
sostiene como requisito.

`sitemap.xml` declara las dos URL de contenido, con `hreflang` alternos y `xhtml:link` de
referencia cruzada. `robots.txt` permite todo y apunta al sitemap.

### Selector de idioma

Siempre visible en la navegación, y conserva la sección. **Los identificadores de sección son
los mismos en las dos versiones**, en español, incluso en la página inglesa:

| Sección | Identificador |
|---|---|
| Portada | `#inicio` |
| Servicios | `#servicios` |
| Solicitar presupuesto | `#presupuesto` |
| Sobre mí | `#sobre-mi` |
| Credenciales | `#credenciales` |
| Pie de página | `#contacto` |

El selector enlaza al mismo identificador en la página del otro idioma: quien está en Servicios
en español y pasa a inglés aterriza en Services, no arriba de todo. Al usar los mismos
identificadores en ambos idiomas, el enlace es la misma cadena y no hace falta tabla de
equivalencias — una tabla de nombres de sección es exactamente el tipo de cosa que se
desincroniza a las dos semanas.

No se persiste la preferencia con `localStorage`. El selector es explícito y visible, y las dos
URLs son estables e indexables. Añadir persistencia después es posible sin romper nada.

## 7. Dirección visual

Cálida y formal. Nombre interno: **dirección C**.

| Elemento | Valor |
|---|---|
| Encabezados | Fraunces (serif) |
| Texto | Inter |
| Fondo | `#FBF9F6` crema |
| Texto | `#1F2933` |
| Acento | `#0F766E` verde petróleo |
| Llamado a la acción | subrayado, no botón relleno |

Sin animaciones. Sin modo oscuro. Ambos acordados.

El acento se usa para enlaces, resultados del formulario y elementos de énfasis. El contraste de
`#0F766E` sobre `#FBF9F6` **se mide** contra 4.5:1 (WCAG AA) antes de usarlo en texto pequeño; no
se da por bueno.

### Tipografías: alojadas en el propio sitio

Los archivos de Fraunces e Inter se descargan una vez a `assets/fonts/`, en woff2, con los
subconjuntos **latin** y **latin-ext** — este último es obligatorio, sin él las tildes y la ñ se
caen. Se sirven con `font-display: swap` y `font-family` de sistema como alternativa, para que la
página sea legible si las fuentes no llegan.

Ambas son fuentes variables, así que se descargan como archivo variable con `@font-face` y
`font-weight` en rango, no como instancias estáticas por peso. Fraunces se recorta al rango
`SOFT` y `WONK` por defecto, que son los que le dan carácter sin que haya que tocar el eje.

Se adjunta el texto de la licencia SIL Open Font License junto a los archivos, porque las dos
fuentes la exigen y es parte del paquete.

Se descartan Google Fonts y cualquier CDN. Un sitio de una traductora que trabaja para clientes
europeos no debería mandar cada visita a un servidor de terceros: es una petición de datos que
no hace falta, y hay resoluciones judiciales en Europa sobre precisamente eso. El costo en el
repositorio es de unos cientos de kilobytes.

### Vista previa al compartir

El sitio se comparte por LinkedIn, y ahí es donde se ve la primera impresión. Cada página declara
Open Graph y Twitter Card: `og:title`, `og:description`, `og:type`, `og:url`, `og:locale`,
`og:site_name` y `og:image` con una imagen social de 1200 × 630 en `assets/img/`. Sin eso, un
enlace pegado en un chat o en LinkedIn se muestra como una URL desnuda.

`og:locale` es `es_AR` en la versión española y `en_US` en la inglesa. La variedad estadounidense
no es arbitraria: tanto los exámenes ECPE y ECCE de University of Michigan como el curso de
A.R.I.C.A.N.A. son de inglés americano, así que la versión inglesa se redacta en esa variedad y
no se mezcla con recursos de inglés británico.

## 8. Orden de secciones

Orden aprobado: **conversión primero**.

1. **Portada** — nombre, qué hace, llamada a la acción
2. **Servicios** — los cinco, con descripción de una línea cada uno
3. **Solicitar presupuesto** — el formulario
4. **Sobre mí** — biografía y foto
5. **Credenciales** — formación, certificaciones, experiencia
6. **Pie de página** — email, LinkedIn, teléfono

La razón: sin testimonios ni muestras de traducción, la única prueba de calidad disponible es el
propio texto del sitio y las credenciales. En el orden inverso el visitante tendría que confiar
antes de ver ninguna evidencia, y en un portfolio sin portafolio esa confianza no está ganada.

La sección de éxito del formulario declara el compromiso de respuesta: **dos días hábiles**.
Sin ese texto, el estado de éxito dice que el mensaje llegó y no dice qué esperar, que es la mitad
de la utilidad de un formulario.

## 9. Formulario de presupuesto

### Campos

| # | Campo | Tipo | Obligatorio |
|---|---|---|---|
| 1 | Nombre | texto | sí |
| 2 | Email | `type="email"` | sí |
| 3 | Tipo de servicio | `select`, 5 opciones | sí |
| 4 | Volumen aproximado | `select` con rangos | no |
| 5 | Fecha límite | `type="date"` | no |
| 6 | Comentarios | `textarea` | sí |

Rangos de volumen, en palabras: hasta 1.000 · de 1.000 a 5.000 · de 5.000 a 20.000 · de 20.000
a 100.000 · más de 100.000 · no lo sé todavía.

El campo de volumen **no cambia** según el servicio. Está expresado en palabras porque es el
volumen de traducción, y un pedido de interpretación no tiene volumen en palabras. Quien lo pide
lo deja vacío o elige "no lo sé todavía". Un `select` que se reconfigura con JavaScript suma un
modo de fallo a cambio de una comodidad menor, y el campo no es obligatorio.

Excluido a propósito: teléfono (ya está en el pie de página), adjuntos de archivo, campo de par
de idiomas (el sitio solo ofrece español e inglés), campo de "certificado sí/no".

### Marcado del formulario

```html
<form name="presupuesto"
      method="POST"
      data-netlify="true"
      action="/es/confirmacion.html">
  <input type="hidden" name="form-name" value="presupuesto">
  <input type="hidden" name="idioma" value="es">
  ...
  <p class="campo-otulto" aria-hidden="true">
    <label>No completar este campo<input name="bot"></label>
  </p>
</form>
```

El atributo `name` y el campo oculto `form-name` llevan el mismo valor, `presupuesto`. El par es
necesario: `data-netlify` registra el formulario al compilar, y el campo oculto es lo que
identifica el envío en la petición POST. El campo `idioma` registra de qué versión del sitio
salió la solicitud.

El campo del honeypot va oculto visualmente pero **no** con `display: none` ni con
`visibility: hidden`, sino fuera de la vista con posicionamiento y tamaño cero: Netlify ignora
el envío solo si el campo no está en el flujo de la página, y muchos robots se saltan los
campos invisibles al formulario y los completan igual.

### Estados

| Estado | Qué ve el visitante |
|---|---|
| Inicial | Formulario vacío con validación nativa del navegador |
| Enviando | Botón deshabilitado, texto "Enviando…" |
| Éxito | Confirmación en línea, en un contenedor `aria-live="polite"`, indicando qué sigue |
| Error | Mensaje genérico, y **los campos conservan lo que escribió** |
| Spam | Nada. Netlify lo descarta en silencio |

El estado de error que borra lo escrito es el peor resultado posible: alguien dedica cinco
minutos a describir un encargo y le vuelve la página en blanco. El envío por AJAX conserva los
valores en el DOM; sin AJAX se pierden. Por eso el AJAX importa más allá de la comodidad.

Spam: honeypot nativo de Netlify, sin código. Una trampa de tiempo —descartar envíos con menos
de tres segundos de antigüedad— es opcional y no bloquea la publicación.

### Contrato de envío por AJAX

El envío va con `fetch` a **`/`**, no a `form.action`.

```js
const datos = new URLSearchParams(new FormData(form)).toString();

fetch("/", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: datos
})
  .then((r) => { if (!r.ok) throw new Error(r.status); mostrarExito(); })
  .catch(() => mostrarError());
```

Dos errores que este diseño evita a propósito:

- **Enviar a `form.action` en lugar de `/`.** La ruta de `action` es el destino del envío sin
  JavaScript, no del envío con JavaScript. Un `fetch` a `/es/confirmacion.html` devuelve la
  página HTML de confirmación con estado 200 aunque la entrega haya fallado, y el visitante ve
  "gracias" por un presupuesto que nunca llegó. El chequeo de `r.ok` no alcanza: el estado es
  correcto. Por eso el POST va a la raíz.
- **No comprobar `r.ok`.** Netlify puede devolver un estado que no es de éxito cuando rechaza un
  envío. Sin el chequeo, el `catch` nunca se dispara y todo parece ir bien.

Los valores de los campos no se borran en ningún momento. El estado de éxito reemplaza el
formulario por el mensaje de confirmación, después de la respuesta.

### Degradación sin JavaScript

El `<form>` es HTML plano. Si el script falla, el POST tradicional a `form.action` funciona igual
y Netlify redirige a la página de confirmación de ese idioma: `es/confirmacion.html` o
`en/confirmation.html`. El visitante nunca ve un error técnico.

### Back-end

Netlify Forms. No hay servidor, ni base de datos, ni código de servidor.

**Tarea manual de la titular, obligatoria:** en el panel de Netlify, *Forms → Notification
settings*, configurar a qué dirección de correo llegan las solicitudes. Sin ese paso los
presupuestos se pierden en silencio. Es lo único del despliegue que no se puede hacer por API, y
se verifica antes de dar por terminado el despliegue.

## 10. Manejo de errores

| Situación | Comportamiento |
|---|---|
| JavaScript deshabilitado | Selector de idioma con botones, formulario por POST tradicional, página de confirmación por idioma |
| JavaScript falla en el envío | POST tradicional como respaldo, con los mismos campos |
| Falla de red a mitad del envío | Mensaje en línea, campos intactos, sin recarga de página |
| Envío rechazado por Netlify | Mensaje en línea, campos intactos, sin recarga de página |
| Fuente web no carga | `font-family` de sistema como alternativa |
| Foto no disponible | La sección "Sobre mí" se compone sin ella; no se rompe la maqueta |
| Visitante sin fotos todavía | La sección se diseña para que la ausencia de imagen no se note |

## 11. Recursos y assets

Dos carpetas con propósitos distintos, y la diferencia importa:

```
recursos/     material local: PDF del CV, fotos crudas.  NO se versiona
assets/img/   fotos optimizadas que usa el sitio.       Se versiona
```

`recursos/` está en `.gitignore` a propósito. Es material de trabajo, no producto.

El PDF del CV **no se publica**. No hay botón de descarga, ni enlace, ni ruta accesible. Un
archivo en una URL pública no se puede revocar: se descarga, se indexa, se copia, y después no
se puede sacar. Sin descarga no hay nada que revertir. La sección Credenciales va en texto.

Las fotos que el sitio usa sí tienen que estar versionadas: Netlify compila desde GitHub, y lo
que no está en el repositorio no se sirve. Por eso viven en `assets/img/`, no en `recursos/`.

Formato de publicación: WebP con respaldo JPEG, `width` y `height` explícitos en el marcado para
evitar desplazamiento de maquetación, y `loading="lazy"` en todo lo que esté bajo el primer
pliegue.

## 12. Estrategia de pruebas

**Responsive:** 360 px, 768 px y 1440 px, en navegador real.

**Los dos idiomas en todas las páginas, con contenido real, nunca con placeholders.** El inglés
suele ocupar más espacio que el español y un título que entra bien en `/es/` se rompe en `/en/`.
Ese es el defecto que más se repite en sitios bilingües, y la única forma de encontrarlo es leer
las dos versiones con los textos definitivos puestos.

**Contenido largo:** el nombre más largo, el título de servicio más largo, el párrafo de
biografía completo.

**Teclado:** recorrido completo con Tab, foco visible siempre, enlace de salto al contenido
principal.

**Contraste:** medir `#0F766E` sobre `#FBF9F6`; mínimo 4.5:1 para texto normal. Medir también
el gris de texto secundario sobre crema, que es el otro par de colores en juego.

**Semántica:** un solo `<h1>` por página, jerarquía de encabezados sin saltos, `<label>`
asociado a cada campo, `alt` en todas las imágenes, `lang` correcto en cada página.

**Formulario:** envío real de prueba en producción, no en local. Un formulario que nunca se
probó contra Netlify Forms es un formulario que no funciona y no se sabe hasta que llega el
primer cliente.

**SEO:** `/es/` y `/en/` devuelven 200, `hreflang` cruzado correcto, `sitemap.xml` válido,
`/` con el `noindex` presente, contenido completo llegando a Google sin depender de JavaScript.

**Vista previa:** la social card se ve bien al pegar el enlace en un chat y en LinkedIn.

**Higiene:** cero errores en consola, HTML validado en el validador de W3C.

## 13. Fuera de alcance

- Modo oscuro
- Animaciones y transiciones
- Publicación del PDF
- Testimonios de clientes: no existen
- Muestras de traducción: no existen
- Blog o sección de artículos
- Analítica
- Panel de administración
- Cualquier framework, bundler o gestor de contenidos
- Certificados de lectoescritura web, dominios propios o correo con dominio
- Idioma distinto de español e inglés, aunque el CV registre alemán A1: no hay nivel de
  traducción para ofrecerlo, y anunciarlo sería publicidad engañosa
- `security.txt` y cualquier canal de reporte de vulnerabilidades: un sitio estático de una
  persona, con un `mailto` en el pie de página, no tiene superficie de ataque que reportar

## 14. Riesgos abiertos

| Riesgo | Mitigación |
|---|---|
| Sin fotos en `recursos/` al momento de maquetar | La sección se compone sin imagen; se agrega después en `assets/img/` |
| El contraste del acento puede no cumplir AA | Se mide antes de usarlo en texto pequeño; si no llega, se oscurece |
| La notificación de Netlify Forms sin configurar | Tarea manual de la sección 9, verificada antes de dar por terminado el despliegue |
| El inglés rompe maquetas ajustadas del español | Pruebas de ambos idiomas con contenido real, no con placeholders |
| La versión inglesa puede quedar demasiado literal | La revisa y corrige la titular antes de publicar; es el punto de control bloqueante de la sección 4 |
| El sitio ofrece traducción jurada antes de diciembre de 2026 | Decisión consciente de la titular, ya registrada en la sección 3. Publicar el Traductorado como "en curso" con fecha de finalización, separado del resto de las credenciales, es lo que evita que el conjunto se lea como una afirmación de título obtenido |
