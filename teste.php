<?php
    require_once __DIR__ . '/helpers/token_jwt.php';
    require_once __DIR__ . '/config/database.php';


    require_once __DIR__ . "/controllers/ClientController.php";

    require_once __DIR__ . "/controllers/PasswordController.php";

    require_once __DIR__ . "/controllers/ServicesController.php";

    require_once __DIR__ . "/controllers/CategoriaController.php";
    
    require_once __DIR__ . '/controllers/EnderecoController.php';
    require_once __DIR__ . '/controllers/TelefoneController.php';

    require_once __DIR__ . "/controllers/Pessoa_FisicaController.php";
    require_once __DIR__ . "/controllers/Pessoa_JuridicaController.php";

    require_once __DIR__ . "/controllers/EscalaController.php";

    require_once __DIR__ . "/controllers/TelProfController.php";
    

    // ClientController   #FUNCIONANDO.
    // PasswordController #FUNCIONANDO
    // ServicesController #FUNCIONANDO
    // CategoriaControlle #FUNCIONANDO
    // EnderecoController #FUNCIONANDO
    // TelefoneController #FUNCIONANDO
    // TelProfController  #FUNCIONANDO
    // PessoaJuridicaController #FUNCIONANDO
    // PessoaFisicaController #FUNCIONANDO
    // EscalaController #FUNCIONANDO


    // date_default_timezone_set('America/Sao_Paulo');
    // $dataAtual = date('Y-m-d H:i:s');


    
    // $data = [
    //     "inicio"=>$dataAtual,
    //     "fim"=> $dataAtual,
    //     "dia_semana"=> 1,
    //     "id_profissional_fk"=> 2
    // ];
    // EscalaController::getAll($conn);

    // $data = [
    //     "cnpj"=> "999-222-999",
    //     "id_profissional_fk"=> "2",
    // ];

    // PessoaJuridicaController::create($conn, $data);

    // $data = [
    //     "id_profissional_fk"=> 2,
    //     "id_telefone_fk"=> 3
    // ];

    // TelProfController::delete($conn, $data);


    // $data = [
    //     'nome'=> 'Quaquercoisa2',
    //     'descricao'=> 'O melhor do qualquer coisa2 ',
    //     'preco'=> '20',
    //     'duracao'=> $dataAtual,
    //     'id_profissional_fk' => 2,
    //     'id_categoria_fk' => 2
    // ];
    // ServicesController::create($conn,$data);


    // $data = [
    //     'rua' => 'Rua Exemplo',
    //     'numero' => '100',
    //     'cep' => '01234-567',
    //     'bairro' => 'Centro',
    //     'cidade' => 'São Paulo',
    //     'estado' => 'SP',
    //     'complemento' => 'Apto 1',
    //     'id_profissional_fk' => 1
    // ];

    // EnderecoController::create($conn, $data);
    


    // $data = [
    //     'ddd' => '11',
    //     'digitos' => '99999-9999'
    // ];
    // TelefoneController::create($conn, $data);




    
    
?>