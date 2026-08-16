import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const regex = /catch \(e: any\) \{\n        console\.error\(e\);\n        res\.status\(500\)\.json\(\{ error: "Erro no assistente\." \}\);\n    \}/;

const newCatch = `catch (e: any) {
        console.error(e);
        require('fs').writeFileSync('error.log', e.toString() + '\\n' + e.stack);
        res.status(500).json({ error: "Erro no assistente." });
    }`;

content = content.replace(regex, newCatch);
fs.writeFileSync('server.ts', content);
