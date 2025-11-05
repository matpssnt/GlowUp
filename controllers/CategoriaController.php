<?php
require_once __DIR__ . '/../models/CategoriaModel.php';
require_once __DIR__ .'/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class CategoriaController {

    public static function create($data){
        ValidadorController::validate_data($data, ['nome']) ;

        $result = CategoriaModel::create( $data);
        if ($result) {
            return jsonResponse(['message' => 'Categoria criada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar categoria'], 400);
        }
    }

    public static function update($id, $data){
        $result = CategoriaModel::update( $id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Categoria atualizada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar categoria'], 400);
        }
    }

    public static function delete($id){
        $result = CategoriaModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Categoria deletada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar categoria'], 400);
        }
    }

    public static function getById($id){
        $categoria = CategoriaModel::getById($id);
        if ($categoria) {
            return jsonResponse($categoria);
        } else {
            return jsonResponse(['message' => 'Categoria não encontrada'], 400);
        }
    }

    public static function getAll(){
        $categorias = CategoriaModel::getAll();
        if (!empty($categorias)) {
            return jsonResponse($categorias);
        } else {
            return jsonResponse(['message' => 'Nenhuma categoria encontrada'], 400);
        }
    }
}
?>
