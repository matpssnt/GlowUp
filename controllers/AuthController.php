<?php
require_once "PasswordController.php";
require_once __DIR__ . "/../models/CadastroModel.php";
require_once __DIR__ . "/../helpers/token_jwt.php";
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class AuthController
{
    public static function loginClient($data)
    {
        ValidadorController::validate_data($data, ["email", "senha"]);

        $email = trim($data['email']);
        $senha = trim($data['senha']);

        if (empty($email) || empty($senha)) {
            return jsonResponse(["status" => "erro", "message" => "Preencha todos os campos"], 403);
        }

        $login = CadastroModel::LoginCliente($email, $senha);
        if ($login) {
            $token = createToken($login);
            return jsonResponse(["message" => "Cliente logado com sucesso", "token" => $token]);
        }
        return jsonResponse(["status" => "erro", "message" => "Credenciais inválidas"], 401);
    }

    public static function loginFuncionario($data)
    {
        ValidadorController::validate_data($data, ["email", "senha"]);

        $email = trim($data['email']);
        $senha = trim($data['senha']);

        if (empty($email) || empty($senha)) {
            return jsonResponse(["status" => "erro", "message" => "Preencha todos os campos"], 403);
        }

        $login = CadastroModel::LoginFuncionario($email, $senha);
        if ($login) {
            $token = createToken($login);
            return jsonResponse(["message" => "Funcionario logado com sucesso", "token" => $token]);
        }

        return jsonResponse(["status" => "erro", "message" => "Credenciais inválidas"], 401);
    }
}
?>
