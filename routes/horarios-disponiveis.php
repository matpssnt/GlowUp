<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/../models/EscalaModel.php';
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

// Valida formato da data
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dataEscolhida)) {
    jsonResponse(['message' => 'Data inválida. Use formato YYYY-MM-DD'], 400);
    exit;
}

// 1. Pega o profissional E a duração do serviço
$conn = Database::getInstancia()->pegarConexao();

$sqlServ = "SELECT s.id_profissional_fk, TIME_TO_SEC(s.duracao) / 60 AS duracao_minutos,
            p.nome AS profissional_nome
            FROM servicos s
            LEFT JOIN profissionais p ON p.id = s.id_profissional_fk WHERE s.id = ?";
$stmtServ = $conn->prepare($sqlServ);
$stmtServ->bind_param("i", $idServico);
$stmtServ->execute();
$serv = $stmtServ->get_result()->fetch_assoc();
$stmtServ->close();

if (!$serv) {
    jsonResponse(['message' => 'Serviço não encontrado'], 404);
    exit;
}

$idProfissional = (int) $serv['id_profissional_fk'];
$duracaoMinutos = (int) ($serv['duracao_minutos'] ?? 60);  // default 60min se duracao for NULL
$profissinalNome = $serv['profissional_nome'] ?? 'Profissional não informado';

if ($idProfissional <= 0) {
    jsonResponse(['message' => 'Serviço sem profissional associado'], 400);
    exit;
}

// 2. Dia da semana em número (0=domingo, 6=sabado)
$diaSemanaNum = (int) date('w', strtotime($dataEscolhida));

// 3. Pega TODOS os blocos de escala do dia
$blocosEscala = EscalaModel::getEscalaDoProfissionalNoDia($idProfissional, $diaSemanaNum);

if (empty($blocosEscala)) {
    jsonResponse([
        'message'    => 'Profissional não atende neste dia da semana',
        'dia_numero' => $diaSemanaNum,
        'disponivel' => false,
        'horarios'   => []
    ], 200);
    exit;
}

// 4. Gera slots com duração do serviço (ex: 60min)
$slots = [];
foreach ($blocosEscala as $bloco) {
    $inicio = strtotime($dataEscolhida . ' ' . $bloco['inicio']);
    $fim    = strtotime($dataEscolhida . ' ' . $bloco['fim']);

    while ($inicio + ($duracaoMinutos * 60) <= $fim) {  // + duração garante que o slot caiba inteiro
        $slots[] = date('H:i', $inicio);
        $inicio += $duracaoMinutos * 60;
    }
}

// 5. Remove horários já ocupados
$ocupados = AgendamentoModel::getHorariosOcupados($idProfissional, $dataEscolhida);

$horariosLivres = array_filter($slots, function($hora) use ($ocupados) {
    foreach ($ocupados as $ocup) {
        $horaOcup = date('H:i', strtotime($ocup['data_hora']));
        if ($horaOcup === $hora) {
            return false;
        }
    }
    return true;
});

// Remove duplicatas e reindexa o array
$horariosLivres = array_unique($horariosLivres);
$horariosLivres = array_values($horariosLivres);

jsonResponse([
    'message'       => 'Horários disponíveis encontrados',
    'profissional_nome'=> $profissinalNome,
    'data'          => $dataEscolhida,
    'dia_numero'    => $diaSemanaNum,
    'duracao_servico' => $duracaoMinutos . ' minutos',
    'disponivel'    => !empty($horariosLivres),
    'horarios'      => array_values($horariosLivres)
], 200);