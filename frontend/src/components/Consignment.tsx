import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';
import type { ConsignmentRecord } from './consignment/types';
import ConsignmentDashboard from './consignment/ConsignmentDashboard';
import ConsignmentWizard from './consignment/ConsignmentWizard';
import ReconcileModal from './consignment/ReconcileModal';

export default function Consignment() {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  const [records, setRecords] = useState<ConsignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false);

  // Reconcile
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [reconcileTarget, setReconcileTarget] = useState<ConsignmentRecord | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const res = await api.get('/api/consignments', { params });
      setRecords(res.data.data ?? []);
    } catch {
      toast.error('Erro ao carregar consignações');
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSend = async (c: ConsignmentRecord) => {
    if (!confirm(`Enviar remessa #${c.id}? O estoque será deduzido.`)) return;
    try {
      await api.post(`/api/consignments/${c.id}/send`);
      toast.success('Remessa enviada com sucesso!');
      fetchData();
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(', ')
        : e?.response?.data?.message || 'Erro ao enviar';
      toast.error(msg);
    }
  };

  const handleClose = async (c: ConsignmentRecord) => {
    if (!confirm(`Fechar consignação #${c.id}? Itens pendentes serão devolvidos ao estoque e o financeiro será gerado.`)) return;
    try {
      await api.post(`/api/consignments/${c.id}/close`);
      toast.success('Consignação fechada! Contas a receber gerado.');
      fetchData();
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(', ')
        : e?.response?.data?.message || 'Erro ao fechar';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este rascunho?')) return;
    try {
      await api.delete(`/api/consignments/${id}`);
      toast.success('Rascunho excluído!');
      fetchData();
    } catch {
      toast.error('Erro ao excluir');
    }
  };

  const openReconcile = (c: ConsignmentRecord) => {
    setReconcileTarget(c);
    setReconcileOpen(true);
  };

  const base = 'bg-background text-white';

  return (
    <div className={`min-h-screen p-8 ${base}`}>

      <ConsignmentDashboard
        records={records}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onOpenWizard={() => setWizardOpen(true)}
        onOpenReconcile={openReconcile}
        onSend={handleSend}
        onClose={handleClose}
        onDelete={handleDelete}
      />

      <ConsignmentWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={fetchData}
      />

      <ReconcileModal
        isOpen={reconcileOpen}
        consignment={reconcileTarget}
        onClose={() => { setReconcileOpen(false); setReconcileTarget(null); }}
        onSuccess={fetchData}
      />
    </div>
  );
}
