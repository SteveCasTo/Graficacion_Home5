let grassSim;
let enhancedFeatures;
let loading = true;
let loadingStart = 0;
let loadingMinTime = 1200; // ms

// Configuración inicial de p5.js
function setup() {
    // Crear canvas con las dimensiones configuradas
    createCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    loading = true;
    loadingStart = millis();
    // Inicialización diferida en draw()
}

// Bucle principal de p5.js
function draw() {
    if (loading) {
        drawLoadingScreen();
        // Esperar mínimo loadingMinTime ms antes de iniciar
        if (millis() - loadingStart > loadingMinTime) {
            if (!grassSim) {
                grassSim = new GrassSimulation();
                grassSim.init();
                enhancedFeatures = new EnhancedFeatures(grassSim);
                setTimeout(() => { loading = false; }, 350); // transición breve
            }
        }
        return;
    }
    grassSim.update();
    grassSim.draw();
    // Dibujar partículas verdes desprendidas
    if (typeof drawDetachedParticles === 'function') drawDetachedParticles();
// Pantalla de carga animada con pasto/curva Bézier
function drawLoadingScreen() {
    background(30, 45, 40);
    // Animar varias briznas de pasto con curvas Bézier
    let t = millis() * 0.002;
    let centerX = width / 2;
    let baseY = height * 0.82;
    let numBlades = 13;
    for (let i = 0; i < numBlades; i++) {
        let x = centerX - 120 + i * 20 + sin(t + i) * 8;
        let bladeH = 80 + 30 * sin(t * 1.2 + i * 0.7);
        let tipX = x + 12 * sin(t * 1.5 + i * 0.9);
        let tipY = baseY - bladeH;
        let c1x = x + 8 * sin(t + i * 0.5);
        let c1y = baseY - bladeH * 0.4;
        let c2x = x + 16 * sin(t * 1.1 + i * 0.8);
        let c2y = baseY - bladeH * 0.7;
        stroke(110 + i * 2, 200, 110 + i * 3);
        strokeWeight(3.2 - abs(i - numBlades/2) * 0.13);
        noFill();
        bezier(x, baseY, c1x, c1y, c2x, c2y, tipX, tipY);
    }
    // Texto de carga
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Cargando Pastito...', width/2, height*0.36);
    textSize(16);
    fill(180);
    text('Simulación interactiva de pasto', width/2, height*0.36 + 36);
}
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
    // El manejo del mouse se hace en enhanced-features.js
}

// Función llamada cuando se arrastra el mouse
function mouseDragged() {
    // El manejo del arrastre se hace en enhanced-features.js
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