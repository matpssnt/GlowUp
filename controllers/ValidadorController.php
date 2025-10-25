<?php

class ValidadorController{

    public static function validate_data($data, $labels) {
        $faltando = [];

        foreach ($labels as $campo) {
            if (!isset($data[$campo]) || $data[$campo] === '') {
                $faltando[] = $campo;
            }
        }

        if (!empty($faltando)) {
            jsonResponse([
                'message' => 'Erro, faltam os campos: ' . implode(', ', $faltando)
            ], 400);
            exit;
        }
    }

    public static function dateHour_validate() {
        
        $dateTime = new DateTime();
        return $dateTime->format('Y-m-d H:i:s');
    }

    public static function validateDateTime($dateString) {
        try {
            date_default_timezone_set('America/Sao_Paulo');
            $dateTime = new DateTime($dateString);
            return $dateTime->format('Y-m-d H:i:s');
        }
        catch (Exception $e) {
            return false;
        }
    }

}

?>