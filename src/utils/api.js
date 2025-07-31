export async function uploadFilesAndGetData(filesToUpload, generatedJsonData, moodleConfig) {
    const repo_id = 5; // repository Upload
    const sesskey = moodleConfig?.sesskey;
    const wwwroot = moodleConfig?.wwwroot;

    const uploadedFiles = [];

    if (!sesskey || !wwwroot) {
        throw new Error('Moodle config mancante!');
    }

    // 1 Raggruppa file per argomento
    const filesByArgomento = {};
    for (const { file, argomentoId, titoloArgomento } of filesToUpload) {
        const key = `${argomentoId}||${titoloArgomento}`;
        if (!filesByArgomento[key]) {
            filesByArgomento[key] = [];
        }
        filesByArgomento[key].push(file);
    }

    // 2 Per ogni argomento crea un itemid separato e carica i file
    for (const key of Object.keys(filesByArgomento)) {
        const [argomentoIdStr, titoloArgomento] = key.split('||');
        const argomentoId = parseInt(argomentoIdStr, 10);

        const itemid = Math.floor(Math.random() * 1e10);

        for (const file of filesByArgomento[key]) {
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

            const response = await fetch(
                `${wwwroot}/repository/repository_ajax.php?action=upload`,
                {
                    method: 'POST',
                    body: formData,
                    credentials: 'same-origin',
                }
            );

            if (!response.ok) throw new Error('Upload file fallito!');
            const data = await response.json();

            console.log("Risposta Moodle upload:", data);

            if (!data || !data['file']) throw new Error('Risposta upload errata');

            uploadedFiles.push({
                itemid: itemid,
                filename: data.file,
                filepath: '/',
                mimetype: data.file.mimetype || 'application/pdf',
                argomento: argomentoId,
            });
        }
    }

    return {
        files: uploadedFiles
    };
}
