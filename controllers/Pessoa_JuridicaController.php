<?php
require_once __DIR__ . '/../models/Pessoa_juridicaModel.php';
require_once __DIR__ . '/../helpers/response.php';

class PessoaJuridicaController {

    public static function create($data){
        $result = Pessoa_juridicaModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'Pessoa jurídica criada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar pessoa jurídica'], 400);
        }
    }

    public static function update($id, $data){
        $result = Pessoa_juridicaModel::update($id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Pessoa jurídica atualizada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar pessoa jurídica'], 400);
        }
    }

    public static function delete($id){
        $result = Pessoa_juridicaModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Pessoa jurídica deletada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar pessoa jurídica'], 400);
        }
    }

    public static function getById($id){
        $pessoa = Pessoa_juridicaModel::getById($id);
        if ($pessoa) {
            return jsonResponse($pessoa);
        } else {
            return jsonResponse(['message' => 'Pessoa jurídica não encontrada'], 400);
        }
    }

    public static function getAll(){
        $pessoas = Pessoa_juridicaModel::getAll();
        if (!empty($pessoas)) {
            return jsonResponse($pessoas);
        } else {
            return jsonResponse(['message' => 'Nenhuma pessoa jurídica encontrada'], 400);
        }
    }
}
?>
