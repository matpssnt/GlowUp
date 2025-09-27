import NavBar from "../components/NavBar.js";
import CepAPI from "../utils/cepAPI.js";

export default function renderFormContRegister(container) {
    // Cria o formulário
    const formulario = document.createElement('form');
    formulario.className = 'd-flex flex-wrap cont-register-form'; // Alterado de flex-column para flex-wrap

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
    secaoEndereco.appendChild(divCidade);

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
    secaoEndereco.appendChild(divBairro);

    // Rua
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
    secaoEndereco.appendChild(divRua);

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
    secaoEndereco.appendChild(divNumero);

    // CEP
    const divCep = document.createElement('div');
    divCep.className = 'cont-register-field';
    const labelCep = document.createElement('label');
    labelCep.textContent = 'CEP';
    labelCep.className = 'form-label';
    
    // Container para CEP com botão de busca
    const cepContainer = document.createElement('div');
    cepContainer.style.display = 'flex';
    cepContainer.style.gap = '8px';
    
    const inputCep = document.createElement('input');
    inputCep.type = 'text';
    inputCep.className = 'form-control';
    inputCep.id = 'cep';
    inputCep.placeholder = '00000-000';
    inputCep.required = true;
    inputCep.style.flex = '1';
    
    // Botão de busca
    const btnBuscarCep = document.createElement('button');
    btnBuscarCep.type = 'button';
    btnBuscarCep.className = 'btn btn-outline-secondary';
    btnBuscarCep.innerHTML = '<i class="fas fa-search"></i>';
    btnBuscarCep.title = 'Buscar endereço pelo CEP';
    btnBuscarCep.style.padding = '8px 12px';
    
    cepContainer.appendChild(inputCep);
    cepContainer.appendChild(btnBuscarCep);
    
    divCep.appendChild(labelCep);
    divCep.appendChild(cepContainer);
    secaoEndereco.appendChild(divCep);

    // Adiciona funcionalidade de busca de CEP
    adicionarBuscaCep(inputCep, btnBuscarCep);

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
    secaoEndereco.appendChild(divComplemento);

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

    // Botão de finalizar
    const btnFinalizar = document.createElement('button');
    btnFinalizar.type = 'submit';
    btnFinalizar.textContent = 'Finalizar Cadastro Profissional';
    btnFinalizar.className = 'btn btn-primary cont-register-submit';
    formulario.appendChild(btnFinalizar);

    // Adiciona evento de submit
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Cadastro finalizado com sucesso!');
        // Aqui você pode adicionar lógica para salvar os dados
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
 * @param {HTMLButtonElement} btnBuscar - Botão de busca
 */
function adicionarBuscaCep(inputCep, btnBuscar) {
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
                rua: 'street',
                estado: 'state'
            };

            // Busca e preenche automaticamente
            await CepAPI.buscarEPreencher(cep, campos, {
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
                }
            });

        } catch (error) {
            console.error('Erro na busca do CEP:', error);
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
            timeoutId = setTimeout(buscarCep, 800); // Aguarda 800ms após parar de digitar
        }
    });

    // Event listener para o botão de busca
    btnBuscar.addEventListener('click', buscarCep);

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