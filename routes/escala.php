<?php
require_once __DIR__ . '/../controllers/EscalaController.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'] ?? '';
$path   = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));
$id     = isset($path[1]) && is_numeric($path[1]) ? (int)$path[1] : null;

$data = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'GET') {
    if ($id) {
        EscalaController::getById($id);
    } else {
        EscalaController::getAll();
    }
} elseif ($method === 'POST') {
    EscalaController::create($data);
} elseif ($method === 'PUT') {
    $idFromBody = isset($data['id']) && is_numeric($data['id']) ? (int)$data['id'] : null;
    $finalId = $idFromBody ?: $id;
    if (!$finalId) {
        jsonResponse(['message' => 'ID da escala é obrigatório e deve ser numérico'], 400);
        exit;
    }
    EscalaController::update($data, $finalId);
} elseif ($method === 'DELETE') {
    $idFromBody = isset($data['id']) && is_numeric($data['id']) ? (int)$data['id'] : null;
    $finalId = $idFromBody ?: $id;
    if (!$finalId) {
        jsonResponse(['message' => 'ID da escala é obrigatório e deve ser numérico'], 400);
        exit;
    }
    EscalaController::delete($finalId);
} else {
    jsonResponse(['message' => 'Método não permitido'], 405);
}