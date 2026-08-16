import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { X, Crop, Move, ZoomIn, Minimize, RotateCw, RefreshCw } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";

interface ImageCropperModalProps {
  isOpen: boolean;
  src: string; // Original raw image as a dataURL or URL
  onClose: () => void;
  onConfirm: (croppedBase64: string) => void;
  aspectRatioPreset?: "1:1" | "16:9" | "4:3" | "free";
}

export default function ImageCropperModal({
  isOpen,
  src,
  onClose,
  onConfirm,
  aspectRatioPreset = "free"
}: ImageCropperModalProps) {
  if (!isOpen || !src) return null;

  const [aspect, setAspect] = useState<"1:1" | "16:9" | "4:3" | "free">(aspectRatioPreset);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Crop area coordinates in percentage (0 to 100)
  const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Dragging and resizing states
  const dragStartRef = useRef<{
    type: "move" | "resize" | null;
    handle: string | null;
    startX: number;
    startY: number;
    startCrop: { x: number; y: number; width: number; height: number };
  }>({
    type: null,
    handle: null,
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, width: 0, height: 0 }
  });

  // Whenever aspect ratio preset changes, update the crop box aspect ratio
  useEffect(() => {
    applyAspectRatio(aspect);
  }, [aspect]);

  const applyAspectRatio = (currentAspect: typeof aspect) => {
    if (currentAspect === "free") {
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
      return;
    }

    let targetRatio = 1;
    if (currentAspect === "16:9") targetRatio = 16 / 9;
    if (currentAspect === "4:3") targetRatio = 4 / 3;

    // Based on targetRatio, we update the height to fit inside the width beautifully
    const initialWidth = 70;
    const initialHeight = initialWidth / targetRatio;

    if (initialHeight <= 80) {
      setCrop({
        x: (100 - initialWidth) / 2,
        y: (100 - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight
      });
    } else {
      const fittedHeight = 80;
      const fittedWidth = fittedHeight * targetRatio;
      setCrop({
        x: (100 - fittedWidth) / 2,
        y: (100 - fittedHeight) / 2,
        width: fittedWidth,
        height: fittedHeight
      });
    }
  };

  // Helper to standardise mouse/touch positions
  const getClientCoords = (e: MouseEvent | TouchEvent | ReactMouseEvent | ReactTouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    const mouseEvent = e as MouseEvent | ReactMouseEvent;
    return { clientX: mouseEvent.clientX, clientY: mouseEvent.clientY };
  };

  const startInteraction = (
    type: "move" | "resize",
    handle: string | null,
    e: ReactMouseEvent | ReactTouchEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    playClickSound(580, "sine");

    const { clientX, clientY } = getClientCoords(e);
    dragStartRef.current = {
      type,
      handle,
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop }
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", endInteraction);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", endInteraction);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!dragStartRef.current.type || !containerRef.current) return;

    // Prevent default scrolling behavior on mobile
    if (e.cancelable) e.preventDefault();

    const { clientX, clientY } = getClientCoords(e);
    const containerRect = containerRef.current.getBoundingClientRect();

    const deltaX = ((clientX - dragStartRef.current.startX) / containerRect.width) * 100;
    const deltaY = ((clientY - dragStartRef.current.startY) / containerRect.height) * 100;

    const { type, handle, startCrop } = dragStartRef.current;

    if (type === "move") {
      let nextX = startCrop.x + deltaX;
      let nextY = startCrop.y + deltaY;

      // Constrain within borders [0, 100]
      nextX = Math.max(0, Math.min(100 - startCrop.width, nextX));
      nextY = Math.max(0, Math.min(100 - startCrop.height, nextY));

      setCrop((prev) => ({ ...prev, x: nextX, y: nextY }));
    } else if (type === "resize" && handle) {
      let nextX = startCrop.x;
      let nextY = startCrop.y;
      let nextWidth = startCrop.width;
      let nextHeight = startCrop.height;

      const minSize = 10; // minimum 10% size

      if (handle.includes("right")) {
        nextWidth = Math.max(minSize, Math.min(100 - startCrop.x, startCrop.width + deltaX));
      }
      if (handle.includes("left")) {
        const potentialWidth = startCrop.width - deltaX;
        if (potentialWidth >= minSize) {
          nextX = Math.max(0, startCrop.x + deltaX);
          nextWidth = startCrop.width + (startCrop.x - nextX);
        }
      }
      if (handle.includes("bottom")) {
        nextHeight = Math.max(minSize, Math.min(100 - startCrop.y, startCrop.height + deltaY));
      }
      if (handle.includes("top")) {
        const potentialHeight = startCrop.height - deltaY;
        if (potentialHeight >= minSize) {
          nextY = Math.max(0, startCrop.y + deltaY);
          nextHeight = startCrop.height + (startCrop.y - nextY);
        }
      }

      // Enforce aspect ratio if not custom 'free'
      if (aspect !== "free") {
        let currentRatio = 1;
        if (aspect === "16:9") currentRatio = 16 / 9;
        if (aspect === "4:3") currentRatio = 4 / 3;

        // Base resize on width, recalculate height
        nextHeight = nextWidth / currentRatio;

        // If height exceeds container, scale width back
        if (nextY + nextHeight > 100) {
          nextHeight = 100 - nextY;
          nextWidth = nextHeight * currentRatio;
        }
      }

      setCrop({
        x: nextX,
        y: nextY,
        width: nextWidth,
        height: nextHeight
      });
    }
  };

  const endInteraction = () => {
    dragStartRef.current.type = null;
    dragStartRef.current.handle = null;
    document.removeEventListener("mousemove", handleMove);
    document.removeEventListener("mouseup", endInteraction);
    document.removeEventListener("touchmove", handleMove);
    document.removeEventListener("touchend", endInteraction);
  };

  // Run the crop algorithm inside a high-fidelity `<canvas>`
  const handleCropConfirm = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Original real dimensions of loaded raw image file
    const realWidth = img.naturalWidth;
    const realHeight = img.naturalHeight;

    // Convert crop percentages to real pixel coordinates
    const cropX = (crop.x / 100) * realWidth;
    const cropY = (crop.y / 100) * realHeight;
    const cropW = (crop.width / 100) * realWidth;
    const cropH = (crop.height / 100) * realHeight;

    // Scale down output canvas if it is too large to prevent huge base64 strings and crash/body-parser limit failures
    const maxDimension = 1200;
    let targetW = cropW;
    let targetH = cropH;

    if (targetW > targetH && targetW > maxDimension) {
      targetH = (maxDimension / targetW) * targetH;
      targetW = maxDimension;
    } else if (targetH > maxDimension) {
      targetW = (maxDimension / targetH) * targetW;
      targetH = maxDimension;
    }

    // Dimensions of crop output
    canvas.width = targetW;
    canvas.height = targetH;

    // Support rotation if added
    if (rotation !== 0) {
      // Rotation-based canvas translation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Apply zoom scaling factor from central pivot
    const zoomScale = zoom;
    const scaledW = targetW * zoomScale;
    const scaledH = targetH * zoomScale;
    const dx = (targetW - scaledW) / 2;
    const dy = (targetH - scaledH) / 2;

    // Draw image slice onto canvas
    ctx.drawImage(
      img,
      cropX, // sx
      cropY, // sy
      cropW, // sw
      cropH, // sh
      dx,    // dx
      dy,    // dy
      scaledW, // dw
      scaledH  // dh
    );

    try {
      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
      onConfirm(croppedBase64);
      playSuccessSound();
      onClose();
    } catch (err) {
      console.error("Error cropping image:", err);
      // Fallback: send original source if crop fails due to cors issues
      onConfirm(src);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
          <div className="text-left">
            <span className="text-[10px] bg-pink-500/10 text-pink-500 font-mono font-bold px-2.5 py-1 rounded border border-pink-500/20 uppercase tracking-widest block w-fit mb-1">
              Recortar & Redimensionar
            </span>
            <h3 className="font-display font-black text-white text-base uppercase tracking-tight">
              Ajuste sua Imagem
            </h3>
          </div>
          <button
            onClick={() => {
              playClickSound(480, "sine");
              onClose();
            }}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info label */}
        <div className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-850/50 mb-4 text-[10px] leading-relaxed text-zinc-400 font-mono text-left">
          💡 Araje o retângulo central para mover ou arraste qualquer uma das <strong>quatro quinas</strong> para redimensionar sua seleção livremente.
        </div>

        {/* Aspect Ratio Presets */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase shrink-0">Proporção:</span>
          {(["free", "1:1", "16:9", "4:3"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                playClickSound(500, "sine");
                setAspect(preset);
              }}
              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-mono font-black uppercase transition-colors whitespace-nowrap border ${
                aspect === preset
                  ? "bg-pink-500/15 border-pink-500/35 text-pink-400"
                  : "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white"
              }`}
            >
              {preset === "free" ? "Livre" : preset}
            </button>
          ))}
        </div>

        {/* VIEWPORT CONTROLLER COAXIAL BOX */}
        <div className="relative flex-1 bg-black/90 border border-zinc-850 rounded-2xl overflow-hidden min-h-[220px] max-h-[350px] flex items-center justify-center">
          
          {/* Interactive Drag/Crop Container */}
          <div
            ref={containerRef}
            className="relative select-none max-w-full max-h-full"
            style={{ width: "100%", height: "100%", maxHeight: "280px" }}
          >
            {/* Real Background Image */}
            <img
              ref={imgRef}
              src={src}
              alt="Raw image to crop"
              className="w-full h-full object-contain pointer-events-none"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.1s ease"
              }}
            />

            {/* DARK DIMMED MASK OVERLAY */}
            <div className="absolute inset-0 bg-black/65 pointer-events-none" />

            {/* DRAGGABLE CROP BOX WINDOW (Visible Active Portion) */}
            <div
              className="absolute border border-pink-500 ring-2 ring-pink-500/10 cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.65)" // Dynamic spotlight cutout mask!
              }}
              onMouseDown={(e) => startInteraction("move", null, e)}
              onTouchStart={(e) => startInteraction("move", null, e)}
            >
              {/* Photo Helper Grid Lines (Thirds) */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-30 pointer-events-none">
                <div className="border-r border-dashed border-white row-span-3 col-span-1" />
                <div className="border-r border-dashed border-white row-span-3 col-span-1" />
                <div className="border-b border-dashed border-white col-span-3 row-span-1" />
                <div className="border-b border-dashed border-white col-span-3 row-span-1" />
              </div>

              {/* Tiny Center Icon */}
              <div className="absolute inset-x-0 inset-y-0 flex items-center justify-center pointer-events-none opacity-20">
                <Move className="w-5 h-5 text-white" />
              </div>

              {/* CORNER DRAG RESIZE HANDLES */}
              {/* Top-Left */}
              <div
                className="absolute -top-1 -left-1 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nwse-resize z-10 hover:scale-125 transition-transform"
                onMouseDown={(e) => startInteraction("resize", "top-left", e)}
                onTouchStart={(e) => startInteraction("resize", "top-left", e)}
              />
              {/* Top-Right */}
              <div
                className="absolute -top-1 -right-1 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nesw-resize z-10 hover:scale-125 transition-transform"
                onMouseDown={(e) => startInteraction("resize", "top-right", e)}
                onTouchStart={(e) => startInteraction("resize", "top-right", e)}
              />
              {/* Bottom-Left */}
              <div
                className="absolute -bottom-1 -left-1 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nesw-resize z-10 hover:scale-125 transition-transform"
                onMouseDown={(e) => startInteraction("resize", "bottom-left", e)}
                onTouchStart={(e) => startInteraction("resize", "bottom-left", e)}
              />
              {/* Bottom-Right */}
              <div
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-pink-500 rounded-full cursor-nwse-resize z-10 hover:scale-125 transition-transform"
                onMouseDown={(e) => startInteraction("resize", "bottom-right", e)}
                onTouchStart={(e) => startInteraction("resize", "bottom-right", e)}
              />
            </div>
          </div>
        </div>

        {/* ZOOM & ROTATION EXTRAS */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-zinc-500 font-bold uppercase flex items-center gap-1">
                <ZoomIn className="w-3 h-3 text-pink-500" /> Zoom do Corte
              </span>
              <span className="text-[9.5px] font-mono text-pink-400 font-black">{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-pink-500"
            />
          </div>

          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-mono text-zinc-500 font-bold uppercase flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-pink-500" /> Rotação
              </span>
              <span className="text-[9.5px] font-mono text-pink-400 font-black">{rotation}°</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="360"
                step="90"
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className="flex-1 accent-pink-500"
              />
              <button
                type="button"
                onClick={() => {
                  setRotation((prev) => (prev + 90) % 360);
                  playClickSound(520, "sine");
                }}
                className="p-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 font-bold hover:text-white"
                title="Girar 90 Graus"
              >
                +90°
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 border-t border-zinc-900 pt-4 mt-4">
          <button
            type="button"
            onClick={() => {
              playClickSound(480, "sine");
              onClose();
            }}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-mono uppercase text-[10px] font-black tracking-wider rounded-xl transition"
          >
            Mudar de Ideia
          </button>
          
          <button
            type="button"
            onClick={handleCropConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-green-500 hover:from-pink-400 hover:to-green-400 text-black font-mono font-black uppercase text-[10px] tracking-wider rounded-xl shadow-lg hover:shadow-pink-500/10 transition flex items-center justify-center gap-1.5"
          >
            <Crop className="w-3.5 h-3.5" />
            <span>Aplicar & Confirmar</span>
          </button>
        </div>

      </div>
    </div>
  );
}
