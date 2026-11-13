const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Chuẩn hóa chữ hoa ổ đĩa trên Windows (ví dụ: d:\ -> D:\)
// Tránh lỗi Webpack duplicate modules & ChunkLoadError timeout trên Next.js 14
const realCwd = fs.realpathSync.native(process.cwd());
if (process.cwd() !== realCwd) {
  process.chdir(realCwd);
}

const args = process.argv.slice(2);
const command = args[0] || 'dev';
const forceClean = args.includes('--clean');
const nextArgs = args.filter((a) => a !== '--clean');

const nextDir = path.join(realCwd, '.next');
const buildIdFile = path.join(nextDir, 'BUILD_ID');

if (forceClean && fs.existsSync(nextDir)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('[OceanEA] Cleaned .next cache directory.');
  } catch (err) {
    console.warn('[OceanEA] Could not fully clean .next (another process may be running):', err.message);
  }
} else if (command === 'dev' && fs.existsSync(buildIdFile)) {
  try {
    const buildId = fs.readFileSync(buildIdFile, 'utf8').trim();
    if (buildId !== 'development') {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('[OceanEA] Removed stale production .next build before starting dev server.');
    }
  } catch {
    // ignore
  }
}

const nextBin = path.join(realCwd, 'node_modules', 'next', 'dist', 'bin', 'next');
const child = spawn(process.execPath, [nextBin, ...nextArgs], {
  cwd: realCwd,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

