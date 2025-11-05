<?php
require_once __DIR__ . '/../controllers/ServicesController.php';
require_once __DIR__ . '/../helpers/response.php';

$id = $seguimentos[2] ?? null;

if ($_SERVER['REQUEST_METHOD'] === "GET") {
    if (isset($id)) {
        ServicesController::getById($id);
    }else{
        ServicesController::getAll();
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === "POST") {
    $data = json_decode(file_get_contents('php://input'), true);

    ServicesController::create($data);
}

elseif ($_SERVER['REQUEST_METHOD'] === "PUT") {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        jsonResponse(['message' => 'ID do serviço é obrigatorio'], 400);
    }
    ServicesController::update($id, $data);
}

elseif ($_SERVER['REQUEST_METHOD'] === "DELETE") {
    if (isset($id)) {
    ServicesController::delete($id);
    }else{
        jsonResponse(['message' => 'ID do serviço é obrigatorio'], 400);
    }
}

else {
    jsonResponse([
        'status' => 'erro',
        'message' => 'Método não permitido!'
    ], 405);
}
