import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate
import { aggiungiArgomento, setLoadingArgomenti, setEditMode, loadArgomentiSuccess, loadArgomentiError } from '../store/argomentiSlice';
import { loadArgomentiForEdit, getMoodleSesskey } from '../utils/loadUtils';
import CardArgomento from '../components/cardArgomento';
import domandaIcon from '../img/domandaIcon.svg';
import plusArgomentoCard from '../img/plusArgomentoCard.svg';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import frecciaDestraButton from '../img/frecciaDestraButton.svg';
import { useStepContext } from '../context/StepContext';
import closeAiutoIcon from '../img/closeAiutoIcon.svg';
import obiettivoIcon from '../img/obiettivoIcon.svg';
import bookIcon from '../img/bookIcon.svg';


function ArgomentiRiferimenti({ sesskey, wwwroot }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux state
    const argomenti = useSelector((state) => state.argomenti.argomenti);
    const formState = useSelector((state) => state.form); // Per accedere a configId
    const isLoadingArgomenti = useSelector((state) => state.argomenti.loading);
    const editMode = useSelector((state) => state.argomenti.editMode);

    const { setCompletedSteps, primaVisitaStep2, setPrimaVisitaStep2 } = useStepContext();

    // Component state
    const [mostraAiuto, setMostraAiuto] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [isSalvaEContinua, setIsSalvaEContinua] = useState(false); // Stato per gestire il pulsante
    const [initialArgomentiCount, setInitialArgomentiCount] = useState(0); // Stato per il numero iniziale di argomenti
    const [initialArgomentiSnapshot, setInitialArgomentiSnapshot] = useState([]); // Stato per lo snapshot iniziale degli argomenti
    const [filesLoaded, setFilesLoaded] = useState(false);



    useEffect(() => {
        // Imposta il numero iniziale di argomenti solo dopo il caricamento completo
        if (argomenti.length > 0 && initialArgomentiCount === 0) {
            setInitialArgomentiCount(argomenti.length);
        }
    }, [argomenti]); // Esegui ogni volta che gli argomenti cambiano

    useEffect(() => {
        // Imposta lo snapshot iniziale degli argomenti solo dopo il caricamento completo
        if (argomenti.length > 0 && initialArgomentiSnapshot.length === 0) {
            setInitialArgomentiSnapshot(JSON.stringify(argomenti)); // Salva uno snapshot come stringa JSON
        }
    }, [argomenti]); // Esegui ogni volta che gli argomenti cambiano

    const handleAggiungiArgomento = () => {

        const nuovoArgomento = {
            titolo: '', // Titolo vuoto iniziale
            colore: '', // Colore predefinito
            file: [], // Nessun file iniziale
            isNew: true // Flag per identificare che è un nuovo argomento
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

    // 🔄 CARICAMENTO ARGOMENTI IN MODALITÀ EDIT
    useEffect(() => {
        const loadArgomentiIfEdit = async () => {
            console.log('🔍 Debug - Checking edit mode:', {
                configId: formState.configId,
                initialLoadComplete,
                editMode,
                hasConfigId: !!formState.configId
            });

            // Se siamo in modalità edit e abbiamo un configId
            if (formState.configId && !initialLoadComplete && !editMode) {
                console.log('📥 Modalità Edit rilevata - Caricamento argomenti per chatbot ID:', formState.configId);

                try {
                    dispatch(setLoadingArgomenti(true));

                    // Ottieni sesskey e wwwroot
                    const sesskey = getMoodleSesskey();
                    // Usa l'URL corrente completo invece di window.location.origin
                    const wwwroot = window.location.origin + '/moodle/moodle';

                    console.log('🔗 Parametri per chiamata API:', {
                        configId: formState.configId,
                        sesskey: sesskey ? 'OK' : 'MISSING',
                        wwwroot
                    });

                    // Carica argomenti dal database Moodle
                    const result = await loadArgomentiForEdit(formState.configId, sesskey, wwwroot);

                    console.log('📊 Risultato chiamata loadArgomentiForEdit:', {
                        success: result.success,
                        count: result.count,
                        argomenti: result.argomenti
                    });

                    if (result.success) {
                        console.log('✅ Argomenti recuperati dal database:', result.argomenti);
                        console.log(`📈 Totale argomenti caricati: ${result.count}`);

                        // Ora usa la nuova azione Redux per caricare gli argomenti
                        dispatch(loadArgomentiSuccess({
                            argomenti: result.argomenti,
                            count: result.count
                        }));
                    } else {
                        console.warn('⚠️ Nessun argomento trovato o errore:', result.message);
                        dispatch(loadArgomentiError(result.message || 'Errore nel caricamento argomenti'));
                    }

                } catch (error) {
                    console.error('❌ Errore caricamento argomenti:', error);
                    console.error('❌ Stack trace:', error.stack);
                    dispatch(loadArgomentiError(error.message));
                } finally {
                    dispatch(setLoadingArgomenti(false));
                    setInitialLoadComplete(true);
                }
            } else {
                console.log('ℹ️ Skip caricamento argomenti:', {
                    hasConfigId: !!formState.configId,
                    initialLoadComplete,
                    editMode,
                    reason: !formState.configId ? 'No configId' :
                        initialLoadComplete ? 'Already loaded' :
                            editMode ? 'Already in edit mode' : 'Unknown'
                });
            }
        };

        loadArgomentiIfEdit();
    }, [formState.configId, initialLoadComplete, editMode, dispatch]);


    // Nuovo useEffect per caricare i file di ogni argomento in modalità edit
    useEffect(() => {
        const loadFilesForArgomenti = async () => {
            if (!editMode || !formState.configId || filesLoaded) return;

            try {
                const updatedArgomenti = await Promise.all(argomenti.map(async (argomento) => {
                    if (!argomento.id) return argomento; // Salta argomenti senza ID

                    const response = await fetch(`${wwwroot}/lib/ajax/service.php?sesskey=${sesskey}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify([
                            {
                                methodname: 'local_configuratore_get_files_by_argomento',
                                args: { argomentoid: argomento.id }
                            }
                        ])
                    });

                    if (!response.ok) {
                        console.error(`Errore nel caricamento dei file per l'argomento ${argomento.id}`);
                        return argomento;
                    }

                    const result = await response.json();
                    const files = result[0]?.data || [];

                    console.log('📂 File caricati per argomento:', {
                        argomentoId: argomento.id,
                        files: files,
                        filenames: files.map(file => file.filename)
                    });

                    return {
                        ...argomento,
                        file: files.map(file => ({ id: file.id, fileName: file.filename })) // Modifica il nome in fileName
                    };
                }));

                dispatch(loadArgomentiSuccess({ argomenti: updatedArgomenti, count: updatedArgomenti.length }));
                setFilesLoaded(true); // Imposta lo stato per evitare ricaricamenti
            } catch (error) {
                console.error('Errore nel caricamento dei file per gli argomenti:', error);
            }
        };

        // Usa un controllo per evitare il ciclo infinito
        if (!filesLoaded) {
            loadFilesForArgomenti();
        }
    }, [editMode, formState.configId, dispatch, argomenti, sesskey, wwwroot]);


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

    // Funzione per salvare la bozza e uscire
    const saveAsDraft = async () => {
        console.log('💾 Salvataggio bozza argomenti in corso...');
        // TODO: Implementare il salvataggio della bozza con argomenti
        // Qui andrà la logica per salvare gli argomenti come bozza

        try {
            // Per ora mostra un messaggio
            alert("Funzione salvataggio bozza argomenti - da implementare");

            // Dopo il salvataggio, torna alla dashboard
            window.parent.location.href = `${window.location.origin}/local/configuratore/onboarding.php`;
        } catch (error) {
            console.error('❌ Errore nel salvataggio bozza:', error);
            alert(`Errore nel salvataggio: ${error.message}`);
        }
    };

    const handleSalvaEContinua = async () => {
        console.log('💾 handleSalvaEContinua chiamato...');

        // Controlla se tutti gli argomenti hanno titoli validi
        const tuttiArgomentiValidi = argomenti.length > 0 && argomenti.every((argomento) => argomento.titolo.trim() !== '');

        if (!tuttiArgomentiValidi) {
            alert('Assicurati di aver aggiunto almeno un argomento e che tutti gli argomenti abbiano un titolo valido.');
            return; // Blocca l'azione se ci sono argomenti non validi
        }

        console.log('🔍 Parametri:', {
            formStateConfigId: formState.configId,
            argomentiCount: argomenti.length,
            sesskey: sesskey,
            wwwroot: wwwroot
        });

        try {
            // Ottieni sesskey dinamicamente
            const currentSesskey = getMoodleSesskey();
            const currentWwwroot = window.location.origin + '/moodle/moodle';

            console.log('📤 Parametri inviati al web service:', {
                chatbotid: formState.configId,
                argomenti: argomenti.map(argomento => ({
                    id: argomento.isNew ? null : argomento.id,
                    titolo: argomento.titolo,
                    isNew: argomento.isNew || false
                }))
            });



            console.log('argomentoID e titolo', argomenti.map(argomento => ({
                id: argomento.id,
                titolo: argomento.titolo,
                isNew: argomento.isNew
            })));

            const requestData = {
                chatbotid: formState.configId,
                argomenti: argomenti.map(argomento => ({
                    id: argomento.id, // Usa l'ID reale se esiste, altrimenti null
                    titolo: argomento.titolo,
                    isNew: argomento.isNew || false
                }))
            };

            const requestBody = [{
                methodname: 'local_configuratore_save_argomenti',
                args: {
                    data: requestData  // ← Wrappa requestData dentro 'data'
                }
            }];

            console.log('📤 Request body completo:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(`${currentWwwroot}/lib/ajax/service.php?sesskey=${currentSesskey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin', // ← IMPORTANTE per Moodle!
                body: JSON.stringify(requestBody)
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response statusText:', response.statusText);

            if (!response.ok) {
                console.error('❌ HTTP Error:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('❌ Error response text:', errorText);
                alert(`Errore HTTP: ${response.status} - ${response.statusText}`);
                return;
            }

            const result = await response.json();
            console.log('📥 Risultato completo dal web service:', JSON.stringify(result, null, 2));

            if (result[0]?.data?.success) {
                console.log('✅ Salvataggio completato con successo!');
                alert('Argomenti salvati con successo!');

                // Aggiorna lo stato Redux: marca tutti gli argomenti come non nuovi
                const updatedArgomenti = argomenti.map(argomento => ({
                    ...argomento,
                    isNew: false // Dopo il salvataggio, non sono più nuovi
                }));

                setInitialArgomentiSnapshot(JSON.stringify(updatedArgomenti));
            } else {
                console.error('❌ Errore nel salvataggio:', result[0]?.data?.message || 'Messaggio non disponibile');
                console.error('❌ Risultato completo:', result[0]);
                alert(`Errore nel salvataggio: ${result[0]?.data?.message || 'Errore sconosciuto'}`);
            }
        } catch (error) {
            console.error('❌ Errore nella richiesta:', error);
            console.error('❌ Stack trace:', error.stack);
            alert('Errore nella comunicazione con il server.');
        }
    };

    // Funzione per verificare se gli argomenti sono cambiati rispetto allo snapshot iniziale
    const hasArgomentiChanged = () => {
        return JSON.stringify(argomenti) !== initialArgomentiSnapshot; // Confronta lo stato attuale con lo snapshot iniziale
    };

    return (
        <div className="w-full flex flex-col items-center justify-center">


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
                                    giorno={argomento.giorno} // Passa il giorno dell'argomento
                                    editMode={editMode} // Passa lo stato di editMode
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




                    {/* Pulsanti Esci e salva bozza e Step successivo */}
                    <div className="w-[100%] xl:w-[86%] h-30 mx-auto mt-2 flex justify-between items-center">

                        {/* Pulsante Esci e salva bozza */}
                        <button
                            type="button"
                            onClick={saveAsDraft}
                            className="w-40 h-11 cursor-pointer transform rounded-[10px] transition-transform duration-200 hover:scale-103 hover:bg-[#f2f3f7]"
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
                            className="w-35 h-11 right-0 cursor-pointer transform transition-transform duration-200 hover:scale-103"
                            onClick={editMode && hasArgomentiChanged() ? handleSalvaEContinua : handleStepSuccessivo}
                        >

                            <div
                                className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-stretch"
                                style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}>

                                <div className="h-full flex items-center justify-end w-full">
                                    <p className="text-[13px]  text-[#1d2125] flex items-center justify-center">
                                        {editMode && hasArgomentiChanged() ? 'Salva e continua' : 'Step successivo'}
                                    </p>
                                </div>

                                <div className="h-full w-12 flex items-center justify-center ">
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