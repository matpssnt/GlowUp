<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === "POST") {
    $opcao = $seguimentos[2] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);

    if ($opcao === "cliente") {
        AuthController::loginClient($data);
    }
    elseif ($opcao === "funcionario") {
        AuthController::loginFuncionario($data);
    }
    else {
        jsonResponse([
            'status' => 'erro',
            'message' => 'Rota de login inválida!'
        ], 404);
    }

} else {
    jsonResponse([
        'status' => 'erro',
        'message' => 'Método não permitido!'
    ], 405);
}
?>
