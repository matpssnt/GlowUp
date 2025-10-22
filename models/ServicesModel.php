<?php
require_once __DIR__ . '/../config/database.php';

class ServicesModel {

    public static function create($data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        
        $sql = "INSERT INTO servicos (nome, descricao, preco, duracao, id_profissional_fk, id_categoria_fk)
                VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssdsii",
            $data["nome"],
            $data["descricao"],
            $data["preco"],
            $data["duracao"],  
            $data["id_profissional_fk"],
            $data["id_categoria_fk"]
        );
        return $stmt->execute();
    }

    public static function getAll() {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        
        $sql = "SELECT * FROM servicos";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public static function getById($id) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT * FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public static function update($id, $data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "UPDATE servicos
                SET nome = ?, descricao = ?, preco = ?, duracao = ?, id_profissional_fk = ?, id_categoria_fk = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssdsiii",
            $data["nome"],
            $data["descricao"],
            $data["preco"],
            $data["duracao"],
            $data["id_profissional_fk"],
            $data["id_categoria_fk"],
            $id
        );
        return $stmt->execute();
    }

    public static function delete($id) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "DELETE FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
?>
