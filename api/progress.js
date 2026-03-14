// Auction Mentor: Progress Tracking API
// GET /api/progress - Load user's progress
// POST /api/progress - Save chapter completion or quiz score

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function parseCookies(str) {
    const obj = {};
    if (!str) return obj;
    str.split(';').forEach(pair => {
        const idx = pair.indexOf('=');
        if (idx < 0) return;
        obj[pair.substring(0, idx).trim()] = pair.substring(idx + 1).trim();
    });
    return obj;
}

async function getUserFromSession(req) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionRaw = cookies.am_session;

    if (!sessionRaw) return null;

    try {
        const session = JSON.parse(decodeURIComponent(sessionRaw));
        if (!session.sid || !session.uid) return null;

        // Verify session is still valid
        const { data: activeSession } = await supabase
            .from('active_sessions')
            .select('id, user_id, expires_at')
            .eq('session_id', session.sid)
            .single();

        if (!activeSession) return null;
        if (new Date(activeSession.expires_at) < new Date()) return null;

        return { userId: activeSession.user_id };
    } catch (e) {
        return null;
    }
}

export default async function handler(req, res) {
    const user = await getUserFromSession(req);

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // GET: Load progress
    if (req.method === 'GET') {
        try {
            const [chaptersRes, scoresRes] = await Promise.all([
                supabase
                    .from('user_progress')
                    .select('section_id, chapter_idx')
                    .eq('user_id', user.userId),
                supabase
                    .from('quiz_scores')
                    .select('section_id, score, passed')
                    .eq('user_id', user.userId)
            ]);

            return res.status(200).json({
                chapters: chaptersRes.data || [],
                scores: scoresRes.data || []
            });

        } catch (err) {
            console.error('Progress load error:', err);
            return res.status(500).json({ error: 'Failed to load progress' });
        }
    }

    // POST: Save progress
    if (req.method === 'POST') {
        const { type, sectionId, chapterIdx, score, passed } = req.body;

        try {
            if (type === 'chapter') {
                // Save chapter completion
                const { error } = await supabase
                    .from('user_progress')
                    .upsert({
                        user_id: user.userId,
                        section_id: sectionId,
                        chapter_idx: chapterIdx
                    }, {
                        onConflict: 'user_id,section_id,chapter_idx',
                        ignoreDuplicates: true
                    });

                if (error && error.code !== '23505') { // Ignore duplicate key errors
                    console.error('Chapter save error:', error);
                    return res.status(500).json({ error: 'Failed to save chapter' });
                }

                return res.status(200).json({ success: true });

            } else if (type === 'quiz') {
                // Save quiz score
                const { error } = await supabase
                    .from('quiz_scores')
                    .upsert({
                        user_id: user.userId,
                        section_id: sectionId,
                        score: score,
                        passed: passed
                    }, {
                        onConflict: 'user_id,section_id'
                    });

                if (error) {
                    console.error('Quiz save error:', error);
                    return res.status(500).json({ error: 'Failed to save quiz score' });
                }

                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ error: 'Invalid type' });

        } catch (err) {
            console.error('Progress save error:', err);
            return res.status(500).json({ error: 'Failed to save progress' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
