// ============= CARACTERÍSTICAS MEJORADAS =============

/**
 * Añade funcionalidades extras a la simulación
 */
class EnhancedFeatures {
    constructor(grassSim) {
        this.grassSim = grassSim;
        this.setupKeyboardShortcuts();
        this.setupMouseInteraction();
        this.setupTouchSupport();
        this.setupFullscreenToggle();
        this.setupExportFeatures();
    }
    
    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            switch(e.key.toLowerCase()) {
                case 'f':
                    if (!e.ctrlKey) {
                        this.toggleFullscreen();
                        e.preventDefault();
                    }
                    break;
                case 'h':
                    this.toggleUI();
                    e.preventDefault();
                    break;
                case 'p':
                    this.exportImage();
                    e.preventDefault();
                    break;
                case '+':
                case '=':
                    this.increaseGrassCount();
                    e.preventDefault();
                    break;
                case '-':
                    this.decreaseGrassCount();
                    e.preventDefault();
                    break;
                case ' ':
                    this.pauseToggle();
                    e.preventDefault();
                    break;
            }
        });
        
        this.addShortcutHelp();
    }
    
    /**
     * Configura interacción con el mouse
     */
    setupMouseInteraction() {
        let canvas = null;
        
        // Esperar a que se cree el canvas
        const checkCanvas = () => {
            canvas = document.querySelector('canvas');
            if (canvas) {
                this.setupCanvasEvents(canvas);
            } else {
                setTimeout(checkCanvas, 100);
            }
        };
        checkCanvas();
    }
    
    /**
     * Configura eventos del canvas
     */
    setupCanvasEvents(canvas) {
        // Crear ráfaga de viento al hacer clic
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createWindGust(x, y);
            this.createClickEffect(x, y);
        });
        
        // Efecto de hover
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Crear suave influencia del mouse
            this.createMouseInfluence(x, y);
        });
    }
    
    /**
     * Crea una ráfaga de viento en la posición especificada
     */
    createWindGust(x, y) {
        if (this.grassSim.windSystem.gusts) {
            this.grassSim.windSystem.gusts.push({
                strength: 25 + Math.random() * 15,
                duration: 60 + Math.random() * 40,
                age: 0,
                phase: Math.random() * Math.PI * 2,
                x: x,
                y: y,
                radius: 100 + Math.random() * 50
            });
        }
        this.createGustVisualEffect(x, y);
    }
    
    /**
     * Crea efecto visual al hacer clic
     */
    createClickEffect(x, y) {
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 20px;
            height: 20px;
            border: 2px solid #4CAF50;
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            animation: clickRipple 0.6s ease-out forwards;
        `;
        
        // Añadir animación CSS si no existe
        if (!document.querySelector('#clickEffectStyle')) {
            const style = document.createElement('style');
            style.id = 'clickEffectStyle';
            style.textContent = `
                @keyframes clickRipple {
                    0% {
                        transform: translate(-50%, -50%) scale(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 600);
    }
    
    /**
     * Soporte para dispositivos táctiles
     */
    setupTouchSupport() {
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const canvas = document.querySelector('canvas');
            
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                this.createWindGust(x, y);
                this.createClickEffect(x, y);
            }
        }, { passive: false });
    }
    
    /**
     * Toggle fullscreen
     */
    setupFullscreenToggle() {
        this.isFullscreen = false;
    }
    
    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
        this.isFullscreen = !this.isFullscreen;
    }
    
    /**
     * Toggle UI visibility
     */
    toggleUI() {
        const controlPanel = document.querySelector('.control-panel');
        const statsPanel = document.querySelector('.stats-panel');
        
        if (controlPanel) {
            controlPanel.style.display = controlPanel.style.display === 'none' ? 'block' : 'none';
        }
        if (statsPanel) {
            statsPanel.style.display = statsPanel.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    /**
     * Exportar imagen
     */
    setupExportFeatures() {
        // Esta función se puede expandir para incluir diferentes formatos
    }
    
    exportImage() {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            // Crear enlace de descarga
            const link = document.createElement('a');
            link.download = `grass_simulation_${new Date().getTime()}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            // Mostrar notificación
            this.showNotification('Imagen guardada! 📸');
        }
    }
    
    /**
     * Incrementar cantidad de pasto
     */
    increaseGrassCount() {
        const current = this.grassSim.settings.numBlades;
        const newValue = Math.min(current + 10, CONFIG.GRASS.MAX_BLADES);
        this.grassSim.setNumBlades(newValue);
        
        // Actualizar slider si existe
        const slider = document.getElementById('numBlades');
        if (slider) {
            slider.value = newValue;
            const valueDisplay = slider.parentElement.querySelector('.slider-value');
            if (valueDisplay) valueDisplay.textContent = newValue;
        }
        
        this.showNotification(`Briznas: ${newValue} (+10)`);
    }
    
    /**
     * Decrementar cantidad de pasto
     */
    decreaseGrassCount() {
        const current = this.grassSim.settings.numBlades;
        const newValue = Math.max(current - 10, CONFIG.GRASS.MIN_BLADES);
        this.grassSim.setNumBlades(newValue);
        
        // Actualizar slider si existe
        const slider = document.getElementById('numBlades');
        if (slider) {
            slider.value = newValue;
            const valueDisplay = slider.parentElement.querySelector('.slider-value');
            if (valueDisplay) valueDisplay.textContent = newValue;
        }
        
        this.showNotification(`Briznas: ${newValue} (-10)`);
    }
    
    /**
     * Pausar/reanudar simulación
     */
    pauseToggle() {
        if (typeof noLoop === 'function' && typeof loop === 'function') {
            if (this.isPaused) {
                loop();
                this.showNotification('▶️ Reanudado');
            } else {
                noLoop();
                this.showNotification('⏸️ Pausado');
            }
            this.isPaused = !this.isPaused;
        }
    }
    
    /**
     * Muestra notificaciones temporales
     */
    showNotification(message) {
        // Remover notificación anterior si existe
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            animation: notificationFade 2s ease-out forwards;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        
        // Añadir animación si no existe
        if (!document.querySelector('#notificationStyle')) {
            const style = document.createElement('style');
            style.id = 'notificationStyle';
            style.textContent = `
                @keyframes notificationFade {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
    
    /**
     * Añade ayuda de atajos de teclado
     */
    addShortcutHelp() {
        const helpButton = document.createElement('div');
        helpButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, rgba(76, 175, 80, 0.8), rgba(76, 175, 80, 0.6));
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            color: white;
            z-index: 1000;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        helpButton.textContent = '?';
        
        helpButton.addEventListener('mouseenter', () => {
            helpButton.style.transform = 'scale(1.1)';
        });
        
        helpButton.addEventListener('mouseleave', () => {
            helpButton.style.transform = 'scale(1)';
        });
        
        helpButton.addEventListener('click', () => {
            this.showShortcutsHelp();
        });
        
        document.body.appendChild(helpButton);
    }
    
    /**
     * Muestra ayuda de atajos
     */
    showShortcutsHelp() {
        const helpModal = document.createElement('div');
        helpModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        
        const helpContent = document.createElement('div');
        helpContent.style.cssText = `
            background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
            padding: 30px;
            border-radius: 20px;
            color: white;
            max-width: 400px;
            border: 1px solid rgba(255,255,255,0.2);
            backdrop-filter: blur(20px);
        `;
        
        helpContent.innerHTML = `
            <h3 style="margin-top: 0; text-align: center; color: #4CAF50;">🌱 Atajos de Teclado</h3>
            <div style="line-height: 1.8; font-size: 14px;">
                <p><strong>F</strong> - Toggle pantalla completa</p>
                <p><strong>H</strong> - Mostrar/ocultar interfaz</p>
                <p><strong>P</strong> - Exportar imagen</p>
                <p><strong>R</strong> - Regenerar briznas</p>
                <p><strong>+/-</strong> - Aumentar/reducir cantidad</p>
                <p><strong>Espacio</strong> - Pausar/reanudar</p>
                <p><strong>Click</strong> - Crear ráfaga de viento</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="closeHelp" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-weight: 600;
                ">Entendido</button>
            </div>
        `;
        
        helpModal.appendChild(helpContent);
        document.body.appendChild(helpModal);
        
        // Cerrar modal
        const closeHelp = () => {
            helpModal.remove();
        };
        
        document.getElementById('closeHelp').addEventListener('click', closeHelp);
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) closeHelp();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeHelp();
        }, { once: true });
    }
    
    /**
     * Crea efecto visual de ráfaga de viento
     */
    createGustVisualEffect(x, y) {
        // Puedes dejarlo vacío o agregar una visualización simple
        // Por ejemplo, dibujar un círculo temporal en la posición del viento
        // ellipse(x, y, 30, 30); // Si usas p5.js
    }
    
    /**
     * Crea influencia suave del mouse sobre el pasto
     */
    createMouseInfluence(x, y) {
        // Puedes dejarlo vacío o implementar alguna lógica visual
        // Por ejemplo, podrías modificar el viento localmente aquí
        // Si quieres una función visual, dime cómo te gustaría que se vea
    }
}