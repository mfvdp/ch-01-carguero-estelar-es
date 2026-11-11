// Diseño central del sonido para el altavoz del Calliope mini 3 y del GameKit. Las notas cortas y agudas se oyen mucho
// mejor en el altavoz pequeño que los golpes graves.
const CLAVE_ESCALON_SONIDO = "ot.sound.level"
const CLAVE_DENSIDAD_EFECTO = "ot.sound.fx"
const VOLUMENES_ESCALON_SONIDO = hex`0060a8e6`
const NOMBRES_ESCALON_SONIDO = hex`c9007002eb007102`
const NOMBRES_DENSIDAD_EFECTO = hex`2000eb007202`
// Número de niveles de densidad. NOMBRES_DENSIDAD_EFECTO tiene entradas de 16 bits, por eso su longitud es el doble de
// este valor y no coincide con él.
const CANTIDAD_DENSIDADES_EFECTO = 3
const ESCALON_SONIDO_INICIAL = 2
const DENSIDAD_EFECTO_INICIAL = 1
const INTRO_TEMA_PELICULA_RITMO = 120
// Como el reproductor de melodías de MakeCode, tocarTemaIntro cuenta pasos enteros: floor(15000 / ritmo). 159 BPM
// dan 94 ms por unidad de duración y, con ello, 48,128 s para esta partitura de 512 unidades.
const INTRO_TEMA_NORMAL_RITMO = 159
// No se lee en ninguna parte del juego; el tema del intro, más abajo, dura 512 unidades de duración.
const INTRO_TEMA_PULSOS = 128
const SONIDO_CONFIRMACION_NOTAS = [1319, 1760]
const SONIDO_ESCUDO_RUPTURA_NOTAS = [2093, 1568, 1047, 740]
const SONIDO_ALARMA_NOTAS = [2093, 0, 2093]
// El tema del intro como pares de bytes (nota, duración): nota = índice de music.lookupFrequency, 0 = silencio; la
// duración cuenta unidades del tempo. Los dos tempos (PELÍCULA y NORMAL) tocan las mismas notas. Bytes en lugar de
// objetos Melody ahorran memoria.
const INTRO_TEMA = hex`3a023d024104460841043d0438043a043a0841043d043a043d044108440441043f043d044604440441083f0441044404460841043f043d043a023a023d023a0241023a023d023a02380238023c0238023f0238023c0238023a023a023d023f0241023f023d023c023a0841043d043a0838043a043d04410846043a023a023d023f0241043f043d043a0438083a043d044108000441044404460449084604440441043f0441024402460441083a023a023d023a023f023d023a0238023a043d0441043f043d043c043a043804350238023c023f02410446083a023c023d023f02410242024402460248024902460448044910460841043d043a043d044104440446083a023d0241024604440441043d083a06`
let generacionTemaIntro = 0
let escenaAmbiente = -1
let faseAmbiente = -1
let mundoAmbiente = -1
let sonidoAmbienteSiguienteMs = 0
let generacionSonido = 0
let escalonSonido = ESCALON_SONIDO_INICIAL
let densidadEfecto = DENSIDAD_EFECTO_INICIAL
let patronesJuegoActivo = 0
let sonidoConfirmacionSiguienteMs = 0
let sonidoRupturaEscudoSiguienteMs = 0
let sonidoAlarmaSiguienteMs = 0

// Detiene todos los sonidos del mezclador: la llamada nativa de music.stopAllSounds(). El juego nunca arranca objetos
// Melody, canciones ni reproducciones en bucle, así que el resto de stopAllSounds no tenía nada que detener; el tema
// del intro se detiene mediante generacionTemaIntro.
//% shim=music::stopPlaying
function detenerMezclador(): void { }

function detenerSonidosJuego(): void {
    generacionSonido++
    patronesJuegoActivo = 0
    generacionTemaIntro++
    detenerMezclador()
}

function escalonSonidoParaVolumen(volumen: number): number {
    for (let i = 0; i < VOLUMENES_ESCALON_SONIDO.length; i++) {
        if (VOLUMENES_ESCALON_SONIDO[i] == volumen) return i
    }
    return ESCALON_SONIDO_INICIAL
}

function prepararSonido(): void {
    detenerSonidosJuego()
    if (settings.exists(CLAVE_ESCALON_SONIDO))
        escalonSonido = escalonSonidoParaVolumen(settings.readNumber(CLAVE_ESCALON_SONIDO))
    else escalonSonido = ESCALON_SONIDO_INICIAL
    if (settings.exists(CLAVE_DENSIDAD_EFECTO)) {
        let densidadGuardada = Math.round(settings.readNumber(CLAVE_DENSIDAD_EFECTO))
        densidadEfecto = densidadGuardada >= 0 && densidadGuardada <= 2 ? densidadGuardada : DENSIDAD_EFECTO_INICIAL
    } else densidadEfecto = DENSIDAD_EFECTO_INICIAL
    music.setVolume(VOLUMENES_ESCALON_SONIDO[escalonSonido])
    escenaAmbiente = -1
    faseAmbiente = -1
    mundoAmbiente = -1
    sonidoAmbienteSiguienteMs = 0
}

function cambiarEscalonSonido(diferencia: number): void {
    let siguiente = (escalonSonido + diferencia) % VOLUMENES_ESCALON_SONIDO.length
    if (siguiente < 0) siguiente += VOLUMENES_ESCALON_SONIDO.length
    if (siguiente == escalonSonido) return
    detenerSonidosJuego()
    escalonSonido = siguiente
    let volumen = VOLUMENES_ESCALON_SONIDO[escalonSonido]
    music.setVolume(volumen)
    settings.writeNumber(CLAVE_ESCALON_SONIDO, volumen)
    sonidoAmbienteSiguienteMs = game.runtime() + 250
}

function nombreEscalonSonido(): string {
    return Textos.t(tablaI16(NOMBRES_ESCALON_SONIDO, escalonSonido))
}

function cambiarDensidadEfecto(diferencia: number): void {
    let siguiente = (densidadEfecto + diferencia) % CANTIDAD_DENSIDADES_EFECTO
    if (siguiente < 0) siguiente += CANTIDAD_DENSIDADES_EFECTO
    if (siguiente == densidadEfecto) return
    densidadEfecto = siguiente
    settings.writeNumber(CLAVE_DENSIDAD_EFECTO, densidadEfecto)
    sonidoAmbienteSiguienteMs = game.runtime() + 350
}

function nombreDensidadEfecto(): string {
    return Textos.t(tablaI16(NOMBRES_DENSIDAD_EFECTO, densidadEfecto))
}

function limitePatronEfecto(): number {
    // Uno, dos o tres patrones cortos a la vez. Incluso DENSO se queda por debajo de la carga de canales que provocó
    // cortes en el Calliope mini 3.
    return densidadEfecto + 1
}

function retrasoAmbiente(retrasoBaseMs: number): number {
    if (densidadEfecto == 0) return Math.idiv(retrasoBaseMs * 16, 10)
    if (densidadEfecto == 2) return Math.idiv(retrasoBaseMs * 7, 10)
    return retrasoBaseMs
}

function frecuenciaAudible(frecuencia: number): number {
    if (frecuencia <= 0) return 700
    while (frecuencia < 700) frecuencia *= 2
    return Math.clamp(700, 2200, frecuencia)
}

// Se ejecuta en un proceso de fondo (fiber) y no frena la animación (justo lo que hacía music.tonePlayable con
// PlaybackMode.InBackground, sin enlazar las clases Playable).
function tocarTonoJuego(frecuencia: number, duracion: number): void {
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0) return
    let tono = frecuenciaAudible(frecuencia)
    let largo = Math.max(70, duracion)
    control.runInParallel(function () { music.playTone(tono, largo) })
}

function tocarPatronJuego(notas: number[], duracion: number, hueco: number): void {
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0 || patronesJuegoActivo >= limitePatronEfecto()) return
    let generacion = generacionSonido
    patronesJuegoActivo++
    control.runInParallel(function () {
        for (let i = 0; i < notas.length; i++) {
            if (generacion != generacionSonido) return
            if (notas[i] > 0) music.playTone(frecuenciaAudible(notas[i]), Math.max(70, duracion))
            else pause(Math.max(70, duracion))
            if (hueco > 0 && i < notas.length - 1) pause(hueco)
        }
        if (generacion == generacionSonido) patronesJuegoActivo = Math.max(0, patronesJuegoActivo - 1)
    })
}

function tocarBarridoJuego(onda: WaveShape, frecuenciaInicio: number, frecuenciaFin: number, duracion: number,
    efecto: SoundExpressionEffect): void {
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0) return
    music.playInstructions(0,
        crearBufferBarridoJuego(onda, frecuenciaInicio, frecuenciaFin, duracion, efecto, music.volume()))
}

// Construye el mismo búfer de instrucciones que music.soundToInstructionBuffer(wave, start, end, 180, 0, duración,
// efecto, InterpolationCurve.Curve, 20, 1, volumenTotal) de Arcade 4.2.1, sin las clases SoundEffect.
function crearBufferBarridoJuego(onda: WaveShape, frecuenciaInicio: number, frecuenciaFin: number, duracion: number,
    efecto: SoundExpressionEffect, volumenTotal: number): Buffer {
    const volumenInicio = 180
    const volumenFin = 0
    let pasosEfecto = Math.min(20, Math.floor(duracion / 5))
    let tramoTiempo = duracion / pasosEfecto
    let frecuencias: number[] = []
    let volumenes: number[] = []
    for (let i = 0; i < pasosEfecto; i++) {
        let t = i * tramoTiempo
        let frecuencia = frecuenciaInicio + (frecuenciaFin - frecuenciaInicio) *
            Math.sin(t / duracion * (Math.PI / 2))
        let volumen =
            ((volumenInicio + t * (volumenFin - volumenInicio) / duracion) / 255) * volumenTotal
        if (efecto === SoundExpressionEffect.Tremolo) {
            if (i % 2 === 0) volumen = Math.max(volumen - 500, 0)
            else volumen = Math.min(volumen + 500, 1023)
        } else if (efecto === SoundExpressionEffect.Vibrato) {
            if (i % 2 === 0) frecuencia = Math.max(frecuencia - 100, 0)
            else frecuencia = frecuencia + 100
        } else if (efecto === SoundExpressionEffect.Warble) {
            if (i % 2 === 0) frecuencia = Math.max(frecuencia - 1000, 0)
            else frecuencia = frecuencia + 1000
        }
        frecuencias.push(frecuencia)
        volumenes.push(volumen)
    }
    let salida = control.createBuffer(12 * (pasosEfecto - 1))
    let duracionPasoMs = Math.floor(duracion / (pasosEfecto - 1))
    // Forma de onda como valor: seno 3, diente de sierra 2, triángulo 1, cuadrada 15, ruido 18 (índice = WaveShape)
    let valorOnda = hex`0302010f12`[onda]
    for (let i = 0; i < pasosEfecto - 1; i++) {
        let posicion = i * 12
        salida.setNumber(NumberFormat.UInt8LE, posicion, valorOnda)
        salida.setNumber(NumberFormat.UInt16LE, posicion + 2, frecuencias[i])
        salida.setNumber(NumberFormat.UInt16LE, posicion + 4, duracionPasoMs)
        salida.setNumber(NumberFormat.UInt16LE, posicion + 6, volumenes[i])
        salida.setNumber(NumberFormat.UInt16LE, posicion + 8, volumenes[i + 1])
        salida.setNumber(NumberFormat.UInt16LE, posicion + 10, frecuencias[i + 1])
    }
    return salida
}

function iniciarMusicaIntro(): void {
    detenerSonidosJuego()
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0) return
    tocarTemaIntro(introUsaRitmoPelicula() ? INTRO_TEMA_PELICULA_RITMO : INTRO_TEMA_NORMAL_RITMO)
}

// Misma planificación y volumen que music.MelodyPlayer.play para una lista sencilla de notas (onda
// triangular, sin envolvente).
function tocarTemaIntro(ritmo: number): void {
    let generacion = generacionTemaIntro
    let volumen = Math.clamp(0, 255, (music.volume() * music.volume()) >> 8)
    control.runInParallel(function () {
        let pulso = Math.idiv(15000, ritmo)
        let tiempoInicioMs = control.millis()
        let posTiempo = 0
        let ahora = 0
        for (let i = 0; i < INTRO_TEMA.length; i += 2) {
            if (generacion != generacionTemaIntro) return
            let ms = INTRO_TEMA[i + 1] * pulso
            let numeroNota = INTRO_TEMA[i]
            if (numeroNota > 0) {
                let hz = music.lookupFrequency(numeroNota)
                let nota = control.createBuffer(13)
                music.addNote(nota, 0, ms, 255, 255, 1, hz, volumen, hz)
                music.playInstructions(posTiempo - ahora, nota.slice(0, 12))
            }
            posTiempo += ms
            let tiempoRestante = posTiempo - ahora
            if (tiempoRestante > 200) {
                pause(tiempoRestante - 100)
                ahora = control.millis() - tiempoInicioMs
            }
        }
    })
}

function entradaSonidoPrologo(entrada: number): void {
    if (entrada == 0) tocarPatronJuego([880, 1047, 1319], 85, 30)
    else if (entrada == 1) tocarBarridoJuego(WaveShape.Noise, 1500, 480, 420, SoundExpressionEffect.Tremolo)
    else if (entrada == 2) tocarSonidoEncuentro()
    else tocarPatronJuego([988, 1319, 1760], 105, 35)
}

function entradaSonidoIntro(entrada: number): void {
    if (entrada == 0) return
    else if (entrada == 1) tocarPatronJuego([1568, 2093], 75, 20)
    else if (entrada == 2) tocarBarridoJuego(WaveShape.Sawtooth, 760, 520, 380, SoundExpressionEffect.Tremolo)
    else if (entrada == 3) tocarBarridoJuego(WaveShape.Sawtooth, 520, 1450, 480, SoundExpressionEffect.Vibrato)
    else if (entrada == 4) tocarBarridoJuego(WaveShape.Square, 740, 1950, 520, SoundExpressionEffect.Warble)
    else if (entrada == 5) tocarPatronJuego([1319, 0, 1760], 85, 45)
    else if (entrada == 6) tocarSonidoEncuentro()
    else if (entrada == 7) tocarSonidoBloqueoEnemigo()
    else if (entrada == 8) tocarBarridoJuego(WaveShape.Square, 2200, 900, 160, SoundExpressionEffect.None)
    else if (entrada == 9) tocarBarridoJuego(WaveShape.Noise, 1150, 420, 260, SoundExpressionEffect.Tremolo)
    else if (entrada == 10) tocarBarridoJuego(WaveShape.Noise, 900, 180, 480, SoundExpressionEffect.Warble)
    else if (entrada == 11) tocarSonidoSenalRescate()
    else if (entrada == 12) tocarBarridoJuego(WaveShape.Sawtooth, 740, 1200, 420, SoundExpressionEffect.Vibrato)
    else if (entrada == 13) tocarBarridoJuego(WaveShape.Sawtooth, 920, 1720, 440, SoundExpressionEffect.Vibrato)
    else if (entrada == 14) tocarBarridoJuego(WaveShape.Square, 1250, 2200, 560, SoundExpressionEffect.Warble)
    else if (entrada == 15) tocarPatronJuego([988, 1319], 100, 35)
    else if (entrada == 16) tocarPatronJuego([1175, 1568], 90, 35)
    else if (entrada == 17) tocarPatronJuego([1319, 1568], 85, 25)
    else if (entrada == 18) tocarPatronJuego([1568, 1760], 85, 20)
    else tocarPatronJuego([1760, 2093], 95, 20)
}

function tocarSonidoTitulo(): void {
    detenerSonidosJuego()
    tocarPatronJuego([880, 1047, 1319, 1760], 115, 25)
}

function tocarSonidoNavegar(): void {
    tocarTonoJuego(1175, 70)
}

// Acción positiva del menú: las dos últimas notas del sonido de misión, más cortas y con una pausa más pequeña.
function tocarSonidoConfirmacion(): void {
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0) return
    let ahora = game.runtime()
    if (ahora < sonidoConfirmacionSiguienteMs) return
    sonidoConfirmacionSiguienteMs = ahora + 140
    tocarPatronJuego(SONIDO_CONFIRMACION_NOTAS, 70, 15)
}

// Se rompe el escudo de quien juega. La línea descendente se oye bien incluso entre el ruido del combate.
function tocarSonidoRupturaEscudo(): void {
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0) return
    let ahora = game.runtime()
    if (ahora < sonidoRupturaEscudoSiguienteMs) return
    sonidoRupturaEscudoSiguienteMs = ahora + 600
    tocarPatronJuego(SONIDO_ESCUDO_RUPTURA_NOTAS, 70, 8)
}

// Aviso crítico. Se puede llamar en cada imagen; como máximo se admite un pulso cada 900 ms.
function tocarSonidoAlarma(): void {
    if (VOLUMENES_ESCALON_SONIDO[escalonSonido] == 0) return
    let ahora = game.runtime()
    if (ahora < sonidoAlarmaSiguienteMs) return
    sonidoAlarmaSiguienteMs = ahora + 900
    tocarPatronJuego(SONIDO_ALARMA_NOTAS, 70, 35)
}

function tocarSonidoCompra(): void {
    tocarPatronJuego([1319, 1760], 80, 20)
}

function tocarSonidoVenta(): void {
    tocarPatronJuego([1568, 1175], 80, 20)
}

function tocarSonidoMision(): void {
    tocarPatronJuego([988, 1319, 1760], 95, 20)
}

function tocarSonidoError(): void {
    tocarPatronJuego([784, 740], 120, 20)
}

function tocarSonidoDespegue(): void {
    tocarPatronJuego([740, 880, 1175, 1568], 95, 20)
}

function tocarSonidoCrucero(): void {
    tocarPatronJuego([880, 988], 80, 20)
}

function tocarSonidoEncuentro(): void {
    tocarPatronJuego([740, 988, 740], 110, 45)
}

function tocarSonidoBloqueoEnemigo(): void {
    tocarPatronJuego([1760, 1760], 70, 55)
}

function tocarSonidoSenalRescate(): void {
    tocarPatronJuego([1319, 0, 1319], 100, 30)
}

function tocarSonidoRescateCumplido(): void {
    tocarPatronJuego([988, 1319, 1760], 100, 25)
}

function tocarSonidoAcercamiento(): void {
    tocarPatronJuego([1175, 1319], 90, 30)
}

function tocarSonidoHuida(): void {
    tocarPatronJuego([880, 1175, 1568], 90, 20)
}

function tocarSonidoLaser(impacto: boolean): void {
    if (impacto) tocarPatronJuego([2093, 1568], 70, 5)
    else tocarTonoJuego(1760, 75)
}

function tocarSonidoExplosion(): void {
    tocarPatronJuego([1047, 880, 740], 110, 10)
}

function tocarSonidoDano(): void {
    tocarPatronJuego([784, 740], 115, 15)
}

function tocarSonidoNaveDestruida(): void {
    detenerSonidosJuego()
    tocarPatronJuego([1047, 880, 784, 740], 150, 25)
}

function tonoEstacion(frecuenciaBase: number, mundo: number): number {
    let variacion = Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo) % 3
    if (variacion == 1) return Math.idiv(frecuenciaBase * 9, 8)
    if (variacion == 2) return Math.idiv(frecuenciaBase * 5, 4)
    return frecuenciaBase
}

function tocarMotivoEstacion(mundo: number): void {
    let mundoSeguro = Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo)
    let grupo = faccionMundo(mundoSeguro)
    let pulso = 82 + (mundoSeguro % 2) * 18
    if (grupo == 0) {
        tocarPatronJuego([tonoEstacion(740, mundoSeguro), tonoEstacion(988, mundoSeguro),
            tonoEstacion(1175, mundoSeguro)], pulso, 24)
    } else if (grupo == 1) {
        tocarPatronJuego([tonoEstacion(784, mundoSeguro), tonoEstacion(1175, mundoSeguro), 0,
            tonoEstacion(988, mundoSeguro)], pulso, 18)
    } else if (grupo == 2) {
        tocarPatronJuego([tonoEstacion(880, mundoSeguro), tonoEstacion(1047, mundoSeguro),
            tonoEstacion(1319, mundoSeguro), tonoEstacion(1047, mundoSeguro)], pulso, 14)
    } else {
        tocarPatronJuego([tonoEstacion(740, mundoSeguro), tonoEstacion(880, mundoSeguro),
            tonoEstacion(740, mundoSeguro), tonoEstacion(1319, mundoSeguro)], pulso, 20)
    }
}

function tocarSonidoAtraque(): void {
    tocarMotivoEstacion(mundoActual)
}

function esAmbienteEstacion(): boolean {
    return escenaActiva == NumeroEscena.Hangar || escenaActiva == NumeroEscena.Mercado ||
        escenaActiva == NumeroEscena.Astillero ||
        escenaActiva == NumeroEscena.Misiones ||
            escenaActiva == NumeroEscena.MapaEstelar || escenaActiva == NumeroEscena.Estado
}

// Un ambiente sonoro ligero mantiene vivas las estaciones y el vuelo sin tapar los efectos importantes. Los menús de
// una misma estación comparten un ambiente, así que cambiar rápido no reinicia motivos ni crea fibers de más.
function actualizarAmbiente(): void {
    let fase = escenaActiva == NumeroEscena.Vuelo ? faseVuelo : -1
    let ahora = game.runtime()
    let escenaEstacion = esAmbienteEstacion()
    let grupoEscena = escenaEstacion ? 100 : escenaActiva
    let mundo = escenaEstacion ? mundoActual : -1
    if (escenaAmbiente != grupoEscena || faseAmbiente != fase || mundoAmbiente != mundo) {
        escenaAmbiente = grupoEscena
        faseAmbiente = fase
        mundoAmbiente = mundo
        sonidoAmbienteSiguienteMs = ahora + 900
    }
    if (ahora < sonidoAmbienteSiguienteMs) return
    if (escenaEstacion) {
        tocarMotivoEstacion(mundoActual)
        sonidoAmbienteSiguienteMs = ahora + retrasoAmbiente(4200 + (mundoActual % 5) * 320)
    } else if (escenaActiva == NumeroEscena.Vuelo &&
        (fase == FaseVuelo.Despegue || fase == FaseVuelo.Crucero)) {
        tocarPatronJuego([740, 784], 75, 10)
        sonidoAmbienteSiguienteMs = ahora + retrasoAmbiente(1250)
    } else if (escenaActiva == NumeroEscena.Vuelo && fase == FaseVuelo.Encuentro) {
        tocarTonoJuego(988, 75)
        sonidoAmbienteSiguienteMs = ahora + retrasoAmbiente(1450)
    } else if (escenaActiva == NumeroEscena.Vuelo && fase == FaseVuelo.Acercamiento) {
        tocarTonoJuego(1319, 80)
        sonidoAmbienteSiguienteMs = ahora + retrasoAmbiente(1650)
    } else sonidoAmbienteSiguienteMs = ahora + 60000
}
