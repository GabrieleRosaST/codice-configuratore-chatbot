import React from "react";
import { useDrop } from 'react-dnd';
import Argomento from "./argomentoDrag";


export default function Giorno({ giorno, isInCorso, isAltroMese, spostaArgomento }) {
    const [{ isOver }, drop] = useDrop({
        accept: 'ARGOMENTO',
        canDrop: () => {
            return isInCorso;
        },
        drop: (item) => {
            spostaArgomento(item.argomento, item.giornoOrigine, giorno);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(), // Rileva se l'elemento è sopra il giorno
        }),
    });

    // Determina la classe CSS in base a isInCorso, isAltroMese e isOver
    const giornoClasse = isInCorso
        ? isOver
            ? isAltroMese
                ? "bg-[#FAF4DB] opacity-64" // Colore più scuro per giorni del corso di altri mesi quando isOver
                : "bg-[#FAF4DB] opacity-98" // Colore più scuro per giorni del corso del mese corrente quando isOver
            : isAltroMese
                ? "bg-[#FFFAE6] opacity-75" // Giallo per giorni del corso di altri mesi
                : "bg-[#FFFAE6]" // Giallo per giorni del mese corrente e del corso
        : giorno.tipo === "corrente"
            ? "bg-[#FFFFFF]" // Bianco per giorni del mese corrente non nel corso
            : "bg-[#F9FAFC]"; // Grigio chiaro per giorni di altri mesi non nel corso

    return (
        <div
            ref={drop}
            className={`text-center h-25 2xl:h-25 p-1 ${giornoClasse} transition duration-10  `}
        >
            <p className={`text-[10px] mt-[3px] text-[#1D2125] ${!isInCorso && giorno.tipo !== "corrente" ? "opacity-30" : "opacity-90"}`}>
                {giorno.giorno}
            </p>
            <div
                className="max-h-[68px] overflow-y-auto overflow-x-hidden scroll-container"
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