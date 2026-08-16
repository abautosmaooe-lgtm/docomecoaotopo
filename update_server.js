import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('@google/genai')) {
    content = 'import { GoogleGenAI } from "@google/genai";\n' + content;
}

const newRoute = `
  app.post("/api/assistant", async (req, res) => {
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
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { role: "user", parts: [{ text: contextText }] },
            { role: "model", parts: [{ text: "Olá! Sou a Topina, entendi o contexto perfeitamente. Como posso ajudar o usuário hoje?" }] },
            ...(history || []).filter((m: any) => m.text).map((m: any) => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })),
            { role: "user", parts: [{ text: message }] }
        ]
      });
      
      res.json({ reply: response.text });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: "Erro no assistente." });
    }
  });

  app.post("/api/contact"`;

content = content.replace('app.post("/api/contact"', newRoute);

fs.writeFileSync('server.ts', content);
