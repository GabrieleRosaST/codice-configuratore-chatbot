import { createSlice } from '@reduxjs/toolkit';

const colors = [
    '#F3A6A7',
    '#F6D987',
    '#A3CFF8',
    '#CBB2FA',
    '#9CDA9B',
    '#FFD3B6',
    '#FFABAB',
    '#D4A5A5',
    '#B5EAD7',
    '#E2F0CB',
    '#FFDAC1',
    '#C7CEEA'
];
let nextId = 1; // Contatore globale per ID univoci
let colorIndex = 0; // Indice globale per il colore

const argomentiSlice = createSlice({
    name: 'argomenti',
    initialState: {
        argomenti: [
            //{ id: 1, titolo: 'Introduzione', colore: colors[0], file: [] },




        ] // Array per memorizzare gli argomenti predefiniti
    },
    reducers: {
        aggiungiArgomento: (state, action) => {
            const nuovoArgomento = {
                id: nextId++, // Usa il contatore globale per generare un ID univoco
                titolo: action.payload.titolo || '',
                colore: colors[colorIndex], // Assegna il colore in base all'indice globale
                file: action.payload.file || []
            };
            state.argomenti.push(nuovoArgomento);

            // Incrementa l'indice del colore e resetta se necessario
            colorIndex = (colorIndex + 1) % colors.length;
        },



        aggiornaArgomento: (state, action) => {
            const { id, titolo, colore, file } = action.payload;
            const argomento = state.argomenti.find(arg => arg.id === id);
            if (argomento) {
                if (titolo !== undefined) argomento.titolo = titolo; // Aggiorna solo se il titolo è passato
                if (colore !== undefined) argomento.colore = colore; // Mantieni il colore se non è passato
                if (file !== undefined) argomento.file = file; // Aggiorna solo se i file sono passati
            }
        },
        rimuoviArgomento: (state, action) => {
            state.argomenti = state.argomenti.filter(argomento => argomento.id !== action.payload);
        }
    }
});

export const { aggiungiArgomento, aggiornaArgomento, rimuoviArgomento } = argomentiSlice.actions;
export default argomentiSlice.reducer;