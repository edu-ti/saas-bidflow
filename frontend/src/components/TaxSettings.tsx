import { useState, useEffect } from 'react';
import { Settings, Upload, Save, Loader2, Shield, Landmark, ShieldCheck, Lock } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Consultando Regras Tributárias...</span>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      
      <header className="space-y-1">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
          Conformidade <span className="text-gradient-gold">Fiscal & Regulatória</span>
        </h2>
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
          <Lock size={12} className="text-primary" /> Governança de tributação e integridade financeira Platinum.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Rules Card */}
        <div className="platinum-card overflow-hidden">
          <div className="px-8 py-5 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
            <Settings className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Matriz Tributária</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Regime Especial</label>
              <select 
                value={config.regime_especial} 
                onChange={e => setConfig({...config, regime_especial: e.target.value})} 
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all appearance-none"
              >
                <option value="" className="bg-surface">Selecionar Regime...</option>
                {REGIMES.map(r => <option key={r} value={r} className="bg-surface">{r}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest">Alíquota Padrão Operacional (%)</label>
              <input 
                type="number" step="0.01" min="0" max="100" 
                value={config.aliquota_padrao}
                onChange={e => setConfig({...config, aliquota_padrao: e.target.value})}
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:border-primary/40 outline-none transition-all" 
              />
            </div>
          </div>
        </div>

        {/* Behavior Card */}
        <div className="platinum-card overflow-hidden">
          <div className="px-8 py-5 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
            <Landmark className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">Diretrizes de Tesouraria</h3>
          </div>
          <div className="p-8">
             <label className="flex items-start gap-4 p-6 bg-white/[0.02] border border-white/10 rounded-2xl hover:border-primary/30 cursor-pointer transition-all group">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  checked={config.permite_saldo_negativo} 
                  onChange={e => setConfig({...config, permite_saldo_negativo: e.target.checked})} 
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-offset-background" 
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                  Permitir Exposição Bancária (Saldo Negativo)
                </span>
                <span className="text-[10px] text-text-muted font-bold leading-relaxed uppercase tracking-widest">
                  Habilita o uso de crédito especial, permitindo liquidações de saída mesmo com ausência de fundos imediatos.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-10 py-3.5 bg-primary hover:bg-primary-hover text-background rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-platinum-glow disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Consolidar Diretrizes
          </button>
        </div>
      </form>

      {/* Certificate Card */}
      <div className="platinum-card overflow-hidden">
        <div className="px-8 py-5 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Certificação Digital A1</h3>
        </div>
        <div className="p-8 space-y-8">
          {config.certificado_path ? (
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-6 animate-in zoom-in-95 duration-500">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black text-white uppercase tracking-tighter">Certificado Ativo & Criptografado</p>
                <p className="text-[10px] text-emerald-400/70 font-bold uppercase tracking-widest">Repositório privado configurado. Identidade fiscal validada para emissão.</p>
              </div>
            </div>
          ) : (
            <div className="p-10 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-white/[0.01]">
              <Shield className="w-12 h-12 mx-auto text-text-muted/30" />
              <div className="space-y-1">
                <p className="text-xs font-black text-white uppercase tracking-widest">Nenhuma Assinatura Digital Detectada</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Necessário para autenticação SEFAZ e emissão de documentos.</p>
              </div>
            </div>
          )}

          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sincronizar Nova Identidade</h4>
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Senha da Chave Privada *</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Informe a senha do certificado..."
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary/40 transition-all" 
                />
              </div>
              
              <label className="cursor-pointer group">
                <input type="file" accept=".pfx,.p12" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCertUpload(e.target.files[0]); }} />
                <span className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 group-hover:border-primary/40 transition-all shadow-lg w-full md:w-auto">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {config.certificado_path ? 'Substituir' : 'Upload .PFX'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

