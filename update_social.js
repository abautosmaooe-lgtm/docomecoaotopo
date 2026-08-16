import fs from 'fs';

let content = fs.readFileSync('src/components/SocialFloatingMenu.tsx', 'utf8');

// add icons
content = content.replace(
  'import { Youtube, Instagram, MessageCircle, X, Share2, Sparkles } from "lucide-react";',
  'import { Youtube, Instagram, MessageCircle, X, Share2, Sparkles, Accessibility, Eye, Type, Contrast } from "lucide-react";\nimport { useEffect } from "react";'
);

// add state
content = content.replace(
  'const [isOpen, setIsOpen] = useState(false);',
  `const [isOpen, setIsOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    let filter = "";
    if (highContrast) filter += "invert(1) hue-rotate(180deg) ";
    if (grayscale) filter += "grayscale(100%) ";
    document.body.style.filter = filter.trim();
  }, [highContrast, grayscale]);

  useEffect(() => {
    if (largeText) {
      document.documentElement.style.fontSize = "110%";
    } else {
      document.documentElement.style.fontSize = "100%";
    }
  }, [largeText]);
  
  const handleAccessToggle = () => {
    playClickSound(isAccessOpen ? 600 : 750, "sine");
    setIsAccessOpen(!isAccessOpen);
  };
`
);

// insert the button above main trigger button
const buttonHtml = `
      {/* Accessibility Sub-menu */}
      <AnimatePresence>
        {isAccessOpen && (
          <div className="flex flex-col gap-3 mr-1 mb-1 items-end">
            <motion.button
              onClick={() => { playClickSound(900, "sine"); setHighContrast(!highContrast); }}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg \${highContrast ? 'bg-pink-600' : 'bg-blue-600 hover:bg-blue-500'}\`}>
                <Contrast className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">Alto Contraste</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => { playClickSound(950, "sine"); setGrayscale(!grayscale); }}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg \${grayscale ? 'bg-pink-600' : 'bg-blue-600 hover:bg-blue-500'}\`}>
                <Eye className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">Monocromático</span>
              </div>
            </motion.button>
            <motion.button
              onClick={() => { playClickSound(1000, "sine"); setLargeText(!largeText); }}
              initial={{ opacity: 0, scale: 0.8, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 30 }}
              className="flex items-center gap-3 group focus:outline-none flex-row-reverse"
            >
              <div className={\`w-10 h-10 rounded-full flex items-center justify-center text-white transition duration-300 shadow-lg \${largeText ? 'bg-pink-600' : 'bg-blue-600 hover:bg-blue-500'}\`}>
                <Type className="w-4 h-4" />
              </div>
              <div className="bg-stone-950/90 border border-zinc-800 rounded-xl py-1 px-3 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-right">
                <span className="text-[10px] text-zinc-100 font-bold whitespace-nowrap">Aumentar Fonte</span>
              </div>
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Accessibility Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        onClick={handleAccessToggle}
        className={\`flex items-center justify-center w-12 h-12 rounded-full border-2 transition duration-300 focus:outline-none relative shadow-xl overflow-hidden mr-1 \${
          isAccessOpen
            ? "bg-black border-pink-500 text-pink-500 hover:shadow-[0_0_15px_rgba(236,72,153,0.4)]"
            : "bg-black border-blue-500 text-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        }\`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-pink-500/5 opacity-50"></div>
        {isAccessOpen ? (
          <X className="w-5 h-5 relative z-10" />
        ) : (
          <Accessibility className="w-5 h-5 relative z-10" />
        )}
      </motion.button>

      {/* Main Trigger Button */}`;

content = content.replace('{/* Main Trigger Button */}', buttonHtml);

fs.writeFileSync('src/components/SocialFloatingMenu.tsx', content);
