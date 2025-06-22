// Script para generar CSS con variables --var desde palette.jsonc
// Uso: node src/assets/colors/generate-css.js

const fs = require('fs');
const path = require('path');

// Función para eliminar comentarios de JSONC
function stripJsonComments(jsonString) {
  return jsonString.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

// Función para generar variables CSS
function generateCSSVariables(palette) {
  let cssContent = '/* Variables CSS generadas automáticamente desde palette.jsonc */\n';
  cssContent += '/* No editar manualmente - usar generate-css.js */\n\n';
  cssContent += ':root {\n';
  
  // Procesar cada categoría de colores
  Object.entries(palette).forEach(([category, colors]) => {
    cssContent += `\n  /* ${category.charAt(0).toUpperCase() + category.slice(1)} colors */\n`;
    
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, color]) => {
        const varName = `--color-${category}-${shade}`;
        cssContent += `  ${varName}: ${color};\n`;
      });
    }
  });
  
  cssContent += '}\n';
  return cssContent;
}

try {
  // Rutas de archivos
  const paletteFile = path.join(__dirname, 'palette.jsonc');
  const outputFile = path.join(__dirname, '../../styles/variables.css');
  
  // Leer archivo JSONC
  const jsonContent = fs.readFileSync(paletteFile, 'utf8');
  const cleanJson = stripJsonComments(jsonContent);
  const palette = JSON.parse(cleanJson);
  
  // Generar CSS
  const cssContent = generateCSSVariables(palette);
  
  // Escribir archivo CSS
  fs.writeFileSync(outputFile, cssContent);
  
  console.log('✅ Variables CSS generadas exitosamente en:', outputFile);
  console.log('📊 Categorías procesadas:', Object.keys(palette).join(', '));
  
} catch (error) {
  console.error('❌ Error al generar variables CSS:', error.message);
  process.exit(1);
}