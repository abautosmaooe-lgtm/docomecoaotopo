import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Sparkles, Megaphone, ChevronDown, ChevronUp, Edit3, Save, X, Plus, Trash2 } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { toast } from "sonner";
import { RippleButton } from "./CommunityMembership";

// Icons for list items
const CheckIcon = ({ className = "" }: { className?: string }) => (
  <Check className={`w-4 h-4 ${className}`} />
);

export interface AdvPlanData {
  planName: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
  buttonVariant?: "primary" | "secondary" | "pink";
  hidePrice?: boolean;
}

export interface PortalAdvertisingProps {
  isDarkMode: boolean;
  isAdmin?: boolean;
}

export default function PortalAdvertising({ isDarkMode, isAdmin = false }: PortalAdvertisingProps) {
  const [sectionTitle, setSectionTitle] = useState("1. Publicidade no Portal");
  const [sectionSubtitle, setSectionSubtitle] = useState("Cotas de Patrocínio e Anúncios - Escolha seu nível de destaque e impulsione seu negócio!");
  const [whatsappNumber, setWhatsappNumber] = useState("+55 32 9194-7690");
  const [isSectionCollapsed, setIsSectionCollapsed] = useState(false);

  // Default advertising plans matching user request
  const defaultPlans: AdvPlanData[] = [
    {
      planName: "Apoiador",
      description: "Ideal para profissionais liberais, autônomos e pequenos negócios locais ganharem visibilidade.",
      price: "R$ 97,00",
      period: "/ mês",
      features: [
        "Inclusão simples de logo rotativa no banner de parceiros",
        "Menção de agradecimento em publicações nas redes sociais",
        "Presença no guia profissional regional do portal",
        "Suporte direto via WhatsApp para envio de materiais"
      ],
      buttonText: "Cota Apoiador ➔",
      buttonVariant: "secondary"
    },
    {
      planName: "Plano Fundador",
      description: "O patrocínio definitivo de elite para marcas visionárias. Aderindo antes de todos, você garante valor congelado vitalício, posição suprema e assento no Conselho.",
      price: "R$ 197,00",
      period: "/ mês",
      features: [
        "Valor congelado vitalício (condição histórica exclusiva para primeiros apoiadores)",
        "Banner Máster fixo e permanente em posição de destaque máximo em todo o portal",
        "Entrevista exclusiva de capa no Podcast + Publiposts quinzenais dedicados",
        "Cadeira de honra no Conselho Consultivo de Fundadores do Portal",
        "Destaque máster em todos os eventos presenciais, grupos VIP e transmissões ao vivo"
      ],
      buttonText: "Cota Fundador 👑",
      buttonVariant: "pink"
    },
    {
      planName: "Anunciante",
      description: "Destaque intermediário ideal para empresas estabelecidas que desejam atração constante de leads.",
      price: "R$ 397,00",
      period: "/ mês",
      features: [
        "Banner rotativo exclusivo na homepage do portal de notícias",
        "Até 2 Publiposts (artigos patrocinados) exclusivos por mês",
        "Inserção no catálogo VIP de marcas e empresas recomendadas",
        "Relatório mensal simples de visualizações e cliques do banner"
      ],
      buttonText: "Cota Anunciante 🔥",
      isPopular: true,
      buttonVariant: "primary"
    },
    {
      planName: "Mestre Anunciante",
      description: "Patrocínio supremo com máxima autoridade e visibilidade multicanal no ecossistema Do Começo ao Topo.",
      price: "R$ 697,00",
      period: "/ mês",
      features: [
        "Banner permanente de alta visibilidade no topo das notícias",
        "Assinatura e patrocínio oficial com logotipo em todas as páginas",
        "Participação garantida como patrocinador máster no Podcast",
        "Divulgação dedicada em todos os grupos VIP e disparos semanais"
      ],
      buttonText: "Cota Mestre Anunciante 💎",
      buttonVariant: "primary"
    }
  ];

  const [plans, setPlans] = useState<AdvPlanData[]>(defaultPlans);

  // Admin states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editPlans, setEditPlans] = useState<AdvPlanData[]>([]);

  // Helper to ensure exact required order: APOIADOR, PLANO FUNDADOR, ANUNCIANTE, MESTRE ANUNCIANTE
  const ensureFundadorPlan = (loadedPlans: AdvPlanData[]): AdvPlanData[] => {
    const targetOrderKeys = ["apoiador", "fundador", "anunciante", "mestre"];
    const hasFundador = loadedPlans.some(p => (p.planName || "").toLowerCase().includes("fundador"));
    let updated = [...loadedPlans];
    if (!hasFundador) {
      updated.push(defaultPlans[1]);
    }
    updated = updated.map(p => {
      if ((p.planName || "").toLowerCase().includes("fundador")) {
        return {
          ...p,
          price: "R$ 197,00"
        };
      }
      return p;
    });

    // Sort to strictly match: APOIADOR, PLANO FUNDADOR, ANUNCIANTE, MESTRE ANUNCIANTE
    updated.sort((a, b) => {
      const nameA = (a.planName || "").toLowerCase();
      const nameB = (b.planName || "").toLowerCase();
      const idxA = targetOrderKeys.findIndex(k => nameA.includes(k));
      const idxB = targetOrderKeys.findIndex(k => nameB.includes(k));
      const posA = idxA !== -1 ? idxA : 99;
      const posB = idxB !== -1 ? idxB : 99;
      return posA - posB;
    });

    return updated;
  };

  // Load from local storage and then Firestore on mount
  useEffect(() => {
    const savedPlans = localStorage.getItem("portal_advertising_plans");
    const savedTitle = localStorage.getItem("portal_advertising_title");
    const savedSubtitle = localStorage.getItem("portal_advertising_subtitle");
    const savedWhatsapp = localStorage.getItem("portal_advertising_whatsapp");
    const savedCollapsed = localStorage.getItem("portal_advertising_collapsed");

    if (savedPlans) {
      try { 
        const parsed = JSON.parse(savedPlans);
        setPlans(ensureFundadorPlan(parsed)); 
      } catch (e) { console.error(e); }
    }
    if (savedTitle) setSectionTitle(savedTitle);
    if (savedSubtitle) setSectionSubtitle(savedSubtitle);
    if (savedWhatsapp) setWhatsappNumber(savedWhatsapp);
    if (savedCollapsed) setIsSectionCollapsed(savedCollapsed === "true");

    // Fetch from Firestore
    fetch(`/api/published-data?t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (Array.isArray(data.advertising_plans) && data.advertising_plans.length > 0) {
            const updatedPlans = ensureFundadorPlan(data.advertising_plans);
            setPlans(updatedPlans);
            localStorage.setItem("portal_advertising_plans", JSON.stringify(updatedPlans));
          }
          if (data.advertising_title) {
            setSectionTitle(data.advertising_title);
            localStorage.setItem("portal_advertising_title", data.advertising_title);
          }
          if (data.advertising_subtitle) {
            setSectionSubtitle(data.advertising_subtitle);
            localStorage.setItem("portal_advertising_subtitle", data.advertising_subtitle);
          }
          if (data.advertising_whatsapp) {
            setWhatsappNumber(data.advertising_whatsapp);
            localStorage.setItem("portal_advertising_whatsapp", data.advertising_whatsapp);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleCollapse = () => {
    const newState = !isSectionCollapsed;
    setIsSectionCollapsed(newState);
    localStorage.setItem("portal_advertising_collapsed", String(newState));
    playClickSound(600, "sine");
  };

  const handleOpenEditModal = () => {
    setEditTitle(sectionTitle);
    setEditSubtitle(sectionSubtitle);
    setEditWhatsapp(whatsappNumber);
    setEditPlans(JSON.parse(JSON.stringify(plans)));
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
    setWhatsappNumber(editWhatsapp);
    setPlans(editPlans);

    localStorage.setItem("portal_advertising_plans", JSON.stringify(editPlans));
    localStorage.setItem("portal_advertising_title", editTitle);
    localStorage.setItem("portal_advertising_subtitle", editSubtitle);
    localStorage.setItem("portal_advertising_whatsapp", editWhatsapp);

    setIsEditModalOpen(false);
    playSuccessSound();
    toast.success("Alterações salvas localmente!");

    // Sincronizar com Firestore
    fetch("/api/published-data")
      .then((res) => res.json())
      .then((serverData) => {
        const payload = {
          ...serverData,
          advertising_plans: editPlans,
          advertising_title: editTitle,
          advertising_subtitle: editSubtitle,
          advertising_whatsapp: editWhatsapp
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
          toast.success("Alterações de publicidade publicadas com sucesso!");
        } else {
          toast.error("Erro ao sincronizar publicidade no servidor.");
        }
      })
      .catch((err) => {
        console.error("Error publishing advertising config:", err);
        toast.error("Erro ao sincronizar com o banco de dados.");
      });
  };

  const handleSelectPlan = (plan: AdvPlanData) => {
    playClickSound(950, "sine");
    
    // Clean phone number (remove +, spaces, hyphens)
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
    
    const message = `Olá, gostaria de saber mais sobre a cota de patrocínio *${plan.planName}* (valor ${plan.price}${plan.period}) para anunciar no Portal Do Começo ao Topo!`;
    const encodedMsg = encodeURIComponent(message);
    
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMsg}`, "_blank");
  };

  return (
    <section id="portal-advertising-section" className="relative max-w-7xl mx-auto px-4 py-16 select-none overflow-hidden bg-transparent">
      
      {/* Visual framing line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />

      <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-16 text-center space-y-10">
        
        {/* Badge & Headings */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">
            <Megaphone className="w-3.5 h-3.5 animate-pulse text-pink-400" />
            <span>MÍDIA E PATROCÍNIO</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white uppercase tracking-tight leading-none">
            {sectionTitle}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-medium">
            {sectionSubtitle}
          </p>
        </div>

        {/* Admin Button */}
        {isAdmin && (
          <div className="flex justify-center pb-2">
            <button
              onClick={handleOpenEditModal}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-mono text-[10px] font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer select-none border border-pink-500/30"
            >
              <Edit3 className="w-3.5 h-3.5 animate-bounce" />
              <span>Editar Cotas de Publicidade (Admin)</span>
            </button>
          </div>
        )}

        {/* Collapse / Expand Toggle */}
        <div className="flex justify-center">
          <button
            onClick={handleToggleCollapse}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 hover:bg-zinc-900 hover:border-pink-500/50 text-xs font-mono font-black uppercase tracking-wider text-zinc-300 hover:text-white transition-all duration-300 cursor-pointer shadow-lg select-none"
          >
            {isSectionCollapsed ? (
              <>
                <ChevronDown className="w-4 h-4 text-green-400 animate-bounce" />
                <span>Mostrar Cotas de Publicidade</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-4 h-4 text-pink-400" />
                <span>Recolher Cotas</span>
              </>
            )}
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <AnimatePresence mode="wait">
          {!isSectionCollapsed && (
            <motion.div
              key="adv-pricing-grid"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-4 max-w-7xl mx-auto">
                {plans.map((p) => {
                  const isFundador = p.planName.toLowerCase().includes("fundador");
                  return (
                    <motion.div 
                      key={p.planName}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className={`relative backdrop-blur-xl bg-black/40 dark:bg-zinc-950/40 rounded-3xl p-7 flex flex-col transition-all duration-300 border border-zinc-800/80 shadow-xl overflow-hidden w-full ${
                        p.isPopular 
                          ? "border-pink-500/50 ring-2 ring-pink-500/20 bg-gradient-to-b from-pink-950/10 to-transparent shadow-pink-950/10 scale-105 z-10" 
                          : isFundador
                          ? "border-amber-500/60 ring-2 ring-amber-500/20 bg-gradient-to-b from-amber-950/20 via-pink-950/10 to-transparent shadow-amber-950/20 scale-105 z-10"
                          : "hover:border-zinc-700"
                      }`}
                    >
                      {p.isPopular && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-b-xl bg-pink-500 text-white shadow-lg">
                          🔥 MAIS PROCURADO
                        </div>
                      )}

                      {isFundador && !p.isPopular && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-4 py-1.5 text-[9px] font-mono font-black uppercase tracking-widest rounded-b-xl bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 text-white shadow-lg whitespace-nowrap">
                          👑 OPORTUNIDADE PIONEIRA
                        </div>
                      )}

                      {p.isPopular && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                      )}

                      {isFundador && (
                        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                      )}

                    <div className="mb-4 text-left">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase block">Plano</span>
                      <h3 className="text-2xl font-black tracking-tight text-white uppercase font-display mt-0.5">{p.planName}</h3>
                      <p className="text-xs text-zinc-400 mt-2 min-h-[32px] leading-relaxed">{p.description}</p>
                    </div>

                    {!p.hidePrice ? (
                      <div className="my-5 flex items-baseline gap-1 justify-start">
                        <span className="text-3xl font-black text-white font-display">
                          {p.price.startsWith("R$") ? p.price : `R$ ${p.price}`}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">{p.period}</span>
                      </div>
                    ) : (
                      <div className="my-5 flex items-baseline gap-1 min-h-[44px]"></div>
                    )}

                    <div className="w-full mb-5 h-px bg-gradient-to-r from-transparent via-zinc-800/80 to-transparent" />

                    {/* Features */}
                    <ul className="flex flex-col gap-3 text-xs text-zinc-300 mb-8 flex-1 text-left">
                      {p.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckIcon className="text-green-400 w-4 h-4 shrink-0 mt-0.5" /> 
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <RippleButton 
                      onClick={() => handleSelectPlan(p)}
                      className={`w-full py-3.5 rounded-2xl font-mono font-black text-[11px] uppercase tracking-wider transition-all duration-300 ${
                        p.buttonVariant === "secondary" 
                          ? "bg-zinc-950/40 border border-[#00FF66]/40 hover:border-[#00FF66] text-[#00FF66] hover:bg-[#00FF66]/10 shadow-[0_0_10px_rgba(0,255,102,0.05)] hover:shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                          : p.buttonVariant === "pink"
                          ? "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-950/20 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                          : "bg-[#00FF66] hover:bg-[#33FF88] text-black shadow-lg shadow-green-950/20 hover:shadow-[0_0_20px_rgba(0,255,102,0.4)]"
                      }`}
                    >
                      <span>{p.buttonText}</span>
                    </RippleButton>
                  </motion.div>
                );
              })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Admin Edit Modal --- */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[99999] p-4 text-white select-text">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => { playClickSound(550, "sine"); setIsEditModalOpen(false); }}
                className="absolute top-4 right-4 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                  Painel de Edição: Publicidade no Portal
                </h3>
                <p className="text-xs text-zinc-400">
                  Modifique os planos, preços e textos da área de patrocínio.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Título da Seção</label>
                    <input 
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 font-sans font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">WhatsApp para Contato</label>
                    <input 
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 font-mono"
                      placeholder="+55 32 9194-7690"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Subtítulo da Seção</label>
                  <textarea 
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-green-500 font-sans leading-relaxed"
                  />
                </div>

                {/* Edit plans lists */}
                <div className="space-y-4 pt-2 border-t border-zinc-900">
                  <h4 className="text-xs font-bold text-green-400 uppercase tracking-wide">Editar Planos/Cotas</h4>
                  
                  <div className="space-y-6">
                    {editPlans.map((p, index) => (
                      <div key={index} className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-850 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-mono text-xs font-black text-green-400 uppercase">Cota {index + 1}: {p.planName || "Sem Nome"}</h5>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono cursor-pointer select-none">
                              <input 
                                type="checkbox"
                                checked={p.isPopular}
                                onChange={(e) => {
                                  const updated = [...editPlans];
                                  updated[index].isPopular = e.target.checked;
                                  setEditPlans(updated);
                                }}
                                className="accent-pink-500 rounded border-zinc-800 bg-zinc-900"
                              />
                              Mais Procurado / Destaque
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Nome do Plano</label>
                            <input 
                              type="text"
                              value={p.planName}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].planName = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Preço</label>
                            <input 
                              type="text"
                              value={p.price}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].price = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Período</label>
                            <input 
                              type="text"
                              value={p.period}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].period = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Descrição Curta</label>
                          <input 
                            type="text"
                            value={p.description}
                            onChange={(e) => {
                              const updated = [...editPlans];
                              updated[index].description = e.target.value;
                              setEditPlans(updated);
                            }}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Texto do Botão</label>
                            <input 
                              type="text"
                              value={p.buttonText}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].buttonText = e.target.value;
                                setEditPlans(updated);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Cor do Botão</label>
                            <select 
                              value={p.buttonVariant || "primary"}
                              onChange={(e) => {
                                const updated = [...editPlans];
                                updated[index].buttonVariant = e.target.value as any;
                                setEditPlans(updated);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                            >
                              <option value="primary">Verde Neon (Preenchido)</option>
                              <option value="secondary">Verde Neon (Borda)</option>
                              <option value="pink">Rosa (Preenchido)</option>
                            </select>
                          </div>
                        </div>

                        {/* Features list per plan */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-mono font-bold text-zinc-500 uppercase block">Vantagens / Benefícios (Uma por linha)</label>
                          <textarea 
                            value={p.features.join("\n")}
                            onChange={(e) => {
                              const updated = [...editPlans];
                              updated[index].features = e.target.value.split("\n").filter(line => line.trim() !== "");
                              setEditPlans(updated);
                            }}
                            rows={4}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-green-500 font-sans"
                            placeholder="Vantagem 1&#10;Vantagem 2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save/Cancel footer buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  onClick={() => { playClickSound(500, "sine"); setIsEditModalOpen(false); }}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-xs font-mono font-bold uppercase text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-green-500 text-black font-mono text-xs font-bold uppercase hover:bg-green-400 transition shadow-lg shadow-green-500/10 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar & Publicar</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
}
