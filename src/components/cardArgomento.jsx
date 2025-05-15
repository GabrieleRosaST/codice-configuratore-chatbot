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



function CardArgomento({ id, titolo, colore, file }) {
    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');


    const handleDelete = () => {
        if (id) {
            dispatch(rimuoviArgomento(id));
        } else {
            console.error('ID non valido per l’eliminazione');
        }
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        dispatch(aggiornaTitoloArgomento({ id, titolo: newTitle }));
    };

    const handleFileUpload = async (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter((file) => file.type === 'application/pdf'); // Filtra solo i PDF
        const invalidFiles = selectedFiles.filter((file) => file.type !== 'application/pdf'); // File non validi

        if (invalidFiles.length > 0) {
            setErrorMessage('Puoi caricare solo file PDF!'); // Mostra il messaggio di errore
            setTimeout(() => setErrorMessage(''), 4000); // Rimuove il messaggio dopo 5 secondi
            return;
        }

        if (validFiles.length > 0) {
            const existingFileNames = new Set(file.map((fileObj) => fileObj.fileName));

            // Filtra i nuovi file
            const newFiles = validFiles.filter((file) => !existingFileNames.has(file.name));


            if (newFiles.length > 0) {
                // Salva i file veri e propri nella memoria temporanea
                if (!fileStorage[id]) {
                    fileStorage[id] = [];
                }
                fileStorage[id].push(...newFiles);

                console.log('fileStorage:', fileStorage);


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
        event.preventDefault();
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

                console.log('fileStorage:', fileStorage);

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
        <div className="relative w-[460px] h-[417px] rounded-[5px] border-[1px] border-[#DEDEDE] flex flex-col justify-start bg-[#F2F3F7]">



            {/* Header della card */}
            <div className="w-full h-[59px] bg-white border-b-[1px] border-[#DEDEDE] rounded-t-[5px] flex justify-between items-center">
                <div className="w-13 h-full flex items-center justify-center">
                    <div
                        className="w-7 h-[39px] absolute left-3 rounded"
                        style={{ backgroundColor: colore }}
                    ></div>
                </div>

                <div className="w-70 flex items-center justify-center">
                    <input
                        type="text"
                        value={titolo}
                        placeholder="Titolo dell'argomento"
                        className="text-[18px] z-11 text-[#495057] text-center flex-grow bg-transparent border-none focus:outline-none focus:shadow-none"
                        onChange={handleTitleChange}
                    />
                </div>

                <button
                    className="z-10 w-12 h-full cursor-pointer flex opacity-70 hover:opacity-100 items-center justify-center transform transition-transform duration-200 hover:scale-105"
                    onClick={handleDelete}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={isHovered ? cestinoIconRed : cestinoIcon}
                        alt="Elimina"
                        className="w-[22px] h-[23px] "
                    />
                </button>
            </div>


            {/* Sfondo da cambiare */}
            <div
                className="w-full h-[358px]"
            >
                {/* Area di caricamento file */}
                <div
                    className="w-full h-[280px]  flex items-center justify-center"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()} // Necessario per consentire il drop

                >
                    {errorMessage && file.length > 0 && (
                        <div className="absolute h-18 w-full bottom-18 bg-[#F2F3F7] flex items-center justify-center z-20">
                            <p className="text-[#D22525]">{errorMessage}</p>
                        </div>
                    )}

                    <div className="w-full h-full flex justify-start">
                        <div className="w-full h-[265px] max-h-[700px] overflow-y-auto p-4 mt-3  scroll-container">
                            <div className="w-full flex flex-col items-center gap-3">
                                {file.length === 0 ? (
                                    <div className="w-full h-[240px] flex flex-col justify-center gap-4 opacity-55">
                                        <div className="w-full flex justify-center">
                                            <img src={dragDrop} className="w-[60px] h-[60px]" />
                                        </div>
                                        <div className="w-full flex flex-col justify-center items-center">
                                            <p className="text-[18px] text-gray-600">
                                                Carica qui i materiali di riferimento
                                            </p>
                                            {errorMessage && (
                                                <p className="text-[#D22525] mt-1">
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
                <div className="w-full h-21 absolute bottom-0 left-0 flex justify-center items-center">
                    <div
                        className="w-[117px] h-[45px] pr-2 flex items-center justify-center bg-white border border-gray-300 rounded-[25px] cursor-pointer transform transition-transform duration-200 hover:scale-103"
                        style={{ boxShadow: '0px 2px 8.5px 3px rgba(0,0,0,0.03)' }}
                        onClick={openFileSelector}
                    >
                        <div className="h-full w-[40px] flex items-center justify-center">
                            <img
                                src={caricaIcon}
                                alt="Drag and Drop"
                                className="w-[47px] h-[19px]"
                            />
                        </div>
                        <p className="text-[18px] h-full flex items-center text-center text-gray-800">
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
                    />
                </div>
            </div>
        </div>
    );
}

export default CardArgomento;