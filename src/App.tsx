import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Grid,
  List,
  Layers,
  Sparkles,
  Unlock,
  Lock,
  MessageSquare,
  ThumbsUp,
  Share2,
  Calendar,
  Clock,
  Compass,
  ArrowRight,
  User,
  LogOut,
  SlidersHorizontal,
  Mail,
  Send,
  MapPin,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Sun,
  Moon,
  Rocket,
  Globe,
  Lightbulb,
  TrendingUp,
  Building2,
  Users,
  Shield,
  Briefcase,
  Handshake,
  Megaphone,
  Diamond,
  Mic,
  BookOpen,
  Camera,
  Trash2,
  Plus,
  Upload,
  X,
  ShieldCheck,
  Loader2,
  Instagram,
  ExternalLink,
  Check,
  Edit,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";
import { Toaster, toast } from "sonner";
import VLibras from '@djpfs/react-vlibras';
import { compressImageFile, uploadImageToServer } from "./utils/imageCompression";

import { NewsArticle, CategoryType, CardLayoutType, AppUser, Comment } from "./types";
import { INITIAL_ARTICLES, SPECIAL_DATES_CATALOG } from "./data";
import { isOfflineModeActive, setOfflineModeOverride } from "./utils/offlineStorage";
import BrandLogo from "./components/BrandLogo";
import WeatherWidget from "./components/WeatherWidget";
import CollapsibleHeaderWeather from "./components/CollapsibleHeaderWeather";
import FloatingMenu from "./components/FloatingMenu";
import SocialFloatingMenu from "./components/SocialFloatingMenu";
import AuthModal from "./components/AuthModal";
import CmsDashboard from "./components/CmsDashboard";
import NewsletterSection from "./components/NewsletterSection";
import VisualEditorPanel from "./components/VisualEditorPanel";
import PodcastSection from "./components/PodcastSection";
import CategoryPageHeader from "./components/CategoryPageHeader";
import ContactSection from "./components/ContactSection";
import HeroVideoSlider from "./components/HeroVideoSlider";
import BreakingNewsTicker from "./components/BreakingNewsTicker";
import ComunidadeDashboard from "./components/ComunidadeDashboard";
import EmbaixadoresDashboard, { OFFICIAL_AMBASSADORS, OfficialAmbassador } from "./components/EmbaixadoresDashboard";
import GlobalPhotoGallery from "./components/GlobalPhotoGallery";
import PositionableImage from "./components/PositionableImage";
import RotatingBannerAds from "./components/RotatingBannerAds";
import TestimonialShuffleCards from "./components/TestimonialShuffleCards";
import CommunityMembership from "./components/CommunityMembership";
import PortalAdvertising from "./components/PortalAdvertising";
import PwaInstallButton from "./components/PwaInstallButton";
import FaceNavigationSystem from "./components/FaceNavigationSystem";
import PodcastPipPlayer, { PipVideoData } from "./components/PodcastPipPlayer";
import AgendaCalendar from "./components/AgendaCalendar";
import UpcomingEventsSection from "./components/UpcomingEventsSection";
import MonthlyHighlightsSection from "./components/MonthlyHighlightsSection";
import PartnersCarousel from "./components/PartnersCarousel";
import { playClickSound, playSuccessSound, playNegativeSound, isSoundEnabled, setSoundEnabled } from "./utils/audio";
import { TopinaAssistant } from "./components/TopinaAssistant";
import VoiceAgentModal from "./components/VoiceAgentModal";
import { SpotifyPlayer } from "./components/SpotifyPlayer";
import ImageCropperModal from "./components/ImageCropperModal";
import UserProfile from "./components/UserProfile";
import VoiceSearchButton from "./components/VoiceSearchButton";
import RodadaCountdownBanner from "./components/RodadaCountdownBanner";
import RodadaPopup from "./components/RodadaPopup";
import { COMMUNITY_CATEGORIES } from "./lib/community-categories";
import { EventCountdownCard } from "./components/ui/event-countdown-card";
import RSVPEvent from "./components/RSVPEvent";
import PendingApprovalScreen from "./components/PendingApprovalScreen";
import WelcomePopup from "./components/WelcomePopup";
import SiteTourModal from "./components/SiteTourModal";
import { auth, trackPageView, trackEngagementEvent, trackArticleView, trackUserAction } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";



export default function App() {
  // Mode configuration
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSiteTourOpen, setIsSiteTourOpen] = useState(false);
  const [areFloatingButtonsCollapsed, setAreFloatingButtonsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("floating_buttons_collapsed") === "true";
    }
    return false;
  });

  const toggleFloatingButtons = () => {
    const newState = !areFloatingButtonsCollapsed;
    setAreFloatingButtonsCollapsed(newState);
    localStorage.setItem("floating_buttons_collapsed", String(newState));
    playClickSound(newState ? 600 : 750, "sine");
  };
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);
  const [showEventPopup, setShowEventPopup] = useState(true);
  const [showRodadaPopup, setShowRodadaPopup] = useState(false);
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [rocketClicks, setRocketClicks] = useState(0);
  const [showRocketModal, setShowRocketModal] = useState(false);

  React.useEffect(() => {
    console.log(
      "%c🚀 DO COMEÇO AO TOPO — PORTAL DE NEGÓCIOS 🚀",
      "background: #111; color: #22c55e; font-size: 16px; font-weight: bold; padding: 10px; border-radius: 8px;"
    );
    console.log(
      "%cOlá, curioso do código! Se você chegou até aqui, tem o perfil analítico e a paixão por tecnologia que procuramos.\nPalavra-chave secreta: TOPO\nMande um 'Oi' para nossa equipe de tecnologia e garanta um brinde exclusivo em nosso próximo summit!",
      "color: #a1a1aa; font-size: 12px; font-family: monospace;"
    );
  }, []);

  React.useEffect(() => {
    // Proactively clean up oversized base64 values from localStorage to prevent QuotaExceededError
    try {
      const keysToClean = [
        "app_highlight_photo_unicorn",
        "app_highlight_photo_jfsummit",
        "app_upcoming_event_speaker_photo"
      ];
      keysToClean.forEach(key => {
        const val = localStorage.getItem(key);
        if (val && val.startsWith("data:image/")) {
          // Stale huge base64 in localStorage that causes browser quota failure -> purge it
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn("Storage auto-cleanup:", e);
    }
  }, []);

  // URL and Section Synchronizer
  const pathToState = (rawPath: string) => {
    const clean = rawPath.toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
    if (clean === "/" || clean === "/inicio" || clean === "/feed") {
      return { category: null, section: null };
    }
    if (clean === "/comunidade" || clean === "/membros") {
      return { category: "COMUNIDADE" as CategoryType, section: null };
    }
    if (clean === "/embaixadores") {
      return { category: "EMBAIXADORES" as CategoryType, section: null };
    }
    if (clean === "/contato" || clean === "/fale-conosco") {
      return { category: null, section: "CONTATO" };
    }
    if (clean === "/quem-somos" || clean === "/sobre") {
      return { category: null, section: "QUEM SOMOS" };
    }
    if (clean === "/objetivos") {
      return { category: null, section: "OBJETIVOS" };
    }
    if (clean === "/onde-estamos" || clean === "/tour") {
      return { category: null, section: "ONDE ESTAMOS" };
    }
    if (clean === "/galeria" || clean === "/fotos") {
      return { category: null, section: "GALERIA" };
    }
    if (clean === "/depoimentos" || clean === "/vozes-femininas") {
      return { category: null, section: "DEPOIMENTOS" };
    }
    if (clean === "/parceiros") {
      return { category: null, section: "PARCEIROS" };
    }
    if (clean === "/anuncie" || clean === "/anuncie-aqui") {
      return { category: null, section: "ANUNCIE AQUI" };
    }
    if (clean === "/podcast") {
      return { category: "PODCAST" as CategoryType, section: "PODCAST" };
    }
    if (clean === "/eventos") {
      return { category: "EVENTOS" as CategoryType, section: null };
    }
    if (clean === "/rsvp") {
      return { category: null, section: "RSVP" };
    }
    if (clean === "/categorias") {
      return { category: null, section: "CATEGORIAS" };
    }
    return { category: null, section: null };
  };

  React.useEffect(() => {
    const handleUrlSync = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      if (hash === "#rsvp") {
        setShowWelcomePopup(false);
        setShowEventPopup(false);
        setActiveSection("RSVP");
        setSelectedCategory(null);
        return;
      }
      if (pathname && pathname !== "/") {
        const { category, section } = pathToState(pathname);
        if (category !== null || section !== null) {
          setShowWelcomePopup(false);
          setShowEventPopup(false);
          setSelectedCategory(category);
          setActiveSection(section);
        }
      }
    };
    handleUrlSync();
    window.addEventListener("popstate", handleUrlSync);
    window.addEventListener("hashchange", handleUrlSync);
    return () => {
      window.removeEventListener("popstate", handleUrlSync);
      window.removeEventListener("hashchange", handleUrlSync);
    };
  }, []);

  React.useEffect(() => {
    let targetPath = "/";
    if (activeSection === "CONTATO") targetPath = "/contato";
    else if (activeSection === "QUEM SOMOS") targetPath = "/quem-somos";
    else if (activeSection === "OBJETIVOS") targetPath = "/objetivos";
    else if (activeSection === "ONDE ESTAMOS") targetPath = "/onde-estamos";
    else if (activeSection === "GALERIA") targetPath = "/galeria";
    else if (activeSection === "DEPOIMENTOS") targetPath = "/depoimentos";
    else if (activeSection === "PARCEIROS") targetPath = "/parceiros";
    else if (activeSection === "ANUNCIE AQUI") targetPath = "/anuncie";
    else if (activeSection === "RSVP") targetPath = "/rsvp";
    else if (activeSection === "CATEGORIAS") targetPath = "/categorias";
    else if (selectedCategory === "COMUNIDADE") targetPath = "/comunidade";
    else if (selectedCategory === "EMBAIXADORES") targetPath = "/embaixadores";
    else if (selectedCategory === "PODCAST" || activeSection === "PODCAST") targetPath = "/podcast";
    else if (selectedCategory === "EVENTOS") targetPath = "/eventos";

    if (typeof window !== "undefined" && window.location.pathname !== targetPath) {
      try {
        window.history.pushState({ targetPath }, "", targetPath);
      } catch (e) {
        console.warn("History push state error:", e);
      }
    }
  }, [activeSection, selectedCategory]);

  const handleWelcomeOptionSelect = (option: string) => {
    switch (option) {
      case "CADASTRE-SE":
        setAuthModalTab("client");
        setAuthModalOpen(true);
        setShowWelcomePopup(false);
        break;
      case "VISITANTE":
        setShowWelcomePopup(false);
        setShowEventPopup(true);
        break;
      case "COMUNIDADE":
        handleSelectCategory("COMUNIDADE");
        setShowWelcomePopup(false);
        setShowEventPopup(true);
        break;
      case "EMBAIXADORES":
        handleSelectCategory("EMBAIXADORES");
        setShowWelcomePopup(false);
        setShowEventPopup(true);
        break;
      case "PARCEIROS":
        setActiveSection("PARCEIROS");
        setSelectedCategory(null);
        window.scrollTo({ top: 300, behavior: "smooth" });
        setShowWelcomePopup(false);
        setShowEventPopup(true);
        break;
      case "ANUNCIAR":
        setActiveSection("ANUNCIE AQUI");
        setSelectedCategory(null);
        window.scrollTo({ top: 300, behavior: "smooth" });
        setShowWelcomePopup(false);
        break;
      case "ADMIN":
        setAuthModalTab("admin");
        setAuthModalOpen(true);
        setShowWelcomePopup(false);
        break;
      default:
        setShowWelcomePopup(false);
    }
  };
  const [layout, setLayout] = useState<CardLayoutType>("grid");
  const [activeTab, setActiveTab] = useState<"reader" | "editor">("reader");

  // custom states requested
  const [isSoundActive, setIsSoundActive] = useState(() => isSoundEnabled());
  const [gradientStyle, setGradientStyle] = useState<"neonPulse" | "pinkGlow" | "auroraGreenPink" | "subtleSpring">(
    () => (localStorage.getItem("gradient_style") as any) || "neonPulse"
  );
  const [footerCredits, setFooterCredits] = useState(
    () => localStorage.getItem("footer_credits") || "Criado por Anderson Maooe | Todos os direitos reservados."
  );

  // Visitor Counter State


  // Direct visual layout & style editor states
  const [directEditingMode, setDirectEditingMode] = useState(false);
  const [logoConfig, setLogoConfig] = useState(() => {
    const saved = localStorage.getItem("logo_config");
    return saved ? JSON.parse(saved) : {
      customImageUrl: "https://i.ibb.co/XhKWdTK/do-comeco.jpg",
      customLogoWidth: 166,
      customLogoHeight: 73,
      customText1: "DO COMEÇO",
      customText2: "AO TOPO",
      customSub: "PORTAL DE NEGÓCIOS"
    };
  });
  
  // Custom CMS status indicator tracking
  const [cmsSaveStatus, setCmsSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [editingLogo, setEditingLogo] = useState(false);

  // Admin "+ CRIAR NOVO" button states
  const [adminCreateDropdownOpen, setAdminCreateDropdownOpen] = useState(false);
  const [isAmbassadorModalOpen, setIsAmbassadorModalOpen] = useState(false);
  const [editingAmbassadorIdx, setEditingAmbassadorIdx] = useState<number | null>(null);

  // Ambassador form fields
  const [ambName, setAmbName] = useState("");
  const [ambSpecialty, setAmbSpecialty] = useState("");
  const [ambInstagram, setAmbInstagram] = useState("");
  const [ambFullName, setAmbFullName] = useState("");
  const [ambPhotoUrl, setAmbPhotoUrl] = useState("");
  const [ambFunction, setAmbFunction] = useState("");
  const [ambAcademic, setAmbAcademic] = useState("");
  const [ambRole, setAmbRole] = useState("");
  const [ambCity, setAmbCity] = useState("");

  // Authentication state
  const [user, setUser] = useState<AppUser>({
    email: "",
    name: "",
    photoUrl: "",
    isAuthenticated: false,
    isAdmin: false,
  });
  const isDirectEditingEnabled = (activeTab as string) === "editor" || (user.isAuthenticated && user.isAdmin);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [motionNavMode, setMotionNavMode] = useState<"face" | "hands" | null>(null);
  const [pipVideo, setPipVideo] = useState<PipVideoData | null>(null);
  const [authModalTab, setAuthModalTab] = useState<"client" | "admin">("client");
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingCategory, setPendingCategory] = useState<CategoryType | null>(null);
  const [pendingArticle, setPendingArticle] = useState<NewsArticle | null>(null);

  const [reorderModalOpen, setReorderModalOpen] = useState(false);
  const [homepageSectionsOrder, setHomepageSectionsOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem("homepage_sections_order");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes("advertising")) {
            const memIndex = parsed.indexOf("membership");
            if (memIndex !== -1) {
              parsed.splice(memIndex + 1, 0, "advertising");
            } else {
              parsed.push("advertising");
            }
            localStorage.setItem("homepage_sections_order", JSON.stringify(parsed));
          }
          return parsed;
        }
      } catch (err) {}
    }
    return ["ticker", "hero", "membership", "advertising", "testimonials", "feed", "ads", "partners"];
  });

  const getSectionLabel = (id: string) => {
    switch (id) {
      case "ticker": return "📢 Letreiro de Notícias";
      case "hero": return "🎬 Vídeo & Slides Principais";
      case "membership": return "👑 Planos da Comunidade";
      case "advertising": return "📊 Publicidade no Portal (Cotas)";
      case "testimonials": return "💬 Depoimentos";
      case "feed": return "📰 Feed de Conteúdo Principal";
      case "ads": return "🎯 Banners de Publicidade";
      case "partners": return "🤝 Carrossel de Parceiros";
      default: return id;
    }
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...homepageSectionsOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setHomepageSectionsOrder(newOrder);
    localStorage.setItem("homepage_sections_order", JSON.stringify(newOrder));
    playClickSound(650, "sine");
    toast.success("Bloco movido para cima!");
  };

  const moveSectionDown = (index: number) => {
    if (index === homepageSectionsOrder.length - 1) return;
    const newOrder = [...homepageSectionsOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setHomepageSectionsOrder(newOrder);
    localStorage.setItem("homepage_sections_order", JSON.stringify(newOrder));
    playClickSound(650, "sine");
    toast.success("Bloco movido para baixo!");
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const newOrder = [...homepageSectionsOrder];
    const [removed] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, removed);

    setHomepageSectionsOrder(newOrder);
    localStorage.setItem("homepage_sections_order", JSON.stringify(newOrder));
    toast.success("Ordem dos blocos alterada!");
    playSuccessSound();
  };

  // Articles & Comments states (persisted in RAM for high fidelity)
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem("docomeco_articles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((a: any) => a.id));
          const missing = INITIAL_ARTICLES.filter((a) => !existingIds.has(a.id));
          return [...parsed, ...missing];
        }
      } catch (err) {}
    }
    return INITIAL_ARTICLES;
  });
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "comm-1",
      articleId: "art-1",
      userName: "Henrique Alvim",
      userEmail: "henrique@gmail.com",
      text: "Sensacional! Esse festival de outono promete muito, as cervejarias locais são fantásticas.",
      date: "2026-05-21T20:00:00Z",
    },
    {
      id: "comm-2",
      articleId: "art-3",
      userName: "Juliana Frota",
      userEmail: "juliana.frota@gmail.com",
      text: "Dados incríveis de conversão regional! Realmente os influenciadores locais engajam muito mais.",
      date: "2026-05-21T14:30:00Z",
    }
  ]);

  // Search and Advanced Filters
  const [searchText, setSearchText] = useState("");
  const [agendaSearch, setAgendaSearch] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("TODAS");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [navInicioOpen, setNavInicioOpen] = useState(false);
  const [navRamosOpen, setNavRamosOpen] = useState(false);
  const [navCidadesOpen, setNavCidadesOpen] = useState(false);
  const [navEventosOpen, setNavEventosOpen] = useState(false);
  const [navContatoOpen, setNavContatoOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "relevance">("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileWeatherOpen, setIsMobileWeatherOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  // Active expanded section/article
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Quem Somos custom upload states
  const DEFAULT_QUEM_SOMOS_GALLERY = [
    { id: "qsg-1", url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", caption: "Encontro Estratégico com Líderes" },
    { id: "qsg-2", url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80", caption: "Gravação no Estúdio do Podcast" },
    { id: "qsg-3", url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80", caption: "Painel de Conexões e Negócios" }
  ];

  const [quemSomosProfilePic, setQuemSomosProfilePic] = useState<string>(() => {
    const saved = localStorage.getItem("quem_somos_profile_pic") || localStorage.getItem("quem-somos-profile-regina_uploaded_src");
    return (saved && saved.trim() !== "" && saved !== "undefined" && saved !== "null") ? saved : "/regina-profile.jpg";
  });
  const [quemSomosGallery, setQuemSomosGallery] = useState<{ id: string; url: string; caption: string }[]>(() => {
    const saved = localStorage.getItem("quem_somos_gallery");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_QUEM_SOMOS_GALLERY;
  });

  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Quem Somos Gallery Editing State
  const [editingGalleryItem, setEditingGalleryItem] = useState<{ id: string; url: string; caption: string } | null>(null);
  const [isAddingGalleryItem, setIsAddingGalleryItem] = useState(false);
  const [galleryFormUrl, setGalleryFormUrl] = useState("");
  const [galleryFormCaption, setGalleryFormCaption] = useState("");
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenAddGalleryPhoto = () => {
    playClickSound(700, "sine");
    setGalleryFormUrl("");
    setGalleryFormCaption("");
    setIsAddingGalleryItem(true);
    setEditingGalleryItem(null);
  };

  const handleOpenEditGalleryPhoto = (item: { id: string; url: string; caption: string }) => {
    playClickSound(700, "sine");
    setEditingGalleryItem(item);
    setGalleryFormUrl(item.url);
    setGalleryFormCaption(item.caption);
    setIsAddingGalleryItem(false);
  };

  const handleSaveGalleryPhoto = () => {
    if (!galleryFormUrl.trim()) {
      toast.error("Por favor, insira o link da foto ou carregue um arquivo.");
      return;
    }

    playSuccessSound();
    if (editingGalleryItem) {
      // Editing existing
      const updated = quemSomosGallery.map((p) => 
        p.id === editingGalleryItem.id 
          ? { ...p, url: galleryFormUrl.trim(), caption: galleryFormCaption.trim() || "Atividade / Evento" }
          : p
      );
      setQuemSomosGallery(updated);
      localStorage.setItem("quem_somos_gallery", JSON.stringify(updated));
      fetch(`/api/quem-somos-gallery/${editingGalleryItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: galleryFormUrl.trim(), caption: galleryFormCaption.trim() || "Atividade / Evento" })
      }).catch(() => {});
      toast.success("Foto da galeria atualizada com sucesso!");
    } else {
      // Adding new
      const newItem = {
        id: `qsg-${Date.now()}`,
        url: galleryFormUrl.trim(),
        caption: galleryFormCaption.trim() || "Nova Atividade Cadastrada"
      };
      const updated = [newItem, ...quemSomosGallery];
      setQuemSomosGallery(updated);
      localStorage.setItem("quem_somos_gallery", JSON.stringify(updated));
      fetch("/api/quem-somos-gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem)
      }).catch(() => {});
      toast.success("Nova foto adicionada à galeria com sucesso!");
    }

    setEditingGalleryItem(null);
    setIsAddingGalleryItem(false);
    setGalleryFormUrl("");
    setGalleryFormCaption("");
  };

  const handleUploadGalleryFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 15MB");
      return;
    }

    try {
      setIsGalleryUploading(true);
      toast.loading("Otimizando e enviando foto...", { id: "upload-qsg" });

      const compressedDataUrl = await compressImageFile(file, {
        maxDimension: 1200,
        quality: 0.8
      });

      const hostedUrl = await uploadImageToServer(compressedDataUrl);
      setGalleryFormUrl(hostedUrl);
      toast.success("Foto carregada com sucesso!", { id: "upload-qsg" });
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar foto.", { id: "upload-qsg" });
    } finally {
      setIsGalleryUploading(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleResetGalleryPhotos = () => {
    setQuemSomosGallery(DEFAULT_QUEM_SOMOS_GALLERY);
    localStorage.setItem("quem_somos_gallery", JSON.stringify(DEFAULT_QUEM_SOMOS_GALLERY));
    toast.info("Galeria Quem Somos restaurada para as fotos padrão.");
  };

  const [expandedQuemSomosCardIdx, setExpandedQuemSomosCardIdx] = useState<number | null>(null);

  const [editingInstaIdx, setEditingInstaIdx] = useState<number | null>(null);
  const [tempInstaText, setTempInstaText] = useState("");

  // Load official ambassadors state for Showcase rendering in Quem Somos
  const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {
    const saved = localStorage.getItem("embaixadores_list");
    let baseList = OFFICIAL_AMBASSADORS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = parsed;
        }
      } catch (e) {
        console.error("Error parsing saved embaixadores_list", e);
      }
    }
    try {
      return baseList.map((a: any, idx: number) => {
        const defaultAmb: OfficialAmbassador | undefined = OFFICIAL_AMBASSADORS[idx];
        if (!defaultAmb) return a;
        const localPhotoKey = `ambassador-pic-${idx}-${defaultAmb.name}_uploaded_src`;
        
        // Force reset old cached images for Jaqueline de Carvalho Dias
        if (defaultAmb.name === "Jaqueline de Carvalho Dias") {
          localStorage.removeItem(localPhotoKey);
          localStorage.removeItem(`ambassador-pic-${idx}-Jaqueline Dias_uploaded_src`);
        }

        const localPhoto = localStorage.getItem(localPhotoKey);
        
        // Clean and heal value
        let currentPhoto = localPhoto;
        if (!currentPhoto || currentPhoto.trim() === "" || currentPhoto === "undefined" || currentPhoto === "null") {
          currentPhoto = a.photoUrl;
        }
        if (!currentPhoto || currentPhoto.trim() === "" || currentPhoto === "undefined" || currentPhoto === "null") {
          currentPhoto = defaultAmb?.photoUrl;
        }
        if (currentPhoto && currentPhoto.startsWith("data:image/")) {
          currentPhoto = defaultAmb?.photoUrl;
        }
        if (!currentPhoto || currentPhoto.trim() === "" || currentPhoto === "undefined" || currentPhoto === "null") {
          currentPhoto = defaultAmb?.photoUrl || "";
        }
        return { 
          ...a, 
          name: defaultAmb.name,
          fullName: defaultAmb.fullName,
          specialty: defaultAmb.specialty, 
          city: a.city !== undefined ? a.city : defaultAmb.city,
          instagram: (a.instagram && !['@anderson', '@andreia', '@bianca', '@danielle', '@fatima', '@flavia', '@jaqueline', '@silvania', '@isabela'].includes(a.instagram)) ? a.instagram : defaultAmb.instagram,
          functionAsAmbassador: defaultAmb.functionAsAmbassador,
          academicBackground: defaultAmb.academicBackground,
          roleAsAmbassador: defaultAmb.roleAsAmbassador,
          photoUrl: currentPhoto 
        };
      });
    } catch (e) {
      console.error("Error loading embaixadores_list in App state", e);
    }
    return OFFICIAL_AMBASSADORS;
  });
  const CITIES_LIST = ["Juiz de Fora", "Matias Barbosa"];

  const [appCropperSource, setAppCropperSource] = useState<string>("");
  const [appCropperOpen, setAppCropperOpen] = useState<boolean>(false);
  const [cropperTargetMode, setCropperTargetMode] = useState<"profile" | "extra">("profile");

  // Offline Mode listener
  const [isOfflineActive, setIsOfflineActive] = useState<boolean>(() => isOfflineModeActive());

  useEffect(() => {
    const checkOffline = () => {
      setIsOfflineActive(isOfflineModeActive());
    };
    window.addEventListener("online", checkOffline);
    window.addEventListener("offline", checkOffline);
    window.addEventListener("portal_offline_changed", checkOffline);
    return () => {
      window.removeEventListener("online", checkOffline);
      window.removeEventListener("offline", checkOffline);
      window.removeEventListener("portal_offline_changed", checkOffline);
    };
  }, []);

  // Configuration of all pages content
  const [portalPagesConfig, setPortalPagesConfig] = useState(() => {
    const saved = localStorage.getItem("portal_pages_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          return {
            quemSomosP1: parsed.quemSomosP1 || "Meu nome é Regina Simões, mãe, empresária, gateira e apaixonada pela transformação de vidas através do conhecimento, empreendedorismo e desenvolvimento humano. Sou graduada em Marketing Digital, tradutora em Libras em formação, cristã e tenho na dança e no yoga uma missão de vida voltada ao equilíbrio, expressão e conexão com pessoas.",
            quemSomosP2: parsed.quemSomosP2 || "Sou host do podcast “Do Começo ao Topo”, um espaço criado para compartilhar histórias inspiradoras, trajetórias de superação, empreendedorismo e crescimento pessoal e profissional.",
            quemSomosP3: parsed.quemSomosP3 || "Também lidero a Comunidade Aceleradora de Negócios Do Começo ao Topo, uma rede de conexão voltada para empresários, empresárias, produtores rurais e estrangeiros, com foco em conhecimento, networking estratégico e rodadas de negócios. A comunidade nasceu com o propósito de gerar oportunidades, fortalecer marcas e impulsionar negócios através da troca de experiências e conexões reais.",
            quemSomosP4: parsed.quemSomosP4 || "Como palestrante, desenvolvo conteúdos direcionados para empresas e empresários que desejam aprimorar seu posicionamento, fortalecer sua imagem no mercado e desenvolver liderança e vendas de forma estratégica. Minhas palestras unem comunicação, positioning, desenvolvimento humano e visão empreendedora, sempre com foco em resultados e transformação.",
            quemSomosQuote: parsed.quemSomosQuote || "Acredito que quando conhecimento, propósito e conexão caminham juntos, vidas e negócios são acelerados para um novo nível.",
            
            objetivosPortal: parsed.objetivosPortal || "O Portal de Negócios e Notícias “Do Começo ao Topo” tem como objetivo conectar pessoas, empresas e oportunidades através da informação, visibilidade e relacionamento estratégico. O portal foi criado para fortalecer empresários, empresárias, produtores rurais e empreendedores, promovendo conteúdos relevantes sobre empreendedorismo, desenvolvimento humano, posicionamento, inovação, networking e crescimento profissional.",
            objetivosPodcast: parsed.objetivosPodcast || "O podcast “Do Começo ao Topo” tem como missão inspirar, motivar e transformar vidas através de histórias reais de superação, empreendedorismo, liderança e desenvolvimento pessoal e profissional.",
            objetivosComunidade: parsed.objetivosComunidade || "A Comunidade Aceleradora de Negócios “Do Começo ao Topo” tem como objetivo unir empresários, empresárias, produtores rurais e estrangeiros em um ambiente de crescimento, networking e desenvolvimento estratégico.",
            objetivosCursos: parsed.objetivosCursos || "Os cursos online “Do Começo ao Topo” têm como missão democratizar o conhecimento e levar desenvolvimento pessoal, profissional e empresarial para pessoas que desejam evoluir, empreender, vender mais, melhorar seu posicionamento e fortalecer sua liderança.",
            
            enderecoEdificio: parsed.enderecoEdificio || "Edifício Comercial",
            enderecoRua: parsed.enderecoRua || "Rua Ataliba de Barros, 182 – Sala 1107",
            enderecoBairro: parsed.enderecoBairro || "Bairro Estrela Sul - CEP 36025-275",
            enderecoComplemento: parsed.enderecoComplemento || "(Ao lado do estacionamento do Independência Shopping)",
            enderecoMapEmbed: parsed.enderecoMapEmbed || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3705.5144342416297!2d-43.3592161!3d-21.7828038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x989b0ada1609ff%3A0x6e8a4a034220021c!2sR.%20Ataliba%20de%20Barros%2C%20182%20-%20Estrela%20Sul%2C%20Juiz%20de%20Fora%20-%20MG%2C%2036025-275!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
            enderecoMapViewer: parsed.enderecoMapViewer || "https://maps.google.com/?q=Rua+Ataliba+de+Barros,+182+Juiz+de+Fora",
            
            contatoEmail: parsed.contatoEmail || "podcastdocomecoaotopojf@gmail.com",
            contatoWhatsapp: (!parsed.contatoWhatsapp || parsed.contatoWhatsapp.includes("98412") || parsed.contatoWhatsapp.includes("9999")) ? "+55 32 99194-7690" : parsed.contatoWhatsapp,
            contatoInstagram: parsed.contatoInstagram || "https://instagram.com/podcastdocomecoaotopo",
            
            parceirosList: parsed.parceirosList || [
              { name: "Startup Hub JF", description: "Inovação tecnológica regional" },
              { name: "Cervejaria Artesanal Neon", description: "Tratamento de chopp artesanal" },
              { name: "Centro Acadêmico de IA", description: "Pesquisa avançada em cognição" },
              { name: "Mídia Regional Sul", description: "Redação integrada de pautas" },
              { name: "Editora Som e Vida", description: "Gravadora de podcast e estúdios" }
            ],

            comunidadeTitle: parsed.comunidadeTitle || "Bem-vindo ao Hub de Negócios",
            comunidadeDescription: parsed.comunidadeDescription || "Aqui você se conecta com outros pioneiros da tecnologia, marketing e design industrial do interior do sudeste. Navegue abaixo pelos perfis de todos os membros credenciados, aplique filtros de busca e confira as campanhas publicitárias exclusivas da nossa rede de patrocinadores locais!",
            
            eventosTitle: parsed.eventosTitle || "Próximos Eventos & Shows Relevantes",
            eventosDescription: parsed.eventosDescription || "Acompanhe e participe dos principais rituais, feiras de inovação e encontros de networking regional organizados pelo Hub Do Começo ao Topo.",
            
            galeriaTitle: parsed.galeriaTitle || "🎞️ Galeria de Fotos e Cobertura",
            galeriaDescription: parsed.galeriaDescription || "Reviva os melhores momentos de nossos encontros de negócios, palestras e episódios de gravação diretamente do interior do sudeste.",
            
            embaixadoresTitle: parsed.embaixadoresTitle || "Conselho Regional de Liderança",
            embaixadoresDescription: parsed.embaixadoresDescription || "Você está na área VIP restrita de embaixadores oficiais. Controle missões regionais táticas com pontuação corporativa integrada, publique relatórios locais do interior de Minas de forma imediata e coordene a expansão e o impacto comercial da marca Do Começo ao Topo.",
            
            vagasTitle: parsed.vagasTitle || "Mural de Oportunidades & Conexões Profissionais",
            vagasDescription: parsed.vagasDescription || "Encontre as vagas abertas em startups parceiras e empresas aceleradas do ecossistema Do Começo ao Topo.",
            
            cursosTitle: parsed.cursosTitle || "Cursos On-line & Programas Avançados",
            cursosDescription: parsed.cursosDescription || "Aprenda sobre posicionamento de marca, vendas estratégicas, oratória, inteligência artificial e produtividade.",
            
            podcastTitle: parsed.podcastTitle || "Do Começo ao Topo Podcast",
            podcastDescription: parsed.podcastDescription || "Inspirando e acelerando pessoas através de histórias de superação e trajetórias reais do empreendedorismo.",
            
            anunciePara1: parsed.anunciePara1 || "Seja parceiro do portal de conteúdo regional que mais cresce na Zona da Mata! O Do Começo ao Topo conecta sua marca com milhares de leitores locais e empreendedores de alto nível.",
            anuncieSec1Title: parsed.anuncieSec1Title || "💡 Apoiador",
            anuncieSec1Text: parsed.anuncieSec1Text || "R$ 97,00. Insira sua marca na abertura, blocos e encerramento de nossos episódios de áudio e vídeo.",
            anuncieSec2Title: parsed.anuncieSec2Title || "⚡ Anunciante",
            anuncieSec2Text: parsed.anuncieSec2Text || "R$ 397,00. Espaço de destaque 100% responsivo visualizado por milhares de usuários locais e investidores.",
            anuncieSec3Title: parsed.anuncieSec3Title || "👥 Embaixadores Municipais",
            anuncieSec3Text: parsed.anuncieSec3Text || "Ativação local qualificada com microinfluenciadores selecionados em múltiplos municípios da nossa Zona da Mata.",
            anuncieEmail: parsed.anuncieEmail || "anuncie@docomecoaotopo.com.br",
            
            contatoTitle: parsed.contatoTitle || "Fale com a Redação",
            contatoDescription: parsed.contatoDescription || "Tem uma pauta para sugerir, uma pauta para corrigir ou deseja saber mais sobre as rodadas de negócios? Deixe sua mensagem!",

            rodadaTitle: parsed.rodadaTitle || "RODADA DE NEGÓCIOS",
            rodadaTargetDate: parsed.rodadaTargetDate || "2026-06-17T18:30:00-03:00",
            rodadaLocation: parsed.rodadaLocation || "17 de Junho • 18:30 • Delícias da Andréa"
          };
        }
      } catch (e) {
        console.error("Error parsing portalPagesConfig", e);
      }
    }
    return {
      quemSomosP1: "Meu nome é Regina Simões, mãe, empresária, gateira e apaixonada pela transformação de vidas através do conhecimento, empreendedorismo e desenvolvimento humano. Sou graduada em Marketing Digital, tradutora em Libras em formação, cristã e tenho na dança e no yoga uma missão de vida voltada ao equilíbrio, expressão e conexão com pessoas.",
      quemSomosP2: "Sou host do podcast “Do Começo ao Topo”, um espaço criado para compartilhar histórias inspiradoras, trajetórias de superação, empreendedorismo e crescimento pessoal e profissional.",
      quemSomosP3: "Também lidero a Comunidade Aceleradora de Negócios Do Começo ao Topo, uma rede de conexão voltada para empresários, empresárias, produtores rurais e estrangeiros, com foco em conhecimento, networking estratégico e rodadas de negócios. A comunidade nasceu com o propósito de gerar oportunidades, fortalecer marcas e impulsionar negócios através da troca de experiências e conexões reais.",
      quemSomosP4: "Como palestrante, desenvolvo conteúdos direcionados para empresas e empresários que desejam aprimorar seu posicionamento, fortalecer sua imagem no mercado e desenvolver liderança e vendas de forma estratégica. Minhas palestras unem comunicação, positioning, desenvolvimento humano e visão empreendedora, sempre com foco em resultados e transformação.",
      quemSomosQuote: "Acredito que quando conhecimento, propósito e conexão caminham juntos, vidas e negócios são acelerados para um novo nível.",
      
      objetivosPortal: "O Portal de Negócios e Notícias “Do Começo ao Topo” tem como objetivo conectar pessoas, empresas e oportunidades através da informação, visibilidade e relacionamento estratégico. O portal foi criado para fortalecer empresários, empresárias, produtores rurais e empreendedores, promovendo conteúdos relevantes sobre empreendedorismo, desenvolvimento humano, posicionamento, inovação, networking e crescimento profissional.",
      objetivosPodcast: "O podcast “Do Começo ao Topo” tem como missão inspirar, motivar e transformar vidas através de histórias reais de superação, empreendedorismo, liderança e desenvolvimento pessoal e profissional.",
      objetivosComunidade: "A Comunidade Aceleradora de Negócios “Do Começo ao Topo” tem como objetivo unir empresários, empresárias, produtores rurais e estrangeiros em um ambiente de crescimento, networking e desenvolvimento estratégico.",
      objetivosCursos: "Os cursos online “Do Começo ao Topo” têm como missão democratizar o conhecimento e levar desenvolvimento pessoal, profissional e empresarial para pessoas que desejam evoluir, empreender, vender mais, melhorar seu posicionamento e fortalecer sua liderança.",
      
      enderecoEdificio: "Edifício Comercial",
      enderecoRua: "Rua Ataliba de Barros, 182 – Sala 1107",
      enderecoBairro: "Bairro Estrela Sul - CEP 36025-275",
      enderecoComplemento: "(Ao lado do estacionamento do Independência Shopping)",
      enderecoMapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3705.5144342416297!2d-43.3592161!3d-21.7828038!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x989b0ada1609ff%3A0x6e8a4a034220021c!2sR.%20Ataliba%20de%20Barros%2C%20182%20-%20Estrela%20Sul%2C%20Juiz%20de%20Fora%20-%20MG%2C%2036025-275!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr",
      enderecoMapViewer: "https://maps.google.com/?q=Rua+Ataliba+de+Barros,+182+Juiz+de+Fora",
      
      contatoEmail: "podcastdocomecoaotopojf@gmail.com",
      contatoWhatsapp: "+55 32 99194-7690",
      contatoInstagram: "https://instagram.com/podcastdocomecoaotopo",
      
      parceirosList: [
        { name: "Startup Hub JF", description: "Inovação tecnológica regional" },
        { name: "Cervejaria Artesanal Neon", description: "Tratamento de chopp artesanal" },
        { name: "Centro Acadêmico de IA", description: "Pesquisa avançada em cognição" },
        { name: "Mídia Regional Sul", description: "Redação integrada de pautas" },
        { name: "Editora Som e Vida", description: "Gravadora de podcast e estúdios" }
      ],

      comunidadeTitle: "Bem-vindo ao Hub de Negócios",
      comunidadeDescription: "Aqui você se conecta com outros pioneiros da tecnologia, marketing e design industrial do interior do sudeste. Navegue abaixo pelos perfis de todos os membros credenciados, aplique filtros de busca e confira as campanhas publicitárias exclusivas da nossa rede de patrocinadores locais!",
      
      eventosTitle: "Próximos Eventos & Shows Relevantes",
      eventosDescription: "Acompanhe e participe dos principais rituais, feiras de inovação e encontros de networking regional organizados pelo Hub Do Começo ao Topo.",
      
      galeriaTitle: "🎞️ Galeria de Fotos e Cobertura",
      galeriaDescription: "Reviva os melhores momentos de nossos encontros de negócios, palestras e episódios de gravação diretamente do interior do sudeste.",
      
      embaixadoresTitle: "Conselho Regional de Liderança",
      embaixadoresDescription: "Você está na área VIP restrita de embaixadores oficiais. Controle missões regionais táticas com pontuação corporativa integrada, publique relatórios locais do interior de Minas de forma imediata e coordene a expansão e o impacto comercial da marca Do Começo ao Topo.",
      
      vagasTitle: "Mural de Oportunidades & Conexões Profissionais",
      vagasDescription: "Encontre as vagas abertas em startups parceiras e empresas aceleradas do ecossistema Do Começo ao Topo.",
      
      cursosTitle: "Cursos On-line & Programas Avançados",
      cursosDescription: "Aprenda sobre posicionamento de marca, vendas estratégicas, oratória, inteligência artificial e produtividade.",
      
      podcastTitle: "Do Começo ao Topo Podcast",
      podcastDescription: "Inspirando e acelerando pessoas através de histórias de superação e trajetórias reais do empreendedorismo.",
      
      anunciePara1: "Seja parceiro do portal de conteúdo regional que mais cresce na Zona da Mata! O Do Começo ao Topo conecta sua marca com milhares de leitores locais e empreendedores de alto nível.",
      anuncieSec1Title: "💡 Apoiador",
      anuncieSec1Text: "R$ 97,00. Insira sua marca na abertura, blocos e encerramento de nossos episódios de áudio e vídeo.",
      anuncieSec2Title: "⚡ Anunciante",
      anuncieSec2Text: "R$ 397,00. Espaço de destaque 100% responsivo visualizado por milhares de usuários locais e investidores.",
      anuncieSec3Title: "👥 Embaixadores Municipais",
      anuncieSec3Text: "Ativação local qualificada com microinfluenciadores selecionados em múltiplos municípios da nossa Zona da Mata.",
      anuncieEmail: "anuncie@docomecoaotopo.com.br",
      
      contatoTitle: "Fale com a Redação",
      contatoDescription: "Tem uma pauta para sugerir, uma pauta para corrigir ou deseja saber mais sobre as rodadas de negócios? Deixe sua mensagem!",

      rodadaTitle: "RODADA DE NEGÓCIOS",
      rodadaTargetDate: "2026-06-17T18:30:00-03:00",
      rodadaLocation: "17 de Junho • 18:30 • Delícias da Andréa",
      
      cursosList: []
    };
  });

  const handleSavePortalPagesConfig = (updated: any) => {
    setPortalPagesConfig(updated);
    localStorage.setItem("portal_pages_config", JSON.stringify(updated));
    setCmsSaveStatus("saving");
    const timer = setTimeout(() => {
      setCmsSaveStatus("saved");
      const subTimer = setTimeout(() => setCmsSaveStatus("idle"), 1500);
      return () => clearTimeout(subTimer);
    }, 600);
    return () => clearTimeout(timer);
  };

  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      // Gather all PositionableImage locations, offsets, and uploaded files from localStorage
      const positionableImages: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        if (
          key.startsWith("img-pos-") ||
          key.startsWith("community-member-") ||
          key.startsWith("community-camp-") ||
          key.startsWith("ambassador-pic-") ||
          key.startsWith("quem-somos-profile-") ||
          key.endsWith("_uploaded_src")
        ) {
          const val = localStorage.getItem(key);
          if (val !== null) {
            if (key.endsWith("_uploaded_src")) {
              positionableImages[key] = val;
            } else {
              try {
                const parsed = JSON.parse(val);
                if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
                  positionableImages[key] = parsed;
                }
              } catch (e) {
                // Ignore invalid JSON
              }
            }
          }
        }
      }

      // Collect all photos from all local galleries
      const allPhotosList: any[] = [];
      const seenPhotoIds = new Set<string>();
      const addPhotoSafe = (p: any) => {
        if (!p || !p.url) return;
        const id = String(p.id || `photo-${Date.now()}-${Math.random()}`);
        if (!seenPhotoIds.has(id)) {
          seenPhotoIds.add(id);
          allPhotosList.push({ ...p, id });
        }
      };

      try {
        const gPhotos = localStorage.getItem("global_photo_gallery");
        if (gPhotos) JSON.parse(gPhotos).forEach(addPhotoSafe);
        const ePhotos = localStorage.getItem("embaixadores_photos_db");
        if (ePhotos) JSON.parse(ePhotos).forEach(addPhotoSafe);
        const cPhotos = localStorage.getItem("comunidade_photos_db");
        if (cPhotos) JSON.parse(cPhotos).forEach(addPhotoSafe);
      } catch (e) {
        console.warn("Could not parse local photo galleries", e);
      }

      const embaixadores_list = quemSomosAmbassadors.map((a, idx) => {
        const key = `ambassador-pic-${idx}-${a.name}_uploaded_src`;
        const uploadedSrc = localStorage.getItem(key);
        return {
          ...a,
          photoUrl: uploadedSrc || a.photoUrl || OFFICIAL_AMBASSADORS[idx]?.photoUrl
        };
      });

      const podcastsJson = localStorage.getItem("docomeco_podcasts_v2");
      const podcasts = podcastsJson ? JSON.parse(podcastsJson) : undefined;

      const testimonialsJson = localStorage.getItem("docomeco_testimonials");
      const testimonials = testimonialsJson ? JSON.parse(testimonialsJson) : undefined;

      const quemSomosGalleryJson = localStorage.getItem("quem_somos_gallery");
      const qGallery = quemSomosGalleryJson ? JSON.parse(quemSomosGalleryJson) : quemSomosGallery;

      const response = await fetch("/api/publish-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portalPagesConfig,
          logoConfig,
          gradientStyle,
          footerCredits,
          quem_somos_profile_pic: quemSomosProfilePic,
          quem_somos_gallery: qGallery,
          photos: allPhotosList,
          positionableImages,
          embaixadores_list,
          podcasts,
          articles,
          testimonials,
          homepage_sections_order: homepageSectionsOrder
        })
      });
      const data = await response.json();
      if (data.status === "success") {
        setIsPublishing(false);
        setCmsSaveStatus("saved");

        // Write the cleaned-up server-side paths back to localStorage to clear bloated base64 strings
        if (data.db && data.db.positionableImages) {
          Object.entries(data.db.positionableImages).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              if (typeof val === "object") {
                localStorage.setItem(key, JSON.stringify(val));
              } else if (typeof val === "string") {
                localStorage.setItem(key, val);
              }
            }
          });
        }

        // Sync main profile pic from quem-somos if returned by server (meaning base64 was converted to folder path)
        if (data.db && data.db.quem_somos_profile_pic) {
          setQuemSomosProfilePic(data.db.quem_somos_profile_pic);
          localStorage.setItem("quem_somos_profile_pic", data.db.quem_somos_profile_pic);
        }

        // Sync embaixadores list and update individual key copies
        if (data.db && Array.isArray(data.db.embaixadores_list)) {
          setQuemSomosAmbassadors(data.db.embaixadores_list);
          localStorage.setItem("embaixadores_list", JSON.stringify(data.db.embaixadores_list));
          data.db.embaixadores_list.forEach((amb: any, idx: number) => {
            if (amb.photoUrl) {
              localStorage.setItem(`ambassador-pic-${idx}-${amb.name}_uploaded_src`, amb.photoUrl);
            }
          });
        }

        // Notify all PositionableImages and Galleries to update their active state
        window.dispatchEvent(new Event("image_updated"));
        window.dispatchEvent(new Event("photos_updated"));
        window.dispatchEvent(new Event("testimonials_updated"));

        toast.success("🚀 SUCESSO! Todas as alterações do site (galeria de fotos, conselho de embaixadores, textos, imagens e rodapé) foram sincronizadas na nuvem e estão visíveis para todos no domínio oficial www.docomecoaotopo.com.br!");
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (e: any) {
      setIsPublishing(false);
      toast.error("❌ Falha ao publicar as atualizações no servidor: " + e.message);
    }
  };

  const syncClientToCloud = async (notifyUser: boolean = true) => {
    try {
      const positionableImages: Record<string, any> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (
          key.startsWith("img-pos-") ||
          key.startsWith("community-member-") ||
          key.startsWith("community-camp-") ||
          key.startsWith("ambassador-pic-") ||
          key.startsWith("quem-somos-profile-") ||
          key.endsWith("_uploaded_src")
        ) {
          const val = localStorage.getItem(key);
          if (val !== null) {
            if (key.endsWith("_uploaded_src")) {
              positionableImages[key] = val;
            } else {
              try {
                const parsed = JSON.parse(val);
                if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
                  positionableImages[key] = parsed;
                }
              } catch (e) {
                // Ignore invalid JSON
              }
            }
          }
        }
      }

      const allPhotosList: any[] = [];
      const seenPhotoIds = new Set<string>();
      const addPhotoSafe = (p: any) => {
        if (!p || !p.url) return;
        const id = String(p.id || `photo-${Date.now()}-${Math.random()}`);
        if (!seenPhotoIds.has(id)) {
          seenPhotoIds.add(id);
          allPhotosList.push({ ...p, id });
        }
      };

      try {
        const gPhotos = localStorage.getItem("global_photo_gallery");
        if (gPhotos) JSON.parse(gPhotos).forEach(addPhotoSafe);
        const ePhotos = localStorage.getItem("embaixadores_photos_db");
        if (ePhotos) JSON.parse(ePhotos).forEach(addPhotoSafe);
        const cPhotos = localStorage.getItem("comunidade_photos_db");
        if (cPhotos) JSON.parse(cPhotos).forEach(addPhotoSafe);
      } catch (e) {
        console.warn("Could not parse local photo galleries", e);
      }

      const embaixadores_list = quemSomosAmbassadors.map((a, idx) => {
        const key = `ambassador-pic-${idx}-${a.name}_uploaded_src`;
        const uploadedSrc = localStorage.getItem(key);
        return {
          ...a,
          photoUrl: uploadedSrc || a.photoUrl || OFFICIAL_AMBASSADORS[idx]?.photoUrl
        };
      });

      const payload = {
        portalPagesConfig,
        logoConfig,
        gradientStyle,
        footerCredits,
        quem_somos_profile_pic: quemSomosProfilePic,
        quem_somos_gallery: quemSomosGallery,
        photos: allPhotosList,
        positionableImages,
        embaixadores_list,
        articles,
        homepage_sections_order: homepageSectionsOrder
      };

      const res = await fetch("/api/sync-all-from-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && notifyUser) {
        playSuccessSound();
        toast.success("⚡ Sincronização Concluída! Todas as fotos, embaixadores e conteúdos foram salvos na nuvem e já estão ativos em www.docomecoaotopo.com.br");
      }
    } catch (err: any) {
      if (notifyUser) {
        toast.error("Erro ao sincronizar: " + err.message);
      }
    }
  };

  // Interactive Newsletter subscribers cache
  const [subscribers, setSubscribers] = useState<{ email: string; categories: CategoryType[] }[]>([]);

  // Simulation of custom contact form submissions
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Handlers
  const handleAddArticle = (newArt: NewsArticle) => {
    // Optimistically update local state immediately
    setArticles((prev) => {
      const next = [newArt, ...prev.filter((art) => art.id !== newArt.id)];
      localStorage.setItem("docomeco_articles", JSON.stringify(next));
      return next;
    });

    // Publish server-side
    fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item: newArt })
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((publishedArt) => {
        if (publishedArt && publishedArt.id) {
          setArticles((prev) => {
            const next = [publishedArt, ...prev.filter((art) => art.id !== newArt.id && art.id !== publishedArt.id)];
            localStorage.setItem("docomeco_articles", JSON.stringify(next));
            return next;
          });
        }
      })
      .catch((err) => {
        console.error("Error publishing article server-side:", err);
      });
  };

  const handleDeleteArticle = (id: string | null) => {
    if (id) {
      fetch(`/api/articles/${id}`, { method: "DELETE" })
        .catch((err) => console.error("Error deleting article on server:", err));
    }
    setArticles((prev) => {
      const next = prev.filter((art) => art.id !== id);
      localStorage.setItem("docomeco_articles", JSON.stringify(next));
      return next;
    });
  };

  const handleCreateNewArticle = () => {
    const newId = `art-new-${Date.now()}`;
    const newArticle: NewsArticle = {
      id: newId,
      title: `Nova Publicação em ${selectedCategory || "Notícias"}`,
      excerpt: "Clique no ícone de design para entrar no Modo Estúdio e editar este conteúdo.",
      content: "Insira o conteúdo completo aqui. Você pode adicionar quebras de linha e personalizações avançadas entrando no painel de edição CMS.",
      category: selectedCategory || "NOTÍCIAS",
      author: user?.name || "Redação Cms",
      date: new Date().toISOString(),
      readTime: "3 min",
      imageUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800",
      views: 0,
      shares: 0,
      likes: 0,
      isPremium: false,
      location: selectedCity || "Regional",
      tags: ["Novidade"]
    };
    handleAddArticle(newArticle);
    setDirectEditingMode(true);
  };

  const handleSelectCategory = (cat: CategoryType | null) => {
    playClickSound(600, "sine");
    setSelectedCategory(cat);

    if (cat === "TOUR") {
      setActiveSection("ONDE ESTAMOS");
    } else {
      setActiveSection(null);
    }

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 60);
  };

  const handleSelectArticle = (art: NewsArticle) => {
    // If the article has an external link, open it immediately
    if (art.linkUrl) {
      window.open(art.linkUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // Check premium locks
    if (art.isPremium) {
      if (!user.isAuthenticated) {
        setPendingArticle(art);
        setAuthModalTab("client");
        setAuthModalOpen(true);
        return;
      }
    }
    setSelectedArticle(art);
    // Increment views dynamically to fuel analytics charts instantly
    setArticles((prev) =>
      prev.map((a) => (a.id === art.id ? { ...a, views: a.views + 1 } : a))
    );
  };

  const handleLoginSuccess = (authenticatedUser: AppUser, targetCategory?: string | null) => {
    setUser(authenticatedUser);
    
    if (authenticatedUser.isAdmin || authenticatedUser.status === "approved" || authenticatedUser.status === "trial") {
      if (authenticatedUser.isAdmin) {
        setActiveTab("editor");
      }
      setSelectedCategory(null);
      setSelectedArticle(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setShowPendingModal(true);
      const finalCat = targetCategory || pendingCategory;
      if (finalCat) {
        setSelectedCategory(finalCat as any);
        setPendingCategory(null);
      } else if (pendingArticle) {
        setSelectedArticle(pendingArticle);
        setPendingArticle(null);
      }
    }
  };

  // Auto-login for AI Studio Dev Environment (Workspace Mode)
  React.useEffect(() => {
    if (window.location.hostname.includes("ais-dev-") || window.location.search.includes("mode=admin")) {
      setUser({
        email: "diretoria@portal.com",
        name: "Diretoria (AI Studio)",
        photoUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=diretoria",
        isAuthenticated: true,
        isAdmin: true,
        status: "approved"
      });
      setActiveTab("editor");
    } else if (window.location.search.includes("mode=editor")) {
      setActiveTab("editor");
    }
  }, []);

  // Sync session with Firebase Auth and backend user status
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await fetch("/api/users/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "Usuário do Google",
              photoUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(firebaseUser.email || 'user')}`,
              uid: firebaseUser.uid
            })
          });
          if (res.ok) {
            const data = await res.json();
            const record = data.user || {};
            const isAdmin = !!data.isAdmin;
            setUser({
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || record.name || "Usuário do Google",
              photoUrl: firebaseUser.photoURL || record.photoUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(firebaseUser.email || 'user')}`,
              isAuthenticated: true,
              isAdmin: isAdmin,
              status: record.status || (isAdmin ? "approved" : "suspended"),
              trialEndsAt: record.trialEndsAt,
              uid: firebaseUser.uid
            });
            if (!isAdmin && (record.status === "suspended" || !record.status)) {
              setShowPendingModal(true);
            }
          }
        } catch (e) {
          console.warn("Could not sync auth state:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const handleSyncProfile = () => {
      const saved = localStorage.getItem("quem-somos-profile-regina_uploaded_src") || localStorage.getItem("quem_somos_profile_pic") || "/regina-profile.jpg";
      if (saved) {
        setQuemSomosProfilePic(saved);
      }
    };
    const handleSyncAmbassadors = () => {
      const saved = localStorage.getItem("embaixadores_list");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((a: any, idx: number) => {
              const defaultAmb = OFFICIAL_AMBASSADORS[idx];
              if (!defaultAmb) return a;
              const localPhotoKey = `ambassador-pic-${idx}-${defaultAmb.name}_uploaded_src`;
              const localPhoto = localStorage.getItem(localPhotoKey);
              
              let currentPhoto = localPhoto;
              if (!currentPhoto || currentPhoto.trim() === "" || currentPhoto === "undefined" || currentPhoto === "null") {
                currentPhoto = a.photoUrl;
              }
              if (!currentPhoto || currentPhoto.trim() === "" || currentPhoto === "undefined" || currentPhoto === "null") {
                currentPhoto = defaultAmb?.photoUrl;
              }
              if (currentPhoto && currentPhoto.startsWith("data:image/")) {
                currentPhoto = defaultAmb?.photoUrl;
              }
              if (!currentPhoto || currentPhoto.trim() === "" || currentPhoto === "undefined" || currentPhoto === "null") {
                currentPhoto = defaultAmb?.photoUrl || "";
              }

              return { 
                ...a, 
                name: defaultAmb.name,
                fullName: defaultAmb.fullName,
                specialty: defaultAmb.specialty, 
                city: defaultAmb.city, // Override to enforce hardcoded city corrections
                instagram: (a.instagram && !['@anderson', '@andreia', '@bianca', '@danielle', '@fatima', '@flavia', '@jaqueline', '@silvania', '@isabela'].includes(a.instagram)) ? a.instagram : defaultAmb.instagram,
                functionAsAmbassador: defaultAmb.functionAsAmbassador,
                academicBackground: defaultAmb.academicBackground,
                roleAsAmbassador: defaultAmb.roleAsAmbassador,
                photoUrl: currentPhoto 
              };
            });
            setQuemSomosAmbassadors(cleaned);
          }
        } catch (e) {
          console.error("Error syncing handleSyncAmbassadors", e);
        }
      }
    };
    window.addEventListener("image_updated", handleSyncProfile);
    window.addEventListener("image_updated", handleSyncAmbassadors);
    return () => {
      window.removeEventListener("image_updated", handleSyncProfile);
      window.removeEventListener("image_updated", handleSyncAmbassadors);
    };
  }, []);

  React.useEffect(() => {
    setSoundEnabled(isSoundActive);
  }, [isSoundActive]);

  React.useEffect(() => {
    // Sanitize any broken landing page links in localStorage on startup
    const keysToSanitize = [
      "quem_somos_profile_pic",
      "quem-somos-profile-regina_uploaded_src"
    ];
    keysToSanitize.forEach(key => {
      const val = localStorage.getItem(key);
      if (val && val.includes("ibb.co/wFLq0zJQ")) {
        localStorage.setItem(key, "/regina-profile.jpg");
      }
    });

    // Higienização no armazenamento local para remover perfis de demonstração remanescentes
    const demoKeysToRemove = [
      "embaixadores_auth_success",
      "embaixadores_auth_email",
      "embaixadores_auth_nome",
      "docomeco_user_demo_session",
      "mock_admin_1click"
    ];
    demoKeysToRemove.forEach(k => {
      if (localStorage.getItem(k)) {
        localStorage.removeItem(k);
      }
    });
    const storedSession = localStorage.getItem("docomeco_user_session");
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.email === "membro@portal.com" || parsed.uid?.startsWith("offline_")) {
          if (!parsed.isAdmin && parsed.status !== "approved") {
            localStorage.removeItem("docomeco_user_session");
          }
        }
      } catch (e) {
        localStorage.removeItem("docomeco_user_session");
      }
    }

    // Fetch published data from custom Express backend on mount
    fetch("/api/published-data")
      .then((res) => {
        const contentType = res.headers.get("content-type");
        if (res.ok && contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          // Sync profile pic if set
          let serverProfilePic = data.quem_somos_profile_pic || (data.positionableImages && data.positionableImages["quem-somos-profile-regina_uploaded_src"]) || "/regina-profile.jpg";
          if (serverProfilePic.includes("ibb.co/wFLq0zJQ")) {
            serverProfilePic = "/regina-profile.jpg";
          }
          if (serverProfilePic) {
            setQuemSomosProfilePic(serverProfilePic);
            localStorage.setItem("quem_somos_profile_pic", serverProfilePic);
          }
          // Sync Quem Somos gallery
          if (Array.isArray(data.quem_somos_gallery) && data.quem_somos_gallery.length > 0) {
            setQuemSomosGallery(data.quem_somos_gallery);
            localStorage.setItem("quem_somos_gallery", JSON.stringify(data.quem_somos_gallery));
          }
          // Sync Embaixadores list
          let serverList = data.embaixadores_list;
          if (!Array.isArray(serverList) || serverList.length === 0) {
            serverList = OFFICIAL_AMBASSADORS;
          }
          const cleanedList = serverList.map((a: any, idx: number) => {
            const defaultAmb = OFFICIAL_AMBASSADORS[idx];
            if (!defaultAmb) return a;
            const localPhotoKey = `ambassador-pic-${idx}-${defaultAmb.name}_uploaded_src`;
            
            // Force reset old cached images for Jaqueline de Carvalho Dias
            if (defaultAmb.name === "Jaqueline de Carvalho Dias") {
              localStorage.removeItem(localPhotoKey);
              localStorage.removeItem(`ambassador-pic-${idx}-Jaqueline Dias_uploaded_src`);
            }

            const localPhoto = localStorage.getItem(localPhotoKey);
            
            const serverPhotoKey = `ambassador-pic-${idx}-${defaultAmb.name}_uploaded_src`;
            const serverPhoto = data.positionableImages && data.positionableImages[serverPhotoKey];
            
            let currentPhoto = localPhoto;
            if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
              currentPhoto = serverPhoto;
            }
            if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
              currentPhoto = a.photoUrl;
            }
            if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
              currentPhoto = defaultAmb?.photoUrl;
            }
            if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
              currentPhoto = defaultAmb?.photoUrl || "";
            }
            return { 
              ...a, 
              name: defaultAmb.name,
              fullName: defaultAmb.fullName,
              specialty: defaultAmb.specialty, 
              city: defaultAmb.city, // Override to enforce hardcoded city corrections
              instagram: (a.instagram && !['@anderson', '@andreia', '@bianca', '@danielle', '@fatima', '@flavia', '@jaqueline', '@silvania', '@isabela'].includes(a.instagram)) ? a.instagram : defaultAmb.instagram,
              functionAsAmbassador: defaultAmb.functionAsAmbassador,
              academicBackground: defaultAmb.academicBackground,
              roleAsAmbassador: defaultAmb.roleAsAmbassador,
              photoUrl: currentPhoto 
            };
          });
          setQuemSomosAmbassadors(cleanedList);
          localStorage.setItem("embaixadores_list", JSON.stringify(cleanedList));
          // Sync portalPagesConfig
          if (data.portalPagesConfig) {
            setPortalPagesConfig(data.portalPagesConfig);
            localStorage.setItem("portal_pages_config", JSON.stringify(data.portalPagesConfig));
          }
          // Sync logoConfig
          if (data.logoConfig) {
            setLogoConfig(data.logoConfig);
            localStorage.setItem("logo_config", JSON.stringify(data.logoConfig));
          }
          // Sync gradientStyle
          if (data.gradientStyle) {
            setGradientStyle(data.gradientStyle);
            localStorage.setItem("gradient_style", data.gradientStyle);
          }
          // Sync footerCredits
          if (data.footerCredits) {
            setFooterCredits(data.footerCredits);
            localStorage.setItem("footer_credits", data.footerCredits);
          }
          // Sync homepage sections order
          if (data.homepage_sections_order && Array.isArray(data.homepage_sections_order) && data.homepage_sections_order.length > 0) {
            let list = [...data.homepage_sections_order];
            if (!list.includes("advertising")) {
              const memIndex = list.indexOf("membership");
              if (memIndex !== -1) {
                list.splice(memIndex + 1, 0, "advertising");
              } else {
                list.push("advertising");
              }
            }
            setHomepageSectionsOrder(list);
            localStorage.setItem("homepage_sections_order", JSON.stringify(list));
          }
          // Sync articles
          if (data.articles && Array.isArray(data.articles)) {
            setArticles(data.articles);
            localStorage.setItem("docomeco_articles", JSON.stringify(data.articles));
          }
          // Sync podcasts
          if (data.podcasts && Array.isArray(data.podcasts)) {
            localStorage.setItem("docomeco_podcasts_v2", JSON.stringify(data.podcasts));
            window.dispatchEvent(new Event("podcasts_synced"));
          }
          // Sync positionableImages from server database
          if (data.positionableImages) {
            Object.entries(data.positionableImages).forEach(([key, val]) => {
              if (val !== undefined && val !== null) {
                if (typeof val === "object") {
                  localStorage.setItem(key, JSON.stringify(val));
                } else if (typeof val === "string") {
                  localStorage.setItem(key, val);
                }
              }
            });
            // Update all custom on-screen image elements
            window.dispatchEvent(new Event("image_updated"));
          }
          // Sync server photos (Galeria de fotos)
          if (Array.isArray(data.photos) && data.photos.length > 0) {
            localStorage.setItem("global_photo_gallery", JSON.stringify(data.photos));
            window.dispatchEvent(new Event("photos_updated"));
          }
          // Sync server testimonials
          if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
            localStorage.setItem("docomeco_testimonials", JSON.stringify(data.testimonials));
            window.dispatchEvent(new Event("testimonials_updated"));
          }
          // Sync server articles with general list
          if (Array.isArray(data.articles) && data.articles.length > 0) {
            setArticles((prev) => {
              const merged = [...data.articles];
              prev.forEach((local) => {
                if (!merged.some((art) => art.id === local.id)) {
                  merged.push(local);
                }
              });
              return merged;
            });
          }

          // Auto-heal / Auto-sync local preview data to cloud if this is a preview or authoring browser
          const isPreviewHost = window.location.hostname.includes("run.app") || window.location.hostname.includes("ai.studio") || window.location.hostname === "localhost";
          const hasLocalCustomData = localStorage.getItem("global_photo_gallery") || localStorage.getItem("embaixadores_photos_db");
          if (isPreviewHost && hasLocalCustomData) {
            setTimeout(() => {
              syncClientToCloud(false);
            }, 2500);
          }
        }
      })
      .catch(() => {
        // Silently fallback to cached local state if backend is initializing
      });

    const handleOpenAmbassadorAdd = () => {
      setEditingAmbassadorIdx(null);
      setAmbName("");
      setAmbSpecialty("");
      setAmbCity("Juiz de Fora");
      setAmbInstagram("");
      setAmbFullName("");
      setAmbPhotoUrl("");
      setAmbFunction("");
      setAmbAcademic("");
      setAmbRole("");
      setIsAmbassadorModalOpen(true);
      
      const element = document.getElementById("quem-somos-root") || document.getElementById("about-regina-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    };
    window.addEventListener("admin_open_ambassador_add", handleOpenAmbassadorAdd);
    return () => {
      window.removeEventListener("admin_open_ambassador_add", handleOpenAmbassadorAdd);
    };
  }, []);

  const handleOpenAmbassadorEdit = (amb: OfficialAmbassador, idx: number) => {
    setEditingAmbassadorIdx(idx);
    setAmbName(amb.name || "");
    setAmbSpecialty(amb.specialty || "");
    setAmbCity(amb.city || "Juiz de Fora");
    setAmbInstagram(amb.instagram || "");
    setAmbFullName(amb.fullName || amb.name || "");
    setAmbPhotoUrl(amb.photoUrl || "");
    setAmbFunction(amb.functionAsAmbassador || "");
    setAmbAcademic(amb.academicBackground || "");
    setAmbRole(amb.roleAsAmbassador || amb.specialty || "");
    setIsAmbassadorModalOpen(true);
  };

  const handleAmbassadorFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ambName || !ambSpecialty) {
      alert("Nome e Especialidade são obrigatórios");
      return;
    }
    
    const newAmb: OfficialAmbassador = {
      name: ambName,
      specialty: ambSpecialty,
      instagram: ambInstagram || "@",
      fullName: ambFullName || ambName,
      photoUrl: ambPhotoUrl,
      functionAsAmbassador: ambFunction,
      academicBackground: ambAcademic,
      roleAsAmbassador: ambRole || ambSpecialty,
      city: ambCity
    };

    let updatedList = [...quemSomosAmbassadors];
    if (editingAmbassadorIdx !== null) {
      updatedList[editingAmbassadorIdx] = newAmb;
    } else {
      updatedList.push(newAmb);
    }
    
    setQuemSomosAmbassadors(updatedList);
    localStorage.setItem("embaixadores_list", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("image_updated"));
    setIsAmbassadorModalOpen(false);
    playSuccessSound();
  };

  React.useEffect(() => {
    setIsMobileMenuOpen(false);
    const pageName = activeSection || selectedCategory || (selectedCity ? `City_${selectedCity}` : "Home");
    trackPageView(pageName, `Portal Do Começo ao Fim - ${pageName}`);
  }, [selectedCategory, activeSection, selectedCity]);

  React.useEffect(() => {
    if (selectedArticle) {
      trackArticleView(selectedArticle.id, selectedArticle.title, selectedArticle.category);
    }
  }, [selectedArticle]);

  const handleLogout = () => {
    trackUserAction("user_logout");
    signOut(auth).catch((err) => console.error("Error signing out of Firebase:", err));
    localStorage.removeItem("docomeco_user_session");
    setUser({ email: "", name: "", photoUrl: "", isAuthenticated: false, isAdmin: false });
    setSelectedCategory(null);
    setSelectedArticle(null);
    setActiveTab("reader");
  };

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, likes: art.likes + 1 } : art))
    );
    trackUserAction("like_article", { articleId: id });
  };

  const handleShare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, shares: art.shares + 1 } : art))
    );
    toast.success("Conteúdo compartilhado! Link copiado para sua área de transferência.");
    trackUserAction("share_article", { articleId: id });
  };

  // Add Comment to active article
  const [commentText, setCommentText] = useState("");
  const handleAddComment = (e: React.FormEvent, articleId: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      articleId,
      userName: user.isAuthenticated ? user.name : "Leitor Anônimo",
      userEmail: user.isAuthenticated ? user.email : "anonimo@docomecoaotopo.com",
      text: commentText,
      date: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentText("");
    // Increment comment count in article too
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, commentsCount: a.commentsCount + 1 } : a))
    );
    trackUserAction("add_comment", { articleId });
  };

  // Filter application onto articles dataset
  const filteredArticles = articles.filter((art) => {
    // Filter by tag/category tab
    if (selectedCategory && art.category !== selectedCategory) {
      return false;
    }
    // Filter by selected city
    if (selectedCity && !art.location?.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    // Filter by selected date (YYYY-MM-DD)
    if (selectedDate) {
      let artDatePart = "";
      if (art.date) {
        if (/^\d{4}-\d{2}-\d{2}/.test(art.date)) {
          artDatePart = art.date.substring(0, 10);
        } else {
          const match = art.date.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
          if (match) {
            artDatePart = `${match[3]}-${match[2]}-${match[1]}`;
          } else {
            try {
              const dt = new Date(art.date);
              if (!isNaN(dt.getTime())) artDatePart = dt.toISOString().split("T")[0];
            } catch (e) {}
          }
        }
      }
      if (artDatePart !== selectedDate) {
        return false;
      }
    }
    // Filter by agenda search query
    if (agendaSearch.trim() !== "") {
      const qAgenda = agendaSearch.toLowerCase();
      const matchesAgendaTitle = art.title.toLowerCase().includes(qAgenda);
      const matchesAgendaExcerpt = art.excerpt.toLowerCase().includes(qAgenda);
      const matchesAgendaContent = art.content.toLowerCase().includes(qAgenda);
      if (!matchesAgendaTitle && !matchesAgendaExcerpt && !matchesAgendaContent) {
        return false;
      }
    }
    // Search text query
    if (searchText.trim() !== "") {
      const q = searchText.toLowerCase();
      const matchesTitle = art.title.toLowerCase().includes(q);
      const matchesExcerpt = art.excerpt.toLowerCase().includes(q);
      const matchesTags = art.tags?.some((t) => t.toLowerCase().includes(q));
      if (!matchesTitle && !matchesExcerpt && !matchesTags) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "relevance") {
      return b.views - a.views;
    } else {
      // latest
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  return (
    <div
      id="app-root"
      className={`min-h-screen font-sans overflow-x-hidden transition-all duration-300 relative ${
        activeTab === "editor" || (user.isAuthenticated && user.isAdmin) ? "pb-24" : ""
      } ${
        isDarkMode ? "bg-black text-white" : "bg-stone-50 text-stone-900"
      }`}
    >
      {!showWelcomePopup && <VLibras forceOnload={true} />}
      <Toaster position="top-center" richColors />
      {/* Dynamic Background Glowing Spheres (Green & Pink) */}
      {isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-15 transition-all duration-1000 ${
            gradientStyle === "neonPulse" ? "bg-green-500 animate-pulse" :
            gradientStyle === "auroraGreenPink" ? "bg-emerald-500" :
            gradientStyle === "pinkGlow" ? "bg-pink-500" : "bg-emerald-500"
          }`}></div>
          <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[140px] opacity-15 transition-all duration-1000 ${
            gradientStyle === "neonPulse" ? "bg-pink-500" :
            gradientStyle === "auroraGreenPink" ? "bg-rose-550 animate-pulse" :
            gradientStyle === "pinkGlow" ? "bg-rose-600 animate-pulse" : "bg-green-400"
          }`}></div>
        </div>
      )}

      <TopinaAssistant isCollapsed={areFloatingButtonsCollapsed} />

      {/* <RodadaCountdownBanner
        isDirectEditingEnabled={isDirectEditingEnabled}
        portalPagesConfig={portalPagesConfig}
        onSavePortalPagesConfig={handleSavePortalPagesConfig}
      /> */}

      {/* TOP ALERT FOR OFFLINE MODE */}
      {isOfflineActive && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black px-4 py-2 font-mono text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl z-50 sticky top-0 border-b border-amber-400">
          <div className="flex items-center gap-2">
            <span className="text-base animate-pulse">⚡</span>
            <span>
              Modo Offline Ativo: Navegação autônoma. Notícias, membros, podcasts e páginas salvos localmente.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setOfflineModeOverride(false);
                setIsOfflineActive(isOfflineModeActive());
                toast.success("Modo Online restabelecido!");
              }}
              className="px-3 py-1 bg-black text-amber-300 hover:text-white hover:bg-zinc-900 rounded-lg text-[10px] uppercase font-black tracking-wider transition cursor-pointer shadow-sm"
            >
              Restabelecer Conexão / Online →
            </button>
          </div>
        </div>
      )}

      {/* TOP ALERT FOR SUSPENDED USERS */}
      {user.isAuthenticated && !user.isAdmin && (user.status === "suspended" || !user.status) && (
        <div className="bg-amber-500/95 text-black px-4 py-2 font-mono text-xs font-bold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg z-50 sticky top-0 border-b border-amber-600">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>Acesso em Análise: Sua conta aguarda liberação do Admin. Funções VIP e Financeiras estão bloqueadas.</span>
          </div>
          <button
            onClick={() => setShowPendingModal(true)}
            className="px-3 py-1 bg-black text-amber-400 hover:bg-zinc-900 rounded-lg text-[10px] uppercase font-black tracking-wider transition cursor-pointer shrink-0"
          >
            Ver Status / Falar com Admin →
          </button>
        </div>
      )}

      {/* HEADER TOP BAR & WEATHER */}
      <header className={`border-b ${isDarkMode ? "border-zinc-800 bg-black/90" : "border-stone-200 bg-white/90"} sticky top-0 z-40 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 py-2 space-y-2">
          {/* Collapsible Weather with customer user area panel */}
          <CollapsibleHeaderWeather
            isDarkMode={isDarkMode}
            user={user}
            onTriggerLogin={() => {
              setAuthModalTab("client");
              setAuthModalOpen(true);
            }}
            onLogout={handleLogout}
            onOpenProfile={() => {
              setSelectedCategory(null);
              setActiveSection("PERFIL");
            }}
            onOpenFaceNav={() => setMotionNavMode("face")}
            onOpenHandNav={() => setMotionNavMode("hands")}
          />

          {/* Primary Navbar Branding and configuration controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-1 border-t border-zinc-500/10 dark:border-zinc-800/20">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between">
              {/* BRANDING LOGO */}
              <button
                onClick={(e) => {
                  setSelectedCategory(null);
                  setActiveSection(null);
                  const next = rocketClicks + 1;
                  setRocketClicks(next);
                  if (next >= 7) {
                    setRocketClicks(0);
                    setShowRocketModal(true);
                  }
                }}
                className="focus:outline-none text-left animate-fade-in flex items-center gap-4"
                title="Dica: Clique 7 vezes no logotipo para ativar o Modo Foguete!"
              >
                <BrandLogo
                  size="md"
                  customImageUrl={logoConfig.customImageUrl}
                  customLogoWidth={logoConfig.customLogoWidth}
                  customLogoHeight={logoConfig.customLogoHeight}
                  customText1={logoConfig.customText1}
                  customText2={logoConfig.customText2}
                  customSub={logoConfig.customSub}
                  isDarkMode={isDarkMode}
                  isEditingActive={false}
                />
              </button>

              {/* Mobile Quick Light Switcher */}
              <div className="flex items-center gap-2 md:hidden">
                <button
                  onClick={() => {
                    playClickSound(600, "sine");
                    setIsDarkMode(!isDarkMode);
                  }}
                  className={`p-2 rounded-xl border text-xs h-9 w-9 flex items-center justify-center transition-all ${
                    isDarkMode ? "border-zinc-800 text-yellow-400 bg-zinc-900" : "border-stone-200 text-stone-700 bg-stone-100"
                  }`}
                  title="Mudar visual claro/escuro"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Search Input with integrated Web Speech AI commands */}
            <div className="w-full md:max-w-md flex items-center gap-2 animate-fade-in">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3.5 text-zinc-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Buscar notícias regionais, podcasts ou eventos..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className={`w-full pl-10 pr-20 py-2 rounded-full text-xs font-sans transition-all ${
                    isDarkMode
                      ? "bg-stone-950 border-zinc-800 text-white placeholder-zinc-500 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                      : "bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                  } border`}
                  id="header-search-input"
                />
                <button
                  onClick={() => {
                    playClickSound(600, "sine");
                    setShowFilters(!showFilters);
                  }}
                  className="absolute right-2 px-2.5 py-1 text-[9px] font-mono tracking-wider font-bold rounded-full uppercase bg-zinc-900 hover:bg-zinc-800 text-green-400 border border-zinc-700 transition"
                  title="Filtros Avançados"
                >
                  Filtros
                </button>
              </div>
              <VoiceSearchButton
                onSearch={(term) => {
                  setSearchText(term);
                  setSelectedCategory(null);
                  setActiveSection(null);
                }}
                isDarkMode={isDarkMode}
              />
            </div>

            {/* Right Side Control Panel buttons: Simple Theme Switcher */}
            <div className="hidden md:flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  playClickSound(600, "sine");
                  setIsDarkMode(!isDarkMode);
                }}
                className={`p-2 rounded-xl border text-xs h-9 w-9 flex items-center justify-center transition-all ${
                  isDarkMode 
                    ? "border-zinc-800 text-yellow-400 bg-zinc-900 hover:bg-zinc-800" 
                    : "border-stone-200 text-stone-700 bg-stone-100 hover:bg-stone-200"
                }`}
                title="Mudar visual claro/escuro"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* CASCADING NAVIGATION ROW */}
          <div className={`pt-2 border-t ${isDarkMode ? "border-zinc-900/60" : "border-stone-200/60"} z-30 relative`}>
            {/* Mobile Menu Toggle button */}
            <div className="flex md:hidden justify-center items-center py-1">
              <button
                onClick={() => {
                  playClickSound(650, "sine");
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-display font-black tracking-widest uppercase transition-all duration-300 shadow-md ${
                  isDarkMode 
                    ? "bg-zinc-900 border border-zinc-800 text-green-400 hover:text-white" 
                    : "bg-stone-100 border border-stone-200 text-stone-700 hover:text-green-650"
                }`}
              >
                <span>{isMobileMenuOpen ? "✕ FECHAR CATEGORIAS" : "☰ MENU DE NAVEGAÇÃO"}</span>
              </button>
            </div>

            <nav className={`${isMobileMenuOpen ? "flex" : "hidden md:flex"} flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 text-[11px] font-display font-bold tracking-wider transition-all duration-300`}>
              {/* 1. INÍCIO with cascading dropdown */}
              <div className="relative group/inicio">
                <button
                  onClick={() => {
                    playClickSound(600, "sine");
                    setSelectedCategory(null);
                    setActiveSection(null);
                    setNavInicioOpen(!navInicioOpen);
                    setNavCidadesOpen(false);
                    setNavEventosOpen(false);
                    setNavContatoOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onMouseEnter={() => setNavInicioOpen(true)}
                  className={`flex items-center gap-1.5 py-1 transition-all ${
                    activeSection === null && selectedCategory === null
                      ? "text-[#22c55e] font-black"
                      : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-800 hover:text-green-600 font-semibold"
                  }`}
                  id="nav-inicio-trigger"
                >
                  <span className="flex items-center gap-1.5"><Rocket className="w-3.5 h-3.5" /> INÍCIO</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 ${navInicioOpen ? "rotate-180 text-green-400" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                {navInicioOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNavInicioOpen(false)} />
                    <div 
                      onMouseLeave={() => setNavInicioOpen(false)}
                      className={`absolute left-0 mt-1.5 w-48 rounded-xl ${
                        isDarkMode 
                          ? "shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-zinc-800 bg-stone-950/95" 
                          : "shadow-xl border border-stone-200 bg-white"
                      } backdrop-blur-xl z-40 overflow-hidden animate-fade-in`}
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            playClickSound(620, "sine");
                            setSelectedCategory(null);
                            setActiveSection(null);
                            setNavInicioOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 ${
                            isDarkMode 
                              ? "hover:bg-zinc-900 text-zinc-300 hover:text-white border-zinc-900" 
                              : "hover:bg-stone-100 text-stone-800 hover:text-stone-950 border-stone-100"
                          } transition text-[10px] font-mono font-bold uppercase tracking-widest border-b flex items-center gap-2`}
                        >
                          <Globe className="w-3.5 h-3.5" /> FEED PRINCIPAL
                        </button>
                        <button
                          onClick={() => {
                            playClickSound(640, "sine");
                            setActiveSection("QUEM SOMOS");
                            setNavInicioOpen(false);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition text-[10px] uppercase tracking-wider font-semibold flex items-center gap-2 ${
                            activeSection === "QUEM SOMOS" ? "text-[#22c55e]" : "text-zinc-300 hover:text-white"
                          }`}
                        >
                          <Lightbulb className="w-3.5 h-3.5" /> QUEM SOMOS
                        </button>
                        <button
                          onClick={() => {
                            playClickSound(660, "sine");
                            setActiveSection("OBJETIVOS");
                            setNavInicioOpen(false);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition text-[10px] uppercase tracking-wider font-semibold flex items-center gap-2 ${
                            activeSection === "OBJETIVOS" ? "text-[#22c55e]" : "text-zinc-300 hover:text-white"
                          }`}
                        >
                          <TrendingUp className="w-3.5 h-3.5" /> OBJETIVOS
                        </button>
                        <button
                          onClick={() => {
                            playClickSound(680, "sine");
                            setActiveSection("ONDE ESTAMOS");
                            setNavInicioOpen(false);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition text-[10px] uppercase tracking-wider font-semibold flex items-center gap-2 ${
                            activeSection === "ONDE ESTAMOS" ? "text-[#22c55e]" : "text-zinc-300 hover:text-white"
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" /> ONDE ESTAMOS
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. COMUNIDADE (area restrita) */}
              <div className="relative group/ramos">
                <button
                  onMouseEnter={() => {
                    setNavRamosOpen(true);
                    setNavInicioOpen(false);
                    setNavCidadesOpen(false);
                    setNavEventosOpen(false);
                    setNavContatoOpen(false);
                  }}
                  onClick={() => {
                    playClickSound(610, "sine");
                    setSelectedCategory("COMUNIDADE");
                    setActiveSection(null);
                    setNavRamosOpen(!navRamosOpen);
                  }}
                  className={`py-1 transition-all flex items-center gap-1.5 ${
                    selectedCategory === "COMUNIDADE"
                      ? "text-[#22c55e] font-black"
                      : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-800 hover:text-green-600 font-semibold"
                  }`}
                  title="Acesse o fórum e as pautas da nossa comunidade exclusiva"
                >
                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> COMUNIDADE</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${navRamosOpen ? "rotate-180 text-green-400" : ""}`} />
                  <span className="text-[8px] font-mono px-1 rounded bg-pink-500/10 text-pink-400 font-black tracking-widest ml-1">VIP</span>
                </button>

                {/* Hierarchical Categories Dropdown */}
                {navRamosOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNavRamosOpen(false)} />
                    <div 
                      onMouseLeave={() => setNavRamosOpen(false)}
                      className="absolute left-0 mt-1.5 w-64 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-zinc-800 bg-stone-950/95 backdrop-blur-xl z-40 py-2 animate-fade-in"
                    >
                      <button 
                        onClick={() => {
                          setSelectedCategory("COMUNIDADE");
                          setSelectedBranch("TODAS");
                          setNavRamosOpen(false);
                          playClickSound(600, "sine");
                        }}
                        className="w-full text-left px-4 py-2 text-[10px] font-mono font-black text-zinc-300 hover:text-white hover:bg-zinc-900 border-b border-zinc-900 mb-1 flex items-center gap-2"
                      >
                        <User className="w-3.5 h-3.5" /> ACESSO PARA MEMBROS
                      </button>
                      <div className="relative group/categorias">
                        <button 
                          onClick={() => {
                            setActiveSection("CATEGORIAS");
                            setSelectedCategory(null);
                            setNavRamosOpen(false);
                            playClickSound(600, "sine");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full text-left px-4 py-2 text-[10px] font-mono font-black text-green-400 hover:bg-zinc-900 border-b border-zinc-900 mb-1 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2"><Briefcase className="w-3 h-3" /> CATEGORIAS</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        
                        <div className="absolute left-full top-0 ml-0.5 w-64 bg-stone-950 border border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/categorias:opacity-100 group-hover/categorias:visible transition-all duration-200">
                          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {COMMUNITY_CATEGORIES.map((cat) => (
                              <div key={cat.id} className="relative group/sub">
                                <div 
                                  className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900 cursor-pointer transition"
                                  onMouseEnter={() => playClickSound(800, "sine")}
                                  onClick={() => {
                                    setSelectedCategory("COMUNIDADE");
                                    setSelectedBranch(cat.label);
                                    setNavRamosOpen(false);
                                  }}
                                >
                                  <span className="text-[10px] font-mono font-bold text-zinc-300 flex items-center gap-2">
                                    {cat.icon} {cat.label}
                                  </span>
                                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                                </div>
                                
                                {/* Submenu (lateral) */}
                                <div className="absolute left-full top-0 ml-0.5 w-64 bg-stone-950 border border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                                  <div className="px-4 py-1.5 border-b border-zinc-900 mb-1">
                                    <span className="text-[9px] font-mono font-black text-green-500 uppercase">{cat.label}</span>
                                  </div>
                                  {cat.subcategories.map((sub) => (
                                    <button
                                      key={sub.id}
                                      onClick={() => {
                                        setSelectedCategory("COMUNIDADE");
                                        setSelectedBranch(sub.label);
                                        setNavRamosOpen(false);
                                        playClickSound(600, "sine");
                                      }}
                                      className={`w-full text-left px-4 py-2 text-[10px] font-mono hover:bg-zinc-900 transition ${selectedBranch === sub.label ? "text-green-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                                    >
                                      {sub.label}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 4. EVENTOS with cascading dropdown */}
              <div className="relative group/eventos">
                <button
                  onMouseEnter={() => {
                    setNavEventosOpen(true);
                    setNavInicioOpen(false);
                    setNavCidadesOpen(false);
                    setNavContatoOpen(false);
                  }}
                  onClick={() => {
                    playClickSound(620, "sine");
                    setNavEventosOpen(!navEventosOpen);
                    setNavInicioOpen(false);
                    setNavCidadesOpen(false);
                    setNavContatoOpen(false);
                  }}
                  className={`py-1 transition-all flex items-center gap-1 ${
                    selectedCategory === "EVENTOS" || activeSection === "GALERIA"
                      ? "text-[#22c55e] font-black"
                      : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-800 hover:text-green-600 font-semibold"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> EVENTOS</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${navEventosOpen ? "rotate-180" : ""}`} />
                </button>
                {navEventosOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setNavEventosOpen(false)} />
                    <div 
                      onMouseLeave={() => setNavEventosOpen(false)}
                      className="absolute left-0 mt-1.5 w-48 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] border border-zinc-800 bg-stone-950/95 backdrop-blur-xl z-40 overflow-hidden animate-fade-in text-left"
                    >
                      <div className="py-1">
                        <button
                          onClick={() => {
                            playClickSound(615, "sine");
                            setSelectedCategory("EVENTOS");
                            setActiveSection(null);
                            setNavEventosOpen(false);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900/60 transition text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 ${
                            selectedCategory === "EVENTOS" ? "text-[#22c55e]" : "text-zinc-300 hover:text-white"
                          }`}
                        >
                          <Calendar className="w-3 h-3" /> VER EVENTOS
                        </button>
                        <button
                          onClick={() => {
                            playClickSound(620, "sine");
                            setActiveSection("RSVP");
                            setSelectedCategory(null);
                            setNavEventosOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900/60 transition text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 ${
                            activeSection === "RSVP" ? "text-purple-400" : "text-zinc-300 hover:text-white"
                          }`}
                        >
                          <Users className="w-3 h-3" /> RSVP Lançamento
                        </button>
                        <button
                          onClick={() => {
                            playClickSound(625, "sine");
                            setActiveSection("GALERIA");
                            setSelectedCategory(null);
                            setNavEventosOpen(false);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-zinc-900 transition text-[10px] uppercase font-mono font-bold flex items-center gap-1.5 ${
                            activeSection === "GALERIA" ? "text-pink-400" : "text-zinc-300 hover:text-white"
                          }`}
                        >
                          <Camera className="w-3 h-3" /> GALERIA DE FOTOS
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 4.5. DEPOIMENTOS (Vozes Femininas - item dedicado logo após Eventos) */}
              <button
                onClick={() => {
                  playClickSound(625, "sine");
                  setActiveSection("DEPOIMENTOS");
                  setSelectedCategory(null);
                  setNavInicioOpen(false);
                  setNavRamosOpen(false);
                  setNavEventosOpen(false);
                  setNavContatoOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-1 transition-all flex items-center gap-1.5 ${
                  activeSection === "DEPOIMENTOS"
                    ? "text-[#22c55e] font-black"
                    : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-700 hover:text-green-650"
                }`}
                title="Depoimentos e Vozes Femininas inspiradoras"
              >
                <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-pink-400" /> DEPOIMENTOS</span>
              </button>

              {/* 5. EMBAIXADORES (area restrita) */}
              <button
                onClick={() => {
                  playClickSound(630, "sine");
                  setSelectedCategory("EMBAIXADORES");
                  setActiveSection(null);
                  setNavInicioOpen(false);
                  setNavRamosOpen(false);
                  setNavEventosOpen(false);
                  setNavContatoOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-1 transition-all flex items-center gap-1.5 ${
                  selectedCategory === "EMBAIXADORES"
                    ? "text-[#22c55e] font-black"
                    : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-700 hover:text-green-650"
                }`}
                title="Veja os relatórios exclusivos de nossos Embaixadores locais"
              >
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> EMBAIXADORES</span>
                <span className="text-[8px] font-mono px-1 rounded bg-pink-500/10 text-pink-400 font-black tracking-widest">VIP</span>
              </button>

              {/* 6. PARCEIROS (Página individual) */}
              <button
                onClick={() => {
                  playClickSound(650, "sine");
                  setActiveSection("PARCEIROS");
                  setSelectedCategory(null);
                  setNavInicioOpen(false);
                  setNavRamosOpen(false);
                  setNavEventosOpen(false);
                  setNavContatoOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-1 transition-all flex items-center gap-1.5 ${
                  activeSection === "PARCEIROS"
                    ? "text-[#22c55e] font-black"
                    : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-700 hover:text-green-650"
                }`}
                title="Conheça todos os nossos parceiros e patrocinadores"
              >
                <span className="flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5 text-blue-400" /> PARCEIROS</span>
              </button>

              {/* 7. PODCAST (Página individual) */}
              <button
                onClick={() => {
                  playClickSound(660, "sine");
                  setSelectedCategory("PODCAST");
                  setActiveSection("PODCAST");
                  setNavInicioOpen(false);
                  setNavRamosOpen(false);
                  setNavEventosOpen(false);
                  setNavContatoOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-1 transition-all flex items-center gap-1.5 ${
                  selectedCategory === "PODCAST" || activeSection === "PODCAST"
                    ? "text-[#22c55e] font-black"
                    : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-700 hover:text-green-650"
                }`}
                title="Assista aos episódios completos do Podcast Do Começo ao Topo"
              >
                <span className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-red-500" /> PODCAST</span>
              </button>

              {/* 8. CONTATO (Página individual Fale Conosco) */}
              <button
                onClick={() => {
                  playClickSound(670, "sine");
                  setActiveSection("CONTATO");
                  setSelectedCategory(null);
                  setNavInicioOpen(false);
                  setNavRamosOpen(false);
                  setNavEventosOpen(false);
                  setNavContatoOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`py-1 transition-all flex items-center gap-1.5 ${
                  activeSection === "CONTATO"
                    ? "text-[#22c55e] font-black"
                    : isDarkMode ? "text-zinc-350 hover:text-[#22c55e]" : "text-stone-700 hover:text-green-650"
                }`}
                title="Fale com nossa redação ou envie sugestões de pauta"
              >
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-yellow-400" /> CONTATO</span>
              </button>

            </nav>
          </div>

          {/* ADVANCED FILTERS PANEL */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-xl border ${
                  isDarkMode ? "bg-zinc-950 border-zinc-800 text-zinc-300" : "bg-stone-100 border-stone-200 text-stone-800"
                } text-xs space-y-3 overflow-hidden font-sans`}
              >
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" /> Ordene os conteúdos:
                    </span>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-800">
                      {[
                        { label: "Mais Recentes", value: "latest" },
                        { label: "Mais Antigos", value: "oldest" },
                        { label: "Destaque (Acessos)", value: "relevance" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSortBy(opt.value as any)}
                          className={`px-2.5 py-1 text-[10px] font-mono transition ${
                            sortBy === opt.value
                              ? "bg-pink-500 text-white font-bold"
                              : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clean active options */}
                  <div className="flex gap-2.5">
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="px-2 py-0.5 rounded bg-green-500/15 border border-green-500/40 text-green-400 text-[10px] uppercase"
                      >
                        Limpar Filtro ({selectedCategory}) ×
                      </button>
                    )}
                    {searchText && (
                      <button
                        onClick={() => setSearchText("")}
                        className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px] uppercase"
                      >
                        Limpar Busca ×
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* RENDER BODY FOR READER / CMS CONFIG */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-8 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === "editor" ? (
            user.isAuthenticated && !user.isAdmin && (user.status === "suspended" || !user.status) ? (
              <motion.div
                key="pending-cms-access"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="max-w-xl mx-auto py-8"
              >
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab("reader")}
                    className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-mono font-bold uppercase rounded cursor-pointer"
                  >
                    Voltar ao Portal ×
                  </button>
                </div>
                <PendingApprovalScreen
                  user={user}
                  supportWhatsapp={portalPagesConfig.contatoWhatsapp || "+55 32 99194-7690"}
                  onLogout={handleLogout}
                  onRefreshStatus={async () => {
                    if (user.email) {
                      try {
                        const res = await fetch("/api/users/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: user.email, uid: user.uid })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          const record = data.user || {};
                          const isAdmin = !!data.isAdmin;
                          setUser(prev => ({ ...prev, status: record.status, isAdmin: isAdmin }));
                        }
                      } catch (e) {
                        console.error("Error refreshing status:", e);
                      }
                    }
                  }}
                />
              </motion.div>
            ) : (
              /* CMS & Realtime Analytics Dashboard View */
              <motion.div
              key="cms-dash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500/10 via-zinc-900 to-green-500/10 border border-zinc-800 mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">
                    Modo Editor: Gestão Integrada & Analytics
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Publique conteúdos e inspecione índices de engajamento do público em Juiz de Fora e arredores.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("reader")}
                  className="px-3 py-1 bg-green-500 hover:bg-green-400 text-black text-[10px] font-mono font-black uppercase rounded"
                >
                  Voltar ao Portal ×
                </button>
              </div>

              <CmsDashboard
                articles={articles}
                onAddArticle={handleAddArticle}
                onDeleteArticle={handleDeleteArticle}
                isDarkMode={isDarkMode}
                onToggleDarkMode={() => {
                  playClickSound(600, "sine");
                  setIsDarkMode(!isDarkMode);
                }}
                logoConfig={logoConfig}
                onSaveLogo={(updated) => {
                  setLogoConfig(updated);
                  localStorage.setItem("logo_config", JSON.stringify(updated));
                  setCmsSaveStatus("saving");
                  setTimeout(() => setCmsSaveStatus("saved"), 700);
                }}
                isSoundActive={isSoundActive}
                onToggleSound={(active) => {
                  setIsSoundActive(active);
                }}
                gradientStyle={gradientStyle}
                onSelectGradientStyle={(style) => {
                  setGradientStyle(style);
                  localStorage.setItem("gradient_style", style);
                  setCmsSaveStatus("saving");
                  setTimeout(() => setCmsSaveStatus("saved"), 700);
                }}
                footerCredits={footerCredits}
                onSaveFooterCredits={(txt) => {
                  setFooterCredits(txt);
                  localStorage.setItem("footer_credits", txt);
                  setCmsSaveStatus("saving");
                  setTimeout(() => setCmsSaveStatus("saved"), 700);
                }}
                user={user}
                onTriggerAuth={() => setAuthModalOpen(true)}
                onLogout={handleLogout}
                portalPagesConfig={portalPagesConfig}
                onSavePortalPagesConfig={handleSavePortalPagesConfig}
              />
            </motion.div>
            )
          ) : (
            /* Reader News Portal View */
            <motion.div
              key="reader-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col space-y-8"
            >
              {/* BRAND NEW ULTIMAS NOTICIAS TICKER */}
              <div 
                style={{ order: homepageSectionsOrder.indexOf("ticker") }} 
                className="relative group/section"
                id="homepage-section-ticker"
              >
                {isDirectEditingEnabled && (
                  <div className="absolute top-2 right-2 z-40 flex items-center gap-2 bg-stone-950/95 border border-pink-500/50 rounded-xl px-2.5 py-1.5 shadow-2xl font-mono text-[9px] text-zinc-300 backdrop-blur-md opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, homepageSectionsOrder.indexOf("ticker"))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, homepageSectionsOrder.indexOf("ticker"))}
                      className="cursor-grab active:cursor-grabbing p-1 hover:text-pink-400 transition"
                      title="Arraste para reordenar"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                    <span className="font-bold text-pink-400 uppercase mr-1 select-none">📢 Letreiro</span>
                    <button 
                      onClick={() => moveSectionUp(homepageSectionsOrder.indexOf("ticker"))} 
                      disabled={homepageSectionsOrder.indexOf("ticker") === 0} 
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => moveSectionDown(homepageSectionsOrder.indexOf("ticker"))} 
                      disabled={homepageSectionsOrder.indexOf("ticker") === homepageSectionsOrder.length - 1} 
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <BreakingNewsTicker isDarkMode={isDarkMode} />
              </div>

              {/* ADMIN MODE DIRECT DESIGN EDITOR INSTRUCTIONS */}
              {user.isAuthenticated && user.isAdmin && (
                <div style={{ order: -100 }} className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-black to-green-500/10 border border-pink-500/40 shadow-[0_0_25px_rgba(236,72,153,0.1)] flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-full bg-pink-500/5 rotate-12 blur-xl pointer-events-none" />
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-pink-500/20 border border-pink-500/40 text-pink-500 rounded-xl animate-pulse">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs text-white uppercase tracking-wider">
                        MODO DE EDIÇÃO ATIVO 👑
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5 max-w-xl">
                        Você está autenticado como administrador. Navegue por categorias como Cursos On-line, Podcasts ou Notícias e use os botões rápidos de criação ou clique nas opções suspensas dos cards para adicionar, editar ou excluir publicações instantaneamente.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-10 shrink-0">
                    <button
                      onClick={() => {
                        playClickSound(700, "sine");
                        setReorderModalOpen(true);
                      }}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-200 flex items-center gap-1.5 shrink-0 border border-pink-400 shadow-md cursor-pointer hover:scale-[1.02]"
                    >
                      <GripVertical className="w-3.5 h-3.5" />
                      <span>🔧 Ordenar Blocos da Home</span>
                    </button>
                  </div>
                </div>
              )}

              {/* USER PROFILE */}
              {activeSection === "PERFIL" && user.isAuthenticated && (
                <div style={{ order: -99 }}>
                  {!user.isAdmin && (user.status === "suspended" || !user.status) ? (
                    <PendingApprovalScreen
                      user={user}
                      supportWhatsapp={portalPagesConfig.contatoWhatsapp || "+55 32 99194-7690"}
                      onLogout={handleLogout}
                      onRefreshStatus={async () => {
                        if (user.email) {
                          try {
                            const res = await fetch("/api/users/sync", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ email: user.email, uid: user.uid })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              const record = data.user || {};
                              const isAdmin = !!data.isAdmin;
                              setUser(prev => ({ ...prev, status: record.status, isAdmin: isAdmin }));
                            }
                          } catch (e) {
                            console.error("Error refreshing status:", e);
                          }
                        }
                      }}
                    />
                  ) : (
                    <UserProfile
                      user={user}
                      onLogout={handleLogout}
                      onUpdateUser={(updated) => setUser({ ...user, ...updated })}
                      isDarkMode={isDarkMode}
                      onThemeToggle={() => setIsDarkMode(!isDarkMode)}
                    />
                  )}
                </div>
              )}

              {/* HERO SLIDER WITH VIDEO BACKGROUND */}
              {selectedCategory === null && activeSection === null && (
                <div 
                  style={{ order: homepageSectionsOrder.indexOf("hero") }} 
                  className="relative group/section"
                  id="homepage-section-hero"
                >
                  {isDirectEditingEnabled && (
                    <div className="absolute top-2 right-2 z-40 flex items-center gap-2 bg-stone-950/95 border border-pink-500/50 rounded-xl px-2.5 py-1.5 shadow-2xl font-mono text-[9px] text-zinc-300 backdrop-blur-md opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, homepageSectionsOrder.indexOf("hero"))}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, homepageSectionsOrder.indexOf("hero"))}
                        className="cursor-grab active:cursor-grabbing p-1 hover:text-pink-400 transition"
                        title="Arraste para reordenar"
                      >
                        <GripVertical className="w-3.5 h-3.5 text-pink-500" />
                      </div>
                      <span className="font-bold text-pink-400 uppercase mr-1 select-none">🎬 Banner Vídeo</span>
                      <button 
                        onClick={() => moveSectionUp(homepageSectionsOrder.indexOf("hero"))} 
                        disabled={homepageSectionsOrder.indexOf("hero") === 0} 
                        className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => moveSectionDown(homepageSectionsOrder.indexOf("hero"))} 
                        disabled={homepageSectionsOrder.indexOf("hero") === homepageSectionsOrder.length - 1} 
                        className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <HeroVideoSlider isDarkMode={isDarkMode} onSelectCategory={handleSelectCategory} />
                </div>
              )}

              {/* Category tabs and Cities cascade dropdown on homepage */}
              <div 
                style={{ order: homepageSectionsOrder.indexOf("feed") }} 
                className="relative group/section space-y-8"
                id="homepage-section-feed"
              >
                {isDirectEditingEnabled && (
                  <div className="absolute top-2 right-2 z-40 flex items-center gap-2 bg-stone-950/95 border border-pink-500/50 rounded-xl px-2.5 py-1.5 shadow-2xl font-mono text-[9px] text-zinc-300 backdrop-blur-md opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, homepageSectionsOrder.indexOf("feed"))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, homepageSectionsOrder.indexOf("feed"))}
                      className="cursor-grab active:cursor-grabbing p-1 hover:text-pink-400 transition"
                      title="Arraste para reordenar"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                    <span className="font-bold text-pink-400 uppercase mr-1 select-none">📰 Feed Principal</span>
                    <button 
                      onClick={() => moveSectionUp(homepageSectionsOrder.indexOf("feed"))} 
                      disabled={homepageSectionsOrder.indexOf("feed") === 0} 
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => moveSectionDown(homepageSectionsOrder.indexOf("feed"))} 
                      disabled={homepageSectionsOrder.indexOf("feed") === homepageSectionsOrder.length - 1} 
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-zinc-800/30 pb-5">
                
                {/* Left: Quick Categories selector */}
                <div className="flex flex-col space-y-2 flex-grow">
                  <span className="text-[10px] font-mono tracking-widest text-[#22c55e] font-bold uppercase">
                    Filtro Rápido por Preferência - Hoje:
                  </span>
                  
                  {/* Visual pills mapping CATEGORIAS: PODCAST, COMUNIDADE, EMBAIXADORES, TOUR e NOTÍCIAS */}
                  <div className="flex flex-wrap gap-2">
                    {isDirectEditingEnabled && (
                      <div className="relative shrink-0" id="admin-create-new-button-wrapper">
                        <button
                          onClick={() => {
                            playClickSound(650, "sine");
                            setAdminCreateDropdownOpen(!adminCreateDropdownOpen);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider bg-gradient-to-r from-pink-500 to-red-500 text-black border border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:shadow-[0_0_25px_rgba(236,72,153,0.55)] transition duration-200 flex items-center gap-1.5 hover:scale-[1.02]"
                        >
                          <Plus className="w-3.5 h-3.5 text-black stroke-[3px]" />
                          <span>+ CRIAR NOVO</span>
                        </button>
                        {adminCreateDropdownOpen && (
                          <div className="absolute left-0 mt-2 w-56 bg-stone-950 border border-zinc-800 rounded-2xl p-2.5 shadow-2xl z-50 font-mono text-xs text-left">
                            <div className="px-2 py-1 border-b border-zinc-900 mb-1.5 flex justify-between items-center">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Ações Administrativas</span>
                              <button onClick={() => setAdminCreateDropdownOpen(false)} className="text-zinc-500 hover:text-white">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* Create in currently selected category or general article */}
                            <button
                              onClick={() => {
                                setAdminCreateDropdownOpen(false);
                                handleCreateNewArticle();
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition flex items-center gap-2 text-zinc-300 hover:text-white"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                              <span>Novo Post ({selectedCategory || "NOTÍCIAS"})</span>
                            </button>

                            {/* Create Photo */}
                            <button
                              onClick={() => {
                                setAdminCreateDropdownOpen(false);
                                const galSection = document.getElementById("photo-gallery-section") || document.getElementById("global-photo-gallery-root");
                                if (galSection) {
                                  galSection.scrollIntoView({ behavior: "smooth" });
                                }
                                window.dispatchEvent(new Event("admin_open_photo_upload"));
                                playSuccessSound();
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition flex items-center gap-2 text-zinc-300 hover:text-white"
                            >
                              <Camera className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Nova Foto na Galeria</span>
                            </button>

                            {/* Create Partner */}
                            <button
                              onClick={() => {
                                setAdminCreateDropdownOpen(false);
                                const partnersSection = document.getElementById("partners-carousel-root");
                                if (partnersSection) {
                                  partnersSection.scrollIntoView({ behavior: "smooth" });
                                }
                                window.dispatchEvent(new Event("admin_open_partner_add"));
                                playSuccessSound();
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition flex items-center gap-2 text-zinc-300 hover:text-white"
                            >
                              <Handshake className="w-3.5 h-3.5 text-blue-400" />
                              <span>Novo Parceiro</span>
                            </button>

                            {/* Create Ambassador */}
                            <button
                              onClick={() => {
                                setAdminCreateDropdownOpen(false);
                                window.dispatchEvent(new Event("admin_open_ambassador_add"));
                                playSuccessSound();
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-zinc-900 rounded-xl transition flex items-center gap-2 text-zinc-300 hover:text-white"
                            >
                              <User className="w-3.5 h-3.5 text-green-400" />
                              <span>Novo Embaixador</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        playClickSound(600, "sine");
                        setSelectedBranch("TODAS");
                        setSelectedCity(null);
                        setSelectedDate(null);
                        handleSelectCategory(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-display font-extrabold uppercase tracking-wide border transition ${
                        selectedCategory === null
                          ? "bg-green-500 text-black border-green-400 shadow-[0_0_18px_rgba(34,197,94,0.65)]"
                          : "bg-stone-950 border-green-500/20 text-green-300 hover:border-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.4)] shadow-[0_0_8px_rgba(34,197,94,0.15)]"
                      }`}
                    >
                      🚀 TUDO RECENTE
                    </button>

                    {/* Core 5 Quick choices from proposal */}
                    {(["PODCAST", "COMUNIDADE", "EMBAIXADORES", "TOUR", "NOTÍCIAS"] as CategoryType[]).map((cat) => {
                      const isSelected = selectedCategory === cat;
                      const isPremium = cat === "COMUNIDADE" || cat === "EMBAIXADORES";
                      
                      // Beautiful neon glow styles for each category
                      const neonStyles: Record<string, { base: string, selected: string }> = {
                        PODCAST: {
                          base: "bg-stone-950 border-purple-500/30 text-purple-300 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] shadow-[0_0_8px_rgba(168,85,247,0.15)]",
                          selected: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.65)]"
                        },
                        COMUNIDADE: {
                          base: "bg-stone-950 border-pink-500/30 text-pink-300 hover:border-pink-400 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] shadow-[0_0_8px_rgba(236,72,153,0.15)]",
                          selected: "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-[0_0_18px_rgba(236,72,153,0.65)]"
                        },
                        EMBAIXADORES: {
                          base: "bg-stone-950 border-emerald-500/30 text-emerald-300 hover:border-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] shadow-[0_0_8px_rgba(16,185,129,0.15)]",
                          selected: "bg-gradient-to-r from-green-500 to-emerald-600 text-black border-green-400 shadow-[0_0_18px_rgba(34,197,94,0.65)]"
                        },
                        TOUR: {
                          base: "bg-stone-950 border-amber-500/30 text-amber-300 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] shadow-[0_0_8px_rgba(245,158,11,0.15)]",
                          selected: "bg-gradient-to-r from-orange-500 to-amber-500 text-black border-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.65)]"
                        },
                        NOTÍCIAS: {
                          base: "bg-stone-950 border-cyan-500/30 text-cyan-300 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] shadow-[0_0_8px_rgba(6,182,212,0.15)]",
                          selected: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.65)]"
                        }
                      };

                      const currentStyles = neonStyles[cat] || {
                        base: "bg-stone-950 border-zinc-800 text-zinc-300 hover:border-zinc-700",
                        selected: "bg-gradient-to-r from-green-500 to-emerald-600 text-black border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                      };

                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            if (cat === "TOUR") {
                              playClickSound(800, "sine");
                              setIsSiteTourOpen(true);
                            } else {
                              handleSelectCategory(cat);
                            }
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-display font-extrabold uppercase tracking-wider border transition flex items-center gap-1.5 ${
                            isSelected ? currentStyles.selected : currentStyles.base
                          }`}
                        >
                          {cat === "TOUR" && <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />}
                          {isPremium && <Lock className={`w-3 h-3 ${isSelected ? "text-stone-900" : "text-pink-500"}`} />}
                          <span>{cat}</span>
                          {isPremium && (
                            <span className={`text-[8px] px-1 font-mono rounded ${isSelected ? "bg-stone-900 text-green-400" : "bg-pink-500/20 text-pink-400 font-bold"}`}>
                              VIP
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: MENU CASCATA - RAMOS (Tecnologia, Design, etc) */}
                <div className="flex flex-col space-y-1.5 shrink-0 relative z-30">
                  <span className="text-[10px] font-mono tracking-widest text-[#22c55e] font-bold uppercase">
                    Filtrar por Ramo de Atividade:
                  </span>
                  
                  <div className="relative inline-block text-left w-full md:w-64">
                    <button
                      onClick={() => setNavRamosOpen(!navRamosOpen)}
                      className={`w-full px-4 py-2 bg-stone-950 hover:bg-zinc-900 border transition-all duration-300 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center justify-between gap-2.5 ${
                        selectedBranch !== "TODAS" 
                          ? "border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                          : "border-zinc-800 text-zinc-300 hover:border-zinc-750"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Briefcase className={`w-3.5 h-3.5 ${selectedBranch !== "TODAS" ? "text-pink-400" : "text-zinc-500"}`} />
                        {selectedBranch === "TODAS" ? "Categorias de Negócios" : selectedBranch}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${navRamosOpen ? "rotate-180 text-pink-400" : "text-zinc-500"}`} />
                    </button>

                    {navRamosOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setNavRamosOpen(false)} />
                        <div className="absolute right-0 mt-2 w-full md:w-64 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-zinc-800/80 bg-stone-950/95 backdrop-blur-xl z-40 overflow-hidden animate-fade-in">
                          <div className="bg-zinc-900 px-3.5 py-2 border-b border-zinc-800/50 text-[8px] font-mono text-zinc-500 font-bold tracking-widest uppercase">
                            Ramos de Atividade
                          </div>

                          <div className="py-1 max-h-96 overflow-y-auto custom-scrollbar">
                            <button
                              onClick={() => {
                                playClickSound(600, "sine");
                                setSelectedBranch("TODAS");
                                setSelectedCategory("COMUNIDADE");
                                setNavRamosOpen(false);
                                const el = document.getElementById("homepage-section-membership") || document.getElementById("main-content-area");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="w-full text-left px-3.5 py-2.5 text-[10px] font-mono font-black tracking-wide transition flex items-center gap-2 text-zinc-300 hover:text-white hover:bg-zinc-900 border-b border-zinc-900/50"
                            >
                              <User className="w-3.5 h-3.5 text-pink-400" />
                              <span>ACESSO PARA MEMBROS</span>
                            </button>
                            <div className="relative group/categorias">
                              <button
                                onClick={() => {
                                  playClickSound(600, "sine");
                                  setActiveSection("CATEGORIAS");
                                  setSelectedCategory(null);
                                  setNavRamosOpen(false);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className={`w-full text-left px-3.5 py-2.5 text-[10px] font-mono font-black tracking-wide transition flex items-center justify-between text-green-400 hover:bg-zinc-900`}
                              >
                                <span className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> CATEGORIAS</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                              
                              <div className="absolute right-full top-0 mr-0.5 w-64 bg-stone-950 border border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/categorias:opacity-100 group-hover/categorias:visible transition-all duration-200">
                                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                  {COMMUNITY_CATEGORIES.map((cat) => (
                                    <div key={cat.id} className="relative group/sub-feed">
                                      <div 
                                        className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-900 cursor-pointer transition"
                                        onClick={() => {
                                          playClickSound(600, "sine");
                                          setSelectedCategory("COMUNIDADE");
                                          setSelectedBranch(cat.label);
                                          setNavRamosOpen(false);
                                          const el = document.getElementById("main-content-area") || document.getElementById("dynamic-regional-feed");
                                          if (el) el.scrollIntoView({ behavior: "smooth" });
                                        }}
                                      >
                                        <span className="text-[10px] font-mono font-bold text-zinc-300 flex items-center gap-2">
                                          {cat.icon} {cat.label}
                                        </span>
                                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                                      </div>
                                      
                                      {/* Submenu lateral no feed dropdown */}
                                      <div className="absolute right-full top-0 mr-0.5 w-64 bg-stone-950 border border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/sub-feed:opacity-100 group-hover/sub-feed:visible transition-all duration-200">
                                        {cat.subcategories.map((sub) => (
                                          <button
                                            key={sub.id}
                                            onClick={() => {
                                              playClickSound(600, "sine");
                                              setSelectedCategory("COMUNIDADE");
                                              setSelectedBranch(sub.label);
                                              setNavRamosOpen(false);
                                              const el = document.getElementById("main-content-area") || document.getElementById("dynamic-regional-feed");
                                              if (el) el.scrollIntoView({ behavior: "smooth" });
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[10px] font-mono hover:bg-zinc-900 transition ${selectedBranch === sub.label ? "text-green-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                                          >
                                            {sub.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: MENU CASCATA - CIDADES (Juiz de Fora, Matias Barbosa) */}
                <div className="flex flex-col space-y-1.5 shrink-0 relative z-30">
                  <span className="text-[10px] font-mono tracking-widest text-[#22c55e] font-bold uppercase">
                    Menu Cascata Cidades:
                  </span>
                  
                  <div className="relative inline-block text-left w-full md:w-56">
                    {/* Trigger Button */}
                    <button
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className={`w-full px-4 py-2 bg-stone-950 hover:bg-zinc-900 border transition-all duration-300 rounded-xl text-xs font-display font-black uppercase tracking-wider flex items-center justify-between gap-2.5 ${
                        selectedCity 
                          ? "border-[#22c55e] text-[#22c55e] shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                          : "border-zinc-800 text-zinc-300 hover:border-zinc-750"
                      }`}
                      id="cidades-cascade-dropdown-button"
                      title="Clique para filtrar notícias pela cidade escolhida"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className={`w-3.5 h-3.5 ${selectedCity ? "text-green-400" : "text-zinc-500"}`} />
                        {selectedCity ? selectedCity : "Filtrar por Cidade"}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${cityDropdownOpen ? "rotate-180 text-green-400" : "text-zinc-500"}`} />
                    </button>

                    {/* Cascading Options Menu */}
                    {cityDropdownOpen && (
                      <>
                        {/* Backdrop blocker to dismiss dropdown */}
                        <div className="fixed inset-0 z-30" onClick={() => setCityDropdownOpen(false)} />
                        
                        <div className="absolute right-0 mt-2 w-full md:w-56 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-zinc-800/80 bg-stone-950/95 backdrop-blur-xl z-40 overflow-hidden animate-fade-in">
                          {/* Title banner */}
                          <div className="bg-zinc-900 px-3.5 py-2 border-b border-zinc-800/50 text-[8px] font-mono text-zinc-500 font-bold tracking-widest uppercase">
                            Cidades do Sudeste
                          </div>

                          <div className="py-1 max-h-64 overflow-y-auto">
                            {/* Standard Reset button */}
                            <button
                              onClick={() => {
                                playClickSound(600, "sine");
                                setSelectedCity(null);
                                setCityDropdownOpen(false);
                                const el = document.getElementById("dynamic-regional-feed") || document.getElementById("main-content-area");
                                if (el) el.scrollIntoView({ behavior: "smooth" });
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-xs font-mono font-bold tracking-wide transition flex items-center justify-between ${
                                selectedCity === null 
                                  ? "bg-[#22c55e]/10 text-green-400" 
                                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                              }`}
                            >
                              <span>🌍 TODA A MARCA / TODAS AS CIDADES</span>
                              {selectedCity === null && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)]" />}
                            </button>

                            {/* City list looping */}
                            {CITIES_LIST.map((city) => {
                              const isSelected = selectedCity === city;
                              return (
                                <button
                                  key={city}
                                  onClick={() => {
                                    playClickSound(600, "sine");
                                    setSelectedCity(city);
                                    setCityDropdownOpen(false);
                                    const el = document.getElementById("dynamic-regional-feed") || document.getElementById("main-content-area");
                                    if (el) el.scrollIntoView({ behavior: "smooth" });
                                  }}
                                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition flex items-center justify-between ${
                                    isSelected 
                                      ? "bg-[#22c55e]/10 text-green-400 font-extrabold border-l-2 border-[#22c55e]" 
                                      : "text-zinc-300 hover:bg-zinc-900/60 hover:text-white"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className={`w-1 h-1 rounded-full ${isSelected ? "bg-green-400" : "bg-zinc-700"}`} />
                                    {city}
                                  </span>
                                  {isSelected && <span className="text-[10px] font-mono text-green-400">Ativa</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* FLOATING SUB-SECTIONS ROUTER FOR MENU ITEMS (Quem Somos, Objetivos, Onde Estamos, Parceiros, Contato) */}
              <AnimatePresence>
                {activeSection && activeSection !== "GALERIA" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-6 rounded-2xl border ${
                      isDarkMode ? "bg-stone-950 border-pink-500/30 text-white" : "bg-white border-stone-200 text-stone-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping"></span>
                        <h3 className="font-display font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-green-400 uppercase tracking-widest">
                          SEÇÃO INFORMATIVA: {activeSection}
                        </h3>
                      </div>
                      <button
                        onClick={() => setActiveSection(null)}
                        className="text-xs bg-zinc-900 px-2 py-0.5 text-zinc-400 hover:text-white rounded"
                      >
                        Fechar ×
                      </button>
                    </div>

                    {/* Rendering the appropriate content requested */}
                    {activeSection === "QUEM SOMOS" && (
                      <div className="space-y-6">
                        
                        {/* Dynamic Admin Upload Area inside Quem Somos */}
                        {isDirectEditingEnabled && (
                          <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/80 space-y-4 text-left animate-fade-in animate-duration-300">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-850 pb-2 gap-2">
                              <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-pink-550" />
                                <h5 className="font-display font-black text-xs uppercase tracking-wider text-white">
                                  Painel de Upload - Quem Somos
                                </h5>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Option 1: Profile picture */}
                              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/50 space-y-2.5">
                                <span className="text-[10px] font-mono text-zinc-350 uppercase block font-black">1. Foto Principal (Regina Simões)</span>
                                <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">Substitui o placeholder da idealizadora e host Regina Simões na biografia principal.</p>
                                
                                <label className="flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-pink-500/50 hover:bg-pink-500/5 rounded-xl p-3 cursor-pointer transition">
                                  <Camera className="w-4 h-4 text-pink-400" />
                                  <span className="text-[9px] text-zinc-400 font-mono uppercase font-black">Subir Foto de Capa</span>
                                  <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/webp" 
                                    className="hidden" 
                                    id="profile-pic-uploader"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                                        if (!allowedTypes.includes(file.type)) {
                                          toast.error("Formato não suportado! Envie apenas formatos JPG, PNG ou WEBP.");
                                          return;
                                        }
                                        const img = new Image();
                                        img.src = URL.createObjectURL(file);
                                        img.onload = () => {
                                          const canvas = document.createElement("canvas");
                                          let width = img.width;
                                          let height = img.height;
                                          const maxDimension = 1400; // safe pre-crop limit
                                          if (width > height && width > maxDimension) {
                                            height *= maxDimension / width;
                                            width = maxDimension;
                                          } else if (height > maxDimension) {
                                            width *= maxDimension / height;
                                            height = maxDimension;
                                          }
                                          canvas.width = width;
                                          canvas.height = height;
                                          const ctx = canvas.getContext("2d");
                                          if (ctx) {
                                            ctx.drawImage(img, 0, 0, width, height);
                                            const b64 = canvas.toDataURL("image/jpeg", 0.85);
                                            setAppCropperSource(b64);
                                            setCropperTargetMode("profile");
                                            setAppCropperOpen(true);
                                          }
                                        };
                                      }
                                    }}
                                  />
                                </label>

                                <div className="space-y-1 mt-2">
                                  <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block">Ou Cole o LINK DIRETO da Imagem (com final .jpg ou .png):</span>
                                  <input 
                                    type="text"
                                    placeholder="Exemplo: https://i.ibb.co/12345/foto.jpg"
                                    value={quemSomosProfilePic}
                                    onChange={(e) => {
                                      let val = e.target.value;
                                      if (val && val.includes("ibb.co/") && !val.includes("i.ibb.co") && !val.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                                          toast.warning("Atenção: Você colou o link da página do ImgBB. Para funcionar, precisa ser o 'Link Direto' que termina em .jpg ou .png!");
                                      } else {
                                        setQuemSomosProfilePic(val);
                                        localStorage.setItem("quem_somos_profile_pic", val);
                                        setCmsSaveStatus("saving");
                                        setTimeout(() => setCmsSaveStatus("saved"), 700);
                                      }
                                    }}
                                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500"
                                  />
                                </div>
                              </div>

                              {/* Option 2: Extra photos */}
                              <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800/50 space-y-2.5">
                                <span className="text-[10px] font-mono text-zinc-350 uppercase block font-black">2. Fotos Extras e Eventos</span>
                                <p className="text-[9px] text-zinc-500 font-mono leading-relaxed">Adiciona fotos de eventos e palestras para a seção Galeria de Atividades abaixo.</p>
                                
                                <div className="space-y-2.5">
                                  <input 
                                    type="text" 
                                    placeholder="Escrever legenda/nome do evento..."
                                    id="extra-photo-caption-input"
                                    className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-[9px] font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-green-500"
                                  />
                                  <label className="flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-green-550/50 hover:bg-green-500/5 rounded-xl p-3 cursor-pointer transition">
                                    <Plus className="w-4 h-4 text-green-400" />
                                    <span className="text-[9px] text-zinc-400 font-mono uppercase font-black">Adicionar Imagem à Galeria</span>
                                    <input 
                                      type="file" 
                                      accept="image/png, image/jpeg, image/webp" 
                                      className="hidden" 
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                                          if (!allowedTypes.includes(file.type)) {
                                            toast.error("Formato não suportado! Envie apenas formatos JPG, PNG ou WEBP.");
                                            return;
                                          }
                                          const img = new Image();
                                          img.src = URL.createObjectURL(file);
                                          img.onload = () => {
                                            const canvas = document.createElement("canvas");
                                            let width = img.width;
                                            let height = img.height;
                                            const maxDimension = 1400; // safe pre-crop limit
                                            if (width > height && width > maxDimension) {
                                              height *= maxDimension / width;
                                              width = maxDimension;
                                            } else if (height > maxDimension) {
                                              width *= maxDimension / height;
                                              height = maxDimension;
                                            }
                                            canvas.width = width;
                                            canvas.height = height;
                                            const ctx = canvas.getContext("2d");
                                            if (ctx) {
                                              ctx.drawImage(img, 0, 0, width, height);
                                              const b64 = canvas.toDataURL("image/jpeg", 0.85);
                                              setAppCropperSource(b64);
                                              setCropperTargetMode("extra");
                                              setAppCropperOpen(true);
                                            }
                                          };
                                        }
                                      }}
                                    />
                                  </label>
                                  
                                  <div className="space-y-1">
                                    <span className="text-[8px] font-mono uppercase text-zinc-500 font-bold block">Ou Insira por Link/URL Hospedada:</span>
                                    <div className="flex gap-1">
                                      <input 
                                        type="text"
                                        id="extra-photo-url-input"
                                        placeholder="https://i.ibb.co/..."
                                        className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 font-bold"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const urlInput = document.getElementById("extra-photo-url-input") as HTMLInputElement;
                                          const captionInput = document.getElementById("extra-photo-caption-input") as HTMLInputElement;
                                          const url = urlInput ? urlInput.value.trim() : "";
                                          const caption = captionInput ? captionInput.value.trim() : "";
                                          
                                          if (!url) {
                                            toast.warning("Insira a URL da foto!");
                                            return;
                                          }
                                          
                                          const newPhoto = {
                                            id: `qs-${Date.now()}`,
                                            url: url,
                                            caption: caption || `Atividade ${new Date().toLocaleDateString("pt-BR")}`
                                          };

                                          const updated = [newPhoto, ...quemSomosGallery];
                                          setQuemSomosGallery(updated);
                                          localStorage.setItem("quem_somos_gallery", JSON.stringify(updated));
                                          
                                          fetch("/api/quem-somos-gallery", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ item: newPhoto })
                                          })
                                            .then((res) => res.json())
                                            .then((publishedItem) => {
                                              const updatedServ = [publishedItem, ...quemSomosGallery.filter((g: any) => g.id !== newPhoto.id)];
                                              setQuemSomosGallery(updatedServ);
                                              localStorage.setItem("quem_somos_gallery", JSON.stringify(updatedServ));
                                            })
                                            .catch((err) => console.error("Error setting gallery image", err));
                                          
                                          if (urlInput) urlInput.value = "";
                                          if (captionInput) captionInput.value = "";
                                          setCmsSaveStatus("saving");
                                          setTimeout(() => setCmsSaveStatus("saved"), 700);
                                        }}
                                        className="px-3 bg-green-550 hover:bg-green-500 text-black rounded-lg text-[9px] font-mono uppercase font-black transition shrink-0"
                                      >
                                        Inserir
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                          {/* Photo Placeholder Card or Uploaded Photo */}
                          <div className="md:col-span-4 space-y-3">
                            {quemSomosProfilePic ? (
                              <div className="group relative aspect-[3/4] w-full rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                                <PositionableImage 
                                  src={quemSomosProfilePic} 
                                  alt="Regina Simões" 
                                  className="w-full h-full object-cover group-hover:scale-102 transition-all duration-500" 
                                  storageKey="quem-somos-profile-regina" 
                                  editable={isDirectEditingEnabled} 
                                  fallback={
                                    <div className="absolute inset-0 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-600 gap-3 border border-dashed border-white/10 m-1 rounded-xl">
                                      <Camera className="w-8 h-8 opacity-50" />
                                      <span className="font-mono text-[9px] tracking-widest uppercase text-center px-2">Erro de<br/>carregamento</span>
                                    </div>
                                  }
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end text-left pointer-events-none">
                                  <span className="text-xs font-mono text-white uppercase tracking-widest block font-black">
                                    REGINA SIMÕES
                                  </span>
                                  <span className="text-[9px] font-mono text-pink-400 block uppercase">
                                    Idealizadora & Host 🎙️
                                  </span>
                                </div>
                                
                                {isDirectEditingEnabled && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      playClickSound(500, "sine");
                                      {
                                        setQuemSomosProfilePic("");
                                        localStorage.removeItem("quem_somos_profile_pic");
                                        localStorage.removeItem("quem-somos-profile-regina_uploaded_src");
                                        localStorage.removeItem("quem-somos-profile-regina");
                                        
                                        // Delete from profile pic route
                                        fetch("/api/profile-pic", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ image: "" })
                                        }).catch(err => console.error("Erro ao deletar no servidor:", err));

                                        // Delete from positionable images route too
                                        fetch("/api/update-positionable-image", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            key: "quem-somos-profile-regina",
                                            val: null,
                                            coords: null
                                          })
                                        }).catch(err => console.error("Erro ao resetar no servidor:", err));

                                        // Notify updates
                                        window.dispatchEvent(new Event("image_updated"));
                                      }
                                    }}
                                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-650/90 hover:bg-red-500 text-white transition-colors border border-red-700/40 shadow-lg"
                                    title="Remover foto"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div 
                                onClick={() => {
                                  if (isDirectEditingEnabled) {
                                    const up = document.getElementById("profile-pic-uploader") as HTMLInputElement;
                                    if (up) up.click();
                                  }
                                }}
                                className={`group relative aspect-[3/4] w-full rounded-2xl bg-zinc-900 border border-dashed border-zinc-850 flex flex-col items-center justify-center gap-3 overflow-hidden ${
                                  isDirectEditingEnabled ? "cursor-pointer hover:border-pink-500 hover:bg-zinc-800/20 transition-all duration-300" : ""
                                }`}
                              >
                                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-green-500/5 opacity-60" />
                                <div className="w-16 h-16 rounded-full bg-black/80 border border-zinc-850 flex items-center justify-center text-zinc-450 group-hover:scale-105 transition-all duration-300 shadow-xl">
                                  <User className="w-8 h-8 text-pink-500" />
                                </div>
                                <div className="text-center space-y-1 relative z-10 px-4">
                                  <span className="text-xs font-mono text-zinc-300 uppercase tracking-widest block font-bold">
                                    REGINA SIMÕES
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-500 block uppercase">
                                    {isDirectEditingEnabled ? "Clique para adicionar foto 📸" : "Foto em breve 📸"}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-900 text-center space-y-1">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">CONEXÃO DIRETA</span>
                              <div className="flex justify-center gap-2">
                                <span className="text-xs font-bold text-zinc-300 font-mono">Regina Simões</span>
                              </div>
                            </div>
                          </div>

                          {/* Biography Content Cards */}
                          <div className="md:col-span-8 space-y-4">
                            <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-2">
                              <Sparkles className="w-4 h-4 text-pink-550 shrink-0" />
                              <h4 className="font-display font-black text-sm uppercase tracking-wider text-white">Idealizadora & Host</h4>
                            </div>
                            <div className="space-y-3.5 text-xs text-zinc-350 leading-relaxed font-sans text-left">
                              {isDirectEditingEnabled ? (
                                <div className="space-y-4 bg-zinc-950/65 p-4 rounded-2xl border border-zinc-800/80">
                                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                                    <span className="text-[9px] font-mono font-black text-[#22c55e] uppercase tracking-wider">✍️ MODO EDIÇÃO ATIVO</span>
                                    <span className="text-[8px] font-mono text-zinc-500 uppercase">salvamento automático</span>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-1">Biografia - Parágrafo 1</label>
                                      <textarea
                                        value={portalPagesConfig.quemSomosP1}
                                        onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, quemSomosP1: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-green-500 transition font-sans leading-relaxed"
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-1">Biografia - Parágrafo 2</label>
                                      <textarea
                                        value={portalPagesConfig.quemSomosP2}
                                        onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, quemSomosP2: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-green-500 transition font-sans leading-relaxed"
                                        rows={2}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-1">Biografia - Parágrafo 3</label>
                                      <textarea
                                        value={portalPagesConfig.quemSomosP3}
                                        onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, quemSomosP3: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-green-500 transition font-sans leading-relaxed"
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-1">Biografia - Parágrafo 4</label>
                                      <textarea
                                        value={portalPagesConfig.quemSomosP4}
                                        onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, quemSomosP4: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-green-500 transition font-sans leading-relaxed"
                                        rows={3}
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-1">Frase de Destaque / Citação</label>
                                      <input
                                        type="text"
                                        value={portalPagesConfig.quemSomosQuote}
                                        onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, quemSomosQuote: e.target.value })}
                                        className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-green-400 focus:outline-none focus:border-green-500 transition font-mono italic"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="bg-zinc-900/20 hover:bg-zinc-900/30 p-4 border border-zinc-900/50 rounded-2xl transition">
                                    {portalPagesConfig.quemSomosP1}
                                  </p>
                                  <p className="bg-zinc-900/20 hover:bg-zinc-900/30 p-4 border border-zinc-900/50 rounded-2xl transition">
                                    {portalPagesConfig.quemSomosP2}
                                  </p>
                                  <p className="bg-zinc-900/20 hover:bg-zinc-900/30 p-4 border border-zinc-900/50 rounded-2xl transition">
                                    {portalPagesConfig.quemSomosP3}
                                  </p>
                                  <p className="bg-zinc-900/20 hover:bg-zinc-900/30 p-4 border border-zinc-900/50 rounded-2xl transition">
                                    {portalPagesConfig.quemSomosP4}
                                  </p>
                                  <p className="border-l-2 border-green-500 pl-3 leading-relaxed text-zinc-400 italic font-mono text-[11px]">
                                    "{portalPagesConfig.quemSomosQuote}"
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Extra Photos / Gallery Section inside Quem Somos */}
                        <div className="border-t border-zinc-800/40 pt-6 space-y-4 text-left">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Camera className="w-4 h-4 text-pink-500 shrink-0" />
                              <h4 className="font-display font-black text-xs uppercase tracking-widest text-white">🎞️ Galeria Quem Somos / Atividades</h4>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">{quemSomosGallery.length} Fotos Cadastradas</span>
                              
                              {/* ADMIN STRIP / CONTROLS FOR GALLERY */}
                              {isDirectEditingEnabled && (
                                <div className="flex items-center gap-1.5 bg-pink-950/40 border border-pink-500/40 px-2 py-1 rounded-xl shadow-sm">
                                  <button
                                    type="button"
                                    onClick={handleOpenAddGalleryPhoto}
                                    className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-[10px] uppercase flex items-center gap-1 transition shadow hover:scale-105 active:scale-95"
                                    title="Adicionar nova foto à galeria"
                                  >
                                    <Sparkles className="w-3 h-3" /> + Adicionar Foto
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleResetGalleryPhotos}
                                    className="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-mono text-[10px] flex items-center gap-1 transition border border-zinc-800"
                                    title="Restaurar fotos originais"
                                  >
                                    <RefreshCw className="w-2.5 h-2.5" /> Padrão
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {quemSomosGallery.length === 0 ? (
                            <div className="p-8 rounded-2xl bg-zinc-950/40 border border-zinc-900/80 text-center text-[10px] text-zinc-500 font-mono tracking-wide flex flex-col items-center gap-3">
                              <span>Nenhuma foto adicional ou de evento cadastrada.</span>
                              {isDirectEditingEnabled && (
                                <button
                                  type="button"
                                  onClick={handleOpenAddGalleryPhoto}
                                  className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 transition shadow"
                                >
                                  <Sparkles className="w-3.5 h-3.5" /> Adicionar Primeira Foto
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                              {quemSomosGallery.map((p) => (
                                <div 
                                  key={p.id} 
                                  className="group relative aspect-[4/3] rounded-xl bg-zinc-950 border border-zinc-900 overflow-hidden cursor-pointer transition shadow-md hover:shadow-xl hover:border-pink-500/30"
                                  onClick={() => {
                                    playClickSound(600, "sine");
                                    setLightboxImage(p.url);
                                  }}
                                >
                                  <img 
                                    src={p.url} 
                                    alt={p.caption} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80";
                                    }}
                                  />
                                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-2.5 text-left pointer-events-none">
                                    <p className="text-[10px] font-mono font-bold text-zinc-100 truncate uppercase tracking-tight drop-shadow-md">{p.caption}</p>
                                  </div>

                                  {/* EDIT & DELETE BUTTONS FOR ADMIN */}
                                  {isDirectEditingEnabled && (
                                    <div 
                                      className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditGalleryPhoto(p);
                                        }}
                                        className="p-1.5 rounded-lg bg-pink-600 text-white hover:bg-pink-500 border border-pink-700/40 shadow-md transition hover:scale-110"
                                        title="Editar foto e legenda"
                                      >
                                        <SlidersHorizontal className="w-3 h-3" />
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          playClickSound(500, "sine");
                                          if (confirm(`Deseja realmente excluir a foto "${p.caption}"?`)) {
                                            const updated = quemSomosGallery.filter((item) => item.id !== p.id);
                                            fetch(`/api/quem-somos-gallery/${p.id}`, { method: "DELETE" }).catch(() => {});
                                            setQuemSomosGallery(updated);
                                            localStorage.setItem("quem_somos_gallery", JSON.stringify(updated));
                                            toast.success("Foto removida da galeria.");
                                          }
                                        }}
                                        className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 border border-red-700/40 shadow-md transition hover:scale-110"
                                        title="Excluir foto"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* MODAL FOR ADDING / EDITING GALLERY PHOTO */}
                        {(isAddingGalleryItem || !!editingGalleryItem) && (
                          <div 
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => {
                              setIsAddingGalleryItem(false);
                              setEditingGalleryItem(null);
                            }}
                          >
                            <div 
                              className="w-full max-w-md bg-zinc-950 border-2 border-pink-500/40 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                                    <Camera className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-display font-black text-base text-white uppercase">
                                      {editingGalleryItem ? "Editar Foto da Galeria" : "Adicionar Foto à Galeria"}
                                    </h4>
                                    <p className="text-[11px] text-zinc-400 font-mono">
                                      Galeria Quem Somos / Atividades
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingGalleryItem(false);
                                    setEditingGalleryItem(null);
                                  }}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Preview */}
                              {galleryFormUrl ? (
                                <div className="flex flex-col items-center gap-2 p-3 bg-zinc-900/80 rounded-2xl border border-zinc-800">
                                  <div className="w-full h-40 rounded-xl overflow-hidden border border-pink-500/40 shadow bg-zinc-950">
                                    <img
                                      src={galleryFormUrl}
                                      alt="Prévia"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80";
                                      }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-zinc-400">Prévia da imagem</span>
                                </div>
                              ) : null}

                              {/* Upload from device */}
                              <div className="space-y-2">
                                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                                  1. Carregar Imagem do Dispositivo
                                </label>
                                <input
                                  type="file"
                                  ref={galleryFileInputRef}
                                  onChange={handleUploadGalleryFile}
                                  accept="image/*"
                                  className="hidden"
                                />
                                <button
                                  type="button"
                                  onClick={() => galleryFileInputRef.current?.click()}
                                  disabled={isGalleryUploading}
                                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition hover:scale-[1.01] active:scale-[0.99]"
                                >
                                  {isGalleryUploading ? (
                                    <>
                                      <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
                                      <span>Enviando Foto...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4 text-pink-400" />
                                      <span>Escolher Arquivo do Dispositivo</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Link URL */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                                  2. Ou Link / URL Direto da Imagem
                                </label>
                                <input
                                  type="text"
                                  value={galleryFormUrl}
                                  onChange={(e) => setGalleryFormUrl(e.target.value)}
                                  placeholder="https://exemplo.com/foto.jpg"
                                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
                                />
                              </div>

                              {/* Caption / Title */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                                  Título / Legenda da Atividade
                                </label>
                                <input
                                  type="text"
                                  value={galleryFormCaption}
                                  onChange={(e) => setGalleryFormCaption(e.target.value)}
                                  placeholder="Ex: Gravação no Estúdio do Podcast"
                                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500 font-mono"
                                />
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsAddingGalleryItem(false);
                                    setEditingGalleryItem(null);
                                  }}
                                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs font-bold transition"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={handleSaveGalleryPhoto}
                                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition shadow-lg hover:scale-105 active:scale-95"
                                >
                                  <Check className="w-4 h-4" /> Salvar Foto
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Conselho de Embaixadores Oficiais Showcase inside Quem Somos */}
                        <div className="border-t border-zinc-800/40 pt-7 space-y-5 text-left">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-pink-500 shrink-0" />
                                <h4 className="font-display font-black text-sm uppercase tracking-widest text-white">🤝 Nosso Conselho de Embaixadores Oficiais</h4>
                              </div>
                              <p className="text-zinc-500 text-[10px] font-mono mt-1">
                                Líderes regionais, multiplicadores e especialistas de destaque na nossa Zona da Mata.
                              </p>
                            </div>
                            <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg font-mono uppercase tracking-wider shrink-0">
                              {quemSomosAmbassadors.length} Embaixadores Ativos
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {quemSomosAmbassadors.map((ambassador, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                whileHover={{ y: -4, scale: 1.025 }}
                                transition={{ 
                                  opacity: { duration: 0.4, ease: "easeOut" },
                                  y: { type: "spring", stiffness: 300, damping: 20 },
                                  scale: { type: "spring", stiffness: 300, damping: 20 }
                                }}
                                className="group bg-stone-950 hover:bg-stone-900/40 border border-zinc-900 hover:border-pink-500/25 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:shadow-pink-500/[0.03] text-left cursor-pointer transition-colors duration-300"
                              >
                                <div className="space-y-4">
                                  {/* Visual rendering of profile image or placeholder with upload capability */}
                                  <div className="relative w-full aspect-[4/3] rounded-2xl bg-zinc-900/30 border border-dashed border-zinc-850 flex flex-col items-center justify-center gap-2.5 overflow-hidden group-hover:border-pink-500/20 transition-all duration-300">
                                    <PositionableImage
                                      src={ambassador.photoUrl}
                                      alt={ambassador.name}
                                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 z-10"
                                      referrerPolicy="no-referrer"
                                      storageKey={`ambassador-pic-${idx}-${ambassador.name}`}
                                      editable={isDirectEditingEnabled}
                                      fallback={
                                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-2.5 z-0">
                                          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/5 via-transparent to-red-500/5 opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                          
                                          <div className="w-12 h-12 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-pink-400 group-hover:border-pink-500/30 group-hover:scale-105 transition-all duration-300 z-10 pointer-events-none">
                                            <Upload className="w-5 h-5 text-zinc-500 group-hover:text-pink-400" />
                                          </div>
                                          
                                          <div className="text-center space-y-0.5 relative z-10 px-2 pointer-events-none">
                                            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold group-hover:text-zinc-200 transition-colors">
                                              FOTO EM BREVE 📸
                                            </span>
                                            <span className="text-[8px] font-mono text-zinc-650 block uppercase">
                                              Espaço reservado
                                            </span>
                                          </div>
                                        </div>
                                      }
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <h4 className="font-display font-black text-sm uppercase leading-tight tracking-tight text-white group-hover:text-pink-400 transition-colors duration-250 animate-fade-in">
                                      {ambassador.name}
                                    </h4>
                                    <p className="text-zinc-400 text-xs font-semibold leading-relaxed flex items-start gap-1.5 pt-1">
                                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{ambassador.specialty}</span>
                                    </p>
                                  </div>

                                  {/* Collapsible Details Panel */}
                                  <button
                                    onClick={() => {
                                      playClickSound(600, "sine");
                                      setExpandedQuemSomosCardIdx(expandedQuemSomosCardIdx === idx ? null : idx);
                                    }}
                                    className="w-full mt-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 hover:text-pink-400 text-zinc-400 text-[10px] font-mono uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 transition-all border border-zinc-800/80"
                                  >
                                    <span>{expandedQuemSomosCardIdx === idx ? "Ocultar Informações" : "Ver Perfil Completo"}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${expandedQuemSomosCardIdx === idx ? "rotate-180 text-pink-400" : ""}`} />
                                  </button>

                                  <AnimatePresence>
                                    {expandedQuemSomosCardIdx === idx && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pt-3 border-t border-zinc-900 space-y-3 text-xs text-zinc-300 font-sans overflow-hidden"
                                      >
                                        {/* 1. Nome completo */}
                                        <div>
                                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                            <User className="w-3 h-3 text-pink-500" /> 1. Nome Completo
                                          </span>
                                          <p className="font-semibold text-white mt-0.5">{ambassador.fullName || ambassador.name}</p>
                                        </div>

                                        {/* 4. Cargo de embaixador */}
                                        <div>
                                          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 4. Cargo de Embaixador
                                          </span>
                                          <p className="text-zinc-200 mt-0.5 font-medium">{ambassador.roleAsAmbassador || ambassador.specialty}</p>
                                        </div>

                                        {/* 3. Formação Acadêmica */}
                                        {ambassador.academicBackground && (
                                          <div>
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                              <BookOpen className="w-3 h-3 text-blue-400" /> 3. Formação Acadêmica
                                            </span>
                                            <p className="text-zinc-350 text-[11px] leading-relaxed mt-0.5 whitespace-pre-line">{ambassador.academicBackground}</p>
                                          </div>
                                        )}

                                        {/* 2. Função como embaixador */}
                                        {ambassador.functionAsAmbassador && (
                                          <div>
                                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                                              <Compass className="w-3 h-3 text-pink-400" /> 2. Função como Embaixador
                                            </span>
                                            <p className="text-zinc-350 text-[11px] leading-relaxed mt-0.5 whitespace-pre-line">{ambassador.functionAsAmbassador}</p>
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-900 mt-4 h-9">
                                  <div className="flex items-center gap-1.5">
                                    {isDirectEditingEnabled && (
                                      <div className="flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                        <MapPin className="w-3 h-3 text-emerald-500" />
                                        <span className="text-[10px] font-mono text-zinc-400">
                                          {ambassador.city || "Juiz de Fora"}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {editingInstaIdx === idx ? (
                                    <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-xl border border-pink-500/30">
                                      <span className="text-pink-500 font-mono text-[11px]">@</span>
                                      <input
                                        type="text"
                                        className="bg-transparent border-none text-white text-[11px] py-0.5 rounded w-20 focus:outline-none font-mono"
                                        value={tempInstaText.replace("@", "")}
                                        onChange={(e) => setTempInstaText("@" + e.target.value.replace("@", ""))}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                            const val = tempInstaText.trim();
                                            const updated = [...quemSomosAmbassadors];
                                            updated[idx] = { ...updated[idx], instagram: val.startsWith("@") ? val : "@" + val };
                                            setQuemSomosAmbassadors(updated);
                                            localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                                            window.dispatchEvent(new Event("image_updated"));
                                            setEditingInstaIdx(null);
                                            playClickSound?.(440, "sine");
                                          } else if (e.key === "Escape") {
                                            setEditingInstaIdx(null);
                                          }
                                        }}
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => {
                                          const val = tempInstaText.trim();
                                          const updated = [...quemSomosAmbassadors];
                                          updated[idx] = { ...updated[idx], instagram: val.startsWith("@") ? val : "@" + val };
                                          setQuemSomosAmbassadors(updated);
                                          localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                                          window.dispatchEvent(new Event("image_updated"));
                                          setEditingInstaIdx(null);
                                          playClickSound?.(440, "sine");
                                        }}
                                        className="text-emerald-400 hover:text-emerald-300 p-0.5"
                                        title="Salvar"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingInstaIdx(null)}
                                        className="text-rose-400 hover:text-rose-300 p-0.5"
                                        title="Cancelar"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5">
                                      {isDirectEditingEnabled ? (
                                        <button
                                          onClick={() => {
                                            playClickSound(600, "sine");
                                            setEditingInstaIdx(idx);
                                            setTempInstaText(ambassador.instagram || "@");
                                          }}
                                          className="text-zinc-500 hover:text-pink-400 transition-colors p-1 flex items-center gap-1.5 group/insta cursor-pointer bg-zinc-900/40 border border-zinc-800/80 hover:border-pink-500/30 rounded-lg px-2 py-0.5"
                                          title="Clique para editar o @ do Instagram"
                                        >
                                          <Instagram className="w-3.5 h-3.5 text-zinc-400 group-hover:text-pink-400" />
                                          <span className="text-[10px] font-mono text-zinc-400 group-hover:text-pink-400">
                                            {ambassador.instagram}
                                          </span>
                                          <span className="text-[8px] bg-zinc-850 text-zinc-500 group-hover:text-pink-400 px-1 py-0.2 rounded font-mono uppercase">
                                            Editar
                                          </span>
                                        </button>
                                      ) : (
                                        <a
                                          href={`https://instagram.com/${ambassador.instagram.replace("@", "")}`}
                                          target="_blank"
                                          referrerPolicy="no-referrer"
                                          onClick={() => playClickSound(550, "triangle")}
                                          className="text-zinc-500 hover:text-pink-400 transition-colors p-1 flex items-center gap-1.5"
                                          title={`Visitar Instagram de ${ambassador.name}`}
                                        >
                                          <Instagram className="w-4 h-4 text-zinc-400 hover:text-pink-400" />
                                          <span className="text-[10px] font-mono text-zinc-400 hover:text-pink-400">
                                            {ambassador.instagram}
                                          </span>
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {isDirectEditingEnabled && (
                                  <div className="flex gap-2 w-full mt-3 pt-3 border-t border-zinc-900/60">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        playClickSound(600, "sine");
                                        handleOpenAmbassadorEdit(ambassador, idx);
                                      }}
                                      className="flex-grow px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 hover:text-pink-400 text-zinc-300 text-[10px] font-mono uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 transition-all border border-zinc-800/80"
                                    >
                                      <Edit className="w-3.5 h-3.5 text-pink-500" />
                                      <span>Editar Perfil</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        {
                                          const updated = quemSomosAmbassadors.filter((_, i) => i !== idx);
                                          setQuemSomosAmbassadors(updated);
                                          localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                                          window.dispatchEvent(new Event("image_updated"));
                                          playClickSound(400, "sine");
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-950 text-red-400 hover:text-red-300 border border-red-500/10 rounded-xl transition flex items-center justify-center"
                                      title="Remover Embaixador"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Lightbox Modal */}
                        {lightboxImage && (
                          <div 
                            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
                            onClick={() => { playClickSound(500, "sine"); setLightboxImage(null); }}
                          >
                            <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800">
                              <img src={lightboxImage} alt="Preview Grande" className="object-contain max-h-[85vh] mx-auto rounded-xl" />
                              <button 
                                type="button"
                                onClick={() => setLightboxImage(null)}
                                className="absolute top-4 right-4 bg-black/80 hover:bg-zinc-900 border border-zinc-700/50 p-2 rounded-full text-white"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                    {activeSection === "OBJETIVOS" && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Card 1: Portal */}
                        <div className="p-5 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-850 hover:border-green-500/20 rounded-2xl transition-all duration-300 space-y-2.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/40">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 shadow-sm">
                              <Globe className="w-4 h-4" />
                            </div>
                            <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                              Portal de Negócios e Notícias
                            </h4>
                          </div>
                          {isDirectEditingEnabled ? (
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono font-black text-green-400 uppercase">Editar Texto do Portal:</span>
                              <textarea
                                value={portalPagesConfig.objetivosPortal}
                                onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, objetivosPortal: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-[11px] text-white focus:outline-none focus:border-green-500 transition leading-relaxed"
                                rows={4}
                              />
                            </div>
                          ) : (
                            <p className="text-[11px] leading-relaxed text-zinc-300">
                              {portalPagesConfig.objetivosPortal}
                            </p>
                          )}
                          <p className="text-[10px] leading-relaxed text-zinc-500 italic">
                            Mais do que um canal de notícias, o portal busca gerar conexões, abrir portas para novos negócios e dar visibilidade para histórias inspiradoras, marcas, projetos e profissionais que estão transformando suas realidades através do conhecimento e da ação.
                          </p>
                        </div>

                        {/* Card 2: Podcast */}
                        <div className="p-5 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-850 hover:border-pink-500/20 rounded-2xl transition-all duration-300 space-y-2.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/40">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 shadow-sm">
                              <Mic className="w-4 h-4" />
                            </div>
                            <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                              Podcast “Do Começo ao Topo”
                            </h4>
                          </div>
                          {isDirectEditingEnabled ? (
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono font-black text-pink-400 uppercase">Editar Texto do Podcast:</span>
                              <textarea
                                value={portalPagesConfig.objetivosPodcast}
                                onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, objetivosPodcast: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-[11px] text-white focus:outline-none focus:border-green-500 transition leading-relaxed"
                                rows={4}
                              />
                            </div>
                          ) : (
                            <p className="text-[11px] leading-relaxed text-zinc-300">
                              {portalPagesConfig.objetivosPodcast}
                            </p>
                          )}
                          <p className="text-[10px] leading-relaxed text-zinc-500 italic">
                            Cada episódio é pensado para levar conhecimento, experiências e aprendizados que possam incentivar pessoas a acreditarem no seu potencial, desenvolverem seus negócios e crescerem com propósito. O podcast também cria um espaço de visibilidade para empresários, empreendedores e profissionais compartilharem suas trajetórias, desafios e conquistas, fortalecendo conexões e oportunidades.
                          </p>
                        </div>

                        {/* Card 3: Comunidade Aceleradora */}
                        <div className="p-5 bg-zinc-900/50 hover:bg-zinc-900/80 border border-zinc-850 hover:border-emerald-500/20 rounded-2xl transition-all duration-300 space-y-2.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/40">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-sm">
                              <Users className="w-4 h-4" />
                            </div>
                            <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                              Comunidade Aceleradora
                            </h4>
                          </div>
                          {isDirectEditingEnabled ? (
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono font-black text-emerald-400 uppercase">Editar Texto da Comunidade:</span>
                              <textarea
                                value={portalPagesConfig.objetivosComunidade}
                                onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, objetivosComunidade: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-[11px] text-white focus:outline-none focus:border-green-500 transition leading-relaxed"
                                rows={4}
                              />
                            </div>
                          ) : (
                            <p className="text-[11px] leading-relaxed text-zinc-300">
                              {portalPagesConfig.objetivosComunidade}
                            </p>
                          )}
                          <p className="text-[10px] leading-relaxed text-zinc-500 italic">
                            O propósito da comunidade é acelerar negócios, fortalecer marcas, desenvolver liderança e criar um ecossistema colaborativo onde todos possam crescer juntos através do conhecimento e das conexões certas.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeSection === "ONDE ESTAMOS" && (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                        <div className="lg:col-span-5 flex flex-col justify-between space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850/50">
                          <div className="space-y-3 text-left">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/25">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                              <span className="text-[9px] font-mono text-green-400 font-extrabold uppercase tracking-wider">Mapa Interativo Oficial</span>
                            </div>
                            
                            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">
                              Rede Do Começo ao Topo
                            </h4>
                            
                            <p className="text-xs text-zinc-350 leading-relaxed font-sans">
                              Navegue pelo nosso ecossistema de conexões. Nossa redação física, estúdios de podcast de alta fidelidade e núcleos regionais de embaixadores e parceiros estão mapeados para facilitar o seu acesso.
                            </p>
                            
                            {isDirectEditingEnabled ? (
                              <div className="space-y-3 pt-3 border-t border-zinc-850/60 bg-zinc-950/65 p-4 rounded-xl border border-zinc-800/80 mt-3">
                                <span className="text-[9px] font-mono font-black text-[#22c55e] uppercase tracking-wider block border-b border-zinc-900 pb-1 flex items-center gap-1.5">✍️ EDITAR ENDEREÇO & MAPA</span>
                                
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Edifício Comercial</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.enderecoEdificio}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, enderecoEdificio: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Rua / Sala</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.enderecoRua}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, enderecoRua: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Bairro / CEP</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.enderecoBairro}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, enderecoBairro: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Complemento</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.enderecoComplemento}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, enderecoComplemento: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">E-mail de Contato</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.contatoEmail}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, contatoEmail: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">URL Google Maps MapViewer</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.enderecoMapViewer}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, enderecoMapViewer: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Embed iframe URL</label>
                                    <input
                                      type="text"
                                      value={portalPagesConfig.enderecoMapEmbed}
                                      onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, enderecoMapEmbed: e.target.value })}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-[10px] text-white focus:outline-none focus:border-green-500 font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="space-y-3 pt-2 border-t border-zinc-850/60">
                                  <div className="text-xs text-[#22c55e] font-mono flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                                    <div className="space-y-1 text-zinc-300 font-sans text-xs">
                                      <strong className="text-[#22c55e] font-mono block text-[10px] uppercase tracking-wider">📍 Endereço Comercial:</strong>
                                      <p className="font-bold text-white">{portalPagesConfig.enderecoEdificio}</p>
                                      <p>{portalPagesConfig.enderecoRua}</p>
                                      <p>{portalPagesConfig.enderecoBairro}</p>
                                      <p className="text-[10px] text-zinc-500 italic mt-1 font-mono leading-tight">
                                        {portalPagesConfig.enderecoComplemento}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <p className="text-[10px] text-zinc-400 font-mono pt-1.5 border-t border-zinc-850/30">
                                    <span className="text-zinc-500 mr-1 font-bold">Contato:</span>
                                    {portalPagesConfig.contatoEmail}
                                  </p>
                                </div>
                                
                                <div className="pt-2 text-left">
                                  <a
                                    href={portalPagesConfig.enderecoMapViewer}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => playClickSound(700, "triangle")}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-[10px] font-mono font-bold text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition"
                                  >
                                    Abrir em Tela Cheia ↗
                                  </a>
                                </div>
                              </>
                            )}
                        </div>
                      </div>

                        {/* Embedded Google My Maps */}
                        <div className="lg:col-span-7 h-[380px] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative shadow-2xl group">
                          {/* Top sleek status rail */}
                          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/85 backdrop-blur border border-zinc-800 text-[9px] font-mono text-zinc-455 uppercase tracking-widest font-black flex items-center gap-1.5 shadow-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping"></span>
                            <span className="text-zinc-300">Mapa Carregado</span>
                          </div>

                          <iframe 
                            src={portalPagesConfig.enderecoMapEmbed}
                            width="100%" 
                            height="100%" 
                            className="border-0 w-full h-full grayscale-[15%] contrast-[110%] group-hover:grayscale-0 transition-all duration-700"
                            allowFullScreen
                            loading="lazy"
                            title="Mapa Onde Estamos - Do Começo ao Topo"
                          />
                        </div>
                      </div>
                    )}

                    {activeSection === "ANUNCIE AQUI" && (
                      <div className="space-y-4">
                        {isDirectEditingEnabled ? (
                          <div className="space-y-4 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-850 text-left">
                            <span className="text-[9px] font-mono font-black text-green-400 uppercase tracking-wider block border-b border-zinc-900 pb-1 text-center">✍️ EDITAR PÁGINA "ANUNCIE AQUI"</span>
                            
                            <div className="space-y-3">
                              <div>
                                <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Parágrafo de Introdução</label>
                                <textarea
                                  value={portalPagesConfig.anunciePara1}
                                  onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anunciePara1: e.target.value })}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                  rows={3}
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {/* Col 1 */}
                                <div className="space-y-2 p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                                  <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Título Seção 1</label>
                                  <input
                                    type="text"
                                    value={portalPagesConfig.anuncieSec1Title}
                                    onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieSec1Title: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-bold"
                                  />
                                  <label className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Texto Seção 1</label>
                                  <textarea
                                    value={portalPagesConfig.anuncieSec1Text}
                                    onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieSec1Text: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-green-500"
                                    rows={3}
                                  />
                                </div>
                                {/* Col 2 */}
                                <div className="space-y-2 p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                                  <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Título Seção 2</label>
                                  <input
                                    type="text"
                                    value={portalPagesConfig.anuncieSec2Title}
                                    onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieSec2Title: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-bold"
                                  />
                                  <label className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Texto Seção 2</label>
                                  <textarea
                                    value={portalPagesConfig.anuncieSec2Text}
                                    onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieSec2Text: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-green-500"
                                    rows={3}
                                  />
                                </div>
                                {/* Col 3 */}
                                <div className="space-y-2 p-3 bg-zinc-950 rounded-xl border border-zinc-900">
                                  <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">Título Seção 3</label>
                                  <input
                                    type="text"
                                    value={portalPagesConfig.anuncieSec3Title}
                                    onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieSec3Title: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500 font-bold"
                                  />
                                  <label className="text-[8px] font-mono font-black text-zinc-500 uppercase tracking-widest block mb-0.5">Texto Seção 3</label>
                                  <textarea
                                    value={portalPagesConfig.anuncieSec3Text}
                                    onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieSec3Text: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-green-500"
                                    rows={3}
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[8px] font-mono font-black text-zinc-400 uppercase tracking-widest block mb-0.5">E-mail Comercial de Anúncios</label>
                                <input
                                  type="text"
                                  value={portalPagesConfig.anuncieEmail}
                                  onChange={(e) => handleSavePortalPagesConfig({ ...portalPagesConfig, anuncieEmail: e.target.value })}
                                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs leading-relaxed text-zinc-350">
                              {portalPagesConfig.anunciePara1}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-[#22c55e] font-bold font-mono text-[11px] uppercase block">{portalPagesConfig.anuncieSec1Title}</span>
                                <p className="text-[10.5px] text-zinc-450 leading-relaxed">{portalPagesConfig.anuncieSec1Text}</p>
                              </div>
                              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-[#22c55e] font-bold font-mono text-[11px] uppercase block">{portalPagesConfig.anuncieSec2Title}</span>
                                <p className="text-[10.5px] text-zinc-450 leading-relaxed">{portalPagesConfig.anuncieSec2Text}</p>
                              </div>
                              <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1">
                                <span className="text-[#22c55e] font-bold font-mono text-[11px] uppercase block">{portalPagesConfig.anuncieSec3Title}</span>
                                <p className="text-[10.5px] text-zinc-450 leading-relaxed">{portalPagesConfig.anuncieSec3Text}</p>
                              </div>
                            </div>

                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2 mt-2">
                              <h4 className="text-xs font-bold text-green-400 uppercase tracking-wide">Fale Conosco para Anunciar</h4>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                Interessado em ver sua marca em destaque? Envie uma mensagem rápida no formulário de <strong>Contato</strong> em nosso menu superior ou nos envie um e-mail em <strong className="text-green-400">{portalPagesConfig.anuncieEmail}</strong> para solicitar nosso Media Kit completo com estatísticas de acessos.
                              </p>
                              <button
                                onClick={() => {
                                  setActiveSection("CONTATO");
                                  window.scrollTo({ top: 300, behavior: "smooth" });
                                }}
                                className="px-4 py-1.5 text-[10px] font-mono font-bold bg-green-500 hover:bg-green-400 text-black rounded uppercase transition"
                              >
                                Ir para o Formulário de Contato →
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {activeSection === "RSVP" ? (
                <RSVPEvent 
                  isAdmin={isDirectEditingEnabled}
                  onBack={() => {
                  setActiveSection(null);
                  setSelectedCategory(null);
                  if (window.location.hash === "#rsvp") {
                    window.location.hash = "";
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} />
              ) : activeSection === "CATEGORIAS" ? (
                <div className="py-12 md:py-20 px-4 max-w-7xl mx-auto min-h-[70vh] animate-fade-in mt-16">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tighter mb-4">
                      Categorias <span className="text-[#22c55e]">da Comunidade</span>
                    </h2>
                    <p className="text-zinc-400 font-mono text-sm max-w-xl mx-auto">
                      Explore os nossos fóruns organizados por ramos de atividade para conectar-se com profissionais do seu setor.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {COMMUNITY_CATEGORIES.map((cat) => (
                      <div 
                        key={cat.id} 
                        className="bg-stone-950/80 border border-zinc-800 rounded-2xl p-5 md:p-6 hover:border-green-500/50 hover:bg-zinc-900 transition-all cursor-pointer group shadow-xl"
                        onClick={() => {
                          setSelectedCategory("COMUNIDADE");
                          setSelectedBranch(cat.label);
                          setActiveSection(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        <div className="flex items-center gap-3 mb-4 border-b border-zinc-800/60 pb-3">
                          <span className="text-2xl text-green-400 group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wide">{cat.label}</h3>
                        </div>
                        <div className="space-y-2">
                          {cat.subcategories.map(sub => (
                            <div 
                              key={sub.id} 
                              className="text-[11px] font-mono font-bold text-zinc-500 hover:text-green-400 transition flex items-center gap-2 py-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCategory("COMUNIDADE");
                                setSelectedBranch(sub.label);
                                setActiveSection(null);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              <ChevronRight className="w-3 h-3 opacity-50 text-zinc-600" /> {sub.label}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSection === "GALERIA" ? (
                <div id="main-content-area">
                  <GlobalPhotoGallery isDarkMode={isDarkMode} isAdmin={isDirectEditingEnabled} CITIES_LIST={CITIES_LIST} />
                </div>
              ) : activeSection === "DEPOIMENTOS" ? (
                <div id="depoimentos-page-root" className="py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
                  <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-2">
                      <Sparkles className="w-3.5 h-3.5" /> Vozes Inspiradoras
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
                      Depoimentos & <span className="text-pink-500">Vozes Femininas</span>
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-400 font-mono max-w-2xl mx-auto leading-relaxed">
                      Conheça as histórias reais, conquistas e reflexões de mulheres líderes e empreendedoras que transformam seus ecossistemas.
                    </p>
                  </div>
                  <TestimonialShuffleCards isDarkMode={isDarkMode} isAdmin={isDirectEditingEnabled} />
                </div>
              ) : activeSection === "CONTATO" ? (
                <div id="contato-page-root" className="py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
                  <ContactSection 
                    isDarkMode={isDarkMode} 
                    isAdmin={isDirectEditingEnabled} 
                    portalPagesConfig={portalPagesConfig}
                    onSaveConfig={handleSavePortalPagesConfig}
                  />
                </div>
              ) : activeSection === "PARCEIROS" || selectedCategory === "PARCEIROS" || activeSection === "ANUNCIE AQUI" ? (
                <div id="parceiros-page-root" className="py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
                  <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-[10px] uppercase font-bold tracking-widest mb-2">
                      <Handshake className="w-3.5 h-3.5" /> Ecossistema Colaborativo
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-black text-white uppercase tracking-tight">
                      Nossos <span className="text-[#22c55e]">Parceiros Oficiais</span>
                    </h2>
                    <p className="text-xs md:text-sm text-zinc-400 font-mono max-w-2xl mx-auto leading-relaxed">
                      Empresas, instituições e marcas inovadoras que apoiam, capacitam e impulsionam o ecossistema regional e nacional.
                    </p>
                  </div>
                  <PartnersCarousel isAdmin={isDirectEditingEnabled} />
                </div>
              ) : selectedCategory === "PODCAST" || activeSection === "PODCAST" ? (
                <div id="podcast-page-root" className="py-8 px-4 max-w-7xl mx-auto space-y-6 animate-fade-in">
                  <PodcastSection 
                    isDarkMode={isDarkMode} 
                    user={user} 
                    directEditingMode={isDirectEditingEnabled}
                    onOpenPip={(video) => setPipVideo(video)}
                  />
                </div>
              ) : selectedCategory === "COMUNIDADE" ? (
                <div id="main-content-area">
                  <ComunidadeDashboard 
                    isDarkMode={isDarkMode} 
                    isAdmin={isDirectEditingEnabled} 
                    portalPagesConfig={portalPagesConfig}
                    user={user}
                    onLogout={handleLogout} 
                    externalBranchFilter={selectedBranch}
                  />
                </div>
              ) : selectedCategory === "EMBAIXADORES" ? (
                <div id="embaixadores-section-root">
                  <EmbaixadoresDashboard 
                    isDarkMode={isDarkMode} 
                    isAdmin={isDirectEditingEnabled} 
                    portalPagesConfig={portalPagesConfig}
                    user={user}
                    onLogout={handleLogout} 
                  />
                </div>
              ) : (
                <div id="dynamic-regional-feed">
                  <CategoryPageHeader 
                    category={selectedCategory} 
                    city={selectedCity} 
                    isDarkMode={isDarkMode} 
                    portalPagesConfig={portalPagesConfig} 
                  />

                  {/* FEED HEADLINE CONTROL PANEL (Cards layout customization / Mode alerts) */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/40 border border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/30">
                    <Sparkles className="w-4 h-4 text-green-400 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-xs text-white uppercase tracking-wider">
                      {selectedCategory || selectedCity ? `Feed Dinâmico: ${selectedCategory || selectedCity}` : "Feed Dinâmico Regional"}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      Visualizando {filteredArticles.length} de {articles.length} posts disponíveis.
                    </p>
                  </div>
                </div>

                {/* Card layout customization row - User chooses layout on mainpage */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold mr-1">
                    Customizar Cards:
                  </span>
                  <div className="flex rounded-xl overflow-hidden border border-zinc-850 bg-black p-0.5">
                    {[
                      { key: "grid", label: "Grid", icon: Grid },
                      { key: "list", label: "Lista", icon: List },
                      { key: "compact", label: "Compacto", icon: Layers },
                    ].map((lay) => {
                      const Icon = lay.icon;
                      const active = layout === lay.key;
                      return (
                        <button
                          key={lay.key}
                          onClick={() => setLayout(lay.key as any)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-mono transition flex items-center gap-1 ${
                            active
                              ? "bg-green-500/15 text-green-400 font-bold"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                          title={`Visualizar em formato de ${lay.label}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{lay.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TWO-COLUMN GRID FOR AGENDA SIDEBAR AND ARTICLES FEED */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-6">
                {/* LEFT COLUMN: CYBERPUNK AGENDA FILTER */}
                <div className="lg:col-span-1 space-y-6">
                  <AgendaCalendar
                    selectedDate={selectedDate}
                    onSelectDate={(date) => {
                      playClickSound(620, "sine");
                      setSelectedDate(date);
                    }}
                    searchQuery={agendaSearch}
                    onSearchChange={setAgendaSearch}
                    articles={articles}
                    isDarkMode={isDarkMode}
                  />

                  {/* Filter Reset Button info alert */}
                  {selectedDate && (
                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-[11px] font-mono text-zinc-300 space-y-2.5 animate-pulse-slow">
                      <span className="text-green-400 font-bold uppercase block tracking-wider">📅 Filtro Ativo</span>
                      <p>Visualizando pautas e coberturas publicadas em <strong className="text-green-400">{selectedDate.split("-").reverse().join("/")}</strong>.</p>
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="w-full py-1.5 bg-pink-500/15 hover:bg-pink-500/25 text-pink-400 font-bold uppercase rounded border border-pink-500/30 transition text-[9px] tracking-widest mt-1"
                      >
                        Limpar Data ×
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: CORE PORTAL FEED */}
                <div className="lg:col-span-3 space-y-6">
                  {/* ZERO RESULTS FALLBACK */}
                  {filteredArticles.length === 0 && (
                    <div className="p-8 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
                      <Calendar className="w-10 h-10 text-pink-400 mx-auto animate-pulse" />
                      <div>
                        <h4 className="font-display font-black text-base text-zinc-100 uppercase">
                          {selectedDate 
                            ? `Nenhuma matéria cadastrada para ${selectedDate.split("-").reverse().join("/")}`
                            : "A busca não retornou notícias"}
                        </h4>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                          {selectedDate
                            ? "Não há matérias com esta data exata. Você pode visualizar a agenda completa de eventos da região ou publicar uma notícia para este dia."
                            : "Nenhum post ou evento coincide com os filtros selecionados (Categoria, Cidade ou Data)."}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                        {selectedDate && (
                          <button
                            onClick={() => setSelectedDate(null)}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-mono font-bold text-xs uppercase rounded-xl hover:opacity-90 shadow-md transition"
                          >
                            📅 Ver Todas as Datas & Notícias
                          </button>
                        )}
                        <button
                          onClick={() => { setSelectedCategory(null); setSelectedCity(null); setSelectedDate(null); setSearchText(""); setAgendaSearch(""); }}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono font-bold text-xs uppercase rounded-xl border border-zinc-700 transition"
                        >
                          Resetar Todos os Filtros
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PODCAST PROMINENT YOUTUBE CHANNEL WIDGET */}
                  {selectedCategory === null && (
                    <div id="podcast-youtube-root-section">
                      <PodcastSection 
                        isDarkMode={isDarkMode} 
                        user={user} 
                        directEditingMode={isDirectEditingEnabled}
                        onOpenPip={(video) => setPipVideo(video)}
                      />
                    </div>
                  )}

                  {/* DESTAQUES DO MÊS (REGINA SIMÕES - EMBAIXADORA UNICORN SUMMIT & JF SUMMIT 26) */}
                  {(selectedCategory === "EVENTOS" || selectedCategory === null) && (
                    <MonthlyHighlightsSection isDarkMode={isDarkMode} />
                  )}

                  {/* PROMINENT UPCOMING EVENTS SECTION (PALESTRA REFORMA TRIBUTÁRIA / FLÁVIA REIS) */}
                  {(selectedCategory === "EVENTOS" || selectedCategory === null) && (
                    <UpcomingEventsSection isDarkMode={isDarkMode} />
                  )}

                  {/* CARD RENDERER DYNAMIC ENGINE */}
                  <div
                    className={
                      layout === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : layout === "compact"
                        ? "space-y-3"
                        : "space-y-6" // list
                    }
                  >
                    {isDirectEditingEnabled && (
                      <div
                        onClick={handleCreateNewArticle}
                        className={`border-2 border-dashed border-zinc-800 hover:border-pink-500 rounded-2xl flex flex-col justify-center items-center gap-3 transition duration-300 group cursor-pointer ${layout === "list" ? "p-8 md:flex-row" : "min-h-[250px]"}`}
                      >
                        <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition shadow-lg">
                          <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-zinc-400 font-mono text-xs uppercase tracking-widest font-bold group-hover:text-pink-500 transition text-center px-4">Criar Novo Card / Publicação</span>
                      </div>
                    )}
                {filteredArticles.map((art) => {
                  const isPremium = art.isPremium || art.category === "COMUNIDADE" || art.category === "EMBAIXADORES";

                  // Dynamic custom styles for designer studio variables
                  const colSpanClass = layout === "grid" && art.customWidthSpan
                    ? art.customWidthSpan === "col-span-3" ? "md:col-span-3 lg:col-span-3"
                    : art.customWidthSpan === "col-span-2" ? "md:col-span-2" : ""
                    : "";

                  const glowClasses = !art.customGlowColor || art.customGlowColor === "none"
                    ? (isDarkMode ? "hover:border-green-500/60 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] text-white" : "hover:border-pink-500 shadow-sm")
                    : art.customGlowColor === "pink" ? "hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] text-white"
                    : art.customGlowColor === "green" ? "hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] text-white"
                    : art.customGlowColor === "emerald" ? "hover:border-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white"
                    : "hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] text-white";

                  const customRadius = art.customBorderRadius || "rounded-2xl";
                  const customPadding = art.customPadding || "p-5";

                  const aspectClass = art.customAspectRatio === "square" ? "aspect-square"
                    : art.customAspectRatio === "video" ? "aspect-video"
                    : art.customAspectRatio === "tall" ? "aspect-[3/4]"
                    : "object-cover";

                  if (layout === "compact") {
                    return (
                      <motion.div
                        key={art.id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10px" }}
                        transition={{ duration: 0.4 }}
                        onClick={(e) => {
                          if (isDirectEditingEnabled) {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingArticle(art);
                            setEditingLogo(false);
                          } else {
                            handleSelectArticle(art);
                          }
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer hover:border-green-400 transition flex items-center justify-between gap-4 group relative ${
                          isDarkMode ? "bg-stone-950 border-zinc-900" : "bg-white border-stone-200"
                        }`}
                      >
                        {isDirectEditingEnabled && (
                          <div className="absolute inset-x-0 inset-y-0 bg-pink-500/5 border border-dashed border-pink-500/50 z-20 rounded-xl flex items-center justify-end pr-3 pointer-events-none">
                            <div className="flex items-center gap-2 pointer-events-auto">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleDeleteArticle(art.id);
                                }}
                                className="p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg shadow-xl"
                                title="Excluir Publicação"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <span className="text-[7px] font-mono text-pink-400 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-pink-500/30">🛠️ DESIGN</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono font-bold">
                            {art.category}
                          </span>
                          <h4 className="font-sans font-bold text-xs text-white line-clamp-1 group-hover:text-green-400 transition flex items-center gap-1">
                            {art.title}
                            {art.linkUrl && <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />}
                          </h4>
                          {isPremium && (
                            <span className="text-[8px] bg-pink-500/15 text-pink-400 font-mono px-1 rounded-sm border border-pink-500/20">
                              🔒 VIP
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                          <span>{art.location || "Regional"}</span>
                          <span className="hidden md:inline">{new Date(art.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </motion.div>
                    );
                  }

                  return (
                    <motion.div
                      key={art.id}
                      initial={{ opacity: 0, y: 35 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      onClick={(e) => {
                        if (isDirectEditingEnabled) {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingArticle(art);
                          setEditingLogo(false);
                        } else {
                          handleSelectArticle(art);
                        }
                      }}
                      className={`${customRadius} border cursor-pointer group flex flex-col justify-between overflow-hidden transition-all duration-305 relative ${colSpanClass} ${
                        isDarkMode
                          ? `bg-stone-950 border-zinc-900 ${glowClasses}`
                          : `bg-white border-stone-200 ${glowClasses}`
                      } ${layout === "list" ? "md:flex-row" : ""}`}
                    >
                      {/* Direct layout editor indicator overlays */}
                      {isDirectEditingEnabled && (
                        <div className="absolute inset-x-0 inset-y-0 bg-pink-500/5 border-2 border-dashed border-pink-500/40 z-20 flex flex-col items-center justify-center pointer-events-none group-hover:bg-pink-500/10 transition duration-300">
                          <div className="flex flex-col items-center gap-2 pointer-events-auto">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteArticle(art.id);
                              }}
                              className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-xl"
                              title="Excluir Publicação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="bg-pink-500 text-black text-[9px] font-mono font-black py-1 px-2.5 rounded-lg flex items-center gap-1 uppercase tracking-widest shadow-xl animate-pulse cursor-pointer">
                              <SlidersHorizontal className="w-3.5 h-3.5 text-black" />
                              <span>Propriedades do Card</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Left/Top Column: Cover image with neon indicator */}
                      <div
                        className={`relative overflow-hidden ${layout === "list" ? "md:w-1/3" : ""}`}
                        style={
                          art.customImageHeight && layout !== "list"
                            ? { height: `${art.customImageHeight}px` }
                            : (layout === "list" ? undefined : { height: "192px" })
                        }
                      >
                        <PositionableImage
                          src={art.imageUrl}
                          alt={art.title}
                          className={`w-full h-full ${aspectClass} group-hover:scale-103 transition duration-500`}
                          storageKey={`feed-article-${art.id}`}
                          editable={isDirectEditingEnabled}
                          referrerPolicy="no-referrer"
                        />
                        {/* Tags list */}
                        <div className="absolute top-3 left-3 flex gap-1 z-10">
                          <span className="px-2.5 py-1 text-[9px] font-display font-black tracking-wider uppercase bg-black text-green-400 rounded-lg border border-green-400/50">
                            {art.category}
                          </span>
                        </div>
                        {isPremium && (
                          <div className="absolute top-3 right-3 p-1 rounded-lg bg-pink-500 text-black z-10">
                            <Lock className="w-3.5 h-3.5 text-black fill-current animate-pulse" />
                          </div>
                        )}
                        {art.location && (
                          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm p-1 px-2 rounded text-[9px] text-zinc-300 font-mono z-10">
                            {art.location}
                          </div>
                        )}
                      </div>

                      {/* Right/Bottom Column: details */}
                      <div className={`${customPadding} flex-1 flex flex-col justify-between gap-3`}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                            <span className="flex items-center gap-1 text-[10px]">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(art.date).toLocaleDateString("pt-BR")}
                            </span>
                            <span>{art.readTime}</span>
                          </div>

                          <h3 className="font-display font-extrabold text-base leading-tight group-hover:text-green-400 transition flex items-center gap-1.5">
                            {art.title}
                            {art.linkUrl && <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0" />}
                          </h3>

                          <p className="text-zinc-400 text-xs line-clamp-2">
                            {art.excerpt}
                          </p>
                        </div>

                        {/* Interactive counts */}
                        <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                          <span>Autor: {art.author}</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                if (isDirectEditingEnabled) {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setEditingArticle(art);
                                  setEditingLogo(false);
                                } else {
                                  handleLike(art.id, e);
                                }
                              }}
                              className="flex items-center gap-1 hover:text-pink-500 transition"
                              title="Curtir Postagem"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{art.likes}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                if (isDirectEditingEnabled) {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setEditingArticle(art);
                                  setEditingLogo(false);
                                } else {
                                  handleShare(art.id, e);
                                }
                              }}
                              className="flex items-center gap-1 hover:text-green-400 transition"
                              title="Compartilhar"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              <span>{art.shares}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div> {/* End of lg:col-span-3 */}
          </div> {/* End of TWO-COLUMN GRID */}
            </div>
          )}

              {/* INTEGRATED NEWSLETTER PORTLET */}
              <NewsletterSection
                onAddSubscriber={(email, cats) => {
                  setSubscribers((prev) => [...prev, { email, categories: cats }]);
                }}
                isDarkMode={isDarkMode}
              />
              </div> {/* End of homepage-section-feed */}

              {/* PARTNERS SHOWCASE PRESENTATION */}
              <div 
                style={{ order: homepageSectionsOrder.indexOf("partners") }} 
                className="relative group/section"
                id="homepage-section-partners"
              >
                {isDirectEditingEnabled && (
                  <div className="absolute top-2 right-2 z-40 flex items-center gap-2 bg-stone-950/95 border border-pink-500/50 rounded-xl px-2.5 py-1.5 shadow-2xl font-mono text-[9px] text-zinc-300 backdrop-blur-md opacity-0 group-hover/section:opacity-100 transition-opacity duration-200">
                    <div 
                      draggable
                      onDragStart={(e) => handleDragStart(e, homepageSectionsOrder.indexOf("partners"))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, homepageSectionsOrder.indexOf("partners"))}
                      className="cursor-grab active:cursor-grabbing p-1 hover:text-pink-400 transition"
                      title="Arraste para reordenar"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-pink-500" />
                    </div>
                    <span className="font-bold text-pink-400 uppercase mr-1 select-none">🤝 Parceiros</span>
                    <button 
                      onClick={() => moveSectionUp(homepageSectionsOrder.indexOf("partners"))} 
                      disabled={homepageSectionsOrder.indexOf("partners") === 0} 
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => moveSectionDown(homepageSectionsOrder.indexOf("partners"))} 
                      disabled={homepageSectionsOrder.indexOf("partners") === homepageSectionsOrder.length - 1} 
                      className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 hover:text-white transition disabled:opacity-30"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <PartnersCarousel isAdmin={isDirectEditingEnabled} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* DETAILED EXPANDED ARTICLE DRAWER/MODAL */}
      <AnimatePresence>
        {selectedArticle && (
          <div id="article-detail-modal" className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`w-full max-w-3xl rounded-3xl overflow-hidden border ${
                isDarkMode ? "bg-stone-950 border-zinc-800 text-white" : "bg-white border-stone-200 text-stone-900"
              } shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col max-h-[90vh] md:max-h-[85vh]`}
            >
              {/* Header Image Header */}
              <div className="relative h-48 sm:h-64 md:h-80 w-full shrink-0">
                <PositionableImage
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                  storageKey={`feed-article-${selectedArticle.id}`}
                  editable={isDirectEditingEnabled}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent"></div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-zinc-800 z-10 font-bold"
                >
                  ×
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <span className="px-3 py-1 bg-green-500 text-black font-display font-black text-[10px] rounded-lg tracking-wider uppercase">
                    {selectedArticle.category}
                  </span>
                  <h2 className="font-display font-black text-xl md:text-3xl text-white mt-2 tracking-tight leading-tight">
                    {selectedArticle.title}
                  </h2>
                </div>
              </div>

              {/* Body Text Contents */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-grow scrollbar-thin">
                <div className={`flex flex-wrap items-center justify-between gap-4 text-xs font-mono border-b pb-3 ${isDarkMode ? "text-zinc-500 border-zinc-900" : "text-stone-500 border-stone-100"}`}>
                  <div className="flex items-center gap-2">
                    <span>Autor: <strong className={isDarkMode ? "text-zinc-300" : "text-stone-800"}>{selectedArticle.author}</strong></span>
                    <span>•</span>
                    <span>Local: <strong className={isDarkMode ? "text-zinc-300" : "text-stone-800"}>{selectedArticle.location || "Regional"}</strong></span>
                  </div>
                  <div className="flex gap-2.5">
                    <span>{new Date(selectedArticle.date).toLocaleDateString("pt-BR")}</span>
                    <span>{selectedArticle.readTime}</span>
                  </div>
                </div>

                <div className={`text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans ${isDarkMode ? "text-zinc-300" : "text-stone-800"}`}>
                  {selectedArticle.content}
                </div>

                {/* External Official Link / Registration CTA */}
                {selectedArticle.linkUrl && (
                  <div className="pt-2">
                    <a
                      href={selectedArticle.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-mono font-black text-xs uppercase tracking-wider transition shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Acessar Site Oficial do Evento / Inscrições</span>
                    </a>
                  </div>
                )}

                {/* Article Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedArticle.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-[9px] font-mono text-[#22c55e] bg-[#22c55e]/10 rounded border border-[#22c55e]/30">
                        #{tag.toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}

                {/* LIKE & SHARE row inside article */}
                <div className={`flex flex-col gap-3 p-3.5 rounded-2xl border ${isDarkMode ? "bg-zinc-900/30 border-zinc-800 text-white" : "bg-stone-50 border-stone-200 text-stone-800"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono ${isDarkMode ? "text-zinc-500" : "text-stone-500"}`}>Achou relevante? Demonstre curtindo:</span>
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => handleLike(selectedArticle.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold border border-green-500/20 text-xs transition"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{selectedArticle.likes} Gostei</span>
                      </button>
                      <button
                        onClick={(e) => handleShare(selectedArticle.id, e)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 font-bold border border-pink-500/20 text-xs transition"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Compartilhar</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => { playClickSound(600, "sine"); setIsDarkMode(!isDarkMode); }}
                    className={`w-full p-2 rounded-xl border text-xs transition-all duration-300 flex items-center justify-center gap-2 ${ isDarkMode ? "border-zinc-800 text-yellow-400 bg-zinc-900 hover:bg-zinc-800" : "border-stone-200 text-stone-700 bg-white hover:bg-stone-50" }`}
                    title="Alternar modo Claro/Escuro"
                  >
                    {isDarkMode ? <><Sun className="w-3.5 h-3.5" /> Alternar para modo Claro</> : <><Moon className="w-3.5 h-3.5" /> Alternar para modo Escuro</>}
                  </button>
                </div>

                {/* INTEGRATED COMMENTS FEED */}
                <div className={`space-y-4 pt-4 border-t ${isDarkMode ? "border-zinc-900" : "border-stone-100"}`}>
                  <h4 className={`font-display font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${isDarkMode ? "text-white" : "text-stone-950"}`}>
                    <MessageSquare className="w-4 h-4 text-pink-500" />
                    Discussão Comunitária ({comments.filter(c => c.articleId === selectedArticle.id).length})
                  </h4>

                  <form onSubmit={(e) => handleAddComment(e, selectedArticle.id)} className="space-y-2">
                    <textarea
                      required
                      rows={2}
                      maxLength={300}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Adicione um comentário público... Seja ético!"
                      className={`w-full p-3 rounded-xl text-xs focus:outline-none focus:border-green-400 placeholder-zinc-500 ${isDarkMode ? "bg-zinc-900/60 border-zinc-800 text-white" : "bg-stone-50 border-stone-200 text-stone-900"}`}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {user.isAuthenticated ? `Identificado como: ${user.name}` : "Comentando anonimamente"}
                      </span>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-pink-500 text-white rounded-lg font-mono text-[10px] font-bold tracking-wider hover:bg-pink-400 transition uppercase"
                      >
                        Enviar Comentário
                      </button>
                    </div>
                  </form>

                  {/* List of comments */}
                  <div className="space-y-3 pt-2">
                    {comments
                      .filter((c) => c.articleId === selectedArticle.id)
                      .map((comment) => (
                        <div key={comment.id} className={`p-3 rounded-xl space-y-1 border ${isDarkMode ? "bg-zinc-900/40 border-zinc-850" : "bg-stone-50 border-stone-150"}`}>
                          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                            <span className={`font-bold ${isDarkMode ? "text-zinc-300" : "text-stone-750"}`}>{comment.userName}</span>
                            <span>{new Date(comment.date).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <p className={`text-xs ${isDarkMode ? "text-zinc-400" : "text-stone-650"}`}>{comment.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Bottom detail buttons */}
              <div className={`p-4 border-t text-right shrink-0 ${isDarkMode ? "bg-zinc-900/40 border-zinc-900" : "bg-stone-50 border-stone-200"}`}>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className={`px-5 py-2 text-xs font-mono rounded-xl transition ${isDarkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300" : "bg-stone-200 hover:bg-stone-300 text-stone-800"}`}
                >
                  Fechar Artigo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STATIC FOOTER (BRYAND AND LEGAL INFO) */}
      <footer className={`border-t ${isDarkMode ? "bg-black border-zinc-900 text-zinc-400" : "bg-stone-100 border-stone-200 text-stone-700"} py-12 px-4`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo & Slogan */}
          <div className="space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
            <BrandLogo
              size="md"
              customImageUrl={logoConfig.customImageUrl}
              customLogoWidth={logoConfig.customLogoWidth}
              customLogoHeight={logoConfig.customLogoHeight}
              customText1={logoConfig.customText1}
              customText2={logoConfig.customText2}
              customSub={logoConfig.customSub}
              isDarkMode={isDarkMode}
            />
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              O seu portal de cultura, curadoria de eventos inovadores e cursos no sudeste.
            </p>
          </div>

          {/* Quick legal anchors - Now Mapa do Site */}
          <div className="space-y-3">
            <h5 className="font-display font-black text-xs text-zinc-300 uppercase tracking-wider">Mapa do Site</h5>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-zinc-400 font-mono">
              <button onClick={() => { playClickSound(600, "sine"); handleSelectCategory(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-green-400 transition-colors flex items-center gap-1.5"><Grid className="w-3.5 h-3.5" /> Início Feed</button>
              <button onClick={() => { playClickSound(610, "sine"); handleSelectCategory("EVENTOS"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-green-400 transition-colors flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Eventos</button>
              <button onClick={() => { playClickSound(620, "sine"); handleSelectCategory("COMUNIDADE"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-green-400 transition-colors flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Comunidade</button>
              <button onClick={() => { playClickSound(625, "sine"); setActiveSection("DEPOIMENTOS"); setSelectedCategory(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-pink-400 text-pink-400 transition-colors flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Depoimentos</button>
              <button onClick={() => { playClickSound(630, "sine"); handleSelectCategory("EMBAIXADORES"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-pink-400 text-pink-500 transition-colors flex items-center gap-1.5"><Diamond className="w-3.5 h-3.5" /> Embaixadores</button>
              <button onClick={() => { playClickSound(648, "sine"); setActiveSection("GALERIA"); setSelectedCategory(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-pink-400 transition-colors flex items-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Galeria</button>
              <button onClick={() => { playClickSound(650, "sine"); setActiveSection("PARCEIROS"); setSelectedCategory(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-blue-400 transition-colors flex items-center gap-1.5"><Handshake className="w-3.5 h-3.5" /> Parceiros</button>
              <button onClick={() => { playClickSound(660, "sine"); setSelectedCategory("PODCAST"); setActiveSection("PODCAST"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-red-400 transition-colors flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" /> Podcast</button>
              <button onClick={() => { playClickSound(670, "sine"); setActiveSection("CONTATO"); setSelectedCategory(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-yellow-400 transition-colors flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Contato</button>
              
              <button onClick={() => { playClickSound(600, "sine"); setActiveSection("QUEM SOMOS"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-zinc-300 transition-colors text-[10px] opacity-70">Quem Somos</button>
              <button onClick={() => { playClickSound(600, "sine"); setActiveSection("OBJETIVOS"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-left hover:text-zinc-300 transition-colors text-[10px] opacity-70">Objetivos</button>
            </div>
          </div>

          {/* Contacts / Copyright credits */}
          <div className="space-y-2">
            <h5 className="font-display font-black text-xs text-zinc-300 uppercase tracking-wider">Políticas</h5>
            <p className="text-xs text-zinc-500 leading-normal font-mono">
              {footerCredits}
            </p>
            <div className="pt-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono block text-green-400">
                ● Status da Plataforma: Online (Vite/Node)
              </span>
              <span className="text-[10px] font-mono flex items-center gap-1.5 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Firebase Analytics: Ativo (Page Views & Engajamento)</span>
              </span>
              <button
                onClick={() => {
                  playClickSound(800, "sine");
                  if (activeTab === "editor" || (user.isAuthenticated && user.isAdmin)) {
                    setActiveTab(activeTab === "reader" ? "editor" : "reader");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    setAuthModalTab("admin");
                    setAuthModalOpen(true);
                  }
                }}
                className={`text-[9px] font-mono text-left tracking-widest uppercase transition-all duration-300 hover:underline max-w-max ${
                  activeTab === "editor" 
                    ? "text-pink-400 hover:text-white" 
                    : "text-zinc-500 hover:text-[#22c55e]"
                }`}
              >
                🔒 {activeTab === "editor" ? "Voltar ao Portal" : "Acesso do Administrador / CMS"}
              </button>
            </div>
          </div>
          {/* Spotify player temporarily hidden as requested */}
          {/* <SpotifyPlayer /> */}
        </div>
      </footer>

      {/* MAXIMUM FLOATING MENU OVERLAY CORE */}
      <FloatingMenu
        currentCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSection={(section) => {
          setActiveSection(section);
          // Scroll smoothly to highlights
          window.scrollTo({ top: 220, behavior: "smooth" });
        }}
        isCollapsed={areFloatingButtonsCollapsed}
      />

      {/* SOCIAL NETWORKS SPEED-DIAL FLOATING MENU */}
      <SocialFloatingMenu 
        isCollapsed={areFloatingButtonsCollapsed}
        onOpenFaceNav={() => setMotionNavMode("face")}
        onOpenHandNav={() => setMotionNavMode("hands")}
        onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
        onOpenSiteTour={() => setIsSiteTourOpen(true)}
      />

      {/* TOPINA ASSISTANT VIRTUAL AGENT (BOTTOM LEFT) */}
      <div className="fixed bottom-6 left-6 z-50">
        <TopinaAssistant 
          isCollapsed={areFloatingButtonsCollapsed} 
          onOpenVoiceAgent={() => setIsVoiceAgentOpen(true)}
        />
      </div>

      {/* INTERACTIVE GUIDED SITE TOUR MODAL */}
      <SiteTourModal
        isOpen={isSiteTourOpen}
        onClose={() => setIsSiteTourOpen(false)}
        onOpenVoiceAgent={() => {
          setIsSiteTourOpen(false);
          setIsVoiceAgentOpen(true);
        }}
        onNavigateSection={(sectionId) => {
          setIsSiteTourOpen(false);
          if (sectionId === "NOTICIAS") {
            setActiveSection("FEED");
            setSelectedCategory(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "PODCAST") {
            setSelectedCategory("PODCAST");
            setActiveSection("PODCAST");
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "GALERIA") {
            setActiveSection("GALERIA");
            setSelectedCategory(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "COMUNIDADE") {
            setSelectedCategory("COMUNIDADE");
            setActiveSection("FEED");
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "EMBAIXADORES") {
            setSelectedCategory("EMBAIXADORES");
            setActiveSection("FEED");
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "PARCEIROS") {
            setActiveSection("PARCEIROS");
            setSelectedCategory(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "CONTATO") {
            setActiveSection("CONTATO");
            setSelectedCategory(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
          } else if (sectionId === "ANUNCIOS") {
            setActiveSection("ANUNCIE AQUI");
            setSelectedCategory(null);
            window.scrollTo({ top: 300, behavior: "smooth" });
          }
        }}
      />

      {/* VOICE INTERACTIVE FEMALE AGENT MODAL */}
      <VoiceAgentModal
        isOpen={isVoiceAgentOpen}
        onClose={() => setIsVoiceAgentOpen(false)}
        onNavigateSection={(sectionId) => {
          if (sectionId === "NOTICIAS") {
            setActiveSection("FEED");
            setSelectedCategory(null);
            window.scrollTo({ top: 400, behavior: "smooth" });
          } else if (sectionId === "PODCAST") {
            setSelectedCategory("PODCAST");
            window.scrollTo({ top: 400, behavior: "smooth" });
          } else if (sectionId === "GALERIA") {
            setActiveSection("GALERIA");
            window.scrollTo({ top: 400, behavior: "smooth" });
          } else if (sectionId === "COMUNIDADE") {
            const el = document.getElementById("homepage-section-membership") || document.getElementById("comunidade-section-root");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else if (sectionId === "ANUNCIOS") {
            const el = document.getElementById("homepage-section-advertising") || document.getElementById("portal-advertising-root");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else if (sectionId === "EMBAIXADORES") {
            const el = document.getElementById("embaixadores-section-root") || document.getElementById("homepage-section-embaixadores");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          } else if (sectionId === "CONTATO") {
            const el = document.getElementById("contato-section-root") || document.getElementById("homepage-section-contato");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />

      {/* FACE NAVIGATION SYSTEM (ACCESSIBILITY TECHNOLOGY) */}
      <FaceNavigationSystem
        isOpen={motionNavMode !== null}
        initialMode={motionNavMode || "face"}
        onClose={() => setMotionNavMode(null)}
      />

      {/* FLOATING PICTURE-IN-PICTURE PODCAST VIDEO PLAYER */}
      <AnimatePresence>
        {pipVideo && (
          <PodcastPipPlayer
            video={pipVideo}
            onClose={() => setPipVideo(null)}
            onExpand={() => {
              // Expand back into feed section smoothly
              setSelectedCategory("PODCAST");
              window.scrollTo({ top: 400, behavior: "smooth" });
            }}
          />
        )}
      </AnimatePresence>

      {/* Collapse Trigger Button for Right Side Widgets */}
      <AnimatePresence>
        {!areFloatingButtonsCollapsed && (
          <div className="fixed bottom-6 right-24 z-50">
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFloatingButtons}
              title="Recolher botões"
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-zinc-800/85 hover:border-pink-500/50 flex items-center justify-center text-zinc-400 hover:text-white transition duration-200 cursor-pointer shadow-lg"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Right Edge Collapsed Tab */}
      <AnimatePresence>
        {areFloatingButtonsCollapsed && (
          <div className="fixed bottom-24 right-0 z-50">
            <motion.button
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ x: -6 }}
              onClick={toggleFloatingButtons}
              className="flex items-center gap-1.5 pl-3 pr-2 py-3 rounded-l-2xl bg-black/40 backdrop-blur-md border-y-2 border-l-2 border-pink-500 text-pink-400 font-mono font-black text-[10px] tracking-wider uppercase cursor-pointer shadow-[-2px_4px_25px_rgba(236,72,153,0.15)] select-none"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-green-400 animate-pulse" />
              <span>RECURSOS ⚙️</span>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* PWA WEB APP STANDALONE INSTALLATION BUTTON (BOTTOM LEFT) */}
      <PwaInstallButton isCollapsed={areFloatingButtonsCollapsed} onToggleCollapse={toggleFloatingButtons} />

      {/* WELCOME POPUP ON LOAD */}
      {showWelcomePopup && (
        <WelcomePopup
          onClose={() => setShowWelcomePopup(false)}
          onSelectOption={handleWelcomeOptionSelect}
        />
      )}

      {/* GOOGLE WORKSPACE AUTHENTICATION POPUP */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authModalTab}
        pendingCategory={pendingCategory || (pendingArticle ? pendingArticle.category : null)}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingCategory(null);
          setPendingArticle(null);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* PENDING APPROVAL MODAL / SCREEN FOR SUSPENDED OR NEW USERS */}
      <AnimatePresence>
        {showPendingModal && user.isAuthenticated && !user.isAdmin && (user.status === "suspended" || !user.status) && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg">
              <button
                onClick={() => setShowPendingModal(false)}
                className="absolute top-4 right-4 z-10 text-zinc-500 hover:text-white transition cursor-pointer font-mono font-bold text-sm bg-zinc-900/80 px-2.5 py-1 rounded-full border border-zinc-800"
                title="Fechar (Voltar para modo leitura)"
              >
                ✕ Voltar ao Leitor
              </button>
              <PendingApprovalScreen
                user={user}
                supportWhatsapp={portalPagesConfig.contatoWhatsapp || "+55 32 99194-7690"}
                onLogout={() => {
                  handleLogout();
                  setShowPendingModal(false);
                }}
                onRefreshStatus={async () => {
                  if (user.email) {
                    try {
                      const res = await fetch("/api/users/sync", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: user.email, uid: user.uid })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        const record = data.user || {};
                        const isAdmin = !!data.isAdmin;
                        setUser(prev => ({ ...prev, status: record.status, isAdmin: isAdmin }));
                        if (isAdmin || record.status === "approved" || record.status === "trial") {
                          setShowPendingModal(false);
                        }
                      }
                    } catch (e) {
                      console.error("Error refreshing status:", e);
                    }
                  }
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* VISUAL LAYOUT MANAGER MODAL */}
      <AnimatePresence>
        {reorderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl ${
                isDarkMode ? "bg-stone-950 border-zinc-800 text-white" : "bg-white border-stone-200 text-stone-900"
              } flex flex-col max-h-[85vh]`}
            >
              <div className="p-5 border-b border-zinc-800/10 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-pink-500">
                    Organizador de Blocos da Home
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-400 mt-0.5">
                    Arraste ou use as setas para reordenar a estrutura visual da página
                  </p>
                </div>
                <button
                  onClick={() => {
                    playClickSound(600, "sine");
                    setReorderModalOpen(false);
                  }}
                  className={`p-2 rounded-xl border transition ${
                    isDarkMode ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white" : "bg-stone-100 border-stone-200 hover:bg-stone-200 text-stone-600"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-3 flex-grow">
                {homepageSectionsOrder.map((sectionId, index) => (
                  <div
                    key={sectionId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing hover:scale-[1.01] ${
                      isDarkMode 
                        ? "bg-zinc-900/60 border-zinc-800 hover:border-pink-500/50 hover:bg-zinc-900" 
                        : "bg-stone-50 border-stone-200 hover:border-pink-500/30 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-500">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{getSectionLabel(sectionId)}</span>
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase tracking-wider">
                          Posição: {index + 1}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => moveSectionUp(index)}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 text-zinc-400 hover:text-white transition disabled:opacity-20"
                        title="Mover para cima"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveSectionDown(index)}
                        disabled={index === homepageSectionsOrder.length - 1}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-pink-500/50 text-zinc-400 hover:text-white transition disabled:opacity-20"
                        title="Mover para baixo"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 border-t border-zinc-800/10 bg-zinc-900/10 flex items-center justify-between gap-4">
                <span className="text-[10px] font-mono text-zinc-400">
                  ⚠️ Publique as alterações para salvar permanentemente no servidor.
                </span>
                <button
                  onClick={() => {
                    playClickSound(800, "sine");
                    setReorderModalOpen(false);
                  }}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-xl font-mono text-[10px] font-black uppercase tracking-wider transition hover:scale-[1.02]"
                >
                  Concluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIRECT DESIGN EDITING STUDIO SLIDING DRAWER PANEL */}
      <VisualEditorPanel
        isOpen={isDirectEditingEnabled && (!!editingArticle || editingLogo)}
        isDarkMode={isDarkMode}
        article={editingArticle}
        logoConfig={logoConfig}
        onClose={() => {
          setEditingArticle(null);
          setEditingLogo(false);
        }}
        onSaveArticle={(updatedArt) => {
          setArticles((prev) => {
            const newArticles = prev.map((art) => (art.id === updatedArt.id ? updatedArt : art));
            localStorage.setItem("docomeco_articles", JSON.stringify(newArticles));
            return newArticles;
          });

          // Sync to server API (Firestore/Database)
          fetch("/api/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item: updatedArt })
          }).catch((err) => console.error("Error saving updated article server-side:", err));
        }}
        onSaveLogo={(updatedLogo) => {
          setLogoConfig(updatedLogo);
          localStorage.setItem("logo_config", JSON.stringify(updatedLogo));
          setCmsSaveStatus("saving");
          setTimeout(() => setCmsSaveStatus("saved"), 700);
        }}
      />

      {showEventPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowEventPopup(false)} />
          <div className="relative z-10">
            <button
              onClick={() => setShowEventPopup(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition z-20"
            >
              ×
            </button>
            <EventCountdownCard 
              title="Lançamento Portal"
              subtitle="Dia 17 Agosto | 19h"
              image="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRYer0HiBG4YMv-tueznhCQeXqIJ52gc8_vru2u9_MR_L64O_2dCG98yfD&s=10"
              isEditable={isDirectEditingEnabled}
              onJoin={() => {
                setShowEventPopup(false);
                setActiveSection("RSVP");
                setSelectedCategory(null);
                window.location.hash = "rsvp";
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      )}

      {(!showWelcomePopup && !showEventPopup && showRodadaPopup) && (
        <RodadaPopup 
          onClose={() => setShowRodadaPopup(false)} 
          isDirectEditingEnabled={isDirectEditingEnabled}
        />
      )}

      <ImageCropperModal
        isOpen={appCropperOpen}
        src={appCropperSource}
        onClose={() => setAppCropperOpen(false)}
        onConfirm={(cropped) => {
          if (cropperTargetMode === "profile") {
            // Save to server!
            fetch("/api/profile-pic", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: cropped })
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.url) {
                  setQuemSomosProfilePic(data.url);
                  localStorage.setItem("quem_somos_profile_pic", data.url);
                }
              })
              .catch((err) => {
                console.error("Error saving profile pic to server:", err);
                setQuemSomosProfilePic(cropped);
                localStorage.setItem("quem_somos_profile_pic", cropped);
              });
          } else {
            const captionInput = document.getElementById("extra-photo-caption-input") as HTMLInputElement;
            const caption = captionInput ? captionInput.value.trim() : "";
            const newPhoto = {
              id: `qs-${Date.now()}`,
              url: cropped,
              caption: caption || `Atividade ${new Date().toLocaleDateString("pt-BR")}`
            };

            // Save to server!
            fetch("/api/quem-somos-gallery", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ item: newPhoto })
            })
              .then((res) => res.json())
              .then((publishedItem) => {
                const updated = [publishedItem, ...quemSomosGallery.filter((g) => g.id !== newPhoto.id)];
                setQuemSomosGallery(updated);
                localStorage.setItem("quem_somos_gallery", JSON.stringify(updated));
              })
              .catch((err) => {
                console.error("Error saving quem somos gallery to server:", err);
                const updated = [newPhoto, ...quemSomosGallery];
                setQuemSomosGallery(updated);
                localStorage.setItem("quem_somos_gallery", JSON.stringify(updated));
              });

            if (captionInput) captionInput.value = ""; // Reset input
          }
          setAppCropperOpen(false);
        }}
      />

      {/* PERSISTENT STICKY ADMINISTRATOR TOOLBAR (STICKY BOTTOM BAR AT WEB PAGE ROOT) */}
      {(activeTab === "editor" || (user.isAuthenticated && user.isAdmin)) && (
        <div 
          id="editor-bottom-bar"
          className="fixed bottom-0 left-0 right-0 h-20 bg-stone-900 border-t border-pink-500/30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between px-6 z-50 animate-slide-up"
        >
          {/* Left panel: Info status indicator with pulsating dot */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/40 rounded-xl border border-zinc-850 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-pink-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-extrabold block">Modo Administrador Ativo</span>
                <span className="text-[9px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded uppercase font-mono font-black border border-pink-500/20">Edição Ativa</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {cmsSaveStatus === "saving" ? (
                  <div className="flex items-center gap-1.5 relative">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 absolute" />
                    <span className="text-[11px] font-mono text-amber-400 font-bold ml-1">Salvando alterações automaticamente...</span>
                  </div>
                ) : cmsSaveStatus === "saved" ? (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">Rascunho atualizado localmente!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 animate-pulse" />
                    <span className="text-[11px] font-mono text-green-400">Alterações sincronizadas!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Middle panel: Brief instructions */}
          <div className="hidden lg:flex flex-col items-start max-w-sm text-left">
            <span className="text-[10px] text-zinc-500 font-mono leading-tight">
              Qualquer alteração (fotos, imagens hospedadas, logos, cores ou textos) é <strong className="text-zinc-300">salva automaticamente</strong> em rascunho. Para disponibilizar a todos os leitores, publique-as!
            </span>
          </div>

          {/* Right panel: Main Publish & Sync Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="sync-all-cloud-btn"
              onClick={() => {
                playClickSound(640, "sine");
                syncClientToCloud(true);
              }}
              className="px-3.5 py-2.5 rounded-xl font-display font-black text-[11px] uppercase tracking-wider transition-all duration-300 shadow-md flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-pink-400 hover:text-pink-300 border border-pink-500/30 active:scale-95 cursor-pointer"
              title="Salva todas as fotos, embaixadores e conteúdos diretamente na Nuvem do Google para www.docomecoaotopo.com.br"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>Sincronizar Nuvem ⚡</span>
            </button>
            
            <button
              id="publish-all-live-btn"
              onClick={() => {
                playClickSound(640, "sine");
                handlePublishAll();
              }}
              disabled={isPublishing}
              className={`px-5 py-2.5 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center gap-2 ${
                isPublishing 
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-750"
                  : "bg-gradient-to-r from-pink-500 to-green-500 hover:from-pink-600 hover:to-green-600 text-black shadow-pink-500/10 hover:shadow-pink-500/20 active:scale-95 cursor-pointer"
              }`}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                  <span>Publicando...</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-black animate-spin-slow" />
                  <span>Publicar no Servidor</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AMBASSADOR ADD / EDIT MODAL DIALOG */}
      {isAmbassadorModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative text-left font-mono text-xs max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => { playClickSound(600, "sine"); setIsAmbassadorModalOpen(false); }}
              className="absolute top-4 right-4 p-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-black text-sm uppercase text-white tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
              <User className="w-5 h-5 text-pink-500" />
              <span>{editingAmbassadorIdx !== null ? "Editar Perfil do Embaixador" : "Adicionar Novo Embaixador Oficial"}</span>
            </h3>

            <form onSubmit={handleAmbassadorFormSubmit} className="space-y-4 pt-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Nome de Exibição *</label>
                  <input
                    type="text"
                    required
                    value={ambName}
                    onChange={(e) => setAmbName(e.target.value)}
                    placeholder="Ex: Dr. Roberto Silva"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Especialidade / Área *</label>
                  <input
                    type="text"
                    required
                    value={ambSpecialty}
                    onChange={(e) => setAmbSpecialty(e.target.value)}
                    placeholder="Ex: Medicina ou Robótica"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Nome Completo Oficial *</label>
                  <input
                    type="text"
                    required
                    value={ambFullName}
                    onChange={(e) => setAmbFullName(e.target.value)}
                    placeholder="Ex: Roberto da Silva Santos"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Instagram Handle *</label>
                  <input
                    type="text"
                    required
                    value={ambInstagram}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAmbInstagram(val.startsWith("@") || val === "" ? val : "@" + val);
                    }}
                    placeholder="Ex: @robertosilva"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Cidade de Foco *</label>
                  <input
                    type="text"
                    required
                    value={ambCity}
                    onChange={(e) => setAmbCity(e.target.value)}
                    placeholder="Ex: Juiz de Fora"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold block">Cargo ou Título Comercial *</label>
                  <input
                    type="text"
                    required
                    value={ambRole}
                    onChange={(e) => setAmbRole(e.target.value)}
                    placeholder="Ex: Diretor de Tecnologia ou Especialista"
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2.5 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Foto Oficial (URL ou Upload)</label>
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {ambPhotoUrl ? (
                      <img src={ambPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-650" />
                    )}
                  </div>

                  <div className="flex-grow space-y-1">
                    <input
                      type="text"
                      value={ambPhotoUrl}
                      onChange={(e) => setAmbPhotoUrl(e.target.value)}
                      placeholder="Cole o link da imagem ou faça upload"
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-2 text-white focus:outline-none text-[10px]"
                    />
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
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
                                      setAmbPhotoUrl(data.url);
                                      playSuccessSound();
                                    } else {
                                      alert("Falha ao subir imagem de perfil");
                                    }
                                  })
                                  .catch(() => alert("Erro ao enviar imagem"));
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg flex items-center gap-1.5 transition text-[10px]"
                      >
                        <Upload className="w-3 h-3 text-pink-500" />
                        <span>Fazer Upload de Foto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">3. Formação Acadêmica (Biografia Acadêmica)</label>
                <textarea
                  value={ambAcademic}
                  onChange={(e) => setAmbAcademic(e.target.value)}
                  placeholder="Ex: Graduação em Engenharia pela UFJF; MBA em Gestão Estratégica..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-3 text-white focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">2. Função como Embaixador (O que faz no conselho)</label>
                <textarea
                  value={ambFunction}
                  onChange={(e) => setAmbFunction(e.target.value)}
                  placeholder="Ex: Responsável por fomentar novos ecossistemas, ministrar treinamentos..."
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-pink-500 rounded-xl p-3 text-white focus:outline-none"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-900 mt-4">
                <button
                  type="button"
                  onClick={() => { playClickSound(600, "sine"); setIsAmbassadorModalOpen(false); }}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-black font-black uppercase rounded-xl hover:opacity-90 transition flex items-center gap-1 shadow-lg shadow-pink-500/10"
                >
                  <Check className="w-4 h-4 text-black" />
                  <span>Salvar Embaixador</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {showRocketModal && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border-2 border-green-500 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.4)] text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 mx-auto mb-4 text-3xl animate-bounce">
              🚀
            </div>
            <span className="text-[10px] font-mono font-black uppercase bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full">
              EASTER EGG DESBLOQUEADO!
            </span>
            <h3 className="font-display font-black text-xl text-white mt-3 uppercase tracking-tight">
              Modo Foguete Ativado!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 font-sans leading-relaxed">
              Pronto para decolar para o topo? Você descobriu nosso segredo de cliques! Use o cupom exclusivo <strong className="text-green-400 font-mono">TOPOMAX</strong> para obter vantagens especiais no seu próximo plano ou serviço no portal.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("TOPOMAX");
                  alert("Cupom TOPOMAX copiado com sucesso!");
                }}
                className="px-4 py-2.5 bg-green-500 hover:bg-green-400 text-black font-mono font-black text-xs rounded-xl uppercase transition shadow-lg shadow-green-500/25 flex items-center gap-1.5"
              >
                <span>Copiar Cupom TOPOMAX</span>
              </button>
              <button
                onClick={() => setShowRocketModal(false)}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono text-xs rounded-xl uppercase transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
