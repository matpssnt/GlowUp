<?php
require_once __DIR__ . '/../models/TelefoneModel.php';
require_once __DIR__ . '/../helpers/response.php';

class TelefoneController {

    public static function create($data){
        $result = TelefoneModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'Telefone criado com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar telefone'], 400);
        }
    }

    public static function update($id, $data){
        $result = TelefoneModel::update($id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Telefone atualizado com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar telefone'], 400);
        }
    }

    public static function delete($id){
        $result = TelefoneModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Telefone deletado com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar telefone'], 400);
        }
    }

    public static function getById($id){
        $telefone = TelefoneModel::getById($id);
        if ($telefone) {
            return jsonResponse($telefone);
        } else {
            return jsonResponse(['message' => 'Telefone não encontrado'], 400);
        }
    }

    public static function getAll(){
        $telefones = TelefoneModel::getAll();
        if (!empty($telefones)) {
            return jsonResponse($telefones);
        } else {
            return jsonResponse(['message' => 'Nenhum telefone encontrado'], 400);
        }
    }
}
?>
