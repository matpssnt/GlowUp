<?php
require_once __DIR__ . '/../config/database.php';
class AgendamentoModel
{
    public static function create($data)
    {
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "INSERT INTO agendamentos (data_hora, status, id_cliente_fk, id_servico_fk)
         VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssii", 
            $data['data_hora'], 
            $data['status'],
            $data['id_cliente_fk'],
            $data['id_servico_fk']
        ); 
        $result = $stmt->execute();
        $stmt->close();
        return $result;
    }

    public static function delete($id)
    {   
        $db = Database::getInstancia();
        $conn = $db->pegarConexao();

        $sql = "DELETE FROM agendamentos WHERE id = ?";
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

        $sql = "UPDATE agendamentos SET data_hora = ?, status = ?, id_cliente_fk = ?, id_servico_fk = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssiii", 
            $data['data_hora'],
            $data['status'],
            $data['id_cliente_fk'],
            $data['id_servico_fk'],
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

        $sql = "SELECT * FROM agendamentos WHERE id = ?";
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
        
        $sql = "SELECT * FROM agendamentos";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
?>
