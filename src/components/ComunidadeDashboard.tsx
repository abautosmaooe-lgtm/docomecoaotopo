import { toast } from "sonner";
import React, { useState, useMemo, useRef } from "react";
import { 
  Briefcase, MapPin, User, Search, Filter, Phone, Mail, Globe, 
  ExternalLink, Megaphone, Plus, Check, ShieldCheck, Tag, Info, Flame, ThumbsUp, Trash2, X, Camera, Gift,
  Eye, EyeOff, ChevronRight, Copy, Users, Pencil, Upload, Image as ImageIcon, PlusCircle, Save,
  Activity, Terminal, Database, RefreshCw, Cake, Sparkles, Calendar
} from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { auth, db, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { syncPortalUser, saveLeadToFirestore } from "../services/userService";
import PhotoGallery from "./PhotoGallery";
import { MessageBoard } from "./DashboardSections";
import PositionableImage from "./PositionableImage";
import { COMMUNITY_MEMBERS_DATA, DEFAULT_MEMBER_AVATAR } from "../data/community_members_data";
import MembersGrid from "./MembersGrid";
import ProfileCard from "./ui/profile-card";
import { COMMUNITY_CATEGORIES } from "../lib/community-categories";
import CommunityMembership from "./CommunityMembership";

interface Member {
  id: string;
  name: string; // Nome Completo
  companyName?: string; // Nome da Empresa
  photo: string; // Foto da marca / Perfil
  role: string;
  bio: string;
  branch: string; // Ramo de atividade
  city: string;
  contact: string;
  email: string;
  birthday: string;
  isVerified?: boolean;
  gallery?: string[]; // galeria com fotos
  address?: string; // Endereço clicável
  googleMapsUrl?: string;
  whatsappLink?: string;
  instagramLink?: string;
  instagram?: string;
}

interface Campaign {
  id: string;
  title: string;
  sponsor: string;
  image: string;
  description: string;
  discountCode: string;
  ctaLink: string;
  views: number;
}

// Initial robust members of the executive community with full WhatsApp & Instagram datasets
const INITIAL_MEMBERS: Member[] = COMMUNITY_MEMBERS_DATA.map((m) => ({
  id: m.id,
  name: m.name,
  companyName: m.companyName || m.role,
  photo: m.photo || DEFAULT_MEMBER_AVATAR,
  role: m.role || "Empreendedor VIP",
  bio: m.bio || `Membro VIP da Comunidade de Negócios Do Começo ao Topo.`,
  branch: m.branch || "Empreendedorismo",
  city: m.city || "Juiz de Fora - MG",
  contact: m.contact || "(32) 98412-4860",
  email: m.email || "",
  birthday: m.birthday || "",
  isVerified: true,
  whatsappLink: m.whatsappLink,
  instagramLink: m.instagramLink,
  instagram: m.instagram,
  address: m.address || "Juiz de Fora, MG - Brasil",
  googleMapsUrl: m.googleMapsUrl || "https://maps.google.com/?q=Juiz+de+Fora,+MG"
}));

// Initial premium promotional ads / campaigns
const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "c-1",
    title: "Desconto Especial para Membros VIP",
    sponsor: "Portal Do Começo ao Fim",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=800",
    description: "Aproveite 20% de desconto em anúncios e destaques exclusivos na plataforma.",
    discountCode: "DOCOMECO20",
    ctaLink: "https://wa.me/5532984124860",
    views: 142
  }
];

interface ComunidadeDashboardProps {
  isDarkMode: boolean;
  portalPagesConfig?: any;
  isAdmin?: boolean;
  user?: any;
  onLogout?: () => void;
  externalBranchFilter?: string;
}

export default function ComunidadeDashboard({ 
  isDarkMode, 
  portalPagesConfig, 
  isAdmin = false, 
  user,
  onLogout,
  externalBranchFilter
}: ComunidadeDashboardProps) {
  // Authentication Whitelist and Senha
  const ALLOWED_EMAILS = useMemo(() => [
    "andersonpsan@gmail.com",
    "maooemail@gmail.com",
    "abautosmaooe@gmail.com"
  ], []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginNome, setLoginNome] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showDirectPass, setShowDirectPass] = useState(false);

  const [trialExpiresDate, setTrialExpiresDate] = useState<string>(() => {
    try {
      return localStorage.getItem("comunidade_trial_expires_at") || "";
    } catch {
      return "";
    }
  });

  const daysRemainingInTrial = useMemo(() => {
    if (!trialExpiresDate) return 30;
    try {
      const diffTime = new Date(trialExpiresDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 30;
    }
  }, [trialExpiresDate]);

  const isUserPortalApproved = true;

  const [isComunidadeAuthed, setIsComunidadeAuthed] = useState(true);

  React.useEffect(() => {
    setIsComunidadeAuthed(true);
  }, []);

  // Store collections in state/localStorage for persistency
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem("comunidade_mem_db_v2");
      if (!saved) return INITIAL_MEMBERS;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: Member) => ({
          ...m,
          photo: (!m.photo || m.photo.includes("rawpixel") || m.photo.includes("unsplash.com/photo-1535713875002") || m.photo.includes("unsplash.com/photo-1626645") || m.photo.includes("unsplash.com/photo-1602143") || m.photo.includes("unsplash.com/photo-1505576") || m.photo.includes("unsplash.com/photo-1544367") || m.photo.includes("unsplash.com/photo-1600334") || m.photo.includes("unsplash.com/photo-1554744") || m.photo.includes("unsplash.com/photo-1519735") || m.photo.includes("unsplash.com/photo-1556910") || m.photo.includes("unsplash.com/photo-1559056") || m.photo.includes("unsplash.com/photo-1513519") || m.photo.includes("unsplash.com/photo-1573496") || m.photo.includes("unsplash.com/photo-1551836") || m.photo.includes("unsplash.com/photo-1498579") || m.photo.includes("unsplash.com/photo-1573497") || m.photo.includes("unsplash.com/photo-1590602") || m.photo.includes("unsplash.com/photo-1509440") || m.photo.includes("unsplash.com/photo-1513104") || m.photo.includes("unsplash.com/photo-1487412") || m.photo.includes("unsplash.com/photo-1507003")) ? DEFAULT_MEMBER_AVATAR : m.photo
        }));
      }
      return INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const saved = localStorage.getItem("comunidade_camp_db");
      if (!saved) return INITIAL_CAMPAIGNS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_CAMPAIGNS;
    } catch {
      return INITIAL_CAMPAIGNS;
    }
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("TODAS");
  const [selectedCity, setSelectedCity] = useState("TODAS");
  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">(() => new Date().getMonth() + 1);
  const [onlyBirthdaysFilter, setOnlyBirthdaysFilter] = useState(false);

  // Sync with external branch filter from App.tsx header
  React.useEffect(() => {
    if (externalBranchFilter) {
      setSelectedBranch(externalBranchFilter);
    }
  }, [externalBranchFilter]);
  const [alphabetLetter, setAlphabetLetter] = useState<string | null>(null);

  // Active view tabs within restricted Comunidade page
  const [activeTab, setActiveTab] = useState<"members" | "campaigns" | "gallery" | "rsvp">("members");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // User profile registration state (Atualize seu Cadastro)
  const [userCadastro, setUserCadastro] = useState(() => {
    try {
      const saved = localStorage.getItem("comunidade_user_cadastro");
      return saved ? JSON.parse(saved) : {
        nome: "",
        companyName: "",
        endereco: "",
        googleMapsUrl: "",
        whatsapp: "",
        instagramLink: "",
        email: "",
        cpf: "",
        birthday: "",
        areaAtuacao: "",
        subAreaAtuacao: "",
        customArea: "",
        photo: "",
        gallery: ""
      };
    } catch {
      return {
        nome: "",
        companyName: "",
        endereco: "",
        googleMapsUrl: "",
        whatsapp: "",
        instagramLink: "",
        email: "",
        cpf: "",
        birthday: "",
        areaAtuacao: "",
        subAreaAtuacao: "",
        customArea: "",
        photo: "",
        gallery: ""
      };
    }
  });

  const [showUpdateCadastroModal, setShowUpdateCadastroModal] = useState(false);
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroCompanyName, setCadastroCompanyName] = useState("");
  const [cadastroEndereco, setCadastroEndereco] = useState("");
  const [cadastroGoogleMapsUrl, setCadastroGoogleMapsUrl] = useState("");
  const [cadastroWhatsapp, setCadastroWhatsapp] = useState("");
  const [cadastroInstagramLink, setCadastroInstagramLink] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroCpf, setCadastroCpf] = useState("");
  const [cadastroAreaAtuacao, setCadastroAreaAtuacao] = useState("");
  const [cadastroSubAreaAtuacao, setCadastroSubAreaAtuacao] = useState("");
  const [cadastroCustomArea, setCadastroCustomArea] = useState("");
  const [cadastroBirthday, setCadastroBirthday] = useState("");
  const [cadastroPhoto, setCadastroPhoto] = useState("");
  const [cadastroGallery, setCadastroGallery] = useState("");
  const [cadastroBio, setCadastroBio] = useState("");

  // Admin Header Text Customization State
  const [headerConfig, setHeaderConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("comunidade_header_custom");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      badge: "🏆 PAINEL EXCLUSIVO DA COMUNIDADE",
      title: portalPagesConfig?.comunidadeTitle || "Bem-vindo ao Hub de Negócios",
      description: portalPagesConfig?.comunidadeDescription || "Aqui você se conecta com outros pioneiros da tecnologia, marketing e design industrial do interior do sudeste. Navegue abaixo pelos perfis de todos os membros credenciados, aplique filtros de busca e confira as campanhas publicitárias exclusivas da nossa rede de patrocinadores locais!"
    };
  });
  const [showEditHeaderModal, setShowEditHeaderModal] = useState(false);
  const [editHeaderBadge, setEditHeaderBadge] = useState("");
  const [editHeaderTitle, setEditHeaderTitle] = useState("");
  const [editHeaderDesc, setEditHeaderDesc] = useState("");

  const handleOpenEditHeader = () => {
    setEditHeaderBadge(headerConfig.badge || "🏆 PAINEL EXCLUSIVO DA COMUNIDADE");
    setEditHeaderTitle(headerConfig.title || portalPagesConfig?.comunidadeTitle || "Bem-vindo ao Hub de Negócios");
    setEditHeaderDesc(headerConfig.description || portalPagesConfig?.comunidadeDescription || "");
    setShowEditHeaderModal(true);
  };

  const handleSaveHeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      badge: editHeaderBadge.trim() || "🏆 PAINEL EXCLUSIVO DA COMUNIDADE",
      title: editHeaderTitle.trim() || "Bem-vindo ao Hub de Negócios",
      description: editHeaderDesc.trim()
    };
    setHeaderConfig(updated);
    localStorage.setItem("comunidade_header_custom", JSON.stringify(updated));
    playSuccessSound();
    toast.success("Textos do cabeçalho da comunidade atualizados!");
    setShowEditHeaderModal(false);
  };

  // Auth Status Diagnostic State & Handler
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [authDiagResult, setAuthDiagResult] = useState<{
    verifiedAt: string;
    email: string;
    name: string;
    status: string;
    firestoreUpdatedAt: string;
    isFirestoreSynced: boolean;
  } | null>(null);

  const handleCheckAuthStatus = async () => {
    setIsCheckingAuth(true);
    playClickSound(600, "sine");

    const currentEmail = user?.email || auth.currentUser?.email || userCadastro.email || "";
    const currentUid = user?.uid || auth.currentUser?.uid || "";
    const cleanEmail = currentEmail.toLowerCase().trim();
    const docId = cleanEmail ? cleanEmail.replace(/[^a-z0-9]/g, "_") : (currentUid || "anonymous");

    let portalUserDoc: any = null;
    let matriculaDoc: any = null;
    let lastUpdatedAt: string = "Não registrado";

    try {
      if (docId && docId !== "anonymous") {
        const userSnap = await getDoc(doc(db, "portal_users", docId));
        if (userSnap.exists()) {
          portalUserDoc = userSnap.data();
        }

        const matSnap = await getDoc(doc(db, "matriculas", docId));
        if (matSnap.exists()) {
          matriculaDoc = matSnap.data();
        }
      }
    } catch (err) {
      console.warn("⚠️ Erro ao consultar Firestore no diagnóstico:", err);
    }

    lastUpdatedAt = portalUserDoc?.updatedAt || portalUserDoc?.lastLogin || matriculaDoc?.updatedAt || matriculaDoc?.createdAt || "Não encontrado no Firestore";

    // Detailed console log as requested
    console.group("🔍 [DIAGNÓSTICO] Status de Autenticação & Firestore");
    console.log("⏰ Timestamp da Verificação:", new Date().toLocaleString("pt-BR"));
    console.log("👤 Usuário Logado (Estado Local / React):", {
      email: user?.email || currentEmail || "Não informado",
      name: user?.name || userCadastro.nome || "Não informado",
      isAdmin: !!user?.isAdmin || isAdmin,
      status: user?.status || portalUserDoc?.status || "Indefinido",
      trialEndsAt: user?.trialEndsAt || portalUserDoc?.trialEndsAt || null,
      uid: currentUid || "Nenhum UID"
    });
    console.log("🔥 Firebase Auth (auth.currentUser):", auth.currentUser ? {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      emailVerified: auth.currentUser.emailVerified,
      metadata: {
        creationTime: auth.currentUser.metadata.creationTime,
        lastSignInTime: auth.currentUser.metadata.lastSignInTime
      }
    } : "Nenhum usuário Firebase Auth ativo");
    console.log("📄 Documento 'portal_users' no Firestore (ID: " + docId + "):", portalUserDoc || "Documento não encontrado");
    console.log("📝 Documento 'matriculas' no Firestore (ID: " + docId + "):", matriculaDoc || "Documento não encontrado");
    console.log("⏱️ Última Data de Atualização no Firestore:", lastUpdatedAt);
    console.log("🛡️ Status do Usuário no Firestore:", portalUserDoc?.status || matriculaDoc?.status || "Não encontrado");
    console.log("🔑 Role do Usuário:", portalUserDoc?.role || (isAdmin ? "admin" : "member"));
    console.log("📋 Dados Cadastrais Locais (userCadastro):", userCadastro);
    console.groupEnd();

    setAuthDiagResult({
      verifiedAt: new Date().toLocaleTimeString("pt-BR"),
      email: user?.email || currentEmail || "Não informado",
      name: user?.name || userCadastro.nome || "Não informado",
      status: portalUserDoc?.status || user?.status || "Ativo",
      firestoreUpdatedAt: lastUpdatedAt,
      isFirestoreSynced: !!(portalUserDoc || matriculaDoc)
    });

    toast.success(`Status de autenticação verificado! Última atualização: ${lastUpdatedAt}. Veja detalhes no Console (F12).`);
    setIsCheckingAuth(false);
  };

  // Admin Member Editing State
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberCompanyName, setEditMemberCompanyName] = useState("");
  const [editMemberRole, setEditMemberRole] = useState("");
  const [editMemberBranch, setEditMemberBranch] = useState("tecnologia");
  const [editMemberSubBranch, setEditMemberSubBranch] = useState("");
  const [editMemberCustomBranch, setEditMemberCustomBranch] = useState("");
  const [editMemberCity, setEditMemberCity] = useState("Juiz de Fora");
  const [editMemberBio, setEditMemberBio] = useState("");
  const [editMemberContact, setEditMemberContact] = useState("");
  const [editMemberEmail, setEditMemberEmail] = useState("");
  const [editMemberBirthday, setEditMemberBirthday] = useState("");
  const [editMemberPhoto, setEditMemberPhoto] = useState("");
  const [editMemberAddress, setEditMemberAddress] = useState("");
  const [editMemberGoogleMapsUrl, setEditMemberGoogleMapsUrl] = useState("");
  const [editMemberWhatsappLink, setEditMemberWhatsappLink] = useState("");
  const [editMemberInstagramLink, setEditMemberInstagramLink] = useState("");
  const [editMemberIsVerified, setEditMemberIsVerified] = useState(true);
  const [editMemberGallery, setEditMemberGallery] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  const handleOpenEditMember = (member: Member, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingMember(member);
    setEditMemberName(member.name || "");
    setEditMemberCompanyName(member.companyName || "");
    setEditMemberRole(member.role || "");
    
    // Detect category match if possible
    const catMatch = COMMUNITY_CATEGORIES.find(c => 
      c.label === member.branch || c.subcategories.some(s => s.label === member.branch)
    );
    if (catMatch) {
      setEditMemberBranch(catMatch.id);
      const subMatch = catMatch.subcategories.find(s => s.label === member.branch);
      setEditMemberSubBranch(subMatch ? subMatch.label : "");
      setEditMemberCustomBranch("");
    } else {
      setEditMemberBranch("outras");
      setEditMemberSubBranch("");
      setEditMemberCustomBranch(member.branch || "");
    }

    setEditMemberCity(member.city || "Juiz de Fora");
    setEditMemberBio(member.bio || "");
    setEditMemberContact(member.contact || "");
    setEditMemberEmail(member.email || "");
    setEditMemberBirthday(member.birthday || "");
    setEditMemberPhoto(member.photo || "");
    setEditMemberAddress(member.address || "");
    setEditMemberGoogleMapsUrl(member.googleMapsUrl || "");
    setEditMemberWhatsappLink(member.whatsappLink || member.contact || "");
    setEditMemberInstagramLink(member.instagramLink || "");
    setEditMemberIsVerified(member.isVerified ?? true);
    setEditMemberGallery(member.gallery || []);
    setNewGalleryUrl("");
    playClickSound(600, "sine");
  };

  const handleSaveEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const resolvedBranch = editMemberBranch === "outras"
      ? (editMemberCustomBranch.trim() || "Geral")
      : (editMemberSubBranch || COMMUNITY_CATEGORIES.find(c => c.id === editMemberBranch)?.label || "Geral");

    const updatedMember: Member = {
      ...editingMember,
      name: editMemberName.trim(),
      companyName: editMemberCompanyName.trim(),
      role: editMemberRole.trim(),
      branch: resolvedBranch,
      city: editMemberCity.trim() || "Juiz de Fora",
      bio: editMemberBio.trim(),
      contact: editMemberContact.trim(),
      email: editMemberEmail.trim(),
      birthday: editMemberBirthday,
      photo: editMemberPhoto.trim() || DEFAULT_MEMBER_AVATAR,
      address: editMemberAddress.trim(),
      googleMapsUrl: editMemberGoogleMapsUrl.trim(),
      whatsappLink: editMemberWhatsappLink.trim(),
      instagramLink: editMemberInstagramLink.trim(),
      isVerified: editMemberIsVerified,
      gallery: editMemberGallery
    };

    const updatedList = members.map(m => m.id === editingMember.id ? updatedMember : m);
    setMembers(updatedList);
    localStorage.setItem("comunidade_mem_db", JSON.stringify(updatedList));

    if (selectedMember && selectedMember.id === editingMember.id) {
      setSelectedMember(updatedMember);
    }

    playSuccessSound();
    toast.success(`Perfil de "${updatedMember.name}" atualizado com sucesso!`);
    setEditingMember(null);
  };

  // Admin Campaign Editing State
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [editCampTitle, setEditCampTitle] = useState("");
  const [editCampSponsor, setEditCampSponsor] = useState("");
  const [editCampImage, setEditCampImage] = useState("");
  const [editCampDesc, setEditCampDesc] = useState("");
  const [editCampCode, setEditCampCode] = useState("");
  const [editCampLink, setEditCampLink] = useState("");

  const handleOpenEditCampaign = (camp: Campaign, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCampaign(camp);
    setEditCampTitle(camp.title);
    setEditCampSponsor(camp.sponsor);
    setEditCampImage(camp.image);
    setEditCampDesc(camp.description);
    setEditCampCode(camp.discountCode);
    setEditCampLink(camp.ctaLink);
    playClickSound(600, "sine");
  };

  const handleSaveEditCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    const updatedCamp: Campaign = {
      ...editingCampaign,
      title: editCampTitle.trim().toUpperCase(),
      sponsor: editCampSponsor.trim(),
      image: editCampImage.trim() || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
      description: editCampDesc.trim(),
      discountCode: editCampCode.trim() || "COMENTOPO",
      ctaLink: editCampLink.trim() || "https://news.google.com/home?hl=pt-BR&gl=BR&ceid=BR%3Apt-419"
    };

    const updatedList = campaigns.map(c => c.id === editingCampaign.id ? updatedCamp : c);
    setCampaigns(updatedList);
    localStorage.setItem("comunidade_camp_db", JSON.stringify(updatedList));

    playSuccessSound();
    toast.success(`Campanha "${updatedCamp.title}" atualizada com sucesso!`);
    setEditingCampaign(null);
  };

  // Image Upload helper
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, onResult: (base64Url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast.error("O arquivo excede o limite de 8MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onResult(dataUrl);
        playSuccessSound();
        toast.success("Foto carregada com sucesso!");
      }
    };
    reader.readAsDataURL(file);
  };


  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNome = loginNome.trim();
    const finalEmail = loginEmail.trim().toLowerCase();
    const finalWhatsapp = leadWhatsapp.trim();

    if (!finalNome || !finalEmail || !finalWhatsapp) {
      setLoginError("Por favor, preencha seu Nome, E-mail e WhatsApp para liberar o acesso.");
      playClickSound(300, "sawtooth");
      return;
    }

    setIsSavingLead(true);
    setLoginError("");

    try {
      const res = await saveLeadToFirestore({
        name: finalNome,
        email: finalEmail,
        whatsapp: finalWhatsapp,
        source: "comunidade_trial_30dias"
      });

      // Save credentials & trial to storage
      setIsComunidadeAuthed(true);
      setTrialExpiresDate(res.trialExpiresAt);
      localStorage.setItem("comunidade_auth_success", "true");
      localStorage.setItem("comunidade_auth_email", finalEmail);
      localStorage.setItem("comunidade_auth_nome", finalNome);
      localStorage.setItem("comunidade_auth_whatsapp", finalWhatsapp);
      localStorage.setItem("comunidade_trial_expires_at", res.trialExpiresAt);

      const updatedCadastro = {
        ...userCadastro,
        nome: userCadastro.nome || finalNome,
        email: userCadastro.email || finalEmail,
        whatsapp: userCadastro.whatsapp || finalWhatsapp
      };
      setUserCadastro(updatedCadastro);
      localStorage.setItem("comunidade_user_cadastro", JSON.stringify(updatedCadastro));

      playSuccessSound();
      toast.success(`🎉 Bem-vindo(a), ${finalNome}! Seu acesso de 30 dias foi liberado gratuitamente sem necessidade de aprovação.`);
    } catch (err: any) {
      console.error("Erro ao registrar lead:", err);
      // Fallback local trial
      const fallbackTrial = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setIsComunidadeAuthed(true);
      setTrialExpiresDate(fallbackTrial);
      localStorage.setItem("comunidade_auth_success", "true");
      localStorage.setItem("comunidade_auth_email", finalEmail);
      localStorage.setItem("comunidade_auth_nome", finalNome);
      localStorage.setItem("comunidade_auth_whatsapp", finalWhatsapp);
      localStorage.setItem("comunidade_trial_expires_at", fallbackTrial);
      playSuccessSound();
      toast.success(`Bem-vindo(a)! Acesso liberado por 30 dias.`);
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputId = loginNome.trim() || loginEmail.trim();
    const cleanSenha = loginSenha.trim();

    if (!inputId || !cleanSenha) {
      setLoginError("Por favor, preencha seu E-mail ou Nome e a Senha.");
      playClickSound(300, "sawtooth");
      return;
    }

    if (cleanSenha !== "Topo2026$!&" && cleanSenha !== "Emba2026$!&" && cleanSenha !== "teste") {
      setLoginError("Senha de acesso incorreta.");
      playClickSound(300, "sawtooth");
      return;
    }

    let finalEmail = loginEmail.trim().toLowerCase();
    let finalNome = loginNome.trim();

    if (!finalEmail) {
      if (inputId.includes("@")) {
        finalEmail = inputId.toLowerCase();
        finalNome = inputId.split("@")[0];
      } else {
        finalEmail = `${inputId.toLowerCase().replace(/[^a-z0-9]/g, "") || "membro"}@portal.com`;
        finalNome = inputId;
      }
    }

    // Auth Successful
    setIsComunidadeAuthed(true);
    setLoginError("");
    localStorage.setItem("comunidade_auth_success", "true");
    localStorage.setItem("comunidade_auth_email", finalEmail);
    localStorage.setItem("comunidade_auth_nome", finalNome);

    // Sync auth details to the user profile cadastro!
    const updatedCadastro = {
      ...userCadastro,
      nome: userCadastro.nome || finalNome,
      email: userCadastro.email || finalEmail
    };
    setUserCadastro(updatedCadastro);
    localStorage.setItem("comunidade_user_cadastro", JSON.stringify(updatedCadastro));

    playSuccessSound();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLoginError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const cleanEmail = (googleUser.email || "").toLowerCase().trim();
      const cleanNome = googleUser.displayName || cleanEmail.split("@")[0] || "Membro VIP";
      const photoUrl = googleUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(cleanEmail)}`;

      await syncPortalUser({
        email: cleanEmail,
        name: cleanNome,
        photoUrl: photoUrl,
        uid: googleUser.uid
      });

      // Save lead in database
      const trialExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await saveLeadToFirestore({
        name: cleanNome,
        email: cleanEmail,
        whatsapp: leadWhatsapp || userCadastro.whatsapp || "",
        source: "comunidade_google_30dias"
      });

      // Auth Successful
      setIsComunidadeAuthed(true);
      setTrialExpiresDate(trialExpiry);
      setLoginError("");
      localStorage.setItem("comunidade_auth_success", "true");
      localStorage.setItem("comunidade_auth_email", cleanEmail);
      localStorage.setItem("comunidade_auth_nome", cleanNome);
      localStorage.setItem("comunidade_trial_expires_at", trialExpiry);

      const updatedCadastro = {
        ...userCadastro,
        nome: userCadastro.nome || cleanNome,
        email: userCadastro.email || cleanEmail,
        photo: userCadastro.photo || photoUrl
      };
      setUserCadastro(updatedCadastro);
      localStorage.setItem("comunidade_user_cadastro", JSON.stringify(updatedCadastro));

      playSuccessSound();
      toast.success(`🎉 Bem-vindo(a), ${cleanNome}! Acesso de 30 dias liberado via Google sem aprovação.`);
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "seu domínio";
      const errStr = (err?.code || err?.message || String(err)).toLowerCase();
      let errorMsg = "Não foi possível conectar com o Google.";
      
      if (errStr.includes("unauthorized-domain") || errStr.includes("auth/unauthorized-domain")) {
        errorMsg = `O domínio "${currentHost}" precisa ser autorizado no Firebase Console para o login com Google. Digite seu e-mail/nome e a senha do portal acima para entrar direto.`;
      } else if (errStr.includes("popup-closed-by-user")) {
        errorMsg = "A janela do Google foi fechada antes de concluir o acesso.";
      } else if (errStr.includes("popup-blocked")) {
        errorMsg = "O navegador bloqueou a janela pop-up do Google. Permita pop-ups para continuar.";
      } else if (err?.message) {
        errorMsg = err.message;
      }

      setLoginError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = () => {
    {
      playClickSound(400, "sine");
      if (onLogout) {
        onLogout();
      } else {
        setIsComunidadeAuthed(false);
        localStorage.removeItem("comunidade_auth_success");
        localStorage.removeItem("comunidade_auth_email");
        localStorage.removeItem("comunidade_auth_nome");
        setLoginEmail("");
        setLoginNome("");
        setLoginSenha("");
      }
    }
  };

  const openCadastroModal = () => {
    setCadastroNome(userCadastro.nome);
    setCadastroCompanyName(userCadastro.companyName || "");
    setCadastroEndereco(userCadastro.endereco);
    setCadastroGoogleMapsUrl(userCadastro.googleMapsUrl || "");
    setCadastroWhatsapp(userCadastro.whatsapp);
    setCadastroInstagramLink(userCadastro.instagramLink || "");
    setCadastroEmail(userCadastro.email);
    setCadastroCpf(userCadastro.cpf);
    setCadastroAreaAtuacao(userCadastro.areaAtuacao || "tecnologia");
    setCadastroSubAreaAtuacao(userCadastro.subAreaAtuacao || "");
    setCadastroCustomArea(userCadastro.customArea || "");
    setCadastroBirthday(userCadastro.birthday || "");
    setCadastroPhoto(userCadastro.photo || "");
    setCadastroGallery(userCadastro.gallery || "");
    setCadastroBio(userCadastro.bio || "");
    setShowUpdateCadastroModal(true);
  };

  const handleUpdateCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...userCadastro,
      nome: cadastroNome,
      companyName: cadastroCompanyName,
      endereco: cadastroEndereco,
      googleMapsUrl: cadastroGoogleMapsUrl,
      whatsapp: cadastroWhatsapp,
      instagramLink: cadastroInstagramLink,
      email: cadastroEmail,
      cpf: cadastroCpf,
      areaAtuacao: cadastroAreaAtuacao,
      subAreaAtuacao: cadastroSubAreaAtuacao,
      customArea: cadastroCustomArea,
      birthday: cadastroBirthday,
      photo: cadastroPhoto,
      gallery: cadastroGallery,
      bio: cadastroBio
    };
    setUserCadastro(updated);
    localStorage.setItem("comunidade_user_cadastro", JSON.stringify(updated));

    // Auto-sync current user profile to the members directory list
    setMembers((prev) => {
      // Find if we already exist in the list by email or exact name
      const existingIdx = prev.findIndex(m => m.email === updated.email || m.name === updated.nome);
      const parsedGallery = typeof updated.gallery === 'string' 
        ? updated.gallery.split(',').map(s => s.trim()).filter(Boolean) 
        : [];
        
      const profileMember: Member = {
        id: existingIdx >= 0 ? prev[existingIdx].id : `m-${Date.now()}`,
        name: updated.nome,
        companyName: updated.companyName,
        photo: updated.photo || DEFAULT_MEMBER_AVATAR,
        role: "Membro", // Default if none
        bio: updated.bio || "", // synced bio
        branch: updated.areaAtuacao === "outras" ? updated.customArea : updated.subAreaAtuacao || updated.areaAtuacao,
        city: "Sua Cidade", // not present in form, let's keep it generic or grab existing
        contact: updated.whatsapp,
        email: updated.email,
        birthday: updated.birthday,
        isVerified: true,
        address: updated.endereco,
        googleMapsUrl: updated.googleMapsUrl,
        whatsappLink: updated.whatsapp,
        instagramLink: updated.instagramLink,
        gallery: parsedGallery
      };

      if (existingIdx >= 0) {
        profileMember.role = prev[existingIdx].role;
        profileMember.bio = prev[existingIdx].bio;
        profileMember.city = prev[existingIdx].city;
        const newMembersList = [...prev];
        newMembersList[existingIdx] = profileMember;
        localStorage.setItem("comunidade_mem_db", JSON.stringify(newMembersList));
        return newMembersList;
      } else {
        const newMembersList = [profileMember, ...prev];
        localStorage.setItem("comunidade_mem_db", JSON.stringify(newMembersList));
        return newMembersList;
      }
    });

    playSuccessSound();
    setShowUpdateCadastroModal(false);
  };

  // Add Member form simple state
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [newMemberBranch, setNewMemberBranch] = useState("tecnologia");
  const [newMemberSubBranch, setNewMemberSubBranch] = useState("");
  const [newMemberCustomBranch, setNewMemberCustomBranch] = useState("");
  const [newMemberCity, setNewMemberCity] = useState("Juiz de Fora");
  const [newMemberBio, setNewMemberBio] = useState("");
  const [newMemberContact, setNewMemberContact] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberBirthday, setNewMemberBirthday] = useState("");
  const [newMemberInstagram, setNewMemberInstagram] = useState("");
  const [newMemberPhoto, setNewMemberPhoto] = useState("");

  // Add Campaign form simple state
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState("");
  const [newCampSponsor, setNewCampSponsor] = useState("");
  const [newCampDesc, setNewCampDesc] = useState("");
  const [newCampCode, setNewCampCode] = useState("");
  const [newCampLink, setNewCampLink] = useState("");
  const [newCampImage, setNewCampImage] = useState("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400");

  // Unique lists for dropdown options
  const branchesList = useMemo(() => {
    const set = new Set(members.map((m) => m?.branch).filter(Boolean));
    return ["TODAS", ...Array.from(set)];
  }, [members]);

  const citiesList = useMemo(() => {
    const set = new Set(members.map((m) => m?.city).filter(Boolean));
    return ["TODAS", ...Array.from(set)];
  }, [members]);

  // Alphabet A to Z generator
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Month labels helper
  const MONTHS_NAMES = [
    { num: 1, name: "Janeiro" },
    { num: 2, name: "Fevereiro" },
    { num: 3, name: "Março" },
    { num: 4, name: "Abril" },
    { num: 5, name: "Maio" },
    { num: 6, name: "Junho" },
    { num: 7, name: "Julho" },
    { num: 8, name: "Agosto" },
    { num: 9, name: "Setembro" },
    { num: 10, name: "Outubro" },
    { num: 11, name: "Novembro" },
    { num: 12, name: "Dezembro" }
  ];

  // Helper to extract day and month from birthday string (DD/MM/YYYY or YYYY-MM-DD)
  const getMemberBirthdayInfo = (birthdayStr?: string) => {
    if (!birthdayStr) return { day: null, month: null, formatted: "" };
    const str = birthdayStr.trim();
    const slashParts = str.split("/");
    if (slashParts.length >= 2) {
      const d = parseInt(slashParts[0], 10);
      const m = parseInt(slashParts[1], 10);
      if (!isNaN(d) && !isNaN(m)) {
        return { 
          day: d, 
          month: m, 
          formatted: `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}` 
        };
      }
    }
    const dashParts = str.split("-");
    if (dashParts.length >= 3) {
      const d = parseInt(dashParts[2], 10);
      const m = parseInt(dashParts[1], 10);
      if (!isNaN(d) && !isNaN(m)) {
        return { 
          day: d, 
          month: m, 
          formatted: `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}` 
        };
      }
    }
    return { day: null, month: null, formatted: "" };
  };

  // Current active month's birthdays
  const currentMonthBirthdays = useMemo(() => {
    const activeM = selectedMonth === "ALL" ? (new Date().getMonth() + 1) : selectedMonth;
    return members.filter((m) => {
      const info = getMemberBirthdayInfo(m.birthday);
      return info.month === activeM;
    }).sort((a, b) => {
      const aInfo = getMemberBirthdayInfo(a.birthday);
      const bInfo = getMemberBirthdayInfo(b.birthday);
      return (aInfo.day || 0) - (bInfo.day || 0);
    });
  }, [members, selectedMonth]);

  // Process filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      if (!member) return false;
      // 1. Search term match name, bio or role
      const searchTarget = `${member.name || ""} ${member.role || ""} ${member.bio || ""}`.toLowerCase();
      if (searchTerm && !searchTarget.includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 2. Branch match
      if (selectedBranch !== "TODAS" && member.branch !== selectedBranch) {
        return false;
      }

      // 3. City match
      if (selectedCity !== "TODAS" && member.city !== selectedCity) {
        return false;
      }

      // 4. Alphabet A-Z filtering
      if (alphabetLetter) {
        if (!(member.name || "").trim().toUpperCase().startsWith(alphabetLetter)) {
          return false;
        }
      }

      // 5. Birthday Month Filter (if onlyBirthdaysFilter is active)
      if (onlyBirthdaysFilter) {
        const info = getMemberBirthdayInfo(member.birthday);
        if (selectedMonth !== "ALL") {
          if (info.month !== selectedMonth) return false;
        } else {
          if (!info.month) return false;
        }
      }

      return true;
    });
  }, [members, searchTerm, selectedBranch, selectedCity, alphabetLetter, onlyBirthdaysFilter, selectedMonth]);

  // Handle submissions
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberRole) return;

    const newM: Member = {
      id: `m-${Date.now()}`,
      name: newMemberName,
      photo: newMemberPhoto.trim() || DEFAULT_MEMBER_AVATAR,
      role: newMemberRole,
      branch: newMemberBranch === "outras" ? newMemberCustomBranch : newMemberSubBranch || newMemberBranch,
      bio: newMemberBio,
      city: newMemberCity,
      contact: newMemberContact,
      email: newMemberEmail,
      birthday: newMemberBirthday,
      instagramLink: newMemberInstagram,
      isVerified: true
    };

    const updated = [newM, ...members];
    setMembers(updated);
    localStorage.setItem("comunidade_mem_db_v2", JSON.stringify(updated));
    localStorage.setItem("comunidade_mem_db", JSON.stringify(updated));
    playSuccessSound();

    // Reset fields
    setNewMemberName("");
    setNewMemberRole("");
    setNewMemberPhoto("");
    setNewMemberBio("");
    setNewMemberContact("");
    setNewMemberEmail("");
    setNewMemberInstagram("");
    setNewMemberBranch("tecnologia");
    setNewMemberSubBranch("");
    setNewMemberCustomBranch("");
    setShowAddMember(false);
  };

  const handleAddCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampTitle || !newCampSponsor) return;

    const newC: Campaign = {
      id: `c-${Date.now()}`,
      title: newCampTitle.toUpperCase(),
      sponsor: newCampSponsor,
      description: newCampDesc,
      discountCode: newCampCode || "COMENTOPO",
      ctaLink: newCampLink || "https://news.google.com/home?hl=pt-BR&gl=BR&ceid=BR%3Apt-419",
      image: newCampImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=400",
      views: 1
    };

    const updated = [newC, ...campaigns];
    setCampaigns(updated);
    localStorage.setItem("comunidade_camp_db", JSON.stringify(updated));
    playSuccessSound();

    // Reset
    setNewCampTitle("");
    setNewCampSponsor("");
    setNewCampDesc("");
    setNewCampCode("");
    setNewCampLink("");
    setShowAddCampaign(false);
  };

  const handleDeleteMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    {
      playClickSound(400, "sine");
      const updated = members.filter((m) => m.id !== id);
      setMembers(updated);
      localStorage.setItem("comunidade_mem_db", JSON.stringify(updated));
    }
  };

  const handleDeleteCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    {
      playClickSound(400, "sine");
      const updated = campaigns.filter((c) => c.id !== id);
      setCampaigns(updated);
      localStorage.setItem("comunidade_camp_db", JSON.stringify(updated));
    }
  };

  if (!isComunidadeAuthed) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-stone-950/90 backdrop-blur-2xl border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(16,185,129,0.15)] animate-fade-in text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header decoration */}
        <div className="text-center space-y-3 mb-6 relative z-10">
          <div className="inline-flex p-3.5 bg-emerald-500/15 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-pulse">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 font-mono text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-emerald-500/40 mb-2">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              ACESSO LIVRE POR 30 DIAS • SEM APROVAÇÃO
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase bg-gradient-to-r from-white via-emerald-100 to-zinc-300 bg-clip-text text-transparent">
              COMUNIDADE DE NEGÓCIOS
            </h3>
            <p className="text-zinc-300 text-xs mt-2 leading-relaxed max-w-md mx-auto">
              Experimente <strong className="text-emerald-400">gratuitamente por 30 dias</strong> todos os recursos, contatos e oportunidades da comunidade. Conecte sua conta Google ou preencha seu WhatsApp abaixo:
            </p>
          </div>
        </div>

        {/* 1-Click Google Login Button */}
        <div className="space-y-3 mb-6 relative z-10">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3.5 px-5 bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-3 transition shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-50 cursor-pointer border border-zinc-200"
          >
            {isGoogleLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{isGoogleLoading ? "Conectando ao Google..." : "Entrar com Google (1 Clique • 30 Dias Grátis)"}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4 relative z-10">
          <div className="h-px bg-zinc-800 flex-1" />
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">ou libere com WhatsApp & E-mail</span>
          <div className="h-px bg-zinc-800 flex-1" />
        </div>

        <form onSubmit={handleLeadSubmit} className="space-y-3.5 relative z-10">
          {loginError && (
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 font-mono text-[11px] font-bold">
              ⚠️ {loginError}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
              Seu Nome Completo
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <User className="w-4 h-4 text-emerald-400" />
              </span>
              <input
                type="text"
                required
                placeholder="ex: Carlos Silva"
                value={loginNome}
                onChange={(e) => setLoginNome(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* E-mail */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
              E-mail (Google ou Principal)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Mail className="w-4 h-4 text-emerald-400" />
              </span>
              <input
                type="email"
                required
                placeholder="ex: seuemail@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block flex items-center justify-between">
              <span>Número de WhatsApp</span>
              <span className="text-emerald-400 text-[9px] lowercase font-normal">(para suporte e rede)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <Phone className="w-4 h-4 text-emerald-400" />
              </span>
              <input
                type="tel"
                required
                placeholder="ex: (19) 99999-9999"
                value={leadWhatsapp}
                onChange={(e) => setLeadWhatsapp(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition font-mono"
              />
            </div>
          </div>

          {/* Direct Password toggle if desired */}
          {showDirectPass && (
            <div className="space-y-1 text-left pt-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                Senha Administrativa do Portal
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha especial"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-stone-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingLead}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition shadow-[0_4px_25px_rgba(16,185,129,0.35)] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            {isSavingLead ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>{isSavingLead ? "Liberando Acesso..." : "Liberar Meu Acesso de 30 Dias Agora"}</span>
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowDirectPass(!showDirectPass)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 font-mono underline transition"
            >
              {showDirectPass ? "Ocultar login por senha" : "Já possui senha administrativa de membro? Clique aqui"}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-zinc-500 mt-5 font-mono relative z-10">
          🔒 Conexão Segura • Dados protegidos • Sem necessidade de aprovação
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-white">
      
      {/* 30 DAYS TRIAL STATUS BANNER */}
      <div className="bg-gradient-to-r from-emerald-500/20 via-stone-900 to-teal-500/20 border-2 border-emerald-500/40 rounded-3xl p-5 relative overflow-hidden shadow-[0_4px_30px_rgba(16,185,129,0.12)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2">
                <span className="text-[9px] bg-emerald-500 text-black font-mono font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                  ACESSO DE TESTE LIBERADO
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {daysRemainingInTrial} {daysRemainingInTrial === 1 ? "dia restante" : "dias restantes"}
                </span>
              </div>
              <h4 className="font-display font-black text-sm sm:text-base tracking-tight uppercase text-white">
                Você tem 30 dias de acesso gratuito completo à Comunidade VIP
              </h4>
              <p className="text-zinc-400 text-xs font-mono">
                Explore o mural, diretório de membros, parcerias e conexões empresariais.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("quero-fazer-parte-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="shrink-0 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md active:scale-95 cursor-pointer"
          >
            Ver Planos Definitivos
          </button>
        </div>
      </div>
      
      {/* EXCLUSIVE COMUNIDADE WELCOME BANNER */}
      <div className="bg-gradient-to-r from-green-500/10 via-stone-900 to-pink-500/10 border-2 border-green-500/30 rounded-3xl p-6 relative overflow-hidden shadow-[0_4px_35px_rgba(34,197,94,0.06)]">
        <div className="absolute top-0 right-0 w-32 h-full bg-green-500/5 rotate-12 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-green-500 text-black font-mono font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                {headerConfig.badge || "🏆 PAINEL EXCLUSIVO DA COMUNIDADE"}
              </span>
              {isAdmin && (
                <button
                  onClick={handleOpenEditHeader}
                  className="px-2.5 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-green-500/40 hover:border-green-400 text-green-400 text-[10px] font-mono font-bold rounded-full flex items-center gap-1 transition shadow-sm"
                  title="Editar textos do cabeçalho da comunidade (Admin)"
                >
                  <Pencil className="w-3 h-3" />
                  <span>EDITAR TEXTOS</span>
                </button>
              )}
            </div>
            <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase">
              {headerConfig.title || "Bem-vindo ao Hub de Negócios"}
            </h2>
            <p className="text-zinc-400 text-xs max-w-2xl leading-relaxed">
              {headerConfig.description || "Aqui você se conecta com outros pioneiros da tecnologia, marketing e design industrial do interior do sudeste. Navegue abaixo pelos perfis de todos os membros credenciados, aplique filtros de busca e confira as campanhas publicitárias exclusivas da nossa rede de patrocinadores locais!"}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-black/55 backdrop-blur-md p-4 rounded-2xl border border-zinc-850 shrink-0">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[9px] text-zinc-500 font-mono block">PARTICIPANTES ATIVOS</span>
              <span className="text-2xl font-display font-black text-green-400 block tracking-tight">#{members.length} MEMBROS</span>
              <span className="text-[9px] text-[#22c55e] font-mono block animate-pulse">● Conexão Segura Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* CADASTRO STATUS BAR/WIDGET */}
      <div className={`p-4 rounded-2xl border transition duration-300 flex flex-col md:flex-row items-center justify-between gap-4 ${
        userCadastro.nome 
          ? "bg-emerald-500/5 border-emerald-500/20" 
          : "bg-amber-500/5 border-amber-500/20"
      }`}>
        <div className="flex items-center gap-3 w-full">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            userCadastro.nome ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-left">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
              {userCadastro.nome ? "✓ Seu Cadastro de Membro VIP está Ativo e Atualizado" : "⚠️ Perfil Pendente de Informações Obrigatórias"}
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
              {userCadastro.nome 
                ? `Nome: ${userCadastro.nome} | CPF: ${userCadastro.cpf || "Pendente"} | WhatsApp: ${userCadastro.whatsapp || "Pendente"} | Atuação: ${userCadastro.areaAtuacao || "Pendente"}`
                : "Seu cadastro precisa ser atualizado com Nome, Endereço Completo, WhatsApp, E-mail, CPF e Área de Atuação para credenciamento integral."}
            </p>
            {userCadastro.nome && userCadastro.endereco && (
              <p className="text-[10px] text-zinc-500 leading-none font-mono">
                Endereço comercial: <span className="text-zinc-400">{userCadastro.endereco}</span> | E-mail: <span className="text-zinc-400">{userCadastro.email}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCheckAuthStatus}
            disabled={isCheckingAuth}
            className="px-3.5 py-2 font-mono text-[11px] font-bold uppercase rounded-xl transition duration-200 bg-stone-900 border border-blue-500/40 hover:border-blue-400 text-blue-400 hover:text-white flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
            title="Executa diagnóstico de autenticação e exibe no console os dados do Firestore"
          >
            {isCheckingAuth ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>{isCheckingAuth ? "Verificando..." : "Verificar Status de Autenticação"}</span>
          </button>

          <button
            onClick={() => { playClickSound(650, "sine"); openCadastroModal(); }}
            className={`px-4 py-2 font-mono text-xs font-black uppercase rounded-xl transition shrink-0 duration-200 ${
              userCadastro.nome
                ? "bg-zinc-900 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white"
                : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            }`}
          >
            {userCadastro.nome ? "Atualizar Dados" : "Preencher Cadastro"}
          </button>
        </div>
      </div>

      {/* DIAGNOSTIC MINI BANNER IF CHECKED */}
      {authDiagResult && (
        <div className="p-3.5 bg-blue-950/20 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono animate-fade-in">
          <div className="flex items-center gap-2 text-blue-300">
            <Activity className="w-4 h-4 text-blue-400 shrink-0 animate-pulse" />
            <span>
              <strong>Diagnóstico ({authDiagResult.verifiedAt}):</strong> Usuário: <strong>{authDiagResult.name}</strong> ({authDiagResult.email}) | Status: <strong className="text-emerald-400">{authDiagResult.status}</strong> | Firestore: <strong>{authDiagResult.isFirestoreSynced ? "Sincronizado" : "Pendente"}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span>Última atualização: <strong className="text-white">{authDiagResult.firestoreUpdatedAt}</strong></span>
            <span className="text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">F12 Console</span>
          </div>
        </div>
      )}

      {/* NEW PRESENTATION & MESSAGE BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-stone-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-black text-sm uppercase flex items-center gap-2"><User className="w-5 h-5 text-green-400" /> Minha Apresentação</h3>
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-full border-2 border-green-500/30 flex items-center justify-center overflow-hidden">
                    <Camera className="w-8 h-8 text-zinc-500" />
                </div>
                <div>
                  <h4 className="font-black text-lg">{userCadastro.nome || "Membro"}</h4>
                  <p className="text-zinc-400 font-mono text-xs">{userCadastro.areaAtuacao || "N/A"}</p>
                  <p className="text-green-400 font-mono text-xs flex items-center gap-1 mt-1"><Gift className="w-3 h-3" /> {userCadastro.birthday ? new Date(userCadastro.birthday).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "Data de Aniversário não definida"}</p>
                </div>
            </div>
        </div>
        <MessageBoard sectionKey="comunidade" />
      </div>

      {/* TABS SWITCHER FOR restricted COMUNIDADE */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-b border-zinc-800 pb-3 gap-4">
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => { playClickSound(600, "sine"); setActiveTab("members"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black flex items-center gap-2 border transition ${
              activeTab === "members"
                ? "bg-green-500 text-black border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.2)]"
                : "bg-stone-950 border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            <span>DIRETÓRIO DE MEMBROS ({filteredMembers.length})</span>
          </button>
          <button
            onClick={() => { playClickSound(610, "sine"); setActiveTab("campaigns"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black flex items-center gap-2 border transition ${
              activeTab === "campaigns"
                ? "bg-pink-500 text-black border-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                : "bg-stone-950 border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>CAMPANHAS E ANÚNCIOS ({campaigns.length})</span>
          </button>
          <button
            onClick={() => { playClickSound(615, "sine"); setActiveTab("gallery"); }}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black flex items-center gap-2 border transition ${
              activeTab === "gallery"
                ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                : "bg-stone-950 border-zinc-900 text-zinc-400 hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>GALERIA DE FOTOS</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => { playClickSound(620, "sine"); setActiveTab("rsvp"); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black flex items-center gap-2 border transition ${
                activeTab === "rsvp"
                  ? "bg-purple-500 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "bg-stone-950 border-zinc-900 text-zinc-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>RSVP EVENTO</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          {activeTab === "members" && (
            <>
              <button
                onClick={() => { playClickSound(650, "sine"); openCadastroModal(); }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                <User className="w-4 h-4" />
                <span>ATUALIZAR CADASTRO</span>
              </button>
              <button
                onClick={() => { playClickSound(650, "sine"); setShowAddMember(true); }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-green-500/20 text-white rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition active:scale-95"
              >
                <Plus className="w-4 h-4 text-green-400" />
                <span>CADASTRAR PERFIL</span>
              </button>
            </>
          )}
          {activeTab === "campaigns" && (
            <button
              onClick={() => { playClickSound(650, "sine"); setShowAddCampaign(true); }}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-pink-500/20 text-white rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4 text-pink-400" />
              <span>LANÇAR CAMPANHA</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/80 hover:bg-red-900/90 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition active:scale-95"
            title="Sair do painel"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>SAIR</span>
          </button>
        </div>
      </div>

      {showAddMember && (
        <div className="p-5 rounded-2xl border-2 border-dashed border-green-500/30 bg-black/60 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h4 className="font-display font-black text-xs text-green-400 uppercase tracking-wider">Lançar Novo Membro VIP no Diretório</h4>
            <button onClick={() => setShowAddMember(false)} className="text-zinc-500 hover:text-white text-xs">Cancelar</button>
          </div>
          <form onSubmit={handleAddMemberSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Nome Completo</label>
              <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required placeholder="Ex: Lucas Ferreira" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Cargo / Função</label>
              <input type="text" value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required placeholder="Ex: Consultor Full Stack" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Cidade de Atuação</label>
              <select value={newMemberCity} onChange={(e) => setNewMemberCity(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs">
                <option value="Juiz de Fora">Juiz de Fora</option>
                <option value="Matias Barbosa">Matias Barbosa</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Categoria Principal</label>
              <select 
                value={newMemberBranch} 
                onChange={(e) => {
                  setNewMemberBranch(e.target.value);
                  setNewMemberSubBranch("");
                }} 
                className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs"
              >
                {COMMUNITY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>

            {newMemberBranch && newMemberBranch !== "outras" && (
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400">Subcategoria</label>
                <select 
                  value={newMemberSubBranch} 
                  onChange={(e) => setNewMemberSubBranch(e.target.value)} 
                  className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs"
                  required
                >
                  <option value="">Selecione a subcategoria...</option>
                  {COMMUNITY_CATEGORIES.find(c => c.id === newMemberBranch)?.subcategories.map(sub => (
                    <option key={sub.id} value={sub.label}>{sub.label}</option>
                  ))}
                </select>
              </div>
            )}

            {newMemberBranch === "outras" && (
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400">Especificar Outra Categoria</label>
                <input 
                  type="text" 
                  value={newMemberCustomBranch} 
                  onChange={(e) => setNewMemberCustomBranch(e.target.value)} 
                  className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" 
                  placeholder="Ex: Consultoria Especializada" 
                  required
                />
              </div>
            )}
            {/* Foto de Perfil & Prévia */}
            <div className="md:col-span-3 p-4 rounded-xl bg-stone-900/60 border border-zinc-850 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-950 border-2 border-green-500/40 shrink-0 relative group">
                <img 
                  src={newMemberPhoto || DEFAULT_MEMBER_AVATAR} 
                  alt="Prévia do Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_MEMBER_AVATAR;
                  }}
                />
              </div>
              <div className="flex-1 space-y-1.5 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-bold rounded-lg border border-zinc-700 inline-flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5 text-green-400" />
                    <span>Subir Foto Personalizada</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, (url) => setNewMemberPhoto(url))} 
                    />
                  </label>
                  {newMemberPhoto && (
                    <button
                      type="button"
                      onClick={() => setNewMemberPhoto("")}
                      className="px-2.5 py-1 text-[11px] font-mono text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition"
                    >
                      Usar Ícone Padrão
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  ✨ <strong>Ícone Padrão VIP:</strong> se você cadastrar sem foto agora, o membro receberá o mesmo ícone padronizado até que você suba a foto personalizada.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Link Foto de Perfil (URL Opcional)</label>
              <input type="text" value={newMemberPhoto} onChange={(e) => setNewMemberPhoto(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="Deixe em branco para ícone padrão" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Instagram (@usuario)</label>
              <input type="text" value={newMemberInstagram} onChange={(e) => setNewMemberInstagram(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="@seu.perfil" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">E-mail</label>
              <input type="email" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required placeholder="lucas@empresa.com" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Aniversário</label>
              <input type="date" value={newMemberBirthday} onChange={(e) => setNewMemberBirthday(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] font-mono text-zinc-400">Telefone / WhatsApp</label>
              <input type="text" value={newMemberContact} onChange={(e) => setNewMemberContact(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="(32) 99999-8877" />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label className="block text-[10px] font-mono text-zinc-400">Miniauto biografia (Bio explicativa)</label>
              <textarea value={newMemberBio} onChange={(e) => setNewMemberBio(e.target.value)} rows={2} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="Fale um pouco sobre o trabalho, história e as pautas de seu interesse na Zona da Mata brasileiras." />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2.5 pt-2">
              <button type="submit" className="px-5 py-2 bg-green-500 hover:bg-green-400 text-black font-mono font-black text-xs rounded-xl shadow-md">
                ADICIONAR PERFIL VIP
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddCampaign && (
        <div className="p-5 rounded-2xl border-2 border-dashed border-pink-500/30 bg-black/60 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <h4 className="font-display font-black text-xs text-pink-400 uppercase tracking-wider">Disparar Nova Campanha de Patrocinador</h4>
            <button onClick={() => setShowAddCampaign(false)} className="text-zinc-500 hover:text-white text-xs">Cancelar</button>
          </div>
          <form onSubmit={handleAddCampaignSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Título do Anúncio (Alta conversão)</label>
              <input type="text" value={newCampTitle} onChange={(e) => setNewCampTitle(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required placeholder="Ex: DIÁRIAS GRÁTIS COWORKING" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Patrocinador / Empresa Responsável</label>
              <input type="text" value={newCampSponsor} onChange={(e) => setNewCampSponsor(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required placeholder="Ex: Tech Central Cowork" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Cupom / Código de Desconto Exclusivo</label>
              <input type="text" value={newCampCode} onChange={(e) => setNewCampCode(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="Ex: DOCOMECOVIP" />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-mono text-zinc-400">Link Otimizado da Imagem de Capa</label>
              <input type="text" value={newCampImage} onChange={(e) => setNewCampImage(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="URL da foto publicitária" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] font-mono text-zinc-400">Link de Destino do Botão (CTA Link)</label>
              <input type="url" value={newCampLink} onChange={(e) => setNewCampLink(e.target.value)} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" placeholder="https://seusite.com.br..." />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="block text-[10px] font-mono text-zinc-400">Descrição publicitária e vantagens da oferta</label>
              <textarea value={newCampDesc} onChange={(e) => setNewCampDesc(e.target.value)} rows={3} className="w-full bg-stone-950 border border-zinc-850 rounded-lg p-2 text-xs" required placeholder="Ofereça brindes, descontos reais ou acessos especiais exclusivos para estimular conexões..." />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2.5 pt-2">
              <button type="submit" className="px-5 py-2 bg-pink-500 hover:bg-pink-400 text-black font-mono font-black text-xs rounded-xl shadow-md">
                DISPARAR ANÚNCIO CAMPO DE VISÃO
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RENDER MEMBERS DIRECTORY */}
      {activeTab === "members" && (
        <div className="space-y-6">

          {/* BIRTHDAY HIGHLIGHTS BANNER (ANIVERSARIANTES DO MÊS) */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-stone-950 to-pink-950/30 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            {/* Ambient glow accent */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            
            <div className="relative z-10 space-y-4">
              {/* Header with Title and Month selector */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                    <Cake className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-base text-white tracking-wide uppercase flex items-center gap-1.5">
                        🎉 Aniversariantes {selectedMonth === "ALL" ? "do Ano" : `de ${MONTHS_NAMES.find(m => m.num === selectedMonth)?.name}`}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        {currentMonthBirthdays.length} {currentMonthBirthdays.length === 1 ? "membro" : "membros"}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-mono">
                      Celebre e parabenize nossos membros VIP da comunidade!
                    </p>
                  </div>
                </div>

                {/* Quick month pills filter */}
                <div className="flex flex-wrap items-center gap-1.5 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
                  {MONTHS_NAMES.map((m) => {
                    const isSelected = selectedMonth === m.num;
                    const count = members.filter(mem => getMemberBirthdayInfo(mem.birthday).month === m.num).length;
                    return (
                      <button
                        key={m.num}
                        onClick={() => {
                          playClickSound(600, "sine");
                          setSelectedMonth(m.num);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-500/30"
                            : count > 0
                            ? "bg-stone-900/90 text-zinc-300 hover:text-white border border-zinc-800 hover:border-pink-500/40"
                            : "bg-stone-950/60 text-zinc-600 border border-zinc-900 hover:text-zinc-400"
                        }`}
                        title={`${m.name}: ${count} aniversariante(s)`}
                      >
                        <span>{m.name.slice(0, 3)}</span>
                        {count > 0 && (
                          <span className={`text-[9px] px-1 py-0.2 rounded-full font-black ${isSelected ? "bg-white/30 text-white" : "bg-purple-500/20 text-purple-300"}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      playClickSound(550, "sine");
                      setSelectedMonth("ALL");
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition ${
                      selectedMonth === "ALL"
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
                        : "bg-stone-900 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    Todos
                  </button>
                </div>
              </div>

              {/* Birthdays members horizontal card track */}
              {currentMonthBirthdays.length === 0 ? (
                <div className="py-6 text-center rounded-2xl bg-black/40 border border-dashed border-zinc-800/80">
                  <Cake className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400 font-mono">
                    Nenhum aniversariante registrado neste mês selecionado.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {currentMonthBirthdays.map((m) => {
                    const bdayInfo = getMemberBirthdayInfo(m.birthday);
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          playClickSound(520, "sine");
                          setSelectedMember(m);
                        }}
                        className="p-3.5 rounded-2xl bg-stone-900/90 border border-pink-500/30 hover:border-pink-500/70 hover:shadow-[0_0_20px_rgba(236,72,153,0.25)] transition-all cursor-pointer flex items-center gap-3 relative group overflow-hidden"
                      >
                        {/* Birthday day badge */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white font-mono text-[9px] font-black shadow-sm">
                          <Cake className="w-2.5 h-2.5" />
                          <span>Dia {bdayInfo.day ? bdayInfo.day.toString().padStart(2, "0") : bdayInfo.formatted}</span>
                        </div>

                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-950 border border-pink-500/40 shrink-0 relative shadow-md">
                          <PositionableImage
                            src={m.photo || DEFAULT_MEMBER_AVATAR}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            storageKey={`comunidade-member-bday-${m.id}`}
                            editable={isAdmin}
                          />
                        </div>

                        {/* Info & quick wish button */}
                        <div className="min-w-0 flex-1 pr-12">
                          <h5 className="font-bold text-xs text-white truncate group-hover:text-pink-300 transition">
                            {m.name}
                          </h5>
                          <p className="text-[10px] text-zinc-400 font-mono truncate">
                            {m.companyName || m.role}
                          </p>
                          
                          {/* Direct Birthday WhatsApp button */}
                          <div className="pt-1.5 flex items-center gap-2">
                            <a
                              href={
                                m.whatsappLink || 
                                (m.contact ? `https://wa.me/${m.contact.replace(/\D/g, '')}?text=${encodeURIComponent(`🎉 Parabéns pelo seu aniversário, ${m.name}! Desejo muito sucesso e realizações através da nossa Comunidade Do Começo ao Topo! 🎂🚀`)}` : `https://wa.me/5532984124860?text=${encodeURIComponent(`🎉 Parabéns pelo seu aniversário, ${m.name}!`)}`)
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => { e.stopPropagation(); playClickSound(700, "sine"); }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/40 text-emerald-300 rounded text-[9px] font-mono font-bold transition shadow-sm"
                              title="Enviar parabéns no WhatsApp"
                            >
                              <Phone className="w-2.5 h-2.5 text-emerald-400" />
                              <span>Parabenizar</span>
                            </a>
                            <span className="text-[9px] font-mono text-zinc-500">
                              {bdayInfo.formatted}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* MULTI SEARCH AND FILTER BOX */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-zinc-900 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Input name filter block */}
            <div className="md:col-span-3 relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome, cargo..."
                className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:border-green-500 focus:ring-1 focus:ring-green-400 outline-none font-mono"
              />
            </div>

            {/* Branch Hierarchical Filter */}
            <div className="md:col-span-3 relative group">
              <div className="flex items-center gap-1.5 bg-black border border-zinc-800 rounded-xl px-3 py-1 cursor-pointer hover:border-green-500/50 transition">
                <Briefcase className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <div className="w-full py-1.5 text-xs text-zinc-300 font-mono truncate">
                  {selectedBranch === "TODAS" ? "💼 Ramos: Todos" : selectedBranch}
                </div>
                <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:rotate-90 transition-transform" />
              </div>
              
              {/* Hierarchical Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-64 bg-stone-950 border border-zinc-800 rounded-xl shadow-2xl z-50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <button 
                  onClick={() => { setSelectedBranch("TODAS"); playClickSound(600, "sine"); }}
                  className={`w-full text-left px-4 py-2 text-[11px] font-mono hover:bg-zinc-900 transition ${selectedBranch === "TODAS" ? "text-green-400 font-bold" : "text-zinc-400"}`}
                >
                  💼 VER TODOS OS RAMOS
                </button>
                <div className="h-px bg-zinc-900 my-1 mx-2" />
                
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {COMMUNITY_CATEGORIES.map((cat) => (
                    <div key={cat.id} className="relative group/sub">
                      <div className="flex items-center justify-between px-4 py-2 hover:bg-zinc-900 cursor-pointer transition">
                        <span className="text-[11px] font-mono font-bold text-white flex items-center gap-2">
                          {cat.icon} {cat.label}
                        </span>
                        <ChevronRight className="w-3 h-3 text-zinc-600" />
                      </div>
                      
                      {/* Submenu */}
                      <div className="absolute left-full top-0 ml-0.5 w-64 bg-stone-950 border border-zinc-800 rounded-xl shadow-2xl py-2 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200">
                        <button 
                          onClick={() => { setSelectedBranch(cat.label); playClickSound(600, "sine"); }}
                          className="w-full text-left px-4 py-2 text-[10px] font-mono font-bold text-zinc-500 hover:text-white hover:bg-zinc-900 transition border-b border-zinc-900 mb-1"
                        >
                          Ver tudo em {cat.label}
                        </button>
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => {
                              setSelectedBranch(sub.label);
                              playClickSound(600, "sine");
                            }}
                            className={`w-full text-left px-4 py-1.5 text-[10px] font-mono hover:bg-zinc-900 transition ${selectedBranch === sub.label ? "text-green-400 font-bold" : "text-zinc-400 hover:text-zinc-200"}`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Custom / Existing branches that don't match the list exactly (for safety) */}
                  {branchesList.filter(b => b !== "TODAS" && !COMMUNITY_CATEGORIES.some(cat => cat.label === b || cat.subcategories.some(sub => sub.label === b))).length > 0 && (
                    <>
                      <div className="h-px bg-zinc-900 my-1 mx-2" />
                      <div className="px-4 py-1 text-[9px] font-mono text-zinc-600 uppercase">Outros Registrados</div>
                      {branchesList.filter(b => b !== "TODAS" && !COMMUNITY_CATEGORIES.some(cat => cat.label === b || cat.subcategories.some(sub => sub.label === b))).map(b => (
                        <button
                          key={b}
                          onClick={() => { setSelectedBranch(b); playClickSound(600, "sine"); }}
                          className={`w-full text-left px-4 py-1.5 text-[10px] font-mono hover:bg-zinc-900 transition ${selectedBranch === b ? "text-green-400 font-bold" : "text-zinc-400"}`}
                        >
                          {b}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* City dropdown */}
            <div className="md:col-span-3">
              <div className="flex items-center gap-1.5 bg-black border border-zinc-800 rounded-xl px-3 py-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    playClickSound(600, "sine");
                    setSelectedCity(e.target.value);
                  }}
                  className="w-full bg-transparent border-none text-xs text-zinc-300 font-mono outline-none py-1.5"
                >
                  <option value="TODAS">🏙️ Cidades: Todas</option>
                  {citiesList.filter(c => c !== "TODAS").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Birthday toggle filter button */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound(600, "sine");
                  setOnlyBirthdaysFilter(prev => !prev);
                }}
                className={`w-full px-3 py-2 border rounded-xl text-[10px] font-mono font-bold uppercase flex items-center justify-center gap-1.5 transition ${
                  onlyBirthdaysFilter
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 border-pink-400 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)]"
                    : "bg-stone-900/80 border-zinc-800 text-pink-400 hover:text-white hover:border-pink-500/40"
                }`}
                title="Filtrar apenas aniversariantes"
              >
                <Cake className="w-3.5 h-3.5" />
                <span>{onlyBirthdaysFilter ? "🎂 Aniversários [ON]" : "🎂 Aniversários"}</span>
              </button>
            </div>

            {/* Clear filters trigger */}
            <div className="md:col-span-2">
              <button
                onClick={() => {
                  playClickSound(400, "sine");
                  setSearchTerm("");
                  setSelectedBranch("TODAS");
                  setSelectedCity("TODAS");
                  setAlphabetLetter(null);
                  setOnlyBirthdaysFilter(false);
                  setSelectedMonth(new Date().getMonth() + 1);
                }}
                className="w-full px-3 py-2 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950 text-zinc-400 hover:text-white transition text-[10px] font-mono font-bold uppercase rounded-xl flex items-center justify-center gap-1"
              >
                Resetar Filtros
              </button>
            </div>
          </div>

          {/* SYSTEM OF SEARCH A to Z */}
          <div className="p-3 bg-stone-950 border border-zinc-900 rounded-2xl">
            <div className="flex flex-wrap items-center justify-between text-[9px] font-mono text-zinc-500 border-b border-zinc-900 pb-2 mb-2 px-1">
              <span className="font-bold flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#22c55e]" /> FILTRO DE CHAMADAS DE HISTÓRIA DE A A Z (POR NOME DO PARTICIPANTE):
              </span>
              {alphabetLetter && (
                <button
                  onClick={() => setAlphabetLetter(null)}
                  className="text-pink-500 font-black hover:underline"
                >
                  [Limpar letra ({alphabetLetter})]
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-13 md:flex md:flex-wrap gap-1">
              <button
                onClick={() => {
                  playClickSound(600, "sine");
                  setAlphabetLetter(null);
                }}
                className={`flex-1 text-center py-1 rounded text-[10px] font-mono font-bold transition ${
                  alphabetLetter === null
                    ? "bg-[#22c55e] text-black"
                    : "bg-black border border-zinc-90s/80 text-zinc-400 hover:text-white hover:border-zinc-750"
                }`}
              >
                Todos
              </button>

              {alphabet.map((letter) => {
                const isActive = alphabetLetter === letter;
                // Check if any member name starts with this letter
                const hasMatchingMembers = members.some((m) =>
                  m.name.trim().toUpperCase().startsWith(letter)
                );

                return (
                  <button
                    key={letter}
                    onClick={() => {
                      if (hasMatchingMembers) {
                        playClickSound(610, "sine");
                        setAlphabetLetter(isActive ? null : letter);
                      }
                    }}
                    className={`px-1.5 md:px-2.5 py-1 text-center rounded text-[10px] font-mono font-black transition ${
                      isActive
                        ? "bg-pink-500 text-black shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                        : hasMatchingMembers
                        ? "bg-stone-900 text-zinc-200 border border-zinc-800 hover:border-zinc-500 hover:text-white"
                        : "bg-stone-950 text-zinc-700 border border-zinc-950/40 cursor-not-allowed opacity-30"
                    }`}
                    disabled={!hasMatchingMembers}
                    title={
                      hasMatchingMembers
                        ? `Filtrar membros começando com a letra ${letter}`
                        : `Nenhum membro iniciando com a letra ${letter}`
                    }
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MEMBER CARDS LISTINGS */}
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-stone-950 border border-dashed border-zinc-900 space-y-3">
              <User className="w-10 h-10 text-zinc-600 mx-auto animate-bounce" />
              <h5 className="font-display font-black text-sm uppercase text-zinc-400">Nenhum membro VIP coincide com a busca</h5>
              <p className="text-zinc-500 text-xs max-w-md mx-auto">
                Tente redefinir o filtro de cidades de atuação, ramos profissionais ou limpe a letra do filtro de índice alfabético de A a Z.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedBranch("TODAS");
                  setSelectedCity("TODAS");
                  setAlphabetLetter(null);
                  setOnlyBirthdaysFilter(false);
                  setSelectedMonth(new Date().getMonth() + 1);
                }}
                className="px-4 py-1.5 bg-green-500 text-black font-mono font-black text-[10px] uppercase rounded"
              >
                Limpar Todos os Critérios
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMembers.map((m) => {
                const bdayInfo = getMemberBirthdayInfo(m.birthday);
                const currentCalMonth = new Date().getMonth() + 1;
                const isBirthdayThisMonth = bdayInfo.month === currentCalMonth;

                return (
                <div
                  key={m.id}
                  onClick={() => {
                    playClickSound(500, "sine");
                    setSelectedMember(m);
                  }}
                  className={`p-4 rounded-2xl bg-stone-950 border transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                    isBirthdayThisMonth
                      ? "border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.18)] hover:border-pink-400 hover:shadow-[0_0_28px_rgba(236,72,153,0.3)]"
                      : "border-zinc-900 hover:border-pink-500/40 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
                  }`}
                >
                  {/* Top badges and admin actions */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        📍 {m.city || "Juiz de Fora"}
                      </span>

                      {/* Birthday badge if birthday in current calendar month */}
                      {isBirthdayThisMonth && (
                        <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono font-black rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm animate-pulse" title={`Aniversariante do Mês! Dia ${bdayInfo.day}`}>
                          <Cake className="w-3 h-3" />
                          <span>ANIVERSARIANTE</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {m.isVerified && (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                          <ShieldCheck className="w-3 h-3 text-green-400" /> VIP
                        </span>
                      )}

                      {isAdmin && (
                        <>
                          <button
                            onClick={(e) => handleOpenEditMember(m, e)}
                            className="p-1 rounded bg-green-950/60 hover:bg-green-800/80 text-green-400 hover:text-white transition border border-green-500/30"
                            title="Editar textos e fotos do membro (Admin)"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteMember(m.id, e)}
                            className="p-1 rounded bg-red-950/50 hover:bg-red-900/80 text-red-400 hover:text-white transition border border-red-500/30"
                            title="Excluir membro (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Member Avatar & Basic Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 relative">
                      <PositionableImage
                        src={m.photo || DEFAULT_MEMBER_AVATAR}
                        alt={m.name}
                        className="w-full h-full object-cover"
                        storageKey={`comunidade-member-card-${m.id}`}
                        editable={isAdmin}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-pink-400 transition">
                        {m.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">
                        {m.companyName || m.role}
                      </p>
                      <p className="text-[10px] text-green-400 font-mono truncate font-semibold">
                        {m.branch}
                      </p>
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {m.bio && (
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {m.bio}
                    </p>
                  )}

                  {/* Direct Contact Buttons (WhatsApp & Instagram) */}
                  <div className="flex items-center gap-2 pt-1">
                    {m.whatsappLink ? (
                      <a
                        href={m.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); playClickSound(700, "sine"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition"
                        title="Conversar no WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        WhatsApp
                      </a>
                    ) : m.contact ? (
                      <a
                        href={`https://wa.me/${m.contact.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); playClickSound(700, "sine"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition"
                        title="Conversar no WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        WhatsApp
                      </a>
                    ) : (
                      <a
                        href={`https://wa.me/5532984124860?text=${encodeURIComponent(`Olá! Gostaria de conversar com ${m.name} da Comunidade Do Começo ao Topo.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); playClickSound(700, "sine"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 hover:border-emerald-500/60 rounded-lg text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition"
                        title="Conversar no WhatsApp"
                      >
                        <Phone className="w-3 h-3 text-emerald-400" />
                        WhatsApp
                      </a>
                    )}

                    {m.instagramLink ? (
                      <a
                        href={m.instagramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); playClickSound(700, "sine"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-pink-500/10 hover:bg-pink-500/25 border border-pink-500/30 hover:border-pink-500/60 rounded-lg text-[10px] font-mono font-bold text-pink-400 hover:text-pink-300 transition"
                        title="Visitar Instagram"
                      >
                        <Globe className="w-3 h-3 text-pink-400" />
                        Instagram
                      </a>
                    ) : (
                      <a
                        href="https://instagram.com/docomecoaotopo"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); playClickSound(700, "sine"); }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-pink-500/10 hover:bg-pink-500/25 border border-pink-500/30 hover:border-pink-500/60 rounded-lg text-[10px] font-mono font-bold text-pink-400 hover:text-pink-300 transition"
                        title="Visitar Instagram"
                      >
                        <Globe className="w-3 h-3 text-pink-400" />
                        Instagram
                      </a>
                    )}
                  </div>

                  {/* Card Footer CTA */}
                  <div className="pt-2 border-t border-zinc-900/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="group-hover:text-zinc-300 transition flex items-center gap-1">
                      <User className="w-3 h-3" /> Ver Perfil Completo
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER CAMPAIGNS & ANUNCIOS */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          
          <div className="p-4 bg-stone-950 border border-zinc-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-pink-500 animate-pulse shrink-0" />
              <p className="text-[10px] font-mono text-zinc-450 leading-relaxed max-w-xl">
                Promoções e cupons da região do Sudeste do Brasil. Para trocar de vantagem comercial ou resgatar cupons, clique no botão <strong>COPIAR CÓDIGO</strong> para aplicar nos parceiros credenciados.
              </p>
            </div>
            <div className="text-[10px] font-mono text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1.5 rounded-xl uppercase shrink-0 font-bold">
              👑 {campaigns.length} Cupons Regionais Ativos
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-stone-950 border border-zinc-900 hover:border-pink-500/30 rounded-3xl overflow-hidden transition duration-300 group flex flex-col justify-between relative shadow-sm"
              >
                {/* Admin controls */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                    <button
                      onClick={(e) => handleOpenEditCampaign(camp, e)}
                      className="p-1.5 bg-black/85 hover:bg-pink-900/90 text-pink-400 hover:text-white border border-zinc-800 hover:border-pink-500 rounded-lg text-[9px] font-mono transition shadow-md"
                      title="Editar campanha (Admin)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCampaign(camp.id, e)}
                      className="p-1.5 bg-black/85 hover:bg-red-900/90 text-zinc-400 hover:text-white border border-zinc-800 hover:border-red-500 rounded-lg text-[9px] font-mono transition shadow-md"
                      title="Excluir campanha patrocinada (Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <div className="relative h-44 w-full bg-zinc-900 border-b border-zinc-900">
                    <PositionableImage src={camp.image} alt={camp.title} className="w-full h-full object-cover" storageKey={`community-camp-${camp.id}-${camp.title}`} editable={isAdmin} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 text-white pointer-events-none" />
                    
                    <span className="absolute top-3 left-3 bg-pink-600 text-white text-[8px] font-mono font-black tracking-widest px-2.5 py-0.5 rounded uppercase">
                      CAMPANHA ATIVA
                    </span>
                    
                    <div className="absolute bottom-3 left-3">
                      <span className="text-[8px] font-mono text-pink-400 font-extrabold block">
                        PATROCINADOR OFICIAL:
                      </span>
                      <h4 className="text-white font-display font-black text-sm uppercase leading-tight">
                        {camp.sponsor}
                      </h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5">
                    <h5 className="font-display font-extrabold text-[#22c55e] text-xs uppercase tracking-tight">
                      🏷️ {camp.title}
                    </h5>
                    <p className="text-zinc-450 text-[11px] leading-relaxed line-clamp-4">
                      {camp.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 space-y-3">
                  <div className="p-2.5 bg-black rounded-xl border border-zinc-900 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-zinc-550 font-mono uppercase block">CÓDIGO DE DESCONTO</span>
                      <strong className="text-xs font-mono text-pink-400 select-all tracking-wider">{camp.discountCode}</strong>
                    </div>
                    <button
                      onClick={() => {
                        playSuccessSound();
                        navigator.clipboard.writeText(camp.discountCode);
                        toast.success(`Cupom "${camp.discountCode}" copiado com sucesso! Use no site da campanha.`);
                      }}
                      className="px-2.5 py-1 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-zinc-750 text-[9px] font-mono text-white transition active:scale-95 shrink-0"
                    >
                      Copiar Código
                    </button>
                  </div>

                  <a
                    href={camp.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-gradient-to-r from-pink-500/10 hover:from-pink-500/15 via-zinc-900 to-zinc-900 text-zinc-350 hover:text-white border border-pink-500/20 hover:border-pink-500/40 font-mono text-[10px] font-bold uppercase rounded-xl flex items-center justify-center gap-1.5 transition duration-300"
                  >
                    <span>RESGATAR BENEFÍCIO</span>
                    <ExternalLink className="w-3 h-3 text-pink-500" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER PHOTO GALLERY */}
      {activeTab === "gallery" && (
        <PhotoGallery mode="comunidade" />
      )}

      {/* RENDER RSVP TAB */}
      {activeTab === "rsvp" && isAdmin && (
        <div className="bg-stone-950 border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between border-b border-zinc-900 pb-6">
            <div>
              <h3 className="text-xl font-display font-black text-purple-400 uppercase tracking-tight flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                Presenças Confirmadas (RSVP)
              </h3>
              <p className="text-sm text-zinc-400 font-mono">
                Lançamento Oficial do Portal de Negócios (17 de Agosto)
              </p>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center gap-2 max-w-sm">
              <span className="text-xs font-mono text-zinc-400">Link para QR Code:</span>
              <div className="flex items-center gap-2 bg-black px-3 py-2 rounded-lg border border-zinc-800 w-full">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/#rsvp`} 
                  className="bg-transparent border-none outline-none text-xs text-green-400 font-mono w-full"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/#rsvp`);
                    playSuccessSound();
                  }}
                  className="text-zinc-500 hover:text-white transition shrink-0"
                  title="Copiar Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[10px] text-zinc-500 text-center">Use este link para gerar seu QR Code em um site gerador.</span>
            </div>
          </div>

          {/* Placeholder table for RSVPs */}
          <div className="text-center py-12 text-zinc-500 font-mono text-sm border border-dashed border-zinc-800 rounded-xl bg-zinc-900/30">
            A lista de confirmados aparecerá aqui.<br/><br/>
            (Integração com banco de dados necessária para exibir os nomes recebidos)
          </div>
        </div>
      )}

      {/* ATUALIZAR CADASTRO OVERLAY MODAL */}
      {showUpdateCadastroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { playClickSound(620, "sine"); setShowUpdateCadastroModal(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2 bg-stone-900 border border-zinc-800 rounded-full"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1.5 border-b border-zinc-900 pb-3 text-left">
              <h3 className="font-display font-black text-lg text-green-400 uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Atualizar Cadastro VIP
              </h3>
              <p className="text-zinc-400 text-xs font-mono">
                Por favor, preencha os dados requisitados abaixo para manter seu cadastro homologado.
              </p>
            </div>

            <form onSubmit={handleUpdateCadastroSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Nome Completo</label>
                  <input 
                    type="text" 
                    value={cadastroNome} 
                    onChange={(e) => setCadastroNome(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required 
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Nome da Empresa</label>
                  <input 
                    type="text" 
                    value={cadastroCompanyName} 
                    onChange={(e) => setCadastroCompanyName(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    placeholder="Sua empresa"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Endereço Completo</label>
                  <input 
                    type="text" 
                    value={cadastroEndereco} 
                    onChange={(e) => setCadastroEndereco(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required 
                    placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Link de Como Chegar (Maps)</label>
                  <input 
                    type="text" 
                    value={cadastroGoogleMapsUrl} 
                    onChange={(e) => setCadastroGoogleMapsUrl(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Link da Foto de Perfil / Marca</label>
                  <input 
                    type="text" 
                    value={cadastroPhoto} 
                    onChange={(e) => setCadastroPhoto(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    placeholder="URL da foto"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Galeria de Serviços/Produtos</label>
                  <input 
                    type="text" 
                    value={cadastroGallery} 
                    onChange={(e) => setCadastroGallery(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    placeholder="URLs separadas por vírgula"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">WhatsApp (Link)</label>
                  <input 
                    type="text" 
                    value={cadastroWhatsapp} 
                    onChange={(e) => setCadastroWhatsapp(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required 
                    placeholder="https://wa.me/5532984124860"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Instagram (@usuario)</label>
                  <input 
                    type="text" 
                    value={cadastroInstagramLink} 
                    onChange={(e) => setCadastroInstagramLink(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    placeholder="@suamarca"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">E-mail</label>
                  <input 
                    type="email" 
                    value={cadastroEmail} 
                    onChange={(e) => setCadastroEmail(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required 
                    placeholder="seuemail@provedor.com"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">CPF / CNPJ</label>
                  <input 
                    type="text" 
                    value={cadastroCpf} 
                    onChange={(e) => setCadastroCpf(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required 
                    placeholder="123.456.789-00"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Aniversário</label>
                  <input 
                    type="date" 
                    value={cadastroBirthday} 
                    onChange={(e) => setCadastroBirthday(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Categoria Principal</label>
                  <select 
                    value={cadastroAreaAtuacao} 
                    onChange={(e) => {
                      setCadastroAreaAtuacao(e.target.value);
                      setCadastroSubAreaAtuacao("");
                    }} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                    required
                  >
                    <option value="">Selecione...</option>
                    {COMMUNITY_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>

                {cadastroAreaAtuacao && cadastroAreaAtuacao !== "outras" && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Subcategoria</label>
                    <select 
                      value={cadastroSubAreaAtuacao} 
                      onChange={(e) => setCadastroSubAreaAtuacao(e.target.value)} 
                      className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none"
                      required
                    >
                      <option value="">Selecione a subcategoria...</option>
                      {COMMUNITY_CATEGORIES.find(c => c.id === cadastroAreaAtuacao)?.subcategories.map(sub => (
                        <option key={sub.id} value={sub.label}>{sub.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {cadastroAreaAtuacao === "outras" && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Especificar Outra Categoria</label>
                    <input 
                      type="text" 
                      value={cadastroCustomArea} 
                      onChange={(e) => setCadastroCustomArea(e.target.value)} 
                      className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none" 
                      placeholder="Ex: Consultoria Especializada" 
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Descrição das Atividades / Biografia</label>
                <textarea 
                  value={cadastroBio} 
                  onChange={(e) => setCadastroBio(e.target.value)} 
                  rows={3}
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none resize-none"
                  placeholder="Fale sobre seus serviços, produtos e experiência..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-900">
                <button 
                  type="button" 
                  onClick={() => { playClickSound(620, "sine"); setShowUpdateCadastroModal(false); }}
                  className="px-4 py-2 bg-stone-900 border border-zinc-800 hover:border-zinc-750 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-mono font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition"
                >
                  SALVAR CADASTRO VIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl p-6 md:p-8 relative shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => handleOpenEditMember(selectedMember)}
                  className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-sm"
                  title="Editar este membro"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>EDITAR DADOS</span>
                </button>
              )}
              <button 
                onClick={() => { playClickSound(620, "sine"); setSelectedMember(null); }}
                className="text-zinc-400 hover:text-white transition p-2 bg-stone-900 border border-zinc-800 rounded-full"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mt-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden bg-zinc-900 shrink-0 border border-zinc-800 shadow-xl">
                <PositionableImage 
                  src={selectedMember.photo || DEFAULT_MEMBER_AVATAR} 
                  alt={selectedMember.name} 
                  className="w-full h-full object-cover" 
                  storageKey={`community-member-modal-${selectedMember.id}`} 
                  editable={isAdmin} 
                />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <h2 className="font-display font-black text-2xl text-white tracking-tight flex items-center gap-2">
                    {selectedMember.name}
                    {selectedMember.isVerified && (
                      <ShieldCheck className="w-5 h-5 text-green-400 shrink-0" />
                    )}
                  </h2>
                  {selectedMember.companyName && (
                    <p className="text-sm font-mono text-zinc-400 font-bold uppercase tracking-wider">
                      {selectedMember.companyName}
                    </p>
                  )}
                  <p className="text-xs text-zinc-500 font-mono flex items-center gap-2 flex-wrap">
                    <span>{selectedMember.role}</span> • <span className="text-green-400">{selectedMember.branch}</span>
                    {selectedMember.birthday && (
                      <>
                        • 
                        <span className="inline-flex items-center gap-1 text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20">
                          <Cake className="w-3 h-3 text-pink-400" />
                          <span>Aniversário: {getMemberBirthdayInfo(selectedMember.birthday).formatted || selectedMember.birthday}</span>
                        </span>
                      </>
                    )}
                  </p>
                </div>
                
                <p className="text-sm text-zinc-300 leading-relaxed max-w-lg">
                  {selectedMember.bio || "Nenhuma descrição informada."}
                </p>
                
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-900">
                  {selectedMember.address && (
                    <a 
                      href={selectedMember.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(selectedMember.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition group shadow-sm"
                    >
                      <MapPin className="w-4 h-4 text-blue-400 group-hover:animate-bounce" />
                      Como Chegar
                    </a>
                  )}

                  {/* WhatsApp - Always visible for every member */}
                  <a 
                    href={
                      selectedMember.whatsappLink || 
                      (selectedMember.contact ? `https://wa.me/${selectedMember.contact.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedMember.name}! Vi seu perfil na Comunidade Do Começo ao Topo.`)}` : `https://wa.me/5532984124860?text=${encodeURIComponent(`Olá! Gostaria de falar com ${selectedMember.name} da Comunidade Do Começo ao Topo.`)}`)
                    } 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-500/80 rounded-xl text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 transition group shadow-md shadow-emerald-950/20"
                  >
                    <Phone className="w-4 h-4 text-emerald-400 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
                    <span>WhatsApp</span>
                    {selectedMember.contact && (
                      <span className="text-[10px] text-emerald-500/80 font-normal">({selectedMember.contact})</span>
                    )}
                  </a>

                  {/* Instagram - Always visible for every member */}
                  <a 
                    href={
                      selectedMember.instagramLink || 
                      (selectedMember.instagram ? `https://instagram.com/${selectedMember.instagram.replace(/[@\s]/g, '')}` : "https://instagram.com/docomecoaotopo")
                    } 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-pink-950/40 hover:bg-pink-900/60 border border-pink-500/40 hover:border-pink-500/80 rounded-xl text-xs font-mono font-bold text-pink-400 hover:text-pink-300 transition group shadow-md shadow-pink-950/20"
                  >
                    <Globe className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span>Instagram</span>
                    {selectedMember.instagram && (
                      <span className="text-[10px] text-pink-400/80 font-normal">({selectedMember.instagram})</span>
                    )}
                  </a>

                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}?subject=${encodeURIComponent(`Contato via Comunidade Do Começo ao Topo - ${selectedMember.name}`)}`}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-mono text-zinc-300 hover:text-white transition group"
                    >
                      <Mail className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>

            {selectedMember.gallery && selectedMember.gallery.length > 0 && (
              <div className="mt-8 pt-6 border-t border-zinc-900">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display font-black text-sm text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Galeria do Negócio ({selectedMember.gallery.length})
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditMember(selectedMember)}
                      className="text-[10px] font-mono text-green-400 hover:underline flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" /> Gerenciar Fotos
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedMember.gallery.map((imgUrl, idx) => {
                    const cleanUrl = imgUrl.trim();
                    if (!cleanUrl) return null;
                    return (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-stone-900 border border-zinc-800 group relative">
                        <img 
                          src={cleanUrl} 
                          alt={`${selectedMember.name} gallery ${idx + 1}`} 
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=300";
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN MODAL 1: EDIT HEADER TEXTS */}
      {showEditHeaderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-zinc-950 border border-green-500/40 rounded-3xl w-full max-w-xl p-6 md:p-8 relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">Editar Cabeçalho da Comunidade</h3>
                  <p className="text-xs text-zinc-400 font-mono">Altere os textos do banner principal visível a todos os membros</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditHeaderModal(false)}
                className="text-zinc-500 hover:text-white p-1.5 rounded-full hover:bg-zinc-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeaderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase">Etiqueta / Badge Superior</label>
                <input 
                  type="text" 
                  value={editHeaderBadge} 
                  onChange={(e) => setEditHeaderBadge(e.target.value)} 
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none font-mono"
                  placeholder="Ex: 🏆 PAINEL EXCLUSIVO DA COMUNIDADE"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase">Título Principal</label>
                <input 
                  type="text" 
                  value={editHeaderTitle} 
                  onChange={(e) => setEditHeaderTitle(e.target.value)} 
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-green-500 focus:outline-none font-bold"
                  placeholder="Ex: Bem-vindo ao Hub de Negócios"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-zinc-300 font-bold uppercase">Texto Descritivo</label>
                <textarea 
                  value={editHeaderDesc} 
                  onChange={(e) => setEditHeaderDesc(e.target.value)} 
                  rows={4}
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none leading-relaxed"
                  placeholder="Descreva o propósito da comunidade..."
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-900">
                <button 
                  type="button" 
                  onClick={() => setShowEditHeaderModal(false)}
                  className="px-4 py-2 bg-stone-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-mono font-black text-xs rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>SALVAR TEXTOS</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL 2: EDIT FULL MEMBER PROFILE & PHOTOS */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-zinc-950 border border-green-500/40 rounded-3xl w-full max-w-3xl p-6 md:p-8 relative shadow-2xl my-8 max-h-[92vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                    Editar Perfil: {editingMember.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">Modifique textos, cargos, contatos e fotos do membro</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingMember(null)}
                className="text-zinc-500 hover:text-white p-1.5 rounded-full hover:bg-zinc-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMemberSubmit} className="space-y-5">
              
              {/* Photo & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-stone-900/60 border border-zinc-850">
                <div className="space-y-2 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-green-500/40 relative group">
                    <img 
                      src={editMemberPhoto || DEFAULT_MEMBER_AVATAR} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_MEMBER_AVATAR;
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 items-center w-full">
                    <label className="cursor-pointer px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[10px] font-mono font-bold rounded-lg border border-zinc-700 flex items-center gap-1.5 transition">
                      <Upload className="w-3 h-3 text-green-400" />
                      <span>Upload Foto</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, (url) => setEditMemberPhoto(url))} 
                      />
                    </label>
                    {editMemberPhoto && (
                      <button
                        type="button"
                        onClick={() => setEditMemberPhoto("")}
                        className="px-2 py-0.5 text-[9px] font-mono text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 rounded transition"
                      >
                        Usar Ícone Padrão
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Link da Foto (URL)</label>
                    <input 
                      type="text" 
                      value={editMemberPhoto} 
                      onChange={(e) => setEditMemberPhoto(e.target.value)} 
                      className="w-full bg-stone-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                      placeholder="https://..." 
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-zinc-300">
                      <input 
                        type="checkbox" 
                        checked={editMemberIsVerified} 
                        onChange={(e) => setEditMemberIsVerified(e.target.checked)} 
                        className="w-4 h-4 rounded text-green-500 focus:ring-0 bg-stone-900 border-zinc-700"
                      />
                      <span className="flex items-center gap-1 text-green-400 font-bold">
                        <ShieldCheck className="w-4 h-4" /> Membro VIP Verificado
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Main Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Nome Completo</label>
                  <input 
                    type="text" 
                    value={editMemberName} 
                    onChange={(e) => setEditMemberName(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Nome da Empresa / Marca</label>
                  <input 
                    type="text" 
                    value={editMemberCompanyName} 
                    onChange={(e) => setEditMemberCompanyName(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    placeholder="Ex: Do Começo ao Topo" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Cargo / Função Profissional</label>
                  <input 
                    type="text" 
                    value={editMemberRole} 
                    onChange={(e) => setEditMemberRole(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Cidade</label>
                  <input 
                    type="text" 
                    value={editMemberCity} 
                    onChange={(e) => setEditMemberCity(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    placeholder="Ex: Juiz de Fora" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Categoria Principal</label>
                  <select 
                    value={editMemberBranch} 
                    onChange={(e) => {
                      setEditMemberBranch(e.target.value);
                      setEditMemberSubBranch("");
                    }} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none"
                  >
                    {COMMUNITY_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                    ))}
                  </select>
                </div>

                {editMemberBranch && editMemberBranch !== "outras" && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Subcategoria</label>
                    <select 
                      value={editMemberSubBranch} 
                      onChange={(e) => setEditMemberSubBranch(e.target.value)} 
                      className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {COMMUNITY_CATEGORIES.find(c => c.id === editMemberBranch)?.subcategories.map(sub => (
                        <option key={sub.id} value={sub.label}>{sub.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {editMemberBranch === "outras" && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Especificar Categoria</label>
                    <input 
                      type="text" 
                      value={editMemberCustomBranch} 
                      onChange={(e) => setEditMemberCustomBranch(e.target.value)} 
                      className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    />
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Biografia / Descrição do Membro</label>
                <textarea 
                  value={editMemberBio} 
                  onChange={(e) => setEditMemberBio(e.target.value)} 
                  rows={3}
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-green-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Contact and Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={editMemberContact} 
                    onChange={(e) => setEditMemberContact(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    placeholder="(32) 99999-9999" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Link WhatsApp Direto</label>
                  <input 
                    type="text" 
                    value={editMemberWhatsappLink} 
                    onChange={(e) => setEditMemberWhatsappLink(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    placeholder="https://wa.me/55..." 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">E-mail</label>
                  <input 
                    type="email" 
                    value={editMemberEmail} 
                    onChange={(e) => setEditMemberEmail(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Instagram (@usuario ou Link)</label>
                  <input 
                    type="text" 
                    value={editMemberInstagramLink} 
                    onChange={(e) => setEditMemberInstagramLink(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Endereço Comercial</label>
                  <input 
                    type="text" 
                    value={editMemberAddress} 
                    onChange={(e) => setEditMemberAddress(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    placeholder="Rua Exemplo, 100 - Juiz de Fora" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Link do Google Maps</label>
                  <input 
                    type="text" 
                    value={editMemberGoogleMapsUrl} 
                    onChange={(e) => setEditMemberGoogleMapsUrl(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-green-500 focus:outline-none" 
                    placeholder="https://maps.app.goo.gl/..." 
                  />
                </div>
              </div>

              {/* Gallery Manager */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-zinc-850 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-xs text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-green-400" />
                    Gerenciador de Galeria de Fotos ({editMemberGallery.length})
                  </h4>
                  <label className="cursor-pointer px-3 py-1 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition">
                    <Upload className="w-3 h-3" />
                    <span>Upload Foto para Galeria</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, (url) => setEditMemberGallery([...editMemberGallery, url]))} 
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={newGalleryUrl} 
                    onChange={(e) => setNewGalleryUrl(e.target.value)} 
                    className="flex-1 bg-stone-950 border border-zinc-800 rounded-xl p-2 text-xs text-white focus:border-green-500 focus:outline-none font-mono"
                    placeholder="Ou cole a URL de uma imagem..." 
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      if (newGalleryUrl.trim()) {
                        setEditMemberGallery([...editMemberGallery, newGalleryUrl.trim()]);
                        setNewGalleryUrl("");
                        playSuccessSound();
                      }
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono font-bold"
                  >
                    Adicionar URL
                  </button>
                </div>

                {editMemberGallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-2">
                    {editMemberGallery.map((imgUrl, idx) => (
                      <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-stone-950 border border-zinc-800 relative group">
                        <img src={imgUrl} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => setEditMemberGallery(editMemberGallery.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-red-950/90 hover:bg-red-800 text-red-300 rounded-md transition shadow-md"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-900">
                <button 
                  type="button" 
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 bg-stone-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black font-mono font-black text-xs rounded-xl shadow-lg shadow-green-500/20 active:scale-95 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>SALVAR ALTERAÇÕES</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN MODAL 3: EDIT CAMPAIGN & ADVERTISEMENT */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-zinc-950 border border-pink-500/40 rounded-3xl w-full max-w-xl p-6 md:p-8 relative shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
                    Editar Campanha / Anúncio
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">Atualize banners, textos, cupons e links de destino</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingCampaign(null)}
                className="text-zinc-500 hover:text-white p-1.5 rounded-full hover:bg-zinc-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCampaignSubmit} className="space-y-4">
              
              {/* Campaign Banner Preview & Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Banner / Imagem da Campanha</label>
                <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img src={editCampImage} alt="Camp preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editCampImage} 
                    onChange={(e) => setEditCampImage(e.target.value)} 
                    className="flex-1 bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none font-mono"
                    placeholder="URL da imagem (https://...)" 
                  />
                  <label className="cursor-pointer px-3 py-2.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-mono font-bold border border-zinc-750 flex items-center gap-1.5 shrink-0 transition">
                    <Upload className="w-3.5 h-3.5 text-pink-400" />
                    <span>Upload</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleFileUpload(e, (url) => setEditCampImage(url))} 
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Título da Promoção / Oferta</label>
                  <input 
                    type="text" 
                    value={editCampTitle} 
                    onChange={(e) => setEditCampTitle(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Patrocinador / Empresa</label>
                  <input 
                    type="text" 
                    value={editCampSponsor} 
                    onChange={(e) => setEditCampSponsor(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none" 
                    required 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Código de Cupom</label>
                  <input 
                    type="text" 
                    value={editCampCode} 
                    onChange={(e) => setEditCampCode(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none font-mono font-bold text-pink-400" 
                    placeholder="Ex: VIP20" 
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Link de Ação / WhatsApp</label>
                  <input 
                    type="text" 
                    value={editCampLink} 
                    onChange={(e) => setEditCampLink(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-pink-500 focus:outline-none" 
                    placeholder="https://..." 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Descrição da Campanha</label>
                <textarea 
                  value={editCampDesc} 
                  onChange={(e) => setEditCampDesc(e.target.value)} 
                  rows={3}
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-900">
                <button 
                  type="button" 
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 bg-stone-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-400 text-black font-mono font-black text-xs rounded-xl shadow-lg shadow-pink-500/20 active:scale-95 transition flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>SALVAR CAMPANHA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUERO FAZER PARTE DA COMUNIDADE - MODALIDADE DOS PLANOS */}
      <div id="quero-fazer-parte-section" className="pt-10 border-t border-zinc-850">
        <CommunityMembership isDarkMode={isDarkMode} isAdmin={isAdmin} />
      </div>

    </div>
  );
}
