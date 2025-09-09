// utils/loadUtils.js
import { getNextColor } from '../store/argomentiSlice.js';

// Funzione per caricare argomenti da Moodle in modalità edit
export const loadArgomentiForEdit = async (configId, sesskey, wwwroot) => {
    try {
        if (!configId) {
            throw new Error('Config ID non fornito');
        }



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


        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const json = await response.json();


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

            // Ordina gli argomenti per ID crescente
            const argomentiOrdered = argomentiFormatted.sort((a, b) => a.id - b.id);


            return {
                success: true,
                argomenti: argomentiOrdered,
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



// Utility per assegnare colori sequenziali agli argomenti (come argomentiSlice)
const getRandomColor = () => {
    return getNextColor();
};

// Helper per ottenere sesskey dal DOM
export const getMoodleSesskey = () => {
    // Cerca sesskey nei meta tag
    const metaSesskey = document.querySelector('meta[name="sesskey"]')?.content;
    if (metaSesskey) {
        return metaSesskey;
    }

    // Cerca sesskey nei parametri URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlSesskey = urlParams.get('sesskey');
    if (urlSesskey) {
        return urlSesskey;
    }

    // Fallback: cerca nell'HTML della pagina
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.innerHTML.includes('sesskey')) {
            const match = script.innerHTML.match(/sesskey['"]\s*:\s*['"]([^'"]+)['"]/);
            if (match) {
                return match[1];
            }
        }
    }

    console.warn('⚠️ Sesskey non trovata');
    return '';
};