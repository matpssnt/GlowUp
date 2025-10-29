import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import PerfilBanner from "../components/PerfilBanner.js";
import MiniCarrossel from "../components/MiniCarrosel.js";

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

	const pageContainer = document.createElement('div');
	pageContainer.className = 'container my-5';

	const perfilBanner = PerfilBanner();
	pageContainer.appendChild(perfilBanner);

	const carrossel = MiniCarrossel();
	pageContainer.appendChild(carrossel);

	root.appendChild(pageContainer);

	const footerContainer = document.getElementById('footer');
	footerContainer.innerHTML = '';
	footerContainer.style.marginTop = '60px';
	const footer = Footer();
	footerContainer.appendChild(footer);
}