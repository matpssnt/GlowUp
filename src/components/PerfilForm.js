import authState from '../utils/AuthState.js';
import ApiService from '../utils/api.js';
import CepAPI from '../utils/cepAPI.js';
import { notify } from './Notification.js';
import { handleError } from '../utils/errorHandler.js';
import { createPersonalFields, createAddressFields, createContactFields } from './PerfilFormFields.js';
import { setupCepSearch, setupFieldMasksAndValidation, validateFormBeforeSubmit } from './PerfilFormLogic.js';

export default function PerfilForm() {
    const content = document.createElement('div');
    content.className = 'bg-white rounded shadow-sm flex-grow-1 perfil-form-container';

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

            // Busca endereço (para profissionais e clientes)
            try {
                // Primeiro tenta buscar como profissional
                const ehProfissional = await verificarSeEhProfissional();
                if (ehProfissional) {
                    profissionalCompleto = await api.buscarProfissionalPorCadastro(cadastroId);
                    if (profissionalCompleto && profissionalCompleto.id) {
                        enderecoCompleto = await api.buscarEnderecoPorProfissional(profissionalCompleto.id);
                    }
                } else {
                    // Se não for profissional, tenta buscar endereço por cadastro
                    enderecoCompleto = await api.buscarEnderecoPorCadastro(cadastroId);
                }
                
                // Preenche campos de endereço se encontrou
                if (enderecoCompleto) {
                    preencherCamposEndereco();
                }
            } catch (error) {
                console.error('Erro ao carregar endereço:', error);
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

    // Função para verificar se é profissional (verifica tipo e se tem profissional associado)
    async function verificarSeEhProfissional() {
        const userType = authState.getUserType();
        if (userType === 'profissional') return true;
        
        // Se não tiver tipo definido, tenta buscar profissional associado
        try {
            const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
            if (!cadastroId) return false;
            
            const profissional = await api.buscarProfissionalPorCadastro(cadastroId);
            return !!profissional;
        } catch (error) {
            return false;
        }
    }

    // Renderiza o formulário usando componentes
    // Sempre mostra campos de endereço para profissionais e clientes
    const renderizarFormulario = async () => {
        content.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">Editar perfil</h2>
                <i class="bi bi-person-circle" style="font-size: 3rem; color: #ccc;"></i>
            </div>
            
            <form id="perfilForm">
                ${createPersonalFields(nome, sobrenome, user?.email || '')}
                ${createAddressFields()}
                ${createContactFields()}

                <div class="d-flex justify-content-end gap-2 mt-4">
                    <button type="button" class="btn btn-outline-secondary" id="btnCancelar">Cancelar</button>
                    <button type="submit" class="btn btn-dark" id="btnSalvar">Salvar alterações</button>
                </div>
            </form>
        `;
        
        // Configura máscaras e validações após renderizar
        setupFieldMasksAndValidation(content);
        
        // Configura busca de CEP (automática ao digitar)
        const cepInput = content.querySelector('#cep');
        if (cepInput) {
            setupCepSearch(cepInput, content);
        }
        
        // Configura event listeners após renderizar
        configurarEventListeners();
    };
    
    // Função para configurar event listeners
    const configurarEventListeners = () => {
        // Event listener do formulário
        const form = content.querySelector('#perfilForm');
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Valida formulário antes de enviar
            if (!validateFormBeforeSubmit(content)) {
                notify.warning('Por favor, corrija os erros no formulário');
                return;
            }
            
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
                
                // Verifica se é profissional
                const ehProfissional = await verificarSeEhProfissional();
                const isProfissional = ehProfissional ? 1 : 0;
                
                // Chama API para atualizar (senha é opcional - se vazia, mantém a atual)
                await api.atualizarCadastro(
                    cadastroId,
                    nomeCompleto,
                    email,
                    senha || '', // Envia string vazia se não preenchida
                    isProfissional
                );
                
                // Atualiza ou cria endereço (para profissionais e clientes)
                const cidade = content.querySelector('#cidade')?.value.trim() || '';
                const bairro = content.querySelector('#bairro')?.value.trim() || '';
                const rua = content.querySelector('#rua')?.value.trim() || '';
                const numero = content.querySelector('#numero')?.value.trim() || '';
                const cep = content.querySelector('#cep')?.value.replace(/\D/g, '') || '';
                const complemento = content.querySelector('#complemento')?.value.trim() || '';
                const estado = content.querySelector('#estado')?.value.trim() || '';

                // Se todos os campos obrigatórios estiverem preenchidos
                if (cidade && bairro && rua && numero && cep && estado) {
                    // Garante que tem profissional completo se for profissional
                    if (ehProfissional && !profissionalCompleto) {
                        profissionalCompleto = await api.buscarProfissionalPorCadastro(cadastroId);
                    }
                    
                    const dadosEndereco = {
                        rua,
                        numero,
                        cep,
                        bairro,
                        cidade,
                        estado,
                        complemento: complemento || ''
                    };
                    
                    // Se for profissional, adiciona id_profissional_fk
                    if (ehProfissional && profissionalCompleto && profissionalCompleto.id) {
                        dadosEndereco.id_profissional_fk = profissionalCompleto.id;
                    } else {
                        // Para clientes, tenta usar id_cadastro_fk ou deixa null
                        // (depende de como o backend está configurado)
                        dadosEndereco.id_cadastro_fk = cadastroId;
                    }

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
                
                // Atualiza authState e recarrega dados
                authState.setUser({ ...authState.getUser(), id: cadastroId, nome: nomeCompleto, email }, authState.getToken());
                await carregarDadosCompletos();
                
                // Mostra mensagem de sucesso
                notify.success('Alterações salvas com sucesso!');
                
            } catch (error) {
                handleError(error, 'PerfilForm - submit');
            } finally {
                // Reabilita botão
                btnSalvar.disabled = false;
                btnSalvar.textContent = textoOriginal;
            }
        });
        
        const btnCancelar = content.querySelector('#btnCancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => {
                window.location.href = '/home';
            });
        }
    };
    
    // Renderiza o formulário e carrega dados
    renderizarFormulario();
    
    // Carrega dados completos do usuário após renderizar
    setTimeout(async () => {
        await carregarDadosCompletos();
    }, 100);

    return content;
}
