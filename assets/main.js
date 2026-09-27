/* ==========================================================================
   Portfolio de Verónica Ramírez — comportamiento
   Un solo IIFE, sin dependencias y sin API global. Hace tres cosas
   independientes: detectar el idioma en la raíz, plegar la navegación en
   pantallas angostas y enviar el formulario sin recargar.

   El CSS aplica la regla contraria en los tres casos. Sin este archivo el
   sitio sigue siendo utilizable, que es la razón de que exista la clase
   "js" en el elemento raíz: el CSS solo pliega el menú si esa clase está
   presente, y la pone este archivo.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. Raíz: mandar a la versión del idioma del visitante

     Solo actúa en la raíz y solo si la página no declara lang, que es el
     caso de index.html. Las páginas de contenido declaran su idioma y no
     entran por aquí.
     ------------------------------------------------------------------ */

  var esLaRaiz = /^\/(index\.html)?(\?.*)?$/.test(location.pathname);
  var sinIdioma = !document.documentElement.getAttribute("lang");

  if (esLaRaiz && sinIdioma) {
    // location.replace y no location.href: con href, el botón "atrás"
    // devuelve a la raíz, que manda a la misma página, y el visitante
    // queda en un ciclo de dos clics.
    var destino = /^\s*es\b/i.test(navigator.language || "") ? "/es/" : "/en/";
    location.replace(destino);
    return;
  }

  /* ------------------------------------------------------------------
     2. Navegación angosta

     El botón alterna la clase "abierto" sobre el contenedor del menú, que
     es el mismo elemento al que apunta aria-controls. El script no
     inventa la visibilidad: solo la quita si está presente, de modo que si
     este archivo falla el menú sigue viéndose entero.
     ------------------------------------------------------------------ */

  var botonMenu = document.querySelector(".boton-menu");
  var menu = document.getElementById("menu");

  if (botonMenu && menu) {
    botonMenu.addEventListener("click", function () {
      var abierto = menu.classList.toggle("abierto");
      botonMenu.setAttribute("aria-expanded", abierto ? "true" : "false");
    });

    // Al pulsar un enlace de sección el menú se cierra solo. Sin esto, en un
    // teléfono el menú sigue abierto sobre la sección a la que se acaba de
    // saltar, y tapa justo lo que se fue a ver.
    menu.addEventListener("click", function (ev) {
      if (ev.target.closest("a[href^='#']")) {
        menu.classList.remove("abierto");
        botonMenu.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Envío del formulario
     ------------------------------------------------------------------ */

  var form = document.querySelector('form[name="presupuesto"]');

  if (!form) return;

  var estado = form.querySelector(".form-estado");
  var boton = form.querySelector('button[type="submit"]');
  var ENVANDO = boton.getAttribute("data-enviando");
  var ORIGINAL = boton.getAttribute("data-original");
  var ERROR = estado.getAttribute("data-error");
  var enVuelo = false;

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();

    // Sin esta bandera, un doble clic o un segundo toque en un teléfono con
    // la red lenta generan dos peticiones y la persona recibe dos
    // respuestas.
    if (enVuelo) return;
    enVuelo = true;

    boton.disabled = true;
    boton.textContent = ENVANDO;
    estado.className = "form-estado";
    estado.textContent = "";

    // Se manda el cuerpo como urlencoded, que es lo que Netlify Forms
    // espera. form.action no se usa nunca: es el destino del envío sin
    // scripts, y traer esa página con fetch devuelve el HTML de la
    // confirmación con estado 200 aunque la entrega haya fallado. El
    // visitante vería un agradecimiento por un presupuesto que nunca
    // llegó.
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString()
    })
      .then(function (r) {
        // Netlify devuelve estados que no son de éxito cuando rechaza un
        // envío. Sin esta comprobación el catch nunca se dispara y todo
        // parece funcionar.
        if (!r.ok) throw new Error("HTTP " + r.status);
        form.replaceWith(exito());
      })
      .catch(function () {
        // El catch no borra los campos. Los valores siguen en el DOM, así
        // que nadie pierde lo que escribió, y el mensaje incluye la
        // dirección de correo para que la persona no se quede sin salida.
        estado.className = "form-estado error";
        estado.textContent = ERROR;
        boton.disabled = false;
        boton.textContent = ORIGINAL;
        enVuelo = false;
      });
  });

  function exito() {
    var div = document.createElement("div");
    div.className = "form-exito";
    div.setAttribute("role", "status");
    div.textContent = estado.getAttribute("data-exito");
    return div;
  }
})();
