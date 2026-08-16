import React from "react";
import { Edit3 } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  customImageUrl?: string;
  customLogoWidth?: number; // width in pixels
  customLogoHeight?: number; // height in pixels
  customText1?: string;
  customText2?: string;
  customSub?: string;
  isDarkMode?: boolean;
  isEditingActive?: boolean;
  onDirectEditClick?: (e: React.MouseEvent) => void;
}

export default function BrandLogo({
  size = "md",
  customImageUrl = "https://i.ibb.co/8Ls8W5Nw/topina-0-1.jpg",
  customLogoWidth,
  customLogoHeight,
  customText1 = "DO COMEÇO",
  customText2 = "AO TOPO",
  customSub = "PORTAL DE NEGÓCIOS",
  isDarkMode = true,
  isEditingActive = false,
  onDirectEditClick,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "gap-1.5",
    md: "gap-2",
    lg: "gap-3",
  };

  const imageSizes = {
    sm: "w-3 h-3",
    md: "w-[18px] h-[18px] md:w-[22px] md:h-[22px]",
    lg: "w-6 h-6 md:w-8 md:h-8",
  };

  const textSizes = {
    sm: "text-xs sm:text-sm md:text-base",
    md: "text-lg sm:text-xl md:text-2xl",
    lg: "text-2xl sm:text-3xl md:text-4xl",
  };

  // Determine dynamic styles for the image logo
  const logoStyle: React.CSSProperties = {
    width: customLogoWidth ? `${customLogoWidth}px` : undefined,
    height: customLogoHeight ? `${customLogoHeight}px` : undefined,
  };

  // Determine if we should show text
  // We hide text if they explicitly removed it, or if they uploaded a wide logo (width > 80) and left the default text unchanged
  const hasCustomText = customText1 || customText2 || customSub;
  const isDefaultText = customText1 === "DO COMEÇO" && customText2 === "AO TOPO";
  const hasWideLogo = customLogoWidth && customLogoWidth > 80;
  
  const showText = hasCustomText && !(isDefaultText && hasWideLogo);

  return (
    <div
      id="brand-logo-container"
      onClick={(e) => {
        if (isEditingActive && onDirectEditClick) {
          e.preventDefault();
          e.stopPropagation();
          onDirectEditClick(e);
        }
      }}
      className={`flex items-center font-display font-black tracking-tighter ${sizeClasses[size]} ${
        isEditingActive
          ? "cursor-pointer border border-dashed border-pink-500 hover:border-pink-400 p-1 rounded-xl bg-pink-500/5 hover:bg-pink-500/10 transition group/logo relative"
          : ""
      }`}
    >
      {/* Direct edit tooltip label */}
      {isEditingActive && (
        <span className="absolute -top-6 left-0 bg-pink-500 text-black text-[8px] px-1.5 py-0.5 rounded uppercase font-mono font-bold whitespace-nowrap opacity-90 animate-bounce z-10">
          Logo [Editar Imagem/Dimensões]
        </span>
      )}
      {/* Visual brand logo image with smooth border glow */}
      <div className="relative flex items-center justify-center p-0.5 rounded-xl bg-black border border-zinc-800 shadow-[0_0_15px_rgba(236,72,153,0.15)] overflow-hidden select-none">
        <img
          src={customImageUrl}
          alt="DO COMEÇO AO TOPO LOGO"
          referrerPolicy="no-referrer"
          style={customLogoWidth || customLogoHeight ? logoStyle : undefined}
          className={`${!customLogoWidth && !customLogoHeight ? imageSizes[size] : ""} object-cover rounded-lg transition duration-200`}
        />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse border border-zinc-950"></div>
        {isEditingActive && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover/logo:opacity-100 transition duration-200">
            <Edit3 className="w-4 h-4 text-pink-400" />
          </div>
        )}
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`flex items-baseline ${textSizes[size]}`}>
            <span className={`${isDarkMode ? "text-white" : "text-stone-900"} hover:text-green-500 transition duration-300 pointer-events-none font-black`}>
              {customText1}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-pink-500 font-extrabold uppercase ml-1 glow-text-pink">
              {customText2}
            </span>
          </div>
          <span className={`text-[8px] ${isDarkMode ? "text-zinc-500" : "text-stone-600"} font-mono tracking-widest font-bold mt-0.5`}>
            {customSub}
          </span>
        </div>
      )}
    </div>
  );
}
