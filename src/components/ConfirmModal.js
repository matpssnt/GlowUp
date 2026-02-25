export default function ConfirmModal(id, title, message, onConfirm) {
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal fade';
    modalDiv.id = id;
    modalDiv.tabIndex = '-1';
    modalDiv.setAttribute('aria-hidden', 'true');

    modalDiv.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body py-4">
                    <p class="mb-0 text-muted">${message}</p>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Não</button>
                    <button type="button" class="btn btn-danger px-4" id="${id}-confirm">Sim, Cancelar</button>
                </div>
            </div>
        </div>
    `;

    const confirmBtn = modalDiv.querySelector(`#${id}-confirm`);
    confirmBtn.onclick = () => {
        const modalInstance = bootstrap.Modal.getInstance(modalDiv);
        modalInstance.hide();
        onConfirm();
    };

    return modalDiv;
}
