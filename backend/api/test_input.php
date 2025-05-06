<?php
$raw = file_get_contents('php://input');
$decoded = json_decode($raw, true);

header('Content-Type: application/json');
echo json_encode([
    'raw_input' => $raw,
    'json_decoded' => $decoded,
    'is_valid_json' => json_last_error() === JSON_ERROR_NONE,
]);
