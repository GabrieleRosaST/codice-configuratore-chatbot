import { createSlice } from '@reduxjs/toolkit'; // Importa createSlice


const formSlice = createSlice({
    name: 'form', // Nome della fetta di stato
    initialState: { // Stato iniziale
        nomeChatbot: '',
        corsoChatbot: '',
        descrizioneChatbot: '',
        istruzioniChatbot: '',
        dataInizio: '2025-09-05', // Data concreta di esempio
        dataFine: '2025-09-16',  // Data concreta di esempio
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