import { SECTIONS } from './data.js';
SECTIONS.forEach(s => {
    console.log(`Module ${s.id}: ${s.title} (youtubeId: ${s.youtubeId || 'MISSING'})`);
});
