#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const targetDir = path.join(process.cwd(), 'keysmash-server');

async function main() {
  console.log('\n🗝️  Welcome to Key Smash Server\n');

  if (!fs.existsSync(targetDir)) {
    console.log('Initializing a new Key Smash server at:', targetDir);
    console.log('Cloning repository...');
    try {
      execSync(`git clone https://github.com/varmankur/generic-feedback-app.git keysmash-server`, { stdio: 'inherit' });
      
      console.log('Installing dependencies...');
      execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
      
      console.log('Setting up default database...');
      execSync('npx prisma db push && npx prisma generate', { cwd: targetDir, stdio: 'inherit' });
      
      console.log('Copying environment variables...');
      fs.copyFileSync(path.join(targetDir, '.env.example'), path.join(targetDir, '.env'));
      
    } catch (e) {
      console.error('Failed to initialize Key Smash. Ensure git and npm are installed.');
      process.exit(1);
    }
  } else {
    console.log('Key Smash server found at:', targetDir);
  }

  console.log('\n🚀 Starting the Key Smash Daemon...\n');
  try {
    execSync('npm run start:https', { cwd: targetDir, stdio: 'inherit' });
  } catch (e) {
    console.log('\nKey Smash stopped.');
  }
}

main();
