<?php
require_once __DIR__ . '/../controllers/PortifolioController.php';
require_once __DIR__ . '/../helpers/response.php';

$id = $seguimentos[2] ?? null;

$method = $_SERVER['REQUEST_METHOD'];
$path   = explode('/', trim($_SERVER['PATH_INFO'] ?? '', '/'));

if ($method === 'GET') {
    $id ? PortifolioController::getById($id) : PortifolioController::getAll();
}
elseif ($method === 'POST') {

    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    PortifolioController::create($data);

} elseif ($method === 'PUT') {

    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $data['id'] ?? $_GET['id'] ?? null;

    if (!$id || !is_numeric($id)) {
        jsonResponse(['message' => 'ID do portfólio é obrigatório'], 400);
        exit;
    }

    PortifolioController::update($data, (int)$id);

} elseif ($method === 'DELETE') {

    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $data['id'] ?? $_GET['id'] ?? null;

    if (!$id || !is_numeric($id)) {
        jsonResponse(['message' => 'ID do portfólio é obrigatório'], 400);
        exit;
    }

    PortifolioController::delete((int)$id);

} else {
    jsonResponse(['message' => 'Método não permitido'], 405);
}
