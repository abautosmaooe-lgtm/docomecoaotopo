"use client"

import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { buttonVariants } from "./button"
import { Calendar, Clock, MapPin, Edit3, Check, X, Eye, EyeOff, Sparkles, Rocket } from "lucide-react"
import { cn } from "../../lib/utils"

interface EventCountdownCardProps {
  title?: string
  subtitle?: string
  date?: Date
  presentationDate?: Date
  image?: string
  attendees?: number
  onJoin?: () => void
  onOpenTour?: () => void
  buttonText?: string
  showButton?: boolean
  enableAnimations?: boolean
  className?: string
  isEditable?: boolean
}

export function EventCountdownCard({
  title = "Lançamento Portal",
  subtitle = "Dia 17 Agosto | 19h",
  date = new Date("2026-08-17T19:30:00-03:00"),
  presentationDate = new Date("2026-08-17T20:00:00-03:00"),
  image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRYer0HiBG4YMv-tueznhCQeXqIJ52gc8_vru2u9_MR_L64O_2dCG98yfD&s=10", 
  attendees = 0,
  onJoin,
  onOpenTour,
  buttonText: initialButtonText,
  showButton: initialShowButton = true,
  enableAnimations = true,
  className,
  isEditable = false,
}: EventCountdownCardProps) {
  // Stable event dates
  const [eventDate] = useState(() => date)
  const [presentationEventDate] = useState(() => presentationDate)

  // Custom button configuration stored in localStorage
  const [btnText, setBtnText] = useState(() => {
    if (initialButtonText) return initialButtonText;
    const saved = localStorage.getItem("event_card_button_text");
    return saved || "Confirmar Presença";
  });

  const [btnVisible, setBtnVisible] = useState(() => {
    const saved = localStorage.getItem("event_card_button_visible");
    if (saved !== null) return saved === "true";
    return initialShowButton;
  });

  // Editing state modal
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [tempText, setTempText] = useState(btnText);
  const [tempVisible, setTempVisible] = useState(btnVisible);
  
  // Phase management
  const [isTopoPhase, setIsTopoPhase] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  useEffect(() => {
    if (initialButtonText) {
      setBtnText(initialButtonText);
    }
  }, [initialButtonText]);

  const handleSaveButtonConfig = () => {
    setBtnText(tempText);
    setBtnVisible(tempVisible);
    localStorage.setItem("event_card_button_text", tempText);
    localStorage.setItem("event_card_button_visible", String(tempVisible));
    setIsEditingModalOpen(false);
  };

  useEffect(() => {
    const target1 = date || eventDate;
    const target2 = presentationDate || presentationEventDate;
    
    const update = () => {
      const now = Date.now();
      const t1 = +target1;
      const t2 = +target2;

      if (now < t1) {
        // Phase 1: Countdown to 19:30
        setIsTopoPhase(false);
        setIsFinished(false);
        setTimeLeft(Math.max(0, Math.floor((t1 - now) / 1000)));
      } else if (now >= t1 && now < t2) {
        // Phase 2: TOPO + Countdown to Presentation Start (20:00)
        setIsTopoPhase(true);
        setIsFinished(false);
        setTimeLeft(Math.max(0, Math.floor((t2 - now) / 1000)));
      } else {
        // Phase 3: Presentation started
        setIsTopoPhase(true);
        setIsFinished(true);
        setTimeLeft(0);
      }
    };
    
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date, eventDate, presentationDate, presentationEventDate]);

  const getTimeUnits = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return { days, hours, minutes, seconds: secs };
  };

  const { days, hours, minutes, seconds } = getTimeUnits(timeLeft);

  const containerVariants = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
        mass: 0.8,
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    },
    rest: { 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate ? { 
      scale: 1.03, 
      y: -6,
      filter: "blur(0px)",
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 30, 
        mass: 0.8,
      }
    } : {},
  };

  const numberVariants = {
    initial: { scale: 1, opacity: 1 },
    pulse: shouldAnimate ? {
      scale: [1, 1.15, 1],
      opacity: [1, 0.7, 1],
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    } : {},
  };

  const childVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      filter: "blur(4px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 28,
        mass: 0.6,
      },
    },
  };

  const buttonVariants_motion = {
    hidden: {
      opacity: 0,
      y: 15,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25,
        mass: 0.7,
      },
    },
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate ? { 
      scale: 1.05, 
      y: -2,
      transition: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 25 
      }
    } : {},
    tap: shouldAnimate ? { scale: 0.95 } : {},
  };

  return (
    <motion.div
      data-slot="event-countdown-card"
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-full max-w-sm mx-auto rounded-2xl border bg-stone-950 text-white overflow-hidden shadow-2xl shadow-black/50 cursor-pointer group",
        isTopoPhase ? "border-yellow-500/60 shadow-[0_0_40px_rgba(234,179,8,0.2)]" : "border-zinc-800",
        className
      )}
    >
      {/* Image Container */}
      <motion.div 
        className="relative overflow-hidden"
        variants={shouldAnimate ? childVariants : {}}
      >
        <motion.img 
          src={image} 
          alt={title} 
          className="h-48 w-full object-cover"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 30 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />
        
        {/* Urgency Badge or TOPO Badge */}
        {isTopoPhase ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black font-display shadow-lg shadow-yellow-500/30 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>TOPO ATIVO</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold"
          >
            É hoje!
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      <div className="p-6 space-y-5 -mt-8 relative z-10">
        {/* Title & Meta */}
        <motion.div 
          className="space-y-3"
          variants={shouldAnimate ? childVariants : {}}
        >
          <div className="flex items-center justify-between gap-2">
            <motion.h3 
              className="text-lg font-bold leading-tight tracking-tight text-white"
              initial={{ opacity: 0.9 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h3>
            {isTopoPhase && (
              <span className="bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 px-2 py-0.5 rounded text-[10px] font-mono font-black animate-pulse">
                TOPO
              </span>
            )}
          </div>

          {subtitle && (
            <p className={cn(
              "text-xs font-mono font-semibold tracking-wide uppercase",
              isTopoPhase ? "text-yellow-400" : "text-pink-400"
            )}>
              {isTopoPhase ? "Fase TOPO • Apresentação do Portal" : subtitle}
            </p>
          )}
          <p className="text-xs text-zinc-400 leading-relaxed">
            Conectando empreendedoras, Oportunidades e Crescimento.
          </p>
          
          <div className="flex flex-col gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className={cn("w-4 h-4", isTopoPhase ? "text-yellow-400" : "text-pink-500")} />
              <span>17 de Agosto, Segunda-feira, 19:30</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <MapPin className={cn("w-4 h-4 shrink-0 mt-0.5", isTopoPhase ? "text-yellow-400" : "text-pink-500")} />
                <span>
                  ROSSI 360 HOME & BUSINESS<br/>
                  Auditório do Office 360 – Estrela Sul<br/>
                  <span className="text-[10px] text-zinc-500">(ao lado do estacionamento do Independência Shopping)</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Countdown Display */}
        {!isFinished ? (
          <motion.div 
            className="space-y-3 pt-2"
            variants={shouldAnimate ? childVariants : {}}
          >
            <div className={cn(
              "flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest",
              isTopoPhase ? "text-yellow-400" : "text-pink-400"
            )}>
              <Clock className="w-3.5 h-3.5" />
              <span>{isTopoPhase ? "Início da Apresentação em:" : "Contagem Regressiva:"}</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: days, label: "Dias" },
                { value: hours, label: "Horas" },
                { value: minutes, label: "Min" },
                { value: seconds, label: "Seg" },
              ].map((unit, index) => (
                <motion.div
                  key={unit.label}
                  variants={index === 3 ? numberVariants : {}} // Only seconds pulse
                  initial="initial"
                  animate={index === 3 ? "pulse" : "initial"}
                  className={cn(
                    "rounded-xl p-2 text-center border",
                    isTopoPhase ? "bg-yellow-950/30 border-yellow-500/30" : "bg-zinc-900/50 border-zinc-800"
                  )}
                >
                  <div className={cn("text-lg font-bold tabular-nums", isTopoPhase ? "text-yellow-300" : "text-white")}>
                    {unit.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-medium uppercase">
                    {unit.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={shouldAnimate ? childVariants : {}}
            className="text-center py-4 bg-green-500/10 rounded-2xl border border-green-500/30 p-4 space-y-2"
          >
            <div className="text-base font-black text-green-400 uppercase tracking-wide flex items-center justify-center gap-2">
              <Rocket className="w-5 h-5 animate-bounce text-green-400" />
              <span>Apresentação Iniciada!</span>
            </div>
            <div className="text-xs text-zinc-300">
              O foguete decolou para o topo. Conheça as novidades no Tour Virtual.
            </div>
            {onOpenTour && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenTour();
                }}
                className="mt-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-black text-xs font-black uppercase rounded-xl transition shadow-md flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
              >
                <span>Abrir Tour Virtual</span>
              </button>
            )}
          </motion.div>
        )}

        {/* Action Button & Customization */}
        <div className="relative pt-1 group/btnContainer">
          {btnVisible ? (
            <div className="relative flex items-center gap-2">
              <motion.button
                onClick={(e) => {
                  if (onJoin) onJoin();
                }}
                variants={buttonVariants_motion}
                initial={shouldAnimate ? "hidden" : "visible"}
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                className={cn(
                  buttonVariants({ variant: "default" }), 
                  "w-full h-11 font-bold text-xs sm:text-sm uppercase tracking-wider text-white shadow-lg border-none cursor-pointer",
                  isTopoPhase 
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:from-yellow-400 hover:to-amber-400 shadow-yellow-500/25 font-black"
                    : "bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 shadow-pink-500/25"
                )}
              >
                {btnText}
              </motion.button>

              {isEditable && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempText(btnText);
                    setTempVisible(btnVisible);
                    setIsEditingModalOpen(true);
                  }}
                  className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-pink-400 rounded-xl border border-zinc-700/80 transition-all shadow-md shrink-0 cursor-pointer"
                  title="Editar texto ou ocultar botão"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            isEditable && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTempText(btnText);
                  setTempVisible(btnVisible);
                  setIsEditingModalOpen(true);
                }}
                className="w-full py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-dashed border-zinc-700 rounded-xl text-xs font-mono text-zinc-400 hover:text-pink-400 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                <span>Editar / Mostrar Botão Rosa</span>
              </button>
            )
          )}
        </div>

        {/* EDIT BUTTON MODAL */}
        {isEditingModalOpen && (
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 text-white select-text"
          >
            <div className="bg-zinc-950 border border-pink-500/40 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 relative">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-pink-500" />
                  <h4 className="font-display font-bold text-sm uppercase tracking-wider">
                    Editar Botão do Evento
                  </h4>
                </div>
                <button 
                  onClick={() => setIsEditingModalOpen(false)}
                  className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase text-zinc-300 block">
                  Texto do Botão
                </label>
                <input
                  type="text"
                  value={tempText}
                  onChange={(e) => setTempText(e.target.value)}
                  placeholder="Ex: Confirmar Presença, Preencha o Formulário..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500 transition"
                />
                <p className="text-[10px] text-zinc-500 font-sans">
                  Altere o texto exibido no botão do card de evento.
                </p>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold uppercase text-zinc-200 block">
                    Exibir Botão
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    {tempVisible ? "O botão está visível" : "O botão está oculto"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTempVisible(!tempVisible)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition cursor-pointer ${
                    tempVisible 
                      ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  {tempVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Visível
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Oculto
                    </>
                  )}
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingModalOpen(false)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs font-mono uppercase transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveButtonConfig}
                  className="px-5 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-mono text-xs font-bold uppercase rounded-xl transition shadow-lg shadow-pink-500/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
