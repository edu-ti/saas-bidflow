import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePermissions } from '../hooks/usePermissions';
import {
  User,
  Bell,
  Shield,
  Smartphone,
  QrCode,
  LogOut,
  Save,
  Lock,
  Monitor,
  ChevronRight,
  Check,
  Loader2,
  Building,
  Landmark,
  Users,
  ShieldCheck,
  Zap,
  Activity,
  History,
  Mail,
  Phone,
  Plus,
  Volume2,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import api from "../lib/axios";
import toast from "react-hot-toast";
import ConfirmModal, { type ConfirmModalType } from "./ConfirmModal";
import CompanySettings from "./CompanySettings";
import UsersManagement from "./UsersManagement";
import TaxSettings from "./TaxSettings";

const Settings = () => {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : { role: 'Admin' };
  const isAdmin = user?.role === 'Admin' || user?.is_superadmin;

  const { hasPermission } = usePermissions();
  const canUpdateProfile = hasPermission('modules', 'settings-profile', 'update');

  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    role: "",
    email: "",
    avatar: "",
    department: "",
    phone: "",
  });

  // Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showDevices, setShowDevices] = useState(false);
  const [passwordResetSent, setPasswordResetSent] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Confirm Modal State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    type: ConfirmModalType;
    onConfirm?: () => void;
    confirmText?: string;
    showCancel?: boolean;
  }>({ title: "", message: "", type: "info" });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/api/settings/profile");
      const data = res.data;
      setProfile({
        name: data.name || "",
        email: data.email || "",
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.name || 'User'}&background=fbbf24&color=0a0a0b`,
        role: data.role || "",
        department: data.department || "",
        phone: data.phone || "",
      });
    } catch (e) {
      console.error("Erro ao carregar perfil:", e);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handlePhotoUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: url }));
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      await api.put("/api/settings/profile", profile);
      setSaveSuccess(true);
      toast.success("Configurações atualizadas!");
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      toast.error("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FAToggle = async () => {
    setLoading2FA(true);
    try {
      const newValue = !twoFactorEnabled;
      await api.post('/api/settings/2fa', { enabled: newValue });
      setTwoFactorEnabled(newValue);
      toast.success(`Segurança 2FA ${newValue ? 'ativada' : 'desativada'}`);
    } catch {
      toast.error('Erro na configuração de 2FA');
    } finally {
      setLoading2FA(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoadingPassword(true);
    try {
      await api.post('/api/settings/password-reset');
      setPasswordResetSent(true);
      toast.success('Check seu email estratégico!');
      setTimeout(() => setPasswordResetSent(false), 5000);
    } catch {
      toast.error('Erro ao processar reset');
    } finally {
      setLoadingPassword(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'notifications', label: 'Alertas e BI', icon: Bell },
    { id: 'whatsapp', label: 'Gateway RPA', icon: Smartphone },
    { id: 'security', label: 'Criptografia', icon: ShieldCheck },
  ];

  const adminItems = [
    { id: 'company', label: 'Core Business', icon: Building },
    { id: 'users', label: 'Níveis de Acesso', icon: Users },
    { id: 'tax', label: 'Compliance Fiscal', icon: Landmark },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Configurações
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Gerencie sua conta, equipe e configurações do sistema.
          </p>
        </div>
      </header>

      <div className="card flex flex-col md:flex-row min-h-[750px] overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 bg-bg-secondary border-r border-border p-6 flex flex-col shrink-0 gap-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-text-muted px-4 mb-3 uppercase tracking-wider">Conta</p>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between group px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-text-muted group-hover:text-text-primary transition-colors'} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {activeTab === item.id && <ChevronRight size={16} className={activeTab === item.id ? "text-white/70" : "opacity-0 group-hover:opacity-100 transition-opacity"} />}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-text-muted px-4 mb-3 uppercase tracking-wider border-t border-border pt-6">Administração</p>
              {adminItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between group px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-text-muted group-hover:text-text-primary transition-colors'} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {activeTab === item.id && <ChevronRight size={16} className={activeTab === item.id ? "text-white/70" : "opacity-0 group-hover:opacity-100 transition-opacity"} />}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {activeTab === "profile" && (
            <div className="space-y-10 max-w-3xl animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-border pb-10">
                <div className="relative group cursor-pointer shrink-0" onClick={handlePhotoUpload}>
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-32 h-32 rounded-2xl object-cover border border-border shadow-sm group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-2xl">
                    <Plus size={24} className="text-white" />
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div className="space-y-3 text-center sm:text-left flex-1">
                  <h2 className="text-2xl font-semibold text-text-primary">{profile.name || 'Seu Nome'}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <span className="px-3 py-1 bg-bg-secondary text-text-primary text-xs font-medium border border-border rounded-lg">{profile.role || 'Membro'}</span>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <Mail size={14} className="text-text-muted" />
                      <span>{profile.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Nome Completo</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Cargo Estratégico</label>
                  <input type="text" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Departamento</label>
                  <input type="text" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} className="input w-full" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text-primary">Telefone</label>
                  <input type="text" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input w-full" />
                </div>
              </div>

              {canUpdateProfile && (
                <div className="flex justify-end pt-6 border-t border-border">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : saveSuccess ? <Check size={16} /> : <Save size={16} />}
                    <span>{saveSuccess ? "Salvo" : "Salvar Alterações"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-8 max-w-3xl animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary">Integração WhatsApp</h2>
                  <p className="text-text-secondary text-sm mt-1">Conectividade autônoma para notificações do sistema.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-lg text-xs font-medium">
                  <Zap size={14} className="animate-pulse" /> Conectado
                </div>
              </div>

              <div className="bg-bg-tertiary border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center gap-10">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <QrCode size={140} className="text-background" />
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm font-medium text-text-secondary">Instância</span>
                      <span className="text-sm font-semibold text-text-primary">Vendas_Primary_Core</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border pb-3">
                      <span className="text-sm font-medium text-text-secondary">Número Conectado</span>
                      <span className="text-sm font-mono font-medium text-text-primary">+55 11 99999-9999</span>
                    </div>
                  </div>
                  <button className="btn btn-outline text-danger hover:text-danger hover:bg-danger/10 border-danger/20 w-full flex justify-center items-center gap-2">
                    <LogOut size={16} /> Encerrar Sessão
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8 max-w-3xl animate-in fade-in duration-500">
              <div className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold text-text-primary">Alertas e Business Intelligence</h2>
                <p className="text-text-secondary text-sm mt-1">Configure suas preferências de notificação e alertas estratégicos.</p>
              </div>

              {/* Alertas de Sistema */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Canais de Notificação</h3>
                <p className="text-xs text-text-muted">Escolha como deseja receber os alertas do sistema.</p>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Mail size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Notificações por Email</h4>
                      <p className="text-xs text-text-muted mt-0.5">Relatórios diários e alertas de alto impacto</p>
                    </div>
                  </div>
                  <button className="relative w-12 h-7 rounded-full bg-primary transition-colors">
                    <span className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>

                {/* Push */}
                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Smartphone size={20} className="text-green-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Push no Navegador</h4>
                      <p className="text-xs text-text-muted mt-0.5">Alertas instantâneos enquanto estiver logado</p>
                    </div>
                  </div>
                  <button className="relative w-12 h-7 rounded-full bg-primary transition-colors">
                    <span className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>

                {/* Som */}
                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Volume2 size={20} className="text-amber-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Aviso Sonoro</h4>
                      <p className="text-xs text-text-muted mt-0.5">Som para alertas de prioridade crítica</p>
                    </div>
                  </div>
                  <button className="relative w-12 h-7 rounded-full bg-bg-tertiary border border-border transition-colors">
                    <span className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-text-muted shadow-sm transition-transform" />
                  </button>
                </div>
              </div>

              {/* Tipos de Alerta */}
              <div className="space-y-2 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Tipos de Alerta</h3>
                <p className="text-xs text-text-muted">Selecione quais eventos acionam notificações.</p>
              </div>

              <div className="space-y-4">
                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                      <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Licitações com Prazo Crítico</h4>
                      <p className="text-xs text-text-muted mt-0.5">Alertas quando o prazo for menor que 48h</p>
                    </div>
                  </div>
                  <button className="relative w-12 h-7 rounded-full bg-primary transition-colors">
                    <span className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>

                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Novos Concorrentes Detectados</h4>
                      <p className="text-xs text-text-muted mt-0.5">Monitoramento de mercado e concorrência</p>
                    </div>
                  </div>
                  <button className="relative w-12 h-7 rounded-full bg-primary transition-colors">
                    <span className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>

                <div className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <RefreshCw size={20} className="text-cyan-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Atualização de Editais</h4>
                      <p className="text-xs text-text-muted mt-0.5">Mudanças em licitações que você acompanha</p>
                    </div>
                  </div>
                  <button className="relative w-12 h-7 rounded-full bg-primary transition-colors">
                    <span className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform" />
                  </button>
                </div>
              </div>

              {/* BI Link */}
              <div className="pt-4 border-t border-border">
                <a
                  href="/reports"
                  className="card p-5 flex items-center justify-between hover:border-primary transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <BarChart3 size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">Relatórios de BI</h4>
                      <p className="text-xs text-text-muted mt-0.5">Acesse dashboards e relatórios estratégicos completos</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 max-w-3xl animate-in fade-in duration-500">
              <div className="border-b border-border pb-6">
                <h2 className="text-xl font-semibold text-text-primary">Segurança e Acesso</h2>
                <p className="text-text-secondary text-sm mt-1">Protocolos de segurança e auditoria estratégica.</p>
              </div>

              <div className="space-y-6">
                <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck size={24} />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-base font-semibold text-text-primary">Autenticação 2FA</h4>
                      <p className={`text-sm mt-1 font-medium ${twoFactorEnabled ? 'text-success' : 'text-danger'}`}>
                        {twoFactorEnabled ? 'Protegido via Token' : 'Vulnerável (Risco)'}
                      </p>
                    </div>
                  </div>
                  {canUpdateProfile && (
                    <button onClick={handle2FAToggle} disabled={loading2FA} className={`btn ${twoFactorEnabled ? 'btn-outline text-danger border-danger/20 hover:bg-danger/10 hover:text-danger' : 'btn-primary'}`}>
                      {loading2FA ? 'Processando...' : twoFactorEnabled ? 'Desativar' : 'Ativar Proteção'}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {canUpdateProfile && (
                    <button onClick={handlePasswordReset} className="card p-8 flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors text-center">
                      <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center text-primary mb-2">
                        <Lock size={28} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">Alterar Senha</h4>
                        <p className="text-xs text-text-muted mt-1">Reset seguro via link de email</p>
                      </div>
                    </button>
                  )}
                  <button onClick={() => setShowDevices(!showDevices)} className="card p-8 flex flex-col items-center justify-center gap-4 hover:border-primary transition-colors text-center">
                    <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center text-primary mb-2">
                      <Monitor size={28} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Sessões Ativas</h4>
                      <p className="text-xs text-text-muted mt-1">Gerencie os dispositivos conectados</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-4xl">
            {activeTab === "company" && isAdmin && <CompanySettings />}
            {activeTab === "users" && isAdmin && <UsersManagement />}
            {activeTab === "tax" && isAdmin && <TaxSettings />}
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        confirmText={confirmConfig.confirmText}
        showCancel={confirmConfig.showCancel}
      />
    </div>
  );
};

export default Settings;
