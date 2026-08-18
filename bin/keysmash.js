#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const sourceDir = path.join(__dirname, '..');
const targetDir = path.join(process.cwd(), 'keysmash-server');

async function main() {
  console.log('\n🗝️  Welcome to Key Smash Server\n');

  if (!fs.existsSync(targetDir)) {
    console.log('Initializing a new proprietary Key Smash server at:', targetDir);
    fs.mkdirSync(targetDir, { recursive: true });
    
    console.log('Unpacking secure binaries...');
    const foldersToCopy = ['.next', 'public', 'prisma', 'scripts'];
    const filesToCopy = ['package.json', 'server.js', 'next.config.ts', 'tsconfig.json'];

    foldersToCopy.forEach(folder => {
      const srcPath = path.join(sourceDir, folder);
      if (fs.existsSync(srcPath)) {
        fs.cpSync(srcPath, path.join(targetDir, folder), { recursive: true });
      }
    });

    filesToCopy.forEach(file => {
      const srcPath = path.join(sourceDir, file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(targetDir, file));
      }
    });

    // Create a default .env
    const defaultEnv = `DATABASE_URL="file:./dev.db"\nJWT_SECRET="tcs-super-secret-production-key-2026"\nDAIMON_PASSWORD="daimon_admin_setup"\n`;
    fs.writeFileSync(path.join(targetDir, '.env'), defaultEnv);

    console.log('Optimizing platform dependencies...');
    try {
      // Install production deps to ensure local Prisma engines compile for this specific machine
      execSync('npm install --omit=dev', { cwd: targetDir, stdio: 'inherit' });
      
      console.log('Initializing local database...');
      execSync('npx prisma db push && npx prisma generate', { cwd: targetDir, stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to initialize Key Smash dependencies. Ensure npm is installed.');
      process.exit(1);
    }
  } else {
    console.log('Key Smash server found at:', targetDir);
  }

  console.log('\n🚀 Booting up Key Smash Daemon...\n');
  try {
    execSync('npm run start:https', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.log('\nKey Smash stopped.');
  }
}

main();
