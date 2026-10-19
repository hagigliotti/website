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

| Elemento | Qué es | Señal que deja en las casillas vecinas |
|---|---|---|
| **Pozo** | Si el cazador cae, muere. | **Viento** |
| **Wumpus** | Un bicho horrible y hambriento. Si el cazador entra en su casilla, se lo come. | **Olor** |
| **Oro** | El tesoro que hay que llevarse. | **Resplandor** |

Las señales aparecen solo arriba, abajo, a la izquierda y a la derecha del peligro, nunca en diagonal.

- **Viento:** hay un pozo en alguna casilla vecina.
- **Olor:** el Wumpus está en alguna casilla vecina.
- **Resplandor:** el oro está en alguna casilla vecina.

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

| Nivel | Cueva | Pozos | Wumpus | Qué ve el cazador | Señales en una casilla | El Wumpus |
|---|---|---|---|---|---|---|
| Muy fácil | 4×4 o 5×5 | 1 | 1 | Toda la cueva | Una sola | Quieto |
| Fácil | 5×5 o 6×6 | 2 o 3 | 1 | Su casilla y las señales de las 4 vecinas | Una sola | Quieto |
| Intermedio | 6×6 | 3 o 4 | 1 | Solo su casilla | Hasta 2 | Se mueve y puede caer en un pozo |
| Difícil | 5×5 o 7×7 | 4 a 6 | 2 | Solo su casilla | Hasta 3 | Se mueve y esquiva los pozos |
| Muy difícil | 7×7 u 8×8 | 7 a 9 | 2 o 3 | Solo su casilla | Hasta 3 | Se mueve y esquiva los pozos |

## 7. Peligro por quedarse quieto (Muy difícil)

En el nivel Muy difícil, quedarse mucho tiempo en una casilla con una señal es peligroso:

- **10 segundos con olor:** el cazador se duerme y el Wumpus lo encuentra.
- **8 segundos con viento:** el viento lo arrastra al pozo.
- **6 segundos con resplandor:** queda ciego, la antorcha se apaga y tiene que salir guiándose solo por lo que siente.

El tiempo vuelve a cero cada vez que el cazador se mueve.

## 8. Notas

En los niveles Muy fácil y Fácil se pueden marcar casillas, como en el buscaminas: **posible pozo**, **posible Wumpus**, **posible oro** o **segura**.

## 9. Controles

| Acción | Teclado | Pantalla |
|---|---|---|
| Moverse | Flechas o W A S D | Botones de dirección |
| Disparar flecha | F y después una dirección | «Disparar flecha» y después una dirección |
| Usar la espada | E y después una dirección | «Usar espada» y después una dirección |
| Agarrar el oro | G | «Agarrar oro» |
| Salir de la cueva | X (en la entrada) | «Salir de la cueva» |
| Cancelar | Esc | — |
