# Carguero estelar

¡Hola! Esto es **Carguero estelar**, un juego de **Calliope Hacker** para el **Calliope mini 3 con GameKit**.

Empiezas con una nave pequeña y 500 créditos en la estación LUMA. Vuela de mundo en mundo, compra mercancías baratas y
véndelas más caras en otro sitio. Acepta misiones: entregas, rescates y caza de piratas. Con las ganancias mejoras tu
nave en el astillero, y la historia de la Unión Estelar te lleva por seis capítulos. Hay 24 mundos por descubrir. Por
cierto: en el hangar, el Calliope Hacker está junto al puesto de mando.

## Cómo se juega

- **En los menús:** cruceta = elegir, A = OK, B = volver
- **En el intro:** A o B lo salta
- **En la primera entrega:** B en el hangar pregunta si quieres saltar la práctica
- **En la cabina:** cruceta = mover la mira, A = disparar el arma elegida (láser, misil, mina)
- **En la cabina, cerca de una cápsula de rescate:** mantener A la atrae con el rayo tractor
- **En la cabina, pulsar B un momento:** cambiar de arma
- **En la cabina, mantener B:** esquivar; si lo mantienes mucho rato, huyes (cuesta 1 de combustible)

## Ahora te toca construir a ti

Todo el código fuente está dentro de este archivo del juego. Ábrelo en MakeCode Arcade (arcade.makecode.com,
«Importar»). Si el editor pregunta por el hardware al descargar, elige «Calliope GameKit Shield». Cambia un número, abre
el simulador y mira qué pasa:

- **Más dinero al empezar:** en `modelo.ts`, función `iniciarPartidaNueva`, está la línea `creditos = 500`. Con `5000`
  compras varias mejoras en el astillero desde el primer momento.
- **Nombres propios para los mundos:** en `datos.ts`, `NOMBRES_MUNDO` guarda los nombres de los mundos, por ejemplo
  `"LUMA"`. Ponles los tuyos, pero cortos (casi todos los del juego tienen cuatro letras); si son largos, quizá no
  quepan en la línea.
- **Un láser más fuerte:** en `modelo.ts`, función `danoLaser`, está `1 + mejoras[MEJORA_LASER]`. Con `3 + ...` tu láser
  pega tres veces más fuerte desde el principio.

La explicación del código fuente para niños, padres y docentes está en calliope-hacker.de.