// ============================================
// ALIENGOTCHI - SPRINT 3 COMPLETO
// Game Loop + LocalStorage + Game Over
// Logica de hambre: alimentar SUBE, tiempo BAJA
// ============================================

// --- OBJETO MASCOTA ---
let mascota = {
    nombre: "",
    hambre: 70,
    energia: 70,
    felicidad: 70
};

// --- CONSTANTES ---
const MINIMO = 0;
const MAXIMO = 100;
const HAMBRE_ALIMENTAR = 15;      // Alimentar SUBE el hambre (+)
const FELICIDAD_JUGAR = 10;
const ENERGIA_JUGAR = 5;
const ENERGIA_DORMIR = 20;

// Game Loop: cambios automáticos cada 5 segundos
const DECREMENTO_HAMBRE = 2;      // Hambre BAJA con el tiempo (-)
const DECREMENTO_ENERGIA = 2;
const DECREMENTO_FELICIDAD = 2;

// --- VARIABLES GLOBALES ---
let gameInterval = null;

// --- ELEMENTOS DOM ---
const hambreBar = document.getElementById('hambreBar');
const energiaBar = document.getElementById('energiaBar');
const felicidadBar = document.getElementById('felicidadBar');
const hambrePercent = document.getElementById('hambrePercent');
const energiaPercent = document.getElementById('energiaPercent');
const felicidadPercent = document.getElementById('felicidadPercent');
const alienNameDisplay = document.getElementById('alienNameDisplay');

// --- PANTALLAS ---
const adoptionScreen = document.getElementById('adoptionScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const gameOverMessage = document.getElementById('gameOverMessage');

// --- ACTUALIZAR UI ---
function actualizarUI() {
    hambreBar.value = mascota.hambre;
    energiaBar.value = mascota.energia;
    felicidadBar.value = mascota.felicidad;
    
    hambrePercent.textContent = mascota.hambre + "%";
    energiaPercent.textContent = mascota.energia + "%";
    felicidadPercent.textContent = mascota.felicidad + "%";
}

// --- VALIDAR LÍMITES Y GAME OVER ---
function validarLimites() {
    if (mascota.hambre > MAXIMO) mascota.hambre = MAXIMO;
    if (mascota.hambre < MINIMO) mascota.hambre = MINIMO;
    if (mascota.energia > MAXIMO) mascota.energia = MAXIMO;
    if (mascota.energia < MINIMO) mascota.energia = MINIMO;
    if (mascota.felicidad > MAXIMO) mascota.felicidad = MAXIMO;
    if (mascota.felicidad < MINIMO) mascota.felicidad = MINIMO;
    
    actualizarUI();
    
    // Comprobar Game Over
    // Hambre: muere cuando llega a 0
    // Energía: muere cuando llega a 0
    // Felicidad: muere cuando llega a 0
    if (mascota.hambre <= 0 || mascota.energia <= 0 || mascota.felicidad <= 0) {
        gameOver();
    }
}

// --- GAME OVER ---
function gameOver() {
    // Detener el game loop
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    
    // Mostrar mensaje según la causa
    if (mascota.hambre <= 0) {
        gameOverMessage.textContent = "Tu Aliengotchi murió de hambre... 💀";
    } else if (mascota.energia <= 0) {
        gameOverMessage.textContent = "Tu Aliengotchi murió de agotamiento... 💀";
    } else if (mascota.felicidad <= 0) {
        gameOverMessage.textContent = "Tu Aliengotchi murió de tristeza... 💀";
    }
    
    // Cambiar pantalla
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');
}

// --- REINICIAR JUEGO ---
function reiniciarJuego() {
    // Reiniciar valores
    mascota = {
        nombre: "",
        hambre: 70,
        energia: 70,
        felicidad: 70
    };
    
    // Volver a pantalla de adopción
    gameOverScreen.classList.remove('active');
    adoptionScreen.classList.add('active');
}

// --- ACCIONES DE BOTONES ---
function alimentar() {
    mascota.hambre = mascota.hambre + HAMBRE_ALIMENTAR;  // SUBE el hambre
    validarLimites();
    guardarLocalStorage();
}

function jugar() {
    mascota.felicidad = mascota.felicidad + FELICIDAD_JUGAR;
    mascota.energia = mascota.energia - ENERGIA_JUGAR;
    validarLimites();
    guardarLocalStorage();
}

function dormir() {
    mascota.energia = mascota.energia + ENERGIA_DORMIR;
    validarLimites();
    guardarLocalStorage();
}

// --- GAME LOOP (vida autónoma) ---
function iniciarGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    gameInterval = setInterval(() => {
        // El alien vive solo: el hambre BAJA con el tiempo
        mascota.hambre = mascota.hambre - DECREMENTO_HAMBRE;
        mascota.energia = mascota.energia - DECREMENTO_ENERGIA;
        mascota.felicidad = mascota.felicidad - DECREMENTO_FELICIDAD;
        
        validarLimites();
        guardarLocalStorage();
    }, 5000); // Cada 5 segundos
}

// --- LOCALSTORAGE ---
function guardarLocalStorage() {
    const estado = {
        mascota: mascota,
        fechaGuardado: new Date().toISOString()
    };
    localStorage.setItem('aliengotchi', JSON.stringify(estado));
}

function cargarLocalStorage() {
    const guardado = localStorage.getItem('aliengotchi');
    if (guardado) {
        const estado = JSON.parse(guardado);
        mascota = estado.mascota;
        actualizarUI();
        return true;
    }
    return false;
}

// --- INICIAR JUEGO ---
function iniciarJuego(nombre) {
    mascota.nombre = nombre;
    mascota.hambre = 70;
    mascota.energia = 70;
    mascota.felicidad = 70;
    
    alienNameDisplay.textContent = mascota.nombre;
    actualizarUI();
    
    iniciarGameLoop();
    guardarLocalStorage();
}

// --- CONFIGURAR BOTONES ---
function configurarBotones() {
    const alimentarBtn = document.getElementById('alimentarBtn');
    const jugarBtn = document.getElementById('jugarBtn');
    const dormirBtn = document.getElementById('dormirBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    alimentarBtn.addEventListener('click', () => alimentar());
    jugarBtn.addEventListener('click', () => jugar());
    dormirBtn.addEventListener('click', () => dormir());
    
    if (restartBtn) {
        restartBtn.addEventListener('click', () => reiniciarJuego());
    }
}

// --- INICIALIZAR ---
document.addEventListener('DOMContentLoaded', () => {
    const adoptionForm = document.getElementById('adoptionForm');
    const alienNameInput = document.getElementById('alienName');
    
    // Intentar cargar partida guardada
    if (cargarLocalStorage() && mascota.nombre !== "") {
        alienNameDisplay.textContent = mascota.nombre;
        adoptionScreen.classList.remove('active');
        gameScreen.classList.add('active');
        iniciarGameLoop();
    } else {
        adoptionScreen.classList.add('active');
        gameScreen.classList.remove('active');
    }
    
    adoptionForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const nombre = alienNameInput.value.trim();
        if (nombre === "") {
            alert("¡Ponle un nombre a tu Aliengotchi!");
            return;
        }
        
        iniciarJuego(nombre);
        adoptionScreen.classList.remove('active');
        gameScreen.classList.add('active');
    });
    
    configurarBotones();
});