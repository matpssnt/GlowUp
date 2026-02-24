<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['message' => 'Método não permitido'], 405);
    exit;
}

// Parâmetros obrigatórios
$dataEscolhida = $_GET['data'] ?? null;
$idServico     = (int) ($_GET['id_servico_fk'] ?? 0);

if (empty($dataEscolhida) || $idServico <= 0) {
    jsonResponse(['message' => 'Parâmetros obrigatórios: data (YYYY-MM-DD) e id_servico_fk'], 400);
    exit;
}

try {
    // Unificação: Usa a mesma lógica robusta do Model
    $resultado = AgendamentoModel::gerarHorariosDisponiveis($dataEscolhida, $idServico);
    
    // Padronização: Retorna no formato esperado pelo frontend
    jsonResponse([
        'message' => 'Horários disponíveis encontrados',
        'data' => $dataEscolhida,
        'horarios' => $resultado['horarios'],
        'quantidade' => $resultado['quantidade'],
        'tempo_livre_total' => $resultado['tempo_livre_total']
    ], 200);

} catch (Exception $e) {
    error_log("[ERRO HORARIOS] " . $e->getMessage());
    jsonResponse(['message' => 'Erro ao buscar horários: ' . $e->getMessage()], 500);
}