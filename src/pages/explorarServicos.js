import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import ApiService from "../utils/api.js";
import AgendamentoModal from "../components/AgendamentoModal.js";

const ITEMS_PER_PAGE = 15;

/**
 * Pagina de Exploracao de Servicos
 * Lista todos os servicos cadastrados, independente do profissional.
 * Permite filtrar por: busca por nome, categoria, preco e localizacao.
 */
export default function renderExplorarServicosPage() {
    const root = document.getElementById("root");
    if (!root) return;

    root.innerHTML = "";
    root.style.minHeight = "100vh";
    root.style.display = "flex";
    root.style.flexDirection = "column";

    // Navbar
    const navContainer = document.getElementById("navbar");
    if (navContainer) {
        navContainer.innerHTML = "";
        navContainer.appendChild(NavBar());
    }

    // Pagina
    const page = document.createElement("div");
    page.className = "explorar-page";
    page.style.flex = "1";
    page.style.display = "flex";
    page.style.flexDirection = "column";

    // Banner
    const banner = document.createElement("div");
    banner.className = "explorar-banner";
    banner.innerHTML = `
        <h1>Serviços</h1>
        <p>Explore todos os serviços disponíveis e agende com o melhor profissional</p>
    `;

    // Wrapper
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "explorar-content";
    contentWrapper.style.flex = "1";
    contentWrapper.style.display = "flex";
    contentWrapper.style.maxWidth = "1400px";
    contentWrapper.style.margin = "0 auto";
    contentWrapper.style.padding = "30px 20px";
    contentWrapper.style.gap = "30px";
    contentWrapper.style.width = "100%";
    contentWrapper.style.boxSizing = "border-box";

    // Sidebar desktop
    const sidebar = document.createElement("aside");
    sidebar.className = "explorar-sidebar";
    sidebar.id = "sidebarDesktop";
    sidebar.style.flex = "0 0 320px";
    sidebar.style.background = "white";
    sidebar.style.borderRadius = "12px";
    sidebar.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
    sidebar.style.padding = "20px";
    sidebar.style.height = "fit-content";
    sidebar.style.position = "sticky";
    sidebar.style.top = "20px";
    sidebar.style.alignSelf = "flex-start";
    sidebar.style.maxHeight = "calc(100vh - 140px)";
    sidebar.style.overflowY = "auto";

    const sidebarInner = document.createElement("div");
    sidebarInner.className = "sidebar-card";
    sidebarInner.innerHTML = `
        <h3 class="sidebar-title">
            <i class="fas fa-sliders-h"></i> Filtros
        </h3>
        <div id="sidebarFiltersContent"></div>
    `;
    sidebar.appendChild(sidebarInner);

    // Area principal
    const mainArea = document.createElement("div");
    mainArea.className = "explorar-main";
    mainArea.style.flex = "1";
    mainArea.style.minWidth = "0";

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
                    <option value="duracao">Menor duração</option>
                </select>
            </div>
        </div>
        <div class="explorar-grid" id="explorarGrid"></div>
        <div class="explorar-pagination" id="explorarPagination"></div>
    `;

    contentWrapper.appendChild(sidebar);
    contentWrapper.appendChild(mainArea);

    // Modal filtros mobile
    const mobileFiltersModal = document.createElement("div");
    mobileFiltersModal.id = "mobileFiltersModalContainer";
    mobileFiltersModal.innerHTML = `
        <div class="filters-modal-overlay" id="filtersOverlay"></div>
        <div class="filters-modal" id="filtersModal">
            <div class="filters-modal-header">
                <h3><i class="fas fa-sliders-h"></i> Filtros</h3>
                <button class="filters-modal-close" id="closeFiltersModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="filters-modal-body" id="mobileFiltersContent"></div>
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
    const footerContainer = document.getElementById("footer");
    if (footerContainer) {
        footerContainer.innerHTML = "";
        footerContainer.style.marginTop = "auto";
        footerContainer.appendChild(Footer());
    }

    // Estado da aplicacao
    const state = {
        servicos: [],
        profissionais: [],
        categorias: [],
        enderecos: [],
        bairros: [],
        filteredResults: [],
        currentPage: 1,
        totalPages: 1,
        loading: true,
        filters: {
            busca: "",
            categorias: [],
            precoMin: "",
            precoMax: "",
            bairro: "",
            ordenacao: "nome",
        },
    };

    init();

    async function init() {
        renderSkeletons();
        await carregarDados();
        renderFilters("sidebarFiltersContent");
        renderFilters("mobileFiltersContent");
        applyFilters();
        setupEventListeners();
    }

    async function carregarDados() {
        const api = new ApiService();
        try {
            const [servicos, profissionais, categorias, enderecos] =
                await Promise.allSettled([
                    api.listarServicos(),
                    api.listarProfissionais(),
                    api.listarCategorias(),
                    api.request("/endereco", "GET").catch(() => []),
                ]);

            state.servicos = getSettledValue(servicos, []);
            state.profissionais = getSettledValue(profissionais, []);
            state.categorias = getSettledValue(categorias, []);
            state.enderecos = getSettledValue(enderecos, []);

            // Monta lista de bairros a partir dos enderecos dos profissionais
            if (Array.isArray(state.enderecos)) {
                const bairrosSet = new Set();
                state.enderecos.forEach((e) => {
                    if (e.bairro) bairrosSet.add(e.bairro);
                });
                state.bairros = Array.from(bairrosSet).sort();
            }

            state.loading = false;
        } catch (error) {
            state.loading = false;
            state.servicos = [];
        }
    }

    function getSettledValue(result, fallback) {
        if (result.status === "fulfilled" && Array.isArray(result.value)) {
            return result.value;
        }
        return fallback;
    }

    function getProfissional(idProfissional) {
        return state.profissionais.find((p) => p.id == idProfissional) || null;
    }

    function getEnderecoDoProfissional(idProfissional) {
        return state.enderecos.find((e) => e.id_profissional_fk == idProfissional) || null;
    }

    function getCategoria(idCategoria) {
        return state.categorias.find((c) => c.id == idCategoria) || null;
    }

    // ============================================
    // FILTROS
    // ============================================

    function renderFilters(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const counts = getFilteredCategoryCounts();

        container.innerHTML = `
            <div class="filter-group">
                <div class="filter-group-title">Buscar</div>
                <div class="filter-search">
                    <i class="fas fa-search"></i>
                    <input type="text"
                           class="filter-search-input"
                           placeholder="Nome do serviço..."
                           value="${state.filters.busca}">
                </div>
            </div>

            <div class="filter-group">
                <div class="filter-group-title">Categorias</div>
                <div class="filter-categories">
                    ${state.categorias.map((cat) => `
                        <label class="filter-checkbox">
                            <input type="checkbox"
                                   class="filter-cat-checkbox"
                                   value="${cat.id}"
                                   ${state.filters.categorias.includes(String(cat.id)) ? "checked" : ""}>
                            <span class="checkmark"></span>
                            <span class="filter-label">${cat.nome}</span>
                            <span class="filter-count" data-cat-id="${cat.id}">${counts[cat.id] || 0}</span>
                        </label>
                    `).join("")}
                </div>
            </div>

            <div class="filter-group">
                <div class="filter-group-title">Faixa de Preço</div>
                <div class="d-flex align-items-center gap-2">
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
                    <label class="filter-label" for="${containerId}-bairro-select">Bairro</label>
                    <select id="${containerId}-bairro-select" class="filter-bairro-select">
                        <option value="">Todos os bairros</option>
                        ${Array.isArray(state.bairros)
                ? state.bairros.map((bairro) =>
                    `<option value="${bairro}" ${state.filters.bairro === bairro ? "selected" : ""}>${bairro}</option>`
                ).join("")
                : ""}
                    </select>
                </div>
            </div>

            <button class="btn-clear-filters btn-clear-all">
                <i class="fas fa-times"></i> Limpar Filtros
            </button>
        `;

        setupFilterEvents(container);
    }

    function setupFilterEvents(container) {
        const searchInput = container.querySelector(".filter-search-input");
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener("input", (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    state.filters.busca = e.target.value.trim();
                    syncFilters();
                    state.currentPage = 1;
                    applyFilters();
                }, 300);
            });
        }

        container.querySelectorAll(".filter-cat-checkbox").forEach((cb) => {
            cb.addEventListener("change", () => {
                const catId = cb.value;
                if (cb.checked) {
                    if (!state.filters.categorias.includes(catId)) {
                        state.filters.categorias.push(catId);
                    }
                } else {
                    state.filters.categorias = state.filters.categorias.filter(
                        (c) => c !== catId
                    );
                }
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        });

        const priceMin = container.querySelector(".filter-price-min");
        const priceMax = container.querySelector(".filter-price-max");
        if (priceMin) {
            priceMin.addEventListener("input", (e) => {
                state.filters.precoMin = e.target.value;
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        }
        if (priceMax) {
            priceMax.addEventListener("input", (e) => {
                state.filters.precoMax = e.target.value;
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        }

        const bairroSelect = container.querySelector(".filter-bairro-select");
        if (bairroSelect) {
            bairroSelect.addEventListener("change", (e) => {
                state.filters.bairro = e.target.value;
                syncFilters();
                state.currentPage = 1;
                applyFilters();
            });
        }

        const clearBtn = container.querySelector(".btn-clear-all");
        if (clearBtn) {
            clearBtn.addEventListener("click", () => clearAllFilters());
        }
    }

    function syncFilters() {
        ["sidebarFiltersContent", "mobileFiltersContent"].forEach((containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;

            const searchInput = container.querySelector(".filter-search-input");
            if (searchInput && document.activeElement !== searchInput) {
                searchInput.value = state.filters.busca;
            }

            container.querySelectorAll(".filter-cat-checkbox").forEach((cb) => {
                cb.checked = state.filters.categorias.includes(cb.value);
            });

            const priceMin = container.querySelector(".filter-price-min");
            if (priceMin && document.activeElement !== priceMin) {
                priceMin.value = state.filters.precoMin;
            }

            const priceMax = container.querySelector(".filter-price-max");
            if (priceMax && document.activeElement !== priceMax) {
                priceMax.value = state.filters.precoMax;
            }

            const bairroSelect = container.querySelector(".filter-bairro-select");
            if (bairroSelect && document.activeElement !== bairroSelect) {
                bairroSelect.value = state.filters.bairro;
            }
        });
    }

    function clearAllFilters() {
        state.filters = {
            busca: "",
            categorias: [],
            precoMin: "",
            precoMax: "",
            bairro: "",
            ordenacao: state.filters.ordenacao,
        };
        state.currentPage = 1;
        syncFilters();
        applyFilters();
    }

    // ============================================
    // LOGICA DOS FILTROS
    // ============================================

    function applyFilters() {
        let results = [...state.servicos];

        // Busca por nome/descricao
        if (state.filters.busca) {
            const termo = state.filters.busca.toLowerCase();
            results = results.filter((s) => {
                const nomeMatch = (s.nome || "").toLowerCase().includes(termo);
                const descMatch = (s.descricao || "").toLowerCase().includes(termo);
                const prof = getProfissional(s.id_profissional_fk);
                const profMatch = prof && (prof.nome || "").toLowerCase().includes(termo);
                return nomeMatch || descMatch || profMatch;
            });
        }

        // Filtro por categoria
        if (state.filters.categorias.length > 0) {
            results = results.filter((s) =>
                state.filters.categorias.includes(String(s.id_categoria_fk))
            );
        }

        // Filtro por preco
        if (state.filters.precoMin || state.filters.precoMax) {
            const min = state.filters.precoMin ? parseFloat(state.filters.precoMin) : 0;
            const max = state.filters.precoMax ? parseFloat(state.filters.precoMax) : Infinity;
            results = results.filter((s) => {
                const preco = parseFloat(s.preco);
                return !isNaN(preco) && preco >= min && preco <= max;
            });
        }

        // Filtro por bairro (via endereco do profissional)
        if (state.filters.bairro) {
            const bairroFiltro = state.filters.bairro.toLowerCase();
            results = results.filter((s) => {
                const endereco = getEnderecoDoProfissional(s.id_profissional_fk);
                if (!endereco || !endereco.bairro) return false;
                return endereco.bairro.toLowerCase() === bairroFiltro;
            });
        }

        // Ordenacao
        const ordenacao = state.filters.ordenacao;
        results.sort((a, b) => {
            if (ordenacao === "nome") return (a.nome || "").localeCompare(b.nome || "");
            if (ordenacao === "menor_preco") return (parseFloat(a.preco) || 0) - (parseFloat(b.preco) || 0);
            if (ordenacao === "maior_preco") return (parseFloat(b.preco) || 0) - (parseFloat(a.preco) || 0);
            if (ordenacao === "duracao") return parseDuracao(a.duracao) - parseDuracao(b.duracao);
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
        updateCategoryCountsDOM();
    }

    function parseDuracao(duracao) {
        if (!duracao) return 9999;
        const parts = String(duracao).split(":").map(Number);
        if (parts.length >= 2) return parts[0] * 60 + parts[1];
        return parseInt(duracao) || 9999;
    }

    // Conta quantos servicos por categoria, ignorando o filtro de categoria
    function getFilteredCategoryCounts() {
        const contadorCategorias = {};
        if (!Array.isArray(state.servicos) || !Array.isArray(state.categorias))
            return contadorCategorias;

        let filteredWithoutCat = [...state.servicos];

        if (state.filters.busca) {
            const termo = state.filters.busca.toLowerCase();
            filteredWithoutCat = filteredWithoutCat.filter((s) => {
                const nomeMatch = (s.nome || "").toLowerCase().includes(termo);
                const descMatch = (s.descricao || "").toLowerCase().includes(termo);
                const prof = getProfissional(s.id_profissional_fk);
                const profMatch = prof && (prof.nome || "").toLowerCase().includes(termo);
                return nomeMatch || descMatch || profMatch;
            });
        }

        if (state.filters.precoMin || state.filters.precoMax) {
            const min = state.filters.precoMin ? parseFloat(state.filters.precoMin) : 0;
            const max = state.filters.precoMax ? parseFloat(state.filters.precoMax) : Infinity;
            filteredWithoutCat = filteredWithoutCat.filter((s) => {
                const preco = parseFloat(s.preco);
                return !isNaN(preco) && preco >= min && preco <= max;
            });
        }

        if (state.filters.bairro) {
            const bairroFiltro = state.filters.bairro.toLowerCase();
            filteredWithoutCat = filteredWithoutCat.filter((s) => {
                const endereco = getEnderecoDoProfissional(s.id_profissional_fk);
                if (!endereco || !endereco.bairro) return false;
                return endereco.bairro.toLowerCase() === bairroFiltro;
            });
        }

        state.categorias.forEach((cat) => {
            contadorCategorias[cat.id] = filteredWithoutCat.filter(
                (s) => s.id_categoria_fk == cat.id
            ).length;
        });

        return contadorCategorias;
    }

    function updateCategoryCountsDOM() {
        const counts = getFilteredCategoryCounts();
        ["sidebarFiltersContent", "mobileFiltersContent"].forEach((containerId) => {
            const container = document.getElementById(containerId);
            if (!container) return;
            container.querySelectorAll(".filter-count").forEach((el) => {
                const catId = el.getAttribute("data-cat-id");
                if (catId) el.textContent = counts[catId] || 0;
            });
        });
    }

    // ============================================
    // GRID DE CARDS
    // ============================================

    function renderGrid() {
        const grid = document.getElementById("explorarGrid");
        if (!grid) return;

        const start = (state.currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = state.filteredResults.slice(start, end);

        if (state.filteredResults.length === 0) {
            grid.innerHTML = `
                <div class="explorar-empty">
                    <div class="explorar-empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>Nenhum serviço encontrado</h3>
                    <p>Tente ajustar os filtros ou buscar por outro termo.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = pageItems.map((servico, index) => {
            const prof = getProfissional(servico.id_profissional_fk);
            const endereco = prof ? getEnderecoDoProfissional(prof.id) : null;
            const cat = getCategoria(servico.id_categoria_fk);

            const nomeProfissional = prof ? (prof.nome || prof.razao_social || "Profissional") : "Profissional";
            const localizacao = endereco ? `${endereco.bairro || ""}${endereco.cidade ? ", " + endereco.cidade : ""}` : "";
            const preco = parseFloat(servico.preco);
            const precoFormatado = !isNaN(preco) ? preco.toFixed(2).replace(".", ",") : null;

            // Formata duracao ex: "00:45:00" -> "45 min"
            let duracaoFormatada = "";
            if (servico.duracao) {
                const parts = String(servico.duracao).split(":").map(Number);
                if (parts.length >= 2) {
                    const h = parts[0];
                    const m = parts[1];
                    if (h > 0 && m > 0) duracaoFormatada = `${h}h ${m}min`;
                    else if (h > 0) duracaoFormatada = `${h}h`;
                    else duracaoFormatada = `${m}min`;
                }
            }

            return `
                <div class="explorar-card servico-card" style="animation-delay: ${index * 0.05}s;"
                     data-servico-id="${servico.id}"
                     data-profissional-id="${servico.id_profissional_fk}">
                    <div class="explorar-card-img-wrapper">
                        <img class="explorar-card-img"
                             src="public/assets/images/botox.jpg"
                             alt="${servico.nome}"
                             onerror="this.src='public/assets/images/Florence-estetica.jpg'">
                        ${cat ? `<span class="explorar-card-badge">${cat.nome}</span>` : ""}
                    </div>
                    <div class="explorar-card-body">
                        <h4 class="explorar-card-name">${servico.nome || "Serviço"}</h4>
                        <div class="servico-card-profissional">
                            <i class="fas fa-user-circle"></i>
                            <span>${nomeProfissional}</span>
                        </div>
                        ${localizacao ? `
                            <div class="explorar-card-location">
                                <i class="fas fa-map-marker-alt"></i> ${localizacao}
                            </div>
                        ` : ""}
                        ${servico.descricao ? `
                            <p class="explorar-card-desc">${servico.descricao}</p>
                        ` : ""}
                        <div class="explorar-card-footer">
                            <div class="explorar-card-price">
                                ${duracaoFormatada ? `
                                    <span class="explorar-card-price-label">
                                        <i class="fas fa-clock"></i> ${duracaoFormatada}
                                    </span>
                                ` : ""}
                                ${precoFormatado ? `
                                    <span class="explorar-card-price-value">R$ ${precoFormatado}</span>
                                ` : ""}
                            </div>
                            <button class="btn-ver-perfil btn-agendar-servico"
                                    data-servico-id="${servico.id}"
                                    data-profissional-id="${servico.id_profissional_fk}">
                                Agendar <i class="fas fa-calendar-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        // Eventos de agendamento nos cards
        grid.querySelectorAll(".btn-agendar-servico").forEach((btn) => {
            btn.addEventListener("click", () => {
                const servicoId = btn.dataset.servicoId;
                const profissionalId = btn.dataset.profissionalId;
                const servico = state.servicos.find((s) => s.id == servicoId);
                const prof = state.profissionais.find((p) => p.id == profissionalId);
                if (servico && prof) {
                    AgendamentoModal(servico, prof);
                }
            });
        });
    }

    function renderSkeletons() {
        const grid = document.getElementById("explorarGrid");
        if (!grid) return;
        let skeletons = "";
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

    // ============================================
    // PAGINACAO
    // ============================================

    function renderPagination() {
        const container = document.getElementById("explorarPagination");
        if (!container) return;

        if (state.totalPages <= 1) {
            container.innerHTML = "";
            return;
        }

        let html = `
            <button class="pagination-btn pagination-arrow"
                    data-page="${state.currentPage - 1}"
                    ${state.currentPage === 1 ? "disabled" : ""}>
                <i class="fas fa-chevron-left"></i>
            </button>
        `;

        const pages = getPaginationPages(state.currentPage, state.totalPages);
        pages.forEach((p) => {
            if (p === "...") {
                html += `<span class="pagination-ellipsis">...</span>`;
            } else {
                html += `
                    <button class="pagination-btn ${p === state.currentPage ? "active" : ""}"
                            data-page="${p}">${p}</button>
                `;
            }
        });

        html += `
            <button class="pagination-btn pagination-arrow"
                    data-page="${state.currentPage + 1}"
                    ${state.currentPage === state.totalPages ? "disabled" : ""}>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        container.innerHTML = html;

        container.querySelectorAll(".pagination-btn[data-page]").forEach((btn) => {
            btn.addEventListener("click", () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= state.totalPages && page !== state.currentPage) {
                    state.currentPage = page;
                    renderGrid();
                    renderPagination();
                    updateResultsCount();
                    document
                        .querySelector(".results-toolbar")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        if (current > 3) pages.push("...");
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 2) pages.push("...");
        pages.push(total);
        return pages;
    }

    function updateResultsCount() {
        const countEl = document.getElementById("resultsCount");
        if (!countEl) return;
        const total = state.filteredResults.length;
        const start = (state.currentPage - 1) * ITEMS_PER_PAGE + 1;
        const end = Math.min(state.currentPage * ITEMS_PER_PAGE, total);
        if (total === 0) {
            countEl.innerHTML = `Nenhum serviço encontrado`;
        } else {
            countEl.innerHTML = `Mostrando <strong>${start}-${end}</strong> de <strong>${total}</strong> serviço${total !== 1 ? "s" : ""}`;
        }
    }

    // ============================================
    // EVENT LISTENERS (SIDEBAR MOBILE + SORT)
    // ============================================

    function setupEventListeners() {
        const sortSelect = document.getElementById("sortSelect");
        if (sortSelect) {
            sortSelect.addEventListener("change", (e) => {
                state.filters.ordenacao = e.target.value;
                state.currentPage = 1;
                applyFilters();
            });
        }

        const btnMobileFilters = document.getElementById("btnMobileFilters");
        const filtersOverlay = document.getElementById("filtersOverlay");
        const filtersModal = document.getElementById("filtersModal");
        const closeModal = document.getElementById("closeFiltersModal");
        const btnApply = document.getElementById("btnApplyFilters");
        const btnClearMobile = document.getElementById("btnClearMobile");

        function openFiltersModal() {
            filtersOverlay.classList.add("active");
            filtersModal.classList.add("active");
            document.body.style.overflow = "hidden";
        }

        function closeFiltersModal() {
            filtersOverlay.classList.remove("active");
            filtersModal.classList.remove("active");
            document.body.style.overflow = "";
        }

        if (btnMobileFilters) btnMobileFilters.addEventListener("click", openFiltersModal);
        if (filtersOverlay) filtersOverlay.addEventListener("click", closeFiltersModal);
        if (closeModal) closeModal.addEventListener("click", closeFiltersModal);
        if (btnApply) btnApply.addEventListener("click", closeFiltersModal);
        if (btnClearMobile) btnClearMobile.addEventListener("click", () => clearAllFilters());
    }
}
