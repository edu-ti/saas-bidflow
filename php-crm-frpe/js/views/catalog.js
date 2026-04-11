// js/views/catalog.js  (v2 – Master-Detail)

import { appState } from '../state.js';
import { apiCall } from '../api.js';
import { showToast, formatCurrency, parseCurrency, formatCurrencyForInput } from '../utils.js';
import { renderModal, closeModal } from '../ui.js';

let localState = {
    activeTab: 'products',      // 'products' | 'priceTable' | 'kits'

    // Produtos
    searchTerm: '', selectedFornecedor: '', editingProduct: null, currentPage: 1,

    // Tabela de Preço – Master
    ptSearch: '', ptPage: 1, editingPriceTable: null,
    selectedTableId: null,       // ID da tabela aberta no detalhe

    // Tabela de Preço – Detail (itens)
    ptItemSearch: '', ptItemPage: 1, editingPriceItem: null,

    // Kits
    kitsSearch: '', kitsPage: 1, editingKit: null, kitItems: [],
};

// ─────────────────────────────────────────────
// RENDER PRINCIPAL
// ─────────────────────────────────────────────

export function renderCatalogView() {
    const container = document.getElementById('catalog-view');

    container.innerHTML = `
        <div class="flex flex-col h-full">
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold text-gray-800">Catálogo</h1>
            </div>

            <div class="border-b border-gray-200 mb-4">
                <nav class="-mb-px flex space-x-6" id="catalog-tabs">
                    <button data-tab="products"   class="catalog-tab ${localState.activeTab === 'products'   ? 'active' : ''}"><i class="fas fa-boxes mr-2"></i>Produtos</button>
                    <button data-tab="priceTable" class="catalog-tab ${localState.activeTab === 'priceTable' ? 'active' : ''}"><i class="fas fa-tags mr-2"></i>Tabela de Preços</button>
                    <button data-tab="kits"       class="catalog-tab ${localState.activeTab === 'kits'       ? 'active' : ''}"><i class="fas fa-layer-group mr-2"></i>Kits / Conjuntos</button>
                </nav>
            </div>

            <div id="catalog-tab-content" class="flex-1 overflow-hidden flex flex-col min-h-0"></div>
        </div>

        <style>
            .catalog-tab { padding:.625rem .25rem; border-bottom:2px solid transparent; font-size:.875rem; font-weight:500; color:#6b7280; transition:all .2s; white-space:nowrap; }
            .catalog-tab:hover,.catalog-tab.active { color:#1d4ed8; }
            .catalog-tab.active { border-color:#1d4ed8; }
            .catalog-tab:hover  { border-color:#93c5fd; }
            .pt-master-row { cursor:pointer; transition:background .15s; }
            .pt-master-row:hover { background:#eff6ff; }
            .pt-master-row.selected { background:#dbeafe; }
        </style>
    `;

    document.getElementById('catalog-tabs').addEventListener('click', e => {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        if (btn.dataset.tab !== 'priceTable') localState.selectedTableId = null;
        localState.activeTab = btn.dataset.tab;
        renderCatalogView();
    });

    renderActiveTab();
}

function renderActiveTab() {
    switch (localState.activeTab) {
        case 'priceTable': renderPriceTableTab(); break;
        case 'kits':       renderKitsTab();       break;
        default:           renderProductsTab();   break;
    }
}

// ─────────────────────────────────────────────
// ABA PRODUTOS (original preservado)
// ─────────────────────────────────────────────

function renderProductsTab() {
    const { permissions } = appState.currentUser;
    const fornecedores = [...new Set((appState.products || []).map(p => p.fabricante).filter(Boolean))].sort();
    const fornecedorOpts = fornecedores.map(f => `<option value="${f}" ${localState.selectedFornecedor === f ? 'selected' : ''}>${f}</option>`).join('');

    document.getElementById('catalog-tab-content').innerHTML = `
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <div class="relative flex-1 max-w-xs">
                <input type="text" id="product-search" placeholder="Pesquisar..." class="form-input w-full" value="${localState.searchTerm || ''}">
                <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            <select id="fornecedor-filter" class="form-input w-auto">
                <option value="">Todos Fornecedores</option>${fornecedorOpts}
            </select>
            ${permissions.canCreateProduct ? `<button id="add-product-btn" class="btn btn-primary btn-sm"><i class="fas fa-plus mr-1"></i>Novo Produto</button>` : ''}
        </div>
        <div id="product-list-container" class="bg-white rounded-lg shadow-sm border flex-1 overflow-y-auto"></div>
    `;
    document.getElementById('add-product-btn')?.addEventListener('click', () => openProductModal(null));
    document.getElementById('product-search')?.addEventListener('input', e => { localState.searchTerm = e.target.value; renderProductList(); });
    document.getElementById('fornecedor-filter')?.addEventListener('change', e => { localState.selectedFornecedor = e.target.value; renderProductList(); });
    renderProductList();
}

function renderProductList() {
    const c = document.getElementById('product-list-container'); if (!c) return;
    const { permissions } = appState.currentUser;
    const term = localState.searchTerm.toLowerCase();
    const filtered = (appState.products || []).filter(p =>
        (p.nome_produto?.toLowerCase().includes(term) || p.fabricante?.toLowerCase().includes(term) || p.modelo?.toLowerCase().includes(term)) &&
        (!localState.selectedFornecedor || p.fabricante === localState.selectedFornecedor)
    );
    const perPage = 10, total = Math.ceil(filtered.length / perPage);
    if (localState.currentPage > total && total > 0) localState.currentPage = total;
    if (localState.currentPage < 1) localState.currentPage = 1;
    const paged = filtered.slice((localState.currentPage - 1) * perPage, localState.currentPage * perPage);
    c.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead><tr>
                    <th class="table-header w-20">Imagem</th><th class="table-header">Produto</th>
                    <th class="table-header">Fabricante</th><th class="table-header">Valor Unit.</th>
                    <th class="table-header">Unidade</th><th class="table-header text-right">Ações</th>
                </tr></thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${paged.map(p => `<tr class="hover:bg-gray-50">
                        <td class="table-cell"><img src="${p.imagem_url || 'https://placehold.co/64x64/e2e8f0/64748b?text=Img'}" class="w-14 h-14 object-cover rounded border" onerror="this.src='https://placehold.co/64x64/e2e8f0/64748b?text=Erro'"></td>
                        <td class="table-cell"><p class="font-bold text-gray-900">${p.nome_produto || ''}</p><p class="text-xs text-gray-500">${p.modelo || ''}</p></td>
                        <td class="table-cell">${p.fabricante || '—'}</td>
                        <td class="table-cell">${formatCurrency(p.valor_unitario)}</td>
                        <td class="table-cell">${p.unidade_medida || 'Unidade'}</td>
                        <td class="table-cell text-right space-x-1">
                            ${permissions.canCreateProduct ? `<button class="action-btn edit-product-btn" data-id="${p.id}"><i class="fas fa-pencil-alt"></i></button>` : ''}
                            ${permissions.canDeleteProduct ? `<button class="action-btn delete-product-btn" data-id="${p.id}"><i class="fas fa-trash-alt text-red-500"></i></button>` : ''}
                        </td></tr>`).join('') || `<tr><td colspan="6" class="text-center py-8 text-gray-500">Nenhum produto encontrado.</td></tr>`}
                </tbody>
            </table>
        </div>
        <div class="p-3 flex justify-between items-center border-t text-sm">
            <span class="text-gray-500">${paged.length} de ${filtered.length}</span>
            <div class="flex items-center gap-2">
                <button id="prod-prev" class="btn btn-secondary btn-sm" ${localState.currentPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
                <span>Pág. ${localState.currentPage}/${total||1}</span>
                <button id="prod-next" class="btn btn-secondary btn-sm" ${localState.currentPage>=total?'disabled':''}><i class="fas fa-chevron-right"></i></button>
            </div>
        </div>`;
    document.querySelectorAll('.edit-product-btn').forEach(b => b.addEventListener('click', e => { const p=appState.products.find(x=>x.id==e.currentTarget.dataset.id); if(p) openProductModal(p); }));
    document.querySelectorAll('.delete-product-btn').forEach(b => b.addEventListener('click', e => openDeleteProductModal(e.currentTarget.dataset.id)));
    document.getElementById('prod-prev')?.addEventListener('click', () => { localState.currentPage--; renderProductList(); });
    document.getElementById('prod-next')?.addEventListener('click', () => { localState.currentPage++; renderProductList(); });
}

function openProductModal(product) {
    localState.editingProduct = product ? { ...product } : { unidade_medida: 'Unidade' };
    const d = localState.editingProduct;
    const imageUrl = d.imagem_url || 'https://placehold.co/150x150/e2e8f0/64748b?text=Imagem';
    const content = `<form id="modal-form" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2 space-y-4">
                <div><label class="form-label">Nome do Produto*</label><input type="text" name="nome_produto" required class="form-input" value="${d.nome_produto||''}"></div>
                <div class="grid grid-cols-2 gap-4">
                    <div><label class="form-label">Fabricante</label><input type="text" name="fabricante" class="form-input" value="${d.fabricante||''}"></div>
                    <div><label class="form-label">Modelo</label><input type="text" name="modelo" class="form-input" value="${d.modelo||''}"></div>
                </div>
            </div>
            <div class="text-center">
                <label class="form-label">Imagem</label>
                <img id="product-image-preview" src="${imageUrl}" class="w-28 h-28 object-cover mx-auto rounded border mb-2" onerror="this.src='https://placehold.co/150x150/e2e8f0/64748b?text=Erro'">
                <input type="file" class="hidden" id="product-image-upload" accept="image/*">
                <label for="product-image-upload" class="btn btn-secondary btn-sm cursor-pointer w-full text-xs">Escolher</label>
            </div>
        </div>
        <div><label class="form-label">Descrição</label><textarea name="descricao_detalhada" rows="3" class="form-input">${d.descricao_detalhada||''}</textarea></div>
        <div class="grid grid-cols-2 gap-4">
            <div><label class="form-label">Valor Unitário*</label><input type="text" name="valor_unitario" required class="form-input" value="${formatCurrencyForInput(d.valor_unitario)}"></div>
            <div><label class="form-label">Unidade</label><input type="text" name="unidade_medida" class="form-input" value="${d.unidade_medida||'Unidade'}"></div>
        </div>
    </form>`;
    renderModal(d.id ? 'Editar Produto' : 'Novo Produto', content, saveProduct);
    document.getElementById('product-image-upload').addEventListener('change', handleProductImageUpload);
    const vi = document.querySelector('input[name="valor_unitario"]');
    if (vi) vi.addEventListener('blur', e => { e.target.value = formatCurrencyForInput(parseCurrency(e.target.value)); });
}

async function handleProductImageUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    const fd = new FormData(); fd.append('product_image', file);
    showToast('Enviando imagem...', 'info');
    try { const r = await apiCall('upload_product_image', {method:'POST', body:fd}); showToast('Imagem enviada!'); document.getElementById('product-image-preview').src = r.url; localState.editingProduct.imagem_url = r.url; }
    catch (e) { document.getElementById('product-image-preview').src = 'https://placehold.co/150x150/e2e8f0/64748b?text=Erro'; }
}

async function saveProduct(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    data.id = localState.editingProduct.id; data.imagem_url = localState.editingProduct.imagem_url;
    data.valor_unitario = parseCurrency(data.valor_unitario);
    if (data.valor_unitario === null || data.valor_unitario < 0) { showToast('Valor inválido.', 'error'); return; }
    try {
        const result = await apiCall(data.id ? 'update_product' : 'create_product', {method:'POST', body:JSON.stringify(data)});
        const sp = result.product;
        if (data.id) { const i = appState.products.findIndex(p => p.id == sp.id); if(i!==-1) appState.products[i]=sp; }
        else appState.products.push(sp);
        showToast(data.id ? 'Produto atualizado!' : 'Produto criado!'); closeModal(); renderProductList();
    } catch(e) {}
}

function openDeleteProductModal(id) {
    const p = appState.products.find(x => x.id == id); if (!p) return;
    Swal.fire({title:'Tem certeza?', text:`Excluir "${p.nome_produto}"?`, icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Apagar', cancelButtonText:'Cancelar'})
        .then(r => { if(r.isConfirmed) deleteProduct(id); });
}

async function deleteProduct(id) {
    try { await apiCall('delete_product',{method:'POST',body:JSON.stringify({id})}); appState.products=appState.products.filter(p=>p.id!=id); renderProductList(); showToast('Produto excluído!'); }
    catch(e) {}
}

// ─────────────────────────────────────────────
// ABA TABELA DE PREÇOS – MASTER / DETAIL
// ─────────────────────────────────────────────

function renderPriceTableTab() {
    // Se uma tabela está selecionada → mostra detail
    if (localState.selectedTableId) {
        renderPriceTableDetail();
        return;
    }
    // Caso contrário → mostra lista master
    renderPriceTableMaster();
}

// ---- MASTER: Lista de tabelas de preço ----

function renderPriceTableMaster() {
    const { permissions } = appState.currentUser;
    const tables = appState.priceTable || [];
    const term = localState.ptSearch.toLowerCase();
    const filtered = tables.filter(t => t.codigo?.toLowerCase().includes(term) || t.nome_tabela?.toLowerCase().includes(term));
    const perPage=10, total=Math.ceil(filtered.length/perPage);
    if (localState.ptPage > total && total > 0) localState.ptPage = total;
    if (localState.ptPage < 1) localState.ptPage = 1;
    const paged = filtered.slice((localState.ptPage-1)*perPage, localState.ptPage*perPage);

    document.getElementById('catalog-tab-content').innerHTML = `
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <div class="relative flex-1 max-w-xs">
                <input type="text" id="pt-search" placeholder="Buscar tabela..." class="form-input w-full" value="${localState.ptSearch||''}">
                <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            ${permissions.canCreateProduct ? `<button id="add-pt-btn" class="btn btn-primary btn-sm"><i class="fas fa-plus mr-1"></i>Nova Tabela</button>` : ''}
        </div>
        <div class="bg-white rounded-lg shadow-sm border flex-1 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0 z-10"><tr>
                    <th class="table-header w-28">Código</th>
                    <th class="table-header">Nome da Tabela</th>
                    <th class="table-header text-center w-24">Itens</th>
                    <th class="table-header text-right w-32">Ações</th>
                </tr></thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${paged.map(t => `
                        <tr class="pt-master-row ${localState.selectedTableId==t.id?'selected':''}" data-id="${t.id}">
                            <td class="table-cell font-mono font-bold text-blue-700">${t.codigo||'—'}</td>
                            <td class="table-cell">
                                <span class="font-semibold text-gray-900">${t.nome_tabela||''}</span>
                            </td>
                            <td class="table-cell text-center">
                                <span class="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                                    ${(t.itens||[]).length} ${(t.itens||[]).length===1?'item':'itens'}
                                </span>
                            </td>
                            <td class="table-cell text-right space-x-1" onclick="event.stopPropagation()">
                                ${permissions.canCreateProduct ? `<button class="action-btn edit-pt-btn" title="Editar Tabela" data-id="${t.id}"><i class="fas fa-pencil-alt"></i></button>` : ''}
                                ${permissions.canDeleteProduct ? `<button class="action-btn delete-pt-btn" title="Excluir Tabela" data-id="${t.id}"><i class="fas fa-trash-alt text-red-500"></i></button>` : ''}
                                <button class="action-btn text-blue-600 open-pt-btn" title="Abrir Itens" data-id="${t.id}"><i class="fas fa-list-ul"></i></button>
                            </td>
                        </tr>
                    `).join('') || `<tr><td colspan="4" class="text-center py-10 text-gray-500">Nenhuma tabela de preço cadastrada.<br><span class="text-sm">Clique em "Nova Tabela" para começar.</span></td></tr>`}
                </tbody>
            </table>
            <div class="p-3 flex justify-between items-center border-t text-sm">
                <span class="text-gray-500">${paged.length} de ${filtered.length} tabelas</span>
                <div class="flex items-center gap-2">
                    <button id="pt-prev" class="btn btn-secondary btn-sm" ${localState.ptPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
                    <span>Pág. ${localState.ptPage}/${total||1}</span>
                    <button id="pt-next" class="btn btn-secondary btn-sm" ${localState.ptPage>=total?'disabled':''}><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('pt-search')?.addEventListener('input', e => { localState.ptSearch = e.target.value; renderPriceTableMaster(); });
    document.getElementById('add-pt-btn')?.addEventListener('click', () => openPriceTableHeaderModal(null));
    document.querySelectorAll('.open-pt-btn, .pt-master-row').forEach(el => el.addEventListener('click', e => {
        const row = e.currentTarget.closest('[data-id]') || e.currentTarget;
        if (e.target.closest('.edit-pt-btn, .delete-pt-btn')) return;
        localState.selectedTableId = parseInt(row.dataset.id);
        localState.ptItemSearch = ''; localState.ptItemPage = 1;
        renderPriceTableDetail();
    }));
    document.querySelectorAll('.edit-pt-btn').forEach(b => b.addEventListener('click', e => {
        const t = (appState.priceTable||[]).find(x => x.id == e.currentTarget.dataset.id);
        if (t) openPriceTableHeaderModal(t);
    }));
    document.querySelectorAll('.delete-pt-btn').forEach(b => b.addEventListener('click', e => confirmDeletePriceTable(e.currentTarget.dataset.id)));
    document.getElementById('pt-prev')?.addEventListener('click', () => { localState.ptPage--; renderPriceTableMaster(); });
    document.getElementById('pt-next')?.addEventListener('click', () => { localState.ptPage++; renderPriceTableMaster(); });
}

// ---- Modal de cabeçalho (Nova / Editar Tabela) ----

function openPriceTableHeaderModal(table) {
    localState.editingPriceTable = table ? { ...table } : {};
    const d = localState.editingPriceTable;
    const content = `<form id="modal-form" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">Código*</label><input type="text" name="codigo" required class="form-input" value="${d.codigo||''}"></div>
            <div class="sm:col-span-2"><label class="form-label">Nome da Tabela*</label><input type="text" name="nome_tabela" required class="form-input" value="${d.nome_tabela||''}"></div>
        </div>
    </form>`;
    renderModal(d.id ? 'Editar Tabela de Preço' : 'Nova Tabela de Preço', content, savePriceTableHeader);
}

async function savePriceTableHeader(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    data.id = localState.editingPriceTable?.id;
    const action = data.id ? 'update_price_table' : 'create_price_table';
    try {
        const result = await apiCall(action, { method:'POST', body:JSON.stringify(data) });
        if (!appState.priceTable) appState.priceTable = [];
        if (data.id) {
            const idx = appState.priceTable.findIndex(t => t.id == result.table.id);
            if (idx !== -1) appState.priceTable[idx] = result.table; else appState.priceTable.push(result.table);
        } else {
            appState.priceTable.push(result.table);
        }
        showToast(data.id ? 'Tabela atualizada!' : 'Tabela criada!');
        closeModal();
        renderPriceTableMaster();
    } catch(e) {}
}

async function confirmDeletePriceTable(id) {
    const t = (appState.priceTable||[]).find(x => x.id == id); if (!t) return;
    Swal.fire({title:'Excluir tabela?', text:`"${t.nome_tabela}" e todos os seus itens serão removidos.`, icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Excluir', cancelButtonText:'Cancelar'})
        .then(async r => {
            if (!r.isConfirmed) return;
            try {
                await apiCall('delete_price_table', { method:'POST', body:JSON.stringify({id}) });
                appState.priceTable = appState.priceTable.filter(x => x.id != id);
                showToast('Tabela excluída!'); renderPriceTableMaster();
            } catch(e) {}
        });
}

// ---- DETAIL: Itens de uma tabela de preço ----

function renderPriceTableDetail() {
    const { permissions } = appState.currentUser;
    const table = (appState.priceTable||[]).find(t => t.id === localState.selectedTableId);
    if (!table) { localState.selectedTableId = null; renderPriceTableMaster(); return; }

    const term = localState.ptItemSearch.toLowerCase();
    const items = (table.itens||[]).filter(i =>
        i.referencia?.toLowerCase().includes(term) ||
        i.descricao?.toLowerCase().includes(term) ||
        i.fabricante?.toLowerCase().includes(term)
    );
    const perPage=15, total=Math.ceil(items.length/perPage);
    if (localState.ptItemPage > total && total > 0) localState.ptItemPage = total;
    if (localState.ptItemPage < 1) localState.ptItemPage = 1;
    const paged = items.slice((localState.ptItemPage-1)*perPage, localState.ptItemPage*perPage);

    document.getElementById('catalog-tab-content').innerHTML = `
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 mb-4 text-sm">
            <button id="pt-back-btn" class="text-blue-600 hover:underline flex items-center gap-1"><i class="fas fa-arrow-left"></i>Tabelas de Preço</button>
            <span class="text-gray-400">/</span>
            <span class="font-semibold text-gray-700">${table.codigo} – ${table.nome_tabela}</span>
        </div>

        <!-- Cabeçalho do detalhe -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex justify-between items-start">
            <div>
                <p class="text-xs text-blue-500 font-semibold uppercase tracking-wide">Tabela de Preço</p>
                <p class="text-lg font-bold text-blue-900">${table.nome_tabela}</p>
                <p class="text-sm text-blue-600">Código: <span class="font-mono font-bold">${table.codigo}</span> · ${(table.itens||[]).length} iten(s) cadastrado(s)</p>
            </div>
            ${permissions.canCreateProduct ? `
            <div class="flex gap-2">
                <button id="edit-pt-header-btn" class="btn btn-secondary btn-sm"><i class="fas fa-pencil-alt mr-1"></i>Editar Tabela</button>
            </div>` : ''}
        </div>

        <!-- Toolbar dos itens -->
        <div class="flex flex-col sm:flex-row gap-2 mb-3">
            <div class="relative flex-1 max-w-xs">
                <input type="text" id="pt-item-search" placeholder="Buscar por referência, descrição..." class="form-input w-full" value="${localState.ptItemSearch||''}">
                <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            ${permissions.canCreateProduct ? `<button id="add-pt-item-btn" class="btn btn-primary btn-sm"><i class="fas fa-plus mr-1"></i>Novo Item</button>` : ''}
        </div>

        <!-- Grade de itens (estilo da imagem de referência) -->
        <div class="bg-white rounded-lg shadow-sm border flex-1 overflow-y-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="sticky top-0 z-10" style="background:#1d4ed8;">
                    <tr>
                        <th class="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wide">Referência</th>
                        <th class="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wide">Descrição</th>
                        <th class="px-3 py-2 text-right text-xs font-semibold text-white uppercase tracking-wide w-32">Valor Unit.</th>
                        <th class="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wide">Fabricante</th>
                        <th class="px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wide">Observações</th>
                        ${permissions.canCreateProduct ? `<th class="px-3 py-2 text-center text-xs font-semibold text-white uppercase tracking-wide w-20">Ações</th>` : ''}
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100">
                    ${paged.map((i, idx) => `
                        <tr class="hover:bg-blue-50 transition-colors ${idx%2===1?'bg-gray-50':''}">
                            <td class="px-3 py-2 text-sm font-mono font-semibold text-blue-700 whitespace-nowrap">${i.referencia||''}</td>
                            <td class="px-3 py-2 text-sm font-medium text-gray-900">${i.descricao||''}</td>
                            <td class="px-3 py-2 text-sm text-right font-semibold text-gray-900 whitespace-nowrap">${formatCurrency(i.valor_unitario)}</td>
                            <td class="px-3 py-2 text-sm text-gray-600">${i.fabricante||''}</td>
                            <td class="px-3 py-2 text-sm text-gray-500">${i.observacoes||''}</td>
                            ${permissions.canCreateProduct ? `
                            <td class="px-3 py-2 text-center space-x-1">
                                <button class="action-btn edit-pt-item-btn" title="Editar" data-id="${i.id}"><i class="fas fa-pencil-alt text-xs"></i></button>
                                ${permissions.canDeleteProduct ? `<button class="action-btn delete-pt-item-btn" title="Excluir" data-id="${i.id}"><i class="fas fa-trash-alt text-red-500 text-xs"></i></button>` : ''}
                            </td>` : ''}
                        </tr>
                    `).join('') || `<tr><td colspan="6" class="text-center py-10 text-gray-500">Nenhum item nesta tabela.<br><span class="text-sm">Clique em "Novo Item" para adicionar.</span></td></tr>`}
                </tbody>
            </table>
            <div class="p-3 flex justify-between items-center border-t text-sm text-gray-600">
                <span>${paged.length} de ${items.length} iten(s)</span>
                <div class="flex items-center gap-2">
                    <button id="pti-prev" class="btn btn-secondary btn-sm" ${localState.ptItemPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
                    <span>Pág. ${localState.ptItemPage}/${total||1}</span>
                    <button id="pti-next" class="btn btn-secondary btn-sm" ${localState.ptItemPage>=total?'disabled':''}><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('pt-back-btn')?.addEventListener('click', () => { localState.selectedTableId = null; renderPriceTableMaster(); });
    document.getElementById('edit-pt-header-btn')?.addEventListener('click', () => openPriceTableHeaderModal(table));
    document.getElementById('pt-item-search')?.addEventListener('input', e => { localState.ptItemSearch = e.target.value; renderPriceTableDetail(); });
    document.getElementById('add-pt-item-btn')?.addEventListener('click', () => openPriceItemModal(null));
    document.querySelectorAll('.edit-pt-item-btn').forEach(b => b.addEventListener('click', e => {
        const item = (table.itens||[]).find(x => x.id == e.currentTarget.dataset.id);
        if (item) openPriceItemModal(item);
    }));
    document.querySelectorAll('.delete-pt-item-btn').forEach(b => b.addEventListener('click', e => confirmDeletePriceItem(e.currentTarget.dataset.id)));
    document.getElementById('pti-prev')?.addEventListener('click', () => { localState.ptItemPage--; renderPriceTableDetail(); });
    document.getElementById('pti-next')?.addEventListener('click', () => { localState.ptItemPage++; renderPriceTableDetail(); });
}

// ---- Modal item (Novo / Editar) ----

function openPriceItemModal(item) {
    localState.editingPriceItem = item ? { ...item } : {};
    const d = localState.editingPriceItem;
    const content = `<form id="modal-form" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="form-label">Referência</label><input type="text" name="referencia" class="form-input" value="${d.referencia||''}"></div>
            <div><label class="form-label">Valor Unitário*</label><input type="text" name="valor_unitario" required class="form-input" value="${formatCurrencyForInput(d.valor_unitario)}"></div>
        </div>
        <div><label class="form-label">Descrição*</label><input type="text" name="descricao" required class="form-input" value="${d.descricao||''}"></div>
        <div><label class="form-label">Fabricante</label><input type="text" name="fabricante" class="form-input" value="${d.fabricante||''}"></div>
        <div><label class="form-label">Observações</label><textarea name="observacoes" rows="2" class="form-input">${d.observacoes||''}</textarea></div>
    </form>`;
    renderModal(d.id ? 'Editar Item' : 'Novo Item', content, savePriceItem);
    const vi = document.querySelector('input[name="valor_unitario"]');
    if (vi) vi.addEventListener('blur', e => { e.target.value = formatCurrencyForInput(parseCurrency(e.target.value)); });
}

async function savePriceItem(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    data.id = localState.editingPriceItem?.id;
    data.tabela_preco_id = localState.selectedTableId;
    data.valor_unitario = parseCurrency(data.valor_unitario);
    if (data.valor_unitario === null || data.valor_unitario < 0) { showToast('Valor inválido.', 'error'); return; }
    const action = data.id ? 'update_price_table_item' : 'create_price_table_item';
    try {
        const result = await apiCall(action, { method:'POST', body:JSON.stringify(data) });
        const table = (appState.priceTable||[]).find(t => t.id === localState.selectedTableId);
        if (table) {
            if (!table.itens) table.itens = [];
            if (data.id) { const idx = table.itens.findIndex(i => i.id == result.item.id); if(idx!==-1) table.itens[idx]=result.item; else table.itens.push(result.item); }
            else table.itens.push(result.item);
        }
        showToast(data.id ? 'Item atualizado!' : 'Item adicionado!'); closeModal(); renderPriceTableDetail();
    } catch(e) {}
}

async function confirmDeletePriceItem(id) {
    const table = (appState.priceTable||[]).find(t => t.id === localState.selectedTableId);
    const item = table?.itens?.find(i => i.id == id); if (!item) return;
    Swal.fire({title:'Excluir item?', text:`"${item.descricao}" será removido.`, icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Excluir', cancelButtonText:'Cancelar'})
        .then(async r => {
            if (!r.isConfirmed) return;
            try {
                await apiCall('delete_price_table_item', { method:'POST', body:JSON.stringify({id}) });
                if (table) table.itens = table.itens.filter(i => i.id != id);
                showToast('Item excluído!'); renderPriceTableDetail();
            } catch(e) {}
        });
}

// ─────────────────────────────────────────────
// ABA KITS / CONJUNTOS
// ─────────────────────────────────────────────

function renderKitsTab() {
    const { permissions } = appState.currentUser;
    document.getElementById('catalog-tab-content').innerHTML = `
        <div class="flex flex-col sm:flex-row gap-2 mb-4">
            <div class="relative flex-1 max-w-xs">
                <input type="text" id="kits-search" placeholder="Buscar kit..." class="form-input w-full" value="${localState.kitsSearch||''}">
                <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
            ${permissions.canCreateProduct ? `<button id="add-kit-btn" class="btn btn-primary btn-sm"><i class="fas fa-plus mr-1"></i>Novo Kit</button>` : ''}
        </div>
        <div id="kits-list-container" class="bg-white rounded-lg shadow-sm border flex-1 overflow-y-auto"></div>
    `;
    document.getElementById('kits-search')?.addEventListener('input', e => { localState.kitsSearch = e.target.value; renderKitsList(); });
    document.getElementById('add-kit-btn')?.addEventListener('click', () => openKitModal(null));
    renderKitsList();
}

function renderKitsList() {
    const c = document.getElementById('kits-list-container'); if (!c) return;
    const { permissions } = appState.currentUser;
    const term = localState.kitsSearch.toLowerCase();
    const kits = (appState.kits||[]).filter(k => k.nome?.toLowerCase().includes(term) || k.codigo?.toLowerCase().includes(term));
    const perPage=10, total=Math.ceil(kits.length/perPage);
    if (localState.kitsPage > total && total > 0) localState.kitsPage = total;
    if (localState.kitsPage < 1) localState.kitsPage = 1;
    const paged = kits.slice((localState.kitsPage-1)*perPage, localState.kitsPage*perPage);
    c.innerHTML = `
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50"><tr>
                    <th class="table-header w-24">Código</th><th class="table-header">Nome do Kit</th>
                    <th class="table-header text-center w-24">Itens</th><th class="table-header text-right w-36">Valor Total</th>
                    <th class="table-header text-right w-24">Ações</th>
                </tr></thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${paged.map(k => `<tr class="hover:bg-gray-50">
                        <td class="table-cell font-mono font-bold text-blue-700 text-sm">${k.codigo||'—'}</td>
                        <td class="table-cell">
                            <p class="font-semibold text-gray-900">${k.nome||''}</p>
                            ${k.descricao?`<p class="text-xs text-gray-500">${k.descricao}</p>`:''}
                            <div class="mt-1 flex flex-wrap gap-1">
                                ${(k.itens||[]).slice(0,4).map(i=>`<span class="inline-block bg-blue-50 text-blue-700 text-xs px-1.5 py-0.5 rounded">${i.descricao||i.referencia||''}</span>`).join('')}
                                ${(k.itens||[]).length>4?`<span class="text-xs text-gray-400">+${(k.itens||[]).length-4} mais</span>`:''}
                            </div>
                        </td>
                        <td class="table-cell text-center"><span class="bg-gray-100 px-2 py-1 rounded-full text-sm font-semibold">${(k.itens||[]).length}</span></td>
                        <td class="table-cell text-right font-bold text-green-700 text-base">${formatCurrency(k.valor_total)}</td>
                        <td class="table-cell text-right space-x-1">
                            ${permissions.canCreateProduct?`<button class="action-btn edit-kit-btn" data-id="${k.id}"><i class="fas fa-pencil-alt"></i></button>`:''}
                            ${permissions.canDeleteProduct?`<button class="action-btn delete-kit-btn" data-id="${k.id}"><i class="fas fa-trash-alt text-red-500"></i></button>`:''}
                        </td></tr>`).join('')||`<tr><td colspan="5" class="text-center py-10 text-gray-500">Nenhum kit cadastrado.<br><span class="text-sm">Clique em "Novo Kit" para começar.</span></td></tr>`}
                </tbody>
            </table>
            <div class="p-3 flex justify-between items-center border-t text-sm text-gray-500">
                <span>${paged.length} de ${kits.length} kits</span>
                <div class="flex items-center gap-2">
                    <button id="kits-prev" class="btn btn-secondary btn-sm" ${localState.kitsPage===1?'disabled':''}><i class="fas fa-chevron-left"></i></button>
                    <span>Pág. ${localState.kitsPage}/${total||1}</span>
                    <button id="kits-next" class="btn btn-secondary btn-sm" ${localState.kitsPage>=total?'disabled':''}><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
        </div>
    `;
    document.querySelectorAll('.edit-kit-btn').forEach(b => b.addEventListener('click', e => { const k=(appState.kits||[]).find(x=>x.id==e.currentTarget.dataset.id); if(k) openKitModal(k); }));
    document.querySelectorAll('.delete-kit-btn').forEach(b => b.addEventListener('click', e => confirmDeleteKit(e.currentTarget.dataset.id)));
    document.getElementById('kits-prev')?.addEventListener('click', () => { localState.kitsPage--; renderKitsList(); });
    document.getElementById('kits-next')?.addEventListener('click', () => { localState.kitsPage++; renderKitsList(); });
}

// ---- Modal Kit ----

function openKitModal(kit) {
    localState.editingKit = kit ? { ...kit } : {};
    localState.kitItems   = kit ? (kit.itens||[]).map(i => ({ ...i })) : [];
    renderKitModal();
}

function renderKitModal() {
    const d = localState.editingKit;

    // Monta opções agrupadas por tabela de preço
    const tablesOpts = (appState.priceTable||[]).map(t => {
        const opts = (t.itens||[]).map(i => `<option value="${i.id}" data-price="${i.valor_unitario}" data-ref="${i.referencia||''}" data-desc="${i.descricao||''}" data-fab="${i.fabricante||''}">${i.referencia ? i.referencia+' – ' : ''}${i.descricao}</option>`).join('');
        return opts ? `<optgroup label="${t.codigo} – ${t.nome_tabela}">${opts}</optgroup>` : '';
    }).join('');

    const valorTotal = localState.kitItems.reduce((s, i) => s + ((i.valor_unitario_snapshot||0) * (i.quantidade||1)), 0);

    const itemsRows = localState.kitItems.length === 0
        ? `<tr><td colspan="5" class="text-center py-4 text-gray-400 text-sm">Nenhum item adicionado ainda.</td></tr>`
        : localState.kitItems.map((item, idx) => {
            const sub = (item.valor_unitario_snapshot||0) * (item.quantidade||1);
            return `<tr>
                <td class="px-3 py-1.5 text-xs font-mono text-blue-700">${item.referencia||''}</td>
                <td class="px-3 py-1.5 text-sm font-medium">${item.descricao||''}</td>
                <td class="px-2 py-1.5"><input type="number" min="1" value="${item.quantidade||1}" class="form-input w-16 text-center text-sm kit-qty-input" data-idx="${idx}"></td>
                <td class="px-3 py-1.5 text-sm text-right font-semibold text-green-700">${formatCurrency(sub)}</td>
                <td class="px-2 py-1.5 text-center"><button class="action-btn text-red-500 remove-kit-item" data-idx="${idx}"><i class="fas fa-times text-xs"></i></button></td>
            </tr>`;
        }).join('');

    const content = `<div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label class="form-label">Código</label><input type="text" id="kit-codigo" class="form-input" value="${d.codigo||''}"></div>
            <div class="sm:col-span-2"><label class="form-label">Nome do Kit*</label><input type="text" id="kit-nome" class="form-input" value="${d.nome||''}"></div>
        </div>
        <div><label class="form-label">Descrição</label><textarea id="kit-descricao" rows="2" class="form-input">${d.descricao||''}</textarea></div>

        <!-- Adicionar item -->
        <div class="border rounded-lg p-3 bg-gray-50">
            <p class="text-sm font-semibold text-gray-700 mb-2"><i class="fas fa-plus-circle text-blue-600 mr-1"></i>Adicionar Item</p>
            <div class="flex flex-col sm:flex-row gap-2">
                <select id="kit-item-select" class="form-input flex-1">
                    <option value="">— Selecione da Tabela de Preço —</option>
                    ${tablesOpts}
                </select>
                <input type="number" id="kit-item-qty" min="1" value="1" class="form-input w-20 text-center" placeholder="Qtd">
                <button id="kit-add-item-btn" class="btn btn-primary btn-sm whitespace-nowrap"><i class="fas fa-plus mr-1"></i>Add</button>
            </div>
        </div>

        <!-- Lista de itens -->
        <div class="border rounded-lg overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead style="background:#1d4ed8;"><tr>
                    <th class="px-3 py-2 text-left text-xs text-white font-semibold uppercase">Ref.</th>
                    <th class="px-3 py-2 text-left text-xs text-white font-semibold uppercase">Item</th>
                    <th class="px-2 py-2 text-center text-xs text-white font-semibold uppercase w-16">Qtd</th>
                    <th class="px-3 py-2 text-right text-xs text-white font-semibold uppercase w-28">Subtotal</th>
                    <th class="px-2 py-2 text-center text-xs text-white font-semibold uppercase w-10">✕</th>
                </tr></thead>
                <tbody id="kit-items-tbody" class="bg-white divide-y divide-gray-100">${itemsRows}</tbody>
            </table>
            <div class="bg-gray-50 px-4 py-2 border-t flex justify-end items-center gap-3">
                <span class="text-sm text-gray-600 font-medium">Valor Total do Kit:</span>
                <span id="kit-total-value" class="text-xl font-bold text-green-700">${formatCurrency(valorTotal)}</span>
            </div>
        </div>
    </div>`;

    renderModal(d.id ? 'Editar Kit' : 'Novo Kit / Conjunto', content, saveKit);

    document.getElementById('kit-add-item-btn')?.addEventListener('click', () => {
        const sel = document.getElementById('kit-item-select');
        const qty = Math.max(1, parseInt(document.getElementById('kit-item-qty')?.value)||1);
        if (!sel.value) { showToast('Selecione um item.', 'error'); return; }
        const opt = sel.options[sel.selectedIndex];
        const existing = localState.kitItems.find(i => i.tabela_preco_item_id == parseInt(sel.value));
        if (existing) { existing.quantidade += qty; }
        else {
            localState.kitItems.push({
                tabela_preco_item_id: parseInt(sel.value),
                referencia: opt.dataset.ref || '',
                descricao:  opt.dataset.desc || '',
                fabricante: opt.dataset.fab  || '',
                quantidade: qty,
                valor_unitario_snapshot: parseFloat(opt.dataset.price)||0,
            });
        }
        sel.value = ''; document.getElementById('kit-item-qty').value = 1;
        refreshKitItemsTable();
    });

    document.getElementById('kit-items-tbody')?.addEventListener('click', e => {
        const btn = e.target.closest('.remove-kit-item');
        if (!btn) return;
        localState.kitItems.splice(parseInt(btn.dataset.idx), 1);
        refreshKitItemsTable();
    });

    document.getElementById('kit-items-tbody')?.addEventListener('change', e => {
        const inp = e.target.closest('.kit-qty-input');
        if (!inp) return;
        localState.kitItems[parseInt(inp.dataset.idx)].quantidade = Math.max(1, parseInt(inp.value)||1);
        refreshKitItemsTable();
    });
}

function refreshKitItemsTable() {
    const tbody = document.getElementById('kit-items-tbody');
    const totalEl = document.getElementById('kit-total-value');
    if (!tbody) return;
    if (localState.kitItems.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-gray-400 text-sm">Nenhum item adicionado ainda.</td></tr>`;
        if (totalEl) totalEl.textContent = formatCurrency(0);
        return;
    }
    let total = 0;
    tbody.innerHTML = localState.kitItems.map((item, idx) => {
        const sub = (item.valor_unitario_snapshot||0) * (item.quantidade||1);
        total += sub;
        return `<tr>
            <td class="px-3 py-1.5 text-xs font-mono text-blue-700">${item.referencia||''}</td>
            <td class="px-3 py-1.5 text-sm font-medium">${item.descricao||''}</td>
            <td class="px-2 py-1.5"><input type="number" min="1" value="${item.quantidade}" class="form-input w-16 text-center text-sm kit-qty-input" data-idx="${idx}"></td>
            <td class="px-3 py-1.5 text-sm text-right font-semibold text-green-700">${formatCurrency(sub)}</td>
            <td class="px-2 py-1.5 text-center"><button class="action-btn text-red-500 remove-kit-item" data-idx="${idx}"><i class="fas fa-times text-xs"></i></button></td>
        </tr>`;
    }).join('');
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

async function saveKit() {
    const nome = document.getElementById('kit-nome')?.value?.trim();
    if (!nome) { showToast('Nome do Kit é obrigatório.', 'error'); return; }
    const payload = {
        id:       localState.editingKit?.id,
        codigo:   document.getElementById('kit-codigo')?.value?.trim() || null,
        nome,
        descricao: document.getElementById('kit-descricao')?.value?.trim() || null,
        itens: localState.kitItems.map(i => ({
            tabela_preco_item_id: i.tabela_preco_item_id,
            quantidade:           i.quantidade,
            valor_unitario_snapshot: i.valor_unitario_snapshot,
        })),
    };
    try {
        const result = await apiCall(payload.id ? 'update_kit' : 'create_kit', { method:'POST', body:JSON.stringify(payload) });
        if (!appState.kits) appState.kits = [];
        if (payload.id) { const idx=appState.kits.findIndex(k=>k.id==result.kit.id); if(idx!==-1) appState.kits[idx]=result.kit; else appState.kits.push(result.kit); }
        else appState.kits.push(result.kit);
        showToast(payload.id ? 'Kit atualizado!' : 'Kit criado!'); closeModal(); renderKitsList();
    } catch(e) {}
}

async function confirmDeleteKit(id) {
    const k = (appState.kits||[]).find(x => x.id == id); if (!k) return;
    Swal.fire({title:'Excluir Kit?', text:`"${k.nome}" será removido.`, icon:'warning', showCancelButton:true, confirmButtonColor:'#d33', cancelButtonColor:'#3085d6', confirmButtonText:'Excluir', cancelButtonText:'Cancelar'})
        .then(async r => {
            if (!r.isConfirmed) return;
            try {
                await apiCall('delete_kit', { method:'POST', body:JSON.stringify({id}) });
                appState.kits = appState.kits.filter(k => k.id != id);
                showToast('Kit excluído!'); renderKitsList();
            } catch(e) {}
        });
}
