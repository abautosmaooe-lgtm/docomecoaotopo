import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  Layers, 
  Lock,
  Mic
} from "lucide-react";
import { CategoryType } from "../types";

interface FloatingMenuProps {
  currentCategory: string | null;
  onSelectCategory: (category: CategoryType | null) => void;
  onOpenSection: (section: string) => void;
  isCollapsed?: boolean;
}

interface MenuItemDef {
  label: string;
  action: "home" | "category" | "section" | "link";
  cat?: CategoryType | null;
  sectionId?: string;
  url?: string;
  isCategory?: boolean;
  isPremium?: boolean;
}

const MENU_ITEMS: MenuItemDef[] = [
  { label: "INÍCIO", action: "home", isCategory: true, cat: null },
  { label: "COMUNIDADE", action: "category", cat: "COMUNIDADE", isPremium: true },
  { label: "EVENTOS", action: "category", cat: "EVENTOS" },
  { label: "DEPOIMENTOS", action: "section", sectionId: "DEPOIMENTOS" },
  { label: "EMBAIXADORES", action: "category", cat: "EMBAIXADORES", isPremium: true },
  { label: "PARCEIROS", action: "section", sectionId: "PARCEIROS" },
  { label: "PODCAST", action: "category", cat: "PODCAST" },
  { label: "NOTÍCIAS", action: "category", cat: "NOTÍCIAS" },
  { label: "QUEM SOMOS", action: "section", sectionId: "QUEM SOMOS", isCategory: true, cat: "QUEM SOMOS" as CategoryType },
  { label: "OBJETIVOS", action: "section", sectionId: "OBJETIVOS" },
  { label: "ONDE ESTAMOS", action: "section", sectionId: "ONDE ESTAMOS" },
  { label: "CONTATO", action: "section", sectionId: "CONTATO" },
];

export default function FloatingMenu({
  currentCategory,
  onSelectCategory,
  onOpenSection,
  isCollapsed = false,
}: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isCollapsed) return null;

  const handleItemClick = (item: typeof MENU_ITEMS[0]) => {
    setIsOpen(false);
    if (item.action === "home") {
      onSelectCategory(null);
    } else if (item.action === "link" && item.url) {
      window.open(item.url, "_blank");
    } else if (item.action === "category" && item.cat) {
      onSelectCategory(item.cat as CategoryType);
    } else if (item.action === "section") {
      if (item.cat) {
        onSelectCategory(item.cat as CategoryType);
      }
      if (item.sectionId) {
        onOpenSection(item.sectionId);
      }
    }
  };

  return (
    <div id="floating-menu" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: 50 }}
            transition={{ type: "spring", damping: 20 }}
            className="absolute bottom-20 right-0 w-[340px] max-w-[calc(100vw-2rem)] bg-stone-950/95 border-2 border-green-500 rounded-3xl p-5 shadow-[0_0_20px_rgba(34,197,94,0.15)] overflow-hidden"
          >
            {/* Cyber Matrix Background Deco */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/60 to-emerald-700/60"></div>
            
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-400" />
                <span className="font-display font-black text-xs tracking-widest text-[#22c55e]">
                  MAX NAVEGAÇÃO
                </span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500">v3.5 NEON</span>
            </div>

            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-3">
              FILTRAR OU ACESSAR SEÇÕES:
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
              {MENU_ITEMS.map((item, idx) => {
                const isSelected =
                  (item.action === "home" && currentCategory === null) ||
                  (item.action === "category" && currentCategory === item.cat) ||
                  (item.action === "section" && item.cat && currentCategory === item.cat);

                return (
                  <button
                    key={idx}
                    onClick={() => handleItemClick(item)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition relative overflow-hidden group ${
                      isSelected
                        ? "bg-green-500/15 border-green-400 text-white"
                        : "bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/90"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-display font-bold text-xs tracking-tight group-hover:text-green-400 transition">
                        {item.label}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-pink-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
                    {item.isPremium && (
                      <span className="mt-1 text-[8px] bg-pink-500/20 text-pink-400 border border-pink-500/30 px-1 rounded-sm font-mono font-bold tracking-wider">
                        EXCLUSIVO <Lock className="w-2.5 h-2.5 inline" />
                      </span>
                    )}
                    {!item.isPremium && (
                      <span className="mt-1 text-[8px] text-zinc-500 font-mono">
                        {item.action === "category" ? "Filtro Feed" : "Seção Dinâmica"}
                      </span>
                    )}
                    {/* Tiny neon gradient glow on selected */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">
                Portais Locais & Cultura
              </span>
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-black/40 backdrop-blur-md text-green-400 border-2 border-green-400 hover:text-white hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] transition duration-300 focus:outline-none shadow-[0_4px_20px_rgba(34,197,94,0.2)]"
      >
        {isOpen ? <X className="w-6 h-6 text-pink-500" /> : <Menu className="w-6 h-6 text-green-400" />}
      </motion.button>
    </div>
  );
}
