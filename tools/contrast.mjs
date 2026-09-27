// Calculo de contraste segun WCAG 2.1, sin dependencias.
//
// El sitio fija su paleta y este archivo es lo que decide si esa paleta es
// admisible. La razon de que sea codigo y no una afirmacion en el documento es
// que un color que no se puede comprobar con una calculadora termina usado en
// texto de cuerpo por Custom es pronto o tarde, y solo entonces se descubre.

/**
 * Convierte "#RRGGBB" o "RRGGBB" a los tres canales 0-255.
 * @param {string} hex
 * @returns {[number, number, number]}
 */
export function parseHex(hex) {
  const limpio = String(hex).trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(limpio)) {
    throw new Error(`Color hexadecimal invalido: "${hex}"`);
  }
  return [
    parseInt(limpio.slice(0, 2), 16),
    parseInt(limpio.slice(2, 4), 16),
    parseInt(limpio.slice(4, 6), 16),
  ];
}

/**
 * Luminancia relativa segun WCAG.
 * @param {[number, number, number]} rgb
 * @returns {number} entre 0 y 1
 */
export function luminance([r, g, b]) {
  const canal = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/**
 * Razon de contraste entre dos colores.
 * @param {string} hexA
 * @param {string} hexB
 * @returns {number} entre 1 y 21
 */
export function contrastRatio(hexA, hexB) {
  const a = luminance(parseHex(hexA));
  const b = luminance(parseHex(hexB));
  const claro = Math.max(a, b);
  const oscuro = Math.min(a, b);
  return (claro + 0.05) / (oscuro + 0.05);
}

/**
 * Si un par de colores cumple el nivel AA de WCAG.
 * "large" es texto de 18.66 px o mas, o de 14 px en negrita, y exige 3:1.
 * @param {string} hexA
 * @param {string} hexB
 * @param {"normal" | "large"} tamano
 * @returns {boolean}
 */
export function wcagAA(hexA, hexB, tamano = "normal") {
  return contrastRatio(hexA, hexB) >= (tamano === "large" ? 3 : 4.5);
}
