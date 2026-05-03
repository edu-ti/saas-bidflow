import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, Eye, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, DollarSign, Boxes, X, ChevronDown, Filter, Warehouse, Lock, ShieldCheck, Zap, BarChart3, TrendingDown, Target, Loader2, Layout, Activity, Database
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import Modal from '../ui/Modal';

interface InventoryProduct {
  id: number;
  sku: string;
  barcode: string;
  product_id: number;
  product?: { name: string };
  brand_id: number;
  brand?: { name: string };
  category_id: number;
  category?: { name: string };
  unit_id: number;
  unit?: { name: string; acro: string };
  status_id: number;
  status?: { name: string };
  depot_id: number;
  depot?: { name: string };
  cost_price: number;
  markup: number;
  sale_price: number;
  on_hand_qty: number;
  reserved_qty: number;
  min_stock: number;
  max_stock: number;
}

interface DashboardStats {
  total_products: number;
  total_value: number;
  low_stock: number;
  out_of_stock: number;
}

const InventoryDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'movements' | 'settings'>('products');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [depots, setDepots] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    product_id: '', sku: '', barcode: '', brand_id: '', category_id: '',
    unit_id: '', status_id: '', depot_id: '', cost_price: 0, markup: 0,
    sale_price: 0, on_hand_qty: 0, min_stock: 0, max_stock: 0,
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/inventory/dashboard');
      setDashboardStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/inventory/products?search=${searchTerm}`);
      setProducts(res.data.data || res.data || []);
    } catch (err) { toast.error('Erro na sincronização de estoque'); }
    finally { setLoading(false); }
  }, [searchTerm]);

  const fetchDependencies = async () => {
    try {
      const [brandsRes, catsRes, unitsRes, statsRes, depotsRes] = await Promise.all([
        api.get('/api/inventory/brands'),
        api.get('/api/inventory/categories'),
        api.get('/api/inventory/units'),
        api.get('/api/inventory/statuses'),
        api.get('/api/inventory/depots'),
      ]);
      setBrands(brandsRes.data || []);
      setCategories(catsRes.data || []);
      setUnits(unitsRes.data || []);
      setStatuses(statsRes.data || []);
      setDepots(depotsRes.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDashboard();
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
  }, [activeTab, fetchProducts]);

  const handleOpenModal = (product?: InventoryProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_id: product.product_id?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        brand_id: product.brand_id?.toString() || '',
        category_id: product.category_id?.toString() || '',
        unit_id: product.unit_id?.toString() || '',
        status_id: product.status_id?.toString() || '',
        depot_id: product.depot_id?.toString() || '',
        cost_price: product.cost_price,
        markup: product.markup,
        sale_price: product.sale_price,
        on_hand_qty: product.on_hand_qty,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_id: '', sku: '', barcode: '', brand_id: '', category_id: '',
        unit_id: '', status_id: '', depot_id: '', cost_price: 0, markup: 0,
        sale_price: 0, on_hand_qty: 0, min_stock: 0, max_stock: 0,
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) await api.put(`/api/inventory/products/${editingProduct.id}`, formData);
      else await api.post('/api/inventory/products', formData);
      toast.success('Inventário atualizado.');
      setShowModal(false);
      fetchProducts();
      fetchDashboard();
    } catch (err) { toast.error('Erro ao salvar produto'); }
    finally { setLoading(false); }
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700 overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Asset & <span className="text-gradient-gold">Inventory Control</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Warehouse size={14} className="text-primary" />
            Gestão estratégica de ativos, SKUs e movimentações logísticas Platinum.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Registrar Ativo Neural
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total SKUs Ativos', val: dashboardStats?.total_products, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Valuation de Estoque', val: formatCurrency(dashboardStats?.total_value || 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Alerta de Baixa', val: dashboardStats?.low_stock, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Ruptura de Fluxo', val: dashboardStats?.out_of_stock, icon: Boxes, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-8 flex items-center justify-between group bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">{stat.label}</p>
              <p className="text-2xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-500">{stat.val || 0}</p>
            </div>
            <div className={`w-16 h-16 rounded-2xl ${stat.bg} border border-border-subtle flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-inner-platinum`}>
              <stat.icon size={28} className="shadow-platinum-glow-sm" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 bg-surface-elevated/20 border border-border-subtle/30 p-2.5 rounded-[3rem] w-fit shadow-platinum-glow-sm backdrop-blur-md">
        {[
          { id: 'products', label: 'Estoque Local' },
          { id: 'movements', label: 'Movimentações RPA' },
          { id: 'settings', label: 'Parâmetros Core' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-10 py-4 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === tab.id 
                ? 'bg-primary text-white shadow-platinum-glow' 
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
          <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle/30">
            <div className="relative max-w-xl group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Rastrear SKU ou Identificador Digital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              />
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">SKU / Identidade</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Ativo / Marca Platinum</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Físico</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Disponibilidade</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Valuation</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {loading ? (
                  <tr><td colSpan={6} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest animate-pulse"><Loader2 className="animate-spin inline mr-6 w-12 h-12 text-primary" /> Sincronizando Ativos Globais...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest opacity-40">Nenhum ativo localizado no ledger</td></tr>
                ) : products.map(product => (
                  <tr key={product.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-300">
                    <td className="px-10 py-8">
                      <div className="font-mono text-[11px] font-black text-primary group-hover:scale-110 transition-transform w-fit bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 shadow-platinum-glow-sm">{product.sku || 'N/A_SKU'}</div>
                      <div className="text-[10px] text-text-muted font-black mt-2.5 uppercase tracking-widest opacity-50">{product.barcode || 'NO_BARCODE'}</div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-text-primary uppercase text-sm tracking-tight group-hover:text-primary transition-colors">{product.product?.name || 'Item não Catalogado'}</div>
                      <div className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-widest opacity-60 flex items-center gap-2">
                         <Target size={12} className="text-primary/60" />
                         {product.brand?.name || 'Marca Genérica'}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center font-black text-text-primary text-base tracking-tighter">{product.on_hand_qty || 0}</td>
                    <td className="px-10 py-8 text-center">
                      <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border backdrop-blur-md shadow-platinum-glow-sm ${
                        (product.on_hand_qty - product.reserved_qty) > 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 inline-block animate-pulse" />
                        {product.on_hand_qty - product.reserved_qty} {product.unit?.acro || 'UN'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-black text-text-primary text-sm tracking-tighter group-hover:text-primary transition-colors">{formatCurrency(product.sale_price)}</span>
                        <span className="text-[9px] text-text-muted uppercase tracking-[0.3em] font-black italic opacity-50">Markup: {product.markup}%</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                        <button onClick={() => handleOpenModal(product)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Editar Ativo"><Edit2 size={18} /></button>
                        <button className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum" title="Remover Ativo"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {[
            { label: 'Marcas Estratégicas', count: brands.length, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Categorias de Ativo', count: categories.length, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Unidades de Medida', count: units.length, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Depósitos Logísticos', count: depots.length, icon: Warehouse, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((set, i) => (
            <div key={i} className="platinum-card p-10 flex flex-col gap-12 group hover:border-primary/40 transition-all duration-700 bg-surface-elevated/10 backdrop-blur-md shadow-platinum-glow-sm">
              <div className="flex justify-between items-start">
                <div className={`w-16 h-16 rounded-[2rem] ${set.bg} border border-border-subtle flex items-center justify-center ${set.color} group-hover:scale-110 transition-transform duration-700 shadow-inner-platinum`}>
                  <set.icon size={32} className="shadow-platinum-glow-sm" />
                </div>
                <button className="text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:text-primary-hover transition-colors flex items-center gap-2 border-b border-primary/20 pb-1">
                  Gerenciar <ChevronDown size={14} className="opacity-60" />
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-text-muted opacity-60">{set.label}</p>
                <p className="text-4xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-700">{set.count}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'REFINAR ATIVO DE INVENTÁRIO' : 'INTEGRAR NOVO ATIVO NEURAL'} size="lg">
        <form onSubmit={handleSave} className="p-4 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">SKU Estratégico Platinum</label>
              <div className="relative">
                <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/30 shadow-inner-platinum font-mono" placeholder="Ex: SKU-NEURAL-882" />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Depósito Logístico Alvo</label>
              <div className="relative">
                 <Warehouse className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                <select value={formData.depot_id} onChange={e => setFormData({ ...formData, depot_id: e.target.value })} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-xs font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none appearance-none cursor-pointer shadow-inner-platinum">
                  <option value="" className="bg-surface">Selecionar Unidade Logística...</option>
                  {depots.map(d => <option key={d.id} value={d.id} className="bg-surface font-bold text-text-primary">{d.name.toUpperCase()}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted opacity-40" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Custo Unitário (BRL)</label>
              <div className="relative">
                <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                <input type="number" step="0.01" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: Number(e.target.value) })} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum" />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Markup Operacional (%)</label>
              <div className="relative">
                <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                <input type="number" step="0.01" value={formData.markup} onChange={e => setFormData({ ...formData, markup: Number(e.target.value) })} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum" />
              </div>
            </div>
            <div className="space-y-4 group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Soma Física em Estoque</label>
              <div className="relative">
                <Boxes className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                <input type="number" value={formData.on_hand_qty} onChange={e => setFormData({ ...formData, on_hand_qty: Number(e.target.value) })} className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
            <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 text-text-muted font-black hover:text-text-primary transition-all text-[10px] uppercase tracking-[0.4em]">Descartar</button>
            <button type="submit" className="btn-primary py-5 px-14 shadow-platinum-glow flex items-center gap-4 uppercase text-[11px] tracking-[0.4em]">
               <ShieldCheck size={22} className="shadow-platinum-glow-sm" />
               {editingProduct ? 'Consolidar Mudanças' : 'Validar Entrada Neural'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;
