require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3002;



function updateEnvFileToken(token) {
    const envPath = path.resolve(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
        if (envContent.match(/^MOODLE_API_TOKEN=/m)) {
            envContent = envContent.replace(/^MOODLE_API_TOKEN=.*/m, `MOODLE_API_TOKEN=${token}`);
        } else {
            envContent += `\nMOODLE_API_TOKEN=${token}`;
        }
    } else {
        envContent = `MOODLE_API_TOKEN=${token}`;
    }
    fs.writeFileSync(envPath, envContent);
}

// Importa la funzione main da embedding-service.js
const { main } = require('./embedding-service');

app.use(express.json());

app.post('/trigger-embeddings', async (req, res) => {
    const apiToken = req.body.token;
    console.log('[trigger-embeddings] Ricevuto chiamata!'); // <-- LOG
    if (!apiToken) {
        console.log('[trigger-embeddings] Token mancante!'); // <-- LOG
        return res.status(400).json({success: false, error: 'Token mancante'});
    }
    process.env.MOODLE_API_TOKEN = apiToken;
    updateEnvFileToken(apiToken); // <-- AGGIORNA  .env! da togliere quando deployato
    console.log('[trigger-embeddings] Token ricevuto e salvato, avvio main()'); // <-- LOG
    try {
        await main();
        console.log('[trigger-embeddings] main() completato con successo!');
        res.json({ success: true });
    } catch (e) {
        console.error('[trigger-embeddings] main() errore:', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Backend Node API listening at http://localhost:${port}`);
});