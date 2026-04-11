// js/views/leads.js

import { appState } from '../state.js';
import { apiCall } from '../api.js';
import { showToast, formatDate, formatCurrency, parseCurrency, formatCurrencyForInput } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';

// Define as etapas para o funil de leads
const leadStages = [
    'Cliente Potencial',
    'Tentativa de Contato',
    'Contato pendente',
    'Envio de Proposta',
    'Negociação',
    'Fechamento',
    'Oportunidade futura'
];

// Mapeamento de status antigos para novas etapas para compatibilidade. 'Novo' é o padrão para novos leads.
const statusToStageMap = {
    'Novo': 'Cliente Potencial',
    'Aguardando': 'Tentativa de Contato',
    'Proposta Enviada': 'Envio de Proposta',
    // Adicione outros mapeamentos se necessário
};

// Mapeamento inverso para obter o status do DB a partir da etapa visual
const stageToStatusMap = {
    'Cliente Potencial': 'Novo',
    'Tentativa de Contato': 'Tentativa de Contato', // Ou 'Aguardando' se preferir manter o antigo
    'Contato pendente': 'Contato pendente',
    'Envio de Proposta': 'Envio de Proposta',
    'Negociação': 'Negociação',
    'Fechamento': 'Fechamento',
    'Oportunidade futura': 'Oportunidade futura'
};


let localState = {
    searchTerm: '',
    filters: {
        sub_origem: '',
        produto_interesse: '' // Mantido para lógica de pesquisa, mas removido da UI de filtro
    }
};

const subOrigemOptions = ['Facebook', 'Instagram', 'Whatsapp', 'Google', 'Site', 'E-mail', 'Outros'];
// Lista de produtos/interesses (usada internamente agora)
const produtoInteresseOptions = ['Ultrassom Kosmos', 'Oxímetro', 'DEA', 'SedLine', 'Outro', 'FR_Sendline', 'FR_Oximetro', 'FR_Ultrasoom'];

export function renderLeadsView() {
    const container = document.getElementById('leads-view');
    const { permissions } = appState.currentUser;

    const subOrigemFilters = subOrigemOptions.map(opt => `
        <label class="flex items-center space-x-2 text-sm cursor-pointer">
            <input type="radio" name="sub_origem_filter" value="${opt}" ${localState.filters.sub_origem === opt ? 'checked' : ''} class="form-radio">
            <span>${opt}</span>
        </label>
    `).join('');

    container.innerHTML = `
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
             <h1 class="text-2xl font-bold text-gray-800">Funil de Leads</h1>
             <div class="flex items-center gap-2">
                 <button id="import-leads-btn" class="btn btn-secondary flex-shrink-0"><i class="fas fa-upload mr-2"></i>Importar Leads</button>
                 <button id="print-leads-report-btn" class="btn btn-secondary flex-shrink-0"><i class="fas fa-print mr-2"></i>Imprimir Relatório</button>
             </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-sm border mb-6 space-y-4">
            <div class="relative w-full">
                <input type="text" id="leads-search-input" placeholder="Pesquisar por nome, email, telefone, produto..." class="form-input w-full pr-10" value="${localState.searchTerm}">
                <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
             <div class="flex items-center justify-start flex-wrap gap-x-4 gap-y-2 text-sm">
                <strong>Sub-Origem:</strong>
                ${subOrigemFilters}
                <button id="clear-sub-origem-filter" class="text-xs text-red-500 hover:underline ${!localState.filters.sub_origem ? 'hidden' : ''}">Limpar</button>
            </div>
        </div>

        <!-- ALTERAÇÃO: Adicionado container para scroll --!>
        <div id="lead-kanban-scroll-container" class="kanban-scroll-container">
            <div id="lead-kanban-inner-container" class="kanban-inner-container">
                <!-- As colunas do Kanban serão renderizadas aqui pelo JavaScript --!>
            </div>
        </div>
    `;

    renderLeadKanbanBoard();
    addLeadsEventListeners();
}

function renderLeadKanbanBoard() {
    // --- ALTERAÇÃO: Alvo é o container interno ---
    const container = document.getElementById('lead-kanban-inner-container');
    if (!container) return;
    container.innerHTML = ''; // Limpa apenas o container interno

    let filteredLeads = [...(appState.leads || [])];

    filteredLeads = filteredLeads.filter(lead => lead.status !== 'Convertido em Oportunidade' && lead.status !== 'Recusado');

    if (localState.filters.sub_origem) {
        filteredLeads = filteredLeads.filter(lead => lead.sub_origem === localState.filters.sub_origem);
    }
    // A lógica de filtro por produto_interesse é removida da UI, mas a pesquisa ainda funciona
    if (localState.searchTerm) {
        const term = localState.searchTerm.toLowerCase();
        filteredLeads = filteredLeads.filter(lead =>
            (lead.nome && lead.nome.toLowerCase().includes(term)) ||
            (lead.email && lead.email.toLowerCase().includes(term)) ||
            (lead.telefone && lead.telefone.toLowerCase().includes(term)) ||
            (lead.produto_interesse && lead.produto_interesse.toLowerCase().includes(term))
        );
    }

    leadStages.forEach(stage => {
        const leadsInStage = filteredLeads.filter(lead => {
            const leadStage = statusToStageMap[lead.status] || lead.status;
            return leadStage === stage;
        });

        const column = document.createElement('div');
        column.className = 'kanban-column flex flex-col'; // Mantém as classes da coluna
        column.dataset.stageName = stage;

        column.innerHTML = `
            <div class="kanban-column-header"> <!-- Classe para o cabeçalho --!>
                <h3 class="font-semibold text-md text-gray-700">${stage}</h3>
            </div>
            <div class="stage-cards"> <!-- Scroll vertical é gerenciado pelo CSS --!>
                ${leadsInStage.map(lead => createLeadCard(lead)).join('') || '<div class="p-4 text-center text-xs text-gray-400">Nenhum lead.</div>'}
            </div>
        `;
        container.appendChild(column);
    });

    addKanbanEventListeners();
}

function getLeadCardColorClass(status) {
    const stage = statusToStageMap[status] || status;
    switch (stage) {
        case 'Cliente Potencial':
        case 'Contato pendente':
            return 'lead-card-novo'; // Verde
        case 'Tentativa de Contato':
            return 'lead-card-tentativa'; // Amarelo
        case 'Envio de Proposta':
        case 'Negociação':
        case 'Fechamento':
            return 'lead-card-negociacao'; // Azul
        default:
            return ''; // Cor padrão
    }
}

function createLeadCard(lead) {
    const { permissions } = appState.currentUser;
    const canManage = permissions.canManageLeads;

    const subOrigemDropdown = subOrigemOptions.map(opt => `<option value="${opt}" ${lead.sub_origem === opt ? 'selected' : ''}>${opt}</option>`).join('');

    const colorClass = getLeadCardColorClass(lead.status);

    return `
        <div class="lead-kanban-card ${colorClass}" draggable="${canManage}" data-lead-id="${lead.id}">
            <h4 class="font-bold text-gray-800 text-sm">${lead.nome}</h4>
            <p class="text-xs text-gray-600 mt-1 truncate" title="${lead.email}"><i class="fas fa-envelope mr-2 text-gray-400"></i>${lead.email || 'N/A'}</p>
            <p class="text-xs text-gray-600 truncate" title="${lead.telefone}"><i class="fas fa-phone mr-2 text-gray-400"></i>${lead.telefone || 'N/A'}</p>
            <div class="mt-2 pt-2 border-t border-gray-100">
                <p class="text-xs text-gray-500">Origem: ${lead.origem || 'N/A'}</p>
                <p class="text-xs text-gray-500">Data: ${formatDate(lead.data_chegada)}</p>
                 <p class="text-xs text-gray-500 mt-1 truncate" title="${lead.produto_interesse}">Interesse: ${lead.produto_interesse || 'N/A'}</p>
            </div>
             <div class="mt-2 space-y-1 text-right">
                <select class="form-input text-xs" data-lead-id="${lead.id}" data-field="sub_origem" ${!canManage ? 'disabled' : ''}>
                     <option value="">Selecione Sub-Origem</option>
                     ${subOrigemDropdown}
                </select>
            </div>
        </div>
    `;
}


function addLeadsEventListeners() {
    document.getElementById('leads-search-input')?.addEventListener('input', e => {
        localState.searchTerm = e.target.value;
        renderLeadKanbanBoard();
    });

    document.querySelectorAll('input[name="sub_origem_filter"]').forEach(radio => {
        radio.addEventListener('change', e => {
            localState.filters.sub_origem = e.target.value;
            document.getElementById('clear-sub-origem-filter')?.classList.remove('hidden');
            renderLeadKanbanBoard();
        });
    });

    document.getElementById('clear-sub-origem-filter')?.addEventListener('click', () => {
        localState.filters.sub_origem = '';
        const radio = document.querySelector('input[name="sub_origem_filter"]:checked');
        if (radio) radio.checked = false;
        document.getElementById('clear-sub-origem-filter')?.classList.add('hidden');
        renderLeadKanbanBoard();
    });

    document.getElementById('print-leads-report-btn')?.addEventListener('click', openPrintReportModal);
    document.getElementById('import-leads-btn')?.addEventListener('click', openImportLeadsModal);
}

function addKanbanEventListeners() {
    const { permissions } = appState.currentUser;
    const canManage = permissions.canManageLeads;

    document.querySelectorAll('.lead-kanban-card').forEach(card => {
        if (canManage) {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', handleDragStart);
        } else {
            card.setAttribute('draggable', 'false');
        }
        card.addEventListener('click', (e) => {
            if (e.target.closest('select')) return; // Não abre modal se clicar no select
            openEditLeadModal(e.currentTarget.dataset.leadId);
        });
    });

    if (canManage) {
        // --- ALTERAÇÃO: Listeners agora no container interno ---
        const columns = document.querySelectorAll('#lead-kanban-inner-container .kanban-column');
        columns.forEach(column => {
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('dragleave', handleDragLeave);
            column.addEventListener('drop', handleDrop);
        });
    }

    document.querySelectorAll('.lead-field-update').forEach(select => {
        select.addEventListener('change', async (e) => {
            if (!canManage) return;
            const leadId = e.currentTarget.dataset.leadId;
            const fieldName = e.currentTarget.dataset.field;
            const value = e.currentTarget.value;
            try {
                if (fieldName === 'sub_origem') {
                    await apiCall('update_lead_field', {
                        method: 'POST',
                        body: JSON.stringify({ lead_id: leadId, field: fieldName, value: value })
                    });
                    const lead = appState.leads.find(l => l.id == leadId);
                    if (lead) lead[fieldName] = value;
                    showToast(`Campo '${fieldName}' do lead atualizado.`);
                    // Não precisa re-renderizar tudo, apenas atualiza o estado
                }
            } catch (error) { }
        });
    });
}


function handleDragStart(e) {
    if (!e.target.classList.contains('lead-kanban-card')) return;
    e.dataTransfer.setData('text/plain', e.target.dataset.leadId);
    e.dataTransfer.effectAllowed = 'move';
    // Adiciona a classe diretamente, o timeout não é estritamente necessário
    e.target.classList.add('dragging');
}


function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer.types.includes('text/plain')) {
        e.dataTransfer.dropEffect = 'move';
        // A classe drag-over é adicionada à coluna no CSS
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
}


function handleDragLeave(e) {
    // A classe drag-over é removida da coluna no CSS
}

async function handleDrop(e) {
    e.preventDefault();
    const column = e.currentTarget.closest('.kanban-column'); // Garante que pegamos a coluna
    if (!column) return;
    // A classe drag-over é removida da coluna no CSS

    const draggingCard = document.querySelector('.lead-kanban-card.dragging');
    if (draggingCard) {
        draggingCard.classList.remove('dragging');
    } else {
        console.warn("Cartão arrastado não encontrado após drop.");
    }

    const leadId = e.dataTransfer.getData('text/plain');
    const stageName = column.dataset.stageName;

    const newStatus = stageToStatusMap[stageName];
    if (!newStatus) {
        console.error("Mapeamento de etapa para status não encontrado:", stageName);
        return;
    }


    const lead = appState.leads.find(l => l.id == leadId);
    if (lead && lead.status !== newStatus) {
        // Otimização: Move o card visualmente ANTES da chamada da API
        const targetCardContainer = column.querySelector('.stage-cards');
        if (draggingCard && targetCardContainer) {
            // Insere no início da coluna de destino
            targetCardContainer.insertBefore(draggingCard, targetCardContainer.firstChild);
            // Atualiza a cor da borda imediatamente
            draggingCard.className = `lead-kanban-card ${getLeadCardColorClass(newStatus)}`;
        }

        try {
            await apiCall('update_lead_status', {
                method: 'POST',
                body: JSON.stringify({ lead_id: leadId, status: newStatus })
            });
            lead.status = newStatus; // Atualiza o estado
            // Não precisa re-renderizar tudo, o card já foi movido
            showToast('Status do lead atualizado!');
        } catch (error) {
            console.error("Erro ao atualizar status do lead:", error);
            // Se der erro, desfaz a movimentação visual (pode precisar recarregar)
            showToast('Erro ao atualizar status. Recarregue a página.', 'error');
            renderLeadKanbanBoard(); // Re-renderiza para garantir consistência em caso de erro
        }
    }
}


async function openEditLeadModal(leadId) {
    const lead = appState.leads.find(l => l.id == leadId);
    if (!lead) return;

    const opportunity = lead.oportunidade_id ? appState.opportunities.find(o => o.id == lead.oportunidade_id) : null;
    const isEditingOpp = !!opportunity;
    const { permissions } = appState.currentUser;
    const canManage = permissions.canManageLeads;

    const data = opportunity || lead;
    const title = isEditingOpp ? 'Editar Pré-Proposta Associada' : 'Detalhes do Lead / Criar Pré-Proposta';

    const userOptions = appState.users.filter(u => ['Comercial', 'Gestor', 'Analista', 'Vendedor', 'Especialista'].includes(u.role))
        .map(u => `<option value="${u.id}" ${data.comercial_user_id == u.id ? 'selected' : ''}>${u.nome}</option>`).join('');

    const content = `
        <form id="modal-form" class="space-y-4">
            <input type="hidden" name="id" value="${opportunity?.id || ''}">
            <input type="hidden" name="lead_id" value="${lead.id}">

            <h3 class="text-lg font-semibold border-b pb-2">Dados do Lead</h3>
             <div><label class="form-label">Nome*</label><input type="text" name="lead_nome" required class="form-input" value="${lead.nome || ''}" ${!canManage ? 'readonly' : ''}></div>
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div><label class="form-label">Telefone</label><input type="text" name="lead_telefone" class="form-input" value="${lead.telefone || ''}" ${!canManage ? 'readonly' : ''}></div>
                 <div><label class="form-label">E-mail</label><input type="email" name="lead_email" class="form-input" value="${lead.email || ''}" ${!canManage ? 'readonly' : ''}></div>
            </div>
             <p class="text-sm"><span class="font-medium">Produto/Interesse Registado:</span> ${lead.produto_interesse || 'N/A'}</p>
             <div><label class="form-label">Observações do Lead</label><textarea name="lead_observacao" rows="3" class="form-input" ${!canManage ? 'readonly' : ''}>${lead.observacao || ''}</textarea></div>

            <h3 class="text-lg font-semibold border-b pb-2 mt-6">Pré-Proposta ${isEditingOpp ? '(Associada)' : '(Opcional)'}</h3>
            ${isEditingOpp ? `<p class="text-sm text-blue-600">Este lead já foi convertido. Pode editar os dados abaixo.</p>` : `<p class="text-sm text-gray-500">Preencha os campos abaixo para criar e encaminhar uma pré-proposta.</p>`}

            <div><label class="form-label">Título da Pré-Proposta*</label><input type="text" name="titulo" required class="form-input" value="${data.titulo || `Oportunidade - ${lead.nome}`}" ${!canManage ? 'readonly' : ''}></div>
            <div><label class="form-label">Encaminhar para</label><select name="comercial_user_id" class="form-input" ${!canManage ? 'disabled' : ''}><option value="${appState.currentUser.id}">Manter comigo</option>${userOptions}</select></div>
            <div><label class="form-label">Descrição do Produto/Serviço (Pré-Proposta)</label><textarea name="descricao_produto" rows="3" class="form-input" ${!canManage ? 'readonly' : ''}>${data.descricao_produto || lead.produto_interesse || ''}</textarea></div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label class="form-label">Fabricante/Marca</label><input type="text" name="fabricante" class="form-input" value="${data.fabricante || ''}" ${!canManage ? 'readonly' : ''}></div>
                <div><label class="form-label">Modelo</label><input type="text" name="modelo" class="form-input" value="${data.modelo || ''}" ${!canManage ? 'readonly' : ''}></div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label class="form-label">Quantidade</label><input type="number" name="quantidade" value="${data.quantidade || 1}" class="form-input" ${!canManage ? 'readonly' : ''}></div>
                <div><label class="form-label">Valor Unitário (R$)</label><input type="text" inputmode="decimal" name="valor_unitario" class="form-input" value="${formatCurrencyForInput(data.valor_unitario)}" placeholder="0,00" ${!canManage ? 'readonly' : ''}></div>
                <div><label class="form-label">Valor Total (R$)</label><input type="text" name="valor" class="form-input bg-gray-100 font-bold" value="${formatCurrencyForInput(data.valor)}" readonly></div>
            </div>

            <div><label class="form-label">Notas da Pré-Proposta</label><textarea name="notas" rows="3" class="form-input" ${!canManage ? 'readonly' : ''}>${data.notas || data.observacao || `Lead convertido da API.\\nOrigem: ${lead.origem}\\nEmail: ${lead.email}\\nTelefone: ${lead.telefone}`}</textarea></div>
        </form>
        ${canManage ? `<div class="mt-4 pt-4 border-t"><button type="button" id="restart-lead-btn" class="btn btn-warning">Reiniciar Lead (Voltar para Cliente Potencial)</button></div>` : ''}
    `;

    renderModal(title, content, null, 'Salvar Alterações no Lead', `btn-secondary ${!canManage ? 'hidden' : ''}`);

    const form = document.getElementById('modal-form');
    const modalBox = document.getElementById('modal-box');
    const confirmBtn = modalBox.querySelector('#modal-confirm-btn');
    const cancelBtn = modalBox.querySelector('#modal-cancel-btn');

    const preProposalBtn = document.createElement('button');
    preProposalBtn.id = 'modal-preproposal-btn';
    preProposalBtn.className = `btn btn-primary ${!canManage ? 'hidden' : ''}`;
    preProposalBtn.textContent = isEditingOpp ? 'Atualizar Pré-Proposta' : 'Encaminhar Pré-Proposta';
    if (confirmBtn) confirmBtn.insertAdjacentElement('beforebegin', preProposalBtn);

    const handlePreProposalSubmit = async () => {
        if (!form.reportValidity()) return;

        const formData = new FormData(form);
        const dataToSend = {};
        ['id', 'lead_id', 'titulo', 'comercial_user_id', 'descricao_produto', 'fabricante', 'modelo', 'quantidade', 'valor_unitario', 'valor', 'notas'].forEach(key => {
            dataToSend[key] = formData.get(key);
        });

        dataToSend.valor = parseCurrency(dataToSend.valor);
        dataToSend.valor_unitario = parseCurrency(dataToSend.valor_unitario);

        try {
            const result = await apiCall(isEditingOpp ? 'update_opportunity' : 'create_opportunity', { method: 'POST', body: JSON.stringify(dataToSend) });
            const savedOpp = result.opportunity;

            if (isEditingOpp) {
                const index = appState.opportunities.findIndex(o => o.id == savedOpp.id);
                if (index > -1) appState.opportunities[index] = savedOpp;
            } else {
                appState.opportunities.push(savedOpp);
                lead.oportunidade_id = savedOpp.id;
            }

            // Atualiza o status do lead para "Convertido" ou mantém se já estiver
            if (lead.status !== 'Convertido em Oportunidade') {
                lead.status = 'Convertido em Oportunidade'; // Muda o status local
                await apiCall('update_lead_status', { method: 'POST', body: JSON.stringify({ lead_id: lead.id, status: 'Convertido em Oportunidade' }) });
            }


            showToast(`Pré-Proposta ${isEditingOpp ? 'atualizada' : 'criada'}!`);
            closeModal();
            renderLeadKanbanBoard(); // Re-renderiza para remover o lead convertido
        } catch (error) {
            console.error("Falha ao submeter pré-proposta:", error);
        }
    };

    preProposalBtn.addEventListener('click', handlePreProposalSubmit);

    // --- BUTTON DELETE START ---
    if (permissions.canDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Excluir';
        deleteBtn.className = 'btn btn-error text-white bg-red-500 hover:bg-red-600 mr-auto';
        deleteBtn.type = 'button';
        deleteBtn.style.marginRight = 'auto'; // Force left alignment

        deleteBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Tem certeza?',
                text: `Você tem certeza que deseja excluir o lead "${lead.nome}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Apagar',
                cancelButtonText: 'Cancelar',
                backdrop: `rgba(0,0,0,0.8)`
            }).then(async (result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Excluindo...',
                        text: 'Aguarde...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });
                    try {
                        await apiCall('delete_lead', { method: 'POST', body: JSON.stringify({ id: lead.id }) });
                        // Remove from local state
                        appState.leads = appState.leads.filter(l => l.id != lead.id);
                        Swal.fire('Excluído!', 'Lead excluído com sucesso.', 'success');
                        closeModal();
                        renderLeadKanbanBoard();
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
                    }
                }
            });
        });

        // Insert before the confirmation button (or wherever fits best in footer)
        if (confirmBtn) {
            // Se já existir botão de confirmação, insere antes dele, mas queremos que fique na esquerda
            // O footer do modal geralmente é flex-end. Para alinhar à esquerda, podemos usar mr-auto no botão.
            const footer = confirmBtn.parentElement;
            if (footer) footer.insertBefore(deleteBtn, footer.firstChild);
        }
    }
    // --- BUTTON DELETE END ---

    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            if (!canManage) return;
            const fieldsToUpdate = ['nome', 'telefone', 'email', 'observacao'];
            const dataToSave = { lead_id: lead.id, fields: {} };
            let changed = false;

            fieldsToUpdate.forEach(field => {
                const formValue = form.querySelector(`[name="lead_${field}"]`)?.value;
                // Compara valores, tratando null/undefined como string vazia para consistência
                const currentValue = lead[field] === null || lead[field] === undefined ? '' : String(lead[field]);
                const newValue = formValue === null || formValue === undefined ? '' : String(formValue);

                if (currentValue !== newValue) {
                    dataToSave.fields[field] = formValue; // Salva o valor original do form
                    changed = true;
                }
            });


            if (!changed) {
                showToast('Nenhuma alteração detetada no lead.', 'info');
                closeModal();
                return;
            }

            try {
                await apiCall('update_lead_fields', { method: 'POST', body: JSON.stringify(dataToSave) });
                // Atualiza o objeto lead no estado da aplicação
                Object.assign(lead, dataToSave.fields);
                showToast('Alterações salvas no lead.');
                closeModal();
                renderLeadKanbanBoard(); // Re-renderiza para mostrar as alterações
            } catch (error) { }
        });
    }

    const restartBtn = document.getElementById('restart-lead-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', async () => {
            if (!canManage) return;
            if (lead.status === 'Novo') {
                showToast('Este lead já está no início do funil.', 'info');
                return;
            }
            try {
                await apiCall('update_lead_status', {
                    method: 'POST',
                    body: JSON.stringify({ lead_id: leadId, status: 'Novo' })
                });
                lead.status = 'Novo'; // Atualiza estado local
                showToast('Lead reiniciado para Cliente Potencial!');
                closeModal();
                renderLeadKanbanBoard(); // Re-renderiza para mover o card
            } catch (error) {
                console.error("Erro ao reiniciar lead:", error);
            }
        });
    }

    const qtyInput = form.querySelector('input[name="quantidade"]');
    const unitValueInput = form.querySelector('input[name="valor_unitario"]');
    const totalValueInput = form.querySelector('input[name="valor"]');
    const updateTotal = () => {
        const qty = parseInt(qtyInput.value) || 0;
        const unitValue = parseCurrency(unitValueInput.value);
        totalValueInput.value = formatCurrencyForInput(qty * unitValue);
    };
    qtyInput.addEventListener('input', updateTotal);
    unitValueInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9,]/g, '').replace('.', ',');
        updateTotal();
    });
    unitValueInput.addEventListener('blur', (e) => {
        e.target.value = formatCurrencyForInput(parseCurrency(e.target.value));
    });
    updateTotal(); // Calcula o total inicial
}


function openPrintReportModal() {
    const columns = [
        { key: 'nome', label: 'Nome' },
        { key: 'email', label: 'Email' },
        { key: 'telefone', label: 'Telefone' },
        { key: 'origem', label: 'Origem' },
        { key: 'sub_origem', label: 'Sub-Origem' },
        { key: 'produto_interesse', label: 'Produto/Interesse' },
        { key: 'data_chegada', label: 'Data Chegada' },
        { key: 'status', label: 'Status' },
        { key: 'observacao', label: 'Observação' }
    ];

    const checkboxes = columns.map(col => `
        <label class="flex items-center space-x-2">
            <input type="checkbox" name="report_column" value="${col.key}" checked class="form-checkbox">
            <span>${col.label}</span>
        </label>
    `).join('');

    const content = `
        <form id="modal-form">
            <p class="mb-4">Selecione as colunas que deseja incluir no relatório:</p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                ${checkboxes}
            </div>
        </form>
    `;

    renderModal('Imprimir Relatório de Leads', content, (form) => {
        const selectedColumns = Array.from(form.querySelectorAll('input[name="report_column"]:checked')).map(cb => cb.value);
        if (selectedColumns.length === 0) {
            showToast('Selecione pelo menos uma coluna.', 'error');
            return;
        }

        let leadsToPrint = [...(appState.leads || [])];
        if (localState.filters.sub_origem) {
            leadsToPrint = leadsToPrint.filter(lead => lead.sub_origem === localState.filters.sub_origem);
        }
        if (localState.searchTerm) {
            const term = localState.searchTerm.toLowerCase();
            leadsToPrint = leadsToPrint.filter(lead =>
                (lead.nome && lead.nome.toLowerCase().includes(term)) ||
                (lead.email && lead.email.toLowerCase().includes(term)) ||
                (lead.telefone && lead.telefone.toLowerCase().includes(term)) ||
                (lead.produto_interesse && lead.produto_interesse.toLowerCase().includes(term))
            );
        }

        let printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Relatório de Leads</title>');
        printWindow.document.write('<style>body{font-family:sans-serif; font-size: 10pt;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #ddd; padding:5px; text-align: left;} th{background-color:#f2f2f2; font-weight: bold;} tr:nth-child(even){background-color:#f9f9f9;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Relatório de Leads</h1>');
        printWindow.document.write(`<p>Filtros aplicados: Sub-Origem: ${localState.filters.sub_origem || 'Todos'}, Pesquisa: ${localState.searchTerm || 'Nenhuma'}</p>`);
        printWindow.document.write('<table><thead><tr>');

        selectedColumns.forEach(key => {
            const col = columns.find(c => c.key === key);
            printWindow.document.write(`<th>${col.label}</th>`);
        });

        printWindow.document.write('</tr></thead><tbody>');

        leadsToPrint.forEach(lead => {
            printWindow.document.write('<tr>');
            selectedColumns.forEach(key => {
                let value = lead[key] || '';
                if (key === 'data_chegada') value = formatDate(value);
                if (key === 'observacao' && value.length > 100) value = value.substring(0, 100) + '...';
                printWindow.document.write(`<td>${value}</td>`);
            });
            printWindow.document.write('</tr>');
        });

        printWindow.document.write('</tbody></table></body></html>');
        printWindow.document.close();
        printWindow.print();
        closeModal();
    }, 'Imprimir');
}

function openImportLeadsModal() {
    const content = `
        <form id="modal-form" class="space-y-4">
            <div>
                <label for="lead-file-input" class="form-label">Selecione o ficheiro (.xlsx ou .csv)</label>
                <input type="file" id="lead-file-input" accept=".xlsx, .csv" required class="form-input">
            </div>
            <p class="text-sm text-gray-600">
                O ficheiro deve ter as colunas: <code class="bg-gray-100 p-1 rounded">nome</code>, <code class="bg-gray-100 p-1 rounded">email</code>, <code class="bg-gray-100 p-1 rounded">telefone</code>, <code class="bg-gray-100 p-1 rounded">origem</code>, <code class="bg-gray-100 p-1 rounded">produto_interesse</code>, <code class="bg-gray-100 p-1 rounded">observacao</code>.
                <br><em>(Colunas extra serão ignoradas. Email ou telefone são recomendados para evitar duplicados.)</em>
            </p>
            <div id="import-status" class="hidden text-sm"></div>
        </form>
    `;

    renderModal('Importar Leads', content, async (form) => {
        const fileInput = document.getElementById('lead-file-input');
        const file = fileInput.files[0];
        const statusDiv = document.getElementById('import-status');
        const confirmBtn = document.getElementById('modal-confirm-btn');

        if (!file) {
            showToast('Selecione um ficheiro.', 'error');
            return;
        }

        statusDiv.classList.remove('hidden');
        statusDiv.textContent = 'A processar o ficheiro...';
        confirmBtn.disabled = true;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const data = event.target.result;
            let leads = [];
            try {
                if (file.name.endsWith('.xlsx')) {
                    const workbook = XLSX.read(data, { type: 'binary' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    leads = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                } else if (file.name.endsWith('.csv')) {
                    // Simples parse CSV (pode precisar de biblioteca mais robusta para casos complexos)
                    const csvData = data;
                    const lines = csvData.split(/\r\n|\n/).filter(line => line.trim() !== ''); // Ignora linhas vazias
                    leads = lines.map(line => {
                        // Lida com vírgulas dentro de aspas (simplificado)
                        const cells = [];
                        let currentCell = '';
                        let inQuotes = false;
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            if (char === '"' && (i === 0 || line[i - 1] !== '\\')) { // Lida com aspas escapadas simples
                                inQuotes = !inQuotes;
                            } else if (char === ',' && !inQuotes) {
                                cells.push(currentCell.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"'));
                                currentCell = '';
                            } else {
                                currentCell += char;
                            }
                        }
                        cells.push(currentCell.trim().replace(/^"|"$/g, '').replace(/\\"/g, '"')); // Última célula
                        return cells;
                    });
                } else {
                    throw new Error('Formato de ficheiro não suportado.');
                }


                if (leads.length < 2) {
                    throw new Error('Ficheiro vazio ou apenas com cabeçalho.');
                }

                const header = leads[0].map(h => String(h).toLowerCase().trim().replace(/\s+/g, '_')); // Converte para string antes de usar métodos
                const requiredHeaders = ['nome', 'email', 'telefone', 'origem', 'produto_interesse', 'observacao'];
                const headerMap = {};
                requiredHeaders.forEach(reqHeader => {
                    const index = header.findIndex(h => h === reqHeader);
                    if (index !== -1) {
                        headerMap[reqHeader] = index;
                    } else {
                        console.warn(`Cabeçalho opcional não encontrado: ${reqHeader}`);
                    }
                });

                if (headerMap.nome === undefined) {
                    throw new Error("A coluna 'nome' é obrigatória no cabeçalho.");
                }


                const leadsData = leads.slice(1).map((row, rowIndex) => {
                    const lead = {};
                    let hasEmailOrPhone = false;
                    for (const key in headerMap) {
                        const cellValue = row[headerMap[key]];
                        // Converte valor da célula para string antes de processar
                        const stringValue = cellValue !== undefined && cellValue !== null ? String(cellValue) : null;

                        if ((key === 'data_chegada') && typeof cellValue === 'number' && cellValue > 10000) {
                            // Tenta converter data do Excel
                            const excelEpoch = new Date(1899, 11, 30);
                            const date = new Date(excelEpoch.getTime() + cellValue * 86400000);
                            lead[key] = date.toISOString().split('T')[0];
                        } else {
                            lead[key] = stringValue;
                        }


                        if ((key === 'email' && lead[key]) || (key === 'telefone' && lead[key])) {
                            hasEmailOrPhone = true;
                        }
                    }
                    // Validação mais robusta: nome não pode ser vazio e precisa de email OU telefone
                    if (!lead.nome || lead.nome.trim() === '' || (!lead.email && !lead.telefone)) {
                        console.warn(`Linha ${rowIndex + 2} ignorada: Nome (${lead.nome}) e (Email ou Telefone) são obrigatórios e não podem ser vazios.`);
                        return null;
                    }


                    return lead;
                }).filter(lead => lead !== null);


                if (leadsData.length === 0) {
                    throw new Error('Nenhum lead válido encontrado no ficheiro após validação.');
                }

                statusDiv.textContent = `A enviar ${leadsData.length} leads para o servidor...`;

                const result = await apiCall('import_leads', {
                    method: 'POST',
                    body: JSON.stringify({ leads: leadsData })
                });

                statusDiv.textContent = `Importação concluída! ${result.imported} leads importados, ${result.duplicates} duplicados ignorados, ${result.errors} erros.`;
                showToast(`Importação concluída! ${result.imported} novos leads.`);
                if (result.newLeads && result.newLeads.length > 0) {
                    // Adiciona os novos leads ao início da lista no estado da aplicação
                    appState.leads = [...result.newLeads, ...appState.leads];
                    renderLeadKanbanBoard(); // Re-renderiza o quadro com os novos leads
                }

                setTimeout(closeModal, 3000);

            } catch (error) {
                console.error("Erro na importação:", error);
                statusDiv.textContent = `Erro: ${error.message}`;
                showToast(`Erro na importação: ${error.message}`, 'error');
                confirmBtn.disabled = false;
            }
        };

        if (file.name.endsWith('.xlsx')) {
            reader.readAsBinaryString(file);
        } else if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            showToast('Formato de ficheiro não suportado. Use .xlsx ou .csv.', 'error');
            confirmBtn.disabled = false;
        }

    }, 'Importar', 'btn-primary');
}
