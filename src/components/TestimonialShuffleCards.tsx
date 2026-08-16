import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus, 
  X, 
  Save, 
  Image as ImageIcon, 
  Settings, 
  Sparkles, 
  Loader2,
  Quote,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { playClickSound, playSuccessSound, speakWithFemaleVoice, stopSpeech } from "../utils/audio";

export interface Testimonial {
  id: string;
  testimonial: string;
  author: string;
  avatarUrl?: string; // custom uploaded avatar URL or custom link
  avatarId?: number;  // fallback pravatar id
}

export function parseAuthor(authorStr: string) {
  if (!authorStr) return { name: "Leitora", title: "" };
  if (authorStr.includes(" - ")) {
    const parts = authorStr.split(" - ");
    return { name: parts[0].trim(), title: parts.slice(1).join(" - ").trim() };
  }
  if (authorStr.includes(" | ")) {
    const parts = authorStr.split(" | ");
    return { name: parts[0].trim(), title: parts.slice(1).join(" | ").trim() };
  }
  return { name: authorStr.trim(), title: "" };
}

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    testimonial: "Fazer parte do portal de negócios do podcast 'Do Começo ao Topo' tem sido um verdadeiro divisor de águas na minha trajetória. O ambiente de networking é incrível e me permite trocar experiências riquíssimas com outros líderes que transformam o cenário regional todos os dias.",
    author: "Danielle Lara - Mentora e Empresária",
    avatarUrl: "/danielle-profile.jpg",
    avatarId: 1
  },
  {
    id: "t-2",
    testimonial: "Estar presente no portal e participar ativamente das divulgações e eventos me proporcionou uma rede sólida de parcerias e conexões valiosas. É uma honra ver a força do empreendedorismo feminino de toda a região reunida neste ecossistema.",
    author: "Fátima Regina Anthero - Embaixadora do Bem-estar & Saúde",
    avatarUrl: "/regina-profile.jpg",
    avatarId: 5
  },
  {
    id: "t-3",
    testimonial: "O portal 'Do Começo ao Topo' conecta propósitos reais a oportunidades de mercado. A troca contínua entre as leitoras, empresárias e a nossa comunidade gera impacto direto no crescimento dos nossos negócios locais.",
    author: "Jaqueline de Carvalho Dias - Embaixadora & Terapeuta Integrativa",
    avatarUrl: "/jaqueline-profile.jpg",
    avatarId: 9
  },
  {
    id: "t-4",
    testimonial: "Histórias reais têm o poder de transformar começos em grandes conquistas. Este portal é a vitrine definitiva de inspiração, saúde, conhecimento e coragem para quem busca o topo.",
    author: "Bianca Torres - Nutricionista & Embaixadora Inspiração",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    avatarId: 12
  },
  {
    id: "t-5",
    testimonial: "Aceleramos nossos negócios e construímos conexões estratégicas de alto valor. Estar no portal Do Começo ao Topo coloca nossos projetos em evidência para todo o mercado regional.",
    author: "Flávia Reis - Consultora & Especialista Tributária",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    avatarId: 16
  }
];

interface TestimonialCardProps {
  testimonial: Testimonial;
  position: "front" | "middle" | "back" | "hidden";
  handleShuffle: () => void;
  isSpeaking: boolean;
  onToggleSpeech: (e: React.MouseEvent, text: string) => void;
  onOpenDetail?: (t: Testimonial) => void;
}

export function TestimonialCard({ 
  testimonial, 
  position, 
  handleShuffle, 
  isSpeaking, 
  onToggleSpeech,
  onOpenDetail
}: TestimonialCardProps) {
  const dragRef = useRef(0);
  const isFront = position === "front";
  const isMiddle = position === "middle";
  const isBack = position === "back";

  if (position === "hidden") return null;

  // Render direct image URL, or fallback to pravatar if empty
  const avatarSrc = testimonial.avatarUrl 
    ? testimonial.avatarUrl 
    : `https://i.pravatar.cc/128?img=${testimonial.avatarId || 1}`;

  // Parse author into name and title
  const { name: authorName, title: authorTitle } = parseAuthor(testimonial.author);

  // zIndex mapping
  const zIdx = isFront ? 30 : isMiddle ? 20 : isBack ? 10 : 0;

  // rotation styling
  const rotateDeg = isFront ? -6 : isMiddle ? 0 : 6;
  
  // horizontal offset styling (adjust dynamically for clean bento stack)
  const xOffset = isFront ? "0%" : isMiddle ? "12%" : "24%";
  const scaleValue = isFront ? 1 : isMiddle ? 0.95 : 0.9;
  const opacityValue = isFront ? 1 : isMiddle ? 0.85 : 0.7;

  return (
    <motion.div
      style={{
        zIndex: zIdx,
        transformOrigin: "bottom center"
      }}
      animate={{
        rotate: rotateDeg,
        x: xOffset,
        scale: scaleValue,
        opacity: opacityValue
      }}
      drag={isFront ? "x" : false}
      dragElastic={0.4}
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onDragStart={(e: any) => {
        // Handle desktop clientX or touch e.touches[0].clientX
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        dragRef.current = clientX;
      }}
      onDragEnd={(e: any) => {
        const clientX = e.clientX || (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0);
        // If dragged sufficiently to the left, shuffle!
        if (dragRef.current && dragRef.current - clientX > 100) {
          handleShuffle();
        }
        dragRef.current = 0;
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`absolute left-0 top-0 w-full max-w-[320px] sm:max-w-[340px] h-[410px] sm:h-[430px] select-none rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6 flex flex-col justify-between shadow-2xl transition-colors duration-300 ${
        isFront 
          ? "cursor-grab active:cursor-grabbing border-pink-500/40 shadow-pink-950/5 ring-1 ring-pink-500/10" 
          : "border-zinc-900/60"
      }`}
    >
      {/* Glow highlight for the front card */}
      {isFront && (
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-2xl pointer-events-none" />
      )}

      {/* Card Header (Avatar + Tag) */}
      <div className="relative flex items-center justify-between z-10">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatarSrc}
            alt={`Avatar of ${authorName}`}
            className="pointer-events-none h-12 w-12 rounded-full border border-zinc-800 bg-zinc-900 object-cover shadow shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0">
            <span className="text-[9px] font-mono font-bold uppercase text-pink-500 tracking-widest block">DEPOIMENTO</span>
            <h5 className="font-display font-black text-xs sm:text-sm text-zinc-100 truncate leading-snug mt-0.5">
              {authorName}
            </h5>
          </div>
        </div>
        <Quote className="w-7 h-7 text-zinc-800/60 shrink-0 ml-1" />
      </div>

      {/* Card Body (Quote Content - Clickable to open full modal) */}
      <div 
        onClick={(e) => {
          if (isFront && onOpenDetail) {
            e.stopPropagation();
            onOpenDetail(testimonial);
          }
        }}
        className={`relative flex-1 flex flex-col items-center justify-center py-3 z-10 overflow-y-auto px-1 ${
          isFront ? "cursor-pointer group/quote" : ""
        }`}
        title={isFront ? "Clique para ler o depoimento completo" : undefined}
      >
        <p className="text-center font-sans italic text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium group-hover/quote:text-white transition-colors line-clamp-6">
          "{testimonial.testimonial}"
        </p>
        
        {isFront && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenDetail) onOpenDetail(testimonial);
            }}
            className="mt-3 px-3 py-1 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 hover:text-pink-300 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-200 shadow-sm cursor-pointer"
          >
            <Maximize2 className="w-3 h-3 text-pink-400" />
            <span>LER COMPLETO</span>
          </button>
        )}
      </div>

      {/* Card Footer (Author Details + Female TTS Option) */}
      <div className="relative pt-3 border-t border-zinc-900 flex items-center justify-between gap-2 z-10">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-medium text-zinc-400 block truncate" title={authorTitle || "Leitora do Portal"}>
            {authorTitle || "Leitora do Portal"}
          </span>
        </div>

        {/* TTS Toggle Switch */}
        {isFront ? (
          <button
            onClick={(e) => onToggleSpeech(e, `Depoimento de ${testimonial.author}. ${testimonial.testimonial}`)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase border transition duration-250 cursor-pointer shrink-0 ${
              isSpeaking 
                ? "bg-pink-600 border-pink-500 text-white animate-pulse shadow-[0_0_12px_rgba(236,72,153,0.4)]" 
                : "bg-black/80 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-pink-400"
            }`}
            title={isSpeaking ? "Parar áudio" : "Ouvir depoimento em voz feminina"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-spin-slow" />
                <span>PARAR</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-pink-500" />
                <span>OUVIR VOZ 🎙️</span>
              </>
            )}
          </button>
        ) : (
          <div className="w-4 h-4 rounded-full border border-zinc-850 bg-zinc-900 flex items-center justify-center opacity-40">
            <Volume2 className="w-2.5 h-2.5 text-zinc-600" />
          </div>
        )}
      </div>

      {/* Swipe instruction at bottom for the front card */}
      {isFront && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-600 pointer-events-none uppercase tracking-widest hidden sm:block animate-pulse">
          Deslize para a esquerda para girar ➔
        </div>
      )}
    </motion.div>
  );
}

interface TestimonialShuffleCardsProps {
  isDarkMode: boolean;
  isAdmin?: boolean;
}

export default function TestimonialShuffleCards({ isDarkMode, isAdmin = false }: TestimonialShuffleCardsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [positions, setPositions] = useState<string[]>(["front", "middle", "back"]);
  const [readTestimonial, setReadTestimonial] = useState<Testimonial | null>(null);

  // TTS Speech Synthesis Refs
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Admin Modal / Editing form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [formAuthor, setFormAuthor] = useState("");
  const [formTestimonial, setFormTestimonial] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formAvatarId, setFormAvatarId] = useState<number>(1);

  // Load from database on mount
  useEffect(() => {
    fetch("/api/published-data")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const isOutdated = data.testimonials.some((t: Testimonial) => 
            t.author?.includes("Beatriz M.") || t.author?.includes("Juliana F.") || t.author?.includes("JF Móveis")
          );
          const hasDanielle = data.testimonials.some((t: Testimonial) => 
            t.author?.toLowerCase().includes("danielle lara")
          );

          if (isOutdated || !hasDanielle) {
            setTestimonials(DEFAULT_TESTIMONIALS);
            persistTestimonials(DEFAULT_TESTIMONIALS);
          } else {
            setTestimonials(data.testimonials);
          }
        } else {
          setTestimonials(DEFAULT_TESTIMONIALS);
          persistTestimonials(DEFAULT_TESTIMONIALS);
        }
      })
      .catch(() => {
        setTestimonials(DEFAULT_TESTIMONIALS);
      });

    const handleTestimonialsUpdated = () => {
      fetch("/api/published-data")
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
            setTestimonials(data.testimonials);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("testimonials_updated", handleTestimonialsUpdated);

    return () => {
      window.removeEventListener("testimonials_updated", handleTestimonialsUpdated);
    };
  }, []);

  // Initialize SpeechSynthesis reference
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Sync positions array based on testimonials length
  useEffect(() => {
    const listLen = testimonials.length;
    const newPositions = [];
    for (let i = 0; i < listLen; i++) {
      if (i === 0) newPositions.push("front");
      else if (i === 1) newPositions.push("middle");
      else if (i === 2) newPositions.push("back");
      else newPositions.push("hidden");
    }
    setPositions(newPositions);
  }, [testimonials.length]);

  // Cancel any speech on component change or unmount
  const stopSpeech = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Shift front item to the back of the queue
  const handleShuffle = () => {
    playClickSound(700, "sine");
    stopSpeech(); // cancel speaking since card changed

    setTestimonials((prev) => {
      if (prev.length <= 1) return prev;
      const updated = [...prev];
      const front = updated.shift();
      if (front) {
        updated.push(front);
      }
      return updated;
    });
  };

  // Convert text to female voice
  const handleToggleSpeech = (e: React.MouseEvent, fullText: string) => {
    e.stopPropagation();
    const synth = synthRef.current;
    if (!synth) {
      toast.error("Síntese de voz não suportada pelo seu navegador.");
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      playClickSound(550, "sine");
      return;
    }

    playClickSound(800, "sine");
    activeUtteranceRef.current = speakWithFemaleVoice(
      fullText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Open modal & load form
  const openEditorModal = () => {
    playClickSound(800, "sine");
    setIsModalOpen(true);
    if (testimonials.length > 0) {
      loadIntoForm(testimonials[0]);
    } else {
      clearForm();
    }
  };

  const loadIntoForm = (t: Testimonial) => {
    setSelectedId(t.id);
    setFormAuthor(t.author);
    setFormTestimonial(t.testimonial);
    setFormAvatarUrl(t.avatarUrl || "");
    setFormAvatarId(t.avatarId || 1);
  };

  const clearForm = () => {
    setSelectedId(null);
    setFormAuthor("");
    setFormTestimonial("");
    setFormAvatarUrl("");
    setFormAvatarId(Math.floor(Math.random() * 70) + 1);
  };

  // Avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.url) {
              setFormAvatarUrl(data.url);
              playSuccessSound();
              toast.success("Foto de avatar enviada com sucesso!");
            } else {
              toast.error("Erro ao processar imagem.");
            }
          })
          .catch((err) => {
            console.error(err);
            toast.error("Erro ao subir arquivo.");
          })
          .finally(() => {
            setUploadingImage(false);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes and publish to server config
  const handleSave = () => {
    if (!formAuthor.trim() || !formTestimonial.trim()) {
      toast.error("Autor e texto do depoimento são obrigatórios.");
      return;
    }

    const tData: Testimonial = {
      id: selectedId || `t-${Date.now()}`,
      author: formAuthor,
      testimonial: formTestimonial,
      avatarUrl: formAvatarUrl,
      avatarId: formAvatarId
    };

    let updatedList: Testimonial[];
    if (selectedId) {
      updatedList = testimonials.map((t) => (t.id === selectedId ? tData : t));
      toast.success("Depoimento atualizado!");
    } else {
      updatedList = [...testimonials, tData];
      toast.success("Novo depoimento adicionado!");
    }

    persistTestimonials(updatedList);
    setSelectedId(tData.id);
  };

  // Delete testimonial
  const handleDelete = (id: string) => {
    playClickSound(500, "sine");
    const updated = testimonials.filter((t) => t.id !== id);
    persistTestimonials(updated);
    if (selectedId === id) {
      if (updated.length > 0) {
        loadIntoForm(updated[0]);
      } else {
        clearForm();
      }
    }
    toast.success("Depoimento excluído.");
  };

  const persistTestimonials = (newList: Testimonial[]) => {
    setTestimonials(newList);
    fetch("/api/published-data")
      .then((res) => res.json())
      .then((serverData) => {
        const payload = {
          ...serverData,
          testimonials: newList
        };
        fetch("/api/publish-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then((r) => r.json())
          .then((d) => {
            console.log("Testimonials synced with Firestore successfully", d);
          })
          .catch((err) => {
            console.error("Error storing testimonials to remote DB:", err);
            toast.error("Erro ao persistir no Firestore.");
          });
      })
      .catch((err) => console.error("Database query failed:", err));
  };

  return (
    <section id="portal-testimonials-section" className="relative max-w-7xl mx-auto px-4 py-12 select-none overflow-hidden">
      
      {/* Decorative blurred background gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Layout containing text on left, card stack on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left column: Headings, description & admin config callouts */}
        <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>O QUE DIZEM NOSSAS LEITORAS</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white uppercase tracking-tight leading-none">
            Depoimentos &amp; <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-fuchsia-400 to-indigo-500">
              Vozes Femininas
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
            Arraste os cards para a esquerda para ver mais opiniões e histórias de mulheres incríveis, empreendedoras e leitoras do portal que transformam o cenário regional todos os dias. 
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              onClick={handleShuffle}
              disabled={testimonials.length <= 1}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-mono text-[11px] font-black uppercase rounded-xl flex items-center gap-2 transition duration-200 disabled:opacity-50"
            >
              <span>GIRAR CARDS</span>
              <ChevronRight className="w-4 h-4 text-pink-500" />
            </button>

            {isAdmin && (
              <button
                onClick={openEditorModal}
                className="px-5 py-2.5 bg-pink-600/10 hover:bg-pink-600/20 border border-pink-500/30 text-pink-400 font-mono text-[11px] font-black uppercase rounded-xl flex items-center gap-2 transition duration-200"
              >
                <Settings className="w-4 h-4 text-pink-500 animate-spin-slow" />
                <span>GERENCIAR DEPOIMENTOS</span>
              </button>
            )}
          </div>
        </div>

        {/* Right column: Interactive Cards Frame */}
        <div className="lg:col-span-7 flex justify-center py-8 relative">
          {testimonials.length === 0 ? (
            <div className="p-10 text-center border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs w-full max-w-sm">
              Nenhum depoimento cadastrado.
            </div>
          ) : (
            <div className="relative w-full max-w-[320px] sm:max-w-[340px] h-[410px] sm:h-[430px]">
              {testimonials.map((t, index) => (
                <TestimonialCard
                  key={t.id}
                  testimonial={t}
                  position={positions[index] as any}
                  handleShuffle={handleShuffle}
                  isSpeaking={isSpeaking && index === 0}
                  onToggleSpeech={handleToggleSpeech}
                  onOpenDetail={(t) => setReadTestimonial(t)}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* FULL TESTIMONIAL READ MODAL */}
      {readTestimonial && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[9999] p-4 text-white select-text">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-zinc-950 border border-pink-500/30 rounded-3xl w-full max-w-2xl p-6 sm:p-8 flex flex-col relative shadow-[0_0_50px_rgba(236,72,153,0.15)] overflow-hidden"
          >
            {/* Glow corner */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-4">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <img 
                  src={readTestimonial.avatarUrl || `https://i.pravatar.cc/128?img=${readTestimonial.avatarId || 1}`}
                  alt={readTestimonial.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-500/40 shadow-lg shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-mono font-bold uppercase text-pink-500 tracking-widest block">DEPOIMENTO COMPLETO</span>
                  <h3 className="font-display font-black text-base sm:text-lg text-white uppercase truncate">
                    {parseAuthor(readTestimonial.author).name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium truncate">
                    {parseAuthor(readTestimonial.author).title || "Leitora do Portal"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setReadTestimonial(null)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition border border-zinc-800 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 space-y-3 my-2 custom-scrollbar">
              <Quote className="w-9 h-9 text-pink-500/30" />
              <p className="font-sans italic text-sm sm:text-base text-zinc-100 leading-relaxed font-normal whitespace-pre-line">
                "{readTestimonial.testimonial}"
              </p>
            </div>

            {/* Footer controls */}
            <div className="pt-4 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 mt-4">
              <button
                onClick={(e) => handleToggleSpeech(e, `Depoimento de ${readTestimonial.author}. ${readTestimonial.testimonial}`)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono font-bold uppercase border transition cursor-pointer ${
                  isSpeaking 
                    ? "bg-pink-600 border-pink-500 text-white animate-pulse shadow-lg" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-pink-400"
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>PARAR ÁUDIO</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-pink-500" />
                    <span>OUVIR DEPOIMENTO 🎙️</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setReadTestimonial(null)}
                className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-mono text-xs font-bold uppercase rounded-xl transition shadow-lg shadow-pink-500/20 cursor-pointer"
              >
                FECHAR
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADMIN EDITING MODAL FOR TESTIMONIALS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 text-white select-text">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-500 animate-spin-slow" />
                <div>
                  <h3 className="font-display font-bold text-base text-white uppercase tracking-tight">
                    Gerenciador de Depoimentos das Leitoras
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase">
                    Administração em tempo real integrada ao Firebase
                  </p>
                </div>
              </div>
              <button 
                onClick={() => { playClickSound(500, "sine"); setIsModalOpen(false); }}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content split into side list and editor */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
              
              {/* Left Side: Testimonials stack list */}
              <div className="w-full lg:w-2/5 p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">
                    Todos os depoimentos ({testimonials.length})
                  </span>
                  <button
                    onClick={() => { playClickSound(700, "sine"); clearForm(); }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-mono font-black rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADICIONAR</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {testimonials.map((t) => {
                    const isSelected = selectedId === t.id;
                    const avatarSrc = t.avatarUrl ? t.avatarUrl : `https://i.pravatar.cc/128?img=${t.avatarId || 1}`;
                    return (
                      <div
                        key={t.id}
                        onClick={() => loadIntoForm(t)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected 
                            ? "bg-pink-950/20 border-pink-500/50" 
                            : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/70"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={avatarSrc} 
                            alt={t.author} 
                            className="w-9 h-9 rounded-full object-cover border border-zinc-800 bg-zinc-950" 
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-white truncate uppercase">{t.author.split(" - ")[0]}</h5>
                            <span className="text-[9px] text-zinc-400 block truncate">{t.author.split(" - ")[1] || "Leitora"}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                          className="p-1.5 text-zinc-500 hover:text-red-400 transition"
                          title="Remover depoimento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Depoimento editor form */}
              <div className="w-full lg:w-3/5 p-5 space-y-5 overflow-y-auto bg-zinc-950/40">
                <h4 className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {selectedId ? "Editando Depoimento Selecionado" : "Escrever Novo Depoimento"}
                </h4>

                <div className="space-y-4">
                  {/* Author Input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Autor e Cargo / Empresa *
                    </label>
                    <input 
                      type="text" 
                      value={formAuthor}
                      onChange={e => setFormAuthor(e.target.value)}
                      placeholder="Ex: Danielle Lara - Mentora e Empresária"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Testimonial Quote */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Depoimento / Depoimento por escrito *
                    </label>
                    <textarea 
                      value={formTestimonial}
                      onChange={e => setFormTestimonial(e.target.value)}
                      rows={4}
                      placeholder="Ex: Sinto que aprendi tanto com este portal..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  {/* Avatar upload / Custom Avatar selection */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Imagem de Avatar da Leitora
                    </label>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formAvatarUrl}
                        onChange={e => setFormAvatarUrl(e.target.value)}
                        placeholder="Link direto da imagem ou use o envio de arquivo"
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden" 
                      />
                      <button
                        type="button"
                        disabled={uploadingImage}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[10px] uppercase font-bold rounded-xl flex items-center gap-1 transition"
                      >
                        {uploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ImageIcon className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span>ENVIAR ARQUIVO</span>
                      </button>
                    </div>

                    {!formAvatarUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        <span className="text-[9px] font-mono text-zinc-500">Ou selecione uma id padrão do pravatar (1-70):</span>
                        <input 
                          type="number" 
                          min={1} 
                          max={70} 
                          value={formAvatarId}
                          onChange={e => setFormAvatarId(parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-850 rounded-lg text-center font-mono text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Action Controls */}
                <div className="pt-4 border-t border-zinc-900 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-bold rounded-xl transition"
                  >
                    LIMPAR FORMULÁRIO
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-mono font-black rounded-xl flex items-center gap-1.5 shadow-lg transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SALVAR E PUBLICAR</span>
                  </button>
                </div>

                {/* Testimonial preview box */}
                <div className="pt-3 border-t border-zinc-900/60">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-2">Visualização da frente:</span>
                  <div className="relative w-full max-w-[320px] h-[160px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={formAvatarUrl || `https://i.pravatar.cc/128?img=${formAvatarId}`} 
                          alt="preview" 
                          className="w-9 h-9 rounded-full object-cover border border-zinc-800" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="text-[8px] font-mono text-pink-500 font-bold block">PREVIEW</span>
                          <h6 className="font-bold text-[10px] text-white uppercase truncate max-w-[150px]">{formAuthor.split(" - ")[0] || "Nome do Autor"}</h6>
                        </div>
                      </div>
                      <Quote className="w-5 h-5 text-zinc-800" />
                    </div>
                    <p className="text-[10px] italic text-zinc-300 line-clamp-2 my-2">"{formTestimonial || "Escreva o texto do depoimento..."}"</p>
                    <span className="text-[8px] font-mono text-zinc-500 block truncate">{formAuthor.split(" - ")[1] || "Empresa / Cargo"}</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}
