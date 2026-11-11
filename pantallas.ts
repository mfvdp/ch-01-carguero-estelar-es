// Todas las pantallas y menús, y lo que hacen los botones en cada uno.
const COLOR_FONDO = 15
const COLOR_TEXTO = 1
const COLOR_ROJO = 2
const COLOR_NARANJA = 4
const COLOR_AMARILLO = 5
const COLOR_VERDE = 7
const COLOR_AZUL = 8
const COLOR_CIAN = 9
const COLOR_MORADO = 10
const COLOR_METAL = 11
const COLOR_SOMBRA = 12
const COLOR_TENUE = 13
const COLOR_OXIDO = 14

const ELEMENTOS_HANGAR = hex`f630f7f8f9fafbfcfdfe`
const CANTIDAD_ELEMENTOS_TITULO = 10
const POSICION_NAVE_ASTILLERO = CANTIDAD_MEJORAS + 2
const POSICION_NOMBRE_ASTILLERO = POSICION_NAVE_ASTILLERO + 1
const POSICION_PINTURA_ASTILLERO = POSICION_NOMBRE_ASTILLERO + 1
const POSICION_MISIL_ASTILLERO = POSICION_PINTURA_ASTILLERO + 1
const POSICION_MINA_ASTILLERO = POSICION_MISIL_ASTILLERO + 1
const CANTIDAD_ELEMENTOS_ASTILLERO = POSICION_MINA_ASTILLERO + 1
const ESTADO_CANTIDAD_PAGINAS = 7
const ESTADO_NAVE = 0
const ESTADO_FACCIONES = 1
const ESTADO_DIARIO = 2
const ESTADO_LOGROS = 3
const ESTADO_OPCIONES = 4
const ESTADO_HARDWARE = 5
const ESTADO_DESARROLLADOR = 6
let mundoCursorMapa = 0
let numeroInstaladoAstillero = -1
let vistaRolAstillero = RolNave.Mercader
let textoRespuestaMercado = ""
let colorRespuestaMercado = COLOR_TENUE
let respuestaMercadoHastaMs = 0
let mercadoNegro = false
let negociacionMision = 0
let paginaEstado = ESTADO_NAVE
let cursorEstado = 0
let cursorLogro = 0
let objetivoRutaUltima = -1
let imagenesPantalla = 0
let fpsPantalla = 0
let ventanaImagenPantallaMs = 0
let bytesLibresUltimoPantalla = 0
let bytesLibresMinPantalla = 0
let escenaVueltaEstado = NumeroEscena.Hangar
let confirmarPartidaNuevaPlus = false
let objetivoRutaAnteriorMapa = 0
let bHardwareProbado = false
let claveDibujoAviso = ""
let revelacionAvisoIniciadaMs = 0

function anotarImagenPantalla(): void {
    imagenesPantalla++
}

function actualizarDiagnosticoPantalla(): void {
    let ahora = game.runtime()
    if (ventanaImagenPantallaMs == 0) ventanaImagenPantallaMs = ahora
    if (ahora - ventanaImagenPantallaMs < 1000) return
    fpsPantalla = Math.idiv(imagenesPantalla * 1000, Math.max(1, ahora - ventanaImagenPantallaMs))
    imagenesPantalla = 0
    ventanaImagenPantallaMs = ahora
    if (modoDesarrollador) {
        // gcStats() devuelve null en el simulador; entonces la página conserva los últimos valores.
        let estadisticas = control.gcStats()
        if (estadisticas) {
            bytesLibresUltimoPantalla = estadisticas.lastFreeBytes
            bytesLibresMinPantalla = estadisticas.minFreeBytes
        }
    }
}

function textoSiNo(valor: number): string {
    return valor != 0 ? Textos.t(255) : Textos.t(201)
}

function colorAcentoEstacion(): number {
    let colores = [COLOR_VERDE, COLOR_NARANJA, COLOR_CIAN, COLOR_MORADO, COLOR_AMARILLO, COLOR_METAL]
    return colores[ECONOMIA_MUNDO[mundoActual] % colores.length]
}

function colorOscuroEstacion(): number {
    let colores = [COLOR_SOMBRA, COLOR_OXIDO, COLOR_AZUL, COLOR_SOMBRA, COLOR_OXIDO, COLOR_AZUL]
    return colores[ECONOMIA_MUNDO[mundoActual] % colores.length]
}

function colorPinturaNave(): number {
    let colores = [COLOR_AZUL, COLOR_ROJO, COLOR_VERDE, COLOR_AMARILLO, COLOR_MORADO, COLOR_METAL]
    return colores[pinturaNave[rolNave] % colores.length]
}

function cantidadMundosVisitadosPantalla(): number {
    let cantidad = 0
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (mundoVisitado(i)) cantidad++
    return cantidad
}

function caracteresVisiblesAviso(): number {
    let retraso = velocidadTexto == 0 ? 85 : (velocidadTexto == 2 ? 20 : 45)
    return Math.idiv(Math.max(0, game.runtime() - revelacionAvisoIniciadaMs), retraso)
}

function parteLineaAviso(texto: string, inicio: number): string {
    let cantidad = Math.clamp(0, texto.length, caracteresVisiblesAviso() - inicio)
    return texto.substr(0, cantidad)
}

function imprimirDerecha(texto: string, derecha: number, y: number, color: number): void {
    imprimirTextoJuego(texto, derecha - texto.length * 6, y, color)
}

function dibujarCabecera(titulo: string): void {
    screen.fill(COLOR_FONDO)
    screen.fillRect(0, 0, 160, 13, contrasteAlto ? COLOR_FONDO : COLOR_AZUL)
    if (contrasteAlto) screen.drawRect(0, 0, 160, 13, COLOR_TEXTO)
    imprimirTextoJuego(titulo, 3, 3, contrasteAlto ? COLOR_AMARILLO : COLOR_TEXTO)
    imprimirDerecha(Textos.t(256) + creditos, 157, 3, COLOR_AMARILLO)
}

function dibujarPie(izquierda: string, derecha: string): void {
    screen.fillRect(0, 108, 160, 12, contrasteAlto ? COLOR_FONDO : COLOR_AZUL)
    if (contrasteAlto) screen.drawRect(0, 108, 160, 12, COLOR_TEXTO)
    imprimirTextoJuego(izquierda, 3, 111, contrasteAlto ? COLOR_AMARILLO : COLOR_TEXTO)
    imprimirDerecha(derecha, 157, 111, contrasteAlto ? COLOR_AMARILLO : COLOR_TEXTO)
}

function dibujarEleccion(y: number, alto: number): void {
    screen.fillRect(2, y - 1, 156, alto, contrasteAlto ? COLOR_AZUL : COLOR_MORADO)
}

function textoCortoPantalla(texto: string, caracteresMax: number): string {
    if (texto.length <= caracteresMax) return texto
    // Los rótulos largos se leen enteros: se espera un momento en cada extremo y, entre medias, el texto se desplaza.
    let distancia = texto.length - caracteresMax
    let fase = Math.idiv(game.runtime(), 220) % (distancia * 2 + 12)
    let inicio = fase < 6 ? 0
        : (fase < distancia + 6 ? fase - 6 : (fase < distancia + 12 ? distancia : distancia * 2 + 12 - fase))
    return texto.substr(inicio, caracteresMax)
}

function puedeCambiarModoTitulo(): boolean {
    return !tienePartida || etapaAventura >= CANTIDAD_MISIONES_AVENTURA
}

function modoJuegoDesdePosicion(posicion: number): ModoJuego {
    if (posicion == 1) return ModoJuego.Veterano
    if (posicion == 2) return ModoJuego.Hierro
    return ModoJuego.Normal
}

function cambiarModoTitulo(diferencia: number): void {
    let siguiente = (modoJuego + diferencia) % 3
    if (siguiente < 0) siguiente += 3
    modoJuego = modoJuegoDesdePosicion(siguiente)
    if (tienePartida) escribirPartida()
}

function textoElementoTitulo(posicion: number): string {
    if (posicion == 0) return tienePartida ? Textos.t(257) : Textos.t(254)
    if (posicion == 1) return Textos.t(258) + nombreModoIntro()
    if (posicion == 2) return duracionIntroSegundos() > 0
        ? Textos.t(259) + duracionIntroSegundos() + Textos.t(260) : Textos.t(261)
    if (posicion == 3) return Textos.t(262) + nombreEscalonSonido()
    if (posicion == 4) return Textos.t(263) + nombreDensidadEfecto()
    if (posicion == 5) return Textos.t(264) + nombreModoJuego(modoJuego)
    if (posicion == 6) return Textos.t(265)
    if (posicion == 7) return Textos.t(266)
    if (posicion == 8) return Textos.t(267)
    return Textos.t(268)
}

// Nombre del juego en la pantalla de título y en el intro: línea 1 y línea 2, separadas por "|".
const TITULO_JUEGO = "CARGUERO|ESTELAR" // Título en dos líneas

// Dibuja el nombre del juego centrado: la línea 1 en y y la línea 2 hueco píxeles más abajo.
function dibujarTituloJuego(y: number, hueco: number): void {
    let corte = TITULO_JUEGO.indexOf("|")
    let primero = corte < 0 ? TITULO_JUEGO : TITULO_JUEGO.substr(0, corte)
    imprimirTextoJuego(primero, 80 - 3 * primero.length, y, COLOR_AMARILLO)
    if (corte < 0) return
    let segundo = TITULO_JUEGO.substr(corte + 1)
    imprimirTextoJuego(segundo, 80 - 3 * segundo.length, y + hueco, COLOR_AMARILLO)
}

function dibujarTitulo(): void {
    screen.fill(COLOR_FONDO)
    for (let i = 0; i < 22; i++) {
        let x = azarEstable(i, 3, 9) % 160
        let y = azarEstable(i, 7, 2) % 105
        screen.setPixel(x, y, i % 4 == 0 ? COLOR_CIAN : COLOR_TENUE)
    }
    imprimirTextoJuego("CALLIOPE HACKER", 35, 2, COLOR_VERDE)
    screen.drawLine(25, 13, 135, 13, COLOR_CIAN)
    screen.drawLine(25, 43, 135, 43, COLOR_CIAN)
    dibujarTituloJuego(16, 13)
    screen.drawLine(73, 49, 80, 45, COLOR_VERDE)
    screen.drawLine(80, 45, 87, 49, COLOR_VERDE)
    screen.drawLine(87, 49, 80, 53, COLOR_VERDE)
    screen.drawLine(80, 53, 73, 49, COLOR_VERDE)

    if (posicionMenu < inicioLista) inicioLista = posicionMenu
    if (posicionMenu >= inicioLista + 6) inicioLista = posicionMenu - 5
    for (let fila = 0; fila < 6; fila++) {
        let i = inicioLista + fila
        if (i >= CANTIDAD_ELEMENTOS_TITULO) break
        let y = 55 + fila * 9
        if (i == posicionMenu) {
            screen.fillRect(17, y - 1, 126, 8, COLOR_MORADO)
            screen.fillRect(17, y - 1, 2, 8, COLOR_AMARILLO)
        }
        let color = COLOR_TEXTO
        if (i == 5 && !puedeCambiarModoTitulo()) color = COLOR_TENUE
        if (i == 8 && !puedeIniciarPartidaNuevaPlus()) color = COLOR_TENUE
        if (i == 9 && !tienePartida) color = COLOR_TENUE
        imprimirTextoJuego((i == posicionMenu ? ">" : " ") +
            textoCortoPantalla(textoElementoTitulo(i), 19), 21, y, color)
    }
    screen.fillRect(146, 55 + Math.idiv(posicionMenu * 45, CANTIDAD_ELEMENTOS_TITULO), 2, 7, COLOR_AMARILLO)
    if (partidaEstabaDanada) imprimirTextoJuego(Textos.t(272), 3, 109, COLOR_ROJO)
    imprimirDerecha(Textos.t(273), 157, 109, COLOR_TENUE)
}

function nivelVistaNave(numero: number, numeroResalte: number, mostrarSiguiente: boolean): number {
    let nivel = mejoras[numero]
    if (mostrarSiguiente && numero == numeroResalte && nivel < MAX_MEJORA[numero]) nivel++
    return nivel
}

function colorParteVistaNave(numero: number, nivelParte: number, numeroResalte: number, mostrarSiguiente: boolean,
    colorNormal: number): number {
    if (mostrarSiguiente && numero == numeroResalte && nivelParte > mejoras[numero]) return COLOR_AMARILLO
    return colorNormal
}

function dibujarRomboVista(cx: number, cy: number, anchoMitad: number, altoMitad: number,
    color: number): void {
    screen.drawLine(cx, cy - altoMitad, cx + anchoMitad, cy, color)
    screen.drawLine(cx + anchoMitad, cy, cx, cy + altoMitad, color)
    screen.drawLine(cx, cy + altoMitad, cx - anchoMitad, cy, color)
    screen.drawLine(cx - anchoMitad, cy, cx, cy - altoMitad, color)
}

// Modelo de alambre visto desde arriba. Cada mejora añade una pieza visible a la misma silueta de nave.
function dibujarVistaNave(cx: number, cy: number, numeroResalte: number, mostrarSiguiente: boolean): void {
    let nivelEscudo = nivelVistaNave(MEJORA_ESCUDO, numeroResalte, mostrarSiguiente)
    for (let i = 0; i < nivelEscudo; i++) {
        let colorEscudo =
            colorParteVistaNave(MEJORA_ESCUDO, i + 1, numeroResalte, mostrarSiguiente, COLOR_AZUL)
        dibujarRomboVista(cx, cy, 21 + i * 2, 23 + i * 2, colorEscudo)
    }

    let colorCasco = numeroResalte == -3 ? COLOR_AMARILLO : COLOR_TEXTO
    screen.drawLine(cx, cy - 20, cx - 5, cy - 7, colorCasco)
    screen.drawLine(cx - 5, cy - 7, cx - 20, cy + 8, colorCasco)
    screen.drawLine(cx - 20, cy + 8, cx - 7, cy + 6, colorCasco)
    screen.drawLine(cx - 7, cy + 6, cx - 6, cy + 17, colorCasco)
    screen.drawLine(cx - 6, cy + 17, cx, cy + 13, colorCasco)
    screen.drawLine(cx, cy + 13, cx + 6, cy + 17, colorCasco)
    screen.drawLine(cx + 6, cy + 17, cx + 7, cy + 6, colorCasco)
    screen.drawLine(cx + 7, cy + 6, cx + 20, cy + 8, colorCasco)
    screen.drawLine(cx + 20, cy + 8, cx + 5, cy - 7, colorCasco)
    screen.drawLine(cx + 5, cy - 7, cx, cy - 20, colorCasco)
    screen.drawLine(cx, cy - 16, cx, cy + 12, COLOR_TENUE)

    let nivelBlindaje = nivelVistaNave(MEJORA_BLINDAJE, numeroResalte, mostrarSiguiente)
    for (let i = 0; i < nivelBlindaje; i++) {
        let colorBlindaje =
            colorParteVistaNave(MEJORA_BLINDAJE, i + 1, numeroResalte, mostrarSiguiente, COLOR_VERDE)
        screen.drawLine(cx - 2 - i, cy - 11, cx - 5 - i, cy + 7, colorBlindaje)
        screen.drawLine(cx + 2 + i, cy - 11, cx + 5 + i, cy + 7, colorBlindaje)
    }

    let nivelCarga = nivelVistaNave(MEJORA_CARGA, numeroResalte, mostrarSiguiente)
    if (nivelCarga >= 1) {
        let colorCarga = colorParteVistaNave(MEJORA_CARGA, 1, numeroResalte, mostrarSiguiente, COLOR_NARANJA)
        screen.drawRect(cx - 19, cy + 2, 5, 8, colorCarga)
        screen.drawRect(cx + 15, cy + 2, 5, 8, colorCarga)
    }
    if (nivelCarga >= 2) {
        let colorCarga = colorParteVistaNave(MEJORA_CARGA, 2, numeroResalte, mostrarSiguiente, COLOR_NARANJA)
        screen.drawRect(cx - 13, cy + 9, 5, 7, colorCarga)
        screen.drawRect(cx + 9, cy + 9, 5, 7, colorCarga)
    }
    if (nivelCarga >= 3) {
        let colorCarga = colorParteVistaNave(MEJORA_CARGA, 3, numeroResalte, mostrarSiguiente, COLOR_NARANJA)
        screen.drawRect(cx - 22, cy - 4, 4, 7, colorCarga)
        screen.drawRect(cx + 19, cy - 4, 4, 7, colorCarga)
    }

    let nivelLaser = nivelVistaNave(MEJORA_LASER, numeroResalte, mostrarSiguiente)
    if (nivelLaser >= 1) {
        let colorLaser = colorParteVistaNave(MEJORA_LASER, 1, numeroResalte, mostrarSiguiente, COLOR_ROJO)
        screen.drawLine(cx - 2, cy - 17, cx - 2, cy - 24, colorLaser)
        screen.drawLine(cx + 2, cy - 17, cx + 2, cy - 24, colorLaser)
    }
    if (nivelLaser >= 2) {
        let colorLaser = colorParteVistaNave(MEJORA_LASER, 2, numeroResalte, mostrarSiguiente, COLOR_ROJO)
        screen.setPixel(cx - 3, cy - 25, colorLaser)
        screen.setPixel(cx + 3, cy - 25, colorLaser)
    }
    if (nivelLaser >= 3) {
        let colorLaser = colorParteVistaNave(MEJORA_LASER, 3, numeroResalte, mostrarSiguiente, COLOR_ROJO)
        screen.drawLine(cx - 2, cy - 25, cx - 2, cy - 28, colorLaser)
        screen.drawLine(cx + 2, cy - 25, cx + 2, cy - 28, colorLaser)
    }

    let nivelRefrigerador = nivelVistaNave(MEJORA_REFRIGERADOR, numeroResalte, mostrarSiguiente)
    for (let i = 0; i < nivelRefrigerador; i++) {
        let colorRefrigerador =
            colorParteVistaNave(MEJORA_REFRIGERADOR, i + 1, numeroResalte, mostrarSiguiente, COLOR_CIAN)
        let aletaY = cy - 1 + i * 5
        screen.drawLine(cx - 8, aletaY, cx - 13, aletaY - 2, colorRefrigerador)
        screen.drawLine(cx + 8, aletaY, cx + 13, aletaY - 2, colorRefrigerador)
    }

    let nivelSalto = nivelVistaNave(MEJORA_SALTO, numeroResalte, mostrarSiguiente)
    for (let i = 0; i < nivelSalto; i++) {
        let colorSalto =
            colorParteVistaNave(MEJORA_SALTO, i + 1, numeroResalte, mostrarSiguiente, COLOR_MORADO)
        let bobinaY = cy + 8 + i * 3
        screen.drawLine(cx - 4, bobinaY, cx + 4, bobinaY, colorSalto)
    }

    let nivelPropulsor = nivelVistaNave(MEJORA_PROPULSOR, numeroResalte, mostrarSiguiente)
    let largoLlamaInstalada = 3 + mejoras[MEJORA_PROPULSOR] * 2
    let colorPropulsor = numeroResalte == -2 ? COLOR_AMARILLO : COLOR_NARANJA
    screen.drawLine(cx - 4, cy + 17, cx - 4, cy + 17 + largoLlamaInstalada, colorPropulsor)
    screen.drawLine(cx + 4, cy + 17, cx + 4, cy + 17 + largoLlamaInstalada, colorPropulsor)
    if (mostrarSiguiente && numeroResalte == MEJORA_PROPULSOR &&
        nivelPropulsor > mejoras[MEJORA_PROPULSOR]) {
        let largoLlamaVista = 3 + nivelPropulsor * 2
        screen.drawLine(cx - 4, cy + 17 + largoLlamaInstalada, cx - 4, cy + 17 + largoLlamaVista,
            COLOR_AMARILLO)
        screen.drawLine(cx + 4, cy + 17 + largoLlamaInstalada, cx + 4, cy + 17 + largoLlamaVista,
            COLOR_AMARILLO)
    }

    let nivelEscaner = nivelVistaNave(MEJORA_ESCANER, numeroResalte, mostrarSiguiente)
    if (nivelEscaner >= 1) {
        let colorEscaner = colorParteVistaNave(MEJORA_ESCANER, 1, numeroResalte, mostrarSiguiente, COLOR_CIAN)
        dibujarRomboVista(cx, cy - 3, 4, 3, colorEscaner)
    }
    if (nivelEscaner >= 2) {
        let colorEscaner = colorParteVistaNave(MEJORA_ESCANER, 2, numeroResalte, mostrarSiguiente, COLOR_CIAN)
        screen.drawRect(cx - 5, cy - 7, 11, 9, colorEscaner)
    }

    let nivelReparacion = nivelVistaNave(MEJORA_REPARACION, numeroResalte, mostrarSiguiente)
    if (nivelReparacion > 0) {
        let colorReparacion =
            colorParteVistaNave(MEJORA_REPARACION, 1, numeroResalte, mostrarSiguiente, COLOR_VERDE)
        screen.drawRect(cx + 21, cy - 9, 5, 5, colorReparacion)
        screen.drawLine(cx + 23, cy - 11, cx + 23, cy - 2, colorReparacion)
        screen.drawLine(cx + 19, cy - 7, cx + 27, cy - 7, colorReparacion)
    }

    let nivelSeguro = nivelVistaNave(MEJORA_SEGURO, numeroResalte, mostrarSiguiente)
    if (nivelSeguro > 0) {
        let colorSeguro =
            colorParteVistaNave(MEJORA_SEGURO, 1, numeroResalte, mostrarSiguiente, COLOR_VERDE)
        screen.drawLine(cx - 24, cy - 15, cx - 24, cy - 10, colorSeguro)
        screen.drawLine(cx - 24, cy - 15, cx - 19, cy - 15, colorSeguro)
        screen.drawLine(cx + 24, cy - 15, cx + 24, cy - 10, colorSeguro)
        screen.drawLine(cx + 24, cy - 15, cx + 19, cy - 15, colorSeguro)
        if (nivelSeguro >= 2) {
            colorSeguro =
                colorParteVistaNave(MEJORA_SEGURO, 2, numeroResalte, mostrarSiguiente, COLOR_VERDE)
            screen.drawLine(cx - 24, cy + 15, cx - 24, cy + 10, colorSeguro)
            screen.drawLine(cx - 24, cy + 15, cx - 19, cy + 15, colorSeguro)
            screen.drawLine(cx + 24, cy + 15, cx + 24, cy + 10, colorSeguro)
            screen.drawLine(cx + 24, cy + 15, cx + 19, cy + 15, colorSeguro)
        }
    }
}

function dibujarVistaRolNave(cx: number, cy: number, rol: RolNave): void {
    if (rol == RolNave.Mercader) {
        screen.drawRect(cx - 27, cy + 4, 5, 10, COLOR_NARANJA)
        screen.drawRect(cx + 23, cy + 4, 5, 10, COLOR_NARANJA)
        screen.drawLine(cx - 25, cy + 14, cx + 25, cy + 14, COLOR_NARANJA)
    } else if (rol == RolNave.Mensajero) {
        screen.drawLine(cx - 8, cy + 20, cx - 8, cy + 27, COLOR_CIAN)
        screen.drawLine(cx, cy + 17, cx, cy + 29, COLOR_AMARILLO)
        screen.drawLine(cx + 8, cy + 20, cx + 8, cy + 27, COLOR_CIAN)
    } else {
        screen.drawLine(cx - 7, cy - 20, cx - 7, cy - 28, COLOR_ROJO)
        screen.drawLine(cx + 7, cy - 20, cx + 7, cy - 28, COLOR_ROJO)
        dibujarRomboVista(cx, cy - 4, 7, 5, COLOR_ROJO)
    }
}

function resumenNivelMejora(numero: number, nivel: number): string {
    if (numero == MEJORA_CARGA) return Textos.t(274) + (8 + nivel * 4)
    if (numero == MEJORA_ESCUDO) return Textos.t(275) + (4 + nivel * 3)
    if (numero == MEJORA_BLINDAJE) return Textos.t(276) + (8 + nivel * 3)
    if (numero == MEJORA_LASER) return Textos.t(195) + (1 + nivel)
    if (numero == MEJORA_REFRIGERADOR) return Textos.t(196) + Math.max(180, 440 - nivel * 100)
    if (numero == MEJORA_PROPULSOR) return Textos.t(197) + Math.max(1200, 2600 - nivel * 500)
    if (numero == MEJORA_ESCANER) return Textos.t(198) + nivel
    if (numero == MEJORA_SALTO) return Textos.t(199) + (2 + nivel)
    if (numero == MEJORA_REPARACION) return nivel > 0 ? Textos.t(277) : Textos.t(278)
    if (numero == MEJORA_SEGURO)
        return nivel == 0 ? Textos.t(202) : (nivel == 1 ? Textos.t(203) : Textos.t(279))
    return ""
}

function rellenarCuadrilateroHangar(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number,
    y3: number, color: number): void {
    screen.fillTriangle(x0, y0, x1, y1, x2, y2, color)
    screen.fillTriangle(x0, y0, x2, y2, x3, y3, color)
}

function dibujarFondoHangar3D(): void {
    let acentoEstacion = colorAcentoEstacion()
    let estacionOscura = colorOscuroEstacion()
    screen.fillRect(0, 13, 160, 95, COLOR_FONDO)

    // Un techo profundo y unas vigas llevan hacia el taller de servicio del fondo.
    rellenarCuadrilateroHangar(0, 13, 159, 13, 149, 39, 64, 39, COLOR_AZUL)
    screen.drawLine(0, 18, 159, 18, COLOR_METAL)
    screen.drawLine(13, 26, 155, 26, COLOR_METAL)
    screen.drawLine(35, 34, 151, 34, COLOR_METAL)
    screen.drawLine(0, 13, 76, 39, COLOR_TENUE)
    screen.drawLine(29, 13, 88, 39, COLOR_TENUE)
    screen.drawLine(58, 13, 98, 39, COLOR_TENUE)
    screen.drawLine(87, 13, 108, 39, COLOR_TENUE)
    screen.drawLine(116, 13, 121, 39, COLOR_TENUE)
    screen.drawLine(145, 13, 137, 39, COLOR_TENUE)
    screen.drawLine(4, 18, 29, 26, COLOR_SOMBRA)
    screen.drawLine(29, 18, 13, 26, COLOR_SOMBRA)
    screen.drawLine(58, 18, 88, 26, COLOR_SOMBRA)
    screen.drawLine(88, 18, 58, 26, COLOR_SOMBRA)
    screen.drawLine(116, 18, 145, 26, COLOR_SOMBRA)
    screen.drawLine(145, 18, 116, 26, COLOR_SOMBRA)

    // Pared trasera inclinada y una compuerta de presión hecha de segmentos.
    rellenarCuadrilateroHangar(62, 38, 159, 31, 159, 72, 62, 67, estacionOscura)
    rellenarCuadrilateroHangar(72, 42, 155, 37, 155, 68, 72, 63, COLOR_SOMBRA)
    screen.drawLine(72, 42, 155, 37, COLOR_TENUE)
    screen.drawLine(72, 63, 155, 68, COLOR_TENUE)
    screen.drawLine(91, 41, 91, 64, COLOR_METAL)
    screen.drawLine(112, 40, 112, 65, COLOR_METAL)
    screen.drawLine(133, 38, 133, 67, COLOR_METAL)
    screen.drawLine(72, 52, 155, 52, acentoEstacion)
    screen.fillRect(146, 41, 5, 4, COLOR_ROJO)
    screen.setPixel(148, 42, COLOR_AMARILLO)

    // Suelo en perspectiva, plataforma de despegue, raíles y una rejilla del suelo que crece.
    screen.fillRect(0, 64, 160, 44, COLOR_SOMBRA)
    rellenarCuadrilateroHangar(104, 61, 119, 61, 153, 108, 54, 108, COLOR_METAL)
    rellenarCuadrilateroHangar(108, 63, 116, 63, 135, 108, 81, 108, COLOR_AZUL)
    screen.drawLine(111, 61, 42, 108, COLOR_TENUE)
    screen.drawLine(111, 61, 75, 108, COLOR_TENUE)
    screen.drawLine(113, 61, 112, 108, COLOR_TENUE)
    screen.drawLine(114, 61, 148, 108, COLOR_TENUE)
    screen.drawLine(115, 61, 159, 91, COLOR_TENUE)
    screen.drawLine(94, 72, 131, 72, COLOR_TENUE)
    screen.drawLine(80, 81, 142, 81, COLOR_TENUE)
    screen.drawLine(63, 94, 154, 94, COLOR_TENUE)
    screen.drawLine(39, 106, 159, 106, COLOR_TENUE)
    screen.drawLine(101, 65, 72, 108, acentoEstacion)
    screen.drawLine(121, 65, 143, 108, acentoEstacion)
    screen.fillRect(96, 72, 2, 2, COLOR_AMARILLO)
    screen.fillRect(89, 82, 2, 2, COLOR_CIAN)
    screen.fillRect(80, 96, 3, 2, COLOR_AMARILLO)
    screen.fillRect(128, 72, 2, 2, COLOR_AMARILLO)
    screen.fillRect(134, 83, 2, 2, COLOR_CIAN)
    screen.fillRect(140, 97, 3, 2, COLOR_AMARILLO)

    // El umbral de la puerta y los soportes están en primer plano; el suelo no debe taparlos al dibujarse.
    screen.drawLine(72, 63, 155, 68, COLOR_METAL)
    screen.drawLine(72, 64, 155, 69, COLOR_OXIDO)
    screen.fillRect(59, 34, 10, 48, estacionOscura)
    screen.fillRect(62, 37, 3, 42, COLOR_METAL)
    screen.fillRect(153, 28, 7, 57, estacionOscura)
    screen.fillRect(153, 33, 2, 47, COLOR_METAL)
    screen.drawLine(59, 44, 69, 54, COLOR_SOMBRA)
    screen.drawLine(69, 44, 59, 54, COLOR_SOMBRA)
    screen.fillRect(57, 80, 14, 3, COLOR_METAL)
    screen.fillRect(151, 83, 9, 3, COLOR_METAL)
}

const HACKER_MINI_X = 136
const HACKER_MINI_Y = 46
// Capucha puesta, sudadera y pantalones negros, zapatillas turquesa; a la derecha, el escritorio con una pantalla.
const HACKER_MINI = img`
    . . . . . . . . b b b b b b b .
    . . . b b b . . b 9 9 9 9 9 b .
    . . b f f f b . b 9 7 9 7 9 b .
    . . b f f f b . b 9 9 9 9 9 b .
    . . b f f f b . b b b b b b b .
    . b f f f f f b . . . b . . . .
    b f f f f f f f f d d d d d d d
    b f f f f f f b b b b b b b b b
    b f f f f f f b . b . . . . . b
    . b f f f f b . . b . . . . . b
    . b f f . f f b . b . . . . . b
    . b f f . f f b . . . . . . . .
    . 6 6 6 . 6 6 6 . . . . . . . .
`

function dibujarNaveHangar3D(): void {
    let pinturaCasco = colorPinturaNave()
    // La sombra y la burbuja del escudo van detrás de la nave sólida.
    rellenarCuadrilateroHangar(73, 95, 91, 88, 155, 89, 142, 102, COLOR_FONDO)
    for (let i = 0; i < mejoras[MEJORA_ESCUDO]; i++) {
        dibujarRomboVista(116, 70, 39 + i * 2, 27 + i * 2,
            i == mejoras[MEJORA_ESCUDO] - 1 ? COLOR_CIAN : COLOR_AZUL)
    }

    // El ala lejana y la cercana, con sus caras inferiores más oscuras.
    screen.fillTriangle(106, 66, 122, 43, 150, 83, pinturaCasco)
    screen.drawLine(106, 66, 122, 43, COLOR_CIAN)
    screen.drawLine(122, 43, 150, 83, COLOR_TENUE)
    screen.fillTriangle(106, 70, 73, 96, 152, 87, COLOR_TENUE)
    screen.fillTriangle(73, 96, 152, 87, 144, 93, COLOR_SOMBRA)
    screen.drawLine(73, 96, 106, 70, COLOR_TEXTO)
    screen.drawLine(73, 96, 152, 87, COLOR_CIAN)

    // Fuselaje largo y asimétrico: parte de arriba clara, costado oscuro y morro puntiagudo.
    rellenarCuadrilateroHangar(80, 51, 111, 62, 154, 84, 106, 72, COLOR_TENUE)
    rellenarCuadrilateroHangar(80, 58, 106, 72, 154, 84, 105, 79, pinturaCasco)
    screen.drawLine(80, 51, 111, 62, COLOR_TEXTO)
    screen.drawLine(111, 62, 154, 84, COLOR_TEXTO)
    screen.drawLine(80, 58, 105, 79, COLOR_CIAN)
    screen.drawLine(105, 79, 154, 84, COLOR_CIAN)

    // Aletas de cola, cristal de la cabina y carcasas de los motores.
    screen.fillTriangle(81, 53, 92, 43, 106, 64, COLOR_METAL)
    screen.fillTriangle(81, 59, 75, 70, 106, 70, COLOR_SOMBRA)
    screen.drawLine(92, 43, 106, 64, COLOR_TEXTO)
    rellenarCuadrilateroHangar(108, 60, 126, 67, 133, 76, 115, 70, COLOR_FONDO)
    screen.drawLine(108, 60, 126, 67, COLOR_CIAN)
    screen.drawLine(126, 67, 133, 76, COLOR_CIAN)
    screen.drawLine(133, 76, 115, 70, COLOR_AZUL)
    screen.fillRect(77, 52, 6, 4, COLOR_FONDO)
    screen.fillRect(76, 59, 6, 4, COLOR_FONDO)
    screen.drawRect(77, 52, 6, 4, COLOR_NARANJA)
    screen.drawRect(76, 59, 6, 4, COLOR_NARANJA)

    // El tren de aterrizaje apoya la nave en la plataforma iluminada.
    screen.drawLine(96, 81, 94, 98, COLOR_TEXTO)
    screen.drawLine(91, 98, 99, 98, COLOR_TENUE)
    screen.drawLine(137, 84, 139, 98, COLOR_TEXTO)
    screen.drawLine(135, 98, 143, 98, COLOR_TENUE)

    // El equipo instalado se sigue viendo en el modelo 3D del hangar.
    for (let i = 0; i < mejoras[MEJORA_BLINDAJE]; i++) {
        screen.drawLine(92 + i * 4, 58 + i, 116 + i * 4, 69 + i * 2, COLOR_VERDE)
    }
    for (let i = 0; i < mejoras[MEJORA_REFRIGERADOR]; i++) {
        screen.drawLine(91 - i * 5, 83 + i * 3, 102 - i * 3, 76 + i * 2, COLOR_CIAN)
    }
    for (let i = 0; i < mejoras[MEJORA_CARGA]; i++) {
        screen.drawRect(84 + i * 7, 76 + i * 2, 6, 5, COLOR_NARANJA)
    }
    for (let i = 0; i < mejoras[MEJORA_SALTO]; i++) {
        screen.drawLine(78 - i, 51 + i * 5, 84 + i, 54 + i * 5, COLOR_MORADO)
    }
    if (mejoras[MEJORA_LASER] > 0) {
        screen.drawLine(149, 80, 159, 82, COLOR_ROJO)
        screen.drawLine(148, 84, 159, 87, COLOR_ROJO)
    }
    if (mejoras[MEJORA_PROPULSOR] > 0) {
        screen.drawLine(76, 54, 70 - mejoras[MEJORA_PROPULSOR] * 2, 52, COLOR_AMARILLO)
        screen.drawLine(75, 61, 69 - mejoras[MEJORA_PROPULSOR] * 2, 61, COLOR_NARANJA)
    }
    if (mejoras[MEJORA_ESCANER] > 0) {
        dibujarRomboVista(114, 57, 4 + mejoras[MEJORA_ESCANER], 3, COLOR_CIAN)
        screen.drawLine(114, 57, 111, 51, COLOR_CIAN)
    }
    if (mejoras[MEJORA_REPARACION] > 0) {
        screen.drawRect(143, 49, 5, 5, COLOR_VERDE)
        screen.drawLine(145, 47, 145, 56, COLOR_VERDE)
        screen.drawLine(141, 51, 150, 51, COLOR_VERDE)
    }
    if (mejoras[MEJORA_SEGURO] > 0) {
        screen.drawLine(76, 46, 83, 46, COLOR_VERDE)
        screen.drawLine(76, 46, 76, 52, COLOR_VERDE)
        screen.drawLine(156, 76, 156, 82, COLOR_VERDE)
        screen.drawLine(156, 76, 149, 76, COLOR_VERDE)
        if (mejoras[MEJORA_SEGURO] > 1) {
            screen.drawLine(72, 99, 79, 99, COLOR_VERDE)
            screen.drawLine(72, 99, 72, 93, COLOR_VERDE)
            screen.drawLine(156, 94, 156, 100, COLOR_VERDE)
            screen.drawLine(156, 100, 149, 100, COLOR_VERDE)
        }
    }

    // La forma del rol se ve en la nave aparcada igual que en la vista previa.
    if (rolNave == RolNave.Mercader) {
        screen.drawRect(82, 82, 7, 5, COLOR_NARANJA)
        screen.drawRect(91, 84, 7, 5, COLOR_NARANJA)
    } else if (rolNave == RolNave.Mensajero) {
        screen.drawLine(76, 54, 67, 51, COLOR_CIAN)
        screen.drawLine(75, 61, 66, 61, COLOR_AMARILLO)
    } else {
        screen.drawLine(148, 79, 159, 80, COLOR_ROJO)
        screen.drawLine(147, 86, 159, 89, COLOR_ROJO)
    }

    // Una franja de pintura del color de la estación y una insignia amarilla que se alarga con el rango.
    screen.drawLine(91, 63, 141, 80, colorAcentoEstacion())
    screen.fillRect(119, 71, 3 + Math.min(5, rangoActual()), 2, COLOR_AMARILLO)
}

function dibujarHangar(): void {
    dibujarCabecera(Textos.t(280) + NOMBRES_MUNDO[mundoActual])
    dibujarFondoHangar3D()
    dibujarNaveHangar3D()
    screen.fillRect(156, 28, 4, 58, COLOR_OXIDO)
    screen.drawLine(156, 34, 159, 38, COLOR_METAL)
    screen.drawLine(159, 38, 156, 42, COLOR_METAL)

    // Un pequeño dron de servicio unido a la nave por un cable y dos luces que parpadean mantienen viva la estación sin
    // necesitar sprites (figuras de imagen ya hechas).
    let faseDron = Math.idiv(game.runtime(), 90) % 76
    let dronX = 78 + faseDron
    let dronY = 42 + Math.idiv(Math.abs(38 - faseDron), 8)
    screen.fillRect(dronX, dronY, 4, 2, COLOR_VERDE)
    screen.setPixel(dronX - 1, dronY + 1, COLOR_CIAN)
    screen.drawLine(dronX + 2, dronY + 2, 116, 70, COLOR_TENUE)
    if (Math.idiv(game.runtime(), 280) % 2 == 0) {
        screen.fillRect(147, 41, 3, 2, COLOR_AMARILLO)
        screen.setPixel(96, 73, colorAcentoEstacion())
    }
    // Aparición especial: el Calliope Hacker está en el puesto de mando de la pasarela trasera, delante del
    // cable del dron.
    screen.drawTransparentImage(HACKER_MINI, HACKER_MINI_X, HACKER_MINI_Y)

    // Consola de operaciones: la escena sigue siendo grande y el menú se desplaza con suavidad.
    screen.fillRect(1, 17, 70, 83, COLOR_FONDO)
    screen.drawRect(1, 17, 70, 83, COLOR_METAL)
    if (posicionMenu < inicioLista) inicioLista = posicionMenu
    if (posicionMenu >= inicioLista + 6) inicioLista = posicionMenu - 5
    for (let fila = 0; fila < 6; fila++) {
        let i = inicioLista + fila
        if (i >= ELEMENTOS_HANGAR.length) break
        let y = 21 + fila * 13
        if (i == posicionMenu) {
            screen.fillRect(3, y - 1, 65, 10, COLOR_MORADO)
            screen.fillRect(3, y - 1, 2, 10, COLOR_AMARILLO)
        }
        let color = COLOR_TEXTO
        if (i == 1 && !mercadoNegroDisponible()) color = COLOR_TENUE
        if (i == 9 && mundoDestino == mundoActual) color = COLOR_TENUE
        // Solo la fila elegida se desplaza como letrero; las demás muestran el principio de la palabra.
        let etiqueta = Textos.t(ELEMENTOS_HANGAR[i])
        imprimirTextoJuego(i == posicionMenu ? textoCortoPantalla(etiqueta, 10) : etiqueta.substr(0, 10), 7, y, color)
        let objetivoTutorial = etapaTutorial == 1 ? 3
            : (etapaTutorial == 2 ? (mundoDestino == mundoActual ? 4 : 9) : -1)
        // El "!" cae en la columna 2 del carácter: en x 65 se dibuja en x 67, un píxel después de una décima letra y
        // antes de la barra de desplazamiento (x 68).
        if (i == objetivoTutorial && Math.idiv(game.runtime(), 250) % 2 == 0)
            imprimirTextoJuego("!", 65, y, COLOR_AMARILLO)
    }
    screen.fillRect(68, 20 + Math.idiv(posicionMenu * 73, ELEMENTOS_HANGAR.length), 2, 8, colorAcentoEstacion())

    screen.fillRect(101, 15, 58, 11, COLOR_FONDO)
    screen.drawRect(101, 15, 58, 11, COLOR_CIAN)
    let etiquetaRuta = cantidadSaltosRuta() > 1 ? Textos.t(281) + combustible +
        Textos.t(282) + cantidadSaltosRuta() + ">" +
        NOMBRES_MUNDO[mundoEnRuta(cantidadSaltosRuta())] : Textos.t(281) + combustible + " >" +
        NOMBRES_MUNDO[mundoDestino]
    imprimirDerecha(textoCortoPantalla(etiquetaRuta, 9), 156, 18,
        mundoDestino == mundoActual ? COLOR_TENUE : COLOR_AMARILLO)
    screen.fillRect(96, 27, 63, 9, COLOR_FONDO)
    imprimirDerecha(textoCortoPantalla(nombreRasgoMundo(mundoActual), 10), 157, 29, colorAcentoEstacion())
    screen.fillRect(73, 99, 85, 9, COLOR_FONDO)
    if (posicionMenu == 9) {
        let asegurado = mejoras[MEJORA_SEGURO] == 0 ? Textos.t(283)
            : (mejoras[MEJORA_SEGURO] == 1 ? Textos.t(284) : Textos.t(285))
        imprimirDerecha(textoCortoPantalla(asegurado, 14), 157, 101, COLOR_AMARILLO)
    } else imprimirDerecha(textoCortoPantalla(nombrePantallaNave(rolNave) + " / " + nombrePinturaNave(rolNave),
        14), 157, 101, COLOR_TENUE)
    if (entregaGuiadaActiva()) {
        screen.fillRect(0, 98, 160, 10, COLOR_AZUL)
        screen.fillRect(0, 98, 6, 10, COLOR_AMARILLO)
        imprimirTextoJuego(Textos.t(286), 1, 101, COLOR_FONDO)
        imprimirTextoJuego(textoCortoPantalla(nombreEtapaTutorial(), 25), 8, 101, COLOR_AMARILLO)
    }
    if (confirmacionAbierta) {
        dibujarCuadroConfirmacion(Textos.t(630), 0)
        screen.fillRect(0, 108, 160, 12, COLOR_FONDO)
    } else dibujarPie(Textos.t(273), entregaGuiadaActiva() ? Textos.t(629) : Textos.t(287))
}

function entregaGuiadaActiva(): boolean {
    return etapaTutorial >= 1 && etapaTutorial <= 3
}

// Se salta la primera entrega guiada: el estado final es el mismo que al terminarla (etapa 4, escáner), pero sin
// cobrar su pago.
function saltarEntregaGuiada(): void {
    if (fuenteMision == 2) vaciarMision()
    etapaTutorial = 4
    mejoras[MEJORA_ESCANER] = Math.max(1, mejoras[MEJORA_ESCANER])
    escribirPartida()
    tocarSonidoConfirmacion()
    // La tercera línea nombra el siguiente paso de la guía que se ha saltado: aceptar una misión.
    mostrarAviso(Textos.t(631), Textos.t(632), Textos.t(236), NumeroEscena.Hangar)
}

function nombreMercadoPantalla(nombre: string, fila: number): string {
    return fila == posicionMenu ? textoCortoPantalla(nombre, 9) : nombre.substr(0, 9)
}

function dibujarMercado(): void {
    dibujarCabecera((mercadoNegro ? Textos.t(288) : Textos.t(289)) + NOMBRES_MUNDO[mundoActual])
    imprimirTextoJuego(Textos.t(290), 5, 16, COLOR_TENUE)
    imprimirTextoJuego(mercadoNegro ? Textos.t(291) : Textos.t(291), 66, 16, COLOR_TENUE)
    imprimirTextoJuego(Textos.t(292), 126, 16, COLOR_TENUE)
    let cantidadFilas = mercadoNegro ? CANTIDAD_MERCANCIAS + CANTIDAD_RAREZAS : CANTIDAD_MERCANCIAS
    if (posicionMenu < inicioLista) inicioLista = posicionMenu
    if (posicionMenu >= inicioLista + 6) inicioLista = posicionMenu - 5
    for (let fila = 0; fila < 6; fila++) {
        let mercancia = inicioLista + fila
        if (mercancia >= cantidadFilas) break
        let y = 28 + fila * 12
        if (mercancia == posicionMenu && !tratoAbierto) dibujarEleccion(y, 10)
        if (mercancia < CANTIDAD_MERCANCIAS) {
            // Los nombres se quedan en su columna (9 caracteres, y un hueco antes de los precios en x 66); igual que en
            // el menú del hangar, solo la fila elegida desplaza un nombre largo, y las demás muestran
            // solo el principio.
            imprimirTextoJuego(
                nombreMercadoPantalla(Textos.t(NOMBRES_MERCANCIA[mercancia]), mercancia), 5, y, COLOR_TEXTO)
            let compra = mercadoNegro ? precioCompraMercadoNegro(mercancia) : precioCompra(mercancia)
            let venta = mercadoNegro ? precioVentaMercadoNegro(mercancia) : precioVenta(mercancia)
            // Sobre la selección morada, los precios rojos del mercado negro se dibujan en el color del texto, igual
            // que el nombre de la fila.
            imprimirTextoJuego(compra + "/" + venta, 66, y,
                mercadoNegro ?
                    (mercancia == posicionMenu && !tratoAbierto ? COLOR_TEXTO : COLOR_ROJO) : COLOR_AMARILLO)
            imprimirTextoJuego((mercadoNegro ? "--" : existenciasMercado[mercancia]) + "/" +
                carga[mercancia], 126, y, COLOR_VERDE)
        } else {
            let numeroRareza = mercancia - CANTIDAD_MERCANCIAS
            // La barra de selección también es morada: la mercancía rara elegida se dibuja en el color del texto.
            imprimirTextoJuego(nombreMercadoPantalla(nombreRareza(numeroRareza), mercancia), 5, y,
                mercancia == posicionMenu && !tratoAbierto ? COLOR_TEXTO : COLOR_MORADO)
            imprimirTextoJuego("--/" + valorRareza(numeroRareza), 66, y, COLOR_AMARILLO)
            imprimirTextoJuego("--/" + cargaRara[numeroRareza], 126, y,
                cargaRara[numeroRareza] > 0 ? COLOR_VERDE : COLOR_TENUE)
        }
    }
    screen.fillRect(0, 97, 160, 11, COLOR_FONDO)
    if (textoRespuestaMercado != "" && game.runtime() < respuestaMercadoHastaMs) {
        imprimirTextoJuego(textoCortoPantalla(textoRespuestaMercado, 26), 3, 100, colorRespuestaMercado)
    } else {
        textoRespuestaMercado = ""
        if (mercadoNegro) {
            imprimirTextoJuego(textoCortoPantalla(Textos.t(293), 26), 3, 100, COLOR_ROJO)
        } else if (mercadoConocido(mundoActual)) {
            let mercanciaRecordada = mercanciaMercadoConocido(mundoActual)
            let tendencia = tendenciaMercadoConocido(mundoActual)
            let textoTendencia = tendencia > 0 ? "+" : (tendencia < 0 ? "-" : "=")
            imprimirTextoJuego(
                textoCortoPantalla(Textos.t(294) + Textos.t(NOMBRES_MERCANCIA[mercanciaRecordada]) + " " +
                compraMercadoConocido(mundoActual) + "/" + ventaMercadoConocido(mundoActual) + " " + textoTendencia +
                Textos.t(295) + edadMercadoConocido(mundoActual), 26), 3, 100, COLOR_CIAN)
        } else {
            imprimirTextoJuego(textoCortoPantalla(Textos.t(296) + detalleSucesoMercado(), 26), 3, 100,
                sucesoMercadoActivoEn(mundoActual) ? COLOR_AMARILLO : COLOR_TENUE)
        }
    }
    if (tratoAbierto) dibujarCuadroComercio()
    else dibujarPie(Textos.t(297), Textos.t(298))
}

function dibujarCuadroComercio(): void {
    screen.fillRect(15, 34, 130, 58, COLOR_FONDO)
    screen.drawRect(15, 34, 130, 58, COLOR_CIAN)
    let rarezaElegida = mercadoNegro && posicionMenu >= CANTIDAD_MERCANCIAS
    let nombreComercio = rarezaElegida ? nombreRareza(posicionMenu - CANTIDAD_MERCANCIAS) :
        Textos.t(NOMBRES_MERCANCIA[posicionMenu])
    imprimirTextoJuego(nombreComercio, 22, 40, rarezaElegida ? COLOR_MORADO : COLOR_AMARILLO)
    if (cantidadTrato > 0) {
        imprimirTextoJuego(Textos.t(299) + cantidadTrato, 22, 53, COLOR_VERDE)
        imprimirTextoJuego(Textos.t(300) + cantidadTrato *
            (mercadoNegro ? precioCompraMercadoNegro(posicionMenu) : precioCompra(posicionMenu)), 22, 65, COLOR_TEXTO)
    } else if (cantidadTrato < 0) {
        imprimirTextoJuego(Textos.t(301) + (0 - cantidadTrato), 22, 53, COLOR_NARANJA)
        let precioUnidad = rarezaElegida ? valorRareza(posicionMenu - CANTIDAD_MERCANCIAS)
            : (mercadoNegro ? precioVentaMercadoNegro(posicionMenu) : precioVenta(posicionMenu))
        imprimirTextoJuego(Textos.t(300) + (0 - cantidadTrato) * precioUnidad, 22, 65, COLOR_TEXTO)
    } else {
        imprimirTextoJuego(Textos.t(302), 22, 53, COLOR_TENUE)
        imprimirTextoJuego(Textos.t(303), 22, 65, COLOR_TEXTO)
    }
    imprimirTextoJuego(Textos.t(304), 22, 79, COLOR_TENUE)
}

function nombreElementoAstillero(posicion: number): string {
    if (posicion == 0) return Textos.t(305)
    if (posicion == 1) return Textos.t(306)
    if (posicion == POSICION_NAVE_ASTILLERO) return Textos.t(307)
    if (posicion == POSICION_NOMBRE_ASTILLERO) return Textos.t(308)
    if (posicion == POSICION_PINTURA_ASTILLERO) return Textos.t(309)
    if (posicion == POSICION_MISIL_ASTILLERO) return Textos.t(114)
    if (posicion == POSICION_MINA_ASTILLERO) return Textos.t(27)
    return Textos.t(NOMBRES_MEJORA[posicion - 2])
}

function costeAstillero(posicion: number): number {
    if (posicion == 0) return combustible < combustibleMax() ? 8 : 0
    if (posicion == 1) {
        let danado = casco < cascoMax()
        for (let i = 0; i < danoModulo.length; i++) if (danoModulo[i] > 0) danado = true
        return danado ? 28 : 0
    }
    if (posicion == POSICION_NAVE_ASTILLERO)
        return navePropia(vistaRolAstillero) ? 0 : costeCompraNave(vistaRolAstillero)
    if (posicion == POSICION_NOMBRE_ASTILLERO || posicion == POSICION_PINTURA_ASTILLERO) return 0
    if (posicion == POSICION_MISIL_ASTILLERO) return misiles < 9 ? precioAstilleroMundo(120) : 0
    if (posicion == POSICION_MINA_ASTILLERO) return minas < 6 ? precioAstilleroMundo(80) : 0
    let numero = posicion - 2
    return precioMejora(numero, mejoras[numero] + 1)
}

function rolDesdePosicion(posicion: number): RolNave {
    if (posicion == 1) return RolNave.Mensajero
    if (posicion == 2) return RolNave.Cazador
    return RolNave.Mercader
}

function cambiarRolAstillero(diferencia: number): void {
    let siguiente = (vistaRolAstillero + diferencia) % CANTIDAD_ROLES_NAVE
    if (siguiente < 0) siguiente += CANTIDAD_ROLES_NAVE
    vistaRolAstillero = rolDesdePosicion(siguiente)
    numeroInstaladoAstillero = -1
}

function dibujarAstillero(): void {
    dibujarCabecera(Textos.t(247))
    if (posicionMenu < inicioLista) inicioLista = posicionMenu
    if (posicionMenu >= inicioLista + 6) inicioLista = posicionMenu - 5
    for (let fila = 0; fila < 6; fila++) {
        let posicion = inicioLista + fila
        if (posicion >= CANTIDAD_ELEMENTOS_ASTILLERO) break
        let y = 18 + fila * 12
        if (posicion == posicionMenu)
            screen.fillRect(2, y - 1, 90, 10, confirmacionAbierta ? COLOR_AZUL : COLOR_MORADO)
        imprimirTextoJuego(nombreElementoAstillero(posicion), 5, y, COLOR_TEXTO)
        if (posicion == POSICION_NAVE_ASTILLERO) {
            screen.fillRect(87, y + 2, 2, 2, navePropia(vistaRolAstillero) ? COLOR_VERDE
                : (rolNaveDesbloqueado(vistaRolAstillero) ? COLOR_CIAN : COLOR_ROJO))
        } else if (posicion == POSICION_NOMBRE_ASTILLERO || posicion == POSICION_PINTURA_ASTILLERO) {
            imprimirDerecha("<>", 90, y, COLOR_CIAN)
        } else if (posicion == POSICION_MISIL_ASTILLERO || posicion == POSICION_MINA_ASTILLERO) {
            imprimirDerecha(costeAstillero(posicion) > 0 ? "" + costeAstillero(posicion) : Textos.t(310), 90, y,
                costeAstillero(posicion) > 0 && costeAstillero(posicion) > creditos ? COLOR_ROJO : COLOR_AMARILLO)
        } else if (posicion >= 2 && mejoras[posicion - 2] >= MAX_MEJORA[posicion - 2]) {
            imprimirDerecha(Textos.t(310), 90, y, COLOR_VERDE)
        } else {
            imprimirDerecha("" + costeAstillero(posicion), 90, y,
                costeAstillero(posicion) <= creditos ? COLOR_AMARILLO : COLOR_ROJO)
        }
    }

    let naveElegida = posicionMenu == POSICION_NAVE_ASTILLERO
    let identidadElegida = posicionMenu == POSICION_NOMBRE_ASTILLERO || posicionMenu == POSICION_PINTURA_ASTILLERO
    let mejoraElegida = posicionMenu >= 2 && posicionMenu < POSICION_NAVE_ASTILLERO
    let numeroResalte = mejoraElegida ? posicionMenu - 2 : -1
    let instaladoAhora = naveElegida ? vistaRolAstillero == rolNave
        : (mejoraElegida && numeroInstaladoAstillero == numeroResalte)
    let mostrarSiguiente = naveElegida ? vistaRolAstillero != rolNave
        : (mejoraElegida && !instaladoAhora &&
            mejoras[numeroResalte] < MAX_MEJORA[numeroResalte])
    screen.drawRect(94, 15, 65, 72, COLOR_CIAN)
    let etiquetaVista = instaladoAhora ? Textos.t(311) : (mostrarSiguiente ? Textos.t(312) : Textos.t(313))
    if (naveElegida && !rolNaveDesbloqueado(vistaRolAstillero)) etiquetaVista = Textos.t(314)
    imprimirTextoJuego(etiquetaVista,
        etiquetaVista == Textos.t(311) ? 99
            : (etiquetaVista == Textos.t(314) ? 102 : (etiquetaVista == Textos.t(312) ? 102 : 109)),
        18,
        etiquetaVista == Textos.t(311) ? COLOR_VERDE
            : (etiquetaVista == Textos.t(314) ? COLOR_ROJO
                : (etiquetaVista == Textos.t(312) ? COLOR_AMARILLO : COLOR_CIAN)))
    dibujarVistaNave(126, 57, posicionMenu == 0 ? -2 : (posicionMenu == 1 ? -3 : numeroResalte),
        naveElegida ? false : mostrarSiguiente)
    dibujarVistaRolNave(126, 57, naveElegida ? vistaRolAstillero : rolNave)

    if (naveElegida) {
        imprimirTextoJuego((navePropia(vistaRolAstillero) ? Textos.t(315) : Textos.t(316)) +
            nombreRolNave(vistaRolAstillero), 4, 90, instaladoAhora ? COLOR_VERDE : COLOR_AMARILLO)
        imprimirDerecha(Textos.t(317) + rangoNecesarioRolNave(vistaRolAstillero), 157, 90,
            rolNaveDesbloqueado(vistaRolAstillero) ? COLOR_TEXTO : COLOR_ROJO)
        // La descripción de la nave termina un carácter antes del precio o de la indicación para cambiar (las
        // descripciones más largas se desplazan).
        let precioNave = instaladoAhora ? ""
            : (navePropia(vistaRolAstillero) ? Textos.t(318) : costeAstillero(posicionMenu) + Textos.t(319))
        imprimirTextoJuego(textoCortoPantalla(infoRolNave(vistaRolAstillero),
            Math.idiv(147 - precioNave.length * 6, 6)), 4, 99, COLOR_TENUE)
        if (!instaladoAhora)
            imprimirDerecha(precioNave, 157, 99, costeAstillero(posicionMenu) <= creditos ? COLOR_AMARILLO : COLOR_ROJO)
    } else if (posicionMenu == POSICION_NOMBRE_ASTILLERO) {
        imprimirTextoJuego(Textos.t(320), 4, 90, COLOR_AMARILLO)
        imprimirDerecha(nombrePantallaNave(rolNave), 157, 90, COLOR_VERDE)
        imprimirTextoJuego(Textos.t(321), 4, 99, COLOR_TENUE)
    } else if (posicionMenu == POSICION_PINTURA_ASTILLERO) {
        imprimirTextoJuego(Textos.t(309), 4, 90, COLOR_AMARILLO)
        imprimirDerecha(nombrePinturaNave(rolNave), 157, 90, colorPinturaNave())
        imprimirTextoJuego(Textos.t(322), 4, 99, COLOR_TENUE)
    } else if (posicionMenu == POSICION_MISIL_ASTILLERO || posicionMenu == POSICION_MINA_ASTILLERO) {
        let cantidad = posicionMenu == POSICION_MISIL_ASTILLERO ? misiles : minas
        let maximo = posicionMenu == POSICION_MISIL_ASTILLERO ? 9 : 6
        imprimirTextoJuego(nombreElementoAstillero(posicionMenu) + " " + cantidad + "/" + maximo, 4, 90, COLOR_AMARILLO)
        imprimirTextoJuego(posicionMenu == POSICION_MISIL_ASTILLERO ? Textos.t(323) : Textos.t(324), 4, 99, COLOR_TENUE)
        imprimirDerecha(costeAstillero(posicionMenu) + Textos.t(319), 157, 99,
            costeAstillero(posicionMenu) <= creditos ? COLOR_AMARILLO : COLOR_ROJO)
    } else if (mejoraElegida) {
        let nivelActual = mejoras[numeroResalte]
        let nivelMostrado = mostrarSiguiente ? nivelActual + 1 : nivelActual
        imprimirTextoJuego(nombreElementoAstillero(posicionMenu), 4, 90, COLOR_AMARILLO)
        imprimirDerecha(Textos.t(325) + nivelActual + (instaladoAhora ? Textos.t(326)
            : (mostrarSiguiente ? ">" + nivelMostrado : Textos.t(327))), 157, 90, COLOR_TEXTO)
        let comparacion = resumenNivelMejora(numeroResalte, nivelActual)
        if (mostrarSiguiente) comparacion += " > " + resumenNivelMejora(numeroResalte, nivelMostrado)
        imprimirTextoJuego(textoCortoPantalla(comparacion, 18), 4, 99, COLOR_TENUE)
        if (mostrarSiguiente) imprimirDerecha(costeAstillero(posicionMenu) + Textos.t(319), 157, 99,
            costeAstillero(posicionMenu) <= creditos ? COLOR_AMARILLO : COLOR_ROJO)
    } else if (posicionMenu == 0) {
        imprimirTextoJuego(Textos.t(328) + combustible + "/" + combustibleMax(), 4, 90, COLOR_AMARILLO)
        imprimirTextoJuego(Textos.t(329), 4, 99, COLOR_TENUE)
        imprimirDerecha(costeAstillero(posicionMenu) + Textos.t(319), 157, 99,
            costeAstillero(posicionMenu) <= creditos ? COLOR_AMARILLO : COLOR_ROJO)
    } else {
        imprimirTextoJuego(Textos.t(330) + casco + "/" + cascoMax(), 4, 90, COLOR_AMARILLO)
        imprimirTextoJuego(Textos.t(331), 4, 99, COLOR_TENUE)
        imprimirDerecha(costeAstillero(posicionMenu) + Textos.t(319), 157, 99,
            costeAstillero(posicionMenu) <= creditos ? COLOR_AMARILLO : COLOR_ROJO)
    }
    if (confirmacionAbierta) dibujarCuadroConfirmacion(naveElegida
        ? (navePropia(vistaRolAstillero) ? Textos.t(332) : Textos.t(333))
        : Textos.t(334), costeAstillero(posicionMenu))
    else if (naveElegida) dibujarPie(Textos.t(335), Textos.t(298))
    else if (identidadElegida) dibujarPie(Textos.t(336), Textos.t(298))
    else dibujarPie(Textos.t(337), Textos.t(298))
}

function dibujarCuadroConfirmacion(accion: string, coste: number): void {
    screen.fillRect(0, 87, 160, 21, COLOR_FONDO)
    screen.drawRect(0, 87, 160, 21, COLOR_AMARILLO)
    imprimirTextoJuego(accion + Textos.t(338), 5, 90, COLOR_TEXTO)
    if (coste > 0) imprimirDerecha(coste + Textos.t(319), 155, 90, COLOR_AMARILLO)
    imprimirTextoJuego(Textos.t(339), 5, 99, COLOR_VERDE)
    imprimirDerecha(Textos.t(340), 155, 99, COLOR_TENUE)
}

function dibujarMisiones(): void {
    dibujarCabecera(Textos.t(248))
    if (claseMision != ClaseMision.Ninguna) {
        let origen = fuenteMision == 2 ? Textos.t(341) : (fuenteMision == 1 ? Textos.t(342)
            : (fuenteMision == 3 ? Textos.t(343) : Textos.t(200)))
        // Una misión de campaña muestra el título de su etapa y, en la línea de la descripción de la variante, su
        // informe (las líneas más largas se desplazan).
        imprimirTextoJuego(origen + ": " + (fuenteMision == 1 ? tituloAventura(etapaAventura)
            : etiquetaMision(claseMision)), 6, 18, fuenteMision > 0 ? COLOR_AMARILLO : COLOR_TEXTO)
        imprimirTextoJuego(Textos.t(344) + nombreVarianteMision(claseMision, varianteMision), 6, 29, COLOR_CIAN)
        imprimirTextoJuego(Textos.t(345) + NOMBRES_MUNDO[objetivoMision] + Textos.t(346) + plazoMision, 6, 40,
            plazoMision < diaJuego ? COLOR_ROJO : COLOR_VERDE)
        imprimirTextoJuego(Textos.t(347) + pagoMision + Textos.t(319), 6, 51, COLOR_AMARILLO)
        if (claseMision == ClaseMision.Entrega) imprimirTextoJuego(Textos.t(274) +
            Textos.t(NOMBRES_MERCANCIA[mercanciaMision]) + Textos.t(348) + cantidadMision, 6, 62, COLOR_NARANJA)
        if (claseMision == ClaseMision.Caza)
            imprimirTextoJuego(Textos.t(349) + avanceMision + "/" + cantidadMision, 6, 62, COLOR_ROJO)
        if (claseMision == ClaseMision.Rescate)
            imprimirTextoJuego(avanceMision > 0 ? Textos.t(350) : Textos.t(351), 6, 62, COLOR_VERDE)
        imprimirTextoJuego(textoCortoPantalla(fuenteMision == 1 ? informeAventura(etapaAventura)
            : detalleVarianteMision(claseMision, varianteMision), 25), 6, 75, COLOR_TENUE)
        if (confirmacionAbierta) dibujarCuadroConfirmacion(Textos.t(352), 0)
        else dibujarPie(Textos.t(353), Textos.t(298))
        return
    }
    if (posicionMenu < inicioLista) inicioLista = posicionMenu
    if (posicionMenu >= inicioLista + 3) inicioLista = posicionMenu - 2
    for (let fila = 0; fila < 3; fila++) {
        let ranura = inicioLista + fila
        if (ranura >= CANTIDAD_OFERTAS_MISION) break
        let y = 17 + fila * 30
        let origen = fuenteOfertaMision(ranura)
        if (ranura == posicionMenu) screen.fillRect(2, y - 1, 156, 28, COLOR_MORADO)
        if (origen > 0)
            screen.fillRect(2, y - 1, 3, 28, origen == 2 ? COLOR_AMARILLO :
                (origen == 3 ? COLOR_MORADO : COLOR_CIAN))
        let clase = claseOfertaMision(ranura)
        let objetivo = objetivoOfertaMision(ranura)
        let prefijo = origen == 2 ? Textos.t(354)
            : (origen == 1 ? Textos.t(355) : (origen == 3 ? Textos.t(356) : ""))
        // La oferta de campaña nombra su etapa; igual que en el menú del hangar, solo la fila elegida desplaza
        // una línea larga.
        let titular = prefijo +
            (origen == 1 ? tituloAventura(etapaAventura) : etiquetaMision(clase)) + " > " +
            NOMBRES_MUNDO[objetivo]
        imprimirTextoJuego(ranura == posicionMenu ? titular : titular.substr(0, 25), 7, y,
            origen > 0 ? COLOR_AMARILLO : COLOR_TEXTO)
        let detalle = ""
        if (clase == ClaseMision.Entrega) detalle = Textos.t(NOMBRES_MERCANCIA[mercanciaOfertaMision(ranura)]) +
            Textos.t(348) + cantidadOfertaMision(ranura)
        else if (clase == ClaseMision.Caza) detalle = Textos.t(357) + cantidadOfertaMision(ranura)
        else detalle = Textos.t(358) + cantidadOfertaMision(ranura)
        detalle += " " + nombreVarianteMision(clase, varianteOfertaMision(ranura))
        // Sobre la selección morada, la línea de información se dibuja en el color del texto (el rojo se leía mal).
        imprimirTextoJuego(textoCortoPantalla(detalle, 24), 7, y + 9,
            ranura == posicionMenu ? COLOR_TEXTO : (clase == ClaseMision.Caza ? COLOR_ROJO : COLOR_CIAN))
        let pagoMostrado = ranura == posicionMenu
            ? pagoMisionNegociada(pagoOfertaMision(ranura), negociacionMision)
            : pagoOfertaMision(ranura)
        let regateo = ranura == posicionMenu && negociacionMision > 0 ?
            Textos.t(359) + negociacionMision : ""
        imprimirTextoJuego(pagoMostrado + Textos.t(319) + regateo +
            Textos.t(360) + plazoOfertaMision(ranura),
            7, y + 18, COLOR_VERDE)
    }
    screen.fillRect(158, 17 + Math.idiv(posicionMenu * 78, CANTIDAD_OFERTAS_MISION), 2, 12, COLOR_AMARILLO)
    dibujarPie(Textos.t(361), Textos.t(298))
}

function mapaX(mundo: number): number {
    return 5 + Math.idiv(MUNDO_X[mundo] * 148, 160)
}

function mapaY(mundo: number): number {
    return 16 + Math.idiv(MUNDO_Y[mundo] * 49, 110)
}

function dibujarMapaEstelar(): void {
    dibujarCabecera(Textos.t(249))
    // Las rutas comerciales fijas permiten ver de un vistazo los grupos y los trayectos largos.
    for (let i = 0; i < CANTIDAD_MUNDOS_PUBLICOS; i++) {
        if (i % 6 > 0 && mundoVisible(i - 1) && mundoVisible(i))
            screen.drawLine(mapaX(i - 1), mapaY(i - 1), mapaX(i), mapaY(i), COLOR_SOMBRA)
        if (i >= 6 && mundoVisible(i - 6) && mundoVisible(i))
            screen.drawLine(mapaX(i - 6), mapaY(i - 6), mapaX(i), mapaY(i), COLOR_SOMBRA)
    }
    if (claseMision != ClaseMision.Ninguna) {
        screen.drawLine(mapaX(mundoActual), mapaY(mundoActual), mapaX(objetivoMision), mapaY(objetivoMision),
            COLOR_ROJO)
    }
    if (objetivoRutaUltima != mundoCursorMapa) {
        planearRutaHasta(mundoCursorMapa)
        objetivoRutaUltima = mundoCursorMapa
    }
    let desdeRuta = mundoEnRuta(0)
    for (let salto = 0; salto < cantidadSaltosRuta(); salto++) {
        let aRuta = mundoEnRuta(salto + 1)
        screen.drawLine(mapaX(desdeRuta), mapaY(desdeRuta),
            mapaX(aRuta), mapaY(aRuta), COLOR_CIAN)
        desdeRuta = aRuta
    }
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) {
        if (!mundoVisible(i)) continue
        let x = mapaX(i)
        let y = mapaY(i)
        let color = puedeLlegarMundo(i) ? COLOR_CIAN : COLOR_TENUE
        if (i == mundoActual) color = COLOR_VERDE
        screen.fillRect(x - 1, y - 1, 3, 3, color)
        if (i == mundoCursorMapa) screen.drawRect(x - 3, y - 3, 7, 7, COLOR_AMARILLO)
        if (claseMision != ClaseMision.Ninguna && i == objetivoMision) {
            screen.drawLine(x - 4, y, x, y - 4, COLOR_ROJO)
            screen.drawLine(x, y - 4, x + 4, y, COLOR_ROJO)
            screen.drawLine(x + 4, y, x, y + 4, COLOR_ROJO)
            screen.drawLine(x, y + 4, x - 4, y, COLOR_ROJO)
        }
    }
    screen.fillRect(0, 69, 160, 39, COLOR_FONDO)
    screen.drawLine(0, 69, 159, 69, COLOR_CIAN)
    let coste = costeSalto(mundoActual, mundoCursorMapa)
    let textoSalto = cantidadSaltosRuta() > 0 ? Textos.t(282) + cantidadSaltosRuta() +
        Textos.t(362) + costeCombustibleRuta()
        : Textos.t(363) + coste
    imprimirTextoJuego(textoCortoPantalla(NOMBRES_MUNDO[mundoCursorMapa] + textoSalto + " " +
        Textos.t(NOMBRES_ECONOMIA[ECONOMIA_MUNDO[mundoCursorMapa]]), 22),
        3, 72, mundoCursorMapa == mundoActual ? COLOR_TENUE : COLOR_TEXTO)
    imprimirDerecha(Textos.t(NOMBRES_PELIGRO[peligroMundoEficaz(mundoCursorMapa)]), 157, 72,
        peligroMundoEficaz(mundoCursorMapa) >= 2 ? COLOR_ROJO : COLOR_AMARILLO)
    if (mejoras[MEJORA_ESCANER] > 0) {
        imprimirTextoJuego(
            textoCortoPantalla(nombreRasgoMundo(mundoCursorMapa) + ": " + detalleRasgoMundo(mundoCursorMapa),
            26), 3, 81, COLOR_VERDE)
        let lineaSuceso = sucesoMercadoActivoEn(mundoCursorMapa)
            ? nombreSucesoMercado() + " " + Textos.t(NOMBRES_MERCANCIA[mercanciaSucesoMercado]) : Textos.t(364)
        imprimirTextoJuego(textoCortoPantalla(Textos.t(365) + lineaSuceso, 26), 3, 90,
            sucesoMercadoActivoEn(mundoCursorMapa) ? COLOR_AMARILLO : COLOR_TENUE)
        if (mercadoConocido(mundoCursorMapa)) {
            let mercanciaConocida = mercanciaMercadoConocido(mundoCursorMapa)
            let tendenciaConocida = tendenciaMercadoConocido(mundoCursorMapa)
            let flechaConocida = tendenciaConocida > 0 ? "+" : (tendenciaConocida < 0 ? "-" : "=")
            imprimirTextoJuego(textoCortoPantalla(Textos.t(366) + edadMercadoConocido(mundoCursorMapa) + " " +
                Textos.t(NOMBRES_MERCANCIA[mercanciaConocida]) + " " + compraMercadoConocido(mundoCursorMapa) + "/" +
                ventaMercadoConocido(mundoCursorMapa) + flechaConocida, 26), 3, 99, COLOR_CIAN)
        } else if (mejoras[MEJORA_ESCANER] > 1) {
            let mejorMercancia = mejorMercanciaComercio(mundoCursorMapa)
            let margen =
                precioEnMundo(mundoCursorMapa, mejorMercancia, false) - precioCompra(mejorMercancia)
            imprimirTextoJuego(Textos.t(367) + Textos.t(NOMBRES_MERCANCIA[mejorMercancia]) + " " +
                (margen >= 0 ? "+" : "") + margen + Textos.t(319), 3, 99, margen > 0 ? COLOR_CIAN : COLOR_ROJO)
        } else {
            imprimirTextoJuego(Textos.t(368), 3, 99, COLOR_TENUE)
        }
    } else {
        imprimirTextoJuego(textoCortoPantalla(Textos.t(369), 26), 3, 83, COLOR_TENUE)
    }
    dibujarPie(Textos.t(370), Textos.t(298))
}

function nombrePaginaEstado(): string {
    if (paginaEstado == ESTADO_FACCIONES) return Textos.t(251)
    if (paginaEstado == ESTADO_DIARIO) return Textos.t(252)
    if (paginaEstado == ESTADO_LOGROS) return Textos.t(371)
    if (paginaEstado == ESTADO_OPCIONES) return Textos.t(265)
    if (paginaEstado == ESTADO_HARDWARE) return Textos.t(266)
    if (paginaEstado == ESTADO_DESARROLLADOR) return Textos.t(372)
    return Textos.t(373)
}

function nombreModuloPantalla(modulo: number): string {
    if (modulo == ModuloNave.Motor) return Textos.t(115)
    if (modulo == ModuloNave.Escaner) return Textos.t(116)
    if (modulo == ModuloNave.Armas) return Textos.t(117)
    return Textos.t(118)
}

function finalParaFaccionPantalla(faccion: number): ClaseFinal {
    if (faccion == Faccion.Gremio) return ClaseFinal.CoronaComercial
    if (faccion == Faccion.Cientificos) return ClaseFinal.Explorador
    if (faccion == Faccion.Forajidos) return ClaseFinal.Forajido
    return ClaseFinal.Union
}

function faccionMisionPantalla(clase: ClaseMision, variante: VarianteMision): Faccion {
    if (variante == VarianteMision.Ilegal) return Faccion.Forajidos
    if (clase == ClaseMision.Entrega) return Faccion.Gremio
    if (clase == ClaseMision.Rescate) return Faccion.Cientificos
    return Faccion.Union
}

function dibujarPaginaEstadoNave(): void {
    imprimirTextoJuego(nombrePantallaNave(rolNave) + " / " +
        nombrePinturaNave(rolNave), 6, 17, colorPinturaNave())
    imprimirTextoJuego(Textos.t(317) + nombreRango() + Textos.t(374) + puntosJuego(), 6, 28, COLOR_AMARILLO)
    imprimirTextoJuego(Textos.t(276) + casco + "/" + cascoMax() + Textos.t(375) + escudoMax(), 6, 39, COLOR_VERDE)
    imprimirTextoJuego(Textos.t(376) + combustible + "/" + combustibleMax() + Textos.t(377) + unidadesCarga() + "/" +
        capacidadCarga(), 6, 50, COLOR_CIAN)
    imprimirTextoJuego(Textos.t(378) + nombreArma(armaActiva) + Textos.t(379) + energiaArma, 6, 61,
        COLOR_NARANJA)
    imprimirTextoJuego(Textos.t(380) + misiles + Textos.t(381) + minas, 6, 72, COLOR_TEXTO)
    let textoDano = Textos.t(382)
    for (let i = 0; i < danoModulo.length; i++) {
        if (danoModulo[i] > 0) textoDano = nombreModuloPantalla(i) + " " + nombreDanoModulo(i)
    }
    imprimirTextoJuego(textoCortoPantalla(textoDano, 25), 6, 83, textoDano == Textos.t(382) ? COLOR_VERDE : COLOR_ROJO)
    let perdida = mejoras[MEJORA_SEGURO] == 0 ? Textos.t(383)
        : (mejoras[MEJORA_SEGURO] == 1 ? Textos.t(384) : Textos.t(385))
    imprimirTextoJuego(textoCortoPantalla(Textos.t(386) + perdida, 25), 6, 94, COLOR_AMARILLO)
}

function dibujarPaginaFaccion(): void {
    for (let i = 0; i < CANTIDAD_FACCIONES; i++) {
        let y = 19 + i * 17
        if (i == cursorEstado) dibujarEleccion(y, 11)
        let reputacion = reputacionFaccion(i)
        imprimirTextoJuego(nombreFaccion(i), 7, y, i == faccionDominante() ? COLOR_AMARILLO : COLOR_TEXTO)
        imprimirDerecha((reputacion >= 0 ? "+" : "") + reputacion, 153, y, reputacion >= 0 ? COLOR_VERDE : COLOR_ROJO)
        let ancho = Math.min(50, Math.abs(reputacion))
        screen.fillRect(84, y + 7, ancho, 2, reputacion >= 0 ? COLOR_VERDE : COLOR_ROJO)
    }
    if (aventuraCumplida()) {
        let finalElegido = finalParaFaccionPantalla(cursorEstado)
        let textoFinal = eleccionFinal == ClaseFinal.Ninguna ? Textos.t(387) + nombreFinal(finalElegido)
            : Textos.t(388) + nombreFinal(eleccionFinal)
        let colorFinal = eleccionFinal != ClaseFinal.Ninguna ? COLOR_VERDE
            : (finalDisponible(finalElegido) ? COLOR_AMARILLO : COLOR_ROJO)
        imprimirTextoJuego(textoCortoPantalla(textoFinal, 25), 6, 91, colorFinal)
    } else imprimirTextoJuego(Textos.t(389) + etapaAventura + "/" + CANTIDAD_MISIONES_AVENTURA, 6, 91, COLOR_TENUE)
}

function dibujarPaginaDiario(): void {
    imprimirTextoJuego(Textos.t(390) + saltosTotal, 6, 17, COLOR_CIAN)
    imprimirTextoJuego(Textos.t(391) + entregasTotal + Textos.t(392) + rescatesTotal, 6, 28, COLOR_VERDE)
    imprimirTextoJuego(Textos.t(393) + victoriasTotal + Textos.t(394) + victoriasJefe, 6, 39, COLOR_ROJO)
    imprimirTextoJuego(Textos.t(395) + misionesCumplidas + Textos.t(396) + misionesFalladas, 6, 50, COLOR_TEXTO)
    imprimirTextoJuego(Textos.t(397) + creditosGanadosTotal + Textos.t(319), 6, 61, COLOR_AMARILLO)
    imprimirTextoJuego(Textos.t(398) + gananciaComercioMayor, 6, 72, COLOR_VERDE)
    imprimirTextoJuego(Textos.t(399) + cantidadMundosVisitadosPantalla() + "/" + CANTIDAD_MUNDOS + Textos.t(400) +
        tratosMercadoNegro + Textos.t(401) + nivelPartidaNuevaPlus, 6, 83, COLOR_MORADO)
    let textoArtefacto = tieneArtefacto(cursorEstado) ? nombreArtefacto(cursorEstado) : Textos.t(402)
    imprimirTextoJuego(Textos.t(403) + (cursorEstado + 1) + "/" + CANTIDAD_ARTEFACTOS + " " +
        textoCortoPantalla(textoArtefacto, 13), 6, 94, tieneArtefacto(cursorEstado) ? COLOR_AMARILLO : COLOR_TENUE)
}

function dibujarPaginaLogro(): void {
    if (cursorLogro < inicioLista) inicioLista = cursorLogro
    if (cursorLogro >= inicioLista + 5) inicioLista = cursorLogro - 4
    for (let fila = 0; fila < 5; fila++) {
        let numero = inicioLista + fila
        if (numero >= CANTIDAD_LOGROS) break
        let y = 17 + fila * 17
        if (numero == cursorLogro) dibujarEleccion(y, 14)
        let desbloqueado = logroDesbloqueado(numero)
        imprimirTextoJuego((desbloqueado ? "* " : Textos.t(404)) + nombreLogro(numero), 6, y,
            desbloqueado ? COLOR_AMARILLO : COLOR_TENUE)
        imprimirTextoJuego(textoCortoPantalla(desbloqueado ? detalleLogro(numero) : Textos.t(405), 25), 12, y + 8,
            desbloqueado ? COLOR_TEXTO : COLOR_TENUE)
    }
    screen.fillRect(157, 17 + Math.idiv(cursorLogro * 78, CANTIDAD_LOGROS), 2, 10, COLOR_AMARILLO)
}

function textoOpcion(posicion: number): string {
    if (posicion == 0) return Textos.t(406) + nombreVelocidadTexto()
    if (posicion == 1) return Textos.t(407) + textoSiNo(contrasteAlto)
    if (posicion == 2) return Textos.t(408) + textoSiNo(sacudidaCamara)
    if (posicion == 3) return Textos.t(258) + nombreModoIntro()
    if (posicion == 4) return Textos.t(262) + nombreEscalonSonido()
    if (posicion == 5) return Textos.t(263) + nombreDensidadEfecto()
    if (posicion == 6) return Textos.t(409)
    return Textos.t(410)
}

function dibujarPaginaOpciones(): void {
    if (cursorEstado < inicioLista) inicioLista = cursorEstado
    if (cursorEstado >= inicioLista + 7) inicioLista = cursorEstado - 6
    for (let fila = 0; fila < 7; fila++) {
        let numero = inicioLista + fila
        if (numero >= 8) break
        let y = 17 + fila * 12
        if (numero == cursorEstado) dibujarEleccion(y, 10)
        let activado = numero != 7 || existePartidaManual()
        imprimirTextoJuego(textoCortoPantalla(textoOpcion(numero), 25), 6, y, activado ? COLOR_TEXTO : COLOR_TENUE)
    }
    imprimirTextoJuego(Textos.t(411), 6, 99, COLOR_TENUE)
}

function dibujarPaginaHardware(): void {
    imprimirTextoJuego(Textos.t(412), 6, 17, COLOR_AMARILLO)
    screen.drawRect(62, 30, 37, 43, COLOR_METAL)
    screen.fillRect(76, 34, 9, 9, controller.up.isPressed() ? COLOR_VERDE : COLOR_TENUE)
    screen.fillRect(76, 60, 9, 9, controller.down.isPressed() ? COLOR_VERDE : COLOR_TENUE)
    screen.fillRect(65, 47, 9, 9, controller.left.isPressed() ? COLOR_VERDE : COLOR_TENUE)
    screen.fillRect(87, 47, 9, 9, controller.right.isPressed() ? COLOR_VERDE : COLOR_TENUE)
    screen.fillCircle(119, 43, 7, controller.A.isPressed() ? COLOR_AMARILLO : COLOR_ROJO)
    screen.fillCircle(137, 61, 7, controller.B.isPressed() ? COLOR_AMARILLO : COLOR_AZUL)
    for (let i = 0; i < 16; i++) screen.fillRect(4 + i * 9, 78, 8, 8, i)
    imprimirTextoJuego(bHardwareProbado ? Textos.t(413) : Textos.t(414), bHardwareProbado ? 10 : 27, 92,
        COLOR_TEXTO)
    imprimirTextoJuego(Textos.t(415) + (tienePartida ? Textos.t(232) : Textos.t(416)) + Textos.t(417) +
        (existePartidaManual() ? Textos.t(232) : Textos.t(416)), 9, 102, COLOR_VERDE)
}

function dibujarPaginaDesarrollador(): void {
    let estadisticas = control.gcStats()
    imprimirTextoJuego(Textos.t(418) + fpsPantalla, 6, 18, fpsPantalla >= 25 ? COLOR_VERDE : COLOR_ROJO)
    imprimirTextoJuego(Textos.t(419) + control.ramSize(), 6, 31, COLOR_TEXTO)
    imprimirTextoJuego(Textos.t(420) + bytesLibresUltimoPantalla, 6, 44, COLOR_CIAN)
    imprimirTextoJuego(Textos.t(421) + bytesLibresMinPantalla, 6, 57, COLOR_AMARILLO)
    imprimirTextoJuego(Textos.t(422) + (estadisticas ? estadisticas.numGC : 0), 6, 70, COLOR_TENUE)
    imprimirTextoJuego(Textos.t(423) + diaJuego + "/" + mundoActual, 6, 83, COLOR_TEXTO)
    imprimirTextoJuego(Textos.t(424) + textoSiNo(modoDesarrollador), 6, 96,
        modoDesarrollador ? COLOR_VERDE : COLOR_TENUE)
}

function dibujarEstado(): void {
    dibujarCabecera(nombrePaginaEstado())
    if (paginaEstado == ESTADO_NAVE) dibujarPaginaEstadoNave()
    else if (paginaEstado == ESTADO_FACCIONES) dibujarPaginaFaccion()
    else if (paginaEstado == ESTADO_DIARIO) dibujarPaginaDiario()
    else if (paginaEstado == ESTADO_LOGROS) dibujarPaginaLogro()
    else if (paginaEstado == ESTADO_OPCIONES) dibujarPaginaOpciones()
    else if (paginaEstado == ESTADO_HARDWARE) dibujarPaginaHardware()
    else dibujarPaginaDesarrollador()
    if (paginaEstado == ESTADO_DESARROLLADOR) dibujarPie(Textos.t(425), Textos.t(298))
    else if (paginaEstado == ESTADO_DIARIO) dibujarPie(Textos.t(426), Textos.t(298))
    else if (paginaEstado == ESTADO_LOGROS) dibujarPie(Textos.t(427), Textos.t(298))
    else if (paginaEstado != ESTADO_HARDWARE) dibujarPie(Textos.t(428), Textos.t(298))
}

function dibujarAviso(): void {
    let clave = avisoLinea1 + "|" + avisoLinea2 + "|" + avisoLinea3
    if (clave != claveDibujoAviso) {
        claveDibujoAviso = clave
        revelacionAvisoIniciadaMs = game.runtime()
    }
    let inicio2 = avisoLinea1.length
    let inicio3 = inicio2 + avisoLinea2.length
    screen.fill(COLOR_FONDO)
    screen.drawRect(3, 15, 154, 90, COLOR_CIAN)
    let y = imprimirTextoAjustado(parteLineaAviso(avisoLinea1, 0), 8, 21, 24, COLOR_AMARILLO) + 3
    y = imprimirTextoAjustado(parteLineaAviso(avisoLinea2, inicio2), 8, y, 24, COLOR_TEXTO) + 3
    imprimirTextoAjustado(parteLineaAviso(avisoLinea3, inicio3), 8, y, 24, COLOR_VERDE)
    imprimirTextoJuego(Textos.t(429), 55, 109, COLOR_TENUE)
}

function dibujarBorrarPartida(): void {
    screen.fill(COLOR_FONDO)
    screen.drawRect(12, 27, 136, 65, COLOR_ROJO)
    // El cuadro mide 136 píxeles de ancho. La pregunta de NUEVA PARTIDA + va centrada (x = 81 - 3 × longitud, como
    // mucho 23), así una pregunta larga queda dentro del cuadro. La otra pregunta empieza en x = 20.
    let pregunta = confirmarPartidaNuevaPlus ? Textos.t(430) : Textos.t(431)
    imprimirTextoJuego(pregunta, confirmarPartidaNuevaPlus ?
        Math.min(23, 81 - pregunta.length * 3) : 20, 39, COLOR_AMARILLO)
    imprimirTextoJuego(confirmarPartidaNuevaPlus ? Textos.t(432) : Textos.t(433),
        confirmarPartidaNuevaPlus ? 29 : 26, 55,
        confirmarPartidaNuevaPlus ? COLOR_VERDE : COLOR_ROJO)
    imprimirTextoJuego(Textos.t(434), 31, 75, COLOR_TEXTO)
}

function dibujarEscenaActual(): void {
    if (escenaActiva == NumeroEscena.Intro) dibujarIntro()
    else if (escenaActiva == NumeroEscena.Titulo) dibujarTitulo()
    else if (escenaActiva == NumeroEscena.Hangar) dibujarHangar()
    else if (escenaActiva == NumeroEscena.Mercado) dibujarMercado()
    else if (escenaActiva == NumeroEscena.Astillero) dibujarAstillero()
    else if (escenaActiva == NumeroEscena.Misiones) dibujarMisiones()
    else if (escenaActiva == NumeroEscena.MapaEstelar) dibujarMapaEstelar()
    else if (escenaActiva == NumeroEscena.Estado) dibujarEstado()
    else if (escenaActiva == NumeroEscena.Vuelo) dibujarVuelo()
    else if (escenaActiva == NumeroEscena.Aviso) dibujarAviso()
    else if (escenaActiva == NumeroEscena.BorradoPartida) dibujarBorrarPartida()
}

function ajustarCantidadComercio(diferencia: number): void {
    if (mercadoNegro && posicionMenu >= CANTIDAD_MERCANCIAS) {
        let numeroRareza = posicionMenu - CANTIDAD_MERCANCIAS
        cantidadTrato = Math.clamp(0 - cargaRara[numeroRareza], 0, cantidadTrato + diferencia)
        return
    }
    let compraUnidad = mercadoNegro ? precioCompraMercadoNegro(posicionMenu) : precioCompra(posicionMenu)
    let disponible = mercadoNegro ? 6 : existenciasMercado[posicionMenu]
    let compraMax = Math.min(disponible, capacidadCarga() - unidadesCarga())
    compraMax = Math.min(compraMax, Math.idiv(creditos, compraUnidad))
    let ventaMin = 0 - carga[posicionMenu]
    cantidadTrato = Math.clamp(ventaMin, compraMax, cantidadTrato + diferencia)
}

function aplicarComercio(): void {
    let mercancia = posicionMenu
    if (mercadoNegro && mercancia >= CANTIDAD_MERCANCIAS) {
        let numeroRareza = mercancia - CANTIDAD_MERCANCIAS
        let cantidad = Math.min(cargaRara[numeroRareza], 0 - cantidadTrato)
        if (cantidad > 0) {
            let ingresos = venderRareza(numeroRareza, cantidad)
            anotarComercioMercadoNegro(0)
            textoRespuestaMercado = Textos.t(435)
            colorRespuestaMercado = COLOR_MORADO
            respuestaMercadoHastaMs = game.runtime() + 3000
            tocarSonidoVenta()
        }
        tratoAbierto = false
        cantidadTrato = 0
        actualizarLogros()
        escribirPartida()
        return
    }
    if (cantidadTrato > 0) {
        let cantidad = cantidadTrato
        let precioUnidad = mercadoNegro ? precioCompraMercadoNegro(mercancia) : precioCompra(mercancia)
        let coste = cantidad * precioUnidad
        if (coste > creditos || (!mercadoNegro && cantidad > existenciasMercado[mercancia]) ||
            unidadesCarga() + cantidad > capacidadCarga()) return
        creditos -= coste
        carga[mercancia] += cantidad
        costeCarga[mercancia] += coste
        if (!mercadoNegro) existenciasMercado[mercancia] -= cantidad
        if (mercadoNegro) anotarComercioMercadoNegro(0)
        else aplicarInfluenciaComercio(mercancia, cantidad)
        textoRespuestaMercado = Textos.t(436) + Textos.t(NOMBRES_MERCANCIA[mercancia]) + Textos.t(348) + cantidad +
            " -" + coste
        colorRespuestaMercado = COLOR_VERDE
        respuestaMercadoHastaMs = game.runtime() + 2600
        tocarSonidoCompra()
    } else if (cantidadTrato < 0) {
        let cantidad = 0 - cantidadTrato
        if (cantidad > carga[mercancia]) return
        let unidadesAnteriores = carga[mercancia]
        let costeQuitado = unidadesAnteriores > 0 ? Math.idiv(costeCarga[mercancia] * cantidad, unidadesAnteriores) : 0
        let ingresos = cantidad * (mercadoNegro ? precioVentaMercadoNegro(mercancia) : precioVenta(mercancia))
        creditos += ingresos
        carga[mercancia] -= cantidad
        costeCarga[mercancia] -= costeQuitado
        if (carga[mercancia] == 0) costeCarga[mercancia] = 0
        if (!mercadoNegro) existenciasMercado[mercancia] = Math.min(99, existenciasMercado[mercancia] + cantidad)
        let ganancia = ingresos - costeQuitado
        if (ganancia > 0) gananciaComercio += ganancia
        if (mercadoNegro) anotarComercioMercadoNegro(ganancia)
        else {
            aplicarInfluenciaComercio(mercancia, 0 - cantidad)
            anotarGananciaComercio(ganancia)
        }
        textoRespuestaMercado = ganancia >= 0 ? Textos.t(437) + ganancia + Textos.t(319)
            : Textos.t(438) + ganancia + Textos.t(319)
        colorRespuestaMercado = ganancia >= 0 ? COLOR_VERDE : COLOR_ROJO
        respuestaMercadoHastaMs = game.runtime() + 3000
        tocarSonidoVenta()
    }
    tratoAbierto = false
    cantidadTrato = 0
    if (!mercadoNegro) recordarMercadoActual()
    actualizarLogros()
    escribirPartida()
}

function comprarElementoAstillero(): void {
    let coste = costeAstillero(posicionMenu)
    if (posicionMenu == POSICION_NAVE_ASTILLERO) {
        if (!rolNaveDesbloqueado(vistaRolAstillero)) {
            confirmacionAbierta = false
            mostrarAviso(Textos.t(439), Textos.t(317) + rangoNecesarioRolNave(vistaRolAstillero),
                nombreRolNave(vistaRolAstillero), NumeroEscena.Astillero)
            tocarSonidoError()
            return
        }
        if (!navePropia(vistaRolAstillero) && creditos < coste) {
            confirmacionAbierta = false
            mostrarAviso(Textos.t(440), Textos.t(441) + (coste - creditos) + Textos.t(319),
                Textos.t(315) + nombreRolNave(vistaRolAstillero), NumeroEscena.Astillero)
            tocarSonidoError()
            return
        }
        if (!comprarOElegirNave(vistaRolAstillero)) {
            confirmacionAbierta = false
            mostrarAviso(Textos.t(442), Textos.t(443), nombreRolNave(vistaRolAstillero),
                NumeroEscena.Astillero)
            tocarSonidoError()
            return
        }
        confirmacionAbierta = false
        numeroInstaladoAstillero = -1
        tocarSonidoCompra()
        escribirPartida()
        return
    }
    if (posicionMenu == POSICION_NOMBRE_ASTILLERO || posicionMenu == POSICION_PINTURA_ASTILLERO) return
    if (coste <= 0) return
    if (creditos < coste) {
        confirmacionAbierta = false
        mostrarAviso(Textos.t(440), Textos.t(441) + (coste - creditos) + Textos.t(319), "",
            NumeroEscena.Astillero)
        return
    }
    creditos -= coste
    if (posicionMenu == 0) combustible++
    else if (posicionMenu == 1) {
        casco = Math.min(cascoMax(), casco + 1)
        repararModulos()
    } else if (posicionMenu == POSICION_MISIL_ASTILLERO) misiles++
    else if (posicionMenu == POSICION_MINA_ASTILLERO) minas++
    else {
        let numero = posicionMenu - 2
        mejoras[numero]++
        if (numero == MEJORA_BLINDAJE) casco = Math.min(cascoMax(), casco + 3)
        if (numero == MEJORA_SALTO) combustible = Math.min(combustibleMax(), combustible + 1)
        numeroInstaladoAstillero = numero
    }
    confirmacionAbierta = false
    tocarSonidoCompra()
    escribirPartida()
}

function aceptarMision(ranura: number): void {
    let clase = claseOfertaMision(ranura)
    let cantidad = cantidadOfertaMision(ranura)
    let necesario = clase == ClaseMision.Caza ? 0 : cantidad
    if (unidadesCarga() + necesario > capacidadCarga()) {
        mostrarAviso(Textos.t(444), Textos.t(445), "", NumeroEscena.Misiones)
        return
    }
    let semillaOferta = semillaOfertaMision(ranura)
    if (negociacionMision > 0 && !exitoNegociacion(semillaOferta, negociacionMision)) {
        negociacionMision = 0
        cambiarReputacionFaccion(Faccion.Gremio, -1)
        mostrarAviso(Textos.t(446), Textos.t(447), Textos.t(448), NumeroEscena.Misiones)
        tocarSonidoError()
        return
    }
    // Primero hay que leer la oferta entera: las ofertas de campaña y las del día solo existen mientras no haya
    // ninguna misión activa.
    let fuenteOferta = fuenteOfertaMision(ranura)
    let objetivoOferta = objetivoOfertaMision(ranura)
    let plazoOferta = plazoOfertaMision(ranura)
    let pagoOferta = pagoMisionNegociada(pagoOfertaMision(ranura), negociacionMision)
    let mercanciaOferta = mercanciaOfertaMision(ranura)
    let varianteOferta = varianteOfertaMision(ranura)
    claseMision = clase
    origenMision = mundoActual
    objetivoMision = objetivoOferta
    plazoMision = plazoOferta
    pagoMision = pagoOferta
    mercanciaMision = mercanciaOferta
    cantidadMision = cantidad
    avanceMision = 0
    semillaMision = semillaOferta
    varianteMision = varianteOferta
    fuenteMision = fuenteOferta
    if (fuenteMision == 3) marcarMisionDiariaAceptada()
    if (fuenteMision == 2 && etapaTutorial < 2) etapaTutorial = 2
    let tituloAceptado = fuenteMision == 2 ? Textos.t(449) : (fuenteMision == 1 ? Textos.t(450)
        : (fuenteMision == 3 ? Textos.t(451) : Textos.t(452)))
    negociacionMision = 0
    mostrarAviso(tituloAceptado,
        fuenteMision == 1 ? tituloAventura(etapaAventura) : nombreVarianteMision(clase, varianteMision),
        Textos.t(345) + NOMBRES_MUNDO[objetivoMision], NumeroEscena.Hangar)
    tocarSonidoMision()
    escribirPartida()
}

function moverCursorMapa(dx: number, dy: number): void {
    let mejor = mundoCursorMapa
    let mejorPuntos = 99999
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) {
        if (i == mundoCursorMapa || !mundoVisible(i)) continue
        let vx = MUNDO_X[i] - MUNDO_X[mundoCursorMapa]
        let vy = MUNDO_Y[i] - MUNDO_Y[mundoCursorMapa]
        if (dx > 0 && vx <= 0) continue
        if (dx < 0 && vx >= 0) continue
        if (dy > 0 && vy <= 0) continue
        if (dy < 0 && vy >= 0) continue
        let principal = dx != 0 ? Math.abs(vx) : Math.abs(vy)
        let lado = dx != 0 ? Math.abs(vy) : Math.abs(vx)
        let puntos = principal + lado * 3
        if (puntos < mejorPuntos) {
            mejorPuntos = puntos
            mejor = i
        }
    }
    mundoCursorMapa = mejor
}

function gestionarDireccion(dx: number, dy: number): void {
    if (entradaBloqueada) return
    let posicionMenuAnterior = posicionMenu
    let cantidadTratoAnterior = cantidadTrato
    let mundoCursorMapaAnterior = mundoCursorMapa
    let rolAstilleroAnterior = vistaRolAstillero
    let modoJuegoAnterior = modoJuego
    let negociacionMisionAnterior = negociacionMision
    let paginaEstadoAnterior = paginaEstado
    let cursorEstadoAnterior = cursorEstado
    let cursorLogroAnterior = cursorLogro
    let sonidoDirecto = false
    if (escenaActiva == NumeroEscena.Titulo) {
        if (dy < 0) posicionMenu = Math.max(0, posicionMenu - 1)
        if (dy > 0) posicionMenu = Math.min(CANTIDAD_ELEMENTOS_TITULO - 1, posicionMenu + 1)
        if (posicionMenu == 1 && dx != 0) {
            cambiarModoIntro(dx < 0 ? -1 : 1)
        } else if (posicionMenu == 3 && dx != 0) {
            cambiarEscalonSonido(dx < 0 ? -1 : 1)
            tocarSonidoNavegar()
            sonidoDirecto = true
        } else if (posicionMenu == 4 && dx != 0) {
            cambiarDensidadEfecto(dx < 0 ? -1 : 1)
        } else if (posicionMenu == 5 && dx != 0) {
            if (puedeCambiarModoTitulo()) cambiarModoTitulo(dx < 0 ? -1 : 1)
            else {
                tocarSonidoError()
                sonidoDirecto = true
            }
        }
    } else if (escenaActiva == NumeroEscena.Hangar && !confirmacionAbierta) {
        if (dy < 0) posicionMenu = Math.max(0, posicionMenu - 1)
        if (dy > 0) posicionMenu = Math.min(ELEMENTOS_HANGAR.length - 1, posicionMenu + 1)
    } else if (escenaActiva == NumeroEscena.Mercado) {
        if (tratoAbierto) {
            if (dx < 0) ajustarCantidadComercio(-1)
            if (dx > 0) ajustarCantidadComercio(1)
            if (dy < 0) ajustarCantidadComercio(5)
            if (dy > 0) ajustarCantidadComercio(-5)
        } else {
            if (dy < 0) posicionMenu = Math.max(0, posicionMenu - 1)
            if (dy > 0)
                posicionMenu =
                Math.min((mercadoNegro ? CANTIDAD_MERCANCIAS + CANTIDAD_RAREZAS : CANTIDAD_MERCANCIAS) - 1,
                posicionMenu + 1)
        }
    } else if (escenaActiva == NumeroEscena.Astillero && !confirmacionAbierta) {
        let posicionAnterior = posicionMenu
        if (dy < 0) posicionMenu = Math.max(0, posicionMenu - 1)
        if (dy > 0) posicionMenu = Math.min(CANTIDAD_ELEMENTOS_ASTILLERO - 1, posicionMenu + 1)
        if (posicionMenu != posicionAnterior) numeroInstaladoAstillero = -1
        if (posicionMenu == POSICION_NAVE_ASTILLERO && dx != 0) cambiarRolAstillero(dx < 0 ? -1 : 1)
        else if (posicionMenu == POSICION_NOMBRE_ASTILLERO && dx != 0) {
            cambiarNombreNave(rolNave, dx < 0 ? -1 : 1)
            escribirPartida()
        } else if (posicionMenu == POSICION_PINTURA_ASTILLERO && dx != 0) {
            cambiarPinturaNave(rolNave, dx < 0 ? -1 : 1)
            escribirPartida()
        }
    } else if (escenaActiva == NumeroEscena.Misiones && claseMision == ClaseMision.Ninguna) {
        if (dy < 0) posicionMenu = Math.max(0, posicionMenu - 1)
        if (dy > 0) posicionMenu = Math.min(CANTIDAD_OFERTAS_MISION - 1, posicionMenu + 1)
        if (dx < 0) negociacionMision = Math.max(0, negociacionMision - 1)
        if (dx > 0) negociacionMision = Math.min(2, negociacionMision + 1)
    } else if (escenaActiva == NumeroEscena.MapaEstelar) {
        moverCursorMapa(dx, dy)
        objetivoRutaUltima = -1
    } else if (escenaActiva == NumeroEscena.Estado) {
        if (paginaEstado == ESTADO_HARDWARE) {
            // Aquí no se hace nada: todas las direcciones siguen activas en la página de pruebas, para que los
            // indicadores en vivo del GameKit funcionen.
        } else if (dy != 0) {
            if (paginaEstado == ESTADO_FACCIONES)
                cursorEstado = Math.clamp(0, CANTIDAD_FACCIONES - 1, cursorEstado + dy)
            else if (paginaEstado == ESTADO_DIARIO)
                cursorEstado = Math.clamp(0, CANTIDAD_ARTEFACTOS - 1, cursorEstado + dy)
            else if (paginaEstado == ESTADO_LOGROS)
                cursorLogro = Math.clamp(0, CANTIDAD_LOGROS - 1, cursorLogro + dy)
            else if (paginaEstado == ESTADO_OPCIONES) cursorEstado = Math.clamp(0, 7, cursorEstado + dy)
        } else if (dx != 0) {
            paginaEstado = (paginaEstado + dx + ESTADO_CANTIDAD_PAGINAS) % ESTADO_CANTIDAD_PAGINAS
            cursorEstado = 0
            inicioLista = 0
            if (paginaEstado == ESTADO_HARDWARE) bHardwareProbado = false
        }
    }
    if (!sonidoDirecto && (posicionMenu != posicionMenuAnterior || cantidadTrato != cantidadTratoAnterior ||
        mundoCursorMapa != mundoCursorMapaAnterior || vistaRolAstillero != rolAstilleroAnterior ||
        modoJuego != modoJuegoAnterior || negociacionMision != negociacionMisionAnterior ||
        paginaEstado != paginaEstadoAnterior || cursorEstado != cursorEstadoAnterior ||
        cursorLogro != cursorLogroAnterior)) tocarSonidoNavegar()
}

function gestionarA(): void {
    if (entradaBloqueada) return
    if (escenaActiva == NumeroEscena.Intro) terminarIntro()
    else if (escenaActiva == NumeroEscena.Titulo) {
        if (posicionMenu == 0) {
            if (!tienePartida) {
                let modoElegido = modoJuego
                iniciarPartidaNueva()
                modoJuego = modoElegido
                escribirPartida()
            }
            if (enTransito != 0) reanudarViaje()
            else ponerEscena(NumeroEscena.Hangar)
        } else if (posicionMenu == 1) {
            cambiarModoIntro(1)
        } else if (posicionMenu == 2) {
            iniciarIntro()
        } else if (posicionMenu == 3) {
            cambiarEscalonSonido(1)
            tocarSonidoNavegar()
        } else if (posicionMenu == 4) {
            cambiarDensidadEfecto(1)
            tocarSonidoNavegar()
        } else if (posicionMenu == 5) {
            if (puedeCambiarModoTitulo()) {
                cambiarModoTitulo(1)
                tocarSonidoNavegar()
            } else {
                mostrarAviso(Textos.t(453), Textos.t(143), nombreModoJuego(modoJuego), NumeroEscena.Titulo)
                tocarSonidoError()
            }
        } else if (posicionMenu == 6) {
            paginaEstado = ESTADO_OPCIONES
            cursorEstado = 0
            escenaVueltaEstado = NumeroEscena.Titulo
            ponerEscena(NumeroEscena.Estado)
        } else if (posicionMenu == 7) {
            paginaEstado = ESTADO_HARDWARE
            cursorEstado = 0
            bHardwareProbado = false
            escenaVueltaEstado = NumeroEscena.Titulo
            ponerEscena(NumeroEscena.Estado)
        } else if (posicionMenu == 8 && puedeIniciarPartidaNuevaPlus()) {
            confirmarPartidaNuevaPlus = true
            ponerEscena(NumeroEscena.BorradoPartida)
        } else if (posicionMenu == 9 && tienePartida) {
            confirmarPartidaNuevaPlus = false
            ponerEscena(NumeroEscena.BorradoPartida)
        } else tocarSonidoError()
    } else if (escenaActiva == NumeroEscena.Hangar) {
        if (confirmacionAbierta) saltarEntregaGuiada()
        else if (posicionMenu == 0) {
            mercadoNegro = false
            recordarMercadoActual()
            ponerEscena(NumeroEscena.Mercado)
        } else if (posicionMenu == 1) {
            if (!mercadoNegroDisponible()) {
                mostrarAviso(Textos.t(454), Textos.t(455), Textos.t(456), NumeroEscena.Hangar)
                tocarSonidoError()
            } else {
                mercadoNegro = true
                ponerEscena(NumeroEscena.Mercado)
            }
        } else if (posicionMenu == 2) {
            numeroInstaladoAstillero = -1
            vistaRolAstillero = rolNave
            ponerEscena(NumeroEscena.Astillero)
        } else if (posicionMenu == 3) {
            negociacionMision = 0
            ponerEscena(NumeroEscena.Misiones)
        } else if (posicionMenu == 4) {
            objetivoRutaAnteriorMapa = cantidadSaltosRuta() > 0 ? mundoEnRuta(cantidadSaltosRuta()) : mundoDestino
            mundoCursorMapa = objetivoRutaAnteriorMapa
            objetivoRutaUltima = -1
            ponerEscena(NumeroEscena.MapaEstelar)
        } else if (posicionMenu == 5) {
            paginaEstado = ESTADO_NAVE
            cursorEstado = 0
            escenaVueltaEstado = NumeroEscena.Hangar
            ponerEscena(NumeroEscena.Estado)
        } else if (posicionMenu == 6) {
            paginaEstado = ESTADO_FACCIONES
            cursorEstado = faccionDominante()
            escenaVueltaEstado = NumeroEscena.Hangar
            ponerEscena(NumeroEscena.Estado)
        } else if (posicionMenu == 7) {
            paginaEstado = ESTADO_DIARIO
            escenaVueltaEstado = NumeroEscena.Hangar
            ponerEscena(NumeroEscena.Estado)
        } else if (posicionMenu == 8) {
            paginaEstado = ESTADO_OPCIONES
            cursorEstado = 0
            escenaVueltaEstado = NumeroEscena.Hangar
            ponerEscena(NumeroEscena.Estado)
        }
        else if (mundoDestino != mundoActual) iniciarViaje()
        else tocarSonidoError()
    } else if (escenaActiva == NumeroEscena.Mercado) {
        if (tratoAbierto) aplicarComercio()
        else {
            tratoAbierto = true
            cantidadTrato = 0
            if (mercadoNegro && posicionMenu >= CANTIDAD_MERCANCIAS) {
                if (cargaRara[posicionMenu - CANTIDAD_MERCANCIAS] > 0) cantidadTrato = -1
            } else {
                let disponible = mercadoNegro ? 6 : existenciasMercado[posicionMenu]
                let compraUnidad = mercadoNegro ? precioCompraMercadoNegro(posicionMenu) : precioCompra(posicionMenu)
                if (disponible > 0 && creditos >= compraUnidad && unidadesCarga() < capacidadCarga())
                    cantidadTrato = 1
                else if (carga[posicionMenu] > 0) cantidadTrato = -1
            }
        }
    } else if (escenaActiva == NumeroEscena.Astillero) {
        if (confirmacionAbierta) comprarElementoAstillero()
        else if (posicionMenu == POSICION_NAVE_ASTILLERO) {
            if (vistaRolAstillero == rolNave) tocarSonidoError()
            else if (!rolNaveDesbloqueado(vistaRolAstillero)) {
                mostrarAviso(Textos.t(457), Textos.t(458) + rangoNecesarioRolNave(vistaRolAstillero),
                    nombreRolNave(vistaRolAstillero), NumeroEscena.Astillero)
                tocarSonidoError()
            } else if (costeAstillero(posicionMenu) > creditos) {
                mostrarAviso(Textos.t(440),
                    Textos.t(441) + (costeAstillero(posicionMenu) - creditos) + Textos.t(319),
                    nombreRolNave(vistaRolAstillero), NumeroEscena.Astillero)
                tocarSonidoError()
            } else confirmacionAbierta = true
        }
        else if (posicionMenu == POSICION_NOMBRE_ASTILLERO) {
            cambiarNombreNave(rolNave, 1)
            escribirPartida()
        } else if (posicionMenu == POSICION_PINTURA_ASTILLERO) {
            cambiarPinturaNave(rolNave, 1)
            escribirPartida()
        }
        else if (posicionMenu >= 2 && posicionMenu < POSICION_NAVE_ASTILLERO &&
            mejoras[posicionMenu - 2] >= MAX_MEJORA[posicionMenu - 2]) tocarSonidoError()
        else if (costeAstillero(posicionMenu) <= 0) tocarSonidoError()
        else {
            numeroInstaladoAstillero = -1
            confirmacionAbierta = true
        }
    } else if (escenaActiva == NumeroEscena.Misiones) {
        if (claseMision == ClaseMision.Ninguna) aceptarMision(posicionMenu)
        else if (confirmacionAbierta) {
            let claseAbandonada = claseMision
            let varianteAbandonada = varianteMision
            let practica = fuenteMision == 2
            if (practica && etapaTutorial < 4) etapaTutorial = 1
            if (!practica) {
                misionesFalladas++
                cambiarReputacionFaccion(faccionMisionPantalla(claseAbandonada, varianteAbandonada), -2)
            }
            vaciarMision()
            confirmacionAbierta = false
            escribirPartida()
            mostrarAviso(practica ? Textos.t(459) : Textos.t(460),
                practica ? Textos.t(461) : Textos.t(462), "", NumeroEscena.Hangar)
        } else confirmacionAbierta = true
    } else if (escenaActiva == NumeroEscena.MapaEstelar) {
        if (mundoCursorMapa == mundoActual) {
            vaciarRutaPrevista()
            mundoDestino = mundoActual
            ponerEscena(NumeroEscena.Hangar)
        } else if (planearRutaHasta(mundoCursorMapa) && cantidadSaltosRuta() > 0) {
            mundoDestino = mundoEnRuta(1)
            ponerEscena(NumeroEscena.Hangar)
        } else {
            mostrarAviso(Textos.t(463), Textos.t(464), Textos.t(465), NumeroEscena.MapaEstelar)
        }
    } else if (escenaActiva == NumeroEscena.Estado) {
        if (paginaEstado == ESTADO_FACCIONES && aventuraCumplida() && eleccionFinal == ClaseFinal.Ninguna) {
            let final = finalParaFaccionPantalla(cursorEstado)
            if (finalDisponible(final) && elegirFinal(final)) {
                escribirPartida()
                mostrarAviso(Textos.t(466), nombreFinal(final), Textos.t(467), NumeroEscena.Estado)
            } else {
                mostrarAviso(Textos.t(468), Textos.t(469), nombreFinal(final), NumeroEscena.Estado)
                tocarSonidoError()
            }
        } else if (paginaEstado == ESTADO_OPCIONES) {
            if (cursorEstado == 0) cambiarVelocidadTexto(1)
            else if (cursorEstado == 1) alternarContrasteAlto()
            else if (cursorEstado == 2) alternarSacudidaCamara()
            else if (cursorEstado == 3) cambiarModoIntro(1)
            else if (cursorEstado == 4) cambiarEscalonSonido(1)
            else if (cursorEstado == 5) cambiarDensidadEfecto(1)
            else if (cursorEstado == 6) {
                escribirPartidaManual()
                mostrarAviso(Textos.t(470), NOMBRES_MUNDO[mundoActual] + Textos.t(471) + diaJuego,
                    Textos.t(472), NumeroEscena.Estado)
            } else if (existePartidaManual()) {
                cargarPartidaManual()
                mostrarAviso(Textos.t(473), NOMBRES_MUNDO[mundoActual] + Textos.t(471) + diaJuego,
                    Textos.t(474), NumeroEscena.Estado)
            } else tocarSonidoError()
            if (cursorEstado <= 2 && tienePartida) escribirPartida()
        } else if (paginaEstado == ESTADO_HARDWARE) {
            tocarSonidoMision()
        } else if (paginaEstado == ESTADO_DESARROLLADOR) {
            alternarModoDesarrollador()
        }
    }
    else if (escenaActiva == NumeroEscena.Aviso) {
        claveDibujoAviso = ""
        ponerEscena(escenaVuelta)
    }
    else if (escenaActiva == NumeroEscena.BorradoPartida) {
        if (confirmarPartidaNuevaPlus) iniciarPartidaNuevaPlus()
        else borrarPartida()
        confirmarPartidaNuevaPlus = false
        ponerEscena(NumeroEscena.Titulo)
    }
}

function gestionarB(): void {
    if (entradaBloqueada) return
    if (escenaActiva == NumeroEscena.Intro) terminarIntro()
    else if (escenaActiva == NumeroEscena.Titulo) {
        // B no hace nada en la pantalla de título: las acciones que borran algo tienen entradas de menú propias
        // y bien visibles.
    } else if (escenaActiva == NumeroEscena.Hangar) {
        // Durante la primera entrega guiada, B pregunta si se quiere saltar; una segunda B mantiene la guía.
        if (confirmacionAbierta) confirmacionAbierta = false
        else if (entregaGuiadaActiva()) confirmacionAbierta = true
        else ponerEscena(NumeroEscena.Titulo)
    }
    else if (escenaActiva == NumeroEscena.Mercado) {
        if (tratoAbierto) {
            tratoAbierto = false
            cantidadTrato = 0
        } else ponerEscena(NumeroEscena.Hangar)
    } else if (escenaActiva == NumeroEscena.Astillero) {
        if (confirmacionAbierta) confirmacionAbierta = false
        else {
            escribirPartida()
            ponerEscena(NumeroEscena.Hangar)
        }
    } else if (escenaActiva == NumeroEscena.Misiones) {
        if (confirmacionAbierta) confirmacionAbierta = false
        else ponerEscena(NumeroEscena.Hangar)
    } else if (escenaActiva == NumeroEscena.MapaEstelar) {
        if (objetivoRutaAnteriorMapa != mundoActual) planearRutaHasta(objetivoRutaAnteriorMapa)
        else vaciarRutaPrevista()
        ponerEscena(NumeroEscena.Hangar)
    } else if (escenaActiva == NumeroEscena.Estado) {
        if (paginaEstado == ESTADO_HARDWARE && !bHardwareProbado) {
            bHardwareProbado = true
            tocarSonidoNavegar()
        } else ponerEscena(escenaVueltaEstado)
    }
    else if (escenaActiva == NumeroEscena.Aviso) {
        claveDibujoAviso = ""
        ponerEscena(escenaVuelta)
    }
    else if (escenaActiva == NumeroEscena.BorradoPartida) {
        confirmarPartidaNuevaPlus = false
        ponerEscena(NumeroEscena.Titulo)
    }
}

// font8 dibuja las vocales con tilde, la ñ y los signos ¡ y ¿, que faltan en la fuente compacta font5. El ancho es
// siempre de seis píxeles; los rótulos demasiado largos se desplazan para que no se pierda ninguna palabra.
function imprimirTextoJuego(texto: string, x: number, y: number, color: number): void {
    x = Math.max(0, x)
    let columnas = Math.max(1, Math.idiv(160 - x, 6))
    screen.print(textoCortoPantalla(texto, columnas), x, y, color, image.font8)
}

function imprimirTextoAjustado(texto: string, x: number, y: number, columnas: number, color: number): number {
    let posicion = 0
    while (posicion < texto.length) {
        let cantidad = Math.min(columnas, texto.length - posicion)
        if (posicion + cantidad < texto.length) {
            let limite = cantidad
            while (limite > 0 && texto.charAt(posicion + limite) != " ") limite--
            if (limite > 0) cantidad = limite
        }
        imprimirTextoJuego(texto.substr(posicion, cantidad), x, y, color)
        posicion += cantidad
        while (texto.charAt(posicion) == " ") posicion++
        y += 10
    }
    return y
}
