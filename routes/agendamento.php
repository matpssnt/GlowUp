<?php
require_once __DIR__ . '/../controllers/AgendamentoController.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === "GET") {
    $id = $seguimentos[2] ?? null;
    if (isset($id)) {
        AgendamentoController::getById($id);
    } else {
        AgendamentoController::getAll();
    }
} elseif ($_SERVER['REQUEST_METHOD'] === "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    AgendamentoController::create($data);
} elseif ($_SERVER['REQUEST_METHOD'] === "PUT") {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) {
        jsonResponse(['message' => 'ID do agendamento é obrigatório'], 400);
    }
    AgendamentoController::update($data, $id);
} elseif ($_SERVER['REQUEST_METHOD'] === "DELETE") {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    if (!$id) {
        jsonResponse(['message' => 'ID do agendamento é obrigatório'], 400);
    }
    AgendamentoController::cancelar($id);
} else {
    jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>