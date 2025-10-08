<?php
require_once __DIR__ . '/../models/ServicesModel.php';

class ServicesController {

    public static function create($conn, $data) {
        $result = ServicesModel::create($conn, $data);
        if ($result) {
            return jsonResponse(['message' => 'serviço criado com sucesso']);
        } else {
            return jsonResponse(['message' => 'erro ao criar serviço'], 400);
        }
    }

    public static function getAll($conn) {
        $services = ServicesModel::getAll($conn);
        return jsonResponse($services);
    }

    public static function getById($conn, $id) {
        $service = ServicesModel::getById($conn, $id);
        if ($service) {
            return jsonResponse($service);
        } else {
            return jsonResponse(['message' => 'serviço não encontrado'], 404);
        }
    }

    public static function delete($conn, $id) {
        $result = ServicesModel::delete($conn, $id);
        if ($result) {
            return jsonResponse(['message' => 'serviço deletado']);
        } else {
            return jsonResponse(['message' => 'erro ao deletar serviço'], 400);
        }
    }

    public static function update($conn, $id, $data) {
        $result = ServicesModel::update($conn, $id, $data);
        if ($result) {
            return jsonResponse(['message' => 'serviço atualizado']);
        } else {
            return jsonResponse(['message' => 'erro ao atualizar serviço'], 400);
        }
    }
}
