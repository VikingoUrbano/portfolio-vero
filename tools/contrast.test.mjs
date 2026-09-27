import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, wcagAA } from "./contrast.mjs";

// La paleta del sitio vive en assets/tokens.css y se copia en :root. Estas
// pruebas la fijan por aqui, de modo que si alguien oscurece un color para
// "darle un poco mas de aire" la suite lo dice en vez de dejar que el defecto
// llegue a la pagina.
//
// El sitio es oscuro de punta a punta. Cada color se comprueba contra las TRES
// superficies, no solo contra el fondo, porque un acento que se usa de pie
// dentro de una tarjeta va sobre --fondo-campo y no sobre --fondo, y el
// defecto solo apareceria ahi.
const PALETA = {
  fondo: "#283142",
  fondoCampo: "#2E3849",
  fondoAlto: "#39455A",
  texto: "#E8ECF2",
  textoSuave: "#A8B3C4",
  acento: "#8FC0D4",
  acentoVerde: "#9DC48A",
  acentoArena: "#E3B8A0",
  sobreAcento: "#1C2333",
  apagado: "#5C7FA3",
  error: "#F2A9A2",
  borde: "#8E9BB0",
  bordeCampo: "#8E9BB0",
};

const SUPERFICIES = [PALETA.fondo, PALETA.fondoCampo, PALETA.fondoAlto];
const MINIMO_TEXTO = 4.5;

test("blanco sobre negro es 21:1", () => {
  assert.equal(contrastRatio("#ffffff", "#000000"), 21);
});

test("un color contra si mismo es 1:1", () => {
  assert.equal(contrastRatio("#0F766E", "#0F766E"), 1);
});

test("la almohadilla es opcional", () => {
  assert.equal(
    contrastRatio("0F766E", "#FBF9F6"),
    contrastRatio("#0F766E", "#FBF9F6"),
  );
});

test("no distingue mayusculas de minusculas", () => {
  assert.equal(
    contrastRatio("#0f766e", "#fbf9f6"),
    contrastRatio("#0F766E", "#FBF9F6"),
  );
});

test("rechaza un valor que no es hexadecimal", () => {
  assert.throws(() => contrastRatio("#0F766", "#000000"));
  assert.throws(() => contrastRatio("#GGGGGG", "#000000"));
  assert.throws(() => contrastRatio("rojo", "#000000"));
});

test("el orden de los colores no cambia el resultado", () => {
  assert.equal(
    contrastRatio("#1F2933", "#FBF9F6"),
    contrastRatio("#FBF9F6", "#1F2933"),
  );
});

// --------------------------------------------------------------- la paleta

test("el texto del cuerpo cumple AA en las tres superficies", () => {
  for (const fondo of SUPERFICIES) {
    assert.equal(wcagAA(PALETA.texto, fondo, "normal"), true,
      `texto principal sobre ${fondo}: ${contrastRatio(PALETA.texto, fondo).toFixed(2)}:1`);
  }
  assert.ok(contrastRatio(PALETA.texto, PALETA.fondo) >= 7,
    "el texto principal deberia superar 7:1, que es el nivel AAA");
});

test("el texto suave cumple AA en las tres superficies", () => {
  for (const fondo of SUPERFICIES) {
    assert.equal(wcagAA(PALETA.textoSuave, fondo, "normal"), true,
      `texto suave sobre ${fondo}: ${contrastRatio(PALETA.textoSuave, fondo).toFixed(2)}:1`);
  }
});

test("los tres acentos cumplen AA como texto en las tres superficies", () => {
  // Esta es la prueba que motivó aclarar el azul. El #7FB3C8, que es el color
  // literal de la franja de la cabecera, da 4.23:1 sobre --fondo-alto: se
  // leía bien sobre el fondo y fallaba dentro de una tarjeta. Por eso el
  // acento es #8FC0D4, que pasa en los tres.
  for (const [nombre, color] of Object.entries({
    acento: PALETA.acento,
    "acento verde": PALETA.acentoVerde,
    "acento arena": PALETA.acentoArena,
  })) {
    for (const fondo of SUPERFICIES) {
      assert.ok(contrastRatio(color, fondo) >= MINIMO_TEXTO,
        `${nombre} ${color} sobre ${fondo}: ${contrastRatio(color, fondo).toFixed(2)}:1, ` +
        `necesita ${MINIMO_TEXTO}:1`);
    }
  }
});

test("el boton es texto oscuro sobre pastel, no blanco", () => {
  // El boton lleva el acento de fondo. Con texto blanco daría cerca de 2:1,
  // porque un pastel es claro por definición. Por eso --sobre-acento es casi
  // negro y el boton invierte la relación habitual.
  for (const [nombre, relleno] of Object.entries({
    acento: PALETA.acento,
    "acento verde": PALETA.acentoVerde,
    "acento arena": PALETA.acentoArena,
  })) {
    assert.ok(contrastRatio(PALETA.sobreAcento, relleno) >= MINIMO_TEXTO,
      `texto del boton sobre ${nombre} ${relleno}: ` +
      `${contrastRatio(PALETA.sobreAcento, relleno).toFixed(2)}:1`);
  }
});

test("--apagado es decorativo y no llega a 4.5:1 en ninguna superficie", () => {
  // Esta prueba está al revés a propósito: fija que este color NO sirva para
  // texto. Si alguien lo sube y empieza a escribir con él, el fallo aparece
  // aquí antes de llegar a la página.
  for (const fondo of SUPERFICIES) {
    assert.ok(contrastRatio(PALETA.apagado, fondo) < MINIMO_TEXTO,
      `--apagado ${PALETA.apagado} sobre ${fondo} da ` +
      `${contrastRatio(PALETA.apagado, fondo).toFixed(2)}:1: si llega a 4.5, ` +
      `ya no es solo decorativo y hay que promoverlo a token de texto`);
  }
});

test("el color de error cumple AA", () => {
  for (const fondo of SUPERFICIES) {
    assert.equal(wcagAA(PALETA.error, fondo, "normal"), true,
      `error sobre ${fondo}: ${contrastRatio(PALETA.error, fondo).toFixed(2)}:1`);
  }
});

test("el texto de los campos cumple AA sobre el fondo del campo", () => {
  assert.equal(wcagAA(PALETA.texto, PALETA.fondoCampo, "normal"), true);
});

test("el borde de los campos cumple 3:1 contra el fondo del campo", () => {
  // WCAG 1.4.11: el contorno de un control interactivo necesita 3:1 porque
  // es lo unico que dice donde termina el campo. Y el fondo del campo es
  // --fondo-campo, no --fondo: sobre fondo oscuro un borde claro se ve, pero
  // contra el campo es contra lo que tiene que llegar a 3:1.
  assert.ok(contrastRatio(PALETA.bordeCampo, PALETA.fondoCampo) >= 3,
    `borde de campo: ${contrastRatio(PALETA.bordeCampo, PALETA.fondoCampo).toFixed(2)}:1, ` +
    `necesita 3:1`);
});

test("la superficie mas alta no rompe el texto principal", () => {
  // --fondo-alto es el escalon que mas se acerca al texto. Si algun dia se
  // sube mas, esta prueba avisa antes de que el texto deje de leerse.
  assert.ok(contrastRatio(PALETA.texto, PALETA.fondoAlto) >= 7,
    `texto sobre la superficie mas alta: ` +
    `${contrastRatio(PALETA.texto, PALETA.fondoAlto).toFixed(2)}:1`);
});

test("las razones medidas no se desvian sin querer", () => {
  // Fijadas a tres decimales: si alguien cambia un color, el fallo dice
  // exactamente cuanto se movio y hacia donde. Todas son el peor caso de cada
  // par, o sea la superficie mas alta, que es donde mas se acerca el texto.
  const esperado = {
    "texto sobre fondo": 11.013,
    "texto sobre la superficie mas alta": 8.151,
    "texto suave sobre fondo": 6.162,
    "texto suave sobre la superficie mas alta": 4.561,
    "acento sobre fondo": 6.628,
    "acento sobre la superficie mas alta": 4.905,
    "acento verde sobre la superficie mas alta": 4.923,
    "acento arena sobre la superficie mas alta": 5.352,
    "texto del boton sobre acento": 7.968,
    "apagado sobre fondo": 3.121,
    "error sobre fondo": 6.823,
    "borde de campo sobre el fondo del campo": 4.199,
  };
  const medido = {
    "texto sobre fondo": contrastRatio(PALETA.texto, PALETA.fondo),
    "texto sobre la superficie mas alta": contrastRatio(PALETA.texto, PALETA.fondoAlto),
    "texto suave sobre fondo": contrastRatio(PALETA.textoSuave, PALETA.fondo),
    "texto suave sobre la superficie mas alta": contrastRatio(PALETA.textoSuave, PALETA.fondoAlto),
    "acento sobre fondo": contrastRatio(PALETA.acento, PALETA.fondo),
    "acento sobre la superficie mas alta": contrastRatio(PALETA.acento, PALETA.fondoAlto),
    "acento verde sobre la superficie mas alta": contrastRatio(PALETA.acentoVerde, PALETA.fondoAlto),
    "acento arena sobre la superficie mas alta": contrastRatio(PALETA.acentoArena, PALETA.fondoAlto),
    "texto del boton sobre acento": contrastRatio(PALETA.sobreAcento, PALETA.acento),
    "apagado sobre fondo": contrastRatio(PALETA.apagado, PALETA.fondo),
    "error sobre fondo": contrastRatio(PALETA.error, PALETA.fondo),
    "borde de campo sobre el fondo del campo": contrastRatio(PALETA.bordeCampo, PALETA.fondoCampo),
  };
  for (const [nombre, valor] of Object.entries(esperado)) {
    assert.ok(Math.abs(medido[nombre] - valor) < 0.002,
      `${nombre}: medido ${medido[nombre].toFixed(3)}, se esperaba ${valor}`);
  }
});
