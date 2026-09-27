// Verificador del sitio. Levanta el servidor, abre Firefox headless contra el
// arnés y recoge los PASS/FAIL que este le entrega.
//
//   node tools/verificar.mjs [--paginas /es/index.html,/en/index.html]
//                             [--anchos 320,360,768,1440]
//                             [--sin-js]      desactiva JavaScript
//                             [--capturas]    deja una PNG por pagina y ancho
//                             [--solo-estructura]
//
// Sin dependencias: solo modulos nativos de Node 22. Sale con codigo 1 si hay
// una sola comprobacion en FAIL, para que sirva como puerta en un script.

import { spawn, execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const opcion = (n, d) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const bandera = (n) => args.includes(n);

const PAGINAS = opcion("--paginas", "/es/index.html,/en/index.html").split(",").filter(Boolean);
const ANCHOS = opcion("--anchos", "320,360,768,1440");
const SIN_JS = bandera("--sin-js");
const CAPTURAS = bandera("--capturas");
const PUERTO = Number(opcion("--puerto", "8123"));
const ESPERA_MS = Number(opcion("--espera", "90")) * 1000;

// ------------------------------------------------------------- Firefox

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

// El perfil tiene que vivir en un directorio que el proceso de Windows pueda
// escribir, y tiene que estar limpio: un perfil con estado heredado (un proxy
// configurado, una sesion restaurada) hace que Firefox no cargue nada y salga
// con codigo 0 sin dejar rastro.
//
// Cada corrida usa un directorio propio en vez de borrar uno compartido: un
// Firefox que quedo abierto sigue teniendo bloqueados los archivos de su
// perfil, y un rm fallido a mitad de la corrida aborta la verificacion entera.
const SUFIJO = process.pid;
const BASE_PERFIL = (EN_WINDOWS ? "/mnt/c/" : "/tmp/") + "ff-perfil-verif-" + SUFIJO;
const perfilWin  = EN_WINDOWS ? "C:\\ff-perfil-verif-" + SUFIJO : BASE_PERFIL;
const CARPETA_CAPTURAS = join(RAIZ, "tools", "capturas");

function limpiarPerfilesViejos() {
  const raiz = EN_WINDOWS ? "/mnt/c" : "/tmp";
  let entradas = [];
  try { entradas = readdirSync(raiz); } catch { return; }
  for (const nombre of entradas) {
    if (!nombre.startsWith("ff-perfil-verif-")) continue;
    if (EN_WINDOWS) {
      try { execFileSync("taskkill.exe", ["/F", "/IM", "firefox.exe"], { stdio: "ignore" }); } catch {}
    }
    // Los archivos pueden seguir en uso: es un descarte, no un requisito.
    try { rmSync(join(raiz, nombre), { recursive: true, force: true }); } catch {}
  }
}

function perfilLimpio() {
  mkdirSync(BASE_PERFIL, { recursive: true });
  const prefs = [
    'user_pref("browser.shell.checkDefaultBrowser", false);',
    'user_pref("browser.startup.homepage_override.mstone", "ignore");',
    'user_pref("datareporting.policy.dataSubmissionEnabled", false);',
    'user_pref("toolkit.telemetry.reportingpolicy.firstRun", false);',
    'user_pref("app.update.auto", false);',
    'user_pref("browser.sessionstore.resume_from_crash", false);',
  ];
  if (SIN_JS) {
    // Firefox no tiene opcion de linea de comandos para esto: es una
    // preferencia del perfil.
    prefs.push('user_pref("javascript.enabled", false);');
  }
  writeFileSync(join(BASE_PERFIL, "user.js"), prefs.join("\n") + "\n");
}

// ------------------------------------------------------------- servidor

function levantarServidor() {
  const hijo = spawn(process.execPath, [join(RAIZ, "tools", "serve.mjs"), String(PUERTO)], {
    cwd: RAIZ, stdio: ["ignore", "pipe", "inherit"],
  });
  let acumulado = "";
  hijo.stdout.on("data", (d) => { acumulado += d.toString(); });
  return { hijo, leer: () => acumulado };
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function puertoLibre(puerto) {
  try {
    execFileSync("bash", ["-c",
      `exec 3<>/dev/tcp/127.0.0.1/${puerto}`], { stdio: "ignore" });
    return false;
  } catch { return true; }
}

// ------------------------------------------------------------- corrida

async function correr() {
  if (!puertoLibre(PUERTO)) {
    console.error(`El puerto ${PUERTO} esta ocupado. Usa --puerto.`);
    process.exit(2);
  }

  const servidor = levantarServidor();
  await esperar(900);

  console.log(`Firefox:  ${encontrado}`);
  console.log(`Servidor: http://localhost:${PUERTO}`);
  console.log(`Paginas:  ${PAGINAS.join(", ")}`);
  console.log(`Anchos:   ${ANCHOS}`);
  if (SIN_JS) console.log("JavaScript: DESACTIVADO");
  console.log("");

  limpiarPerfilesViejos();
  perfilLimpio();
  const destino = EN_WINDOWS ? perfilWin : BASE_PERFIL;
  if (CAPTURAS) rmSync(CARPETA_CAPTURAS, { recursive: true, force: true });
  mkdirSync(CARPETA_CAPTURAS, { recursive: true });

  const ff = spawn(encontrado, [
    "--headless", "--profile", destino, "--window-size", "1400,1000",
    "--screenshot", join(destino, "verificacion.png"),
    `http://localhost:${PUERTO}/tools/check.html?p=${encodeURIComponent(PAGINAS.join(","))}&w=${ANCHOS}`,
  ], { stdio: "ignore" });

  // Si el script aborta por una excepcion, el servidor hijo se queda
  // escuchando y ocupa el puerto de la corrida siguiente.
  const terminar = () => { try { ff.kill(); } catch {} };
  process.on("exit", terminar);
  process.on("SIGINT", () => { terminar(); process.exit(130); });
  process.on("uncaughtException", (e) => {
    console.error("ERROR: " + e.message);
    terminar();
    process.exit(2);
  });

  try {
    const limite = Date.now() + ESPERA_MS;
    let cuerpo = "";
    while (Date.now() < limite) {
      const acumulado = servidor.leer();
      const m = acumulado.match(/RESULTADO\n([\s\S]*?)\nFIN/);
      if (m) { cuerpo = m[1]; break; }
      if (ff.exitCode !== null) {
        await esperar(500);
        const m2 = servidor.leer().match(/RESULTADO\n([\s\S]*?)\nFIN/);
        cuerpo = m2 ? m2[1] : "";
        break;
      }
      await esperar(250);
    }

    if (!cuerpo) {
      console.error("El arnés no entrego ningun resultado.");
      console.error("Firefox sale con codigo 0 tambien cuando no carga nada, asi que el");
      console.error("codigo de salida no dice nada. Si es la primera corrida tras");
      console.error("instalar Firefox, reintenta: el primer arranque es lento.");
      process.exitCode = 2;
      return;
    }

    const lineas = cuerpo.split("\n").filter(Boolean);
    for (const l of lineas) console.log("  " + l);

    const fallos = lineas.filter((l) => l.startsWith("FAIL "));
    console.log("");
    console.log(`COMPROBACIONES: ${lineas.length}   FALLOS: ${fallos.length}`);
    if (fallos.length) process.exitCode = 1;
  // Las capturas van despues de las comprobaciones y no durante: cada una
  // necesita su propio proceso de Firefox, y el proceso que evalua el arnes
  // ya termino su trabajo. Se reaprovecha tools/capturar.mjs, que es el que
  // sabe traducir las rutas y esperar a que exista el archivo.
  if (CAPTURAS) {
    const hechos = [];
    for (const pagina of PAGINAS) {
      for (const ancho of ANCHOS.split(",")) {
        const nombre = pagina.replace(/^\//, "").replace(/[/.]/g, "-").replace(/^-/, "") || "raiz";
        const salida = join(CARPETA_CAPTURAS, `${nombre}--${ancho}.png`);
        const r = spawnSync(process.execPath, [
          join(RAIZ, "tools", "capturar.mjs"),
          `http://localhost:${PUERTO}${pagina}`,
          salida,
          String(ancho),
          "1400",
        ], { stdio: "ignore" });
        if (r.status === 0 && existsSync(salida)) {
          hechos.push(salida);
        } else {
          console.error(`  No se pudo capturar ${pagina} a ${ancho} px`);
          process.exitCode = process.exitCode || 2;
        }
      }
    }
    if (hechos.length) {
      console.log("");
      console.log(`CAPTURAS: ${hechos.length} en ${CARPETA_CAPTURAS}`);
      for (const h of hechos) console.log("  " + h);
    }
  }

  } finally {
    terminar();
    try { servidor.hijo.kill(); } catch {}
    try { rmSync(BASE_PERFIL, { recursive: true, force: true }); } catch {}
  }
}

correr();
