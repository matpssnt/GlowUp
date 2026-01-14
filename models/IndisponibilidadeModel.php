    <?php
    require_once __DIR__ . '/../config/database.php';

    class IndisponibilidadeModel
    {
        public static function create($data)
        {
            $db = Database::getInstancia();
            $conn = $db->pegarConexao();

            $sql = "
                INSERT INTO indisponibilidades
                (id_profissional_fk, data, hora_inicio, hora_fim, tipo, motivo)
                VALUES (?, ?, ?, ?, ?, ?)
            ";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param(
                "isssss",
                $data['id_profissional_fk'],
                $data['data'],
                $data['hora_inicio'],
                $data['hora_fim'],
                $data['tipo'],
                $data['motivo']
            );

            $result = $stmt->execute();
            $stmt->close();
            return $result;
        }

        public static function delete($id)
        {
            $db = Database::getInstancia();
            $conn = $db->pegarConexao();

            $sql = "DELETE FROM indisponibilidades WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            $result = $stmt->execute();
            $stmt->close();

            return $result;
        }

        public static function getByProfissional($idProfissional)
        {
            $db = Database::getInstancia();
            $conn = $db->pegarConexao();

            $sql = "
                SELECT *
                FROM indisponibilidades
                WHERE id_profissional_fk = ?
                ORDER BY data, hora_inicio
            ";

            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $idProfissional);
            $stmt->execute();

            $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
            $stmt->close();

            return $result;
        }

        public static function existeBloqueio($idProfissional, $dataHora, $duracaoMinutos)
{
    $db = Database::getInstancia();
    $conn = $db->pegarConexao();

    $data = date('Y-m-d', strtotime($dataHora));
    $horaInicio = date('H:i:s', strtotime($dataHora));

    $sql = "
        SELECT COUNT(*) AS bloqueios
        FROM indisponibilidades
        WHERE id_profissional_fk = ?
          AND data = ?
          AND (
              hora_inicio IS NULL
              OR (
                  hora_inicio < ADDTIME(?, SEC_TO_TIME(? * 60))
                  AND hora_fim > ?
              )
          )
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "issis",
        $idProfissional,
        $data,
        $horaInicio,
        $duracaoMinutos,
        $horaInicio
    );

    $stmt->execute();
    $bloqueios = $stmt->get_result()->fetch_assoc()['bloqueios'];
    $stmt->close();

    return $bloqueios > 0;
}
 // Novo método com lock
    public static function temConflitoComLock($conn, $idProfissional, $data, $horaInicio, $duracaoMinutos)
    {
        $sql = "SELECT COUNT(*) AS bloqueios
                FROM indisponibilidades
                WHERE id_profissional_fk = ?
                  AND data = ?
                  AND (
                      hora_inicio IS NULL
                      OR (
                          hora_inicio < ADDTIME(?, SEC_TO_TIME(? * 60))
                          AND (hora_fim IS NULL OR hora_fim > ?)
                      )
                  )
                FOR UPDATE";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("issis", $idProfissional, $data, $horaInicio, $duracaoMinutos, $horaInicio);
        $stmt->execute();
        $bloqueios = $stmt->get_result()->fetch_assoc()['bloqueios'];
        $stmt->close();

        return $bloqueios > 0;
    }

}