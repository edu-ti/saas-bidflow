import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Zap, Building2, BarChart3, ArrowRight, CheckCircle2, 
  Globe, Sparkles, Layout, Users, Mail, Bot, Smartphone, Lock
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>(localStorage.getItem('company_logo') || '');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const handleStorageChange = () => {
      setCompanyLogo(localStorage.getItem('company_logo') || '');
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const features = [
    {
      icon: <Layout className="text-primary" size={24} />,
      title: "CRM Estratégico",
      desc: "Gestão completa do funil de vendas B2B e público, com visão clara de cada estágio da oportunidade."
    },
    {
      icon: <Sparkles className="text-primary" size={24} />,
      title: "IA em Licitações",
      desc: "Análise inteligente de editais, geração automática de recursos e monitoramento em tempo real de pregões."
    },
    {
      icon: <BarChart3 className="text-primary" size={24} />,
      title: "BI & Analytics",
      desc: "Relatórios avançados de performance, taxa de conversão e previsibilidade de receita em um único lugar."
    },
    {
      icon: <Bot className="text-primary" size={24} />,
      title: "RPA & Automação",
      desc: "Robôs de captura que trabalham 24/7 para encontrar as melhores oportunidades para o seu negócio."
    },
    {
      icon: <Users className="text-primary" size={24} />,
      title: "Gestão de Equipe",
      desc: "Controle de usuários, permissões e metas com dashboards individuais e coletivos de produtividade."
    },
    {
      icon: <Lock className="text-primary" size={24} />,
      title: "Segurança Total",
      desc: "Dados criptografados e backups automáticos garantindo a integridade da sua operação comercial."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary/20 selection:text-primary">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border-subtle py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-platinum-glow">
                  <Shield className="text-white" size={20} />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase">Bid<span className="text-gradient-gold">Flow</span></span>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#recursos" className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">Recursos</a>
            <a href="#como-funciona" className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">Como Funciona</a>
            <a href="#precos" className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">Planos</a>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/login')}
              className="text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-primary transition-colors"
            >
              Entrar
            </button>
            <button className="btn-primary py-3 px-6 text-[10px] tracking-widest">
              SOLICITAR ACESSO
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-1000">
              <Sparkles className="text-primary" size={14} />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">IA + CRM + Licitações</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-text-primary uppercase leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              O Fluxo Certo para a <br />
              <span className="text-gradient-gold">Sua Vitória</span>
            </h1>
            
            <p className="max-w-2xl text-lg text-text-secondary font-medium animate-in fade-in duration-1000 delay-300">
              Sistema integrado de gestão de vendas e CRM com IA para impulsionar seus resultados comerciais — licitações públicas, vendas B2B e muito mais.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 animate-in fade-in duration-1000 delay-500">
              <button className="btn-primary py-5 px-10 text-xs tracking-widest flex items-center gap-4">
                COMEÇAR AGORA <ArrowRight size={16} />
              </button>
              <button className="px-10 py-5 bg-surface-elevated/40 border border-border-subtle rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-surface-elevated transition-all">
                CONHECER RECURSOS
              </button>
            </div>

            {/* Dashboard Mockup */}
            <div className="w-full max-w-5xl mt-20 p-2 bg-border-subtle/30 rounded-[2.5rem] border border-border-subtle/50 shadow-2xl relative animate-in zoom-in-95 duration-1000 delay-700">
               <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20 blur-2xl opacity-50" />
               <img 
                 src="/bidflow_dashboard_mockup_1777829730455.png" 
                 alt="BidFlow Dashboard" 
                 className="w-full rounded-[2.2rem] relative z-10 shadow-platinum-glow"
               />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="recursos" className="py-32 relative bg-surface-elevated/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.5em]">Funcionalidades</h2>
            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter">Ecossistema de Alta Performance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="platinum-card p-10 space-y-6 hover:scale-[1.02] transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                  {f.icon}
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-black text-text-primary uppercase tracking-tight">{f.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução Sob Medida */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-xs font-black text-primary uppercase tracking-[0.5em]">White-Label & Flexibilidade</h2>
                <h3 className="text-5xl font-black text-text-primary uppercase tracking-tighter leading-[0.95]">Uma Solução <br /><span className="text-gradient-gold">Sob Medida</span></h3>
              </div>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                O BidFlow não é apenas um sistema, é uma infraestrutura adaptável. Personalize fluxos, campos, marca e integrações para que o software fale a língua do seu negócio.
              </p>
              <ul className="space-y-6">
                {[
                  "Personalização total de marca e logotipo",
                  "Criação dinâmica de campos e funis",
                  "Integração via API com robôs de lances",
                  "Dashboards personalizados por perfil de usuário"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-text-primary">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
               <div className="absolute -inset-10 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
               <div className="platinum-card p-12 relative z-10 space-y-8 bg-surface-elevated/40 backdrop-blur-xl border-border-subtle/30 shadow-platinum-glow">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-platinum-glow-sm">
                      <Bot size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-text-primary">Engine Inteligente</h4>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Configuração de Fluxo Neural</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-3/4 shadow-platinum-glow-sm" />
                    </div>
                    <div className="h-2 w-full bg-background/50 rounded-full overflow-hidden">
                       <div className="h-full bg-secondary w-1/2 shadow-platinum-glow-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed italic">"Nossa tecnologia se molda à sua estratégia comercial, não o contrário."</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-32 bg-surface-elevated/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-black text-primary uppercase tracking-[0.5em]">Planos</h2>
            <h3 className="text-4xl font-black text-text-primary uppercase tracking-tighter">Escalabilidade para o Seu Negócio</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { title: "Start", price: "249", features: ["1 Usuário", "CRM Básico", "Gestão de Leads", "Suporte via Email"] },
              { title: "Standard", price: "490", features: ["Até 5 Usuários", "CRM Integrado", "Gestão de Licitações", "Relatórios Básicos"] },
              { title: "Premium", price: "990", features: ["Usuários Ilimitados", "IA para Editais", "Dashboard BI", "Automação RPA", "Suporte VIP"], highlight: true },
              { title: "Enterprise", price: "Sob Consulta", features: ["White-Label Total", "API de Integração", "SLA Garantido", "Gerente de Conta", "Segurança Militar"] }
            ].map((p, i) => (
              <div key={i} className={`platinum-card p-12 space-y-10 flex flex-col relative transition-all duration-500 hover:scale-[1.05] ${p.highlight ? 'border-primary/50 bg-primary/5 shadow-platinum-glow' : 'bg-surface-elevated/10'}`}>
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full shadow-platinum-glow-sm">Mais Vendido</div>
                )}
                <div className="text-center space-y-4">
                  <h4 className="text-xs font-black text-text-secondary uppercase tracking-[0.4em]">{p.title}</h4>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-text-secondary">R$</span>
                    <span className="text-5xl font-black text-text-primary tracking-tighter">{p.price}</span>
                    <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{p.price !== 'Sob Consulta' ? '/mês' : ''}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-5">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-secondary">
                      <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all ${p.highlight ? 'btn-primary' : 'bg-background border border-border-subtle hover:border-primary/40'}`}>
                  {p.price === 'Sob Consulta' ? 'Falar com Consultor' : 'Assinar Plano'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border-subtle bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="h-8 w-auto object-contain" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white">
                      <Shield size={16} />
                    </div>
                    <span className="text-lg font-black tracking-tighter uppercase">Bid<span className="text-gradient-gold">Flow</span></span>
                  </div>
                )}
              </div>
              <p className="max-w-xs text-xs text-text-secondary leading-relaxed font-medium">
                Transformando a gestão comercial e a participação em licitações públicas com inteligência artificial e automação de alta performance.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary">Plataforma</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#" className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Segurança</a></li>
                <li><a href="#" className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-text-primary">Suporte</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Contato</a></li>
                <li><a href="#" className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-border-subtle/30 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.3em]">© 2026 BIDFLOW TECHNOLOGIES • TODOS OS DIREITOS RESERVADOS</p>
            <div className="flex items-center gap-8">
              <a href="#" className="text-[9px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="text-[9px] font-black text-text-secondary uppercase tracking-widest hover:text-primary transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
