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
    window.speechSynthesis.cancel();
  }
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  return window.speechSynthesis.getVoices();
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

  return voices.filter((v) => {
    const nameLower = v.name.toLowerCase();
    const isMale = maleKeywords.some((kw) => nameLower.includes(kw));
    return !isMale;
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
        return;
      }
    }

    const ptVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("pt"));
    const pool = ptVoices.length > 0 ? ptVoices : voices;

    const maleKeywords = [
      "daniel", "felipe", "antonio", "helio", "ricardo", "mario", "manuel",
      "male", "david", "george", "gabriel", "joao", "tiago", "lucas", "pedro",
      "bruno", "paulo", "gustavo", "marcos", "andre", "diego", "rodrigo",
      "thiago", "carlos", "alexandre", "guilherme", "eduardo", "fernando",
      "vitor", "renato", "vinicius", "rafael"
    ];

    const femaleKeywords = [
      "daniela", "maria", "zira", "google", "female", "vitoria", "victoria",
      "luciana", "samantha", "sara", "joana", "helena", "yasmin", "femi",
      "fernanda", "marcia", "raquel", "francisca", "heloisa", "yaris",
      "leticia", "giovanna", "isabela", "camila", "carolina", "juliana",
      "gabriela", "paula", "beatriz", "clarissa", "noemia", "inez", "cecil",
      "solange", "alice", "regina", "tania"
    ];

    let chosen = pool.find((v) => {
      const nameLower = v.name.toLowerCase();
      const isFemaleName = femaleKeywords.some((kw) => nameLower.includes(kw));
      const isMaleName = maleKeywords.some((kw) => nameLower.includes(kw));
      return isFemaleName && !isMaleName;
    });

    if (!chosen) {
      chosen = pool.find((v) => {
        const nameLower = v.name.toLowerCase();
        return !maleKeywords.some((kw) => nameLower.includes(kw));
      });
    }

    if (!chosen && pool.length > 0) {
      chosen = pool[0];
    }

    if (chosen) {
      utterance.voice = chosen;
    }
  };

  setVoice();

  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => {
      setVoice();
    };
  }

  utterance.pitch = options?.pitch !== undefined ? options.pitch : 1.2;
  utterance.rate = options?.rate !== undefined ? options.rate : 1.02;

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
