// js/script.js (Arquivo Principal)

import { apiCall } from './api.js';
import { showToast, showLoading } from './utils.js';
import { renderDashboardView } from './views/dashboard.js';
import { renderFunilView } from './views/kanban.js';
import { renderClientsView } from './views/clients.js';
import { initProposalsView, resetProposalState } from './views/proposals.js';
import { renderSettingsView } from './views/settings.js';
import { renderAgendaView } from './views/agenda.js';
import { renderLeadsView } from './views/leads.js';
import { renderCatalogView } from './views/catalog.js';
import { renderEmailMarketingView } from './views/email_marketing.js?v=3';
import { renderFinanceiroView } from './views/financeiro.js';

// O estado da aplicação
// Cache bust: 2026-01-26-2
import { appState } from './state.js';

// O estado da aplicação
// Cache bust: 2026-01-26-2
// appState is now imported from state.js

document.addEventListener('DOMContentLoaded', initializeApp);

export async function initializeApp() { // Tornada exportável para ser chamada de outros módulos
    showLoading(true);
    try {
        const data = await apiCall('get_data');
        Object.assign(appState, data);
        // Garante que o estado da nova view exista
        if (!appState.emailMarketingView) {
            appState.emailMarketingView = {
                selectedInterests: [],
                subject: '',
                body: '',
                recipientCount: 0,
                recipientEmails: []
            };
        }
        renderUI();
        // Tenta manter a view ativa, senão volta para o dashboard
        const viewToRender = appState.activeView && document.getElementById(`${appState.activeView}-view`) ? appState.activeView : 'dashboard';
        switchView(viewToRender);

    } catch (error) {
        console.error("Falha ao inicializar o app:", error);
        if (error.message && error.message.includes('401')) { // Verifica se error.message existe
            window.location.href = 'login.html'; // Redireciona para login.html
        } else {
            const appRoot = document.getElementById('app-root');
            if (appRoot) { // Verifica se appRoot existe
                appRoot.innerHTML = `<div class="p-8 text-center"><p class="text-red-500">Erro fatal ao carregar dados. Verifique a conexão e tente recarregar.</p><p class="text-sm text-gray-600 mt-2">${error.message || 'Erro desconhecido.'}</p></div>`;
            }
        }
    } finally {
        showLoading(false);
    }
}

async function switchView(viewName) {
    // Verifica se a view existe antes de tentar mudar
    if (!document.getElementById(`${viewName}-view`)) {
        console.warn(`View "${viewName}" não encontrada. Redirecionando para o dashboard.`);
        viewName = 'dashboard';
    }

    appState.activeView = viewName;
    document.querySelectorAll('.view-container').forEach(view => view.classList.add('hidden'));
    document.getElementById(`${viewName}-view`)?.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById(`nav-link-${viewName}`)?.classList.add('active');

    if (viewName === 'reports') {
        try {
            showLoading(true);
            const module = await import(`./views/reports.js?v=${new Date().getTime()}`);
            await module.renderReportsView(appState);
        } catch (error) {
            console.error(`Erro ao carregar módulo de relatórios:`, error);
            const viewContainer = document.getElementById(`${viewName}-view`);
            if (viewContainer) {
                viewContainer.innerHTML = `<p class="text-red-500 p-4">Ocorreu um erro ao carregar o módulo de relatórios. Verifique o console.</p>`;
            }
        } finally {
            showLoading(false);
        }
        return;
    }

    const renderFunction = {
        'dashboard': renderDashboardView,
        'funil': renderFunilView,
        'agenda': renderAgendaView,
        'clients': renderClientsView,
        'proposals': initProposalsView,
        'leads': renderLeadsView,
        'settings': renderSettingsView,
        'catalog': renderCatalogView,
        'email-marketing': renderEmailMarketingView,
        'financeiro': renderFinanceiroView
    }[viewName];

    if (renderFunction) {
        try {
            renderFunction();
        } catch (error) {
            console.error(`Erro ao renderizar a view "${viewName}":`, error);
            // Opcional: Mostrar uma mensagem de erro na UI
            const viewContainer = document.getElementById(`${viewName}-view`);
            if (viewContainer) {
                viewContainer.innerHTML = `<p class="text-red-500 p-4">Ocorreu um erro ao carregar esta seção.</p>`;
            }
        }
    } else {
        console.error(`Função de renderização para "${viewName}" não encontrada.`);
    }
}


function renderUI() {
    const { currentUser } = appState;
    if (!currentUser) return;
    const { permissions } = currentUser;

    const appRoot = document.getElementById('app-root');
    appRoot.innerHTML = `
        <style>
            /* Reset básico para inputs */
            input:focus, select:focus, textarea:focus {
                outline: none;
                border-color: #6366f1;
                ring: 2px;
                ring-color: #c7d2fe;
            }

            /* Estilos para Sidebar Retrátil (Apenas Desktop) */
            @media (min-width: 768px) {
                #sidebar {
                    width: 5rem; /* w-20 (80px) */
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 50;
                }
                #sidebar:hover {
                    width: 17rem; /* w-64 (expandido um pouco mais para conforto) */
                }
                
                /* Link de Navegação */
                .nav-link {
                    display: flex;
                    align-items: center;
                    justify-content: center; /* Centralizado quando recolhido */
                    padding: 0.75rem 0.5rem;
                    margin-bottom: 0.25rem;
                    border-radius: 0.5rem;
                    color: #4b5563; /* text-gray-600 */
                    transition: all 0.2s;
                    white-space: nowrap;
                    overflow: hidden;
                }
                
                /* Comportamento no Hover da Sidebar */
                #sidebar:hover .nav-link {
                    justify-content: flex-start; /* Alinha a esquerda expandido */
                    padding-left: 1rem;
                }
                
                /* Ícone */
                .nav-link i {
                    font-size: 1.25rem;
                    min-width: 1.5rem;
                    text-align: center;
                    margin-right: 0;
                    transition: margin 0.2s;
                }
                #sidebar:hover .nav-link i {
                    margin-right: 0.75rem; /* Espaço entre ícone e texto */
                }
                
                /* Texto */
                .nav-text {
                    opacity: 0;
                    display: none;
                    transition: opacity 0.3s ease-in-out;
                }
                #sidebar:hover .nav-text {
                    display: inline-block;
                    opacity: 1;
                }
                
                /* Estados do Link (Hover e Active) */
                .nav-link:hover {
                    background-color: #084b78; /* gray-100 */
                    color: #ffffff; /* gray-900 (Escuro para contraste) */
                }
                
                .nav-link.active {
                    background-color: #206a9b; /* indigo-600 */
                    color: #ffffff !important;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                }
                
                /* Garante contraste quando o item ativo é 'hovered' */
                .nav-link.active:hover {
                    background-color: #206a9b; /* indigo-700 */
                    color: #ffffff !important;
                }

                /* Logo */
                .logo-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 4rem;
                    overflow: hidden;
                }
                .logo-img {
                    height: 2.5rem; /* Tamanho maior recolhido */
                    width: auto;
                    object-fit: contain;
                    transition: all 0.3s;
                }
                #sidebar:hover .logo-img {
                    height: 3rem; /* Um pouco maior expandido */
                }
            }

            /* Ajustes Mobile (se necessário, mantém padrão) */
            @media (max-width: 767px) {
                .nav-link {
                    display: flex;
                    padding: 0.75rem;
                    color: #4b5563;
                }
                .nav-link.active {
                    background-color: #4f46e5;
                    color: white;
                }
            }
        </style>
        <div id="app-container" class="flex h-screen bg-gray-100">
            <div id="sidebar-overlay" class="fixed inset-0 bg-black bg-opacity-50 z-30 hidden md:hidden"></div>
            <aside id="sidebar" class="sidebar bg-white shadow-xl flex flex-col flex-shrink-0">
                <div class="logo-container p-4 border-b">
                    <img src="imagens/LOGO-FR.webp" alt="Logo" class="logo-img">
                </div>
                <nav id="main-nav" class="flex-1 p-2 space-y-1 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar"></nav>
            </aside>
            <main class="flex-1 flex flex-col overflow-hidden">
                <header id="main-header" class="bg-white p-4 shadow-sm border-b flex justify-between items-center h-16">
                    <button id="menu-toggle-btn" class="md:hidden action-btn"><i class="fas fa-bars text-xl"></i></button>
                    <h1 class="text-xl font-bold text-gray-800 hidden sm:block">Bem-vindo, ${currentUser.nome}!</h1>
                    <div class="flex items-center space-x-4">
                        <button id="refresh-data-btn" class="action-btn" title="Atualizar Dados"><i class="fas fa-sync-alt"></i></button>
                        <div class="relative">
                            <button id="user-menu-btn" class="flex items-center space-x-2">
                                <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                    ${currentUser.nome ? currentUser.nome.charAt(0).toUpperCase() : '?'}
                                </div>
                            </button>
                            <div id="user-menu-dropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden">
                                <a href="#" id="logout-btn" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sair</a>
                            </div>
                        </div>
                    </div>
                </header>
                <div id="main-content" class="flex-1 overflow-y-auto p-2 md:p-6"></div>
            </main>
        </div>
    `;

    // Navegação Principal
    const navLinks = [
        { id: 'dashboard', icon: 'fa-chart-pie', text: 'Dashboard', permission: true },
        { id: 'funil', icon: 'fa-columns', text: 'Funil Vendas', permission: true },
        { id: 'leads', icon: 'fa-filter', text: 'Funil Leads Online', permission: permissions.canSeeLeads && !['Vendedor', 'Especialista'].includes(currentUser.role) },
        { id: 'agenda', icon: 'fa-calendar-alt', text: 'Agenda', permission: true },
        { id: 'clients', icon: 'fa-users', text: 'Clientes', permission: true },
        { id: 'proposals', icon: 'fa-file-invoice-dollar', text: 'Propostas', permission: true },
        { id: 'catalog', icon: 'fa-book-open', text: 'Catálogo', permission: permissions.canSeeCatalog }, // Usar permissão
        { id: 'email-marketing', icon: 'fa-bullhorn', text: 'Marketing', permission: permissions.canManageLeads && !['Vendedor', 'Especialista'].includes(currentUser.role) }, // Nova aba e permissão
        { id: 'financeiro', icon: 'fa-money-bill-wave', text: 'Financeiro', permission: ['Gestor', 'Comercial', 'Analista'].includes(currentUser.role) }, // Aba Financeira
        { id: 'reports', icon: 'fa-chart-line', text: 'Relatórios', permission: permissions.canSeeReports }, // Nova aba Relatórios
        { id: 'settings', icon: 'fa-cog', text: 'Configurações', permission: permissions.canSeeSettings }
    ];

    document.getElementById('main-nav').innerHTML = navLinks
        .filter(link => link.permission) // Filtra baseado na permissão do usuário
        // Usando as classes definidas no CSS em vez de Tailwind inline para evitar conflitos
        .map(link => `<a href="#" id="nav-link-${link.id}" class="nav-link" data-view="${link.id}"><i class="fas ${link.icon}"></i><span class="nav-text">${link.text}</span></a>`)
        .join('');

    // Conteúdo das Views
    document.getElementById('main-content').innerHTML = `
        <div id="dashboard-view" class="view-container"></div>
        <div id="funil-view" class="view-container"></div>
        <div id="agenda-view" class="view-container"></div>
        <div id="clients-view" class="view-container"></div>
        <div id="proposals-view" class="view-container"></div>
        <div id="leads-view" class="view-container"></div>
        <div id="email-marketing-view" class="view-container hidden"></div>
        <div id="financeiro-view" class="view-container hidden"></div>
        <div id="reports-view" class="view-container hidden"></div>
        <div id="settings-view" class="view-container"></div>
        <div id="catalog-view" class="view-container"></div>
    `;

    addGlobalEventListeners();
}

function addGlobalEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const refreshBtn = document.getElementById('refresh-data-btn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => {
        showToast('Atualizando dados...', 'info');
        initializeApp(); // Chama a função para recarregar tudo
    });


    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) userMenuBtn.addEventListener('click', () => {
        document.getElementById('user-menu-dropdown')?.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        const userMenuButton = document.getElementById('user-menu-btn');
        const userMenuDropdown = document.getElementById('user-menu-dropdown');
        // Fecha o menu do usuário se clicar fora dele
        if (userMenuButton && userMenuDropdown && !userMenuButton.contains(e.target) && !userMenuDropdown.contains(e.target)) {
            userMenuDropdown.classList.add('hidden');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Garante recarregamento ao clicar em Propostas
            if (link.dataset.view === 'proposals' && appState.activeView === 'proposals') {
                initProposalsView();
            }

            switchView(link.dataset.view);
            // Em mobile, esconde o menu após clicar
            if (window.innerWidth < 768) {
                document.getElementById('sidebar')?.classList.remove('open');
                document.getElementById('sidebar-overlay')?.classList.add('hidden');
            }
        });
    });

    // Lógica do menu responsivo
    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (menuToggleBtn && sidebar && overlay) {
        menuToggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('hidden');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.add('hidden');
        });
    }
}

async function logout() {
    try {
        await apiCall('logout', { method: 'POST' });
    } catch (e) {
        console.error("Logout falhou.", e);
        // Mesmo que falhe no servidor, força o redirecionamento
    } finally {
        window.location.href = 'login.html'; // Redireciona para login.html
    }
}
