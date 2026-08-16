import React from "react";
import { motion } from "motion/react";
import { ShieldAlert, Clock, LogOut, MessageCircle, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { AppUser } from "../types";
import { playClickSound } from "../utils/audio";

interface PendingApprovalScreenProps {
  user: AppUser;
  onLogout: () => void;
  onRefreshStatus?: () => void;
  supportWhatsapp?: string;
}

export default function PendingApprovalScreen({ user, onLogout, onRefreshStatus, supportWhatsapp }: PendingApprovalScreenProps) {
  // Official Portal WhatsApp number: +55 32 99194-7690
  let cleanDigits = (supportWhatsapp || "").replace(/\D/g, "");
  if (!cleanDigits || cleanDigits.includes("98412") || cleanDigits.includes("999999999") || cleanDigits.includes("99999")) {
    cleanDigits = "5532991947690";
  }
  const whatsappNumber = cleanDigits.startsWith("55") ? cleanDigits : `55${cleanDigits}`;
  const whatsappText = encodeURIComponent(`Olá! Meu e-mail é ${user.email} e fiz login no Portal Do Começo ao Topo. Gostaria de solicitar a aprovação/liberação do meu acesso.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-lg bg-stone-950 border border-amber-500/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] text-center relative overflow-hidden"
      >
        {/* Top glowing decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full mb-3">
          ⚡ Segurança Corporativa & Controle
        </span>

        <h2 className="font-display font-black text-xl text-white tracking-wide uppercase mb-3">
          Conta Em Análise / Período de Teste
        </h2>

        <p className="text-xs text-zinc-400 leading-relaxed font-mono max-w-md mx-auto mb-6">
          Olá, <strong className="text-white">{user.name || user.email}</strong>! Seu acesso foi registrado com sucesso, mas no momento sua conta está <span className="text-amber-400 font-bold">aguardando aprovação manual</span> da nossa Diretoria.
        </p>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-left space-y-2 mb-6 font-mono text-[11px] text-zinc-300">
          <div className="flex items-center gap-2 text-zinc-400">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Painel Financeiro e CMS estão bloqueados temporariamente.</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            <span>Nenhum perfil simulado ou atalho de teste permitido.</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Status atual: <strong className="text-amber-400 uppercase">Congelado / Aguardando Liberação</strong></span>
          </div>
        </div>

        {/* Action buttons - Notice NO dev/quick admin bypass buttons exist here! */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRefreshStatus && (
            <button
              onClick={() => {
                playClickSound(600, "sine");
                onRefreshStatus();
              }}
              className="w-full sm:w-auto px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-750 text-white font-mono text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-green-400" />
              <span>Verificar Status</span>
            </button>
          )}

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound(650, "sine")}
            className="w-full sm:w-auto px-5 py-3 bg-green-600 hover:bg-green-500 text-black font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-black" />
            <span>Solicitar Liberação via WhatsApp</span>
          </a>

          <button
            onClick={() => {
              playClickSound(400, "sine");
              onLogout();
            }}
            className="w-full sm:w-auto px-5 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair do Portal</span>
          </button>
        </div>

        <p className="text-[9px] text-zinc-600 font-mono mt-6">
          🛡️ Sistema de Controle de Usuários — Acesso restrito com aprovação manual.
        </p>
      </motion.div>
    </div>
  );
}
