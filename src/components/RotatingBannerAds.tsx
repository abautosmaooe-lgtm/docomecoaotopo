import { toast } from "sonner";
import React, { useState, useEffect, useRef } from "react";
import { 
  Megaphone, 
  ExternalLink, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2, 
  Plus, 
  X, 
  Volume2, 
  VolumeX, 
  Save, 
  ArrowUp, 
  ArrowDown, 
  Image, 
  Settings, 
  Eye, 
  Loader2 
} from "lucide-react";
import { playClickSound, playSuccessSound, speakWithFemaleVoice, stopSpeech } from "../utils/audio";

export interface AdCampaign {
  id: string;
  sponsorName: string;
  slogan: string;
  actionText: string;
  imageUrl: string;
  accentClass: string;
  glowClass: string;
  url: string;
  tag: string;
  preset?: "green" | "blue" | "amber" | "pink" | "purple";
}

const LOCAL_ADS_FALLBACK: AdCampaign[] = [
  {
    id: "ad-1",
    sponsorName: "Móveis Ubá Premium Corp",
    slogan: "O maior polo moveleiro de Minas Gerais direto na sua sala. Coleção Outono/Inverno com até 40% OFF e entrega grátis no sudeste.",
    actionText: "VER CATÁLOGO",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
    url: "https://www.uba.mg.gov.br",
    tag: "POLO MOVELEIRO UBÁ",
    preset: "green"
  },
  {
    id: "ad-2",
    sponsorName: "Código Original Tech JF",
    slogan: "Sistemas Web robustos, aplicativos móveis e soluções corporativas em React/Node. Conecte sua indústria ao futuro digital hoje mesmo.",
    actionText: "FALAR NO WHATSAPP",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-sky-500/20 to-indigo-600/10 border-sky-500/30 text-sky-400",
    glowClass: "shadow-[0_0_20px_rgba(14,165,233,0.06)]",
    url: "https://www.juizdefora.mg.gov.br",
    tag: "INDÚSTRIA TECH JF",
    preset: "blue"
  },
  {
    id: "ad-3",
    sponsorName: "Café Mantiqueira Real",
    slogan: "Colheita 100% artesanal de grãos selecionados da Zona da Mata. Eleve o foco e a produtividade no escritório ou redação com o sabor real mineiro.",
    actionText: "ENCOMENDAR GRÃOS",
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-amber-600/20 to-orange-500/10 border-amber-500/30 text-amber-500",
    glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.06)]",
    url: "https://www.coronelpacheco.mg.gov.br",
    tag: "SABOR DA ZONA DA MATA",
    preset: "amber"
  },
  {
    id: "ad-4",
    sponsorName: "Supermercados Estrela das Rosas",
    slogan: "Qualidade, frescor e economia. Produtos hortifrúti colhidos diariamente por agricultores familiares certificados de Barbacena.",
    actionText: "VER OFERTAS HOJE",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-pink-500/20 to-rose-600/10 border-pink-500/30 text-pink-400",
    glowClass: "shadow-[0_0_20px_rgba(236,72,153,0.06)]",
    url: "https://www.barbacena.mg.gov.br",
    tag: "OFERTA LOCAL BARBACENA",
    preset: "pink"
  },
  {
    id: "ad-5",
    sponsorName: "Supermercados Bahamas Master",
    slogan: "O maior clube de ofertas da Zona da Mata. Cadastre seu CPF e acumule cashback em todas as suas compras no Bahamas Card.",
    actionText: "BAIXAR APP BAHAMAS",
    imageUrl: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-sky-500/20 to-indigo-600/10 border-sky-500/30 text-sky-400",
    glowClass: "shadow-[0_0_20px_rgba(14,165,233,0.06)]",
    url: "https://bahamas.com.br",
    tag: "PATROCINADOR MASTER",
    preset: "blue"
  },
  {
    id: "ad-6",
    sponsorName: "Cervejaria Antuérpia Craft",
    slogan: "Conheça os rótulos premiados internacionalmente da escola de cerveja artesanal de Juiz de Fora. Visite nosso Taproom Oficial.",
    actionText: "RESERVAR MESA TAPROOM",
    imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-amber-600/20 to-orange-500/10 border-amber-500/30 text-amber-500",
    glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.06)]",
    url: "https://cervejariaantuerpia.com.br",
    tag: "CULTURA GASTRONÔMICA JF",
    preset: "amber"
  },
  {
    id: "ad-7",
    sponsorName: "Unimed Juiz de Fora Saúde",
    slogan: "Planos empresariais e individuais sob medida com cobertura completa de exames, pronto atendimento e medicina preventiva.",
    actionText: "SOLICITAR COTAÇÃO",
    imageUrl: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
    url: "https://unimedjf.coop.br",
    tag: "SAÚDE EMPRESARIAL",
    preset: "green"
  },
  {
    id: "ad-8",
    sponsorName: "Terrazzo Centro de Convenções",
    slogan: "O palco dos maiores espetáculos, feiras empresariais e casamentos inesquecíveis da região do Sudeste Mineiro.",
    actionText: "AGENDA DE EVENTOS",
    imageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-purple-500/20 to-fuchsia-600/10 border-purple-500/30 text-purple-400",
    glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.06)]",
    url: "https://terrazzo.com.br",
    tag: "HUB DE EVENTOS REGIONAL",
    preset: "purple"
  },
  {
    id: "ad-9",
    sponsorName: "VOL Fibra Óptica 1Gbps",
    slogan: "Internet dedicada com IP Fixo e ultravocação corporativa. Estabilidade total para seu escritório ou estúdio em JF.",
    actionText: "MIGRAR PARA VOL FIBRA",
    imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-sky-500/20 to-indigo-600/10 border-sky-500/30 text-sky-400",
    glowClass: "shadow-[0_0_20px_rgba(14,165,233,0.06)]",
    url: "https://volfibra.com.br",
    tag: "TELECOM ULTRAVELOZ",
    preset: "blue"
  },
  {
    id: "ad-10",
    sponsorName: "Instituto Vianna Júnior MBA",
    slogan: "Inscrições abertas para Pós-Graduação Executiva em Gestão Estratégica, Direito Digital e Inovação Empresarial.",
    actionText: "CONHECER CURSOS",
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-amber-600/20 to-orange-500/10 border-amber-500/30 text-amber-500",
    glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.06)]",
    url: "https://viannajunior.edu.br",
    tag: "EXCELÊNCIA EM ENSINO",
    preset: "amber"
  },
  {
    id: "ad-11",
    sponsorName: "Independência Trade Hotel Executivo",
    slogan: "Suítes confortáveis com café da manhã gourmet e salas de reuniões no principal eixo financeiro de Juiz de Fora.",
    actionText: "RESERVAR SUÍTE",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-pink-500/20 to-rose-600/10 border-pink-500/30 text-pink-400",
    glowClass: "shadow-[0_0_20px_rgba(236,72,153,0.06)]",
    url: "https://tradehotel.com.br",
    tag: "HOSPEDAGEM EXECUTIVA",
    preset: "pink"
  },
  {
    id: "ad-12",
    sponsorName: "Laticínios Serra Mineira Premium",
    slogan: "Tradição em manteigas, queijos curados e doces artesanais direto da Fazenda para a sua mesa de café da manhã.",
    actionText: "COMPRAR ONLINE",
    imageUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
    url: "https://laticiniosserramineira.com.br",
    tag: "TRADIÇÃO MINEIRA",
    preset: "green"
  },
  {
    id: "ad-13",
    sponsorName: "Hub Coworking Rossini JF",
    slogan: "Trabalhe no ambiente mais produtivo do centro de JF. Estações com ar-condicionado, café espresso cortesia e Wi-Fi 6.",
    actionText: "AGENDAR DAY PASS",
    imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-purple-500/20 to-fuchsia-600/10 border-purple-500/30 text-purple-400",
    glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.06)]",
    url: "https://coworkingrossini.com.br",
    tag: "COWORKING & HUB",
    preset: "purple"
  },
  {
    id: "ad-14",
    sponsorName: "Sicoob CrediMata Crédito",
    slogan: "Empresas associadas contam com linhas de financiamento exclusivas, maquinários agrícolas e capital de giro facilidades.",
    actionText: "SEJA UM ASSOCIADO",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.06)]",
    url: "https://sicoob.com.br",
    tag: "SOLUÇÃO FINANCEIRA",
    preset: "green"
  },
  {
    id: "ad-15",
    sponsorName: "Camilo dos Santos Logística",
    slogan: "Operações logísticas inteligentes com rastreamento 24h em tempo real e entrega rápida nos estados de MG, RJ e SP.",
    actionText: "COTAR FRETE",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-sky-500/20 to-indigo-600/10 border-sky-500/30 text-sky-400",
    glowClass: "shadow-[0_0_20px_rgba(14,165,233,0.06)]",
    url: "https://camilodossantos.com.br",
    tag: "LOGÍSTICA INTEGRADA",
    preset: "blue"
  },
  {
    id: "ad-16",
    sponsorName: "Rádio Estúdio Web JF Digital",
    slogan: "Sua marca veiculada nos principais podcasts e programas jornalísticos do portal. Conecte-se com mais de 100 mil ouvintes mensais.",
    actionText: "ANUNCIAR NA RÁDIO",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80",
    accentClass: "from-amber-600/20 to-orange-500/10 border-amber-500/30 text-amber-500",
    glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.06)]",
    url: "https://radioestudio.com.br",
    tag: "MÍDIA & PODCAST",
    preset: "amber"
  }
];

const PRESETS = {
  green: {
    accentClass: "from-emerald-500/20 to-green-600/10 border-emerald-500/30 text-emerald-400",
    glowClass: "shadow-[0_0_20px_rgba(16,185,129,0.06)] hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]",
    label: "Verde Esmeralda"
  },
  blue: {
    accentClass: "from-sky-500/20 to-indigo-600/10 border-sky-500/30 text-sky-400",
    glowClass: "shadow-[0_0_20px_rgba(14,165,233,0.06)] hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]",
    label: "Azul Oceano"
  },
  amber: {
    accentClass: "from-amber-600/20 to-orange-500/10 border-amber-500/30 text-amber-500",
    glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    label: "Âmbar Mel"
  },
  pink: {
    accentClass: "from-pink-500/20 to-rose-600/10 border-pink-500/30 text-pink-400",
    glowClass: "shadow-[0_0_20px_rgba(236,72,153,0.06)] hover:shadow-[0_0_30px_rgba(236,72,153,0.15)]",
    label: "Rosa Neon"
  },
  purple: {
    accentClass: "from-purple-500/20 to-fuchsia-600/10 border-purple-500/30 text-purple-400",
    glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.06)] hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    label: "Púrpura Mágica"
  }
};

interface RotatingBannerAdsProps {
  isDarkMode: boolean;
  isAdmin?: boolean;
}

export default function RotatingBannerAds({ isDarkMode, isAdmin = false }: RotatingBannerAdsProps) {
  const [ads, setAds] = useState<AdCampaign[]>(LOCAL_ADS_FALLBACK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // TTS (Text to Speech) Speech Synthesis States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Modal / Admin editing states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdId, setSelectedAdId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [formSponsorName, setFormSponsorName] = useState("");
  const [formSlogan, setFormSlogan] = useState("");
  const [formActionText, setFormActionText] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formPreset, setFormPreset] = useState<keyof typeof PRESETS>("green");

  // Fetch ads on mount
  useEffect(() => {
    fetch("/api/published-data")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.rotating_ads) && data.rotating_ads.length > 0) {
          setAds(data.rotating_ads);
        }
      })
      .catch(() => {});
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

  // Carousel timer
  useEffect(() => {
    if (!isPlaying || isModalOpen || isSpeaking) return;

    const interval = setInterval(() => {
      if (ads.length > 0) {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }
    }, 5500); // slightly longer to allow reading/listening

    return () => clearInterval(interval);
  }, [isPlaying, ads.length, isModalOpen, isSpeaking]);

  // Cancel speech on slide change
  useEffect(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [currentIndex]);

  const activeAd = ads[currentIndex] || ads[0] || LOCAL_ADS_FALLBACK[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(650, "sine");
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound(650, "sine");
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleAdClick = () => {
    playClickSound(800, "sine");
    toast.success(`[Simulação de Campanha] Redirecionando para o patrocinador: ${activeAd.sponsorName}\nURL de destino: ${activeAd.url}`);
  };

  // Convert text to female voice
  const handleToggleSpeech = (e: React.MouseEvent) => {
    e.stopPropagation();
    const synth = synthRef.current;
    if (!synth) {
      toast.error("Síntese de voz não suportada pelo seu navegador.");
      return;
    }

    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      playClickSound(500, "sine");
      return;
    }

    playClickSound(800, "sine");
    const utteranceText = `${activeAd.tag ? activeAd.tag + ". " : ""}${activeAd.sponsorName}. ${activeAd.slogan}. Clique no botão ${activeAd.actionText} para saber mais.`;
    
    activeUtteranceRef.current = speakWithFemaleVoice(
      utteranceText,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Open modal and load the selected/first ad to edit
  const openManagementModal = () => {
    playClickSound(700, "sine");
    setIsModalOpen(true);
    if (ads.length > 0) {
      loadAdIntoForm(ads[0]);
    } else {
      clearForm();
    }
  };

  const loadAdIntoForm = (ad: AdCampaign) => {
    setSelectedAdId(ad.id);
    setFormSponsorName(ad.sponsorName);
    setFormSlogan(ad.slogan);
    setFormActionText(ad.actionText);
    setFormImageUrl(ad.imageUrl);
    setFormUrl(ad.url);
    setFormTag(ad.tag);
    setFormPreset(ad.preset || "green");
  };

  const clearForm = () => {
    setSelectedAdId(null);
    setFormSponsorName("");
    setFormSlogan("");
    setFormActionText("SAIBER MAIS");
    setFormImageUrl("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80");
    setFormUrl("https://");
    setFormTag("PARCEIRO");
    setFormPreset("green");
  };

  // Image upload handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              setFormImageUrl(data.url);
              playSuccessSound();
              toast.success("Foto de patrocinador enviada com sucesso!");
            } else {
              toast.error("Erro ao subir imagem.");
            }
          })
          .catch((err) => {
            console.error("Upload error:", err);
            toast.error("Erro na conexão ao subir imagem.");
          })
          .finally(() => {
            setUploadingImage(false);
          });
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes/add new ad to local list, and send to Firestore
  const handleSaveAd = () => {
    if (!formSponsorName.trim() || !formSlogan.trim()) {
      toast.error("Nome e descrição do patrocinador são obrigatórios.");
      return;
    }

    const presetStyle = PRESETS[formPreset];
    const adData: AdCampaign = {
      id: selectedAdId || `ad-${Date.now()}`,
      sponsorName: formSponsorName,
      slogan: formSlogan,
      actionText: formActionText || "SAIBER MAIS",
      imageUrl: formImageUrl,
      accentClass: presetStyle.accentClass,
      glowClass: presetStyle.glowClass,
      url: formUrl || "https://",
      tag: formTag.toUpperCase() || "PATROCINADOR",
      preset: formPreset
    };

    let updatedList: AdCampaign[];
    if (selectedAdId) {
      updatedList = ads.map((ad) => (ad.id === selectedAdId ? adData : ad));
      toast.success("Campanha atualizada localmente.");
    } else {
      updatedList = [...ads, adData];
      toast.success("Nova campanha adicionada localmente.");
    }

    persistAdsList(updatedList);
    // Reload form with saved/updated item
    setSelectedAdId(adData.id);
  };

  // Delete an ad
  const handleDeleteAd = (id: string) => {
    playClickSound(500, "sine");
    const updatedList = ads.filter((ad) => ad.id !== id);
    persistAdsList(updatedList);
    if (selectedAdId === id) {
      if (updatedList.length > 0) {
        loadAdIntoForm(updatedList[0]);
      } else {
        clearForm();
      }
    }
    toast.success("Campanha removida.");
  };

  // Move up/down in the queue
  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === ads.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newList = [...ads];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    persistAdsList(newList);
    setCurrentIndex(0); // reset view safely
  };

  const persistAdsList = (newList: AdCampaign[]) => {
    setAds(newList);
    // Fetch current server configuration to merge securely
    fetch("/api/published-data")
      .then((res) => res.json())
      .then((serverData) => {
        const payload = {
          ...serverData,
          rotating_ads: newList
        };
        fetch("/api/publish-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
          .then((r) => r.json())
          .then((d) => {
            console.log("Sponsor campaigns successfully published to Firestore", d);
          })
          .catch((err) => {
            console.error("Error saving rotating ads to Firestore:", err);
            toast.error("Erro ao sincronizar com banco de dados remoto.");
          });
      })
      .catch((err) => {
        console.error("Error reading database before update:", err);
      });
  };

  return (
    <div id="rotating-ads-container" className="max-w-7xl mx-auto px-4 py-4 select-none">
      
      {/* SECTION AD LABEL HEADER */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-900/60 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
        <div className="flex items-center gap-1.5 font-bold">
          <Megaphone className="w-3.5 h-3.5 text-pink-500 animate-bounce" />
          <span>PARCEIROS PATROCINADORES DA REDE</span>
        </div>
        
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={openManagementModal}
              className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-pink-400 hover:text-pink-300 font-bold border border-zinc-800 rounded transition duration-200"
              title="Gerenciar patrocinadores"
            >
              <Settings className="w-3 h-3 text-pink-500 animate-spin-slow" />
              <span>EDITAR PATROCÍNIOS</span>
            </button>
          )}

          <div className="flex gap-1.5">
            {ads.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { playClickSound(600, "sine"); setCurrentIndex(idx); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? "bg-pink-500 scale-125 shadow-[0_0_8px_rgba(236,72,153,0.6)]" 
                    : "bg-zinc-800 hover:bg-zinc-650"
                }`}
                title={`Anúncio ${idx + 1}`}
              />
            ))}
          </div>
          <span className="opacity-60 hidden sm:inline">Anúncios rotativos do Sudeste</span>
        </div>
      </div>

      {ads.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-mono text-xs">
          Nenhum anúncio ou patrocinador cadastrado. {isAdmin && "Clique em 'EDITAR PATROCÍNIOS' acima para adicionar."}
        </div>
      ) : (
        /* HORIZONTAL BANNER BLOCK */
        <div 
          onClick={handleAdClick}
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
          className={`group relative overflow-hidden rounded-2xl border-2 bg-gradient-to-r p-4 sm:p-5 transition-all duration-500 cursor-pointer flex flex-col md:flex-row items-center gap-4 ${activeAd.accentClass} ${activeAd.glowClass}`}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition duration-300 group-hover:bg-black/30 pointer-events-none" />
          
          {/* Navigation buttons inside the banner */}
          <button
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/95 text-zinc-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20 border border-zinc-800"
            title="Anúncio anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black/95 text-zinc-400 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20 border border-zinc-800"
            title="Próximo anúncio"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* SPONSOR DECORATION IMAGE */}
          <div className="relative w-full sm:w-36 h-24 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-zinc-950 z-10 p-1">
            <img 
              src={activeAd.imageUrl} 
              alt={activeAd.sponsorName}
              className="w-full h-full object-contain transition duration-700 group-hover:scale-108"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-1.5 left-1.5 bg-black/90 text-zinc-300 text-[8px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider font-bold border border-zinc-800 shadow">
              SPONSOR
            </div>
          </div>

          {/* MID CONTENT AREA */}
          <div className="flex-1 min-w-0 space-y-1 relative z-10 text-center md:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
              <span className="text-[10px] font-mono font-black tracking-widest uppercase text-pink-500 flex items-center gap-1 justify-center md:justify-start">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                {activeAd.tag}
              </span>
              <h4 className="font-display font-black text-xs sm:text-sm tracking-tight text-white uppercase leading-none drop-shadow-md">
                {activeAd.sponsorName}
              </h4>
              
              {/* FEMALE TEXT-TO-SPEECH BUTTON */}
              <button
                onClick={handleToggleSpeech}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition duration-250 shrink-0 self-center md:self-start border ${
                  isSpeaking 
                    ? "bg-pink-600 border-pink-500 text-white animate-pulse" 
                    : "bg-black/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-pink-400"
                }`}
                title={isSpeaking ? "Parar leitura por voz" : "Ouvir em voz feminina"}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3 h-3 text-white animate-spin-slow" />
                    <span>PARAR VOZ 🔊</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3 h-3 text-pink-400" />
                    <span>OUVIR TEXTO (VOZ) 🎙️</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-300 font-sans leading-snug tracking-normal line-clamp-3 md:line-clamp-2">
              {activeAd.slogan}
            </p>
          </div>

          {/* ACTION BUTTON RIGHT SIDE */}
          <div className="shrink-0 z-10 w-full md:w-auto">
            <div className="inline-flex items-center justify-center gap-1.5 w-full md:w-auto px-4 py-2 bg-white text-black hover:bg-pink-500 hover:text-white text-[10px] font-mono font-black uppercase rounded-lg shadow-lg transition duration-300 group-hover:scale-102">
              <span>{activeAd.actionText}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      )}

      {/* ADMIN SPONSOR AD CAMPAIGN MANAGER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fade-in text-white select-text">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/40">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-pink-500 animate-spin-slow" />
                <div>
                  <h3 className="font-display font-bold text-base text-white uppercase tracking-tight">
                    Gerenciador de Campanhas / Patrocinadores
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-500">
                    Sincronizado automaticamente com Firestore em tempo real
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

            {/* Modal Body (2 Columns split) */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-zinc-900">
              
              {/* Left Column: Ads Index List */}
              <div className="w-full lg:w-2/5 p-5 overflow-y-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-zinc-500 uppercase">
                    Fila de Patrocínios ({ads.length})
                  </span>
                  <button
                    onClick={() => { playClickSound(700, "sine"); clearForm(); }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-mono font-black rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>CADASTRAR NOVO</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ads.map((ad, idx) => {
                    const isEditingThis = selectedAdId === ad.id;
                    return (
                      <div 
                        key={ad.id}
                        onClick={() => loadAdIntoForm(ad)}
                        className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                          isEditingThis 
                            ? "bg-pink-950/20 border-pink-500/50" 
                            : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-900/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={ad.imageUrl} 
                            alt={ad.sponsorName} 
                            className="w-10 h-8 rounded object-cover border border-zinc-800 bg-zinc-950" 
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-white truncate uppercase">{ad.sponsorName}</h5>
                            <span className="text-[8px] font-mono text-pink-400 uppercase tracking-widest block">{ad.tag || "CAMPANHA"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleMove(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition"
                            title="Mover para cima"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleMove(idx, "down")}
                            disabled={idx === ads.length - 1}
                            className="p-1 text-zinc-500 hover:text-zinc-300 disabled:opacity-30 transition"
                            title="Mover para baixo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAd(ad.id)}
                            className="p-1 text-red-500 hover:text-red-400 transition"
                            title="Remover patrocinador"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Editor Form */}
              <div className="w-full lg:w-3/5 p-5 overflow-y-auto space-y-5 bg-zinc-950/40">
                <h4 className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {selectedAdId ? "Editando Patrocinador Selecionado" : "Adicionando Novo Patrocinador"}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sponsor Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Nome do Patrocinador / Empresa *
                    </label>
                    <input 
                      type="text" 
                      value={formSponsorName}
                      onChange={e => setFormSponsorName(e.target.value)}
                      placeholder="Ex: Supermercados Estrela das Rosas"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Slogan / Campaign Text */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Etiqueta / Tag superior *
                    </label>
                    <input 
                      type="text" 
                      value={formTag}
                      onChange={e => setFormTag(e.target.value)}
                      placeholder="Ex: OFERTA LOCAL BARBACENA"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Slogan Text (Full span) */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Slogan / Texto de Apoio *
                    </label>
                    <textarea 
                      value={formSlogan}
                      onChange={e => setFormSlogan(e.target.value)}
                      rows={3}
                      placeholder="Ex: Qualidade, frescor e economia. Produtos hortifrúti colhidos diariamente por agricultores familiares..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Image / Banner Upload */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Imagem / Foto do Patrocinador
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formImageUrl}
                        onChange={e => setFormImageUrl(e.target.value)}
                        placeholder="Insira a URL ou faça upload de um arquivo"
                        className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
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
                          <Image className="w-3.5 h-3.5 text-zinc-400" />
                        )}
                        <span>ENVIAR ARQUIVO</span>
                      </button>
                    </div>
                  </div>

                  {/* Action Link Button Text */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Texto do Botão de Ação
                    </label>
                    <input 
                      type="text" 
                      value={formActionText}
                      onChange={e => setFormActionText(e.target.value)}
                      placeholder="Ex: VER OFERTAS"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Action Link Target URL */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      URL de Destino (Clique)
                    </label>
                    <input 
                      type="text" 
                      value={formUrl}
                      onChange={e => setFormUrl(e.target.value)}
                      placeholder="Ex: https://..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>

                  {/* Accent Color Preset picker */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Tema de Cor do Banner
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {Object.entries(PRESETS).map(([key, style]) => {
                        const isSelected = formPreset === key;
                        let bgDot = "bg-green-500";
                        if (key === "blue") bgDot = "bg-sky-500";
                        if (key === "amber") bgDot = "bg-amber-500";
                        if (key === "pink") bgDot = "bg-pink-500";
                        if (key === "purple") bgDot = "bg-purple-500";
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setFormPreset(key as any)}
                            className={`p-2 rounded-lg border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                              isSelected 
                                ? "bg-zinc-800 border-pink-500" 
                                : "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900"
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full ${bgDot}`} />
                            <span className="text-[9px] font-mono font-medium block truncate text-zinc-300">
                              {style.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Form Controls / Buttons */}
                <div className="pt-4 border-t border-zinc-900 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearForm}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-bold rounded-xl transition"
                  >
                    LIMPAR CAMPOS
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAd}
                    className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-mono font-black rounded-xl flex items-center gap-1.5 shadow-lg transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SALVAR ALTERAÇÕES</span>
                  </button>
                </div>

                {/* LIVE FORM PREVIEW PRESET BOX */}
                <div className="pt-2">
                  <div className="flex items-center gap-1.5 pb-1 text-zinc-500 font-mono text-[9px] uppercase">
                    <Eye className="w-3.5 h-3.5 text-pink-500" />
                    <span>PRÉ-VISUALIZAÇÃO EM TEMPO REAL</span>
                  </div>
                  
                  <div className={`p-4 rounded-xl border-2 bg-gradient-to-r flex flex-col sm:flex-row items-center gap-3 relative overflow-hidden ${PRESETS[formPreset].accentClass} ${PRESETS[formPreset].glowClass}`}>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />
                    <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-zinc-800 z-10">
                      <img 
                        src={formImageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"} 
                        alt="Preview image"
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5 relative z-10 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="text-[8px] font-mono font-black uppercase text-pink-500">{formTag || "PATROCINADOR"}</span>
                        <h4 className="font-display font-black text-xs text-white uppercase truncate">{formSponsorName || "Nome da Empresa"}</h4>
                      </div>
                      <p className="text-[10px] text-zinc-300 font-sans leading-snug line-clamp-1">{formSlogan || "Mensagem promocional..."}</p>
                    </div>
                    <div className="shrink-0 z-10 text-[9px] font-mono px-3 py-1 bg-white text-black rounded font-bold uppercase">
                      {formActionText || "CLIQUE AQUI"}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
