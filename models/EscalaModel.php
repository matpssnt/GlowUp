<?php
require_once __DIR__ . '/../config/database.php';
class EscalaModel
{
    public static function create($data){
        global $conn;
        $sql = "INSERT INTO escalas(inicio, fim, dia_semana, id_profissional_fk) VALUES (? , ? , ? , ?);";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssi",
            $data['inicio'],
            $data['fim'],
            $data['dia_semana'],
            $data['id_profissional_fk']
        );
        return $stmt->execute();

    }
    public static function update($data, $id)

    {
        global $conn;
        $sql = 'UPDATE escalas SET inicio = ?, fim = ?, dia_semana = ?, id_profissional_fk = ? WHERE id = ?;';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            'sssii',
            $data['inicio'],
            $data['fim'],
            $data['dia_semana'],
            $data['id_profissional_fk'],
            $id
        );
        return $stmt->execute();
    }
    public static function delete($id)
    {   global $conn;
        $sql = "DELETE FROM escalas WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $result = $stmt->execute();
        $stmt->close();

        return $result;
    }
        public static function getById($id)
    {   
        global $conn;
        $sql = "SELECT * FROM escalas WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $result;
    }
        public static function getAll(){
        global $conn;
        $sql = "SELECT * FROM escalas";
        $result = $conn->query($sql);
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
?>