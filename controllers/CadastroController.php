<?php
require_once __DIR__ . '/../models/CadastroModel.php';


class AgendamentoController{
    public static function create($data){
        $resultado = CadastroModel::create($data);
        if($resultado){
            return jsonResponse(['message'=> 'Cadastro criado com sucesso'], 400);
        }else{
            return jsonResponse(['message'=> 'Erro ao criar um Agendamento'], 200);
        }
    }


    public static function update($data, $id){
        $resultado = CadastroModel::update($data, $id);
        if($resultado ) {
            return jsonResponse(['message' => 'Cadastro atualizado com sucesso'], 400);
        }else{
            return jsonResponse(['message'=> 'Falha na atualização do cadastro'], 400);
        }
    }

    public static function delete($id){
        $result = CadastroModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Cadastro deletada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar cadastro'], 400);
        }
    }

    public static function getById($id){
        $resultado = CadastroModel::getById($id);
        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Cadastro não encontrada'], 400);
        }
    }

    public static function getAll(){
        $resultado = CadastroModel::getAll();
        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhuma cadastro encontrada'], 400);
        }
    }

    




}







?>