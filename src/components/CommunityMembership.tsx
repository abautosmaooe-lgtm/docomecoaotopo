import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Sparkles, Send, Users, ShieldCheck, Heart, Volume2, ChevronDown, ChevronUp, Edit3, Save, X, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { toast } from "sonner";
import { saveMatriculaToFirestore } from "../services/userService";

// --- Ripple Button Implementation ---
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const RippleButton = ({ children, className = "", onClick, ...props }: RippleButtonProps) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const newRipple = {
        id: Date.now(),
        x,
        y,
        size
      };
      
      setRipples((prev) => [...prev, newRipple]);
      playClickSound(900, "sine");
    }
    if (onClick) {
      onClick(e);
    }
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden cursor-pointer ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/25 rounded-full pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transform: "scale(0)"
          }}
        />
      ))}
    </button>
  );
};

// --- CheckIcon Component ---
const CheckIcon = ({ className }: { className?: string }) => (
  <Check className={className} />
);

// --- ShaderCanvas for local container background ---
const ShaderCanvas = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glProgramRef = useRef<WebGLProgram | null>(null);
  const glBgColorLocationRef = useRef<WebGLUniformLocation | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const [backgroundColor, setBackgroundColor] = useState(isDarkMode ? [0.03, 0.03, 0.04] : [0.98, 0.98, 0.99]);

  useEffect(() => {
    setBackgroundColor(isDarkMode ? [0.03, 0.03, 0.04] : [0.98, 0.98, 0.99]);
  }, [isDarkMode]);

  useEffect(() => {
    const gl = glRef.current;
    const program = glProgramRef.current;
    const location = glBgColorLocationRef.current;
    if (gl && program && location) {
      gl.useProgram(program);
      gl.uniform3fv(location, new Float32Array(backgroundColor));
    }
  }, [backgroundColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true });
    if (!gl) { console.error("WebGL not supported"); return; }
    glRef.current = gl;

    // Set clear color to transparent
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Enable alpha blending for perfect background transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const vertexShaderSource = `attribute vec2 aPosition; void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;
    const fragmentShaderSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;
      uniform vec3 uBackgroundColor;
      mat2 rotate2d(float angle){ float c=cos(angle),s=sin(angle); return mat2(c,-s,s,c); }
      float variation(vec2 v1,vec2 v2,float strength,float speed){ return sin(dot(normalize(v1),normalize(v2))*strength+iTime*speed)/100.0; }
      vec3 paintCircle(vec2 uv,vec2 center,float rad,float width){
        vec2 diff = center-uv;
        float len = length(diff);
        len += variation(diff,vec2(0.,1.),5.,2.);
        len -= variation(diff,vec2(1.,0.),5.,2.);
        float circle = smoothstep(rad-width,rad,len)-smoothstep(rad,rad+width,len);
        return vec3(circle);
      }
      void main(){
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        uv.x *= 1.5; uv.x -= 0.25;
        float mask = 0.0;
        float radius = .35;
        vec2 center = vec2(.5);
        mask += paintCircle(uv,center,radius,.035).r;
        mask += paintCircle(uv,center,radius-.018,.01).r;
        mask += paintCircle(uv,center,radius+.018,.005).r;
        vec2 v=rotate2d(iTime)*uv;
        vec3 foregroundColor=vec3(v.x,v.y,.7-v.y*v.x);
        // Soften foreground to look ultra premium
        foregroundColor *= 0.22;
        vec3 color=mix(uBackgroundColor,foregroundColor,mask);
        color=mix(color,vec3(1.),paintCircle(uv,center,radius,.003).r * 0.15);
        gl_FragColor=vec4(color,mask * 0.45);
      }`;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader) || "Shader compilation error");
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    glProgramRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iTimeLoc = gl.getUniformLocation(program, "iTime");
    const iResLoc = gl.getUniformLocation(program, "iResolution");
    glBgColorLocationRef.current = gl.getUniformLocation(program, "uBackgroundColor");
    gl.uniform3fv(glBgColorLocationRef.current, new Float32Array(backgroundColor));

    let animationFrameId: number;
    const render = (time: number) => {
      gl.uniform1f(iTimeLoc, time * 0.0006); // subtle slow rotation
      gl.uniform2f(iResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    const handleResize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    };
    
    handleResize();
    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    
    animationFrameId = requestAnimationFrame(render);
    
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full block z-0 opacity-60 dark:opacity-30 pointer-events-none transition-opacity duration-500 rounded-3xl" 
    />
  );
};

// --- Pricing / Membership Card Component ---
export interface PricingCardProps {
  planName: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: "primary" | "secondary";
  hidePrice?: boolean;
  whatsappUrl?: string;
  onSelect: () => void;
}

export const PricingCard = ({
  planName, 
  description, 
  price, 
  period,
  features, 
  buttonText, 
  isPopular = false, 
  buttonVariant = "primary",
  hidePrice = false,
  whatsappUrl = "",
  onSelect
}: PricingCardProps) => {
  const handleButtonClick = () => {
    if (whatsappUrl) {
      playClickSound(900, "sine");
      window.open(whatsappUrl, "_blank");
    } else {
      onSelect();
    }
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      className={`relative backdrop-blur-xl bg-black/40 dark:bg-zinc-950/40 rounded-3xl p-7 flex flex-col transition-all duration-300 border border-zinc-800/80 shadow-xl overflow-hidden w-full ${
        isPopular 
          ? "border-pink-500/50 ring-2 ring-pink-500/20 bg-gradient-to-b from-pink-950/10 to-transparent shadow-pink-950/10 scale-105" 
          : "hover:border-zinc-700"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-b-xl bg-pink-500 text-white shadow-lg">
          🔥 Recomendado
        </div>
      )}

      {/* Glow gradient background for premium card */}
      {isPopular && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="mb-4">
        <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">Categoria</span>
        <h3 className="text-2xl font-black tracking-tight text-white uppercase font-display mt-0.5">{planName}</h3>
        <p className="text-xs text-zinc-400 mt-2 min-h-[32px] leading-relaxed">{description}</p>
      </div>

      {!hidePrice ? (
        <div className="my-5 flex items-baseline gap-1">
          <span className="text-3xl font-black text-white font-display">
            {price.startsWith("R$") ? price : `R$ ${price}`}
          </span>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">{period}</span>
        </div>
      ) : (
        <div className="my-5 flex items-baseline gap-1 min-h-[44px]">
        </div>
      )}

      {/* Decorative divider */}
      <div className="w-full mb-5 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />

      {/* Feature list */}
      <ul className="flex flex-col gap-3 text-xs text-zinc-300 mb-8 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <CheckIcon className="text-green-400 w-4 h-4 shrink-0 mt-0.5" /> 
            <span className="leading-tight">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Interactive CTA Ripple Button */}
      <RippleButton 
        onClick={handleButtonClick}
        className={`w-full py-3.5 rounded-2xl font-mono font-black text-[11px] uppercase tracking-wider transition-all duration-300 ${
          buttonVariant === "primary" 
            ? "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-950/20" 
            : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
        }`}
      >
        <span>{buttonText}</span>
      </RippleButton>
    </motion.div>
  );
};


// --- Main Community Section ---
interface CommunityMembershipProps {
  isDarkMode: boolean;
  isAdmin?: boolean;
}

interface PlanData {
  planName: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: "primary" | "secondary";
  hidePrice?: boolean;
  whatsappUrl?: string;
}

const DEFAULT_PLANS: PlanData[] = [
  {
    planName: "Leitora",
    description: "Gratuito. Ideal para mulheres que desejam acompanhar as notícias e se inspirar diariamente.",
    price: "Grátis",
    period: "vitalício",
    features: [
      "Acesso completo ao portal de notícias",
      "Assinatura da Newsletter semanal do Sudeste de Minas",
      "Acesso aos podcasts exclusivos e transmissões ao vivo",
      "Participação aberta nas enquetes comunitárias"
    ],
    buttonText: "Fazer Inscrição Grátis ➔",
    buttonVariant: "secondary"
  },
  {
    planName: "Comunidade",
    description: "R$ 29,90/mês. Acesso total à comunidade VIP de negócios com networking estratégico diário.",
    price: "R$ 29,90",
    period: "/ mês",
    features: [
      "Grupo VIP Exclusivo no WhatsApp & Telegram",
      "Acesso prioritário às Rodadas de Negócios Regionais",
      "Inserção no Catálogo Digital de Empresas Femininas",
      "Material de apoio, checklists e e-books exclusivos"
    ],
    buttonText: "Quero Fazer Parte 🔥",
    isPopular: true,
    buttonVariant: "primary"
  },
  {
    planName: "Embaixadora",
    description: "R$ 197,00/mês (valor de liderança mantido enquanto permanecer no programa).",
    price: "R$ 197,00",
    period: "/ mês",
    features: [
      "Valor mantido enquanto permanecer no programa",
      "Participação como Convidada Especial no Podcast",
      "Assessoria de Comunicação e Releases de Imprensa",
      "Selo oficial de Embaixadora e Mentoria de Posicionamento"
    ],
    buttonText: "QUERO SER UMA EMBAIXADORA",
    buttonVariant: "primary",
    hidePrice: false,
    whatsappUrl: ""
  }
];

export default function CommunityMembership({ isDarkMode, isAdmin = false }: CommunityMembershipProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [businessSector, setBusinessSector] = useState("");
  const [loading, setLoading] = useState(false);

  // Community States (loaded from database/local storage)
  const [plans, setPlans] = useState<PlanData[]>(DEFAULT_PLANS);
  const [sectionTitle, setSectionTitle] = useState("Quero Fazer Parte da Comunidade Do Começo ao Topo");
  const [sectionSubtitle, setSectionSubtitle] = useState("O primeiro e maior portal de negócios focados na força da mulher no Sudeste de Minas Gerais. Escolha o seu nível de imersão e venha decolar conosco!");
  
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("community_membership_collapsed") === "true";
    }
    return false;
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states for Admin Editor
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editPlans, setEditPlans] = useState<PlanData[]>([]);

  const sanitizePlans = (loadedPlans: PlanData[]): PlanData[] => {
    return loadedPlans.map(plan => {
      const nameLower = (plan.planName || "").toLowerCase();
      if (nameLower.includes("embaixadora")) {
        return {
          ...plan,
          planName: "Embaixadora",
          description: "R$ 197,00/mês (valor de liderança mantido enquanto permanecer no programa).",
          price: "R$ 197,00",
          features: [
            "Valor mantido enquanto permanecer no programa",
            "Participação como Convidada Especial no Podcast",
            "Assessoria de Comunicação e Releases de Imprensa",
            "Selo oficial de Embaixadora e Mentoria de Posicionamento"
          ],
          hidePrice: false,
          buttonText: "QUERO SER UMA EMBAIXADORA",
          whatsappUrl: ""
        };
      } else if (nameLower.includes("empreendedora") || nameLower.includes("comunidade")) {
        return {
          ...plan,
          planName: "Comunidade",
          description: "R$ 29,90/mês. Acesso total à comunidade VIP de negócios com networking estratégico diário.",
          price: "R$ 29,90",
          features: [
            "Grupo VIP Exclusivo no WhatsApp & Telegram",
            "Acesso prioritário às Rodadas de Negócios Regionais",
            "Inserção no Catálogo Digital de Empresas Femininas",
            "Material de apoio, checklists e e-books exclusivos"
          ],
          hidePrice: false,
          buttonText: "Quero Fazer Parte 🔥",
          isPopular: true,
          buttonVariant: "primary" as const,
          whatsappUrl: ""
        };
      } else if (nameLower.includes("leitora")) {
        return {
          ...plan,
          planName: "Leitora",
          description: "Gratuito. Ideal para mulheres que desejam acompanhar as notícias e se inspirar diariamente.",
          price: "Grátis",
          features: [
            "Acesso completo ao portal de notícias",
            "Assinatura da Newsletter semanal do Sudeste de Minas",
            "Acesso aos podcasts exclusivos e transmissões ao vivo",
            "Participação aberta nas enquetes comunitárias"
          ],
          hidePrice: false,
          buttonText: "Fazer Inscrição Grátis ➔",
          buttonVariant: "secondary" as const,
          whatsappUrl: ""
        };
      }
      return {
        ...plan,
        whatsappUrl: "" // Remove WhatsApp URL to force the form on all plans
      };
    });
  };

  // Load from Firestore / local storage on mount
  useEffect(() => {
    let savedPlans = localStorage.getItem("community_membership_plans");
    if (savedPlans && (savedPlans.includes("89") || savedPlans.includes("89,90") || savedPlans.includes("89.90"))) {
      localStorage.removeItem("community_membership_plans");
      savedPlans = null;
    }
    const savedTitle = localStorage.getItem("community_membership_title");
    const savedSubtitle = localStorage.getItem("community_membership_subtitle");
    if (savedPlans) {
      try {
        const parsed = JSON.parse(savedPlans);
        if (Array.isArray(parsed)) {
          setPlans(sanitizePlans(parsed));
        }
      } catch (e) {
        console.error("Error parsing community_membership_plans", e);
      }
    }
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedSubtitle) setSectionSubtitle(savedSubtitle);

    // Fetch from Firestore
    fetch(`/api/published-data?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (Array.isArray(data.community_plans) && data.community_plans.length > 0) {
            const sanitized = sanitizePlans(data.community_plans);
            setPlans(sanitized);
            localStorage.setItem("community_membership_plans", JSON.stringify(sanitized));
          }
          if (data.community_title) {
            setSectionTitle(data.community_title);
            localStorage.setItem("community_membership_title", data.community_title);
          }
          if (data.community_subtitle) {
            setSectionSubtitle(data.community_subtitle);
            localStorage.setItem("community_membership_subtitle", data.community_subtitle);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleCollapse = () => {
    const newState = !isSectionCollapsed;
    setIsSectionCollapsed(newState);
    localStorage.setItem("community_membership_collapsed", String(newState));
    playClickSound(600, "sine");
  };

  const handleOpenEditModal = () => {
    setEditTitle(sectionTitle);
    setEditSubtitle(sectionSubtitle);
    setEditPlans(JSON.parse(JSON.stringify(plans))); // Deep copy
    setIsEditModalOpen(true);
    playClickSound(700, "sine");
  };

  const handleSaveEdits = () => {
    if (!editTitle.trim()) {
      toast.error("O título não pode ficar em branco.");
      return;
    }

    setSectionTitle(editTitle);
    setSectionSubtitle(editSubtitle);
    setPlans(editPlans);

    localStorage.setItem("community_membership_plans", JSON.stringify(editPlans));
    localStorage.setItem("community_membership_title", editTitle);
    localStorage.setItem("community_membership_subtitle", editSubtitle);

    setIsEditModalOpen(false);
    playSuccessSound();
    toast.success("Alterações salvas localmente!");

    // Save to Firestore
    fetch("/api/published-data")
      .then((res) => res.json())
      .then((serverData) => {
        const payload = {
          ...serverData,
          community_plans: editPlans,
          community_title: editTitle,
          community_subtitle: editSubtitle
        };
        return fetch("/api/publish-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          toast.success("Alterações publicadas no servidor com sucesso!");
        } else {
          toast.error("Erro ao sincronizar com o banco de dados.");
        }
      })
      .catch((err) => {
        console.error("Error publishing community changes:", err);
        toast.error("Erro ao sincronizar com o banco de dados.");
      });
  };

  const handleSelectPlan = (planName: string) => {
    setSelectedPlan(planName);
    playClickSound(850, "sine");
  };

  const handleSubmitInscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactWhatsApp.trim()) {
      toast.error("Por favor, preencha seu nome e WhatsApp.");
      return;
    }

    setLoading(true);
    playSuccessSound();

    try {
      // 1. Direct Firestore write to 'matriculas' collection
      await saveMatriculaToFirestore({
        plan: selectedPlan,
        name: contactName,
        whatsapp: contactWhatsApp,
        sector: businessSector
      });

      // 2. Also send to API endpoint for redundancy
      await fetch("/api/community-enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          name: contactName,
          whatsapp: contactWhatsApp,
          sector: businessSector
        })
      }).catch(err => console.warn("API enrollment sync non-blocking:", err));
      
      setLoading(false);
      toast.success("Matrícula e Cadastro enviados com sucesso ao Firestore e Diretoria!");
      
      const message = `Olá, gostaria de fazer parte da Comunidade do Começo ao Topo como *${selectedPlan}*! Meu nome é ${contactName} e atuo no segmento de ${businessSector || 'Empreendedorismo'}.`;
      const encodedMsg = encodeURIComponent(message);
      window.open(`https://wa.me/5532991947690?text=${encodedMsg}`, "_blank");
      
      setSelectedPlan(null);
      setContactName("");
      setContactWhatsApp("");
      setBusinessSector("");
    } catch (e) {
      console.error(e);
      setLoading(false);
      toast.error("Erro ao enviar cadastro.");
    }
  };

  return (
    <section id="community-join-section" className="relative max-w-7xl mx-auto px-4 py-16 select-none overflow-hidden bg-transparent">
      
      {/* Section Content inside transparent bento box */}
      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center space-y-10">
        
        {/* Title & Badge */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 animate-pulse text-green-400" />
            <span>OPORTUNIDADE DE NEGÓCIOS</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
            {sectionTitle.split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < sectionTitle.split("\n").length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            {sectionSubtitle}
          </p>
        </div>

        {/* Admin Panel Actions */}
        {isAdmin && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer select-none border border-pink-500/30"
            >
              <Edit3 className="w-3.5 h-3.5 animate-bounce" />
              <span>Editar Planos e Textos (Admin)</span>
            </button>
          </div>
        )}

        {/* Collapse / Expand Toggle Button - requested! */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleCollapse}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900 hover:border-pink-500/50 text-xs font-mono font-black uppercase tracking-wider text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shadow-lg select-none"
          >
            {isSectionCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 text-green-400 animate-bounce" />
                <span>Mostrar Planos e Benefícios</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4 text-pink-400" />
                <span>Recolher Planos</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Pricing Cards Grid */}
        <AnimatePresence mode="wait">
          {!isSectionCollapsed && (
            <motion.div
              key="pricing-grid-container"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4 max-w-5xl mx-auto">
                {plans.map((p) => (
                  <PricingCard 
                    key={p.planName} 
                    {...p} 
                    hidePrice={p.hidePrice}
                    onSelect={() => handleSelectPlan(p.planName)} 
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Modal Form when a plan is selected */}
        <AnimatePresence>
          {selectedPlan && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4 text-white select-text">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative"
              >
                {/* Header close button */}
                <button 
                  onClick={() => { playClickSound(550, "sine"); setSelectedPlan(null); }}
                  className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Matrícula Aberta</span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                    Inscrição: {selectedPlan}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Preencha os dados abaixo e entraremos em contato para finalizar sua ativação.
                  </p>
                </div>

                <form onSubmit={handleSubmitInscription} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Seu Nome Completo *
                    </label>
                    <input 
                      type="text" 
                      required
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="Ex: Ana Maria Silva"
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      WhatsApp com DDD *
                    </label>
                    <input 
                      type="tel" 
                      required
                      value={contactWhatsApp}
                      onChange={e => setContactWhatsApp(e.target.value)}
                      placeholder="Ex: (32) 99999-9999"
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      Nome da sua Empresa / Segmento
                    </label>
                    <input 
                      type="text" 
                      value={businessSector}
                      onChange={e => setBusinessSector(e.target.value)}
                      placeholder="Ex: JF Doces Gourmet / Alimentação"
                      className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => { playClickSound(550, "sine"); setSelectedPlan(null); }}
                      className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-bold rounded-xl transition cursor-pointer"
                    >
                      CANCELAR
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-[11px] font-mono font-black rounded-xl flex items-center gap-1.5 shadow-lg transition cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "PROCESSANDO..." : "ENVIAR E CONFIRMAR ➔"}
                    </button>
                  </div>
                </form>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Visual Admin Modal Editor */}
        <AnimatePresence>
          {isEditModalOpen && (
            <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[99999] p-4 text-white select-text overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8"
              >
                {/* Header close button */}
                <button 
                  onClick={() => { playClickSound(550, "sine"); setIsEditModalOpen(false); }}
                  className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                    Editar Seção de Comunidade (Admin)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Modifique as informações gerais da seção e cada um dos 3 planos de adesão da comunidade.
                  </p>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  
                  {/* General Section Header Info */}
                  <div className="space-y-3 p-4 border border-zinc-800/80 rounded-2xl bg-zinc-900/30">
                    <h4 className="font-mono text-[10px] font-black text-pink-400 uppercase tracking-wider">Configuração do Cabeçalho</h4>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Título Principal</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Subtítulo / Descrição</label>
                      <textarea
                        rows={3}
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Cards Stack */}
                  <div className="space-y-6">
                    <h4 className="font-mono text-[10px] font-black text-pink-400 uppercase tracking-wider">Configuração dos Planos (3 Planos Máximo)</h4>
                    {editPlans.map((p, index) => (
                      <div key={index} className="border border-zinc-800 rounded-2xl p-4 bg-zinc-900/40 space-y-4">
                        <h5 className="font-mono text-xs font-black text-green-400 uppercase">Plano {index + 1}: {p.planName || "Sem Nome"}</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Nome do Plano</label>
                            <input
                              type="text"
                              value={p.planName}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].planName = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Preço</label>
                            <input
                              type="text"
                              value={p.price}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].price = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Período (Ex: / mês)</label>
                            <input
                              type="text"
                              value={p.period}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].period = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Texto do Botão</label>
                            <input
                              type="text"
                              value={p.buttonText}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].buttonText = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Descrição curta</label>
                          <textarea
                            rows={2}
                            value={p.description}
                            onChange={(e) => {
                              const updated = [...editPlans];
                              updated[index].description = e.target.value;
                              setEditPlans(updated);
                            }}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`hidePrice-${index}`}
                              checked={!!p.hidePrice}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].hidePrice = e.target.checked;
                                setEditPlans(updated);
                              }}
                              className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                            />
                            <label htmlFor={`hidePrice-${index}`} className="text-[10px] font-mono font-bold text-zinc-300 uppercase cursor-pointer select-none">
                              Ocultar Valor
                            </label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`isPopular-${index}`}
                              checked={!!p.isPopular}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].isPopular = e.target.checked;
                                setEditPlans(updated);
                              }}
                              className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                            />
                            <label htmlFor={`isPopular-${index}`} className="text-[10px] font-mono font-bold text-zinc-300 uppercase cursor-pointer select-none">
                              Destacar como Recomendado
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Link de Redirecionamento do WhatsApp (Opcional)</label>
                          <input
                            type="text"
                            placeholder="Ex: https://api.whatsapp.com/send/?phone=553291947690..."
                            value={p.whatsappUrl || ""}
                            onChange={(e) => {
                              const updated = [...editPlans];
                              updated[index].whatsappUrl = e.target.value;
                              setEditPlans(updated);
                            }}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono font-bold text-zinc-400 uppercase">Recursos e Benefícios (Um por linha)</label>
                          <textarea
                            rows={4}
                            value={(p.features || []).join("\n")}
                            onChange={(e) => {
                              const updated = [...editPlans];
                              updated[index].features = e.target.value.split("\n").filter(f => f.trim() !== "");
                              setEditPlans(updated);
                            }}
                            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:border-pink-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Modal Footer Controls */}
                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { playClickSound(550, "sine"); setIsEditModalOpen(false); }}
                    className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white text-[11px] font-mono font-bold rounded-xl transition cursor-pointer"
                  >
                    CANCELAR
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdits}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-mono font-black rounded-xl flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SALVAR E PUBLICAR ➔</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </section>
  );
}
