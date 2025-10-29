<?php
require_once __DIR__ . "/../controllers/ClientController.php";
require_once __DIR__ . '../helpers/response.php';

if ( $_SERVER['REQUEST_METHOD'] === "GET" ){
    $id = $segmentos[2] ?? null;

    if(isset($id)){
        ClientController::getById( $id); 
    }else{
        ClientController::getAll();
    } 
}

elseif($_SERVER['REQUEST_METHOD'] == "POST"){
    $data = json_decode(file_get_contents('php://input'), true);
    ClientController::create($data);
}

elseif($_SERVER['REQUEST_METHOD'] == "PUT"){
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'];
    ClientController::update($id, $data);
}

if ( $_SERVER['REQUEST_METHOD'] === "DELETE" ){
    $id = $segments[2] ?? null;

    if(isset($id)){
        ClientController::delete( $id);
    }else{
       jsonResponse(['message'=>'ID do cliente é obrigatório'], 404);
    }
}
else{
    jsonResponse([
        'status'=>'erro',
        'message'=>'método não permitido'
    ], 405);
}

?>
