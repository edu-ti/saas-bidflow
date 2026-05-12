import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  FileText,
  FileSearch,
  Brain,
  AlertTriangle,
  ShieldAlert,
  Gavel,
  Send,
  Sparkles,
  Loader2,
  FileUp,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Bot
} from 'lucide-react';

type SpecialistType = 'resumo' | 'riscos' | 'impugnacao' | 'recurso' | null;

const specialists = [
  { id: 'resumo' as SpecialistType, label: 'Resumo de Edital', icon: FileSearch, description: 'Extrai e sintetiza os pontos principais do edital', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  { id: 'riscos' as SpecialistType, label: 'Análise de Riscos', icon: AlertTriangle, description: 'Identifica cláusulas de risco e pontos de atenção', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'impugnacao' as SpecialistType, label: 'Elaborar Impugnação', icon: ShieldAlert, description: 'Contesta cláusulas restritivas ou irregulares', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  { id: 'recurso' as SpecialistType, label: 'Recurso Administrativo', icon: Gavel, description: 'Fundamenta recurso técnico-administrativo', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
];

export default function BidAnalyst() {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null);
  const [activeSpecialist, setActiveSpecialist] = useState<SpecialistType>(null);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile({ name: file.name, size: formatSize(file.size) });
    setAnalyzed(false);
    setMessages([]);
    setActiveSpecialist(null);
  };

  const handleAnalyze = async (type: SpecialistType) => {
    if (!uploadedFile) return;
    setActiveSpecialist(type);
    setLoading(true);
    // Mock AI analysis
    await new Promise(r => setTimeout(r, 2000));
    const label = specialists.find(s => s.id === type)?.label || '';
    setMessages([
      {
        role: 'assistant',
        content: `Análise de **${label}** concluída com base no edital "${uploadedFile.name}".\n\nA IA processou o documento e está pronta para responder suas perguntas sobre este tópico específico. Utilize o campo abaixo para consultar o especialista.`
      }
    ]);
    setAnalyzed(true);
    setLoading(false);
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !activeSpecialist || !uploadedFile) return;
    const userQuestion = question.trim();
    setMessages(prev => [...prev, { role: 'user', content: userQuestion }]);
    setQuestion('');
    setLoading(true);
    // Mock AI response
    await new Promise(r => setTimeout(r, 1500));
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: `Com base na análise do edital **"${uploadedFile.name}"**, identifico os seguintes pontos relevantes para sua pergunta sobre "${userQuestion.substring(0, 50)}...":\n\n- Ponto 1: Análise preliminar indica conformidade parcial\n- Ponto 2: Recomenda-se revisão da cláusula 5.2\n- Ponto 3: Prazo adequado conforme legislação vigente\n\nDeseja aprofundar algum destes pontos?`
    }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const activeSpecialistData = specialists.find(s => s.id === activeSpecialist);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <header className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-md bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Analista de Edital
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Faça upload do edital e utilize especialistas de IA para análise.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upload & Specialists */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Area */}
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <FileUp size={16} className="text-primary" />
              Upload do Edital
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FileText size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary truncate max-w-[180px]">{uploadedFile.name}</p>
                      <p className="text-xs text-text-muted">{uploadedFile.size}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setAnalyzed(false);
                      setMessages([]);
                      setActiveSpecialist(null);
                    }}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 size={12} /> Arquivo carregado com sucesso
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
              >
                <Upload size={32} className="text-text-muted" />
                <div className="text-center">
                  <p className="text-sm font-medium text-text-primary">Clique para fazer upload</p>
                  <p className="text-xs text-text-muted mt-1">PDF, DOC, DOCX ou TXT</p>
                </div>
              </button>
            )}
          </div>

          {/* Specialists */}
          {uploadedFile && (
            <div className="card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Brain size={16} className="text-primary" />
                Especialistas IA
              </h3>
              <div className="space-y-2">
                {specialists.map(spec => (
                  <button
                    key={spec.id}
                    onClick={() => handleAnalyze(spec.id)}
                    disabled={loading}
                    className={`w-full p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-sm ${activeSpecialist === spec.id
                      ? `${spec.color} border-current shadow-sm`
                      : 'bg-bg-secondary border-border hover:border-border-hover hover:bg-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${spec.color}`}>
                        <spec.icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{spec.label}</p>
                        <p className="text-xs text-text-muted">{spec.description}</p>
                      </div>
                      {loading && activeSpecialist === spec.id && (
                        <Loader2 size={16} className="animate-spin ml-auto text-text-muted" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Analysis Results & Chat */}
        <div className="lg:col-span-2">
          {!uploadedFile ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-20 h-20 rounded-2xl bg-bg-tertiary border border-border flex items-center justify-center">
                <FileSearch size={36} className="text-text-muted" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Nenhum edital carregado</h3>
                <p className="text-sm text-text-muted mt-1 max-w-sm">
                  Faça upload de um edital para começar a análise com os especialistas de IA.
                </p>
              </div>
            </div>
          ) : !activeSpecialist ? (
            <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Brain size={36} className="text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Selecione um especialista</h3>
                <p className="text-sm text-text-muted mt-1 max-w-sm">
                  Escolha um dos especialistas de IA ao lado para analisar o edital "{uploadedFile.name}".
                </p>
              </div>
            </div>
          ) : (
            <div className="card flex flex-col h-[600px]">
              {/* Specialist Header */}
              {activeSpecialistData && (
                <div className="px-6 py-4 border-b border-border bg-bg-secondary rounded-t-xl flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${activeSpecialistData.color}`}>
                    <activeSpecialistData.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{activeSpecialistData.label}</p>
                    <p className="text-xs text-text-muted">Analisando: {uploadedFile.name}</p>
                  </div>
                  <div className="ml-auto">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded-full border border-green-200">
                      Analisado
                    </span>
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loading && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 size={36} className="animate-spin text-primary" />
                    <p className="text-sm text-text-muted">Analisando edital com IA especialista...</p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-bg-secondary border border-border rounded-bl-md text-text-primary'
                      }`}>
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Bot size={14} className="text-primary" />
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Especialista IA</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap leading-relaxed">{msg.content.replace(/\*\*(.*?)\*\*/g, '[$1]')}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Chat Input */}
              {analyzed && (
                <div className="p-4 border-t border-border bg-bg-secondary rounded-b-xl">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={question}
                      onChange={e => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Pergunte ao especialista sobre o edital...`}
                      rows={2}
                      className="input flex-1 resize-none"
                      disabled={loading}
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={loading || !question.trim()}
                      className="btn btn-primary p-2.5 shrink-0"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1">
                    <Sparkles size={10} /> Pressione Enter para enviar sua pergunta ao especialista
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
