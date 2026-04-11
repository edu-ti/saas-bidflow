// js/views/agenda.js

import { appState } from '../state.js';
import { initializeApp } from '../script.js'; // Importa initializeApp
import { apiCall } from '../api.js';
import { showToast, formatDate, showLoading } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';
// Importa renderFunilView para atualizar o Kanban se necessário
import { renderFunilView } from './kanban.js';

let currentMonth;
let currentYear;

export function renderAgendaView() {
    const container = document.getElementById('agenda-view');
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    const { permissions } = appState.currentUser;

    // Garante layout flexível para scroll do calendário
    container.classList.add('flex', 'flex-col', 'h-full');

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold text-gray-800">Agenda</h1>
            ${permissions.canCreateSchedule ? `
            <button id="add-agendamento-btn" class="btn btn-primary btn-sm flex-shrink-0">
                <i class="fas fa-plus mr-2"></i> Novo
            </button>
            ` : ''}
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border flex flex-col flex-grow min-h-0"> <!-- flex flex-col flex-grow min-h-0 -->
            <div id="calendar-header" class="flex justify-between items-center mb-4 flex-shrink-0"></div> <!-- flex-shrink-0 -->
            <!-- Adiciona container para grid com overflow -->
            <div id="calendar-grid-container" class="flex-grow overflow-y-auto">
                 <div id="calendar-grid" class="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200"> <!-- h-full -->
                    <!-- Dias da semana e dias do mês serão renderizados aqui -->
                 </div>
            </div>
        </div>
    `;

    addAgendaEventListeners();
    renderCalendar(currentMonth, currentYear);
}

function addAgendaEventListeners() {
    const container = document.getElementById('agenda-view');
    // Previne adicionar listeners múltiplos
    if (container.dataset.eventsAttached === 'true') return;

    container.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('#add-agendamento-btn')) {
            openAgendamentoModal(null);
        } else if (target.closest('#prev-month-btn')) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        } else if (target.closest('#next-month-btn')) {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        } else if (target.closest('.event-item')) {
            const agendamentoId = target.closest('.event-item').dataset.id;
            const agendamento = appState.agendamentos.find(ag => ag.id == agendamentoId);
            if (agendamento) {
                openAgendamentoModal(agendamento);
            } else {
                console.error("Agendamento não encontrado no estado:", agendamentoId);
                showToast("Erro: Agendamento não encontrado.", "error");
            }
        }
    });

    container.dataset.eventsAttached = 'true';
}

function renderCalendar(month, year) {
    const calendarGrid = document.getElementById('calendar-grid');
    const calendarHeader = document.getElementById('calendar-header');

    if (!calendarGrid || !calendarHeader) return;
    calendarGrid.innerHTML = ''; // Limpa o grid antes de redesenhar

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    calendarHeader.innerHTML = `
        <button id="prev-month-btn" class="action-btn text-xl p-2 rounded-full hover:bg-gray-100"><i class="fas fa-chevron-left"></i></button>
        <h2 class="text-xl font-bold">${monthNames[month]} ${year}</h2>
        <button id="next-month-btn" class="action-btn text-xl p-2 rounded-full hover:bg-gray-100"><i class="fas fa-chevron-right"></i></button>
    `;

    // Cabeçalho dos dias da semana
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let headerHtml = daysOfWeek.map(day => `<div class="text-center font-semibold text-sm py-2 bg-gray-100">${day}</div>`).join('');

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    // Verifica se o ano e mês atuais coincidem com os do calendário sendo renderizado
    const isCurrentMonthAndYear = today.getFullYear() === year && today.getMonth() === month;
    const todayDate = isCurrentMonthAndYear ? today.getDate() : null; // Só marca 'hoje' se for o mês/ano atual

    let dayCellsHtml = '';

    // Células vazias antes do primeiro dia
    for (let i = 0; i < firstDayOfMonth; i++) {
        dayCellsHtml += `<div class="bg-gray-50 border-t border-gray-200"></div>`;
    }

    // Células dos dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Filtra agendamentos para este dia específico
        const agendamentosDoDia = (appState.agendamentos || [])
            .filter(ag => ag.data_inicio && ag.data_inicio.startsWith(dateStr))
            .sort((a, b) => (a.data_inicio > b.data_inicio) ? 1 : -1); // Ordena por hora

        let agendamentosHtml = agendamentosDoDia.map(ag => {
            // Extrai a hora
            let hora = '??:??';
            try {
                const dateObj = new Date(ag.data_inicio);
                // Interpreta como local
                hora = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            } catch (e) { console.warn("Erro ao formatar hora:", ag.data_inicio); }

            // ** ALTERADO AQUI: Mostra múltiplos nomes usando 'para_usuario_nomes' **
            return `
            <div class="text-xs p-1 mt-1 rounded-md bg-blue-100 text-blue-800 truncate cursor-pointer event-item hover:bg-blue-200" data-id="${ag.id}" title="${ag.titulo} (${hora}) - Para: ${ag.para_usuario_nomes || 'N/A'}">
                <i class="fas fa-circle text-[6px] mr-1"></i>${hora} - ${ag.titulo}
            </div>`;
            // ** FIM DA ALTERAÇÃO **
        }).join('');

        const isToday = day === todayDate; // Verifica se é o dia de hoje (apenas se for o mês/ano atual)
        dayCellsHtml += `
            <div class="bg-white p-1 border-t border-gray-200 min-h-[100px] flex flex-col overflow-hidden relative">
                 <div class="text-right text-xs font-semibold ${isToday ? 'bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center ml-auto' : ''}">${day}</div>
                 <div class="flex-grow overflow-y-auto text-left space-y-1"> <!-- Permite scroll interno --!>
                    ${agendamentosHtml}
                 </div>
            </div>`;
    }

    // Completa a grade para ter sempre 5 ou 6 linhas cheias (35 ou 42 células) para visual consistente
    const totalCellsFilled = firstDayOfMonth + daysInMonth;
    const infoForRemaining = totalCellsFilled % 7;
    const remainingCells = infoForRemaining === 0 ? 0 : 7 - infoForRemaining;

    // Adicione linhas extras se a grade estiver muito curta (opcional, mas bom para uniformidade visual)
    // Se total + remaining < 35, adiciona mais 7 (mas o cálculo acima já fecha a linha atual)
    // Opcional: forçar 6 linhas sempre? 
    // Vamos apenas garantir que fecha a semana atual corretamente.

    for (let i = 0; i < remainingCells; i++) {
        dayCellsHtml += `<div class="bg-gray-50 border-t border-gray-200 min-h-[100px]"></div>`;
    }

    calendarGrid.innerHTML = headerHtml + dayCellsHtml;
}


// Abre o modal para criar ou editar agendamento
export function openAgendamentoModal(agendamento) {
    const { permissions, id: currentUserId } = appState.currentUser;
    const isEditing = agendamento !== null;

    // --- ALTERAÇÃO: Verifica se 'usuarios_associados' contém o ID atual ---
    // Converte currentUserId para string para comparação segura, pois os IDs no array podem ser strings vindas do PHP
    const currentUserIdStr = String(currentUserId);
    const isOwnerOrAssociated = isEditing && (agendamento.criado_por_id == currentUserId || (Array.isArray(agendamento.usuarios_associados) && agendamento.usuarios_associados.includes(currentUserIdStr)));
    // Permite editar se for Gestor/Analista/Comercial OU se for o dono OU se estiver associado
    const canCurrentUserEdit = permissions.canEditSchedule || (permissions.canCreateSchedule && isOwnerOrAssociated);

    const data = agendamento || {};
    const title = isEditing ? (canCurrentUserEdit ? 'Editar Agendamento' : 'Detalhes do Agendamento') : 'Novo Agendamento';
    const isDisabled = isEditing && !canCurrentUserEdit ? 'disabled' : '';

    // --- ALTERAÇÃO: Gera lista de checkboxes em vez de options ---
    const userCheckboxes = appState.users
        .filter(user => user.status === 'Ativo') // Filtra apenas usuários ativos
        .map(user => `
            <label class="flex items-center space-x-2 py-1 px-2 hover:bg-gray-50 rounded cursor-pointer">
                <input type="checkbox" name="para_usuario_ids[]" value="${user.id}" class="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 user-select-checkbox">
                <span class="text-sm text-gray-700">${user.nome}</span>
            </label>
        `)
        .join('');

    const tipoOptions = ['Reunião', 'Treinamento', 'Visita', 'Ligação', 'Controle de Entrega', 'Outro']
        .map(tipo => `<option value="${tipo}" ${data.tipo === tipo ? 'selected' : ''}>${tipo}</option>`)
        .join('');
    const opportunityOptions = appState.opportunities
        .map(opp => `<option value="${opp.id}" ${data.oportunidade_id == opp.id ? 'selected' : ''}>${opp.titulo} - ${opp.organizacao_nome || opp.cliente_pf_nome || 'N/A'}</option>`)
        .join('');

    // Extrai data e hora de data_inicio (se existir)
    let dataAgendamento = '';
    let horaAgendamento = '';
    if (data.data_inicio) {
        try {
            // Tenta criar Data assumindo que a string do BD está em formato reconhecível (ex: YYYY-MM-DD HH:MM:SS)
            // Força interpretação local dividindo a string
            const parts = data.data_inicio.split(/[- :]/);
            if (parts.length >= 5) {
                // Constrói Data como UTC para evitar problemas de fuso, depois ajusta para local
                // const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]));
                // Usa construtor que interpreta como local
                const localDate = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4]);

                // Formata para input type="date" (YYYY-MM-DD)
                dataAgendamento = localDate.getFullYear() + '-' + String(localDate.getMonth() + 1).padStart(2, '0') + '-' + String(localDate.getDate()).padStart(2, '0');
                // Formata para input type="time" (HH:MM)
                horaAgendamento = String(localDate.getHours()).padStart(2, '0') + ':' + String(localDate.getMinutes()).padStart(2, '0');

            } else { throw new Error("Formato de data inválido"); }

        } catch (e) {
            console.error("Erro ao parsear data_inicio:", data.data_inicio, e);
            // Mantém vazio se houver erro
        }
    }

    let dataEntrega = data.data_entrega ? data.data_entrega : '';

    // --- ALTERAÇÃO: Substitui Select por Container de Checkboxes com Scroll ---
    const content = `
        <form id="modal-form" class="space-y-4">
            <input type="hidden" name="id" value="${data.id || ''}">
            <div><label class="form-label">Título*</label><input type="text" name="titulo" required class="form-input" value="${data.titulo || ''}" ${isDisabled}></div>
            <div class="grid grid-cols-2 gap-4">
                <div><label class="form-label">Data*</label><input type="date" name="data_agendamento" required class="form-input" value="${dataAgendamento}" ${isDisabled}></div>
                <div><label class="form-label">Hora*</label><input type="time" name="hora_agendamento" required class="form-input" value="${horaAgendamento}" ${isDisabled}></div>
            </div>
            <div class="grid grid-cols-1 gap-4"> <!-- Ajustado para 1 coluna -->
                <div><label class="form-label">Tipo*</label><select name="tipo" id="modal-tipo" required class="form-input" ${isDisabled}>${tipoOptions}</select></div>
                <div id="data-entrega-container" class="${data.tipo === 'Controle de Entrega' ? '' : 'hidden'}">
                    <label class="form-label">Data de Entrega*</label>
                    <input type="date" name="data_entrega" id="modal-data-entrega" class="form-input" value="${dataEntrega}" ${isDisabled}>
                </div>
                <div>
                     <label class="form-label">Direcionar para*</label>
                     <!-- Container Scrollable para Checkboxes -->
                     <div class="border border-gray-300 rounded-md p-2 max-h-48 overflow-y-auto bg-white" id="user-selection-container">
                        ${userCheckboxes}
                     </div>
                     <p class="text-xs text-gray-500 mt-1">Marque as pessoas que participarão.</p>
                </div>
            </div>

            <div>
                <label class="form-label">Associar à Oportunidade</label>
                <select name="oportunidade_id" class="form-input" ${isDisabled}>
                    <option value="">Nenhuma</option>
                    ${opportunityOptions}
                </select>
            </div>

            <div><label class="form-label">Observações</label><textarea name="observacoes" rows="3" class="form-input" ${isDisabled}>${data.descricao || ''}</textarea></div>
        </form>
        ${isEditing && canCurrentUserEdit ? `
        <div class="mt-4 pt-4 border-t">
             <button type="button" id="delete-agendamento-btn" class="btn btn-danger">Excluir Agendamento</button>
        </div>` : ''}
        `;

    const showSaveButton = (!isEditing && permissions.canCreateSchedule) || (isEditing && canCurrentUserEdit);

    renderModal(title, content, async (form) => {
        if (!form.reportValidity()) return; // Validação HTML5

        // Validação adicional se for Controle de Entrega
        const tipoInput = form.querySelector('[name="tipo"]').value;
        const dataEntregaInput = form.querySelector('[name="data_entrega"]').value;
        if (tipoInput === 'Controle de Entrega' && !dataEntregaInput) {
            showToast("A Data de Entrega é obrigatória para o tipo Controle de Entrega.", "error");
            return;
        }

        const formData = new FormData(form);
        const dataToSend = Object.fromEntries(formData.entries());

        // --- ALTERAÇÃO: Pega o array de IDs dos checkboxes ---
        const selectedUserIds = formData.getAll('para_usuario_ids[]');
        dataToSend.para_usuario_ids = selectedUserIds; // Adiciona o array
        // Remove a chave antiga do FormData se existir (importante!)
        delete dataToSend['para_usuario_ids[]'];

        // Validação extra: Garante que pelo menos um usuário foi selecionado
        if (selectedUserIds.length === 0) {
            showToast("Selecione pelo menos um usuário para direcionar.", "error");
            // Foca no container para indicar o erro
            const containerElement = form.querySelector('#user-selection-container');
            if (containerElement) {
                containerElement.scrollIntoView({ behavior: 'smooth' });
                containerElement.classList.add('border-red-500', 'ring-1', 'ring-red-500'); // Adiciona borda vermelha
                setTimeout(() => containerElement.classList.remove('border-red-500', 'ring-1', 'ring-red-500'), 2000); // Remove após 2s
            }
            return;
        }


        try {
            showLoading(true); // Mostra loading antes da chamada API
            const result = await apiCall(isEditing ? 'update_agendamento' : 'create_agendamento', { method: 'POST', body: JSON.stringify(dataToSend) });
            // Não precisa mais mexer no 'saved' aqui

            // --- ALTERAÇÃO: Atualiza estado global e força recarregamento ---
            if (dataToSend.tipo === 'Controle de Entrega' && !isEditing) {
                // Pop-up específico quando for Controle de Entrega recém-criado
                Swal.fire({
                    title: 'Controle de Entrega Criado!',
                    text: 'A oportunidade associada foi movida para a coluna "Controle de Entrega" no Funil de Vendas. Um alerta de entrega foi agendado.',
                    icon: 'success',
                    confirmButtonText: 'Entendi'
                }).then(async () => {
                    closeModal();
                    await initializeApp();
                });
            } else {
                showToast(`Agendamento ${isEditing ? 'atualizado' : 'criado'}! Recarregando dados...`, 'info');
                closeModal(); // Fecha o modal antes de recarregar
                await initializeApp(); // Recarrega todos os dados do app
            }
            // A view da agenda será re-renderizada automaticamente pelo initializeApp se for a view ativa

        } catch (error) {
            console.error("Erro ao salvar agendamento:", error);
            // showToast já é chamado pelo apiCall em caso de erro
        } finally {
            showLoading(false); // Esconde loading após a chamada (sucesso ou erro)
        }
    }, 'Salvar', `btn-primary ${!showSaveButton ? 'hidden' : ''}`);

    // --- ALTERAÇÃO: Listener para show/hide Data de Entrega ---
    const tipoSelect = document.getElementById('modal-tipo');
    const dataEntregaContainer = document.getElementById('data-entrega-container');
    const dataEntregaInput = document.getElementById('modal-data-entrega');

    if (tipoSelect) {
        tipoSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Controle de Entrega') {
                dataEntregaContainer.classList.remove('hidden');
                dataEntregaInput.required = true;
            } else {
                dataEntregaContainer.classList.add('hidden');
                dataEntregaInput.required = false;
                dataEntregaInput.value = ''; // clears when hiding
            }
        });
    }

    // --- ALTERAÇÃO: Pré-seleciona checkboxes ao editar ---
    // Verifica se 'usuarios_associados' existe e é um array
    if (isEditing && Array.isArray(data.usuarios_associados)) {
        const checkboxes = document.querySelectorAll('input[name="para_usuario_ids[]"]');
        if (checkboxes) {
            // Converte IDs associados para string para comparação segura
            const associatedIds = data.usuarios_associados.map(String);
            checkboxes.forEach(chk => {
                if (associatedIds.includes(chk.value)) {
                    chk.checked = true;
                }
            });
        }
    }


    // Adiciona listener para o botão de excluir (sem alterações aqui)
    const deleteBtn = document.getElementById('delete-agendamento-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            Swal.fire({
                title: 'Tem certeza?',
                text: `Você tem certeza que deseja excluir o agendamento "${data.titulo}"?`,
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
                        text: 'Aguarde, atualizando agenda...',
                        allowOutsideClick: false,
                        didOpen: () => { Swal.showLoading(); }
                    });
                    try {
                        await apiCall('delete_agendamento', { method: 'POST', body: JSON.stringify({ id: data.id }) });
                        closeModal(); // Fecha o modal de edição
                        await initializeApp(); // Recarrega tudo
                        Swal.fire('Excluído!', 'Agendamento excluído com sucesso.', 'success');
                    } catch (error) {
                        Swal.fire('Erro!', 'Ocorreu um erro ao excluir.', 'error');
                    }
                }
            });
        });
    }
}
