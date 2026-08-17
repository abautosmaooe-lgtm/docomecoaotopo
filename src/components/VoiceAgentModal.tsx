import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic, MicOff, Volume2, VolumeX, Sparkles, X, RotateCcw,
  Settings, MessageSquare, Play, Pause, Compass, Zap, PhoneCall,
  ChevronRight, ExternalLink, HelpCircle, Check, Copy, AlertCircle,
  Sliders, User, Radio, ArrowUpRight
} from "lucide-react";
import { 
  playClickSound, playSuccessSound, playNegativeSound,
  speakWithFemaleVoice, stopSpeech, cleanTextForSpeech,
  getAvailableFemaleVoices, getVoiceDisplayName, isNeuralVoice, isPtBrVoice
} from "../utils/audio";

export interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenDevicePreview?: () => void;
}

interface MessageOption {
  label: string;
  icon?: string;
  action: () => void;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  executedCommand?: string;
  options?: MessageOption[];
}

export default function VoiceAgentModal({
  isOpen,
  onClose,
  onNavigateSection,
  onOpenDevicePreview,
}: VoiceAgentModalProps) {
  // Voice agent states: 'idle' | 'listening' | 'thinking' | 'speaking'
  const [agentState, setAgentState] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [autoListen, setAutoListen] = useState(true); // Continuous conversation loop
  const [showSettings, setShowSettings] = useState(false);
  const [voiceRate, setVoiceRate] = useState(1.0);
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-voice-msg",
      sender: "bot",
      text: "Olá! Eu sou a Topina, sua Conselheira de Negócios oficial por voz no Portal Do Começo ao Topo. Falo com você em português do Brasil (PT-BR) com voz feminina neural. Como posso te orientar hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const whatsappUrl = "https://wa.me/5532991947690?text=Ol%C3%A1%2C%20estou%20falando%20com%20a%20Topina%20por%20voz%20e%20gostaria%20de%20atendimento%20humano!";

  // Load available female voices on mount
  useEffect(() => {
    isMountedRef.current = true;
    const updateVoices = () => {
      const femaleVoices = getAvailableFemaleVoices();
      setAvailableVoices(femaleVoices);
      if (femaleVoices.length > 0 && !selectedVoiceName) {
        setSelectedVoiceName(femaleVoices[0].name);
      }
    };

    updateVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      isMountedRef.current = false;
      stopSpeech();
      stopListening();
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    };
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, agentState]);

  // Initial welcome speech on open if requested
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      playClickSound(700, "sine");
      // Auto start listening shortly after opening if idle
      const timer = setTimeout(() => {
        if (agentState === "idle" && autoListen) {
          startListening();
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      stopSpeech();
      stopListening();
      setAgentState("idle");
    }
  }, [isOpen]);

  // Voice recognition handling
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Seu navegador não suporta reconhecimento de voz direto. Use o Chrome ou Edge para a melhor experiência.");
      playNegativeSound();
      setAgentState("idle");
      return;
    }

    // Stop ongoing speech before listening
    stopSpeech();
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      setTranscript("");
      setInterimTranscript("");
      setErrorMessage("");
      playClickSound(800, "sine");

      const rec = new SpeechRecognition();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      rec.continuous = !isMobile;
      rec.interimResults = true;
      rec.lang = "pt-BR";
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        if (!isMountedRef.current) return;
        setAgentState("listening");
        resetSilenceTimer();
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        if (!isMountedRef.current) return;

        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setErrorMessage("Permissão de microfone negada. Permita o microfone no navegador para conversar com a Topina.");
          playNegativeSound();
          setAgentState("idle");
        } else if (e.error === "no-speech") {
          // Soft timeout or no voice
          if (agentState === "listening") {
            setAgentState("idle");
          }
        } else if (e.error !== "aborted") {
          setErrorMessage(`Falha no microfone: ${e.error}`);
          setAgentState("idle");
        }
      };

      rec.onend = () => {
        if (!isMountedRef.current) return;
        // If we stopped listening and didn't transition to thinking/speaking, return to idle
        if (agentState === "listening") {
          setAgentState("idle");
        }
      };

      rec.onresult = (event: any) => {
        resetSilenceTimer();
        let finalStr = "";
        let interimStr = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            interimStr += event.results[i][0].transcript;
          }
        }

        if (interimStr) {
          setInterimTranscript(interimStr);
        }

        if (finalStr.trim()) {
          const userSpoken = finalStr.trim();
          setTranscript(userSpoken);
          setInterimTranscript("");
          stopListening();
          handleProcessUserSpeech(userSpoken);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error("Error starting speech recognition:", err);
      setErrorMessage("Erro ao ligar microfone. Verifique suas permissões.");
      setAgentState("idle");
      playNegativeSound();
    }
  };

  const stopListening = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = setTimeout(() => {
      if (agentState === "listening") {
        stopListening();
        setAgentState("idle");
      }
    }, 9000); // 9 seconds silence limit
  };

  // Voice Command Intent Analyzer & Direct Actions with Full Keyword Mapping & Direct Redirections
  const analyzeVoiceCommand = (rawText: string): { 
    isNavCommand: boolean; 
    replyText: string; 
    commandName?: string; 
    action?: () => void;
    options?: MessageOption[];
  } => {
    // Normalize string: lowercase, remove accents for robust phonetic and speech matching
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const text = normalize(rawText);

    // 1. WhatsApp / Falar com Atendente / Suporte Humano
    if (
      text.includes("whatsapp") || text.includes("zap") || text.includes("atendente") ||
      text.includes("humano") || text.includes("falar com atendente") || text.includes("falar com uma pessoa") ||
      text.includes("falar com alguem") || text.includes("suporte humano") || text.includes("redacao") ||
      text.includes("central de atendimento") || text.includes("telefone") || text.includes("ligar")
    ) {
      return {
        isNavCommand: true,
        commandName: "Abrir WhatsApp Oficial (Atendimento Humano)",
        replyText: "Redirecionando você para o WhatsApp oficial e atendimento humano do Portal Do Começo ao Topo! Um atendente da nossa equipe está pronto para conversar.",
        action: () => {
          window.open(whatsappUrl, "_blank");
        },
        options: [
          { label: "📱 Falar no WhatsApp Oficial", action: () => window.open(whatsappUrl, "_blank") }
        ]
      };
    }

    // 2. Quem Somos / Sobre o Portal / Nossa História
    if (
      text.includes("quem somos") || text.includes("sobre") || text.includes("historia") ||
      text.includes("sobre o portal") || text.includes("quem e a topina") || text.includes("conhecer o portal") ||
      text.includes("institucional") || text.includes("quem faz")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Quem Somos",
        replyText: "Redirecionando para a seção 'Quem Somos'! Conheça a história, propósito e a equipe que constrói o maior portal de negócios da Zona da Mata.",
        action: () => {
          const el = document.getElementById("quem-somos-section-root") || document.getElementById("homepage-section-quem-somos") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("QUEM SOMOS");
        },
        options: [
          { label: "🏢 Ver Quem Somos", action: () => onNavigateSection?.("QUEM SOMOS") },
          { label: "📱 Falar no WhatsApp", action: () => window.open(whatsappUrl, "_blank") }
        ]
      };
    }

    // 3. Quero Anunciar / Planos de Anúncio / Patrocínio / Mídia Kit
    if (
      text.includes("anunciar") || text.includes("anuncio") || text.includes("quero anunciar") ||
      text.includes("como anunciar") || text.includes("patrocinar") || text.includes("patrocinio") ||
      text.includes("midia") || text.includes("comercial") || text.includes("quanto custa anunciar") ||
      text.includes("tabela de precos") || text.includes("banner") || text.includes("propaganda") ||
      text.includes("publicidade") || text.includes("divulgar minha empresa")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Quero Anunciar & Planos de Mídia",
        replyText: "Redirecionando para a página 'Quero Anunciar'! Nossos planos de mídia e banners começam a partir de R$ 197 por mês para dar máxima visibilidade à sua empresa.",
        action: () => {
          const el = document.getElementById("homepage-section-advertising") || document.getElementById("portal-advertising-root") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("ANUNCIOS");
        },
        options: [
          { label: "🎯 Ver Planos de Anúncio", action: () => onNavigateSection?.("ANUNCIOS") },
          { label: "💬 WhatsApp Comercial", action: () => window.open(whatsappUrl, "_blank") }
        ]
      };
    }

    // 4. Comunidade VIP / Fazer Parte / Membership / Networking
    if (
      text.includes("comunidade") || text.includes("vip") || text.includes("membro") ||
      text.includes("networking") || text.includes("filiar") || text.includes("fazer parte") ||
      text.includes("quero fazer parte") || text.includes("membership") || text.includes("associacao") ||
      text.includes("grupo de empresarios") || text.includes("clube de negocios") || text.includes("cadastro vip")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Comunidade VIP",
        replyText: "Redirecionando para a Comunidade VIP! Nossos membros participam de encontros empresariais presenciais mensais, rodadas de negócios e mentorias estratégicas.",
        action: () => {
          const el = document.getElementById("homepage-section-membership") || document.getElementById("comunidade-section-root") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("COMUNIDADE");
        },
        options: [
          { label: "💎 Ver Comunidade VIP", action: () => onNavigateSection?.("COMUNIDADE") },
          { label: "🚀 Quero Fazer Parte", action: () => onNavigateSection?.("QUERO FAZER PARTE") }
        ]
      };
    }

    // 5. Embaixadores / Conselho Empresarial
    if (
      text.includes("embaixador") || text.includes("embaixadores") || text.includes("conselho") ||
      text.includes("lideres") || text.includes("conselho consultivo") || text.includes("diretoria")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Embaixadores",
        replyText: "Redirecionando para o Conselho de Embaixadores! Conheça os grandes empresários e líderes visionários que impulsionam o Portal e a região.",
        action: () => {
          const el = document.getElementById("embaixadores-section-root") || document.getElementById("homepage-section-embaixadores") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("EMBAIXADORES");
        },
        options: [
          { label: "👑 Ver Conselho de Embaixadores", action: () => onNavigateSection?.("EMBAIXADORES") }
        ]
      };
    }

    // 6. Contato / Fale Conosco / Onde Estamos / Endereço / Localização
    if (
      text.includes("contato") || text.includes("fale conosco") || text.includes("onde fica") ||
      text.includes("onde estamos") || text.includes("endereco") || text.includes("localizacao") ||
      text.includes("sede") || text.includes("como chegar") || text.includes("mapa")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Contato & Localização",
        replyText: "Redirecionando para Contato e Localização! Nossa sede fica na Rua Ataliba de Barros, 182, Sala 1107, Bairro Estrela Sul, Juiz de Fora - MG.",
        action: () => {
          const el = document.getElementById("contato-section-root") || document.getElementById("homepage-section-contato") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("CONTATO");
        },
        options: [
          { label: "📍 Ver Endereço & Mapa", action: () => onNavigateSection?.("CONTATO") },
          { label: "📱 Falar no WhatsApp", action: () => window.open(whatsappUrl, "_blank") }
        ]
      };
    }

    // 7. Notícias / Manchetes / Feed / Jornalismo de Negócios
    if (
      text.includes("noticia") || text.includes("noticias") || text.includes("manchete") ||
      text.includes("feed") || text.includes("jornal") || text.includes("materia") ||
      text.includes("ultimas noticias") || text.includes("noticias de hoje") || text.includes("economia")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Feed de Notícias",
        replyText: "Redirecionando para o Feed de Notícias e Negócios atualizado de Juiz de Fora e de todo o Sudeste Mineiro!",
        action: () => {
          const el = document.getElementById("main-content-area") || document.getElementById("news-feed-root");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("NOTICIAS");
        },
        options: [
          { label: "📰 Ver Feed de Notícias", action: () => onNavigateSection?.("NOTICIAS") }
        ]
      };
    }

    // 7.5. Instagram Feed / Stories / @podcastdocomecoaotopo
    if (
      text.includes("instagram") || text.includes("insta") || text.includes("stories") ||
      text.includes("feed do insta") || text.includes("publicacoes") || text.includes("reels")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Feed do Instagram",
        replyText: "Redirecionando para o Feed Oficial do Instagram @podcastdocomecoaotopo! Confira cortes, fotos e stories recentes.",
        action: () => {
          const el = document.getElementById("instagram-feed-section-root") || document.getElementById("homepage-section-instagram");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        },
        options: [
          { label: "📸 Ver Feed do Instagram", action: () => {
            const el = document.getElementById("instagram-feed-section-root");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }},
          { label: "📱 Abrir Perfil Oficial", action: () => window.open("https://www.instagram.com/podcastdocomecoaotopo/", "_blank") }
        ]
      };
    }

    // 7.6. Simulador de Telas / Celular / Tablet / Modo Tela
    if (
      text.includes("tela") || text.includes("telas") || text.includes("celular") ||
      text.includes("tablet") || text.includes("dispositivo") || text.includes("dispositivos") ||
      text.includes("simulador") || text.includes("responsivo") || text.includes("smartphone")
    ) {
      return {
        isNavCommand: true,
        commandName: "Abrir Simulador de Telas (Celular/Tablet)",
        replyText: "Abrindo o Simulador de Telas! Aqui você pode testar e apresentar como o portal se adapta em Smartphone e Tablet padrão.",
        action: () => {
          onOpenDevicePreview?.();
        },
        options: [
          { label: "📱 Abrir Simulador de Telas", action: () => onOpenDevicePreview?.() }
        ]
      };
    }

    // 8. Podcasts & Entrevistas / YouTube / Spotify / Player
    if (
      text.includes("podcast") || text.includes("podcasts") || text.includes("episodio") ||
      text.includes("entrevista") || text.includes("spotify") || text.includes("youtube") ||
      text.includes("ouvir podcast") || text.includes("assistir entrevista") || text.includes("audio")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Podcasts & Entrevistas",
        replyText: "Redirecionando para o Player de Podcasts! Aqui você confere bate-papos e entrevistas inspiradoras com referências do mercado.",
        action: () => {
          const el = document.getElementById("spotify-player-root") || document.getElementById("podcast-section-root") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("PODCAST");
        },
        options: [
          { label: "🎙️ Abrir Player de Podcasts", action: () => onNavigateSection?.("PODCAST") }
        ]
      };
    }

    // 9. Galeria / Fotos / Eventos / Coberturas
    if (
      text.includes("galeria") || text.includes("foto") || text.includes("fotos") ||
      text.includes("evento") || text.includes("eventos") || text.includes("feira") ||
      text.includes("feiras") || text.includes("cobertura") || text.includes("album")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Galeria de Fotos & Eventos",
        replyText: "Redirecionando para a Galeria de Fotos e Cobertura dos principais Eventos Empresariais da região!",
        action: () => {
          window.dispatchEvent(new CustomEvent("navigate_section", { detail: { section: "GALERIA" } }));
          const el = document.getElementById("galeria-section-root") || document.getElementById("homepage-section-galeria") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("GALERIA");
        },
        options: [
          { label: "📸 Ver Galeria de Fotos", action: () => onNavigateSection?.("GALERIA") }
        ]
      };
    }

    // 10. Objetivos / Missão / Visão / Valores
    if (
      text.includes("objetivo") || text.includes("objetivos") || text.includes("missao") ||
      text.includes("visao") || text.includes("valores") || text.includes("proposito")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Objetivos & Missão",
        replyText: "Redirecionando para os Objetivos e Diretrizes Estratégicas do Portal Do Começo ao Topo!",
        action: () => {
          const el = document.getElementById("objetivos-section-root") || document.getElementById("homepage-section-objetivos") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("OBJETIVOS");
        },
        options: [
          { label: "🎯 Ver Objetivos", action: () => onNavigateSection?.("OBJETIVOS") }
        ]
      };
    }

    // 11. Parceiros / Marcas Apoiadoras / Empresas Conectadas
    if (
      text.includes("parceiro") || text.includes("parceiros") || text.includes("apoiadores") ||
      text.includes("marcas") || text.includes("empresas parceiras") || text.includes("patrocinadores")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Empresas Parceiras",
        replyText: "Redirecionando para o painel de Empresas Parceiras e apoiadoras do ecossistema Do Começo ao Topo!",
        action: () => {
          const el = document.getElementById("parceiros-section-root") || document.getElementById("homepage-section-parceiros") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("PARCEIROS");
        },
        options: [
          { label: "🤝 Ver Parceiros", action: () => onNavigateSection?.("PARCEIROS") }
        ]
      };
    }

    // 12. Depoimentos / Vozes Femininas / Cases de Sucesso
    if (
      text.includes("depoimento") || text.includes("depoimentos") || text.includes("vozes femininas") ||
      text.includes("cases") || text.includes("historias de sucesso") || text.includes("avaliacao")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Depoimentos & Vozes Femininas",
        replyText: "Redirecionando para Depoimentos e Vozes Femininas! Histórias inspiradoras de empreendedoras e líderes regionais.",
        action: () => {
          const el = document.getElementById("depoimentos-section-root") || document.getElementById("homepage-section-depoimentos") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("DEPOIMENTOS");
        },
        options: [
          { label: "🌸 Ver Depoimentos", action: () => onNavigateSection?.("DEPOIMENTOS") }
        ]
      };
    }

    // 13. Vagas de Emprego / Oportunidades / Trabalhe Conosco
    if (
      text.includes("vaga") || text.includes("vagas") || text.includes("trabalho") ||
      text.includes("emprego") || text.includes("oportunidade") || text.includes("oportunidades") ||
      text.includes("carreira") || text.includes("trabalhe conosco")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Mural de Vagas e Oportunidades",
        replyText: "Redirecionando para o Mural de Vagas e Oportunidades das empresas conveniadas ao portal!",
        action: () => {
          const el = document.getElementById("vagas-section-root") || document.getElementById("homepage-section-vagas") || document.getElementById("main-content-area");
          if (el) el.scrollIntoView({ behavior: "smooth" });
          onNavigateSection?.("VAGAS");
        },
        options: [
          { label: "💼 Ver Vagas & Oportunidades", action: () => onNavigateSection?.("VAGAS") }
        ]
      };
    }

    // 14. Início / Feed Principal / Voltar ao Topo / Home
    if (
      text.includes("inicio") || text.includes("home") || text.includes("pagina inicial") ||
      text.includes("voltar ao topo") || text.includes("recomecar") || text.includes("topo do site")
    ) {
      return {
        isNavCommand: true,
        commandName: "Ir para Página Inicial",
        replyText: "Redirecionando para o Início do portal!",
        action: () => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          onNavigateSection?.("NOTICIAS");
        },
        options: [
          { label: "🏠 Ir para o Início", action: () => { window.scrollTo({ top: 0, behavior: "smooth" }); onNavigateSection?.("NOTICIAS"); } }
        ]
      };
    }

    return { isNavCommand: false, replyText: "" };
  };

  // Main Speech Processor (Command Detection + Gemini AI Assistant)
  const handleProcessUserSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: spokenText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setAgentState("thinking");

    // 2. Check local voice command execution
    const commandResult = analyzeVoiceCommand(spokenText);
    if (commandResult.isNavCommand) {
      playSuccessSound();
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: commandResult.replyText,
        executedCommand: commandResult.commandName,
        options: commandResult.options,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      commandResult.action?.();

      // Speak response in female voice
      speakBotReply(commandResult.replyText);
      return;
    }

    // 3. Query Gemini Backend Assistant (/api/assistant)
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message: spokenText,
        }),
      });

      const data = await res.json();
      const answer = data.reply || "Desculpe, tive uma oscilação na conexão com a inteligência artificial. Poderia repetir?";

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      playSuccessSound();
      speakBotReply(answer);
    } catch (err) {
      console.error("Error communicating with AI assistant:", err);
      const errorReply = "Não consegui consultar o servidor no momento. Mas você pode me perguntar sobre anúncios, comunidade VIP, notícias ou falar no WhatsApp!";
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: errorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      playNegativeSound();
      speakBotReply(errorReply);
    }
  };

  // Female Voice Synthesizer with Continuous Conversation Loop
  const speakBotReply = (textToSpeak: string) => {
    setAgentState("speaking");
    
    speakWithFemaleVoice(
      textToSpeak,
      () => {
        if (isMountedRef.current) {
          setAgentState("speaking");
        }
      },
      () => {
        if (!isMountedRef.current) return;
        setAgentState("idle");
        
        // If continuous auto-listen is active, automatically listen again!
        if (autoListen) {
          setTimeout(() => {
            if (isMountedRef.current && isOpen) {
              startListening();
            }
          }, 600);
        }
      },
      () => {
        if (isMountedRef.current) {
          setAgentState("idle");
        }
      },
      {
        rate: voiceRate,
        pitch: voicePitch,
        voiceName: selectedVoiceName,
      }
    );
  };

  const handleManualReplay = (text: string) => {
    playClickSound(800, "sine");
    stopSpeech();
    stopListening();
    speakBotReply(text);
  };

  const handleToggleListeningBtn = () => {
    if (agentState === "listening") {
      stopListening();
      setAgentState("idle");
      playClickSound(500, "sine");
    } else if (agentState === "speaking") {
      stopSpeech();
      setAgentState("idle");
      playClickSound(500, "sine");
    } else {
      startListening();
    }
  };

  const handleCopyText = (msgId: string, text: string) => {
    playClickSound(700, "sine");
    navigator.clipboard.writeText(cleanTextForSpeech(text));
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const testFemaleVoice = () => {
    playClickSound(900, "sine");
    speakWithFemaleVoice(
      "Olá! Esta é a minha voz feminina personalizada. Estou pronta para atender você no Portal Do Começo ao Topo.",
      undefined,
      undefined,
      undefined,
      { rate: voiceRate, pitch: voicePitch, voiceName: selectedVoiceName }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 25 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl h-[92vh] max-h-[760px] bg-zinc-950 border-2 border-green-500/40 rounded-3xl shadow-[0_0_50px_rgba(34,197,94,0.3)] flex flex-col overflow-hidden text-left font-sans relative"
      >
        {/* TOP HEADER BAR */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://i.ibb.co/PsLjkWnX/topina.png"
                alt="Topina"
                className="w-12 h-12 rounded-full border-2 border-green-400 object-cover shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${
                  agentState === "listening"
                    ? "bg-red-500 animate-ping"
                    : agentState === "speaking"
                    ? "bg-pink-500 animate-pulse"
                    : agentState === "thinking"
                    ? "bg-amber-400 animate-bounce"
                    : "bg-green-500"
                }`}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-black text-white text-base tracking-wider flex items-center gap-1.5">
                  TOPINA • AGENTE POR VOZ
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  🇧🇷 IDIOMA PT-BR
                </span>
                <span className="bg-pink-500/20 text-pink-300 border border-pink-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                  VOZ FEMININA NEURAL
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                {agentState === "listening" && "🎙️ Ouvindo você em português (PT-BR)... Pode falar!"}
                {agentState === "thinking" && "⚡ Raciocinando com Gemini 3.1 Pro (High Thinking)..."}
                {agentState === "speaking" && "🔊 Topina falando em português com voz feminina neural..."}
                {agentState === "idle" && "✨ Agente por voz pronta para conversar em português."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playClickSound(600, "sine");
                setShowSettings(!showSettings);
              }}
              className={`p-2 rounded-xl border transition ${
                showSettings
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
              }`}
              title="Configurações de Voz Neural PT-BR"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playClickSound(500, "sine");
                stopSpeech();
                stopListening();
                onClose();
              }}
              className="p-2 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition"
              title="Fechar Agente"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SETTINGS DRAWER OVERLAY */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-zinc-800 bg-zinc-900/95 p-4 z-20 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-green-400 uppercase">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustes da Voz Feminina Neural (PT-BR)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound(800, "sine");
                      setVoiceRate(1.0);
                      setVoicePitch(1.0);
                    }}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[10px] font-mono uppercase transition border border-zinc-700"
                    title="Redefinir para padrão Neural Natural"
                  >
                    Padrão Neural
                  </button>
                  <button
                    onClick={testFemaleVoice}
                    className="px-3 py-1 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-[10px] font-mono font-bold uppercase transition flex items-center gap-1 shadow-sm"
                  >
                    <Volume2 className="w-3 h-3" />
                    Testar Voz Neural
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="mb-3 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono text-zinc-500">Perfis Rápidos:</span>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(750, "sine");
                    setVoiceRate(1.0);
                    setVoicePitch(1.0);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition border ${
                    voicePitch === 1.0 && voiceRate === 1.0
                      ? "bg-green-500/20 text-green-300 border-green-500/40"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  ⚡ Neural Natural (1.0x / Tom 1.0)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(750, "sine");
                    setVoiceRate(0.95);
                    setVoicePitch(1.08);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition border ${
                    voicePitch === 1.08 && voiceRate === 0.95
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  🌸 Acolhedora Suave (0.95x / Tom 1.08)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(750, "sine");
                    setVoiceRate(1.1);
                    setVoicePitch(1.02);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition border ${
                    voicePitch === 1.02 && voiceRate === 1.1
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  🚀 Dinâmica Executiva (1.1x / Tom 1.02)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Voice Selection */}
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Voz Feminina (PT-BR):</label>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => setSelectedVoiceName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-lg p-1.5 text-xs text-white focus:border-green-500 outline-none font-mono"
                  >
                    {availableVoices.length > 0 ? (
                      availableVoices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {getVoiceDisplayName(v)}
                        </option>
                      ))
                    ) : (
                      <option value="">Voz Feminina Neural (pt-BR Padrão)</option>
                    )}
                  </select>
                </div>

                {/* Speed Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span>Velocidade de Fala:</span>
                    <span className="text-white font-bold">{voiceRate.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.3"
                    step="0.05"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                    className="w-full accent-green-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

                {/* Pitch Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono text-zinc-400 mb-1">
                    <span>Tom da Voz (Agudo/Grave):</span>
                    <span className="text-white font-bold">{voicePitch.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.02"
                    value={voicePitch}
                    onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                    className="w-full accent-pink-500 bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* Auto-listen toggle */}
              <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-xs text-zinc-200 font-medium">Conversação Contínua (Hands-Free em PT-BR):</span>
                </div>
                <button
                  onClick={() => {
                    playClickSound(600, "sine");
                    setAutoListen(!autoListen);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase transition border ${
                    autoListen
                      ? "bg-green-500/20 border-green-500/40 text-green-400"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}
                >
                  {autoListen ? "Ativado (Automático)" : "Desativado (Manual)"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO INTERACTIVE VOICE ORB & VISUALIZER */}
        <div className="p-5 bg-gradient-to-b from-zinc-900/60 to-black/90 border-b border-zinc-800/80 flex flex-col items-center justify-center relative overflow-hidden shrink-0">
          {/* Ambient Glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Central Interactive Sound Orb */}
          <div className="relative cursor-pointer" onClick={handleToggleListeningBtn}>
            {/* Animated Pulse Rings */}
            {agentState === "listening" && (
              <>
                <div className="absolute -inset-4 rounded-full bg-red-500/30 animate-ping pointer-events-none" />
                <div className="absolute -inset-8 rounded-full bg-red-500/15 animate-pulse pointer-events-none" />
              </>
            )}
            {agentState === "speaking" && (
              <>
                <div className="absolute -inset-4 rounded-full bg-pink-500/30 animate-pulse pointer-events-none" />
                <div className="absolute -inset-8 rounded-full bg-green-500/15 animate-ping pointer-events-none" />
              </>
            )}
            {agentState === "thinking" && (
              <div className="absolute -inset-4 rounded-full bg-amber-400/25 animate-spin pointer-events-none" />
            )}

            {/* Avatar Circle */}
            <div className={`w-24 h-24 rounded-full p-1 border-4 transition-all duration-300 relative z-10 shadow-2xl ${
              agentState === "listening"
                ? "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-105"
                : agentState === "speaking"
                ? "border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.6)] scale-105"
                : agentState === "thinking"
                ? "border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse"
                : "border-green-500 hover:border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
            }`}>
              <img
                src="https://i.ibb.co/PsLjkWnX/topina.png"
                alt="Topina"
                className="w-full h-full rounded-full object-cover"
              />
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/20 hover:bg-black/40 transition">
                {agentState === "listening" && <Mic className="w-8 h-8 text-white drop-shadow-md animate-pulse" />}
                {agentState === "speaking" && <Volume2 className="w-8 h-8 text-pink-300 drop-shadow-md animate-bounce" />}
                {agentState === "thinking" && <Sparkles className="w-8 h-8 text-amber-300 drop-shadow-md animate-spin" />}
                {agentState === "idle" && <Mic className="w-8 h-8 text-white/90 drop-shadow-md" />}
              </div>
            </div>
          </div>

          {/* Sound Wave Frequency Bars */}
          <div className="flex items-center gap-1.5 h-8 my-3">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-1 rounded-full ${
                  agentState === "listening"
                    ? "bg-red-500"
                    : agentState === "speaking"
                    ? "bg-pink-500"
                    : agentState === "thinking"
                    ? "bg-amber-400"
                    : "bg-zinc-700"
                }`}
                animate={{
                  height:
                    agentState === "listening"
                      ? [8, 30, 14, 26, 10][i % 5]
                      : agentState === "speaking"
                      ? [10, 28, 16, 32, 12][i % 5]
                      : agentState === "thinking"
                      ? [12, 18, 12, 22, 14][i % 5]
                      : 6,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5 + (i % 4) * 0.1,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>

          {/* Realtime Spoken Transcript or Status Text */}
          <div className="text-center max-w-lg px-2 min-h-[36px] flex items-center justify-center">
            {interimTranscript ? (
              <p className="text-sm font-medium text-green-300 italic font-mono animate-pulse">
                "{interimTranscript}..."
              </p>
            ) : transcript && agentState === "thinking" ? (
              <p className="text-sm font-medium text-white italic">
                "{transcript}"
              </p>
            ) : agentState === "listening" ? (
              <p className="text-xs font-mono text-zinc-400 animate-pulse">
                🎙️ Estou ouvindo... Fale sua pergunta ou comando agora.
              </p>
            ) : agentState === "speaking" ? (
              <p className="text-xs font-mono text-pink-400">
                🔊 Topina falando... Clique no avatar para interromper.
              </p>
            ) : agentState === "thinking" ? (
              <p className="text-xs font-mono text-amber-300">
                ⚡ Processando resposta com inteligência artificial...
              </p>
            ) : (
              <p className="text-xs text-zinc-400 font-mono">
                Toque no microfone abaixo ou diga: <span className="text-green-400 font-bold">"Quero anunciar"</span> ou <span className="text-pink-400 font-bold">"O que é a Comunidade VIP?"</span>
              </p>
            )}
          </div>

          {/* Main Action Bar */}
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleToggleListeningBtn}
              className={`px-5 py-2.5 rounded-full font-mono text-xs font-bold uppercase transition flex items-center gap-2 shadow-lg ${
                agentState === "listening"
                  ? "bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-500/40"
                  : agentState === "speaking"
                  ? "bg-pink-600 hover:bg-pink-500 text-white shadow-pink-500/40"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/30"
              }`}
            >
              {agentState === "listening" ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>PARAR DE OUVIR</span>
                </>
              ) : agentState === "speaking" ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>PARAR DE FALAR</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 animate-bounce" />
                  <span>FALAR COM TOPINA (VOZ)</span>
                </>
              )}
            </button>

            {agentState === "speaking" && (
              <button
                onClick={() => {
                  stopSpeech();
                  setAgentState("idle");
                }}
                className="p-2.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                title="Pausar áudio"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ERROR NOTIFICATION BAR IF ANY */}
        {errorMessage && (
          <div className="bg-red-950/90 border-b border-red-500/40 px-4 py-2 text-red-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-[10px] font-mono font-bold text-red-300 hover:underline uppercase"
            >
              Fechar
            </button>
          </div>
        )}

        {/* QUICK VOICE TOPIC CHIPS BAR */}
        <div className="bg-zinc-900/40 border-b border-zinc-900 p-2 overflow-x-auto custom-scrollbar flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase shrink-0 px-1">
            Conselheira Topina:
          </span>
          
          <button
            onClick={() => handleProcessUserSpeech("Pode me dar dicas sobre MEI e abertura de CNPJ?")}
            className="px-2.5 py-1 bg-amber-950/50 hover:bg-amber-900/70 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
          >
            <span>📊 Dicas MEI</span>
          </button>

          <button
            onClick={() => handleProcessUserSpeech("Quero estratégias de vendas e prospecção de clientes")}
            className="px-2.5 py-1 bg-green-950/50 hover:bg-green-900/70 border border-green-500/30 text-green-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
          >
            <span>🚀 Vendas & Lucro</span>
          </button>

          <button
            onClick={() => handleProcessUserSpeech("Como melhorar o marketing digital do meu negócio?")}
            className="px-2.5 py-1 bg-pink-950/50 hover:bg-pink-900/70 border border-pink-500/30 text-pink-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
          >
            <span>💡 Marketing Digital</span>
          </button>

          <button
            onClick={() => handleProcessUserSpeech("Por favor, pode retomar o assunto anterior e me dar uma resposta aprofundada?")}
            className="px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-400 text-amber-200 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1 shadow-sm"
          >
            <span>☕ Retomar Assunto</span>
          </button>

          <button
            onClick={() => handleProcessUserSpeech("Quero anunciar minha empresa no portal")}
            className="px-2.5 py-1 bg-blue-950/50 hover:bg-blue-900/70 border border-blue-500/30 text-blue-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
          >
            <span>🎯 Como Anunciar</span>
          </button>

          <button
            onClick={() => handleProcessUserSpeech("Falar com suporte humano no WhatsApp")}
            className="px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold rounded-lg transition shrink-0 flex items-center gap-1"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>📱 WhatsApp Humano</span>
          </button>
        </div>

        {/* CONVERSATION HISTORY BALLOONS */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3.5 bg-black/40">
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            const isCopied = copiedId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col gap-1 ${isBot ? "items-start mr-6" : "items-end ml-6"}`}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 px-1">
                  {isBot ? (
                    <>
                      <Sparkles className="w-2.5 h-2.5 text-pink-400" />
                      <span className="text-pink-400 font-bold">Topina IA</span>
                    </>
                  ) : (
                    <>
                      <User className="w-2.5 h-2.5 text-green-400" />
                      <span className="text-green-400 font-bold">Você (Comando de Voz)</span>
                    </>
                  )}
                  <span>• {msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl relative text-xs leading-relaxed max-w-full ${
                    isBot
                      ? "bg-zinc-900/95 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-md"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-tr-none shadow-md font-medium"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* If command was executed on site */}
                  {msg.executedCommand && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800 flex items-center gap-1.5 text-[10px] font-mono text-green-400">
                      <Zap className="w-3 h-3 text-green-400" />
                      <span>Comando Executado: <strong>{msg.executedCommand}</strong></span>
                    </div>
                  )}

                  {/* Interactive Quick Links / Navigation Buttons if available */}
                  {msg.options && msg.options.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex flex-wrap gap-1.5">
                      {msg.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => {
                            playClickSound(650, "sine");
                            opt.action();
                          }}
                          className="px-2.5 py-1 bg-green-950/60 hover:bg-green-900 border border-green-500/40 hover:border-green-400 text-green-300 hover:text-white rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <span>{opt.label}</span>
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Actions for Bot Messages */}
                  {isBot && (
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleManualReplay(msg.text)}
                        className="px-2.5 py-1 bg-black/60 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 rounded-full text-[9px] font-mono font-bold uppercase transition flex items-center gap-1 hover:text-green-400"
                        title="Ouvir novamente em voz feminina"
                      >
                        <Volume2 className="w-3 h-3 text-pink-400" />
                        <span>Ouvir Voz</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 text-zinc-400 hover:text-white transition"
                        title="Copiar texto"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* FOOTER BAR WITH WHATSAPP LINK & STATUS */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-[10.5px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Voz Feminina Ativa (Português Brasil)</span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => playClickSound(600, "sine")}
            className="text-green-400 hover:underline flex items-center gap-1 font-bold"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
