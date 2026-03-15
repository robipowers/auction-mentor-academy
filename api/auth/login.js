// Auction Mentor: Magic Link Login
// POST /api/auth/login { email }
// Checks Supabase for active subscriber, sends magic link via Resend

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'Auction Mentor <noreply@auctionmentor.io>';
const APP_URL = process.env.APP_URL || 'https://academy.auctionmentor.io';
const TOKEN_EXPIRY_MINUTES = 10;

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { email } = req.body || {};

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ error: 'Email is required' });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Basic email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // ─── Check if this email has an active subscription ──────────────
        // Use ilike for case-insensitive email matching
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email, tradingview_username, status')
            .ilike('email', cleanEmail)
            .in('status', ['active', 'past_due'])
            .single();

        if (userError || !user) {
            // Don't reveal whether the email exists — always say "check your email"
            // But log it for debugging
            console.log(`Login attempt for non-subscriber: ${cleanEmail}`);
            return res.status(200).json({
                success: true,
                message: 'If this email has an active subscription, you will receive a login link.'
            });
        }

        // ─── Rate limit: max 3 tokens per email per hour ─────────────────
        const { count } = await supabase
            .from('auth_tokens')
            .select('id', { count: 'exact', head: true })
            .eq('email', cleanEmail)
            .gt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        if (count >= 3) {
            return res.status(429).json({
                error: 'Too many login attempts. Please wait a few minutes and try again.'
            });
        }

        // ─── Generate magic link token ───────────────────────────────────
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

        // Delete any existing unused tokens for this user
        await supabase
            .from('auth_tokens')
            .delete()
            .eq('user_id', user.id)
            .is('used_at', null);

        // Insert new token
        const { error: insertError } = await supabase
            .from('auth_tokens')
            .insert({
                token,
                user_id: user.id,
                email: cleanEmail,
                expires_at: expiresAt,
            });

        if (insertError) {
            console.error('Failed to create auth token:', insertError);
            return res.status(500).json({ error: 'Failed to create login link' });
        }

        // ─── Send magic link email via Resend ────────────────────────────
        const magicLink = `${APP_URL}/api/auth/verify?token=${token}`;

        const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0d120f; color: #e0e0e0; padding: 40px 30px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #5FA074; font-size: 28px; margin: 0;">Auction Mentor</h1>
                <p style="color: #909090; font-size: 13px; margin-top: 8px;">Secure Login Link</p>
            </div>

            <p style="color: #c8c8c8; line-height: 1.7; font-size: 15px;">
                Click the button below to log in. This link expires in <strong style="color: #fff;">${TOKEN_EXPIRY_MINUTES} minutes</strong> and can only be used once.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #5FA074, #4A7C59); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px;">
                    Log In to Auction Mentor →
                </a>
            </div>

            <p style="color: #909090; font-size: 13px; line-height: 1.6;">
                If you didn't request this login, you can safely ignore this email. Your account is secure.
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
                <a href="https://auctionmentor.io" style="color: #5FA074; text-decoration: none; font-size: 13px;">auctionmentor.io</a>
            </div>
        </div>
        `;

        if (RESEND_API_KEY) {
            const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: FROM_EMAIL,
                    to: [cleanEmail],
                    subject: 'Your Auction Mentor Login Link 🔐',
                    html: emailHtml,
                }),
            });

            if (!emailRes.ok) {
                console.error('Resend error:', await emailRes.text());
                return res.status(500).json({ error: 'Failed to send login email' });
            }
        } else {
            console.log(`[DEV] Magic link for ${cleanEmail}: ${magicLink}`);
        }

        // ─── Audit log ───────────────────────────────────────────────────
        await supabase.from('audit_log').insert({
            user_id: user.id,
            action: 'magic_link_sent',
            details: { email: cleanEmail, app: APP_URL },
            performed_by: 'system',
        });

        return res.status(200).json({
            success: true,
            message: 'If this email has an active subscription, you will receive a login link.'
        });

    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
