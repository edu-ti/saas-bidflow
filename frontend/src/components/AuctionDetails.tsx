import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, X, Save, Loader2, FileText, Calendar, MapPin, Building, DollarSign, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import Modal from './ui/Modal';

interface Bidding {
  id: number;
  title: string;
  process_number: string;
  agency: string;
  modality: string;
  opening_date: string;
  closing_date: string;
  value: string;
  status: string;
  description: string;
  bidding_metadata: any;
  funnel_stage_id: number;
  created_at: string;
}

export default function AuctionDetails() {
  const [searchParams] = useSearchParams();
  const opportunityId = searchParams.get('id');
  
  const [bidding, setBidding] = useState<Bidding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opportunityId) {
      fetchBidding(opportunityId);
    } else {
      fetchLatestBidding();
    }
  }, [opportunityId]);

  const fetchBidding = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/opportunities/${id}`);
      setBidding(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar details');
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestBidding = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/opportunities?type=bidding&limit=1');
      const data = res.data.data || res.data;
      if (data && data.length > 0) {
        setBidding(data[0]);
      } else {
        setError('Nenhuma licitação encontrada');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value || '0'));
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', { 
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  const getModalityLabel = (modality: string) => {
    const labels: Record<string, string> = {
      'pregão': 'Pregão',
      'tomada_de_precos': 'Tomada de Preços',
      'concurso': 'Concurso',
      'convite': 'Convite',
      'inexigibilidade': 'Inexigibilidade',
      'dispensabilidade': 'Dispensa',
    };
    return labels[modality] || modality;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'ativa': 'bg-green-100 text-green-800',
      'suspensa': 'bg-yellow-100 text-yellow-800',
      'encerrada': 'bg-gray-100 text-gray-800',
      'revogada': 'bg-red-100 text-red-800',
      'fracassada': 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !bidding) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Detalhes do Pregão</h2>
          <p className="text-slate-500 mb-4">{error || 'Nenhuma licitação selecionada'}</p>
          <button onClick={fetchLatestBidding} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Ver última licitação
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{bidding.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(bidding.status)}`}>
              {bidding.status === 'ativa' ? 'Ativa' : bidding.status}
            </span>
          </div>
          <p className="text-slate-500">Processo {bidding.process_number}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
            <Download className="w-4 h-4" />
            Download Edital
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Dados do Processo
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Modalidade</span>
                <p className="font-medium text-slate-900">{getModalityLabel(bidding.modality)}</p>
              </div>
              <div>
                <span className="text-slate-500">Número do Processo</span>
                <p className="font-medium text-slate-900">{bidding.process_number || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Órgão</span>
                <p className="font-medium text-slate-900">{bidding.agency || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Valor Estimado</span>
                <p className="font-medium text-slate-900">{formatCurrency(bidding.value)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Prazos
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Data de Abertura</span>
                <p className="font-medium text-slate-900">{formatDate(bidding.opening_date)}</p>
              </div>
              <div>
                <span className="text-slate-500">Data de Encerramento</span>
                <p className="font-medium text-slate-900">{formatDate(bidding.closing_date)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Descrição
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">
              {bidding.description || 'Sem descrição disponível'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Informações Adicionais
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-slate-500">ID do Processo</span>
                <p className="font-medium text-slate-900">#{bidding.id}</p>
              </div>
              <div>
                <span className="text-slate-500">Criado em</span>
                <p className="font-medium text-slate-900">{formatDate(bidding.created_at)}</p>
              </div>
              <div>
                <span className="text-slate-500">Valor</span>
                <p className="font-bold text-lg text-green-600">{formatCurrency(bidding.value)}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm">
                <Download className="w-4 h-4" />
                Download Completo
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm">
                <FileText className="w-4 h-4" />
                Gerar Proposta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}