<?php
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../helpers/response.php';

if($_SERVER['REQUEST_METHOD'] == "POST"){
    $opcao = $seguimentos[2] ?? null;
    $data = json_decode(file_get_contents('php://input'), true);
    if($opcap === "cliente"){
        AuthController::loginClient($data);
    }elseif($opcao === "funcionario"){
        AuthController::login($data);   
    }
}else{
    jsonResponse([
        'status'=>'erro',
        'message'=>'método não permitido!'
    ],405);
}


?>