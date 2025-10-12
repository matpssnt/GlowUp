<?php
require_once __DIR__ . '/../models/EnderecoModel.php';
require_once __DIR__ . '/../helpers/response.php';

class EnderecoController {

    public static function create($data){
        $result = EnderecoModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'Endereço criado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar endereço'], 400);
        }
    }

    public static function update($id, $data){
        $result = EnderecoModel::update($id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Endereço atualizado com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar endereço'], 400);
        }
    }

    public static function delete($id){
        $result = EnderecoModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Endereço deletado com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar endereço'], 400);
        }
    }

    public static function getById($id){
        $endereco = EnderecoModel::getById($id);
        if ($endereco) {
            return jsonResponse($endereco);
        } else {
            return jsonResponse(['message' => 'Endereço não encontrado'], 400);
        }
    }

    public static function getAll(){
        $enderecos = EnderecoModel::getAll();
        if (!empty($enderecos)) {
            return jsonResponse($enderecos);
        } else {
            return jsonResponse(['message' => 'Nenhum endereço encontrado'], 400);
        }
    }
}
?>
