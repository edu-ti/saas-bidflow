
// js/state.js
// Centralized state management to avoid circular dependencies

export let appState = {
    currentUser: null,
    users: [],
    opportunities: [],
    organizations: [],
    contacts: [],
    clients_pf: [],
    proposals: [],
    pre_proposals: [],
    stages: [],
    fornecedores: [],
    vendasFornecedores: [],
    agendamentos: [],
    leads: [],
    products: [],
    charts: {},
    proposal: null,
    clientsView: { activeTab: 'organizations', searchTerm: '', isFormVisible: false, editingId: null },
    proposalsView: { currentPage: 1 },
    proposalSort: { column: 'data_criacao', direction: 'desc' },
    funilView: { activeTab: 'vendas', year: new Date().getFullYear(), selectedFornecedorId: null },
    activeView: 'dashboard',
    // Estado para a nova view de Email Marketing
    emailMarketingView: {
        selectedInterests: [],
        subject: '',
        body: '',
        recipientCount: 0,
        recipientEmails: []
    }
};
