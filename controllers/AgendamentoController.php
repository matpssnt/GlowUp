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

            // Normaliza data_hora para Y-m-d H:i:00
            $dataHora = self::normalizarDataHora($data['data_hora']);
            $dataObj = new DateTime($dataHora);

            if ($dataObj < new DateTime()) {
                throw new Exception('Não é possível agendar no passado');
            }

            // ─── CHECAGEM GLOW UP ───────────────────────────────
            $dataApenas = $dataObj->format('Y-m-d');
            $slotsDisponiveis = AgendamentoModel::gerarHorariosDisponiveis(
                $dataApenas,
                (int) $data['id_servico_fk']
            );

            if (!in_array($dataHora, $slotsDisponiveis['horarios'], true)) {
                throw new Exception('Horário indisponível. Já foi ocupado ou está fora da escala.');
            }
            // ─────────────────────────────────────────────────────

            // Se chegou aqui → seguro para inserir
            $id = AgendamentoModel::create([
                'data_hora' => $dataHora,
                'id_cliente_fk' => $data['id_cliente_fk'],
                'id_servico_fk' => $data['id_servico_fk'],
                'status' => 'Agendado'
            ]);

            jsonResponse([
                'mensagem' => 'Agendamento criado com sucesso',
                'id' => $id,
                'data_hora' => $dataHora
            ], 201);

        } catch (Exception $e) {
            $code = str_contains($e->getMessage(), 'indisponível') ? 409 : 400;
            jsonResponse(['erro' => $e->getMessage()], $code);
        }
    }

    private static function normalizarDataHora(string $input): string
    {
        $dt = new DateTime($input);
        return $dt->format('Y-m-d H:i:00');
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
        $idProfissional = isset($_GET['id_profissional']) ? (int)$_GET['id_profissional'] : null;
        $idCliente = isset($_GET['id_cliente']) ? (int)$_GET['id_cliente'] : null;
        
        $agendamentos = AgendamentoModel::getAll($idCliente, $idProfissional);
        return jsonResponse($agendamentos, 200);
    }
}
?>