<?php
require_once '../config/config.php';
require_once 'creaCorsoFunctions.php';

function creaCorsoMoodle($fullname, $shortname, $categoryid, $summary = '', $format = 'topics', $argomenti) {
    $url = MOODLE_API_URL;
    $token = MOODLE_API_TOKEN;


    // CREA IL CORSO
    $createCourseResult = creaCorso($fullname, $shortname, $categoryid, $summary, $format, $token, $url);


    if (!$createCourseResult['success']) {
        return $createCourseResult;
    }
    $courseId = $createCourseResult['courseId'];
    file_put_contents(__DIR__ . '/debug.log', "Corso creato con ID: $courseId\n", FILE_APPEND);


    // AGGIUNI SEZIONI in base agli argomenti
    foreach ($argomenti as $index => $argomento) {
        

        // 1. CREA LA SEZIONE
        $addSectionResult = aggiungiSezione($courseId, $index + 1, $token, $url);
        

        if (!$addSectionResult['success']) {
            return $addSectionResult;
        }
        $summary = isset($argomento['giorno'][0]) ? "Data: " . $argomento['giorno'][0] : '';


        // 2. AGGIORNA IL NOME DELLA SEZIONE
        $updateSectionResult = aggiornaNomeSezione($courseId, $index + 1, $argomento['titolo'], $summary, $token, $url);


        



        if (!$updateSectionResult['success']) {
            return $updateSectionResult;
        }

        if (!empty($argomento['materiali'])) {

            foreach ($argomento['materiali'] as $materiale) {

                //$fileName = str_replace(' ', '_', $materiale['nome']);
                $filePath = __DIR__ . '/../uploads/' . $fileName;
                $userId = 2;


                // 3. CARICA IL FILE SU MOODLE COME DRAFT
                $uploadResult = uploadFileToMoodle($filePath, $fileName, $userId, $token, $url);


                if (!$uploadResult['success']) {
                    file_put_contents(__DIR__ . '/debug.log', "Errore upload file: " . $uploadResult['error'] . "\n", FILE_APPEND);
                    continue;
                }
                $itemid = $uploadResult['itemid'];
                file_put_contents(__DIR__ . '/debug.log', "File caricato con itemid: $itemid\n", FILE_APPEND);

                

                //4. AGGIUNGERE IL FILE COME MODULO ALLA SEZIONE
                
                // Ottieni l'ID della sezione desiderata
                $courseContentsCurl = curl_init();
                curl_setopt($courseContentsCurl, CURLOPT_URL, $url . '?wstoken=' . $token . '&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=' . $courseId);
                curl_setopt($courseContentsCurl, CURLOPT_RETURNTRANSFER, true);
                $courseContentsResponse = curl_exec($courseContentsCurl);
                curl_close($courseContentsCurl);

                $courseContents = json_decode($courseContentsResponse, true);
                file_put_contents(__DIR__ . '/debug.log', "Course contents: " . print_r($courseContents, true) . "\n", FILE_APPEND);            
                $targetSectionId = $courseContents[$index + 1]['id'];
                file_put_contents(__DIR__ . '/debug.log', "targetSectionId: " . print_r($targetSectionId, true) . "\n", FILE_APPEND);   

                

                $addModuleResult = aggiungiModuloMoodle($courseId, $targetSectionId, $materiale['nome'], $token, $url);

                if (!$addModuleResult['success']) {
                    file_put_contents(__DIR__ . '/debug.log', "Errore aggiunta modulo: " . $addModuleResult['error'] . "\n", FILE_APPEND);
                    continue;
                }

                file_put_contents(__DIR__ . '/debug.log', "Modulo aggiunto con ID: " . $addModuleResult['moduleid'] . "\n", FILE_APPEND);
                


                
            }
        }
    }
    

    return ['success' => true, 'course' => ['id' => $courseId]];
}