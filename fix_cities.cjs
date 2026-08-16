const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
`const CITIES_LIST = [
  "Ubá",
  "Rodeiro",
  "Coronel Pacheco",
  "Goianá",
  "Juiz de Fora",
  "Matias Barbosa",
  "Barbacena"
];`, 
``
);

const insertionPoint = `  const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {`;
const dynamicListCode = `
  const CITIES_LIST = Array.from(new Set(quemSomosAmbassadors.map(a => a.city).filter(Boolean))).sort();
`;
app = app.replace(`// Load official ambassadors state for Showcase rendering in Quem Somos`, `// Load official ambassadors state for Showcase rendering in Quem Somos\n` + dynamicListCode);

// There is a CITIES_LIST mapped to some places...
fs.writeFileSync('src/App.tsx', app);
