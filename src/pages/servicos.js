import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";
import { notify } from "../components/Notification.js";
import { handleError } from "../utils/errorHandler.js";

// Carrega o CSS específico
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'src/css/dashboard.css';
document.head.appendChild(link);

// Carrega IMask via CDN
if (!document.querySelector('script[src*="imask"]')) {
    const scriptMask = document.createElement('script');
    scriptMask.src = 'https://unpkg.com/imask';
    document.head.appendChild(scriptMask);
}

export default function renderServicosPage() {
    // Verificações de segurança
    if (!authState.isAuth()) { window.location.href = '/login'; return; }
    if (authState.getUserType() !== 'profissional') { window.location.href = '/home'; return; }

    const root = document.getElementById('root');
    root.innerHTML = '';
    // Limpa estilos inline que possam ter sobrado
    root.style = '';
    root.className = 'dashboard-wrapper';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

    // Layout Principal
    const mainWrapper = document.createElement('div');
    mainWrapper.className = 'main-content-wrapper';

    // Sidebar
    mainWrapper.appendChild(PerfilSidebar());

    // Content Area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    // --- Header da Página ---
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-3';
    header.innerHTML = `
        <div>
            <h1 class="h3 fw-bold text-dark mb-1">Meus Serviços</h1>
            <p class="text-muted">Gerencie o catálogo de serviços oferecidos.</p>
        </div>
        <button id="btnNovoServico" class="btn btn-primary-custom">
            <i class="bi bi-plus-lg me-2"></i>Novo Serviço
        </button>
    `;
    contentArea.appendChild(header);

    // --- Container do Formulário (Oculto inicialmente) ---
    const formContainer = document.createElement('div');
    formContainer.className = 'content-card mb-4';
    formContainer.style.display = 'none'; // Toggle via JS
    formContainer.innerHTML = `
        <div class="card-header-custom">
            <h5 class="card-title-custom" id="formTitle">Novo Serviço</h5>
            <button id="btnFecharForm" class="btn-close"></button>
        </div>
        <div class="p-4">
            <form id="formServico">
                <input type="hidden" name="id" id="servicoId">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">Nome do Serviço</label>
                        <input type="text" name="nome" class="form-control" required placeholder="Ex: Corte Cabelo">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Categoria</label>
                        <select name="id_categoria_fk" class="form-select" required>
                             <option value="">Carregando...</option>
                        </select>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Descrição</label>
                        <textarea name="descricao" class="form-control" rows="2" placeholder="Descreva o serviço para o cliente..."></textarea>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Preço</label>
                        <div class="input-group">
                             <input type="text" name="preco" class="form-control" required placeholder="R$ 0,00">
                        </div>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Duração</label>
                        <input type="text" name="duracao" class="form-control" placeholder="00:30" >
                        <div class="form-text">Ex: 00:30</div>
                    </div>
                    
                    <div class="col-12 d-flex gap-2 justify-content-end mt-4">
                        <button type="button" id="btnCancelarForm" class="btn btn-outline-custom">Cancelar</button>
                        <button type="submit" class="btn btn-primary-custom">Salvar Serviço</button>
                    </div>
                </div>
            </form>
        </div>
    `;
    contentArea.appendChild(formContainer);

    // --- Lista de Serviços ---
    const listContainer = document.createElement('div');
    listContainer.className = 'content-card';
    listContainer.innerHTML = `
        <div class="card-header-custom">
            <h5 class="card-title-custom">Serviços Ativos</h5>
        </div>
        <div class="table-responsive">
            <table class="table custom-table mb-0">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Categoria</th>
                        <th>Preço</th>
                        <th>Duração</th>
                        <th class="text-end">Ações</th>
                    </tr>
                </thead>
                <tbody id="listaServicosBody">
                    <tr><td colspan="5" class="text-center p-4">Carregando...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    contentArea.appendChild(listContainer);

    // Monta a página
    mainWrapper.appendChild(contentArea);
    root.appendChild(mainWrapper);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());


    // --- Lógica JS ---
    const api = new ApiService();
    const profissionalId = authState.getUser()?.id || authState.getCadastroId();
    let profissional = null;

    // Elementos DOM
    const btnNovo = document.getElementById('btnNovoServico');
    const btnFechar = document.getElementById('btnFecharForm');
    const btnCancelar = document.getElementById('btnCancelarForm');
    const form = document.getElementById('formServico');
    const selectCategoria = form.querySelector('select[name="id_categoria_fk"]');
    const tbody = document.getElementById('listaServicosBody');
    const formTitle = document.getElementById('formTitle');

    // Variáveis de Máscara
    let maskPreco = null;
    let maskDuracao = null;

    function aplicarMascaras() {
        if (typeof IMask === 'undefined') {
            setTimeout(aplicarMascaras, 500); // Tenta de novo se script não carregou
            return;
        }

        const inputPreco = form.querySelector('[name="preco"]');
        const inputDuracao = form.querySelector('[name="duracao"]');

        // Máscara Preço (R$ 1.234,56)
        if (inputPreco && !maskPreco) {
            maskPreco = IMask(inputPreco, {
                mask: 'R$ num',
                blocks: {
                    num: {
                        mask: Number,
                        thousandsSeparator: '.',
                        radix: ',',
                        scale: 2,
                        padFractionalZeros: true,
                        normalizeZeros: true,
                    }
                }
            });
        }

        // Máscara Duração (HH:MM)
        if (inputDuracao && !maskDuracao) {
            maskDuracao = IMask(inputDuracao, {
                mask: '00:00',
                lazy: false // Mostra os placeholders
            });
        }
    }

    // Toggle Form
    function toggleForm(show, reset = true) {
        formContainer.style.display = show ? 'block' : 'none';
        btnNovo.style.display = show ? 'none' : 'block';
        if (!show && reset) {
            form.reset();
            if (maskPreco) maskPreco.value = '';
            if (maskDuracao) maskDuracao.value = '';
            document.getElementById('servicoId').value = '';
            formTitle.textContent = 'Novo Serviço';
        } else if (show) {
            aplicarMascaras();
        }
    }

    btnNovo.onclick = () => {
        toggleForm(true);
        formTitle.textContent = 'Novo Serviço';
    };
    btnFechar.onclick = () => toggleForm(false);
    btnCancelar.onclick = () => toggleForm(false);

    // Helper: Formata duração para exibição
    function formatarDuracaoExibicao(duracaoStr) {
        if (!duracaoStr) return '00:30';
        // Se vier como DATETIME (YYYY-MM-DD HH:MM:SS), pega só o tempo
        if (duracaoStr.includes(' ')) {
            const parts = duracaoStr.split(' ');
            if (parts.length > 1) {
                const t = parts[1].substring(0, 8);
                return t.substring(0, 5); // HH:MM
            }
        }
        const s = String(duracaoStr);
        if (s.length >= 5) return s.substring(0, 5);
        return s;
    }

    function normalizarDuracaoParaBackend(valor) {
        const v = String(valor || '').trim();
        if (!v) return '00:30:00';
        if (v.length === 5) return `${v}:00`;
        if (v.length === 8) return v;
        return v;
    }

    // Carregar Dados
    async function carregarDados() {
        try {
            // 1. Busca Profissional
            try {
                profissional = await api.buscarProfissionalPorCadastro(profissionalId);
            } catch (e) { /*console.error('Prof err', e); */ }

            if (!profissional) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Perfil profissional não encontrado.</td></tr>';
                return;
            }

            // 2. Busca Categorias
            const categorias = await api.listarCategorias();
            if (categorias && categorias.length) {
                selectCategoria.innerHTML = '<option value="">Selecione...</option>';
                categorias.forEach(c => {
                    selectCategoria.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
                });
            }

            // 3. Busca e Lista Serviços
            await atualizarListaServicos();

        } catch (error) {
            handleError(error, 'Serviços Load');
        }
    }

    async function atualizarListaServicos() {
        try {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Atualizando...</td></tr>';
            const todos = await api.listarServicos();
            const meusServicos = todos.filter(s => String(s.id_profissional_fk) === String(profissional.id));

            if (meusServicos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-4">Nenhum serviço cadastrado ainda.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            meusServicos.forEach(servico => {
                const tr = document.createElement('tr');

                // Formata Preço visualmente (Ponto para Vírgula)
                const precoVisual = servico.preco ? parseFloat(servico.preco).toFixed(2).replace('.', ',') : '0,00';

                tr.innerHTML = `
                    <td>
                        <div class="fw-bold">${servico.nome}</div>
                        <div class="text-muted small text-truncate" style="max-width: 200px;">${servico.descricao || ''}</div>
                    </td>
                    <td><span class="badge badge-primary">${servico.categoria_nome || 'Geral'}</span></td>
                    <td>R$ ${precoVisual}</td>
                    <td>${formatarDuracaoExibicao(servico.duracao)}</td>
                    <td class="text-end">
                        <button class="action-btn btn-editar" title="Editar"><i class="bi bi-pencil"></i></button>
                        <button class="action-btn delete btn-excluir" title="Excluir"><i class="bi bi-trash"></i></button>
                    </td>
                `;

                // Eventos
                const btnEdit = tr.querySelector('.btn-editar');
                const btnDel = tr.querySelector('.btn-excluir');

                btnEdit.onclick = () => editarServico(servico);
                btnDel.onclick = () => excluirServico(servico.id);

                tbody.appendChild(tr);
            });

        } catch (error) {
            console.error(error);
            tbody.innerHTML = '<tr><td colspan="5" class="text-danger text-center">Erro ao carregar lista.</td></tr>';
        }
    }

    function editarServico(servico) {
        toggleForm(true, false);
        formTitle.textContent = 'Editar Serviço';

        // Preenche form
        document.getElementById('servicoId').value = servico.id;
        form.querySelector('[name="nome"]').value = servico.nome;
        form.querySelector('[name="descricao"]').value = servico.descricao;

        // Preço com Máscara
        if (maskPreco) {
            const precoNumber = servico.preco !== null && servico.preco !== undefined ? Number(servico.preco) : 0;
            maskPreco.typedValue = isNaN(precoNumber) ? 0 : precoNumber;
        } else {
            form.querySelector('[name="preco"]').value = servico.preco;
        }

        // Duração com Máscara e Tratamento
        let duracaoValor = formatarDuracaoExibicao(servico.duracao);
        if (maskDuracao) {
            maskDuracao.value = duracaoValor;
            maskDuracao.updateValue();
        } else {
            form.querySelector('[name="duracao"]').value = duracaoValor;
        }

        const catId = servico.id_categoria_fk || (servico.categoria ? servico.categoria.id : '');
        if (catId) selectCategoria.value = catId;

        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    async function excluirServico(id) {
        if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

        try {
            await api.deletarServico(id);
            notify.success('Serviço excluído!');
            atualizarListaServicos();
        } catch (error) {
            handleError(error, 'Excluir Serviço');
        }
    }

    // Submit Form (Criar ou Editar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('servicoId').value;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        payload.id_profissional_fk = profissional.id;

        // Recupera Valor Real do Preço (sem R$)
        if (maskPreco) {
            payload.preco = maskPreco.typedValue;
        } else if (payload.preco) {
            // fallback: aceita "R$ 1.234,56" e converte para "1234.56"
            const raw = String(payload.preco)
                .replace(/\s/g, '')
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.');
            const parsed = Number(raw);
            if (!isNaN(parsed)) {
                payload.preco = parsed;
            }
        }

        // Validação e Correção de Duração
        // Workaround para coluna DATETIME: Prepend data dummy se necessário
        let duracao = normalizarDuracaoParaBackend(payload.duracao);

        // Se estiver num formato HH:MM:SS, adicionamos data dummy
        // Se já tiver data (improvável no input), deixa
        if (!duracao.includes(' ')) {
            payload.duracao = `2000-01-01 ${duracao}`;
        }

        try {
            if (id) {
                // Editar
                await api.atualizarServico(id, payload);
                notify.success('Serviço atualizado!');
            } else {
                // Criar
                await api.criarServico(payload);
                notify.success('Serviço criado!');
            }
            toggleForm(false);
            atualizarListaServicos();
        } catch (error) {
            handleError(error, 'Salvar Serviço');
        }
    });

    // Inicia
    carregarDados();
}
