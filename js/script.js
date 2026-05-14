// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos del DOM
    const adoptionScreen = document.getElementById('adoptionScreen');
    const gameScreen = document.getElementById('gameScreen');
    const adoptionForm = document.getElementById('adoptionForm');
    const alienNameInput = document.getElementById('alienName');
    const alienNameDisplay = document.getElementById('alienNameDisplay');
    
    // Función para empezar el juego
    function startGame(alienName) {
        // Mostrar el nombre en la pantalla de juego
        alienNameDisplay.textContent = alienName;
        
        // Cambiar de pantalla
        adoptionScreen.classList.remove('active');
        gameScreen.classList.add('active');
    }
    
    // Evento del formulario de adopción
    adoptionForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar que recargue la página
        
        const alienName = alienNameInput.value.trim();
        
        if (alienName === '') {
            alert('¡Ponle un nombre a tu Aliengotchi!');
            return;
        }
        
        startGame(alienName);
    });
    
});

// ============================================
// ALIENGOTCHI - SPRINT 2
// Lógica de Estado y DOM
// ============================================

// --- TARJETA #2.1: OBJETO MASCOTA ---
let mascota = {
    nombre: "",
    hambre: 70,
    energia: 70,
    felicidad: 70
};

// --- CONSTANTES (Sin magic numbers) ---
const MINIMO = 0;
const MAXIMO = 100;
const HAMBRE_ALIMENTAR = 15;    // Cuánto baja el hambre al alimentar

// --- ELEMENTOS DEL DOM ---
const hambreBar = document.getElementById('hambreBar');
const energiaBar = document.getElementById('energiaBar');
const felicidadBar = document.getElementById('felicidadBar');
const hambrePercent = document.getElementById('hambrePercent');
const energiaPercent = document.getElementById('energiaPercent');
const felicidadPercent = document.getElementById('felicidadPercent');
const alienNameDisplay = document.getElementById('alienNameDisplay');

// --- TARJETA #2.5: VALIDAR LÍMITES ---
function validarLimites() {
    if (mascota.hambre > MAXIMO) mascota.hambre = MAXIMO;
    if (mascota.hambre < MINIMO) mascota.hambre = MINIMO;
    if (mascota.energia > MAXIMO) mascota.energia = MAXIMO;
    if (mascota.energia < MINIMO) mascota.energia = MINIMO;
    if (mascota.felicidad > MAXIMO) mascota.felicidad = MAXIMO;
    if (mascota.felicidad < MINIMO) mascota.felicidad = MINIMO;
    
    actualizarUI();
}

// --- TARJETA #2.6: ACTUALIZAR UI ---
function actualizarUI() {
    // Actualizar barras de progreso
    hambreBar.value = mascota.hambre;
    energiaBar.value = mascota.energia;
    felicidadBar.value = mascota.felicidad;
    
    // Actualizar porcentajes
    hambrePercent.textContent = mascota.hambre + "%";
    energiaPercent.textContent = mascota.energia + "%";
    felicidadPercent.textContent = mascota.felicidad + "%";
}

// --- TARJETA #2.2: ALIMENTAR ---
function alimentar() {
    mascota.hambre = mascota.hambre - HAMBRE_ALIMENTAR;
    validarLimites();
}

// --- INICIALIZAR JUEGO (desde formulario) ---
function iniciarJuego(nombre) {
    mascota.nombre = nombre;
    mascota.hambre = 70;
    mascota.energia = 70;
    mascota.felicidad = 70;
    
    alienNameDisplay.textContent = mascota.nombre;
    actualizarUI();
}

// --- CONFIGURAR EVENTOS ---
function configurarBotones() {
    const alimentarBtn = document.getElementById('alimentarBtn');
    
    alimentarBtn.addEventListener('click', () => {
        alimentar();
    });
}

// --- INICIALIZAR CUANDO CARGA LA PÁGINA ---
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del formulario de adopción
    const adoptionScreen = document.getElementById('adoptionScreen');
    const gameScreen = document.getElementById('gameScreen');
    const adoptionForm = document.getElementById('adoptionForm');
    const alienNameInput = document.getElementById('alienName');
    
    // Evento del formulario
    adoptionForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const nombre = alienNameInput.value.trim();
        if (nombre === "") {
            alert("¡Ponle un nombre a tu Aliengotchi!");
            return;
        }
        
        iniciarJuego(nombre);
        
        // Cambiar pantallas
        adoptionScreen.classList.remove('active');
        gameScreen.classList.add('active');
    });
    
    // Configurar botones del juego
    configurarBotones();
});