import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, MapPin, X, Edit, Check } from "lucide-react";

interface RodadaCountdownBannerProps {
  isDirectEditingEnabled?: boolean;
  portalPagesConfig?: any;
  onSavePortalPagesConfig?: (updated: any) => void;
}

export default function RodadaCountdownBanner({
  isDirectEditingEnabled = false,
  portalPagesConfig = {},
  onSavePortalPagesConfig,
}: RodadaCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Editable banner state fields (sync with portalPagesConfig)
  const bannerTitle = portalPagesConfig?.rodadaTitle || "RODADA DE NEGÓCIOS";
  const targetDateStr = portalPagesConfig?.rodadaTargetDate || "2026-06-17T18:30:00-03:00";
  const bannerLocation = portalPagesConfig?.rodadaLocation || "17 de Junho • 18:30 • Delícias da Andréa";

  // Form states for the modal
  const [tempTitle, setTempTitle] = useState(bannerTitle);
  const [tempTargetDate, setTempTargetDate] = useState(targetDateStr);
  const [tempLocation, setTempLocation] = useState(bannerLocation);

  // Sound function fallback (or simple beep)
  const playSound = (freq = 600, type: OscillatorType = "sine") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // AudioContext blocked or unsupported
    }
  };

  useEffect(() => {
    const targetDate = new Date(targetDateStr).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (isNaN(difference) || difference <= 0) {
        setTimeLeft("O EVENTO JÁ COMEÇOU!");
        return false; // stop
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Format to always have 2 digits for times
        const h = hours.toString().padStart(2, '0');
        const m = minutes.toString().padStart(2, '0');
        const s = seconds.toString().padStart(2, '0');

        setTimeLeft(`${days > 0 ? `${days}d ` : ''}${h}h ${m}m ${s}s`);
        return true; // continue
      }
    };

    // Run immediately
    const keepTicking = updateCountdown();

    let interval: NodeJS.Timeout | null = null;
    if (keepTicking) {
      interval = setInterval(() => {
        const keep = updateCountdown();
        if (!keep && interval) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [targetDateStr]);

  const handleOpenEditModal = () => {
    playSound(600, "sine");
    setTempTitle(bannerTitle);
    // Parse targetDateStr (which is e.g. "2026-06-17T18:30:00-03:00") into "2026-06-17T18:30"
    setTempTargetDate(targetDateStr.substring(0, 16));
    setTempLocation(bannerLocation);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playSound(800, "sine");
    
    // Convert e.g. "2026-06-17T18:30" back into "2026-06-17T18:30:00-03:00"
    const finalIsoDate = tempTargetDate.includes("-03:00") 
      ? tempTargetDate 
      : `${tempTargetDate}:00-03:00`;

    if (onSavePortalPagesConfig) {
      onSavePortalPagesConfig({
        ...portalPagesConfig,
        rodadaTitle: tempTitle,
        rodadaTargetDate: finalIsoDate,
        rodadaLocation: tempLocation,
      });
    }
    setIsEditModalOpen(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ height: 0, opacity: 0, y: -20 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-700 via-green-600 to-green-800 text-white relative z-[35] shadow-[0_4px_20px_rgba(34,197,94,0.25)] border-b border-green-500 overflow-hidden"
          >
            {/* Subtle animated background beam */}
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] w-[50%] h-full skew-x-12"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left relative">
              <button 
                onClick={() => setIsVisible(false)}
                className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/20 rounded-full transition-colors z-10"
                title="Fechar Aviso"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              <div className="flex items-center gap-2 font-display font-black uppercase tracking-wider text-xs sm:text-sm text-yellow-300 drop-shadow-md">
                <Calendar className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>{bannerTitle}</span>
              </div>
              
              <div className="hidden sm:block w-px h-5 bg-white/30" />
              
              <div className="flex items-center gap-2 font-mono font-bold text-xs sm:text-sm bg-black/40 px-3.5 py-1 rounded-full shadow-inner border border-white/10">
                <Clock className="w-3.5 h-3.5 text-green-300" />
                <span className="tracking-widest w-[110px] sm:w-auto text-left tabular-nums">{timeLeft || "Calculando..."}</span>
              </div>

              <div className="hidden sm:block w-px h-5 bg-white/30" />

              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold font-mono text-zinc-100 uppercase tracking-widest">
                <MapPin className="w-3 h-3 text-pink-300" />
                <span>{bannerLocation}</span>
              </div>

              {isDirectEditingEnabled && (
                <div className="flex items-center gap-2 ml-2 relative z-20">
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400 hover:bg-yellow-350 text-black text-[9px] font-bold font-mono uppercase rounded transition-colors shadow-sm"
                    title="Editar Informações da Rodada de Negócios"
                  >
                    <Edit className="w-2.5 h-2.5 text-black" />
                    <span>Editar Rodada</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL DIALOG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left font-mono text-xs">
            <button
              onClick={() => { playSound(600, "sine"); setIsEditModalOpen(false); }}
              className="absolute top-4 right-4 p-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
              <Calendar className="w-5 h-5 text-green-500 animate-pulse" />
              <span>Editar Banner Rodada de Negócios</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Título do Banner</label>
                <input
                  type="text"
                  required
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="Ex: RODADA DE NEGÓCIOS"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-green-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">
                  Data e Hora do Cronômetro
                </label>
                <input
                  type="datetime-local"
                  required
                  value={tempTargetDate}
                  onChange={(e) => setTempTargetDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-green-500 rounded-xl p-2.5 text-white focus:outline-none text-[12px]"
                />
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Selecione a data e horário oficial em que o cronômetro deve zerar.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Texto de Local e Data (Exibido na Direita)</label>
                <input
                  type="text"
                  required
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="Ex: 17 de Junho • 18:30 • Delícias da Andréa"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-green-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => { playSound(600, "sine"); setIsEditModalOpen(false); }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-black font-black uppercase rounded-xl hover:opacity-90 transition flex items-center gap-1 shadow-lg shadow-green-500/10"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
