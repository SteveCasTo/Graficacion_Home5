// ============= CONFIGURACIÓN GLOBAL =============
const CONFIG = {
    CANVAS: {
        WIDTH: 1000,
        HEIGHT: 600
    },
    GRASS: {
        MIN_HEIGHT: 80,
        MAX_HEIGHT: 140,
        BASE_OFFSET: 20,
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
        GRASS_HUE_MIN: 80,
        GRASS_HUE_MAX: 120,
        GRASS_SAT_MIN: 60,
        GRASS_SAT_MAX: 90,
        GRASS_BRIGHT_MIN: 30,
        GRASS_BRIGHT_MAX: 70
    },
    PERFORMANCE: {
        LOD_DISTANCE_THRESHOLD: 200,
        MIN_RESOLUTION: 2,
        MAX_RESOLUTION: 25,
        CACHE_TOLERANCE: 0.1
    }
};