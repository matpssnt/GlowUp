import NavBar from "../components/NavBar.js";
import CepAPI from "../utils/cepAPI.js";
import ApiService from "../utils/api.js";

export default function renderFormContRegister(container) {
    // Cria o formulário
    const formulario = document.createElement('form');
    formulario.className = 'cont-register-form';

    // Seção: Informações do Estabelecimento
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';

    const navbar = NavBar();
    nav.appendChild(navbar);


    const secaoInfo = document.createElement('div');
    secaoInfo.className = 'cont-register-section';

    const tituloInfo = document.createElement('h4');
    tituloInfo.textContent = 'Informações do Estabelecimento';
    tituloInfo.className = 'cont-register-section-title';
    secaoInfo.appendChild(tituloInfo);

    // Campo de descrição do local

    const labelDescricao = document.createElement('label');
    labelDescricao.textContent = 'Descrição do Estabelecimento *';
    labelDescricao.className = 'form-label';
    secaoInfo.appendChild(labelDescricao);

    const textareaDescricao = document.createElement('textarea');
    textareaDescricao.className = 'form-control mb-3 cont-register-textarea';
    textareaDescricao.id = 'descricao';
    textareaDescricao.rows = 4;
    textareaDescricao.placeholder = 'Descreva brevemente o seu estabelecimento (máximo 70 caracteres)';
    textareaDescricao.maxLength = 70;
    textareaDescricao.required = true;
    secaoInfo.appendChild(textareaDescricao);

    const contador = document.createElement('small');
    contador.className = 'cont-register-counter';
    contador.textContent = '0/70 caracteres';
    secaoInfo.appendChild(contador);

    // Adiciona contador de caracteres

    textareaDescricao.addEventListener('input', () => {
        const count = textareaDescricao.value.length;
        contador.textContent = `${count}/70 caracteres`;

        // Adiciona classes de warning/danger baseado no limite
        contador.classList.remove('warning', 'danger');
        if (count > 60) {
            contador.classList.add('warning');
        }
        if (count >= 70) {
            contador.classList.add('danger');
        }
    });

    formulario.appendChild(secaoInfo);

    // Seção: Endereço do Estabelecimento
    const secaoEndereco = document.createElement('div');
    secaoEndereco.className = 'cont-register-section cont-register-section-horizontal'; // Classe para layout horizontal

    const tituloEndereco = document.createElement('h4');
    tituloEndereco.textContent = 'Endereço do Estabelecimento';
    tituloEndereco.className = 'cont-register-section-title';
    secaoEndereco.appendChild(tituloEndereco);

    // Linha 1: Cidade e Bairro lado a lado
    const linha1 = document.createElement('div');
    linha1.className = 'cont-register-row-1';

    // Cidade
    const divCidade = document.createElement('div');
    divCidade.className = 'cont-register-field';
    const labelCidade = document.createElement('label');
    labelCidade.textContent = 'Cidade';
    labelCidade.className = 'form-label';
    const inputCidade = document.createElement('input');
    inputCidade.type = 'text';
    inputCidade.className = 'form-control';
    inputCidade.id = 'cidade';
    inputCidade.placeholder = 'Nome da cidade';
    inputCidade.required = true;
    divCidade.appendChild(labelCidade);
    divCidade.appendChild(inputCidade);
    linha1.appendChild(divCidade);

    // Bairro
    const divBairro = document.createElement('div');
    divBairro.className = 'cont-register-field';
    const labelBairro = document.createElement('label');
    labelBairro.textContent = 'Bairro';
    labelBairro.className = 'form-label';
    const inputBairro = document.createElement('input');
    inputBairro.type = 'text';
    inputBairro.className = 'form-control';
    inputBairro.id = 'bairro';
    inputBairro.placeholder = 'Nome do bairro';
    inputBairro.required = true;
    divBairro.appendChild(labelBairro);
    divBairro.appendChild(inputBairro);
    linha1.appendChild(divBairro);

    secaoEndereco.appendChild(linha1);

    // Linha 2: Rua (largura total)
    const linha2 = document.createElement('div');
    linha2.className = 'cont-register-row-2';

    const divRua = document.createElement('div');
    divRua.className = 'cont-register-field';
    const labelRua = document.createElement('label');
    labelRua.textContent = 'Rua';
    labelRua.className = 'form-label';
    const inputRua = document.createElement('input');
    inputRua.type = 'text';
    inputRua.className = 'form-control';
    inputRua.id = 'rua';
    inputRua.placeholder = 'Nome da rua';
    inputRua.required = true;
    divRua.appendChild(labelRua);
    divRua.appendChild(inputRua);
    linha2.appendChild(divRua);

    secaoEndereco.appendChild(linha2);

    // Linha 3: Número, CEP e Complemento lado a lado
    const linha3 = document.createElement('div');
    linha3.className = 'cont-register-row-3';

    // Número
    const divNumero = document.createElement('div');
    divNumero.className = 'cont-register-field';
    const labelNumero = document.createElement('label');
    labelNumero.textContent = 'Número';
    labelNumero.className = 'form-label';
    const inputNumero = document.createElement('input');
    inputNumero.type = 'text';
    inputNumero.className = 'form-control';
    inputNumero.id = 'numero';
    inputNumero.placeholder = 'Número do endereço';
    inputNumero.required = true;
    divNumero.appendChild(labelNumero);
    divNumero.appendChild(inputNumero);
    linha3.appendChild(divNumero);

    // CEP
    const divCep = document.createElement('div');
    divCep.className = 'cont-register-field';
    const labelCep = document.createElement('label');
    labelCep.textContent = 'CEP';
    labelCep.className = 'form-label';

    const inputCep = document.createElement('input');
    inputCep.type = 'text';
    inputCep.className = 'form-control';
    inputCep.id = 'cep';
    inputCep.placeholder = '00000-000';
    inputCep.required = true;

    divCep.appendChild(labelCep);
    divCep.appendChild(inputCep);
    linha3.appendChild(divCep);

    // Complemento
    const divComplemento = document.createElement('div');
    divComplemento.className = 'cont-register-field';
    const labelComplemento = document.createElement('label');
    labelComplemento.textContent = 'Complemento';
    labelComplemento.className = 'form-label';
    const inputComplemento = document.createElement('input');
    inputComplemento.type = 'text';
    inputComplemento.className = 'form-control';
    inputComplemento.id = 'complemento';
    inputComplemento.placeholder = 'Apartamento, casa, etc.';
    divComplemento.appendChild(labelComplemento);
    divComplemento.appendChild(inputComplemento);
    linha3.appendChild(divComplemento);

    secaoEndereco.appendChild(linha3);

    // Adiciona funcionalidade de busca de CEP
    adicionarBuscaCep(inputCep);

    // Estado (será preenchido automaticamente)
    const divEstado = document.createElement('div');
    divEstado.className = 'cont-register-field';
    const labelEstado = document.createElement('label');
    labelEstado.textContent = 'Estado';
    labelEstado.className = 'form-label';
    const inputEstado = document.createElement('input');
    inputEstado.type = 'text';
    inputEstado.className = 'form-control';
    inputEstado.id = 'estado';
    inputEstado.placeholder = 'Estado';
    inputEstado.readOnly = true;
    inputEstado.style.backgroundColor = '#f8f9fa';
    divEstado.appendChild(labelEstado);
    divEstado.appendChild(inputEstado);
    secaoEndereco.appendChild(divEstado);

    formulario.appendChild(secaoEndereco);

    // Seção: Documentação
    const secaoDocumento = document.createElement('div');
    secaoDocumento.className = 'cont-register-section';

    const tituloTipoPessoa = document.createElement('h4');
    tituloTipoPessoa.textContent = 'Documentação';
    tituloTipoPessoa.className = 'cont-register-section-title';
    secaoDocumento.appendChild(tituloTipoPessoa);

    // Campo de seleção Tipo de Pessoa
    const divTipo = document.createElement('div');
    divTipo.className = 'cont-register-field';
    const labelTipo = document.createElement('label');
    labelTipo.textContent = 'Sou pessoa:';
    labelTipo.className = 'form-label';
    const selectTipo = document.createElement('select');
    selectTipo.className = 'form-control cont-register-select';
    selectTipo.id = 'tipo-pessoa';
    selectTipo.required = true;
    divTipo.appendChild(labelTipo);
    divTipo.appendChild(selectTipo);
    secaoDocumento.appendChild(divTipo);

    const opcaoVazia = document.createElement('option');
    opcaoVazia.value = '';
    opcaoVazia.textContent = 'Selecione uma opção';
    selectTipo.appendChild(opcaoVazia);

    const opcaoFisica = document.createElement('option');
    opcaoFisica.value = 'fisica';
    opcaoFisica.textContent = 'Pessoa Física';
    selectTipo.appendChild(opcaoFisica);

    const opcaoJuridica = document.createElement('option');
    opcaoJuridica.value = 'juridica';
    opcaoJuridica.textContent = 'Pessoa Jurídica';
    selectTipo.appendChild(opcaoJuridica);

    // Container para campos dinâmicos
    const camposDinamicos = document.createElement('div');
    camposDinamicos.id = 'campos-dinamicos';
    camposDinamicos.className = 'd-none cont-register-dynamic';
    secaoDocumento.appendChild(camposDinamicos);

    formulario.appendChild(secaoDocumento);

    // Adiciona funcionalidade de alternância
    adicionarAlternanciaTipoPessoa(selectTipo, camposDinamicos);

    // Container para os botões
    const containerBotoes = document.createElement('div');
    containerBotoes.className = 'cont-register-buttons-container';

    // Botão de finalizar
    const btnFinalizar = document.createElement('button');
    btnFinalizar.type = 'submit';
    btnFinalizar.textContent = 'Finalizar Cadastro Profissional';
    btnFinalizar.className = 'btn btn-primary cont-register-submit';

    const btnVoltar = document.createElement('a');
    btnVoltar.innerHTML = "Voltar ao cadastro";
    btnVoltar.href = "register";
    btnVoltar.className = 'cont-register-nav-link';
    containerBotoes.appendChild(btnFinalizar);
    containerBotoes.appendChild(btnVoltar);
    formulario.appendChild(containerBotoes);

    // Adiciona evento de submit
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Formulário submetido!');

        // Desabilita o botão durante a requisição
        btnFinalizar.disabled = true;
        btnFinalizar.textContent = 'Finalizando...';

        try {
            
            // Recupera dados básicos do localStorage
            const dadosBasicosStr = localStorage.getItem('dadosBasicos');
            if (!dadosBasicosStr) {
                throw new Error('Dados básicos não encontrados. Por favor, refaça o cadastro inicial.');
            }

            const dadosBasicos = JSON.parse(dadosBasicosStr);
            console.log('Dados básicos recuperados:', dadosBasicos);
            
            const idCadastro = dadosBasicos.idCadastro || dadosBasicos.id;

            if (!idCadastro) {
                throw new Error('ID do cadastro não encontrado. Por favor, refaça o cadastro inicial.');
            }

            // Importa e usa a API
            const api = new ApiService();

            // Busca o profissional pelo id_cadastro
            const profissional = await api.buscarProfissionalPorCadastro(idCadastro);
            
            if (!profissional || !profissional.id) {
                throw new Error('Profissional não encontrado. Por favor, refaça o cadastro inicial.');
            }
            const idProfissional = profissional.id;

            // Coleta todos os dados do formulário
            const descricao = document.getElementById('descricao').value.trim();
            const cidade = document.getElementById('cidade').value.trim();
            const bairro = document.getElementById('bairro').value.trim();
            const rua = document.getElementById('rua').value.trim();
            const numero = document.getElementById('numero').value.trim();
            const cep = document.getElementById('cep').value.replace(/\D/g, '');
            const complemento = document.getElementById('complemento').value.trim();
            const estado = document.getElementById('estado').value.trim();
            const tipoPessoa = document.getElementById('tipo-pessoa').value;
            const cpf = document.getElementById('cpf')?.value.replace(/\D/g, '') || '';
            const cnpj = document.getElementById('cnpj')?.value.replace(/\D/g, '') || '';
            // Atualiza o profissional com os dados coletados
            const dadosProfissional = {
                nome: dadosBasicos.nome,
                email: dadosBasicos.email,
                descricao: descricao,
                acessibilidade: 0, // Valor padrão
                isJuridica: tipoPessoa === 'juridica' ? 1 : 0,
                id_cadastro_fk: idCadastro
            };

            // CPF/CNPJ são obrigatórios na atualização
            if (tipoPessoa === 'fisica') {
                if (!cpf) {
                    throw new Error('CPF é obrigatório para pessoa física');
                }
                dadosProfissional.cpf = cpf;
            } else if (tipoPessoa === 'juridica') {
                if (!cnpj) {
                    throw new Error('CNPJ é obrigatório para pessoa jurídica');
                }
                dadosProfissional.cnpj = cnpj;
            }

            console.log('Atualizando profissional com dados:', dadosProfissional);
            
            // Atualiza o profissional
            try {
                await api.atualizarProfissional(idProfissional, dadosProfissional);
                console.log('Profissional atualizado com sucesso');
            } catch (error) {
                console.error('Erro ao atualizar profissional:', error);
                throw new Error('Erro ao atualizar dados do profissional: ' + error.message);
            }

            // Cria o endereço
            const dadosEndereco = {
                rua: rua,
                numero: numero,
                cep: cep,
                bairro: bairro,
                cidade: cidade,
                estado: estado,
                complemento: complemento || '',
                id_profissional_fk: idProfissional
            };

            console.log('Criando endereço com dados:', dadosEndereco);
            
            // Cria o endereço
            try {
                await api.criarEndereco(dadosEndereco);
                console.log('Endereço criado com sucesso');
            } catch (error) {
                console.error('Erro ao criar endereço:', error);
                // Não bloqueia o cadastro se o endereço falhar
                console.warn('Endereço não foi criado, mas o cadastro continua');
            }

            // Limpa o localStorage
            localStorage.removeItem('dadosBasicos');
            
            // Notifica sucesso
            const { notify } = await import('../components/Notification.js');
            notify.success('Cadastro finalizado com sucesso! Redirecionando para login...');
            
            // Aguarda um pouco antes de redirecionar
            setTimeout(() => {
            window.location.href = 'login';
            }, 1500);

        } catch (error) {
            // Erro
            console.error('Erro completo no cadastro:', error);
            const mensagemErro = error.message || 'Erro desconhecido ao finalizar cadastro';
            alert('Erro ao finalizar cadastro: ' + mensagemErro);
        } finally {
            // Reabilita o botão
            btnFinalizar.disabled = false;
            btnFinalizar.textContent = 'Finalizar Cadastro Profissional';
        }
    });

    container.appendChild(formulario);
}

function adicionarAlternanciaTipoPessoa(selectTipo, container) {
    selectTipo.addEventListener('change', () => {
        const tipo = selectTipo.value;

        // Limpa o container
        container.innerHTML = '';
        container.classList.remove('d-none');
        container.classList.add('show');

        if (tipo === 'fisica') {
            // Campo CPF
            const divCampo = document.createElement('div');
            divCampo.className = 'cont-register-field';
            const label = document.createElement('label');
            label.textContent = 'CPF do Responsável';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.id = 'cpf';
            input.placeholder = '000.000.000-00';
            input.required = true;
            divCampo.appendChild(label);
            divCampo.appendChild(input);
            container.appendChild(divCampo);
        } else if (tipo === 'juridica') {
            // Campo CNPJ
            const divCampo = document.createElement('div');
            divCampo.className = 'cont-register-field';
            const label = document.createElement('label');
            label.textContent = 'CNPJ do Estabelecimento';
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.id = 'cnpj';
            input.placeholder = '00.000.000/0000-00';
            input.required = true;
            divCampo.appendChild(label);
            divCampo.appendChild(input);
            container.appendChild(divCampo);
        }
    });
}

/**
 * Adiciona funcionalidade de busca automática de CEP
 * @param {HTMLInputElement} inputCep - Campo de entrada do CEP
 */
function adicionarBuscaCep(inputCep) {
    let timeoutId = null;

    // Função para buscar CEP
    const buscarCep = async () => {
        const cep = inputCep.value.trim();

        if (!cep || cep.length < 8) {
            CepAPI.removerErro();
            return;
        }

        try {
            console.log('Iniciando busca do CEP:', cep);

            // Mapeamento dos campos
            const campos = {
                cidade: 'cidade',
                bairro: 'bairro',
                street: 'rua',
                state: 'estado'
            };

            console.log('Mapeamento de campos:', campos);

            // Busca e preenche automaticamente
            const dados = await CepAPI.buscarEPreencher(cep, campos, {
                success: (dados) => {
                    console.log('CEP encontrado:', dados);

                    // Formata o CEP no campo
                    inputCep.value = CepAPI.formatarCep(cep);

                    // Foca no próximo campo (número)
                    const campoNumero = document.getElementById('numero');
                    if (campoNumero) {
                        campoNumero.focus();
                    }
                },
                error: (error) => {
                    console.error('Erro ao buscar CEP:', error);
                    alert('Erro ao buscar CEP: ' + error.message);
                }
            });

            console.log('Dados retornados:', dados);

        } catch (error) {
            console.error('Erro na busca do CEP:', error);
            alert('Erro na busca do CEP: ' + error.message);
        }
    };

    // Event listener para busca automática (após parar de digitar)
    inputCep.addEventListener('input', (e) => {
        // Remove caracteres não numéricos
        let valor = e.target.value.replace(/\D/g, '');

        // Limita a 8 dígitos
        if (valor.length > 8) {
            valor = valor.substring(0, 8);
        }

        // Formata enquanto digita
        if (valor.length > 5) {
            valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
        }

        e.target.value = valor;

        // Remove erro anterior
        CepAPI.removerErro();

        // Cancela timeout anterior
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Busca automaticamente quando CEP estiver completo
        if (valor.replace(/\D/g, '').length === 8) {
            timeoutId = setTimeout(buscarCep, 800); // Aguarda parar de digitar
        }
    });


    // Event listener para Enter no campo CEP
    inputCep.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buscarCep();
        }
    });

    // Event listener para paste
    inputCep.addEventListener('paste', (e) => {
        setTimeout(() => {
            const valor = e.target.value.replace(/\D/g, '');
            if (valor.length === 8) {
                buscarCep();
            }
        }, 100);
    });
}