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

        ],
        cambiatoTitolo: 0,

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
        }
    }
});

export const { aggiungiArgomento, aggiornaFileArgomento, aggiornaTitoloArgomento, rimuoviArgomento } = argomentiSlice.actions;
export default argomentiSlice.reducer;