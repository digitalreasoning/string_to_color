/********************************************************
Name: str_to_color
Description: create a hash from a string then generates a color
Usage: alert('#'+str_to_color("Any string can be converted"));
author: Brandon Corbin [code@icorbin.com]
website: http://icorbin.com
********************************************************/

function string_to_color(str, options) {
    'use strict';
    // Generate a Hash for the String
    var hash = function(word) {
        var h = 0;
        for (var i = 0; i < word.length; i++) {
            h = word.charCodeAt(i) + ((h << 5) - h);
        }
        return h;
    };

    // Change the darkness or lightness
    var shade = function(color, prc) {
        var num = parseInt(color, 16),
            amt = Math.round(2.55 * prc),
            R = (num >> 16) + amt,
            G = (num >> 8 & 0x00FF) + amt,
            B = (num & 0x0000FF) + amt;
        return (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16)
            .slice(1);

    };
    // Convert init to an RGBA
    var int_to_rgba = function(i) {
        var color = ((i >> 24) & 0xFF).toString(16) +
            ((i >> 16) & 0xFF).toString(16) +
            ((i >> 8) & 0xFF).toString(16) +
            (i & 0xFF).toString(16);
        return color;
    };

    var hex_to_rgb = function(hexString) {
        var r = parseInt(hexString.slice(0,2), 16);
        var g = parseInt(hexString.slice(2,4), 16);
        var b = parseInt(hexString.slice(4,6), 16);
        return [r, g, b];
    }

    var rgb_to_xyz = function(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;

        // assume sRGB
        r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
        g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
        b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

        var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
        var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
        var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

        return [x * 100, y *100, z * 100];
    }

    var xyz_to_lab = function(xyz) {
        var x = xyz[0];
        var y = xyz[1];
        var z = xyz[2];

        x /= 95.047;
        y /= 100;
        z /= 108.883;

        x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116);
        y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116);
        z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116);

        var l = (116 * y) - 16;
        var a = 500 * (x - y);
        var b = 200 * (y - z);

        return {l:l, a:a, b:b};
    }

    var hex_to_lab = function(hexString) {
        var rgb = hex_to_rgb(hexString);
        var xyz = rgb_to_xyz(rgb);
        return xyz_to_lab(xyz);
    }

    var labDifference = function(lab1, lab2){
        // Using CIE94 algorithm
        var deltaL = lab1.l - lab2.l;
        var deltaA = lab1.a - lab2.a;
        var deltaB = lab1.b - lab2.b;

        var c1 = Math.sqrt(Math.pow(lab1.a, 2) + Math.pow(lab1.b, 2));
        var c2 = Math.sqrt(Math.pow(lab2.a, 2) + Math.pow(lab2.b, 2));
        var deltaC = c1 - c2;
        var deltaH = Math.pow(deltaA, 2) + Math.pow(deltaB, 2) - Math.pow(deltaC, 2);
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

        var sl =  1.0;
        var kc =  1.0;
        var kh =  1.0;

        var kl =  1.0;
        var k1 = .045;
        var k2 = .015;

        var sc = 1.0 + (k1 * c1);
        var sh = 1.0 + (k2 * c1);

        var i = Math.pow(deltaL/(kl*sl), 2) +
                Math.pow(deltaC/(kc*sc), 2) +
                Math.pow(deltaH/(kh*sh), 2);

        var difference = i < 0 ? 0 : Math.sqrt(i);

        return difference;
    }

    var hexColor = shade(int_to_rgba(hash(str)), 40);
    var lab = hex_to_lab(hexColor);

    if (options && options.colors) {
        var labColors = options.colors.map(hex_to_lab);
        var differences = labColors.map(function(x){return labDifference(lab, x)});
        var banned = differences.reduce(function(a,b){return a ? a : b <= options.range}, false);
        return banned ? string_to_color(str + ' ', options) : hexColor; 
    } else {
        return hexColor;
    }
}
