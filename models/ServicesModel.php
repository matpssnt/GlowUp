<?php
class ServicesModel {

    public static function create($conn, $data) {
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

    public static function getAll($conn) {
        $sql = "SELECT * FROM servicos";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public static function getById($conn, $id) {
        $sql = "SELECT * FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public static function update($conn, $id, $data) {
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

    public static function delete($conn, $id) {
        $sql = "DELETE FROM servicos WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
?>
