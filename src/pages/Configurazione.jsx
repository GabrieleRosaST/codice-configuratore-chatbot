import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import invioButton from '../img/invioButton.svg';
import fotoPlaceholder from '../img/fotoBot.svg';
import libroSuggerimento from '../img/libroSuggerimento.svg';
import rewindSuggerimento from '../img/rewindSuggerimento.svg';
import domandaIcon from '../img/domandaIcon.svg';
import closeAiutoIcon from '../img/closeAiutoIcon.svg';
import obiettivoIcon from '../img/obiettivoIcon.svg';
import esciSalvaIcon from '../img/esciSalvaIcon.svg';
import restoreIcon from '../img/restore.svg';
import auraleIcon from '../img/aurale.svg';
import cinesteticoIcon from '../img/cinestetico.svg';
import visivoIcon from '../img/visivo.svg';
import frecciaDestraButton from '../img/frecciaDestraButton.svg';
import aitext from '../img/aitext.svg';

import { useSelector, useDispatch } from 'react-redux';
import { updateForm } from '../store/formSlice';
import { setLoadingArgomenti, setEditMode, loadArgomentiSuccess, loadArgomentiError, setInitialArgomentiSnapshot } from '../store/argomentiSlice';
import { loadArgomentiForEdit, getMoodleSesskey } from '../utils/loadUtils';
import { useStepContext } from '../context/StepContext.jsx';
import { db } from '../firebase';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';






function Configurazione({ sesskey, wwwroot }) {

    const dispatch = useDispatch();
    const formState = useSelector((state) => state.form);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const {
        setCompletedSteps,
        primaVisitaStep1,
        setPrimaVisitaStep1,
        isEditMode,
        setIsEditMode,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        setHasUnsavedChangesPianoLavoro
    } = useStepContext(); // Usa il contesto per aggiornare lo stato


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

    // Stato per il caricamento della generazione AI
    const [isGenerating, setIsGenerating] = useState(false);
    const [isGeneratingName, setIsGeneratingName] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

    // Stato per memorizzare i dati originali in modalità edit
    const [originalData, setOriginalData] = useState(null);

    // Stato per tracciare il pulsante VARK selezionato
    const [selectedVarkButton, setSelectedVarkButton] = useState(null);

    // Stato per gestire la visibilità del div di aiuto
    const [mostraAiuto, setMostraAiuto] = useState(false);

    // Stati per la gestione del caricamento argomenti
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    const [filesLoaded, setFilesLoaded] = useState(false);

    // Redux state per gli argomenti ordinati per ID
    const argomentiRaw = useSelector((state) => state.argomenti.argomenti);
    const argomenti = useMemo(() => {
        return [...argomentiRaw].sort((a, b) => a.id - b.id);
    }, [argomentiRaw]);
    const editModeArgomenti = useSelector((state) => state.argomenti.editMode);



    // Funzione per verificare se ci sono campi compilati (modalità CREATE)
    const hasFieldsCompiled = () => {
        return (
            formState.corsoChatbot.trim() !== '' ||
            formState.nomeChatbot.trim() !== '' ||
            formState.descrizioneChatbot.trim() !== '' ||
            formState.istruzioniChatbot.trim() !== '' ||
            formState.dataInizio !== '' ||
            formState.dataFine !== ''
        );
    };

    // =====================================================
    // FUNZIONE: Determina se la data di inizio può essere modificata
    // =====================================================
    const canEditStartDate = () => {
        // MODALITÀ CREATE: Sempre modificabile
        if (!isEditMode) {
            return true;
        }

        // MODALITÀ EDIT: Dipende dalla data originale e dalle modifiche dell'utente
        if (!formState.dataInizio || !originalData) {
            return true; // Nessuna data o dati originali = modificabile
        }

        // ✅ CASO 1: Se c'è un errore di validazione sulla data di inizio,
        // DEVE essere modificabile per permettere la correzione
        if (errors.dataInizio) {
            return true;
        }

        // ✅ CASO 2: Se l'utente ha già modificato la data rispetto all'originale,
        // DEVE rimanere modificabile (anche se ora è passata)
        if (formState.dataInizio !== originalData.dataInizio) {
            return true;
        }

        // ✅ CASO 3: Data non modificata - controlla se l'originale era futura
        // Solo il valore iniziale dal database conta per il blocco
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const originalStartDate = new Date(originalData.dataInizio);
        originalStartDate.setHours(0, 0, 0, 0);

        // Può modificare SOLO se la data ORIGINALE era FUTURA
        // Se data originale <= oggi → corso già iniziato → NON modificabile
        return originalStartDate > today;
    };

    // Funzione per determinare se la data di fine può essere modificata liberamente
    const canEditEndDate = () => {
        // MODALITÀ CREATE: Sempre modificabile
        if (!isEditMode) {
            return true;
        }

        // MODALITÀ EDIT: Dipende dalla data originale e dalle modifiche dell'utente
        if (!formState.dataFine || !originalData) {
            return true; // Nessuna data o dati originali = modificabile
        }

        // ✅ CASO 1: Se c'è un errore di validazione sulla data di fine,
        // DEVE essere modificabile per permettere la correzione
        if (errors.dataFine) {
            return true;
        }

        // ✅ CASO 2: Se l'utente ha già modificato la data rispetto all'originale,
        // DEVE rimanere modificabile (anche se ora è passata)
        if (formState.dataFine !== originalData.dataFine) {
            return true;
        }

        // ✅ CASO 3: Data non modificata - controlla se l'originale era futura
        // Solo il valore iniziale dal database conta per il blocco
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const originalEndDate = new Date(originalData.dataFine);
        originalEndDate.setHours(0, 0, 0, 0);

        // Può modificare SOLO se la data ORIGINALE era FUTURA
        // Se data originale <= oggi → corso già finito/finisce oggi → NON modificabile
        return originalEndDate > today;
    };

    // Effetto per leggere i parametri URL e popolare il form in modalità edit
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');

        console.log('🔍 Configurazioneeee.jsx - URL params check:', {
            mode: mode,
            configIdFromURL: urlParams.get('configId'),
            configIdFromRedux: formState.configId,
            allParams: Object.fromEntries(urlParams.entries()),
            currentFormState: formState,
            currentIsEditMode: isEditMode
        });

        // CASO 1: Primo accesso da card (mode=edit + parametri URL)
        // Ma solo se Redux non ha già i dati!
        if (mode === 'edit' && urlParams.get('configId') && !formState.configId) {
            console.log('✅ CASO 1: Primo accesso in modalità edit (Redux vuoto)');
            setIsEditMode(true);
            console.log('🔄 Impostato isEditMode a true');

            // Leggi tutti i parametri della configurazione
            const configData = {
                corsoChatbot: urlParams.get('corsoChatbot') || '',
                nomeChatbot: urlParams.get('nomeChatbot') || '',
                descrizioneChatbot: urlParams.get('descrizioneChatbot') || '',
                istruzioniChatbot: urlParams.get('istruzioniChatbot') || '',
                dataInizio: urlParams.get('dataInizio') || '',
                dataFine: urlParams.get('dataFine') || '',
                configId: urlParams.get('configId') || '',
                courseId: urlParams.get('courseId') || '',
                userId: urlParams.get('userId') || ''
            };

            console.log('📊 Populating form with URL data:', configData);

            // Salva i dati originali per il confronto
            setOriginalData(configData);

            // Popola il Redux store con i dati della configurazione
            dispatch(updateForm(configData));
        }
        // CASO 2: Ritorno dalla navigazione (Redux ha già i dati)
        else if (mode === 'edit' && urlParams.get('configId') && formState.configId) {
            console.log('✅ CASO 2: Ritorno dalla navigazione (Redux ha già i dati)');
            setIsEditMode(true);
            console.log('🔄 Impostato isEditMode a true');

            // ✅ IMPOSTA originalData con i valori attuali del Redux
            // Questi sono i valori "salvati" che diventano il nuovo punto di riferimento
            const currentDataAsOriginal = {
                corsoChatbot: formState.corsoChatbot,
                nomeChatbot: formState.nomeChatbot,
                descrizioneChatbot: formState.descrizioneChatbot,
                istruzioniChatbot: formState.istruzioniChatbot,
                dataInizio: formState.dataInizio,
                dataFine: formState.dataFine,
                configId: formState.configId,
                courseId: formState.courseId,
                userId: formState.userId
            };

            console.log('📊 Setting originalData from current Redux state:', currentDataAsOriginal);
            setOriginalData(currentDataAsOriginal);

            // Ora l'useEffect per monitorare le modifiche funzionerà correttamente
        }
        // CASO 3: Mode edit ma senza configId
        else if (mode === 'edit') {
            console.log('⚠️ CASO 3: Mode edit ma senza configId nei parametri URL');
            setIsEditMode(true);
            console.log('🔄 Impostato isEditMode a true comunque');
        }
        else {
            console.log('ℹ️ Non in modalità edit, mode =', mode);
        }
    }, []); // Esegui solo al mount del componente

    // 🐛 DEBUG: Monitora i cambiamenti dei valori critici
    useEffect(() => {
        console.log('🔍 DEBUG - Valori critici cambiati:', {
            isEditMode: isEditMode,
            configId: formState.configId,
            initialLoadComplete: initialLoadComplete,
            editModeArgomenti: editModeArgomenti,
            argomentiLength: argomenti.length,
            filesLoaded: filesLoaded,
            timestamp: new Date().toLocaleTimeString()
        });
    }, [isEditMode, formState.configId, initialLoadComplete, editModeArgomenti, argomenti.length, filesLoaded]);


    // Effetto per monitorare le modifiche ai campi del form (modalità EDIT) e modificare pulsante in "Salva e continua"
    useEffect(() => {
        if (isEditMode && originalData) {
            // Controlla se ci sono modifiche rispetto ai dati originali
            const hasFormChanges = (
                formState.corsoChatbot !== originalData.corsoChatbot ||
                formState.nomeChatbot !== originalData.nomeChatbot ||
                formState.descrizioneChatbot !== originalData.descrizioneChatbot ||
                formState.istruzioniChatbot !== originalData.istruzioniChatbot ||
                formState.dataInizio !== originalData.dataInizio ||
                formState.dataFine !== originalData.dataFine
            );

            setHasUnsavedChanges(hasFormChanges);
            setHasUnsavedChangesPianoLavoro(hasFormChanges);
        }
    }, [formState, originalData, isEditMode]);


    // Effetto per monitorare i campi del form e abilitare o disabilitare voci navbar
    useEffect(() => {
        const today = new Date();
        const startDate = new Date(formState.dataInizio);
        const endDate = new Date(formState.dataFine);

        // Verifica se tutti i campi sono validi
        const isNomeChatbotValid = formState.nomeChatbot.trim() !== '';
        const isCorsoChatbotValid = formState.corsoChatbot.trim() !== '';

        // Per la data di inizio:
        // - In modalità CREATE: deve essere futura
        // - In modalità EDIT: sempre valida se presente (anche se passata)
        const isDataInizioValid = formState.dataInizio && (
            !isEditMode ? startDate > today : true
        );

        const isDataFineValid = formState.dataFine && endDate > startDate;

        const isStep1Valid = isNomeChatbotValid && isCorsoChatbotValid && isDataInizioValid && isDataFineValid;

        // Non aggiornare lo step se il nome del corso è stato modificato dopo una validazione
        if (!primaVisitaStep1 && !courseNameChanged) {
            setCompletedSteps((prev) => ({ ...prev, step1: isStep1Valid }));
        }
        // Aggiorna lo stato step1

    }, [formState, setCompletedSteps, primaVisitaStep1, courseNameChanged, isEditMode]);

    // 🔄 CARICAMENTO ARGOMENTI IN MODALITÀ EDIT - ATTIVATO QUANDO configId È DISPONIBILE
    useEffect(() => {
        console.log('🚀 useEffect CARICAMENTO ARGOMENTI attivato!', {
            isEditMode,
            configId: formState.configId,
            initialLoadComplete,
            editModeArgomenti,
            timestamp: new Date().toLocaleTimeString()
        });

        const loadArgomentiIfEdit = async () => {
            console.log('🔍 Debug - Checking edit mode:', {
                configId: formState.configId,
                initialLoadComplete,
                editModeArgomenti,
                hasConfigId: !!formState.configId,
                isEditMode
            });

            // Se siamo in modalità edit e abbiamo un configId e non abbiamo già caricato
            if (isEditMode && formState.configId && !initialLoadComplete && !editModeArgomenti) {
                console.log('📥 Modalità Edit rilevata - Caricamento argomenti per chatbot ID:', formState.configId);

                try {
                    dispatch(setLoadingArgomenti(true));

                    // Ottieni sesskey e wwwroot
                    const sessionKey = getMoodleSesskey();
                    // Usa l'URL corrente completo invece di window.location.origin
                    const currentWwwroot = window.location.origin + '/moodle/moodle';

                    console.log('🔗 Parametri per chiamata API:', {
                        configId: formState.configId,
                        sesskey: sessionKey ? 'OK' : 'MISSING',
                        wwwroot: currentWwwroot
                    });

                    // Carica argomenti dal database Moodle
                    const result = await loadArgomentiForEdit(formState.configId, sessionKey, currentWwwroot);

                    console.log('📊 Risultato chiamata loadArgomentiForEdit:', {
                        success: result.success,
                        count: result.count,
                        argomenti: result.argomenti
                    });

                    if (result.success) {
                        console.log('✅ Argomenti recuperati dal database:', result.argomenti);
                        console.log(`📈 Totale argomenti caricati: ${result.count}`);

                        // Carica gli argomenti in Redux
                        dispatch(loadArgomentiSuccess({
                            argomenti: result.argomenti,
                            count: result.count
                        }));



                        // Imposta la modalità edit per gli argomenti
                        dispatch(setEditMode(true));
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
                    isEditMode,
                    hasConfigId: !!formState.configId,
                    initialLoadComplete,
                    editModeArgomenti,
                    reason: !isEditMode ? 'Not in edit mode' :
                        !formState.configId ? 'No configId' :
                            initialLoadComplete ? 'Already loaded' :
                                editModeArgomenti ? 'Already in edit mode' : 'Unknown'
                });
            }
        };

        loadArgomentiIfEdit();
    }, [isEditMode, formState.configId, initialLoadComplete, editModeArgomenti, dispatch]); // ✅ SI ATTIVA quando questi valori cambiano   



    // 📂 CARICAMENTO FILES PER ARGOMENTI IN MODALITÀ EDIT - ATTIVATO QUANDO editModeArgomenti È TRUE
    useEffect(() => {
        const loadFilesForArgomenti = async () => {
            console.log('📂 Controllo caricamento file:', {
                editModeArgomenti,
                hasConfigId: !!formState.configId,
                filesLoaded,
                argomentiCount: argomenti.length
            });

            // Carica file solo se abbiamo argomenti e non li abbiamo già caricati
            if (editModeArgomenti && formState.configId && !filesLoaded && argomenti.length > 0) {
                console.log('📂 Inizio caricamento file per argomenti:', {
                    argomentiCount: argomenti.length,
                    filesLoaded
                });

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
                            file: files.map(file => ({ id: file.id, fileName: file.filename }))
                        };
                    }));

                    console.log('📂 Aggiornamento argomenti con file caricati');
                    dispatch(loadArgomentiSuccess({ argomenti: updatedArgomenti, count: updatedArgomenti.length }));

                    // Imposta lo snapshot iniziale per il ripristino
                    dispatch(setInitialArgomentiSnapshot());

                    setFilesLoaded(true); // Imposta lo stato per evitare ricaricamenti
                } catch (error) {
                    console.error('Errore nel caricamento dei file per gli argomenti:', error);
                }
            } else {
                console.log('📂 Skip caricamento file:', {
                    editModeArgomenti,
                    hasConfigId: !!formState.configId,
                    filesLoaded,
                    argomentiLength: argomenti.length,
                    reason: !editModeArgomenti ? 'Not in edit mode' :
                        !formState.configId ? 'No configId' :
                            filesLoaded ? 'Already loaded' :
                                argomenti.length === 0 ? 'No argomenti' : 'Unknown'
                });
            }
        };

        loadFilesForArgomenti();
    }, [editModeArgomenti, formState.configId, argomenti.length, filesLoaded, sesskey, wwwroot]); // ✅ SI ATTIVA quando editModeArgomenti diventa true e ci sono argomenti


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
    const checkCourseExists = async (courseName, excludeConfigId = null) => {
        console.log('🔍 Verifica duplicati per corso:', courseName, 'escludi ID:', excludeConfigId);
        try {
            const response = await fetch(`${wwwroot}/lib/ajax/service.php?sesskey=${sesskey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify([{
                    methodname: 'local_configuratore_check_course_name_exists',
                    args: {
                        coursename: courseName,
                        excludeid: excludeConfigId
                    }
                }])
            });

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            const json = await response.json();
            console.log('📊 Risposta controllo duplicati:', json);

            if (json[0] && json[0].error) {
                throw new Error(json[0].exception?.message || 'Errore nel controllo duplicati');
            }

            const result = json[0]?.data;
            console.log('✅ Risultato controllo:', result);

            return result?.exists || false;
        } catch (error) {
            console.error('❌ Errore controllo duplicati:', error);
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

        // =====================================================
        // CONTROLLO DATA DI INIZIO - Logica basata sulla modalità
        // =====================================================
        if (!formState.dataInizio) {
            // Data di inizio mancante - sempre errore
            newErrors.dataInizio = true;
            hasError = true;
        } else if (isEditMode) {
            // *** MODALITÀ EDIT ***
            const canModifyStartDate = canEditStartDate(); // true se data futura, false se passata

            if (!canModifyStartDate) {
                // CASO 1: Data inizio PASSATA/UGUALE a oggi
                // → NON modificabile → NON controllata → Passa sempre
                console.log('📅 EDIT: Data passata - non modificabile, controlli saltati');
                // Nessun errore, procedi
            } else {
                // CASO 2: Data inizio FUTURA
                // → Modificabile → Deve essere controllata
                console.log('📅 EDIT: Data futura - modificabile, applico controlli');

                if (startDate <= today) {
                    // Data modificata ma ora è passata/uguale a oggi
                    newErrors.dataInizio = true;
                    hasError = true;
                    alert("La data di inizio deve essere successiva al giorno attuale.");
                } else if (startDate < MIN_DATE || startDate > MAX_DATE) {
                    // Data fuori range consentito
                    newErrors.dataInizio = true;
                    hasError = true;
                    alert("La data di inizio deve essere compresa tra il 2024 e il 2030.");
                }
                // Se passa tutti i controlli, è valida
            }
        } else {
            // *** MODALITÀ CREAZIONE ***
            console.log('📅 CREATE: Applico controlli standard');

            if (startDate <= today) {
                // Data uguale o precedente a oggi
                newErrors.dataInizio = true;
                hasError = true;
                alert("La data di inizio deve essere successiva al giorno attuale.");
            } else if (startDate < MIN_DATE || startDate > MAX_DATE) {
                // Data fuori range consentito
                newErrors.dataInizio = true;
                hasError = true;
                alert("La data di inizio deve essere compresa tra il 2024 e il 2030.");
            }
            // Se passa tutti i controlli, è valida
        }

        // =====================================================
        // CONTROLLO DATA DI FINE
        // =====================================================
        if (!formState.dataFine) {
            // Data di fine mancante - sempre errore
            newErrors.dataFine = true;
            hasError = true;
        } else {
            console.log('📅 Controllo data fine');

            // Controlli comuni per entrambe le modalità
            if (endDate <= startDate) {
                // Data fine deve essere successiva alla data inizio
                newErrors.dataFine = true;
                hasError = true;
                alert("La data di fine deve essere successiva di almeno un giorno alla data di inizio.");
            } else if (endDate < MIN_DATE || endDate > MAX_DATE) {
                // Data fuori range consentito
                newErrors.dataFine = true;
                hasError = true;
                alert("La data di fine deve essere compresa tra il 2024 e il 2030.");
            } else if (isEditMode) {
                // *** MODALITÀ EDIT - CONTROLLI AGGIUNTIVI ***
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const endDateCheck = new Date(formState.dataFine);
                endDateCheck.setHours(0, 0, 0, 0);

                // Controlla se la data di fine originale era futura
                const originalEndDate = originalData ? new Date(originalData.dataFine) : null;
                if (originalEndDate) {
                    originalEndDate.setHours(0, 0, 0, 0);
                }

                // Se la data originale era futura e ora si tenta di metterla passata/oggi, blocca
                if (originalEndDate && originalEndDate > today && endDateCheck <= today) {
                    console.log('📅 EDIT: Tentativo di impostare data fine passata quando originale era futura');
                    newErrors.dataFine = true;
                    hasError = true;
                    alert("Non è possibile impostare una data di fine passata o uguale a oggi quando la data originale era futura.");
                } else {
                    console.log('📅 EDIT: Data fine valida per modalità edit');
                }
            } else {
                // *** MODALITÀ CREAZIONE ***
                console.log('📅 CREATE: Data fine valida per modalità creazione');
            }
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

            if (isEditMode && hasUnsavedChanges) {
                // CASO 1: MODALITÀ EDIT CON MODIFICHE - Salva le modifiche
                // VERIFICA DUPLICATI SOLO SE IL NOME DEL CORSO È CAMBIATO
                if (formState.corsoChatbot !== originalData.corsoChatbot) {
                    console.log('🔍 Nome corso cambiato, verifico duplicati...', formState.corsoChatbot, originalData.corsoChatbot);

                    // Passa l'ID della configurazione corrente per escluderla dal controllo
                    const courseExists = await checkCourseExists(formState.corsoChatbot, originalData.configId);

                    console.log('🔍 Risultato verifica duplicati:', courseExists);

                    if (courseExists) {
                        alert(`Esiste già un corso con il nome "${formState.corsoChatbot}". Scegli un nome diverso.`);
                        setErrors(prev => ({ ...prev, corsoChatbot: true }));
                        return;
                    }
                }

                // Solo se il controllo duplicati passa, salva
                await updateExistingConfiguration();
            } else if (isEditMode && !hasUnsavedChanges) {
                // CASO 2: MODALITÀ EDIT SENZA MODIFICHE - Vai direttamente al prossimo step
                console.log('✅ CASO 2: Edit mode senza modifiche - passo direttamente al prossimo step');
                setCompletedSteps((prev) => ({ ...prev, step1: true }));
                setCourseNameChanged(false);
                setPrimaVisitaStep1(false);
                navigate("/argomentiRiferimenti");
            } else {
                // CASO 3: MODALITÀ CREATE - Verifica duplicati e procedi al prossimo step
                console.log('✅ CASO 3: Create mode - verifico duplicati');

                // Non passare excludeId perché stiamo creando un nuovo corso
                const courseExists = await checkCourseExists(formState.corsoChatbot, null);

                if (courseExists) {
                    alert(`Esiste già un corso con il nome "${formState.corsoChatbot}". Scegli un nome diverso.`);
                    setErrors(prev => ({ ...prev, corsoChatbot: true }));
                    return;
                }

                // Se tutto è ok, procedi al prossimo step
                setCompletedSteps((prev) => ({ ...prev, step1: true }));
                setCourseNameChanged(false);
                setPrimaVisitaStep1(false);
                setHasUnsavedChanges(false);
                setHasUnsavedChangesPianoLavoro(false);
                navigate("/argomentiRiferimenti");
            }
        } catch (error) {
            alert(`Errore: ${error.message}`);
        } finally {
            setIsCheckingCourse(false);
        }
    };




    // Funzione per aggiornare la configurazione esistente
    const updateExistingConfiguration = async () => {
        try {
            console.log('🔄 Inizio aggiornamento configurazione...');
            console.log('📊 originalData:', originalData);
            console.log('📝 formState attuale:', {
                corsoChatbot: formState.corsoChatbot,
                nomeChatbot: formState.nomeChatbot,
                descrizioneChatbot: formState.descrizioneChatbot,
                istruzioniChatbot: formState.istruzioniChatbot,
                dataInizio: formState.dataInizio,
                dataFine: formState.dataFine
            });

            const configData = {
                corsoChatbot: formState.corsoChatbot,
                nomeChatbot: formState.nomeChatbot,
                descrizioneChatbot: formState.descrizioneChatbot,
                istruzioniChatbot: formState.istruzioniChatbot,
                dataInizio: formState.dataInizio,
                dataFine: formState.dataFine
            };

            console.log('📦 configData preparato:', configData);

            const requestBody = [{
                methodname: 'local_configuratore_update_chatbot_basic',
                args: {
                    chatbotid: originalData.configId,
                    data: JSON.stringify(configData),
                    filedata: []
                }
            }];

            console.log('📨 Request body:', JSON.stringify(requestBody, null, 2));

            // 1. AGGIORNA IL DATABASE MOODLE
            const response = await fetch(`${wwwroot}/lib/ajax/service.php?sesskey=${sesskey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(requestBody)
            });

            console.log('📡 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Response error text:', errorText);
                throw new Error(`HTTP Error ${response.status}: ${errorText}`);
            }

            const json = await response.json();
            console.log('📦 Response JSON:', json);

            if (json[0] && json[0].error) {
                console.error('❌ Server error details:', json[0].exception);
                throw new Error(`Server Error: ${json[0].exception?.message || 'Errore sconosciuto dal server'}`);
            }

            if (json[0] && json[0].data && json[0].data.success) {
                console.log('✅ Aggiornamento Moodle riuscito!');

                // 2. AGGIORNA FIRESTORE
                try {
                    console.log('🔄 Aggiornamento Firestore in corso...');

                    // Ottieni l'userId per Firestore
                    const userId = await getUserIdFromMoodle();
                    if (!userId) {
                        throw new Error('UserId non trovato per Firestore');
                    }

                    // Prepara i dati per Firestore (stesso formato di quando viene creato)
                    const firestoreData = {
                        courseName: formState.corsoChatbot,
                        nomeChatbot: formState.nomeChatbot,
                        descrizioneChatbot: formState.descrizioneChatbot,
                        istruzioniChatbot: formState.istruzioniChatbot,
                        dataInizio: formState.dataInizio,
                        dataFine: formState.dataFine
                    };

                    console.log('📦 Dati Firestore preparati:', firestoreData);

                    // Aggiorna il documento su Firestore
                    // Assumi che il documento abbia l'ID uguale al configId
                    console.log('COURSEIDDD', originalData.courseId)
                    const courseDocRef = doc(db, 'users', userId, 'courses', originalData.courseId);
                    await updateDoc(courseDocRef, firestoreData);

                    console.log('✅ Aggiornamento Firestore riuscito!');

                } catch (firestoreError) {
                    console.warn('⚠️ Errore aggiornamento Firestore (ma Moodle è stato salvato):', firestoreError);
                    // Non bloccare il flusso se Firestore fallisce, dato che Moodle è già salvato
                    // Potresti mostrare un warning all'utente o logare per debug
                }

                // 3. AGGIORNA I DATI REDUX CON I NUOVI VALORI
                dispatch(updateForm({
                    corsoChatbot: formState.corsoChatbot,
                    nomeChatbot: formState.nomeChatbot,
                    descrizioneChatbot: formState.descrizioneChatbot,
                    istruzioniChatbot: formState.istruzioniChatbot,
                    dataInizio: formState.dataInizio,
                    dataFine: formState.dataFine,
                    configId: originalData.configId
                }));

                // 4. AGGIORNA I DATI ORIGINALI PER IL CONFRONTO FUTURO
                setOriginalData({
                    ...originalData,
                    corsoChatbot: formState.corsoChatbot,
                    nomeChatbot: formState.nomeChatbot,
                    descrizioneChatbot: formState.descrizioneChatbot,
                    istruzioniChatbot: formState.istruzioniChatbot,
                    dataInizio: formState.dataInizio,
                    dataFine: formState.dataFine
                });

                // 5. RESET DELLO STATO MODIFICHE
                setHasUnsavedChanges(false);
                setHasUnsavedChangesPianoLavoro(false);

                // 6. COMPLETA LO STEP 1 NEL CONTESTO
                setCompletedSteps((prev) => ({ ...prev, step1: true }));

                // 7. NAVIGA ALLA SEZIONE ARGOMENTI
                console.log('🔄 Navigating to arguments section...');
                navigate("/argomentiRiferimenti");

            } else {
                console.error('❌ Errore nella risposta:', json[0]);
                throw new Error(json[0]?.data?.message || json[0]?.error || 'Errore durante il salvataggio');
            }
        } catch (error) {
            console.error('💥 Errore completo:', error);
            throw new Error(`Errore durante il salvataggio: ${error.message}`);
        }
    };



    // Funzione per generare suggerimenti AI
    const generateInstructions = async () => {
        if (isGenerating) return;

        setIsGenerating(true);

        try {
            // Debug: verifica se la chiave API è caricata
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            console.log('API Key disponibile:', apiKey ? 'Sì' : 'No');
            console.log('Primi caratteri della chiave:', apiKey ? apiKey.substring(0, 10) + '...' : 'Nessuna chiave');

            if (!apiKey) {
                throw new Error('Chiave API OpenAI non trovata. Verifica il file .env');
            }

            // Usa OpenAI API per generare le istruzioni
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `Genera delle istruzioni brevi e professionali che il chatbot dovrà seguire. Il testo deve essere come scritto dal docente verso il configuratore.  Le istruzioni devono essere circa 50-80 parole, in italiano, e spiegare come il chatbot didattico dovrebbe comportarsi durante il corso per aiutare gli studenti e in che modo specifico può formulare le spiegazioni per gli studenti. Gli studenti utilizzerano il chatbot per studiare da casa non in aula, è fatto apposta per incentivare lo studio autonomo oltre alle lezioni, quindi non menzionare la presenza in aula. Devono essere istruzioni dirette e senza saluti. E' importante che ogni testo generato sia vario da quello precedente, quindi cerca sempre di variare con i concetti, devi essere originale, sia come contenuto del messaggio che come struttura. Le istruzioni non devono andare al di fuori di comportamenti nel tono della spiegazione che dovrà usare il chatbot, non devono considerare funzionalià aggiuntive, solo il modo in cui il chatbot risponderà testualmente.`
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            console.log('Risposta API status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Errore API:', errorText);
                throw new Error(`Errore API (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            const generatedText = data.choices[0].message.content.trim();

            // Aggiorna il campo istruzioni
            dispatch(updateForm({ istruzioniChatbot: generatedText }));

        } catch (error) {
            console.error('Errore nella generazione:', error);
            alert(`Errore nella generazione automatica: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    // Funzione per generare nome assistente
    const generateAssistantName = async () => {
        if (isGeneratingName) return;

        setIsGeneratingName(true);

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

            if (!apiKey) {
                throw new Error('Chiave API OpenAI non trovata. Verifica il file .env');
            }

            const courseName = formState.corsoChatbot || 'il corso';

            console.log('Generazione nome assistente per il corso:', courseName);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `Genera un nome creativo e professionale per un chatbot assistente didattico AI che aiuterà gli studenti nel corso "${courseName}". Il nome deve essere: breve (massimo 3-4 parole), facile da ricordare, accogliente ma professionale, adatto al contesto educativo. Evita nomi troppo tecnici o robotici. Deve centrare con il nome del corso se ci riesci, altrimenti nome normale. Prova anche a prende l'acronimo del corso e aggiungerci tutor o assistant. Il nome deve anche essere simpatico se ci riesci. Restituisci solo il nome, senza spiegazioni.`
                        }
                    ],
                    max_tokens: 50,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Errore API (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            const generatedName = data.choices[0].message.content.trim().replace(/['"]/g, '');

            // Aggiorna il campo nome
            dispatch(updateForm({ nomeChatbot: generatedName }));

        } catch (error) {
            console.error('Errore nella generazione del nome:', error);
            alert(`Errore nella generazione automatica: ${error.message}`);
        } finally {
            setIsGeneratingName(false);
        }
    };

    // Funzione per generare descrizione
    const generateDescription = async () => {
        if (isGeneratingDescription) return;

        setIsGeneratingDescription(true);

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

            if (!apiKey) {
                throw new Error('Chiave API OpenAI non trovata. Verifica il file .env');
            }

            const courseName = formState.corsoChatbot || '*NOME DEL CORSO*';
            const assistantName = formState.nomeChatbot || 'l\'assistente';

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user",
                            content: `Scrivi una descrizione breve e accattivante per il chatbot assistente didattico AI per il corso "${courseName}". La descrizione deve essere di massimo 140 caratteri, scritta in italiano, coinvolgente e che spieghi come l'assistente può aiutare gli studenti nello studio. Usa un tono amichevole ma professionale. Il testo deve essere come scritto dal professore per la configurazione che sta svolgendo. Non inserire punti in mezzo alla frase e caratteri speciali. Il chatbot è programmato nello specifico per aiutare gli studenti in base al loro metodo di apprendimento e fornisce le risposte in base ai materiali caricati del professore, non può svolgere e generare quiz o altro, ma solo aiutare nello studio lo studente. La descrizione deve essere riferita allo studente singolo non plurale`
                        }
                    ],
                    max_tokens: 100,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Errore API (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            let generatedDescription = data.choices[0].message.content.trim().replace(/['"]/g, '');

            // Limita a 200 caratteri se necessario
            if (generatedDescription.length > 200) {
                generatedDescription = generatedDescription.substring(0, 197) + '...';
            }

            // Aggiorna il campo descrizione
            dispatch(updateForm({ descrizioneChatbot: generatedDescription }));


        } catch (error) {
            console.error('Errore nella generazione della descrizione:', error);
            alert(`Errore nella generazione automatica: ${error.message}`);
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    // Funzione per ripristinare ai valori originali
    const resetToOriginalValues = () => {
        if (originalData) {
            console.log('🔄 Ripristinando ai valori originali:', originalData);
            dispatch(updateForm(originalData));
            setHasUnsavedChanges(false);
            setHasUnsavedChangesPianoLavoro(false);
            setErrors({
                nomeChatbot: false,
                corsoChatbot: false,
                dataInizio: false,
                dataFine: false,
            });
        }
    };

    // Funzione per tornare alla dashboard
    const goBackToCourses = () => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm("Hai modifiche non salvate. Vuoi davvero uscire senza salvare?");
            if (!confirmLeave) return;
        }

        // Torna alla dashboard dei corsi
        window.parent.location.href = `${wwwroot}/local/configuratore/onboarding.php`;
    };

    // Funzione per salvare la bozza (modalità CREATE)
    const saveAsDraft = async () => {
        console.log('💾 Salvataggio bozza in corso...');
        // TODO: Implementare il salvataggio della bozza
        // Qui andrà la logica per salvare i dati come bozza

        try {
            // Per ora mostra un messaggio
            alert("Funzione salvataggio bozza - da implementare");

            // Dopo il salvataggio, torna alla dashboard
            window.parent.location.href = `${wwwroot}/local/configuratore/onboarding.php`;
        } catch (error) {
            console.error('❌ Errore nel salvataggio bozza:', error);
            alert(`Errore nel salvataggio: ${error.message}`);
        }
    };

    // Stato per gestire il blocco della navigazione




    // Effetto per gestire l'alert di navigazione
    useEffect(() => {

        const handlePopState = (event) => {
            console.log('🔙 Navigazione indietro rilevata');
            console.log('📝 Campi compilati:', hasFieldsCompiled());

            if (hasFieldsCompiled()) {
                console.log('⚠️ Mostro alert per modifiche non salvate');
                const confirmLeave = window.confirm('Hai modifiche non salvate. Vuoi davvero uscire?');
                if (!confirmLeave) {
                    console.log('❌ Utente ha cancellato, rimango sulla pagina');
                    // Se l'utente cancella, rimani sulla pagina attuale
                    window.history.pushState(null, '', window.location.href);
                    return;
                }
                console.log('✅ Utente ha confermato, esco dalla pagina');

            }
            // Reindirizza alla pagina onboarding usando il parametro wwwroot
            console.log('🔄 Reindirizzo a onboarding');
            window.parent.location.href = `${wwwroot}/local/configuratore/onboarding.php`;
        };        // Aggiungi un entry nella cronologia per intercettare il back
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [formState, wwwroot]); // Aggiunte le dipendenze per rilevare i cambiamenti




    return (

        <div className="w-full flex flex-col items-center justify-center">

            {mostraAiuto ? (
                <div className="w-[100%] xl:w-[86%] mx-auto flex flex-col items-center justify-">

                    <div className="w-full h-14 mb-6 relative flex items-center justify-center md:justify-start">
                        <button
                            className="w-21 h-9 rounded-[25px] bg-white flex items-center justify-center cursor-pointer transform transition-transform duration-200 hover:scale-102"
                            style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                            onClick={() => setMostraAiuto(false)}
                        >
                            <img src={closeAiutoIcon} alt="Icona chiudi" className="w-2.5 h-2.5 mr-2" />
                            <p className="text-[13px] text-center text-[#4f5255]">Chiudi</p>
                        </button>
                    </div>

                    <div className="w-[65%] mx-auto mt-1 mb-3 p-5 bg-white rounded-[15px] flex justify-center items-center flex-col"
                        style={{ boxShadow: '0px 0px 6px 6px rgba(0,0,0,0.0)', outline: '1px solid #E5E5E7' }}>

                        <div className="w-[90%] h-10 relative flex items-center justify-center mt-4 gap-3">
                            <img src={obiettivoIcon} className='w-5 h-5' />
                            <h2 className="text-[18px] h-full flex items-center font-bold text-center text-[#21225f]">A cosa serve questa pagina?</h2>
                        </div>

                        <div className='w-[82%]'>
                            <p className='text-[14px] text-[#4f5255] mb-3 mt-3'>
                                In questa pagina puoi configurare il corso e l'assistente didattico associato che utilizzeranno gli studenti per studiare in autonomia. Per completare la configurazione, compila i seguenti campi:
                            </p>
                            <ul className='list-disc list-inside text-[14px] text-[#4f5255] space-y-1 mb-3'>
                                <li>Inserire il nome del corso</li>
                                <li>Assegnare un nome all'assistente AI</li>
                                <li>Scrivere una breve descrizione dell'assistente</li>
                                <li>Definire le istruzioni che l'assistente dovrà seguire, questo serve per personalizzare le risposte dell'assistente secondo le tue esigenze</li>
                                <li>Impostare le date di inizio e fine del corso</li>
                            </ul>

                            <p className='text-[14px] text-[#4f5255] mb-3 mt-5'>
                                In alcuni campi è presente il pulsante <span className="inline-flex w-5 h-5 mx-1 rounded-full bg-gradient-to-br from-[#d793f2] to-[#FCC63D] items-center justify-center align-middle"><img src={aitext} alt="Pulsante AI" className="w-3 h-3 filter brightness-0 invert" /></span> che ti permette di generare automaticamente un esempio di input tramite l'intelligenza artificiale, in questo modo potrai velocizzare la compilazione del form e prendere ispirazione.
                            </p>

                        </div>

                        <div className="w-full h-12 relative flex items-center justify-center mb-3 mt-6 gap-3">
                            <img src={aitext} className='w-6 h-6' />
                            <h2 className="text-[18px] h-full flex items-center font-bold text-center text-[#21225f]">Cosa sono i pulsanti VARK?</h2>
                        </div>



                        <div className='w-[82%] mx-auto'>

                            <p className='text-[14px] text-[#4f5255] mb-4'>
                                I pulsanti VARK servono per selezionare lo stile con cui l'assistente risponderà alle domande dello studente e ottimizzare lo studio.
                                Ogni studente potrà sapere il proprio stile di apprendimento tramite un semplice test che gli verrà proposto all'inizio.
                            </p>

                            <p className='text-[14px] text-[#4f5255] mb-3'>
                                Le 4 categorie di stili di apprendimento VARK sono:
                            </p>

                            <ul className='space-y-3 mb-8'>
                                <li className='flex items-center ml-2'>
                                    <img src={visivoIcon} alt="Visivo" className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span className='text-[14px] text-[#4f5255]'>
                                        <strong>Visivo:</strong> Per studenti che apprendono meglio con immagini, grafici e diagrammi
                                    </span>
                                </li>
                                <li className='flex items-center ml-2'>
                                    <img src={auraleIcon} alt="Uditivo" className="w-6 h-6 mr-2 flex-shrink-0" />
                                    <span className='text-[14px] text-[#4f5255]'>
                                        <strong>Uditivo:</strong> Per studenti che preferiscono spiegazioni audio e discussioni
                                    </span>
                                </li>
                                <li className='flex items-center ml-3'>
                                    <img src={libroSuggerimento} alt="Lettura/Scrittura" className="w-4 h-4 mr-3 flex-shrink-0" />
                                    <span className='text-[14px] text-[#4f5255]'>
                                        <strong>Lettura/Scrittura:</strong> Per studenti che imparano attraverso testi e note scritte
                                    </span>
                                </li>
                                <li className='flex items-center ml-2'>
                                    <img src={cinesteticoIcon} alt="Cinestetico" className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span className='text-[14px] text-[#4f5255]'>
                                        <strong>Cinestetico:</strong> Per studenti che apprendono attraverso attività ed esempi concreti
                                    </span>
                                </li>
                            </ul>
                            <p className='text-[14px] text-[#4f5255] mb-8'>📌 Potrai sempre tornare a questo punto e modificare le impostazioni del corso e dell'assistente, sia durante la configurazione iniziale che in un secondo momento.</p>
                        </div>

                    </div>

                </div>

            ) : (
                <>
                    <div className="w-[100%] xl:w-[86%] min-h-14 relative flex justify-start items-center flex-wrap">
                        <div className="md:w-20 w-170 z-13 h-10 flex items-center justify-center">
                            <button
                                className="w-20 h-9 rounded-[25px] bg-white flex items-center justify-center cursor-pointer transform transition-transform duration-200 hover:scale-102"
                                onClick={() => setMostraAiuto(true)}
                                style={{ boxShadow: '0px 2px 8.5px 10px rgba(0,0,0,0.01)', outline: '1px solid #E5E5E7' }}
                            >
                                <img src={domandaIcon} alt="Icona domanda" className="w-2 mr-2 ml-1" />
                                <p className="text-[14px] text-center text-[#4f5255]">Aiuto</p>
                            </button>
                        </div>

                        <p className="flex flex-grow text-[16px] font-bold justify-center text-center text-[#21225f] mt-1">
                            Configura il corso e l'assistente didattico associato
                        </p>

                        <div className='md:w-22 h-9 w-0'></div>
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
                                    <div className="mb-8 w-[88%] relative">
                                        <p className="w-[205.51px] h-[28.77px] text-[13px] font-medium text-left text-[#1d2125]">Assistente</p>
                                        <div className="relative group">
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
                                                className={`w-full h-9 p-2 pl-3 pr-9 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56]  text-[13px] placeholder-[#A3A7AA] ${errors.nomeChatbot ? "border-red-500 bg-red-50" : "border-[#bfbfbf]/[0.56]"
                                                    } placeholder-opacity-50 text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                            />
                                            {/* Pulsante AI overlay */}
                                            <button
                                                type="button"
                                                onClick={generateAssistantName}
                                                disabled={isGeneratingName}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[#d793f2] to-[#FCC63D] ${isGeneratingName
                                                    ? 'opacity-100 cursor-auto'
                                                    : 'opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:scale-110 hover:cursor-pointer hover:shadow-[0px_0px_6px_3px_rgba(215,147,242,0.1)]'
                                                    }`}
                                            >
                                                {isGeneratingName ? (
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <img
                                                        src={aitext}
                                                        alt="AI Generate"
                                                        className="w-3 h-3 filter brightness-0 invert"
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>





                                    {/* Input per la DESCRIZIONE del chatbot */}
                                    <div className=" mb-2 w-[88%] relative">
                                        <p className="w-[205.51px] h-[28.77px] text-[13px] font-medium text-left text-[#1d2125] ">Descrizione</p>
                                        <div className="relative group">
                                            <textarea
                                                id="input-descrizione"
                                                placeholder="Scrivi una breve descrizione del chatbot"
                                                value={formState.descrizioneChatbot || ''}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 200) {
                                                        dispatch(updateForm({ descrizioneChatbot: e.target.value }))
                                                    }
                                                }}
                                                className="w-full h-20 2xl:h-28 p-2 pl-3 pr-9 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none custom-scrollbar"
                                            />
                                            {/* Pulsante AI overlay */}
                                            <button
                                                type="button"
                                                onClick={generateDescription}
                                                disabled={isGeneratingDescription}
                                                className={`absolute bottom-4 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[#d793f2] to-[#FCC63D] ${isGeneratingDescription
                                                    ? 'opacity-100 cursor-auto'
                                                    : 'opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:scale-110 hover:cursor-pointer hover:shadow-[0px_0px_6px_3px_rgba(215,147,242,0.1)]'
                                                    }`}
                                            >
                                                {isGeneratingDescription ? (
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <img
                                                        src={aitext}
                                                        alt="AI Generate"
                                                        className="w-3 h-3 filter brightness-0 invert"
                                                    />
                                                )}
                                            </button>
                                        </div>

                                        <p className="text-right text-xs text-gray-500 mt-1 opacity-60">{formState.descrizioneChatbot.length}/200</p>
                                    </div>


                                    {/* Input per le ISTRUZIONI */}
                                    <div className="mb-4 w-[88%] relative ">
                                        <p className="w-[205.51px] h-[29px] text-[13px] font-medium text-left text-[#1d2125] ">Istruzioni</p>
                                        <div className="relative group">
                                            <textarea
                                                id="input-4"
                                                placeholder="Scrivi delle brevi istruzioni che il chatbot dovrà seguire durante il corso."
                                                className="w-full h-20 2xl:h-28 p-2 pl-3 pr-9 rounded-[10px] bg-white border border-[#bfbfbf]/[0.56] placeholder-[#A3A7AA] text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)] resize-none custom-scrollbar"
                                                value={formState.istruzioniChatbot}
                                                style={{ direction: "ltr" }}
                                                onChange={(e) => dispatch(updateForm({ istruzioniChatbot: e.target.value }))}
                                            />
                                            {/* Pulsante AI - Piccolo spazio laterale a destra */}
                                            <button
                                                type="button"
                                                onClick={generateInstructions}
                                                disabled={isGenerating}
                                                className={`absolute bottom-4 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[#d793f2] to-[#FCC63D] ${isGenerating
                                                    ? 'opacity-100 cursor-auto'
                                                    : 'opacity-0 group-hover:opacity-50 hover:!opacity-100 hover:scale-110 hover:cursor-pointer hover:shadow-[0px_0px_6px_3px_rgba(215,147,242,0.1)]'
                                                    }`}
                                            >
                                                {isGenerating ? (
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                ) : (
                                                    <img
                                                        src={aitext}
                                                        alt="AI Generate"
                                                        className="w-3 h-3 filter brightness-0 invert"
                                                    />
                                                )}
                                            </button>
                                        </div>
                                    </div>


                                    {/* Input per le DATE */}
                                    <div className="flex w-[88%] h-20 flex justify-between items-center ">

                                        {/* data di inizio */}
                                        <div className="min-w-[40%]  flex flex-col">
                                            <div className="flex items-center">
                                                <p className="w-full h-[28.77px] text-[13px] font-medium text-left text-[#1d2125] ">Data inizio corso</p>
                                                {!canEditStartDate() && (
                                                    <div className="relative ml-2 group">
                                                        <div className="w-3 h-3 rounded-full bg-[#6982AB] text-white text-xs flex items-center justify-center cursor-help opacity-60 hover:opacity-100 transition-opacity duration-200">
                                                            i
                                                        </div>
                                                        {/* Tooltip */}
                                                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#6982AB] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                                            Non modificabile: corso già iniziato
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#6982AB]"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="start-date"
                                                type="date"
                                                value={formState.dataInizio}
                                                min="2024-01-01"
                                                max="2100-12-31"
                                                disabled={!canEditStartDate()}
                                                onChange={(e) => dispatch(updateForm({ dataInizio: e.target.value }))}
                                                className={`w-full h-9 p-2 pl-3 rounded-[10px] bg-white ${!canEditStartDate()
                                                    ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    : errors.dataInizio
                                                        ? "border-red-500 bg-red-50"
                                                        : "border-[#bfbfbf]/[0.56]"
                                                    } border placeholder-[#A3A7AA] placeholder-opacity-51 text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
                                                title={!canEditStartDate() ? "Non è possibile modificare la data di inizio perché il corso è già iniziato o sta per iniziare" : ""}
                                            />
                                        </div>

                                        {/* data di fine */}
                                        <div className="min-w-[40%]  flex flex-col">
                                            <div className="flex items-center">
                                                <p className="w-full h-[28.77px] text-[13px] font-medium text-left text-[#1d2125] ">Data fine corso</p>
                                                {!canEditEndDate() && (
                                                    <div className="relative ml-2 group">
                                                        <div className="w-3 h-3 rounded-full bg-[#6982AB] text-white text-xs flex items-center justify-center cursor-help opacity-60 hover:opacity-100 transition-opacity duration-200">
                                                            i
                                                        </div>
                                                        {/* Tooltip */}
                                                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-[#6982AB] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                                            Non modificabile: corso già terminato
                                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#6982AB]"></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                id="end-date"
                                                type="date"
                                                value={formState.dataFine}
                                                min="2024-01-01"
                                                max="2100-12-31"
                                                disabled={!canEditEndDate()}
                                                onChange={(e) => {
                                                    dispatch(updateForm({ dataFine: e.target.value }));
                                                    setErrors((prev) => ({ ...prev, dataFine: false }));
                                                }}
                                                className={`w-full h-9 p-2 pl-3 rounded-[10px] bg-white ${!canEditEndDate()
                                                    ? "border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                                                    : errors.dataFine
                                                        ? "border-red-500 bg-red-50"
                                                        : "border-[#bfbfbf]/[0.56]"
                                                    } border placeholder-[#A3A7AA] placeholder-opacity-51 text-[13px] text-[#495057] shadow-[0px_0px_6.7px_4px_rgba(0,0,0,0.02)]`}
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
                                            Prima di iniziare la conversazione, lo studente selezionerà una delle quattro modalità di apprendimento VARK, che influenzerà il modo in cui l'assistente risponderà in quella specifica chat.
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
                                    <div className="flex justify-center items-center w-full mb-2 mt-3 px-4">
                                        <p className="text-[#495057] max-w-[85%] text-[17px] font-bold text-center break-words leading-tight">{formState.nomeChatbot}</p>
                                    </div>
                                )}

                                {/* Descrizione chatbot */}
                                {formState.descrizioneChatbot && (
                                    <div className="flex justify-center items-center w-full mb-2 px-4">
                                        <p className="text-[#495057] max-w-[85%] text-[13px] text-center break-words leading-relaxed">{formState.descrizioneChatbot}</p>
                                    </div>
                                )}

                                {/* Pulsanti suggerimenti VARK */}
                                <div className="w-full min-h-20 flex items-center justify-center gap-3 flex-wrap px-4 mt-3 mb-2">

                                    {/* Visivo */}
                                    <div className="w-[40%] min-w-[120px] h-12 relative flex justify-center items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                                        onClick={() => {
                                            console.log('Selected: Apprendimento Visivo');
                                            setSelectedVarkButton('visual');
                                        }}>
                                        <div className={`w-full h-full rounded-[15px] border-[2px] transition-all duration-200 flex justify-center items-center relative ${selectedVarkButton === 'visual'
                                            ? 'border-[#6982ab]/[0.15] bg-[#6982ab]/[0.08]'
                                            : 'border-[#6982ab]/[0.12] hover:border-[#6982ab]/[0.15] hover:bg-[#6982ab]/[0.02]'
                                            }`}>
                                            <img
                                                src={visivoIcon}
                                                alt="Visivo"
                                                className="w-4 mr-1 h-4"
                                            />
                                            <p className="text-left text-[#495057] text-[12px] font-medium flex items-center justify-center">
                                                Visivo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Uditivo */}
                                    <div className="w-[40%] min-w-[120px] h-12 relative flex justify-center items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                                        onClick={() => {
                                            console.log('Selected: Apprendimento Uditivo');
                                            setSelectedVarkButton('auditory');
                                        }}>
                                        <div className={`w-full h-full rounded-[15px] border-[2px] transition-all duration-200 flex justify-center items-center relative ${selectedVarkButton === 'auditory'
                                            ? 'border-[#6982ab]/[0.15] bg-[#6982ab]/[0.08]'
                                            : 'border-[#6982ab]/[0.12] hover:border-[#6982ab]/[0.15] hover:bg-[#6982ab]/[0.02]'
                                            }`}>
                                            <img
                                                src={auraleIcon}
                                                alt="Uditivo"
                                                className="w-5 mr-1 h-5"
                                            />
                                            <p className="text-left text-[#495057] text-[12px] font-medium flex items-center justify-center">
                                                Uditivo
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lettura/Scrittura */}
                                    <div className="w-[40%] min-w-[120px] h-12 relative flex justify-center items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                                        onClick={() => {
                                            console.log('Selected: Apprendimento Lettura/Scrittura');
                                            setSelectedVarkButton('reading');
                                        }}>
                                        <div className={`w-full h-full rounded-[15px] border-[2px] transition-all duration-200 flex justify-center items-center relative ${selectedVarkButton === 'reading'
                                            ? 'border-[#6982ab]/[0.15] bg-[#6982ab]/[0.08]'
                                            : 'border-[#6982ab]/[0.12] hover:border-[#6982ab]/[0.15] hover:bg-[#6982ab]/[0.02]'
                                            }`}>
                                            <img
                                                src={libroSuggerimento}
                                                alt="Lettura/Scrittura"
                                                className="w-3.5 mr-2 h-4"
                                            />
                                            <p className="text-left text-[#495057] text-[12px] font-medium flex items-center justify-center">
                                                Lettura/Scrittura
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cinestetico */}
                                    <div className="w-[40%] min-w-[120px] h-12 relative flex justify-center items-center cursor-pointer hover:scale-105 transition-transform duration-200"
                                        onClick={() => {
                                            console.log('Selected: Apprendimento Cinestetico');
                                            setSelectedVarkButton('kinesthetic');
                                        }}>
                                        <div className={`w-full h-full rounded-[15px] border-[2px] transition-all duration-200 flex justify-center items-center relative ${selectedVarkButton === 'kinesthetic'
                                            ? 'border-[#6982ab]/[0.15] bg-[#6982ab]/[0.08]'
                                            : 'border-[#6982ab]/[0.12] hover:border-[#6982ab]/[0.15] hover:bg-[#6982ab]/[0.02]'
                                            }`}>
                                            <img
                                                src={cinesteticoIcon}
                                                alt="Cinestetico"
                                                className="w-3.5 mr-2 h-5"
                                            />
                                            <p className="text-left text-[#495057] text-[12px] font-medium flex items-center justify-center">
                                                Cinestetico
                                            </p>
                                        </div>
                                    </div>

                                </div>                        {/* barra input messaggio */}
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


                    <div className="w-[100%] xl:w-[86%] h-30 mx-auto mt-2 flex justify-between items-center">

                        {/* Pulsante Sinistro - DINAMICO */}
                        {isEditMode && hasUnsavedChanges ? (
                            // CASO 1: MODALITÀ EDIT CON MODIFICHE - Mostra "Ripristina campi"
                            <button
                                type="button"
                                onClick={resetToOriginalValues}
                                className="w-39 h-11 cursor-pointer transform rounded-[10px] transition-transform duration-200 hover:scale-103 hover:bg-[#f2f3f7]"
                            >
                                <div
                                    className="w-full h-full rounded-[10px] border-[0.7px] border-[#1d2125]/20 flex justify-stretch"
                                    style={{ filter: "drop-shadow(0px 2px 8.5px rgba(0,0,0,0.05))" }}
                                >
                                    <div className="h-full w-14 flex items-center justify-center ml-1">
                                        <img src={restoreIcon} alt="" className="w-4" />
                                    </div>
                                    <div className="h-full flex items-center w-full">
                                        <p className="text-[13px] text-left text-[#1d2125]">
                                            Ripristina campi
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ) : !isEditMode && hasFieldsCompiled() ? (
                            // CASO 2: MODALITÀ CREATE CON CAMPI COMPILATI - Mostra "Esci e salva bozza"
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
                        ) : (
                            // CASO 3: MODALITÀ CREATE SENZA CAMPI O EDIT SENZA MODIFICHE - Mostra "Torna ai corsi"
                            <button
                                type="button"
                                onClick={goBackToCourses}
                                className="w-34 h-11 cursor-pointer transform rounded-[10px] transition-transform duration-200 hover:scale-103 hover:bg-[#f2f3f7]"
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
                                            Torna ai corsi
                                        </p>
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Pulsante Destro - STEP SUCCESSIVO */}
                        <button
                            type="button"
                            className={`${isEditMode && hasUnsavedChanges ? 'w-37' : 'w-35'} h-11 cursor-pointer transform transition-transform duration-200 ${isCheckingCourse ? 'opacity-50 cursor-not-allowed' : 'hover:scale-103'
                                }`}
                            onClick={handleSubmit}
                            disabled={isCheckingCourse}
                        >
                            <div
                                className="w-full h-full rounded-[10px] bg-[#fcc63d] flex justify-center items-center"
                                style={{ boxShadow: "0px 0px 8.5px 3px rgba(0,0,0,0.02)" }}
                            >
                                {isCheckingCourse ? (
                                    <div className="w-4 h-4 border-2 border-[#1d2125] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <div className="h-full flex items-center justify-end w-full">
                                            <p className="text-[13px] text-[#1d2125] flex items-center justify-center">
                                                {isEditMode && hasUnsavedChanges ? 'Salva e continua' : 'Step successivo'}
                                            </p>
                                        </div>
                                        <div className="h-full w-12 flex items-center justify-center">
                                            <img src={frecciaDestraButton} alt="" className="w-2" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </button>
                    </div>

                </>

            )
            }

        </div>

    )
}

export default Configurazione;