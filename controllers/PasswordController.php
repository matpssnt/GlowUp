<?php

class PasswordController {
    public static function generateHash($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function validateHash($value, $hash){
        return password_verify($value, $hash);
    }
}

?>