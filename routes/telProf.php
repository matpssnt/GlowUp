<?php
require_once __DIR__ . '/../controllers/TelProfController.php';
require_once __DIR__ . '/../helpers/response.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        TelProfController::getAll();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (empty($data['id_profissional_fk']) || empty($data['id_telefone_fk'])) {
            jsonResponse(['message' => 'IDs obrigatórios'], 400);
            break;
        }
        TelProfController::create($data);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (empty($data['id_profissional_fk']) || empty($data['id_telefone_fk'])) {
            jsonResponse(['message' => 'IDs obrigatórios'], 400);
            break;
        }
        TelProfController::delete($data);
        break;

    default:
    jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>