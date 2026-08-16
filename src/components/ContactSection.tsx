import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  Send, 
  ExternalLink, 
  Sparkles, 
  MessageSquare, 
  CheckCircle, 
  Moon, 
  Sun, 
  Clock, 
  MapPin, 
  RefreshCw,
  Edit3,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface ContactSectionProps {
  isDarkMode?: boolean;
  isAdmin?: boolean;
  portalPagesConfig?: any;
  onSaveConfig?: (newConfig: any) => void;
}

export default function ContactSection({
  isDarkMode = true,
  isAdmin = false,
  portalPagesConfig = {},
  onSaveConfig
}: ContactSectionProps) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [formThemeDark, setFormThemeDark] = useState(true);
  const [activeTab, setActiveTab] = useState<"google_form" | "direct_form">("google_form");
  
  // Direct Quick Form state
  const [directForm, setDirectForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directSuccess, setDirectSuccess] = useState(false);

  // Editable config fields
  const formUrl = portalPagesConfig?.contatoFormUrl || "https://docs.google.com/forms/d/e/1FAIpQLSc01oq6LnVnXk-EoeRv653eu1fvSBJZ5d__USuVrtYUnXrN2g/viewform?embedded=true";
  const contatoTitle = portalPagesConfig?.contatoTitle || "Fale Conosco & Envie sua Pauta";
  const contatoDescription = portalPagesConfig?.contatoDescription || "Envie sugestões de pauta, histórias inspiradoras, propostas de parcerias ou tire suas dúvidas diretamente com nossa redação.";
  const contatoEmail = portalPagesConfig?.contatoEmail || "podcastdocomecoaotopojf@gmail.com";
  const contatoWhatsapp = portalPagesConfig?.contatoWhatsapp || "+55 32 99194-7690";
  const cleanWhatsappNumber = contatoWhatsapp.replace(/\D/g, "");

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directForm.name || !directForm.email || !directForm.message) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmittingDirect(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: directForm.name,
          email: directForm.email,
          phone: directForm.phone,
          msg: directForm.message
        })
      });

      if (res.ok) {
        setDirectSuccess(true);
        toast.success("Mensagem enviada com sucesso!");
        setDirectForm({ name: "", email: "", phone: "", message: "" });
        setTimeout(() => setDirectSuccess(false), 5000);
      } else {
        toast.error("Erro ao enviar mensagem.");
      }
    } catch {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  return (
    <div id="contato-section-component" className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in text-white py-4 bg-black">
      
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Canal Direto com a Redação
        </div>
        <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
          {contatoTitle.includes("&") ? (
            <>
              {contatoTitle.split("&")[0]} & <span className="text-[#22c55e]">{contatoTitle.split("&")[1]}</span>
            </>
          ) : (
            <>
              Fale <span className="text-[#22c55e]">Conosco</span>
            </>
          )}
        </h2>
        <p className="text-xs md:text-sm text-zinc-300 font-mono max-w-2xl mx-auto leading-relaxed">
          {contatoDescription}
        </p>
      </div>

      {/* Admin Quick Editor */}
      {isAdmin && onSaveConfig && (
        <div className="p-5 rounded-2xl bg-black border border-emerald-500/40 space-y-4 text-left shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5" /> Painel de Edição da Seção Contato
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">Título</label>
              <input
                type="text"
                value={contatoTitle}
                onChange={(e) => onSaveConfig({ ...portalPagesConfig, contatoTitle: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">E-mail de Destino</label>
              <input
                type="email"
                value={contatoEmail}
                onChange={(e) => onSaveConfig({ ...portalPagesConfig, contatoEmail: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">WhatsApp de Contato</label>
              <input
                type="text"
                value={contatoWhatsapp}
                onChange={(e) => onSaveConfig({ ...portalPagesConfig, contatoWhatsapp: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-zinc-400 block mb-1">Link do Google Forms (iframe)</label>
              <input
                type="text"
                value={formUrl}
                onChange={(e) => onSaveConfig({ ...portalPagesConfig, contatoFormUrl: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[10px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3 Quick Contact Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: WhatsApp */}
        <a
          href={`https://wa.me/${cleanWhatsappNumber || "5532991947690"}?text=Ol%C3%A1%2C%20gostaria%20de%20falar%20com%20a%20equipe%20do%20Do%20Come%C3%A7o%20ao%20Topo.`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-black border border-emerald-500/30 hover:border-emerald-400 transition group flex flex-col justify-between space-y-3 shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-zinc-950 rounded-xl border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition">
              <Phone className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full uppercase">
              WhatsApp
            </span>
          </div>
          <div>
            <h4 className="text-sm font-display font-black uppercase text-white group-hover:text-emerald-400 transition">
              Atendimento Direto
            </h4>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{contatoWhatsapp}</p>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
            Iniciar Conversa <ExternalLink className="w-3 h-3" />
          </span>
        </a>

        {/* Card 2: Email */}
        <a
          href={`mailto:${contatoEmail}?subject=Contato%20via%20Portal%20Do%20Come%C3%A7o%20ao%20Topo`}
          className="p-5 rounded-2xl bg-black border border-pink-500/30 hover:border-pink-400 transition group flex flex-col justify-between space-y-3 shadow-lg hover:shadow-pink-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="p-3 bg-zinc-950 rounded-xl border border-pink-500/30 text-pink-400 group-hover:scale-110 transition">
              <Mail className="w-5 h-5 text-pink-400" />
            </div>
            <span className="text-[9px] font-mono font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full uppercase">
              E-mail
            </span>
          </div>
          <div>
            <h4 className="text-sm font-display font-black uppercase text-white group-hover:text-pink-400 transition">
              Redação & Pautas
            </h4>
            <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">{contatoEmail}</p>
          </div>
          <span className="text-[10px] text-pink-400 font-mono flex items-center gap-1 font-bold">
            Escrever E-mail <ExternalLink className="w-3 h-3" />
          </span>
        </a>

        {/* Card 3: Response Time */}
        <div className="p-5 rounded-2xl bg-black border border-zinc-800 flex flex-col justify-between space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-300">
              <Clock className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-[9px] font-mono font-bold bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-full uppercase">
              Agilidade
            </span>
          </div>
          <div>
            <h4 className="text-sm font-display font-black uppercase text-white">
              Tempo de Resposta
            </h4>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">Retorno em até 24h úteis</p>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-400" /> Suporte dedicado
          </span>
        </div>
      </div>

      {/* Main Form Container - Expanded & 100% Dark Black */}
      <div className="bg-black border border-zinc-800 rounded-3xl p-4 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)] relative overflow-hidden">
        
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-zinc-850">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("google_form")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
                activeTab === "google_form"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Formulário Oficial (Google)
            </button>
            <button
              onClick={() => setActiveTab("direct_form")}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
                activeTab === "direct_form"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Mensagem Rápida
            </button>
          </div>

          {activeTab === "google_form" && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFormThemeDark(!formThemeDark)}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition flex items-center gap-1.5"
                title="Alternar filtro escuro no formulário"
              >
                {formThemeDark ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px]">Versão Dark Ativa</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-[10px]">Versão Original</span>
                  </>
                )}
              </button>

              <a
                href={formUrl.replace("?embedded=true", "")}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 text-xs font-mono text-zinc-300 hover:text-white transition flex items-center gap-1.5"
                title="Abrir formulário em nova aba"
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px]">Nova Aba</span>
              </a>
            </div>
          )}
        </div>

        {/* Tab 1: Embedded Google Form */}
        {activeTab === "google_form" && (
          <div className="relative w-full flex flex-col items-center justify-center bg-black">
            
            {/* Loading Indicator */}
            {isIframeLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center min-h-[400px] bg-black/95 backdrop-blur-sm rounded-2xl">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest font-bold">
                  Carregando Formulário Oficial...
                </p>
              </div>
            )}

            {/* Dark frame wrapper */}
            <div 
              className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 border border-zinc-800 bg-black"
              style={{ backgroundColor: "#000000" }}
            >
              <iframe
                src={formUrl}
                width="100%"
                height="1050"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                onLoad={() => setIsIframeLoading(false)}
                title="Formulário de Contato Do Começo ao Topo"
                className={`w-full min-h-[1020px] transition-all duration-500 ${
                  formThemeDark
                    ? "filter invert-[92%] hue-rotate-180 contrast-[105%] brightness-[88%]"
                    : "filter-none"
                }`}
                style={{
                  display: "block",
                  border: "none",
                  backgroundColor: "#000000",
                  colorScheme: "dark"
                }}
              >
                Carregando…
              </iframe>
            </div>

            {/* Hint below iframe */}
            <p className="text-[10px] font-mono text-zinc-500 text-center mt-4">
              ✨ Seus dados são enviados diretamente e com segurança para a central de pautas do Do Começo ao Topo.
            </p>
          </div>
        )}

        {/* Tab 2: Direct Quick Form */}
        {activeTab === "direct_form" && (
          <div className="max-w-2xl mx-auto py-4 bg-black">
            {directSuccess ? (
              <div className="p-8 rounded-2xl bg-black border border-emerald-500/40 text-center space-y-3 animate-fade-in">
                <div className="inline-flex p-3 bg-emerald-500/20 rounded-full text-emerald-400">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-display font-black uppercase text-white">
                  Mensagem Enviada com Sucesso!
                </h3>
                <p className="text-xs font-mono text-zinc-300 max-w-md mx-auto">
                  Agradecemos seu contato. Nossa equipe analisará sua solicitação e retornará pelo WhatsApp ou e-mail fornecido.
                </p>
              </div>
            ) : (
              <form onSubmit={handleDirectSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Juliana Mendes"
                      value={directForm.name}
                      onChange={(e) => setDirectForm({ ...directForm, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                      Seu Melhor E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="ex: juliana@empresa.com"
                      value={directForm.email}
                      onChange={(e) => setDirectForm({ ...directForm, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                    WhatsApp (com DDD)
                  </label>
                  <input
                    type="tel"
                    placeholder="ex: (19) 99999-9999"
                    value={directForm.phone}
                    onChange={(e) => setDirectForm({ ...directForm, phone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                    Sua Mensagem / Sugestão de Pauta *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Conte-nos sobre sua história, pauta para o podcast, evento regional ou dúvida..."
                    value={directForm.message}
                    onChange={(e) => setDirectForm({ ...directForm, message: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingDirect}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition shadow-[0_4px_25px_rgba(16,185,129,0.35)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingDirect ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmittingDirect ? "Enviando..." : "Enviar Mensagem para a Redação"}</span>
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
