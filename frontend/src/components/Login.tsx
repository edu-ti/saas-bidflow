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
      navigate('/dashboard');
    } catch {
      setError('E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 tracking-tight">
            <span className="text-primary drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">●</span> 
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">BidFlow</span>
          </h1>
          <p className="text-text-muted mt-3 text-sm font-medium tracking-wide">ERP SaaS de Licitações</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <h2 className="text-xl font-bold text-white mb-6 tracking-tight">Entrar na plataforma</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-4 backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface/60 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 placeholder-text-muted transition-all duration-300"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface/60 border border-border-subtle rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 placeholder-text-muted transition-all duration-300"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-primary to-primaryHover hover:shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 text-sm mt-2"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs mt-6">
            Dev: admin@bidflow.dev / password
          </p>
        </div>
      </div>
    </div>
  );
}
