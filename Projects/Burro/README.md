# 🫏 Burro

Juego de fichas por turnos para el navegador. Juegas contra rivales controlados por la computadora siguiendo el reglamento oficial de Burro.

## Cómo jugar
1. Elige cuántos rivales quieres (0 a 11), la dificultad y la velocidad.
2. En tu turno, haz clic en tu **pila visible** o en tu **reserva** para levantar una ficha.
3. Haz clic en el destino: una **pila central** (o «nueva pila» para un 1), la **visible de un rival**, o **tu propia visible** para terminar el turno.
4. Si ves que un rival omite una jugada obligatoria, pulsa **¡BURRO!** (o la tecla **B**). Si no hay infracción, el Burro eres tú.

La partida termina cuando queda un solo jugador con fichas: ese es el Burro.

## Reglas incluidas
- Prioridad de la ficha visible sobre la reserva.
- Orden de descarga: centro → rival → pila propia.
- Pilas centrales del 1 al 15, una nueva por cada 1.
- Reciclado de la pila visible cuando se acaba la reserva.
- Penalización: una ficha boca abajo de cada jugador en juego, la ficha mal jugada vuelve y se pierde el turno.
- Plazos: durante la jugada cualquiera puede cantar; el siguiente jugador tiene 5 segundos extra.
- Acusación falsa y ganador que canta «Burro» son penalizados (el ganador vuelve a jugar).

Las reglas de conducta entre personas (ayudar, distraer, entregar fichas de más) no aplican contra la computadora.

## Publicar en GitHub Pages
1. Sube `index.html` y este `README.md` a un repositorio.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. El juego quedará en `https://<tu-usuario>.github.io/<repositorio>/`.

Es un único archivo HTML, sin dependencias ni servidor.
