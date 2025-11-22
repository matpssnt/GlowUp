import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilSidebar from "../components/PerfilSidebar.js";
import AgendamentoCard from "../components/AgendamentoCard.js";
import ApiService from "../utils/api.js";
import authState from "../utils/AuthState.js";

export default function renderAgendamentosPage() {
    // Verifica se está autenticado
    if (!authState.isAuth()) {
        window.location.href = '/login';
        return;
    }
    
    // Verifica se é cliente
    const userType = authState.getUserType();
    if (userType !== 'cliente') {
        window.location.href = '/home';
        return;
    }

    const root = document.getElementById('root');
    root.innerHTML = '';
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.minHeight = '100vh';
    root.style.width = '100%';
    root.style.boxSizing = 'border-box';
    root.style.backgroundColor = '#f5f5f5';

    // NavBar
    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);

    // Container principal com sidebar e conteúdo
    const mainContainer = document.createElement('div');
    mainContainer.className = 'd-flex';
    mainContainer.style.minHeight = 'calc(100vh - 200px)';
    mainContainer.style.padding = '20px';
    mainContainer.style.gap = '20px';

    // Sidebar
    const sidebar = PerfilSidebar();

    // Container de conteúdo (título + lista de agendamentos)
    const contentContainer = document.createElement('div');
    contentContainer.className = 'flex-grow-1';
    contentContainer.style.flex = '1';

    // Título
    const titulo = document.createElement('h1');
    titulo.className = 'mb-4';
    titulo.textContent = 'Meus Agendamentos';

    // Container para lista de agendamentos
    const listaContainer = document.createElement('div');
    listaContainer.id = 'listaAgendamentos';
    
    // Loading
    const loading = document.createElement('div');
    loading.className = 'text-center';
    loading.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';

    // Mensagem vazia
    const mensagemVazia = document.createElement('div');
    mensagemVazia.className = 'alert alert-info d-none';
    mensagemVazia.textContent = 'Você não possui agendamentos.';

    // Monta estrutura do conteúdo
    contentContainer.appendChild(titulo);
    contentContainer.appendChild(listaContainer);

    // Monta layout: sidebar + conteúdo
    mainContainer.appendChild(sidebar);
    mainContainer.appendChild(contentContainer);
    root.appendChild(mainContainer);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = 'auto';
    const footer = Footer();
    footerContainer.appendChild(footer);

    // Carrega agendamentos
    async function carregarAgendamentos() {
        listaContainer.innerHTML = '';
        listaContainer.appendChild(loading);

        try {
            const api = new ApiService();
            const agendamentos = await api.listarAgendamentos();
            
            // Remove loading
            loading.remove();
            
            // Verifica se retornou array
            if (!Array.isArray(agendamentos)) {
                listaContainer.appendChild(mensagemVazia);
                mensagemVazia.classList.remove('d-none');
                return;
            }
            
            // Filtra agendamentos do cliente logado
            const cadastroId = authState.getCadastroId() || authState.getUser()?.id;
            
            // Filtra por ID do cadastro (tenta múltiplos campos possíveis)
            const agendamentosCliente = agendamentos.filter(a => 
                a.id_cliente_fk === cadastroId || 
                a.id_cliente === cadastroId ||
                a.idCadastro_fk === cadastroId
            );
            
            if (agendamentosCliente.length === 0) {
                listaContainer.appendChild(mensagemVazia);
                mensagemVazia.classList.remove('d-none');
                return;
            }
            
            // Cria cards para cada agendamento
            agendamentosCliente.forEach(agendamento => {
                const card = AgendamentoCard(agendamento);
                listaContainer.appendChild(card);
                
                // Escuta evento de cancelar
                card.addEventListener('cancelarAgendamento', async (e) => {
                    const id = e.detail.id;
                    await cancelarAgendamento(id);
                });
            });
            
        } catch (error) {
            loading.remove();
            const erro = document.createElement('div');
            erro.className = 'alert alert-danger';
            erro.textContent = 'Erro ao carregar agendamentos: ' + error.message;
            listaContainer.appendChild(erro);
        }
    }
    
    // Função para cancelar agendamento
    async function cancelarAgendamento(id) {
        try {
            const api = new ApiService();
            await api.cancelarAgendamento(id);
            alert('Agendamento cancelado com sucesso!');
            carregarAgendamentos(); // Recarrega lista
        } catch (error) {
            alert('Erro ao cancelar agendamento: ' + error.message);
        }
    }
    
    // Inicia carregamento
    carregarAgendamentos();
}

