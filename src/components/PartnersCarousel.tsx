import React, { useState, useEffect, useRef } from "react";
import { Handshake, ExternalLink, ShieldCheck, ArrowRight, Sparkles, Plus, Edit, Trash2, X, Upload, Check } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface Partner {
  id: string;
  name: string;
  slogan: string;
  logoUrl: string;
  url: string;
  badge: string;
  colorTheme: "blue" | "green" | "amber" | "pink" | "sky";
  accentBorder?: string;
  shadowGlow?: string;
  badgeColor?: string;
}

const DEFAULT_PARTNERS: Partner[] = [
  {
    id: "partner-bahamas",
    name: "Supermercados Bahamas",
    slogan: "É Logo Aqui! Economia e qualidade todos os dias perto de você.",
    logoUrl: "https://i.ibb.co/VcJnYSjn/Logo-bahamas-e-logo-aqui-png.webp",
    url: "https://bahamas.com.br/encartes/",
    badge: "Anunciante Master",
    colorTheme: "blue"
  },
  {
    id: "partner-vol-fibra",
    name: "VOL Internet Fibra",
    slogan: "Conexão de altíssima velocidade e fibra óptica para Juiz de Fora e região.",
    logoUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=300&q=80",
    url: "https://volfibra.com.br",
    badge: "Telecom & Fibra Óptica",
    colorTheme: "sky"
  },
  {
    id: "partner-aroma-sonhos",
    name: "Aroma dos Sonhos",
    slogan: "Aromas exclusivos e essências que transformam e encantam ambientes.",
    logoUrl: "https://i.ibb.co/KcpJNcgQ/Whats-App-Image-2026-08-12-at-17-44-29.jpg",
    url: "https://www.instagram.com/aromadossonhos.jf/",
    badge: "Aromaterapia & Bem-Estar",
    colorTheme: "pink"
  },
  {
    id: "partner-braz-shopping",
    name: "Braz Shopping",
    slogan: "O coração das compras, lazer e serviços no centro de Juiz de Fora.",
    logoUrl: "https://i.ibb.co/pjK0PgJk/Whats-App-Image-2026-08-12-at-17-45-21.jpg",
    url: "https://www.instagram.com/brazshopping/",
    badge: "Shopping & Negócios",
    colorTheme: "amber"
  },
  {
    id: "partner-mf-sabores",
    name: "MF Sabores",
    slogan: "Sabor, tradição e excelência gastronômica para todos os momentos.",
    logoUrl: "https://i.ibb.co/S77MGhpB/Whats-App-Image-2026-08-12-at-17-44-49.jpg",
    url: "https://www.instagram.com/mfsabores_/",
    badge: "Gastronomia & Delícias",
    colorTheme: "green"
  }
];

const getThemeClasses = (theme: string) => {
  switch (theme) {
    case "blue":
      return {
        accentBorder: "border-blue-500/50 hover:border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        shadowGlow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]",
        badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30"
      };
    case "green":
      return {
        accentBorder: "border-green-500/40 hover:border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.12)]",
        shadowGlow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.25)]",
        badgeColor: "bg-green-500/10 text-green-400 border-green-500/30"
      };
    case "amber":
      return {
        accentBorder: "border-amber-600/40 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.12)]",
        shadowGlow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]",
        badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30"
      };
    case "pink":
      return {
        accentBorder: "border-pink-500/40 hover:border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.12)]",
        shadowGlow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.25)]",
        badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/30"
      };
    case "sky":
    default:
      return {
        accentBorder: "border-sky-500/40 hover:border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.12)]",
        shadowGlow: "hover:shadow-[0_0_20px_rgba(14,165,233,0.25)]",
        badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30"
      };
  }
};

interface PartnersCarouselProps {
  isAdmin?: boolean;
}

export default function PartnersCarousel({ isAdmin = false }: PartnersCarouselProps) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  
  // Local form state
  const [formName, setFormName] = useState("");
  const [formSlogan, setFormSlogan] = useState("");
  const [formBadge, setFormBadge] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formTheme, setFormTheme] = useState<"blue" | "green" | "amber" | "pink" | "sky">("blue");
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "parallax">("grid");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync / Load on mount
  useEffect(() => {
    // 1. Load from localStorage or upgrade to new curated list
    let localPartners = DEFAULT_PARTNERS;
    const saved = localStorage.getItem("partners_list");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if parsed list has the new partner IDs
          const hasNewPartners = parsed.some((p: any) => p.id === "partner-aroma-sonhos" || p.id === "partner-braz-shopping" || p.id === "partner-mf-sabores");
          if (hasNewPartners) {
            localPartners = parsed;
          } else {
            // Upgrade with new default curated list
            localPartners = DEFAULT_PARTNERS;
            localStorage.setItem("partners_list", JSON.stringify(DEFAULT_PARTNERS));
          }
        }
      } catch (e) {
        console.error("Error reading partners_list from localStorage", e);
      }
    } else {
      localStorage.setItem("partners_list", JSON.stringify(DEFAULT_PARTNERS));
    }
    setPartners(localPartners);

    // 2. Load from server
    fetch("/api/published-data")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.partners_list) && data.partners_list.length > 0) {
          const hasNewPartners = data.partners_list.some((p: any) => p.id === "partner-aroma-sonhos" || p.id === "partner-braz-shopping" || p.id === "partner-mf-sabores");
          if (hasNewPartners) {
            setPartners(data.partners_list);
            localStorage.setItem("partners_list", JSON.stringify(data.partners_list));
          } else {
            // Update server with the new partner brands
            savePartnersList(DEFAULT_PARTNERS);
          }
        } else {
          savePartnersList(DEFAULT_PARTNERS);
        }
      })
      .catch(() => {
        savePartnersList(DEFAULT_PARTNERS);
      });

    // Add event listener for + CRIAR NOVO admin button
    const handleOpenPartnerAdd = () => {
      openAddModal();
    };
    window.addEventListener("admin_open_partner_add", handleOpenPartnerAdd);

    return () => {
      window.removeEventListener("admin_open_partner_add", handleOpenPartnerAdd);
    };
  }, []);

  // Save utility
  const savePartnersList = (newList: Partner[]) => {
    setPartners(newList);
    localStorage.setItem("partners_list", JSON.stringify(newList));
    
    // Dispatch event to sync if needed
    window.dispatchEvent(new Event("image_updated"));

    // Also attempt server-side publish-all if they want persistent updates
    fetch("/api/published-data")
      .then(res => res.json())
      .then(serverData => {
        const payload = {
          ...serverData,
          partners_list: newList
        };
        fetch("/api/publish-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        .then(r => r.json())
        .then(d => {
          console.log("Successfully published partners list server-side", d);
        })
        .catch(err => console.error("Error publishing partners server-side:", err));
      });
  };

  const handlePartnerClick = (partner: Partner, e: React.MouseEvent) => {
    if (isAdmin) {
      e.preventDefault();
      playClickSound(750, "sine");
      openEditModal(partner);
    } else {
      playClickSound(750, "sine");
      playSuccessSound();
    }
  };

  const openEditModal = (partner: Partner) => {
    setEditingPartner(partner);
    setIsAddMode(false);
    setFormName(partner.name);
    setFormSlogan(partner.slogan);
    setFormBadge(partner.badge);
    setFormUrl(partner.url);
    setFormLogoUrl(partner.logoUrl);
    setFormTheme(partner.colorTheme);
    setUploadError("");
    setShowManageModal(true);
  };

  const openAddModal = () => {
    setEditingPartner(null);
    setIsAddMode(true);
    setFormName("");
    setFormSlogan("");
    setFormBadge("Apoio Especial");
    setFormUrl("");
    setFormLogoUrl("https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=300&q=80");
    setFormTheme("blue");
    setUploadError("");
    setShowManageModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      setUploadError("");
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
              setFormLogoUrl(data.url);
              playSuccessSound();
            } else {
              setUploadError("Falha ao subir imagem");
            }
          })
          .catch(err => {
            console.error(err);
            setUploadError("Erro no envio");
          })
          .finally(() => {
            setUploadingImage(false);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlogan || !formLogoUrl) {
      alert("Por favor preencha todos os campos obrigatórios");
      return;
    }

    if (isAddMode) {
      const newPartner: Partner = {
        id: `partner-${Date.now()}`,
        name: formName,
        slogan: formSlogan,
        badge: formBadge,
        url: formUrl || "https://google.com",
        logoUrl: formLogoUrl,
        colorTheme: formTheme
      };
      const newList = [...partners, newPartner];
      savePartnersList(newList);
    } else if (editingPartner) {
      const newList = partners.map(p => p.id === editingPartner.id ? {
        ...p,
        name: formName,
        slogan: formSlogan,
        badge: formBadge,
        url: formUrl,
        logoUrl: formLogoUrl,
        colorTheme: formTheme
      } : p);
      savePartnersList(newList);
    }
    
    setShowManageModal(false);
    playSuccessSound();
  };

  const handleDeletePartner = (id: string) => {
    {
      const newList = partners.filter(p => p.id !== id);
      savePartnersList(newList);
      setShowManageModal(false);
      playClickSound(400, "sine");
    }
  };

  // Unique partners list without repetition
  const displayList = partners.length > 0 ? partners : DEFAULT_PARTNERS;

  return (
    <div id="partners-carousel-root" className="partners-carousel-root max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 select-none w-full">
      
      {/* SECTION HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 sm:mb-8 border-b border-zinc-800/80 font-display">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400">
            <Handshake className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base md:text-lg tracking-wider uppercase text-white flex flex-wrap items-center gap-2 leading-none">
              Marcas Parceiras & Apoiadores Oficiais
              <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 px-2 py-0.5 rounded-full leading-none shrink-0">
                ECOSSISTEMA REGIONAL
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-400 font-mono mt-1">
              Empresas líderes e marcas inovadoras que apoiam, conectam e impulsionam Juiz de Fora e região
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Grid vs Parallax Slider */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => { playClickSound(600, "sine"); setViewMode("grid"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                viewMode === "grid"
                  ? "bg-green-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Grade Fixa
            </button>
            <button
              onClick={() => { playClickSound(620, "sine"); setViewMode("parallax"); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                viewMode === "parallax"
                  ? "bg-green-500 text-black shadow-md"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Slider Parallax
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => { playClickSound(600, "sine"); openAddModal(); }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-red-500 text-black text-[10px] sm:text-xs font-mono font-black uppercase rounded-xl flex items-center gap-1.5 hover:opacity-90 transition shadow-lg shadow-pink-500/15"
              title="Adicionar Novo Parceiro"
            >
              <Plus className="w-4 h-4" />
              <span>+ Adicionar Parceiro</span>
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-950/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
            <span>PARCERIA CERTIFICADA</span>
          </div>
        </div>
      </div>

      {/* RENDER VIEW: PARAX SLIDER OR FIXED GRID */}
      {viewMode === "parallax" ? (
        <div className="relative w-full overflow-x-auto pb-6 pt-2 custom-scrollbar">
          <div className="flex gap-6 w-max px-2">
            {displayList.map((partner) => {
              const { accentBorder, shadowGlow, badgeColor } = getThemeClasses(partner.colorTheme);
              const isBahamas = partner.id === "partner-bahamas";
              return (
                <div
                  key={partner.id}
                  className={`w-[320px] sm:w-[380px] flex flex-col justify-between p-6 bg-gradient-to-br from-zinc-900/95 via-zinc-950 to-black border rounded-3xl transition-all duration-500 relative ${accentBorder} ${shadowGlow} group hover:-translate-y-2 shrink-0 shadow-2xl`}
                >
                  {/* Admin Overlay Indicator */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditModal(partner);
                        }}
                        className="p-1.5 rounded-lg bg-pink-950/80 border border-pink-500/50 text-pink-400 hover:text-white hover:bg-pink-900 transition text-[10px] font-mono font-bold flex items-center gap-1 shadow-md"
                        title="Editar Informações do Parceiro"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-3 shadow-inner group-hover:scale-105 transition-transform duration-300 shrink-0">
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="object-contain w-full h-full max-w-full max-h-full"
                          referrerPolicy="no-referrer"
                        />
                        {isBahamas && (
                          <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] sm:text-[9px] px-2 py-0.5 font-mono font-black rounded uppercase tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.8)] z-10 border border-red-400/40">
                            MASTER
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-right">
                        <span className={`inline-block text-[9px] sm:text-[10px] font-mono uppercase font-black px-2.5 py-1 rounded-lg leading-none tracking-wider border ${badgeColor}`}>
                          {partner.badge}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-left mb-6">
                      <h4 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight leading-tight group-hover:text-green-400 transition-colors">
                        {partner.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                        {partner.slogan}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-900/80 flex items-center justify-between gap-2 mt-auto">
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => handlePartnerClick(partner, e)}
                      className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all flex items-center justify-between text-xs font-mono font-bold group/btn"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-green-400" />
                        <span>Conhecer Marca & Serviços</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-green-400 group-hover/btn:translate-x-0.5 transition-all" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayList.map((partner) => {
            const { accentBorder, shadowGlow, badgeColor } = getThemeClasses(partner.colorTheme);
            const isBahamas = partner.id === "partner-bahamas";
            return (
              <div
                key={partner.id}
                className={`flex flex-col justify-between p-5 sm:p-6 bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-black border rounded-3xl transition-all duration-300 relative ${accentBorder} ${shadowGlow} group overflow-hidden`}
              >
                {/* Admin Overlay Indicator */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditModal(partner);
                      }}
                      className="p-1.5 rounded-lg bg-pink-950/80 border border-pink-500/50 text-pink-400 hover:text-white hover:bg-pink-900 transition text-[10px] font-mono font-bold flex items-center gap-1 shadow-md"
                      title="Editar Informações do Parceiro"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                )}

                {/* Card Top: Logo & Badge */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center p-3 shadow-inner group-hover:border-zinc-700 transition-colors shrink-0">
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="object-contain w-full h-full max-w-full max-h-full group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {isBahamas && (
                        <div className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] sm:text-[9px] px-2 py-0.5 font-mono font-black rounded uppercase tracking-wider shadow-[0_0_10px_rgba(220,38,38,0.8)] z-10 border border-red-400/40">
                          MASTER
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-right">
                      <span className={`inline-block text-[9px] sm:text-[10px] font-mono uppercase font-black px-2.5 py-1 rounded-lg leading-none tracking-wider border ${badgeColor}`}>
                        {partner.badge}
                      </span>
                    </div>
                  </div>

                  {/* Partner Details */}
                  <div className="space-y-2 text-left mb-5">
                    <h4 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight leading-tight group-hover:text-green-400 transition-colors">
                      {partner.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                      {partner.slogan}
                    </p>
                  </div>
                </div>

                {/* Card Bottom: Action Button */}
                <div className="pt-4 border-t border-zinc-900/80 flex items-center justify-between gap-2 mt-auto">
                  <a
                    href={partner.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => handlePartnerClick(partner, e)}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white transition-all flex items-center justify-between text-xs font-mono font-bold group/btn"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-green-400" />
                      <span>Conhecer Marca & Serviços</span>
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover/btn:text-green-400 group-hover/btn:translate-x-0.5 transition-all" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER INFO LINE */}
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-zinc-400 bg-zinc-950/40 border border-zinc-900 px-4 py-3 rounded-2xl">
        <span className="flex items-center gap-1.5 text-left">
          <Sparkles className="w-3.5 h-3.5 text-green-400 shrink-0" />
          {isAdmin 
            ? "Modo administrativo ativo: clique em 'Editar' para alterar logo, slogan ou links dos parceiros." 
            : "Apresentação oficial de marcas parceiras do Portal Do Começo ao Topo."}
        </span>
        <span className="uppercase text-right opacity-80 font-bold text-zinc-400">
          Total de {displayList.length} Empresas Parceiras
        </span>
      </div>

      {/* ADMIN EDIT/ADD MODAL FOR PARTNERS */}
      {showManageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative text-left">
            <button
              onClick={() => { playClickSound(600, "sine"); setShowManageModal(false); }}
              className="absolute top-4 right-4 p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 mb-4">
              <Handshake className="w-5 h-5 text-pink-500" />
              <span>{isAddMode ? "Novo Parceiro Comercial" : "Editar Parceiro Comercial"}</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
              
              {/* Partner Name */}
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Supermercados Bahamas"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Slogan */}
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Slogan / Descrição Curta *</label>
                <textarea
                  required
                  rows={2}
                  value={formSlogan}
                  onChange={(e) => setFormSlogan(e.target.value)}
                  placeholder="Ex: Economia e qualidade todos os dias perto de você."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none resize-none"
                />
              </div>

              {/* Badge */}
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Selo / Categoria (Badge) *</label>
                <input
                  type="text"
                  required
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  placeholder="Ex: Anunciante Master"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* URL */}
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Link de Destino (URL)</label>
                <input
                  type="url"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  placeholder="Ex: https://bahamas.com.br"
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              {/* Color Theme & Styles */}
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Tema Cromático (Estilo)</label>
                <select
                  value={formTheme}
                  onChange={(e) => setFormTheme(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="blue">Azul (Bahamas)</option>
                  <option value="green">Verde (Indústria)</option>
                  <option value="amber">Âmbar (Cultura)</option>
                  <option value="pink">Rosa (Agronegócio)</option>
                  <option value="sky">Céu (Tecnologia)</option>
                </select>
              </div>

              {/* Logo Area */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-bold block">Logotipo / Imagem Ilustrativa *</label>
                
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img src={formLogoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>

                  <div className="flex-grow space-y-1">
                    <input
                      type="text"
                      required
                      value={formLogoUrl}
                      onChange={(e) => setFormLogoUrl(e.target.value)}
                      placeholder="URL ou carregue um arquivo"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2 text-white focus:outline-none text-[10px]"
                    />
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-lg flex items-center gap-1.5 transition text-[10px]"
                      >
                        <Upload className="w-3 h-3 text-pink-500" />
                        <span>{uploadingImage ? "Subindo..." : "Escolher arquivo"}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </div>
                {uploadError && <p className="text-red-500 text-[10px]">{uploadError}</p>}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-zinc-900 mt-4">
                {!isAddMode && editingPartner && (
                  <button
                    type="button"
                    onClick={() => handleDeletePartner(editingPartner.id)}
                    className="px-3 py-2 bg-red-950/60 hover:bg-red-950 border border-red-500/20 text-red-450 hover:text-red-400 rounded-xl transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Parceiro</span>
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => { playClickSound(600, "sine"); setShowManageModal(false); }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-black font-black uppercase rounded-xl hover:opacity-90 transition flex items-center gap-1 shadow-lg shadow-pink-500/10"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar</span>
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
