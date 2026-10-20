# Reglamento de La cueva del Wumpus

## 1. Objetivo

El cazador está parado en la entrada de una cueva oscura. Tiene que entrar, encontrar el oro y volver a la entrada para salir con vida.

Gana quien sale de la cueva con el oro. Se puede salir sin el oro, pero en ese caso no se gana la partida.

## 2. La cueva

- La cueva es una cuadrícula de casillas. Su tamaño depende del nivel, pero una cueva chica no significa que el nivel sea fácil: lo que cuenta son los obstáculos.
- Cada partida genera una cueva nueva al azar.
- La entrada y las casillas que la rodean siempre son seguras.
- Siempre existe un camino sin pozos desde la entrada hasta el oro.

## 3. Lo que hay dentro

Cada peligro deja una señal en las casillas que lo tocan: arriba, abajo, a la izquierda y a la derecha, nunca en diagonal.

### Pozo

Si el cazador cae en un pozo, muere. Alrededor se siente **Viento**.

### Wumpus

Un bicho horrible y hambriento. Si el cazador entra en su casilla, se lo come. Alrededor se siente **Olor**.

### Oro

El tesoro que hay que llevarse. Alrededor se ve un **Resplandor**.

Una **casilla segura** es la que no tiene pozo, Wumpus, viento ni olor.

## 4. El cazador

- Se mueve **un casillero por vez**, solo arriba, abajo, a la izquierda o a la derecha. Nunca en diagonal.
- Si intenta salir de la cueva por un costado, choca contra la pared.
- Lleva una **antorcha**, un **arco con 3 flechas** y una **espada**.

### Antorcha

La antorcha es lo que le permite ver la casilla donde está parado. Si se apaga, el cazador ya no ve nada y solo recibe mensajes de lo que siente («sentís viento», «huele muy mal»).

### Flechas

- Hay solo 3.
- Se disparan en una dirección y viajan en línea recta hasta la pared.
- Se puede disparar desde lejos sin saber si el Wumpus está ahí.
- Si la flecha alcanza a un Wumpus, se oye un grito y el Wumpus muere. Si no, la flecha se pierde.

### Espada

- Golpea solo la casilla de al lado, en la dirección elegida.
- En los niveles Difícil y Muy difícil acierta la mitad de las veces. Si falla, el Wumpus se come al cazador.

## 5. El Wumpus

- En los niveles fáciles el Wumpus no se mueve.
- En los niveles más difíciles se mueve por la cueva.
- Nunca entra en la casilla del cazador sin avisar: antes de que pueda ser peligroso, el cazador siente olor.
- En el nivel Intermedio puede caer en un pozo y morir. En Difícil y Muy difícil esquiva los pozos.
- El resplandor no lo afecta: el Wumpus nunca queda ciego.

## 6. Niveles

### Muy fácil

- Cueva de 4×4 o 5×5, con 1 pozo y 1 Wumpus.
- El cazador ve toda la cueva.
- Cada casilla tiene una sola señal. El Wumpus no se mueve.

### Fácil

- Cueva de 5×5 o 6×6, con 2 o 3 pozos y 1 Wumpus.
- El cazador ve su casilla y las señales de las 4 casillas vecinas.
- Cada casilla tiene una sola señal. El Wumpus no se mueve.

### Intermedio

- Cueva de 6×6, con 3 o 4 pozos y 1 Wumpus.
- El cazador ve solo su casilla.
- Una casilla puede tener hasta 2 señales. El Wumpus se mueve y puede caer en un pozo.

### Difícil

- Cueva de 5×5 o 7×7, con 4 a 6 pozos y 2 Wumpus.
- El cazador ve solo su casilla.
- Una casilla puede tener hasta 3 señales. El Wumpus se mueve y esquiva los pozos.

### Muy difícil

- Cueva de 7×7 u 8×8, con 7 a 9 pozos y 2 o 3 Wumpus.
- El cazador ve solo su casilla.
- Una casilla puede tener hasta 3 señales. El Wumpus se mueve y esquiva los pozos.
- Quedarse quieto es peligroso (ver el punto 7).

### Oscuridad total

- Cueva de 7×7 u 8×8, con 6 a 9 pozos y 2 o 3 Wumpus.
- No hay antorcha: el cazador no ve la cueva, ni su propia casilla, ni a sí mismo.
- Una casilla puede tener hasta 3 señales. El Wumpus se mueve y esquiva los pozos.
- Quedarse quieto es peligroso (ver el punto 7).

Es el nivel más difícil. Se juega solo por percepción, con los mensajes de lo que siente el cazador:

- hacia dónde dio cada paso;
- si siente viento, olor o resplandor;
- si choca contra la pared;
- si toca el oro con la mano;
- si siente el aire fresco de la entrada.

Empieza en la entrada, abajo a la izquierda. Al terminar la partida se muestra la cueva entera.

## 7. Peligro por quedarse quieto

En los niveles Muy difícil y Oscuridad total, quedarse mucho tiempo en una casilla con una señal es peligroso:

- **10 segundos con olor:** el cazador se duerme y el Wumpus lo encuentra.
- **8 segundos con viento:** el viento lo arrastra al pozo.
- **6 segundos con resplandor:** queda ciego, la antorcha se apaga y tiene que salir guiándose solo por lo que siente. En Oscuridad total no pasa, porque ya no ve nada.

El tiempo vuelve a cero cada vez que el cazador se mueve.

## 8. Notas

En los niveles Muy fácil y Fácil se pueden marcar casillas, como en el buscaminas: **posible pozo**, **posible Wumpus**, **posible oro** o **segura**.

## 9. Controles

- **Moverse:** flechas o W A S D en el teclado, o los botones de dirección.
- **Disparar una flecha:** F, o el botón «Disparar flecha», y después una dirección.
- **Usar la espada:** E, o el botón «Usar espada», y después una dirección.
- **Agarrar el oro:** G, o el botón «Agarrar oro».
- **Salir de la cueva:** X, o el botón «Salir de la cueva». Solo funciona en la entrada.
- **Cancelar un disparo o un golpe:** Esc.
