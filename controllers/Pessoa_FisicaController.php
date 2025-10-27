<?php
require_once __DIR__ . '/../models/Pessoa_fisicaModel.php';
require_once __DIR__ . '/../helpers/response.php';

class Pessoa_FisicaController {

    public static function create($data){
        $result = Pessoa_fisicaModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'Pessoa física criada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar pessoa física'], 400);
        }
    }

    public static function update($id, $data){
        $result = Pessoa_fisicaModel::update( $id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Pessoa física atualizada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar pessoa física'], 400);
        }
    }

    public static function delete($id){
        $result = Pessoa_fisicaModel::delete( $id);
        if ($result) {
            return jsonResponse(['message' => 'Pessoa física deletada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar pessoa física'], 400);
        }
    }

    public static function getById($id){
        $pessoa = Pessoa_fisicaModel::getById($id);
        if ($pessoa) {
            return jsonResponse($pessoa);
        } else {
            return jsonResponse(['message' => 'Pessoa física não encontrada'], 400);
        }
    }

    public static function getAll(){
        $pessoas = Pessoa_fisicaModel::getAll();
        if (!empty($pessoas)) {
            return jsonResponse($pessoas);
        } else {
            return jsonResponse(['message' => 'Nenhuma pessoa física encontrada'], 400);
        }
    }
}
?>
