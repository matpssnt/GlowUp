<?php
    require_once "PasswordController.php";

    require_once __DIR__ . "/../models/UserModel.php";
    require_once __DIR__ . "/../models/ClientModel.php";
    require_once __DIR__ . "/../helpers/token_jwt.php";

    class AuthController {
        //public static function loginUser($conn, $data) {
        //    $data['email'] = trim($data['email']);
        //    $data['password'] = trim($data['password']);

        //    //Confirmar se todos os campos estão vazios
        //    if (empty($data['email']) || empty($data['password'])) {
        //        return jsonResponse([
        //            "status" => "Erro ao fazer o login!",
        //            "message" => "Preencha todos os campos!",
        //        ], 401);
        //    }
        //
        //    $user = UserModel::verifUser($conn, $data['email'] , $data['password']);
        //    if ($user) {
        //        
        //        $token = createToken($user);
        //        return jsonResponse(["token" => $token ]);
        //    }

        //    else {
        //        jsonResponse([
        //            "status"=>"Erro na geração de token!",
        //            "message"=>"Credenciais inválidas!"
        //        ], 401);
        //    }
        //}

        public static function loginClient($conn, $data) {
            $data['email'] = trim($data['email']);
            $data['password'] = trim($data['password']);

            if (empty($data['email']) || empty($data['password'])) {
                return jsonResponse([
                    "status" => "Erro de login!",
                    "message" => "Preencha todos os campos!",
                ], 401);
            }

            $cliente = ClientModel::clientValidation($conn, $data['email'] , $data['password']);
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