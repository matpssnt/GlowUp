<?php
require_once __DIR__ . '/../models/ServicesModel.php';
require_once __DIR__ . '/../helpers/response.php';

class ServicesController {

    public static function create($data) {
        $result = ServicesModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'O serviço criado com sucesso!']);
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
        $result = ServicesModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'O serviço foi deletado!']);
        } else {
            return jsonResponse(['message' => 'Erro ao deletar serviço'], 400);
        }
    }

    public static function update($id, $data) {
        $result = ServicesModel::update($id, $data);
        if ($result) {
            return jsonResponse(['message' => 'Serviço atualizado com sucesso!']);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar serviço'], 400);
        }
    }
}
