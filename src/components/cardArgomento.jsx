import React from 'react';

function CardArgomento({ titolo, colore, file }) {
    return (
        <div
            className="w-[300px] h-[200px] rounded-lg shadow-md p-4"
            style={{ backgroundColor: colore || '#ffffff' }}
        >
            <h3 className="text-lg font-bold text-gray-800">
                {titolo || 'Titolo Placeholder'}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
                {file && file.length > 0
                    ? `${file.length} file caricati`
                    : 'Nessun file caricato'}
            </p>
        </div>
    );
}

export default CardArgomento;