// Los datos fijos del juego: mundos, mercancías, naves, misiones y la aventura.
const CANTIDAD_MUNDOS_PUBLICOS = 24
const CANTIDAD_MUNDOS = 26
const CANTIDAD_MERCANCIAS = 12
const CANTIDAD_MEJORAS = 10
const CANTIDAD_FACCIONES = 4
const CANTIDAD_RAREZAS = 3
const CANTIDAD_ARTEFACTOS = 4
const CANTIDAD_ROLES_NAVE = 3
const CANTIDAD_MODULOS_NAVE = 4
const CANTIDAD_ARMAS = 3
const CANTIDAD_LOGROS = 12
const CANTIDAD_PINTURAS = 6
const CANTIDAD_NOMBRES_NAVE = 8
const MUNDO_INICIO = 0
const CANTIDAD_OFERTAS_MISION = 5
const CANTIDAD_MISIONES_AVENTURA = 6

const MEJORA_CARGA = 0
const MEJORA_ESCUDO = 1
const MEJORA_BLINDAJE = 2
const MEJORA_LASER = 3
const MEJORA_REFRIGERADOR = 4
const MEJORA_PROPULSOR = 5
const MEJORA_ESCANER = 6
const MEJORA_SALTO = 7
const MEJORA_REPARACION = 8
const MEJORA_SEGURO = 9

const NOMBRES_MUNDO = [
    "LUMA", "VEXO", "NORI", "KAVO", "PIXA", "ZUNO",
    "MIRO", "TAVI", "REKO", "SOLA", "BIRI", "YUNO",
    "DOVA", "FENO", "RUNA", "KIRI", "JEXA", "WELA",
    "AURI", "MEKI", "ONDA", "QUBI", "ZERA", "TALO",
    "NEXUS-9", "EDEN-X"
]
const MUNDO_X = hex`0c2743607d9614304b6784970925405e7995122f4c6884995391`
const MUNDO_Y = hex`100b140d120a2b2531272f2648414d444f43655e695e675c3971`
const ECONOMIA_MUNDO = hex`0001050203040400020501030104000305020502030004010300`
const PELIGRO_MUNDO = hex`0001000201030100010002020102010203020001030102030301`
const FACCION_MUNDO = hex`0001010002000001010201020301000203020101000103000202`
const NOMBRES_ECONOMIA = hex`1a1b1c1d1e1f`
const NOMBRES_PELIGRO = hex`20212223`

// Cada mundo tiene un pequeño rasgo. Los recargos y descuentos son pequeños a propósito, para que el tipo de economía y
// las decisiones de quien juega pesen más que el rasgo.
const NOMBRES_RASGO_MUNDO = hex`2425262728292a2b2c2d2e2f303132333435363738393a3b3c3d`
const DETALLES_RASGO_MUNDO = hex`3e3f404142434445464748494a4b4c4d4e4f5051525354555657`
const PORCENTAJE_PRECIO_RASGO_MUNDO = hex`fefffdff00000400030005000200fcffffff0200fdff03000600fdfffcff0300070003000600feff07000100080005000a00faff`
const PORCENTAJE_ASTILLERO_RASGO_MUNDO = hex`f8ff0200f6ff08000000040003000000fcff02000500fbff0a00feff0100fdff0c0008000500faff0900feff0f0004001400f6ff`
const PELIGRO_RASGO_MUNDO = hex`0000000000000100000001000000ffff0000ffff0000010001000000ffff000001000100ffff000001000000010001000100ffff`

const NOMBRES_FACCION = hex`58595a5b`
const NOMBRES_RAREZA = hex`5c5d5e`
const VALORES_RAREZA = hex`8a0284037805`
const NOMBRES_ARTEFACTO = hex`5f606162`
const NOMBRES_NAVE = ["NOMAD", "KESTREL", "RAPTOR", "AURORA", "MERCURY", "NOVA", "PHOENIX", "ORBITER"]
const NOMBRES_PINTURA = hex`6b6c6d6e6f70`
const NOMBRES_ARMA = hex`71721b`
const NOMBRES_MODULO = hex`73747576`
const NOMBRES_FINAL = hex`775878797a`
const NOMBRES_LOGRO = hex`7b7c7d7e7f80818283848586`
const DETALLES_LOGRO = hex`8788898a8b8c8d8e8f909192`

const NOMBRES_MERCANCIA = hex`939495969798999a9b9c9d9e`
const PRECIO_BASE_MERCANCIA = hex`0a0e08162d1e1a3040527396`
// El bit n significa: la economía con el número n produce esta mercancía o la necesita.
const MASCARA_PRODUCTOR_MERCANCIA = hex`010111020210050408080c20`
const MASCARA_DEMANDA_MERCANCIA = hex`2a2406142807221b23341309`

const NOMBRES_MEJORA = hex`9fa0a171a2a374a4a5a6`
const MAX_MEJORA = hex`03030303020202030102`
const PRECIO1_MEJORA = hex`5e01f401c20126025e01c2012c015802dc058a02`
const PRECIO2_MEJORA = hex`52031405b004aa05e80314058403dc050000a406`
const PRECIO3_MEJORA = hex`0807540b8c0a800c000000000000800c00000000`

const NOMBRES_RANGO = hex`a7a8a9aaabac`

// La campaña reconstruye la red de comercio de la que habla el prólogo. En los nombres del código se llama aventura,
// porque campaña sin ñ se leería campana.
const TITULOS_AVENTURA = hex`adaeaf5db0b1`
const INFORMES_AVENTURA = hex`b2b3b4b5b6b7`
const RANGO_NECESARIO_AVENTURA = hex`000102030405`
const OBJETIVO_AVENTURA = hex`010710141617`
const CLASE_AVENTURA = [ClaseMision.Entrega, ClaseMision.Rescate, ClaseMision.Caza, ClaseMision.Entrega,
    ClaseMision.Rescate, ClaseMision.Caza]
const MERCANCIA_AVENTURA = hex`080800090800`
const VARIANTE_AVENTURA = [VarianteMision.Normal, VarianteMision.BajoFuego, VarianteMision.As,
    VarianteMision.Fragil, VarianteMision.BajoFuego, VarianteMision.As]
const CANTIDAD_AVENTURA = hex`020102020104`
const PAGO_AVENTURA = hex`a401bc024c040807f00a8813`

function produceEconomia(mercancia: number, economia: number): boolean {
    return (MASCARA_PRODUCTOR_MERCANCIA[mercancia] & (1 << economia)) != 0
}

function pideEconomia(mercancia: number, economia: number): boolean {
    return (MASCARA_DEMANDA_MERCANCIA[mercancia] & (1 << economia)) != 0
}

function azarEstable(a: number, b: number, c: number): number {
    let valor = (a * 109 + b * 47 + c * 23 + 97) % 32749
    valor = (valor * 73 + 41) % 32749
    return valor
}

function azarGalaxia(a: number, b: number, c: number): number {
    return azarEstable(a + semillaGalaxia, b + semillaGalaxia % 97, c + semillaGalaxia % 31)
}

function nombreFaccion(faccion: Faccion): string {
    return Textos.t(NOMBRES_FACCION[Math.clamp(0, CANTIDAD_FACCIONES - 1, faccion)])
}

function faccionMundo(mundo: number): Faccion {
    return FACCION_MUNDO[Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo)]
}

function nombreRareza(numero: Rareza): string {
    return Textos.t(NOMBRES_RAREZA[Math.clamp(0, CANTIDAD_RAREZAS - 1, numero)])
}

function valorRareza(numero: Rareza): number {
    let base = tablaI16(VALORES_RAREZA, Math.clamp(0, CANTIDAD_RAREZAS - 1, numero))
    return Math.max(1, Math.idiv(base * (100 + peligroMundoEficaz(mundoActual) * 5) + 50, 100))
}

function nombreArtefacto(numero: number): string {
    return Textos.t(NOMBRES_ARTEFACTO[Math.clamp(0, CANTIDAD_ARTEFACTOS - 1, numero)])
}

function nombreArma(clase: ClaseArma): string {
    return Textos.t(NOMBRES_ARMA[Math.clamp(0, CANTIDAD_ARMAS - 1, clase)])
}

function nombreFinal(final: ClaseFinal): string {
    return Textos.t(NOMBRES_FINAL[Math.clamp(0, NOMBRES_FINAL.length - 1, final)])
}

function nombreLogro(numero: number): string {
    return Textos.t(NOMBRES_LOGRO[Math.clamp(0, CANTIDAD_LOGROS - 1, numero)])
}

function detalleLogro(numero: number): string {
    return Textos.t(DETALLES_LOGRO[Math.clamp(0, CANTIDAD_LOGROS - 1, numero)])
}

function nombreRasgoMundo(mundo: number): string {
    return Textos.t(NOMBRES_RASGO_MUNDO[Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo)])
}

function detalleRasgoMundo(mundo: number): string {
    return Textos.t(DETALLES_RASGO_MUNDO[Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo)])
}

function porcentajePrecioRasgoMundo(mundo: number): number {
    return tablaI16(PORCENTAJE_PRECIO_RASGO_MUNDO, Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo))
}

function porcentajeAstilleroRasgoMundo(mundo: number): number {
    return tablaI16(PORCENTAJE_ASTILLERO_RASGO_MUNDO, Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo))
}

function ajustePeligroRasgoMundo(mundo: number): number {
    return tablaI16(PELIGRO_RASGO_MUNDO, Math.clamp(0, CANTIDAD_MUNDOS - 1, mundo))
}

function peligroMundoEficaz(mundo: number): number {
    let peligro = PELIGRO_MUNDO[mundo] + ajustePeligroRasgoMundo(mundo)
    if (sucesoMercadoActivoEn(mundo) && claseSucesoMercado == ClaseSucesoMercado.Bloqueo) peligro++
    return Math.clamp(0, 3, peligro)
}

function precioAstilleroEnMundo(mundo: number, precioBase: number): number {
    if (precioBase <= 0) return 0
    return Math.max(1, Math.idiv(precioBase * (100 + porcentajeAstilleroRasgoMundo(mundo)) + 50, 100))
}

function precioAstilleroMundo(precioBase: number): number {
    return precioAstilleroEnMundo(mundoActual, precioBase)
}

function actualizarSucesoMercado(): void {
    if (claseSucesoMercado != ClaseSucesoMercado.Ninguna && diaJuego <= finSucesoMercado) return
    let ciclo = diaJuego + Math.idiv(semillaGalaxia, 37)
    claseSucesoMercado = 1 + azarGalaxia(ciclo, secuenciaPartida + 17, 41) % 4
    mundoSucesoMercado = azarGalaxia(ciclo, claseSucesoMercado, 53) % CANTIDAD_MUNDOS_PUBLICOS
    mercanciaSucesoMercado = azarGalaxia(ciclo, mundoSucesoMercado, 67) % CANTIDAD_MERCANCIAS
    finSucesoMercado = diaJuego + 2 + azarGalaxia(ciclo, mercanciaSucesoMercado, 71) % 3
}

function sucesoMercadoActivoEn(mundo: number): boolean {
    return claseSucesoMercado != ClaseSucesoMercado.Ninguna &&
        diaJuego <= finSucesoMercado && mundoSucesoMercado == mundo
}

function porcentajePrecioSucesoMercado(mundo: number, mercancia: number): number {
    if (!sucesoMercadoActivoEn(mundo)) return 0
    if (claseSucesoMercado == ClaseSucesoMercado.Escasez) return mercancia == mercanciaSucesoMercado ? 42 : 6
    if (claseSucesoMercado == ClaseSucesoMercado.Excedente)
        return mercancia == mercanciaSucesoMercado ? -36 : -4
    if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo) return mercancia == mercanciaSucesoMercado ? 30 : 18
    if (claseSucesoMercado == ClaseSucesoMercado.Auge) return mercancia == mercanciaSucesoMercado ? 24 : 10
    return 0
}

function nombreSucesoMercado(): string {
    if (claseSucesoMercado == ClaseSucesoMercado.Escasez) return Textos.t(184)
    if (claseSucesoMercado == ClaseSucesoMercado.Excedente) return Textos.t(185)
    if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo) return Textos.t(186)
    if (claseSucesoMercado == ClaseSucesoMercado.Auge) return Textos.t(187)
    return Textos.t(32)
}

function detalleSucesoMercado(): string {
    if (claseSucesoMercado == ClaseSucesoMercado.Ninguna || diaJuego > finSucesoMercado) return Textos.t(188)
    let mercancia = Textos.t(NOMBRES_MERCANCIA[mercanciaSucesoMercado])
    let mundo = NOMBRES_MUNDO[mundoSucesoMercado]
    if (claseSucesoMercado == ClaseSucesoMercado.Escasez) return mercancia + Textos.t(189) + mundo
    if (claseSucesoMercado == ClaseSucesoMercado.Excedente) return mercancia + Textos.t(190) + mundo
    if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo) return Textos.t(191) + mundo
    return Textos.t(192) + mundo
}

function porcentajePagoMisionSucesoMercado(mundo: number, clase: ClaseMision, mercancia: number): number {
    if (!sucesoMercadoActivoEn(mundo)) return 0
    if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo) return 35
    if (claseSucesoMercado == ClaseSucesoMercado.Escasez && clase == ClaseMision.Entrega &&
        mercancia == mercanciaSucesoMercado) return 45
    if (claseSucesoMercado == ClaseSucesoMercado.Auge) return 20
    if (claseSucesoMercado == ClaseSucesoMercado.Excedente && clase == ClaseMision.Caza) return 10
    return 5
}

function distanciaMundo(desde: number, a: number): number {
    let dx = MUNDO_X[desde] - MUNDO_X[a]
    let dy = MUNDO_Y[desde] - MUNDO_Y[a]
    return Math.round(Math.sqrt(dx * dx + dy * dy))
}

function costeSalto(desde: number, a: number): number {
    if (desde == a) return 0
    return Math.max(1, Math.idiv(distanciaMundo(desde, a) + 17, 18))
}

function puedeLlegarMundo(mundo: number): boolean {
    if (!mundoVisible(mundo)) return false
    let coste = costeSalto(mundoActual, mundo)
    return mundo != mundoActual && coste <= costeSaltoMax() && coste <= combustible
}

function precioLocal(mundo: number, mercancia: number): number {
    let economia = ECONOMIA_MUNDO[mundo]
    let perfil = 0
    if (produceEconomia(mercancia, economia)) perfil = -28
    else if (pideEconomia(mercancia, economia)) perfil = 24
    let ruido = azarGalaxia(mundo, mercancia, diaJuego) % 17 - 8
    let porcentaje = 100 + perfil + ruido + peligroMundoEficaz(mundo) * 3
    porcentaje += porcentajePrecioRasgoMundo(mundo) + porcentajePrecioSucesoMercado(mundo, mercancia)
    if (influenciaMercado && influenciaMercado.length == CANTIDAD_MUNDOS) porcentaje += influenciaMercado[mundo]
    return Math.max(2, Math.idiv(PRECIO_BASE_MERCANCIA[mercancia] * porcentaje + 50, 100))
}

function precioCompra(mercancia: number): number {
    let porcentaje = 105 - Math.idiv(reputacionFaccion(faccionMundo(mundoActual)), 20)
    return Math.max(1, Math.idiv(precioLocal(mundoActual, mercancia) * porcentaje + 99, 100))
}

function precioVenta(mercancia: number): number {
    let porcentaje = 95 + Math.idiv(reputacionFaccion(faccionMundo(mundoActual)), 25)
    return Math.max(1, Math.idiv(precioLocal(mundoActual, mercancia) * porcentaje, 100))
}

function precioEnMundo(mundo: number, mercancia: number, compra: boolean): number {
    let local = precioLocal(mundo, mercancia)
    let reputacion = reputacionFaccion(faccionMundo(mundo))
    if (compra) return Math.max(1, Math.idiv(local * (105 - Math.idiv(reputacion, 20)) + 99, 100))
    return Math.max(1, Math.idiv(local * (95 + Math.idiv(reputacion, 25)), 100))
}

function renovarMercado(): void {
    actualizarSucesoMercado()
    if (!existenciasMercado || existenciasMercado.length != CANTIDAD_MERCANCIAS)
        existenciasMercado = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    let economia = ECONOMIA_MUNDO[mundoActual]
    for (let mercancia = 0; mercancia < CANTIDAD_MERCANCIAS; mercancia++) {
        let semilla = azarGalaxia(mundoActual, mercancia, diaJuego)
        if (produceEconomia(mercancia, economia)) existenciasMercado[mercancia] = 7 + semilla % 7
        else if (pideEconomia(mercancia, economia)) existenciasMercado[mercancia] = 1 + semilla % 3
        else existenciasMercado[mercancia] = 4 + semilla % 5
        if (influenciaMercado && influenciaMercado.length == CANTIDAD_MUNDOS) {
            existenciasMercado[mercancia] = Math.clamp(0, 99,
                existenciasMercado[mercancia] - Math.idiv(influenciaMercado[mundoActual], 4))
        }
        if (sucesoMercadoActivoEn(mundoActual)) {
            if (claseSucesoMercado == ClaseSucesoMercado.Escasez && mercancia == mercanciaSucesoMercado)
                existenciasMercado[mercancia] = Math.max(0, Math.idiv(existenciasMercado[mercancia], 3))
            else if (claseSucesoMercado == ClaseSucesoMercado.Excedente && mercancia == mercanciaSucesoMercado)
                existenciasMercado[mercancia] = Math.min(99, existenciasMercado[mercancia] + 9)
            else if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo)
                existenciasMercado[mercancia] = Math.max(0, Math.idiv(existenciasMercado[mercancia] + 1, 2))
            else if (claseSucesoMercado == ClaseSucesoMercado.Auge && mercancia == mercanciaSucesoMercado)
                existenciasMercado[mercancia] = Math.max(0, existenciasMercado[mercancia] - 2)
        }
    }
}

function mejorMercanciaComercio(objetivo: number): number {
    let mejorMercancia = 0
    let mejorMargen = -9999
    for (let mercancia = 0; mercancia < CANTIDAD_MERCANCIAS; mercancia++) {
        let margen = precioEnMundo(objetivo, mercancia, false) - precioCompra(mercancia)
        if (margen > mejorMargen) {
            mejorMargen = margen
            mejorMercancia = mercancia
        }
    }
    return mejorMercancia
}

function precioMejora(numero: number, nivelSiguiente: number): number {
    if (nivelSiguiente == 1) return precioAstilleroMundo(tablaI16(PRECIO1_MEJORA, numero))
    if (nivelSiguiente == 2) return precioAstilleroMundo(tablaI16(PRECIO2_MEJORA, numero))
    if (nivelSiguiente == 3) return precioAstilleroMundo(tablaI16(PRECIO3_MEJORA, numero))
    return 0
}

function rangoNecesarioAventura(etapa: number): number {
    if (etapa < 0 || etapa >= CANTIDAD_MISIONES_AVENTURA) return 5
    return RANGO_NECESARIO_AVENTURA[etapa]
}

function tituloAventura(etapa: number): string {
    if (etapa < 0 || etapa >= CANTIDAD_MISIONES_AVENTURA) return Textos.t(88)
    return Textos.t(TITULOS_AVENTURA[etapa])
}

function informeAventura(etapa: number): string {
    if (etapa < 0 || etapa >= CANTIDAD_MISIONES_AVENTURA) return Textos.t(205)
    return Textos.t(INFORMES_AVENTURA[etapa])
}

function claseMisionAventura(etapa: number): ClaseMision {
    return CLASE_AVENTURA[Math.clamp(0, CANTIDAD_MISIONES_AVENTURA - 1, etapa)]
}

function objetivoMisionAventura(etapa: number): number {
    return OBJETIVO_AVENTURA[Math.clamp(0, CANTIDAD_MISIONES_AVENTURA - 1, etapa)]
}

function mercanciaMisionAventura(etapa: number): number {
    return MERCANCIA_AVENTURA[Math.clamp(0, CANTIDAD_MISIONES_AVENTURA - 1, etapa)]
}

function varianteMisionAventura(etapa: number): VarianteMision {
    return VARIANTE_AVENTURA[Math.clamp(0, CANTIDAD_MISIONES_AVENTURA - 1, etapa)]
}

function cantidadMisionAventura(etapa: number): number {
    return CANTIDAD_AVENTURA[Math.clamp(0, CANTIDAD_MISIONES_AVENTURA - 1, etapa)]
}

function pagoMisionAventura(etapa: number): number {
    return tablaI16(PAGO_AVENTURA, Math.clamp(0, CANTIDAD_MISIONES_AVENTURA - 1, etapa))
}

function misionAventuraDisponible(): boolean {
    if (etapaTutorial < 4 || etapaAventura < 0 || etapaAventura >= CANTIDAD_MISIONES_AVENTURA) return false
    if (claseMision != ClaseMision.Ninguna || rangoActual() < rangoNecesarioAventura(etapaAventura)) return false
    return mundoActual != objetivoMisionAventura(etapaAventura)
}

function aventuraCumplida(): boolean {
    return etapaAventura >= CANTIDAD_MISIONES_AVENTURA
}

function avanzarEtapaAventura(): void {
    etapaAventura = Math.min(CANTIDAD_MISIONES_AVENTURA, etapaAventura + 1)
}

function ofertaDiariaDisponible(): boolean {
    return tienePartida && etapaTutorial >= 4 && claseMision == ClaseMision.Ninguna && diaMisionDiaria != diaJuego
}

function semillaMisionDiaria(): number {
    return azarGalaxia(diaJuego, nivelPartidaNuevaPlus + 211, 907)
}

function claseMisionDiaria(): ClaseMision {
    return 1 + semillaMisionDiaria() % 3
}

function objetivoMisionDiaria(): number {
    let objetivo = semillaMisionDiaria() % CANTIDAD_MUNDOS_PUBLICOS
    if (objetivo == mundoActual) objetivo = (objetivo + 7) % CANTIDAD_MUNDOS_PUBLICOS
    return objetivo
}

function mercanciaMisionDiaria(): number {
    return mercanciaMisionParaObjetivo(objetivoMisionDiaria(), semillaMisionDiaria())
}

function cantidadMisionDiaria(): number {
    if (claseMisionDiaria() == ClaseMision.Rescate) return 1
    return 2 + semillaMisionDiaria() % 4
}

function pagoMisionDiaria(): number {
    let distancia = distanciaMundo(mundoActual, objetivoMisionDiaria())
    return 400 + distancia * 5 + cantidadMisionDiaria() * 90 + nivelPartidaNuevaPlus * 100
}

function plazoMisionDiaria(): number {
    return diaJuego + Math.max(2, Math.idiv(distanciaMundo(mundoActual, objetivoMisionDiaria()) + 25, 26) + 2)
}

function marcarMisionDiariaAceptada(): void {
    diaMisionDiaria = diaJuego
    hechoMisionDiaria = 0
}

function cumplirMisionDiaria(): void {
    hechoMisionDiaria = 1
    ajustarReputacion(faccionMundo(objetivoMision), 3)
}

function fuenteOfertaMision(ranura: number): number {
    if (ranura == CANTIDAD_OFERTAS_MISION - 1 && ofertaDiariaDisponible()) return 3
    if (ranura != 0) return 0
    if (etapaTutorial == 1 && mundoActual == MUNDO_INICIO) return 2
    if (misionAventuraDisponible()) return 1
    return 0
}

function semillaOfertaMision(ranura: number): number {
    return azarGalaxia(mundoActual + ranura * 7, diaJuego + ranura * 13, ranura + 101)
}

function objetivoOfertaMision(ranura: number): number {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return 1 // Ruta de práctica LUMA -> VEXO.
    if (origen == 1) return objetivoMisionAventura(etapaAventura)
    if (origen == 3) return objetivoMisionDiaria()

    let objetivo = semillaOfertaMision(ranura) % CANTIDAD_MUNDOS_PUBLICOS
    let peligroPermitido = Math.min(3, 1 + Math.idiv(rangoActual(), 2))
    for (let i = 0; i < CANTIDAD_MUNDOS_PUBLICOS; i++) {
        let candidato = (objetivo + i * 5 + 1) % CANTIDAD_MUNDOS_PUBLICOS
        if (candidato != mundoActual && peligroMundoEficaz(candidato) <= peligroPermitido) return candidato
    }
    return (mundoActual + 1) % CANTIDAD_MUNDOS_PUBLICOS
}

function claseOfertaMision(ranura: number): ClaseMision {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return ClaseMision.Entrega
    if (origen == 1) return claseMisionAventura(etapaAventura)
    if (origen == 3) return claseMisionDiaria()
    return 1 + (semillaOfertaMision(ranura) + ranura * 2) % 3
}

function mercanciaMisionParaObjetivo(objetivo: number, semilla: number): number {
    let inicio = semilla % CANTIDAD_MERCANCIAS
    let economia = ECONOMIA_MUNDO[objetivo]
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) {
        let mercancia = (inicio + i * 5) % CANTIDAD_MERCANCIAS
        if (pideEconomia(mercancia, economia) &&
            !produceEconomia(mercancia, ECONOMIA_MUNDO[mundoActual])) return mercancia
    }
    return mejorMercanciaComercio(objetivo)
}

function mercanciaOfertaMision(ranura: number): number {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return 2
    if (origen == 1) return mercanciaMisionAventura(etapaAventura)
    if (origen == 3) return mercanciaMisionDiaria()
    let clase = claseOfertaMision(ranura)
    if (clase == ClaseMision.Entrega)
        return mercanciaMisionParaObjetivo(objetivoOfertaMision(ranura), semillaOfertaMision(ranura))
    if (clase == ClaseMision.Rescate) return 8
    return 0
}

function varianteOfertaMision(ranura: number): VarianteMision {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return VarianteMision.Normal
    if (origen == 1) return varianteMisionAventura(etapaAventura)
    if (origen == 3) return VarianteMision.Expres
    let clase = claseOfertaMision(ranura)
    let tirada = azarGalaxia(semillaOfertaMision(ranura), rangoActual(), 149) % 4
    if (clase == ClaseMision.Entrega) {
        if (tirada == 1) return VarianteMision.Fragil
        if (tirada == 2) return VarianteMision.Expres
        if (tirada == 3 && rangoActual() >= 2) return VarianteMision.Ilegal
    } else if (clase == ClaseMision.Caza) {
        if (tirada == 1 && rangoActual() >= 2) return VarianteMision.As
        if (tirada >= 2) return VarianteMision.BajoFuego
    } else if (clase == ClaseMision.Rescate) {
        if (tirada == 1) return VarianteMision.Expres
        if (tirada >= 2) return VarianteMision.BajoFuego
    }
    return VarianteMision.Normal
}

function nombreVarianteMision(clase: ClaseMision, variante: VarianteMision): string {
    if (variante == VarianteMision.Fragil) return Textos.t(207)
    if (variante == VarianteMision.Expres) return Textos.t(208)
    if (variante == VarianteMision.Ilegal) return Textos.t(209)
    if (variante == VarianteMision.As) return Textos.t(210)
    if (variante == VarianteMision.BajoFuego) return Textos.t(211)
    return Textos.t(212)
}

function detalleVarianteMision(clase: ClaseMision, variante: VarianteMision): string {
    if (variante == VarianteMision.Fragil) return Textos.t(213)
    if (variante == VarianteMision.Expres) return Textos.t(214)
    if (variante == VarianteMision.Ilegal) return Textos.t(215)
    if (variante == VarianteMision.As) return Textos.t(216)
    if (variante == VarianteMision.BajoFuego) return Textos.t(217)
    if (clase == ClaseMision.Rescate) return Textos.t(218)
    return Textos.t(219)
}

function cantidadOfertaMision(ranura: number): number {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return 1
    if (origen == 1) return cantidadMisionAventura(etapaAventura)
    if (origen == 3) return cantidadMisionDiaria()
    let clase = claseOfertaMision(ranura)
    let variante = varianteOfertaMision(ranura)
    if (clase == ClaseMision.Rescate) return 1
    if (clase == ClaseMision.Caza) {
        if (variante == VarianteMision.As) return 1
        return Math.min(5, 1 + Math.idiv(rangoActual(), 2) + semillaOfertaMision(ranura) % 2)
    }
    if (variante == VarianteMision.Fragil) return 1
    return Math.min(5, 1 + Math.idiv(rangoActual(), 2) + semillaOfertaMision(ranura) % 3)
}

function pagoOfertaMision(ranura: number): number {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return 150
    if (origen == 3) return pagoMisionDiaria()
    let objetivo = objetivoOfertaMision(ranura)
    let clase = claseOfertaMision(ranura)
    let mercancia = mercanciaOfertaMision(ranura)
    let variante = varianteOfertaMision(ranura)
    let distancia = distanciaMundo(mundoActual, objetivo)
    let peligro = peligroMundoEficaz(objetivo)
    let cantidad = cantidadOfertaMision(ranura)
    let pago = origen == 1 ? pagoMisionAventura(etapaAventura) : 0
    if (origen == 0 && clase == ClaseMision.Entrega) pago = 70 + distancia * 3 + cantidad * 35 + peligro * 35
    else if (origen == 0 && clase == ClaseMision.Caza) pago = 120 + cantidad * 70 + distancia * 2 + peligro * 45
    else if (origen == 0) pago = 150 + distancia * 3 + peligro * 55
    let porcentajeVariante = 0
    if (variante == VarianteMision.Fragil) porcentajeVariante = 35
    else if (variante == VarianteMision.Expres) porcentajeVariante = 30
    else if (variante == VarianteMision.Ilegal) porcentajeVariante = 60
    else if (variante == VarianteMision.As) porcentajeVariante = 50
    else if (variante == VarianteMision.BajoFuego) porcentajeVariante = 45
    let porcentajeModo = modoJuego == ModoJuego.Veterano ? 15 : (modoJuego == ModoJuego.Hierro ? 30 : 0)
    let porcentajeSuceso = porcentajePagoMisionSucesoMercado(objetivo, clase, mercancia)
    return Math.idiv(pago * (100 + porcentajeVariante + porcentajeModo + porcentajeSuceso) + 50, 100)
}

function plazoOfertaMision(ranura: number): number {
    let origen = fuenteOfertaMision(ranura)
    if (origen == 2) return diaJuego + 5
    if (origen == 3) return plazoMisionDiaria()
    let objetivo = objetivoOfertaMision(ranura)
    let saltosEstimados = Math.max(1, Math.idiv(distanciaMundo(mundoActual, objetivo) + 21, 22))
    let reserva = origen == 1 ? 5 : 4
    if (varianteOfertaMision(ranura) == VarianteMision.Expres) reserva = 1
    return diaJuego + saltosEstimados + reserva
}

function etiquetaMision(clase: ClaseMision): string {
    if (clase == ClaseMision.Entrega) return Textos.t(220)
    if (clase == ClaseMision.Caza) return Textos.t(221)
    if (clase == ClaseMision.Rescate) return Textos.t(222)
    return Textos.t(223)
}

function pagoMisionNegociada(pagoBase: number, diferencia: number): number {
    let porcentaje = Math.clamp(-10, 25, diferencia * 5)
    return Math.max(1, Math.idiv(pagoBase * (100 + porcentaje) + 50, 100))
}

function exitoNegociacion(semilla: number, diferencia: number): boolean {
    if (diferencia <= 0) return true
    let habilidad = reputacionFaccion(Faccion.Gremio) + mejoras[MEJORA_ESCANER] * 12
    let probabilidad = Math.clamp(10, 90, 70 + habilidad - diferencia * 18)
    return azarGalaxia(semilla, diaJuego, diferencia + 991) % 100 < probabilidad
}

function mercadoNegroDisponible(): boolean {
    return mundoActual == 12 || mundoActual == CANTIDAD_MUNDOS_PUBLICOS ||
        reputacionFaccion(Faccion.Forajidos) >= 20
}

function precioCompraMercadoNegro(mercancia: number): number {
    if (mercancia < 0 || mercancia >= CANTIDAD_MERCANCIAS) return 0
    return Math.max(1, Math.idiv(precioCompra(mercancia) * 88, 100))
}

function precioVentaMercadoNegro(mercancia: number): number {
    if (mercancia < 0 || mercancia >= CANTIDAD_MERCANCIAS) return 0
    return Math.max(1, Math.idiv(precioVenta(mercancia) * 125, 100))
}

function anotarComercioMercadoNegro(ganancia: number): void {
    tratosMercadoNegro = Math.min(PARTIDA_MAX_CONTADOR, tratosMercadoNegro + 1)
    if (ganancia > 0) anotarGananciaComercio(ganancia)
    ajustarReputacion(Faccion.Forajidos, 2)
    ajustarReputacion(Faccion.Union, -1)
    actualizarLogros()
}

// Lee un número de 16 bits con signo de una tabla (las tablas están en el código como series de números hexadecimales,
// así se ahorra memoria flash).
function tablaI16(tabla: Buffer, posicion: number): number {
    return tabla.getNumber(NumberFormat.Int16LE, posicion * 2)
}
