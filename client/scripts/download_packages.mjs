// scripts/download_packages.mjs
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYODIDE_DIR = path.join(__dirname, '../public/pyodide');
const LOCK_FILE = path.join(PYODIDE_DIR, 'pyodide-lock.json');

// The list of packages we strictly need for Data Analysis
const PACKAGES_TO_SYNC = [
    'pandas',
    'numpy',
    'micropip', 
    'python-dateutil',
    'pytz',
    'six',
    'packaging'
];

async function main() {
    console.log("🔍 Reading pyodide-lock.json...");
    
    if (!fs.existsSync(LOCK_FILE)) {
        console.error("❌ Error: pyodide-lock.json not found in public/pyodide.");
        console.error("   Please run the previous 'copy_pyodide.mjs' script first.");
        process.exit(1);
    }

    const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
    const packages = lockData.packages;
    
    console.log(`📦 Found ${Object.keys(packages).length} packages in lock file.`);
    console.log(`⬇️  Syncing required data science packages...`);

    for (const pkgName of PACKAGES_TO_SYNC) {
        if (!packages[pkgName]) {
            console.warn(`⚠️  Warning: ${pkgName} not found in lock file.`);
            continue;
        }

        const pkgInfo = packages[pkgName];
        // The lock file usually contains just the filename, e.g., "pandas-2.0.3...whl"
        const fileName = pkgInfo.file_name; 
        const destPath = path.join(PYODIDE_DIR, fileName);

        // Skip if already exists
        if (fs.existsSync(destPath)) {
            console.log(`✅ ${fileName} already exists.`);
            continue;
        }

        // Construct URL. We use the official Pyodide CDN that matches your version
        // We can usually derive the base URL from the Pyodide version, 
        // BUT it's safer to use the standard Pyodide CDN structure.
        // We'll try to guess the version from the lock file info or default to recent.
        
        // Strategy: Use the integrity hash to ensure we get the right file? 
        // Simpler: Just try fetching from the official CDN based on the filename.
        // Most Pyodide versions follow: https://cdn.jsdelivr.net/pyodide/v{VERSION}/full/{FILENAME}
        
        // Let's assume the user is on a compatible version. 
        // Since we can't easily guess the remote URL from just the filename (without version),
        // we will fetch it from the standard "dev" or "stable" CDN depending on filename structure.
        
        // However, since you installed via npm, let's try to copy from node_modules FIRST?
        // No, npm package doesn't have the wheels.
        
        // Let's use the version from package.json in public/pyodide
        const pkgJson = JSON.parse(fs.readFileSync(path.join(PYODIDE_DIR, 'package.json'), 'utf8'));
        const version = pkgJson.version;
        
        const url = `https://cdn.jsdelivr.net/pyodide/v${version}/full/${fileName}`;

        await downloadFile(url, destPath);
    }
    
    console.log("\n🎉 Data Science packages installed locally!");
}

function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        console.log(`   Downloading ${path.basename(destPath)}...`);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs.unlinkSync(destPath); // Delete partial
                reject(new Error(`Failed to download ${url} (Status: ${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlinkSync(destPath);
            reject(err);
        });
    });
}

main().catch(err => console.error("❌ Fatal Error:", err.message));