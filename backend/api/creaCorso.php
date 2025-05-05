<?php
require_once '../config/config.php';
require_once 'fileUtils.php';

function creaCorsoMoodle($fullname, $shortname, $categoryid, $summary = '', $format = 'topics', $argomenti) {
    $url = MOODLE_API_URL;
    $token = MOODLE_API_TOKEN;




    // CREA IL CORSO
    $createCourseResult = creaCorso($fullname, $shortname, $categoryid, $summary, $format, $token, $url);
    if (!$createCourseResult['success']) {
        return $createCourseResult;
    }

    $courseId = $createCourseResult['courseId'];



    // AGGIUNI SEZIONI in base agli argomenti
    foreach ($argomenti as $index => $argomento) {
        // Crea la sezione
        $addSectionResult = aggiungiSezione($courseId, $index + 1, $token, $url);
        if (!$addSectionResult['success']) {
            return $addSectionResult;
        }


        // AGGIORNA IL NOME della sezione
        $summary = isset($argomento['giorno'][0]) ? "Data: " . $argomento['giorno'][0] : '';

        $updateSectionResult = aggiornaNomeSezione($courseId, $index + 1, $argomento['titolo'], $summary, $token, $url);

        if (!$updateSectionResult['success']) {
            return $updateSectionResult;
        }


        // AGGIUNGI i MATERIALI alla sezione
        foreach ($argomento['materiali'] as $materiale) {
            $filePath = $materiale['percorso']; // Percorso reale del file
            $fileName = $materiale['nome'];
        
            $uploadResult = caricaFileSuMoodle($filePath, $fileName, $token, $url);
        
            if (!$uploadResult['success']) {
                return ['success' => false, 'error' => 'Errore nel caricamento del file: ' . $uploadResult['error']];
            }
        
            $itemid = $uploadResult['itemid'];
        
            $moduleData = [
                'courseid' => $courseId,
                'sectionid' => $index + 1,
                'modulename' => 'resource',
                'name' => $materiale['titolo'],
                'description' => $materiale['titolo'],
                'descriptionformat' => 1,
                'files' => [
                    [
                        'itemid' => $itemid,
                        'filename' => $fileName,
                        'filepath' => '/'
                    ]
                ]
            ];
        
            aggiungiModulo($moduleData, $token, $url);
        }
    }

    return ['success' => true, 'course' => ['id' => $courseId]];
}