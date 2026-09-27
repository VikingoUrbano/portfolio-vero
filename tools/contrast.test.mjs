import { test } from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, wcagAA } from "./contrast.mjs";

// La paleta del sitio vive en assets/tokens.css y se copia en :root. Estas
// pruebas la fijan por aqui, de modo que si alguien oscurece un color para
// "darle un poco mas de aire" la suite lo dice en vez de dejar que el defecto
// llegue a la pagina.
const PALETA = {
  fondo: "#FBF9F6",
  texto: "#1F2933",
  acento: "#0F766E",
  textoSuave: "#52606D",
  error: "#B3261E",
  bordeCampo: "#8A8172",
};

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

test("el texto del cuerpo sobre el fondo cumple AA", () => {
  assert.equal(wcagAA(PALETA.texto, PALETA.fondo, "normal"), true);
  assert.ok(contrastRatio(PALETA.texto, PALETA.fondo) >= 7,
    "el texto principal deberia superar 7:1, que es el nivel AAA");
});

test("el acento sobre el fondo cumple AA para texto normal", () => {
  // El plan daba por hecho que este verde no llegaba a 4.5:1 y que por eso
  // tenía que reservarse para elementos grandes. Medido, da 5.21:1. La
  // restricción era innecesaria y solo hubiera producido reglas que no hacen falta.
  assert.equal(wcagAA(PALETA.acento, PALETA.fondo, "normal"), true);
});

test("blanco sobre el acento cumple AA", () => {
  // Es el caso del boton cuando se pasa el puntero por encima.
  assert.equal(wcagAA("#FFFFFF", PALETA.acento, "normal"), true);
});

test("el texto suave sobre el fondo cumple AA", () => {
  assert.equal(wcagAA(PALETA.textoSuave, PALETA.fondo, "normal"), true);
});

test("el color de error sobre el fondo cumple AA", () => {
  assert.equal(wcagAA(PALETA.error, PALETA.fondo, "normal"), true);
});

test("el texto de los campos sobre su fondo cumple AA", () => {
  assert.equal(wcagAA(PALETA.texto, "#FFFFFF", "normal"), true);
  assert.equal(wcagAA(PALETA.textoSuave, "#FFFFFF", "normal"), true);
});

test("el borde de los campos cumple 3:1 contra el fondo", () => {
  // WCAG 1.4.11: el contorno de un control interactivo necesita 3:1 porque
  // es lo unico que dice donde termina el campo. Un borde decorativo claro
  // funciona para una tarjeta, pero no para un area de escritura.
  assert.ok(contrastRatio(PALETA.bordeCampo, PALETA.fondo) >= 3,
    `borde de campo en ${contrastRatio(PALETA.bordeCampo, PALETA.fondo).toFixed(2)}:1, necesita 3:1`);
});

test("las razones medidas no se desvian sin querer", () => {
  // Fijadas a tres decimales: si alguien cambia un color, el fallo dice
  // exactamente cuanto se movio y hacia donde.
  const esperado = {
    "texto sobre fondo": 14.040,
    "acento sobre fondo": 5.208,
    "blanco sobre acento": 5.473,
    "texto suave sobre fondo": 6.143,
    "error sobre fondo": 6.220,
    "borde de campo sobre fondo": 3.657,
  };
  const medido = {
    "texto sobre fondo": contrastRatio(PALETA.texto, PALETA.fondo),
    "acento sobre fondo": contrastRatio(PALETA.acento, PALETA.fondo),
    "blanco sobre acento": contrastRatio("#FFFFFF", PALETA.acento),
    "texto suave sobre fondo": contrastRatio(PALETA.textoSuave, PALETA.fondo),
    "error sobre fondo": contrastRatio(PALETA.error, PALETA.fondo),
    "borde de campo sobre fondo": contrastRatio(PALETA.bordeCampo, PALETA.fondo),
  };
  for (const [nombre, valor] of Object.entries(esperado)) {
    assert.ok(Math.abs(medido[nombre] - valor) < 0.002,
      `${nombre}: medido ${medido[nombre].toFixed(3)}, se esperaba ${valor}`);
  }
});
