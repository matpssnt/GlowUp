<?php
require_once __DIR__ . '/../config/database.php';

class PortifolioModel
{
    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "INSERT INTO portifolios (imagens, id_profissional_fk)
                VALUES (?, ?)";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "si",
            $data['imagens'],
            $data['id_profissional_fk']
        );

        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }

    public static function delete($id)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "DELETE FROM portifolios WHERE id = ?";
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

        $sql = "UPDATE portifolios 
                SET imagens = ?, id_profissional_fk = ?
                WHERE id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sii",
            $data['imagens'],
            $data['id_profissional_fk'],
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

        $sql = "SELECT 
                    p.id,
                    p.imagens,
                    p.id_profissional_fk,
                    pr.nome AS nome_profissional
                FROM portifolios p
                INNER JOIN profissionais pr 
                    ON p.id_profissional_fk = pr.id
                WHERE p.id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        return $result;
    }

    public static function getAll()
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "SELECT 
                    p.id,
                    p.imagens,
                    p.id_profissional_fk,
                    pr.nome AS nome_profissional
                FROM portifolios p
                INNER JOIN profissionais pr 
                    ON p.id_profissional_fk = pr.id";

        $result = $conn->query($sql);

        if ($result && $result->num_rows > 0) {
            return $result->fetch_all(MYSQLI_ASSOC);
        }

        return [];
    }


}
?>
