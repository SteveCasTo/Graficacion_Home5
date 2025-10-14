class WindSystem {
    constructor() {
        this.baseWind = 0;
        this.gusts = [];
        this.globalPhase = 0;
        this.time = 0;
        this.settings = {
            strength: 15,
            gustProbability: 0.001
        };
    }
    
    // Actualiza el sistema de viento
    update() {
        this.time += 1;
        this.globalPhase += 0.01;
        
        // Viento base usando ruido Perlin para variación natural
        this.baseWind = noise(this.time * 0.005) * this.settings.strength;
        
        // Generar ráfagas ocasionales
        if (random() < this.settings.gustProbability) {
            this.gusts.push({
                strength: random(10, 30),
                duration: random(30, 120),
                age: 0,
                phase: random(TWO_PI)
            });
        }
        
        // Actualizar y filtrar ráfagas existentes
        this.gusts = this.gusts.filter(gust => {
            gust.age++;
            return gust.age < gust.duration;
        });
    }
    
    // Calcula la fuerza del viento en una posición dada
    getWindAt(x, y, phase, speed, amp) {
        let wind = this.baseWind;
        
        // Añadir influencia de las ráfagas
        this.gusts.forEach(gust => {
            let gustInfluence = map(gust.age, 0, gust.duration, 1, 0);
            gustInfluence = easeInOutSine(gustInfluence);
            wind += gust.strength * gustInfluence * sin(this.time * 0.05 + gust.phase);
        });
        
        // Movimiento individual de la brizna
        wind += sin(this.time * speed + phase) * amp;
        
        // Normalizar la fuerza del viento
        return wind * (this.settings.strength / 20);
    }
    
    // Establece la fuerza base del viento
    setStrength(strength) {
        this.settings.strength = clamp(strength, 0, 100);
    }
    
    // Establece la probabilidad de ráfagas
    setGustProbability(probability) {
        this.settings.gustProbability = clamp(probability, 0, 0.01);
    }

    // Obtiene estadísticas del sistema de viento
    getStats() {
        return {
            baseWind: this.baseWind,
            activeGusts: this.gusts.length,
            strength: this.settings.strength,
            gustProbability: this.settings.gustProbability
        };
    }
}