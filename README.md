# Hernando Gigliotti · sitio web

Sitio publicado en **https://hagigliotti.github.io/website/**

Se arma solo a partir de las carpetas `Projects`, `Trips` y `Works`. Cada vez que subís algo, GitHub regenera el sitio en 1 o 2 minutos. Todos los textos de la interfaz aparecen en español, inglés, francés, alemán, portugués o italiano según el idioma del navegador (y se puede cambiar desde el menú).

## Activar la publicación (una sola vez)

1. Subí todo este contenido al repositorio (Add file → Upload files).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. En la pestaña **Actions** vas a ver "Publicar sitio" en verde cuando esté listo.

## Cada carpeta = un proyecto, viaje o trabajo

```
Projects/
  Tienda online/
    portada.jpg      ← la carátula (si no hay "portada", se usa la primera imagen)
    Info.txt         ← título, enlace y descripción
Trips/
  Barcelona/
    Info.txt         ← descripción de la ciudad
    Fotos.txt        ← descripción de cada foto
    foto1.jpg … foto10.jpg
Works/
  BilancioSociale/
    Info.txt
    portada.jpg
    informe.pdf      ← los PDF y TXT se abren como libro
```

Sí: cada carpeta lleva un **Info.txt**. Las fotos de los viajes llevan además un **Fotos.txt**.

### Info.txt

```
Título: Barcelona
Fecha: 2024
Enlace: https://...

Descripción en español.

[en]
Description in English.

[it]
Descrizione in italiano.
```

- Las primeras líneas (`Título:`, `Fecha:`, `Enlace:`, `Portada:`) son opcionales.
- El texto sin marca vale para todos los idiomas. Si agregás bloques `[en]`, `[fr]`, `[de]`, `[pt]`, `[it]`, cada visitante ve el suyo. También podés poner `Título:` dentro de un bloque.
- Si no ponés `Título:`, se usa el nombre de la carpeta (`SanMarino` se muestra como "San Marino").

### Fotos.txt (álbumes)

```
foto1.jpg: Vista desde el Montjuïc al atardecer.
foto2.jpg: La Sagrada Familia.

[en]
foto1.jpg: View from Montjuïc at sunset.
```

El nombre tiene que coincidir con el archivo de la foto. Al tocar la foto, la descripción aparece debajo.

## Orden (FIFO)

Los proyectos, viajes y trabajos se muestran **del más nuevo al más viejo**, según cuándo subiste cada carpeta a GitHub. Si una carpeta tiene `Fecha:` en su Info.txt, se usa esa fecha.

`Projects/Orden.txt` fija el orden de las carpetas que ya están (subidas todas juntas). Las carpetas nuevas que no figuran ahí aparecen automáticamente primero.

## Experiencia y estudios

Editá `cv/cv.json` con los datos de LinkedIn. Si subís el PDF de LinkedIn (Más → Guardar en PDF) como `cv/cv.pdf`, aparece el botón para leerlo y descargarlo.

## Formulario de contacto (sin mostrar tu email)

1. Entrá a **https://web3forms.com**, escribí tu email y pedí la "Access Key" (gratis, 250 mensajes por mes).
2. Pegá la clave en `config.json` (ya está cargada):
   ```json
   "contacto": { "servicio": "web3forms", "clave": "TU-CLAVE" }
   ```
Los mensajes te llegan al email, que nunca aparece en el sitio. La clave no revela tu email.

## Fotos

Comprimí las fotos antes de subirlas: unos 2000 px de lado y menos de 1 MB cada una. GitHub admite hasta 100 archivos por subida desde la web.

## Probar en tu computadora

```bash
node scripts/build-manifest.mjs
python3 -m http.server
```
