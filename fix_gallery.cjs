const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
`<GlobalPhotoGallery isDarkMode={isDarkMode} isAdmin={isAdmin} portalPagesConfig={portalPagesConfig} />`,
`<GlobalPhotoGallery isDarkMode={isDarkMode} isAdmin={isAdmin} portalPagesConfig={portalPagesConfig} CITIES_LIST={CITIES_LIST} />`
);
fs.writeFileSync('src/App.tsx', app);

let gallery = fs.readFileSync('src/components/GlobalPhotoGallery.tsx', 'utf8');
gallery = gallery.replace(
`const CITIES_LIST = ["Todas", "Juiz de Fora", "Ubá", "Matias Barbosa", "Barbacena", "Rodeiro", "Coronel Pacheco", "Goianá"];`,
``
);

gallery = gallery.replace(
`interface GlobalPhotoGalleryProps {
  isDarkMode: boolean;
  isAdmin: boolean;
  portalPagesConfig?: any;
}`,
`interface GlobalPhotoGalleryProps {
  isDarkMode: boolean;
  isAdmin: boolean;
  portalPagesConfig?: any;
  CITIES_LIST: string[];
}`
);

gallery = gallery.replace(
`export default function GlobalPhotoGallery({ isDarkMode, isAdmin, portalPagesConfig }: GlobalPhotoGalleryProps) {`,
`export default function GlobalPhotoGallery({ isDarkMode, isAdmin, portalPagesConfig, CITIES_LIST }: GlobalPhotoGalleryProps) {
  const dynamicCitiesWithTodas = ["Todas", ...CITIES_LIST];`
);

gallery = gallery.replace(/{CITIES_LIST\.map/g, `{dynamicCitiesWithTodas.map`);
gallery = gallery.replace(/{CITIES_LIST\.filter/g, `{dynamicCitiesWithTodas.filter`);

fs.writeFileSync('src/components/GlobalPhotoGallery.tsx', gallery);
