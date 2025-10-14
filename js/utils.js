
function easeInOutSine(t) {
    return -(cos(PI * t) - 1) / 2;
}

// Mapea un valor de un rango a otro con opción de easing
function mapWithEasing(value, start1, stop1, start2, stop2, easingFunc = null) {
    let normalized = map(value, start1, stop1, 0, 1);
    if (easingFunc) {
        normalized = easingFunc(normalized);
    }
    return map(normalized, 0, 1, start2, stop2);
}

// Clamp un valor entre un mínimo y un máximo
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Genera un color verde aleatorio para la hierba
function generateGrassColor() {
    colorMode(HSB);
    let hue = random(CONFIG.COLORS.GRASS_HUE_MIN, CONFIG.COLORS.GRASS_HUE_MAX);
    let sat = random(CONFIG.COLORS.GRASS_SAT_MIN, CONFIG.COLORS.GRASS_SAT_MAX);
    let bright = random(CONFIG.COLORS.GRASS_BRIGHT_MIN, CONFIG.COLORS.GRASS_BRIGHT_MAX);
    let color = window.color(hue, sat, bright);
    colorMode(RGB);
    return color;
}