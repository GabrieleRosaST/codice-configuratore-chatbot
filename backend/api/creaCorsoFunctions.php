<?php


function creaCorso($fullname, $shortname, $categoryid, $summary, $format, $token, $url) {
    $functionname = 'core_course_create_courses';
    $postdata = [
        'courses' => [
            [
                'fullname' => $fullname,
                'shortname' => $shortname,
                'categoryid' => $categoryid,
                'summary' => $summary,
                'format' => $format,
            ]
        ]
    ];

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=' . $functionname . '&moodlewsrestformat=json');
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query($postdata));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($curl);

    if ($response === false) {
        return ['success' => false, 'error' => 'Errore cURL: ' . curl_error($curl)];
    }

    curl_close($curl);

    $decodedResponse = json_decode($response, true);

    if (isset($decodedResponse['exception'])) {
        return ['success' => false, 'error' => $decodedResponse['message']];
    }

    if (!isset($decodedResponse[0]['id'])) {
        return ['success' => false, 'error' => 'Risposta API non valida: ID del corso mancante'];
    }

    return ['success' => true, 'courseId' => $decodedResponse[0]['id']];
}


function aggiungiSezione($courseId, $position, $token, $url) {
    $sectionData = [
        'courseid' => $courseId,
        'position' => $position, // Posizione della sezione
        'number' => 1 // Numero di sezioni da creare
    ];


    $sectionFunctionName = 'local_wsmanagesections_create_sections';
    $sectionCurl = curl_init();
    curl_setopt($sectionCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=' . $sectionFunctionName . '&moodlewsrestformat=json');
    curl_setopt($sectionCurl, CURLOPT_POST, true);
    curl_setopt($sectionCurl, CURLOPT_POSTFIELDS, http_build_query($sectionData));
    curl_setopt($sectionCurl, CURLOPT_RETURNTRANSFER, true);

    $sectionResponse = curl_exec($sectionCurl);

    if ($sectionResponse === false) {
        return ['success' => false, 'error' => 'Errore cURL nella creazione della sezione: ' . curl_error($sectionCurl)];
    }

    curl_close($sectionCurl);

    $decodedSectionResponse = json_decode($sectionResponse, true);

    if (isset($decodedSectionResponse['exception'])) {
        return ['success' => false, 'error' => 'Errore nella creazione della sezione: ' . $decodedSectionResponse['message']];
    }


    return ['success' => true];
}



function aggiornaNomeSezione($courseId, $sectionNumber, $name, $summary, $token, $url) {
    $updateData = [
        'courseid' => $courseId,
        'sections[0][type]' => 'num',
        'sections[0][section]' => $sectionNumber,
        'sections[0][name]' => $name,
        'sections[0][summary]' => $summary,
        'sections[0][summaryformat]' => 1
    ];


    $updateFunctionName = 'local_wsmanagesections_update_sections';
    $updateCurl = curl_init();
    curl_setopt($updateCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=' . $updateFunctionName . '&moodlewsrestformat=json');
    curl_setopt($updateCurl, CURLOPT_POST, true);
    curl_setopt($updateCurl, CURLOPT_POSTFIELDS, http_build_query($updateData));
    curl_setopt($updateCurl, CURLOPT_RETURNTRANSFER, true);

    $updateResponse = curl_exec($updateCurl);

    if ($updateResponse === false) {
        return ['success' => false, 'error' => 'Errore cURL nell\'aggiornamento della sezione: ' . curl_error($updateCurl)];
    }

    curl_close($updateCurl);

    $decodedUpdateResponse = json_decode($updateResponse, true);

    if (isset($decodedUpdateResponse['exception'])) {
        return ['success' => false, 'error' => 'Errore nell\'aggiornamento della sezione: ' . $decodedUpdateResponse['message']];
    }


    return ['success' => true];
}


function uploadFileToMoodle($filePath, $fileName, $userId, $token, $url) {
    if (!file_exists($filePath)) {
        file_put_contents(__DIR__ . '/debug.log', "File non trovato: $filePath\n", FILE_APPEND);
        return ['success' => false, 'error' => "File non trovato: $filePath"];
    }

    // Codifica il contenuto del file in Base64
    $fileContent = base64_encode(file_get_contents($filePath));

    // Dati per l'upload
    $uploadFields = [
        'component' => 'user', // Specifica il contesto (es. 'user' per file privati)
        'filearea' => 'draft', // Area file
        'itemid' => 0, // ID univoco per il caricamento
        'filepath' => '/', // Percorso del file (es. root)
        'filename' => $fileName, // Nome del file
        'filecontent' => $fileContent, // Contenuto del file codificato in Base64
        'contextlevel' => 'user', // Livello del contesto (es. 'user')
        'instanceid' => $userId // ID dell'utente (ad esempio, l'ID dell'utente corrente)
    ];

    // Invia la richiesta cURL
    $uploadCurl = curl_init();
    curl_setopt($uploadCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=core_files_upload&moodlewsrestformat=json');
    curl_setopt($uploadCurl, CURLOPT_POST, true);
    curl_setopt($uploadCurl, CURLOPT_POSTFIELDS, $uploadFields);
    curl_setopt($uploadCurl, CURLOPT_RETURNTRANSFER, true);
    $uploadResponse = curl_exec($uploadCurl);
    curl_close($uploadCurl);

    $uploadResult = json_decode($uploadResponse, true);

    // Log per verificare la risposta
    file_put_contents(__DIR__ . '/debug.log', "Risultato upload: " . print_r($uploadResult, true) . "\n", FILE_APPEND);

    // Controlla se l'upload è riuscito
    if (!isset($uploadResult['itemid'])) {
        file_put_contents(__DIR__ . '/debug.log', "Errore durante l'upload: " . print_r($uploadResult, true) . "\n", FILE_APPEND);
        return ['success' => false, 'error' => "Errore durante l'upload"];
    }

    return ['success' => true, 'itemid' => $uploadResult['itemid']];
}



function aggiungiModuloMoodle($courseId, $targetSectionId, $token, $url) {


    $moduleData = [
        'courseid' => $courseId,
        'targetsectionid' => $targetSectionId,
        'modname' => 'label',
    ];


    $moduleFunctionName = 'core_courseformat_new_module';
    $moduleCurl = curl_init();
    curl_setopt($moduleCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=' . $moduleFunctionName . '&moodlewsrestformat=json');
    curl_setopt($moduleCurl, CURLOPT_POST, true);
    curl_setopt($moduleCurl, CURLOPT_POSTFIELDS, http_build_query($moduleData));
    curl_setopt($moduleCurl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($moduleCurl, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded'
    ]);

    $moduleResponse = curl_exec($moduleCurl);
    $moduleResult = json_decode($moduleResponse, true);

    file_put_contents(__DIR__ . '/debug.log', "Risultato creazione modulo: " . print_r($moduleResult, true) . "\n", FILE_APPEND);

    if (isset($moduleResult['exception'])) {
        file_put_contents(__DIR__ . '/debug.log', "Errore creazione modulo: " . $moduleResult['message'] . "\n", FILE_APPEND);
        return ['success' => false, 'error' => $moduleResult['message']];
    }

    return ['success' => true, 'moduleid' => $moduleResult['id']];
}


