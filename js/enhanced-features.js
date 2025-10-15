// ============= CARACTERÍSTICAS MEJORADAS =============

/**
 * Añade funcionalidades extras a la simulación
 */
class EnhancedFeatures {
    // Partículas verdes desprendidas
    static detachedParticles = [];
    constructor(grassSim) {
        this.grassSim = grassSim;
        this.isMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
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
        // Detectar cuando se presiona el mouse
        canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            const rect = canvas.getBoundingClientRect();
            this.lastMouseX = e.clientX - rect.left;
            this.lastMouseY = e.clientY - rect.top;
            
            // Crear ráfaga inicial al hacer clic (reducido un poco la fuerza)
            this.createWindGust(this.lastMouseX, this.lastMouseY, 40, 100);
            this.createClickEffect(this.lastMouseX, this.lastMouseY);

            // Crear partículas verdes desprendidas (punto medio)
            for (let i = 0; i < 9; i++) {
                EnhancedFeatures.detachedParticles.push({
                    x: this.lastMouseX,
                    y: this.lastMouseY,
                    vx: random(-2, 2),
                    vy: random(-3.2, -1.2),
                    life: random(16, 26),
                    age: 0,
                    color: color(random(80, 120), random(200, 255), random(80, 120), 170)
                });
            }
        });
// Dibuja y actualiza partículas verdes desprendidas
window.drawDetachedParticles = function() {
    if (!window.p5) return;
    for (let i = EnhancedFeatures.detachedParticles.length - 1; i >= 0; i--) {
        let p = EnhancedFeatures.detachedParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18; // gravedad
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.age++;
        noStroke();
        fill(p.color);
        ellipse(p.x, p.y, 3.1 + (p.life - p.age) * 0.09, 1.7 + (p.life - p.age) * 0.06);
        if (p.age > p.life) {
            EnhancedFeatures.detachedParticles.splice(i, 1);
        }
    }
};
        
        // Detectar cuando se suelta el mouse
        canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        // Detectar cuando el mouse sale del canvas
        canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
        });
        
        // Movimiento del mouse (arrastre continuo)
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Si está arrastrando, crear viento continuo
            if (this.isMouseDown) {
                // Crear ráfagas más suaves para movimiento continuo
                this.createWindGust(x, y, 28, 40);
            }
            
            this.lastMouseX = x;
            this.lastMouseY = y;
        });
    }
    
    /**
     * Crea una ráfaga de viento en la posición especificada
     */
    createWindGust(x, y, strength = null, duration = null, radius = null) {
        if (this.grassSim.windSystem.gusts) {
            // Solo crear si no hemos alcanzado el límite
            if (this.grassSim.windSystem.gusts.length < this.grassSim.windSystem.maxGusts) {
                this.grassSim.windSystem.gusts.push({
                    strength: strength || (30 + Math.random() * 15), // Reducido de 35-55 a 30-45
                    duration: duration || (60 + Math.random() * 40),
                    age: 0,
                    phase: Math.random() * Math.PI * 2,
                    x: x,
                    y: y,
                    radius: radius || (150 + Math.random() * 80)
                });
            }
        }
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
        helpButton.setAttribute('tabindex', '0');
        helpButton.setAttribute('aria-label', 'Ayuda e instrucciones');
        helpButton.style.cssText = `
            position: fixed;
            bottom: 32px;
            right: 32px;
            width: 54px;
            height: 54px;
            background: linear-gradient(120deg, #4CAF50 80%, #81C784 100%);
            box-shadow: 0 4px 24px 0 rgba(76,175,80,0.25);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 32px;
            color: #fff;
            z-index: 2000;
            transition: all 0.2s cubic-bezier(.4,2,.6,1);
            border: 2.5px solid #fff;
            outline: none;
            user-select: none;
        `;
        helpButton.innerHTML = '<span style="font-weight:bold; font-size:32px;">?</span>';

        helpButton.addEventListener('mouseenter', () => {
            helpButton.style.transform = 'scale(1.13)';
            helpButton.style.boxShadow = '0 8px 32px 0 rgba(76,175,80,0.35)';
        });
        helpButton.addEventListener('mouseleave', () => {
            helpButton.style.transform = 'scale(1)';
            helpButton.style.boxShadow = '0 4px 24px 0 rgba(76,175,80,0.25)';
        });
        helpButton.addEventListener('focus', () => {
            helpButton.style.transform = 'scale(1.13)';
            helpButton.style.boxShadow = '0 8px 32px 0 rgba(76,175,80,0.35)';
        });
        helpButton.addEventListener('blur', () => {
            helpButton.style.transform = 'scale(1)';
            helpButton.style.boxShadow = '0 4px 24px 0 rgba(76,175,80,0.25)';
        });
        helpButton.addEventListener('click', () => {
            this.showShortcutsHelp();
        });
        helpButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                this.showShortcutsHelp();
            }
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
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(6px);
        `;

        const helpContent = document.createElement('div');
        helpContent.style.cssText = `
            background: linear-gradient(135deg, rgba(255,255,255,0.13), rgba(76,175,80,0.10));
            padding: 36px 32px 28px 32px;
            border-radius: 24px;
            color: #fff;
            max-width: 440px;
            border: 2px solid rgba(255,255,255,0.22);
            box-shadow: 0 8px 40px rgba(76,175,80,0.18);
            backdrop-filter: blur(24px);
        `;

        helpContent.innerHTML = `
            <h2 style="margin-top: 0; text-align: center; color: #4CAF50; font-size: 2rem;">🌱 Simulación de Pasto</h2>
            <p style="text-align:center; margin-bottom:18px; color:#b2ffb2; font-size:1.08em;">Proyecto interactivo de simulación de pasto usando curvas Bézier y física de viento en p5.js.<br><span style='color:#fff;font-size:0.95em;'>Arrastra el mouse o haz clic para experimentar el viento.</span></p>
            <div style="line-height: 1.8; font-size: 15px; margin-bottom: 10px;">
                <strong>Controles rápidos:</strong>
                <ul style='margin: 8px 0 0 18px; padding:0; color:#fff;'>
                    <li><b>F</b>: Pantalla completa</li>
                    <li><b>H</b>: Mostrar/ocultar interfaz</li>
                    <li><b>P</b>: Exportar imagen</li>
                    <li><b>R</b>: Regenerar pasto</li>
                    <li><b>+/-</b>: Aumentar/reducir cantidad</li>
                    <li><b>Espacio</b>: Pausar/reanudar</li>
                    <li><b>Click/Arrastrar</b>: Viento local</li>
                </ul>
            </div>
            <div style="text-align: center; margin-top: 24px;">
                <button id="closeHelp" style="
                    background: linear-gradient(90deg, #4CAF50 80%, #81C784 100%);
                    color: white;
                    border: none;
                    padding: 12px 32px;
                    border-radius: 12px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1.1em;
                    box-shadow: 0 2px 12px rgba(76,175,80,0.18);
                    transition: background 0.2s;
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