// Script para verificar la paleta de colores
// Uso: node src/assets/colors/verify-colors.js

const fs = require('fs');
const path = require('path');

// Función para eliminar comentarios de JSONC
function stripJsonComments(jsonString) {
  return jsonString.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

// Validar formato hexadecimal
function isValidHex(color) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Convertir hex a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calcular luminancia relativa
function getLuminance(rgb) {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calcular ratio de contraste
function getContrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

// Verificar paleta
function verifyPalette(palette) {
  const issues = [];
  const allColors = [];
  
  // Recopilar todos los colores
  Object.entries(palette).forEach(([category, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, color]) => {
        allColors.push({ category, shade, color, name: `${category}-${shade}` });
        
        // Validar formato
        if (!isValidHex(color)) {
          issues.push(`❌ Color inválido: ${category}-${shade} = ${color}`);
        }
      });
    }
  });
  
  // Detectar duplicados
  const colorMap = new Map();
  allColors.forEach(({ name, color }) => {
    if (colorMap.has(color)) {
      issues.push(`⚠️  Color duplicado: ${name} y ${colorMap.get(color)} usan ${color}`);
    } else {
      colorMap.set(color, name);
    }
  });
  
  // Verificar contraste entre purple-plum y gray-white (blanco)
  const primaryColor = palette.purple?.['plum'];
  const whiteColor = palette.gray?.['white'];
  
  if (primaryColor && whiteColor) {
    const contrast = getContrastRatio(primaryColor, whiteColor);
    if (contrast < 4.5) {
      issues.push(`⚠️  Contraste insuficiente entre purple-plum y white: ${contrast.toFixed(2)} (mínimo 4.5 para WCAG AA)`);
    } else {
      console.log(`✅ Contraste purple-plum/white: ${contrast.toFixed(2)} (WCAG AA cumplido)`);
    }
  }
  
  return { issues, totalColors: allColors.length };
}

try {
  // Leer archivo JSONC
  const paletteFile = path.join(__dirname, 'palette.jsonc');
  const jsonContent = fs.readFileSync(paletteFile, 'utf8');
  const cleanJson = stripJsonComments(jsonContent);
  const palette = JSON.parse(cleanJson);
  
  // Verificar paleta
  const { issues, totalColors } = verifyPalette(palette);
  
  console.log(`\n🎨 Verificación de paleta de colores`);
  console.log(`📊 Total de colores: ${totalColors}`);
  console.log(`📂 Categorías: ${Object.keys(palette).join(', ')}`);
  
  if (issues.length === 0) {
    console.log('\n✅ ¡Paleta verificada sin problemas!');
  } else {
    console.log('\n⚠️  Problemas encontrados:');
    issues.forEach(issue => console.log(`   ${issue}`));
  }
  
} catch (error) {
  console.error('❌ Error al verificar paleta:', error.message);
  process.exit(1);
}