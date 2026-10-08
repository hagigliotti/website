#!/usr/bin/env node
// Lee las carpetas Projects, Trips y Works y genera manifest.json, que es lo que usa el sitio.
// Se ejecuta solo en GitHub Actions cada vez que subís algo. Para probar en tu compu:
//   node scripts/build-manifest.mjs

import { readdir, readFile, stat, writeFile, access } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const RAIZ = decodeURIComponent(new URL('..', import.meta.url).pathname);
const SECCIONES = ['Projects', 'Trips', 'Works'];
const LANGS = ['es', 'en', 'fr', 'de', 'pt', 'it'];

const TIPOS = {
  imagen: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  pdf: ['.pdf'],
  texto: ['.txt'],
  markdown: ['.md', '.markdown'],
};
const tipoDe = (n) => {
  const e = extname(n).toLowerCase();
  return Object.keys(TIPOS).find((t) => TIPOS[t].includes(e)) || 'otro';
};
const ordenar = (a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' });
const existe = (p) => access(p).then(() => true, () => false);
const esInfo = (n) => /^info(\.(es|en|fr|de|pt|it))?\.txt$/i.test(n);
const esFotos = (n) => /^fotos?(\.(es|en|fr|de|pt|it))?\.txt$/i.test(n) || /^photos?(\.(es|en|fr|de|pt|it))?\.txt$/i.test(n);
const esOrden = (n) => /^orden\.txt$/i.test(n);
const esPortada = (n) => /^(portada|cover|caratula|carátula|tapa)\.[a-z]+$/i.test(n);

const CLAVES = {
  titulo: /^(t[ií]tulo|title|titre|titel|titolo)$/i,
  fecha: /^(fecha|date|a[ñn]o|year|datum|data|anno|ann[ée]e)$/i,
  enlace: /^(enlace|link|url|web|sitio)$/i,
  portada: /^(portada|cover|car[áa]tula|tapa)$/i,
  demo: /^(demo|app|simulador)(\s+(iphone|imac|proyector|projector|tv))?$/i,
  dispositivos: /^(dispositivos|devices|pantallas)$/i,
  color: /^(color|colore|couleur|farbe|cor)$/i,
  lista: /^(lista|playlist|youtube|videos)$/i,
};
const DISPOSITIVOS = ['iphone', 'imac', 'proyector', 'tv'];

// Separa un texto en bloques por idioma: líneas [es], [en], [fr]... El texto sin marca vale para todos.
function bloquesPorIdioma(texto) {
  const bloques = { _: [] };
  let actual = '_';
  for (const linea of texto.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n')) {
    const m = linea.trim().match(/^\[(es|en|fr|de|pt|it)\]$/i);
    if (m) { actual = m[1].toLowerCase(); bloques[actual] = bloques[actual] || []; continue; }
    bloques[actual].push(linea);
  }
  return Object.fromEntries(Object.entries(bloques).map(([k, v]) => [k, v.join('\n').trim()]).filter(([, v]) => v));
}

// Info.txt: primeras líneas opcionales "Título: …", "Fecha: …", "Enlace: …", "Portada: …"; el resto es la descripción.
function parsearInfo(texto, idiomaArchivo) {
  const info = { titulo: {}, texto: {}, fecha: '', enlace: '', portada: '', demo: {}, dispositivos: [], color: '', lista: '' };
  const bloques = bloquesPorIdioma(texto);
  for (const [lang, contenido] of Object.entries(bloques)) {
    const destino = idiomaArchivo && lang === '_' ? idiomaArchivo : lang;
    const lineas = contenido.split('\n');
    let i = 0;
    for (; i < lineas.length; i++) {
      const l = lineas[i].trim();
      if (!l) continue;
      const m = l.match(/^([^:]{2,20}):\s*(.+)$/);
      const clave = m && Object.keys(CLAVES).find((k) => CLAVES[k].test(m[1].trim()));
      if (!clave || /^https?$/i.test(m[1])) break;
      if (clave === 'titulo') info.titulo[destino] = m[2].trim();
      else if (clave === 'demo') {
        const disp = (m[1].trim().split(/\s+/)[1] || '_').toLowerCase().replace('projector', 'proyector');
        info.demo[disp] = m[2].trim();
      } else if (clave === 'dispositivos') {
        info.dispositivos = m[2].toLowerCase().replace(/projector/g, 'proyector').split(/[,;\s]+/).filter((d) => DISPOSITIVOS.includes(d));
      } else info[clave] = m[2].trim();
    }
    const desc = lineas.slice(i).join('\n').trim();
    if (desc) info.texto[destino] = desc;
  }
  return info;
}

// Fotos.txt: una línea por foto → "archivo.jpg: descripción". Acepta bloques [en], [fr]...
function parsearFotos(texto, idiomaArchivo, destino) {
  for (const [lang, contenido] of Object.entries(bloquesPorIdioma(texto))) {
    const l2 = idiomaArchivo && lang === '_' ? idiomaArchivo : lang;
    for (const linea of contenido.split('\n')) {
      const m = linea.match(/^\s*([^:]+?\.(jpe?g|png|webp|gif|avif))\s*[:=-]\s*(.+)$/i);
      if (!m) continue;
      const clave = m[1].trim().toLowerCase();
      destino[clave] = destino[clave] || {};
      destino[clave][l2] = m[3].trim();
    }
  }
}

function fechaGit(ruta) {
  try {
    const salida = execFileSync('git', ['log', '--diff-filter=A', '--format=%aI', '--', ruta], { cwd: RAIZ, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const lineas = salida.split('\n').filter(Boolean);
    return lineas.length ? lineas[lineas.length - 1] : '';
  } catch (_) {
    return '';
  }
}

async function archivosDe(dir, rel) {
  const lista = [];
  for (const e of (await readdir(dir, { withFileTypes: true })).sort((a, b) => ordenar(a.name, b.name))) {
    if (e.name.startsWith('.') || e.name.startsWith('_')) continue;
    if (e.isDirectory()) lista.push(...(await archivosDe(join(dir, e.name), `${rel}/${e.name}`)));
    else if (e.isFile()) lista.push({ nombre: e.name, ruta: `${rel}/${e.name}`, abs: join(dir, e.name) });
  }
  return lista;
}

// Una subcarpeta con su propio Info.txt es una "parte" independiente del proyecto
// (por ejemplo, cada clase de Conquistadores). Sus archivos no se mezclan con los del proyecto.
async function esParte(abs) {
  try { return (await readdir(abs)).some(esInfo); } catch (_) { return false; }
}

async function leerCarpeta(seccion, carpeta, profundidad = 0) {
  const rel = `${seccion}/${carpeta}`;
  const dirAbs = join(RAIZ, rel);
  const item = { carpeta, ruta: rel, titulo: {}, texto: {}, fecha: '', enlace: '', portada: '', demo: {}, dispositivos: [], color: '', lista: '', fotos: {}, archivos: [], partes: [], subido: '' };
  const subPartes = [];
  if (profundidad === 0) {
    for (const e of (await readdir(dirAbs, { withFileTypes: true })).sort((a, b) => ordenar(a.name, b.name))) {
      if (e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_') && (await esParte(join(dirAbs, e.name)))) subPartes.push(e.name);
    }
  }
  for (const sp of subPartes) item.partes.push(await leerCarpeta(rel, sp, profundidad + 1));
  const todos = (await archivosDe(dirAbs, rel)).filter((a) => !subPartes.some((sp) => a.ruta.startsWith(`${rel}/${sp}/`)));
  const nivelInfo = rel.split('/').length + 1;

  const nombresImagen = new Set(todos.filter((a) => tipoDe(a.nombre) === 'imagen').map((a) => a.nombre.replace(/\.[^.]+$/, '').toLowerCase()));
  for (const a of todos) {
    const idiomaArch = (a.nombre.match(/\.(es|en|fr|de|pt|it)\.txt$/i) || [])[1];
    if (esInfo(a.nombre) && a.ruta.split('/').length === nivelInfo) {
      const info = parsearInfo(await readFile(a.abs, 'utf8'), idiomaArch && idiomaArch.toLowerCase());
      Object.assign(item.titulo, info.titulo);
      Object.assign(item.texto, info.texto);
      for (const k of ['fecha', 'enlace', 'portada', 'color', 'lista']) if (info[k]) item[k] = info[k];
      Object.assign(item.demo, info.demo);
      if (info.dispositivos.length) item.dispositivos = info.dispositivos;
      continue;
    }
    if (esFotos(a.nombre)) { parsearFotos(await readFile(a.abs, 'utf8'), idiomaArch && idiomaArch.toLowerCase(), item.fotos); continue; }
    const tipo = tipoDe(a.nombre);
    if (tipo === 'otro') continue;
    // foto1.txt junto a foto1.jpg = descripción de esa foto
    const base = a.nombre.replace(/\.[^.]+$/, '').toLowerCase();
    if (tipo === 'texto' && nombresImagen.has(base.replace(/\.(es|en|fr|de|pt|it)$/i, ''))) {
      const imagen = todos.find((x) => tipoDe(x.nombre) === 'imagen' && x.nombre.replace(/\.[^.]+$/, '').toLowerCase() === base.replace(/\.(es|en|fr|de|pt|it)$/i, ''));
      const clave = imagen.nombre.toLowerCase();
      item.fotos[clave] = item.fotos[clave] || {};
      item.fotos[clave][idiomaArch ? idiomaArch.toLowerCase() : '_'] = (await readFile(a.abs, 'utf8')).trim();
      continue;
    }
    item.archivos.push({ nombre: a.nombre, ruta: a.ruta, tipo, bytes: (await stat(a.abs)).size });
  }

  const imagenes = item.archivos.filter((a) => a.tipo === 'imagen');
  if (item.portada) {
    const p = imagenes.find((a) => a.nombre.toLowerCase() === item.portada.toLowerCase());
    item.portada = p ? p.ruta : '';
  }
  if (!item.portada) {
    const p = imagenes.find((a) => esPortada(a.nombre)) || imagenes[0];
    item.portada = p ? p.ruta : '';
  }
  // La portada no se repite dentro del álbum si hay otras fotos.
  if (item.dispositivos.length && !item.demo._) item.demo._ = item.enlace;
  item.subido = fechaGit(rel) || (await stat(dirAbs)).mtime.toISOString();
  return item;
}

async function leerSeccion(seccion) {
  const dir = join(RAIZ, seccion);
  if (!(await existe(dir))) return { items: [] };
  const carpetas = (await readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_')).map((e) => e.name);
  const items = [];
  for (const c of carpetas) items.push(await leerCarpeta(seccion, c));

  // Orden: los más nuevos primero (por "Fecha:" del Info.txt o, si no hay, por fecha de subida a GitHub).
  // Orden.txt (opcional) fija a mano el orden de las carpetas que nombra; las demás van antes, por ser más nuevas.
  let fijo = [];
  const archivoOrden = (await readdir(dir)).find(esOrden);
  if (archivoOrden) fijo = (await readFile(join(dir, archivoOrden), 'utf8')).split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  const clave = (it) => it.fecha || it.subido || '';
  items.sort((a, b) => {
    const ia = fijo.indexOf(a.carpeta);
    const ib = fijo.indexOf(b.carpeta);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return 1;
    if (ib >= 0) return -1;
    return clave(b).localeCompare(clave(a)) || ordenar(a.carpeta, b.carpeta);
  });
  return { items };
}

const manifest = { generado: new Date().toISOString(), idiomas: LANGS, secciones: {}, cv: {} };
for (const s of SECCIONES) manifest.secciones[s] = await leerSeccion(s);
manifest.cv.pdf = (await existe(join(RAIZ, 'cv/cv.pdf'))) ? 'cv/cv.pdf' : null;
await writeFile(join(RAIZ, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

for (const s of SECCIONES) {
  const items = manifest.secciones[s].items;
  console.log(`✓ ${s}: ${items.length} carpetas${items.length ? ` → ${items.map((i) => i.carpeta).join(', ')}` : ''}`);
}
console.log(`✓ cv.pdf: ${manifest.cv.pdf ? 'sí' : 'no'}`);
