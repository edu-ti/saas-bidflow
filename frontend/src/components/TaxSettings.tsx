import { useState, useEffect } from 'react';
import { Settings, Upload, Save, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useTheme } from '../context/ThemeContext';

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
  const { theme } = useTheme();
  const dark = theme === 'dark';
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
      toast.success('Configurações salvas!');
    } catch { toast.error('Erro ao salvar'); }
    finally { setSaving(false); }
  };

  const handleCertUpload = async (file: File) => {
    if (!password) {
      toast.error('Informe a senha do certificado primeiro!');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('certificate', file);
      form.append('password', password);
      const r = await api.post('/api/financial/tax-config/certificate', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Certificado enviado!');
      setConfig(r.data.data);
      setPassword('');
    } catch { toast.error('Erro no upload'); }
    finally { setUploading(false); }
  };

  const card = dark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const input = dark ? 'bg-slate-700 border-slate-600 text-slate-100' : 'bg-white border-slate-300 text-slate-900';
  const label = dark ? 'text-slate-300' : 'text-slate-700';
  const sub = dark ? 'text-slate-400' : 'text-slate-500';

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-2xl">
      {/* Tax Config Form */}
      <div className={`rounded-xl border mb-6 ${card}`}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold flex items-center gap-2"><Settings className="w-4 h-4" />Configurações Fiscais</h3>
          <p className={`text-xs mt-1 ${sub}`}>Regime tributário e alíquota padrão para emissão de notas</p>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${label}`}>Regime Especial</label>
            <select value={config.regime_especial} onChange={e => setConfig({...config, regime_especial: e.target.value})} className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`}>
              <option value="">Selecione...</option>
              {REGIMES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1.5 ${label}`}>Alíquota Padrão (%)</label>
            <input type="number" step="0.01" min="0" max="100" value={config.aliquota_padrao}
              onChange={e => setConfig({...config, aliquota_padrao: e.target.value})}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm ${input}`} />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="saldo_negativo" checked={config.permite_saldo_negativo} 
              onChange={e => setConfig({...config, permite_saldo_negativo: e.target.checked})} 
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
            <label htmlFor="saldo_negativo" className={`text-sm ${label}`}>
              Permitir saldo bancário negativo ("Crédito Especial")
            </label>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Salvar
            </button>
          </div>
        </form>
      </div>

      {/* Certificate Upload */}
      <div className={`rounded-xl border ${card}`}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" />Certificado Digital A1</h3>
          <p className={`text-xs mt-1 ${sub}`}>Upload do certificado (.pfx/.p12) guardado em ambiente privado e seguro.</p>
        </div>
        <div className="p-5">
          {config.certificado_path ? (
            <div className={`rounded-lg border p-4 mb-4 flex items-center gap-3 ${dark ? 'border-emerald-800 bg-emerald-900/10' : 'border-emerald-200 bg-emerald-50'}`}>
              <Shield className="w-5 h-5 text-emerald-500" />
              <div>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Certificado Instalado com Sucesso</p>
                <p className={`text-xs text-emerald-600/80 dark:text-emerald-400/80`}>Armazenado localmente fora de pastas públicas. Senha salva em modo encriptado.</p>
              </div>
            </div>
          ) : (
            <div className={`rounded-lg border-2 border-dashed p-6 text-center mb-4 ${dark ? 'border-slate-600' : 'border-slate-300'}`}>
              <Shield className={`w-8 h-8 mx-auto mb-2 ${sub}`} />
              <p className={`text-sm ${sub}`}>Nenhum certificado instalado</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${label}`}>Senha do Certificado *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Informe a senha antes de selecionar o arquivo"
                className={`w-full max-w-sm px-3 py-2.5 rounded-lg border text-sm ${input}`} />
            </div>
            
            <label className="cursor-pointer max-w-max">
              <input type="file" accept=".pfx,.p12" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCertUpload(e.target.files[0]); }} />
              <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {config.certificado_path ? 'Substituir Certificado' : 'Enviar Certificado'}
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
