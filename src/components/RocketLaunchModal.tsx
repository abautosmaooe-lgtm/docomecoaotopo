import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, Sparkles, X, ArrowRight, Play } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface RocketLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSiteTour: () => void;
}

export default function RocketLaunchModal({
  isOpen,
  onClose,
  onOpenSiteTour,
}: RocketLaunchModalProps) {
  const [stage, setStage] = useState<"launching" | "landed">("launching");

  useEffect(() => {
    if (isOpen) {
      setStage("launching");
      playSuccessSound();

      // Sound effects for lift-off
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.8);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.2);
      } catch (e) {
        // AudioContext fallback
      }

      const timer = setTimeout(() => {
        setStage("landed");
      }, 1600);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      {/* Background Starfield Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-lg bg-stone-950 border-2 border-green-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(34,197,94,0.4)] text-center text-white overflow-hidden"
      >
        {/* Top Close Button (X) */}
        <button
          onClick={() => {
            playClickSound(600, "sine");
            onClose();
          }}
          className="absolute top-4 right-4 p-2 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full border border-zinc-800 hover:border-zinc-700 transition cursor-pointer z-30"
          title="Fechar (X)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Dynamic Rocket Animation */}
        <div className="relative h-44 flex items-center justify-center mb-4 overflow-visible">
          {stage === "launching" ? (
            <motion.div
              initial={{ y: 80, scale: 0.8, opacity: 0 }}
              animate={{ 
                y: [-20, -100, -160], 
                scale: [0.8, 1.3, 1.1],
                opacity: [0, 1, 1] 
              }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              <div className="text-7xl sm:text-8xl filter drop-shadow-[0_0_30px_rgba(34,197,94,0.8)] animate-bounce">
                🚀
              </div>
              {/* Rocket Exhaust Smoke & Flame */}
              <motion.div
                initial={{ opacity: 0.8, scaleY: 0.5 }}
                animate={{ opacity: [0.9, 0.4, 0], scaleY: [1, 2, 2.5] }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="w-10 h-24 bg-gradient-to-b from-amber-400 via-orange-500 to-transparent rounded-full blur-sm"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500/30 to-emerald-500/10 border border-green-500/50 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(34,197,94,0.5)] mb-2">
                🚀
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-black text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/30 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>CHEGAMOS AO TOPO!</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Content Details */}
        <div className="space-y-3 relative z-10">
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
            Apresentação Iniciada!
          </h3>

          <p className="text-sm text-zinc-300 font-sans leading-relaxed max-w-md mx-auto">
            A contagem regressiva chegou ao fim e a jornada rumo ao <strong className="text-yellow-400">TOPO</strong> começou. Conheça agora todos os recursos e novidades exclusivas em nosso <strong className="text-green-400">Tour Virtual</strong> guiado.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                playClickSound(800, "sine");
                onClose();
                onOpenSiteTour();
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-green-500 via-emerald-400 to-green-600 hover:from-green-400 hover:to-emerald-300 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-black text-black" />
              <span>Iniciar Tour Virtual</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playClickSound(500, "sine");
                onClose();
              }}
              className="w-full sm:w-auto px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-mono text-xs font-bold uppercase rounded-2xl border border-zinc-800 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
