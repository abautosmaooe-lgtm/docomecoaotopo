import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Compass, Sparkles, X, ChevronRight, ChevronLeft, Volume2, VolumeX,
  Radio, Image as ImageIcon, Users, Award, Megaphone, Newspaper,
  Mic, MapPin, CheckCircle2, ArrowRight, Play, ExternalLink, Handshake
} from "lucide-react";
import { playClickSound, playSuccessSound, speakWithFemaleVoice, stopSpeech } from "../utils/audio";

export interface SiteTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenVoiceAgent?: () => void;
}

interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  tag: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  details: string[];
  callToAction: string;
  sectionTargetId?: string;
  actionType?: "navigate" | "voice_agent" | "link";
  externalUrl?: string;
}

export default function SiteTourModal({
  isOpen,
  onClose,
  onNavigateSection,
  onOpenVoiceAgent,
}: SiteTourModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVoiceNarrating, setIsVoiceNarrating] = useState(false);
  const isMountedRef = useRef(true);

  const TOUR_STEPS: TourStep[] = [
    {
      id: "intro",
      stepNumber: 1,
      title: "Bem-vindo ao Portal Do Começo ao Topo",
      tag: "O ECOSSISTEMA",
      badgeColor: "bg-green-500/20 text-green-300 border-green-500/40",
      icon: Compass,
      description: "O maior hub de negócios, liderança, empreendedorismo e inovação de Juiz de Fora e Sudeste de Minas. Uma plataforma completa desenvolvida para conectar empresas, investidores e talentos.",
      details: [
        "Comunicação & Marketing de negócios em tempo real",
        "Comunidade empresarial e rodadas de networking",
        "Podcasts com fundadores e executivos de ponta",
        "Acessibilidade de última geração e Inteligência Artificial"
      ],
      callToAction: "Iniciar Tour Guiado",
    },
    {
      id: "noticias",
      stepNumber: 2,
      title: "Feed de Notícias & Coberturas em Tempo Real",
      tag: "COMUNICAÇÃO & MARKETING B2B",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      icon: Newspaper,
      description: "Acompanhe as principais novidades, estratégias de marketing, fusões, captações de startups, eventos de inovação e análises econômicas com foco regional e impacto nacional.",
      details: [
        "Filtros segmentados por temas (Startups, Varejo, Indústria, Gestão)",
        "Destaques em carrossel dinâmico",
        "Leitor inteligente com síntese de voz",
        "Coberturas com matérias aprofundadas"
      ],
      callToAction: "Ver Feed de Notícias",
      sectionTargetId: "NOTICIAS",
      actionType: "navigate",
    },
    {
      id: "podcasts",
      stepNumber: 3,
      title: "Podcasts & Entrevistas em Vídeo",
      tag: "MULTIMÍDIA & YOUTUBE",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      icon: Radio,
      description: "Episódios completos com grandes líderes de mercado compartilhando suas trajetórias, desafios e estratégias que os levaram do começo ao topo.",
      details: [
        "Player multimídia integrado para episódios em vídeo no YouTube",
        "Biblioteca de cortes e episódios na íntegra",
        "Transcrições e destaques de cada bate-papo",
        "Notificações de novos lançamentos semanais"
      ],
      callToAction: "Ouvir Podcasts",
      sectionTargetId: "PODCAST",
      actionType: "navigate",
    },
    {
      id: "galeria",
      stepNumber: 4,
      title: "Galeria de Eventos & Encontros de Negócios",
      tag: "EXPERIÊNCIAS & FOTOS",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      icon: ImageIcon,
      description: "Coberturas fotográficas oficiais em alta definição de summits, jantares empresariais, feiras de inovação e premiações da região.",
      details: [
        "Álbuns com visualizador imersivo em tela cheia",
        "Download de fotos oficiais para imprensa e participantes",
        "Agenda dos próximos eventos do ecossistema",
        "Confirmação de presença (RSVP) direta no portal"
      ],
      callToAction: "Explorar Galeria",
      sectionTargetId: "GALERIA",
      actionType: "navigate",
    },
    {
      id: "comunidade",
      stepNumber: 5,
      title: "Comunidade VIP & Clube de Membros",
      tag: "NETWORKING QUALIFICADO",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      icon: Users,
      description: "Um seleto grupo de empresários, executivos e empreendedores com acesso a rodadas de negócios exclusivas, encontros mensais e mentorias.",
      details: [
        "Rodadas de negócios com geração de parcerias e vendas",
        "Diretório exclusivo de membros e empresas filiadas",
        "Descontos e condições especiais em serviços parceiros",
        "Canal direto de comunicação e matchmaking executivo"
      ],
      callToAction: "Conhecer a Comunidade VIP",
      sectionTargetId: "COMUNIDADE",
      actionType: "navigate",
    },
    {
      id: "embaixadores",
      stepNumber: 6,
      title: "Conselho de Embaixadores",
      tag: "GOVERNANÇA & LIDERANÇA",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
      icon: Award,
      description: "Conheça as personalidades e lideranças empresariais de destaque que compõem o conselho institucional do Portal Do Começo ao Topo.",
      details: [
        "Perfis executivos e trajetórias de impacto",
        "Participação ativa nos comitês temáticos",
        "Curadoria de conteúdo e eventos de alto padrão"
      ],
      callToAction: "Ver Conselho de Embaixadores",
      sectionTargetId: "EMBAIXADORES",
      actionType: "navigate",
    },
    {
      id: "parceiros",
      stepNumber: 7,
      title: "Marcas Parceiras & Ecossistema",
      tag: "ECOSSISTEMA REGIONAL",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      icon: Handshake,
      description: "Conheça as empresas, apoiadores e marcas que fortalecem e impulsionam o desenvolvimento empresarial no Sudeste.",
      details: [
        "Apresentação oficial de marcas líderes",
        "Conexão direta com sites e serviços",
        "Apoio ao fomento regional e cultural"
      ],
      callToAction: "Ver Marcas Parceiras",
      sectionTargetId: "PARCEIROS",
      actionType: "navigate",
    },
    {
      id: "topina-voz",
      stepNumber: 8,
      title: "Topina IA: Agente de Voz & Acessibilidade Total",
      tag: "INOVAÇÃO & INCLUSÃO",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/40",
      icon: Mic,
      description: "Nossa agente inteligente por voz feminina e assistente de inteligência artificial pronta para responder dúvidas, ler notícias e navegar pelo portal.",
      details: [
        "Conversação contínua hands-free por comando de voz",
        "Navegação facial e por gestos manuais (Motion Nav)",
        "Ajustes de contraste, tamanho de fonte e leitor de tela",
        "Conexão direta com o WhatsApp da redação"
      ],
      callToAction: "Conversar com a Topina (Voz)",
      actionType: "voice_agent",
    },
  ];

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Stop speech when component unmounts or modal closes
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopSpeech();
      setIsVoiceNarrating(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") handleNextStep();
      if (e.key === "ArrowLeft") handlePrevStep();
      if (e.key === "Escape") handleCloseTour();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStepIndex]);

  const handleNextStep = () => {
    stopSpeech();
    setIsVoiceNarrating(false);
    playClickSound(800, "sine");
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleCloseTour();
    }
  };

  const handlePrevStep = () => {
    stopSpeech();
    setIsVoiceNarrating(false);
    playClickSound(650, "sine");
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleCloseTour = () => {
    stopSpeech();
    setIsVoiceNarrating(false);
    playClickSound(500, "sine");
    localStorage.setItem("hasSeenSiteTour_v1", "true");
    onClose();
  };

  const handleExecuteStepAction = () => {
    playSuccessSound();
    stopSpeech();
    
    if (currentStep.actionType === "voice_agent") {
      onClose();
      onOpenVoiceAgent?.();
      return;
    }

    if (currentStep.actionType === "navigate" && currentStep.sectionTargetId) {
      onClose();
      onNavigateSection?.(currentStep.sectionTargetId);
      return;
    }

    handleNextStep();
  };

  const toggleVoiceNarration = () => {
    if (isVoiceNarrating) {
      stopSpeech();
      setIsVoiceNarrating(false);
      playClickSound(500, "sine");
    } else {
      playClickSound(900, "sine");
      setIsVoiceNarrating(true);

      const narrationText = `${currentStep.title}. ${currentStep.description}`;
      speakWithFemaleVoice(
        narrationText,
        () => {
          if (isMountedRef.current) setIsVoiceNarrating(true);
        },
        () => {
          if (isMountedRef.current) setIsVoiceNarrating(false);
        },
        () => {
          if (isMountedRef.current) setIsVoiceNarrating(false);
        }
      );
    }
  };

  if (!isOpen) return null;

  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl bg-zinc-950 border-2 border-green-500/40 rounded-3xl shadow-[0_0_60px_rgba(34,197,94,0.3)] overflow-hidden flex flex-col relative font-sans text-left"
      >
        {/* TOP PROGRESS BAR */}
        <div className="w-full bg-zinc-900 h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* HEADER BAR */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shadow-inner">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-white text-base tracking-wider uppercase">
                  TOUR PELO PORTAL
                </h3>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                  Etapa {currentStepIndex + 1} de {TOUR_STEPS.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Conheça os principais recursos e seções exclusivas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Narration Button */}
            <button
              onClick={toggleVoiceNarration}
              className={`p-2 rounded-xl border transition flex items-center gap-1.5 text-xs font-mono font-bold ${
                isVoiceNarrating
                  ? "bg-pink-500/20 text-pink-300 border-pink-500/50 animate-pulse"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
              title={isVoiceNarrating ? "Pausar Narração Feminina" : "Ouvir com Voz Feminina da Topina"}
            >
              {isVoiceNarrating ? (
                <>
                  <VolumeX className="w-4 h-4 text-pink-400" />
                  <span className="hidden sm:inline">Pausar Voz</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  <span className="hidden sm:inline">Narrar em Voz</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={handleCloseTour}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition"
              title="Fechar Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="p-6 sm:p-7 flex flex-col gap-5 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* Step Tag & Icon */}
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full border ${currentStep.badgeColor}`}>
              {currentStep.tag}
            </span>

            <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-green-400 shadow-md">
              <StepIcon className="w-6 h-6" />
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-snug">
              {currentStep.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-300 leading-relaxed font-sans">
              {currentStep.description}
            </p>
          </div>

          {/* Key Bullet Highlights */}
          {currentStep.details && currentStep.details.length > 0 && (
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-2">
              <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">
                Destaques desta seção:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStep.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-zinc-200">
                    <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BAR WITH NAVIGATION CONTROLS */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/90 bg-zinc-900/95 flex items-center justify-between gap-3">
          {/* Step Dots indicator */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => {
                  stopSpeech();
                  setIsVoiceNarrating(false);
                  playClickSound(700, "sine");
                  setCurrentStepIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentStepIndex
                    ? "w-6 h-2 bg-green-400"
                    : "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={`Ir para etapa ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={handlePrevStep}
                className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-mono font-bold uppercase transition flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
            )}

            {/* Direct Section Action if available */}
            {currentStep.actionType && (
              <button
                onClick={handleExecuteStepAction}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-green-400 border border-green-500/40 text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 shadow-sm"
              >
                <span>{currentStep.callToAction}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Next or Finish Button */}
            <button
              onClick={handleNextStep}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-mono font-black uppercase transition flex items-center gap-1.5 shadow-lg shadow-green-500/30"
            >
              <span>{currentStepIndex === TOUR_STEPS.length - 1 ? "Concluir Tour" : "Próximo"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
