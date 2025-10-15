// ============= CONFIGURACIÓN GLOBAL =============
const CONFIG = {
    CANVAS: {
        get WIDTH() { return window.innerWidth; },
        get HEIGHT() { return window.innerHeight; }
    },
    GRASS: {
        MIN_HEIGHT: 80,
        MAX_HEIGHT: 140,
        BASE_OFFSET: 90, // Antes 20. Aumentado para que el pasto esté más arriba
        MIN_BLADES: 10,
        MAX_BLADES: 150
    },
    WIND: {
        MIN_SPEED: 0.005,
        MAX_SPEED: 0.05,
        MIN_AMP: 5,
        MAX_AMP: 40,
        GUST_FREQUENCY: 0.002
    },
    COLORS: {
        GRASS_HUE_MIN: 75,      // Verde más amarillento (era 80)
        GRASS_HUE_MAX: 125,     // Verde más azulado (era 120)
        GRASS_SAT_MIN: 65,      // Saturación aumentada (era 60)
        GRASS_SAT_MAX: 95,      // Saturación aumentada (era 90)
        GRASS_BRIGHT_MIN: 35,   // Brillo aumentado (era 30)
        GRASS_BRIGHT_MAX: 75    // Brillo aumentado (era 70)
    },
    PERFORMANCE: {
        LOD_DISTANCE_THRESHOLD: 200,
        MIN_RESOLUTION: 2,
        MAX_RESOLUTION: 100,
        CACHE_TOLERANCE: 0.1
    }
};