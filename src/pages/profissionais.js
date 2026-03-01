import renderExplorarPage from './explorar.js';

export default function renderProfissionaisPage() {
    renderExplorarPage({
        tipoFiltro: null,  // Nenhum filtro por tipo de documento — mostra TODOS
        titulo: 'Profissionais',
        subtitulo: 'Encontre os melhores profissionais de beleza e estética perto de você',
        icone: 'fas fa-user-md',
        labelEntidade: 'profissional'
    });
}
