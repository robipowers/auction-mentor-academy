const fs = require('fs');
const content = fs.readFileSync('data.js', 'utf8');
const dataPrefix = content.substring(0, content.indexOf('var QUIZZES'));
eval(dataPrefix);

let output = '';
[11, 12].forEach(id => {
    const mod = SECTIONS.find(s => s.id === id);
    if (mod) {
        output += `## Module ${mod.id}: ${mod.title}\n`;
        output += `**Description:** ${mod.desc}\n\n`;
        mod.chapters.forEach(ch => {
            output += `### ${ch.title}\n`;
            let text = ch.content.replace(/<\/p>/g, '\n\n').replace(/<p>/g, '');
            text = text.replace(/<div class="concept-block"><div class="concept-block-title">/g, '#### ');
            text = text.replace(/<\/div>/g, '\n');
            text = text.replace(/<br\s*\/?>/g, '\n');
            text = text.replace(/<[^>]+>/g, ''); // strip remaining html
            output += text + '\n\n';
        });
    }
});

fs.writeFileSync('temp_extracted.txt', output);
console.log(output.substring(0, 500) + '... (truncated)');
