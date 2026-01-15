import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Locate Source
let sourceDir;
try {
    sourceDir = path.dirname(require.resolve('pyodide/package.json'));
} catch (e) {
    console.error("❌ Error: Could not resolve 'pyodide'.");
    process.exit(1);
}

// 2. Define Destination
const destDir = path.join(__dirname, '../public/pyodide');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

// 3. Updated File List (Supports newer Pyodide versions)
const filesToCopy = [
    'pyodide.js',
    'pyodide.asm.js',
    'pyodide.asm.wasm',
    'package.json',
    // Check for both legacy (.tar) and modern (.zip) stdlib files
    'pyodide_py.tar', 
    'python_stdlib.zip' 
];

console.log(`Copying Pyodide files...`);

filesToCopy.forEach(file => {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`   ✅ Copied ${file}`);
    } 
    // Only warn if it's NOT one of the conditional files
    else if (file !== 'pyodide_py.tar' && file !== 'python_stdlib.zip') {
        console.warn(`   ⚠️ Warning: Could not find ${file}`);
    }
});

console.log("Pyodide setup complete.");