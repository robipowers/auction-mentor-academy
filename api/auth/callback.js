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
        return res.status(400).send(`Missing Whop authorization code. Query params received: ${JSON.stringify(req.query)}`);
    }

    try {
        // Read the PKCE code_verifier from server-set HttpOnly cookie
        const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
        const code_verifier = cookies.cv;

        if (!code_verifier) {
            return res.status(400).send('Missing PKCE code verifier cookie. <a href="/">Try again</a>');
        }

        // 2. Ask Whop: "Who is this person?"
        const redirect_uri = 'https://auction-mentor-academy.vercel.app/api/auth/callback';

        const client_id = process.env.WHOP_CLIENT_ID;
        const client_secret = process.env.WHOP_CLIENT_SECRET;

        const tokenResponse = await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret,
                code_verifier: code_verifier
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            return res.status(401).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2 style="color: red;">Authentication Failed</h2>
                        <p>Whop rejected the login code. This usually happens if the code expired or the page was refreshed.</p>
                        <p>Please try again. If the problem persists, contact support.</p>
                        <br>
                        <a href="/" style="display: inline-block; padding: 10px 20px; background: #ff6243; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Try Again</a>
                    </body>
                </html>
            `);
        }

        // 3. Fetch user profile from Whop's OIDC userinfo endpoint
        const whopUserResponse = await fetch('https://api.whop.com/oauth/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });

        const whopUser = await whopUserResponse.json();

        // The userinfo endpoint returns email in the standard OIDC format
        const userEmail = whopUser.email;
        if (!userEmail) {
            return res.status(401).send(`Could not retrieve Whop user email. Response: ${JSON.stringify(whopUser)}`);
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
            email: userEmail,
            options: {
                redirectTo: 'https://auction-mentor-academy.vercel.app'
            }
        });

        if (authError || !authData.properties?.action_link) {
            return res.status(500).send('Failed to generate secure Supabase session');
        }

        // Fix the redirect URL in the magic link (Supabase Site URL may be set to localhost)
        let actionLink = authData.properties.action_link;
        actionLink = actionLink.replace(
            /redirect_to=http%3A%2F%2Flocalhost[^&]*/,
            'redirect_to=' + encodeURIComponent('https://auction-mentor-academy.vercel.app')
        );

        // 6. Redirect them to the magic link, which securely logs them in and drops them into the Academy
        res.redirect(302, actionLink);

    } catch (error) {
        console.error(error);
        res.status(500).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                    <h2 style="color: red;">System Error</h2>
                    <p>Something went wrong on our end.</p>
                    <br>
                    <a href="/" style="display: inline-block; padding: 10px 20px; background: #ff6243; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Click Here to Start Over</a>
                </body>
            </html>
        `);
    }
}
