<?php
require_once __DIR__ . '/../models/EscalaModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class EscalaController
{
    public static function create($data)
    {
        // Ajuste: campos corretos da escala recorrente
        ValidadorController::validate_data(
            $data,
            ['hora_inicio', 'hora_fim', 'dia_semana', 'id_profissional_fk']
        );

        // validar formato de hora
        if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['hora_inicio']) ||
            !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['hora_fim'])) {
            return jsonResponse(['message' => 'Formato de hora inválido'], 400);
        }

        if ($data['hora_inicio'] >= $data['hora_fim']) {
            return jsonResponse(['message' => 'Hora inicial deve ser menor que a final'], 400);
        }

        $result = EscalaModel::create($data);

        if ($result) {
            return jsonResponse([
                'message' => 'Escala criada com sucesso'
            ], 201);
        } else {
            return jsonResponse(['message' => 'Erro ao criar escala'], 400);
        }
    }

    public static function update($data, $id)
    {
        ValidadorController::validate_data(
            $data,
            ['hora_inicio', 'hora_fim', 'dia_semana', 'id_profissional_fk', 'ativo']
        );

        if ($data['hora_inicio'] >= $data['hora_fim']) {
            return jsonResponse(['message' => 'Hora inicial deve ser menor que a final'], 400);
        }

        $result = EscalaModel::update($data, $id);

        if ($result) {
            return jsonResponse(['message' => 'Escala atualizada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao atualizar escala'], 400);
        }
    }

    public static function delete($id)
    {
        $result = EscalaModel::delete($id);

        if ($result) {
            return jsonResponse(['message' => 'Escala desativada com sucesso'], 200);
        } else {
            return jsonResponse(['message' => 'Erro ao desativar escala'], 400);
        }
    }

    public static function getById($id)
    {
        $result = EscalaModel::getById($id);

        if ($result) {
            return jsonResponse($result, 200);
        } else {
            return jsonResponse(['message' => 'Escala não encontrada'], 404);
        }
    }

    public static function getAll()
    {
        $result = EscalaModel::getAll();

        if (!empty($result)) {
            return jsonResponse($result, 200);
        } else {
            return jsonResponse(['message' => 'Nenhuma escala encontrada'], 404);
        }
    }
}
?>
