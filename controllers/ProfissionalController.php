<?php

require_once __DIR__ . '/../models/ProfissionalModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class ProfissionalController
{
    public static function create($data)
    {
        ValidadorController::validate_data($data, ['nome', 'email', 'descricao', 'acessibilidade', 'isJuridica', 'id_cadastro_fk']);

        $resultado = ProfissionalModel::create($data);
        if ($resultado) {
            return jsonResponse(['message' => 'Profissional criado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar um profissional'], 400);
        }
    }


    public static function update($data, $id)
    {
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