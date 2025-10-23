<?php
require_once 'config.php';
class Database {
    private $conn;
    private static $instancia = null;
    public function __construct(){
        try{
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_BANCO);
            if($this->conn->connect_error){
                throw new Exception("Erro na conexão com o banco de dados");
            }
        }catch(Exception $erro){
            die("Erro: " . $erro->getMessage());
        }
    }

    public static function getInstancia() {
        if (self::$instancia === null) {
            self::$instancia = new Database();
        }
        return self::$instancia;
    }

    public function pegarConexao(){
        return $this->conn;
    }

}

?>