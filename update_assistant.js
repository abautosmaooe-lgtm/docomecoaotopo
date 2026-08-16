import fs from 'fs';

let content = fs.readFileSync('src/components/TopinaAssistant.tsx', 'utf8');

const newSendMessage = `
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage: Message = { sender: 'user', text: inputValue };
    const lowerInputRaw = inputValue.toLowerCase();
    
    // 1. Handle Human Support
    const supportIntent = ["atendente", "falar com pessoa", "humano", "ajuda real", "whatsapp"];
    if (supportIntent.some(i => lowerInputRaw.includes(i))) {
        setMessages(prev => [...prev, userMessage, { sender: 'bot', text: 'Entendido. Estou te encaminhando para um de nossos atendentes humanos no WhatsApp!' }]);
        window.open(whatsappUrl, '_blank');
        setInputValue("");
        return;
    }

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages,
          message: inputValue
        })
      });
      
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: "Desculpe, ocorreu um erro ao tentar buscar as informações." }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: "Desculpe, estou com problemas de conexão no momento." }]);
    } finally {
      setIsLoading(false);
    }
  };
`;

content = content.replace(/const handleSendMessage = \(\) => \{[\s\S]*?setInputValue\(""\);\n  \};/, newSendMessage.trim());

// Also replace the button to show loading
content = content.replace(
  '<button\n                     className="bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700 transition-colors"\n                    onClick={handleSendMessage}\n                  >\n                    <Send className="w-3 h-3" />\n                  </button>',
  `<button
                     className={\`bg-green-600 text-white p-1.5 rounded-full transition-colors \${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}\`}
                    onClick={handleSendMessage}
                    disabled={isLoading}
                  >
                    <Send className={\`w-3 h-3 \${isLoading ? 'animate-pulse' : ''}\`} />
                  </button>`
);

// If the chat content needs to show loading indicator, we can add it:
content = content.replace(
  '{messages.map((msg, i) => (',
  `{messages.map((msg, i) => (`
);

fs.writeFileSync('src/components/TopinaAssistant.tsx', content);
