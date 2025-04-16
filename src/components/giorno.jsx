import React from "react";
import { useDrop } from 'react-dnd';
import Argomento from "./argomentoDrag";


export default function Giorno({ giorno, dataInizio, dataFine, isInCorso, isAltroMese, spostaArgomento }) {
    const [, drop] = useDrop({
        accept: 'ARGOMENTO', // Tipo di elemento accettato
        canDrop: () => {
            // Permetti il drop solo se il giorno è "corrente", ha meno di 2 argomenti e fa parte del corso
            const dataGiorno = new Date(giorno.anno, giorno.mese, giorno.giorno);
            dataGiorno.setHours(0, 0, 0, 0);

            const dataInizioCorso = new Date(dataInizio); // Passa `dataInizio` come prop
            const dataFineCorso = new Date(dataFine); // Passa `dataFine` come prop
            dataInizioCorso.setHours(0, 0, 0, 0);
            dataFineCorso.setHours(0, 0, 0, 0);

            const giornoSettimana = dataGiorno.getDay();

            return (


                dataGiorno >= dataInizioCorso &&
                dataGiorno <= dataFineCorso
            );
        },
        drop: (item) => {
            spostaArgomento(item.argomento, item.giornoOrigine, giorno);
        },
    });

    // Determina la classe CSS in base a isInCorso e isAltroMese
    const giornoClasse = isInCorso
        ? isAltroMese
            ? "bg-[#FFFAE6] opacity-75 " // Giallo per giorni del corso di altri mesi
            : "bg-[#FFFAE6]" // Giallo per giorni del mese corrente e del corso
        : giorno.tipo === "corrente"
            ? "bg-[#FFFFFF]" // Bianco per giorni del mese corrente non nel corso
            : "bg-[#F9FAFC]"; // Grigio chiaro per giorni di altri mesi non nel corso

    return (
        <div
            ref={drop} // Collegamento al drop
            className={`text-center h-[120px] p-1 ${giornoClasse}`}
        >
            <p className={`text-[14px] mt-[3px] text-[#1D2125] ${giorno.tipo !== "corrente" ? "opacity-30" : ""}`}>
                {giorno.giorno}
            </p>
            <div
                className="max-h-[80px] overflow-y-auto overflow-x-hidden scroll-container"
                style={{
                    padding: 0,
                    direction: "ltr",
                }}
            >
                {giorno.argomenti.map((argomento) => (

                    < Argomento key={argomento.id} argomento={argomento} giornoOrigine={giorno} />
                ))}
            </div>
        </div>
    );
}