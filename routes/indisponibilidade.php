<?php

require_once __DIR__ . '/../controllers/IndisponibilidadeController.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove prefixo /api/indisponibilidades
$uri = preg_replace('#^/api/indisponibilidades#', '', $uri);

// Body JSON
$data = json_decode(file_get_contents('php://input'), true) ?? [];

// CREATE
if ($uri === '' && $method === 'POST') {
    IndisponibilidadeController::create($data);
    exit;
}

// GET BY PROFISSIONAL
if (
    preg_match('#^/profissional/(\d+)$#', $uri, $matches)
    && $method === 'GET'
) {
    IndisponibilidadeController::getByProfissional((int) $matches[1]);
    exit;
}

// DELETE
if (
    preg_match('#^/(\d+)$#', $uri, $matches)
    && $method === 'DELETE'
) {
    IndisponibilidadeController::delete((int) $matches[1]);
    exit;
}

jsonResponse(['message' => 'Rota de indisponibilidade não encontrada'], 404);
