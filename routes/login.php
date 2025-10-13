<?php
require_once __DIR__ . '/../controllers/AuthController.php';

if($_SERVER['REQUEST_METHOD'] == "POST"){
    $data = json_decode(file_get_contents('php://input'), true);
    AuthController::loginClient($data);
}else{
    jsonResponse([
        'status'=>'erro',
        'message'=>'método não permitido!'
    ],405);
}


?>