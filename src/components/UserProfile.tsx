import React, { useState } from "react";
import { motion } from "motion/react";
import { Camera, Save, LogOut, CheckCircle, Bell, Moon, Sun, Lock } from "lucide-react";
import { AppUser } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface UserProfileProps {
  user: AppUser;
  onLogout: () => void;
  onUpdateUser: (updatedData: Partial<AppUser>) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export default function UserProfile({ user, onLogout, onUpdateUser, isDarkMode, onThemeToggle }: UserProfileProps) {
  const [name, setName] = useState(user.name);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage("");
    // Simulate API call for managing preferences
    setTimeout(() => {
      onUpdateUser({ name });
      playSuccessSound();
      setSaving(false);
      setSavedMessage("Preferências e dados salvos com sucesso!");
      setTimeout(() => setSavedMessage(""), 3000);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-3xl mx-auto my-12 p-8 rounded-2xl border ${
        isDarkMode ? "bg-zinc-950 border-zinc-800" : "bg-white border-stone-200"
      } shadow-2xl relative overflow-hidden`}
    >
      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-pink-500`} />
      
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={user.photoUrl}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-green-500 object-cover"
            />
            <button className="absolute bottom-0 right-0 p-2 bg-pink-500 rounded-full text-white shadow-lg hover:bg-pink-600 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 text-center">
            <h2 className="font-display font-bold text-xl uppercase tracking-wider">{user.name}</h2>
            <p className="text-zinc-500 text-sm font-mono mt-1">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex-1 space-y-6 w-full">
          <div>
            <h3 className="text-sm font-display font-bold uppercase tracking-widest text-green-500 mb-4 border-b border-zinc-800 pb-2">
              Informações Pessoais
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">CÓDIGO DE MEMBRO</label>
                <div className="px-4 py-2 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-400 font-mono text-sm flex items-center justify-between">
                  <span>#{user.email.substring(0, 8).toUpperCase()}XX</span>
                  <Lock className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1">NOME DE EXIBIÇÃO</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border focus:outline-none transition-colors ${
                    isDarkMode
                      ? "bg-black border-zinc-800 focus:border-green-500 text-white"
                      : "bg-stone-50 border-stone-200 focus:border-green-500 text-black"
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-display font-bold uppercase tracking-widest text-pink-500 mb-4 border-b border-zinc-800 pb-2">
              Preferências do Portal
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Tema Visual</h4>
                  <p className="text-xs text-zinc-500">Alternar entre modo claro e escuro</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(600, "sine");
                    onThemeToggle();
                  }}
                  className={`p-2 rounded-xl border transition-all ${
                    isDarkMode ? "border-zinc-700 bg-zinc-800 text-yellow-400" : "border-stone-200 bg-stone-100 text-stone-700"
                  }`}
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold">Notificações</h4>
                  <p className="text-xs text-zinc-500">Receber alertas de novos eventos na comunidade</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound(500, "sine");
                    setNotificationsEnabled(!notificationsEnabled);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    notificationsEnabled ? 'bg-green-500' : 'bg-zinc-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 text-xs font-mono text-red-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              ENCERRAR SESSÃO
            </button>

            <div className="flex items-center gap-4">
              {savedMessage && (
                <span className="text-green-400 text-xs font-mono flex items-center gap-1 animate-pulse">
                  <CheckCircle className="w-3 h-3" />
                  {savedMessage}
                </span>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-green-500 hover:bg-green-400 text-black font-display font-black text-xs tracking-widest uppercase rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  "Salvando..."
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Perfil
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
