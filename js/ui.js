class UI {
    // Crea la interfaz de usuario
    constructor(simulation) {
        this.sim = simulation;
        this.sliders = {};
        this.checkboxes = {};
        this.setupControls();
        this.addDayNightToggle();
    }

    // Botón de modo día/noche
    addDayNightToggle() {
        const btn = document.createElement('button');
        btn.textContent = '🌙 Noche';
        btn.style.cssText = `
            position: fixed;
            top: 24px;
            right: 32px;
            z-index: 1200;
            background: linear-gradient(90deg, #222 60%, #4CAF50 100%);
            color: #fff;
            border: none;
            border-radius: 16px;
            padding: 10px 22px;
            font-size: 1.1em;
            font-weight: 600;
            box-shadow: 0 2px 12px rgba(76,175,80,0.13);
            cursor: pointer;
            transition: background 0.2s;
        `;
        btn.id = 'dayNightToggleBtn';
        btn.onclick = () => {
            this.sim.toggleDayNight();
            btn.textContent = this.sim.isNight ? '☀️ Día' : '🌙 Noche';
        };
        document.body.appendChild(btn);
    }
    
    // Configura los controles de la UI
    setupControls() {
        let y = 60;
        const spacing = 40;
        
        // Crear sliders
        this.sliders.numBlades = this.createSlider(
            "Número de Briznas", 
            CONFIG.GRASS.MIN_BLADES, 
            CONFIG.GRASS.MAX_BLADES, 
            this.sim.settings.numBlades, 
            1, 
            y
        );
        y += spacing;
        
        this.sliders.resolution = this.createSlider(
            "Resolución", 
            CONFIG.PERFORMANCE.MIN_RESOLUTION, 
            CONFIG.PERFORMANCE.MAX_RESOLUTION, 
            this.sim.settings.resolution, 
            1, 
            y
        );
        y += spacing;
        
        this.sliders.width = this.createSlider(
            "Ancho", 
            2, 
            15, 
            this.sim.settings.width, 
            0.5, 
            y
        );
        y += spacing;
        
        this.sliders.wind = this.createSlider(
            "Fuerza del Viento", 
            0, 
            50, 
            this.sim.settings.wind, 
            1, 
            y
        );
        y += spacing;
        
        // Crear checkboxes
        this.checkboxes.showFill = this.createCheckbox(
            "Mostrar Relleno", 
            this.sim.settings.showFill, 
            y
        );
        y += 25;
        
        this.checkboxes.showSkeleton = this.createCheckbox(
            "Mostrar Esqueleto", 
            this.sim.settings.showSkeleton, 
            y
        );
    }
    
    // Crea un slider con su etiqueta y valor
    createSlider(label, min, max, defaultValue, step, y) {
        // Contenedor principal
        let container = createDiv();
        container.position(30, y);
        container.style('color', 'white');
        container.style('font-size', '12px');
        
        // Etiqueta
        let labelDiv = createDiv(label);
        labelDiv.parent(container);
        
        // Slider
        let slider = createSlider(min, max, defaultValue, step);
        slider.parent(container);
        slider.style('width', '150px');
        
        // Mostrador de valor
        let valueSpan = createSpan(': ' + defaultValue);
        valueSpan.parent(container);
        valueSpan.id(label + '_value');
        
        // Event listener
        slider.input(() => {
            valueSpan.html(': ' + slider.value());
            this.onSettingChange(label, slider.value());
        });
        
        return slider;
    }
    
    // Crea un checkbox con su etiqueta
    createCheckbox(label, defaultValue, y) {
        let checkbox = createCheckbox(label, defaultValue);
        checkbox.position(30, y);
        checkbox.style('color', 'white');
        checkbox.style('font-size', '12px');
        
        checkbox.changed(() => {
            this.onSettingChange(label, checkbox.checked());
        });
        
        return checkbox;
    }
    
    // Maneja cambios en los controles
    onSettingChange(setting, value) {
        switch(setting) {
            case "Número de Briznas":
                this.sim.setNumBlades(value);
                break;
            case "Resolución":
                this.sim.settings.resolution = value;
                break;
            case "Ancho":
                this.sim.settings.width = value;
                break;
            case "Fuerza del Viento":
                this.sim.windSystem.setStrength(value);
                this.sim.settings.wind = value;
                break;
            case "Mostrar Relleno":
                this.sim.settings.showFill = value;
                break;
            case "Mostrar Esqueleto":
                this.sim.settings.showSkeleton = value;
                break;
        }
    }
    
    // Actualiza los valores mostrados en la UI
    updateValues() {
        // Actualizar valores de sliders si es necesario
        Object.keys(this.sliders).forEach(key => {
            let slider = this.sliders[key];
            let valueSpan = select('#' + slider.parent().child()[0].innerHTML + '_value');
            if (valueSpan) {
                valueSpan.html(': ' + slider.value());
            }
        });
    }
    
    // Actualiza los valores mostrados en la UI
    updateValues() {
        // Actualizar valores de sliders si es necesario
        Object.keys(this.sliders).forEach(key => {
            let slider = this.sliders[key];
            let valueSpan = select('#' + slider.parent().child()[0].innerHTML + '_value');
            if (valueSpan) {
                valueSpan.html(': ' + slider.value());
            }
        });
    }
    
    // Habilita o deshabilita todos los controles
    setEnabled(enabled) {
        Object.values(this.sliders).forEach(slider => {
            if (enabled) {
                slider.removeAttribute('disabled');
            } else {
                slider.attribute('disabled', '');
            }
        });
        
        Object.values(this.checkboxes).forEach(checkbox => {
            if (enabled) {
                checkbox.removeAttribute('disabled');
            } else {
                checkbox.attribute('disabled', '');
            }
        });
    }
    
    // Obtiene el valor de un control
    getValue(controlName) {
        if (this.sliders[controlName]) {
            return this.sliders[controlName].value();
        }
        if (this.checkboxes[controlName]) {
            return this.checkboxes[controlName].checked();
        }
        return null;
    }
    
    // Establece el valor de un control
    setValue(controlName, value) {
        if (this.sliders[controlName]) {
            this.sliders[controlName].value(value);
            let valueSpan = select('#' + controlName + '_value');
            if (valueSpan) {
                valueSpan.html(': ' + value);
            }
        }
        if (this.checkboxes[controlName]) {
            this.checkboxes[controlName].checked(value);
        }
    }
    
    // Añade un event listener para cambios en la configuración
    addEventListener(eventName, callback) {
        if (!this.eventListeners) {
            this.eventListeners = {};
        }
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
    
    // Dispara un evento a todos los listeners registrados
    dispatchEvent(eventName, data) {
        if (this.eventListeners && this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                callback(data);
            });
        }
    }
    
    resetToDefaults() {
        this.setValue('numBlades', 60);
        this.setValue('resolution', 12);
        this.setValue('width', 6);
        this.setValue('wind', 15);
        this.setValue('showFill', true);
        this.setValue('showSkeleton', true);
    }
    
    getCurrentSettings() {
        return {
            numBlades: this.getValue('numBlades'),
            resolution: this.getValue('resolution'),
            width: this.getValue('width'),
            wind: this.getValue('wind'),
            showFill: this.getValue('showFill'),
            showSkeleton: this.getValue('showSkeleton')
        };
    }
    
    // Aplica un conjunto de configuraciones a la UI
    applySettings(settings) {
        Object.keys(settings).forEach(key => {
            this.setValue(key, settings[key]);
            this.onSettingChange(this.getDisplayName(key), settings[key]);
        });
    }
    
    // Mapea nombres de configuración a etiquetas de UI
    getDisplayName(settingName) {
        const nameMap = {
            'numBlades': 'Número de Briznas',
            'resolution': 'Resolución',
            'width': 'Ancho',
            'wind': 'Fuerza del Viento',
            'showFill': 'Mostrar Relleno',
            'showSkeleton': 'Mostrar Esqueleto'
        };
        return nameMap[settingName] || settingName;
    }
    
    destroy() {
        Object.values(this.sliders).forEach(slider => {
            if (slider.remove) slider.remove();
        });
        Object.values(this.checkboxes).forEach(checkbox => {
            if (checkbox.remove) checkbox.remove();
        });
        
        // Limpiar event listeners
        if (this.eventListeners) {
            this.eventListeners = {};
        }
    }
}