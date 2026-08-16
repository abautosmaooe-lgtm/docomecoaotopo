import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/assistant", async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: "Erro no assistente\." \}\);\n    \}\n  \}\);/;

const newRoute = `app.post("/api/assistant", async (req, res) => {
    const { history, message } = req.body;
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
      }
      
      const dbData = await loadDb();
      
      const portalConfig = dbData.portalPagesConfig || {};
      const articles = dbData.articles || [];
      const embaixadores = dbData.embaixadores_list || [];
      
      const contextText = \`
Você é a Topina, assistente virtual do 'Do Começo Ao Topo - Portal de Negócios'.
Seu objetivo é ajudar os visitantes do portal tirando dúvidas sobre o nosso conteúdo. 
Aqui estão os dados atuais do portal:

Quem Somos:
\${portalConfig.quemSomosP1 || ''}
\${portalConfig.quemSomosP2 || ''}
\${portalConfig.quemSomosP3 || ''}
\${portalConfig.quemSomosP4 || ''}

Nossos Objetivos:
Portal: \${portalConfig.objetivosPortal || ''}
Podcast: \${portalConfig.objetivosPodcast || ''}
Comunidade: \${portalConfig.objetivosComunidade || ''}

Endereço:
\${portalConfig.ondeEstamosText || ''}
Localização: \${portalConfig.ondeEstamosLocation || ''}

Embaixadores:
\${embaixadores.map((e: any) => \`- \${e.name} (\${e.company}): \${e.quote}\`).join('\\n')}

Notícias e Artigos recentes:
\${articles.slice(0, 15).map((a: any) => \`- \${a.title}: \${a.excerpt}\`).join('\\n')}

Responda de forma simpática, prestativa e sucinta (como uma verdadeira amiga virtual), baseada APENAS nestas informações. Se perguntarem algo fora desse contexto ou quiserem suporte humano, indique que você pode encaminhar a pessoa para o WhatsApp do portal. Não invente informações que não estão no texto. Use uma linguagem informal.
\`;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // We use chat API since it handles history correctly
      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: contextText,
          temperature: 0.7,
        },
      });

      // If there's history, we can either re-create it by sending messages one by one, 
      // or we can just pack everything into the first generateContent call.
      // Since ai.chats allows history, we could construct history array, but the first message MUST be 'user'
      
      const mappedHistory = (history || []).filter((m: any) => m.text).map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      // Ensure the first message is 'user' if it exists
      if (mappedHistory.length > 0 && mappedHistory[0].role === 'model') {
          // Prepend a dummy user message
          mappedHistory.unshift({ role: 'user', parts: [{ text: 'Oi' }] });
      }

      // Check for consecutive roles and fix them by merging or inserting dummies if needed
      // Actually, an easier way is to just use generateContent with the system instruction
      // and map the history safely.
      
      let safeHistory = [];
      let currentRole = 'user';
      for (const m of mappedHistory) {
         if (m.role !== currentRole) {
             if (currentRole === 'user') {
                 safeHistory.push({ role: 'user', parts: [{ text: 'Continuando...' }] });
             } else {
                 safeHistory.push({ role: 'model', parts: [{ text: 'Entendido.' }] });
             }
         }
         safeHistory.push(m);
         currentRole = m.role === 'user' ? 'model' : 'user';
      }

      // Instead of manual history merging, we can just pack the history into the current message context:
      const fullPrompt = \`
Histórico da conversa:
\${(history || []).map((m: any) => \`[\${m.sender}]: \${m.text}\`).join('\\n')}

Usuário: \${message}
\`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: fullPrompt,
        config: {
          systemInstruction: contextText,
          temperature: 0.7,
        }
      });
      
      res.json({ reply: response.text });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: "Erro no assistente." });
    }
  });`;

content = content.replace(regex, newRoute);
fs.writeFileSync('server.ts', content);
