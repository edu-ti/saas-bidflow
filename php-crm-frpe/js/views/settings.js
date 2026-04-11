// js/views/settings.js
import { appState } from '../state.js';
import { apiCall } from '../api.js';
import { showToast } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';

export function renderSettingsView() {
    const { permissions } = appState.currentUser;
    const container = document.getElementById('settings-view');
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h1>
            ${permissions.canCreate ? `
            <button id="add-user-btn" class="btn btn-primary">
                <i class="fas fa-plus mr-2"></i> Adicionar Usuário
            </button>
            ` : ''}
        </div>
        <div id="users-list-container" class="bg-white rounded-lg shadow-sm border overflow-auto">
            ${renderUsersList()}
        </div>
    `;
    addSettingsEventListeners();
}

function renderUsersList() {
    const users = appState.users;
    const { permissions } = appState.currentUser;

    if (users.length === 0) {
        return `<p class="p-6 text-center text-gray-500">Nenhum usuário encontrado.</p>`;
    }

    const tableHeader = `
        <thead>
            <tr>
                <th class="table-header">Nome</th>
                <th class="table-header">Cargo/Função</th>
                <th class="table-header">Email / Telefone</th>
                <th class="table-header">Perfil</th>
                <th class="table-header">Status</th>
                <th class="table-header text-right">Ações</th>
            </tr>
        </thead>
    `;

    const tableBody = users.map(user => `
        <tr>
            <td data-label="Nome" class="table-cell">
                <div class="font-medium text-gray-900">${user.nome}</div>
            </td>
            <td data-label="Cargo" class="table-cell">
                <div class="text-gray-600">${user.cargo || '-'}</div>
            </td>
            <td data-label="Contato" class="table-cell">
                <div>${user.email}</div>
                <div class="text-gray-500">${user.telefone || 'N/A'}</div>
            </td>
            <td data-label="Perfil" class="table-cell text-gray-600">${user.role}</td>
            <td data-label="Status" class="table-cell">
                <span class="status-badge ${user.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${user.status}
                </span>
            </td>
            <td data-label="Ações" class="table-cell text-right actions-cell">
                <div class="flex items-center justify-end space-x-2">
                    ${permissions.canEdit ? `<button class="action-btn edit-user-btn" data-id="${user.id}">Editar</button>` : ''}
                    ${permissions.canDelete ? `<button class="action-btn text-red-500 hover:text-red-700 delete-user-btn" data-id="${user.id}">Excluir</button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');

    return `<table class="w-full responsive-table">${tableHeader}<tbody>${tableBody}</tbody></table>`;
}

function addSettingsEventListeners() {
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        openUserModal(null);
    });

    document.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.dataset.id;
            const user = appState.users.find(u => u.id == userId);
            openUserModal(user);
        });
    });

    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.dataset.id;
            openDeleteUserConfirmModal(userId);
        });
    });
}

function openUserModal(user) {
    const isEditing = user !== null;
    const title = isEditing ? 'Editar Usuário' : 'Adicionar Novo Usuário';
    const roles = ['Especialista', 'Comercial', 'Vendedor', 'Gestor', 'Analista', 'Representante', 'Marketing'];

    const roleOptions = roles.map(role =>
        `<option value="${role}" ${isEditing && user.role === role ? 'selected' : ''}>${role}</option>`
    ).join('');

    const content = `
        <form id="modal-form">
            <input type="hidden" name="id" value="${isEditing ? user.id : ''}">
            <div class="space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <label class="form-label">Nome*</label>
                        <input type="text" name="nome" required value="${isEditing ? user.nome : ''}" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Email*</label>
                        <input type="email" name="email" required value="${isEditing ? user.email : ''}" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Telefone</label>
                        <input type="tel" name="telefone" value="${isEditing && user.telefone ? user.telefone : ''}" class="form-input">
                    </div>
                    <div>
                        <label class="form-label">Cargo/Função</label>
                        <input type="text" name="cargo" value="${isEditing && user.cargo ? user.cargo : ''}" class="form-input">
                    </div>
                </div>
                <div>
                    <label class="form-label">Senha*</label>
                    <input type="password" name="senha" ${isEditing ? '' : 'required'} class="form-input" placeholder="${isEditing ? 'Deixe em branco para não alterar' : ''}">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label class="form-label">Perfil*</label>
                        <select name="role" required class="form-input">${roleOptions}</select>
                    </div>
                    <div>
                        <label class="form-label">Status*</label>
                        <select name="status" required class="form-input">
                            <option value="Ativo" ${isEditing && user.status === 'Ativo' ? 'selected' : ''}>Ativo</option>
                            <option value="Inativo" ${isEditing && user.status === 'Inativo' ? 'selected' : ''}>Inativo</option>
                        </select>
                    </div>
                </div>
            </div>
        </form>
    `;

    renderModal(title, content, async (form) => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await apiCall(isEditing ? 'update_user' : 'create_user', { method: 'POST', body: JSON.stringify(data) });
            if (isEditing) {
                const index = appState.users.findIndex(u => u.id == result.user.id);
                if (index !== -1) appState.users[index] = result.user;
                showToast('Usuário atualizado com sucesso!');
            } else {
                appState.users.push(result.user);
                showToast('Usuário criado com sucesso!');
            }
            renderSettingsView();
            closeModal();
            renderSettingsView();
            closeModal();
        } catch (error) {
            console.error(error);
            showToast(error.message || 'Erro ao salvar usuário.', 'error');
        }
    });
}

function openDeleteUserConfirmModal(userId) {
    const user = appState.users.find(u => u.id == userId);
    if (!user) return;

    Swal.fire({
        title: 'Tem certeza?',
        text: `Você tem certeza que deseja excluir o usuário "${user.nome}"? Esta ação não pode ser desfeita.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Apagar',
        cancelButtonText: 'Cancelar',
        backdrop: `rgba(0,0,0,0.8)`
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: 'Excluindo...',
                    text: 'Aguarde...',
                    allowOutsideClick: false,
                    didOpen: () => { Swal.showLoading(); }
                });
                await apiCall('delete_user', { method: 'POST', body: JSON.stringify({ id: userId }) });
                appState.users = appState.users.filter(u => u.id != userId);
                renderSettingsView();
                Swal.fire(
                    'Excluído!',
                    'Usuário excluído com sucesso.',
                    'success'
                );
            } catch (error) {
                console.error(error);
                Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
            }
        }
    });
}

