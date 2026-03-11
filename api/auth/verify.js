// Auction Mentor: Magic Link Verification
// GET /api/auth/verify?token=xxx
// Validates one-time token, creates session, enforces single-session

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const APP_NAME = process.env.APP_NAME || 'academy'; // 'academy' or 'dashboard'
const SESSION_DURATION_HOURS = 24;

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).send('Method not allowed');

    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        return sendErrorPage(res, 'Invalid Login Link', 'This login link is invalid or malformed.');
    }

    try {
        // ─── Find and validate the token ─────────────────────────────────
        const { data: authToken, error } = await supabase
            .from('auth_tokens')
            .select('id, user_id, email, expires_at, used_at')
            .eq('token', token)
            .single();

        if (error || !authToken) {
            return sendErrorPage(res, 'Link Expired or Invalid',
                'This login link has expired or has already been used. Please request a new one.');
        }

        // Check if already used (single-use enforcement)
        if (authToken.used_at) {
            return sendErrorPage(res, 'Link Already Used',
                'This login link has already been used. Each link can only be used once. Please request a new one.');
        }

        // Check if expired
        if (new Date(authToken.expires_at) < new Date()) {
            return sendErrorPage(res, 'Link Expired',
                'This login link has expired. Links are valid for 10 minutes. Please request a new one.');
        }

        // ─── Mark token as used (IMMEDIATELY — prevents race conditions) ─
        const { error: updateError } = await supabase
            .from('auth_tokens')
            .update({ used_at: new Date().toISOString() })
            .eq('id', authToken.id)
            .is('used_at', null); // Only update if still unused (atomic)

        if (updateError) {
            return sendErrorPage(res, 'Link Already Used',
                'This login link was just used from another device. Please request a new one.');
        }

        // ─── Verify user is still active ─────────────────────────────────
        const { data: user } = await supabase
            .from('users')
            .select('id, email, tradingview_username, status')
            .eq('id', authToken.user_id)
            .in('status', ['active', 'past_due'])
            .single();

        if (!user) {
            return sendErrorPage(res, 'Subscription Inactive',
                'Your subscription is no longer active. Please resubscribe to access Auction Mentor.');
        }

        // ─── Enforce single session: kill all existing sessions ──────────
        await supabase
            .from('active_sessions')
            .delete()
            .eq('user_id', user.id)
            .eq('app', APP_NAME);

        // ─── Create new session ──────────────────────────────────────────
        const sessionId = crypto.randomBytes(32).toString('hex');
        const sessionExpiry = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

        await supabase
            .from('active_sessions')
            .insert({
                user_id: user.id,
                session_id: sessionId,
                app: APP_NAME,
                expires_at: sessionExpiry.toISOString(),
            });

        // ─── Set secure session cookie ───────────────────────────────────
        const sessionData = JSON.stringify({
            sid: sessionId,
            email: user.email,
            name: user.tradingview_username || user.email,
            uid: user.id,
        });

        res.setHeader('Set-Cookie', [
            `am_session=${encodeURIComponent(sessionData)}; Path=/; Max-Age=${SESSION_DURATION_HOURS * 3600}; HttpOnly; Secure; SameSite=Lax`,
        ]);

        // ─── Audit log ───────────────────────────────────────────────────
        await supabase.from('audit_log').insert({
            user_id: user.id,
            action: 'magic_link_verified',
            details: {
                app: APP_NAME,
                email: user.email,
            },
            performed_by: 'system',
        });

        // ─── Redirect to app ────────────────────────────────────────────
        res.redirect(302, '/');

    } catch (err) {
        console.error('Verify error:', err);
        return sendErrorPage(res, 'Something Went Wrong',
            'An unexpected error occurred. Please try logging in again.');
    }
}

function sendErrorPage(res, title, message) {
    res.status(400).send(`
    <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} — Auction Mentor</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0f0f1a; font-family:Inter,system-ui,sans-serif;">
            <div style="max-width:400px; text-align:center; padding:40px 30px;">
                <div style="font-size:48px; margin-bottom:16px;">🔒</div>
                <h2 style="color:#fff; font-size:20px; margin:0 0 12px;">${title}</h2>
                <p style="color:#888; font-size:14px; line-height:1.6; margin:0 0 28px;">${message}</p>
                <a href="/"
                   style="display:inline-block; padding:14px 32px; background:linear-gradient(135deg,#5FA074,#4A7C59); color:#fff; text-decoration:none; border-radius:10px; font-weight:600; font-size:15px;">
                    Request New Login Link
                </a>
            </div>
        </body>
    </html>
    `);
}
