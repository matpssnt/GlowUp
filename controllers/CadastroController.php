<?php

require_once __DIR__ . '/../models/CadastroModel.php';
require_once __DIR__ . '/../controllers/PasswordController.php';
require_once __DIR__ . '/../controllers/ValidadorController.php';


class CadastroController{
    public static function create($data){

        ValidadorController::validate_data($data, ["nome", "email", "senha", "isProfissional"]);
        $data['senha'] = PasswordController::generateHash($data['senha']);

        $resultado = CadastroModel::create($data);
        if($resultado){
            return jsonResponse(['message'=> 'Cadastro criado com sucesso'], 200);
        }else{
            return jsonResponse(['message'=> 'Erro ao criar um cadastro'], 400);
        }
    }


    public static function update($data, $id){
        $resultado = CadastroModel::update($data, $id);
        if($resultado ) {
            return jsonResponse(['message' => 'Cadastro atualizado com sucesso'], 200);
        }else{
            return jsonResponse(['message'=> 'Falha na atualização do cadastro'], 400);
        }
    }

    public static function delete($id){
        $result = CadastroModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Cadastro deletada com sucesso'], 200);
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