import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CloudSun, Sun, CloudRain, MapPin, Calendar, Clock, ChevronRight, ChevronLeft, LogOut, User, Sparkles, ScanFace, Hand } from "lucide-react";
import { AppUser } from "../types";
import { playClickSound } from "../utils/audio";

interface CollapsibleHeaderWeatherProps {
  isDarkMode: boolean;
  user: AppUser;
  onTriggerLogin: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenFaceNav?: () => void;
  onOpenHandNav?: () => void;
}

export default function CollapsibleHeaderWeather({
  isDarkMode,
  user,
  onTriggerLogin,
  onLogout,
  onOpenProfile,
  onOpenFaceNav,
  onOpenHandNav,
}: CollapsibleHeaderWeatherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState("Juiz de Fora, MG");
  const [weather, setWeather] = useState({
    temp: 23,
    condition: "Parcialmente Nublado",
    humidity: 74,
    wind: "12 km/h",
    type: "cloudy",
  });

  // Keep time ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeatherIcon = () => {
    switch (weather.type) {
      case "clear":
        return <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />;
      case "rainy":
        return <CloudRain className="w-3.5 h-3.5 text-pink-400 animate-bounce" />;
      default:
        return <CloudSun className="w-3.5 h-3.5 text-green-400" />;
    }
  };

  const formattedTime = time.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formattedDate = time.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const handleToggleExpand = () => {
    playClickSound(isExpanded ? 500 : 650, "sine");
    setIsExpanded(!isExpanded);
  };

  const handleCitySelect = (city: string) => {
    playClickSound(700, "sine");
    setLocation(`${city}, ${city === "Rio de Janeiro" ? "RJ" : "MG"}`);
    const randTemp = Math.floor(Math.random() * 8) + 19;
    const types = ["clear", "cloudy", "rainy"];
    const conditions = ["Ensolarado", "Nublado Neon", "Chuva Leve"];
    const ri = Math.floor(Math.random() * 3);
    setWeather({
      temp: randTemp,
      condition: conditions[ri],
      humidity: Math.floor(Math.random() * 25) + 55,
      wind: `${Math.floor(Math.random() * 10) + 7} km/h`,
      type: types[ri],
    });
  };

  return (
    <div 
      id="collapsible-weather-bar" 
      className="w-full flex items-center justify-between gap-2 md:gap-4 py-1.5 flex-nowrap"
    >
      {/* 1. HORIZONTALLY EXPANDABLE CLIMATE WIDGET */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`flex items-center rounded-full border shadow-sm transition-colors duration-300 overflow-hidden ${
          isDarkMode
            ? "bg-stone-950/90 border-zinc-800/80 text-white"
            : "bg-white border-stone-200 text-stone-900"
        }`}
      >
        {/* Trigger Button component (Always Visible core state) */}
        <button
          onClick={handleToggleExpand}
          type="button"
          className="flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-mono tracking-wider font-extrabold focus:outline-none shrink-0"
        >
          <span className="flex items-center gap-1">
            {getWeatherIcon()}
            <span className="text-zinc-500 text-[9px]">JF:</span>
            <span className="text-green-400">{weather.temp}°C</span>
          </span>
          <span className="hidden sm:inline-block text-zinc-500 text-[10px] pl-1 font-sans">
            • {location.split(",")[0]}
          </span>
          <span className="text-xs text-pink-500">
            {isExpanded ? "◀" : "▶"}
          </span>
        </button>

        {/* Expandable Horizontal portion */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex items-center gap-3 px-3 border-l border-dashed border-zinc-800/40 shrink-0 select-none overflow-hidden"
            >
              {/* UTC Live clock and schedule */}
              <div className="flex items-center gap-2 text-[10px] font-mono shrink-0 whitespace-nowrap">
                <span className="text-zinc-400 capitalize">{formattedDate}</span>
                <span className="text-pink-400 font-bold">{formattedTime}</span>
              </div>

              {/* Climate descriptive badge */}
              <div className="hidden md:flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono shrink-0 border-l border-zinc-800/20 pl-2">
                <MapPin className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>{location}</span>
                <span className="text-zinc-500">({weather.condition})</span>
              </div>

              {/* Speed cities switcher inside expanded space */}
              <div className="flex items-center gap-1 border-l border-zinc-800/20 pl-2 shrink-0">
                {["Juiz de Fora", "Belo Horizonte", "Rio de Janeiro"].map((city) => (
                  <button
                    key={city}
                    onClick={() => handleCitySelect(city)}
                    className={`px-2 py-0.5 rounded-full text-[8px] font-mono uppercase transition ${
                      location.startsWith(city)
                        ? "bg-[#22c55e]/10 border border-green-500/40 text-green-500 font-bold"
                        : isDarkMode
                          ? "bg-transparent border border-transparent text-zinc-500 hover:text-white"
                          : "bg-transparent border border-transparent text-stone-600 hover:text-stone-950"
                    }`}
                  >
                    {city.split(" ")[0]}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 2. FACE & HAND NAVIGATION ACCESSIBILITY TRIGGERS & CLIENT USER ACCESS PANEL */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenHandNav && (
          <button
            onClick={() => {
              playClickSound(800, "sine");
              onOpenHandNav();
            }}
            type="button"
            title="Navegação por Mãos (Kinect)"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider transition ${
              isDarkMode
                ? "bg-stone-900/90 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
                : "bg-white border border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 shadow-xs"
            }`}
          >
            <Hand className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Mãos</span>
          </button>
        )}
        
        {onOpenFaceNav && (
          <button
            onClick={() => {
              playClickSound(800, "sine");
              onOpenFaceNav();
            }}
            type="button"
            title="Navegação por Face"
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider transition ${
              isDarkMode
                ? "bg-stone-900/90 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400"
                : "bg-white border border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 shadow-xs"
            }`}
          >
            <ScanFace className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">Rosto</span>
          </button>
        )}

        {user.isAuthenticated ? (
          <div className={`flex items-center gap-2 pl-2 pr-3 py-1 ${
            isDarkMode ? "bg-stone-900/90 border-zinc-800 text-white" : "bg-white border-stone-200 text-stone-900 shadow-md"
          } border rounded-full text-xs`}>
            <button
               className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
               onClick={() => {
                 playClickSound(600, "sine");
                 onOpenProfile();
               }}
            >
              {user.photoUrl ? (
                <img 
                  src={user.photoUrl} 
                  alt="user avatar" 
                  className="w-6 h-6 rounded-full border border-green-400 shadow"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={`w-6 h-6 rounded-full ${isDarkMode ? "bg-zinc-800 text-zinc-400" : "bg-stone-100 text-stone-600"} flex items-center justify-center`}>
                  <User className="w-3 h-3" />
                </div>
              )}
              <div className="flex flex-col text-left min-w-0 max-w-[85px] sm:max-w-[130px]">
                <span className={`text-[10px] ${isDarkMode ? "text-white" : "text-stone-900"} font-display font-medium leading-none tracking-tight truncate`}>
                  {user.isAdmin ? "👑 Admin" : user.name}
                </span>
                <span className={`text-[8px] ${isDarkMode ? "text-zinc-500" : "text-stone-500"} font-mono leading-none truncate`}>
                  {user.isAdmin ? "Administrador" : "Painel do Cliente"}
                </span>
              </div>
            </button>
            
            {/* Quick Sair icon */}
            <button
              onClick={() => {
                playClickSound(600, "sine");
                onLogout();
              }}
              title="Sair da Conta"
              className={`p-1 ${isDarkMode ? "text-zinc-500 hover:text-red-400" : "text-stone-500 hover:text-red-600"} transition`}
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              playClickSound(750, "sine");
              onTriggerLogin();
            }}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-display font-bold tracking-widest uppercase transition-all duration-300 ${
              isDarkMode 
                ? "bg-stone-950 border-green-500/50 hover:border-green-400 text-green-400 hover:text-white shadow" 
                : "bg-white border-green-600/50 hover:border-green-600 text-green-700 hover:text-green-950 shadow-md"
            } border hover:scale-105`}
            id="client-login-panel-trigger"
          >
            <Sparkles className="w-2.5 h-2.5 text-pink-500 animate-pulse" />
            <span>Painel do Cliente</span>
          </button>
        )}
      </div>
    </div>
  );
}
