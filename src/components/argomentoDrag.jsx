import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import dragIcon from '../img/dragIcon.svg';

export default function Argomento({ argomento, giornoOrigine }) {

    const [isHovered, setIsHovered] = useState(false);

    const [{ isDragging }, drag] = useDrag(() => ({

        type: 'ARGOMENTO',
        item: { argomento, giornoOrigine },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),

    }));




    return (
        <div
            ref={drag}
            className="mt-[7px] mb-1 mx-auto w-[90%] h-6 text-[#1D2125]/83 rounded-[7px] bg-white relative cursor-pointer transition-transform duration-350 ease-in-out hover:scale-102"
            style={{
                border: `1px solid ${argomento.colore}`,
                boxShadow: '0px 0px 8px rgba(0,0,0,0.06)',
                opacity: isDragging ? 0.5 : 1,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="w-6 h-full absolute left-0 rounded-l flex items-center justify-center"
                style={{ backgroundColor: argomento.colore }}
            >
                {isHovered && (
                    <img src={dragIcon} className="w-6 h-6 p-[3px] opacity-80" />
                )}
            </div>

            <div className="w-[full] pr-1 h-full flex items-center overflow-hidden">
                <p
                    className="ml-[35px] text-[11px] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ maxWidth: 'calc(100% - 35px)' }}
                    title={argomento.titolo}
                >
                    {argomento.titolo}
                </p>
            </div>
        </div>
    );
}