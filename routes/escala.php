<?php
require_once __DIR__ . '/../controllers/EscalaController.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === "GET") {

    $id = $seguimentos[2] ?? null;

    if (isset($id)) {
        EscalaController::getById($id);
    } else {
        EscalaController::getAll();
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === "POST") {

    $data = json_decode(file_get_contents('php://input'), true);
    EscalaController::create($data);
}

elseif ($_SERVER['REQUEST_METHOD'] === "PUT") {

    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];

    EscalaController::update($data, $id);
}

elseif ($_SERVER['REQUEST_METHOD'] === "DELETE") {

    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];

    if (isset($id)) {
        EscalaController::delete($id);
    } else {
        jsonResponse(['message' => 'ID da escala é obrigatório'], 404);
    }
}

else {
    jsonResponse([
        'status'  => 'erro',
        'message' => 'método não permitido'
    ], 405);
}
