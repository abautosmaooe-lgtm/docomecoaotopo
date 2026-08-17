import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, MapPin, X, Edit, Check, Rocket, Sparkles, PlayCircle, RotateCcw, FastForward, PartyPopper } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface RodadaCountdownBannerProps {
  isDirectEditingEnabled?: boolean;
  portalPagesConfig?: any;
  onSavePortalPagesConfig?: (updated: any) => void;
  onTriggerRocketPresentation?: () => void;
  onOpenWelcome?: () => void;
}

export default function RodadaCountdownBanner({
  isDirectEditingEnabled = false,
  portalPagesConfig = {},
  onSavePortalPagesConfig,
  onTriggerRocketPresentation,
  onOpenWelcome,
}: RodadaCountdownBannerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isTopoPhase, setIsTopoPhase] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSimModalOpen, setIsSimModalOpen] = useState(false);

  // Simulation mode state: null (real-time) | "phase1" | "phase2_topo" | "phase3_launch"
  const [simMode, setSimMode] = useState<string | null>(null);
  const [simSeconds, setSimSeconds] = useState<number>(10);

  // Base dates
  const defaultInitialTarget = portalPagesConfig?.rodadaTargetDate || "2026-08-17T19:30:00-03:00";
  const defaultPresentationTarget = portalPagesConfig?.presentationTargetDate || "2026-08-17T20:00:00-03:00";

  const bannerTitle = portalPagesConfig?.rodadaTitle || "RODADA DE NEGÓCIOS & APRESENTAÇÃO";
  const bannerLocation = portalPagesConfig?.rodadaLocation || "17 de Agosto • Auditório Office 360";

  // Form states for the edit modal
  const [tempTitle, setTempTitle] = useState(bannerTitle);
  const [tempTargetDate, setTempTargetDate] = useState(defaultInitialTarget);
  const [tempPresentationTarget, setTempPresentationTarget] = useState(defaultPresentationTarget);
  const [tempLocation, setTempLocation] = useState(bannerLocation);

  // Real-time calculation or Simulation handler
  useEffect(() => {
    // If running in live simulation mode with active countdown
    if (simMode === "phase1") {
      setIsTopoPhase(false);
      setIsFinished(false);
      const h = "00";
      const m = Math.floor(simSeconds / 60).toString().padStart(2, "0");
      const s = (simSeconds % 60).toString().padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);

      if (simSeconds <= 0) {
        // Transition to phase 2 (TOPO)
        setSimMode("phase2_topo");
        setSimSeconds(5); // 5 seconds for TOPO presentation countdown
        playSuccessSound();
      }
      return;
    }

    if (simMode === "phase2_topo") {
      setIsTopoPhase(true);
      setIsFinished(false);
      const h = "00";
      const m = "00";
      const s = simSeconds.toString().padStart(2, "0");
      setTimeLeft(`${h}:${m}:${s}`);

      if (simSeconds <= 0) {
        // Transition to phase 3 (Rocket launch & Tour)
        setIsFinished(true);
        setSimMode("phase3_launch");
        onTriggerRocketPresentation?.();
      }
      return;
    }

    if (simMode === "phase3_launch") {
      setIsTopoPhase(true);
      setIsFinished(true);
      setTimeLeft("00:00:00");
      return;
    }

    // Default Real-Time Clock
    const initialTargetTime = new Date(defaultInitialTarget).getTime();
    const presentationTargetTime = new Date(defaultPresentationTarget).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();

      // Phase 1: Counting down to 19:30
      if (now < initialTargetTime) {
        setIsTopoPhase(false);
        setIsFinished(false);
        const difference = initialTargetTime - now;
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const h = hours.toString().padStart(2, "0");
        const m = minutes.toString().padStart(2, "0");
        const s = seconds.toString().padStart(2, "0");

        setTimeLeft(`${days > 0 ? `${days}d ` : ""}${h}:${m}:${s}`);
        return true;
      }

      // Phase 2: Reached 19:30 -> Show TOPO & New Countdown to Presentation Start
      if (now >= initialTargetTime && now < presentationTargetTime) {
        setIsTopoPhase(true);
        setIsFinished(false);
        const diffPresentation = presentationTargetTime - now;
        const hours = Math.floor((diffPresentation % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffPresentation % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffPresentation % (1000 * 60)) / 1000);

        const h = hours.toString().padStart(2, "0");
        const m = minutes.toString().padStart(2, "0");
        const s = seconds.toString().padStart(2, "0");

        setTimeLeft(`${h}:${m}:${s}`);
        return true;
      }

      // Phase 3: Presentation countdown completed -> Rocket Launch & Virtual Tour!
      setIsTopoPhase(true);
      setIsFinished(true);
      setTimeLeft("00:00:00");
      return false;
    };

    updateCountdown();
    const interval = setInterval(() => {
      const keep = updateCountdown();
      if (!keep) {
        const now = new Date().getTime();
        if (now >= presentationTargetTime) {
          const hasAutoLaunched = sessionStorage.getItem("hasAutoLaunchedRocket_v1");
          if (!hasAutoLaunched) {
            sessionStorage.setItem("hasAutoLaunchedRocket_v1", "true");
            onTriggerRocketPresentation?.();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [simMode, simSeconds, defaultInitialTarget, defaultPresentationTarget, onTriggerRocketPresentation]);

  // Simulation timer decrement interval
  useEffect(() => {
    if (!simMode || simMode === "phase3_launch") return;

    const interval = setInterval(() => {
      setSimSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [simMode]);

  // Trigger interactive quick simulations
  const startFullSimulation = () => {
    playClickSound(700, "sine");
    setIsSimModalOpen(false);
    setSimSeconds(6); // 6s countdown before TOPO
    setSimMode("phase1");
  };

  const jumpToTopoPhase = () => {
    playClickSound(800, "sine");
    setIsSimModalOpen(false);
    setSimSeconds(5); // 5s presentation countdown
    setSimMode("phase2_topo");
  };

  const triggerDirectRocketLaunch = () => {
    playSuccessSound();
    setIsSimModalOpen(false);
    setSimMode("phase3_launch");
    onTriggerRocketPresentation?.();
  };

  const resetToRealTime = () => {
    playClickSound(500, "sine");
    setIsSimModalOpen(false);
    setSimMode(null);
  };

  const handleOpenEditModal = () => {
    playClickSound(600, "sine");
    setTempTitle(bannerTitle);
    setTempTargetDate(defaultInitialTarget.substring(0, 16));
    setTempPresentationTarget(defaultPresentationTarget.substring(0, 16));
    setTempLocation(bannerLocation);
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    playSuccessSound();

    const finalInitial = tempTargetDate.includes("-03:00")
      ? tempTargetDate
      : `${tempTargetDate}:00-03:00`;

    const finalPresentation = tempPresentationTarget.includes("-03:00")
      ? tempPresentationTarget
      : `${tempPresentationTarget}:00-03:00`;

    if (onSavePortalPagesConfig) {
      onSavePortalPagesConfig({
        ...portalPagesConfig,
        rodadaTitle: tempTitle,
        rodadaTargetDate: finalInitial,
        presentationTargetDate: finalPresentation,
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
            className={`text-white relative z-[35] shadow-[0_4px_25px_rgba(0,0,0,0.5)] border-b overflow-hidden transition-all duration-500 ${
              isTopoPhase
                ? "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700 border-yellow-300 text-black"
                : "bg-gradient-to-r from-green-700 via-green-600 to-green-800 border-green-500 text-white"
            }`}
          >
            {/* Animated background beam */}
            <motion.div
              className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)] w-[50%] h-full skew-x-12"
              animate={{ left: ["-100%", "200%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />

            <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 text-center sm:text-left relative">
              
              {/* Left Side: Brand & Phase Display */}
              <div className="flex items-center gap-3">
                {isTopoPhase ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-black text-yellow-300 font-display font-black text-sm sm:text-base px-3 py-0.5 rounded-lg border border-yellow-400/50 shadow-md tracking-wider animate-pulse flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                      TOPO
                    </span>
                    <span className="font-display font-black uppercase tracking-wider text-xs sm:text-sm text-black drop-shadow-sm">
                      INÍCIO DA APRESENTAÇÃO
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 font-display font-black uppercase tracking-wider text-xs sm:text-sm text-yellow-300 drop-shadow-md">
                    <Calendar className="w-4 h-4 text-yellow-300 animate-pulse" />
                    <span>{bannerTitle}</span>
                  </div>
                )}

                {simMode && (
                  <span className="text-[10px] font-mono font-black uppercase bg-pink-500 text-white px-2 py-0.5 rounded-full border border-pink-300 animate-pulse">
                    Simulação Ativa
                  </span>
                )}
              </div>

              {/* Center: Countdown Timer */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 font-mono font-bold text-xs sm:text-sm px-4 py-1 rounded-full shadow-inner border ${
                  isTopoPhase
                    ? "bg-black/90 text-yellow-300 border-yellow-400/40"
                    : "bg-black/40 text-green-300 border-white/10"
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider opacity-80">
                    {isTopoPhase ? (isFinished ? "AO VIVO" : "Apresentação em:") : "Contagem:"}
                  </span>
                  <span className="tracking-widest tabular-nums text-sm font-black">
                    {timeLeft || "Calculando..."}
                  </span>
                </div>

                {/* Simulation button for demo purposes */}
                <button
                  onClick={() => {
                    playClickSound(650, "sine");
                    setIsSimModalOpen(true);
                  }}
                  className={`px-3 py-1 rounded-full font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                    isTopoPhase
                      ? "bg-black text-yellow-300 hover:bg-zinc-900 border border-yellow-400/50"
                      : "bg-emerald-950 text-emerald-300 hover:bg-black border border-emerald-400/50"
                  }`}
                  title="Abrir painel de Demonstração e Simulação"
                >
                  <PlayCircle className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                  <span>Demonstrar Simulação</span>
                </button>

                {/* Direct Rocket Launch Trigger Button */}
                <button
                  onClick={() => {
                    playClickSound(800, "sine");
                    onTriggerRocketPresentation?.();
                  }}
                  className={`px-3 py-1 rounded-full font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
                    isTopoPhase
                      ? "bg-black text-white hover:bg-zinc-800 border border-black/40"
                      : "bg-yellow-400 text-black hover:bg-yellow-350 shadow-yellow-500/20"
                  }`}
                  title="Acionar foguete e abrir Tour Virtual"
                >
                  <Rocket className="w-3.5 h-3.5 animate-bounce" />
                  <span>{isFinished ? "Decolar Foguete ➔ Tour" : "Decolar ➔ Tour"}</span>
                </button>
              </div>

              {/* Right: Location and Admin Controls */}
              <div className="flex items-center gap-3">
                <div className={`hidden md:flex items-center gap-1.5 text-[10px] sm:text-xs font-bold font-mono uppercase tracking-widest ${
                  isTopoPhase ? "text-zinc-900" : "text-zinc-100"
                }`}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{bannerLocation}</span>
                </div>

                {isDirectEditingEnabled && (
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1 px-2.5 py-1 bg-black text-yellow-300 text-[10px] font-bold font-mono uppercase rounded-lg border border-yellow-400/40 transition-colors shadow-sm cursor-pointer"
                    title="Editar datas e horários da contagem"
                  >
                    <Edit className="w-2.5 h-2.5" />
                    <span>Configurar</span>
                  </button>
                )}

                <button
                  onClick={() => setIsVisible(false)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isTopoPhase ? "hover:bg-black/10 text-black" : "hover:bg-black/20 text-white"
                  }`}
                  title="Fechar Banner (X)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIMULATION CONTROLLER MODAL */}
      {isSimModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-950 border-2 border-green-500/60 rounded-3xl p-6 w-full max-w-lg shadow-[0_0_60px_rgba(34,197,94,0.3)] relative text-left font-mono text-xs text-white">
            <button
              onClick={() => {
                playClickSound(600, "sine");
                setIsSimModalOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition cursor-pointer"
              title="Fechar (X)"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 border-b border-zinc-800 pb-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
                <PlayCircle className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <h3 className="font-display font-black text-base uppercase text-white tracking-wider">
                  Demonstração da Simulação
                </h3>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Teste em tempo real todas as 3 fases do cronômetro, a palavra <strong>TOPO</strong> e o lançamento do foguete.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Option 1: Full Simulation */}
              <button
                onClick={startFullSimulation}
                className="w-full text-left p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-700/80 rounded-2xl transition group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <FastForward className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white uppercase text-xs flex items-center gap-2">
                    <span>1. Simulação Completa Acelerada (10 segundos)</span>
                    <span className="bg-yellow-400/20 text-yellow-300 text-[9px] px-2 py-0.5 rounded">Recomendado</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-normal">
                    Inicia a contagem regressiva por 6s ➔ Transiciona para a palavra <strong>TOPO</strong> e contagem da apresentação por 5s ➔ Decola o <strong>foguete</strong> e abre o <strong>Tour Virtual</strong> com botão X.
                  </p>
                </div>
              </button>

              {/* Option 2: Jump directly to TOPO Phase */}
              <button
                onClick={jumpToTopoPhase}
                className="w-full text-left p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-yellow-500/40 rounded-2xl transition group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-yellow-300 uppercase text-xs">
                    2. Ir Direto para a Fase TOPO (19:30)
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-normal">
                    Mostra a palavra TOPO em destaque dourado com novo contador de apresentação terminando em 5 segundos.
                  </p>
                </div>
              </button>

              {/* Option 3: Launch Rocket & Virtual Tour */}
              <button
                onClick={triggerDirectRocketLaunch}
                className="w-full text-left p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-green-500/40 rounded-2xl transition group flex items-start gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-green-500/20 text-green-400 border border-green-500/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <Rocket className="w-4 h-4 animate-bounce" />
                </div>
                <div>
                  <div className="font-bold text-green-400 uppercase text-xs">
                    3. Subir Foguete e Abrir Tour Virtual
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-normal">
                    Executa a animação de decolagem do foguete com som espacial e abre o modal do Tour Virtual interativo com botão (X) para fechar.
                  </p>
                </div>
              </button>

              {/* Option 4: Open Welcome Popup */}
              {onOpenWelcome && (
                <button
                  onClick={() => {
                    playClickSound(850, "sine");
                    setIsSimModalOpen(false);
                    onOpenWelcome();
                  }}
                  className="w-full text-left p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-pink-500/40 rounded-2xl transition group flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/40 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                    <PartyPopper className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <div className="font-bold text-pink-400 uppercase text-xs">
                      4. Abrir Modal de Boas-Vindas (Topina e Opções de Acesso)
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans mt-1 leading-normal">
                      Exibe a mensagem de recepção, a assistente Topina, narração por voz e a cascata de perfis (Visitante, Comunidade, Embaixador, Parceiro, etc.).
                    </p>
                  </div>
                </button>
              )}

              {/* Reset Option */}
              {simMode && (
                <button
                  onClick={resetToRealTime}
                  className="w-full text-center py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition border border-zinc-800 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Horário Real Oficial</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left font-mono text-xs text-white">
            <button
              onClick={() => {
                playClickSound(600, "sine");
                setIsEditModalOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
              <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />
              <span>Configurar Contagens e Fases do Banner</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Título Principal do Banner</label>
                <input
                  type="text"
                  required
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  placeholder="Ex: RODADA DE NEGÓCIOS & APRESENTAÇÃO"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">
                  1ª Fase: Data e Hora para exibir palavra TOPO (19:30)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={tempTargetDate}
                  onChange={(e) => setTempTargetDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl p-2.5 text-white focus:outline-none text-[12px]"
                />
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Ao atingir este horário, o banner destaca a palavra <strong>TOPO</strong> e ativa o novo contador de apresentação.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">
                  2ª Fase: Data e Hora para Início da Apresentação & Decolagem
                </label>
                <input
                  type="datetime-local"
                  required
                  value={tempPresentationTarget}
                  onChange={(e) => setTempPresentationTarget(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl p-2.5 text-white focus:outline-none text-[12px]"
                />
                <p className="text-[9px] text-zinc-500 leading-normal">
                  Quando este contador zerar, o foguete decola automaticamente e convida para o Tour Virtual com X para fechar.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Local / Subtítulo</label>
                <input
                  type="text"
                  required
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  placeholder="Ex: 17 de Agosto • Auditório Office 360"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(600, "sine");
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black uppercase rounded-xl hover:opacity-90 transition flex items-center gap-1 shadow-lg shadow-yellow-500/20 cursor-pointer"
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
