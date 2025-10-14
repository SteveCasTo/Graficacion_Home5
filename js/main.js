let grassSim;
let enhancedFeatures;

// Configuración inicial de p5.js
function setup() {
    // Crear canvas con las dimensiones configuradas
    createCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    
    // Inicializar la simulación
    grassSim = new GrassSimulation();
    grassSim.init();
    
    // Inicializar características mejoradas
    enhancedFeatures = new EnhancedFeatures(grassSim);
    
    console.log('🌱 Simulación de pasto inicializada');
    console.log('💡 Controles disponibles:');
    console.log('  - R: Regenerar briznas');
    console.log('  - F: Pantalla completa');
    console.log('  - H: Toggle interfaz');
    console.log('  - P: Exportar imagen');
    console.log('  - +/-: Cambiar cantidad');
    console.log('  - Espacio: Pausar/reanudar');
    console.log('  - Click: Crear ráfaga de viento');
    console.log('  - ?: Mostrar ayuda');
}

// Bucle principal de p5.js
function draw() {
    grassSim.update();
    grassSim.draw();
}

// Función llamada al redimensionar la ventana
function windowResized() {
    if (grassSim) {
        grassSim.onWindowResize();
    }
    
    // Redimensionar canvas manteniendo proporciones
    const newWidth = min(windowWidth - 40, CONFIG.CANVAS.WIDTH);
    const newHeight = min(windowHeight - 40, CONFIG.CANVAS.HEIGHT);
    resizeCanvas(newWidth, newHeight);
}

// Función llamada cuando se presiona una tecla
function keyPressed() {
    if (grassSim) {
        grassSim.onKeyPressed(key);
    }
}

// Función llamada cuando se presiona el mouse
function mousePressed() {
}

// Función llamada cuando se arrastra el mouse
function mouseDragged() {
    if (enhancedFeatures && frameCount % 5 === 0) { // Solo cada 5 frames para no sobrecargar
        enhancedFeatures.createWindGust(mouseX, mouseY);
    }
}

window.addEventListener('beforeunload', () => {
    if (grassSim) {
        grassSim.destroy();
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pausar cuando la página no es visible para ahorrar recursos
        if (typeof noLoop === 'function') {
            noLoop();
        }
    } else {
        // Reanudar cuando la página vuelve a ser visible
        if (typeof loop === 'function') {
            loop();
        }
    }
});

document.addEventListener('fullscreenchange', () => {
    if (enhancedFeatures) {
        enhancedFeatures.isFullscreen = !!document.fullscreenElement;
    }
    
    // Ajustar canvas al tamaño de pantalla completa
    if (document.fullscreenElement) {
        resizeCanvas(screen.width, screen.height);
    } else {
        resizeCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }
});

window.addEventListener('error', (e) => {
    console.error('Error en la simulación:', e.error);
    
    // Mostrar mensaje de error amigable al usuario
    if (enhancedFeatures && enhancedFeatures.showNotification) {
        enhancedFeatures.showNotification('⚠️ Error detectado - Revisa la consola');
    }
});


function getSimulationStats() {
    if (grassSim) {
        return grassSim.getStats();
    }
    return null;
}

function updateSimulationSettings(settings) {
    if (grassSim && grassSim.ui) {
        grassSim.ui.applySettings(settings);
    }
}