// Save this as: scripts/copy_pyodide.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Locate Source in node_modules
let sourceDir;
try {
    sourceDir = path.dirname(require.resolve('pyodide/package.json'));
} catch (e) {
    console.error("❌ Error: Could not resolve 'pyodide'. Run 'npm install pyodide'");
    process.exit(1);
}

// 2. Destination: public/pyodide
const destDir = path.join(__dirname, '../public/pyodide');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// 3. COMPLETE File List
const filesToCopy = [
    'pyodide.js',
    'pyodide.asm.js',
    'pyodide.asm.wasm',
    'package.json',
    'python_stdlib.zip', 
    'pyodide-lock.json' 
];

console.log(`📂 Copying Pyodide from: ${sourceDir}`);

filesToCopy.forEach(file => {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`   ✅ Copied ${file}`);
    } else {
        // Only warn for files that strictly should exist
        if (file !== 'python_stdlib.zip') { 
            console.warn(`   ⚠️ Warning: Could not find ${file}`);
        }
    }
});

console.log("🎉 Pyodide setup complete.");