<?php
function aggiungiModulo($moduleData, $token, $url) {
    $moduleFunctionName = 'core_courseformat_new_module';
    $moduleCurl = curl_init();
    curl_setopt($moduleCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=' . $moduleFunctionName . '&moodlewsrestformat=json');
    curl_setopt($moduleCurl, CURLOPT_POST, true);
    curl_setopt($moduleCurl, CURLOPT_POSTFIELDS, http_build_query($moduleData));
    curl_setopt($moduleCurl, CURLOPT_RETURNTRANSFER, true);

    $moduleResponse = curl_exec($moduleCurl);

    if ($moduleResponse === false) {
        return ['success' => false, 'error' => 'Errore cURL nell\'aggiunta del modulo: ' . curl_error($moduleCurl)];
    }

    curl_close($moduleCurl);

    $decodedModuleResponse = json_decode($moduleResponse, true);

    if (isset($decodedModuleResponse['exception'])) {
        return ['success' => false, 'error' => 'Errore nell\'aggiunta del modulo: ' . $decodedModuleResponse['message']];
    }

    return ['success' => true];
}




function caricaFileSuMoodle($filePath, $fileName, $token, $url) {
    
    $filePath = realpath($filePath);
    if (!$filePath || !file_exists($filePath)) {
        return ['success' => false, 'error' => "Il file non esiste: $filePath"];
    }

    // Codifica il nome del file per evitare problemi con caratteri speciali
    $fileName = str_replace(' ', '_', $fileName); // Sostituisci spazi con underscore


    $fileCurl = curl_init();
    curl_setopt($fileCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=core_files_upload&moodlewsrestformat=json');
    curl_setopt($fileCurl, CURLOPT_POST, true);
    curl_setopt($fileCurl, CURLOPT_POSTFIELDS, [
        'filearea' => 'draft',
        'itemid' => 0,
        'filepath' => '/',
        'filename' => $fileName,
        'filecontent' => new CURLFile($filePath)
    ]);
    curl_setopt($fileCurl, CURLOPT_RETURNTRANSFER, true);

    $fileResponse = curl_exec($fileCurl);

    if ($fileResponse === false) {
        return ['success' => false, 'error' => 'Errore cURL nel caricamento del file: ' . curl_error($fileCurl)];
    }

    curl_close($fileCurl);

    $decodedFileResponse = json_decode($fileResponse, true);

    if (isset($decodedFileResponse['exception'])) {
        return ['success' => false, 'error' => 'Errore nel caricamento del file: ' . $decodedFileResponse['message']];
    }

    return ['success' => true, 'itemid' => $decodedFileResponse['itemid']];
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
