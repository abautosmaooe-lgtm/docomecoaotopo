import React, { useState, useEffect, useRef } from "react";
import { Camera, Plus, Trash2, X, Maximize2, Shield, Calendar, MapPin, ChevronLeft, ChevronRight, Image, Upload } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface PhotoItem {
  id: string;
  url: string;
  title: string;
  location: string;
  date: string;
  isCustom?: boolean;
}

const PRELOADED_COMUNIDADE_PHOTOS: PhotoItem[] = [];

const PRELOADED_EMBAIXADORES_PHOTOS: PhotoItem[] = [];

const RECOMMENDED_STOCK_URLS = [
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80"
];

interface PhotoGalleryProps {
  mode: "comunidade" | "embaixadores";
}

export default function PhotoGallery({ mode }: PhotoGalleryProps) {
  const isComunidade = mode === "comunidade";
  const storageKey = isComunidade ? "comunidade_photos_db" : "embaixadores_photos_db";
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for storing photo items
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  
  // Input form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoLocation, setPhotoLocation] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Lightbox index state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let basePhotos = isComunidade ? PRELOADED_COMUNIDADE_PHOTOS : PRELOADED_EMBAIXADORES_PHOTOS;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          basePhotos = parsed.filter((p: any) => p.isCustom);
        } else {
          basePhotos = isComunidade ? PRELOADED_COMUNIDADE_PHOTOS : PRELOADED_EMBAIXADORES_PHOTOS;
        }
      } catch (e) {
        basePhotos = isComunidade ? PRELOADED_COMUNIDADE_PHOTOS : PRELOADED_EMBAIXADORES_PHOTOS;
      }
    }

    // Load server-side published photos
    fetch(`/api/photos?gallery=${mode}`)
      .then(res => res.json())
      .then(serverPhotos => {
        if (Array.isArray(serverPhotos) && serverPhotos.length > 0) {
          const merged = [...serverPhotos];
          basePhotos.forEach(localItem => {
            if (!merged.some(item => item.id === localItem.id) && !localItem.isCustom) {
              merged.push(localItem);
            }
          });
          setPhotos(merged);
        } else {
          setPhotos(basePhotos);
        }
      })
      .catch(err => {
        console.error("Error fetching published photos from server:", err);
        setPhotos(basePhotos);
      });
  }, [mode, storageKey]);

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !photoTitle) {
      setUploadError("Por favor, selecione uma foto e insira um título.");
      return;
    }

    const newPhoto: PhotoItem = {
      id: `photo-${Date.now()}`,
      url: photoUrl,
      title: photoTitle,
      location: photoLocation || "Zona da Mata, MG",
      date: photoDate ? photoDate.split("-").reverse().join("/") : new Date().toLocaleDateString("pt-BR"),
      isCustom: true
    };

    fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery: mode, item: newPhoto })
    })
      .then(res => res.json())
      .then(publishedPhoto => {
        const updated = [publishedPhoto, ...photos.filter(p => p.id !== newPhoto.id)];
        setPhotos(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        playSuccessSound();

        // Reset inputs
        setPhotoUrl("");
        setPhotoTitle("");
        setPhotoLocation("");
        setPhotoDate("");
        setUploadError("");
        setShowAddForm(false);
      })
      .catch(err => {
        console.error("Error publishing photo server-side:", err);
        // Fallback to local
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
        playSuccessSound();

        // Reset inputs
        setPhotoUrl("");
        setPhotoTitle("");
        setPhotoLocation("");
        setPhotoDate("");
        setUploadError("");
        setShowAddForm(false);
      });
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    {
      playClickSound(400, "sine");
      const updated = photos.filter(p => p.id !== id);
      setPhotos(updated);
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(650, "sine");
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + photos.length) % photos.length));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(650, "sine");
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % photos.length));
    }
  };

  const selectRecommendedUrl = (url: string) => {
    playClickSound(600, "sine");
    setPhotoUrl(url);
  };

  return (
    <div id={`photo-gallery-section-${mode}`} className="space-y-6">
      
      {/* SECTION HEADER BLOCK */}
      <div className={`p-5 rounded-3xl border ${
        isComunidade 
          ? "bg-gradient-to-r from-emerald-500/10 via-stone-900 to-green-600/10 border-green-500/20" 
          : "bg-gradient-to-r from-pink-500/10 via-stone-900 to-red-600/10 border-pink-500/20"
      } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="space-y-1.5 text-left">
          <h3 className={`font-display font-black text-sm uppercase tracking-wider flex items-center gap-2 ${
            isComunidade ? "text-green-400" : "text-pink-400"
          }`}>
            <Camera className="w-4.5 h-4.5 animate-pulse" />
            <span>GALERIA DE FOTOS REGIONAIS ({photos.length})</span>
          </h3>
          <p className="text-zinc-400 text-xs font-mono max-w-xl leading-relaxed">
            Acervo visual dos encontros presenciais, pautas debatidas, rodadas de novos negócios e credenciamentos realizados pela rede em nossa região.
          </p>
        </div>

        <button
          onClick={() => { playClickSound(650, "sine"); setShowAddForm(!showAddForm); }}
          className={`px-4 py-2 font-mono text-xs font-black uppercase rounded-xl transition duration-200 shrink-0 flex items-center gap-1.5 ${
            isComunidade
              ? "bg-green-500 text-black hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
              : "bg-pink-500 text-black hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
          }`}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showAddForm ? "Cancelar Registro" : "Adicionar Foto"}</span>
        </button>
      </div>

      {/* EXPANDABLE ADD PHOTO FORM CONTAINER */}
      {showAddForm && (
        <div className={`p-6 rounded-2xl border ${
          isComunidade ? "border-green-500/30 bg-green-500/[0.02]" : "border-pink-500/30 bg-pink-500/[0.02]"
        } text-left space-y-4 animate-fade-in`}>
          <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-zinc-400" />
              Registrar Nova Imagem no Acervo
            </h4>
            <span className="text-[10px] text-pink-400 font-mono font-black uppercase">Fazer Upload ou Escolher preset</span>
          </div>

          <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
            {uploadError && (
              <div className="p-3 bg-red-550/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-[10.5px] font-bold">
                ⚠️ {uploadError}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Local File Uploader Zone */}
              <div className="md:col-span-4 space-y-1.5">
                <span className="block text-[10px] font-mono text-zinc-400 uppercase font-black">1. Upload de Imagem Local</span>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition p-4 relative overflow-hidden ${
                    photoUrl.startsWith("data:image/")
                      ? "border-pink-500 bg-pink-500/5"
                      : "border-zinc-800 hover:border-pink-400/50 hover:bg-zinc-900/10"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                        if (!allowedTypes.includes(file.type)) {
                          setUploadError("Formato de arquivo não suportado! Envie apenas JPG, PNG ou WEBP.");
                          setPhotoUrl("");
                          return;
                        }
                        setUploadError("");
                        const r = new FileReader();
                        r.onloadend = () => {
                          const b64 = r.result as string;
                          setPhotoUrl(b64);
                          playSuccessSound();
                        };
                        r.readAsDataURL(file);
                      }
                    }}
                  />
                  
                  {photoUrl.startsWith("data:image/") ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black/60">
                      <img src={photoUrl} alt="Preview do arquivo" className="max-h-full object-contain" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPhotoUrl(""); }}
                        className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/95 text-white hover:text-red-400 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5">
                      <Upload className={`w-7 h-7 mx-auto ${isComunidade ? "text-green-400" : "text-pink-400"} animate-bounce`} />
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-bold text-white">Carregar Arquivo Local</p>
                        <p className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono">Clique para selecionar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form details */}
              <div className="md:col-span-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Título / Legenda da Foto</label>
                    <input
                      type="text"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                      className="w-full bg-stone-950 border border-zinc-800 focus:border-zinc-700 p-2.5 rounded-lg text-xs text-white"
                      placeholder="Ex: Almoço Executivo de Encerramento do Fórum"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Ou insira Link da Foto (URL Pública)</label>
                    <input
                      type="text"
                      value={photoUrl.startsWith("data:image/") ? "" : photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-stone-950 border border-zinc-800 focus:border-emerald-500 p-2.5 rounded-lg text-xs text-white font-mono"
                      placeholder="https://images.unsplash.com/..."
                      disabled={photoUrl.startsWith("data:image/")}
                    />
                    {photoUrl.startsWith("data:image/") && (
                      <span className="text-[8px] text-pink-400 font-mono italic">Imagem carregada via upload local ativa!</span>
                    )}
                  </div>
                </div>

                {/* QUICK PRESETS FOR IMAGE URLS */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-mono text-zinc-500 uppercase font-black">Ou escolha uma Imagem Recomendada do Acervo:</span>
                  <div className="flex flex-wrap gap-2">
                    {RECOMMENDED_STOCK_URLS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectRecommendedUrl(url)}
                        className={`w-14 h-9 rounded-md overflow-hidden border transition shrink-0 ${
                          photoUrl === url ? "border-green-400 scale-105" : "border-zinc-850 opacity-65 hover:opacity-100"
                        }`}
                      >
                        <img src={url} alt={`Estoque preset ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Cidade e Local do Registro</label>
                <input
                  type="text"
                  value={photoLocation}
                  onChange={(e) => setPhotoLocation(e.target.value)}
                  className="w-full bg-stone-950 border border-zinc-800 focus:border-zinc-700 p-2.5 rounded-lg text-xs text-white"
                  placeholder="Ex: Centro de Vivências, Rodeiro - MG"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Data do Registro</label>
                <input
                  type="date"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  className="w-full bg-stone-950 border border-zinc-800 focus:border-zinc-700 p-2.5 rounded-lg text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-900/40">
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-mono font-black uppercase text-black transition active:scale-95 ${
                  isComunidade ? "bg-green-500 hover:bg-green-400" : "bg-pink-500 hover:bg-pink-400"
                }`}
              >
                PUBLICAR NA GALERIA REGIONAL
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PHOTO GRID CANVAS */}
      {photos.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-stone-950 border border-zinc-900 flex flex-col items-center justify-center space-y-2">
          <Image className="w-8 h-8 text-zinc-600 animate-pulse" />
          <p className="text-zinc-500 font-mono text-xs">Galeria vazia. Adicione novas fotos de suas atividades!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {photos.map((pt, idx) => (
            <div
              key={pt.id}
              onClick={() => { playClickSound(550, "sine"); setLightboxIndex(idx); }}
              className="group bg-stone-950/60 border border-zinc-900 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-300 cursor-pointer flex flex-col justify-between relative shadow-sm hover:shadow-md"
            >
              
              {/* IMAGE HOVER ACTION WRAPPER */}
              <div className="relative h-48 md:h-52 w-full bg-zinc-950 overflow-hidden border-b border-zinc-900/80">
                <img 
                  src={pt.url} 
                  alt={pt.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay layer */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
                
                {/* Maximize Icon on Hover */}
                <div className="absolute top-3 right-3 bg-black/85 border border-zinc-800 p-2 rounded-xl text-zinc-400 opacity-0 group-hover:opacity-100 transition duration-200 z-10 hover:text-white">
                  <Maximize2 className="w-3.5 h-3.5" />
                </div>

                {/* Delete direct widget */}
                {pt.isCustom && (
                  <button
                    onClick={(e) => handleDeletePhoto(pt.id, e)}
                    className="absolute top-3 left-3 bg-black/90 hover:bg-red-950 border border-zinc-800 hover:border-red-500/55 p-2 rounded-xl text-zinc-400 hover:text-red-400 transition"
                    title="Remover esta foto da galeria"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Date overlay tag */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 font-mono text-[9px] text-zinc-300 bg-black/75 px-2.5 py-1 rounded-lg border border-zinc-900/60 font-bold">
                  <Calendar className="w-3 h-3 text-pink-500" />
                  <span>{pt.date}</span>
                </div>
              </div>

              {/* CARD BRIEF TEXT */}
              <div className="p-4 space-y-1.5 text-left flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-display font-black text-xs text-white uppercase tracking-tight leading-tight group-hover:text-pink-400 duration-200 line-clamp-2">
                    {pt.title}
                  </h4>
                </div>
                
                <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-450 font-mono pt-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span className="truncate">{pt.location}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX PORTAL OVERLAY */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 text-center select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-900/50 max-w-5xl mx-auto w-full text-[11px] font-mono text-zinc-400">
            <span className="uppercase tracking-widest font-black text-white/90 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-pink-500" />
              <span>ACERVO VISUAL DOComeço</span>
            </span>
            <div className="flex items-center gap-4">
              <span>Imagem {lightboxIndex + 1} de {photos.length}</span>
              <button
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-full transition"
                title="Fechar galeria"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Stage with Navigation */}
          <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-4">
            
            {/* Left Button */}
            <button
              onClick={handlePrevImage}
              className="absolute left-2 z-10 w-11 h-11 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-650 text-white hover:scale-105 transition rounded-full flex items-center justify-center shadow-lg"
              title="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Main Picture */}
            <div 
              className="relative max-h-[68vh] max-w-full rounded-2xl overflow-hidden border border-zinc-900 shadow-2xl flex items-center justify-center bg-black"
              onClick={(e) => e.stopPropagation()} // Prevents closing of lightbox
            >
              <img 
                src={photos[lightboxIndex].url}
                alt={photos[lightboxIndex].title}
                className="max-h-[68vh] max-w-full md:max-w-4xl object-contain animate-fade-in"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Button */}
            <button
              onClick={handleNextImage}
              className="absolute right-2 z-10 w-11 h-11 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-650 text-white hover:scale-105 transition rounded-full flex items-center justify-center shadow-lg"
              title="Próxima"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Footer Metadata Info Bar */}
          <div 
            className="p-4 bg-zinc-950/80 border border-zinc-900 max-w-2xl mx-auto w-full rounded-2xl mb-2 text-left space-y-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-display font-black text-sm uppercase text-white tracking-tight">
              {photos[lightboxIndex].title}
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-zinc-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{photos[lightboxIndex].location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                <span>Registrado em {photos[lightboxIndex].date}</span>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
