import { useState, useEffect } from 'react';
import { Plus, Package, Search, Filter, Lock, Loader2, Tag, DollarSign, Hash, Layers, ShieldCheck, Zap, BarChart3, Target } from 'lucide-react';
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
      toast.error('Erro ao sincronizar catálogo estratégico.');
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
      toast.success('Ativo registrado no ecossistema.');
      setIsModalOpen(false);
      setFormData({ name: '', sku: '', category: '', base_price: '' });
      fetchProducts();
    } catch (error) {
      toast.error('Falha na persistência do ativo.');
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

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Catálogo de <span className="text-gradient-gold">Produtos & Ativos</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <ShieldCheck size={12} className="text-primary" />
            Gestão de ativos, precificação estratégica e inteligência de catálogo.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 px-8 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-[10px] tracking-[0.2em]"
        >
          <Plus className="w-4 h-4" />
          Registrar Ativo
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de SKUs', val: products.length, icon: Package, color: 'text-primary' },
          { label: 'Categorias Ativas', val: [...new Set(products.map(p => p.category))].filter(Boolean).length, icon: Layers, color: 'text-blue-400' },
          { label: 'Valuation Médio', val: formatCurrency((products.reduce((acc, p) => acc + parseFloat(p.base_price), 0) / (products.length || 1)).toString()), icon: BarChart3, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-6 flex items-center gap-5 group hover:border-primary/20 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">{stat.label}</p>
              <p className="text-xl font-black text-white mt-0.5">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="platinum-card p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Rastrear por SKU, Nome ou Categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-background border border-white/5 rounded-xl text-sm focus:border-primary/30 outline-none transition-all text-white placeholder:text-text-muted"
            />
          </div>
          <button className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest">Ajustar Filtros</span>
          </button>
        </div>
      </div>

      <div className="platinum-card overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-text-muted uppercase text-[10px] font-black tracking-[0.3em]">
            <Loader2 className="animate-spin inline mr-3" /> Indexando Ativos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">SKU / Ident.</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Produto / Descrição</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted">Classificação</th>
                  <th className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-text-muted text-right">Valuation Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <Target size={40} className="text-primary" />
                        <p className="font-black text-text-secondary uppercase tracking-[0.2em] text-[10px]">Nenhum ativo localizado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6 font-mono text-[10px] text-primary font-black uppercase tracking-tighter">
                        {product.sku || '---'}
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-white group-hover:text-primary transition-colors uppercase tracking-tight">{product.name}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-text-muted text-[9px] font-black uppercase tracking-widest">
                          {product.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-black tracking-tight text-base">
                            {formatCurrency(product.base_price)}
                          </span>
                          <span className="text-[8px] text-text-muted uppercase font-black tracking-[0.2em] italic">Preço de Referência</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="REGISTRAR ATIVO ESTRATÉGICO" size="md">
        <form onSubmit={handleSubmit} className="space-y-8 p-2">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Identificação do Produto *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all"
              placeholder="Ex: Monitor Profissional 4K 27 pol"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">SKU / Código Único</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-mono uppercase"
                placeholder="PROD-100X"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Categoria Estratégica</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white"
                placeholder="Hardware, Licenças..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Valuation Base (R$) *</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">R$</div>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-background border border-white/10 rounded-xl text-sm text-white font-black"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-3 text-text-muted font-bold hover:text-white transition-all text-xs uppercase tracking-widest"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-10 py-3 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow text-[10px] uppercase tracking-widest"
            >
              Consolidar Ativo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
