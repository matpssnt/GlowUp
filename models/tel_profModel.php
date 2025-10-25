<?php
require_once __DIR__ . '/../config/database.php';
class TelProfModel {

    public static function create($data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "INSERT INTO tel_prof (id_profissional_fk, id_telefone_fk) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", 
            $data['id_profissional_fk'],
            $data['id_telefone_fk']
        );
        return $stmt->execute();
    }

    public static function update($data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "UPDATE tel_prof SET id_profissional_fk = ?, id_telefone_fk = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", 
            $data['id_profissional_fk'],
            $data['id_telefone_fk'],
        );
        return $stmt->execute();
    }

    public static function delete($id_profissional_fk, $id_telefone_fk) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "DELETE FROM tel_prof WHERE id_profissional_fk = ? AND id_telefone_fk = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $id_profissional_fk, $id_telefone_fk);
        return $stmt->execute();
    }
    
    public static function getAll() {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM tel_prof";
        $result = $conn->query($sql);
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }
}
?>
