// ============================================
// ALIENGOTCHI - INAZUMA ELEVEN EDITION
// Sueño mágico 2.45s, velocidad comida +=3, Penal con +12 felicidad al gol
// ============================================

const MINIMO = 0;
const MAXIMO = 100;
const ENERGIA_DORMIR = 20;
const DECREMENTO_HAMBRE = 2;
const DECREMENTO_ENERGIA = 2;
const DECREMENTO_FELICIDAD = 2;
const COSTE_EVOLUCION = 100;

const ESTADOS = {
    FELIZ: 'happy',
    CON_SUENO: 'sleepy',
    DURMIENDO: 'sleeping',
    HAMBRE: 'hungry',
    ABURRIDO: 'bored'
};

const personajes = {
    byron: { id: 'byron', nombre: 'Byron Love', desbloqueado: true,  nivel: 1, monedasInvertidas: 0, precio: 0 },
    mark:  { id: 'mark',  nombre: 'Mark Evans',  desbloqueado: false, nivel: 1, monedasInvertidas: 0, precio: 50 },
    jude:  { id: 'jude',  nombre: 'Jude Sharp',  desbloqueado: false, nivel: 1, monedasInvertidas: 0, precio: 150 },
    shawn: { id: 'shawn', nombre: 'Shawn Frost', desbloqueado: false, nivel: 1, monedasInvertidas: 0, precio: 300 },
    axel:  { id: 'axel',  nombre: 'Axel Blaze',  desbloqueado: false, nivel: 1, monedasInvertidas: 0, precio: 500 }
};

let personajeActual = 'byron';
let monedasGlobales = 0;
let gameInterval = null;
let estaDurmiendo = false;

let mascota = {
    nombre: "",
    hambre: 70,
    energia: 70,
    felicidad: 70
};

let penalEnCurso = false;

// --- Elementos DOM ---
const hambreBar = document.getElementById('hambreBar');
const energiaBar = document.getElementById('energiaBar');
const felicidadBar = document.getElementById('felicidadBar');
const hambrePercent = document.getElementById('hambrePercent');
const energiaPercent = document.getElementById('energiaPercent');
const felicidadPercent = document.getElementById('felicidadPercent');
const alienNameDisplay = document.getElementById('alienNameDisplay');
const alienImage = document.getElementById('alienImage');
const monedasSpan = document.getElementById('monedasCount');

const adoptionScreen = document.getElementById('adoptionScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');
const selectorModal = document.getElementById('selectorModal');
const penalModal = document.getElementById('penalModal');
const porteroDiv = document.getElementById('portero');
const resultadoPenalDiv = document.getElementById('resultadoPenal');
const comidaModal = document.getElementById('comidaModal');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

// --- Imagen del alien para el canvas ---
let alienImgCanvas = new Image();
let alienImgCargada = false;
function actualizarImagenCanvas() {
    const person = personajes[personajeActual];
    const nivelTexto = person.nivel === 1 ? 'baby' : 'adult';
    const ruta = `assets/images/${personajeActual}/${nivelTexto}_happy.png`;
    alienImgCanvas.src = ruta;
    alienImgCanvas.onload = () => { alienImgCargada = true; };
    alienImgCanvas.onerror = () => { alienImgCargada = false; };
}

// --- Imagen de comida personalizada ---
let comidaImg = new Image();
comidaImg.src = 'assets/images/comida.png';
let comidaImgCargada = false;
comidaImg.onload = () => { comidaImgCargada = true; };
comidaImg.onerror = () => { console.log("No se encontró assets/images/comida.png, usando rectángulo"); };

// --- Auxiliares ---
function mostrarMensaje(texto, duracion = 2000) {
    const msg = document.createElement('div');
    msg.textContent = texto;
    msg.style.position = 'fixed';
    msg.style.bottom = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.backgroundColor = '#00ff9d';
    msg.style.color = '#0a0e1a';
    msg.style.padding = '8px 16px';
    msg.style.borderRadius = '30px';
    msg.style.fontWeight = 'bold';
    msg.style.zIndex = '2000';
    msg.style.fontFamily = 'monospace';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), duracion);
}

function guardarTodo() {
    const data = { mascota, monedasGlobales, personajes, personajeActual, estaDurmiendo: false };
    localStorage.setItem('aliengotchi', JSON.stringify(data));
}

function cargarTodo() {
    const guardado = localStorage.getItem('aliengotchi');
    if (guardado) {
        try {
            const data = JSON.parse(guardado);
            mascota = data.mascota;
            monedasGlobales = data.monedasGlobales;
            Object.assign(personajes, data.personajes);
            personajeActual = data.personajeActual;
            estaDurmiendo = false;
            actualizarImagenCanvas();
        } catch(e) { console.error("Error al cargar", e); }
    }
}

function obtenerEstadoActual() {
    if (estaDurmiendo) return ESTADOS.DURMIENDO;
    if (mascota.energia <= 20) return ESTADOS.CON_SUENO;
    if (mascota.hambre <= 20) return ESTADOS.HAMBRE;
    if (mascota.felicidad <= 20) return ESTADOS.ABURRIDO;
    return ESTADOS.FELIZ;
}

function actualizarImagen() {
    if (!alienImage) return;
    const person = personajes[personajeActual];
    if (!person) return;
    const nivelTexto = person.nivel === 1 ? 'baby' : 'adult';
    const estado = obtenerEstadoActual();
    const ruta = `assets/images/${personajeActual}/${nivelTexto}_${estado}.png`;
    const img = new Image();
    img.onload = () => {
        alienImage.innerHTML = `<img src="${ruta}" style="width:100px; height:100px; object-fit:contain;">`;
    };
    img.onerror = () => {
        const emojis = { byron:'⚡', mark:'🔥', jude:'🧠', shawn:'❄️', axel:'🌪️' };
        alienImage.innerHTML = `<div style="font-size: 4rem;">${emojis[personajeActual] || '👾'}</div>`;
    };
    img.src = ruta;
    actualizarImagenCanvas();
}

function actualizarUI() {
    if (hambreBar) hambreBar.value = mascota.hambre;
    if (energiaBar) energiaBar.value = mascota.energia;
    if (felicidadBar) felicidadBar.value = mascota.felicidad;
    if (hambrePercent) hambrePercent.textContent = mascota.hambre + "%";
    if (energiaPercent) energiaPercent.textContent = mascota.energia + "%";
    if (felicidadPercent) felicidadPercent.textContent = mascota.felicidad + "%";
    if (monedasSpan) monedasSpan.textContent = monedasGlobales;
    if (alienNameDisplay) alienNameDisplay.textContent = mascota.nombre;
    actualizarImagen();
}

function validarLimites() {
    if (mascota.hambre > MAXIMO) mascota.hambre = MAXIMO;
    if (mascota.hambre < MINIMO) mascota.hambre = MINIMO;
    if (mascota.energia > MAXIMO) mascota.energia = MAXIMO;
    if (mascota.energia < MINIMO) mascota.energia = MINIMO;
    if (mascota.felicidad > MAXIMO) mascota.felicidad = MAXIMO;
    if (mascota.felicidad < MINIMO) mascota.felicidad = MINIMO;
    actualizarUI();
    if (mascota.hambre <= 0 || mascota.energia <= 0 || mascota.felicidad <= 0) gameOver();
}

function gameOver() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = null;
    let msg = "Game Over";
    if (mascota.hambre <= 0) msg = "Murió de hambre 💀";
    else if (mascota.energia <= 0) msg = "Murió de agotamiento 💀";
    else if (mascota.felicidad <= 0) msg = "Murió de tristeza 💀";
    if (gameOverMessage) gameOverMessage.textContent = msg;
    if (gameScreen) gameScreen.classList.remove('active');
    if (gameOverScreen) gameOverScreen.classList.add('active');
    guardarTodo();
}

function reiniciarJuego() {
    mascota = { nombre: "", hambre: 70, energia: 70, felicidad: 70 };
    monedasGlobales = 0;
    for (let id in personajes) {
        personajes[id].desbloqueado = (id === 'byron');
        personajes[id].nivel = 1;
        personajes[id].monedasInvertidas = 0;
    }
    personajeActual = 'byron';
    estaDurmiendo = false;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = null;
    if (gameOverScreen) gameOverScreen.classList.remove('active');
    if (adoptionScreen) adoptionScreen.classList.add('active');
    if (gameScreen) gameScreen.classList.remove('active');
    guardarTodo();
    actualizarUI();
}

// --- NUEVO SUEÑO MÁGICO SORPRESA (2.45 segundos) ---
function dormir() {
    if (estaDurmiendo) return;
    estaDurmiendo = true;
    actualizarImagen();
    
    mostrarMensaje("💤 Durmiendo... soñará algo mágico 💤", 2450);
    
    setTimeout(() => {
        const efecto = Math.floor(Math.random() * 5);
        let mensajeEfecto = "";
        let energiaExtra = 0;
        let felicidadExtra = 0;
        let monedasExtra = 0;
        let hambreExtra = 0;
        
        switch(efecto) {
            case 0:
                energiaExtra = 25;
                monedasExtra = 2;
                mensajeEfecto = "✨ ¡Sueño reparador! +25 energía y +2🪙 ✨";
                break;
            case 1:
                energiaExtra = 10;
                felicidadExtra = -2;
                mensajeEfecto = "💀 ¡Pesadilla! +10 energía pero -2 felicidad 💀";
                break;
            case 2:
                hambreExtra = 5;
                monedasExtra = 1;
                mensajeEfecto = "🍕 ¡Soñó con comida! +5 hambre y +1🪙 🍕";
                break;
            case 3:
                energiaExtra = 15;
                monedasExtra = 3;
                mensajeEfecto = "⚡ ¡Hiper sueño! +15 energía y +3🪙 ⚡";
                break;
            case 4:
                energiaExtra = 20;
                mensajeEfecto = "🧸 Sueño tranquilo... +20 energía 🧸";
                break;
        }
        
        mascota.energia = Math.min(MAXIMO, mascota.energia + energiaExtra);
        if (felicidadExtra !== 0) mascota.felicidad = Math.min(MAXIMO, Math.max(MINIMO, mascota.felicidad + felicidadExtra));
        if (hambreExtra !== 0) mascota.hambre = Math.min(MAXIMO, mascota.hambre + hambreExtra);
        monedasGlobales += monedasExtra;
        
        validarLimites();
        guardarTodo();
        actualizarUI();
        
        mostrarMensaje(mensajeEfecto, 3000);
        estaDurmiendo = false;
        actualizarImagen();
    }, 2450);
}

// --- MINIJUEGO PENALTIS (con +12 felicidad al gol y -3 al fallo) ---
function abrirPenal() {
    if (!penalModal) return;
    if (porteroDiv) porteroDiv.className = 'portero';
    if (resultadoPenalDiv) resultadoPenalDiv.textContent = '';
    penalModal.style.display = 'flex';
}
function cerrarPenal() {
    if (penalModal) penalModal.style.display = 'none';
    penalEnCurso = false;
}
function jugarPenal(direccionUsuario) {
    if (penalEnCurso) return;
    penalEnCurso = true;
    const direcciones = ['izquierda', 'centro', 'derecha'];
    const direccionPortero = direcciones[Math.floor(Math.random() * 3)];
    if (porteroDiv) porteroDiv.className = `portero ${direccionPortero}`;
    
    let gananciaMonedas = 0, deltaFel = 0, deltaEne = 0;
    let resultadoTexto = "";
    
    if (direccionUsuario === direccionPortero) {
        resultadoTexto = "❌ ¡El portero la atrapó! ❌";
        gananciaMonedas = 0;
        deltaFel = -3;
        deltaEne = -2;
        mostrarMensaje("Penal fallado... -3 felicidad");
    } else {
        gananciaMonedas = 12;
        deltaFel = 12;
        deltaEne = -2;
        resultadoTexto = "⚽ ¡GOOOOOOOL! ⚽";
        mostrarMensaje(`⚽ ¡GOLAZO! +${gananciaMonedas} monedas, +${deltaFel} felicidad ⚽`);
    }
    
    monedasGlobales += gananciaMonedas;
    mascota.felicidad = Math.min(MAXIMO, Math.max(MINIMO, mascota.felicidad + deltaFel));
    mascota.energia = Math.min(MAXIMO, Math.max(MINIMO, mascota.energia + deltaEne));
    validarLimites();
    guardarTodo();
    actualizarUI();
    
    if (resultadoPenalDiv) {
        resultadoPenalDiv.innerHTML = `${resultadoTexto}<br>+${gananciaMonedas}🪙  😊 ${deltaFel>0?`+${deltaFel}`:deltaFel}  ⚡ ${deltaEne}`;
    }
    setTimeout(() => cerrarPenal(), 2000);
}
function jugar() {
    if (estaDurmiendo) { mostrarMensaje("😴 Está durmiendo, despiértalo primero"); return; }
    if (penalEnCurso) return;
    if (!gameScreen.classList.contains('active')) return;
    abrirPenal();
}

// --- MINIJUEGO COMIDA CAYENDO (velocidad +=3) ---
let comidaIntervalId = null, comidaGenerarIntervalId = null, comidaAnimationId = null;
let comidaItems = [], jugadorX = 300, comidasAtrapadas = 0, tiempoRestante = 15, juegoComidaActivo = false;
const jugadorAncho = 50, jugadorAlto = 50;

function iniciarJuegoComida() {
    if (!canvas || !ctx) { mostrarMensaje("Error: no se pudo cargar el canvas"); return; }
    if (comidaAnimationId) cancelAnimationFrame(comidaAnimationId);
    if (comidaIntervalId) clearInterval(comidaIntervalId);
    if (comidaGenerarIntervalId) clearInterval(comidaGenerarIntervalId);
    comidaItems = [];
    comidasAtrapadas = 0;
    tiempoRestante = 15;
    jugadorX = canvas.width/2 - jugadorAncho/2;
    juegoComidaActivo = true;
    document.getElementById('comidaMonedasGanadas').innerText = "0";
    document.getElementById('comidaHambreGanada').innerText = "0";
    document.getElementById('comidaTiempo').innerText = "15";
    comidaModal.style.display = 'flex';
    comidaIntervalId = setInterval(() => {
        if (!juegoComidaActivo) return;
        tiempoRestante--;
        document.getElementById('comidaTiempo').innerText = tiempoRestante;
        if (tiempoRestante <= 0) terminarJuegoComida();
    }, 1000);
    comidaGenerarIntervalId = setInterval(() => {
        if (!juegoComidaActivo) return;
        const x = Math.random() * (canvas.width - 35);
        comidaItems.push({ x: x, y: 0, ancho: 35, alto: 35 });
    }, 800);
    function animar() {
        if (!juegoComidaActivo) return;
        actualizarCanvas();
        comidaAnimationId = requestAnimationFrame(animar);
    }
    animar();
}
function actualizarCanvas() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (alienImgCargada) {
        ctx.drawImage(alienImgCanvas, jugadorX, canvas.height - jugadorAlto - 10, jugadorAncho, jugadorAlto);
    } else {
        ctx.fillStyle = '#00ff9d';
        ctx.fillRect(jugadorX, canvas.height - jugadorAlto - 10, jugadorAncho, jugadorAlto);
        ctx.fillStyle = '#ff00ff';
        ctx.font = "28px monospace";
        ctx.fillText("👾", jugadorX + 12, canvas.height - 20);
    }
    for (let i = 0; i < comidaItems.length; i++) {
        const item = comidaItems[i];
        item.y += 3;  // velocidad reducida a 3
        if (comidaImgCargada) {
            ctx.drawImage(comidaImg, item.x, item.y, item.ancho, item.alto);
        } else {
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(item.x, item.y, item.ancho, item.alto);
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(item.x+8, item.y+8, 20, 20);
        }
        if (item.y + item.alto >= canvas.height - jugadorAlto - 10 &&
            item.x + item.ancho > jugadorX &&
            item.x < jugadorX + jugadorAncho) {
            comidasAtrapadas++;
            document.getElementById('comidaMonedasGanadas').innerText = comidasAtrapadas;
            document.getElementById('comidaHambreGanada').innerText = comidasAtrapadas * 5;
            mascota.hambre = Math.min(MAXIMO, mascota.hambre + 5);
            monedasGlobales++;
            actualizarUI();
            guardarTodo();
            comidaItems.splice(i,1);
            i--;
        } else if (item.y > canvas.height) {
            comidaItems.splice(i,1);
            i--;
        }
    }
}
function terminarJuegoComida() {
    juegoComidaActivo = false;
    if (comidaIntervalId) clearInterval(comidaIntervalId);
    if (comidaGenerarIntervalId) clearInterval(comidaGenerarIntervalId);
    if (comidaAnimationId) cancelAnimationFrame(comidaAnimationId);
    mostrarMensaje(`¡Has atrapado ${comidasAtrapadas} comidas! +${comidasAtrapadas*5} hambre y +${comidasAtrapadas} monedas.`);
    validarLimites();
    guardarTodo();
    cerrarComida();
}
function cerrarComida() {
    if (comidaModal) comidaModal.style.display = 'none';
    juegoComidaActivo = false;
    if (comidaIntervalId) clearInterval(comidaIntervalId);
    if (comidaGenerarIntervalId) clearInterval(comidaGenerarIntervalId);
    if (comidaAnimationId) cancelAnimationFrame(comidaAnimationId);
}
function alimentar() {
    if (estaDurmiendo) { mostrarMensaje("😴 Está durmiendo, despiértalo primero"); return; }
    if (!gameScreen.classList.contains('active')) { mostrarMensaje("Tu alien debe estar vivo para comer"); return; }
    iniciarJuegoComida();
}

// --- GAME LOOP ---
function iniciarGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        if (estaDurmiendo) return;
        mascota.hambre = Math.max(MINIMO, mascota.hambre - DECREMENTO_HAMBRE);
        mascota.energia = Math.max(MINIMO, mascota.energia - DECREMENTO_ENERGIA);
        mascota.felicidad = Math.max(MINIMO, mascota.felicidad - DECREMENTO_FELICIDAD);
        validarLimites();
        guardarTodo();
        if (Math.random() < 0.15) {
            let ganadas = 0;
            if (mascota.felicidad > 70) ganadas += 2;
            if (mascota.hambre < 30) ganadas += 2;
            if (mascota.energia > 70) ganadas += 2;
            if (ganadas > 0) {
                monedasGlobales += ganadas;
                actualizarUI();
                guardarTodo();
                mostrarMensaje(`+${ganadas}🪙 por buen estado`);
            }
        }
    }, 5000);
}

// --- EVOLUCIÓN ---
function reproducirSonidoEvolucion(personajeId) {
    const audio = new Audio(`assets/audio/${personajeId}_evolution.mp3`);
    audio.volume = 0.6;
    audio.play().catch(e => console.log("Audio no disponible:", e));
}
function intentarEvolucionar() {
    const person = personajes[personajeActual];
    if (person.nivel === 2) { mostrarMensaje(`${person.nombre} ya es adulto`); return; }
    if (monedasGlobales >= COSTE_EVOLUCION) {
        monedasGlobales -= COSTE_EVOLUCION;
        person.nivel = 2;
        person.monedasInvertidas += COSTE_EVOLUCION;
        reproducirSonidoEvolucion(personajeActual);
        actualizarUI();
        guardarTodo();
        mostrarMensaje(`✨ ¡${person.nombre} evolucionó a adulto! ✨`);
    } else {
        mostrarMensaje(`Necesitas ${COSTE_EVOLUCION} monedas para evolucionar`);
    }
}

// --- SELECTOR DE PERSONAJES ---
function abrirSelector() {
    if (!selectorModal) return;
    const grid = document.getElementById('personajesLista');
    if (!grid) return;
    grid.innerHTML = '';
    for (let id in personajes) {
        const p = personajes[id];
        const nivelTexto = p.nivel === 1 ? 'baby' : 'adult';
        const imgSrc = `assets/images/${id}/${nivelTexto}_happy.png`;
        const div = document.createElement('div');
        div.className = 'personaje-card';
        div.innerHTML = `
            <img src="${imgSrc}" alt="${p.nombre}" style="width:80px; height:80px;" onerror="this.src='https://placehold.co/80x80?text=👾'">
            <h4>${p.nombre}</h4>
            <p>${p.nivel === 1 ? 'Bebé' : 'Adulto'}</p>
            ${!p.desbloqueado ? `<button class="comprar-btn" data-id="${id}">COMPRAR (${p.precio}🪙)</button>` : ''}
            ${p.desbloqueado ? `<button class="usar-btn" data-id="${id}">USAR</button>` : ''}
            ${p.desbloqueado && p.nivel === 1 ? `<button class="evolucionar-btn" data-id="${id}">EVOLUCIONAR (${COSTE_EVOLUCION}🪙)</button>` : ''}
        `;
        grid.appendChild(div);
    }
    document.querySelectorAll('.comprar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const p = personajes[id];
            if (monedasGlobales >= p.precio) {
                monedasGlobales -= p.precio;
                p.desbloqueado = true;
                actualizarUI();
                guardarTodo();
                mostrarMensaje(`¡${p.nombre} desbloqueado!`);
                abrirSelector();
            } else mostrarMensaje(`No tienes suficientes monedas (${p.precio}🪙)`);
            e.stopPropagation();
        });
    });
    document.querySelectorAll('.usar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            personajeActual = btn.dataset.id;
            actualizarUI();
            cerrarSelector();
            mostrarMensaje(`Ahora usas a ${personajes[personajeActual].nombre}`);
            e.stopPropagation();
        });
    });
    document.querySelectorAll('.evolucionar-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            if (id !== personajeActual) {
                mostrarMensaje(`Debes tener activo a ${personajes[id].nombre} para evolucionarlo`);
                return;
            }
            intentarEvolucionar();
            cerrarSelector();
            e.stopPropagation();
        });
    });
    selectorModal.style.display = 'flex';
}
function cerrarSelector() {
    if (selectorModal) selectorModal.style.display = 'none';
}

function iniciarJuego(nombre) {
    mascota.nombre = nombre;
    mascota.hambre = 70;
    mascota.energia = 70;
    mascota.felicidad = 70;
    actualizarUI();
    iniciarGameLoop();
    guardarTodo();
}

// --- EVENTOS Y ARRANQUE ---
document.addEventListener('DOMContentLoaded', () => {
    cargarTodo();

    const adoptionForm = document.getElementById('adoptionForm');
    const alienNameInput = document.getElementById('alienName');
    const restartBtn = document.getElementById('restartBtn');
    const alimentarBtn = document.getElementById('alimentarBtn');
    const jugarBtn = document.getElementById('jugarBtn');
    const dormirBtn = document.getElementById('dormirBtn');
    const abrirSelectorBtn = document.getElementById('abrirSelectorBtn');
    const cerrarSelectorBtn = document.getElementById('cerrarSelectorBtn');
    const cerrarPenalBtn = document.getElementById('cerrarPenalBtn');
    const cerrarComidaBtn = document.getElementById('cerrarComidaBtn');

    if (mascota && mascota.nombre && mascota.nombre !== "") {
        if (adoptionScreen) adoptionScreen.classList.remove('active');
        if (gameScreen) gameScreen.classList.add('active');
        iniciarGameLoop();
        actualizarUI();
    } else {
        if (adoptionScreen) adoptionScreen.classList.add('active');
        if (gameScreen) gameScreen.classList.remove('active');
    }

    if (adoptionForm) {
        adoptionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = alienNameInput ? alienNameInput.value.trim() : "";
            if (!nombre) return alert("Escribe un nombre");
            iniciarJuego(nombre);
            if (adoptionScreen) adoptionScreen.classList.remove('active');
            if (gameScreen) gameScreen.classList.add('active');
        });
    }

    if (restartBtn) restartBtn.addEventListener('click', reiniciarJuego);
    if (alimentarBtn) alimentarBtn.addEventListener('click', alimentar);
    if (jugarBtn) jugarBtn.addEventListener('click', jugar);
    if (dormirBtn) dormirBtn.addEventListener('click', dormir);
    if (abrirSelectorBtn) abrirSelectorBtn.addEventListener('click', abrirSelector);
    if (cerrarSelectorBtn) cerrarSelectorBtn.addEventListener('click', cerrarSelector);
    if (cerrarPenalBtn) cerrarPenalBtn.addEventListener('click', cerrarPenal);
    if (cerrarComidaBtn) cerrarComidaBtn.addEventListener('click', cerrarComida);

    document.querySelectorAll('.penal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const direccion = btn.getAttribute('data-direccion');
            if (direccion) jugarPenal(direccion);
        });
    });

    window.addEventListener('keydown', (e) => {
        if (!juegoComidaActivo) return;
        if (e.key === 'ArrowLeft') {
            jugadorX = Math.max(0, jugadorX - 25);
            e.preventDefault();
        } else if (e.key === 'ArrowRight') {
            jugadorX = Math.min(canvas.width - jugadorAncho, jugadorX + 25);
            e.preventDefault();
        }
    });
});