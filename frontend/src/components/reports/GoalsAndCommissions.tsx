import { useState, useEffect } from 'react';
import { 
  Calculator, Download, Settings, Plus, Trash2, RefreshCw, 
  FileText, Loader2, Users 
} from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

type CommissionRow = {
  id?: number;
  usuario_id: number;
  nome: string;
  meta_mensal: number;
  salario_fixo: number;
  percentual_comissao: number;
  ativo: boolean;
};

type PerformanceData = {
  nome: string;
  meta_mensal: number;
  total_vendas: number;
  salario_fixo: number;
  percentual_comissao: number;
  diferenca: number;
  total_trimestre: number;
  total_pagar: number;
};

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

type Supplier = {
  id: number;
  corporate_name: string;
  fantasy_name: string | null;
  cnpj: string | null;
};

export default function GoalsAndCommissions() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().slice(0, 10);
  });

  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configYear, setConfigYear] = useState(new Date().getFullYear());
  const [users, setUsers] = useState<any[]>([]);
  const [commissionConfigs, setCommissionConfigs] = useState<CommissionRow[]>([]);
  const [fornecedorMetas, setFornecedorMetas] = useState<Record<string, Record<string, Record<string, number>>>>({});

  const [loadingConfig, setLoadingConfig] = useState(false);
  const [supplierList, setSupplierList] = useState<string[]>([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const parseCurrency = (value: string) => {
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const [availableSuppliers, setAvailableSuppliers] = useState<Supplier[]>([]);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/reports/users');
      setUsers(res.data || []);
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
    }
  };

  const loadSuppliers = async () => {
    try {
      const res = await api.get('/api/suppliers');
      setAvailableSuppliers(res.data.data || []);
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e);
    }
  };

  const handleProcess = async () => {
    if (!startDate || !endDate) {
      toast.error('Selecione o período antes de processar.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/api/reports/commission-analysis', {
        params: { start_date: startDate, end_date: endDate }
      });

      const data = res.data;
      if (Array.isArray(data)) {
        const formattedData = data.map((item: any) => ({
          nome: item.nome,
          meta_mensal: item.meta_mensal || 0,
          total_vendas: item.total_vendas || 0,
          salario_fixo: item.salario_fixo || 0,
          percentual_comissao: item.percentual_comissao || 1,
          diferenca: item.diferenca || 0,
          total_trimestre: item.total_periodo || 0,
          total_pagar: (item.salario_fixo || 0) + (item.comissao_valor || 0)
        }));
        setPerformanceData(formattedData);
        setHasData(true);
      } else if (data?.success) {
        setPerformanceData(data.data || []);
        setHasData(true);
      } else {
        toast.error('Erro ao carregar dados');
      }
    } catch (e: any) {
      console.error('Erro processar:', e);
      toast.error('Erro ao processar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!hasData || performanceData.length === 0) {
      toast.error('Processe os dados primeiro.');
      return;
    }

    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center; color: #1f2937;">Performance Financeira</h2>
        <p style="text-align: center; color: #6b7280;">Período: ${startDate} a ${endDate}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px;">
          <thead>
            <tr style="background: #4f46e5; color: white;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Vendedor</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Meta</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Vendas</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Fixo (R$)</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Comissão</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Diferença</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Total a Pagar</th>
            </tr>
          </thead>
          <tbody>
            ${performanceData.map(row => {
              const comissao = (row.total_vendas || 0) * ((row.percentual_comissao || 1) / 100);
              const diferenca = (row.total_vendas || 0) - (row.meta_mensal || 0);
              const totalPagar = (row.salario_fixo || 0) + comissao;
              return `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${row.nome}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(row.meta_mensal || 0)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(row.total_vendas || 0)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(row.salario_fixo || 0)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: green;">${formatCurrency(comissao)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: ${diferenca >= 0 ? 'green' : 'red'};">${formatCurrency(diferenca)}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${formatCurrency(totalPagar)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Performance Financeira</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const openConfigModal = async () => {
    setShowConfigModal(true);
    setLoadingConfig(true);
    try {
      const [configsRes, metasRes, suppliersRes] = await Promise.all([
        api.get('/api/commission-configs', { params: { year: configYear } }),
        api.get('/api/supplier-targets-all', { params: { year: configYear } }),
        api.get('/api/suppliers')
      ]);

      if (configsRes.data?.success) {
        setCommissionConfigs(configsRes.data.data || []);
      }
      if (metasRes.data?.success) {
        setFornecedorMetas(metasRes.data.data || {});
      }
      if (suppliersRes.data?.data) {
        setAvailableSuppliers(suppliersRes.data.data || []);
        const supplierNames = (suppliersRes.data.data || []).map((s: Supplier) => s.corporate_name);
        setSupplierList(supplierNames.length > 0 ? supplierNames : []);
      }
    } catch (e: any) {
      console.error('Erro carregar config:', e);
      toast.error('Erro ao carregar configurações');
      setShowConfigModal(false);
    } finally {
      setLoadingConfig(false);
    }
  };

  const addVendedorRow = () => {
    setCommissionConfigs([...commissionConfigs, {
      usuario_id: 0,
      nome: '',
      meta_mensal: 0,
      salario_fixo: 0,
      percentual_comissao: 1,
      ativo: true
    }]);
  };

  const removeVendedorRow = (index: number) => {
    setCommissionConfigs(commissionConfigs.filter((_, i) => i !== index));
  };

  const updateVendedorRow = (index: number, field: keyof CommissionRow, value: any) => {
    const updated = [...commissionConfigs];
    (updated[index] as any)[field] = value;
    setCommissionConfigs(updated);
  };

  const handleSaveConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await api.post('/api/commission-configs', {
        configs: commissionConfigs,
        fornecedor_metas: fornecedorMetas,
        year: configYear
      });

      if (res.data?.success) {
        toast.success('Configurações salvas com sucesso!');
        setShowConfigModal(false);
      } else {
        toast.error(res.data?.error || 'Erro ao salvar');
      }
    } catch (e) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleFornecedorMetaChange = (forn: string, uf: string, month: number, value: string) => {
    const parsed = parseCurrency(value);
    setFornecedorMetas(prev => ({
      ...prev,
      [forn]: {
        ...prev[forn],
        [month]: {
          ...(prev[forn]?.[month] || {}),
          [uf]: parsed
        }
      }
    }));
  };

  const addSupplier = () => {
    setShowAddSupplierModal(true);
  };

  const handleAddSupplier = () => {
    if (newSupplierName && newSupplierName.trim()) {
      const key = newSupplierName.trim().toUpperCase();
      if (supplierList.includes(key)) {
        toast.error('Fornecedor já existe.');
        return;
      }
      setSupplierList([...supplierList, key]);
      setNewSupplierName('');
      setShowAddSupplierModal(false);
    }
  };

  const removeSupplier = (forn: string) => {
    if (confirm(`Remover fornecedor "${forn}"?`)) {
      setSupplierList(supplierList.filter(f => f !== forn));
    }
  };

  const calculateTotals = () => {
    let grandMeta = 0, grandVendas = 0, grandFixo = 0, grandComissao = 0, grandDif = 0, grandTotal = 0;
    performanceData.forEach(row => {
      const meta = row.meta_mensal || 0;
      const vendas = row.total_vendas || 0;
      const fixo = row.salario_fixo || 0;
      const pct = row.percentual_comissao || 1;
      const comissao = vendas * (pct / 100);
      const diferenca = vendas - meta;
      const total = fixo + comissao;

      grandMeta += meta;
      grandVendas += vendas;
      grandFixo += fixo;
      grandComissao += comissao;
      grandDif += diferenca;
      grandTotal += total;
    });
    return { grandMeta, grandVendas, grandFixo, grandComissao, grandDif, grandTotal };
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl overflow-hidden relative dark:bg-primary/90">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20">
              <Calculator className="text-3xl" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Performance Financeira</h3>
              <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mt-1">Gestão de metas e comissões por vendedor</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-white/10 p-3 rounded-[1.5rem] backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
              <div className="flex flex-col">
                <span className="text-white/70 text-[9px] font-black uppercase">Início</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-white text-xs font-bold cursor-pointer outline-none focus:ring-0 w-28 p-0"
                />
              </div>
              <div className="h-6 w-[1px] bg-white/10 mx-1" />
              <div className="flex flex-col">
                <span className="text-white/70 text-[9px] font-black uppercase">Fim</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-white text-xs font-bold cursor-pointer outline-none focus:ring-0 w-28 p-0"
                />
              </div>
            </div>

            <div className="h-10 w-[1px] bg-white/10 hidden md:block" />

            <div className="flex gap-2">
              <button
                onClick={handleProcess}
                disabled={loading}
                className="bg-primary-foreground hover:bg-white/90 text-primary px-6 h-11 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} className="group-hover:animate-spin" />}
                PROCESSAR
              </button>
              <button
                onClick={handleExport}
                className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center active:scale-95 shadow-lg"
              >
                <Download size={14} className="mr-2" />Exportar
              </button>
              <button
                onClick={openConfigModal}
                className="bg-amber-500 hover:bg-amber-400 text-white px-5 h-11 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center active:scale-95 shadow-lg"
              >
                <Settings size={14} className="mr-2" />Config. Metas
              </button>
            </div>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-bg-secondary border border-dashed border-border rounded-[2rem] p-20 text-center text-text-muted">
          <FileText className="text-7xl mb-6 opacity-20 mx-auto" />
          <p className="font-bold text-text-secondary max-w-sm mx-auto">
            Clique no botão <strong className="text-primary">PROCESSAR</strong> para carregar os dados de vendas e comissões do período selecionado.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[2rem] shadow-sm border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-wider">
                <th className="px-5 py-4 text-left rounded-tl-2xl min-w-[180px]">Vendedor</th>
                <th className="px-5 py-4 text-right">Meta</th>
                <th className="px-5 py-4 text-right">Vendas</th>
                <th className="px-5 py-4 text-right">Fixo (R$)</th>
                <th className="px-5 py-4 text-right">Comissão</th>
                <th className="px-5 py-4 text-right">Diferença</th>
                <th className="px-5 py-4 text-right">Trimestre</th>
                <th className="px-5 py-4 text-right rounded-tr-2xl bg-primary/90">Valor a Pagar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-bg-primary dark:bg-slate-800">
              {performanceData.map((row, i) => {
                const comissao = (row.total_vendas || 0) * ((row.percentual_comissao || 1) / 100);
                const diferenca = (row.total_vendas || 0) - (row.meta_mensal || 0);
                return (
                  <tr key={i} className={`${i % 2 === 0 ? 'bg-bg-primary dark:bg-slate-800' : 'bg-bg-secondary dark:bg-slate-700/50'} hover:bg-bg-tertiary dark:hover:bg-slate-700 transition-colors`}>
                    <td className="px-5 py-3 text-sm font-bold text-text-primary">{row.nome}</td>
                    <td className="px-5 py-3 text-sm text-right text-text-secondary font-mono">{formatCurrency(row.meta_mensal || 0)}</td>
                    <td className="px-5 py-3 text-sm text-right font-black text-text-primary font-mono">{formatCurrency(row.total_vendas || 0)}</td>
                    <td className="px-5 py-3 text-sm text-right text-text-secondary font-mono">{formatCurrency(row.salario_fixo || 0)}</td>
                    <td className="px-5 py-3 text-sm text-right text-emerald-600 font-bold font-mono">
                      {formatCurrency(comissao)} <span className="text-[10px] text-text-muted">({row.percentual_comissao || 1}%)</span>
                    </td>
                    <td className={`px-5 py-3 text-sm text-right font-bold font-mono ${diferenca >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {formatCurrency(diferenca)}
                    </td>
                    <td className="px-5 py-3 text-sm text-right text-primary font-mono">
                      {row.total_trimestre > 0 ? formatCurrency(row.total_trimestre) : '-'}
                    </td>
                    <td className="px-5 py-3 text-sm text-right font-black text-text-primary bg-primary/10 font-mono">{formatCurrency(row.total_pagar || 0)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {(() => {
                const totals = calculateTotals();
                return (
                  <tr className="bg-bg-secondary dark:bg-slate-700 border-t-2 border-primary/20 font-black text-sm">
                    <td className="px-5 py-4 text-text-secondary uppercase tracking-wider">TOTAIS</td>
                    <td className="px-5 py-4 text-right text-text-secondary font-mono">{formatCurrency(totals.grandMeta)}</td>
                    <td className="px-5 py-4 text-right text-text-primary font-mono">{formatCurrency(totals.grandVendas)}</td>
                    <td className="px-5 py-4 text-right text-text-secondary font-mono">{formatCurrency(totals.grandFixo)}</td>
                    <td className="px-5 py-4 text-right text-emerald-600 font-mono">{formatCurrency(totals.grandComissao)}</td>
                    <td className={`px-5 py-4 text-right font-mono ${totals.grandDif >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{formatCurrency(totals.grandDif)}</td>
                    <td className="px-5 py-4 text-right text-primary font-mono">-</td>
                    <td className="px-5 py-4 text-right text-primary bg-primary/20 font-mono">{formatCurrency(totals.grandTotal)}</td>
                  </tr>
                );
              })()}
            </tfoot>
          </table>
        </div>
      )}

      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfigModal(false)} />
          <div className="relative bg-bg-primary dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-7xl max-h-[85vh] overflow-y-auto z-10 flex flex-col border border-border">
            <div className="sticky top-0 bg-bg-secondary dark:bg-slate-700 rounded-t-[2rem] z-10 border-b border-border px-8 py-5 flex justify-between items-center">
              <h4 className="font-black text-text-primary text-lg flex items-center gap-2">
                <Settings className="text-primary" size={20} /> Configurar Metas e Comissões
              </h4>
              <button 
                onClick={() => setShowConfigModal(false)} 
                className="text-text-muted hover:text-text-primary w-9 h-9 rounded-xl hover:bg-bg-tertiary transition-colors flex items-center justify-center text-lg"
              >
                ×
              </button>
            </div>

            <div className="px-8 py-6 space-y-8 flex-1 bg-bg-primary dark:bg-slate-800">
              <div className="flex items-center gap-3">
                <label className="text-xs font-black text-text-muted uppercase">Ano Base:</label>
                <input
                  type="number"
                  value={configYear}
                  onChange={(e) => setConfigYear(parseInt(e.target.value))}
                  className="border border-border rounded-lg px-3 py-1.5 text-sm font-bold w-24 text-center bg-bg-primary dark:bg-slate-900 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <h5 className="text-sm font-black text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users size={16} /> Metas e Comissões por Vendedor
                </h5>
                <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-primary text-primary-foreground text-xs uppercase font-black tracking-widest">
                        <th className="px-5 py-3 text-left">Vendedor</th>
                        <th className="px-5 py-3 text-right">Meta (R$)</th>
                        <th className="px-5 py-3 text-right">Fixo (R$)</th>
                        <th className="px-5 py-3 text-right">% Com.</th>
                        <th className="px-5 py-3 text-center">Ativo</th>
                        <th className="px-5 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-bg-primary dark:bg-slate-800">
                      {commissionConfigs.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                            Nenhum vendedor configurado. Clique em "Adicionar Vendedor" para começar.
                          </td>
                        </tr>
                      )}
                      {commissionConfigs.map((config, idx) => (
                        <tr key={idx} className="hover:bg-bg-secondary transition-colors group">
                          <td className="px-4 py-3">
                            <select
                              value={config.usuario_id}
                              onChange={(e) => updateVendedorRow(idx, 'usuario_id', parseInt(e.target.value))}
                              className="border border-border rounded-lg px-2 py-1.5 text-sm w-full bg-bg-primary dark:bg-slate-900 text-text-primary focus:ring-2 focus:ring-primary"
                            >
                              <option value="">Selecione...</option>
                              {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name || u.nome}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={config.meta_mensal > 0 ? formatCurrency(config.meta_mensal) : ''}
                              onChange={(e) => updateVendedorRow(idx, 'meta_mensal', parseCurrency(e.target.value))}
                              className="border border-border rounded-lg px-2 py-1.5 text-sm w-full bg-bg-primary dark:bg-slate-900 text-text-primary text-right"
                              placeholder="0,00"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={config.salario_fixo > 0 ? formatCurrency(config.salario_fixo) : ''}
                              onChange={(e) => updateVendedorRow(idx, 'salario_fixo', parseCurrency(e.target.value))}
                              className="border border-border rounded-lg px-2 py-1.5 text-sm w-full bg-bg-primary dark:bg-slate-900 text-text-primary text-right"
                              placeholder="0,00"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 justify-end">
                              <input
                                type="number"
                                value={config.percentual_comissao}
                                onChange={(e) => updateVendedorRow(idx, 'percentual_comissao', parseFloat(e.target.value))}
                                className="border border-border rounded-lg px-2 py-1.5 text-sm w-16 bg-bg-primary dark:bg-slate-900 text-text-primary text-right"
                                placeholder="1"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <span className="text-text-muted text-xs font-bold">%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={config.ativo}
                              onChange={(e) => updateVendedorRow(idx, 'ativo', e.target.checked)}
                              className="w-4 h-4 rounded accent-primary"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => removeVendedorRow(idx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={6} className="p-4 bg-bg-secondary/50">
                          <button
                            onClick={addVendedorRow}
                            className="text-primary hover:text-primary/80 text-xs font-black flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-xl transition-all border border-primary/20 bg-primary/5"
                          >
                            <Plus size={14} /> ADICIONAR VENDEDOR
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-sm font-black text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                    <Calculator size={16} /> Metas por Fornecedor / Estados
                  </h5>
                  <button
                    onClick={addSupplier}
                    className="text-emerald-600 hover:text-emerald-800 text-xs font-black flex items-center gap-2 hover:bg-emerald-50 px-4 py-2 rounded-xl transition-all border border-emerald-200 bg-white dark:bg-slate-800 shadow-sm"
                  >
                    <Plus size={14} /> NOVO FORNECEDOR
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {supplierList.map((forn) => {
                    const fornMetas = fornecedorMetas[forn] || {};
                    const totalAnual = Object.keys(fornMetas).reduce((sum: number, monthKey) => {
                      const monthObj = fornMetas[monthKey];
                      if (typeof monthObj === 'object' && monthObj !== null) {
                        return sum + Object.values(monthObj).reduce((s: number, v: number) => s + (Number(v) || 0), 0);
                      }
                      return sum;
                    }, 0);

                    return (
                      <div key={forn} className="border border-emerald-200 dark:border-emerald-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800 px-5 py-3 flex items-center justify-between">
                          <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase">
                            {forn}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-text-muted font-mono">
                              Total: <strong className="text-emerald-600">{totalAnual > 0 ? formatCurrency(totalAnual) : 'R$ 0,00'}</strong>
                            </span>
                            <button
                              onClick={() => removeSupplier(forn)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Remover fornecedor"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="overflow-x-auto bg-bg-primary dark:bg-slate-800">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-bg-secondary dark:bg-slate-700 text-text-muted font-black uppercase text-[10px]">
                                <th className="px-4 py-2 text-left min-w-[80px] border-r border-border">UF</th>
                                {months.map((m, i) => (
                                  <th key={i} className="px-2 py-2 text-right min-w-[60px]">{m}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {['PE', 'PB', 'AL', 'RN'].map(uf => (
                                <tr key={uf} className="hover:bg-bg-secondary dark:hover:bg-slate-700 transition-colors">
                                  <td className="px-4 py-2 border-r border-border">
                                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-black text-[11px]">{uf}</span>
                                  </td>
                                  {Array.from({ length: 12 }, (_, i) => {
                                    const month = i + 1;
                                    const monthData = fornMetas[month];
                                    const val = (monthData && typeof monthData === 'object') ? (monthData[uf] || 0) : 0;
                                    return (
                                      <td key={month} className="px-1 py-1 text-right">
                                        <input
                                          type="text"
                                          value={val > 0 ? formatCurrency(val) : ''}
                                          onChange={(e) => handleFornecedorMetaChange(forn, uf, month, e.target.value)}
                                          className="w-full text-right text-[11px] font-mono border-0 bg-transparent focus:bg-bg-secondary focus:border focus:border-blue-300 dark:focus:border-blue-600 rounded px-1 py-0.5 outline-none transition-all text-text-primary"
                                          placeholder="-"
                                        />
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 bg-bg-secondary dark:bg-slate-700 border-t border-border flex justify-end gap-3 rounded-b-[2rem]">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-6 py-2.5 rounded-xl border border-border text-text-secondary hover:bg-bg-tertiary text-sm font-bold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={loadingConfig}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loadingConfig ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                SALVAR CONFIGURAÇÕES
              </button>
            </div>
          </div>

          {showAddSupplierModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddSupplierModal(false)} />
              <div className="relative bg-bg-primary dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-border animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-black text-text-primary text-lg">Novo Fornecedor</h4>
                  <button
                    onClick={() => setShowAddSupplierModal(false)}
                    className="text-text-muted hover:text-text-primary w-8 h-8 rounded-lg hover:bg-bg-tertiary flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-text-muted uppercase mb-2">
                      Nome do Fornecedor
                    </label>
                    <input
                      type="text"
                      value={newSupplierName}
                      onChange={(e) => setNewSupplierName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSupplier()}
                      placeholder="Ex: NOVA EMPRESA"
                      className="w-full border border-border rounded-xl px-4 py-3 bg-bg-primary dark:bg-slate-900 text-text-primary font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowAddSupplierModal(false)}
                      className="px-4 py-2 rounded-xl border border-border text-text-secondary hover:bg-bg-tertiary text-sm font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddSupplier}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}