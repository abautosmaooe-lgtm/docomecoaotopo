import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, X, Sparkles, Volume2, Search, HelpCircle, AlertCircle } from "lucide-react";
import { playClickSound, playSuccessSound, playNegativeSound } from "../utils/audio";

interface VoiceSearchButtonProps {
  onSearch: (term: string) => void;
  isDarkMode: boolean;
}

export default function VoiceSearchButton({ onSearch, isDarkMode }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedQuery, setDetectedQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const triggerBeep = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context blocked", e);
    }
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("O seu navegador não suporta a API de Reconhecimento de Voz. Experimente usar o Chrome ou Edge.");
      playNegativeSound();
      return;
    }

    try {
      setErrorMsg("");
      setTranscript("");
      setDetectedQuery("");
      playClickSound(500, "sine");
      triggerBeep(600);

      const rec = new SpeechRecognition();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      rec.continuous = !isMobile; // Mobile browsers work much better with continuous=false
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = "pt-BR";

      rec.onstart = () => {
        setIsListening(true);
        resetTimeout();
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === "not-allowed" || e.error === "permission-denied") {
          setErrorMsg("Permissão de microfone negada. Toque no cadeado ao lado do endereço e permita o microfone.");
        } else if (e.error === "no-speech") {
          // Soft ignore silence on mobile instead of crashing
        } else if (e.error === "network") {
          setErrorMsg("Verifique sua conexão com a internet para usar o reconhecimento de voz.");
        } else if (e.error !== "aborted") {
          setErrorMsg("Ocorreu um erro ao ouvir: " + e.error);
        }
        playNegativeSound();
        handleStopListening();
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        resetTimeout();
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }

        if (currentTranscript.trim()) {
          setTranscript(currentTranscript);
          parseAndSearch(currentTranscript);
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Falha ao inicializar microfone.");
      playNegativeSound();
      setIsListening(false);
    }
  };

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setErrorMsg("Tempo limite excedido. Nenhuma instrução detectada.");
      playNegativeSound();
      handleStopListening();
    }, 15000); // 15 seconds max silence limit
  };

  const handleStopListening = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListening(false);
  };

  const parseAndSearch = (text: string) => {
    const rawText = text.toLowerCase();
    
    // Command variations to trigger voice search
    const triggers = [
      "topina, buscar por",
      "topina buscar por",
      "topina, busca por",
      "topina busca por",
      "topina, busque por",
      "topina busque por",
      "topina, pesquisar por",
      "topina pesquisar por",
      "topina, procure por",
      "topina procure por",
      "topina, pesquise",
      "topina pesquise",
      "topina, buscar",
      "topina buscar",
      "topina, busca",
      "topina busca",
      "topina",
      "buscar por",
      "busca por",
      "busque por",
      "pesquisar por",
      "pesquise por",
      "procurar por",
      "procure por",
      "buscar",
      "pesquisar",
      "procurar"
    ];

    let query = "";
    for (const prefix of triggers) {
      const idx = rawText.indexOf(prefix);
      if (idx !== -1) {
        const extracted = text.substring(idx + prefix.length).trim();
        const cleaned = extracted.replace(/^[ ,:;-]+/, "").replace(/[.?]$/, "").trim();
        if (cleaned.length > 0) {
          query = cleaned;
          break;
        }
      }
    }

    // If user spoke any clear phrase without specific keywords, treat full spoken text as search query directly
    if (!query && text.trim().length >= 2) {
      query = text.trim().replace(/[.?]$/, "").trim();
    }

    if (query.length > 0) {
      setDetectedQuery(query);
      triggerBeep(900);
      setTimeout(() => {
        playSuccessSound();
        onSearch(query);
        handleStopListening();
      }, 700);
    }
  };

  return (
    <>
      {/* Microphone trigger button placed aligned nicely onto the navbar */}
      <button
        onClick={() => {
          if (isListening) {
            handleStopListening();
          } else {
            startSpeechRecognition();
          }
        }}
        className={`p-2.5 rounded-full border flex items-center justify-center transition-all relative ${
          isListening
            ? "border-red-500 bg-red-500/20 text-red-500 hover:bg-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            : isDarkMode
                ? "border-zinc-805 bg-stone-950 text-green-400 hover:text-white hover:border-green-400"
                : "border-stone-200 bg-white text-stone-700 hover:text-pink-650 hover:border-pink-500"
        } cursor-pointer shadow-sm`}
        title="Busca por Comando de Voz (Topina)"
        id="voice-search-trigger-btn"
      >
        {isListening ? (
          <>
            <Mic className="w-4 h-4 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Floating high-fidelity Assistive HUD */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4 pt-16"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-lg rounded-3xl p-6 border shadow-[0_24px_48px_rgba(0,0,0,0.8)] ${
                isDarkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-stone-200 text-stone-900"
              } relative overflow-hidden`}
            >
              {/* Decorative accent background glows */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-500 via-pink-500 to-green-500 animate-pulse" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={handleStopListening}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${
                  isDarkMode ? "hover:bg-zinc-900 text-zinc-400" : "hover:bg-stone-100 text-stone-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-3">
                {/* Pulse wave animation avatar of Topina AI */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping pointer-events-none scale-150 opacity-40" />
                  <div className="absolute inset-0 bg-pink-500/20 rounded-full animate-pulse pointer-events-none scale-125 opacity-60" />
                  <img
                    src="https://i.ibb.co/PsLjkWnX/topina.png"
                    alt="Topina"
                    className="w-20 h-20 rounded-full border-4 border-green-500 relative z-10 shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-red-500 rounded-full border-2 border-zinc-950 flex items-center justify-center z-20">
                    <Volume2 className="w-3 h-3 text-white animate-bounce" />
                  </div>
                </div>

                <h3 className="font-display font-black text-lg uppercase tracking-wider bg-gradient-to-r from-green-400 to-pink-400 bg-clip-text text-transparent">
                  Topina Comando de Voz
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest mt-1">
                  CONTROLE POR WEB SPEECH API
                </p>

                {/* Micro instructions */}
                <div className={`mt-4 px-4 py-2 rounded-2xl flex items-center gap-2 border text-left ${
                  isDarkMode ? "bg-zinc-900/60 border-zinc-800" : "bg-stone-50 border-stone-200"
                }`}>
                  <HelpCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <div className="text-[10.5px]">
                    <span className="font-bold">Como funciona:</span> Diga pausadamente <span className="text-pink-500 font-black">"Topina, buscar por [sua busca]"</span> para pesquisar notícias e eventos automaticamente.
                  </div>
                </div>

                {/* Sound wave visualizer */}
                <div className="flex items-center gap-1.5 h-10 my-6">
                  {[...Array(9)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-green-500 rounded-full"
                      animate={{
                        height: [12, 40, 16, 28, 8][i % 5],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6 + (i * 0.1),
                        repeatType: "reverse",
                      }}
                    />
                  ))}
                </div>

                {/* Live Transcript / Feedback Box */}
                <div className={`w-full p-4 rounded-2xl mb-4 min-h-[80px] flex flex-col justify-center border ${
                  detectedQuery 
                    ? "bg-green-500/10 border-green-500/30" 
                    : isDarkMode 
                      ? "bg-stone-900 border-zinc-800" 
                      : "bg-stone-100 border-stone-200"
                }`}>
                  {detectedQuery ? (
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-green-400 flex flex-col items-center gap-1"
                    >
                      <Sparkles className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-bold font-mono">Busca detectada com sucesso!</span>
                      <p className="text-sm font-black italic mt-1 font-display">"{detectedQuery}"</p>
                    </motion.div>
                  ) : transcript ? (
                    <div>
                      <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono mb-1">Ouvindo agora ...</p>
                      <p className={`text-sm italic font-display font-medium ${isDarkMode ? "text-white" : "text-zinc-800"}`}>
                        "{transcript}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">
                      Diga algo como: <br /> <span className="font-bold text-green-400">"Topina, buscar por Empreendedorismo"</span>
                    </p>
                  )}
                </div>

                {/* Quick examples pill navigation */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                  <span className="text-[9px] text-zinc-500 font-mono uppercase mr-1">Exemplos:</span>
                  {["Notícias", "Finanças Digital", "Juiz de Fora"].map((ex) => (
                    <button
                      key={ex}
                      onClick={() => {
                        triggerBeep(800);
                        setTimeout(() => {
                          playSuccessSound();
                          onSearch(ex);
                          handleStopListening();
                        }, 200);
                      }}
                      className={`px-2.5 py-1 text-[9.5px] rounded-full font-mono border hover:border-green-400 transition-colors ${
                        isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-stone-50 border-stone-200 text-zinc-600"
                      }`}
                    >
                      "{ex}"
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Error Bar in Case Web Speech API is not supported / allowed */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-[99999]"
          >
            <div className="bg-red-950 border border-red-500/30 text-red-200 p-4 rounded-2xl shadow-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-xs">Erro de Comando de Voz</h4>
                <p className="text-[11px] text-red-300/80 mt-1 leading-relaxed">{errorMsg}</p>
                <button
                  onClick={() => setErrorMsg("")}
                  className="mt-2 text-[10px] text-red-400 font-mono hover:underline font-bold"
                >
                  FECHAR AVISO
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
