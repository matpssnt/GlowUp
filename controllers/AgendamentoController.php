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

        // 1. Validação e Normalização da Data/Hora
        $dataHoraInput = trim($data['data_hora']);
        
        // Se receber apenas HH:MM, assume que é para HOJE (comportamento legado)
        // Se receber YYYY-MM-DD HH:MM:SS ou YYYY-MM-DD HH:MM, usa a data completa
        if (preg_match('/^(\d{2}):(\d{2})$/', $dataHoraInput)) {
            $dataCompleta = date('Y-m-d') . ' ' . $dataHoraInput . ':00';
        } else {
            // Tenta criar um objeto DateTime para validar o formato completo
            try {
                $tempDate = new DateTime($dataHoraInput);
                $dataCompleta = $tempDate->format('Y-m-d H:i:s');
            } catch (Exception $e) {
                return jsonResponse(['message' => 'Formato de data/hora inválido. Use YYYY-MM-DD HH:MM:SS ou HH:MM'], 400);
            }
        }

        error_log("[DEBUG CREATE] Data validada: " . $dataCompleta);

        $dataObj = new DateTime($dataCompleta);
        $agora = new DateTime();
        
        error_log("[DEBUG CREATE] Agora: " . $agora->format('Y-m-d H:i:s') . " | Tentativa: " . $dataObj->format('Y-m-d H:i:s'));
        
        if ($dataObj < $agora) {
            return jsonResponse(['message' => 'Não é possível agendar no passado'], 400);
        }

        // 2. Limite de 3 meses à frente
        $maximoPermitido = (clone $agora)->modify('+3 months');
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