import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Youtube, Instagram, MessageCircle, X, Share2, Sparkles, Accessibility, Eye, Type, Contrast, ScanFace, Hand, Mic, Volume2, Compass, Languages } from "lucide-react";
import { useEffect } from "react";
import { playClickSound } from "../utils/audio";

export default function SocialFloatingMenu({
  isCollapsed = false,
  onOpenFaceNav,
  onOpenHandNav,
  onOpenVoiceAgent,
  onOpenSiteTour,
}: {
  isCollapsed?: boolean;
  onOpenFaceNav?: () => void;
  onOpenHandNav?: () => void;
  onOpenVoiceAgent?: () => void;
  onOpenSiteTour?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
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
  
  const handleAccessToggle = () => {
    playClickSound(isAccessOpen ? 600 : 750, "sine");
    setIsAccessOpen(!isAccessOpen);
  };

  const toggleVLibras = () => {
    playClickSound(850, "sine");
    const accessBtn = (
      document.querySelector('[vw-access-button]') ||
      document.querySelector('.access-button') ||
      document.querySelector('[vw] .access-button') ||
      document.querySelector('.vw-access-button') ||
      document.querySelector('div[vw] > div:first-child')
    ) as HTMLElement | null;

    if (accessBtn) {
      accessBtn.click();
    } else {
      const vwWrapper = document.querySelector('[vw-plugin-wrapper]') as HTMLElement | null;
      if (vwWrapper) {
        vwWrapper.classList.toggle('active');
      }
    }
  };


  // Social Links configs
  const SOCIAL_LINKS = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/5532991947690",
      color: "bg-[#25D366] hover:bg-[#20ba56]",
      glowColor: "rgba(37, 211, 102, 0.4)",
      label: "+55 32 99194-7690",
      subtitle: "Fale com a Redação",
      soundFreq: 850,
    },
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://www.instagram.com/podcastdocomecoaotopo/",
      color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:opacity-90",
      glowColor: "rgba(238, 42, 123, 0.4)",
      label: "@podcastdocomecoaotopo",
      subtitle: "Siga nossos Bastidores",
      soundFreq: 950,
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://www.youtube.com/@podcastdocome%C3%A7oaotopo",
      color: "bg-[#FF0000] hover:bg-[#e60000]",
      glowColor: "rgba(255, 0, 0, 0.4)",
      label: "Inscreva-se no Canal",
      subtitle: "Episódios & Shorts",
      soundFreq: 1050,
    },
  ];

  const handleToggle = () => {
    playClickSound(isOpen ? 600 : 750, "sine");
    setIsOpen(!isOpen);
  };

  const handleSocialClick = (freq: number) => {
    playClickSound(freq, "sine");
  };

  if (isCollapsed) return null;

  return (
    <div id="social-floating-menu" className="fixed bottom-[180px] right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 mr-1 mb-1 items-end">
            {SOCIAL_LINKS.map((social, index) => {
              const IconComp = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleSocialClick(social.soundFreq)}
                  initial={{ opacity: 0, scale: 0.8, x: 30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 30 }}
                  transition={{ delay: index * 0.08, type: "spring", stiffness: 260, damping: 20 }}
                  className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
                >
                  {/* Circular Icon button */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${social.color} transition duration-300 shadow-lg relative`}
                    style={{
                      boxShadow: `0 4px 15px ${social.glowColor}`,
                    }}
                  >
                    <IconComp className="w-5 h-5 group-hover:scale-110 transition duration-300" />
                    {/* Pulsing ring indicator */}
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-25"
                      style={{ backgroundColor: social.glowColor }}
                    />
                  </div>

                  {/* Elegant Glassmorphic Label Panel */}
                  <div className="bg-stone-950/90 border border-zinc-800 rounded-2xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md max-w-[190px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none origin-right flex flex-col text-right">
                    <span className="font-display font-black text-[10px] uppercase tracking-widest text-[#22c55e]">
                      {social.name}
                    </span>
                    <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">
                      {social.label}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono mt-0.5">
                      {social.subtitle}
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      
      {/* Accessibility & AI Assistant Sub-menu */}
      <AnimatePresence>
        {isAccessOpen && (
          <div className="flex flex-col gap-3 mr-1 mb-1 items-end">
            {onOpenSiteTour && (
              <motion.button
                onClick={() => { playClickSound(850, "sine"); onOpenSiteTour(); setIsAccessOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-green-600 via-emerald-500 to-teal-500 hover:opacity-90 transition duration-300 shadow-lg shadow-green-500/40 relative">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-black animate-ping" />
                </div>
                <div className="bg-stone-950/90 border border-green-500/50 rounded-xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right flex flex-col">
                  <span className="text-[10.5px] text-green-400 font-bold whitespace-nowrap">Tour pelo Portal 🧭</span>
                  <span className="text-[8.5px] text-zinc-400 font-mono">Conhecer todos os recursos</span>
                </div>
              </motion.button>
            )}

            {onOpenVoiceAgent && (
              <motion.button
                onClick={() => { playClickSound(850, "sine"); onOpenVoiceAgent(); setIsAccessOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 hover:opacity-90 transition duration-300 shadow-lg shadow-pink-500/40 relative">
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black animate-ping" />
                </div>
                <div className="bg-stone-950/90 border border-pink-500/50 rounded-xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right flex flex-col">
                  <span className="text-[10.5px] text-pink-400 font-bold whitespace-nowrap">Agente por Voz (Topina IA)</span>
                  <span className="text-[8.5px] text-zinc-400 font-mono">Conversar em Voz Feminina</span>
                </div>
              </motion.button>
            )}

            {onOpenHandNav && (
              <motion.button
                onClick={() => { playClickSound(800, "sine"); onOpenHandNav(); setIsAccessOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-500 transition duration-300 shadow-lg shadow-emerald-500/30">
                  <Hand className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-stone-950/90 border border-emerald-500/40 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                  <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">Navegação por Mãos</span>
                </div>
              </motion.button>
            )}
            
            {onOpenFaceNav && (
              <motion.button
                onClick={() => { playClickSound(800, "sine"); onOpenFaceNav(); setIsAccessOpen(false); }}
                initial={{ opacity: 0, scale: 0.8, x: 30 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 30 }}
                className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-emerald-600 hover:bg-emerald-500 transition duration-300 shadow-lg shadow-emerald-500/30">
                  <ScanFace className="w-4 h-4 animate-pulse" />
                </div>
                <div className="bg-stone-950/90 border border-emerald-500/40 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                  <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap">Navegação por Face</span>
                </div>
              </motion.button>
            )}
            {/* VLibras - Tradutor de Libras */}
            <motion.button
              onClick={toggleVLibras}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className="w-11 h-11 rounded-full flex flex-col items-center justify-center text-white bg-gradient-to-tr from-[#1B6CA8] via-[#0072CE] to-sky-400 hover:opacity-95 transition duration-300 shadow-lg shadow-blue-500/40 relative border border-sky-300/40">
                {/* Stylized Hands / Sign Language icon */}
                <span className="text-sm select-none">🤟</span>
                <span className="text-[6.5px] font-mono font-extrabold uppercase tracking-tighter text-white">
                  LIBRAS
                </span>
              </div>
              <div className="bg-stone-950/90 border border-sky-500/50 rounded-xl py-1.5 px-3.5 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right flex flex-col">
                <span className="text-[10.5px] text-sky-400 font-bold whitespace-nowrap">Tradutor de Libras (VLibras) 🤟</span>
                <span className="text-[8.5px] text-zinc-400 font-mono">Abrir Intérprete 3D em Sinais</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => { playClickSound(900, "sine"); setHighContrast(!highContrast); }}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg ${highContrast ? 'bg-pink-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
                <Contrast className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">Alto Contraste</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => { playClickSound(950, "sine"); setGrayscale(!grayscale); }}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg ${grayscale ? 'bg-pink-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
                <Eye className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">Monocromático</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => { playClickSound(1000, "sine"); setLargeText(!largeText); }}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg ${largeText ? 'bg-pink-600' : 'bg-blue-600 hover:bg-blue-500'}`}>
                <Type className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">Aumentar Fonte</span>
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Accessibility Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={handleAccessToggle}
        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition duration-300 focus:outline-none relative shadow-xl overflow-hidden mr-1 ${
          isAccessOpen
            ? "bg-black border-pink-500 text-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]"
            : "bg-black border-blue-500 text-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-pink-500/5 opacity-50"></div>
        {isAccessOpen ? (
          <X className="w-5 h-5 relative z-10" />
        ) : (
          <Accessibility className="w-5 h-5 relative z-10" />
        )}
      </motion.button>

      {/* Main Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={handleToggle}
        className={`flex items-center justify-center w-14 h-14 rounded-full bg-black text-white border-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition duration-300 focus:outline-none relative shadow-xl overflow-hidden ${
          isOpen
            ? "border-pink-500 text-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
            : "border-[#22c55e] text-[#22c55e]"
        }`}
      >
        {/* Visual background gradient decoration in trigger */}
        <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-pink-500/5 opacity-50"></div>

        {isOpen ? (
          <X className="w-6 h-6 text-pink-500 relative z-10" />
        ) : (
          <div className="relative flex items-center justify-center z-10">
            <Share2 className="w-6 h-6 text-green-400" />
            <Sparkles className="w-3.5 h-3.5 text-pink-400 absolute -top-1.5 -right-1.5 animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
