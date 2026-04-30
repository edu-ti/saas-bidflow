import React from 'react';
import { Building2, Users, DollarSign, Activity } from 'lucide-react';

export default function MasterDashboard() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Dashboard Master</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Visão geral do sistema e métricas globais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-600 dark:text-slate-400">Total de Empresas</h3>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">0</p>
          <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
            <Activity className="w-4 h-4" /> empresas ativas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-600 dark:text-slate-400">Total de Usuários</h3>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">0</p>
          <p className="text-sm text-slate-500 mt-2">em toda a plataforma</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-600 dark:text-slate-400">MRR (Estimado)</h3>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">R$ 0,00</p>
          <p className="text-sm text-slate-500 mt-2">Receita recorrente mensal</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-600 dark:text-slate-400">Novos Cadastros</h3>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">0</p>
          <p className="text-sm text-slate-500 mt-2">últimos 30 dias</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center min-h-[300px]">
        <p className="text-slate-500 dark:text-slate-400 text-center">
          Os gráficos globais de uso e retenção serão carregados aqui.
        </p>
      </div>
    </div>
  );
}
