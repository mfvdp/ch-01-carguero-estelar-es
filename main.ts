// Programa principal: arranque, bucle del juego y botones.
// Programado por CALLIOPE HACKER para Calliope mini 3 + GameKit.

let direccionRepeticionMenu = 0
let repeticionMenuMs = 0

function actualizarRepeticionMenu(): void {
    if (escenaActiva == NumeroEscena.Vuelo || escenaActiva == NumeroEscena.Intro || entradaBloqueada) {
        direccionRepeticionMenu = 0
        return
    }
    let direccion = 0
    if (controller.up.isPressed()) direccion = 1
    else if (controller.down.isPressed()) direccion = 2
    else if (controller.left.isPressed()) direccion = 3
    else if (controller.right.isPressed()) direccion = 4
    if (direccion == 0) {
        direccionRepeticionMenu = 0
        return
    }
    let ahora = game.runtime()
    if (direccion != direccionRepeticionMenu) {
        direccionRepeticionMenu = direccion
        repeticionMenuMs = ahora + 350
        return
    }
    if (ahora < repeticionMenuMs) return
    if (direccion == 1) gestionarDireccion(0, -1)
    else if (direccion == 2) gestionarDireccion(0, 1)
    else if (direccion == 3) gestionarDireccion(-1, 0)
    else gestionarDireccion(1, 0)
    repeticionMenuMs = ahora + 120
}

scene.setBackgroundColor(COLOR_FONDO)
prepararSonido()
cargarJuego()
if (introDebeReproducirseSola()) iniciarIntroConfigurada()
else ponerEscena(NumeroEscena.Titulo)

game.onPaint(function () {
    anotarImagenPantalla()
    dibujarEscenaActual()
})

game.onUpdate(function () {
    if (entradaBloqueada && todosBotonesSoltados()) entradaBloqueada = false
    actualizarIntro()
    actualizarVuelo()
    actualizarAmbiente()
    actualizarRepeticionMenu()
    actualizarDiagnosticoPantalla()
})

controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    gestionarDireccion(0, -1)
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    gestionarDireccion(0, 1)
})

controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    gestionarDireccion(-1, 0)
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    gestionarDireccion(1, 0)
})

controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (escenaActiva == NumeroEscena.Vuelo) dispararArma()
    else gestionarA()
})

controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (escenaActiva == NumeroEscena.Vuelo) secundariaVuelo()
    else gestionarB()
})
