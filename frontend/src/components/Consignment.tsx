import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';
import { usePermissions } from '../hooks/usePermissions';
import { ConfirmDialog } from './ui/Modal';
import type { ConsignmentRecord } from './consignment/types';
import ConsignmentDashboard from './consignment/ConsignmentDashboard';
import ConsignmentWizard from './consignment/ConsignmentWizard';
import ReconcileModal from './consignment/ReconcileModal';

export default function Consignment() {
  const { theme } = useTheme();

  const { hasPermission } = usePermissions();
  const canCreate = hasPermission('inventory', 'consignments', 'create');
  const canSend = hasPermission('inventory', 'consignments', 'send');
  const canClose = hasPermission('inventory', 'consignments', 'close');
  const canDelete = hasPermission('inventory', 'consignments', 'delete');

  const [records, setRecords] = useState<ConsignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Wizard
  const [wizardOpen, setWizardOpen] = useState(false);

  // Reconcile
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [reconcileTarget, setReconcileTarget] = useState<ConsignmentRecord | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'send' | 'close' | 'delete' | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<ConsignmentRecord | null>(null);

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

  const openConfirm = (c: ConsignmentRecord, action: 'send' | 'close' | 'delete') => {
    setConfirmTarget(c);
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmTarget || !confirmAction) return;
    try {
      if (confirmAction === 'send') {
        await api.post(`/api/consignments/${confirmTarget.id}/send`);
        toast.success('Remessa enviada com sucesso!');
      } else if (confirmAction === 'close') {
        await api.post(`/api/consignments/${confirmTarget.id}/close`);
        toast.success('Consignação fechada! Contas a receber gerado.');
      } else if (confirmAction === 'delete') {
        await api.delete(`/api/consignments/${confirmTarget.id}`);
        toast.success('Rascunho excluído!');
      }
      fetchData();
    } catch (e: any) {
      const msg = e?.response?.data?.errors
        ? Object.values(e.response.data.errors).flat().join(', ')
        : e?.response?.data?.message || 'Erro na operação';
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
      setConfirmTarget(null);
      setConfirmAction(null);
    }
  };

  const openReconcile = (c: ConsignmentRecord) => {
    setReconcileTarget(c);
    setReconcileOpen(true);
  };

  return (
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <ConsignmentDashboard
        records={records}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onOpenWizard={() => setWizardOpen(true)}
        onOpenReconcile={openReconcile}
        onSend={(c) => openConfirm(c, 'send')}
        onClose={(c) => openConfirm(c, 'close')}
        onDelete={(id) => openConfirm({ id } as ConsignmentRecord, 'delete')}
        canCreate={canCreate}
        canSend={canSend}
        canClose={canClose}
        canDelete={canDelete}
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

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        title={
          confirmAction === 'send' ? 'Enviar Remessa' :
          confirmAction === 'close' ? 'Fechar Consignação' : 'Excluir Rascunho'
        }
        message={
          confirmAction === 'send' ? `Enviar remessa #${confirmTarget?.id}? O estoque será deduzido.` :
          confirmAction === 'close' ? `Fechar consignação #${confirmTarget?.id}? Itens pendentes serão devolvidos ao estoque e o financeiro será gerado.` :
          'Excluir este rascunho?'
        }
        confirmText={confirmAction === 'send' ? 'Enviar' : confirmAction === 'close' ? 'Fechar' : 'Excluir'}
        cancelText="Cancelar"
        variant={confirmAction === 'delete' ? 'danger' : 'warning'}
      />
    </div>
  );
}
