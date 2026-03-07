<?php
require_once __DIR__ . '/../models/ServicesModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class ServicesController {

    public static function create($data) {
        ValidadorController::validate_data($data, ['nome', 'descricao', 'preco', 'id_profissional_fk', 'id_categoria_fk']);
        $id = ServicesModel::create($data);
        if ($id) {
            return jsonResponse(['message' => 'O serviço foi criado com sucesso!', 'id' => (int) $id, 'idServico' => (int) $id], 201);
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

    public static function uploadFoto($id) {
        if (!$id || !is_numeric($id)) {
            return jsonResponse(['message' => 'ID do serviço inválido'], 400);
        }
        if (!isset($_FILES['foto'])) {
            return jsonResponse(['message' => 'Nenhuma imagem enviada'], 400);
        }
        $arquivo = $_FILES['foto'];
        $permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!in_array($arquivo['type'], $permitidos)) {
            return jsonResponse(['message' => 'Formato inválido. Use PNG, JPG ou WebP.'], 400);
        }
        if ($arquivo['size'] > 5 * 1024 * 1024) {
            return jsonResponse(['message' => 'Imagem muito grande (máx 5MB)'], 400);
        }
        $ext = pathinfo($arquivo['name'], PATHINFO_EXTENSION);
        $nomeArquivo = uniqid() . '.' . $ext;
        $dir = 'uploads/servicos';
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        $caminho = $dir . '/' . $nomeArquivo;
        if (move_uploaded_file($arquivo['tmp_name'], $caminho)) {
            $result = ServicesModel::atualizarFoto($id, $caminho);
            if (!$result) {
                @unlink($caminho);
                return jsonResponse(['message' => 'Falha ao salvar caminho no banco'], 500);
            }
            return jsonResponse(['message' => 'Foto do serviço atualizada com sucesso', 'url' => $caminho], 200);
        }
        return jsonResponse(['message' => 'Erro ao fazer upload'], 400);
    }
}
