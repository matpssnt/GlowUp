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

            // CPF/CNPJ são opcionais na criação, mas obrigatórios na atualização
            if ($data['isJuridica'] == 1) {
                if (!empty($data['cnpj'])) {
                    $stmt = $conn->prepare("INSERT INTO juridicos (cnpj, id_profissional_fk) VALUES (?, ?)");
                    $stmt->bind_param("si", $data['cnpj'], $idProfissional);
                    $stmt->execute();
                    $stmt->close();
                }
            } else {
                if (!empty($data['cpf'])) {
                    $stmt = $conn->prepare("INSERT INTO fisicos (cpf, id_profissional_fk) VALUES (?, ?)");
                    $stmt->bind_param("si", $data['cpf'], $idProfissional);
                    $stmt->execute();
                    $stmt->close();
                }
            }
            $conn->commit();
            return $idProfissional;

        } catch (Exception $error) {
            $conn->rollback();
            error_log("Erro ao criar profissional: " . $error->getMessage());
            return false;
        }
    }
    public static function getByIdCadastro($idCadastro)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT * FROM profissionais WHERE id_cadastro_fk = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $idCadastro);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }

        public static function update($data, $id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        try {
            $conn->begin_transaction();

            $sql = "UPDATE profissionais 
                    SET nome = ?, email = ?, descricao = ?, acessibilidade = ?, isJuridica = ?, id_cadastro_fk = ?
                    WHERE id = ?";
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

            if (!$stmt->execute()) {
                throw new Exception("Falha ao atualizar profissional");
            }

            $novoTipo = intval($data["isJuridica"]);

            $existeFisico = $conn->query("SELECT id FROM fisicos WHERE id_profissional_fk = $id")->num_rows > 0;
            $existeJuridico = $conn->query("SELECT id FROM juridicos WHERE id_profissional_fk = $id")->num_rows > 0;

            if ($novoTipo === 0) {

                if (!empty($data["cpf"])) {
                    if ($existeFisico) {
                        $stmt2 = $conn->prepare("UPDATE fisicos SET cpf = ? WHERE id_profissional_fk = ?");
                        $stmt2->bind_param("si", $data["cpf"], $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao atualizar CPF");
                    } else {
                        $stmt2 = $conn->prepare("INSERT INTO fisicos (cpf, id_profissional_fk) VALUES (?, ?)");
                        $stmt2->bind_param("si", $data["cpf"], $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao criar CPF");
                    }
                }

                if ($existeJuridico) {
                    if (!$conn->query("DELETE FROM juridicos WHERE id_profissional_fk = $id")) {
                        throw new Exception("Falha ao remover CNPJ ao migrar para fisico");
                    }
                }
            }

            if ($novoTipo === 1) {

                if (!empty($data["cnpj"])) {
                    if ($existeJuridico) {
                        $stmt2 = $conn->prepare("UPDATE juridicos SET cnpj = ? WHERE id_profissional_fk = ?");
                        $stmt2->bind_param("si", $data["cnpj"], $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao atualizar CNPJ");
                    } else {
                        $stmt2 = $conn->prepare("INSERT INTO juridicos (cnpj, id_profissional_fk) VALUES (?, ?)");
                        $stmt2->bind_param("si", $data["cnpj"], $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao criar CNPJ");
                    }
                }

                if ($existeFisico) {
                    if (!$conn->query("DELETE FROM fisicos WHERE id_profissional_fk = $id")) {
                        throw new Exception("Falha ao remover CPF ao migrar para juridico");
                    }
                }
            }

            $conn->commit();
            return true;

        } catch (Exception $e) {
            $conn->rollback();
            return false;
        }
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