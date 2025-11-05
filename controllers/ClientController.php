<?php
    require_once __DIR__ . "/../models/ClientModel.php";
    require_once __DIR__ . '/../helpers/response.php';
    require_once __DIR__ . '/ValidadorController.php';

    class ClientController{
        public static function create($data){
            ValidadorController::validate_data($data, ['nome', 'id_cadastro_fk']);

            $result = ClientModel::create($data);
            if ($result) {
                return jsonResponse(['message'=> 'Cliente criado'], 200);
            }else {
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
                return jsonResponse(['message'=> 'Cliente deletado'], 200);
            }else{
            return jsonResponse(['message'=> 'Falha ao deletar um cliente'], 400);
            }
        }

        public static function update($id, $data){
            $result = ClientModel::update($id, $data);
            if($result){
                return jsonResponse(['message'=> 'Cliente atualizado'], 200);
            }else{
                return jsonResponse(['message'=> 'Falha ao atualizar um cliente'], 400);
            }
        }
}
?>