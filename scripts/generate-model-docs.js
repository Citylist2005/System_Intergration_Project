const fs = require('fs');
const path = require('path');

const srcDir = path.join('d:', 'CMU-CS-445', 'Source', 'backend', 'src', 'database');
const docsDir = path.join('d:', 'CMU-CS-445', 'Source', 'docs', 'models');

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

function findEntities(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findEntities(fullPath, fileList);
    } else if (fullPath.endsWith('.entity.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const entityFiles = findEntities(srcDir);

for (const file of entityFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const classNameMatch = content.match(/export class (\w+)/);
  if (!classNameMatch) continue;
  const className = classNameMatch[1];
  
  const tableNameMatch = content.match(/@Entity\(['"]([^'"]+)['"]\)/);
  const tableName = tableNameMatch ? tableNameMatch[1] : className.toLowerCase();
  
  const mdPath = path.join(docsDir, className + '.md');
  
  let mdContent = '# Model: ' + className + '\n\n';
  mdContent += '- **Table Name:** `' + tableName + '`\n';
  mdContent += '- **Source File:** `' + file.replace(/\\/g, '/') + '`\n\n';
  mdContent += '## Description\n\n';
  mdContent += 'TypeORM entity representing the `' + tableName + '` table.\n\n';
  mdContent += '## Properties\n\n';
  
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('@Column') || line.includes('@PrimaryColumn') || line.includes('@PrimaryGeneratedColumn')) {
       let j = i + 1;
       while (j < lines.length && (lines[j].trim().startsWith('@') || lines[j].trim() === '')) {
         j++;
       }
       if (j < lines.length) {
         let propLine = lines[j].trim().replace(';', '');
         mdContent += '- `' + propLine + '`: Defined with decorators `' + line + '`\n';
       }
    }
  }
  
  fs.writeFileSync(mdPath, mdContent);
  console.log('Created ' + mdPath);
}
