import { useState, useEffect } from 'react';
import { Plus, Package, Search, Filter, Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

interface Product {
  id: number;
  sku: string | null;
  name: string;
  category: string | null;
  base_price: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    base_price: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data.data || res.data || []);
    } catch (error) {
      toast.error('Erro ao carregar catálogo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/products', {
        ...formData,
        base_price: parseFloat(formData.base_price),
      });
      toast.success('Produto registrado com sucesso.');
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', category: '', base_price: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Erro ao salvar produto.');
    }
  };

  const formatCurrency = (val: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(val || '0'));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean).length;
  const avgPrice = products.length > 0 
    ? formatCurrency((products.reduce((acc, p) => acc + parseFloat(p.base_price), 0) / products.length).toString())
    : formatCurrency('0');

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Catálogo de Produtos
          </h1>
          <p className="text-text-secondary text-sm mt-1 flex items-center gap-2">
            <ShieldCheck size={14} className="text-primary" />
            Gestão de ativos, precificação e inteligência de catálogo.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary text-xs"
        >
          <Plus size={14} />
          Novo Produto
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total de SKUs', val: products.length, icon: Package },
          { label: 'Categorias', val: categories, icon: Filter },
          { label: 'Preço Médio', val: avgPrice, icon: ShieldCheck },
        ].map((stat, i) => (
          <div key={i} className="card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted font-medium">{stat.label}</p>
              <p className="text-xl font-semibold text-text-primary mt-1">{stat.val}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por SKU, Nome ou Categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
            <span className="text-sm text-text-muted">Carregando catálogo...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Produto</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-xs font-medium text-text-muted uppercase tracking-wider text-right">Preço Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <p className="text-text-muted text-sm">Nenhum produto encontrado.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-bg-tertiary/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-primary font-medium">
                        {product.sku || '---'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-sm text-text-primary">{product.name}</div>
                        <div className="text-xs text-text-muted">ID: #{product.id.toString().padStart(6, '0')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-default text-xs">
                          {product.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-sm text-text-primary">
                          {formatCurrency(product.base_price)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Produto" size="md">
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Nome do Produto *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ex: Monitor Profissional 4K 27 pol"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">SKU / Código</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="input font-mono"
                placeholder="PROD-100X"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Categoria</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input"
                placeholder="Hardware, Licenças..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Preço Base (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={e => setFormData({ ...formData, base_price: e.target.value })}
              className="input"
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar Produto
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
