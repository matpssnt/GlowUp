<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = $_GET['data'] ?? null;
    $idServico = $_GET['id_servico_fk'] ?? null;

    if (empty($data) || empty($idServico)) {
        jsonResponse(['message' => 'Parâmetros obrigatórios: data, id_servico_fk'], 400);
    }

    $horarios = AgendamentoModel::gerarHorariosDisponiveis($data, (int) $idServico);
    jsonResponse($horarios, 200);
}

jsonResponse(['message' => 'Método não permitido'], 405);
