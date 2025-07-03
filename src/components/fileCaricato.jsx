import React from 'react';
import { useDispatch } from 'react-redux';
import iconPDF from '../img/iconPDF.svg';
import eliminaFile from '../img/eliminaFile.svg';
import { aggiornaFileArgomento } from '../store/argomentiSlice';
import fileStorage from '../utils/fileStorage.js'; // Importa l'oggetto fileStorage


function FileCaricato({ fileCaricato, id, files }) {
    const dispatch = useDispatch();


    const handleDeleteFile = () => {
        // Rimuovi il file dalla memoria temporanea
        if (fileStorage[id]) {
            fileStorage[id] = fileStorage[id].filter(
                (file) => file.name !== fileCaricato.fileName
            );
        }

        const updatedFiles = files.filter(f => f.fileName !== fileCaricato.fileName); // Confronta il nome del file
        dispatch(aggiornaFileArgomento({ id, file: updatedFiles })); // Aggiorna la lista dei file nello store Redux
    };

    return (
        <div className="w-full h-11 relative flex ">

            <div
                className="w-71 2xl:w-81 h-full bg-[#F2F3F7] rounded-[10px] border-[1.2px] border-black/[0.12] flex justify-start">

                <div className=" w-9 ml-1  h-full flex justify-center items-center">
                    <img src={iconPDF} className="w-4 2xl:w-4.5 " />
                </div>

                <p className="w-58 2xl:w-66 h-full pl-1 text-[13px] text-left text-[#495057] flex items-center truncate">
                    {fileCaricato.fileName}
                </p>

            </div>

            <div className="w-7 h-full absolute right-0 flex justify-end items-center pr-1.5 2xl:pr-2">
                <button
                    className="w-2.5 z-11 cursor-pointer text-red-500 hover:text-red-700 flex justify-start items-center transform transition-transform duration-200 opacity-70 hover:scale-108 hover:opacity-100"
                    onClick={handleDeleteFile}
                >
                    <img src={eliminaFile} className="z-10 " />
                </button>
            </div>

        </div>
    );
}

export default FileCaricato;