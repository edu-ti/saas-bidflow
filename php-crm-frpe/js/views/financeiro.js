// js/views/financeiro.js

import { appState } from '../state.js';
import { renderFunilView } from './kanban.js'; // Reusing kanban logic where possible
import { formatCurrency, calculateTimeInStage, showToast, formatCurrencyForInput, parseCurrency, showLoading } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';
import { apiCall } from '../api.js';

let financeiroMonth = new Date().getMonth() + 1;
let financeiroYear = new Date().getFullYear();
let financeiroSearchText = '';
let financeiroSelectedOppId = null;

const MONTH_NAMES = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];

export function renderFinanceiroView() {
    const container = document.getElementById('financeiro-view');
    if (!container) return;

    // As of now, we will reuse the exact same Kanban board structure.
    // To do this well without breaking existing kanban, we temporarily set the activeTab to a new state and call a custom wrapper
    // or we duplicate the minimal kanban render logic specifically for ID = 3 (Contratos).

    // For a cleaner architecture that matches index.php and kanban.js reliance on appState.funilView.activeTab
    // We will initialize a specific container similar to funil-view.
    container.classList.add('flex', 'flex-col', 'h-full');

    container.innerHTML = `
         <div class="flex justify-between items-start sm:items-center mb-3 gap-2 flex-shrink-0 responsive-stack">
             <div class="flex items-center space-x-1 overflow-x-auto pb-1 max-w-full">
                 <button class="funil-tab-btn flex-shrink-0 active" disabled style="cursor: default;">Funil Financeiro (Contratos)</button>
             </div>
             
             <!-- Filtro de Data Central -->
             <div class="flex items-center gap-2 bg-white rounded-md shadow-sm border px-2 py-1">
                 <button id="fin-prev-month" class="p-1 hover:bg-gray-100 rounded text-gray-500"><i class="fas fa-chevron-left text-xs"></i></button>
                 <span id="fin-month-display" class="text-xs font-bold text-white bg-[#004080] px-2 py-0.5 rounded uppercase w-24 text-center">MÊS</span>
                 <button id="fin-next-month" class="p-1 hover:bg-gray-100 rounded text-gray-500"><i class="fas fa-chevron-right text-xs"></i></button>
                 
                 <div class="w-px h-4 bg-gray-300 mx-1"></div>
                 
                 <button id="fin-prev-year" class="p-1 hover:bg-gray-100 rounded text-gray-500"><i class="fas fa-chevron-left text-xs"></i></button>
                 <span id="fin-year-display" class="text-xs font-bold text-white bg-[#004080] px-2 py-0.5 rounded w-14 text-center">ANO</span>
                 <button id="fin-next-year" class="p-1 hover:bg-gray-100 rounded text-gray-500"><i class="fas fa-chevron-right text-xs"></i></button>
             </div>

             <div class="flex items-center gap-2">
                  ${appState.currentUser.permissions.canCreateOpportunity ? `
                     <button id="add-financeiro-opportunity-btn" class="btn btn-primary bg-[#002f5c] hover:bg-[#004080]">
                         <i class="fas fa-plus mr-2"></i><span>Novo Contrato</span>
                     </button>
                 ` : ''}
             </div>
         </div>
         <div id="financeiro-content-container" class="kanban-scroll-container">
              <div id="financeiro-inner-container" class="kanban-inner-container">
                  <!-- Colunas renderizadas aqui -->
              </div>
         </div>
    `;

    document.getElementById('add-financeiro-opportunity-btn')?.addEventListener('click', () => {
        openNovoContratoModal();
    });

    // Ligar eventos do seletor de data
    const updateDateDisplay = () => {
        document.getElementById('fin-month-display').innerText = MONTH_NAMES[financeiroMonth - 1];
        document.getElementById('fin-year-display').innerText = financeiroYear;
    };

    document.getElementById('fin-prev-month').addEventListener('click', () => {
        financeiroMonth--; if (financeiroMonth < 1) { financeiroMonth = 12; financeiroYear--; }
        updateDateDisplay(); renderFinanceiroBoard();
    });
    document.getElementById('fin-next-month').addEventListener('click', () => {
        financeiroMonth++; if (financeiroMonth > 12) { financeiroMonth = 1; financeiroYear++; }
        updateDateDisplay(); renderFinanceiroBoard();
    });
    document.getElementById('fin-prev-year').addEventListener('click', () => {
        financeiroYear--; updateDateDisplay(); renderFinanceiroBoard();
    });
    document.getElementById('fin-next-year').addEventListener('click', () => {
        financeiroYear++; updateDateDisplay(); renderFinanceiroBoard();
    });

    updateDateDisplay();
    renderFinanceiroBoard();
}

function renderFinanceiroBoard() {
    const board = document.getElementById('financeiro-inner-container');
    if (!board) return;
    board.innerHTML = '';

    if (!appState.stages || appState.stages.length === 0) {
        board.innerHTML = `<div class="p-8 text-center w-full"><p class="text-red-500">Erro: Etapas do funil não carregadas.</p></div>`;
        return;
    }

    // Determine the Funnel ID for "Contratos" (Needs to match DB. Often 3 if Vendas=1 and Licitacoes=2)
    // To be safe, let's find it dynamically if possible, otherwise hardcode or check stages.
    // Often we don't load 'funis' into state, only 'stages' with 'funil_id'.
    // Let's find the stages that belong to funil_id > 2 or specifically look for names.
    // But since the SQL just adds it, we assume the highest funil_id or specific names.

    // Tenta encontrar as etapas do funil de Contratos pelo funil_id mais alto (recém-criado)
    const financeiroStageNames = ['Clientes', 'Aguardando Faturamento', 'Faturado'];

    // Agrupa por funil_id para evitar duplicatas de outros funis
    let maxFunilId = 0;
    appState.stages.forEach(s => {
        if (financeiroStageNames.includes(s.nome) && s.funil_id > maxFunilId) {
            maxFunilId = s.funil_id;
        }
    });

    let financeiroStages = appState.stages.filter(s => s.funil_id == maxFunilId && financeiroStageNames.includes(s.nome));

    financeiroStages = financeiroStages.sort((a, b) => a.ordem - b.ordem);

    if (financeiroStages.length === 0) {
        board.innerHTML = `<div class="p-8 text-center w-full"><p class="text-gray-500">Nenhuma etapa encontrada para o funil Financeiro. Verifique se o banco de dados foi atualizado.</p></div>`;
        return;
    }

    // --- PRÉ-CÁLCULO: Empenhos e Notas do mês (para usar em ambas as colunas) ---
    let empenhosInMonth = (appState.empenhos || []).filter(emp => {
        let dateStr = emp.data_prevista || emp.data_emissao;
        if (!dateStr) return false;
        let eMonth, eYear;
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            eYear = parseInt(parts[0], 10);
            eMonth = parseInt(parts[1], 10);
        } else {
            const date = new Date(dateStr);
            eYear = date.getFullYear();
            eMonth = date.getMonth() + 1;
        }
        return (eMonth === financeiroMonth && eYear === financeiroYear);
    });

    let nfsInMonth = (appState.notas_fiscais || []).filter(nf => {
        let dateStr = nf.data_prevista || nf.data_faturamento;
        if (!dateStr) return false;
        let nMonth, nYear;
        if (dateStr.includes('-')) {
            const parts = dateStr.split('-');
            nYear = parseInt(parts[0], 10);
            nMonth = parseInt(parts[1], 10);
        } else {
            const date = new Date(dateStr);
            nYear = date.getFullYear();
            nMonth = date.getMonth() + 1;
        }
        return (nMonth === financeiroMonth && nYear === financeiroYear);
    });

    // Filtrar por contrato selecionado (se houver)
    let empenhosFiltered = financeiroSelectedOppId ? empenhosInMonth.filter(emp => emp.oportunidade_id == financeiroSelectedOppId) : empenhosInMonth;
    let nfsFiltered = financeiroSelectedOppId ? nfsInMonth.filter(nf => nf.oportunidade_id == financeiroSelectedOppId) : nfsInMonth;

    const totalEmpenhado = empenhosFiltered.reduce((sum, e) => sum + parseFloat(e.valor || 0), 0);
    const totalFaturado = nfsFiltered.reduce((sum, n) => sum + parseFloat(n.valor || 0), 0);
    const faltaFaturar = Math.max(0, totalEmpenhado - totalFaturado);

    financeiroStages.forEach(stage => {
        let itemsHTML = '';
        let stageTotal = 0;
        let columnHeaderExtra = '';
        let columnHeaderValues = '';

        if (stage.nome === 'Clientes') {
            // Coluna de Contratos
            columnHeaderExtra = `
                <div class="mt-2">
                    <div class="relative">
                        <input type="text" id="fin-search-input" class="w-full text-xs border-gray-300 rounded focus:ring-[#002f5c] focus:border-[#002f5c] pl-7 py-1" placeholder="Pesquisar contrato/cliente..." value="${financeiroSearchText}">
                        <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400 text-xs"></i>
                        </div>
                    </div>
                </div>
            `;

            let opportunitiesInStage = appState.opportunities
                .filter(opp => opp.etapa_id == stage.id)
                .sort((a, b) => new Date(b.data_criacao || 0) - new Date(a.data_criacao || 0));

            if (financeiroSearchText) {
                const searchLower = financeiroSearchText.toLowerCase();
                opportunitiesInStage = opportunitiesInStage.filter(opp =>
                    (opp.titulo || '').toLowerCase().includes(searchLower) ||
                    (opp.organizacao_nome || '').toLowerCase().includes(searchLower) ||
                    (opp.numero_contrato || '').toLowerCase().includes(searchLower)
                );
            }

            stageTotal = opportunitiesInStage.reduce((sum, opp) => sum + parseFloat(opp.valor || 0), 0);
            itemsHTML = opportunitiesInStage.map(opp => createContratoCard(opp)).join('') || '<div class="p-4 text-center text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded mt-2">Nenhum contrato encontrado.</div>';

        } else if (stage.nome === 'Aguardando Faturamento') {
            // Coluna de Empenhos — usa dados pré-calculados
            stageTotal = totalEmpenhado;

            columnHeaderValues = `
                <div class="mt-1.5 space-y-1">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-orange-700 uppercase">Valor Empenhado</span>
                        <span class="font-bold text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">${formatCurrency(totalEmpenhado)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-red-600 uppercase">Falta Faturar</span>
                        <span class="font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">${formatCurrency(faltaFaturar)}</span>
                    </div>
                </div>
            `;

            itemsHTML = empenhosFiltered.map(emp => createSubEntityCard(emp, 'Empenho')).join('') || '<div class="p-4 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded mt-2 shadow-sm font-medium">Nenhum empenho/pedido para este mês.</div>';

            // Botão Adicionar
            itemsHTML += `
                <div class="mt-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-3 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-400 transition-colors" onclick="window.openAddEmpenhoModal()">
                    <i class="fas fa-arrow-up text-xl mb-1"></i>
                    <span class="text-[10px] text-center font-medium leading-tight">Adicionar Empenho/Pedido<br>vinculado ao contrato</span>
                </div>
            `;

        } else if (stage.nome === 'Faturado') {
            // Coluna de Notas Fiscais — usa dados pré-calculados
            stageTotal = totalFaturado;

            columnHeaderValues = `
                <div class="mt-1.5 space-y-1">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-green-700 uppercase">Faturado no Mês</span>
                        <span class="font-bold text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">${formatCurrency(totalFaturado)}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-bold text-red-600 uppercase">Falta Faturar</span>
                        <span class="font-bold text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">${formatCurrency(faltaFaturar)}</span>
                    </div>
                </div>
            `;

            itemsHTML = nfsFiltered.map(nf => createSubEntityCard(nf, 'Nota Fiscal')).join('') || '<div class="p-4 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded mt-2 shadow-sm font-medium">Nenhuma nota fiscal para este mês.</div>';

            // Botão Adicionar
            itemsHTML += `
                <div class="mt-3 cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-3 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-400 transition-colors" onclick="window.openAddNotaFiscalModal()">
                    <i class="fas fa-arrow-up text-xl mb-1"></i>
                    <span class="text-[10px] text-center font-medium leading-tight">Adicionar Nota Fiscal faturada<br>vinculada ao empenho/contrato</span>
                </div>
            `;
        }


        const column = document.createElement('div');
        column.className = 'kanban-column flex flex-col financeiro-stage';
        column.dataset.stageId = stage.id;
        column.dataset.stageName = stage.nome;

        column.innerHTML = `
             <div class="kanban-column-header">
                 <div class="flex justify-between items-center">
                     <h3 class="font-semibold text-sm text-[#002f5c]">${stage.nome}</h3>
                     <span class="font-bold text-xs text-gray-800 bg-gray-100 px-2 py-0.5 rounded border">${formatCurrency(stageTotal)}</span>
                 </div>
                 ${columnHeaderValues}
                 ${columnHeaderExtra}
             </div>
             <div class="stage-cards">
                 ${itemsHTML}
             </div>
         `;
        board.appendChild(column);
    });

    // --- ADIÇÃO: Event Listeners para edição dos cards e drag/drop ---
    // Remove listeners antigos se houver para evitar duplicidade (ou usa delegação)
    board.removeEventListener('click', financeiroBoardClickHandler);
    board.addEventListener('click', financeiroBoardClickHandler);

    // Ligar evento de busca
    const searchInput = document.getElementById('fin-search-input');
    if (searchInput) {
        // Para não perder foco, re-focar e ajustar cursor
        searchInput.focus();
        searchInput.setSelectionRange(financeiroSearchText.length, financeiroSearchText.length);

        searchInput.addEventListener('input', (e) => {
            financeiroSearchText = e.target.value;
            renderFinanceiroBoard();
        });
    }
}

// Handler genérico de cliques (delega cliques em cards)
function financeiroBoardClickHandler(e) {
    const card = e.target.closest('.opportunity-card');
    if (!card) return;

    if (card.classList.contains('fin-contrato-card')) {
        const oppId = card.dataset.oppId;
        // Se clicar especificamente no botão de edição, abre o modal de contrato
        if (e.target.closest('.nc-edit-btn')) {
            openNovoContratoModal(oppId);
            return;
        }

        // Se clicar no resto do card, seleciona/deseleciona o contrato para filtro
        if (financeiroSelectedOppId == oppId) {
            financeiroSelectedOppId = null; // deseleciona
        } else {
            financeiroSelectedOppId = oppId;
        }
        renderFinanceiroBoard();
    }
}

function createContratoCard(opp) {
    const clientName = opp.organizacao_nome || opp.cliente_pf_nome || 'Cliente não definido';
    const isSelected = financeiroSelectedOppId == opp.id;
    const borderClass = isSelected ? 'border-2 border-blue-500 shadow-md ring-2 ring-blue-100' : 'border border-gray-200';
    const bgClass = isSelected ? 'bg-blue-50' : 'bg-white';

    return `
         <div class="opportunity-card financeiro-card fin-contrato-card ${borderClass} ${bgClass} rounded-lg p-3 mb-2 cursor-pointer transition-all hover:shadow-md" data-opp-id="${opp.id}">
             <div class="flex justify-between items-start mb-1">
                 <h4 class="font-bold text-gray-800 text-xs">Contrato: ${opp.numero_contrato || opp.titulo}</h4>
                 <button class="nc-edit-btn text-gray-400 hover:text-blue-600 p-1"><i class="fas fa-edit text-[10px]"></i></button>
             </div>
             <p class="text-[9px] text-gray-500 uppercase font-semibold mb-2 line-clamp-1">${clientName}</p>
             <div class="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                 <span class="text-sm font-bold text-[#002f5c]">${formatCurrency(opp.valor)}</span>
                 <span class="text-[10px] font-medium text-gray-400">
                     <i class="far fa-calendar-alt mr-1"></i>${opp.data_criacao ? new Date(opp.data_criacao).toLocaleDateString() : 'N/A'}
                 </span>
             </div>
             ${isSelected ? `<div class="mt-2 text-[9px] text-blue-600 font-bold text-center bg-blue-100 py-0.5 rounded uppercase tracking-wide">Selecionado</div>` : ''}
         </div>
    `;
}

function createSubEntityCard(entity, type) {
    const isNota = type === 'Nota Fiscal';
    const icon = isNota ? 'fa-file-invoice-dollar' : 'fa-file-contract';
    const title = isNota ? 'NF: ' + entity.numero : 'Empenho: ' + entity.numero;
    const dateStr = entity.data_prevista ? new Date(entity.data_prevista).toLocaleDateString() : 'N/A';

    let linkDoc = '';
    if (entity.documento_url) {
        linkDoc = `<a href="${entity.documento_url}" target="_blank" class="text-[9px] text-blue-600 hover:underline inline-block mt-1"><i class="fas fa-paperclip"></i> Ver Anexo</a>`;
    }

    const editFunc = isNota ? `window.openAddNotaFiscalModal(${entity.id})` : `window.openAddEmpenhoModal(${entity.id})`;

    return `
         <div class="bg-white border border-gray-200 shadow-sm rounded-lg p-3 mb-2 hover:border-gray-300 transition-colors relative group cursor-pointer" onclick="${editFunc}">
             <div class="flex items-start gap-2">
                 <div class="${isNota ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'} w-8 h-8 rounded shrink-0 flex items-center justify-center">
                     <i class="fas ${icon}"></i>
                 </div>
                 <div class="flex-1 min-w-0">
                     <h4 class="font-bold text-gray-800 text-xs truncate">${title}</h4>
                     <p class="text-[9px] text-gray-500 truncate mt-0.5">${entity.organizacao_nome || entity.numero_contrato || ''}</p>
                     <div class="mt-1.5 flex justify-between items-end">
                         <span class="text-sm font-bold text-gray-800">${formatCurrency(entity.valor)}</span>
                         <span class="text-[10px] text-gray-400"><i class="far fa-calendar mr-1"></i>${dateStr}</span>
                     </div>
                     ${linkDoc}
                 </div>
             </div>
             <button class="absolute top-2 right-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded shadow-sm border" onclick="event.stopPropagation(); window.deleteSubEntity(${entity.id}, '${type}')"><i class="fas fa-trash-alt text-[10px]"></i></button>
         </div>
    `;
}

// globais locais para o modal
let novoContratoItems = [];
let novoContratoFile = null;
let editingItemIndex = null; // Para edição de item

export async function openNovoContratoModal(oppId = null) {
    novoContratoItems = [];
    novoContratoFile = null;
    editingItemIndex = null;

    let oppToEdit = null;

    if (oppId) {
        try {
            showLoading(true);
            const result = await apiCall('get_opportunity_details', { params: { id: oppId } });
            oppToEdit = result.opportunity;
            if (oppToEdit && oppToEdit.items) {
                // Clonar os itens e extrair lote e item dos parametros
                novoContratoItems = oppToEdit.items.map(dbItem => {
                    let loteVal = '';
                    let itemVal = '';
                    let cleanParams = [];

                    if (dbItem.parametros) {
                        try {
                            const params = typeof dbItem.parametros === 'string' ? JSON.parse(dbItem.parametros) : dbItem.parametros;
                            if (Array.isArray(params)) {
                                params.forEach(p => {
                                    if (p.nome === 'Lote') loteVal = p.valor;
                                    else if (p.nome === 'Item_Num') itemVal = p.valor;
                                    else cleanParams.push(p);
                                });
                            }
                        } catch (e) { console.error(e); }
                    }

                    return {
                        ...dbItem,
                        lote: loteVal,
                        item: itemVal,
                        parametros: cleanParams
                    };
                });
            }
        } catch (e) {
            console.error(e);
            showToast("Erro ao carregar contrato.", "error");
            showLoading(false);
            return;
        } finally {
            showLoading(false);
        }
    }

    // Obter clientes (apenas PJ por simplificação, ou misto)
    const clientesDropdown = (appState.organizations || []).map(org => {
        const selected = (oppToEdit && oppToEdit.organizacao_id == org.id) ? 'selected' : '';
        return `<option value="${org.id}" ${selected}>${org.nome_fantasia || org.razao_social}</option>`;
    }).join('');

    const modalidadeDropdown = [
        'Pregão Eletrônico', 'Pregão Presencial', 'Concorrência', 'Tomada de Preços', 'Convite', 'Dispensa', 'Inexigibilidade'
    ].map(m => {
        const selected = (oppToEdit && oppToEdit.modalidade === m) ? 'selected' : '';
        return `<option value="${m}" ${selected}>${m}</option>`;
    }).join('');

    const updateItemsTable = () => {
        const container = document.getElementById('nc-items-container');
        if (!container) return;

        if (novoContratoItems.length === 0) {
            container.innerHTML = '<div class="text-center py-4 text-sm text-gray-400 border rounded">Nenhuma proposta de item adicionada.</div>';
            return;
        }

        // Agrupar itens por Lote e manter o índice original para edição/remoção
        const groupedItems = {};
        novoContratoItems.forEach((item, originalIndex) => {
            const loteName = item.lote ? `LOTE ${item.lote.replace(/lote\s*/i, '').trim().padStart(2, '0')} ` : 'ITENS SEM LOTE';
            if (!groupedItems[loteName]) groupedItems[loteName] = [];
            groupedItems[loteName].push({ ...item, originalIndex });
        });

        // Ordenar os lotes pelo nome (para que fiquem na ordem correta)
        const sortedLotes = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

        let html = '';

        sortedLotes.forEach(loteName => {
            html += `
        <div class="mb-4 border border-gray-200 rounded-md shadow-sm overflow-hidden bg-white">
                    <div class="bg-blue-100 text-blue-900 font-bold text-center py-2 text-sm uppercase tracking-wider">
                        ${loteName}
                    </div>
                    <table class="w-full text-left bg-white text-xs">
                        <thead class="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th class="p-3 font-semibold uppercase">Nº</th>
                                <th class="p-3 font-semibold uppercase w-1/3">Descrição</th>
                                <th class="p-3 font-semibold uppercase">Fabricante</th>
                                <th class="p-3 font-semibold uppercase">Modelo</th>
                                <th class="p-3 font-semibold uppercase text-center">Qtd.</th>
                                <th class="p-3 font-semibold uppercase text-right">Valor Unit.</th>
                                <th class="p-3 font-semibold uppercase text-right">Valor Total</th>
                                <th class="p-3 font-semibold uppercase text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            groupedItems[loteName].forEach(item => {
                const total = item.quantidade * item.valor_unitario;
                html += `
                            <tr class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                <td class="p-3 text-gray-700">${item.item || '-'}</td>
                                <td class="p-3 text-gray-800 font-medium leading-relaxed">${item.descricao}</td>
                                <td class="p-3 text-gray-600">${item.fabricante || '-'}</td>
                                <td class="p-3 text-gray-600">${item.modelo || '-'}</td>
                                <td class="p-3 text-center text-gray-700">${item.quantidade}</td>
                                <td class="p-3 text-right text-gray-700">${formatCurrency(item.valor_unitario)}</td>
                                <td class="p-3 text-right font-semibold text-gray-800">${formatCurrency(total)}</td>
                                <td class="p-3 text-center whitespace-nowrap">
                                    <button type="button" class="bg-blue-600 text-white px-2 py-1 rounded text-[10px] uppercase font-bold hover:bg-blue-700 mr-2 nc-edit-item transition-colors shadow-sm" data-index="${item.originalIndex}" title="Editar">
                                        Editar
                                    </button>
                                    <button type="button" class="bg-red-500 text-white px-2 py-1 rounded text-[10px] uppercase font-bold hover:bg-red-600 nc-remove-item transition-colors shadow-sm" data-index="${item.originalIndex}" title="Remover">
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
        `;
        });

        container.innerHTML = html;

        // Ligar eventos de remover e editar
        container.querySelectorAll('.nc-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                novoContratoItems.splice(idx, 1);
                updateItemsTable();
            });
        });

        container.querySelectorAll('.nc-edit-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                const item = novoContratoItems[idx];

                document.getElementById('nc-item-lote').value = item.lote || '';
                document.getElementById('nc-item-num').value = item.item || '';
                document.getElementById('nc-item-desc').value = item.descricao || '';
                document.getElementById('nc-item-fab').value = item.fabricante || '';
                document.getElementById('nc-item-modelo').value = item.modelo || '';
                document.getElementById('nc-item-qtd').value = item.quantidade || 1;
                document.getElementById('nc-item-valor').value = (item.valor_unitario || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                editingItemIndex = idx;

                const addBtn = document.getElementById('nc-btn-add-item');
                if (addBtn) {
                    addBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Salvar Alteração';
                    addBtn.classList.remove('bg-[#002f5c]', 'hover:bg-[#004080]');
                    addBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                }
            });
        });
    };

    const content = `
        <form id="modal-form" class="space-y-6">
            <!-- Dados Básicos -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="form-label font-semibold text-xs text-gray-700">Número do Contrato/Pregão</label>
                    <input type="text" id="nc-numero-edital" class="form-input" placeholder="Ex: 01/2024" value="${oppToEdit?.numero_edital || ''}">
                </div>
                <div>
                    <label class="form-label font-semibold text-xs text-gray-700">Número do Processo</label>
                    <input type="text" id="nc-numero-processo" class="form-input" value="${oppToEdit?.numero_processo || ''}">
                </div>
                <div>
                    <label class="form-label font-semibold text-xs text-gray-700">Modalidade</label>
                    <select id="nc-modalidade" class="form-input">
                        ${modalidadeDropdown}
                    </select>
                </div>
                <div>
                    <label class="form-label font-semibold text-xs text-gray-700">Cliente</label>
                    <select id="nc-cliente" class="form-input" required>
                        <option value="">Selecione...</option>
                        ${clientesDropdown}
                    </select>
                </div>
                <div class="md:col-span-2">
                    <label class="form-label font-semibold text-xs text-gray-700">Objeto</label>
                    <textarea id="nc-objeto" rows="2" class="form-input" required>${oppToEdit?.objeto || ''}</textarea>
                </div>
            </div>

            <!-- Adicionar Item -->
            <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 class="font-bold text-sm text-gray-700 mb-3 border-b pb-1">Adicionar Nova Proposta de Item</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                        <label class="form-label text-xs">Nº do Lote (Opcional)</label>
                        <input type="text" id="nc-item-lote" class="form-input form-input-sm" placeholder="Ex: Lote 01">
                    </div>
                    <div>
                        <label class="form-label text-xs">Nº do Item</label>
                        <input type="text" id="nc-item-num" class="form-input form-input-sm" placeholder="Ex: 1, 2, 3...">
                    </div>
                    <div class="md:col-span-2">
                        <label class="form-label text-xs">Descrição</label>
                        <input type="text" id="nc-item-desc" class="form-input form-input-sm">
                    </div>
                    <div>
                        <label class="form-label text-xs">Fabricante/Marca</label>
                        <input type="text" id="nc-item-fab" class="form-input form-input-sm">
                    </div>
                    <div>
                        <label class="form-label text-xs">Modelo</label>
                        <input type="text" id="nc-item-modelo" class="form-input form-input-sm">
                    </div>
                    <div>
                        <label class="form-label text-xs">Quantidade</label>
                        <input type="number" id="nc-item-qtd" class="form-input form-input-sm" min="1" value="1">
                    </div>
                    <div>
                        <label class="form-label text-xs">Valor Unitário (R$)</label>
                        <input type="text" id="nc-item-valor" class="form-input form-input-sm" placeholder="0,00" inputmode="decimal">
                    </div>
                </div>
                <div class="flex justify-end">
                    <button type="button" id="nc-btn-add-item" class="btn btn-primary btn-sm bg-[#002f5c] text-white hover:bg-[#004080]">Adicionar</button>
                </div>

                <div id="nc-items-container" class="mt-4 overflow-hidden">
                    <!-- Tables go here -->
                </div>
            </div>

            <!-- Upload Documentos -->
        <div class="bg-gray-50 border border-gray-200 rounded-md p-4 mt-4">
            <h3 class="font-bold text-sm text-gray-700 mb-3 border-b pb-1">Documentos de Contratação</h3>

            <div id="nc-file-info" class="${oppToEdit && oppToEdit.documento_url ? 'text-xs text-left mb-3' : 'text-xs text-gray-500 text-center py-4 border-b border-dashed mb-3'}">
                ${oppToEdit && oppToEdit.documento_url ? `
                        <div class="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
                            <div class="flex flex-col">
                                <span class="text-gray-800 font-semibold flex items-center gap-2">
                                   <!-- <span class="material-icons-outlined text-gray-400 text-lg">description</span> -->
                                    ${oppToEdit.documento_nome || 'Documento Anexado'}
                                </span>
                                <span class="text-gray-500 text-xs mt-1 ml-6 flex items-center gap-1">
                                    <span class="bg-gray-100 border px-2 py-0.5 rounded text-gray-600">${oppToEdit.documento_tipo || 'Anexo'}</span>
                                    <span class="text-green-600 ml-2">✓ Salvo no contrato</span>
                                </span>
                            </div>
                            <a href="${oppToEdit.documento_url}" target="_blank" class="text-blue-600 hover:underline flex items-center gap-1 font-medium bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100 hover:bg-blue-100 transition-colors">
                                <span class="material-icons-outlined text-sm">Abrir</span> 
                            </a>
                        </div>
                    ` : 'Nenhum documento anexado.'}
            </div>

            <div class="text-sm">
                <h4 class="font-bold text-xs text-gray-600 mb-2">Adicionar Novo Arquivo</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                    <div>
                        <label class="form-label text-xs">Nome ou Descrição do Ficheiro</label>
                        <input type="text" id="nc-file-desc" class="form-input form-input-sm" placeholder="Ex: Contrato Assinado.pdf">
                    </div>
                    <div>
                        <label class="form-label text-xs">Tipo de Documento</label>
                        <select id="nc-file-tipo" class="form-input form-input-sm">
                            <option value="Contrato">Contrato</option>
                            <option value="Nota de Empenho">Nota de Empenho</option>
                            <option value="Ordem de Serviço">Ordem de Serviço</option>
                            <option value="Anexo Geral">Anexo Geral</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label class="form-label text-xs">Selecione o Ficheiro</label>
                    <div class="flex items-center gap-2 border bg-white p-1 rounded-md">
                        <input type="file" id="nc-file-input" class="hidden">
                            <button type="button" id="nc-btn-sel-file" class="btn btn-secondary text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 py-1 px-3 text-xs shadow-none">Escolher arquivo</button>
                            <span id="nc-file-name-display" class="text-xs text-gray-500 truncate">Nenhum arquivo escolhido</span>
                    </div>
                </div>
            </div>
        </div>
        </form>
        `;

    renderModal(oppToEdit ? 'Editar Contrato' : 'Cadastrar Novo Contrato', content, async (form) => {
        if (!form.reportValidity()) return;

        if (novoContratoItems.length === 0) {
            showToast("Você precisa adicionar pelo menos 1 item.", "error");
            return;
        }

        const payload = {
            titulo: 'Contrato: ' + (document.getElementById('nc-numero-edital').value || 'S/N'),
            organizacao_id: document.getElementById('nc-cliente').value,
            numero_edital: document.getElementById('nc-numero-edital').value,
            numero_processo: document.getElementById('nc-numero-processo').value,
            modalidade: document.getElementById('nc-modalidade').value,
            objeto: document.getElementById('nc-objeto').value,
            items: novoContratoItems.map(item => {
                // Clonar parametros existentes ignorando Lote e Item_Num antigos
                const formParams = (item.parametros || []).filter(p => p.nome !== 'Lote' && p.nome !== 'Item_Num');

                if (item.lote) {
                    formParams.push({ nome: 'Lote', valor: item.lote });
                }
                if (item.item) {
                    formParams.push({ nome: 'Item_Num', valor: item.item });
                }

                return {
                    id: item.id || '',           // preserva ID existente se houver para atualizar o item correto
                    produto_id: item.produto_id || '',
                    descricao: item.descricao,
                    descricao_detalhada: '',
                    fabricante: item.fabricante,
                    modelo: item.modelo,
                    quantidade: item.quantidade,
                    valor_unitario: item.valor_unitario,
                    status: 'VENDA',
                    parametros: formParams.length > 0 ? formParams : null
                };
            })
        };

        let endpoint = 'create_opportunity';
        if (oppToEdit) {
            payload.id = oppToEdit.id;
            payload.etapa_id = oppToEdit.etapa_id; // Previne que o backend resete para a etapa padrao 1
            endpoint = 'update_opportunity';
        } else {
            // Se for criação, descobre a etapa 'Clientes' do funil Financeiro
            let maxFunilId = 0;
            appState.stages.forEach(s => {
                if (s.nome === 'Clientes' || s.nome === 'Aguardando Faturamento' || s.nome === 'Faturado') {
                    if (s.funil_id > maxFunilId) maxFunilId = s.funil_id;
                }
            });
            const clientesStage = appState.stages.find(s => s.funil_id == maxFunilId && s.nome === 'Clientes');
            payload.etapa_id = clientesStage ? clientesStage.id : 1;
        }

        // --- NEW BLOCK: Upload document before saving opportunity ---
        if (novoContratoFile) {
            try {
                showLoading(true);
                showToast("Enviando anexo...", "info");
                const formData = new FormData();
                formData.append('image', novoContratoFile); // O helper 'upload_document' espera a chave 'image'
                const uploadResult = await apiCall('upload_document', { method: 'POST', body: formData });
                if (uploadResult && uploadResult.success) {
                    payload.documento_url = uploadResult.url;
                    payload.documento_nome = document.getElementById('nc-file-desc').value || novoContratoFile.name;
                    payload.documento_tipo = document.getElementById('nc-file-tipo').value || 'Contrato';
                } else {
                    showLoading(false);
                    showToast("Falha ao salvar o anexo.", "error");
                    return; // Interrompe se o anexo falhar
                }
            } catch (err) {
                console.error("Erro Upload:", err);
                showLoading(false);
                showToast("Erro de rede no upload do anexo.", "error");
                return;
            }
        }
        // --- END NEW BLOCK ---

        try {
            showLoading(true);
            const response = await apiCall(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (response.success && response.opportunity) {
                showToast(oppToEdit ? "Contrato atualizado!" : "Contrato criado com sucesso!", "success");

                if (oppToEdit) {
                    const idx = appState.opportunities.findIndex(o => o.id == oppToEdit.id);
                    if (idx !== -1) appState.opportunities[idx] = response.opportunity;
                } else {
                    appState.opportunities.push(response.opportunity);
                }

                if (typeof appState.renderView === 'function') {
                    appState.renderView();
                } else {
                    location.reload();
                }
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            showToast("Falha ao salvar contrato.", "error");
        } finally {
            showLoading(false);
        }

    }, oppToEdit ? 'Salvar Alterações' : 'Cadastrar', oppToEdit ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-[#002f5c] hover:bg-[#004080] text-white', 'lg');

    // Inicializar o render da tabela vazia
    updateItemsTable();

    // Eventos locais do Modal
    setTimeout(() => {
        // Formatar valor moeda
        const valorInput = document.getElementById('nc-item-valor');
        if (valorInput) {
            valorInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value === '') value = '0';
                value = parseInt(value, 10) / 100;
                e.target.value = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            });
        }

        // Adicionar item logic
        document.getElementById('nc-btn-add-item')?.addEventListener('click', (e) => {
            const desc = document.getElementById('nc-item-desc').value.trim();
            const qtd = document.getElementById('nc-item-qtd').value;
            const val = document.getElementById('nc-item-valor').value;

            if (!desc || !val) {
                showToast("Preencha descrição e valor unitário.", "error");
                return;
            }

            const lote = document.getElementById('nc-item-lote').value;
            const itemNum = document.getElementById('nc-item-num').value;
            const fab = document.getElementById('nc-item-fab').value;
            const modelo = document.getElementById('nc-item-modelo').value;

            if (editingItemIndex !== null) {
                // Modo alteração
                novoContratoItems[editingItemIndex] = {
                    ...novoContratoItems[editingItemIndex], // Mantém id se houver
                    lote: lote,
                    item: itemNum,
                    descricao: desc,
                    fabricante: fab,
                    modelo: modelo,
                    quantidade: parseInt(qtd, 10) || 1,
                    valor_unitario: parseCurrency(val) || 0
                };
                editingItemIndex = null;
                e.currentTarget.innerHTML = 'Adicionar';
                e.currentTarget.classList.remove('bg-green-600', 'hover:bg-green-700');
                e.currentTarget.classList.add('bg-[#002f5c]', 'hover:bg-[#004080]');
            } else {
                // Modo criação
                novoContratoItems.push({
                    lote: lote,
                    item: itemNum,
                    descricao: desc,
                    fabricante: fab,
                    modelo: modelo,
                    quantidade: parseInt(qtd, 10) || 1,
                    valor_unitario: parseCurrency(val) || 0
                });
            }

            // Limpa inputs
            ['nc-item-lote', 'nc-item-num', 'nc-item-desc', 'nc-item-fab', 'nc-item-modelo', 'nc-item-qtd', 'nc-item-valor'].forEach(id => {
                const el = document.getElementById(id);
                if (el && el.type === 'number') el.value = 1;
                else if (el) el.value = '';
            });

            updateItemsTable();
        });

        // Input de Arquivo Custom UI
        document.getElementById('nc-btn-sel-file')?.addEventListener('click', () => {
            document.getElementById('nc-file-input').click();
        });

        document.getElementById('nc-file-input')?.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                novoContratoFile = e.target.files[0];
                document.getElementById('nc-file-name-display').textContent = novoContratoFile.name;

                const desc = document.getElementById('nc-file-desc').value || novoContratoFile.name;
                document.getElementById('nc-file-info').innerHTML = `
        <div class="text-gray-800 font-medium">${desc}</div>
            <div class="text-blue-600 text-xs mt-1">1 arquivo selecionado - Pronto para envio junto com o cadastro.</div>
    `;
            } else {
                novoContratoFile = null;
                document.getElementById('nc-file-name-display').textContent = 'Nenhum arquivo escolhido';
                document.getElementById('nc-file-info').innerHTML = 'Nenhum documento anexado.';
            }
        });

    }, 100);
}

// ==========================================
// FUNÇÕES GLOBAIS PARA EMPENHOS E NOTAS FISCAIS
// ==========================================

window.openAddEmpenhoModal = async function (editId = null) {
    if (!financeiroSelectedOppId && !editId) {
        showToast("Selecione um contrato primeiro clicando nele na primeira coluna.", "warning");
        return;
    }

    let empToEdit = null;
    let oFast = null;

    if (editId) {
        empToEdit = (appState.empenhos || []).find(e => e.id == editId);
        if (!empToEdit) {
            showToast("Empenho não encontrado.", "error");
            return;
        }
        oFast = appState.opportunities.find(o => o.id == empToEdit.oportunidade_id);
    } else {
        oFast = appState.opportunities.find(o => o.id == financeiroSelectedOppId);
    }

    if (!oFast) return;
    const oppName = oFast.numero_contrato || oFast.titulo;

    // Load items from contract via API or use existing empenho items
    let modalItems = [];
    if (empToEdit && empToEdit.itens) {
        try {
            modalItems = typeof empToEdit.itens === 'string' ? JSON.parse(empToEdit.itens) : empToEdit.itens;
        } catch (e) {
            console.error("Erro JSON itens empenho", e);
            modalItems = [];
        }
    } else {
        try {
            showLoading(true);
            const result = await apiCall('get_opportunity_details', { params: { id: oFast.id } });
            const opp = result.opportunity;

            if (opp && opp.items && opp.items.length > 0) {
                modalItems = opp.items.map(dbItem => {
                    let loteVal = '';
                    let itemVal = '';
                    if (dbItem.parametros) {
                        try {
                            const params = typeof dbItem.parametros === 'string' ? JSON.parse(dbItem.parametros) : dbItem.parametros;
                            if (Array.isArray(params)) {
                                const lP = params.find(p => p.nome === 'Lote');
                                if (lP) loteVal = lP.valor;
                                const iP = params.find(p => p.nome === 'Item_Num');
                                if (iP) itemVal = iP.valor;
                            }
                        } catch (e) { }
                    }
                    return {
                        base_item_id: dbItem.id,
                        descricao: dbItem.descricao,
                        lote: loteVal,
                        item: itemVal,
                        fabricante: dbItem.fabricante || '',
                        modelo: dbItem.modelo || '',
                        quantidade: dbItem.quantidade || 1,
                        valor_unitario: dbItem.valor_unitario || 0,
                        total_faturado: 0 // Novo empenho começa com 0 faturado
                    };
                });
            }
        } catch (e) {
            console.error("Erro ao carregar detalhes do contrato:", e);
            showToast("Erro ao carregar detalhes do contrato.", "error");
        } finally {
            showLoading(false);
        }
    }

    const content = `
        <form id="modal-form" class="space-y-4">
            <div class="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4 border border-blue-100 flex justify-between items-center">
                <div><strong>Contrato Vinculado:</strong> ${oppName}</div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="form-label text-xs font-semibold">Número do Empenho/Pedido</label>
                    <input type="text" id="emp-numero" class="form-input" required value="${empToEdit ? empToEdit.numero : ''}">
                </div>
                <div>
                    <label class="form-label text-xs font-semibold">Valor (R$)</label>
                    <input type="text" id="emp-valor" class="form-input bg-gray-50 text-gray-500 font-bold" placeholder="0,00" readonly value="${empToEdit && empToEdit.valor ? formatCurrencyForInput(empToEdit.valor) : ''}">
                    <p class="text-[9px] text-gray-500 mt-1">Preenchido automaticamente pela soma dos itens</p>
                </div>
                <div>
                    <label class="form-label text-xs font-semibold">Data de Emissão (Opcional)</label>
                    <input type="date" id="emp-data-emissao" class="form-input" value="${empToEdit && empToEdit.data_emissao ? empToEdit.data_emissao : ''}">
                </div>
                <div>
                    <label class="form-label text-xs font-semibold">Data Prevista p/ Faturamento</label>
                    <input type="date" id="emp-data-prevista" class="form-input" required value="${empToEdit && empToEdit.data_prevista ? empToEdit.data_prevista : ''}">
                    <p class="text-[9px] text-gray-500 mt-1">Usada para filtrar o mês na coluna</p>
                </div>
            </div>

            <!-- Tabela de Itens do Empenho -->
            <div id="emp-items-container" class="mt-4 overflow-x-auto border border-gray-200 rounded-md">
            </div>
        </form>
    `;

    const renderItemsTable = () => {
        const container = document.getElementById('emp-items-container');
        if (!container) return;

        if (modalItems.length === 0) {
            container.innerHTML = '<div class="p-4 text-center text-sm text-gray-500">Este contrato não possui itens detalhados.</div>';
            return;
        }

        // Agrupar por Lote
        const grouped = {};
        modalItems.forEach((it, idx) => {
            const lName = it.lote ? `LOTE ${it.lote}` : 'ITENS GERAIS';
            if (!grouped[lName]) grouped[lName] = [];
            grouped[lName].push({ ...it, idx });
        });

        let html = '';
        let sumGlobal = 0;

        Object.keys(grouped).sort().forEach(loteName => {
            html += `
                <div class="bg-blue-100 text-blue-900 font-bold text-center py-2 text-[10px] uppercase tracking-wider border-b border-t first:border-t-0">
                    ${loteName}
                </div>
                <table class="w-full text-left bg-white text-[10px]">
                    <thead class="bg-gray-50 text-gray-600 border-b">
                        <tr>
                            <th class="p-2 font-semibold w-8">Nº</th>
                            <th class="p-2 font-semibold w-1/4">DESCRIÇÃO</th>
                            <th class="p-2 font-semibold">FABRICANTE</th>
                            <th class="p-2 font-semibold">MODELO</th>
                            <th class="p-2 font-semibold w-16">QTD.</th>
                            <th class="p-2 font-semibold w-24">VALOR UNIT.</th>
                            <th class="p-2 font-semibold w-24">VALOR TOTAL</th>
                            <th class="p-2 font-semibold text-orange-600 w-24">TOTAL FATURADO</th>
                            <th class="p-2 font-semibold text-green-600 w-24">SALDO</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            grouped[loteName].forEach(it => {
                const itemTotal = it.quantidade * it.valor_unitario;
                const saldo = itemTotal - (it.total_faturado || 0);
                sumGlobal += itemTotal;

                html += `
                        <tr class="border-b last:border-0 hover:bg-gray-50 transition-colors">
                            <td class="p-2">${it.item || '-'}</td>
                            <td class="p-2 font-medium line-clamp-2" title="${it.descricao}">${it.descricao}</td>
                            <td class="p-1"><input type="text" class="w-full text-[10px] border-gray-300 rounded p-1 emp-item-input focus:ring-blue-500 focus:border-blue-500" data-idx="${it.idx}" data-field="fabricante" value="${it.fabricante}"></td>
                            <td class="p-1"><input type="text" class="w-full text-[10px] border-gray-300 rounded p-1 emp-item-input focus:ring-blue-500 focus:border-blue-500" data-idx="${it.idx}" data-field="modelo" value="${it.modelo}"></td>
                            <td class="p-1"><input type="number" class="w-full text-[10px] border-gray-300 rounded p-1 emp-item-input focus:ring-blue-500 focus:border-blue-500 text-center" data-idx="${it.idx}" data-field="quantidade" value="${it.quantidade}" min="0"></td>
                            <td class="p-1"><input type="text" class="w-full text-[10px] border-gray-300 rounded p-1 emp-item-input focus:ring-blue-500 focus:border-blue-500 text-right" data-idx="${it.idx}" data-field="valor_unitario" value="${it.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}"></td>
                            <td class="p-2 text-right font-bold text-gray-800 bg-gray-50">${formatCurrency(itemTotal)}</td>
                            <td class="p-2 text-right font-semibold text-orange-600 bg-orange-50">${formatCurrency(it.total_faturado)}</td>
                            <td class="p-2 text-right font-semibold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'} bg-green-50">${formatCurrency(saldo)}</td>
                        </tr>
                `;
            });
            html += `</tbody></table>`;
        });

        container.innerHTML = html;

        // Atualizar valor principal
        const empValorInput = document.getElementById('emp-valor');
        if (empValorInput) {
            empValorInput.value = sumGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        // Listeners para recálculo
        container.querySelectorAll('.emp-item-input').forEach(inp => {
            // Se for valor unitário, formata na saída
            if (inp.dataset.field === 'valor_unitario') {
                inp.addEventListener('blur', (e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val === '') val = '0';
                    val = parseInt(val, 10) / 100;
                    e.target.value = val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    const idx = e.target.dataset.idx;
                    modalItems[idx].valor_unitario = val;
                    renderItemsTable();
                });
            } else {
                inp.addEventListener('change', (e) => {
                    const idx = e.target.dataset.idx;
                    const field = e.target.dataset.field;
                    let val = e.target.value;
                    if (field === 'quantidade') val = parseInt(val, 10) || 0;
                    modalItems[idx][field] = val;
                    if (field === 'quantidade') renderItemsTable();
                });
            }
        });
    };

    renderModal(empToEdit ? 'Editar Empenho/Pedido' : 'Adicionar Novo Empenho/Pedido', content, async (form) => {
        if (!form.reportValidity()) return;

        const payload = {
            oportunidade_id: oFast.id,
            numero: document.getElementById('emp-numero').value,
            valor: document.getElementById('emp-valor').value,
            data_emissao: document.getElementById('emp-data-emissao').value || null,
            data_prevista: document.getElementById('emp-data-prevista').value || null,
            itens: modalItems
        };

        if (empToEdit) {
            payload.id = empToEdit.id;
        }

        try {
            showLoading(true);
            const endpoint = empToEdit ? 'update_empenho' : 'create_empenho';
            const res = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(payload) });
            if (res.success) {
                showToast(empToEdit ? "Empenho atualizado com sucesso!" : "Empenho cadastrado com sucesso!", "success");
                appState.empenhos = appState.empenhos || [];
                // Enriquecer o objeto retornado com dados locais (fallback caso JOINs faltem)
                const empenhoData = res.empenho || {};
                if (!empenhoData.numero_contrato && oFast) empenhoData.numero_contrato = oFast.numero_contrato || oFast.numero_edital || oFast.titulo;
                if (!empenhoData.organizacao_nome && oFast) empenhoData.organizacao_nome = oFast.organizacao_nome || '';
                // Garantir que os campos de data estejam presentes
                if (!empenhoData.data_prevista && payload.data_prevista) empenhoData.data_prevista = payload.data_prevista;
                if (!empenhoData.data_emissao && payload.data_emissao) empenhoData.data_emissao = payload.data_emissao;
                if (!empenhoData.oportunidade_id) empenhoData.oportunidade_id = oFast.id;
                if (empToEdit) {
                    const idx = appState.empenhos.findIndex(e => e.id == empToEdit.id);
                    if (idx > -1) appState.empenhos[idx] = empenhoData;
                } else {
                    appState.empenhos.push(empenhoData);
                }
                closeModal();
                renderFinanceiroBoard();
            } else {
                showToast(res.error || "Erro ao salvar empenho.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Erro de comunicação.", "error");
        } finally {
            showLoading(false);
        }
    }, empToEdit ? 'Salvar Empenho' : 'Adicionar Empenho');

    // Inicializar Tabela
    setTimeout(() => {
        renderItemsTable();
    }, 100);
};

window.openAddNotaFiscalModal = async function (editId = null) {
    if (!financeiroSelectedOppId && !editId) {
        showToast("Selecione um contrato primeiro clicando nele na primeira coluna.", "warning");
        return;
    }

    let nfToEdit = null;
    let oFast = null;

    if (editId) {
        nfToEdit = (appState.notas_fiscais || []).find(nf => nf.id == editId);
        if (!nfToEdit) return;
        oFast = appState.opportunities.find(o => o.id == nfToEdit.oportunidade_id);
    } else {
        oFast = appState.opportunities.find(o => o.id == financeiroSelectedOppId);
    }

    if (!oFast) return;
    const oppName = oFast.numero_contrato || oFast.titulo;
    const oppClient = oFast.organizacao_nome || '';

    let oppWithItems = null;
    try {
        showLoading(true);
        const result = await apiCall('get_opportunity_details', { params: { id: oFast.id } });
        oppWithItems = result.opportunity;
    } catch (e) {
        console.error("Erro ao carregar os dados do contrato:", e);
    } finally {
        showLoading(false);
    }

    const empenhosContrato = (appState.empenhos || []).filter(e => e.oportunidade_id == oFast.id);
    let empenhosOptions = '<option value="">Sem vínculo com empenho específico</option>';
    empenhosContrato.forEach(emp => {
        const sel = (nfToEdit && nfToEdit.empenho_id == emp.id) ? 'selected' : '';
        empenhosOptions += `<option value="${emp.id}" ${sel}>Empenho: ${emp.numero} (${formatCurrency(emp.valor)})</option>`;
    });

    let modalItems = [];
    let initialRenderDone = false;

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const mapToFlat = (sourceItems, source) => {
        return sourceItems.map(dbItem => {
            let itemVal = dbItem.item_empenho || dbItem.item || '';
            let loteVal = dbItem.lote || '';
            if (source === 'contract' && dbItem.parametros) {
                try {
                    const params = typeof dbItem.parametros === 'string' ? JSON.parse(dbItem.parametros) : dbItem.parametros;
                    if (Array.isArray(params)) {
                        const lP = params.find(p => p.nome === 'Lote');
                        if (lP) loteVal = lP.valor;
                        const iP = params.find(p => p.nome === 'Item_Num');
                        if (iP) itemVal = iP.valor;
                    }
                } catch (e) { }
            }

            let qtdEmp = parseFloat(dbItem.qtd_empenhada || dbItem.quantidade || 0);
            let qtdFat = parseFloat(dbItem.qtd_faturada || dbItem.quantidade || 0);

            if (source !== 'nf') qtdFat = qtdEmp;

            return {
                _uid: generateId(),
                fornecedor: dbItem.fornecedor || dbItem.fabricante || '',
                lote: loteVal,
                item_empenho: itemVal,
                descricao: dbItem.descricao || '',
                unidade: dbItem.unidade || dbItem.unidade_medida || 'UN',
                qtd_empenhada: qtdEmp,
                qtd_faturada: qtdFat,
                valor_unitario: parseFloat(dbItem.valor_unitario || 0),
                observacao: dbItem.observacao || '',
                produto_id: dbItem.produto_id || dbItem.base_item_id || null
            };
        });
    };

    const loadItemsFromSource = (empenhoId) => {
        if (nfToEdit && !initialRenderDone) {
            let parsed = [];
            if (nfToEdit.itens) {
                try { parsed = typeof nfToEdit.itens === 'string' ? JSON.parse(nfToEdit.itens) : nfToEdit.itens; } catch (e) { }
            }
            modalItems = mapToFlat(parsed, 'nf');
            initialRenderDone = true;
        } else if (!nfToEdit) {
            // CRIAÇÃO: A pedido do usuário, itens NÃO são puxados do empenho/contrato mais. Inicia vazio para inserção manual.
            modalItems = [];
        }
        renderItemsTable();
    };

    const content = `
        <form id="modal-form" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                    <label class="form-label text-xs font-semibold text-gray-600">Número do Contrato</label>
                    <input type="text" class="form-input bg-gray-100 text-gray-500 font-bold" value="${oppName}" readonly>
                </div>
                <div>
                    <label class="form-label text-xs font-semibold text-gray-600">Nome do Cliente</label>
                    <input type="text" class="form-input bg-gray-100 text-gray-500 font-bold" value="${oppClient}" readonly>
                </div>
                
                <div>
                    <label class="form-label text-xs font-semibold text-gray-600">Número do Empenho/Pedido</label>
                    <select id="nf-empenho-id" class="form-input border-gray-300">
                        ${empenhosOptions}
                    </select>
                </div>
                <div>
                    <label class="form-label text-xs font-semibold text-gray-600">Número da Nota Fiscal</label>
                    <input type="text" id="nf-numero" class="form-input" required placeholder="Ex: 000.123.456 (Série 1)" value="${nfToEdit ? nfToEdit.numero : ''}">
                </div>

                <div>
                    <label class="form-label text-xs font-semibold text-gray-600">Data de Emissão (Faturamento)</label>
                    <input type="date" id="nf-data-fat" class="form-input" required value="${nfToEdit && nfToEdit.data_faturamento ? nfToEdit.data_faturamento : ''}">
                </div>
                <div>
                    <label class="form-label text-xs font-semibold text-gray-600">Mês de Competência / Previsão</label>
                    <input type="date" id="nf-data-prevista" class="form-input" required value="${nfToEdit && nfToEdit.data_prevista ? nfToEdit.data_prevista : ''}">
                </div>
            </div>

            <!-- Tabela de Itens da NF -->
            <div class="mt-4 border border-gray-200 rounded-lg flex flex-col bg-white">
                
                <div class="bg-blue-50/50 p-3 border-b border-gray-200 relative group/global-desc z-[60]">
                    <label class="form-label text-xs font-bold text-[#002f5c] mb-1 block">Pesquisar e Adicionar Novo Item (Catálogo/Tabelas/Kits)</label>
                    <div class="relative w-full">
                        <input type="text" id="global-nf-search" class="w-full border border-gray-300 focus:border-[#002f5c] focus:ring-1 focus:ring-[#002f5c] rounded px-3 py-2 bg-white text-sm shadow-sm transition-all" 
                            placeholder="Pesquisar por nome do produto, fabricante, tabela de preços, código ou kit..."
                            oninput="window.filterNfCatalogGlobal(this.value)">
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                    </div>
                    <div id="global-cat-drop" class="hidden absolute top-[calc(100%+4px)] left-0 right-0 max-h-[350px] overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded z-[100]">
                        <!-- Ajax results for global search -->
                    </div>
                </div>

                <div class="overflow-x-auto min-h-[300px]">
                    <table class="w-full text-left bg-white text-xs whitespace-nowrap">
                        <thead class="bg-gray-100 text-gray-600 border-b">
                            <tr>
                                <th class="p-2 font-semibold min-w-[120px]">Fornecedor</th>
                                <th class="p-2 font-semibold w-24">Lote</th>
                                <th class="p-2 font-semibold w-24">Item do Emp.</th>
                                <th class="p-2 font-semibold min-w-[200px]">Descrição</th>
                                <th class="p-2 font-semibold w-16 text-center">Unidade</th>
                                <th class="p-2 font-semibold w-24 text-right">Qtd Emp.</th>
                                <th class="p-2 font-semibold w-24 text-right">Qtd Fat.</th>
                                <th class="p-2 font-semibold w-32 text-right">V. Unitário</th>
                                <th class="p-2 font-semibold w-32 text-right">Valor Total</th>
                                <th class="p-2 font-semibold min-w-[150px]">Obs</th>
                                <th class="p-2 font-semibold w-10 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="nf-items-tbody">
                        </tbody>
                    </table>
                </div>
                
                <div class="bg-gray-50 p-3 flex justify-between items-center border-t border-gray-200">
                    <button type="button" class="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 border-gray-300 hover:bg-white transition-colors" onclick="window.addNfItemRow()">
                        <i class="fas fa-plus text-gray-400"></i> Adicionar Item
                    </button>
                    <div class="font-bold text-gray-700 bg-gray-200 px-3 py-1.5 rounded flex items-center gap-2">
                        Total Geral da Nota: <span id="nf-total-geral" class="text-blue-700 text-sm">R$ 0,00</span>
                    </div>
                </div>
            </div>
            <!-- Campo de valor invisivel para envio -->
            <input type="hidden" id="nf-valor" value="0">
        </form>
    `;


    const renderItemsTable = () => {
        const tbody = document.getElementById('nf-items-tbody');
        if (!tbody) return;

        let html = '';
        let totalGeral = 0;

        modalItems.forEach((it, idx) => {
            const vUnit = parseFloat(it.valor_unitario) || 0;
            const qFat = parseFloat(it.qtd_faturada) || 0;
            const vTot = vUnit * qFat;
            totalGeral += vTot;

            it.valor_total = vTot;

            const safeDesc = (it.descricao || '').replace(/"/g, '&quot;');

            html += `
                <tr class="border-b last:border-0 hover:bg-gray-50 group transition-colors" data-idx="${idx}">
                    <td class="p-1.5">
                        <input type="text" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 bg-transparent group-hover:bg-white transition-all" value="${it.fornecedor || ''}" onchange="window.updateNfItem(${idx}, 'fornecedor', this.value)" placeholder="Fornecedor">
                    </td>
                    <td class="p-1.5">
                        <input type="text" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 bg-transparent group-hover:bg-white transition-all text-center" value="${it.lote || ''}" onchange="window.updateNfItem(${idx}, 'lote', this.value)" placeholder="Lote">
                    </td>
                    <td class="p-1.5">
                        <input type="text" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 bg-transparent group-hover:bg-white transition-all text-center" value="${it.item_empenho || ''}" onchange="window.updateNfItem(${idx}, 'item_empenho', this.value)" placeholder="Item">
                    </td>
                    <td class="p-1.5 align-middle">
                        <input type="text" id="nf-item-desc-${idx}" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 bg-transparent group-hover:bg-white transition-all text-xs" 
                            value="${safeDesc}" 
                            onchange="window.updateNfItem(${idx}, 'descricao', this.value)" 
                            placeholder="Descrição do item">
                    </td>
                    <td class="p-1.5">
                        <input type="text" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-center bg-transparent group-hover:bg-white transition-all" value="${it.unidade || ''}" onchange="window.updateNfItem(${idx}, 'unidade', this.value)">
                    </td>
                    <td class="p-1.5">
                        <input type="number" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-right bg-transparent group-hover:bg-white transition-all" value="${it.qtd_empenhada}" onchange="window.updateNfItem(${idx}, 'qtd_empenhada', this.value)" min="0" step="any">
                    </td>
                    <td class="p-1.5">
                        <input type="number" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 text-right bg-blue-50 focus:bg-white transition-all font-semibold text-blue-800" value="${it.qtd_faturada}" onchange="window.updateNfItem(${idx}, 'qtd_faturada', this.value)" min="0" step="any">
                    </td>
                    <td class="p-1.5 relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] pointer-events-none">R$</span>
                        <input type="text" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 pl-7 text-right bg-transparent group-hover:bg-white transition-all" value="${vUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}" onchange="window.updateNfItemCurrency(${idx}, 'valor_unitario', this)">
                    </td>
                    <td class="p-1.5 text-right font-bold text-gray-700">
                        ${formatCurrency(vTot)}
                    </td>
                    <td class="p-1.5">
                        <input type="text" class="w-full border border-transparent group-hover:border-gray-300 focus:border-blue-500 rounded px-2 py-1 bg-transparent group-hover:bg-white transition-all" value="${it.observacao || ''}" onchange="window.updateNfItem(${idx}, 'observacao', this.value)" placeholder="Obs">
                    </td>
                    <td class="p-1.5 text-center">
                        <button type="button" class="text-gray-400 hover:text-red-500 focus:outline-none p-1 transition-colors" onclick="window.removeNfItemRow(${idx})" title="Remover item">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        if (modalItems.length === 0) {
            html = `<tr><td colspan="11" class="p-6 text-center text-gray-400 italic">Nenhum item. Clique em "+ Adicionar Item".</td></tr>`;
        }

        tbody.innerHTML = html;

        const nfTotalGeral = document.getElementById('nf-total-geral');
        if (nfTotalGeral) nfTotalGeral.innerText = formatCurrency(totalGeral);
        const nfValor = document.getElementById('nf-valor');
        if (nfValor) nfValor.value = totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    window.addNfItemRow = () => {
        modalItems.push({
            _uid: generateId(),
            fornecedor: '',
            lote: '',
            item_empenho: '',
            descricao: '',
            unidade: 'UN',
            qtd_empenhada: 1,
            qtd_faturada: 1,
            valor_unitario: 0,
            observacao: '',
            produto_id: null
        });
        renderItemsTable();
    };

    window.removeNfItemRow = (idx) => {
        modalItems.splice(idx, 1);
        renderItemsTable();
    };

    window.updateNfItem = (idx, field, value) => {
        if (field === 'qtd_empenhada' || field === 'qtd_faturada') {
            modalItems[idx][field] = parseFloat(value) || 0;
            renderItemsTable();
        } else {
            modalItems[idx][field] = value;
        }
    };

    window.updateNfItemCurrency = (idx, field, rawInputElem) => {
        let val = rawInputElem.value.replace(/\D/g, '');
        if (val === '') val = '0';
        modalItems[idx][field] = parseInt(val, 10) / 100;
        renderItemsTable();
    };

    window.filterNfCatalogGlobal = (filter) => {
        const drop = document.getElementById('global-cat-drop');
        if (!drop) return;

        if (filter.length < 2) {
            drop.classList.add('hidden');
            return;
        }

        const term = filter.toLowerCase();
        let optionsHtml = '';
        let foundAny = false;

        // 1. Produtos
        const produtos = (appState.products || [])
            .filter(p => p.nome_produto.toLowerCase().includes(term) || (p.fabricante || '').toLowerCase().includes(term))
            .slice(0, 15);
            
        if (produtos.length > 0) {
            foundAny = true;
            optionsHtml += '<div class="bg-gray-100 px-3 py-1 text-[10px] font-bold text-gray-500 uppercase">Produtos</div>';
            optionsHtml += produtos.map(p => {
                const encName = encodeURIComponent(p.nome_produto || '');
                const encFab = encodeURIComponent(p.fabricante || '');
                return `<div class="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-xs group/item transition-colors" onclick="window.selectNfItemCatalogGlobal('produto', ${p.id}, '${encName}', '${encFab}', '${p.unidade_medida || 'UN'}', ${p.valor_unitario || 0})">
                    <div class="font-bold text-gray-800 group-hover/item:text-blue-700">${p.nome_produto}</div>
                    <div class="text-gray-500 text-[10px] mt-0.5 flex justify-between">
                        <span>${p.fabricante || 'Fabricante N/D'}</span>
                        <span class="font-bold text-blue-600">${formatCurrency(p.valor_unitario)}</span>
                    </div>
                </div>`;
            }).join('');
        }

        // 2. Tabela de Preços (master-detail)
        let priceItems = [];
        (appState.priceTable || []).forEach(master => {
            if (master.itens) {
                const arr = Array.isArray(master.itens) ? master.itens : JSON.parse(master.itens || '[]');
                const matches = arr.filter(i => (i.descricao || '').toLowerCase().includes(term) || 
                                                (i.fabricante || '').toLowerCase().includes(term) || 
                                                (i.referencia || '').toLowerCase().includes(term) || 
                                                (master.nome_tabela || '').toLowerCase().includes(term));
                matches.forEach(m => priceItems.push({ ...m, nome_tabela: master.nome_tabela }));
            }
        });
        priceItems = priceItems.slice(0, 15);
        
        if (priceItems.length > 0) {
            foundAny = true;
            optionsHtml += '<div class="bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 uppercase border-y border-blue-100">Itens - Tabela de Preço</div>';
            optionsHtml += priceItems.map(p => {
                const encName = encodeURIComponent(p.descricao || '');
                const encFab = encodeURIComponent(p.fabricante || '');
                const un = p.unidade || 'UN'; // if not present, default to UN
                return `<div class="p-3 hover:bg-blue-100 cursor-pointer border-b border-blue-50 last:border-0 text-xs group/item transition-colors" onclick="window.selectNfItemCatalogGlobal('tabela', ${p.id}, '${encName}', '${encFab}', '${un}', ${p.valor_unitario || 0})">
                    <div class="font-bold text-blue-900 group-hover/item:text-blue-700">${p.descricao}</div>
                    <div class="text-blue-600 text-[10px] mb-0.5">Tabela: ${p.nome_tabela} ${p.referencia ? '| Ref: '+p.referencia : ''}</div>
                    <div class="text-gray-500 text-[10px] mt-0.5 flex justify-between">
                        <span>${p.fabricante || 'Fabricante N/D'}</span>
                        <span class="font-bold text-blue-700">${formatCurrency(p.valor_unitario)}</span>
                    </div>
                </div>`;
            }).join('');
        }

        // 3. Kits
        const kits = (appState.kits || [])
            .filter(k => (k.nome || '').toLowerCase().includes(term) || (k.id + '').includes(term))
            .slice(0, 10);
            
        if (kits.length > 0) {
            foundAny = true;
            optionsHtml += '<div class="bg-purple-100 px-3 py-1 text-[10px] font-bold text-purple-700 uppercase border-y border-purple-200">Kits / Conjuntos</div>';
            optionsHtml += kits.map(k => {
                const numItens = k.itens ? (Array.isArray(k.itens) ? k.itens.length : JSON.parse(k.itens).length) : 0;
                // escape payload to add entire kit at once
                const b64Kit = btoa(encodeURIComponent(JSON.stringify(k)));
                return `<div class="p-3 hover:bg-purple-50 cursor-pointer border-b border-purple-100 last:border-0 text-xs group/item transition-colors" onclick="window.selectNfItemCatalogGlobal('kit', '${b64Kit}')">
                    <div class="font-bold text-purple-900 group-hover/item:text-purple-700">📦 ${k.nome}</div>
                    <div class="text-purple-600 text-[10px] mt-0.5 flex justify-between font-medium">
                        <span>Contém ${numItens} item(ns)</span>
                        <span class="font-bold">${formatCurrency(k.valor_total)}</span>
                    </div>
                </div>`;
            }).join('');
        }

        if (!foundAny) {
            drop.innerHTML = '<div class="p-4 text-center text-gray-400 text-sm">Nenhum resultado encontrado para a sua pesquisa.</div>';
        } else {
            drop.innerHTML = optionsHtml;
        }

        drop.classList.remove('hidden');
    };

    window.selectNfItemCatalogGlobal = (type, arg1, arg2, arg3, arg4, arg5) => {
        const drop = document.getElementById('global-cat-drop');
        const input = document.getElementById('global-nf-search');
        if (drop) drop.classList.add('hidden');
        if (input) {
            input.value = ''; // Limpar a pesquisa
        }

        if (type === 'kit') {
            const b64Kit = arg1;
            const kit = JSON.parse(decodeURIComponent(atob(b64Kit)));
            const itensKit = Array.isArray(kit.itens) ? kit.itens : JSON.parse(kit.itens || '[]');
            
            if (itensKit.length === 0) return;
            
            // Adiciona todas as linhas do kit
            for (let i = 0; i < itensKit.length; i++) {
                const kIt = itensKit[i];
                modalItems.push({
                    _uid: generateId(),
                    fornecedor: kIt.fabricante || '',
                    lote: '', 
                    item_empenho: '',
                    descricao: kIt.descricao,
                    unidade: 'UN',
                    qtd_empenhada: parseInt(kIt.quantidade || 1, 10),
                    qtd_faturada: parseInt(kIt.quantidade || 1, 10),
                    valor_unitario: parseFloat(kIt.valor_unitario_snapshot || kIt.valor_unitario || 0),
                    observacao: '',
                    produto_id: kIt.tabela_preco_item_id || kIt.id
                });
            }
        } else {
            // produto ou tabela
            const prodId = arg1;
            const name = arg2;
            const fab = arg3;
            const un = arg4;
            const val = arg5;

            modalItems.push({
                _uid: generateId(),
                fornecedor: decodeURIComponent(fab),
                lote: '',
                item_empenho: '',
                descricao: decodeURIComponent(name),
                unidade: un,
                qtd_empenhada: 1,
                qtd_faturada: 1,
                valor_unitario: val,
                observacao: '',
                produto_id: prodId
            });
        }

        // Scroll to the bottom of the table to show the nested items
        setTimeout(() => {
            const tbody = document.getElementById('nf-items-tbody');
            if (tbody && tbody.parentElement) {
                const container = tbody.closest('.overflow-x-auto');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }
        }, 50);

        renderItemsTable();
    };

    document.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.group\\/global-desc')) {
            const drop = document.getElementById('global-cat-drop');
            if (drop) drop.classList.add('hidden');
        }
    });

    renderModal(nfToEdit ? 'Editar Nota Fiscal' : 'Adicionar Nova Nota Fiscal', content, async (form) => {
        if (!form.reportValidity()) return;

        const payload = {
            oportunidade_id: oFast.id,
            empenho_id: document.getElementById('nf-empenho-id').value || null,
            numero: document.getElementById('nf-numero').value,
            valor: document.getElementById('nf-valor').value,
            data_faturamento: document.getElementById('nf-data-fat').value || null,
            data_prevista: document.getElementById('nf-data-prevista').value || null,
            itens: modalItems
        };

        if (nfToEdit) payload.id = nfToEdit.id;

        try {
            showLoading(true);
            const endpoint = nfToEdit ? 'update_nota_fiscal' : 'create_nota_fiscal';
            const res = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(payload) });
            if (res.success) {
                showToast(nfToEdit ? "Nota Fiscal atualizada com sucesso!" : "Nota Fiscal cadastrada com sucesso!", "success");
                appState.notas_fiscais = appState.notas_fiscais || [];
                const nfData = res.nota_fiscal || {};

                if (!nfData.numero_contrato && oFast) nfData.numero_contrato = oFast.numero_contrato || oFast.numero_edital || oFast.titulo;
                if (!nfData.organizacao_nome && oFast) nfData.organizacao_nome = oFast.organizacao_nome || '';
                if (!nfData.data_prevista && payload.data_prevista) nfData.data_prevista = payload.data_prevista;
                if (!nfData.data_faturamento && payload.data_faturamento) nfData.data_faturamento = payload.data_faturamento;
                if (!nfData.oportunidade_id) nfData.oportunidade_id = oFast.id;

                if (nfToEdit) {
                    const idx = appState.notas_fiscais.findIndex(n => n.id == nfToEdit.id);
                    if (idx > -1) appState.notas_fiscais[idx] = nfData;
                } else {
                    appState.notas_fiscais.push(nfData);
                }
                closeModal();
                renderFinanceiroBoard();
            } else {
                showToast(res.error || "Erro ao salvar nota fiscal.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Erro de comunicação.", "error");
        } finally {
            showLoading(false);
        }
    }, nfToEdit ? 'Salvar NF' : 'Adicionar NF', 'btn-primary', 'xl');

    setTimeout(() => {
        const modalBox = document.getElementById('modal-box');
        if (modalBox) {
            modalBox.classList.remove('max-w-4xl', 'max-w-lg');
            modalBox.classList.add('w-11/12', 'max-w-[95vw]', 'xl:max-w-[1400px]');
        }

        const selEmpenho = document.getElementById('nf-empenho-id');
        if (nfToEdit) {
            // Se for edição carrega o que tem salvo nela (id da propria NF passa pro load)
            loadItemsFromSource(null);
        } else {
            // Criação: Inicia vazio, independente do empenho do Select
            loadItemsFromSource(null);
        }
    }, 100);
};

window.deleteSubEntity = async function (id, type) {
    Swal.fire({
        title: 'Tem certeza?',
        text: `Tem certeza que deseja excluir ${type === 'Empenho' ? 'este' : 'esta'} ${type}? Isso não poderá ser desfeito.`,
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
                showLoading(true);
                const endpoint = type === 'Empenho' ? 'delete_empenho' : 'delete_nota_fiscal';
                const res = await apiCall(endpoint, { method: 'POST', body: JSON.stringify({ id: id }) });

                if (res.success) {
                    showToast(`${type} excluso com sucesso.`, "success");
                    if (type === 'Empenho') {
                        appState.empenhos = appState.empenhos.filter(e => e.id != id);
                    } else {
                        appState.notas_fiscais = appState.notas_fiscais.filter(n => n.id != id);
                    }
                    renderFinanceiroBoard();
                } else {
                    showToast(res.error || `Erro ao excluir ${type}.`, "error");
                }
            } catch (e) {
                console.error(e);
                showToast("Erro de comunicação ao excluir.", "error");
            } finally {
                showLoading(false);
            }
        }
    });
};
