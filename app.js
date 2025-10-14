class App {
    constructor() {
        this.simulation = null;
        this.isInitialized = false;
        this.startTime = performance.now();
        this.loadingProgress = 0;
        
        // Estados de la aplicación
        this.states = {
            LOADING: 'loading',
            RUNNING: 'running',
            ERROR: 'error',
            PAUSED: 'paused'
        };
        
        this.currentState = this.states.LOADING;
        this.errorDetails = null;
        
        this.elements = {
            loadingScreen: null,
            errorScreen: null,
            canvasContainer: null,
            fpsCounter: null
        };
        
        this.performance = {
            frameCount: 0,
            lastFPSUpdate: 0,
            fps: 0,
            frameTimeHistory: []
        };
        
        console.log('🚀 Aplicación inicializada');
    }
    
    async init() {
        try {
            console.log('📦 Iniciando carga de la aplicación...');
            
            this.getDOMReferences();
            
            this.updateLoadingProgress(10, 'Verificando dependencias...');
            await this.checkDependencies();
            
            this.updateLoadingProgress(30, 'Configurando entorno...');
            await this.setupEnvironment();
            
            this.updateLoadingProgress(50, 'Inicializando simulación...');
            await this.initializeSimulation();
            
            this.updateLoadingProgress(80, 'Configurando interfaz...');
            await this.setupCanvas();
            
            this.updateLoadingProgress(100, 'Finalizando...');
            await this.delay(500);
            
            this.hideLoadingScreen();
            this.currentState = this.states.RUNNING;
            this.isInitialized = true;
            
            const loadTime = performance.now() - this.startTime;
            console.log(`✅ Aplicación cargada en ${loadTime.toFixed(2)}ms`);
            
            this.startMainLoop();
            
        } catch (error) {
            this.handleError(error);
        }
    }
    
    getDOMReferences() {
        this.elements.loadingScreen = document.getElementById('loading-screen');
        this.elements.errorScreen = document.getElementById('error-screen');
        this.elements.canvasContainer = document.getElementById('canvas-container');
        this.elements.fpsCounter = document.getElementById('fps-counter');
        
        if (!this.elements.loadingScreen || !this.elements.errorScreen || !this.elements.canvasContainer) {
            throw new Error('Elementos DOM requeridos no encontrados');
        }
    }
    
    async checkDependencies() {
        const requiredClasses = [
            'CONFIG', 'Utils', 'VectorPool', 'WindSystem', 
            'Blade', 'UI', 'Renderer', 'GrassSimulation'
        ];
        
        const missingClasses = requiredClasses.filter(className => 
            typeof window[className] === 'undefined'
        );
        
        if (missingClasses.length > 0) {
            throw new Error(`Clases faltantes: ${missingClasses.join(', ')}`);
        }
        
        if (typeof window.p5 === 'undefined') {
            throw new Error('p5.js no está cargado correctamente');
        }
        
        console.log('✅ Todas las dependencias están disponibles');
        await this.delay(200);
    }
    
    async setupEnvironment() {
        window.app = this;
        
        this.setupErrorHandlers();
        
        this.setupKeyboardEvents();
        
        this.setupWindowEvents();
        
        console.log('✅ Entorno configurado');
        await this.delay(200);
    }
    
    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            console.error('💥 Error global:', event.error);
            this.handleError(event.error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('💥 Promise rechazada:', event.reason);
            this.handleError(new Error(`Promise rechazada: ${event.reason}`));
        });
    }
    
    setupKeyboardEvents() {
        document.addEventListener('keydown', (event) => {
            if (!this.isInitialized) return;
            
            switch(event.key.toLowerCase()) {
                case 'r':
                    if (this.simulation) {
                        this.simulation.generateBlades();
                        console.log('🌱 Pasto regenerado');
                    }
                    break;
                case 'p':
                    this.togglePause();
                    break;
                case ' ':
                    event.preventDefault();
                    this.togglePause();
                    break;
                case 'f':
                    this.toggleFullscreen();
                    break;
            }
        });
    }
    
    setupWindowEvents() {
        window.addEventListener('resize', () => {
            if (this.isInitialized && this.simulation) {
                this.simulation.handleResize();
            }
        });
        
        // Manejar visibilidad de la página
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else if (this.currentState === this.states.PAUSED) {
                this.resume();
            }
        });
    }
    
    async initializeSimulation() {
        try {
            this.simulation = new GrassSimulation();
            
            console.log('✅ Simulación de pasto inicializada');
            await this.delay(200);
            
        } catch (error) {
            throw new Error(`Error inicializando simulación: ${error.message}`);
        }
    }
    
    async setupCanvas() {
        try {
            console.log('✅ Canvas configurado');
            await this.delay(200);
            
        } catch (error) {
            throw new Error(`Error configurando canvas: ${error.message}`);
        }
    }
    
    startMainLoop() {
        console.log('🔄 Iniciando bucle principal');
        
        this.updatePerformanceStats();
    }
    
    updatePerformanceStats() {
        this.performance.frameCount++;
        const now = performance.now();
        
        if (now - this.performance.lastFPSUpdate >= 1000) {
            this.performance.fps = Math.round(this.performance.frameCount * 1000 / (now - this.performance.lastFPSUpdate));
            this.performance.frameCount = 0;
            this.performance.lastFPSUpdate = now;
            
            if (this.elements.fpsCounter) {
                this.elements.fpsCounter.textContent = `FPS: ${this.performance.fps}`;
            }
        }
        
        if (this.currentState === this.states.RUNNING) {
            requestAnimationFrame(() => this.updatePerformanceStats());
        }
    }
    
    updateLoadingProgress(progress, message = '') {
        this.loadingProgress = progress;
        
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (message) {
            const loadingText = document.querySelector('.loading-text');
            if (loadingText) {
                loadingText.textContent = message;
            }
        }
        
        console.log(`📊 Progreso: ${progress}% - ${message}`);
    }
    
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
        }
    }
    
    showErrorScreen(error) {
        this.hideLoadingScreen();
        
        if (this.elements.errorScreen) {
            const errorDetails = document.getElementById('error-details');
            if (errorDetails) {
                errorDetails.textContent = `Error: ${error.message}\n\nDetalles técnicos:\n${error.stack}`;
            }
            this.elements.errorScreen.style.display = 'flex';
        }
    }
    
    handleError(error) {
        console.error('❌ Error en la aplicación:', error);
        
        this.currentState = this.states.ERROR;
        this.errorDetails = error;
        
        this.showErrorScreen(error);
    }
    
    // Control de estados
    pause() {
        if (this.currentState === this.states.RUNNING) {
            this.currentState = this.states.PAUSED;
            if (this.simulation) {
                this.simulation.pause();
            }
            console.log('⏸️ Aplicación pausada');
        }
    }
    
    resume() {
        if (this.currentState === this.states.PAUSED) {
            this.currentState = this.states.RUNNING;
            if (this.simulation) {
                this.simulation.resume();
            }
            this.updatePerformanceStats();
            console.log('▶️ Aplicación reanudada');
        }
    }
    
    togglePause() {
        if (this.currentState === this.states.RUNNING) {
            this.pause();
        } else if (this.currentState === this.states.PAUSED) {
            this.resume();
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error intentando entrar en pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // Métodos interacción
    regenerateGrass() {
        if (this.simulation) {
            this.simulation.generateBlades();
        }
    }
    
    setWindStrength(strength) {
        if (this.simulation && this.simulation.windSystem) {
            this.simulation.windSystem.setStrength(strength);
        }
    }
    
    getSimulationStats() {
        if (this.simulation) {
            return this.simulation.getStats();
        }
        return null;
    }
    
    // Utilidades
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // limpiar recursos al cerrar
    destroy() {
        console.log('🧹 Limpiando recursos de la aplicación');
        
        if (this.simulation) {
            this.simulation.destroy();
            this.simulation = null;
        }
        
        this.currentState = this.states.ERROR;
        this.isInitialized = false;``
    }
    
    // propiedades
    get state() {
        return this.currentState;
    }
    
    get fps() {
        return this.performance.fps;
    }
    
    get isRunning() {
        return this.currentState === this.states.RUNNING;
    }
    
    get isPaused() {
        return this.currentState === this.states.PAUSED;
    }
    
    get hasError() {
        return this.currentState === this.states.ERROR;
    }
}
    
window.App = App;
console.log("🖥️ Módulo App cargado");