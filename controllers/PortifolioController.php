<?php
require_once __DIR__ . '/../models/PortifolioModel.php';
require_once __DIR__ . '/../helpers/response.php';

class PortifolioController
{
    public static function create($data)
    {
        if (empty($data['imagens']) || empty($data['id_profissional_fk'])) {
            return jsonResponse(['message' => 'Campos obrigatórios não enviados'], 400);
        }

        $resultado = PortifolioModel::create($data);

        if ($resultado) {
            return jsonResponse(['message' => 'Portfólio criado com sucesso'], 201);
        } else {
            return jsonResponse(['message' => 'Erro ao criar portfólio'], 400);
        }
    }

    public static function update($data, $id)
    {
        $resultado = PortifolioModel::update($id, $data);

        if ($resultado) {
            return jsonResponse(['message' => 'Portfólio atualizado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar portfólio'], 400);
        }
    }

    public static function delete($id)
    {
        $resultado = PortifolioModel::delete($id);

        if ($resultado) {
            return jsonResponse(['message' => 'Portfólio deletado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar portfólio'], 400);
        }
    }

    public static function getById($id)
    {
        $resultado = PortifolioModel::getById($id);

        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Portfólio não encontrado'], 404);
        }
    }

    public static function getAll()
    {
        $resultado = PortifolioModel::getAll();

        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhum portfólio encontrado'], 404);
        }
    }
}
?>
