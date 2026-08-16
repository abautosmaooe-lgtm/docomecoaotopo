import React, { useState, useEffect } from "react";
import { Cloud, CloudSun, Sun, CloudRain, MapPin, Compass, RefreshCw } from "lucide-react";

interface WeatherWidgetProps {
  isDarkMode: boolean;
}

export default function WeatherWidget({ isDarkMode }: WeatherWidgetProps) {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState("Juiz de Fora, MG");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState({
    temp: 23,
    condition: "Parcialmente Nublado",
    humidity: 74,
    wind: "12 km/h",
    type: "cloudy", // 'clear' | 'cloudy' | 'rainy'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchGeoLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Simulation of reverse geocoding to make it incredibly real!
          setTimeout(() => {
            setLocation("Sua Localização (MG)");
            setWeather({
              temp: 24,
              condition: "Ensolarado & Tecnológico",
              humidity: 62,
              wind: "9 km/h",
              type: "clear",
            });
            setLoading(false);
          }, 1000);
        },
        (error) => {
          console.log("Locating error: ", error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    switch (weather.type) {
      case "clear":
        return <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />;
      case "rainy":
        return <CloudRain className="w-5 h-5 text-pink-400 animate-bounce" />;
      default:
        return <CloudSun className="w-5 h-5 text-green-400" />;
    }
  };

  return (
    <div
      id="weather-widget-container"
      className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border ${
        isDarkMode
          ? "bg-stone-950/90 border-zinc-800 text-white"
          : "bg-stone-100 border-stone-200 text-stone-900"
      } text-xs font-sans tracking-wide transition-all`}
    >
      {/* Time and Date */}
      <div className="flex items-center gap-3">
        <div id="widget-datetime" className="flex flex-col">
          <span className="font-semibold text-zinc-400 uppercase tracking-widest text-[10px]">
            {time.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            })}
          </span>
          <span className="font-mono text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-pink-500">
            {time.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Geolocation Status */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-400 animate-pulse" />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold">
            <span>{location}</span>
            <button
              onClick={fetchGeoLocation}
              disabled={loading}
              title="Detectar Localização Real"
              className="p-1 hover:text-pink-500 rounded transition duration-200"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-pink-500" : "text-zinc-400"}`} />
            </button>
          </div>
          <span className="text-zinc-400 text-[10px] uppercase">Portal Oficial de Negócios</span>
        </div>
      </div>

      {/* Weather details */}
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800 flex items-center justify-center">
          {getWeatherIcon()}
        </div>
        <div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-sm text-transparent bg-clip-text bg-gradient-to-r from-white to-stone-300">
              {weather.temp}°C
            </span>
            <span className="text-zinc-500 font-mono">/ {weather.condition}</span>
          </div>
          <div className="flex gap-2 text-[10px] text-zinc-400 font-mono">
            <span>Umidade: {weather.humidity}%</span>
            <span>Vento: {weather.wind}</span>
          </div>
        </div>
      </div>

      {/* Custom Selector for other cities */}
      <div className="flex gap-1">
        {["Juiz de Fora", "Belo Horizonte", "Rio de Janeiro"].map((city) => (
          <button
            key={city}
            onClick={() => {
              setLocation(`${city}, ${city === "Rio de Janeiro" ? "RJ" : "MG"}`);
              const randTemp = Math.floor(Math.random() * 10) + 18;
              const types = ["clear", "cloudy", "rainy"];
              const conditions = ["Ensolarado", "Nublado Neon", "Chuva Moderada"];
              const ri = Math.floor(Math.random() * 3);
              setWeather({
                temp: randTemp,
                condition: conditions[ri],
                humidity: Math.floor(Math.random() * 30) + 50,
                wind: `${Math.floor(Math.random() * 15) + 5} km/h`,
                type: types[ri],
              });
            }}
            className={`px-2 py-1 rounded text-[9px] font-mono border transition ${
              location.startsWith(city)
                ? "bg-green-500/10 border-green-400/50 text-green-400 font-semibold"
                : "bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            {city.split(" ")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
