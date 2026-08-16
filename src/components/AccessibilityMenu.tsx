import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Accessibility, Type, Contrast, Eye, X, ScanFace, Hand, Mic } from "lucide-react";
import { playClickSound } from "../utils/audio";

export default function AccessibilityMenu({ 
  onOpenFaceNav, 
  onOpenHandNav,
  onOpenVoiceAgent,
}: { 
  onOpenFaceNav?: () => void;
  onOpenHandNav?: () => void;
  onOpenVoiceAgent?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    let filter = "";
    if (highContrast) filter += "invert(1) hue-rotate(180deg) ";
    if (grayscale) filter += "grayscale(100%) ";
    document.body.style.filter = filter.trim();
  }, [highContrast, grayscale]);

  useEffect(() => {
    if (largeText) {
      document.documentElement.style.fontSize = "110%";
    } else {
      document.documentElement.style.fontSize = "100%";
    }
  }, [largeText]);

  const toggleMenu = () => {
    playClickSound(isOpen ? 600 : 750, "sine");
    setIsOpen(!isOpen);
  };

  const toggleHighContrast = () => {
    playClickSound(900, "sine");
    setHighContrast(!highContrast);
  };

  const toggleGrayscale = () => {
    playClickSound(950, "sine");
    setGrayscale(!grayscale);
  };

  const toggleLargeText = () => {
    playClickSound(1000, "sine");
    setLargeText(!largeText);
  };

  return (
    <div className="relative flex flex-col items-end gap-3 z-50">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 mr-1 mb-1 items-end">
            {onOpenVoiceAgent && (
              <motion.button
                onClick={() => { playClickSound(850, "sine"); onOpenVoiceAgent(); setIsOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                transition={{ delay: 0.02, type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg bg-gradient-to-tr from-pink-600 to-rose-500 shadow-pink-500/30">
                  <Mic className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-stone-950/90 border border-pink-500/40 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                  <span className="text-[10px] text-pink-400 font-bold whitespace-nowrap">
                    Agente por Voz (Topina)
                  </span>
                </div>
              </motion.button>
            )}

            {onOpenHandNav && (
              <motion.button
                onClick={() => { playClickSound(800, "sine"); onOpenHandNav(); setIsOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                transition={{ delay: 0.04, type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30">
                  <Hand className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-stone-950/90 border border-emerald-500/40 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                  <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                    Navegação por Mãos
                  </span>
                </div>
              </motion.button>
            )}

            {onOpenFaceNav && (
              <motion.button
                onClick={() => { playClickSound(800, "sine"); onOpenFaceNav(); setIsOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                transition={{ delay: 0.04, type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30">
                  <ScanFace className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-stone-950/90 border border-emerald-500/40 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                  <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                    Navegação por Face
                  </span>
                </div>
              </motion.button>
            )}

            <motion.button
              onClick={toggleHighContrast}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg ${highContrast ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                <Contrast className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">
                  Alto Contraste
                </span>
              </div>
            </motion.button>

            <motion.button
              onClick={toggleGrayscale}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              transition={{ delay: 0.16, type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg ${grayscale ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                <Eye className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">
                  Monocromático
                </span>
              </div>
            </motion.button>

            <motion.button
              onClick={toggleLargeText}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              transition={{ delay: 0.24, type: "spring", stiffness: 260, damping: 20 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg ${largeText ? 'bg-pink-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
                <Type className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">
                  Aumentar Fonte
                </span>
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={toggleMenu}
        className={`flex items-center justify-center w-12 h-12 rounded-full text-white border transition duration-300 focus:outline-none relative shadow-xl overflow-hidden ${
          isOpen
            ? "bg-black border-pink-500 text-pink-500"
            : "bg-blue-600 border-blue-500 hover:bg-blue-500"
        }`}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-pink-500 relative z-10" />
        ) : (
          <Accessibility className="w-5 h-5 relative z-10" />
        )}
      </motion.button>
    </div>
  );
}
