/**
 * Utility functions per gestire correttamente i timestamp
 * Standardizza le conversioni tra JavaScript (millisecondi) e PHP/Database (secondi)
 */

const timestampUtils = {
    /**
     * Converte una Date JavaScript in timestamp Unix (secondi)
     * @param {Date} date - Data JavaScript
     * @returns {number} Timestamp Unix in secondi
     */
    jsDateToUnix: (date) => {
        if (!date || !(date instanceof Date)) {
            console.warn('jsDateToUnix: Invalid date provided', date);
            return 0;
        }
        return Math.floor(date.getTime() / 1000);
    },

    /**
     * Converte timestamp Unix (secondi) in Date JavaScript
     * @param {number} timestamp - Timestamp Unix in secondi
     * @returns {Date} Data JavaScript
     */
    unixToJsDate: (timestamp) => {
        if (!timestamp || typeof timestamp !== 'number' || timestamp <= 0) {
            console.warn('unixToJsDate: Invalid timestamp provided', timestamp);
            return new Date();
        }
        return new Date(timestamp * 1000);
    },

    /**
     * Converte stringa data in timestamp Unix (secondi)
     * @param {string} dateString - Stringa data
     * @returns {number} Timestamp Unix in secondi
     */
    dateStringToUnix: (dateString) => {
        if (!dateString) {
            console.warn('dateStringToUnix: Invalid date string provided', dateString);
            return 0;
        }
        const date = new Date(dateString);
        return Math.floor(date.getTime() / 1000);
    },

    /**
     * Converte componenti data (anno, mese, giorno) in timestamp Unix (secondi)
     * @param {number} anno - Anno
     * @param {number} mese - Mese (0-11, come in JavaScript Date)
     * @param {number} giorno - Giorno del mese
     * @returns {number} Timestamp Unix in secondi
     */
    componentsToUnix: (anno, mese, giorno) => {
        if (!anno || mese === undefined || !giorno) {
            console.warn('componentsToUnix: Invalid components provided', { anno, mese, giorno });
            return 0;
        }
        const date = new Date(anno, mese, giorno);
        return Math.floor(date.getTime() / 1000);
    },

    /**
     * Converte timestamp Unix (secondi) in componenti data
     * @param {number} timestamp - Timestamp Unix in secondi
     * @returns {object} Oggetto con { anno, mese, giorno }
     */
    unixToComponents: (timestamp) => {
        const date = timestampUtils.unixToJsDate(timestamp);
        return {
            anno: date.getFullYear(),
            mese: date.getMonth(),
            giorno: date.getDate()
        };
    },

    /**
     * Debug: Mostra tutte le conversioni per un timestamp
     * @param {number} timestamp - Timestamp da debuggare
     * @param {string} label - Etichetta per il debug
     */
    debugTimestamp: (timestamp, label = 'Timestamp') => {

    },

    /**
     * Valida che un timestamp sia nel formato corretto (secondi Unix)
     * @param {number} timestamp - Timestamp da validare
     * @returns {boolean} True se valido
     */
    isValidUnixTimestamp: (timestamp) => {
        if (typeof timestamp !== 'number') return false;
        // Timestamp deve essere positivo e ragionevole (dopo 1970 e prima di 2050)
        return timestamp > 0 && timestamp < 2524608000; // 01 Gen 2050
    },

    /**
     * Converte automaticamente timestamp da qualsiasi formato a Unix (secondi)
     * @param {number} timestamp - Timestamp in millisecondi o secondi
     * @returns {number} Timestamp Unix in secondi
     */
    normalizeToUnix: (timestamp) => {
        if (!timestamp || typeof timestamp !== 'number') {
            console.warn('normalizeToUnix: Invalid timestamp', timestamp);
            return 0;
        }

        // Se è in millisecondi (numero molto grande), converti in secondi
        if (timestamp > 2000000000) {
            return Math.floor(timestamp / 1000);
        }

        // Altrimenti assume sia già in secondi
        return timestamp;
    }
};

export default timestampUtils;
