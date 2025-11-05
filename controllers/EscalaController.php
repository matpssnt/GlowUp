<?php
require_once __DIR__ . '/../models/EscalaModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';
class EscalaController
{
    public static function create($data)
    {
        ValidadorController::validate_data($data, ['inicio', 'fim', 'dia_semana', 'id_profissional_fk']);
        
        $result = EscalaModel::create($data);

        if ($result) {
            return jsonResponse([
                'message' => 'Escala criada com sucesso',
            ], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar telefone-profissional'], 400);
        }
    }
    public static function update($data, $id) {
        $result = EscalaModel::update($data, $id);

        if ($result) {
            return jsonResponse(['message' => 'Escala atualizada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar escala'], 400);
        }
    }

    public static function delete($id){
        $result = EscalaModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Escala deletado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar escala'], 400);
        }
    }

    public static function getById($id){
        $result = EscalaModel::getById( $id);
        if ($result) {
            return jsonResponse($result);
        } else {
            return jsonResponse(['message' => 'Escala não encontrado'], 400);
        }
    }

    public static function getAll(){
        $result = EscalaModel::getAll();
        if (!empty($result)) {
            return jsonResponse($result);
        } else {
            return jsonResponse(['message' => 'Nenhum escala encontrado'], 400);
        }
    }
}
?>