import React, { useState, useEffect, useRef } from "react";
import { motion, useDragControls } from "motion/react";
import { 
  X, Maximize2, Minimize2, Radio, ExternalLink, Play, 
  Volume2, VolumeX, Move, Sparkles, Youtube, Film
} from "lucide-react";
import { playClickSound } from "../utils/audio";
import { getYouTubeId } from "./PodcastSection";

export interface PipVideoData {
  id: string;
  number?: number;
  title: string;
  youtubeUrl: string;
  embedCode?: string;
  duration?: string;
  isLive?: boolean;
}

interface PodcastPipPlayerProps {
  video: PipVideoData | null;
  onClose: () => void;
  onExpand?: () => void;
}

export default function PodcastPipPlayer({
  video,
  onClose,
  onExpand
}: PodcastPipPlayerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");

  // Drag controls from motion
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);

  if (!video) return null;

  const ytId = getYouTubeId(video.youtubeUrl);

  const getDimensions = () => {
    if (isMinimized) return "w-64 h-14";
    switch (size) {
      case "small":
        return "w-72 sm:w-80 h-48 sm:h-52";
      case "large":
        return "w-80 sm:w-[420px] md:w-[480px] h-60 sm:h-72 md:h-80";
      case "medium":
      default:
        return "w-76 sm:w-96 h-52 sm:h-64";
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(500, "sine");
    onClose();
  };

  const handleToggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(600, "sine");
    setIsMinimized(prev => !prev);
  };

  const handleToggleSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(700, "sine");
    setSize(current => {
      if (current === "small") return "medium";
      if (current === "medium") return "large";
      return "small";
    });
  };

  const handleScrollToPodcast = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(750, "sine");
    const elem = document.getElementById("podcast-youtube-root-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (onExpand) onExpand();
  };

  return (
    <>
      {/* Invisible global viewport bounds container for drag */}
      <div 
        ref={constraintsRef} 
        className="fixed inset-4 pointer-events-none z-[99990]" 
      />

      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false} // Only drag by the designated handle bar
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        dragMomentum={false}
        initial={{ opacity: 0, scale: 0.85, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 30 }}
        transition={{ type: "spring", damping: 24, stiffness: 280 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed bottom-6 right-6 z-[99991] pointer-events-auto rounded-2xl overflow-hidden border-2 border-pink-500/50 bg-stone-950/95 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(236,72,153,0.25)] backdrop-blur-xl flex flex-col transition-[width,height] duration-200 select-none ${getDimensions()}`}
      >
        {/* DRAGGABLE HEADER / TOP BAR */}
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="px-3 py-2 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 border-b border-pink-500/30 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-stone-900 transition shrink-0"
          title="Arraste para mover o player pela tela"
        >
          {/* Left Title & Status Indicator */}
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
            <div className="w-5 h-5 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
              <Radio className="w-3 h-3 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-mono font-black uppercase text-green-400 bg-green-950/60 px-1 rounded border border-green-500/30">
                  PiP Vídeo
                </span>
                {video.number && (
                  <span className="text-[8px] font-mono text-zinc-400">
                    #{video.number}
                  </span>
                )}
              </div>
              <h5 className="text-[11px] font-bold text-white truncate leading-tight font-display">
                {video.title}
              </h5>
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Drag Handle Icon Hint */}
            <div className="p-1 text-zinc-500 hover:text-zinc-300 transition" title="Arraste para reposicionar">
              <Move className="w-3.5 h-3.5" />
            </div>

            {/* Change Size toggle (when not minimized) */}
            {!isMinimized && (
              <button
                type="button"
                onClick={handleToggleSize}
                className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-pink-300 border border-zinc-800 transition"
                title={`Tamanho atual: ${size === "small" ? "Pequeno" : size === "medium" ? "Médio" : "Grande"}. Clique para alterar.`}
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            )}

            {/* Minimize / Expand Bar Toggle */}
            <button
              type="button"
              onClick={handleToggleMinimize}
              className="p-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition"
              title={isMinimized ? "Expandir Player" : "Minimizar Player"}
            >
              <Minimize2 className="w-3 h-3" />
            </button>

            {/* Jump to podcast section in page */}
            <button
              type="button"
              onClick={handleScrollToPodcast}
              className="p-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 border border-pink-500/40 transition"
              title="Ir para o Bloco do Podcast no Portal"
            >
              <ExternalLink className="w-3 h-3" />
            </button>

            {/* Close PiP */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 transition ml-0.5"
              title="Fechar Picture-in-Picture"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* EMBEDDED PLAYER CONTAINER (HIDDEN WHEN MINIMIZED) */}
        {!isMinimized && (
          <div className="flex-1 w-full bg-black relative overflow-hidden flex flex-col justify-center">
            {video.embedCode ? (
              <div 
                className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:border-0" 
                dangerouslySetInnerHTML={{ __html: video.embedCode }} 
              />
            ) : ytId ? (
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&playsinline=1`}
                title={video.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <div className="p-4 text-center text-zinc-500 text-xs font-mono">
                <Film className="w-6 h-6 mx-auto mb-1 text-zinc-600" />
                Vídeo não disponível para reprodução
              </div>
            )}

            {/* Subtle bottom info bar on hover */}
            <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between pointer-events-none transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <span className="truncate pr-2">Do Começo ao Topo Podcast</span>
              <span className="text-[9px] text-pink-400 font-bold shrink-0">Arraste pela barra superior ↔</span>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
}
