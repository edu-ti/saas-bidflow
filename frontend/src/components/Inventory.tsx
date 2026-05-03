import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, DollarSign, Boxes, X, Filter, Warehouse, ShieldCheck, Zap, Globe, Activity, Database, ChevronRight, Layout, BarChart3, Target
} from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

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
  ncm?: string;
  cest?: string;
}

interface InventoryBrand {
  id: number;
  name: string;
  active: boolean;
}

interface InventoryCategory {
  id: number;
  name: string;
  code: string;
}

interface InventoryUnit {
  id: number;
  name: string;
  acro: string;
}

interface InventoryStatus {
  id: number;
  name: string;
  color: string;
}

interface InventoryDepot {
  id: number;
  name: string;
  type: string;
}

interface Movement {
  id: number;
  type: string;
  date: string;
  categoryName: string;
  entity: string;
  totalValue: number;
}

interface DashboardStats {
  total_products: number;
  total_value: number;
  low_stock: number;
  out_of_stock: number;
  recent_movements: Movement[];
}

export default function Inventory() {
  const [activeTab, setActiveTab] = useState<'products' | 'movements' | 'settings'>('products');
  const [loading, setLoading] = useState(false);
  
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  
  const [brands, setBrands] = useState<InventoryBrand[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [units, setUnits] = useState<InventoryUnit[]>([]);
  const [statuses, setStatuses] = useState<InventoryStatus[]>([]);
  const [depots, setDepots] = useState<InventoryDepot[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsModalType, setSettingsModalType] = useState('');
  const [settingsFormData, setSettingsFormData] = useState({
    name: '',
    code: '',
    acro: '',
    description: '',
    type: 'Físico',
    color: '#CE9C62',
    active: true,
  });

  const [formData, setFormData] = useState({
    product_id: '',
    sku: '',
    barcode: '',
    brand_id: '',
    category_id: '',
    unit_id: '',
    status_id: '',
    depot_id: '',
    cost_price: 0,
    markup: 0,
    sale_price: 0,
    on_hand_qty: 0,
    min_stock: 0,
    max_stock: 0,
    ncm: '',
    cest: '',
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/inventory/dashboard');
      setDashboardStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await api.get(`/api/inventory/products?${params}`);
      setProducts(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter]);

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
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get('/api/inventory/movements');
      setMovements(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchDependencies();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'movements') {
      fetchMovements();
    }
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
        ncm: product.ncm || '',
        cest: product.cest || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_id: '',
        sku: '',
        barcode: '',
        brand_id: '',
        category_id: '',
        unit_id: '',
        status_id: '',
        depot_id: '',
        cost_price: 0,
        markup: 0,
        sale_price: 0,
        on_hand_qty: 0,
        min_stock: 0,
        max_stock: 0,
        ncm: '',
        cest: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        product_id: formData.product_id || null,
        brand_id: formData.brand_id || null,
        category_id: formData.category_id || null,
        unit_id: formData.unit_id || null,
        status_id: formData.status_id || null,
        depot_id: formData.depot_id || null,
      };

      if (editingProduct) {
        await api.put(`/api/inventory/products/${editingProduct.id}`, payload);
        toast.success('Ativo de estoque atualizado!');
      } else {
        await api.post('/api/inventory/products', payload);
        toast.success('Novo ativo de estoque registrado!');
      }

      setShowModal(false);
      fetchProducts();
      fetchDashboard();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro operacional no estoque');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Confirmar descarte definitivo deste ativo de estoque?')) return;
    
    try {
      await api.delete(`/api/inventory/products/${id}`);
      toast.success('Ativo removido do inventário.');
      fetchProducts();
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover ativo');
    }
  };

  const calculatePrice = (cost: number, markup: number) => {
    return cost * (1 + markup / 100);
  };

  const openSettingsModal = (type: string) => {
    setSettingsModalType(type);
    setSettingsFormData({
      name: '',
      code: '',
      acro: '',
      description: '',
      type: 'Físico',
      color: '#2563eb',
      active: true,
    });
    setShowSettingsModal(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = `/api/inventory/${settingsModalType}`;
      await api.post(endpoint, settingsFormData);
      toast.success('Configuração de estoque consolidada!');
      setShowSettingsModal(false);
      fetchDependencies();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao salvar diretriz');
    } finally {
      setLoading(false);
    }
  };

  const getSettingsLabel = () => {
    switch (settingsModalType) {
      case 'brands': return 'Marca';
      case 'categories': return 'Categoria';
      case 'units': return 'Unidade';
      case 'statuses': return 'Status';
      case 'depots': return 'Depósito';
      default: return 'Item';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const kpis = [
    { label: 'Matriz de SKUs', val: dashboardStats?.total_products || 0, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Valuation de Ativos', val: formatCurrency(dashboardStats?.total_value || 0), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Risco de Ruptura', val: dashboardStats?.low_stock || 0, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Indisponibilidade', val: dashboardStats?.out_of_stock || 0, icon: Boxes, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Asset & <span className="text-gradient-gold">Inventory Control</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Warehouse size={14} className="text-primary" />
            Gestão estratégica de ativos, valuation e logística global Platinum.
          </p>
        </div>
        <div className="flex items-center gap-5 bg-surface-elevated/20 border border-border-subtle/30 p-5 rounded-2xl shadow-inner-platinum">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic opacity-60">Saúde Logística</span>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md">Operação Estável</span>
          </div>
          <div className="w-px h-10 bg-border-subtle/30" />
          <Zap className="text-primary w-6 h-6 animate-pulse shadow-platinum-glow-sm" />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="platinum-card p-8 flex flex-col gap-8 group hover:border-primary/40 transition-all duration-500 bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow-sm">
            <div className={`w-14 h-14 rounded-2xl ${kpi.bg} border border-border-subtle flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner-platinum`}>
              <kpi.icon className={`w-7 h-7 ${kpi.color} group-hover:shadow-platinum-glow-sm transition-all`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">{kpi.label}</p>
              <p className="text-2xl font-black text-text-primary mt-3 tracking-tighter group-hover:text-primary transition-colors duration-500">{kpi.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 bg-surface-elevated/20 border border-border-subtle/30 p-2 rounded-[2.5rem] w-fit shadow-platinum-glow-sm backdrop-blur-md">
        {[
          { key: 'products', label: 'Matriz de Produtos', icon: Package },
          { key: 'movements', label: 'Log de Operações', icon: ArrowUpRight },
          { key: 'settings', label: 'Parâmetros Core', icon: Database },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-3 px-8 py-3 rounded-[2.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${
              activeTab === tab.key 
                ? 'bg-primary text-white shadow-platinum-glow' 
                : 'text-text-muted hover:text-text-primary hover:bg-surface-elevated/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
          <div className="p-8 bg-surface-elevated/20 border-b border-border-subtle/30 flex flex-wrap gap-8 items-center justify-between">
            <div className="relative max-w-xl w-full group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Rastrear por SKU, Identificador Digital ou Código de Barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-4.5 bg-background/50 border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary py-4.5 px-10 shadow-platinum-glow flex items-center gap-4 uppercase text-[10px] tracking-widest"
            >
              <Plus className="w-5 h-5" />
              Registrar Ativo Neural
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">SKU / ID</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Descrição do Ativo</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Marca / Categ.</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Físico</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-center">Disponível</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Custo</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Venda</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {loading ? (
                  <tr><td colSpan={8} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest animate-pulse"><Loader2 className="animate-spin inline mr-6 w-12 h-12 text-primary" /> Sincronizando Matriz...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={8} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest opacity-40">Nenhum ativo localizado na base estratégica</td></tr>
                ) : (
                  products.map(product => {
                    const available = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
                    return (
                      <tr key={product.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-500">
                        <td className="px-10 py-10 font-mono text-[11px] text-primary font-black uppercase tracking-widest">
                           <span className="bg-primary/5 px-2 py-1 rounded border border-primary/20 shadow-platinum-glow-sm">{product.sku || '---'}</span>
                        </td>
                        <td className="px-10 py-10">
                          <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-sm">{product.product?.name || 'Item não identificado'}</div>
                          <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-2.5 opacity-60 flex items-center gap-2">
                             <Warehouse size={12} className="text-primary/40" /> {product.depot?.name || 'Repositório Central'}
                          </div>
                        </td>
                        <td className="px-10 py-10">
                          <div className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">{product.brand?.name || 'Genérica'}</div>
                          <div className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-50">{product.category?.name || 'Miscelânea'}</div>
                        </td>
                        <td className="px-10 py-10 text-center font-black text-text-primary text-base tracking-tighter">{product.on_hand_qty || 0}</td>
                        <td className="px-10 py-10 text-center">
                          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-platinum-glow-sm ${
                            available > (product.min_stock || 0) 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                              : available > 0 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20 shadow-platinum-glow-sm'
                          }`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-current mr-2 inline-block animate-pulse" />
                            {available}
                          </span>
                        </td>
                        <td className="px-10 py-10 text-right text-text-muted font-black text-xs tracking-tighter">{formatCurrency(product.cost_price)}</td>
                        <td className="px-10 py-10 text-right font-black text-text-primary text-sm tracking-tighter group-hover:text-primary transition-colors">{formatCurrency(product.sale_price)}</td>
                        <td className="px-10 py-10 text-right">
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => handleOpenModal(product)} className="p-3 bg-surface-elevated/40 border border-border-subtle rounded-xl text-text-muted hover:text-primary transition-all shadow-inner-platinum" title="Refinar"><Edit2 size={18} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500/60 hover:text-red-500 transition-all shadow-inner-platinum" title="Arquivar"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
          <div className="p-10 border-b border-border-subtle/30 bg-surface-elevated/20 flex justify-between items-center">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.4em] flex items-center gap-4">
               <div className="w-1.5 h-6 bg-primary rounded-full shadow-platinum-glow" />
               Trilha de Auditoria Logística Core
            </h3>
            <div className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
               System Ledger Encrypted
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/40 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Operação</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Cronologia</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Categoria</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60">Origem / Destino</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.4em] text-text-muted opacity-60 text-right">Valuation Operacional</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/20">
                {movements.length === 0 ? (
                  <tr><td colSpan={5} className="px-10 py-40 text-center text-text-muted uppercase text-[10px] font-black tracking-widest opacity-40">Nenhuma movimentação auditada no ledger</td></tr>
                ) : (
                  movements.map(m => (
                    <tr key={m.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/10 duration-500">
                      <td className="px-10 py-10">
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 w-fit border backdrop-blur-md shadow-platinum-glow-sm ${
                          m.type === 'Entrada' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          {m.type === 'Entrada' ? <ArrowDownLeft size={14} className="animate-bounce" /> : <ArrowUpRight size={14} className="animate-pulse" />}
                          {m.type}
                        </span>
                      </td>
                      <td className="px-10 py-10 text-text-muted font-black text-[10px] uppercase tracking-widest opacity-60">{new Date(m.date).toLocaleString('pt-BR')}</td>
                      <td className="px-10 py-10 text-text-primary font-black uppercase tracking-tight text-xs">{m.categoryName || 'Fluxo Geral'}</td>
                      <td className="px-10 py-10 text-text-secondary font-bold text-xs uppercase tracking-tighter opacity-80">{m.entity || 'Core System'}</td>
                      <td className="px-10 py-10 text-right text-text-primary font-black text-sm tracking-tighter group-hover:text-primary transition-colors">{formatCurrency(m.totalValue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in zoom-in-95 duration-700">
          {[
            { label: 'Matriz de Marcas', count: brands.length, type: 'brands', icon: ShieldCheck, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Categorias Logísticas', count: categories.length, type: 'categories', icon: Filter, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Unidades de Medida', count: units.length, type: 'units', icon: Package, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Depósitos & Hubs', count: depots.length, type: 'depots', icon: Warehouse, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Status de Operação', count: statuses.length, type: 'statuses', icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((item, i) => (
            <div key={i} className="platinum-card p-10 flex flex-col gap-10 group hover:border-primary/40 transition-all duration-700 bg-surface-elevated/10 backdrop-blur-md border-border-subtle/30 shadow-platinum-glow-sm">
              <div className="flex justify-between items-start">
                <div className={`w-16 h-16 rounded-[2rem] ${item.bg} border border-border-subtle flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform duration-700 shadow-inner-platinum`}>
                  <item.icon size={32} className="shadow-platinum-glow-sm" />
                </div>
                <button onClick={() => openSettingsModal(item.type)} className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-primary-hover transition-all flex items-center gap-2 border-b border-primary/20 pb-1">+ Gerenciar</button>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">{item.label}</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-700">{item.count}</p>
                  <span className="text-[9px] text-text-muted font-black uppercase tracking-widest opacity-40">Entidades Ativas</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Inventory Product */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-surface-elevated border border-border-subtle/30 rounded-[2.5rem] shadow-platinum-glow w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 border-b border-border-subtle/30 bg-surface-elevated/20">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-4">
                  {editingProduct ? 'REFINAR' : 'NOVO'} <span className="text-gradient-gold">ATIVO DE ESTOQUE</span>
                </h2>
                <div className="flex items-center gap-3 text-[10px] text-text-muted font-black uppercase tracking-[0.3em] opacity-60">
                   <ShieldCheck size={14} className="text-primary" /> Consolidação de Dados Patrimoniais Auditáveis
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-inner-platinum">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-10 overflow-y-auto scrollbar-platinum space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">SKU / Identificador Único Neural</label>
                  <div className="relative">
                    <Package className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      placeholder="Ex: SKU-NEURAL-88X"
                    />
                  </div>
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Código de Barras Global (EAN)</label>
                  <div className="relative">
                    <Activity className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      placeholder="Identificação via Scan RPA"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Depósito Alvo Logístico</label>
                  <div className="relative">
                    <Warehouse className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                    <select
                      value={formData.depot_id}
                      onChange={(e) => setFormData({ ...formData, depot_id: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-xs font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                    >
                      <option value="" className="bg-surface">Selecionar Hub...</option>
                      {depots.map(d => (
                        <option key={d.id} value={d.id} className="bg-surface">{d.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Marca Estratégica Platinum</label>
                   <div className="relative">
                    <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-xs font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                    >
                      <option value="" className="bg-surface">Selecionar Marca...</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id} className="bg-surface">{b.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Categoria Operacional Core</label>
                  <div className="relative">
                    <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-12 py-5 text-xs font-black uppercase tracking-widest text-text-primary focus:border-primary/40 outline-none transition-all appearance-none cursor-pointer shadow-inner-platinum"
                    >
                      <option value="" className="bg-surface">Selecionar Categ...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id} className="bg-surface">{c.name.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-text-muted opacity-40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-10 pt-10 border-t border-border-subtle/30">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.5em] flex items-center gap-4"><div className="w-6 h-px bg-primary/30" /> Engenharia de Preços & Valuation <div className="w-6 h-px bg-primary/30" /></h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Preço Custo (BRL)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                        className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Markup Operacional (%)</label>
                    <div className="relative">
                      <Zap className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                      <input
                        type="number"
                        step="0.01"
                        value={formData.markup}
                        onChange={(e) => setFormData({ ...formData, markup: Number(e.target.value) })}
                        className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2">Valuation de Venda Final</label>
                    <div className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-8 py-5 text-base font-black text-primary tracking-tighter shadow-platinum-glow-sm flex items-center justify-between">
                       <span>BRL</span>
                       <span>{new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(calculatePrice(formData.cost_price, formData.markup))}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Volume Físico On-Hand</label>
                    <div className="relative">
                      <Boxes className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                      <input
                        type="number"
                        value={formData.on_hand_qty}
                        onChange={(e) => setFormData({ ...formData, on_hand_qty: Number(e.target.value) })}
                        className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Segurança Mínima (SLA)</label>
                    <div className="relative">
                       <AlertTriangle className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500/60 w-6 h-6" />
                      <input
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                        className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      />
                    </div>
                  </div>
                  <div className="space-y-4 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Capacidade Teto do Hub</label>
                    <div className="relative">
                      <Layout className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                      <input
                        type="number"
                        value={formData.max_stock}
                        onChange={(e) => setFormData({ ...formData, max_stock: Number(e.target.value) })}
                        className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-12 border-t border-border-subtle/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-10 py-5 text-[11px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.4em] transition-all"
                >
                  DESCARTAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-5 px-16 shadow-platinum-glow flex items-center gap-5 uppercase text-[12px] tracking-[0.5em] disabled:opacity-60"
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} className="shadow-platinum-glow-sm" />}
                  CONSOLIDAR ATIVO NEURAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Settings Settings */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-surface-elevated border border-border-subtle/30 rounded-[2.5rem] shadow-platinum-glow w-full max-w-lg overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center px-10 py-8 bg-surface-elevated/20 border-b border-border-subtle/30">
              <h2 className="text-xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-4">
                NOVO <span className="text-gradient-gold uppercase">{getSettingsLabel()}</span>
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-4 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-text-muted hover:text-text-primary transition-all shadow-inner-platinum">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-10 space-y-8">
              <div className="space-y-4 group">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Identificação Estratégica *</label>
                <div className="relative">
                   <Target className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/60 w-6 h-6" />
                  <input
                    type="text"
                    required
                    value={settingsFormData.name}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                    className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
                    placeholder={`Nome da ${getSettingsLabel()}`}
                  />
                </div>
              </div>

              {settingsModalType === 'units' && (
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] px-2 group-focus-within:text-primary transition-colors">Abreviação Digital (Acro) *</label>
                  <div className="relative">
                    <Database className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted w-6 h-6 opacity-40" />
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={settingsFormData.acro}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, acro: e.target.value })}
                      className="w-full bg-background/50 border border-border-medium rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum"
                      placeholder="Ex: UN, CX, KG"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle/30">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-8 py-4 text-[11px] font-black text-text-muted hover:text-text-primary uppercase tracking-[0.4em] transition-all"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-4 px-10 shadow-platinum-glow uppercase text-[11px] tracking-[0.4em] flex items-center gap-4"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  CONFIRMAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}