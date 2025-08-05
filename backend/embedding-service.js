// embedding-service.js

require('dotenv').config();
const fetch = require('node-fetch');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { getIdToken } = require('./auth'); // Assicurati che il path sia corretto!


const MOODLE_BASE_URL = process.env.MOODLE_BASE_URL;

const CLOUD_RUN_URL = process.env.CLOUD_RUN_URL;
const TARGET_AUDIENCE = process.env.CLOUD_RUN_URL;
const GCS_BUCKET = process.env.GCS_BUCKET;
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;

const storage = new Storage({
    keyFilename: GOOGLE_APPLICATION_CREDENTIALS,
});
function getMoodleApiUrl() {
    return `${process.env.MOODLE_BASE_URL}?wsfunction=local_configuratore_get_pending_files&moodlewsrestformat=json&wstoken=${process.env.MOODLE_API_TOKEN}`;
}
function getUpdateStatusUrl() {
    return `${process.env.MOODLE_BASE_URL}?wsfunction=local_configuratore_update_file_status&moodlewsrestformat=json&wstoken=${process.env.MOODLE_API_TOKEN}`;
}

// -------- 1. Prendi i file pending da Moodle
async function getPendingFiles() {
    console.log('[embedding-service] Fetch dei file pending da: MOODLE_API_URL');
    const res = await fetch(getMoodleApiUrl());
    if (!res.ok) {
        console.error(`[embedding-service] ERRORE FETCH FILES! Status: ${res.status}`);
        throw new Error('Errore nella chiamata get_pending_files');
    }
    const data = await res.json();
    console.log(`[embedding-service] Risposta getPendingFiles:`, data);
    return data.files || [];
}

// -------- 2. Scarica file dalla signed URL
async function downloadFile(url, destPath) {
    console.log(`[embedding-service] Scarico file da signed URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore download file: ' + res.status);
    const fileStream = fs.createWriteStream(destPath);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on('error', reject);
        fileStream.on('finish', resolve);
    });
    console.log(`[embedding-service] File salvato in: ${destPath}`);
}

// -------- 3. Chiama Cloud Run /upload_files
async function uploadFileToCloudRun(file) {
    const payload = {
        files: [
            {
                chatbotid: file.chatbotid,
                argomentoid: file.argomentoid,
                filename: file.filename,
                moodlefileid: file.moodlefileid,
                url: file.signed_url
            }
        ]
    };
    const idToken = await getIdToken(TARGET_AUDIENCE);

    const res = await fetch(`${CLOUD_RUN_URL}/upload_files`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    // Meglio gestire la risposta!
    const text = await res.text();
    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('[uploadFileToCloudRun] Risposta non JSON:', text);
        throw new Error('Cloud Run ha risposto con errore/non JSON');
    }
}

// -------- 4. Chiama Cloud Run /convert

async function convertFileOnCloudRun(file) {
    const payload = {
        pdf_url: "",
        chatbotid: file.chatbotid,
        argomentoid: file.argomentoid,
        blob_path: `pdf/chatbot_${file.chatbotid}/argomento_${file.argomentoid}/${file.filename}`
    };
    const url = `${CLOUD_RUN_URL}/convert`;
    console.log(`[embedding-service] POST a ${url} | payload:`, payload);

    // Ottieni il targetAudience dalle ENV o direttamente dal file .env
    const targetAudience = process.env.CLOUD_RUN_URL;

    // Prendi ID Token
    const idToken = await getIdToken(targetAudience);

    // Fai la chiamata autenticata
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload)
    });

    let data;
    try {
        data = await res.json();
    } catch (e) {
        // Se la risposta non è JSON
        const text = await res.text();
        console.error(`[embedding-service] ERRORE convertFileOnCloudRun: risposta non JSON:\n`, text);
        throw new Error('Risposta non JSON da Cloud Run /convert');
    }

    console.log(`[embedding-service] Risposta convertFileOnCloudRun:`, data);
    return data;
}


// -------- 5. Aggiorna stato file su Moodle
async function updateFileStatus(fileid, status, embeddingurl = null) {
    const params = new URLSearchParams({
        fileid,
        status,
    });
    if (embeddingurl) params.append('embeddingurl', embeddingurl);

    console.log(`[embedding-service] Aggiorno status file su Moodle: fileid=${fileid}, status=${status}, embeddingurl=${embeddingurl}`);
    const res = await fetch(getUpdateStatusUrl(), {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: params
    });
    const data = await res.json();
    console.log(`[embedding-service] Risposta updateFileStatus:`, data);
    return data.success;
}

// -------- MAIN LOOP
async function main() {
    console.log('[embedding-service] === Avvio main() ===');
    const files = await getPendingFiles();
    console.log(`[embedding-service] Trovati ${files.length} file pending.`);

    for (const file of files) {
        try {
            console.log(`[embedding-service] ---- Processing file: ${file.filename} ----`);

            // 1. Upload su GCS tramite Cloud Run
            console.log(`[embedding-service] Invio ${file.filename} a Cloud Run /upload_files...`);
            const uploadRes = await uploadFileToCloudRun(file);
            if (!uploadRes.success) throw new Error('Upload su Cloud Run fallito!');

            // 2. Chiedi a Cloud Run di fare l'embedding
            console.log(`[embedding-service] Chiedo a Cloud Run di embeddare ${file.filename}...`);
            const convertRes = await convertFileOnCloudRun(file);

            let gsUrl = null;
            if (convertRes.returncode === 0) {
                const stdout = JSON.parse(convertRes.stdout);
                gsUrl = stdout.gs_url;
                console.log(`[embedding-service] Embedding creato e caricato: ${gsUrl}`);
            } else {
                throw new Error('Errore nella conversione Cloud Run: ' + convertRes.stderr);
            }

            // 3. Aggiorna stato file su Moodle
            console.log(`[embedding-service] Aggiorno stato su Moodle...`);
            await updateFileStatus(file.id, 'done', gsUrl);

            console.log(`[embedding-service] File ${file.filename} processato OK!`);
        } catch (e) {
            console.error(`[embedding-service] Errore su ${file.filename}:`, e);
            await updateFileStatus(file.id, 'error');
        }
    }
    console.log('[embedding-service] === Fine main() ===');
}

if (require.main === module) {
    main().catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { main };
