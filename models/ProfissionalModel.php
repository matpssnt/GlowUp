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
        $sql = "SELECT * FROM profissionais WHERE id = ?";
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
            if (!$stmt) {
                throw new Exception("Falha ao preparar SQL: " . $conn->error);
            }
            $stmt->bind_param("sssiii", $data["nome"], $data["email"], $data["descricao"], $data["acessibilidade"], $data["isJuridica"], $data["id_cadastro_fk"]);
            
            if (!$stmt->execute()) {
                throw new Exception("Falha ao executar insert: " . $stmt->error);
            }

            $idProfissional = $stmt->insert_id;
            $stmt->close();

            // Pega o ID caso o insert_id falhe mas o execute tenha funcionado (raro em AI)
            if (!$idProfissional) {
                throw new Exception("Não foi possível obter o ID gerado para o profissional.");
            }

            // CPF/CNPJ são opcionais na criação, mas obrigatórios na atualização
            if ($data['isJuridica'] == 1) {
                if (!empty($data['cnpj'])) {
                    $stmt = $conn->prepare("INSERT INTO juridicos (cnpj, id_profissional_fk) VALUES (?, ?)");
                    $stmt->bind_param("si", $data['cnpj'], $idProfissional);
                    if (!$stmt->execute()) throw new Exception("Falha ao inserir CNPJ: " . $stmt->error);
                    $stmt->close();
                }
            } else {
                if (!empty($data['cpf'])) {
                    $stmt = $conn->prepare("INSERT INTO fisicos (cpf, id_profissional_fk) VALUES (?, ?)");
                    $stmt->bind_param("si", $data['cpf'], $idProfissional);
                    if (!$stmt->execute()) throw new Exception("Falha ao inserir CPF: " . $stmt->error);
                    $stmt->close();
                }
            }

            $conn->commit();
            return $idProfissional;
        } catch (Exception $error) {
            $conn->rollback();
            // Relança a exceção para o Controller capturar e mostrar no log
            throw $error;
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
                // Se mudou para pessoa física ou já é
                if ($existeJuridico) {
                    if (!$conn->query("DELETE FROM juridicos WHERE id_profissional_fk = $id")) {
                        throw new Exception("Falha ao remover CNPJ ao migrar para fisico");
                    }
                }
                // Se CPF foi fornecido, atualiza ou cria
                if (!empty($data["cpf"])) {
                    // Remove máscara se houver
                    $cpfLimpo = preg_replace('/[^0-9]/', '', $data["cpf"]);
                    if ($existeFisico) {
                        $stmt2 = $conn->prepare("UPDATE fisicos SET cpf = ? WHERE id_profissional_fk = ?");
                        $stmt2->bind_param("si", $cpfLimpo, $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao atualizar CPF");
                    } else {
                        $stmt2 = $conn->prepare("INSERT INTO fisicos (cpf, id_profissional_fk) VALUES (?, ?)");
                        $stmt2->bind_param("si", $cpfLimpo, $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao criar CPF");
                    }
                } elseif (!$existeFisico) {
                    // Se não tem CPF e não existe registro, não faz nada (mantém sem CPF)
                }
            }
            if ($novoTipo === 1) {
                // Se mudou para pessoa jurídica ou já é
                if ($existeFisico) {
                    if (!$conn->query("DELETE FROM fisicos WHERE id_profissional_fk = $id")) {
                        throw new Exception("Falha ao remover CPF ao migrar para juridico");
                    }
                }
                // Se CNPJ foi fornecido, atualiza ou cria
                if (!empty($data["cnpj"])) {
                    // Remove máscara se houver
                    $cnpjLimpo = preg_replace('/[^0-9]/', '', $data["cnpj"]);
                    if ($existeJuridico) {
                        $stmt2 = $conn->prepare("UPDATE juridicos SET cnpj = ? WHERE id_profissional_fk = ?");
                        $stmt2->bind_param("si", $cnpjLimpo, $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao atualizar CNPJ");
                    } else {
                        $stmt2 = $conn->prepare("INSERT INTO juridicos (cnpj, id_profissional_fk) VALUES (?, ?)");
                        $stmt2->bind_param("si", $cnpjLimpo, $id);
                        if (!$stmt2->execute()) throw new Exception("Falha ao criar CNPJ");
                    }
                } elseif (!$existeJuridico) {
                    // Se não tem CNPJ e não existe registro, não faz nada (mantém sem CNPJ)
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

    public static function atualizarFotoPerfil($id, $caminho)
    {
    $db = Database::getInstancia();
    $conn = $db->pegarConexao();

    $sql = "UPDATE profissionais SET foto_perfil = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $caminho, $id);

    $resultado = $stmt->execute();
    $stmt->close();

    return $resultado;
    }

    public static function clientValidation($email, $password)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();
        $sql = "SELECT p.id, p.nome, p.email, c.senha
                FROM profissionais p
                JOIN cadastros c ON c.id = p.id_cadastro_fk
                WHERE p.email = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($prof = $result->fetch_assoc()) {
            if (PasswordController::validateHash($password, $prof['senha'])) {
                unset($prof['senha']);
                return $prof;
            }
        }
        return false;
    }
}
?>