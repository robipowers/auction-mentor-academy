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
        const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
        const code_verifier = cookies.whop_code_verifier;

        if (!code_verifier) {
            return res.status(400).send('Missing Whop PKCE code verifier cookie (make sure your browser allows cookies).');
        }

        // 2. Ask Whop: "Who is this person?"
        const redirect_uri = 'https://auction-mentor-academy.vercel.app/api/auth/callback';

        // TEMPORARY: Hardcode both credentials to eliminate Vercel ENV issues
        const client_id = 'app_W2HoBJo1SsbLan';
        const client_secret = 'apik_IJ3tt6t7vEsVl_A2029476_C_3c8dbde1fa2dab98ac9dbb586ad9dccf834e19ef65498d3ac74e43c1c6c357';

        const params = new URLSearchParams();
        params.append('client_id', client_id);
        params.append('client_secret', client_secret);
        params.append('code', code);
        params.append('code_verifier', code_verifier);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', redirect_uri);

        const tokenResponse = await fetch('https://api.whop.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            return res.status(401).send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
                        <h2 style="color: red;">Authentication Failed</h2>
                        <p>Whop rejected the login code. This usually happens if the code expired or the page was refreshed.</p>
                        <p style="background: #eee; padding: 10px; max-width: 600px; margin: 0 auto; border-radius: 5px; font-family: monospace;">Error: ${JSON.stringify(tokenData)}</p>
                        <hr style="max-width: 600px; margin: 20px auto;">
                        <div style="text-align: left; max-width: 600px; margin: 0 auto; background: #222; color: #0f0; padding: 10px; font-family: monospace; border-radius: 5px; overflow-wrap: break-word;">
                            <b>DEBUG INFO:</b><br>
                            code: ${code}<br>
                            code_verifier: ${code_verifier}<br>
                            client_id (used): ${client_id}<br>
                            client_secret (used starts with): ${client_secret.substring(0, 10)}...<br>
                        </div>
                        <br>
                        <a href="/" style="display: inline-block; padding: 10px 20px; background: #ff6243; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Click Here to Start Over</a>
                    </body>
                </html>
            `);
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
