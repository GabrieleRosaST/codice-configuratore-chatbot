import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { rimuoviArgomento, aggiornaArgomento } from '../store/argomentiSlice';
import dragDrop from '../img/dragDrop.svg';
import caricaIcon from '../img/caricaIcon.svg';
import cestinoIcon from '../img/cestinoIcon.svg';
import cestinoIconRed from '../img/cestinoIconRed.svg';
import FileCaricato from './fileCaricato';
import '../index.css';

function CardArgomento({ id, titolo, colore, file }) {
    const dispatch = useDispatch();
    const [isHovered, setIsHovered] = useState(false);

    const handleDelete = () => {
        if (id) {
            dispatch(rimuoviArgomento(id));
        } else {
            console.error('ID non valido per l’eliminazione');
        }
    };

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        dispatch(aggiornaArgomento({ id, titolo: newTitle }));
    };

    const handleFileUpload = (e) => {
        const selectedFiles = Array.from(e.target.files).slice(0, 5);
        const fileNames = selectedFiles.map(file => file.name);
        dispatch(aggiornaArgomento({ id, file: [...file, ...fileNames] }));
    };

    const openFileSelector = () => {
        document.getElementById(`file-input-${id}`).click();
    };




    const handleDrop = (event) => {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files);
        const fileNames = files.map((file) => file.name);
        if (fileNames.length > 0) {
            dispatch(aggiornaArgomento({ id, file: [...file, ...fileNames] }));
        } else {
            console.error('Nessun file rilevato durante il drop');
        }
    };



    return (
        <div className="relative w-[460px] h-[417px] rounded-[5px] border border-gray-300 flex flex-col justify-start bg-[#F2F3F7]">



            {/* Header della card */}
            <div className="w-full h-[59px] bg-white border-b-[1px] border-gray-300 rounded-t-[5px] flex justify-between items-center">
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
                    className="z-10 w-12 h-full cursor-pointer flex items-center justify-center transform transition-transform duration-200 hover:scale-108"
                    onClick={handleDelete}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={isHovered ? cestinoIconRed : cestinoIcon}
                        alt="Elimina"
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
                    <div className="w-full h-full flex justify-start">
                        <div className="w-full h-[265px] max-h-[700px] overflow-y-auto p-4 mt-3  scroll-container">
                            <div className="w-full flex flex-col items-center gap-3">
                                {file.length === 0 ? (
                                    <div className="w-full h-[240px] flex flex-col justify-center gap-4 opacity-60">
                                        <div className="w-full flex justify-center">
                                            <img src={dragDrop} alt="" />
                                        </div>
                                        <div className="w-full flex justify-center items-center">
                                            <p className="text-xl text-gray-600">
                                                Carica qui i materiali di riferimento
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    file.map((fileName, index) => (
                                        <FileCaricato key={index} titolo={fileName} id={id} file={file} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pulsante Carica */}
                <div className="w-full h-21 absolute bottom-0 left-0 flex justify-center items-center">
                    <div
                        className="w-[130px] h-[48px] pr-2 flex items-center justify-center bg-white border border-gray-300 rounded-[25px] cursor-pointer transform transition-transform duration-200 hover:scale-103"
                        style={{ boxShadow: '0px 2px 8.5px 3px rgba(0,0,0,0.03)' }}
                        onClick={openFileSelector}
                    >
                        <div className="h-full w-[40px] flex items-center justify-center">
                            <img
                                src={caricaIcon}
                                alt="Drag and Drop"
                                className="w-[50px] h-[20px]"
                            />
                        </div>
                        <p className="text-[19px] h-full flex items-center text-center text-gray-800">
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