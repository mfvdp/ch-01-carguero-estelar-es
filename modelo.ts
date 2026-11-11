// Las reglas y el estado del juego: mercado, misiones, aventura y logros.
enum NumeroEscena {
    Titulo,
    Hangar,
    Mercado,
    Astillero,
    Misiones,
    MapaEstelar,
    Estado,
    Vuelo,
    Aviso,
    BorradoPartida,
    Intro
}

enum ClaseMision {
    Ninguna,
    Entrega,
    Caza,
    Rescate
}

enum VarianteMision {
    Normal,
    Fragil,
    Expres,
    Ilegal,
    As,
    BajoFuego
}

enum ClaseSucesoMercado {
    Ninguna,
    Escasez,
    Excedente,
    Bloqueo,
    Auge
}

enum RolNave {
    Mercader,
    Mensajero,
    Cazador
}

enum ModoJuego {
    Normal,
    Veterano,
    Hierro
}

enum FaseVuelo {
    Despegue,
    Crucero,
    Encuentro,
    Suceso,
    Acercamiento,
    Atraque,
    Rescate
}

enum Faccion {
    Union,
    Gremio,
    Cientificos,
    Forajidos
}

enum Rareza {
    Reliquia,
    NucleoDatos,
    SemillaAlien
}

enum ClaseArma {
    Laser,
    Misil,
    Mina
}

enum ModuloNave {
    Motor,
    Escaner,
    Armas,
    Carga
}

enum ClaseFinal {
    Ninguna,
    Union,
    CoronaComercial,
    Explorador,
    Forajido
}

// Estado permanente de quien juega. Los contenidos fijos están en datos.ts y se nombran con su número.
let creditos = 0
let mundoActual = 0
let mundoDestino = 0
let diaJuego = 1
let combustible = 0
let casco = 0
let gananciaComercio = 0
let victoriasTotal = 0
let misionesCumplidas = 0
let misionesFalladas = 0
let carga: number[] = []
let costeCarga: number[] = []
let mejoras: number[] = []
let existenciasMercado: number[] = []

// Progreso y estado de la galaxia. guardar.ts guarda estos valores en la partida.
let etapaTutorial = 0
let etapaAventura = 0
let semillaGalaxia = 1
let claseSucesoMercado = ClaseSucesoMercado.Ninguna
let mundoSucesoMercado = 0
let mercanciaSucesoMercado = 0
let finSucesoMercado = 0
let rolNave = RolNave.Mercader
let modoJuego = ModoJuego.Normal

// Este estado está a propósito en listas pequeñas de números y en máscaras de bits. Así ocupan poco la memoria durante
// el juego y las tres partidas guardadas del aparato.
let reputacionesFacciones: number[] = []
let eleccionFinal = ClaseFinal.Ninguna
let influenciaMercado: number[] = []
let diaMemoriaMercado: number[] = []
let mercanciaMemoriaMercado: number[] = []
let compraMemoriaMercado: number[] = []
let ventaMemoriaMercado: number[] = []
let tendenciaMemoriaMercado: number[] = []
let cargaRara: number[] = []
let mascaraArtefacto = 0
let mascaraMundoSecreto = 0
let mascaraNavesPropias = 1 << RolNave.Mercader
let numeroNombreNave: number[] = []
let pinturaNave: number[] = []
let mascaraLogro = 0
let mascaraMundoVisitadoBajo = 0
let mascaraMundoVisitadoAlto = 0
let saltosTotal = 0
let rescatesTotal = 0
let entregasTotal = 0
let creditosGanadosTotal = 0
let gananciaComercioMayor = 0
let victoriasJefe = 0
let tratosMercadoNegro = 0
let sucesosCumplidos = 0
let diaMisionDiaria = 0
let hechoMisionDiaria = 0
let nivelPartidaNuevaPlus = 0
let armaActiva = ClaseArma.Laser
let misiles = 3
let minas = 2
let energiaArma = 100
// 0 equilibrado, 1 escudo, 2 armas, 3 motor.
let modoEnergia = 0
let danoModulo: number[] = []
let velocidadTexto = 1
let contrasteAlto = 0
let sacudidaCamara = 1
let modoDesarrollador = 0

// Solo hay una misión activa. Así la pantalla y la partida guardada ocupan poco.
let claseMision = ClaseMision.Ninguna
let origenMision = 0
let objetivoMision = 0
let plazoMision = 0
let pagoMision = 0
let mercanciaMision = 0
let cantidadMision = 0
let avanceMision = 0
let semillaMision = 0
let varianteMision = VarianteMision.Normal
// Origen de la misión: 0 = normal, 1 = campaña, 2 = tutorial, 3 = oferta diaria.
let fuenteMision = 0

// El punto de salida de un vuelo se guarda para que, tras reiniciar, se pueda empezar el mismo vuelo otra vez.
let enTransito = 0
let origenTransito = 0
let objetivoTransito = 0
let semillaTransito = 0

// El estado de la pantalla solo vale para el momento y nunca se guarda.
let escenaActiva = NumeroEscena.Titulo
let escenaVuelta = NumeroEscena.Hangar
let posicionMenu = 0
let inicioLista = 0
let entradaBloqueada = false
let cantidadTrato = 0
let tratoAbierto = false
let confirmacionAbierta = false
let secuenciaPartida = 0
let tienePartida = false
let partidaEstabaDanada = false
let avisoLinea1 = ""
let avisoLinea2 = ""
let avisoLinea3 = ""

// La ruta planeada solo vale para el momento; siempre se puede calcular de nuevo desde el mapa.
let rutaPrevista: number[] = []
let combustibleRutaPrevista = 0
let aplazarGuardadoPartidaNueva = false

function rellenarListaNumero(largo: number, valor: number): number[] {
    let resultado: number[] = []
    for (let i = 0; i < largo; i++) resultado.push(valor)
    return resultado
}

function unidadesCarga(): number {
    let usado =
        (claseMision == ClaseMision.Entrega || claseMision == ClaseMision.Rescate) ? cantidadMision : 0
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) usado += carga[i]
    for (let i = 0; i < CANTIDAD_RAREZAS; i++) usado += cargaRara[i]
    return usado
}

function capacidadCarga(): number {
    return capacidadCargaParaRol(rolNave)
}

function capacidadCargaParaRol(rol: RolNave): number {
    let castigoDano = danoModulo &&
        danoModulo.length > ModuloNave.Carga ? danoModulo[ModuloNave.Carga] : 0
    return Math.max(4, 8 + mejoras[MEJORA_CARGA] * 4 +
        (rol == RolNave.Mercader ? 4 : 0) - castigoDano * 2)
}

function cascoMax(): number {
    return 8 + mejoras[MEJORA_BLINDAJE] * 3
}

function escudoMax(): number {
    return 4 + mejoras[MEJORA_ESCUDO] * 3 + (rolNave == RolNave.Cazador ? 3 : 0)
}

function combustibleMax(): number {
    let castigoDano = danoModulo &&
        danoModulo.length > ModuloNave.Motor ? danoModulo[ModuloNave.Motor] : 0
    return Math.max(3, 5 + mejoras[MEJORA_SALTO] +
        (rolNave == RolNave.Mensajero ? 2 : 0) - castigoDano)
}

function costeSaltoMax(): number {
    let castigoDano = danoModulo &&
        danoModulo.length > ModuloNave.Motor ? danoModulo[ModuloNave.Motor] : 0
    return Math.max(1, 2 + mejoras[MEJORA_SALTO] - Math.idiv(castigoDano + 1, 2))
}

function danoLaser(): number {
    let castigoDano = danoModulo &&
        danoModulo.length > ModuloNave.Armas ? danoModulo[ModuloNave.Armas] : 0
    let bonoModo = modoEnergia == 2 ? 1 : 0
    return Math.max(1,
        1 + mejoras[MEJORA_LASER] +
            (rolNave == RolNave.Cazador ? 1 : 0) + bonoModo - castigoDano)
}

function enfriamientoLaser(): number {
    let modo = modoEnergia == 2 ? -60 : (modoEnergia == 1 || modoEnergia == 3 ? 60 : 0)
    return Math.max(160, 440 - mejoras[MEJORA_REFRIGERADOR] * 100 + modo)
}

function tiempoCargaHuida(): number {
    let bonoRol = rolNave == RolNave.Mensajero ? 400 : 0
    let bonoModo = modoEnergia == 3 ? 450 : 0
    let castigoMotor = danoModulo &&
        danoModulo.length > ModuloNave.Motor ? danoModulo[ModuloNave.Motor] * 220 : 0
    return Math.max(800, 2600 - mejoras[MEJORA_PROPULSOR] * 500 - bonoRol - bonoModo + castigoMotor)
}

function rangoNecesarioRolNave(rol: RolNave): number {
    if (rol == RolNave.Mensajero) return 1
    if (rol == RolNave.Cazador) return 2
    return 0
}

function rolNaveDesbloqueado(rol: RolNave): boolean {
    return navePropia(rol) || rangoActual() >= rangoNecesarioRolNave(rol)
}

function nombreRolNave(rol: RolNave): string {
    if (rol == RolNave.Mensajero) return Textos.t(168)
    if (rol == RolNave.Cazador) return Textos.t(224)
    return Textos.t(170)
}

function infoRolNave(rol: RolNave): string {
    if (rol == RolNave.Mensajero) return Textos.t(225)
    if (rol == RolNave.Cazador) return Textos.t(226)
    return Textos.t(227)
}

function navePropia(rol: RolNave): boolean {
    return rol >= RolNave.Mercader && rol <= RolNave.Cazador &&
        (mascaraNavesPropias & (1 << rol)) != 0
}

function costeCompraNave(rol: RolNave): number {
    if (navePropia(rol)) return 0
    if (rol == RolNave.Mensajero) return precioAstilleroMundo(1800)
    if (rol == RolNave.Cazador) return precioAstilleroMundo(2600)
    return precioAstilleroMundo(1200)
}

function elegirNave(rol: RolNave): boolean {
    if (!navePropia(rol) || unidadesCarga() > capacidadCargaParaRol(rol)) return false
    rolNave = rol
    combustible = Math.min(combustible, combustibleMax())
    casco = Math.min(casco, cascoMax())
    vaciarRutaPrevista()
    return true
}

function comprarOElegirNave(rol: RolNave): boolean {
    if (!navePropia(rol) && !rolNaveDesbloqueado(rol)) return false
    if (unidadesCarga() > capacidadCargaParaRol(rol)) return false
    if (!navePropia(rol)) {
        let coste = costeCompraNave(rol)
        if (creditos < coste) return false
        creditos -= coste
        mascaraNavesPropias |= 1 << rol
    }
    return elegirNave(rol)
}

function nombrePantallaNave(rol: RolNave): string {
    let numero = numeroNombreNave && numeroNombreNave.length > rol ? numeroNombreNave[rol] : rol
    return NOMBRES_NAVE[Math.clamp(0, CANTIDAD_NOMBRES_NAVE - 1, numero)]
}

function cambiarNombreNave(rol: RolNave, diferencia: number): void {
    if (!numeroNombreNave || numeroNombreNave.length != CANTIDAD_ROLES_NAVE)
        numeroNombreNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    numeroNombreNave[rol] = (numeroNombreNave[rol] + diferencia + CANTIDAD_NOMBRES_NAVE) % CANTIDAD_NOMBRES_NAVE
}

function cambiarPinturaNave(rol: RolNave, diferencia: number): void {
    if (!pinturaNave || pinturaNave.length != CANTIDAD_ROLES_NAVE)
        pinturaNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    pinturaNave[rol] = (pinturaNave[rol] + diferencia + CANTIDAD_PINTURAS) % CANTIDAD_PINTURAS
}

function nombrePinturaNave(rol: RolNave): string {
    let numero = pinturaNave && pinturaNave.length > rol ? pinturaNave[rol] : 0
    return Textos.t(NOMBRES_PINTURA[Math.clamp(0, CANTIDAD_PINTURAS - 1, numero)])
}

function reputacionFaccion(faccion: Faccion): number {
    if (!reputacionesFacciones || reputacionesFacciones.length != CANTIDAD_FACCIONES) return 0
    return reputacionesFacciones[faccion]
}

function ajustarReputacion(faccion: Faccion, diferencia: number): void {
    if (!reputacionesFacciones || reputacionesFacciones.length != CANTIDAD_FACCIONES)
        reputacionesFacciones = rellenarListaNumero(CANTIDAD_FACCIONES, 0)
    reputacionesFacciones[faccion] = Math.clamp(-100, 100, reputacionesFacciones[faccion] + diferencia)
}

function cambiarReputacionFaccion(faccion: Faccion, diferencia: number): void {
    ajustarReputacion(faccion, diferencia)
}

function faccionDominante(): Faccion {
    let mejor = Faccion.Union
    for (let i = 1; i < CANTIDAD_FACCIONES; i++)
        if (reputacionFaccion(i) > reputacionFaccion(mejor)) mejor = i
    return mejor
}

function elegirFinal(final: ClaseFinal): boolean {
    if (!finalDisponible(final)) return false
    eleccionFinal = final
    actualizarLogros()
    return true
}

function finalDisponible(final: ClaseFinal): boolean {
    if (!aventuraCumplida()) return false
    if (final == ClaseFinal.Union) return reputacionFaccion(Faccion.Union) >= 20 ||
        faccionDominante() == Faccion.Union
    if (final == ClaseFinal.CoronaComercial) return reputacionFaccion(Faccion.Gremio) >= 20 ||
        faccionDominante() == Faccion.Gremio
    if (final == ClaseFinal.Explorador) return reputacionFaccion(Faccion.Cientificos) >= 20 ||
        cantidadArtefactos() >= 2
    if (final == ClaseFinal.Forajido) return reputacionFaccion(Faccion.Forajidos) >= 20 ||
        faccionDominante() == Faccion.Forajidos
    return false
}

function mundoVisitado(mundo: number): boolean {
    if (mundo < 0 || mundo >= CANTIDAD_MUNDOS) return false
    if (mundo < 16) return (mascaraMundoVisitadoBajo & (1 << mundo)) != 0
    return (mascaraMundoVisitadoAlto & (1 << (mundo - 16))) != 0
}

function marcarMundoVisitado(mundo: number): void {
    if (mundo < 0 || mundo >= CANTIDAD_MUNDOS) return
    if (mundo < 16) mascaraMundoVisitadoBajo |= 1 << mundo
    else mascaraMundoVisitadoAlto |= 1 << (mundo - 16)
    if (mundo >= CANTIDAD_MUNDOS_PUBLICOS) mascaraMundoSecreto |= 1 << (mundo - CANTIDAD_MUNDOS_PUBLICOS)
    actualizarLogros()
}

function descubrirMundoSecreto(mundo: number): boolean {
    if (mundo < CANTIDAD_MUNDOS_PUBLICOS || mundo >= CANTIDAD_MUNDOS) return false
    let antes = mascaraMundoSecreto
    mascaraMundoSecreto |= 1 << (mundo - CANTIDAD_MUNDOS_PUBLICOS)
    return antes != mascaraMundoSecreto
}

function mundoVisible(mundo: number): boolean {
    if (mundo < 0 || mundo >= CANTIDAD_MUNDOS) return false
    if (mundo < CANTIDAD_MUNDOS_PUBLICOS) return true
    return (mascaraMundoSecreto & (1 << (mundo - CANTIDAD_MUNDOS_PUBLICOS))) != 0
}

function cantidadArtefactos(): number {
    let cantidad = 0
    for (let i = 0; i < CANTIDAD_ARTEFACTOS; i++) if ((mascaraArtefacto & (1 << i)) != 0) cantidad++
    return cantidad
}

function tieneArtefacto(numero: number): boolean {
    return numero >= 0 && numero < CANTIDAD_ARTEFACTOS && (mascaraArtefacto & (1 << numero)) != 0
}

function anadirArtefacto(numero: number): boolean {
    if (numero < 0 || numero >= CANTIDAD_ARTEFACTOS || tieneArtefacto(numero)) return false
    mascaraArtefacto |= 1 << numero
    if (cantidadArtefactos() >= 2) descubrirMundoSecreto(CANTIDAD_MUNDOS_PUBLICOS)
    if (cantidadArtefactos() >= CANTIDAD_ARTEFACTOS) descubrirMundoSecreto(CANTIDAD_MUNDOS_PUBLICOS + 1)
    actualizarLogros()
    return true
}

function anadirRareza(numero: Rareza, cantidad: number): boolean {
    if (numero < 0 || numero >= CANTIDAD_RAREZAS || cantidad <= 0 || unidadesCarga() + cantidad > capacidadCarga())
        return false
    cargaRara[numero] += cantidad
    return true
}

function venderRareza(numero: Rareza, cantidad: number): number {
    if (numero < 0 || numero >= CANTIDAD_RAREZAS || cantidad <= 0) return 0
    cantidad = Math.min(cantidad, cargaRara[numero])
    let ingreso = valorRareza(numero) * cantidad
    cargaRara[numero] -= cantidad
    creditos += ingreso
    gananciaComercio = Math.min(PARTIDA_MAX_PUNTOS, gananciaComercio + ingreso)
    anotarGananciaComercio(ingreso)
    return ingreso
}

function aplicarInfluenciaComercioEn(mundo: number, mercancia: number, cantidadConSigno: number): void {
    if (mundo < 0 || mundo >= CANTIDAD_MUNDOS || mercancia < 0 ||
        mercancia >= CANTIDAD_MERCANCIAS || cantidadConSigno == 0) return
    let direccion = cantidadConSigno > 0 ? 1 : -1
    influenciaMercado[mundo] = Math.clamp(-20, 20,
        influenciaMercado[mundo] + direccion * Math.min(4, Math.abs(cantidadConSigno)))
}

function aplicarInfluenciaComercio(mercancia: number, cantidadConSigno: number): void {
    aplicarInfluenciaComercioEn(mundoActual, mercancia, cantidadConSigno)
}

function recordarMercadoActual(): void {
    let mejor = mejorMercanciaComercio((mundoActual + 1) % CANTIDAD_MUNDOS_PUBLICOS)
    let ventaAnterior = ventaMemoriaMercado[mundoActual]
    diaMemoriaMercado[mundoActual] = diaJuego
    mercanciaMemoriaMercado[mundoActual] = mejor
    compraMemoriaMercado[mundoActual] = precioCompra(mejor)
    ventaMemoriaMercado[mundoActual] = precioVenta(mejor)
    tendenciaMemoriaMercado[mundoActual] = ventaAnterior == 0 ? 0
        : Math.clamp(-2, 2, ventaMemoriaMercado[mundoActual] - ventaAnterior)
    marcarMundoVisitado(mundoActual)
}

function mercadoConocido(mundo: number): boolean {
    return mundo >= 0 && mundo < CANTIDAD_MUNDOS && diaMemoriaMercado[mundo] > 0
}

function edadMercadoConocido(mundo: number): number { return mercadoConocido(mundo)
    ? Math.max(0, diaJuego - diaMemoriaMercado[mundo]) : -1 }
function mercanciaMercadoConocido(mundo: number):
    number { return mercadoConocido(mundo) ? mercanciaMemoriaMercado[mundo] : -1 }
function compraMercadoConocido(mundo: number):
    number { return mercadoConocido(mundo) ? compraMemoriaMercado[mundo] : 0 }
function ventaMercadoConocido(mundo: number): number { return mercadoConocido(mundo) ? ventaMemoriaMercado[mundo] : 0 }
function tendenciaMercadoConocido(mundo: number):
    number { return mercadoConocido(mundo) ? tendenciaMemoriaMercado[mundo] : 0 }

function anotarRescate(): void {
    rescatesTotal = Math.min(PARTIDA_MAX_CONTADOR, rescatesTotal + 1)
    actualizarLogros()
}

function anotarEntrega(): void {
    entregasTotal = Math.min(PARTIDA_MAX_CONTADOR, entregasTotal + 1)
    actualizarLogros()
}

function anotarSalto(): void {
    saltosTotal = Math.min(PARTIDA_MAX_CONTADOR, saltosTotal + 1)
    marcarMundoVisitado(mundoActual)
}

function anotarSuceso(): void {
    sucesosCumplidos = Math.min(PARTIDA_MAX_CONTADOR, sucesosCumplidos + 1)
    actualizarLogros()
}

function anotarGananciaComercio(cantidad: number): void {
    if (cantidad <= 0) return
    gananciaComercioMayor = Math.max(gananciaComercioMayor, cantidad)
    creditosGanadosTotal = Math.min(PARTIDA_MAX_PUNTOS, creditosGanadosTotal + cantidad)
    actualizarLogros()
}

function logroDesbloqueado(numero: number): boolean {
    return numero >= 0 && numero < CANTIDAD_LOGROS && (mascaraLogro & (1 << numero)) != 0
}

function desbloquearLogro(numero: number): boolean {
    if (numero < 0 || numero >= CANTIDAD_LOGROS || logroDesbloqueado(numero)) return false
    mascaraLogro |= 1 << numero
    return true
}

function cantidadMundosVisitados(): number {
    let resultado = 0
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (mundoVisitado(i)) resultado++
    return resultado
}

function actualizarLogros(): void {
    if (saltosTotal >= 1) desbloquearLogro(0)
    if (gananciaComercio >= 1000) desbloquearLogro(1)
    if (victoriasTotal >= 10) desbloquearLogro(2)
    if (rescatesTotal >= 5) desbloquearLogro(3)
    if (cantidadMundosVisitados() >= CANTIDAD_MUNDOS_PUBLICOS) desbloquearLogro(4)
    if (mascaraNavesPropias == 7) desbloquearLogro(5)
    if (cantidadArtefactos() >= CANTIDAD_ARTEFACTOS) desbloquearLogro(6)
    if (tratosMercadoNegro >= 5) desbloquearLogro(7)
    if (aventuraCumplida()) desbloquearLogro(8)
    if (eleccionFinal != ClaseFinal.Ninguna) desbloquearLogro(9)
    if (nivelPartidaNuevaPlus > 0) desbloquearLogro(10)
    if (puntosJuego() >= 50000) desbloquearLogro(11)
}

function cambiarArma(diferencia: number): void {
    armaActiva = (armaActiva + diferencia + CANTIDAD_ARMAS) % CANTIDAD_ARMAS
}

function usarMisil(): boolean {
    if (misiles <= 0 || energiaArma < 20 || danoModulo[ModuloNave.Armas] >= 3) return false
    misiles--
    energiaArma -= 20
    return true
}

function usarMina(): boolean {
    if (minas <= 0 || energiaArma < 12 || danoModulo[ModuloNave.Armas] >= 3) return false
    minas--
    energiaArma -= 12
    return true
}

function restaurarEnergiaArma(cantidad: number): void {
    if (cantidad > 0) energiaArma = Math.min(100, energiaArma + cantidad)
}

function nombreModoEnergia(): string {
    if (modoEnergia == 1) return Textos.t(160)
    if (modoEnergia == 2) return Textos.t(117)
    if (modoEnergia == 3) return Textos.t(115)
    return Textos.t(228)
}

function cambiarModoEnergia(diferencia: number): void {
    modoEnergia = (modoEnergia + diferencia + 4) % 4
}

function danarModulo(modulo: ModuloNave, cantidad: number): void {
    if (modulo < 0 || modulo >= CANTIDAD_MODULOS_NAVE || cantidad <= 0) return
    danoModulo[modulo] = Math.clamp(0, 3, danoModulo[modulo] + cantidad)
    combustible = Math.min(combustible, combustibleMax())
}

function repararModulos(): void {
    for (let i = 0; i < CANTIDAD_MODULOS_NAVE; i++) danoModulo[i] = 0
}

function nombreDanoModulo(modulo: ModuloNave): string {
    let nivel = danoModulo[modulo]
    if (nivel >= 3) return Textos.t(229)
    if (nivel == 2) return Textos.t(230)
    if (nivel == 1) return Textos.t(231)
    return Textos.t(232)
}

function vaciarRutaPrevista(): void {
    rutaPrevista = []
    combustibleRutaPrevista = 0
}

function planearRutaHasta(objetivo: number): boolean {
    vaciarRutaPrevista()
    if (objetivo < 0 || objetivo >= CANTIDAD_MUNDOS || !mundoVisible(objetivo)) return false
    if (objetivo == mundoActual) {
        rutaPrevista.push(mundoActual)
        return true
    }
    let anterior = rellenarListaNumero(CANTIDAD_MUNDOS, -2)
    let cola: number[] = []
    cola.push(mundoActual)
    anterior[mundoActual] = -1
    let cabeza = 0
    while (cabeza < cola.length && anterior[objetivo] == -2) {
        let desde = cola[cabeza++]
        for (let a = 0; a < CANTIDAD_MUNDOS; a++) {
            if (!mundoVisible(a) || anterior[a] != -2 || a == desde) continue
            let coste = costeSalto(desde, a)
            if (coste > costeSaltoMax()) continue
            if (desde == mundoActual && coste > combustible) continue
            anterior[a] = desde
            cola.push(a)
            if (a == objetivo) break
        }
    }
    if (anterior[objetivo] == -2) return false
    let inverso: number[] = []
    let cursor = objetivo
    while (cursor >= 0) {
        inverso.push(cursor)
        cursor = anterior[cursor]
    }
    for (let i = inverso.length - 1; i >= 0; i--) rutaPrevista.push(inverso[i])
    for (let i = 1; i < rutaPrevista.length; i++)
        combustibleRutaPrevista += costeSalto(rutaPrevista[i - 1], rutaPrevista[i])
    return true
}

function cantidadSaltosRuta(): number { return Math.max(0, rutaPrevista.length - 1) }
function costeCombustibleRuta(): number { return combustibleRutaPrevista }
function mundoEnRuta(posicion: number): number { return posicion >= 0 &&
    posicion < rutaPrevista.length ? rutaPrevista[posicion] : -1 }

function cambiarVelocidadTexto(diferencia: number): void { velocidadTexto = (velocidadTexto + diferencia + 3) % 3 }
function nombreVelocidadTexto(): string { return velocidadTexto == 0 ? Textos.t(233)
    : (velocidadTexto == 2 ? Textos.t(234) : Textos.t(235)) }
function alternarContrasteAlto(): void { contrasteAlto = contrasteAlto == 0 ? 1 : 0 }
function alternarSacudidaCamara(): void { sacudidaCamara = sacudidaCamara == 0 ? 1 : 0 }
function alternarModoDesarrollador(): void { modoDesarrollador = modoDesarrollador == 0 ? 1 : 0 }

function nombreEtapaTutorial(): string {
    if (etapaTutorial == 1) return Textos.t(236)
    if (etapaTutorial == 2) return Textos.t(237)
    if (etapaTutorial == 3) return Textos.t(238)
    if (etapaTutorial >= 4) return Textos.t(239)
    return Textos.t(240)
}

function nombreModoJuego(modo: ModoJuego): string {
    if (modo == ModoJuego.Veterano) return Textos.t(241)
    if (modo == ModoJuego.Hierro) return Textos.t(242)
    return Textos.t(212)
}

function rangoActual(): number {
    let puntos = gananciaComercio + misionesCumplidas * 100 + victoriasTotal * 25
    if (puntos >= 30000) return 5
    if (puntos >= 12000) return 4
    if (puntos >= 5000) return 3
    if (puntos >= 2000) return 2
    if (puntos >= 600) return 1
    return 0
}

function nombreRango(): string {
    return Textos.t(NOMBRES_RANGO[rangoActual()])
}

function puntosJuego(): number {
    return gananciaComercio + misionesCumplidas * 100 + victoriasTotal * 25
}

function iniciarPartidaNueva(): void {
    creditos = 500
    mundoActual = MUNDO_INICIO
    mundoDestino = MUNDO_INICIO
    diaJuego = 1
    gananciaComercio = 0
    victoriasTotal = 0
    misionesCumplidas = 0
    misionesFalladas = 0
    etapaTutorial = 1
    etapaAventura = 0
    semillaGalaxia = 1 + azarEstable(game.runtime(), secuenciaPartida + 1, 2026) % 32748
    claseSucesoMercado = ClaseSucesoMercado.Ninguna
    mundoSucesoMercado = MUNDO_INICIO
    mercanciaSucesoMercado = 0
    finSucesoMercado = 0
    rolNave = RolNave.Mercader
    modoJuego = ModoJuego.Normal
    reputacionesFacciones = rellenarListaNumero(CANTIDAD_FACCIONES, 0)
    eleccionFinal = ClaseFinal.Ninguna
    influenciaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    diaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    mercanciaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    compraMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    ventaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    tendenciaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    cargaRara = rellenarListaNumero(CANTIDAD_RAREZAS, 0)
    mascaraArtefacto = 0
    mascaraMundoSecreto = 0
    mascaraNavesPropias = 1 << RolNave.Mercader
    numeroNombreNave = [0, 1, 2]
    pinturaNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    mascaraLogro = 0
    mascaraMundoVisitadoBajo = 1 << MUNDO_INICIO
    mascaraMundoVisitadoAlto = 0
    saltosTotal = 0
    rescatesTotal = 0
    entregasTotal = 0
    creditosGanadosTotal = 0
    gananciaComercioMayor = 0
    victoriasJefe = 0
    tratosMercadoNegro = 0
    sucesosCumplidos = 0
    diaMisionDiaria = 0
    hechoMisionDiaria = 0
    nivelPartidaNuevaPlus = 0
    armaActiva = ClaseArma.Laser
    misiles = 3
    minas = 2
    energiaArma = 100
    modoEnergia = 0
    danoModulo = rellenarListaNumero(CANTIDAD_MODULOS_NAVE, 0)
    carga = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    costeCarga = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    mejoras = rellenarListaNumero(CANTIDAD_MEJORAS, 0)
    existenciasMercado = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    combustible = combustibleMax()
    casco = cascoMax()
    vaciarMision()
    enTransito = 0
    origenTransito = MUNDO_INICIO
    objetivoTransito = MUNDO_INICIO
    semillaTransito = 0
    renovarMercado()
    recordarMercadoActual()
    vaciarRutaPrevista()
    if (!aplazarGuardadoPartidaNueva) {
        escribirPartida()
        tienePartida = true
    }
}

function puedeIniciarPartidaNuevaPlus(): boolean {
    return aventuraCumplida() && eleccionFinal != ClaseFinal.Ninguna && nivelPartidaNuevaPlus < 9
}

function iniciarPartidaNuevaPlus(): boolean {
    if (!puedeIniciarPartidaNuevaPlus()) return false
    let nivelAnterior = nivelPartidaNuevaPlus
    let mascaraNavesPropiasAnterior = mascaraNavesPropias
    let nombresAnteriores = numeroNombreNave
    let pinturaAnterior = pinturaNave
    let logrosAnteriores = mascaraLogro
    let artefactosAnteriores = mascaraArtefacto
    let secretosAnteriores = mascaraMundoSecreto
    let estadisticasAnteriores =
        [saltosTotal, rescatesTotal, entregasTotal, creditosGanadosTotal, gananciaComercioMayor,
        victoriasJefe, tratosMercadoNegro, sucesosCumplidos]
    let modoAnterior = modoJuego
    aplazarGuardadoPartidaNueva = true
    iniciarPartidaNueva()
    aplazarGuardadoPartidaNueva = false
    nivelPartidaNuevaPlus = Math.min(9, nivelAnterior + 1)
    mascaraNavesPropias = mascaraNavesPropiasAnterior
    numeroNombreNave = nombresAnteriores
    pinturaNave = pinturaAnterior
    mascaraLogro = logrosAnteriores
    mascaraArtefacto = artefactosAnteriores
    mascaraMundoSecreto = secretosAnteriores
    saltosTotal = estadisticasAnteriores[0]
    rescatesTotal = estadisticasAnteriores[1]
    entregasTotal = estadisticasAnteriores[2]
    creditosGanadosTotal = estadisticasAnteriores[3]
    gananciaComercioMayor = estadisticasAnteriores[4]
    victoriasJefe = estadisticasAnteriores[5]
    tratosMercadoNegro = estadisticasAnteriores[6]
    sucesosCumplidos = estadisticasAnteriores[7]
    modoJuego = modoAnterior
    etapaTutorial = 4
    creditos = 1000 + nivelPartidaNuevaPlus * 500
    for (let i = 0; i < CANTIDAD_MEJORAS; i++) if (MAX_MEJORA[i] > 0) mejoras[i] = 1
    combustible = combustibleMax()
    casco = cascoMax()
    actualizarLogros()
    escribirPartida()
    return true
}

function vaciarMision(): void {
    claseMision = ClaseMision.Ninguna
    origenMision = 0
    objetivoMision = 0
    plazoMision = 0
    pagoMision = 0
    mercanciaMision = 0
    cantidadMision = 0
    avanceMision = 0
    semillaMision = 0
    varianteMision = VarianteMision.Normal
    fuenteMision = 0
}

function ponerEscena(siguiente: NumeroEscena): void {
    escenaActiva = siguiente
    posicionMenu = 0
    inicioLista = 0
    tratoAbierto = false
    cantidadTrato = 0
    confirmacionAbierta = false
    entradaBloqueada = true
}

function mostrarAviso(linea1: string, linea2: string, linea3: string, volverA: NumeroEscena): void {
    avisoLinea1 = linea1
    avisoLinea2 = linea2
    avisoLinea3 = linea3
    escenaVuelta = volverA
    ponerEscena(NumeroEscena.Aviso)
}

function todosBotonesSoltados(): boolean {
    return !controller.up.isPressed()
        && !controller.down.isPressed()
        && !controller.left.isPressed()
        && !controller.right.isPressed()
        && !controller.A.isPressed()
        && !controller.B.isPressed()
}
