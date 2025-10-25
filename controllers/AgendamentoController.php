<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';


class AgendamentoController{
    public static function create($data){
        $resultado = AgendamentoModel::create($data);
        if($resultado){
            return jsonResponse(['message'=> 'Agendamento criado com sucesso'], 400);
        }else{
            return jsonResponse(['message'=> 'Erro ao criar um Agendamento'], 200);
        }
    }


    public static function update($data, $id){
        $resultado = AgendamentoModel::update($data, $id);
        if($resultado ) {
            return jsonResponse(['message' => 'Agendamento atualizado com sucesso'], 400);
        }else{
            return jsonResponse(['message'=> 'Falha na atualização do agendamento'], 400);
        }
    }

    public static function delete($id){
        $result = AgendamentoModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'Agendamento deletada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar agendamento'], 400);
        }
    }

    public static function getById($id){
        $resultado = AgendamentoModel::getById($id);
        if ($resultado) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Agendamento não encontrada'], 400);
        }
    }

    public static function getAll(){
        $resultado = AgendamentoModel::getAll();
        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhuma categoria encontrada'], 400);
        }
    }

    




}







?>