/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
const { execSync } = require('child_process');

async function main() {
  // 1. Check if Next.js build exists
  const nextDir = path.join(process.cwd(), '.next');
  if (!fs.existsSync(nextDir)) {
    console.log('Production build not found. Running "npm run build" automatically...');
    try {
      execSync('npm run build', { stdio: 'inherit' });
    } catch (error) {
      console.error('Failed to build the application.');
      process.exit(1);
    }
  }

  // 2. Auto-generate SSL certificates
  const certDir = path.join(process.cwd(), 'certs');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');

  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }

  if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.log('Generating self-signed certificates...');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    
    // In newer versions of selfsigned, generate returns a Promise
    const pems = await selfsigned.generate(attrs, { days: 365 });
    
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);
    console.log('Certificates generated successfully.');
  }
}

main().catch(err => {
  console.error('Prestart check failed:', err);
  process.exit(1);
});
