<?php
require_once __DIR__ . '/../models/AgendamentoModel.php';
require_once __DIR__ . '/../helpers/response.php';

class DisponibilidadeController
{
    public static function horariosDisponiveis($params)
    {
        if (
            empty($params['data']) ||
            empty($params['id_servico_fk'])
        ) {
            return jsonResponse(
                ['message' => 'Parâmetros obrigatórios: data, id_servico_fk'],
                400
            );
        }

        $horarios = AgendamentoModel::gerarHorariosDisponiveis(
            $params['data'],
            $params['id_servico_fk']
        );

        return jsonResponse($horarios, 200);
    }
}
