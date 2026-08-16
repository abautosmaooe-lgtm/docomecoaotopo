import React, { useState, useRef, useEffect } from "react";
import { Youtube, Play, Sparkles, Radio, Star, Volume2, VolumeX, ShieldCheck, ArrowRight, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
import { toast } from "sonner";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface HeroVideoSliderProps {
  isDarkMode: boolean;
  onCtaClick?: (link: string) => void;
  onSelectCategory?: (category: any) => void;
}

export default function HeroVideoSlider({ isDarkMode, onCtaClick, onSelectCategory }: HeroVideoSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // 3D Motion Tilt Values for Event Card
  const cardX = useMotionValue(0.5);
  const cardY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(cardY, [0, 1], [10, -10]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(cardX, [0, 1], [-10, 10]), { stiffness: 250, damping: 25 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    cardX.set((e.clientX - rect.left) / rect.width);
    cardY.set((e.clientY - rect.top) / rect.height);
  };

  const handleCardMouseLeave = () => {
    cardX.set(0.5);
    cardY.set(0.5);
  };

  // Screen size detection to filter out events slide on mobile only
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dynamic Vite asset URL resolver for the AI-generated high-resolution background asset
  const podcastHeroBg = new URL("../assets/images/podcast_hero_bg_1779411849623.png", import.meta.url).href;

  const SLIDES = [
    {
      id: "podcast",
      tag: "Canal Oficial & Portal",
      starText: "Portal em Destaque",
      title: "DO COMEÇO AO TOPO - O PORTAL",
      description: "O maior portal de cultura, negócios e curadoria inteligente do sudeste de Minas Gerais. Descubra mentores inovadores de nossa rede, aprenda a transformar jornadas corporativas do absoluto começo ao topo e assista aos cortes mais comentados no YouTube.",
      ctaText: "INSCREVER-SE NO CANAL",
      ctaLink: "https://www.youtube.com/@podcastdocome%C3%A7oaotopo",
      isExternal: true,
      bgType: "video",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      bgUrl: podcastHeroBg,
      statNumber: "4.9k+",
      statLabel: "Inscritos",
      statNumber2: "Sudeste",
      statLabel2: "Rede Multiponto",
      categoryLink: undefined,
    },
    {
      id: "jfsummit",
      tag: "Negócios & Networking",
      starText: "Grande Evento Regional",
      title: "JF SUMMIT - 4ª EDIÇÃO",
      description: "O maior evento de empreendedorismo, inovação e networking de Juiz de Fora e região. Conecte-se com mentes brilhantes, palestrantes de alto nível e as principais marcas do mercado para acelerar o seu negócio.",
      ctaText: "GARANTIR INGRESSO",
      ctaLink: "https://jfsummit.com.br/",
      isExternal: true,
      bgType: "video",
      videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
      bgUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1280",
      statNumber: "4ª Edição",
      statLabel: "Evento Oficial",
      statNumber2: "Networking",
      statLabel2: "Polo de Inovação",
      categoryLink: undefined,
    },
    {
      id: "palestra-flavia-reis",
      tag: "Palestra Online • 12/09",
      starText: "Vagas Limitadas",
      title: "REFORMA TRIBUTÁRIA COM FLÁVIA REIS",
      description: "Entenda o presente. Antecipe o futuro. Um panorama completo sobre as transformações fiscais e os impactos para empresas com a especialista Flávia Reis (9h às 12h, R$ 30,00).",
      ctaText: "INSCREVER VIA WHATSAPP (32) 99110-9437",
      ctaLink: "https://wa.me/553291109437?text=Ol%C3%A1%20Fl%C3%A1via!%20Vi%20a%20divulga%C3%A7%C3%A3o%20no%20Portal%20Do%20Come%C3%A7o%20ao%20Topo%20e%20gostaria%20de%20garantir%20minha%20inscri%C3%A7%C3%A3o%20na%20Palestra%20Reforma%20Tribut%C3%A1ria.",
      isExternal: true,
      bgType: "image",
      bgUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1280",
      statNumber: "R$ 30,00",
      statLabel: "Investimento",
      statNumber2: "12/09 • 9h",
      statLabel2: "Online 3h",
      categoryLink: undefined,
    },
    {
      id: "unicornsummit",
      tag: "Inovação & Startups",
      starText: "Encontro Internacional",
      title: "UNICORN SUMMIT SOUTH AMERICA 2026",
      description: "Juiz de Fora será palco, de 30 de agosto a 2 de setembro, do encontro internacional que conecta líderes globais, investidores e pesquisadores para acelerar os próximos unicórnios.",
      ctaText: "SAIBA MAIS & INSCREVA-SE",
      ctaLink: "https://sa.unicornsummit.net/?utm_source=chatgpt.com",
      isExternal: true,
      bgType: "video",
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      bgUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1280",
      statNumber: "30 Ago - 02 Set",
      statLabel: "Juiz de Fora",
      statNumber2: "Global",
      statLabel2: "Next Unicorns",
      categoryLink: undefined,
    }
  ];

  const activeSlides = SLIDES;

  // Keep currentSlide within activeSlides bounds when transitioning screen widths
  useEffect(() => {
    if (currentSlide >= activeSlides.length) {
      setCurrentSlide(0);
    }
  }, [activeSlides.length, currentSlide]);

  const nextSlide = () => {
    playClickSound(800, "sine");
    setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    playClickSound(650, "sine");
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  // Auto alternation timer resetting whenever currentSlide changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev === activeSlides.length - 1 ? 0 : prev + 1));
    }, 8500);
    return () => clearTimeout(timer);
  }, [currentSlide, activeSlides.length]);

  // Reset video error on slide change so new slides try loading their video
  useEffect(() => {
    setVideoError(false);
  }, [currentSlide]);

  // Sync video element properties when currentSlide or isMuted changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = 1.0;
      if (!isMuted) {
        videoRef.current.play().catch((e) => console.warn("Video play error:", e));
      }
    }
  }, [currentSlide, isMuted]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (nextMuted) {
      playClickSound(400, "sine");
      toast.info("Som do vídeo mutado", { id: "video-mute-toast" });
    } else {
      playSuccessSound();
      toast.success("Som do vídeo ativado!", { id: "video-mute-toast" });
    }

    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = 1.0;
      if (!nextMuted) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Unmute play blocked by browser:", err);
          });
        }
      }
    }
  };

  const handleCtaClick = (slide: typeof SLIDES[0], e: React.MouseEvent) => {
    playClickSound(900, "sine");
    if (!slide.isExternal && slide.categoryLink && onSelectCategory) {
      e.preventDefault();
      onSelectCategory(slide.categoryLink);
      
      // Smooth scroll below the hero slider
      const targetElement = document.getElementById("articles-dashboard-heading") || document.getElementById("newsletter-section-anchor");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 560, behavior: "smooth" });
      }
    } else if (slide.isExternal && onCtaClick) {
      if (slide.ctaLink) {
        onCtaClick(slide.ctaLink);
      }
    }
  };

  return (
    <div
      id="cinematic-hero-section-root"
      className={`relative w-full rounded-3xl overflow-hidden border transition-all duration-500 shadow-2xl ${
        isDarkMode 
          ? "border-zinc-800 bg-stone-950" 
          : "border-stone-200 bg-stone-100"
      }`}
      style={{ minHeight: "480px" }}
    >
      
      {/* 1. LAYER DE SELEÇÃO E CONTROLE DOS BACKGROUNDS */}
      <div className="absolute inset-0 w-full h-full overflow-hidden select-none z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`slide-bg-${activeSlides[currentSlide].id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full bg-black/40"
          >
            {/* Imagem de Fallback de Fundo se o vídeo não carregar de jeito nenhum ou estiver em carregamento */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 z-[-1]"
              style={{ 
                backgroundImage: `url(${activeSlides[currentSlide].bgUrl})` 
              }}
            />

            {/* Elemento de Vídeo Automanuseado com Loop, Autoplay, Muted e PlaysInline */}
            {!videoError ? (
              <video
                ref={videoRef}
                key={activeSlides[currentSlide].videoUrl}
                autoPlay
                loop
                muted={isMuted}
                preload="auto"
                playsInline
                onError={() => setVideoError(true)}
                poster={activeSlides[currentSlide].bgUrl}
                className={`w-full h-full object-cover scale-102 transition-all duration-700 pointer-events-none ${
                  isDarkMode ? "opacity-35 saturate-[1.1]" : "opacity-20 saturate-[0.8]"
                }`}
              >
                <source 
                  src={activeSlides[currentSlide].videoUrl} 
                  type="video/mp4" 
                />
                Seu navegador não suporta vídeos em HTML5.
              </video>
            ) : (
              <img
                src={activeSlides[currentSlide].bgUrl}
                alt={activeSlides[currentSlide].title}
                className="w-full h-full object-cover opacity-50 saturate-[1.1] transition-all duration-700"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* OVERLAYS CINEMATOGRÁFICOS DE COBERTURA */}
        {/* Gradient Overlay Principal - Garante que todo o texto no card e no topo fique ultralegível */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-stone-950/75 to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-stone-950/35 to-transparent z-1" />
        
        {/* Grade Cibernética Neon / Linhas de Escaneamento sutis para textura visual premium */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50 z-2"></div>
      </div>

      {/* 2. BOTÕES DE CONTROLE DE PASSAGEM (SETAS ESQUERDA E DIREITA) */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-[#22c55e] hover:text-black hover:border-[#22c55e] transition-all duration-300 scale-90 hover:scale-105 active:scale-95 focus:outline-none shadow-lg group"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/60 border border-white/10 text-white hover:bg-[#22c55e] hover:text-black hover:border-[#22c55e] transition-all duration-300 scale-90 hover:scale-105 active:scale-95 focus:outline-none shadow-lg group"
        aria-label="Próximo slide"
      >
        <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
      </button>

      {/* 3. PAINEL DE CONTEÚDO REPRODUZÍVEL - LAYOUT GLASSMORPHISM */}
      <div className="relative z-10 w-full h-full px-6 py-10 md:px-16 md:py-12 flex flex-col justify-between items-start min-h-[480px]">
        
        {/* LINHA SUPERIOR: TAGS E INDICADORES DE TRANSMISSÃO */}
        <div className="w-full flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Indicador pulsante do slide ativo */}
            <div className="flex items-center gap-1.5 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-red-500/35 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-[9px] font-mono font-black tracking-widest text-red-500 uppercase">
                {activeSlides[currentSlide].id === "podcast" ? "PODCAST NO AR" : "DESTAQUE PORTAL"}
              </span>
            </div>

            {/* Selo Curadoria Premium */}
            <div className="hidden sm:flex items-center gap-1 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-zinc-800 text-[10px] font-mono font-bold text-zinc-300">
              <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>PORTAL DE NEGÓCIOS</span>
            </div>
          </div>

          {/* CONTROLES DE ÁUDIO FLUTUANTE (Exibido apenas no slide do Podcast / vídeo) */}
          {activeSlides[currentSlide].bgType === "video" && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className={`p-2.5 rounded-xl border backdrop-blur-md transition-all scale-100 hover:scale-105 active:scale-95 ${
                  !isMuted 
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.35)]" 
                    : "bg-black/80 hover:bg-black text-zinc-300 border-zinc-800 hover:text-white"
                }`}
                title={isMuted ? "Ativar som do teaser em vídeo" : "Mutar som do vídeo"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* PARTE INFERIOR: CARTÃO DE GLASSMORPHISM ULTRA APRESENTÁVEL COM TILT 3D */}
        <div className="w-full mt-auto pt-16 max-w-3xl [perspective:1200px]">
          
          {/* AnimatePresence para suavizar a transição de conteúdo textual por slide */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`slide-card-${currentSlide}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-lg p-6 md:p-8 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:-z-1 transition-shadow duration-300 hover:shadow-[0_25px_60px_rgba(34,197,94,0.2)]"
            >
              
              {/* Linhas decorativas do topo */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#22c55e]/50 to-transparent"></div>
              
              {/* Detalhes de Informação e Badge (3D translateZ) */}
              <div className="flex flex-wrap items-center gap-3 [transform:translateZ(20px)]">
                <span className="px-2.5 py-1 rounded bg-[#22c55e]/15 border border-[#22c55e]/30 text-[9px] font-mono font-black tracking-widest text-[#22c55e] uppercase">
                  {activeSlides[currentSlide].tag}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-zinc-300 font-mono">
                  <Star className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                  <span>{activeSlides[currentSlide].starText}</span>
                </span>
              </div>

              {/* TÍTULO CINEMATOGRÁFICO DE CABEÇALHO (3D translateZ) */}
              <div className="space-y-2 [transform:translateZ(30px)]">
                <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-none uppercase">
                  {activeSlides[currentSlide].title}
                </h2>
                <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
                  {activeSlides[currentSlide].description}
                </p>
              </div>

              {/* BOTÕES DE CALL TO ACTION INTEGRADOS (3D translateZ) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2 [transform:translateZ(40px)]">
                
                {/* Botão de Redirecionamento principal */}
                {activeSlides[currentSlide].isExternal ? (
                  <a
                    href={activeSlides[currentSlide].ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      if (onCtaClick && activeSlides[currentSlide].ctaLink) {
                        onCtaClick(activeSlides[currentSlide].ctaLink);
                      }
                    }}
                    className="px-6 py-4 bg-[#22c55e] hover:bg-[#1ebd52] text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                  >
                    {activeSlides[currentSlide].ctaLink?.includes("youtube") ? (
                      <Youtube className="w-5 h-5 fill-current shrink-0" />
                    ) : (
                      <ExternalLink className="w-4 h-4 shrink-0 stroke-[2.5]" />
                    )}
                    <span>{activeSlides[currentSlide].ctaText}</span>
                  </a>
                ) : (
                  <button
                    onClick={(e) => handleCtaClick(activeSlides[currentSlide], e)}
                    className="px-6 py-4 bg-[#22c55e] hover:bg-[#1ebd52] text-black font-mono font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2.5 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
                  >
                    <Play className="w-4 h-4 fill-current shrink-0" />
                    <span>{activeSlides[currentSlide].ctaText}</span>
                  </button>
                )}

                {/* Botão Secundário de visualização rápida */}
                <button
                  onClick={nextSlide}
                  className="px-5 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-mono font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <span>PRÓXIMO DESTAQUE</span>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </button>

                {/* Estatísticas do Slide Ativo */}
                <div className="ml-0 sm:ml-auto flex items-center gap-3 text-zinc-400 font-mono text-[10px]">
                  <div className="text-center sm:text-right border-l sm:border-l-0 sm:border-r border-zinc-800/60 px-3">
                    <span className="block text-white font-black text-sm">{activeSlides[currentSlide].statNumber}</span>
                    <span>{activeSlides[currentSlide].statLabel}</span>
                  </div>
                  <div className="text-center sm:text-right">
                    <span className="block text-white font-black text-sm">{activeSlides[currentSlide].statNumber2}</span>
                    <span>{activeSlides[currentSlide].statLabel2}</span>
                  </div>
                </div>

              </div>

            </motion.div>
          </AnimatePresence>

          {/* DOTS DE NAVEGAÇÃO DOS SLIDES */}
          <div className="flex items-center gap-2 mt-4 ml-2">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  playClickSound(700 + (idx * 40), "sine");
                  setCurrentSlide(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx 
                    ? "w-8 bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                    : "w-2 bg-neutral-600 hover:bg-neutral-400"
                }`}
                aria-label={`Ir para o slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
