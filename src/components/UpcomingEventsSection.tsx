import React, { useState, useRef } from "react";
import { 
  Calendar, Clock, Award, CheckCircle2, MessageCircle, 
  Sparkles, ArrowRight, Camera, Upload, Link, RefreshCw, X, Check, Loader2
} from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { toast } from "sonner";
import { compressImageFile, uploadImageToServer, safeLocalStorageSet } from "../utils/imageCompression";

interface UpcomingEventsSectionProps {
  isDarkMode?: boolean;
  directEditingMode?: boolean;
}

export default function UpcomingEventsSection({ 
  isDarkMode = true, 
  directEditingMode = false 
}: UpcomingEventsSectionProps) {
  const whatsappNumber = "553291109437";
  const whatsappMessage = encodeURIComponent(
    "Olá Flávia! Vi a divulgação da Palestra 'Reforma Tributária: Entenda o presente. Antecipe o futuro' no Portal Do Começo ao Topo e gostaria de garantir minha inscrição!"
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  // Speaker photo state with local storage persistence
  const [speakerPhoto, setSpeakerPhoto] = useState<string>(() => {
    try {
      const stored = localStorage.getItem("app_upcoming_event_speaker_photo");
      if (stored && !stored.startsWith("data:image/")) {
        return stored;
      }
    } catch (e) {}
    return "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80";
  });

  // Modal editing state
  const [isEditingPhoto, setIsEditingPhoto] = useState<boolean>(false);
  const [tempUrl, setTempUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenEdit = () => {
    playClickSound(700, "sine");
    setTempUrl(speakerPhoto);
    setIsEditingPhoto(true);
  };

  const handleSavePhoto = (newUrl: string) => {
    if (!newUrl) return;
    playSuccessSound();
    setSpeakerPhoto(newUrl);
    safeLocalStorageSet("app_upcoming_event_speaker_photo", newUrl);
    toast.success("Foto da palestrante Flávia Reis atualizada com sucesso!");
    setIsEditingPhoto(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 15MB");
      return;
    }

    try {
      setIsUploading(true);
      toast.loading("Otimizando e enviando imagem...", { id: "upload-speaker" });

      // 1. Compress image client side
      const compressedDataUrl = await compressImageFile(file, {
        maxDimension: 1200,
        quality: 0.8
      });

      // 2. Upload to server to get hosted link
      const hostedUrl = await uploadImageToServer(compressedDataUrl);

      handleSavePhoto(hostedUrl);
      toast.success("Imagem atualizada com sucesso!", { id: "upload-speaker" });
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Erro ao processar imagem.", { id: "upload-speaker" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetPhoto = () => {
    const defaultUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80";
    setSpeakerPhoto(defaultUrl);
    try { localStorage.removeItem("app_upcoming_event_speaker_photo"); } catch (e) {}
    toast.info("Foto da palestrante restaurada para o padrão.");
    setIsEditingPhoto(false);
  };

  return (
    <section id="proximos-eventos-destaque" className="my-10 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Section Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
            <Calendar className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 tracking-widest">
                Agenda Oficial
              </span>
              <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                Vagas Limitadas
              </span>
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight uppercase">
              Eventos Próximos
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold transition hover:scale-105"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Editar Foto Palestrante</span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound(800, "sine")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition hover:scale-105 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            <span>Falar com Flávia Reis no WhatsApp</span>
          </a>
        </div>
      </div>

      {/* FEATURED EVENT HIGHLIGHT CARD (FLÁVIA REIS - REFORMA TRIBUTÁRIA) */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-b from-[#0a1128] via-[#070b19] to-stone-950 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(245,158,11,0.15)]">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 relative z-10">
          
          {/* LEFT CONTENT COLUMN */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            
            {/* Header badges & Event Category */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                  PALESTRA ONLINE
                </span>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider">
                  SÁBADO • 12/09
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 9h às 12h (3h)
                </span>
              </div>

              {/* Title & Slogan */}
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 uppercase tracking-tight leading-none mb-2">
                REFORMA TRIBUTÁRIA
              </h2>
              <p className="text-sm sm:text-base font-semibold text-amber-200/90 uppercase tracking-wider font-mono">
                Entenda o presente. Antecipe o futuro.
              </p>
            </div>

            {/* Description Text */}
            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Um panorama completo sobre as transformações que já começaram e os impactos que vão redefinir empresas e negócios de todos os portes. Prepare sua empresa com visão estratégica e segurança jurídica.
            </p>

            {/* Key Topics List */}
            <div className="space-y-2.5 bg-black/40 border border-amber-500/20 p-4 sm:p-5 rounded-2xl backdrop-blur-md">
              <h4 className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Temas Abordados na Palestra:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Panorama da Reforma Tributária</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Principais mudanças e prazos</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Impactos no Simples, Lucro Presumido e Real</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Planejamento e oportunidades</span>
                </div>
              </div>
            </div>

            {/* Value Props Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-zinc-400 text-center">
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                🎯 Conteúdo atualizado e direto ao ponto
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                ⭐ Especialista com experiência de mercado
              </div>
              <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                💡 Visão estratégica para o futuro
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SPEAKER PROFILE, INVESTMENT & DIRECT WHATSAPP ACTION */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-gradient-to-b from-[#0d1738]/80 to-[#070b18]/95 border border-amber-500/30 p-6 rounded-2xl">
            
            {/* Speaker Presentation */}
            <div className="space-y-4 text-center">
              <div className="inline-block relative group/speaker cursor-pointer" onClick={handleOpenEdit}>
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-xl mx-auto overflow-hidden bg-zinc-950">
                  <img
                    src={speakerPhoto}
                    alt="Flávia Reis - Especialista Tributária"
                    className="w-full h-full object-cover object-top rounded-xl"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                </div>
                <span className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 text-black rounded-lg text-[10px] font-bold shadow-md">
                  ⭐ Palestrante
                </span>

                {/* Hover overlay to change speaker image */}
                <div className="absolute inset-0 bg-black/70 rounded-2xl flex flex-col items-center justify-center gap-1 text-white opacity-0 group-hover/speaker:opacity-100 transition-opacity duration-200 border border-amber-400">
                  <Camera className="w-5 h-5 text-amber-300" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                    Trocar Foto
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-display font-bold text-2xl text-amber-100 italic tracking-wide">
                  Flávia Reis
                </h3>
                <p className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mt-0.5">
                  Especialista Tributária
                </p>
                <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  Referência em assessoria tributária, planejamento fiscal e estruturação tributária para empresas e empreendedores.
                </p>
                
                <button
                  onClick={handleOpenEdit}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 hover:text-amber-300 underline"
                >
                  <Camera className="w-3.5 h-3.5" /> Alterar foto da Flávia Reis
                </button>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 border-2 border-amber-500/40 text-center space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold tracking-widest block">
                Investimento Promocional
              </span>
              <div className="flex items-center justify-center gap-1 text-amber-300">
                <span className="text-lg font-mono font-bold">R$</span>
                <span className="font-display font-black text-4xl sm:text-5xl tracking-tight text-white">
                  30,00
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 block pt-1">
                🔥 Vaga Limitada! Garanta sua participação
              </span>
            </div>

            {/* MAIN WHATSAPP CALL TO ACTION BUTTON */}
            <div className="space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound(850, "sine")}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-500 text-black font-mono font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98] transition duration-300 group cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-current shrink-0 group-hover:rotate-12 transition duration-300" />
                <div className="text-left leading-tight">
                  <div className="text-[10px] opacity-80 uppercase tracking-widest">Informações & Inscrições</div>
                  <div className="text-base font-black tracking-wide">WhatsApp: (32) 99110-9437</div>
                </div>
                <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition" />
              </a>

              <p className="text-[10px] font-mono text-center text-zinc-400">
                Clique no botão acima para abrir a conversa direta com a Flávia e reservar sua vaga.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* EDIT SPEAKER PHOTO MODAL */}
      {isEditingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border-2 border-amber-500/50 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-black text-lg text-white uppercase">
                    Foto da Palestrante
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    Flávia Reis • Palestra Reforma Tributária
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingPhoto(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="flex flex-col items-center gap-3 p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-lg">
                <img
                  src={tempUrl || speakerPhoto}
                  alt="Prévia Palestrante"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Prévia da imagem</span>
            </div>

            {/* Option 1: File Upload */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                1. Carregar do Computador / Celular
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700 text-white font-mono font-bold text-xs uppercase flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Otimizando e Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Escolher Arquivo de Imagem</span>
                  </>
                )}
              </button>
            </div>

            {/* Option 2: Image URL */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block">
                2. Ou colar Link / URL Direto da Imagem
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://exemplo.com/foto-flavia.jpg"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={handleResetPhoto}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 font-mono py-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Restaurar Padrão
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingPhoto(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSavePhoto(tempUrl)}
                  disabled={!tempUrl}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 shadow-lg"
                >
                  <Check className="w-4 h-4" /> Salvar Foto
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
