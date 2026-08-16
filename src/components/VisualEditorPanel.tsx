import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { X, Sliders, Image, Maximize2, Sparkles, Smile, RefreshCw, Type, Eye, Upload, Camera, Trash2, Copy, Crop, Move } from "lucide-react";
import { NewsArticle, CategoryType } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface LogoConfigType {
  customImageUrl: string;
  customLogoWidth: number;
  customLogoHeight: number;
  customText1: string;
  customText2: string;
  customSub: string;
}

interface VisualEditorPanelProps {
  isOpen: boolean;
  isDarkMode: boolean;
  article: NewsArticle | null;
  logoConfig: LogoConfigType;
  onClose: () => void;
  onSaveArticle: (updatedArt: NewsArticle) => void;
  onSaveLogo: (updatedLogo: LogoConfigType) => void;
}

// Curated stock photos with high fidelity for Juiz de Fora regional technology & business context
const PRESET_ART__IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600",
    label: "Espaço Startup"
  },
  {
    url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
    label: "Negócios / Liderança"
  },
  {
    url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    label: "Tecnologia Digital"
  },
  {
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600",
    label: "Equipe e Evento"
  },
  {
    url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=600",
    label: "Programação e Luzes"
  },
  {
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600",
    label: "Centro de Negócios"
  }
];

const PRESET_LOGO_IMAGES = [
  {
    url: "https://i.ibb.co/8Ls8W5Nw/topina-0-1.jpg",
    label: "Padrão Do Começo ao Topo"
  },
  {
    url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=150",
    label: "Corporativo Ouro"
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150",
    label: "Esfera de Neon"
  },
  {
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=150",
    label: "Símbolo Cyber"
  }
];

export default function VisualEditorPanel({
  isOpen,
  isDarkMode,
  article,
  logoConfig,
  onClose,
  onSaveArticle,
  onSaveLogo
}: VisualEditorPanelProps) {
  // Local edited state for article
  const [localTitle, setLocalTitle] = useState("");
  const [localExcerpt, setLocalExcerpt] = useState("");
  const [localImg, setLocalImg] = useState("");
  const [localHeight, setLocalHeight] = useState<number>(200);
  const [localUseCustomHeight, setLocalUseCustomHeight] = useState(false);
  const [localWidthSpan, setLocalWidthSpan] = useState<"col-span-1" | "col-span-2" | "col-span-3">("col-span-1");
  const [localPadding, setLocalPadding] = useState<"p-3" | "p-5" | "p-8">("p-5");
  const [localRadius, setLocalRadius] = useState<"rounded-none" | "rounded-lg" | "rounded-2xl" | "rounded-3xl">("rounded-2xl");
  const [localGlow, setLocalGlow] = useState<"none" | "pink" | "green" | "emerald" | "amber">("none");
  const [localAspect, setLocalAspect] = useState<"auto" | "square" | "video" | "tall">("auto");
  const [localAuthor, setLocalAuthor] = useState("");
  const [localLocation, setLocalLocation] = useState("");

  // Local edited state for logo
  const [localLogoImg, setLocalLogoImg] = useState("");
  const [localLogoWidth, setLocalLogoWidth] = useState(36);
  const [localLogoHeight, setLocalLogoHeight] = useState(36);
  const [localLogoText1, setLocalLogoText1] = useState("DO COMEÇO");
  const [localLogoText2, setLocalLogoText2] = useState("AO TOPO");
  const [localLogoSub, setLocalLogoSub] = useState("PORTAL DE NEGÓCIOS");

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  // NEW TAB STATES FOR GALLERY / POSITIONED IMAGE UPLOADS
  const [activePanelTab, setActivePanelTab] = useState<"design" | "gallery">("design");
  const [positionedImages, setPositionedImages] = useState<any[]>([]);
  const [mediaGallery, setMediaGallery] = useState<string[]>([]);

  const loadPositionedImagesAndGallery = () => {
    // 1. Scan for positioned / uploaded images
    const list: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      if (
        key.startsWith("community-member-") ||
        key.startsWith("community-camp-") ||
        key.startsWith("ambassador-pic-") ||
        key.startsWith("quem-somos-profile-") ||
        key.startsWith("feed-article-") ||
        key.startsWith("img-pos-")
      ) {
        if (key.endsWith("_uploaded_src")) continue;

        // Get coordinates
        let x = 50;
        let y = 50;
        const savedPos = localStorage.getItem(key);
        if (savedPos) {
          try {
            const parsed = JSON.parse(savedPos);
            if (typeof parsed.x === "number" && typeof parsed.y === "number") {
              x = parsed.x;
              y = parsed.y;
            }
          } catch (e) {}
        }

        // Get matching source
        const uploadedSrc = localStorage.getItem(`${key}_uploaded_src`);

        let label = key;
        if (key.startsWith("community-member-")) {
          const parts = key.replace("community-member-", "").split("-");
          label = `Comunidade: ${parts.slice(1).join(" ")}`;
        } else if (key.startsWith("community-camp-")) {
          const parts = key.replace("community-camp-", "").split("-");
          label = `Campanha: ${parts.slice(1).join(" ")}`;
        } else if (key.startsWith("ambassador-pic-")) {
          const parts = key.replace("ambassador-pic-", "").split("-");
          label = `Embaixador: ${parts.slice(1).join(" ")}`;
        } else if (key === "quem-somos-profile-regina") {
          label = "Quem Somos: Regina Simões";
        } else if (key.startsWith("feed-article-")) {
          label = `Notícia: ID ${key.replace("feed-article-", "")}`;
        }

        list.push({
          key,
          label,
          x,
          y,
          src: uploadedSrc || "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600"
        });
      }
    }
    setPositionedImages(list);

    // 2. Load general media gallery
    const savedGallery = localStorage.getItem("general_media_gallery");
    if (savedGallery) {
      try {
        setMediaGallery(JSON.parse(savedGallery));
      } catch (e) {
        setMediaGallery([]);
      }
    } else {
      setMediaGallery([]);
    }
  };

  useEffect(() => {
    loadPositionedImagesAndGallery();
    window.addEventListener("image_updated", loadPositionedImagesAndGallery);
    return () => {
      window.removeEventListener("image_updated", loadPositionedImagesAndGallery);
    };
  }, []);

  const handleSliderChange = (key: string, axis: "x" | "y", val: number) => {
    const item = positionedImages.find(p => p.key === key);
    if (!item) return;

    const newPos = {
      x: axis === "x" ? val : item.x,
      y: axis === "y" ? val : item.y
    };

    localStorage.setItem(key, JSON.stringify(newPos));
    // Trigger global synchronization
    window.dispatchEvent(new Event("image_updated"));
  };

  const handleResetPositionedImage = (key: string) => {
    {
      localStorage.setItem(key, JSON.stringify({ x: 50, y: 50 }));
      window.dispatchEvent(new Event("image_updated"));
    }
  };

  const handleAddImageToGallery = (base64: string) => {
    const updated = [base64, ...mediaGallery].slice(0, 30); // limit to 30 to prevent localstorage bloat
    setMediaGallery(updated);
    localStorage.setItem("general_media_gallery", JSON.stringify(updated));
    playSuccessSound?.();
  };

  const handleRemoveFromGallery = (index: number) => {
    {
      const updated = mediaGallery.filter((_, idx) => idx !== index);
      setMediaGallery(updated);
      localStorage.setItem("general_media_gallery", JSON.stringify(updated));
    }
  };

  // Sync state if elements change in parent
  useEffect(() => {
    if (article) {
      setLocalTitle(article.title);
      setLocalExcerpt(article.excerpt);
      setLocalImg(article.imageUrl);
      setLocalHeight(article.customImageHeight || 192);
      setLocalUseCustomHeight(!!article.customImageHeight);
      setLocalWidthSpan((article.customWidthSpan || "col-span-1") as any);
      setLocalPadding((article.customPadding || "p-5") as any);
      setLocalRadius((article.customBorderRadius || "rounded-2xl") as any);
      setLocalGlow((article.customGlowColor || "none") as any);
      setLocalAspect((article.customAspectRatio || "auto") as any);
      setLocalAuthor(article.author || "Editor");
      setLocalLocation(article.location || "Juiz de Fora, MG");
    }
  }, [article]);

  useEffect(() => {
    if (logoConfig) {
      setLocalLogoImg(logoConfig.customImageUrl);
      setLocalLogoWidth(logoConfig.customLogoWidth || 36);
      setLocalLogoHeight(logoConfig.customLogoHeight || 36);
      setLocalLogoText1(logoConfig.customText1 || "DO COMEÇO");
      setLocalLogoText2(logoConfig.customText2 || "AO TOPO");
      setLocalLogoSub(logoConfig.customSub || "PORTAL DE NEGÓCIOS");
    }
  }, [logoConfig]);

  // Debounced Autosave for Article Designer
  useEffect(() => {
    if (!isOpen || !article) return;

    const hasChanged = 
      localTitle !== article.title ||
      localExcerpt !== article.excerpt ||
      localImg !== article.imageUrl ||
      (localUseCustomHeight ? localHeight !== article.customImageHeight : article.customImageHeight !== undefined) ||
      localWidthSpan !== (article.customWidthSpan || "col-span-1") ||
      localPadding !== (article.customPadding || "p-5") ||
      localRadius !== (article.customBorderRadius || "rounded-2xl") ||
      localGlow !== (article.customGlowColor || "none") ||
      localAspect !== (article.customAspectRatio || "auto") ||
      localAuthor !== (article.author || "Editor") ||
      localLocation !== (article.location || "Juiz de Fora, MG");

    if (!hasChanged) {
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      const updated: NewsArticle = {
        ...article,
        title: localTitle,
        excerpt: localExcerpt,
        imageUrl: localImg,
        customImageHeight: localUseCustomHeight ? localHeight : undefined,
        customWidthSpan: localWidthSpan,
        customPadding: localPadding,
        customBorderRadius: localRadius,
        customGlowColor: localGlow,
        customAspectRatio: localAspect,
        author: localAuthor,
        location: localLocation,
      };
      onSaveArticle(updated);
      setSaveStatus("saved");
      const idleTimer = setTimeout(() => setSaveStatus("idle"), 1500);
      return () => clearTimeout(idleTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    localTitle,
    localExcerpt,
    localImg,
    localHeight,
    localUseCustomHeight,
    localWidthSpan,
    localPadding,
    localRadius,
    localGlow,
    localAspect,
    localAuthor,
    localLocation,
    isOpen,
    article
  ]);

  // Debounced Autosave for Logo Designer
  useEffect(() => {
    if (!isOpen || !logoConfig || article) return;

    const hasChanged = 
      localLogoImg !== logoConfig.customImageUrl ||
      localLogoWidth !== (logoConfig.customLogoWidth || 36) ||
      localLogoHeight !== (logoConfig.customLogoHeight || 36) ||
      localLogoText1 !== (logoConfig.customText1 || "DO COMEÇO") ||
      localLogoText2 !== (logoConfig.customText2 || "AO TOPO") ||
      localLogoSub !== (logoConfig.customSub || "PORTAL DE NEGÓCIOS");

    if (!hasChanged) {
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      onSaveLogo({
        customImageUrl: localLogoImg,
        customLogoWidth: localLogoWidth,
        customLogoHeight: localLogoHeight,
        customText1: localLogoText1,
        customText2: localLogoText2,
        customSub: localLogoSub
      });
      setSaveStatus("saved");
      const idleTimer = setTimeout(() => setSaveStatus("idle"), 1500);
      return () => clearTimeout(idleTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [
    localLogoImg,
    localLogoWidth,
    localLogoHeight,
    localLogoText1,
    localLogoText2,
    localLogoSub,
    isOpen,
    logoConfig,
    article
  ]);

  if (!isOpen) return null;

  const handleApplyArticleChanges = () => {
    if (!article) return;
    const updated: NewsArticle = {
      ...article,
      title: localTitle,
      excerpt: localExcerpt,
      imageUrl: localImg,
      customImageHeight: localUseCustomHeight ? localHeight : undefined,
      customWidthSpan: localWidthSpan,
      customPadding: localPadding,
      customBorderRadius: localRadius,
      customGlowColor: localGlow,
      customAspectRatio: localAspect,
      author: localAuthor,
      location: localLocation,
    };
    onSaveArticle(updated);
  };

  const handleApplyLogoChanges = () => {
    onSaveLogo({
      customImageUrl: localLogoImg,
      customLogoWidth: localLogoWidth,
      customLogoHeight: localLogoHeight,
      customText1: localLogoText1,
      customText2: localLogoText2,
      customSub: localLogoSub
    });
  };

  return (
    <div
      id="visual-editor-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[440px] z-50 bg-stone-950 border-l border-zinc-850 text-white shadow-[0_0_50px_rgba(0,0,0,0.85)] flex flex-col justify-between animate-fade-in"
    >
      {/* HEADER SECTION */}
      <div className="p-4 border-b border-zinc-850 bg-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/15 text-pink-400 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#22c55e]">
              ESTÚDIO WEB DESIGN
            </h3>
            <span className="text-[9px] text-zinc-500 font-mono flex items-center gap-1.5 mt-0.5">
              <span>Layout em tempo real</span>
              <span>•</span>
              {saveStatus === "saving" && <span className="text-amber-400 font-bold animate-pulse">● Salvando</span>}
              {saveStatus === "saved" && <span className="text-green-400 font-bold">✓ Salvo</span>}
              {saveStatus === "idle" && <span className="text-zinc-500">Sincronizado</span>}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
          title="Fechar Estúdio de Design"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* NEW PANELS TAB NAVIGATION */}
      <div className="flex border-b border-zinc-900 bg-black/60 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => {
            setActivePanelTab("design");
            playClickSound?.();
          }}
          className={`flex-1 py-2 text-center text-[10px] font-mono uppercase font-black tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${
            activePanelTab === "design"
              ? "bg-[#22c55e]/15 text-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.15)] font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <span>🎨 Aparência</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActivePanelTab("gallery");
            playClickSound?.();
          }}
          className={`flex-1 py-2 text-center text-[10px] font-mono uppercase font-black tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 border-none cursor-pointer ${
            activePanelTab === "gallery"
              ? "bg-[#22c55e]/15 text-[#22c55e] shadow-[0_0_12px_rgba(34,197,94,0.15)] font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <span>📷 Banco & Posição</span>
        </button>
      </div>

      {/* CORE CONFIGURATION AREA */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs font-sans custom-scrollbar">
        {activePanelTab === "design" ? (
          article ? (
            /* SECTION 1: ARTICLE CARD DESIGN CONFIG */
            <div className="space-y-6">
              <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-pink-400 uppercase">Editando Elemento</span>
                <h4 className="font-bold text-xs text-white line-clamp-1">{article.title}</h4>
                <span className="text-[9px] text-zinc-500 block">ID: {article.id}</span>
              </div>

              {/* LIVE CONTENT FORM */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Conteúdo Rápido do Card:
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    placeholder="Título do card..."
                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-zinc-880 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-green-400"
                  />
                  <textarea
                    value={localExcerpt}
                    onChange={(e) => setLocalExcerpt(e.target.value)}
                    placeholder="Texto descritivo..."
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-stone-900 border border-zinc-880 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>

              {/* IMAGE SWAPPING SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-pink-500" />
                    Trocar Imagem de Capa:
                  </label>
                  
                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 cursor-pointer border border-pink-500/30 transition-all text-[9.5px] font-mono uppercase font-black">
                    <Camera className="w-3 h-3" />
                    <span>Fazer Upload</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Formato não suportado! Envie apenas fotos em formato JPG, PNG ou WEBP.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLocalImg(reader.result as string);
                            // Also save to global backup media gallery so they have it registered!
                            handleAddImageToGallery(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={localImg}
                  onChange={(e) => setLocalImg(e.target.value)}
                  placeholder="Cole o link de uma imagem (https://...)"
                  className="w-full p-2.5 rounded-lg bg-stone-900 border border-zinc-880 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-green-400"
                />
                {/* Presets Grid */}
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 block font-mono">Básico de Imagens Rápidas:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_ART__IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLocalImg(preset.url);
                          playClickSound?.();
                        }}
                        className="group/btn relative h-12 rounded-lg overflow-hidden border border-zinc-880 hover:border-pink-500 transition-all text-left"
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover/btn:scale-110 transition duration-300 pointer-events-none" />
                        <div className="absolute inset-0 bg-black/60 flex items-end justify-center p-1">
                          <span className="text-[7px] text-zinc-350 truncate w-full text-center">{preset.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* IMAGE HEIGHT DIMENSION SLIDER */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-green-400" />
                    Dimensão: Altura da Imagem
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="chk-custom-height"
                      checked={localUseCustomHeight}
                      onChange={(e) => setLocalUseCustomHeight(e.target.checked)}
                      className="rounded text-pink-500 focus:ring-0 bg-zinc-900 border-zinc-800"
                    />
                    <label htmlFor="chk-custom-height" className="text-[9px] text-zinc-400 cursor-pointer">
                      Habilitar Altura Personalizada
                    </label>
                  </div>
                </div>

                {localUseCustomHeight ? (
                  <div className="space-y-2 p-3 bg-zinc-900/35 rounded-lg border border-zinc-850">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Mín: 100px</span>
                      <span className="text-white font-bold">{localHeight}px</span>
                      <span>Máx: 400px</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={400}
                      step={10}
                      value={localHeight}
                      onChange={(e) => setLocalHeight(Number(e.target.value))}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>
                ) : (
                  <p className="text-[9px] text-zinc-500 italic">
                    Usando proporção padrão baseada no layout selecionado (Ex: Grid usa 192px/h-48).
                  </p>
                )}
              </div>

              {/* ASPECT RATIO ASPECT PRESET */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Proporção da Capa (Aspect Ratio):
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { value: "auto", label: "Automático" },
                    { value: "square", label: "1:1 QD" },
                    { value: "video", label: "16:9 HD" },
                    { value: "tall", label: "3:4 VT" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLocalAspect(opt.value as any);
                        playClickSound?.();
                      }}
                      className={`p-1.5 rounded text-[9px] font-mono border text-center transition ${
                        localAspect === opt.value
                          ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white border-pink-500 font-bold"
                          : "bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD WIDTH GRID WIDTH OPTIONS */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Dimensão: Largura no Grid (Desktop):
                </label>
                <p className="text-[9px] text-zinc-500 leading-tight mb-2">
                  Configure a expansão de colunas do card na tela principal.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "col-span-1", label: "1 Coluna" },
                    { key: "col-span-2", label: "2 Colunas" },
                    { key: "col-span-3", label: "Destaque Inteiro" },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => {
                        setLocalWidthSpan(opt.key as any);
                        playClickSound?.();
                      }}
                      className={`p-2 rounded-lg border text-[9px] font-mono text-center transition-all ${
                        localWidthSpan === opt.key
                          ? "bg-green-500/15 text-green-400 border-green-500 font-bold shadow-[0_0_10px_rgba(34,197,94,0.15)]"
                          : "bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD FORMAT / BORDER RADIUS / PADDING MULTI EDITORS */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-900 pt-4">
                {/* Radius */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                    Arredondamento:
                  </label>
                  <select
                    value={localRadius}
                    onChange={(e) => setLocalRadius(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-stone-900 border border-zinc-850 text-[10px] focus:outline-none focus:border-pink-500"
                  >
                    <option value="rounded-none">Reto (0px)</option>
                    <option value="rounded-lg">Suave (8px)</option>
                    <option value="rounded-2xl">Arredondado (16px)</option>
                    <option value="rounded-3xl">Cápsula (24px)</option>
                  </select>
                </div>

                {/* Padding */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                    Espaçamento Interno:
                  </label>
                  <select
                    value={localPadding}
                    onChange={(e) => setLocalPadding(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-stone-900 border border-zinc-850 text-[10px] focus:outline-none focus:border-pink-500"
                  >
                    <option value="p-3">Compacto (12px)</option>
                    <option value="p-5">Padrão (20px)</option>
                    <option value="p-8">Espaçoso (32px)</option>
                  </select>
                </div>
              </div>

              {/* NEON HOVER SHADOW GLOW STYLE */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  Brilho Neon (Sombreamento no Mouse):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: "none", label: "Nenhum" },
                    { value: "pink", label: "Pink Glow" },
                    { value: "green", label: "Green Tech" },
                    { value: "emerald", label: "Emerald Aura" },
                    { value: "amber", label: "Amber Gold" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setLocalGlow(opt.value as any);
                        playClickSound?.();
                      }}
                      className={`px-2 py-1.5 rounded-md text-[9px] font-mono border transition ${
                        localGlow === opt.value
                          ? "bg-white text-black border-white font-bold"
                          : "bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AUTHOR AND DETAILS METADATA */}
              <div className="grid grid-cols-2 gap-3 border-t border-zinc-900 pt-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block">Autor</label>
                  <input
                    type="text"
                    value={localAuthor}
                    onChange={(e) => setLocalAuthor(e.target.value)}
                    className="w-full p-2 rounded bg-stone-900 border border-zinc-850 text-[10px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-mono uppercase text-zinc-500 font-bold block">Localização</label>
                  <input
                    type="text"
                    value={localLocation}
                    onChange={(e) => setLocalLocation(e.target.value)}
                    className="w-full p-2 rounded bg-stone-900 border border-zinc-850 text-[10px]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyArticleChanges();
                    playSuccessSound?.();
                  }}
                  className="w-full py-2.5 bg-[#22c55e] hover:bg-green-400 text-black font-mono font-black uppercase text-xs rounded-xl tracking-wider shadow-lg shadow-green-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Aplicar & Salvar no Portal</span>
                </button>
                <p className="text-[9px] text-zinc-500 text-center mt-1.5 animate-pulse">
                  Salva no servidor e atualiza o portal instantaneamente sem recarregar!
                </p>
              </div>
            </div>
          ) : (
            /* SECTION 2: BRAND LOGO STYLE AND LABELS CONFIG */
            <div className="space-y-6">
              <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-[#22c55e] uppercase">Editando Elemento</span>
                <h4 className="font-bold text-xs text-white">Logomarca & Identidade Visual</h4>
                <span className="text-[9px] text-zinc-500 block">Header / Footer Global</span>
              </div>

              {/* EDIT BRAND TYPOGRAPHY CORES */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                  <Type className="w-3.5 h-3.5 text-pink-500" />
                  Textos do Logotipo:
                </label>
                <div className="space-y-2 p-3 bg-zinc-900/30 rounded-xl border border-zinc-850">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Texto Principal 1</span>
                    <input
                      type="text"
                      value={localLogoText1}
                      onChange={(e) => setLocalLogoText1(e.target.value)}
                      placeholder="Ex: DO COMEÇO"
                      className="w-full p-2 rounded bg-stone-900 border border-zinc-850 text-white text-xs placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Texto Principal 2 (Neon C/ Degradê)</span>
                    <input
                      type="text"
                      value={localLogoText2}
                      onChange={(e) => setLocalLogoText2(e.target.value)}
                      placeholder="Ex: AO TOPO"
                      className="w-full p-2 rounded bg-stone-900 border border-zinc-850 text-white text-xs placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 uppercase font-mono">Slogan / Subtítulo</span>
                    <input
                      type="text"
                      value={localLogoSub}
                      onChange={(e) => setLocalLogoSub(e.target.value)}
                      placeholder="Ex: PORTAL DE NEGÓCIOS"
                      className="w-full p-2 rounded bg-stone-900 border border-zinc-850 text-white text-xs placeholder-zinc-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* LOGO IMAGE LINK SWAP */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold flex items-center gap-1">
                    <Image className="w-3.5 h-3.5 text-green-400" />
                    Trocar Ícone da Marca (Imagem):
                  </label>
                  
                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 hover:bg-green-500/20 text-green-400 cursor-pointer border border-green-500/30 transition-all text-[9.5px] font-mono uppercase font-black">
                    <Camera className="w-3 h-3" />
                    <span>Fazer Upload</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Formato não suportado! Envie apenas fotos em formato JPG, PNG ou WEBP.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLocalLogoImg(reader.result as string);
                            // Registry upload to general gallery
                            handleAddImageToGallery(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={localLogoImg}
                  onChange={(e) => setLocalLogoImg(e.target.value)}
                  placeholder="Insira a URL do ícone/logo comercial"
                  className="w-full p-2.5 rounded-lg bg-stone-900 border border-zinc-850 text-white text-xs placeholder-zinc-500 focus:outline-none"
                />
                {/* Presets Grid */}
                <div className="space-y-1">
                  <span className="text-[9px] text-zinc-500 block font-mono">Sugestões de Ícones Premium:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_LOGO_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setLocalLogoImg(preset.url);
                          playClickSound?.();
                        }}
                        className="group/btn relative h-10 rounded overflow-hidden border border-zinc-850 hover:border-green-400 transition"
                        title={preset.label}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-full object-cover pointer-events-none" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* LOGO DIMENSIONS SLIDERS */}
              <div className="space-y-3 border-t border-zinc-900 pt-4">
                <label className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                  Dimensões do Ícone (Largura e Altura):
                </label>
                <div className="space-y-4 p-3 bg-zinc-900/30 rounded-xl border border-zinc-850">
                  {/* Width */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span>Largura</span>
                      <span className="text-white font-bold">{localLogoWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={120}
                      step={2}
                      value={localLogoWidth}
                      onChange={(e) => {
                        setLocalLogoWidth(Number(e.target.value));
                        setLocalLogoHeight(Number(e.target.value)); // keep proportional icon ratio!
                      }}
                      className="w-full accent-[#22c55e] cursor-pointer"
                    />
                  </div>

                  <p className="text-[8px] text-zinc-500 italic leading-snug">
                    *O editor ajusta a largura e mantém as proporções inteligentes do avatar quadrado para coerência estética.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyLogoChanges();
                    playSuccessSound?.();
                  }}
                  className="w-full py-2.5 bg-[#22c55e] hover:bg-green-400 text-black font-mono font-black uppercase text-xs rounded-xl tracking-wider shadow-lg shadow-green-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Salvar Configuração</span>
                </button>
              </div>
            </div>
          )
        ) : (
          /* =======================================================
             📷 TAB 2: LIBRARY / BANK OF IMAGES & POSITION ENQUADRAMENTO
             ======================================================= */
          <div className="space-y-6">
            {/* 1. DROPZONE & UPLOAD AREA */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono uppercase text-green-400 font-bold flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                Carregar Novas Imagens p/ Biblioteca:
              </label>

              {/* Drop / Drag Zone */}
              <div 
                className="group relative p-6 bg-zinc-900/50 border-2 border-dashed border-zinc-800 hover:border-green-500/50 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-900/80 transition-all duration-300"
                onClick={() => {
                  const picker = document.getElementById("general-file-uploader-panel");
                  picker?.click();
                }}
              >
                <div className="p-3 rounded-full bg-zinc-800 text-zinc-400 group-hover:bg-green-500/10 group-hover:text-green-400 transition-all mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition">Clique para subir arquivos</span>
                <span className="text-[9px] text-zinc-500 mt-1">Formato JPG, PNG, WEBP (Limite 5MB)</span>
                
                <input
                  id="general-file-uploader-panel"
                  type="file"
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      Array.from(files).forEach((file: any) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          handleAddImageToGallery(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                />
              </div>

              {/* Alternative Quick Input Link */}
              <div className="space-y-1">
                <span className="text-[9px] text-zinc-500 font-mono">Deseja adicionar URL externa à sua galeria?</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="url-gallery-quickadd"
                    placeholder="Cole um link https://..."
                    className="flex-1 p-2 rounded bg-stone-900 border border-zinc-850 text-[10px] text-white focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.currentTarget as HTMLInputElement).value;
                        if (val && val.startsWith("http")) {
                          handleAddImageToGallery(val);
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const inp = document.getElementById("url-gallery-quickadd") as HTMLInputElement;
                      if (inp && inp.value && inp.value.startsWith("http")) {
                        handleAddImageToGallery(inp.value);
                        inp.value = "";
                      }
                    }}
                    className="px-3 bg-zinc-800 border border-zinc-700 hover:bg-green-500 hover:text-black rounded text-[10px] font-mono uppercase font-black"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>

            {/* 2. PERSISTENT PHOTO BANK GALLERY */}
            <div className="space-y-3 pt-3 border-t border-zinc-900">
              <label className="text-[10px] font-mono uppercase text-pink-400 font-bold flex items-center justify-between">
                <span>Biblioteca Local ({mediaGallery.length} fotos)</span>
                {mediaGallery.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      {
                        setMediaGallery([]);
                        localStorage.removeItem("general_media_gallery");
                      }
                    }}
                    className="text-[8px] text-zinc-500 hover:text-red-400 underline font-mono flex items-center gap-1"
                  >
                    Limpar Tudo
                  </button>
                )}
              </label>

              {mediaGallery.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-850 text-center text-zinc-500 italic text-[10px]">
                  Sua biblioteca local está vazia. <br />Suba fotos acima para começar a utilizá-las nos cards!
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {mediaGallery.map((base64, index) => (
                    <div
                      key={index}
                      className="group/photoItem relative h-14 rounded-lg overflow-hidden bg-stone-900 border border-zinc-800 hover:border-[#22c55e] transition"
                    >
                      <img src={base64} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                      
                      {/* Action Overlays */}
                      <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-1 gap-1.5 opacity-0 group-hover/photoItem:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Definir como imagem de capa activa"
                          onClick={() => {
                            if (article) {
                              setLocalImg(base64);
                              playSuccessSound?.();
                            } else {
                              setLocalLogoImg(base64);
                              playSuccessSound?.();
                            }
                          }}
                          className="px-1.5 py-0.5 rounded bg-[#22c55e] hover:bg-green-400 text-black text-[7px] font-mono font-bold uppercase tracking-wider block"
                        >
                          Usar
                        </button>
                        
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            title="Copiar link/base64"
                            onClick={() => {
                              navigator.clipboard.writeText(base64);
                              toast.success("Copiado com sucesso para a área de transferência!");
                            }}
                            className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            title="Deletar da galeria"
                            onClick={() => handleRemoveFromGallery(index)}
                            className="p-1 rounded bg-zinc-800 text-red-400 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. PHYSICAL IMAGE COORDS / POSITION ADJUSTERS FOR THE ACTIVE SITE PHOTOS */}
            <div className="space-y-3 pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase text-[#22c55e] font-bold flex items-center gap-1">
                  <Move className="w-3.5 h-3.5" />
                  Foco & Alinhamento das Fotos do Site:
                </label>
                <button
                  type="button"
                  onClick={loadPositionedImagesAndGallery}
                  className="text-[9px] text-zinc-500 hover:text-white flex items-center gap-1 font-mono uppercase font-bold"
                  title="Recarregar imagens posicionais detectadas"
                >
                  <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />
                  <span>Atualizar</span>
                </button>
              </div>

              <p className="text-[9.5px] text-zinc-400 leading-normal">
                Abaixo estão listadas as fotos flexíveis identificadas nas seções do site. Ajuste as guias horizontais (X) e verticais (Y) para o perfeito enquadramento dos rostos nas molduras:
              </p>

              {positionedImages.length === 0 ? (
                <div className="p-4 rounded-xl bg-zinc-900/30 border border-zinc-850 text-center text-zinc-500 italic text-[10px]">
                  Nenhuma imagem posicional identificada nesta página.
                </div>
              ) : (
                <div className="space-y-4">
                  {positionedImages.map((p) => (
                    <div 
                      key={p.key}
                      className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:border-zinc-750 transition duration-300 space-y-3"
                    >
                      {/* Name header & Mini Circle preview */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800 bg-stone-900">
                            <img 
                              src={p.src} 
                              alt="preview" 
                              className="w-full h-full object-cover" 
                              style={{ objectPosition: `${p.x}% ${p.y}%` }}
                            />
                          </div>
                          <div>
                            <span className="font-bold text-[10px] text-zinc-200 block line-clamp-1">{p.label}</span>
                            <span className="text-[7.5px] font-mono text-zinc-500 uppercase">{p.key.slice(0, 32)}...</span>
                          </div>
                        </div>

                        {/* Reset & Quick Camera swap for this slot */}
                        <div className="flex items-center gap-1.5">
                          <label className="p-1 rounded-lg bg-zinc-800 hover:bg-green-500 hover:text-black text-zinc-400 cursor-pointer transition shadow-sm" title="Substituir foto deste slot">
                            <Camera className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    localStorage.setItem(`${p.key}_uploaded_src`, reader.result as string);
                                    window.dispatchEvent(new Event("image_updated"));
                                    playSuccessSound?.();
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => handleResetPositionedImage(p.key)}
                            className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                            title="Resetar coordenadas ao centro (50%, 50%)"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Coordinates adjustments range sliders */}
                      <div className="grid grid-cols-2 gap-3.5 bg-zinc-950/40 p-2.5 rounded-lg border border-zinc-900">
                        {/* X coordinates */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                            <span>Eixo X (Esq/Dir)</span>
                            <span className="text-pink-400 font-bold">{p.x}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={p.x}
                            onChange={(e) => handleSliderChange(p.key, "x", Number(e.target.value))}
                            className="w-full accent-pink-500 cursor-pointer h-1 rounded"
                          />
                        </div>

                        {/* Y coordinates */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                            <span>Eixo Y (Alt/Baix)</span>
                            <span className="text-green-400 font-bold">{p.y}%</span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={p.y}
                            onChange={(e) => handleSliderChange(p.key, "y", Number(e.target.value))}
                            className="w-full accent-green-400 cursor-pointer h-1 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RECENT CHANGES FEEDBACK / SAVE CONTROLS SECTION */}
      <div className="p-4 bg-black border-t border-zinc-850 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-mono">
          {saveStatus === "saving" && (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-400 font-bold">Autosave: Salvando...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-green-400 font-bold">Autosave: Salvo ✓</span>
            </>
          )}
          {saveStatus === "idle" && (
            <>
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <span className="text-zinc-500">Autosave: Sincronizado</span>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          type="button"
          className="px-4 py-1.5 text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono hover:text-white rounded-lg transition-all"
        >
          Fechar Estúdio
        </button>
      </div>
    </div>
  );
}
