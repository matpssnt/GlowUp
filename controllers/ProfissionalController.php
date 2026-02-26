<?php

require_once __DIR__ . '/../models/ProfissionalModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class ProfissionalController
{
    public static function create($data)
    {
        try {
            ValidadorController::validate_data($data, ['nome', 'email', 'descricao', 'acessibilidade', 'isJuridica', 'id_cadastro_fk']);

            $resultado = ProfissionalModel::create($data);
            if ($resultado) {
                return jsonResponse([
                    'message' => 'Profissional criado com sucesso',
                    'idProfissional' => $resultado
                ], 201);
            } else {
                return jsonResponse(['message' => 'Erro ao criar profissional. Verifique os dados fornecidos.'], 400);
            }
        } catch (Exception $e) {
            return jsonResponse(['message' => 'Erro ao processar cadastro de profissional.'], 500);
        }
    }

    public static function update($data, $id)
    {
        // Valida CPF/CNPJ na atualização
        if ($data['isJuridica'] == 1) {
            if (empty($data['cnpj'])) {
                return jsonResponse(['message' => 'CNPJ é obrigatório para pessoa jurídica'], 400);
            }
        } else {
            if (empty($data['cpf'])) {
                return jsonResponse(['message' => 'CPF é obrigatório para pessoa física'], 400);
            }
        }

        $resultado = ProfissionalModel::update($data, $id);
        if ($resultado) {
            return jsonResponse(['message' => 'Profissional atualizado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Falha na atualização do profissional'], 400);
        }
    }

    public static function delete($id)
    {
        $result = ProfissionalModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Profissionais deletada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar um profissional'], 400);
        }
    }

    public static function getByIdCadastro($idCadastro)
    {
        $resultado = ProfissionalModel::getByIdCadastro($idCadastro);
        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Profissional nao encontrado'], 404);
        }
    }

    public static function getById($id)
    {
        $resultado = ProfissionalModel::getById($id);
        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Profissional não encontrada'], 400);
        }
    }

    public static function uploadFotoPerfil($id) {
    // verifica parâmetro válido
    if (!$id || !is_numeric($id)) {
        return jsonResponse(['message' => 'ID de profissional inválido'], 400);
    }

    if (!isset($_FILES['foto'])) {
        return jsonResponse(['message' => 'Nenhuma imagem enviada'], 400);
    }

    $arquivo = $_FILES['foto'];

    $permitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!in_array($arquivo['type'], $permitidos)) {
        return jsonResponse(['message' => 'Formato inválido'], 400);
    }

    if ($arquivo['size'] > 2 * 1024 * 1024) {
        return jsonResponse(['message' => 'Imagem muito grande (máx 2MB)'], 400);
    }

    $ext = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
    $nomeArquivo = uniqid() . "." . $ext;

    if (!is_dir("uploads/perfis")) {
        mkdir("uploads/perfis", 0777, true);
    }

    $caminho = "uploads/perfis/" . $nomeArquivo;

    if (move_uploaded_file($arquivo['tmp_name'], $caminho)) {
        $updateResult = ProfissionalModel::atualizarFotoPerfil($id, $caminho);
        if (!$updateResult) {
            // remove arquivo gerado para evitar lixo
            @unlink($caminho);
            return jsonResponse(['message' => 'Falha ao salvar caminho no banco'], 500);
        }

        return jsonResponse([
            'message' => 'Foto atualizada com sucesso',
            'url' => $caminho
        ], 200);
    }

    return jsonResponse(['message' => 'Erro ao fazer upload'], 400);
    }

    public static function getAll()
    {
        $resultado = ProfissionalModel::getAll();
        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhuma profissional encontrada'], 400);
        }
    }
}

?>