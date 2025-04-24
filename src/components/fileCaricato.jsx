import React from 'react';
import { useDispatch } from 'react-redux';
import iconPDF from '../img/iconPDF.svg';
import eliminaFile from '../img/eliminaFile.svg';
import { aggiornaArgomento } from '../store/argomentiSlice';

function FileCaricato({ titolo, id, file }) {
    const dispatch = useDispatch();

    const handleDeleteFile = () => {
        const updatedFiles = file.filter(f => f !== titolo); // Rimuove il file selezionato
        dispatch(aggiornaArgomento({ id, file: updatedFiles })); // Aggiorna la lista dei file nello store Redux
    };

    return (
        <div className="w-full h-[52px] relative flex pl-1 ">

            <div
                className="w-[393px] h-full bg-[#F2F3F7] rounded-[10px] border-[1.2px] border-black/[0.12] flex justify-start">

                <div className=" w-[50px] h-full flex justify-center items-center">
                    <img src={iconPDF} className="w-7 h-7" />
                </div>

                <p className="w-[320px] h-full pl-1 text-[18px] text-left text-[#495057] flex items-center truncate">
                    {titolo}
                </p>

            </div>

            <div className="w-[30px]  h-full absolute right-0 flex justify-center items-center">
                <button
                    className="w-[25px] h-[30px] z-11 ml-[2px] cursor-pointer text-red-500 hover:text-red-700 flex justify-center items-center transform transition-transform duration-200 opacity-80 hover:scale-105 hover:opacity-100"
                    onClick={handleDeleteFile}
                >
                    <img src={eliminaFile} className="z-10 " />
                </button>
            </div>

        </div>
    );
}

export default FileCaricato;