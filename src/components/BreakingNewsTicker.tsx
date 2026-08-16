import React, { useState, useEffect } from "react";
import { Zap, ExternalLink, Flame, Info, Filter, HelpCircle } from "lucide-react";
import { playClickSound } from "../utils/audio";

interface NewsTickerItem {
  id: string;
  city: string;
  title: string;
  isMain?: boolean;
  link?: string;
  source?: string;
}

const REGIONAL_HEADLINES: NewsTickerItem[] = [
  {
    id: "h-jf-1",
    city: "Juiz de Fora",
    title: "Juiz de Fora desponta como polo de Inteligência Artificial e Economia Criativa no Sudeste",
    isMain: true
  },
  {
    id: "h-jf-2",
    city: "Juiz de Fora",
    title: "Novas startups regionais aceleram contratação imediata e abrem mais de 45 vagas em JF",
    isMain: true
  },
  {
    id: "h-jf-3",
    city: "Juiz de Fora",
    title: "Festival de Outono Do Começo ao Topo atrai recorde de público para o Circuito Central de JF",
    isMain: true
  },
  {
    id: "h-uba",
    city: "Ubá",
    title: "Eco-indústria moveleira de Ubá integra soluções de automação e logística sustentável",
    isMain: false
  },
  {
    id: "h-rod",
    city: "Rodeiro",
    title: "Rodeiro sedia oficina de artes visuais eletrônicas fomentando canais de comunicação independentes",
    isMain: false
  },
  {
    id: "h-cp",
    city: "Coronel Pacheco",
    title: "Parque tecnológico agro de Coronel Pacheco lança edital móvel de fomento científico",
    isMain: false
  },
  {
    id: "h-go",
    city: "Goianá",
    title: "Aeroporto Regional em Goianá bate recorde mensal de passageiros com novos voos interligados",
    isMain: false
  },
  {
    id: "h-mb",
    city: "Matias Barbosa",
    title: "Matias Barbosa recebe polo móvel de desenvolvimento de software em parceria de fomento",
    isMain: false
  },
  {
    id: "h-bar",
    city: "Barbacena",
    title: "Barbacena sedia encontro sobre patrimônio do interior, combinando tradição e novos criadores",
    isMain: false
  }
];

interface BreakingNewsTickerProps {
  isDarkMode: boolean;
}

export default function BreakingNewsTicker({ isDarkMode }: BreakingNewsTickerProps) {
  const [filterCity, setFilterCity] = useState<string>("ALL");
  const [isPaused, setIsPaused] = useState(false);
  const [headlines, setHeadlines] = useState<NewsTickerItem[]>(REGIONAL_HEADLINES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const googleNewsUrl = "https://news.google.com/home?hl=pt-BR&gl=BR&ceid=BR%3Apt-419";

  useEffect(() => {
    let active = true;
    const loadLiveNews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/google-news");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            if (active) {
              setHeadlines(data.items);
            }
          }
        }
      } catch {
        // Fallback local headlines are already used by default in state
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    loadLiveNews();
    return () => {
      active = false;
    };
  }, []);

  const handleTickerClick = (item: NewsTickerItem) => {
    playClickSound(620, "sine");
    if (item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    } else {
      window.open(googleNewsUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Filter headlines
  const filteredHeadlines = headlines.filter((item) => {
    if (filterCity === "ALL") return true;
    if (filterCity === "JF") return item.city === "Juiz de Fora";
    return item.city !== "Juiz de Fora" && filterCity === "OUTRAS";
  });

  // Duplicate items for seamless continuous looping
  const marqueeItems = [...filteredHeadlines, ...filteredHeadlines, ...filteredHeadlines];

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 relative overflow-hidden backdrop-blur-sm shadow-sm ${
        isDarkMode
          ? "bg-stone-950/80 border-red-500/20 hover:border-red-500/30 shadow-[0_4px_25px_rgba(239,68,68,0.03)]"
          : "bg-stone-50 border-stone-200 hover:border-red-400"
      }`}
    >
      <div className="flex flex-col md:flex-row items-stretch">
        
        {/* LEADING BADGE PORTION - STATIONARY */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600/95 to-pink-600/90 text-white select-none shrink-0 border-r border-red-500/10 z-10 relative">
          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-r from-transparent to-red-650 opacity-40" />
          <Flame className="w-4 h-4 text-white fill-white animate-bounce shrink-0" />
          <span className="text-[10px] font-display font-black tracking-widest uppercase text-white shrink-0">
            ÚLTIMAS NOTÍCIAS {isLoading && "..."}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
        </div>

        {/* MIDDLE CONTENT: THE TICKER LOOP */}
        <div 
          className="flex-1 overflow-hidden relative flex items-center min-h-[38px] cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* FADE LEFT AND RIGHT SHADOW PLUGINS FOR MAGNIFICENT DEPTH */}
          <div className={`absolute left-0 inset-y-0 w-12 z-10 bg-gradient-to-r pointer-events-none ${isDarkMode ? "from-stone-950" : "from-stone-50"} to-transparent`} />
          <div className={`absolute right-0 inset-y-0 w-12 z-10 bg-gradient-to-l pointer-events-none ${isDarkMode ? "from-stone-950" : "from-stone-50"} to-transparent`} />

          {/* MARQUEE STREAM CONTAINER */}
          <div 
            className={`flex items-center gap-8 whitespace-nowrap py-1 ${
              isPaused ? "" : "animate-marquee-slow"
            }`}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {marqueeItems.map((item, idx) => (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => handleTickerClick(item)}
                className="flex items-center gap-2.5 group hover:opacity-100 transition duration-300"
              >
                {/* CITY LABEL PILL */}
                <span
                  className={`text-[8px] font-mono tracking-widest font-black uppercase px-2 py-0.5 rounded ${
                    item.city === "Juiz de Fora"
                      ? "bg-red-500/15 text-red-500 border border-red-500/20"
                      : "bg-green-500/15 text-green-400 border border-green-500/20"
                  }`}
                >
                  📍 {item.city}
                </span>

                {/* NOTICIA HEADLINE TEXT */}
                <span className={`text-[11px] font-sans tracking-tight font-medium transition ${isDarkMode ? "text-zinc-200 group-hover:text-red-400" : "text-stone-800 group-hover:text-red-500"}`}>
                  {item.title}
                </span>

                {/* SOURCE BADGE */}
                <span className="inline-flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono transition group-hover:underline">
                  <span>via {item.source || "Google News"} 🌐</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 group-hover:text-red-400 transition" />
                </span>

                {/* DOT SEPARATOR */}
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mx-1" />
              </button>
            ))}
          </div>
        </div>

        {/* REGIONAL FILTER AND EXPLANATORY PORTION - STATIONARY */}
        <div className={`flex items-center gap-2 px-3 py-1.5 text-zinc-400 font-mono text-[9px] uppercase border-l ${isDarkMode ? "bg-stone-950/90 border-zinc-900" : "bg-white border-stone-200"} shrink-0`}>
          <Filter className="w-3 h-3 text-zinc-500 shrink-0" />
          <span className="hidden xl:inline text-zinc-500 font-bold">Filtro:</span>
          
          <div className="flex items-center gap-1">
            {[
              { id: "ALL", label: "Tudo" },
              { id: "JF", label: "JF" },
              { id: "OUTRAS", label: "Outras" }
            ].map((btn) => {
              const active = filterCity === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    playClickSound(600, "sine");
                    setFilterCity(btn.id);
                  }}
                  className={`px-1.5 py-0.5 rounded transition ${
                    active 
                      ? "bg-red-500/20 border border-red-500/30 text-red-500 font-black" 
                      : isDarkMode ? "hover:text-white" : "hover:text-stone-900 text-stone-600"
                  }`}
                  title={`Filtrar somente notícias de ${btn.label}`}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* LINK TO GOOGLE NEWS MANUALLY */}
          <a
            href={googleNewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound(610, "sine")}
            className={`p-1 rounded ${
              isDarkMode 
                ? "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700" 
                : "bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-300"
            } transition`}
            title="Abrir Fonte no Google News"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
