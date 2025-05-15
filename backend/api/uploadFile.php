<?php
// filepath: c:\xampp\htdocs\progetto-1\backend\api\uploadFile.php

header('Content-Type: application/json');

// Verifica che il metodo sia POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metodo non consentito']);
    exit;
}

// Verifica che un file sia stato caricato
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Errore nel caricamento del file']);
    exit;
}

// Salva il file nella directory "uploads"
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

//$fileName = str_replace(' ', '_', basename($_FILES['file']['name']));
$uploadPath = $uploadDir . $fileName;

if (!move_uploaded_file($_FILES['file']['tmp_name'], $uploadPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore nel salvataggio del file']);
    exit;
}


// Restituisci l'URL del file salvato e l'ID su Moodle
echo json_encode([
    'success' => true,
    'fileName' => $fileName, // Nome del file salvato
    'fileUrl' => 'http://localhost/progetto-1/backend/uploads/' . $fileName,
]);