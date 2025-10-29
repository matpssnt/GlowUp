<?php
    require_once __DIR__ . "/../models/ClientModel.php";
    require_once __DIR__ . '/../helpers/response.php';

    class ClientController{
        public static function create($data){
            $result = ClientModel::create($data);
            if($result){
                return jsonResponse(['message'=> 'Cliente criado']);
            }else{
            return jsonResponse(['message'=> 'Falha ao criar um cliente'], 400);
            }
        }
        
        public static function getAll() {
            $clientList = ClientModel::getAll();
            return jsonResponse($clientList);
        }

        public static function getById($id) {
            $result = ClientModel::getById( $id);
            return jsonResponse($result);
        }

        public static function delete($id){
            $result = ClientModel::delete($id);
            if($result){
                return jsonResponse(['message'=> 'cliente deletado']);
            }else{
            return jsonResponse(['message'=> 'falha ao deletar um cliente'], 400);
            }
        }

        public static function update($id, $data){
            $result = ClientModel::update($id, $data);
            if($result){
                return jsonResponse(['message'=> 'cliente atualizado']);
            }else{
                return jsonResponse(['message'=> 'falha ao atualizar um cliente'], 400);
            }
        }
}
?>