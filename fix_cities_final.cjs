const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

const splitStr = `  const [appCropperSource, setAppCropperSource] = useState<string>("");`;

const parts = app.split(splitStr);
if (parts.length === 2) {
  app = parts[0] + `  const CITIES_LIST = Array.from(new Set(quemSomosAmbassadors.map(a => a.city).filter(Boolean))).sort();\n\n` + splitStr + parts[1];
  fs.writeFileSync('src/App.tsx', app);
  console.log("Success");
} else {
  console.log("Failed to split");
}
