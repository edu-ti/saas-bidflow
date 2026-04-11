// js/views/clients.js
import { appState } from '../state.js';
import { initializeApp } from '../script.js'; // Adicionado initializeApp
import { apiCall } from '../api.js';
import { showToast, setupApiFetch, showLoading } from '../utils.js'; // Adicionado showLoading
import { renderModal, closeModal } from '../ui.js'; // Adicionado renderModal, closeModal

// Mapa de títulos para reutilização
const titleMap = { organizations: 'Organizações', contacts: 'Contatos', clients_pf: 'Clientes Pessoa Física' };
const singularTitleMap = { organizations: 'Organização', contacts: 'Contato', clients_pf: 'Cliente PF' }; // Títulos no singular

// Função principal que desenha a vista de clientes
export function renderClientsView() {
    const { activeTab, searchTerm } = appState.clientsView;
    const container = document.getElementById('clients-view');
    const { permissions } = appState.currentUser; // Obtém permissões aqui

    container.innerHTML = `
        <div class="flex justify-between items-start sm:items-center mb-4 gap-4 responsive-stack">
            <h1 class="text-2xl font-bold text-gray-800">Gestão de Clientes</h1>
            <div class="flex items-center gap-2 w-full sm:w-auto responsive-stack">
                 <div class="relative w-full sm:w-auto flex-grow">
                    <input type="text" id="client-search-input" placeholder="Pesquisar..." class="form-input w-full md:w-64" value="${searchTerm}">
                    <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
                 ${permissions.canCreateClient ? `
                 <button id="import-clients-btn" class="btn btn-secondary btn-sm flex-shrink-0 w-full sm:w-auto">
                    <i class="fas fa-upload mr-2"></i>Importar
                 </button>
                 ` : ''}
             </div>
        </div>
        <div class="mb-4">
            <nav class="flex flex-wrap gap-2 pb-2 border-b border-gray-200" aria-label="Tabs">
                <button data-tab="organizations" class="client-tab-btn flex-1 sm:flex-none ${activeTab === 'organizations' ? 'active' : ''}">${titleMap.organizations}</button>
                <button data-tab="contacts" class="client-tab-btn flex-1 sm:flex-none ${activeTab === 'contacts' ? 'active' : ''}">${titleMap.contacts}</button>
                <button data-tab="clients_pf" class="client-tab-btn flex-1 sm:flex-none ${activeTab === 'clients_pf' ? 'active' : ''}">${titleMap.clients_pf}</button>
            </nav>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div id="client-list-container" class="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border"></div>
            <div id="client-form-container" class="lg:col-span-3"></div>
        </div>
    `;

    addClientsEventListeners();

    renderClientList();
    if (appState.clientsView.isFormVisible) {
        renderClientForm();
    }
}

function addClientsEventListeners() {
    const container = document.getElementById('clients-view');
    // Previne adicionar listeners múltiplos se a view for re-renderizada parcialmente
    if (container.dataset.eventsAttached === 'true') return;

    container.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        if (button.classList.contains('client-tab-btn')) {
            switchClientTab(button.dataset.tab);
        } else if (button.id === 'add-client-btn') {
            appState.clientsView.editingId = null;
            appState.clientsView.isFormVisible = true;
            renderClientForm();
        } else if (button.id === 'import-clients-btn') {
            openImportClientsModal();
        }
        // Os listeners para editar, fechar e submeter formulário são adicionados
        // nas funções renderClientList e renderClientForm para garantir
        // que existam apenas quando os elementos estão no DOM.
    });

    container.addEventListener('input', (e) => {
        if (e.target.id === 'client-search-input') {
            appState.clientsView.searchTerm = e.target.value;
            renderClientList();
        }
    });

    container.dataset.eventsAttached = 'true';
}

// Função para fechar e limpar o formulário
function closeAndClearForm() {
    appState.clientsView.isFormVisible = false;
    appState.clientsView.editingId = null;
    const formContainer = document.getElementById('client-form-container');
    if (formContainer) formContainer.innerHTML = ''; // Limpa o container
    // Atualiza a lista caso um item estivesse selecionado para edição
    renderClientList();
}

function switchClientTab(tabName) {
    appState.clientsView.activeTab = tabName;
    appState.clientsView.isFormVisible = false;
    appState.clientsView.editingId = null;
    appState.clientsView.searchTerm = ''; // Limpa a busca ao trocar de aba
    // Re-renderiza a view inteira para garantir que os listeners corretos sejam aplicados
    renderClientsView();
}

function renderClientList() {
    const { activeTab, searchTerm } = appState.clientsView;
    const { permissions } = appState.currentUser;
    const container = document.getElementById('client-list-container');
    if (!container) return;
    const lowercasedSearch = searchTerm.toLowerCase();

    const dataMap = { organizations: appState.organizations, contacts: appState.contacts, clients_pf: appState.clients_pf };
    // --- CORREÇÃO: Texto responsivo para botão Novo ---
    const newButtonText = `<span class="hidden sm:inline">Novo ${singularTitleMap[activeTab]}</span><span class="sm:hidden">Novo</span>`;
    // --- FIM DA CORREÇÃO ---

    const data = dataMap[activeTab] || [];

    // Filtra os dados com base no termo de busca
    const filteredData = data.filter(item => {
        // Adapta os campos de busca para cada tipo
        if (activeTab === 'organizations') {
            return (item.nome_fantasia && item.nome_fantasia.toLowerCase().includes(lowercasedSearch)) ||
                (item.razao_social && item.razao_social.toLowerCase().includes(lowercasedSearch)) ||
                (item.cnpj && item.cnpj.toLowerCase().includes(lowercasedSearch));
        } else if (activeTab === 'contacts') {
            return (item.nome && item.nome.toLowerCase().includes(lowercasedSearch)) ||
                (item.email && item.email.toLowerCase().includes(lowercasedSearch)) ||
                (item.organizacao_nome && item.organizacao_nome.toLowerCase().includes(lowercasedSearch));
        } else { // clients_pf
            return (item.nome && item.nome.toLowerCase().includes(lowercasedSearch)) ||
                (item.email && item.email.toLowerCase().includes(lowercasedSearch)) ||
                (item.cpf && item.cpf.toLowerCase().includes(lowercasedSearch));
        }
    });

    // Gera o HTML para os itens da lista
    const listItems = filteredData.map(item => {
        let name, detail;
        if (activeTab === 'organizations') {
            name = item.nome_fantasia;
            detail = `CNPJ: ${item.cnpj || 'Não informado'}`;
        } else if (activeTab === 'contacts') {
            name = item.nome;
            detail = `${item.cargo || 'Cargo não inf.'} | ${item.organizacao_nome || 'N/A'}`;
        } else {
            name = item.nome;
            detail = `CPF: ${item.cpf || 'Não informado'}`;
        }
        // Adiciona classe 'editing' se este item estiver sendo editado
        const isEditingClass = appState.clientsView.editingId == item.id ? 'bg-indigo-100 border-indigo-300' : 'bg-gray-50';

        return `<div class="p-3 mb-2 border rounded-md ${isEditingClass} flex justify-between items-center hover:bg-indigo-50 transition-colors">
                    <div>
                        <p class="font-semibold text-gray-800">${name || 'Nome não informado'}</p>
                        <p class="text-xs text-gray-500">${detail}</p>
                    </div>
                    <!-- --- CORREÇÃO: Mostra botão editar para Contatos também --- --!>
                    ${permissions.canEdit ? `<button class="action-btn edit-client-btn" data-id="${item.id}" title="Editar"><i class="fas fa-pencil-alt"></i></button>` : ''}
                </div>`;
    }).join('');

    // Renderiza o container da lista
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">${titleMap[activeTab]}</h2>
            ${permissions.canCreateClient ? `<button id="add-client-btn" class="btn btn-primary btn-sm flex-shrink-0"><i class="fas fa-plus mr-1"></i> ${newButtonText}</button>` : ''}
             <!-- --- FIM DA CORREÇÃO --- --!>
        </div>
        <!-- Adicionado max-h e overflow --!>
        <div class="max-h-[60vh] overflow-y-auto pr-2">${listItems || '<p class="text-center text-gray-500 py-4">Nenhum item encontrado.</p>'}</div>
    `;
    // Adiciona listeners aos botões de editar recém-renderizados
    addEditButtonListeners();
}

// Função separada para adicionar listeners aos botões de editar
function addEditButtonListeners() {
    document.querySelectorAll('.edit-client-btn').forEach(button => {
        // Remove listener antigo para evitar duplicação
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        // Adiciona novo listener
        newButton.addEventListener('click', (e) => {
            const currentId = e.currentTarget.dataset.id;
            // Se já está editando este, fecha o form. Senão, abre para editar.
            if (appState.clientsView.isFormVisible && appState.clientsView.editingId == currentId) {
                closeAndClearForm();
            } else {
                appState.clientsView.editingId = currentId;
                appState.clientsView.isFormVisible = true;
                renderClientForm(); // Renderiza o form
                renderClientList(); // Re-renderiza a lista para destacar o item
            }
        });
    });
}


function renderClientForm() {
    const { activeTab, editingId, isFormVisible } = appState.clientsView;
    const container = document.getElementById('client-form-container');
    if (!container) return;

    if (!isFormVisible) {
        container.innerHTML = ''; // Limpa o formulário se não for visível
        return;
    }

    let data = {};
    const dataMap = { organizations: appState.organizations, contacts: appState.contacts, clients_pf: appState.clients_pf };
    if (editingId) {
        data = dataMap[activeTab].find(item => item.id == editingId) || {};
    }

    // Usa mapa de títulos singular
    const title = `${editingId ? 'Editar' : singularTitleMap[activeTab].startsWith('O') ? 'Nova' : 'Novo'} ${singularTitleMap[activeTab]}`;

    let formFields = '';
    if (activeTab === 'organizations') formFields = renderOrganizationFormFields(data);
    else if (activeTab === 'contacts') formFields = renderContactFormFields(data);
    else formFields = renderClientPfFormFields(data); // Assume clients_pf

    container.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <div class="flex justify-between items-center mb-4 border-b pb-2">
                <h2 class="text-lg font-bold text-gray-700">${title}</h2>
                <button id="close-client-form-btn" class="text-gray-400 hover:text-gray-600 text-2xl leading-none" title="Fechar Formulário">&times;</button>
            </div>
            <form id="client-form" class="space-y-4">
                <input type="hidden" name="id" value="${editingId || ''}">
                ${formFields}
                <div class="flex justify-end pt-4 border-t mt-6 space-x-2">
                     <!-- Botão Excluir (Apenas edição e se tiver permissão) -->
                    ${editingId && appState.currentUser.permissions.canDelete ? `
                    <button type="button" id="delete-client-btn" class="btn btn-error mr-auto" style="background-color: #ef4444; color: white; margin-right: auto;">
                        <i class="fas fa-trash-alt mr-2"></i>Excluir
                    </button>` : ''}
                    
                    <button type="button" id="submit-client-form-btn" class="btn btn-primary">${editingId ? 'Salvar Alterações' : 'Adicionar'}</button>
                </div>
            </form>
        </div>
    `;

    // Re-adiciona listeners específicos do formulário
    const form = document.getElementById('client-form');
    if (activeTab !== 'contacts') { // Busca CEP para PJ e PF
        setupApiFetch(form, 'cep', apiCall);
    }
    if (activeTab === 'organizations') { // Busca CNPJ apenas para PJ
        setupApiFetch(form, 'cnpj', apiCall);
    }
    // Adiciona listener para o botão de fechar DENTRO do formulário
    document.getElementById('close-client-form-btn')?.addEventListener('click', closeAndClearForm);

    // Adiciona listener para o botão de EXCLUIR
    // Adiciona listener para o botão de EXCLUIR
    document.getElementById('delete-client-btn')?.addEventListener('click', async () => {
        Swal.fire({
            title: 'Tem certeza?',
            text: `Você tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Apagar',
            cancelButtonText: 'Cancelar',
            backdrop: `rgba(0,0,0,0.8)`
        }).then(async (result) => {
            if (result.isConfirmed) {
                const typeMap = {
                    organizations: 'organization',
                    contacts: 'contact',
                    clients_pf: 'cliente_pf'
                };
                const type = typeMap[appState.clientsView.activeTab];
                const action = `delete_${type}`;

                try {
                    Swal.fire({
                        title: 'Excluindo...',
                        text: 'Aguarde...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });
                    await apiCall(action, {
                        method: 'POST',
                        body: JSON.stringify({ id: editingId })
                    });

                    // Atualiza o estado local removendo o item
                    const stateKeyMap = { organizations: 'organizations', contacts: 'contacts', clients_pf: 'clients_pf' };
                    const stateKey = stateKeyMap[appState.clientsView.activeTab];

                    if (appState[stateKey]) {
                        appState[stateKey] = appState[stateKey].filter(item => item.id != editingId);
                    }

                    Swal.fire('Excluído!', 'Cliente excluído com sucesso!', 'success');
                    closeAndClearForm();
                    renderClientList();

                } catch (error) {
                    console.error(error);
                    Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
                }
            }
        });
    });

    // Adiciona listener para o botão de submit DENTRO do formulário
    document.getElementById('submit-client-form-btn')?.addEventListener('click', () => {
        if (form && form.reportValidity()) {
            const typeMap = {
                organizations: 'organization',
                contacts: 'contact',
                clients_pf: 'cliente_pf'
            };
            handleClientFormSubmit(form, typeMap[appState.clientsView.activeTab]);
        }
    });
}

async function handleClientFormSubmit(form, type) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const action = data.id ? `update_${type}` : `create_${type}`;

    showLoading(true); // Mostra loading
    try {
        const result = await apiCall(action, { method: 'POST', body: JSON.stringify(data) });
        // Ajusta a chave da resposta (organization, contact, client_pf)
        const savedItemKey = Object.keys(result).find(key => key !== 'success');
        const savedItem = result[savedItemKey];


        // Atualiza o estado da aplicação
        const stateKeyMap = { organization: 'organizations', contact: 'contacts', cliente_pf: 'clients_pf' };
        const stateKey = stateKeyMap[type];

        if (stateKey && savedItem) { // Verifica se a chave e o item existem
            if (data.id) { // Editando
                const index = appState[stateKey].findIndex(item => item.id == savedItem.id);
                if (index !== -1) {
                    appState[stateKey][index] = savedItem;
                } else {
                    // Se não encontrou para atualizar, adiciona (menos provável)
                    appState[stateKey].push(savedItem);
                }
                showToast(`${singularTitleMap[stateKey]} atualizado(a) com sucesso!`);
            } else { // Criando
                appState[stateKey].push(savedItem);
                showToast(`${singularTitleMap[stateKey]} criado(a) com sucesso!`);
            }
        } else {
            console.warn("Chave de estado ou item salvo não encontrado na resposta da API:", result);
            showToast(`Operação concluída, mas houve um problema ao atualizar a lista local. Recarregue a página se necessário.`, 'info');
        }


        // Fecha o formulário e atualiza a lista
        closeAndClearForm();
        renderClientList(); // Re-renderiza a lista para mostrar a alteração/adição

        // O recarregamento total foi removido para melhorar a performance.
        // Se notar inconsistências em outras partes (ex: propostas), pode ser reativado.

    } catch (error) {
        console.error(`Falha ao salvar ${type}:`, error);
        // O showToast de erro já é chamado dentro do apiCall
    } finally {
        showLoading(false); // Esconde loading
    }
}

// Funções que geram os campos do formulário (sem alterações)
function renderOrganizationFormFields(data) {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">CNPJ</label><div class="relative"><input type="text" name="cnpj" class="form-input" value="${data.cnpj || ''}"><button type="button" data-type="cnpj" class="api-fetch-btn absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" title="Buscar dados pelo CNPJ"><i class="fas fa-search"></i></button></div></div>
            <div><label class="form-label">Nome Fantasia*</label><input type="text" name="nome_fantasia" required class="form-input" value="${data.nome_fantasia || ''}"></div>
        </div>
        <div><label class="form-label">Razão Social</label><input type="text" name="razao_social" class="form-input" value="${data.razao_social || ''}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">CEP</label><div class="relative"><input type="text" name="cep" class="form-input" value="${data.cep || ''}"><button type="button" data-type="cep" class="api-fetch-btn absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" title="Buscar endereço pelo CEP"><i class="fas fa-search"></i></button></div></div>
            <div class="sm:col-span-2"><label class="form-label">Logradouro</label><input type="text" name="logradouro" class="form-input" value="${data.logradouro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">Número</label><input type="text" name="numero" class="form-input" value="${data.numero || ''}"></div>
            <div><label class="form-label">Complemento</label><input type="text" name="complemento" class="form-input" value="${data.complemento || ''}"></div>
            <div><label class="form-label">Bairro</label><input type="text" name="bairro" class="form-input" value="${data.bairro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Cidade</label><input type="text" name="cidade" class="form-input" value="${data.cidade || ''}"></div>
            <div><label class="form-label">Estado (UF)</label><input type="text" name="estado" maxlength="2" class="form-input" value="${data.estado || ''}"></div>
        </div>`;
}
function renderContactFormFields(data) {
    // Busca organizações para o select
    const orgOptions = appState.organizations
        .sort((a, b) => (a.nome_fantasia || '').localeCompare(b.nome_fantasia || '')) // Ordena alfabeticamente
        .map(org => `<option value="${org.id}" ${data.organizacao_id == org.id ? 'selected' : ''}>${org.nome_fantasia}</option>`).join('');
    return `
        <div><label class="form-label">Organização*</label><select name="organizacao_id" required class="form-input"><option value="">Selecione...</option>${orgOptions}</select></div>
        <div><label class="form-label">Nome*</label><input type="text" name="nome" required class="form-input" value="${data.nome || ''}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Cargo</label><input type="text" name="cargo" class="form-input" value="${data.cargo || ''}"></div>
            <div><label class="form-label">Setor</label><input type="text" name="setor" class="form-input" value="${data.setor || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Email</label><input type="email" name="email" class="form-input" value="${data.email || ''}"></div>
            <div><label class="form-label">Telefone</label><input type="tel" name="telefone" class="form-input" value="${data.telefone || ''}"></div>
        </div>`;
}
function renderClientPfFormFields(data) {
    return `
        <div><label class="form-label">Nome*</label><input type="text" name="nome" required class="form-input" value="${data.nome || ''}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Email</label><input type="email" name="email" class="form-input" value="${data.email || ''}"></div>
            <div><label class="form-label">Telefone</label><input type="text" name="telefone" class="form-input" value="${data.telefone || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">CPF</label><input type="text" name="cpf" class="form-input" value="${data.cpf || ''}"></div>
            <div><label class="form-label">Data de Nascimento</label><input type="date" name="data_nascimento" class="form-input" value="${data.data_nascimento || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">CEP</label><div class="relative"><input type="text" name="cep" class="form-input" value="${data.cep || ''}"><button type="button" data-type="cep" class="api-fetch-btn absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-700" title="Buscar endereço pelo CEP"><i class="fas fa-search"></i></button></div></div>
            <div class="sm:col-span-2"><label class="form-label">Logradouro</label><input type="text" name="logradouro" class="form-input" value="${data.logradouro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">Número</label><input type="text" name="numero" class="form-input" value="${data.numero || ''}"></div>
            <div><label class="form-label">Complemento</label><input type="text" name="complemento" class="form-input" value="${data.complemento || ''}"></div>
            <div><label class="form-label">Bairro</label><input type="text" name="bairro" class="form-input" value="${data.bairro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Cidade</label><input type="text" name="cidade" class="form-input" value="${data.cidade || ''}"></div>
            <div><label class="form-label">Estado (UF)</label><input type="text" name="estado" maxlength="2" class="form-input" value="${data.estado || ''}"></div>
        </div>`;
}

// --- FUNÇÃO DE IMPORTAÇÃO (sem alterações) ---
function openImportClientsModal() {
    const content = `
        <form id="modal-form" class="space-y-4">
            <div>
                <label for="client-file-input" class="form-label">Selecione o ficheiro (.xlsx ou .csv)</label>
                <input type="file" id="client-file-input" accept=".xlsx, .csv" required class="form-input">
            </div>
            <div class="text-sm text-gray-600 space-y-2">
                <p><strong>Instruções:</strong></p>
                <ul class="list-disc list-inside">
                    <li>A primeira linha da planilha deve ser o cabeçalho.</li>
                    <li>O sistema tentará identificar se a linha é PJ ou PF.</li>
                    <li>**Para Organização (PJ):** Use as colunas <code class="bg-gray-100 p-1 rounded text-xs">cnpj</code> (obrigatório para identificar como PJ) e <code class="bg-gray-100 p-1 rounded text-xs">nome_fantasia</code> (obrigatório). Outras colunas opcionais: <code class="bg-gray-100 p-1 rounded text-xs">razao_social</code>, <code class="bg-gray-100 p-1 rounded text-xs">cep</code>, <code class="bg-gray-100 p-1 rounded text-xs">logradouro</code>, <code class="bg-gray-100 p-1 rounded text-xs">numero</code>, <code class="bg-gray-100 p-1 rounded text-xs">complemento</code>, <code class="bg-gray-100 p-1 rounded text-xs">bairro</code>, <code class="bg-gray-100 p-1 rounded text-xs">cidade</code>, <code class="bg-gray-100 p-1 rounded text-xs">estado</code>.</li>
                    <li>**Para Cliente PF:** Use a coluna <code class="bg-gray-100 p-1 rounded text-xs">nome</code> (obrigatório). Colunas recomendadas para evitar duplicados: <code class="bg-gray-100 p-1 rounded text-xs">cpf</code>, <code class="bg-gray-100 p-1 rounded text-xs">email</code>, <code class="bg-gray-100 p-1 rounded text-xs">telefone</code>. Outras colunas opcionais: <code class="bg-gray-100 p-1 rounded text-xs">data_nascimento</code>, <code class="bg-gray-100 p-1 rounded text-xs">cep</code>, <code class="bg-gray-100 p-1 rounded text-xs">logradouro</code>, <code class="bg-gray-100 p-1 rounded text-xs">numero</code>, <code class="bg-gray-100 p-1 rounded text-xs">complemento</code>, <code class="bg-gray-100 p-1 rounded text-xs">bairro</code>, <code class="bg-gray-100 p-1 rounded text-xs">cidade</code>, <code class="bg-gray-100 p-1 rounded text-xs">estado</code>.</li>
                    <li>Clientes com CNPJ/CPF, e-mail ou telefone já existentes serão ignorados.</li>
                </ul>
            </div>
            <div id="import-status" class="hidden text-sm mt-4"></div>
        </form>
    `;

    renderModal('Importar Clientes', content, async (form) => {
        const fileInput = document.getElementById('client-file-input');
        const file = fileInput.files[0];
        const statusDiv = document.getElementById('import-status');
        const confirmBtn = document.getElementById('modal-confirm-btn'); // Pega o botão de confirmação do modal

        if (!file) {
            showToast('Selecione um ficheiro.', 'error');
            return;
        }
        if (confirmBtn) confirmBtn.disabled = true; // Desabilita botão durante o processo
        statusDiv.classList.remove('hidden');
        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>A processar o ficheiro...';
        showLoading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target.result;
            let jsonData = [];
            let fileType = file.name.split('.').pop().toLowerCase();

            try {
                if (fileType === 'xlsx') {
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
                } else if (fileType === 'csv') {
                    const csvData = data;
                    const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== '');
                    jsonData = lines.map(line => {
                        return line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell =>
                            cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')
                        );
                    });
                } else {
                    throw new Error('Formato de ficheiro não suportado.');
                }

                if (jsonData.length < 2) {
                    throw new Error('Ficheiro vazio ou contém apenas o cabeçalho.');
                }

                const header = jsonData[0].map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_'));
                const clientsData = jsonData.slice(1).map(row => {
                    const client = {};
                    header.forEach((key, index) => {
                        if (key && row[index] !== undefined) {
                            if (key === 'data_nascimento' && typeof row[index] === 'number' && row[index] > 10000) {
                                client[key] = excelDateToJSDate(row[index]);
                            } else {
                                client[key] = String(row[index]).trim();
                            }
                        }
                    });
                    return client;
                });

                statusDiv.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>A enviar ${clientsData.length} registos para o servidor...`;

                const result = await apiCall('import_clients', {
                    method: 'POST',
                    body: JSON.stringify({ clients: clientsData })
                });

                statusDiv.innerHTML = `
                    <p class="text-green-600 font-semibold">Importação Concluída!</p>
                    <ul class="list-disc list-inside mt-2">
                        <li>Organizações (PJ) importadas: ${result.importedPj}</li>
                        <li>Clientes PF importados: ${result.importedPf}</li>
                        <li>Duplicados (PJ): ${result.duplicatesPj}</li>
                        <li>Duplicados (PF): ${result.duplicatesPf}</li>
                        <li>Erros/inválidos: ${result.errors}</li>
                    </ul>
                 `;
                showToast(`Importação concluída: ${result.importedPj + result.importedPf} clientes adicionados.`);

                if (result.importedPj > 0 || result.importedPf > 0) {
                    await initializeApp();
                    renderClientsView();
                }
                setTimeout(closeModal, 5000);

            } catch (error) {
                console.error("Erro na importação de clientes:", error);
                statusDiv.innerHTML = `<p class="text-red-600">Erro: ${error.message}</p>`;
                showToast(`Erro na importação: ${error.message}`, 'error');
                if (confirmBtn) confirmBtn.disabled = false;
                showLoading(false);
            } finally {
                showLoading(false);
            }
        };

        reader.onerror = () => {
            statusDiv.innerHTML = `<p class="text-red-600">Erro ao ler o ficheiro.</p>`;
            showToast('Erro ao ler o ficheiro.', 'error');
            if (confirmBtn) confirmBtn.disabled = false;
            showLoading(false);
        };

        if (file.name.endsWith('.xlsx')) {
            reader.readAsBinaryString(file);
        } else if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            statusDiv.innerHTML = `<p class="text-red-600">Formato de ficheiro não suportado. Use .xlsx ou .csv.</p>`;
            showToast('Formato de ficheiro não suportado.', 'error');
            if (confirmBtn) confirmBtn.disabled = false;
            showLoading(false);
        }

    }, 'Importar', 'btn-primary');
}

// Função auxiliar para converter data do Excel para formato YYYY-MM-DD
function excelDateToJSDate(excelDate) {
    if (typeof excelDate !== 'number' || excelDate < 1) return '';
    try {
        const baseDate = new Date(Date.UTC(1899, 11, 30 + excelDate - 1));
        const year = baseDate.getUTCFullYear();
        const month = String(baseDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(baseDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    } catch (e) {
        console.warn("Erro ao converter data Excel:", excelDate, e);
        return '';
    }
}
// --- FIM DA FUNÇÃO DE IMPORTAÇÃO ---

