const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
`      const articles = dbData.articles || [];
      const embaixadores = dbData.embaixadores_list || [];`,
`      const articles = dbData.articles || [];
      const embaixadores = dbData.embaixadores_list || [];
      const podcasts = dbData.podcasts || [];
      const photos = dbData.photos || [];`
);

server = server.replace(
`Notícias e Artigos recentes:
\${articles.slice(0, 15).map((a: any) => \`- \${a.title}: \${a.excerpt}\`).join('\\n')}

Responda`,
`Notícias e Artigos recentes:
\${articles.slice(0, 15).map((a: any) => \`- \${a.title}: \${a.excerpt}\`).join('\\n')}

Podcasts:
\${podcasts.map((p: any) => \`- Episódio: \${p.title} (Youtube: \${p.youtubeUrl || p.videoUrl})\`).join('\\n')}

Eventos e Galerias de Fotos:
\${Array.from(new Set(photos.map((p: any) => p.gallery))).join(', ')}

Responda`
);

fs.writeFileSync('server.ts', server);
