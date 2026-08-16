const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// remove the incorrectly placed CITIES_LIST
app = app.replace(
`  const CITIES_LIST = Array.from(new Set(quemSomosAmbassadors.map(a => a.city).filter(Boolean))).sort();`,
``
);

// add it below the state declaration
const searchString = `  const [quemSomosAmbassadors, setQuemSomosAmbassadors] = useState<OfficialAmbassador[]>(() => {
    const saved = localStorage.getItem("embaixadores_list");
    let baseList = OFFICIAL_AMBASSADORS;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          baseList = parsed;
        }
      } catch (e) {}
    }
    return baseList;
  });`;

const replacement = searchString + `\n\n  const CITIES_LIST = Array.from(new Set(quemSomosAmbassadors.map(a => a.city).filter(Boolean))).sort();`;

app = app.replace(searchString, replacement);
fs.writeFileSync('src/App.tsx', app);
