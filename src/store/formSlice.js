import { createSlice } from '@reduxjs/toolkit'; // Importa createSlice


const formSlice = createSlice({
    name: 'form', // Nome della fetta di stato
    initialState: { // Stato iniziale
        fotoChatbot: '',
        nomeChatbot: 'Testt',
        corsoChatbot: 'Testt',
        descrizioneChatbot: '',
        istruzioniChatbot: '',
        dataInizio: '2025-05-06',
        dataFine: '2025-05-11',
        newSuggerimento: '',
    },
    reducers: { // Funzioni per aggiornare lo stato
        updateForm: (state, action) => {
            return { ...state, ...action.payload }; // Aggiorna lo stato con i nuovi dati
        },
    },
});

export const { updateForm } = formSlice.actions; // Esporta l'azione per aggiornare lo stato
export default formSlice.reducer; // Esporta il reducer