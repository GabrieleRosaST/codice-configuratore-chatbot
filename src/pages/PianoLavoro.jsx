import React from 'react';
import domandaIcon from '../img/domandaIcon.svg';
import frecciaDestra from '../img/frecciaDestra.svg';
import { useSelector, useDispatch } from 'react-redux';
import { aggiornaSelezionato, inizializzaCalendario, spostaArgomento, aggiornaGiorni } from '../store/calendarioSlice';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import terminaConfigIcon from '../img/terminaConfigIcon.svg';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Giorno from '../components/giorno.jsx';
import { useEffect } from 'react';




function PianoLavoro() {
    const dispatch = useDispatch();
    const { selezionato, giorni } = useSelector((state) => state.calendario);
    const { dataInizio, dataFine } = useSelector((state) => state.form);
    const { argomenti } = useSelector((state) => state.argomenti);

    const mesi = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    const giorniSettimana = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];


    const cambiaMese = (direzione) => {
        let nuovoMese = selezionato.mese;
        let nuovoAnno = selezionato.anno;

        if (direzione === 'destra') {
            if (nuovoMese === 11) {
                nuovoMese = 0;
                nuovoAnno += 1;
            } else {
                nuovoMese += 1;
            }
        } else {
            if (nuovoMese === 0) {
                nuovoMese = 11;
                nuovoAnno -= 1;
            } else {
                nuovoMese -= 1;
            }
        }

        dispatch(aggiornaSelezionato({ giorno: selezionato.giorno, mese: nuovoMese, anno: nuovoAnno }));
    };


    // Funzione per costruire il calendario
    const costruisciCalendario = () => {
        const { mese, anno } = selezionato;

        // Giorno della settimana del primo giorno del mese (0 = Domenica, 1 = Lunedì, ...)
        const primoGiorno = new Date(anno, mese, 1).getDay();
        const offsetInizio = (primoGiorno === 0 ? 6 : primoGiorno - 1); // Adatta per iniziare da Lunedì

        // Numero di giorni nel mese corrente
        const giorniMeseCorrente = new Date(anno, mese + 1, 0).getDate();

        // Numero di giorni nel mese precedente
        const giorniMesePrecedente = new Date(anno, mese, 0).getDate();

        // Costruisci array dei giorni
        const giorni = [];

        // Aggiungi giorni del mese precedente
        for (let i = giorniMesePrecedente - offsetInizio + 1; i <= giorniMesePrecedente; i++) {
            giorni.push({ giorno: i, mese: mese - 1, anno: anno, tipo: "precedente", argomenti: [] });
        }

        // Aggiungi giorni del mese corrente
        for (let i = 1; i <= giorniMeseCorrente; i++) {
            giorni.push({ giorno: i, mese: mese, anno: anno, tipo: "corrente", argomenti: [] });
        }

        // Aggiungi giorni del mese successivo per completare la griglia
        const giorniSuccessivi = 42 - giorni.length; // 42 = 7 colonne x 6 righe (massimo possibile)
        for (let i = 1; i <= giorniSuccessivi; i++) {
            giorni.push({ giorno: i, mese: mese + 1, anno: anno, tipo: "successivo", argomenti: [] });
        }

        // Rimuovi l'ultima riga se contiene solo giorni del mese successivo
        const righe = [];
        for (let i = 0; i < giorni.length; i += 7) {
            righe.push(giorni.slice(i, i + 7));
        }

        // Controlla se l'ultima riga contiene solo giorni del mese successivo
        if (righe.length > 0 && righe[righe.length - 1].every((giorno) => giorno.tipo === "successivo")) {
            righe.pop();
        }

        return righe.flat(); // Appiattisci l'array per restituire i giorni
    };


    // Inizializza i giorni del calendario in Redux
    useEffect(() => {
        const giorniCalendario = costruisciCalendario();

        dispatch(inizializzaCalendario({ giorni: giorniCalendario }));

        // Aggiorna i giorni con gli argomenti
        dispatch(aggiornaGiorni({
            giorni: giorniCalendario,
            argomenti,
            dataInizio,
            dataFine,
        }));
    }, [dispatch, selezionato, argomenti, dataInizio, dataFine]);


    // restituisce tutti i giorni del calendario con gli argomenti associati






    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-full">

                {/* Header con aiuto, mese e anno */}
                <div className="w-[1500px] m-1 mx-auto h-15 flex justify-between items-center relative">

                    <div
                        className="w-[98px] h-10 rounded-[25px] bg-white  flex items-center justify-center"
                        style={{ boxShadow: '0px 2px 8.5px 3px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                    >
                        <img src={domandaIcon} alt="Icona domanda" className="w-4 h-4 mr-1" />
                        <p className="text-lg text-center text-[#4f5255]">Aiuto</p>
                    </div>

                    <div className="w-[225px] flex items-center justify-center relative ">

                        <div className="w-9 h-9 absolute left-0 ">
                            <button
                                className="w-full h-full  text-xl font-bold text-[#21225f] cursor-pointer "
                                onClick={() => cambiaMese('sinistra')}
                            >
                                <img src={frecciaDestra} className="w-5 h-5  mx-auto my-auto transform rotate-180 transition-transform duration-200 opacity-80 hover:scale-105" />
                            </button>


                        </div>

                        <p className="text-2xl font-bold text-center text-[#21225f]  mx-2">
                            {mesi[selezionato.mese]}
                        </p>

                        <div className="w-9 h-9 absolute right-0 ">
                            <button
                                className="w-full h-full  text-xl font-bold text-[#21225f] cursor-pointer "
                                onClick={() => cambiaMese('destra')}
                            >
                                <img src={frecciaDestra} className="w-5 h-5  mx-auto my-auto transform transition-transform duration-200 opacity-80 hover:scale-105" />
                            </button>


                        </div>
                    </div>



                    <div className="w-[92px] h-[41px]">

                        <div className="w-full h-full rounded-[25px] bg-white  flex items-center justify-center" style={{ outline: '1px solid rgba(229, 229, 231, 0.6)' }}>
                            <p className="w-full h-full text-[18px] font-bold text-center text-[#21225f] flex items-center justify-center">
                                {selezionato.anno}
                            </p>
                        </div>

                    </div>
                </div>


                {/* CONTENITORE CALENDARIO */}

                <div className="w-[1500px] h-auto mx-auto mt-6 mb-4 bg-[#E5E5E7] rounded-[15px] overflow-hidden "
                    style={{
                        boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7'
                    }}>
                    <div className="grid grid-cols-7 gap-[1px]  ">


                        {/* Giorni della settimana */}
                        {giorniSettimana.map((giorno, index) => (
                            <div key={index} className="text-center h-11 bg-white text-[15px] font-medium text-[#21225f] flex items-center justify-center">
                                {giorno}
                            </div>
                        ))}


                        {/* Giorni del mese */}
                        {giorni.map((giorno, index) => {

                            // Calcola se il giorno è nel corso
                            const isInCorso =
                                new Date(giorno.anno, giorno.mese, giorno.giorno).setHours(0, 0, 0, 0) >= new Date(dataInizio).setHours(0, 0, 0, 0) &&
                                new Date(giorno.anno, giorno.mese, giorno.giorno).setHours(0, 0, 0, 0) <= new Date(dataFine).setHours(0, 0, 0, 0);

                            // Determina se il giorno appartiene a un altro mese
                            const isAltroMese = giorno.tipo !== "corrente";

                            return (
                                <Giorno
                                    key={index}
                                    giorno={giorno}
                                    dataInizio={dataInizio}
                                    dataFine={dataFine}
                                    isInCorso={isInCorso}
                                    isAltroMese={isAltroMese}
                                    spostaArgomento={(argomento, giornoOrigine, giornoDestinazione) => {

                                        // Dispatch per spostare l'argomento
                                        dispatch(spostaArgomento({
                                            argomento,
                                            giornoOrigine,
                                            giornoDestinazione,
                                        }));
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>


                {/* PULSANTI FINALI */}
                <div className="w-[1500px] h-30  mx-auto mt-7  flex justify-between items-center ">
                    <button
                        type="button"
                        className="w-[218px] h-12 "
                    >
                        <div
                            className="w-[218px] h-12  left-[-0.85px] top-[-0.85px] rounded-[10px] border-[0.7px] border-[#1d2125]/30 flex justify-stretch"
                            style={{ filter: "drop-shadow(0px 2px 8.5px rgba(0,0,0,0.05))" }}
                        >

                            <div className=" h-full w-16 flex  justify-center pt-3.5">
                                <img src={esciSalvaIcon} alt="" className="w-[16px] h-[16px]" />
                            </div>

                            <div className="h-full flex items-center w-full">
                                <p className="text-[19px] text-left text-[#1d2125]">
                                    Esci e salva bozza
                                </p>
                            </div>

                        </div>

                    </button>

                    {/* Pulsante Step Successivo */}
                    <button
                        className="w-[250px] h-12 right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                    >

                        <div
                            className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                            style={{ boxShadow: "0px 2px 8.5px 3px rgba(0,0,0,0.05)" }}>

                            <div className="h-full flex items-center w-full pl-5">
                                <p className="text-[19px] text-left text-[#1d2125]">
                                    Termina configurazione
                                </p>
                            </div>

                            <div className=" h-full w-12 flex pr-1 justify-center pt-4">
                                <img src={terminaConfigIcon} alt="" className="w-[16px] h-[16px]" />
                            </div>

                        </div>

                    </button>
                </div>

            </div >

        </DndProvider>
    );
}

export default PianoLavoro