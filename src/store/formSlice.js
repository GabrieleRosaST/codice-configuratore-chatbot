import { createSlice } from '@reduxjs/toolkit'; // Importa createSlice


const formSlice = createSlice({
    name: 'form', // Nome della fetta di stato
    initialState: { // Stato iniziale
        nomeChatbot: '',
        corsoChatbot: '',
        descrizioneChatbot: '',
        istruzioniChatbot: '',
        dataInizio: '', // Data concreta di esempio
        dataFine: '',  // Data concreta di esempio
        configId: '', // ID della configurazione per modalità edit
        courseId: '', // ID del corso Moodle
        userId: '', // ID dell'utente
    },
    reducers: { // Funzioni per aggiornare lo stato
        updateForm: (state, action) => {
            return { ...state, ...action.payload }; // Aggiorna lo stato con i nuovi dati
        },
    },
});

export const { updateForm } = formSlice.actions; // Esporta l'azione per aggiornare lo stato
export default formSlice.reducer; // Esporta il reducer