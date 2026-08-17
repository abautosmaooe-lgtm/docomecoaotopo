import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { compressImageFile } from "../utils/imageCompression";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import {
  FileText,
  TrendingUp,
  PlusCircle,
  Trash2,
  Eye,
  Settings,
  Activity,
  UserCheck,
  Check,
  BarChart3,
  Flame,
  Volume2,
  VolumeX,
  Palette,
  Sliders,
  Sparkles,
  Layout,
  Music,
  CheckCircle,
  Folder,
  ChevronRight,
  RefreshCw,
  Home,
  User,
  Unlock,
  LogOut,
  Upload,
  Camera,
  X,
  Users,
  MessageCircle,
  Mail,
  Search,
  UserPlus,
  ExternalLink,
  Copy,
  ShieldAlert,
  Clock,
  Send,
  Sparkle,
  Wifi,
  WifiOff,
  HardDrive
} from "lucide-react";
import { NewsArticle, CategoryType } from "../types";
import { playClickSound, playSuccessSound, playNegativeSound } from "../utils/audio";
import ImageCropperModal from "./ImageCropperModal";
import OfflineAdminManager from "./OfflineAdminManager";
import { isOfflineModeActive } from "../utils/offlineStorage";
import {
  getAllPortalUsers,
  updatePortalUserStatus,
  deletePortalUser,
  generateWhatsAppApprovalLink,
  generateEmailApprovalLink,
  PortalUserRecord,
  syncPortalUser,
  getAllMatriculasFromFirestore
} from "../services/userService";

interface LogoConfigType {
  customImageUrl: string;
  customLogoWidth: number;
  customLogoHeight: number;
  customText1: string;
  customText2: string;
  customSub: string;
}

interface CmsDashboardProps {
  articles: NewsArticle[];
  onAddArticle: (article: NewsArticle) => void;
  onDeleteArticle: (id: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  logoConfig: LogoConfigType;
  onSaveLogo: (updatedLogo: LogoConfigType) => void;
  isSoundActive: boolean;
  onToggleSound: (active: boolean) => void;
  gradientStyle: "neonPulse" | "pinkGlow" | "auroraGreenPink" | "subtleSpring";
  onSelectGradientStyle: (style: "neonPulse" | "pinkGlow" | "auroraGreenPink" | "subtleSpring") => void;
  footerCredits: string;
  onSaveFooterCredits: (txt: string) => void;
  user?: { isAuthenticated: boolean; name: string; photoUrl: string; email?: string };
  onTriggerAuth?: () => void;
  onLogout?: () => void;
  portalPagesConfig: any;
  onSavePortalPagesConfig: (updated: any) => void;
}

const PRESET_IMGS = [
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1516116211223-4c359a36beec?auto=format&fit=crop&q=80&w=400",
];

export default function CmsDashboard({
  articles,
  onAddArticle,
  onDeleteArticle,
  isDarkMode,
  onToggleDarkMode,
  logoConfig,
  onSaveLogo,
  isSoundActive,
  onToggleSound,
  gradientStyle,
  onSelectGradientStyle,
  footerCredits,
  onSaveFooterCredits,
  user,
  onTriggerAuth,
  onLogout,
  portalPagesConfig,
  onSavePortalPagesConfig,
}: CmsDashboardProps) {
  // WordPress-like active tab selector
  const [activeAdminTab, setActiveAdminTab] = useState<"dashboard" | "new_post" | "manage_posts" | "appearance" | "settings" | "pages" | "enrollments" | "users" | "offline">("dashboard");
  const [selectedSubPage, setSelectedSubPage] = useState<
    | "quemsomos"
    | "objetivos"
    | "ondeestamos"
    | "contato"
    | "comunidade"
    | "eventos"
    | "galeria"
    | "embaixadores"
    | "vagas"
    | "cursos"
    | "parceiros"
    | "podcast"
    | "anuncie"
  >("quemsomos");

  const articleFileInputRef = useRef<HTMLInputElement>(null);

  // CMS state for new raw post
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<CategoryType>("NOTÍCIAS");
  const [image, setImage] = useState(PRESET_IMGS[0]);
  const [cropperSource, setCropperSource] = useState<string>("");
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState(false);
  const [location, setLocation] = useState("Juiz de Fora, MG");
  const [author, setAuthor] = useState("Anderson Maooe");
  const [tags, setTags] = useState("Negócios, Regional, Inovação");
  const [successMsg, setSuccessMsg] = useState("");

  // Local state mirroring logo and details
  const [logoText1, setLogoText1] = useState(logoConfig.customText1);
  const [logoText2, setLogoText2] = useState(logoConfig.customText2);
  const [logoSlogan, setLogoSlogan] = useState(logoConfig.customSub);
  const [logoUrl, setLogoUrl] = useState(logoConfig.customImageUrl);
  const [logoSize, setLogoSize] = useState(logoConfig.customLogoWidth);
  const [localCredits, setLocalCredits] = useState(footerCredits);

  // Sync with prop changes if modified elsewhere
  useEffect(() => {
    setLogoText1(logoConfig.customText1);
    setLogoText2(logoConfig.customText2);
    setLogoSlogan(logoConfig.customSub);
    setLogoUrl(logoConfig.customImageUrl);
    setLogoSize(logoConfig.customLogoWidth || 36);
  }, [logoConfig]);

  useEffect(() => {
    setLocalCredits(footerCredits);
  }, [footerCredits]);

  // Local states for page management
  const [qsP1, setQsP1] = useState(portalPagesConfig?.quemSomosP1 || "");
  const [qsP2, setQsP2] = useState(portalPagesConfig?.quemSomosP2 || "");
  const [qsP3, setQsP3] = useState(portalPagesConfig?.quemSomosP3 || "");
  const [qsP4, setQsP4] = useState(portalPagesConfig?.quemSomosP4 || "");
  const [qsQuote, setQsQuote] = useState(portalPagesConfig?.quemSomosQuote || "");

  const [objPortal, setObjPortal] = useState(portalPagesConfig?.objetivosPortal || "");
  const [objPodcast, setObjPodcast] = useState(portalPagesConfig?.objetivosPodcast || "");
  const [objComunidade, setObjComunidade] = useState(portalPagesConfig?.objetivosComunidade || "");
  const [objCursos, setObjCursos] = useState(portalPagesConfig?.objetivosCursos || "");

  const [endEdificio, setEndEdificio] = useState(portalPagesConfig?.enderecoEdificio || "");
  const [endRua, setEndRua] = useState(portalPagesConfig?.enderecoRua || "");
  const [endBairro, setEndBairro] = useState(portalPagesConfig?.enderecoBairro || "");
  const [endComp, setEndComp] = useState(portalPagesConfig?.enderecoComplemento || "");
  const [endMapEmbed, setEndMapEmbed] = useState(portalPagesConfig?.enderecoMapEmbed || "");
  const [endMapViewer, setEndMapViewer] = useState(portalPagesConfig?.enderecoMapViewer || "");

  const [contEmail, setContEmail] = useState(portalPagesConfig?.contatoEmail || "podcastdocomecoaotopojf@gmail.com");
  const [contWhatsapp, setContWhatsapp] = useState(
    (!portalPagesConfig?.contatoWhatsapp || portalPagesConfig.contatoWhatsapp.includes("98412") || portalPagesConfig.contatoWhatsapp.includes("9999"))
      ? "+55 32 99194-7690"
      : portalPagesConfig.contatoWhatsapp
  );
  const [contInstagram, setContInstagram] = useState(portalPagesConfig?.contatoInstagram || "");

  // EXTENDED PAGES LOCAL STATES
  const [comunidadeTitle, setComunidadeTitle] = useState(portalPagesConfig?.comunidadeTitle || "");
  const [comunidadeDescription, setComunidadeDescription] = useState(portalPagesConfig?.comunidadeDescription || "");

  const [eventosTitle, setEventosTitle] = useState(portalPagesConfig?.eventosTitle || "");
  const [eventosDescription, setEventosDescription] = useState(portalPagesConfig?.eventosDescription || "");

  const [galeriaTitle, setGaleriaTitle] = useState(portalPagesConfig?.galeriaTitle || "");
  const [galeriaDescription, setGaleriaDescription] = useState(portalPagesConfig?.galeriaDescription || "");

  const [embaixadoresTitle, setEmbaixadoresTitle] = useState(portalPagesConfig?.embaixadoresTitle || "");
  const [embaixadoresDescription, setEmbaixadoresDescription] = useState(portalPagesConfig?.embaixadoresDescription || "");

  const [vagasTitle, setVagasTitle] = useState(portalPagesConfig?.vagasTitle || "");
  const [vagasDescription, setVagasDescription] = useState(portalPagesConfig?.vagasDescription || "");

  const [cursosTitle, setCursosTitle] = useState(portalPagesConfig?.cursosTitle || "");
  const [cursosDescription, setCursosDescription] = useState(portalPagesConfig?.cursosDescription || "");

  const [podcastTitle, setPodcastTitle] = useState(portalPagesConfig?.podcastTitle || "");
  const [podcastDescription, setPodcastDescription] = useState(portalPagesConfig?.podcastDescription || "");

  const [anunciePara1, setAnunciePara1] = useState(portalPagesConfig?.anunciePara1 || "");
  const [anuncieSec1Title, setAnuncieSec1Title] = useState(portalPagesConfig?.anuncieSec1Title || "");
  const [anuncieSec1Text, setAnuncieSec1Text] = useState(portalPagesConfig?.anuncieSec1Text || "");
  const [anuncieSec2Title, setAnuncieSec2Title] = useState(portalPagesConfig?.anuncieSec2Title || "");
  const [anuncieSec2Text, setAnuncieSec2Text] = useState(portalPagesConfig?.anuncieSec2Text || "");
  const [anuncieSec3Title, setAnuncieSec3Title] = useState(portalPagesConfig?.anuncieSec3Title || "");
  const [anuncieSec3Text, setAnuncieSec3Text] = useState(portalPagesConfig?.anuncieSec3Text || "");
  const [anuncieEmail, setAnuncieEmail] = useState(portalPagesConfig?.anuncieEmail || "");

  const [contatoTitle, setContatoTitle] = useState(portalPagesConfig?.contatoTitle || "");
  const [contatoDescription, setContatoDescription] = useState(portalPagesConfig?.contatoDescription || "");

  const [localParceiros, setLocalParceiros] = useState<{name: string, description: string}[]>(portalPagesConfig?.parceirosList || []);
  const [newParceiroName, setNewParceiroName] = useState("");
  const [newParceiroDesc, setNewParceiroDesc] = useState("");

  const [localCursos, setLocalCursos] = useState<{name: string, description: string, url?: string}[]>(portalPagesConfig?.cursosList || []);
  const [newCursoName, setNewCursoName] = useState("");
  const [newCursoDesc, setNewCursoDesc] = useState("");
  const [newCursoUrl, setNewCursoUrl] = useState("");

  const [pagesSuccessMsg, setPagesSuccessMsg] = useState("");

  const [communityEnrollments, setCommunityEnrollments] = useState<any[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const [usersList, setUsersList] = useState<PortalUserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "approved" | "trial" | "suspended" | "pending">("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRole, setNewUserRole] = useState<"membro" | "vip" | "embaixador" | "anunciante" | "admin">("vip");
  const [newUserStatus, setNewUserStatus] = useState<"approved" | "trial" | "suspended">("approved");

  const fetchUsersList = async () => {
    setLoadingUsers(true);
    try {
      const list = await getAllPortalUsers();
      setUsersList(list);
    } catch (e) {
      console.error("Error loading users list:", e);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (activeAdminTab === ("users" as any)) {
      fetchUsersList();
    }
  }, [activeAdminTab]);

  const handleUpdateUserStatus = async (
    email: string,
    newStatus: "approved" | "trial" | "suspended" | "pending",
    options?: { role?: any; trialDays?: number; phone?: string }
  ) => {
    playClickSound(600, "sine");
    try {
      const res = await updatePortalUserStatus(email, newStatus, options);
      if (res && res.user) {
        setUsersList(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...res.user } : u));
        playSuccessSound();
        const statusLabel = newStatus === "approved" ? "APROVADO / PREMIUM" : newStatus === "trial" ? "TESTE 14 DIAS" : "SUSPENSO / EM ANÁLISE";
        toast.success(`Status de ${email} atualizado para ${statusLabel}`);
      }
    } catch (e) {
      console.error("Error updating status:", e);
      setUsersList(prev => prev.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, status: newStatus } : u));
      toast.success(`Status de ${email} salvo localmente`);
    }
  };

  const handleDeleteUserRecord = async (email: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o registro de ${email}?`)) return;
    try {
      await deletePortalUser(email);
      setUsersList(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
      toast.success(`Usuário ${email} removido`);
    } catch (e) {
      console.error("Error deleting user:", e);
      toast.error("Erro ao remover usuário");
    }
  };

  const handleCreateManualUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      toast.error("Informe o e-mail do usuário");
      return;
    }
    try {
      const created = await syncPortalUser({
        email: newUserEmail.trim(),
        name: newUserName.trim() || undefined,
        phone: newUserPhone.trim() || undefined
      });
      await updatePortalUserStatus(created.email, newUserStatus, {
        role: newUserRole,
        phone: newUserPhone.trim() || undefined
      });
      toast.success(`Usuário ${created.email} cadastrado e liberado com sucesso!`);
      setShowAddUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPhone("");
      fetchUsersList();
    } catch (err: any) {
      toast.error("Erro ao cadastrar usuário: " + err.message);
    }
  };

  useEffect(() => {
    if (activeAdminTab === "enrollments") {
      const loadEnrollments = async () => {
        setLoadingEnrollments(true);
        const map = new Map<string, any>();
        try {
          // 1. Fetch directly from Firestore collection 'matriculas'
          const fsMatriculas = await getAllMatriculasFromFirestore();
          fsMatriculas.forEach(m => {
            if (m && (m.id || m.email || m.name)) {
              const key = m.id || m.email || m.whatsapp || `${m.name}_${m.createdAt}`;
              map.set(key, {
                id: m.id,
                name: m.name || m.nome || "Membro",
                whatsapp: m.whatsapp || m.phone || "",
                plan: m.plan || m.plano || "Membro Comunidade",
                sector: m.sector || m.setor || "Empreendedorismo",
                email: m.email || "",
                createdAt: m.createdAt || new Date().toISOString()
              });
            }
          });
        } catch (fsErr) {
          console.warn("Error reading matriculas from Firestore:", fsErr);
        }

        try {
          // 2. Fetch from backend API
          const res = await fetch("/api/published-data");
          const data = await res.json();
          if (data && data.community_enrollments && Array.isArray(data.community_enrollments)) {
            data.community_enrollments.forEach((e: any) => {
              const key = e.id || e.email || e.whatsapp || `${e.name}_${e.createdAt}`;
              if (!map.has(key)) {
                map.set(key, e);
              }
            });
          }
        } catch (e) {
          console.error("Error loading enrollments API:", e);
        }

        const list = Array.from(map.values()).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setCommunityEnrollments(list);
        setLoadingEnrollments(false);
      };
      loadEnrollments();
    }
  }, [activeAdminTab]);

  useEffect(() => {
    if (portalPagesConfig) {
      setQsP1(portalPagesConfig.quemSomosP1 || "");
      setQsP2(portalPagesConfig.quemSomosP2 || "");
      setQsP3(portalPagesConfig.quemSomosP3 || "");
      setQsP4(portalPagesConfig.quemSomosP4 || "");
      setQsQuote(portalPagesConfig.quemSomosQuote || "");
      setObjPortal(portalPagesConfig.objetivosPortal || "");
      setObjPodcast(portalPagesConfig.objetivosPodcast || "");
      setObjComunidade(portalPagesConfig.objetivosComunidade || "");
      setObjCursos(portalPagesConfig.objetivosCursos || "");
      setEndEdificio(portalPagesConfig.enderecoEdificio || "");
      setEndRua(portalPagesConfig.enderecoRua || "");
      setEndBairro(portalPagesConfig.enderecoBairro || "");
      setEndComp(portalPagesConfig.enderecoComplemento || "");
      setEndMapEmbed(portalPagesConfig.enderecoMapEmbed || "");
      setEndMapViewer(portalPagesConfig.enderecoMapViewer || "");
      setContEmail(portalPagesConfig.contatoEmail || "podcastdocomecoaotopojf@gmail.com");
      setContWhatsapp(
        (!portalPagesConfig.contatoWhatsapp || portalPagesConfig.contatoWhatsapp.includes("98412") || portalPagesConfig.contatoWhatsapp.includes("9999"))
          ? "+55 32 99194-7690"
          : portalPagesConfig.contatoWhatsapp
      );
      setContInstagram(portalPagesConfig.contatoInstagram || "");

      // Sync Extended properties
      setComunidadeTitle(portalPagesConfig.comunidadeTitle || "");
      setComunidadeDescription(portalPagesConfig.comunidadeDescription || "");
      setEventosTitle(portalPagesConfig.eventosTitle || "");
      setEventosDescription(portalPagesConfig.eventosDescription || "");
      setGaleriaTitle(portalPagesConfig.galeriaTitle || "");
      setGaleriaDescription(portalPagesConfig.galeriaDescription || "");
      setEmbaixadoresTitle(portalPagesConfig.embaixadoresTitle || "");
      setEmbaixadoresDescription(portalPagesConfig.embaixadoresDescription || "");
      setVagasTitle(portalPagesConfig.vagasTitle || "");
      setVagasDescription(portalPagesConfig.vagasDescription || "");
      setCursosTitle(portalPagesConfig.cursosTitle || "");
      setCursosDescription(portalPagesConfig.cursosDescription || "");
      setPodcastTitle(portalPagesConfig.podcastTitle || "");
      setPodcastDescription(portalPagesConfig.podcastDescription || "");
      setAnunciePara1(portalPagesConfig.anunciePara1 || "");
      setAnuncieSec1Title(portalPagesConfig.anuncieSec1Title || "");
      setAnuncieSec1Text(portalPagesConfig.anuncieSec1Text || "");
      setAnuncieSec2Title(portalPagesConfig.anuncieSec2Title || "");
      setAnuncieSec2Text(portalPagesConfig.anuncieSec2Text || "");
      setAnuncieSec3Title(portalPagesConfig.anuncieSec3Title || "");
      setAnuncieSec3Text(portalPagesConfig.anuncieSec3Text || "");
      setAnuncieEmail(portalPagesConfig.anuncieEmail || "");
      setContatoTitle(portalPagesConfig.contatoTitle || "");
      setContatoDescription(portalPagesConfig.contatoDescription || "");
      setLocalParceiros(portalPagesConfig.parceirosList || []);
    }
  }, [portalPagesConfig]);

  const handleSavePagesDetail = () => {
    const updated = {
      ...portalPagesConfig,
      quemSomosP1: qsP1,
      quemSomosP2: qsP2,
      quemSomosP3: qsP3,
      quemSomosP4: qsP4,
      quemSomosQuote: qsQuote,
      objetivosPortal: objPortal,
      objetivosPodcast: objPodcast,
      objetivosComunidade: objComunidade,
      objetivosCursos: objCursos,
      enderecoEdificio: endEdificio,
      enderecoRua: endRua,
      enderecoBairro: endBairro,
      enderecoComplemento: endComp,
      enderecoMapEmbed: endMapEmbed,
      enderecoMapViewer: endMapViewer,
      contatoEmail: contEmail,
      contatoWhatsapp: contWhatsapp,
      contatoInstagram: contInstagram,

      // Save Extended fields
      comunidadeTitle: comunidadeTitle,
      comunidadeDescription: comunidadeDescription,
      eventosTitle: eventosTitle,
      eventosDescription: eventosDescription,
      galeriaTitle: galeriaTitle,
      galeriaDescription: galeriaDescription,
      embaixadoresTitle: embaixadoresTitle,
      embaixadoresDescription: embaixadoresDescription,
      vagasTitle: vagasTitle,
      vagasDescription: vagasDescription,
      cursosTitle: cursosTitle,
      cursosDescription: cursosDescription,
      podcastTitle: podcastTitle,
      podcastDescription: podcastDescription,
      anunciePara1: anunciePara1,
      anuncieSec1Title: anuncieSec1Title,
      anuncieSec1Text: anuncieSec1Text,
      anuncieSec2Title: anuncieSec2Title,
      anuncieSec2Text: anuncieSec2Text,
      anuncieSec3Title: anuncieSec3Title,
      anuncieSec3Text: anuncieSec3Text,
      anuncieEmail: anuncieEmail,
      contatoTitle: contatoTitle,
      contatoDescription: contatoDescription,
      parceirosList: localParceiros,
      cursosList: localCursos,
    };
    onSavePortalPagesConfig(updated);
    playSuccessSound();
    setPagesSuccessMsg("Conteúdo de todas as páginas salvo com sucesso e atualizado no portal!");
    setTimeout(() => setPagesSuccessMsg(""), 4500);
  };

  // Real-time readers state
  const [activeReaders, setActiveReaders] = useState(158);
  const [totalSharesCount, setTotalSharesCount] = useState(3894);
  const [simulationSpeed, setSimulationSpeed] = useState<"normal" | "fast">("normal");

  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 11) - 5; // -5 to +5
      setActiveReaders((prev) => Math.max(130, prev + delta));
      if (Math.random() > 0.55) {
        setTotalSharesCount((prev) => prev + 1);
      }
    }, simulationSpeed === "fast" ? 1000 : 3500);

    return () => clearInterval(interval);
  }, [simulationSpeed]);

  const handleAdminTabChange = (tab: typeof activeAdminTab) => {
    playClickSound(750, "sine");
    setActiveAdminTab(tab);
  };

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !content) {
      playNegativeSound();
      toast.error("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    const tagList = tags.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

    const newArt: NewsArticle = {
      id: `art-${Date.now()}`,
      title,
      excerpt,
      content,
      category,
      author,
      date: new Date().toISOString(),
      readTime: `${Math.max(2, Math.round(content.length / 450))} min`,
      imageUrl: image,
      views: Math.floor(Math.random() * 40) + 12,
      shares: 0,
      likes: 0,
      isPremium,
      location,
      tags: tagList,
      commentsCount: 0,
    };

    onAddArticle(newArt);
    playSuccessSound();

    // Reset Fields
    setTitle("");
    setExcerpt("");
    setContent("");
    const msg = category === "EVENTOS" 
      ? "Evento cadastrado e salvo com sucesso! Acesse a aba EVENTOS no portal para visualizá-lo."
      : "Publicado em destaque no banco WP-Admin regional!";
    setSuccessMsg(msg);
    toast.success(msg);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleApplyAppearance = () => {
    playSuccessSound();
    onSaveLogo({
      customImageUrl: logoUrl,
      customLogoWidth: logoSize,
      customLogoHeight: logoSize,
      customText1: logoText1,
      customText2: logoText2,
      customSub: logoSlogan,
    });
    onSaveFooterCredits(localCredits);
  };

  const handleTestBeep = (freq: number, style: OscillatorType) => {
    playClickSound(freq, style);
  };

  // Convert current articles data live for charts
  const barChartData = articles.slice(0, 7).map((art) => ({
    name: art.title.length > 18 ? art.title.substring(0, 16) + "..." : art.title,
    "Visualizações": art.views,
    "Shares": art.shares * 4 + 2,
  }));

  const lineHistoryData = [
    { name: "Seg", Assinantes: 4200, "Cliques Ativos": 1100 },
    { name: "Ter", Assinantes: 4280, "Cliques Ativos": 1250 },
    { name: "Qua", Assinantes: 4400, "Cliques Ativos": 1500 },
    { name: "Qui", Assinantes: 4560, "Cliques Ativos": 1780 },
    { name: "Sex", Assinantes: 4700, "Cliques Ativos": 1950 },
    { name: "Sáb", Assinantes: 4980, "Cliques Ativos": 2300 },
    { name: "Dom", Assinantes: 5120, "Cliques Ativos": 2680 },
  ];

  return (
    <div id="wp-custom-dashboard-layout" className="flex flex-col lg:flex-row gap-6 font-sans">
      
      {/* WORDPRESS DARK SIDEBAR */}
      <aside className="w-full lg:w-64 bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl shrink-0">
        {/* Brand header like WP-Admin logo block */}
        <div className="p-4 bg-zinc-900/60 border-b border-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-green-400 to-pink-500 flex items-center justify-center text-black font-black text-[10px] shadow-md animate-pulse">
              WP
            </div>
            <div>
              <h4 className="font-display font-black text-xs text-white uppercase tracking-wider">WP-Painel</h4>
              <span className="text-[8px] text-zinc-500 font-mono block">v2026.5.22.Beta</span>
            </div>
          </div>
          {/* Status Indicator */}
          <button
            onClick={() => handleAdminTabChange("offline")}
            className={`text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded border transition flex items-center gap-1 ${
              isOfflineModeActive()
                ? "text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20"
                : "text-[#22c55e] bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
            }`}
            title="Clique para gerenciar Modo Offline & Cache"
          >
            {isOfflineModeActive() ? (
              <>
                <WifiOff className="w-2.5 h-2.5 text-amber-400" />
                <span>OFFLINE</span>
              </>
            ) : (
              <>
                <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                <span>ONLINE</span>
              </>
            )}
          </button>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <nav className="p-2.5 space-y-1">
          <button
            onClick={() => handleAdminTabChange("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "dashboard"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Painel do WordPress</span>
          </button>

          <button
            onClick={() => handleAdminTabChange("new_post")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "new_post"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="flex-1">Escrever Postagem</span>
            <span className="text-[8px] bg-[#22c55e] text-black font-mono font-bold px-1.5 rounded-full">Novo</span>
          </button>

          <button
            onClick={() => handleAdminTabChange("manage_posts")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "manage_posts"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="flex-1">Gerenciar Posts</span>
            <span className="text-[8px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded-md font-mono">
              {articles.length}
            </span>
          </button>

          <button
            onClick={() => handleAdminTabChange("appearance")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "appearance"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Aparência & Degradês</span>
          </button>

          <button
            onClick={() => handleAdminTabChange("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "settings"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações WP</span>
          </button>

          <button
            onClick={() => handleAdminTabChange("pages")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "pages"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <Layout className="w-4 h-4" />
            <span className="flex-1">Editar Páginas / Seções</span>
            <span className="text-[8px] bg-pink-550 text-white px-1.5 py-0.5 rounded-md font-mono font-bold">
              Todas
            </span>
          </button>
          
          <button
            onClick={() => handleAdminTabChange("enrollments")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "enrollments"
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-pink-400" />
            <span className="flex-1">Matrículas & Planos</span>
            <span className="text-[8px] bg-pink-500 text-white font-mono font-bold px-1.5 py-0.5 rounded-full">PLANOS</span>
          </button>
          
          <button
            onClick={() => handleAdminTabChange("users" as any)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === ("users" as any)
                ? "bg-gradient-to-r from-green-500/20 to-pink-500/5 text-[#22c55e] border-l-3 border-[#22c55e] font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span className="flex-1">Gestão de Usuários & Acessos</span>
            <span className="text-[8px] bg-amber-500 text-black font-mono font-bold px-1.5 py-0.5 rounded-full">LIBERAÇÃO</span>
          </button>

          <button
            onClick={() => handleAdminTabChange("offline")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium tracking-wide transition ${
              activeAdminTab === "offline"
                ? "bg-gradient-to-r from-amber-500/20 to-emerald-500/10 text-amber-300 border-l-3 border-amber-400 font-bold"
                : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
            }`}
          >
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span className="flex-1">Modo Offline & Cache</span>
            <span className="text-[8px] bg-amber-500/90 text-black font-mono font-bold px-1.5 py-0.5 rounded-full">PWA</span>
          </button>
        </nav>

        {/* Dynamic Widget Section inside sidebar */}
        <div className="m-4 p-3 bg-zinc-900/40 rounded-xl border border-zinc-900 space-y-2">
          <span className="text-[9px] text-[#22c55e] font-mono leading-none tracking-wider font-bold block uppercase">
            ⚡ Status de Render
          </span>
          <p className="text-[10px] text-zinc-400 leading-normal">
            Os gradientes de <strong>Verde e Rosa</strong> ativos operam com aceleração de hardware GPU.
          </p>
        </div>

        {/* Google Auth Admin Panel */}
        <div className="m-4 p-3 bg-stone-900/60 rounded-xl border border-zinc-800 space-y-3">
          <span className="text-[9px] text-pink-500 font-mono leading-none tracking-wider font-bold block uppercase flex items-center gap-1">
            <Unlock className="w-3 h-3 text-pink-500" /> Autenticação Google
          </span>
          {user?.isAuthenticated ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {user.photoUrl && (
                  <img src={user.photoUrl} alt="avatar" className="w-7 h-7 rounded-full border border-green-400" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-[10px] text-white line-clamp-1">{user.name}</span>
                  <span className="text-[8px] text-zinc-400 font-mono line-clamp-1">{user.email || "Administrador"}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  playClickSound(600, "sine");
                  onLogout?.();
                }}
                className="w-full py-1.5 px-3 rounded-lg text-[9px] font-mono tracking-wider font-bold uppercase transition bg-red-950/40 border border-red-905/40 text-red-400 hover:bg-red-900 hover:text-white flex items-center justify-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Desconectar</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[9px] text-zinc-400 leading-normal font-mono">
                Faça login para salvar suas edições no servidor.
              </p>
              <button
                type="button"
                onClick={() => {
                  playClickSound(700, "sine");
                  onTriggerAuth?.();
                }}
                className="w-full py-2 px-3 rounded-xl text-[10px] font-mono tracking-widest font-black uppercase transition-all duration-300 bg-stone-950 border border-green-500 hover:border-green-400 text-green-400 hover:text-white flex items-center justify-center gap-1.5"
                id="connect-google-btn-admin"
              >
                <Unlock className="w-3 h-3" />
                <span>Entrar (Google)</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* CORE WORKSPACE CONTENT PANEL */}
      <main className="flex-1 p-6 bg-zinc-950/80 border border-zinc-900 rounded-2xl shadow-xl min-h-[500px]">
        
        {/* TAB 1: GENERAL MONITOR PORTAL DASHBOARD */}
        {activeAdminTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Real-time metrics bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="p-4 bg-black border border-green-500/30 rounded-xl relative overflow-hidden">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Leitores de Conteúdo de Campo</span>
                <div className="text-2xl font-display font-black text-white mt-1 flex items-baseline gap-1">
                  <span>{activeReaders}</span>
                  <span className="text-[10px] text-green-400 font-mono animate-pulse">● LIVE</span>
                </div>
                <div className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </div>
              </div>

              <div className="p-4 bg-black border border-pink-500/30 rounded-xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Ações de Compartilhar</span>
                  <div className="text-2xl font-display font-black text-white mt-1">
                    {totalSharesCount}
                  </div>
                </div>
                <button
                  onClick={() => {
                    playClickSound(620, "triangle");
                    setSimulationSpeed((prev) => (prev === "normal" ? "fast" : "normal"));
                  }}
                  className="mt-2 text-[8px] bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 py-0.5 px-2 rounded-md font-mono border border-pink-500/25 transition-all text-center self-start"
                >
                  SIMULAR {simulationSpeed === "fast" ? "RÁPIDO ⚡" : "NORMAL"}
                </button>
              </div>

              <div className="p-4 bg-black border border-zinc-800 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Assinantes no Portal</span>
                <div className="text-2xl font-display font-black text-white mt-1">5,142</div>
                <span className="text-[8px] text-green-400 font-mono block mt-1">+14% crescimento</span>
              </div>

              <div className="p-4 bg-black border border-zinc-800 rounded-xl">
                <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold">Engajamento Médio</span>
                <div className="text-2xl font-display font-black text-[#22c55e] mt-1">87.4%</div>
                <span className="text-[8px] text-zinc-500 font-mono block mt-1">Cliques validados</span>
              </div>

            </div>

            {/* Quick Offline Mode Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-white">Navegação e Acesso 100% Offline</h5>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">RECURSOS NATIVOS</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 max-w-2xl leading-normal">
                    Todos os artigos, membros da comunidade, podcasts e páginas institucionais funcionam mesmo sem sinal de internet ou no modo avião.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleAdminTabChange("offline")}
                className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-xl text-xs font-mono font-bold transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Painel Offline & PWA →</span>
              </button>
            </div>

            {/* Visual Recharts Graphics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              <div className="p-4 bg-black border border-zinc-850 rounded-xl space-y-3">
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-900">
                  <BarChart3 className="w-4 h-4 text-green-400" />
                  <span>Real-Time Cliques por Matéria (Top 7)</span>
                </h4>
                <div className="h-56 min-h-[224px] w-full min-w-0 text-[10px] font-mono">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1e" />
                      <XAxis dataKey="name" stroke="#737373" />
                      <YAxis stroke="#737373" />
                      <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a" }} />
                      <Bar dataKey="Visualizações" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="p-4 bg-black border border-zinc-850 rounded-xl space-y-3">
                <h4 className="font-display font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-900">
                  <Activity className="w-4 h-4 text-pink-400" />
                  <span>Crescimento de Cliques e Newsletter</span>
                </h4>
                <div className="h-56 min-h-[224px] w-full min-w-0 text-[10px] font-mono">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
                    <AreaChart data={lineHistoryData}>
                      <defs>
                        <linearGradient id="colorAssin" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorCliq" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1e" />
                      <XAxis dataKey="name" stroke="#737373" />
                      <YAxis stroke="#737373" />
                      <Tooltip contentStyle={{ backgroundColor: "#0c0c0e", borderColor: "#27272a" }} />
                      <Area type="monotone" dataKey="Assinantes" stroke="#22c55e" fill="url(#colorAssin)" />
                      <Area type="monotone" dataKey="Cliques Ativos" stroke="#ec4899" fill="url(#colorCliq)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Quick stats note details */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 via-pink-500/5 to-black border border-zinc-900 rounded-xl flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-white font-bold block">Boas-vindas ao WP-Admin do Portal!</span>
                <span className="text-[11px] text-zinc-400 block max-w-xl">
                  Edição descomplicada estilo WordPress. Troque cores, altere nomes do cabeçalho de notícias, gerencie o canal de podcasts, acompanhe tendências de curtidas e otimize a experiência auditiva do usuário da Zona da Mata.
                </span>
              </div>
              <button
                onClick={() => handleAdminTabChange("new_post")}
                className="px-4 py-2 font-mono font-bold text-[10px] text-black bg-[#22c55e] hover:bg-green-400 rounded-xl transition uppercase"
              >
                Nova Postagem →
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: WRITE NEW BLOG POST FORM */}
        {activeAdminTab === "new_post" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
              <PlusCircle className="w-5 h-5 text-[#22c55e]" />
              <div>
                <h3 className="font-display font-black text-sm uppercase text-white tracking-widest">
                  Escrever Nova Matéria Regional
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono block">Crie novos tópicos e salve diretamente no feed regional</span>
              </div>
            </div>

            {successMsg && (
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-400 font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handlePublishPost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">
                    Título da Publicação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Novo Café Tecnológico de Ubá"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-450"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">
                    Categoria da Notícia *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full p-2.5 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-green-400"
                  >
                    <option value="NOTÍCIAS">NOTÍCIAS</option>
                    <option value="CURSOS">CURSOS</option>
                    <option value="VAGA DE EMPREGOS">VAGA DE EMPREGOS</option>
                    <option value="EVENTOS">EVENTOS</option>
                    <option value="PODCAST">PODCAST</option>
                    <option value="COMUNIDADE">COMUNIDADE (🔒 VIP)</option>
                    <option value="EMBAIXADORES">EMBAIXADORES (🔒 VIP)</option>
                    <option value="TOUR">TOUR GASTRO</option>
                    <option value="QUEM SOMOS">QUEM SOMOS</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">
                  Linha Fina / Sumário Rápido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sumário atraente visualizado no feed do portal..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-green-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Localidade</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Nome do Redator</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Etiquetas (Tags)</label>
                  <input
                    type="text"
                    placeholder="Separe por vírgulas..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="text-xs text-white font-bold block">Bloqueio Premium de Leitores</span>
                  <span className="text-[10px] text-zinc-500 font-mono">Requer login no e-mail do Google (Gmail) regional</span>
                </div>
                <input
                  type="checkbox"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="w-4.5 h-4.5 text-green-500 cursor-pointer focus:ring-0 bg-stone-900 border-zinc-700 rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Imagens da Notícia (Capa)</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local File Uploader zone */}
                  <div
                    onClick={() => articleFileInputRef.current?.click()}
                    className={`h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition p-2 relative overflow-hidden ${
                      image.startsWith("data:image/")
                        ? "border-green-400 bg-green-400/5"
                        : "border-zinc-800 hover:border-green-400/50 hover:bg-zinc-900/10"
                    }`}
                  >
                    <input
                      ref={articleFileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                          if (!allowedTypes.includes(file.type)) {
                            toast.error("Formato de arquivo não suportado! Envie apenas fotos em formato JPG, PNG ou WEBP.");
                            return;
                          }
                          try {
                            toast.loading("Otimizando imagem para edição...", { id: "cms-upload" });
                            const compressedB64 = await compressImageFile(file, { maxDimension: 1400, quality: 0.85 });
                            setCropperSource(compressedB64);
                            setIsCropperOpen(true);
                            toast.dismiss("cms-upload");
                          } catch (err: any) {
                            toast.error("Erro ao processar imagem: " + (err.message || "Erro"), { id: "cms-upload" });
                          }
                        }
                      }}
                    />
                    
                    {image.startsWith("data:image/") ? (
                      <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl bg-black/60">
                        <img src={image} alt="Preview do arquivo" className="max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setImage(PRESET_IMGS[0]); }}
                          className="absolute top-1 right-1 p-1 rounded-lg bg-black/95 text-white hover:text-red-400 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center space-y-1">
                        <Upload className="w-5 h-5 mx-auto text-green-400 animate-pulse" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-white">Upload Capa Local</p>
                          <p className="text-[8px] text-zinc-500 font-mono">Clique para subir de seu computador</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] text-zinc-500 uppercase font-mono leading-none font-bold mb-1">Presets Disponíveis</span>
                    <div className="flex items-center gap-1.5 pb-1.5 overflow-x-auto">
                      {PRESET_IMGS.map((p, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            playClickSound(600 + i * 50);
                            setImage(p);
                          }}
                          className={`relative w-12 h-8 rounded-md border-2 shrink-0 overflow-hidden transition-all ${
                            image === p ? "border-green-400 scale-102 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img src={p} alt="Preset visual" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Ou cole uma URL de imagem (ex: https://...)"
                      value={image.startsWith("data:image/") ? "" : image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full p-2 rounded-lg bg-stone-900 border border-zinc-800 text-[10px] text-white placeholder-zinc-600 focus:outline-none focus:border-green-450 font-mono"
                      disabled={image.startsWith("data:image/")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-sans">
                <label className="text-[10px] text-zinc-400 uppercase font-mono font-bold block">Editorial Completo *</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Redija o texto da matéria..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-stone-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-green-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-400 to-pink-500 text-black font-display font-black tracking-widest uppercase text-xs rounded-xl hover:opacity-90 active:scale-98 transition duration-200"
              >
                Salvar e Publicar no Portal (Estilo WordPress)
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MANAGE POSTS LIST */}
        {activeAdminTab === "manage_posts" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-pink-400" />
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-white tracking-widest">
                    Gerenciar Matérias Cadastradas
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono block">Apague notícias ou acompanhe a visualização de cliques local</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Total: {articles.length} posts</span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {articles.map((art) => (
                <div
                  key={art.id}
                  className="p-4 rounded-xl bg-neutral-950 border border-zinc-900 hover:border-zinc-800 flex items-center justify-between gap-4 transition group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-12 h-10 object-cover rounded-lg bg-zinc-900 shrink-0 border border-zinc-800"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded uppercase font-mono font-bold">
                          {art.category}
                        </span>
                        {art.isPremium && (
                          <span className="text-[8px] bg-pink-500/10 text-pink-400 px-1 border border-pink-500/15 rounded font-mono font-bold">
                            PREMIUM
                          </span>
                        )}
                        <span className="text-[9px] text-zinc-500 font-mono">{art.location}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate max-w-md mt-1 group-hover:text-[#22c55e] transition">
                        {art.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-green-400" />
                      {art.views} views
                    </span>

                    <button
                      onClick={() => {
                        playClickSound(180, "sawtooth");
                        onDeleteArticle(art.id);
                      }}
                      className="p-2 bg-zinc-900 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-lg border border-zinc-850 hover:border-red-500/20 transition"
                      title="Apagar Postagem"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: APPEARANCE & GRADIENTS CUSTOMIZER */}
        {activeAdminTab === "appearance" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Palette className="w-5 h-5 text-green-400 animate-spin-slow" />
              <div>
                <h3 className="font-display font-black text-sm uppercase text-white tracking-widest">
                  Estilo de Aparência: Degradês Verde & Rosa
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono block">Personalize o espectro de fluorescência neon e layouts</span>
              </div>
            </div>

            {/* Select Gradient Presets */}
            <div className="space-y-3">
              <label className="text-[10.5px] uppercase font-mono text-zinc-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Selecione o Efeito de Degradê Ativo:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                <button
                  onClick={() => {
                    playClickSound(800, "sine");
                    onSelectGradientStyle("neonPulse");
                  }}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden group ${
                    gradientStyle === "neonPulse"
                      ? "bg-stone-900/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                      : "bg-black border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="absolute top-0 right-0 h-1 w-1/2 bg-gradient-to-r from-green-400 to-pink-500"></div>
                  <span className="text-[11px] font-bold text-white block uppercase mb-1">⚡ Verde & Rosa Pulsante</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Glow marcante do logotipo e dos cabeçalhos principais do portal.</p>
                </button>

                <button
                  onClick={() => {
                    playClickSound(850, "sine");
                    onSelectGradientStyle("auroraGreenPink");
                  }}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden group ${
                    gradientStyle === "auroraGreenPink"
                      ? "bg-stone-900/40 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                      : "bg-black border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="absolute top-0 right-0 h-1 w-1/2 bg-gradient-to-r from-pink-500 to-green-400"></div>
                  <span className="text-[11px] font-bold text-white block uppercase mb-1">🌈 Aurora Meridional</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Transição fluida unindo o verde folha e cor-de-rosa amarena.</p>
                </button>

                <button
                  onClick={() => {
                    playClickSound(900, "sine");
                    onSelectGradientStyle("pinkGlow");
                  }}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden group ${
                    gradientStyle === "pinkGlow"
                      ? "bg-stone-900/40 border-rose-500/50"
                      : "bg-black border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="absolute top-0 right-0 h-1 w-1/2 bg-rose-500"></div>
                  <span className="text-[11px] font-bold text-white block uppercase mb-1">🌸 Rosa Neon Exclusivo</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Sombreamentos hot-pink ideais para visualização noturna de celular.</p>
                </button>

                <button
                  onClick={() => {
                    playClickSound(950, "sine");
                    onSelectGradientStyle("subtleSpring");
                  }}
                  className={`p-4 rounded-xl border text-left transition relative overflow-hidden group ${
                    gradientStyle === "subtleSpring"
                      ? "bg-stone-900/40 border-green-400/50"
                      : "bg-black border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="absolute top-0 right-0 h-1 w-1/2 bg-green-400"></div>
                  <span className="text-[11px] font-bold text-white block uppercase mb-1">🌱 Primavera Ecológica</span>
                  <p className="text-[10px] text-zinc-400 leading-normal">Accents verdes discretos, ideal para leitura corporativa prolongada.</p>
                </button>

              </div>
            </div>

            {/* Direct Logos Editing Fields */}
            <div className="space-y-3.5 border-t border-zinc-900 pt-4">
              <label className="text-[10.5px] uppercase font-mono text-zinc-400 font-bold block">
                Textos e Slogan da Plataforma:
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-black p-4 rounded-xl border border-zinc-900">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono">Texto Logo 1</span>
                  <input
                    type="text"
                    value={logoText1}
                    onChange={(e) => setLogoText1(e.target.value)}
                    className="w-full p-2 bg-zinc-900 text-xs text-white rounded border border-zinc-850 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono">Texto Logo 2 (Glow)</span>
                  <input
                    type="text"
                    value={logoText2}
                    onChange={(e) => setLogoText2(e.target.value)}
                    className="w-full p-2 bg-zinc-900 text-xs text-white rounded border border-zinc-850 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono">Linha Slogan do Cabeçalho</span>
                  <input
                    type="text"
                    value={logoSlogan}
                    onChange={(e) => setLogoSlogan(e.target.value)}
                    className="w-full p-2 bg-zinc-900 text-xs text-white rounded border border-zinc-850"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold text-[#22c55e]">Copyright / Rodapé</span>
                  <input
                    type="text"
                    value={localCredits}
                    onChange={(e) => setLocalCredits(e.target.value)}
                    className="w-full p-2 bg-zinc-900 text-xs text-white rounded border border-zinc-850 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleApplyAppearance}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-pink-500 text-black font-mono font-black uppercase text-xs rounded-xl tracking-wider hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Gravar Aparência no Portal</span>
            </button>
            <p className="text-[9px] text-zinc-500 text-center font-mono leading-none">
              A pré-visualização de cores e rodapés altera instantaneamente sem recarregar!
            </p>
          </div>
        )}

        {/* TAB 5: QUICK WP SETTINGS & AUDIO CHIP */}
        {activeAdminTab === "settings" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Settings className="w-5 h-5 text-[#22c55e]" />
              <div>
                <h3 className="font-display font-black text-sm uppercase text-white tracking-widest">
                  Configurações Gerais WP & Audio-Cues
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono block">Configure preferência de cliques, beeps e o editor CMS</span>
              </div>
            </div>

            {/* Sound Toggle Box */}
            <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-white font-bold block flex items-center gap-1.5">
                    {isSoundActive ? <Volume2 className="w-4 h-4 text-[#22c55e] animate-bounce" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                    Sons ao clicar (Interface SoundEffects)
                  </span>
                  <span className="text-[10.5px] text-zinc-500 leading-normal">
                    Se habilitado, beeps analógicos sintetizados de onda são tocados na navegação de abas e botões do portal.
                  </span>
                </div>
                <input
                  type="checkbox"
                  id="chk-audio"
                  checked={isSoundActive}
                  onChange={(e) => {
                    const nextVal = e.target.checked;
                    onToggleSound(nextVal);
                    if (nextVal) {
                      setTimeout(() => playSuccessSound(), 100);
                    }
                  }}
                  className="w-4.5 h-4.5 text-green-500 cursor-pointer focus:ring-0 bg-zinc-900 border-zinc-800 rounded ml-2 shrink-0"
                />
              </div>

              {/* Speaker beeps preview triggers */}
              {isSoundActive && (
                <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-850 space-y-2.5">
                  <span className="text-[9px] text-zinc-400 font-mono block font-bold">
                    🎚️ Teste de Sintetizador Web Audio API:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleTestBeep(320, "triangle")}
                      className="py-1 px-2.5 text-[9px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 hover:border-green-400 rounded transition"
                    >
                      Low Note (320Hz)
                    </button>
                    <button
                      onClick={() => handleTestBeep(640, "sine")}
                      className="py-1 px-2.5 text-[9px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 hover:border-pink-500 rounded transition"
                    >
                      Mid Note (640Hz)
                    </button>
                    <button
                      onClick={() => handleTestBeep(980, "square")}
                      className="py-1 px-2.5 text-[9px] font-mono text-zinc-300 bg-zinc-950 border border-zinc-800 hover:border-green-400 rounded transition"
                    >
                      High Note (980Hz)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats logs list */}
            <div className="space-y-2 p-4 rounded-xl bg-black border border-zinc-850">
              <span className="text-xs text-zinc-300 font-bold block flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Diagnóstico de Memória WP Cache
              </span>
              <p className="text-[9.5px] text-zinc-500 leading-normal">
                Nenhuma alteração feita aqui fará posts ou personalizações de rodapés se perderem no ar ao alternar o estúdio. O site se adapta em tempo real por meio de estados transparentes (React Hooks).
              </p>
              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                <span>Instância Node/Vite</span>
                <span className="text-green-400">● Conectado (v18.0)</span>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound(600, "sine");
                toast.success("As configurações do painel WordPress foram persistidas!");
              }}
              className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono rounded-lg transition hover:text-white hover:border-zinc-700"
            >
              Salvar Tudo Permanente
            </button>
          </div>
        )}

        {/* TAB 7: ENROLLMENTS */}
        {activeAdminTab === "enrollments" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">Relatórios de Matrícula</h3>
                <p className="text-zinc-400 text-sm mt-1">Gerencie os cadastros para os planos da comunidade.</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/40">
                <h4 className="font-bold text-white text-sm">Lista de Cadastros Recentes</h4>
                <div className="text-[10px] text-zinc-500 font-mono">{communityEnrollments.length} Registros Encontrados</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/60 text-zinc-400 font-mono text-[10px] uppercase tracking-widest border-b border-zinc-800">
                      <th className="p-4 font-bold">Data</th>
                      <th className="p-4 font-bold">Nome</th>
                      <th className="p-4 font-bold">WhatsApp</th>
                      <th className="p-4 font-bold">Segmento</th>
                      <th className="p-4 font-bold">Plano Escolhido</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-zinc-300">
                    {loadingEnrollments ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-pink-500" />
                            Carregando dados...
                          </div>
                        </td>
                      </tr>
                    ) : communityEnrollments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono text-xs">Nenhuma matrícula registrada ainda.</td>
                      </tr>
                    ) : (
                      communityEnrollments.slice().reverse().map((enrollment, index) => (
                        <tr key={index} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition">
                          <td className="p-4 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                            {new Date(enrollment.createdAt).toLocaleString("pt-BR")}
                          </td>
                          <td className="p-4 font-bold text-white">{enrollment.name}</td>
                          <td className="p-4 font-mono text-green-400">
                            <a href={`https://wa.me/${enrollment.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              {enrollment.whatsapp}
                            </a>
                          </td>
                          <td className="p-4 text-zinc-400">{enrollment.sector || "-"}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                              {enrollment.plan}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: USERS MANAGEMENT (APPROVALS & STATUS) */}
        {activeAdminTab === ("users" as any) && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight flex items-center gap-2.5">
                  <UserCheck className="w-6 h-6 text-amber-400" />
                  <span>Gestão de Usuários & Aprovação de Acessos</span>
                </h3>
                <p className="text-zinc-400 text-sm mt-1">
                  Gerencie cadastros pendentes, aprove membros VIP em 1 clique e envie confirmação automática via WhatsApp ou E-mail.
                </p>
              </div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Novo Membro Manual</span>
                </button>
                <button
                  onClick={fetchUsersList}
                  disabled={loadingUsers}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? "animate-spin text-amber-400" : ""}`} />
                  <span>Atualizar</span>
                </button>
              </div>
            </div>

            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block">Total Cadastrados</span>
                <span className="text-2xl font-black text-white font-mono mt-1 block">{usersList.length}</span>
              </div>
              <div className="bg-zinc-950 border border-green-900/40 rounded-xl p-3.5">
                <span className="text-[10px] text-green-400 font-mono uppercase tracking-wider block">Aprovados / VIP</span>
                <span className="text-2xl font-black text-green-400 font-mono mt-1 block">
                  {usersList.filter(u => u.status === "approved").length}
                </span>
              </div>
              <div className="bg-zinc-950 border border-amber-900/40 rounded-xl p-3.5">
                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-wider block">Em Teste 14D</span>
                <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">
                  {usersList.filter(u => u.status === "trial").length}
                </span>
              </div>
              <div className="bg-zinc-950 border border-red-900/40 rounded-xl p-3.5">
                <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider block">Pendentes / Em Análise</span>
                <span className="text-2xl font-black text-red-400 font-mono mt-1 block">
                  {usersList.filter(u => u.status === "suspended" || u.status === "pending" || !u.status).length}
                </span>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, e-mail..."
                  className="w-full pl-10 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <button
                  onClick={() => setUserStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    userStatusFilter === "all" ? "bg-amber-400 text-zinc-950" : "bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                >
                  Todos ({usersList.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter("suspended")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    userStatusFilter === "suspended" ? "bg-red-500 text-white" : "bg-zinc-900 text-red-400 hover:text-white"
                  }`}
                >
                  Pendentes ({usersList.filter(u => u.status === "suspended" || u.status === "pending" || !u.status).length})
                </button>
                <button
                  onClick={() => setUserStatusFilter("approved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    userStatusFilter === "approved" ? "bg-green-500 text-zinc-950 font-black" : "bg-zinc-900 text-green-400 hover:text-white"
                  }`}
                >
                  Aprovados ({usersList.filter(u => u.status === "approved").length})
                </button>
                <button
                  onClick={() => setUserStatusFilter("trial")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer whitespace-nowrap ${
                    userStatusFilter === "trial" ? "bg-amber-500 text-zinc-950 font-black" : "bg-zinc-900 text-amber-400 hover:text-white"
                  }`}
                >
                  Teste 14d ({usersList.filter(u => u.status === "trial").length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/40">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                  <h4 className="font-bold text-white text-sm">Lista de Usuários no Banco de Dados</h4>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">Sincronizado com Firestore</div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] text-zinc-500 uppercase font-mono tracking-widest">
                      <th className="p-4">Usuário</th>
                      <th className="p-4">E-mail & Contato</th>
                      <th className="p-4">Status de Acesso</th>
                      <th className="p-4">Função / Perfil</th>
                      <th className="p-4 text-right">Ações de Liberação & Contato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/50 text-xs text-zinc-300">
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">Carregando usuários do portal...</td>
                      </tr>
                    ) : (() => {
                      const filtered = usersList.filter(u => {
                        const matchSearch =
                          !userSearchTerm ||
                          (u.name && u.name.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
                          (u.email && u.email.toLowerCase().includes(userSearchTerm.toLowerCase())) ||
                          (u.phone && u.phone.includes(userSearchTerm));
                        
                        if (!matchSearch) return false;
                        if (userStatusFilter === "all") return true;
                        if (userStatusFilter === "suspended") return u.status === "suspended" || u.status === "pending" || !u.status;
                        return u.status === userStatusFilter;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-zinc-500 font-mono">
                              Nenhum usuário encontrado para os filtros selecionados.
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((u, idx) => {
                        const waLink = generateWhatsAppApprovalLink(u);
                        const mailLink = generateEmailApprovalLink(u);

                        return (
                          <tr key={u.email || idx} className="hover:bg-zinc-900/40 transition">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={u.photoUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(u.email || 'user')}`}
                                  alt={u.name || "Foto"}
                                  className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 object-cover shrink-0"
                                />
                                <div>
                                  <div className="font-bold text-white flex items-center gap-1.5">
                                    <span>{u.name || "Usuário"}</span>
                                    {u.email === "diretoria@portal.com" || u.email === "abautosmaooe@gmail.com" ? (
                                      <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono font-bold">Admin Master</span>
                                    ) : null}
                                  </div>
                                  <div className="text-[10px] text-zinc-500 font-mono">
                                    Cadastrado em: {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "Recente"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-mono text-zinc-300 font-medium">{u.email}</div>
                              {u.phone ? (
                                <div className="text-[11px] text-emerald-400 font-mono mt-0.5">📞 {u.phone}</div>
                              ) : (
                                <div className="text-[10px] text-zinc-600 font-mono">Sem telefone cadastrado</div>
                              )}
                            </td>
                            <td className="p-4">
                              {u.status === "approved" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                  <CheckCircle className="w-3 h-3 text-green-400" /> Aprovado / Ativo
                                </span>
                              ) : u.status === "trial" ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                  <Activity className="w-3 h-3 text-amber-400" /> Teste 14 Dias
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                  <Clock className="w-3 h-3 text-red-400" /> Pendente / Em Análise
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <select
                                value={u.role || "membro"}
                                onChange={(e) => handleUpdateUserStatus(u.email, u.status || "approved", { role: e.target.value as any })}
                                className="bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:border-amber-400 cursor-pointer"
                              >
                                <option value="membro">Membro Comum</option>
                                <option value="vip">Membro VIP</option>
                                <option value="embaixador">Embaixador</option>
                                <option value="anunciante">Anunciante</option>
                                <option value="admin">Administrador</option>
                              </select>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                {u.status !== "approved" ? (
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.email, "approved")}
                                    title="Liberar Acesso Imediatamente"
                                    className="px-2.5 py-1 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-black rounded-lg font-mono font-bold text-[11px] uppercase transition cursor-pointer shadow-sm"
                                  >
                                    🟢 Aprovar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.email, "suspended")}
                                    title="Suspender Acesso"
                                    className="px-2 py-1 bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-lg font-mono font-bold text-[10px] uppercase transition cursor-pointer"
                                  >
                                    🔴 Suspender
                                  </button>
                                )}

                                {u.status !== "trial" && (
                                  <button
                                    onClick={() => handleUpdateUserStatus(u.email, "trial")}
                                    title="Conceder Teste Grátis de 14 Dias"
                                    className="px-2 py-1 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black rounded-lg font-mono font-bold text-[10px] uppercase transition cursor-pointer"
                                  >
                                    🟡 Teste 14d
                                  </button>
                                )}

                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Enviar mensagem pronta de aprovação no WhatsApp"
                                  className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-lg transition inline-flex items-center"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                <a
                                  href={mailLink}
                                  title="Enviar e-mail de aprovação"
                                  className="p-1.5 bg-blue-500/20 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition inline-flex items-center"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>

                                {u.email !== "diretoria@portal.com" && u.email !== "abautosmaooe@gmail.com" && (
                                  <button
                                    onClick={() => handleDeleteUserRecord(u.email)}
                                    title="Remover Registro"
                                    className="p-1.5 bg-zinc-900 hover:bg-red-900/40 text-zinc-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Add Manual User */}
            {showAddUserModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-white text-base">Cadastrar & Liberar Membro</h4>
                    </div>
                    <button
                      onClick={() => setShowAddUserModal(false)}
                      className="text-zinc-500 hover:text-white p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateManualUser} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Ex: João da Silva"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">E-mail de Acesso *</label>
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="Ex: joao@empresa.com.br"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">WhatsApp / Celular (Opcional)</label>
                      <input
                        type="text"
                        value={newUserPhone}
                        onChange={(e) => setNewUserPhone(e.target.value)}
                        placeholder="Ex: 32999998888"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Perfil</label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as any)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        >
                          <option value="vip">Membro VIP</option>
                          <option value="embaixador">Embaixador</option>
                          <option value="anunciante">Anunciante</option>
                          <option value="membro">Membro Comum</option>
                          <option value="admin">Administrador</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1">Status Inicial</label>
                        <select
                          value={newUserStatus}
                          onChange={(e) => setNewUserStatus(e.target.value as any)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        >
                          <option value="approved">🟢 Aprovado (Livre)</option>
                          <option value="trial">🟡 Teste 14 Dias</option>
                          <option value="suspended">🔴 Em Análise</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddUserModal(false)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 rounded-xl text-xs font-bold"
                      >
                        Salvar e Liberar
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: GENERAL PORTAL PAGES CONFIGURATOR */}
        {activeAdminTab === "pages" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-pink-500" />
                <div>
                  <h3 className="font-display font-black text-sm uppercase text-white tracking-widest">
                    Gerenciador de Conteúdo das Páginas
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono block">Escolha uma seção para modificar textos, fotos e endereços ativos no portal</span>
                </div>
              </div>

              {pagesSuccessMsg && (
                <span className="text-[10px] bg-green-500/15 border border-green-500/30 text-green-400 font-mono font-bold px-2.5 py-1 rounded-lg animate-pulse">
                  {pagesSuccessMsg}
                </span>
              )}
            </div>

            {/* Micro-navigation for pages tabs */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-950/80 border border-zinc-900 rounded-xl max-h-[160px] overflow-y-auto">
              {(["quemsomos", "objetivos", "ondeestamos", "contato", "comunidade", "eventos", "galeria", "embaixadores", "vagas", "parceiros", "podcast", "anuncie"] as const).map((sub) => {
                const isActive = selectedSubPage === sub;
                const label = sub === "quemsomos" ? "Quem Somos" :
                              sub === "objetivos" ? "Objetivos" :
                              sub === "ondeestamos" ? "Fisico / Mapa" :
                              sub === "contato" ? "Contatos / Redes" :
                              sub === "comunidade" ? "Comunidade" :
                              sub === "eventos" ? "Eventos" :
                              sub === "galeria" ? "Galeria" :
                              sub === "embaixadores" ? "Embaixadores" :
                              sub === "vagas" ? "Vagas Emprego" :
                              sub === "parceiros" ? "Parceiros" :
                              sub === "podcast" ? "Podcast" : "Anuncie Aqui";
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => {
                      playClickSound(640, "sine");
                      setSelectedSubPage(sub);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-mono uppercase font-extrabold transition-all whitespace-nowrap grow text-center ${
                      isActive
                        ? "bg-pink-500 text-black shadow-lg shadow-pink-500/10"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* SUB-TAB 1: QUEM SOMOS */}
            {selectedSubPage === "quemsomos" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Biografia e Trajetória de Regina Simões</span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Parágrafo 1 - Introdução Profissional:</label>
                    <textarea
                      value={qsP1}
                      onChange={(e) => setQsP1(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Parágrafo 2 - Atuação como Host do Podcast:</label>
                    <textarea
                      value={qsP2}
                      onChange={(e) => setQsP2(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Parágrafo 3 - Liderança da Comunidade:</label>
                    <textarea
                      value={qsP3}
                      onChange={(e) => setQsP3(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Parágrafo 4 - Liderança de Vendas e Palestras:</label>
                    <textarea
                      value={qsP4}
                      onChange={(e) => setQsP4(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Citação Inspiradora / Slogan no final da Bio:</label>
                    <input
                      type="text"
                      value={qsQuote}
                      onChange={(e) => setQsQuote(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-mono italic"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: OBJETIVOS */}
            {selectedSubPage === "objetivos" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Editar Missões e Objetivos Estratégicos</span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-green-400 font-mono uppercase block">Foco 1 - Portal de Negócios e Notícias:</label>
                    <textarea
                      value={objPortal}
                      onChange={(e) => setObjPortal(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-green-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-pink-450 font-mono uppercase block">Foco 2 - Podcast "Do Começo ao Topo":</label>
                    <textarea
                      value={objPodcast}
                      onChange={(e) => setObjPodcast(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-emerald-400 font-mono uppercase block">Foco 3 - Comunidade Aceleradora VIP:</label>
                    <textarea
                      value={objComunidade}
                      onChange={(e) => setObjComunidade(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: ONDE ESTAMOS */}
            {selectedSubPage === "ondeestamos" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Configuração de Endereço e Google Maps</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">Nome do Edifício:</label>
                      <input
                        type="text"
                        value={endEdificio}
                        onChange={(e) => setEndEdificio(e.target.value)}
                        className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">Rua, Número e Sala:</label>
                      <input
                        type="text"
                        value={endRua}
                        onChange={(e) => setEndRua(e.target.value)}
                        className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">Bairro, Cidade e CEP:</label>
                      <input
                        type="text"
                        value={endBairro}
                        onChange={(e) => setEndBairro(e.target.value)}
                        className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">Complemento / Ponto de Referência:</label>
                      <input
                        type="text"
                        value={endComp}
                        onChange={(e) => setEndComp(e.target.value)}
                        className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">URL de Embed do Iframe (Google Maps):</label>
                      <input
                        type="text"
                        value={endMapEmbed}
                        onChange={(e) => setEndMapEmbed(e.target.value)}
                        className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-400 focus:outline-none focus:border-pink-500 font-mono"
                        placeholder="https://www.google.com/maps/embed..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">Link Externo Google Maps (Abrir em Tela Cheia):</label>
                      <input
                        type="text"
                        value={endMapViewer}
                        onChange={(e) => setEndMapViewer(e.target.value)}
                        className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-400 focus:outline-none focus:border-pink-500 font-mono"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>

                    <div className="p-3.5 bg-zinc-900 border border-zinc-800/80 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-[#22c55e] font-bold block uppercase">Como pegar a URL de Embed?</span>
                      <p className="text-[9.5px] text-zinc-400 leading-normal font-sans">
                        Vá ao Google Maps, pesquise o local, clique em "Compartilhar", selecione a guia "Incorporar um mapa" e copie o valor contido no atributo <code>src</code> da tag <code>iframe</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: CONTATO */}
            {selectedSubPage === "contato" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Contatos, Redes e Atendimento</span>
                
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">E-mail Oficial de Atendimento:</label>
                    <input
                      type="email"
                      value={contEmail}
                      onChange={(e) => setContEmail(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Número do WhatsApp / Celular Corporativo:</label>
                    <input
                      type="text"
                      value={contWhatsapp}
                      onChange={(e) => setContWhatsapp(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Link do Perfil no Instagram:</label>
                    <input
                      type="text"
                      value={contInstagram}
                      onChange={(e) => setContInstagram(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 5: COMUNIDADE */}
            {selectedSubPage === "comunidade" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página Comunidade</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Título da Comunidade:</label>
                    <input
                      type="text"
                      value={comunidadeTitle}
                      onChange={(e) => setComunidadeTitle(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Descrição da Comunidade:</label>
                    <textarea
                      value={comunidadeDescription}
                      onChange={(e) => setComunidadeDescription(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 6: EVENTOS */}
            {selectedSubPage === "eventos" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página de Eventos</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Título da Seção de Eventos:</label>
                    <input
                      type="text"
                      value={eventosTitle}
                      onChange={(e) => setEventosTitle(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Descrição de Eventos:</label>
                    <textarea
                      value={eventosDescription}
                      onChange={(e) => setEventosDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 7: GALERIA */}
            {selectedSubPage === "galeria" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página da Galeria</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Título da Galeria:</label>
                    <input
                      type="text"
                      value={galeriaTitle}
                      onChange={(e) => setGaleriaTitle(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Descrição da Galeria:</label>
                    <textarea
                      value={galeriaDescription}
                      onChange={(e) => setGaleriaDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 8: EMBAIXADORES */}
            {selectedSubPage === "embaixadores" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página de Embaixadores</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Título da Área de Embaixadores:</label>
                    <input
                      type="text"
                      value={embaixadoresTitle}
                      onChange={(e) => setEmbaixadoresTitle(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Descrição dos Embaixadores:</label>
                    <textarea
                      value={embaixadoresDescription}
                      onChange={(e) => setEmbaixadoresDescription(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 9: VAGAS */}
            {selectedSubPage === "vagas" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página de Vagas de Emprego</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Título da Seção de Vagas:</label>
                    <input
                      type="text"
                      value={vagasTitle}
                      onChange={(e) => setVagasTitle(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Descrição da Seção de Vagas:</label>
                    <textarea
                      value={vagasDescription}
                      onChange={(e) => setVagasDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 11: PARCEIROS */}
            {selectedSubPage === "parceiros" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-5 text-left">
                <span className="text-xs text-white font-bold block">Página dos Parceiros / Patrocinadores</span>
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                    <span className="text-[10.5px] text-zinc-300 font-bold block uppercase tracking-wider">Configuração Inicial:</span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-mono uppercase block">Subtítulo Geral de Parceiros:</label>
                      <textarea
                        value={comunidadeDescription} // lets map to community text/partners intro
                        onChange={(e) => setComunidadeDescription(e.target.value)}
                        rows={2}
                        className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
                    <span className="text-[10px] font-mono text-green-400 font-black block uppercase">➕ Adicionar Novo Parceiro:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Nome da Empresa (ex: Startup Hub JF)"
                        value={newParceiroName}
                        onChange={(e) => setNewParceiroName(e.target.value)}
                        className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white focus:outline-none focus:border-green-400 font-mono font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Segmento / Descrição curta"
                        value={newParceiroDesc}
                        onChange={(e) => setNewParceiroDesc(e.target.value)}
                        className="p-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-white focus:outline-none focus:border-green-400"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newParceiroName || !newParceiroDesc) return;
                        setLocalParceiros([...localParceiros, { name: newParceiroName, description: newParceiroDesc }]);
                        setNewParceiroName("");
                        setNewParceiroDesc("");
                        playSuccessSound();
                      }}
                      className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black font-mono font-black uppercase text-[9.5px] rounded transition"
                    >
                      Gravar Parceiro na Lista
                    </button>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-zinc-400 block font-bold uppercase">Parceiros Cadastrados ({localParceiros.length}):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[170px] overflow-y-auto pr-1">
                      {localParceiros.map((p, index) => (
                        <div key={index} className="p-2 ml-1 roundedbg bg-zinc-900/60 border border-zinc-850 flex items-center justify-between text-xs gap-2">
                          <div>
                            <span className="font-mono text-[10.5px] text-green-400 font-extrabold block">{p.name}</span>
                            <span className="text-[10px] text-zinc-500 line-clamp-1">{p.description}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalParceiros(localParceiros.filter((_, idx) => idx !== index));
                              playClickSound(640, "sine");
                            }}
                            className="p-1 hover:bg-red-950 border border-transparent hover:border-red-800 rounded text-zinc-500 hover:text-red-400 transition"
                            title="Remover"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 12: PODCAST */}
            {selectedSubPage === "podcast" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página do Podcast</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Título do Podcast:</label>
                    <input
                      type="text"
                      value={podcastTitle}
                      onChange={(e) => setPodcastTitle(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Descrição da Página do Podcast:</label>
                    <textarea
                      value={podcastDescription}
                      onChange={(e) => setPodcastDescription(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed font-sans"
                    />
                  </div>
                  <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-850 text-[10px] leading-relaxed text-zinc-400 font-sans">
                    💡 <strong>Dica Premium:</strong> Os episódios de áudio e seus respectivos links de vídeo do YouTube podem ser editados diretamente no próprio feed interativo da página do **Podcast**, clicando no ícone de engrenagem/lápis de cada episódio em modo Administrador!
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 13: ANUNCIE */}
            {selectedSubPage === "anuncie" && (
              <div className="p-4 rounded-xl bg-black border border-zinc-850 space-y-4 text-left">
                <span className="text-xs text-white font-bold block mb-1">Página Anuncie Aqui & Mídia Kit</span>
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">Parágrafo Comercial de Introdução:</label>
                    <textarea
                      value={anunciePara1}
                      onChange={(e) => setAnunciePara1(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-pink-500 leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-zinc-900 py-3.5">
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-green-400 block">Destaque 1</span>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-zinc-500">Título:</label>
                        <input
                          type="text"
                          value={anuncieSec1Title}
                          onChange={(e) => setAnuncieSec1Title(e.target.value)}
                          className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-zinc-500">Texto Curto:</label>
                        <textarea
                          value={anuncieSec1Text}
                          onChange={(e) => setAnuncieSec1Text(e.target.value)}
                          rows={2}
                          className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10.5px] text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-tight"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-green-400 block">Destaque 2</span>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-zinc-500">Título:</label>
                        <input
                          type="text"
                          value={anuncieSec2Title}
                          onChange={(e) => setAnuncieSec2Title(e.target.value)}
                          className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-zinc-500">Texto Curto:</label>
                        <textarea
                          value={anuncieSec2Text}
                          onChange={(e) => setAnuncieSec2Text(e.target.value)}
                          rows={2}
                          className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10.5px] text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-tight"
                        />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-green-400 block">Destaque 3</span>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-zinc-500">Título:</label>
                        <input
                          type="text"
                          value={anuncieSec3Title}
                          onChange={(e) => setAnuncieSec3Title(e.target.value)}
                          className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-pink-500 font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9.5px] text-zinc-500">Texto Curto:</label>
                        <textarea
                          value={anuncieSec3Text}
                          onChange={(e) => setAnuncieSec3Text(e.target.value)}
                          rows={2}
                          className="w-full p-1.5 bg-zinc-900 border border-zinc-800 rounded text-[10.5px] text-zinc-300 focus:outline-none focus:border-pink-500 font-sans leading-tight"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-mono uppercase block">E-mail de Contato para Anunciar:</label>
                    <input
                      type="text"
                      value={anuncieEmail}
                      onChange={(e) => setAnuncieEmail(e.target.value)}
                      className="w-full p-2.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSavePagesDetail}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-green-500 text-black font-mono font-black uppercase text-xs rounded-xl tracking-wider hover:opacity-90 active:scale-98 transition flex items-center justify-center gap-1.5 shadow-xl"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Salvar Alterações de Páginas</span>
            </button>
          </div>
        )}

        {/* TAB 9: OFFLINE MODE & PWA */}
        {activeAdminTab === "offline" && (
          <OfflineAdminManager isDarkMode={isDarkMode} />
        )}

      </main>

      <ImageCropperModal
        isOpen={isCropperOpen}
        src={cropperSource}
        onClose={() => setIsCropperOpen(false)}
        onConfirm={(cropped) => {
          setImage(cropped);
        }}
      />

    </div>
  );
}
