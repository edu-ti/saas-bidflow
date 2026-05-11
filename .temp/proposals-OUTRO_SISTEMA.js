// js/views/proposals.js

import { appState } from '../state.js';
import { apiCall } from '../api.js';
import { showToast, formatDate, formatCurrency, formatCurrencyForInput, parseCurrency, setupApiFetch, showLoading } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';

export function resetProposalState() {
    appState.proposal = {
        isEditing: false,
        id: null,
        oportunidade_id: null,
        currentClient: null,
        clientType: null,
        status: 'Rascunho',
        items: [],
        created_at: new Date().toISOString().split('T')[0],
        data_validade: '',
        faturamento: 'Realizado diretamente pela fábrica.',
        treinamento: 'Capacitação técnica por especialistas da FR Produtos Médicos.',
        condicoes_pagamento: 'A vista',
        prazo_entrega: 'Até 30 dias após a confirmação do pedido de compra.',
        garantia_equipamentos: '12 meses a partir da data de emissão da nota Fiscal.',
        garantia_acessorios: '6 meses, conforme especificações do fabricante.',
        instalacao: 'Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança.',
        assistencia_tecnica: 'Disponível com suporte especializado para manutenção e pós garantia.',
        assistencia_tecnica: 'Disponível com suporte especializado para manutenção e pós garantia.',
        observacoes: 'Nenhuma',
        motivo_status: '',
        frete_tipo: 'CIF',
        frete_valor: 0
    };
    // Mantemos a paginação e a ordenação atuais
}

let proposalsInterval = null;

export async function initProposalsView() {
    renderProposalsView(); // Renderiza a estrutura básica

    // Limpa intervalo anterior se existir
    if (proposalsInterval) clearInterval(proposalsInterval);

    // Carregamento inicial (com spinner)
    await loadProposals(false);

    // Configura o polling (silencioso)
    proposalsInterval = setInterval(() => {
        const view = document.getElementById('proposals-view');
        // Se a view não existir ou estiver oculta, não faz o request
        if (!view || view.classList.contains('hidden') || view.style.display === 'none') {
            return;
        }
        loadProposals(true);
    }, 5000); // 5 segundos
}

export async function loadProposals(isSilent = false) {
    if (!isSilent) showLoading(true);
    try {
        // Usa get_data para garantir consistência
        const data = await apiCall('get_data');

        // Atualiza apenas as partes relevantes do estado
        appState.proposals = data.proposals || [];
        appState.pre_proposals = data.pre_proposals || [];
        appState.opportunities = data.opportunities || [];

        // Re-renderiza as listas
        renderProposalsList();
        renderPreProposalsSection();

    } catch (error) {
        console.error("Erro ao carregar propostas:", error);
        if (!isSilent) showToast("Erro ao atualizar lista de propostas.", "error");
    } finally {
        if (!isSilent) showLoading(false);
    }
}

// Helper para buscar dados atualizados de clientes (Organizations, PF e Contatos)
async function refreshClientData() {
    try {
        const data = await apiCall('get_data');
        // Atualiza listas de clientes e contatos
        if (data.organizations) appState.organizations = data.organizations;
        if (data.clients_pf) appState.clients_pf = data.clients_pf;
        if (data.contacts) appState.contacts = data.contacts;
    } catch (error) {
        console.error("Erro ao atualizar dados de clientes:", error);
    }
}

export function renderProposalsView() {
    const container = document.getElementById('proposals-view');

    if (!appState.proposal || (!appState.proposal.isEditing && !appState.proposal.oportunidade_id)) {
        resetProposalState();
    }

    const p = appState.proposal;
    const { permissions } = appState.currentUser;

    const statusOptions = ['Rascunho', 'Enviada', 'Aprovada', 'Recusada', 'Negociando']
        .map(s => `<option value="${s}" ${p.status === s ? 'selected' : ''}>${s}</option>`).join('');

    container.innerHTML = `
        <div id="pre-proposals-container"></div>
        <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 class="text-2xl font-bold text-gray-800 self-start sm:self-center">Propostas</h1>
            <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div class="relative w-full sm:w-64">
                    <input type="text" id="proposal-search" placeholder="Pesquisar..." class="form-input w-full">
                    <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
                ${permissions.canCreate ? `
                <button id="add-proposal-btn" class="btn btn-primary btn-sm w-full sm:w-auto text-center justify-center"><i class="fas fa-plus mr-2"></i>Criar Nova</button>
                ` : ''}
            </div>
        </div>
        <div id="proposals-list-container" class="bg-white rounded-lg shadow-sm border responsive-table-container min-h-[500px]"></div>
        
        <div id="proposal-form-container" class="mt-6 ${p.isEditing || p.oportunidade_id ? '' : 'hidden'}">
            <div class="bg-white p-6 rounded-lg shadow-sm border">
                <h2 id="proposal-form-title" class="text-xl font-bold mb-4">${p.id ? `Editando Proposta ${p.numero_proposta || ''}` : 'Criar Nova Proposta'}</h2>
                <div class="flex justify-end space-x-4 mb-4">
                    <button type="button" id="close-proposal-top-btn" class="btn btn-outline-secondary">Fechar</button>
                    <button type="button" id="cancel-proposal-top-btn" class="btn btn-secondary">Cancelar</button>
                    <button type="button" id="save-proposal-top-btn" class="btn btn-primary">${p.id ? 'Salvar Alterações' : 'Criar Proposta'}</button>
                </div>
                <form id="proposal-form" class="space-y-6">
                     <div class="grid grid-cols-1 md:grid-cols-4 gap-4 border-b pb-4">
                        <div>
                            <label class="form-label">Data de Criação</label>
                            <input type="date" name="created_at" value="${p.created_at.split(' ')[0]}" readonly class="form-input bg-gray-100">
                        </div>
                        <div>
                            <label class="form-label">Validade da Proposta</label>
                            <input type="date" name="data_validade" value="${p.data_validade ? p.data_validade.split(' ')[0] : ''}" class="form-input">
                        </div>
                         <div>
                            <label class="form-label">Status</label>
                            <select name="status" class="form-input">${statusOptions}</select>
                        </div>
                        <div>
                            <label class="form-label">Motivo</label>
                            <input type="text" name="motivo_status" class="form-input" value="${p.motivo_status || ''}" placeholder="Ex: Preço alto...">
                        </div>
                    </div>
                    <div id="proposal-client-selection" class="border-b pb-4"></div>
                    <div id="proposal-items-section" class="border-b pb-4"></div>
                    <div class="space-y-4">
                        <h3 class="text-lg font-semibold text-gray-700 border-b pb-2">Termos Comerciais</h3>
                         <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="form-label">Faturamento</label><textarea name="faturamento" rows="2" class="form-input">${p.faturamento}</textarea></div>
                            <div><label class="form-label">Treinamento</label><textarea name="treinamento" rows="2" class="form-input">${p.treinamento}</textarea></div>
                            <div><label class="form-label">Condições de Pagamento</label><textarea name="condicoes_pagamento" rows="2" class="form-input">${p.condicoes_pagamento}</textarea></div>
                            <div><label class="form-label">Prazo de Entrega</label><textarea name="prazo_entrega" rows="2" class="form-input">${p.prazo_entrega}</textarea></div>
                            <div><label class="form-label">Garantia (Equipamentos)</label><textarea name="garantia_equipamentos" rows="2" class="form-input">${p.garantia_equipamentos}</textarea></div>
                            <div><label class="form-label">Garantia (Acessórios)</label><textarea name="garantia_acessorios" rows="2" class="form-input">${p.garantia_acessorios}</textarea></div>
                            <div><label class="form-label">Instalação</label><textarea name="instalacao" rows="2" class="form-input">${p.instalacao}</textarea></div>
                            <div><label class="form-label">Assistência Técnica</label><textarea name="assistencia_tecnica" rows="2" class="form-input">${p.assistencia_tecnica}</textarea></div>
                            <div class="md:col-span-2"><label class="form-label">Observações</label><textarea name="observacoes" rows="3" class="form-input">${p.observacoes}</textarea></div>
                         </div>
                    </div>
                     <div class="flex justify-end space-x-4 pt-4 border-t">
                        <button type="button" id="close-proposal-bottom-btn" class="btn btn-outline-secondary">Fechar</button>
                        <button type="button" id="cancel-proposal-edit-btn" class="btn btn-secondary">Cancelar</button>
                        <button type="submit" class="btn btn-primary">${p.id ? 'Salvar Alterações' : 'Criar Proposta'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    addProposalEventListeners();
    renderProposalsList();
    renderPreProposalsSection();

    if (p.isEditing || p.oportunidade_id) {
        renderProposalClientSelection();
        renderProposalItemsSection();
    }
}

function renderPreProposalsSection() {
    const container = document.getElementById('pre-proposals-container');
    if (!container) return;

    const { permissions } = appState.currentUser;

    if (appState.pre_proposals && appState.pre_proposals.length > 0) {
        const preProposalItems = appState.pre_proposals.map(op => `
            <div class="p-2 mb-1 border rounded-md bg-yellow-50 border-yellow-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                    <p class="font-semibold text-yellow-800">${op.titulo} (${op.organizacao_nome || op.cliente_pf_nome || 'N/A'})</p>
                    <p class="text-xs text-yellow-700">Solicitado por: ${op.vendedor_nome} | Nº Pré-proposta: ${op.pre_proposal_number}</p>
                </div>
                <div class="flex items-center space-x-2">
                    ${permissions.canDelete ? `
                    <button class="btn bg-red-500 hover:bg-red-600 text-white text-xs delete-pre-proposal-btn" data-opportunity-id="${op.id}">
                        Excluir
                    </button>
                    ` : ''}
                    ${permissions.canCreate ? `
                    <button class="btn bg-green-500 hover:bg-green-600 text-white text-xs create-proposal-from-opp-btn" data-opportunity-id="${op.id}">
                        Criar Proposta
                    </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="mb-8 p-4 bg-white rounded-lg shadow-sm border">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Solicitações de Pré-Proposta</h2>
                ${preProposalItems}
            </div>
        `;

        container.querySelectorAll('.create-proposal-from-opp-btn').forEach(btn => {
            btn.addEventListener('click', handleCreateProposalFromOpp);
        });

        container.querySelectorAll('.delete-pre-proposal-btn').forEach(btn => {
            btn.addEventListener('click', handleDeletePreProposal);
        });

    } else {
        container.innerHTML = '';
    }
}

function scrollToProposalForm() {
    const formContainer = document.getElementById('proposal-form-container');
    if (formContainer && !formContainer.classList.contains('hidden')) {
        formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderProposalsList() {
    const container = document.getElementById('proposals-list-container');
    const { proposals, contacts } = appState;
    const searchTerm = document.getElementById('proposal-search')?.value.toLowerCase() || '';
    const { permissions } = appState.currentUser;

    const filteredProposals = (proposals || []).filter(p => {
        const clientName = p.organizacao_nome || p.cliente_pf_nome || '';
        const proposalNumber = p.numero_proposta || '';
        const contactName = p.contato_nome || '';
        const docNumber = p.cnpj || p.cpf || '';
        const status = p.status || '';
        const date = formatDate(p.data_criacao);

        const obs = (p.observacoes || '').toLowerCase(); // Opcional, se quiser buscar nas observações
        const itensDesc = (p.itens_descricao || '').toLowerCase();
        const itensFab = (p.itens_fabricante || '').toLowerCase();

        return clientName.toLowerCase().includes(searchTerm) ||
            proposalNumber.toLowerCase().includes(searchTerm) ||
            contactName.toLowerCase().includes(searchTerm) ||
            docNumber.toLowerCase().includes(searchTerm) ||
            status.toLowerCase().includes(searchTerm) ||
            date.includes(searchTerm) ||
            itensDesc.includes(searchTerm) ||
            itensFab.includes(searchTerm);
    });

    const { column, direction } = appState.proposalSort;
    filteredProposals.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (column === 'valor_total') {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
        } else if (column === 'data_criacao') {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const { currentPage } = appState.proposalsView;
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

    // --- CORREÇÃO: Garante que a página atual não exceda o total (Igual ao Catálogo) ---
    if (appState.proposalsView.currentPage > totalPages && totalPages > 0) {
        appState.proposalsView.currentPage = totalPages;
        // Re-executa para pegar o slice correto na próxima passada ou ajusta aqui
        // Como o render é síncrono, ajustamos a var local também para exibir certo agora
    }
    const safeCurrentPage = appState.proposalsView.currentPage;

    const paginatedItems = filteredProposals.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

    const getSortIcon = (col) => {
        if (column !== col) return '<i class="fas fa-sort text-gray-400 ml-2"></i>';
        return direction === 'asc' ? '<i class="fas fa-sort-up ml-2"></i>' : '<i class="fas fa-sort-down ml-2"></i>';
    };

    const scrollContainer = container.querySelector('.overflow-x-auto');
    const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;

    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 responsive-table">
                <thead>
                    <tr>
                        <th class="table-header sortable-header" data-column="numero_proposta">Nº ${getSortIcon('numero_proposta')}</th>
                        <th class="table-header sortable-header" data-column="data_criacao">Data ${getSortIcon('data_criacao')}</th>
                        <th class="table-header">Cliente</th>
                        <th class="table-header">Contato do Cliente</th>
                        <th class="table-header">CNPJ/CPF</th>
                        <th class="table-header sortable-header" data-column="valor_total">Valor ${getSortIcon('valor_total')}</th>
                        <th class="table-header sortable-header" data-column="status">Status ${getSortIcon('status')}</th>
                        <th class="table-header">Etapa do Funil</th>
                        <th class="table-header text-right">Ações</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${paginatedItems.map(p => {
        const contactName = p.contato_nome || 'N/A';

        return `
                        <tr class="responsive-table-row">
                            <td data-label="Nº" class="table-cell font-medium">${p.numero_proposta || 'N/A'}</td>
                            <td data-label="Data" class="table-cell">${formatDate(p.data_criacao)}</td>
                            <td data-label="Cliente" class="table-cell whitespace-normal min-w-[200px]">${p.organizacao_nome || p.cliente_pf_nome || 'N/A'}</td>
                            <td data-label="Contato" class="table-cell">${contactName}</td>
                            <td data-label="CNPJ/CPF" class="table-cell">${p.cnpj || p.cpf || 'N/A'}</td>
                            <td data-label="Valor" class="table-cell">${formatCurrency(p.valor_total)}</td>
                            <td data-label="Status" class="table-cell">
                                <span class="status-badge status-${(p.status || '').toLowerCase().replace('ç', 'c').replace('ã', 'a')}">${p.status}</span>
                                ${p.motivo_status ? `<div class="text-xs text-red-600 mt-1 font-medium">${p.motivo_status}</div>` : ''}
                            </td>
                            <td data-label="Etapa Funil" class="table-cell">${p.etapa_funil_nome || 'N/A'}</td>
                            <td data-label="Ações" class="table-cell text-right space-x-2 actions-cell">
                                <button class="action-btn view-proposal-btn" title="Visualizar" data-id="${p.id}"><i class="fas fa-eye text-blue-500 hover:text-blue-700"></i></button>
                                ${permissions.canEdit ? `<button class="action-btn edit-proposal-btn" title="Editar" data-id="${p.id}"><i class="fas fa-pencil-alt"></i></button>` : ''}
                                ${permissions.canDelete ? `<button class="action-btn delete-proposal-btn" title="Excluir" data-id="${p.id}"><i class="fas fa-trash-alt text-red-500 hover:text-red-700"></i></button>` : ''}
                                ${permissions.canPrint ? `<button class="action-btn download-proposal-btn" title="Imprimir" data-id="${p.id}"><i class="fas fa-print"></i></button>` : ''}
                            </td>
                        </tr>
                    `}).join('') || `<tr><td colspan="9" class="text-center py-4 text-gray-500">Nenhuma proposta encontrada.</td></tr>`}
                </tbody>
            </table>
        </div>
         <div class="p-4 flex justify-between items-center border-t">
            <span class="text-sm text-gray-600">Mostrando ${paginatedItems.length} de ${filteredProposals.length} propostas</span>
            <div class="flex items-center space-x-2">
                <button id="prop-prev-page-btn" class="btn btn-secondary" ${safeCurrentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>
                <span class="text-sm font-medium">Página ${safeCurrentPage} de ${totalPages || 1}</span>
                <button id="prop-next-page-btn" class="btn btn-secondary" ${safeCurrentPage === totalPages || totalPages === 0 ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    `;

    // Restaura a posição do scroll
    const newScrollContainer = container.querySelector('.overflow-x-auto');
    if (newScrollContainer) {
        newScrollContainer.scrollLeft = scrollLeft;
    }

    addProposalCardEventListeners();

    document.querySelectorAll('.sortable-header').forEach(header => {
        header.addEventListener('click', e => {
            const newColumn = e.currentTarget.dataset.column;
            if (appState.proposalSort.column === newColumn) {
                appState.proposalSort.direction = appState.proposalSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                appState.proposalSort.column = newColumn;
                appState.proposalSort.direction = 'desc';
            }
            renderProposalsList();
        });
    });

    document.getElementById('prop-prev-page-btn').addEventListener('click', () => {
        if (appState.proposalsView.currentPage > 1) {
            appState.proposalsView.currentPage--;
            renderProposalsList();
        }
    });

    document.getElementById('prop-next-page-btn').addEventListener('click', () => {
        if (appState.proposalsView.currentPage < totalPages) {
            appState.proposalsView.currentPage++;
            renderProposalsList();
        }
    });
}

function addProposalCardEventListeners() {
    document.querySelectorAll('.edit-proposal-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
            const id = e.currentTarget.dataset.id;
            try {
                showLoading(true);
                // Carrega dados de clientes E detalhes da proposta em paralelo
                const [_, result] = await Promise.all([
                    refreshClientData(),
                    apiCall('get_proposal_details', { params: { id } })
                ]);
                const { proposal } = result;
                showLoading(false);

                resetProposalState();
                appState.proposal.isEditing = true;
                appState.proposal.id = proposal.id;
                Object.assign(appState.proposal, proposal);

                // --- ALTERAÇÃO: Garante que 'items' e 'parametros' são arrays ---
                appState.proposal.items = (proposal.items || []).map(item => ({
                    ...item,
                    parametros: (item.parametros && Array.isArray(item.parametros)) ? item.parametros : []
                }));
                // --- FIM ALTERAÇÃO ---

                if (proposal.organizacao_id) {
                    appState.proposal.clientType = 'pj';
                    const org = appState.organizations.find(o => o.id == proposal.organizacao_id);
                    appState.proposal.currentClient = JSON.parse(JSON.stringify(org));

                    if (proposal.contato_id) {
                        appState.proposal.currentClient.contact = {
                            id: proposal.contato_id,
                            nome: proposal.contato_nome,
                            email: proposal.contato_email,
                            telefone: proposal.contato_telefone
                        };
                    }

                } else {
                    appState.proposal.clientType = 'pf';
                    appState.proposal.currentClient = appState.clients_pf.find(c => c.id == proposal.cliente_pf_id);
                }
                renderProposalsView();
                scrollToProposalForm();
            } catch (error) {
                showLoading(false);
                console.error(error);
            }
        });
    });

    document.querySelectorAll('.view-proposal-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.currentTarget.dataset.id;
            window.open(`imprimir_proposta.php?id=${id}`, '_blank');
        });
    });

    document.querySelectorAll('.download-proposal-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const id = e.currentTarget.dataset.id;
            window.open(`imprimir_proposta.php?id=${id}`, '_blank');
        });
    });

    document.querySelectorAll('.delete-proposal-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
            const id = e.currentTarget.dataset.id;
            const proposalNumber = e.currentTarget.closest('tr').querySelector('td[data-label="Nº"]').textContent;

            Swal.fire({
                title: 'Tem certeza?',
                text: `Você tem certeza que deseja excluir a proposta "${proposalNumber}"? Esta ação não pode ser desfeita.`,
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
                        await apiCall('delete_proposal', { method: 'POST', body: JSON.stringify({ id }) });

                        // Atualiza estado local
                        appState.proposals = appState.proposals.filter(p => p.id != id);

                        Swal.fire(
                            'Excluído!',
                            'Proposta excluída com sucesso!',
                            'success'
                        );
                        renderProposalsList();
                    } catch (error) {
                        Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
                    }
                }
            });
        });
    });
}

function renderProposalClientSelection() {
    const container = document.getElementById('proposal-client-selection');
    if (!container) return;
    const { currentClient, clientType } = appState.proposal;

    if (currentClient) {
        let clientDetails = '';
        let contactSection = '';

        if (clientType === 'pj') {
            const address = [currentClient.logradouro, currentClient.numero, currentClient.bairro, currentClient.cidade, currentClient.estado, currentClient.cep].filter(Boolean).join(' - ');

            clientDetails = `
                <p><strong>Organização:</strong> ${currentClient.nome_fantasia}</p>
                <p><strong>CNPJ:</strong> ${currentClient.cnpj || 'N/A'}</p>
                ${address ? `<p><strong>Endereço:</strong> ${address}</p>` : ''}
            `;

            if (currentClient.contact) {
                const contact = currentClient.contact;
                contactSection = `
                    <p class="mt-2"><strong>Contato:</strong> ${contact.nome || 'N/A'}</p>
                    <p><strong>Fone:</strong> ${contact.telefone || 'N/A'} | <strong>E-mail:</strong> ${contact.email || 'N/A'}</p>
                    <button type="button" id="change-contact-btn" class="text-sm text-blue-600 hover:underline mt-1">Trocar Contato</button>
                `;
            } else {
                contactSection = `
                    <div id="contact-selection-area" class="mt-2">
                         <button type="button" id="show-contact-list-btn" class="btn btn-secondary btn-sm">Selecionar Contato</button>
                    </div>
                `;
            }
        } else {
            clientDetails = `
                <p><strong>Cliente:</strong> ${currentClient.nome}</p>
                <p><strong>CPF:</strong> ${currentClient.cpf || 'N/A'}</p>
            `;
        }
        container.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Cliente Selecionado</h3>
            <div class="p-4 bg-indigo-50 border border-indigo-200 rounded-md">
                ${clientDetails}
                ${contactSection}
                <button type="button" id="change-client-btn" class="text-sm text-red-600 hover:underline mt-2">Alterar Cliente</button>
            </div>
        `;

        document.getElementById('change-client-btn').addEventListener('click', () => {
            appState.proposal.currentClient = null;
            appState.proposal.clientType = null;
            renderProposalClientSelection();
        });

        if (document.getElementById('change-contact-btn')) {
            document.getElementById('change-contact-btn').addEventListener('click', () => {
                delete appState.proposal.currentClient.contact;
                renderProposalClientSelection();
            });
        }

        if (document.getElementById('show-contact-list-btn')) {
            document.getElementById('show-contact-list-btn').addEventListener('click', () => {
                const contactArea = document.getElementById('contact-selection-area');
                const contactsForOrg = (appState.contacts || []).filter(c => c.organizacao_id == currentClient.id);

                if (contactsForOrg.length > 0) {
                    const contactListHtml = contactsForOrg.map(c => `
                        <div class="p-2 border-b last:border-b-0 hover:bg-indigo-100 cursor-pointer select-contact-item" data-contact-id="${c.id}">
                            <p class="font-semibold">${c.nome}</p>
                            <p class="text-xs text-gray-600">${c.email || ''} | ${c.telefone || ''}</p>
                        </div>
                    `).join('');

                    contactArea.innerHTML = `
                        <h4 class="font-semibold text-sm mt-3 mb-1">Contatos disponíveis:</h4>
                        <div class="border rounded-md max-h-40 overflow-y-auto bg-white">
                            ${contactListHtml}
                        </div>
                    `;

                    document.querySelectorAll('.select-contact-item').forEach(item => {
                        item.addEventListener('click', (e) => {
                            const contactId = e.currentTarget.dataset.contactId;
                            const selectedContact = appState.contacts.find(c => c.id == contactId);
                            if (selectedContact) {
                                appState.proposal.currentClient.contact = selectedContact;
                                renderProposalClientSelection();
                            }
                        });
                    });
                } else {
                    contactArea.innerHTML = `<p class="text-sm text-gray-500 mt-2">Nenhum contato cadastrado. Crie um na aba 'Clientes'.</p>`;
                }
            });
        }
    } else {
        container.innerHTML = `
            <h3 class="text-lg font-semibold text-gray-700 mb-2">Selecionar Cliente</h3>
            <div class="flex space-x-4 mb-2">
                <label class="flex items-center"><input type="radio" name="client-type" value="pj" class="mr-2" checked> Pessoa Jurídica</label>
                <label class="flex items-center"><input type="radio" name="client-type" value="pf" class="mr-2"> Pessoa Física</label>
            </div>
            <div id="client-search-container"></div>
        `;

        const renderSearch = (type) => {
            const searchContainer = document.getElementById('client-search-container');
            const placeholder = type === 'pj' ? 'Pesquisar organização...' : 'Pesquisar cliente PF...';

            searchContainer.innerHTML = `
                <div class="flex-grow relative">
                    <input type="text" id="client-search-input" class="form-input w-full" placeholder="${placeholder}">
                    <div id="client-dropdown" class="hidden absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg"></div>
                </div>
                <button type="button" id="show-add-new-client-modal-btn" class="btn btn-secondary flex-shrink-0"><i class="fas fa-plus mr-2"></i>Novo</button>
            `;
            searchContainer.className = 'flex items-start gap-2';

            document.getElementById('show-add-new-client-modal-btn').addEventListener('click', () => openAddNewClientModalFromProposal(type));

            const searchInput = document.getElementById('client-search-input');
            const dropdown = document.getElementById('client-dropdown');

            const populateDropdown = (filter = '') => {
                const data = type === 'pj' ? appState.organizations : appState.clients_pf;
                const filteredData = (data || []).filter(item => (item.nome_fantasia || item.nome).toLowerCase().includes(filter.toLowerCase()));

                dropdown.innerHTML = filteredData.map(item => `
                    <div class="p-2 hover:bg-indigo-100 cursor-pointer" data-id="${item.id}">
                        ${item.nome_fantasia || item.nome}
                    </div>
                `).join('') || `<div class="p-2 text-gray-500">Nenhum resultado.</div>`;

                dropdown.querySelectorAll('[data-id]').forEach(el => {
                    el.addEventListener('click', () => {
                        const selectedId = el.dataset.id;
                        const selectedClient = data.find(item => item.id == selectedId);
                        if (selectedClient) {
                            appState.proposal.currentClient = JSON.parse(JSON.stringify(selectedClient));
                            appState.proposal.clientType = type;
                            dropdown.classList.add('hidden');
                            renderProposalClientSelection();
                        }
                    });
                });
            };

            searchInput.addEventListener('focus', () => {
                populateDropdown(searchInput.value);
                dropdown.classList.remove('hidden');
            });

            searchInput.addEventListener('input', () => populateDropdown(searchInput.value));

            document.addEventListener('click', (e) => {
                if (!searchContainer.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        };

        document.querySelectorAll('input[name="client-type"]').forEach(radio => {
            radio.addEventListener('change', e => renderSearch(e.target.value));
        });

        renderSearch('pj');
    }
}

function renderProposalItemsSection() {
    const container = document.getElementById('proposal-items-section');
    if (!container) return;

    const { items } = appState.proposal;
    let totalProposta = 0;

    const itemsHtml = (items || []).map((item, index) => {
        const itemTotalComDesconto = calculateItemTotal(item);
        totalProposta += itemTotalComDesconto;
        const imageUrl = item.imagem_url || 'https://placehold.co/100x100/e2e8f0/64748b?text=Imagem';
        // --- FIM: Lógica de Cálculo de Valor ---

        // --- CÁLCULO DO FRETE (Adicionado ao Loop, mas aplicado ao Total Geral fora dele) ---
        // (Nada a fazer dentro do loop de itens)

        // --- INÍCIO: Renderização dos Parâmetros ---
        let paramsHtml = '';
        if (item.parametros && Array.isArray(item.parametros) && item.parametros.length > 0) {
            paramsHtml = '<div class="mt-2 space-y-1">';
            paramsHtml += item.parametros.map((param, pIndex) => `
                  <div class="flex items-center justify-between text-xs bg-gray-200 px-2 py-0.5 rounded">
                      <span class="font-medium text-gray-800">${param.nome}: ${formatCurrency(param.valor)}</span>
                      <button type="button" class="remove-proposal-parameter-btn text-red-500 hover:text-red-700 font-bold" data-item-index="${index}" data-param-index="${pIndex}">&times;</button>
                  </div>
              `).join('');
            paramsHtml += '</div>';
        } else {
            paramsHtml = '<p class="text-xs text-gray-500 italic mt-2">Nenhum parâmetro adicional.</p>';
        }
        // --- FIM: Renderização dos Parâmetros ---

        const isLocacao = (item.status || '').toUpperCase() === 'LOCAÇÃO';

        return `
            <div class="border p-4 rounded-md mb-4 bg-gray-50 relative item-card">
                <button type="button" class="remove-proposal-item-btn absolute top-2 right-2 action-btn text-red-500 hover:text-red-700 text-xl leading-none" data-index="${index}" title="Remover Item">&times;</button>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label class="form-label">Descrição*</label><input type="text" data-index="${index}" name="item_descricao" required class="form-input" value="${item.descricao || ''}"></div>
                        <div><label class="form-label">Fabricante</label><input type="text" data-index="${index}" name="item_fabricante" class="form-input" value="${item.fabricante || ''}"></div>
                        <div><label class="form-label">Modelo</label><input type="text" data-index="${index}" name="item_modelo" class="form-input" value="${item.modelo || ''}"></div>
                        <div>
                            <label class="form-label">Tipo</label>
                            <select data-index="${index}" name="item_status" class="form-input">
                                <option value="VENDA" ${item.status === 'VENDA' ? 'selected' : ''}>Venda</option>
                                <option value="LOCAÇÃO" ${item.status === 'LOCAÇÃO' ? 'selected' : ''}>Locação</option>
                            </select>
                        </div>
                    </div>
                    <div class="text-center">
                        <label class="form-label">Imagem</label>
                        <img id="item-image-preview-${index}" src="${imageUrl}" class="w-24 h-24 object-cover mx-auto rounded border mb-2" onerror="this.onerror=null;this.src='https://placehold.co/100x100/e2e8f0/64748b?text=Erro'">
                        <input type="file" class="hidden item-image-upload" id="item-image-upload-${index}" data-index="${index}" accept="image/*">
                        <label for="item-image-upload-${index}" class="btn btn-secondary btn-sm cursor-pointer w-full text-xs">Escolher</label>
                    </div>
                </div>
                 <div class="mt-2"><label class="form-label">Descrição Detalhada</label><textarea data-index="${index}" name="item_descricao_detalhada" rows="3" class="form-input">${item.descricao_detalhada || ''}</textarea></div>
                 
                 <!-- --- Início: Seção de Parâmetros (Nova) --- -->
                 <div class="mt-4 pt-4 border-t">
                     <label class="form-label font-semibold text-sm">Parâmetros Adicionais</label>
                     ${paramsHtml}
                     <div class="flex items-end gap-2 mt-2">
                         <div class="flex-grow">
                             <label class="form-label text-xs">Nome do Parâmetro</label>
                             <input type="text" id="proposal-param-nome-${index}" class="form-input form-input-sm" placeholder="Ex: DC">
                         </div>
                         <div class="flex-grow">
                             <label class="form-label text-xs">Valor do Parâmetro</label>
                             <input type="text" id="proposal-param-valor-${index}" class="form-input form-input-sm" placeholder="Ex: R$ 4.264,00">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm add-proposal-parameter-btn" data-index="${index}">Adicionar</button>
                     </div>
                 </div>
                 <!-- --- Fim: Seção de Parâmetros --- -->

                 <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t">
                    <div><label class="form-label">Quantidade*</label><input type="number" data-index="${index}" name="item_quantidade" required class="form-input" value="${item.quantidade || 1}" min="1"></div>
                    <div>
                        <label class="form-label">Valor Unitário*</label>
                        <input type="text" inputmode="decimal" data-index="${index}" name="item_valor_unitario" required class="form-input" value="${formatCurrencyForInput(item.valor_unitario)}" placeholder="0,00" ${canEditUnitPrice() ? '' : 'disabled'}>
                    </div>
                    
                    <!-- CAMPO MESES LOCAÇÃO: Condicional -->
                    <div class="${isLocacao ? '' : 'hidden'}">
                        <label class="form-label">Meses Locação</label>
                        <input type="number" data-index="${index}" name="item_meses_locacao" class="form-input" value="${item.meses_locacao || 12}" min="1">
                    </div>
                    
                    <div><label class="form-label">Unidade de Medida</label><input type="text" data-index="${index}" name="item_unidade_medida" class="form-input" value="${item.unidade_medida || 'Unidade'}"></div>
                    
                     <!-- --- NOVO CAMPO: DESCONTO (%) --- -->
                    <div>
                        <label class="form-label">Desconto (%)</label>
                        <input type="number" data-index="${index}" name="item_desconto_percent" class="form-input" value="${item.desconto_percent || 0}" min="0" max="30" step="0.1" placeholder="0">
                    </div>
                    
                    <div><label class="form-label">Subtotal</label><input type="text" class="form-input bg-gray-100 font-bold item-subtotal-input" data-index="${index}" value="${formatCurrency(itemTotalComDesconto)}" readonly></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
         <h3 class="text-lg font-semibold text-gray-700 mb-2">Itens da Proposta</h3>
         
         <!-- --- Início: Busca Catálogo (Embutido) --- -->
         <div id="prop-catalog-search-area" class="mb-4 p-4 border rounded-md bg-gray-50 hidden">
             <label class="form-label">Buscar Produto no Catálogo</label>
             <input type="text" id="prop-catalog-search-input" placeholder="Digite o nome do produto..." class="form-input w-full">
             <div id="prop-catalog-results-container" class="mt-2 max-h-48 overflow-y-auto border rounded-md bg-white"></div>
         </div>
         <!-- --- Fim: Busca Catálogo --- -->

          <div id="proposal-items-list">${itemsHtml || '<p class="text-center text-gray-500 py-4">Nenhum item adicionado.</p>'}</div>
          
          <!-- --- INÍCIO: Seção de Frete (Nova) --- -->
          <div class="mt-4 p-4 bg-gray-100 rounded-md border flex flex-col md:flex-row justify-between items-center gap-4">
              <div class="flex items-center gap-4 w-full md:w-auto">
                  <div class="w-full md:w-48">
                      <label class="form-label font-bold">Frete*</label>
                      <select name="frete_tipo" id="proposal-frete-tipo" class="form-input">
                          <option value="CIF" ${appState.proposal.frete_tipo === 'CIF' ? 'selected' : ''}>CIF (Pago pelo Remetente)</option>
                          <option value="FOB" ${appState.proposal.frete_tipo === 'FOB' ? 'selected' : ''}>FOB (Pago pelo Destinatário)</option>
                      </select>
                  </div>
                  <div class="w-full md:w-48">
                      <label class="form-label font-bold">Valor do Frete</label>
                      <input type="text" name="frete_valor" id="proposal-frete-valor" class="form-input text-right" 
                             value="${formatCurrency(appState.proposal.frete_valor)}" 
                             ${appState.proposal.frete_tipo === 'CIF' ? 'disabled' : ''}>
                  </div>
              </div>
          </div>
          <!-- --- FIM: Seção de Frete --- -->

          <div class="flex justify-between items-center mt-4">
             <div>
                 <button type="button" id="toggle-prop-catalog-btn" class="btn btn-secondary"><i class="fas fa-book-open mr-2"></i>Do Catálogo</button>
                 <button type="button" id="add-manual-item-btn" class="btn btn-secondary"><i class="fas fa-plus mr-2"></i>Manual</button>
             </div>
             <div class="text-xl font-bold">Total: <span id="proposal-total">${formatCurrency(totalProposta + (parseFloat(appState.proposal.frete_valor) || 0))}</span></div>
         </div>
    `;

    // --- Adiciona Listeners ---

    // Botão Adicionar Manualmente
    document.getElementById('add-manual-item-btn').addEventListener('click', () => {
        appState.proposal.items.push({
            id: `temp_${Date.now()}`,
            descricao: '', fabricante: '', modelo: '', quantidade: 1, valor_unitario: 0,
            status: 'VENDA', imagem_url: '', unidade_medida: 'Unidade', descricao_detalhada: '',
            parametros: []
        });
        renderProposalItemsSection();
    });

    // Botão Toggle Catálogo
    document.getElementById('toggle-prop-catalog-btn').addEventListener('click', (e) => {
        const searchArea = document.getElementById('prop-catalog-search-area');
        searchArea.classList.toggle('hidden');
        if (!searchArea.classList.contains('hidden')) {
            document.getElementById('prop-catalog-search-input').focus();
            renderPropCatalogResults(''); // Renderiza lista inicial
        }
    });

    // Input de Busca do Catálogo
    document.getElementById('prop-catalog-search-input')?.addEventListener('input', (e) => {
        renderPropCatalogResults(e.target.value);
    });

    // Botões Remover Item
    document.querySelectorAll('.remove-proposal-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            appState.proposal.items.splice(e.currentTarget.dataset.index, 1);
            renderProposalItemsSection();
        });
    });

    // Upload de Imagem
    document.querySelectorAll('.item-image-upload').forEach(input => {
        input.addEventListener('change', handleImageUpload);
    });

    // Inputs dos Itens
    document.querySelectorAll('#proposal-items-section input, #proposal-items-section textarea, #proposal-items-section select').forEach(input => {
        input.addEventListener('input', handleItemInputChange);
        if (input.name === 'item_valor_unitario' || input.id.startsWith('proposal-param-valor-')) {
            input.addEventListener('blur', handleValueBlur);
        }
    });

    // --- Início: Listeners de Parâmetros ---
    document.querySelectorAll('.add-proposal-parameter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index;
            const nomeInput = document.getElementById(`proposal-param-nome-${index}`);
            const valorInput = document.getElementById(`proposal-param-valor-${index}`);

            if (nomeInput && valorInput && nomeInput.value && valorInput.value) {
                // Formata o valor antes de salvar
                const valorNumerico = parseCurrency(valorInput.value);
                if (!appState.proposal.items[index].parametros) {
                    appState.proposal.items[index].parametros = [];
                }
                appState.proposal.items[index].parametros.push({
                    nome: nomeInput.value,
                    valor: valorNumerico // Salva com número
                });
                nomeInput.value = '';
                valorInput.value = '';
                renderProposalItemsSection(); // Re-renderiza para atualizar
            } else {
                showToast('Preencha o nome e o valor do parâmetro.', 'error');
            }
        });
    });

    document.querySelectorAll('.remove-proposal-parameter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemIndex = e.currentTarget.dataset.itemIndex;
            const paramIndex = e.currentTarget.dataset.paramIndex;
            appState.proposal.items[itemIndex].parametros.splice(paramIndex, 1);
            renderProposalItemsSection(); // Re-renderiza
        });
    });
    // --- Fim: Listeners de Parâmetros ---

    // --- INÍCIO: Listeners de Frete ---
    const freteTipoSelect = document.getElementById('proposal-frete-tipo');
    const freteValorInput = document.getElementById('proposal-frete-valor');

    if (freteTipoSelect && freteValorInput) {
        freteTipoSelect.addEventListener('change', (e) => {
            appState.proposal.frete_tipo = e.target.value;
            if (e.target.value === 'CIF') {
                appState.proposal.frete_valor = 0;
                freteValorInput.value = formatCurrency(0);
                freteValorInput.disabled = true;
            } else {
                freteValorInput.disabled = false;
            }
            renderProposalItemsSection(); // Re-renderiza para atualizar o total
        });

        freteValorInput.addEventListener('blur', (e) => {
            const valor = parseCurrency(e.target.value);
            appState.proposal.frete_valor = valor;
            e.target.value = formatCurrency(valor); // Formata input
            renderProposalItemsSection(); // Re-renderiza para atualizar o total
        });

        // Bloqueia caracteres não numéricos enquanto digita, mas mantém a formatação no blur
        freteValorInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9,]/g, '');
        });
    }
    // --- FIM: Listeners de Frete ---
}

// --- NOVA FUNÇÃO: Renderiza resultados da busca do catálogo (EMBUTIDO) ---
function renderPropCatalogResults(searchTerm) {
    const container = document.getElementById('prop-catalog-results-container');
    if (!container) return;

    const { products } = appState;
    const lowerSearchTerm = searchTerm.toLowerCase();

    const filtered = (products || []).filter(p =>
        (p.nome_produto || '').toLowerCase().includes(lowerSearchTerm) ||
        (p.fabricante || '').toLowerCase().includes(lowerSearchTerm)
    ).sort((a, b) => (a.nome_produto || '').localeCompare(b.nome_produto || ''));

    container.innerHTML = filtered.map(p => `
         <div class="p-2 border-b last:border-b-0 hover:bg-indigo-100 flex justify-between items-center cursor-pointer prop-catalog-select-item" data-product-id="${p.id}">
             <div>
                 <p class="font-semibold text-sm">${p.nome_produto}</p>
                 <p class="text-xs text-gray-600">${p.fabricante || 'N/A'}</p>
                 <p class="text-xs text-gray-500">${formatCurrency(p.valor_unitario)}</p>
             </div>
             <img src="${p.imagem_url || 'https://placehold.co/40x40/e2e8f0/64748b?text=Img'}" class="w-10 h-10 object-cover rounded" onerror="this.onerror=null;this.src='https://placehold.co/40x40/e2e8f0/64748b?text=Erro'">
         </div>
     `).join('') || '<p class="p-4 text-center text-gray-500 text-sm">Nenhum produto encontrado.</p>';

    // Adiciona listeners aos itens clicáveis
    container.querySelectorAll('.prop-catalog-select-item').forEach(item => {
        item.addEventListener('click', e => {
            const productId = e.currentTarget.dataset.productId;
            const product = appState.products.find(p => p.id == productId);
            if (product) {

                // Remove item vazio antes de adicionar um novo do catálogo
                appState.proposal.items = appState.proposal.items.filter(item => item.descricao && item.descricao.trim() !== '');

                appState.proposal.items.push({
                    id: `temp_prod_${product.id}_${Date.now()}`,
                    produto_id: product.id,
                    descricao: product.nome_produto,
                    fabricante: product.fabricante || '',
                    modelo: product.modelo || '',
                    descricao_detalhada: product.descricao_detalhada || '',
                    quantidade: 1,
                    valor_unitario: product.valor_unitario || 0,
                    unidade_medida: product.unidade_medida || 'Unidade',
                    imagem_url: product.imagem_url || '',
                    status: 'VENDA',
                    parametros: [] // Inicia sem parâmetros
                });
                renderProposalItemsSection(); // Re-renderiza a seção de itens no modal
                // Não fecha o modal, apenas esconde a busca
                document.getElementById('prop-catalog-search-area').classList.add('hidden');
                document.getElementById('prop-catalog-search-input').value = '';
            }
        });
    });
}


function handleItemInputChange(e) {
    const index = e.target.dataset.index;
    if (!appState.proposal.items[index]) return; // Segurança

    const prop = e.target.name.replace('item_', '');
    let value = e.target.value;

    if (prop === 'valor_unitario') {
        e.target.value = value.replace(/[^0-9,]/g, '');
        // Não atualiza o estado aqui, só no blur
    } else if (prop === 'status') {
        appState.proposal.items[index][prop] = value;
        // Se mudou o status, precisamos re-renderizar para mostrar/esconder o campo Locação
        renderProposalItemsSection();
    } else if (prop === 'meses_locacao') {
        appState.proposal.items[index][prop] = parseInt(value) || 1;
        updateProposalTotalsInDOM();
    } else if (prop === 'quantidade') {
        appState.proposal.items[index][prop] = parseInt(value) || 0;
        updateProposalTotalsInDOM();
    } else if (prop === 'desconto_percent') {
        let val = parseFloat(value) || 0;
        if (val > 30) val = 30;
        if (val < 0) val = 0;
        appState.proposal.items[index][prop] = val;
        updateProposalTotalsInDOM();
    } else {
        appState.proposal.items[index][prop] = value;
    }
}

function handleValueBlur(e) {
    const index = e.target.dataset.index;
    if (!appState.proposal.items[index]) return;

    if (e.target.name === 'item_valor_unitario') {
        const value = parseCurrency(e.target.value);
        appState.proposal.items[index].valor_unitario = value;
        e.target.value = formatCurrencyForInput(value);

        updateProposalTotalsInDOM();
    }
    // Formata o valor do parâmetro (apenas se for o input de parâmetro)
    else if (e.target.id.startsWith('proposal-param-valor-')) {
        const valorNumerico = parseCurrency(e.target.value);
        e.target.value = formatCurrencyForInput(valorNumerico); // Apenas formata o input
    }
}

// --- NOVAS FUNÇÕES DE CÁLCULO OTIMIZADO ---

function calculateItemTotal(item) {
    const valor_unitario_base = parseCurrency(item.valor_unitario);
    let valor_parametros = 0;

    if (item.parametros && Array.isArray(item.parametros)) {
        item.parametros.forEach(param => {
            valor_parametros += (param.valor || 0);
        });
    }

    const valor_unitario_total = valor_unitario_base + valor_parametros;
    const isLocacaoStatus = (item.status || '').toUpperCase() === 'LOCAÇÃO';
    const meses = (isLocacaoStatus && item.meses_locacao) ? parseInt(item.meses_locacao) : 1;
    const itemTotal = (item.quantidade || 0) * valor_unitario_total * meses;

    const descontoPercent = parseFloat(item.desconto_percent) || 0;
    const valorDesconto = itemTotal * (descontoPercent / 100);
    return itemTotal - valorDesconto;
}

function updateProposalTotalsInDOM() {
    const { items } = appState.proposal;
    let totalProposta = 0;

    (items || []).forEach((item, index) => {
        const itemTotal = calculateItemTotal(item);
        totalProposta += itemTotal;

        // Atualiza subtotal do item no DOM
        const subtotalInput = document.querySelector(`.item-subtotal-input[data-index="${index}"]`);
        if (subtotalInput) {
            subtotalInput.value = formatCurrency(itemTotal);
        }
    });

    // Atualiza Total Geral no DOM
    const totalSpan = document.getElementById('proposal-total');
    if (totalSpan) {
        const frete = parseFloat(appState.proposal.frete_valor) || 0;
        totalSpan.textContent = formatCurrency(totalProposta + frete);
    }
}

async function handleImageUpload(e) {
    const index = e.currentTarget.dataset.index;
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    showToast('Enviando imagem...', 'info');

    try {
        const result = await apiCall('upload_image', { method: 'POST', body: formData });
        appState.proposal.items[index].imagem_url = result.url;
        showToast('Imagem enviada com sucesso!');
        document.getElementById(`item-image-preview-${index}`).src = result.url;
    } catch (error) {
        document.getElementById(`item-image-preview-${index}`).src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Erro';
    }
}

function addProposalEventListeners() {
    // --- Listeners para os botões do formulário (Topo e Rodapé) ---
    const closeProposal = () => {
        resetProposalState();
        renderProposalsView();
    };
    document.getElementById('close-proposal-top-btn')?.addEventListener('click', closeProposal);
    document.getElementById('cancel-proposal-top-btn')?.addEventListener('click', closeProposal);
    document.getElementById('close-proposal-bottom-btn')?.addEventListener('click', closeProposal);

    document.getElementById('save-proposal-top-btn')?.addEventListener('click', () => {
        document.getElementById('proposal-form')?.requestSubmit();
    });

    document.getElementById('proposal-form')?.addEventListener('submit', handleProposalFormSubmit);
    document.getElementById('cancel-proposal-edit-btn')?.addEventListener('click', () => {
        resetProposalState();
        renderProposalsView();
    });
    document.getElementById('add-proposal-btn')?.addEventListener('click', async () => {
        showLoading(true);
        await refreshClientData();
        showLoading(false);
        resetProposalState();
        appState.proposal.isEditing = true;
        // Adiciona um item inicial padrão
        appState.proposal.items.push({
            id: `temp_${Date.now()}`,
            descricao: '', fabricante: '', modelo: '', quantidade: 1, valor_unitario: 0,
            status: 'VENDA', imagem_url: '', unidade_medida: 'Unidade', descricao_detalhada: '',
            parametros: []
        });
        renderProposalsView();
        scrollToProposalForm();
    });
    document.getElementById('proposal-search')?.addEventListener('input', () => {
        appState.proposalsView.currentPage = 1;
        renderProposalsList();
    });

    document.querySelectorAll('.create-proposal-from-opp-btn').forEach(btn => {
        btn.addEventListener('click', handleCreateProposalFromOpp);
    });

    document.querySelectorAll('.delete-pre-proposal-btn').forEach(btn => {
        btn.addEventListener('click', handleDeletePreProposal);
    });
}

async function handleDeletePreProposal(e) {
    const opportunityId = e.currentTarget.dataset.opportunityId;
    const opp = appState.pre_proposals.find(o => o.id == opportunityId);
    if (!opp) return;

    Swal.fire({
        title: 'Tem certeza?',
        text: `Você tem certeza que deseja excluir a pré-proposta "${opp.titulo}"? Esta ação não pode ser desfeita.`,
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
                await apiCall('delete_opportunity', { method: 'POST', body: JSON.stringify({ id: opportunityId }) });

                appState.pre_proposals = appState.pre_proposals.filter(o => o.id != opportunityId);
                appState.opportunities = appState.opportunities.filter(o => o.id != opportunityId);

                Swal.fire(
                    'Excluído!',
                    'Pré-proposta excluída com sucesso!',
                    'success'
                );
                renderProposalsView();
            } catch (error) {
                console.error(error);
                Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
            }
        }
    });
}


async function handleCreateProposalFromOpp(e) {
    const oppId = e.currentTarget.dataset.opportunityId;
    // --- ALTERAÇÃO: Busca detalhes completos da API ---
    let opp;
    try {
        showLoading(true);
        const [_, result] = await Promise.all([
            refreshClientData(),
            apiCall('get_opportunity_details', { params: { id: oppId } })
        ]);
        opp = result.opportunity;
        showLoading(false);
    } catch (error) {
        showLoading(false);
        showToast('Erro ao carregar detalhes da pré-proposta.', 'error');
        return;
    }
    // --- FIM ALTERAÇÃO ---

    if (!opp) return showToast('Oportunidade não encontrada.', 'error');

    resetProposalState();
    appState.proposal.oportunidade_id = opp.id;

    if (opp.organizacao_id) {
        appState.proposal.clientType = 'pj';
        appState.proposal.currentClient = JSON.parse(JSON.stringify(appState.organizations.find(org => org.id == opp.organizacao_id)));
        if (opp.contato_id) {
            appState.proposal.currentClient.contact = appState.contacts.find(c => c.id == opp.contato_id);
        }
    } else if (opp.cliente_pf_id) {
        appState.proposal.clientType = 'pf';
        appState.proposal.currentClient = appState.clients_pf.find(c => c.id == opp.cliente_pf_id);
    }

    // --- ALTERAÇÃO: Copia 'items' da oportunidade (que agora inclui parâmetros) ---
    // A API (get_opportunity_details) agora retorna um array 'items'
    appState.proposal.items = (opp.items || []).map((item, index) => ({
        ...item,
        id: `temp_opp_item_${item.id || index}_${Date.now()}`, // Cria ID temporário
        produto_id: item.produto_id || null, // Garante que tenha produto_id (se houver)
        // Garante que parâmetros sejam um array, mesmo se nulos
        parametros: (item.parametros && Array.isArray(item.parametros))
            ? item.parametros.map(p => ({ nome: p.nome, valor: parseCurrency(p.valor) }))
            : [],
        desconto_percent: 0
    }));

    // Fallback se 'items' não veio da API
    if (appState.proposal.items.length === 0) {
        appState.proposal.items.push({
            id: `temp_fallback_${Date.now()}`,
            descricao: opp.descricao_produto || opp.titulo,
            descricao_detalhada: opp.notas || '',
            fabricante: opp.fabricante || '',
            modelo: opp.modelo || '',
            imagem_url: '',
            quantidade: opp.quantidade || 1,
            valor_unitario: parseFloat(opp.valor_unitario) || 0,
            status: 'VENDA',
            unidade_medida: 'Unidade',
            parametros: [],
            desconto_percent: 0
        });
    }
    // --- FIM DA ALTERAÇÃO ---

    // --- FIM DA ALTERAÇÃO ---

    renderProposalsView();
    scrollToProposalForm();
}

async function handleProposalFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = { ...appState.proposal };

    ['data_validade', 'status', 'faturamento', 'treinamento', 'condicoes_pagamento', 'prazo_entrega',
        'garantia_equipamentos', 'garantia_acessorios', 'instalacao', 'assistencia_tecnica', 'observacoes', 'motivo_status']
        .forEach(key => data[key] = formData.get(key));

    // Adiciona campos de frete explicitamente (já estão no appState, mas por garantia)
    data.frete_tipo = appState.proposal.frete_tipo;
    data.frete_valor = appState.proposal.frete_valor;

    if (!data.currentClient) return showToast('Por favor, selecione um cliente.', 'error');
    if (!data.items || data.items.length === 0) return showToast('Adicione pelo menos um item à proposta.', 'error');

    // --- INÍCIO DA NOVA VALIDAÇÃO ---
    // Verifica se a data de validade está vazia
    if (!data.data_validade) {
        // Tenta focar no campo de data e destacá-lo
        const dataValidadeInput = e.target.querySelector('input[name="data_validade"]');
        if (dataValidadeInput) {
            dataValidadeInput.focus();
            // Adiciona uma borda vermelha temporária para feedback visual
            dataValidadeInput.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            setTimeout(() => {
                dataValidadeInput.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
            }, 2500); // Remove o destaque após 2.5 segundos
        }
        // Mostra o toast de erro e interrompe o salvamento
        return showToast('Por favor, informe a Data de Validade da Proposta.', 'error');
    }
    // --- FIM DA NOVA VALIDAÇÃO ---

    // --- ALTERAÇÃO: Limpa IDs temporários e formata valores ---
    data.items = data.items.map(item => {
        const newItem = { ...item };
        if (String(newItem.id).startsWith('temp_')) {
            delete newItem.id;
        }
        // Garante que valor unitário seja número
        newItem.valor_unitario = parseCurrency(newItem.valor_unitario);
        newItem.desconto_percent = parseFloat(newItem.desconto_percent) || 0;
        // --- ALTERAÇÃO: Garante que valor do parâmetro é NÚMERO ---
        if (newItem.parametros && Array.isArray(newItem.parametros)) {
            newItem.parametros = newItem.parametros.map(param => ({
                nome: param.nome,
                valor: parseCurrency(param.valor) // Garante que é NÚMERO
            }));
        } else {
            newItem.parametros = [];
        }

        return newItem;
    });
    // --- FIM ALTERAÇÃO ---

    try {
        const action = data.id ? 'update_proposal' : 'create_proposal';
        const result = await apiCall(action, { method: 'POST', body: JSON.stringify(data) });

        const resultProposal = result.proposal?.proposal || result.proposal; // Acomoda ambas as estruturas

        if (data.id) {
            const index = appState.proposals.findIndex(p => p.id == resultProposal.id);
            if (index !== -1) appState.proposals[index] = resultProposal;
            showToast('Proposta atualizada!');
        } else {
            appState.proposals.push(resultProposal);
            if (result.proposal.opportunity) appState.opportunities.push(result.proposal.opportunity);
            if (data.oportunidade_id) appState.pre_proposals = appState.pre_proposals.filter(op => op.id != data.oportunidade_id);

            const oppIdToUpdate = result.proposal.opportunity?.id || data.oportunidade_id;
            if (oppIdToUpdate) {
                const stage = appState.stages.find(s => s.nome.toLowerCase() === 'proposta');
                if (stage) {
                    const oppIdx = appState.opportunities.findIndex(o => o.id == oppIdToUpdate);
                    if (oppIdx !== -1) appState.opportunities[oppIdx].etapa_id = stage.id;
                }
            }
            showToast('Proposta criada!');
        }
        resetProposalState();
        renderProposalsView();
    } catch (error) { }
}

function openAddNewClientModalFromProposal(clientType) {
    const isPj = clientType === 'pj';
    const title = isPj ? 'Nova Organização' : 'Novo Cliente PF';
    const formFields = isPj ? renderOrganizationFormFieldsForModal({}) : renderClientPfFormFieldsForModal({});

    const content = `<form id="modal-form" class="space-y-4">${formFields}</form>`;

    renderModal(title, content, async (form) => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const action = isPj ? 'create_organization' : 'create_cliente_pf';
        const stateKey = isPj ? 'organizations' : 'clients_pf';
        const resultKey = isPj ? 'organization' : 'client_pf';

        try {
            const result = await apiCall(action, { method: 'POST', body: JSON.stringify(data) });
            const newItem = result[resultKey];
            appState[stateKey].push(newItem);

            appState.proposal.currentClient = newItem;
            appState.proposal.clientType = clientType;

            closeModal();
            renderProposalClientSelection();
            if (isPj) renderContactSelection(newItem.id);
            showToast(`${isPj ? 'Organização criada' : 'Cliente criado'}!`);
        } catch (error) { }
    });

    const form = document.getElementById('modal-form');
    if (isPj) setupApiFetch(form, 'cnpj', apiCall);
    setupApiFetch(form, 'cep', apiCall);
}

function renderOrganizationFormFieldsForModal(data) {
    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">CNPJ</label><div class="relative"><input type="text" name="cnpj" class="form-input" value="${data.cnpj || ''}"><button type="button" data-type="cnpj" class="api-fetch-btn absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"><i class="fas fa-search"></i></button></div></div>
            <div><label class="form-label">Nome Fantasia*</label><input type="text" name="nome_fantasia" required class="form-input" value="${data.nome_fantasia || ''}"></div>
        </div>
        <div><label class="form-label">Razão Social</label><input type="text" name="razao_social" class="form-input" value="${data.razao_social || ''}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">CEP</label><div class="relative"><input type="text" name="cep" class="form-input" value="${data.cep || ''}"><button type="button" data-type="cep" class="api-fetch-btn absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"><i class="fas fa-search"></i></button></div></div>
            <div class="col-span-2"><label class="form-label">Logradouro</label><input type="text" name="logradouro" class="form-input" value="${data.logradouro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">Número</label><input type="text" name="numero" class="form-input" value="${data.numero || ''}"></div>
            <div><label class="form-label">Complemento</label><input type="text" name="complemento" class="form-input" value="${data.complemento || ''}"></div>
            <div><label class="form-label">Bairro</label><input type="text" name="bairro" class="form-input" value="${data.bairro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Cidade</label><input type="text" name="cidade" class="form-input" value="${data.cidade || ''}"></div>
            <div><label class="form-label">Estado</label><input type="text" name="estado" class="form-input" value="${data.estado || ''}"></div>
        </div>
    `;
}

function renderClientPfFormFieldsForModal(data) {
    return `
        <div><label class="form-label">Nome*</label><input type="text" name="nome" required class="form-input" value="${data.nome || ''}"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Email</label><input type="email" name="email" class="form-input" value="${data.email || ''}"></div>
            <div><label class="form-label">Telefone</label><input type="tel" name="telefone" class="form-input" value="${data.telefone || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">CPF</label><input type="text" name="cpf" class="form-input" value="${data.cpf || ''}"></div>
            <div><label class="form-label">Data de Nascimento</label><input type="date" name="data_nascimento" class="form-input" value="${data.data_nascimento || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">CEP</label><div class="relative"><input type="text" name="cep" class="form-input" value="${data.cep || ''}"><button type="button" data-type="cep" class="api-fetch-btn absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"><i class="fas fa-search"></i></button></div></div>
            <div class="col-span-2"><label class="form-label">Logradouro</label><input type="text" name="logradouro" class="form-input" value="${data.logradouro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">Número</label><input type="text" name="numero" class="form-input" value="${data.numero || ''}"></div>
            <div><label class="form-label">Complemento</label><input type="text" name="complemento" class="form-input" value="${data.complemento || ''}"></div>
            <div><label class="form-label">Bairro</label><input type="text" name="bairro" class="form-input" value="${data.bairro || ''}"></div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Cidade</label><input type="text" name="cidade" class="form-input" value="${data.cidade || ''}"></div>
            <div><label class="form-label">Estado</label><input type="text" name="estado" class="form-input" value="${data.estado || ''}"></div>
        </div>
    `;
}


function canEditUnitPrice() {
    const { role } = appState.currentUser;
    // Permite: ANALISTA, COMERCIAL, GESTOR, DIRETOR, SUPER_ADMIN
    // Bloqueia: VENDEDOR, ESPECIALISTA, MARKETING, REPRESENTANTE, FINANCEIRO, TECNICO
    const allowedRoles = ['Analista', 'Comercial', 'Gestor', 'Diretor', 'Super Admin', 'Admin'];
    return allowedRoles.includes(role);
}
