<?php
require_once __DIR__ . '/../controllers/TelefoneController.php';
require_once __DIR__ . '../helpers/response.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id ? TelefoneController::getById($id) : TelefoneController::getAll();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['ddd']) || empty($data['digitos'])) {
            jsonResponse(['message' => 'Dados inválidos'], 400);
            break;
        }
        TelefoneController::create($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;

        if (empty($data['id'])) {
            jsonResponse(['message' => 'ID do telefone é obrigatório'], 400);
            break;
        }
        TelefoneController::update($data['id'], $data);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (!$id) {
            jsonResponse(['message' => 'ID do telefone é obrigatório'], 400);
            break;
        }
        TelefoneController::delete($id);
        break;

    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>