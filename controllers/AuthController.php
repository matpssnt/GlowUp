<?php
    require_once "PasswordController.php";

    require_once __DIR__ . "/../models/CadastroModel.php";
    require_once __DIR__ . "/../helpers/token_jwt.php";
    require_once __DIR__ . '/../helpers/response.php';
    require_once __DIR__ . '/ValidadorController.php';

    class AuthController {

        public static function login($data){
        ValidadorController::validate_data($data, ["email", "senha"]);

        $data['email'] = trim($data['email']);
        $data['senha'] = trim($data['senha']);

        if (empty($data['email']) || empty($data['senha'])) {
            return jsonResponse(
                [
                    "status" => "erro",
                    "message" => "Preencha todos os campos"

                ],
                403
            );
        }

        $login = CadastroModel::LoginVerify($data['email'], $data['senha']);
        if ($login) {
            $token = createToken($login);
            return jsonResponse(["token" => $token]);
        } else {
            return jsonResponse(
                [
                    "reposta" => "Erro",
                    "message" => "Credenciais invalidas"

                ],
                401
            );
        }
    }

        public static function loginClient($data) {
            $data['email'] = trim($data['email']);
            $data['senha'] = trim($data['senha']);

            if (empty($data['email']) || empty($data['senha'])) {
                return jsonResponse([
                    "status" => "Erro de login!",
                    "message" => "Preencha todos os campos!",
                ], 401);
            }

            $cliente = CadastroModel::LoginVerify($data['email'] , $data['senha']);
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