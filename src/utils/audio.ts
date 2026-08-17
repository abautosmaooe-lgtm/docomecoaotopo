let audioCtx: AudioContext | null = null;

export function setSoundEnabled(enabled: boolean) {
  if (typeof window !== "undefined") {
    localStorage.setItem("sound_enabled", enabled ? "true" : "false");
  }
}

export function isSoundEnabled(): boolean {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("sound_enabled");
    return stored === null ? true : stored === "true";
  }
  return true;
}

export function playClickSound(freq: number = 800, type: OscillatorType = "sine") {
  if (!isSoundEnabled()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.4, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    // Graceful fallback if block rules apply
  }
}

export function playSuccessSound() {
  if (!isSoundEnabled()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const t = audioCtx.currentTime;
    
    const playNote = (freq: number, delay: number, duration: number) => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + delay);
      gainNode.gain.setValueAtTime(0.05, t + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + delay + duration);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start(t + delay);
      osc.stop(t + delay + duration);
    };
    
    playNote(659.25, 0, 0.1);     // E5
    playNote(880.00, 0.06, 0.1);    // A5
    playNote(1046.50, 0.12, 0.2);   // C6
  } catch (e) {
    // Graceful fallback
  }
}

export function playNegativeSound() {
  if (!isSoundEnabled()) return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.25);
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
  } catch (e) {
    // Graceful fallback
  }
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
}

export function isNeuralVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return (
    name.includes("natural") ||
    name.includes("neural") ||
    name.includes("online") ||
    name.includes("google") ||
    name.includes("enhanced") ||
    name.includes("premium") ||
    name.includes("wavenet") ||
    name.includes("francisca") ||
    name.includes("thalita") ||
    name.includes("brenda") ||
    name.includes("leticia") ||
    name.includes("yaris")
  );
}

export function isPtBrVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = (voice.lang || "").toLowerCase().replace("_", "-");
  return lang.startsWith("pt-br") || lang === "pt" || lang.startsWith("pt");
}

export function getVoiceDisplayName(voice: SpeechSynthesisVoice): string {
  const isNeural = isNeuralVoice(voice);
  const isPt = isPtBrVoice(voice);
  let baseName = voice.name
    .replace(/Microsoft /gi, "")
    .replace(/Google /gi, "")
    .replace(/Apple /gi, "")
    .replace(/Online \(Natural\) - /gi, "")
    .replace(/ - Portuguese \(Brazil\)/gi, "")
    .replace(/\(pt-BR\)/gi, "")
    .trim();

  let tag = "";
  if (isNeural && isPt) {
    tag = " ⚡ Neural PT-BR";
  } else if (isPt) {
    tag = " 🇧🇷 PT-BR";
  } else if (isNeural) {
    tag = " ⚡ Neural";
  }

  return `${baseName}${tag}`;
}

export function getAvailableFemaleVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  const maleKeywords = [
    "daniel", "felipe", "antonio", "helio", "ricardo", "mario", "manuel",
    "male", "david", "george", "gabriel", "joao", "tiago", "lucas", "pedro",
    "bruno", "paulo", "gustavo", "marcos", "andre", "diego", "rodrigo",
    "thiago", "carlos", "alexandre", "guilherme", "eduardo", "fernando",
    "vitor", "renato", "vinicius", "rafael"
  ];

  const filtered = voices.filter((v) => {
    const nameLower = v.name.toLowerCase();
    const isMale = maleKeywords.some((kw) => nameLower.includes(kw));
    return !isMale;
  });

  // Sort prioritizing PT-BR Neural voices at the top
  return filtered.sort((a, b) => {
    const aIsPtBr = (a.lang || "").toLowerCase().includes("pt-br");
    const bIsPtBr = (b.lang || "").toLowerCase().includes("pt-br");
    const aIsPt = (a.lang || "").toLowerCase().startsWith("pt");
    const bIsPt = (b.lang || "").toLowerCase().startsWith("pt");
    const aIsNeural = isNeuralVoice(a);
    const bIsNeural = isNeuralVoice(b);

    // 1. PT-BR Neural
    if (aIsPtBr && aIsNeural && !(bIsPtBr && bIsNeural)) return -1;
    if (bIsPtBr && bIsNeural && !(aIsPtBr && aIsNeural)) return 1;

    // 2. PT-BR standard
    if (aIsPtBr && !bIsPtBr) return -1;
    if (bIsPtBr && !aIsPtBr) return 1;

    // 3. Other Portuguese Neural
    if (aIsPt && aIsNeural && !(bIsPt && bIsNeural)) return -1;
    if (bIsPt && bIsNeural && !(aIsPt && aIsNeural)) return 1;

    // 4. Other Portuguese
    if (aIsPt && !bIsPt) return -1;
    if (bIsPt && !aIsPt) return 1;

    // 5. Neural any language
    if (aIsNeural && !bIsNeural) return -1;
    if (bIsNeural && !aIsNeural) return 1;

    return a.name.localeCompare(b.name);
  });
}

export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/[*#_~`>]/g, "") // Remove markdown asterisks, hashes, backticks, blockquotes
    .replace(/https?:\/\/\S+/gi, "link no portal") // Replace full URLs with friendly phrase
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace markdown links [text](url) with just text
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

export function speakWithFemaleVoice(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void,
  options?: { pitch?: number; rate?: number; voiceName?: string }
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.();
    return null;
  }

  const synth = window.speechSynthesis;
  try {
    synth.cancel();
  } catch (e) {
    // Ignore cancel errors
  }

  const cleanedText = cleanTextForSpeech(text);
  if (!cleanedText) {
    onEnd?.();
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = "pt-BR";

  const setVoice = () => {
    const voices = synth.getVoices();
    if (voices.length === 0) return;

    if (options?.voiceName) {
      const explicit = voices.find((v) => v.name === options.voiceName);
      if (explicit) {
        utterance.voice = explicit;
        utterance.lang = explicit.lang || "pt-BR";
        return;
      }
    }

    // Top preferred Neural Female PT-BR voices
    const neuralFemaleKeywords = [
      "francisca", "thalita", "brenda", "leticia", "yaris", "luciana",
      "maria", "joana", "helena", "yasmin", "vitoria", "victoria", "daniela", "samantha"
    ];

    const ptBrVoices = voices.filter((v) => {
      const lang = (v.lang || "").toLowerCase().replace("_", "-");
      return lang.startsWith("pt-br") || lang === "pt";
    });

    const candidatePool = ptBrVoices.length > 0 ? ptBrVoices : voices;

    // 1. Look for Neural / Natural PT-BR Female Voice
    let chosen = candidatePool.find((v) => {
      const nameLower = v.name.toLowerCase();
      const isNeural = isNeuralVoice(v);
      const isFemale = neuralFemaleKeywords.some((kw) => nameLower.includes(kw));
      return isNeural && isFemale;
    });

    // 2. Look for any PT-BR Female Voice
    if (!chosen) {
      chosen = candidatePool.find((v) => {
        const nameLower = v.name.toLowerCase();
        return neuralFemaleKeywords.some((kw) => nameLower.includes(kw));
      });
    }

    // 3. Look for Google Portuguese
    if (!chosen) {
      chosen = candidatePool.find((v) => v.name.toLowerCase().includes("google") && (v.lang || "").toLowerCase().startsWith("pt"));
    }

    // 4. Fallback to first available PT voice
    if (!chosen && candidatePool.length > 0) {
      chosen = candidatePool[0];
    }

    if (chosen) {
      utterance.voice = chosen;
      utterance.lang = chosen.lang || "pt-BR";
    }
  };

  setVoice();

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      setVoice();
    };
  }

  // Optimize pitch and rate for natural human prosody:
  // Neural voices sound most realistic at pitch 1.0 (or 1.02) and rate 1.0
  const isCurrentVoiceNeural = utterance.voice ? isNeuralVoice(utterance.voice) : false;
  utterance.pitch = options?.pitch !== undefined ? options.pitch : (isCurrentVoiceNeural ? 1.0 : 1.05);
  utterance.rate = options?.rate !== undefined ? options.rate : 1.0;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => {
    console.warn("Speech synthesis error or cancelled:", e);
    onError?.();
  };

  try {
    synth.speak(utterance);
  } catch (e) {
    console.error("Failed to speak utterance", e);
    onError?.();
  }

  return utterance;
}
