import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, Plus, Trash2, X, Maximize2, Calendar, MapPin, 
  ChevronLeft, ChevronRight, Image as ImageIcon, SlidersHorizontal, 
  Eye, Tag, Upload, Search, Filter, Edit, Check
} from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import ImageCropperModal from "./ImageCropperModal";

interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  theme: string;
  city: string;
  views: number;
  date: string; // YYYY-MM-DD
  isCustom?: boolean;
  gallery?: string;
}

const PRELOADED_GALLERY: GalleryPhoto[] = [
  {
    id: "photo-init-1",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    title: "Encontro Estratégico de Liderança e Negócios",
    theme: "Negócios",
    city: "Juiz de Fora",
    views: 48,
    date: "2026-05-15",
    isCustom: false,
    gallery: "global"
  },
  {
    id: "photo-init-2",
    url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80",
    title: "Mesa Redonda com o Conselho de Embaixadores Oficiais",
    theme: "Embaixadores",
    city: "Juiz de Fora",
    views: 62,
    date: "2026-05-10",
    isCustom: false,
    gallery: "embaixadores"
  },
  {
    id: "photo-init-3",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    title: "Painel Mulheres Empreendedoras da Zona da Mata",
    theme: "Comunidade",
    city: "Juiz de Fora",
    views: 89,
    date: "2026-05-02",
    isCustom: false,
    gallery: "comunidade"
  },
  {
    id: "photo-init-4",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
    title: "Gravação Exclusiva no Estúdio Do Começo ao Topo Podcast",
    theme: "Mentoria",
    city: "Juiz de Fora",
    views: 114,
    date: "2026-04-28",
    isCustom: false,
    gallery: "global"
  },
  {
    id: "photo-init-5",
    url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    title: "Workshop de Posicionamento e Estratégia Comercial",
    theme: "Educação",
    city: "Matias Barbosa",
    views: 37,
    date: "2026-04-20",
    isCustom: false,
    gallery: "global"
  },
  {
    id: "photo-init-6",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    title: "Rodada de Parcerias e Conexões na Região da Mata",
    theme: "Negócios",
    city: "Ubá",
    views: 53,
    date: "2026-04-12",
    isCustom: false,
    gallery: "global"
  }
];

const THEMES_LIST = ["Todos", "Negócios", "Embaixadores", "Comunidade", "Agronegócio", "Educação", "Desenvolvimento", "Mentoria", "Tecnologia"];

const normalizeToGalleryPhoto = (item: any, defaultTheme = "Negócios", defaultGallery = "global"): GalleryPhoto => {
  let formattedDate = item.date || new Date().toISOString().split("T")[0];
  if (typeof formattedDate === "string" && formattedDate.includes("/")) {
    const parts = formattedDate.split("/");
    if (parts.length === 3) {
      formattedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  const detectedTheme = item.theme || (item.gallery === "embaixadores" ? "Embaixadores" : item.gallery === "comunidade" ? "Comunidade" : defaultTheme);
  return {
    id: String(item.id || `photo-${Date.now()}-${Math.random()}`),
    url: item.url || "",
    title: item.title || "Registro Visual Regional",
    theme: detectedTheme,
    city: item.city || item.location || "Juiz de Fora",
    views: item.views || Math.floor(Math.random() * 25) + 5,
    date: formattedDate,
    isCustom: item.isCustom ?? true,
    gallery: item.gallery || defaultGallery
  };
};


interface GlobalPhotoGalleryProps {
  isDarkMode: boolean;
  isAdmin: boolean;
  portalPagesConfig?: any;
  CITIES_LIST: string[];
}

export default function GlobalPhotoGallery({ isDarkMode, isAdmin, portalPagesConfig, CITIES_LIST }: GlobalPhotoGalleryProps) {
  const dynamicCitiesWithTodas = ["Todas", ...CITIES_LIST];
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("Todos");
  const [selectedCity, setSelectedCity] = useState("Todas");
  const [sortOption, setSortOption] = useState<"relevancia" | "recente" | "antigo">("recente");
  const [searchQuery, setSearchQuery] = useState("");

  // Sub-tabs: Gallery vs Upload
  const [activeSubTab, setActiveSubTab] = useState<"galeria" | "incluir">("galeria");
  const [localSimulateAdmin, setLocalSimulateAdmin] = useState(true);

  // Upload state
  const [uploadMode, setUploadMode] = useState<"single" | "batch">("single");
  const [batchPhotos, setBatchPhotos] = useState<Array<{ id: string; url: string; title: string }>>([]);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadTheme, setUploadTheme] = useState("Negócios");
  const [uploadCity, setUploadCity] = useState("Juiz de Fora");
  const [uploadDate, setUploadDate] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropperSource, setCropperSource] = useState<string>("");
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Edit state
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTheme, setEditTheme] = useState("Negócios");
  const [editCity, setEditCity] = useState("Juiz de Fora");
  const [editDate, setEditDate] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effective administrator check
  const isEffectiveAdmin = isAdmin;

  useEffect(() => {
    // 1. Gather photos from all local storages
    const allLocalPhotos: GalleryPhoto[] = [];
    const seenIds = new Set<string>();
    const seenUrls = new Set<string>();

    const addUniquePhoto = (photoItem: any, defaultTheme: string, defaultGallery: string) => {
      const normalized = normalizeToGalleryPhoto(photoItem, defaultTheme, defaultGallery);
      if (!normalized.url) return;
      if (!seenIds.has(normalized.id) && !seenUrls.has(normalized.url)) {
        seenIds.add(normalized.id);
        seenUrls.add(normalized.url);
        allLocalPhotos.push(normalized);
      }
    };

    // Load global photos
    const savedGlobal = localStorage.getItem("global_photo_gallery");
    if (savedGlobal) {
      try {
        const parsed = JSON.parse(savedGlobal);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => addUniquePhoto(p, "Negócios", "global"));
        }
      } catch (e) {
        console.error("Error parsing global_photo_gallery", e);
      }
    }

    // Load embaixadores photos
    const savedEmbaixadores = localStorage.getItem("embaixadores_photos_db");
    if (savedEmbaixadores) {
      try {
        const parsed = JSON.parse(savedEmbaixadores);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => addUniquePhoto(p, "Embaixadores", "embaixadores"));
        }
      } catch (e) {
        console.error("Error parsing embaixadores_photos_db", e);
      }
    }

    // Load comunidade photos
    const savedComunidade = localStorage.getItem("comunidade_photos_db");
    if (savedComunidade) {
      try {
        const parsed = JSON.parse(savedComunidade);
        if (Array.isArray(parsed)) {
          parsed.forEach(p => addUniquePhoto(p, "Comunidade", "comunidade"));
        }
      } catch (e) {
        console.error("Error parsing comunidade_photos_db", e);
      }
    }

    // 2. Query all published server-side photos (all galleries combined)
    fetch("/api/photos")
      .then(res => res.json())
      .then(serverPhotos => {
        if (Array.isArray(serverPhotos) && serverPhotos.length > 0) {
          const combinedList: GalleryPhoto[] = [];
          const currentSeenIds = new Set<string>();
          const currentSeenUrls = new Set<string>();

          // Prefer server photos
          serverPhotos.forEach(sp => {
            const normalized = normalizeToGalleryPhoto(sp, sp.gallery === "embaixadores" ? "Embaixadores" : sp.gallery === "comunidade" ? "Comunidade" : "Negócios", sp.gallery || "global");
            if (normalized.url && !currentSeenIds.has(normalized.id) && !currentSeenUrls.has(normalized.url)) {
              currentSeenIds.add(normalized.id);
              currentSeenUrls.add(normalized.url);
              combinedList.push(normalized);
            }
          });

          // Add any local photos not present in server
          allLocalPhotos.forEach(lp => {
            if (!currentSeenIds.has(lp.id) && !currentSeenUrls.has(lp.url)) {
              currentSeenIds.add(lp.id);
              currentSeenUrls.add(lp.url);
              combinedList.push(lp);
            }
          });

          setPhotos(combinedList.length > 0 ? combinedList : PRELOADED_GALLERY);
        } else {
          setPhotos(allLocalPhotos.length > 0 ? allLocalPhotos : PRELOADED_GALLERY);
        }
      })
      .catch(err => {
        console.error("Error fetching published photos from server:", err);
        setPhotos(allLocalPhotos.length > 0 ? allLocalPhotos : PRELOADED_GALLERY);
      });

    // Add event listener for quick upload opening from + CRIAR NOVO admin button
    const handleOpenUpload = () => {
      setActiveSubTab("incluir");
      const element = document.getElementById("add-photos-page-view") || document.getElementById("global-photo-gallery-root");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("admin_open_photo_upload", handleOpenUpload);

    const handlePhotosUpdated = () => {
      fetch("/api/photos")
        .then(res => res.json())
        .then(serverPhotos => {
          if (Array.isArray(serverPhotos) && serverPhotos.length > 0) {
            setPhotos(serverPhotos.map(sp => normalizeToGalleryPhoto(sp, sp.gallery === "embaixadores" ? "Embaixadores" : "Negócios", sp.gallery || "global")));
          }
        })
        .catch(() => {});
    };
    window.addEventListener("photos_updated", handlePhotosUpdated);

    return () => {
      window.removeEventListener("admin_open_photo_upload", handleOpenUpload);
      window.removeEventListener("photos_updated", handlePhotosUpdated);
    };
  }, []);

  // Format local date back into a nice PT-BR string
  const formatBrazilianDate = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  // Handle local system file picking
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Formato de arquivo não suportado! Por favor, envie fotos apenas em formato JPG, PNG ou WEBP.");
        setPreviewUrl(null);
        return;
      }
      setUploadError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropperSource(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle batch multiple file selection (up to 10 photos)
  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      if (allowedTypes.includes(files[i].type)) {
        validFiles.push(files[i]);
      }
    }

    if (validFiles.length === 0) {
      setUploadError("Nenhum arquivo compatível selecionado! Use JPG, PNG ou WEBP.");
      return;
    }

    // Limit to max 10 files
    const targetFiles = validFiles.slice(0, 10);
    if (validFiles.length > 10) {
      setUploadError("Você selecionou mais de 10 fotos. Apenas as 10 primeiras serão processadas.");
    } else {
      setUploadError("");
    }

    const loadedPhotos: Array<{ id: string; url: string; title: string }> = [];
    let loadedCount = 0;

    targetFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]/g, " ") // replace dashes/underscores with spaces
          .replace(/\b\w/g, c => c.toUpperCase()); // capitalize

        loadedPhotos.push({
          id: `batch-temp-${index}-${Date.now()}`,
          url: reader.result as string,
          title: cleanName
        });

        loadedCount++;
        if (loadedCount === targetFiles.length) {
          // maintain order
          setBatchPhotos(loadedPhotos);
          playSuccessSound();
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBatchUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchPhotos.length === 0) {
      setUploadError("Por favor, selecione pelo menos uma foto para enviar.");
      return;
    }
    if (batchPhotos.length > 10) {
      setUploadError("Você pode enviar no máximo 10 fotos por vez.");
      return;
    }

    setBatchUploading(true);
    setUploadError("");
    setBatchProgress(0);

    const uploadedResults: GalleryPhoto[] = [];

    for (let i = 0; i < batchPhotos.length; i++) {
      const bp = batchPhotos[i];
      const newPhoto: GalleryPhoto = {
        id: `photo-${Date.now()}-${i}`,
        url: bp.url,
        title: bp.title || `Foto #${i + 1}`,
        theme: uploadTheme,
        city: uploadCity,
        views: Math.floor(Math.random() * 20) + 1,
        date: uploadDate || new Date().toISOString().split("T")[0],
        isCustom: true
      };

      try {
        const response = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gallery: "global", item: newPhoto })
        });
        if (response.ok) {
          const publishedPhoto = await response.json();
          uploadedResults.push(publishedPhoto);
        } else {
          // Fallback to local
          uploadedResults.push(newPhoto);
        }
      } catch (err) {
        console.error("Error batch uploading photo:", err);
        uploadedResults.push(newPhoto);
      }
      setBatchProgress(Math.round(((i + 1) / batchPhotos.length) * 100));
    }

    // Merge uploaded items into main photos list
    const updated = [...uploadedResults, ...photos];
    setPhotos(updated);
    localStorage.setItem("global_photo_gallery", JSON.stringify(updated));
    playSuccessSound();

    // Reset batch state
    setBatchPhotos([]);
    setBatchUploading(false);
    setBatchProgress(0);
    setUploadTitle("");
    setPreviewUrl(null);

    // Navigate to gallery view
    setActiveSubTab("galeria");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !uploadTitle) {
      setUploadError("Por favor, selecione e ajuste uma imagem e preencha o título.");
      return;
    }

    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      url: previewUrl,
      title: uploadTitle,
      theme: uploadTheme,
      city: uploadCity,
      views: Math.floor(Math.random() * 20) + 1, // Generate random small views initially
      date: uploadDate || new Date().toISOString().split("T")[0],
      isCustom: true
    };

    // Publish to Server!
    fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery: "global", item: newPhoto })
    })
      .then(res => res.json())
      .then(publishedPhoto => {
        const updated = [publishedPhoto, ...photos.filter(p => p.id !== newPhoto.id)];
        setPhotos(updated);
        localStorage.setItem("global_photo_gallery", JSON.stringify(updated));
        playSuccessSound();

        // Reset Form
        setUploadTitle("");
        setUploadTheme("Negócios");
        setUploadCity("Juiz de Fora");
        setUploadDate("");
        setPreviewUrl(null);
        setUploadError("");
        
        // Auto-navigate back to gallery view to see the brand new card
        setActiveSubTab("galeria");
        window.scrollTo({ top: 300, behavior: "smooth" });
      })
      .catch(err => {
        console.error("Error publishing photo server-side:", err);
        // Fallback to local
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        localStorage.setItem("global_photo_gallery", JSON.stringify(updated));
        playSuccessSound();

        // Reset Form
        setUploadTitle("");
        setUploadTheme("Negócios");
        setUploadCity("Juiz de Fora");
        setUploadDate("");
        setPreviewUrl(null);
        setUploadError("");
        
        // Auto-navigate back to gallery view to see the brand new card
        setActiveSubTab("galeria");
        window.scrollTo({ top: 300, behavior: "smooth" });
      });
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(400, "sine");
    const updated = photos.filter(p => p.id !== id);
    setPhotos(updated);
    localStorage.setItem("global_photo_gallery", JSON.stringify(updated.filter(p => p.gallery === "global" || !p.gallery)));
    
    // Clean up from embaixadores and comunidade local storage too
    try {
      const emb = localStorage.getItem("embaixadores_photos_db");
      if (emb) {
        const parsed = JSON.parse(emb);
        if (Array.isArray(parsed)) {
          localStorage.setItem("embaixadores_photos_db", JSON.stringify(parsed.filter(p => p.id !== id)));
        }
      }
      const com = localStorage.getItem("comunidade_photos_db");
      if (com) {
        const parsed = JSON.parse(com);
        if (Array.isArray(parsed)) {
          localStorage.setItem("comunidade_photos_db", JSON.stringify(parsed.filter(p => p.id !== id)));
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Delete on server
    fetch(`/api/photos/${id}`, { method: "DELETE" }).catch(err => console.error("Error deleting photo on server:", err));
  };

  const handleEditPhotoClick = (pt: GalleryPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(600, "sine");
    setEditingPhoto(pt);
    setEditTitle(pt.title);
    setEditTheme(pt.theme);
    setEditCity(pt.city);
    setEditDate(pt.date);
    setEditUrl(pt.url);
    setEditUploadError("");
  };

  const handleEditFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditUploading(true);
      setEditUploadError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 })
        })
          .then(res => res.json())
          .then(data => {
            if (data.url) {
              setEditUrl(data.url);
              playSuccessSound();
            } else {
              setEditUploadError("Falha ao subir imagem");
            }
          })
          .catch(err => {
            console.error(err);
            setEditUploadError("Erro no envio");
          })
          .finally(() => {
            setEditUploading(false);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    const updatedPhoto = {
      ...editingPhoto,
      title: editTitle,
      theme: editTheme,
      city: editCity,
      date: editDate,
      url: editUrl
    };

    fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery: "global", item: updatedPhoto })
    })
      .then(res => res.json())
      .then(publishedPhoto => {
        const updated = photos.map(p => p.id === editingPhoto.id ? publishedPhoto : p);
        setPhotos(updated);
        localStorage.setItem("global_photo_gallery", JSON.stringify(updated));
        playSuccessSound();
        setEditingPhoto(null);
      })
      .catch(err => {
        console.error("Error editing photo on server:", err);
        const updated = photos.map(p => p.id === editingPhoto.id ? updatedPhoto : p);
        setPhotos(updated);
        localStorage.setItem("global_photo_gallery", JSON.stringify(updated));
        playSuccessSound();
        setEditingPhoto(null);
      });
  };

  // Filter and sort photos
  const filteredAndSortedPhotos = photos
    .filter((photo) => {
      const matchesTheme = selectedTheme === "Todos" || photo.theme === selectedTheme;
      const matchesCity = selectedCity === "Todas" || photo.city === selectedCity;
      const matchesSearch = photo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            photo.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            photo.city.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTheme && matchesCity && matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === "relevancia") {
        return b.views - a.views;
      }
      if (sortOption === "antigo") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      // default: recente
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(650, "sine");
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + filteredAndSortedPhotos.length) % filteredAndSortedPhotos.length));
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(650, "sine");
    if (lightboxIndex !== null) {
      setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % filteredAndSortedPhotos.length));
    }
  };

  return (
    <div id="global-gallery-container" className="space-y-6">
      
      {/* HEADER SECTION IN PORTUGUESE */}
      <div id="gallery-v2-header" className={`p-6 rounded-3xl border ${
        isDarkMode 
          ? "bg-gradient-to-r from-pink-500/10 via-zinc-950 to-green-500/10 border-zinc-800"
          : "bg-gradient-to-r from-emerald-50 via-stone-100 to-pink-50 border-stone-200"
      } flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl`}>
        <div className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping shrink-0" />
            <h3 className={`font-display font-black text-sm uppercase tracking-wider ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
              {portalPagesConfig?.galeriaTitle || "Galeria Oficial de Fotos e Coberturas Realizadas"}
            </h3>
          </div>
          <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-stone-600"} font-mono max-w-2xl leading-relaxed`}>
            {portalPagesConfig?.galeriaDescription || "Explore e reviva registros visuais exclusivos dos nossos fóruns, rodadas de negócios, cursos presenciais e mentorias que impulsionam o empreendedorismo na Zona da Mata."}
          </p>
        </div>
      </div>

      {/* DUAL MODE DYNAMIC TABS FOR GALERIA PAGE */}
      <div id="gallery-navigation-tabs" className="flex items-center justify-start gap-2 border-b border-zinc-800/60 pb-1">
        <button
          onClick={() => {
            playClickSound(580, "sine");
            setActiveSubTab("galeria");
          }}
          className={`px-4 py-2 text-xs font-mono font-black uppercase transition-all duration-200 flex items-center gap-2 border-b-2 -mb-[6px] ${
            activeSubTab === "galeria"
              ? "border-pink-500 text-pink-500 font-extrabold"
              : isDarkMode ? "border-transparent text-zinc-400 hover:text-white" : "border-transparent text-stone-600 hover:text-stone-900"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>🖼️ Ver Diretório de Fotos</span>
        </button>

        <button
          onClick={() => {
            playClickSound(590, "sine");
            setActiveSubTab("incluir");
          }}
          className={`px-4 py-2 text-xs font-mono font-black uppercase transition-all duration-200 flex items-center gap-2 border-b-2 -mb-[6px] ${
            activeSubTab === "incluir"
              ? "border-green-500 text-green-500 font-extrabold"
              : isDarkMode ? "border-transparent text-zinc-400 hover:text-white" : "border-transparent text-stone-600 hover:text-stone-900"
          }`}
        >
          <Plus className="w-4 h-4 text-green-400 shrink-0" />
          <span>📸 Incluir Novas Fotos</span>
        </button>
      </div>

      {/* DYNAMIC TAB VIEW ROUTER CONTENT */}
      {activeSubTab === "incluir" ? (
        <div id="add-photos-page-view" className="space-y-6">
          {/* Informational Banner */}
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-left">
            <h4 className="text-xs font-bold text-green-450 uppercase flex items-center gap-1.5 font-display">
              <Camera className="w-4 h-4 text-green-400 shrink-0" />
              Formulário Oficial de Inclusão de Imagens
            </h4>
            <p className="text-[10px] text-zinc-300 font-mono mt-1 leading-snug">
              Utilize o controle abaixo para carregar imagens diretamente do seu computador ou celular. Elas serão publicadas como cartões instantâneos na galeria com suporte total a agrupamentos, buscas e filtros por tema e cidade regional.
            </p>
          </div>

          <div
            id="admin-form-container"
            className={`p-6 rounded-3xl border ${
              isDarkMode ? "border-zinc-800 bg-zinc-900/40" : "border-stone-200 bg-stone-50"
            } text-left space-y-4`}
          >
            <div className="border-b border-zinc-805/40 pb-2 flex items-center justify-between">
              <h4 className={`font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                <Upload className="w-4 h-4 text-pink-500" />
                Carregar Mídia de Seu Computador
              </h4>
              <span className="text-[10px] text-pink-400 font-mono font-bold uppercase">UPLOADER INSTANTÂNEO</span>
            </div>

            {/* Mode selection buttons */}
            <div className="flex items-center gap-2 border-b border-zinc-800/10 pb-3">
              <button
                type="button"
                onClick={() => { playClickSound(600, "sine"); setUploadMode("single"); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  uploadMode === "single"
                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/20"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Foto Única com Recorte
              </button>
              <button
                type="button"
                onClick={() => { playClickSound(600, "sine"); setUploadMode("batch"); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  uploadMode === "batch"
                    ? "bg-green-500 text-black shadow-lg shadow-green-500/20"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Múltiplas Fotos (Até 10)
              </button>
            </div>

            <form onSubmit={uploadMode === "batch" ? handleBatchUploadSubmit : handleUploadSubmit} className="space-y-4">
              {uploadError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-[10.5px] font-bold">
                  ⚠️ {uploadError}
                </div>
              )}

              {uploadMode === "single" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Visual Area to Drag or Choose From Device */}
                  <div className="space-y-2">
                    <span className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Arquivo de Imagem Local</span>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition p-4 ${
                        previewUrl ? "border-pink-500 bg-pink-500/5" : "border-zinc-700 hover:border-pink-400/50 hover:bg-zinc-900/10"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        id="photo-file-upload-input"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      
                      {previewUrl ? (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                          <img src={previewUrl} alt="Preview do arquivo" className="max-h-full object-contain" />
                          <button
                            type="button"
                            id="reset-preview-btn"
                            onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/90 text-white hover:text-red-400 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <Upload className="w-8 h-8 text-pink-400 mx-auto animate-bounce" />
                          <div className="space-y-0.5">
                            <p className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-stone-800"}`}>Clique para encontrar fotos em seu computador</p>
                            <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">SISTEMA MULTIMÍDIA DO PORTAL</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Metadata Form */}
                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label id="lbl-title" className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Título do Card / Legenda</label>
                      <input
                        type="text"
                        id="upload-title-input"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className={`w-full p-2.5 rounded-lg text-xs font-sans ${
                          isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                        } border focus:outline-none focus:border-pink-500`}
                        placeholder="Ex: Treinamento Presencial de Marketing Digital"
                        required={uploadMode === "single"}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label id="lbl-theme" className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Tema (Categoria)</label>
                        <select
                          id="upload-theme-select"
                          value={uploadTheme}
                          onChange={(e) => setUploadTheme(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs ${
                            isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                          } border focus:outline-none`}
                        >
                          {THEMES_LIST.filter(t => t !== "Todos").map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label id="lbl-city" className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Cidade</label>
                        <select
                          id="upload-city-select"
                          value={uploadCity}
                          onChange={(e) => setUploadCity(e.target.value)}
                          className={`w-full p-2.5 rounded-lg text-xs ${
                            isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                          } border focus:outline-none`}
                        >
                          {dynamicCitiesWithTodas.filter(c => c !== "Todas").map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label id="lbl-date" className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Data do Evento</label>
                      <input
                        type="date"
                        id="upload-date-input"
                        value={uploadDate}
                        onChange={(e) => setUploadDate(e.target.value)}
                        className={`w-full p-2.5 rounded-lg text-xs font-mono ${
                          isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                        } border focus:outline-none focus:border-pink-500`}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Batch Selector / Drag area */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-2">
                      <span className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Adicionar Até 10 Fotos</span>
                      <div 
                        onClick={() => {
                          const inp = document.createElement("input");
                          inp.type = "file";
                          inp.multiple = true;
                          inp.accept = "image/png, image/jpeg, image/webp";
                          inp.onchange = (e) => handleMultipleFilesChange(e as any);
                          inp.click();
                        }}
                        className="h-36 rounded-2xl border-2 border-dashed border-green-600/50 hover:border-green-400 bg-green-500/5 flex flex-col items-center justify-center cursor-pointer transition p-4 text-center"
                      >
                        <Upload className="w-8 h-8 text-green-400 mx-auto animate-bounce mb-1" />
                        <p className={`text-xs font-bold ${isDarkMode ? "text-white" : "text-stone-800"}`}>Selecionar Fotos</p>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Até 10 fotos simultâneas</p>
                      </div>
                    </div>

                    {/* Common Metadata Form */}
                    <div className="md:col-span-2 space-y-3">
                      <span className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Informações Comuns (Para todo o lote)</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Tema Comum</label>
                          <select
                            value={uploadTheme}
                            onChange={(e) => setUploadTheme(e.target.value)}
                            className={`w-full p-2.5 rounded-lg text-xs ${
                              isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                            } border focus:outline-none`}
                          >
                            {THEMES_LIST.filter(t => t !== "Todos").map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Cidade Comum</label>
                          <select
                            value={uploadCity}
                            onChange={(e) => setUploadCity(e.target.value)}
                            className={`w-full p-2.5 rounded-lg text-xs ${
                              isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                            } border focus:outline-none`}
                          >
                            {dynamicCitiesWithTodas.filter(c => c !== "Todas").map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Data Comum</label>
                          <input
                            type="date"
                            value={uploadDate}
                            onChange={(e) => setUploadDate(e.target.value)}
                            className={`w-full p-2.5 rounded-lg text-xs font-mono ${
                              isDarkMode ? "bg-stone-950 border-zinc-850 text-white" : "bg-white border-stone-200 text-stone-900"
                            } border focus:outline-none focus:border-pink-500`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Previews and specific legends list */}
                  {batchPhotos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800/20 pb-1">
                        <span className="block text-[10px] font-mono text-zinc-400 uppercase font-bold">Legendas das Fotos ({batchPhotos.length} selecionadas)</span>
                        <button
                          type="button"
                          onClick={() => { playClickSound(600, "sine"); setBatchPhotos([]); }}
                          className="text-[10px] font-mono text-red-400 hover:underline uppercase"
                        >
                          Limpar Tudo
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                        {batchPhotos.map((bp, index) => (
                          <div 
                            key={bp.id} 
                            className={`p-3 rounded-2xl border flex items-center gap-3 relative ${
                              isDarkMode ? "bg-stone-950/60 border-zinc-900" : "bg-white border-stone-100"
                            }`}
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800">
                              <img src={bp.url} alt="Minipreview" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Legenda da Foto #{index + 1}</span>
                              <input
                                type="text"
                                value={bp.title}
                                required
                                onChange={(e) => {
                                  const updated = [...batchPhotos];
                                  updated[index].title = e.target.value;
                                  setBatchPhotos(updated);
                                }}
                                placeholder="Digite uma legenda para esta foto"
                                className={`w-full p-1 text-[11px] font-sans ${
                                  isDarkMode ? "bg-transparent text-white border-b border-zinc-800 focus:border-green-500" : "bg-transparent text-zinc-800 border-b border-stone-200 focus:border-green-500"
                                } focus:outline-none`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                playClickSound(400, "sine");
                                setBatchPhotos(batchPhotos.filter((_, idx) => idx !== index));
                              }}
                              className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-full transition"
                              title="Remover foto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {batchUploading && (
                    <div className="space-y-1 p-4 bg-zinc-950/40 rounded-2xl border border-zinc-800 text-center font-mono">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-400 mb-1">
                        <span>Enviando fotos ao servidor...</span>
                        <span>{batchProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300" style={{ width: `${batchProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-zinc-800/20">
                {uploadMode === "single" ? (
                  <button
                    type="submit"
                    id="admin-upload-submit-btn"
                    disabled={!previewUrl || !uploadTitle}
                    className="bg-green-500 hover:bg-green-400 disabled:opacity-45 disabled:cursor-not-allowed text-black font-mono text-xs font-black uppercase px-6 py-2.5 rounded-xl transition duration-150 active:scale-95"
                  >
                    Confirmar e Publicar Card
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={batchPhotos.length === 0 || batchUploading}
                    className="bg-green-500 hover:bg-green-400 disabled:opacity-45 disabled:cursor-not-allowed text-black font-mono text-xs font-black uppercase px-6 py-2.5 rounded-xl transition duration-150 active:scale-95 flex items-center gap-2"
                  >
                    {batchUploading ? "Enviando Lote..." : `Salvar e Publicar ${batchPhotos.length} Fotos no Servidor`}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          {/* FILTER & SORT BAR (TEMA, CIDADE, MAIS VISTOS, RECENTES, ANTIGOS) */}
          <div id="gallery-controls-bar" className={`p-4 rounded-2xl border ${
            isDarkMode ? "bg-zinc-950/60 border-zinc-850" : "bg-stone-50 border-stone-200"
          } flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between`}>
            
            {/* Left Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                id="search-gallery-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por legenda, tema ou cidade..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs ${
                  isDarkMode ? "bg-stone-904/60 border-zinc-800 text-white placeholder-zinc-500" : "bg-white border-stone-200 text-stone-903 placeholder-stone-400"
                } border focus:outline-none focus:border-pink-500`}
              />
            </div>

            {/* Dropdowns filters */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* TEMA FILTER */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-zinc-505 uppercase font-black">Tema:</span>
                <select
                  id="filter-theme-select"
                  value={selectedTheme}
                  onChange={(e) => { playClickSound(600, "sine"); setSelectedTheme(e.target.value); }}
                  className={`p-2 rounded-xl text-xs font-mono font-bold ${
                    isDarkMode ? "bg-stone-900 border-zinc-800 text-zinc-300" : "bg-white border-stone-200 text-stone-800"
                  } border focus:outline-none`}
                >
                  {THEMES_LIST.map(theme => (
                    <option key={theme} value={theme}>{theme}</option>
                  ))}
                </select>
              </div>

              {/* CITADE FILTER */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-zinc-505 uppercase font-black">Cidade:</span>
                <select
                  id="filter-city-select"
                  value={selectedCity}
                  onChange={(e) => { playClickSound(600, "sine"); setSelectedCity(e.target.value); }}
                  className={`p-2 rounded-xl text-xs font-mono font-bold ${
                    isDarkMode ? "bg-stone-900 border-zinc-800 text-zinc-300" : "bg-white border-stone-200 text-stone-800"
                  } border focus:outline-none`}
                >
                  {dynamicCitiesWithTodas.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

          {/* SORT DROPDOWN (MAIS VISTO, RECENTE, ANTIGO) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-zinc-500 uppercase font-black">Ordem:</span>
            <div className="flex rounded-lg overflow-hidden border border-zinc-800 shadow-sm">
              {[
                { label: "MAIS VISTOS", value: "relevancia" },
                { label: "RECENTE", value: "recente" },
                { label: "ANTIGO", value: "antigo" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  id={`sort-btn-${opt.value}`}
                  onClick={() => { playClickSound(620, "sine"); setSortOption(opt.value as any); }}
                  className={`px-2.5 py-1.5 text-[9px] font-mono font-black tracking-wider transition ${
                    sortOption === opt.value
                      ? "bg-pink-500 text-white"
                      : isDarkMode ? "bg-stone-900 text-zinc-400 hover:text-zinc-200" : "bg-white text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* FILTER STICKERS CLEAR */}
      {(selectedTheme !== "Todos" || selectedCity !== "Todas" || searchQuery) && (
        <div id="active-tags-row" className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono uppercase font-semibold">Filtros ativos:</span>
          {selectedTheme !== "Todos" && (
            <button
              onClick={() => setSelectedTheme("Todos")}
              className="px-2 py-0.5 rounded bg-zinc-900 text-pink-400 border border-zinc-800 hover:border-pink-500/35 text-[10px] uppercase font-mono flex items-center gap-1"
            >
              Tema: {selectedTheme} ×
            </button>
          )}
          {selectedCity !== "Todas" && (
            <button
              onClick={() => setSelectedCity("Todas")}
              className="px-2 py-0.5 rounded bg-zinc-900 text-green-400 border border-zinc-800 hover:border-green-500/35 text-[10px] uppercase font-mono flex items-center gap-1"
            >
              Cidade: {selectedCity} ×
            </button>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-2 py-0.5 rounded bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 text-[10px] uppercase font-mono flex items-center gap-1"
            >
              Busca: "{searchQuery}" ×
            </button>
          )}
        </div>
      )}

      {/* PHOTO GRID CARDS */}
      {filteredAndSortedPhotos.length === 0 ? (
        <div id="empty-gallery-state" className="p-16 text-center rounded-3xl bg-zinc-900/10 border border-dashed border-zinc-800 flex flex-col items-center justify-center space-y-2">
          <ImageIcon className="w-8 h-8 text-zinc-600 animate-pulse" />
          <p className={`text-xs font-mono ${isDarkMode ? "text-zinc-400" : "text-stone-600"}`}>
            Nenhuma foto coincide com os filtros ou buscas especificadas.
          </p>
        </div>
      ) : (
        <div id="gallery-photo-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPhotos.map((pt, idx) => (
            <div
              key={pt.id}
              onClick={() => { playClickSound(550, "sine"); setLightboxIndex(idx); }}
              className={`group ${
                isDarkMode ? "bg-stone-950/80 border-zinc-900 hover:border-zinc-750" : "bg-white border-stone-200 hover:border-stone-300"
              } border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between relative shadow-md hover:shadow-xl hover:-translate-y-1 transform`}
            >
              <div className="relative aspect-[4/3] w-full bg-black overflow-hidden border-b border-zinc-900/80">
                <img 
                  src={pt.url} 
                  alt={pt.title}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                
                {/* Theme sticker pill */}
                <div className="absolute top-3 left-3 bg-pink-500 text-white font-mono font-black text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-lg flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{pt.theme}</span>
                </div>

                {/* Trash & Edit icons - strictly for administrator */}
                {isEffectiveAdmin && (
                  <div className="absolute top-3 right-3 flex gap-1.5 z-25">
                    <button
                      onClick={(e) => handleEditPhotoClick(pt, e)}
                      className="bg-black/90 hover:bg-zinc-800 border border-zinc-800 hover:border-pink-500/55 p-2 rounded-xl text-zinc-400 hover:text-pink-400 transition"
                      title="Editar detalhes da foto"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeletePhoto(pt.id, e)}
                      id={`trash-btn-${pt.id}`}
                      className="bg-black/90 hover:bg-red-950 border border-zinc-800 hover:border-red-500/55 p-2 rounded-xl text-zinc-400 hover:text-red-400 transition"
                      title="Remover foto永久mente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Overlay visual info elements */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 pt-10 flex items-center justify-between pointer-events-none">
                  {/* City pill */}
                  <span className="bg-black/80 backdrop-blur-sm border border-zinc-950 text-emerald-400 font-mono text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{pt.city}</span>
                  </span>

                  {/* Views count display */}
                  <span className="bg-black/80 backdrop-blur-sm text-zinc-300 font-mono text-[9px] px-2 py-0.5 rounded-lg flex items-center gap-1 border border-zinc-900/40">
                    <Eye className="w-3 h-3 text-zinc-450" />
                    <span>{pt.views} acessos</span>
                  </span>
                </div>
              </div>

              {/* Title & Date Details */}
              <div className="p-4 space-y-2 text-left flex-1 flex flex-col justify-between">
                <h4 className={`font-display font-black text-xs uppercase tracking-tight leading-snug ${
                  isDarkMode ? "text-white" : "text-stone-900"
                } group-hover:text-pink-400 transition duration-150 line-clamp-2`}>
                  {pt.title}
                </h4>

                <div className="flex items-center justify-between text-[9px] text-zinc-450 font-mono pt-1.5 border-t border-zinc-900/30">
                  <span className="flex items-center gap-1 text-zinc-500 font-bold">
                    <Calendar className="w-3 h-3 text-zinc-550" />
                    {formatBrazilianDate(pt.date)}
                  </span>
                  
                  <span className={`${isDarkMode ? "text-zinc-500 group-hover:text-white" : "text-stone-600 group-hover:text-pink-600"} transition duration-200 flex items-center gap-1.5`}>
                    Ver Foto <Maximize2 className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}

      {/* FULLSCREEN PREVIEW MODAL LIGHTBOX */}
      {lightboxIndex !== null && (
        <div 
          id="fullscreen-lightbox"
          className="fixed inset-0 z-50 bg-black/98 backdrop-blur-md flex flex-col justify-between p-4 text-center select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between py-2.5 border-b border-zinc-900/30 max-w-5xl mx-auto w-full text-[11px] font-mono text-zinc-400">
            <span className="uppercase tracking-widest font-black text-white/90 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-pink-500 shrink-0" />
              <span>GALERIA OFICIAL PORTAL</span>
            </span>
            <div className="flex items-center gap-4">
              <span>Card {lightboxIndex + 1} de {filteredAndSortedPhotos.length}</span>
              <button
                id="close-lightbox-btn"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-white rounded-full transition"
                title="Fechar visualização"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Stage slider */}
          <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-4">
            
            {/* Prev Image Button */}
            <button
              id="lightbox-prev-btn"
              onClick={handlePrevImage}
              className="absolute left-2 z-10 w-11 h-11 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-650 text-white hover:scale-105 transition rounded-full flex items-center justify-center shadow-lg"
              title="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Displaying Image with active ref */}
            <div 
              className="relative max-h-[70vh] max-w-full rounded-2xl overflow-hidden border border-zinc-900 shadow-2xl flex items-center justify-center bg-zinc-950"
              onClick={(e) => e.stopPropagation()} // Keeps lightbox from closing on content clicking
            >
              <img 
                src={filteredAndSortedPhotos[lightboxIndex].url}
                alt={filteredAndSortedPhotos[lightboxIndex].title}
                className="max-h-[70vh] max-w-full md:max-w-4xl object-contain animate-fade-in"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Image Button */}
            <button
              id="lightbox-next-btn"
              onClick={handleNextImage}
              className="absolute right-2 z-10 w-11 h-11 bg-zinc-950/80 hover:bg-zinc-950 border border-zinc-800 hover:border-zinc-650 text-white hover:scale-105 transition rounded-full flex items-center justify-center shadow-lg"
              title="Próxima"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

          </div>

          {/* Bottom Card details */}
          <div 
            className="p-4 bg-zinc-950/90 border border-zinc-900 max-w-2xl mx-auto w-full rounded-2xl mb-2 text-left space-y-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="font-display font-black text-sm uppercase text-white tracking-tight">
              {filteredAndSortedPhotos[lightboxIndex].title}
            </h4>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Cidade: {filteredAndSortedPhotos[lightboxIndex].city}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                Tema: {filteredAndSortedPhotos[lightboxIndex].theme}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                Data: {formatBrazilianDate(filteredAndSortedPhotos[lightboxIndex].date)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                {filteredAndSortedPhotos[lightboxIndex].views} acessos
              </span>
            </div>
          </div>

        </div>
      )}

      <ImageCropperModal
        isOpen={isCropperOpen}
        src={cropperSource}
        onClose={() => setIsCropperOpen(false)}
        onConfirm={(cropped) => {
          setPreviewUrl(cropped);
        }}
      />

      {/* PHOTO EDIT DIALOG MODAL */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-left font-mono text-xs">
            <button
              onClick={() => { playClickSound(600, "sine"); setEditingPhoto(null); }}
              className="absolute top-4 right-4 p-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-pink-500" />
              <span>Editar Detalhes da Foto</span>
            </h3>

            <form onSubmit={handleEditFormSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Título / Legenda *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Ex: Cerimônia de Abertura"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Tema (Categoria) *</label>
                  <select
                    value={editTheme}
                    onChange={(e) => setEditTheme(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    {THEMES_LIST.filter(t => t !== "Todos").map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Cidade do Evento *</label>
                  <select
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    {CITIES_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Data da Captura *</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold block">Foto do Evento *</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={editUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-grow space-y-1">
                    <input
                      type="text"
                      required
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2 text-white focus:outline-none text-[10px]"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition text-[10px]"
                      >
                        <Upload className="w-3 h-3 text-pink-500" />
                        <span>{editUploading ? "Enviando..." : "Alterar Imagem"}</span>
                      </button>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleEditFileUpload}
                      />
                    </div>
                  </div>
                </div>
                {editUploadError && <p className="text-red-500 text-[10px]">{editUploadError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => { playClickSound(600, "sine"); setEditingPhoto(null); }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-black font-black uppercase rounded-xl hover:opacity-90 transition flex items-center gap-1 shadow-lg shadow-pink-500/10"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
