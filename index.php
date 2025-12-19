<?php
require_once "config/database.php";
require_once "helpers/response.php";
require_once "helpers/token_jwt.php";

$uri = strtolower(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$pasta = strtolower(basename(dirname(__FILE__)));
$uri = str_replace("/$pasta", "", $uri);
$seguimentos = explode("/", trim($uri, "/"));

$route = $seguimentos[0] ?? null;
$subRoute = $seguimentos[1] ?? null;

// Rotas públicas (não precisam de token)
$rotasPublicas = ['login', 'cadastro', 'home', 'categoria', 'client'];

// Rotas protegidas (exigem autenticação)
$rotasProtegidas = ['agendamento', 'services', 'profissional', 'escala', 'indisponibilidades', 'endereco', 'telefone', 'telprof'];

if ($route !== "api") {
    // Para acesso direto à raiz ou frontend
    require "teste.php";
    exit;
}

if ($route !== "api") {
    jsonResponse(['message' => 'Rota inválida'], 404);
    exit;
}

// Verifica autenticação para rotas protegidas
if (in_array($subRoute, $rotasProtegidas)) {
    validateTokenAPI(); // Agora obrigatório
}

// Rotas públicas ou autenticadas continuam
$rotasValidas = array_merge($rotasPublicas, $rotasProtegidas);

if (in_array($subRoute, $rotasValidas)) {
    require "routes/${subRoute}.php";
} else {
    jsonResponse(['message' => 'Rota não encontrada'], 404);
}
?>