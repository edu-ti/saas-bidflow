import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, Edit, Trash2, Eye, Plus, Search } from 'lucide-react';
import api from '../lib/axios';

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
  source_url?: string;
}

const mockBidding: Bidding = {
  id: 1,
  title: 'Pregão Eletrônico para Fornecimento de Material de Escritório',
  process_number: '260120PE00001',
  agency: 'PREFEITURA MUNICIPAL DE JOCA CLAUDINO',
  modality: 'pregão',
  opening_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  closing_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  value: '150000.00',
  status: 'Em análise',
  description: 'Constitui objeto da presente licitação: Aquisição de equipamentos e material permanente para a Unidade Básica de Saúde – UBS',
  bidding_metadata: {
    edital: '00001/2026',
    uasg: '',
  },
  funnel_stage_id: 1,
  created_at: new Date().toISOString(),
  source_url: 'www.portaldecompraspublicas.com.br',
};

export default function AuctionDetails() {
  const [searchParams, setSearchParams] = useSearchParams();
  const opportunityId = searchParams.get('id');
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<'list' | 'details'>(opportunityId ? 'details' : 'list');
  const [biddingsList, setBiddingsList] = useState<Bidding[]>([]);
  
  const [bidding, setBidding] = useState<Bidding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status state
  const [currentStatus, setCurrentStatus] = useState('Em análise');

  useEffect(() => {
    if (opportunityId) {
      setViewMode('details');
      fetchBidding(opportunityId);
    } else {
      setViewMode('list');
      fetchBiddingsList();
    }
  }, [opportunityId]);

  const fetchBiddingsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/opportunities?type=bidding');
      const data = res.data.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setBiddingsList(data);
      } else {
        setBiddingsList([mockBidding, { ...mockBidding, id: 2, process_number: '002/2026', status: 'Aguardando' }]);
      }
    } catch (err: any) {
      console.log('API indisponível, usando dados de exemplo');
      setBiddingsList([mockBidding, { ...mockBidding, id: 2, process_number: '002/2026', status: 'Aguardando' }]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidding = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/api/opportunities/${id}`);
      const data = res.data.data || res.data;
      setBidding(data);
      setCurrentStatus(data.status || 'Em análise');
    } catch (err: any) {
      console.log('API indisponível, usando dados de exemplo');
      setBidding({ ...mockBidding, id: parseInt(id), process_number: `${id}/2026` });
      setCurrentStatus(mockBidding.status);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatTime = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getModalityLabel = (modality: string) => {
    const labels: Record<string, string> = {
      'pregão': 'Pregão Eletrônico',
      'tomada_de_precos': 'Tomada de Preços',
      'concurso': 'Concurso',
      'convite': 'Convite',
      'inexigibilidade': 'Inexigibilidade',
      'dispensabilidade': 'Dispensa',
    };
    return labels[modality.toLowerCase()] || modality;
  };
  
  const handleViewDetails = (id: number) => {
    setSearchParams({ id: id.toString() });
  };

  const handleBackToList = () => {
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
        <div className="flex justify-between items-center pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pregões Cadastrados</h1>
            <p className="text-sm text-slate-500 mt-1">Gerencie e acesse os detalhes de todos os pregões capturados.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#2E75B6] hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Novo Pregão
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Buscar pregão..." 
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 uppercase text-xs font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Edital / Processo</th>
                  <th className="px-6 py-4">Órgão</th>
                  <th className="px-6 py-4">Modalidade</th>
                  <th className="px-6 py-4">Data da Disputa</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {biddingsList.map((bid) => (
                  <tr key={bid.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{bid.bidding_metadata?.edital || '-'}</div>
                      <div className="text-xs text-slate-500">{bid.process_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={bid.agency}>{bid.agency || '-'}</td>
                    <td className="px-6 py-4">{getModalityLabel(bid.modality)}</td>
                    <td className="px-6 py-4">{formatDate(bid.opening_date)} {formatTime(bid.opening_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                        bid.status === 'Ativa' ? 'bg-green-100 text-green-700' :
                        bid.status === 'Em análise' ? 'bg-blue-100 text-blue-700' :
                        bid.status === 'Aguardando' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {bid.status || 'Em análise'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(bid.id)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Ver Detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {biddingsList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      Nenhum pregão cadastrado encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bidding) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">{error || 'Nenhuma licitação selecionada'}</p>
        <button 
          onClick={handleBackToList}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Voltar para a Lista
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBackToList}
            className="text-slate-500 hover:text-blue-600 text-sm font-medium transition-colors"
          >
            &larr; Voltar para a Lista
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Detalhes do Pregão</h1>
        </div>
        <button className="px-5 py-2 bg-[#2E75B6] hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors shadow-sm">
          Imprimir
        </button>
      </div>

      {/* Informações do Pregão */}
      <div className="bg-slate-50 p-6 rounded border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Informações do Pregão</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-6 text-sm mb-6">
          <div>
            <span className="text-slate-500 font-semibold block mb-1">Edital:</span>
            <span className="text-slate-900">{bidding.bidding_metadata?.edital || '00001/2026'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block mb-1">Processo:</span>
            <span className="text-slate-900">{bidding.process_number || '-'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block mb-1">Modalidade:</span>
            <span className="text-slate-900">{getModalityLabel(bidding.modality)}</span>
          </div>

          <div className="md:col-span-2">
            <span className="text-slate-500 font-semibold block mb-1">Órgão Comprador:</span>
            <span className="text-slate-900 uppercase">{bidding.agency || '-'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block mb-1">UASG:</span>
            <span className="text-slate-900">{bidding.bidding_metadata?.uasg || '-'}</span>
          </div>

          <div className="md:col-span-3">
            <span className="text-slate-500 font-semibold block mb-1">Local da Disputa:</span>
            <span className="text-slate-900">{bidding.source_url || '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold block mb-1">Data da Disputa:</span>
            <span className="text-slate-900">{formatDate(bidding.opening_date)}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block mb-1">Hora da Disputa:</span>
            <span className="text-slate-900">{formatTime(bidding.opening_date)}</span>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <span className="text-slate-500 font-semibold block mb-1">Status:</span>
              <select 
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-sm"
              >
                <option value="Em análise">Em análise</option>
                <option value="Aguardando">Aguardando</option>
                <option value="Ativa">Ativa</option>
                <option value="Encerrada">Encerrada</option>
              </select>
            </div>
            <button className="px-4 py-1.5 bg-[#002D74] hover:bg-blue-900 text-white rounded text-sm transition-colors">
              Alterar
            </button>
          </div>
        </div>

        <div className="text-sm border-t border-slate-200 pt-6 mt-2">
          <span className="text-slate-500 font-semibold block mb-2">Objeto:</span>
          <p className="text-slate-900 leading-relaxed">{bidding.description || 'Sem descrição'}</p>
        </div>
      </div>

      {/* Documentos de Contratação */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Documentos de Contratação</h2>
        
        <div className="text-center py-6 text-sm text-slate-500">
          Nenhum documento de contrato, O.S. ou empenho foi anexado a este pregão.
        </div>

        <div className="border border-slate-200 rounded p-6 bg-white">
          <h3 className="font-semibold text-slate-800 mb-4 text-sm">Adicionar Novo Arquivo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nome ou Descrição do Ficheiro</label>
              <input type="text" placeholder="Ex: Edital, Proposta, etc." className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <p className="text-[10px] text-slate-400 mt-1.5">Se deixar em branco, será usado o nome original.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de Documento</label>
              <select className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500">
                <option value="anexo_geral">Anexo Geral</option>
                <option value="contrato">Contrato</option>
                <option value="empenho">Empenho</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Selecione o Ficheiro</label>
            <div className="flex border border-slate-300 rounded overflow-hidden">
              <label className="bg-blue-50 text-blue-600 px-4 py-2 text-sm cursor-pointer border-r border-slate-300 hover:bg-blue-100 font-medium">
                Escolher arquivo
                <input type="file" className="hidden" />
              </label>
              <div className="px-4 py-2 text-sm text-slate-400 flex-1 bg-white">
                Nenhum arquivo escolhido
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="px-5 py-2 bg-[#002D74] hover:bg-blue-900 text-white rounded text-sm transition-colors font-medium">
              Enviar Ficheiro
            </button>
          </div>
        </div>
      </div>

      {/* Itens e Propostas */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Itens e Propostas</h2>
        
        {/* Mocked Tables */}
        {[
          { name: 'AMB DISTRIBUIDORA DE MEDICAMENTO E MATERIAIS HOSPITALARES LTDA', valUnit: '5.500,00', valTotal: '11.000,00', fab: 'EMERGO', mod: 'Ambulanc G' },
          { name: 'M V R DE SOUZA COMERCIO ATACADISTA LTDA', valUnit: '7.700,00', valTotal: '15.400,00', fab: 'CMOS DRAKE', mod: 'ALIVE' },
          { name: 'MEDICALMED REPRESENTACOES, IMPORTACAO E EXPORTACAO DE PRODUTOS HOSPITALARES LTDA', valUnit: '6.940,67', valTotal: '13.881,34', fab: 'COMEN', mod: 'DEA' }
        ].map((supplier, idx) => (
          <div key={idx} className="border border-slate-200 rounded overflow-hidden mb-6">
            <div className="bg-slate-50 px-5 py-3.5 font-bold text-sm text-slate-800 border-b border-slate-200">
              {supplier.name}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left text-slate-600">
                <thead className="bg-slate-50/50 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Nº</th>
                    <th className="px-5 py-3 font-semibold">DESCRIÇÃO</th>
                    <th className="px-5 py-3 font-semibold">FABRICANTE</th>
                    <th className="px-5 py-3 font-semibold">MODELO</th>
                    <th className="px-5 py-3 font-semibold">QTD.</th>
                    <th className="px-5 py-3 font-semibold">VALOR UNIT.</th>
                    <th className="px-5 py-3 font-semibold">VALOR TOTAL</th>
                    <th className="px-5 py-3 font-semibold">STATUS</th>
                    <th className="px-5 py-3 font-semibold">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-5 py-4">21</td>
                    <td className="px-5 py-4 max-w-[280px] leading-relaxed">
                      DEA - Desfibrilador Externo Automatico, Especificacoes Minimas: AUTONOMIA DA BATERIA / AUXILIO RCP / ACESSORIO: 50 A 250 CHOQUES / POSSUI / 1 PAR ELETRODO
                    </td>
                    <td className="px-5 py-4">{supplier.fab}</td>
                    <td className="px-5 py-4">{supplier.mod}</td>
                    <td className="px-5 py-4">2</td>
                    <td className="px-5 py-4 whitespace-nowrap">R$ {supplier.valUnit}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold">R$ {supplier.valTotal}</td>
                    <td className="px-5 py-4">Classificada</td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-[#2E75B6] hover:bg-blue-600 text-white rounded font-medium transition-colors">Editar</button>
                        <button className="px-3 py-1.5 bg-[#EF4444] hover:bg-red-600 text-white rounded font-medium transition-colors">Excluir</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <div className="border border-slate-200 rounded p-6 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-5 text-sm">Adicionar Nova Proposta de Item</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fornecedor</label>
              <input type="text" placeholder="Digite o nome do fornecedor" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nº do Lote (Opcional)</label>
                <input type="text" placeholder="Ex: Lote 01" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nº do Item</label>
                <input type="text" placeholder="Ex: 1, 2, 3..." className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Descrição</label>
              <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fabricante/Marca</label>
                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Modelo</label>
                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Quantidade</label>
                <input type="number" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Valor Unitário (R$)</label>
                <input type="text" className="w-full border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button className="px-6 py-2 bg-[#002D74] hover:bg-blue-900 text-white rounded font-medium text-sm transition-colors">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Observações e Pareceres */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Observações e Pareceres</h2>
        
        <div className="border border-slate-200 rounded p-6 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-4 text-sm">Adicionar Nova Observação</h3>
          <textarea 
            rows={4} 
            placeholder="Digite seu parecer ou observação aqui..."
            className="w-full border border-slate-300 rounded p-3 text-sm bg-white resize-y focus:outline-none focus:border-blue-500"
          ></textarea>
          <div className="flex justify-end mt-4">
            <button className="px-6 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white rounded font-medium text-sm transition-colors">
              Salvar Observação
            </button>
          </div>
        </div>

        <div className="text-center py-8 text-sm text-slate-500">
          Nenhuma observação registrada.
        </div>
      </div>

    </div>
  );
}