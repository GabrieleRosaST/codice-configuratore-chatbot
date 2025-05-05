import React from 'react';
import domandaIcon from '../img/domandaIcon.svg';
import frecciaDestra from '../img/frecciaDestra.svg';
import { useSelector, useDispatch } from 'react-redux';
import { aggiornaSelezionato, inizializzaCalendario, spostaArgomento, distribuisciArgomentiGiorniCorso } from '../store/calendarioSlice';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import terminaConfigIcon from '../img/terminaConfigIcon.svg';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Giorno from '../components/giorno.jsx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateJson } from '../utils/generateJson';
import { useState } from 'react';
import closeAiutoIcon from '../img/closeAiutoIcon.svg';
import obiettivoIcon from '../img/obiettivoIcon.svg';
import studentIcon from '../img/studentIcon.svg';



function PianoLavoro() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const generateJson = useGenerateJson(); // Usa il custom hook
    const { selezionato, giorniCorrenti, giorniCorso } = useSelector((state) => state.calendario);
    const { dataInizio, dataFine } = useSelector((state) => state.form);
    const { argomenti } = useSelector((state) => state.argomenti);

    const [mostraAiuto, setMostraAiuto] = useState(false); // Stato per gestire la visibilità del div di aiuto
    console.log(mostraAiuto)

    const dataInizioDate = new Date(dataInizio);

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

        dispatch(aggiornaSelezionato({ mese: nuovoMese, anno: nuovoAnno }));
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
        const mesePrecedente = mese === 0 ? 11 : mese - 1; // Se mese è gennaio, il mese precedente è dicembre
        const annoPrecedente = mese === 0 ? anno - 1 : anno; // Se mese è gennaio, l'anno precedente è l'anno - 1
        const giorniMesePrecedente = new Date(annoPrecedente, mesePrecedente + 1, 0).getDate();

        // Costruisci array dei giorni
        const giorni = [];

        // Aggiungi giorni del mese precedente
        for (let i = giorniMesePrecedente - offsetInizio + 1; i <= giorniMesePrecedente; i++) {
            giorni.push({ giorno: i, mese: mesePrecedente, anno: annoPrecedente, tipo: "precedente", argomenti: [] });
        }

        // Aggiungi giorni del mese corrente
        for (let i = 1; i <= giorniMeseCorrente; i++) {
            giorni.push({ giorno: i, mese: mese, anno: anno, tipo: "corrente", argomenti: [] });
        }

        // Aggiungi giorni del mese successivo per completare la griglia
        const giorniSuccessivi = 42 - giorni.length; // 42 = 7 colonne x 6 righe (massimo possibile)
        const meseSuccessivo = mese === 11 ? 0 : mese + 1; // Se mese è dicembre, il mese successivo è gennaio
        const annoSuccessivo = mese === 11 ? anno + 1 : anno; // Se mese è dicembre, l'anno successivo è l'anno + 1
        for (let i = 1; i <= giorniSuccessivi; i++) {
            giorni.push({ giorno: i, mese: meseSuccessivo, anno: annoSuccessivo, tipo: "successivo", argomenti: [] });
        }

        // Rimuovi l'ultima riga se contiene solo giorni del mese successivo
        const righe = [];
        for (let i = 0; i < giorni.length; i += 7) {
            righe.push(giorni.slice(i, i + 7));
        }

        if (righe.length > 0 && righe[righe.length - 1].every((giorno) => giorno.tipo === "successivo")) {
            righe.pop();
        }

        return righe.flat(); // Appiattisci l'array per restituire i giorni
    };


    useEffect(() => {
        dispatch(aggiornaSelezionato({ mese: dataInizioDate.getMonth(), anno: dataInizioDate.getFullYear() }));

        // Distribuisci gli argomenti solo al primo caricamento della pagina
        dispatch(distribuisciArgomentiGiorniCorso({
            argomenti,
            dataInizio,
            dataFine,
        }));
    }, []); // Dipendenza vuota: viene eseguito solo al primo rendering


    // Inizializza i giorni del calendario in Redux
    useEffect(() => {
        console.log("Selezionato:", dataInizioDate.getMonth(), dataInizioDate.getFullYear());

        const giorniCorrenti = costruisciCalendario();

        dispatch(inizializzaCalendario({ giorniCorrenti }));

    }, [dispatch, selezionato]);


    //Funzione per inviare i dati al backend 
    const handleTerminaConfigurazione = async (event) => {
        event.preventDefault(); // Previeni il comportamento predefinito del modulo

        try {
            // Genera il JSON
            const jsonData = generateJson();
            console.log('Dati inviati al backend:', jsonData); // Log per verificare i dati

            // Invia i dati al backend
            const response = await fetch('http://localhost/progetto-1/backend/api/index.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: jsonData, // Invia il JSON generato
            });


            const data = await response.json();
            console.log('Risposta dal backend:', data); // Log per verificare la risposta

            // Gestisci la risposta
            if (data.success) {
                alert('Corso creato con successo!');
                window.location.href = data.courseUrl; // Reindirizza alla pagina del corso di Moodle
            } else {
                alert(`Errore: ${data.error}`);
            }
        } catch (error) {
            console.error('Errore durante la creazione del corso:', error);
            alert('Errore durante la creazione del corso.');
        }
    };






    return (
        <DndProvider backend={HTML5Backend}>
            <div className="h-full">

                {/* Mostra il div di aiuto se mostraAiuto è true */}
                {mostraAiuto ? (
                    <div className="w-[1500px] mx-auto mt-1">
                        <div className="w-full h-15 mb-6 relative flex items-center">
                            <button
                                className="w-[110px] text-[#4f5255] h-10 rounded-[25px] bg-white absolute left-0 flex items-center justify-center  cursor-pointer transform transition-transform duration-200 hover:scale-102 "
                                style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                                onClick={() => setMostraAiuto(false)} // Nascondi il div di aiuto
                            >
                                <img src={closeAiutoIcon} alt="Icona domanda" className="w-3 h-3 mr-2" />
                                <p className="text-lg text-center text-[#4f5255]">Chiudi</p>
                            </button>
                        </div>

                        <div className="w-[1000px] mx-auto mt-1 p-5  bg-white rounded-[15px] "
                            style={{ boxShadow: '0px 0px 6px 6px rgba(0,0,0,0.0)', outline: '1px solid #E5E5E7' }}>

                            <div className="w-full h-12  relative flex items-center  justify-center mb-3 mt-4 gap-3 ">

                                <img src={obiettivoIcon} className='w-6 h-6 ' />
                                <h2 className="text-2xl h-full flex  items-center font-bold text-center text-[#21225f]">A cosa serve questa pagina?</h2>

                            </div>

                            <div className='w-[800px] mx-auto '>
                                <ul className="list-disc list-inside text-lg text-[#4f5255] space-y-4">
                                    <li>
                                        I giorni evidenziati in giallo rappresentano l’intervallo di date in cui il corso (e il chatbot) sarà attivo.
                                    </li>
                                    <li>
                                        Puoi sempre modificare questo periodo tornando al primo step della configurazione, gli argomenti verranno ridistribuiti automaticamente.
                                    </li>
                                    <li>
                                        Puoi trascinare liberamente ogni argomento sul giorno del corso a cui preferisci associarlo.
                                    </li>
                                    <li>
                                        Hai sempre la possibilità di tornare allo step precedente per aggiungere o rimuovere argomenti.
                                    </li>
                                </ul>
                            </div>


                            <div className="w-full h-12  relative flex items-center  justify-center mb-3 mt-10 gap-3 ">

                                <img src={studentIcon} className='w-6 h-6 ' />
                                <h2 className="text-2xl h-full flex  items-center font-bold text-center text-[#21225f]">Cosa vedranno gli studenti?
                                </h2>

                            </div>

                            <div className='w-[800px] mx-auto'>
                                <p className='text-lg text-[#4f5255] mb-3'>
                                    All’interno del chatbot, gli studenti troveranno dei suggerimenti che li guideranno nello studio, come:
                                </p>
                                <ul className='list-disc list-inside text-lg text-[#4f5255] space-y-1 mb-3'>
                                    <li>"Studia la lezione di oggi”</li>
                                    <li>“Ripassa la lezione precedente”
                                    </li>
                                </ul>

                                <p className='text-lg text-[#4f5255] mb-3 mt-5'>
                                    Il chatbot seguirà il piano che hai impostato, fornendo supporto coerente con il programma del corso. Questo li aiuta a:

                                </p>
                                <ul className='list-disc list-inside text-lg text-[#4f5255] space-y-1 mb-14'>
                                    <li>Mantenere un ritmo di studio regolare
                                    </li>
                                    <li>Restare organizzati
                                    </li>
                                    <li>Studiare gli argomenti nel momento più adatto</li>
                                </ul>

                                <p className='text-lg text-[#4f5255] mb-5'>📌 Nota: Lo studente può comunque utilizzare il chatbot in qualsiasi momento, anche al di fuori del calendario impostato.</p>
                            </div>



                        </div>

                    </div>

                ) : (
                    <>





                        {/* Header con aiuto, mese e anno */}
                        <div className="w-[1500px]  m-1 mx-auto h-15 flex justify-between items-center relative">

                            <button
                                className="w-[98px] z-13 h-10 rounded-[25px] bg-white  flex items-center justify-center  z-5 cursor-pointer transform transition-transform duration-200 hover:scale-102 "
                                style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                                onClick={() => setMostraAiuto(true)}
                            >
                                <img src={domandaIcon} alt="Icona domanda" className="w-4 h-4 mr-1" />
                                <p className="text-lg text-center text-[#4f5255]">Aiuto</p>
                            </button>

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
                                {giorniCorrenti.map((giornoCorrente, index) => {

                                    // Trova il giorno corrispondente nei giorni del corso
                                    const giornoCorso = giorniCorso.find(
                                        (g) =>
                                            g.giorno === giornoCorrente.giorno &&
                                            g.mese === giornoCorrente.mese &&
                                            g.anno === giornoCorrente.anno

                                    );

                                    // Determina se il giorno è nel corso
                                    const isInCorso = !!giornoCorso;

                                    //console.log("Anno 1 ", giornoCorso.anno, "Anno 2:", giornoCorrente.anno);


                                    return (
                                        <Giorno
                                            key={index}
                                            giorno={isInCorso ? giornoCorso : giornoCorrente} // Passa il giorno del corso se esiste, altrimenti il giorno normale
                                            isInCorso={isInCorso}
                                            isAltroMese={giornoCorrente.tipo !== "corrente"} // Determina se il giorno appartiene a un altro mese
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
                        <div className="w-[1500px] h-20  mx-auto mt-7  flex justify-between items-center ">
                            <button
                                type="submit"
                                className="w-[196px] h-[46px]"
                            >
                                <div
                                    className="w-full h-full left-[-0.85px] top-[-0.85px] rounded-[10px] border-[0.7px] border-[#1d2125]/30 flex justify-stretch"
                                    style={{ filter: "drop-shadow(0px 2px 8.5px rgba(0,0,0,0.05))" }}
                                >

                                    <div className=" h-full w-16 flex  justify-center pt-3.5">
                                        <img src={esciSalvaIcon} alt="" className="w-[16px] h-[16px]" />
                                    </div>

                                    <div className="h-full flex items-center w-full">
                                        <p className="text-[17px] text-left text-[#1d2125]">
                                            Esci e salva bozza
                                        </p>
                                    </div>

                                </div>

                            </button>

                            {/* Pulsante Termina configurazione */}
                            <button
                                className="w-[232px] h-[46px] right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                                onClick={handleTerminaConfigurazione}
                            >

                                <div
                                    className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                                    style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}>

                                    <div className="h-full flex items-center w-full pl-5">
                                        <p className="text-[17px] text-left text-[#1d2125]">
                                            Termina configurazione
                                        </p>
                                    </div>

                                    <div className=" h-full w-12 flex pr-1 justify-center pt-4">
                                        <img src={terminaConfigIcon} alt="" className="w-[15px] h-[15px]" />
                                    </div>

                                </div>

                            </button>
                        </div>

                    </>
                )}
            </div >

        </DndProvider>
    );
}

export default PianoLavoro