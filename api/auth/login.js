import crypto from 'crypto';

function base64UrlEncode(buffer) {
    return Buffer.from(buffer)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export default function handler(req, res) {
    // Generate code_verifier: base64url-encoded 32 random bytes
    const randomBytes = crypto.randomBytes(32);
    const codeVerifier = base64UrlEncode(randomBytes);

    // Compute code_challenge = base64url(sha256(code_verifier))
    const hash = crypto.createHash('sha256').update(codeVerifier).digest();
    const codeChallenge = base64UrlEncode(hash);

    // Store code_verifier in a secure HttpOnly cookie
    res.setHeader('Set-Cookie', `cv=${codeVerifier}; Path=/; Max-Age=300; HttpOnly; Secure; SameSite=Lax`);

    const redirectUri = 'https://auction-mentor-academy.vercel.app/api/auth/callback';
    const authUrl = 'https://api.whop.com/oauth/authorize'
        + '?client_id=app_W2HoBJo1SsbLan'
        + '&redirect_uri=' + encodeURIComponent(redirectUri)
        + '&response_type=code'
        + '&scope=' + encodeURIComponent('openid profile email')
        + '&code_challenge=' + codeChallenge
        + '&code_challenge_method=S256';

    res.redirect(302, authUrl);
}
