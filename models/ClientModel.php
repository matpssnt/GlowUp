<?php
require_once __DIR__ . '/../config/database.php';

class ClientModel {

    public static function getAll() {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM clientes";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public static function getById($id) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM clientes WHERE id= ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public static function create($data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "INSERT INTO clientes (nome, id_cadastro_fk, id_telefone_fk) VALUES (?, ?, ?);";
        $stat = $conn->prepare($sql);
        $stat->bind_param("sii", 
            $data["nome"],
            $data["id_cadastro_fk"],
            $data["id_telefone_fk"]
        );
        return $stat->execute();
    }

    public static function update($id, $data) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "UPDATE clientes SET nome = ?, id_cadastro_fk = ?, id_telefone_fk = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("siii",
            $data["nome"],
            $data["id_cadastro_fk"],
            $data["id_telefone_fk"],
            $id
        );
        return $stmt->execute();
    }

    public static function delete($id) {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "DELETE FROM clientes WHERE id= ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public static function clientValidation($email, $password) {
        
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT clientes.id, clientes.nome, clientes.email, clientes.senha

        FROM clientes 
        JOIN cargos ON cargos.id = clientes.cargo_id
        WHERE clientes.email = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if($client = $result->fetch_assoc()) {
            if(PasswordController::validateHash($password, $client['senha'])) {
                unset($client['senha']);
                return $client;  
            }

        return false;
        
        }
    }
}

?>