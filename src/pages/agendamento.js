import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import CarouselServ from "../components/CarouselServ.js";
import carrosselProf from "../components/carrosselProf.js";
import descriptionProf from "../components/descriptionProf.js";
import CardServ from "../components/CardServ.js";

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

	// Carousel de Serviços
	const carouselServ = CarouselServ(1);
	pageContainer.appendChild(carouselServ);

	// Carrossel de Profissionais
	const carrosselProfComponent = carrosselProf();
	pageContainer.appendChild(carrosselProfComponent);

	// Descrição do Profissional
	const descriptionProfComponent = descriptionProf();
	pageContainer.appendChild(descriptionProfComponent);

	// Cards de Serviços
	const cardServ = CardServ(0);
	pageContainer.appendChild(cardServ);

	root.appendChild(pageContainer);

	const footerContainer = document.getElementById('footer');
	footerContainer.innerHTML = '';
	footerContainer.style.marginTop = '60px';
	const footer = Footer();
	footerContainer.appendChild(footer);
}