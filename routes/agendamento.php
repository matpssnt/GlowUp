<?php
require_once __DIR__ . '/../controllers/AgendamentoController.php';
require_once __DIR__ . '/../models/AgendamentoModel.php';   // ← importante!
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Pega o restante da URL depois de /api/agendamento
// Ex: /api/agendamento/disponibilidade → subPath = disponibilidade
$fullPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/agendamento', $fullPath, 2);
$subPath = trim($parts[1] ?? '', '/');

if ($subPath === 'disponibilidade') {

    if ($method !== 'GET') {
        jsonResponse(['erro' => 'Método não permitido para disponibilidade'], 405);
        exit;
    }

    $data = $_GET['data'] ?? null;
    $idServico = (int)($_GET['id_servico'] ?? 0);

    if (!$data || $idServico <= 0) {
        jsonResponse([
            'erro' => 'Parâmetros obrigatórios: ?data=YYYY-MM-DD&id_servico=ID'
        ], 400);
        exit;
    }

    try {
        // Chama a função que gera os horários e retorna também os dados extras
        $resultado = AgendamentoModel::gerarHorariosDisponiveis($data, $idServico);

        // Extrai os campos do retorno (agora é array associativo)
        $horarios       = $resultado['horarios'] ?? [];
        $quantidade     = $resultado['quantidade'] ?? 0;
        $tempoLivre     = $resultado['tempo_livre_total'] ?? [
            'minutos_totais' => 0,
            'horas'          => 0,
            'minutos'        => 0,
            'formatado'      => '0min livres'
        ];

        jsonResponse([
            'data'                  => $data,
            'id_servico'            => $idServico,
            'horarios'              => $horarios,
            'quantidade'            => $quantidade,
            'tempo_livre_total'     => $tempoLivre,
            'gerado_em'             => date('Y-m-d H:i:s')
        ]);
    } catch (Exception $e) {
        error_log("[ERRO DISPONIBILIDADE] " . $e->getMessage());
        jsonResponse([
            'erro' => 'Falha ao calcular horários disponíveis: ' . $e->getMessage()
        ], 500);
    }

    exit;
}

// ─── Fluxo normal de agendamentos (GET/POST/PUT/DELETE) ───
$id = null;
if (isset($_GET['id']) && is_numeric($_GET['id'])) {
    $id = (int)$_GET['id'];
} elseif (in_array($method, ['PUT','DELETE','PATCH'])) {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $id = $body['id'] ?? null;
    $id = is_numeric($id) ? (int)$id : null;
}

switch ($method) {
    case 'GET':
        if ($id) {
            AgendamentoController::getById($id);
        } else {
            AgendamentoController::getAll();
        }
        break;

    case 'POST':
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        error_log("[DEBUG] POST agendamento → " . json_encode($body));
        AgendamentoController::create($body);
        break;

    case 'PUT':
    case 'PATCH':
        if (!$id) {
            jsonResponse(['erro' => 'ID obrigatório para atualização'], 400);
            exit;
        }
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        AgendamentoController::update($body, $id);
        break;

    case 'DELETE':
        if (!$id) {
            jsonResponse(['erro' => 'ID obrigatório para cancelamento'], 400);
            exit;
        }
        AgendamentoController::cancelar($id);
        break;

    default:
        jsonResponse(['erro' => 'Método não permitido'], 405);
}