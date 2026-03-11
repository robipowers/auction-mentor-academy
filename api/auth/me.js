// Auction Mentor: Session Check
// GET /api/auth/me
// Validates session cookie against active_sessions table

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
    const cookies = parseCookies(req.headers.cookie);
    const sessionRaw = cookies.am_session;

    if (!sessionRaw) {
        return res.status(401).json({ authenticated: false });
    }

    try {
        const session = JSON.parse(decodeURIComponent(sessionRaw));

        if (!session.sid) {
            return res.status(401).json({ authenticated: false });
        }

        // ─── Verify session still exists and is not expired ──────────────
        const { data: activeSession } = await supabase
            .from('active_sessions')
            .select('id, user_id, expires_at')
            .eq('session_id', session.sid)
            .single();

        if (!activeSession) {
            // Session was killed (user logged in elsewhere)
            res.setHeader('Set-Cookie', 'am_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
            return res.status(401).json({
                authenticated: false,
                reason: 'session_revoked',
                message: 'You have been logged out because your account was accessed from another device.'
            });
        }

        // Check expiry
        if (new Date(activeSession.expires_at) < new Date()) {
            // Clean up expired session
            await supabase.from('active_sessions').delete().eq('id', activeSession.id);
            res.setHeader('Set-Cookie', 'am_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
            return res.status(401).json({
                authenticated: false,
                reason: 'session_expired',
                message: 'Your session has expired. Please log in again.'
            });
        }

        // ─── Verify user is still an active subscriber ───────────────────
        const { data: user } = await supabase
            .from('users')
            .select('id, email, tradingview_username, status')
            .eq('id', activeSession.user_id)
            .in('status', ['active', 'past_due'])
            .single();

        if (!user) {
            // Subscription lapsed — kill session
            await supabase.from('active_sessions').delete().eq('id', activeSession.id);
            res.setHeader('Set-Cookie', 'am_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax');
            return res.status(401).json({
                authenticated: false,
                reason: 'subscription_inactive',
                message: 'Your subscription is no longer active.'
            });
        }

        return res.status(200).json({
            authenticated: true,
            email: user.email,
            name: user.tradingview_username || user.email,
            status: user.status,
        });

    } catch (e) {
        return res.status(401).json({ authenticated: false });
    }
}
