import NavBar from "../components/NavBar.js";
import Footer from "../components/Footer.js";

export default function renderquemSomos() {
    const Divroot = document.getElementById('root');
    Divroot.innerHTML = '';
    // Limpa possíveis estilos/classes herdados de outras páginas (como dashboard)
    Divroot.style = '';
    Divroot.className = '';

    const nav = document.getElementById('navbar');
    nav.innerHTML = '';
    const navbar = NavBar();
    nav.appendChild(navbar);

    // Container Principal da Página - Seguindo a estrutura de sobre.css
    const sobreContainer = document.createElement('div');
    sobreContainer.className = 'sobre-container fade-in';

    sobreContainer.innerHTML = `
        <!-- HERO SECTION -->
        <div class="sobre-hero">
            <div class="sobre-hero-content">
                <h1>Quem somos nós?</h1>
                <p>Conheça nossa empresa e nossa paixão pela beleza e bem-estar.</p>
            </div>
        </div>

        <!-- MISSÃO, VISÃO E VALORES -->
        <section class="sobre-mvv section">
            <div class="content-wrapper">
                <h2 style="text-align: center; margin-bottom: 40px;">Missão, Visão e Valores</h2>

                <div class="mvv-cards">
                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-bullseye"></i>
                        </div>
                        <h3>Missão</h3>
                        <p>
                            Conectar pessoas com profissionais de beleza e bem-estar de forma simples,
                            segura e acessível, promovendo autoestima e confiança.
                        </p>
                    </div>

                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-eye"></i>
                        </div>
                        <h3>Visão</h3>
                        <p>
                            Ser a principal plataforma de beleza e bem-estar, reconhecida pela qualidade,
                            confiabilidade e proximidade com nossos usuários.
                        </p>
                    </div>

                    <div class="mvv-card">
                        <div class="mvv-icon">
                            <i class="fas fa-heart"></i>
                        </div>
                        <h3>Valores</h3>
                        <ul style="list-style: none; padding: 0; text-align: left;">
                            <li style="margin-bottom: 10px;"><i class="fas fa-check-circle me-2" style="color: var(--accent-color);"></i> Transparência em todas as relações</li>
                            <li style="margin-bottom: 10px;"><i class="fas fa-check-circle me-2" style="color: var(--accent-color);"></i> Foco no usuário e sua experiência</li>
                            <li style="margin-bottom: 10px;"><i class="fas fa-check-circle me-2" style="color: var(--accent-color);"></i> Inovação constante em serviços</li>
                            <li style="margin-bottom: 10px;"><i class="fas fa-check-circle me-2" style="color: var(--accent-color);"></i> Respeito e inclusão para todos</li>
                            <li style="margin-bottom: 10px;"><i class="fas fa-check-circle me-2" style="color: var(--accent-color);"></i> Compromisso com qualidade</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA SECTION -->
        <section class="sobre-cta">
            <div class="sobre-cta-content">
                <h2>Faça parte da nossa comunidade</h2>
                <p>
                    Cadastre-se agora e comece a aproveitar todos os recursos disponíveis na nossa plataforma.
                </p>
                <a href="register" class="btn btn-primary" style="background: var(--white-color) !important; color: var(--primary-color) !important; border: none; padding: 15px 40px; border-radius: 50px; font-weight: 700; text-decoration: none; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.2);">
                    Criar minha conta
                </a>
            </div>
        </section>
    `;

    Divroot.appendChild(sobreContainer);

    // Footer
    const footerContainer = document.getElementById('footer');
    footerContainer.innerHTML = '';
    footerContainer.style.marginTop = '0';
    const footer = Footer();
    footerContainer.appendChild(footer);

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
}
