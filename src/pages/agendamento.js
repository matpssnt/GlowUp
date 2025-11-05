import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilBanner from "../components/PerfilBanner.js";

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
	
	root.appendChild(agendamento);


	const footerContainer = document.getElementById('footer');
	footerContainer.innerHTML = '';
	footerContainer.style.marginTop = '60px';
	
	const footer = Footer();
	footerContainer.appendChild(footer);
	
}
