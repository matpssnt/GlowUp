<?php
require_once __DIR__ . '/../config/database.php';

class ProfissionalModel
{

    public static function getAll()
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM profissionais";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public static function getById($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM profissionais WHERE id= ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $conn->begin_transaction();

        try {
            $stmt = $conn->prepare("INSERT INTO profissionais (nome, email, descricao, acessibilidade, isJuridica, id_cadastro_fk) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("sssiii", $data["nome"], $data["email"], $data["descricao"], $data["acessibilidade"], $data["isJuridica"], $data["id_cadastro_fk"]);
            $stmt->execute();
            $idProfissional = $stmt->insert_id;
            $stmt->close();

            if ($data['isJuridica'] == 1) {
                if (empty($data['cnpj'])) {
                    throw new Exception("CNPJ é obrigatório");
                }
                $stmt = $conn->prepare("INSERT INTO juridicos (cnpj, id_profissional_fk) VALUES (?, ?)");
                $stmt->bind_param("si", $data['cnpnj'], $idProfissional);
                $stmt->execute();
                $stmt->close();
            }else{
                if(empty($data['cpf'])){
                    throw new Exception("CPF é obrigatório");
                }
                $stmt = $conn->prepare("INSERT INTO fisicos (cpf, id_profissional_fk) VALUES (?, ?)");
                $stmt->bind_param("si", $data['cpf'], $idProfissional);
                $stmt->execute();
                $stmt->close();
            }
            $conn->commit();
            return true;

        }catch(Exception $error){
            $conn->rollback();
            jsonResponse(['message' => $error->getMessage()], 400);
            return false;
        }
    }

    public static function update($data, $id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "UPDATE profissionais SET nome = ?, email = ? , descricao = ? , acessibilidade = ? , isJuridica = ? , id_cadastro_fk = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssiiii",
            $data["nome"],
            $data["email"],
            $data["descricao"],
            $data["acessibilidade"],
            $data["isJuridica"],
            $data["id_cadastro_fk"],
            $id
        );
        return $stmt->execute();
    }

    public static function delete($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "DELETE FROM profissionais WHERE id= ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public static function clientValidation($email, $password)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT profissionais.id, profissionais.nome, profissionais.email
        FROM profissionais 
        JOIN cadastros ON cadastros.id = profissionais.id_cadastro_fk
        WHERE profissionais.email = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($prof = $result->fetch_assoc()) {
            if (PasswordController::validateHash($password, $prof['senha'])) {
                unset($prof['senha']);
                return $prof;
            }

            return false;

        }
    }

}

?>