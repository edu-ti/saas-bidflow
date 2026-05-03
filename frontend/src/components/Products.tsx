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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Catálogo de <span className="text-gradient-gold">Produtos & Ativos</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={14} className="text-primary" />
            Gestão de ativos, precificação estratégica e inteligência de catálogo.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary py-4 px-10 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-5 h-5" />
          Registrar Ativo Platinum
        </button>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: 'Total de SKUs', val: products.length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Categorias Ativas', val: [...new Set(products.map(p => p.category))].filter(Boolean).length, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Valuation Médio', val: formatCurrency((products.reduce((acc, p) => acc + parseFloat(p.base_price), 0) / (products.length || 1)).toString()), icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="platinum-card p-8 flex items-center justify-between group bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 overflow-hidden relative">
            <div className="space-y-2 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted opacity-60">{stat.label}</p>
              <p className="text-2xl font-black text-text-primary tracking-tighter group-hover:text-primary transition-colors duration-500">{stat.val}</p>
            </div>
            <div className={`p-5 rounded-2xl ${stat.bg} border border-border-subtle ${stat.color} group-hover:scale-110 transition-transform duration-500 shadow-platinum-glow-sm relative z-10`}>
              <stat.icon size={28} />
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity`} />
          </div>
        ))}
      </div>

      <div className="platinum-card p-8 bg-surface-elevated/10 backdrop-blur-xl shrink-0">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-5 h-5" />
            <input
              type="text"
              placeholder="Rastrear por SKU, Nome ou Categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum"
            />
          </div>
          <button className="px-8 py-4 bg-surface-elevated/40 border border-border-subtle text-text-muted rounded-2xl hover:bg-surface-elevated hover:text-text-primary transition-all flex items-center gap-3">
            <Filter size={18} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ajustar Filtros</span>
          </button>
        </div>
      </div>

      <div className="platinum-card overflow-hidden bg-surface-elevated/10 backdrop-blur-md flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary/40" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted animate-pulse">Indexando Catálogo Estratégico...</span>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-platinum">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-elevated/30 border-b border-border-subtle">
                <tr>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">SKU / Ident.</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Produto / Descrição</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60">Classificação</th>
                  <th className="px-10 py-6 font-black uppercase text-[10px] tracking-[0.3em] text-text-muted opacity-60 text-right">Valuation Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-20">
                        <Target size={56} className="text-primary" />
                        <p className="font-black text-text-primary uppercase tracking-[0.4em] text-[10px]">Nenhum ativo localizado no cluster</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-surface-elevated/20 transition-all group border-b border-border-subtle/20 duration-300">
                      <td className="px-10 py-8 font-mono text-xs text-primary font-black uppercase tracking-tighter group-hover:scale-105 transition-transform w-fit">
                        {product.sku || '---'}
                      </td>
                      <td className="px-10 py-8">
                        <div className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight text-xs">{product.name}</div>
                        <div className="text-[9px] text-text-muted font-black mt-2 uppercase tracking-widest opacity-60">ID Digital: #{product.id.toString().padStart(6, '0')}</div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-4 py-2 rounded-xl bg-surface-elevated/50 border border-border-subtle text-text-muted text-[9px] font-black uppercase tracking-[0.2em] shadow-platinum-glow-sm">
                          {product.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-text-primary font-black tracking-tighter text-sm group-hover:text-primary transition-colors">
                            {formatCurrency(product.base_price)}
                          </span>
                          <span className="text-[8px] text-text-muted uppercase font-black tracking-[0.3em] italic opacity-50">Price Point</span>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="REGISTRAR ATIVO ESTRATÉGICO PLATINUM" size="md">
        <form onSubmit={handleSubmit} className="space-y-10 p-2">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Identificação do Produto *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum"
              placeholder="Ex: Monitor Profissional 4K 27 pol"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">SKU / Código Único</label>
              <input
                type="text"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-black text-text-primary font-mono uppercase shadow-inner-platinum"
                placeholder="PROD-100X"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Categoria Estratégica</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-6 py-4 bg-background border border-border-medium rounded-2xl text-sm font-bold text-text-primary shadow-inner-platinum"
                placeholder="Hardware, Licenças..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Valuation Base (R$) *</label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-sm">R$</div>
              <input
                type="number"
                step="0.01"
                value={formData.base_price}
                onChange={e => setFormData({ ...formData, base_price: e.target.value })}
                className="w-full pl-16 pr-6 py-4 bg-background border border-border-medium rounded-2xl text-sm text-text-primary font-black shadow-inner-platinum font-mono"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-6 pt-10 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-4 text-text-muted font-black hover:text-text-primary transition-all text-[10px] uppercase tracking-[0.3em]"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="btn-primary py-4 px-12 shadow-platinum-glow flex items-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <ShieldCheck size={20} />
              Consolidar Ativo Platinum
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
