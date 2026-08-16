import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-950 text-white">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Ocorreu um erro inesperado</h2>
          <p className="text-zinc-400 mb-6 max-w-md">
            Pedimos desculpas pelo inconveniente. A aplicação encontrou um problema temporário.
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition"
          >
            Recarregar Portal
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Helper to prune and optimize large arrays (like photo galleries, articles, logs) stored in localStorage
function pruneLargeArrayKey(key: string, maxItems: number) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > maxItems) {
      // Keep newest entries
      const pruned = parsed.slice(-maxItems);
      window.localStorage.setItem(key, JSON.stringify(pruned));
    }
  } catch {
    // Ignore JSON parse errors
  }
}

// Safely wrap localStorage.setItem to prevent QuotaExceededError crashes with automatic pruning
if (typeof window !== 'undefined' && window.localStorage) {
  const originalSetItem = window.localStorage.setItem;
  
  // Proactively prune oversized cache stores on startup
  try {
    pruneLargeArrayKey('general_media_gallery', 30);
    pruneLargeArrayKey('docomeco_articles', 40);
    pruneLargeArrayKey('docomeco_testimonials', 25);
    pruneLargeArrayKey('docomeco_rotating_ads', 20);
  } catch {
    // Fail-safe
  }

  window.localStorage.setItem = function(key: string, value: string) {
    try {
      originalSetItem.apply(this, [key, value]);
    } catch (e: any) {
      console.warn(`[Storage] LocalStorage quota exceeded when writing "${key}". Executing multi-stage recovery...`);
      
      // Stage 1: If saving a large array to localStorage, try trimming the value itself if it's an array
      let saved = false;
      try {
        if (value.startsWith('[') && value.endsWith(']')) {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed) && parsed.length > 10) {
            const reduced = parsed.slice(-Math.floor(parsed.length * 0.7)); // Retain 70% newest
            const reducedValue = JSON.stringify(reduced);
            originalSetItem.apply(this, [key, reducedValue]);
            saved = true;
          }
        }
      } catch {
        // Fall through to stage 2
      }

      if (saved) return;

      // Stage 2: Prune known heavy keys from other collections
      try {
        const heavyKeys = [
          'general_media_gallery',
          'docomeco_articles',
          'docomeco_testimonials',
          'docomeco_rotating_ads',
          'docomeco_partners',
          'embaixadores_list'
        ];

        for (const targetKey of heavyKeys) {
          if (targetKey !== key) {
            pruneLargeArrayKey(targetKey, 15);
          }
        }

        // Retry setting item
        originalSetItem.apply(this, [key, value]);
        saved = true;
      } catch {
        // Fall through to stage 3
      }

      if (saved) return;

      // Stage 3: Emergency purge of non-critical temporary keys
      try {
        const tempKeys = ['general_media_gallery', 'docomeco_analytics_cache', 'docomeco_draft_cache'];
        for (const k of tempKeys) {
          if (k !== key) window.localStorage.removeItem(k);
        }
        originalSetItem.apply(this, [key, value]);
      } catch (finalError) {
        console.error(`[Storage Error] Critical storage limit reached for key "${key}":`, finalError);
      }
    }
  };
}

// Register Service Worker for PWA (Production Only)
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("PWA Service Worker registered successfully:", reg.scope);
        })
        .catch((err) => {
          console.error("PWA Service Worker registration failed:", err);
        });
    });
  } else {
    // Unregister service worker in development mode to prevent stale module interception
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
