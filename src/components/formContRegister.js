import NavBar from "../components/NavBar.js";
import CepAPI from "../utils/cepAPI.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { notify } from "./Notification.js";
import { addMaskToInput } from "../utils/validation.js";

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

    // Campo de Foto do Estabelecimento
    const divFoto = document.createElement('div');
    divFoto.className = 'cont-register-field';

    const labelFoto = document.createElement('label');
    labelFoto.textContent = 'Foto do Estabelecimento';
    labelFoto.className = 'form-label';

    const inputFoto = document.createElement('input');
    inputFoto.type = 'file';
    inputFoto.className = 'form-control';
    inputFoto.id = 'foto-estabelecimento';
    inputFoto.accept = 'image/png, image/jpeg, image/jpg';
    inputFoto.required = false; // true se for obrigatorio

    // preview da imagem
    const previewImagem = document.createElement('img');
    previewImagem.style.marginTop = '10px';
    previewImagem.style.maxWidth = '200px';
    previewImagem.style.display = 'none';
    previewImagem.className = 'cont-register-preview';

    divFoto.appendChild(labelFoto);
    divFoto.appendChild(inputFoto);
    divFoto.appendChild(previewImagem);

    secaoInfo.appendChild(divFoto);

    inputFoto.addEventListener('change', (e) => {
    const file = e.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (event) {
            previewImagem.src = event.target.result;
            previewImagem.style.display = 'block';
        };

        reader.readAsDataURL(file);
    }
    });

    // Seção: Endereço do Estabelecimento
    const secaoEndereco = document.createElement('div');
    secaoEndereco.className = 'cont-register-section cont-register-section-horizontal'; // Classe para layout horizontal

    const tituloEndereco = document.createElement('h4');
    tituloEndereco.textContent = 'Endereço do Estabelecimento';
    tituloEndereco.className = 'cont-register-section-title';
    secaoEndereco.appendChild(tituloEndereco);

    // Linha de CEP (Primeiro)
    const linhaCep = document.createElement('div');
    linhaCep.className = 'cont-register-row-2'; // largura total para destaque

    const divCep = document.createElement('div');
    divCep.className = 'cont-register-field';
    const labelCep = document.createElement('label');
    labelCep.textContent = 'CEP *';
    labelCep.className = 'form-label';

    const inputCep = document.createElement('input');
    inputCep.type = 'text';
    inputCep.className = 'form-control';
    inputCep.id = 'cep';
    inputCep.placeholder = '00000-000';
    inputCep.required = true;

    divCep.appendChild(labelCep);
    divCep.appendChild(inputCep);
    linhaCep.appendChild(divCep);
    secaoEndereco.appendChild(linhaCep);

    // Adiciona funcionalidade de busca de CEP
    adicionarBuscaCep(inputCep);

    // Linha 1: Estado, Cidade e Bairro
    const linha1 = document.createElement('div');
    linha1.className = 'cont-register-row-3'; // Uso row-3 para 3 colunas

    // Estado
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
    inputEstado.required = true;
    divEstado.appendChild(labelEstado);
    divEstado.appendChild(inputEstado);
    linha1.appendChild(divEstado);

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

    // Linha 3: Número e Complemento lado a lado
    const linha3 = document.createElement('div');
    linha3.className = 'cont-register-row-1'; // row-1 para 2 colunas

    // Número
    const divNumero = document.createElement('div');
    divNumero.className = 'cont-register-field';
    const labelNumero = document.createElement('label');
    labelNumero.textContent = 'Número *';
    labelNumero.className = 'form-label';
    const inputNumero = document.createElement('input');
    inputNumero.type = 'text';
    inputNumero.className = 'form-control';
    inputNumero.id = 'numero';
    inputNumero.placeholder = 'Nº';
    inputNumero.required = true;
    divNumero.appendChild(labelNumero);
    divNumero.appendChild(inputNumero);
    linha3.appendChild(divNumero);

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
    inputComplemento.placeholder = 'Ex: Ap 12, Bloco B';
    divComplemento.appendChild(labelComplemento);
    divComplemento.appendChild(inputComplemento);
    linha3.appendChild(divComplemento);

    secaoEndereco.appendChild(linha3);

    // ----------------------------
    // Seção: Contato (Telefone)
    // ----------------------------
    const secaoContato = document.createElement('div');
    secaoContato.className = 'cont-register-section';
    secaoContato.innerHTML = `
    <h4 class="cont-register-section-title">Contato Principal</h4>
    <div class="row g-3">
        <div class="col-md-3">
            <label class="form-label">DDD *</label>
            <input type="text" id="ddd" class="form-control" placeholder="Ex: 55" maxlength="2" required>
        </div>
        <div class="col-md-9">
            <label class="form-label">Telefone *</label>
            <input type="text" id="telefone" class="form-control" placeholder="99999-9999" maxlength="15" required>
        </div>
    </div>
`;
    formulario.appendChild(secaoContato);
    
    formulario.appendChild(secaoEndereco);

    // Aplica máscara nos campos
    const inputDDD = formulario.querySelector('#ddd');
    const inputTelefone = formulario.querySelector('#telefone');

    if (inputDDD) {
        addMaskToInput(inputDDD, 'ddd');

        // Bloqueio forte: só permite números (remove letras em tempo real)
        inputDDD.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
        });


        // Impede digitação de letras/teclas inválidas desde o início
        inputDDD.addEventListener('keypress', (e) => {
            const charCode = e.which ? e.which : e.keyCode;
            // Permite apenas 0-9, backspace, delete, tab, setas
            if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                e.preventDefault();
            }
        });



        // Opcional: melhora UX no mobile (teclado numérico)
        inputDDD.setAttribute('inputmode', 'numeric');
        inputDDD.setAttribute('pattern', '[0-9]{2}');
    }

    if (inputTelefone) {
        addMaskToInput(inputTelefone, 'telefone');
    }

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
    btnVoltar.href = "register";
    btnVoltar.className = 'cont-register-nav-link';
    containerBotoes.appendChild(btnFinalizar);
    formulario.appendChild(containerBotoes);

    // Adiciona evento de submit
    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

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

            const idCadastro = dadosBasicos.idCadastro || dadosBasicos.id;
            let idProfissional = dadosBasicos.idProfissional;

            if (!idCadastro) {
                throw new Error('ID do cadastro não encontrado. Por favor, refaça o cadastro inicial.');
            }

            // Importa e usa a API
            const api = new ApiService();

            // Se não tiver o idProfissional no localStorage, busca na API
            if (!idProfissional) {
                const profissional = await api.buscarProfissionalPorCadastro(idCadastro);
                if (!profissional || !profissional.id) {
                    throw new Error('Não encontramos seu perfil profissional. Por favor, certifique-se de que completou a primeira etapa do cadastro.');
                }
                idProfissional = profissional.id;
            }

            // Coleta todos os dados do formulário
            const descricao = document.getElementById('descricao').value.trim();
            const cidade = document.getElementById('cidade').value.trim();
            const bairro = document.getElementById('bairro').value.trim();
            const rua = document.getElementById('rua').value.trim();
            const numero = document.getElementById('numero').value.trim();
            const cep = document.getElementById('cep').value.replace(/\D/g, '');
            const complemento = document.getElementById('complemento').value.trim();
            const estado = document.getElementById('estado').value.trim();
            const ddd = document.getElementById('ddd').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
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

            // Atualiza o profissional
            try {
                await api.atualizarProfissional(idProfissional, dadosProfissional);
            } catch (error) {
                // console.error('Erro ao atualizar profissional:', error);
                throw new Error('Erro ao atualizar dados do profissional: ' + error.message);
            }

            // Se o usuário escolheu foto, manda para o endpoint correto
            try {
                const fotoFile = document.getElementById('foto-estabelecimento')?.files[0];
                if (fotoFile) {
                    console.log('Tentando enviar foto do estabelecimento', fotoFile);
                    const formData = new FormData();
                    formData.append('foto', fotoFile);
                    const uploadResp = await api.request(`/profissional/${idProfissional}/foto`, 'POST', formData, true);
                    console.log('Resposta upload foto:', uploadResp);
                }
            } catch (uploadErr) {
                console.warn('Falha ao enviar foto (não impede cadastro):', uploadErr);
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

            // Cria o endereço
            try {
                await api.criarEndereco(dadosEndereco);
            } catch (error) {
                console.warn('Endereço não foi criado, mas o cadastro continua');
            }

            // Cria o telefone e a relação tel_prof
            if (ddd && telefone) {
                try {
                    const respTel = await api.criarTelefone(ddd, telefone);
                    const idTelefone = respTel?.id || respTel?.idTelefone;
                    if (idTelefone) {
                        await api.request('/telProf', 'POST', {
                            id_profissional_fk: idProfissional,
                            id_telefone_fk: idTelefone
                        });
                    }
                } catch (error) {
                    console.warn('Erro ao vincular telefone:', error);
                }
            }

            // Limpa o localStorage
            localStorage.removeItem('dadosBasicos');

            // Notifica sucesso
            notify.success('Cadastro finalizado com sucesso! Entrando na sua conta...');

            // Realiza login automático
            try {
                const response = await api.login(dadosBasicos.email, dadosBasicos.senha);

                if (response && response.token) {
                    // Decodifica o token para pegar os dados do usuário
                    let jwtPayload = {};
                    try {
                        const base64Url = response.token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        jwtPayload = JSON.parse(window.atob(base64));
                    } catch (e) {
                        console.error('Erro ao decodificar token:', e);
                    }

                    const sub = jwtPayload.sub || {};
                    const userData = {
                        tipoUsuario: 'profissional',
                        nome: sub.nome || dadosBasicos.nome,
                        email: sub.email || dadosBasicos.email,
                        id: sub.id || sub.idCadastro || dadosBasicos.idCadastro,
                        profissional_id: sub.profissional_id || idProfissional
                    };

                    authState.setUser(userData, response.token);

                    // Redireciona para o dashboard
                    const currentPath = window.location.pathname;
                    const basePath = currentPath.split('/').slice(0, 2).join('/');

                    setTimeout(() => {
                        window.location.href = basePath + '/dashboard';
                    }, 1000);
                } else {
                    window.location.href = 'login';
                }
            } catch (error) {
                console.error('Erro no login automático:', error);
                window.location.href = 'login';
            }

        } catch (error) {
            // Erro
            // console.error('Erro completo no cadastro:', error);
            const mensagemErro = error.message || 'Erro desconhecido ao finalizar cadastro';
            notify.error('Erro ao finalizar cadastro: ' + mensagemErro);
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

        // Função para formatar CPF
        function formatarCPF(valor) {
            valor = valor.replace(/\D/g, ""); // remove tudo que não é número
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            return valor;
        }

        // Função para formatar CNPJ
        function formatarCNPJ(valor) {
            valor = valor.replace(/\D/g, "");
            valor = valor.replace(/(\d{2})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
            valor = valor.replace(/(\d{3})(\d)/, "$1/$2");
            valor = valor.replace(/(\d{4})(\d{1,2})$/, "$1-$2");
            return valor;
        }


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

            input.addEventListener('input', function (e) {
                e.target.value = formatarCPF(e.target.value);
            });

            // Opcional: limitar a 14 caracteres (11 números + 3 pontos + 1 traço)
            input.maxLength = 14;
        }

        else if (tipo === 'juridica') {
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

            input.addEventListener('input', function (e) {
                e.target.value = formatarCNPJ(e.target.value);
            });

            // Opcional: limitar a 18 caracteres
            input.maxLength = 18;
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
            // Mapeamento dos campos
            const campos = {
                cidade: 'cidade',
                bairro: 'bairro',
                street: 'rua',
                state: 'estado'
            };

            // Busca e preenche automaticamente
            const dados = await CepAPI.buscarEPreencher(cep, campos, {
                success: (dados) => {
                    // Formata o CEP no campo
                    inputCep.value = CepAPI.formatarCep(cep);

                    // Bloqueia campos preenchidos
                    document.getElementById('rua').readOnly = true;
                    document.getElementById('cidade').readOnly = true;
                    document.getElementById('bairro').readOnly = true;
                    document.getElementById('estado').readOnly = true;

                    // Foca no próximo campo (número)
                    const campoNumero = document.getElementById('numero');
                    if (campoNumero) {
                        campoNumero.focus();
                    }
                },
                error: (error) => {
                    // console.error('Erro ao buscar CEP:', error);
                    notify.error('Erro ao buscar CEP: ' + error.message);
                }
            });

        } catch (error) {
            // console.error('Erro na busca do CEP:', error);
            notify.error('Erro na busca do CEP: ' + error.message);
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