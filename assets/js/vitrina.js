// Páginas especiales de proyecto:
// - Vitrina: explicación a la izquierda y la app real funcionando dentro de un iPhone, iMac, proyector o TV.
// - Grupo: un proyecto con partes independientes (las clases de Conquistadores), cada una con su color y su lista de YouTube.

import { t, L } from './i18n.js';

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------------ */
/* Texto con párrafos, listas y secciones "## [dispositivo] Título"          */
/* ------------------------------------------------------------------------ */
export function textoRico(texto = '') {
  return texto.trim().split(/\n\s*\n/).map((bloque) => {
    const lineas = bloque.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lineas.length && lineas.every((l) => /^[-•*]\s+/.test(l))) {
      return `<ul class="lista-puntos">${lineas.map((l) => `<li>${esc(l.replace(/^[-•*]\s+/, ''))}</li>`).join('')}</ul>`;
    }
    return `<p>${lineas.map(esc).join('<br>')}</p>`;
  }).join('');
}

export function seccionesDe(texto = '') {
  const partes = texto.split(/^##\s+/m);
  const intro = partes.shift() || '';
  const secciones = partes.map((p) => {
    const [cabeza, ...resto] = p.split('\n');
    const m = cabeza.match(/^\[(celular|android|iphone|imac|proyector|tv)\]\s*(.*)$/i);
    return { disp: m ? m[1].toLowerCase() : '', titulo: (m ? m[2] : cabeza).trim(), texto: resto.join('\n').trim() };
  });
  return { intro, secciones };
}

/* ------------------------------------------------------------------------ */
/* Dispositivos                                                             */
/* ------------------------------------------------------------------------ */
const NATIVO = {
  android: [412, 915],
  iphone: [390, 844],
  imac: [1440, 900],
  proyector: [1280, 720],
  tv: [1920, 1080],
};

// Celular: muestra un selector iPhone / Android. Por defecto, el mismo tipo de teléfono que usa quien visita.
const CELULARES = ['iphone', 'android'];
function celularPreferido() {
  try { const g = localStorage.getItem('celular'); if (CELULARES.includes(g)) return g; } catch (_) { /* sin almacenamiento */ }
  return /android/i.test(navigator.userAgent) ? 'android' : 'iphone';
}
export function celular(src, titulo) {
  const elegido = celularPreferido();
  return `
    <div class="celular" data-celular>
      <div class="selector" role="group" aria-label="${esc(t('elegir_celular'))}">
        ${CELULARES.map((c) => `<button type="button" data-elegir="${c}" aria-pressed="${c === elegido}">${esc(t(`disp_${c}`))}</button>`).join('')}
      </div>
      ${CELULARES.map((c) => `<div class="celular__opcion" data-opcion="${c}" ${c === elegido ? '' : 'hidden'}>${dispositivo(c, src, titulo)}</div>`).join('')}
    </div>`;
}
function activarSelectores() {
  document.querySelectorAll('[data-celular]').forEach((caja) => {
    caja.querySelectorAll('[data-elegir]').forEach((b) => b.addEventListener('click', () => {
      const c = b.dataset.elegir;
      try { localStorage.setItem('celular', c); } catch (_) { /* nada */ }
      caja.querySelectorAll('[data-elegir]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      caja.querySelectorAll('[data-opcion]').forEach((o) => {
        o.hidden = o.dataset.opcion !== c;
        if (!o.hidden) {
          o.querySelectorAll('.revela').forEach((r) => r.classList.add('visible'));
          const f = o.querySelector('iframe');
          if (f && !f.src) f.src = f.dataset.src;
          const p = o.querySelector('.disp__pantalla');
          if (p) f.style.transform = `scale(${p.clientWidth / Number(f.dataset.w)})`;
        }
      });
    }));
  });
}

export function dispositivo(disp, src, titulo) {
  const [w, h] = NATIVO[disp];
  const pantalla = `
    <div class="disp__pantalla" style="--ar:${w}/${h}">
      <div class="disp__espera" aria-hidden="true"><span>HAG</span></div>
      <iframe title="${esc(titulo)} · ${esc(t(`disp_${disp}`))}" data-src="${esc(src)}" data-w="${w}" data-h="${h}" tabindex="-1" allow="autoplay; clipboard-write; fullscreen"></iframe>
      <button class="disp__activar" type="button" data-activar>${esc(t('tocar_usar'))}</button>
    </div>`;
  const cuerpos = {
    android: `<div class="disp__cuerpo"><span class="disp__boton disp__boton--4"></span><span class="disp__boton disp__boton--5"></span>${pantalla}<span class="disp__camara"></span></div>`,
    iphone: `<div class="disp__cuerpo"><span class="disp__boton disp__boton--1"></span><span class="disp__boton disp__boton--2"></span><span class="disp__boton disp__boton--3"></span>${pantalla}<span class="disp__isla"></span></div>`,
    imac: `<div class="disp__cuerpo"><div class="disp__marco">${pantalla}</div><div class="disp__menton"><span></span></div></div><div class="disp__cuello"></div><div class="disp__base"></div>`,
    proyector: `<div class="disp__tela"><div class="disp__rollo"></div><div class="disp__lienzo">${pantalla}</div></div><div class="disp__haz" aria-hidden="true"></div><div class="disp__equipo" aria-hidden="true"><span class="disp__lente"></span><span class="disp__rejilla"></span></div>`,
    tv: `<div class="disp__cuerpo">${pantalla}<span class="disp__marca">HAG</span></div><div class="disp__patas"><span></span><span></span></div>`,
  };
  return `
    <figure class="disp disp--${disp} revela" data-disp="${disp}">
      <div class="disp__escena">${cuerpos[disp]}</div>
      <figcaption class="disp__pie"><span class="disp__vivo"></span>${esc(t(`disp_${disp}`))} · ${esc(t('en_vivo'))}</figcaption>
    </figure>`;
}

let observadorPantallas;
let observadorTamano;
export function activarDispositivos() {
  activarSelectores();
  if (observadorPantallas) observadorPantallas.disconnect();
  if (observadorTamano) observadorTamano.disconnect();
  const pantallas = Array.from(document.querySelectorAll('.disp__pantalla'));
  if (!pantallas.length) return;

  const escalar = (p) => {
    const f = p.querySelector('iframe');
    const s = p.clientWidth / Number(f.dataset.w);
    f.style.transform = `scale(${s})`;
  };
  observadorTamano = new ResizeObserver((entradas) => entradas.forEach((e) => escalar(e.target)));

  const tactil = window.matchMedia('(pointer: coarse)').matches;
  pantallas.forEach((p) => {
    const f = p.querySelector('iframe');
    f.style.width = `${f.dataset.w}px`;
    f.style.height = `${f.dataset.h}px`;
    escalar(p);
    observadorTamano.observe(p);
    // En pantallas táctiles, la app se activa con un toque para no atrapar el desplazamiento de la página.
    if (tactil) p.classList.add('disp__pantalla--bloqueada');
    p.querySelector('[data-activar]').addEventListener('click', () => {
      p.classList.remove('disp__pantalla--bloqueada');
      f.tabIndex = 0;
    });
    if (!tactil) f.tabIndex = 0;
    f.addEventListener('load', () => {
      p.classList.add('disp__pantalla--lista');
      if (p.closest('[data-disp="proyector"]')) modoProyector(f);
    });
  });

  observadorPantallas = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const f = e.target.querySelector('iframe');
      if (!f.src) f.src = f.dataset.src;
      observadorPantallas.unobserve(e.target);
    });
  }, { rootMargin: '500px 0px' });
  pantallas.forEach((p) => observadorPantallas.observe(p));
}

// El Cancionero activa el modo proyector con una clase en <body>. Como el sitio y la app
// están en el mismo dominio (hagigliotti.github.io), se puede encender solo en este simulador,
// sin tocar la configuración que la app guarda para quien la usa.
function modoProyector(f) {
  try {
    const w = f.contentWindow;
    const d = f.contentDocument;
    if (!d || !d.body) return;
    d.body.classList.add('projector');
    ['loadTheme', 'updateProjectorMenuButton', 'handleMenuVisibility'].forEach((fn) => { if (typeof w[fn] === 'function') w[fn](); });
  } catch (_) { /* otro dominio: se muestra la vista normal */ }
}

/* ------------------------------------------------------------------------ */
/* Colores de las clases                                                    */
/* ------------------------------------------------------------------------ */
const COLORES = {
  azul: '#1f63c8', rojo: '#d32630', verde: '#1f8a4c', blanco: '#f1f1ef', gris: '#a7abb2',
  violeta: '#6b2a8f', vinotinto: '#6e1a35', bordo: '#6e1a35', amarillo: '#f2c218', naranja: '#ff7a00', negro: '#141416',
};
function hex(nombre) {
  const n = nombre.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/^#[0-9a-f]{3,8}$/i.test(n)) return n;
  return COLORES[n] || '#3a3c40';
}
function luminancia(h) {
  const c = h.replace('#', '');
  const v = c.length === 3 ? c.split('').map((x) => parseInt(x + x, 16)) : [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r, g, b] = v.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function colorDe(nombre = '') {
  const tonos = nombre.split('/').map(hex);
  const a = tonos[0];
  const b = tonos[1] || a;
  const oscuro = (luminancia(a) + luminancia(b)) / 2 > 0.42;
  return {
    estilo: `--c1:${a};--c2:${b};--tinta:${oscuro ? '#121315' : '#f7f5f1'}`,
  };
}

/* ------------------------------------------------------------------------ */
/* YouTube                                                                  */
/* ------------------------------------------------------------------------ */
export function idLista(u = '') {
  const m = String(u).match(/[?&]list=([A-Za-z0-9_-]{10,})/);
  return m ? m[1] : '';
}
export function reproductorLista(u, titulo) {
  const id = idLista(u);
  if (!id) return '';
  return `
    <div class="video revela">
      <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${esc(id)}&rel=0" title="${esc(titulo)}" loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
    </div>`;
}

// Lista completa de videos de una lista de YouTube.
// La lista se lee en vivo con el reproductor oficial de YouTube (getPlaylist), así que
// un video nuevo en la lista aparece solo, sin volver a publicar el sitio.
// Los títulos se piden a oEmbed de YouTube y se guardan en el navegador.
const mmss = (s) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '');
const filaVideo = (x, i, actual) => `
  <li><button type="button" class="vid${actual ? ' vid--actual' : ''}" data-video="${esc(x.id)}" data-indice="${i}" aria-current="${actual}">
    <span class="vid__num">${i + 1}</span>
    <span class="vid__mini"><img src="https://i.ytimg.com/vi/${esc(x.id)}/mqdefault.jpg" alt="" loading="lazy">${x.segundos ? `<small>${mmss(x.segundos)}</small>` : ''}</span>
    <span class="vid__titulo">${esc(x.titulo || '…')}</span>
  </button></li>`;

export function listaDeVideos(item, titulo) {
  const lista = idLista(item.lista);
  if (!lista) return '';
  const v = item.videosLista || [];
  return `
    <div class="videos revela" data-videos="${esc(lista)}" data-titulo="${esc(titulo)}">
      <div class="videos__actual">
        <div class="video"><div data-yt></div></div>
        <div class="videos__nav">
          <button class="boton boton--sec" type="button" data-paso="-1">${esc(t('anterior'))}</button>
          <span class="videos__ahora" data-ahora></span>
          <button class="boton" type="button" data-paso="1">${esc(t('siguiente'))}</button>
        </div>
      </div>
      <div class="videos__lista">
        <p class="videos__cuenta" data-cuenta>${v.length ? `${v.length} ${esc(v.length === 1 ? t('video') : t('videos'))}` : ''}</p>
        <ol data-filas>${v.map((x, i) => filaVideo(x, i, i === 0)).join('')}</ol>
      </div>
    </div>`;
}

let apiYT;
function cargarApiYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (!apiYT) {
    apiYT = new Promise((res, rej) => {
      const previo = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (previo) previo(); res(window.YT); };
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  return apiYT;
}

const CLAVE_TITULOS = 'yt_titulos';
let titulos = {};
try { titulos = JSON.parse(localStorage.getItem(CLAVE_TITULOS) || '{}'); } catch (_) { titulos = {}; }
const guardarTitulos = () => { try { localStorage.setItem(CLAVE_TITULOS, JSON.stringify(titulos)); } catch (_) { /* nada */ } };
async function tituloDeVideo(id) {
  if (titulos[id]) return titulos[id];
  const watch = encodeURIComponent(`https://www.youtube.com/watch?v=${id}`);
  for (const u of [`https://www.youtube.com/oembed?format=json&url=${watch}`, `https://noembed.com/embed?url=${watch}`]) {
    try {
      const j = await (await fetch(u)).json();
      if (j && j.title) { titulos[id] = j.title; guardarTitulos(); return j.title; }
    } catch (_) { /* se prueba la otra */ }
  }
  return '';
}

export function activarVideos() {
  document.querySelectorAll('[data-videos]').forEach((caja) => {
    const lista = caja.dataset.videos;
    const filas = caja.querySelector('[data-filas]');
    const cuenta = caja.querySelector('[data-cuenta]');
    const ahora = caja.querySelector('[data-ahora]');
    let ids = Array.from(caja.querySelectorAll('[data-video]')).map((b) => b.dataset.video);
    let player = null;
    let indice = 0;

    const marcar = (i) => {
      indice = i;
      caja.querySelectorAll('[data-video]').forEach((b) => {
        const es = Number(b.dataset.indice) === i;
        b.classList.toggle('vid--actual', es);
        b.setAttribute('aria-current', String(es));
      });
      const b = caja.querySelector(`[data-indice="${i}"]`);
      if (ahora) ahora.textContent = ids.length ? `${i + 1} / ${ids.length}` : '';
      if (b && filas.scrollHeight > filas.clientHeight) {
        const top = b.offsetTop - filas.offsetTop - filas.clientHeight / 2 + b.offsetHeight / 2;
        filas.scrollTo({ top, behavior: 'smooth' });
      }
    };
    const pintarLista = (nuevos) => {
      const conocidos = {};
      caja.querySelectorAll('[data-video]').forEach((b) => { conocidos[b.dataset.video] = b.querySelector('.vid__titulo').textContent; });
      ids = nuevos;
      filas.innerHTML = ids.map((id, i) => filaVideo({ id, titulo: titulos[id] || (conocidos[id] !== '…' ? conocidos[id] : '') }, i, i === indice)).join('');
      cuenta.textContent = `${ids.length} ${ids.length === 1 ? t('video') : t('videos')}`;
      marcar(indice);
      ids.forEach(async (id) => {
        const b = filas.querySelector(`[data-video="${id}"] .vid__titulo`);
        if (b && (b.textContent === '…' || !b.textContent)) {
          const tit = await tituloDeVideo(id);
          if (tit && b.isConnected) b.textContent = tit;
        }
      });
    };
    const ir = (i) => {
      if (!ids.length) return;
      const j = Math.max(0, Math.min(ids.length - 1, i));
      marcar(j);
      if (player && player.playVideoAt) player.playVideoAt(j);
    };

    caja.addEventListener('click', (e) => {
      const b = e.target.closest('[data-indice]');
      if (b) { ir(Number(b.dataset.indice)); return; }
      const p = e.target.closest('[data-paso]');
      if (p) ir(indice + Number(p.dataset.paso));
    });

    if (ids.length) pintarLista(ids);
    const destino = caja.querySelector('[data-yt]');
    const crear = (YT) => {
      if (!destino.isConnected) return;
      player = new YT.Player(destino, {
        host: 'https://www.youtube-nocookie.com',
        playerVars: { listType: 'playlist', list: lista, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            let intentos = 0;
            const leer = () => {
              const pl = player.getPlaylist && player.getPlaylist();
              if (pl && pl.length) {
                if (pl.join() !== ids.join()) pintarLista(pl);
                marcar(Math.max(0, player.getPlaylistIndex ? player.getPlaylistIndex() : 0));
              } else if (intentos++ < 20) setTimeout(leer, 300);
            };
            leer();
          },
          onStateChange: () => {
            const i = player.getPlaylistIndex ? player.getPlaylistIndex() : -1;
            if (i >= 0 && i !== indice) marcar(i);
          },
        },
      });
    };
    const io = new IntersectionObserver((ent) => {
      if (!ent.some((x) => x.isIntersecting)) return;
      io.disconnect();
      cargarApiYT().then(crear).catch(() => {
        destino.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(lista)}&rel=0" title="${esc(caja.dataset.titulo)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
      });
    }, { rootMargin: '400px 0px' });
    io.observe(caja);
  });
}

export function etiquetaEnlace(u = '') {
  if (/youtube\.com|youtu\.be/i.test(u)) return t('ver_youtube');
  if (/github\.io/i.test(u)) return t('abrir_app');
  return t('visitar');
}

export { reduceMotion, L };
