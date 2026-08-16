import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Share, 
  PlusSquare, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Volume2
} from "lucide-react";
import { toast } from "sonner";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface PwaInstallButtonProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function PwaInstallButton({ isCollapsed: propIsCollapsed, onToggleCollapse }: PwaInstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "other">("desktop");
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pwa_install_collapsed") === "true";
    }
    return false;
  });

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalIsCollapsed;

  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      const newState = !internalIsCollapsed;
      setInternalIsCollapsed(newState);
      localStorage.setItem("pwa_install_collapsed", String(newState));
    }
    playClickSound(600, "sine");
  };

  // Detect platform and capture PWA installation prompt
  useEffect(() => {
    // Detect OS
    const userAgent = typeof window !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isIOS = /iphone|ipad|ipod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(userAgent);
    
    if (isIOS) {
      setPlatform("ios");
    } else if (isAndroid) {
      setPlatform("android");
    } else {
      setPlatform("desktop");
    }

    // Check if already running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setAlreadyInstalled(true);
    }

    // Capture browser PWA installation trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Capture appinstalled event
    const handleAppInstalled = () => {
      setAlreadyInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      playSuccessSound();
      toast.success("¡Parabéns! O aplicativo foi instalado na sua tela inicial.");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    playClickSound(800, "sine");
    
    // If native install prompt is available (Chrome, Edge, Android)
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        playSuccessSound();
        setAlreadyInstalled(true);
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      // If native is not available (Safari iOS, already installed, or browser doesn't support)
      // We show the highly educational step-by-step installation instructions modal!
      setIsModalOpen(true);
    }
  };

  // Close PWA instructions modal
  const closeModal = () => {
    playClickSound(550, "sine");
    setIsModalOpen(false);
  };

  // Skip showing anything if already running inside PWA standalone mode
  if (alreadyInstalled) {
    return (
      <div className="fixed bottom-6 left-6 z-50">
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 border border-green-500/30 rounded-2xl text-[10px] text-green-400 font-mono font-bold shadow-lg shadow-green-950/20 backdrop-blur">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          <span>PORTAL INSTALADO</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isCollapsed ? (
          /* Collapsed Tab sticking out of Left Edge */
          <div key="collapsed-tab" className="fixed bottom-6 left-0 z-50">
            <motion.button
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ x: 6 }}
              onClick={toggleCollapse}
              className="flex items-center gap-2 pl-3 pr-2.5 py-3 rounded-r-2xl bg-black/40 backdrop-blur-md border-y-2 border-r-2 border-green-500 text-green-400 font-mono font-black text-[10px] tracking-wider uppercase cursor-pointer shadow-[2px_4px_25px_rgba(34,197,94,0.15)] select-none"
            >
              <Smartphone className="w-4 h-4 text-green-400 animate-pulse" />
              <span>BAIXAR APP 📱</span>
              <ChevronRight className="w-3.5 h-3.5 text-pink-400 animate-bounce" />
            </motion.button>
          </div>
        ) : (
          /* Floating Install Trigger Button (Bottom-Left) */
          <div key="expanded-trigger" id="pwa-install-floating" className="fixed bottom-6 left-6 z-50 flex items-center gap-2">
            <motion.button
              initial={{ x: -20, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -50, opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleInstallClick}
              className="relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-black/40 backdrop-blur-md border-2 border-green-500/80 text-white shadow-[0_4px_25px_rgba(34,197,94,0.15)] hover:shadow-[0_4px_30px_rgba(236,72,153,0.25)] hover:border-pink-500 transition-all duration-300 group cursor-pointer"
            >
              {/* Internal neon subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-pink-500/10 rounded-full opacity-60" />

              {/* Glowing pulse ring */}
              <span className="absolute -inset-0.5 rounded-full border border-green-500/30 animate-ping pointer-events-none group-hover:border-pink-500/30" />

              <div className="relative flex items-center justify-center">
                <Download className="w-4.5 h-4.5 text-green-400 group-hover:text-pink-400 group-hover:translate-y-0.5 transition duration-200" />
                <Sparkles className="w-3 h-3 text-pink-400 absolute -top-1.5 -right-1.5 animate-pulse" />
              </div>

              <span className="font-display font-black text-[10px] sm:text-xs tracking-wider text-green-400 group-hover:text-pink-400 transition uppercase relative z-10">
                Baixar App 📱
              </span>
            </motion.button>

            {/* Collapse Trigger Button right next to it */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleCollapse}
              title="Recolher aba"
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-zinc-800/80 hover:border-pink-500/50 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200 cursor-pointer shadow-lg"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* EDUCATIONAL PWA INSTRUCTIONS DIALOG */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4 text-white select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              {/* Header neon accent bar */}
              <div className="h-1.5 bg-gradient-to-r from-green-500 via-pink-500 to-purple-600" />

              {/* Close Button */}
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                
                {/* Visual Banner */}
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto relative shadow-inner">
                    <Smartphone className="w-7 h-7 text-green-400" />
                    <Download className="w-4 h-4 text-pink-400 absolute bottom-1 right-1 animate-bounce" />
                  </div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-tight mt-3">
                    Instalar Aplicativo Web
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                    Salvar na tela inicial do seu celular ou PC
                  </p>
                </div>

                {/* Info Callout */}
                <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl flex gap-3 text-xs leading-relaxed text-zinc-300">
                  <Info className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    Ao adicionar o portal à sua tela inicial, você terá acesso imediato com <strong className="text-white">carregamento ultra-rápido</strong>, visual otimizado em tela cheia e <strong className="text-green-400">baixo consumo de dados</strong>.
                  </div>
                </div>

                {/* Conditional platform steps */}
                <div className="space-y-4">
                  <span className="block text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-1.5">
                    Instruções para {platform === "ios" ? "iPhone / iPad (iOS)" : platform === "android" ? "Dispositivos Android" : "Computadores & Notebooks"}
                  </span>

                  {platform === "ios" && (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          1
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                          Abra o portal usando o navegador <strong className="text-white">Safari</strong> (iOS nativo).
                        </p>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          2
                        </div>
                        <div className="text-xs text-zinc-300 leading-relaxed pt-0.5 flex flex-wrap items-center gap-1.5">
                          Toque no botão de 
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-pink-400">
                            <Share className="w-3 h-3" /> Compartilhar
                          </span>
                          na barra inferior do seu Safari.
                        </div>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          3
                        </div>
                        <div className="text-xs text-zinc-300 leading-relaxed pt-0.5 flex flex-wrap items-center gap-1.5">
                          Role as opções para baixo e toque em 
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-bold text-[10px] text-green-400">
                            <PlusSquare className="w-3 h-3" /> Adicionar à Tela de Início
                          </span>.
                        </div>
                      </div>
                    </div>
                  )}

                  {platform === "android" && (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          1
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                          Abra o menu do navegador tocando nos <strong className="text-white">três pontos</strong> no canto superior direito do Chrome.
                        </p>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          2
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                          Selecione a opção <strong className="text-green-400">"Instalar aplicativo"</strong> ou <strong className="text-green-400">"Adicionar à tela inicial"</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          3
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                          Confirme tocando em <strong className="text-white">"Adicionar"</strong> ou <strong className="text-white">"Instalar"</strong>. Pronto! O app surgirá na sua tela principal.
                        </p>
                      </div>
                    </div>
                  )}

                  {platform === "desktop" && (
                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          1
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pt-0.5 flex flex-wrap items-center gap-1">
                          No topo do seu navegador (Google Chrome ou Edge), procure pelo ícone de 
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-green-400 text-[10px]">
                            <Monitor className="w-3.5 h-3.5" /> instalação / monitor
                          </span>
                          no canto direito da barra de endereço.
                        </p>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[11px] font-mono font-bold text-pink-500 shrink-0">
                          2
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                          Clique nele e selecione <strong className="text-green-400">"Instalar"</strong> na janela pop-up que aparecerá na tela do seu computador.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer close button */}
                <div className="pt-4 border-t border-zinc-900 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-[11px] font-mono font-black rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-green-950/20"
                  >
                    <span>ENTENDI, CONTINUAR</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
