import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, DollarSign, Boxes, X, Filter, Warehouse, ShieldCheck, Zap
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
      
      setBrands(brandsRes.data);
      setCategories(catsRes.data);
      setUnits(unitsRes.data);
      setStatuses(statsRes.data);
      setDepots(depotsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await api.get('/api/inventory/movements');
      setMovements(res.data.data || res.data);
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
      color: '#CE9C62',
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
    { label: 'Matriz de SKUs', val: dashboardStats?.total_products || 0, icon: Package, color: 'text-primary' },
    { label: 'Valuation de Ativos', val: formatCurrency(dashboardStats?.total_value || 0), icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Risco de Ruptura', val: dashboardStats?.low_stock || 0, icon: AlertTriangle, color: 'text-amber-500' },
    { label: 'Indisponibilidade', val: dashboardStats?.out_of_stock || 0, icon: Boxes, color: 'text-red-400' },
  ];

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Inventory & <span className="text-gradient-gold">Asset Management</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Warehouse size={12} className="text-primary" />
            Controle de inventário físico, valuation e logística de ativos.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted italic">Saúde Logística</span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Operação Estável</span>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <Zap className="text-primary w-5 h-5 animate-pulse" />
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="platinum-card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-all">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{kpi.label}</p>
              <p className="text-xl font-black text-white mt-1 tracking-tight">{kpi.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
        {[
          { key: 'products', label: 'Matriz de Produtos', icon: Package },
          { key: 'movements', label: 'Log de Movimentação', icon: ArrowUpRight },
          { key: 'settings', label: 'Diretrizes de Depósito', icon: Warehouse },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.key ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="platinum-card overflow-hidden">
          <div className="p-6 bg-white/[0.01] border-b border-white/5 flex flex-wrap gap-6 items-center justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Buscar por SKU, Identificador ou Código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Registrar Ativo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">SKU / Identificador</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Descrição do Ativo</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Marca / Categ.</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Físico</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Disponível</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Custo</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Venda</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-text-muted uppercase text-[10px] font-black tracking-widest animate-pulse">Orquestrando Matriz de Ativos...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-text-muted uppercase text-[10px] font-black tracking-widest">Nenhum ativo localizado na base</td></tr>
                ) : (
                  products.map(product => {
                    const available = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
                    return (
                      <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-6 font-mono text-[10px] text-primary font-black uppercase tracking-wider">{product.sku || '---'}</td>
                        <td className="px-6 py-6">
                          <div className="font-bold text-white group-hover:text-primary transition-colors">{product.product?.name || 'Item não identificado'}</div>
                          <div className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">{product.depot?.name || 'Repositório Central'}</div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="text-[10px] font-black text-white uppercase tracking-widest">{product.brand?.name || 'Genérica'}</div>
                          <div className="text-[9px] text-text-muted font-bold uppercase tracking-widest">{product.category?.name || 'Miscelânea'}</div>
                        </td>
                        <td className="px-6 py-6 text-center font-black text-white">{product.on_hand_qty || 0}</td>
                        <td className="px-6 py-6 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${
                            available > (product.min_stock || 0) 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : available > 0 
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_-5px_rgba(239,68,68,0.4)]'
                          }`}>
                            {available}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right text-text-muted font-bold text-xs">{formatCurrency(product.cost_price)}</td>
                        <td className="px-6 py-6 text-right font-black text-white text-xs">{formatCurrency(product.sale_price)}</td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleOpenModal(product)} className="p-2 text-text-muted hover:text-primary transition-all"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={16} /></button>
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
        <div className="platinum-card overflow-hidden">
          <div className="p-8 border-b border-white/5 bg-white/[0.01]">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Trilha de Auditoria de Estoque</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Operação</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Data / Hora</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Categoria</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Origem / Destino</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movements.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-text-muted uppercase text-[10px] font-black tracking-widest">Nenhuma movimentação auditada</td></tr>
                ) : (
                  movements.map(m => (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit border ${
                          m.type === 'Entrada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {m.type === 'Entrada' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                          {m.type}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-text-muted font-bold text-[10px] uppercase tracking-widest">{new Date(m.date).toLocaleString('pt-BR')}</td>
                      <td className="px-8 py-6 text-white font-bold text-xs">{m.categoryName || 'Geral'}</td>
                      <td className="px-8 py-6 text-text-secondary font-medium text-xs">{m.entity || 'Sistema'}</td>
                      <td className="px-8 py-6 text-right text-white font-black text-xs">{formatCurrency(m.totalValue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
          {[
            { label: 'Matriz de Marcas', count: brands.length, type: 'brands', icon: ShieldCheck },
            { label: 'Categorias Logísticas', count: categories.length, type: 'categories', icon: Filter },
            { label: 'Unidades de Medida', count: units.length, type: 'units', icon: Package },
            { label: 'Depósitos & Hubs', count: depots.length, type: 'depots', icon: Warehouse },
            { label: 'Status de Operação', count: statuses.length, type: 'statuses', icon: Zap },
          ].map((item, i) => (
            <div key={i} className="platinum-card p-8 flex flex-col gap-6 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <item.icon size={24} />
                </div>
                <button onClick={() => openSettingsModal(item.type)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">+ Configurar</button>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">{item.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{item.count}</p>
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Entidades configuradas</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Unified Platinum Style */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-surface border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-8 bg-white/[0.02] border-b border-white/5">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                  {editingProduct ? 'Refinar' : 'Novo'} <span className="text-gradient-gold">Ativo de Estoque</span>
                </h2>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest italic">Consolidação de dados patrimoniais</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-text-muted hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 overflow-y-auto custom-scrollbar space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">SKU / Identificador Único</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all font-mono"
                    placeholder="Ex: SKU-2026-X1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Código de Barras / EAN</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Depósito Alvo</label>
                  <select
                    value={formData.depot_id}
                    onChange={(e) => setFormData({ ...formData, depot_id: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-surface">Selecionar Hub...</option>
                    {depots.map(d => (
                      <option key={d.id} value={d.id} className="bg-surface">{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Marca Estratégica</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-surface">Selecionar Marca...</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id} className="bg-surface">{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Categoria Operacional</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-surface">Selecionar Categ...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-surface">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-8 pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2"><DollarSign size={12} /> Engenharia de Preços & Estoque</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Preço Custo (BRL)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Markup Operacional (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.markup}
                      onChange={(e) => setFormData({ ...formData, markup: Number(e.target.value) })}
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Valor de Venda Projetado</label>
                    <div className="w-full bg-white/[0.01] border border-white/5 rounded-xl px-4 py-3.5 text-sm text-primary font-black">
                      {formatCurrency(calculatePrice(formData.cost_price, formData.markup))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Volume On-Hand</label>
                    <input
                      type="number"
                      value={formData.on_hand_qty}
                      onChange={(e) => setFormData({ ...formData, on_hand_qty: Number(e.target.value) })}
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Estoque de Segurança (Mín)</label>
                    <input
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Capacidade Máxima Hub</label>
                    <input
                      type="number"
                      value={formData.max_stock}
                      onChange={(e) => setFormData({ ...formData, max_stock: Number(e.target.value) })}
                      className="w-full bg-background border border-white/5 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-10 py-4 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
                >
                  Descartar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-12 py-4 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-all shadow-platinum-glow flex items-center gap-2"
                >
                  {loading ? <Zap size={14} className="animate-spin" /> : <ShieldCheck size={16} />}
                  Consolidar Ativo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal - Unified Platinum Style */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-surface border border-white/10 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-8 bg-white/[0.02] border-b border-white/5">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter">
                Novo <span className="text-gradient-gold">{getSettingsLabel()}</span>
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 text-text-muted hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Identificação *</label>
                <input
                  type="text"
                  required
                  value={settingsFormData.name}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all"
                  placeholder={`Nome da ${getSettingsLabel()}`}
                />
              </div>

              {settingsModalType === 'units' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest">Abreviação (Acro) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={settingsFormData.acro}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, acro: e.target.value })}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all font-mono"
                    placeholder="Ex: UN, CX, KG"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-6 py-3 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-primary text-background text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}