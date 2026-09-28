# portfolio-vero

Sitio personal bilingüe de Verónica Ramírez, traductora e intérprete de
inglés y español.

**URL:** https://veronicaramirez.netlify.app

## Stack

HTML, CSS y JavaScript escritos a mano. Sin framework, sin paso de
compilación, sin dependencias. La publicación es el mismo repositorio.

Se eligió así a propósito:

- **El sitio se edita sin programador.** Cambiar un texto es abrir un archivo
  y cambiar una frase.
- **No hay nada que se rompa al actualizar.** Sin cadena de dependencias ni
  compilaciones intermedias, `git push` es el despliegue entero.
- **Migrar a Astro después es fácil; volver atrás desde Astro, no.** Si el
  sitio crece y necesita más estructura, la ruta de salida está abierta.

Fuentes: **Fraunces** para los encabezados e **Inter** para el texto, alojadas
en `assets/fonts/` y no desde un CDN. Cada visita deja un dato de visita que se
entrega a Google Fonts es un problema para cualquier cliente europeo, y
basta con pedir la fuente desde el propio dominio para que no exista.

## Estructura

```
index.html                    raíz: elige idioma y manda a /es/ o /en/
es/index.html                 página de contenido en español
en/index.html                 página de contenido en inglés
es/confirmacion.html          destino del envío sin JavaScript
en/confirmation.html          ídem en inglés
assets/tokens.css             variables, fuentes, reset y tipografía base
assets/layout.css             componentes y adaptación a pantallas
assets/main.js                menú angosto y envío del formulario
assets/fonts/                 Fraunces e Inter en woff2 (subconjuntos latin)
assets/img/                   fotos y tarjetas sociales
tools/                        verificación, capturas y generador de tarjetas
netlify.toml                  cabeceras de seguridad y caché
```

Las dos páginas de contenido tienen **el mismo marcado, los mismos
identificadores y los mismos nombres de campo**: solo cambia el texto. Esa
es la razón de que haya una sola hoja de estilos, y conviene conservarla si
alguna vez se edita una de las dos.

## Deploy

Push a `main` → Netlify construye automáticamente.

El sitio está conectado a este repositorio por la integración de Netlify
con GitHub, así que no hay ningún paso manual de despliegue.

## Verificación local

```bash
node tools/verificar.mjs --paginas /index.html,/es/index.html,/en/index.html \
                         --anchos 320,360,768,1440
```

Sale con código 1 si hay algún fallo, así que sirve también como puerta en una
integración continua. Se necesitará Firefox instalado.

## Pasos manuales pendientes

**Nada de esto se puede hacer desde el código. Son los dos puntos donde el
sitio puede quedar sin funcionar sin que nadie se entere.**

1. **Configurar el correo del formulario.** En el panel de Netlify, *Forms →
   Notification settings*, poner `vero22ramm@gmail.com` como dirección de
   notificación del formulario `presupuesto`. Hasta que esto no está hecho,
   los presupuestos se guardan en el panel de Netlify y no llegan a ningún
   correo: entra trabajo y nadie lo ve.

2. **Probar el envío de verdad después del primer despliegue.** Enviar un
   formulario real y confirmar que el correo llega. Netlify Forms no funciona
   contra un servidor local, así que esto no se puede comprobar antes de
   desplegar. **Un formulario que nunca se probó contra Netlify Forms es un
   formulario que no funciona, y no se sabe hasta que llega el primer
   cliente.**

## Un aviso sobre el validador de HTML

El validador de W3C marca un error en `es/index.html` y `en/index.html`:

```
Attribute "netlify-honeypot" not allowed on element "form" at this point.
```

**No es un error y no hay que corregirlo.** `netlify-honeypot` es un atributo
propio de Netlify que el validador no conoce porque no forma parte de la
especificación de HTML. Si se quita para callar al validador, se desactiva el
filtro de spam y el sitio empieza a recibir robobots.

Validando la URL en vivo en vez del archivo, sale un segundo aviso distinto:

```
Stray start tag "script". From line 335, column 1
Cannot recover after last error. Any further errors will be ignored.
```

**Tampoco es un error, y es menos nuestro todavía.** Netlify añade al final de
cada página, después del `</html>`, su propio `<script async src="/.netlify/scripts/hud">`
para el HUD de su panel. Los dos archivos del repositorio terminan limpios en
`</body></html>`; para verlo, `git show HEAD:es/index.html | tail -3`. El aviso
desaparece en cuanto se valida el archivo en local en vez de la URL.

Los dos avisos son cosas que el validador no puede conocer: uno porque el
atributo es de Netlify, el otro porque la etiqueta la agrega Netlify. Lo único
que produce un error real es algo escrito en el repositorio.

## Editar el contenido

- **Los textos** están en `es/index.html` y `en/index.html`. Si se cambia uno
  en un idioma, hay que cambiarlo en el otro: no están sincronizados por
  ninguna herramienta.
- **Los colores y las medidas** están en `assets/tokens.css`. `layout.css` no
  declara ningún color literal, todo sale de ahí.
- **El aviso del Traductorado** aparece en `assets/layout.css`, en el bloque
  `.credencial-en-curso`, y su fecha en el texto de ambas páginas. Termina en
  diciembre de 2026: cuando se gradúe, hay que quitar la etiqueta de "en
  curso" de los dos idiomas.
- **Las tarjetas sociales** se regeneran con:

  ```bash
  node tools/serve.mjs 8123 &
  node tools/capturar.mjs "http://localhost:8123/tools/social-card.html?lang=es" \
    assets/img/social-es.png 1200 630
  ```

  Conviene repetirlo si cambia el nombre o el oficio.
