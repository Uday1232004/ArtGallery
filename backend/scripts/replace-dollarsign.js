const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('DollarSign')) {
        content = content.replace(/DollarSign/g, 'IndianRupee');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated DollarSign in:', fullPath);
      }
    }
  }
}

const frontendSrcPath = path.join(__dirname, '../../frontend/src');
processDir(frontendSrcPath);
console.log('Done replacing DollarSign with IndianRupee');
