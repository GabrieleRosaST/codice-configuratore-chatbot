import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { rimuoviArgomento, aggiornaTitoloArgomento, aggiornaFileArgomento } from '../store/argomentiSlice';
import dragDrop from '../img/dragDrop.svg';
import caricaIcon from '../img/caricaIcon.svg';
import cestinoIcon from '../img/cestinoIcon.svg';
import cestinoIconRed from '../img/cestinoIconRed.svg';
import FileCaricato from './fileCaricato';
import '../index.css';
import fileStorage from '../utils/fileStorage'; // Importa fileStorage



function CardArgomento({ id, titolo, colore, file, giorno, editMode }) {

    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');



    // Calcola se l'argomento è già passato (solo in modalità edit)
    const oggi = new Date();
    const inizioOggi = new Date();
    inizioOggi.setHours(0, 0, 0, 0);

    // Converti il timestamp di 'giorno' in un oggetto Date
    const giornoDate = giorno ? new Date(giorno * 1000) : null;

    console.log("📅 Controllo se argomento è passato:", { titolo, giorno, giornoDate, oggi, inizioOggi, editMode });

    const isArgomentoPassato = editMode && giornoDate && giornoDate.getTime() <= inizioOggi.getTime();

    console.log("📅 Risultato controllo argomento passato:", { titolo, isArgomentoPassato });



    const handleDelete = () => {
        if (isArgomentoPassato) {
            console.warn('⚠️ Impossibile eliminare argomento già passato:', { titolo, giorno });
            return;
        }

        if (id) {
            dispatch(rimuoviArgomento(id));
        } else {
            console.error('ID non valido per l\'eliminazione');
        }
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        dispatch(aggiornaTitoloArgomento({ id, titolo: newTitle }));
    };

    const handleFileUpload = async (e) => {
        if (isArgomentoPassato) {
            console.warn('⚠️ Impossibile caricare file per argomento già passato:', { titolo, giorno });
            return;
        }

        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter((file) => file.type === 'application/pdf');
        const invalidFiles = selectedFiles.filter((file) => file.type !== 'application/pdf'); // File non validi

        if (invalidFiles.length > 0) {
            setErrorMessage('Puoi caricare solo file PDF!'); // Mostra il messaggio di errore
            setTimeout(() => setErrorMessage(''), 4000); // Rimuove il messaggio dopo 5 secondi
            return;
        }

        if (validFiles.length > 0) {
            const existingFileNames = new Set(file.map((fileObj) => fileObj.fileName));
            const newFiles = validFiles.filter((file) => !existingFileNames.has(file.name));


            if (newFiles.length > 0) {
                // Salva i file veri e propri nella memoria temporanea
                if (!fileStorage[id]) {
                    fileStorage[id] = [];
                }
                fileStorage[id].push(...newFiles);



                // Recupera i file esistenti dallo stato Redux
                const existingFiles = file || [];

                // Salva i metadati dei file in Redux
                const fileDetails = newFiles.map((file) => ({
                    fileName: file.name,
                }));


                // Combina i file esistenti con i nuovi file
                const updatedFiles = [...existingFiles, ...fileDetails];

                dispatch(aggiornaFileArgomento({ id: id, file: updatedFiles }));
            } else {
                setErrorMessage('Alcuni file sono già stati caricati!');
                setTimeout(() => setErrorMessage(''), 4000);
            }

        }

        // Resetta il valore del file input
        e.target.value = '';
    };


    const openFileSelector = () => {
        document.getElementById(`file-input-${id}`).click();
    };


    const handleDrop = async (event) => {
        event.preventDefault(); // Impedisce l'apertura del file in una nuova scheda
        const droppedFiles = Array.from(event.dataTransfer.files);
        const validFiles = droppedFiles.filter((file) => file.type === 'application/pdf');
        const invalidFiles = droppedFiles.filter((file) => file.type !== 'application/pdf');

        if (invalidFiles.length > 0) {
            setErrorMessage('Puoi caricare solo file PDF!');
            setTimeout(() => setErrorMessage(''), 4000);
            return;
        }

        if (validFiles.length > 0) {
            const existingFileNames = new Set(file.map((fileObj) => fileObj.fileName));
            const newFiles = validFiles.filter((file) => !existingFileNames.has(file.name));

            if (newFiles.length > 0) {
                // Salva i file veri e propri nella memoria temporanea
                if (!fileStorage[id]) {
                    fileStorage[id] = [];
                }
                fileStorage[id].push(...newFiles);


                // Recupera i file esistenti dallo stato Redux
                const existingFiles = file || [];

                // Salva i metadati dei file in Redux
                const fileDetails = newFiles.map((file) => ({
                    fileName: file.name,
                }));

                // Combina i file esistenti con i nuovi file
                const updatedFiles = [...existingFiles, ...fileDetails];

                dispatch(aggiornaFileArgomento({ id: id, file: updatedFiles }));
            } else {
                setErrorMessage('Alcuni file sono già stati caricati!');
                setTimeout(() => setErrorMessage(''), 4000);
            }
        }
    };





    return (
        <div className='w-85 2xl:w-96 '>

            <div
                className={`relative w-full rounded-[5px] border-[1px] border-[#DEDEDE] flex flex-col justify-start bg-[#F2F3F7] ${isArgomentoPassato ? 'opacity-50 cursor-default' : ''}`}
            >

                {/* Header della card */}
                <div className={`w-full h-13 bg-white border-b-[1px] border-[#DEDEDE] rounded-t-[5px] flex justify-between items-center ${isArgomentoPassato ? 'pointer-events-none' : ''}`}>
                    <div className="w-13 h-full flex items-center justify-center">
                        <div
                            className="w-6 h-8 absolute left-3 rounded"
                            style={{ backgroundColor: colore }}
                        ></div>
                    </div>

                    <div className="w-70 flex items-center justify-center shadow-none focus:shadow-none focus:outline-none focus:ring-0">
                        <input
                            type="text"
                            value={titolo}
                            placeholder="Titolo dell'argomento"
                            className="text-[13px] z-11 text-[#495057] text-center flex-grow bg-transparent focus:shadow-none focus:outline-none focus:ring-0 shadow-none inputTitolo"
                            title={titolo}
                            onChange={handleTitleChange}
                            disabled={isArgomentoPassato} // Disabilita l'input se l'argomento è passato
                        />
                    </div>

                    <button
                        className={`z-10 w-12 h-full flex items-center justify-center transform transition-transform duration-200 ${isArgomentoPassato ? 'opacity-65 cursor-default' : 'opacity-70 cursor-pointer hover:opacity-100 hover:scale-105'}`}
                        onClick={handleDelete}
                        onMouseEnter={() => !isArgomentoPassato && setIsHovered(true)}
                        onMouseLeave={() => !isArgomentoPassato && setIsHovered(false)}
                        disabled={isArgomentoPassato}
                    >
                        <img
                            src={isHovered ? cestinoIconRed : cestinoIcon}
                            alt="Elimina"
                            className="w-4 h-[23px] "
                        />
                    </button>
                </div>


                {/* Sfondo da cambiare */}
                <div
                    className="w-full h-73 2xl:h-75"
                >
                    {/* Area di caricamento file */}
                    <div
                        className="w-full h-54  flex items-center justify-center"
                        onDrop={(event) => {
                            event.preventDefault(); // Impedisce l'apertura del file in una nuova scheda
                            if (!isArgomentoPassato) {
                                handleDrop(event);
                            } else {
                                setErrorMessage('Non puoi caricare file per un argomento già passato!');
                                setTimeout(() => setErrorMessage(''), 4000); // Mostra il messaggio di errore per 4 secondi
                            }
                        }}
                        onDragOver={(e) => e.preventDefault()} // Necessario per consentire il drop
                    >
                        {errorMessage && file.length > 0 && (
                            <div className="absolute h-14 2xl:h-16 w-full bottom-17 bg-[#F2F3F7] flex items-center justify-center z-20">
                                <p className="text-[#D22525]  text-[13px]">{errorMessage}</p>
                            </div>
                        )}

                        <div className="w-full h-full flex justify-start">
                            <div className="w-full h-full max-h-[1700px] overflow-y-auto p-4 mt-1  scroll-container">
                                <div className="w-full flex flex-col items-center gap-2">
                                    {file.length === 0 ? (
                                        <div className="w-full h-49 flex flex-col justify-center gap-4 opacity-55">
                                            <div className="w-full flex justify-center ">
                                                <img src={dragDrop} className="w-14 h-12" />
                                            </div>
                                            <div className="w-full flex flex-col justify-center items-center">
                                                <p className="text-[13px] text-gray-600">
                                                    Carica qui i materiali di riferimento
                                                </p>
                                                {errorMessage && (
                                                    <p className="text-[#D22525] mt-1 text-[13px]" >
                                                        {errorMessage}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        file.map((fileObj, index) => (
                                            <FileCaricato key={index} id={id} files={file} fileCaricato={fileObj} />
                                        ))



                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pulsante Carica */}
                    <div className="w-full h-21 2xl:h-23 absolute bottom-0 left-0 flex justify-center items-center">
                        <div
                            className={`w-22 h-9 pr-1.5 flex items-center justify-center bg-white border border-gray-300 rounded-[25px] transform transition-transform duration-200 ${isArgomentoPassato ? 'opacity-50 cursor-default' : 'cursor-pointer hover:scale-103'}`}
                            style={{ boxShadow: '0px 2px 8.5px 3px rgba(0,0,0,0.03)' }}
                            onClick={!isArgomentoPassato ? openFileSelector : undefined}
                            disabled={isArgomentoPassato} // Disabilita il pulsante Carica se l'argomento è passato
                        >
                            <div className="h-full w-7 flex items-center justify-center">
                                <img
                                    src={caricaIcon}
                                    alt="Drag and Drop"
                                    className="w-3.5 h-[19px]"
                                />
                            </div>
                            <p className="text-[13px] h-full flex items-center text-center text-gray-800">
                                Carica
                            </p>
                        </div>
                        <input
                            id={`file-input-${id}`}
                            type="file"
                            multiple
                            accept="*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isArgomentoPassato} // Disabilita l'input file se l'argomento è passato
                        />

                        {/* Tooltip informativo */}
                        {isArgomentoPassato && (
                            <div className="absolute bottom-2 right-2 group">
                                <div className="w-4 h-4 rounded-full bg-[#6982AB] text-white text-xs flex items-center justify-center cursor-help opacity-90 hover:opacity-100 transition-opacity duration-200">
                                    i
                                </div>
                                {/* Tooltip */}
                                <div className="absolute bottom-4 right-3 bg-[#6982AB] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                                    Non modificabile: argomento
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-[#6982AB]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
}

export default CardArgomento;