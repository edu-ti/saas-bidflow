// js/ui.js

export function renderModal(title, content, onConfirm, confirmText = 'Salvar', confirmClass = 'btn-primary', size = 'lg') {
    const container = document.getElementById('modal-container');

    // Define a largura baseada no parâmetro size
    let widthClass = 'max-w-lg'; // Padrão
    if (size === 'sm') widthClass = 'max-w-sm'; // Compacto
    else if (size === 'xl') widthClass = 'max-w-4xl'; // Extra largo (se precisar futuramente)

    container.innerHTML = `
         <div id="modal-backdrop" class="fixed inset-0 bg-black bg-opacity-60 z-[60]"></div>
            <div id="modal-box" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-[70] w-full ${widthClass}">
            <div class="p-5 border-b flex justify-between items-center">
                <h2 class="text-xl font-bold text-gray-800">${title}</h2>
                <button id="modal-close-btn" class="action-btn text-2xl">&times;</button>
            </div>
            <div class="p-5 max-h-[70vh] overflow-y-auto text-gray-700">${content}</div>
            <div class="p-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button id="modal-cancel-btn" class="btn btn-secondary">Cancelar</button>
                <button id="modal-confirm-btn" class="btn ${confirmClass}">${confirmText}</button>
            </div>
        </div>
    `;

    document.getElementById('modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', closeModal);

    const confirmBtn = document.getElementById('modal-confirm-btn');
    confirmBtn.addEventListener('click', () => {
        const form = document.getElementById('modal-form');
        if (form && form.reportValidity()) {
            onConfirm(form);
        } else if (!form) {
            onConfirm();
        }
    });
}

export function closeModal() {
    const container = document.getElementById('modal-container');
    container.innerHTML = '';
}
