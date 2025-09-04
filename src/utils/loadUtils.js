// utils/loadUtils.js

// Funzione per caricare argomenti da Moodle in modalità edit
export const loadArgomentiForEdit = async (configId, sesskey, wwwroot) => {
    try {
        if (!configId) {
            throw new Error('Config ID non fornito');
        }

        console.log('🔥 loadArgomentiForEdit chiamata con:', {
            configId,
            sesskey: sesskey ? 'OK' : 'MISSING',
            wwwroot
        });

        const response = await fetch(`${wwwroot}/lib/ajax/service.php?sesskey=${sesskey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify([{
                methodname: 'local_configuratore_get_chatbot_argomenti',
                args: { chatbotid: parseInt(configId) }
            }])
        });

        console.log('📡 Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();

        console.log('📦 Raw response from Moodle:', json);

        if (json[0] && json[0].error) {
            console.error('🚨 Moodle error:', json[0].exception);
            throw new Error(json[0].exception?.message || 'Errore server Moodle');
        }

        const result = json[0]?.data;

        if (result?.success) {
            // Trasforma i dati dal formato DB al formato Redux
            const argomentiFormatted = result.argomenti.map((argomento, index) => ({
                id: argomento.id,
                titolo: argomento.titolo || '',
                giorno: argomento.giorno || null,
                colore: getRandomColor(), // Assegna colore casuale
                file: [] // I file verranno caricati separatamente se necessario
            }));

            console.log('✨ Argomenti formattati per Redux:', argomentiFormatted);

            return {
                success: true,
                argomenti: argomentiFormatted,
                count: result.count
            };
        } else {
            console.warn('⚠️ Web service returned success=false:', result);
            return {
                success: false,
                message: result?.message || 'Errore nel caricamento argomenti',
                argomenti: [],
                count: 0
            };
        }

    } catch (error) {
        console.error('💥 Errore completo in loadArgomentiForEdit:', error);
        console.error('Stack trace:', error.stack);
        throw error;
    }
};

// Utility per assegnare colori casuali agli argomenti
const getRandomColor = () => {
    const colors = [
        '#F3A6A7',
        '#F6D987',
        '#CAE3FE',
        '#CBB2FA',
        '#8EC398',
        '#A3B5DE',
        '#B6EEF5',
        '#E7B090',
        '#E8A7BE',
        '#B8E4B5',
        '#F0C87E',
        '#8DB3DA',
        '#D591AD',
        '#E3A8A3',
        '#A3B5DE',
        '#FFB6C1',
        '#A8D8B9',
        '#F2C94C',
        '#C1C3EC',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
};

// Helper per ottenere sesskey dal DOM
export const getMoodleSesskey = () => {
    // Cerca sesskey nei meta tag
    const metaSesskey = document.querySelector('meta[name="sesskey"]')?.content;
    if (metaSesskey) {
        console.log('🔑 Sesskey trovata nei meta tag');
        return metaSesskey;
    }

    // Cerca sesskey nei parametri URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSesskey = urlParams.get('sesskey');
    if (urlSesskey) {
        console.log('🔑 Sesskey trovata nell\'URL');
        return urlSesskey;
    }

    // Fallback: cerca nell'HTML della pagina
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.innerHTML.includes('sesskey')) {
            const match = script.innerHTML.match(/sesskey['"]\s*:\s*['"]([^'"]+)['"]/);
            if (match) {
                console.log('🔑 Sesskey trovata negli script');
                return match[1];
            }
        }
    }

    console.warn('⚠️ Sesskey non trovata');
    return '';
};