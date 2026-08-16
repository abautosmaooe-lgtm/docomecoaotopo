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
`// CITIES_LIST will be computed dynamically inside the component`
);
app = app.replace(
`const CITIES_LIST = [
  "Juiz de Fora",
  "Ubá",
  "Matias Barbosa",
  "Barbacena",
  "Rodeiro",
  "Coronel Pacheco",
  "Goianá"
];`, 
`// CITIES_LIST will be computed dynamically inside the component`
);

app = app.replace('export default function App() {', 'export default function App() {');
app = app.replace(
`const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {`,
`const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {`
);

// We need to inject the dynamic CITIES_LIST below quemSomosAmbassadors
app = app.replace(
`  const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {`,
`  const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {`
);

fs.writeFileSync('src/App.tsx', app);
