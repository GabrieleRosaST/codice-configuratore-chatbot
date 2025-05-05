<?php
// filepath: c:\xampp\htdocs\progetto-1\backend\api\index.php

// Abilita CORS
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Gestisci la richiesta OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verifica che il metodo sia POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    file_put_contents(__DIR__ . '/debug.log', "Metodo non consentito: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
    http_response_code(405); // Metodo non consentito
    echo json_encode(["error" => "Metodo non consentito"]);
    exit;
}

// Leggi i dati JSON inviati dal frontend
$rawInput = file_get_contents('php://input');

// Decodifica il JSON
$input = json_decode($rawInput, true);

// Log dei dati ricevuti
file_put_contents(__DIR__ . '/debug.log', "Dati ricevutiiii: " . print_r($input, true) . "\n", FILE_APPEND);

// Se il JSON non è valido, restituisci un errore
if ($input === null) {
    file_put_contents(__DIR__ . '/debug.log', "Errore: JSON non valido. Errore JSON: " . json_last_error_msg() . "\n", FILE_APPEND);
    http_response_code(400); // Richiesta non valida
    echo json_encode(["error" => "JSON non valido"]);
    exit;
}



// Estrai i dati dal JSON
$datiIniziali = $input['DatiIniziali'];
$argomenti = $input['argomenti'];



// Includi lo script di Moodle
require_once '../config/config.php';
require_once 'creaCorso.php';

// Crea il corso in Moodle
$result = creaCorsoMoodle(
    $datiIniziali['nomeChatbot'], // Nome completo del corso
    $datiIniziali['corsoChatbot'], // Nome breve del corso
    1, // ID della categoria
    $datiIniziali['descrizioneChatbot'], // Descrizione del corso
    'topics', // Formato del corso
    $argomenti // Array degli argomenti
);

// Log del risultato della creazione del corso
file_put_contents(__DIR__ . '/debug.log', "Risultato creazione corso: " . print_r($result, true) . "\n", FILE_APPEND);

// Verifica se il corso è stato creato con successo
if (!$result['success']) {
    file_put_contents(__DIR__ . '/debug.log', "Errore creazione corso: " . $result['error'] . "\n", FILE_APPEND);
    http_response_code(500); // Errore interno del server
    echo json_encode(["error" => $result['error']]);
    exit;
}

// ID del corso creato
$courseId = $result['course']['id'] ?? null;
if (!$courseId) {
    file_put_contents(__DIR__ . '/debug.log', "Errore: ID del corso non generato\n", FILE_APPEND);
    http_response_code(500); // Errore interno del server
    echo json_encode(["error" => "ID del corso non generato"]);
    exit;
}

// URL del corso in Moodle
$courseUrl = "http://localhost/moodle/moodle/course/view.php?id=" . $courseId;

// Log dell'URL del corso
file_put_contents(__DIR__ . '/debug.log', "URL del corso: $courseUrl\n", FILE_APPEND);

// Rispondi al frontend
$response = [
    "success" => true,
    "courseId" => $courseId,
    "courseUrl" => $courseUrl,
];
file_put_contents(__DIR__ . '/debug.log', "Risposta al frontend: " . print_r($response, true) . "\n", FILE_APPEND);
echo json_encode($response);