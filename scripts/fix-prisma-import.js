const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../app/generated/prisma/index.ts');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  const originalContent = content;
  
  content = content.replace(
    /export \* from ['"]\.\/client(\.(js|ts))?['"]/g,
    "export * from './client'"
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Fixed Prisma index.ts import for TypeScript/Turbopack compatibility');
  }
}
