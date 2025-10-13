<?php
    require_once __DIR__ . "/../models/ClientModel.php";
    require_once "PasswordController.php"; 

    class ClientController{
        public static function create($data){
            $data['senha'] = PasswordController::generateHash($password = $data['senha']);
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
            return jsonResponse(['message'=> ''], 400);
            }
        }

        public static function update($id, $data){
            $result = ClientModel::update($id, $data);
            if($result){
                return jsonResponse(['message'=> 'cliente atualizado']);
            }else{
                return jsonResponse(['message'=> 'deu ruim'], 400);
            }
        }
}
?>