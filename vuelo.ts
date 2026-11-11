// El vuelo entre dos mundos: fases, encuentros, combates, rescate y atraque.
let faseVuelo = FaseVuelo.Despegue
let faseIniciadaMs = 0
let ultimaActualizacionVueloMs = 0
let escudoVuelo = 0
let miraX = 80
let miraY = 52
let armaListaMs = 0
let destelloArmaHastaMs = 0
let impactoArma = false
let calorLaser = 0
let huidaIniciadaMs = 0
let enemigoActivo = false
let tipoEnemigo = 0
let enemigoX = 80
let enemigoY = 42
let enemigoVX = 1
let enemigoVY = 1
let tamanoEnemigo = 10
let cascoEnemigo = 0
let enemigosRestantes = 0
let movimientoEnemigoMs = 0
let siguienteAtaqueEnemigoMs = 0
let disparoAtaqueMs = 0
let ataqueX = 0
let ataqueY = 0
let capsulaRescateX = 80
let capsulaRescateY = 43
let avanceTractor = 0
let avanceAtraque = 0
let mensajeVuelo = ""
let restoMovimientoMira = 0
let restoFrioLaser = 0
let derivaRescateMs = 0
let pasoDerivaRescate = 0
let secuenciaAtaqueEnemigo = 0
let escudoEnemigo = 0
let textoPista = ""
let textoPistaHastaMs = 0
let destelloDanoHastaMs = 0
let rescateDespuesCombate = false
let pasoPatronEnemigo = 0
let rangoVueloAntes = 0

// Sucesos del vuelo. Sus números solo valen dentro de este archivo. La partida guardada solo guarda lo que un suceso
// cambió, nunca un encuentro a medias.
const VUELO_SUCESO_NINGUNO = 0
const VUELO_SUCESO_MERCADER = 1
const VUELO_SUCESO_SOCORRO = 2
const VUELO_SUCESO_ADUANA = 3
const VUELO_SUCESO_MINAS = 4
const VUELO_SUCESO_RESTOS = 5
const VUELO_SUCESO_CONTRABANDISTA = 6

let sucesoViajeRevisado = false
let tipoSucesoVuelo = VUELO_SUCESO_NINGUNO
let sucesoVueloResuelto = false
let sucesoVueloResueltoMs = 0
let resultadoSucesoVuelo = ""
let sucesoObligaCombate = false
let restoEnergiaArma = 0
let restoEnergiaEscudo = 0
let claseFormacion = 0
let escoltasFormacion = 0
let faseJefe = 0
let cascoMaxJefe = 0
let cascoGuardadoJefe = 0
let escudoGuardadoJefe = 0
let refuerzosJefe = 0
let jefeEsperando = false
let debilJefeX = 80
let debilJefeY = 42
let pistaVueloHastaMs = 0

function iniciarViaje(): void {
    let coste = costeSalto(mundoActual, mundoDestino)
    if (mundoDestino == mundoActual || coste > costeSaltoMax() || coste > combustible) {
        tocarSonidoError()
        mostrarAviso(Textos.t(508), Textos.t(509), "", NumeroEscena.Hangar)
        return
    }
    if (fuenteMision == 2 && etapaTutorial == 2) {
        if (mundoDestino != 1) {
            tocarSonidoError()
            mostrarAviso(Textos.t(510), Textos.t(511), Textos.t(512), NumeroEscena.MapaEstelar)
            return
        }
        etapaTutorial = 3
    }
    origenTransito = mundoActual
    objetivoTransito = mundoDestino
    semillaTransito = azarEstable(mundoActual, mundoDestino, diaJuego + secuenciaPartida)
    combustible -= coste
    enTransito = 1
    escribirPartida()
    prepararVuelo()
    ponerEscena(NumeroEscena.Vuelo)
}

function reanudarViaje(): void {
    prepararVuelo()
    ponerEscena(NumeroEscena.Vuelo)
}

function prepararVuelo(): void {
    faseVuelo = FaseVuelo.Despegue
    faseIniciadaMs = game.runtime()
    ultimaActualizacionVueloMs = faseIniciadaMs
    escudoVuelo = escudoMax()
    miraX = 80
    miraY = 52
    armaListaMs = faseIniciadaMs
    destelloArmaHastaMs = 0
    calorLaser = 0
    huidaIniciadaMs = 0
    enemigoActivo = false
    enemigosRestantes = 0
    disparoAtaqueMs = 0
    avanceTractor = 0
    avanceAtraque = 0
    mensajeVuelo = Textos.t(254)
    restoMovimientoMira = 0
    restoFrioLaser = 0
    derivaRescateMs = faseIniciadaMs + 96
    pasoDerivaRescate = 0
    secuenciaAtaqueEnemigo = 0
    escudoEnemigo = 0
    textoPista = ""
    textoPistaHastaMs = 0
    destelloDanoHastaMs = 0
    rescateDespuesCombate = false
    pasoPatronEnemigo = 0
    rangoVueloAntes = rangoActual()
    sucesoViajeRevisado = false
    tipoSucesoVuelo = VUELO_SUCESO_NINGUNO
    sucesoVueloResuelto = false
    sucesoVueloResueltoMs = 0
    resultadoSucesoVuelo = ""
    sucesoObligaCombate = false
    restoEnergiaArma = 0
    restoEnergiaEscudo = 0
    claseFormacion = 0
    escoltasFormacion = 0
    faseJefe = 0
    cascoMaxJefe = 0
    cascoGuardadoJefe = 0
    escudoGuardadoJefe = 0
    refuerzosJefe = 0
    jefeEsperando = false
    pistaVueloHastaMs = 0
    tocarSonidoDespegue()
}

function empezarCrucero(): void {
    faseVuelo = FaseVuelo.Crucero
    faseIniciadaMs = game.runtime()
    mensajeVuelo = Textos.t(513) + NOMBRES_MUNDO[objetivoTransito]
    tocarSonidoCrucero()
}

function elegirEncuentro(): void {
    if (!sucesoViajeRevisado) {
        sucesoViajeRevisado = true
        if (debeIniciarSucesoVuelo()) {
            empezarSucesoVuelo()
            return
        }
    }
    // El primer encargo de reparto LUMA -> VEXO enseña a navegar sin que un combate te sorprenda.
    if (fuenteMision == 2 && objetivoMision == objetivoTransito) {
        empezarAcercamiento(true)
        return
    }
    if (claseMision == ClaseMision.Rescate && objetivoMision == objetivoTransito && avanceMision == 0) {
        if (varianteMision == VarianteMision.BajoFuego) {
            enemigosRestantes = 1 + (modoJuego > 0 ? 1 : 0)
            rescateDespuesCombate = true
            empezarEncuentroCombate(false)
        } else empezarEncuentroRescate()
        return
    }
    if (claseMision == ClaseMision.Caza && objetivoMision == objetivoTransito &&
        avanceMision < cantidadMision) {
        enemigosRestantes = cantidadMision - avanceMision
        empezarEncuentroCombate(true)
        return
    }
    let peligroRuta = peligroMundoEficaz(objetivoTransito)
    let probabilidad = 12 + peligroRuta * 16 + modoJuego * 10
    if (claseMision == ClaseMision.Entrega && varianteMision == VarianteMision.Ilegal) probabilidad += 25
    if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo && mundoSucesoMercado == objetivoTransito &&
        diaJuego <= finSucesoMercado) probabilidad += 25
    probabilidad = Math.min(92, probabilidad)
    if (semillaTransito % 100 < probabilidad) {
        enemigosRestantes = 1 + azarEstable(semillaTransito, diaJuego, 4) % Math.max(1, peligroRuta + 1)
        empezarEncuentroCombate(false)
    } else empezarAcercamiento(true)
}

function debeIniciarSucesoVuelo(): boolean {
    if (fuenteMision == 2 || etapaTutorial > 0 && etapaTutorial < 4) return false
    let probabilidad = 38 + peligroMundoEficaz(objetivoTransito) * 5
    if (danoModulo[ModuloNave.Escaner] >= 2) probabilidad += 8
    if (objetivoTransito >= CANTIDAD_MUNDOS_PUBLICOS) probabilidad = 100
    return azarEstable(semillaTransito, diaJuego, 211) % 100 < probabilidad
}

function empezarSucesoVuelo(): void {
    faseVuelo = FaseVuelo.Suceso
    faseIniciadaMs = game.runtime()
    sucesoVueloResuelto = false
    resultadoSucesoVuelo = ""
    sucesoObligaCombate = false
    tipoSucesoVuelo = 1 + azarEstable(semillaTransito, diaJuego, semillaGalaxia + 223) % 6
    mensajeVuelo = tituloSucesoVuelo()
    if (tipoSucesoVuelo == VUELO_SUCESO_SOCORRO || tipoSucesoVuelo == VUELO_SUCESO_MINAS) tocarSonidoAlarma()
    else if (tipoSucesoVuelo == VUELO_SUCESO_RESTOS) tocarSonidoSenalRescate()
    else tocarSonidoEncuentro()
}

function faccionSucesoVuelo(): Faccion {
    if (tipoSucesoVuelo == VUELO_SUCESO_CONTRABANDISTA) return Faccion.Forajidos
    return faccionMundo(objetivoTransito)
}

function tituloSucesoVuelo(): string {
    if (tipoSucesoVuelo == VUELO_SUCESO_MERCADER) return Textos.t(514)
    if (tipoSucesoVuelo == VUELO_SUCESO_SOCORRO) return Textos.t(515)
    if (tipoSucesoVuelo == VUELO_SUCESO_ADUANA) return Textos.t(516)
    if (tipoSucesoVuelo == VUELO_SUCESO_MINAS) return Textos.t(517)
    if (tipoSucesoVuelo == VUELO_SUCESO_RESTOS) return Textos.t(518)
    if (tipoSucesoVuelo == VUELO_SUCESO_CONTRABANDISTA) return Textos.t(519)
    return Textos.t(520)
}

function detalleSucesoVuelo(): string {
    if (tipoSucesoVuelo == VUELO_SUCESO_MERCADER) return Textos.t(521)
    if (tipoSucesoVuelo == VUELO_SUCESO_SOCORRO) return Textos.t(522)
    if (tipoSucesoVuelo == VUELO_SUCESO_ADUANA) return Textos.t(523)
    if (tipoSucesoVuelo == VUELO_SUCESO_MINAS) return Textos.t(524)
    if (tipoSucesoVuelo == VUELO_SUCESO_RESTOS) return Textos.t(525)
    return Textos.t(526)
}

function etiquetaAceptarSucesoVuelo(): string {
    if (tipoSucesoVuelo == VUELO_SUCESO_MERCADER) return Textos.t(527)
    if (tipoSucesoVuelo == VUELO_SUCESO_SOCORRO) return Textos.t(528)
    if (tipoSucesoVuelo == VUELO_SUCESO_ADUANA) return Textos.t(529)
    if (tipoSucesoVuelo == VUELO_SUCESO_MINAS) return Textos.t(530)
    if (tipoSucesoVuelo == VUELO_SUCESO_RESTOS) return Textos.t(531)
    return Textos.t(532)
}

function etiquetaRechazoSucesoVuelo(): string {
    if (tipoSucesoVuelo == VUELO_SUCESO_ADUANA) return Textos.t(533)
    if (tipoSucesoVuelo == VUELO_SUCESO_MINAS) return Textos.t(534)
    return Textos.t(535)
}

function terminarSucesoVuelo(resultado: string): void {
    resultadoSucesoVuelo = resultado
    sucesoVueloResuelto = true
    sucesoVueloResueltoMs = game.runtime()
    anotarSuceso()
    actualizarLogros()
}

function resolverSucesoVuelo(aceptar: boolean): void {
    if (faseVuelo != FaseVuelo.Suceso || sucesoVueloResuelto) return
    let tirada = azarEstable(semillaTransito, tipoSucesoVuelo, diaJuego + 239) % 100
    if (tipoSucesoVuelo == VUELO_SUCESO_MERCADER) {
        if (aceptar && creditos >= 45) {
            creditos -= 45
            combustible = Math.min(combustibleMax(), combustible + 2)
            casco = Math.min(cascoMax(), casco + 2)
            ajustarReputacion(Faccion.Gremio, 1)
            tocarSonidoCompra()
            terminarSucesoVuelo(Textos.t(536))
        } else terminarSucesoVuelo(aceptar ? Textos.t(440) : Textos.t(537))
    } else if (tipoSucesoVuelo == VUELO_SUCESO_SOCORRO) {
        if (aceptar) {
            let pago = 55 + peligroMundoEficaz(objetivoTransito) * 15
            creditos += pago
            anotarRescate()
            ajustarReputacion(Faccion.Union, 3)
            if (tirada < 18 && anadirArtefacto(azarEstable(semillaTransito, diaJuego, 241) % CANTIDAD_ARTEFACTOS))
                terminarSucesoVuelo(Textos.t(538))
            else terminarSucesoVuelo(Textos.t(539) + pago + Textos.t(319))
            tocarSonidoRescateCumplido()
        } else {
            ajustarReputacion(Faccion.Union, -2)
            terminarSucesoVuelo(Textos.t(540))
        }
    } else if (tipoSucesoVuelo == VUELO_SUCESO_ADUANA) {
        if (aceptar) {
            if (claseMision == ClaseMision.Entrega && varianteMision == VarianteMision.Ilegal) {
                let multa = Math.min(creditos, 80 + peligroMundoEficaz(objetivoTransito) * 25)
                creditos -= multa
                avanceMision = Math.max(1, avanceMision)
                ajustarReputacion(Faccion.Union, -3)
                tocarSonidoError()
                terminarSucesoVuelo(Textos.t(541) + multa + Textos.t(319))
            } else {
                ajustarReputacion(Faccion.Union, 1)
                tocarSonidoConfirmacion()
                terminarSucesoVuelo(Textos.t(542))
            }
        } else {
            ajustarReputacion(Faccion.Union, -5)
            ajustarReputacion(Faccion.Forajidos, 2)
            sucesoObligaCombate = true
            tocarSonidoAlarma()
            terminarSucesoVuelo(Textos.t(543))
        }
    } else if (tipoSucesoVuelo == VUELO_SUCESO_MINAS) {
        if (!aceptar && usarMina()) {
            tocarSonidoExplosion()
            terminarSucesoVuelo(Textos.t(544))
        } else {
            let aSalvo = tirada < 58 + mejoras[MEJORA_ESCANER] * 12 -
                danoModulo[ModuloNave.Escaner] * 14
            if (!aSalvo) {
                tocarSonidoAlarma()
                danarJugador(1 + Math.idiv(peligroMundoEficaz(objetivoTransito), 2))
                if (escenaActiva != NumeroEscena.Vuelo) return
                danarModulo(ModuloNave.Motor, 1)
                terminarSucesoVuelo(Textos.t(545))
            } else terminarSucesoVuelo(aceptar ? Textos.t(546) : Textos.t(547))
        }
    } else if (tipoSucesoVuelo == VUELO_SUCESO_RESTOS) {
        if (aceptar) {
            let artefacto = azarEstable(semillaTransito, semillaGalaxia, diaJuego + 251) % CANTIDAD_ARTEFACTOS
            if (tirada < 34 && anadirArtefacto(artefacto)) {
                ajustarReputacion(Faccion.Cientificos, 3)
                tocarSonidoMision()
                terminarSucesoVuelo(Textos.t(548))
            } else if (anadirRareza(azarEstable(semillaTransito, tirada, 257) % CANTIDAD_RAREZAS, 1)) {
                terminarSucesoVuelo(Textos.t(549))
            } else {
                creditos += 35
                terminarSucesoVuelo(Textos.t(550))
            }
        } else terminarSucesoVuelo(Textos.t(551))
    } else if (tipoSucesoVuelo == VUELO_SUCESO_CONTRABANDISTA) {
        if (aceptar && creditos >= 90 &&
            anadirRareza(azarEstable(semillaTransito, diaJuego, 263) % CANTIDAD_RAREZAS, 1)) {
            creditos -= 90
            ajustarReputacion(Faccion.Forajidos, 4)
            ajustarReputacion(Faccion.Gremio, -1)
            tocarSonidoCompra()
            terminarSucesoVuelo(Textos.t(552))
        } else {
            if (!aceptar) ajustarReputacion(Faccion.Union, 1)
            terminarSucesoVuelo(aceptar ? Textos.t(553) : Textos.t(554))
        }
    }
}

function salirSucesoVuelo(): void {
    tipoSucesoVuelo = VUELO_SUCESO_NINGUNO
    if (sucesoObligaCombate) {
        enemigosRestantes = 1 + modoJuego
        empezarEncuentroCombate(false)
    } else elegirEncuentro()
}

function empezarEncuentroCombate(caza: boolean): void {
    faseVuelo = FaseVuelo.Encuentro
    faseIniciadaMs = game.runtime()
    mensajeVuelo = caza ? Textos.t(555) : (rescateDespuesCombate ? Textos.t(556) : Textos.t(557))
    tocarSonidoEncuentro()
    crearEnemigo(caza)
}

function crearEnemigo(caza: boolean): void {
    let ahora = game.runtime()
    enemigoActivo = true
    if (caza && fuenteMision == 1 && etapaAventura >= 5 && enemigosRestantes == 1) tipoEnemigo = 4
    else if (caza && varianteMision == VarianteMision.As) tipoEnemigo = 3
    else if (caza && varianteMision == VarianteMision.BajoFuego) tipoEnemigo = 2
    else if (caza) tipoEnemigo = azarEstable(semillaMision, enemigosRestantes, victoriasTotal + 19) % 3
    else if (claseSucesoMercado == ClaseSucesoMercado.Bloqueo && mundoSucesoMercado == objetivoTransito &&
        diaJuego <= finSucesoMercado) tipoEnemigo = 4
    else tipoEnemigo = azarEstable(semillaTransito, enemigosRestantes, victoriasTotal) % 3
    enemigoX = 35 + azarEstable(semillaTransito, enemigosRestantes, 8) % 90
    enemigoY = 24 + azarEstable(semillaTransito, enemigosRestantes, 9) % 35
    enemigoVX = azarEstable(semillaTransito, enemigosRestantes, 10) % 2 == 0 ? -1 : 1
    enemigoVY = azarEstable(semillaTransito, enemigosRestantes, 11) % 2 == 0 ? -1 : 1
    let peligro = peligroMundoEficaz(objetivoTransito)
    tamanoEnemigo = 8 + peligro * 2 + Math.min(4, tipoEnemigo)
    cascoEnemigo = 2 + peligro + tipoEnemigo + (caza ? 2 : 0) + modoJuego
    if (tipoEnemigo == 4) cascoEnemigo += 5 + modoJuego * 2
    escudoEnemigo = tipoEnemigo == 2 ? 2 + peligro
        : (tipoEnemigo == 3 ? 3 + peligro : (tipoEnemigo == 4 ? 5 + peligro : 0))
    claseFormacion = tipoEnemigo >= 3 ? 0 : azarEstable(semillaTransito, enemigosRestantes, 301) % 3
    escoltasFormacion = claseFormacion == 1 ? 2 : (claseFormacion == 2 ? 1 : 0)
    if (tipoEnemigo == 4) {
        faseJefe = 1
        cascoMaxJefe = cascoEnemigo
        jefeEsperando = false
        refuerzosJefe = 0
    }
    pasoPatronEnemigo = 0
    movimientoEnemigoMs = ahora + retrasoMovimientoEnemigo()
    siguienteAtaqueEnemigoMs = ahora + 1000 + azarEstable(semillaTransito, enemigosRestantes, 12) % 600
    disparoAtaqueMs = 0
    mensajeVuelo = nombreTipoEnemigo(tipoEnemigo)
}

function actualizarPuntoDebilJefe(): void {
    if (faseJefe == 1) {
        debilJefeX = enemigoX - Math.idiv(tamanoEnemigo, 2)
        debilJefeY = enemigoY
    } else if (faseJefe == 2) {
        debilJefeX = enemigoX + Math.idiv(tamanoEnemigo, 2)
        debilJefeY = enemigoY - 2
    } else {
        debilJefeX = enemigoX
        debilJefeY = enemigoY + Math.idiv(tamanoEnemigo, 3)
    }
}

function crearRefuerzoJefe(): void {
    let ahora = game.runtime()
    enemigoActivo = true
    tipoEnemigo = refuerzosJefe % 2 == 0 ? 2 : 0
    tamanoEnemigo = tipoEnemigo == 2 ? 10 : 8
    cascoEnemigo = 3 + peligroMundoEficaz(objetivoTransito) + modoJuego
    escudoEnemigo = tipoEnemigo == 2 ? 2 : 0
    enemigoX = refuerzosJefe % 2 == 0 ? 38 : 122
    enemigoY = 30 + refuerzosJefe * 7
    enemigoVX = enemigoX < 80 ? 1 : -1
    enemigoVY = 1
    pasoPatronEnemigo = 0
    movimientoEnemigoMs = ahora + retrasoMovimientoEnemigo()
    siguienteAtaqueEnemigoMs = ahora + 850
    disparoAtaqueMs = 0
    claseFormacion = 1
    escoltasFormacion = 0
    mensajeVuelo = Textos.t(558)
    tocarSonidoAlarma()
}

function iniciarRefuerzosJefe(cantidad: number): void {
    cascoGuardadoJefe = cascoEnemigo
    escudoGuardadoJefe = escudoEnemigo
    refuerzosJefe = cantidad
    jefeEsperando = true
    crearRefuerzoJefe()
}

function restaurarJefeDespuesRefuerzos(): void {
    let ahora = game.runtime()
    jefeEsperando = false
    enemigoActivo = true
    tipoEnemigo = 4
    tamanoEnemigo = 14 + peligroMundoEficaz(objetivoTransito)
    cascoEnemigo = cascoGuardadoJefe
    escudoEnemigo = escudoGuardadoJefe + faseJefe
    enemigoX = 80
    enemigoY = 40
    enemigoVX = faseJefe >= 3 ? 2 : 1
    enemigoVY = 1
    pasoPatronEnemigo = 0
    movimientoEnemigoMs = ahora + retrasoMovimientoEnemigo()
    siguienteAtaqueEnemigoMs = ahora + 900
    disparoAtaqueMs = 0
    claseFormacion = 0
    escoltasFormacion = 0
    mensajeVuelo = Textos.t(559) + faseJefe
    tocarSonidoEncuentro()
}

function revisarFaseJefe(): void {
    if (tipoEnemigo != 4 || jefeEsperando || cascoEnemigo <= 0) return
    if (faseJefe == 1 && cascoEnemigo * 3 <= cascoMaxJefe * 2) {
        faseJefe = 2
        iniciarRefuerzosJefe(2 + modoJuego)
    } else if (faseJefe == 2 && cascoEnemigo * 3 <= cascoMaxJefe) {
        faseJefe = 3
        iniciarRefuerzosJefe(1 + modoJuego)
    }
}

function nombreTipoEnemigo(tipo: number): string {
    if (tipo == 0) return Textos.t(560)
    if (tipo == 1) return Textos.t(561)
    if (tipo == 2) return Textos.t(562)
    if (tipo == 3) return Textos.t(563)
    return Textos.t(564)
}

function retrasoMovimientoEnemigo(): number {
    if (tipoEnemigo == 0) return 34
    if (tipoEnemigo == 1) return 42
    if (tipoEnemigo == 2) return 72
    if (tipoEnemigo == 3) return 30
    return 82
}

function empezarEncuentroRescate(): void {
    faseVuelo = FaseVuelo.Encuentro
    faseIniciadaMs = game.runtime()
    mensajeVuelo = Textos.t(500)
    enemigoActivo = false
    capsulaRescateX = 42 + azarEstable(semillaTransito, semillaMision, 2) % 77
    capsulaRescateY = 27 + azarEstable(semillaTransito, semillaMision, 3) % 35
    avanceTractor = 0
    tocarSonidoSenalRescate()
}

function empezarAcercamiento(conSonido: boolean): void {
    faseVuelo = FaseVuelo.Acercamiento
    faseIniciadaMs = game.runtime()
    enemigoActivo = false
    disparoAtaqueMs = 0
    huidaIniciadaMs = 0
    avanceAtraque = 0
    mensajeVuelo = Textos.t(565)
    if (conSonido) tocarSonidoAcercamiento()
}

function actualizarMira(dt: number): void {
    let seMueve = controller.left.isPressed() || controller.right.isPressed() || controller.up.isPressed() ||
        controller.down.isPressed()
    if (!seMueve) {
        restoMovimientoMira = 0
        return
    }
    let velocidadPorSegundo = controller.B.isPressed() ? 94 : 63
    if (modoEnergia == 3) velocidadPorSegundo += 24
    velocidadPorSegundo = Math.max(28, velocidadPorSegundo - danoModulo[ModuloNave.Motor] * 11)
    restoMovimientoMira += dt * velocidadPorSegundo
    let paso = Math.idiv(restoMovimientoMira, 1000)
    restoMovimientoMira %= 1000
    if (paso <= 0) return
    if (controller.left.isPressed()) miraX -= paso
    if (controller.right.isPressed()) miraX += paso
    if (controller.up.isPressed()) miraY -= paso
    if (controller.down.isPressed()) miraY += paso
    miraX = Math.clamp(12, 148, miraX)
    miraY = Math.clamp(17, 82, miraY)
}

function actualizarEnergiaVuelo(dt: number): void {
    let ritmoEnergia = modoEnergia == 2 ? 15 : (modoEnergia == 1 ? 6 : 9)
    ritmoEnergia = Math.max(2, ritmoEnergia - danoModulo[ModuloNave.Armas] * 2)
    restoEnergiaArma += dt * ritmoEnergia
    while (restoEnergiaArma >= 1000) {
        restaurarEnergiaArma(1)
        restoEnergiaArma -= 1000
    }
    if (faseVuelo == FaseVuelo.Encuentro && escudoVuelo < escudoMax()) {
        let ritmoEscudo = modoEnergia == 1 ? 3 : 1
        restoEnergiaEscudo += dt * ritmoEscudo
        let pasoEscudo = modoEnergia == 1 ? 1800 : 3600
        if (restoEnergiaEscudo >= pasoEscudo) {
            escudoVuelo++
            restoEnergiaEscudo = 0
        }
    } else restoEnergiaEscudo = 0
}

function actualizarVuelo(): void {
    if (escenaActiva != NumeroEscena.Vuelo) return
    let ahora = game.runtime()
    if (ahora - ultimaActualizacionVueloMs < 32) return
    let dt = Math.min(80, ahora - ultimaActualizacionVueloMs)
    ultimaActualizacionVueloMs = ahora
    actualizarMira(dt)
    actualizarEnergiaVuelo(dt)
    if (calorLaser > 0) {
        restoFrioLaser += dt
        let pasoFrio = modoEnergia == 2 ? 85 : 120
        while (restoFrioLaser >= pasoFrio && calorLaser > 0) {
            calorLaser--
            restoFrioLaser -= pasoFrio
        }
    } else restoFrioLaser = 0
    if (faseVuelo == FaseVuelo.Despegue) {
        if (ahora - faseIniciadaMs > 1700) empezarCrucero()
    } else if (faseVuelo == FaseVuelo.Crucero) {
        if (ahora - faseIniciadaMs > 2500) elegirEncuentro()
    } else if (faseVuelo == FaseVuelo.Suceso) {
        if (sucesoVueloResuelto && ahora - sucesoVueloResueltoMs > 1150) salirSucesoVuelo()
    } else if (faseVuelo == FaseVuelo.Encuentro) {
        if (claseMision == ClaseMision.Rescate && objetivoMision == objetivoTransito && avanceMision == 0 &&
            !enemigoActivo && !rescateDespuesCombate) actualizarTractor(ahora, dt)
        else actualizarCombate(ahora)
        if (escenaActiva != NumeroEscena.Vuelo) return
        actualizarHuida(ahora)
    } else if (faseVuelo == FaseVuelo.Acercamiento) {
        actualizarAtraque(ahora, dt)
    }
}

function actualizarCombate(ahora: number): void {
    if (!enemigoActivo) return
    let pasosMovimiento = 0
    while (ahora >= movimientoEnemigoMs && pasosMovimiento < 4) {
        let velocidad = tipoEnemigo == 0 || tipoEnemigo == 3 ? 2 : 1
        if (tipoEnemigo == 4 && faseJefe >= 3) velocidad = 2
        enemigoX += enemigoVX * velocidad
        enemigoY += enemigoVY
        pasoPatronEnemigo++
        if (tipoEnemigo == 1 && pasoPatronEnemigo % 9 == 0) enemigoVY = 0 - enemigoVY
        if (tipoEnemigo == 3 && pasoPatronEnemigo % 13 == 0) enemigoVX = 0 - enemigoVX
        if (enemigoX < 24 || enemigoX > 136) enemigoVX = 0 - enemigoVX
        if (enemigoY < 20 || enemigoY > 70) enemigoVY = 0 - enemigoVY
        movimientoEnemigoMs += retrasoMovimientoEnemigo()
        pasosMovimiento++
    }
    if (tipoEnemigo == 4) actualizarPuntoDebilJefe()
    if (pasosMovimiento >= 4 && ahora >= movimientoEnemigoMs)
        movimientoEnemigoMs = ahora + retrasoMovimientoEnemigo()
    if (disparoAtaqueMs == 0 && ahora >= siguienteAtaqueEnemigoMs) {
        ataqueX = miraX
        ataqueY = miraY
        disparoAtaqueMs = ahora + (tipoEnemigo == 3 ? 470 : (tipoEnemigo == 2 || tipoEnemigo == 4 ? 760 : 620))
        secuenciaAtaqueEnemigo++
        tocarSonidoBloqueoEnemigo()
    } else if (disparoAtaqueMs > 0 && ahora >= disparoAtaqueMs) {
        if (Math.abs(miraX - ataqueX) < 13 && Math.abs(miraY - ataqueY) < 13) {
            let dano = 1 + (tipoEnemigo >= 2 ? 1 : 0) + (tipoEnemigo == 4 ? 1 : 0) + (modoJuego == 2 ? 1 : 0)
            if (escoltasFormacion > 0) dano++
            danarJugador(dano)
            if (escenaActiva != NumeroEscena.Vuelo) return
        }
        disparoAtaqueMs = 0
        siguienteAtaqueEnemigoMs = ahora + 820 +
            azarEstable(semillaTransito, secuenciaAtaqueEnemigo, enemigosRestantes + 31) % 720
    }
}

function actualizarTractor(ahora: number, dt: number): void {
    let pasosDeriva = 0
    while (ahora >= derivaRescateMs && pasosDeriva < 3) {
        capsulaRescateX += azarEstable(semillaTransito, pasoDerivaRescate, 5) % 3 - 1
        capsulaRescateY += azarEstable(semillaTransito, pasoDerivaRescate, 6) % 3 - 1
        pasoDerivaRescate++
        derivaRescateMs += 96
        pasosDeriva++
    }
    if (pasosDeriva >= 3 && ahora >= derivaRescateMs) derivaRescateMs = ahora + 96
    capsulaRescateX = Math.clamp(24, 136, capsulaRescateX)
    capsulaRescateY = Math.clamp(22, 70, capsulaRescateY)
    let enAlcance = Math.abs(miraX - capsulaRescateX) <= 11 && Math.abs(miraY - capsulaRescateY) <= 11
    if (controller.A.isPressed() && enAlcance) avanceTractor += dt
    else avanceTractor = Math.max(0, avanceTractor - dt * 2)
    if (avanceTractor >= 900) {
        avanceMision = 1
        tocarSonidoRescateCumplido()
        empezarAcercamiento(false)
    }
}

function actualizarHuida(ahora: number): void {
    if (faseVuelo != FaseVuelo.Encuentro) return
    if (controller.B.isPressed() && combustible > 0) {
        if (huidaIniciadaMs == 0) huidaIniciadaMs = ahora
        if (ahora - huidaIniciadaMs >= tiempoCargaHuida()) {
            combustible--
            mensajeVuelo = Textos.t(566)
            tocarSonidoHuida()
            empezarAcercamiento(false)
        }
    } else huidaIniciadaMs = 0
}

function actualizarAtraque(ahora: number, dt: number): void {
    let puertaX = 80 + Math.round(Math.sin((ahora - faseIniciadaMs) / 700) * 12)
    let puertaY = 46
    if (Math.abs(miraX - puertaX) < 9 && Math.abs(miraY - puertaY) < 9) avanceAtraque += dt
    else avanceAtraque = Math.max(0, avanceAtraque - dt * 2)
    if (avanceAtraque >= 900 && ahora - faseIniciadaMs > 1200) terminarAtraque()
}

function dispararArma(): void {
    if (escenaActiva != NumeroEscena.Vuelo || entradaBloqueada) return
    let ahora = game.runtime()
    if (faseVuelo == FaseVuelo.Suceso) {
        resolverSucesoVuelo(true)
        return
    }
    if (faseVuelo != FaseVuelo.Encuentro) return
    if (claseMision == ClaseMision.Rescate && objetivoMision == objetivoTransito && avanceMision == 0 &&
        !enemigoActivo) return
    if (ahora < armaListaMs || !enemigoActivo || danoModulo[ModuloNave.Armas] >= 3) {
        if (danoModulo[ModuloNave.Armas] >= 3) mostrarPistaVuelo(Textos.t(567))
        return
    }
    // Si el compartimento de misiles o de minas está vacío, el arma vuelve al láser para que A siempre dispare algo.
    if (armaActiva == ClaseArma.Misil && misiles <= 0 ||
        armaActiva == ClaseArma.Mina && minas <= 0) {
        armaActiva = ClaseArma.Laser
        mostrarPistaVuelo(Textos.t(580) + nombreArma(armaActiva))
    }
    if (armaActiva == ClaseArma.Misil) dispararMisil(ahora)
    else if (armaActiva == ClaseArma.Mina) dispararMina(ahora)
    else dispararLaser(ahora)
}

function mostrarPistaVuelo(mensaje: string): void {
    textoPista = mensaje
    textoPistaHastaMs = game.runtime() + 900
    pistaVueloHastaMs = textoPistaHastaMs
}

function dispararLaser(ahora: number): void {
    if (calorLaser >= 10 || energiaArma < 7) {
        tocarSonidoError()
        mostrarPistaVuelo(calorLaser >= 10 ? Textos.t(568) : Textos.t(569))
        return
    }
    armaListaMs = ahora + enfriamientoLaser()
    destelloArmaHastaMs = ahora + 90
    calorLaser = Math.min(10, calorLaser + 3)
    energiaArma -= 7
    impactoArma = Math.abs(miraX - enemigoX) <= tamanoEnemigo && Math.abs(miraY - enemigoY) <= tamanoEnemigo
    tocarSonidoLaser(impactoArma)
    if (impactoArma) {
        aplicarDanoEnemigo(danoLaser(), false)
    }
}

function dispararMisil(ahora: number): void {
    if (!usarMisil()) {
        tocarSonidoError()
        mostrarPistaVuelo(misiles <= 0 ? Textos.t(570) : Textos.t(571))
        return
    }
    armaListaMs = ahora + 720
    destelloArmaHastaMs = ahora + 180
    impactoArma = Math.abs(miraX - enemigoX) <= tamanoEnemigo + 18 &&
        Math.abs(miraY - enemigoY) <= tamanoEnemigo + 18
    tocarSonidoLaser(impactoArma)
    if (impactoArma) aplicarDanoEnemigo(5 + mejoras[MEJORA_LASER], true)
}

function dispararMina(ahora: number): void {
    if (!usarMina()) {
        tocarSonidoError()
        mostrarPistaVuelo(minas <= 0 ? Textos.t(572) : Textos.t(573))
        return
    }
    armaListaMs = ahora + 900
    destelloArmaHastaMs = ahora + 220
    impactoArma = true
    disparoAtaqueMs = 0
    siguienteAtaqueEnemigoMs = ahora + 1500
    tocarSonidoExplosion()
    if (escoltasFormacion > 0) {
        victoriasTotal += escoltasFormacion
        escoltasFormacion = 0
        mostrarPistaVuelo(Textos.t(574))
    }
    aplicarDanoEnemigo(3 + mejoras[MEJORA_LASER], false)
}

function aplicarDanoEnemigo(cantidad: number, armaPrecision: boolean): void {
    let ahora = game.runtime()
    if (escoltasFormacion > 0) {
        escoltasFormacion--
        victoriasTotal++
        creditos += 12
        tocarSonidoExplosion()
        mostrarPistaVuelo(Textos.t(575))
        actualizarLogros()
        return
    }
    if (tipoEnemigo == 4) {
        actualizarPuntoDebilJefe()
        let impactoDebil = armaPrecision ||
            Math.abs(miraX - debilJefeX) <= 8 && Math.abs(miraY - debilJefeY) <= 8
        if (!impactoDebil) {
            cantidad = Math.max(1, Math.idiv(cantidad, 3))
            mostrarPistaVuelo(Textos.t(576))
        } else mostrarPistaVuelo(Textos.t(577))
    }
    if (escudoEnemigo > 0) {
        let absorbido = Math.min(escudoEnemigo, cantidad)
        escudoEnemigo -= absorbido
        cantidad -= absorbido
        textoPista = Textos.t(578) + absorbido
        textoPistaHastaMs = ahora + 650
    }
    cascoEnemigo -= cantidad
    if (cascoEnemigo <= 0) derrotarEnemigo()
    else revisarFaseJefe()
}

function secundariaVuelo(): void {
    if (escenaActiva != NumeroEscena.Vuelo || entradaBloqueada) return
    if (faseVuelo == FaseVuelo.Suceso) {
        resolverSucesoVuelo(false)
        return
    }
    if (controller.left.isPressed()) {
        cambiarModoEnergia(-1)
        tocarSonidoNavegar()
        mostrarPistaVuelo(Textos.t(579) + nombreModoEnergia())
    } else if (controller.right.isPressed()) {
        cambiarModoEnergia(1)
        tocarSonidoNavegar()
        mostrarPistaVuelo(Textos.t(579) + nombreModoEnergia())
    } else {
        cambiarArma(1)
        tocarSonidoNavegar()
        mostrarPistaVuelo(Textos.t(580) + nombreArma(armaActiva))
    }
}

function derrotarEnemigo(): void {
    enemigoActivo = false
    disparoAtaqueMs = 0
    victoriasTotal++
    let recompensa = 18 + peligroMundoEficaz(objetivoTransito) * 12 + tipoEnemigo * 7
    if (modoJuego > 0) recompensa += Math.idiv(recompensa * modoJuego, 4)
    creditos += recompensa
    if (jefeEsperando) {
        refuerzosJefe--
        tocarSonidoExplosion()
        actualizarLogros()
        if (refuerzosJefe > 0) crearRefuerzoJefe()
        else restaurarJefeDespuesRefuerzos()
        return
    }
    enemigosRestantes--
    if (claseMision == ClaseMision.Caza && objetivoMision == objetivoTransito) avanceMision++
    if (tipoEnemigo == 4) {
        victoriasJefe++
        ajustarReputacion(Faccion.Union, 5)
        anadirArtefacto(azarEstable(semillaTransito, diaJuego, victoriasJefe + 313) % CANTIDAD_ARTEFACTOS)
    }
    darRecuperacion()
    tocarSonidoExplosion()
    escoltasFormacion = 0
    actualizarLogros()
    if (enemigosRestantes > 0) crearEnemigo(claseMision == ClaseMision.Caza && objetivoMision == objetivoTransito)
    else if (rescateDespuesCombate) {
        rescateDespuesCombate = false
        empezarEncuentroRescate()
    } else empezarAcercamiento(false)
}

function darRecuperacion(): void {
    let tirada = azarEstable(semillaTransito, victoriasTotal, tipoEnemigo + enemigosRestantes * 7) % 100
    let probabilidad = 32 + (rolNave == RolNave.Mercader ? 23 : 0) + mejoras[MEJORA_ESCANER] * 8
    if (tipoEnemigo >= 3 && tirada < 12 &&
        anadirRareza(azarEstable(semillaTransito, victoriasTotal, 317) % CANTIDAD_RAREZAS, 1)) {
        textoPista = Textos.t(581)
    } else if (unidadesCarga() < capacidadCarga() && tirada < probabilidad) {
        let mercancia = azarEstable(semillaTransito, victoriasTotal, tipoEnemigo + 73) % CANTIDAD_MERCANCIAS
        carga[mercancia]++
        textoPista = Textos.t(582) + Textos.t(NOMBRES_MERCANCIA[mercancia])
    } else {
        let chatarra = 6 + tipoEnemigo * 3
        creditos += chatarra
        textoPista = Textos.t(583) + chatarra + Textos.t(319)
    }
    textoPistaHastaMs = game.runtime() + 1200
}

function danarJugador(cantidad: number): boolean {
    let probabilidadEsquivar = controller.B.isPressed() ? 50 : 0
    if (rolNave == RolNave.Mensajero) probabilidadEsquivar += 15
    if (modoEnergia == 3) probabilidadEsquivar += 18
    probabilidadEsquivar -= danoModulo[ModuloNave.Motor] * 12
    if (azarEstable(semillaTransito, secuenciaAtaqueEnemigo, miraX) % 100 < probabilidadEsquivar) {
        textoPista = Textos.t(584)
        textoPistaHastaMs = game.runtime() + 700
        return false
    }
    destelloDanoHastaMs = game.runtime() + 180
    let cascoAntes = casco
    let escudoAntes = escudoVuelo
    if (modoEnergia == 1 && cantidad > 1) cantidad--
    while (cantidad > 0 && escudoVuelo > 0) {
        escudoVuelo--
        cantidad--
    }
    if (escudoAntes > 0 && escudoVuelo <= 0) tocarSonidoRupturaEscudo()
    casco -= cantidad
    if (casco < cascoAntes && claseMision == ClaseMision.Entrega &&
        varianteMision == VarianteMision.Fragil)
        avanceMision = 1
    let cargaComercio = 0
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) cargaComercio += carga[i]
    if (casco < cascoAntes && tipoEnemigo == 1 && cargaComercio > 0 &&
        azarEstable(semillaTransito, secuenciaAtaqueEnemigo, 91) % 3 == 0) {
        quitarUnidadesCarga(1)
        textoPista = Textos.t(585)
        textoPistaHastaMs = game.runtime() + 900
    }
    if (casco < cascoAntes) {
        let tiradaModulo = azarEstable(semillaTransito, secuenciaAtaqueEnemigo, casco + 331) % 100
        if (tiradaModulo < 24 + peligroMundoEficaz(objetivoTransito) * 5) {
            let modulo = azarEstable(semillaTransito, secuenciaAtaqueEnemigo, 337) % CANTIDAD_MODULOS_NAVE
            danarModulo(modulo, 1)
            textoPista = nombreModuloCorto(modulo) + Textos.t(586)
            textoPistaHastaMs = game.runtime() + 1000
            if (modulo == ModuloNave.Carga && unidadesCarga() > 0) quitarUnidadesCarga(1)
        }
    }
    tocarSonidoDano()
    if (casco <= 0) hacerRescateAsegurado()
    return true
}

function nombreModuloCorto(modulo: number): string {
    if (modulo == ModuloNave.Motor) return Textos.t(115)
    if (modulo == ModuloNave.Escaner) return Textos.t(116)
    if (modulo == ModuloNave.Armas) return Textos.t(117)
    return Textos.t(587)
}

function perdidaCargaAsegurada(): number {
    let total = 0
    for (let i = 0; i < CANTIDAD_MERCANCIAS; i++) total += carga[i]
    if (total <= 0) return 0
    let nivel = mejoras[MEJORA_SEGURO]
    if (nivel >= 2) return 1
    if (nivel == 1) return Math.idiv(total + 5, 6)
    return Math.idiv(total + 2, 3)
}

function quitarUnidadesCarga(cantidad: number): void {
    let cursor = semillaTransito % CANTIDAD_MERCANCIAS
    let quitado = 0
    let revisiones = 0
    while (quitado < cantidad && revisiones < CANTIDAD_MERCANCIAS * 20) {
        let mercancia = cursor % CANTIDAD_MERCANCIAS
        if (carga[mercancia] > 0) {
            let unidadesAnteriores = carga[mercancia]
            let porCoste = Math.idiv(costeCarga[mercancia], unidadesAnteriores)
            carga[mercancia]--
            costeCarga[mercancia] = Math.max(0, costeCarga[mercancia] - porCoste)
            if (carga[mercancia] == 0) costeCarga[mercancia] = 0
            quitado++
        }
        cursor += 5
        revisiones++
    }
}

function hacerRescateAsegurado(): void {
    tocarSonidoNaveDestruida()
    if (!cargarJuego()) {
        iniciarPartidaNueva()
        mostrarAviso(Textos.t(222), Textos.t(588), "", NumeroEscena.Hangar)
        return
    }
    let perdido = perdidaCargaAsegurada()
    quitarUnidadesCarga(perdido)
    if (claseMision != ClaseMision.Ninguna) misionesFalladas++
    if (fuenteMision == 2) etapaTutorial = 1
    vaciarMision()
    mundoActual = origenTransito
    mundoDestino = mundoActual
    enTransito = 0
    casco = cascoMax()
    combustible = Math.max(1, combustible)
    darCombustibleEmergencia()
    escribirPartida()
    mostrarAviso(Textos.t(589), Textos.t(590) + perdido, Textos.t(591), NumeroEscena.Hangar)
}

function terminarAtraque(): void {
    let objetivoFinalRuta = cantidadSaltosRuta() > 0 ? mundoEnRuta(cantidadSaltosRuta()) : -1
    mundoActual = objetivoTransito
    mundoDestino = mundoActual
    let sigueRuta = false
    if (objetivoFinalRuta >= 0 && objetivoFinalRuta != mundoActual && planearRutaHasta(objetivoFinalRuta) &&
        cantidadSaltosRuta() > 0) {
        mundoDestino = mundoEnRuta(1)
        sigueRuta = true
    } else vaciarRutaPrevista()
    enTransito = 0
    diaJuego++
    anotarSalto()
    let pagoRecibido = pagoMision
    let resultado = resolverMisionAlAtracar()
    if (mejoras[MEJORA_REPARACION] > 0) casco = Math.min(cascoMax(), casco + 1)
    if (mejoras[MEJORA_REPARACION] > 0) repararModulos()
    else {
        for (let modulo = 0; modulo < CANTIDAD_MODULOS_NAVE; modulo++) {
            if (danoModulo[modulo] > 0) danoModulo[modulo]--
        }
    }
    energiaArma = 100
    let combustibleEmergencia = darCombustibleEmergencia()
    actualizarSucesoMercado()
    renovarMercado()
    recordarMercadoActual()
    actualizarLogros()
    escribirPartida()
    if (resultado == 2) {
        tocarSonidoMision()
        mostrarAviso(Textos.t(592), "+" + pagoRecibido + Textos.t(593), Textos.t(594), NumeroEscena.Hangar)
    } else if (resultado == 4) {
        tocarSonidoMision()
        mostrarAviso(Textos.t(595), Textos.t(596), Textos.t(317) + nombreRango(), NumeroEscena.Hangar)
    } else if (resultado == 3) {
        tocarSonidoMision()
        mostrarAviso(Textos.t(597), "+" + pagoRecibido + Textos.t(593),
            Textos.t(389) + etapaAventura + "/6", NumeroEscena.Hangar)
    } else if (resultado == 1) {
        tocarSonidoMision()
        let lineaRango = rangoActual() > rangoVueloAntes ? Textos.t(598) + nombreRango() : Textos.t(599)
        mostrarAviso(Textos.t(600), "+" + pagoRecibido + Textos.t(593), lineaRango, NumeroEscena.Hangar)
    } else if (resultado == -1) {
        tocarSonidoError()
        mostrarAviso(Textos.t(601), Textos.t(602), Textos.t(599), NumeroEscena.Hangar)
    } else if (resultado == -2) {
        tocarSonidoError()
        mostrarAviso(Textos.t(603), Textos.t(604), Textos.t(599), NumeroEscena.Hangar)
    } else {
        tocarSonidoAtraque()
        let lineaMuelle = combustibleEmergencia ? Textos.t(605)
            : (sigueRuta ? Textos.t(606) + NOMBRES_MUNDO[objetivoFinalRuta] : Textos.t(607))
        mostrarAviso(Textos.t(608) + NOMBRES_MUNDO[mundoActual], lineaMuelle, Textos.t(599), NumeroEscena.Hangar)
    }
}

function darCombustibleEmergencia(): boolean {
    let minimo = Math.min(2, combustibleMax())
    let necesario = minimo - combustible
    if (necesario > 0 && creditos < necesario * 8) {
        combustible = minimo
        return true
    }
    return false
}

function resolverMisionAlAtracar(): number {
    if (claseMision == ClaseMision.Ninguna) return 0
    if (diaJuego > plazoMision) {
        misionesFalladas++
        if (fuenteMision == 2) etapaTutorial = 1
        vaciarMision()
        return -1
    }
    let cumplida = false
    if (mundoActual == objetivoMision) {
        if (claseMision == ClaseMision.Entrega) {
            if (varianteMision == VarianteMision.Fragil && avanceMision > 0) {
                misionesFalladas++
                vaciarMision()
                return -2
            }
            cumplida = true
        }
        if (claseMision == ClaseMision.Caza && avanceMision >= cantidadMision) cumplida = true
        if (claseMision == ClaseMision.Rescate && avanceMision > 0) cumplida = true
    }
    if (!cumplida) return 0
    let fuente = fuenteMision
    let claseCumplida = claseMision
    let varianteCumplida = varianteMision
    creditos += pagoMision
    misionesCumplidas++
    if (claseCumplida == ClaseMision.Entrega) anotarEntrega()
    if (claseCumplida == ClaseMision.Rescate) anotarRescate()
    let faccionMision = faccionSucesoVuelo()
    ajustarReputacion(faccionMision, fuente == 1 ? 5 : 2)
    if (varianteCumplida == VarianteMision.Ilegal) {
        ajustarReputacion(Faccion.Forajidos, 4)
        ajustarReputacion(Faccion.Union, -2)
    }
    if (fuente == 2) {
        etapaTutorial = 4
        mejoras[MEJORA_ESCANER] = Math.max(1, mejoras[MEJORA_ESCANER])
    } else if (fuente == 1) avanzarEtapaAventura()
    else if (fuente == 3) cumplirMisionDiaria()
    vaciarMision()
    if (fuente == 2) return 2
    if (fuente == 1 && etapaAventura >= 6) return 4
    if (fuente == 1) return 3
    return 1
}

function dibujarEstrellasVuelo(ahora: number): void {
    let sacudidaX = sacudidaVisualVueloX()
    let sacudidaY = sacudidaVisualVueloY()
    for (let i = 0; i < 24; i++) {
        let x = (azarEstable(semillaTransito, i, 3) + sacudidaX + 160) % 160
        let baseY = azarEstable(semillaTransito, i, 7) % 88
        let velocidad = 1 + i % 3
        let y = (baseY + Math.idiv(ahora - faseIniciadaMs, 35) * velocidad + sacudidaY + 88) % 88
        screen.setPixel(x, y, i % 5 == 0 ? COLOR_CIAN : COLOR_TEXTO)
    }
}

function sacudidaVisualVueloX(): number {
    if (!sacudidaCamara || game.runtime() >= destelloDanoHastaMs) return 0
    return Math.idiv(game.runtime(), 35) % 2 == 0 ? -2 : 2
}

function sacudidaVisualVueloY(): number {
    if (!sacudidaCamara || game.runtime() >= destelloDanoHastaMs) return 0
    return Math.idiv(game.runtime(), 55) % 2 == 0 ? -1 : 1
}

function dibujarCabina(): void {
    screen.fill(COLOR_FONDO)
    dibujarEstrellasVuelo(game.runtime())
    let sacudidaX = sacudidaVisualVueloX()
    let sacudidaY = sacudidaVisualVueloY()
    screen.drawLine(0, 88 + sacudidaY, 31 + sacudidaX, 70 + sacudidaY, COLOR_TENUE)
    screen.drawLine(159, 88 + sacudidaY, 129 + sacudidaX, 70 + sacudidaY, COLOR_TENUE)
    screen.drawLine(31 + sacudidaX, 70 + sacudidaY, 47 + sacudidaX, 88 + sacudidaY, COLOR_TENUE)
    screen.drawLine(129 + sacudidaX, 70 + sacudidaY, 113 + sacudidaX, 88 + sacudidaY, COLOR_TENUE)
    screen.fillRect(0, 89, 160, 31, COLOR_AZUL)
    screen.drawLine(0, 89, 160, 89, COLOR_CIAN)
    imprimirTextoJuego(Textos.t(260), 3, 94, COLOR_CIAN)
    screen.fillRect(13, 95, escudoVuelo * 22 / Math.max(1, escudoMax()), 4, COLOR_CIAN)
    imprimirTextoJuego(Textos.t(609), 3, 104, COLOR_VERDE)
    screen.fillRect(13, 105, casco * 22 / Math.max(1, cascoMax()), 4, casco <= 2 ? COLOR_ROJO : COLOR_VERDE)
    imprimirTextoJuego(Textos.t(610), 45, 94, COLOR_AMARILLO)
    screen.fillRect(55, 95, calorLaser * 2, 4, calorLaser >= 8 ? COLOR_ROJO : COLOR_AMARILLO)
    imprimirTextoJuego(Textos.t(281) + combustible, 45, 104, COLOR_VERDE)
    imprimirTextoJuego(mensajeVuelo, 3, 80, COLOR_TEXTO)
    imprimirTextoJuego(nombreIndicadoresArma(), 78, 103, COLOR_AMARILLO)
    imprimirTextoJuego(Textos.t(611) + energiaArma, 111, 103, modoEnergia == 2 ? COLOR_AMARILLO : COLOR_CIAN)
    imprimirTextoJuego(Textos.t(612) + nombreModoEnergia(), 78, 111, modoEnergia == 0 ? COLOR_TENUE : COLOR_VERDE)
    let modulosDanados = 0
    for (let modulo = 0; modulo < CANTIDAD_MODULOS_NAVE; modulo++) if (danoModulo[modulo] > 0) modulosDanados++
    if (modulosDanados > 0) imprimirTextoJuego(Textos.t(613) + modulosDanados, 139, 111, COLOR_ROJO)
    if (huidaIniciadaMs > 0) {
        let cargaHuida = Math.min(28, Math.idiv((game.runtime() - huidaIniciadaMs) * 28, tiempoCargaHuida()))
        screen.drawRect(78, 107, 30, 6, COLOR_AMARILLO)
        screen.fillRect(79, 108, cargaHuida, 4, COLOR_AMARILLO)
    }
    if (game.runtime() < textoPistaHastaMs) {
        // En la aproximación a la estación y mientras se muestra la cápsula de rescate, la indicación va arriba: la
        // línea 80 lleva el mensaje de vuelo y las líneas 66 a 72, la instrucción de atraque o del rayo tractor con su
        // barra. Con la cápsula, el radar (y 9 a 26) está en pantalla, así que la indicación va justo debajo; la
        // cápsula se dibuja después y la indicación nunca la tapa.
        let pistaY = faseVuelo == FaseVuelo.Acercamiento ? 18 : (capsulaRescateVisible() ? 29 : 78)
        screen.fillRect(45, pistaY - 2, 112, 10, COLOR_FONDO)
        imprimirDerecha(textoPista, 156, pistaY, COLOR_AMARILLO)
    }
    if (game.runtime() < destelloDanoHastaMs) {
        screen.drawRect(0, 8, 159, 80, COLOR_ROJO)
        screen.drawRect(2, 10, 155, 76, COLOR_NARANJA)
    }
    dibujarRadarCabina()
}

function nombreIndicadoresArma(): string {
    if (armaActiva == ClaseArma.Misil) return Textos.t(614) + misiles
    if (armaActiva == ClaseArma.Mina) return Textos.t(615) + minas
    return Textos.t(616)
}

function dibujarRadarCabina(): void {
    if (faseVuelo != FaseVuelo.Encuentro) return
    let danoEscaner = danoModulo[ModuloNave.Escaner]
    screen.drawRect(132, 9, 25, 18, danoEscaner >= 2 ? COLOR_ROJO : COLOR_CIAN)
    screen.setPixel(144, 18, COLOR_VERDE)
    if (danoEscaner >= 3 && Math.idiv(game.runtime(), 180) % 2 == 0) {
        imprimirTextoJuego(Textos.t(201), 136, 14, COLOR_ROJO)
        return
    }
    if (enemigoActivo) {
        let rx = 144 + Math.clamp(-10, 10, Math.idiv(enemigoX - miraX, 7))
        let ry = 18 + Math.clamp(-7, 7, Math.idiv(enemigoY - miraY, 7))
        screen.fillRect(rx - 1, ry - 1, 3, 3, tipoEnemigo == 4 ? COLOR_ROJO : COLOR_NARANJA)
    }
    if (escoltasFormacion > 0 && danoEscaner < 2) {
        screen.setPixel(136, 13, COLOR_AMARILLO)
        if (escoltasFormacion > 1) screen.setPixel(153, 23, COLOR_AMARILLO)
    }
}

function dibujarMira(): void {
    screen.drawLine(miraX - 6, miraY, miraX - 2, miraY, COLOR_VERDE)
    screen.drawLine(miraX + 2, miraY, miraX + 6, miraY, COLOR_VERDE)
    screen.drawLine(miraX, miraY - 6, miraX, miraY - 2, COLOR_VERDE)
    screen.drawLine(miraX, miraY + 2, miraX, miraY + 6, COLOR_VERDE)
}

function dibujarEnemigo(): void {
    if (!enemigoActivo) return
    let x = enemigoX + sacudidaVisualVueloX()
    let y = enemigoY + sacudidaVisualVueloY()
    let s = tamanoEnemigo
    let color = tipoEnemigo >= 3 ? COLOR_ROJO
        : (tipoEnemigo == 2 ? COLOR_MORADO : (tipoEnemigo == 1 ? COLOR_AMARILLO : COLOR_NARANJA))
    dibujarFormacionEnemigo(x, y, s, color)
    if (tipoEnemigo == 0 || tipoEnemigo == 3) {
        screen.drawLine(x - s, y, x, y - Math.idiv(s, 2), color)
        screen.drawLine(x, y - Math.idiv(s, 2), x + s, y, color)
        screen.drawLine(x + s, y, x, y + Math.idiv(s, 2), color)
        screen.drawLine(x, y + Math.idiv(s, 2), x - s, y, color)
    } else if (tipoEnemigo == 1) {
        screen.drawLine(x - s, y + Math.idiv(s, 2), x, y - s, color)
        screen.drawLine(x, y - s, x + s, y + Math.idiv(s, 2), color)
        screen.drawLine(x + s, y + Math.idiv(s, 2), x - s, y + Math.idiv(s, 2), color)
    } else {
        screen.drawRect(x - s, y - Math.idiv(s, 2), s * 2, s, color)
        screen.drawLine(x - s, y, x - s - 4, y - 5, color)
        screen.drawLine(x + s, y, x + s + 4, y - 5, color)
    }
    if (escudoEnemigo > 0) {
        let pulso = Math.idiv(game.runtime(), 90) % 3
        dibujarRomboVista(x, y, s + 5 + pulso, Math.idiv(s, 2) + 5 + pulso, COLOR_CIAN)
    }
    if (tipoEnemigo == 4) {
        actualizarPuntoDebilJefe()
        screen.drawCircle(debilJefeX + sacudidaVisualVueloX(), debilJefeY + sacudidaVisualVueloY(),
            3 + Math.idiv(game.runtime(), 120) % 2, COLOR_AMARILLO)
        imprimirTextoJuego(Textos.t(617) + faseJefe, x - 3, y - s - 8, COLOR_ROJO)
    }
    imprimirTextoJuego((escudoEnemigo > 0 ? Textos.t(260) + escudoEnemigo + " " : "") + Textos.t(609) + cascoEnemigo,
        x - 8, y + s + 2, COLOR_ROJO)
}

function dibujarFormacionEnemigo(x: number, y: number, tamano: number, color: number): void {
    if (claseFormacion == 2) {
        screen.drawRect(x - tamano - 9, y - 4, tamano * 2 + 18, 8, COLOR_TENUE)
        screen.drawLine(x - tamano - 12, y, x - tamano - 5, y, COLOR_AMARILLO)
        screen.drawLine(x + tamano + 5, y, x + tamano + 12, y, COLOR_AMARILLO)
    }
    if (escoltasFormacion > 0) {
        screen.drawLine(x - tamano - 12, y + 7, x - tamano - 6, y + 3, color)
        screen.drawLine(x - tamano - 6, y + 3, x - tamano - 4, y + 9, color)
    }
    if (escoltasFormacion > 1) {
        screen.drawLine(x + tamano + 12, y + 7, x + tamano + 6, y + 3, color)
        screen.drawLine(x + tamano + 6, y + 3, x + tamano + 4, y + 9, color)
    }
}

function dibujarSucesoVuelo(): void {
    screen.fillRect(5, 16, 150, 76, COLOR_AZUL)
    screen.drawRect(5, 16, 150, 76, sucesoVueloResuelto ? COLOR_VERDE : COLOR_CIAN)
    imprimirTextoJuego(tituloSucesoVuelo(), 9, 21, COLOR_AMARILLO)
    if (sucesoVueloResuelto) {
        imprimirTextoAjustado(resultadoSucesoVuelo, 9, 36, 23, COLOR_VERDE)
        imprimirTextoJuego(Textos.t(618), 9, 75, COLOR_TEXTO)
    } else {
        imprimirTextoAjustado(detalleSucesoVuelo(), 9, 36, 23, COLOR_TEXTO)
        imprimirTextoJuego(etiquetaAceptarSucesoVuelo(), 9, 67, COLOR_VERDE)
        imprimirTextoJuego(etiquetaRechazoSucesoVuelo(), 9, 80, COLOR_NARANJA)
    }
}

function capsulaRescateVisible(): boolean {
    return faseVuelo == FaseVuelo.Encuentro && claseMision == ClaseMision.Rescate &&
        objetivoMision == objetivoTransito && avanceMision == 0 && !enemigoActivo && !rescateDespuesCombate
}

function dibujarVuelo(): void {
    dibujarCabina()
    let ahora = game.runtime()
    if (faseVuelo == FaseVuelo.Despegue) {
        let abierto = Math.min(34, Math.idiv(ahora - faseIniciadaMs, 45))
        screen.drawRect(80 - abierto, 18, abierto * 2, 64, COLOR_CIAN)
        imprimirTextoJuego(Textos.t(254), 65, 43, COLOR_TEXTO)
    } else if (faseVuelo == FaseVuelo.Crucero) {
        imprimirTextoJuego(Textos.t(619) + NOMBRES_MUNDO[objetivoTransito], 35, 18, COLOR_CIAN)
    } else if (faseVuelo == FaseVuelo.Suceso) {
        dibujarSucesoVuelo()
    } else if (faseVuelo == FaseVuelo.Encuentro) {
        if (capsulaRescateVisible()) {
            // Igual que la instrucción de atraque, la indicación del rayo tractor está a la izquierda de su barra (la
            // línea 80 queda libre para el mensaje de vuelo). La cápsula flota por toda la imagen, por eso se dibuja la
            // última y ni la indicación ni la barra la tapan.
            imprimirDerecha(Textos.t(620), 111, 66, COLOR_AMARILLO)
            screen.drawRect(113, 67, 34, 5, COLOR_CIAN)
            screen.fillRect(114, 68, Math.min(32, Math.idiv(avanceTractor * 32, 900)), 3, COLOR_CIAN)
            screen.drawRect(capsulaRescateX - 5, capsulaRescateY - 5, 10, 10, COLOR_AMARILLO)
            screen.drawLine(capsulaRescateX - 7, capsulaRescateY,
                capsulaRescateX + 7, capsulaRescateY, COLOR_AMARILLO)
        } else dibujarEnemigo()
        if (disparoAtaqueMs > 0) {
            screen.drawRect(ataqueX - 9, ataqueY - 9, 18, 18, COLOR_ROJO)
            screen.drawLine(ataqueX - 12, ataqueY, ataqueX + 12, ataqueY, COLOR_ROJO)
        }
        if (ahora < destelloArmaHastaMs) {
            screen.drawLine(50, 88, impactoArma ? enemigoX : miraX, impactoArma ?
                enemigoY : miraY, COLOR_AMARILLO)
            screen.drawLine(110, 88, impactoArma ? enemigoX : miraX, impactoArma ?
                enemigoY : miraY, COLOR_AMARILLO)
        }
    } else if (faseVuelo == FaseVuelo.Acercamiento) {
        let transcurrido = ahora - faseIniciadaMs
        let puertaX = 80 + Math.round(Math.sin(transcurrido / 700) * 12)
        let tamano = Math.min(34, 13 + Math.idiv(transcurrido, 180))
        screen.drawRect(puertaX - tamano, 46 - Math.idiv(tamano, 2), tamano * 2, tamano, COLOR_CIAN)
        screen.drawRect(puertaX - Math.idiv(tamano, 2), 46 - Math.idiv(tamano, 4), tamano, Math.idiv(tamano, 2),
            COLOR_VERDE)
        // La instrucción de atraque está a la izquierda de la barra de atraque, bajo la puerta (borde inferior en y 62
        // como máximo): la línea 80 queda libre para el mensaje de vuelo, para que títulos largos como APROXIMACIÓN A
        // ESTACIÓN no se metan en ella.
        imprimirDerecha(Textos.t(621), 111, 66, COLOR_TEXTO)
        screen.drawRect(113, 67, 34, 5, COLOR_VERDE)
        screen.fillRect(114, 68, Math.min(32, Math.idiv(avanceAtraque * 32, 900)), 3, COLOR_VERDE)
    }
    if (faseVuelo != FaseVuelo.Suceso) dibujarMira()
}
