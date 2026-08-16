const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const certDir = path.join(process.cwd(), 'certs');
const keyPath = path.join(certDir, 'key.pem');
const certPath = path.join(certDir, 'cert.pem');

async function generate() {
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
  } else {
    console.log('Certificates already exist. Skipping generation.');
  }
}

generate().catch(err => {
  console.error('Failed to generate certificates:', err);
  process.exit(1);
});
