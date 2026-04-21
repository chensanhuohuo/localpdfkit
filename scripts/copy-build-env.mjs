import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, '.env.production');
const distDir = path.join(rootDir, 'dist');
const targetPath = path.join(distDir, '.env.production');

if (!fs.existsSync(sourcePath)) {
  console.warn('[build-env] .env.production not found, skipping copy.');
  process.exit(0);
}

if (!fs.existsSync(distDir)) {
  console.warn('[build-env] dist directory not found, skipping copy.');
  process.exit(0);
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`[build-env] Copied ${sourcePath} -> ${targetPath}`);
