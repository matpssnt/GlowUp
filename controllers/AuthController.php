<?php
    require_once "PasswordController.php";

    require_once __DIR__ . "/../models/ClientModel.php";
    require_once __DIR__ . "/../helpers/token_jwt.php";
    require_once __DIR__ . '/../helpers/response.php';

    class AuthController {
        public static function loginClient($data) {
            global $conn;
            $data['email'] = trim($data['email']);
            $data['password'] = trim($data['password']);

            if (empty($data['email']) || empty($data['password'])) {
                return jsonResponse([
                    "status" => "Erro de login!",
                    "message" => "Preencha todos os campos!",
                ], 401);
            }

            $cliente = ClientModel::clientValidation( $data['email'] , $data['password']);
            if ($cliente) {
                
                $token = createToken($cliente);
                return jsonResponse(["token" => $token ]);
            }

            else {
                jsonResponse([
                    "status"=>"Erro na geração de token!",
                    "message"=>"Credenciais inválidas!"
                ], 401);
            }
        }

    }

?>