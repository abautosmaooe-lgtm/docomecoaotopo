import React, { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  DownloadCloud,
  Trash2,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Layers,
  Smartphone,
  Info,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { playClickSound, playSuccessSound } from "../utils/audio";
import {
  getOfflineStorageMetrics,
  setOfflineModeOverride,
  isOfflineModeActive,
  isOfflineOverridden,
  preCacheAllResources,
  clearAllOfflineCache,
  OfflineMetrics,
} from "../utils/offlineStorage";

interface OfflineAdminManagerProps {
  isDarkMode?: boolean;
}

export default function OfflineAdminManager({ isDarkMode = true }: OfflineAdminManagerProps) {
  const [metrics, setMetrics] = useState<OfflineMetrics | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isOfflineForced, setIsOfflineForced] = useState(false);

  const refreshMetrics = async () => {
    const data = await getOfflineStorageMetrics();
    setMetrics(data);
    setIsOfflineForced(isOfflineOverridden());
  };

  useEffect(() => {
    refreshMetrics();

    const handleOfflineChange = () => {
      refreshMetrics();
    };

    window.addEventListener("online", handleOfflineChange);
    window.addEventListener("offline", handleOfflineChange);
    window.addEventListener("portal_offline_changed", handleOfflineChange);

    return () => {
      window.removeEventListener("online", handleOfflineChange);
      window.removeEventListener("offline", handleOfflineChange);
      window.removeEventListener("portal_offline_changed", handleOfflineChange);
    };
  }, []);

  const handleToggleOffline = () => {
    playClickSound(650, "sine");
    const nextState = !isOfflineForced;
    setIsOfflineForced(nextState);
    setOfflineModeOverride(nextState);

    if (nextState) {
      toast.warning("Modo Offline Ativado! O portal agora roda estritamente com os recursos locais e cache.", {
        duration: 4000
      });
    } else {
      toast.success("Modo Online Restaurado! Conexão de rede restabelecida com o servidor.", {
        duration: 3500
      });
    }
    refreshMetrics();
  };

  const handleDownloadCache = async () => {
    playClickSound(550, "sine");
    setIsSyncing(true);
    toast.loading("Sincronizando e baixando cache offline completo...", { id: "offline-sync" });

    try {
      const result = await preCacheAllResources();
      playSuccessSound();
      toast.success(`Cache Offline 100% atualizado! Recursos armazenados com sucesso.`, {
        id: "offline-sync",
        duration: 4000
      });
    } catch (e) {
      toast.error("Houve uma instabilidade temporária ao atualizar o cache.", { id: "offline-sync" });
    } finally {
      setIsSyncing(false);
      refreshMetrics();
    }
  };

  const handleClearCache = async () => {
    if (!window.confirm("Deseja limpar os arquivos temporários do Cache Storage do navegador? Os dados salvos (notícias e membros) serão preservados no LocalStorage.")) {
      return;
    }
    playClickSound(400, "square");
    setIsClearing(true);
    await clearAllOfflineCache();
    toast.info("Cache Storage do navegador redefinido com sucesso.");
    setIsClearing(false);
    refreshMetrics();
  };

  const isActuallyOffline = isOfflineModeActive();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Banner / Status Overview */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isActuallyOffline 
          ? "bg-amber-950/30 border-amber-500/40 text-amber-200" 
          : "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-xl shrink-0 ${
              isActuallyOffline ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {isActuallyOffline ? <WifiOff className="w-6 h-6 animate-pulse" /> : <Wifi className="w-6 h-6" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display font-black text-base text-white tracking-wide">
                  {isActuallyOffline ? "Modo Offline Ativo" : "Portal 100% Conectado e Pronto para Uso Offline"}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isActuallyOffline ? "bg-amber-500 text-black" : "bg-emerald-500 text-black"
                }`}>
                  {isActuallyOffline ? "OFFLINE" : "ONLINE"}
                </span>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                {isActuallyOffline 
                  ? "O portal está operando sem conexão externa. Todas as notícias, membros, podcasts, fotos e páginas continuam 100% navegáveis por meio do banco de dados local (LocalStorage) e do cache PWA."
                  : "Todos os recursos cadastrados no painel administrativo são armazenados automaticamente no dispositivo para navegação sem internet."}
              </p>
            </div>
          </div>

          {/* Quick Action Toggle Button */}
          <div className="flex items-center gap-3 self-start md:self-center shrink-0">
            <button
              onClick={handleToggleOffline}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 border shadow-lg cursor-pointer ${
                isOfflineForced
                  ? "bg-amber-500 hover:bg-amber-400 text-black border-amber-400 ring-2 ring-amber-500/50"
                  : "bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {isOfflineForced ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
              <span>{isOfflineForced ? "Desativar Modo Offline" : "Ativar Modo Offline"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sincronização & Cache */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#22c55e] uppercase tracking-wider flex items-center gap-1.5">
                <DownloadCloud className="w-4 h-4" /> Cache PWA & Service Worker
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {metrics?.lastSyncTimestamp ? `Última sinc: ${metrics.lastSyncTimestamp}` : "Pronto"}
              </span>
            </div>
            <h4 className="font-bold text-sm text-white">Baixar / Atualizar Cache Completo</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Faz o pré-carregamento dos arquivos de aplicação, manifestos e fontes para garantir que o portal abra instantaneamente em qualquer dispositivo, mesmo sem sinal de internet ou no modo avião.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadCache}
              disabled={isSyncing}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-mono text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Sincronizando..." : "Sincronizar Cache Offline Agora"}</span>
            </button>
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              title="Limpar arquivos em cache"
              className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-800 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informações de Instalação PWA */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" /> Aplicativo Instalável (PWA)
            </span>
            <h4 className="font-bold text-sm text-white">Instalar no Celular ou Computador</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              No Chrome, Edge, Safari ou Android/iOS, clique em <strong>"Adicionar à Tela de Início"</strong> ou no ícone de instalar aplicativo na barra de endereços para ter o ícone oficial no seu celular.
            </p>
          </div>

          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Suporte Service Worker:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ativo e Operacional
            </span>
          </div>
        </div>
      </div>

      {/* Recurso a Recurso: Diagnóstico de Disponibilidade Offline */}
      <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">
              Diagnóstico de Recursos & Dados Locais
            </h4>
          </div>
          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
            Armazenamento Local: ~{metrics?.localStorageUsageKB || 0} KB
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 block font-bold">📰 Notícias & Artigos</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white font-display">{metrics?.totalArticlesCached || 0}</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
            </div>
            <p className="text-[10px] text-zinc-500">Persistidos no LocalStorage</p>
          </div>

          <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 block font-bold">👥 Comunidade de Membros</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white font-display">{metrics?.totalMembersCached || 0}</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
            </div>
            <p className="text-[10px] text-zinc-500">Perfis, WhatsApp e contatos</p>
          </div>

          <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 block font-bold">🎙️ Podcast & Entrevistas</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white font-display">Ativo</span>
              <span className="text-[10px] text-emerald-400 font-mono">Metadados</span>
            </div>
            <p className="text-[10px] text-zinc-500">Episódios & links integrados</p>
          </div>

          <div className="p-3.5 bg-zinc-900/40 rounded-xl border border-zinc-850 space-y-1">
            <span className="text-[10px] font-mono text-zinc-400 block font-bold">📍 Páginas Institucionais</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-white font-display">13 Páginas</span>
              <span className="text-[10px] text-emerald-400 font-mono">100% Offline</span>
            </div>
            <p className="text-[10px] text-zinc-500">Quem Somos, Cursos, Vagas...</p>
          </div>
        </div>

        {/* Explainability Callout */}
        <div className="p-3.5 bg-emerald-950/20 rounded-xl border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong>Como funciona o modo offline:</strong> Graças à arquitetura SPA e armazenamento client-side transparente do portal, todas as edições feitas no painel administrativo (novos posts, fotos, edições de membros, dados de contato e cores) ficam salvas diretamente no banco do navegador. Mesmo sem conexão de rede, os usuários continuam navegando pelas páginas, lendo matérias completas e pesquisando membros sem qualquer interrupção.
          </p>
        </div>
      </div>
    </div>
  );
}
