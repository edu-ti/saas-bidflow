import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldX, ArrowRight } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');
  const panel = searchParams.get('panel');

  const getMessage = () => {
    switch (reason) {
      case 'not_authenticated':
        return 'Você precisa estar autenticado para acessar esta área.';
      case 'no_master_role':
        return 'Você não possui a role necessária para acessar o painel master.';
      case 'not_tenant_panel':
        return 'Esta página está disponível apenas para tenants.';
      case 'no_tenant':
        return 'Nenhum tenant ativo encontrado para esta conta.';
      default:
        return 'Você não tem permissão para acessar esta área.';
    }
  };

  const handleGoToPanel = () => {
    if (panel === 'master') {
      const masterDomain = import.meta.env.VITE_MASTER_DOMAIN || 'master.localhost';
      const port = window.location.port ? ':' + window.location.port : '';
      window.location.href = window.location.protocol + '//' + masterDomain + port + '/dashboard';
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <ShieldX size={48} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Acesso Não Autorizado</h1>
        <p className="text-text-secondary mb-2">
          {getMessage()}
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-surface border border-border-subtle text-text-primary rounded-lg hover:bg-surface-elevated transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={handleGoToPanel}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            Ir para o painel correto
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}