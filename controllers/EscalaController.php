<?php
require_once __DIR__ . '/../models/EscalaModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class EscalaController
{
    public static function create(array $data): void
    {
        ValidadorController::validate_data(
            $data,
            ['hora_inicio', 'hora_fim', 'dia_semana', 'id_profissional_fk']
        );

        if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['hora_inicio']) ||
            !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['hora_fim'])) {
            jsonResponse(['message' => 'Formato de hora inválido'], 400);
            return;
        }

        if ($data['hora_inicio'] >= $data['hora_fim']) {
            jsonResponse(['message' => 'Hora inicial deve ser menor que a final'], 400);
            return;
        }

        try {
            $result = EscalaModel::create($data);
            jsonResponse(['message' => 'Escala criada com sucesso'], 201);
        } catch (Exception $e) {
            jsonResponse(['message' => $e->getMessage()], 400);
        }
    }

    public static function update(array $data, int $id): void
    {
        ValidadorController::validate_data(
            $data,
            ['hora_inicio', 'hora_fim', 'dia_semana', 'id_profissional_fk']
        );

        if (!preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['hora_inicio']) ||
            !preg_match('/^\d{2}:\d{2}(:\d{2})?$/', $data['hora_fim'])) {
            jsonResponse(['message' => 'Formato de hora inválido'], 400);
            return;
        }

        if ($data['hora_inicio'] >= $data['hora_fim']) {
            jsonResponse(['message' => 'Hora inicial deve ser menor que a final'], 400);
            return;
        }

        try {
            $result = EscalaModel::update($data, $id);
            if ($result) {
                jsonResponse(['message' => 'Escala atualizada com sucesso'], 200);
            } else {
                jsonResponse(['message' => 'Erro ao atualizar escala'], 400);
            }
        } catch (Exception $e) {
            jsonResponse(['message' => $e->getMessage()], 400);
        }
    }

    public static function delete(int $id): void
    {
        $result = EscalaModel::delete($id);

        if ($result) {
            jsonResponse(['message' => 'Escala removida com sucesso'], 200);
        } else {
            jsonResponse(['message' => 'Erro ao remover escala'], 400);
        }
    }

    public static function getById(int $id): void
    {
        $result = EscalaModel::getById($id);

        if ($result) {
            jsonResponse($result, 200);
        } else {
            jsonResponse(['message' => 'Escala não encontrada'], 404);
        }
    }

    public static function getAll(): void
    {
        $result = EscalaModel::getAll();

        if (!empty($result)) {
            jsonResponse($result, 200);
        } else {
            jsonResponse(['message' => 'Nenhuma escala encontrada'], 404);
        }
    }
}