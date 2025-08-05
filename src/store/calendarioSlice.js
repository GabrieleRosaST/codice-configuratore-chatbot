import { createSlice } from '@reduxjs/toolkit';




const today = new Date();


const calendarioSlice = createSlice({
    name: 'calendario',
    initialState: {

        selezionato: {
            mese: today.getMonth(),
            anno: today.getFullYear(),
        },
        giorniCorrenti: [],
        giorniCorso: [],
        argomentiDistribuiti: [],
        primaVisita: false,

    },
    reducers: {

        aggiornaSelezionato: (state, action) => {
            const { mese, anno } = action.payload;
            state.selezionato = { mese, anno };
        },

        distribuisciArgomentiGiorniCorso: (state, action) => {
            const { argomenti, dataInizio, dataFine } = action.payload;


            // Filtra i giorni del corso 
            const giorniCorso = [];
            const dataInizioCorso = new Date(dataInizio);
            const dataFineCorso = new Date(dataFine);

            for (let d = new Date(dataInizioCorso); d <= dataFineCorso; d.setDate(d.getDate() + 1)) {
                giorniCorso.push({
                    giorno: d.getDate(),
                    mese: d.getMonth(),
                    anno: d.getFullYear(),
                    argomenti: [], // Array vuoto per gli argomenti
                });
            }

            // Salva i giorni del corso nello stato Redux
            state.giorniCorso = giorniCorso;
            state.argomentiDistribuiti = argomenti.map(a => a.id); // salva gli id


            const lunghezzaCorso = state.giorniCorso.length;

            // Calcola lo step per distribuire gli argomenti
            const step = Math.max(Math.ceil(lunghezzaCorso / argomenti.length));

            // Distribuisci gli argomenti
            let posizione = 0; // Variabile per tracciare la posizione corrente
            for (let argomentoIndex = 0; argomentoIndex < argomenti.length; argomentoIndex++) {
                // Assegna l'argomento al giorno corrente
                giorniCorso[posizione] = {
                    ...giorniCorso[posizione], // Crea una copia immutabile del giorno
                    argomenti: [...(giorniCorso[posizione].argomenti || []), argomenti[argomentoIndex]], // Aggiungi l'argomento
                };

                // Incrementa la posizione di "step" e riparti dalla differenza se supera i giorni totali
                posizione = posizione + step;
                if (posizione >= lunghezzaCorso) {
                    posizione = posizione - lunghezzaCorso; // Riparti dalla differenza

                    // Se la differenza è zero, aggiungi un piccolo offset per sfasare la distribuzione
                    if (posizione === 0) {
                        posizione += 1; // Aggiungi un offset di 1 (o un altro valore piccolo)
                    }
                }
            }

            // Aggiorna lo stato Redux con la copia aggiornata
            state.giorniCorso = giorniCorso;
            state.primaVisita = true;

        },

        inizializzaCalendario: (state, action) => {
            state.giorniCorrenti = action.payload.giorniCorrenti;
        },

        aggiornaTitoliGiorni: (state, action) => {
            const { argomenti } = action.payload; // Ricevi argomenti come payload
            state.giorniCorso = state.giorniCorso.map((giorno) => {
                return {
                    ...giorno,
                    argomenti: giorno.argomenti.map((argomento) => {
                        const argomentoAggiornato = argomenti.find((a) => a.id === argomento.id);
                        return argomentoAggiornato
                            ? { ...argomento, titolo: argomentoAggiornato.titolo } // Aggiorna il titolo
                            : argomento; // Mantieni l'argomento invariato se non trovato
                    }),
                };
            });
        },

        spostaArgomento: (state, action) => {
            const { argomento, giornoOrigine, giornoDestinazione } = action.payload;


            // TROVA il giorno di ORIGINE nel corso
            const giornoOrigineIndex = state.giorniCorso.findIndex(
                (g) =>
                    g.giorno === giornoOrigine.giorno &&
                    g.mese === giornoOrigine.mese &&
                    g.anno === giornoOrigine.anno
            );

            // RIMUOVI l'argomento dal giorno di origine
            if (giornoOrigineIndex !== -1) {
                state.giorniCorso[giornoOrigineIndex].argomenti = state.giorniCorso[giornoOrigineIndex].argomenti.filter(
                    (a) => a.id !== argomento.id
                );
            }

            // TROVA il giorno di DESTINAZIONE nel corso
            const giornoDestinazioneIndex = state.giorniCorso.findIndex(
                (g) =>
                    g.giorno === giornoDestinazione.giorno &&
                    g.mese === giornoDestinazione.mese &&
                    g.anno === giornoDestinazione.anno
            );

            // AGGIUNGI l'argomento al giorno di destinazione
            if (giornoDestinazioneIndex !== -1) {
                state.giorniCorso[giornoDestinazioneIndex].argomenti.unshift({ ...argomento });
            }
        }

    }
});

export const { aggiornaSelezionato, inizializzaCalendario, spostaArgomento, aggiornaTitoliGiorni, distribuisciArgomentiGiorniCorso } = calendarioSlice.actions;
export default calendarioSlice.reducer;