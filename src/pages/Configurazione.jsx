import React, { useRef, useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import invioButton from '../img/invioButton.svg';
import fotoPlaceholder from '../img/fotoBot.svg';
import libroSuggerimento from '../img/libroSuggerimento.svg';
import rewindSuggerimento from '../img/rewindSuggerimento.svg';

import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import frecciaDestraButton from '../img/frecciaDestraButton.svg';

import { useSelector, useDispatch } from 'react-redux';
import { updateForm } from '../store/formSlice';
import { useStepContext } from '../context/StepContext.jsx';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';





function Configurazione({ sesskey, wwwroot }) {

    const dispatch = useDispatch();
    const formState = useSelector((state) => state.form);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { setCompletedSteps, primaVisitaStep1, setPrimaVisitaStep1 } = useStepContext(); // Usa il contesto per aggiornare lo stato


    // Stato per tracciare gli errori
    const [errors, setErrors] = useState({
        nomeChatbot: false,
        corsoChatbot: false,
        dataInizio: false,
        dataFine: false,
    });

    // Stato per controllare il caricamento durante la verifica
    const [isCheckingCourse, setIsCheckingCourse] = useState(false);

    // Stato per tracciare se il nome del corso è stato modificato dopo una validazione
    const [courseNameChanged, setCourseNameChanged] = useState(false);


    // Effetto per monitorare i campi del form
    useEffect(() => {
        const today = new Date();
        const startDate = new Date(formState.dataInizio);
        const endDate = new Date(formState.dataFine);

        // Verifica se tutti i campi sono validi
        const isNomeChatbotValid = formState.nomeChatbot.trim() !== '';
        const isCorsoChatbotValid = formState.corsoChatbot.trim() !== '';
        const isDataInizioValid = formState.dataInizio && startDate > today;
        const isDataFineValid = formState.dataFine && endDate > startDate;

        const isStep1Valid = isNomeChatbotValid && isCorsoChatbotValid && isDataInizioValid && isDataFineValid;

        // Non aggiornare lo step se il nome del corso è stato modificato dopo una validazione
        if (!primaVisitaStep1 && !courseNameChanged) {
            setCompletedSteps((prev) => ({ ...prev, step1: isStep1Valid }));
        }
        // Aggiorna lo stato step1

    }, [formState, setCompletedSteps, primaVisitaStep1, courseNameChanged]);

    const MIN_DATE = new Date("2024-01-01");
    const MAX_DATE = new Date("2030-12-31");

    // Funzione per ottenere l'userId dalle API di Moodle
    const getUserIdFromMoodle = async () => {
        try {
            if (!sesskey || !wwwroot) {
                throw new Error('Parametri Moodle mancanti');
            }

            // Metodo 1: Prova a estrarre userId dall'URL del parent window
            try {
                if (window.parent && window.parent.location) {
                    const parentUrl = window.parent.location.href;

                    // Cerca pattern comuni per userid in Moodle
                    const userIdPatterns = [
                        /[?&]userid=(\d+)/i,
                        /[?&]id=(\d+)/i,
                        /\/user\/view\.php.*[?&]id=(\d+)/i,
                        /\/user\/profile\.php.*[?&]id=(\d+)/i,
                        /\/my\//i  // Se siamo nella dashboard, possiamo provare altri metodi
                    ];

                    for (const pattern of userIdPatterns) {
                        const match = parentUrl.match(pattern);
                        if (match && match[1]) {
                            return String(match[1]);
                        }
                    }
                }
            } catch (urlError) {
                // Fallimento silenzioso
            }

            // Metodo 2: Prova a cercare nell'HTML del parent window
            try {
                if (window.parent && window.parent.document) {
                    const parentDoc = window.parent.document;

                    // Cerca elementi comuni che contengono l'userid
                    const possibleSelectors = [
                        '[data-userid]',
                        '[data-user-id]',
                        '.usermenu [data-userid]',
                        '.userbutton [data-userid]',
                        'body[data-userid]'
                    ];

                    for (const selector of possibleSelectors) {
                        const element = parentDoc.querySelector(selector);
                        if (element) {
                            const userId = element.getAttribute('data-userid') || element.getAttribute('data-user-id');
                            if (userId) {
                                return String(userId);
                            }
                        }
                    }

                    // Cerca script che potrebbero contenere M.cfg.userid
                    const scripts = parentDoc.querySelectorAll('script');
                    for (const script of scripts) {
                        const content = script.textContent || script.innerHTML || '';
                        const match = content.match(/M\.cfg\.userid["\s]*[:=]["\s]*(\d+)/);
                        if (match && match[1]) {
                            return String(match[1]);
                        }
                    }
                }
            } catch (domError) {
                // Fallimento silenzioso
            }

            // Metodo 3: Usa un metodo API più semplice se disponibile
            try {
                // Proviamo con un metodo che sappiamo funzionare dal PianoLavoro
                const response = await fetch(`${wwwroot}/lib/ajax/service.php?sesskey=${sesskey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify([{
                        methodname: 'local_configuratore_get_user_info', // Prova il metodo che hai già
                        args: {}
                    }])
                });

                const json = await response.json();

                if (json[0] && !json[0].error && json[0].data) {
                    const result = json[0].data;
                    if (result.userid) {
                        return String(result.userid);
                    }
                }
            } catch (apiError) {
                // Fallimento silenzioso
            }

            throw new Error('UserId non trovato con nessun metodo disponibile');
        } catch (error) {
            return null;
        }
    };

    // Funzione per verificare se esiste già un corso con lo stesso nome
    const checkCourseExists = async (courseName, userId) => {
        try {
            const coursesRef = collection(db, 'users', userId, 'courses');
            const q = query(coursesRef, where('courseName', '==', courseName));
            const querySnapshot = await getDocs(q);

            const exists = !querySnapshot.empty;
            return exists;
        } catch (error) {
            throw error;
        }
    };

    // Funzione per gestire il submit del form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Impedisci il submit multiplo durante la verifica
        if (isCheckingCourse) {
            return;
        }

        const today = new Date();
        const startDate = new Date(formState.dataInizio);
        const endDate = new Date(formState.dataFine);

        let hasError = false;
        const newErrors = { nomeChatbot: false, corsoChatbot: false, dataInizio: false, dataFine: false };

        // Controllo del nome del chatbot
        if (!formState.nomeChatbot.trim()) {
            newErrors.nomeChatbot = true;
            hasError = true;
        }

        // Controllo del nome del corso
        if (!formState.corsoChatbot.trim()) {
            newErrors.corsoChatbot = true;
            hasError = true;
        }

        // Controllo della data di inizio
        if (!formState.dataInizio) {
            newErrors.dataInizio = true;
            hasError = true;
        } else if (
            startDate <= today ||
            startDate < MIN_DATE ||
            startDate > MAX_DATE
        ) {
            newErrors.dataInizio = true;
            hasError = true;
            alert("La data di inizio deve essere successiva al giorno attuale.");
        }

        // Controllo della data di fine
        if (!formState.dataFine) {
            newErrors.dataFine = true;
            hasError = true;
        } else if (
            endDate <= startDate ||
            endDate < MIN_DATE ||
            endDate > MAX_DATE
        ) {
            newErrors.dataFine = true;
            hasError = true;
            alert("La data di fine deve essere successiva di almeno un giorno alla data di inizio.");
        }

        // Aggiorna lo stato degli errori
        setErrors(newErrors);

        // Se ci sono errori, interrompi l'invio del form
        if (hasError) {
            return;
        }

        try {
            // Imposta lo stato di caricamento
            setIsCheckingCourse(true);

            // Ottieni l'userId dalle API di Moodle
            const userId = await getUserIdFromMoodle();

            if (!userId) {
                alert("Errore nel recupero dell'identificativo utente. Riprova.");
                return;
            }

            // Verifica se esiste già un corso con lo stesso nome
            const courseExists = await checkCourseExists(formState.corsoChatbot, userId);

            if (courseExists) {
                alert(`Esiste già un corso con il nome "${formState.corsoChatbot}". Scegli un nome diverso.`);
                setErrors(prev => ({ ...prev, corsoChatbot: true }));
                return;
            }

            // Se tutto è ok, procedi
            setCompletedSteps((prev) => ({ ...prev, step1: true }));
            setCourseNameChanged(false); // Reset del flag quando la validazione è superata
            setPrimaVisitaStep1(false);
            navigate("/argomentiRiferimenti");

        } catch (error) {
            alert(`Errore durante la verifica del corso: ${error.message}`);
        } finally {
            // Rimuovi lo stato di caricamento
            setIsCheckingCourse(false);
        }
    };





    return (



        <div className="w-full flex flex-col items-center justify-center">

            <div className="w-[100%] xl:w-[86%] min-h-12  relative flex justify-center items-center flex-wrap mt-2">
                <p className="flex flex-grow text-[16px] font-bold justify-center text-center text-[#21225f] ">
                    Configura il corso e l'assistente didattico associato
                </p>
            </div>



            <div className="w-[100%] xl:w-[86%]  2xl:min-h-175 bg-[#F2F3F7] rounded-[50px] flex md:flex-row flex-col mt-6 max-h-[800px] overflow-y-auto custom-scrollbar2">



                {/* PRIMO DIV */}

                <div className="min-w-[50%] h-full rounded-l-xl ">

                    <div className="w-full h-full flex flex-col  items-center relative pt-15 pr-10  ">


                        <form className="space-y-8 w-full flex flex-col items-end  " onSubmit={handleSubmit}>


                            {/* Input per il NOME DEL CORSO */}
                            <div className="mb-8 mt-1 w-[88%]">
                                <p className="w-[205.51px] h-[28.77px] text-[13px] font-medium text-left text-[#1d2125]">Corso</p>
                                <input
                                    id="input-corso"
                                    type="text"
                                    placeholder="Inserisci il nome del corso"
                                    value={formState.corsoChatbot}
                                    onChange={(e) => {
                                        dispatch(updateForm({ corsoChatbot: e.target.value }));
                                        // Reset dello step1 quando viene modificato il nome del corso
                                        setCompletedSteps((prev) => ({ ...prev, step1: false }));
                                        setCourseNameChanged(true);
                                    }}
                                    className={`w-full h-9 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]  text-[13px] placeholder-[#A3A7AA] ${errors.corsoChatbot ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                        } placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`} />
                            </div>


                            {/* Input per il NOME DEL CHATBOT */}
                            <div className="mb-8 w-[88%]">
                                <p className="w-[205.51px] h-[28.77px] text-[13px] font-medium text-left text-[#1d2125]">Assistente</p>
                                <input
                                    id="input-nome"
                                    type="text"
                                    placeholder="Assegna un nome all'assistente"
                                    value={formState.nomeChatbot}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 55) { // Limite di 50 caratteri
                                            dispatch(updateForm({ nomeChatbot: e.target.value }));
                                        }
                                    }}
                                    maxLength={55} // Imposta il limite di caratteri
                                    className={`w-full h-9 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]  text-[13px] placeholder-[#A3A7AA] ${errors.nomeChatbot ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                        } placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`} />
                            </div>





                            {/* Input per la DESCRIZIONE del chatbot */}
                            <div className=" mb-2 w-[88%] ">
                                <p className="w-[205.51px] h-[28.77px] text-[13px] font-medium text-left text-[#1d2125] ">Descrizione</p>
                                <textarea
                                    id="input-descrizione"
                                    placeholder="Scrivi una descrizione per il tuo chatbot"
                                    value={formState.descrizioneChatbot}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 200) {
                                            dispatch(updateForm({ descrizioneChatbot: e.target.value }))
                                        }
                                    }}
                                    className="w-full h-20 2xl:h-28 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none custom-scrollbar"
                                />
                                <p className="text-right text-xs text-gray-500 mt-1 opacity-60">{formState.descrizioneChatbot.length}/200</p>
                            </div>


                            {/* Input per le ISTRUZIONI */}
                            <div className="mb-4 w-[88%]">
                                <p className="w-[205.51px] h-[29px] text-[13px] font-medium text-left text-[#1d2125] ">Istruzioni</p>
                                <textarea
                                    id="input-4"
                                    placeholder="Scrivi delle brevi istruzioni che il chatbot dovrà seguire durante il corso."
                                    className="w-full h-20 2xl:h-28 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none custom-scrollbar"
                                    value={formState.istruzioniChatbot}
                                    onChange={(e) => dispatch(updateForm({ istruzioniChatbot: e.target.value }))}
                                />
                            </div>


                            {/* Input per le DATE */}
                            <div className="flex w-[88%] h-20 flex justify-between items-center ">

                                {/* data di inizio */}
                                <div className="min-w-[40%]  flex flex-col">
                                    <p className="w-full h-[28.77px] text-[13px] font-medium text-left text-[#1d2125] ">Data inizio corso</p>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={formState.dataInizio}
                                        min="2024-01-01"
                                        max="2100-12-31"
                                        onChange={(e) => dispatch(updateForm({ dataInizio: e.target.value }))}
                                        className={`"w-full h-9 p-2 pl-3 rounded-[10px]  bg-white ${errors.dataInizio ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                            } border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                    />
                                </div>

                                {/* data di fine */}
                                <div className="min-w-[40%]  flex flex-col">
                                    <p className="w-full h-[28.77px] text-[13px] font-medium text-left text-[#1d2125] ">Data fine corso</p>
                                    <input
                                        id="end-date"
                                        type="date"
                                        value={formState.dataFine}
                                        min="2024-01-01"
                                        max="2100-12-31"
                                        onChange={(e) => {
                                            dispatch(updateForm({ dataFine: e.target.value }));
                                            setErrors((prev) => ({ ...prev, dataFine: false }));
                                        }}
                                        className={`"w-full h-9 p-2 pl-3 rounded-[10px]  bg-white ${errors.dataFine ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                            } border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                    />
                                </div>
                            </div>


                        </form>
                    </div>


                </div>





                {/* SECONDO DIV */}
                <div className="min-w-[50%] min-h-165  flex justify-center items-center p-8 md:pr-14 2xl:pr-16  ">

                    {/* Contenitore principale */}
                    <div className="min-w-70 w-full min-h-140 2xl:min-h-150 relative flex flex-col  justify-center items-center rounded-[40px] bg-white  border-2 border-[#21225f]/[0.1] shadow-[0px_0px_26px_13px_rgba(0,0,0,0.01)]">

                        {/* Titolo Anteprima */}
                        <div className="w-full absolute h-10 top-0  flex items-center justify-center"
                            style={{ pointerEvents: "none" }}>
                            <p className="text-sm font-bold text-center text-[#21225f]">
                                Anteprima
                            </p>
                            <div className="relative ml-2 group" style={{ pointerEvents: "auto" }}>
                                <div className="w-4 h-4 rounded-full bg-[#6982AB] text-white text-xs flex items-center justify-center cursor-help opacity-35 hover:opacity-100 transition-opacity duration-200">
                                    i
                                </div>
                                {/* Tooltip */}
                                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-[#6982AB] text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 w-75 text-center">
                                    Questa è l’interfaccia che gli studenti visualizzeranno all’avvio di ogni chat con l'assitente.
                                    <br />
                                    Contiene le informazioni principali e due pulsanti che guidano l'avvio della conversazione e lo studio degli argomenti programmati.
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-[#6982AB]"></div>
                                </div>
                            </div>
                        </div>



                        {/* Immagine */}
                        <div className="flex justify-center  items-center w-full ">
                            <img
                                src={formState.fotoChatbot || fotoPlaceholder}
                                className="w-15 h-15 object-cover rounded-full"
                            />
                        </div>


                        {/* Nome chatbot */}
                        {formState.nomeChatbot && (
                            <div className="flex justify-center  items-center w-full mb-2 mt-3">
                                <p className="text-[#495057] w-130 text-[17px] font-bold text-center">{formState.nomeChatbot}</p>
                            </div>
                        )}

                        {/* Descrizione chatbot */}
                        {formState.descrizioneChatbot && (
                            <div className="flex justify-center items-center w-[80%] mb-2 ">
                                <p className="text-[#495057] text-[13px] text-center">{formState.descrizioneChatbot}</p>
                            </div>
                        )}

                        {/* Pulsanti suggerimenti */}
                        <div className="w-full min-h-16 flex items-center justify-center gap-y-2 flex-wrap ">

                            {/* Suggerimento 1 */}
                            <div className="w-50 h-12 relative flex justify-center items-center  "
                                style={{ pointerEvents: "none" }}>
                                <div className="w-47 h-full rounded-[15px] border-[2px] border-[#6982ab]/[0.12] flex justify-center items-center relative">
                                    <img
                                        src={rewindSuggerimento}
                                        alt="Icona"
                                        className="left-5 w-3.5 mr-2 h-4"
                                    />
                                    <p className=" h-7 top-[14px]  text-left text-[#495057] text-[13px]  flex items-center justify-center">
                                        Ripassa le ultime lezioni
                                    </p>

                                </div>
                            </div>

                            <div className="w-50 h-12 relative flex justify-center items-center "
                                style={{ pointerEvents: "none" }}>
                                <div className="w-47 h-full rounded-[15px] border-[2px] border-[#6982ab]/[0.12] flex justify-center items-center relative">
                                    <img
                                        src={libroSuggerimento}
                                        alt="Icona"
                                        className=" left-5 mr-2 w-3.5  h-4"
                                    />
                                    <p className=" h-7 top-[14px]  text-left text-[#495057] text-[13px]  flex items-center justify-center">
                                        Studia la lezione di oggi
                                    </p>

                                </div>
                            </div>






                        </div>

                        {/* barra input messaggio */}
                        <div className="absolute bottom-4  w-full h-15 flex items-center justify-center ">
                            <div className="relative w-[84%] h-9 flex justify-between p-2 rounded-[25px] bg-white border-[1.5px] border-[#6982ab]/[0.15] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.01)]">

                                <p className=" h-full ml-3 opacity-[0.50] text-[13px] text-[#495057] flex items-center justify-center"
                                    style={{ pointerEvents: "none" }}>
                                    Scrivi un messaggio...
                                </p>

                                <img src={invioButton} className="absolute top-1.5 right-3 w-5 h-5 " />

                            </div>

                        </div>


                    </div>
                </div>



            </div>


            <div className="w-[100%] xl:w-[86%] h-30 mx-auto mt-2 flex justify-end items-center ">

                {/* Pulsante Esci e salva bozza
                <button
                    type="submit"
                    className="w-40 h-11 cursor-pointer transform rounded-[10px] transition-transform duration-200 hover:scale-103 hover:bg-[#f2f3f7] "
                >
                    <div
                        className="w-full h-full left-[-0.85px] top-[-0.85px] rounded-[10px] border-[0.7px] border-[#1d2125]/20 flex justify-stretch"
                        style={{ filter: "drop-shadow(0px 2px 8.5px rgba(0,0,0,0.05))" }}
                    >

                        <div className=" h-full w-16 flex items-center justify-center ">
                            <img src={esciSalvaIcon} alt="" className="w-3.5 " />
                        </div>

                        <div className="h-full flex items-center w-full">
                            <p className="text-[13px] text-left text-[#1d2125]">
                                Esci e salva bozza
                            </p>
                        </div>

                    </div>

                </button>
                */}

                {/* Pulsante Step Successivo */}
                <button
                    type="button"
                    className={`w-35 h-11 right-0 cursor-pointer transform transition-transform duration-200 ${isCheckingCourse ? 'opacity-50 cursor-not-allowed' : 'hover:scale-103'
                        }`}
                    onClick={handleSubmit}
                    disabled={isCheckingCourse}
                >

                    <div
                        className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-center items-center"
                        style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}>

                        {isCheckingCourse ? (
                            <div className="w-4 h-4 border-2 border-[#1d2125] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <div className="h-full flex items-center justify-end w-full">
                                    <p className="text-[13px]  text-[#1d2125] flex items-center justify-center">
                                        Step successivo
                                    </p>
                                </div>

                                <div className=" h-full w-12 flex items-center justify-center ">
                                    <img src={frecciaDestraButton} alt="" className="w-2 " />
                                </div>
                            </>
                        )}

                    </div>

                </button>
            </div>



        </div >


    )
}

export default Configurazione