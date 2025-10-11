<?php
require_once __DIR__ . '/../controllers/ServicesController.php';

//AINDA NÃO TESTADO!!!!
$id = $seguimentos[2] ?? null;

if ($_SERVER['REQUEST_METHOD'] === "GET") {
    if (isset($id)) {
        ServicesController::getById($conn, $id);
    }else{
        ServicesController::getAll($conn);
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data) {
        ServicesController::create($conn, $data);
    }else{
        jsonResponse(['message' => 'dados inválidos'], 400);
    }
}

elseif ($_SERVER['REQUEST_METHOD'] === "PUT") {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;

    if (!$id) {
        jsonResponse(['message' => 'ID do serviço é obrigatorio'], 400);
    }
    ServicesController::update($conn, $id, $data);
}

elseif ($_SERVER['REQUEST_METHOD'] === "DELETE") {
    if (isset($id)) {
    ServicesController::delete($conn, $id);
    }else{
        jsonResponse(['message' => 'ID do serviço é obrigatorio'], 400);
    }
}

else {
    jsonResponse([
        'status' => 'erro',
        'message' => 'método não permitido'
    ], 405);
}
