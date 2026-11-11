# Parte técnica: Carguero estelar

Aquí encuentras en pocas palabras cómo está organizado el código y cómo se construye. La bienvenida y las primeras ideas
para cambiar el juego están en `README.md`.

## Organización

Es un proyecto para MakeCode Arcade, escrito en TypeScript. `pxt.json` da el nombre del proyecto `carguero-estelar` y
la lista de todos los archivos, en el orden en que MakeCode los lee. `mkc.json` dice para qué aparato se construye: el
Calliope mini 3 con GameKit (variante «n3»).

Los archivos del juego:

- `textos.ts`: Este archivo saca los textos del juego de un catálogo mediante números fijos (t(número)).
- `datos.ts`: Los datos fijos del juego: mundos, mercancías, naves, misiones y la aventura.
- `modelo.ts`: Las reglas y el estado del juego: mercado, misiones, aventura y logros.
- `guardar.ts`: Guardar y cargar la partida: dos ranuras automáticas y una ranura para guardar a mano.
- `pantallas.ts`: Todas las pantallas y menús, y lo que hacen los botones en cada uno.
- `intro.ts`: Secuencia de arranque de cine.
- `vuelo.ts`: El vuelo entre dos mundos: fases, encuentros, combates, rescate y atraque.
- `sonido.ts`: Diseño central del sonido para el altavoz del Calliope mini 3 y del GameKit.
- `main.ts`: Programa principal: arranque, bucle del juego y botones.

## Cómo funciona el juego

1. Al arrancar, `textos.ts` desempaqueta el catálogo de textos. Después `main.ts` prepara el sonido (`prepararSonido`) y
   carga con `cargarJuego` la partida guardada válida más reciente.
2. `iniciarIntroConfigurada` pone el intro: la historia, la tarjeta del estudio del Calliope Hacker y el título. A o B
   lo salta. Después `ponerEscena` abre la pantalla de título.
3. En cada imagen, `dibujarEscenaActual` dibuja la pantalla activa (`NumeroEscena`): título, hangar, mercado, astillero,
   misiones, mapa estelar, estado o vuelo.
4. En cada paso del juego, `game.onUpdate` llama a `actualizarIntro`, `actualizarVuelo`, `actualizarAmbiente` y
   `actualizarRepeticionMenu`.
5. Los botones llegan a `gestionarDireccion`, `gestionarA` y `gestionarB`. Lo que hacen depende de la pantalla activa;
   en vuelo, A dispara el arma elegida y B la cambia.

Hay 24 mundos a los que puedes volar (y dos escondidos) y 12 clases de mercancías. La aventura tiene 6 misiones. Los
datos fijos (mundos, mercancías, naves, misiones) están en `datos.ts`; las reglas y el estado del juego, en `modelo.ts`.

## Textos y sonido

Todos los textos están empaquetados en un catálogo en `textos.ts`. El juego pide un texto por su número, por ejemplo
`Textos.t(247)` para la palabra ASTILLERO. Para saber qué palabra va con un número, lo más rápido es el simulador. La
música y los sonidos los hace `sonido.ts` sin la gran biblioteca de música, para ahorrar memoria flash.

## Guardar

`guardar.ts` escribe la partida en los ajustes del Calliope: dos ranuras automáticas y una ranura para guardar a mano,
cada una con suma de control. Los ajustes pertenecen a este nombre de proyecto, así que otro juego nunca los lee. Si
cargas otro programa, MakeCode borra la partida guardada en el siguiente arranque.

## Construir el juego

- **En el navegador:** abre arcade.makecode.com, elige «Importar» y abre el archivo del juego `carguero-estelar.hex`.
  Todo el código está en el archivo del juego. El simulador enseña el juego enseguida.
- **En el ordenador:** con la herramienta de línea de órdenes de MakeCode (paquete npm `makecode`), ejecuta `makecode
  build` en esta carpeta. El archivo del juego para el aparato queda después en `built/n3/binary.hex`.

## En el aparato

Conecta el Calliope mini 3 al ordenador con el cable USB. Aparece como una unidad. Arrastra el archivo del juego
(`.hex`) a esa unidad; el juego arranca solo después. La pantalla del GameKit tiene 160 × 120 píxeles y 16 colores. El
juego es grande y usa casi toda la memoria flash del Calliope; los cambios con mucho código nuevo pueden hacer que el
archivo del juego sea demasiado grande.

Este juego existe también en alemán, inglés y francés. Las cuatro versiones salen del mismo proyecto de partida.