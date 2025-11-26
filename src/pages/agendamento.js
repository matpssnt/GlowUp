import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilBanner from "../components/PerfilBanner.js";
import ServiceCard from "../components/ServiceCard.js";
import ApiService from "../utils/api.js";

export default function renderAgendamentoPage() {
	const root = document.getElementById('root');
	root.innerHTML = '';
	root.style.display = 'flex';
	root.style.flexDirection = 'column';
	root.style.alignItems = 'stretch';
	root.style.minHeight = '100vh';
	root.style.width = '100%';
	root.style.boxSizing = 'border-box';

	const nav = document.getElementById('navbar');
	nav.innerHTML = '';
	const navbar = NavBar();
	nav.appendChild(navbar);

	const agendamento = document.createElement('div');
	agendamento.innerHTML = '';

	// Container para loading
	const loadingContainer = document.createElement('div');
	loadingContainer.className = 'text-center my-5';
	loadingContainer.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';
	agendamento.appendChild(loadingContainer);

	const divCards = document.createElement('div');
	divCards.className = 'cards';

	// Anexa os elementos ao root
	root.appendChild(agendamento);
	root.appendChild(divCards);

	const footerContainer = document.getElementById('footer');
	footerContainer.innerHTML = '';
	footerContainer.style.marginTop = '60px';

	const footer = Footer();
	footerContainer.appendChild(footer);

	// Função para obter parâmetro da URL
	function getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	// Função para carregar dados do profissional
	async function carregarDadosProfissional() {
		try {
			const profissionalId = getUrlParameter('profissional');
			
			if (!profissionalId) {
				// Se não tiver ID, mostra dados padrão
				const agnd = PerfilBanner();
				loadingContainer.remove();
				agendamento.appendChild(agnd);
				return;
			}

			const api = new ApiService();
			
			// Busca dados do profissional
			const profissional = await api.buscarProfissional(profissionalId);
			if (!profissional || !profissional.id) {
				throw new Error('Profissional não encontrado');
			}

			// Busca endereço do profissional
			let endereco = null;
			try {
				endereco = await api.buscarEnderecoPorProfissional(profissional.id);
			} catch (error) {
				console.error('Erro ao buscar endereço:', error);
			}

			// Busca telefone do profissional
			let telefone = null;
			try {
				telefone = await api.buscarTelefonePorProfissional(profissional.id);
			} catch (error) {
				console.error('Erro ao buscar telefone:', error);
			}

			// Busca serviços do profissional
			let servicos = [];
			try {
				const todosServicos = await api.listarServicos();
				if (Array.isArray(todosServicos)) {
					servicos = todosServicos.filter(s => s.id_profissional_fk === profissional.id);
				}
			} catch (error) {
				console.error('Erro ao buscar serviços:', error);
			}

			// Remove loading e adiciona banner com dados reais
			loadingContainer.remove();
			const agnd = PerfilBanner(profissional, endereco, telefone);
			agendamento.appendChild(agnd);

			// Adiciona cards de serviços
			if (servicos.length > 0) {
				servicos.forEach(servico => {
					const card = ServiceCard({
						nome: servico.nome,
						descricao: servico.descricao,
						imagem: servico.imagem || "public/assets/images/botox.jpg"
					});
					divCards.appendChild(card);
				});
			} else {
				// Se não houver serviços, mostra mensagem ou serviços padrão
				const mensagem = document.createElement('div');
				mensagem.className = 'alert alert-info text-center';
				mensagem.textContent = 'Nenhum serviço disponível no momento.';
				divCards.appendChild(mensagem);
			}

		} catch (error) {
			console.error('Erro ao carregar dados do profissional:', error);
			loadingContainer.remove();
			
			const erro = document.createElement('div');
			erro.className = 'alert alert-danger text-center';
			erro.textContent = 'Erro ao carregar dados do profissional: ' + error.message;
			agendamento.appendChild(erro);

			// Mostra banner padrão em caso de erro
			const agnd = PerfilBanner();
			agendamento.appendChild(agnd);
		}
	}

	// Carrega dados do profissional
	carregarDadosProfissional();
}
