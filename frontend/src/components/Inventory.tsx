import { useState, useEffect, useCallback } from 'react';
import {
  Package, Plus, Search, Edit2, Trash2, Eye, ArrowUpRight, ArrowDownLeft,
  AlertTriangle, DollarSign, Boxes, X, ChevronDown, Filter, Warehouse
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

const InventoryDashboard = () => {
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
    color: '#6C63FF',
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
        toast.success('Produto atualizado!');
      } else {
        await api.post('/api/inventory/products', payload);
        toast.success('Produto criado!');
      }

      setShowModal(false);
      fetchProducts();
      fetchDashboard();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir produto?')) return;
    
    try {
      await api.delete(`/api/inventory/products/${id}`);
      toast.success('Produto excluído!');
      fetchProducts();
      fetchDashboard();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao excluir');
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
      color: '#6C63FF',
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
      toast.success(`${settingsModalType === 'brands' ? 'Marca' : settingsModalType === 'categories' ? 'Categoria' : settingsModalType === 'units' ? 'Unidade' : settingsModalType === 'depots' ? 'Depósito' : settingsModalType === 'labels' ? 'Etiqueta' : 'Status'} criado(a) com sucesso!`);
      setShowSettingsModal(false);
      fetchDependencies();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  const getSettingsLabel = () => {
    switch (settingsModalType) {
      case 'brands': return 'Marca';
      case 'categories': return 'Categoria';
      case 'units': return 'Unidade';
      case 'sizes': return 'Tamanho';
      case 'statuses': return 'Status';
      case 'labels': return 'Etiqueta';
      case 'depots': return 'Depósito';
      default: return 'Item';
    }
  };

  const tabs = [
    { key: 'products', label: 'Produtos', icon: Package },
    { key: 'movements', label: 'Movimentações', icon: ArrowUpRight },
    { key: 'settings', label: 'Configurações', icon: Warehouse },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Estoque</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie inventário e movimentações</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total SKUs</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{dashboardStats?.total_products || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Valor Estoque</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(dashboardStats?.total_value || 0)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Estoque Baixo</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{dashboardStats?.low_stock || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Boxes className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sem Estoque</p>
                <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{dashboardStats?.out_of_stock || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl mb-6 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'products' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por SKU, código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Novo Produto
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Marca</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Físico</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Reservado</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Disponível</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Custo</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Venda</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {loading ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Carregando...</td></tr>
                  ) : products.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Nenhum produto encontrado</td></tr>
                  ) : (
                    products.map(product => {
                      const available = (product.on_hand_qty || 0) - (product.reserved_qty || 0);
                      return (
                        <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100">{product.sku || '-'}</td>
                          <td className="px-4 py-3 text-slate-800 dark:text-slate-100">{product.product?.name || '-'}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{product.brand?.name || '-'}</td>
                          <td className="px-4 py-3 text-center font-medium text-slate-800 dark:text-slate-100">{product.on_hand_qty || 0}</td>
                          <td className="px-4 py-3 text-center text-orange-600 font-medium">{product.reserved_qty || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              available > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {available}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-100">{formatCurrency(product.cost_price)}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-100">{formatCurrency(product.sale_price)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleOpenModal(product)} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Categoria</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Entidade</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {movements.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhuma movimentação</td></tr>
                  ) : (
                    movements.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 w-fit ${
                            m.type === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {m.type === 'Entrada' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {m.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-sm">{new Date(m.date).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{m.categoryName || '-'}</td>
                        <td className="px-4 py-3 text-slate-800 dark:text-slate-100 font-medium">{m.entity || '-'}</td>
                        <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-100 font-medium">{formatCurrency(m.totalValue)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Marcas</h3>
                <button onClick={() => openSettingsModal('brands')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{brands.length}</p>
              <p className="text-sm text-slate-500">marcas cadastradas</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Categorias</h3>
                <button onClick={() => openSettingsModal('categories')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{categories.length}</p>
              <p className="text-sm text-slate-500">categorias</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Unidades</h3>
                <button onClick={() => openSettingsModal('units')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{units.length}</p>
              <p className="text-sm text-slate-500">unidades de medida</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Tamanhos</h3>
                <button onClick={() => openSettingsModal('sizes')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">0</p>
              <p className="text-sm text-slate-500">tamanhos cadastrados</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Depósitos</h3>
                <button onClick={() => openSettingsModal('depots')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{depots.length}</p>
              <p className="text-sm text-slate-500">locais de armazenamento</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Status</h3>
                <button onClick={() => openSettingsModal('statuses')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{statuses.length}</p>
              <p className="text-sm text-slate-500">status de produto</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Etiquetas</h3>
                <button onClick={() => openSettingsModal('labels')} className="text-blue-600 hover:text-blue-700 text-sm">+ Adicionar</button>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">0</p>
              <p className="text-sm text-slate-500">etiquetas cadastradas</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Depósito</label>
                  <select
                    value={formData.depot_id}
                    onChange={(e) => setFormData({ ...formData, depot_id: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    {depots.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Marca</label>
                  <select
                    value={formData.brand_id}
                    onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Unidade</label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => setFormData({ ...formData, unit_id: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.acro})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status_id}
                    onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Selecione...</option>
                    {statuses.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Preços e Estoque</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço Custo</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Markup %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.markup}
                      onChange={(e) => setFormData({ ...formData, markup: Number(e.target.value) })}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preço Venda</label>
                    <input
                      type="number"
                      step="0.01"
                      value={calculatePrice(formData.cost_price, formData.markup)}
                      readOnly
                      className="w-full bg-slate-100 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg px-3 py-2 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque atual</label>
                  <input
                    type="number"
                    value={formData.on_hand_qty}
                    onChange={(e) => setFormData({ ...formData, on_hand_qty: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque mínimo</label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estoque máximo</label>
                  <input
                    type="number"
                    value={formData.max_stock}
                    onChange={(e) => setFormData({ ...formData, max_stock: Number(e.target.value) })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">NCM</label>
                  <input
                    type="text"
                    value={formData.ncm}
                    onChange={(e) => setFormData({ ...formData, ncm: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CEST</label>
                  <input
                    type="text"
                    value={formData.cest}
                    onChange={(e) => setFormData({ ...formData, cest: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Novo {getSettingsLabel()}
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={settingsFormData.name}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              {(settingsModalType === 'categories' || settingsModalType === 'sizes') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código</label>
                  <input
                    type="text"
                    value={settingsFormData.code}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, code: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                  />
                </div>
              )}

              {settingsModalType === 'units' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Abreviação *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={settingsFormData.acro}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, acro: e.target.value })}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    placeholder="Ex: UN, CX, KG"
                  />
                </div>
              )}

              {settingsModalType === 'depots' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                    <select
                      value={settingsFormData.type}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, type: e.target.value })}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                    >
                      <option value="Físico">Físico</option>
                      <option value="Virtual">Virtual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                    <textarea
                      value={settingsFormData.description}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, description: e.target.value })}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {settingsModalType === 'statuses' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cor</label>
                  <input
                    type="color"
                    value={settingsFormData.color}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, color: e.target.value })}
                    className="w-full h-10 rounded border border-slate-300 dark:border-slate-600"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : `Criar ${getSettingsLabel()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;