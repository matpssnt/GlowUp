<?php

require_once __DIR__ . '/../config/database.php';

class CadastroModel
{

    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "INSERT INTO cadastros (nome, email, senha, isProfissional) 
        VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssi",
            $data["nome"],
            $data["email"],
            $data["senha"],
            $data["isProfissional"]
        );
        $result = $stmt->execute();
        $idCadastro = $stmt->insert_id;
        $stmt->close();
        return $idCadastro;
    }

    public static function delete($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "DELETE FROM cadastros WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function update($id, $data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "UPDATE cadastros SET nome = ?, email = ?, senha = ?, isProfissional = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssii",
            $data["nome"],
            $data["email"],
            $data["senha"],
            $data["isProfissional"],
            $id
        );
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM cadastros WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $result;
    }

    public static function LoginCliente($email, $password)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT c.id, c.nome, c.email, c.senha, cli.id AS cliente_id
                FROM cadastros c
                JOIN clientes cli ON cli.id_cadastro_fk = c.id
                WHERE c.email = ? AND c.isProfissional = 0";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            if (PasswordController::validateHash($password, $user['senha'])) {
                unset($user['senha']);
                return $user;
            }
        }
        return false;
    }

    public static function LoginFuncionario($email, $password)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT c.id, c.nome, c.email, c.senha, p.id AS profissional_id
                FROM cadastros c
                JOIN profissionais p ON p.id_cadastro_fk = c.id
                WHERE c.email = ? AND c.isProfissional = 1";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            if (PasswordController::validateHash($password, $user['senha'])) {
                unset($user['senha']);
                return $user;
            }
        }
        return false;
    }

    public static function getAll()
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM cadastros";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

}

?>