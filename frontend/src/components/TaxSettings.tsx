import { useState, useEffect } from 'react';
import { Settings, Upload, Save, Loader2, Shield, Landmark, ShieldCheck, Lock, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';

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
      toast.success('Configurações tributárias consolidadas!');
    } catch { toast.error('Falha ao salvar diretrizes fiscais'); }
    finally { setSaving(false); }
  };

  const handleCertUpload = async (file: File) => {
    if (!password) {
      toast.error('Chave criptográfica (senha) obrigatória!');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('certificate', file);
      form.append('password', password);
      const r = await api.post('/api/financial/tax-config/certificate', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Certificado Digital sincronizado com sucesso!');
      setConfig(r.data.data);
      setPassword('');
    } catch { toast.error('Erro na validação do certificado'); }
    finally { setUploading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 animate-in fade-in duration-700">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-40" />
        <Shield className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary w-5 h-5" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Consultando Regras Tributárias...</span>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-700 text-text-primary">
      
      <header className="space-y-1">
        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">
          Conformidade <span className="text-gradient-gold">Fiscal & Regulatória</span>
        </h2>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Lock size={12} className="text-primary" /> Governança de tributação e integridade financeira Platinum.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-10">
        {/* Rules Card */}
        <div className="platinum-card overflow-hidden border-border-subtle/30 bg-surface-elevated/10 backdrop-blur-xl">
          <div className="px-10 py-6 bg-surface-elevated/20 border-b border-border-subtle flex items-center gap-4">
            <Settings className="w-5 h-5 text-primary shadow-platinum-glow-sm" />
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Matriz Tributária Neural</h3>
          </div>
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield size={12} /> Regime Especial
              </label>
              <div className="relative group">
                <select 
                  value={config.regime_especial} 
                  onChange={e => setConfig({...config, regime_especial: e.target.value})} 
                  className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all appearance-none shadow-inner-platinum"
                >
                  <option value="" className="bg-surface text-text-primary">Selecionar Regime...</option>
                  {REGIMES.map(r => <option key={r} value={r} className="bg-surface text-text-primary">{r}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-primary transition-colors">
                  <Settings size={14} />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                 <Landmark size={12} /> Alíquota Operacional (%)
              </label>
              <input 
                type="number" step="0.01" min="0" max="100" 
                value={config.aliquota_padrao}
                onChange={e => setConfig({...config, aliquota_padrao: e.target.value})}
                className="w-full bg-background/50 border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" 
              />
            </div>
          </div>
        </div>

        {/* Behavior Card */}
        <div className="platinum-card overflow-hidden border-border-subtle/30 bg-surface-elevated/10 backdrop-blur-xl">
          <div className="px-10 py-6 bg-surface-elevated/20 border-b border-border-subtle flex items-center gap-4">
            <Landmark className="w-5 h-5 text-primary shadow-platinum-glow-sm" />
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Diretrizes de Tesouraria</h3>
          </div>
          <div className="p-10">
             <label className="flex items-start gap-6 p-8 bg-surface-elevated/20 border border-border-subtle rounded-3xl hover:border-primary/40 cursor-pointer transition-all group shadow-inner-platinum">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  checked={config.permite_saldo_negativo} 
                  onChange={e => setConfig({...config, permite_saldo_negativo: e.target.checked})} 
                  className="w-6 h-6 rounded-lg border-border-medium bg-background text-primary focus:ring-primary focus:ring-offset-background transition-all" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-black text-text-primary uppercase tracking-tighter group-hover:text-primary transition-colors">
                  Permitir Exposição Bancária (Saldo Negativo)
                </span>
                <span className="text-[10px] text-text-muted font-black leading-relaxed uppercase tracking-[0.2em] opacity-60">
                  Habilita o uso de crédito especial, permitindo liquidações de saída mesmo com ausência de fundos imediatos. Uso restrito a supervisores.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="btn-primary py-4 px-12 shadow-platinum-glow flex items-center gap-3 uppercase text-[11px] tracking-[0.3em] font-black"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Consolidar Diretrizes
          </button>
        </div>
      </form>

      {/* Certificate Card */}
      <div className="platinum-card overflow-hidden border-border-subtle/30 bg-surface-elevated/10 backdrop-blur-xl">
        <div className="px-10 py-6 bg-surface-elevated/20 border-b border-border-subtle flex items-center gap-4">
          <Shield className="w-5 h-5 text-primary shadow-platinum-glow-sm" />
          <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Certificação Digital A1 Platinum</h3>
        </div>
        <div className="p-10 space-y-10">
          {config.certificado_path ? (
            <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-8 animate-in zoom-in-95 duration-700 shadow-inner-platinum">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-platinum-glow-sm group">
                <ShieldCheck size={32} className="group-hover:scale-110 transition-transform" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black text-text-primary uppercase tracking-tighter">Certificado Ativo & Criptografado</p>
                <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-[0.2em]">Repositório privado configurado. Identidade fiscal validada para emissão neural de NF-e.</p>
              </div>
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-border-medium rounded-3xl text-center space-y-5 bg-surface-elevated/5 group hover:border-primary/40 transition-all duration-500">
              <Shield className="w-16 h-16 mx-auto text-text-muted/20 group-hover:text-primary/20 transition-colors" />
              <div className="space-y-2">
                <p className="text-xs font-black text-text-primary uppercase tracking-[0.3em]">Nenhuma Assinatura Digital Detectada</p>
                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">Necessário para autenticação SEFAZ e emissão de documentos fiscais automatizados.</p>
              </div>
            </div>
          )}

          <div className="p-10 bg-surface-elevated/20 border border-border-subtle rounded-3xl space-y-8 shadow-inner-platinum">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3">
               <Key size={12} /> Sincronizar Nova Identidade Fiscal
            </h4>
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Senha da Chave Privada (RSA 4096)</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Informe a senha criptográfica..."
                  className="w-full bg-background border border-border-medium rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none focus:border-primary/40 transition-all shadow-inner-platinum placeholder:text-text-muted/30" 
                />
              </div>
              
              <label className="cursor-pointer group">
                <input type="file" accept=".pfx,.p12" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCertUpload(e.target.files[0]); }} />
                <span className="inline-flex items-center justify-center gap-4 px-10 py-4 bg-surface-elevated/50 border border-border-medium text-text-primary rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-surface-elevated group-hover:border-primary/40 transition-all shadow-platinum-glow-sm w-full md:w-auto">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {config.certificado_path ? 'Substituir' : 'Upload .PFX Neural'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
