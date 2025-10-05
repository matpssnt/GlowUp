<?php
    $uri = Strtolower(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
    $method = $_SERVER['REQUEST_METHOD'];
    $pasta = Strtolower(basename(dirname(__FILE__)));
    $uri = str_replace("/$pasta", "", $uri);
    $seguimentos = explode("/", trim($uri, "/") );

    $route = $seguimentos[0] ??  null;
    $subRoute = $seguimentos[1] ??  null;

    if($route != "api"){
        require "index.html";
        exit;
        
    }elseif($route === "api"){
        if(in_array( $subRoute, ["login", "home", "register", "contRegister"])){
            require "routes/${subRoute}.php";
        }else{
            return jsonResponse(['message' => 'rota não encontrada'], 404);
        }
        exit;
    }else{
        echo "404 Pagina não encontrada";
        exit;

    }
?>
