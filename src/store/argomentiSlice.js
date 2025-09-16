import { createSlice } from '@reduxjs/toolkit';

// Esporta l'array di colori per essere utilizzato anche in altri file
export const colors = [
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
let nextId = 1; // Contatore globale per ID univoci
let colorIndex = 0; // Indice globale per il colore

// Funzione per ottenere il prossimo colore in sequenza
export const getNextColor = () => {
    const color = colors[colorIndex];
    colorIndex = (colorIndex + 1) % colors.length;
    return color;
};

// Funzione per resettare l'indice del colore
export const resetColorIndex = () => {
    colorIndex = 0;
};

const argomentiSlice = createSlice({
    name: 'argomenti',
    initialState: {
        argomenti: [

        ],
        initialArgomenti: [], // Stato iniziale memorizzato per il reset
        cambiatoTitolo: 0,
        loading: false,
        error: null,
        areArgomentiLoaded: false

    },
    reducers: {
        aggiungiArgomento: (state, action) => {
            const nuovoArgomento = {
                id: nextId++, // Usa il contatore globale per generare un ID univoco
                titolo: action.payload.titolo || '',
                giorno: null, // Inizializza il campo giorno come null per i nuovi argomenti
                colore: getNextColor(), // Usa la funzione esportata per consistenza
                file: action.payload.file || [],
                isNew: action.payload.isNew !== undefined ? action.payload.isNew : true // Default true per nuovi argomenti
            };
            console.log(`📝 Nuovo argomento creato:`, {
                id: nuovoArgomento.id,
                titolo: nuovoArgomento.titolo,
                giorno: nuovoArgomento.giorno,
                isNew: nuovoArgomento.isNew
            });
            state.argomenti.push(nuovoArgomento);
        },

        aggiornaFileArgomento: (state, action) => {
            const { id, file } = action.payload;
            const argomento = state.argomenti.find(argomento => argomento.id === id);
            if (argomento) {
                argomento.file = file;
            }
        },

        aggiornaTitoloArgomento: (state, action) => {
            const { id, titolo } = action.payload;
            const argomento = state.argomenti.find(argomento => argomento.id === id);
            if (argomento) {
                argomento.titolo = titolo;
                state.cambiatoTitolo += 1;
            }

        },

        rimuoviArgomento: (state, action) => {
            state.argomenti = state.argomenti.filter(argomento => argomento.id !== action.payload);
        },

        // Nuove azioni per il caricamento dal database
        setLoadingArgomenti: (state, action) => {
            state.loading = action.payload;
        },



        loadArgomentiSuccess: (state, action) => {

            state.loading = false;
            state.error = null;
            state.areArgomentiLoaded = true;



            // Sostituisce completamente l'array argomenti con quelli dal DB
            // Gli argomenti dal DB non sono nuovi, quindi impostano isNew: false
            state.argomenti = (action.payload.argomenti || []).map(argomento => {
                // Normalizza il timestamp per assicurarsi che sia in secondi Unix
                let giornoNormalized = argomento.giorno;
                if (argomento.giorno && typeof argomento.giorno === 'number' && argomento.giorno > 2000000000) {
                    giornoNormalized = Math.floor(argomento.giorno / 1000);
                    console.warn(`⚠️ Timestamp dal DB in millisecondi convertito per argomento "${argomento.titolo}": ${argomento.giorno} -> ${giornoNormalized}`);
                }

                console.log("Caricamento argomentiiiii", giornoNormalized)

                return {
                    ...argomento,
                    giorno: giornoNormalized,
                    isNew: false // Gli argomenti caricati dal DB non sono nuovi
                };
            });


            // Aggiorna i contatori globali per evitare conflitti ID
            if (action.payload.argomenti && action.payload.argomenti.length > 0) {
                const maxId = Math.max(...action.payload.argomenti.map(arg => arg.id || 0));
                nextId = maxId + 1;
            }


        },

        loadArgomentiError: (state, action) => {
            console.error('❌ Redux: loadArgomentiError:', action.payload);

            state.loading = false;
            state.error = action.payload;
            state.areArgomentiLoaded = false;
        },

        // Imposta lo snapshot iniziale degli argomenti per il ripristino
        setInitialArgomentiSnapshot: (state) => {
            state.initialArgomenti = JSON.parse(JSON.stringify(state.argomenti)); // Deep copy
        },

        resetArgomenti: (state) => {

            if (state.initialArgomenti.length > 0) {
                // Ripristina agli argomenti iniziali memorizzati
                state.argomenti = JSON.parse(JSON.stringify(state.initialArgomenti)); // Deep copy
            } else {
                // Fallback: reset completo se non c'è snapshot
                state.argomenti = [];
                nextId = 1;
                colorIndex = 0;
            }

            state.loading = false;
            state.error = null;
        },

        aggiornaGiornoArgomento: (state, action) => {
            const { id, giorno } = action.payload;
            console.log("🔻Controllo aggiornamento giorno, ", { id, giorno });
            // Normalizza il timestamp per assicurarsi che sia in secondi Unix
            let timestampNormalized = giorno;
            if (giorno && typeof giorno === 'number') {
                // Se il timestamp ha più di 10 cifre, è probabilmente in millisecondi, convertiamo
                if (giorno > 2000000000) { // Timestamp in millisecondi (dopo ~2033 se fossero secondi)
                    timestampNormalized = Math.floor(giorno / 1000);
                    console.warn(`⚠️ Timestamp in millisecondi convertito per argomento ${id}: ${giorno} -> ${timestampNormalized}`);
                }
            }

            console.log(`🔄 aggiornaGiornoArgomento chiamato:`, {
                argomento_id: id,
                timestamp_destinazione: giorno,
                timestamp_normalizzato: timestampNormalized,
                timestamp_type: typeof timestampNormalized,
                timestamp_readable: timestampNormalized ? new Date(timestampNormalized * 1000).toLocaleString() : 'Invalid'
            });

            console.log("Stato attuale argomenti:", state.argomenti.map(a => ({ id: a.id, titolo: a.titolo, giorno: a.giorno })));

            const argomento = state.argomenti.find(argomento => argomento.id === id);
            if (argomento) {
                const old_timestamp = argomento.giorno;
                argomento.giorno = timestampNormalized;
                console.log(`✅ Argomento ${id} aggiornato:`, {
                    titolo: argomento.titolo,
                    vecchio_timestamp: old_timestamp,
                    nuovo_timestamp: timestampNormalized,
                    vecchia_data: old_timestamp ? new Date(old_timestamp * 1000).toLocaleDateString() : 'N/A',
                    nuova_data: timestampNormalized ? new Date(timestampNormalized * 1000).toLocaleDateString() : 'N/A'
                });
            } else {
                console.warn(`❌ Argomento con ID ${id} non trovato per aggiornamento giorno`);
            }

            console.log("Stato POST argomenti:", state.argomenti.map(a => ({ id: a.id, titolo: a.titolo, giorno: a.giorno })));

        },

        aggiornaIdArgomenti: (state, action) => {
            const idMapping = action.payload; // { oldId: newId, ... }
            console.log(`🔄 aggiornaIdArgomenti chiamato con:`, idMapping);
            console.log(`🔄 Tipo payload:`, typeof idMapping);
            console.log(`🔄 Chiavi mapping:`, Object.keys(idMapping || {}));

            if (!idMapping || typeof idMapping !== 'object') {
                console.warn('❌ Mappatura ID non valida:', idMapping);
                return;
            }

            let aggiornamenti = 0;
            state.argomenti.forEach(argomento => {
                if (idMapping[argomento.id]) {
                    const oldId = argomento.id;
                    const newId = idMapping[argomento.id];
                    argomento.id = newId;
                    argomento.isNew = false; // Non è più nuovo dopo essere stato salvato
                    aggiornamenti++;
                    console.log(`✅ ID aggiornato: ${oldId} -> ${newId} per argomento "${argomento.titolo}"`);
                } else {
                    console.log(`⏭️ Argomento "${argomento.titolo}" (ID: ${argomento.id}) non ha mappatura`);
                }
            });

            console.log(`🔄 Totale aggiornamenti ID: ${aggiornamenti}`);
            console.log(`🔄 Stato argomenti DOPO aggiornamento:`, state.argomenti.map(a => ({ id: a.id, titolo: a.titolo, isNew: a.isNew })));
        }
    }
});

export const {
    aggiungiArgomento,
    aggiornaFileArgomento,
    aggiornaTitoloArgomento,
    rimuoviArgomento,
    setLoadingArgomenti,
    loadArgomentiSuccess,
    loadArgomentiError,
    setInitialArgomentiSnapshot,
    resetArgomenti,
    aggiornaGiornoArgomento,
    aggiornaIdArgomenti
} = argomentiSlice.actions;
export default argomentiSlice.reducer;