/**
 * Script para copiar los assets de @3d-dice/dice-box a public/assets
 * Se ejecuta automáticamente durante npm install (postinstall)
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'node_modules', '@3d-dice', 'dice-box', 'dist', 'assets');
const targetDir = path.join(__dirname, '..', 'public', 'assets');

function copyRecursive(src, dest) {
  // Verificar si existe el directorio fuente
  if (!fs.existsSync(src)) {
    console.log('[dice-assets] Source directory not found:', src);
    return;
  }

  // Crear directorio destino si no existe
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log('[dice-assets] Copying dice-box assets to public/assets...');
  copyRecursive(sourceDir, targetDir);
  console.log('[dice-assets] Done!');
} catch (error) {
  console.error('[dice-assets] Error copying assets:', error.message);
  // No fallar el build si los assets ya existen o no se pueden copiar
  process.exit(0);
}
