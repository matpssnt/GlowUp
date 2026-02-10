<?php
require_once __DIR__ . '/../models/CadastroModel.php';
require_once __DIR__ . '/../controllers/PasswordController.php';
require_once __DIR__ . '/../controllers/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class SegurancaController
{
    public static function trocarSenha($data)
    {
        ValidadorController::validate_data($data, ['id_cadastro', 'senha_antiga', 'senha_nova']);

        $idCadastro = (int) $data['id_cadastro'];
        $senhaAntiga = (string) $data['senha_antiga'];
        $senhaNova = (string) $data['senha_nova'];

        if (strlen(trim($senhaNova)) < 6) {
            return jsonResponse(['message' => 'A nova senha deve ter no mínimo 6 caracteres'], 400);
        }

        $cadastro = CadastroModel::getById($idCadastro);
        if (!$cadastro) {
            return jsonResponse(['message' => 'Cadastro não encontrado'], 404);
        }

        if (!PasswordController::validateHash($senhaAntiga, $cadastro['senha'])) {
            return jsonResponse(['message' => 'Senha antiga inválida'], 400);
        }

        $hash = PasswordController::generateHash($senhaNova);

        $payload = [
            'nome' => $cadastro['nome'],
            'email' => $cadastro['email'],
            'senha' => $hash,
            'isProfissional' => $cadastro['isProfissional']
        ];

        $ok = CadastroModel::update($idCadastro, $payload);
        if ($ok) {
            return jsonResponse(['message' => 'Senha atualizada com sucesso'], 200);
        }

        return jsonResponse(['message' => 'Erro ao atualizar senha'], 400);
    }
}
