<?php

class ValidadadorController{

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
}

?>