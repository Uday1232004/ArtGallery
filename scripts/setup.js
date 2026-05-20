const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 🎨 Color Logging Helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTitle(message) {
  console.log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}\n`);
}

// Helper to run commands synchronously and inherit stdio
function runCommand(command, cwd) {
  log(colors.blue, `🏃 Running: "${command}" in ${cwd || 'root'}`);
  try {
    execSync(command, { cwd, stdio: 'inherit' });
    log(colors.green, `✓ Command completed successfully.\n`);
  } catch (error) {
    log(colors.red, `❌ Error executing: "${command}"`);
    console.error(error.message);
    process.exit(1);
  }
}

// 🚀 Main Setup Function
function main() {
  logTitle('🎨 Starting ArtBro Sketches DBMS Auto-Setup');

  const rootDir = path.resolve(__dirname, '..');
  const backendDir = path.join(rootDir, 'backend');
  const frontendDir = path.join(rootDir, 'frontend');

  // 1. Check/Provision Environment Files
  logTitle('📁 Step 1: Provisioning Environment Files');
  
  const backendEnv = path.join(backendDir, '.env');
  const backendEnvExample = path.join(backendDir, '.env.example');
  if (!fs.existsSync(backendEnv)) {
    log(colors.yellow, `⚠️ backend/.env does not exist. Auto-copying from .env.example...`);
    fs.copyFileSync(backendEnvExample, backendEnv);
    log(colors.green, `✓ Successfully created backend/.env`);
  } else {
    log(colors.green, `✓ backend/.env already exists.`);
  }

  const frontendEnv = path.join(frontendDir, '.env');
  const frontendEnvExample = path.join(frontendDir, '.env.example');
  if (!fs.existsSync(frontendEnv)) {
    log(colors.yellow, `⚠️ frontend/.env does not exist. Auto-copying from .env.example...`);
    fs.copyFileSync(frontendEnvExample, frontendEnv);
    log(colors.green, `✓ Successfully created frontend/.env`);
  } else {
    log(colors.green, `✓ frontend/.env already exists.`);
  }

  // 2. Install Project Dependencies
  logTitle('📦 Step 2: Installing Node Dependencies');
  
  log(colors.yellow, '🔧 Installing root tools...');
  runCommand('npm install', rootDir);

  log(colors.yellow, '🔧 Installing backend API packages...');
  runCommand('npm install', backendDir);

  log(colors.yellow, '🔧 Installing React frontend modules...');
  runCommand('npm install', frontendDir);

  // 3. Database Schema Push & Generate Client
  logTitle('💾 Step 3: Preparing Database Schema (MySQL + Prisma)');
  
  log(colors.yellow, '⚡ Pushing Prisma schema models to your MySQL Database...');
  runCommand('npx prisma db push', backendDir);

  log(colors.yellow, '⚙️ Generating Prisma client models...');
  runCommand('npx prisma generate', backendDir);

  // 4. Seed Database with Artworks & Admin Account
  logTitle('🌱 Step 4: Seeding Database with Mock Catalog');
  
  log(colors.yellow, '🌾 Running database seeder...');
  runCommand('npx prisma db seed', backendDir);

  // 5. Consolidate Artist Profiles & Artworks
  logTitle('🔮 Step 5: Consolidating Artist Profiles & Artwork Permissions');
  
  log(colors.yellow, '🔗 Linking seeded catalog to your primary Google Admin account...');
  runCommand('node prisma/consolidate.js', backendDir);

  logTitle('🎉 Setup Completed Successfully!');
  console.log(`${colors.bright}${colors.green}ArtBro Sketches is ready for action!${colors.reset}`);
  console.log(`\nTo launch the system:`);
  console.log(`${colors.yellow}  npm run dev${colors.reset}\n`);
}

main();
