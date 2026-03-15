const { SECTIONS } = require('./data.js');
SECTIONS.forEach(s => {
    console.log(`Module ${s.id}: ${s.title} (youtubeId: ${(s.youtubeId || null)}, youtubeId2: ${(s.youtubeId2 || null)})`);
});
