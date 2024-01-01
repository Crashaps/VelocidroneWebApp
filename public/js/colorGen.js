function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function rainbow(value, s, l, max, min, start, end) {
    value = ((value - min) * (end - start) / (max - min)) + start;
    const rgbRaw = hslToRgb(value, s, l);
    return rgbToHex(rgbRaw[0], rgbRaw[1], rgbRaw[2]);
}

function createRainbowDiv(start, end) {
    const colors = [];
    for (let i = start; i <= end; i++) {
        // Normalize the value to be between 0 and 1
        const value = (i - start) / (end - start);
        colors.push(rainbow(value, 1, 0.5, end, start, start, end));
    }
    return colors;
}