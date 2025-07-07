
export async function uploadFilesAndGetData(filesToUpload, generatedJsonData) {
    // 1. Genera un itemid (draft area) per questa operazione.
    const itemid = Math.floor(Math.random() * 1e10); // oppure prendi dal backend (Moodle filemanager di solito lo genera lato PHP)
    const repo_id = 5; // TIPICO id del repository "Upload", verifica sul tuo sito Moodle!
    const sesskey = window.M.cfg.sesskey;

    let uploadedFiles = [];

    // Carica i file UNO ALLA VOLTA nella draft area (itemid sempre lo stesso)
    for (let i = 0; i < filesToUpload.length; i++) {
        const { file, argomentoId } = filesToUpload[i];
        const formData = new FormData();
        formData.append('repo_upload_file', file);
        formData.append('itemid', itemid);
        formData.append('repo_id', repo_id);
        formData.append('sesskey', sesskey);

        console.log('Uploading with params:', {
            fileName: file.name,
            itemid,
            repo_id,
            sesskey,
            formKeys: Array.from(formData.keys())
        });

        const response = await fetch(`${window.M.cfg.wwwroot}/repository/repository_ajax.php?action=upload`, {
            method: 'POST',
            body: formData,
            credentials: 'same-origin'
        });

        if (!response.ok) throw new Error('Upload file fallito!');
        const data = await response.json();

        console.log("Risposta Moodle upload:", data);
        console.log("dati passati: ",generatedJsonData);

        if (!data || !data['file']) throw new Error('Risposta upload errata');

        uploadedFiles.push({
            itemid: itemid, // tutti i file hanno lo stesso itemid!
            filename: data.file,
            filepath: '/',
            mimetype: data.file.mimetype || 'application/pdf',
            argomento: argomentoId,
        });
    }

    return {
        files: uploadedFiles
    };
}