// Cross-platform post-build script
// Copies .next/static and public into .next/standalone
// Works on Windows, macOS, and Linux (no shell commands needed)

const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  [WARN] Source not found: ${src}`);
    return false;
  }
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
      count++;
    }
  }
  return count;
}

console.log('');
console.log('=== Post-build: Copying static files to standalone ===');
console.log('');

// Ensure standalone exists
const standaloneDir = path.join('.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  console.error(`  [ERROR] Standalone dir not found: ${standaloneDir}`);
  console.error('  Make sure next.config.ts has: output: "standalone"');
  process.exit(1);
}

// Copy .next/static -> .next/standalone/.next/static
const staticSrc = path.join('.next', 'static');
const staticDest = path.join('.next', 'standalone', '.next', 'static');
const staticCount = copyDir(staticSrc, staticDest);
console.log(`  [OK] Copied ${staticCount} files: .next/static -> standalone/.next/static`);

// Copy public -> .next/standalone/public
const publicSrc = 'public';
const publicDest = path.join('.next', 'standalone', 'public');
const publicCount = copyDir(publicSrc, publicDest);
console.log(`  [OK] Copied ${publicCount} files: public -> standalone/public`);

console.log('');
console.log('=== Post-build complete ===');
console.log('');
