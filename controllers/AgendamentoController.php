<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class AgendamentoController
{
    public static function create($data)
    {
        ValidadorController::validate_data(
            $data,
            ['data_hora', 'id_cliente_fk', 'id_servico_fk']
        );

        $dataHora = ValidadorController::validateDateTime($data['data_hora']);
        if (!$dataHora) {
            return jsonResponse(['message' => 'Formato de data/hora inválido'], 400);
        }

        // Verifica se é data futura
        if (strtotime($dataHora) < time()) {
            return jsonResponse(['message' => 'Não é possível agendar no passado'], 400);
        }

        $data['data_hora'] = $dataHora;

        $resultado = AgendamentoModel::create($data);

        if ($resultado['success']) {
            return jsonResponse(['message' => $resultado['message']], 201);
        } else {
            return jsonResponse(['message' => $resultado['message']], 400);
        }
    }

    public static function update($data, $id)
    {
        // Implementação original, adicione validações semelhantes se necessário
    }

    public static function cancelar($id)
    {
        if (AgendamentoModel::cancelar($id)) {
            return jsonResponse(['message' => 'Agendamento cancelado com sucesso'], 200);
        }
        return jsonResponse(['message' => 'Erro ao cancelar agendamento'], 400);
    }

    public static function getById($id)
    {
        $resultado = AgendamentoModel::getById($id);

        if ($resultado) {
            return jsonResponse($resultado, 200);
        }

        return jsonResponse(
            ['message' => 'Agendamento não encontrado'],
            404
        );
    }

    public static function getAll()
    {
        return jsonResponse(
            AgendamentoModel::getAll(),
            200
        );
    }
}
?>