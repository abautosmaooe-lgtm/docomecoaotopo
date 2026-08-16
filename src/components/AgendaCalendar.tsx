import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar, X, RefreshCw, Star, Sparkles } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { NewsArticle } from "../types";
import { SPECIAL_DATES_CATALOG, SpecialCalendarDate } from "../data";

interface AgendaCalendarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  selectedDate: string | null; // Format "YYYY-MM-DD"
  onSelectDate: (date: string | null) => void;
  articles: NewsArticle[];
  isDarkMode?: boolean;
}

const MONTH_NAMES_PT = [
  "JANEIRO",
  "FEVEREIRO",
  "MARÇO",
  "ABRIL",
  "MAIO",
  "JUNHO",
  "JULHO",
  "AGOSTO",
  "SETEMBRO",
  "OUTUBRO",
  "NOVEMBRO",
  "DEZEMBRO"
];

const WEEKDAYS_PT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

export default function AgendaCalendar({
  selectedDate,
  onSelectDate,
  articles,
  isDarkMode = true,
  searchQuery = "",
  onSearchChange
}: AgendaCalendarProps) {
  // We can default the calendar view to August 2026 or current year/month
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  // Map special dates for quick lookup
  const specialDatesMap = new Map<string, SpecialCalendarDate>();
  SPECIAL_DATES_CATALOG.forEach((sd) => specialDatesMap.set(sd.dateStr, sd));

  // Get days in a month helper
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get index of first day of month (0: Sunday, 1: Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    playClickSound(550, "sine");
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    playClickSound(550, "sine");
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Build the array of slots for the 42-day calendar (6 rows x 7 columns)
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonthIndex);

  const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const calendarDays: {
    dayNum: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    dateStr: string;
  }[] = [];

  // 1. Fill previous month tail days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateStr = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    calendarDays.push({
      dayNum,
      month: prevMonthIndex,
      year: prevYear,
      isCurrentMonth: false,
      dateStr
    });
  }

  // 2. Fill current month days
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({
      dayNum: i,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true,
      dateStr
    });
  }

  // 3. Fill next month head days to complete the 42-cell calendar grid
  const remainingSlots = 42 - calendarDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    const dateStr = `${nextYear}-${String(nextMonthIndex + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    calendarDays.push({
      dayNum: i,
      month: nextMonthIndex,
      year: nextYear,
      isCurrentMonth: false,
      dateStr
    });
  }

  // Check which dates have articles associated with robust date parsing
  const datesWithArticles = new Set(
    articles.map((art) => {
      try {
        if (!art.date) return "";
        if (/^\d{4}-\d{2}-\d{2}/.test(art.date)) return art.date.substring(0, 10);
        const match = art.date.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
        if (match) return `${match[3]}-${match[2]}-${match[1]}`;
        const dt = new Date(art.date);
        if (!isNaN(dt.getTime())) return dt.toISOString().split("T")[0];
      } catch (e) {
        return "";
      }
      return "";
    }).filter(Boolean)
  );

  const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;

  const handleSelectDay = (dateStr: string) => {
    playClickSound(620, "sine");
    if (selectedDate === dateStr) {
      // Toggle off if clicking selected date again
      onSelectDate(null);
    } else {
      onSelectDate(dateStr);
      playSuccessSound();
    }
  };

  const handleResetFilter = () => {
    playClickSound(450, "sine");
    onSelectDate(null);
  };

  // Currently selected special date
  const selectedSpecialDate = selectedDate ? specialDatesMap.get(selectedDate) : null;

  return (
    <div 
      id="agenda-calendar-container" 
      className={`p-5 rounded-2xl border ${
        isDarkMode 
          ? "bg-black border-zinc-900 text-white shadow-xl shadow-black/60" 
          : "bg-white border-stone-200 text-stone-900 shadow-lg"
      } font-display`}
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-4">
        <div className="text-left">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-green-400 glow-text-pink flex items-center gap-2">
            <Calendar className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>Agenda & Filtro Temporal</span>
          </h3>
          <p className="text-[10px] text-zinc-500 font-mono">Filtre as pautas e coberturas da região</p>
        </div>

        {selectedDate && (
          <button
            onClick={handleResetFilter}
            className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-pink-500/15 border border-pink-500/30 text-pink-400 hover:bg-pink-500/30 transition active:scale-95 text-xs"
            title="Resetar filtro de data"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>MOSTRAR COMPLETO</span>
          </button>
        )}
        
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('sync-google-news-rss'));
          }}
          className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-[#22c55e]/15 border border-[#22c55e]/30 text-green-400 hover:bg-[#22c55e]/30 transition active:scale-95 text-xs ml-2"
          title="Buscar eventos no Google Notícias"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          <span>SINC. GOOGLE NEWS</span>
        </button>
      </div>


      {/* Search Input Filter */}
      {onSearchChange && (
        <div className="mb-4 pt-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔎 Buscar evento por nome ou descrição..."
            className={`w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-pink-500 transition ${
              isDarkMode 
                ? "bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600" 
                : "bg-stone-100 border-stone-200 text-stone-900 placeholder-stone-500"
            }`}
          />
        </div>
      )}
      
      <div className="space-y-4">
        {/* Month & Year header */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 px-2.5 rounded-lg border border-zinc-900/80 bg-zinc-950/60 hover:border-zinc-700/60 text-pink-500 transition active:scale-90"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-4 h-4 text-red-500" />
          </button>

          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-widest">
            <span className="text-white hover:text-green-400 transition cursor-default">
              {MONTH_NAMES_PT[currentMonth]}
            </span>
            <span className="text-zinc-600">▾</span>
            <span className="text-zinc-400">{currentYear}</span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 px-2.5 rounded-lg border border-zinc-900/80 bg-zinc-950/60 hover:border-zinc-700/60 text-pink-500 transition active:scale-90"
            title="Próximo Mês"
          >
            <ChevronRight className="w-4 h-4 text-red-500" />
          </button>
        </div>

        {/* Week headings */}
        <div className="grid grid-cols-7 gap-1 text-center border-b border-zinc-900/50 pb-2">
          {WEEKDAYS_PT.map((day) => (
            <span key={day} className="text-[9px] font-mono font-black text-zinc-400 uppercase">
              {day}
            </span>
          ))}
        </div>

        {/* Month Day grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarDays.map((cell, idx) => {
            const hasArticle = datesWithArticles.has(cell.dateStr);
            const specialDate = specialDatesMap.get(cell.dateStr);
            const isSelected = selectedDate === cell.dateStr;
            
            let cellTooltip = `Dia ${cell.dayNum}/${cell.month + 1}/${cell.year}`;
            if (specialDate) {
              cellTooltip = `🎉 ${specialDate.title} (${specialDate.category}) - ${specialDate.description}`;
            } else if (hasArticle) {
              cellTooltip = `📰 Notícias e matérias publicadas no dia ${cell.dayNum}/${cell.month + 1}/${cell.year}`;
            }

            return (
              <button
                key={`${cell.dateStr}-${idx}`}
                type="button"
                onClick={() => handleSelectDay(cell.dateStr)}
                className={`relative h-10 rounded-lg flex flex-col items-center justify-center transition border ${
                  isSelected
                    ? "border-pink-500 bg-pink-500/20 text-white font-black shadow-[0_0_12px_rgba(236,72,153,0.3)] scale-105 z-10"
                    : specialDate
                    ? "border-amber-500/50 bg-amber-950/30 text-amber-300 hover:bg-amber-900/40 hover:border-amber-400"
                    : hasArticle
                    ? "border-green-500/40 bg-green-950/20 text-white hover:bg-zinc-900"
                    : cell.isCurrentMonth
                    ? "border-transparent text-zinc-200 hover:bg-zinc-900 hover:text-white"
                    : "border-transparent text-zinc-700 hover:bg-zinc-950/30"
                }`}
                title={cellTooltip}
              >
                {/* Day number label */}
                <span className={`text-[11px] font-mono leading-none flex items-center gap-0.5 ${isSelected ? "text-pink-400 font-bold scale-105" : specialDate ? "text-amber-300 font-bold" : ""}`}>
                  {cell.dayNum}
                  {specialDate?.icon && <span className="text-[9px]">{specialDate.icon}</span>}
                </span>

                {/* Has article tiny indicator dot */}
                {hasArticle && !specialDate && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-green-400 shadow-[0_0_8px_rgba(34,197,94,1)]" : "bg-green-500/80"}`} />
                )}

                {/* Special date indicator dot */}
                {specialDate && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,1)]" : "bg-amber-400 animate-pulse"}`} />
                )}

                {/* Optional pulse on current date */}
                {cell.dateStr === todayStr && !isSelected && (
                  <span className="absolute inset-0 rounded-lg border border-pink-500/30 pointer-events-none animate-pulse"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected date overview card inside agenda */}
        <div className="pt-3 border-t border-zinc-900/60 flex flex-col justify-between gap-2 text-left">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-500" />
            Status de Filtro Temporal:
          </span>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs font-mono text-zinc-200 font-bold">
                {selectedDate 
                  ? `📅 ${selectedDate.split("-").reverse().join("/")}` 
                  : "🌟 TODAS AS DATAS ATIVAS"}
              </span>
              {selectedSpecialDate && (
                <span className="text-[10px] text-amber-400 font-sans font-semibold mt-0.5">
                  {selectedSpecialDate.icon} {selectedSpecialDate.title}
                </span>
              )}
            </div>
            {selectedDate && (
              <button
                onClick={handleResetFilter}
                className="text-[9px] font-mono text-pink-400 hover:text-pink-300 flex items-center gap-1 uppercase bg-pink-500/10 px-2 py-1 rounded border border-pink-500/20"
              >
                Limpar <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
