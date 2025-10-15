class GrassSimulation {
    constructor() {
        this.vectorPool = new VectorPool();
        this.windSystem = new WindSystem();
        this.blades = [];
        this.ui = null;
        this.isNight = true;
        this.dayNightLerp = 1; // 1 = noche, 0 = día
        // Configuración por defecto
        this.settings = {
            numBlades: 60,
            resolution: 20, // Aumentado de 12 a 20 para curvas más suaves
            width: 6,
            wind: 15,
            showSkeleton: true,
            showFill: true
        };
        // Estadísticas de rendimiento
        this.frameHistory = [];
        this.lastStatsUpdate = 0;
    }

    toggleDayNight() {
        this.isNight = !this.isNight;
    }
    
    // Inicializa la simulación
    init() {
        this.generateBlades();
        this.ui = new UI(this);
        this.windSystem.setStrength(this.settings.wind);
    }

    // Genera todas las briznas de pasto
    generateBlades() {
        // Limpiar briznas anteriores
        this.blades.forEach(blade => blade.destroy());
        this.blades = [];
        
        // Crear nuevas briznas en posiciones aleatorias
        for (let i = 0; i < this.settings.numBlades; i++) {
            let x = random(50, CONFIG.CANVAS.WIDTH - 50);
            this.blades.push(new Blade(x, this.vectorPool));
        }
    }
    
    // Actualiza la cantidad de briznas
    setNumBlades(num) {
        this.settings.numBlades = clampValue(num, CONFIG.GRASS.MIN_BLADES, CONFIG.GRASS.MAX_BLADES);
        this.generateBlades();
    }
    
    // Actualiza la simulación
    update() {
    this.windSystem.update();
    this.updateStats();
    // Transición suave día/noche
    let target = this.isNight ? 1 : 0;
    this.dayNightLerp += (target - this.dayNightLerp) * 0.08;
    }
    
    // Actualiza estadísticas de rendimiento
    updateStats() {
        let now = millis();
        if (now - this.lastStatsUpdate > 1000) {
            // Calcular FPS promedio
            this.frameHistory.push(frameRate());
            if (this.frameHistory.length > 10) {
                this.frameHistory.shift();
            }
            
            let avgFps = this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
            
            // Actualizar elementos del DOM
            this.updateStatsDisplay(avgFps);
            
            this.lastStatsUpdate = now;
        }
    }
    
    // Actualiza los elementos del DOM con las estadísticas actuales
    updateStatsDisplay(avgFps) {
        const fpsElement = document.getElementById('fps');
        const bladeCountElement = document.getElementById('bladeCount');
        const windStrengthElement = document.getElementById('windStrength');
        
        if (fpsElement) fpsElement.textContent = avgFps.toFixed(1);
        if (bladeCountElement) bladeCountElement.textContent = this.blades.length;
        if (windStrengthElement) windStrengthElement.textContent = this.windSystem.baseWind.toFixed(1);
    }
    
    // Dibuja la simulación
    draw() {
        this.drawBackground();
        this.drawGrassLayers();
    }
    
    // Dibuja el fondo degradado
    drawBackground() {
        // Colores día/noche
        let nightTop = color(20, 30, 50);
        let nightBot = color(5, 10, 20);
        let dayTop = color(120, 200, 255);
        let dayBot = color(180, 240, 180);
        let topCol = lerpColor(dayTop, nightTop, this.dayNightLerp);
        let botCol = lerpColor(dayBot, nightBot, this.dayNightLerp);
        for (let y = 0; y <= CONFIG.CANVAS.HEIGHT; y++) {
            let alpha = map(y, 0, CONFIG.CANVAS.HEIGHT, 0, 1);
            let c = lerpColor(topCol, botCol, alpha);
            stroke(c);
            line(0, y, CONFIG.CANVAS.WIDTH, y);
        }
    }
    
    // Dibuja las briznas de pasto en capas para efecto de profundidad
    drawGrassLayers() {
        // Ordenar briznas por distancia del centro para efecto de profundidad
        let sortedBlades = [...this.blades].sort((a, b) => b.distanceFromCenter - a.distanceFromCenter);
        
        // Separar en capas según la distancia
        let layers = [
            sortedBlades.filter(b => b.distanceFromCenter > CONFIG.PERFORMANCE.LOD_DISTANCE_THRESHOLD),
            sortedBlades.filter(b => b.distanceFromCenter <= CONFIG.PERFORMANCE.LOD_DISTANCE_THRESHOLD)
        ];
        
        // Dibujar cada capa con diferentes niveles de transparencia
        layers.forEach((layer, index) => {
            let alpha = index === 0 ? 0.7 : 1.0; // Capa de fondo más tenue
            
            layer.forEach(blade => {
                push();
                if (index === 0) {
                    tint(255, alpha * 255);
                }
                blade.draw(this.windSystem, this.settings);
                pop();
            });
        });
    }
    
    // Maneja el redimensionamiento de la ventana
    onWindowResize() {
    }
    
    // Maneja la entrada del teclado
    onKeyPressed(key) {
        switch(key.toLowerCase()) {
            case 'r':
                this.generateBlades();
                break;
            case 'f':
                this.settings.showFill = !this.settings.showFill;
                break;
            case 's':
                this.settings.showSkeleton = !this.settings.showSkeleton;
                break;
            case ' ':
                // Pausar/reanudar
                break;
        }
    }
    
    getStats() {
        return {
            performance: {
                fps: this.frameHistory.length > 0 ? 
                    this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length : 0,
                bladeCount: this.blades.length
            },
            wind: this.windSystem.getStats(),
            vectorPool: this.vectorPool.getStats(),
            settings: { ...this.settings }
        };
    }
    
    destroy() {
        this.blades.forEach(blade => blade.destroy());
        this.blades = [];
        if (this.ui) {
            this.ui.destroy();
        }
    }
}