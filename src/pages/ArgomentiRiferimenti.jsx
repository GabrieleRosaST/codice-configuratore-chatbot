import React from 'react';
import domandaIcon from '../img/domandaIcon.svg'

function ArgomentiRiferimenti() {
    return (

        <div className="w-full bg-red-200 flex-justify-center ">
            <div className="w-[1580px] mx-auto h-15 flex justify-center items-center relative bg-red-200">


                <div
                    className="w-[91px] h-9 absolute left-4 x rounded-[25px] bg-white border border-[#4a4d50]/[0.29] flex items-center justify-center" style={{ boxShadow: "0px 2px 8.5px 3px rgba(0,0,0,0.05)" }}>
                    <img src={domandaIcon} alt="Icona domanda" className="w-5 h-5 mr-2" />
                    <p className="text-lg text-center text-[#4f5255]">Aiuto</p>
                </div>



                <p className="w-[1077px] text-2xl font-bold text-center text-[#21225f] ">
                    Aggiungi gli argomenti e carica i materiali di riferimento
                </p>
            </div>

            <div className="mx-auto w-[1580px] h-[1040px] bg-red-300">

            </div>
        </div>

    )
}

export default ArgomentiRiferimenti