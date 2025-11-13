<?php

require_once __DIR__ . '/../models/CadastroModel.php';
require_once __DIR__ . '/../models/ClientModel.php';
require_once __DIR__ . '/../models/ProfissionalModel.php';
require_once __DIR__ . '/../controllers/PasswordController.php';
require_once __DIR__ . '/../controllers/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class CadastroController
{
    public static function create($data)
    {
        ValidadorController::validate_data($data, ["nome", "email", "senha", "isProfissional"]);

        $data['senha'] = PasswordController::generateHash($data['senha']);

        // Criando o cadastro principal..
        $idCadastro = CadastroModel::create($data);

        if ($idCadastro) {
            // Criando o relacionamento com a tabela profissionais..
            if ($data['isProfissional'] == 1) {
                $profData = [
                    'nome' =>   $data['nome'],
                    'email' => $data['email'],
                    'descricao' => '',
                    'acessibilidade' => 0,
                    'isJuridica' => 0,
                    'id_cadastro_fk' => $idCadastro 
                ];
                ProfissionalModel::create($profData);
            } else {
                // Criando o relacionamento com a tabela clientes..
                $clienteData = [
                    'nome' => $data['nome'],
                    'id_cadastro_fk' => $idCadastro
                ];
                ClientModel::create($clienteData);
            }

            return jsonResponse(['message' => 'Cadastro criado com sucesso!'], 201);
        } else {
            return jsonResponse(['message' => 'Erro ao criar cadastro'], 400);
        }
    }

    public static function update($data, $id)
    {
        $resultado = CadastroModel::update($data, $id);
        if ($resultado) {
            return jsonResponse(['message' => 'Cadastro atualizado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Falha na atualização do cadastro'], 400);
        }
    }

    public static function delete($id)
    {
        $result = CadastroModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Cadastro deletado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar cadastro'], 400);
        }
    }

    public static function getById($id)
    {
        $resultado = CadastroModel::getById($id);
        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Cadastro não encontrado'], 400);
        }
    }

    public static function getAll()
    {
        $resultado = CadastroModel::getAll();
        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhum cadastro encontrado'], 400);
        }
    }
}

?>
