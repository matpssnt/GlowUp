<?php
require_once __DIR__ . '/../controllers/CadastroController.php';
require_once __DIR__ . '/../helpers/response.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id ? CadastroController::getById($id) : CadastroController::getAll();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        CadastroController::create($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (!$id) { 
            jsonResponse(['message' => 'ID do cadastro é obrigatório'], 400); 
            break; 
        }
        if (empty($data['nome']) || empty($data['email']) || empty($data['senha']) || !isset($data['isProfissional'])) {
            jsonResponse(['message' => 'Dados inválidos ou incompletos'], 400);
            break;
        }
        CadastroController::update($data, $id);
        break;

    case 'DELETE':

        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (!$id) { 
            jsonResponse(['message' => 'ID do cadastro é obrigatório'], 400); 
            break; 
        }
        CadastroController::delete($id);
        break;

    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>