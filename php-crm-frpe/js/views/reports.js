import { apiCall } from '../api.js';
import { formatCurrency as formatCurrencyUtil, showToast, showLoading } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';

let appState = {};
let chartInstance = null;

// ─── ETAPAS FIXAS POR TIPO DE RELATÓRIO ──────────────────────────────────────
const ETAPAS_FUNIL_VENDAS = [
    { value: 'Prospectando', label: 'Prospectando' },
    { value: 'Contato', label: 'Contato' },
    { value: 'Negociação', label: 'Negociação' },
    { value: 'Proposta', label: 'Proposta' },
    { value: 'Fechado', label: 'Fechado' },
    { value: 'Controle de Entrega', label: 'Controle de Entrega' },
    { value: 'Pós-venda', label: 'Pós-venda' },
    { value: 'Recusado', label: 'Recusado' },
];

const ETAPAS_FUNIL_FORNECEDORES = [
    { value: 'BRASIL MEDICA', label: 'BRASIL MEDICA' },
    { value: 'HEALTH', label: 'HEALTH' },
    { value: 'INSTRAMED', label: 'INSTRAMED' },
    { value: 'LIVANOVA', label: 'LIVANOVA' },
    { value: 'MASIMO', label: 'MASIMO' },
    { value: 'MERIL', label: 'MERIL' },
    { value: 'MICROMED', label: 'MICROMED' },
    { value: 'NIPRO', label: 'NIPRO' },
    { value: 'SIGMAFIX', label: 'SIGMAFIX' },
];

const ETAPAS_FUNIL_LICITACOES = [
    { value: 'Captação de Edital', label: 'Captação de Edital' },
    { value: 'Acolhimento de propostas', label: 'Acolhimento de propostas' },
    { value: 'Em análise Técnica', label: 'Em análise Técnica' },
    { value: 'Homologado', label: 'Homologado' },
    { value: 'Ata/Carona', label: 'Ata/Carona' },
    { value: 'Empenhado', label: 'Empenhado' },
    { value: 'Contrato', label: 'Contrato' },
    { value: 'Desclassificado', label: 'Desclassificado' },
    { value: 'Fracassado', label: 'Fracassado' },
    { value: 'Revogado', label: 'Revogado' },
    { value: 'Anulado', label: 'Anulado' },
    { value: 'Suspenso', label: 'Suspenso' },
];

const FORNECEDORES_FIXOS = [
    { value: 'BRASIL MEDICA', label: 'BRASIL MEDICA' },
    { value: 'HEALTH', label: 'HEALTH' },
    { value: 'INSTRAMED', label: 'INSTRAMED' },
    { value: 'LIVANOVA', label: 'LIVANOVA' },
    { value: 'MASIMO', label: 'MASIMO' },
    { value: 'MERIL', label: 'MERIL' },
    { value: 'MICROMED', label: 'MICROMED' },
    { value: 'NIPRO', label: 'NIPRO' },
    { value: 'SIGMAFIX', label: 'SIGMAFIX' },
];

export async function renderReportsView(state) {
    if (state) appState = state;
    const currentYear = new Date().getFullYear();
    const currentUser = appState.currentUser || {};
    const isAdminOrAnalyst = ['Gestor', 'Analista', 'Admin'].includes(currentUser.role);

    const viewContainer = document.getElementById('reports-view');
    viewContainer.innerHTML = `
        <div id="reports-module-container" class="flex flex-col min-h-screen bg-gray-50 text-gray-900">
            <!-- Professional BI Header & Tabs -->
            <div class="bg-white border-b no-print">
                <div class="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                            <i class="fas fa-chart-line mr-2 text-indigo-600"></i>Gestão de Performance & BI
                        </h2>
                        <p class="text-sm text-gray-500">Monitoramento estratégico e análise de resultados</p>
                    </div>
                </div>
                
                <div class="px-6 flex space-x-8 overflow-x-auto">
                    <button class="report-tab active whitespace-nowrap py-4 border-b-2 border-transparent" data-tab="bi-dashboard">
                        <i class="fas fa-th-large mr-2"></i>Dashboard BI
                    </button>
                    <button class="report-tab whitespace-nowrap py-4 border-b-2 border-transparent" data-tab="detailed-reports">
                        <i class="fas fa-list-alt mr-2"></i>Relatórios Detalhes
                    </button>
                    ${isAdminOrAnalyst ? `
                    <button class="report-tab whitespace-nowrap py-4 border-b-2 border-transparent" data-tab="performance-mgmt">
                        <i class="fas fa-calculator mr-2"></i>Metas e Comissões
                    </button>` : ''}
                </div>
            </div>

            <div id="report-tab-content" class="p-4 md:p-6 flex-1">
                <!-- Tab contents injected here -->
            </div>

            <!-- Global Modals -->
            <div id="targets-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                 <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-4/5 shadow-lg rounded-md bg-white">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">Definir Metas</h3>
                        <button class="close-modal"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="mb-4">
                         <label class="block text-sm font-bold mb-1">Fornecedor</label>
                         <select id="target-supplier-select" class="border p-2 w-full rounded"></select>
                    </div>
                    <div id="targets-grid-container" class="overflow-x-auto mb-4"></div>
                    <div class="flex justify-end space-x-2">
                        <button class="close-modal btn bg-gray-300">Cancelar</button>
                        <button id="save-targets-btn" class="btn bg-green-600 text-white">Salvar</button>
                    </div>
                </div>
            </div>
            <button id="set-targets-btn" class="hidden"></button>
        </div>

        <style>
            #reports-module-container { --glass: rgba(255, 255, 255, 0.7); --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
            
            #reports-module-container .report-tab {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                font-weight: 600; color: #94a3b8;
                padding: 1rem 1.5rem; position: relative;
            }
            #reports-module-container .report-tab:hover { color: #6366f1; }
            #reports-module-container .report-tab.active { color: #4f46e5; }
            #reports-module-container .report-tab.active::after {
                content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
                background: linear-gradient(90deg, #4f46e5, #818cf8); border-radius: 3px;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn { from { width: 0; left: 50%; } to { width: 100%; left: 0; } }

            #reports-module-container .filter-card {
                background: white; padding: 1rem; border-radius: 1.25rem;
                border: 1px solid #f1f5f9; box-shadow: var(--shadow-sm);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            #reports-module-container .filter-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
            #reports-module-container .filter-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; margin-bottom: 0.5rem; }
            #reports-module-container .filter-label i { margin-right: 0.5rem; color: #4f46e5; opacity: 0.6; }

            #reports-module-container .seller-card {
                min-width: 220px; flex: 1; min-height: 100px;
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 1.25rem; border-radius: 1.25rem; border: 1px solid #e2e8f0;
                display: flex; align-items: center; gap: 1rem;
                box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s;
            }
            #reports-module-container .seller-card:hover { border-color: #818cf8; transform: scale(1.02); }
            #reports-module-container .seller-avatar {
                width: 48px; height: 48px; border-radius: 50%;
                background: #f1f5f9; display: flex; align-items: center; justify-content: center;
                font-weight: 900; color: #4f46e5; font-size: 1.25rem; border: 2px solid #eef2ff;
            }

            #reports-module-container .custom-date-row { display: flex; gap: 0.5rem; align-items: center; width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; padding: 0.25rem 0.5rem; border-radius: 0.75rem; }
            #reports-module-container .custom-date-item {
                flex: 1; background: transparent; border: none; padding: 0.4rem 0.2rem;
                font-size: 0.75rem; font-weight: 700; color: #334155;
                outline: none; cursor: pointer; transition: all 0.2s;
            }
            #reports-module-container .custom-date-item:hover { color: #4f46e5; }

            #reports-module-container .multiselect-dropdown { width: 100%; position: relative; }
            #reports-module-container .multiselect-button {
                width: 100%; display: flex; align-items: center; justify-content: space-between;
                padding: 0.6rem 0.8rem; background: #f8fafc; border: 1px solid #e2e8f0;
                border-radius: 0.75rem; font-size: 0.75rem; font-weight: 600; color: #334155;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
            }
            #reports-module-container .multiselect-button:hover { border-color: #818cf8; background: white; }
            #reports-module-container .multiselect-list {
                position: absolute; top: calc(100% + 5px); left: 0; right: 0;
                background: white; border: 1px solid #e2e8f0; border-radius: 1rem;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); z-index: 50;
                display: none; flex-direction: column; max-height: 300px;
            }
            #reports-module-container .multiselect-list.show { display: flex; }
            #reports-module-container .multiselect-item {
                display: flex; align-items: center; padding: 0.6rem 0.8rem; gap: 0.6rem;
                cursor: pointer; transition: background 0.2s;
            }
            #reports-module-container .multiselect-item:hover { background: #f1f5f9; }
            #reports-module-container .multiselect-item input[type="checkbox"] {
                width: 1rem; height: 1rem; border-radius: 4px; border: 2px solid #cbd5e1;
                cursor: pointer; accent-color: #4f46e5;
            }

            #reports-module-container .kpi-card {
                background: white; border: 1px solid #f1f5f9; border-radius: 1.5rem;
                padding: 1.5rem; box-shadow: var(--shadow-sm); transition: all 0.3s;
            }
            #reports-module-container .kpi-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); }

            #reports-module-container .bento-grid { display: grid; gap: 1.5rem; }
            @media (min-width: 768px) {
                #reports-module-container .bento-grid { grid-template-columns: repeat(3, 1fr); }
                #reports-module-container .col-span-2 { grid-column: span 2 / span 2; }
                #reports-module-container .col-span-3 { grid-column: span 3 / span 3; }
            }

            @media print {
                .no-print { display: none !important; }
                #reports-module-container { background: white !important; }
                #main-content { padding: 0 !important; margin: 0 !important; }
            }

            .clickable-proposal-link {
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .clickable-proposal-link:hover {
                background-color: #eef2ff;
                padding-left: 4px;
                padding-right: 4px;
                margin-left: -4px;
                margin-right: -4px;
                border-radius: 4px;
            }
        </style>
    `;

    document.querySelectorAll('.report-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.tab;
            document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            switchReportView(target);
        });
    });

    // Delegated click event for proposal drill-down
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.clickable-proposal-link');
        if (link) {
            const proposalId = link.dataset.proposalId;
            // Check if ID is valid (not null, undefined, or the string "null")
            if (proposalId && proposalId !== 'null' && proposalId !== 'undefined' && proposalId !== '') {
                openProposalDetailsModal(proposalId);
            } else {
                showToast('Esta é uma venda direta importada e não possui uma proposta detalhada no CRM.', 'info');
            }
        }
    });

    switchReportView('bi-dashboard');
}

async function switchReportView(tab) {
    const container = document.getElementById('report-tab-content');
    container.innerHTML = `<div class="flex justify-center p-20"><i class="fas fa-spinner fa-spin text-4xl text-indigo-600"></i></div>`;

    switch (tab) {
        case 'bi-dashboard': renderBIDashboard(container); break;
        case 'detailed-reports': renderDetailedReports(container); break;
        case 'performance-mgmt': renderPerformanceMgmt(container); break;
    }
}

async function renderBIDashboard(container) {
    const currentYear = new Date().getFullYear();
    container.innerHTML = `
        <div class="bento-grid">
            <div class="kpi-card bg-indigo-600 !text-black !p-7 shadow-indigo-200 shadow-xl border-none">
                <div class="flex flex-col">
                    <p class="text-[10px] font-black uppercase text-green-900 tracking-widest opacity-70 mb-1">Total Vendido ${currentYear}</p>
                    <h3 id="bi-sales-total" class="text-3xl font-black mb-4">R$ 0,00</h3>
                    <div class="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                        <div class="bg-white h-full" style="width: 75%"></div>
                    </div>
                </div>
            </div>

            <div class="kpi-card !p-7 group hover:bg-slate-50">
                <div class="flex flex-col">
                    <p class="text-[10px] font-black uppercase text-blue-600 mb-1">Aprovado no Mês</p>
                    <h3 id="bi-month-sales" class="text-3xl font-black text-slate-800">R$ 0,00</h3>
                    <p class="text-xs text-slate-400 mt-2 flex items-center">
                        <i class="fas fa-arrow-up text-emerald-500 mr-1"></i> <span class="font-bold text-slate-600">+12%</span> em relação ao mês anterior
                    </p>
                </div>
            </div>

            <div class="kpi-card !p-7">
                <div class="flex flex-col">
                    <p class="text-[10px] font-black uppercase text-rose-600 mb-1">Perdas de Oportunidades</p>
                    <h3 id="bi-lost-total" class="text-3xl font-black text-slate-800">R$ 0,00</h3>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mt-2">Valor acumulado no ano</p>
                </div>
            </div>

            <div class="kpi-card !bg-emerald-50 border-emerald-100 flex items-center justify-between">
                <div>
                    <h3 id="bi-bids-count" class="text-4xl font-black text-emerald-700">0</h3>
                    <p class="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Licitações Ativas</p>
                </div>
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <i class="fas fa-gavel text-2xl text-emerald-500"></i>
                </div>
            </div>

            <div class="col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm overflow-hidden relative">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h4 class="font-black text-slate-800 text-sm uppercase">Performance por Vendedor</h4>
                        <p class="text-[10px] text-slate-500">Mês de ${new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())}</p>
                    </div>
                </div>
                <div id="bi-top-sellers" class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    <div class="flex items-center justify-center p-10 w-full text-slate-300 font-bold">
                        <i class="fas fa-spinner fa-spin mr-2"></i> Analisando resultados...
                    </div>
                </div>
            </div>

            <div class="col-span-2 bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <div class="flex justify-between items-center mb-8">
                     <h4 class="font-black text-slate-800 uppercase tracking-wider">Evolução de Mercado</h4>
                     <div class="flex gap-2">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-indigo-50 text-indigo-600">Vendas</span>
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500">Metas</span>
                     </div>
                </div>
                <div class="h-80 w-full"><canvas id="bi-main-chart"></canvas></div>
            </div>

            <div class="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm flex flex-col justify-center">
                 <h4 class="font-black text-slate-800 uppercase tracking-widest text-center mb-6">Mix de Fornecedores</h4>
                 <div class="h-64 w-full relative"><canvas id="bi-supplier-chart"></canvas></div>
            </div>
        </div>
    `;

    try {
        const [kpiData, chartData] = await Promise.all([
            apiCall('get_report_data', { params: { report_type: 'bi_kpis', start_date: `${currentYear}-01-01` } }),
            apiCall('get_report_data', { params: { report_type: 'sales_vs_goals', start_date: `${currentYear}-01-01` } })
        ]);

        if (kpiData.success) {
            document.getElementById('bi-sales-total').innerText = formatCurrencyUtil(kpiData.total_sales || 0);
            document.getElementById('bi-month-sales').innerText = formatCurrencyUtil(kpiData.month_sales || 0);
            document.getElementById('bi-lost-total').innerText = formatCurrencyUtil(kpiData.lost_sales || 0);
            document.getElementById('bi-bids-count').innerText = kpiData.active_bids || 0;

            const sellerContainer = document.getElementById('bi-top-sellers');
            if (sellerContainer && kpiData.sales_by_vendedor) {
                sellerContainer.innerHTML = kpiData.sales_by_vendedor.map(s => {
                    const initials = s.vendedor.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return `
                        <div class="seller-card">
                            <div class="seller-avatar">${initials}</div>
                            <div class="flex flex-col">
                                <span class="text-xs font-black text-slate-800 uppercase truncate w-32" title="${s.vendedor}">${s.vendedor}</span>
                                <span class="text-sm font-bold text-indigo-600">${formatCurrencyUtil(s.total)}</span>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Vendas Aprovadas</span>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        if (chartData.success) {
            const ctx = document.getElementById('bi-main-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [
                        { label: 'Realizado', data: chartData.sales, backgroundColor: 'rgba(79, 70, 229, 0.1)', borderColor: '#4f46e5', borderWidth: 3, fill: true, tension: 0.4 },
                        { label: 'Meta', data: chartData.goals, borderColor: '#10b981', borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.1 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { y: { beginAtZero: true, ticks: { callback: v => 'R$ ' + v.toLocaleString() } } }
                }
            });
        }

        const ctxSup = document.getElementById('bi-supplier-chart').getContext('2d');
        const salesBySup = await apiCall('get_report_data', { params: { report_type: 'by_supplier', start_date: `${currentYear}-01-01` } });
        if (Array.isArray(salesBySup)) {
            new Chart(ctxSup, {
                type: 'doughnut',
                data: {
                    labels: salesBySup.slice(0, 5).map(s => s.label),
                    datasets: [{ data: salesBySup.slice(0, 5).map(s => s.value), backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'] }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }
            });
        }
    } catch (e) {
        console.error("Dashboard error:", e);
    }
}

async function renderPerformanceMgmt(container) {
    const currentYear = new Date().getFullYear();
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    container.innerHTML = `
        <div class="flex flex-col space-y-6">

            <!-- HEADER BANNER: Título e Controles -->
            <div class="bg-[#206a9b] rounded-[2rem] p-8 text-white shadow-2xl no-print overflow-hidden relative">
                <div class="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
                <div class="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>
                
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                    <!-- Title Section -->
                    <div class="flex items-center gap-6">
                        <div class="bg-indigo-950/40 p-5 rounded-3xl backdrop-blur-md border border-indigo-400/30 shadow-inner">
                            <i class="fas fa-calculator text-3xl"></i>
                        </div>
                        <div>
                            <h3 class="text-2xl font-black tracking-tight">Performance Financeira</h3>
                            <p class="text-indigo-200/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">Gestão de metas e comissões por vendedor</p>
                        </div>
                    </div>

                    <!-- Controls Section -->
                    <div class="flex flex-wrap items-center gap-4 bg-white/10 p-3 rounded-[1.5rem] backdrop-blur-xl border border-white/10 shadow-2xl">
                        
                        <!-- Dates -->
                        <div class="flex items-center gap-2 bg-indigo-950/40 rounded-xl px-4 py-2 border border-white/5">
                            <div class="flex flex-col">
                                <span class="text-indigo-300 text-[9px] font-black uppercase">Início</span>
                                <input type="date" id="perf-start-date"
                                    class="bg-transparent border-none text-white text-xs font-bold cursor-pointer outline-none focus:ring-0 w-28 p-0"
                                    value="${new Date(currentYear, new Date().getMonth(), 1).toISOString().slice(0, 10)}">
                            </div>
                            <div class="h-6 w-[1px] bg-white/10 mx-1"></div>
                            <div class="flex flex-col">
                                <span class="text-indigo-300 text-[9px] font-black uppercase">Fim</span>
                                <input type="date" id="perf-end-date"
                                    class="bg-transparent border-none text-white text-xs font-bold cursor-pointer outline-none focus:ring-0 w-28 p-0"
                                    value="${new Date(currentYear, new Date().getMonth() + 1, 0).toISOString().slice(0, 10)}">
                            </div>
                        </div>

                        <div class="h-10 w-[1px] bg-white/10 hidden md:block"></div>

                        <!-- Buttons -->
                        <div class="flex gap-2">
                            <button id="load-performance-btn" class="bg-indigo-500 hover:bg-indigo-400 text-white px-6 h-11 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 group">
                                <i class="fas fa-bolt group-hover:animate-pulse"></i> PROCESSAR
                            </button>
                            <button id="export-performance-btn" class="bg-emerald-500 hover:bg-emerald-400 text-white px-5 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center active:scale-95 shadow-lg">
                                <i class="fas fa-file-pdf mr-2"></i>Exportar
                            </button>
                            <button id="config-targets-btn" class="bg-amber-500 hover:bg-amber-400 text-white px-5 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center active:scale-95 shadow-lg">
                                <i class="fas fa-cog mr-2"></i>Config. Metas
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RESULTADOS: PLANILHA ABAIXO DOS BOTÕES -->
            <div id="performance-output" class="min-h-[400px]">
                <div class="bg-white rounded-[2rem] p-20 text-center text-gray-300 border border-dashed border-gray-200 shadow-sm">
                    <i class="fas fa-chart-bar text-7xl mb-6 opacity-10"></i>
                    <p class="font-bold text-gray-400 max-w-sm mx-auto">
                        Clique no botão <strong class="text-indigo-600">⚡ PROCESSAR</strong> para carregar os dados de vendas e comissões do período selecionado.
                    </p>
                </div>
            </div>

            <!-- MODAL CONFIG -->
            <div id="config-metas-panel" class="hidden fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-4">
                <div id="config-panel-backdrop" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-7xl max-h-[85vh] overflow-y-auto z-10 flex flex-col">
                    <div class="sticky top-0 bg-white rounded-t-[2rem] z-10 border-b border-gray-100 px-8 py-5 flex justify-between items-center">
                        <h4 class="font-black text-gray-800 text-lg flex items-center gap-2">
                            <i class="fas fa-sliders-h text-indigo-500"></i> Configurar Metas e Comissões
                        </h4>
                        <button id="close-config-panel" class="text-gray-400 hover:text-gray-600 w-9 h-9 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center text-lg"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="px-8 py-6 space-y-8 flex-1">
                        <div class="flex items-center gap-3">
                            <label class="text-xs font-black text-gray-500 uppercase">Ano Base:</label>
                            <input type="number" id="config-meta-year" class="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold w-24 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" value="${currentYear}">
                            <button id="reload-forn-metas-btn" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"><i class="fas fa-sync-alt mr-1"></i> Recarregar</button>
                        </div>
                        <div>
                            <h5 class="text-sm font-black text-indigo-700 uppercase tracking-wider mb-3 flex items-center gap-2"><i class="fas fa-users"></i> Metas e Comissões por Vendedor</h5>
                            <div class="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                                <table class="w-full text-sm border-collapse">
                                    <thead>
                                        <tr class="bg-indigo-600 text-white text-xs uppercase font-black tracking-widest"><th class="px-5 py-3 text-left">Vendedor</th><th class="px-5 py-3 text-right">Meta (R$)</th><th class="px-5 py-3 text-right">Fixo (R$)</th><th class="px-5 py-3 text-right">% Com.</th><th class="px-5 py-3 text-center">Ativo</th><th class="px-5 py-3 text-center">Ações</th></tr>
                                    </thead>
                                    <tbody id="config-metas-body" class="divide-y divide-gray-100"></tbody>
                                    <tfoot><tr><td colspan="6" class="p-4 bg-gray-50/50"><button id="add-vendedor-meta-btn" class="text-indigo-600 hover:text-indigo-800 text-xs font-black flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all border border-indigo-100 bg-white shadow-sm"><i class="fas fa-plus-circle"></i> ADICIONAR VENDEDOR</button></td></tr></tfoot>
                                </table>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-4">
                                <h5 class="text-sm font-black text-emerald-700 uppercase tracking-wider flex items-center gap-2"><i class="fas fa-building"></i> Metas por Fornecedor / Estados</h5>
                                <button id="add-forn-btn" class="text-emerald-600 hover:text-emerald-800 text-xs font-black flex items-center gap-2 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all border border-emerald-100 bg-white shadow-sm"><i class="fas fa-plus-circle"></i> NOVO FORNECEDOR</button>
                            </div>
                            <div id="fornecedor-estados-container" class="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
                        </div>
                    </div>
                    <div class="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-[2rem]">
                        <button id="close-config-panel-2" class="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-bold transition-colors">Cancelar</button>
                        <button id="save-config-metas-btn" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2"><i class="fas fa-save"></i> SALVAR CONFIGURAÇÕES</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Event Listeners
    document.getElementById('load-performance-btn').onclick = async () => {
        const startDate = document.getElementById('perf-start-date').value;
        const endDate = document.getElementById('perf-end-date').value;
        if (!startDate || !endDate) {
            showInfoModal({ icon: 'fa-calendar-alt', iconColor: 'text-amber-500', iconBg: 'bg-amber-50', title: 'Período inválido', message: 'Selecione o período antes de processar.', btnText: 'OK', btnColor: 'bg-amber-500 hover:bg-amber-600' });
            return;
        }
        await loadPerformanceData(null, startDate, endDate);
    };

    document.getElementById('export-performance-btn').onclick = () => {
        const output = document.getElementById('performance-output');
        if (!output || !output.querySelector('table')) {
            showInfoModal({ icon: 'fa-file-pdf', iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50', title: 'Sem dados', message: 'Processe os dados primeiro.', btnText: 'OK', btnColor: 'bg-emerald-500 hover:bg-emerald-600' });
            return;
        }
        exportToPDF();
    };

    document.getElementById('config-targets-btn').onclick = function () {
        const panel = document.getElementById('config-metas-panel');
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            loadUsuariosOptions().then(function () {
                loadConfigMetasPanel();
                loadFornecedorMetasPanel();
            });
        }
    };

    document.getElementById('close-config-panel').onclick = () => document.getElementById('config-metas-panel').classList.add('hidden');
    document.getElementById('close-config-panel-2').onclick = () => document.getElementById('config-metas-panel').classList.add('hidden');
    document.getElementById('config-panel-backdrop').onclick = () => document.getElementById('config-metas-panel').classList.add('hidden');
    document.getElementById('save-config-metas-btn').onclick = saveConfigMetas;
    document.getElementById('add-vendedor-meta-btn').onclick = () => addVendedorMetaRow();
    document.getElementById('reload-forn-metas-btn')?.addEventListener('click', loadFornecedorMetasPanel);
}

// ─── CARREGA PAINEL CONFIG ────────────────────────────────────────────────────
async function loadConfigMetasPanel() {
    const tbody = document.getElementById('config-metas-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    // Garante que usuários estejam carregados
    if (!window._usuariosOptions) {
        await loadUsuariosOptions();
    }

    try {
        const res = await apiCall('get_commission_config');
        const configs = (res && res.success) ? (res.data || []) : [];

        if (configs.length === 0) {
            // Linha vazia para começar
            addVendedorMetaRow();
        } else {
            configs.forEach(c => addVendedorMetaRow(c));
        }
    } catch (e) {
        console.error('Erro ao carregar config metas:', e);
        addVendedorMetaRow();
    }
}

async function loadFornecedorMetasPanel() {
    const container = document.getElementById('fornecedor-estados-container');
    if (!container) return;

    const currentYear = document.getElementById('config-meta-year')?.value || new Date().getFullYear();
    const storageKey = 'crm_fornecedores_estados_v2';
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    container.innerHTML = `<div class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i></div>`;

    // Estrutura salva: { "BRASIL MEDICA": { estados: ["PE","PB","AL"], metas: { 1: 100000, ... } } }
    let savedData = {};
    try {
        const res = await apiCall('get_supplier_targets_all', { params: { year: currentYear } });
        if (res && res.success) savedData = res.data || {};
    } catch (e) { }

    // Config local de fornecedores e seus estados
    let fornConfig = JSON.parse(localStorage.getItem(storageKey) || 'null') ||
        (FORNECEDORES_FIXOS || []).map(f => ({ nome: f.value || f.label || f, estados: ['PE', 'PB', 'AL'] }));

    const renderAll = () => {
        container.innerHTML = '';

        if (fornConfig.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
                <i class="fas fa-building text-4xl mb-3"></i>
                <p class="font-bold">Nenhum fornecedor cadastrado</p>
                <p class="text-xs mt-1">Clique em "Adicionar Fornecedor" acima</p>
            </div>`;
            return;
        }

        fornConfig.forEach((forn, idx) => {
            const fornKey = forn.nome;
            const estados = forn.estados || [];
            const metasForn = savedData[fornKey] || {};

            // Calcula totais por mês
            const totalAnual = Object.values(metasForn).reduce((a, b) => {
                if (typeof b === 'object') return a + Object.values(b).reduce((x, y) => x + (parseFloat(y) || 0), 0);
                return a + (parseFloat(b) || 0);
            }, 0);

            const card = document.createElement('div');
            card.className = 'border border-emerald-100 rounded-2xl overflow-hidden shadow-sm';
            card.dataset.idx = idx;

            // Cabeçalho do card
            const headerHtml = `
                <div class="bg-emerald-50 border-b border-emerald-100 px-5 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                            ${fornKey}
                        </div>
                        <div class="flex flex-wrap gap-1 items-center" id="estados-tags-${idx}">
                            ${estados.map(uf => `
                                <span class="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 estado-tag" data-forn-idx="${idx}" data-uf="${uf}">
                                    ${uf}
                                    <button type="button" class="btn-remove-estado-tag hover:text-red-500 transition-colors" data-forn-idx="${idx}" data-uf="${uf}">
                                        <i class="fas fa-times text-[9px]"></i>
                                    </button>
                                </span>
                            `).join('')}
                            <button type="button" class="btn-add-estado-tag text-blue-500 hover:text-blue-700 text-[10px] font-bold hover:bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 transition-colors" data-forn-idx="${idx}">
                                <i class="fas fa-plus mr-1"></i>Estado
                            </button>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs text-gray-500 font-mono">
                            Total Anual: <strong class="text-emerald-700 forn-anual-total-${idx}">${totalAnual > 0 ? formatCurrency(totalAnual) : 'R$ 0,00'}</strong>
                        </span>
                        <button type="button" class="btn-remove-forn text-gray-300 hover:text-red-500 transition-colors text-sm" data-idx="${idx}" title="Remover fornecedor">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            `;

            // Tabela de metas mensais + distribuição por estado
            let tableHtml = `
                <div class="overflow-x-auto">
                    <table class="w-full text-xs border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-500 font-black uppercase text-[10px]">
                                <th class="px-4 py-2 text-left min-w-[120px] border-r border-gray-100">Estado / Mês</th>
                                ${months.map((m, i) => `<th class="px-2 py-2 text-right min-w-[80px]">${m}</th>`).join('')}
                                <th class="px-3 py-2 text-right min-w-[100px] bg-gray-100 border-l border-gray-200">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
            `;

            // Linha TOTAL do fornecedor (meta geral)
            tableHtml += `
                <tr class="bg-emerald-50/60 font-bold">
                    <td class="px-4 py-2 text-emerald-700 font-black text-[11px] border-r border-gray-100">
                        <i class="fas fa-chart-line mr-1 text-[9px]"></i> META GERAL
                    </td>
                    ${Array.from({ length: 12 }, (_, i) => {
                const val = (typeof metasForn[i + 1] === 'object')
                    ? Object.values(metasForn[i + 1]).reduce((a, b) => a + (parseFloat(b) || 0), 0)
                    : (parseFloat(metasForn[i + 1]) || 0);
                return `<td class="px-2 py-2 text-right font-mono text-emerald-700 forn-meta-geral-${idx}-${i + 1}">
                            ${val > 0 ? formatCurrency(val) : '<span class="text-gray-300">-</span>'}
                        </td>`;
            }).join('')}
                    <td class="px-3 py-2 text-right font-black text-emerald-800 bg-emerald-100/50 border-l border-emerald-200 font-mono forn-total-geral-${idx}">
                        ${totalAnual > 0 ? formatCurrency(totalAnual) : '-'}
                    </td>
                </tr>
            `;

            // Linhas por estado
            estados.forEach(uf => {
                const metasUF = (typeof metasForn[1] === 'object')
                    ? Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, (metasForn[i + 1] || {})[uf] || 0]))
                    : {};
                const totalUF = Object.values(metasUF).reduce((a, b) => a + (parseFloat(b) || 0), 0);

                tableHtml += `
                    <tr class="hover:bg-blue-50/20 transition-colors group">
                        <td class="px-4 py-2 border-r border-gray-100">
                            <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black text-[11px]">${uf}</span>
                        </td>
                        ${Array.from({ length: 12 }, (_, i) => {
                    const v = metasUF[i + 1] || 0;
                    return `<td class="px-1 py-1 text-right">
                                <input type="text" class="estado-forn-input currency-input w-full text-right text-[11px] font-mono border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 focus:ring-1 rounded px-1 py-0.5 outline-none transition-all"
                                    data-forn="${fornKey}" data-uf="${uf}" data-month="${i + 1}"
                                    value="${v > 0 ? formatCurrency(v) : ''}" placeholder="-">
                            </td>`;
                }).join('')}
                        <td class="px-3 py-2 text-right font-black text-blue-700 bg-blue-50/30 border-l border-gray-100 font-mono uf-total-${idx}-${uf}">
                            ${totalUF > 0 ? formatCurrency(totalUF) : '-'}
                        </td>
                    </tr>
                `;
            });

            tableHtml += `</tbody></table></div>`;

            card.innerHTML = headerHtml + tableHtml;
            container.appendChild(card);

            // Eventos inputs
            card.querySelectorAll('.estado-forn-input').forEach(inp => {
                inp.addEventListener('focus', function () { this.select(); });
                inp.addEventListener('blur', function () {
                    const v = parseCurrency(this.value);
                    this.value = v > 0 ? formatCurrency(v) : '';
                    recalcFornTotals(card, fornKey, idx, fornConfig[idx].estados);
                });
            });

            // Botão remover fornecedor
            card.querySelector('.btn-remove-forn').addEventListener('click', function () {
                if (confirm(`Remover fornecedor "${fornKey}"?`)) {
                    fornConfig.splice(idx, 1);
                    localStorage.setItem(storageKey, JSON.stringify(fornConfig));
                    renderAll();
                }
            });

            // Botão adicionar estado
            card.querySelector('.btn-add-estado-tag').addEventListener('click', function () {
                const uf = prompt('Sigla do estado (ex: SP, RJ, MG):');
                if (uf && uf.trim().length >= 2) {
                    const key = uf.trim().toUpperCase().substring(0, 2);
                    if (fornConfig[idx].estados.includes(key)) { showToast('Estado já vinculado.', 'warning'); return; }
                    fornConfig[idx].estados.push(key);
                    localStorage.setItem(storageKey, JSON.stringify(fornConfig));
                    renderAll();
                }
            });

            // Botões remover estado da tag
            card.querySelectorAll('.btn-remove-estado-tag').forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const uf = this.dataset.uf;
                    if (confirm(`Desvincular estado "${uf}" do fornecedor "${fornKey}"?`)) {
                        fornConfig[idx].estados = fornConfig[idx].estados.filter(x => x !== uf);
                        localStorage.setItem(storageKey, JSON.stringify(fornConfig));
                        renderAll();
                    }
                });
            });
        });
    };

    // Botão adicionar fornecedor
    const addFornBtn = document.getElementById('add-forn-btn');
    if (addFornBtn) {
        addFornBtn._handler && addFornBtn.removeEventListener('click', addFornBtn._handler);
        addFornBtn._handler = () => {
            const nome = prompt('Nome do fornecedor (ex: NOVA EMPRESA):');
            if (nome && nome.trim()) {
                const key = nome.trim().toUpperCase();
                if (fornConfig.find(f => f.nome === key)) { showToast('Fornecedor já existe.', 'warning'); return; }
                fornConfig.push({ nome: key, estados: [] });
                localStorage.setItem(storageKey, JSON.stringify(fornConfig));
                renderAll();
            }
        };
        addFornBtn.addEventListener('click', addFornBtn._handler);
    }

    renderAll();
    document.getElementById('reload-forn-metas-btn')?.addEventListener('click', loadFornecedorMetasPanel);
}

// ─── RECALCULA TOTAIS DO CARD ─────────────────────────────────────────────────
function recalcFornTotals(card, fornKey, idx, estados) {
    let grandTotal = 0;

    estados.forEach(uf => {
        let ufTotal = 0;
        card.querySelectorAll(`.estado-forn-input[data-uf="${uf}"]`).forEach(inp => {
            ufTotal += parseCurrency(inp.value);
        });
        grandTotal += ufTotal;
        const ufEl = card.querySelector(`.uf-total-${idx}-${uf}`);
        if (ufEl) ufEl.textContent = ufTotal > 0 ? formatCurrency(ufTotal) : '-';
    });

    // Atualiza totais gerais por mês na linha META GERAL
    for (let m = 1; m <= 12; m++) {
        let mesTotal = 0;
        card.querySelectorAll(`.estado-forn-input[data-month="${m}"]`).forEach(inp => {
            mesTotal += parseCurrency(inp.value);
        });
        const mesEl = card.querySelector(`.forn-meta-geral-${idx}-${m}`);
        if (mesEl) mesEl.innerHTML = mesTotal > 0 ? formatCurrency(mesTotal) : '<span class="text-gray-300">-</span>';
    }

    const totalEl = card.querySelector(`.forn-total-geral-${idx}`);
    if (totalEl) totalEl.textContent = grandTotal > 0 ? formatCurrency(grandTotal) : '-';

    const anuaEl = document.querySelector(`.forn-anual-total-${idx}`);
    if (anuaEl) anuaEl.textContent = grandTotal > 0 ? formatCurrency(grandTotal) : 'R$ 0,00';
}

// ─── TABELA DE METAS POR ESTADO ───────────────────────────────────────────────
async function renderEstadoMetasPanel(savedData = {}, year = null) {
    const container = document.getElementById('estado-metas-body');
    if (!container) return;

    const storageKey = 'crm_estados_config';
    let estados = JSON.parse(localStorage.getItem(storageKey) || 'null') || ['PE', 'PB', 'AL', 'RN'];

    const savedEstados = savedData['__estados__'] || {};

    const renderRows = () => {
        container.innerHTML = '';
        estados.forEach(uf => {
            const saved = savedEstados[uf] || {};
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-blue-50/30 transition-colors group';

            let cells = '';
            for (let m = 1; m <= 12; m++) {
                const val = saved[m] || 0;
                cells += `<td class="border border-gray-100 p-1">
                    <input type="text" class="estado-meta-input currency-input w-full text-right text-xs font-mono border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 focus:ring-1 rounded px-1 py-1 outline-none"
                        data-uf="${uf}" data-month="${m}"
                        value="${val > 0 ? formatCurrency(val) : ''}" placeholder="-">
                </td>`;
            }
            const totalAnual = Object.values(saved).reduce((a, b) => a + (parseFloat(b) || 0), 0);
            tr.innerHTML = `
                <td class="px-3 py-2 text-xs font-black text-gray-700 whitespace-nowrap sticky left-0 bg-white group-hover:bg-blue-50/30 border-r border-gray-100">
                    <div class="flex items-center justify-between gap-2">
                        <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black">${uf}</span>
                        <button type="button" class="btn-remove-estado text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" data-uf="${uf}">
                            <i class="fas fa-trash-alt text-[10px]"></i>
                        </button>
                    </div>
                </td>
                ${cells}
                <td class="px-3 py-2 text-right text-xs font-black text-blue-700 estado-total-anual whitespace-nowrap bg-blue-50/50 border-l border-blue-100">
                    ${totalAnual > 0 ? formatCurrency(totalAnual) : '-'}
                </td>
            `;
            container.appendChild(tr);

            tr.querySelectorAll('.estado-meta-input').forEach(inp => {
                inp.addEventListener('focus', function () { this.select(); });
                inp.addEventListener('blur', function () {
                    const v = parseCurrency(this.value);
                    this.value = v > 0 ? formatCurrency(v) : '';
                    let sum = 0;
                    tr.querySelectorAll('.estado-meta-input').forEach(i => sum += parseCurrency(i.value));
                    tr.querySelector('.estado-total-anual').innerText = sum > 0 ? formatCurrency(sum) : '-';
                });
            });

            tr.querySelector('.btn-remove-estado').addEventListener('click', function () {
                const u = this.dataset.uf;
                if (confirm(`Remover estado "${u}"?`)) {
                    estados = estados.filter(x => x !== u);
                    localStorage.setItem(storageKey, JSON.stringify(estados));
                    tr.remove();
                }
            });
        });
    };

    renderRows();

    document.getElementById('add-estado-btn')?.addEventListener('click', () => {
        const uf = prompt('Sigla do estado (ex: SP):');
        if (uf && uf.trim().length >= 2) {
            const key = uf.trim().toUpperCase().substring(0, 2);
            if (estados.includes(key)) { showToast('Estado já existe.', 'warning'); return; }
            estados.push(key);
            localStorage.setItem(storageKey, JSON.stringify(estados));
            renderRows();
        }
    });
}

async function saveConfigMetas() {
    const rows = document.querySelectorAll('#config-metas-body tr');
    const vendedorData = [];

    rows.forEach(tr => {
        const uid = tr.querySelector('.config-meta-user')?.value;
        if (!uid) return;
        vendedorData.push({
            usuario_id: uid,
            meta_mensal: parseCurrency(tr.querySelector('.config-meta-mensal')?.value),
            salario_fixo: parseCurrency(tr.querySelector('.config-meta-fixo')?.value),
            percentual_comissao: parseFloat(tr.querySelector('.config-meta-pct')?.value) || 1,
            ativo: tr.querySelector('.config-meta-ativo')?.checked ? 1 : 0,
        });
    });

    // Coleta metas por fornecedor/estado
    const fornecedorMetas = {};
    document.querySelectorAll('.estado-forn-input').forEach(inp => {
        const forn = inp.dataset.forn;
        const uf = inp.dataset.uf;
        const month = inp.dataset.month;
        const val = parseCurrency(inp.value);
        if (!fornecedorMetas[forn]) fornecedorMetas[forn] = {};
        if (!fornecedorMetas[forn][month]) fornecedorMetas[forn][month] = {};
        fornecedorMetas[forn][month][uf] = val;
    });

    const year = document.getElementById('config-meta-year')?.value || new Date().getFullYear();

    showLoading(true);
    try {
        const res = await apiCall('save_commission_config', {
            method: 'POST',
            body: JSON.stringify({
                configs: vendedorData,
                fornecedor_metas: fornecedorMetas,
                year: year
            })
        });

        if (res && res.success) {
            showToast('Configurações salvas com sucesso!', 'success');
            document.getElementById('config-metas-panel').classList.add('hidden');
        } else {
            showToast((res && res.error) || 'Erro ao salvar', 'error');
        }
    } catch (e) {
        showToast('Erro de conexão: ' + e.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadUsuariosOptions() {
    try {
        // Usa appState local do módulo (populado em renderReportsView)
        let users = [];

        if (appState && appState.users && appState.users.length > 0) {
            users = appState.users;
        } else {
            // Fallback: busca todos os usuários via get_data
            try {
                const data = await apiCall('get_data');
                if (data && data.users && data.users.length > 0) {
                    users = data.users;
                }
            } catch (fallbackErr) {
                console.warn('Fallback get_data falhou:', fallbackErr);
            }
        }

        window.usuariosList = users;
        window._usuariosOptions = users.map(u =>
            `<option value="${u.id}">${u.nome || u.name}</option>`
        ).join('');

        console.log('Usuários carregados:', users);
        return users;

    } catch (e) {
        console.error('Erro ao carregar usuários', e);
        window.usuariosList = [];
        window._usuariosOptions = '';
        return [];
    }
}

function addVendedorMetaRow(data = {}) {
    const idx = Date.now();
    const tbody = document.getElementById('config-metas-body');
    if (!tbody) return;

    // Garante opções atualizadas no momento da criação
    const opts = window._usuariosOptions || '<option value="">Nenhum usuário</option>';

    const tr = document.createElement('tr');
    tr.className = 'hover:bg-indigo-50 transition-colors group';
    tr.innerHTML = `
        <td class="px-4 py-3">
            <select id="sel-${idx}" name="usuario_id_${idx}"
                class="config-meta-user border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full
                       text-gray-800 bg-white focus:ring-2 focus:ring-indigo-500">
                <option value="">Selecione...</option>
                ${opts}
            </select>
        </td>
        <td class="px-4 py-3">
            <input type="text" id="meta-${idx}" name="meta_mensal_${idx}"
                class="config-meta-mensal currency-input border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full text-gray-800 bg-white"
                placeholder="0,00" value="${data.meta_mensal > 0 ? formatCurrency(data.meta_mensal) : ''}">
        </td>
        <td class="px-4 py-3">
            <input type="text" id="fixo-${idx}" name="salario_fixo_${idx}"
                class="config-meta-fixo currency-input border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-full text-gray-800 bg-white"
                placeholder="0,00" value="${data.salario_fixo > 0 ? formatCurrency(data.salario_fixo) : ''}">
        </td>
        <td class="px-4 py-3">
            <div class="flex items-center gap-1">
                <input type="number" id="pct-${idx}" name="pct_${idx}"
                    class="config-meta-pct border border-gray-200 rounded-lg px-2 py-1.5 text-sm w-16 text-gray-800 bg-white"
                    placeholder="1" value="${data.percentual_comissao || 1}" min="0" max="100" step="0.1">
                <span class="text-gray-400 text-xs font-bold">%</span>
            </div>
        </td>
        <td class="px-4 py-3 text-center">
            <div class="flex items-center justify-center gap-2">
                <input type="checkbox" id="ativo-${idx}"
                    class="config-meta-ativo w-4 h-4 rounded accent-indigo-600"
                    ${(data.ativo == null || data.ativo == 1) ? 'checked' : ''}>
                <button type="button"
                    class="remove-meta-row opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                    onclick="this.closest('tr').remove()" title="Remover">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        </td>
    `;

    tbody.appendChild(tr);

    // Eventos para formatação de moeda
    tr.querySelectorAll('.currency-input').forEach(inp => {
        inp.addEventListener('focus', function () { this.select(); });
        inp.addEventListener('blur', function () {
            const v = parseCurrency(this.value);
            this.value = v > 0 ? formatCurrency(v) : '';
        });
    });

    // Seleciona o usuário correto se vier de dados já salvos
    if (data.usuario_id) {
        const sel = tr.querySelector(`#sel-${idx}`);
        if (sel) sel.value = String(data.usuario_id);
    }
}



// ─── TABELA DE RESULTADO (BASEADA NO MODELO DA IMAGEM) ───────────────────────
function renderPerformanceTable(container, data) {
    const format = v => formatCurrencyUtil(v || 0);

    let grandMeta = 0, grandVendas = 0, grandFixo = 0, grandComissao = 0, grandDif = 0, grandTotal = 0;

    const rows = data.map((row, i) => {
        const meta = parseFloat(row.meta_mensal) || 0;
        const vendas = parseFloat(row.total_vendas) || 0;
        const fixo = parseFloat(row.salario_fixo) || 0;
        const pct = parseFloat(row.percentual_comissao) || 1;
        const comissao = vendas * (pct / 100);
        const diferenca = vendas - meta;
        const trimestre = parseFloat(row.total_trimestre) || 0;
        const total = fixo + comissao;

        grandMeta += meta;
        grandVendas += vendas;
        grandFixo += fixo;
        grandComissao += comissao;
        grandDif += diferenca;
        grandTotal += total;

        const difClass = diferenca >= 0 ? 'text-green-600' : 'text-red-600';
        const comClass = 'text-green-600';
        const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

        return `
            <tr class="${rowBg} hover:bg-indigo-50/40 transition-colors">
                <td class="px-5 py-3 text-sm font-bold text-gray-800">${row.nome}</td>
                <td class="px-5 py-3 text-sm text-right text-gray-600 font-mono">${format(meta)}</td>
                <td class="px-5 py-3 text-sm text-right font-black text-gray-900 font-mono">${format(vendas)}</td>
                <td class="px-5 py-3 text-sm text-right text-gray-600 font-mono">${format(fixo)}</td>
                <td class="px-5 py-3 text-sm text-right ${comClass} font-bold font-mono">${format(comissao)} <span class="text-[10px] text-gray-400">(${pct}%)</span></td>
                <td class="px-5 py-3 text-sm text-right ${difClass} font-bold font-mono">${diferenca >= 0 ? '' : ''}${format(diferenca)}</td>
                <td class="px-5 py-3 text-sm text-right text-indigo-600 font-mono">${trimestre > 0 ? format(trimestre) : '-'}</td>
                <td class="px-5 py-3 text-sm text-right font-black text-gray-900 bg-indigo-50/60 font-mono">${format(total)}</td>
            </tr>
        `;
    }).join('');

    const grandDifClass = grandDif >= 0 ? 'text-green-600' : 'text-red-600';

    container.innerHTML = `
        <div class="overflow-x-auto rounded-[2rem] shadow-sm">
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr class="bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider">
                        <th class="px-5 py-4 text-left rounded-tl-2xl min-w-[180px]">Vendedor</th>
                        <th class="px-5 py-4 text-right">Meta</th>
                        <th class="px-5 py-4 text-right">Vendas</th>
                        <th class="px-5 py-4 text-right">Fixo (R$)</th>
                        <th class="px-5 py-4 text-right">Comissão</th>
                        <th class="px-5 py-4 text-right">Diferença</th>
                        <th class="px-5 py-4 text-right">Trimestre</th>
                        <th class="px-5 py-4 text-right rounded-tr-2xl bg-indigo-700">Valor a Pagar</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    ${rows}
                </tbody>
                <tfoot>
                    <tr class="bg-gray-100 border-t-2 border-indigo-200 font-black text-sm">
                        <td class="px-5 py-4 text-gray-700 uppercase tracking-wider">TOTAIS</td>
                        <td class="px-5 py-4 text-right text-gray-700 font-mono">${format(grandMeta)}</td>
                        <td class="px-5 py-4 text-right text-gray-900 font-mono">${format(grandVendas)}</td>
                        <td class="px-5 py-4 text-right text-gray-700 font-mono">${format(grandFixo)}</td>
                        <td class="px-5 py-4 text-right text-green-700 font-mono">${format(grandComissao)}</td>
                        <td class="px-5 py-4 text-right ${grandDifClass} font-mono">${format(grandDif)}</td>
                        <td class="px-5 py-4 text-right text-indigo-600 font-mono">-</td>
                        <td class="px-5 py-4 text-right text-indigo-800 bg-indigo-100 font-mono">${format(grandTotal)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
}

// ─── RENDER DETAILED REPORTS ─────────────────────────────────────────────────
function renderDetailedReports(container) {
    container.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-sm mb-6 no-print border border-gray-100">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-800">Relatórios Analíticos</h3>
                    <p class="text-sm text-gray-500">Filtre dados por fornecedor, vendedor e geografia.</p>
                </div>
                <div class="flex space-x-2 mt-2 md:mt-0 w-full md:w-auto">
                    <button id="toggle-filters-btn" class="btn btn-secondary text-sm px-4">
                        <i class="fas fa-filter mr-2"></i> Filtros
                    </button>
                </div>
            </div>

            <div id="reports-filters-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-all">

                <!-- TIPO DE RELATÓRIO -->
                <div class="filter-card border-l-4 border-l-indigo-500">
                    <div class="filter-label"><i class="fas fa-file-invoice"></i>Tipo de Relatório</div>
                    <select id="report-type" class="w-full bg-slate-50 border-none text-sm font-bold focus:ring-0 cursor-pointer">
                        <optgroup label="── Vendas ──">
                            <option value="sales">Vendas Gerais</option>
                            <option value="vendor_detail">Vendas por Vendedor</option>
                            <option value="funnel">Funil de Vendas</option>
                            <option value="forecast">Forecast (Previsão)</option>
                            <option value="clients">Ranking de Clientes (Curva ABC)</option>
                            <option value="products">Vendas por Produto</option>
                            <option value="lost_reasons">Propostas Recusadas</option>
                        </optgroup>
                        <optgroup label="── Fornecedores ──">
                            <option value="supplier_funnel">Meta Fornecedores</option>
                        </optgroup>
                        <optgroup label="── Licitações ──">
                            <option value="licitacoes_funnel">Funil de Licitações</option>
                        </optgroup>
                        <optgroup label="── Financeiro ──">
                            <option value="contratos">Contratos</option>
                            <option value="billing">Faturamento</option>
                        </optgroup>
                    </select>
                </div>

                <!-- PERÍODO -->
                <div class="filter-card border-l-4 border-l-blue-400">
                    <div class="filter-label"><i class="fas fa-calendar-alt"></i>Período de Análise</div>
                    <div class="custom-date-row">
                        <input type="date" id="filter-start-date" class="custom-date-item">
                        <span class="text-slate-300">→</span>
                        <input type="date" id="filter-end-date" class="custom-date-item">
                    </div>
                </div>

                <!-- FORNECEDOR -->
                <div class="filter-card border-l-4 border-l-emerald-400">
                    <div class="filter-label"><i class="fas fa-building"></i>Fornecedor</div>
                    <div id="filter-supplier-container"></div>
                </div>

                <!-- VENDEDOR -->
                <div class="filter-card border-l-4 border-l-violet-400">
                    <div class="filter-label"><i class="fas fa-user-tie"></i>Vendedor</div>
                    <div id="filter-user-container"></div>
                </div>

                <!-- CLIENTE -->
                <div class="filter-card border-l-4 border-l-amber-400">
                    <div class="filter-label"><i class="fas fa-hospital"></i>Cliente</div>
                    <div id="filter-client-container"></div>
                </div>

                <!-- ESTADO (UF) -->
                <div class="filter-card border-l-4 border-l-rose-400">
                    <div class="filter-label"><i class="fas fa-map-marker-alt"></i>Estado (UF)</div>
                    <div id="filter-uf-container"></div>
                </div>

                <!-- BOTÃO GERAR -->
                <div class="flex items-end">
                     <button id="refresh-report-btn" class="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black uppercase text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                         <i class="fas fa-rocket"></i> Gerar Relatório
                     </button>
                </div>

                <!-- EXPORTAÇÃO -->
                <div class="flex items-end gap-2">
                     <button id="export-excel-btn" class="flex-1 bg-emerald-50 text-emerald-700 py-3.5 rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center justify-center gap-2" title="Excel"><i class="fas fa-file-excel"></i> Excel</button>
                     <button id="print-report-btn" class="flex-1 bg-rose-50 text-rose-700 py-3.5 rounded-2xl font-black uppercase text-[10px] hover:bg-rose-100 transition-all border border-rose-100 flex items-center justify-center gap-2" title="PDF"><i class="fas fa-file-pdf"></i> PDF</button>
                </div>

                <!-- ETAPA (dinâmica por tipo) -->
                <div class="filter-card border-l-4 border-l-indigo-300 lg:col-span-2" id="filter-etapa-card">
                    <div class="filter-label"><i class="fas fa-tasks"></i><span id="filter-etapa-label">Etapa</span></div>
                    <div id="filter-etapa-container" class="w-full"></div>
                </div>


            </div>

            <div id="active-filters-pills" class="flex flex-wrap gap-2 mt-4 hidden w-full"></div>
        </div>

        <div id="chart-container-wrapper" class="bg-white p-6 rounded-xl shadow-sm mb-6 hidden no-print border border-gray-100">
            <h4 class="font-bold text-gray-700 mb-4">Evolução de Vendas</h4>
            <div class="h-80 w-full"><canvas id="sales-chart"></canvas></div>
        </div>

        <div id="reports-output-area" class="print-container">
            <div id="report-loading" class="text-center p-20 hidden">
                <i class="fas fa-spinner fa-spin text-5xl text-indigo-600"></i>
            </div>
            <div id="report-content" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="p-20 text-center text-gray-400">
                    <i class="fas fa-chart-bar text-6xl mb-4 opacity-20"></i>
                    <p>Selecione os parâmetros acima e clique em <strong>Gerar Relatório</strong>.</p>
                </div>
            </div>
        </div>
    `;

    // Datas padrão: início e fim do ano corrente
    const currentYear = new Date().getFullYear();
    document.getElementById('filter-start-date').value = `${currentYear}-01-01`;
    document.getElementById('filter-end-date').value = `${currentYear}-12-31`;

    // Eventos
    document.getElementById('refresh-report-btn').addEventListener('click', loadReportData);
    document.getElementById('print-report-btn').addEventListener('click', () => exportToPDF());
    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('toggle-filters-btn').addEventListener('click', () => {
        document.getElementById('reports-filters-container').classList.toggle('hidden');
    });

    // Atualiza etapas ao trocar tipo de relatório
    document.getElementById('report-type').addEventListener('change', () => {
        updateEtapaFilter();
    });

    populateFilters();
    updateEtapaFilter(); // Popula etapas conforme tipo padrão
    setupModalLinks();
    restoreFilters();
}

// ─── ATUALIZA FILTRO DE ETAPAS CONFORME TIPO DE RELATÓRIO ────────────────────
function updateEtapaFilter() {
    const type = document.getElementById('report-type')?.value;
    const labelEl = document.getElementById('filter-etapa-label');
    const cardEl = document.getElementById('filter-etapa-card');

    let etapas = [];
    let labelText = 'Etapa';
    let visible = true;

    switch (type) {
        case 'funnel':
            etapas = ETAPAS_FUNIL_VENDAS;
            labelText = 'Etapa do Funil de Vendas';
            break;
        case 'supplier_funnel':
            etapas = ETAPAS_FUNIL_FORNECEDORES;
            labelText = 'Fornecedor (Funil)';
            break;
        case 'licitacoes_funnel':
            etapas = ETAPAS_FUNIL_LICITACOES;
            labelText = 'Etapa da Licitação';
            break;
        case 'sales':
        case 'contratos':
        case 'forecast':
        case 'clients':
        case 'products':
        case 'lost_reasons':
        default:
            // Para relatórios gerais, usa etapas do appState (dinâmico) ou oculta
            const stages = appState.stages || [];
            if (stages.length > 0) {
                etapas = stages.map(s => ({ value: s.id, label: s.nome }));
                labelText = 'Etapa';
            } else {
                visible = false;
            }
            break;
    }

    if (labelEl) labelEl.innerText = labelText;
    if (cardEl) cardEl.classList.toggle('hidden', !visible);

    renderMultiSelect('filter-etapa-container', 'etapa-select', etapas, 'Todas as Etapas');
}

function restoreFilters() {
    try {
        const saved = localStorage.getItem('reports_filters');
        if (!saved) return;
        const f = JSON.parse(saved);

        if (f.type) {
            document.getElementById('report-type').value = f.type;
            updateEtapaFilter();
        }
        if (f.start) document.getElementById('filter-start-date').value = f.start;
        if (f.end) document.getElementById('filter-end-date').value = f.end;

        const restoreMulti = (id, values) => {
            if (!values || !Array.isArray(values)) return;
            document.querySelectorAll(`.${id}-checkbox`).forEach(chk => {
                chk.checked = values.includes(chk.value);
            });
            const btn = document.getElementById(`${id}-btn`);
            const defaultText = btn?.getAttribute('data-default-text') || 'Selecionar';
            updateMultiSelectText(id, defaultText);
        };

        if (f.suppliers) restoreMulti('supplier-select', f.suppliers);
        if (f.users) restoreMulti('user-select', f.users);
        if (f.clients) restoreMulti('client-select', f.clients);
        if (f.etapas) restoreMulti('etapa-select', f.etapas);
        if (f.ufs) restoreMulti('uf-select', f.ufs);
        if (f.statuses) restoreMulti('status-select', f.statuses);
    } catch (e) { console.error("Erro ao restaurar filtros:", e); }
}

async function loadKPIData() {
    try {
        const response = await apiCall('get_report_kpis');
        if (response.success && response.kpis) {
            const { total_sales_year, lost_sales_year, active_bids } = response.kpis;
            const elTotal = document.getElementById('kpi-total-sales');
            if (elTotal) elTotal.innerText = formatCurrencyUtil(total_sales_year);
            const elLost = document.getElementById('kpi-lost-sales');
            if (elLost) elLost.innerText = formatCurrencyUtil(lost_sales_year);
            const elBids = document.getElementById('kpi-active-bids');
            if (elBids) elBids.innerText = active_bids;
        }
    } catch (e) { console.error("Erro ao carregar KPIs:", e); }
}

let currentReportData = [];

function populateFilters() {
    // Fornecedores fixos
    renderMultiSelect('filter-supplier-container', 'supplier-select', FORNECEDORES_FIXOS, 'Todos os Fornecedores');

    // Vendedores (do appState)
    const users = appState.users || [];
    const sellers = users.filter(u => ['Vendedor', 'Representante', 'Comercial', 'Gestor', 'Analista'].includes(u.role));
    renderMultiSelect('filter-user-container', 'user-select', sellers.map(u => ({ value: u.id, label: u.nome })), 'Todos os Vendedores');

    // Clientes (Org + PF)
    const clients = [];
    appState.organizations?.forEach(o => clients.push({ value: 'org-' + o.id, label: o.nome_fantasia || o.razao_social || 'Org ' + o.id }));
    appState.clients_pf?.forEach(p => clients.push({ value: 'pf-' + p.id, label: p.nome || 'PF ' + p.id }));
    clients.sort((a, b) => a.label.localeCompare(b.label));
    renderMultiSelect('filter-client-container', 'client-select', clients, 'Todos os Clientes');

    // Estados UF (extraídos das organizações)
    const orgs = appState.organizations || [];
    const ufs = [...new Set(orgs.map(o => o.estado).filter(Boolean))].sort();
    renderMultiSelect('filter-uf-container', 'uf-select', ufs.map(uf => ({ value: uf, label: uf })), 'Todos os Estados');

    // Fecha dropdowns ao clicar fora
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.multiselect-dropdown')) {
            document.querySelectorAll('.multiselect-list').forEach(el => el.classList.remove('show'));
        }
    });
}

function renderMultiSelect(containerId, selectId, options, defaultText) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="multiselect-dropdown relative" id="${selectId}-wrapper">
            <button type="button" class="multiselect-button" onclick="toggleMultiSelect('${selectId}')" id="${selectId}-btn" data-default-text="${defaultText}">
                <span class="truncate block" id="${selectId}-text">${defaultText}</span>
                <i class="fas fa-chevron-down text-gray-400 text-xs ml-2"></i>
            </button>
            <div class="multiselect-list" id="${selectId}-list">
                <div class="p-2 border-b border-gray-100 flex flex-col gap-2 shrink-0">
                     <input type="text" placeholder="Pesquisar..." class="w-full text-xs p-1.5 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" oninput="filterMultiSelect('${selectId}', this.value)" onclick="event.stopPropagation()">
                     <div class="flex justify-between">
                         <button type="button" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium" onclick="toggleAllMultiSelect('${selectId}', true)">Marcar Todos</button>
                         <button type="button" class="text-xs text-gray-500 hover:text-gray-700" onclick="toggleAllMultiSelect('${selectId}', false)">Limpar</button>
                     </div>
                </div>
                <div class="overflow-y-auto max-h-48 flex-grow">
                    ${options.map(opt => `
                        <label class="multiselect-item" data-label="${opt.label.toLowerCase().replace(/"/g, '&quot;')}">
                            <input type="checkbox" value="${opt.value}" class="${selectId}-checkbox" onchange="updateMultiSelectText('${selectId}', '${defaultText}')">
                            <span class="text-sm text-gray-700">${opt.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

window.filterMultiSelect = function (id, term) {
    const list = document.getElementById(`${id}-list`);
    if (!list) return;
    const lowerTerm = term.toLowerCase();
    list.querySelectorAll('.multiselect-item').forEach(el => {
        el.style.display = (el.getAttribute('data-label') || '').includes(lowerTerm) ? 'flex' : 'none';
    });
};

window.toggleMultiSelect = function (id) {
    const list = document.getElementById(`${id}-list`);
    document.querySelectorAll('.multiselect-list').forEach(el => {
        if (el.id !== `${id}-list`) el.classList.remove('show');
    });
    list.classList.toggle('show');
};

window.toggleAllMultiSelect = function (id, selectAll) {
    document.querySelectorAll(`.${id}-checkbox`).forEach(cb => cb.checked = selectAll);
    const btn = document.getElementById(`${id}-btn`);
    updateMultiSelectText(id, btn?.getAttribute('data-default-text') || 'Selecionar');
};

window.updateMultiSelectText = function (id, defaultText) {
    const checked = document.querySelectorAll(`.${id}-checkbox:checked`);
    const total = document.querySelectorAll(`.${id}-checkbox`).length;
    const btnText = document.getElementById(`${id}-text`);
    if (!btnText) return;
    if (checked.length === 0 || checked.length === total) { btnText.innerText = defaultText; return; }
    if (checked.length === 1) { btnText.innerText = checked[0].nextElementSibling.innerText; return; }
    btnText.innerText = `${checked.length} selecionados`;
};

window.getMultiSelectValues = function (id) {
    const checked = document.querySelectorAll(`.${id}-checkbox:checked`);
    const total = document.querySelectorAll(`.${id}-checkbox`).length;
    if (checked.length === 0 || checked.length === total) return [];
    return Array.from(checked).map(cb => cb.value);
};

async function loadReportData() {
    const container = document.getElementById('report-content');
    const loading = document.getElementById('report-loading');

    const type = document.getElementById('report-type').value;
    const start = document.getElementById('filter-start-date').value;
    const end = document.getElementById('filter-end-date').value;

    const supplierIds = window.getMultiSelectValues('supplier-select');
    const userIds = window.getMultiSelectValues('user-select');
    const clientIds = window.getMultiSelectValues('client-select');
    const etapaIds = window.getMultiSelectValues('etapa-select');
    const ufIds = window.getMultiSelectValues('uf-select');

    // Salva filtros no localStorage para persistência
    const filterState = {
        type, start, end,
        suppliers: supplierIds, users: userIds, clients: clientIds,
        etapas: etapaIds, ufs: ufIds
    };

    updateFilterPills(type, start, end, supplierIds, userIds, clientIds, etapaIds, [], ufIds, []);

    localStorage.setItem('reports_filters', JSON.stringify(filterState));

    if (!start || !end) { showToast('Selecione o período.', 'warning'); return; }

    loading.classList.remove('hidden');
    container.innerHTML = '';

    try {
        const params = {
            report_type: type,
            start_date: start,
            end_date: end,
            supplier_id: supplierIds.join(','),
            user_id: userIds.join(','),
            cliente_id: clientIds.join(','),
            etapa_id: etapaIds.join(','),
            uf: ufIds.join(','),
        };
        const response = await apiCall('get_report_data', { params });
        if (!response.success) throw new Error(response.error);

        currentReportData = response.report_data || [];
        renderReports(currentReportData, container, type, start, end);
    } catch (error) {
        console.error("Erro:", error);
        container.innerHTML = `<div class="bg-red-50 p-4 border border-red-200 text-red-700 rounded text-center">Erro ao carregar relatório: ${error.message}</div>`;
    } finally {
        loading.classList.add('hidden');
    }
}

function renderReports(data, container, type, startStr, endStr) {
    // Relatórios com estrutura especial (não são arrays simples)
    if (type === 'vendor_detail') {
        document.getElementById('chart-container-wrapper')?.classList.add('hidden');
        const items = data.items || [];
        const activity = data.activity || [];
        if (activity.length === 0 && items.length === 0) {
            container.innerHTML = `<div class="bg-blue-50 p-8 border border-blue-200 text-blue-700 rounded text-center">Nenhum dado encontrado para o período.</div>`;
            return;
        }
        container.innerHTML = renderVendorDetailReport(items, activity);
        return;
    }
    if (type === 'billing') {
        document.getElementById('chart-container-wrapper')?.classList.add('hidden');
        const proposals = data.proposals || [];
        const kpis = data.kpis || {};
        if (proposals.length === 0) {
            container.innerHTML = `<div class="bg-blue-50 p-8 border border-blue-200 text-blue-700 rounded text-center">Nenhum dado encontrado para o período.</div>`;
            return;
        }
        container.innerHTML = renderBillingReport(proposals, kpis);
        return;
    }

    if (!data) data = [];
    if (!Array.isArray(data)) data = Object.values(data);

    if (data.length === 0) {
        container.innerHTML = `<div class="bg-blue-50 p-8 border border-blue-200 text-blue-700 rounded text-center">Nenhum dado encontrado para o período.</div>`;
        document.getElementById('chart-container-wrapper')?.classList.add('hidden');
        return;
    }

    const monthsRange = getMonthsBetween(startStr, endStr);
    renderSalesChart(data, monthsRange, type);

    switch (type) {
        case 'clients':
            container.innerHTML = renderClientsTable(data);
            return;
        case 'forecast':
            renderSalesChart(data, monthsRange, 'forecast');
            container.innerHTML = renderForecastTable(data);
            return;
        case 'funnel':
        case 'licitacoes_funnel':
            container.innerHTML = renderFunnelTable(data, type);
            return;
        case 'supplier_funnel':
            container.innerHTML = renderSupplierMetaCards(data);
            return;
        case 'contratos':
            container.innerHTML = renderContractsTable(data);
            return;
        case 'lost_reasons':
            container.innerHTML = renderLostReasonsTable(data);
            return;
        case 'products':
            data.forEach(group => {
                const wrapper = document.createElement('div');
                wrapper.className = "mb-8 bg-white shadow rounded-lg overflow-hidden";
                wrapper.innerHTML = `<div class="px-6 py-4 bg-blue-50 border-b"><h3 class="text-lg font-medium text-gray-900">${group.fornecedor_nome || 'Fornecedor'}</h3></div>`;
                const tableContainer = document.createElement('div');
                tableContainer.innerHTML = renderProductsTable(group.rows);
                wrapper.appendChild(tableContainer);
                container.appendChild(wrapper);
            });
            return;
        default: // sales + vendas gerais
            data.forEach(group => {
                const wrapper = document.createElement('div');
                wrapper.className = "mb-8 bg-white shadow rounded-lg overflow-hidden break-inside-avoid";
                const header = document.createElement('div');
                header.className = "px-6 py-4 bg-blue-50 border-b border-gray-200";
                header.innerHTML = `<h3 class="text-lg font-medium text-gray-900">${group.fornecedor_nome || 'Fornecedor'}</h3>`;
                wrapper.appendChild(header);
                const tableContainer = document.createElement('div');
                tableContainer.innerHTML = renderSalesTable(group, monthsRange) + (renderStateReport(group) || '');
                wrapper.appendChild(tableContainer);
                container.appendChild(wrapper);
            });
    }
}


// ─── RENDER FUNNEL (Vendas/Licitações) ───────────────────────────────────────
function renderFunnelTable(data, type) {
    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const title = type === 'licitacoes_funnel' ? 'Funil de Licitações (Pipeline)' : 'Funil de Vendas';
    
    // Calcula totais para KPIs
    const totalQty = data.reduce((acc, r) => acc + (parseInt(r.count) || 0), 0);
    const totalValue = data.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0);
    const maxQty = Math.max(...data.map(r => parseInt(r.count) || 1));

    const rows = data.map((r, i) => {
        const perc = maxQty > 0 ? (parseInt(r.count) / maxQty) * 100 : 0;
        const colorClass = i < 4 ? 'bg-indigo-600' : (i < 7 ? 'bg-indigo-400' : 'bg-slate-300');
        
        return `
        <div class="group relative bg-white p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md">
            <div class="flex justify-between items-end mb-3">
                <div class="flex flex-col">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Passo ${i + 1}</span>
                    <span class="text-sm font-black text-gray-800">${r.label}</span>
                </div>
                <div class="text-right">
                    <div class="text-lg font-black text-indigo-700 leading-none">${r.count} <span class="text-[10px] text-gray-400 font-bold uppercase">Ops</span></div>
                    <div class="text-[10px] font-bold text-gray-500 mt-1">${format(r.value)}</div>
                </div>
            </div>
            <!-- Progress Bar (Funnel) -->
            <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="${colorClass} h-full transition-all duration-1000 ease-out delay-[${i * 100}ms]" style="width: ${perc}%"></div>
            </div>
        </div>
        `;
    }).join('');

    return `
        <div class="space-y-8">
            <!-- Header & KPIs -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div>
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight">${title}</h2>
                    <p class="text-xs text-slate-500 font-medium">Distribuição de oportunidades por etapa estratégica.</p>
                </div>
                <div class="flex gap-4">
                    <div class="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pipeline Total</div>
                        <div class="text-xl font-black text-indigo-700">${format(totalValue)}</div>
                    </div>
                    <div class="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                        <div class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Volume de Ops</div>
                        <div class="text-xl font-black text-slate-800 text-center">${totalQty}</div>
                    </div>
                </div>
            </div>

            <!-- Funnel Content -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                ${rows}
            </div>

            <!-- Detailed Table (Optional display) -->
            <div class="mt-8 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h4 class="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
                        <i class="fas fa-list-ul text-indigo-500"></i> Detalhamento por Etapa
                    </h4>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead class="bg-slate-50/50">
                            <tr>
                                <th class="px-6 py-3 text-[10px] font-black text-gray-500 uppercase">Etapa do Funil</th>
                                <th class="px-6 py-3 text-[10px] font-black text-gray-500 uppercase text-center">Quantidade</th>
                                <th class="px-6 py-3 text-[10px] font-black text-gray-500 uppercase text-right">Valor Total Estimado</th>
                                <th class="px-6 py-3 text-[10px] font-black text-gray-500 uppercase text-center">Representação</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${data.map(r => {
        const percValue = totalValue > 0 ? (r.value / totalValue) * 100 : 0;
        return `
                                <tr class="hover:bg-indigo-50/20 transition-colors">
                                    <td class="px-6 py-4 text-xs font-bold text-gray-800">${r.label}</td>
                                    <td class="px-6 py-4 text-xs text-center font-bold text-gray-600">${r.count}</td>
                                    <td class="px-6 py-4 text-xs text-right font-bold text-indigo-600">${format(r.value)}</td>
                                    <td class="px-6 py-4 text-xs text-center">
                                        <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">${percValue.toFixed(1)}%</span>
                                    </td>
                                </tr>
                                `;
    }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

// ─── RENDER CONTRATOS (tabela simples) ───────────────────────────────────────
function renderContractsTable(data) {
    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    if (!data || data.length === 0) return `<div class="p-8 text-center text-gray-400">Nenhum contrato encontrado.</div>`;

    const rows = data.map(r => `
        <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">${r.numero_contrato || r.numero_edital || '-'}</td>
            <td class="px-4 py-3 text-sm text-gray-700">${r.cliente_nome || '-'}</td>
            <td class="px-4 py-3 text-sm text-gray-500">${r.fornecedor_nome || '-'}</td>
            <td class="px-4 py-3 text-sm text-gray-500">${r.vendedor_nome || '-'}</td>
            <td class="px-4 py-3 text-sm text-right font-bold text-gray-900">${format(r.valor_total || 0)}</td>
            <td class="px-4 py-3 text-sm text-center">
                <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">${r.status || 'Ativo'}</span>
            </td>
        </tr>
    `).join('');

    const total = data.reduce((acc, r) => acc + (parseFloat(r.valor_total) || 0), 0);

    return `
        <div class="mb-8 bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 bg-green-50 border-b border-green-100 flex justify-between items-center">
                <h3 class="font-bold text-green-700">Relatório de Contratos</h3>
                <span class="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">${data.length} contrato(s)</span>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nº Contrato</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">${rows}</tbody>
                    <tfoot class="bg-gray-100">
                        <tr>
                            <td colspan="4" class="px-4 py-3 text-sm font-bold text-right text-gray-900">TOTAL</td>
                            <td class="px-4 py-3 text-sm font-bold text-right text-gray-900">${format(total)}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

// ─── RENDER FUNNEL (Vendas / Fornecedores / Licitações) ──────────────────────

function renderSupplierMetaCards(data) {
    const format = v => formatCurrencyUtil(v || 0);

    if (!data || data.length === 0) {
        return `<div class="p-20 text-center text-gray-400">Nenhum dado de fornecedor encontrado.</div>`;
    }

    const cards = data.map(group => {
        const progress = Math.min(group.progress || 0, 100);
        const isHit = group.annual_total >= group.annual_goal;
        const diffText = isHit ? `+ ${format(group.diff)}` : `- ${format(Math.abs(group.diff))}`;
        const statusText = isHit ? 'Meta Anual Batida' : 'Falta para a Meta Anual';
        const colorClass = isHit ? 'text-emerald-600' : 'text-rose-600';
        const barColor = isHit ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-indigo-500';

        return `
            <div class="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 group relative">
                
                <div class="flex justify-between items-start mb-8">
                    <div class="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                         <i class="fas fa-calendar-check text-2xl"></i>
                    </div>
                    <div class="text-right">
                         <span class="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Faturamento Anual (YTD)</span>
                         <p class="text-2xl font-black text-slate-900 tracking-tighter">${format(group.annual_total)}</p>
                    </div>
                </div>

                <div class="mb-8">
                    <h4 class="text-lg font-black text-slate-800 uppercase tracking-tight truncate mb-1" title="${group.name}">${group.name}</h4>
                    <div class="flex items-center gap-2">
                        ${isHit ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-tighter">Excelente</span>` : ''}
                        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Acumulada</span>
                    </div>
                </div>

                <!-- Progress Section -->
                <div class="space-y-3 mb-10">
                    <div class="flex justify-between items-end">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso do Ano</span>
                        <span class="text-indigo-600 font-black text-sm">${group.progress}%</span>
                    </div>
                    <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                        <div class="${barColor} h-full rounded-full transition-all duration-1000" style="width: ${progress}%"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4 py-6 border-y border-slate-100 mb-6">
                    <div class="border-r border-slate-100 pr-2">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Meta Anual</span>
                        <p class="text-sm font-black text-slate-700 font-mono">${format(group.annual_goal)}</p>
                    </div>
                    <div>
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">${statusText}</span>
                        <p class="text-sm font-black ${colorClass} font-mono">${diffText}</p>
                    </div>
                </div>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Período selecionado</span>
                    <span class="text-xs font-black text-slate-800">${format(group.period_total)}</span>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="p-8 bg-slate-50/50 rounded-[3rem] mt-4">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div class="flex items-center gap-5">
                    <div class="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                        <i class="fas fa-chart-line text-2xl"></i>
                    </div>
                    <div>
                        <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Performance Estratégica (BI)</h3>
                        <p class="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-70">Comparativo Anual Acumulado vs Meta Consolidada</p>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${cards}
            </div>
        </div>
    `;
}



function renderSalesChart(data, monthsRange, type) {
    const ctx = document.getElementById('sales-chart');
    const container = document.getElementById('chart-container-wrapper');
    if (!ctx || !container) return;

    if (!['sales', 'contratos', 'clients', 'funnel', 'supplier_funnel', 'lost_reasons', 'forecast', 'licitacoes_funnel'].includes(type) || !data || data.length === 0) {
        container.classList.add('hidden');
        return;
    }
    container.classList.remove('hidden');
    if (chartInstance) { chartInstance.destroy(); }

    if (type === 'forecast') {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(r => r.mes),
                datasets: [
                    { label: 'Previsão Ponderada', data: data.map(r => parseFloat(r.forecast_ponderado) || 0), backgroundColor: 'rgba(124,58,237,0.6)', borderColor: 'rgba(124,58,237,1)', borderWidth: 1, order: 2 },
                    { type: 'line', label: 'Pipeline Total', data: data.map(r => parseFloat(r.pipeline_total) || 0), borderColor: 'rgba(156,163,175,1)', borderWidth: 2, borderDash: [5, 5], fill: false, tension: 0.1, order: 1 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: ctx => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ctx.parsed.y) } } } }
        });
        return;
    }

    if (type === 'lost_reasons') {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: data.map(r => r.motivo), datasets: [{ data: data.map(r => parseInt(r.qtd)), backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF'], hoverOffset: 4 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });
        return;
    }

    if (['funnel', 'supplier_funnel', 'licitacoes_funnel', 'contratos'].includes(type)) {
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(r => r.etapa_nome || r.fornecedor_nome),
                datasets: [{ label: 'Qtd', data: data.map(r => parseInt(r.qtd_oportunidades || 0)), backgroundColor: 'rgba(20,184,166,0.6)', borderColor: 'rgba(20,184,166,1)', borderWidth: 1 }]
            },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
        });
        return;
    }

    if (type === 'clients') {
        const top = data.slice(0, 10);
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top.map(c => c.cliente_nome),
                datasets: [
                    { type: 'bar', label: 'Faturamento', data: top.map(c => parseFloat(c.valor_total) || 0), backgroundColor: 'rgba(79,70,229,0.6)', yAxisID: 'y' },
                    { type: 'line', label: '% Acumulado', data: top.map(c => parseFloat(c.percentual_acumulado) || 0), borderColor: 'rgba(239,68,68,1)', borderWidth: 2, fill: false, yAxisID: 'y1' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { position: 'left' }, y1: { position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false } } } }
        });
        return;
    }

    // Sales padrão
    const labels = monthsRange.map(m => m.label);
    const monthKeys = monthsRange.map(m => m.key);
    const salesData = monthKeys.map(key => data.reduce((s, g) => s + (g.rows || []).reduce((a, r) => a + (parseFloat(r.dados_mes?.[key]?.venda) || 0), 0), 0));
    const goalsData = monthKeys.map(key => data.reduce((s, g) => s + (g.rows || []).reduce((a, r) => a + (parseFloat(r.dados_mes?.[key]?.meta) || 0), 0), 0));

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: 'Vendas Realizadas', data: salesData, borderColor: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', borderWidth: 2, tension: 0.1, fill: true },
                { label: 'Meta', data: goalsData, borderColor: '#DC2626', borderWidth: 2, borderDash: [5, 5], tension: 0.1, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' }, tooltip: { callbacks: { label: ctx => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ctx.parsed.y) } } },
            scales: { y: { beginAtZero: true, ticks: { callback: v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumSignificantDigits: 3 }).format(v) } } }
        }
    });
}

function renderSalesTable(group, monthsRange) {
    const rows = group.rows || [];
    const userTargetsEnabled = group.user_targets_enabled !== 0;
    const supplierMetaMensal = parseFloat(group.meta_mensal) || 0;
    const numMonths = monthsRange.length;
    const monthKeys = monthsRange.map(m => m.key);
    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const totals = monthKeys.reduce((acc, key) => {
        acc[key] = { venda: 0, faturado: 0, meta: 0 };
        rows.forEach(row => {
            const d = row.dados_mes?.[key] || {};
            acc[key].venda += parseFloat(d.venda) || 0;
            acc[key].faturado += parseFloat(d.faturado) || 0;
            acc[key].meta += parseFloat(d.meta) || 0;
        });
        return acc;
    }, {});

    const monthHeaders = monthsRange.map(m => `<th class="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">${m.label}</th>`).join('');

    const tableBody = rows.map(row => {
        let rowVenda = 0, rowFaturado = 0, rowMeta = 0;
        const cells = monthKeys.map(key => {
            const d = row.dados_mes?.[key] || {};
            const v = parseFloat(d.venda) || 0, f = parseFloat(d.faturado) || 0, m = parseFloat(d.meta) || 0;
            rowVenda += v; rowFaturado += f; rowMeta += m;
            const s = v - m;
            const sClass = s >= 0 ? 'text-green-600' : 'text-red-600';
            const bgClass = (userTargetsEnabled && m > 0) ? (v >= m ? 'bg-green-50' : 'bg-red-50') : '';
            let progressHtml = '';
            if (userTargetsEnabled && m > 0) {
                const pct = Math.min((v / m) * 100, 100).toFixed(0);
                progressHtml = `<div class="w-full bg-gray-200 rounded-full h-1.5 mt-1"><div class="${v >= m ? 'bg-green-500' : 'bg-yellow-500'} h-1.5 rounded-full" style="width:${pct}%"></div></div>`;
            }
            return `<td class="px-2 py-2 text-xs text-right border-r border-gray-200 ${bgClass}">
                <div class="font-medium text-gray-900">${v > 0 ? format(v) : '-'}</div>
                ${(userTargetsEnabled && m > 0) ? `<div class="text-gray-400 text-[10px]">M: ${format(m)}</div>` : ''}
                ${progressHtml}
                ${(userTargetsEnabled && m > 0) ? `<div class="${sClass} font-bold text-[10px]">S: ${format(s)}</div>` : ''}
            </td>`;
        }).join('');
        const rowSaldo = rowVenda - rowMeta;
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-white">${row.vendedor_nome}</td>
                ${cells}
                <td class="px-4 py-3 text-sm text-right bg-gray-50 font-bold border-l border-gray-200">
                    <div>${format(rowVenda)}</div>
                    ${userTargetsEnabled ? `<div class="text-[10px] text-gray-500">M: ${format(rowMeta)}</div>` : ''}
                    ${userTargetsEnabled ? `<div class="${rowSaldo >= 0 ? 'text-green-600' : 'text-red-600'} text-[10px]">S: ${format(rowSaldo)}</div>` : ''}
                </td>
            </tr>`;
    }).join('');

    const totalsCells = monthKeys.map(key => {
        const t = totals[key];
        const metaVal = userTargetsEnabled ? t.meta : supplierMetaMensal;
        const saldoVal = t.venda - metaVal;
        return `<td class="px-2 py-3 text-xs text-right font-bold bg-gray-100 border-r border-gray-200">
            <div>${format(t.venda)}</div>
            ${t.faturado > 0 ? `<div class="text-indigo-600 text-[10px]">F: ${format(t.faturado)}</div>` : ''}
            <div class="text-gray-500 text-[10px]">${format(metaVal)}</div>
            <div class="${saldoVal >= 0 ? 'text-green-600' : 'text-red-600'} text-[10px]">${format(saldoVal)}</div>
        </td>`;
    }).join('');

    const grandVenda = Object.values(totals).reduce((a, b) => a + b.venda, 0);
    const grandMeta = userTargetsEnabled ? Object.values(totals).reduce((a, b) => a + b.meta, 0) : supplierMetaMensal * numMonths;
    const grandSaldo = grandVenda - grandMeta;
    const grandFat = Object.values(totals).reduce((a, b) => a + b.faturado, 0);

    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48 sticky left-0 bg-gray-50">Vendedor</th>
                        ${monthHeaders}
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">TOTAL</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${tableBody}
                    <tr class="bg-gray-100 border-t-2 border-gray-300">
                        <td class="px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-100">TOTAIS</td>
                        ${totalsCells}
                        <td class="px-4 py-3 text-sm text-right font-bold bg-gray-200 border-l border-gray-200">
                            <div>${format(grandVenda)}</div>
                            ${grandFat > 0 ? `<div class="text-indigo-700 text-[10px]">F: ${format(grandFat)}</div>` : ''}
                            <div class="text-gray-500 text-[10px]">${format(grandMeta)}</div>
                            <div class="${grandSaldo >= 0 ? 'text-green-600' : 'text-red-600'} text-[10px]">${format(grandSaldo)}</div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function renderStateReport(group) {
    const stateSales = group.state_sales || {};
    const stateGoals = group.state_goals || {};
    const states = Object.keys(stateGoals).sort();
    if (states.length === 0) return '';

    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    let totalSales = 0, totalGoal = 0;
    const maxSales = Math.max(...states.map(s => parseFloat(stateSales[s]) || 0));

    const rowsHtml = states.map(uf => {
        const sales = parseFloat(stateSales[uf]) || 0;
        const goal = parseFloat(stateGoals[uf]) || 0;
        const bal = sales - goal;
        totalSales += sales; totalGoal += goal;
        const pct = maxSales > 0 ? (sales / maxSales * 100) : 0;
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 border-r border-gray-100">${uf}</td>
                <td class="px-6 py-4 text-sm text-right text-gray-700">
                    <div class="flex justify-end items-center space-x-3">
                        <span class="font-mono">${format(sales)}</span>
                        <div class="w-20 bg-gray-100 rounded-sm h-3 overflow-hidden border border-gray-200"><div class="bg-indigo-500 h-full" style="width:${pct}%"></div></div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-right font-mono text-gray-500">${format(goal)}</td>
                <td class="px-6 py-4 text-sm text-right font-mono font-bold ${bal >= 0 ? 'text-green-600' : 'text-red-500'}">${format(bal)}</td>
            </tr>`;
    }).join('');

    const totalBal = totalSales - totalGoal;
    return `
        <div class="mt-8">
            <h4 class="text-md font-bold text-gray-700 mb-3 px-1 border-l-4 border-blue-500 pl-2">Performance por Estado</h4>
            <div class="overflow-x-auto rounded-lg shadow border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vendas (Período)</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Meta Anual</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${rowsHtml}
                        <tr class="bg-gray-100 font-bold border-t-2 border-gray-300">
                            <td class="px-6 py-4 text-sm text-gray-900">TOTAIS</td>
                            <td class="px-6 py-4 text-sm text-right text-gray-900">${format(totalSales)}</td>
                            <td class="px-6 py-4 text-sm text-right text-gray-700">${format(totalGoal)}</td>
                            <td class="px-6 py-4 text-sm text-right ${totalBal >= 0 ? 'text-green-600' : 'text-red-500'}">${format(totalBal)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderClientsTable(data) {
    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const totalRevenue = data.reduce((acc, r) => acc + (parseFloat(r.valor_total) || 0), 0);

    return `
        <div class="mb-8 bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
                <h3 class="font-bold text-indigo-700">Ranking de Clientes (Curva ABC)</h3>
                <span class="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full">Top ${data.length}</span>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16">#</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd Vendas</th>
                            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Classe</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Acumulado</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.map((row, i) => {
        const val = parseFloat(row.valor_total) || 0;
        const pColorClass = row.classe === 'A' ? 'bg-green-100 text-green-800' : row.classe === 'B' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';
        return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-3 text-center font-bold text-gray-500 border-r">${i + 1}</td>
                                    <td class="px-6 py-3 font-medium text-gray-700">${row.cliente_nome}${row.classe === 'A' ? '<i class="fas fa-star text-yellow-400 ml-2"></i>' : ''}</td>
                                    <td class="px-6 py-3 text-center text-gray-600">${row.qtd_vendas}</td>
                                    <td class="px-6 py-3 text-center"><span class="px-2 text-xs font-semibold rounded-full ${pColorClass}">${row.classe || '-'}</span></td>
                                    <td class="px-6 py-3 text-right font-bold text-gray-800">${format(val)}</td>
                                    <td class="px-6 py-3 text-right text-gray-500">${(parseFloat(row.percentual_acumulado) || 0).toFixed(1)}%</td>
                                </tr>`;
    }).join('')}
                    </tbody>
                    <tfoot class="bg-gray-100 font-bold border-t-2">
                        <tr>
                            <td colspan="2" class="px-6 py-3 text-right text-gray-900">TOTAL</td>
                            <td class="px-6 py-3 text-center">${data.reduce((a, r) => a + parseInt(r.qtd_vendas), 0)}</td>
                            <td></td>
                            <td class="px-6 py-3 text-right">${format(totalRevenue)}</td>
                            <td class="px-6 py-3 text-right">100.0%</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

function renderLostReasonsTable(data) {
    const totalCount = data.reduce((acc, r) => acc + parseInt(r.qtd), 0);
    return `
        <div class="mb-8 bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                <h3 class="font-bold text-red-700">Análise de Propostas Recusadas</h3>
                <span class="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">${totalCount} Recusadas</span>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">%</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${data.map(r => {
        const pct = totalCount > 0 ? (parseInt(r.qtd) / totalCount * 100) : 0;
        return `<tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-medium text-gray-700">${r.motivo}</td>
                                <td class="px-4 py-3 text-sm text-center text-gray-600">${r.qtd}</td>
                                <td class="px-4 py-3 text-sm text-right text-gray-500">${pct.toFixed(1)}%</td>
                            </tr>`;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderForecastTable(data) {
    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const totalForecast = data.reduce((acc, r) => acc + (parseFloat(r.forecast_ponderado) || 0), 0);
    const totalPipeline = data.reduce((acc, r) => acc + (parseFloat(r.pipeline_total) || 0), 0);

    return `
        <div class="mb-8 bg-white shadow rounded-lg overflow-hidden">
            <div class="px-6 py-4 bg-purple-50 border-b border-purple-100 flex justify-between items-center">
                <h3 class="font-bold text-purple-700">Forecast — Previsão de Fechamento</h3>
                <span class="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Ponderado: ${format(totalForecast)}</span>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-gray-50 p-4 rounded-lg border text-center">
                        <span class="block text-xs font-semibold text-gray-400 uppercase">Pipeline Total</span>
                        <span class="block text-xl font-bold text-gray-800">${format(totalPipeline)}</span>
                    </div>
                    <div class="bg-indigo-50 p-4 rounded-lg border border-indigo-200 text-center">
                        <span class="block text-xs font-semibold text-indigo-400 uppercase">Forecast Ponderado</span>
                        <span class="block text-xl font-bold text-indigo-700">${format(totalForecast)}</span>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg border border-green-200 text-center">
                        <span class="block text-xs font-semibold text-green-400 uppercase">Confiança Geral</span>
                        <span class="block text-xl font-bold text-green-700">${totalPipeline > 0 ? ((totalForecast / totalPipeline) * 100).toFixed(1) + '%' : '0%'}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderProductsTable(rows) {
    const format = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    return `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Unit.</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${(rows || []).map(r => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-6 py-4 text-sm text-gray-900">${r.produto_nome || '-'}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 text-center">${r.quantidade}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 text-right">${format(r.valor_unitario)}</td>
                            <td class="px-6 py-4 text-sm font-medium text-right">${format(r.valor_total)}</td>
                        </tr>`).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function getMonthsBetween(start, end) {
    if (!start || !end) return [];
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    const result = [];
    let curr = new Date(s.getFullYear(), s.getMonth(), 1);
    const endLimit = new Date(e.getFullYear(), e.getMonth(), 1);

    while (curr <= endLimit) {
        const y = curr.getFullYear();
        const m = curr.getMonth() + 1;
        result.push({
            key: `${y}-${m}`,
            label: curr.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase().replace('.', '')
        });
        curr.setMonth(curr.getMonth() + 1);
    }
    return result;
}

function exportToExcel() {
    const content = document.getElementById('reports-output-area').cloneNode(true);
    content.querySelector('#report-loading')?.remove();
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8"><style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #000;padding:5px}</style></head>
        <body>${content.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Relatorio_${new Date().toISOString().slice(0, 10)}.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function setupModalLinks() {
    const modal = document.getElementById('targets-modal');
    if (!modal) return;

    const setTargetsBtn = document.getElementById('set-targets-btn');
    if (setTargetsBtn) {
        setTargetsBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            const supSelect = document.getElementById('target-supplier-select');
            supSelect.innerHTML = '<option value="">Selecione...</option>' +
                (appState.fornecedores || []).map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
            document.getElementById('targets-grid-container').innerHTML = '<p class="text-gray-500 italic p-4">Selecione um fornecedor.</p>';
            supSelect.onchange = e => loadTargetsEditor(e.target.value);
        });
    }
    const hide = () => modal.classList.add('hidden');
    modal.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', hide));
    document.getElementById('save-targets-btn').addEventListener('click', saveTargets);
}

function loadTargetsEditor(supplierId, year = null) {
    if (!supplierId) return;
    const container = document.getElementById('targets-grid-container');
    const allUsers = (appState.users || []).filter(u => ['Vendedor', 'Representante', 'Comercial', 'Gestor', 'Analista'].includes(u.role));
    if (!year) year = new Date().getFullYear();

    apiCall('get_supplier_targets', { params: { supplier_id: supplierId, year } })
        .then(response => {
            if (!response.success) { container.innerHTML = `<p class="text-red-500">Erro: ${response.error}</p>`; return; }

            const data = response.data;
            const metaAnualTotal = data.meta_anual || 0;
            const stateTargets = data.state_targets || {};
            const targets = data.targets || {};
            const userTargetsEnabled = data.user_targets_enabled !== 0;
            let states = Object.keys(stateTargets);
            if (states.length === 0) states = ['PE', 'PB', 'RN'];

            const fmt = v => formatCurrency(v);
            const inputClass = "form-input text-right text-xs border-gray-300 rounded w-full focus:ring-indigo-500 focus:border-indigo-500 font-mono p-1 h-8";
            const headerClass = "border bg-gray-100 text-center w-24 px-1 text-[10px] font-bold uppercase";

            let html = `
                <div class="mb-6">
                    <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div class="flex flex-wrap gap-6 items-center" id="header-state-inputs">
                            <div>
                                <label class="block text-xs font-bold text-gray-700 mb-1 uppercase">Ano Base</label>
                                <input type="number" id="target-year-input" class="form-input font-bold text-gray-900 w-24 text-center border-gray-300 rounded" value="${year}">
                            </div>
                            <div class="pl-6 border-l border-gray-200">
                                <label class="block text-xs font-bold text-gray-700 mb-1 uppercase">Meta Global (R$)</label>
                                <input type="text" id="sup-meta-annual-display" class="form-input text-right font-bold text-sm text-gray-900 w-48 bg-gray-50 border-gray-200" value="${fmt(metaAnualTotal)}" readonly>
                                <input type="hidden" id="sup-meta-annual" value="${metaAnualTotal}">
                            </div>
                        </div>
                        <div class="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <div id="add-state-container" class="flex items-center gap-2">
                                <button id="btn-show-add-state" class="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs px-4 py-2 rounded-md flex items-center shadow-sm font-medium">
                                    <i class="fas fa-plus-circle mr-2"></i> Adicionar Estado
                                </button>
                                <div id="add-state-form" class="hidden flex items-center gap-2">
                                    <input type="text" id="new-state-input" class="form-input text-sm border-gray-300 rounded w-20 uppercase font-bold text-center" placeholder="UF" maxlength="2">
                                    <button id="btn-confirm-add-state" class="bg-green-600 text-white p-2 rounded"><i class="fas fa-check"></i></button>
                                    <button id="btn-cancel-add-state" class="bg-gray-200 text-gray-600 p-2 rounded"><i class="fas fa-times"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            html += `<div class="mb-6 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <div class="bg-gray-50 px-4 py-3 border-b font-bold text-sm text-gray-700"><i class="fas fa-map-marked-alt mr-2 text-indigo-500"></i>Metas por Estado (Mensal)</div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm bg-white" id="state-grid-table">
                        <thead class="bg-gray-50 text-gray-600"><tr><th class="p-3 text-left border-b w-32 font-bold text-xs uppercase">Estado</th>`;
            for (let i = 1; i <= 12; i++) html += `<th class="${headerClass}">${i}</th>`;
            html += `</tr></thead><tbody></tbody></table></div></div>`;

            html += `<div class="mb-4 border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <div class="bg-gray-50 px-4 py-3 border-b font-bold text-sm text-gray-700 flex justify-between items-center">
                    <span><i class="fas fa-users mr-2 text-indigo-500"></i>Metas por Vendedor</span>
                    <label class="inline-flex items-center cursor-pointer group">
                        <input type="checkbox" id="toggle-user-targets" class="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500" ${userTargetsEnabled ? 'checked' : ''}>
                        <span class="ml-2 text-xs font-medium text-gray-600">Habilitar metas por vendedor</span>
                    </label>
                </div>
                <div class="overflow-x-auto transition-opacity duration-300 ${userTargetsEnabled ? '' : 'opacity-50 pointer-events-none'}" id="user-grid-wrapper">
                    <table class="w-full text-sm bg-white">
                        <thead class="bg-gray-50 text-gray-600">
                            <tr>
                                <th class="p-3 text-left border-b min-w-[200px] font-bold text-xs uppercase">Vendedor</th>`;
            for (let i = 1; i <= 12; i++) html += `<th class="${headerClass}">${i}</th>`;
            html += `</tr></thead><tbody>`;

            allUsers.forEach(u => {
                let userTargets = targets[u.id] || {};
                let hasTarget = Object.values(userTargets).some(v => v > 0);
                let cells = '';
                for (let i = 1; i <= 12; i++) {
                    let val = userTargets[i] || 0;
                    cells += `<td class="border p-1"><input type="text" class="${inputClass} user-month-input currency-input" data-user="${u.id}" data-month="${i}" value="${val > 0 ? fmt(val) : ''}" ${hasTarget ? '' : 'disabled'}></td>`;
                }
                html += `<tr class="hover:bg-indigo-50 transition-colors group">
                    <td class="p-2 border text-gray-700 flex items-center bg-white sticky left-0 z-10 group-hover:bg-indigo-50">
                        <input type="checkbox" class="form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 mr-2 user-active-check" data-user="${u.id}" ${hasTarget ? 'checked' : ''}>
                        <span class="${hasTarget ? 'font-bold text-gray-900' : ''}">${u.nome}</span>
                    </td>
                    ${cells}
                </tr>`;
            });

            html += `</tbody></table></div></div>`;
            container.innerHTML = html;

            // ── CURRENCY HELPERS ──────────────────────────────────────────
            const attachCurrencyEvents = (input) => {
                input.addEventListener('focus', function () { this.select(); });
                input.addEventListener('blur', function () {
                    const val = parseCurrency(this.value);
                    this.value = val > 0 ? formatCurrency(val) : '';
                });
                input.addEventListener('keypress', function (e) {
                    if (!/[\d,.]/.test(e.key) && e.key.length === 1 && e.key !== 'Enter') e.preventDefault();
                });
            };

            const stateHeaderContainer = document.getElementById('header-state-inputs');
            const stateGridBody = document.querySelector('#state-grid-table tbody');

            const addStateToUI = (uf, annualVal = 0, monthlyData = {}) => {
                if (container.querySelector(`.state-annual-input[data-state="${uf}"]`)) {
                    showToast(`Estado ${uf} já adicionado.`, 'warning'); return;
                }
                const div = document.createElement('div');
                div.innerHTML = `
                    <label class="block text-xs font-bold text-gray-700 mb-1">Meta Anual ${uf} (R$)</label>
                    <input type="text" class="form-input text-right text-gray-900 font-bold text-sm w-40 border-gray-300 rounded state-annual-input currency-input" data-state="${uf}" value="${annualVal > 0 ? fmt(annualVal) : ''}" placeholder="R$ 0,00">
                `;
                stateHeaderContainer.appendChild(div);

                const tr = document.createElement('tr');
                let cells = '';
                for (let i = 1; i <= 12; i++) {
                    let val = monthlyData[i] || 0;
                    cells += `<td class="border p-1"><input type="text" class="${inputClass} state-month-input currency-input" data-state="${uf}" data-month="${i}" value="${val > 0 ? fmt(val) : ''}"></td>`;
                }
                tr.innerHTML = `
                    <td class="p-2 border font-bold text-gray-700 bg-gray-50 flex justify-between items-center group">
                        <span class="w-8 text-center bg-white border rounded px-1 text-xs shadow-sm">${uf}</span>
                        <button class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity btn-remove-state p-1 rounded hover:bg-red-50" data-state="${uf}" title="Remover">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                    ${cells}
                `;
                stateGridBody.appendChild(tr);

                const annInput = div.querySelector('input');
                attachCurrencyEvents(annInput);
                annInput.addEventListener('blur', () => updateGrandTotal(container));

                tr.querySelectorAll('.state-month-input').forEach(inp => {
                    attachCurrencyEvents(inp);
                    inp.addEventListener('blur', () => {
                        let sum = 0;
                        container.querySelectorAll(`.state-month-input[data-state="${uf}"]`).forEach(m => sum += parseCurrency(m.value));
                        annInput.value = sum > 0 ? formatCurrency(sum) : '';
                        updateGrandTotal(container);
                    });
                });

                tr.querySelector('.btn-remove-state').addEventListener('click', () => {
                    Swal.fire({
                        title: 'Tem certeza?', text: 'Deseja remover este estado?', icon: 'warning',
                        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6',
                        confirmButtonText: 'Remover', cancelButtonText: 'Cancelar'
                    }).then(result => { if (result.isConfirmed) { div.remove(); tr.remove(); updateGrandTotal(container); } });
                });
            };

            states.forEach(uf => {
                const sData = stateTargets[uf] || {};
                addStateToUI(uf, sData.meta_anual || 0, sData.meta_mensal || {});
            });

            container.querySelectorAll('.currency-input').forEach(inp => attachCurrencyEvents(inp));

            // ── ADD STATE FORM ────────────────────────────────────────────
            const btnShow = document.getElementById('btn-show-add-state');
            const formAdd = document.getElementById('add-state-form');
            const inputAdd = document.getElementById('new-state-input');
            const btnConfirm = document.getElementById('btn-confirm-add-state');
            const btnCancel = document.getElementById('btn-cancel-add-state');

            if (btnShow && formAdd) {
                btnShow.addEventListener('click', () => { btnShow.classList.add('hidden'); formAdd.classList.remove('hidden'); inputAdd.value = ''; inputAdd.focus(); });
                const hideAddForm = () => { formAdd.classList.add('hidden'); btnShow.classList.remove('hidden'); };
                btnCancel.addEventListener('click', hideAddForm);
                const performAdd = () => {
                    const uf = inputAdd.value.trim().toUpperCase();
                    if (uf && uf.length === 2) { addStateToUI(uf); updateGrandTotal(container); hideAddForm(); }
                    else { showToast("Sigla inválida (Use 2 letras, ex: SP)", "error"); inputAdd.focus(); }
                };
                btnConfirm.addEventListener('click', performAdd);
                inputAdd.addEventListener('keypress', e => { if (e.key === 'Enter') performAdd(); });
                inputAdd.addEventListener('keydown', e => { if (e.key === 'Escape') hideAddForm(); });
            }

            // ── OTHER LISTENERS ───────────────────────────────────────────
            document.getElementById('target-year-input')?.addEventListener('change', e => loadTargetsEditor(supplierId, e.target.value));

            const toggleUsers = document.getElementById('toggle-user-targets');
            const userWrapper = document.getElementById('user-grid-wrapper');
            if (toggleUsers) {
                toggleUsers.addEventListener('change', e => {
                    userWrapper.classList.toggle('opacity-50', !e.target.checked);
                    userWrapper.classList.toggle('pointer-events-none', !e.target.checked);
                });
            }

            container.querySelectorAll('.user-active-check').forEach(chk => {
                chk.addEventListener('change', e => {
                    const uid = e.target.dataset.user;
                    container.querySelectorAll(`.user-month-input[data-user="${uid}"]`).forEach(inp => {
                        inp.disabled = !e.target.checked;
                        if (!e.target.checked) inp.value = '';
                    });
                    e.target.nextElementSibling.classList.toggle('font-bold', e.target.checked);
                    e.target.nextElementSibling.classList.toggle('text-gray-900', e.target.checked);
                });
            });

        }).catch(err => { console.error(err); container.innerHTML = `<p class="text-red-500">Erro de conexão.</p>`; });
}

// ─── CURRENCY HELPERS ─────────────────────────────────────────────────────────
function parseCurrency(str) {
    if (!str || str === '') return 0;
    if (typeof str === 'number') return str;
    return parseFloat(str.toString().replace(/[^\d,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
}

function formatCurrency(val) {
    if (val === undefined || val === null || val === '') return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function updateGrandTotal(container) {
    let grand = 0;
    container.querySelectorAll('.state-annual-input').forEach(inp => grand += parseCurrency(inp.value));
    const disp = document.getElementById('sup-meta-annual-display');
    const val = document.getElementById('sup-meta-annual');
    if (val) val.value = grand;
    if (disp) disp.value = formatCurrency(grand);
}

async function saveTargets() {
    const supplierId = document.getElementById('target-supplier-select').value;
    const year = document.getElementById('target-year-input')?.value || new Date().getFullYear();
    const supAnnual = parseFloat(document.getElementById('sup-meta-annual')?.value || 0) || 0;
    const userTargetsToggle = document.getElementById('toggle-user-targets');
    const userTargetsEnabled = userTargetsToggle ? userTargetsToggle.checked : false;

    const stateTargets = {};
    document.querySelectorAll('.state-annual-input').forEach(input => {
        const uf = input.dataset.state;
        const ann = parseCurrency(input.value);
        const monthly = {};
        document.querySelectorAll(`.state-month-input[data-state="${uf}"]`).forEach(inp => { monthly[inp.dataset.month] = parseCurrency(inp.value); });
        stateTargets[uf] = { annual: ann, monthly };
    });

    const targets = [];
    if (userTargetsEnabled) {
        document.querySelectorAll('.user-month-input').forEach(inp => {
            if (!inp.disabled) {
                const val = parseCurrency(inp.value);
                if (val > 0) targets.push({ usuario_id: inp.dataset.user, fornecedor_id: supplierId, mes: inp.dataset.month, valor: val });
            }
        });
    }

    showLoading(true);
    try {
        const res = await apiCall('save_targets', {
            method: 'POST', body: JSON.stringify({
                year, supplier_id: supplierId,
                supplier_goals: { annual: supAnnual, monthly: 0 },
                state_targets: stateTargets, targets, user_targets_enabled: userTargetsEnabled
            })
        });
        if (res.success) {
            showToast('Metas salvas com sucesso!', 'success');
            document.getElementById('targets-modal').classList.add('hidden');
            loadReportData();
        } else { showToast(res.error || 'Erro ao salvar', 'error'); }
    } catch (e) { console.error(e); showToast('Erro de conexão', 'error'); }
    finally { showLoading(false); }
}

function updateFilterPills(type, start, end, supplierIds, userIds, clientIds, etapaIds, origemIds, ufIds, statusIds) {
    const container = document.getElementById('active-filters-pills');
    if (!container) return;
    container.innerHTML = '';
    let hasPills = false;

    const createPill = (label, filterId) => {
        hasPills = true;
        return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 shadow-sm border border-indigo-200">
            ${label}
            <button type="button" class="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200" onclick="removeFilterPill('${filterId}')">
                <i class="fas fa-times text-[10px]"></i>
            </button>
        </span>`;
    };

    const resolveLabels = id => Array.from(document.querySelectorAll(`.${id}-checkbox:checked`)).map(c => c.nextElementSibling.innerText).join(', ');

    let innerHtml = '';
    if (start && end) { innerHtml += `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">Período: ${start} → ${end}</span>`; hasPills = true; }
    if (supplierIds.length > 0) innerHtml += createPill('Fornecedores: ' + resolveLabels('supplier-select'), 'supplier-select');
    if (userIds.length > 0) innerHtml += createPill('Vendedores: ' + resolveLabels('user-select'), 'user-select');
    if (clientIds.length > 0) innerHtml += createPill('Clientes: ' + resolveLabels('client-select'), 'client-select');
    if (etapaIds.length > 0) innerHtml += createPill('Etapas: ' + resolveLabels('etapa-select'), 'etapa-select');
    if (ufIds.length > 0) innerHtml += createPill('UF: ' + resolveLabels('uf-select'), 'uf-select');

    if (hasPills) {
        container.innerHTML = `<span class="text-xs font-bold text-gray-500 self-center mr-2"><i class="fas fa-tags mr-1"></i>Filtros Ativos:</span>` + innerHtml;
        container.classList.remove('hidden');
    } else { container.classList.add('hidden'); }
}

window.removeFilterPill = function (idBase) {
    window.toggleAllMultiSelect(idBase, false);
    document.getElementById('refresh-report-btn').click();
};

function exportToPDF(forcedType = null, forcedMonth = null) {
    const output = document.getElementById('performance-output');

    // Se não tem dados ainda, avisa
    if (!output || output.querySelector('.fa-fingerprint') || output.querySelector('.fa-spinner')) {
        showToast('Clique em Play primeiro para carregar os dados.', 'warning');
        return;
    }

    // Cria janela de impressão com os dados da tabela
    const monthEl = document.getElementById('perf-month-select');
    const yearEl = document.getElementById('perf-year-select');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const monthName = monthEl ? months[parseInt(monthEl.value) - 1] : '';
    const year = yearEl ? yearEl.value : new Date().getFullYear();

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Performance Financeira - ${monthName} ${year}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 20px; }
                h2   { color: #3730a3; margin-bottom: 4px; }
                p    { color: #666; margin-bottom: 16px; font-size: 11px; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                thead tr { background: #4f46e5; color: white; }
                th { padding: 8px 10px; text-align: right; font-size: 10px; text-transform: uppercase; }
                th:first-child { text-align: left; }
                td { padding: 7px 10px; text-align: right; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
                td:first-child { text-align: left; font-weight: bold; }
                tfoot tr { background: #f1f5f9; font-weight: bold; }
                .green { color: #16a34a; }
                .red   { color: #dc2626; }
                @media print {
                    @page { margin: 15mm; }
                }
            </style>
        </head>
        <body>
            <h2>Performance Financeira — ${monthName} ${year}</h2>
            <p>Relatório de metas e comissões por vendedor</p>
            ${output.innerHTML}
            <script>window.onload = function(){ window.print(); }<\/script>
        </body>
        </html>
    `);
    printWin.document.close();
}

async function loadPerformanceData(container = null, startDate = null, endDate = null) {
    const output = document.getElementById('performance-output');
    if (!output) return;

    if (!startDate) startDate = document.getElementById('perf-start-date')?.value;
    if (!endDate) endDate = document.getElementById('perf-end-date')?.value;

    if (!startDate || !endDate) return;

    output.innerHTML = `<div class="p-20 text-center text-gray-400">
        <i class="fas fa-spinner fa-spin text-4xl mb-4 text-indigo-600"></i>
        <p class="animate-pulse font-bold">Calculando metas e comissões...</p>
    </div>`;

    try {
        // Busca dados de comissão calculados no backend E config financeira em paralelo
        const [commissionRes, configRes] = await Promise.all([
            apiCall('get_report_data', {
                params: {
                    report_type: 'commission_analysis',
                    start_date: startDate,
                    end_date: endDate
                }
            }),
            apiCall('get_commission_config')
        ]);

        const configs = (configRes && configRes.success) ? (configRes.data || []) : [];
        const commissionData = (commissionRes && commissionRes.success && commissionRes.data) ? commissionRes.data : [];

        // LOG para debug
        console.log('COMMISSION DATA (backend):', commissionData);
        console.log('CONFIG:', configs);

        if (configs.length === 0) {
            output.innerHTML = `<div class="p-16 text-center text-amber-500 bg-amber-50 m-6 rounded-2xl border border-amber-100">
                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <h4 class="font-bold text-lg">Nenhuma configuração encontrada</h4>
                <p class="text-sm mt-2">Clique em <strong>Config. Metas</strong> para cadastrar os vendedores e suas metas.</p>
            </div>`;
            return;
        }

        // Cria um mapa de vendas do backend indexado por usuario_id
        const salesMap = {};
        commissionData.forEach(row => {
            salesMap[String(row.usuario_id)] = {
                total_vendas: parseFloat(row.total_vendas) || 0,
                meta_mensal: parseFloat(row.meta_mensal) || 0,
                comissao_valor: parseFloat(row.comissao_valor) || 0,
                valor_fixo: parseFloat(row.valor_fixo) || 0,
                percentual_comissao: parseFloat(row.percentual_comissao) || 1,
                valor_trimestre: parseFloat(row.valor_trimestre) || 0,
            };
        });

        // Monta o resultado usando a config (que define quem é "ativo") + dados reais do backend
        const result = configs.filter(c => c.ativo != 0).map(c => {
            const uid = String(c.usuario_id);
            const backendData = salesMap[uid] || {};

            // Usa o valor de vendas do backend (calculado via SQL)
            const totalVendas = backendData.total_vendas || 0;
            // Meta: sempre do commission_config (o que o usuário configurou em "Config. Metas")
            const meta = parseFloat(c.meta_mensal) || 0;
            const fixo = parseFloat(c.salario_fixo) || 0;
            const pct = parseFloat(c.percentual_comissao) || 1;
            const comissao = totalVendas * (pct / 100);
            const trimestre = backendData.valor_trimestre || 0;

            return {
                usuario_id: c.usuario_id,
                nome: c.nome,
                meta_mensal: meta,
                total_vendas: totalVendas,
                salario_fixo: fixo,
                percentual_comissao: pct,
                comissao_valor: comissao,
                total_trimestre: trimestre,
                total_periodo: fixo + comissao,
                atingimento: meta > 0 ? (totalVendas / meta * 100) : 0,
            };
        });

        // Renderiza a tabela (funciona mesmo com vendas = 0)
        renderPerformanceTable(output, result);

        // Carrega e renderiza os cards de evolução por vendedor
        await renderVendorEvolutionCards(output, startDate, endDate, result);

    } catch (e) {
        console.error(e);
        output.innerHTML = `<div class="p-20 text-center text-red-500 bg-red-50 m-6 rounded-2xl border border-red-100">
            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
            <h4 class="font-bold">Erro ao Carregar Dados</h4>
            <p class="text-sm opacity-75">${e.message}</p>
        </div>`;
    }
}

async function renderVendorEvolutionCards(output, startDate, endDate, performanceData) {
    const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0);
    const monthLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const endMonth = parseInt(endDate.split('-')[1]) || 12;

    try {
        const evoRes = await apiCall('get_report_data', {
            params: { report_type: 'vendor_evolution', start_date: startDate, end_date: endDate }
        });

        const evoData = (evoRes && evoRes.success && evoRes.data) ? evoRes.data : [];
        const evoMap = {};
        evoData.forEach(v => { evoMap[String(v.usuario_id)] = v.meses; });

        // Container para os cards
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6';
        cardsContainer.id = 'vendor-evolution-cards';

        performanceData.forEach((vendor, idx) => {
            const uid = vendor.usuario_id ? String(vendor.usuario_id) : null;
            const meses = (uid && evoMap[uid]) ? evoMap[uid] : {};
            const chartLabels = monthLabels.slice(0, endMonth);
            const chartData = [];
            let totalYear = 0;
            let bestMonth = 0;
            let bestMonthVal = 0;
            for (let m = 1; m <= endMonth; m++) {
                const val = parseFloat(meses[m]) || 0;
                chartData.push(val);
                totalYear += val;
                if (val > bestMonthVal) { bestMonthVal = val; bestMonth = m; }
            }

            const meta = vendor.meta_mensal || 0;
            const atingPct = meta > 0 ? Math.min(Math.round((vendor.total_vendas / meta) * 100), 999) : 0;
            const atingColor = atingPct >= 100 ? '#10b981' : atingPct >= 60 ? '#f59e0b' : '#ef4444';
            const mediaMonth = endMonth > 0 ? totalYear / endMonth : 0;

            const card = document.createElement('div');
            card.className = 'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300';
            card.innerHTML = `
                <div class="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                            <i class="fas fa-user-tie text-white"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-black text-sm tracking-wide">${vendor.nome}</h4>
                            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Evolução de Vendas ${evoRes.year || ''}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="text-right">
                            <div class="text-[10px] text-slate-400 font-bold uppercase">Meta</div>
                            <div class="text-white font-black text-sm">${fmt(meta)}</div>
                        </div>
                        <div class="relative w-14 h-14">
                            <svg viewBox="0 0 36 36" class="w-14 h-14 transform -rotate-90">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="3"/>
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${atingColor}" stroke-width="3" stroke-dasharray="${Math.min(atingPct, 100)}, 100" stroke-linecap="round"/>
                            </svg>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <span class="text-white font-black text-[11px]">${atingPct}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-4">
                    <div class="grid grid-cols-3 gap-4 mb-5">
                        <div class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-3 border border-emerald-100">
                            <div class="text-[9px] text-emerald-600 font-black uppercase tracking-wider">Acumulado</div>
                            <div class="text-emerald-700 font-black text-base mt-0.5">${fmt(totalYear)}</div>
                        </div>
                        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
                            <div class="text-[9px] text-blue-600 font-black uppercase tracking-wider">Média/Mês</div>
                            <div class="text-blue-700 font-black text-base mt-0.5">${fmt(mediaMonth)}</div>
                        </div>
                        <div class="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-100">
                            <div class="text-[9px] text-violet-600 font-black uppercase tracking-wider">Melhor Mês</div>
                            <div class="text-violet-700 font-black text-base mt-0.5">${bestMonthVal > 0 ? monthLabels[bestMonth - 1] : '-'}</div>
                            <div class="text-violet-400 text-[10px] font-mono">${bestMonthVal > 0 ? fmt(bestMonthVal) : ''}</div>
                        </div>
                    </div>
                    <div class="relative h-48">
                        <canvas id="evo-chart-${idx}"></canvas>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(card);
        });

        output.appendChild(cardsContainer);

        // Renderiza os gráficos (após inserir no DOM)
        performanceData.forEach((vendor, idx) => {
            const uid = vendor.usuario_id ? String(vendor.usuario_id) : null;
            const meses = (uid && evoMap[uid]) ? evoMap[uid] : {};
            const chartData = [];
            for (let m = 1; m <= endMonth; m++) {
                chartData.push(parseFloat(meses[m]) || 0);
            }
            const meta = vendor.meta_mensal || 0;
            const metaLine = endMonth > 0 && meta > 0 ? Array(endMonth).fill(meta / endMonth) : null;

            const canvas = document.getElementById(`evo-chart-${idx}`);
            if (!canvas) return;

            const datasets = [{
                label: 'Vendas',
                data: chartData,
                backgroundColor: chartData.map((v, i) => {
                    const isLast = i === endMonth - 1;
                    return isLast ? 'rgba(79,70,229,0.85)' : 'rgba(79,70,229,0.45)';
                }),
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.7,
                categoryPercentage: 0.8,
            }];

            if (metaLine) {
                datasets.push({
                    label: 'Meta Mensal',
                    data: metaLine,
                    type: 'line',
                    borderColor: '#ef4444',
                    borderDash: [6, 4],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    order: 0,
                });
            }

            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: monthLabels.slice(0, endMonth),
                    datasets: datasets,
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15,23,42,0.95)',
                            titleFont: { weight: 'bold', size: 11 },
                            bodyFont: { size: 11 },
                            padding: 10,
                            cornerRadius: 10,
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${fmt(ctx.raw)}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { font: { size: 10, weight: '700' }, color: '#94a3b8' }
                        },
                        y: {
                            grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
                            ticks: {
                                font: { size: 9 },
                                color: '#cbd5e1',
                                callback: v => {
                                    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
                                    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k';
                                    return v;
                                }
                            },
                            beginAtZero: true,
                        }
                    }
                }
            });
        });

    } catch (e) {
        console.error('Erro ao carregar evolução:', e);
    }
}
function showInfoModal({ icon = 'fa-info-circle', iconColor = 'text-indigo-500', iconBg = 'bg-indigo-50', title = 'Aviso', message = '', btnText = 'OK', btnColor = 'bg-indigo-600 hover:bg-indigo-700' } = {}) {
    // Remove modal anterior se existir
    document.getElementById('custom-info-modal')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'custom-info-modal';
    overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
    overlay.innerHTML = `
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" id="modal-backdrop"></div>

        <!-- Card -->
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center animate-[fadeInScale_0.2s_ease-out]">
            
            <!-- Ícone -->
            <div class="w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                <i class="fas ${icon} text-2xl ${iconColor}"></i>
            </div>

            <!-- Título -->
            <h3 class="text-lg font-black text-gray-800 mb-2">${title}</h3>

            <!-- Mensagem -->
            <p class="text-sm text-gray-500 leading-relaxed mb-7">${message}</p>

            <!-- Botão -->
            <button id="modal-ok-btn" class="${btnColor} text-white px-8 py-2.5 rounded-xl font-black text-sm shadow-md active:scale-95 transition-all w-full">
                ${btnText}
            </button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fecha ao clicar no backdrop ou no botão OK
    overlay.querySelector('#modal-ok-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-backdrop').onclick = () => overlay.remove();
}

// ─── RELATÓRIO: VENDAS POR VENDEDOR ─────────────────────────────────────────
function renderVendorDetailReport(items, activity) {
    const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const fmtPct = v => `${(v || 0).toFixed(1)}%`;

    // KPI Cards por vendedor
    const activityCards = activity.map(a => {
        const atingColor = a.atingimento >= 100 ? 'emerald' : a.atingimento >= 60 ? 'amber' : 'red';
        const convColor = a.taxa_conversao >= 50 ? 'emerald' : a.taxa_conversao >= 25 ? 'amber' : 'red';
        return `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <i class="fas fa-user-tie text-white text-sm"></i>
                    </div>
                    <span class="text-white font-black text-sm">${a.vendedor_nome}</span>
                </div>
                <span class="bg-${atingColor}-400/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full">${fmtPct(a.atingimento)} Meta</span>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-gray-100">
                <div class="px-4 py-3 text-center">
                    <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Oportunidades</div>
                    <div class="text-lg font-black text-gray-800">${a.oportunidades_criadas || 0}</div>
                </div>
                <div class="px-4 py-3 text-center">
                    <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Propostas</div>
                    <div class="text-lg font-black text-gray-800">${a.propostas_total || 0}</div>
                    <div class="text-[10px] text-gray-400">
                        <span class="text-green-600">${a.propostas_aprovadas || 0} ✓</span> · 
                        <span class="text-red-500">${a.propostas_recusadas || 0} ✗</span> · 
                        <span class="text-blue-500">${a.propostas_enviadas || 0} ➜</span>
                    </div>
                </div>
                <div class="px-4 py-3 text-center">
                    <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Vendido</div>
                    <div class="text-base font-black text-green-600">${fmt(a.total_vendido)}</div>
                    <div class="text-[10px] text-gray-400">Meta: ${fmt(a.meta_anual)}</div>
                </div>
                <div class="px-4 py-3 text-center">
                    <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Conversão</div>
                    <div class="text-lg font-black text-${convColor}-600">${fmtPct(a.taxa_conversao)}</div>
                    <div class="text-[10px] text-gray-400">${a.agendamentos_periodo || 0} agendamentos</div>
                </div>
            </div>
            ${a.meta_anual > 0 ? `
            <div class="px-4 pb-3">
                <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all" style="width:${Math.min(a.atingimento, 100)}%"></div>
                </div>
            </div>` : ''}
        </div>`;
    }).join('');

    // Agrupar itens por vendedor
    const grouped = {};
    items.forEach(r => {
        const vid = r.vendedor_id || 0;
        if (!grouped[vid]) grouped[vid] = { nome: r.vendedor_nome || 'Não definido', rows: [] };
        grouped[vid].rows.push(r);
    });

    const statusBadge = (s) => {
        const map = {
            'Aprovada': 'bg-green-100 text-green-800',
            'Recusada': 'bg-red-100 text-red-800',
            'Enviada': 'bg-blue-100 text-blue-800',
            'Negociando': 'bg-amber-100 text-amber-800',
            'Rascunho': 'bg-gray-100 text-gray-600',
        };
        return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full ${map[s] || 'bg-gray-100 text-gray-600'}">${s}</span>`;
    };

    // Tabelas por vendedor
    const tables = Object.values(grouped).map(g => {
        // Deduplica por proposta (múltiplos itens na mesma proposta)
        const seen = new Set();
        let subtotalAprovado = 0;

        const trs = g.rows.map((r, i) => {
            const propKey = r.proposta_id;
            const isNewProp = !seen.has(propKey);
            if (isNewProp) seen.add(propKey);
            if (r.status === 'Aprovada' && isNewProp) subtotalAprovado += parseFloat(r.proposta_valor) || 0;

            return `
            <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-indigo-50/30 transition-colors">
                <td class="px-4 py-2.5 text-xs text-gray-500 font-mono">${new Date(r.data_criacao).toLocaleDateString('pt-BR')}</td>
                <td class="px-4 py-2.5 text-xs font-bold">
                    ${r.proposta_id && r.proposta_id !== 'null' ? `
                    <span class="clickable-proposal-link text-indigo-600 hover:text-indigo-800 cursor-pointer underline decoration-indigo-200 hover:decoration-indigo-500 transition-all font-black" data-proposal-id="${r.proposta_id}">
                        ${r.numero_proposta || '-'}
                    </span>` : `
                    <span class="text-slate-400 italic font-medium flex items-center gap-1" title="Venda Direta / Importação">
                        <i class="fas fa-file-import opacity-50"></i> ${r.numero_proposta || 'Venda Direta'}
                    </span>
                    `}
                </td>
                <td class="px-4 py-2.5 text-xs text-gray-800 font-medium">${r.cliente_nome}</td>
                <td class="px-4 py-2.5 text-xs text-gray-700">${r.produto || '-'}</td>
                <td class="px-4 py-2.5 text-xs text-gray-500">${r.fabricante || '-'}</td>
                <td class="px-4 py-2.5 text-xs text-center text-gray-600">${r.quantidade || '-'}</td>
                <td class="px-4 py-2.5 text-xs text-right font-mono text-gray-800">${fmt(r.item_total)}</td>
                <td class="px-4 py-2.5 text-center">${statusBadge(r.status)}</td>
            </tr>`;
        }).join('');

        return `
        <div class="mb-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-5 py-3 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <i class="fas fa-user text-indigo-500 text-sm"></i>
                    <span class="font-black text-gray-800 text-sm">${g.nome}</span>
                    <span class="text-xs text-gray-400">(${g.rows.length} itens)</span>
                </div>
                <span class="text-xs font-bold text-green-600">Aprovado: ${fmt(subtotalAprovado)}</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                            <th class="px-4 py-3 text-left">Data</th>
                            <th class="px-4 py-3 text-left">Proposta</th>
                            <th class="px-4 py-3 text-left">Cliente</th>
                            <th class="px-4 py-3 text-left">Produto</th>
                            <th class="px-4 py-3 text-left">Fabricante</th>
                            <th class="px-4 py-3 text-center">Qtd</th>
                            <th class="px-4 py-3 text-right">Valor</th>
                            <th class="px-4 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">${trs}</tbody>
                </table>
            </div>
        </div>`;
    }).join('');

    return `
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-chart-bar text-indigo-600"></i>
                </div>
                <div>
                    <h3 class="font-black text-gray-800 text-lg">Vendas por Vendedor</h3>
                    <p class="text-xs text-gray-400">Desempenho individual · Prospecção · Metas</p>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">${activityCards}</div>
        </div>
        ${tables}
    `;
}

// ─── RELATÓRIO: FATURAMENTO (BILLING) ───────────────────────────────────────
function renderBillingReport(proposals, kpis) {
    const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

    // KPI Cards
    const kpiHtml = `
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-green-100">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Aprovado</div>
            <div class="text-xl font-black mt-1">${fmt(kpis.total_aprovado)}</div>
            <div class="text-xs opacity-70 mt-0.5">${kpis.qtd_aprovado} proposta(s)</div>
        </div>
        <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white shadow-lg shadow-red-100">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Recusado</div>
            <div class="text-xl font-black mt-1">${fmt(kpis.total_recusado)}</div>
            <div class="text-xs opacity-70 mt-0.5">${kpis.qtd_recusado} proposta(s)</div>
        </div>
        <div class="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-100">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">Conversão</div>
            <div class="text-xl font-black mt-1">${kpis.taxa_conversao}%</div>
            <div class="text-xs opacity-70 mt-0.5">Aprovadas / Decididas</div>
        </div>
        <div class="bg-gradient-to-br from-slate-600 to-gray-700 rounded-2xl p-4 text-white shadow-lg shadow-gray-100">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">Total Propostas</div>
            <div class="text-xl font-black mt-1">${kpis.qtd_aprovado + kpis.qtd_recusado}</div>
            <div class="text-xs opacity-70 mt-0.5">No período</div>
        </div>
        <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-amber-100">
            <div class="text-[10px] font-bold uppercase tracking-wider opacity-80">Ticket Médio</div>
            <div class="text-xl font-black mt-1">${kpis.qtd_aprovado > 0 ? fmt(kpis.total_aprovado / kpis.qtd_aprovado) : 'R$ 0'}</div>
            <div class="text-xs opacity-70 mt-0.5">Aprovadas</div>
        </div>
    </div>`;

    // Tabela de propostas
    const rows = proposals.map((p, i) => {
        const isApproved = p.status === 'Aprovada';
        const statusClass = isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const statusIcon = isApproved ? 'fa-check-circle' : 'fa-times-circle';
        const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';

        return `
        <tr class="${rowBg} hover:bg-indigo-50/30 transition-colors">
            <td class="px-4 py-3 text-xs font-mono text-gray-500">${new Date(p.data_criacao).toLocaleDateString('pt-BR')}</td>
            <td class="px-4 py-3 text-xs font-bold">
                ${p.proposta_id && p.proposta_id !== 'null' ? `
                <span class="clickable-proposal-link text-indigo-600 hover:text-indigo-800 cursor-pointer underline decoration-indigo-200 hover:decoration-indigo-500 transition-all font-black" data-proposal-id="${p.proposta_id}">
                    ${p.numero_proposta || '-'}
                </span>` : `
                <div class="flex flex-col">
                    <span class="text-slate-500 font-bold flex items-center gap-1 clickable-proposal-link cursor-help" data-proposal-id="null" title="Esta venda foi importada via planilha">
                        <i class="fas fa-file-import text-slate-300 text-[10px]"></i> ${p.numero_proposta || 'Venda Direta'}
                    </span>
                    <span class="text-[9px] text-slate-400 uppercase tracking-tighter">Importação Direta</span>
                </div>
                `}
            </td>
            <td class="px-4 py-3 text-xs text-gray-800 font-medium max-w-[200px] truncate" title="${p.cliente_nome}">${p.cliente_nome}</td>
            <td class="px-4 py-3 text-xs font-medium text-gray-700">${p.vendedor_nome || '-'}</td>
            <td class="px-4 py-3 text-xs text-gray-600 max-w-[250px] truncate" title="${p.produtos_resumo}">${p.produtos_resumo || '-'}</td>
            <td class="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate" title="${p.fabricantes_resumo}">${p.fabricantes_resumo || '-'}</td>
            <td class="px-4 py-3 text-xs text-right font-black font-mono ${isApproved ? 'text-green-700' : 'text-red-600'}">${fmt(p.valor_total)}</td>
            <td class="px-4 py-3 text-center">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-full ${statusClass}">
                    <i class="fas ${statusIcon} text-[8px]"></i> ${p.status}
                </span>
            </td>
            <td class="px-4 py-3 text-xs text-gray-400 max-w-[150px] truncate" title="${p.motivo_status || ''}">${p.motivo_status || '-'}</td>
        </tr>`;
    }).join('');

    // Totais
    const totalAprovado = proposals.filter(p => p.status === 'Aprovada').reduce((a, p) => a + (parseFloat(p.valor_total) || 0), 0);
    const totalRecusado = proposals.filter(p => p.status !== 'Aprovada').reduce((a, p) => a + (parseFloat(p.valor_total) || 0), 0);

    return `
        <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-file-invoice-dollar text-emerald-600"></i>
                </div>
                <div>
                    <h3 class="font-black text-gray-800 text-lg">Relatório de Faturamento</h3>
                    <p class="text-xs text-gray-400">Propostas aprovadas e recusadas · Produtos · Clientes</p>
                </div>
            </div>
            ${kpiHtml}
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gradient-to-r from-slate-700 to-slate-800 text-[10px] font-black text-white uppercase tracking-wider">
                            <th class="px-4 py-3.5 text-left rounded-tl-2xl">Data</th>
                            <th class="px-4 py-3.5 text-left">Proposta</th>
                            <th class="px-4 py-3.5 text-left">Cliente</th>
                            <th class="px-4 py-3.5 text-left">Vendedor</th>
                            <th class="px-4 py-3.5 text-left">Produto(s)</th>
                            <th class="px-4 py-3.5 text-left">Fabricante</th>
                            <th class="px-4 py-3.5 text-right">Valor</th>
                            <th class="px-4 py-3.5 text-center">Status</th>
                            <th class="px-4 py-3.5 text-left rounded-tr-2xl">Motivo</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">${rows}</tbody>
                    <tfoot>
                        <tr class="bg-gray-50 border-t-2 border-gray-200 font-black text-xs">
                            <td colspan="6" class="px-4 py-3 text-right text-gray-600 uppercase tracking-wider">Totais</td>
                            <td class="px-4 py-3 text-right font-mono">
                                <div class="text-green-700">${fmt(totalAprovado)}</div>
                                <div class="text-red-600 text-[10px]">${fmt(totalRecusado)}</div>
                            </td>
                            <td colspan="2" class="px-4 py-3 text-center text-gray-500">
                                <span class="text-green-600 font-bold">${kpis.qtd_aprovado}</span> / 
                                <span class="text-red-500 font-bold">${kpis.qtd_recusado}</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
}

// ─── DRILL-DOWN: DETALHES DA PROPOSTA ───────────────────────────────────────
async function openProposalDetailsModal(proposalId) {
    if (!proposalId) return;

    try {
        showLoading(true);
        const response = await apiCall('get_proposal_details', { params: { id: proposalId } });
        showLoading(false);

        if (response.success) {
            const content = renderProposalModalContent(response.proposal);
            renderModal(`Proposta #${response.proposal.numero_proposta}`, content, () => closeModal(), 'Fechar', 'btn-secondary', 'xl');
        } else {
            showToast(response.error || 'Erro ao carregar detalhes da proposta', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Erro ao abrir drill-down:', error);
        showToast('Erro de conexão ao buscar dados da proposta', 'error');
    }
}

function renderProposalModalContent(p) {
    const fmt = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
    const date = d => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
    
    const statusMap = {
        'Aprovada': 'bg-green-100 text-green-800 border-green-200',
        'Recusada': 'bg-red-100 text-red-800 border-red-200',
        'Enviada': 'bg-blue-100 text-blue-800 border-blue-200',
        'Negociando': 'bg-amber-100 text-amber-800 border-amber-200',
        'Rascunho': 'bg-gray-100 text-gray-600 border-gray-200',
    };
    const statusClass = statusMap[p.status] || 'bg-gray-100 text-gray-600 border-gray-200';

    const itemsRows = (p.items || []).map((item, i) => `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
            <td class="px-3 py-2 text-xs text-gray-800 font-medium">${item.descricao}</td>
            <td class="px-3 py-2 text-xs text-gray-500">${item.fabricante || '-'}</td>
            <td class="px-3 py-2 text-xs text-center text-gray-600">${item.quantidade}</td>
            <td class="px-3 py-2 text-xs text-right text-gray-600">${fmt(item.valor_unitario)}</td>
            <td class="px-3 py-2 text-xs text-right font-bold text-gray-800">${fmt(item.quantidade * item.valor_unitario)}</td>
        </tr>
    `).join('');

    return `
        <div class="space-y-6">
            <!-- Header Info -->
            <div class="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                        <i class="fas fa-file-invoice fa-lg"></i>
                    </div>
                    <div>
                        <div class="text-[10px] text-gray-400 uppercase font-black tracking-widest leading-none mb-1">Número da Proposta</div>
                        <div class="text-xl font-black text-gray-800 leading-none">${p.numero_proposta}</div>
                    </div>
                </div>
                <div class="flex flex-wrap gap-4">
                    <div class="text-right">
                        <div class="text-[10px] text-gray-400 font-bold uppercase">Data de Criação</div>
                        <div class="text-sm font-bold text-gray-700">${date(p.data_criacao)}</div>
                    </div>
                    <div>
                        <div class="text-[10px] text-gray-400 font-bold uppercase mb-1">Status Atual</div>
                        <span class="px-3 py-1 text-xs font-black rounded-full border ${statusClass}">${p.status}</span>
                    </div>
                </div>
            </div>

            <!-- Client & Vendor Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-indigo-100">
                    <h4 class="text-xs font-black text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <i class="fas fa-user-circle"></i> Dados do Cliente
                    </h4>
                    <div class="space-y-2">
                        <div>
                            <div class="text-[10px] text-gray-400 font-bold uppercase">Cliente / Organização</div>
                            <div class="text-sm font-black text-gray-800">${p.organizacao_nome || p.cliente_pf_nome || 'N/D'}</div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <div class="text-[10px] text-gray-400 font-bold uppercase">${p.cnpj ? 'CNPJ' : 'CPF'}</div>
                                <div class="text-xs font-medium text-gray-600">${p.cnpj || p.cpf || 'N/A'}</div>
                            </div>
                            <div>
                                <div class="text-[10px] text-gray-400 font-bold uppercase">Contato</div>
                                <div class="text-xs font-medium text-gray-600">${p.contato_nome || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm transition-all hover:border-emerald-100">
                    <h4 class="text-xs font-black text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <i class="fas fa-id-badge"></i> Responsável Comercial
                    </h4>
                    <div class="space-y-2">
                        <div>
                            <div class="text-[10px] text-gray-400 font-bold uppercase">Vendedor</div>
                            <div class="text-sm font-black text-gray-800">${p.vendedor_nome || 'N/D'}</div>
                        </div>
                        <div>
                            <div class="text-[10px] text-gray-400 font-bold uppercase">Funil / Etapa Atual</div>
                            <div class="text-xs font-medium text-gray-600">${p.etapa_funil_nome || 'Proposta'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div>
                <h4 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i class="fas fa-box-open"></i> Itens da Proposta
                </h4>
                <div class="border border-gray-100 rounded-xl overflow-hidden">
                    <table class="w-full text-left">
                        <thead class="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase">Produto/Serviço</th>
                                <th class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase">Fabricante</th>
                                <th class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase text-center">Qtd</th>
                                <th class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase text-right">Unitário</th>
                                <th class="px-3 py-2 text-[10px] font-black text-gray-500 uppercase text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">${itemsRows}</tbody>
                        <tfoot class="bg-slate-50 border-t border-gray-100">
                            <tr>
                                <td colspan="4" class="px-3 py-2 text-right text-xs font-bold text-gray-500 uppercase">Total da Proposta</td>
                                <td class="px-3 py-2 text-right text-base font-black text-indigo-700">${fmt(p.valor_total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            ${p.observacoes && p.observacoes !== 'Nenhuma' ? `
            <div class="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <h4 class="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Observações Internas</h4>
                <p class="text-xs text-amber-800 leading-relaxed">${p.observacoes}</p>
            </div>
            ` : ''}

            <div class="flex justify-center mt-4">
                <button onclick="window.open('imprimir_proposta.php?id=${p.id}', '_blank')" class="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-black rounded-lg hover:bg-indigo-100 transition-colors">
                    <i class="fas fa-print"></i> VERSÃO PARA IMPRESSÃO (PDF)
                </button>
            </div>
        </div>
    `;
}