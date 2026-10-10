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
  demo: /^(demo|app|simulador)(\s+(celular|android|iphone|imac|proyector|projector|tv))?$/i,
  dispositivos: /^(dispositivos|devices|pantallas)$/i,
  color: /^(color|colore|couleur|farbe|cor)$/i,
  lista: /^(lista|playlist|youtube)$/i,
  directo: /^(directo|redirigir|abrir directo)$/i,
  portadaTexto: /^(portada texto|texto portada|cover text)$/i,
  videos: /^(videos|v[ií]deos de portada)$/i,
  emblema: /^(emblema|logo)$/i,
  reproductor: /^(reproductor|player|m[uú]sica)$/i,
};
const DISPOSITIVOS = ['celular', 'android', 'iphone', 'imac', 'proyector', 'tv'];

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
  const info = { titulo: {}, texto: {}, fecha: '', enlace: '', portada: '', demo: {}, dispositivos: [], color: '', lista: '', directo: false, portadaTexto: '', videos: [], reproductor: '', emblema: '' };
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
      } else if (clave === 'videos') {
        info.videos = m[2].split(/[,;\s]+/).map((v) => (v.match(/(?:v=|youtu\.be\/)([\w-]{11})/) || [, v])[1]).filter((v) => /^[\w-]{11}$/.test(v));
      } else if (clave === 'directo') {
        info.directo = /^(s[ií]|yes|oui|ja|sim|true|1)$/i.test(m[2].trim());
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
  const item = { carpeta, ruta: rel, titulo: {}, texto: {}, fecha: '', enlace: '', portada: '', demo: {}, dispositivos: [], color: '', lista: '', directo: false, portadaTexto: '', videos: [], reproductor: '', emblema: '', fotos: {}, archivos: [], partes: [], subido: '' };
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
      for (const k of ['fecha', 'enlace', 'portada', 'color', 'lista', 'portadaTexto', 'reproductor', 'emblema']) if (info[k]) item[k] = info[k];
      if (info.videos.length) item.videos = info.videos;
      if (info.directo) item.directo = true;
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

// ---------------------------------------------------------------------------
// Videos de las listas de YouTube ("Lista:" en Info.txt).
// Se leen al publicar (GitHub Actions corre esto también una vez por día),
// así un video nuevo en la lista aparece solo en el sitio.
// ---------------------------------------------------------------------------
const idDeLista = (u = '') => (String(u).match(/[?&]list=([\w-]{10,})/) || [])[1] || '';
const NAV = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36', 'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8', Cookie: 'CONSENT=YES+1; SOCS=CAI' };

function juntarVideos(nodo, salida) {
  if (!nodo || typeof nodo !== 'object') return;
  if (Array.isArray(nodo)) { nodo.forEach((x) => juntarVideos(x, salida)); return; }
  const r = nodo.playlistVideoRenderer;
  if (r && r.videoId) {
    const titulo = (r.title && (r.title.simpleText || (r.title.runs || []).map((x) => x.text).join(''))) || '';
    salida.push({ id: r.videoId, titulo, segundos: Number(r.lengthSeconds) || 0 });
    return;
  }
  for (const k of Object.keys(nodo)) juntarVideos(nodo[k], salida);
}

async function videosDeLista(id) {
  const ctrl = AbortSignal.timeout(15000);
  try {
    const html = await (await fetch(`https://www.youtube.com/playlist?list=${id}&hl=es`, { headers: NAV, signal: ctrl })).text();
    const m = html.match(/var ytInitialData\s*=\s*(\{[\s\S]*?\});\s*<\/script>/) || html.match(/ytInitialData"\]\s*=\s*(\{[\s\S]*?\});/);
    if (m) {
      const lista = [];
      juntarVideos(JSON.parse(m[1]), lista);
      const vistos = new Set();
      const unicos = lista.filter((v) => !vistos.has(v.id) && vistos.add(v.id) && !/^\[(private|deleted)/i.test(v.titulo));
      if (unicos.length) return unicos;
    }
  } catch (_) { /* se prueba con el feed */ }
  try {
    const xml = await (await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`, { headers: NAV, signal: AbortSignal.timeout(15000) })).text();
    const entradas = xml.split('<entry>').slice(1).map((e) => ({
      id: (e.match(/<yt:videoId>([^<]+)/) || [])[1],
      titulo: ((e.match(/<title>([^<]*)/) || [])[1] || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
      segundos: 0,
    })).filter((v) => v.id);
    // El feed trae primero lo más nuevo; en una lista de clases conviene el orden de la lista.
    return entradas.reverse();
  } catch (_) {
    return null;
  }
}

const conLista = [];
for (const s of SECCIONES) for (const it of manifest.secciones[s].items) {
  if (idDeLista(it.lista)) conLista.push(it);
  for (const p of it.partes || []) if (idDeLista(p.lista)) conLista.push(p);
}
const resumen = [];
await Promise.all(conLista.map(async (it) => {
  const v = await videosDeLista(idDeLista(it.lista));
  if (v && v.length) it.videosLista = v;
  resumen.push(`${it.carpeta}: ${v ? v.length : 'sin conexión'}`);
}));
if (resumen.length) console.log(`${process.env.GITHUB_ACTIONS ? '::notice title=Videos de YouTube::' : '✓ videos: '}${resumen.join(' · ')}`);
manifest.cv.pdf = (await existe(join(RAIZ, 'cv/cv.pdf'))) ? 'cv/cv.pdf' : null;
await writeFile(join(RAIZ, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

for (const s of SECCIONES) {
  const items = manifest.secciones[s].items;
  console.log(`✓ ${s}: ${items.length} carpetas${items.length ? ` → ${items.map((i) => i.carpeta).join(', ')}` : ''}`);
}
console.log(`✓ cv.pdf: ${manifest.cv.pdf ? 'sí' : 'no'}`);
