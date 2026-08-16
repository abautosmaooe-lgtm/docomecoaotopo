import { toast } from "sonner";
import React, { useState } from "react";
import { MessageCircle, Check, Share2, Sparkles, Instagram, PhoneCall, ExternalLink } from "lucide-react";
import { CategoryType } from "../types";

interface NewsletterSectionProps {
  onAddSubscriber: (email: string, categories: CategoryType[]) => void;
  isDarkMode: boolean;
}

const CATEGORIES_TO_CHOOSE: CategoryType[] = [
  "NOTÍCIAS",
  "EVENTOS",
  "PODCAST",
  "COMUNIDADE",
  "EMBAIXADORES",
  "TOUR",
  "CURSOS",
];

const WHATSAPP_LINK = "https://wa.me/5532991947690?text=Ol%C3%A1!%20Quero%20receber%20as%20novidades%20da%20regi%C3%A3o%20no%20meu%20WhatsApp";

export default function NewsletterSection({
  onAddSubscriber,
  isDarkMode,
}: NewsletterSectionProps) {
  const [phone, setPhone] = useState("");
  const [frequency, setFrequency] = useState<"diaria" | "semanal">("diaria");
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(["NOTÍCIAS"]);
  const [submitted, setSubmitted] = useState(false);

  const toggleCategory = (cat: CategoryType) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 8) {
      toast.warning("Por favor, informe seu número de WhatsApp com DDD.");
      return;
    }

    onAddSubscriber(`${phone}@whatsapp`, selectedCategories);
    setSubmitted(true);
    
    // Open WhatsApp directly
    window.open(WHATSAPP_LINK, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      setSubmitted(false);
      setPhone("");
    }, 5000);
  };

  return (
    <div
      id="newsletter-container"
      className={`p-6 md:p-8 rounded-3xl border-2 ${
        isDarkMode
          ? "bg-stone-950 border-emerald-500/30 text-white"
          : "bg-stone-50 border-zinc-200 text-stone-900"
      } relative overflow-hidden`}
    >
      {/* Decorative neon gradient glow background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left column: subscription via WhatsApp */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[9px] uppercase tracking-widest border border-emerald-500/30 flex items-center gap-1">
              <MessageCircle className="w-3 h-3 text-emerald-400" />
              WhatsApp VIP
            </span>
            <span className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
              <Sparkles className="w-3 h-3 text-green-400 animate-pulse" />
              Do Começo ao Topo News
            </span>
          </div>

          <h3 className="font-display font-black text-xl sm:text-2xl tracking-tight uppercase leading-none">
            Receba as novidades da região no seu WhatsApp
          </h3>
          <p className="text-zinc-400 text-xs max-w-md">
            Seja avisado instantaneamente sobre novos boletins, eventos regionais de neon, vagas de empregos no polo de tecnologia e relatórios exclusivos dos Embaixadores direto no seu celular.
          </p>

          {!submitted ? (
            <form onSubmit={handleSubscribe} className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <PhoneCall className="w-4 h-4 text-emerald-500" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Seu WhatsApp ex: (32) 99194-7690"
                    className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-zinc-900/80 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-mono"
                    id="newsletter-phone-input"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-display font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl active:scale-95 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 shrink-0"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>Inscrever no WhatsApp</span>
                </button>
              </div>

              {/* Direct Link Button to wa.me +553299194-7690 */}
              <div className="pt-1">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-4"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ou clique aqui para entrar direto no WhatsApp: +55 (32) 99194-7690
                </a>
              </div>

              {/* Preferences selectors */}
              <div className="space-y-3 pt-2">
                <div>
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold mb-2">
                    Frequência de Envio:
                  </span>
                  <div className="flex gap-2">
                    {(["diaria", "semanal"] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        onClick={() => setFrequency(freq)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider border transition ${
                          frequency === freq
                            ? "bg-emerald-500/15 border-emerald-400 text-emerald-400"
                            : "bg-transparent border-zinc-800 text-zinc-500"
                        }`}
                      >
                        {freq === "diaria" ? "Diária (Manhã)" : "Resumo Semanal"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-[9px] text-zinc-500 uppercase tracking-widest font-mono font-bold mb-2">
                    Categorias de Preferência:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES_TO_CHOOSE.map((cat) => {
                      const active = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-mono transition ${
                            active
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-bold"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/35 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-display font-extrabold text-sm text-emerald-400 uppercase">
                Redirecionando para o WhatsApp...
              </h4>
              <p className="text-[11px] text-zinc-400">
                Abertura do canal oficial +55 32 99194-7690 iniciada.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Social features */}
        <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">
              Nossa Comunidade Social
            </h4>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
            Compartilhe as notícias locais da Zona da Mata com apenas um clique! Todas as postagens compartilhadas ajudam a alimentar o gráfico de analytics em tempo real.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => toast.success("Acessando WhatsApp (+55 32 99194-7690)! +15 pontos de engajamento acumulados.")}
              className="flex items-center justify-center gap-2 p-3 font-mono text-[10px] rounded-xl bg-zinc-950 border border-emerald-500/40 text-emerald-400 hover:border-emerald-500 transition hover:bg-emerald-500/10"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WHATSAPP (+55 32 99194-7690)</span>
            </a>

            <button
              onClick={() => toast.success("Compartilhado no Instagram! +15 pontos de engajamento acumulados.")}
              className="flex items-center justify-center gap-2 p-3 font-mono text-[10px] rounded-xl bg-zinc-950 border border-zinc-800 text-fuchsia-400 hover:border-fuchsia-500 transition hover:bg-fuchsia-500/5"
            >
              <Instagram className="w-4 h-4" />
              <span>INSTAGRAM</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(WHATSAPP_LINK);
                toast.success("Link do WhatsApp copiado para a área de transferência!");
              }}
              className="flex items-center justify-center gap-2 p-3 font-mono text-[10px] rounded-xl bg-zinc-950 border border-zinc-800 text-pink-400 hover:border-pink-500 transition hover:bg-pink-500/5 animate-pulse col-span-2"
            >
              <Share2 className="w-4 h-4" />
              <span>COPIAR LINK DO WHATSAPP</span>
            </button>
          </div>

          <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-center">
            <span className="text-[10px] text-zinc-500 font-mono">
              Pontuação de Partilha Regional: <strong className="text-white">+4,89k pontos</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
