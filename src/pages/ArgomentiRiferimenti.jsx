import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { aggiungiArgomento } from '../store/argomentiSlice'; // Usa il slice corretto
import CardArgomento from '../components/cardArgomento';
import domandaIcon from '../img/domandaIcon.svg';
import plusArgomentoCard from '../img/plusArgomentoCard.svg';
//import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import frecciaDestraButton from '../img/frecciaDestraButton.svg';
import { useStepContext } from '../context/StepContext';
import closeAiutoIcon from '../img/closeAiutoIcon.svg';
import obiettivoIcon from '../img/obiettivoIcon.svg';
import bookIcon from '../img/bookIcon.svg';


function ArgomentiRiferimenti() {
    const dispatch = useDispatch();
    const argomenti = useSelector((state) => state.argomenti.argomenti); // Usa il slice corretto
    const navigate = useNavigate();
    const { setCompletedSteps, primaVisitaStep2, setPrimaVisitaStep2 } = useStepContext(); // Usa il contesto

    const [mostraAiuto, setMostraAiuto] = useState(false); // Stato per gestire la visibilità del div di aiuto



    const handleAggiungiArgomento = () => {

        const nuovoArgomento = {
            titolo: '', // Titolo vuoto iniziale
            colore: '', // Colore predefinito
            file: [] // Nessun file iniziale
        };
        dispatch(aggiungiArgomento(nuovoArgomento));
    };


    useEffect(() => {
        const tuttiArgomentiValidi = argomenti.length > 0 && argomenti.every((argomento) => argomento.titolo.trim() !== '');

        // Aggiorna lo stato step2 solo se non è la prima visita
        if (!primaVisitaStep2) {
            setCompletedSteps((prev) => ({ ...prev, step2: tuttiArgomentiValidi }));
        }
    }, [argomenti, primaVisitaStep2, setCompletedSteps]);


    const handleStepSuccessivo = () => {
        const tuttiArgomentiValidi = argomenti.length > 0 && argomenti.every((argomento) => argomento.titolo.trim() !== '');

        if (tuttiArgomentiValidi) {
            setCompletedSteps((prev) => ({ ...prev, step2: true }));
            setPrimaVisitaStep2(false); // Aggiorna lo stato nel contesto
            navigate('/pianoLavoro');
        } else {
            alert('Assicurati di aver aggiunto almeno un argomento e che tutti gli argomenti abbiano un titolo.');
        }
    };


    return (
        <div className="w-full flex flex-col items-center justify-center">


            {mostraAiuto ? (
                <div className="w-[86%] 2xl:w-[66%] mx-auto  flex flex-col items-center justify-">

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

                        <div className="w-[90%]  h-10  relative flex items-center  justify-center mt-4 gap-3 ">
                            <img src={obiettivoIcon} className='w-5 h-5 ' />
                            <h2 className="text-[18px] h-full flex  items-center font-bold text-center text-[#21225f]">A cosa serve questa pagina?</h2>

                        </div>

                        <div className='w-[82%]'>
                            <p className='text-[14px] text-[#4f5255] mb-3 mt-3 '>
                                In questa pagina puoi inserire gli argomenti del corso, per ognuno puoi:
                            </p>
                            <ul className='list-disc list-inside text-[14px]  text-[#4f5255] space-y-1 mb-3'>
                                <li>Inserire il titolo
                                </li>
                                <li>Caricare i PDF di riferimento, tramite l'apposito pulsante "carica" o drag&drop.
                                </li>
                            </ul>
                            <p className='text-[14px] text-[#4f5255] mb-3 mt-5 '>
                                Puoi eliminare in qualsiasi momento gli argomenti o i file che hai caricato.

                            </p>
                        </div>


                        <div className="w-full h-12  relative flex items-center  justify-center mb-3 mt-10 gap-3 ">

                            <img src={bookIcon} className='w-6 h-6 ' />
                            <h2 className="text-[18px] h-full flex  items-center font-bold text-center text-[#21225f]">A cosa servono i materiali di riferimento?

                            </h2>

                        </div>

                        <div className='w-[82%]  mx-auto'>

                            <ul className='list-disc list-inside text-[14px] text-[#4f5255] space-y-1 mb-12'>
                                <li>Quando uno studente chiederà aiuto su un argomento, il chatbot risponderà in base ai materiali che hai caricato.</li>
                                <li>L’assistente sarà quindi in grado di fornire spiegazioni pertinenti e affidabili, legate solo ai contenuti del tuo corso.
                                </li>
                            </ul>



                            <p className='text-[14px] text-[#4f5255] mb-8'>📌 Nota: Durante la configurazione puoi sempre tornare su questa sezione per eliminare vecchi argomenti o aggiungerne di nuovi.
                            </p>
                        </div>



                    </div>

                </div>

            ) : (
                <>
                    <div className="w-[100%] xl:w-[86%] min-h-14  relative flex justify-start items-center flex-wrap ">
                        <div className="md:w-20 w-170  z-13 h-10  flex items-center justify-center "
                        >
                            <button
                                className="w-20 h-9 rounded-[25px] bg-white flex items-center justify-center cursor-pointer transform transition-transform duration-200 hover:scale-102"
                                onClick={() => setMostraAiuto(true)}
                                style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                            >
                                <img src={domandaIcon} alt="Icona domanda" className="w-2 mr-2 ml-1 " />
                                <p className="text-[14px] text-center text-[#4f5255]">Aiuto</p>
                            </button>
                        </div>

                        <p className="flex flex-grow text-[16px] font-bold justify-center text-center text-[#21225f] ">
                            Aggiungi gli argomenti e carica i materiali di riferimento
                        </p>

                        <div className='md:w-22 h-9 w-0'></div>
                    </div>

                    <div className="w-[100%] xl:w-[86%] min-h-[400px] max-h-[750px] mt-5 overflow-y-auto custom-scrollbar">
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-9 w-full">
                            {argomenti.map((argomento) => (
                                <CardArgomento
                                    id={argomento.id}
                                    titolo={argomento.titolo}
                                    colore={argomento.colore}
                                    file={argomento.file}
                                />
                            ))}

                            <div className="w-85 2xl:w-96 p-7 2xl:p-7 2xl:pt-9 2xl:pb-9  h-86 2xl:h-88  2xl:p-12 ">
                                <button
                                    onClick={handleAggiungiArgomento}
                                    className="w-full h-full bg-[#F2F3F7] border border-dashed border-[#495057]/40 rounded-lg flex flex-col items-center justify-center text-gray-500 transform transition-transform duration-200 hover:scale-103 cursor-pointer"
                                >
                                    <div className="w-full flex justify-center items-center h-12">
                                        <img src={plusArgomentoCard} className="w-9" />
                                    </div>
                                    <div className="w-full flex justify-center items-center h-[30px]">
                                        <p className="opacity-40 text-[13px] font-medium text-left text-[#495057]">
                                            Aggiungi argomento
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>




                    {/* Pulsante Esci e salva bozza e Step successivo */}
                    <div className="w-[100%] xl:w-[86%] h-30 mx-auto mt-2 flex justify-end items-center ">

                        {/*
                        <button
                            type="button"
                            className="w-40 h-11 cursor-pointer transform rounded-[10px] transition-transform duration-200 hover:scale-103 hover:bg-[#f2f3f7] "
                        >
                            <div
                                className="w-full h-full left-[-0.85px] top-[-0.85px] rounded-[10px] border-[0.7px] border-[#1d2125]/30 flex justify-stretch"
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
                            className="w-35 h-11 right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                            onClick={handleStepSuccessivo} // Usa la funzione per verificare le condizioni
                        >

                            <div
                                className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                                style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}>

                                <div className="h-full flex items-center justify-end w-full">
                                    <p className="text-[13px]  text-[#1d2125] flex items-center justify-center">
                                        Step successivo
                                    </p>
                                </div>

                                <div className=" h-full w-12 flex items-center justify-center ">
                                    <img src={frecciaDestraButton} alt="" className="w-2 " />
                                </div>

                            </div>

                        </button>
                    </div>




                </>

            )
            }


        </div >
    );
}

export default ArgomentiRiferimenti;