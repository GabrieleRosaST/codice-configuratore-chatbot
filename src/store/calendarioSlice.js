import { createSlice } from '@reduxjs/toolkit';
import timestampUtils from '../utils/timestampUtils';
import { aggiornaGiornoArgomento } from './argomentiSlice';
import { useDispatch } from 'react-redux';



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
        primaDistribuzioneEffettuata: false,
        dataInizioOriginal: null,
        primaVisita: false,
        argomentiAggiornamenti: [], // Array per gli aggiornamenti dei giorni degli argomenti

    },
    reducers: {

        aggiornaDataInizioOriginal: (state, action) => {
            state.dataInizioOriginal = action.payload;
        },

        aggiornaDataFineOriginal: (state, action) => {
            state.dataFineOriginal = action.payload;
        },

        aggiornaSelezionato: (state, action) => {
            const { mese, anno } = action.payload;
            state.selezionato = { mese, anno };
        },

        distribuisciArgomentiGiorniCorso: (state, action) => {
            const { argomenti, dataInizio, dataFine, isEditMode, daRidistribuire } = action.payload;

            console.log("distribuisciArgomentiGiorniCorso - modalità:", isEditMode ? "EDIT" : "CREATE");
            console.log("Argomenti ricevuti:", argomenti);

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

            if (isEditMode && !daRidistribuire) {
                // MODALITÀ EDIT: Posiziona gli argomenti nei giorni basandoti sul loro timestamp
                console.log("Modalità EDIT: posizionando argomenti basandosi sui timestamp esistenti");

                argomenti.forEach(argomento => {
                    if (argomento.giorno && argomento.giorno > 0) {
                        // Debug del timestamp ricevuto
                        timestampUtils.debugTimestamp(argomento.giorno, `Argomento "${argomento.titolo}"`);

                        // Converte timestamp Unix (secondi) in Date JavaScript
                        const dataArgomento = timestampUtils.unixToJsDate(argomento.giorno);



                        // Trova il giorno corrispondente nell'array giorniCorso
                        const giornoIndex = giorniCorso.findIndex(g =>
                            g.giorno === dataArgomento.getDate() &&
                            g.mese === dataArgomento.getMonth() &&
                            g.anno === dataArgomento.getFullYear()
                        );

                        if (giornoIndex !== -1) {
                            // Aggiungi l'argomento al giorno trovato
                            giorniCorso[giornoIndex].argomenti.push(argomento);
                        } else {
                            console.warn(`❌ Giorno non trovato per argomento "${argomento.titolo}"`, {
                                timestamp: argomento.giorno,
                                data_cercata: dataArgomento.toDateString(),
                                range_corso: {
                                    inizio: `${giorniCorso[0]?.giorno}/${giorniCorso[0]?.mese + 1}/${giorniCorso[0]?.anno}`,
                                    fine: `${giorniCorso[giorniCorso.length - 1]?.giorno}/${giorniCorso[giorniCorso.length - 1]?.mese + 1}/${giorniCorso[giorniCorso.length - 1]?.anno}`
                                },
                                giorni_disponibili: giorniCorso.map(g => `${g.giorno}/${g.mese + 1}/${g.anno}`).slice(0, 5)
                            });
                        }
                    } else {
                        console.warn(`Argomento "${argomento.titolo}" non ha timestamp valido:`, argomento.giorno);
                    }
                });
            } else {
                // MODALITÀ CREATE: Distribuzione uniforme come prima
                console.log("Modalità CREATE/EDIT: ridistribuzione uniforme degli argomenti");

                const lunghezzaCorso = giorniCorso.length;

                // Calcola lo step per distribuire gli argomenti
                const step = Math.max(Math.ceil(lunghezzaCorso / argomenti.length));

                let posizione = 0; // Variabile per tracciare la posizione corrente
                for (let argomentoIndex = 0; argomentoIndex < argomenti.length; argomentoIndex++) {
                    const giornoAssegnato = giorniCorso[posizione];

                    // Calcola il timestamp del giorno assegnato
                    const timestampGiorno = timestampUtils.componentsToUnix(
                        giornoAssegnato.anno,
                        giornoAssegnato.mese,
                        giornoAssegnato.giorno
                    );

                    console.log(`Calcolo timestamp per argomento :`, {
                        anno: giornoAssegnato.anno,
                        mese: giornoAssegnato.mese,
                        giorno: giornoAssegnato.giorno,
                        timestamp: timestampGiorno
                    });

                    // Logga il giorno assegnato in formato timestamp e leggibile
                    console.log(`Argomento ${argomentoIndex + 1}:`, {
                        giornoLeggibile: `${giornoAssegnato.giorno}/${giornoAssegnato.mese + 1}/${giornoAssegnato.anno}`,
                        timestamp: timestampGiorno
                    });

                    // Aggiorna l'argomento con il giorno assegnato
                    const argomentoConGiorno = {
                        ...argomenti[argomentoIndex],
                        giorno: timestampGiorno, // Assegna il timestamp
                    };

                    // Aggiungi l'argomento al giorno corrente
                    giorniCorso[posizione] = {
                        ...giornoAssegnato, // Crea una copia immutabile del giorno
                        argomenti: [...(giornoAssegnato.argomenti || []), argomentoConGiorno], // Aggiungi l'argomento
                    };

                    // Incrementa la posizione di "step" e riparti dalla differenza se supera i giorni totali
                    posizione = posizione + step;
                    if (posizione >= lunghezzaCorso) {
                        posizione = posizione - lunghezzaCorso; // Riparti dalla differenza

                        if (posizione === 0) {
                            posizione += 1; // Aggiungi un offset di 1 (o un altro valore piccolo)
                        }
                    }
                }
            }

            console.log("Giorni corso dopo distribuzione:", giorniCorso);

            // Aggiorna lo stato Redux con la copia aggiornata
            state.giorniCorso = giorniCorso;
            state.primaVisita = true;

        },


        distribuisciArgomentiGiorniCorsoEdit: (state, action) => {
            const { argomenti, dataInizio, dataFine } = action.payload;

            console.log("ARGOMENTI INIZIALIIII : ", argomenti);

            // Crea un array temporaneo con la prima metà dei giorniCorso (fino a oggi incluso)
            const oggi = new Date();
            oggi.setHours(0, 0, 0, 0); // Imposta l'ora a mezzanotte per confronto solo per data

            const tempGiorniPassati = [];
            for (let d = new Date(dataInizio); d <= oggi; d.setDate(d.getDate() + 1)) {
                d.setHours(0, 0, 0, 0);

                const giornoEsistente = state.giorniCorso.find(
                    (giorno) =>
                        giorno.giorno === d.getDate() &&
                        giorno.mese === d.getMonth() &&
                        giorno.anno === d.getFullYear()
                );

                tempGiorniPassati.push({
                    giorno: d.getDate(),
                    mese: d.getMonth(),
                    anno: d.getFullYear(),
                    argomenti: giornoEsistente ? [...giornoEsistente.argomenti] : [], // Copia gli argomenti se esistono
                });
            }



            console.log("GIORNI PASSATIIII : ", tempGiorniPassati);

            // tempGiorniPassati ora contiene tutti i giorni fino a oggi incluso
            // Crea un array temporaneo con gli argomenti già distribuiti nei giorni passati
            const argomentiDistribuitiIds = tempGiorniPassati
                .flatMap(giorno => giorno.argomenti)
                .map(arg => arg.id);

            // Crea un array temporaneo con gli argomenti ancora da distribuire
            const argomentiDaDistribuire = argomenti.filter(arg =>
                !argomentiDistribuitiIds.includes(arg.id)
            );

            console.log("ARGOMENTI DA DISTRIBUIREEEEE : ", argomentiDaDistribuire);


            // Crea un array temporaneo con i giorni futuri (dal giorno dopo oggi fino a dataFine)
            const dataFineCorso = new Date(dataFine);
            const domani = new Date();
            domani.setDate(domani.getDate() + 1);

            const giorniFuturi = [];
            for (let d = new Date(domani); d <= dataFineCorso; d.setDate(d.getDate() + 1)) {
                d.setHours(0, 0, 0, 0);

                giorniFuturi.push({
                    giorno: d.getDate(),
                    mese: d.getMonth(),
                    anno: d.getFullYear(),
                    argomenti: [],
                });
            }


            console.log("GIORNI FUTURIIIII : ", giorniFuturi);


            // Distribuisci gli argomenti nei giorni futuri con distribuzione uniforme
            const lunghezzaGiorniFuturi = giorniFuturi.length;

            // Array per tracciare gli aggiornamenti dei giorni degli argomenti
            const argomentiAggiornamenti = [];

            if (lunghezzaGiorniFuturi > 0) {
                // Calcola lo step per distribuire gli argomenti
                const step = Math.max(Math.ceil(lunghezzaGiorniFuturi / argomentiDaDistribuire.length), 1);

                // Distribuisci gli argomenti
                let posizione = 0; // Variabile per tracciare la posizione corrente
                for (let argomentoIndex = 0; argomentoIndex < argomentiDaDistribuire.length; argomentoIndex++) {
                    const argomento = argomentiDaDistribuire[argomentoIndex];
                    const giornoAssegnato = giorniFuturi[posizione];

                    // Assegna l'argomento al giorno corrente
                    giorniFuturi[posizione] = {
                        ...giornoAssegnato, // Crea una copia immutabile del giorno
                        argomenti: [...(giornoAssegnato.argomenti || []), argomento], // Aggiungi l'argomento
                    };

                    // Calcola il timestamp del giorno assegnato usando le utility
                    const timestampGiorno = timestampUtils.componentsToUnix(
                        giornoAssegnato.anno,
                        giornoAssegnato.mese,
                        giornoAssegnato.giorno
                    );

                    // Aggiungi l'aggiornamento all'array
                    const aggiornamento = {
                        id: argomento.id,
                        giorno: timestampGiorno
                    };

                    console.log(`Creando aggiornamento per argomento ${argomento.id}:`, {
                        argomento_id: argomento.id,
                        argomento_titolo: argomento.titolo,
                        giorno_assegnato: giornoAssegnato,
                        timestamp_unix: timestampGiorno,
                        data_readable: timestampUtils.unixToJsDate(timestampGiorno).toLocaleDateString(),
                        debug_conversion: {
                            components_used: `${giornoAssegnato.anno}-${giornoAssegnato.mese + 1}-${giornoAssegnato.giorno}`,
                            timestamp_generated: timestampGiorno,
                            back_to_date: timestampUtils.unixToJsDate(timestampGiorno).toDateString()
                        }
                    });

                    argomentiAggiornamenti.push(aggiornamento);

                    // Incrementa la posizione di "step" e riparti dalla differenza se supera i giorni totali
                    posizione = posizione + step;
                    if (posizione >= lunghezzaGiorniFuturi) {
                        posizione = posizione - lunghezzaGiorniFuturi; // Riparti dalla differenza

                        // Se la differenza è zero, aggiungi un piccolo offset per sfasare la distribuzione
                        if (posizione === 0) {
                            posizione += 1; // Aggiungi un offset di 1 (o un altro valore piccolo)
                        }
                    }
                }
            }


            console.log("ARGOMENTI FUTURI DISTRIBUITIII : ", argomentiDaDistribuire);
            console.log("AGGIORNAMENTI ARGOMENTI : ", argomentiAggiornamenti);


            // Unisci i giorni passati e futuri per aggiornare giorniCorso
            state.giorniCorso = [...tempGiorniPassati, ...giorniFuturi];

            // Salva gli aggiornamenti nello state per permettere al componente di accedervi
            state.argomentiAggiornamenti = argomentiAggiornamenti;

            console.log("ARGOMENTI AGGIORNAMENTI FINALE??? : ", state.argomentiAggiornamenti);

        },



        inizializzaCalendario: (state, action) => {
            state.giorniCorrenti = action.payload.giorniCorrenti;
        },

        aggiornaTitoliGiorni: (state, action) => {
            const { argomenti } = action.payload; // Ricevi argomenti come payloadù
            console.log("💬 Aggiornamento titoli giorniiii", argomenti);

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

        setPrimaDistribuzioneEffettuata: (state) => {
            state.primaDistribuzioneEffettuata = true;
            console.log("Stato primaDistribuzioneEffettuata CALENDARIO aggiornato a true");

        },

        spostaArgomento: (state, action) => {

            console.log("Azione spostaArgomento ricevuta:", action.payload);

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

            console.log("Stato giorniCorso dopo spostamento:", state.giorniCorso);
        }

    }
});

export const selectDataInizioOriginal = (state) => state.calendario.dataInizioOriginal;
export const selectDataFineOriginal = (state) => state.calendario.dataFineOriginal;

export const { aggiornaSelezionato, inizializzaCalendario, spostaArgomento, aggiornaTitoliGiorni, aggiornaDataInizioOriginal, aggiornaDataFineOriginal, setPrimaDistribuzioneEffettuata, distribuisciArgomentiGiorniCorso, distribuisciArgomentiGiorniCorsoEdit } = calendarioSlice.actions;

export default calendarioSlice.reducer;