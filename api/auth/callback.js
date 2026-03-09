import { createClient } from '@supabase/supabase-js';
import * as cookie from 'cookie';

// Initialize Supabase with the hidden Service Role (Admin) key so we can force-login users
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // 1. Get the code Whop just sent us
    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Missing Whop authorization code');
    }

    try {
        // 2. Ask Whop: "Who is this person?"
        const tokenResponse = await fetch('https://api.whop.com/v2/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: process.env.WHOP_CLIENT_ID,
                client_secret: process.env.WHOP_CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/api/auth/callback` : 'http://localhost:3000/api/auth/callback'
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            return res.status(401).send('Failed to authenticate with Whop');
        }

        // 3. We have Whop access. Now let's fetch their Whop profile (email & ID)
        const whopUserResponse = await fetch('https://api.whop.com/api/v2/me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        const whopUser = await whopUserResponse.json();
        if (!whopUser || !whopUser.email) {
            return res.status(401).send('Could not retrieve Whop user profile');
        }

        /* 
         * 4. CHECK THEIR SUBSCRIPTION:
         * In a full production script, we'd hit Whop's /v2/me/licenses endpoint here 
         * to verify they have an ACTIVE pass for "Auction Mentor". 
         * If they don't, we stop them here.
         */

        // 5. Instantly create or log in this user to Supabase
        // Because we use the Admin key, it bypasses email verification
        const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: whopUser.email,
        });

        if (authError || !authData.properties?.action_link) {
            return res.status(500).send('Failed to generate secure Supabase session');
        }

        // 6. Redirect them to the magic link, which securely logs them in and drops them into the Academy
        res.redirect(302, authData.properties.action_link);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error during Whop Authentication');
    }
}
