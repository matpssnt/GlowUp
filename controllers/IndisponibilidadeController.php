<?php
require_once __DIR__ . '/../models/IndisponibilidadeModel.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/ValidadorController.php';

class IndisponibilidadeController
{
    public static function create($data)
    {
        ValidadorController::validate_data(
            $data,
            ['id_profissional_fk', 'data', 'tipo']
        );

        // hora_inicio e hora_fim são opcionais
        $data['hora_inicio'] = $data['hora_inicio'] ?? null;
        $data['hora_fim'] = $data['hora_fim'] ?? null;
        $data['motivo'] = $data['motivo'] ?? null;

        if (
            $data['hora_inicio'] &&
            $data['hora_fim'] &&
            $data['hora_inicio'] >= $data['hora_fim']
        ) {
            return jsonResponse(
                ['message' => 'Hora inicial deve ser menor que a final'],
                400
            );
        }

        if (!in_array($data['tipo'], ['FERIAS', 'FERIADO', 'BLOQUEIO'])) {
            return jsonResponse(['message' => 'Tipo inválido'], 400);
        }


        $result = IndisponibilidadeModel::create($data);

        if ($result) {
            return jsonResponse(
                ['message' => 'Indisponibilidade criada com sucesso'],
                201
            );
        } else {
            return jsonResponse(
                ['message' => 'Erro ao criar indisponibilidade'],
                400
            );
        }
    }

    public static function delete($id)
    {
        $result = IndisponibilidadeModel::delete($id);

        if ($result) {
            return jsonResponse(
                ['message' => 'Indisponibilidade removida'],
                200
            );
        } else {
            return jsonResponse(
                ['message' => 'Erro ao remover indisponibilidade'],
                400
            );
        }
    }

    public static function getByProfissional($idProfissional)
    {
        $result = IndisponibilidadeModel::getByProfissional($idProfissional);
        return jsonResponse($result, 200);
    }
}
