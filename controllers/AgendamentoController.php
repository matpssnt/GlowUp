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

        $hora = trim($data['data_hora']);


        if (!preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $hora)) {
            return jsonResponse(['message' => 'Formato de hora inválido (esperado HH:MM)'], 400);
        }

        $dataCompleta = date('Y-m-d') . ' ' . $hora . ':00';
        error_log("[DEBUG CREATE] Data montada: " . $dataCompleta);

        $dataObj = new DateTime($dataCompleta);
        $agora = new DateTime();
        error_log("[DEBUG CREATE] Agora: " . $agora->format('Y-m-d H:i:s') . " | Tentativa: " . $dataObj->format('Y-m-d H:i:s'));
        if ($dataObj < $agora) {
            return jsonResponse(['message' => 'Não é possível agendar no passado'], 400);
        }

        // 2. Limite de 3 meses à frente
        $maximoPermitido = (clone $agora)->modify('+3 months');
        // Ajuste para incluir o dia inteiro do último dia permitido
        $maximoPermitido->setTime(23, 59, 59);

        if ($dataObj > $maximoPermitido) {
            $mensagemDataMax = $maximoPermitido->format('d/m/Y');
            return jsonResponse([
                'message' => "Não é possível agendar mais de 3 meses à frente. Data limite: $mensagemDataMax"
            ], 400);
        }

        $data['data_hora'] = $dataCompleta;
        error_log("[DEBUG CREATE] Passou validações de data, chamando Model");
        $resultado = AgendamentoModel::create($data);

        if ($resultado['success']) {
            return jsonResponse(['message' => $resultado['message']], 201);
        } else {
            return jsonResponse(['message' => $resultado['message']], 400);
        }
    }

    public static function update($data, $id)
    {
        // Se update for apenas status (cancelamento/confirmacao), passamos direto
        // Se haver mudança de horário, precisaríamos revalidar disponibilidades

        $resultado = AgendamentoModel::update($id, $data);

        if ($resultado) {
            return jsonResponse(['message' => 'Agendamento atualizado com sucesso'], 200);
        }
        return jsonResponse(['message' => 'Erro ao atualizar agendamento'], 400);
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