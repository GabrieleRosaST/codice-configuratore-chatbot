import { createSlice } from '@reduxjs/toolkit';

const today = new Date();

const calendarioSlice = createSlice({
    name: 'calendario',
    initialState: {
        corrente: {
            giorno: today.getDate(),
            mese: today.getMonth(),
            anno: today.getFullYear()
        },
        selezionato: {
            giorno: today.getDate(),
            mese: today.getMonth(),
            anno: today.getFullYear()
        },
        giorni: []

    },
    reducers: {

        inizializzaCalendario: (state, action) => {
            state.giorni = action.payload.giorni;
        },

        aggiornaSelezionato: (state, action) => {
            const { giorno, mese, anno } = action.payload;
            state.selezionato = { giorno, mese, anno };
        },

        aggiornaGiorni: (state, action) => {
            const { giorni, argomenti, dataInizio, dataFine } = action.payload;

            // Filtra i giorni validi (escludendo sabato e domenica)
            const giorniValidi = giorni.filter((giorno) => {
                const dataGiorno = new Date(giorno.anno, giorno.mese, giorno.giorno);
                dataGiorno.setHours(0, 0, 0, 0);

                const dataInizioCorso = new Date(dataInizio);
                const dataFineCorso = new Date(dataFine);

                dataInizioCorso.setHours(0, 0, 0, 0);
                dataFineCorso.setHours(0, 0, 0, 0);

                const giornoSettimana = dataGiorno.getDay();

                return (
                    dataGiorno >= dataInizioCorso &&
                    dataGiorno <= dataFineCorso
                );
            });

            const giorniTotali = giorniValidi.length;

            // Log per verificare i giorni totali
            console.log("Giorni totali del corso:", giorniTotali);

            // Log per verificare il numero di argomenti
            console.log("Numero di argomenti:", argomenti.length);

            // Calcola lo step per distribuire gli argomenti
            const step = Math.max(Math.ceil(giorniTotali / argomenti.length));

            // Log per verificare lo step calcolato
            console.log("Step calcolato per la distribuzione:", step);

            // Distribuisci gli argomenti
            let posizione = 0; // Variabile per tracciare la posizione corrente
            for (let argomentoIndex = 0; argomentoIndex < argomenti.length; argomentoIndex++) {
                // Assegna l'argomento al giorno corrente
                giorniValidi[posizione] = {
                    ...giorniValidi[posizione], // Crea una copia immutabile del giorno
                    argomenti: [argomenti[argomentoIndex]], // Assegna l'argomento
                };

                // Incrementa la posizione di "step" e riparti da 0 se supera i giorni totali
                posizione = (posizione + step) % giorniTotali;
            }

            // Aggiorna lo stato Redux con i giorni calcolati
            state.giorni = giorni.map((giorno) => {
                const giornoValido = giorniValidi.find(
                    (g) =>
                        g.giorno === giorno.giorno &&
                        g.mese === giorno.mese &&
                        g.anno === giorno.anno
                );

                return {
                    ...giorno,
                    argomenti: giornoValido ? giornoValido.argomenti || [] : [],
                };
            });

        },

        spostaArgomento: (state, action) => {
            const { argomento, giornoOrigine, giornoDestinazione } = action.payload;



            // TROVA il giorno di ORIGINE 
            const giornoOrigineIndex = state.giorni.findIndex(
                (g) =>
                    g.giorno === giornoOrigine.giorno &&
                    g.mese === giornoOrigine.mese &&
                    g.anno === giornoOrigine.anno
            );

            // RIMUOVI l'argomento dal giorno di origine
            if (giornoOrigineIndex !== -1) {
                state.giorni[giornoOrigineIndex].argomenti = state.giorni[giornoOrigineIndex].argomenti.filter(
                    (a) => a.id !== argomento.id
                );
            }




            // TROVA il giorno di DESTINAZIONE e aggiungi l'argomento
            const giornoDestinazioneIndex = state.giorni.findIndex(
                (g) =>
                    g.giorno === giornoDestinazione.giorno &&
                    g.mese === giornoDestinazione.mese &&
                    g.anno === giornoDestinazione.anno
            );

            // AGGIUNGI l'argomento al giorno di destinazione
            if (giornoDestinazioneIndex !== -1) {
                state.giorni[giornoDestinazioneIndex].argomenti.push({ ...argomento });
            }
        }

    }
});

export const { aggiornaSelezionato, inizializzaCalendario, spostaArgomento, aggiornaGiorni } = calendarioSlice.actions;
export default calendarioSlice.reducer;