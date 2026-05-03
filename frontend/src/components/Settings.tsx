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
    <div className="p-8 w-full min-h-screen bg-background space-y-8 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Centro de <span className="text-gradient-gold">Comando</span>
          </h1>
          <p className="text-text-secondary max-w-prose-ui flex items-center gap-2">
            <Lock size={12} className="text-primary" />
            Configurações globais e governança do ecossistema BidFlow.
          </p>
        </div>
      </header>

      <div className="platinum-card flex flex-col md:flex-row min-h-[700px] overflow-hidden">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-80 bg-white/[0.01] border-r border-white/5 p-6 space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-4 mb-4">Personalização</p>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all ${
                  activeTab === item.id ? 'bg-primary text-background' : 'text-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={activeTab === item.id ? 'text-background' : 'text-primary/60 group-hover:text-primary'} />
                  <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                </div>
                <ChevronRight size={14} className={activeTab === item.id ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'} />
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="space-y-2 pt-4 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-4 mb-4">Master Control</p>
              {adminItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between group px-4 py-3.5 rounded-xl transition-all ${
                    activeTab === item.id ? 'bg-primary text-background' : 'text-text-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={18} className={activeTab === item.id ? 'text-background' : 'text-primary/60 group-hover:text-primary'} />
                    <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === item.id ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'} />
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* Content Area */}
        <main className="flex-1 p-8 lg:p-12 animate-in fade-in duration-500 overflow-y-auto">
          {activeTab === "profile" && (
            <div className="space-y-12">
              <div className="flex items-center gap-8 border-b border-white/5 pb-12">
                <div className="relative group">
                  <img
                    src={profile.avatar}
                    alt="Avatar Platinum"
                    className="w-32 h-32 rounded-3xl object-cover border-2 border-primary/20 shadow-platinum-glow"
                  />
                  <button
                    onClick={handlePhotoUpload}
                    className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-3xl"
                  >
                    <Plus size={24} className="text-primary" />
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">{profile.name || 'Identidade BidFlow'}</h2>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 rounded-full">{profile.role || 'Membro Core'}</span>
                    <span className="text-xs text-text-muted font-bold italic">{profile.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Nome Completo</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Cargo Estratégico</label>
                  <input type="text" value={profile.role} onChange={e => setProfile({ ...profile, role: e.target.value })} className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Departamento</label>
                  <input type="text" value={profile.department} onChange={e => setProfile({ ...profile, department: e.target.value })} className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Telefone Direct</label>
                  <input type="text" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl text-sm text-white focus:border-primary/40 outline-none transition-all font-mono" />
                </div>
              </div>

              <div className="flex justify-end pt-8">
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex items-center gap-3 px-10 py-4 bg-primary text-background font-black rounded-xl hover:bg-primary-hover transition-all shadow-platinum-glow uppercase text-xs tracking-[0.2em]"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : saveSuccess ? <Check size={18} /> : <Save size={18} />}
                  {saveSuccess ? "Sincronizado" : "Salvar Alterações"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-widest">Gateway RPA / WhatsApp</h2>
                  <p className="text-text-muted text-sm mt-1 italic">Conectividade autônoma para notificações e captura.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  <Zap size={14} className="animate-pulse" /> Live Instance
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row items-center gap-12">
                <div className="bg-white p-6 rounded-[2rem] shadow-platinum-glow border-4 border-primary/20">
                  <QrCode size={160} className="text-background" />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">ID Instância</span>
                      <span className="text-xs font-bold text-white uppercase">Vendas_Primary_Core</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Handshake Digital</span>
                      <span className="text-xs font-mono text-primary">+55 11 99999-9999</span>
                    </div>
                  </div>
                  <button className="text-red-400 text-[10px] font-black uppercase tracking-widest hover:text-red-300 transition-colors flex items-center gap-2">
                    <LogOut size={14} /> Encerrar Conexão RPA
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-12">
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Criptografia e Acesso</h2>
                <p className="text-text-muted text-sm mt-1 italic">Protocolos de segurança e auditoria de sessão.</p>
              </div>

              <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Duplo Fator de Autenticação</h4>
                      <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">Status: {twoFactorEnabled ? 'Fortificado' : 'Vulnerável'}</p>
                    </div>
                  </div>
                  <button onClick={handle2FAToggle} disabled={loading2FA} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${twoFactorEnabled ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}>
                    {loading2FA ? 'Processando...' : twoFactorEnabled ? 'Desabilitar' : 'Habilitar'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <button onClick={handlePasswordReset} className="platinum-card p-8 flex flex-col items-center gap-6 group hover:border-primary/30 transition-all text-center">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Lock size={32} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Renovar Credenciais</h4>
                      <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-widest">Reset de senha via email seguro</p>
                    </div>
                  </button>
                  <button onClick={() => setShowDevices(!showDevices)} className="platinum-card p-8 flex flex-col items-center gap-6 group hover:border-primary/30 transition-all text-center">
                    <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Monitor size={32} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Sessões Ativas</h4>
                      <p className="text-[10px] text-text-muted mt-2 font-bold uppercase tracking-widest">Auditoria de dispositivos conectados</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "company" && isAdmin && <CompanySettings />}
          {activeTab === "users" && isAdmin && <UsersManagement />}
          {activeTab === "tax" && isAdmin && <TaxSettings />}
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
