const http = require('http');
const querystring = require('querystring');
const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto')

let deviceCodeApproved = false;

function randomStr(size) {
    return crypto.randomBytes(size).toString('hex');
}

const server = http.createServer((req, res) => {
    // 1. Handle Device Code Initial Request
    if (req.url.includes('/oauth2/v2.0/devicecode')) {
        // Reset the authentication flow.
        deviceCodeApproved = false;
        console.log(' >> received new last device code request...');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            // not used
            "user_code": "ABCD-EFGH",
            "device_code": "secret-device-id-123",
            "verification_uri": "https://127.0.0.1:3000/device",
            "expires_in": 900,
            // Tells kubelogin to poll every 2 seconds
            "interval": 2,
            "message": "To sign in, use a web browser to open the page https://127.0.0.1:3000/device."
        }));
    }

    // 2. Handle the fake approval UI.
    if (req.url.includes('/device')) {
        // Mark last request as completed.
        deviceCodeApproved = true;
        console.log(' >> authenticated last device code request...');

        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end("<h1>Success!</h1><p>Device ABCD-EFGH has been approved. You can close this and check your terminal.</p>");
    }

    // 3. Handle token polling.
    if (req.method === 'POST' && req.url.includes('/token')) {
        if (!deviceCodeApproved) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ "error": "authorization_pending" }));
        }

        console.log(' >> fulfilling last device code request... ');
        let randomJWT = jsonwebtoken.sign({ real: 'data' }, randomStr(16));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            "token_type": "Bearer",
            "expires_in": 3600,
            "access_token": randomJWT
        }));
    }

    // 4. Standard discovery.
    if (req.url.includes('.well-known/openid-configuration')) {
        console.log(" >> processing openid configuration request...");
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            "issuer": "https://127.0.0.1:3000/custom/v2.0",
            // REQUIRED: The SDK checks this even if not using it
            "authorization_endpoint": "https://127.0.0.1:3000/custom/oauth2/v2.0/authorize",
            // REQUIRED: This is what triggers the Device Code flow
            "device_authorization_endpoint": "https://127.0.0.1:3000/custom/oauth2/v2.0/devicecode",
            "token_endpoint": "https://127.0.0.1:3000/custom/oauth2/v2.0/token",
            "jwks_uri": "https://127.0.0.1:3000/custom/discovery/v2.0/keys"
        }));
    }
});

server.listen(3001, '127.0.0.1', () => console.log(">>> fake device code azure auth webserver..."));