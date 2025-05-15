import { useSelector } from 'react-redux';


export function useGenerateJson() {
    const formData = useSelector((state) => state.form);
    const argomentiCorso = useSelector((state) => state.argomenti);
    const calendario = useSelector((state) => state.calendario);



    const generateJson = () => {
        const datiFinali = {
            DatiIniziali: {
                nomeChatbot: formData.nomeChatbot,
                corsoChatbot: formData.corsoChatbot,
                descrizioneChatbot: formData.descrizioneChatbot,
                istruzioniChatbot: formData.istruzioniChatbot,
                dataInizio: formData.dataInizio,
                dataFine: formData.dataFine,
            },
            argomenti: argomentiCorso.argomenti.map((argomento) => {

                const giorniAssociati = calendario.giorniCorso
                    .filter((giorno) => giorno.argomenti.some((arg) => arg.id === argomento.id)) // Usa il titolo per trovare l'argomento
                    .map((giorno) => {
                        const { giorno: day, mese: month, anno: year } = giorno;
                        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    });

                return {
                    titolo: argomento.titolo,
                    materiali: argomento.file,
                    giorno: giorniAssociati,
                };
            }),
        };

        return JSON.stringify(datiFinali, null, 2);
    };

    return generateJson;
}