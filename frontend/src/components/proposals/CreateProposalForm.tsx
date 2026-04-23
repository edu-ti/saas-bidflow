import React, { useState } from 'react';
import { X, Search, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function CreateProposalForm({ onClose }: { onClose: () => void }) {
  const [clientType, setClientType] = useState<'pj' | 'pf'>('pj');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Criar Nova Proposta</h2>
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Fechar
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors shadow-sm">
            Criar Proposta
          </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data de Criação</label>
            <input type="date" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm text-slate-500 dark:text-slate-400 focus:outline-none" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Validade da Proposta</label>
            <input type="date" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white">
              <option value="rascunho">Rascunho</option>
              <option value="enviada">Enviada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Motivo</label>
            <input type="text" placeholder="Ex: Preço alto..." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
          </div>
        </div>

        {/* Client Selection */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Selecionar Cliente</h3>
          
          <div className="flex items-center space-x-6 mb-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="clientType" value="pj" checked={clientType === 'pj'} onChange={() => setClientType('pj')} className="text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa Jurídica</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="clientType" value="pf" checked={clientType === 'pf'} onChange={() => setClientType('pf')} className="text-blue-600 focus:ring-blue-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa Física</span>
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input type="text" placeholder="Pesquisar organização..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
              <Plus className="w-4 h-4 mr-2" />
              Novo
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Itens da Proposta</h3>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 relative">
            <button className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
              <X className="w-5 h-5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column (Inputs) */}
              <div className="col-span-1 md:col-span-10 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição*</label>
                    <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fabricante</label>
                    <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Modelo</label>
                    <input type="text" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo</label>
                    <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white">
                      <option value="venda">Venda</option>
                      <option value="locacao">Locação</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição Detalhada</label>
                  <textarea rows={3} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"></textarea>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Parâmetros Adicionais</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3">Nenhum parâmetro adicional.</p>
                  
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">Nome do Parâmetro</label>
                      <input type="text" placeholder="Ex: D.C." className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 mb-1">Valor do Parâmetro</label>
                      <input type="text" placeholder="Ex: R$ 4.264,00" className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
                    </div>
                    <button className="px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (Image) */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-center">
                <span className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 text-center w-full">Imagem</span>
                <div className="w-full aspect-square bg-slate-200 dark:bg-slate-700 rounded-md flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 mb-2">
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Imagem</span>
                </div>
                <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Escolher</button>
              </div>

            </div>

            {/* Price Line */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quantidade*</label>
                <input type="number" defaultValue="1" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor Unitário*</label>
                <input type="text" placeholder="0,00" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Unidade de Medida</label>
                <input type="text" defaultValue="Unidade" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Desconto (%)</label>
                <input type="number" defaultValue="0" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subtotal</label>
                <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-semibold text-slate-900 dark:text-white">
                  R$ 0,00
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="mt-4 flex items-center space-x-3">
             <button className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="mr-2">📚</span> Do Catálogo
            </button>
            <button className="flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" /> Manual
            </button>
          </div>
        </div>

        {/* Frete & Totais */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-col md:flex-row justify-between items-end bg-slate-50 dark:bg-slate-800/30 p-6 rounded-lg">
          <div className="flex items-center space-x-4 w-full md:w-auto mb-4 md:mb-0">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Frete*</label>
              <select className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white min-w-[150px]">
                <option value="cif">CIF (Pago pelo Remetente)</option>
                <option value="fob">FOB (Pago pelo Destinatário)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor do Frete</label>
              <input type="text" placeholder="R$ 0,00" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
          </div>

          <div className="text-right">
            <span className="text-xl font-bold text-slate-900 dark:text-white">Total: R$ 0,00</span>
          </div>
        </div>

        {/* Termos Comerciais */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Termos Comerciais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Faturamento</label>
              <input type="text" defaultValue="Realizado diretamente pela fábrica." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Treinamento</label>
              <input type="text" defaultValue="Capacitação técnica por especialistas do FR Produtos Médicos." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Condições de Pagamento</label>
              <input type="text" defaultValue="À vista" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Prazo de Entrega</label>
              <input type="text" defaultValue="Até 30 dias após a confirmação do pedido de compra." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Garantia (Equipamentos)</label>
              <input type="text" defaultValue="12 meses a partir da data de emissão da nota fiscal." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Garantia (Acessórios)</label>
              <input type="text" defaultValue="6 meses, conforme especificações do fabricante." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Instalação</label>
              <textarea rows={2} defaultValue="Realizada pela equipe técnica da FR Produtos Médicos, garantindo conformidade e segurança." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Assistência Técnica</label>
              <textarea rows={2} defaultValue="Disponível com suporte especializado para manutenção e pós garantia." className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"></textarea>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações</label>
            <textarea rows={3} defaultValue="Nenhuma" className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"></textarea>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Fechar
        </button>
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          Cancelar
        </button>
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors shadow-sm">
          Criar Proposta
        </button>
      </div>

    </div>
  );
}
