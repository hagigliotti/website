// Reproductor de música al estilo Apple Music / Spotify.
// - La lista sale de _cantos.json (títulos, duración y tapa ya leídos de cada archivo)
//   y se completa con los archivos nuevos que haya en el repositorio de medios (API de GitHub).
// - El <audio> vive fuera de las páginas: la música sigue sonando mientras se navega el sitio,
//   con un mini reproductor flotante abajo.
// - La letra se toma del Cancionero MV (mismo id que el nombre del archivo).

import { idioma } from './i18n.js';

const LETRAS_URL = 'https://hagigliotti.github.io/cancionero_mv/data/canciones.json';
const CACHE_HORAS = 6;

const TXT = {
  es: { canciones: 'Canciones', letra: 'Letra', buscar: 'Buscar un canto', sin_letra: 'Este canto todavía no tiene la letra cargada.', reproducir: 'Reproducir', pausar: 'Pausar', siguiente: 'Siguiente', anterior: 'Anterior', aleatorio: 'Aleatorio', repetir: 'Repetir', repetir_uno: 'Repetir este canto', volumen: 'Volumen', cerrar: 'Detener y cerrar', sonando: 'Sonando ahora', elegir: 'Elegí un canto para empezar', error: 'No se pudo reproducir este canto.', sin_resultados: 'No hay cantos con ese nombre.', n: '{n} cantos', todo: 'Reproducir todo', abrir: 'Abrir el reproductor', cargando: 'Cargando cantos…' },
  en: { canciones: 'Songs', letra: 'Lyrics', buscar: 'Search a song', sin_letra: 'The lyrics for this song have not been added yet.', reproducir: 'Play', pausar: 'Pause', siguiente: 'Next', anterior: 'Previous', aleatorio: 'Shuffle', repetir: 'Repeat', repetir_uno: 'Repeat this song', volumen: 'Volume', cerrar: 'Stop and close', sonando: 'Now playing', elegir: 'Pick a song to start', error: 'This song could not be played.', sin_resultados: 'No songs with that name.', n: '{n} songs', todo: 'Play all', abrir: 'Open the player', cargando: 'Loading songs…' },
  fr: { canciones: 'Chants', letra: 'Paroles', buscar: 'Chercher un chant', sin_letra: 'Les paroles de ce chant n’ont pas encore été ajoutées.', reproducir: 'Lire', pausar: 'Pause', siguiente: 'Suivant', anterior: 'Précédent', aleatorio: 'Aléatoire', repetir: 'Répéter', repetir_uno: 'Répéter ce chant', volumen: 'Volume', cerrar: 'Arrêter et fermer', sonando: 'En cours de lecture', elegir: 'Choisissez un chant pour commencer', error: 'Impossible de lire ce chant.', sin_resultados: 'Aucun chant avec ce nom.', n: '{n} chants', todo: 'Tout lire', abrir: 'Ouvrir le lecteur', cargando: 'Chargement des chants…' },
  de: { canciones: 'Lieder', letra: 'Text', buscar: 'Lied suchen', sin_letra: 'Der Text zu diesem Lied wurde noch nicht hinzugefügt.', reproducir: 'Abspielen', pausar: 'Pause', siguiente: 'Weiter', anterior: 'Zurück', aleatorio: 'Zufällig', repetir: 'Wiederholen', repetir_uno: 'Dieses Lied wiederholen', volumen: 'Lautstärke', cerrar: 'Stoppen und schließen', sonando: 'Läuft gerade', elegir: 'Wähle ein Lied zum Starten', error: 'Dieses Lied konnte nicht abgespielt werden.', sin_resultados: 'Kein Lied mit diesem Namen.', n: '{n} Lieder', todo: 'Alle abspielen', abrir: 'Player öffnen', cargando: 'Lieder werden geladen…' },
  pt: { canciones: 'Cânticos', letra: 'Letra', buscar: 'Buscar um cântico', sin_letra: 'A letra deste cântico ainda não foi adicionada.', reproducir: 'Tocar', pausar: 'Pausar', siguiente: 'Próximo', anterior: 'Anterior', aleatorio: 'Aleatório', repetir: 'Repetir', repetir_uno: 'Repetir este cântico', volumen: 'Volume', cerrar: 'Parar e fechar', sonando: 'Tocando agora', elegir: 'Escolha um cântico para começar', error: 'Não foi possível tocar este cântico.', sin_resultados: 'Nenhum cântico com esse nome.', n: '{n} cânticos', todo: 'Tocar tudo', abrir: 'Abrir o player', cargando: 'Carregando cânticos…' },
  it: { canciones: 'Canti', letra: 'Testo', buscar: 'Cerca un canto', sin_letra: 'Il testo di questo canto non è ancora stato aggiunto.', reproducir: 'Riproduci', pausar: 'Pausa', siguiente: 'Successivo', anterior: 'Precedente', aleatorio: 'Casuale', repetir: 'Ripeti', repetir_uno: 'Ripeti questo canto', volumen: 'Volume', cerrar: 'Ferma e chiudi', sonando: 'In riproduzione', elegir: 'Scegli un canto per iniziare', error: 'Impossibile riprodurre questo canto.', sin_resultados: 'Nessun canto con questo nome.', n: '{n} canti', todo: 'Riproduci tutto', abrir: 'Apri il lettore', cargando: 'Caricamento dei canti…' },
};
const tx = (k, vars) => {
  let s = (TXT[idioma] || TXT.es)[k] || TXT.es[k] || k;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, b);
  return s;
};

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const urlRuta = (r) => r.split('/').map(encodeURIComponent).join('/');
const normal = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, '');
const mmss = (s) => {
  if (!Number.isFinite(s) || s <= 0) return '–:––';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

const I = {
  play: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"/></svg>',
  pausa: '<svg viewBox="0 0 24 24"><rect fill="currentColor" x="6" y="5" width="4.2" height="14" rx="1.2"/><rect fill="currentColor" x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  sig: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M5 6.2v11.6a.9.9 0 0 0 1.4.76l8.3-5.8a.9.9 0 0 0 0-1.52L6.4 5.44A.9.9 0 0 0 5 6.2Z"/><rect fill="currentColor" x="16.6" y="5.5" width="2.6" height="13" rx="1"/></svg>',
  ant: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.2v11.6a.9.9 0 0 1-1.4.76l-8.3-5.8a.9.9 0 0 1 0-1.52l8.3-5.8A.9.9 0 0 1 19 6.2Z"/><rect fill="currentColor" x="4.8" y="5.5" width="2.6" height="13" rx="1"/></svg>',
  aleatorio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 4.6C14.3 16 15.5 17 17.5 17H21"/><path d="M3 17h3.5c1.4 0 2.4-.5 3.2-1.4M14.3 8.4C15.1 7.5 16.1 7 17.5 7H21"/><path d="m18.5 4.5 2.5 2.5-2.5 2.5M18.5 14.5l2.5 2.5-2.5 2.5"/></svg>',
  repetir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11V9.5A3.5 3.5 0 0 1 7.5 6H19"/><path d="m16 3 3 3-3 3"/><path d="M20 13v1.5a3.5 3.5 0 0 1-3.5 3.5H5"/><path d="m8 21-3-3 3-3"/></svg>',
  volumen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.8 7.8 0 0 1 0 11"/></svg>',
  mudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4Z" fill="currentColor"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
};

/* ------------------------------------------------------------------------ */
/* Estado                                                                   */
/* ------------------------------------------------------------------------ */
const audio = new Audio();
audio.preload = 'metadata';
const est = {
  proyecto: null,      // item del manifest
  pistas: [],          // todas
  cola: [],            // índices en orden de reproducción
  pos: -1,             // posición en la cola
  aleatorio: false,
  repetir: 'no',       // 'no' | 'todo' | 'uno'
  letras: null,        // Promise<Map id → letra>
  filtro: '',
  error: '',
};
try {
  const v = Number(localStorage.getItem('musica_vol'));
  if (v >= 0 && v <= 1 && localStorage.getItem('musica_vol') !== null) audio.volume = v;
} catch (_) { /* nada */ }

const actual = () => (est.pos >= 0 ? est.pistas[est.cola[est.pos]] : null);

function tapaDe(p) {
  if (p && p.portada) return p.portada.startsWith('http') ? p.portada : `${urlRuta(est.proyecto.ruta)}/${urlRuta(p.portada)}`;
  return '';
}
// Tapa generada para cantos sin imagen: degradé con el color propio del canto.
function tono(id) {
  let h = 0;
  for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
function tapaHTML(p, clase = '') {
  const src = tapaDe(p);
  if (src) return `<span class="tapa ${clase}"><img src="${esc(src)}" alt="" loading="lazy"></span>`;
  const h = tono(p ? p.id : 'x');
  const letras = p ? p.titulo.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, '').slice(0, 1).toUpperCase() : '♪';
  return `<span class="tapa tapa--gen ${clase}" style="--h:${h}"><b>${esc(letras)}</b></span>`;
}

/* ------------------------------------------------------------------------ */
/* Datos                                                                    */
/* ------------------------------------------------------------------------ */
async function archivosDelRepo(repo, carpeta) {
  const clave = `musica_repo_${repo}`;
  try {
    const c = JSON.parse(localStorage.getItem(clave) || 'null');
    if (c && Date.now() - c.t < CACHE_HORAS * 3600e3) return c.archivos;
  } catch (_) { /* nada */ }
  const r = await fetch(`https://api.github.com/repos/${repo}/git/trees/main?recursive=1`);
  if (!r.ok) throw new Error(`GitHub ${r.status}`);
  const { tree } = await r.json();
  const archivos = tree.filter((x) => x.type === 'blob' && x.path.startsWith(`${carpeta}/`) && /\.(mp3|m4a)$/i.test(x.path))
    .map((x) => x.path.slice(carpeta.length + 1)).filter((x) => !x.includes('/'));
  try { localStorage.setItem(clave, JSON.stringify({ t: Date.now(), archivos })); } catch (_) { /* nada */ }
  return archivos;
}

const bonito = (archivo) => {
  const s = archivo.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export async function cargarMusica(item) {
  if (est.proyecto && est.proyecto.ruta === item.ruta && est.pistas.length) return;
  const datos = await fetch(`${urlRuta(item.ruta)}/${urlRuta(item.reproductor)}`, { cache: 'no-cache' }).then((r) => r.json());
  let pistas = datos.pistas.map((p) => ({ ...p, url: datos.base + encodeURIComponent(p.archivo) }));
  try {
    const enRepo = await archivosDelRepo(datos.repo, datos.carpeta);
    if (enRepo.length) {
      const conocidos = new Set(pistas.map((p) => p.archivo));
      pistas = pistas.filter((p) => enRepo.includes(p.archivo));
      enRepo.filter((a) => !conocidos.has(a)).forEach((a) => pistas.push({
        archivo: a, id: a.replace(/\.[^.]+$/, ''), titulo: bonito(a), artista: 'Hernando Gigliotti', album: '', duracion: 0, portada: '', url: datos.base + encodeURIComponent(a), nuevo: true,
      }));
    }
  } catch (_) { /* sin conexión con GitHub: queda la lista guardada */ }
  pistas.sort((a, b) => normal(a.titulo).localeCompare(normal(b.titulo), 'es'));
  const anterior = actual();
  est.proyecto = item;
  est.pistas = pistas;
  armarCola(anterior ? pistas.findIndex((p) => p.archivo === anterior.archivo) : -1);
}

function armarCola(fijo = -1) {
  const idx = est.pistas.map((_, i) => i);
  if (est.aleatorio) {
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    if (fijo >= 0) { idx.splice(idx.indexOf(fijo), 1); idx.unshift(fijo); }
  }
  est.cola = idx;
  est.pos = fijo >= 0 ? est.cola.indexOf(fijo) : -1;
}

function letras() {
  if (!est.letras) {
    est.letras = fetch(LETRAS_URL).then((r) => r.json()).then((lista) => {
      const m = new Map();
      lista.forEach((c) => { if (c && c.id && c.idiomas) m.set(c.id, c); });
      return m;
    }).catch(() => new Map());
  }
  return est.letras;
}

function letraHTML(cancion) {
  const data = cancion && (cancion.idiomas[idioma] || cancion.idiomas.es || Object.values(cancion.idiomas)[0]);
  const lineas = data && data.letra;
  if (!lineas || !lineas.length) return `<p class="letra__vacia">${esc(tx('sin_letra'))}</p>`;
  const bloques = [];
  let actualB = [];
  const cerrar = () => { if (actualB.length) bloques.push(actualB); actualB = []; };
  lineas.forEach((l) => {
    const limpia = String(l).replace(/\[[^\]]*\]/g, '').replace(/\s{2,}/g, ' ').trim();
    if (!limpia) { cerrar(); return; }
    if (/^\d+$/.test(limpia) || /^(coro|estribillo|final|puente|chorus|bridge|intro)\b.*:?$/i.test(limpia)) { cerrar(); actualB.push({ et: limpia.replace(/:$/, '') }); return; }
    actualB.push({ l: limpia });
  });
  cerrar();
  return bloques.map((b) => `<p>${b.map((x) => (x.et ? `<span class="letra__et">${esc(/^\d+$/.test(x.et) ? `${x.et}.` : x.et)}</span>` : esc(x.l))).join('<br>')}</p>`).join('');
}

/* ------------------------------------------------------------------------ */
/* Reproducción                                                             */
/* ------------------------------------------------------------------------ */
function tocar(posCola) {
  if (posCola < 0 || posCola >= est.cola.length) return;
  est.pos = posCola;
  est.error = '';
  const p = actual();
  audio.src = p.url;
  audio.play().catch(() => {});
  sesionMedios(p);
  pintar();
}

export function alternar() {
  if (!actual()) { if (est.cola.length) tocar(0); return; }
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}
function siguiente(auto = false) {
  if (!est.cola.length) return;
  if (auto && est.repetir === 'uno') { audio.currentTime = 0; audio.play().catch(() => {}); return; }
  let n = est.pos + 1;
  if (n >= est.cola.length) {
    if (auto && est.repetir === 'no') { audio.pause(); audio.currentTime = 0; pintar(); return; }
    n = 0;
  }
  tocar(n);
}
function anterior() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  tocar(Math.max(0, est.pos - 1));
}
function detener() {
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  est.pos = -1;
  pintar();
}

function sesionMedios(p) {
  if (!('mediaSession' in navigator)) return;
  const tapa = tapaDe(p);
  navigator.mediaSession.metadata = new MediaMetadata({
    title: p.titulo, artist: p.artista, album: p.album || (est.proyecto && est.proyecto.carpeta) || '',
    artwork: tapa ? [{ src: new URL(tapa, location.href).href, sizes: '480x480', type: 'image/jpeg' }] : [],
  });
}
if ('mediaSession' in navigator) {
  const ms = navigator.mediaSession;
  ms.setActionHandler('play', () => audio.play());
  ms.setActionHandler('pause', () => audio.pause());
  ms.setActionHandler('nexttrack', () => siguiente());
  ms.setActionHandler('previoustrack', () => anterior());
  try { ms.setActionHandler('seekto', (d) => { audio.currentTime = d.seekTime; }); } catch (_) { /* nada */ }
}

audio.addEventListener('play', () => pintar());
audio.addEventListener('pause', () => pintar());
audio.addEventListener('ended', () => siguiente(true));
audio.addEventListener('error', () => { if (actual()) { est.error = tx('error'); pintar(); } });
audio.addEventListener('loadedmetadata', () => {
  const p = actual();
  if (p && !p.duracion) { p.duracion = Math.round(audio.duration); pintar(); }
});
audio.addEventListener('timeupdate', () => progreso());

/* ------------------------------------------------------------------------ */
/* Página del reproductor                                                   */
/* ------------------------------------------------------------------------ */
export function vistaMusica(item) {
  return `
    <section class="musica" data-musica>
      <div class="musica__fondo" aria-hidden="true" data-m-fondo></div>
      <div class="musica__ahora">
        <div class="musica__tapa" data-m-tapa></div>
        <div class="musica__info">
          <span class="musica__etiqueta" data-m-etiqueta></span>
          <b class="musica__titulo" data-m-titulo></b>
          <span class="musica__artista" data-m-artista></span>
        </div>
        <div class="musica__tiempo">
          <input class="musica__rango" type="range" min="0" max="1000" value="0" step="1" aria-label="${esc(tx('sonando'))}" data-m-rango>
          <div class="musica__marcas"><span data-m-ya>0:00</span><span data-m-total>–:––</span></div>
        </div>
        <div class="musica__controles">
          <button class="mboton" type="button" data-m="aleatorio" aria-label="${esc(tx('aleatorio'))}" aria-pressed="false">${I.aleatorio}</button>
          <button class="mboton mboton--m" type="button" data-m="anterior" aria-label="${esc(tx('anterior'))}">${I.ant}</button>
          <button class="mboton mboton--play" type="button" data-m="alternar" aria-label="${esc(tx('reproducir'))}">${I.play}</button>
          <button class="mboton mboton--m" type="button" data-m="siguiente" aria-label="${esc(tx('siguiente'))}">${I.sig}</button>
          <button class="mboton" type="button" data-m="repetir" aria-label="${esc(tx('repetir'))}" aria-pressed="false">${I.repetir}<i data-m-uno>1</i></button>
        </div>
        <div class="musica__volumen">
          <button class="mboton" type="button" data-m="mudo" aria-label="${esc(tx('volumen'))}">${I.volumen}</button>
          <input type="range" min="0" max="100" value="${Math.round(audio.volume * 100)}" aria-label="${esc(tx('volumen'))}" data-m-vol>
        </div>
        <p class="musica__error" role="status" data-m-error></p>
      </div>
      <div class="musica__panel">
        <div class="musica__pestanas" role="tablist">
          <button type="button" role="tab" aria-selected="true" data-m-tab="lista">${esc(tx('canciones'))}</button>
          <button type="button" role="tab" aria-selected="false" data-m-tab="letra">${esc(tx('letra'))}</button>
        </div>
        <div data-m-vista="lista">
          <div class="musica__buscar"><input type="search" placeholder="${esc(tx('buscar'))}" aria-label="${esc(tx('buscar'))}" enterkeyhint="search" data-m-buscar></div>
          <ol class="pistas" data-m-pistas><li class="pistas__vacio">${esc(tx('cargando'))}</li></ol>
        </div>
        <div class="letra" data-m-vista="letra" hidden></div>
      </div>
    </section>`;
}

function filaHTML(p, i) {
  return `
    <li>
      <button class="pista" type="button" data-pista="${i}">
        <span class="pista__num"><span>${i + 1}</span><i class="eq" aria-hidden="true"><b></b><b></b><b></b></i></span>
        ${tapaHTML(p, 'tapa--chica')}
        <span class="pista__texto"><b>${esc(p.titulo)}</b><small>${esc(p.artista)}${p.album ? ` · ${esc(p.album)}` : ''}</small></span>
        <span class="pista__dur">${mmss(p.duracion)}</span>
      </button>
    </li>`;
}

let raiz = null;
export async function activarMusica(item) {
  raiz = document.querySelector('[data-musica]');
  if (!raiz) return;
  const q = (s) => raiz.querySelector(s);
  try { await cargarMusica(item); } catch (e) {
    q('[data-m-pistas]').innerHTML = `<li class="pistas__vacio">${esc(tx('error'))}</li>`;
    return;
  }
  if (!raiz.isConnected) return;
  pintarLista();
  pintar();

  raiz.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m],[data-pista],[data-m-tab]');
    if (!b) return;
    if (b.dataset.pista !== undefined) {
      const i = Number(b.dataset.pista);
      if (actual() === est.pistas[i]) { alternar(); return; }
      if (est.aleatorio) armarCola(i);
      tocar(est.cola.indexOf(i));
      return;
    }
    if (b.dataset.mTab) { mostrarVista(b.dataset.mTab); return; }
    const a = b.dataset.m;
    if (a === 'alternar') alternar();
    else if (a === 'siguiente') siguiente();
    else if (a === 'anterior') anterior();
    else if (a === 'aleatorio') { est.aleatorio = !est.aleatorio; armarCola(actual() ? est.pistas.indexOf(actual()) : -1); pintar(); }
    else if (a === 'repetir') { est.repetir = { no: 'todo', todo: 'uno', uno: 'no' }[est.repetir]; pintar(); }
    else if (a === 'mudo') { audio.muted = !audio.muted; pintar(); }
  });
  const rango = q('[data-m-rango]');
  rango.addEventListener('input', () => { if (audio.duration) audio.currentTime = (rango.value / 1000) * audio.duration; });
  q('[data-m-vol]').addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
    audio.muted = false;
    try { localStorage.setItem('musica_vol', String(audio.volume)); } catch (_) { /* nada */ }
    pintar();
  });
  q('[data-m-buscar]').addEventListener('input', (e) => { est.filtro = normal(e.target.value); filtrar(); });
}

function mostrarVista(v) {
  if (!raiz) return;
  raiz.querySelectorAll('[data-m-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.mTab === v)));
  raiz.querySelectorAll('[data-m-vista]').forEach((x) => { x.hidden = x.dataset.mVista !== v; });
  if (v === 'letra') pintarLetra();
}

async function pintarLetra() {
  if (!raiz) return;
  const caja = raiz.querySelector('[data-m-vista="letra"]');
  const p = actual();
  if (!p) { caja.innerHTML = `<p class="letra__vacia">${esc(tx('elegir'))}</p>`; return; }
  const m = await letras();
  if (actual() !== p || !raiz) return;
  caja.innerHTML = `<h3 class="letra__titulo">${esc(p.titulo)}</h3>${letraHTML(m.get(p.id))}`;
}

function pintarLista() {
  const ol = raiz && raiz.querySelector('[data-m-pistas]');
  if (!ol) return;
  ol.innerHTML = est.pistas.map(filaHTML).join('') + `<li class="pistas__vacio" data-m-sin hidden>${esc(tx('sin_resultados'))}</li>`;
  filtrar();
}

function filtrar() {
  if (!raiz) return;
  let visibles = 0;
  raiz.querySelectorAll('[data-pista]').forEach((b) => {
    const p = est.pistas[Number(b.dataset.pista)];
    const ok = !est.filtro || normal(`${p.titulo} ${p.artista} ${p.album}`).includes(est.filtro);
    b.parentElement.hidden = !ok;
    if (ok) visibles++;
  });
  const sin = raiz.querySelector('[data-m-sin]');
  if (sin) sin.hidden = visibles > 0;
}

let ultimaLetra = null;
function pintar() {
  const p = actual();
  const sonando = !!p && !audio.paused;
  // Mini reproductor
  mini.el.hidden = !p || !!raiz?.isConnected;
  document.body.classList.toggle('con-mini', !mini.el.hidden);
  if (p) {
    mini.el.querySelector('[data-mini-tapa]').innerHTML = tapaHTML(p);
    mini.el.querySelector('[data-mini-titulo]').textContent = p.titulo;
    mini.el.querySelector('[data-mini-artista]').textContent = p.artista;
    mini.el.querySelector('[data-mini-ir]').href = `#/${urlRuta(est.proyecto.ruta)}`;
  }
  const bm = mini.el.querySelector('[data-mini="alternar"]');
  bm.innerHTML = sonando ? I.pausa : I.play;
  bm.setAttribute('aria-label', tx(sonando ? 'pausar' : 'reproducir'));

  if (!raiz || !raiz.isConnected) { raiz = null; return; }
  const q = (s) => raiz.querySelector(s);
  const vista = p || est.pistas.find((x) => x.portada) || est.pistas[0];
  q('[data-m-tapa]').innerHTML = vista ? tapaHTML(vista, 'tapa--grande') : '';
  const fondo = vista && tapaDe(vista);
  q('[data-m-fondo]').style.backgroundImage = fondo ? `url("${fondo}")` : '';
  q('[data-m-fondo]').style.setProperty('--h', vista ? tono(vista.id) : 25);
  q('[data-m-fondo]').classList.toggle('musica__fondo--gen', !fondo);
  q('[data-m-etiqueta]').textContent = p ? tx('sonando') : tx('n', { n: est.pistas.length });
  q('[data-m-titulo]').textContent = p ? p.titulo : (est.proyecto ? tx('elegir') : '');
  q('[data-m-artista]').textContent = p ? `${p.artista}${p.album ? ` · ${p.album}` : ''}` : '';
  const bp = q('[data-m="alternar"]');
  bp.innerHTML = sonando ? I.pausa : I.play;
  bp.setAttribute('aria-label', tx(sonando ? 'pausar' : 'reproducir'));
  q('[data-m="aleatorio"]').setAttribute('aria-pressed', String(est.aleatorio));
  const br = q('[data-m="repetir"]');
  br.setAttribute('aria-pressed', String(est.repetir !== 'no'));
  br.classList.toggle('mboton--uno', est.repetir === 'uno');
  br.setAttribute('aria-label', tx(est.repetir === 'uno' ? 'repetir_uno' : 'repetir'));
  q('[data-m="mudo"]').innerHTML = audio.muted || audio.volume === 0 ? I.mudo : I.volumen;
  q('[data-m-error]').textContent = est.error;
  raiz.classList.toggle('musica--sonando', sonando);
  raiz.querySelectorAll('[data-pista]').forEach((b) => {
    const es = p && est.pistas[Number(b.dataset.pista)] === p;
    b.classList.toggle('pista--actual', !!es);
    b.setAttribute('aria-current', es ? 'true' : 'false');
    const d = b.querySelector('.pista__dur');
    const pp = est.pistas[Number(b.dataset.pista)];
    if (pp.duracion && d.textContent !== mmss(pp.duracion)) d.textContent = mmss(pp.duracion);
  });
  if (p !== ultimaLetra && !q('[data-m-vista="letra"]').hidden) pintarLetra();
  ultimaLetra = p;
  progreso();
}

function progreso() {
  const dur = audio.duration || (actual() && actual().duracion) || 0;
  const pct = dur ? audio.currentTime / dur : 0;
  mini.el.style.setProperty('--avance', pct);
  if (!raiz || !raiz.isConnected) return;
  const r = raiz.querySelector('[data-m-rango]');
  if (document.activeElement !== r) r.value = Math.round(pct * 1000);
  r.style.setProperty('--avance', `${pct * 100}%`);
  raiz.querySelector('[data-m-ya]').textContent = mmss(audio.currentTime) === '–:––' ? '0:00' : mmss(audio.currentTime);
  raiz.querySelector('[data-m-total]').textContent = mmss(dur);
}

export function salirDeMusica() {
  raiz = null;
  pintar();
}

/* ------------------------------------------------------------------------ */
/* Mini reproductor flotante                                                */
/* ------------------------------------------------------------------------ */
const mini = { el: document.createElement('div') };
mini.el.className = 'mini';
mini.el.hidden = true;
mini.el.innerHTML = `
  <a class="mini__ir" data-mini-ir href="#/" aria-label="${esc(tx('abrir'))}">
    <span class="mini__tapa" data-mini-tapa></span>
    <span class="mini__texto"><b data-mini-titulo></b><small data-mini-artista></small></span>
  </a>
  <button class="mboton" type="button" data-mini="alternar">${I.play}</button>
  <button class="mboton" type="button" data-mini="siguiente" aria-label="${esc(tx('siguiente'))}">${I.sig}</button>
  <button class="mboton mini__cerrar" type="button" data-mini="cerrar" aria-label="${esc(tx('cerrar'))}">${I.x}</button>
  <span class="mini__barra" aria-hidden="true"></span>`;
document.body.appendChild(mini.el);
mini.el.addEventListener('click', (e) => {
  const b = e.target.closest('[data-mini]');
  if (!b) return;
  if (b.dataset.mini === 'alternar') alternar();
  if (b.dataset.mini === 'siguiente') siguiente();
  if (b.dataset.mini === 'cerrar') detener();
});

// Barra espaciadora: pausa y reanuda en la página del reproductor.
document.addEventListener('keydown', (e) => {
  if (e.code !== 'Space' || !raiz || !raiz.isConnected) return;
  if (e.target.closest('input, textarea, button, a, [contenteditable]')) return;
  e.preventDefault();
  alternar();
});
