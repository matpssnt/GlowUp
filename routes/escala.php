<?php
require_once __DIR__ . '/../controllers/EscalaController.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id ? EscalaController::getById($id) : EscalaController::getAll();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['inicio']) || empty($data['fim']) || empty($data['dia_semana']) || empty($data['id_profissional_fk'])) {
            jsonResponse(['message' => 'Dados inválidos, preencha todos os campos'], 400);
            break;
        }
        EscalaController::create($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$id) {
            jsonResponse(['message' => 'ID da escala é obrigatório'], 400);
            break;
        }
        EscalaController::update($data, $id);
        break;

    case 'DELETE':
        if (!$id) {
            jsonResponse(['message' => 'ID da escala é obrigatório'], 400);
            break;
        }
        EscalaController::delete($id);
        break;

    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>