import React, { useRef } from 'react';

import { useNavigate } from 'react-router-dom';
import invioButton from '../img/invioButton.svg';
import fotoPlaceholder from '../img/fotoBot.svg';
import libroSuggerimento from '../img/libroSuggerimento.svg';
import rewindSuggerimento from '../img/rewindSuggerimento.svg';
import lampadinaSuggerimento from '../img/lampadinaSuggerimento.svg';
import lineaDopoIconaSuggerimento from '../img/lineaDopoIconaSuggerimento.svg';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import frecciaDestraButton from '../img/frecciaDestraButton.svg';

import { useSelector, useDispatch } from 'react-redux';
import { updateForm } from '../store/formSlice';



function Configurazione() {

    const dispatch = useDispatch();
    const formState = useSelector((state) => state.form); // Leggi lo stato globale

    const navigate = useNavigate();

    const fileInputRef = useRef(null);



    // Funzione per gestire il submit del form
    const handleSubmit = (e) => {
        e.preventDefault();

        const today = new Date();
        const startDate = new Date(formState.dataInizio);
        const endDate = new Date(formState.dataFine);

        let hasError = false;

        // Controllo del nome del chatbot
        const inputNome = document.getElementById("input-nome");
        if (!formState.nomeChatbot.trim()) {
            inputNome.classList.add("border-red-500", "bg-red-50");
            hasError = true;
        } else {
            inputNome.classList.remove("border-red-500", "bg-red-50");
        }

        // Controllo della data di inizio
        const inputStartDate = document.getElementById("start-date");
        if (!formState.dataInizio || startDate <= today) {
            inputStartDate.classList.add("border-red-500", "bg-red-50");
            if (!hasError) inputStartDate.focus();
            hasError = true;
        } else {
            inputStartDate.classList.remove("border-red-500", "bg-red-50");
        }

        // Controllo della data di fine
        const inputEndDate = document.getElementById("end-date");
        if (!formState.dataFine || endDate <= startDate) {
            inputEndDate.classList.add("border-red-500", "bg-red-50");
            if (!hasError) inputEndDate.focus();
            hasError = true;
        } else {
            inputEndDate.classList.remove("border-red-500", "bg-red-50");
        }

        // Se ci sono errori, interrompi l'invio del form
        if (hasError) {
            alert("Per favore, compila tutti i campi obbligatori correttamente.");
            return;
        }

        // Passa alla parte successiva del configuratore
        console.log("Dati inviati:", formState);
        navigate("/argomentiRiferimenti");
    };





    return (


        <div>

            <div className="mx-auto w-[1580px] h-[1040px] bg-[#F2F3F7] rounded-[50px] flex mt-6">



                {/* PRIMO DIV */}

                <div className="w-1/2 h-full  rounded-l-xl px-14 py-10">


                    {/* Modifica IMMAGINE chatbot */}
                    <div className="relative w-[150px] h-[130px] mx-auto flex flex-col items-center justify-center">
                        <img
                            src={formState.fotoChatbot || fotoPlaceholder}
                            alt="Seleziona immagine"
                            className="w-20 h-20 object-cover rounded-full border-2 border-gray-300 cursor-pointer hover:opacity-80"
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
                                placeholder="Assegna un nome al tuo chatbot"
                                value={formState.nomeChatbot}
                                onChange={(e) => dispatch(updateForm({ nomeChatbot: e.target.value }))}
                                className="w-[678px] h-11 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]"
                            />
                        </div>


                        {/* Input per il NOME DEL CORSO */}
                        <div className="mb-6">
                            <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Corso</p>
                            <input
                                id="input-2"
                                type="text"
                                placeholder="Inserisci il nome del tuo corso di insegnamento"
                                value={formState.corsoChatbot}
                                onChange={(e) => dispatch(updateForm({ corsoChatbot: e.target.value }))}
                                className="w-[678px] h-11 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]" />
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
                                className="w-[678px] h-17 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none"
                            />
                            <p className="text-right text-sm text-gray-500 mt-1 opacity-60">{formState.descrizioneChatbot.length}/200</p>
                        </div>


                        {/* Input per le ISTRUZIONI */}
                        <div className="mb-6">
                            <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Istruzioni</p>
                            <textarea
                                id="input-4"
                                placeholder="Scrivi delle brevi istruzioni che il chatbot dovrà seguire durante il corso, spiegando cosa farà per aiutare gli studenti e cosa invece dovrà evitare."
                                className="w-[678px] h-27 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none"
                                value={formState.istruzioniChatbot}
                                onChange={(e) => dispatch(updateForm({ istruzioniChatbot: e.target.value }))}
                            />
                        </div>


                        {/* Input per le DATE */}
                        <div className="flex space-x-20 mb-6">

                            {/* data di inizio */}
                            <div className="w-1/2 ">
                                <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Data inizio corso</p>
                                <input
                                    id="start-date"
                                    type="date"
                                    value={formState.dataInizio}
                                    onChange={(e) => dispatch(updateForm({ dataInizio: e.target.value }))}
                                    className="w-75 h-11 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]"
                                />
                            </div>

                            {/* data di fine */}
                            <div className="w-1/2 ">
                                <p className="w-[205.51px] h-[28.77px] text-lg font-medium text-left text-[#1d2125] mb-1">Data fine corso</p>
                                <input
                                    id="end-date"
                                    type="date"
                                    value={formState.dataFine}
                                    onChange={(e) => dispatch(updateForm({ dataFine: e.target.value }))}
                                    className="w-75 h-11 p-2 pl-3 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] placeholder-opacity-51 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]"
                                />
                            </div>
                        </div>


                        {/* Contenitore per i SUGGERIMENTI */}
                        <div className="space-y-4 pt-2">
                            <p className="w-1/2 h-[28.77px] text-lg font-medium text-left text-[#1d2125]  mb-2">Suggerimenti di interazione</p>


                            {/* Suggerimento 1 */}
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

                            {/* Suggerimento 2 */}
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



                            {/* Suggerimento 3 */}
                            <div className="w-[633px] h-11 relative  mb-2">
                                <div className="w-[633px] h-11 absolute left-0 top-0">
                                    <div
                                        className="w-[678px] h-11 absolute left-[-1px] top-[-1px] rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]"
                                        style={{ boxShadow: "0px 0px 6.7px 4px rgba(0,0,0,0.02)" }}
                                    >

                                        <input
                                            type="text"
                                            value={formState.newSuggerimento}
                                            placeholder="Nuovo suggerimento..."
                                            onChange={(e) => {
                                                if (e.target.value.length <= 20) {
                                                    dispatch(updateForm({ newSuggerimento: e.target.value }))
                                                }
                                            }}
                                            className="w-full h-full  pl-16  rounded-[10px]  text-left text-[#495057] bg-transparent  focus:outline-none focus:border-1 focus:border-[#495057]"
                                        />
                                    </div>
                                </div>
                                <img
                                    src={lampadinaSuggerimento}
                                    alt="Icona suggerimento"
                                    className="absolute left-[14px] top-[11px] w-[20px] h-[20px]"
                                />
                                <img
                                    src={lineaDopoIconaSuggerimento}
                                    alt="Linea dopo icona"
                                    className="absolute left-[47px] top-[4.5px] w-[2px] h-[32px]"
                                />

                            </div>


                        </div>




                        {/* PULSANTI FINALI */}

                        <div className="w-full mx-auto mt-10 absolute left-0 h-35 ">

                            <div className="h-full w-[1580px] mx-auto  flex justify-between items-center">

                                {/* Pulsante Esci e Salva Bozza */}
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
                                    type="submit"
                                    className="w-[185px] h-12  right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                                    onClick={() => console.log('Pulsante di test cliccato!')}>

                                    <div
                                        className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                                        style={{ boxShadow: "0px 2px 8.5px 3px rgba(0,0,0,0.05)" }}>

                                        <div className="h-full flex items-center w-full pl-5">
                                            <p className="text-[19px] text-left text-[#1d2125]">
                                                Step successivo
                                            </p>
                                        </div>

                                        <div className=" h-full w-12 flex pr-1 justify-center pt-4">
                                            <img src={frecciaDestraButton} alt="" className="w-[16px] h-[16px]" />
                                        </div>

                                    </div>

                                </button>

                            </div>


                        </div>



                    </form>
                </div>





                {/* SECONDO DIV */}
                <div className="w-1/2 h-full py-14 pl-8 ">

                    {/* Contenitore principale */}
                    <div className="w-[697px] h-[920px] relative flex flex-col items-stretch rounded-[40px] bg-white  border-3 border-[#a2b7d8]/[0.3] shadow-[0px_0px_26px_13px_rgba(22,64,108,0.03)]">

                        {/* Titolo Anteprima */}
                        <div className="w-full h-16  flex items-center justify-center"
                            style={{ pointerEvents: "none" }}>
                            <p className="text-xl font-bold text-center text-[#21225f]">
                                Anteprima
                            </p>
                        </div>

                        <div className="h-40"></div>


                        {/* Immagine */}
                        <div className="flex justify-center items-center w-full h-[100px]">
                            <img
                                src={formState.fotoChatbot || fotoPlaceholder}
                                className="w-[80px] h-[80px] object-cover rounded-full"
                            />
                        </div>


                        {/* Nome chatbot */}
                        {formState.nomeChatbot && (
                            <div className="flex justify-center items-center w-full mb-2 mt-2">
                                <p className="text-[#495057] w-130 text-2xl font-bold text-center">{formState.nomeChatbot}</p>
                            </div>
                        )}

                        {/* Descrizione chatbot */}
                        {formState.descrizioneChatbot && (
                            <div className="flex justify-center items-center w-full mb-4">
                                <p className="text-[#495057] w-130 text-lg text-center">{formState.descrizioneChatbot}</p>
                            </div>
                        )}

                        {/* Pulsanti suggerimenti */}
                        <div className="w-172 h-40 flex flex-wrap justify-center gap-x-6 mt-2">

                            {/* Suggerimento 1 */}
                            <div className="w-[255px] h-[55px] relative"
                                style={{ pointerEvents: "none" }}>
                                <div className="w-[255px] h-[55px] rounded-[15px] border-[2.3px] border-[#6982ab]/[0.12]"></div>
                                <p className="w-[187px] h-7 absolute left-[51px] top-[14px] text-lg text-left text-[#495057]">
                                    Ripassa le ultime lezioni
                                </p>
                                <img
                                    src={rewindSuggerimento}
                                    alt="Icona"
                                    className="absolute left-[18px] top-[17px] w-[20px] h-[20px]"
                                />
                            </div>

                            {/* Suggerimento 2 */}
                            <div className="w-[255px] h-[55px] relative"
                                style={{ pointerEvents: "none" }}>
                                <div className="w-[255px] h-[55px] rounded-[15px] bg-[#ECEFF4] /[0.12]"></div>
                                <p className="w-[187px] h-7 absolute left-[51px] top-[14px] text-lg text-left text-[#495057]">
                                    Studia la lezione di oggi
                                </p>
                                <img
                                    src={libroSuggerimento}
                                    alt="Icona"
                                    className="absolute left-[18px] top-[17px] w-[20px] h-[20px]"
                                />
                            </div>

                            {/* Suggerimento 3 */}
                            {formState.newSuggerimento.trim() && (
                                <div className="w-[255px] h-[55px] relative"
                                    style={{ pointerEvents: "none" }}>
                                    <div className="w-[255px] h-[55px] rounded-[15px] border-[2.3px] border-[#6982ab]/[0.12]"></div>
                                    <p className="w-[187px] h-7 absolute left-[51px] top-[14px] text-lg text-left text-[#495057]">
                                        {formState.newSuggerimento}
                                    </p>
                                    <img
                                        src={lampadinaSuggerimento}
                                        alt="Icona"
                                        className="absolute left-[18px] top-[17px] w-[20px] h-[20px]"
                                    />
                                </div>
                            )}


                        </div>

                        {/* barra input messaggio */}
                        <div className="absolute bottom-5  w-full h-[60px]  flex items-center justify-center">
                            <div className="relative w-[610px] flex justify-between p-2  h-[47px] rounded-[25px] bg-white border-2 border-[#6982ab]/[0.24] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]">

                                <p className=" w-[523px] h-7 ml-2 top-4 opacity-[0.51] text-lg text-left text-[#495057] "
                                    style={{ pointerEvents: "none" }}>
                                    Scrivi un messaggio...
                                </p>

                                <img src={invioButton} className="absolute top-1.5 right-3 w-[30px] h-[30px] " />

                            </div>

                        </div>


                    </div>
                </div>
            </div>






        </div>


    )
}

export default Configurazione