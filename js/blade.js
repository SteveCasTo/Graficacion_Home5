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
        let h = random(CONFIG.GRASS.MIN_HEIGHT, CONFIG.GRASS.MAX_HEIGHT);
        let dx = random(-30, 30);
        this.tip = this.pool.get(x + dx, CONFIG.CANVAS.HEIGHT - CONFIG.GRASS.BASE_OFFSET - h);
        
        // Punto de control para la curvatura Bézier
        let cx = (this.base.x + this.tip.x) / 2 + random(-50, 50);
        let cy = (this.base.y + this.tip.y) / 2 - random(40, 100);
        this.ctrl = this.pool.get(cx, cy);
        
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
        let cx = this.ctrl.x + wind;
        let cy = this.ctrl.y;
        // Aplica viento también a la punta
        let tipX = this.tip.x + wind;
        let tipY = this.tip.y;
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
        let wind = windSystem.getWindAt(this.base.x, this.base.y, this.phase, this.speed, this.amp);
        let resolution = this.getLODResolution(settings.resolution);
        let pts = this.calculatePoints(wind, resolution);
        
        // Dibujar relleno si está activado
        if (settings.showFill) {
            this.drawFill(pts, wind, settings.width);
        }
        
        // Dibujar esqueleto si está activado y es visible
        if (settings.showSkeleton && this.distanceFromCenter < CONFIG.PERFORMANCE.LOD_DISTANCE_THRESHOLD) {
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

        // Calcular contornos izquierdo y derecho para todos los puntos
        for (let i = 0; i < n; i++) {
            let p = pts[i];
            // Para el último punto, usa la dirección del segmento anterior
            let q = (i < n - 1) ? pts[i + 1] : pts[i - 1];
            let ang = atan2(q.y - p.y, q.x - p.x) + HALF_PI;
            let widthFactor = sin((i / (n - 1)) * PI);
            let d = width * widthFactor;
            left.push(this.pool.get(p.x + d * cos(ang), p.y + d * sin(ang)));
            right.push(this.pool.get(p.x - d * cos(ang), p.y - d * sin(ang)));
        }

        // Dibujar relleno
        noStroke();
        fill(this.color);
        beginShape();
        for (let v of left) vertex(v.x, v.y);
        for (let i = right.length - 1; i >= 0; i--) vertex(right[i].x, right[i].y);
        endShape(CLOSE);

        this.pool.releaseAll(left);
        this.pool.releaseAll(right);
    }
    
    // Dibuja el esqueleto de la brizna
    drawSkeleton(pts, width) {
        stroke(100, 200, 50, 150);
        strokeWeight(1);
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
        stroke(0, 160, 20);
        strokeWeight(1.5);
        noFill();
        beginShape();
        for (let p of pts) {
            vertex(p.x, p.y);
        }
        endShape();
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