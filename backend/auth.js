const { GoogleAuth } = require('google-auth-library');

async function getIdToken(targetAudience) {
    const auth = new GoogleAuth({
        keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS // path alla service account key .json
    });
    const client = await auth.getIdTokenClient(targetAudience);
    const headers = await client.getRequestHeaders();

    // LOG!

    // Accetta sia .authorization (string) sia ["authorization"] (in Headers object)
    let authHeader;
    if (headers instanceof Map || headers instanceof Object) {
        authHeader = headers['Authorization'] || headers['authorization'];
    }

    // Fallback: se è Headers (node-fetch), usa get()
    if (!authHeader && typeof headers.get === 'function') {
        authHeader = headers.get('Authorization') || headers.get('authorization');
    }

    if (!authHeader) {
        // Come fallback stampa tutte le proprietà
        console.error('[auth.js] headers object type:', typeof headers, headers);
        throw new Error("Impossibile ottenere l'Authorization header dall'ID token client! Controlla che GOOGLE_APPLICATION_CREDENTIALS punti alla service account giusta e che il targetAudience sia corretto.");
    }
    return authHeader.replace('Bearer ', '');
}

module.exports = { getIdToken };
