<?php
require_once __DIR__ . '/../controllers/CategoriaController.php';
require_once __DIR__ . '/../helpers/response.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        if ($id) {
            CategoriaController::getById($id);
        } else {
            CategoriaController::getAll();
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        CategoriaController::create($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? ($seguimentos[2] ?? null);
        if (!$id) {
            jsonResponse(['message' => 'ID da categoria é obrigatório'], 400);
            break;
        }

        if (!$data || empty($data['nome'])) {
            jsonResponse(['message' => 'Nome da categoria é obrigatório'], 400);
            break;
        }

        CategoriaController::update($id, $data);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? ($seguimentos[2] ?? null);
        if (!$id) {
            jsonResponse(['message' => 'ID da categoria é obrigatório'], 400);
            break;
        }

        CategoriaController::delete($id);
        break;

    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>