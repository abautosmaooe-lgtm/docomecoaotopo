import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Instagram, 
  Heart, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Play, 
  Bookmark, 
  Film, 
  Grid, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  ArrowUpRight, 
  ChevronRight, 
  X, 
  Volume2, 
  VolumeX,
  Plus
} from "lucide-react";
import { playClickSound } from "../utils/audio";

interface InstagramPost {
  id: string;
  type: "image" | "carousel" | "video";
  imageUrl: string;
  caption: string;
  likes: number;
  commentsCount: number;
  timestamp: string;
  instagramUrl: string;
  tags?: string[];
  location?: string;
  author?: string;
  isPinned?: boolean;
}

interface HighlightStory {
  id: string;
  title: string;
  iconText: string;
  color: string;
  coverImage: string;
  storyItems: {
    title: string;
    description: string;
    date: string;
  }[];
}

interface InstagramFeedSectionProps {
  isDarkMode?: boolean;
  isAdmin?: boolean;
}

const DEFAULT_HIGHLIGHTS: HighlightStory[] = [
  {
    id: "hl-1",
    title: "Fitdance Pro",
    iconText: "💃",
    color: "from-green-500 to-emerald-700",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Treinos & Performance", description: "Energia, saúde e conexão através da dança e do movimento com os profissionais credenciados.", date: "Destaque 2026" }
    ]
  },
  {
    id: "hl-2",
    title: "EMBAIXADORES",
    iconText: "👑",
    color: "from-amber-400 to-yellow-600",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Conselho de Embaixadores", description: "Líderes que representam a força e a credibilidade do Portal Do Começo ao Topo.", date: "Conselho Consultivo" }
    ]
  },
  {
    id: "hl-3",
    title: "FITDANCE BH",
    iconText: "⚡",
    color: "from-purple-500 to-pink-600",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Edição Minas Gerais", description: "Grandes encontros e workshops corporativos com a rede mineira de influenciadores.", date: "Belo Horizonte" }
    ]
  },
  {
    id: "hl-4",
    title: "VIDEOMAKER",
    iconText: "🎥",
    color: "from-blue-500 to-cyan-600",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Produção Audiovisual", description: "Equipamentos de cinema, captação 4K e edição dinâmica para valorizar cada convidado.", date: "Estúdios de Gravação" }
    ]
  },
  {
    id: "hl-5",
    title: "EVENTO",
    iconText: "🎟️",
    color: "from-rose-500 to-red-600",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Lançamento no Rossi 360", description: "Noite histórica de apresentação oficial do portal de negócios para o mercado regional.", date: "Estrela Sul, JF" }
    ]
  },
  {
    id: "hl-6",
    title: "EPISÓDIOS",
    iconText: "🎙️",
    color: "from-emerald-500 to-teal-700",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Temporada Oficial", description: "Mais de 50 episódios disponíveis no Spotify e YouTube com grandes empresárias e empresários.", date: "Podcast Do Começo ao Topo" }
    ]
  },
  {
    id: "hl-7",
    title: "BASTIDORES",
    iconText: "📸",
    color: "from-indigo-500 to-blue-700",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Making Of", description: "A preparação, café dos convidados e o clima descontraído antes das câmeras ligarem.", date: "Behind the Scenes" }
    ]
  },
  {
    id: "hl-8",
    title: "NETWORKING",
    iconText: "🤝",
    color: "from-green-600 to-lime-600",
    coverImage: "https://i.ibb.co/YTtmYdWC/destaque-regina.png",
    storyItems: [
      { title: "Rodadas de Negócios", description: "Geração real de parcerias, fornecedores e clientes qualificados entre membros.", date: "Comunidade VIP" }
    ]
  }
];

const DEFAULT_POSTS: InstagramPost[] = [
  {
    id: "ig-1",
    type: "carousel",
    imageUrl: "https://i.ibb.co/6Gsw8ph/Whats-App-Image-2026-03-02-at-16-59-18.jpg",
    caption: "Prazer, Regina Simões! 🎙️✨ Apresentadora, mentora e idealizadora do Podcast Do Começo ao Topo. Uma história construída com resiliência, estratégia e um propósito claro: impulsionar negócios e dar voz a quem faz a economia acontecer na nossa região. Arraste para o lado e conheça nossa visão! 🚀\n\n#DoComecoAoTopo #ReginaSimoes #LiderancaFeminina #PodcastDeNegocios #JuizDeFora",
    likes: 482,
    commentsCount: 64,
    timestamp: "Há 2 dias",
    instagramUrl: "https://www.instagram.com/podcastdocomecoaotopo/",
    tags: ["Regina Simões", "Apresentadora", "Propósito", "Mulheres Que Lideram"],
    location: "Estúdio Rossi 360, Juiz de Fora",
    author: "Regina Simões",
    isPinned: true
  },
  {
    id: "ig-2",
    type: "image",
    imageUrl: "https://i.ibb.co/5xMnz46r/Conectando-empreendedoras-oportunidades-e-crescimento-0.png",
    caption: "📅 17 DE AGOSTO | 19H\n🚀 LANÇAMENTO OFICIAL DO PORTAL DE NEGÓCIOS DO COMEÇO AO TOPO!\n\nConectando empreendedoras, gerando oportunidades reais e acelerando o crescimento de toda a Zona da Mata. Local: ROSSI 360 HOME & BUSINESS (Auditório do Office 360 – Estrela Sul, Juiz de Fora).\n\nConfirme sua presença no link da bio e venha brindar este novo marco com a gente! 🥂🍾\n\n#LancamentoOficial #PortalDeNegocios #Rossi360 #NetworkingExecutivo",
    likes: 624,
    commentsCount: 89,
    timestamp: "Há 4 dias",
    instagramUrl: "https://www.instagram.com/podcastdocomecoaotopo/",
    tags: ["Lançamento Oficial", "Rossi 360", "Estrela Sul", "Networking"],
    location: "Rossi 360 Home & Business, JF",
    isPinned: true
  },
  {
    id: "ig-3",
    type: "video",
    imageUrl: "https://i.ibb.co/wrJb0rPL/Whats-App-Image-2026-08-15-at-12-13-51.jpg",
    caption: "👑 EMBAIXADORA OFICIAL @jfsummit26!\n\nCom imenso orgulho anuncio que sou Embaixadora confirmadíssima do maior evento de inovação, negócios e liderança da região! Nos dias 27 e 28 de Agosto, no Terrazzo em Juiz de Fora.\n\nPrepare-se para conteúdos transformadores, estande exclusivo do Podcast e muitas entrevistas ao vivo! Quem vamos encontrar por lá? 👇\n\n#JFSummit26 #Embaixadora #Terrazzo #Inovacao #NegociosMG",
    likes: 812,
    commentsCount: 115,
    timestamp: "Há 5 dias",
    instagramUrl: "https://www.instagram.com/podcastdocomecoaotopo/",
    tags: ["JF Summit", "Embaixadora", "Terrazzo", "Inovação"],
    location: "Terrazzo, Juiz de Fora - MG",
    isPinned: true
  },
  {
    id: "ig-4",
    type: "video",
    imageUrl: "https://i.ibb.co/C3wBdqbJ/Whats-App-Image-2026-08-15-at-12-13-42-1.jpg",
    caption: "🎙️ BASTIDORES DO NOVO EPISÓDIO NO AR!\n\nRecebemos nossos convidados especiais para falar sobre governança corporativa, escala de vendas e expansão de mercado. Dicas de ouro de quem começou do zero e hoje fatura múltiplos dígitos!\n\nOuça o episódio completo no Spotify ou assista em 4K no YouTube. Link direto na bio! 🎧\n\n#Podcast #EntrevistaExclusiva #EmpreendedorismoReal #SpotifyBrasil",
    likes: 531,
    commentsCount: 42,
    timestamp: "Há 1 semana",
    instagramUrl: "https://www.instagram.com/podcastdocomecoaotopo/",
    tags: ["Podcast", "Episódio", "YouTube", "Spotify"],
    location: "Estúdio Do Começo ao Topo"
  },
  {
    id: "ig-5",
    type: "carousel",
    imageUrl: "https://i.ibb.co/bRBQX8Vt/fitdance-1080-x-1440-px.png",
    caption: "🌸 CONEXÕES QUE GERAM RESULTADOS!\n\nMais um encontro memorável com as empresárias e líderes da nossa Comunidade VIP. Troca de experiências práticas, sinergia entre marcas e parcerias consolidadas no café de negócios.\n\nQuer fazer parte dessa mesa seleta? Envie uma mensagem e receba a aplicação para a Comunidade VIP. 💎\n\n#ComunidadeVIP #MulheresDeNegocios #NetworkingFeminino #Conexoes",
    likes: 395,
    commentsCount: 38,
    timestamp: "Há 1 semana",
    instagramUrl: "https://www.instagram.com/podcastdocomecoaotopo/",
    tags: ["Comunidade VIP", "Encontro Executivo", "Parcerias"],
    location: "Juiz de Fora - MG"
  },
  {
    id: "ig-6",
    type: "image",
    imageUrl: "https://i.ibb.co/YF5fF4Nx/Whats-App-Image-2026-08-17-at-15-28-45.jpg",
    caption: "🎬 CÂMERAS, LUZES E PROPÓSITO!\n\nUm vislumbre da nossa equipe técnica e audiovisual cuidando de cada detalhe antes de mais uma gravação histórica. Produção impecável para valorizar a história de cada líder que passa pela nossa bancada. 🌟🎥\n\n#Audiovisual #Producao #Qualidade4K #PodcastBrasil",
    likes: 440,
    commentsCount: 29,
    timestamp: "Há 2 semanas",
    instagramUrl: "https://www.instagram.com/podcastdocomecoaotopo/",
    tags: ["Bastidores", "MakingOf", "Estúdio", "Gravação"],
    location: "Juiz de Fora, Brasil"
  }
];

export default function InstagramFeedSection({
  isDarkMode = true,
  isAdmin = false
}: InstagramFeedSectionProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "tagged">("posts");
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [activeHighlight, setActiveHighlight] = useState<HighlightStory | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    DEFAULT_POSTS.forEach(p => { map[p.id] = p.likes; });
    return map;
  });

  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem("instagram_profile_data");
    return saved ? JSON.parse(saved) : {
      username: "@podcastdocomecoaotopo",
      name: "Podcast Oficial Do Começo ao Topo | Por Regina Simões",
      bio: "🎙️ O portal definitivo de histórias reais, conexões de valor e grandes empresárias e empresários de Juiz de Fora e de todo o Brasil.",
      location: "📍 Juiz de Fora - MG • Sede Rossi 360 Home & Business",
      posts: "120+",
      followers: "15.8k",
      following: "650+",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80"
    };
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(profileData);

  const instagramProfileUrl = "https://www.instagram.com/podcastdocomecoaotopo/";

  const handleSaveProfile = () => {
    setProfileData(editForm);
    localStorage.setItem("instagram_profile_data", JSON.stringify(editForm));
    setIsEditingProfile(false);
    playClickSound(800, "sine");
  };

  const handleToggleLike = (postId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playClickSound(750, "sine");
    const isLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));
    setLikeCounts(prev => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1)
    }));
  };

  const handleOpenInstagram = () => {
    playClickSound(800, "sine");
    window.open(instagramProfileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section id="instagram-feed-section-root" className={`w-full py-10 px-4 md:px-8 transition-colors duration-300 ${isDarkMode ? "bg-black/90 text-white" : "bg-stone-50 text-stone-900"}`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP BRAND HEADER - INSTAGRAM STYLE */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all ${
          isDarkMode 
            ? "bg-gradient-to-br from-zinc-950 via-stone-900 to-black border-zinc-800/80 shadow-pink-950/20" 
            : "bg-white border-stone-200 shadow-stone-200/80"
        }`}>
          {isAdmin && (
            <button
              onClick={() => {
                setEditForm(profileData);
                setIsEditingProfile(true);
              }}
              className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 text-pink-400 border border-zinc-700/50 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors backdrop-blur-md shadow-sm"
              title="Editar Perfil"
            >
              <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
              EDITAR PERFIL
            </button>
          )}
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-600/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
            {/* Instagram Avatar with Gradient Ring */}
            <div className="relative group cursor-pointer shrink-0" onClick={handleOpenInstagram}>
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] shadow-xl hover:scale-105 transition-transform duration-300">
                <div className={`w-full h-full rounded-full p-[2px] ${isDarkMode ? "bg-black" : "bg-white"}`}>
                  <img
                    src={profileData.avatarUrl}
                    alt="Instagram Avatar"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-green-500 border-2 border-black w-6 h-6 rounded-full flex items-center justify-center text-black text-[10px] font-black shadow-md">
                ✓
              </div>
            </div>

            {/* Profile Information & CTAs */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 justify-center md:justify-start">
                  <h3 className="text-xl md:text-2xl font-display font-extrabold tracking-tight">
                    {profileData.username}
                  </h3>
                  <span title="Perfil Oficial Verificado">
                    <CheckCircle2 className="w-5 h-5 text-sky-400 fill-sky-400/20 shrink-0" />
                  </span>
                </div>

                <div className="flex items-center gap-2 justify-center">
                  <button
                    onClick={handleOpenInstagram}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ee2a7b] via-[#e1306c] to-[#c13584] hover:from-[#d6249f] hover:to-[#fd1d1d] text-white font-mono text-xs font-bold shadow-lg shadow-pink-600/30 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Seguir no Instagram</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={instagramProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl border font-mono text-xs transition-colors flex items-center justify-center ${
                      isDarkMode ? "border-zinc-800 hover:bg-zinc-800 text-zinc-300" : "border-stone-200 hover:bg-stone-100 text-stone-700"
                    }`}
                    title="Abrir no app do Instagram"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Bio & Details */}
              <div className="space-y-1.5 max-w-2xl">
                <p className="font-bold text-sm md:text-base text-pink-500 flex items-center gap-1.5 justify-center md:justify-start">
                  <Sparkles className="w-4 h-4" /> {profileData.name}
                </p>
                <p className={`text-xs md:text-sm leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-stone-650"}`}>
                  {profileData.bio}
                </p>
                <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 justify-center md:justify-start font-bold">
                  {profileData.location}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-center md:justify-start gap-6 pt-2 border-t border-zinc-800/60 text-xs font-mono">
                <div>
                  <span className="font-extrabold text-sm text-pink-400">{profileData.posts}</span> <span className={isDarkMode ? "text-zinc-400" : "text-stone-500"}>publicações</span>
                </div>
                <div>
                  <span className="font-extrabold text-sm text-green-400">{profileData.followers}</span> <span className={isDarkMode ? "text-zinc-400" : "text-stone-500"}>seguidores</span>
                </div>
                <div>
                  <span className="font-extrabold text-sm text-blue-400">{profileData.following}</span> <span className={isDarkMode ? "text-zinc-400" : "text-stone-500"}>seguindo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* INSTAGRAM HIGHLIGHTS / DESTAQUES BAR (Match exact user screenshot) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Destaques dos Stories
            </span>
            <span className={`text-[10px] font-mono ${isDarkMode ? "text-zinc-500" : "text-stone-400"}`}>
              Clique para visualizar
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {DEFAULT_HIGHLIGHTS.map((hl) => (
              <button
                key={hl.id}
                onClick={() => {
                  playClickSound(700, "sine");
                  setActiveHighlight(hl);
                }}
                className="flex flex-col items-center gap-2 shrink-0 group focus:outline-none"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-green-500 via-emerald-400 to-lime-400 group-hover:scale-105 transition-transform shadow-md">
                  <div className={`w-full h-full rounded-full p-[2px] flex items-center justify-center overflow-hidden ${isDarkMode ? "bg-stone-950" : "bg-white"}`}>
                    <img
                      src={hl.coverImage}
                      alt={hl.title}
                      className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <span className={`text-[11px] font-mono font-bold tracking-tight max-w-[76px] truncate transition-colors ${
                  isDarkMode ? "text-zinc-300 group-hover:text-green-400" : "text-stone-700 group-hover:text-green-600"
                }`}>
                  {hl.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* FEED TABS - POSTS, REELS, TAGGED */}
        <div className="space-y-6">
          <div className={`flex items-center justify-center border-t border-b ${isDarkMode ? "border-zinc-800" : "border-stone-200"}`}>
            <button
              onClick={() => { playClickSound(600, "sine"); setActiveTab("posts"); }}
              className={`flex items-center gap-2 py-3 px-6 font-mono text-xs font-bold tracking-wider uppercase border-t-2 -mt-[1px] transition-all ${
                activeTab === "posts"
                  ? "border-pink-500 text-pink-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Publicações</span>
            </button>

            <button
              onClick={() => { playClickSound(610, "sine"); setActiveTab("reels"); }}
              className={`flex items-center gap-2 py-3 px-6 font-mono text-xs font-bold tracking-wider uppercase border-t-2 -mt-[1px] transition-all ${
                activeTab === "reels"
                  ? "border-pink-500 text-pink-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Reels & Vídeos</span>
            </button>

            <button
              onClick={() => { playClickSound(620, "sine"); setActiveTab("tagged"); }}
              className={`flex items-center gap-2 py-3 px-6 font-mono text-xs font-bold tracking-wider uppercase border-t-2 -mt-[1px] transition-all ${
                activeTab === "tagged"
                  ? "border-pink-500 text-pink-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Marcados</span>
            </button>
          </div>

          {/* POSTS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {DEFAULT_POSTS.map((post) => {
              const isLiked = likedPosts[post.id];
              const likes = likeCounts[post.id] || post.likes;

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    playClickSound(650, "sine");
                    setSelectedPost(post);
                  }}
                  className={`group relative rounded-2xl overflow-hidden cursor-pointer border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                    isDarkMode 
                      ? "bg-zinc-950 border-zinc-800/80 hover:border-pink-500/50 hover:shadow-pink-950/30" 
                      : "bg-white border-stone-200 hover:border-pink-400 hover:shadow-pink-100"
                  }`}
                >
                  {/* Media Frame (Aspect Square 1:1) */}
                  <div className="relative aspect-square w-full overflow-hidden bg-stone-900">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />

                    {/* Type Badge on Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                      {post.type === "video" && (
                        <div className="p-1.5 rounded-lg bg-black/75 backdrop-blur-sm text-white border border-white/20 shadow-md">
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </div>
                      )}
                      {post.type === "carousel" && (
                        <div className="p-1.5 rounded-lg bg-black/75 backdrop-blur-sm text-white border border-white/20 shadow-md flex items-center gap-1 text-[10px] font-mono font-bold">
                          <span className="text-[11px]">📑</span>
                        </div>
                      )}
                    </div>

                    {/* Pinned Badge if needed */}
                    {post.isPinned && (
                      <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-pink-600/90 text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-md backdrop-blur-sm flex items-center gap-1">
                        📌 Destaque
                      </div>
                    )}

                    {/* Interactive Hover Overlay with Stats */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-300 truncate max-w-[70%]">
                          {post.location || "@podcastdocomecoaotopo"}
                        </span>
                        <div className="p-1.5 rounded-full bg-white/20 hover:bg-pink-600 transition-colors">
                          <Instagram className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                          <Heart className={`w-5 h-5 ${isLiked ? "fill-pink-500 text-pink-500" : "fill-white text-white"}`} />
                          <span>{likes}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold font-mono text-sm">
                          <MessageCircle className="w-5 h-5 fill-white text-white" />
                          <span>{post.commentsCount}</span>
                        </div>
                      </div>

                      <div className="text-[11px] font-mono text-pink-300 truncate font-semibold text-center">
                        Clique para ler a legenda completa
                      </div>
                    </div>
                  </div>

                  {/* Bottom mini preview info */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleLike(post.id, e)}
                          className="hover:scale-125 transition-transform"
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-pink-500 text-pink-500" : isDarkMode ? "text-zinc-400" : "text-stone-600"}`} />
                        </button>
                        <MessageCircle className={`w-4 h-4 ${isDarkMode ? "text-zinc-400" : "text-stone-600"}`} />
                        <Share2 className={`w-4 h-4 ${isDarkMode ? "text-zinc-400" : "text-stone-600"}`} />
                      </div>
                      <span className={`text-[10px] font-mono ${isDarkMode ? "text-zinc-500" : "text-stone-400"}`}>
                        {post.timestamp}
                      </span>
                    </div>

                    <p className={`text-xs line-clamp-2 leading-relaxed ${isDarkMode ? "text-zinc-300" : "text-stone-700"}`}>
                      <span className="font-bold text-pink-500 mr-1.5">@podcastdocomecoaotopo</span>
                      {post.caption}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FULL WIDTH INSTAGRAM CTA FOOTER BANNER */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-xs font-mono font-bold tracking-wider uppercase text-yellow-300">
              <Instagram className="w-3.5 h-3.5" /> Comunidade no Instagram
            </div>
            <h4 className="text-xl md:text-2xl font-display font-black tracking-tight">
              Acompanhe o Podcast Oficial em Tempo Real
            </h4>
            <p className="text-xs md:text-sm text-white/90 font-medium max-w-xl">
              Cortes inéditos, enquetes, avisos de gravação e convidados exclusivos todos os dias no @podcastdocomecoaotopo.
            </p>
          </div>

          <button
            onClick={handleOpenInstagram}
            className="shrink-0 px-8 py-3.5 rounded-2xl bg-white text-stone-950 font-display font-black text-sm uppercase tracking-wider shadow-2xl hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>Acessar Instagram Oficial</span>
            <ArrowUpRight className="w-4 h-4 text-pink-600" />
          </button>
        </div>

      </div>

      {/* FULL POST DETAIL MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border flex flex-col md:flex-row ${
                isDarkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-stone-200 text-stone-900"
              }`}
            >
              {/* Media Half */}
              <div className="md:w-1/2 bg-black flex items-center justify-center relative overflow-hidden min-h-[300px] md:min-h-full">
                <img
                  src={selectedPost.imageUrl}
                  alt={selectedPost.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-pink-400 font-mono text-[10px] font-bold uppercase border border-pink-500/30">
                    Instagram Post
                  </span>
                </div>
              </div>

              {/* Details & Caption Half */}
              <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
                <div className="space-y-4">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
                        <img
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80"
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-full"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs">podcastdocomecoaotopo</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20" />
                        </div>
                        <span className={`text-[10px] font-mono ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
                          {selectedPost.location || "Juiz de Fora - MG"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedPost(null)}
                      className={`p-2 rounded-full transition-colors ${
                        isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-stone-200 text-stone-600"
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Caption & Full Content */}
                  <div className="space-y-3 pr-1">
                    <p className={`text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                      isDarkMode ? "text-zinc-200" : "text-stone-800"
                    }`}>
                      {selectedPost.caption}
                    </p>

                    {selectedPost.tags && selectedPost.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {selectedPost.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono font-bold"
                          >
                            #{t.replace(/\s+/g, "")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer / Actions */}
                <div className="pt-4 mt-4 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleLike(selectedPost.id)}
                        className="flex items-center gap-1.5 text-xs font-mono font-bold hover:scale-110 transition-transform"
                      >
                        <Heart className={`w-5 h-5 ${likedPosts[selectedPost.id] ? "fill-pink-500 text-pink-500" : ""}`} />
                        <span>{likeCounts[selectedPost.id] || selectedPost.likes} curtidas</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
                        <MessageCircle className="w-4 h-4" />
                        <span>{selectedPost.commentsCount}</span>
                      </div>
                    </div>

                    <span className={`text-[10px] font-mono ${isDarkMode ? "text-zinc-500" : "text-stone-400"}`}>
                      {selectedPost.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => window.open(selectedPost.instagramUrl, "_blank")}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-mono text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Abrir no Instagram Oficial</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HIGHLIGHT STORY MODAL */}
      <AnimatePresence>
        {activeHighlight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden bg-stone-950 border border-zinc-800 shadow-2xl text-white relative flex flex-col justify-between h-[520px]"
            >
              {/* Top Progress Bar */}
              <div className="p-4 relative z-20 space-y-3 bg-gradient-to-b from-black/80 to-transparent">
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full p-[1.5px] bg-green-500">
                      <img src={activeHighlight.coverImage} alt="" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs">{activeHighlight.title}</h5>
                      <span className="text-[9px] text-zinc-400 font-mono">Destaques Oficiais</span>
                    </div>
                  </div>
                  <button onClick={() => setActiveHighlight(null)} className="p-1 rounded-full bg-white/10 hover:bg-white/20">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Content View */}
              <div className="flex-1 px-6 flex flex-col justify-center text-center space-y-4 relative z-10">
                <div className="w-20 h-20 rounded-full mx-auto p-1 bg-gradient-to-tr from-green-500 to-lime-400 shadow-2xl shadow-green-500/40 flex items-center justify-center">
                  <span className="text-3xl">{activeHighlight.iconText}</span>
                </div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-tight">
                  {activeHighlight.storyItems[0].title}
                </h3>
                <p className="text-xs text-zinc-300 font-mono leading-relaxed max-w-xs mx-auto">
                  {activeHighlight.storyItems[0].description}
                </p>
                <span className="text-[10px] font-mono text-green-400 font-bold uppercase">
                  {activeHighlight.storyItems[0].date}
                </span>
              </div>

              {/* Story Footer */}
              <div className="p-4 relative z-20 bg-gradient-to-t from-black/90 to-transparent">
                <button
                  onClick={() => {
                    playClickSound(800, "sine");
                    window.open(instagramProfileUrl, "_blank");
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Ver Stories no Instagram</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {isEditingProfile && isAdmin && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-pink-400 font-display font-bold">
                  <Sparkles className="w-5 h-5" />
                  <h3>Editar Perfil do Instagram</h3>
                </div>
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Usuário (@)</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Nome/Título</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Localização</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Publicações</label>
                    <input
                      type="text"
                      value={editForm.posts}
                      onChange={(e) => setEditForm({...editForm, posts: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Seguidores</label>
                    <input
                      type="text"
                      value={editForm.followers}
                      onChange={(e) => setEditForm({...editForm, followers: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1">Seguindo</label>
                    <input
                      type="text"
                      value={editForm.following}
                      onChange={(e) => setEditForm({...editForm, following: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">URL do Avatar</label>
                  <input
                    type="text"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({...editForm, avatarUrl: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/50 flex justify-end gap-3 shrink-0">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-pink-500/20 transition"
                >
                  Salvar Perfil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
