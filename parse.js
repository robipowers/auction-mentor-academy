const fs = require('fs');
const content = fs.readFileSync('data.js', 'utf8');
// remove DOM related code if any at the bottom of data.js to avoid errors in node
const dataOnly = content.split('// ============================================================')[0] + content.split('// ============================================================')[1] + content.split('// ============================================================')[2];

try {
    eval(dataOnly);
    SECTIONS.forEach(s => {
        console.log(`Module ${s.id}: ${s.title} (youtubeId: ${(s.youtubeId || null)}, youtubeId2: ${(s.youtubeId2 || null)})`);
    });
} catch (e) { /* fallback if evaling data fails because of missing window */
    eval(content.substring(0, content.indexOf('var QUIZZES')));
    SECTIONS.forEach(s => {
        console.log(`Module ${s.id}: ${s.title} (youtubeId: ${(s.youtubeId || null)}, youtubeId2: ${(s.youtubeId2 || null)})`);
    });
}
