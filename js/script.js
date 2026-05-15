// ============================================
// ALIENGOTCHI - VERSIÓN CORREGIDA (SIN ERRORES)
// Personajes, monedas, evolución, estados
// ============================================

// --- CONSTANTES DEL JUEGO ---
const MINIMO = 0;
const MAXIMO = 100;
const HAMBRE_ALIMENTAR = 15;
const FELICIDAD_JUGAR = 10;
const ENERGIA_JUGAR = 5;
const ENERGIA_DORMIR = 20;
const DECREMENTO_HAMBRE = 2;
const DECREMENTO_ENERGIA = 2;
const DECREMENTO_FELICIDAD = 2;
const COSTE_EVOLUCION = 100;

// --- ESTADOS EMOCIONALES ---
const ESTADOS = {
    FELIZ: 'happy',
    CON_SUENO: 'sleepy',
    DURMIENDO: 'sleeping',
    HAMBRE: 'hungry',
    ABURRIDO: 'bored'
};

// --- PERSONAJES (5 de Inazuma Eleven) ---
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

// --- MASCOTA ---
let mascota = {
    nombre: "",
    hambre: 70,
    energia: 70,
    felicidad: 70
};

// --- ELEMENTOS DOM (con comprobación de existencia) ---
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

// --- FUNCIONES AUXILIARES ---
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

// Guardar y cargar
function guardarTodo() {
    const data = {
        mascota,
        monedasGlobales,
        personajes,
        personajeActual,
        estaDurmiendo: false
    };
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
        } catch(e) { console.error("Error al cargar", e); }
    }
}

// --- ESTADO EMOCIONAL ---
function obtenerEstadoActual() {
    if (estaDurmiendo) return ESTADOS.DURMIENDO;
    if (mascota.energia <= 20) return ESTADOS.CON_SUENO;
    if (mascota.hambre <= 20) return ESTADOS.HAMBRE;
    if (mascota.felicidad <= 20) return ESTADOS.ABURRIDO;
    return ESTADOS.FELIZ;
}

// --- Actualizar imagen (si no hay imagen, muestra emoji) ---
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
        // Si no existe la imagen, mostrar emoji según personaje
        const emojis = { byron:'⚡', mark:'🔥', jude:'🧠', shawn:'❄️', axel:'🌪️' };
        alienImage.innerHTML = `<div style="font-size: 4rem;">${emojis[personajeActual] || '👾'}</div>`;
    };
    img.src = ruta;
}

// --- Actualizar UI (barras, monedas, nombre) ---
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

// --- Validar límites y Game Over ---
function validarLimites() {
    if (mascota.hambre > MAXIMO) mascota.hambre = MAXIMO;
    if (mascota.hambre < MINIMO) mascota.hambre = MINIMO;
    if (mascota.energia > MAXIMO) mascota.energia = MAXIMO;
    if (mascota.energia < MINIMO) mascota.energia = MINIMO;
    if (mascota.felicidad > MAXIMO) mascota.felicidad = MAXIMO;
    if (mascota.felicidad < MINIMO) mascota.felicidad = MINIMO;
    actualizarUI();

    if (mascota.hambre <= 0 || mascota.energia <= 0 || mascota.felicidad <= 0) {
        gameOver();
    }
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

// --- ACCIONES ---
function alimentar() {
    mascota.hambre = Math.min(MAXIMO, mascota.hambre + HAMBRE_ALIMENTAR);
    validarLimites();
    guardarTodo();
}
function jugar() {
    if (estaDurmiendo) {
        mostrarMensaje("Está durmiendo, despiértalo primero");
        return;
    }
    mascota.felicidad = Math.min(MAXIMO, mascota.felicidad + FELICIDAD_JUGAR);
    mascota.energia = Math.max(MINIMO, mascota.energia - ENERGIA_JUGAR);
    validarLimites();
    guardarTodo();
}
function dormir() {
    if (estaDurmiendo) return;
    estaDurmiendo = true;
    actualizarImagen();
    mostrarMensaje("Durmiendo... +20 energía en 4 seg");
    setTimeout(() => {
        mascota.energia = Math.min(MAXIMO, mascota.energia + ENERGIA_DORMIR);
        estaDurmiendo = false;
        validarLimites();
        guardarTodo();
        mostrarMensaje("¡Despertó! +20 energía");
    }, 4000);
    guardarTodo();
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

        // Ganar monedas aleatorias
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
function intentarEvolucionar() {
    const person = personajes[personajeActual];
    if (person.nivel === 2) {
        mostrarMensaje(`${person.nombre} ya es adulto`);
        return;
    }
    if (monedasGlobales >= COSTE_EVOLUCION) {
        monedasGlobales -= COSTE_EVOLUCION;
        person.nivel = 2;
        actualizarUI();
        guardarTodo();
        mostrarMensaje(`✨ ¡${person.nombre} evolucionó a adulto! ✨`);
    } else {
        mostrarMensaje(`Necesitas ${COSTE_EVOLUCION} monedas`);
    }
}

// --- SELECTOR DE PERSONAJES (modal) ---
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
    // Eventos dinámicos
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
                abrirSelector(); // refrescar
            } else {
                mostrarMensaje(`No tienes suficientes monedas (${p.precio}🪙)`);
            }
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

// --- INICIAR JUEGO (desde adopción) ---
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

    // Decidir pantalla inicial
    if (mascota && mascota.nombre && mascota.nombre !== "") {
        if (adoptionScreen) adoptionScreen.classList.remove('active');
        if (gameScreen) gameScreen.classList.add('active');
        iniciarGameLoop();
        actualizarUI();
    } else {
        if (adoptionScreen) adoptionScreen.classList.add('active');
        if (gameScreen) gameScreen.classList.remove('active');
    }

    // Evento de adopción
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
});