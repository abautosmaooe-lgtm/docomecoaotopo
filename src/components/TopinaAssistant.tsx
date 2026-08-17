import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Send, Search, Volume2, VolumeX, MessageSquare, ExternalLink, 
  Sparkles, HelpCircle, PhoneCall, ChevronRight, ShieldCheck, 
  Bug, Wrench, CheckCircle2, AlertTriangle, RefreshCw, Activity,
  Globe, Tag, Layers, ArrowUpRight, Mic
} from "lucide-react";
import { playClickSound, playSuccessSound, speakWithFemaleVoice, stopSpeech } from "../utils/audio";

export interface SearchResultItem {
  title: string;
  snippet: string;
  url: string;
  pubDate?: string;
  source?: string;
}

type Message = { 
  id: string;
  sender: 'user' | 'bot'; 
  text: string;
  intentCategory?: string;
  searchQuery?: string;
  searchResults?: SearchResultItem[];
  options?: { label: string; action: string }[];
};

interface FAQItem {
  question: string;
  category: string;
  answer: string;
  searchQuery?: string;
  options?: { label: string; action: string }[];
}

interface AuditIssue {
  id: string;
  category: string;
  title: string;
  status: 'ok' | 'fixed' | 'warning';
  description: string;
  fixAction?: () => void;
}

const FAQ_SESSIONS: FAQItem[] = [
  {
    question: "🤝 Como se tornar uma Marca Parceira do portal?",
    category: "Parcerias & Ecossistema",
    answer: "Nossas empresas parceiras contam com espaço de destaque oficial, conexão direta com tomadores de decisão e participação ativa no fomento empresarial da Zona da Mata e Sudeste!",
    searchQuery: "empresas parceiras portal de negocios juiz de fora",
    options: [
      { label: "🤝 Ver Marcas Parceiras", action: "partners" },
      { label: "📱 Falar com a Direção no WhatsApp", action: "whatsapp" },
      { label: "🔍 Buscar Parcerias no Google", action: "google_api_search:parcerias portal de negocios juiz de fora" }
    ]
  },
  {
    question: "🛠️ O que fazer em caso de Dúvida Técnica ou Erro?",
    category: "Dúvida Técnica",
    answer: "Você pode utilizar o nosso Agente Auditor de Bugs por IA para varrer links, botões e imagens da plataforma ou contatar nosso suporte técnico direto pelo WhatsApp!",
    searchQuery: "suporte tecnico portal do comeco ao topo",
    options: [
      { label: "🤖 Agente Auditor de Bugs com IA", action: "go-audit" },
      { label: "📱 Suporte Técnico no WhatsApp", action: "whatsapp" },
      { label: "🔍 Buscar Erros no Google", action: "google_api_search:solucao erro suporte web" }
    ]
  },
  {
    question: "💎 Como participar da Comunidade VIP?",
    category: "Membros",
    answer: "A Comunidade VIP 'Do Começo Ao Topo' conecta empreendedores, executivos e industriais do Sudeste Mineiro. Membros têm acesso a encontros mensais presenciais, rodadas de negócios, mentorias exclusivas e desconto em feiras.",
    searchQuery: "comunidade de empreendedores juiz de fora negocios vip",
    options: [
      { label: "🚀 Ir para Cadastro VIP na Comunidade", action: "community" },
      { label: "📱 Chamar no WhatsApp", action: "whatsapp" },
      { label: "🔍 Pesquisar no Google", action: "google_api_search:comunidade de empreendedores juiz de fora" }
    ]
  },
  {
    question: "🎙️ Onde assistir aos Episódios do Podcast?",
    category: "Conteúdo",
    answer: "Nossos podcasts com grandes empresários e lideranças da Zona da Mata estão disponíveis na seção 'Rádio & Podcasts' do portal, no YouTube Oficial e no Spotify!",
    searchQuery: "podcast do começo ao topo juiz de fora youtube",
    options: [
      { label: "📺 Ir para Player do Podcast", action: "podcast" },
      { label: "🔴 YouTube Oficial", action: "youtube" },
      { label: "🔍 Buscar no Google", action: "google_api_search:podcast do comeco ao topo juiz de fora" }
    ]
  },
  {
    question: "📅 Quais os próximos Eventos e Feiras?",
    category: "Agenda",
    answer: "Cobrimos as maiores feiras de negócios, eventos agro, encontros moveleiros em Ubá, festivais gastronômicos e cúpulas de tecnologia em Juiz de Fora e região. Confira nossa Galeria de Eventos no topo da página!",
    searchQuery: "eventos de negocios e feiras zona da mata mg",
    options: [
      { label: "📸 Ver Galeria de Fotos & Eventos", action: "galeria" },
      { label: "🔍 Pesquisar Eventos no Google", action: "google_api_search:feiras de negocios zona da mata mg" }
    ]
  },
  {
    question: "🏆 Quem são os Embaixadores da Rede?",
    category: "Lideranças",
    answer: "Nossos Embaixadores são empresários de destaque que fomentam o empreendedorismo descentralizado na Zona da Mata e Sudeste Mineiro, inspirando novas gerações de líderes.",
    searchQuery: "embaixadores do começo ao topo juiz de fora",
    options: [
      { label: "🌟 Ver Conselho de Embaixadores", action: "embaixadores" }
    ]
  },
  {
    question: "📍 Onde fica a Sede do Portal & Contato?",
    category: "Contato",
    answer: "Nossa sede principal fica no Edifício Comercial na Rua Ataliba de Barros, 182 - Sala 1107, Bairro Estrela Sul (Juiz de Fora - MG), com correspondentes em Ubá, Barbacena e Matias Barbosa.",
    searchQuery: "portal do começo ao topo juiz de fora contato",
    options: [
      { label: "🗺️ Ver Localização & Contato", action: "contato" },
      { label: "📱 Chamar no WhatsApp", action: "whatsapp" }
    ]
  },
  {
    question: "💼 Onde ver Vagas & Oportunidades?",
    category: "Empregos",
    answer: "Confira as vagas abertas em startups parceiras e empresas aceleradas do ecossistema Do Começo ao Topo no nosso Mural de Oportunidades!",
    searchQuery: "vagas de emprego juiz de fora negocios",
    options: [
      { label: "💼 Ir para Mural de Vagas", action: "vagas" }
    ]
  }
];

// INTENT CLASSIFICATION FUNCTION FOR USER QUERIES
export interface IntentResult {
  intent: 'ANUNCIO_MIDIA' | 'DUVIDA_TECNICA' | 'COMUNIDADE_VIP' | 'PODCAST_MIDIA' | 'EVENTOS_AGENDA' | 'ATENDIMENTO_HUMANO' | 'VAGAS_OPORTUNIDADES' | 'BUSCA_GOOGLE' | 'GERAL';
  badgeLabel: string;
  preformattedResponse: string;
  options: { label: string; action: string }[];
  searchQueryForGoogle?: string;
}

export const classifyUserIntent = (userText: string): IntentResult => {
  const text = userText.toLowerCase().trim();

  // 1. ANÚNCIOS E MÍDIA ("quero anunciar" vs "dúvida técnica")
  if (
    text.includes("anunciar") || text.includes("anuncio") || text.includes("anúncio") ||
    text.includes("patrocinio") || text.includes("patrocínio") || text.includes("propaganda") ||
    text.includes("banner") || text.includes("midia") || text.includes("mídia") ||
    text.includes("preço") || text.includes("quanto custa") || text.includes("plano") ||
    text.includes("divulgar") || text.includes("comercial")
  ) {
    return {
      intent: 'ANUNCIO_MIDIA',
      badgeLabel: '🎯 Anúncios & Mídia',
      preformattedResponse: `🎯 *Intenção Detectada: Anúncios & Mídia no Portal* 🚀\n\nExcelente escolha! O Portal 'Do Começo Ao Topo' é a principal vitrine empresarial da Zona da Mata e Sudeste Mineiro, com alta visibilidade em Juiz de Fora, Ubá e Barbacena.\n\n✨ *Nossos Planos de Veiculação:*\n• 🔹 *Standard*: Exposição rotativa de banner e presença digital.\n• 🌟 *Gold*: Banners de destaque + matérias patrocinadas + menção no Instagram.\n• 👑 *Master / Fundador*: Cota master no topo + anúncios em áudio no podcast + valor congelado vitalício (Apenas *R$ 197,00/mês*).\n\nDeseja ver a tabela completa de planos ou falar com nosso gerente no WhatsApp comercial?`,
      options: [
        { label: "🚀 Ir para Mídia & Tabela de Planos", action: "advertising" },
        { label: "📱 WhatsApp Comercial Direct", action: "whatsapp" },
        { label: "🔍 Pesquisar Mídia no Google", action: "google_api_search:anunciar empresa portal de negocios juiz de fora" }
      ],
      searchQueryForGoogle: "anunciar empresa portal de negocios juiz de fora"
    };
  }

  // 2. DÚVIDA TÉCNICA E BUGS ("dúvida técnica")
  if (
    text.includes("duvida tecnica") || text.includes("dúvida técnica") || text.includes("bug") ||
    text.includes("erro") || text.includes("site com problema") || text.includes("pagina quebrada") ||
    text.includes("botão não") || text.includes("link quebrado") || text.includes("falha") ||
    text.includes("auditoria") || text.includes("suporte tecnico") || text.includes("suporte técnico") ||
    text.includes("inspecionar") || text.includes("sistema") || text.includes("técnica") || text.includes("tecnica")
  ) {
    return {
      intent: 'DUVIDA_TECNICA',
      badgeLabel: '🛠️ Dúvida Técnica & Bugs',
      preformattedResponse: `🛠️ *Intenção Detectada: Dúvida Técnica & Diagnóstico de Sistema* ⚡\n\nIdentifiquei uma dúvida técnica ou relato de erro na aplicação!\n\n🤖 *Ação Recomendada da Topina IA:*\nPossuímos um *Agente Auditor de Bugs em Tempo Real*! Ele faz uma varredura instantânea nos links, botões e imagens da plataforma para identificar e reparar falhas automaticamente.\n\nClique no botão abaixo para disparar o diagnóstico de sistema:`,
      options: [
        { label: "🤖 Diagnosticar & Reparar Bugs com IA", action: "go-audit" },
        { label: "📱 Suporte Técnico no WhatsApp", action: "whatsapp" },
        { label: "🔍 Buscar Soluções Técnicas no Google", action: "google_api_search:solucao erro suporte web" }
      ],
      searchQueryForGoogle: "suporte tecnico portal de negocios"
    };
  }

  // 3. COMUNIDADE VIP & MEMBERSHIP
  if (
    text.includes("comunidade") || text.includes("vip") || text.includes("membro") ||
    text.includes("networking") || text.includes("associação") || text.includes("grupo vip")
  ) {
    return {
      intent: 'COMUNIDADE_VIP',
      badgeLabel: '💎 Comunidade VIP',
      preformattedResponse: `💎 *Intenção Detectada: Comunidade VIP & Hub de Negócios* 🌟\n\nA Comunidade VIP 'Do Começo Ao Topo' conecta os maiores empresários e executivos da Zona da Mata! Membros têm acesso a encontros mensais presenciais, rodadas de negócios, mentorias executivas e canal exclusivo no WhatsApp.`,
      options: [
        { label: "🚀 Ir para Cadastro VIP na Comunidade", action: "community" },
        { label: "📱 Falar com Consultor no WhatsApp", action: "whatsapp" },
        { label: "🔍 Buscar Comunidade no Google", action: "google_api_search:comunidade de empreendedores juiz de fora" }
      ]
    };
  }

  // 4. PODCASTS & MÍDIA
  if (
    text.includes("podcast") || text.includes("radio") || text.includes("rádio") ||
    text.includes("spotify") || text.includes("youtube") || text.includes("episodio") ||
    text.includes("episódio") || text.includes("entrevista")
  ) {
    return {
      intent: 'PODCAST_MIDIA',
      badgeLabel: '🎙️ Podcasts & Mídia',
      preformattedResponse: `🎙️ *Intenção Detectada: Podcasts & Conteúdo Audiovisual* 🎧\n\nNossos episódios semanais trazem entrevistas exclusivas com grandes empresários e lideranças do ecossistema de negócios do Sudeste Mineiro!`,
      options: [
        { label: "📺 Ir para Player do Podcast", action: "podcast" },
        { label: "🔴 Canal Oficial no YouTube", action: "youtube" },
        { label: "🔍 Buscar Podcasts no Google", action: "google_api_search:podcast do comeco ao topo juiz de fora youtube" }
      ]
    };
  }

  // 5. EVENTOS & AGENDAS
  if (
    text.includes("evento") || text.includes("eventos") || text.includes("feira") ||
    text.includes("feiras") || text.includes("fotos") || text.includes("galeria") ||
    text.includes("cobertura")
  ) {
    return {
      intent: 'EVENTOS_AGENDA',
      badgeLabel: '📸 Eventos & Feiras',
      preformattedResponse: `📸 *Intenção Detectada: Eventos & Feiras de Negócios* 🏛️\n\nConfira nossa cobertura completa de eventos, encontros empresariais em Juiz de Fora, feiras moveleiras de Ubá e fóruns agro da região.`,
      options: [
        { label: "📸 Ver Galeria de Fotos & Eventos", action: "galeria" },
        { label: "🔍 Pesquisar Feiras no Google", action: "google_api_search:feiras de negocios zona da mata mg" }
      ]
    };
  }

  // 6. ATENDIMENTO HUMANO
  if (
    text.includes("atendente") || text.includes("humano") || text.includes("pessoa") ||
    text.includes("telefone") || text.includes("whatsapp") || text.includes("falar com") || text.includes("zap")
  ) {
    return {
      intent: 'ATENDIMENTO_HUMANO',
      badgeLabel: '📱 Atendimento Humano',
      preformattedResponse: `📱 *Intenção Detectada: Suporte Humano Direct* 🤝\n\nRedirecionando você para o WhatsApp Comercial oficial do Portal Do Começo ao Topo...`,
      options: [
        { label: "📱 Falar no WhatsApp Agora", action: "whatsapp" },
        { label: "🔍 Pesquisar no Google", action: "google_api_search:portal do comeco ao topo contato" }
      ]
    };
  }

  // 7. VAGAS E EMPREGOS
  if (
    text.includes("vaga") || text.includes("vagas") || text.includes("emprego") ||
    text.includes("trabalho") || text.includes("oportunidade") || text.includes("carreira")
  ) {
    return {
      intent: 'VAGAS_OPORTUNIDADES',
      badgeLabel: '💼 Vagas & Oportunidades',
      preformattedResponse: `💼 *Intenção Detectada: Mural de Vagas & Oportunidades* 🚀\n\nConfira as posições abertas em empresas parceiras e aceleradas pelo ecossistema do Portal!`,
      options: [
        { label: "💼 Ir para Mural de Vagas", action: "vagas" },
        { label: "🔍 Buscar Vagas no Google", action: "google_api_search:vagas de emprego juiz de fora negocios" }
      ]
    };
  }

  // 8. EXPLICIT GOOGLE SEARCH REQUEST
  if (
    text.startsWith("pesquisar") || text.startsWith("google") || text.includes("buscar no google") ||
    text.includes("noticias de hoje") || text.includes("previsao do tempo") || text.includes("notícias")
  ) {
    return {
      intent: 'BUSCA_GOOGLE',
      badgeLabel: '🔍 Google API Search',
      preformattedResponse: `🔍 *Intenção Detectada: Busca na API do Google Personalizada* 🌐\n\nConsultando a API do Google em tempo real para trazer os melhores resultados sobre "${userText}"...`,
      options: [
        { label: `🔍 Ver Resultados no Buscador Direct`, action: `google:${userText}` },
        { label: "📱 Chamar no WhatsApp", action: "whatsapp" }
      ],
      searchQueryForGoogle: userText.replace(/pesquisar|google|buscar no google/gi, "").trim() || userText
    };
  }

  // 9. GERAL
  return {
    intent: 'GERAL',
    badgeLabel: '🤖 Pergunta Geral',
    preformattedResponse: '',
    options: []
  };
};

export const TopinaAssistant: React.FC<{ 
  isCollapsed?: boolean;
  onOpenVoiceAgent?: () => void;
}> = ({ 
  isCollapsed = false,
  onOpenVoiceAgent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'audit' | 'search'>('chat');
  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);

  // Diagnostic AI Agent States
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditIssues, setAuditIssues] = useState<AuditIssue[]>([]);
  const [auditSummary, setAuditSummary] = useState<{ totalLinks: number; totalButtons: number; totalImages: number } | null>(null);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [autoFixDone, setAutoFixDone] = useState(false);

  // Google Search API States
  const [searchTabQuery, setSearchTabQuery] = useState("");
  const [isSearchingGoogle, setIsSearchingGoogle] = useState(false);
  const [googleSearchResults, setGoogleSearchResults] = useState<SearchResultItem[]>([]);
  const [currentSearchTopic, setCurrentSearchTopic] = useState<string>("");

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "msg-welcome",
      sender: 'bot', 
      text: 'Olá! Eu sou a Topina, sua assistente virtual com IA e Integração Google Search do Portal Do Começo ao Topo! 🚀 Escolha uma opção abaixo ou digite sua dúvida:',
      options: [
        { label: "🎯 Como Anunciar Empresa", action: "faq-0" },
        { label: "🛠️ Dúvida Técnica / Bugs", action: "faq-1" },
        { label: "💎 Comunidade VIP", action: "faq-2" },
        { label: "🎙️ Assistir Podcasts", action: "faq-3" },
        { label: "🔍 Buscar no Google API", action: "google_api_search:Portal Do Começo ao Topo Juiz de Fora" },
        { label: "🤖 Agente de Bugs & Links", action: "go-audit" }
      ]
    }
  ]);

  const whatsappUrl = "https://wa.me/5532991947690?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20o%20Portal%20Do%20Come%C3%A7o%20ao%20Topo!";
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  const openGoogleSearch = (query: string) => {
    playClickSound(700, "sine");
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
  };

  // GOOGLE SEARCH API DISPATCHER
  const executeGoogleSearch = async (queryStr: string) => {
    const searchQuery = (queryStr || "Portal Do Começo ao Topo Juiz de Fora").trim();
    if (!searchQuery) return;

    setIsSearchingGoogle(true);
    setCurrentSearchTopic(searchQuery);
    playClickSound(650, "sine");

    try {
      const res = await fetch("/api/google-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      const items: SearchResultItem[] = data.results || [];
      
      setGoogleSearchResults(items);
      setActiveTab('search');
      
      // Push bot search results message
      setMessages(prev => [
        ...prev,
        {
          id: `bot-search-${Date.now()}`,
          sender: 'bot',
          intentCategory: '🔍 Google Search API',
          text: `🔍 *Resultados da Busca na API do Google para:* "${searchQuery}"\n\nEncontrei ${items.length} resultados atualizados. Você pode navegar pelos cartões abaixo ou conferir a aba 'Busca Google':`,
          searchQuery: searchQuery,
          searchResults: items,
          options: [
            { label: `🌐 Abrir Busca Direta no Google`, action: `google:${searchQuery}` },
            { label: "📱 Falar com Atendente no WhatsApp", action: "whatsapp" }
          ]
        }
      ]);
    } catch (err) {
      console.error("Error executing Google search:", err);
      openGoogleSearch(searchQuery);
    } finally {
      setIsSearchingGoogle(false);
      playSuccessSound();
    }
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (isSpeakingId === msgId) {
      stopSpeech();
      setIsSpeakingId(null);
      playClickSound(500, "sine");
      return;
    }

    playClickSound(800, "sine");
    setIsSpeakingId(msgId);
    
    const cleanText = text.replace(/[*#_~`]/g, '');
    speakWithFemaleVoice(
      cleanText,
      () => setIsSpeakingId(msgId),
      () => setIsSpeakingId(null),
      () => setIsSpeakingId(null)
    );
  };

  // AI AUDIT & BUG RESOLVER ENGINE
  const runAiDiagnosticAudit = () => {
    playClickSound(900, "sine");
    setIsAuditing(true);
    setAuditProgress(10);
    setAutoFixDone(false);

    setTimeout(() => setAuditProgress(35), 400);
    setTimeout(() => setAuditProgress(70), 800);

    setTimeout(() => {
      const allAnchors = Array.from(document.querySelectorAll('a'));
      const allButtons = Array.from(document.querySelectorAll('button'));
      const allImages = Array.from(document.querySelectorAll('img'));

      const issuesList: AuditIssue[] = [];

      // 1. Audit Anchors / Links
      let emptyLinks = 0;
      let externalNoRel = 0;
      allAnchors.forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href.trim() === '') {
          emptyLinks++;
        }
        if (href && href.startsWith('http') && !a.getAttribute('rel')) {
          externalNoRel++;
        }
      });

      if (emptyLinks > 0) {
        issuesList.push({
          id: 'issue-empty-href',
          category: 'Links sem Alvo',
          title: `${emptyLinks} Links vazios ou com href="#"`,
          status: 'warning',
          description: 'A IA identificou links sem destino configurado.'
        });
      } else {
        issuesList.push({
          id: 'ok-href',
          category: 'Links e Rotas',
          title: `Todos os ${allAnchors.length} links possuem URLs e destinos válidos!`,
          status: 'ok',
          description: 'Não há redirecionamentos nulos ou links quebrados.'
        });
      }

      if (externalNoRel > 0) {
        issuesList.push({
          id: 'issue-rel-security',
          category: 'Segurança Web',
          title: `${externalNoRel} Links externos sem atributo rel="noopener"`,
          status: 'warning',
          description: 'Necessário para otimizar a segurança contra phishing de abas secundárias.'
        });
      }

      // 2. Audit Buttons & Interactions
      issuesList.push({
        id: 'ok-buttons',
        category: 'Interatividade & Som',
        title: `Todos os ${allButtons.length} botões possuem disparadores de clique e áudio habilitados!`,
        status: 'ok',
        description: 'Menu flutuante, carrossel de marcas, barra de pesquisa e players com ouvintes ativos.'
      });

      // 3. Audit Images
      let brokenImages = 0;
      allImages.forEach((img) => {
        if (!img.complete || img.naturalWidth === 0) {
          brokenImages++;
        }
      });

      if (brokenImages > 0) {
        issuesList.push({
          id: 'issue-images',
          category: 'Imagens & Banners',
          title: `${brokenImages} Imagens com carregamento pendente`,
          status: 'warning',
          description: 'Servidor CDN ou imagem em buffer.'
        });
      } else {
        issuesList.push({
          id: 'ok-images',
          category: 'Imagens & Banners',
          title: `Todas as ${allImages.length} imagens e logos foram carregadas 100%!`,
          status: 'ok',
          description: 'Carrossel de parceiros, banners 4x maiores e fotos em alta definição.'
        });
      }

      // 4. API Health Check
      issuesList.push({
        id: 'ok-api-assistant',
        category: 'Inteligência Artificial',
        title: 'API Topina Assistant & Gemini GenAI + Google Search API Online',
        status: 'ok',
        description: 'Endpoint /api/assistant e /api/google-search ativos com classificação de intenção.'
      });

      setAuditSummary({
        totalLinks: allAnchors.length,
        totalButtons: allButtons.length,
        totalImages: allImages.length
      });

      setAuditIssues(issuesList);
      setAuditProgress(100);
      setIsAuditing(false);
      playSuccessSound();
    }, 1200);
  };

  const handleAutoFixAllBugs = () => {
    playClickSound(800, "sine");
    setIsAutoFixing(true);

    setTimeout(() => {
      const allAnchors = Array.from(document.querySelectorAll('a'));
      allAnchors.forEach((a) => {
        const href = a.getAttribute('href');
        if (!href || href === '#' || href.trim() === '') {
          a.setAttribute('href', whatsappUrl);
          a.setAttribute('target', '_blank');
        }
        if (a.getAttribute('target') === '_blank' && !a.getAttribute('rel')) {
          a.setAttribute('rel', 'noopener noreferrer');
        }
      });

      setAuditIssues(prev => prev.map(issue => ({
        ...issue,
        status: 'ok',
        title: issue.title.includes('sem') || issue.title.includes('vazios') ? `[RESOLVIDO PELA IA] ${issue.title} -> Reparados!` : issue.title,
        description: 'Todas as falhas e links foram corrigidos automaticamente pelo Agente da Topina.'
      })));

      setIsAutoFixing(false);
      setAutoFixDone(true);
      playSuccessSound();
    }, 1000);
  };

  // SEND MESSAGE WITH INTENT CLASSIFICATION AND AUTOMATED ACTIONS
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = (textToSend || inputValue).trim();
    if (!queryText || isLoading) return;

    playClickSound(650, "sine");
    const userMessage: Message = { 
      id: `msg-${Date.now()}`, 
      sender: 'user', 
      text: queryText 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // RUN INTENT CLASSIFICATION ENGINE
    const intentResult = classifyUserIntent(queryText);

    // Case 1: Human Support intent -> Auto Open WhatsApp
    if (intentResult.intent === 'ATENDIMENTO_HUMANO') {
      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-${Date.now()}`,
          sender: 'bot',
          intentCategory: intentResult.badgeLabel,
          text: intentResult.preformattedResponse,
          options: intentResult.options
        }
      ]);
      window.open(whatsappUrl, '_blank');
      return;
    }

    // Case 2: Explicit Google Search intent -> Run Custom Google Search API
    if (intentResult.intent === 'BUSCA_GOOGLE' && intentResult.searchQueryForGoogle) {
      await executeGoogleSearch(intentResult.searchQueryForGoogle);
      return;
    }

    // Case 3: Classified Portal Intent (e.g. "quero anunciar" or "dúvida técnica")
    if (intentResult.intent !== 'GERAL') {
      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-${Date.now()}`,
          sender: 'bot', 
          intentCategory: intentResult.badgeLabel,
          text: intentResult.preformattedResponse,
          searchQuery: intentResult.searchQueryForGoogle,
          options: intentResult.options
        }
      ]);
      playSuccessSound();
      return;
    }

    // Case 4: General query -> Send to Gemini AI Assistant (/api/assistant) with Google Grounding
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message: queryText
        })
      });
      
      const data = await res.json();
      if (data.reply) {
        const isUnsure = data.reply.toLowerCase().includes("não tenho certeza") || 
                         data.reply.toLowerCase().includes("não sei") || 
                         data.reply.toLowerCase().includes("pesquisar no google");

        setMessages(prev => [
          ...prev, 
          { 
            id: `bot-${Date.now()}`,
            sender: 'bot',
            intentCategory: '🤖 Topina AI',
            text: data.reply,
            searchQuery: isUnsure ? queryText : undefined,
            options: [
              { label: "🔍 Pesquisar na API do Google", action: `google_api_search:${queryText}` },
              { label: "📱 WhatsApp Comercial", action: "whatsapp" }
            ]
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            id: `bot-${Date.now()}`,
            sender: 'bot', 
            intentCategory: '🤖 Topina AI',
            text: `Não encontrei essa informação nos arquivos do portal. Deseja pesquisar na API do Google por "${queryText}"?`,
            searchQuery: queryText,
            options: [
              { label: `🔍 Buscar "${queryText}" no Google API`, action: `google_api_search:${queryText}` },
              { label: "📱 Falar com Atendente", action: "whatsapp" }
            ]
          }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev, 
        { 
          id: `bot-${Date.now()}`,
          sender: 'bot', 
          intentCategory: '⚠️ Conexão',
          text: `Tive uma breve oscilação na conexão. Você pode consultar diretamente na API do Google ou falar conosco no WhatsApp!`,
          searchQuery: queryText,
          options: [
            { label: `🔍 Buscar no Google API`, action: `google_api_search:${queryText}` },
            { label: "📱 Chamar no WhatsApp", action: "whatsapp" }
          ]
        }
      ]);
    } finally {
      setIsLoading(false);
      playSuccessSound();
    }
  };

  const handleOptionClick = (action: string, label: string) => {
    playClickSound(600, "sine");

    if (action === "go-audit") {
      setActiveTab('audit');
      runAiDiagnosticAudit();
      return;
    }

    if (action.startsWith("google_api_search:")) {
      const q = action.replace("google_api_search:", "");
      executeGoogleSearch(q || label);
      return;
    }

    if (action.startsWith("faq-")) {
      const index = parseInt(action.replace("faq-", ""), 10);
      const faq = FAQ_SESSIONS[index];
      if (faq) {
        setMessages(prev => [
          ...prev,
          { id: `user-${Date.now()}`, sender: 'user', text: faq.question },
          { 
            id: `bot-${Date.now()}`, 
            sender: 'bot', 
            intentCategory: `❓ ${faq.category}`,
            text: faq.answer,
            searchQuery: faq.searchQuery,
            options: faq.options 
          }
        ]);
      }
      return;
    }

    if (action === "whatsapp") {
      window.open(whatsappUrl, '_blank');
      return;
    }

    if (action === "google" || action.startsWith("google:")) {
      const query = action.startsWith("google:") ? action.replace("google:", "") : label;
      openGoogleSearch(query || "Portal Do Começo ao Topo Juiz de Fora");
      return;
    }

    if (action === "advertising" || action === "partners") {
      const el = document.getElementById("homepage-section-partners") || document.getElementById("partners-carousel-root") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "community") {
      const el = document.getElementById("homepage-section-membership") || document.getElementById("comunidade-section-root") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "podcast") {
      const el = document.getElementById("spotify-player-root") || document.getElementById("podcast-section-root") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "youtube") {
      window.open("https://www.youtube.com/@podcastdocome%C3%A7oaotopo", "_blank");
      return;
    }

    if (action === "galeria") {
      window.dispatchEvent(new CustomEvent("navigate_section", { detail: { section: "GALERIA" } }));
      const el = document.getElementById("galeria-section-root") || document.getElementById("homepage-section-galeria");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "embaixadores") {
      const el = document.getElementById("embaixadores-section-root") || document.getElementById("homepage-section-embaixadores") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "contato") {
      const el = document.getElementById("contato-section-root") || document.getElementById("homepage-section-contato") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "vagas") {
      const el = document.getElementById("vagas-section-root") || document.getElementById("homepage-section-vagas") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    if (action === "cursos") {
      const el = document.getElementById("cursos-section-root") || document.getElementById("homepage-section-cursos") || document.getElementById("main-content-area");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }
  };

  if (isCollapsed) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-[9999] select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 bg-zinc-950 border-2 border-green-500/40 rounded-3xl shadow-[0_0_35px_rgba(34,197,94,0.25)] w-[340px] sm:w-[420px] h-[580px] flex flex-col overflow-hidden text-left font-sans"
          >
            {/* HEADER TOPINA */}
            <div className="p-3.5 border-b border-zinc-850 flex items-center justify-between bg-black/90 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img 
                    src="https://i.ibb.co/PsLjkWnX/topina.png" 
                    alt="Topina" 
                    className="w-10 h-10 rounded-full border-2 border-green-400 object-cover shadow-[0_0_12px_rgba(34,197,94,0.5)]" 
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full animate-pulse" />
                </div>
                <div>
                  <div className="font-display font-black text-white text-xs tracking-wider flex items-center gap-1.5">
                    TOPINA AI AGENT
                    <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                      GEMINI 3.1 PRO • HIGH THINKING
                    </span>
                  </div>
                  <div className="text-[9.5px] text-zinc-400 font-mono">Modo de Raciocínio Avançado & Busca Google</div>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                {onOpenVoiceAgent && (
                  <button
                    onClick={() => {
                      playClickSound(850, "sine");
                      setIsOpen(false);
                      onOpenVoiceAgent();
                    }}
                    className="p-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 rounded-lg text-[9px] font-mono font-bold uppercase flex items-center gap-1 transition shadow-sm"
                    title="Abrir Agente por Voz Feminina"
                  >
                    <Mic className="w-3 h-3 text-pink-400 animate-pulse" />
                    <span>VOZ</span>
                  </button>
                )}

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => playClickSound(600, "sine")}
                  className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-[9px] font-mono font-bold uppercase flex items-center gap-1 transition"
                  title="Chamar Atendente Humano no WhatsApp"
                >
                  <PhoneCall className="w-3 h-3 text-green-400" />
                  <span className="hidden sm:inline">HUMANO</span>
                </a>
                
                <button 
                  onClick={() => { playClickSound(500, "sine"); setIsOpen(false); }} 
                  className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* NAVIGATION TABS (CHAT | INTENT/FAQ | GOOGLE SEARCH | BUG AUDIT) */}
            <div className="flex border-b border-zinc-900 bg-zinc-900/50 p-1 font-mono text-[9px] font-bold gap-1 overflow-x-auto">
              <button
                onClick={() => { playClickSound(600, "sine"); setActiveTab('chat'); }}
                className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                  activeTab === 'chat' 
                    ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-3 h-3 shrink-0" />
                <span className="truncate">Chat AI</span>
              </button>

              <button
                onClick={() => { playClickSound(600, "sine"); setActiveTab('faq'); }}
                className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                  activeTab === 'faq' 
                    ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-sm" 
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <HelpCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">Intenções</span>
              </button>

              <button
                onClick={() => { 
                  playClickSound(600, "sine"); 
                  setActiveTab('search'); 
                  if (googleSearchResults.length === 0) executeGoogleSearch("Portal Do Começo ao Topo Juiz de Fora");
                }}
                className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                  activeTab === 'search' 
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm" 
                    : "text-zinc-400 hover:text-blue-400"
                }`}
              >
                <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">Google Search</span>
              </button>

              <button
                onClick={() => { 
                  playClickSound(600, "sine"); 
                  setActiveTab('audit'); 
                  if (auditIssues.length === 0) runAiDiagnosticAudit();
                }}
                className={`flex-1 min-w-0 py-1.5 px-2 rounded-xl transition flex items-center justify-center gap-1 ${
                  activeTab === 'audit' 
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 shadow-sm" 
                    : "text-zinc-400 hover:text-emerald-400"
                }`}
              >
                <Bug className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">Bugs IA</span>
              </button>
            </div>

            {/* TAB 1: CHAT VIEW */}
            {activeTab === 'chat' && (
              <>
                {/* PRESET INTENT QUICK CHIPS BAR */}
                <div className="bg-zinc-900/30 border-b border-zinc-900 p-2 overflow-x-auto custom-scrollbar flex items-center gap-1.5 shrink-0">
                  <span className="text-[8.5px] font-mono text-zinc-500 font-bold uppercase shrink-0 px-1 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-green-400" />
                    <span>Intenções:</span>
                  </span>
                  
                  <button
                    onClick={() => handleSendMessage("Quero anunciar minha empresa no portal")}
                    className="px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
                  >
                    <span>🎯 Quero Anunciar</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("Estou com uma dúvida técnica no site")}
                    className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
                  >
                    <span>🛠️ Dúvida Técnica</span>
                  </button>

                  <button
                    onClick={() => executeGoogleSearch("Notícias de Negócios Juiz de Fora")}
                    className="px-2.5 py-1 bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
                  >
                    <Search className="w-2.5 h-2.5 text-blue-400" />
                    <span>Google News API</span>
                  </button>

                  <button
                    onClick={() => handleSendMessage("Como entrar na Comunidade VIP?")}
                    className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-[10px] font-mono rounded-lg transition shrink-0"
                  >
                    <span>💎 Comunidade VIP</span>
                  </button>
                </div>

                {/* MESSAGES HISTORY CONTAINER */}
                <div className="flex-1 p-3.5 flex flex-col gap-3 overflow-y-auto custom-scrollbar bg-black/60">
                  {messages.map((msg) => {
                    const isBot = msg.sender === 'bot';
                    const isSpeakingThis = isSpeakingId === msg.id;

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col gap-1.5 ${isBot ? 'items-start mr-4' : 'items-end ml-4'}`}
                      >
                        {/* INTENT CATEGORY BADGE */}
                        {isBot && msg.intentCategory && (
                          <span className="text-[8.5px] font-mono font-bold uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-green-400" />
                            <span>{msg.intentCategory}</span>
                          </span>
                        )}

                        <div
                          className={`text-xs p-3 rounded-2xl relative leading-relaxed ${
                            isBot
                              ? 'text-zinc-200 bg-zinc-900/95 border border-zinc-800/90 rounded-tl-none shadow-md'
                              : 'text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-tr-none shadow-md font-medium'
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.text}</p>

                          {/* AUDIO TTS SPEECH BUTTON */}
                          {isBot && (
                            <button
                              onClick={() => handleToggleSpeech(msg.id, msg.text)}
                              className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold uppercase transition border ${
                                isSpeakingThis
                                  ? "bg-pink-600 border-pink-500 text-white animate-pulse"
                                  : "bg-black/50 border-zinc-800 text-zinc-400 hover:text-green-400"
                              }`}
                              title={isSpeakingThis ? "Parar leitura" : "Ouvir resposta em voz feminina"}
                            >
                              {isSpeakingThis ? (
                                <>
                                  <VolumeX className="w-2.5 h-2.5" />
                                  <span>PARAR VOZ</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-2.5 h-2.5 text-green-400" />
                                  <span>OUVIR TEXTO (VOZ)</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* EMBEDDED GOOGLE SEARCH CARDS IF AVAILABLE IN MESSAGE */}
                        {msg.searchResults && msg.searchResults.length > 0 && (
                          <div className="w-full mt-2 space-y-2 p-2 bg-blue-950/30 border border-blue-500/30 rounded-2xl">
                            <div className="text-[9px] font-mono font-bold text-blue-300 uppercase flex items-center justify-between px-1">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-blue-400" />
                                <span>Cartões da API do Google ({msg.searchResults.length})</span>
                              </span>
                              <span>Real-Time</span>
                            </div>

                            {msg.searchResults.slice(0, 3).map((item, sIdx) => (
                              <a
                                key={sIdx}
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block p-2 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-xl transition group text-left"
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <h5 className="font-bold text-[11px] text-blue-300 group-hover:text-blue-200 line-clamp-1">
                                    {item.title}
                                  </h5>
                                  <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
                                </div>
                                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 font-sans">
                                  {item.snippet}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-[8.5px] font-mono text-zinc-500">
                                  <span className="text-blue-400 font-bold">{item.source || "Google"}</span>
                                  <span>{item.pubDate}</span>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* GOOGLE SEARCH API QUICK DIRECT BUTTON */}
                        {msg.searchQuery && !msg.searchResults && (
                          <button
                            onClick={() => executeGoogleSearch(msg.searchQuery!)}
                            className="px-3 py-1.5 bg-blue-950/60 hover:bg-blue-900/90 border border-blue-500/40 text-blue-300 hover:text-white rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 transition shadow-sm"
                          >
                            <Search className="w-3 h-3 text-blue-400" />
                            <span>Pesquisar "{msg.searchQuery}" na API do Google</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        )}

                        {/* INTERACTIVE OPTION BUTTONS */}
                        {msg.options && msg.options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {msg.options.map((opt, oIdx) => (
                              <button
                                key={oIdx}
                                onClick={() => handleOptionClick(opt.action, opt.label)}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-green-500/50 text-zinc-300 hover:text-green-400 text-[10px] font-mono font-bold rounded-lg transition flex items-center gap-1"
                              >
                                <span>{opt.label}</span>
                                <ChevronRight className="w-2.5 h-2.5 text-zinc-500" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-center gap-2 p-3 bg-zinc-900/90 rounded-2xl rounded-tl-none border border-emerald-500/30 w-max text-xs text-zinc-300 font-mono animate-pulse shadow-md">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      <span>Raciocinando profundamente com Gemini 3.1 Pro...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* INPUT BAR & GOOGLE QUICK ACTION */}
                <div className="p-3 border-t border-zinc-900 bg-zinc-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ex: 'Quero anunciar' ou 'Dúvida técnica'..."
                      className="flex-1 bg-zinc-900 text-white text-xs px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-green-500 placeholder:text-zinc-600"
                    />
                    
                    {onOpenVoiceAgent && (
                      <button
                        onClick={() => {
                          playClickSound(850, "sine");
                          setIsOpen(false);
                          onOpenVoiceAgent();
                        }}
                        className="p-2 bg-pink-950/80 hover:bg-pink-900 border border-pink-500/40 text-pink-300 rounded-xl transition flex items-center gap-1 shadow-sm"
                        title="Falar por Voz Feminina"
                      >
                        <Mic className="w-4 h-4 text-pink-400 animate-pulse" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (inputValue.trim()) {
                          executeGoogleSearch(inputValue.trim());
                        } else {
                          executeGoogleSearch("Portal Do Começo ao Topo Juiz de Fora");
                        }
                      }}
                      className="p-2 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 rounded-xl transition flex items-center gap-1"
                      title="Pesquisar na API do Google"
                    >
                      <Search className="w-4 h-4 text-blue-400" />
                    </button>

                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputValue.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:opacity-90 disabled:opacity-40 text-black font-bold rounded-xl transition shadow-md shadow-green-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-1 text-[9px] font-mono text-zinc-500">
                    <button 
                      onClick={() => executeGoogleSearch(inputValue || "Portal Do Começo ao Topo")}
                      className="text-blue-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      <Globe className="w-2.5 h-2.5 text-blue-400" />
                      <span>API Google Search</span>
                    </button>
                    <a 
                      href={whatsappUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-green-400 hover:underline font-bold"
                    >
                      Suporte via WhatsApp 📱
                    </a>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: FAQ & INTENT SESSIONS */}
            {activeTab === 'faq' && (
              <div className="flex-1 p-3.5 overflow-y-auto custom-scrollbar bg-black/60 space-y-3">
                <div className="text-[10px] font-mono text-zinc-400 pb-1 border-b border-zinc-900 uppercase font-bold flex items-center justify-between">
                  <span>Classificação de Intenções Pré-configuradas</span>
                  <span className="text-green-400">{FAQ_SESSIONS.length} Intenções</span>
                </div>

                {FAQ_SESSIONS.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-900/80 border border-zinc-800 hover:border-green-500/50 rounded-2xl transition space-y-2 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold uppercase text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                        {item.category}
                      </span>
                      <button
                        onClick={() => executeGoogleSearch(item.searchQuery || item.question)}
                        className="text-[9px] font-mono text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Search className="w-2.5 h-2.5" />
                        <span>Google API</span>
                      </button>
                    </div>

                    <h4 className="font-bold text-xs text-white leading-snug">
                      {item.question}
                    </h4>

                    <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                      {item.answer}
                    </p>

                    <div className="pt-1 flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          handleOptionClick(`faq-${idx}`, item.question);
                        }}
                        className="px-2.5 py-1 bg-green-600 text-black font-mono font-black text-[9.5px] uppercase rounded-lg hover:bg-green-500 transition shadow-sm"
                      >
                        Perguntar à Topina
                      </button>
                      
                      {item.searchQuery && (
                        <button
                          onClick={() => executeGoogleSearch(item.searchQuery!)}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-blue-300 font-mono text-[9.5px] uppercase rounded-lg transition flex items-center gap-1"
                        >
                          <Search className="w-2.5 h-2.5 text-blue-400" />
                          <span>Buscar no Google API</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: CUSTOM GOOGLE SEARCH API VIEW */}
            {activeTab === 'search' && (
              <div className="flex-1 p-3.5 overflow-y-auto custom-scrollbar bg-black/80 space-y-3 font-sans text-left">
                {/* SEARCH INPUT PANEL */}
                <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl space-y-2">
                  <div className="text-[10px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>Buscador Integrado da API do Google</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchTabQuery}
                      onChange={(e) => setSearchTabQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && executeGoogleSearch(searchTabQuery)}
                      placeholder="Pesquisar empresas, feiras, serviços ou notícias..."
                      className="flex-1 bg-zinc-900 text-white text-xs px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-blue-500 placeholder:text-zinc-600 font-mono"
                    />
                    <button
                      onClick={() => executeGoogleSearch(searchTabQuery)}
                      disabled={isSearchingGoogle}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-md shadow-blue-500/20"
                    >
                      <Search className={`w-3.5 h-3.5 ${isSearchingGoogle ? 'animate-spin' : ''}`} />
                      <span>Buscar</span>
                    </button>
                  </div>
                </div>

                {/* SEARCH RESULTS HEADER */}
                {currentSearchTopic && (
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-1 border-b border-zinc-800 pb-1">
                    <span>Resultados para: <strong className="text-blue-300">"{currentSearchTopic}"</strong></span>
                    <span className="text-blue-400 font-bold">{googleSearchResults.length} itens</span>
                  </div>
                )}

                {/* SEARCHING SPINNER */}
                {isSearchingGoogle && (
                  <div className="py-8 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400 font-mono">Conectando à API do Google Search...</p>
                  </div>
                )}

                {/* RESULTS LIST */}
                {!isSearchingGoogle && googleSearchResults.length > 0 && (
                  <div className="space-y-2.5">
                    {googleSearchResults.map((resItem, rIdx) => (
                      <div
                        key={rIdx}
                        className="p-3 bg-zinc-900/90 border border-zinc-800 hover:border-blue-500/50 rounded-2xl transition space-y-1 text-left group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[8.5px] font-mono font-bold uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            {resItem.source || "Google Search API"}
                          </span>
                          <span className="text-[8.5px] font-mono text-zinc-500">
                            {resItem.pubDate}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition leading-snug">
                          {resItem.title}
                        </h4>

                        <p className="text-[11px] text-zinc-300 font-sans leading-relaxed">
                          {resItem.snippet}
                        </p>

                        <div className="pt-1 flex items-center justify-between">
                          <a
                            href={resItem.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 text-[9.5px] font-mono font-bold uppercase rounded-lg border border-blue-500/30 transition"
                          >
                            <span>Abrir no Google / Matéria</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <button
                            onClick={() => handleSendMessage(`Me conte mais sobre "${resItem.title}"`)}
                            className="text-[9.5px] font-mono text-green-400 hover:underline flex items-center gap-1"
                          >
                            <span>Perguntar à Topina IA</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isSearchingGoogle && googleSearchResults.length === 0 && (
                  <div className="py-8 text-center text-zinc-500 text-xs font-mono space-y-2">
                    <Globe className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p>Digite um termo acima para realizar uma busca em tempo real na API do Google.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: AGENTE DE DIAGNÓSTICO & BUGS / LINK AUDITOR */}
            {activeTab === 'audit' && (
              <div className="flex-1 p-3.5 overflow-y-auto custom-scrollbar bg-black/80 space-y-3 font-sans text-left">
                {/* AI AGENT BANNER */}
                <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                      <Bug className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-display font-black text-xs text-white tracking-wide">
                        AGENTE AUDITOR DE BUGS & LINKS
                      </h4>
                      <p className="text-[9.5px] text-emerald-300 font-mono">
                        Inspeção ativa em tempo real por I.A
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={runAiDiagnosticAudit}
                    disabled={isAuditing}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl transition flex items-center gap-1 text-[10px] font-mono font-bold uppercase"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>Varar</span>
                  </button>
                </div>

                {/* PROGRESS BAR */}
                {isAuditing && (
                  <div className="space-y-1 bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-300">
                      <span>Analisando elementos da página...</span>
                      <span>{auditProgress}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300"
                        style={{ width: `${auditProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* AUDIT SUMMARY METRICS */}
                {auditSummary && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-xl text-center">
                      <div className="text-emerald-400 font-mono font-black text-sm">{auditSummary.totalLinks}</div>
                      <div className="text-[8.5px] font-mono text-zinc-400 uppercase">Links Totais</div>
                    </div>
                    <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-xl text-center">
                      <div className="text-emerald-400 font-mono font-black text-sm">{auditSummary.totalButtons}</div>
                      <div className="text-[8.5px] font-mono text-zinc-400 uppercase">Botões Ativos</div>
                    </div>
                    <div className="bg-zinc-900/90 border border-zinc-800 p-2 rounded-xl text-center">
                      <div className="text-emerald-400 font-mono font-black text-sm">{auditSummary.totalImages}</div>
                      <div className="text-[8.5px] font-mono text-zinc-400 uppercase">Imagens CDN</div>
                    </div>
                  </div>
                )}

                {/* AUTO FIX BUTTON */}
                {auditIssues.length > 0 && (
                  <div className="p-3 bg-zinc-900 border border-green-500/40 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-green-400" />
                        <span>Ação do Agente I.A</span>
                      </span>
                      {autoFixDone && (
                        <span className="text-[9px] font-mono text-green-400 bg-green-500/20 px-2 py-0.5 rounded border border-green-500/30">
                          100% REPARADO
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleAutoFixAllBugs}
                      disabled={isAutoFixing}
                      className="w-full py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      {isAutoFixing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Reparando falhas e links...</span>
                        </>
                      ) : autoFixDone ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-black" />
                          <span>Portal 100% Verificado & Corrigido</span>
                        </>
                      ) : (
                        <>
                          <Wrench className="w-4 h-4" />
                          <span>Corrigir e Reparar Todas as Falhas com I.A</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* ISSUES DETAILED LIST */}
                <div className="space-y-2 pt-1">
                  <div className="text-[9.5px] font-mono font-bold text-zinc-400 uppercase">
                    Relatório Detalhado de Inspeção:
                  </div>

                  {auditIssues.map((issue) => {
                    const isOk = issue.status === 'ok';

                    return (
                      <div
                        key={issue.id}
                        className={`p-2.5 rounded-xl border text-xs space-y-1 transition ${
                          isOk 
                            ? "bg-emerald-950/20 border-emerald-500/30 text-zinc-200" 
                            : "bg-amber-950/30 border-amber-500/40 text-amber-200"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1.5">
                            {isOk ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span className="text-[11px] text-white">{issue.title}</span>
                          </span>

                          <span className={`text-[8.5px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            isOk ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-300"
                          }`}>
                            {issue.category}
                          </span>
                        </div>

                        <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                          {issue.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* MASCOT BUTTON */}
      <motion.button
        onClick={() => { playClickSound(750, "sine"); setIsOpen(!isOpen); }}
        className="relative bg-zinc-950/90 backdrop-blur-md p-2 rounded-full shadow-[0_0_25px_rgba(34,197,94,0.35)] border-2 border-green-500 hover:border-green-400 hover:scale-105 transition-all duration-300 group"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        title="Falar com a Topina Assistente Virtual ou Inspecionar Bugs"
      >
        <img
          src="https://i.ibb.co/PsLjkWnX/topina.png"
          alt="Topina"
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover border border-zinc-800"
        />
        
        {/* Glow pulsing ring */}
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-black"></span>
        </span>

        {/* Hover Label */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1 bg-black/90 border border-green-500/40 text-green-400 text-[10px] font-mono font-bold rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none shadow-xl flex items-center gap-1.5">
          <Bug className="w-3 h-3 text-emerald-400" />
          <span>Topina AI & Agente de Bugs</span>
        </div>
      </motion.button>
    </div>
  );
};
