<?php
require_once __DIR__ . '/../config/database.php';
class ServicesModel {

    public static function create($data) {
        global $conn;
        $sql = "INSERT INTO servicos (nome, descricao, preco, duracao, id_profissional_fk, id_categoria_fk) VALUES (?, ?, ?, ?, ?, ?)";
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
        global $conn;
        $sql = "SELECT * FROM servicos";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public static function getById($id) {
        global $conn;
        $sql = "SELECT * FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public static function update($id, $data) {
        global $conn;
        $sql = "UPDATE servicos SET nome = ?, descricao = ?, preco = ?, duracao = ?, id_profissional_fk = ?, id_categoria_fk = ? WHERE id = ?";
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
        global $conn;
        $sql = "DELETE FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
?>
