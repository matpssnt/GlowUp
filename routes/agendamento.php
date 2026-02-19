<?php
require_once __DIR__ . '/../controllers/AgendamentoController.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$path   = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));

if ($method === 'GET') {
    if (isset($path[1]) && is_numeric($path[1])) {
        AgendamentoController::getById((int)$path[1]);
    } else {
        AgendamentoController::getAll();
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    error_log("[DEBUG] Dados recebidos no route: " . json_encode($data));
    AgendamentoController::create($data);
} elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $data['id'] ?? $_GET['id'] ?? null;
    if (!$id || !is_numeric($id)) {
        jsonResponse(['message' => 'ID do agendamento é obrigatório'], 400);
        exit;
    }
    AgendamentoController::update($data, (int)$id);
} elseif ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $data['id'] ?? $_GET['id'] ?? null;
    if (!$id || !is_numeric($id)) {
        jsonResponse(['message' => 'ID do agendamento é obrigatório'], 400);
        exit;
    }
    AgendamentoController::cancelar((int)$id);
} else {
    jsonResponse(['message' => 'Método não permitido'], 405);
}