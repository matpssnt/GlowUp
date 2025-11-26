import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import CepAPI from '../utils/cepAPI.js';

export default function PerfilForm() {
    const content = document.createElement('div');
    content.className = 'bg-white rounded shadow-sm flex-grow-1';
    content.style.padding = '30px';

    const api = new ApiService();
    let cadastroCompleto = null;
    let enderecoCompleto = null;
    let profissionalCompleto = null;

    const user = authState.getUser();
    const nomeCompleto = user?.nome || 'Usuário';
    const partesNome = nomeCompleto.split(' ');
    const nome = partesNome[0] || 'Usuário';
    const sobrenome = partesNome.slice(1).join(' ') || '';

    // Função para carregar dados completos do usuário
    async function carregarDadosCompletos() {
        try {
            const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
            if (!cadastroId) return;
            
            const cadastro = await api.buscarCadastro(cadastroId);
            if (!cadastro) return;
            
            cadastroCompleto = cadastro;
            
            // Atualiza campos do formulário
            const nomeInput = content.querySelector('#nome');
            const sobrenomeInput = content.querySelector('#sobrenome');
            const emailInput = content.querySelector('#email');
            
            if (nomeInput && sobrenomeInput && cadastro.nome) {
                const partesNome = cadastro.nome.split(' ');
                nomeInput.value = partesNome[0] || '';
                sobrenomeInput.value = partesNome.slice(1).join(' ') || '';
            }
            
            if (emailInput && cadastro.email) {
                emailInput.value = cadastro.email;
            }

            // Se for profissional, busca o profissional e o endereço
            const userType = authState.getUserType();
            if (userType === 'profissional') {
                try {
                    profissionalCompleto = await api.buscarProfissionalPorCadastro(cadastroId);
                    if (profissionalCompleto && profissionalCompleto.id) {
                        enderecoCompleto = await api.buscarEnderecoPorProfissional(profissionalCompleto.id);
                        preencherCamposEndereco();
                    }
                } catch (error) {
                    console.error('Erro ao carregar dados do profissional:', error);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    // Função para preencher campos de endereço
    function preencherCamposEndereco() {
        if (!enderecoCompleto) return;

        const cidadeInput = content.querySelector('#cidade');
        const bairroInput = content.querySelector('#bairro');
        const ruaInput = content.querySelector('#rua');
        const numeroInput = content.querySelector('#numero');
        const cepInput = content.querySelector('#cep');
        const complementoInput = content.querySelector('#complemento');
        const estadoInput = content.querySelector('#estado');

        if (cidadeInput) cidadeInput.value = enderecoCompleto.cidade || '';
        if (bairroInput) bairroInput.value = enderecoCompleto.bairro || '';
        if (ruaInput) ruaInput.value = enderecoCompleto.rua || '';
        if (numeroInput) numeroInput.value = enderecoCompleto.numero || '';
        if (cepInput) cepInput.value = enderecoCompleto.cep ? CepAPI.formatarCep(enderecoCompleto.cep) : '';
        if (complementoInput) complementoInput.value = enderecoCompleto.complemento || '';
        if (estadoInput) estadoInput.value = enderecoCompleto.estado || '';
    }

    content.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Editar perfil</h2>
            <i class="bi bi-person-circle" style="font-size: 3rem; color: #ccc;"></i>
        </div>
        
        <form id="perfilForm">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="nome" class="form-label">Nome</label>
                    <input type="text" class="form-control" id="nome" value="${nome}" required>
                </div>
                <div class="col-md-6">
                    <label for="sobrenome" class="form-label">Sobrenome</label>
                    <input type="text" class="form-control" id="sobrenome" value="${sobrenome}" required>
                </div>
            </div>

            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <div class="input-group">
                    <input type="email" class="form-control" id="email" value="${user?.email || ''}" required>
                    <span class="input-group-text bg-success text-white">
                        <i class="bi bi-check-circle"></i>
                    </span>
                </div>
            </div>

            <div class="mb-4">
                <h4 class="cont-register-section-title">Endereço</h4>
                
                <div class="cont-register-row-1 mb-3">
                    <div class="cont-register-field">
                        <label for="cidade" class="form-label">Cidade</label>
                        <input type="text" class="form-control" id="cidade" placeholder="Nome da cidade" value="">
                    </div>
                    <div class="cont-register-field">
                        <label for="bairro" class="form-label">Bairro</label>
                        <input type="text" class="form-control" id="bairro" placeholder="Nome do bairro" value="">
                    </div>
                </div>

                <div class="cont-register-row-2 mb-3">
                    <div class="cont-register-field">
                        <label for="rua" class="form-label">Rua</label>
                        <input type="text" class="form-control" id="rua" placeholder="Nome da rua" value="">
                    </div>
                </div>

                <div class="cont-register-row-3 mb-3">
                    <div class="cont-register-field">
                        <label for="numero" class="form-label">Número</label>
                        <input type="text" class="form-control" id="numero" placeholder="Número do endereço" value="">
                    </div>
                    <div class="cont-register-field">
                        <label for="cep" class="form-label">CEP</label>
                        <input type="text" class="form-control" id="cep" placeholder="00000-000" value="">
                    </div>
                    <div class="cont-register-field">
                        <label for="complemento" class="form-label">Complemento</label>
                        <input type="text" class="form-control" id="complemento" placeholder="Apartamento, casa, etc." value="">
                    </div>
                </div>

                <div class="cont-register-field">
                    <label for="estado" class="form-label">Estado</label>
                    <input type="text" class="form-control" id="estado" placeholder="Estado" readonly style="background-color: #f8f9fa;">
                </div>
            </div>

            <div class="mb-3">
                <label for="telefone" class="form-label">Número para contato</label>
                <input type="tel" class="form-control" id="telefone" placeholder="(00) 0000-0000" value="">
            </div>

            <div class="mb-3">
                <label for="senha" class="form-label">Senha</label>
                <div class="input-group">
                    <input type="password" class="form-control" id="senha" placeholder="Deixe em branco para manter a senha atual">
                    <span class="input-group-text bg-success text-white">
                        <i class="bi bi-check-circle"></i>
                    </span>
                </div>
                <small class="form-text text-muted">Deixe em branco para manter a senha atual</small>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" id="btnCancelar">Cancelar</button>
                <button type="submit" class="btn btn-dark" id="btnSalvar">Salvar alterações</button>
            </div>
        </form>
    `;

    // Função para adicionar busca de CEP
    function adicionarBuscaCep(inputCep) {
        let timeoutId = null;

        const buscarCep = async () => {
            const cep = inputCep.value.trim();

            if (!cep || cep.length < 8) {
                CepAPI.removerErro();
                return;
            }

            try {
                const campos = {
                    cidade: 'cidade',
                    bairro: 'bairro',
                    street: 'rua',
                    state: 'estado'
                };

                await CepAPI.buscarEPreencher(cep, campos, {
                    success: (dados) => {
                        inputCep.value = CepAPI.formatarCep(cep);
                        const campoNumero = content.querySelector('#numero');
                        if (campoNumero) {
                            campoNumero.focus();
                        }
                    },
                    error: (error) => {
                        console.error('Erro ao buscar CEP:', error);
                        alert('Erro ao buscar CEP: ' + error.message);
                    }
                });
            } catch (error) {
                console.error('Erro na busca do CEP:', error);
            }
        };

        inputCep.addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 8) {
                valor = valor.substring(0, 8);
            }
            if (valor.length > 5) {
                valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
            }
            e.target.value = valor;

            CepAPI.removerErro();

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            if (valor.replace(/\D/g, '').length === 8) {
                timeoutId = setTimeout(buscarCep, 800);
            }
        });

        inputCep.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                buscarCep();
            }
        });

        inputCep.addEventListener('paste', (e) => {
            setTimeout(() => {
                const valor = e.target.value.replace(/\D/g, '');
                if (valor.length === 8) {
                    buscarCep();
                }
            }, 100);
        });
    }

    // Event listeners
    const form = content.querySelector('#perfilForm');
    
    // Adiciona busca de CEP
    const cepInput = content.querySelector('#cep');
    if (cepInput) {
        adicionarBuscaCep(cepInput);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Desabilita botão durante requisição
        const btnSalvar = content.querySelector('#btnSalvar');
        const textoOriginal = btnSalvar.textContent;
        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';
        
        try {
            // Se não tiver cadastro completo ainda, tenta carregar
            if (!cadastroCompleto) {
                await carregarDadosCompletos();
            }
            
            // Verifica se tem ID do cadastro
            const cadastroId = cadastroCompleto?.id || authState.getCadastroId();
            if (!cadastroId) {
                throw new Error('ID do cadastro não encontrado. Faça login novamente.');
            }
            
            // Coleta dados do formulário
            const nomeCompleto = `${content.querySelector('#nome').value.trim()} ${content.querySelector('#sobrenome').value.trim()}`.trim();
            const email = content.querySelector('#email').value.trim();
            const senha = content.querySelector('#senha').value.trim();
            
            // Validações básicas
            if (!nomeCompleto || !email) {
                throw new Error('Nome e email são obrigatórios.');
            }
            
            // Busca tipo de usuário do authState
            const userType = authState.getUserType();
            const isProfissional = userType === 'profissional' ? 1 : 0;
            
            // Chama API para atualizar (senha é opcional - se vazia, mantém a atual)
            await api.atualizarCadastro(
                cadastroId,
                nomeCompleto,
                email,
                senha || '', // Envia string vazia se não preenchida
                isProfissional
            );
            
            // Se for profissional, atualiza ou cria endereço
            if (isProfissional && profissionalCompleto && profissionalCompleto.id) {
                const cidade = content.querySelector('#cidade').value.trim();
                const bairro = content.querySelector('#bairro').value.trim();
                const rua = content.querySelector('#rua').value.trim();
                const numero = content.querySelector('#numero').value.trim();
                const cep = content.querySelector('#cep').value.replace(/\D/g, '');
                const complemento = content.querySelector('#complemento').value.trim();
                const estado = content.querySelector('#estado').value.trim();

                // Se todos os campos obrigatórios estiverem preenchidos
                if (cidade && bairro && rua && numero && cep && estado) {
                    const dadosEndereco = {
                        rua,
                        numero,
                        cep,
                        bairro,
                        cidade,
                        estado,
                        complemento: complemento || '',
                        id_profissional_fk: profissionalCompleto.id
                    };

                    try {
                        if (enderecoCompleto && enderecoCompleto.id) {
                            // Atualiza endereço existente
                            await api.atualizarEndereco(enderecoCompleto.id, dadosEndereco);
                        } else {
                            // Cria novo endereço
                            await api.criarEndereco(dadosEndereco);
                        }
                    } catch (error) {
                        console.error('Erro ao salvar endereço:', error);
                        // Não bloqueia o salvamento do perfil se o endereço falhar
                    }
                }
            }
            
            // Atualiza authState e recarrega dados
            authState.setUser({ ...authState.getUser(), id: cadastroId, nome: nomeCompleto, email }, authState.getToken());
            await carregarDadosCompletos();
            
            // Mostra mensagem de sucesso
            const alertas = content.querySelectorAll('.alert');
            alertas.forEach(a => a.remove());
            
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show mt-3';
            successAlert.innerHTML = `
                <strong>Sucesso!</strong> Alterações salvas com sucesso!
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            form.insertAdjacentElement('afterend', successAlert);
            setTimeout(() => successAlert.remove(), 3000);
            
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
            console.error('Erro ao salvar perfil:', error);
        } finally {
            // Reabilita botão
            btnSalvar.disabled = false;
            btnSalvar.textContent = textoOriginal;
        }
    });
    
    // Carrega dados completos do usuário quando o formulário é criado
    carregarDadosCompletos();

    const btnCancelar = content.querySelector('#btnCancelar');
    btnCancelar.addEventListener('click', () => {
        window.location.href = '/home';
    });

    return content;
}

