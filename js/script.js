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