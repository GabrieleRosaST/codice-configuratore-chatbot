
import domandaIcon from '../img/domandaIcon.svg';
import frecciaDestra from '../img/frecciaDestra.svg';
import { useSelector, useDispatch } from 'react-redux';
import { aggiornaSelezionato, inizializzaCalendario, spostaArgomento, distribuisciArgomentiGiorniCorso, aggiornaTitoliGiorni } from '../store/calendarioSlice';
import terminaConfigIcon from '../img/terminaConfigIcon.svg';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Giorno from '../components/giorno.jsx';
import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGenerateJson } from '../utils/generateJson';
import { useState } from 'react';
import closeAiutoIcon from '../img/closeAiutoIcon.svg';
import obiettivoIcon from '../img/obiettivoIcon.svg';
import studentIcon from '../img/studentIcon.svg';
import fileStorage from '../utils/fileStorage'; // Importa fileStorage
import { useStepContext } from '../context/StepContext';

import { db } from '../firebase';
import { doc, setDoc, collection } from "firebase/firestore";
import { uploadFilesAndGetData } from '../utils/api';


let dataInizioGlobal = null;
let dataFineGlobal = null;
let shouldRedistribute = false;


function PianoLavoro({ sesskey, wwwroot }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const generateJson = useGenerateJson(); // Usa il custom hook
    const { isEditMode } = useStepContext(); // Recupera la modalità edit
    const { selezionato, giorniCorrenti, giorniCorso, argomentiDistribuiti, primaVisita } = useSelector((state) => state.calendario);
    const { dataInizio, dataFine } = useSelector((state) => state.form);

    // Ordina gli argomenti per ID crescente usando useMemo per evitare ricreare l'array ad ogni render
    const argomentiRaw = useSelector((state) => state.argomenti.argomenti);
    const argomenti = useMemo(() => {
        return [...argomentiRaw].sort((a, b) => a.id - b.id);
    }, [argomentiRaw]);

    const { cambiatoTitolo } = useSelector((state) => state.argomenti);

    const [mostraAiuto, setMostraAiuto] = useState(false); // Stato per gestire la visibilità del div di aiuto
    const [isLoading, setIsLoading] = useState(false); // Stato per il loading del pulsante
    const dataInizioDate = new Date(dataInizio);

    // Funzione per determinare se un giorno è passato
    const isDayPast = (giorno, mese, anno) => {
        if (!isEditMode) return false; // Se non siamo in modalità edit, nessun giorno è "passato"

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Imposta l'ora a mezzanotte per confronto solo per data

        const dayDate = new Date(anno, mese, giorno);
        dayDate.setHours(0, 0, 0, 0);

        return dayDate < today;
    };



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
        if (dataInizioGlobal === null || dataFineGlobal === null) {
            dataInizioGlobal = dataInizio;
            dataFineGlobal = dataFine;
        } else if (dataInizioGlobal !== dataInizio || dataFineGlobal !== dataFine) {
            shouldRedistribute = true;
            dataInizioGlobal = dataInizio;
            dataFineGlobal = dataFine;
        }
    }, []);



    useEffect(() => {
        dispatch(aggiornaSelezionato({ mese: dataInizioDate.getMonth(), anno: dataInizioDate.getFullYear() }));

        if (shouldRedistribute) {
            dispatch(distribuisciArgomentiGiorniCorso({
                argomenti,
                dataInizio,
                dataFine,
                isEditMode, // Passa la modalità edit per filtrare i giorni passati
            }));
            shouldRedistribute = false;
        }

        // Se il numero o gli id degli argomenti sono cambiati, ridistribuisci
        const argomentiIds = argomenti.map(a => a.id).slice().sort().join(',');
        const distribuitiIds = (argomentiDistribuiti || []).slice().sort().join(',');
        if (argomentiIds !== distribuitiIds) {
            dispatch(distribuisciArgomentiGiorniCorso({
                argomenti,
                dataInizio,
                dataFine,
                isEditMode, // Passa la modalità edit per filtrare i giorni passati
            }));
        }
        // eslint-disable-next-line
    }, [dispatch, argomenti, shouldRedistribute, giorniCorso, argomentiDistribuiti, isEditMode]);




    // Inizializza i giorni del calendario in Redux
    useEffect(() => {

        const giorniCorrenti = costruisciCalendario();

        dispatch(inizializzaCalendario({ giorniCorrenti }));

    }, [dispatch, selezionato]);

    useEffect(() => {

        if (primaVisita) {

            dispatch(aggiornaTitoliGiorni({ argomenti }));
        }
    }, [dispatch, cambiatoTitolo]);



    //Funzione per inviare i dati al backend e creare FORMDATA

    //BRANCH FINALE

    const handleTerminaConfigurazione = async () => {
        // Attiva il loading
        setIsLoading(true);

        try {
            // Genera il JSON con i dati della pagina CONFIGURAZIONE
            const jsonData = generateJson();

            let filesToUpload = [];

            const dati = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;


            // Itera sugli argomenti e aggiungi i file al FormData
            argomenti.forEach((argomento) => {
                if (fileStorage[argomento.id]) {
                    fileStorage[argomento.id].forEach((file) => {
                        filesToUpload.push({ file, argomentoId: argomento.id, titoloArgomento: argomento.titolo });
                    });
                }
            });

            let uploadResult;

            try {

                uploadResult = await uploadFilesAndGetData(filesToUpload, jsonData, {
                    sesskey: sesskey,
                    wwwroot: wwwroot
                });
            } catch (error) {
                console.error('Errore durante l\'upload dei dati:', error);
                alert('Errore durante il caricamento dei dati: ' + error.message);
                // Disattiva il loading solo in caso di errore
                setIsLoading(false);
                return;
            }
            let response;
            try {
                response = await fetch(`${wwwroot}/lib/ajax/service.php?sesskey=${sesskey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify([{
                        methodname: 'local_configuratore_save_chatbot_config',
                        args: {
                            data: typeof jsonData === "string" ? jsonData : JSON.stringify(jsonData),
                            filedata: uploadResult.files
                        }
                    }])
                });
            } catch (e) {
                console.error('Errore rete WS:', e);
                alert('Errore di rete durante il salvataggio: ' + (e?.message || e));
                setIsLoading(false);
                return;
            }
            /*
            const json = await response.json();
            result = json[0]?.data;

            const nomeChatbot = dati?.DatiIniziali?.nomeChatbot;
            const courseName = dati?.DatiIniziali?.corsoChatbot;
            const descrizioneChatbot = dati?.DatiIniziali?.descrizioneChatbot;
            const istruzioniChatbot = dati?.DatiIniziali?.istruzioniChatbot
            const dataInizio = dati?.DatiIniziali?.dataInizio;
            const dataFine = dati?.DatiIniziali?.dataFine;

            const userId = String(result?.userid);
            const displayName = result?.username;
            const email = result?.email;
            const courseId = String(result?.courseid);

            //prova db
            const userRef = doc(db, 'users', userId);

            await setDoc(userRef, {
                displayName: displayName || '',
                email: email || '',
                tipologia_studente: 'nessuna',
                userId: userId
            }, { merge: true });

            // Crea la struttura: users/{userId}/courses/{courseId}
            const courseRef = doc(db, 'users', userId, 'courses', courseId);

            await setDoc(courseRef, {
                courseName: courseName || '',
                nomeChatbot: nomeChatbot || '',
                descrizioneChatbot: descrizioneChatbot || '',
                istruzioniChatbot: istruzioniChatbot || '',
                dataInizio: dataInizio || '',
                dataFine: dataFine || ''
            }, { merge: true });

            // Se vuoi aggiungere una conversazione (chat) sotto il corso:
            const conversationsRef = collection(db, 'users', userId, 'courses', courseId, 'conversations');
        } catch (error) {
            console.error('Errore durante l\'invio dei dati:', error);
            alert('Errore durante il salvataggio: ' + error.message);
            // Disattiva il loading solo in caso di errore
            setIsLoading(false);
        }
        if (result && result.success === true) {
            // NON disattivare il loading qui, mantienilo attivo durante il redirect
            window.parent.location.href = `${wwwroot}/course/view.php?id=${result.courseid}`;
            return;
        } else {
            // Disattiva il loading se non c'è successo
            setIsLoading(false);
        }*/
            let resp;
            try {
                resp = await response.json();
            } catch (e) {
                console.error('JSON non valido dalla risposta WS:', e);
                alert('Risposta non valida dal server.');
                setIsLoading(false);
                return;
            }

            const envelope = resp?.[0];
            if (envelope?.exception || envelope?.error) {
                console.error('WS Error:', envelope);
                alert(envelope?.message || 'Errore durante il salvataggio');
                setIsLoading(false);
                return;
            }

            const data = envelope?.data;
            if (!data?.success) {
                setIsLoading(false);
                return;
            }

            try {
                const userId = String(data?.userid || '');
                const displayName = data?.username || '';
                const email = data?.email || '';
                const courseId = String(data?.courseid || '');

                if (userId && courseId) {
                    const userRef = doc(db, 'users', userId);
                    await setDoc(userRef, {
                        displayName: displayName,
                        email: email,
                        tipologia_studente: 'nessuna',
                        userId: userId
                    }, { merge: true });

                    const courseRef = doc(db, 'users', userId, 'courses', courseId);
                    await setDoc(courseRef, {
                        courseName: dati?.DatiIniziali?.corsoChatbot || '',
                        nomeChatbot: dati?.DatiIniziali?.nomeChatbot || '',
                        descrizioneChatbot: dati?.DatiIniziali?.descrizioneChatbot || '',
                        istruzioniChatbot: dati?.DatiIniziali?.istruzioniChatbot || '',
                        dataInizio: dati?.DatiIniziali?.dataInizio || '',
                        dataFine: dati?.DatiIniziali?.dataFine || ''
                    }, { merge: true });

                    // facoltativo:
                    // const conversationsRef = collection(db, 'users', userId, 'courses', courseId, 'conversations');
                }
            } catch (e) {
                // Non bloccare il redirect per errori Firestore
                console.warn('Errore Firestore (non bloccante):', e);
            }

            // 7) Redirect forte
            const url = data.redirecturl || `${wwwroot}/course/view.php?id=${data.courseid}`;
            try {
                window.top.location.replace(url);
            } catch (e) {
                window.location.replace(url);
            }
            // non fare setIsLoading(false); lasciamo lo spinner fino al cambio pagina

        } catch (err) {
            console.error('Errore imprevisto:', err);
            alert('Errore imprevisto: ' + (err?.message || err));
            setIsLoading(false);
        }
    };

    // Funzione per salvare la bozza e uscire
    const saveAsDraft = async () => {
        // TODO: Implementare il salvataggio della bozza con piano lavoro
        // Qui andrà la logica per salvare il piano lavoro come bozza

        try {
            // Per ora mostra un messaggio
            alert("Funzione salvataggio bozza piano lavoro - da implementare");

            // Dopo il salvataggio, torna alla dashboard
            window.parent.location.href = `${wwwroot}/local/configuratore/onboarding.php`;
        } catch (error) {
            console.error('❌ Errore nel salvataggio bozza:', error);
            alert(`Errore nel salvataggio: ${error.message}`);
        }
    };



    return (
        <DndProvider backend={HTML5Backend}>
            {/* Overlay di loading che blocca tutta l'interfaccia */}
            {isLoading && (
                <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 flex flex-col items-center" style={{ boxShadow: '0px 0px 17px 0px rgba(0,0,0,0.17)' }}>
                        <div className="w-8 h-8 border-4 border-[#fcc63d] border-t-transparent rounded-full animate-spin mb-4"></div>
                        <h3 className="text-lg font-semibold text-[#21225f] mb-2">Salvataggio in corso...</h3>
                        <p className="text-sm text-[#4f5255] text-center">
                            Stiamo salvando la configurazione del tuo chatbot.<br />
                            Non chiudere questa finestra.
                        </p>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col items-center justify-start ">

                {/* Mostra il div di aiuto se mostraAiuto è true */}
                {mostraAiuto ? (
                    <div className="w-[100%] xl:w-[86%] mx-auto  flex flex-col items-center justify-">

                        <div className="w-full h-14 mb-6  relative flex items-center justify-center md:justify-start " >
                            <button
                                className="w-21 h-9 rounded-[25px] bg-white flex items-center justify-center cursor-pointer transform transition-transform duration-200 hover:scale-102"
                                style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                                onClick={() => setMostraAiuto(false)} // Nascondi il div di aiuto
                            >
                                <img src={closeAiutoIcon} alt="Icona domanda" className="w-2.5 h-2.5 mr-2" />
                                <p className="text-[13px] text-center text-[#4f5255]">

                                    Chiudi</p>
                            </button>
                        </div>


                        <div className="w-[65%] mx-auto mt-1 mb-3 p-5  bg-white rounded-[15px] flex justify-center items-center flex-col"
                            style={{ boxShadow: '0px 0px 6px 6px rgba(0,0,0,0.0)', outline: '1px solid #E5E5E7' }}>

                            <div className="w-[90%]  h-10  relative flex items-center  justify-center mt-4 gap-3 mb-3 ">
                                <img src={obiettivoIcon} className='w-5 h-5 ' />
                                <h2 className="text-[18px] h-full flex  items-center font-bold text-center text-[#21225f]">A cosa serve questa pagina?</h2>

                            </div>

                            <div className='w-[82%] mx-auto '>
                                <ul className="list-disc list-inside text-[14px] text-[#4f5255] space-y-2">
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
                                <h2 className="text-[18px] h-full flex  items-center font-bold text-center text-[#21225f]">Cosa vedranno gli studenti?

                                </h2>

                            </div>

                            <div className='w-[82%] mx-auto'>
                                <p className='text-[14px] text-[#4f5255] mb-3'>
                                    All’interno del chatbot, gli studenti troveranno dei suggerimenti che li guideranno nello studio, come:
                                </p>
                                <ul className='list-disc list-inside text-[14px] text-[#4f5255] space-y-1 mb-3'>
                                    <li>"Studia la lezione di oggi”</li>
                                    <li>“Ripassa la lezione precedente”
                                    </li>
                                </ul>

                                <p className='text-[14px] text-[#4f5255] mb-3 mt-5'>
                                    Il chatbot seguirà il piano che hai impostato, fornendo supporto coerente con il programma del corso. Questo li aiuta a:

                                </p>
                                <ul className='list-disc list-inside text-[14px] text-[#4f5255] space-y-1 mb-14'>
                                    <li>Mantenere un ritmo di studio regolare
                                    </li>
                                    <li>Restare organizzati
                                    </li>
                                    <li>Studiare gli argomenti nel momento più adatto</li>
                                </ul>

                                <p className='text-[14px] text-[#4f5255] mb-5'>📌 Nota: Lo studente può comunque utilizzare il chatbot in qualsiasi momento, anche al di fuori del calendario impostato.</p>
                            </div>



                        </div>

                    </div>

                ) : (
                    <>





                        {/* Header con aiuto, mese e anno */}
                        <div className="w-[100%] xl:w-[86%] min-h-14 flex justify-between items-center relative ">

                            <div className=" z-13 h-10  flex items-center justify-center "
                            >
                                <button
                                    className="w-20 h-9 rounded-[25px] bg-white flex items-center justify-center cursor-pointer transform transition-transform duration-200 hover:scale-102"
                                    onClick={() => setMostraAiuto(true)}
                                    style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                                >
                                    <img src={domandaIcon} alt="Icona domanda" className="w-2 mr-2 ml-1" />
                                    <p className="text-[14px] text-center text-[#4f5255]">Aiuto</p>
                                </button>
                            </div>

                            <div className="w-40 flex h-11 mt-2 relative flex justify-between items-center ">

                                <div className="w-5 h-5   ">
                                    <button
                                        className="w-full h-full cursor-pointer flex items-center justify-center"
                                        onClick={() => cambiaMese('sinistra')}
                                    >
                                        <img src={frecciaDestra} className=" transform transition-transform transform rotate-180 duration-200 opacity-80 hover:scale-105" />
                                    </button>
                                </div>

                                <p className="text-[17px] font-bold text-center text-[#21225f]  mx-2">
                                    {mesi[selezionato.mese]}
                                </p>

                                <div className="w-4 h-4 ">
                                    <button
                                        className="w-full h-full cursor-pointer flex items-center justify-center"
                                        onClick={() => cambiaMese('destra')}
                                    >
                                        <img src={frecciaDestra} className=" transform transition-transform duration-200 opacity-80 hover:scale-105" />
                                    </button>
                                </div>

                            </div>



                            <div className=" h-14 flex items-center justify-end  pl-2">

                                <div className="w-18 h-9 rounded-[25px] bg-white  flex items-center justify-center" style={{ outline: '1px solid rgba(229, 229, 231, 0.6)' }}>
                                    <p className="w-full h-full text-[13px] font-bold text-center text-[#21225f] flex items-center justify-center">
                                        {selezionato.anno}
                                    </p>
                                </div>

                            </div>
                        </div>


                        {/* CONTENITORE CALENDARIO */}

                        <div className="w-[100%] xl:w-[86%] h-auto mt-6  bg-[#E5E5E7] rounded-[15px] overflow-hidden "
                            style={{
                                boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7'
                            }}>
                            <div className="grid grid-cols-7 gap-[1px]  ">


                                {/* Giorni della settimana */}
                                {giorniSettimana.map((giorno, index) => (
                                    <div key={index} className="text-center h-10 bg-white text-[12px] font-medium text-[#21225f] flex items-center justify-center">
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

                                    // Determina se il giorno è passato (solo in modalità edit)
                                    const isPast = isDayPast(giornoCorrente.giorno, giornoCorrente.mese, giornoCorrente.anno);

                                    return (
                                        <Giorno
                                            key={index}
                                            giorno={isInCorso ? giornoCorso : giornoCorrente} // Passa il giorno del corso se esiste, altrimenti il giorno normale
                                            isInCorso={isInCorso}
                                            isPast={isPast} // Passa l'informazione se il giorno è passato
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


                        {/* Pulsanti Esci e salva bozza e Termina configurazione */}
                        <div className="w-[100%] xl:w-[86%] h-30 2xl:mt-4 mt-1 flex justify-between items-center">

                            {/* Pulsante Esci e salva bozza */}
                            <button
                                type="button"
                                onClick={saveAsDraft}
                                disabled={isLoading}
                                className={`w-40 h-11 transform rounded-[10px] transition-transform duration-200 ${isLoading
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer hover:scale-103 hover:bg-[#f2f3f7]'
                                    }`}
                            >
                                <div
                                    className="w-full h-full rounded-[10px] border-[0.7px] border-[#1d2125]/20 flex justify-stretch"
                                    style={{ filter: "drop-shadow(0px 2px 8.5px rgba(0,0,0,0.05))" }}
                                >
                                    <div className="h-full w-16 flex items-center justify-center">
                                        <img src={esciSalvaIcon} alt="" className="w-3.5" />
                                    </div>
                                    <div className="h-full flex items-center w-full">
                                        <p className="text-[13px] text-left text-[#1d2125]">
                                            Esci e salva bozza
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Pulsante Step Successivo */}
                            <button
                                className={`w-48 h-11 right-0 transform transition-transform duration-200 ${isLoading
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer hover:scale-103'
                                    }`}
                                onClick={isLoading ? undefined : handleTerminaConfigurazione}
                                disabled={isLoading}
                            >

                                <div
                                    className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-center items-center"
                                    style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}>

                                    {isLoading ? (
                                        // Mostra solo uno spinner semplice nel pulsante
                                        <div className="w-5 h-5 border-2 border-[#1d2125] border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        // Mostra il contenuto normale
                                        <>
                                            <div className="h-full flex items-center w-full pl-5">
                                                <p className="text-[13px] text-left text-[#1d2125]">
                                                    Termina configurazione
                                                </p>
                                            </div>

                                            <div className="w-12 flex pr-1 justify-center ">
                                                <img src={terminaConfigIcon} alt="" className="w-3" />
                                            </div>
                                        </>
                                    )}

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





