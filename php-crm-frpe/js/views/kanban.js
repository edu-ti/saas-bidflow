// js/views/kanban.js

import { appState } from '../state.js';
import { initializeApp } from '../script.js'; // Importa initializeApp
import { formatCurrency, calculateTimeInStage, formatCurrencyForInput, parseCurrency, showToast, formatDate } from '../utils.js';
import { apiCall } from '../api.js';
import { renderModal, closeModal } from '../ui.js';
import { openAgendamentoModal } from './agenda.js';

// Estado local temporário para os itens da oportunidade no modal
let currentOpportunityItems = [];
let currentOpportunityId = null; // Para saber se estamos editando

export function renderFunilView() {
    const container = document.getElementById('funil-view');
    // Garante que a view tenha flex-col para o scroll funcionar
    container.classList.add('flex', 'flex-col', 'h-full'); // Garante altura total e layout de coluna

    const { activeTab } = appState.funilView;
    const { permissions } = appState.currentUser;

    // Define 'licitacoes' as a valid tab if not already handled by default state
    // We might need to ensure appState.funilView has a sensible default.

    container.innerHTML = `
        <div class="flex justify-between items-start sm:items-center mb-3 gap-2 flex-shrink-0 responsive-stack"> <!-- Adicionado responsive-stack -->
             <div class="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
                 <button class="funil-tab-btn flex-shrink-0 ${activeTab === 'vendas' ? 'active' : ''}" data-tab="vendas">Funil de Vendas</button>
                 <button class="funil-tab-btn flex-shrink-0 ${activeTab === 'fornecedores' ? 'active' : ''}" data-tab="fornecedores">Funil de Fornecedores</button>
                 <button class="funil-tab-btn flex-shrink-0 ${activeTab === 'licitacoes' ? 'active' : ''}" data-tab="licitacoes">Funil Licitações</button>
             </div>
             <div class="flex items-center gap-2">
                  ${permissions.canCreateOpportunity ? `
                     <button id="add-opportunity-btn" class="btn btn-primary ${activeTab === 'fornecedores' ? 'hidden' : ''}">
                         <i class="fas fa-plus mr-2"></i><span>${activeTab === 'licitacoes' ? 'Nova Licitação' : 'Oportunidade'}</span>
                     </button>
                 ` : ''}

                 ${permissions.canCreate ? `
                  <button id="add-venda-fornecedor-btn" class="btn btn-primary ${activeTab === 'vendas' || activeTab === 'licitacoes' ? 'hidden' : ''}">
                     <i class="fas fa-plus mr-2"></i><span>Cadastrar Venda</span>
                 </button>
                 ` : ''}
             </div>
         </div>
          <!-- Container para Cabeçalho de Fornecedores -->
         <div id="fornecedores-header-container" class="bg-white p-2 rounded-lg shadow-sm border mb-3 flex-shrink-0 ${activeTab !== 'fornecedores' ? 'hidden' : ''}"></div>
         
         <!-- Container para Cabeçalho de Licitações (Novo) -->
         <div id="licitacoes-header-container" class="bg-white p-2 rounded-lg shadow-sm border mb-3 flex-shrink-0 ${activeTab !== 'licitacoes' ? 'hidden' : ''}"></div>

         <!-- --- ALTERAÇÃO: Adicionado container para scroll --- -->
         <div id="funil-content-container" class="kanban-scroll-container">
              <div id="funil-inner-container" class="kanban-inner-container">
                  <!-- Conteúdo (colunas) será renderizado aqui -->
              </div>
         </div>
     `;

    document.querySelectorAll('.funil-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.funilView.activeTab = btn.dataset.tab;
            renderFunilView(); // Re-renderiza a view inteira ao trocar de aba
        });
    });

    document.getElementById('add-opportunity-btn')?.addEventListener('click', () => openCreateOpportunityModal());
    document.getElementById('add-venda-fornecedor-btn')?.addEventListener('click', () => openVendaFornecedorModal(null));

    // Renderiza o conteúdo apropriado dentro do container interno
    if (activeTab === 'vendas') {
        renderKanbanBoard();
    } else if (activeTab === 'licitacoes') {
        renderLicitacoesHeader(); // Renderiza o cabeçalho novo
        renderKanbanBoard();
    } else {
        renderFornecedoresView(); // Fornecedores também usam a estrutura Kanban agora
    }
}

// Renderiza o conteúdo do Funil de Vendas ou Licitações (Kanban)
function renderKanbanBoard() {
    // Alvo é o container interno
    const board = document.getElementById('funil-inner-container');
    if (!board) return;
    board.innerHTML = '';

    if (!appState.stages || appState.stages.length === 0) {
        board.innerHTML = `<div class="p-8 text-center w-full"><p class="text-red-500">Erro: Etapas do funil não carregadas.</p></div>`;
        return;
    }

    const { activeTab } = appState.funilView;
    const currentFunnelId = activeTab === 'licitacoes' ? 2 : 1; // 1 = Vendas, 2 = Licitações

    // Inicializa estados de filtro para licitações se não existirem
    if (activeTab === 'licitacoes') {
        if (!appState.funilView.licitacaoYear) appState.funilView.licitacaoYear = new Date().getFullYear();
        if (appState.funilView.licitacaoMonth === undefined) appState.funilView.licitacaoMonth = new Date().getMonth(); // 0-11
        if (appState.funilView.selectedLicitacaoFornecedorId === undefined) appState.funilView.selectedLicitacaoFornecedorId = null;
    }

    // Filter stages by the current funnel
    const restrictedRoles = ['Comercial', 'Gestor', 'Analista'];
    const userRole = appState.currentUser.role;
    const canManageRestrictedStages = restrictedRoles.includes(userRole) || appState.currentUser.permissions.isAdmin;

    let stagesToRender = appState.stages.filter(stage => {
        // If funil_id is explicitly set, use it. Otherwise, assume ID 1 (legacy/default)
        if (stage.funil_id) {
            return stage.funil_id == currentFunnelId;
        }
        // Fallback: If no funil_id in DB yet (older entries?), or standard stages, assume funnel 1
        return currentFunnelId === 1;
    }).sort((a, b) => a.ordem - b.ordem);

    // Hide 'Faturado' if not allowed
    if (!canManageRestrictedStages) {
        stagesToRender = stagesToRender.filter(s => s.nome !== 'Faturado');
    }

    // Hide 'Faturado' from Sales funnel (ID 1) as requested (moved to Financeiro)
    if (currentFunnelId === 1) {
        stagesToRender = stagesToRender.filter(s => s.nome !== 'Faturado');
    }

    if (stagesToRender.length === 0) {
        board.innerHTML = `<div class="p-8 text-center w-full"><p class="text-gray-500">Nenhuma etapa encontrada para este funil (ID ${currentFunnelId}).</p></div>`;
        return;
    }

    stagesToRender.forEach(stage => {
        let opportunitiesInStage = appState.opportunities
            .filter(opp => opp.etapa_id == stage.id);

        // --- FILTROS ESPECÍFICOS DE LICITAÇÕES ---
        if (activeTab === 'licitacoes') {
            const { licitacaoYear, licitacaoMonth, selectedLicitacaoFornecedorId } = appState.funilView;

            opportunitiesInStage = opportunitiesInStage.filter(opp => {
                // Filtro de Data (considerando data_criacao)
                const date = new Date(opp.data_criacao || 0);
                const matchDate = date.getFullYear() === licitacaoYear && date.getMonth() === licitacaoMonth;

                // Filtro de Fornecedor
                let matchFornecedor = true;
                if (selectedLicitacaoFornecedorId) {
                    const fornecedor = appState.fornecedores.find(f => f.id == selectedLicitacaoFornecedorId);
                    if (fornecedor) {
                        const term = fornecedor.nome.toLowerCase();
                        // Verifica se o fabricante está na lista de fabricantes dos itens
                        if (opp.fabricantes_itens && typeof opp.fabricantes_itens === 'string') {
                            matchFornecedor = opp.fabricantes_itens.toLowerCase().includes(term);
                        } else {
                            // Fallback: busca no título ou notas
                            matchFornecedor = (opp.titulo && opp.titulo.toLowerCase().includes(term)) ||
                                (opp.notas && opp.notas.toLowerCase().includes(term));
                        }
                    }
                }

                return matchDate && matchFornecedor;
            });
        }
        // -----------------------------------------

        opportunitiesInStage.sort((a, b) => {
            // Ordena por data_criacao DESC (mais recente primeiro)
            const dateA = new Date(a.data_criacao || 0);
            const dateB = new Date(b.data_criacao || 0);
            return dateB - dateA;
        });

        const stageTotal = opportunitiesInStage.reduce((sum, opp) => sum + parseFloat(opp.valor || 0), 0);

        let extraCards = '';
        if (stage.nome.toLowerCase() === 'treinamentos' && appState.agendamentos) {
            const treinamentos = appState.agendamentos.filter(ag => ag.tipo === 'Treinamento');
            treinamentos.sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));
            extraCards = treinamentos.map(treinamento => createTrainingCard(treinamento)).join('');
        }

        const isControleEntrega = stage.nome === 'Controle de Entrega';
        const isFaturado = stage.nome === 'Faturado';
        const isRestrictedColumn = (isControleEntrega || isFaturado) && !canManageRestrictedStages;

        let extraClass = '';
        if (isRestrictedColumn) {
            extraClass = ' restricted-stage';
        }

        const column = document.createElement('div');
        column.className = 'kanban-column flex flex-col' + extraClass;
        column.dataset.stageId = stage.id;
        column.dataset.isRestricted = isRestrictedColumn ? 'true' : 'false';
        column.dataset.stageName = stage.nome;

        column.innerHTML = `
             <div class="kanban-column-header">
                 <div class="flex justify-between items-center">
                     <h3 class="font-semibold text-sm text-gray-700">${stage.nome} ${isRestrictedColumn ? '<i class="fas fa-lock ml-1 text-xs" title="Somente Leitura"></i>' : ''}</h3>
                     <span class="font-bold text-xs text-gray-800">${formatCurrency(stageTotal)}</span>
                 </div>
             </div>
             <div class="stage-cards">
                 ${extraCards}
                 ${opportunitiesInStage.map(opp => createOpportunityCard(opp, stage.nome)).join('') || (extraCards === '' ? '<div class="p-4 text-center text-xs text-gray-400">Nenhuma oportunidade.</div>' : '')}
             </div>
         `;
        board.appendChild(column);
    });

    addKanbanEventListeners();
}

// --- NOVA FUNÇÃO: Renderiza cabeçalho de filtros para Licitações ---
function renderLicitacoesHeader() {
    const headerContainer = document.getElementById('licitacoes-header-container');
    if (!headerContainer) return;

    // Inicializa defaults se necessário
    if (!appState.funilView.licitacaoYear) appState.funilView.licitacaoYear = new Date().getFullYear();
    if (appState.funilView.licitacaoMonth === undefined) appState.funilView.licitacaoMonth = new Date().getMonth();
    if (appState.funilView.selectedLicitacaoFornecedorId === undefined) appState.funilView.selectedLicitacaoFornecedorId = null;


    const { licitacaoYear, licitacaoMonth, selectedLicitacaoFornecedorId } = appState.funilView;
    const { fornecedores } = appState;
    const meses = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

    headerContainer.classList.remove('hidden');

    const fornecedorTabs = fornecedores.map(f => `
         <button class="licitacao-fornecedor-btn px-2 py-0.5 rounded-full border text-xs font-medium transition-colors ${f.id == selectedLicitacaoFornecedorId ? 'bg-[#206a9b] text-white border-[#206a9b]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}" data-id="${f.id}">
            ${f.nome}
         </button>
     `).join('');

    // Botão "Todos" para limpar filtro de fornecedor
    const allBtn = `
        <button class="licitacao-fornecedor-btn px-2 py-0.5 rounded-full border text-xs font-medium transition-colors ${!selectedLicitacaoFornecedorId ? 'bg-[#206a9b] text-white border-[#206a9b]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}" data-id="">
            Todos
        </button>
    `;

    headerContainer.innerHTML = `
         <div class="flex flex-col gap-2 justify-center items-center w-full">
             
             <!-- Filtro de Fornecedores -->
             <div class="flex items-center space-x-1 flex-wrap gap-1 justify-center w-full mb-1">
                 ${allBtn}
                 ${fornecedorTabs}
             </div>
             
             <!-- Filtro de Mês e Ano -->
             <div class="flex items-center gap-2 justify-center flex-wrap">
                 <!-- Selector de Mês -->
                 <div class="flex items-center space-x-1">
                     <button id="prev-month-lic-btn" class="year-btn rounded-full p-1 hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-chevron-left text-[10px]"></i></button>
                     <span class="px-2 py-1 bg-[#206a9b] text-white rounded-md font-bold text-[10px] min-w-[60px] text-center uppercase leading-none flex items-center justify-center h-6">${meses[licitacaoMonth]}</span>
                     <button id="next-month-lic-btn" class="year-btn rounded-full p-1 hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-chevron-right text-[10px]"></i></button>
                 </div>
                 
                 <!-- Selector de Ano -->
                 <div class="flex items-center space-x-1">
                     <button id="prev-year-lic-btn" class="year-btn rounded-full p-1 hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-chevron-left text-[10px]"></i></button>
                     <span class="px-2 py-1 bg-[#206a9b] text-white rounded-md font-bold text-[10px] min-w-[40px] text-center leading-none flex items-center justify-center h-6">${licitacaoYear}</span>
                     <button id="next-year-lic-btn" class="year-btn rounded-full p-1 hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-chevron-right text-[10px]"></i></button>
                 </div>
             </div>
         </div>
     `;

    // Listeners para Fornecedores
    document.querySelectorAll('.licitacao-fornecedor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            appState.funilView.selectedLicitacaoFornecedorId = btn.dataset.id || null;
            renderFunilView(); // Re-renderiza para atualizar visual do botão e filtrar board
        });
    });

    // Listeners para Mes/Ano
    document.getElementById('prev-month-lic-btn')?.addEventListener('click', () => {
        let newMonth = appState.funilView.licitacaoMonth - 1;
        if (newMonth < 0) { newMonth = 11; appState.funilView.licitacaoYear--; }
        appState.funilView.licitacaoMonth = newMonth;
        renderFunilView();
    });
    document.getElementById('next-month-lic-btn')?.addEventListener('click', () => {
        let newMonth = appState.funilView.licitacaoMonth + 1;
        if (newMonth > 11) { newMonth = 0; appState.funilView.licitacaoYear++; }
        appState.funilView.licitacaoMonth = newMonth;
        renderFunilView();
    });
    document.getElementById('prev-year-lic-btn')?.addEventListener('click', () => {
        appState.funilView.licitacaoYear--;
        renderFunilView();
    });
    document.getElementById('next-year-lic-btn')?.addEventListener('click', () => {
        appState.funilView.licitacaoYear++;
        renderFunilView();
    });
}


function createTrainingCard(treinamento) {
    let displayDate = 'N/A';
    let displayTime = 'N/A';

    if (treinamento.data_inicio) {
        // Interpreta a string como local
        const parts = treinamento.data_inicio.split(/[- :]/);
        if (parts.length >= 5) {
            const localDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
            displayDate = formatDate(localDate);
            displayTime = localDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else {
            console.warn("Formato inesperado de data_inicio:", treinamento.data_inicio);
            const fallbackDate = new Date(treinamento.data_inicio);
            if (!isNaN(fallbackDate)) {
                displayDate = formatDate(fallbackDate);
                displayTime = fallbackDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
        }
    }
    const nomesPara = treinamento.para_usuario_nomes || 'N/A'; // Usa o campo concatenado

    return `
         <div class="training-card" data-id="${treinamento.id}">
             <h4 class="font-bold text-gray-800 text-xs">${treinamento.titulo}</h4>
             <p class="text-[10px] text-gray-600 mt-0.5"><i class="fas fa-user-tag mr-2 text-gray-400"></i>Para: ${nomesPara}</p>
             <p class="text-[10px] text-gray-500"><i class="fas fa-user-edit mr-2 text-gray-400"></i>Por: ${treinamento.criado_por_nome || 'N/A'}</p>
             <div class="mt-2 pt-1.5 border-t border-gray-100 flex justify-between items-center">
                 <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                     <i class="far fa-calendar-alt mr-1"></i>${displayDate}
                 </span>
                 <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
                     <i class="far fa-clock mr-1"></i>${displayTime}
                 </span>
             </div>
         </div>
     `;
}


function createOpportunityCard(opp, stageName = '') {
    const timeInStage = calculateTimeInStage(opp.data_ultima_movimentacao);
    let timeAlertClass = '';
    if (timeInStage.days > 5) timeAlertClass = 'time-alert-danger';
    else if (timeInStage.days > 2) timeAlertClass = 'time-alert-warn';

    const contactInfo = opp.contato_nome ? `<p class="text-[10px] text-gray-600 truncate"><i class="fas fa-user mr-2 text-gray-400"></i>${opp.contato_nome}</p>` : '';

    let uploadBtn = '';
    if (stageName === 'Faturado') {
        uploadBtn = `<button class="btn-invoice-upload mt-2 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 rounded px-2 py-1 w-full text-center hover:bg-indigo-100 transition-colors" onclick="event.stopPropagation(); window.uploadInvoicePDF(${opp.id})"><i class="fas fa-file-invoice mr-1"></i>Ler Nota Fiscal</button>`;
    }

    return `
         <div class="opportunity-card" draggable="true" data-opp-id="${opp.id}">
             <h4 class="font-bold text-gray-800 text-xs">${opp.titulo}</h4>
             <p class="text-[10px] text-gray-500 mt-0.5">${opp.organizacao_nome || opp.cliente_pf_nome || 'Cliente não definido'}</p>
             ${contactInfo ? contactInfo.replace('text-xs', 'text-[10px]') : ''}
             <div class="mt-2 pt-1.5 border-t border-gray-100 flex justify-between items-center">
                 <span class="text-sm font-semibold text-indigo-700">${formatCurrency(opp.valor)}</span>
                 <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full ${timeAlertClass}">
                     <i class="far fa-clock mr-1"></i>${timeInStage.text}
                 </span>
             </div>
             <div class="text-right mt-1.5 flex justify-between items-end">
                 ${uploadBtn}
                 <span class="text-[10px] text-gray-500 mt-0.5 text-right w-full">${opp.vendedor_nome || ''}</span>
             </div>
         </div>
     `;
}

function addKanbanEventListeners() {
    const { permissions } = appState.currentUser;
    const cards = document.querySelectorAll('#funil-inner-container .opportunity-card');
    const trainingCards = document.querySelectorAll('#funil-inner-container .training-card');

    cards.forEach(card => {
        const column = card.closest('.kanban-column');
        const isRestrictedColumn = column && column.dataset.isRestricted === 'true';

        if (permissions.canEdit && !isRestrictedColumn) {
            card.draggable = true;
            card.addEventListener('dragstart', handleDragStart);
        } else {
            card.draggable = false;
        }
        // Previne múltiplos listeners se re-renderizar
        card.replaceWith(card.cloneNode(true)); // Clona para remover listeners antigos
    });
    // Adiciona listeners aos clones
    document.querySelectorAll('#funil-inner-container .opportunity-card').forEach(card => {
        if (card.draggable) { // Verifica se era arrastável antes de clonar
            card.addEventListener('dragstart', handleDragStart);
        }
        card.addEventListener('click', () => openOpportunityDetailsModal(card.dataset.oppId));
    });


    if (permissions.canEdit) {
        const columns = document.querySelectorAll('#funil-inner-container .kanban-column');
        columns.forEach(column => {
            column.removeEventListener('dragover', handleDragOver); // Remove antes de adicionar
            column.removeEventListener('dragleave', handleDragLeave);
            column.removeEventListener('drop', handleDrop);
            column.addEventListener('dragover', handleDragOver);
            column.addEventListener('dragleave', handleDragLeave);
            column.addEventListener('drop', handleDrop);
        });
    }

    trainingCards.forEach(card => {
        card.replaceWith(card.cloneNode(true)); // Clona para remover listeners antigos
    });
    // Adiciona listeners aos clones
    document.querySelectorAll('#funil-inner-container .training-card').forEach(card => {
        card.addEventListener('click', () => {
            const agendamentoId = card.dataset.id;
            const agendamento = appState.agendamentos.find(ag => ag.id == agendamentoId);
            if (agendamento) {
                openTrainingDetailsModal(agendamento);
            }
        });
    });
}

function openTrainingDetailsModal(agendamento) {
    let displayDate = 'N/A';
    let displayTime = 'N/A';
    if (agendamento.data_inicio) {
        const parts = agendamento.data_inicio.split(/[- :]/);
        if (parts.length >= 5) {
            const localDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);
            displayDate = formatDate(localDate);
            displayTime = localDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else {
            const fallbackDate = new Date(agendamento.data_inicio);
            if (!isNaN(fallbackDate)) {
                displayDate = formatDate(fallbackDate);
                displayTime = fallbackDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
        }
    }
    const nomesPara = agendamento.para_usuario_nomes || 'N/A';

    const content = `
         <div class="space-y-3 text-sm">
             <p><strong>Título:</strong> ${agendamento.titulo}</p>
             <p><strong>Tipo:</strong> ${agendamento.tipo}</p>
             <p><strong>Data:</strong> ${displayDate}</p>
             <p><strong>Hora:</strong> ${displayTime}</p>
             <p><strong>Agendado para:</strong> ${nomesPara}</p>
             <p><strong>Agendado por:</strong> ${agendamento.criado_por_nome || 'N/A'}</p>
             <div class="pt-3">
                 <p class="font-semibold">Observações:</p>
                 <p class="mt-1 p-2 bg-gray-50 rounded border">${agendamento.descricao || 'Nenhuma observação.'}</p>
             </div>
         </div>
     `;

    renderModal('Detalhes do Agendamento', content, () => {
        closeModal();
        openAgendamentoModal(agendamento); // Permite editar ao clicar no botão do modal
    }, 'Editar', 'btn-primary');
}


function handleDragStart(e) {
    if (!e.target.classList.contains('opportunity-card')) return;
    e.dataTransfer.setData('text/plain', e.target.dataset.oppId);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer.types.includes('text/plain')) {
        e.dataTransfer.dropEffect = 'move';
        e.currentTarget.closest('.kanban-column').classList.add('drag-over');
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
}

function handleDragLeave(e) {
    const column = e.currentTarget.closest('.kanban-column');
    if (column) column.classList.remove('drag-over');
}

window.uploadInvoicePDF = function (opportunityId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('invoice', file);
        formData.append('opportunityId', opportunityId);

        showToast('Enviando e processando Nota Fiscal...', 'info');

        try {
            const response = await fetch(`${appState.apiBaseUrl}?action=parse_invoice`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                showToast('Nota fiscal processada com sucesso!');
                // Auto-fill values by refreshing logic or opening the modal and setting the values?
                // For now, let's open the modal so they see the updated details and save
                appState.opportunities = appState.opportunities.map(o => o.id == opportunityId ? result.opportunity : o);
                renderKanbanBoard();
                openOpportunityDetailsModal(opportunityId);
            } else {
                showToast(result.message || 'Erro ao processar nota fiscal.', 'error');
            }
        } catch (error) {
            console.error("Erro no upload da NF:", error);
            showToast('Erro de comunicação.', 'error');
        }
    };
    input.click();
};

async function handleDrop(e) {
    e.preventDefault();
    const column = e.currentTarget.closest('.kanban-column');
    if (!column) return;
    column.classList.remove('drag-over');

    const draggingCard = document.querySelector('.opportunity-card.dragging');
    if (draggingCard) {
        draggingCard.classList.remove('dragging');
    } else {
        console.warn("Cartão de oportunidade arrastado não encontrado.");
        // Tenta encontrar pelo ID transferido se o dragging falhou
        const opportunityIdFromData = e.dataTransfer.getData('text/plain');
        const cardById = document.querySelector(`.opportunity-card[data-opp-id="${opportunityIdFromData}"]`);
        if (!cardById) {
            console.error("Não foi possível encontrar o cartão arrastado nem pela classe nem pelo ID.");
            renderKanbanBoard(); // Recarrega em caso de erro grave
            return;
        }
    }


    const opportunityId = e.dataTransfer.getData('text/plain');
    const newStageId = column.dataset.stageId;
    const isRestrictedTarget = column.dataset.isRestricted === 'true';

    if (isRestrictedTarget) {
        showToast("Você não tem permissão para mover oportunidades para esta etapa.", "error");
        renderKanbanBoard();
        return;
    }

    if (!opportunityId || !newStageId) {
        console.error("ID da Oportunidade ou ID da Etapa inválido no drop.");
        return;
    }


    const opportunity = appState.opportunities.find(opp => opp.id == opportunityId);
    if (opportunity && opportunity.etapa_id != newStageId) {

        const targetCardContainer = column.querySelector('.stage-cards');
        const cardToMove = document.querySelector(`.opportunity-card[data-opp-id="${opportunityId}"]`);
        if (cardToMove && targetCardContainer) {
            targetCardContainer.insertBefore(cardToMove, targetCardContainer.firstChild);
        } else {
            console.warn("Não foi possível mover o card visualmente ANTES da API.");
        }


        try {
            const result = await apiCall('move_opportunity', {
                method: 'POST',
                body: JSON.stringify({ opportunityId, newStageId })
            });
            opportunity.etapa_id = newStageId;
            opportunity.data_ultima_movimentacao = new Date().toISOString();

            // Otimização: Apenas re-renderiza se a API foi bem-sucedida
            renderKanbanBoard();
            showToast('Oportunidade movida!');
        } catch (error) {
            console.error("Erro ao mover oportunidade (API):", error);
            showToast('Erro ao mover oportunidade. Recarregando...', 'error');
            renderKanbanBoard(); // Re-renderiza para voltar ao estado original em caso de erro
        }
    } else if (opportunity && opportunity.etapa_id == newStageId) {
        // Não faz nada se mover para a mesma coluna
    } else {
        console.error("Oportunidade não encontrada no estado para mover:", opportunityId);
        renderKanbanBoard(); // Recarrega se o estado estiver inconsistente
    }
}


// Renderiza a visualização do Funil de Fornecedores
function renderFornecedoresView() {
    const container = document.getElementById('funil-inner-container');
    const { year, selectedFornecedorId } = appState.funilView;
    const { fornecedores } = appState;

    if (!container) return;
    container.innerHTML = '';

    if (!fornecedores || fornecedores.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-500 p-8">Nenhum fornecedor disponível.</p>`;
        const headerContainer = document.getElementById('fornecedores-header-container');
        if (headerContainer) headerContainer.classList.add('hidden');
        return;
    }

    // Permite que selectedFornecedorId seja null (Todos). Apenas inicializa se undefined.
    if (appState.funilView.selectedFornecedorId === undefined && fornecedores.length > 0) {
        appState.funilView.selectedFornecedorId = null; // Default to 'Todos' or specific one if desired. Let's default to Todos (null).
    }
    renderFornecedoresHeader();
    renderFornecedoresGrid();
    addFornecedorCardEventListeners();
}

// Função separada para renderizar o cabeçalho dos fornecedores
function renderFornecedoresHeader() {
    const headerContainer = document.getElementById('fornecedores-header-container');
    if (!headerContainer) {
        console.error("Container do cabeçalho dos fornecedores não encontrado.");
        return;
    }

    const { year, selectedFornecedorId } = appState.funilView;
    const { fornecedores } = appState;

    headerContainer.classList.remove('hidden'); // Garante visibilidade

    const fornecedorTabs = fornecedores.map(f => `
         <button class="fornecedor-tab-btn ${f.id == selectedFornecedorId ? 'active' : ''}" data-id="${f.id}">${f.nome}</button>
     `).join('');

    // Botão "Todos"
    const allBtn = `
        <button class="fornecedor-tab-btn ${!selectedFornecedorId ? 'active' : ''}" data-id="">Todos</button>
    `;

    headerContainer.innerHTML = `
         <div class="flex flex-col md:flex-row justify-between items-center flex-wrap gap-4">
             <div class="flex items-center space-x-2 flex-wrap gap-2 justify-center w-full"> <!-- Centralizado -->
                 <div class="flex items-center space-x-2 flex-wrap gap-2">
                    ${allBtn}
                    ${fornecedorTabs}
                 </div>
                 
                 <!-- Year Selector moved here -->
                 <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
                     <button id="prev-year-btn" class="year-btn"><i class="fas fa-chevron-left text-xs"></i></button>
                     <span class="px-3 py-1 bg-[#206a9b] text-white rounded-md font-bold text-sm">${year}</span>
                     <button id="next-year-btn" class="year-btn"><i class="fas fa-chevron-right text-xs"></i></button>
                 </div>
             </div>
         </div>
     `;

    document.querySelectorAll('.fornecedor-tab-btn').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            // Se o ID for vazio (botão Todos), define como null
            const id = newBtn.dataset.id;
            appState.funilView.selectedFornecedorId = id === "" ? null : id;
            renderFornecedoresView();
        });
    });

    document.getElementById('prev-year-btn')?.addEventListener('click', () => {
        appState.funilView.year--;
        renderFornecedoresView();
    });
    document.getElementById('next-year-btn')?.addEventListener('click', () => {
        appState.funilView.year++;
        renderFornecedoresView();
    });
}


// Renderiza as colunas de meses para o fornecedor selecionado
function renderFornecedoresGrid() {
    const gridContainer = document.getElementById('funil-inner-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    const { year, selectedFornecedorId } = appState.funilView;
    const { vendasFornecedores } = appState;

    if (!vendasFornecedores) {
        gridContainer.innerHTML = '<p class="text-center text-gray-500 p-8">Dados de vendas não disponíveis.</p>';
        return;
    }

    const vendasFiltered = vendasFornecedores.filter(venda => {
        if (!venda.data_venda) return false;
        // Considera a data como UTC para evitar problemas de fuso horário na comparação
        const vendaDate = new Date(venda.data_venda + 'T00:00:00Z');
        const vendaYear = vendaDate.getUTCFullYear();

        // Se selectedFornecedorId for null, traz todos. Se não, filtra pelo ID.
        const matchFornecedor = !selectedFornecedorId || String(venda.fornecedor_id) == String(selectedFornecedorId);

        return matchFornecedor && vendaYear === year;
    });


    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    meses.forEach((mes, index) => {
        const vendasDoMes = vendasFiltered.filter(v => new Date(v.data_venda + 'T00:00:00Z').getUTCMonth() === index);
        const totalMes = vendasDoMes.reduce((sum, v) => sum + parseFloat(v.valor_total || 0), 0);
        const cardsHtml = vendasDoMes.map(venda => {
            // *** ALTERAÇÃO: Usa organizacao_nome ou cliente_pf_nome ***
            const clientName = venda.organizacao_nome || venda.cliente_pf_nome || 'Cliente não informado';
            return `
             <div class="fornecedor-venda-card opportunity-card" data-venda-id="${venda.id}"> <!-- Usando opportunity-card --!>
                 <h4 class="font-bold text-gray-800 text-xs">${venda.titulo || 'Sem Título'}</h4>
                 <p class="text-[10px] text-gray-600 mt-0.5 truncate">${clientName}</p>
                 <div class="mt-2 pt-1.5 border-t border-gray-100 flex justify-between items-center">
                     <span class="text-sm font-semibold text-indigo-700">${formatCurrency(venda.valor_total)}</span>
                     <span class="text-[10px] text-gray-500 mt-0.5">${venda.usuario_nome || ''}</span>
                 </div>
             </div>
         `}).join('');

        gridContainer.innerHTML += `
             <div class="kanban-column flex flex-col">
                 <div class="kanban-column-header">
                     <div class="flex justify-between items-center">
                          <h3 class="font-semibold text-sm text-gray-700">${mes}</h3>
                          <span class="font-bold text-xs text-gray-800">${formatCurrency(totalMes)}</span>
                     </div>
                  </div>
                 <div class="stage-cards">${cardsHtml || '<p class="text-center text-xs text-gray-400 p-4">Nenhuma venda.</p>'}</div>
             </div>`;
    });
}


function addFornecedorCardEventListeners() {
    document.querySelectorAll('#funil-inner-container .fornecedor-venda-card').forEach(card => {
        card.replaceWith(card.cloneNode(true)); // Clona para remover listeners antigos
    });
    // Adiciona listeners aos clones
    document.querySelectorAll('#funil-inner-container .fornecedor-venda-card').forEach(card => {
        card.addEventListener('click', () => {
            const vendaId = card.dataset.vendaId;
            const venda = appState.vendasFornecedores.find(v => v.id == vendaId);
            if (venda) {
                openVendaFornecedorModal(venda);
            } else {
                console.error("Venda não encontrada no estado:", vendaId);
                showToast("Erro: Venda não encontrada.", "error");
            }
        });
    });
}

// --- INÍCIO: Modal Criar/Editar Oportunidade (Refatorado) ---

// Função principal para abrir o modal (criação ou edição)
function openCreateOpportunityModal() {
    currentOpportunityId = null; // Garante que é criação
    currentOpportunityItems = [{ // Adiciona um item inicial
        id: `temp_${Date.now()}`,
        descricao: '',
        fabricante: '',
        modelo: '',
        quantidade: 1,
        valor_unitario: 0,
        status: 'VENDA',
        imagem_url: '',
        unidade_medida: 'Unidade',
        descricao_detalhada: '',
        parametros: []
    }];
    renderOpportunityModal(); // Chama o renderizador principal
}

// Expondo para uso global (ex: financeiro)
window.openOpportunityDetailsModal = openOpportunityDetailsModal;

async function openOpportunityDetailsModal(oppId) {
    currentOpportunityId = oppId; // Define ID para edição
    currentOpportunityItems = []; // Limpa antes de carregar

    try {
        const result = await apiCall('get_opportunity_details', { params: { id: oppId } });
        const opportunity = result.opportunity;
        if (!opportunity) {
            showToast("Oportunidade não encontrada.", "error");
            return;
        }

        // --- ALTERAÇÃO: Carrega itens da API (agora sempre retorna 'items') ---
        if (opportunity.items && opportunity.items.length > 0) {
            // A API retornou itens (da tabela oportunidade_itens ou proposta_itens)
            currentOpportunityItems = opportunity.items.map((item, index) => ({
                ...item,
                // Garante um ID único de frontend para itens que vêm sem um (ex: fallback antigo)
                id: item.id || `api_${index}_${Date.now()}`,
                // Garante que parâmetros sejam um array
                parametros: (item.parametros && Array.isArray(item.parametros)) ? item.parametros : []
            }));
        } else {
            // Fallback: Se mesmo assim não vierem itens (ex: oportunidade muito antiga sem proposta)
            currentOpportunityItems = [{
                id: `fallback_${oppId}`,
                descricao: '',
                fabricante: '',
                modelo: '',
                quantidade: 1,
                valor_unitario: 0,
                status: 'VENDA',
                imagem_url: '',
                unidade_medida: 'Unidade',
                descricao_detalhada: '',
                parametros: []
            }];
        }
        // --- FIM ALTERAÇÃO ---

        renderOpportunityModal(opportunity); // Chama o renderizador principal com os dados

    } catch (error) {
        console.error("Erro ao abrir detalhes da oportunidade:", error);
        showToast("Não foi possível carregar os detalhes da oportunidade.", "error");
        currentOpportunityId = null;
        currentOpportunityItems = [];
    }
}

// Função única para renderizar o modal (criação ou edição)
function renderOpportunityModal(opportunity = null) {
    const isEditing = !!opportunity;
    const data = opportunity || {}; // Usa dados da oportunidade se existirem

    const { permissions } = appState.currentUser;
    // Verifica se PODE editar: (É nova OU (é existente E tem permissão de edição))
    // E (não está associada a uma proposta, pois não deve ser editada por aqui)
    const canEdit = (!isEditing || permissions.canEdit) && !data.proposta_id;

    const isDisabled = !canEdit ? 'disabled' : '';
    let title = isEditing ? 'Editar Oportunidade' : 'Criar Oportunidade';
    if (isEditing && data.proposta_id) {
        title = `Detalhes da Oportunidade (Proposta #${data.numero_proposta})`;
    }

    // Prepara opções dos selects
    const orgOptions = appState.organizations
        .sort((a, b) => (a.nome_fantasia || '').localeCompare(b.nome_fantasia || ''))
        .map(org => `<option value="${org.id}" ${data.organizacao_id == org.id ? 'selected' : ''}>${org.nome_fantasia}</option>`).join('');
    const pfOptions = appState.clients_pf
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
        .map(pf => `<option value="pf-${pf.id}" ${data.cliente_pf_id == pf.id ? 'selected' : ''}>${pf.nome} (PF)</option>`).join('');
    const contactOptions = data.organizacao_id ? appState.contacts
        .filter(c => c.organizacao_id == data.organizacao_id)
        .map(c => `<option value="${c.id}" ${data.contato_id == c.id ? 'selected' : ''}>${c.nome}</option>`).join('') : '';
    const userOptions = appState.users.filter(u => ['Comercial', 'Gestor', 'Analista', 'Vendedor', 'Especialista'].includes(u.role))
        .map(u => `<option value="${u.id}" ${data.comercial_user_id == u.id ? 'selected' : ''}>${u.nome}</option>`).join('');

    const clienteSelectedValue = data.cliente_pf_id ? `pf-${data.cliente_pf_id}` : (data.organizacao_id || '');

    const content = `
         <form id="modal-form" class="space-y-4">
             ${data.proposta_id ? `<div class="p-3 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-800 text-sm">Esta oportunidade já foi convertida na Proposta Nº ${data.numero_proposta}. A edição dos itens deve ser feita na proposta.</div>` : ''}
             <input type="hidden" name="id" value="${data.id || ''}">
             
             <!-- --- LAYOUT PADRÃO (VENDAS/FORNECEDORES) --- -->
             <div id="standard-opportunity-fields" class="${appState.funilView.activeTab === 'licitacoes' ? 'hidden' : ''}">
                 <div><label class="form-label">Título*</label><input type="text" name="titulo" class="form-input" value="${data.titulo || ''}" ${isDisabled}></div>
                 
                 <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                     <div>
                         <label class="form-label">Cliente (Organização ou PF)</label>
                         <select name="cliente_id" class="form-input" ${isDisabled}>
                             <option value="">Selecione...</option>
                             <optgroup label="Organizações">
                                 ${orgOptions}
                             </optgroup>
                             <optgroup label="Clientes PF">
                                 ${pfOptions}
                             </optgroup>
                         </select>
                     </div>
                     <div><label class="form-label">Contato (apenas para Organização)</label><select name="contato_id" class="form-input" ${isDisabled || data.cliente_pf_id ? 'disabled' : ''}><option value="">Selecione...</option>${contactOptions}</select></div>
                 </div>
                 
                 <div class="mt-4"><label class="form-label">Encaminhar para (Pré-Proposta)</label><select name="comercial_user_id" class="form-input" ${isDisabled}><option value="">Minha oportunidade</option>${userOptions}</select></div>
             </div>

             <!-- --- LAYOUT LICITAÇÕES --- -->
             <div id="licitacao-opportunity-fields" class="${appState.funilView.activeTab === 'licitacoes' ? '' : 'hidden'}">
                  <!-- Título também no licitação, mas talvez com label diferente se quiser -->
                  <div><label class="form-label">Título / Objeto Resumido*</label><input type="text" name="titulo_licitacao" class="form-input" value="${data.titulo || ''}" ${isDisabled}></div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div><label class="form-label">Número do Edital</label><input type="text" name="numero_edital" class="form-input" value="${data.numero_edital || ''}" ${isDisabled}></div>
                      <div><label class="form-label">Número do Processo</label><input type="text" name="numero_processo" class="form-input" value="${data.numero_processo || ''}" ${isDisabled}></div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                       <div>
                           <label class="form-label">Modalidade</label>
                           <select name="modalidade" class="form-input" ${isDisabled}>
                               <option value="">Selecione...</option>
                               <option value="Pregão Eletrônico" ${data.modalidade === 'Pregão Eletrônico' ? 'selected' : ''}>Pregão Eletrônico</option>
                               <option value="Pregão Presencial" ${data.modalidade === 'Pregão Presencial' ? 'selected' : ''}>Pregão Presencial</option>
                               <option value="Concorrência" ${data.modalidade === 'Concorrência' ? 'selected' : ''}>Concorrência</option>
                               <option value="Tomada de Preços" ${data.modalidade === 'Tomada de Preços' ? 'selected' : ''}>Tomada de Preços</option>
                               <option value="Convite" ${data.modalidade === 'Convite' ? 'selected' : ''}>Convite</option>
                               <option value="Compra Direta" ${data.modalidade === 'Compra Direta' ? 'selected' : ''}>Compra Direta</option>
                               <option value="Dispensa de Licitação" ${data.modalidade === 'Dispensa de Licitação' ? 'selected' : ''}>Dispensa de Licitação</option>
                               <option value="ATA de Registro de Preço" ${data.modalidade === 'ATA de Registro de Preço' ? 'selected' : ''}>ATA de Registro de Preço</option>
                               <option value="Carona" ${data.modalidade === 'Carona' ? 'selected' : ''}>Carona</option>
                               <option value="Leilão" ${data.modalidade === 'Leilão' ? 'selected' : ''}>Leilão</option>
                               <option value="Outra" ${data.modalidade === 'Outra' ? 'selected' : ''}>Outra</option>
                           </select>
                       </div>
                       <div>
                           <label class="form-label">Órgão Comprador</label>
                           <!-- Reusa o mesmo select de clientes, mas com cópia para funcionar independente -->
                           <select name="cliente_licitacao_id" class="form-input" ${isDisabled}>
                               <option value="">Selecione...</option>
                               <optgroup label="Organizações">
                                   ${orgOptions}
                               </optgroup>
                               <optgroup label="Clientes PF">
                                   ${pfOptions}
                               </optgroup>
                           </select>
                       </div>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div><label class="form-label">Local da Disputa/Portal</label><input type="text" name="local_disputa" class="form-input" value="${data.local_disputa || ''}" ${isDisabled}></div>
                      <div><label class="form-label">UASG</label><input type="text" name="uasg" class="form-input" value="${data.uasg || ''}" ${isDisabled}></div>
                  </div>
                  
                  <div class="mt-4">
                      <label class="form-label">Objeto</label>
                      <textarea name="objeto" rows="4" class="form-input" ${isDisabled}>${data.objeto || ''}</textarea>
                  </div>
                  
                  <div class="mt-4"><label class="form-label">Encaminhar para (Pré-Proposta)</label><select name="comercial_user_id" class="form-input" ${isDisabled}><option value="">Minha oportunidade</option>${userOptions}</select></div>
             </div>
             <!-- --- FIM LAYOUT LICITAÇÕES --- -->
 
             <!-- --- INÍCIO: Secção de Itens (Nova Estrutura) --- -->
             <div id="opportunity-items-section" class="border-t pt-4 mt-4">
                 <!-- Conteúdo renderizado por renderOpportunityItemsSection -->
             </div>
             <!-- --- FIM: Secção de Itens --- -->
             
             <!-- --- RODAPÉ ESPECÍFICO LICITAÇÕES --- -->
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 ${appState.funilView.activeTab === 'licitacoes' ? '' : 'hidden'}">
                 <div><label class="form-label">Data de Abertura/Disputa</label><input type="date" name="data_abertura" class="form-input" value="${data.data_abertura || ''}" ${isDisabled}></div>
                 <div><label class="form-label">Hora da Disputa</label><input type="time" name="hora_disputa" class="form-input" value="${data.hora_disputa || ''}" ${isDisabled}></div>
                 
                 <div class="sm:col-span-2">
                       <label class="form-label">Status (Etapa do Funil)</label>
                       <select name="etapa_id" class="form-input" ${isDisabled} ${appState.funilView.activeTab !== 'licitacoes' ? 'disabled' : ''}>
                           ${appState.stages
            .filter(s => s.funil_id == 2)
            .sort((a, b) => a.ordem - b.ordem)
            .map(s => `<option value="${s.id}" ${data.etapa_id == s.id ? 'selected' : ''}>${s.nome}</option>`)
            .join('')
        }
                       </select>
                 </div>
             </div>

             <!-- --- RODAPÉ PADRÃO --- -->
             <div class="${appState.funilView.activeTab === 'licitacoes' ? 'hidden' : ''}">
                 <div><label class="form-label">Mensagem/Notas Gerais</label><textarea name="notas" rows="3" class="form-input" ${isDisabled}>${data.notas || ''}</textarea></div>
             </div>

         </form>
     `;

    renderModal(title, content, canEdit ? handleOpportunityFormSubmit : closeModal,
        canEdit ? 'Salvar Alterações' : 'Fechar',
        canEdit ? 'btn-primary' : 'btn-secondary'
    );

    const form = document.getElementById('modal-form');
    // Define o valor inicial do select de cliente
    const clienteSelect = form.querySelector('select[name="cliente_id"]');
    if (clienteSelect && clienteSelectedValue) clienteSelect.value = clienteSelectedValue;

    // Adiciona listeners para cliente/contato (apenas se puder editar)
    if (canEdit) {
        setupClientContactSelectionLogic(form);
    }

    // --- ADIÇÃO: Botão de Upload NF ---
    const currentStageName = appState.stages.find(s => s.id == data.etapa_id)?.nome;
    if (isEditing && currentStageName === 'Faturado' && canEdit) {
        const footer = document.querySelector('#modal-box .p-4.bg-gray-50');
        if (footer) {
            const uploadBtn = document.createElement('button');
            uploadBtn.innerHTML = '<i class="fas fa-file-invoice mr-2"></i>Ler Nota Fiscal (PDF)';
            uploadBtn.className = 'btn text-indigo-700 bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 mr-2';
            uploadBtn.type = 'button';
            uploadBtn.onclick = () => {
                // Ao invés de fechar, já chamamos o seletor. Quando atualizar, reabre o modal.
                window.uploadInvoicePDF(data.id);
            };
            // Insere antes do botão fechar/salvar
            footer.insertBefore(uploadBtn, footer.firstChild);
        }
    }
    // --- FIM ADIÇÃO ---

    // --- ADIÇÃO: Botão de Excluir com SweetAlert2 ---
    if (isEditing && permissions.canDelete) {
        const footer = document.querySelector('#modal-box .p-4.bg-gray-50');
        if (footer) {
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt mr-2"></i>Excluir';
            deleteBtn.className = 'btn btn-error text-white bg-red-500 hover:bg-red-600 mr-auto';
            deleteBtn.type = 'button';

            deleteBtn.addEventListener('click', () => {
                Swal.fire({
                    title: 'Tem certeza?',
                    text: "Você tem certeza que deseja apagar esse registro!",
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
                            await apiCall('delete_opportunity', {
                                method: 'POST',
                                body: JSON.stringify({ id: data.id })
                            });
                            Swal.fire(
                                'Excluído!',
                                'Oportunidade excluída com sucesso.',
                                'success'
                            );
                            // Remove do estado local
                            appState.opportunities = appState.opportunities.filter(o => o.id != data.id);

                            closeModal();
                            // Re-renderiza o board (era renderFunilView, mas para oportunidades deve ser kanban)
                            if (typeof renderKanbanBoard === 'function') {
                                renderKanbanBoard();
                            } else if (typeof appState.renderView === 'function') {
                                appState.renderView(); // Fallback genérico se existir
                            } else {
                                // Tenta reload se não achar função (mas kanban deve existir)
                                location.reload();
                            }
                        } catch (error) {
                            console.error(error);
                            Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
                        }
                    }
                });
            });

            footer.insertBefore(deleteBtn, footer.firstChild);
        }
    }
    // --- FIM ADIÇÃO ---

    // Renderiza a secção de itens com os dados carregados
    renderOpportunityItemsSection(canEdit);
}

// --- NOVA FUNÇÃO: Lógica de seleção Cliente/Contato (extraída) ---
function setupClientContactSelectionLogic(formElement) {
    const clienteSelect = formElement.querySelector('select[name="cliente_id"]');
    const contactSelect = formElement.querySelector('select[name="contato_id"]');

    if (!clienteSelect || !contactSelect) return;

    clienteSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        contactSelect.innerHTML = '<option value="">Selecione...</option>'; // Limpa contatos
        contactSelect.disabled = true;

        if (selectedValue.startsWith('pf-')) {
            // Cliente PF selecionado
        } else if (selectedValue) {
            // Organização selecionada
            const orgId = selectedValue;
            const contacts = appState.contacts.filter(c => c.organizacao_id == orgId)
                .sort((a, b) => (a.nome || '').localeCompare(b.nome || '')); // Ordena contatos

            if (contacts.length > 0) {
                contactSelect.innerHTML += contacts.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
                contactSelect.disabled = false;
            } else {
                contactSelect.innerHTML = '<option value="">Nenhum contato nesta organização</option>';
            }
        }
    });
}

// --- NOVA FUNÇÃO: Renderiza a secção de itens da oportunidade (Adaptada de proposals.js) ---
function renderOpportunityItemsSection(canEdit = true) {
    const container = document.getElementById('opportunity-items-section');
    if (!container) return;

    const isDisabled = !canEdit ? 'disabled' : '';
    let totalOportunidade = 0;

    const itemsHtml = currentOpportunityItems.map((item, index) => {
        // --- INÍCIO: Lógica de Cálculo de Valor (CORRIGIDA) ---
        // Garante que o valor unitário é um número
        const valor_unitario_base = parseCurrency(item.valor_unitario);
        let valor_parametros = 0;

        if (item.parametros && Array.isArray(item.parametros)) {
            item.parametros.forEach(param => {
                // Garante que o valor do parâmetro é um número
                valor_parametros += (param.valor || 0);
            });
        }

        const valor_unitario_total = valor_unitario_base + valor_parametros;
        const isLocacao = (item.status || '').toUpperCase() === 'LOCAÇÃO';
        const meses = (isLocacao && item.meses_locacao) ? parseInt(item.meses_locacao) : 1;
        const multiplicador = isLocacao ? meses : 1;
        const itemTotal = (item.quantidade || 0) * valor_unitario_total * multiplicador;
        totalOportunidade += itemTotal;
        const imageUrl = item.imagem_url || 'https://placehold.co/100x100/e2e8f0/64748b?text=Imagem';
        // --- FIM: Lógica de Cálculo de Valor ---

        // --- INÍCIO: Renderização dos Parâmetros ---
        let paramsHtml = '';
        if (item.parametros && Array.isArray(item.parametros) && item.parametros.length > 0) {
            paramsHtml = '<div class="mt-2 space-y-1">';
            paramsHtml += item.parametros.map((param, pIndex) => `
                 <div class="flex items-center justify-between text-xs bg-gray-200 px-2 py-0.5 rounded">
                     <span class="font-medium text-gray-800">${param.nome}: ${formatCurrency(param.valor)}</span>
                     ${canEdit ? `<button type="button" class="remove-opp-parameter-btn text-red-500 hover:text-red-700 font-bold" data-item-index="${index}" data-param-index="${pIndex}">&times;</button>` : ''}
                 </div>
             `).join('');
            paramsHtml += '</div>';
        } else {
            paramsHtml = '<p class="text-xs text-gray-500 italic mt-2">Nenhum parâmetro adicional.</p>';
        }
        // --- FIM: Renderização dos Parâmetros ---

        return `
            <div class="border p-4 rounded-md mb-4 bg-gray-50 relative item-card">
                ${canEdit && currentOpportunityItems.length > 1 ? `
                <button type="button" class="remove-opportunity-item-btn absolute top-2 right-2 action-btn text-red-500 hover:text-red-700 text-xl leading-none" data-index="${index}" title="Remover Item">&times;</button>
                ` : ''}
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label class="form-label">Descrição*</label><input type="text" data-index="${index}" name="item_descricao" required class="form-input" value="${item.descricao || ''}" ${isDisabled}></div>
                        <div><label class="form-label">Fabricante</label><input type="text" data-index="${index}" name="item_fabricante" class="form-input" value="${item.fabricante || ''}" ${isDisabled}></div>
                        <div><label class="form-label">Modelo</label><input type="text" data-index="${index}" name="item_modelo" class="form-input" value="${item.modelo || ''}" ${isDisabled}></div>
                        <div>
                            <label class="form-label">Status</label>
                            <div class="flex gap-2">
                                <select data-index="${index}" name="item_status" class="form-input w-full" ${isDisabled}>
                                    <option value="VENDA" ${item.status === 'VENDA' ? 'selected' : ''}>Venda</option>
                                    <option value="LOCAÇÃO" ${item.status === 'LOCAÇÃO' ? 'selected' : ''}>Locação</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="text-center">
                        <label class="form-label">Imagem</label>
                        <img id="opp-item-image-preview-${index}" src="${imageUrl}" class="w-24 h-24 object-cover mx-auto rounded border mb-2" onerror="this.onerror=null;this.src='https://placehold.co/100x100/e2e8f0/64748b?text=Erro'">
                        <input type="file" class="hidden opp-item-image-upload" id="opp-item-image-upload-${index}" data-index="${index}" accept="image/*" ${isDisabled}>
                        ${canEdit ? `<label for="opp-item-image-upload-${index}" class="btn btn-secondary btn-sm cursor-pointer w-full text-xs">Escolher</label>` : ''}
                    </div>
                </div>
                 <div class="mt-2"><label class="form-label">Descrição Detalhada</label><textarea data-index="${index}" name="item_descricao_detalhada" rows="3" class="form-input" ${isDisabled}>${item.descricao_detalhada || ''}</textarea></div>
                 
                 <!-- --- Início: Seção de Parâmetros --- -->
                 <div class="mt-4 pt-4 border-t">
                     <label class="form-label font-semibold text-sm">Parâmetros Adicionais</label>
                     ${paramsHtml}
                     ${canEdit ? `
                     <div class="flex items-end gap-2 mt-2">
                         <div class="flex-grow">
                             <label class="form-label text-xs">Nome do Parâmetro</label>
                             <input type="text" id="opp-param-nome-${index}" class="form-input form-input-sm" placeholder="Ex: DC">
                         </div>
                         <div class="flex-grow">
                             <label class="form-label text-xs">Valor do Parâmetro</label>
                             <input type="text" inputmode="decimal" id="opp-param-valor-${index}" class="form-input form-input-sm" placeholder="Ex: R$ 4.264,00">
                         </div>
                         <button type="button" class="btn btn-secondary btn-sm add-opp-parameter-btn" data-index="${index}">Adicionar</button>
                     </div>` : ''}
                 </div>
                 <!-- --- Fim: Seção de Parâmetros --- -->
 
                 <div class="grid grid-cols-1 md:grid-cols-${isLocacao ? '5' : '4'} gap-4 mt-4 pt-4 border-t">
                    <div><label class="form-label">Quantidade*</label><input type="number" data-index="${index}" name="item_quantidade" required class="form-input" value="${item.quantidade || 1}" min="1" ${isDisabled}></div>
                    <div><label class="form-label">Valor Unitário*</label><input type="text" inputmode="decimal" data-index="${index}" name="item_valor_unitario" required class="form-input" value="${formatCurrencyForInput(item.valor_unitario)}" placeholder="0,00" ${isDisabled}></div>
                    ${isLocacao ? `
                    <div><label class="form-label">Meses Locação</label><input type="number" data-index="${index}" name="item_meses_locacao" class="form-input" value="${item.meses_locacao || 1}" min="1" ${isDisabled}></div>
                    ` : ''}
                    <div><label class="form-label">Unidade de Medida</label><input type="text" data-index="${index}" name="item_unidade_medida" class="form-input" value="${item.unidade_medida || 'Unidade'}" ${isDisabled}></div>
                    <div><label class="form-label">Subtotal</label><input type="text" class="form-input bg-gray-100 font-bold" value="${formatCurrency(itemTotal)}" readonly></div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
         <h3 class="text-lg font-semibold text-gray-700 mb-2">Itens da Oportunidade</h3>
         
         ${canEdit ? `
         <!-- --- Início: Busca Catálogo (Embutido) --- -->
         <div id="opp-catalog-search-area" class="mb-4 p-4 border rounded-md bg-gray-50 hidden">
             <label class="form-label">Buscar Produto no Catálogo</label>
             <input type="text" id="opp-catalog-search-input" placeholder="Digite o nome do produto..." class="form-input w-full">
             <div id="opp-catalog-results-container" class="mt-2 max-h-48 overflow-y-auto border rounded-md bg-white"></div>
         </div>
         <!-- --- Fim: Busca Catálogo --- -->
         ` : ''}
 
         <div id="opportunity-items-list">${itemsHtml || '<p class="text-center text-gray-500 py-4">Nenhum item adicionado.</p>'}</div>
         
         <div class="flex justify-between items-center mt-4">
            ${canEdit ? `
            <div>
                <button type="button" id="toggle-opp-catalog-btn" class="btn btn-secondary"><i class="fas fa-book-open mr-2"></i>Do Catálogo</button>
                <button type="button" id="add-manual-opp-item-btn" class="btn btn-secondary"><i class="fas fa-plus mr-2"></i>Manual</button>
            </div>
            ` : '<div></div>'}
            <div class="text-xl font-bold">Total Oportunidade: <span id="opportunity-total">${formatCurrency(totalOportunidade)}</span></div>
        </div>
    `;

    // Adiciona Listeners...
    if (canEdit) {
        addOpportunityItemListeners();
    }
}

// --- NOVA FUNÇÃO: Agrupa listeners para itens da oportunidade ---
function addOpportunityItemListeners() {
    // Botão Adicionar Manualmente
    document.getElementById('add-manual-opp-item-btn')?.addEventListener('click', () => {
        currentOpportunityItems.push({
            id: `temp_${Date.now()}`,
            descricao: '', fabricante: '', modelo: '', quantidade: 1, valor_unitario: 0,
            status: 'VENDA', imagem_url: '', unidade_medida: 'Unidade', descricao_detalhada: '',
            parametros: []
        });
        renderOpportunityItemsSection(true); // Re-renderiza com edição habilitada
    });

    // Botão Toggle Catálogo
    document.getElementById('toggle-opp-catalog-btn')?.addEventListener('click', (e) => {
        const searchArea = document.getElementById('opp-catalog-search-area');
        searchArea.classList.toggle('hidden');
        if (!searchArea.classList.contains('hidden')) {
            document.getElementById('opp-catalog-search-input').focus();
            renderOppCatalogResults(''); // Renderiza lista inicial
        }
    });

    // Input de Busca do Catálogo
    document.getElementById('opp-catalog-search-input')?.addEventListener('input', (e) => {
        renderOppCatalogResults(e.target.value);
    });

    // Botões Remover Item
    document.querySelectorAll('.remove-opportunity-item-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const index = parseInt(e.currentTarget.dataset.index, 10);
            if (currentOpportunityItems.length > 1) {
                currentOpportunityItems.splice(index, 1);
                renderOpportunityItemsSection(true);
            } else {
                showToast("É necessário pelo menos um item.", "info");
            }
        });
    });

    // Upload de Imagem
    document.querySelectorAll('.opp-item-image-upload').forEach(input => {
        input.addEventListener('change', handleOpportunityItemImageUpload);
    });

    // Inputs dos Itens
    document.querySelectorAll('#opportunity-items-section input, #opportunity-items-section textarea, #opportunity-items-section select').forEach(input => {
        // Adiciona ou substitui listeners para evitar duplicação
        const listener = (event) => handleOpportunityItemInputChange(event);
        input.removeEventListener('input', listener); // Remove listener antigo se houver
        input.addEventListener('input', listener); // Adiciona novo listener

        if (input.name === 'item_valor_unitario' || input.id.startsWith('opp-param-valor-')) {
            const blurListener = (event) => handleOpportunityValueBlur(event);
            input.removeEventListener('blur', blurListener);
            input.addEventListener('blur', blurListener);
        }
    });

    // --- Listeners de Parâmetros ---
    document.querySelectorAll('.add-opp-parameter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.index;
            const nomeInput = document.getElementById(`opp-param-nome-${index}`);
            const valorInput = document.getElementById(`opp-param-valor-${index}`);

            if (nomeInput && valorInput && nomeInput.value && valorInput.value) {

                const valorNumerico = parseCurrency(valorInput.value);
                if (!currentOpportunityItems[index].parametros) {
                    currentOpportunityItems[index].parametros = [];
                }
                currentOpportunityItems[index].parametros.push({
                    nome: nomeInput.value,
                    valor: valorNumerico // Salva como NÚMERO
                });
                nomeInput.value = '';
                valorInput.value = '';
                renderOpportunityItemsSection(true); // Re-renderiza
            } else {
                showToast('Preencha o nome e o valor do parâmetro.', 'error');
            }
        });
    });

    document.querySelectorAll('.remove-opp-parameter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemIndex = e.currentTarget.dataset.itemIndex;
            const paramIndex = e.currentTarget.dataset.paramIndex;
            currentOpportunityItems[itemIndex].parametros.splice(paramIndex, 1);
            renderOpportunityItemsSection(true); // Re-renderiza
        });
    });
}

// --- NOVA FUNÇÃO: Renderiza resultados da busca do catálogo (EMBUTIDO NA OPORTUNIDADE) ---
function renderOppCatalogResults(searchTerm) {
    const container = document.getElementById('opp-catalog-results-container');
    if (!container) return;

    const { products } = appState;
    const lowerSearchTerm = searchTerm.toLowerCase();

    const filtered = (products || []).filter(p =>
        (p.nome_produto || '').toLowerCase().includes(lowerSearchTerm) ||
        (p.fabricante || '').toLowerCase().includes(lowerSearchTerm)
    ).sort((a, b) => (a.nome_produto || '').localeCompare(b.nome_produto || ''));

    container.innerHTML = filtered.map(p => `
         <div class="p-2 border-b last:border-b-0 hover:bg-indigo-100 flex justify-between items-center cursor-pointer opp-catalog-select-item" data-product-id="${p.id}">
             <div>
                 <p class="font-semibold text-sm">${p.nome_produto}</p>
                 <p class="text-xs text-gray-600">${p.fabricante || 'N/A'}</p>
                 <p class="text-xs text-gray-500">${formatCurrency(p.valor_unitario)}</p>
             </div>
             <img src="${p.imagem_url || 'https://placehold.co/40x40/e2e8f0/64748b?text=Img'}" class="w-10 h-10 object-cover rounded" onerror="this.onerror=null;this.src='https://placehold.co/40x40/e2e8f0/64748b?text=Erro'">
         </div>
     `).join('') || '<p class="p-4 text-center text-gray-500 text-sm">Nenhum produto encontrado.</p>';

    // Adiciona listeners aos itens clicáveis
    container.querySelectorAll('.opp-catalog-select-item').forEach(item => {
        item.addEventListener('click', e => {
            const productId = e.currentTarget.dataset.productId;
            const product = appState.products.find(p => p.id == productId);
            if (product) {
                // Adiciona o item do catálogo à lista
                currentOpportunityItems.push({
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
                renderOpportunityItemsSection(true); // Re-renderiza a seção de itens
                // Esconde a busca
                document.getElementById('opp-catalog-search-area').classList.add('hidden');
                document.getElementById('opp-catalog-search-input').value = '';
            }
        });
    });
}


// --- Funções Auxiliares para Itens da Oportunidade (Adaptadas de proposals.js) ---

// Handler para mudança nos inputs dos itens da OPORTUNIDADE
function handleOpportunityItemInputChange(e) {
    const index = e.target.dataset.index;
    if (!currentOpportunityItems[index]) return; // Segurança

    const prop = e.target.name.replace('item_', ''); // descricao, fabricante, etc.
    let value = e.target.value;

    if (prop === 'valor_unitario') {
        e.target.value = value.replace(/[^0-9,]/g, '');
        return; // Não atualiza estado, só no blur
    }

    currentOpportunityItems[index][prop] = (prop === 'quantidade') ? parseInt(value) || 0 : value;

    if (prop === 'status' || prop === 'quantidade' || prop === 'meses_locacao') {
        if (prop === 'status') {
            currentOpportunityItems[index].unidade_medida = value === 'LOCAÇÃO' ? 'Mês' : 'Unidade';
            if (value === 'LOCAÇÃO' && !currentOpportunityItems[index].meses_locacao) {
                currentOpportunityItems[index].meses_locacao = 1; // Default
            }
        }
        renderOpportunityItemsSection(true); // Re-renderiza para atualizar totais
    }
}

// Handler para quando o campo de valor unitário ou parâmetro perde o foco na OPORTUNIDADE
function handleOpportunityValueBlur(e) {
    const index = e.target.dataset.index;

    if (e.target.name === 'item_valor_unitario') {
        if (!currentOpportunityItems[index]) return;
        const value = parseCurrency(e.target.value);
        currentOpportunityItems[index].valor_unitario = value;
        e.target.value = formatCurrencyForInput(value);

        // *** CORREÇÃO: A re-renderização foi movida para DENTRO deste 'if' ***
        // Isso garante que o subtotal e o total sejam atualizados.
        renderOpportunityItemsSection(true);
    }
    // Formata o valor do parâmetro (apenas se for o input de parâmetro)
    else if (e.target.id.startsWith('opp-param-valor-')) {
        const valorNumerico = parseCurrency(e.target.value);
        e.target.value = formatCurrencyForInput(valorNumerico);

        // *** CORREÇÃO: A re-renderização foi REMOVIDA daqui ***
        // Isso impede que os campos de "Nome" e "Valor" do parâmetro sejam limpos
        // antes que o botão "Adicionar" possa lê-los.
    }
}

// Handler para upload de imagem de item da OPORTUNIDADE
async function handleOpportunityItemImageUpload(e) {
    const index = e.currentTarget.dataset.index;
    if (!currentOpportunityItems[index]) return;

    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); // Usa a chave 'image' que o handler de proposta espera
    showToast('Enviando imagem...', 'info');

    try {
        // Reutiliza o endpoint de upload de imagem da proposta
        const result = await apiCall('upload_image', { method: 'POST', body: formData });
        currentOpportunityItems[index].imagem_url = result.url; // Atualiza URL no estado temporário
        showToast('Imagem enviada com sucesso!');
        const imgPreview = document.getElementById(`opp-item-image-preview-${index}`);
        if (imgPreview) imgPreview.src = result.url;
    } catch (error) {
        const imgPreview = document.getElementById(`opp-item-image-preview-${index}`);
        if (imgPreview) imgPreview.src = 'https://placehold.co/80x80/e2e8f0/64748b?text=Erro'; // Mostra erro no preview
    }
}


// --- NOVA FUNÇÃO: Handler para submit do formulário de Oportunidade ---
async function handleOpportunityFormSubmit(form) {
    if (!form) {
        console.warn("Formulário nulo no submit, fechando modal.");
        closeModal();
        return;
    }
    if (!form.reportValidity()) return; // Validação HTML5

    const formData = new FormData(form);
    const data = {};
    // Modificado para incluir novos campos de Licitação
    ['id', 'titulo', 'cliente_id', 'contato_id', 'comercial_user_id', 'notas', 'numero_edital', 'numero_processo', 'modalidade', 'local_disputa', 'uasg', 'objeto', 'data_abertura', 'hora_disputa', 'etapa_id'].forEach(key => {
        data[key] = formData.get(key) || null;
    });

    // Adiciona os itens ao objeto de dados
    if (!currentOpportunityItems || currentOpportunityItems.length === 0) {
        showToast('É necessário adicionar pelo menos um item à oportunidade.', 'error');
        return;
    }

    // Limpa IDs temporários e formata valores
    data.items = currentOpportunityItems.map(item => {
        const newItem = { ...item };
        // Remove IDs temporários do frontend
        if (String(newItem.id).startsWith('temp_') || String(newItem.id).startsWith('fallback_') || String(newItem.id).startsWith('api_')) {
            delete newItem.id;
        }
        // Converte valores para número
        newItem.valor_unitario = parseCurrency(newItem.valor_unitario);

        // Garante que parâmetros são array e formata o valor
        if (newItem.parametros && Array.isArray(newItem.parametros)) {
            newItem.parametros = newItem.parametros.map(param => ({
                nome: param.nome,
                valor: parseCurrency(param.valor) // Salva o valor como número
            }));
        } else {
            newItem.parametros = [];
        }
        return newItem;
    });

    // --- Lógica de Cliente (Unificada) ---
    let clienteSelecionado = data['cliente_id'];

    // Se estiver na aba Licitações, usa os campos específicos
    if (appState.funilView && appState.funilView.activeTab === 'licitacoes') {
        const clienteLicitacao = formData.get('cliente_licitacao_id');
        if (clienteLicitacao) clienteSelecionado = clienteLicitacao;

        const tituloLicitacao = formData.get('titulo_licitacao');
        if (tituloLicitacao) data.titulo = tituloLicitacao;
    }

    delete data['cliente_id']; // Remove a chave combinada original
    delete data['cliente_licitacao_id']; // Remove a chave de licitação se existir

    // --- NOVA VALIDAÇÃO MANUAL (já que removemos o required do HTML) ---
    if (!data.titulo || data.titulo.trim() === '') {
        showToast('O campo Título é obrigatório.', 'error');
        return;
    }

    if (clienteSelecionado && clienteSelecionado.startsWith('pf-')) {
        data.cliente_pf_id = clienteSelecionado.substring(3);
        data.organizacao_id = null;
        data.contato_id = null;
    } else if (clienteSelecionado) {
        data.organizacao_id = clienteSelecionado;
        data.cliente_pf_id = null;
        // Mantém o contato_id selecionado (se houver no form padrão, no licitação não tem contato por enquanto)
    } else {
        data.organizacao_id = null;
        data.cliente_pf_id = null;
        data.contato_id = null;
    }

    if (data.comercial_user_id === '') {
        data.comercial_user_id = null;
    }

    const action = data.id ? 'update_opportunity' : 'create_opportunity';
    const successMessage = data.id ? 'Oportunidade atualizada!' : 'Oportunidade criada!';

    try {
        const result = await apiCall(action, { method: 'POST', body: JSON.stringify(data) });
        const savedOpportunity = result.opportunity;

        // Atualiza o estado da aplicação
        if (data.id) { // Editando
            const index = appState.opportunities.findIndex(o => o.id == savedOpportunity.id);
            if (index !== -1) {
                appState.opportunities[index] = {
                    ...appState.opportunities[index], // Mantém dados antigos
                    ...savedOpportunity, // Sobrescreve com dados da API
                };
            } else {
                appState.opportunities.push(savedOpportunity); // Adiciona se não encontrou
            }
            // Atualiza pré-propostas se este ID estiver lá
            const preIndex = appState.pre_proposals.findIndex(p => p.id == savedOpportunity.id);
            if (preIndex !== -1) {
                appState.pre_proposals[preIndex] = { ...appState.pre_proposals[preIndex], ...savedOpportunity };
                if (appState.activeView === 'proposals') {
                    const { renderProposalsView } = await import('./proposals.js');
                    renderProposalsView();
                }
            }

        } else { // Criando
            appState.opportunities.push(savedOpportunity);
            if (savedOpportunity.comercial_user_id && savedOpportunity.pre_proposal_number && appState.currentUser.permissions.canEdit) {
                appState.pre_proposals.push(savedOpportunity);
                if (appState.activeView === 'proposals') {
                    const { renderProposalsView } = await import('./proposals.js');
                    renderProposalsView();
                }
            }
        }

        // *** CORREÇÃO DO BUG: Mover a limpeza do estado para DEPOIS do sucesso ***
        closeModal();
        showToast(successMessage);
        currentOpportunityItems = [];
        currentOpportunityId = null;
        // *** FIM DA CORREÇÃO ***

        renderKanbanBoard(); // Re-renderiza o quadro Kanban

    } catch (error) {
        console.error("Erro ao salvar oportunidade:", error);
        // Não limpa os itens se der erro, permitindo nova tentativa
    }
}

// --- FIM: Modal Criar/Editar Oportunidade ---


// Funções de Fornecedores
function openVendaFornecedorModal(vendaData) {
    const isEditing = !!vendaData;
    const data = vendaData || {};
    const title = isEditing ? 'Editar Venda Fornecedor' : 'Cadastrar Venda';
    const { permissions } = appState.currentUser;

    const fornecedorOptions = appState.fornecedores.map(f => `<option value="${f.id}" ${data.fornecedor_id == f.id ? 'selected' : ''}>${f.nome}</option>`).join('');
    const orgOptions = appState.organizations
        .sort((a, b) => (a.nome_fantasia || '').localeCompare(b.nome_fantasia || ''))
        .map(o => `<option value="${o.id}">${o.nome_fantasia}</option>`).join('');
    const pfOptions = appState.clients_pf
        .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''))
        .map(pf => `<option value="pf-${pf.id}">${pf.nome} (PF)</option>`).join('');

    const deleteButtonHtml = isEditing && permissions.canDelete
        ? `<div class="mt-6 pt-4 border-t border-gray-200">
              <button type="button" id="delete-venda-btn" class="btn btn-danger w-full sm:w-auto">Excluir Venda</button>
            </div>`
        : '';

    const content = `
         <form id="modal-form" class="space-y-4">
              <input type="hidden" name="id" value="${data.id || ''}">
              <div><label class="form-label">Data*</label><input type="date" name="data_venda" required value="${data.data_venda || new Date().toISOString().split('T')[0]}" class="form-input"></div>
              <div><label class="form-label">Título*</label><input type="text" name="titulo" required value="${data.titulo || ''}" class="form-input"></div>
              <div><label class="form-label">Fornecedor*</label><select name="fornecedor_id" required class="form-input"><option value="">Selecione...</option>${fornecedorOptions}</select></div>
              
              <!-- *** ALTERAÇÃO: Select combinado para Cliente *** -->
              <div>
                  <label class="form-label">Cliente (Opcional)</label>
                  <select name="cliente_id" class="form-input">
                       <option value="">Nenhum</option>
                       <optgroup label="Organizações">
                           ${orgOptions}
                       </optgroup>
                       <optgroup label="Clientes PF">
                           ${pfOptions}
                       </optgroup>
                  </select>
              </div>
              <!-- *** FIM DA ALTERAÇÃO *** -->
 
              <div><label class="form-label">Origem</label><input type="text" name="origem" value="${data.origem || ''}" class="form-input"></div>
              <div><label class="form-label">Descrição</label><textarea name="descricao_produto" rows="3" class="form-input">${data.descricao_produto || ''}</textarea></div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label class="form-label">Fabricante/Marca</label><input type="text" name="fabricante_marca" value="${data.fabricante_marca || ''}" class="form-input"></div>
                  <div><label class="form-label">Modelo</label><input type="text" name="modelo" value="${data.modelo || ''}" class="form-input"></div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label class="form-label">Quantidade</label><input type="number" name="quantidade" value="${data.quantidade || 1}" class="form-input"></div>
                  <div><label class="form-label">Valor Unitário (R$)</label><input type="text" inputmode="decimal" name="valor_unitario" value="${formatCurrencyForInput(data.valor_unitario)}" class="form-input"></div>
              </div>
              <div><label class="form-label">Valor Total (R$)</label><input type="text" name="valor_total" value="${formatCurrencyForInput(data.valor_total)}" readonly class="form-input bg-gray-100 font-bold"></div>
              <div><label class="form-label">Notas</label><textarea name="notas" rows="3" class="form-input">${data.notas || ''}</textarea></div>
              ${deleteButtonHtml}
         </form>
     `;

    renderModal(title, content, async (form) => {
        const formData = new FormData(form);
        const submissionData = Object.fromEntries(formData.entries());
        submissionData.valor_unitario = parseCurrency(submissionData.valor_unitario);
        submissionData.valor_total = parseCurrency(submissionData.valor_total);

        // *** ALTERAÇÃO: Lógica de Cliente ***
        const clienteSelecionado = submissionData['cliente_id'];
        delete submissionData['cliente_id'];
        if (clienteSelecionado && clienteSelecionado.startsWith('pf-')) {
            submissionData.cliente_pf_id = clienteSelecionado.substring(3);
            submissionData.organizacao_id = null;
        } else if (clienteSelecionado) {
            submissionData.organizacao_id = clienteSelecionado;
            submissionData.cliente_pf_id = null;
        } else {
            submissionData.organizacao_id = null;
            submissionData.cliente_pf_id = null;
        }
        // *** FIM DA ALTERAÇÃO ***

        const endpoint = isEditing ? 'update_venda_fornecedor' : 'create_venda_fornecedor';
        const successMessage = isEditing ? 'Venda atualizada!' : 'Venda cadastrada!';

        try {
            const result = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(submissionData) });
            const savedVenda = result.venda_fornecedor; // Pega o objeto retornado

            if (isEditing) {
                const index = appState.vendasFornecedores.findIndex(v => v.id == savedVenda.id);
                if (index !== -1) appState.vendasFornecedores[index] = savedVenda; // Atualiza no estado
            } else {
                appState.vendasFornecedores.push(savedVenda); // Adiciona no estado
            }

            showToast(successMessage);
            renderFornecedoresView(); // Re-renderiza a view de fornecedores
            closeModal();
        } catch (error) { }
    }, 'Salvar');

    const form = document.getElementById('modal-form');

    // *** ALTERAÇÃO: Pré-seleciona o cliente correto no select combinado ***
    const clienteSelect = form.querySelector('select[name="cliente_id"]');
    if (isEditing) {
        if (data.cliente_pf_id) {
            clienteSelect.value = `pf-${data.cliente_pf_id}`;
        } else if (data.organizacao_id) {
            clienteSelect.value = data.organizacao_id;
        }
    }
    // *** FIM DA ALTERAÇÃO ***


    const deleteBtn = document.getElementById('delete-venda-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            Swal.fire({
                title: 'Tem certeza?',
                text: `Você tem certeza que deseja apagar a venda "${data.titulo}"!`,
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
                        await apiCall('delete_venda_fornecedor', { method: 'POST', body: JSON.stringify({ id: data.id }) });
                        appState.vendasFornecedores = appState.vendasFornecedores.filter(v => v.id != data.id);
                        Swal.fire(
                            'Excluído!',
                            'Venda excluída com sucesso.',
                            'success'
                        );
                        renderFornecedoresView();
                        closeModal();
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Erro!', 'Ocorreu um erro ao excluir a venda.', 'error');
                    }
                }
            });
        });
    }

    const qtyInput = form.querySelector('input[name="quantidade"]');
    const unitValueInput = form.querySelector('input[name="valor_unitario"]');
    const totalValueInput = form.querySelector('input[name="valor_total"]');

    function calculateTotal() {
        const qty = parseInt(qtyInput.value) || 0;
        const unitValue = parseCurrency(unitValueInput.value);
        totalValueInput.value = formatCurrencyForInput(qty * unitValue);
    }

    qtyInput.addEventListener('input', calculateTotal);
    unitValueInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9,]/g, '');
        calculateTotal();
    });
    unitValueInput.addEventListener('blur', e => {
        e.target.value = formatCurrencyForInput(parseCurrency(e.target.value));
    });
    calculateTotal(); // Calcula valor inicial
}