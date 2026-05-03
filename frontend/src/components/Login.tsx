import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@bidflow.dev');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/login', { email, password });
      localStorage.setItem('api_token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      if (res.data.user.is_superadmin) {
        navigate('/master/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const companyLogo = localStorage.getItem('company_logo') || '';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(var(--color-primary) 1px, transparent 1px),
          linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px'
      }} />
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-6">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="h-24 w-auto object-contain animate-in fade-in zoom-in duration-700" />
            ) : (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-surface border border-border-medium shadow-elevation-high group">
                  <span className="text-4xl text-primary drop-shadow-platinum-glow transition-transform group-hover:scale-110">●</span> 
                </div>
                <div className="space-y-1">
                  <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase">
                    Bid<span className="text-gradient-gold">Flow</span>
                  </h1>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em]">SaaS Financial Engine</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="platinum-card p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <div className="mb-8">
            <h2 className="text-lg font-black text-text-primary uppercase tracking-tighter">Acesso Restrito</h2>
            <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-widest italic">Inicie sessão para gerenciar seus ativos</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl mb-6 animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest">
                Identificador (E-mail)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-background/50 border border-border-subtle rounded-xl text-text-primary text-sm font-bold focus:outline-none focus:border-primary/50 placeholder:text-text-muted/50 transition-all"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest">
                Chave de Acesso (Senha)
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-background/50 border border-border-subtle rounded-xl text-text-primary text-sm font-bold focus:outline-none focus:border-primary/50 placeholder:text-text-muted/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-xs tracking-widest"
            >
              {loading ? 'AUTENTICANDO...' : 'EFETUAR LOGIN'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-subtle flex flex-col items-center gap-2">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">Sandbox Credentials</p>
            <p className="text-[10px] font-bold text-primary tracking-wider">admin@bidflow.dev / password</p>
          </div>
        </div>

        <div className="text-center">
           <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50">© 2026 BIDFLOW TECHNOLOGIES • SECURED BY PLATINUM OS</p>
        </div>
      </div>
    </div>
  );
}
