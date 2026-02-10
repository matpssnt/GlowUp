<?php
require_once __DIR__ . '/../models/ServicesModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class ServicesController {

    public static function create($data) {
        ValidadorController::validate_data($data, ['nome', 'descricao', 'preco', 'id_profissional_fk', 'id_categoria_fk']);
        $result = ServicesModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'O serviço criado com sucesso!'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao criar serviço'], 400);
        }
    }

    public static function getAll() {
        $services = ServicesModel::getAll();
        return jsonResponse($services);
    }

    public static function getById($id) {
        $service = ServicesModel::getById($id);
        if ($service) {
            return jsonResponse($service);
        } else {
            return jsonResponse(['message' => 'Serviço não encontrado!'], 404);
        }
    }

    public static function delete($id) {
        try {
            $result = ServicesModel::delete($id);
            if ($result) {
                return jsonResponse(['message' => 'O serviço foi deletado!'], 200);
            } else {
                return jsonResponse(['message' => 'Erro ao deletar serviço'], 400);
            }
        } catch (Exception $e) {
             return jsonResponse(['message' => $e->getMessage()], 400);
        }
    }

    public static function update($id, $data) {
        $result = ServicesModel::update($id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Serviço atualizado com sucesso!'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar serviço'], 400);
        }
    }
}
