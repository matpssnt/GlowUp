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

    public static function validateDateTime($dateString = null) {
        date_default_timezone_set('America/Sao_Paulo');
        try {
            if ($dateString === null) {
                $dateTime = new DateTime();
            }
            else {
                $dateTime = new DateTime($dateString);
            }
            return $dateTime->format('Y-m-d H:i:s');

        }
        catch (Exception $e) {
            return false;
        }
    }

}

?>