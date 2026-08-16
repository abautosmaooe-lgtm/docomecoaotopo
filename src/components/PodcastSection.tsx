import React, { useState, useEffect } from "react";
import { 
  Youtube, Play, Headphones, ExternalLink, Sparkles, 
  Radio, Star, Award, Edit3, Save, X, Eye, Calendar, Clock, 
  Film, Plus, Trash2, GripVertical, PictureInPicture2
} from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PipVideoData } from "./PodcastPipPlayer";

export interface Episode {
  id: string;
  number: number;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnail: string;
  duration: string;
  views: string;
  date: string;
  embedCode?: string;
}

const INITIAL_EPISODES: Episode[] = [
  {
    id: "ep-43",
    number: 43,
    title: "Aceleração de Negócios e Inovação Regional",
    description: "Neste episódio exclusivo do Do Começo ao Topo Podcast, Regina Simões conversa sobre estratégias táticas para impulsionar o empreendedorismo regional, superar desafios de posicionamento de mercado e estabelecer conexões eficientes na Zona da Mata.",
    youtubeUrl: "https://www.youtube.com/watch?v=MOV0hq440ZI",
    thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    duration: "1h 12m",
    views: "1.2k views",
    date: "28/05/2026"
  },
  {
    id: "ep-42",
    number: 42,
    title: "Posicionamento de Marca & Vendas Estratégicas",
    description: "Descubra como estruturar sua imagem profissional e usar canais digitais para atrair clientes de alto valor, expandindo a autoridade do seu negócio local para todo o Brasil.",
    youtubeUrl: "https://www.youtube.com/watch?v=21X5lGlDOfg",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80",
    duration: "48m 15s",
    views: "980 views",
    date: "14/05/2026"
  },
  {
    id: "ep-41",
    number: 41,
    title: "Liderança de Impacto e Networking Corporativo",
    description: "Sintonize nas rotinas e métodos de gestão dos embaixadores mais influentes do ecossistema Do Começo ao Topo para maximizar sua performance comercial.",
    youtubeUrl: "https://www.youtube.com/watch?v=1La4QzGeaaQ",
    thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
    duration: "55m 40s",
    views: "812 views",
    date: "30/04/2026"
  }
];

export function getYouTubeId(url: string): string {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : "";
}

// Function to generate dynamic cover from youtube url if we got ID
export function getYouTubeThumbnail(url: string, fallback: string): string {
  const videoId = getYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return fallback;
}

interface SortableEpisodeCardProps {
  ep: Episode;
  isCurrentlyInEditMode: boolean;
  playingCardId: string | null;
  featuredId: string;
  isDarkMode: boolean;
  onPlay: (id: string) => void;
  onEdit: (ep: Episode, e?: React.MouseEvent) => void;
  onOpenPip?: (ep: Episode, e?: React.MouseEvent) => void;
}

function SortableEpisodeCard({ ep, isCurrentlyInEditMode, playingCardId, featuredId, isDarkMode, onPlay, onEdit, onOpenPip }: SortableEpisodeCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: ep.id, disabled: !isCurrentlyInEditMode });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const isEpisodeCurrentlyFeatured = ep.id === featuredId;
  const episodeYtId = getYouTubeId(ep.youtubeUrl);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isCurrentlyInEditMode ? attributes : {})}
      {...(isCurrentlyInEditMode ? listeners : {})}
      className={`p-3 bg-black/30 border rounded-2xl flex flex-col justify-between gap-3 transition duration-300 group touch-none relative ${
        isDragging ? "opacity-90 ring-2 ring-pink-500 scale-[1.02] shadow-2xl cursor-grabbing" : ""
      } ${
        isCurrentlyInEditMode ? "cursor-grab" : ""
      } ${
        playingCardId === ep.id
          ? "border-green-500/40 bg-green-500/[0.02] shadow-[0_0_15px_rgba(34,197,94,0.02)]"
          : "border-zinc-900 hover:border-pink-500/20 hover:bg-black/50"
      }`}
    >
      {/* Admin Quick Trigger on cards */}
      {isCurrentlyInEditMode && (
        <div className="absolute top-2 right-2 flex items-center gap-2 z-[35]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ep, e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 bg-pink-500 hover:bg-pink-400 text-black rounded-lg text-[9px] font-mono font-black flex items-center gap-1 shadow-lg hover:scale-105 transition"
            title="Editar dados deste episódio"
          >
            <Edit3 className="w-3 h-3" />
            <span>EDIT</span>
          </button>
        </div>
      )}

      {/* Picture-in-Picture Floating Trigger */}
      {onOpenPip && (
        <div className="absolute top-2 left-2 z-[30]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPip(ep, e);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-2 py-1 bg-black/80 hover:bg-pink-600 border border-zinc-700/80 hover:border-pink-400 text-zinc-300 hover:text-white rounded-lg text-[8px] font-mono font-bold flex items-center gap-1 backdrop-blur-md shadow-md hover:scale-105 transition cursor-pointer"
            title="Abrir em Picture-in-Picture flutuante (mover pela tela)"
          >
            <PictureInPicture2 className="w-2.5 h-2.5" />
            <span>PiP</span>
          </button>
        </div>
      )}

      <div className="space-y-2 cursor-pointer relative" onClick={() => onPlay(ep.id)}>
        <div className="relative h-28 w-full rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900">
          {playingCardId === ep.id ? (
            ep.embedCode ? (
              <div 
                className="w-full h-full absolute inset-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:border-0" 
                dangerouslySetInnerHTML={{ __html: ep.embedCode }} 
              />
            ) : (
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${getYouTubeId(ep.youtubeUrl)}?autoplay=1`}
                title={ep.title}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )
          ) : (
            <>
              <img 
                src={getYouTubeThumbnail(ep.youtubeUrl, ep.thumbnail)} 
                alt={ep.title} 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-300 pointer-events-none" 
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition"></div>
              
              {/* Play core trigger */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center opacity-85 group-hover:opacity-100 group-hover:scale-110 active:scale-95 transition shadow-lg">
                  <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                </div>
              </div>

              <span className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono text-white flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                {ep.duration}
              </span>
            </>
          )}
        </div>
        
        <div className="space-y-1">
          <span className="text-[8px] font-mono text-green-400 uppercase font-bold flex items-center gap-1">
            <Film className="w-2.5 h-2.5" />
            EPISÓDIO # {ep.number}
          </span>
          <h5 className={`font-display font-extrabold text-[12px] tracking-tight line-clamp-2 leading-tight group-hover:text-pink-400 transition ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
            {ep.title}
          </h5>
          <p className="text-zinc-500 text-[10px] leading-snug line-clamp-2">
            {ep.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono border-t border-zinc-900/60 pt-2">
        <span className="cursor-pointer" onClick={() => onPlay(ep.id)}>{ep.views}</span>
        <div className="flex items-center gap-2">
          {onOpenPip && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenPip(ep, e);
              }}
              className="text-zinc-400 hover:text-pink-400 font-mono text-[9px] flex items-center gap-0.5 transition"
              title="Abrir no modo Picture-in-Picture flutuante"
            >
              <PictureInPicture2 className="w-3 h-3" />
              <span>PiP</span>
            </button>
          )}
          <span className="cursor-pointer" onClick={() => onPlay(ep.id)}>{ep.date}</span>
        </div>
      </div>
    </div>
  );
}

interface PodcastSectionProps {
  isDarkMode: boolean;
  user?: {
    isAuthenticated: boolean;
    isAdmin?: boolean;
    name?: string;
  };
  directEditingMode?: boolean;
  onOpenPip?: (video: PipVideoData) => void;
}

export default function PodcastSection({ isDarkMode, user, directEditingMode, onOpenPip }: PodcastSectionProps) {
  // Read episode list state from localStorage
  const [episodes, setEpisodes] = useState<Episode[]>(() => {
    const saved = localStorage.getItem("docomeco_podcasts_v2");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          // Ensure each episode has unique distinct youtubeUrl if they were erroneously duplicated
          if (parsed[0] && (parsed[0].youtubeUrl.includes("S-H-9S4hY-w") || !parsed[0].youtubeUrl)) {
            parsed[0].youtubeUrl = "https://www.youtube.com/watch?v=MOV0hq440ZI";
          }
          if (parsed[1] && (parsed[1].youtubeUrl === parsed[0]?.youtubeUrl || !parsed[1].youtubeUrl)) {
            parsed[1].youtubeUrl = "https://www.youtube.com/watch?v=21X5lGlDOfg";
          }
          if (parsed[2] && (parsed[2].youtubeUrl === parsed[0]?.youtubeUrl || parsed[2].youtubeUrl === parsed[1]?.youtubeUrl || !parsed[2].youtubeUrl)) {
            parsed[2].youtubeUrl = "https://www.youtube.com/watch?v=1La4QzGeaaQ";
          }
          return parsed;
        }
      } catch (e) {
        console.error("Erro ao ler podcasts:", e);
      }
    }
    return INITIAL_EPISODES;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("docomeco_podcasts_v2");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed) && parsed.length > 0) {
            setEpisodes(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    window.addEventListener("podcasts_synced", handleStorageChange);
    return () => window.removeEventListener("podcasts_synced", handleStorageChange);
  }, []);

  // Track currently selected episode index to make featured, or active inline video player
  const [featuredId, setFeaturedId] = useState<string>("ep-43");
  const [playingVideoId, setPlayingVideoId] = useState<string | null>("MOV0hq440ZI");
  const [playingCardId, setPlayingCardId] = useState<string | null>(null); // New: Track which card is playing

  // Editing controls modal state
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [formYoutubeUrl, setFormYoutubeUrl] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDuration, setFormDuration] = useState("");
  const [formViews, setFormViews] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formNumber, setFormNumber] = useState<number | string>(41);
  const [formEmbedCode, setFormEmbedCode] = useState(""); // Add this
  const [formThumbnail, setFormThumbnail] = useState(""); // Add this

  // Persistence
  useEffect(() => {
    localStorage.setItem("docomeco_podcasts_v2", JSON.stringify(episodes));
  }, [episodes]);

  const featuredEpisode = episodes.find((ep) => ep.id === featuredId) || episodes[0] || INITIAL_EPISODES[0];

  // Open edit modal
  const handleOpenEdit = (ep: Episode, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    playClickSound(650, "sine");
    setEditingEpisode(ep);
    setFormYoutubeUrl(ep.youtubeUrl);
    setFormTitle(ep.title);
    setFormDescription(ep.description);
    setFormDuration(ep.duration);
    setFormViews(ep.views);
    setFormDate(ep.date);
    setFormNumber(ep.number);
    setFormEmbedCode(ep.embedCode || ""); // Add this
    setFormThumbnail(ep.thumbnail || ""); // Add this
  };

  const handleAddNewEpisode = () => {
    playClickSound(650, "sine");
    const newId = `ep-${Date.now()}`;
    const nextNum = episodes.length > 0 ? Math.max(...episodes.map(e => e.number)) + 1 : 1;
    const newEpisode: Episode = {
      id: newId,
      number: nextNum,
      title: "Novo Episódio",
      description: "Descrição do episódio aqui...",
      youtubeUrl: "",
      thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
      duration: "0min",
      views: "0 views",
      date: "Hoje",
      embedCode: ""
    };
    // set to editing state
    setEditingEpisode(newEpisode);
    setFormYoutubeUrl(newEpisode.youtubeUrl);
    setFormTitle(newEpisode.title);
    setFormDescription(newEpisode.description);
    setFormDuration(newEpisode.duration);
    setFormViews(newEpisode.views);
    setFormDate(newEpisode.date);
    setFormNumber(newEpisode.number);
    setFormEmbedCode(newEpisode.embedCode || "");
    setFormThumbnail(newEpisode.thumbnail || "");
  };

  // Save changes
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEpisode) return;

    // Auto calculate thumbnail based on youtube ID (or manual override)
    const detectedThumb = getYouTubeThumbnail(formYoutubeUrl, formThumbnail || editingEpisode.thumbnail);

    const updatedEpisode = {
      ...editingEpisode,
      youtubeUrl: formYoutubeUrl,
      title: formTitle,
      description: formDescription,
      duration: formDuration,
      views: formViews,
      date: formDate,
      number: Number(formNumber),
      thumbnail: detectedThumb || formThumbnail || editingEpisode.thumbnail,
      embedCode: formEmbedCode
    };

    const exists = episodes.some(ep => ep.id === editingEpisode.id);
    let nextEpisodes = [];
    if (exists) {
      nextEpisodes = episodes.map(ep => ep.id === editingEpisode.id ? updatedEpisode : ep);
    } else {
      nextEpisodes = [updatedEpisode, ...episodes];
    }

    setEpisodes(nextEpisodes);
    localStorage.setItem("docomeco_podcasts_v2", JSON.stringify(nextEpisodes));

    // Auto-save & publish to server database immediately
    fetch("/api/published-data")
      .then(res => res.json())
      .then(serverData => {
        const payload = {
          ...serverData,
          podcasts: nextEpisodes
        };
        fetch("/api/publish-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(d => {
          console.log("Successfully published podcasts list server-side", d);
          window.dispatchEvent(new Event("podcasts_synced"));
        })
        .catch(err => console.error("Error publishing podcasts server-side:", err));
      });

    setEditingEpisode(null);
    playSuccessSound();
  };

  const handleDeleteEpisode = () => {
    {
      playClickSound(300, "sawtooth");
      const nextEpisodes = episodes.filter(ep => ep.id !== editingEpisode?.id);
      setEpisodes(nextEpisodes);
      localStorage.setItem("docomeco_podcasts_v2", JSON.stringify(nextEpisodes));

      // Auto-save & publish to server database immediately
      fetch("/api/published-data")
        .then(res => res.json())
        .then(serverData => {
          const payload = {
            ...serverData,
            podcasts: nextEpisodes
          };
          fetch("/api/publish-all", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          })
          .then(r => r.json())
          .then(d => {
            console.log("Successfully deleted and published podcasts list server-side", d);
            window.dispatchEvent(new Event("podcasts_synced"));
          })
          .catch(err => console.error("Error publishing podcasts server-side:", err));
        });

      setEditingEpisode(null);
    }
  };

  // Play episode direct media embed
  const handlePlayEpisode = (epId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const targetEp = episodes.find((ep) => ep.id === epId);
    if (!targetEp) return;
    
    const ytId = getYouTubeId(targetEp.youtubeUrl);
    if (ytId) {
      playClickSound(700, "sine");
      setPlayingVideoId(ytId);
      // Automatically make it featured to fit major viewer viewport
      setFeaturedId(epId);
    } else if (targetEp.embedCode) {
      playClickSound(700, "sine");
      setPlayingVideoId("embed");
      setFeaturedId(epId);
    } else {
      // fallback to actual url external trigger
      if (targetEp.youtubeUrl) {
        window.open(targetEp.youtubeUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const isAdmin = user?.isAuthenticated && user?.isAdmin;
  const isCurrentlyInEditMode = isAdmin || directEditingMode;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEpisodes((items) => {
        const oldIndex = items.findIndex((ep) => ep.id === active.id);
        const newIndex = items.findIndex((ep) => ep.id === over.id);

        playClickSound(300, "sine");
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div
      id="podcast-youtube-root-section"
      className={`rounded-3xl border overflow-hidden p-6 md:p-8 space-y-6 transition-all duration-300 ${
        isDarkMode
          ? "bg-stone-950/60 border-[#22c55e]/20 hover:border-[#22c55e]/40 bg-gradient-to-br from-black via-stone-950 to-stone-900/60 shadow-[0_0_30px_rgba(34,197,94,0.05)]"
          : "bg-white border-stone-200 hover:border-pink-500 shadow-md"
      }`}
    >
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-500/10 dark:border-zinc-800/50 pb-6">
        <div className="flex items-start gap-3.5">
          <div className="p-3.5 bg-pink-500/10 text-pink-500 rounded-2xl border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)] shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-green-400 font-extrabold uppercase tracking-wider bg-green-950/40 px-2 py-0.5 rounded border border-green-500/30">
                Episódios Oficiais
              </span>
              <span className="flex items-center gap-0.5 text-[10px] text-zinc-400 font-mono">
                <Star className="w-3 h-3 text-pink-500 fill-pink-500" />
                4.9/5 Estrelas
              </span>
              {isAdmin && (
                <span className="text-[9px] font-mono text-pink-400 bg-pink-500/10 border border-pink-500/30 px-2 py-0.5 rounded font-black uppercase tracking-widest animate-pulse">
                  👑 Conta Admin (Edição Ativa)
                </span>
              )}
            </div>
            <h3 className={`font-display font-black text-xl md:text-2xl mt-1 tracking-tight leading-none uppercase ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
              Podcast Do Começo ao Topo
            </h3>
            <p className="text-zinc-400 text-xs mt-1.5 max-w-xl">
              Dê play diretamente no portal para sintonizar. {isCurrentlyInEditMode ? "Administrador, clique nos botões de edição de cada card ou texto para atualizar canais e vídeos instantaneamente." : "Entrevistas com pensadores, empreendedores, cientistas e criadores de opinião regional."}
            </p>
          </div>
        </div>

        {/* CTA REDIRECT TO CHANNEL */}
        <a
          href="https://www.youtube.com/@podcastdocome%C3%A7oaotopo"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs rounded-2xl flex items-center justify-center gap-2 tracking-wider hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lg shadow-red-600/25 shrink-0"
        >
          <Youtube className="w-4 h-4 text-white fill-current" />
          <span>PORTAL NO YOUTUBE</span>
          <ExternalLink className="w-3 h-3 text-white/80" />
        </a>
      </div>

      {/* FEATURED EPISODE BANNER (HERO PLAYER VIEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-black/60 rounded-2xl border border-zinc-900/80 p-4 md:p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Cover Video Player Frame */}
        <div className="lg:col-span-5 relative group overflow-hidden rounded-xl h-56 sm:h-64 bg-zinc-950 border border-zinc-900">
          
          {playingVideoId && featuredEpisode.id === featuredId ? (
            /* Embedding YouTube real player! */
            featuredEpisode.embedCode ? (
              <div 
                className="w-full h-full absolute inset-0 [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:border-0" 
                dangerouslySetInnerHTML={{ __html: featuredEpisode.embedCode }} 
              />
            ) : (
              <iframe
                width="560"
                height="315"
                src={playingVideoId === "MOV0hq440ZI" ? "https://www.youtube.com/embed/MOV0hq440ZI?si=XMbH11gevDaGLlTp" : `https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
                title={featuredEpisode.title || "YouTube video player"}
                className="w-full h-full border-0 absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )
          ) : (
            /* Thumbnail Banner */
            <div className="w-full h-full relative" onClick={() => handlePlayEpisode(featuredEpisode.id)}>
              <img
                src={getYouTubeThumbnail(featuredEpisode.youtubeUrl, featuredEpisode.thumbnail)}
                alt={featuredEpisode.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
              />
              {/* Animated red live indicator */}
              <div className="absolute top-3 left-3 bg-red-600 text-white font-mono font-bold text-[8px] px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                <span>Estúdio Regional</span>
              </div>
              
              {/* Wave animation graphic placeholder */}
              <div className="absolute bottom-3 right-3 bg-black/85 backdrop-filter backdrop-blur-sm p-1.5 px-3 rounded-lg text-[9px] font-mono text-green-400 font-bold flex items-center gap-2">
                <div className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 bg-green-500 h-2 animate-bounce"></span>
                  <span className="w-0.5 bg-green-500 h-4.5 animate-bounce [animation-delay:0.15s]"></span>
                  <span className="w-0.5 bg-green-500 h-3 animate-bounce [animation-delay:0.3s]"></span>
                  <span className="w-0.5 bg-green-500 h-1 animate-bounce [animation-delay:0.05s]"></span>
                </div>
                <span>{featuredEpisode.duration}</span>
              </div>

              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 flex items-center justify-center transition duration-300 cursor-pointer">
                <button
                  onClick={() => handlePlayEpisode(featuredEpisode.id)}
                  className="w-14 h-14 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white scale-100 group-hover:scale-110 active:scale-95 transition shadow-xl"
                >
                  <Play className="w-7 h-7 text-white fill-current ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content details & description */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="space-y-2 relative">
            
            {/* Admin Floating Trigger on main cover */}
            {isCurrentlyInEditMode && (
              <button
                onClick={(e) => handleOpenEdit(featuredEpisode, e)}
                className="absolute top-0 right-0 p-2 bg-pink-500 hover:bg-pink-400 text-black rounded-lg text-xs font-mono font-black flex items-center gap-1 shadow-lg shadow-pink-500/20 z-10 hover:scale-105 transition"
                title="Editar dados do episódio destacado"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDITAR EPISÓDIO # {featuredEpisode.number}</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <span className="text-[#22c55e] font-extrabold bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/10">EPI # {featuredEpisode.number}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {featuredEpisode.views}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Publicado {featuredEpisode.date}</span>
            </div>
            
            <h4 className={`font-display font-black text-lg md:text-xl leading-tight transition ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
              {featuredEpisode.title}
            </h4>
            
            <p className="text-zinc-450 text-xs leading-relaxed max-w-xl">
              {featuredEpisode.description}
            </p>

            {/* Quick Youtube video code block debug */}
            <div className="p-2.5 rounded-xl border border-zinc-900 bg-black/40 text-[9px] font-mono text-zinc-500 max-w-lg mt-2 flex items-center justify-between">
              <span className="truncate">URL YouTube: <strong className="text-zinc-300 select-all">{featuredEpisode.youtubeUrl}</strong></span>
              <span className="text-red-500 font-bold shrink-0 border border-red-500/20 bg-red-955/20 px-1.5 py-0.5 rounded ml-2">ID: {getYouTubeId(featuredEpisode.youtubeUrl) || "Não detectado"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-900 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-mono">
                💡 Negócios
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-mono">
                ⚡ Empreendedorismo
              </span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-mono">
                🦾 IA & Inovação
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Picture-in-Picture Trigger Button */}
              {onOpenPip && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playClickSound(800, "sine");
                    onOpenPip({
                      id: featuredEpisode.id,
                      number: featuredEpisode.number,
                      title: featuredEpisode.title,
                      youtubeUrl: featuredEpisode.youtubeUrl,
                      embedCode: featuredEpisode.embedCode,
                      duration: featuredEpisode.duration,
                    });
                  }}
                  className="text-xs font-mono text-white hover:text-pink-300 transition flex items-center gap-1.5 border border-pink-500/40 bg-pink-500/20 hover:bg-pink-500/30 px-3 py-1.5 rounded-lg shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
                  title="Abrir em Picture-in-Picture flutuante (você pode navegar pelo portal e mover o vídeo)"
                >
                  <PictureInPicture2 className="w-3.5 h-3.5 text-pink-400" />
                  <span className="font-bold">Modo PiP</span>
                </button>
              )}

              {playingVideoId && featuredEpisode.id === featuredId && (
                <button
                  onClick={() => setPlayingVideoId(null)}
                  className="text-xs font-mono text-pink-500 hover:text-white transition flex items-center gap-1 border border-pink-500/20 bg-pink-500/5 px-2.5 py-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Fechar Player</span>
                </button>
              )}
              <a
                href={featuredEpisode.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-zinc-400 hover:text-white transition flex items-center gap-1 hover:underline"
              >
                <span>Assistir no YouTube</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT EPISODES LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono tracking-widest uppercase">
          <span>Últimos Capítulos do Podcast</span>
          <span>Clique para Trocar Exibições</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={episodes.map(ep => ep.id)}
              strategy={rectSortingStrategy}
            >
              {isCurrentlyInEditMode && (
                <div
                  onClick={handleAddNewEpisode}
                  className="p-3 bg-black/30 border border-dashed border-zinc-700 hover:border-pink-500 rounded-2xl flex flex-col justify-center items-center gap-3 transition duration-300 group cursor-pointer min-h-[220px]"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition shadow-lg">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest font-bold group-hover:text-pink-500 transition">Adicionar Episódio</span>
                </div>
              )}
              {episodes.map((ep) => (
                <SortableEpisodeCard
                  key={ep.id}
                  ep={ep}
                  isCurrentlyInEditMode={!!isCurrentlyInEditMode}
                  playingCardId={playingCardId}
                  featuredId={featuredId}
                  isDarkMode={isDarkMode}
                  onPlay={(id) => {
                    playClickSound(600, "sine");
                    setPlayingCardId(id);
                  }}
                  onEdit={(episodeToEdit, e) => handleOpenEdit(episodeToEdit, e)}
                  onOpenPip={onOpenPip ? (episodeForPip, e) => {
                    playClickSound(800, "sine");
                    onOpenPip({
                      id: episodeForPip.id,
                      number: episodeForPip.number,
                      title: episodeForPip.title,
                      youtubeUrl: episodeForPip.youtubeUrl,
                      embedCode: episodeForPip.embedCode,
                      duration: episodeForPip.duration,
                    });
                  } : undefined}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
      
      {/* BRANDING GRAPHICS */}
      <div className="bg-gradient-to-r from-red-600/10 via-zinc-900/20 to-[#22c55e]/10 border border-zinc-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center text-red-500 font-mono font-black text-xs border border-zinc-800">
            YT
          </div>
          <div>
            <h5 className={`font-display font-black text-xs uppercase tracking-wider ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
              INSCREVA-SE PARA NÃO PERDER NADA!
            </h5>
            <p className="text-[10px] text-zinc-500 font-mono leading-none mt-1">
              Vídeos novos todas as semanas, com cortes, insights de mídias e bastidores comerciais de Juiz de Fora.
            </p>
          </div>
        </div>
        <a
          href="https://www.youtube.com/@podcastdocome%C3%A7oaotopo"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-stone-900 hover:bg-stone-850 hover:text-white border border-zinc-800 rounded-xl text-[10px] font-mono font-bold tracking-widest text-zinc-300 transition flex items-center gap-1.5 justify-center"
        >
          <span>@podcastdocomeçoaotopo</span>
          <ExternalLink className="w-3 h-3 text-zinc-500" />
        </a>
      </div>

      {/* DYNAMIC MODAL EDITOR FOR ADMIN PODCAST UPDATES */}
      {editingEpisode && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in animate-duration-200">
          <div className="bg-stone-950 border border-pink-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(236,72,153,0.15)] flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-pink-500/15 via-black to-green-500/10 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-pink-500" />
                <div>
                  <h4 className="font-display font-black text-sm uppercase text-white tracking-widest">
                    Editar Episódio {formNumber}
                  </h4>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase">
                    ID Interno: {editingEpisode.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEpisode(null)}
                className="p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Ep Numero */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                    Número do Episódio
                  </label>
                  <input
                    type="number"
                    value={formNumber}
                    onChange={(e) => setFormNumber(Number(e.target.value))}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>
                {/* Duration */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                    Duração (ex: 1h 05min)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Embed Code Option */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                  Código de Embed Manual (Opcional - substitui o player automático)
                </label>
                <textarea
                  value={formEmbedCode}
                  onChange={(e) => setFormEmbedCode(e.target.value)}
                  rows={2}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-300 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
                  placeholder='<iframe ...></iframe>'
                />
              </div>

              {/* Cover Image URL Override */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                  URL da Imagem de Capa (Opcional - substitui imagem automática do YouTube)
                </label>
                <input
                  type="text"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  placeholder="https://images.unsplash.com/... ou link de imagem direta"
                />
              </div>

              {/* YouTube Link */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                  Link do Vídeo no YouTube (Opcional se houver Embed Manual acima)
                </label>
                <input
                  type="url"
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  placeholder="https://www.youtube.com/watch?v=S-H-9S4hY-w"
                  required={!formEmbedCode}
                />
                <div className="p-2 sm:p-3 rounded-lg bg-zinc-950 text-[9px] font-mono text-zinc-500 flex flex-col gap-1">
                  <span className="text-[#22c55e]">⚡ ID Detectado: <strong className="text-white bg-green-950 px-1 py-0.5 rounded">{getYouTubeId(formYoutubeUrl) || "Aguardando link de vídeo válido..."}</strong></span>
                  <span>O sistema usará diretamente este link para embutir o reprodutor real e gerar a imagem oficial de alta qualidade!</span>
                </div>
              </div>

              {/* Titulo */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                  Título do Episódio
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                  required
                />
              </div>

              {/* Descricao */}
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                  Breve Descrição
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-sans text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Views count */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                    Visualizações para Mostrar (ex: 4.2K views)
                  </label>
                  <input
                    type="text"
                    value={formViews}
                    onChange={(e) => setFormViews(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>
                {/* Data */}
                <div>
                  <label className="block text-[10px] uppercase font-mono tracking-widest text-zinc-400 mb-1">
                    Data de Publicação (ex: 20/05/2026)
                  </label>
                  <input
                    type="text"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-900 flex items-center justify-between gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleDeleteEpisode}
                  className="px-4 py-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-mono transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Apagar</span>
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingEpisode(null)}
                    className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-xl text-zinc-400 text-xs font-mono"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-pink-500 to-red-600 text-white font-mono font-black text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 active:scale-98 transition shadow-lg shadow-pink-500/10"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SALVAR MUDANÇAS</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
