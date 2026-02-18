<?php
require_once __DIR__ . '/../config/database.php';

class ServicesModel {

    public static function create($data) {

        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        
        // Incluído campo duração
        $sql = "INSERT INTO servicos (nome, descricao, preco, duracao, id_profissional_fk, id_categoria_fk)
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        
        $duracao = isset($data['duracao']) ? $data['duracao'] : '00:30:00';

        $stmt->bind_param("ssdsii",
            $data["nome"],
            $data["descricao"],
            $data["preco"],
            $duracao,
            $data["id_profissional_fk"],
            $data["id_categoria_fk"]
        );
        return $stmt->execute();
    }

    public static function getAll() {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        
        $sql = "SELECT s.*, c.nome as categoria_nome 
                FROM servicos s
                LEFT JOIN categorias c ON c.id = s.id_categoria_fk";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public static function getById($id) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT s.*
                FROM servicos s
                WHERE s.id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public static function update($id, $data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        
        // Incluído campo duração
        $sql = "UPDATE servicos
                SET nome = ?, descricao = ?, preco = ?, duracao = ?, id_profissional_fk = ?, id_categoria_fk = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        
        $duracao = isset($data['duracao']) ? $data['duracao'] : '00:30:00';

        $stmt->bind_param("ssdsiii",
            $data["nome"],
            $data["descricao"],
            $data["preco"],
            $duracao,
            $data["id_profissional_fk"],
            $data["id_categoria_fk"],
            $id
        );
        return $stmt->execute();
    }

    public static function delete($id) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        // 1. Remove agendamentos vinculados (Cascade manual)
        $sqlAgendamentos = "DELETE FROM agendamentos WHERE id_servico_fk = ?";
        $stmtA = $conn->prepare($sqlAgendamentos);
        $stmtA->bind_param("i", $id);
        $stmtA->execute();
        $stmtA->close();

        // 2. Remove o serviço
        $sql = "DELETE FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        
        return $stmt->execute();
    }
}
?>
