import { createSlice } from '@reduxjs/toolkit';

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
let nextId = 1; // Contatore globale per ID univoci
let colorIndex = 0; // Indice globale per il colore

const argomentiSlice = createSlice({
    name: 'argomenti',
    initialState: {
        argomenti: [
            // Esempio di argomento predefinito
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