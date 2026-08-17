import React, { useState, useEffect, useRef } from "react";
import { 
  Star, Award, Calendar, MapPin, ExternalLink, Sparkles, 
  Share2, Heart, ShieldCheck, Camera, Upload, Link, RefreshCw, X, Check, Loader2
} from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { toast } from "sonner";
import { compressImageFile, uploadImageToServer, safeLocalStorageSet } from "../utils/imageCompression";

interface MonthlyHighlightProps {
  isDarkMode?: boolean;
  directEditingMode?: boolean;
}

export default function MonthlyHighlightsSection({ 
  isDarkMode = true, 
  directEditingMode = false 
}: MonthlyHighlightProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unicorn" | "jfsummit">("all");
  const [likes, setLikes] = useState<Record<string, number>>({
    unicorn: 342,
    jfsummit: 289
  });
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

  // Photos state with local storage persistence
  const DEFAULT_UNICORN_PHOTO = "https://i.ibb.co/JFWwYRLQ/Whats-App-Image-2026-08-15-at-12-13-42-1.jpg";
  const DEFAULT_JFSUMMIT_PHOTO = "https://i.ibb.co/0pR76ckr/Whats-App-Image-2026-08-15-at-12-13-51.jpg";
  const DEFAULT_FALLBACK_PHOTO = DEFAULT_UNICORN_PHOTO;

  const [unicornPhoto, setUnicornPhoto] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("app_highlight_photo_unicorn");
      if (stored && !stored.startsWith("data:image/") && stored !== "/regina-profile.jpg" && !stored.includes("unsplash.com")) {
        return stored;
      }
    } catch (e) {}
    return DEFAULT_UNICORN_PHOTO;
  });

  const [jfsummitPhoto, setJfsummitPhoto] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("app_highlight_photo_jfsummit");
      if (stored && !stored.startsWith("data:image/") && stored !== "/regina-profile.jpg" && !stored.includes("unsplash.com")) {
        return stored;
      }
    } catch (e) {}
    return DEFAULT_JFSUMMIT_PHOTO;
  });

  // Modal editing state
  const [editingTarget, setEditingTarget] = useState<"unicorn" | "jfsummit" | null>(null);
  const [tempUrl, setTempUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenEdit = (target: "unicorn" | "jfsummit") => {
    if (!directEditingMode) return;
    playClickSound(700, "sine");
    setEditingTarget(target);
    setTempUrl(target === "unicorn" ? unicornPhoto : jfsummitPhoto);
  };

  const handleSavePhoto = (newUrl: string) => {
    if (!editingTarget) return;
    playSuccessSound();
    if (editingTarget === "unicorn") {
      setUnicornPhoto(newUrl);
      safeLocalStorageSet("app_highlight_photo_unicorn", newUrl);
      toast.success("Foto do destaque Unicorn Summit atualizada com sucesso!");
    } else {
      setJfsummitPhoto(newUrl);
      safeLocalStorageSet("app_highlight_photo_jfsummit", newUrl);
      toast.success("Foto do destaque JF Summit atualizada com sucesso!");
    }
    setEditingTarget(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 15MB");
      return;
    }

    try {
      setIsUploading(true);
      toast.loading("Otimizando e enviando imagem...", { id: "upload-highlight" });

      // 1. Compress client-side
      const compressedDataUrl = await compressImageFile(file, {
        maxDimension: 1200,
        quality: 0.8
      });

      // 2. Upload to server to get persistent lightweight URL
      const hostedUrl = await uploadImageToServer(compressedDataUrl);

      handleSavePhoto(hostedUrl);
      toast.success("Imagem carregada e otimizada!", { id: "upload-highlight" });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Erro ao processar imagem.", { id: "upload-highlight" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetPhoto = (target: "unicorn" | "jfsummit") => {
    if (target === "unicorn") {
      setUnicornPhoto(DEFAULT_UNICORN_PHOTO);
      try { localStorage.removeItem("app_highlight_photo_unicorn"); } catch (e) {}
    } else {
      setJfsummitPhoto(DEFAULT_JFSUMMIT_PHOTO);
      try { localStorage.removeItem("app_highlight_photo_jfsummit"); } catch (e) {}
    }
    toast.info("Foto restaurada para o padrão.");
    setEditingTarget(null);
  };

  const handleLike = (key: "unicorn" | "jfsummit") => {
    playClickSound(800, "sine");
    setHasLiked(prev => {
      const nextLiked = !prev[key];
      setLikes(l => ({
        ...l,
        [key]: nextLiked ? l[key] + 1 : l[key] - 1
      }));
      if (nextLiked) {
        toast.success("Parabéns registrado com sucesso!");
      }
      return { ...prev, [key]: nextLiked };
    });
  };

  const handleShare = (title: string, url: string) => {
    playClickSound(700, "sine");
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  return (
    <section id="destaques-do-mes-section" className="my-10 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-green-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-md">
            <Star className="w-5 h-5 fill-pink-400/30 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase text-pink-400 bg-pink-950/60 px-2 py-0.5 rounded border border-pink-500/30 tracking-widest">
                Reconhecimento Oficial
              </span>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Destaque do Mês
              </span>
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
              Destaques do Mês
            </h3>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl">
          {[
            { id: "all", label: "Todos os Destaques" },
            { id: "unicorn", label: "Unicorn Summit" },
            { id: "jfsummit", label: "JF Summit 26" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound(600, "sine");
                setActiveTab(tab.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition uppercase ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        {/* CARD 1: REGINA SIMÕES - EMBAIXADORA UNICORN SUMMIT 2026 */}
        {(activeTab === "all" || activeTab === "unicorn") && (
          <div className="group relative rounded-3xl overflow-hidden border-2 border-green-500/40 bg-gradient-to-b from-[#061e12] via-[#04130c] to-black shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(34,197,94,0.15)] flex flex-col justify-between transition-all duration-300 hover:border-green-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.25)]">
            
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Content Top */}
            <div className="p-6 sm:p-7 relative z-10 space-y-5">
              
              {/* Badges Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-green-400" />
                  EMBAIXADORA OFICIAL
                </span>
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800">
                  América do Sul
                </span>
              </div>

              {/* Title & Badge presentation */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-yellow-400 tracking-widest uppercase">
                    Unicorn Summit 2026
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs font-mono text-zinc-400">Polo de Inovação</span>
                </div>
                <h4 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
                  Regina Simões
                </h4>
                <p className="text-sm font-semibold text-green-400 font-mono mt-0.5">
                  Nomeada Embaixadora Oficial do Unicorn Summit South America
                </p>
              </div>

              {/* Featured Badge Card Banner with Credential visual */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-green-950/70 via-black/80 to-zinc-950 border border-green-500/30 flex items-center gap-4 relative">
                
                {/* Crachá Foto Box with Edit Overlay */}
                <div className="relative group/photo shrink-0">
                  <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-green-400/50 shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-gradient-to-b from-green-900 to-black p-1">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-black/80 flex flex-col items-center justify-between p-1.5 text-center">
                      <div className="text-[9px] font-mono font-bold text-green-300 uppercase tracking-tighter">
                        UNICORN SUMMIT
                      </div>
                      <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden border border-yellow-400/80 shadow-md bg-zinc-950">
                        <img
                          src={unicornPhoto}
                          alt="Regina Simões - Embaixadora Unicorn Summit"
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_PHOTO;
                          }}
                        />
                      </div>
                      <div className="text-[8px] font-mono font-black text-yellow-300 uppercase bg-green-950/90 px-1 py-0.5 rounded border border-green-500/40 w-full">
                        EMBAIXADORA
                      </div>
                    </div>
                  </div>

                  {/* EDIT PHOTO BUTTON */}
                  {directEditingMode && (
                    <button
                      onClick={() => handleOpenEdit("unicorn")}
                      className="absolute inset-0 bg-black/75 rounded-2xl flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 border-2 border-green-400 shadow-xl cursor-pointer"
                      title="Clique para alterar a foto do destaque"
                    >
                      <Camera className="w-5 h-5 text-green-400" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-center px-1">
                        Trocar Foto
                      </span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="font-mono font-bold text-white uppercase flex items-center gap-1 text-sm">
                    <span>Crachá de Credenciamento</span>
                    <ShieldCheck className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span>30 e 31 de Agosto • 1 e 2 de Setembro 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span>Cine-Theatro Central • Juiz de Fora / MG</span>
                  </div>
                  <div className="text-[11px] text-green-300 font-mono pt-0.5">
                    ✨ CONECTA • INSPIRA • TRANSFORMA
                  </div>
                  
                  {/* Quick Edit button helper */}
                  {directEditingMode && (
                    <button
                      onClick={() => handleOpenEdit("unicorn")}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-green-400 hover:text-green-300 underline cursor-pointer"
                    >
                      <Camera className="w-3 h-3" /> Editar foto deste destaque
                    </button>
                  )}
                </div>
              </div>

              {/* Brief context */}
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                Parabéns à <strong>Regina Simões</strong> pelo reconhecimento e nomeação como Embaixadora Oficial do <strong>Unicorn Summit South America 2026</strong>, fortalecendo a conexão de Juiz de Fora com o futuro global dos negócios, inteligência artificial e startups!
              </p>
            </div>

            {/* Card Footer Actions */}
            <div className="p-5 bg-black/60 border-t border-green-500/20 relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike("unicorn")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${
                    hasLiked["unicorn"]
                      ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked["unicorn"] ? "fill-pink-500 text-pink-500" : ""}`} />
                  <span>{likes.unicorn}</span>
                </button>

                <button
                  onClick={() => handleShare("Regina Simões - Embaixadora Unicorn Summit 2026", "https://sa.unicornsummit.net/")}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <a
                href="https://sa.unicornsummit.net/?utm_source=chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound(750, "sine")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-400 text-black font-mono font-bold text-xs uppercase tracking-wider transition hover:scale-105 active:scale-95"
              >
                <span>Site Oficial Unicorn Summit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}

        {/* CARD 2: REGINA SIMÕES - EMBAIXADORA JF SUMMIT 26 (TERRAZZO) */}
        {(activeTab === "all" || activeTab === "jfsummit") && (
          <div className="group relative rounded-3xl overflow-hidden border-2 border-pink-500/40 bg-gradient-to-b from-[#1c0828] via-[#0f0418] to-black shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(236,72,153,0.15)] flex flex-col justify-between transition-all duration-300 hover:border-pink-400 hover:shadow-[0_0_40px_rgba(236,72,153,0.25)]">
            
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

            {/* Card Content Top */}
            <div className="p-6 sm:p-7 relative z-10 space-y-5">
              
              {/* Badges Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 bg-pink-500/20 border border-pink-500/40 text-pink-300 rounded-lg text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-pink-400" />
                  EMBAIXADORA OFICIAL
                </span>
                <span className="text-[11px] font-mono text-pink-400 bg-pink-950/80 px-2.5 py-1 rounded-md border border-pink-500/30">
                  Realização FEAT
                </span>
              </div>

              {/* Title & Badge presentation */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-pink-400 tracking-widest uppercase">
                    JF Summit 26
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-xs font-mono text-zinc-400">Do Começo ao Topo</span>
                </div>
                <h4 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
                  Regina Simões
                </h4>
                <p className="text-sm font-semibold text-pink-400 font-mono mt-0.5">
                  Embaixadora do Maior Evento de Empreendedorismo da Região
                </p>
              </div>

              {/* Featured Badge Card Banner with Credential visual */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-950/70 via-black/80 to-zinc-950 border border-pink-500/30 flex items-center gap-4 relative">
                
                {/* Crachá Foto Box with Edit Overlay */}
                <div className="relative group/photo shrink-0">
                  <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-2xl overflow-hidden border-2 border-pink-400/50 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-gradient-to-b from-purple-900 to-black p-1">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-black/80 flex flex-col items-center justify-between p-1.5 text-center">
                      <div className="text-[9px] font-mono font-bold text-pink-300 uppercase tracking-tighter">
                        JF SUMMIT 26
                      </div>
                      <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-xl overflow-hidden border border-pink-400 shadow-md bg-zinc-950">
                        <img
                          src={jfsummitPhoto}
                          alt="Regina Simões - Embaixadora JF Summit 26"
                          className="w-full h-full object-cover object-top"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_PHOTO;
                          }}
                        />
                      </div>
                      <div className="text-[8px] font-mono font-black text-pink-200 uppercase bg-pink-950/90 px-1 py-0.5 rounded border border-pink-500/40 w-full">
                        EMBAIXADORA
                      </div>
                    </div>
                  </div>

                  {/* EDIT PHOTO BUTTON */}
                  {directEditingMode && (
                    <button
                      onClick={() => handleOpenEdit("jfsummit")}
                      className="absolute inset-0 bg-black/75 rounded-2xl flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 border-2 border-pink-400 shadow-xl cursor-pointer"
                      title="Clique para alterar a foto do destaque"
                    >
                      <Camera className="w-5 h-5 text-pink-400" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-center px-1">
                        Trocar Foto
                      </span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-zinc-300">
                  <div className="font-mono font-bold text-white uppercase flex items-center gap-1 text-sm">
                    <span>Crachá de Credenciamento</span>
                    <ShieldCheck className="w-4 h-4 text-pink-400" />
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>27 e 28 de Agosto de 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>Terrazzo • Juiz de Fora / MG</span>
                  </div>
                  <div className="text-[11px] text-pink-300 font-mono pt-0.5">
                    🎙️ Podcast Do Começo ao Topo
                  </div>

                  {/* Quick Edit button helper */}
                  {directEditingMode && (
                    <button
                      onClick={() => handleOpenEdit("jfsummit")}
                      className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-pink-400 hover:text-pink-300 underline cursor-pointer"
                    >
                      <Camera className="w-3 h-3" /> Editar foto deste destaque
                    </button>
                  )}
                </div>
              </div>

              {/* Brief context */}
              <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                Reconhecimento à <strong>Regina Simões</strong> como Embaixadora do <strong>JF Summit 26</strong> no Terrazzo em Juiz de Fora, unindo a força do podcast <em>Do Começo ao Topo</em> aos maiores líderes empresariais e marcas do mercado!
              </p>
            </div>

            {/* Card Footer Actions */}
            <div className="p-5 bg-black/60 border-t border-pink-500/20 relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLike("jfsummit")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition ${
                    hasLiked["jfsummit"]
                      ? "bg-pink-500/20 border-pink-500/50 text-pink-400"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked["jfsummit"] ? "fill-pink-500 text-pink-500" : ""}`} />
                  <span>{likes.jfsummit}</span>
                </button>

                <button
                  onClick={() => handleShare("Regina Simões - Embaixadora JF Summit 26", "https://jfsummit.com.br/")}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <a
                href="https://jfsummit.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound(750, "sine")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition hover:scale-105 active:scale-95 shadow-md"
              >
                <span>Garantir Ingresso JF Summit</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}

      </div>

      {/* EDIT PHOTO MODAL */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border-2 border-zinc-700 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-lg text-white uppercase">
                    Alterar Foto do Destaque
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    {editingTarget === "unicorn" ? "Unicorn Summit 2026" : "JF Summit 26"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="flex flex-col items-center gap-3 p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-pink-500/60 shadow-lg">
                <img
                  src={tempUrl || (editingTarget === "unicorn" ? unicornPhoto : jfsummitPhoto)}
                  alt="Prévia"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Prévia da imagem selecionada</span>
            </div>

              {/* Option 1: File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                1. Carregar Foto do Computador / Celular
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                    <span>Otimizando e Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-pink-400" />
                    <span>Escolher Arquivo do Dispositivo</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                2. Ou colar Link / URL Direto da Imagem
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://exemplo.com/minha-foto.jpg"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => handleResetPhoto(editingTarget)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-mono py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restaurar Padrão
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSavePhoto(tempUrl)}
                  disabled={!tempUrl}
                  className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg"
                >
                  <Check className="w-4 h-4" /> Salvar Foto
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
