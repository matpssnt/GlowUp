<?php
require_once __DIR__ . '/../config/database.php';

class AgendamentoModel
{
    // Constantes para status
    const STATUS_AGENDADO = 'Agendado';
    const STATUS_CANCELADO = 'Cancelado';
    const STATUS_CONFIRMADO = 'Concluido';

    /**
     * @param array $data: ['data_hora' => 'Y-m-d H:i:s', 'id_cliente_fk' => int, 'id_servico_fk' => int]
     * @return int|false ID inserido ou false em erro
     * @throws Exception em conflitos/validações
     */
    /**
     * Cria um novo agendamento com todas as validações necessárias
     * 
     * @param array $data Deve conter: 'data_hora' (Y-m-d H:i:s), 'id_cliente_fk', 'id_servico_fk'
     * @return array ['success' => bool, 'id' => int|null, 'message' => string]
     * @throws Exception em casos de erro grave ou validação falha
     */
    /**
     * Cria um novo agendamento (sem duplicar id_profissional_fk)
     */
    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        // 1. Validação básica
        if (!isset($data['id_cliente_fk'], $data['id_servico_fk'], $data['data_hora'])) {
            throw new Exception('Campos obrigatórios ausentes');
        }

        $idCliente = (int) $data['id_cliente_fk'];
        $idServico = (int) $data['id_servico_fk'];
        $dataHora = trim($data['data_hora']);

        // 2. Valida formato e data futura
        date_default_timezone_set('America/Sao_Paulo');
        if (!DateTime::createFromFormat('Y-m-d H:i:s', $dataHora)) {
            throw new Exception('Formato de data/hora inválido (use Y-m-d H:i:s)');
        }
        if (strtotime($dataHora) < time()) {
            throw new Exception('Não é permitido agendar para o passado');
        }

        // 3. Valida cliente
        self::validarCliente($idCliente, $conn);

        // 4. Valida serviço e pega o id_profissional_fk (só pra checar conflitos)
        $servico = self::validarServico($idServico, $conn);
        $idProfissional = (int) ($servico['id_profissional_fk'] ?? 0);

        if ($idProfissional <= 0) {
            throw new Exception('Este serviço não está associado a nenhum profissional');
        }

        // 5. Checa conflitos usando o profissional do serviço
        $conflitos = self::checagemConflitos($idProfissional, $dataHora, $conn);
        if ($conflitos > 0) {
            throw new Exception('Horário indisponível: profissional já tem agendamento próximo');
        }

        // 6. INSERT (sem id_profissional_fk na tabela!)
        $sql = "INSERT INTO agendamentos 
            (data_hora, status, id_cliente_fk, id_servico_fk) 
            VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare INSERT] " . $conn->error);
            throw new Exception('Erro interno ao preparar agendamento');
        }

        $statusInicial = self::STATUS_AGENDADO;
        $stmt->bind_param("ssii", $dataHora, $statusInicial, $idCliente, $idServico);

        if (!$stmt->execute()) {
            $erro = $stmt->error;
            $stmt->close();
            throw new Exception('Falha ao salvar agendamento: ' . $erro);
        }

        $idInserido = (int) $conn->insert_id;
        $stmt->close();

        error_log("[SUCESSO] Agendamento ID $idInserido criado para cliente $idCliente, serviço $idServico");

        return [
            'success' => true,
            'id' => $idInserido,
            'message' => 'Agendamento criado com sucesso'
        ];
    }
    /**
     * Atualiza agendamento (ex: status, data)
     * @param int $id
     * @param array $data
     * @return bool
     */
    public static function update($id, $data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        if (empty($data)) {
            return false;
        }

        $sql = "UPDATE agendamentos SET ";
        $params = [];
        $types = "";

        foreach ($data as $key => $value) {
            $sql .= "$key = ?, ";
            $params[] = $value;
            $types .= "s";
        }
        $sql = rtrim($sql, ", ") . " WHERE id = ?";
        $params[] = $id;
        $types .= "i";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);

        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    /**
     * Cancela agendamento (soft-delete: atualiza status)
     * @param int $id
     * @return bool
     */
    public static function cancelar($id)
    {
        $data = ['status' => strtolower(self::STATUS_CANCELADO)];
        $sucesso = self::update($id, $data);
        if($sucesso) { 
            error_log("[CANCEL OK] ID $id -> status = 'cancelado'");
        }else{
            error_log("[CANCEL FALHA] ID $id não mudou");
        }
        return self::update($id, $data);
    }

    /**
     * Busca por ID
     * @param int $id
     * @return array|false
     */
    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM agendamentos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $result ?: false;
    }

    /**
     * Busca todos (com filtro opcional por cliente para privacidade)
     * @param int|null $idCliente
     * @return array
     */
    public static function getAll($idCliente = null)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM agendamentos";
        if ($idCliente) {
            $sql .= " WHERE id_cliente_fk = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $idCliente);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $conn->query($sql);
        }
        $rows = $result->fetch_all(MYSQLI_ASSOC);
        return $rows ?: [];
    }

    /**
     * Valida se cliente existe
     * @throws Exception se não
     */
    private static function validarCliente($id, $conn)
    {
        $sql = "SELECT id FROM clientes WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare validarCliente] SQL: $sql | MySQL Error: " . $conn->error);
            throw new Exception('Erro interno ao validar cliente: ' . $conn->error);
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$result) {
            throw new Exception('Cliente não encontrado');
        }
        return $result;
    }

    /**
     * Valida se serviço existe e retorna dados (inclui prof)
     * @throws Exception se não
     */
    private static function validarServico($id, $conn)
    {
        $sql = "SELECT * FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("[ERRO prepare validarServico] SQL: $sql | MySQL Error: " . $conn->error);
            throw new Exception('Erro interno ao validar serviço: ' . $conn->error);
        }
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$result) {
            throw new Exception('Serviço não encontrado');
        }
        return $result;
    }
/**
 * Checa conflitos de horário (janela de 1h) usando JOIN com servicos
 * @return int COUNT de conflitos
 */
private static function checagemConflitos($idProfissional, $dataHora, $conn)
{
    $data = date('Y-m-d', strtotime($dataHora));
    $horaInicio = date('Y-m-d H:i:s', strtotime($dataHora . ' -30 minutes'));
    $horaFim    = date('Y-m-d H:i:s', strtotime($dataHora . ' +30 minutes'));

    $sql = "
        SELECT COUNT(*) as count 
        FROM agendamentos a
        INNER JOIN servicos s ON a.id_servico_fk = s.id
        WHERE s.id_profissional_fk = ?
        AND DATE(a.data_hora) = ?
        AND a.data_hora BETWEEN ? AND ?
        AND a.status != ?
    ";

    $statusExcluido = self::STATUS_CANCELADO;

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        error_log("[ERRO prepare checagemConflitos com JOIN] SQL: $sql | Erro: " . $conn->error);
        throw new Exception('Erro interno ao preparar checagem de conflitos');
    }

    $stmt->bind_param("isssi", $idProfissional, $data, $horaInicio, $horaFim, $statusExcluido);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return (int) ($row['count'] ?? 0);
}
}
?>