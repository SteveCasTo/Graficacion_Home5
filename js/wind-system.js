class WindSystem {
    constructor() {
        this.baseWind = 0;
        this.gusts = [];
        this.globalPhase = 0;
        this.time = 0;
        this.maxGusts = 25; // Límite aumentado de ráfagas simultáneas
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
        if (random() < this.settings.gustProbability && this.gusts.length < this.maxGusts) {
            this.gusts.push({
                strength: random(10, 30),
                duration: random(30, 120),
                age: 0,
                phase: random(TWO_PI),
                x: random(width),
                y: random(height),
                radius: random(80, 150)
            });
        }
        
        // Actualizar y filtrar ráfagas existentes
        this.gusts = this.gusts.filter(gust => {
            gust.age++;
            return gust.age < gust.duration;
        });
        
        // Limitar el número de ráfagas (eliminar las más viejas si hay demasiadas)
        if (this.gusts.length > this.maxGusts) {
            this.gusts.sort((a, b) => b.age - a.age);
            this.gusts = this.gusts.slice(0, this.maxGusts);
        }
    }
    
    // Calcula la fuerza del viento en una posición dada
    getWindAt(x, y, phase, speed, amp) {
        let wind = this.baseWind;

        // 1. Oscilación grupal (todas las briznas se mueven suavemente juntas)
        let globalOsc = sin(this.time * 0.012 + phase * 0.2) * 10;
        wind += globalOsc;

        // 2. Turbulencia local (ruido Perlin 2D en espacio y tiempo)
        let t = this.time * 0.008;
        let turbulence = (noise(x * 0.012, y * 0.012, t) - 0.5) * 18;
        wind += turbulence;

        // Añadir influencia de las ráfagas con dirección
        this.gusts.forEach(gust => {
            // Calcular distancia de la brizna a la ráfaga
            let dx = x - gust.x;
            let dy = y - gust.y;
            let distance = sqrt(dx * dx + dy * dy);
            // Solo afecta si está dentro del radio
            if (distance < gust.radius) {
                // Calcular influencia basada en distancia (más fuerte cerca del centro)
                let distanceInfluence = map(distance, 0, gust.radius, 1, 0);
                distanceInfluence = easeInOutSine(distanceInfluence);
                // Calcular influencia basada en edad (fade out con el tiempo)
                let ageInfluence = map(gust.age, 0, gust.duration, 1, 0);
                ageInfluence = easeInOutSine(ageInfluence);
                // Dirección del viento: positivo si está a la derecha, negativo si está a la izquierda
                let direction = dx > 0 ? 1 : -1;
                // Aplicar viento con dirección (reducido multiplicador para menos deformación)
                let windForce = direction * gust.strength * distanceInfluence * ageInfluence;
                wind += windForce * sin(this.time * 0.05 + gust.phase) * 1.2;
            }
        });

        // Movimiento individual de la brizna
        wind += sin(this.time * speed + phase) * amp;

        // Normalizar la fuerza del viento (ajustado para balance)
        return wind * (this.settings.strength / 16);
    }
    
    // Establece la fuerza base del viento
    setStrength(strength) {
        this.settings.strength = clampValue(strength, 0, 100);
    }
    
    // Establece la probabilidad de ráfagas
    setGustProbability(probability) {
        this.settings.gustProbability = clampValue(probability, 0, 0.01);
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