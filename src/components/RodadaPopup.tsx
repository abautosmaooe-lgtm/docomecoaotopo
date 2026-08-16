import React from "react";
import { motion } from "motion/react";
import { X, ExternalLink } from "lucide-react";
import PositionableImage from "./PositionableImage";

interface RodadaPopupProps {
  onClose: () => void;
  isDirectEditingEnabled: boolean;
}

export default function RodadaPopup({ onClose, isDirectEditingEnabled }: RodadaPopupProps) {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 min-h-[100dvh] bg-black/95 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 15 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-[1254px] w-full max-h-[95vh] flex flex-col rounded-3xl overflow-y-auto overflow-x-hidden shadow-[0_0_80px_rgba(34,197,94,0.25)] bg-[#09090b] border border-green-500/30"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/70 hover:bg-red-500 text-white z-[2010] border border-white/20 hover:border-red-500 transition-all shadow-2xl backdrop-blur-sm group"
        >
          <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        
        <div className="relative w-full aspect-square bg-zinc-950 flex shadow-inner group">
             <PositionableImage
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80" 
                alt="Rodada de Negócios O Sósia Oficial do Vini Jr"
                className="w-full h-full object-contain"
                storageKey="popup-rodada-imagem-oficial"
                editable={isDirectEditingEnabled}
                referrerPolicy="no-referrer"
             />
             
             {isDirectEditingEnabled && (
               <div className="absolute top-2 left-2 pointer-events-none">
                  <span className="bg-pink-500/90 text-white px-2 py-1 rounded-md text-[9px] font-mono tracking-widest uppercase backdrop-blur-sm font-bold shadow-lg">
                    [MODO EDIÇÃO] CLIQUE NA IMAGEM PARA ALTERAR O BANNER DO POPUP
                  </span>
               </div>
             )}
        </div>

        <div className="bg-gradient-to-r from-green-900 to-emerald-950 p-4 border-t border-green-500/20 shrink-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-center sm:text-left">
                    <h3 className="font-display font-black text-white text-sm uppercase tracking-wider mb-0.5">Vem fazer parte!</h3>
                    <p className="font-mono text-[10px] text-green-300 uppercase tracking-widest">Transformando conexões em histórias</p>
                </div>
                <button 
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-400 text-black font-display font-black uppercase text-xs tracking-wider rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Confirmar <ExternalLink className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
