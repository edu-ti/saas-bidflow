import { useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Settings, Upload, Save, Loader2, Shield, Landmark, ShieldCheck, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { Select } from './ui/Select';

interface TaxConfig {
  id?: number;
  regime_especial: string;
  aliquota_padrao: string;
  certificado_path: string | null;
  permite_saldo_negativo: boolean;
}

const REGIMES = [
  'Simples Nacional',
  'Lucro Presumido',
  'Lucro Real',
  'MEI',
];

export default function TaxSettings() {
  const { hasPermission } = usePermissions();
  const canSave = hasPermission('financial', 'tax-settings', 'update');

  const [config, setConfig] = useState<TaxConfig>({ regime_especial: '', aliquota_padrao: '0', certificado_path: null, permite_saldo_negativo: false });
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/financial/tax-config')
      .then(r => { if (r.data.data) setConfig(r.data.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/financial/tax-config', {
        regime_especial: config.regime_especial,
        aliquota_padrao: Number(config.aliquota_padrao),
        permite_saldo_negativo: config.permite_saldo_negativo,
      });
      toast.success('Configurações tributárias salvas com sucesso!');
    } catch { toast.error('Falha ao salvar configurações'); }
    finally { setSaving(false); }
  };

  const handleCertUpload = async (file: File) => {
    if (!password) {
      toast.error('Senha do certificado é obrigatória!');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('certificate', file);
      form.append('password', password);
      const r = await api.post('/api/financial/tax-config/certificate', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Certificado Digital enviado com sucesso!');
      setConfig(r.data.data);
      setPassword('');
    } catch { toast.error('Erro na validação do certificado'); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 animate-fade-in">
      <div className="relative">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-40" />
      </div>
      <span className="text-sm font-medium text-text-muted">Carregando configurações...</span>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      
      <header className="space-y-1 border-b border-border pb-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Configurações Fiscais
        </h2>
        <p className="text-sm text-text-secondary flex items-center gap-2">
          <Lock size={14} className="text-text-muted" /> Configuração de tributação e certificação digital.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Rules Card */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-bg-secondary border-b border-border flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Regras de Tributação</h3>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                <Shield size={14} className="text-text-muted" /> Regime Tributário
              </label>
              <div className="relative z-20">
                <Select 
                  value={config.regime_especial} 
                  onChange={(value) => setConfig({...config, regime_especial: value})} 
                  options={[
                    { value: '', label: 'Selecionar Regime...' },
                    ...REGIMES.map(r => ({ value: r, label: r }))
                  ]}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary flex items-center gap-2">
                 <Landmark size={14} className="text-text-muted" /> Alíquota Padrão (%)
              </label>
              <input 
                type="number" step="0.01" min="0" max="100" 
                value={config.aliquota_padrao}
                onChange={e => setConfig({...config, aliquota_padrao: e.target.value})}
                className="input w-full" 
              />
            </div>
          </div>
        </div>

        {/* Behavior Card */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 bg-bg-secondary border-b border-border flex items-center gap-3">
            <Landmark className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-semibold text-text-primary">Diretrizes Financeiras</h3>
          </div>
          <div className="p-6 md:p-8">
             <label className="flex items-start gap-4 p-4 border border-border rounded-xl hover:bg-bg-secondary cursor-pointer transition-colors">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={config.permite_saldo_negativo} 
                  onChange={e => setConfig({...config, permite_saldo_negativo: e.target.checked})} 
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-text-primary">
                  Permitir Saldo Negativo
                </span>
                <span className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Permite liquidações de saída mesmo quando a conta não possui fundos suficientes. Recomendado apenas para contas de crédito/cheque especial.
                </span>
              </div>
            </label>
          </div>
        </div>

        {canSave && (
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Configurações</span>
            </button>
          </div>
        )}
      </form>

      {/* Certificate Card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-bg-secondary border-b border-border flex items-center gap-3">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Certificado Digital (A1)</h3>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          {config.certificado_path ? (
            <div className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/20 flex items-center justify-center text-success">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-success">Certificado Ativo</p>
                <p className="text-xs text-success/80 mt-0.5">Pronto para emissão de documentos fiscais.</p>
              </div>
            </div>
          ) : (
            <div className="p-8 border border-dashed border-border rounded-xl text-center flex flex-col items-center bg-bg-secondary/50">
              <Shield className="w-12 h-12 text-text-muted mb-3" />
              <p className="text-sm font-medium text-text-primary">Nenhum certificado configurado</p>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">Necessário para comunicação automática com a SEFAZ e emissão de notas fiscais.</p>
            </div>
          )}

          <div className="p-6 bg-bg-secondary border border-border rounded-xl space-y-4">
            <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
               <Key size={14} className="text-text-muted" /> Enviar Novo Certificado
            </h4>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Senha do Certificado</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Senha do arquivo .pfx"
                  className="input w-full" 
                />
              </div>
              
              {canSave && (
                <label className="cursor-pointer group flex-shrink-0">
                  <input type="file" accept=".pfx,.p12" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCertUpload(e.target.files[0]); }} />
                  <span className="btn btn-outline w-full md:w-auto flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>{config.certificado_path ? 'Substituir Certificado' : 'Selecionar Arquivo'}</span>
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
