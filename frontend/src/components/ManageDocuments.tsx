import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Search,
  Bell,
  Plus,
  FileSignature,
  ChevronDown,
  Download,
  Eye,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'AUTO' | 'MANUAL';
  group: string;
  status: 'DISPONIVEL' | 'PENDENTE' | 'COLETANDO';
  expiryDate: string;
}

const mockDocuments: Document[] = [
  { id: '1', name: 'CNPJ', type: 'AUTO', group: 'Habilitação Jurídica', status: 'DISPONIVEL', expiryDate: '15/12/2024' },
  { id: '2', name: 'Certidão Conjunta Federal', type: 'AUTO', group: 'Regularidade Fiscal', status: 'DISPONIVEL', expiryDate: '20/11/2024' },
  { id: '3', name: 'Certidão Estadual', type: 'MANUAL', group: 'Regularidade Fiscal', status: 'PENDENTE', expiryDate: '-' },
  { id: '4', name: 'Certidão Municipal', type: 'MANUAL', group: 'Regularidade Fiscal', status: 'COLETANDO', expiryDate: '-' },
  { id: '5', name: 'Certidão FGTS', type: 'AUTO', group: 'Regularidade Fiscal', status: 'DISPONIVEL', expiryDate: '10/01/2025' },
  { id: '6', name: 'Certidão de Falência', type: 'AUTO', group: 'Qualificação Técnica', status: 'DISPONIVEL', expiryDate: '05/02/2025' },
  { id: '7', name: 'Contrato Social', type: 'MANUAL', group: 'Habilitação Jurídica', status: 'PENDENTE', expiryDate: '-' },
  { id: '8', name: 'Balanço Patrimonial', type: 'MANUAL', group: 'Qualificação Técnica', status: 'COLETANDO', expiryDate: '-' },
  { id: '9', name: 'Certidão de，工匠资格', type: 'AUTO', group: 'Qualificação Técnica', status: 'DISPONIVEL', expiryDate: '18/03/2025' },
  { id: '10', name: 'Alvará de Funcionamento', type: 'MANUAL', group: 'Habilitação Jurídica', status: 'DISPONIVEL', expiryDate: '30/06/2024' }
];

const typeStyles = {
  AUTO: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MANUAL: 'bg-surface-elevated text-text-muted border-border-subtle'
};

const statusStyles = {
  DISPONIVEL: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  PENDENTE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  COLETANDO: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
};

const groups = [
  'Habilitação Jurídica',
  'Regularidade Fiscal',
  'Qualificação Técnica',
  'Qualificação Econômico-Financeira',
  'Declarações Obrigatórias'
];

export default function ManageDocuments() {
  const navigate = useNavigate();
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedUpdateType, setSelectedUpdateType] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleGroup = (group: string) => {
    setSelectedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(doc.group);
    const matchesStatus = !selectedStatus || doc.status === selectedStatus;
    const matchesType = !selectedUpdateType || 
      (selectedUpdateType === 'auto' && doc.type === 'AUTO') ||
      (selectedUpdateType === 'manual' && doc.type === 'MANUAL');
    return matchesSearch && matchesGroup && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in duration-700">
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate('/bidding-hub')}
          className="w-10 h-10 rounded-xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/30 hover:ring-2 hover:ring-primary/20 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter text-text-primary">
            Gerenciar <span className="text-gradient-gold">Documentos</span>
          </h1>
          <p className="text-sm font-medium text-text-muted">
            Organize e mantenha sua documentação atualizada
          </p>
        </div>
      </header>

      <div className="flex gap-8">
        <aside className="w-72 flex-shrink-0 space-y-6">
          <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Filter size={18} className="text-primary" />
              </div>
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary">
                Filtros
              </h2>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Grupos de Documentos
              </label>
              <div className="space-y-2">
                {groups.map(group => (
                  <label key={group} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group)}
                      onChange={() => toggleGroup(group)}
                      className="w-4 h-4 rounded border-border-subtle bg-surface-elevated text-primary focus:ring-primary/20 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors">
                      {group}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Situação
              </label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todas as situações</option>
                  <option value="DISPONIVEL">Disponível</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="COLETANDO">Coletando</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Forma de Atualização
              </label>
              <div className="relative">
                <select
                  value={selectedUpdateType}
                  onChange={(e) => setSelectedUpdateType(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-elevated/50 border border-border-subtle rounded-xl text-sm text-text-primary appearance-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="">Todas</option>
                  <option value="auto">Automática</option>
                  <option value="manual">Manual</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Pesquisar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-2xl text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-5 py-3 bg-surface-elevated border border-border-subtle rounded-2xl text-sm font-medium text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                <Bell size={18} />
                Notificações
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-surface-elevated border border-border-subtle rounded-2xl text-sm font-medium text-text-secondary hover:text-primary hover:border-primary/30 transition-all">
                <Plus size={18} />
                Adicionar documento
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:scale-[1.02] transition-transform shadow-lg">
                <FileSignature size={16} />
                Gerador de declarações
              </button>
            </div>
          </div>

          <div className="bg-surface/50 backdrop-blur-xl border border-border-subtle rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Documento</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Tipo</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Grupo</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Situação</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Vencimento</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-wider text-text-muted">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-border-subtle/50 hover:bg-surface-elevated/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center">
                          <FileText size={14} className="text-text-muted" />
                        </div>
                        <span className="font-medium text-text-primary">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${typeStyles[doc.type as keyof typeof typeStyles]}`}>
                        {doc.type === 'AUTO' ? 'Auto' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-text-secondary">{doc.group}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.status === 'DISPONIVEL' && <CheckCircle size={14} className="text-emerald-500" />}
                        {doc.status === 'PENDENTE' && <Clock size={14} className="text-amber-500" />}
                        {doc.status === 'COLETANDO' && <AlertCircle size={14} className="text-blue-500" />}
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${statusStyles[doc.status as keyof typeof statusStyles]}`}>
                          {doc.status === 'DISPONIVEL' ? 'Disponível' : doc.status === 'PENDENTE' ? 'Pendente' : 'Coletando'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${doc.expiryDate === '-' ? 'text-text-muted' : 'text-text-primary'}`}>
                        {doc.expiryDate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                          <Eye size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                          <Download size={16} />
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-text-muted">
            <span>Mostrando {filteredDocuments.length} de {mockDocuments.length} documentos</span>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-lg bg-surface-elevated hover:bg-surface text-text-secondary hover:text-text-primary transition-all">Anterior</button>
              <button className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-medium">1</button>
              <button className="px-3 py-1 rounded-lg bg-surface-elevated hover:bg-surface text-text-secondary hover:text-text-primary transition-all">Próximo</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}