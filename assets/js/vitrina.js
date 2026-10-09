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
    const m = cabeza.match(/^\[(android|iphone|imac|proyector|tv)\]\s*(.*)$/i);
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

export function etiquetaEnlace(u = '') {
  if (/youtube\.com|youtu\.be/i.test(u)) return t('ver_youtube');
  if (/github\.io/i.test(u)) return t('abrir_app');
  return t('visitar');
}

export { reduceMotion, L };
