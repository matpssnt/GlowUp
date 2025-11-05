<?php
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../controllers/AgendamentoController.php';
require_once __DIR__ . "/../controllers/ValidadorController.php";

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id ? AgendamentoController::getById($id) : AgendamentoController::getAll();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        AgendamentoController::create($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (!$id) {
            jsonResponse(['message' => 'ID do agendamento é obrigatório'], 400);
            break;
        }
        AgendamentoController::update($data, $id);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? ($seguimentos[2] ?? null);
        if (!$id) {
            jsonResponse(['message' => 'ID do agendamento é obrigatório'], 400);
            break;
        }
        AgendamentoController::delete($id);
        break;

    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>