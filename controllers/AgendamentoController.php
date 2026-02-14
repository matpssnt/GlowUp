<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class AgendamentoController
{
    public static function create($data)
    {
        try {
            // 1. Validação básica de campos obrigatórios
            ValidadorController::validate_data(
                $data,
                ['data_hora', 'id_cliente_fk', 'id_servico_fk']
            );

            $hora = trim($data['data_hora']);

            // 2. Formato HH:MM
            if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $hora)) {
                return jsonResponse(['message' => 'Formato de hora inválido (esperado HH:MM)'], 400);
            }

            // 3. Monta data completa (hoje + hora)
            $dataCompleta = date('Y-m-d') . ' ' . $hora . ':00';
            error_log("[DEBUG CREATE] Data montada: " . $dataCompleta);

            $dataObj = new DateTime($dataCompleta);
            $agora = new DateTime();

            error_log("[DEBUG CREATE] Agora: " . $agora->format('Y-m-d H:i:s') . " | Tentativa: " . $dataObj->format('Y-m-d H:i:s'));

            // 4. Não permite passado
            if ($dataObj < $agora) {
                return jsonResponse(['message' => 'Não é possível agendar no passado'], 400);
            }

            // 5. Limite de 3 meses à frente
            $maximoPermitido = (clone $agora)->modify('+3 months');
            $maximoPermitido->setTime(23, 59, 59);

            if ($dataObj > $maximoPermitido) {
                $mensagemDataMax = $maximoPermitido->format('d/m/Y');
                return jsonResponse([
                    'message' => "Não é possível agendar mais de 3 meses à frente. Data limite: $mensagemDataMax"
                ], 400);
            }

            $payload = $data;
            $payload['data_hora'] = $dataCompleta;

            error_log("[DEBUG CREATE] Passou todas validações de entrada → chamando Model");

            $idInserido = AgendamentoModel::create($payload);

            return jsonResponse([
                'message' => 'Agendamento criado com sucesso',
                'id' => $idInserido
            ], 201);

        } catch (Exception $e) {
            error_log("[ERROR CREATE AGENDAMENTO] " . $e->getMessage());
            $status = 400;
            $message = $e->getMessage();

            if (stripos($message, 'indisponível') !== false || stripos($message, 'conflito') !== false) {
                $status = 409;
            }

            return jsonResponse(['message' => $message], $status);
        }
    }

    public static function update($data, $id)
    {
        try {
            if (!is_numeric($id) || $id <= 0) {
                return jsonResponse(['message' => 'ID de agendamento inválido'], 400);
            }

            $sucesso = AgendamentoModel::update((int)$id, $data);

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

            $sucesso = AgendamentoModel::cancelar((int)$id);

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

        $agendamento = AgendamentoModel::getById((int)$id);

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