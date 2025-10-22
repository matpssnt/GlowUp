<?php
require_once __DIR__ . '/../models/ServicesModel.php';
require_once __DIR__ . '/../helpers/response.php';

class ServicesController {

    public static function create($data) {
        $result = ServicesModel::create($data);
        if ($result) {
            return jsonResponse(['message' => 'serviço criado com sucesso']);
        } else {
            return jsonResponse(['message' => 'erro ao criar serviço'], 400);
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
            return jsonResponse(['message' => 'serviço não encontrado'], 404);
        }
    }

    public static function delete($id) {
        $result = ServicesModel::delete($id);
        if ($result) {
            return jsonResponse(['message' => 'serviço deletado']);
        } else {
            return jsonResponse(['message' => 'erro ao deletar serviço'], 400);
        }
    }

    public static function update($id, $data) {
        $result = ServicesModel::update($id, $data);
        if ($result) {
            return jsonResponse(['message' => 'serviço atualizado']);
        } else {
            return jsonResponse(['message' => 'erro ao atualizar serviço'], 400);
        }
    }
}
