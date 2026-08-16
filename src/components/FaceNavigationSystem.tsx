import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "motion/react";
import { 
  ScanFace, Camera, CameraOff, X, Check, Play, Pause, 
  RefreshCw, Sparkles, Navigation, Target, Sliders, Eye, 
  Move, Minimize2, Maximize2, Hand
} from "lucide-react";
import { playClickSound } from "../utils/audio";

interface FaceNavigationSystemProps {
  isOpen: boolean;
  initialMode?: "face" | "hands";
  onClose: () => void;
  onActivationChange?: (isActive: boolean) => void;
}

export default function FaceNavigationSystem({
  isOpen,
  initialMode = "face",
  onClose,
  onActivationChange,
}: FaceNavigationSystemProps) {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<"prompt" | "granted" | "denied">("prompt");
  const [useCamera, setUseCamera] = useState(true);
  const [sensitivity, setSensitivity] = useState(1.5);
  const [dwellTime, setDwellTime] = useState(2000); // 2 seconds dwell click
  const [trackingMode, setTrackingMode] = useState<"face" | "hands">(initialMode);
  
  // Sync mode when prop changes
  useEffect(() => {
    if (isOpen) {
      setTrackingMode(initialMode);
    }
  }, [isOpen, initialMode]);
  
  // Virtual cursor state
  const [cursorPos, setCursorPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [headDirection, setHeadDirection] = useState<"center" | "up" | "down" | "left" | "right">("center");
  const [hoverProgress, setHoverProgress] = useState(0);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);

  const dragControls = useDragControls();
  const hudConstraintsRef = useRef<HTMLDivElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hoverStartRef = useRef<number | null>(null);
  const lastPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  // Handle countdown modal
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && isCountingDown && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && isCountingDown && countdown === 0) {
      handleStartNavigation();
    }
    return () => clearInterval(timer);
  }, [isOpen, isCountingDown, countdown]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setIsCountingDown(true);
    } else {
      setIsCountingDown(false);
    }
  }, [isOpen]);

  // Start webcam feed if enabled
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraPermission("granted");
    } catch (err) {
      console.warn("Câmera não permitida ou indisponível, usando simulação por gestos de face", err);
      setCameraPermission("denied");
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const handleStartNavigation = () => {
    playClickSound(800, "sine");
    setIsCountingDown(false);
    setIsActive(true);
    if (onActivationChange) onActivationChange(true);
    onClose();

    if (useCamera) {
      startCamera();
    }
  };

  const handleStopNavigation = () => {
    playClickSound(500, "sine");
    setIsActive(false);
    stopCamera();
    if (onActivationChange) onActivationChange(false);
    if (dwellTimerRef.current) clearInterval(dwellTimerRef.current);
    setHoverProgress(0);
    setHoveredElement(null);
  };

  // Motion analysis loop for camera & cursor movement
  useEffect(() => {
    if (!isActive) return;

    let prevImageData: Uint8ClampedArray | null = null;

    const processFrame = () => {
      if (useCamera && videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = 160;
          canvas.height = 120;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          if (prevImageData) {
            let dx = 0;
            let dy = 0;
            let totalDiff = 0;

            // Optical flow estimation
            for (let y = 20; y < canvas.height - 20; y += 4) {
              for (let x = 20; x < canvas.width - 20; x += 4) {
                const i = (y * canvas.width + x) * 4;
                const diff = Math.abs(data[i] - prevImageData[i]);
                if (diff > 25) {
                  totalDiff++;
                  // Inverted X for mirror effect
                  dx += (canvas.width / 2 - x);
                  dy += (y - canvas.height / 2);
                }
              }
            }

            if (totalDiff > 30) {
              const avgDx = (dx / totalDiff) * sensitivity * 0.4;
              const avgDy = (dy / totalDiff) * sensitivity * 0.4;

              lastPosRef.current = {
                x: Math.max(20, Math.min(window.innerWidth - 20, lastPosRef.current.x + avgDx)),
                y: Math.max(20, Math.min(window.innerHeight - 20, lastPosRef.current.y + avgDy)),
              };

              setCursorPos({ ...lastPosRef.current });

              if (Math.abs(avgDx) > Math.abs(avgDy)) {
                setHeadDirection(avgDx > 0 ? "right" : "left");
              } else if (Math.abs(avgDy) > 1) {
                setHeadDirection(avgDy > 0 ? "down" : "up");
              } else {
                setHeadDirection("center");
              }
            } else {
              setHeadDirection("center");
            }
          }
          prevImageData = new Uint8ClampedArray(data);
        }
      }

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, useCamera, sensitivity]);

  // Dwell-click auto detector
  useEffect(() => {
    if (!isActive) return;

    const elem = document.elementFromPoint(cursorPos.x, cursorPos.y) as HTMLElement | null;
    const clickable = elem ? (elem.closest("button, a, input, select, textarea, [onClick], [role='button']") as HTMLElement | null) : null;

    if (clickable !== hoveredElement) {
      setHoveredElement(clickable);
      setHoverProgress(0);
      hoverStartRef.current = clickable ? Date.now() : null;
    }

    if (clickable) {
      if (!hoverStartRef.current) hoverStartRef.current = Date.now();
      const interval = setInterval(() => {
        if (!hoverStartRef.current) return;
        const elapsed = Date.now() - hoverStartRef.current;
        const pct = Math.min(100, (elapsed / dwellTime) * 100);
        setHoverProgress(pct);

        if (elapsed >= dwellTime) {
          playClickSound(1000, "sine");
          clickable.click();
          hoverStartRef.current = Date.now() + 1000; // Delay next click
          setHoverProgress(0);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setHoverProgress(0);
      hoverStartRef.current = null;
    }
  }, [cursorPos, isActive, hoveredElement, dwellTime]);

  // Manual direction nudge for testing without camera
  const nudgeCursor = (dir: "up" | "down" | "left" | "right") => {
    const step = 60 * sensitivity;
    setHeadDirection(dir);
    setCursorPos((prev) => {
      const next = {
        x: dir === "left" ? Math.max(20, prev.x - step) : dir === "right" ? Math.min(window.innerWidth - 20, prev.x + step) : prev.x,
        y: dir === "up" ? Math.max(20, prev.y - step) : dir === "down" ? Math.min(window.innerHeight - 20, prev.y + step) : prev.y,
      };
      lastPosRef.current = next;
      return next;
    });
    setTimeout(() => setHeadDirection("center"), 400);
  };

  return (
    <>
      {/* 1. INITIAL MODAL OVERLAY (Matches user reference image exactly) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-lg bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden p-8 border border-zinc-200 text-center"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Icon & Title */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0b294b] shadow-inner relative group">
                {trackingMode === "face" ? (
                  <ScanFace className="w-10 h-10 text-[#0b294b] animate-pulse" />
                ) : (
                  <Hand className="w-10 h-10 text-[#0b294b] animate-pulse" />
                )}
                <div className="absolute inset-0 border-2 border-dashed border-[#0b294b]/30 rounded-2xl animate-spin-slow pointer-events-none" />
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-[#0b294b] mb-4">
                Navegação por {trackingMode === "face" ? "Face" : "Mãos"}
              </h2>

              {/* Body Text */}
              <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-sans mb-8 max-w-md mx-auto">
                Com a navegação por {trackingMode === "face" ? "face" : "mãos"} ativada, mova {trackingMode === "face" ? "sua cabeça" : "suas mãos"} para controlar o cursor - direita, esquerda, cima e baixo. Quando o cursor fica parado sobre um elemento por 2 segundos, ele automaticamente clica. Experimente movimentar {trackingMode === "face" ? "sua cabeça" : "suas mãos"} para começar!
              </p>

              {/* Main Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleStartNavigation}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0b294b] hover:bg-[#071c35] text-white font-bold text-sm sm:text-base rounded-xl transition duration-200 shadow-lg shadow-[#0b294b]/30 flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>Começar</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-md text-xs font-mono font-black">
                    {countdown}
                  </span>
                </button>
              </div>

              {/* Camera Permissions Note */}
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-center gap-2 text-xs text-zinc-400 font-mono">
                <Camera className="w-3.5 h-3.5 text-[#0b294b]" />
                <span>Usa a câmera frontal ou controle gestual com IA inteligente</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. VIRTUAL CURSOR (Active Mode) */}
      {isActive && (
        <div
          className="fixed pointer-events-none z-[99999] transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${cursorPos.x}px`, top: `${cursorPos.y}px` }}
        >
          {/* Target Reticle */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Outer Ring */}
            <div className={`absolute inset-0 rounded-full border-2 ${hoveredElement ? "border-pink-500 scale-110" : "border-emerald-400"} animate-ping opacity-30`} />
            <div className={`w-10 h-10 rounded-full border-2 ${hoveredElement ? "border-pink-500 bg-pink-500/20" : "border-emerald-400 bg-emerald-500/20"} flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.6)] backdrop-blur-xs`}>
              <Target className={`w-5 h-5 ${hoveredElement ? "text-pink-400" : "text-emerald-300"}`} />
            </div>

            {/* Dwell Progress Bar Ring */}
            {hoverProgress > 0 && (
              <svg className="absolute inset-0 w-12 h-12 -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="stroke-pink-500 fill-none stroke-[3]"
                  strokeDasharray="125.6"
                  strokeDashoffset={125.6 - (125.6 * hoverProgress) / 100}
                />
              </svg>
            )}

            {/* Direction indicator badge */}
            {headDirection !== "center" && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/90 text-emerald-400 border border-emerald-500/40 text-[9px] font-mono font-bold rounded uppercase whitespace-nowrap shadow-md">
                {headDirection === "up" && "⬆️ CIMA"}
                {headDirection === "down" && "⬇️ BAIXO"}
                {headDirection === "left" && "⬅️ ESQUERDA"}
                {headDirection === "right" && "➡️ DIREITA"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global constraint container for dragging HUD */}
      <div ref={hudConstraintsRef} className="fixed inset-4 pointer-events-none z-[9980]" />

      {/* 3. FLOATING HUD WIDGET (Active Mode with PiP Draggable Capabilities) */}
      {isActive && (
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false} // Only dragged by top handle bar to not interfere with sliders/buttons
          dragConstraints={hudConstraintsRef}
          dragElastic={0.08}
          dragMomentum={false}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={`fixed bottom-6 left-6 z-[9990] pointer-events-auto bg-zinc-950/95 border-2 border-emerald-500/50 text-white rounded-2xl p-3 shadow-2xl backdrop-blur-xl transition-[width,height] duration-200 select-none ${
            isMinimized ? "w-64 space-y-0" : "w-72 sm:w-80 space-y-3"
          }`}
        >
          {/* HUD Draggable Header */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex items-center justify-between border-b border-zinc-800/80 pb-2 cursor-grab active:cursor-grabbing hover:bg-zinc-900/40 p-1 -m-1 rounded-t-xl transition"
            title="Arraste para mover o painel de face para qualquer canto da tela"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                {trackingMode === "face" ? (
                  <ScanFace className="w-3.5 h-3.5 animate-pulse" />
                ) : (
                  <Hand className="w-3.5 h-3.5 animate-pulse" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-xs uppercase tracking-wider text-emerald-400 leading-tight">
                  Navegação por {trackingMode === "face" ? "Face" : "Mãos"}
                </span>
                <span className="text-[8px] font-mono text-zinc-400">
                  Arraste ↔ para reposicionar
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <div className="p-1 text-zinc-500 hover:text-zinc-300 transition" title="Arraste para mover">
                <Move className="w-3.5 h-3.5" />
              </div>

              {/* Minimize / Expand Toggle */}
              <button
                type="button"
                onClick={() => {
                  playClickSound(600, "sine");
                  setIsMinimized(!isMinimized);
                }}
                className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 rounded-lg transition"
                title={isMinimized ? "Expandir Câmera & Controles" : "Minimizar Câmera (PiP Compacto)"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleStopNavigation}
                className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition"
                title="Encerrar Navegação por Face"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Camera preview box / gesture pad */}
              <div className="relative h-28 bg-black rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover transform -scale-x-100 ${useCamera && cameraPermission === "granted" ? "block" : "hidden"}`}
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Simulated Gesture Pad if Camera Off or Permission Denied */}
                {(!useCamera || cameraPermission !== "granted") && (
                  <div className="flex flex-col items-center justify-center gap-1.5 p-2 text-center">
                    <span className="text-[10px] font-mono text-zinc-400">
                      Controle Gestual de Cabeça Ativo
                    </span>
                    <div className="grid grid-cols-3 gap-1 w-28">
                      <div />
                      <button onClick={() => nudgeCursor("up")} className="p-1 bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs rounded text-center">⬆️</button>
                      <div />
                      <button onClick={() => nudgeCursor("left")} className="p-1 bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs rounded text-center">⬅️</button>
                      <button onClick={() => setHeadDirection("center")} className="p-1 bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 rounded text-center font-bold">FAÇA</button>
                      <button onClick={() => nudgeCursor("right")} className="p-1 bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs rounded text-center">➡️</button>
                      <div />
                      <button onClick={() => nudgeCursor("down")} className="p-1 bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs rounded text-center">⬇️</button>
                      <div />
                    </div>
                  </div>
                )}

                {/* Crosshair Overlay */}
                <div className="absolute inset-0 border border-[#22c55e]/20 pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border border-emerald-400/40 rounded-full animate-ping opacity-20" />
                </div>
              </div>

              {/* Controls & Sensitivity */}
              <div className="space-y-2 text-[10px] font-mono">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Sensibilidade do Rosto:</span>
                  <span className="text-emerald-400 font-bold">{sensitivity}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
                />

                <div className="flex items-center justify-between pt-1 text-[9px] text-zinc-500">
                  <span>Clique por Tempo de Espera:</span>
                  <span className="text-pink-400 font-bold">2.0s</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono">
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Rastreamento Ativo
                </span>
                <button
                  onClick={handleStopNavigation}
                  className="text-red-400 hover:underline uppercase font-bold"
                >
                  Pausar / Parar
                </button>
              </div>
            </>
          )}

          {isMinimized && (
            <div className="pt-2 flex items-center justify-between text-[9px] font-mono text-zinc-400">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Rastreando em segundo plano
              </span>
              <button
                onClick={() => setIsMinimized(false)}
                className="text-pink-400 hover:underline uppercase font-bold"
              >
                Expandir
              </button>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
