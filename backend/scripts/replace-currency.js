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
      let modified = false;

      // >$ -> >₹
      if (/>\$/g.test(content)) {
        content = content.replace(/>\$/g, '>₹');
        modified = true;
      }
      
      // $${ -> ₹${
      if (/\$\$\{/g.test(content)) {
        content = content.replace(/\$\$\{/g, '₹${');
        modified = true;
      }
      
      // prefix: '$' -> prefix: '₹'
      if (/prefix:\s*'\$'/g.test(content)) {
        content = content.replace(/prefix:\s*'\$'/g, "prefix: '₹'");
        modified = true;
      }
      
      // $100.00 -> ₹100.00
      if (/\$100\.00/g.test(content)) {
        content = content.replace(/\$100\.00/g, '₹100.00');
        modified = true;
      }
      
      // • $ -> • ₹
      if (/• \$/g.test(content)) {
        content = content.replace(/• \$/g, '• ₹');
        modified = true;
      }
      
      // of $ -> of ₹
      if (/of \$/g.test(content)) {
        content = content.replace(/of \$/g, 'of ₹');
        modified = true;
      }
      
      // >$</ -> >₹</
      if (/>\$<\//g.test(content)) {
        content = content.replace(/>\$<\//g, '>₹</');
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

const frontendSrcPath = path.join(__dirname, '../../frontend/src');
console.log('Scanning:', frontendSrcPath);
processDir(frontendSrcPath);
console.log('Done replacing currency symbols in frontend.');
