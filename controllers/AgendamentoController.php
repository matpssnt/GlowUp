<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class AgendamentoController
{
    public static function create($data)
{
    try {
        ValidadorController::validate_data(
            $data,
            ['data_hora', 'id_cliente_fk', 'id_servico_fk']
        );

        $input = trim($data['data_hora']);

        // Aceita HH:MM ou Y-m-d H:i (ou Y-m-d H:i:s)
        if (preg_match('/^(\d{4}-\d{2}-\d{2} )?([01]\d|2[0-3]):([0-5]\d)(:\d{2})?$/', $input, $m)) {
            $dataHora = $input;

            // Se só hora, usa hoje
            if (empty($m[1])) {
                $dataHora = date('Y-m-d') . ' ' . $dataHora;
            }

            // Garante segundos
            if (substr_count($dataHora, ':') === 1) {
                $dataHora .= ':00';
            }
        } else {
            return jsonResponse(['message' => 'Formato inválido. Use HH:MM ou Y-m-d HH:MM'], 400);
        }

        error_log("[DEBUG] Data/hora final: $dataHora");

        $dataObj = new DateTime($dataHora);
        $agora = new DateTime();

        if ($dataObj < $agora) {
            return jsonResponse(['message' => 'Não pode agendar no passado'], 400);
        }

        $maximo = (clone $agora)->modify('+3 months')->setTime(23, 59, 59);
        if ($dataObj > $maximo) {
            return jsonResponse(['message' => 'Limite de 3 meses excedido'], 400);
        }

        $payload = $data;
        $payload['data_hora'] = $dataHora;  // passa completa pro Model

        $id = AgendamentoModel::create($payload);

        return jsonResponse([
            'message' => 'Agendamento criado com sucesso',
            'id' => $id
        ], 201);

    } catch (Exception $e) {
        error_log("[ERROR AGENDAMENTO] " . $e->getMessage());
        $code = stripos($e->getMessage(), 'indisponível') !== false ? 409 : 400;
        return jsonResponse(['message' => $e->getMessage()], $code);
    }
}

    public static function update($data, $id)
    {
        try {
            if (!is_numeric($id) || $id <= 0) {
                return jsonResponse(['message' => 'ID de agendamento inválido'], 400);
            }

            $sucesso = AgendamentoModel::update((int) $id, $data);

            if ($sucesso) {
                return jsonResponse(['message' => 'Agendamento atualizado com sucesso'], 200);
            }

            return jsonResponse(['message' => 'Erro ao atualizar agendamento (nenhuma linha afetada)'], 400);

        } catch (Exception $e) {
            error_log("[ERROR UPDATE AGENDAMENTO #$id] " . $e->getMessage());
            return jsonResponse(['message' => $e->getMessage()], 400);
        }
    }

    public static function cancelar($id)
    {
        try {
            if (!is_numeric($id) || $id <= 0) {
                return jsonResponse(['message' => 'ID de agendamento inválido'], 400);
            }

            $sucesso = AgendamentoModel::cancelar((int) $id);

            if ($sucesso) {
                return jsonResponse(['message' => 'Agendamento cancelado com sucesso'], 200);
            }

            return jsonResponse(['message' => 'Erro ao cancelar agendamento (já cancelado ou não encontrado)'], 400);

        } catch (Exception $e) {
            error_log("[ERROR CANCELAR AGENDAMENTO #$id] " . $e->getMessage());
            return jsonResponse(['message' => $e->getMessage()], 400);
        }
    }

    public static function getById($id)
    {
        if (!is_numeric($id) || $id <= 0) {
            return jsonResponse(['message' => 'ID inválido'], 400);
        }

        $agendamento = AgendamentoModel::getById((int) $id);

        if ($agendamento) {
            return jsonResponse($agendamento, 200);
        }

        return jsonResponse(['message' => 'Agendamento não encontrado'], 404);
    }

    public static function getAll()
    {
        $agendamentos = AgendamentoModel::getAll();
        return jsonResponse($agendamentos, 200);
    }
}
?>