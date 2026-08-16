import React, { useState } from "react";
import { EventCountdownCard } from "./ui/event-countdown-card";
import { ChevronLeft, Moon, Sun, ExternalLink, Sparkles } from "lucide-react";
import { playClickSound } from "../utils/audio";

interface RSVPEventProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export default function RSVPEvent({ onBack, isAdmin = false }: RSVPEventProps) {
  const [isDarkModeForm, setIsDarkModeForm] = useState(true);

  return (
    <div className="min-h-screen bg-stone-950 text-white relative pb-20">
      {/* Background Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-green-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        <button
          onClick={() => {
            playClickSound(500, "sine");
            onBack();
          }}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group w-fit cursor-pointer"
        >
          <div className="bg-zinc-900 group-hover:bg-zinc-800 p-2 rounded-full transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest font-bold">Voltar ao Portal</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Card */}
          <div className="lg:col-span-5 flex justify-center sticky top-8">
            <EventCountdownCard 
              className="w-full max-w-md transform transition-transform hover:scale-102"
              title="Lançamento Portal"
              subtitle="Dia 17 Agosto | 19h"
              image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRYer0HiBG4YMv-tueznhCQeXqIJ52gc8_vru2u9_MR_L64O_2dCG98yfD&s=10"
              onJoin={() => {
                const el = document.getElementById("rsvp-form-container");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              buttonText="Preencha o Formulário ao Lado ➔"
              isEditable={isAdmin}
            />
          </div>

          {/* Right: Form */}
          <div 
            id="rsvp-form-container"
            className="lg:col-span-7 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 p-4 sm:p-6 rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[650px] relative"
          >
            
            {/* Header / Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-200">
                  Formulário RSVP
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Dark mode toggle */}
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(600, "sine");
                    setIsDarkModeForm(!isDarkModeForm);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono font-bold uppercase transition border cursor-pointer ${
                    isDarkModeForm
                      ? "bg-pink-500/15 border-pink-500/40 text-pink-400 hover:bg-pink-500/25"
                      : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }`}
                  title="Alternar visualização do formulário"
                >
                  {isDarkModeForm ? (
                    <>
                      <Moon className="w-3.5 h-3.5 text-pink-400" />
                      <span>Modo Escuro (Ativo)</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modo Original</span>
                    </>
                  )}
                </button>

                {/* Open in new tab */}
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLScTZsfa9vTxgjhzHVwzI8DooZ_Eg1dq7rcnjGNCQQy3kYTZMw/viewform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition border border-zinc-800"
                  title="Abrir no Google Forms"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Google Forms Iframe Container */}
            <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-850 shadow-inner">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLScTZsfa9vTxgjhzHVwzI8DooZ_Eg1dq7rcnjGNCQQy3kYTZMw/viewform?embedded=true"
                width="100%"
                height="800"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                className="w-full min-h-[750px] transition-all duration-300 rounded-xl"
                style={{
                  filter: isDarkModeForm 
                    ? "invert(0.92) hue-rotate(180deg) contrast(1.05) brightness(0.95)" 
                    : "none"
                }}
                title="Formulário de Inscrição RSVP"
              >
                Carregando formulário…
              </iframe>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
