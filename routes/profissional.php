<?php
require_once __DIR__ . '/../controllers/ProfissionalController.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $id ? ProfissionalController::getById($id) : ProfissionalController::getAll();
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data || empty($data['nome']) || empty($data['email']) || empty($data['descricao']) || !isset($data['acessibilidade']) || !isset($data['isJuridica']) || empty($data['id_cadastro_fk'])) {
            jsonResponse(['message' => 'Dados inválidos ou incompletos'], 400);
            break;
        }
        ProfissionalController::create($data);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? $id;
        if (!$id) {
            jsonResponse(['message' => 'ID do profissional é obrigatório'], 400);
            break;
        }
        ProfissionalController::update($data, $id);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['id_profissional_fk']) || empty($data['id_telefone_fk'])) {
            jsonResponse(['message' => 'IDs obrigatórios'], 400);
            break;
        }
        TelefoneController::delete($data);
        break;


    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>