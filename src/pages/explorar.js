import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";

const ITEMS_PER_PAGE = 15;

/**
 * Renderiza a página Explorar (Profissionais ou Estabelecimentos)
 * @param {Object} options - Configurações da página
 */
export default function renderExplorarPage(options = {}) {
    const {
        tipoFiltro = null,
        titulo = 'Explorar Profissionais',
        subtitulo = 'Encontre os melhores profissionais de beleza e estética perto de você',
        icone = 'fas fa-spa',
        labelEntidade = 'profissional'
    } = options;

    // Root principal
    const root = document.getElementById('root');
    if (!root) {
        console.error('Elemento #root não encontrado');
        return;
    }

    root.innerHTML = '';
    root.style.minHeight = '100vh';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';

    // Navbar
    const navContainer = document.getElementById('navbar');
    if (navContainer) {
        navContainer.innerHTML = '';
        navContainer.appendChild(NavBar());
    }

    // Container da página inteira
    const page = document.createElement('div');
    page.className = 'explorar-page';
    page.style.flex = '1';
    page.style.display = 'flex';
    page.style.flexDirection = 'column';

    // Banner (parte verde)
    const banner = document.createElement('div');
    banner.className = 'explorar-banner';
    banner.innerHTML = `
        <h1>${titulo}</h1>
        <p>${subtitulo}</p>
    `;
    // Wrapper flex para sidebar + conteúdo principal
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'explorar-content';
    contentWrapper.style.flex = '1';
    contentWrapper.style.display = 'flex';
    contentWrapper.style.maxWidth = '1400px';
    contentWrapper.style.margin = '0 auto';
    contentWrapper.style.padding = '30px 20px';
    contentWrapper.style.gap = '30px';
    contentWrapper.style.width = '100%';
    contentWrapper.style.boxSizing = 'border-box';

    // Sidebar (desktop)
    const sidebar = document.createElement('aside');
    sidebar.className = 'explorar-sidebar';
    sidebar.id = 'sidebarDesktop';
    sidebar.style.flex = '0 0 320px';
    sidebar.style.background = 'white';
    sidebar.style.borderRadius = '12px';
    sidebar.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    sidebar.style.padding = '20px';
    sidebar.style.height = 'fit-content';
    sidebar.style.position = 'sticky';
    sidebar.style.top = '20px';
    sidebar.style.alignSelf = 'flex-start';
    sidebar.style.maxHeight = 'calc(100vh - 140px)'; // navbar + padding + margem de segurança
    sidebar.style.overflowY = 'auto';

    const sidebarInner = document.createElement('div');
    sidebarInner.className = 'sidebar-card';
    sidebarInner.innerHTML = `
        <h3 class="sidebar-title">
            <i class="fas fa-sliders-h"></i> Filtros
        </h3>
        <div id="sidebarFiltersContent"></div>
    `;
    sidebar.appendChild(sidebarInner);

    // Área principal
    const mainArea = document.createElement('div');
    mainArea.className = 'explorar-main';
    mainArea.style.flex = '1';
    mainArea.style.minWidth = '0';

    // Estado da aplicação
    const state = {
        profissionais: [],
        categorias: [],
        servicos: [],
        enderecos: [],
        bairros: [],
        filteredResults: [],
        currentPage: 1,
        totalPages: 1,
        loading: true,
        filters: {
            busca: '',
            categorias: [],
            precoMin: '',
            precoMax: '',
            bairro: '',
            distancia: '',
            ordenacao: 'nome'
        }
    };

    mainArea.innerHTML = `
        <div class="results-toolbar">
            <div class="toolbar-left">
                <button class="btn-mobile-filters" id="btnMobileFilters">
                    <i class="fas fa-sliders-h"></i> Filtros
                </button>
                <span class="results-count" id="resultsCount">Carregando...</span>
            </div>
            <div class="results-sort">
                <label for="sortSelect">Ordenar por:</label>
                <select id="sortSelect">
                    <option value="nome">Nome (A-Z)</option>
                    <option value="menor_preco">Menor preço</option>
                    <option value="maior_preco">Maior preço</option>
                </select>
            </div>
        </div>

        <div class="explorar-grid" id="explorarGrid"></div>
        <div class="explorar-pagination" id="explorarPagination"></div>
    `;

    // Monta estrutura
    contentWrapper.appendChild(sidebar);
    contentWrapper.appendChild(mainArea);

    // Modal de Filtros Mobile (HTML em falta corrigido aqui)
    const mobileFiltersModal = document.createElement('div');
    mobileFiltersModal.id = 'mobileFiltersModalContainer';
    mobileFiltersModal.innerHTML = `
        <div class="filters-modal-overlay" id="filtersOverlay"></div>
        <div class="filters-modal" id="filtersModal">
            <div class="filters-modal-header">
                <h3><i class="fas fa-sliders-h"></i> Filtros</h3>
                <button class="filters-modal-close" id="closeFiltersModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="filters-modal-body" id="mobileFiltersContent">
                <!-- Conteúdo dos filtros será injetado pelo renderFilters -->
            </div>
            <div class="filters-modal-footer">
                <button class="btn-clear-mobile" id="btnClearMobile">Limpar Tudo</button>
                <button class="btn-apply-filters" id="btnApplyFilters">Aplicar</button>
            </div>
        </div>
    `;
    page.appendChild(mobileFiltersModal);

    page.appendChild(banner);
    page.appendChild(contentWrapper);
    root.appendChild(page);

    // Footer
    const footerContainer = document.getElementById('footer');
    if (footerContainer) {
        footerContainer.innerHTML = '';
        footerContainer.style.marginTop = 'auto';
        footerContainer.appendChild(Footer());
    }

    // Inicialização
    init();

    // ────────────────────────────────────────────────
    // Funções auxiliares
    // ────────────────────────────────────────────────

    async function init() {
        renderSkeletons();
        await carregarDados();
        renderFilters('sidebarFiltersContent');
        renderFilters('mobileFiltersContent');
        applyFilters();
        setupEventListeners();
    }

    async function carregarDados() {
        const api = new ApiService();

        try {
            const [profissionais, categorias, servicos, enderecos] = await Promise.allSettled([
                api.listarProfissionais(),
                api.listarCategorias(),
                api.listarServicos(),
                buscarTodosEnderecos(api)
            ]);

            let allProfissionais = getSettledValue(profissionais, []);

            if (tipoFiltro === 'pf') {
                allProfissionais = allProfissionais.filter(p => p.isJuridica == 0);
            } else if (tipoFiltro === 'pj') {
                allProfissionais = allProfissionais.filter(p => p.isJuridica == 1);
            }

            state.profissionais = allProfissionais;
            state.categorias = getSettledValue(categorias, []);
            state.servicos = getSettledValue(servicos, []);
            state.enderecos = getSettledValue(enderecos, []);

            if (Array.isArray(state.enderecos)) {
                const bairrosSet = new Set();
                state.enderecos.forEach(e => {
                    if (e.bairro) bairrosSet.add(e.bairro);
                });
                state.bairros = Array.from(bairrosSet).sort();
            }

            await carregarLocalizacaoCliente(api);

            state.loading = false;
        } catch (error) {
            state.loading = false;
            state.profissionais = [];
        }
    }

    async function carregarLocalizacaoCliente(api) {
        try {
            const cadastroId = authState.getCadastroId?.();
            if (!cadastroId) return;

            const enderecoCliente = await api.buscarEnderecoPorCadastro(cadastroId);
            if (!enderecoCliente || !enderecoCliente.bairro) return;

            if (state.bairros.includes(enderecoCliente.bairro)) {
                state.filters.bairro = enderecoCliente.bairro;
            }
        } catch (error) {
            console.error('Erro ao carregar endereço do cliente para filtros de localização:', error);
        }
    }

    async function buscarTodosEnderecos(api) {
        try {
            return await api.request('/endereco', 'GET');
        } catch {
            return [];
        }
    }

    function getSettledValue(result, fallback) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            return result.value;
        }
        return fallback;
    }

    function renderFilters(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const contadorCategorias = {};
        if (Array.isArray(state.servicos) && Array.isArray(state.categorias)) {
            const profIds = new Set(state.profissionais.map(p => String(p.id)));
            state.categorias.forEach(cat => {
                const servicosDaCat = state.servicos.filter(s =>
                    s.id_categoria_fk == cat.id && profIds.has(String(s.id_profissional_fk))
                );
                const profsIdsSet = new Set(servicosDaCat.map(s => s.id_profissional_fk));
                contadorCategorias[cat.id] = profsIdsSet.size;
            });
        }

        container.innerHTML = `
            <div class="filter-group">
                <div class="filter-group-title">Buscar</div>
                <div class="filter-search">
                    <input type="text" 
                           class="filter-search-input" 
                           placeholder="Serviço ou ${labelEntidade}..."
                           value="${state.filters.busca}">
                    <i class="fas fa-search"></i>
                </div>
            </div>

            <div class="filter-group">
                <div class="filter-group-title">Categorias</div>
                <div class="filter-categories">
                    ${Array.isArray(state.categorias) ? state.categorias.map(cat => `
                        <label class="filter-checkbox">
                            <input type="checkbox" 
                                   value="${cat.id}" 
                                   class="filter-cat-checkbox"
                                   ${state.filters.categorias.includes(String(cat.id)) ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            <span class="filter-label">${cat.nome}</span>
                            <span class="filter-count">${contadorCategorias[cat.id] || 0}</span>
                        </label>
                    `).join('') : '<p style="color:#999;font-size:0.85rem;">Nenhuma categoria encontrada</p>'}
                </div>
            </div>

            <div class="filter-group">
                <div class="filter-group-title">Faixa de Preço</div>
                <div class="price-range-inputs">
                    <div class="price-input-wrapper">
                        <span>R$</span>
                        <input type="number" 
                               class="filter-price-min" 
                               placeholder="Mín"
                               min="0"
                               value="${state.filters.precoMin}">
                    </div>
                    <span class="price-separator">—</span>
                    <div class="price-input-wrapper">
                        <span>R$</span>
                        <input type="number" 
                               class="filter-price-max" 
                               placeholder="Máx"
                               min="0"
                               value="${state.filters.precoMax}">
                    </div>
                </div>
            </div>

            <div class="filter-group">
                <div class="filter-group-title">Localização</div>
                <div class="filter-localizacao">
                    <label class="filter-label" for="${containerId}-bairro-select">
                        Bairro
                    </label>
                    <select id="${containerId}-bairro-select"
                            class="filter-bairro-select">
                        <option value="">Todos os bairros</option>
                        ${Array.isArray(state.bairros) ? state.bairros.map(bairro => `
                            <option value="${bairro}" ${state.filters.bairro === bairro ? 'selected' : ''}>
                                ${bairro}
                            </option>
                        `).join('') : ''}
                    </select>
                </div>
            </div>

            <button class="btn-clear-filters btn-clear-all">
                <i class="fas fa-eraser"></i> Limpar filtros
            </button>
        `;

        setupFilterEvents(container);
    }

    function setupFilterEvents(container) {
        const searchInput = container.querySelector('.filter-search-input');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    state.filters.busca = e.target.value.trim();
                    syncFilters();
                    state.currentPage = 1;
                    applyFilters();
                }, 300);
            });
        }

        container.querySelectorAll('.filter-cat-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const catId = cb.value;
                if (cb.checked) {
                    if (!state.filters.categorias.includes(catId)) {
                        state.filters.categorias.push(catId);
                    }
                } else {
                    state.filters.categorias = state.filters.categorias.filter(c => c !== catId);
                }
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        });

        const priceMin = container.querySelector('.filter-price-min');
        const priceMax = container.querySelector('.filter-price-max');
        if (priceMin) {
            priceMin.addEventListener('input', (e) => {
                state.filters.precoMin = e.target.value;
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        }
        if (priceMax) {
            priceMax.addEventListener('input', (e) => {
                state.filters.precoMax = e.target.value;
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        }

        const bairroSelect = container.querySelector('.filter-bairro-select');
        if (bairroSelect) {
            bairroSelect.addEventListener('change', (e) => {
                state.filters.bairro = e.target.value;
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        }

        const distanciaRadios = container.querySelectorAll('.filter-distancia-radio');
        distanciaRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                state.filters.distancia = e.target.value;
                syncFilters();
                state.currentPage = 1;

                const grid = document.getElementById('explorarGrid');
                if (state.filters.distancia && state.filters.distancia !== '') {
                    grid.classList.add('grid-centered');
                } else {
                    grid.classList.remove('grid-centered');
                }

                applyFilters();
            });
        });

        const clearBtn = container.querySelector('.btn-clear-all');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                clearAllFilters();
            });
        }
    }

    function syncFilters() {
        ['sidebarFiltersContent', 'mobileFiltersContent'].forEach(containerId => {
            const container = document.getElementById(containerId);
            if (!container) return;

            const searchInput = container.querySelector('.filter-search-input');
            if (searchInput && document.activeElement !== searchInput) {
                searchInput.value = state.filters.busca;
            }

            container.querySelectorAll('.filter-cat-checkbox').forEach(cb => {
                cb.checked = state.filters.categorias.includes(cb.value);
            });

            const priceMin = container.querySelector('.filter-price-min');
            if (priceMin && document.activeElement !== priceMin) {
                priceMin.value = state.filters.precoMin;
            }

            const priceMax = container.querySelector('.filter-price-max');
            if (priceMax && document.activeElement !== priceMax) {
                priceMax.value = state.filters.precoMax;
            }

            const bairroSelect = container.querySelector('.filter-bairro-select');
            if (bairroSelect && document.activeElement !== bairroSelect) {
                bairroSelect.value = state.filters.bairro;
            }

            container.querySelectorAll('.filter-distancia-radio').forEach(radio => {
                radio.checked = radio.value === state.filters.distancia;
            });
        });
    }

    function clearAllFilters() {
        state.filters = {
            busca: '',
            categorias: [],
            precoMin: '',
            precoMax: '',
            bairro: '',
            distancia: '',
            ordenacao: state.filters.ordenacao
        };
        state.currentPage = 1;
        syncFilters();

        const grid = document.getElementById('explorarGrid');
        grid.classList.remove('grid-centered');

        applyFilters();
    }

    function applyFilters() {
        let results = [...state.profissionais];

        if (state.filters.busca) {
            const termo = state.filters.busca.toLowerCase();
            results = results.filter(prof => {
                const nomeMatch = (prof.nome || '').toLowerCase().includes(termo);
                const descMatch = (prof.descricao || '').toLowerCase().includes(termo);
                const servicoMatch = state.servicos.some(s =>
                    s.id_profissional_fk == prof.id &&
                    ((s.nome || '').toLowerCase().includes(termo) ||
                        (s.descricao || '').toLowerCase().includes(termo))
                );
                return nomeMatch || descMatch || servicoMatch;
            });
        }

        if (state.filters.categorias.length > 0) {
            results = results.filter(prof => {
                return state.servicos.some(s =>
                    s.id_profissional_fk == prof.id &&
                    state.filters.categorias.includes(String(s.id_categoria_fk))
                );
            });
        }

        if (state.filters.precoMin || state.filters.precoMax) {
            const min = state.filters.precoMin ? parseFloat(state.filters.precoMin) : 0;
            const max = state.filters.precoMax ? parseFloat(state.filters.precoMax) : Infinity;

            results = results.filter(prof => {
                const servicosDoProf = state.servicos.filter(s => s.id_profissional_fk == prof.id);
                if (servicosDoProf.length === 0) return false;
                return servicosDoProf.some(s => {
                    const preco = parseFloat(s.preco);
                    return preco >= min && preco <= max;
                });
            });
        }

        if (state.filters.bairro) {
            const bairroFiltro = state.filters.bairro.toLowerCase();
            results = results.filter(prof => {
                const endereco = getEndereco(prof.id);
                if (!endereco || !endereco.bairro) return false;
                return endereco.bairro.toLowerCase() === bairroFiltro;
            });
        }

        const ordenacao = state.filters.ordenacao;
        results.sort((a, b) => {
            if (ordenacao === 'nome') {
                return (a.nome || '').localeCompare(b.nome || '');
            }
            if (ordenacao === 'menor_preco') {
                return getMenorPreco(a.id) - getMenorPreco(b.id);
            }
            if (ordenacao === 'maior_preco') {
                return getMenorPreco(b.id) - getMenorPreco(a.id);
            }
            return 0;
        });

        state.filteredResults = results;
        state.totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));

        if (state.currentPage > state.totalPages) {
            state.currentPage = state.totalPages;
        }

        renderGrid();
        renderPagination();
        updateResultsCount();
    }

    function getMenorPreco(profId) {
        const servicosDoProf = state.servicos.filter(s => s.id_profissional_fk == profId);
        if (servicosDoProf.length === 0) return 999999;
        return Math.min(...servicosDoProf.map(s => parseFloat(s.preco) || 999999));
    }

    function getEndereco(profId) {
        return state.enderecos.find(e => e.id_profissional_fk == profId) || null;
    }

    function renderGrid() {
        const grid = document.getElementById('explorarGrid');
        if (!grid) return;

        const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = state.filteredResults.slice(start, end);

        const labelPlural = labelEntidade === 'profissional' ? 'profissionais' : 'estabelecimentos';

        if (state.filteredResults.length === 0) {
            grid.innerHTML = `
                <div class="explorar-empty">
                    <div class="explorar-empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>Nenhum ${labelEntidade} encontrado</h3>
                    <p>Tente ajustar os filtros ou buscar por outro termo para encontrar resultados.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = pageItems.map((prof, index) => {
            const endereco = getEndereco(prof.id);
            const servicosDoProf = state.servicos.filter(s => s.id_profissional_fk == prof.id);
            const menorPreco = servicosDoProf.length > 0
                ? Math.min(...servicosDoProf.map(s => parseFloat(s.preco)))
                : null;
            const bairro = endereco ? `${endereco.bairro}, ${endereco.cidade}` : '';
            const descricao = prof.descricao || 'Profissional de estética e beleza';

            return `
                <div class="explorar-card" style="animation-delay: ${index * 0.05}s;">
                    <div class="explorar-card-img-wrapper">
                        <img class="explorar-card-img" 
                             src="public/assets/images/botox.jpg" 
                             alt="${prof.nome}"
                             onerror="this.src='public/assets/images/Florence-estetica.jpg'">
                    </div>
                    <div class="explorar-card-body">
                        <h4 class="explorar-card-name">${prof.nome}</h4>
                        ${bairro ? `
                            <div class="explorar-card-location">
                                <i class="fas fa-map-marker-alt"></i> ${bairro}
                            </div>
                        ` : ''}
                        <p class="explorar-card-desc">${descricao}</p>
                        <div class="explorar-card-footer">
                            ${menorPreco !== null ? `
                                <div class="explorar-card-price">
                                    <span class="explorar-card-price-label">A partir de</span>
                                    <span class="explorar-card-price-value">R$ ${menorPreco.toFixed(2).replace('.', ',')}</span>
                                </div>
                            ` : '<div></div>'}
                            <a href="agendamento?profissional=${prof.id}" class="btn-ver-perfil">
                                Conhecer <i class="fas fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderSkeletons() {
        const grid = document.getElementById('explorarGrid');
        if (!grid) return;

        let skeletons = '';
        for (let i = 0; i < 6; i++) {
            skeletons += `
                <div class="skeleton-card">
                    <div class="skeleton-img"></div>
                    <div class="skeleton-body">
                        <div class="skeleton-line medium"></div>
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line long"></div>
                        <div class="skeleton-line long"></div>
                        <div class="skeleton-line-row">
                            <div class="skeleton-price"></div>
                            <div class="skeleton-btn"></div>
                        </div>
                    </div>
                </div>
            `;
        }
        grid.innerHTML = skeletons;
    }

    function renderPagination() {
        const container = document.getElementById('explorarPagination');
        if (!container) return;

        if (state.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <button class="pagination-btn pagination-arrow" 
                    data-page="${state.currentPage - 1}"
                    ${state.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const pages = getPaginationPages(state.currentPage, state.totalPages);
        pages.forEach(p => {
            if (p === '...') {
                html += `<span class="pagination-ellipsis">...</span>`;
            } else {
                html += `
                    <button class="pagination-btn ${p === state.currentPage ? 'active' : ''}"
                            data-page="${p}">
                        ${p}
                    </button>
                `;
            }
        });

        html += `
            <button class="pagination-btn pagination-arrow"
                    data-page="${state.currentPage + 1}"
                    ${state.currentPage === state.totalPages ? 'disabled' : ''}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;

        container.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
                    state.currentPage = page;
                    renderGrid();
                    renderPagination();
                    updateResultsCount();
                    document.querySelector('.results-toolbar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function getPaginationPages(current, total) {
        const pages = [];
        if (total <= 7) {
            for (let i = 1; i <= total; i++) pages.push(i);
            return pages;
        }
        pages.push(1);
        if (current > 3) pages.push('...');
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 2) pages.push('...');
        pages.push(total);
        return pages;
    }

    function updateResultsCount() {
        const countEl = document.getElementById('resultsCount');
        if (!countEl) return;

        const total = state.filteredResults.length;
        const start = (state.currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = Math.min(state.currentPage * ITEMS_PER_PAGE, total);
        const labelPlural = labelEntidade === 'profissional' ? 'profissionais' : 'estabelecimentos';
        const label = total === 1 ? labelEntidade : labelPlural;

        if (total === 0) {
            countEl.innerHTML = `Nenhum ${labelEntidade} encontrado`;
        } else {
            countEl.innerHTML = `Mostrando <strong>${start}-${end}</strong> de <strong>${total}</strong> ${label}`;
        }
    }

    function setupEventListeners() {
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                state.filters.ordenacao = e.target.value;
                state.currentPage = 1;
                applyFilters();
            });
        }

        const btnMobileFilters = document.getElementById('btnMobileFilters');
        const filtersOverlay = document.getElementById('filtersOverlay');
        const filtersModal = document.getElementById('filtersModal');
        const closeModal = document.getElementById('closeFiltersModal');
        const btnApply = document.getElementById('btnApplyFilters');
        const btnClearMobile = document.getElementById('btnClearMobile');

        function openFiltersModal() {
            filtersOverlay.classList.add('active');
            filtersModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeFiltersModal() {
            filtersOverlay.classList.remove('active');
            filtersModal.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (btnMobileFilters) btnMobileFilters.addEventListener('click', openFiltersModal);
        if (filtersOverlay) filtersOverlay.addEventListener('click', closeFiltersModal);
        if (closeModal) closeModal.addEventListener('click', closeFiltersModal);
        if (btnApply) btnApply.addEventListener('click', closeFiltersModal);
        if (btnClearMobile) {
            btnClearMobile.addEventListener('click', () => {
                clearAllFilters();
            });
        }
    }
}