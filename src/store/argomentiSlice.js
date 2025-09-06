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
        cambiatoTitolo: 0,
        loading: false,
        error: null,
        editMode: false

    },
    reducers: {
        aggiungiArgomento: (state, action) => {
            const nuovoArgomento = {
                id: nextId++, // Usa il contatore globale per generare un ID univoco
                titolo: action.payload.titolo || '',
                colore: getNextColor(), // Usa la funzione esportata per consistenza
                file: action.payload.file || [],
                isNew: action.payload.isNew !== undefined ? action.payload.isNew : true // Default true per nuovi argomenti
            };
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

        setEditMode: (state, action) => {
            state.editMode = action.payload;
        },

        loadArgomentiSuccess: (state, action) => {
            console.log('🎯 Redux: loadArgomentiSuccess chiamata con:', action.payload);

            state.loading = false;
            state.error = null;
            state.editMode = true;

            // Sostituisce completamente l'array argomenti con quelli dal DB
            // Gli argomenti dal DB non sono nuovi, quindi impostano isNew: false
            state.argomenti = (action.payload.argomenti || []).map(argomento => ({
                ...argomento,
                isNew: false // Gli argomenti caricati dal DB non sono nuovi
            }));

            // Aggiorna i contatori globali per evitare conflitti ID
            if (action.payload.argomenti && action.payload.argomenti.length > 0) {
                const maxId = Math.max(...action.payload.argomenti.map(arg => arg.id || 0));
                nextId = maxId + 1;
            }

            console.log('✅ Redux: Argomenti caricati, nuovo state:', {
                argomenti: state.argomenti,
                count: state.argomenti.length,
                nextId: nextId,
                editMode: state.editMode
            });
        },

        loadArgomentiError: (state, action) => {
            console.error('❌ Redux: loadArgomentiError:', action.payload);

            state.loading = false;
            state.error = action.payload;
            state.editMode = false;
        },

        resetArgomenti: (state) => {
            console.log('🔄 Redux: Reset argomenti');

            state.argomenti = [];
            state.loading = false;
            state.error = null;
            state.editMode = false;
            nextId = 1;
            colorIndex = 0;
        }
    }
});

export const {
    aggiungiArgomento,
    aggiornaFileArgomento,
    aggiornaTitoloArgomento,
    rimuoviArgomento,
    setLoadingArgomenti,
    setEditMode,
    loadArgomentiSuccess,
    loadArgomentiError,
    resetArgomenti
} = argomentiSlice.actions;
export default argomentiSlice.reducer;