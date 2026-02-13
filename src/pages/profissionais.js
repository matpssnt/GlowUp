import renderExplorarPage from './explorar.js';

export default function renderProfissionaisPage() {
    renderExplorarPage({
        tipoFiltro: 'pf',
        titulo: 'Profissionais',
        subtitulo: 'Encontre os melhores profissionais autônomos de beleza e estética',
        icone: 'fas fa-user-md',
        labelEntidade: 'profissional'
    });
}
