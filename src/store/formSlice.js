import { createSlice } from '@reduxjs/toolkit'; // Importa createSlice


const formSlice = createSlice({
    name: 'form', // Nome della fetta di stato
    initialState: { // Stato iniziale
        nomeChatbot: 'HCI TUTOR',
        corsoChatbot: 'Interazione Uomo-Macchina',
        descrizioneChatbot: ' Questo chatbot è progettato per assistere gli studenti nel corso di Interazione Uomo-Macchina, fornendo risorse e supporto personalizzato.',
        istruzioniChatbot: ' questo chatbot deve rispondere alle domande degli studenti riguardo al corso di Interazione Uomo-Macchina, fornendo risorse utili e supporto personalizzato.',
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