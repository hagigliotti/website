import { Lector, miniaturaPDF } from './reader.js';
import { IDIOMAS, idioma, cambiarIdioma, t, n, L, locale } from './i18n.js';
import { vistaMusica, activarMusica, salirDeMusica } from './musica.js';
import { textoRico, seccionesDe, dispositivo, celular, activarDispositivos, colorDe, reproductorLista, idLista, etiquetaEnlace } from './vitrina.js';

/* ==========================================================================
   Utilidades
   ========================================================================== */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (ruta) => ruta.split('/').map(encodeURIComponent).join('/');
const enlace = (ruta) => `#/${url(ruta)}`;
const icono = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bonito = (carpeta) => carpeta.replace(/[-_]+/g, ' ').replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2').trim();
const limpiarNombre = (archivo) => {
  const base = archivo.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};
const parrafos = (texto) => texto.split(/\n\s*\n/).map((p) => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('');

const SECCIONES = {
  Projects: { id: 'proyectos', ver: 'ver_proyecto' },
  Trips: { id: 'viajes', ver: 'ver_album' },
  Works: { id: 'trabajos', ver: 'ver_trabajo' },
};

/* ==========================================================================
   Datos
   ========================================================================== */
const estado = { config: null, manifest: null, cv: null };

async function json(ruta) {
  const r = await fetch(ruta, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
  return r.json();
}

const items = (seccion) => (estado.manifest.secciones[seccion] && estado.manifest.secciones[seccion].items) || [];
// Marcadores que se completan solos: {ciclo} = "2026/2027" hasta el 1 de enero, después "2027/2028" (igual que la app de Año Nuevo).
function marcadores(texto = '') {
  const hoy = new Date();
  const hoy0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  let y = hoy.getFullYear();
  if (new Date(y, 0, 1) < hoy0) y += 1;
  return String(texto).replace(/\{ciclo\}/gi, `${y - 1}/${y}`).replace(/\{(año|anio)\}/gi, String(hoy.getFullYear()));
}
const tituloDe = (it) => marcadores(L(it.titulo)) || bonito(it.carpeta);
const imagenesDe = (it) => it.archivos.filter((a) => a.tipo === 'imagen');
const documentosDe = (it) => it.archivos.filter((a) => a.tipo !== 'imagen');
const anio = (it) => (it.fecha || '').slice(0, 4);
const descFoto = (it, img) => L(it.fotos[img.nombre.toLowerCase()]);
const nombreCompleto = () => `${estado.config.nombre} ${estado.config.apellido || ''}`.trim();

/* ==========================================================================
   Navegación, idiomas y redes
   ========================================================================== */
function aplicarTextosFijos() {
  $$('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  $$('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
}

function botonesIdioma(clase = '') {
  return Object.entries(IDIOMAS).map(([c, nombre]) =>
    `<button type="button" class="${clase}" data-idioma="${c}" aria-current="${c === idioma}" lang="${c}">${nombre}</button>`).join('');
}

function pintarCabecera() {
  const { config } = estado;
  $('[data-firma]').textContent = config.firma || config.nombre;
  const redes = (config.redes || []).map((r) =>
    `<a class="red" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(r.nombre)}">${icono(r.icono || r.nombre.toLowerCase())}</a>`).join('');
  $('[data-redes]').innerHTML = redes;
  $('[data-menu-redes]').innerHTML = (config.redes || []).map((r) => `<a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.nombre)}</a>`).join('');
  $('[data-idioma-boton]').textContent = idioma.toUpperCase();
  $('[data-idioma-boton]').setAttribute('aria-label', `${t('idioma')}: ${IDIOMAS[idioma]}`);
  $('[data-idioma-lista]').innerHTML = Object.entries(IDIOMAS).map(([c, nombre]) =>
    `<li><button type="button" data-idioma="${c}" aria-current="${c === idioma}" lang="${c}">${nombre}</button></li>`).join('');
  $('[data-menu-idiomas]').innerHTML = botonesIdioma();
  const links = [
    ['', 'inicio'], ['proyectos', 'proyectos'], ['viajes', 'viajes'], ['trabajos', 'trabajos'], ['experiencia', 'experiencia'], ['cv', 'cv'],
  ];
  $('[data-menu-links]').innerHTML = links.map(([h, k]) => `<li><a href="#/${h}">${esc(t(k))}</a></li>`).join('');
  aplicarTextosFijos();
}

function iniciarCabecera() {
  const boton = $('[data-menu-boton]');
  const alternarMenu = (abrir) => {
    document.body.classList.toggle('menu-abierto', abrir);
    document.body.classList.toggle('bloqueado', abrir);
    boton.setAttribute('aria-expanded', String(abrir));
    $('b', boton).textContent = t(abrir ? 'menu_cerrar' : 'menu_abrir');
  };
  boton.addEventListener('click', () => alternarMenu(!document.body.classList.contains('menu-abierto')));
  $('[data-menu]').addEventListener('click', (e) => { if (e.target.closest('a')) alternarMenu(false); });

  const bIdioma = $('[data-idioma-boton]');
  const lista = $('[data-idioma-lista]');
  const alternarLista = (abrir) => { lista.hidden = !abrir; bIdioma.setAttribute('aria-expanded', String(abrir)); };
  bIdioma.addEventListener('click', (e) => { e.stopPropagation(); alternarLista(lista.hidden); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.idiomas')) alternarLista(false); });

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-idioma]');
    if (!b) return;
    alternarLista(false);
    if (b.dataset.idioma === idioma) return;
    cambiarIdioma(b.dataset.idioma);
    pintarCabecera();
    navegar({ mismoLugar: true });
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-abrir-contacto]')) { alternarMenu(false); contacto.abrir(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (document.body.classList.contains('menu-abierto')) alternarMenu(false);
    alternarLista(false);
  });
  window.cerrarMenu = () => alternarMenu(false);
}

/* ==========================================================================
   Contacto
   ========================================================================== */
const contacto = {
  raiz: $('[data-contacto]'),
  pintar() {
    $('[data-formulario]').innerHTML = `
      <div class="campo"><label for="c-nombre">${esc(t('nombre'))}</label><input id="c-nombre" name="name" autocomplete="name" required></div>
      <div class="campo"><label for="c-email">${esc(t('email'))}</label><input id="c-email" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="none" required></div>
      <div class="campo"><label for="c-mensaje">${esc(t('mensaje'))}</label><textarea id="c-mensaje" name="message" required></textarea></div>
      <input class="trampa" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="formulario__enviar" type="submit">${esc(t('enviar'))}</button>
      <p class="formulario__estado" role="status" aria-live="polite"></p>`;
  },
  abrir() {
    this.ultimoFoco = document.activeElement;
    this.raiz.classList.add('abierto');
    document.body.classList.add('bloqueado');
    setTimeout(() => $('#c-nombre').focus(), 60);
  },
  cerrar() {
    if (!this.raiz.classList.contains('abierto')) return;
    this.raiz.classList.remove('abierto');
    document.body.classList.remove('bloqueado');
    if (this.ultimoFoco) this.ultimoFoco.focus({ preventScroll: true });
  },
  async enviar(form) {
    const estadoEl = $('.formulario__estado', form);
    const datos = Object.fromEntries(new FormData(form));
    if (datos.botcheck) return;
    if (!datos.name.trim() || !/^\S+@\S+\.\S+$/.test(datos.email) || !datos.message.trim()) { estadoEl.textContent = t('campos'); return; }
    const cfg = estado.config.contacto || {};
    if (!cfg.clave) { estadoEl.textContent = t('sin_config'); return; }
    const boton = $('.formulario__enviar', form);
    boton.disabled = true;
    boton.textContent = t('enviando');
    estadoEl.textContent = '';
    try {
      let r;
      if (cfg.servicio === 'formspree') {
        r = await fetch(`https://formspree.io/f/${encodeURIComponent(cfg.clave)}`, {
          method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: datos.name, email: datos.email, message: datos.message, _subject: `Web: ${datos.name}` }),
        });
      } else {
        r = await fetch('https://api.web3forms.com/submit', {
          method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_key: cfg.clave, name: datos.name, email: datos.email, message: datos.message, subject: `Mensaje desde la web: ${datos.name}`, from_name: 'Sitio web' }),
        });
      }
      const respuesta = await r.json().catch(() => ({}));
      if (!r.ok || respuesta.success === false) throw new Error(respuesta.message || r.status);
      form.reset();
      estadoEl.textContent = t('enviado');
    } catch (err) {
      console.error(err);
      estadoEl.textContent = t('error_envio');
    } finally {
      boton.disabled = false;
      boton.textContent = t('enviar');
    }
  },
  iniciar() {
    this.pintar();
    $('[data-cerrar-contacto]').addEventListener('click', () => this.cerrar());
    this.raiz.addEventListener('click', (e) => { if (e.target === this.raiz) this.cerrar(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.cerrar(); });
    $('[data-formulario]').addEventListener('submit', (e) => { e.preventDefault(); this.enviar(e.currentTarget); });
  },
};

/* ==========================================================================
   Componentes
   ========================================================================== */
function botonFlecha(href, texto) {
  return `<a class="boton-flecha" href="${href}">${esc(texto)}<span class="boton-flecha__icono">${icono('flecha')}</span></a>`;
}

function cinta(palabras, clases = 'liso-naranja') {
  const grupo = palabras.map((p) => `<span>${esc(p)}</span>`).join('');
  return `<div class="cinta ${clases}" aria-hidden="true"><div class="cinta__pista">${grupo}${grupo}${grupo}${grupo}</div></div>`;
}

function fraseConPalabras(texto) {
  let html = '';
  texto.split(/(\*\*.+?\*\*)/g).forEach((parte) => {
    if (!parte) return;
    const negrita = parte.startsWith('**');
    const limpio = negrita ? parte.slice(2, -2) : parte;
    const palabras = limpio.split(/(\s+)/).map((w) => (w.trim() ? `<span class="palabra">${esc(w)}</span>` : w)).join('');
    html += negrita ? `<strong>${palabras}</strong>` : palabras;
  });
  return html;
}

// "2024-11" → "nov 2024" en el idioma de quien visita; "2018" queda igual.
function fechaCorta(f = '') {
  const m = String(f).match(/^(\d{4})-(\d{2})$/);
  if (!m) return String(f);
  return new Date(Number(m[1]), Number(m[2]) - 1, 15).toLocaleDateString(locale(), { month: 'short', year: 'numeric' }).replace('.', '');
}
// Emblema repetido sobre cada franja de color de la portada.
function emblemas(src, cantidad) {
  return `<span class="emblemas" style="--n:${cantidad}" aria-hidden="true">${Array.from({ length: cantidad }, () => `<img src="${esc(src)}" alt="" loading="lazy" onerror="this.parentNode.remove()">`).join('')}</span>`;
}

// Miniaturas de videos de YouTube sobre la portada (se cargan en el navegador de quien visita).
function mosaicoVideos(ids) {
  return `<span class="mosaico" aria-hidden="true">${ids.slice(0, 6).map((id) => `<img src="https://i.ytimg.com/vi/${esc(id)}/mqdefault.jpg" alt="" loading="lazy" onerror="this.remove()">`).join('')}</span>`;
}

function hito(h, { completo = true } = {}) {
  const hasta = /^actual/i.test(h.hasta || '') ? t('actualidad') : fechaCorta(h.hasta);
  const desde = fechaCorta(h.desde);
  const fechas = desde && hasta && desde !== hasta ? `${desde} – ${hasta}` : (desde || hasta || '');
  const lugar = L(h.lugar);
  return `
    <li class="hito revela">
      <div class="hito__fechas">${esc(fechas)}</div>
      <div>
        <h3 class="hito__puesto">${esc(L(h.puesto))}</h3>
        ${lugar ? `<p class="hito__lugar">${h.url ? `<a href="${esc(h.url)}" target="_blank" rel="noopener">${esc(lugar)}</a>` : esc(lugar)}</p>` : ''}
        ${completo && h.descripcion ? `<div class="hito__desc">${textoRico(L(h.descripcion))}</div>` : ''}
        ${completo && h.enlaces ? `<p class="hito__enlaces">${h.enlaces.map((e) => `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(L(e.texto))} ${icono('flecha')}</a>`).join('')}</p>` : ''}
      </div>
    </li>`;
}
const hitoBreve = (h) => hito(h, { completo: false });

function ficha(it, alta = false) {
  const imgs = imagenesDe(it);
  const segunda = imgs.find((i) => i.ruta !== it.portada);
  const meta = [anio(it), imgs.length ? n('foto', imgs.length) : ''].filter(Boolean).join(', ');
  return `
    <a class="ficha revela${alta ? ' ficha--alta' : ''}" href="${enlace(it.ruta)}">
      <div class="ficha__imagen"><div class="ficha__mover" data-paralaje>
        ${it.portada ? `<img src="${url(it.portada)}" alt="" loading="lazy">` : ''}
        ${segunda ? `<img src="${url(segunda.ruta)}" alt="" loading="lazy">` : ''}
      </div></div>
      <div class="ficha__texto"><h3 class="ficha__nombre">${esc(tituloDe(it))}</h3><span class="ficha__meta">${esc(meta)}</span></div>
    </a>`;
}

function vacio(carpeta) {
  return `<div class="aviso"><h2>${esc(t('vacio_t'))}</h2><p>${esc(t('vacio_d', { c: carpeta }))}</p></div>`;
}

function pie() {
  const { config } = estado;
  const anioActual = new Date().getFullYear();
  return `
  <footer class="pie liso-negro grano" id="contacto">
    <div class="envoltura">
      <div class="pie__monograma" aria-label="HAG" role="img"><span class="cargador__h" data-dir="-1">H</span><span class="cargador__a" data-dir="0">a</span><span class="cargador__g" data-dir="1">G</span></div>
      <div class="pie__grilla">
        <div>
          <h3>${esc(t('contacto'))}</h3>
          <button class="pie__escribir" type="button" data-abrir-contacto><u>${esc(t('escribime'))}</u></button>
          <p style="color:var(--gris);margin:0.75rem 0 0;max-width:30ch">${esc(t('contacto_bajada'))}</p>
        </div>
        <div>
          <h3>${esc(t('secciones'))}</h3>
          <ul>
            <li><a href="#/proyectos">${esc(t('proyectos'))}</a></li>
            <li><a href="#/viajes">${esc(t('viajes'))}</a></li>
            <li><a href="#/trabajos">${esc(t('trabajos'))}</a></li>
            <li><a href="#/experiencia">${esc(t('experiencia'))}</a></li>
            <li><a href="#/cv">${esc(t('cv'))}</a></li>
          </ul>
        </div>
        <div>
          <h3>${esc(t('redes'))}</h3>
          <ul>${(config.redes || []).map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.nombre)}</a></li>`).join('')}</ul>
          <h3 style="margin-top:1.75rem">${esc(t('idioma'))}</h3>
          <div class="pie__idiomas">${botonesIdioma()}</div>
        </div>
      </div>
      <div class="pie__legal"><span>© ${anioActual} ${esc(nombreCompleto())}. ${esc(t('derechos'))}</span><a href="#/">${esc(t('inicio'))}</a></div>
    </div>
  </footer>`;
}

/* ==========================================================================
   Portada
   ========================================================================== */
function vistaInicio() {
  const { config, cv } = estado;
  const letras = (txt, desde) => [...txt].map((c, i) => `<span class="hero__letra" style="--i:${desde + i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
  const proyectos = items('Projects');
  const viajes = items('Trips');
  const trabajos = items('Works');
  const exp = (cv && cv.experiencia) || [];
  const est = (cv && cv.estudios) || [];

  return `
  <section class="hero grano" aria-label="${esc(nombreCompleto())}">
    <div class="hero__estela" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="envoltura hero__contenido">
      <h1 class="hero__nombre" data-nombre>
        <span class="hero__linea hero__linea--relleno">${letras(config.nombre, 0)}</span>
        ${config.apellido ? `<span class="hero__linea hero__linea--trazo">${letras(config.apellido, config.nombre.length)}</span>` : ''}
      </h1>
      <p class="hero__firma" aria-hidden="true">${esc(config.firma || config.nombre)}</p>
      <div class="hero__pie">
        <p><strong>${esc(L(config.rol))}</strong></p>
        <a class="hero__bajar" href="#/mensaje">${esc(t('seguir'))}<i aria-hidden="true"></i></a>
      </div>
    </div>
  </section>

  ${cinta([t('proyectos'), t('viajes'), t('trabajos'), t('experiencia'), t('estudios')])}

  <section class="mensaje grano" id="mensaje">
    <div class="aurora" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="envoltura mensaje__grilla">
      <div class="mensaje__lado">
        <span class="mensaje__comilla" aria-hidden="true">“</span>
        <span class="etiqueta">${esc(t('mensaje_de'))}</span>
        <span class="mensaje__firma">${esc(config.nombre)}</span>
      </div>
      <blockquote class="frase" data-frase>${fraseConPalabras(L(config.frase))}<span class="frase__cierre" aria-hidden="true">”</span></blockquote>
    </div>
  </section>

  <section class="proyectos liso-negro" id="proyectos" data-proyectos>
    <div class="proyectos__fijo">
      <div class="envoltura proyectos__cabeza">
        <h2 data-titulo-desliza class="titulo-seccion titulo-seccion--naranja"><span>${esc(t('proyectos'))}</span></h2>
        <p class="bajada">${esc(t('proyectos_bajada'))}</p>
      </div>
      ${proyectos.length ? `
      <div class="pista" data-pista>
        ${proyectos.map((p) => `
          <a class="proyecto revela" ${p.directo && p.enlace ? `href="${esc(p.enlace)}" target="_blank" rel="noopener"` : `href="${enlace(p.ruta)}"`}>
            <div class="proyecto__foto">${p.portada ? `<img data-paralaje-x src="${url(p.portada)}" alt="${esc(tituloDe(p))}" loading="lazy">` : ''}${p.portadaTexto ? `<span class="proyecto__sobre" aria-hidden="true">${esc(marcadores(p.portadaTexto))}</span>` : ''}${p.videos && p.videos.length ? mosaicoVideos(p.videos) : ''}${p.emblema && p.partes && p.partes.length ? emblemas(p.emblema, p.partes.length) : ''}</div>
            <div class="proyecto__pie"><span><b>${esc(tituloDe(p))}</b>${anio(p) ? `, ${esc(anio(p))}` : ''}</span><span class="proyecto__ir">${esc(p.directo && p.enlace ? etiquetaEnlace(p.enlace) : t('ver_proyecto'))}${p.directo ? ' ↗' : ''}</span></div>
          </a>`).join('')}
      </div>` : `<div class="envoltura">${vacio('Projects')}</div>`}
    </div>
  </section>

  ${cinta(['Viajes', 'Trips', 'Voyages', 'Reisen', 'Viagens', 'Viaggi'], 'liso-grafito cinta--inversa')}

  <section class="salon carbono" id="viajes">
    <div class="envoltura">
      <div class="salon__cabeza">
        <h2 data-titulo-desliza class="titulo-seccion titulo-seccion--naranja"><span>${esc(t('viajes_l1'))}</span><span>${esc(t('viajes_l2'))}</span></h2>
        <p class="bajada">${esc(t('viajes_bajada'))}</p>
      </div>
      ${viajes.length ? `<div class="salon__grilla">${viajes.map((v) => ficha(v)).join('')}</div>` : vacio('Trips')}
    </div>
  </section>

  <section class="salon puntos" id="trabajos">
    <div class="envoltura">
      <div class="salon__cabeza">
        <h2 data-titulo-desliza class="titulo-seccion"><span>${esc(t('trabajos_l1'))}</span><span>${esc(t('trabajos_l2'))}</span></h2>
        <p class="bajada">${esc(t('trabajos_bajada'))}</p>
      </div>
      ${trabajos.length ? `<div class="salon__grilla">${trabajos.map((w) => ficha(w, true)).join('')}</div>` : vacio('Works')}
    </div>
  </section>

  <section class="liso-negro" id="experiencia">
    <div class="envoltura trayectoria">
      <article class="panel liso-naranja revela">
        <h2 data-titulo-desliza class="titulo-seccion"><span>${esc(t('exp_l1'))}</span><span>${esc(t('exp_l2'))}</span></h2>
        <p class="bajada">${esc(t('exp_bajada'))}</p>
        <ol class="hitos">${exp.map(hitoBreve).join('')}</ol>
        ${botonFlecha('#/cv', t('ver_cv'))}
      </article>
      <article class="panel rayas revela" id="estudios">
        <h2 data-titulo-desliza class="titulo-seccion titulo-seccion--naranja"><span>${esc(t('est_l1'))}</span><span>${esc(t('est_l2'))}</span></h2>
        <p class="bajada">${esc(t('est_bajada'))}</p>
        <ol class="hitos">${est.slice(0, 4).map(hitoBreve).join('')}</ol>
        ${cv && cv.certificaciones && cv.certificaciones.length ? `<h3 class="panel__sub">${esc(t('certificaciones'))}</h3><ul class="certs">${cv.certificaciones.map((c) => `<li><b>${esc(L(c.puesto))}</b><span>${esc(L(c.lugar))} · ${esc(fechaCorta(c.desde))}</span></li>`).join('')}</ul>` : ''}
        ${botonFlecha('#/cv', t('ver_cv'))}
      </article>
    </div>
  </section>

  ${pie()}`;
}

/* ==========================================================================
   Detalle de proyecto, viaje o trabajo
   ========================================================================== */
function galeria(it, imgs) {
  return `<div class="album">${imgs.map((img) => {
    const d = descFoto(it, img);
    return `
    <button class="album__foto revela" type="button" data-foto="${esc(img.ruta)}" aria-label="${esc(d || limpiarNombre(img.nombre))}">
      <img src="${url(img.ruta)}" alt="${esc(d)}" loading="lazy" decoding="async">
      ${d ? `<span class="album__leyenda">${esc(d)}</span>` : ''}
    </button>`;
  }).join('')}</div>`;
}

function estante(it, docs, imgs) {
  const tipoEtiqueta = { pdf: 'PDF', texto: 'TXT', markdown: 'MD' };
  const libros = docs.map((d, i) => {
    const et = tipoEtiqueta[d.tipo] || '';
    const tapa = d.tipo === 'pdf'
      ? `<div class="libro__tapa" data-miniatura="${esc(d.ruta)}"><span class="libro__tipo">${et}</span></div>`
      : `<div class="libro__tapa libro__tapa--texto"><span class="libro__tipo">${et}</span><b>${esc(limpiarNombre(d.nombre))}</b><small>${esc(tituloDe(it))}</small></div>`;
    return `
      <button class="libro revela" type="button" data-leer="${i}">
        ${tapa}
        <span class="libro__nombre">${esc(limpiarNombre(d.nombre))}</span>
        <span class="libro__meta" data-meta="${esc(d.ruta)}">${et}</span>
      </button>`;
  });
  if (imgs.length > 1) {
    libros.push(`
      <button class="libro" type="button" data-leer-imagenes>
        <div class="libro__tapa"><img src="${url(imgs[0].ruta)}" alt="" loading="lazy"><span class="libro__tipo">IMG</span></div>
        <span class="libro__nombre">${esc(t('imagenes_proyecto'))}</span>
        <span class="libro__meta">${esc(n('imagen', imgs.length))}</span>
      </button>`);
  }
  return `<h2 class="subtitulo">${esc(t('para_leer'))}</h2><div class="estante">${libros.join('')}</div>`;
}

/* Vitrina: explicación a la izquierda y la app funcionando en los dispositivos a la derecha */
function vistaVitrina(seccion, it) {
  const conf = SECCIONES[seccion];
  const { intro, secciones } = seccionesDe(L(it.texto));
  const demo = (d) => it.demo[d] || it.demo._ || it.enlace;
  const conDisp = secciones.filter((x) => x.disp);
  const sueltas = secciones.filter((x) => !x.disp);
  const cabeza = `
      <nav class="migas" aria-label="breadcrumb"><a href="#/">${esc(t('inicio'))}</a><span aria-hidden="true">/</span><a href="#/${conf.id}">${esc(t(conf.id))}</a></nav>
      <h1 class="titular vitrina__nombre">${esc(tituloDe(it))}</h1>
      ${it.enlace ? `<div class="botones vitrina__botones"><a class="boton" href="${esc(it.enlace)}" target="_blank" rel="noopener">${esc(etiquetaEnlace(it.enlace))} ${icono('flecha')}</a></div>` : ''}`;
  const filas = it.dispositivos.map((d, i) => {
    const sec = conDisp.find((x) => x.disp === d);
    let texto;
    if (i === 0) {
      texto = `<div class="vitrina__texto">${cabeza}<div class="encabezado__texto">${textoRico(intro)}${sueltas.map((x) => `<h3 class="vitrina__sub">${esc(x.titulo)}</h3>${textoRico(x.texto)}`).join('')}</div></div>`;
    } else {
      texto = `<div class="vitrina__texto vitrina__texto--fijo"><span class="vitrina__chip">${esc(t(`disp_${d}`))}</span><h2 class="vitrina__titulo">${esc(sec ? sec.titulo : t(`disp_${d}`))}</h2>${sec ? `<div class="encabezado__texto">${textoRico(sec.texto)}</div>` : ''}</div>`;
    }
    return `<section class="vitrina__fila vitrina__fila--${d}${i === 0 ? ' vitrina__fila--intro' : ''}">${texto}<div class="vitrina__disp">${d === 'celular' ? celular(demo(d), tituloDe(it)) : dispositivo(d, demo(d), tituloDe(it))}</div></section>`;
  }).join('');
  const lista = items(seccion);
  const siguiente = lista[(lista.indexOf(it) + 1) % lista.length];
  return `
  <div class="pagina envoltura vitrina">
    ${filas}
    ${siguiente && siguiente !== it ? `<div style="margin-top:3rem">${botonFlecha(enlace(siguiente.ruta), `${t('siguiente')}: ${tituloDe(siguiente)}`)}</div>` : ''}
  </div>
  ${pie()}`;
}

/* Grupo: proyecto con partes independientes (las clases de Conquistadores) */
function tarjetaParte(padre, p, i) {
  const { estilo } = colorDe(p.color);
  return `
    <a class="clase revela" href="${enlace(p.ruta)}" style="${estilo}">
      ${padre.emblema ? `<img class="clase__emblema" src="${esc(padre.emblema)}" alt="" loading="lazy" onerror="this.remove()">` : ''}
      <span class="clase__num">${String(i + 1).padStart(2, '0')}</span>
      <span class="clase__nombre">${esc(tituloDe(p))}</span>
      <span class="clase__ir">${esc(t('ver_clase'))} ${icono('flecha')}</span>
    </a>`;
}

function vistaGrupo(seccion, it) {
  const conf = SECCIONES[seccion];
  return `
  <div class="pagina envoltura">
    <nav class="migas" aria-label="breadcrumb"><a href="#/">${esc(t('inicio'))}</a><span aria-hidden="true">/</span><a href="#/${conf.id}">${esc(t(conf.id))}</a></nav>
    <header class="encabezado">
      <h1 class="titular">${esc(tituloDe(it))}</h1>
      <div>
        <div class="encabezado__datos"><span><b>${it.partes.length}</b>${esc(t('clases'))}</span></div>
        <div class="encabezado__texto">${textoRico(L(it.texto))}</div>
        ${it.enlace ? `<div class="botones"><a class="boton" href="${esc(it.enlace)}" target="_blank" rel="noopener">${esc(etiquetaEnlace(it.enlace))} ${icono('flecha')}</a></div>` : ''}
      </div>
    </header>
    <div class="clases">${it.partes.map((p, i) => tarjetaParte(it, p, i)).join('')}</div>
  </div>
  ${pie()}`;
}

function vistaParte(seccion, padre, p) {
  const conf = SECCIONES[seccion];
  const i = padre.partes.indexOf(p);
  const { estilo } = colorDe(p.color);
  const tieneLista = !!idLista(p.lista);
  return `
  <div class="parte" style="${estilo}">
    <div class="parte__banda grano">
      <div class="envoltura">
        <nav class="migas" aria-label="breadcrumb"><a href="#/">${esc(t('inicio'))}</a><span aria-hidden="true">/</span><a href="#/${conf.id}">${esc(t(conf.id))}</a><span aria-hidden="true">/</span><a href="${enlace(padre.ruta)}">${esc(tituloDe(padre))}</a></nav>
        ${padre.emblema ? `<img class="parte__emblema" src="${esc(padre.emblema)}" alt="" onerror="this.remove()">` : ''}
        <span class="parte__num">${String(i + 1).padStart(2, '0')} / ${String(padre.partes.length).padStart(2, '0')}</span>
        <h1 class="parte__titulo">${esc(tituloDe(p))}</h1>
        <div class="parte__texto">${textoRico(L(p.texto))}</div>
      </div>
    </div>
    <div class="envoltura parte__cuerpo">
      ${tieneLista ? `<h2 class="subtitulo">${esc(t('lista_videos'))}</h2>${reproductorLista(p.lista, tituloDe(p))}
        <div class="botones" style="margin-top:1.25rem"><a class="boton" href="${esc(p.lista)}" target="_blank" rel="noopener">${esc(t('ver_youtube'))} ${icono('flecha')}</a></div>`
      : `<div class="aviso"><h2>${esc(t('lista_videos'))}</h2><p>${esc(t('pronto'))}</p><div class="botones"><a class="boton" href="${esc(padre.enlace || 'https://www.youtube.com/@hagproducciones')}" target="_blank" rel="noopener">${esc(t('ver_youtube'))} ${icono('flecha')}</a></div></div>`}
      <nav class="clases-mini" aria-label="${esc(t('clases'))}">
        ${padre.partes.map((x) => `<a href="${enlace(x.ruta)}" style="${colorDe(x.color).estilo}" ${x === p ? 'aria-current="page"' : ''}>${esc(tituloDe(x))}</a>`).join('')}
      </nav>
    </div>
  </div>
  ${pie()}`;
}

function vistaReproductor(seccion, it) {
  const conf = SECCIONES[seccion];
  return `
  <div class="pagina envoltura">
    <nav class="migas" aria-label="breadcrumb"><a href="#/">${esc(t('inicio'))}</a><span aria-hidden="true">/</span><a href="#/${conf.id}">${esc(t(conf.id))}</a></nav>
    <header class="encabezado encabezado--musica">
      <h1 class="titular">${esc(tituloDe(it))}</h1>
      <div class="encabezado__texto">${textoRico(L(it.texto))}</div>
    </header>
    ${vistaMusica(it)}
  </div>
  ${pie()}`;
}

function vistaDetalle(seccion, it) {
  if (it.reproductor) return vistaReproductor(seccion, it);
  if (it.dispositivos && it.dispositivos.length) return vistaVitrina(seccion, it);
  if (it.partes && it.partes.length) return vistaGrupo(seccion, it);
  const lista = items(seccion);
  const i = lista.indexOf(it);
  const siguiente = lista[(i + 1) % lista.length];
  const imgs = imagenesDe(it);
  const docs = documentosDe(it);
  const texto = L(it.texto);
  const conf = SECCIONES[seccion];
  const esProyecto = seccion === 'Projects';
  const imgsAlbum = esProyecto ? imgs.filter((x) => x.ruta !== it.portada) : imgs;

  const datos = [];
  if (imgsAlbum.length) datos.push([imgsAlbum.length, n('foto', imgsAlbum.length).replace(/^\d+\s/, '')]);
  if (docs.length) datos.push([docs.length, n('documento', docs.length).replace(/^\d+\s/, '')]);
  if (anio(it)) datos.push([anio(it), '']);

  return `
  <div class="pagina envoltura">
    <nav class="migas" aria-label="breadcrumb"><a href="#/">${esc(t('inicio'))}</a><span aria-hidden="true">/</span><a href="#/${conf.id}">${esc(t(conf.id))}</a></nav>
    <header class="encabezado">
      <h1 class="titular">${esc(tituloDe(it))}</h1>
      <div>
        ${datos.length ? `<div class="encabezado__datos">${datos.map(([a, b]) => `<span><b>${esc(a)}</b>${esc(b)}</span>`).join('')}</div>` : ''}
        ${texto ? `<div class="encabezado__texto">${textoRico(texto)}</div>` : ''}
        ${it.enlace ? `<div class="botones"><a class="boton" href="${esc(it.enlace)}" target="_blank" rel="noopener">${esc(etiquetaEnlace(it.enlace))} ${icono('flecha')}</a></div>` : ''}
      </div>
    </header>
    ${idLista(it.lista) ? `<h2 class="subtitulo">${esc(t('ultimos_videos'))}</h2>${reproductorLista(it.lista, tituloDe(it))}<div style="height:clamp(3rem,6vw,5rem)"></div>` : ''}
    ${esProyecto && it.portada && !idLista(it.lista) ? `<div class="portada-grande"><img src="${url(it.portada)}" alt="${esc(tituloDe(it))}"></div>` : ''}
    ${docs.length ? estante(it, docs, imgs) : ''}
    ${imgsAlbum.length ? `${docs.length || esProyecto ? `<h2 class="subtitulo">${esc(t('imagenes'))}</h2>` : ''}${galeria(it, imgsAlbum)}` : ''}
    ${siguiente && siguiente !== it ? `<div style="margin-top:3rem">${botonFlecha(enlace(siguiente.ruta), `${t('siguiente')}: ${tituloDe(siguiente)}`)}</div>` : ''}
  </div>
  ${pie()}`;
}

/* ==========================================================================
   Currículum
   ========================================================================== */
function vistaCV() {
  const { cv, config, manifest } = estado;
  const pdf = manifest.cv && manifest.cv.pdf;
  const linkedin = (config.redes || []).find((r) => /linkedin/i.test(r.url));
  const lista = (titulo, valores) => (valores && valores.length ? `<div><h3>${esc(titulo)}</h3><ul class="chips">${valores.map((x) => `<li>${esc(L(x))}</li>`).join('')}</ul></div>` : '');
  return `
  <div class="pagina envoltura">
    <nav class="migas" aria-label="breadcrumb"><a href="#/">${esc(t('inicio'))}</a><span aria-hidden="true">/</span><span>${esc(t('cv'))}</span></nav>
    <header class="encabezado">
      <h1 class="titular">${esc(config.nombre)}<br>${esc(config.apellido || '')}</h1>
      <div>
        <div class="encabezado__texto"><p>${esc(L(config.rol))}</p></div>
        <div class="botones">
          ${pdf ? `<button class="boton" type="button" data-leer-cv>${esc(t('leer_cv'))}</button><a class="boton boton--sec" href="${url(pdf)}" download>${esc(t('descargar_cv'))}</a>` : ''}
          ${linkedin ? `<a class="boton ${pdf ? 'boton--sec' : ''}" href="${esc(linkedin.url)}" target="_blank" rel="noopener">${esc(t('linkedin_cv'))}</a>` : ''}
        </div>
      </div>
    </header>
    <div class="cv">
      <div>
        ${cv && cv.experiencia && cv.experiencia.length ? `<h2 class="subtitulo">${esc(t('experiencia'))}</h2><ol class="linea-tiempo">${cv.experiencia.map((h) => hito(h)).join('')}</ol>` : ''}
        ${cv && cv.estudios && cv.estudios.length ? `<h2 class="subtitulo">${esc(t('estudios'))}</h2><ol class="linea-tiempo">${cv.estudios.map((h) => hito(h)).join('')}</ol>` : ''}
        ${cv && cv.certificaciones && cv.certificaciones.length ? `<h2 class="subtitulo">${esc(t('certificaciones'))}</h2><ol class="linea-tiempo">${cv.certificaciones.map((h) => hito(h)).join('')}</ol>` : ''}
      </div>
      <aside class="cv__lateral">
        ${lista(t('habilidades'), cv && cv.habilidades)}
        ${lista(t('idiomas_cv'), cv && cv.idiomas)}
        <div><button class="boton" type="button" data-abrir-contacto>${esc(t('escribime'))}</button></div>
      </aside>
    </div>
  </div>
  ${pie()}`;
}

function vistaNoEncontrada() {
  return `
  <div class="pagina envoltura">
    <h1 class="titular">404</h1>
    <div class="aviso" style="margin-top:3rem"><h2>${esc(t('no_encontrado'))}</h2><p>${esc(t('no_encontrado_d'))}</p>${botonFlecha('#/', t('volver'))}</div>
  </div>
  ${pie()}`;
}

function vistaError(err) {
  return `
  <div class="pagina envoltura">
    <div class="aviso"><h2>${esc(t('sin_datos'))}</h2><p>${esc(t('sin_datos_d'))}</p><p><code>${esc(err.message)}</code></p></div>
  </div>`;
}

/* ==========================================================================
   Visor de fotos
   ========================================================================== */
const visor = {
  raiz: $('[data-visor]'),
  abrir(it, lista, i) {
    this.it = it; this.lista = lista; this.i = i;
    this.ultimoFoco = document.activeElement;
    this.raiz.classList.add('abierto');
    document.body.classList.add('bloqueado');
    history.pushState({ visor: true }, '', location.hash || '#/');
    this.mostrar(0);
    $('[data-visor-cerrar]').focus({ preventScroll: true });
  },
  cerrar(desdeHistorial = false) {
    if (!this.raiz.classList.contains('abierto')) return;
    this.raiz.classList.remove('abierto');
    document.body.classList.remove('bloqueado');
    if (!desdeHistorial && history.state && history.state.visor) history.back();
    if (this.ultimoFoco) this.ultimoFoco.focus({ preventScroll: true });
  },
  mostrar(dir) {
    const img = $('[data-visor-img]');
    const item = this.lista[this.i];
    const d = descFoto(this.it, item);
    img.src = url(item.ruta);
    img.alt = d || limpiarNombre(item.nombre);
    $('[data-visor-titulo]').innerHTML = `${esc(tituloDe(this.it))}<span>${this.i + 1} / ${this.lista.length}</span>`;
    $('[data-visor-desc]').textContent = d;
    img.style.transition = 'none';
    img.style.transform = dir ? `translateX(${dir * 24}px)` : 'scale(0.98)';
    img.style.opacity = '0';
    img.decode().catch(() => {}).then(() => { img.style.transition = ''; img.style.transform = ''; img.style.opacity = '1'; });
    $('[data-visor-ant]').disabled = this.i === 0;
    $('[data-visor-sig]').disabled = this.i === this.lista.length - 1;
    [this.i - 1, this.i + 1].forEach((j) => { if (this.lista[j]) new Image().src = url(this.lista[j].ruta); });
  },
  mover(d) {
    const j = this.i + d;
    if (j < 0 || j >= this.lista.length) return;
    this.i = j;
    this.mostrar(d);
  },
  iniciar() {
    $('[data-visor-cerrar]').addEventListener('click', () => this.cerrar());
    $('[data-visor-ant]').addEventListener('click', () => this.mover(-1));
    $('[data-visor-sig]').addEventListener('click', () => this.mover(1));
    const escena = $('[data-visor-escena]');
    escena.addEventListener('click', (e) => { if (e.target === escena) this.cerrar(); });
    let x0 = null;
    escena.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    escena.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 45) this.mover(dx < 0 ? 1 : -1);
      x0 = null;
    });
    document.addEventListener('keydown', (e) => {
      if (!this.raiz.classList.contains('abierto')) return;
      if (e.key === 'Escape') this.cerrar();
      if (e.key === 'ArrowRight') this.mover(1);
      if (e.key === 'ArrowLeft') this.mover(-1);
    });
    window.addEventListener('popstate', () => {
      if (this.raiz.classList.contains('abierto') && !(history.state && history.state.visor)) this.cerrar(true);
    });
  },
};

/* ==========================================================================
   Efectos de desplazamiento (solo en la portada)
   ========================================================================== */
const efectos = {
  activo: false,
  medirLigero() {
    if (this.activo) return;
    this.titulos = $$('[data-titulo-desliza], .pie__monograma');
    this.paralajes = $$('[data-paralaje]');
    this.paralajesX = [];
    this.palabras = [];
    this.proyectos = null;
    this.actualizar();
  },
  medir() {
    this.proyectos = $('[data-proyectos]');
    this.pista = $('[data-pista]');
    this.frase = $('[data-frase]');
    this.palabras = this.frase ? $$('.palabra', this.frase) : [];
    this.titulos = $$('[data-titulo-desliza], .pie__monograma');
    this.paralajes = $$('[data-paralaje]');
    this.paralajesX = $$('[data-paralaje-x]');
    if (this.proyectos) {
      this.proyectos.style.height = '';
      const libre = !this.pista || reduceMotion() || window.innerWidth < 760;
      this.proyectos.classList.toggle('proyectos--libre', libre);
      this.desborde = 0;
      if (!libre) {
        this.pista.style.transform = '';
        this.desborde = Math.max(0, this.pista.scrollWidth - window.innerWidth);
        if (this.desborde > 0) this.proyectos.style.height = `${window.innerHeight + this.desborde}px`;
        else this.proyectos.classList.add('proyectos--libre');
      }
    }
    this.actualizar();
  },
  actualizar() {
    this.pendiente = false;
    const vh = window.innerHeight;
    if (this.proyectos && this.desborde > 0 && !this.proyectos.classList.contains('proyectos--libre')) {
      const r = this.proyectos.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / (r.height - vh)));
      this.pista.style.transform = `translate3d(${-p * this.desborde}px,0,0)`;
    }
    if (!reduceMotion()) {
      const vw = window.innerWidth;
      for (const el of this.titulos) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -50 || r.top > vh + 50) continue;
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75)));
        const lineas = el.children.length ? Array.from(el.children) : [el];
        lineas.forEach((l, i) => {
          const dir = l.dataset.dir !== undefined ? Number(l.dataset.dir) : (i % 2 ? 1 : -1);
          l.style.transform = `translate3d(${(dir * (1 - p) * 14).toFixed(2)}vw,0,0)`;
        });
      }
      for (const el of this.paralajes) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const d = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0,${(d * -9).toFixed(2)}%,0) scale(1.18)`;
      }
      for (const el of this.paralajesX) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.right < 0 || r.left > vw) continue;
        const d = (r.left + r.width / 2 - vw / 2) / vw;
        el.style.transform = `translate3d(${(d * -4).toFixed(2)}%,0,0) scale(1.08)`;
      }
    }
    if (this.palabras.length && !reduceMotion()) {
      const r = this.frase.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55 + r.height * 0.3)));
      const total = this.palabras.length;
      this.palabras.forEach((w, i) => {
        const o = Math.min(1, Math.max(0.12, p * total * 1.1 - i + 1));
        w.style.setProperty('--o', o.toFixed(2));
      });
    }
  },
  alDesplazar() {
    if (efectos.pendiente) return;
    efectos.pendiente = true;
    requestAnimationFrame(() => efectos.actualizar());
  },
  iniciar() {
    window.addEventListener('scroll', () => this.alDesplazar(), { passive: true });
    let tm;
    window.addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (this.activo) this.medir(); ajustarNombre(); }, 150); });
  },
};

/* ==========================================================================
   Comportamiento de cada vista
   ========================================================================== */
let lector;

function ajustarNombre() {
  const h = $('[data-nombre]');
  if (!h) return;
  h.style.setProperty('--tam-nombre', '100px');
  const lineas = $$('.hero__linea', h);
  const ancho = Math.max(...lineas.map((l) => l.scrollWidth));
  const cont = h.parentElement;
  const disponible = cont.clientWidth - parseFloat(getComputedStyle(cont).paddingLeft) * 2;
  const porAncho = (100 * disponible) / ancho;
  const porAlto = (window.innerHeight * 0.58) / (lineas.length * 0.9);
  h.style.setProperty('--tam-nombre', `${Math.floor(Math.min(porAncho, porAlto))}px`);
}

function activarVista(ctx) {
  efectos.activo = !!ctx.inicio;
  if (ctx.inicio) {
    ajustarNombre();
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {
      ajustarNombre();
      efectos.medir();
      cargadorListo.then(() => requestAnimationFrame(() => document.body.classList.add('cargado')));
      if (ctx.ancla) {
        const destino = document.getElementById(ctx.ancla);
        if (destino) destino.scrollIntoView({ behavior: ctx.suave ? 'smooth' : 'auto' });
      }
    });
    $$('img', $('[data-pista]') || document.createElement('div')).forEach((img) => img.addEventListener('load', () => efectos.medir(), { once: true }));
  }

  activarDispositivos();
  if (ctx.item && ctx.item.reproductor) activarMusica(ctx.item); else salirDeMusica();
  revelar();
  efectos.medirLigero();
  $$('.album__foto img').forEach((img) => {
    if (img.complete) img.classList.add('listo');
    else img.addEventListener('load', () => img.classList.add('listo'), { once: true });
  });

  const it = ctx.item;
  if (it) {
    const imgs = imagenesDe(it);
    const docs = documentosDe(it);
    const enAlbum = ctx.seccion === 'Projects' ? imgs.filter((x) => x.ruta !== it.portada) : imgs;
    $$('[data-foto]').forEach((b) => b.addEventListener('click', () => {
      visor.abrir(it, enAlbum, enAlbum.findIndex((x) => x.ruta === b.dataset.foto));
    }));
    $$('[data-leer]').forEach((b) => b.addEventListener('click', () => {
      const d = docs[Number(b.dataset.leer)];
      lector.abrir({ titulo: limpiarNombre(d.nombre), sub: tituloDe(it), tipo: d.tipo, url: url(d.ruta), descarga: url(d.ruta) });
    }));
    const bImgs = $('[data-leer-imagenes]');
    if (bImgs) bImgs.addEventListener('click', () => lector.abrir({ titulo: t('imagenes_proyecto'), sub: tituloDe(it), tipo: 'imagenes', urls: imgs.map((x) => url(x.ruta)) }));
    miniaturas();
  }

  const bCV = $('[data-leer-cv]');
  if (bCV) bCV.addEventListener('click', () => lector.abrir({ titulo: t('cv'), sub: nombreCompleto(), tipo: 'pdf', url: url(estado.manifest.cv.pdf), descarga: url(estado.manifest.cv.pdf) }));
}

let observadorRevela;
function revelar() {
  const els = $$('.revela');
  if (!('IntersectionObserver' in window) || reduceMotion()) { els.forEach((e) => e.classList.add('visible')); return; }
  if (observadorRevela) observadorRevela.disconnect();
  observadorRevela = new IntersectionObserver((entradas) => {
    // Escalonado: los que entran juntos aparecen uno tras otro.
    let k = 0;
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.style.setProperty('--d', `${Math.min(k++, 6) * 80}ms`);
      e.target.classList.add('visible');
      observadorRevela.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((e) => observadorRevela.observe(e));
}

function miniaturas() {
  const tapas = $$('[data-miniatura]');
  if (!tapas.length) return;
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach(async (e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const ruta = e.target.dataset.miniatura;
      try {
        const { canvas, paginas } = await miniaturaPDF(url(ruta), e.target.clientWidth || 300);
        canvas.setAttribute('aria-hidden', 'true');
        e.target.prepend(canvas);
        const meta = $(`[data-meta="${CSS.escape(ruta)}"]`);
        if (meta) meta.textContent = `PDF, ${n('pagina', paginas)}`;
      } catch (_) {
        e.target.classList.add('libro__tapa--texto');
        e.target.insertAdjacentHTML('beforeend', `<b>${esc(limpiarNombre(ruta.split('/').pop()))}</b>`);
      }
    });
  }, { rootMargin: '200px' });
  tapas.forEach((x) => io.observe(x));
}

/* ==========================================================================
   Rutas
   ========================================================================== */
const ANCLAS = ['proyectos', 'viajes', 'trabajos', 'experiencia', 'estudios', 'mensaje', 'contacto'];

function resolver() {
  const segs = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map((s) => { try { return decodeURIComponent(s); } catch (_) { return s; } });
  const nombre = nombreCompleto();
  if (!segs.length) return { html: vistaInicio(), titulo: nombre, inicio: true };
  if (segs.length === 1 && ANCLAS.includes(segs[0])) return { html: vistaInicio(), titulo: `${t(segs[0] === 'mensaje' || segs[0] === 'contacto' ? 'inicio' : segs[0])}, ${nombre}`, inicio: true, ancla: segs[0] };
  if (segs[0] === 'cv') return { html: vistaCV(), titulo: `${t('cv')}, ${nombre}` };
  if (SECCIONES[segs[0]]) {
    if (segs.length === 1) return { html: vistaInicio(), titulo: nombre, inicio: true, ancla: SECCIONES[segs[0]].id };
    const it = items(segs[0]).find((x) => x.carpeta === segs[1]);
    if (it && segs[2]) {
      const p = (it.partes || []).find((x) => x.carpeta === segs[2]);
      if (p) return { html: vistaParte(segs[0], it, p), titulo: `${tituloDe(p)} · ${tituloDe(it)}, ${nombre}` };
    }
    if (it) return { html: vistaDetalle(segs[0], it), titulo: `${tituloDe(it)}, ${nombre}`, item: it, seccion: segs[0] };
  }
  // Enlaces viejos (por ejemplo "Guia Conquistadores"): llevar a la carpeta con el nombre más parecido.
  if (SECCIONES[segs[0]] && segs[1]) {
    const norm = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    const buscado = norm(segs[1]);
    const parecido = items(segs[0]).find((x) => buscado.includes(norm(x.carpeta)) || norm(x.carpeta).includes(buscado));
    if (parecido) { location.replace(enlace(parecido.ruta)); return null; }
  }
  return { html: vistaNoEncontrada(), titulo: nombre };
}

let primera = true;
let rutaAnterior = '';
async function navegar(opciones = {}) {
  const app = $('#app');
  const ctx = resolver();
  if (!ctx) return;
  const misma = opciones.mismoLugar;
  const yAntes = window.scrollY;
  // Si ya estamos en la portada y solo cambia la sección, desplazar sin volver a pintar.
  const base = (h) => (/^#\/?(proyectos|viajes|trabajos|experiencia|estudios|mensaje|contacto)?$/.test(h) ? 'portada' : h);
  if (!misma && !primera && ctx.inicio && base(rutaAnterior) === 'portada' && ctx.ancla) {
    rutaAnterior = location.hash;
    const destino = document.getElementById(ctx.ancla);
    if (destino) destino.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
    return;
  }
  if (!primera && !misma) {
    app.classList.add('saliendo');
    await new Promise((r) => setTimeout(r, 180));
  }
  if (!misma) document.body.classList.remove('cargado');
  app.innerHTML = ctx.html;
  document.title = ctx.titulo;
  if (misma) {
    window.scrollTo(0, yAntes);
    if (ctx.inicio) document.body.classList.add('cargado');
  } else if (!ctx.ancla) window.scrollTo(0, 0);
  app.classList.remove('saliendo');
  if (!primera && !misma) app.focus({ preventScroll: true });
  activarVista({ ...ctx, ancla: misma ? null : ctx.ancla, suave: false });
  if (misma) requestAnimationFrame(() => window.scrollTo(0, yAntes));
  primera = false;
  rutaAnterior = location.hash;
  // Google Analytics: registrar cada sección visitada (el sitio cambia de página sin recargar).
  if (!primeraCarga && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_title: document.title, page_location: location.href, page_path: location.pathname + location.hash });
  }
  primeraCarga = false;
}
let primeraCarga = true;

/* ==========================================================================
   Pantalla de carga HAG
   ========================================================================== */
let liberarCargador;
const cargadorListo = new Promise((r) => { liberarCargador = r; });
const inicioCarga = performance.now();
function ocultarCargador() {
  const el = $('[data-cargador]');
  const minimo = reduceMotion() ? 0 : 1500;
  const espera = Math.max(0, minimo - (performance.now() - inicioCarga));
  setTimeout(() => {
    if (!el) return liberarCargador();
    el.classList.add('saliendo');
    setTimeout(liberarCargador, reduceMotion() ? 0 : 380);
    setTimeout(() => el.remove(), 1100);
  }, espera);
}

/* ==========================================================================
   Inicio
   ========================================================================== */
(async function iniciar() {
  aplicarTextosFijos();
  try {
    estado.config = await json('config.json');
    estado.manifest = await json('manifest.json');
    estado.cv = await json('cv/cv.json').catch(() => null);
  } catch (err) {
    console.error(err);
    $('#app').innerHTML = vistaError(err);
    ocultarCargador();
    return;
  }
  pintarCabecera();
  iniciarCabecera();
  contacto.iniciar();
  visor.iniciar();
  efectos.iniciar();
  lector = new Lector($('[data-lector]'), { firma: estado.config.firma || estado.config.nombre, t });
  window.addEventListener('hashchange', () => navegar());
  // Al cambiar de idioma se vuelve a pintar el formulario y los textos fijos.
  document.addEventListener('click', (e) => { if (e.target.closest('[data-idioma]')) contacto.pintar(); });
  await navegar();
  await (document.fonts ? document.fonts.ready : Promise.resolve());
  ocultarCargador();
})();
