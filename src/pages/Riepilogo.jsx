import React, { useEffect, useState } from 'react';

function Riepilogo() {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Effettua una richiesta al backend per recuperare i file salvati
        fetch('http://localhost/progetto-1/backend/api/index.php')
            .then((response) => {
                if (!response.success) {
                    throw new Error('Errore durante il recupero dei file');
                }
                return response.json();
            })
            .then((data) => {
                if (data.files) {
                    setFiles(data.files); // Imposta i file ricevuti
                }
            })
            .catch((error) => {
                console.error('Errore:', error);
            });
    }, []);

    return (
        <div>
            <h1>Riepilogo Configurazione</h1>
            <h2>File ricevuti:</h2>
            <ul>
                {files.length > 0 ? (
                    files.map((file, index) => (
                        <li key={index}>
                            <a
                                href={`http://localhost/progetto-1/backend/uploads/${file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {file}
                            </a>
                        </li>
                    ))
                ) : (
                    <p>Nessun file ricevuto.</p>
                )}
            </ul>
        </div>
    );
}

export default Riepilogo;