import React from "react";
import { BookOpen, Calendar, Briefcase, Handshake, MapPin } from "lucide-react";

interface CategoryPageHeaderProps {
  category: string | null;
  isDarkMode: boolean;
  portalPagesConfig: any;
  city?: string | null;
}

export default function CategoryPageHeader({ category, isDarkMode, portalPagesConfig, city }: CategoryPageHeaderProps) {
  let title = "";
  let description = "";
  let Icon = BookOpen;
  let gradientClass = "";

  if (city) {
    title = `Conteúdo de ${city}`;
    description = `Acompanhe as últimas notícias, guias e conteúdos exclusivos diretamente de ${city}. Nosso compromisso é o jornalismo de proximidade, conectando pessoas e informações estratégicas locais.`;
    Icon = MapPin;
    gradientClass = "from-cyan-500 to-blue-500";
  } else {
    switch (category) {
      case "CURSOS":
        title = portalPagesConfig?.cursosTitle || "Cursos On-line & Programas Avançados";
        description = portalPagesConfig?.cursosDescription || "Aprenda sobre posicionamento de marca, vendas estratégicas, oratória, inteligência artificial e produtividade.";
        Icon = BookOpen;
        gradientClass = "from-emerald-400 to-green-600";
        break;
      case "EVENTOS":
        title = portalPagesConfig?.eventosTitle || "Agenda e Cobertura de Eventos";
        description = portalPagesConfig?.eventosDescription || "Fique por dentro das pautas, palestras e eventos corporativos mais badalados da região. Acompanhe locais, dicas e networking.";
        Icon = Calendar;
        gradientClass = "from-fuchsia-500 to-pink-600";
        break;
      case "VAGA DE EMPREGOS":
        title = portalPagesConfig?.vagasTitle || "Vagas de Emprego & Oportunidades";
        description = portalPagesConfig?.vagasDescription || "Encontre as vagas abertas em startups parceiras e empresas aceleradas do ecossistema Do Começo ao Topo.";
        Icon = Briefcase;
        gradientClass = "from-orange-400 to-amber-600";
        break;
      case "PARCEIROS":
        title = portalPagesConfig?.parceirosTitle || "Ecossistema de Parceiros";
        description = portalPagesConfig?.parceirosDescription || "Conheça grandes nomes regionais e apoiadores que fazem acontecer junto com o portal Do Começo ao Topo. Networking aprovado!";
        Icon = Handshake;
        gradientClass = "from-violet-400 to-purple-600";
        break;
      default:
        return null;
    }
  }

  return (
    <div className={`p-8 md:p-12 rounded-3xl mb-8 border relative overflow-hidden ${isDarkMode ? "bg-stone-950 border-zinc-900" : "bg-white border-stone-200 shadow-sm"}`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${gradientClass}`} />
      
      {/* Decorative Blur Background Element */}
      <div className={`absolute top-0 right-0 w-64 h-64 opacity-20 blur-3xl rounded-full bg-gradient-to-b ${gradientClass} -translate-y-1/2 translate-x-1/3 pointer-events-none`} />

      <div className="relative z-10 max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-900 border border-zinc-800/80 shadow-lg`}>
            <Icon className={`w-6 h-6 text-white`} />
          </div>
          <span className={`text-[10px] font-mono font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${gradientClass}`}>
            Página Exclusiva
          </span>
        </div>
        
        <h1 className={`font-display font-black text-3xl md:text-5xl tracking-tight leading-tight ${isDarkMode ? "text-white" : "text-stone-900"}`}>
          {title}
        </h1>
        
        <p className={`text-sm md:text-base font-sans leading-relaxed max-w-2xl ${isDarkMode ? "text-zinc-400" : "text-stone-500"}`}>
          {description}
        </p>
      </div>
    </div>
  );
}
