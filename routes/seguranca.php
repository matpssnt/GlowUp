<?php
require_once __DIR__ . '/../controllers/SegurancaController.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$acao = $seguimentos[2] ?? null;

if ($method === 'POST' && $acao === 'trocar-senha') {
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    SegurancaController::trocarSenha($data);
}

jsonResponse(['message' => 'Rota de segurança não encontrada'], 404);
