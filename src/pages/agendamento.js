import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilBanner from "../components/PerfilBanner.js";
import ServiceCard from "../components/ServiceCard.js";

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

	const agnd = PerfilBanner();
	agendamento.appendChild(agnd);

	const divCards = document.createElement('div');
	divCards.className = 'cards';

	root.appendChild(agendamento);
	root.appendChild(divCards);

	const servicos = [
		{ nome: "Botox", descricao: "Aplicação de botox facial.", imagem: "public/assets/images/botox.jpg" },
		{ nome: "Massagem", descricao: "Massagem relaxante corporal.", imagem: "public/assets/images/sla.avif" },
		{ nome: "Manicure", descricao: "Cuidados com unhas e esmaltação.", imagem: "public/assets/images/Florence-estetica.jpg" },
		{ nome: "Botox", descricao: "Aplicação de botox facial.", imagem: "public/assets/images/botox.jpg" },
		{ nome: "Massagem", descricao: "Massagem relaxante corporal.", imagem: "public/assets/images/sla.avif" },
		{ nome: "Manicure", descricao: "Cuidados com unhas e esmaltação.", imagem: "public/assets/images/Florence-estetica.jpg" }
	];

	servicos.forEach(servico => {
		const card = ServiceCard(servico);
		divCards.appendChild(card);
	});
	
	const footerContainer = document.getElementById('footer');
	footerContainer.innerHTML = '';
	footerContainer.style.marginTop = '60px';

	const footer = Footer();
	footerContainer.appendChild(footer);

}
