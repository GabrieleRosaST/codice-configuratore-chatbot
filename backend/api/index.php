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

// Logga tutto ciò che arriva dal frontend
file_put_contents(__DIR__ . '/debug.log', "\n--- Inizio richiesta ---\n", FILE_APPEND);
file_put_contents(__DIR__ . '/debug.log', "\nContenuto di \$_POST:\n" . print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents(__DIR__ . '/debug.log', "\nContenuto di \$_FILES:\n" . print_r($_FILES, true) . "\n", FILE_APPEND);
file_put_contents(__DIR__ . '/debug.log', "--- Fine richiesta ---\n", FILE_APPEND);



// Rispondi con l'elenco dei file salvati
echo json_encode(['success' => true, ]);