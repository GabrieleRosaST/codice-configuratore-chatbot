import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { aggiungiArgomento } from '../store/argomentiSlice'; // Usa il slice corretto
import CardArgomento from '../components/cardArgomento';
import domandaIcon from '../img/domandaIcon.svg';
import plusArgomentoCard from '../img/plusArgomentoCard.svg';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import frecciaDestraButton from '../img/frecciaDestraButton.svg';

function ArgomentiRiferimenti() {
    const dispatch = useDispatch();
    const argomenti = useSelector((state) => state.argomenti.argomenti); // Usa il slice corretto
    const navigate = useNavigate();
    const { dataInizio, dataFine } = useSelector((state) => state.form);


    const handleAggiungiArgomento = () => {
        const giorniValidi = calculateGiorniValidi(); // Calcola i giorni validi del corso
        const maxArgomenti = giorniValidi.length * 2; // Ogni giorno può avere massimo 2 argomenti

        if (argomenti.length >= maxArgomenti) {
            alert('Hai raggiunto il numero massimo di argomenti consentiti.');
            return;
        }

        const nuovoArgomento = {
            id: argomenti.length + 1, // ID univoco per l'argomento
            titolo: '', // Titolo vuoto iniziale
            colore: '#F3A6A7', // Colore predefinito
            file: [] // Nessun file iniziale
        };
        dispatch(aggiungiArgomento(nuovoArgomento));
    };

    // Funzione per calcolare i giorni validi del corso
    const calculateGiorniValidi = () => {
        const giorniValidi = [];
        let currentDate = new Date(dataInizio);
        const fineDate = new Date(dataFine);

        while (currentDate <= fineDate) {
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Escludi sabato e domenica
                giorniValidi.push(new Date(currentDate));
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return giorniValidi;
    };


    return (
        <div className="w-full">
            <div className="w-[1500px] mx-auto h-15 flex pl-4 justify-center items-center relative m-1 ">
                <div
                    className="w-[98px] h-10 absolute left-0 rounded-[25px] bg-white border border-[#4a4d50]/[0.29] flex items-center justify-center"
                    style={{ boxShadow: '0px 2px 8.5px 3px rgba(0,0,0,0.05)' }}
                >
                    <img src={domandaIcon} alt="Icona domanda" className="w-4 h-4 mr-1" />
                    <p className="text-lg text-center text-[#4f5255]">Aiuto</p>
                </div>

                <p className="w-[1077px] text-2xl font-bold text-center text-[#21225f]">
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
                    className="w-[185px] h-12 right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                    onClick={() => {
                        if (argomenti.length > 0) {
                            navigate('/pianoLavoro'); // Usa navigate per cambiare pagina
                        }
                    }}
                    disabled={argomenti.length === 0} // Disabilita il pulsante se non ci sono argomenti
                >

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
    );
}

export default ArgomentiRiferimenti;