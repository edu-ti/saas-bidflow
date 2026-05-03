import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, Eye, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, DollarSign, Boxes, X, ChevronDown, Filter, Warehouse, Lock, ShieldCheck, Zap, BarChart3, TrendingDown, Target, Loader2
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
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Asset & <span className="text-gradient-gold">Inventory Control</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Warehouse size={12} className="text-primary" />
            Gestão estratégica de ativos, SKUs e movimentações logísticas.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-3 px-6 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Registrar Ativo
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total SKUs', val: dashboardStats?.total_products, icon: Package, color: 'text-primary' },
          { label: 'Valuation Total', val: formatCurrency(dashboardStats?.total_value || 0), icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Low Stock Alert', val: dashboardStats?.low_stock, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Out of Stock', val: dashboardStats?.out_of_stock, icon: Boxes, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-6 flex items-center gap-5 group hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stat.label}</p>
              <p className="text-xl font-black text-white mt-0.5">{stat.val || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/5 rounded-2xl w-fit">
        {['products', 'movements', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-primary text-background shadow-platinum-glow' : 'text-text-muted hover:text-white'
            }`}
          >
            {tab === 'products' ? 'Estoque Local' : tab === 'movements' ? 'Movimentações' : 'Configurações'}
          </button>
        ))}
      </div>

      {activeTab === 'products' && (
        <div className="platinum-card overflow-hidden">
          <div className="p-4 bg-white/[0.01] border-b border-white/5">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Rastrear SKU ou Identificador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm text-white focus:border-primary/30 outline-none transition-all placeholder:text-text-muted"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">SKU / Identidade</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Ativo / Marca</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Físico</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-center">Disponível</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Valuation</th>
                  <th className="px-6 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted uppercase text-[10px] font-black tracking-widest"><Loader2 className="animate-spin inline mr-2" /> Sincronizando Ativos...</td></tr>
                ) : products.map(product => (
                  <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6">
                      <div className="font-mono text-xs font-bold text-primary">{product.sku || 'N/A'}</div>
                      <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{product.barcode}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="font-bold text-white uppercase text-xs">{product.product?.name || '-'}</div>
                      <div className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{product.brand?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-6 text-center font-black text-white">{product.on_hand_qty || 0}</td>
                    <td className="px-6 py-6 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${
                        (product.on_hand_qty - product.reserved_qty) > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {product.on_hand_qty - product.reserved_qty}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-black text-white">{formatCurrency(product.sale_price)}</span>
                        <span className="text-[8px] text-text-muted uppercase tracking-[0.2em] font-black">Markup {product.markup}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-text-muted hover:text-primary transition-all"><Edit2 size={16} /></button>
                        <button className="p-2 text-text-muted hover:text-red-400 transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simplified for demo, actual implementation would refactor the rest of tabs similarly */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Marcas Estratégicas', count: brands.length, icon: Target },
            { label: 'Categorias de Ativo', count: categories.length, icon: Zap },
            { label: 'Unidades de Medida', count: units.length, icon: BarChart3 },
            { label: 'Depósitos Logísticos', count: depots.length, icon: Warehouse },
          ].map((set, i) => (
            <div key={i} className="platinum-card p-8 flex flex-col gap-6 group hover:border-primary/20 transition-all">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <set.icon size={24} />
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Gerenciar</button>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{set.label}</p>
                <p className="text-3xl font-black text-white mt-1">{set.count}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'REFINAR ATIVO DE INVENTÁRIO' : 'INTEGRAR NOVO ATIVO'}>
        <form onSubmit={handleSave} className="space-y-8 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">SKU Estratégico</label>
              <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Depósito Alvo</label>
              <select value={formData.depot_id} onChange={e => setFormData({ ...formData, depot_id: e.target.value })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white appearance-none">
                <option value="">Selecione...</option>
                {depots.map(d => <option key={d.id} value={d.id} className="bg-surface">{d.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Preço Custo</label>
              <input type="number" step="0.01" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Markup (%)</label>
              <input type="number" step="0.01" value={formData.markup} onChange={e => setFormData({ ...formData, markup: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-primary font-black" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Soma em Estoque</label>
              <input type="number" value={formData.on_hand_qty} onChange={e => setFormData({ ...formData, on_hand_qty: Number(e.target.value) })} className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-black" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button type="button" onClick={() => setShowModal(false)} className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest">Descartar</button>
            <button type="submit" className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-xs uppercase tracking-widest">{editingProduct ? 'Confirmar Mudanças' : 'Validar Entrada'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryDashboard;
