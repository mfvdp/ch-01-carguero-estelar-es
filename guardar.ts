// Guardar y cargar la partida: dos ranuras automáticas y una ranura para guardar a mano.
const PARTIDA_MARCA = 731904
const PARTIDA_VERSION = 3
const PARTIDA_VERSION_V1 = 1
const PARTIDA_VERSION_V2 = 2
const PARTIDA_CLAVE_A = "ot.save.a"
const PARTIDA_CLAVE_B = "ot.save.b"
const PARTIDA_CLAVE_MANUAL = "ot.save.manual"

const PARTIDA_CANTIDAD_CAMPOS_BASE = 26
const PARTIDA_CANTIDAD_CAMPOS_EXTRA_V2_ANTIGUOS = 11
const PARTIDA_CANTIDAD_CAMPOS_NUEVOS_V3 = 200
const PARTIDA_CANTIDAD_CAMPOS_EXTRA_V3 = PARTIDA_CANTIDAD_CAMPOS_EXTRA_V2_ANTIGUOS + PARTIDA_CANTIDAD_CAMPOS_NUEVOS_V3
// Nombre antiguo que ya no se lee en ningún sitio: en una partida actual, las listas de la carga empiezan después de
// todos los campos que dependen de la versión.
const PARTIDA_CANTIDAD_CAMPOS_EXTRA_V2 = PARTIDA_CANTIDAD_CAMPOS_EXTRA_V3
const PARTIDA_CANTIDAD_CAMPOS_LISTA = CANTIDAD_MERCANCIAS * 3 + CANTIDAD_MEJORAS
const PARTIDA_MAX_CONTADOR = 9999999
const PARTIDA_MAX_PUNTOS = 999999999
const PARTIDA_MAX_SECUENCIA = 2000000000
const PARTIDA_MAX_SEMILLA = 32748

function sumaPartidaHasta(valores: number[], largo: number): number {
    let resultado = 19
    for (let i = 0; i < largo; i++) {
        let parte = valores[i] % 1000003
        if (parte < 0) parte += 1000003
        resultado = (resultado + parte * (i + 7)) % 1000003
    }
    return resultado
}

function sumaPartida(valores: number[]): number {
    return sumaPartidaHasta(valores, valores.length)
}

function largoPartidaEsperadoParaVersion(version: number): number {
    let extra = 0
    if (version == PARTIDA_VERSION_V2) extra = PARTIDA_CANTIDAD_CAMPOS_EXTRA_V2_ANTIGUOS
    else if (version == PARTIDA_VERSION) extra = PARTIDA_CANTIDAD_CAMPOS_EXTRA_V3
    return PARTIDA_CANTIDAD_CAMPOS_BASE + extra + PARTIDA_CANTIDAD_CAMPOS_LISTA + 1
}

function largoPartidaEsperado(): number {
    return largoPartidaEsperadoParaVersion(PARTIDA_VERSION)
}

function enteroPartidaEnIntervalo(valor: number, minimo: number, maximo: number): boolean {
    return valor == (valor | 0) && valor >= minimo && valor <= maximo
}

function asegurarEstadoV3(): void {
    if (!reputacionesFacciones || reputacionesFacciones.length != CANTIDAD_FACCIONES)
        reputacionesFacciones = rellenarListaNumero(CANTIDAD_FACCIONES, 0)
    if (!influenciaMercado || influenciaMercado.length != CANTIDAD_MUNDOS)
        influenciaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    if (!diaMemoriaMercado || diaMemoriaMercado.length != CANTIDAD_MUNDOS)
        diaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    if (!mercanciaMemoriaMercado || mercanciaMemoriaMercado.length != CANTIDAD_MUNDOS)
        mercanciaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    if (!compraMemoriaMercado || compraMemoriaMercado.length != CANTIDAD_MUNDOS)
        compraMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    if (!ventaMemoriaMercado || ventaMemoriaMercado.length != CANTIDAD_MUNDOS)
        ventaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    if (!tendenciaMemoriaMercado || tendenciaMemoriaMercado.length != CANTIDAD_MUNDOS)
        tendenciaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    if (!cargaRara || cargaRara.length != CANTIDAD_RAREZAS) cargaRara = rellenarListaNumero(CANTIDAD_RAREZAS, 0)
    if (!numeroNombreNave || numeroNombreNave.length != CANTIDAD_ROLES_NAVE) numeroNombreNave = [0, 1, 2]
    if (!pinturaNave || pinturaNave.length != CANTIDAD_ROLES_NAVE)
        pinturaNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    if (!danoModulo || danoModulo.length != CANTIDAD_MODULOS_NAVE)
        danoModulo = rellenarListaNumero(CANTIDAD_MODULOS_NAVE, 0)
    mascaraNavesPropias |= (1 << RolNave.Mercader) | (1 << rolNave)
}

function anadirCamposV2Antiguo(valores: number[]): void {
    valores.push(etapaTutorial)
    valores.push(etapaAventura)
    valores.push(varianteMision)
    valores.push(fuenteMision)
    valores.push(semillaGalaxia)
    valores.push(claseSucesoMercado)
    valores.push(mundoSucesoMercado)
    valores.push(mercanciaSucesoMercado)
    valores.push(finSucesoMercado)
    valores.push(rolNave)
    valores.push(modoJuego)
}

function anadirCamposV3(valores: number[]): void {
    for (let i = 0; i < CANTIDAD_FACCIONES; i++) valores.push(reputacionesFacciones[i])
    valores.push(eleccionFinal)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) valores.push(influenciaMercado[i])
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) valores.push(diaMemoriaMercado[i])
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) valores.push(mercanciaMemoriaMercado[i])
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) valores.push(compraMemoriaMercado[i])
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) valores.push(ventaMemoriaMercado[i])
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) valores.push(tendenciaMemoriaMercado[i])
    for (let i = 0; i < CANTIDAD_RAREZAS; i++) valores.push(cargaRara[i])
    valores.push(mascaraArtefacto)
    valores.push(mascaraMundoSecreto)
    valores.push(mascaraNavesPropias)
    for (let i = 0; i < CANTIDAD_ROLES_NAVE; i++) valores.push(numeroNombreNave[i])
    for (let i = 0; i < CANTIDAD_ROLES_NAVE; i++) valores.push(pinturaNave[i])
    valores.push(mascaraLogro)
    valores.push(mascaraMundoVisitadoBajo)
    valores.push(mascaraMundoVisitadoAlto)
    valores.push(saltosTotal)
    valores.push(rescatesTotal)
    valores.push(entregasTotal)
    valores.push(creditosGanadosTotal)
    valores.push(gananciaComercioMayor)
    valores.push(victoriasJefe)
    valores.push(tratosMercadoNegro)
    valores.push(sucesosCumplidos)
    valores.push(diaMisionDiaria)
    valores.push(hechoMisionDiaria)
    valores.push(nivelPartidaNuevaPlus)
    valores.push(armaActiva)
    valores.push(misiles)
    valores.push(minas)
    valores.push(energiaArma)
    valores.push(modoEnergia)
    for (let i = 0; i < CANTIDAD_MODULOS_NAVE; i++) valores.push(danoModulo[i])
    valores.push(velocidadTexto)
    valores.push(contrasteAlto)
    valores.push(sacudidaCamara)
    valores.push(modoDesarrollador)
}

function anadirListasPartida(valores: number[]): void {
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) valores.push(carga[i])
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) valores.push(costeCarga[i])
    for (let i = 0; i < CANTIDAD_MEJORAS; i++) valores.push(mejoras[i])
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) valores.push(existenciasMercado[i])
}

function empaquetarPartida(): number[] {
    asegurarEstadoV3()
    let valores: number[] = []
    valores.push(PARTIDA_MARCA)
    valores.push(PARTIDA_VERSION)
    valores.push(secuenciaPartida)
    valores.push(mundoActual)
    valores.push(mundoDestino)
    valores.push(diaJuego)
    valores.push(creditos)
    valores.push(combustible)
    valores.push(casco)
    valores.push(gananciaComercio)
    valores.push(victoriasTotal)
    valores.push(misionesCumplidas)
    valores.push(misionesFalladas)
    valores.push(claseMision)
    valores.push(origenMision)
    valores.push(objetivoMision)
    valores.push(plazoMision)
    valores.push(pagoMision)
    valores.push(mercanciaMision)
    valores.push(cantidadMision)
    valores.push(avanceMision)
    valores.push(semillaMision)
    valores.push(enTransito)
    valores.push(origenTransito)
    valores.push(objetivoTransito)
    valores.push(semillaTransito)
    anadirCamposV2Antiguo(valores)
    anadirCamposV3(valores)
    anadirListasPartida(valores)
    valores.push(sumaPartida(valores))
    return valores
}

function esSumaPartidaValida(valores: number[]): boolean {
    let posicionSuma = valores.length - 1
    if (!enteroPartidaEnIntervalo(valores[posicionSuma], 0, 1000002)) return false
    return sumaPartidaHasta(valores, posicionSuma) == valores[posicionSuma]
}

function esBasePartidaValida(valores: number[], inicioLista: number, rolNaveGuardada: number): boolean {
    if (!enteroPartidaEnIntervalo(valores[2], 0, PARTIDA_MAX_SECUENCIA)) return false
    if (!enteroPartidaEnIntervalo(valores[3], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[4], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[5], 1, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[6], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[9], 0, PARTIDA_MAX_PUNTOS)) return false
    if (!enteroPartidaEnIntervalo(valores[10], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[11], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[12], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[13], ClaseMision.Ninguna, ClaseMision.Rescate)) return false
    if (!enteroPartidaEnIntervalo(valores[14], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[15], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[16], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[17], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[18], 0, CANTIDAD_MERCANCIAS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[19], 0, 99)) return false
    if (!enteroPartidaEnIntervalo(valores[20], 0, valores[19])) return false
    if (!enteroPartidaEnIntervalo(valores[21], 0, PARTIDA_MAX_SEMILLA)) return false
    if (!enteroPartidaEnIntervalo(valores[22], 0, 1)) return false
    if (!enteroPartidaEnIntervalo(valores[23], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[24], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[25], 0, PARTIDA_MAX_SEMILLA)) return false
    if (valores[22] == 1 && valores[23] == valores[24]) return false
    if (valores[13] == ClaseMision.Ninguna) {
        if (valores[16] != 0 || valores[17] != 0 || valores[19] != 0 || valores[20] != 0) return false
    } else if (valores[16] < 1 || valores[17] < 1 || valores[19] < 1) return false

    let inicioMejora = inicioLista + CANTIDAD_MERCANCIAS * 2
    for (let i = 0; i < CANTIDAD_MEJORAS; i++) {
        if (!enteroPartidaEnIntervalo(valores[inicioMejora + i], 0, MAX_MEJORA[i])) return false
    }
    let capacidadCargaGuardada = 8 + valores[inicioMejora + MEJORA_CARGA] * 4
    if (rolNaveGuardada == RolNave.Mercader) capacidadCargaGuardada += 4
    let combustibleMaxGuardado = 5 + valores[inicioMejora + MEJORA_SALTO]
    if (rolNaveGuardada == RolNave.Mensajero) combustibleMaxGuardado += 2
    let cascoMaxGuardado = 8 + valores[inicioMejora + MEJORA_BLINDAJE] * 3
    if (!enteroPartidaEnIntervalo(valores[7], 0, combustibleMaxGuardado)) return false
    if (!enteroPartidaEnIntervalo(valores[8], 1, cascoMaxGuardado)) return false
    let cargaUsada = valores[13] == ClaseMision.Entrega || valores[13] == ClaseMision.Rescate ? valores[19] : 0
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) {
        let unidades = valores[inicioLista + i]
        let coste = valores[inicioLista + CANTIDAD_MERCANCIAS + i]
        if (!enteroPartidaEnIntervalo(unidades, 0, capacidadCargaGuardada)) return false
        if (!enteroPartidaEnIntervalo(coste, 0, PARTIDA_MAX_CONTADOR)) return false
        if (unidades == 0 && coste != 0) return false
        cargaUsada += unidades
    }
    if (cargaUsada > capacidadCargaGuardada) return false
    let inicioExistencias = inicioMejora + CANTIDAD_MEJORAS
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++)
        if (!enteroPartidaEnIntervalo(valores[inicioExistencias + i], 0, 99)) return false
    return true
}

function sonValidosCamposV2Antiguos(valores: number[], inicio: number): boolean {
    let p = inicio
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 4)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, CANTIDAD_MISIONES_AVENTURA)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], VarianteMision.Normal, VarianteMision.BajoFuego)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 3)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 1, PARTIDA_MAX_SEMILLA)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], ClaseSucesoMercado.Ninguna, ClaseSucesoMercado.Auge)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, CANTIDAD_MUNDOS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, CANTIDAD_MERCANCIAS - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], RolNave.Mercader, RolNave.Cazador)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], ModoJuego.Normal, ModoJuego.Hierro)) return false
    return true
}

function esPartidaV1Valida(valores: number[]): boolean {
    if (valores.length != largoPartidaEsperadoParaVersion(PARTIDA_VERSION_V1)) return false
    if (!esSumaPartidaValida(valores)) return false
    return esBasePartidaValida(valores, PARTIDA_CANTIDAD_CAMPOS_BASE, -1)
}

function esPartidaV2Valida(valores: number[]): boolean {
    if (valores.length != largoPartidaEsperadoParaVersion(PARTIDA_VERSION_V2)) return false
    if (!esSumaPartidaValida(valores) ||
        !sonValidosCamposV2Antiguos(valores, PARTIDA_CANTIDAD_CAMPOS_BASE)) return false
    return esBasePartidaValida(valores, PARTIDA_CANTIDAD_CAMPOS_BASE +
        PARTIDA_CANTIDAD_CAMPOS_EXTRA_V2_ANTIGUOS, valores[35])
}

function sonValidosCamposV3(valores: number[], inicio: number, inicioLista: number): boolean {
    let p = inicio
    for (let i = 0; i < CANTIDAD_FACCIONES; i++) if (!enteroPartidaEnIntervalo(valores[p++], -100, 100)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], ClaseFinal.Ninguna, ClaseFinal.Forajido)) return false
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (!enteroPartidaEnIntervalo(valores[p++], -20, 20)) return false
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_CONTADOR))
        return false
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, CANTIDAD_MERCANCIAS - 1))
        return false
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, 9999)) return false
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, 9999)) return false
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) if (!enteroPartidaEnIntervalo(valores[p++], -2, 2)) return false
    let unidadesRareza = 0
    for (let i = 0; i < CANTIDAD_RAREZAS; i++) {
        if (!enteroPartidaEnIntervalo(valores[p], 0, 99)) return false
        unidadesRareza += valores[p++]
    }
    if (!enteroPartidaEnIntervalo(valores[p++], 0, (1 << CANTIDAD_ARTEFACTOS) - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0,
        (1 << (CANTIDAD_MUNDOS - CANTIDAD_MUNDOS_PUBLICOS)) - 1)) return false
    let navesPropiasGuardadas = valores[p++]
    if (!enteroPartidaEnIntervalo(navesPropiasGuardadas, 1, (1 << CANTIDAD_ROLES_NAVE) - 1)) return false
    if ((navesPropiasGuardadas & 1) == 0 ||
        (navesPropiasGuardadas & (1 << valores[35])) == 0) return false
    for (let i = 0; i < CANTIDAD_ROLES_NAVE; i++)
        if (!enteroPartidaEnIntervalo(valores[p++], 0, CANTIDAD_NOMBRES_NAVE - 1))
        return false
    for (let i = 0; i < CANTIDAD_ROLES_NAVE; i++)
        if (!enteroPartidaEnIntervalo(valores[p++], 0, CANTIDAD_PINTURAS - 1))
        return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, (1 << CANTIDAD_LOGROS) - 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 65535)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 1023)) return false
    for (let i = 0; i < 3; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_PUNTOS)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_CONTADOR)) return false
    for (let i = 0; i < 3; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, PARTIDA_MAX_CONTADOR)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 9)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], ClaseArma.Laser, ClaseArma.Mina)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 12)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 8)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 100)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 3)) return false
    for (let i = 0; i < CANTIDAD_MODULOS_NAVE; i++) if (!enteroPartidaEnIntervalo(valores[p++], 0, 3)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 2)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 1)) return false
    if (!enteroPartidaEnIntervalo(valores[p++], 0, 1)) return false
    if (p != inicioLista) return false
    let inicioMejora = inicioLista + CANTIDAD_MERCANCIAS * 2
    let capacidad = 8 + valores[inicioMejora + MEJORA_CARGA] * 4 +
        (valores[PARTIDA_CANTIDAD_CAMPOS_BASE + 9] == RolNave.Mercader ? 4 : 0)
    let baseUsado = valores[13] == ClaseMision.Entrega || valores[13] == ClaseMision.Rescate ? valores[19] : 0
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) baseUsado += valores[inicioLista + i]
    return baseUsado + unidadesRareza <= capacidad
}

function esPartidaV3Valida(valores: number[]): boolean {
    if (valores.length != largoPartidaEsperado()) return false
    if (!esSumaPartidaValida(valores) ||
        !sonValidosCamposV2Antiguos(valores, PARTIDA_CANTIDAD_CAMPOS_BASE)) return false
    let inicioListas = PARTIDA_CANTIDAD_CAMPOS_BASE + PARTIDA_CANTIDAD_CAMPOS_EXTRA_V3
    if (!sonValidosCamposV3(valores, PARTIDA_CANTIDAD_CAMPOS_BASE +
        PARTIDA_CANTIDAD_CAMPOS_EXTRA_V2_ANTIGUOS, inicioListas))
        return false
    return esBasePartidaValida(valores, inicioListas, valores[35])
}

function esPartidaValida(valores: number[]): boolean {
    if (!valores || valores.length < 3 || valores[0] != PARTIDA_MARCA) return false
    if (valores[1] == PARTIDA_VERSION_V1) return esPartidaV1Valida(valores)
    if (valores[1] == PARTIDA_VERSION_V2) return esPartidaV2Valida(valores)
    if (valores[1] == PARTIDA_VERSION) return esPartidaV3Valida(valores)
    return false
}

function ranuraPartida(clave: string): number[] {
    if (!settings.exists(clave)) return null
    return settings.readNumberArray(clave)
}

function ultimaPartidaValida(a: number[], b: number[]): number[] {
    let aValida = esPartidaValida(a)
    let bValida = esPartidaValida(b)
    if (!aValida) return bValida ? b : null
    if (!bValida) return a
    return a[2] >= b[2] ? a : b
}

function escribirPartida(): void {
    secuenciaPartida++
    let valores = empaquetarPartida()
    if (secuenciaPartida % 2 == 0) settings.writeNumberArray(PARTIDA_CLAVE_A, valores)
    else settings.writeNumberArray(PARTIDA_CLAVE_B, valores)
    tienePartida = true
}

function existePartidaManual(): boolean {
    return esPartidaValida(ranuraPartida(PARTIDA_CLAVE_MANUAL))
}

function escribirPartidaManual(): void {
    secuenciaPartida++
    settings.writeNumberArray(PARTIDA_CLAVE_MANUAL, empaquetarPartida())
    tienePartida = true
}

function cargarPartidaManual(): boolean {
    let valores = ranuraPartida(PARTIDA_CLAVE_MANUAL)
    if (!esPartidaValida(valores)) return false
    let ultimo = secuenciaPartida
    desempaquetarPartida(valores)
    // Seguir contando después de la última partida automática; si no, el próximo arranque cargaría justo esa otra vez.
    secuenciaPartida = Math.max(secuenciaPartida, ultimo)
    escribirPartida()
    return true
}

function borrarPartidaManual(): void {
    if (settings.exists(PARTIDA_CLAVE_MANUAL)) settings.remove(PARTIDA_CLAVE_MANUAL)
}

function semillaGalaxiaMigrada(mundo: number, dia: number): number {
    return 1 + azarEstable(mundo, dia, 17) % PARTIDA_MAX_SEMILLA
}

function prepararEstadoV2Migrado(): void {
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
    mascaraNavesPropias = (1 << RolNave.Mercader) | (1 << rolNave)
    numeroNombreNave = [0, 1, 2]
    pinturaNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    mascaraLogro = 0
    mascaraMundoVisitadoBajo = mundoActual < 16 ? 1 << mundoActual : 0
    mascaraMundoVisitadoAlto = mundoActual >= 16 ? 1 << (mundoActual - 16) : 0
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
    velocidadTexto = 1
    contrasteAlto = 0
    sacudidaCamara = 1
    modoDesarrollador = 0
}

function leerCamposV2Antiguo(valores: number[], p: number): number {
    etapaTutorial = valores[p++]
    etapaAventura = valores[p++]
    varianteMision = valores[p++]
    fuenteMision = valores[p++]
    semillaGalaxia = valores[p++]
    claseSucesoMercado = valores[p++]
    mundoSucesoMercado = valores[p++]
    mercanciaSucesoMercado = valores[p++]
    finSucesoMercado = valores[p++]
    rolNave = valores[p++]
    modoJuego = valores[p++]
    return p
}

function leerCamposV3(valores: number[], p: number): number {
    reputacionesFacciones = rellenarListaNumero(CANTIDAD_FACCIONES, 0)
    for (let i = 0; i < CANTIDAD_FACCIONES; i++) reputacionesFacciones[i] = valores[p++]
    eleccionFinal = valores[p++]
    influenciaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) influenciaMercado[i] = valores[p++]
    diaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) diaMemoriaMercado[i] = valores[p++]
    mercanciaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) mercanciaMemoriaMercado[i] = valores[p++]
    compraMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) compraMemoriaMercado[i] = valores[p++]
    ventaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) ventaMemoriaMercado[i] = valores[p++]
    tendenciaMemoriaMercado = rellenarListaNumero(CANTIDAD_MUNDOS, 0)
    for (let i = 0; i < CANTIDAD_MUNDOS; i++) tendenciaMemoriaMercado[i] = valores[p++]
    cargaRara = rellenarListaNumero(CANTIDAD_RAREZAS, 0)
    for (let i = 0; i < CANTIDAD_RAREZAS; i++) cargaRara[i] = valores[p++]
    mascaraArtefacto = valores[p++]
    mascaraMundoSecreto = valores[p++]
    mascaraNavesPropias = valores[p++]
    numeroNombreNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    for (let i = 0; i < CANTIDAD_ROLES_NAVE; i++) numeroNombreNave[i] = valores[p++]
    pinturaNave = rellenarListaNumero(CANTIDAD_ROLES_NAVE, 0)
    for (let i = 0; i < CANTIDAD_ROLES_NAVE; i++) pinturaNave[i] = valores[p++]
    mascaraLogro = valores[p++]
    mascaraMundoVisitadoBajo = valores[p++]
    mascaraMundoVisitadoAlto = valores[p++]
    saltosTotal = valores[p++]
    rescatesTotal = valores[p++]
    entregasTotal = valores[p++]
    creditosGanadosTotal = valores[p++]
    gananciaComercioMayor = valores[p++]
    victoriasJefe = valores[p++]
    tratosMercadoNegro = valores[p++]
    sucesosCumplidos = valores[p++]
    diaMisionDiaria = valores[p++]
    hechoMisionDiaria = valores[p++]
    nivelPartidaNuevaPlus = valores[p++]
    armaActiva = valores[p++]
    misiles = valores[p++]
    minas = valores[p++]
    energiaArma = valores[p++]
    modoEnergia = valores[p++]
    danoModulo = rellenarListaNumero(CANTIDAD_MODULOS_NAVE, 0)
    for (let i = 0; i < CANTIDAD_MODULOS_NAVE; i++) danoModulo[i] = valores[p++]
    velocidadTexto = valores[p++]
    contrasteAlto = valores[p++]
    sacudidaCamara = valores[p++]
    modoDesarrollador = valores[p++]
    return p
}

function desempaquetarPartida(valores: number[]): void {
    let version = valores[1]
    let p = 2
    secuenciaPartida = valores[p++]
    mundoActual = valores[p++]
    mundoDestino = valores[p++]
    diaJuego = valores[p++]
    creditos = valores[p++]
    combustible = valores[p++]
    casco = valores[p++]
    gananciaComercio = valores[p++]
    victoriasTotal = valores[p++]
    misionesCumplidas = valores[p++]
    misionesFalladas = valores[p++]
    claseMision = valores[p++]
    origenMision = valores[p++]
    objetivoMision = valores[p++]
    plazoMision = valores[p++]
    pagoMision = valores[p++]
    mercanciaMision = valores[p++]
    cantidadMision = valores[p++]
    avanceMision = valores[p++]
    semillaMision = valores[p++]
    enTransito = valores[p++]
    origenTransito = valores[p++]
    objetivoTransito = valores[p++]
    semillaTransito = valores[p++]
    if (version >= PARTIDA_VERSION_V2) p = leerCamposV2Antiguo(valores, p)
    else {
        etapaTutorial = 1
        etapaAventura = 0
        varianteMision = VarianteMision.Normal
        fuenteMision = 0
        semillaGalaxia = semillaGalaxiaMigrada(mundoActual, diaJuego)
        claseSucesoMercado = ClaseSucesoMercado.Ninguna
        mundoSucesoMercado = 0
        mercanciaSucesoMercado = 0
        finSucesoMercado = 0
        rolNave = RolNave.Mercader
        modoJuego = ModoJuego.Normal
    }
    if (version == PARTIDA_VERSION) p = leerCamposV3(valores, p)
    else prepararEstadoV2Migrado()
    carga = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    costeCarga = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    mejoras = rellenarListaNumero(CANTIDAD_MEJORAS, 0)
    existenciasMercado = rellenarListaNumero(CANTIDAD_MERCANCIAS, 0)
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) carga[i] = valores[p++]
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) costeCarga[i] = valores[p++]
    for (let i = 0; i < CANTIDAD_MEJORAS; i++) mejoras[i] = valores[p++]
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) existenciasMercado[i] = valores[p++]
    combustible = Math.min(combustible, combustibleMax())
    vaciarRutaPrevista()
}

function cargarJuego(): boolean {
    let elegido =
        ultimaPartidaValida(
        ranuraPartida(PARTIDA_CLAVE_A), ranuraPartida(PARTIDA_CLAVE_B))
    if (!elegido) {
        tienePartida = false
        partidaEstabaDanada = settings.exists(PARTIDA_CLAVE_A) || settings.exists(PARTIDA_CLAVE_B)
        return false
    }
    let migracion = elegido[1] != PARTIDA_VERSION
    desempaquetarPartida(elegido)
    tienePartida = true
    partidaEstabaDanada = false
    if (migracion) escribirPartida()
    return true
}

function borrarPartida(): void {
    if (settings.exists(PARTIDA_CLAVE_A)) settings.remove(PARTIDA_CLAVE_A)
    if (settings.exists(PARTIDA_CLAVE_B)) settings.remove(PARTIDA_CLAVE_B)
    borrarPartidaManual()
    tienePartida = false
    partidaEstabaDanada = false
    secuenciaPartida = 0
}
