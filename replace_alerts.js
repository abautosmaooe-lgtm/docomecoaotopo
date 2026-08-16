import fs from 'fs';

const files = [
  'src/components/PositionableImage.tsx',
  'src/components/EmbaixadoresDashboard.tsx',
  'src/components/NewsletterSection.tsx',
  'src/components/ComunidadeDashboard.tsx',
  'src/components/VisualEditorPanel.tsx',
  'src/components/RotatingBannerAds.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/alert\("Formato não suportado/g, 'toast.error("Formato não suportado');
  content = content.replace(/alert\("A foto excedeu o limite/g, 'toast.error("A foto excedeu o limite');
  content = content.replace(/alert\("Erro /g, 'toast.error("Erro ');
  content = content.replace(/alert\("Falha /g, 'toast.error("Falha ');
  content = content.replace(/alert\("Por favor, insira um e-mail válido/g, 'toast.warning("Por favor, insira um e-mail válido');
  content = content.replace(/alert\('Apenas o administrador/g, 'toast.warning(\'Apenas o administrador');
  
  // Replace the remaining with success/info
  content = content.replace(/alert\(/g, 'toast.success(');
  
  fs.writeFileSync(file, content);
}
console.log('Done!');
