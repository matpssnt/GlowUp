import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";
import renderRegisterPage from "./register.js";

export default function renderquemSomos() {
    const Divroot = document.getElementById('root');
    Divroot.innerHTML = '';

    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    nav.appendChild(NavBar());

    const page = document.createElement('div');
    page.className = 'sobre-container fade-in';

    page.innerHTML = `
        <!-- HERO -->
        <section class="sobre-hero">
            <div class="sobre-hero-content">
                <h1>Conectando beleza, tecnologia e pessoas</h1>
                <p>
                    Conheça a GlowUp, a plataforma que conecta você aos melhores
                    profissionais de beleza e bem-estar da sua região.
                </p>
                <div class="hero-line"></div>
            </div>
        </section>

        <!-- MISSÃO, VISÃO E VALORES -->
        <section class="sobre-mvv section">
            <div class="content-wrapper">
                <h2 class="section-title">Missão, Visão e Valores</h2>

                <div class="mvv-cards">
                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <h3>Missão</h3>
                        <p>
                            Conectar pessoas com profissionais de beleza e bem-estar
                            de forma simples, segura e acessível, promovendo autoestima e confiança.
                        </p>
                    </div>

                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-eye"></i>
                        </div>
                        <h3>Visão</h3>
                        <p>
                            Ser a principal plataforma de beleza e bem-estar,
                            reconhecida pela qualidade, confiabilidade e proximidade com nossos usuários.
                        </p>
                    </div>

                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <h3>Valores</h3>
                        <ul>
                            <li>Transparência em todas as relações</li>
                            <li>Foco no usuário e sua experiência</li>
                            <li>Inovação constante em serviços</li>
                            <li>Respeito e inclusão para todos</li>
                            <li>Compromisso com qualidade</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="sobre-cta">
            <div class="sobre-cta-content">
                <h2>Faça parte da nossa comunidade</h2>
                <p>
                    Cadastre-se agora e comece a aproveitar todos os recursos disponíveis na nossa plataforma.
                </p>
                <a href="#" class="btn-primary" id="btn-register">Criar minha conta</a>
            </div>
        </section>

    `;

    Divroot.appendChild(page);

    const btnRegister = document.getElementById('btn-register');
    btnRegister?.addEventListener('click', (e) => {
        e.preventDefault();  
        renderRegisterPage(); 
    });

    // Botão WhatsApp flutuante
    if (!document.querySelector('.whatsapp-float')) {
        const whatsappFloat = document.createElement('div');
        whatsappFloat.className = 'whatsapp-float';

        const whatsappLink = document.createElement('a');
        whatsappLink.href = 'https://wa.me/5515000000000';
        whatsappLink.target = '_blank';
        whatsappLink.setAttribute('aria-label', 'Contato via WhatsApp');

        const whatsappIcon = document.createElement('i');
        whatsappIcon.className = 'fab fa-whatsapp';

        whatsappLink.appendChild(whatsappIcon);
        whatsappFloat.appendChild(whatsappLink);
        document.body.appendChild(whatsappFloat);
    }

    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.appendChild(Footer());
}
