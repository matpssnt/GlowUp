<?php

require_once __DIR__ . '/../models/ProfissionalModel.php';

class ProfissionalController{
    public static function create($data){
        $resultado = ProfissionalModel::create($data);
        if($resultado){
            return jsonResponse(['message'=> 'Profissional criado com sucesso'], 400);
        }else{
            return jsonResponse(['message'=> 'Erro ao criar um profissional'], 200);
        }
    }


    public static function update($data, $id){
        $resultado = ProfissionalModel::update($data, $id);
        if($resultado ) {
            return jsonResponse(['message' => 'Profissional atualizado com sucesso'], 400);
        }else{
            return jsonResponse(['message'=> 'Falha na atualização do profissional'], 400);
        }
    }

    public static function delete($id){
        $result = ProfissionalModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Profissionais deletada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar um profissional'], 400);
        }
    }

    public static function getById($id){
        $resultado = ProfissionalModel::getById($id);
        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Profissional não encontrada'], 400);
        }
    }

    public static function getAll(){
        $resultado = ProfissionalModel::getAll();
        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhuma profissional encontrada'], 400);
        }
    }

    




}







?>