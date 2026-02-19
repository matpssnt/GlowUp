<?php

require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/ValidadorController.php';
require_once __DIR__ . '/../helpers/response.php';

class AgendamentoController
{
    /**
     * Cria um novo agendamento
     */
    public static function create(): void
    {
        header('Content-Type: application/json; charset=utf-8');

        // Lê o corpo da requisição (raw JSON do Postman ou frontend)
        $rawInput = file_get_contents('php://input');
        $dados = json_decode($rawInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido: ' . json_last_error_msg()]);
            exit;
        }

        if (!is_array($dados) || empty($dados)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Corpo da requisição vazio ou inválido']);
            exit;
        }

        try {
            // Validação obrigatória dos campos (usando seu ValidadorController)
            ValidadorController::validate_data(
                $dados,
                ['data_hora', 'id_cliente_fk', 'id_servico_fk']
            );

            // Normaliza e valida formato de data/hora (lógica mantida)
            $input = trim($dados['data_hora']);

            if (preg_match('/^(\d{4}-\d{2}-\d{2} )?([01]\d|2[0-3]):([0-5]\d)(:\d{2})?$/', $input, $m)) {
                $dataHora = $input;

                // Se só veio hora (ex: "14:30"), adiciona data atual
                if (empty($m[1])) {
                    $dataHora = date('Y-m-d') . ' ' . $dataHora;
                }

                // Garante segundos (:00)
                if (substr_count($dataHora, ':') === 1) {
                    $dataHora .= ':00';
                }
            } else {
                throw new Exception('Formato de data/hora inválido. Use HH:MM ou Y-m-d HH:MM');
            }

            error_log("[DEBUG] Data/hora final para model: $dataHora");

            // Atualiza o array com a data formatada
            $dados['data_hora'] = $dataHora;

            // Chama o model passando o array inteiro
            $resultado = AgendamentoModel::create($dados);

            // Retorna sucesso
            http_response_code(201);
            echo json_encode($resultado);

        } catch (Exception $e) {
            error_log("[ERROR AGENDAMENTO CREATE] " . $e->getMessage());

            $code = 400;
            if (stripos($e->getMessage(), 'indisponível') !== false) {
                $code = 409; // Conflict
            } elseif (stripos($e->getMessage(), 'obrigatório') !== false || stripos($e->getMessage(), 'inválido') !== false) {
                $code = 422; // Unprocessable Entity
            }

            http_response_code($code);
            echo json_encode([
                'success' => false,
                'message' => $e->getMessage()
            ]);
        }
    }

    /**
     * Atualiza um agendamento existente
     *
     * @param array $data Dados a atualizar
     * @param int|string $id ID do agendamento
     */
    public static function update($data, $id): void
    {
        header('Content-Type: application/json; charset=utf-8');

        $id = (int) $id;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de agendamento inválido']);
            exit;
        }

        try {
            $sucesso = AgendamentoModel::update($id, $data);

            if ($sucesso) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Agendamento atualizado com sucesso']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nenhuma alteração realizada (agendamento pode não existir ou dados iguais)']);
            }
        } catch (Exception $e) {
            error_log("[ERROR UPDATE AGENDAMENTO #$id] " . $e->getMessage());
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    /**
     * Cancela um agendamento (soft delete)
     *
     * @param int|string $id ID do agendamento
     */
    public static function cancelar($id): void
    {
        header('Content-Type: application/json; charset=utf-8');

        $id = (int) $id;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de agendamento inválido']);
            exit;
        }

        try {
            $sucesso = AgendamentoModel::cancelar($id);

            if ($sucesso) {
                http_response_code(200);
                echo json_encode(['success' => true, 'message' => 'Agendamento cancelado com sucesso']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado ou já cancelado']);
            }
        } catch (Exception $e) {
            error_log("[ERROR CANCELAR AGENDAMENTO #$id] " . $e->getMessage());
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    /**
     * Busca um agendamento por ID
     *
     * @param int|string $id
     */
    public static function getById($id): void
    {
        header('Content-Type: application/json; charset=utf-8');

        $id = (int) $id;

        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID inválido']);
            exit;
        }

        $agendamento = AgendamentoModel::getById($id);

        if ($agendamento) {
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => $agendamento]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Agendamento não encontrado']);
        }
    }

    /**
     * Lista todos os agendamentos (com filtros opcionais via GET)
     */
    public static function getAll(): void
    {
        header('Content-Type: application/json; charset=utf-8');

        // Filtros opcionais via query string (ex: ?idCliente=1&status=Agendado)
        $idCliente = isset($_GET['idCliente']) ? (int)$_GET['idCliente'] : null;
        $status    = $_GET['status'] ?? null;
        $limit     = (int)($_GET['limit'] ?? 50);
        $offset    = (int)($_GET['offset'] ?? 0);

        $agendamentos = AgendamentoModel::getAll($idCliente, $status, $limit, $offset);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data'    => $agendamentos,
            'count'   => count($agendamentos)
        ]);
    }
}