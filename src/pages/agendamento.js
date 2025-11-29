import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilBanner from "../components/PerfilBanner.js";
import ServiceCard from "../components/ServiceCard.js";
import ApiService from "../utils/api.js";
import { notify } from "../components/Notification.js";
import { handleError } from "../utils/errorHandler.js";

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
	agendamento.className = 'agendamento';
	agendamento.innerHTML = '';

	// Loading
	const loadingContainer = document.createElement('div');
	loadingContainer.className = 'text-center my-5';
	loadingContainer.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div>';
	agendamento.appendChild(loadingContainer);

	const divCards = document.createElement('div');
	divCards.className = 'cards';

	root.appendChild(agendamento);
	root.appendChild(divCards);

	// Footer
	const footerContainer = document.getElementById('footer');
	footerContainer.innerHTML = '';
	footerContainer.style.marginTop = '60px';
	const footer = Footer();
	footerContainer.appendChild(footer);

	// Obtém parâmetro da URL
	function getUrlParameter(name) {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(name);
	}

	// Carrega dados do profissional
	async function carregarDadosProfissional() {
		try {
			const profissionalId = getUrlParameter('profissional');
			
			if (!profissionalId) {
				const agnd = PerfilBanner();
				loadingContainer.remove();
				agendamento.appendChild(agnd);
				return;
			}

			const api = new ApiService();
			
			// Busca profissional
			const profissional = await api.buscarProfissional(profissionalId);
			if (!profissional || !profissional.id) {
				throw new Error('Profissional não encontrado');
			}

			// Busca endereço
			let endereco = null;
			try {
				endereco = await api.buscarEnderecoPorProfissional(profissional.id);
			} catch (error) {
				console.error('Erro ao buscar endereço:', error);
			}

			// Busca telefone
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
					servicos = todosServicos.filter(s => {
						const servicoProfId = s.id_profissional_fk || s.id_profissional;
						const profId = profissional.id;
						return servicoProfId == profId || 
						       parseInt(servicoProfId) === parseInt(profId) ||
						       String(servicoProfId) === String(profId);
					});
					console.log(`Encontrados ${servicos.length} serviços para o profissional ${profissional.id}`);
				} else {
					console.warn('API retornou serviços em formato inválido:', todosServicos);
				}
			} catch (error) {
				console.error('Erro ao buscar serviços:', error);
				handleError(error, 'AgendamentoPage - buscarServicos');
			}

			// Renderiza banner e serviços
			loadingContainer.remove();
			const agnd = PerfilBanner(profissional, endereco, telefone);
			agendamento.appendChild(agnd);

			if (servicos.length > 0) {
				servicos.forEach(servico => {
					const card = ServiceCard({
						id: servico.id,
						nome: servico.nome,
						descricao: servico.descricao,
						imagem: servico.imagem || "public/assets/images/botox.jpg",
						preco: servico.preco || servico.valor
					}, profissional);
					divCards.appendChild(card);
				});
			} else {
				const mensagem = document.createElement('div');
				mensagem.className = 'alert alert-info text-center';
				mensagem.textContent = 'Nenhum serviço disponível no momento.';
				divCards.appendChild(mensagem);
			}

		} catch (error) {
			loadingContainer.remove();
			handleError(error, 'AgendamentoPage - carregarDadosProfissional');
			const agnd = PerfilBanner();
			agendamento.appendChild(agnd);
		}
	}

	carregarDadosProfissional();
}
