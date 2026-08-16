import React, { useState, useEffect } from 'react';
import { Play, Music, Radio, Settings, X, ExternalLink, CheckCircle, Info, Sparkles, ChevronUp, ChevronDown, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function parseSpotifyEmbedUrl(inputUrl: string): string | null {
  if (!inputUrl || typeof inputUrl !== 'string') return null;
  const trimmed = inputUrl.trim();

  if (trimmed.includes('open.spotify.com/embed/')) {
    return trimmed;
  }

  // Web URL matcher
  const matchWeb = trimmed.match(/open\.spotify\.com\/(playlist|show|episode|track|album)\/([a-zA-Z0-9]+)/);
  if (matchWeb) {
    const type = matchWeb[1];
    const id = matchWeb[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // URI matcher
  const matchUri = trimmed.match(/spotify:(playlist|show|episode|track|album):([a-zA-Z0-9]+)/);
  if (matchUri) {
    const type = matchUri[1];
    const id = matchUri[2];
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  return null;
}

const DEFAULT_SPOTIFY_URL = "https://open.spotify.com/embed/playlist/0xdqh3uHj4BscUS1X2KrKg?utm_source=generator&si=e18dc426a5644179";

export const SpotifyPlayer: React.FC = () => {
  const [spotifyUrl, setSpotifyUrl] = useState<string>(() => {
    const saved = localStorage.getItem("spotify_embed_url");
    if (!saved || saved.includes("37i9dQZF1DXcBWIGoYBM5M")) {
      localStorage.setItem("spotify_embed_url", DEFAULT_SPOTIFY_URL);
      return DEFAULT_SPOTIFY_URL;
    }
    return saved;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [activeTab, setActiveTab] = useState<'embed' | 'api'>('embed');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const embedUrl = parseSpotifyEmbedUrl(spotifyUrl) || parseSpotifyEmbedUrl(DEFAULT_SPOTIFY_URL);

  useEffect(() => {
    setInputUrl(spotifyUrl);
  }, [spotifyUrl]);

  const handleSaveUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const parsed = parseSpotifyEmbedUrl(inputUrl);
    if (!parsed) {
      setErrorMsg("Link do Spotify inválido. Certifique-se de colar um link no formato 'https://open.spotify.com/playlist/...' ou 'https://open.spotify.com/show/...'");
      return;
    }

    setSpotifyUrl(inputUrl);
    localStorage.setItem("spotify_embed_url", inputUrl);
    setSuccessMsg("Playlist do Spotify conectada com sucesso!");
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessMsg("");
    }, 1200);
  };

  const handleCopySample = (sample: string) => {
    setInputUrl(sample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-black border-t border-zinc-900 w-full relative z-30 transition-all duration-300">
      
      {/* HEADER / BARRA COMPACTA DO SPOTIFY */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* BOTÃO DE PLAY COM ANIMAÇÃO PULSE DO FRAMER-MOTION SE PAUSADO / RECOLHIDO */}
          <motion.button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            animate={
              !isExpanded
                ? {
                    scale: [1, 1.12, 1],
                    boxShadow: [
                      "0 0 0px rgba(29,185,84,0)",
                      "0 0 20px rgba(29,185,84,0.7)",
                      "0 0 0px rgba(29,185,84,0)",
                    ],
                  }
                : { scale: 1, boxShadow: "0 0 0px rgba(0,0,0,0)" }
            }
            transition={
              !isExpanded
                ? {
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut",
                  }
                : { duration: 0.2 }
            }
            className="w-10 h-10 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/50 flex items-center justify-center shrink-0 hover:bg-[#1DB954]/30 transition-colors group cursor-pointer"
            title={isExpanded ? "Ocultar Player" : "Tocar / Expandir Spotify Player"}
          >
            <Play className={`w-4 h-4 text-[#1DB954] fill-[#1DB954] transition-transform group-hover:scale-110 ${!isExpanded ? "ml-0.5" : ""}`} />
          </motion.button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-bold tracking-tight">Spotify Player Oficial</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                {spotifyUrl ? "Conectado" : "Demo"}
              </span>
            </div>
            <div className="text-zinc-400 text-[11px] truncate max-w-md">
              Acompanhe episódios do podcast e playlists diretamente no portal
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-[#1DB954]" />
            <span>{isExpanded ? "Ocultar Player" : "Expandir Player"}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          <button 
            onClick={() => {
              setInputUrl(spotifyUrl);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(29,185,84,0.3)] hover:scale-105"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Conectar Spotify</span>
          </button>
        </div>
      </div>

      {/* EMBED PLAYER EXPANDÍVEL */}
      <AnimatePresence>
        {isExpanded && embedUrl && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-zinc-900 bg-zinc-950/80 backdrop-blur overflow-hidden px-4 py-3"
          >
            <div className="max-w-7xl mx-auto">
              <iframe 
                data-testid="embed-iframe"
                src={embedUrl}
                width="100%" 
                height="352" 
                frameBorder="0" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                allowFullScreen
                loading="lazy"
                style={{ borderRadius: "12px" }}
                className="shadow-2xl border border-zinc-800/80 w-full"
                title="Spotify Embed Player"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL PARA CONECTAR E CONFIGURAR SPOTIFY */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-white"
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1DB954] text-black flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Conectar Playlist ou Podcast do Spotify</h3>
                    <p className="text-xs text-zinc-400">Insira sua playlist, programa ou faixa favorita do Spotify no portal</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs de Configuração */}
              <div className="flex border-b border-zinc-800 bg-zinc-950/30">
                <button 
                  onClick={() => setActiveTab('embed')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'embed' 
                      ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/5' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>1. Link Direto / Embed (Sem Senha)</span>
                </button>
                <button 
                  onClick={() => setActiveTab('api')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'api' 
                      ? 'border-[#1DB954] text-[#1DB954] bg-[#1DB954]/5' 
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  <span>2. API Oficial Spotify (Desenvolvedores)</span>
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 space-y-5">
                
                {activeTab === 'embed' ? (
                  <form onSubmit={handleSaveUrl} className="space-y-5">
                    
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
                        Cole aqui o Link ou URI do Spotify:
                      </label>
                      <div className="relative">
                        <input 
                          type="text" 
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M ou https://open.spotify.com/show/..."
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all"
                        />
                        {inputUrl && (
                          <button
                            type="button"
                            onClick={() => setInputUrl("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                          >
                            Limpar
                          </button>
                        )}
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
                        <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span>{successMsg}</span>
                      </div>
                    )}

                    {/* Guia Visual de como pegar o link */}
                    <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 text-xs space-y-2">
                      <div className="font-bold text-zinc-300 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-[#1DB954]" />
                        <span>Como pegar o link no aplicativo do Spotify:</span>
                      </div>
                      <ol className="list-decimal list-inside text-zinc-400 space-y-1 pl-1">
                        <li>Abra o Spotify no celular ou computador.</li>
                        <li>Vá até a **Playlist**, **Podcast/Show** ou **Álbum** desejado.</li>
                        <li>Clique nos três pontinhos **(...)** ou no botão de **Compartilhar**.</li>
                        <li>Selecione **Compartilhar** → **Copiar Link**.</li>
                        <li>Cole o link no campo acima e clique em **Salvar e Exibir Player**.</li>
                      </ol>
                    </div>

                    {/* Exemplos de Teste Rápido */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Testar Links de Exemplo:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopySample("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")}
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                        >
                          <span>🎵 Playlist Top Hits Brasil</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopySample("https://open.spotify.com/show/4r3bABC")}
                          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1.5 transition-colors"
                        >
                          <span>🎙️ Podcast Exemplo</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button 
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar e Exibir Player</span>
                      </button>
                    </div>

                  </form>
                ) : (
                  <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Settings className="w-4 h-4 text-[#1DB954]" />
                        <span>Instruções para Autenticação via API do Spotify (OAuth2)</span>
                      </div>
                      <p className="text-zinc-400">
                        Se você deseja criar integrações avançadas (como listar suas músicas mais ouvidas em tempo real, ler dados privados da sua conta ou controlar a reprodução via código), é necessário cadastrar uma aplicação no **Spotify Developer Dashboard**.
                      </p>

                      <div className="space-y-2 pt-2">
                        <div className="font-bold text-zinc-200">Passo a Passo para Desenvolvedores:</div>
                        <ol className="list-decimal list-inside space-y-1 text-zinc-400 pl-1">
                          <li>Acesse o site <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-[#1DB954] underline hover:text-[#1ed760]">developer.spotify.com/dashboard</a>.</li>
                          <li>Faça login com sua conta do Spotify e clique em **Create an App**.</li>
                          <li>Defina o nome do seu app (ex: "Portal Do Começo ao Topo").</li>
                          <li>No campo **Redirect URIs**, adicione a URL da sua aplicação (ex: <code className="text-pink-400 bg-zinc-900 px-1 py-0.5 rounded">{window.location.origin}/api/spotify/callback</code>).</li>
                          <li>Copie o seu **Client ID** e **Client Secret** e adicione nas variáveis de ambiente do seu servidor.</li>
                        </ol>
                      </div>
                    </div>

                    <div className="p-3 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-xl text-[#1DB954] flex items-center justify-between">
                      <span>Dica: O modo "1. Link Direto / Embed" não necessita de nenhuma chave de API e funciona para 100% dos usuários do portal!</span>
                      <button 
                        onClick={() => setActiveTab('embed')}
                        className="px-3 py-1 rounded-lg bg-[#1DB954] text-black font-bold hover:bg-[#1ed760] transition-colors shrink-0 text-[11px]"
                      >
                        Usar Modo Embed
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
