// Servidor estatico minimo + colector de resultados de las aserciones.
// Sin dependencias: solo modulos nativos de Node 22.
//
//   node tools/serve.mjs [puerto]
//
// Sirve el repositorio en http://127.0.0.1:<puerto>/ y acepta
// POST /__resultado, cuyo cuerpo imprime por stdout. Ese canal es lo que
// permite que el arnese de pruebas entregue sus resultados sin depender de
// --dump-dom, que Firefox no tiene.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";

const RAIZ = resolve(import.meta.dirname, "..");
const PUERTO = Number(process.argv[2] || 8000);

const TIPOS = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon",
};

const servidor = createServer(async (peticion, respuesta) => {
  const url = new URL(peticion.url, `http://${peticion.headers.host}`);

  if (peticion.method === "POST" && url.pathname === "/__resultado") {
    const trozos = [];
    for await (const trozo of peticion) trozos.push(trozo);
    const cuerpo = Buffer.concat(trozos).toString("utf8");
    // Una linea por asercion, precedida de un marcador para que el
    // llamador pueda recortar la salida sin depender del resto del log.
    console.log(cuerpo);
    respuesta.writeHead(204, { "Access-Control-Allow-Origin": "*" });
    return respuesta.end();
  }

  if (process.env.SERVE_MODO === "verbose") {
    console.log(`  ${peticion.method} ${url.pathname}`);
  }

  let ruta = normalize(decodeURIComponent(url.pathname));
  if (ruta.includes("..")) {
    respuesta.writeHead(400);
    return respuesta.end("ruta invalida");
  }
  if (ruta.endsWith("/")) ruta += "index.html";

  const archivo = join(RAIZ, ruta);
  if (!archivo.startsWith(RAIZ)) {
    respuesta.writeHead(403);
    return respuesta.end("fuera de la raiz");
  }

  try {
    const info = await stat(archivo);
    if (!info.isFile()) throw new Error("no es un archivo");
    const contenido = await readFile(archivo);
    respuesta.writeHead(200, {
      "Content-Type": TIPOS[extname(archivo).toLowerCase()] || "application/octet-stream",
      "Content-Length": contenido.length,
      "Cache-Control": "no-store",
    });
    return respuesta.end(contenido);
  } catch {
    respuesta.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return respuesta.end("404 " + ruta);
  }
});

servidor.listen(PUERTO, "127.0.0.1", () => {
  console.log(`LISTO http://127.0.0.1:${PUERTO}/`);
});
