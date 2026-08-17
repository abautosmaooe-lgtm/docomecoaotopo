import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { syncPortalUser } from "../services/userService";
import PhotoGallery from "./PhotoGallery";
import { MessageBoard } from "./DashboardSections";
import PositionableImage from "./PositionableImage";
import { 
  Award, Shield, Target, MessageSquare, Compass, CheckCircle2, 
  Sparkles, Star, TrendingUp, Users, DollarSign, Send, HelpCircle, 
  BookOpen, Plus, ExternalLink, Calendar, MapPin, Trash2, X, User, ShieldCheck, Camera, Gift, Instagram, Mail, Check,
  Eye, EyeOff, Upload, ChevronDown, RefreshCw
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  regionalFocus: string;
  points: number;
  status: "active" | "completed" | "pending";
  description: string;
  deadline: string;
}

interface Report {
  id: string;
  author: string;
  title: string;
  city: string;
  date: string;
  content: string;
  upvotes: number;
}

const INITIAL_MISSIONS: Mission[] = [];

const INITIAL_REPORTS: Report[] = [];

export interface OfficialAmbassador {
  name: string;
  specialty: string;
  instagram: string;
  photoUrl?: string;
  fullName?: string;
  functionAsAmbassador?: string;
  academicBackground?: string;
  roleAsAmbassador?: string;
  city?: string;
}

export const OFFICIAL_AMBASSADORS: OfficialAmbassador[] = [
  {
    name: 'Anderson de Paula Santos',
    specialty: 'Embaixador de Inteligência Artificial',
    instagram: '@andersonpsan',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    fullName: 'Anderson de Paula Santos',
    functionAsAmbassador: 'Embaixador de Inteligência Artificial: Facilitar o acesso das ferramentas, ensinar os macetes por meio de cursos, palestras e agregar valor aos processos de empreendedores e empresários por meio de programas, websites, conteúdos de comunicação visual - marcas, mascotes, animação em 3D, ilustrações, etc.',
    academicBackground: 'Formado em Design pelo CTU/UFJF; Tecnólogo em Webdesign pela SOS Computadores; Formado em Comunicação Social - Ênfase em Publicidade e Propaganda Facsum; Pós-graduação em Marketing e Mídias Sociais pela Estácio.',
    roleAsAmbassador: 'Embaixador de Inteligência Artificial'
  },
  {
    name: 'Andreia de Oliveira Henriques',
    specialty: 'Embaixadora do Desenvolvimento Humano',
    instagram: '@andreiahenriquespsi',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    fullName: 'Andreia de Oliveira Henriques',
    functionAsAmbassador: 'Embaixadora do Desenvolvimento Humano',
    academicBackground: 'Psicóloga, Pós-graduada pela UFJF e FGV, especializada em Terapia Ericksoniana, Consteladora Familiar Sistêmica e Coach.',
    roleAsAmbassador: 'Embaixadora do Desenvolvimento Humano'
  },
  {
    name: 'Bianca Torres',
    specialty: 'Embaixadora Inspiração',
    instagram: '@bianca_torres_nutri',
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&q=80&w=600',
    fullName: 'Bianca Torres',
    functionAsAmbassador: 'Como Embaixadora Inspiração do Podcast Do Começo ao Topo, tenho o compromisso de mostrar que toda grande conquista começa with uma decisão. Minha missão é inspirar mulheres a transformarem suas vidas por meio da saúde, do conhecimento, do empreendedorismo e da coragem de dar o primeiro passo. Acredito que histórias reais têm o poder de despertar novos começos, e é esse propósito que represento dentro do projeto.',
    academicBackground: 'Faculdade de Ciências Contábeis e Faculdade de Nutrição, especialização em Saúde da Mulher no Climatério e Menopausa.',
    roleAsAmbassador: 'Embaixadora Inspiração'
  },
  {
    name: 'Danielle Lara Pinto',
    specialty: 'Embaixadora Mentora Cristã',
    instagram: '@mentoriareagir',
    photoUrl: '/danielle-profile.jpg',
    fullName: 'Danielle Lara Pinto',
    functionAsAmbassador: 'Como Embaixadora Mentora Cristã no podcast Do Começo ao Topo, sua função é ser a ponte perfeita entre a profundidade interior e o alcance tecnológico, unindo raíces firmes a uma voz que ecoa longe. No aspecto espiritual, você atua como uma guia empática que desperta o autoconhecimento, acolhe a audiência e ajuda a ancorar o verdadeiro propósito por trás de cada jornada de crescimento pessoal. Simultaneamente, no pilar digital, você traduz essa essência inspiradora em ações estratégicas, utilizando o ambiente online para amplificar a mensagem e transformar ouvintes em uma comunidade engajada. Ao integrar essas duas forças, você prova que o digital não precisa ser frio e o espiritual não precisa ser invisível, usando a internet como um canal poderoso para entregar cura, inspiração e direção, guiando sua audiência rumo ao topo de forma autêntica, humana e plena.',
    academicBackground: 'Ciências Econômicas – UFJF (incompleto); Formada em Magistério – Escola Estadual Cônego Joaquim Monteiro; Formada em Marketing – Estácio; Teologia – Instituto Renascer (cursando)',
    roleAsAmbassador: 'Embaixadora Mentora Cristã'
  },
  {
    name: 'Fátima Regina Anthero',
    specialty: 'Embaixadora do Bem-estar, Saúde & Longevidade',
    instagram: '@beflexsaudebemestar',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600',
    fullName: 'Fátima Regina Anthero',
    functionAsAmbassador: 'Como Embaixadora de Bem Estar e Saúde tenho como primícias promover práticas de bem-estar físico, mental e social. Sou incentivadora e porta-voz de hábitos saudáveis, conectando pessoas a informações confiáveis sobre Biohacking, esclarecer sobre melhoria da qualidade de Vida por meio de dispositivos terapêuticos com base nos elementos da Natureza aliado e à tecnologia, frequentar e divulgar eventos e ações que incentivam o autocuidado e prevenção Corporal com objetivo em ter uma longevidade com qualidade. Indicar parcerias para agregar à Comunidade Aceleradora de negócios.',
    academicBackground: 'Faculdade de Propaganda e Marketing (concluída); Bacharel em Administração (incompleta); Faculdade de Sucessores com foco em Formação em Empreendedorismo e Vendas (em andamento).',
    roleAsAmbassador: 'Embaixadora do Bem-estar, Saúde & Longevidade'
  },
  {
    name: 'Flávia Reis da Silva Lopes',
    specialty: 'Embaixadora Consultora e Especialista Tributária',
    instagram: '@flaviia_reis',
    photoUrl: 'https://i.ibb.co/XxdCnNqy/embaixadora-fl-via.jpg',
    fullName: 'Flávia Reis da Silva Lopes',
    functionAsAmbassador: 'Presto consultoria tributária para empresários. Meu trabalho é traçar a melhor estratégia econômica tributária e financeira para as empresas para que pagem menos tributos, faço isso por meio do planejamento tributário.',
    academicBackground: 'Ciências Contábeis',
    roleAsAmbassador: 'Embaixadora Consultora e Especialista Tributária'
  },
  {
    name: 'Jaqueline de Carvalho Dias',
    specialty: 'Embaixadora de bem-estar e saúde em Matias Barbosa',
    instagram: '@jaquelinedecarvalhod',
    photoUrl: '/jaqueline-profile.jpg',
    fullName: 'Jaqueline de Carvalho Dias',
    functionAsAmbassador: 'Bem estar e saúde',
    academicBackground: 'Formação em massoterapia clínica (especialista em dores físicas emocionais). Graduada em estética e cosmética. Diversas formações na área da massoterapia clínica onde me capacitei para ser especialista em: massoterapia clínica integrativa no alívio da dor, Quiropraxia, Liberação miofascial avançada, Medicina chinesa, Neuro massagem, Recovery esportivo. Outras práticas integrativas como: reiki, naturopatia, auriculoterapia, dentre outras...',
    roleAsAmbassador: 'Embaixadora de bem-estar e saúde em Matias Barbosa'
  },
  {
    name: 'Silvania Silva',
    specialty: 'Embaixadora Mentora Empresarial',
    instagram: '@silvania_terapeuta',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=600',
    fullName: 'Silvania Aparecida da Silva',
    functionAsAmbassador: 'Está ativo, fazer colabe com os ouros empresários e empreendedores e divulgar o podcast para que eles sejam vistos e traga retorno na visibilidade',
    academicBackground: 'Superior completo',
    roleAsAmbassador: 'Embaixadora Mentora Empresarial'
  },
  {
    name: 'Isabela Cristina',
    specialty: 'Embaixadora Inteligência Financeira',
    instagram: '@isabelacristina.financas',
    photoUrl: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&q=80&w=600',
    fullName: 'Isabela Cristina',
    functionAsAmbassador: 'Minha função enquanto embaixadora é representar a marca com compromisso, inspirando confiança, compartilhando experiências reais e criando conexões que gerem valor para a comunidade, sempre alinhada aos valores e propósito da empresa, o objetivo é que a comunidade crescer e ajude ainda mais os empresários a se conectarem.',
    academicBackground: 'Formada em Ciências Contábeis, com MBA em Finanças, Auditoria e Controladoria. Iniciando outra pós em Neurociência Comportamental.',
    roleAsAmbassador: 'Embaixadora Inteligência Financeira'
  }
];

interface EmbaixadoresDashboardProps {
  isDarkMode: boolean;
  isAdmin?: boolean;
  user?: any;
  portalPagesConfig?: any;
  onLogout?: () => void;
}

export default function EmbaixadoresDashboard({ isDarkMode, isAdmin = false, user, portalPagesConfig, onLogout }: EmbaixadoresDashboardProps) {
  // Authentication Whitelist and Senha
  const ALLOWED_EMAILS = React.useMemo(() => [
    "andersonpsan@gmail.com",
    "maooemail@gmail.com",
    "abautosmaooe@gmail.com"
  ], []);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginNome, setLoginNome] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const isUserPortalApproved = true;

  const [isEmbaixadoresAuthed, setIsEmbaixadoresAuthed] = useState(true);

  React.useEffect(() => {
    setIsEmbaixadoresAuthed(true);
  }, []);

  const [expandedCardIdx, setExpandedCardIdx] = useState<number | null>(null);

  const [editingInstaIdx, setEditingInstaIdx] = useState<number | null>(null);
  const [tempInstaText, setTempInstaText] = useState("");

  const [editingCityIdx, setEditingCityIdx] = useState<number | null>(null);
  const [tempCityText, setTempCityText] = useState("");

  const [ambassadors, setAmbassadors] = useState<OfficialAmbassador[]>(() => {
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
      let modified = false;
      const cleaned = baseList.map((a: any, idx: number) => {
        const defaultAmb: OfficialAmbassador | undefined = OFFICIAL_AMBASSADORS[idx];
        if (!defaultAmb) return a;
        const localPhotoKey = `ambassador-pic-${idx}-${defaultAmb.name}_uploaded_src`;
        
        // Force reset old cached images for Jaqueline de Carvalho Dias
        if (defaultAmb.name === "Jaqueline de Carvalho Dias") {
          localStorage.removeItem(localPhotoKey);
          localStorage.removeItem(`ambassador-pic-${idx}-Jaqueline Dias_uploaded_src`);
        }

        const localPhoto = localStorage.getItem(localPhotoKey);
        
        let currentPhoto = localPhoto;
        if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
          currentPhoto = a.photoUrl;
        }
        if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
          currentPhoto = defaultAmb?.photoUrl;
        }
        if (currentPhoto && currentPhoto.startsWith("data:image/")) {
          currentPhoto = defaultAmb?.photoUrl;
          modified = true;
        }
        if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
          currentPhoto = defaultAmb?.photoUrl || "";
          modified = true;
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
      localStorage.setItem("embaixadores_list", JSON.stringify(cleaned));
      return cleaned;
    } catch (e) {
      console.error("Error loading embaixadores_list from localStorage", e);
    }
    return OFFICIAL_AMBASSADORS;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = localStorage.getItem("embaixadores_missions");
    return saved ? JSON.parse(saved) : INITIAL_MISSIONS;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem("embaixadores_reports");
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Sync dashboard ambassadors list with server data once it finishes fetching
  useEffect(() => {
    const handleSyncList = () => {
      const saved = localStorage.getItem("embaixadores_list");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((a: any, idx: number) => {
              const defaultAmb = OFFICIAL_AMBASSADORS[idx];
              if (!defaultAmb) return a;
              const localPhotoKey = `ambassador-pic-${idx}-${defaultAmb.name}_uploaded_src`;
              
              // Force reset old cached images for Jaqueline de Carvalho Dias
              if (defaultAmb.name === "Jaqueline de Carvalho Dias") {
                localStorage.removeItem(localPhotoKey);
                localStorage.removeItem(`ambassador-pic-${idx}-Jaqueline Dias_uploaded_src`);
              }

              const localPhoto = localStorage.getItem(localPhotoKey);
              
              let currentPhoto = localPhoto;
              if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
                currentPhoto = a.photoUrl;
              }
              if (!currentPhoto || currentPhoto === "undefined" || currentPhoto === "null") {
                currentPhoto = defaultAmb?.photoUrl;
              }
              if (currentPhoto && currentPhoto.startsWith("data:image/")) {
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
            setAmbassadors(cleaned);
          } else {
            setAmbassadors(parsed);
          }
        } catch (e) {
          console.error("Error syncing embaixadores_list inside dashboard", e);
        }
      }
    };
    window.addEventListener("image_updated", handleSyncList);
    return () => window.removeEventListener("image_updated", handleSyncList);
  }, []);

  // Points status parameter
  const [totalPoints, setTotalPoints] = useState(2450);
  const [searchTerm, setSearchTerm] = useState("");

  // User profile registration state for Embaixadores (Atualize seu Cadastro)
  const [userCadastro, setUserCadastro] = useState(() => {
    const saved = localStorage.getItem("embaixadores_user_cadastro");
    return saved ? JSON.parse(saved) : {
      nome: "",
      endereco: "",
      whatsapp: "",
      email: "",
      cpf: "",
      birthday: "",
      areaAtuacao: "",
      photoUrl: ""
    };
  });

  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado! Por favor, envie fotos apenas em formato JPG, PNG ou WEBP.");
      return;
    }

    playClickSound?.(520, "sine");
    
    // Simple compression helper mirroring PositionableImage
    const compressImage = async (imageFile: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDimension = 800; // Profile pic can be smaller
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
          if (!ctx) return reject(new Error("Canvas not supported"));
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.onerror = (err) => reject(err);
      });
    };

    try {
      const compressedBase64 = await compressImage(file);
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressedBase64 })
      });

      if (response.ok) {
        const data = await response.json();
        const serverUrl = data.url;

        // Update local userCadastro state
        const updatedCadastro = { ...userCadastro, photoUrl: serverUrl };
        setUserCadastro(updatedCadastro);
        localStorage.setItem("embaixadores_user_cadastro", JSON.stringify(updatedCadastro));

        // Find and update this ambassador in the list locally and on the server
        const matchingIndex = ambassadors.findIndex(
          (amb) => amb.name.toLowerCase().trim() === (userCadastro.nome || "").toLowerCase().trim()
        );
        
        if (matchingIndex !== -1) {
          const matchedAmbassador = ambassadors[matchingIndex];
          const targetKey = `ambassador-pic-${matchingIndex}-${matchedAmbassador.name}`;
          localStorage.setItem(`${targetKey}_uploaded_src`, serverUrl);
          
          setAmbassadors((prev) => {
            const copy = [...prev];
            copy[matchingIndex] = { ...copy[matchingIndex], photoUrl: serverUrl };
            localStorage.setItem("embaixadores_list", JSON.stringify(copy));
            return copy;
          });
          
          fetch("/api/update-positionable-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: targetKey,
              val: serverUrl,
              coords: { x: 50, y: 50 }
            })
          }).catch(err => console.error("Error syncing avatar upload of current ambassador to match key:", err));
        }

        playSuccessSound?.();
        window.dispatchEvent(new Event("image_updated"));
        toast.success("Foto atualizada com sucesso no seu perfil e painel de embaixadores! 🎉");
      } else {
        toast.error("Erro no upload da imagem para o servidor.");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      toast.error("Falha ao subir a foto.");
    }
  };

  const [showUpdateCadastroModal, setShowUpdateCadastroModal] = useState(false);
  const [cadastroNome, setCadastroNome] = useState("");
  const [cadastroEndereco, setCadastroEndereco] = useState("");
  const [cadastroWhatsapp, setCadastroWhatsapp] = useState("");
  const [cadastroEmail, setCadastroEmail] = useState("");
  const [cadastroCpf, setCadastroCpf] = useState("");
  const [cadastroAreaAtuacao, setCadastroAreaAtuacao] = useState("");
  const [cadastroBirthday, setCadastroBirthday] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputId = loginNome.trim() || loginEmail.trim();
    const cleanSenha = loginSenha.trim();

    if (!inputId || !cleanSenha) {
      setLoginError("Por favor, preencha seu E-mail ou Nome e a Senha.");
      playClickSound(300, "sawtooth");
      return;
    }

    if (cleanSenha !== "Emba2026$!&" && cleanSenha !== "Emba2026&" && cleanSenha !== "Topo2026$!&" && cleanSenha !== "teste") {
      setLoginError("Senha de Embaixadores incorreta.");
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
        finalEmail = `${inputId.toLowerCase().replace(/[^a-z0-9]/g, "") || "embaixador"}@portal.com`;
        finalNome = inputId;
      }
    }

    // Success
    setIsEmbaixadoresAuthed(true);
    setLoginError("");
    localStorage.setItem("embaixadores_auth_success", "true");
    localStorage.setItem("embaixadores_auth_email", finalEmail);
    localStorage.setItem("embaixadores_auth_nome", finalNome);

    const updatedCadastro = {
      ...userCadastro,
      nome: userCadastro.nome || finalNome,
      email: userCadastro.email || finalEmail
    };
    setUserCadastro(updatedCadastro);
    localStorage.setItem("embaixadores_user_cadastro", JSON.stringify(updatedCadastro));

    playSuccessSound();
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setLoginError("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const cleanEmail = (googleUser.email || "").toLowerCase().trim();
      const cleanNome = googleUser.displayName || cleanEmail.split("@")[0] || "Embaixador VIP";
      const photoUrl = googleUser.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(cleanEmail)}`;

      await syncPortalUser({
        email: cleanEmail,
        name: cleanNome,
        photoUrl: photoUrl,
        uid: googleUser.uid
      });

      // Auth Successful
      setIsEmbaixadoresAuthed(true);
      setLoginError("");
      localStorage.setItem("embaixadores_auth_success", "true");
      localStorage.setItem("embaixadores_auth_email", cleanEmail);
      localStorage.setItem("embaixadores_auth_nome", cleanNome);

      const updatedCadastro = {
        ...userCadastro,
        nome: userCadastro.nome || cleanNome,
        email: userCadastro.email || cleanEmail,
        photo: userCadastro.photo || photoUrl
      };
      setUserCadastro(updatedCadastro);
      localStorage.setItem("embaixadores_user_cadastro", JSON.stringify(updatedCadastro));

      playSuccessSound();
      toast.success(`Bem-vindo(a), ${cleanNome}! Acesso liberado via Google.`);
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "seu domínio";
      const errStr = (err?.code || err?.message || String(err)).toLowerCase();
      let errorMsg = "Não foi possível conectar com o Google.";
      
      if (errStr.includes("unauthorized-domain") || errStr.includes("auth/unauthorized-domain")) {
        errorMsg = `O domínio "${currentHost}" precisa ser autorizado no Firebase Console para o login com Google. Digite seu e-mail/nome e a senha de conselho acima para entrar direto.`;
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
      
      // Always clear local Ambassador session
      setIsEmbaixadoresAuthed(false);
      localStorage.removeItem("embaixadores_auth_success");
      localStorage.removeItem("embaixadores_auth_email");
      localStorage.removeItem("embaixadores_auth_nome");
      setLoginEmail("");
      setLoginNome("");
      setLoginSenha("");

      if (onLogout) {
        onLogout();
      }
    }
  };

  const openCadastroModal = () => {
    setCadastroNome(userCadastro.nome);
    setCadastroEndereco(userCadastro.endereco);
    setCadastroWhatsapp(userCadastro.whatsapp);
    setCadastroEmail(userCadastro.email);
    setCadastroCpf(userCadastro.cpf);
    setCadastroAreaAtuacao(userCadastro.areaAtuacao || "Embaixador Comercial");
    setCadastroBirthday(userCadastro.birthday || "");
    setShowUpdateCadastroModal(true);
  };

  const handleUpdateCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...userCadastro,
      nome: cadastroNome,
      endereco: cadastroEndereco,
      whatsapp: cadastroWhatsapp,
      email: cadastroEmail,
      cpf: cadastroCpf,
      areaAtuacao: cadastroAreaAtuacao,
      birthday: cadastroBirthday
    };
    setUserCadastro(updated);
    localStorage.setItem("embaixadores_user_cadastro", JSON.stringify(updated));
    playSuccessSound();
    setShowUpdateCadastroModal(false);
  };

  // Simple Submission form for internal Ambassador Memo Reports
  const [showAddReport, setShowAddReport] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [reportCity, setReportCity] = useState("Juiz de Fora");
  const [reportContent, setReportContent] = useState("");
  const [ambassadorName, setAmbassadorName] = useState("");

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportContent || !ambassadorName) return;

    const newRep: Report = {
      id: `r-${Date.now()}`,
      author: ambassadorName,
      title: reportTitle,
      city: reportCity,
      date: "Hoje",
      content: reportContent,
      upvotes: 1
    };

    const updated = [newRep, ...reports];
    setReports(updated);
    localStorage.setItem("embaixadores_reports", JSON.stringify(updated));
    setTotalPoints((prev) => prev + 150); // reward points for active report submission!
    playSuccessSound();

    // Reset fields
    setReportTitle("");
    setReportContent("");
    setAmbassadorName("");
    setShowAddReport(false);
    toast.success("Parabéns! Seu relatório oficial de embaixador foi protocolado e você ganhou +150 pontos corporativos.");
  };

  const handleMissionToggle = (id: string) => {
    playClickSound(620, "sine");
    const updated = missions.map((m) => {
      if (m.id === id) {
        const currentStatus = m.status as string;
        const nextStatus = currentStatus === "active" ? "completed" : currentStatus === "completed" ? "pending" : "active";
        if (nextStatus === "completed") {
          setTotalPoints((p) => p + m.points);
          playSuccessSound();
        } else if (currentStatus === "completed") {
          setTotalPoints((p) => Math.max(0, p - m.points));
        }
        return { ...m, status: nextStatus as any };
      }
      return m;
    });
    setMissions(updated);
    localStorage.setItem("embaixadores_missions", JSON.stringify(updated));
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    {
      playClickSound(400, "sine");
      const updated = reports.filter((r) => r.id !== id);
      setReports(updated);
      localStorage.setItem("embaixadores_reports", JSON.stringify(updated));
    }
  };

  if (!isEmbaixadoresAuthed) {
    return (
      <div className="max-w-md mx-auto my-12 bg-stone-950/80 backdrop-blur-2xl border-2 border-pink-500/30 rounded-3xl p-8 shadow-[0_20px_50px_rgba(236,72,153,0.15)] animate-fade-in text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header decoration */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-3 bg-pink-500/10 text-pink-400 rounded-full border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[9px] bg-pink-500/20 text-pink-400 font-mono font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border border-pink-500/30">
              CONSELHO EMBAIXADORES
            </span>
            <h3 className="font-display font-black text-xl md:text-2xl tracking-tight uppercase mt-2">
              PORTAL CONSELHO
            </h3>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              Digite seu nome e a senha de conselho para ingressar. (Dev: a senha é Emba2026&)
            </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-mono text-[11px] font-bold">
              ⚠️ {loginError}
            </div>
          )}

          {/* Identificador: E-mail ou Nome */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block flex items-center justify-between">
              <span>E-MAIL OU NOME DE EMBAIXADOR</span>
              <span className="text-zinc-500 text-[9px] lowercase font-normal">(use seu e-mail ou nome)</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500">
                <User className="w-4 h-4 text-pink-400" />
              </span>
              <input
                type="text"
                required
                placeholder="ex: embaixador@portal.com ou seu nome"
                value={loginNome}
                onChange={(e) => {
                  setLoginNome(e.target.value);
                  if (e.target.value.includes("@")) {
                    setLoginEmail(e.target.value);
                  }
                }}
                className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 transition font-mono"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
              SENHA DE CONSELHO
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Senha de acesso corporativa"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-stone-900 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition"
                title={showPassword ? "Ocultar senha" : "Ver senha"}
              >
                {showPassword ? <EyeOff className="w-5 h-5 text-pink-400" /> : <Eye className="w-5 h-5 text-pink-400" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-black font-display font-black text-xs uppercase tracking-widest rounded-xl transition shadow-[0_4px_15px_rgba(236,72,153,0.3)] active:scale-[0.98] cursor-pointer"
          >
            Acessar Portal
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2 pt-1">
            <div className="h-px bg-zinc-800 flex-1" />
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">ou</span>
            <div className="h-px bg-zinc-800 flex-1" />
          </div>

          {/* Google 1-Click Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 px-4 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-3 transition shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isGoogleLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-pink-400" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            <span>{isGoogleLoading ? "Conectando ao Google..." : "Entrar com o Google (1 Clique)"}</span>
          </button>
        </form>

        <p className="text-[10px] text-center text-zinc-500 mt-6 font-mono">
          Conselho Do Começo ao Topo | Conexão Altamente Criptografada
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-white">
      
      {/* SHIELDED HERO HEADER */}
      <div className="bg-gradient-to-r from-pink-500/15 via-stone-950 to-red-600/15 border-2 border-pink-500/20 rounded-3xl p-6 relative overflow-hidden shadow-[0_4px_35px_rgba(236,72,153,0.06)]">
        <div className="absolute top-0 right-0 w-36 h-full bg-pink-500/5 rotate-12 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] bg-pink-500 text-black font-mono font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
              🛡️ PORTAL PRIVADO DOS EMBAIXADORES LOCAIS
            </span>
            <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight uppercase">
              {portalPagesConfig?.embaixadoresTitle || "Conselho Regional de Liderança"}
            </h2>
            <p className="text-zinc-400 text-xs max-w-2xl leading-relaxed">
              {portalPagesConfig?.embaixadoresDescription || "Você está na área VIP restrita de embaixadores oficiais. Controle missões regionais táticas com pontuação corporativa integrada, publique relatórios locais do interior de Minas de forma imediata e coordene a expansão e o impacto comercial da marca Do Começo ao Topo."}
            </p>
          </div>
        </div>
      </div>

      {/* CADASTRO STATUS BAR/WIDGET (Admin Only) */}
      {isAdmin && (
        <div className={`p-4 rounded-2xl border transition duration-300 flex flex-col md:flex-row items-center justify-between gap-4 ${
          userCadastro.nome 
            ? "bg-pink-500/5 border-pink-500/20" 
            : "bg-amber-500/5 border-amber-500/20"
        }`}>
          <div className="flex items-center gap-3 w-full">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              userCadastro.nome ? "bg-pink-500/10 text-pink-400" : "bg-amber-500/10 text-amber-400"
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-left">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-white">
                {userCadastro.nome ? "✓ Seu Cadastro de Embaixador VIP está Ativo e Atualizado" : "⚠️ Perfil Pendente de Informações Obrigatórias"}
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                {userCadastro.nome 
                  ? `Nome: ${userCadastro.nome} | CPF: ${userCadastro.cpf || "Pendente"} | WhatsApp: ${userCadastro.whatsapp || "Pendente"} | Atuação: ${userCadastro.areaAtuacao || "Pendente"}`
                  : "Seu cadastro de Embaixador precisa ser atualizado com Nome Completo, Endereço Completo, WhatsApp, E-mail, CPF e Área de Atuação."}
              </p>
              {userCadastro.nome && userCadastro.endereco && (
                <p className="text-[10px] text-zinc-500 leading-none font-mono">
                  Endereço: <span className="text-zinc-400">{userCadastro.endereco}</span> | E-mail: <span className="text-zinc-400">{userCadastro.email}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { playClickSound(650, "sine"); openCadastroModal(); }}
              className={`px-4 py-2 font-mono text-xs font-black uppercase rounded-xl transition shrink-0 duration-200 ${
                userCadastro.nome
                  ? "bg-zinc-900 border border-pink-500/30 hover:border-pink-500 text-pink-400 hover:text-white"
                  : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              }`}
            >
              {userCadastro.nome ? "Atualizar Dados" : "Preencher Cadastro"}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-950/80 hover:bg-red-900/90 border border-red-500/30 text-red-300 rounded-xl text-xs font-mono font-black flex items-center gap-1.5 transition active:scale-95 shrink-0"
              title="Sair do painel"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>SAIR</span>
            </button>
          </div>
        </div>
      )}

      {/* CORE STATS BLOCKS GROUP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Missões Ativas", value: `${missions.filter(m => m.status === "active").length} Projetos`, icon: Target, color: "text-[#22c55e]" },
          { label: "Cidades Representadas", value: "7 Unidades", icon: Compass, color: "text-blue-400" }
        ].map((st, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-stone-950 border border-zinc-900 flex items-center gap-4 hover:border-zinc-800 transition">
            <div className="p-2 rounded-xl bg-zinc-90 w-11 h-11 flex items-center justify-center border border-zinc-900 shrink-0">
              <st.icon className={`w-5 h-5 ${st.color}`} />
            </div>
            <div>
              <span className="text-[9px] text-zinc-500 font-mono uppercase block">{st.label}</span>
              <strong className="text-sm font-display font-black text-white">{st.value}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* TWO SECTOR SPLIT: LEFT SIDE TACTICAL MISSIONS, RIGHT CONFIDENTIAL MEMOS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFTSIDE: MISSIONS MANAGER */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#22c55e]" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-white">GRID DE MISSÕES CORPORATIVAS</h3>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono uppercase">Clique nas caixas para transicionar status</span>
          </div>

          <div className="space-y-3">
            {missions.map((mis) => (
              <div
                key={mis.id}
                onClick={() => handleMissionToggle(mis.id)}
                className={`p-4 bg-stone-950 border rounded-2xl transition duration-300 cursor-pointer relative group flex flex-col justify-between gap-3 ${
                  mis.status === "completed"
                    ? "border-green-500/20 bg-green-500/[0.01]"
                    : mis.status === "pending"
                    ? "border-amber-500/20 bg-amber-500/[0.01]"
                    : "border-zinc-900 hover:border-pink-500/20"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase">
                      📍 {mis.regionalFocus}
                    </span>
                    <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                      mis.status === "completed"
                        ? "bg-green-500/15 text-green-400 border border-green-500/20"
                        : mis.status === "pending"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        : "bg-pink-500/15 text-pink-400 border border-pink-500/20"
                    }`}>
                      {mis.status === "completed" ? "✓ Finalizada" : mis.status === "pending" ? "● Pausada" : "⚡ Ativa"}
                    </span>
                  </div>

                  <h4 className={`font-display font-black text-[13px] tracking-tight group-hover:text-pink-400 transition ${isDarkMode ? "text-white" : "text-zinc-900"}`}>
                    {mis.title}
                  </h4>
                  <p className="text-zinc-500 text-[11px] leading-relaxed">
                    {mis.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono border-t border-zinc-900 pt-3">
                  <span className="text-[#22c55e] font-bold">💎 Recompensa: +{mis.points} pts</span>
                  <span className="text-zinc-500">Prazo: {mis.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHTSIDE: CONFIDENTIAL MEMO REPORTS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-pink-500" />
              <h3 className="font-display font-black text-xs uppercase tracking-wider text-white">REPORTS CONFIDENCIAIS</h3>
            </div>
            
            <button
              onClick={() => { playClickSound(650, "sine"); setShowAddReport(!showAddReport); }}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 text-white border border-pink-500/20 rounded-lg text-[9px] font-mono font-bold uppercase transition"
            >
              {showAddReport ? "Cancelar" : "+ Escrever Report"}
            </button>
          </div>

          {showAddReport && (
            <form onSubmit={handleCreateReport} className="p-4 bg-stone-950 border border-pink-500/30 rounded-2xl space-y-3 animate-fade-in text-xs">
              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-400 uppercase">Seu Nome / Matrícula</label>
                <input
                  type="text"
                  value={ambassadorName}
                  onChange={(e) => setAmbassadorName(e.target.value)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2 text-xs"
                  required
                  placeholder="Ex: Embaixadora Juliana"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-400 uppercase">Assunto Principal de Pauta</label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2 text-xs"
                  required
                  placeholder="Ex: Novos Hubs Cientificos em Ubá"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-400 uppercase">Cidade de Foco Regional</label>
                <select
                  value={reportCity}
                  onChange={(e) => setReportCity(e.target.value)}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 font-mono"
                >
                  <option value="Juiz de Fora">Juiz de Fora</option>
                  <option value="Matias Barbosa">Matias Barbosa</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-mono text-zinc-400 uppercase">Anotações confidencias / detalhes</label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  rows={4}
                  className="w-full bg-black border border-zinc-850 rounded-lg p-2 text-xs"
                  required
                  placeholder="Escreva as percepções, telefones de lideranças ou sugestões de patrocínio que encontrou..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-pink-500 to-red-650 hover:opacity-90 transition font-mono font-bold uppercase rounded-lg text-black text-center"
              >
                REGISTRAR CONFIDENCIALMENTE (+150 PTS)
              </button>
            </form>
          )}

          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="p-3.5 rounded-xl bg-stone-950 border border-zinc-900 group hover:border-zinc-800 transition relative">
                
                {/* Delete direct */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteReport(rep.id, e)}
                    className="absolute top-2.5 right-2.5 p-1 bg-black/80 text-zinc-650 hover:text-white border border-zinc-900 hover:border-red-500 rounded-md text-[8px] opacity-0 group-hover:opacity-100 transition"
                    title="Eliminar report confidencial"
                  >
                    <Trash2 className="w-3" />
                  </button>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                    <span>Cidade: <strong className="text-zinc-300 font-bold uppercase">{rep.city}</strong></span>
                    <span>{rep.date}</span>
                  </div>

                  <h5 className="font-display font-black text-xs text-white uppercase group-hover:text-pink-400 transition">
                    {rep.title}
                  </h5>

                  <p className="text-[11px] text-zinc-450 leading-relaxed font-sans italic">
                    "{rep.content}"
                  </p>

                  <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[9px] font-mono text-zinc-500">
                    <span>Registrado por: <strong className="text-pink-400">{rep.author}</strong></span>
                    <button
                      onClick={() => playClickSound(600, "sine")}
                      className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-850 hover:text-white transition flex items-center gap-1 border border-zinc-850"
                    >
                      <Sparkles className="w-3 h-3 text-pink-500" />
                      <span>Confidencial</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Conselho de Embaixadores Oficiais Showcase */}
      <div className="border-t border-zinc-800/40 pt-7 mt-8 space-y-5 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pink-500 shrink-0" />
              <h4 className="font-display font-black text-sm uppercase tracking-widest text-white">🤝 Nosso Conselho de Embaixadores Oficiais</h4>
            </div>
            <p className="text-zinc-500 text-[10px] font-mono mt-1">
              Colegas embaixadores atuais na rede
            </p>
          </div>
          <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg font-mono uppercase tracking-wider shrink-0">
            {ambassadors.length} Embaixadores Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ambassadors.map((ambassador, idx) => (
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
                    editable={isAdmin}
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
                    setExpandedCardIdx(expandedCardIdx === idx ? null : idx);
                  }}
                  className="w-full mt-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 hover:text-pink-400 text-zinc-400 text-[10px] font-mono uppercase tracking-widest rounded-xl flex items-center justify-center gap-1.5 transition-all border border-zinc-800/80"
                >
                  <span>{expandedCardIdx === idx ? "Ocultar Informações" : "Ver Perfil Completo"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${expandedCardIdx === idx ? "rotate-180 text-pink-400" : ""}`} />
                </button>

                <AnimatePresence>
                  {expandedCardIdx === idx && (
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
                  {editingCityIdx === idx ? (
                    <div className="flex items-center gap-1 bg-zinc-900 px-2 py-1 rounded-xl border border-emerald-500/30">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      <input
                        type="text"
                        className="bg-transparent border-none text-white text-[10px] py-0.5 rounded w-24 focus:outline-none font-mono"
                        value={tempCityText}
                        onChange={(e) => setTempCityText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = tempCityText.trim();
                            const updated = [...ambassadors];
                            updated[idx] = { ...updated[idx], city: val };
                            setAmbassadors(updated);
                            localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                            window.dispatchEvent(new Event("image_updated"));
                            setEditingCityIdx(null);
                            playSuccessSound?.();
                          } else if (e.key === "Escape") {
                            setEditingCityIdx(null);
                          }
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const val = tempCityText.trim();
                          const updated = [...ambassadors];
                          updated[idx] = { ...updated[idx], city: val };
                          setAmbassadors(updated);
                          localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                          window.dispatchEvent(new Event("image_updated"));
                          setEditingCityIdx(null);
                          playSuccessSound?.();
                        }}
                        className="text-emerald-400 hover:text-emerald-300 p-0.5"
                        title="Salvar"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingCityIdx(null)}
                        className="text-rose-400 hover:text-rose-300 p-0.5"
                        title="Cancelar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={() => {
                          playClickSound(600, "sine");
                          setEditingCityIdx(idx);
                          setTempCityText(ambassador.city || "Juiz de Fora");
                        }}
                        className="text-zinc-500 hover:text-emerald-400 transition-colors p-1 flex items-center gap-1.5 group/city cursor-pointer bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/30 rounded-lg px-2 py-0.5"
                        title="Clique para editar a cidade"
                      >
                        <MapPin className="w-3 h-3 text-zinc-400 group-hover:text-emerald-400" />
                        <span className="text-[10px] font-mono text-zinc-400 group-hover:text-emerald-400">
                          {ambassador.city || "Juiz de Fora"}
                        </span>
                        <span className="text-[8px] bg-zinc-850 text-zinc-500 group-hover:text-emerald-400 px-1 py-0.2 rounded font-mono uppercase">
                          Editar
                        </span>
                      </button>
                    )
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
                          const updated = [...ambassadors];
                          updated[idx] = { ...updated[idx], instagram: val.startsWith("@") ? val : "@" + val };
                          setAmbassadors(updated);
                          localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                          window.dispatchEvent(new Event("image_updated"));
                          setEditingInstaIdx(null);
                          playSuccessSound?.();
                        } else if (e.key === "Escape") {
                          setEditingInstaIdx(null);
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        const val = tempInstaText.trim();
                        const updated = [...ambassadors];
                        updated[idx] = { ...updated[idx], instagram: val.startsWith("@") ? val : "@" + val };
                        setAmbassadors(updated);
                        localStorage.setItem("embaixadores_list", JSON.stringify(updated));
                        window.dispatchEvent(new Event("image_updated"));
                        setEditingInstaIdx(null);
                        playSuccessSound?.();
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
                    {isAdmin ? (
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* GALERIA DE FOTOS DOS EVENTOS DE EMBAIXADORES */}
      <div className="pt-8 border-t border-zinc-900/60 mt-8">
        <PhotoGallery mode="embaixadores" />
      </div>

      {/* NEW PRESENTATION & MESSAGE BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-stone-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
            <h3 className="font-display font-black text-sm uppercase flex items-center gap-2"><User className="w-5 h-5 text-pink-400" /> Minha Apresentação</h3>
            <div className="flex items-center gap-4">
                <div 
                  onClick={() => {
                    if (isAdmin) {
                      playClickSound?.(480, "sine");
                      avatarInputRef.current?.click();
                    } else {
                      toast.warning('Apenas o administrador do portal pode alterar a foto oficial.');
                    }
                  }}
                  className={`w-20 h-20 bg-zinc-900 rounded-full border-2 ${isAdmin ? 'border-pink-500/30 cursor-pointer hover:border-pink-500' : 'border-zinc-800'} flex items-center justify-center overflow-hidden group/avatar relative transition-all duration-300 shadow-inner`}
                  title={isAdmin ? "Clique para enviar foto de embaixador" : "Foto oficial bloqueada para edição"}
                >
                  {userCadastro.photoUrl ? (
                    <img 
                      src={userCadastro.photoUrl} 
                      alt={userCadastro.nome} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Upload className="w-7 h-7 text-zinc-550 group-hover/avatar:text-pink-400 group-hover/avatar:scale-110 transition-all duration-300" />
                  )}
                  {/* Subtle hover overlay to invite uploads */}
                  {isAdmin && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-200">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <input 
                  type="file"
                  ref={avatarInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <div>
                  <h4 className="font-black text-lg">{userCadastro.nome || "Embaixador(a)"}</h4>
                  <p className="text-zinc-400 font-mono text-xs">{userCadastro.areaAtuacao || "N/A"}</p>
                  <p className="text-pink-400 font-mono text-xs flex items-center gap-1 mt-1"><Gift className="w-3 h-3" /> {userCadastro.birthday ? new Date(userCadastro.birthday).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : "Data de Aniversário não definida"}</p>
                </div>
            </div>
        </div>
        <MessageBoard sectionKey="embaixadores" />
      </div>

      {/* ATUALIZAR CADASTRO OVERLAY MODAL */}
      {showUpdateCadastroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 relative shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto text-left">
            <button 
              type="button"
              onClick={() => { playClickSound(620, "sine"); setShowUpdateCadastroModal(false); }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition p-2 bg-stone-900 border border-zinc-800 rounded-full"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-1.5 border-b border-zinc-900 pb-3">
              <h3 className="font-display font-black text-lg text-pink-400 uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 animate-pulse" />
                Atualizar Cadastro de Embaixador
              </h3>
              <p className="text-zinc-400 text-xs font-mono">
                Por favor, preencha os dados requisitados abaixo para manter seu credenciamento regional homologado de forma integral.
              </p>
            </div>

            <form onSubmit={handleUpdateCadastroSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Nome Completo</label>
                <input 
                  type="text" 
                  value={cadastroNome} 
                  onChange={(e) => setCadastroNome(e.target.value)} 
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                  required 
                  placeholder="Seu nome completo"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Endereço Completo</label>
                <input 
                  type="text" 
                  value={cadastroEndereco} 
                  onChange={(e) => setCadastroEndereco(e.target.value)} 
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                  required 
                  placeholder="Rua, Número, Bairro, Cidade - UF, CEP"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">WhatsApp</label>
                  <input 
                    type="text" 
                    value={cadastroWhatsapp} 
                    onChange={(e) => setCadastroWhatsapp(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                    required 
                    placeholder="(32) 99999-9999"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">E-mail</label>
                  <input 
                    type="email" 
                    value={cadastroEmail} 
                    onChange={(e) => setCadastroEmail(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                    required 
                    placeholder="seuemail@provedor.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">CPF</label>
                  <input 
                    type="text" 
                    value={cadastroCpf} 
                    onChange={(e) => setCadastroCpf(e.target.value)} 
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
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
                    className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono text-zinc-400 uppercase font-black">Área de Atuação</label>
                <input 
                  type="text" 
                  value={cadastroAreaAtuacao} 
                  onChange={(e) => setCadastroAreaAtuacao(e.target.value)} 
                  className="w-full bg-stone-900 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:border-pink-500 focus:outline-none"
                  required 
                  placeholder="Ex: Consultor de Negócios, Dev, Redator, etc"
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
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-600 hover:opacity-90 text-black font-mono font-black text-xs rounded-xl shadow-lg shadow-pink-500/10 active:scale-95 transition"
                >
                  SALVAR CADASTRO VIP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
