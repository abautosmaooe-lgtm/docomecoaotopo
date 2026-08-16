import { toast } from "sonner";
import React, { useState, useRef, useEffect } from "react";
import { Move, Camera, X, Check, RotateCcw, Upload, Link } from "lucide-react";
import { playClickSound, playSuccessSound } from "../utils/audio";
import { DEFAULT_MEMBER_AVATAR } from "../data/community_members_data";

interface PositionableImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'fallback'> {
  // A unique key to persist this image's position. If not provided, we can fallback to the `src` URL.
  storageKey?: string;
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  editable?: boolean;
  disableDelete?: boolean;
  fallback?: React.ReactNode;
}

export default function PositionableImage({
  src,
  alt,
  className,
  style,
  storageKey,
  editable = false,
  disableDelete = false,
  fallback,
  ...props
}: PositionableImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Saved states (committed to localStorage)
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  // Draft states (active preview during dragging or uploading)
  const [draftPosition, setDraftPosition] = useState({ x: 50, y: 50 });
  const [draftUploadedSrc, setDraftUploadedSrc] = useState<string | null>(null);

  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tempUrl, setTempUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const startDragRef = useRef({ x: 0, y: 0, posX: 50, posY: 50, time: 0 });

  // Use the last 150 chars of the src URL as fallback storage key to avoid long string issues in localStorage keys
  const activeKey = storageKey || (src ? `img-pos-${src.slice(-150)}` : null);

  // Track if there are unsaved edits (modified states)
  const isModifiedByPosition = draftPosition.x !== position.x || draftPosition.y !== position.y;
  const isModifiedByImage = draftUploadedSrc !== uploadedSrc && !draftUploadedSrc?.startsWith("blob:");
  const isModified = isModifiedByPosition || isModifiedByImage;


  // Load saved position & uploaded image on mount or when storage key changes
  useEffect(() => {
    if (activeKey) {
      const saved = localStorage.getItem(activeKey);
      let loadedPos = { x: 50, y: 50 };
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            loadedPos = parsed;
          }
        } catch (e) {
          console.error("Error parsing saved image position", e);
        }
      }
      setPosition(loadedPos);
      setDraftPosition(loadedPos);

      const savedSrc = localStorage.getItem(`${activeKey}_uploaded_src`);
      if (savedSrc && !savedSrc.startsWith("blob:") && savedSrc !== "undefined" && savedSrc !== "null") {
        setUploadedSrc(savedSrc);
        setDraftUploadedSrc(savedSrc);
      } else {
        if (savedSrc && savedSrc.startsWith("blob:")) {
          localStorage.removeItem(`${activeKey}_uploaded_src`);
        }
        setUploadedSrc(null);
        setDraftUploadedSrc(null);
      }
    } else {
      setPosition({ x: 50, y: 50 });
      setDraftPosition({ x: 50, y: 50 });
      setUploadedSrc(null);
      setDraftUploadedSrc(null);
    }
  }, [activeKey, src]);

  // Synchronize dynamic uploaded changes across matching components (if any)
  useEffect(() => {
    const handleSync = () => {
      if (activeKey) {
        // Load position coordinates
        const saved = localStorage.getItem(activeKey);
        let loadedPos = { x: 50, y: 50 };
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (typeof parsed.x === "number" && typeof parsed.y === "number") {
              loadedPos = parsed;
            }
          } catch (e) {
            console.error("Error parsing saved image position", e);
          }
        }
        setPosition(loadedPos);
        setDraftPosition(loadedPos);

        // Load uploaded image source
        const savedSrc = localStorage.getItem(`${activeKey}_uploaded_src`);
        if (savedSrc) {
          setUploadedSrc(savedSrc);
          setDraftUploadedSrc(savedSrc);
        } else {
          setUploadedSrc(null);
          setDraftUploadedSrc(null);
        }
      }
    };
    window.addEventListener("image_updated", handleSync);
    return () => {
      window.removeEventListener("image_updated", handleSync);
    };
  }, [activeKey]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado! Por favor, envie fotos apenas em formato JPG, PNG ou WEBP.");
      return;
    }

    // Temporary quick feedback
    const blobUrl = URL.createObjectURL(file);
    setDraftUploadedSrc(blobUrl);
    playClickSound?.(440, "triangle");
    setIsUploading(true);

    try {
      // Compress the image before uploading to bypass server size limits
      const compressImage = async (imageFile: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(imageFile);
          img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;
            const maxDimension = 1200; // Define max width or height

            if (width > height && width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            } else if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
               return reject(new Error("Canvas not supported"));
            }
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG format with 80% quality to assure small footprint
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            resolve(dataUrl);
          };
          img.onerror = (err) => reject(err);
        });
      };

      const compressedBase64 = await compressImage(file);

      // Upload immediately to avoid hitting the 5MB browser localStorage bounds!
      const response = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: compressedBase64 })
      });
      
      if (response.ok) {
        const data = await response.json();
        const serverUrl = data.url;
        
        setDraftUploadedSrc(serverUrl);
        setUploadedSrc(serverUrl);
        
        if (activeKey) {
          localStorage.setItem(`${activeKey}_uploaded_src`, serverUrl);
          
          // Instantly sync uploaded image path to server database
          fetch("/api/update-positionable-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: activeKey,
              val: serverUrl,
              coords: draftPosition
            })
          }).catch(err => console.error("Error syncing uploaded path to database:", err));

          // We notify all components that this image was updated to keep sync
          window.dispatchEvent(new Event("image_updated"));
        }
      } else {
        console.error("Falha ao salvar no servidor.");
        toast.error("A foto excedeu o limite do servidor mesmo após compressão ou houve outro erro.");
        setDraftUploadedSrc(uploadedSrc); // Revert on failure
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setDraftUploadedSrc(uploadedSrc); // Revert on failure
    } finally {
      setIsUploading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Ignore if clicking on button/inputs
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof SVGElement ||
      (e.target instanceof HTMLElement && (e.target.closest("button") || e.target.closest("input")))
    ) {
      return;
    }
    if (e.button !== 0) return; // Only left click
    
    // Check if we are clicking on the fallback element directly.
    // If so, do not prevent default or start dragging so that the onClick hander can fire.
    if (!(draftUploadedSrc || src)) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    startDragRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: draftPosition.x,
      posY: draftPosition.y,
      time: Date.now(),
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = e.clientX - startDragRef.current.x;
    const dy = e.clientY - startDragRef.current.y;

    // Adjust sensitivity: relative to container size
    const sensX = rect.width > 0 ? (100 / rect.width) * 0.8 : 0.2;
    const sensY = rect.height > 0 ? (100 / rect.height) * 0.8 : 0.2;

    let newX = startDragRef.current.posX - dx * sensX;
    let newY = startDragRef.current.posY - dy * sensY;

    // Clamp between 0% and 100%
    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setDraftPosition({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    // Verify if it was a quick click instead of a drag
    const duration = Date.now() - startDragRef.current.time;
    const distance = Math.hypot(e.clientX - startDragRef.current.x, e.clientY - startDragRef.current.y);

    if (duration < 250 && distance < 6) {
      // Trigger file uploader on rapid click
      fileInputRef.current?.click();
    }
  };

  // Touch support for mobile devices
  const handlePasteLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setShowUrlInput(true);
    setTempUrl("");
    setUrlError("");
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof SVGElement ||
      (e.target instanceof HTMLElement && (e.target.closest("button") || e.target.closest("input")))
    ) {
      return; // Do not drag on button touches
    }
    if (e.touches.length !== 1) return;
    
    if (!(draftUploadedSrc || src)) {
      return;
    }
    
    const touch = e.touches[0];
    setIsDragging(true);
    startDragRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: draftPosition.x,
      posY: draftPosition.y,
      time: Date.now(),
    };
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = touch.clientX - startDragRef.current.x;
    const dy = touch.clientY - startDragRef.current.y;

    const sensX = rect.width > 0 ? (100 / rect.width) * 0.8 : 0.2;
    const sensY = rect.height > 0 ? (100 / rect.height) * 0.8 : 0.2;

    let newX = startDragRef.current.posX - dx * sensX;
    let newY = startDragRef.current.posY - dy * sensY;

    newX = Math.max(0, Math.min(100, newX));
    newY = Math.max(0, Math.min(100, newY));

    setDraftPosition({ x: Math.round(newX), y: Math.round(newY) });
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const duration = Date.now() - startDragRef.current.time;
    if (duration < 250) {
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, draftPosition]);

  // Save the draft position and draft uploaded image
  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    setPosition(draftPosition);
    setUploadedSrc(draftUploadedSrc);

    if (activeKey) {
      localStorage.setItem(activeKey, JSON.stringify(draftPosition));
      if (draftUploadedSrc) {
        localStorage.setItem(`${activeKey}_uploaded_src`, draftUploadedSrc);
      } else {
        localStorage.removeItem(`${activeKey}_uploaded_src`);
      }

      // Instantly sync saved coordinates and image path to server database
      fetch("/api/update-positionable-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: activeKey,
          val: draftUploadedSrc || null,
          coords: draftPosition
        })
      }).catch(err => console.error("Error syncing saved coordinates to database:", err));

      // Notify other components & update globally
      window.dispatchEvent(new Event("image_updated"));
    }

    playSuccessSound?.();
  };

  // Discard draft changes and restore to last saved state
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    setDraftPosition(position);
    setDraftUploadedSrc(uploadedSrc);

    playClickSound?.(330, "sine");
  };

  // Restore completely to original built-in image
  const handleResetToDefault = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    {
      setUploadedSrc(null);
      setDraftUploadedSrc(null);
      setDraftPosition({ x: 50, y: 50 });
      setPosition({ x: 50, y: 50 });

      if (activeKey) {
        localStorage.removeItem(`${activeKey}_uploaded_src`);
        localStorage.removeItem(activeKey);

        // Instantly clear/reset the image and position in the server database
        fetch("/api/update-positionable-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: activeKey,
            val: null,
            coords: null
          })
        }).catch(err => console.error("Error syncing image reset to database:", err));

        window.dispatchEvent(new Event("image_updated"));
      }

      playSuccessSound?.();
    }
  };

  // Image loading errors track state
  const [hasError, setHasError] = useState(false);

  const normalizeUrl = (url: any): string | null => {
    if (!url || typeof url !== "string") return null;
    const trimmed = url.trim();
    if (trimmed.includes("ibb.co/wFLq0zJQ")) {
      return "/regina-profile.jpg";
    }
    return trimmed;
  };

  const isValidSrc = (url: any): url is string => {
    if (!url || typeof url !== "string") return false;
    const lower = url.trim().toLowerCase();
    return lower !== "" && 
           lower !== "undefined" && 
           lower !== "null" && 
           !lower.startsWith("http://undefined") && 
           !lower.startsWith("https://undefined");
  };

  const normalizedDraft = normalizeUrl(draftUploadedSrc);
  const normalizedSrc = normalizeUrl(src);

  // Active attempted source state
  const [activeSrcOverride, setActiveSrcOverride] = useState<string | null>(null);

  const finalSrc = activeSrcOverride || 
    (isValidSrc(normalizedDraft) ? normalizedDraft : (isValidSrc(normalizedSrc) ? normalizedSrc : null));

  useEffect(() => {
    setActiveSrcOverride(null);
    setHasError(false);
  }, [src, draftUploadedSrc]);

  const handleImageError = () => {
    console.warn("Image load failed in PositionableImage for:", finalSrc);
    
    // If custom uploaded/draft failed, fall back to default component src
    if (finalSrc === normalizedDraft && isValidSrc(normalizedSrc) && normalizedSrc !== normalizedDraft) {
      if (activeKey) {
        localStorage.removeItem(`${activeKey}_uploaded_src`);
      }
      setDraftUploadedSrc(null);
      setUploadedSrc(null);
      setActiveSrcOverride(normalizedSrc);
      return;
    }

    // Specific fallback for Regina's profile in Quem Somos
    if (activeKey?.includes("quem-somos") && finalSrc !== "/regina-profile.jpg") {
      setActiveSrcOverride("/regina-profile.jpg");
      return;
    }

    // Fallback for Community Member avatars
    if ((activeKey?.includes("comunidade-member") || activeKey?.includes("community-member")) && finalSrc !== DEFAULT_MEMBER_AVATAR) {
      setActiveSrcOverride(DEFAULT_MEMBER_AVATAR);
      return;
    }

    setHasError(true);
  };

  const isAbsolute = className?.includes("absolute");

  return (
    <div
      ref={containerRef}
      onMouseDown={editable ? handleMouseDown : undefined}
      onTouchStart={editable ? handleTouchStart : undefined}
      className={`${isAbsolute ? "" : "relative"} overflow-hidden select-none ${className || "w-full h-full"} ${
        editable ? "cursor-grab active:cursor-grabbing group/dragimg" : ""
      }`}
    >
      {finalSrc && !hasError ? (
        <img
          src={finalSrc}
          alt={alt}
          referrerPolicy={props.referrerPolicy || "no-referrer"}
          onError={handleImageError}
          className="w-full h-full object-cover select-none pointer-events-none"
          style={{
            ...style,
            objectPosition: `${draftPosition.x}% ${draftPosition.y}%`,
          }}
          {...props}
        />
      ) : (
        <label 
          className="absolute inset-0 w-full h-full cursor-pointer z-30 flex items-center justify-center pointer-events-auto"
          title={editable ? "Clique para fazer upload" : undefined}
        >
          {fallback || null}
          {editable && (
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />
          )}
        </label>
      )}

      {/* Inline URL Input Overlay */}
      {editable && showUrlInput && (
        <div className="absolute inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4 pointer-events-auto cursor-default" onClick={(e) => e.stopPropagation()}>
          <div className="w-full max-w-[250px] space-y-2">
            <label className="text-[10px] text-zinc-300 font-mono block">Colar ImgBB Direct Link:</label>
            <input 
              type="text" 
              value={tempUrl}
              onChange={(e) => {
                setTempUrl(e.target.value);
                setUrlError("");
              }}
              placeholder="https://i.ibb.co/..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            {urlError && <p className="text-[9px] text-red-400 font-mono leading-tight">{urlError}</p>}
            <div className="flex gap-2 pt-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUrlInput(false);
                  setTempUrl("");
                  setUrlError("");
                }}
                disabled={isResolvingUrl}
                className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold text-white rounded uppercase transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  let url = tempUrl.trim();
                  if (!url) {
                    setShowUrlInput(false);
                    return;
                  }
                  
                  if (url.includes("ibb.co/") && !url.includes("i.ibb.co") && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    setIsResolvingUrl(true);
                    setUrlError("Resolvendo link da página para direto... 🔍");
                    try {
                      const res = await fetch("/api/resolve-image-url", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ url })
                      });
                      if (res.ok) {
                        const data = await res.json();
                        url = data.url;
                      }
                    } catch (err) {
                      console.error("Error resolving ImgBB URL:", err);
                    } finally {
                      setIsResolvingUrl(false);
                    }
                  }

                  if (url.includes("ibb.co/") && !url.includes("i.ibb.co") && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    setUrlError("Não foi possível extrair a imagem direta. Use o Link Direto se possível.");
                    return;
                  }

                  setDraftUploadedSrc(url);
                  playClickSound?.(400, "sine");
                  setShowUrlInput(false);
                  setTempUrl("");
                  setUrlError("");
                }}
                disabled={isResolvingUrl}
                className={`flex-1 px-2 py-1.5 text-[10px] font-bold text-white rounded uppercase transition-colors flex items-center justify-center gap-1 ${
                  isResolvingUrl ? "bg-zinc-800 cursor-not-allowed text-zinc-500" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                {isResolvingUrl ? "Carregando..." : "Ok"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Button overlay with action options */}
      {editable && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-35 md:opacity-0 md:group-hover/dragimg:opacity-100 opacity-100 transition-opacity duration-200">
          {/* Link Paste Button */}
          <button
            type="button"
            onClick={handlePasteLink}
            className="p-1.5 rounded-full bg-black/85 hover:bg-blue-500 hover:text-white border border-white/10 text-white cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all relative z-50 pointer-events-auto"
            title="Colar link direto da imagem (ImgBB, Google Drive, etc)"
          >
            <Link className="w-4 h-4" />
          </button>

          {/* Upload Button */}
          <label
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-1.5 rounded-full bg-black/85 hover:bg-green-500 hover:text-black border border-white/10 text-white cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all relative z-50 pointer-events-auto"
            title="Fazer upload de nova foto para esta posição"
          >
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>

          {/* Restore Original Button */}
          {!disableDelete && (uploadedSrc || draftUploadedSrc) && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-1.5 rounded-full bg-black/85 hover:bg-red-500 hover:text-white border border-white/10 text-zinc-400 cursor-pointer flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
              title="Resetar para foto de fábrica original"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Persistent / Unsaved Draft Actions Overlay */}
      {editable && (
        isModified ? (
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 px-3 z-40 pointer-events-auto">
            <button
              type="button"
              onClick={handleSave}
              className="px-2.5 py-1.5 bg-green-500 hover:bg-green-400 active:scale-95 text-black font-sans text-[9px] font-black tracking-widest uppercase rounded-lg shadow-lg shadow-green-500/20 transition-all flex items-center gap-1 cursor-pointer"
              title="Salvar alterações de imagem e posicionamento"
            >
              <Check className="w-2.5 h-2.5" />
              <span>SALVAR</span>
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 active:scale-95 text-zinc-300 font-sans text-[9px] font-black tracking-widest uppercase rounded-lg shadow-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Descartar alterações provisórias"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              <span>CANCELAR</span>
            </button>
          </div>
        ) : (
          /* Standard dragging helper/action overlay */
          <div className="absolute bottom-2 right-2 p-1 py-0.5 rounded bg-black/70 border border-white/10 opacity-0 group-hover/dragimg:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center gap-1 backdrop-blur-xs select-none">
            <Move className="w-2.5 h-2.5 text-green-400 animate-pulse" />
            <span className="text-[7.5px] font-mono uppercase tracking-wider text-zinc-300">
              Clique p/ trocar · Arraste p/ enquadrar
            </span>
          </div>
        )
      )}
    </div>
  );
}
