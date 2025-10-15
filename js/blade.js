class Blade {
    /**
     * Constructor de la brizna
     * @param {number} x - Posición X de la base
     * @param {VectorPool} vectorPool - Pool de vectores para optimización
     */
    constructor(x, vectorPool) {
        this.pool = vectorPool;
        // Puntos de control de la brizna
        this.base = this.pool.get(x, CONFIG.CANVAS.HEIGHT - CONFIG.GRASS.BASE_OFFSET);
        
    // Punta de la brizna
    this.height = random(CONFIG.GRASS.MIN_HEIGHT, CONFIG.GRASS.MAX_HEIGHT);
    let h = this.height;
    let dx = random(-30, 30);
    this.tip = this.pool.get(x + dx, CONFIG.CANVAS.HEIGHT - CONFIG.GRASS.BASE_OFFSET - h);

    // Grosor y color individual
    this.widthFactor = random(0.7, 1.15); // Algunas más delgadas, otras más gruesas
    // Color: algunas más amarillas o azuladas
    let hueJitter = random(-10, 10);
    let baseColor = generateGrassColor();
    this.color = color(hue(baseColor) + hueJitter, saturation(baseColor), brightness(baseColor));

    // ¿Tiene semilla/puntito?
    this.hasSeed = random() < 0.22; // 22% de las briznas
    this.seedColor = color(220, 220, 120, 220); // Amarillo claro
    this.seedSize = random(2.2, 3.7);
        
    // Punto de control para la curvatura Bézier
    let cx = (this.base.x + this.tip.x) / 2 + random(-50, 50);
    let cy = (this.base.y + this.tip.y) / 2 - random(40, 100);
    this.ctrl = this.pool.get(cx, cy);

    // Parámetros de oscilación natural
    this.oscPhase = random(TWO_PI);
    this.oscSpeed = random(0.008, 0.022);
    this.oscAmp = random(7, 18);
        
        // Color natural usando HSB
        this.color = generateGrassColor();
        
        // Parámetros de animación únicos para cada brizna
        this.phase = random(TWO_PI);
        this.speed = random(CONFIG.WIND.MIN_SPEED, CONFIG.WIND.MAX_SPEED);
        this.amp = random(CONFIG.WIND.MIN_AMP, CONFIG.WIND.MAX_AMP);
        
        // Sistema de cache para optimización
        this.cachedPoints = null;
        this.lastWindValue = -999;
        this.lastResolution = -1;
        
        // Nivel de Detalle
        this.distanceFromCenter = abs(x - CONFIG.CANVAS.WIDTH / 2);
    }
    
    //Calcula los puntos de la curva Bézier cuadrática
    calculatePoints(wind, resolution) {
        if (this.cachedPoints &&
            abs(wind - this.lastWindValue) < CONFIG.PERFORMANCE.CACHE_TOLERANCE &&
            resolution === this.lastResolution) {
            return this.cachedPoints;
        }
    // Oscilación natural de la brizna (independiente)
    let t = millis ? millis() * 0.001 : 0;
    let osc = sin(t * this.oscSpeed + this.oscPhase) * this.oscAmp * (0.7 + 0.3 * noise(this.base.x * 0.01, t * 0.1));

    let cx = this.ctrl.x + wind * 0.7 + osc * 0.7;
    let cy = this.ctrl.y + osc * 0.18;
    // Aplica viento y oscilación también a la punta
    let tipX = this.tip.x + wind + osc * 0.5;
    let tipY = this.tip.y + osc * 0.12;
        if (this.cachedPoints) this.pool.releaseAll(this.cachedPoints);
        let pts = [];
        for (let i = 0; i <= resolution; i++) {
            let u = i / resolution;
            let x = (1 - u) * (1 - u) * this.base.x +
                    2 * (1 - u) * u * cx +
                    u * u * tipX;
            let y = (1 - u) * (1 - u) * this.base.y +
                    2 * (1 - u) * u * cy +
                    u * u * tipY;
            pts.push(this.pool.get(x, y));
        }
        this.cachedPoints = pts;
        this.lastWindValue = wind;
        this.lastResolution = resolution;
        return pts;
    }
    
    // Obtiene la resolución ajustada según el LOD
    getLODResolution(baseResolution) {
        if (this.distanceFromCenter > CONFIG.PERFORMANCE.LOD_DISTANCE_THRESHOLD) {
            return max(CONFIG.PERFORMANCE.MIN_RESOLUTION, floor(baseResolution * 0.5));
        }
        return baseResolution;
    }

    // Dibuja la brizna en el canvas
    draw(windSystem, settings) {
    // Viento depende de la altura (más altas, más flexibles)
    let wind = windSystem.getWindAt(this.base.x, this.base.y, this.phase, this.speed, this.amp) * map(this.height, CONFIG.GRASS.MIN_HEIGHT, CONFIG.GRASS.MAX_HEIGHT, 0.85, 1.18);
    let resolution = this.getLODResolution(settings.resolution);
    let pts = this.calculatePoints(wind, resolution);

        // Motion blur: si el viento es fuerte, dibuja una sombra translúcida detrás
        if (abs(wind) > 18 && settings.showFill) {
            let blurOffset = constrain(wind * 0.18, -22, 22);
            push();
            translate(blurOffset, 0);
            noStroke();
            fill(60, 180, 80, 38); // Verde translúcido
            beginShape();
            for (let i = 0; i < pts.length; i++) vertex(pts[i].x, pts[i].y);
            for (let i = pts.length - 1; i >= 0; i--) vertex(pts[i].x, pts[i].y + 2);
            endShape(CLOSE);
            pop();
        }

        // Dibujar relleno si está activado
        if (settings.showFill) {
            this.drawFill(pts, wind, settings.width);
            // Añadir brillo sutil en la punta
            this.drawTipHighlight(pts);
        }

        if (settings.showSkeleton) {
            this.drawSkeleton(pts, settings.width);
        }

        // Dibujar espina dorsal
        this.drawSpine(pts);
    }
    
    // Dibuja el relleno de la brizna
    drawFill(pts, wind, width) {
        let left = [];
        let right = [];
        let n = pts.length;
        let bladeWidth = width * this.widthFactor;
        // Calcular contornos izquierdo y derecho para todos los puntos
        for (let i = 0; i < n; i++) {
            let p = pts[i];
            // Para el último punto, usa la dirección del segmento anterior
            let q = (i < n - 1) ? pts[i + 1] : pts[i - 1];
            let ang = atan2(q.y - p.y, q.x - p.x) + HALF_PI;
            // Factor de ancho que adelgaza hacia la punta
            let widthFactor = sin((i / (n - 1)) * PI);
            let d = bladeWidth * widthFactor;
            left.push(this.pool.get(p.x + d * cos(ang), p.y + d * sin(ang)));
            right.push(this.pool.get(p.x - d * cos(ang), p.y - d * sin(ang)));
        }

        // Dibujar relleno con suavizado
        noStroke();
        fill(this.color);
        
        // Usar curvas para suavizar bordes
        beginShape();
        for (let i = 0; i < left.length; i++) {
            if (i === 0) {
                vertex(left[i].x, left[i].y);
            } else {
                vertex(left[i].x, left[i].y);
            }
        }
        for (let i = right.length - 1; i >= 0; i--) {
            if (i === right.length - 1) {
                vertex(right[i].x, right[i].y);
            } else {
                vertex(right[i].x, right[i].y);
            }
        }
        endShape(CLOSE);

        this.pool.releaseAll(left);
        this.pool.releaseAll(right);
    }
    
    // Dibuja el esqueleto de la brizna
    drawSkeleton(pts, width) {
        stroke(100, 200, 50, 180); // Aumentado alfa de 150 a 180
        strokeWeight(1.2); // Aumentado de 1 a 1.2 para mejor visibilidad
        let w = width * 0.7;
        
        for (let i = 0; i < pts.length - 1; i++) {
            let p = pts[i];
            let q = pts[i + 1];
            let ang = atan2(q.y - p.y, q.x - p.x) + HALF_PI;
            let widthFactor = sin((i / (pts.length - 1)) * PI);
            let d = w * widthFactor;
            line(p.x + d * cos(ang), p.y + d * sin(ang), 
                 p.x - d * cos(ang), p.y - d * sin(ang));
        }
    }

    // Dibuja la espina dorsal de la brizna
    drawSpine(pts) {
        // Espina dorsal más visible y con mejor color
        stroke(0, 140, 15, 200); // Color verde oscuro más opaco
        strokeWeight(2); // Aumentado de 1.5 a 2 para más visibilidad
        noFill();
        beginShape();
        for (let p of pts) {
            vertex(p.x, p.y);
        }
        endShape();
    }
    
    // Dibuja un brillo sutil en la punta del pasto
    drawTipHighlight(pts) {
        if (pts.length < 3) return;
        // Obtener los últimos puntos (punta)
        let tipPoint = pts[pts.length - 1];
        // Crear un pequeño círculo brillante en la punta
        noStroke();
        fill(180, 255, 100, 80); // Verde claro con transparencia
        circle(tipPoint.x, tipPoint.y, 3);
        // Dibujar semilla/puntito si corresponde
        if (this.hasSeed) {
            fill(this.seedColor);
            stroke(255, 255, 180, 120);
            strokeWeight(0.7);
            circle(tipPoint.x, tipPoint.y - this.seedSize * 0.7, this.seedSize);
        }
    }
    
    destroy() {
        if (this.cachedPoints) {
            this.pool.releaseAll(this.cachedPoints);
        }
        this.pool.release(this.base);
        this.pool.release(this.tip);
        this.pool.release(this.ctrl);
    }
}