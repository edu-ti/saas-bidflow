import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
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
      
      const hostname = window.location.hostname;
      const isMasterPanel = hostname.startsWith('master.') || hostname === import.meta.env.VITE_MASTER_DOMAIN;

      if (res.data.user.is_superadmin && isMasterPanel) {
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg-primary">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none flex justify-center">
        <div className="w-[1000px] h-[500px] bg-primary/5 rounded-full blur-[100px] -top-64 absolute" />
      </div>

      <div className="w-full max-w-[400px] relative z-10 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex flex-col items-center gap-4">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="h-16 w-auto object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary tracking-tight">
                  Bem-vindo ao BidFlow
                </h1>
                <p className="text-sm text-text-secondary">
                  Acesse sua conta para continuar
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="card p-8 shadow-md">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-danger/10 text-danger text-sm font-medium border border-danger/20 text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                Endereço de e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-1.5">
            <p className="text-xs font-medium text-text-muted">Ambiente de Testes</p>
            <p className="text-sm font-medium text-text-primary">admin@bidflow.dev / password</p>
          </div>
        </div>

        <div className="text-center">
           <p className="text-xs text-text-muted font-medium">© 2026 BidFlow</p>
        </div>
      </div>
    </div>
  );
}
