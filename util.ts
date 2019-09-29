export {
    hsl
}

function calc(n1:number, n2:number, hue:number) {
    hue = (hue + 180) % 360;
    if(hue < 60) {
        return n1 + (n2 - n1) * hue / 60;
    } else if(hue < 180) {
        return n2;
    } else if(hue < 240) {
        return n1 + (n2 - n1) * (240 - hue) / 60;
    } else {
        return n1;
    }
}

function hsl(h:number, s:number, l:number) {
    var max;
    l /= 100; // 0～1に正規化
    s /= 100; // 0～1に正規化
    if(l <= 0.5) {
        max = l * (1 + s);
    } else {
        max = l + s - l * s;
    }
    var min = 2 * l - max;

    var r = Math.floor(calc(max, min, h + 120) * 255);
    var g = Math.floor(calc(max, min, h) * 255);
    var b = Math.floor(calc(max, min, h - 120) * 255);

    return (r << 16) | (g << 8) | b;

};