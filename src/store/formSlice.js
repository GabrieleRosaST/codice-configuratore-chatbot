import { createSlice } from '@reduxjs/toolkit'; // Importa createSlice


const formSlice = createSlice({
    name: 'form', // Nome della fetta di stato
    initialState: { // Stato iniziale
        fotoChatbot: '',
        nomeChatbot: 'HCI Tutor',
        corsoChatbot: 'interazione uomo macchina',
        descrizioneChatbot: '',
        istruzioniChatbot: '',
        dataInizio: ' ',
        dataFine: '',
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