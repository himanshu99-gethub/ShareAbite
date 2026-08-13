import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let files = [];
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (item !== 'node_modules' && item !== '.git') {
                files = files.concat(walkDir(fullPath));
            }
        } else {
            if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.css') || fullPath.endsWith('.json') || fullPath.endsWith('.html')) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

const files = walkDir('h:/NGO project');
let count = 0;

for (const file of files) {
    const original = fs.readFileSync(file, 'utf-8');
    let updated = original.replace(/FoodBridge/g, 'ShareABite');
    updated = updated.replace(/foodbridge/g, 'shareabite');
    
    if (original !== updated) {
        fs.writeFileSync(file, updated, 'utf-8');
        console.log(`Updated: ${file}`);
        count++;
    }
}

console.log(`Total files updated: ${count}`);
