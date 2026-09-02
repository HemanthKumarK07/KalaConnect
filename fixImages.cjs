const fs = require('fs');

const dataFile = './src/data/products.js';
let content = fs.readFileSync(dataFile, 'utf-8');

const lines = content.split('\n');
let currentTitle = '';

for (let i = 0; i < lines.length; i++) {
    const titleMatch = lines[i].match(/title:\s*'([^']+)'/);
    if (titleMatch) {
        currentTitle = titleMatch[1];
    }
    
    if (lines[i].includes('images: [],') && currentTitle) {
        lines[i] = lines[i].replace('images: [],', `images: ['/kala photos/${currentTitle}.jpg'],`);
        currentTitle = ''; 
    }
}

fs.writeFileSync(dataFile, lines.join('\n'));
console.log('Fixed images in src/data/products.js');
