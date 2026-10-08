// Lector tipo libro.
// Convierte un PDF, un .txt, un .md o un grupo de imágenes en un libro que se hojea:
// doble página en pantallas anchas, una sola página en el teléfono.

const PDFJS = 'assets/vendor/pdf.min.js';
const PDFJS_WORKER = 'assets/vendor/pdf.worker.min.js';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------------ */
/* pdf.js bajo demanda                                                      */
/* ------------------------------------------------------------------------ */
let promesaPDFJS = null;
export function cargarPDFJS() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!promesaPDFJS) {
    promesaPDFJS = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = PDFJS;
      s.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
        resolve(window.pdfjsLib);
      };
      s.onerror = () => reject(new Error('No se pudo cargar el lector de PDF.'));
      document.head.appendChild(s);
    });
  }
  return promesaPDFJS;
}

const pdfsAbiertos = new Map();
function abrirPDF(url) {
  if (!pdfsAbiertos.has(url)) {
    pdfsAbiertos.set(url, cargarPDFJS().then((lib) => lib.getDocument(url).promise));
  }
  return pdfsAbiertos.get(url);
}

export async function miniaturaPDF(url, ancho = 360) {
  const pdf = await abrirPDF(url);
  const pagina = await pdf.getPage(1);
  const base = pagina.getViewport({ scale: 1 });
  const escala = (ancho * Math.min(window.devicePixelRatio || 1, 2)) / base.width;
  const vp = pagina.getViewport({ scale: escala });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(vp.width);
  canvas.height = Math.floor(vp.height);
  await pagina.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
  return { canvas, paginas: pdf.numPages };
}

/* ------------------------------------------------------------------------ */
/* Documentos                                                               */
/* Cada documento sabe cuántas páginas tiene y cómo dibujar la página i.    */
/* ------------------------------------------------------------------------ */
class DocPDF {
  constructor(url) { this.url = url; this.cache = new Map(); this.texto = false; }
  async iniciar() {
    this.pdf = await abrirPDF(this.url);
    const p1 = await this.pdf.getPage(1);
    const vp = p1.getViewport({ scale: 1 });
    this.aspecto = vp.width / vp.height;
  }
  total() { return this.pdf.numPages; }
  async preparar() {}
  async lienzo(i, ancho) {
    const clave = `${i}@${Math.round(ancho)}`;
    if (!this.cache.has(clave)) {
      this.cache.set(clave, (async () => {
        const pagina = await this.pdf.getPage(i + 1);
        const base = pagina.getViewport({ scale: 1 });
        const escala = (ancho * Math.min(window.devicePixelRatio || 1, 2.5)) / base.width;
        const vp = pagina.getViewport({ scale: escala });
        const c = document.createElement('canvas');
        c.width = Math.floor(vp.width);
        c.height = Math.floor(vp.height);
        await pagina.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        return c;
      })());
      if (this.cache.size > 40) this.cache.delete(this.cache.keys().next().value);
    }
    return this.cache.get(clave);
  }
  async pagina(i, ancho) {
    const origen = await this.lienzo(i, ancho);
    const copia = document.createElement('canvas');
    copia.width = origen.width;
    copia.height = origen.height;
    copia.getContext('2d').drawImage(origen, 0, 0);
    copia.setAttribute('role', 'img');
    copia.setAttribute('aria-label', String(i + 1));
    return copia;
  }
  precargar(i, ancho) { if (i >= 0 && i < this.total()) this.lienzo(i, ancho).catch(() => {}); }
}

class DocImagenes {
  constructor(urls) { this.urls = urls; this.texto = false; }
  async iniciar() {
    const img = await cargarImagen(this.urls[0]);
    this.aspecto = img.naturalWidth / img.naturalHeight || 0.75;
  }
  total() { return this.urls.length; }
  async preparar() {}
  async pagina(i) {
    const caja = document.createElement('div');
    caja.className = 'pag-imagen';
    const img = new Image();
    img.decoding = 'async';
    img.alt = String(i + 1);
    img.src = this.urls[i];
    caja.appendChild(img);
    try { await img.decode(); } catch (_) { /* se muestra igual */ }
    return caja;
  }
  precargar(i) { if (i >= 0 && i < this.total()) new Image().src = this.urls[i]; }
}

function cargarImagen(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

// Convierte texto plano en bloques HTML: párrafos separados por líneas en blanco,
// títulos cortos detectados como encabezados.
export function textoAHTML(texto) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const bloques = texto.replace(/\r\n?/g, '\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return bloques.map((b, i) => {
    const una = !b.includes('\n');
    const corto = b.length <= 70 && !/[.;:,]$/.test(b);
    if (i === 0 && una && (b === b.toUpperCase() || corto)) return `<h1>${esc(b)}</h1>`;
    if (una && corto) return `<h2>${esc(b)}</h2>`;
    return `<p>${esc(b).replace(/\n/g, '<br>')}</p>`;
  }).join('\n');
}

class DocTexto {
  constructor({ url, markdown, titulo, firma }) {
    this.url = url; this.markdown = markdown; this.titulo = titulo; this.firma = firma;
    this.texto = true; this.escala = 1; this.paginas = []; this.clave = '';
  }
  async iniciar() {
    const r = await fetch(this.url);
    if (!r.ok) throw new Error(`No se pudo abrir el archivo (${r.status}).`);
    let crudo = await r.text();
    if (this.markdown) {
      crudo = crudo.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, '');
      this.html = window.marked ? window.marked.parse(crudo) : textoAHTML(crudo);
    } else {
      this.html = textoAHTML(crudo);
    }
    this.aspecto = 0.7;
  }
  total() { return this.paginas.length + 1; }
  tamLetra(ancho) { return Math.max(13, Math.min(21, ancho / 25)) * this.escala; }

  async preparar(ancho, alto) {
    const clave = `${Math.round(ancho)}x${Math.round(alto)}@${this.escala}`;
    if (clave === this.clave) return;
    this.clave = clave;
    if (document.fonts && document.fonts.ready) await document.fonts.ready;

    const medidor = document.createElement('div');
    medidor.className = 'medidor pag-texto__cuerpo';
    medidor.style.display = 'flow-root';
    medidor.style.width = `${ancho * 0.8}px`;
    medidor.style.fontSize = `${this.tamLetra(ancho)}px`;
    document.body.appendChild(medidor);
    const maxAlto = alto - ancho * 0.2 - this.tamLetra(ancho) * 0.6;

    const plantilla = document.createElement('div');
    plantilla.innerHTML = this.html;
    const cola = Array.from(plantilla.children);
    const paginas = [];
    let actual = [];
    medidor.innerHTML = '';
    const desborda = () => medidor.scrollHeight > maxAlto + 0.5;
    const cerrarPagina = () => {
      paginas.push(actual.map((n) => n.outerHTML).join(''));
      actual = [];
      medidor.innerHTML = '';
    };

    let guardia = 0;
    while (cola.length && guardia++ < 20000) {
      const nodo = cola.shift();
      medidor.appendChild(nodo);
      if (!desborda()) { actual.push(nodo); continue; }
      medidor.removeChild(nodo);
      const divisible = nodo.tagName === 'P' || nodo.tagName === 'LI' || nodo.tagName === 'BLOCKQUOTE';
      if (divisible) {
        const [cabe, resto] = this.partir(nodo, medidor, desborda);
        if (cabe) { actual.push(cabe); }
        if (resto) cola.unshift(resto);
        if (cabe || actual.length) { cerrarPagina(); continue; }
      }
      if (actual.length === 0) {
        medidor.appendChild(nodo);
        actual.push(nodo);
        cerrarPagina();
      } else {
        cola.unshift(nodo);
        cerrarPagina();
      }
    }
    if (actual.length) cerrarPagina();
    medidor.remove();
    this.paginas = paginas.length ? paginas : ['<p></p>'];
  }

  // Parte un párrafo en la cantidad de palabras que entra en la página.
  partir(nodo, medidor, desborda) {
    const tokens = nodo.innerHTML.match(/<[^>]+>|[^<\s]+|\s+/g) || [];
    const indicesPalabra = tokens.map((t, i) => (!t.startsWith('<') && t.trim() ? i : -1)).filter((i) => i >= 0);
    if (indicesPalabra.length < 2) return [null, nodo];
    const construir = (n) => {
      const corte = indicesPalabra[n - 1] + 1;
      const pila = [];
      for (let i = 0; i < corte; i++) {
        const t = tokens[i];
        const m = t.match(/^<\/?([a-zA-Z0-9]+)/);
        if (!m || /\/>$/.test(t) || /^<(br|img|hr)/i.test(t)) continue;
        if (t.startsWith('</')) pila.pop(); else pila.push({ nombre: m[1], apertura: t });
      }
      const cierre = pila.slice().reverse().map((e) => `</${e.nombre}>`).join('');
      const reapertura = pila.map((e) => e.apertura).join('');
      return [tokens.slice(0, corte).join('') + cierre, reapertura + tokens.slice(corte).join('').trimStart()];
    };
    const prueba = nodo.cloneNode(false);
    medidor.appendChild(prueba);
    let bajo = 0;
    let alto = indicesPalabra.length - 1;
    while (bajo < alto) {
      const medio = Math.ceil((bajo + alto) / 2);
      prueba.innerHTML = construir(medio)[0];
      if (desborda()) alto = medio - 1; else bajo = medio;
    }
    medidor.removeChild(prueba);
    if (bajo === 0) return [null, nodo];
    const [a, b] = construir(bajo);
    const primero = nodo.cloneNode(false);
    primero.innerHTML = a;
    const segundo = nodo.cloneNode(false);
    segundo.innerHTML = b;
    segundo.classList.add('sin-sangria');
    medidor.appendChild(primero);
    return [primero, segundo];
  }

  async pagina(i, ancho) {
    const tam = this.tamLetra(ancho);
    if (i === 0) {
      const p = document.createElement('div');
      p.className = 'pag-portada';
      p.style.setProperty('--tam-portada', `${Math.max(28, ancho / 7.5)}px`);
      p.innerHTML = `<i></i><b></b><span></span>`;
      p.querySelector('b').textContent = this.titulo;
      p.querySelector('span').textContent = this.firma || '';
      return p;
    }
    const p = document.createElement('div');
    p.className = 'pag-texto';
    p.style.setProperty('--tam-libro', `${tam}px`);
    p.innerHTML = `<div class="pag-texto__cuerpo">${this.paginas[i - 1] || ''}</div><div class="pag-texto__numero">${i}</div>`;
    return p;
  }
  precargar() {}
}

/* ------------------------------------------------------------------------ */
/* Lector                                                                   */
/* ------------------------------------------------------------------------ */
export class Lector {
  constructor(raiz, { firma = '', t = (k) => k } = {}) {
    this.raiz = raiz;
    this.t = t;
    this.firma = firma;
    this.$ = (sel) => raiz.querySelector(sel);
    this.escena = this.$('[data-lector-escena]');
    this.rango = this.$('[data-lector-rango]');
    this.contador = this.$('[data-lector-contador]');
    this.pos = 0;
    this.animacion = null;
    this.token = 0;

    this.$('[data-lector-cerrar]').addEventListener('click', () => this.cerrar());
    this.$('[data-lector-ant]').addEventListener('click', () => this.anterior());
    this.$('[data-lector-sig]').addEventListener('click', () => this.siguiente());
    this.rango.addEventListener('input', () => this.irAPagina(Number(this.rango.value), false));
    raiz.querySelectorAll('[data-tam]').forEach((b) =>
      b.addEventListener('click', () => this.cambiarLetra(Number(b.dataset.tam))));

    this.teclas = (e) => {
      if (!this.abierto) return;
      if (e.key === 'Escape') this.cerrar();
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); this.siguiente(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); this.anterior(); }
      else if (e.key === 'Home') this.irAPagina(0);
      else if (e.key === 'End' && this.doc) this.irAPagina(this.doc.total() - 1);
    };
    document.addEventListener('keydown', this.teclas);

    let inicio = null;
    this.escena.addEventListener('pointerdown', (e) => { inicio = { x: e.clientX, y: e.clientY, t: Date.now() }; });
    this.escena.addEventListener('pointerup', (e) => {
      if (!inicio) return;
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3 && Date.now() - inicio.t < 800) {
        dx < 0 ? this.siguiente() : this.anterior();
      }
      inicio = null;
    });

    let pendiente = null;
    this.alRedimensionar = () => {
      if (!this.abierto) return;
      clearTimeout(pendiente);
      pendiente = setTimeout(() => this.maquetar(true), 180);
    };
    window.addEventListener('resize', this.alRedimensionar);

    window.addEventListener('popstate', () => {
      if (this.abierto && !(history.state && history.state.lector)) this.cerrar(true);
    });
  }

  async abrir({ titulo, sub = '', tipo, url, urls, descarga }) {
    this.ultimoFoco = document.activeElement;
    this.abierto = true;
    this.pos = 0;
    this.$('[data-lector-titulo]').textContent = titulo;
    this.$('[data-lector-sub]').textContent = sub;
    const desc = this.$('[data-lector-descargar]');
    if (descarga) { desc.href = descarga; desc.hidden = false; } else { desc.removeAttribute('href'); desc.hidden = true; }
    this.$('[data-lector-tam]').hidden = !(tipo === 'texto' || tipo === 'markdown');
    this.escena.innerHTML = `<div class="lector__estado"><b>${this.t('abriendo')}</b></div>`;
    this.contador.textContent = '';
    this.raiz.classList.add('abierto');
    document.body.classList.add('bloqueado');
    history.pushState({ lector: true }, '', location.hash || '#/');
    this.$('[data-lector-cerrar]').focus({ preventScroll: true });

    const token = ++this.token;
    try {
      if (tipo === 'pdf') this.doc = new DocPDF(url);
      else if (tipo === 'imagenes') this.doc = new DocImagenes(urls);
      else this.doc = new DocTexto({ url, markdown: tipo === 'markdown', titulo, firma: this.firma });
      await this.doc.iniciar();
      if (token !== this.token) return;
      await this.maquetar();
    } catch (err) {
      if (token !== this.token) return;
      console.error(err);
      this.escena.innerHTML = '';
      const aviso = document.createElement('div');
      aviso.className = 'lector__estado';
      aviso.innerHTML = '<b></b><span></span>';
      aviso.querySelector('b').textContent = this.t('error_abrir');
      aviso.querySelector('span').textContent = this.t('error_abrir_det');
      this.escena.appendChild(aviso);
    }
  }

  cerrar(desdeHistorial = false) {
    if (!this.abierto) return;
    this.abierto = false;
    this.token++;
    if (this.animacion) this.animacion.finish();
    this.raiz.classList.remove('abierto');
    document.body.classList.remove('bloqueado');
    if (!desdeHistorial && history.state && history.state.lector) history.back();
    setTimeout(() => { if (!this.abierto) this.escena.innerHTML = ''; }, 300);
    if (this.ultimoFoco && this.ultimoFoco.focus) this.ultimoFoco.focus({ preventScroll: true });
  }

  // Calcula tamaño de página y si caben dos.
  async maquetar(conservar = false) {
    if (!this.doc) return;
    const fraccion = conservar && this.doc.total() > 1 ? this.primeraPagina() / (this.doc.total() - 1) : 0;
    const r = this.escena.getBoundingClientRect();
    const margen = r.width < 600 ? 14 : 36;
    const aw = r.width - margen * 2;
    const ah = r.height - margen * 2;
    let aspecto = this.doc.aspecto;
    const anchoDoble = Math.min(aw / 2, ah * aspecto);
    const anchoSimple = Math.min(aw, ah * aspecto);
    this.doble = r.width >= 860 && anchoDoble >= anchoSimple * 0.8;
    if (this.doc.texto && !this.doble) {
      aspecto = Math.max(0.56, Math.min(0.75, aw / ah));
    }
    this.anchoPag = Math.floor(this.doble ? Math.min(aw / 2, ah * aspecto) : Math.min(aw, ah * aspecto));
    this.altoPag = Math.floor(this.anchoPag / aspecto);

    await this.doc.preparar(this.anchoPag, this.altoPag);
    const total = this.doc.total();
    this.rango.max = String(Math.max(0, total - 1));
    if (conservar) this.pos = this.tirada(Math.round(fraccion * (total - 1)));
    this.pos = Math.min(this.pos, this.ultimaTirada());

    this.escena.innerHTML = '';
    this.libro = document.createElement('div');
    this.libro.className = `libro3d${this.doble ? '' : ' libro3d--simple'}`;
    this.libro.style.width = `${this.doble ? this.anchoPag * 2 : this.anchoPag}px`;
    this.libro.style.height = `${this.altoPag}px`;
    this.izq = this.hoja('izq');
    this.der = this.hoja('der');
    if (this.doble) this.libro.append(this.izq);
    this.libro.append(this.der);
    const lomo = document.createElement('div');
    lomo.className = 'libro3d__lomo';
    this.libro.append(lomo);
    const ant = document.createElement('button');
    ant.className = 'lector__zona lector__zona--ant';
    ant.setAttribute('aria-label', this.t('pag_ant'));
    ant.tabIndex = -1;
    ant.addEventListener('click', () => this.anterior());
    const sig = document.createElement('button');
    sig.className = 'lector__zona lector__zona--sig';
    sig.setAttribute('aria-label', this.t('pag_sig'));
    sig.tabIndex = -1;
    sig.addEventListener('click', () => this.siguiente());
    this.libro.append(ant, sig);
    this.escena.append(this.libro);
    await this.pintar();
  }

  hoja(lado) {
    const h = document.createElement('div');
    h.className = `hoja hoja--${lado}`;
    h.style.width = `${this.anchoPag}px`;
    h.style.height = `${this.altoPag}px`;
    return h;
  }

  // Índices de página de una tirada (doble: [izq, der]; simple: [pág]).
  paginasDe(t) { return this.doble ? [2 * t - 1, 2 * t] : [t]; }
  tirada(pagina) { return this.doble ? Math.floor((pagina + 1) / 2) : pagina; }
  ultimaTirada() { return this.tirada(this.doc.total() - 1); }
  primeraPagina() { const [a, b] = this.paginasDe(this.pos); return this.doble ? (a >= 0 ? a : b) : a; }

  async llenar(hoja, i) {
    hoja.innerHTML = '';
    const existe = i >= 0 && i < this.doc.total();
    hoja.classList.toggle('hoja--vacia', !existe);
    if (existe) hoja.appendChild(await this.doc.pagina(i, this.anchoPag));
  }

  async pintar() {
    const token = this.token;
    const [a, b] = this.paginasDe(this.pos);
    if (this.doble) await Promise.all([this.llenar(this.izq, a), this.llenar(this.der, b)]);
    else await this.llenar(this.der, a);
    if (token !== this.token) return;
    this.actualizarControles();
    const ultima = this.doble ? b : a;
    this.doc.precargar(ultima + 1, this.anchoPag);
    this.doc.precargar(ultima + 2, this.anchoPag);
  }

  actualizarControles() {
    const total = this.doc.total();
    const [a, b] = this.paginasDe(this.pos);
    let texto;
    if (!this.doble) texto = `${a + 1} / ${total}`;
    else if (a < 0) texto = `1 / ${total}`;
    else if (b >= total) texto = `${a + 1} / ${total}`;
    else texto = `${a + 1}–${b + 1} / ${total}`;
    this.contador.textContent = texto;
    this.rango.value = String(this.primeraPagina());
    this.$('[data-lector-ant]').disabled = this.pos <= 0;
    this.$('[data-lector-sig]').disabled = this.pos >= this.ultimaTirada();
  }

  async siguiente() { if (this.doc && this.pos < this.ultimaTirada()) await this.pasar(1); }
  async anterior() { if (this.doc && this.pos > 0) await this.pasar(-1); }

  async irAPagina(pagina, animar = true) {
    if (!this.doc) return;
    const t = this.tirada(Math.max(0, Math.min(pagina, this.doc.total() - 1)));
    if (t === this.pos) return;
    if (animar && Math.abs(t - this.pos) === 1) return this.pasar(t - this.pos);
    if (this.animacion) this.animacion.finish();
    this.pos = t;
    await this.pintar();
  }

  async pasar(dir) {
    if (this.animacion) { this.animacion.finish(); await esperar(0); }
    const desde = this.pos;
    const hasta = desde + dir;
    if (hasta < 0 || hasta > this.ultimaTirada()) return;
    this.pos = hasta;
    if (!this.doble) return this.deslizar(dir);
    if (reduceMotion()) return this.pintar();

    const ancho = this.anchoPag;
    const giro = document.createElement('div');
    giro.className = 'giro';
    giro.style.width = `${ancho}px`;
    giro.style.height = `${this.altoPag}px`;
    const frente = document.createElement('div');
    frente.className = 'giro__cara giro__cara--frente';
    const dorso = document.createElement('div');
    dorso.className = 'giro__cara giro__cara--dorso';
    giro.append(frente, dorso);
    const pagina = (i) => (i >= 0 && i < this.doc.total() ? this.doc.pagina(i, ancho) : Promise.resolve(null));

    let caraFrente, caraDorso, debajo;
    if (dir > 0) {
      // La hoja derecha gira hacia la izquierda.
      [caraFrente, caraDorso, debajo] = await Promise.all([pagina(2 * desde), pagina(2 * desde + 1), pagina(2 * desde + 2)]);
    } else {
      // La hoja izquierda vuelve hacia la derecha.
      [caraFrente, caraDorso, debajo] = await Promise.all([pagina(2 * desde - 2), pagina(2 * desde - 1), pagina(2 * desde - 3)]);
    }
    if (this.pos !== hasta || !this.abierto) return;
    if (caraFrente) frente.append(caraFrente);
    if (caraDorso) dorso.append(caraDorso);
    const colocar = (hoja, nodo) => {
      hoja.innerHTML = '';
      hoja.classList.toggle('hoja--vacia', !nodo);
      if (nodo) hoja.appendChild(nodo);
    };
    colocar(dir > 0 ? this.der : this.izq, debajo);
    this.libro.appendChild(giro);
    this.actualizarControles();

    const keyframes = dir > 0
      ? [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }]
      : [{ transform: 'rotateY(-180deg)' }, { transform: 'rotateY(0deg)' }];
    const anim = giro.animate(keyframes, { duration: 720, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' });
    this.animacion = anim;
    await anim.finished.catch(() => {});
    if (this.animacion === anim) this.animacion = null;
    if (dir > 0) colocar(this.izq, dorso.firstChild);
    else colocar(this.der, frente.firstChild);
    giro.remove();
    const ultima = 2 * this.pos;
    this.doc.precargar(ultima + 1, ancho);
    this.doc.precargar(ultima + 2, ancho);
  }

  async deslizar(dir) {
    const nueva = await this.doc.pagina(this.pos, this.anchoPag);
    if (!this.abierto) return;
    const vieja = this.der.firstChild;
    if (reduceMotion() || !vieja) {
      this.der.innerHTML = '';
      this.der.appendChild(nueva);
      this.actualizarControles();
      return;
    }
    nueva.style.position = 'absolute';
    nueva.style.inset = '0';
    this.der.appendChild(nueva);
    this.actualizarControles();
    const opciones = { duration: 280, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' };
    const salida = vieja.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${-dir * 30}%)`, opacity: 0 }], opciones);
    nueva.animate([{ transform: `translateX(${dir * 30}%)`, opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], opciones);
    this.animacion = salida;
    await salida.finished.catch(() => {});
    if (this.animacion === salida) this.animacion = null;
    if (vieja.parentNode) vieja.remove();
    nueva.style.position = '';
    nueva.style.inset = '';
    this.doc.precargar(this.pos + 1, this.anchoPag);
  }

  async cambiarLetra(paso) {
    if (!this.doc || !this.doc.texto) return;
    const nueva = Math.round((this.doc.escala + paso * 0.1) * 10) / 10;
    if (nueva < 0.8 || nueva > 1.6) return;
    this.doc.escala = nueva;
    await this.maquetar(true);
  }
}
