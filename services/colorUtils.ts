
// --- Basic Types ---
type HSL = { h: number; s: number; l: number };
type RGB = { r: number; g: number; b: number };

// --- HEX <-> HSL Conversion ---

export const hexToHSL = (hex: string): HSL => {
  const { r, g, b } = hexToRgb(hex); // Reuse helper
  const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255;
  
  const cmin = Math.min(rNorm, gNorm, bNorm), cmax = Math.max(rNorm, gNorm, bNorm), delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) h = 0;
  else if (cmax === rNorm) h = ((gNorm - bNorm) / delta) % 6;
  else if (cmax === gNorm) h = (bNorm - rNorm) / delta + 2;
  else h = (rNorm - gNorm) / delta + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return { h, s, l };
};

export const hslToHex = ({ h, s, l }: HSL): string => {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

// --- RGB Helpers ---

const hexToRgb = (hex: string): RGB => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  return { r, g, b };
};

const getColorDistance = (rgb1: RGB, rgb2: RGB) => {
    return Math.sqrt(
        Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );
};

// --- Existing Helpers ---

export const generateRandomHex = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

export const getContrastColor = (hex: string): string => {
  const { r, g, b } = hexToRgb(hex);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};

export const getLuminance = (hex: string): number => {
  const rgb = hexToHSL(hex).l; // Approximate but fast reuse
  return rgb; 
};

// Improved naming heuristic
export const getColorName = (hex: string): string => {
  const { h, s, l } = hexToHSL(hex);
  
  if (l < 10) return "Void Black";
  if (l > 90) return "Pure White";
  if (s < 10) return "Neutral Grey";

  if (h < 15) return "Crimson Red";
  if (h < 45) return "Sunset Orange";
  if (h < 70) return "Golden Yellow";
  if (h < 150) return "Forest Green";
  if (h < 190) return "Teal Ocean";
  if (h < 250) return "Royal Blue";
  if (h < 290) return "Deep Purple";
  if (h < 330) return "Hot Pink";
  return "Wild Berry";
};

export const generateInitialPalette = (count: number): { hex: string, name: string }[] => {
  return Array.from({ length: count }).map(() => {
    const hex = generateRandomHex();
    return { hex, name: getColorName(hex) };
  });
};

// --- Harmony Algorithms ---

export const generateHarmoniousColors = (baseHex: string, mode: string, count: number): string[] => {
  const baseHSL = hexToHSL(baseHex);
  const colors: string[] = [baseHex];

  for (let i = 1; i < count; i++) {
    let newHSL: HSL = { ...baseHSL };

    switch (mode) {
      case 'Analogous':
        // +/- 30 degrees
        newHSL.h = (baseHSL.h + (i * 30 * (i % 2 === 0 ? 1 : -1))) % 360;
        if (newHSL.h < 0) newHSL.h += 360;
        // Add slight variation to S/L for realism
        newHSL.s = Math.max(10, Math.min(100, baseHSL.s + (Math.random() * 20 - 10)));
        break;
      
      case 'Monochromatic':
        // Same Hue, vary Saturation and Lightness significantly
        newHSL.s = Math.max(20, Math.min(100, Math.random() * 100));
        newHSL.l = Math.max(10, Math.min(90, Math.random() * 100));
        break;

      case 'Triadic':
        // +120 degrees
        newHSL.h = (baseHSL.h + (i * 120)) % 360;
        break;

      case 'Complementary':
        if (i === 1) {
           newHSL.h = (baseHSL.h + 180) % 360;
        } else {
           // For extra colors in complementary mode, generate shades of base or comp
           const targetH = (i % 2 === 0) ? baseHSL.h : (baseHSL.h + 180) % 360;
           newHSL.h = targetH;
           newHSL.l = Math.max(20, Math.min(80, Math.random() * 100));
        }
        break;

      default: // Random
        colors.push(generateRandomHex());
        continue;
    }
    colors.push(hslToHex(newHSL));
  }
  
  // Shuffle result except the first one (base) to make it look organic, 
  // unless it's monochromatic which looks better ordered.
  if (mode !== 'Monochromatic') {
      return [colors[0], ...colors.slice(1).sort(() => Math.random() - 0.5)];
  }
  return colors.sort((a, b) => getLuminance(b) - getLuminance(a));
};

// --- Image Extraction ---

export const extractColorsFromImage = async (imageSrc: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("No Context");

      // Resize to a reasonable size for analysis
      const size = 150;
      canvas.width = size;
      canvas.height = size;
      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size).data;
      const colorCounts: Record<string, number> = {};

      // 1. Quantize and Count
      // Rounding to nearest 5 creates buckets of similar colors
      const quantization = 5; 
      
      for (let i = 0; i < imageData.length; i += 4) {
        const alpha = imageData[i + 3];
        if (alpha < 128) continue; // Skip transparent

        const r = Math.round(imageData[i] / quantization) * quantization;
        const g = Math.round(imageData[i + 1] / quantization) * quantization;
        const b = Math.round(imageData[i + 2] / quantization) * quantization;
        
        // Convert back to Hex for map key
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      // 2. Sort by frequency
      const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

      // 3. Select distinct colors (Distance heuristic)
      const palette: string[] = [];
      // Minimum Euclidean distance to be considered "distinct" (Max distance in RGB is ~441)
      let minDistance = 45; 

      // Always take the dominant color first
      if (sortedColors.length > 0) {
          palette.push(sortedColors[0]);
      }

      // Iterative pass to find distinct colors
      let attempts = 0;
      while (palette.length < 5 && attempts < 3) {
          for (const color of sortedColors) {
              if (palette.length >= 5) break;
              if (palette.includes(color)) continue;

              const rgb1 = hexToRgb(color);
              const isDistinct = palette.every(p => {
                  const rgb2 = hexToRgb(p);
                  return getColorDistance(rgb1, rgb2) > minDistance;
              });

              if (isDistinct) {
                  palette.push(color);
              }
          }
          // If we didn't find enough, lower the bar
          minDistance /= 2;
          attempts++;
      }

      // 4. Fallback: If still not enough, just fill with next most frequent
      if (palette.length < 5) {
          for (const color of sortedColors) {
              if (palette.length >= 5) break;
              if (!palette.includes(color)) {
                  palette.push(color);
              }
          }
      }
      
      resolve(palette.slice(0, 5));
    };
    img.onerror = reject;
  });
};
