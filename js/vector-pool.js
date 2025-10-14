class VectorPool {
    // Pool de vectores para optimización de memoria
    constructor(size = 200) {
        this.pool = [];
        this.available = [];
        
        // Inicializar el pool con vectores
        for (let i = 0; i < size; i++) {
            let v = createVector(0, 0);
            this.pool.push(v);
            this.available.push(v);
        }
    }
    
    // Obtiene un vector del pool
    get(x = 0, y = 0) {
        if (this.available.length > 0) {
            let v = this.available.pop();
            return v.set(x, y);
        }
        // Fallback si se agota el pool
        return createVector(x, y);
    }

    // Devuelve un vector al pool para reutilización
    release(vector) {
        if (this.available.length < this.pool.length) {
            this.available.push(vector);
        }
    }
    
    // Devuelve múltiples vectores al pool
    releaseAll(vectors) {
        vectors.forEach(v => this.release(v));
    }
    
    // Obtiene estadísticas del pool
    getStats() {
        return {
            total: this.pool.length,
            available: this.available.length,
            inUse: this.pool.length - this.available.length
        };
    }
}