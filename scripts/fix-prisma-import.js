const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../app/generated/prisma/index.ts');

if (fs.existsSync(indexPath)) {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  if (content.includes("export * from './client'") || content.includes("export * from './client.js'")) {
    content = content.replace(/export \* from ['"]\.\/client(\.js)?['"]/, "export * from './client.ts'");
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log('Fixed Prisma index.ts import for Turbopack compatibility');
  }
}
