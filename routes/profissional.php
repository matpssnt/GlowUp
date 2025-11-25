<?php
require_once __DIR__ . '/../controllers/ProfissionalController.php';
require_once __DIR__ . '/../helpers/response.php';

$id = $seguimentos[2] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if ($id === 'cadastro') {
            $idCadastro = $seguimentos[3] ?? null;
            if ($idCadastro) {
                ProfissionalController::getByIdCadastro($idCadastro);
            } else {
                jsonResponse(['message' => 'ID do cadastro é obrigatorio'], 400);
            }
        } else {
            $id ? ProfissionalController::getById($id) : ProfissionalController::getAll();
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

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
        $id = $data['id'] ?? $id;

        if (!$id) {
            jsonResponse(['message' => 'IDs obrigatórios'], 400);
            break;
        }
        ProfissionalController::delete($id);
        break;


    default:
        jsonResponse(['status' => 'erro', 'message' => 'Método não permitido'], 405);
}
?>