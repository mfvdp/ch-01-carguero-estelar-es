// Secuencia de arranque de cine. Se dibuja entera con código, y así ahorra memoria RAM y flash.
const INTRO_ABIERTO_FIN_MS = 1800
const INTRO_PROLOGO_FIN_MS = 13800
const INTRO_PROLOGO_LARGO_MS = 12000
const INTRO_HANGAR_FIN_MS = 17100
const INTRO_GIRO_FIN_MS = 20300
const INTRO_COMBATE_FIN_MS = 24500
const INTRO_SALTO_FIN_MS = 27300
const INTRO_LLEGADA_FIN_MS = 29800
const INTRO_DURACION_MS = 32100
const INTRO_TARJETA_MS = INTRO_LLEGADA_FIN_MS - INTRO_ABIERTO_FIN_MS
const INTRO_MODO_CLAVE = "ot.intro.mode"
const INTRO_MODO_PELICULA = 0
const INTRO_MODO_NORMAL = 1
const INTRO_MODO_OMITIR = 2
// El intro se reproduce en cada arranque, por eso la opción del título solo ofrece PELÍCULA y NORMAL. Si se pone este
// número en 3, vuelve NO (INTRO_MODO_OMITIR) como opción en el menú del título; todos los caminos de NO más
// abajo se mantienen.
const INTRO_CANTIDAD_MODOS = 2

// PELÍCULA reproduce a propósito la línea de tiempo lógica de 32,1 s a la mitad de velocidad (64,2 s); NORMAL, a dos
// tercios de la velocidad (48,15 s). El dibujo, los textos y las entradas del sonido siguen todos la línea de tiempo
// lógica, por eso los modos no se separan escena por escena.
const INTRO_PELICULA_VELOCIDAD_NUMERADOR = 1
const INTRO_PELICULA_VELOCIDAD_DENOMINADOR = 2
const INTRO_NORMAL_VELOCIDAD_NUMERADOR = 2
const INTRO_NORMAL_VELOCIDAD_DENOMINADOR = 3
let introIniciadoMs = 0
let entradaIntro = 0
let entradaHistoriaIntro = 0
let entradaTarjetaIntro = false
let modoIntro = -1

function leerModoIntro(): number {
    if (modoIntro >= INTRO_MODO_PELICULA && modoIntro < INTRO_CANTIDAD_MODOS) return modoIntro
    if (settings.exists(INTRO_MODO_CLAVE)) {
        let guardado = Math.round(settings.readNumber(INTRO_MODO_CLAVE))
        modoIntro = guardado >= INTRO_MODO_PELICULA && guardado < INTRO_CANTIDAD_MODOS ? guardado : INTRO_MODO_PELICULA
    } else modoIntro = INTRO_MODO_PELICULA
    return modoIntro
}

function nombreModoIntro(): string {
    let modo = leerModoIntro()
    if (modo == INTRO_MODO_NORMAL) return Textos.t(235)
    if (modo == INTRO_MODO_OMITIR) return Textos.t(201)
    return Textos.t(477)
}

function cambiarModoIntro(diferencia: number): void {
    let siguiente = (leerModoIntro() + diferencia) % INTRO_CANTIDAD_MODOS
    if (siguiente < 0) siguiente += INTRO_CANTIDAD_MODOS
    if (siguiente == modoIntro) return
    modoIntro = siguiente
    settings.writeNumber(INTRO_MODO_CLAVE, modoIntro)
}

function duracionIntroSegundos(): number {
    let modo = leerModoIntro()
    if (modo == INTRO_MODO_OMITIR) return 0
    if (modo == INTRO_MODO_NORMAL) return 48
    return 64
}

// El intro se reproduce en cada arranque, también si ya se vio una vez.
function introDebeReproducirseSola(): boolean {
    return leerModoIntro() != INTRO_MODO_OMITIR
}

function iniciarIntroConfigurada(): void {
    if (leerModoIntro() == INTRO_MODO_OMITIR) {
        ponerEscena(NumeroEscena.Titulo)
        return
    }
    iniciarIntro()
}

function introUsaRitmoPelicula(): boolean {
    // Todos los modos del intro menos NORMAL suenan al tempo de película, también una repetición que el jugador inicia
    // cuando el intro está en NO.
    return leerModoIntro() != INTRO_MODO_NORMAL
}

function iniciarIntro(): void {
    introIniciadoMs = game.runtime()
    // Las entradas 0 (silencio) y 1 pertenecen a la tarjeta del estudio, que viene después de
    // la llegada (entradaTarjetaIntro).
    entradaIntro = 2
    entradaTarjetaIntro = false
    entradaHistoriaIntro = 0
    escenaActiva = NumeroEscena.Intro
    entradaBloqueada = false
    iniciarMusicaIntro()
}

function terminarIntro(): void {
    if (escenaActiva == NumeroEscena.Intro) {
        tocarSonidoTitulo()
        ponerEscena(NumeroEscena.Titulo)
    }
}

// Tiempo lógico desde el comienzo del intro, en el orden en que se muestra.
function tiempoReproduccionIntro(): number {
    let realTranscurrido = Math.max(0, game.runtime() - introIniciadoMs)
    if (introUsaRitmoPelicula())
        return Math.idiv(realTranscurrido * INTRO_PELICULA_VELOCIDAD_NUMERADOR, INTRO_PELICULA_VELOCIDAD_DENOMINADOR)
    return Math.idiv(realTranscurrido * INTRO_NORMAL_VELOCIDAD_NUMERADOR, INTRO_NORMAL_VELOCIDAD_DENOMINADOR)
}

// Primero la historia (del prólogo a la llegada), luego la tarjeta del estudio "CALLIOPE HACKER PRESENTA" y por último
// la aparición del título. Devuelve la posición en la línea de tiempo original de las escenas; la duración total sigue
// siendo de 32,1 segundos, igual que antes.
function introTranscurrido(): number {
    let jugado = tiempoReproduccionIntro()
    if (jugado < INTRO_TARJETA_MS) return jugado + INTRO_ABIERTO_FIN_MS
    if (jugado < INTRO_LLEGADA_FIN_MS) return jugado - INTRO_TARJETA_MS
    return jugado
}

function actualizarIntro(): void {
    if (escenaActiva != NumeroEscena.Intro) return
    let transcurrido = introTranscurrido()
    if (entradaHistoriaIntro == 0 && transcurrido >= INTRO_ABIERTO_FIN_MS + 80) {
        entradaHistoriaIntro = 1
        entradaSonidoPrologo(0)
    } else if (entradaHistoriaIntro == 1 && transcurrido >= INTRO_ABIERTO_FIN_MS + 3080) {
        entradaHistoriaIntro = 2
        entradaSonidoPrologo(1)
    } else if (entradaHistoriaIntro == 2 && transcurrido >= INTRO_ABIERTO_FIN_MS + 6080) {
        entradaHistoriaIntro = 3
        entradaSonidoPrologo(2)
    } else if (entradaHistoriaIntro == 3 && transcurrido >= INTRO_ABIERTO_FIN_MS + 9080) {
        entradaHistoriaIntro = 4
        entradaSonidoPrologo(3)
    }

    // La línea de tiempo original de las escenas se detiene mientras se muestra el prólogo.
    let peliculaTranscurrida = transcurrido
    if (transcurrido >= INTRO_ABIERTO_FIN_MS && transcurrido < INTRO_PROLOGO_FIN_MS)
        peliculaTranscurrida = INTRO_ABIERTO_FIN_MS
    else if (transcurrido >= INTRO_PROLOGO_FIN_MS) peliculaTranscurrida = transcurrido - INTRO_PROLOGO_LARGO_MS
    // Campanada de la tarjeta del estudio 1,1 s después de que empiece (entrada 1).
    if (!entradaTarjetaIntro && transcurrido < INTRO_ABIERTO_FIN_MS && peliculaTranscurrida >= 1100) {
        entradaTarjetaIntro = true
        entradaSonidoIntro(1)
    }

    if (entradaIntro == 2 && peliculaTranscurrida >= 1850) {
        entradaIntro = 3
        entradaSonidoIntro(2)
    } else if (entradaIntro == 3 && peliculaTranscurrida >= 3600) {
        entradaIntro = 4
        entradaSonidoIntro(3)
    } else if (entradaIntro == 4 && peliculaTranscurrida >= 5000) {
        entradaIntro = 5
        entradaSonidoIntro(4)
    } else if (entradaIntro == 5 && peliculaTranscurrida >= 6500) {
        entradaIntro = 6
        entradaSonidoIntro(5)
    } else if (entradaIntro == 6 && peliculaTranscurrida >= 8300) {
        entradaIntro = 7
        entradaSonidoIntro(6)
    } else if (entradaIntro == 7 && peliculaTranscurrida >= 9300) {
        entradaIntro = 8
        entradaSonidoIntro(7)
    } else if (entradaIntro == 8 && peliculaTranscurrida >= 10300) {
        entradaIntro = 9
        entradaSonidoIntro(8)
    } else if (entradaIntro == 9 && peliculaTranscurrida >= 11100) {
        entradaIntro = 10
        entradaSonidoIntro(9)
    } else if (entradaIntro == 10 && peliculaTranscurrida >= 11900) {
        entradaIntro = 11
        entradaSonidoIntro(10)
    } else if (entradaIntro == 11 && peliculaTranscurrida >= 12500) {
        entradaIntro = 12
        entradaSonidoIntro(11)
    } else if (entradaIntro == 12 && peliculaTranscurrida >= 13300) {
        entradaIntro = 13
        entradaSonidoIntro(12)
    } else if (entradaIntro == 13 && peliculaTranscurrida >= 14100) {
        entradaIntro = 14
        entradaSonidoIntro(13)
    } else if (entradaIntro == 14 && peliculaTranscurrida >= 14900) {
        entradaIntro = 15
        entradaSonidoIntro(14)
    } else if (entradaIntro == 15 && peliculaTranscurrida >= 15300) {
        entradaIntro = 16
        entradaSonidoIntro(15)
    } else if (entradaIntro == 16 && peliculaTranscurrida >= 16600) {
        entradaIntro = 17
        entradaSonidoIntro(16)
    } else if (entradaIntro == 17 && peliculaTranscurrida >= 17800) {
        entradaIntro = 18
        entradaSonidoIntro(17)
    } else if (entradaIntro == 18 && peliculaTranscurrida >= 18400) {
        entradaIntro = 19
        entradaSonidoIntro(18)
    } else if (entradaIntro == 19 && peliculaTranscurrida >= 19100) {
        entradaIntro = 20
        entradaSonidoIntro(19)
    }
    if (transcurrido >= INTRO_DURACION_MS) terminarIntro()
}

function dibujarEstrellasIntro(transcurrido: number, velocidad: number): void {
    let desplazamiento = Math.idiv(transcurrido * velocidad, 90)
    for (let i = 0; i < 34; i++) {
        let capa = 1 + i % 3
        let x = (azarEstable(i, 31, 7) + desplazamiento * capa) % 160
        let y = 8 + azarEstable(i, 17, 19) % 99
        let color = capa == 3 ? COLOR_TEXTO : (capa == 2 ? COLOR_CIAN : COLOR_TENUE)
        if (velocidad >= 3 && i % 3 == 0) screen.drawLine(Math.max(0, x - capa * 3), y, x, y, color)
        else screen.setPixel(x, y, color)
    }
}

function dibujarFranjasIntro(transcurrido: number): void {
    screen.fillRect(0, 0, 160, 7, COLOR_FONDO)
    screen.fillRect(0, 108, 160, 12, COLOR_FONDO)
    screen.drawLine(0, 7, 159, 7, COLOR_AZUL)
    screen.drawLine(0, 107, 159, 107, COLOR_AZUL)
    if (transcurrido > 350) imprimirDerecha(Textos.t(478), 157, 111, COLOR_TENUE)
}

function dibujarNavePasadaIntro(cx: number, cy: number, escala: number): void {
    let morroX = cx + 10 * escala
    let colaX = cx - 8 * escala
    screen.fillTriangle(morroX, cy, colaX, cy - 5 * escala, colaX, cy + 5 * escala, COLOR_TENUE)
    screen.fillTriangle(cx + 2 * escala, cy, cx - 4 * escala, cy - 10 * escala, cx - 1 * escala, cy - 2 * escala,
        COLOR_AZUL)
    screen.fillTriangle(cx + 2 * escala, cy, cx - 4 * escala, cy + 10 * escala, cx - 1 * escala, cy + 2 * escala,
        COLOR_SOMBRA)
    screen.fillTriangle(morroX, cy, cx - 1 * escala, cy, colaX, cy + 5 * escala, COLOR_AZUL)
    screen.drawLine(colaX, cy - 5 * escala, morroX, cy, COLOR_TEXTO)
    screen.drawLine(colaX, cy + 5 * escala, morroX, cy, COLOR_CIAN)
    screen.fillRect(cx + 2 * escala, cy - escala, 3 * escala, 2 * escala, COLOR_FONDO)
    screen.drawLine(colaX, cy - 2 * escala, colaX - 6 * escala, cy - 2 * escala, COLOR_NARANJA)
    screen.drawLine(colaX, cy + 2 * escala, colaX - 6 * escala, cy + 2 * escala, COLOR_AMARILLO)
}

function dibujarNaveCombateIntro(cx: number, cy: number, escala: number): void {
    screen.fillTriangle(cx, cy - 9 * escala, cx - 8 * escala, cy + 7 * escala, cx + 8 * escala, cy + 7 * escala,
        COLOR_TENUE)
    screen.fillTriangle(cx, cy - 5 * escala, cx, cy + 8 * escala, cx + 8 * escala, cy + 7 * escala, COLOR_AZUL)
    screen.fillTriangle(cx - 2 * escala, cy, cx - 11 * escala, cy + 5 * escala, cx - 4 * escala, cy + 5 * escala,
        COLOR_METAL)
    screen.fillTriangle(cx + 2 * escala, cy, cx + 11 * escala, cy + 5 * escala, cx + 4 * escala, cy + 5 * escala,
        COLOR_METAL)
    screen.drawLine(cx, cy - 9 * escala, cx, cy + 7 * escala, COLOR_CIAN)
    screen.fillRect(cx - escala, cy - 3 * escala, 3 * escala, 3 * escala, COLOR_FONDO)
    screen.drawLine(cx - 4 * escala, cy + 7 * escala, cx - 4 * escala, cy + 12 * escala, COLOR_NARANJA)
    screen.drawLine(cx + 4 * escala, cy + 7 * escala, cx + 4 * escala, cy + 12 * escala, COLOR_AMARILLO)
}

function dibujarEnemigoIntro(cx: number, cy: number, escala: number): void {
    screen.fillTriangle(cx, cy + 6 * escala, cx - 7 * escala, cy - 5 * escala, cx + 7 * escala, cy - 5 * escala,
        COLOR_ROJO)
    screen.fillTriangle(cx, cy + 2 * escala, cx - 10 * escala, cy - 2 * escala, cx - 3 * escala, cy - 4 * escala,
        COLOR_MORADO)
    screen.fillTriangle(cx, cy + 2 * escala, cx + 10 * escala, cy - 2 * escala, cx + 3 * escala, cy - 4 * escala,
        COLOR_MORADO)
    screen.setPixel(cx, cy, COLOR_AMARILLO)
}

function dibujarNaveDespegueIntro(cx: number, cy: number, anchoMitad: number, largo: number,
    empuje: number): void {
    let morroY = cy - largo
    let colaY = cy + Math.idiv(largo, 2)
    screen.fillTriangle(cx, morroY, cx - anchoMitad, colaY, cx + anchoMitad, colaY, COLOR_TENUE)
    screen.fillTriangle(cx, morroY + 3, cx, colaY, cx + anchoMitad, colaY, COLOR_AZUL)
    screen.fillTriangle(cx - 3, cy, cx - anchoMitad - 5, colaY - 3, cx -
        anchoMitad + 3, colaY - 4, COLOR_METAL)
    screen.fillTriangle(cx + 3, cy, cx + anchoMitad + 5, colaY - 3, cx +
        anchoMitad - 3, colaY - 4, COLOR_METAL)
    screen.drawLine(cx, morroY, cx, colaY, COLOR_CIAN)
    screen.fillRect(cx - 2, morroY + Math.idiv(largo, 3), 5, 5, COLOR_FONDO)
    screen.drawLine(cx - Math.idiv(anchoMitad, 3), colaY, cx - Math.idiv(anchoMitad, 3), colaY + empuje,
        COLOR_NARANJA)
    screen.drawLine(cx + Math.idiv(anchoMitad, 3), colaY, cx + Math.idiv(anchoMitad, 3), colaY + empuje,
        COLOR_AMARILLO)
}

function dibujarEstacionIntro(cx: number, cy: number, pulso: number): void {
    screen.drawCircle(cx, cy, 13, COLOR_CIAN)
    screen.drawCircle(cx, cy, 10, COLOR_AZUL)
    screen.drawLine(cx - 20, cy, cx + 20, cy, COLOR_TENUE)
    screen.drawLine(cx, cy - 16, cx, cy + 16, COLOR_METAL)
    screen.fillRect(cx - 4, cy - 4, 9, 9, COLOR_SOMBRA)
    screen.drawRect(cx - 4, cy - 4, 9, 9, COLOR_TEXTO)
    screen.fillRect(cx - 25, cy - 3, 8, 7, COLOR_AZUL)
    screen.fillRect(cx + 18, cy - 3, 8, 7, COLOR_AZUL)
    screen.setPixel(cx - 13, cy, pulso == 0 ? COLOR_AMARILLO : COLOR_ROJO)
    screen.setPixel(cx + 13, cy, pulso == 0 ? COLOR_ROJO : COLOR_AMARILLO)
}

function dibujarCapsulaRescateIntro(cx: number, cy: number): void {
    screen.fillRect(cx - 3, cy - 4, 7, 9, COLOR_TENUE)
    screen.drawRect(cx - 3, cy - 4, 7, 9, COLOR_CIAN)
    screen.setPixel(cx, cy - 1, COLOR_VERDE)
    screen.drawLine(cx - 2, cy + 5, cx - 4, cy + 8, COLOR_NARANJA)
    screen.drawLine(cx + 2, cy + 5, cx + 4, cy + 8, COLOR_NARANJA)
}

function dibujarExplosionIntro(cx: number, cy: number, edad: number, radioMax: number): void {
    let radio = Math.min(radioMax, 2 + Math.idiv(edad, 42))
    screen.fillCircle(cx, cy, radio, COLOR_NARANJA)
    screen.fillCircle(cx, cy, Math.max(1, radio - 4), COLOR_AMARILLO)
    screen.setPixel(cx, cy, COLOR_TEXTO)
    screen.drawLine(cx - radio - 4, cy, cx + radio + 4, cy, COLOR_ROJO)
    screen.drawLine(cx, cy - radio - 4, cx, cy + radio + 4, COLOR_NARANJA)
    screen.drawLine(cx - radio, cy - radio, cx + radio, cy + radio, COLOR_AMARILLO)
    screen.drawLine(cx + radio, cy - radio, cx - radio, cy + radio, COLOR_AMARILLO)
}

function mundoIntroY(mundo: number): number {
    return 13 + Math.idiv(MUNDO_Y[mundo] * 58, 110)
}

function dibujarSubidaHistoriaIntro(local: number): void {
    if (local < 80) {
        screen.fill(COLOR_CIAN)
        return
    }
    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 1)
    let revelado =
        Math.clamp(0, CANTIDAD_MUNDOS_PUBLICOS, Math.idiv((local - 120) * CANTIDAD_MUNDOS_PUBLICOS, 1550))
    for (let i = 0; i < revelado; i++) {
        let x = MUNDO_X[i]
        let y = mundoIntroY(i)
        if (i % 6 != 0 && i - 1 < revelado)
            screen.drawLine(MUNDO_X[i - 1], mundoIntroY(i - 1), x, y, COLOR_AZUL)
        if (i >= 6 && i % 2 == 0 && i - 6 < revelado)
            screen.drawLine(MUNDO_X[i - 6], mundoIntroY(i - 6), x, y, COLOR_TENUE)
        screen.fillCircle(x, y, i % 5 == 0 ? 2 : 1, i % 4 == 0 ? COLOR_AMARILLO : COLOR_CIAN)
    }
    if (local < 1050) {
        subtituloIntro(Textos.t(479), 84, COLOR_VERDE)
        subtituloIntro(Textos.t(480), 96, COLOR_TEXTO)
    } else {
        subtituloIntro(Textos.t(481), 90, COLOR_AMARILLO)
    }
}

function dibujarCaidaHistoriaIntro(local: number): void {
    if (local < 80) {
        screen.fill(COLOR_ROJO)
        return
    }
    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 1)
    for (let i = 0; i < CANTIDAD_MUNDOS_PUBLICOS; i++) {
        let x = MUNDO_X[i]
        let y = mundoIntroY(i)
        let falladoMs = 350 + azarEstable(i, 83, 17) % 1800
        let vivo = local < falladoMs
        if (i % 6 != 0) {
            let px = MUNDO_X[i - 1]
            let py = mundoIntroY(i - 1)
            if (vivo) screen.drawLine(px, py, x, y, COLOR_AZUL)
            else {
                screen.drawLine(px, py, Math.idiv(px + x, 2) - 2, Math.idiv(py + y, 2), COLOR_ROJO)
                screen.drawLine(Math.idiv(px + x, 2) + 3, Math.idiv(py + y, 2), x, y, COLOR_OXIDO)
            }
        }
        screen.fillCircle(x, y, i % 5 == 0 ? 2 : 1, vivo ? COLOR_CIAN :
            (i % 3 == 0 ? COLOR_ROJO : COLOR_TENUE))
    }
    let escaneoX = Math.idiv(local * 180, 3000) - 10
    screen.drawLine(escaneoX, 8, escaneoX, 78, COLOR_ROJO)
    if (local >= 900 && local < 2050) dibujarExplosionIntro(80, 43, local - 900, 13)
    if (local < 1000) subtituloIntro(Textos.t(482), 88, COLOR_AMARILLO)
    else if (local < 2050) subtituloIntro(Textos.t(483), 91, COLOR_ROJO)
    else subtituloIntro(Textos.t(484), 91, COLOR_TEXTO)
}

function dibujarPiratasHistoriaIntro(local: number): void {
    if (local < 80) {
        screen.fill(COLOR_ROJO)
        return
    }
    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 2)
    for (let i = 0; i < 9; i++) {
        let rutaX = 8 + i * 18
        screen.drawLine(rutaX, 78 - i * 5, rutaX + 10, 75 - i * 5, i < 5 ? COLOR_TENUE : COLOR_ROJO)
    }
    let naveX = 48 + Math.idiv(local * 45, 3000)
    dibujarNavePasadaIntro(naveX, 62, 2)
    let avanceEnemigo = Math.clamp(0, 1000, Math.idiv((local - 380) * 1000, 1050))
    let enemigo1X = 170 - Math.idiv(avanceEnemigo * 50, 1000)
    let enemigo2X = -12 + Math.idiv(avanceEnemigo * 47, 1000)
    dibujarEnemigoIntro(enemigo1X, 30, 1)
    if (local >= 650) dibujarEnemigoIntro(enemigo2X, 43, 1)
    if (local >= 1050 && local < 2100) {
        screen.drawLine(enemigo1X - 2, 35, naveX + 8, 55, COLOR_ROJO)
        screen.drawLine(enemigo2X + 2, 48, naveX - 7, 58, COLOR_NARANJA)
        let escudo = 19 + Math.idiv(local, 90) % 3
        dibujarRomboVista(naveX, 62, escudo, 13, COLOR_CIAN)
    }
    if (local >= 2050 && local < 2750) dibujarExplosionIntro(enemigo2X, 43, local - 2050, 11)
    if (local < 950) subtituloIntro(Textos.t(485), 13, COLOR_TENUE)
    else if (local < 2050) subtituloIntro(Textos.t(486), 13, COLOR_ROJO)
    else subtituloIntro(Textos.t(487), 93, COLOR_AMARILLO)
}

function dibujarHistoriaIntroAntiguo(local: number): void {
    if (local < 80) {
        screen.fill(COLOR_CIAN)
        return
    }
    if (local >= 2880) {
        screen.fill(COLOR_FONDO)
        return
    }
    screen.fill(COLOR_FONDO)
    rellenarCuadrilateroHangar(0, 8, 159, 8, 124, 107, 36, 107, COLOR_AZUL)
    screen.fillTriangle(80, 12, 35, 107, 125, 107, COLOR_SOMBRA)
    screen.fillRect(0, 75, 160, 33, COLOR_SOMBRA)
    screen.drawLine(80, 50, 15, 107, COLOR_TENUE)
    screen.drawLine(80, 50, 145, 107, COLOR_TENUE)
    screen.drawLine(80, 50, 80, 107, COLOR_METAL)
    screen.drawLine(50, 76, 110, 76, COLOR_TENUE)
    screen.drawLine(31, 92, 129, 92, COLOR_TENUE)
    let empuje = local >= 2150 ? 12 : (local >= 1500 ? 5 : 1)
    dibujarNaveDespegueIntro(80, 67, 19, 25, empuje)
    let pulso = Math.idiv(local, 180) % 2
    screen.fillRect(21, 93, 3, 3, pulso == 0 ? COLOR_AMARILLO : COLOR_CIAN)
    screen.fillRect(136, 93, 3, 3, pulso == 0 ? COLOR_CIAN : COLOR_AMARILLO)
    screen.fillRect(5, 29, 31, 18, COLOR_FONDO)
    screen.drawRect(5, 29, 31, 18, COLOR_CIAN)
    imprimirTextoJuego("LUMA", 9, 32, COLOR_VERDE)
    subtituloIntro(Textos.t(488), 40, COLOR_AMARILLO)
    if (local < 950) subtituloIntro(Textos.t(489), 13, COLOR_TEXTO)
    else if (local < 1850) subtituloIntro(Textos.t(490), 13, COLOR_AMARILLO)
    else {
        screen.fillRect(14, 86, 132, 20, COLOR_FONDO)
        if (local < 2450) subtituloIntro(Textos.t(491), 91, COLOR_TEXTO)
        else subtituloIntro(Textos.t(492), 91, COLOR_AMARILLO)
    }
}

function dibujarPrologoIntro(local: number): void {
    if (local < 3000) dibujarSubidaHistoriaIntro(local)
    else if (local < 6000) dibujarCaidaHistoriaIntro(local - 3000)
    else if (local < 9000) dibujarPiratasHistoriaIntro(local - 6000)
    else dibujarHistoriaIntroAntiguo(local - 9000)
}

function dibujarHangarIntro(local: number): void {
    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 1)

    // Enorme hangar de despegue con una puerta que se abre al espacio.
    rellenarCuadrilateroHangar(0, 8, 159, 8, 119, 35, 40, 35, COLOR_AZUL)
    screen.drawLine(0, 15, 159, 15, COLOR_METAL)
    screen.drawLine(15, 25, 145, 25, COLOR_METAL)
    screen.drawLine(0, 8, 48, 35, COLOR_TENUE)
    screen.drawLine(40, 8, 64, 35, COLOR_TENUE)
    screen.drawLine(80, 8, 80, 35, COLOR_TENUE)
    screen.drawLine(120, 8, 96, 35, COLOR_TENUE)
    screen.drawLine(159, 8, 112, 35, COLOR_TENUE)
    screen.fillRect(40, 20, 80, 45, COLOR_OXIDO)
    screen.fillRect(46, 24, 68, 38, COLOR_FONDO)
    for (let i = 0; i < 8; i++) {
        screen.setPixel(51 + azarEstable(i, 9, 4) % 58, 28 + azarEstable(i, 4, 12) % 27,
            i % 3 == 0 ? COLOR_CIAN : COLOR_TEXTO)
    }

    let puertaAbierta = Math.clamp(0, 27, Math.idiv((local - 220) * 27, 1400))
    let anchoPuerta = 34 - puertaAbierta
    screen.fillRect(46, 24, anchoPuerta, 38, COLOR_SOMBRA)
    screen.fillRect(114 - anchoPuerta, 24, anchoPuerta, 38, COLOR_SOMBRA)
    screen.drawLine(46 + anchoPuerta, 24, 46 + anchoPuerta, 61, COLOR_CIAN)
    screen.drawLine(113 - anchoPuerta, 24, 113 - anchoPuerta, 61, COLOR_CIAN)
    screen.drawRect(40, 20, 80, 45, COLOR_TENUE)

    screen.fillRect(0, 62, 160, 46, COLOR_SOMBRA)
    rellenarCuadrilateroHangar(68, 62, 92, 62, 136, 108, 24, 108, COLOR_METAL)
    rellenarCuadrilateroHangar(75, 62, 85, 62, 111, 108, 49, 108, COLOR_AZUL)
    screen.drawLine(80, 61, 0, 108, COLOR_TENUE)
    screen.drawLine(80, 61, 32, 108, COLOR_TENUE)
    screen.drawLine(80, 61, 80, 108, COLOR_TENUE)
    screen.drawLine(80, 61, 128, 108, COLOR_TENUE)
    screen.drawLine(80, 61, 159, 108, COLOR_TENUE)
    screen.drawLine(58, 74, 102, 74, COLOR_TENUE)
    screen.drawLine(40, 88, 120, 88, COLOR_TENUE)
    screen.drawLine(21, 103, 139, 103, COLOR_TENUE)

    let avanceDespegue = Math.clamp(0, 1000, Math.idiv((local - 900) * 1000, 2200))
    let naveY = 92 - Math.idiv(avanceDespegue * 43, 1000)
    let anchoNave = 18 - Math.idiv(avanceDespegue * 10, 1000)
    let largoNave = 22 - Math.idiv(avanceDespegue * 12, 1000)
    let empuje = 5 + Math.idiv(avanceDespegue * 12, 1000)
    dibujarNaveDespegueIntro(80, naveY, anchoNave, largoNave, empuje)

    let faseLuz = Math.idiv(local, 150) % 2
    screen.fillRect(44, 96, 3, 2, faseLuz == 0 ? COLOR_AMARILLO : COLOR_ROJO)
    screen.fillRect(113, 96, 3, 2, faseLuz == 0 ? COLOR_ROJO : COLOR_AMARILLO)
    screen.fillRect(59, 80, 2, 2, faseLuz == 0 ? COLOR_CIAN : COLOR_AMARILLO)
    screen.fillRect(99, 80, 2, 2, faseLuz == 0 ? COLOR_AMARILLO : COLOR_CIAN)
    if (local < 1050) subtituloIntro(Textos.t(493), 12, COLOR_VERDE)
    else if (local < 2300) subtituloIntro(Textos.t(494), 12, COLOR_AMARILLO)
    else subtituloIntro(Textos.t(495), 12, COLOR_CIAN)

    // Dos vigas en primer plano están delante de la nave y refuerzan la sensación de profundidad.
    screen.fillRect(0, 31, 7, 77, COLOR_OXIDO)
    screen.fillRect(153, 31, 7, 77, COLOR_OXIDO)
    screen.drawLine(0, 42, 7, 49, COLOR_METAL)
    screen.drawLine(153, 49, 159, 42, COLOR_METAL)
    if (local >= 3180 && local < 3240) screen.fill(COLOR_CIAN)
    else if (local >= 3240) screen.fill(COLOR_TEXTO)
}

// El Calliope Hacker en el escritorio, visto de espaldas (capucha puesta, zapatillas turquesa, Calliope mini con
// GameKit, gato dormido): una copia en píxeles de la figura, con los colores de este juego.
const HACKER_TARJETA = img`
    . . . . . . . . . . . . . . . . f f f f f . . . . . . . . . . . . . . . 8 . . . . . . . . . . . . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . f f f f f f f 9 . . . . . 8 . 8 . c c c c c c c c c c c c c c c c c c c c c c . . . . . . . . . . .
    . . . . . . . . . . . . . f c c f f f f f f 9 . 8 . 8 . 8 . 8 f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f c f f f f f f f f f 9 . 8 . 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f . . . . . . . . . . .
    . . . . . . . . . . . . f c f f f f f f f f f 9 8 8 8 8 8 8 8 f f f 9 9 9 9 9 9 f f f f f f f f f f f f f . 8 . . . . . . . . .
    . . . . . . . . . . . f c f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 . 8 . . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f 5 5 5 5 5 5 5 5 5 f f f f f f f f . 8 . 8 . . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 8 . 8 . . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f 6 6 6 6 6 f f f f f f f f f f f f 8 8 8 8 . 8 . . . . .
    . . . . . . . . . . . f f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 5 5 8 . 8 5 5 . .
    . . . . . . . . . . . c f f f f f f f f f f f f 9 8 8 8 8 8 8 f f f f f f f 2 2 2 2 2 2 2 2 f f f f f f f 8 8 5 8 8 8 8 8 5 . .
    . . . . . . . . . . f f c f f f f f f f f f f f f 9 8 8 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 8 8 8 8 8 8 8 8 .
    . . . . . . . . . f f f f c c f f f f f f f f f f f 9 8 8 8 8 f f f f f 9 9 9 9 9 9 9 9 9 9 9 f f f f f f 5 8 8 8 2 8 2 8 8 8 5
    . . . . . . f f f f f f f f f c c c c f f f f f f f f 9 8 8 8 f f f f f f f f f f f f f f f f f f f f f f 5 8 8 8 2 2 2 8 8 8 5
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 8 8 f f f 8 8 8 8 f f f f f f f f f f f f f f f 8 8 8 8 8 2 8 8 8 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 9 8 f f f f f f f f f f f f f f f f f f f f f f 8 8 5 8 8 8 8 8 5 . 8
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f c f f f f 9 f f f f f f f f f f f f f f f f f f f f f f 8 8 5 5 8 f 8 5 5 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f c f f f f 9 8 8 8 8 8 8 8 8 8 c c c 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 8 . 8 . .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f c f f f f f 4 4 8 8 8 c c c c c c c c c 8 8 8 8 8 8 8 8 8 8 8 8 . 8 . 8 .
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f c f f f f 4 4 f f f e e e e e e e e e e e e e e e e e e e e e e e e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f 8 c 9 c 6 c 2 c f e e e e e e e e e e f f f f f f f f f f f f e e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f f 1 f f b c b f 2 f 2 f f e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 1 1 f f f f f 2 f 2 f f e e e
    . . . . f 6 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e f 1 f f f f f f f f f f e e e e
    . . . . . f 6 6 6 6 6 6 f f f f f f f f f f f f f f f f f f f f e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
    . . . . . f 6 6 6 6 6 6 6 f f f f f f f f f f f f f f f f f f f f c e e e e e e e e e e e e e e e e e e e e e e e e e e e e e e
    . . . . . . f 6 6 6 6 6 6 6 6 6 6 6 6 6 6 6 f f f f f f f f f f f f 8 8 8 8 8 8 8 8 8 8 8 c c 8 8 . 8 . 8 . 8 . . c b b b b b b
    . . . . . . . f f f f f f f f f f f f f f f f f f f f f f f f f f f 8 8 8 8 8 8 8 8 8 8 8 c c 8 . 8 . 8 . . . . . c b b b b b b
    . . . . . . . . . . . . . . . . . f f . f f f f f . 8 f f f f f c . 8 . 8 . 8 . 8 . 8 . 8 c c . 8 . . . . . . . . c b b b b b b
    . . . . . . . . . . . . . . . . . f f . f f f f f . . 8 f f f f c 8 . 8 . 8 . 8 . 8 . 8 . c c . . 6 6 6 6 6 . . . c b c c c c b
    . . . . . . . . . . . . . . . . . f f . f f f f f . . . f f f f c . . . 8 . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    . . . . . . . . . . . . . . . . . f f 6 6 6 6 6 6 6 . . f f f f c . . . . . . . . . . . . c c . 6 6 f f f 6 6 . . c b b b b b b
    . . f . . . f . . . . . . . . . . f f 6 1 6 6 6 6 6 . . f f f f c . . . . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    . . f f . f f . . . . . . . . . . f f 1 1 1 1 1 1 1 . . f f f f c . . . . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b c c c c b
    . f 1 1 1 1 1 f 1 1 . . . . . . . f f . . . . . . . . 6 6 6 6 6 6 6 6 . . . . . . . . . . c c . 6 6 c c c 6 6 . . c b b b b b b
    . 1 1 f 1 1 1 1 1 1 1 f f f f f f f f f f f f f f . 6 6 1 6 6 6 6 6 6 6 . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    f 1 1 1 1 1 1 f f 1 1 . . . . f f . . . . . . f f . 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . c c . 6 6 6 6 6 6 6 . . c b b b b b b
    6 6 6 6 6 6 6 6 6 6 6 . . . . c c . . . . . . c c . . . . . . . . . . . . . . . . . . . . c c . . 6 6 6 6 6 . . . c b c c c c b
    . 6 6 6 6 6 6 6 6 6 . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . c b b b b b b
    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . c b b b b b b
`

// Tarjeta del estudio "CALLIOPE HACKER PRESENTA"; aparece después de la llegada, justo antes de la
// aparición del título.
function dibujarAperturaIntro(transcurrido: number): void {
    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(transcurrido, 1)
    screen.fillRect(47, 9, 66, 42, COLOR_AZUL)
    screen.drawTransparentImage(HACKER_TARJETA, 48, 10)
    let lineaMitad = Math.clamp(0, 59, Math.idiv((transcurrido - 120) * 59, 500))
    screen.drawLine(80 - lineaMitad, 53, 80 + lineaMitad, 53, COLOR_CIAN)
    screen.drawLine(80 - lineaMitad, 80, 80 + lineaMitad, 80, COLOR_AZUL)
    if (transcurrido >= 280) {
        imprimirTextoJuego("CALLIOPE HACKER", 35, 60, COLOR_TEXTO)
        let visible = Math.clamp(0, 90, Math.idiv((transcurrido - 280) * 90, 620))
        if (visible < 90) screen.fillRect(35 + visible, 59, 90 - visible, 10, COLOR_FONDO)
    }
    if (transcurrido >= 930) subtituloIntro(Textos.t(496), 72, COLOR_VERDE)
    if (transcurrido >= 1600) {
        let barrido = Math.clamp(0, 80, Math.idiv((transcurrido - 1600) * 80, 200))
        screen.fillRect(0, 8, barrido, 99, COLOR_FONDO)
        screen.fillRect(160 - barrido, 8, barrido, 99, COLOR_FONDO)
    }
}

function dibujarGiroIntro(local: number): void {
    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 2)

    // Un mundo azul y su estación comercial en órbita llenan el panorama.
    screen.fillCircle(137, 109, 51, COLOR_CIAN)
    screen.fillCircle(139, 110, 47, COLOR_AZUL)
    screen.fillTriangle(113, 88, 128, 84, 124, 99, COLOR_SOMBRA)
    screen.fillTriangle(139, 77, 158, 80, 150, 93, COLOR_SOMBRA)
    screen.fillTriangle(142, 104, 159, 98, 159, 119, COLOR_SOMBRA)
    screen.drawLine(100, 91, 158, 79, COLOR_TENUE)
    screen.drawLine(94, 99, 159, 87, COLOR_METAL)
    screen.setPixel(116, 80, COLOR_AMARILLO)
    screen.setPixel(127, 73, COLOR_AMARILLO)
    screen.setPixel(151, 69, COLOR_AMARILLO)
    dibujarEstacionIntro(113, 34, Math.idiv(local, 180) % 2)
    screen.drawLine(113, 48, 117, 64, COLOR_TENUE)
    screen.drawLine(117, 64, 121, 75, COLOR_CIAN)

    let avance = Math.clamp(0, 1000, Math.idiv(local * 1000, 3100))
    let naveX = -18 + Math.idiv(avance * 202, 1000)
    let naveY = 45 + Math.idiv(avance * 23, 1000)
    let escalaNave = 1 + Math.min(2, Math.idiv(avance, 350))
    dibujarNavePasadaIntro(naveX, naveY, escalaNave)

    if (local >= 350 && local < 1850) {
        screen.fillRect(5, 91, 150, 10, COLOR_FONDO)
        screen.drawLine(5, 90, 154, 90, COLOR_AZUL)
        subtituloIntro(Textos.t(497), 94, COLOR_TEXTO)
    } else if (local >= 1850 && local < 2900) {
        screen.fillRect(5, 91, 150, 10, COLOR_FONDO)
        screen.drawLine(5, 90, 154, 90, COLOR_AZUL)
        subtituloIntro(Textos.t(498), 94, COLOR_AMARILLO)
    }
    if (local >= 2650) {
        let alerta = Math.idiv(local, 110) % 2 == 0 ? COLOR_ROJO : COLOR_AMARILLO
        screen.fillRect(145, 18, 3, 3, alerta)
        screen.fillRect(151, 25, 3, 3, alerta)
        screen.fillRect(142, 32, 3, 3, alerta)
    }
}

function dibujarSaltoIntro(local: number): void {
    for (let i = 0; i < 24; i++) {
        let bordeX = azarEstable(i, 71, 13) % 160
        let bordeY = 8 + azarEstable(i, 43, 29) % 99
        let fase = (Math.idiv(local, 42) + i * 3) % 12
        let inicio = 2 + fase
        let fin = Math.min(14, inicio + 3)
        let x0 = 80 + Math.idiv((bordeX - 80) * inicio, 14)
        let y0 = 58 + Math.idiv((bordeY - 58) * inicio, 14)
        let x1 = 80 + Math.idiv((bordeX - 80) * fin, 14)
        let y1 = 58 + Math.idiv((bordeY - 58) * fin, 14)
        screen.drawLine(x0, y0, x1, y1, i % 3 == 0 ? COLOR_CIAN : COLOR_TENUE)
    }
}

function dibujarCombateIntro(local: number): void {
    if (local >= 3900) {
        if (local < 4010) screen.fill(COLOR_TEXTO)
        else if (local < 4120) screen.fill(COLOR_CIAN)
        else screen.fill(COLOR_FONDO)
        return
    }

    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 3)
    let sacudidaX = 0
    let sacudidaY = 0
    if (local >= 850 && local < 1750) {
        sacudidaX = azarEstable(Math.idiv(local, 35), 3, 7) % 3 - 1
        sacudidaY = azarEstable(Math.idiv(local, 41), 5, 9) % 3 - 1
    }

    let heroeX = 80
    if (local >= 2100 && local < 2750) heroeX += Math.idiv((local - 2100) * 16, 650)
    else if (local >= 2750 && local < 3400) heroeX += 16 - Math.idiv((local - 2750) * 16, 650)
    let heroeY = 80

    let avanceEnemigo1 = Math.clamp(0, 1000, Math.idiv(local * 1000, 700))
    let enemigo1X = 168 - Math.idiv(avanceEnemigo1 * 45, 1000)
    let enemigo1Y = 22 + Math.idiv(avanceEnemigo1 * 14, 1000)
    let avanceEnemigo2 = Math.clamp(0, 1000, Math.idiv((local - 450) * 1000, 750))
    let enemigo2X = -15 + Math.idiv(avanceEnemigo2 * 52, 1000)
    let enemigo2Y = 29 + Math.idiv(avanceEnemigo2 * 15, 1000)
    let avanceEnemigo3 = Math.clamp(0, 1000, Math.idiv((local - 2200) * 1000, 800))
    let enemigo3X = 132 - Math.idiv(avanceEnemigo3 * 27, 1000)
    let enemigo3Y = -12 + Math.idiv(avanceEnemigo3 * 41, 1000)

    if (local < 1900) dibujarEnemigoIntro(enemigo1X, enemigo1Y, 1)
    if (local >= 450 && local < 3200) dibujarEnemigoIntro(enemigo2X, enemigo2Y, 1)
    if (local >= 2200) dibujarEnemigoIntro(enemigo3X, enemigo3Y, local >= 3450 ? 2 : 1)
    dibujarNaveCombateIntro(heroeX + sacudidaX, heroeY + sacudidaY, 2)

    if (local >= 700 && local < 1450) {
        screen.drawLine(enemigo1X, enemigo1Y + 5, heroeX - 5 + sacudidaX, heroeY - 14 + sacudidaY, COLOR_ROJO)
        screen.drawLine(enemigo1X + 3, enemigo1Y + 5, heroeX + 6 + sacudidaX, heroeY - 13 + sacudidaY, COLOR_NARANJA)
        if (local >= 950)
            screen.drawLine(enemigo2X, enemigo2Y + 5, heroeX - 10 + sacudidaX, heroeY - 9 + sacudidaY, COLOR_ROJO)
    }
    if (local >= 850 && local < 1700) {
        let pulsoEscudo = Math.idiv(local, 65) % 3
        dibujarRomboVista(heroeX + sacudidaX, heroeY - 2 + sacudidaY, 24 +
            pulsoEscudo, 16 + pulsoEscudo, COLOR_CIAN)
        dibujarRomboVista(heroeX + sacudidaX, heroeY - 2 + sacudidaY, 30 +
            pulsoEscudo, 20 + pulsoEscudo,
            pulsoEscudo == 0 ? COLOR_TEXTO : COLOR_AZUL)
    }
    if (local >= 1450 && local < 2200) {
        screen.drawLine(heroeX - 7 + sacudidaX, heroeY - 17 + sacudidaY, enemigo1X - 2, enemigo1Y + 6, COLOR_CIAN)
        screen.drawLine(heroeX + 7 + sacudidaX, heroeY - 17 + sacudidaY, enemigo1X + 2, enemigo1Y + 6, COLOR_AMARILLO)
    }
    if (local >= 1900 && local < 2600) dibujarExplosionIntro(123, 36, local - 1900, 15)

    if (local >= 2250 && local < 3500) {
        dibujarCapsulaRescateIntro(74, 39)
        if (local >= 2600) {
            screen.drawLine(heroeX - 4, heroeY - 14, 71, 47, COLOR_VERDE)
            screen.drawLine(heroeX + 4, heroeY - 14, 77, 47, COLOR_CIAN)
        }
    }
    if (local >= 2350 && local < 2900)
        screen.drawLine(enemigo2X, enemigo2Y + 5, heroeX - 7, heroeY - 13, COLOR_ROJO)
    if (local >= 2880 && local < 3380) {
        screen.drawLine(heroeX - 6, heroeY - 17, enemigo2X - 2, enemigo2Y + 6, COLOR_CIAN)
        screen.drawLine(heroeX + 6, heroeY - 17, enemigo2X + 2, enemigo2Y + 6, COLOR_AMARILLO)
    }
    if (local >= 3200 && local < 3890) dibujarExplosionIntro(37, 44, local - 3200, 14)
    if (local >= 3450 && local < 3890) {
        screen.drawLine(enemigo3X - 4, enemigo3Y + 8, heroeX, heroeY - 15, COLOR_ROJO)
        screen.drawLine(enemigo3X + 4, enemigo3Y + 8, heroeX + 8, heroeY - 13, COLOR_NARANJA)
    }

    if (local < 850) subtituloIntro(Textos.t(499), 12, COLOR_ROJO)
    else if (local >= 2250 && local < 3500) subtituloIntro(Textos.t(500), 12, COLOR_CIAN)
    else if (local >= 3500) subtituloIntro(Textos.t(501), 12, COLOR_AMARILLO)
}

function dibujarHipersaltoIntro(local: number): void {
    if (local < 80) {
        screen.fill(COLOR_CIAN)
        return
    }
    if (local >= 2600) {
        if (local < 2700) screen.fill(COLOR_TEXTO)
        else screen.fill(COLOR_CIAN)
        return
    }

    screen.fill(COLOR_FONDO)
    let avance = Math.clamp(0, 1000, Math.idiv(local * 1000, 2600))
    dibujarSaltoIntro(local * (2 + Math.idiv(avance, 330)))
    for (let i = 0; i < 3; i++) {
        let faseAnillo = (avance + i * 330) % 1000
        let anillo = 8 + Math.idiv(faseAnillo * 66, 1000)
        let altoAnillo = 5 + Math.idiv(anillo * 3, 5)
        dibujarRomboVista(80, 56, anillo, altoAnillo, i == 0 ? COLOR_TEXTO :
            (i == 1 ? COLOR_CIAN : COLOR_AZUL))
    }

    let naveY = 82 - Math.idiv(avance * 25, 1000)
    let anchoNave = 12 - Math.idiv(avance * 6, 1000)
    let largoNave = 16 - Math.idiv(avance * 8, 1000)
    dibujarNaveDespegueIntro(80, naveY, anchoNave, largoNave, 8 +
        Math.idiv(avance * 8, 1000))
    if (local >= 250 && local < 1250) subtituloIntro(Textos.t(502), 14, COLOR_VERDE)
    else if (local >= 1250) subtituloIntro(Textos.t(503), 14, COLOR_AMARILLO)
}

function dibujarLlegadaIntro(local: number): void {
    if (local < 90) {
        screen.fill(COLOR_TEXTO)
        return
    }
    if (local < 170) {
        screen.fill(COLOR_CIAN)
        return
    }

    screen.fill(COLOR_FONDO)
    dibujarEstrellasIntro(local, 1)

    // Amanecer sobre un planeta, bajo una gigantesca estación espacial.
    screen.fillCircle(80, 147, 74, COLOR_NARANJA)
    screen.drawCircle(80, 147, 75, COLOR_AMARILLO)
    screen.drawCircle(80, 147, 72, COLOR_OXIDO)
    screen.drawLine(23, 94, 137, 94, COLOR_OXIDO)
    screen.drawLine(16, 103, 144, 103, COLOR_AMARILLO)

    screen.drawLine(10, 42, 35, 29, COLOR_CIAN)
    screen.drawLine(35, 29, 80, 22, COLOR_TENUE)
    screen.drawLine(80, 22, 125, 29, COLOR_TENUE)
    screen.drawLine(125, 29, 150, 42, COLOR_CIAN)
    screen.drawLine(150, 42, 125, 56, COLOR_AZUL)
    screen.drawLine(125, 56, 80, 62, COLOR_TENUE)
    screen.drawLine(80, 62, 35, 56, COLOR_TENUE)
    screen.drawLine(35, 56, 10, 42, COLOR_AZUL)
    screen.drawLine(24, 42, 45, 34, COLOR_METAL)
    screen.drawLine(45, 34, 80, 29, COLOR_METAL)
    screen.drawLine(80, 29, 115, 34, COLOR_METAL)
    screen.drawLine(115, 34, 136, 42, COLOR_METAL)
    screen.drawLine(136, 42, 115, 50, COLOR_METAL)
    screen.drawLine(115, 50, 80, 55, COLOR_METAL)
    screen.drawLine(80, 55, 45, 50, COLOR_METAL)
    screen.drawLine(45, 50, 24, 42, COLOR_METAL)
    screen.fillRect(77, 12, 7, 60, COLOR_SOMBRA)
    screen.drawRect(77, 12, 7, 60, COLOR_TEXTO)
    screen.drawLine(18, 107, 70, 59, COLOR_CIAN)
    screen.drawLine(142, 107, 90, 59, COLOR_CIAN)
    screen.drawLine(48, 107, 75, 62, COLOR_AZUL)
    screen.drawLine(112, 107, 85, 62, COLOR_AZUL)

    let colorLuz = Math.idiv(local, 140) % 2 == 0 ? COLOR_AMARILLO : COLOR_CIAN
    screen.setPixel(24, 42, colorLuz)
    screen.setPixel(45, 34, colorLuz)
    screen.setPixel(115, 34, colorLuz)
    screen.setPixel(136, 42, colorLuz)
    screen.setPixel(80, 22, COLOR_ROJO)
    screen.setPixel(80, 62, COLOR_VERDE)

    let avanceLlegada = Math.clamp(0, 1000, Math.idiv((local - 250) * 1000, 1900))
    let naveY = 101 - Math.idiv(avanceLlegada * 36, 1000)
    dibujarNaveDespegueIntro(80, naveY, 6, 8, 5)
    if (local >= 750 && local < 1500) {
        screen.fillRect(38, 79, 84, 12, COLOR_FONDO)
        subtituloIntro(Textos.t(504), 81, COLOR_AMARILLO)
    } else if (local >= 1500) {
        screen.fillRect(20, 93, 120, 10, COLOR_FONDO)
        subtituloIntro(Textos.t(505), 96, COLOR_TEXTO)
    }
}

function dibujarRevelacionTituloIntro(local: number): void {
    if (local < 90) {
        screen.fill(COLOR_TEXTO)
        return
    }
    if (local < 170) {
        screen.fill(COLOR_CIAN)
        return
    }

    if (local >= 2300) {
        dibujarTitulo()
        return
    }

    // Desde aquí, el campo de estrellas y el logotipo usan exactamente las coordenadas de la pantalla de título.
    screen.fill(COLOR_FONDO)
    for (let i = 0; i < 22; i++) {
        let x = azarEstable(i, 3, 9) % 160
        let y = azarEstable(i, 7, 2) % 105
        screen.setPixel(x, y, i % 4 == 0 ? COLOR_CIAN : COLOR_TENUE)
    }
    if (local < 500) {
        let anilloSalto = Math.max(2, 37 - Math.idiv((local - 170) * 35, 330))
        screen.drawCircle(80, 57, anilloSalto, COLOR_CIAN)
        if (anilloSalto > 5) screen.drawCircle(80, 57, anilloSalto - 3, COLOR_AZUL)
    }
    let lineaMitad = Math.clamp(0, 58, Math.idiv((local - 180) * 58, 520))
    screen.drawLine(80 - lineaMitad, 35, 80 + lineaMitad, 35, COLOR_CIAN)
    screen.drawLine(80 - lineaMitad, 70, 80 + lineaMitad, 70, COLOR_CIAN)

    if (local >= 330) imprimirTextoJuego("CALLIOPE HACKER", 35, 11, COLOR_VERDE)
    if (local >= 500) {
        dibujarTituloJuego(41, 14)
        screen.drawLine(68, 78, 80, 72, COLOR_VERDE)
        screen.drawLine(80, 72, 92, 78, COLOR_VERDE)
        screen.drawLine(92, 78, 80, 84, COLOR_VERDE)
        screen.drawLine(80, 84, 68, 78, COLOR_VERDE)
    }
    if (local >= 1180 && local < 2100) subtituloIntro(Textos.t(506), 89, COLOR_TEXTO)
    if (local >= 1750 && local < 2100) subtituloIntro(Textos.t(507), 99, COLOR_AMARILLO)
}

function dibujarIntro(): void {
    let transcurrido = introTranscurrido()
    if (transcurrido < INTRO_ABIERTO_FIN_MS) dibujarAperturaIntro(transcurrido)
    else if (transcurrido < INTRO_PROLOGO_FIN_MS) dibujarPrologoIntro(transcurrido - INTRO_ABIERTO_FIN_MS)
    else if (transcurrido < INTRO_HANGAR_FIN_MS) dibujarHangarIntro(transcurrido - INTRO_PROLOGO_FIN_MS)
    else if (transcurrido < INTRO_GIRO_FIN_MS) dibujarGiroIntro(transcurrido - INTRO_HANGAR_FIN_MS)
    else if (transcurrido < INTRO_COMBATE_FIN_MS) dibujarCombateIntro(transcurrido - INTRO_GIRO_FIN_MS)
    else if (transcurrido < INTRO_SALTO_FIN_MS) dibujarHipersaltoIntro(transcurrido - INTRO_COMBATE_FIN_MS)
    else if (transcurrido < INTRO_LLEGADA_FIN_MS) dibujarLlegadaIntro(transcurrido - INTRO_SALTO_FIN_MS)
    else dibujarRevelacionTituloIntro(transcurrido - INTRO_LLEGADA_FIN_MS)
    // La indicación para saltar sigue el tiempo de reproducción (tiempoReproduccionIntro), por eso sigue encendida
    // cuando empieza la tarjeta del estudio.
    if (transcurrido < INTRO_LLEGADA_FIN_MS + 2300) dibujarFranjasIntro(tiempoReproduccionIntro())
}

function subtituloIntro(texto: string, y: number, color: number): void {
    imprimirTextoJuego(texto, Math.max(2, Math.idiv(160 - texto.length * 6, 2)), y, color)
}
