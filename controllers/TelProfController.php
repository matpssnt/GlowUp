<?php
require_once __DIR__ . '/../models/tel_profModel.php';
require_once __DIR__ . '/../helpers/response.php';

class TelProfController {
    
    public static function create($data){
        $result = TelProfModel::create( $data);
        if ($result) {
            return jsonResponse([   
                'message' => 'Telefone do profissional criada com sucesso',
            ], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao adicionar o telefone do profissional'], 400);
        }
    }

    public static function update($data){
        $result = TelProfModel::delete( $data["id_profissional_fk"], $data["id_telefone_fk"]);

        if ($result) {
            return jsonResponse(['message' => 'Telefone do profissional atualizada com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar telefone-profissional'], 400);
        }
    }

    public static function delete($data){
        $result = TelProfModel::delete( $data["id_profissional_fk"], $data["id_telefone_fk"]);

        if ($result) {
            return jsonResponse(['message' => 'Telefone do profissional deletado com sucesso']);
        } else {
            return jsonResponse(['message' => 'Erro ao deleta telefone-profissional'], 400);
        }
    }

    public static function getAll(){
        $resultado = TelProfModel::getAll();

        if (!empty($resultado)) {
            return jsonResponse($resultado);
        } else {
            return jsonResponse(['message' => 'Nenhuma telefone-profissional encontrada'], 400);
        }
    }
}
?>
