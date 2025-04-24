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

import config1 from '../img/config1.svg';




function Configurazione() {

    const dispatch = useDispatch();
    const formState = useSelector((state) => state.form);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { setCompletedSteps } = useStepContext(); // Usa il contesto per aggiornare lo stato


    // Stato per tracciare gli errori
    const [errors, setErrors] = useState({
        nomeChatbot: false,
        corsoChatbot: false,
        dataInizio: false,
        dataFine: false,
    });


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

        // Aggiorna lo stato step1
        setCompletedSteps((prev) => ({ ...prev, step1: isStep1Valid }));
    }, [formState, setCompletedSteps]);


    // Funzione per gestire il submit del form
    const handleSubmit = (e) => {
        e.preventDefault();

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
        } else if (startDate <= today) {
            newErrors.dataInizio = true;
            hasError = true;
            alert("La data di inizio deve essere successiva al giorno attuale.");
        }

        // Controllo della data di fine
        if (!formState.dataFine) {
            newErrors.dataFine = true;
            hasError = true;
        } else if (endDate <= startDate) {
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

        // Aggiorna lo stato del contesto per indicare che lo step 1 è completato
        setCompletedSteps((prev) => ({ ...prev, step1: true }));

        // Passa alla parte successiva del configuratore
        navigate("/argomentiRiferimenti");
    };





    return (



        <div className="w-full">



            <div className="mx-auto w-[1500px] h-[865px] bg-[#F2F3F7] rounded-[50px] flex mt-6">



                {/* PRIMO DIV */}

                <div className="w-1/2 h-full rounded-l-xl">

                    <div className="w-full h-full flex flex-col items-center p-10 ml-5 relative ">

                        {/* Modifica IMMAGINE chatbot */}
                        <div className="relative w-[150px] h-[100px] my-4  mx-auto flex flex-col items-center justify-center">
                            <img
                                src={formState.fotoChatbot || fotoPlaceholder}
                                alt="Seleziona immagine"
                                className="w-19 h-19 object-cover rounded-full border-2 border-gray-300 cursor-pointer hover:opacity-80"
                                onClick={() => fileInputRef.current.click()} // Usa il riferimento per aprire il selettore file
                            />
                            <input
                                ref={fileInputRef} // Collega il riferimento all'input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        const imageUrl = URL.createObjectURL(file);
                                        dispatch(updateForm({ fotoChatbot: imageUrl }));
                                    }
                                }}
                                style={{ display: 'none' }} // Nasconde l'input file
                            />
                        </div>


                        <form className="space-y-8" onSubmit={handleSubmit}>


                            {/* Input per il NOME DEL CHATBOT */}
                            <div className="mb-6">
                                <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Nome</p>
                                <input
                                    id="input-nome"
                                    type="text"
                                    placeholder="Assegna un nome al chatbot"
                                    value={formState.nomeChatbot}
                                    onChange={(e) => dispatch(updateForm({ nomeChatbot: e.target.value }))}
                                    className={`w-[630px] h-11 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] ${errors.nomeChatbot ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                        } placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                />
                            </div>


                            {/* Input per il NOME DEL CORSO */}
                            <div className="mb-6">
                                <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Corso</p>
                                <input
                                    id="input-corso"
                                    type="text"
                                    placeholder="Inserisci il nome del corso"
                                    value={formState.corsoChatbot}
                                    onChange={(e) => dispatch(updateForm({ corsoChatbot: e.target.value }))}
                                    className={`w-[630px] h-11 p-2 pl-3 rounded-[10px] bg-white border ${errors.corsoChatbot ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                        } placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`} />
                            </div>


                            {/* Input per la DESCRIZIONE del chatbot */}
                            <div className=" mb-0">
                                <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Descrizione</p>
                                <textarea
                                    id="input-descrizione"
                                    placeholder="Scrivi una descrizione per il tuo chatbot"
                                    value={formState.descrizioneChatbot}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 200) {
                                            dispatch(updateForm({ descrizioneChatbot: e.target.value }))
                                        }
                                    }}
                                    className="w-[630px] h-23 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none"
                                />
                                <p className="text-right text-sm text-gray-500 mt-1 opacity-60">{formState.descrizioneChatbot.length}/200</p>
                            </div>


                            {/* Input per le ISTRUZIONI */}
                            <div className="mb-6">
                                <p className="w-[205.51px] h-[29px] text-lg font-medium text-left text-[#1d2125] mb-1">Istruzioni</p>
                                <textarea
                                    id="input-4"
                                    placeholder="Scrivi delle brevi istruzioni che il chatbot dovrà seguire durante il corso, spiegando cosa farà per aiutare gli studenti e cosa invece dovrà evitare."
                                    className="w-[630px] h-29 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none"
                                    value={formState.istruzioniChatbot}
                                    onChange={(e) => dispatch(updateForm({ istruzioniChatbot: e.target.value }))}
                                />
                            </div>


                            {/* Input per le DATE */}
                            <div className="flex space-x-20 w-full h-21  flex justify-between items-center ">

                                {/* data di inizio */}
                                <div className="">
                                    <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Data inizio corso</p>
                                    <input
                                        id="start-date"
                                        type="date"
                                        value={formState.dataInizio}
                                        onChange={(e) => dispatch(updateForm({ dataInizio: e.target.value }))}
                                        className={`w-65 h-11 p-2 pl-3 rounded-[10px] bg-white ${errors.dataInizio ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                            } border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                    />
                                </div>

                                {/* data di fine */}
                                <div className="">
                                    <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Data fine corso</p>
                                    <input
                                        id="end-date"
                                        type="date"
                                        value={formState.dataFine}
                                        onChange={(e) => {
                                            dispatch(updateForm({ dataFine: e.target.value }));
                                            setErrors((prev) => ({ ...prev, dataFine: false }));
                                        }}
                                        className={`w-65 h-11 p-2 pl-3 rounded-[10px] bg-white ${errors.dataFine ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                            } border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                    />
                                </div>
                            </div>


                            {/* 
                            <div className="space-y-4 pt-2 ">
                                <p className="w-1/2 h-[28.77px] text-lg font-medium text-left text-[#1d2125]  mb-2">Suggerimenti di interazione</p>


                                <div className="w-[633px] h-11 relative  mb-2">
                                    <div className="w-[633px] h-11 absolute left-0 top-0">
                                        <div
                                            className="w-[678px] h-11 absolute left-[-1px] top-[-1px] rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]"
                                            style={{ boxShadow: "0px 0px 6.7px 4px rgba(0,0,0,0.02)" }}
                                        ></div>
                                    </div>
                                    <img
                                        src={rewindSuggerimento}
                                        alt="Icona suggerimento"
                                        className="absolute left-[14px] top-[11px] w-[20px] h-[20px]"
                                    />
                                    <img
                                        src={lineaDopoIconaSuggerimento}
                                        alt="Linea dopo icona"
                                        className="absolute left-[47px] top-[4.5px] w-[2px] h-[32px]"
                                    />
                                    <p className="w-[547.72px] h-7 absolute left-[62px] top-2  text-left text-[#495057]">
                                        Ripassa le ultime lezioni
                                    </p>
                                </div>

                                <div className="w-[633px] h-11 relative  mb-2">
                                    <div className="w-[633px] h-11 absolute left-0 top-0">
                                        <div
                                            className="w-[678px] h-11 absolute left-[-1px] top-[-1px] rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]"
                                            style={{ boxShadow: "0px 0px 6.7px 4px rgba(0,0,0,0.02)" }}
                                        ></div>
                                    </div>
                                    <img
                                        src={libroSuggerimento}
                                        alt="Icona suggerimento"
                                        className="absolute left-[14px] top-[11px] w-[20px] h-[20px]"
                                    />
                                    <img
                                        src={lineaDopoIconaSuggerimento}
                                        alt="Linea dopo icona"
                                        className="absolute left-[47px] top-[4.5px] w-[2px] h-[32px]"
                                    />
                                    <p className="w-[547.72px] h-7 absolute left-[62px] top-2  text-left text-[#495057]">
                                        Studia la lezione di oggi
                                    </p>
                                </div>






                            </div>
                            */}



                            {/* PULSANTI FINALI */}





                        </form>
                    </div>


                </div>





                {/* SECONDO DIV */}
                <div className="w-1/2 h-full flex justify-center items-center">

                    {/* Contenitore principale */}
                    <div className="w-[625px] h-[730px] relative flex flex-col mr-4 justify-start rounded-[40px] bg-white  border-2 border-[#21225f]/[0.1] shadow-[0px_0px_26px_13px_rgba(0,0,0,0.01)]">

                        {/* Titolo Anteprima */}
                        <div className="w-full h-16  flex items-center justify-center"
                            style={{ pointerEvents: "none" }}>
                            <p className="text-xl font-bold text-center text-[#21225f]">
                                Anteprima
                            </p>
                        </div>

                        <div className="h-32"></div>


                        {/* Immagine */}
                        <div className="flex justify-center  items-center w-full h-[100px]">
                            <img
                                src={formState.fotoChatbot || fotoPlaceholder}
                                className="w-[73px] h-[73px] object-cover rounded-full"
                            />
                        </div>


                        {/* Nome chatbot */}
                        {formState.nomeChatbot && (
                            <div className="flex justify-center  items-center w-full mb-2 mt-2">
                                <p className="text-[#495057] w-130 text-xl font-bold text-center">{formState.nomeChatbot}</p>
                            </div>
                        )}

                        {/* Descrizione chatbot */}
                        {formState.descrizioneChatbot && (
                            <div className="flex justify-center items-center w-full  mb-2">
                                <p className="text-[#495057] w-110  text-center">{formState.descrizioneChatbot}</p>
                            </div>
                        )}

                        {/* Pulsanti suggerimenti */}
                        <div className="w-full h-20  flex items-center justify-center gap-x-5">

                            {/* Suggerimento 1 */}
                            <div className="w-[235px] h-[50px] relative"
                                style={{ pointerEvents: "none" }}>
                                <div className="w-full h-full rounded-[15px] border-[2.3px] border-[#6982ab]/[0.12]"></div>
                                <p className="w-[187px] h-7 absolute left-[51px] top-[14px]  text-left text-[#495057]">
                                    Ripassa le ultime lezioni
                                </p>
                                <img
                                    src={rewindSuggerimento}
                                    alt="Icona"
                                    className="absolute left-[18px] top-[17px] w-[18px] h-[18px]"
                                />
                            </div>

                            {/* Suggerimento 2 */}
                            <div className="w-[235px] h-[50px] relative"
                                style={{ pointerEvents: "none" }}>
                                <div className="w-full h-full rounded-[15px] border-[2.3px] border-[#6982ab]/[0.12]"></div>
                                <p className="w-[187px] h-7 absolute left-[51px] top-[14px]  text-left text-[#495057]">
                                    Studia la lezione di oggi
                                </p>
                                <img
                                    src={libroSuggerimento}
                                    alt="Icona"
                                    className="absolute left-[18px] top-[17px] w-[18px] h-[18px]"
                                />
                            </div>




                        </div>

                        {/* barra input messaggio */}
                        <div className="absolute bottom-7  w-full h-[60px]  flex items-center justify-center">
                            <div className="relative w-[535px] flex justify-between p-2  h-[44px] rounded-[25px] bg-white border-[2px] border-[#6982ab]/[0.15] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.01)]">

                                <p className=" h-full ml-3 opacity-[0.50] text-left text-[#495057] "
                                    style={{ pointerEvents: "none" }}>
                                    Scrivi un messaggio...
                                </p>

                                <img src={invioButton} className="absolute top-1.5 right-3 w-[28px] h-[28px] " />

                            </div>

                        </div>


                    </div>
                </div>



            </div>


            <div className="w-[1500px] h-30 mx-auto mt-2 flex justify-between items-center ">

                {/* Pulsante Esci e salva bozza */}
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

                {/* Pulsante Step Successivo */}
                <button
                    type="button"
                    className="w-[172px] h-[46px] right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                    onClick={handleSubmit}
                >

                    <div
                        className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                        style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}>

                        <div className="h-full flex items-center w-full pl-5">
                            <p className="text-[17px] text-left text-[#1d2125]">
                                Step successivo
                            </p>
                        </div>

                        <div className=" h-full w-12 flex pr-1 justify-center pt-4">
                            <img src={frecciaDestraButton} alt="" className="w-[15px] h-[15px]" />
                        </div>

                    </div>

                </button>
            </div>



        </div >


    )
}

export default Configurazione