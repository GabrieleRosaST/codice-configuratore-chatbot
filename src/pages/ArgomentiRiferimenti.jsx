import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { aggiungiArgomento } from '../store/argomentiSlice'; // Usa il slice corretto
import CardArgomento from '../components/cardArgomento';
import domandaIcon from '../img/domandaIcon.svg';
import plusArgomentoCard from '../img/plusArgomentoCard.svg';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
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
            id: argomenti.length + 1, // ID univoco per l'argomento
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
        <div className="w-full">

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
                            <p className='text-lg text-[#4f5255] mb-3 mt-5'>
                                In questa pagina puoi inserire gli argomenti del corso, per ognuno puoi:

                            </p>
                            <ul className='list-disc list-inside text-lg text-[#4f5255] space-y-1 mb-3'>
                                <li>Inserire il titolo
                                </li>
                                <li>Caricare i materiali di riferimento (solo PDF), tramite l'apposito pulsante o tramite drag&drop.
                                </li>
                            </ul>
                            <p className='text-lg text-[#4f5255] mb-3 mt-5'>
                                Puoi eliminare in qualsiasi momento gli argomenti o i file che hai caricato.

                            </p>
                        </div>


                        <div className="w-full h-12  relative flex items-center  justify-center mb-3 mt-10 gap-3 ">

                            <img src={bookIcon} className='w-6 h-6 ' />
                            <h2 className="text-2xl h-full flex  items-center font-bold text-center text-[#21225f]">A cosa servono i materiali di riferimento?

                            </h2>

                        </div>

                        <div className='w-[800px] mx-auto'>

                            <ul className='list-disc list-inside text-lg text-[#4f5255] space-y-1 mb-10'>
                                <li>Quando uno studente chiederà aiuto su un argomento, il chatbot risponderà in base ai materiali che hai caricato.</li>
                                <li>L’assistente sarà quindi in grado di fornire spiegazioni pertinenti e affidabili, legate solo ai contenuti del tuo corso.
                                </li>
                            </ul>



                            <p className='text-lg text-[#4f5255] mb-5'>📌 Nota: Durante la configurazione puoi sempre tornare su questa sezione per eliminare vecchi argomenti o aggiungerne di nuovi.
                            </p>
                        </div>



                    </div>

                </div>

            ) : (
                <>
                    <div className="w-[1500px]  mx-auto h-15 flex  items-center relative m-1 ">
                        <button
                            className="w-[98px] z-13 h-10 rounded-[25px] bg-white absolute left-0  flex items-center justify-center  z-5 cursor-pointer transform transition-transform duration-200 hover:scale-102 "
                            style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                            onClick={() => setMostraAiuto(true)}
                        >
                            <img src={domandaIcon} alt="Icona domanda" className="w-4 h-4 mr-1" />
                            <p className="text-lg text-center text-[#4f5255]">Aiuto</p>
                        </button>

                        <p className="w-[1077px] text-[22px] font-bold text-center text-[#21225f] absolute left-1/2 transform -translate-x-1/2">
                            Aggiungi gli argomenti e carica i materiali di riferimento
                        </p>
                    </div>

                    <div className="mx-auto w-[1500px] min-h-[450px] max-h-[4000px] mt-6">
                        {/* Griglia per le card */}

                        <div className="w-full grid grid-cols-3 justify-items-center gap-y-14 gap-x-15">
                            {argomenti.map((argomento) => (
                                <CardArgomento
                                    key={argomento.id}
                                    id={argomento.id}
                                    titolo={argomento.titolo}
                                    colore={argomento.colore}
                                    file={argomento.file}
                                />
                            ))}

                            {/* Pulsante per aggiungere una nuova card */}
                            <div className="w-[460px] h-[417px] flex justify-center items-center">
                                <button
                                    onClick={handleAggiungiArgomento}
                                    className="w-[390px] h-[370px]  bg-[#21225F]/3 border border-dashed border-[#495057]/40 rounded-lg flex flex-col items-center justify-center text-gray-500 transform transition-transform duration-200 hover:scale-103 cursor-pointer"
                                >
                                    <div className=" w-full flex justify-center items-center h-[70px] ">
                                        <img src={plusArgomentoCard} alt="" />
                                    </div>
                                    <div className=" w-full flex justify-center items-center h-[30px] ">
                                        <p
                                            className="opacity-40 text-[18px] font-medium text-left text-[#495057]"
                                        >
                                            Aggiungi argomento
                                        </p>
                                    </div>
                                </button>
                            </div>

                        </div>
                    </div>


                    {/* Pulsante Esci e salva bozza e Step successivo */}
                    <div className="w-[1500px] h-30  mx-auto mt-10  flex justify-between items-center ">
                        <button
                            type="button"
                            className="w-[196px] h-[46px] "
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
                            className={`w-[172px] h-[46px] right-0   ${argomenti.length === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer transform transition-transform duration-200 hover:scale-103'
                                }`}
                            onClick={handleStepSuccessivo} // Usa la funzione per verificare le condizioni
                        >

                            <div
                                className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                                style={{ boxShadow: "0px 0x 8.5px 3px rgba(0,0,0,0.02)" }}>

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

                </>

            )}


        </div>
    );
}

export default ArgomentiRiferimenti;