import crypto from 'crypto';

export default function handler(req, res) {
    // Generate code_verifier: 64 random hex chars
    const codeVerifier = crypto.randomBytes(32).toString('hex');

    // Compute code_challenge = base64url(sha256(code_verifier))
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');

    // Store code_verifier in a secure, httpOnly cookie (set by server, much more reliable)
    res.setHeader('Set-Cookie', `cv=${codeVerifier}; Path=/; Max-Age=300; HttpOnly; Secure; SameSite=Lax`);

    const redirectUri = 'https://auction-mentor-academy.vercel.app/api/auth/callback';
    const authUrl = 'https://whop.com/oauth?client_id=app_W2HoBJo1SsbLan'
        + '&redirect_uri=' + encodeURIComponent(redirectUri)
        + '&response_type=code'
        + '&code_challenge=' + codeChallenge
        + '&code_challenge_method=S256';

    res.redirect(302, authUrl);
}
