import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Plus
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
    <div className="p-8 w-full min-h-screen bg-background space-y-10 text-text-primary animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-text-primary sm:text-4xl uppercase">
            Centro de <span className="text-gradient-gold">Comando</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2 text-sm font-medium">
            <Lock size={14} className="text-primary" />
            Configurações globais e governança do ecossistema BidFlow Platinum.
          </p>
        </div>
      </header>

      <div className="platinum-card flex flex-col md:flex-row min-h-[750px] overflow-hidden bg-surface-elevated/10 backdrop-blur-xl border-border-subtle/30 flex-1">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-85 bg-surface-elevated/20 border-r border-border-subtle p-8 space-y-10 shrink-0">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted px-4 mb-6 opacity-60">Personalização</p>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between group px-5 py-4 rounded-2xl transition-all duration-500 ${
                  activeTab === item.id 
                    ? 'bg-primary text-background shadow-platinum-glow' 
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className={activeTab === item.id ? 'text-background' : 'text-primary/60 group-hover:text-primary transition-colors duration-500'} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight size={14} className={activeTab === item.id ? 'opacity-40' : 'opacity-0 group-hover:opacity-30 transition-all duration-500'} />
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-3 pt-8 border-t border-border-subtle/50">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary px-4 mb-6">Master Control</p>
              {adminItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between group px-5 py-4 rounded-2xl transition-all duration-500 ${
                    activeTab === item.id 
                      ? 'bg-primary text-background shadow-platinum-glow' 
                      : 'text-text-muted hover:bg-surface-elevated hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className={activeTab === item.id ? 'text-background' : 'text-primary/60 group-hover:text-primary transition-colors duration-500'} />
                    <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-40' : 'opacity-0 group-hover:opacity-30 transition-all duration-500'} />
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-10 lg:p-16 animate-in slide-in-from-right-4 duration-700 overflow-y-auto scrollbar-platinum">
          {activeTab === "profile" && (
            <div className="space-y-14 max-w-4xl">
              <div className="flex flex-col sm:flex-row items-center gap-10 border-b border-border-subtle/50 pb-14">
                <div className="relative group cursor-pointer" onClick={handlePhotoUpload}>
                  <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={profile.avatar}
                    alt="Avatar Platinum"
                    className="w-40 h-40 rounded-[2.5rem] object-cover border-2 border-primary/20 shadow-platinum-glow relative z-10"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-[2.5rem] z-20 backdrop-blur-sm">
                    <Plus size={32} className="text-primary" />
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div className="space-y-4 text-center sm:text-left">
                  <h2 className="text-3xl font-black text-text-primary uppercase tracking-tight">{profile.name || 'Identidade BidFlow'}</h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5">
                    <span className="px-5 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20 rounded-xl shadow-platinum-glow-sm">{profile.role || 'Membro Core'}</span>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Mail size={14} className="text-primary/60" />
                      <span className="text-xs font-bold italic">{profile.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Nome Completo</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all placeholder:text-text-muted/40 shadow-inner-platinum" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Cargo Estratégico</label>
                  <input type="text" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })} className="w-full px-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Departamento</label>
                  <input type="text" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} className="w-full px-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-bold text-text-primary focus:border-primary/40 outline-none transition-all shadow-inner-platinum" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] px-1">Telefone Direct</label>
                  <input type="text" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full px-6 py-4 bg-background/50 border border-border-subtle rounded-2xl text-sm font-black text-text-primary focus:border-primary/40 outline-none transition-all font-mono shadow-inner-platinum" />
                </div>
              </div>

              <div className="flex justify-end pt-10 border-t border-border-subtle/30">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="btn-primary py-4 px-12 shadow-platinum-glow"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
                  <span className="ml-2 uppercase tracking-[0.2em]">{saveSuccess ? "Sincronizado" : "Salvar Perfil Platinum"}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-10 max-w-4xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-text-primary uppercase tracking-widest">Gateway RPA / WhatsApp</h2>
                  <p className="text-text-muted text-sm mt-2 font-medium">Conectividade autônoma para notificações em tempo real.</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-platinum-glow-sm">
                  <Zap size={14} className="animate-pulse" /> Live Instance
                </div>
              </div>

              <div className="platinum-card bg-surface-elevated/30 border-border-subtle p-12 flex flex-col md:flex-row items-center gap-16">
                <div className="bg-white p-8 rounded-[3rem] shadow-platinum-glow border-4 border-primary/20 hover:scale-105 transition-transform duration-500">
                  <QrCode size={180} className="text-background" />
                </div>
                <div className="flex-1 space-y-8 w-full">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-border-subtle/50 pb-5">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">ID Instância</span>
                      <span className="text-xs font-black text-text-primary uppercase tracking-tight">Vendas_Primary_Core</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-border-subtle/50 pb-5">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Handshake Digital</span>
                      <span className="text-xs font-mono font-black text-primary tracking-tighter">+55 11 99999-9999</span>
                    </div>
                  </div>
                  <button className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-red-400 transition-colors flex items-center gap-3 group">
                    <div className="p-3 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-colors shadow-platinum-glow-sm">
                      <LogOut size={20} />
                    </div>
                    Encerrar Conexão RPA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-14 max-w-4xl">
              <div>
                <h2 className="text-2xl font-black text-text-primary uppercase tracking-widest">Criptografia e Acesso</h2>
                <p className="text-text-muted text-sm mt-2 font-medium">Protocolos avançados de segurança e auditoria estratégica.</p>
              </div>

              <div className="space-y-8">
                <div className="bg-surface-elevated/40 border border-border-subtle rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-primary/20 transition-all duration-500 shadow-platinum-glow-sm">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-platinum-glow-sm border border-primary/20">
                      <ShieldCheck size={40} />
                    </div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Duplo Fator (2FA)</h4>
                      <p className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-[0.2em]">Status: <span className={twoFactorEnabled ? 'text-emerald-500' : 'text-red-500'}>{twoFactorEnabled ? 'Protegido via Token' : 'Vulnerável (Risco)'}</span></p>
                    </div>
                  </div>
                  <button onClick={handle2FAToggle} disabled={loading2FA} className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] border transition-all duration-500 shadow-platinum-glow-sm ${twoFactorEnabled ? 'border-red-500/20 text-red-500 hover:bg-red-500/10 shadow-red-500/5' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 shadow-emerald-500/5'}`}>
                    {loading2FA ? 'Sincronizando...' : twoFactorEnabled ? 'Desativar Proteção' : 'Ativar Proteção Master'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <button onClick={handlePasswordReset} className="platinum-card p-12 flex flex-col items-center gap-10 group hover:border-primary/40 transition-all duration-500 text-center bg-surface-elevated/20 relative overflow-hidden">
                    <div className="w-24 h-24 rounded-[3rem] bg-surface-elevated flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-platinum-glow transition-all duration-500 border border-border-subtle/50 relative z-10">
                      <Lock size={42} />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Renovar Credenciais</h4>
                      <p className="text-[10px] text-text-muted mt-4 font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">Reset de senha via túnel SSL criptografado</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-colors" />
                  </button>
                  <button onClick={() => setShowDevices(!showDevices)} className="platinum-card p-12 flex flex-col items-center gap-10 group hover:border-primary/40 transition-all duration-500 text-center bg-surface-elevated/20 relative overflow-hidden">
                    <div className="w-24 h-24 rounded-[3rem] bg-surface-elevated flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-platinum-glow transition-all duration-500 border border-border-subtle/50 relative z-10">
                      <Monitor size={42} />
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Sessões Ativas</h4>
                      <p className="text-[10px] text-text-muted mt-4 font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">Auditoria global de endpoints e dispositivos</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 blur-[60px] rounded-full group-hover:bg-primary/10 transition-colors" />
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
