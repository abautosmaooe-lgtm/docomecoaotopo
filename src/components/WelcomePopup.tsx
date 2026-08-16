import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ChevronDown, 
  Sparkles, 
  UserPlus, 
  User, 
  Users, 
  Shield, 
  Handshake, 
  Lock, 
  ArrowRight,
  Sparkle,
  Volume2,
  VolumeX,
  Play,
  PictureInPicture2,
  Maximize2
} from "lucide-react";
import { playClickSound, playSuccessSound, speakWithFemaleVoice, stopSpeech } from "../utils/audio";

interface WelcomePopupProps {
  onClose: () => void;
  onSelectOption: (option: string) => void;
}

export default function WelcomePopup({ onClose, onSelectOption }: WelcomePopupProps) {
  const [isCascadeOpen, setIsCascadeOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPipMode, setIsPipMode] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Stop narration on unmount or close
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopSpeech();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // When cascade opens, ensure smooth scrolling down inside the modal
  useEffect(() => {
    if (isCascadeOpen && scrollContainerRef.current) {
      setTimeout(() => {
        const toggleBtn = document.getElementById("welcome-cascade-toggle-btn");
        if (toggleBtn) {
          toggleBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    }
  }, [isCascadeOpen]);

  const handleToggleNarration = () => {
    playClickSound(650, "sine");
    if (isNarrating) {
      stopSpeech();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      const textToSpeak = "Bem-vindo ou bem-vinda! Escolha uma opção. Abra a cascata abaixo para selecionar seu perfil no Portal Do Começo ao Topo!";
      speakWithFemaleVoice(
        textToSpeak,
        () => setIsNarrating(true),
        () => setIsNarrating(false),
        () => setIsNarrating(false),
        { pitch: 1.25, rate: 1.05 }
      );
    }
  };

  const options = [
    { 
      label: "CADASTRE-SE", 
      desc: "Crie sua conta no ecossistema",
      icon: UserPlus, 
      action: "CADASTRE-SE",
      color: "#22c55e",
      tag: "NOVO",
      badgeColor: "bg-green-500/15 text-green-400 border-green-500/30"
    },
    { 
      label: "SOU VISITANTE", 
      desc: "Navegue pelo portal e notícias",
      icon: User, 
      action: "VISITANTE",
      color: "#22c55e",
      tag: "LEITOR",
      badgeColor: "bg-green-500/15 text-green-400 border-green-500/30"
    },
    { 
      label: "SOU DA COMUNIDADE", 
      desc: "Rede exclusiva de empresários",
      icon: Users, 
      action: "COMUNIDADE",
      color: "#22c55e",
      tag: "MEMBRO",
      badgeColor: "bg-green-500/15 text-green-400 border-green-500/30"
    },
    { 
      label: "SOU EMBAIXADOR", 
      desc: "Painel de líderes regionais",
      icon: Shield, 
      action: "EMBAIXADORES",
      color: "#22c55e",
      tag: "LÍDER",
      badgeColor: "bg-green-500/15 text-green-400 border-green-500/30"
    },
    { 
      label: "SOU PARCEIRO", 
      desc: "Marcas e empresas oficiais",
      icon: Handshake, 
      action: "PARCEIROS",
      color: "#ec4899",
      tag: "PARCEIRO",
      badgeColor: "bg-pink-500/15 text-pink-400 border-pink-500/30"
    },
    { 
      label: "ADMIN", 
      desc: "Gestão, moderação e controle",
      icon: Lock, 
      action: "ADMIN",
      color: "#a855f7",
      tag: "RESTRITO",
      badgeColor: "bg-purple-500/15 text-purple-400 border-purple-500/30"
    },
  ];

  const handleSelect = (action: string) => {
    stopSpeech();
    playSuccessSound();
    onSelectOption(action);
  };

  // Picture-in-Picture Floating Mode (bottom-right)
  if (isPipMode) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] w-[300px] sm:w-[360px] bg-black/95 border-2 border-pink-500/60 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(236,72,153,0.35)] overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950 border-b border-zinc-800 text-[10px] font-mono text-zinc-300">
          <div className="flex items-center gap-1.5 text-pink-400 font-bold">
            <Play className="w-3 h-3" />
            <span>Topina (Picture-in-Picture)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => { playClickSound(600, "sine"); setIsPipMode(false); }}
              title="Expandir de volta"
              className="p-1 hover:text-white text-zinc-400"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => { stopSpeech(); playClickSound(500, "sine"); onClose(); }}
              title="Fechar"
              className="p-1 hover:text-red-400 text-zinc-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="w-full aspect-video bg-black relative">
          <iframe
            src="https://player.cloudinary.com/embed/?cloud_name=tqpomrnd&public_id=topina_apresenta_online-video-cutter.com_ljxpzz&autoplay=true"
            width="640"
            height="360"
            style={{ width: "100%", height: "100%", border: 0 }}
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
            title="Topina PiP"
          />
        </div>
        <div className="p-2 bg-zinc-950 flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-400">Do Começo ao Topo</span>
          <button
            onClick={() => { playClickSound(600, "sine"); setIsPipMode(false); }}
            className="text-pink-400 hover:text-pink-300 font-bold underline"
          >
            Abrir Menu Completo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="welcome-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopSpeech();
          playClickSound(500, "sine");
          onClose();
        }
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[10%] w-[320px] h-[320px] bg-green-500/15 rounded-full filter blur-[90px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[320px] h-[320px] bg-pink-500/15 rounded-full filter blur-[90px]" />
      </div>

      {/* Symmetric Card Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="relative overflow-hidden p-[2px] rounded-[24px] sm:rounded-[28px] max-w-lg md:max-w-xl w-full my-auto shadow-[0_20px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(34,197,94,0.15)]"
      >
        {/* Animated Neon Border */}
        <motion.div
          className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_20%,#22c55e_38%,#ec4899_50%,#a855f7_65%,#22c55e_78%,transparent_88%)] opacity-90"
          animate={{ rotate: 360 }}
          transition={{ ease: "linear", duration: 8, repeat: Infinity }}
        />

        {/* Inner Content Window */}
        <div 
          ref={scrollContainerRef}
          className="relative bg-[#0b0c10] rounded-[22px] sm:rounded-[26px] p-3.5 sm:p-5 text-center select-none z-10 flex flex-col gap-2.5 sm:gap-3 border border-zinc-800/80 max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none rounded-[22px] sm:rounded-[26px]" />

          {/* Top Bar with Badge, Audio Narration, PiP Mode and Close Button */}
          <div className="relative flex items-center justify-between z-20 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-green-500/30 text-green-400 text-[9px] sm:text-[10px] font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>DO COMEÇO AO TOPO</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Narration Voice Button */}
              <button
                onClick={handleToggleNarration}
                title={isNarrating ? "Pausar narração" : "Ouvir com voz feminina da Topina"}
                className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] sm:text-[10px] font-mono transition-all cursor-pointer ${
                  isNarrating
                    ? "bg-pink-500/20 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.4)] animate-pulse"
                    : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:border-pink-500/50"
                }`}
              >
                {isNarrating ? (
                  <>
                    <VolumeX className="w-3 h-3 text-pink-400" />
                    <span className="font-bold">Ouvindo...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-pink-400" />
                    <span className="font-bold">Narrar</span>
                  </>
                )}
              </button>

              {/* PiP Floating Mode Button */}
              <button
                onClick={() => {
                  playClickSound(600, "triangle");
                  setIsPipMode(true);
                }}
                title="Minimizar em Picture-in-Picture (Janela Flutuante)"
                className="p-1 rounded-full text-zinc-400 hover:text-pink-400 bg-zinc-900 border border-zinc-800 hover:border-pink-500/40 transition-all cursor-pointer shadow-sm"
              >
                <PictureInPicture2 className="w-3.5 h-3.5" />
              </button>

              {/* Close Button */}
              <button
                id="welcome-modal-close-btn"
                onClick={() => {
                  stopSpeech();
                  playClickSound(500, "sine");
                  onClose();
                }}
                title="Fechar e navegar (Esc)"
                className="p-1 rounded-full text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* MAIN VIDEO PLAYER EMBED */}
          <div className="relative z-10 w-full rounded-xl sm:rounded-2xl overflow-hidden border border-pink-500/40 bg-zinc-950 shadow-[0_0_20px_rgba(236,72,153,0.2)] shrink-0">
            <div className="flex items-center justify-between px-2.5 py-1 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800/80 text-[9px] sm:text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-1 text-pink-400 font-bold">
                <Play className="w-2.5 h-2.5 text-pink-400" />
                <span>Topina Apresenta</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-green-400 font-mono font-bold bg-green-500/10 border border-green-500/30 px-1 py-0.2 rounded">
                HD VÍDEO
              </span>
            </div>

            {/* Video container with controlled max-height to avoid taking entire screen */}
            <div className="w-full relative bg-black flex items-center justify-center max-h-[170px] sm:max-h-[220px] overflow-hidden">
              <iframe
                src="https://player.cloudinary.com/embed/?cloud_name=tqpomrnd&public_id=topina_apresenta_online-video-cutter.com_ljxpzz"
                width="640"
                height="360"
                style={{ width: "100%", height: "100%", aspectRatio: "16 / 9", border: 0, display: "block" }}
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                title="Apresentação Topina"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col items-center gap-0.5 z-10 shrink-0">
            <h2 
              id="welcome-modal-title" 
              className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight tracking-tight uppercase font-display"
            >
              BEM-VINDO(A)!{" "}
              <span className="text-transparent bg-gradient-to-r from-green-400 via-pink-400 to-green-400 bg-clip-text">
                ESCOLHA UMA OPÇÃO
              </span>
            </h2>
            <p className="text-[10px] sm:text-xs text-zinc-400 font-mono tracking-normal max-w-sm">
              Abra a cascata abaixo para selecionar seu perfil
            </p>
          </div>

          {/* Main Cascade Button (Accordion Trigger) */}
          <button
            id="welcome-cascade-toggle-btn"
            onClick={() => {
              playClickSound(isCascadeOpen ? 550 : 700, "triangle");
              setIsCascadeOpen(!isCascadeOpen);
            }}
            className="relative w-full flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-green-500/40 hover:border-green-400 transition-all duration-200 cursor-pointer shadow-sm z-10 group shrink-0"
          >
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="p-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 group-hover:scale-105 transition-transform shrink-0">
                <Sparkle className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] sm:text-[9px] font-mono text-green-400 font-bold uppercase tracking-wider leading-none mb-0.5">
                  MENU EM CASCATA
                </span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate">
                  {isCascadeOpen ? "Selecione seu tipo de acesso:" : "Clique para ver todas as opções..."}
                </span>
              </div>
            </div>

            <div className="p-1 rounded-md bg-zinc-800 text-zinc-300 group-hover:text-white transition-colors shrink-0">
              <ChevronDown 
                className={`w-3.5 h-3.5 transition-transform duration-300 ${
                  isCascadeOpen ? "rotate-180" : "rotate-0"
                }`} 
              />
            </div>
          </button>

          {/* Symmetrical Cascade List (Grid for Desktop & Compact for Mobile) */}
          <AnimatePresence>
            {isCascadeOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 z-10 overflow-hidden"
              >
                {options.map((item, index) => {
                  const isHovered = hoveredIndex === index;
                  return (
                    <motion.button
                      key={item.action}
                      id={`cascade-option-${item.action.toLowerCase()}`}
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: index * 0.02, duration: 0.15 }}
                      onMouseEnter={() => {
                        playClickSound(600 + index * 30, "triangle");
                        setHoveredIndex(index);
                      }}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => handleSelect(item.action)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-zinc-950/85 border transition-all duration-200 cursor-pointer overflow-hidden group text-left ${
                        isHovered 
                          ? "border-zinc-600 bg-zinc-900/95 shadow-[0_0_12px_rgba(255,255,255,0.06)]" 
                          : "border-zinc-800/80 hover:border-zinc-700"
                      }`}
                    >
                      {/* Left: Icon + Labels */}
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div 
                          className="p-1.5 rounded-lg border shrink-0 transition-all duration-200"
                          style={{
                            backgroundColor: isHovered ? `${item.color}20` : "rgba(24, 24, 27, 0.9)",
                            borderColor: isHovered ? `${item.color}80` : "rgba(39, 39, 42, 0.8)",
                            color: item.color
                          }}
                        >
                          <item.icon className="w-3.5 h-3.5" />
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-[11px] sm:text-xs font-extrabold tracking-wider uppercase text-zinc-100 group-hover:text-white truncate">
                              {item.label}
                            </span>
                            <span className={`text-[7px] font-mono px-1 py-0.2 rounded border font-bold shrink-0 ${item.badgeColor}`}>
                              {item.tag}
                            </span>
                          </div>
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono tracking-tight group-hover:text-zinc-300 truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {/* Right: Clean Arrow */}
                      <div className="shrink-0 pl-0.5">
                        <ArrowRight 
                          className="w-3 h-3 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" 
                        />
                      </div>

                      {/* Subtle hover background highlight */}
                      {isHovered && (
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-10"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Bar */}
          <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-zinc-500 text-[9px] sm:text-[10px] font-mono z-10 shrink-0">
            <div className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-pink-400" />
              <span>PORTAL OFICIAL</span>
            </div>
            <button
              onClick={() => {
                stopSpeech();
                playClickSound(500, "sine");
                onClose();
              }}
              className="text-zinc-400 hover:text-green-400 transition-colors uppercase underline cursor-pointer"
            >
              Continuar como visitante &rarr;
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
