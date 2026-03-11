// Auction Mentor: Logout
// POST /api/auth/logout
// Clears session cookie and removes active session from DB

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

export default async function handler(req, res) {
    try {
        const cookies = parseCookies(req.headers.cookie);
        const sessionRaw = cookies.am_session;

        if (sessionRaw) {
            const session = JSON.parse(decodeURIComponent(sessionRaw));
            if (session.sid) {
                // Remove session from DB
                await supabase
                    .from('active_sessions')
                    .delete()
                    .eq('session_id', session.sid);
            }
        }
    } catch (e) {
        // Ignore parse errors — just clear the cookie
    }

    // Clear cookie regardless
    res.setHeader('Set-Cookie', 'am_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
    res.redirect(302, '/');
}
