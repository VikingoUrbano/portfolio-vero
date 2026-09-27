// Captura una pagina con Firefox headless en un tamano exacto.
//
//   node tools/capturar.mjs <url> <salida.png> [ancho] [alto]
//
// Sin dependencias: solo modulos nativos de Node 22.
//
// Detras de esto hay una limitacion del entorno, no de Firefox: el navegador es
// un proceso de Windows y no puede escribir en una ruta de WSL. Firefox acepta
// rutas relativas al directorio de trabajo, asi que se cambia el directorio de
// trabajo al del archivo de salida y se le pasa un nombre pelado. Asi el
// destino puede ser cualquier ruta de Windows sin conversiones en el comando.

import { spawn, execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const [url, salida, ancho = "1200", alto = "630"] = process.argv.slice(2);

if (!url || !salida) {
  console.error("Uso: node tools/capturar.mjs <url> <salida.png> [ancho] [alto]");
  process.exit(2);
}

const EN_WINDOWS = existsSync("/mnt/c/Windows");
const CANDIDATOS = EN_WINDOWS
  ? ["/mnt/c/Program Files/Mozilla Firefox/firefox.exe",
     "/mnt/c/Program Files (x86)/Mozilla Firefox/firefox.exe"]
  : ["/usr/bin/firefox", "/usr/bin/firefox-esr",
     "/snap/bin/firefox", "/Applications/Firefox.app/Contents/MacOS/firefox"];

const encontrado = CANDIDATOS.find(existsSync);
if (!encontrado) {
  console.error("No se encontro Firefox. Probadas:\n  " + CANDIDATOS.join("\n  "));
  process.exit(2);
}

const destino = resolve(salida);
mkdirSync(dirname(destino), { recursive: true });

// Perfil propio y limpio: uno con estado heredado hace que Firefox no cargue
// nada y salga con codigo 0 sin dejar rastro.
const dirPerfil = (EN_WINDOWS ? "/mnt/c/" : "/tmp/") + "ff-captura-" + process.pid;
const perfilWin = EN_WINDOWS ? "C:\\ff-captura-" + process.pid : dirPerfil;
rmSync(dirPerfil, { recursive: true, force: true });
mkdirSync(dirPerfil, { recursive: true });
writeFileSync(join(dirPerfil, "user.js"), [
  'user_pref("browser.shell.checkDefaultBrowser", false);',
  'user_pref("browser.startup.homepage_override.mstone", "ignore");',
  'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
  'user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);',
  'user_pref("app.update.auto", false);',
].join("\n") + "\n");

const nombreTemporal = "captura-" + process.pid + ".png";
// La ruta del archivo de salida tiene que ser una ruta de Windows, no la de
// WSL. Firefox es un proceso de Windows: su directorio de trabajo no es el
// que le paso con cwd, y un nombre pelado queda flotando en un sitio
// imposible de adivinar. El directorio del perfil ya es el mismo, asi que
// la conversion es una sola.
const capturaWin = EN_WINDOWS
  ? "C:\\ff-captura-" + process.pid + "\\" + nombreTemporal
  : nombreTemporal;

const ff = spawn(encontrado, [
  "--headless",
  "--profile", perfilWin,
  "--window-size", `${ancho},${alto}`,
  "--screenshot", capturaWin,
  url,
], { stdio: "ignore" });

const limite = Date.now() + 90000;
const producido = join(dirPerfil, nombreTemporal);

while (Date.now() < limite) {
  if (ff.exitCode !== null) break;
  await new Promise((r) => setTimeout(r, 200));
}
try { ff.kill(); } catch {}

// Firefox con --screenshot dispara cuando la pagina carga. Se comprobo que a
// ese momento las fuentes web ya estan aplicadas: dos capturas identicas
// salvo por poner font-family: serif en el h1 salen en bytes distintos, asi
// que la tarjeta sale con Fraunces y no con Georgia. No hace falta esperar a
// document.fonts.ready, ni embeber las fuentes como data URI, que ademas
// engordaria el generador en 150 KB.
if (existsSync(producido)) {
  // Copiar y no renombrar: el perfil vive en /mnt/c y la salida casi siempre
  // esta en /mnt/d, que son dispositivos distintos. renameSync falla con
  // EXDEV entre los dos, y este archivo no habria podido escribir nada.
  // escribir nada.
  copyFileSync(producido, destino);
  rmSync(dirPerfil, { recursive: true, force: true });
  console.log("OK " + destino);
} else {
  console.error("Firefox no produjo la captura de " + url);
  try { rmSync(dirPerfil, { recursive: true, force: true }); } catch {}
  process.exitCode = 1;
}
