import React from 'react';

function Riepilogo() {
    // Recupera i dati dal localStorage
    const jsonData = localStorage.getItem('riepilogoDati');
    const dati = JSON.parse(jsonData); // Converte la stringa JSON in un oggetto

    return (
        <div>
            <h1>Riepilogo Configurazione</h1>
            <pre className="text-black p-4 rounded border">{JSON.stringify(dati, null, 2)}</pre>
        </div>
    );
}

export default Riepilogo;