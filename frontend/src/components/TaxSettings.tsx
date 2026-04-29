import { useState, useEffect } from 'react';
import { Settings, Upload, Save, Loader2, Shield, Landmark } from 'lucide-react';
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

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
      
      {/* Informações Gerais / Cabeçalho para ficar igual ao CompanySettings */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Configurações Fiscais e Financeiras</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie regras de tributação, certificados e comportamentos de caixa.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tax Config Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Settings className="w-5 h-5 text-indigo-500" />Regras Tributárias</h3>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Regime tributário e alíquota padrão para emissão de notas</p>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Regime Especial</label>
              <select 
                value={config.regime_especial} 
                onChange={e => setConfig({...config, regime_especial: e.target.value})} 
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white transition-colors text-sm"
              >
                <option value="">Selecione...</option>
                {REGIMES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alíquota Padrão (%)</label>
              <input 
                type="number" step="0.01" min="0" max="100" 
                value={config.aliquota_padrao}
                onChange={e => setConfig({...config, aliquota_padrao: e.target.value})}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white transition-colors text-sm" 
              />
            </div>
          </div>
        </div>

        {/* Comportamento Financeiro */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Landmark className="w-5 h-5 text-indigo-500" />Comportamento de Caixa</h3>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Regras de movimentação financeira e saldos</p>
          </div>
          <div className="p-5">
             <label className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors bg-white dark:bg-gray-700">
              <div className="flex items-center h-5 mt-0.5">
                <input 
                  type="checkbox" 
                  checked={config.permite_saldo_negativo} 
                  onChange={e => setConfig({...config, permite_saldo_negativo: e.target.checked})} 
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 focus:ring-2 dark:bg-gray-600 dark:border-gray-500" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Permitir saldo bancário negativo
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Habilita o uso de "Crédito Especial", permitindo transações de saída mesmo sem fundos na conta.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-60 shadow-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Configurações
          </button>
        </div>
      </form>

      {/* Certificate Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-500" />Certificado Digital A1</h3>
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">Upload do certificado (.pfx/.p12) guardado em ambiente privado e seguro.</p>
        </div>
        <div className="p-5">
          {config.certificado_path ? (
            <div className="rounded-lg border p-4 mb-6 flex items-center gap-4 border-emerald-200 bg-emerald-50 dark:border-emerald-900/30 dark:bg-emerald-900/10 transition-colors">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Certificado Instalado com Sucesso</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">Armazenado localmente fora de pastas públicas. Senha salva em modo encriptado.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed p-8 text-center mb-6 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 transition-colors">
              <Shield className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Nenhum certificado instalado</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Faça o upload do seu certificado para emitir notas fiscais.</p>
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">Nova Instalação de Certificado</h4>
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha do Certificado *</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Informe a senha antes de selecionar o arquivo"
                  className="w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700 dark:text-white transition-colors text-sm" 
                />
              </div>
              
              <label className="cursor-pointer">
                <input type="file" accept=".pfx,.p12" className="hidden" onChange={e => { if (e.target.files?.[0]) handleCertUpload(e.target.files[0]); }} />
                <span className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm w-full md:w-auto">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {config.certificado_path ? 'Substituir Certificado' : 'Selecionar Arquivo'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

