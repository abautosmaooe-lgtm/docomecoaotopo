import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Smartphone,
  Tablet,
  RotateCw,
  X,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Layers,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check
} from "lucide-react";
import { playClickSound } from "../utils/audio";

interface DevicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

type DeviceType = "mobile" | "tablet";
type Orientation = "portrait" | "landscape";

interface DeviceConfig {
  name: string;
  type: DeviceType;
  width: number;
  height: number;
  aspectRatio: string;
  bezelClass: string;
  screenClass: string;
  hasDynamicIsland?: boolean;
  notchType?: "island" | "dot";
}

const DEVICES: Record<DeviceType, DeviceConfig> = {
  mobile: {
    name: "Smartphone (390 × 844 px)",
    type: "mobile",
    width: 390,
    height: 844,
    aspectRatio: "390 / 844",
    bezelClass: "rounded-[50px] p-3.5 border-[6px] border-[#2c2c2e] shadow-2xl shadow-black/80 bg-[#1c1c1e]",
    screenClass: "rounded-[38px] overflow-hidden",
    hasDynamicIsland: true,
    notchType: "island"
  },
  tablet: {
    name: "Tablet Padrão (820 × 1180 px)",
    type: "tablet",
    width: 780,
    height: 1040,
    aspectRatio: "780 / 1040",
    bezelClass: "rounded-[36px] p-4 border-[8px] border-[#2c2c2e] shadow-2xl shadow-black/80 bg-[#1c1c1e]",
    screenClass: "rounded-[22px] overflow-hidden",
    hasDynamicIsland: false,
    notchType: "dot"
  }
};

export default function DevicePreviewModal({
  isOpen,
  onClose,
  isDarkMode = true
}: DevicePreviewModalProps) {
  const [activeDevice, setActiveDevice] = useState<DeviceType>("mobile");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [scale, setScale] = useState<number>(0.85);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Responsive scale auto-calc
  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      
      if (activeDevice === "mobile") {
        if (orientation === "portrait") {
          setScale(vh < 900 ? Math.min(0.85, (vh - 180) / 844) : 0.9);
        } else {
          setScale(Math.min(0.75, (vh - 180) / 390));
        }
      } else {
        // Tablet
        if (orientation === "portrait") {
          setScale(Math.min(0.65, (vh - 200) / 1040, (vw - 80) / 780));
        } else {
          setScale(Math.min(0.6, (vh - 200) / 780, (vw - 80) / 1040));
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeDevice, orientation, isOpen]);

  // Handle ESC close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDevice = DEVICES[activeDevice];
  const isLandscape = orientation === "landscape";
  const frameWidth = isLandscape ? currentDevice.height : currentDevice.width;
  const frameHeight = isLandscape ? currentDevice.width : currentDevice.height;

  const handleRefresh = () => {
    playClickSound(700, "sine");
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleOrientation = () => {
    playClickSound(800, "sine");
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const handleSelectDevice = (dev: DeviceType) => {
    playClickSound(850, "sine");
    setActiveDevice(dev);
  };

  const handleCopyUrl = () => {
    playClickSound(900, "sine");
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const previewUrl = window.location.href;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-black/90 backdrop-blur-xl text-white select-none overflow-hidden">
        
        {/* TOP CONTROL BAR */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full px-4 py-3 bg-stone-950/80 border-b border-zinc-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 z-50 shrink-0"
        >
          {/* Brand & Mode Label */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-sm tracking-tight text-white">
                  Simulador de Telas
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                  Multi-Dispositivos
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Visualização responsiva exata de Celular e Tablet
              </p>
            </div>
          </div>

          {/* DEVICE SWITCHER BUTTONS (CELULAR / TABLET) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-inner">
            <button
              onClick={() => handleSelectDevice("mobile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeDevice === "mobile"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-black shadow-lg shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Celular</span>
              <span className="hidden sm:inline text-[9px] opacity-75">(390px)</span>
            </button>

            <button
              onClick={() => handleSelectDevice("tablet")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                activeDevice === "tablet"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-black shadow-lg shadow-emerald-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Tablet className="w-4 h-4" />
              <span>Tablet Padrão</span>
              <span className="hidden sm:inline text-[9px] opacity-75">(780px)</span>
            </button>
          </div>

          {/* ACTIONS & ROTATION */}
          <div className="flex items-center gap-2">
            {/* Rotate Button */}
            <button
              onClick={handleToggleOrientation}
              title={`Rotacionar para ${isLandscape ? "Retrato" : "Paisagem"}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 text-xs font-mono transition shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{isLandscape ? "Paisagem" : "Retrato"}</span>
            </button>

            {/* Reload Iframe */}
            <button
              onClick={handleRefresh}
              title="Recarregar tela simulada"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition shadow-sm"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Open in New Tab */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir URL real em nova aba"
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition shadow-sm hidden sm:flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-white" />
            </a>

            {/* Close Button */}
            <button
              onClick={() => {
                playClickSound(600, "sine");
                onClose();
              }}
              title="Fechar Simulador (ESC)"
              className="p-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition shadow-sm ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {/* DEVICE CANVAS / VIEWPORT STAGE */}
        <main className="flex-1 w-full flex items-center justify-center p-2 sm:p-6 overflow-auto relative">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
              width: frameWidth,
              height: frameHeight
            }}
            className={`relative shrink-0 ${currentDevice.bezelClass}`}
          >
            {/* Dynamic island or Camera notch for Smartphone */}
            {activeDevice === "mobile" && !isLandscape && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-28 h-6 bg-black rounded-full flex items-center justify-between px-2.5 shadow-md border border-zinc-800/60 pointer-events-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-zinc-700 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-blue-900/80" />
                </div>
                <div className="w-2 h-2 rounded-full bg-zinc-900" />
              </div>
            )}

            {/* Tablet Camera Dot */}
            {activeDevice === "tablet" && !isLandscape && (
              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-40 w-2.5 h-2.5 rounded-full bg-black border border-zinc-700 shadow pointer-events-none" />
            )}

            {/* Realistic Device Screen */}
            <div className={`w-full h-full relative bg-black flex flex-col ${currentDevice.screenClass}`}>
              
              {/* TOP STATUS BAR (SIMULATED IOS / ANDROID) */}
              <div className="w-full h-9 bg-black/90 text-white flex items-center justify-between px-5 text-[11px] font-mono font-bold shrink-0 z-30 select-none border-b border-zinc-900/60">
                <span>{currentTime || "12:00"}</span>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="text-[10px] font-bold">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4 fill-white" />
                </div>
              </div>

              {/* SIMULATED BROWSER URL BAR */}
              <div className="w-full py-1.5 px-3 bg-stone-900 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0 text-xs font-mono z-30">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="text-[10px] text-green-400">🔒</span>
                  <span className="text-[10px] text-zinc-300 truncate max-w-[200px] sm:max-w-[300px]">
                    docomecoaotopo.com.br
                  </span>
                </div>
                <button
                  onClick={handleCopyUrl}
                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  {isCopied ? <Check className="w-3 h-3 text-green-400" /> : <Share2 className="w-3 h-3" />}
                  <span>{isCopied ? "Copiado!" : "Compartilhar"}</span>
                </button>
              </div>

              {/* LIVE EMBEDDED IFRAME */}
              <div className="flex-1 w-full relative bg-stone-950 overflow-hidden">
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={previewUrl}
                  title="Simulador de Dispositivo"
                  className="w-full h-full border-0 bg-stone-950"
                  style={{
                    width: "100%",
                    height: "100%"
                  }}
                />
              </div>

              {/* BOTTOM HOME INDICATOR BAR (IOS STYLE) */}
              <div className="w-full h-5 bg-black flex items-center justify-center shrink-0 z-30 pointer-events-none">
                <div className="w-32 h-1 bg-zinc-500/80 rounded-full" />
              </div>

            </div>
          </div>
        </main>

        {/* BOTTOM HELPER FOOTER */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="w-full py-2 px-4 bg-stone-950/90 border-t border-zinc-800/80 text-center text-xs font-mono text-zinc-400 flex flex-wrap items-center justify-between gap-2 shrink-0 z-50"
        >
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">● {currentDevice.name}</span>
            <span>• Orientação: {isLandscape ? "Paisagem" : "Retrato"}</span>
            <span>• Zoom: {Math.round(scale * 100)}%</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>💡 Dica: Você pode interagir normalmente com todos os menus e botões dentro da tela simulada.</span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-bold"
            >
              Fechar
            </button>
          </div>
        </motion.footer>

      </div>
    </AnimatePresence>
  );
}
