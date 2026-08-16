import React, { useState, useEffect } from "react";
import { MessageSquare, Send, Camera, User } from "lucide-react";
import { Message } from "../types";
import { playClickSound, playSuccessSound } from "../utils/audio";

export const MessageBoard = ({ sectionKey }: { sectionKey: string }) => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(`intranet_messages_${sectionKey}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [newMsg, setNewMsg] = useState("");

  useEffect(() => {
    localStorage.setItem(`intranet_messages_${sectionKey}`, JSON.stringify(messages));
  }, [messages, sectionKey]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      sender: "Você",
      text: newMsg,
      date: new Date().toLocaleDateString(),
    };
    setMessages([msg, ...messages]);
    setNewMsg("");
    playSuccessSound();
  };

  return (
    <div className="bg-stone-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
        <MessageSquare className="w-5 h-5 text-green-400" />
        <h3 className="font-display font-black text-sm uppercase tracking-wider">Mural de Recados (Intranet)</h3>
      </div>
      
      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {messages.length === 0 && <p className="text-zinc-600 text-xs italic">Nenhuma mensagem no mural ainda.</p>}
        {messages.map(m => (
          <div key={m.id} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
            <p className="text-[10px] font-mono text-zinc-400 mb-1">{m.sender} - {m.date}</p>
            <p className="text-xs text-zinc-200">{m.text}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Escreva algo para o time..."
          className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white"
        />
        <button type="submit" className="bg-green-500 text-black px-4 rounded-xl">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
