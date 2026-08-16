import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface ParallaxLayer {
  src: string;
  alt: string;
  speedX: number;
  speedY: number;
  speedZ: number;
  rotation: number;
  distance: number;
  className?: string;
  zIndex: number;
  initialTop: string;
  initialLeft: string;
  width: string;
}

export interface ParallaxHeroProps {
  layers?: ParallaxLayer[];
  title?: string;
  className?: string;
  subtitle?: string;
  height?: string;
  compact?: boolean;
}

export const defaultLayers: ParallaxLayer[] = [
  {
    src: "https://i.ibb.co/9mHk68Gj/background.png",
    alt: "background",
    speedX: 0.03,
    speedY: 0.038,
    speedZ: 0,
    rotation: 0,
    distance: -200,
    zIndex: 1,
    initialTop: "calc(50% - 50px)",
    initialLeft: "calc(50% + 0px)",
    width: "3200px",
  },
  {
    src: "https://i.ibb.co/DHhNwG0X/fog-7.png",
    alt: "fog-7",
    speedX: 0.27,
    speedY: 0.32,
    speedZ: 0,
    rotation: 0,
    distance: 850,
    zIndex: 2,
    initialTop: "calc(50% - 100px)",
    initialLeft: "calc(50% + 300px)",
    width: "1900px",
  },
  {
    src: "https://i.ibb.co/4gT3LR9K/mountain-10.png",
    alt: "mountain-10",
    speedX: 0.095,
    speedY: 0.005,
    speedZ: 0,
    rotation: 0,
    distance: 1110,
    zIndex: 3,
    initialTop: "calc(50% + 169px)",
    initialLeft: "calc(50% + 330px)",
    width: "1200px",
  },
  {
    src: "https://i.ibb.co/rW6cjXV/fog-6.png",
    alt: "fog-6",
    speedX: 0.25,
    speedY: 0.28,
    speedZ: 0,
    rotation: 0,
    distance: 1400,
    zIndex: 4,
    initialTop: "calc(50% + 285px)",
    initialLeft: "calc(50%)",
    width: "2200px",
    className: "opacity-30",
  },
  {
    src: "https://i.ibb.co/zHWDdxRR/mountain-9.png",
    alt: "mountain-9",
    speedX: 0.125,
    speedY: 0.155,
    speedZ: 0.15,
    rotation: 0.02,
    distance: 1700,
    zIndex: 5,
    initialTop: "calc(50% + 313px)",
    initialLeft: "calc(50% - 557px)",
    width: "670px",
  },
  {
    src: "https://i.ibb.co/jFSMJ2t/fog-5.png",
    alt: "fog-5",
    speedX: 0.16,
    speedY: 0.105,
    speedZ: 0,
    rotation: 0,
    distance: 1900,
    zIndex: 7,
    initialTop: "calc(50% + 360px)",
    initialLeft: "calc(50% + 40px)",
    width: "650px",
  },
  {
    src: "https://i.ibb.co/Fq5CHqZ6/mountain-7.png",
    alt: "mountain-7",
    speedX: 0.1,
    speedY: 0.1,
    speedZ: 0,
    rotation: 0.09,
    distance: 2000,
    zIndex: 19,
    initialTop: "calc(50% + 223px)",
    initialLeft: "calc(50% + 495px)",
    width: "738px",
  },
  {
    src: "https://i.ibb.co/N2TjCDLQ/mountain-6.png",
    alt: "mountain-6",
    speedX: 0.065,
    speedY: 0.05,
    speedZ: 0.05,
    rotation: 0.12,
    distance: 2300,
    zIndex: 18,
    initialTop: "calc(50% + 120px)",
    initialLeft: "calc(50% + 590px)",
    width: "408px",
  },
  {
    src: "https://i.ibb.co/23Xc3QwX/fog-4.png",
    alt: "fog-4",
    speedX: 0.135,
    speedY: 0.1,
    speedZ: 0,
    rotation: 0,
    distance: 2400,
    zIndex: 11,
    initialTop: "calc(50% + 223px)",
    initialLeft: "calc(50% + 460px)",
    width: "590px",
    className: "opacity-50",
  },
  {
    src: "https://i.ibb.co/SSfDbsF/mountain-5.png",
    alt: "mountain-5",
    speedX: 0.08,
    speedY: 0.05,
    speedZ: 0.13,
    rotation: 0.1,
    distance: 2550,
    zIndex: 12,
    initialTop: "calc(50% + 320px)",
    initialLeft: "calc(50% + 230px)",
    width: "725px",
  },
  {
    src: "https://i.ibb.co/chZkMKzX/fog-3.png",
    alt: "fog-3",
    speedX: 0.11,
    speedY: 0.018,
    speedZ: 0,
    rotation: 0,
    distance: 2800,
    zIndex: 13,
    initialTop: "calc(50% + 210px)",
    initialLeft: "calc(50% + 5px)",
    width: "1600px",
  },
  {
    src: "https://i.ibb.co/39PKgGNS/mountain-4.png",
    alt: "mountain-4",
    speedX: 0.059,
    speedY: 0.024,
    speedZ: 0.35,
    rotation: 0.14,
    distance: 3200,
    zIndex: 15,
    initialTop: "calc(50% + 196px)",
    initialLeft: "calc(50% - 698px)",
    width: "1100px",
  },
  {
    src: "https://i.ibb.co/rKHGSD9S/mountain-3.png",
    alt: "mountain-3",
    speedX: 0.04,
    speedY: 0.018,
    speedZ: 0.32,
    rotation: 0.05,
    distance: 3400,
    zIndex: 20,
    initialTop: "calc(50% - 20px)",
    initialLeft: "calc(50% + 750px)",
    width: "630px",
  },
  {
    src: "https://i.ibb.co/bj0s7gRP/fog-2.png",
    alt: "fog-2",
    speedX: 0.15,
    speedY: 0.0115,
    speedZ: 0,
    rotation: 0,
    distance: 3600,
    zIndex: 16,
    initialTop: "calc(50% - 20px)",
    initialLeft: "calc(50% + 698px)",
    width: "1100px",
  },
  {
    src: "https://i.ibb.co/7tHMfwZH/mountain-2.png",
    alt: "mountain-2",
    speedX: 0.0235,
    speedY: 0.013,
    speedZ: 0.42,
    rotation: 0.15,
    distance: 3800,
    zIndex: 17,
    initialTop: "calc(50% + 256px)",
    initialLeft: "calc(50% + 528px)",
    width: "800px",
  },
  {
    src: "https://i.ibb.co/Knh5tBS/mountain-1.png",
    alt: "mountain-1",
    speedX: 0.027,
    speedY: 0.018,
    speedZ: 0.53,
    rotation: 0.2,
    distance: 4000,
    zIndex: 18,
    initialTop: "calc(50% + 196px)",
    initialLeft: "calc(50% - 728px)",
    width: "1100px",
  },
  {
    src: "https://i.ibb.co/Y41vTxSN/fog-1.png",
    alt: "fog-1",
    speedX: 0.12,
    speedY: 0.01,
    speedZ: 0,
    rotation: 0,
    distance: 4200,
    zIndex: 21,
    initialTop: "calc(100% - 355px)",
    initialLeft: "calc(50% + 100px)",
    width: "1900px",
    className: "opacity-50",
  },
];

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({
  layers = defaultLayers,
  title = "TOPO",
  subtitle,
  className,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLImageElement | null)[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const newXValue = e.clientX - centerX;
      const newYValue = e.clientY - centerY;
      const newRotateDegree = (newXValue / (window.innerWidth / 2)) * 20;

      updateLayers(e.clientX, newXValue, newYValue, newRotateDegree);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [layers]);

  const updateLayers = (
    cursorPosition: number,
    xVal: number,
    yVal: number,
    rotateDeg: number
  ) => {
    layerRefs.current.forEach((el, index) => {
      if (!el || !layers[index]) return;

      const layer = layers[index];
      const { speedX, speedY, speedZ, rotation } = layer;

      const computedLeft = parseFloat(
        getComputedStyle(el).left.replace("px", "") || "0"
      );
      const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
      const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

      el.style.transform = `perspective(2300px) translateZ(${
        zValue * speedZ
      }px) rotateY(${rotateDeg * rotation}deg) translateX(calc(-50% + ${
        -xVal * speedX
      }px)) translateY(calc(-50% + ${yVal * speedY}px))`;
    });

    if (textRef.current) {
      const textSpeedX = 0.07;
      const textSpeedY = 0.05;
      const textSpeedZ = 0.08;
      const textRotation = 0.04;

      const computedLeft = parseFloat(
        getComputedStyle(textRef.current).left.replace("px", "") || "0"
      );
      const isInLeft = computedLeft < window.innerWidth / 2 ? 1 : -1;
      const zValue = (cursorPosition - computedLeft) * isInLeft * 0.1;

      textRef.current.style.transform = `perspective(2300px) translateZ(${
        zValue * textSpeedZ
      }px) rotateY(${rotateDeg * textRotation}deg) translateX(calc(-50% + ${
        -xVal * textSpeedX
      }px)) translateY(calc(-50% + ${yVal * textSpeedY}px))`;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gradient-to-b from-[#0b1329] via-[#091b33] to-[#040914] select-none",
        compact ? "h-44 sm:h-52 w-full rounded-2xl" : "h-screen w-full",
        className
      )}
    >
      {/* Radial depth vignette */}
      <div className="absolute inset-0 z-[30] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_50%,rgba(0,0,0,0.85))]" />

      {/* Subtle glowing laser overlay */}
      <div className="absolute inset-0 z-[31] pointer-events-none bg-gradient-to-t from-[#070709] via-transparent to-transparent opacity-80" />

      {layers.map((layer, index) => (
        <img
          key={index}
          ref={(el) => {
            if (el) layerRefs.current[index] = el;
          }}
          src={layer.src}
          alt={layer.alt}
          referrerPolicy="no-referrer"
          className={cn(
            "absolute pointer-events-none transition-transform duration-[450ms] ease-out select-none",
            compact && "scale-[0.55] sm:scale-[0.7]",
            layer.className
          )}
          style={{
            width: layer.width,
            top: layer.initialTop,
            left: layer.initialLeft,
            zIndex: layer.zIndex,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      <div
        ref={textRef}
        className={cn(
          "absolute z-[9] text-center pointer-events-auto transition-transform duration-[450ms] ease-out",
          compact
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "top-[calc(50%-130px)] left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-[9px] sm:text-[10px] tracking-[0.4em] font-mono uppercase text-green-400 font-bold mb-0.5 drop-shadow-[0_0_12px_rgba(34,197,94,0.8)]">
            DO COMEÇO AO
          </span>
          <h1
            className={cn(
              "font-black tracking-tighter leading-[0.85] font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-stone-100 to-stone-400 drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]",
              compact
                ? "text-5xl sm:text-7xl"
                : "text-[20rem] max-lg:text-[15rem] max-md:text-[5.8rem] max-sm:text-[3.3rem]"
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm font-mono tracking-widest text-zinc-300 uppercase mt-2 drop-shadow-md">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ParallaxHeroDemo() {
  return <ParallaxHero title="TOPO" />;
}
