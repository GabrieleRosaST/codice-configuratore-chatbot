import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import dragIcon from '../img/dragIcon.svg';
import frecciaIcon from '../img/freccia.svg';
import { useDispatch } from 'react-redux';
import { spostaArgomento } from '../store/calendarioSlice';
import timestampUtils from '../utils/timestampUtils';
import { aggiornaGiornoArgomento } from '../store/argomentiSlice';
import { aggiornaSelezionato } from '../store/calendarioSlice';

export default function Argomento({ argomento, giornoOrigine, isPast }) {

    const dispatch = useDispatch();

    const [isHovered, setIsHovered] = useState(false);
    const [isArrowHovered, setIsArrowHovered] = useState(false);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'ARGOMENTO',
        item: { argomento, giornoOrigine },
        canDrag: !isPast, // Disabilita il drag se il giorno è passato
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));



    function isLastDayOfMonthAndSunday(dateObj) {

        console.log("Checking date:", dateObj);

        const date = new Date(dateObj.anno, dateObj.mese, dateObj.giorno);
        const lastDay = new Date(dateObj.anno, dateObj.mese + 1, 0);

        console.log("Date:", date, "Last Day:", lastDay);

        return (
            date.getDate() === lastDay.getDate() &&
            date.getDay() === 0 // 0 = Domenica
        );
    }


    const handleArrowClick = () => {
        const nextMonth = giornoOrigine.mese === 11 ? 0 : giornoOrigine.mese + 1; // 0-based
        const nextYear = giornoOrigine.mese === 11 ? giornoOrigine.anno + 1 : giornoOrigine.anno;
        const giornoDestinazione = {
            giorno: 1,
            mese: nextMonth,
            anno: nextYear
        };
        console.log('Spostamento argomento al primo giorno del mese successivo:', { argomento, giornoOrigine, giornoDestinazione });
        dispatch(spostaArgomento({ argomento, giornoOrigine, giornoDestinazione }));

        const timestampDestinazione = timestampUtils.componentsToUnix(
            giornoDestinazione.anno,
            giornoDestinazione.mese,
            giornoDestinazione.giorno
        );

        console.log("Argomento spostato FRECCIA - Debug timestamp:", {
            giorno_destinazione: giornoDestinazione,
            timestamp_generato: timestampDestinazione,
            data_converted_back: timestampUtils.unixToJsDate(timestampDestinazione).toDateString()
        });

        // Dispatch per aggiornare il giorno nell'argomento
        dispatch(aggiornaGiornoArgomento({
            id: argomento.id,
            giorno: timestampDestinazione
        }));

        // Dispatch per aggiornare l'argomento selezionato nel calendario
        dispatch(aggiornaSelezionato({
            mese: giornoDestinazione.mese,
            anno: giornoDestinazione.anno
        }));
    };


    function isFirstDayOfMonthAndMonday(dateObj) {
        const date = new Date(dateObj.anno, dateObj.mese, dateObj.giorno);
        return date.getDate() === 1 && date.getDay() === 1; // 1 = Monday
    }

    const handleArrowBackClick = () => {
        // Calcola mese e anno precedente
        const prevMonth = giornoOrigine.mese === 0 ? 11 : giornoOrigine.mese - 1;
        const prevYear = giornoOrigine.mese === 0 ? giornoOrigine.anno - 1 : giornoOrigine.anno;
        // Trova ultimo giorno del mese precedente
        const lastDayPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        const giornoDestinazione = {
            giorno: lastDayPrevMonth,
            mese: prevMonth,
            anno: prevYear
        };
        dispatch(spostaArgomento({ argomento, giornoOrigine, giornoDestinazione }));

        const timestampDestinazione = timestampUtils.componentsToUnix(
            giornoDestinazione.anno,
            giornoDestinazione.mese,
            giornoDestinazione.giorno
        );

        dispatch(aggiornaGiornoArgomento({
            id: argomento.id,
            giorno: timestampDestinazione
        }));

        dispatch(aggiornaSelezionato({
            mese: giornoDestinazione.mese,
            anno: giornoDestinazione.anno
        }));
    };
    return (
        <div
            ref={!isPast ? drag : null} // Applica il drag solo se il giorno non è passato
            className={`mt-[7px] mb-1 mx-auto w-[90%] h-6 text-[#1D2125]/83 rounded-[7px] bg-white relative transition-transform duration-350 ease-in-out ${isPast
                ? 'cursor-not-allowed' // Cursor non permesso per giorni passati
                : 'cursor-pointer hover:scale-102' // Cursor pointer e hover per giorni attivi
                }`}
            style={{
                border: `1px solid ${argomento.colore}`,
                boxShadow: '0px 0px 8px rgba(0,0,0,0.06)',
                opacity: isDragging ? 0.5 : 1,
            }}
            onMouseEnter={() => !isPast && setIsHovered(true)} // Hover solo se non è passato
            onMouseLeave={() => !isPast && setIsHovered(false)} // Hover solo se non è passato
        >
            <div
                className="w-6 h-full absolute left-0 rounded-l flex items-center justify-center"
                style={{ backgroundColor: argomento.colore }}
            >
                {!isPast && ( // Mostra l'icona drag solo se non è un giorno passato
                    <img src={dragIcon} className={`w-6 h-6 p-[3px] ${isHovered ? "opacity-80" : "opacity-20"}`} />
                )}
            </div>

            <div className="w-[full] pr-1 h-full flex items-center overflow-hidden z-index-3">
                <p
                    className="ml-[35px] text-[11px] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: 'calc(100% - 35px)' }}
                    title={argomento.titolo}
                >
                    {argomento.titolo}

                </p>
            </div>

            {isHovered && (isLastDayOfMonthAndSunday(giornoOrigine) || isFirstDayOfMonthAndMonday(giornoOrigine)) && (
                <div
                    className="w-6 h-full absolute right-0 top-0 rounded-r flex items-center justify-center z-index-4"
                    style={{ backgroundColor: argomento.colore }}
                    onMouseEnter={() => setIsArrowHovered(true)}
                    onMouseLeave={() => setIsArrowHovered(false)}
                    onClick={isFirstDayOfMonthAndMonday(giornoOrigine) ? handleArrowBackClick : handleArrowClick}
                >
                    <img src={frecciaIcon} alt="Freccia" className={`w-3 h-3 inline ${isArrowHovered ? "opacity-95" : "opacity-60"} ${isFirstDayOfMonthAndMonday(giornoOrigine) ? "rotate-180" : ""}`} />
                </div>
            )}
        </div>
    );
}