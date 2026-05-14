import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Sparkles, Wand2, Ghost, Move, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

type Effect = 'none' | 'sepia' | 'grayscale' | 'hue-rotate' | 'invert' | 'mirror' | 'vignette' | 'glitch' | 'pixelate' | 'posterize' | 'bloom';

interface VibeCameraOverlayProps {
  onClose: () => void;
}

export default function VibeCameraOverlay({ onClose }: VibeCameraOverlayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeEffect, setActiveEffect] = useState<Effect>('none');
  const [showOverlay, setShowOverlay] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 480, height: 480 }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    let animationId: number;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const { width, height } = canvasRef.current;
        
        ctx.save();
        
        // Clear
        ctx.clearRect(0, 0, width, height);

        // Apply Global Effects
        if (activeEffect === 'mirror') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }

        // Filters
        let filterStr = '';
        if (activeEffect === 'sepia') filterStr = 'sepia(1)';
        else if (activeEffect === 'grayscale') filterStr = 'grayscale(1)';
        else if (activeEffect === 'hue-rotate') filterStr = 'hue-rotate(90deg)';
        else if (activeEffect === 'invert') filterStr = 'invert(1)';
        
        ctx.filter = filterStr || 'none';

        // Draw Video
        ctx.drawImage(videoRef.current, 0, 0, width, height);
        
        // Reset Filter for Overlays
        ctx.filter = 'none';
        ctx.restore();

        // Custom Pixel Effects
        if (activeEffect === 'pixelate') {
          const size = 10;
          const w = width / size;
          const h = height / size;
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(canvasRef.current, 0, 0, width, height, 0, 0, w, h);
          ctx.drawImage(canvasRef.current, 0, 0, w, h, 0, 0, width, height);
          ctx.imageSmoothingEnabled = true;
        }

        if (activeEffect === 'bloom') {
          ctx.globalCompositeOperation = 'screen';
          ctx.filter = 'blur(4px) brightness(1.5)';
          ctx.drawImage(canvasRef.current, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
          ctx.filter = 'none';
        }

        if (activeEffect === 'posterize') {
          ctx.filter = 'contrast(1.5) saturate(1.5) brightness(1.1)';
          ctx.drawImage(videoRef.current, 0, 0, width, height);
          
          const imageData = ctx.getImageData(0, 0, width, height);
          const data = imageData.data;
          const levels = 4;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.floor(data[i] / (256/levels)) * (256/levels);
            data[i+1] = Math.floor(data[i+1] / (256/levels)) * (256/levels);
            data[i+2] = Math.floor(data[i+2] / (256/levels)) * (256/levels);
          }
          ctx.putImageData(imageData, 0, 0);
          ctx.filter = 'none';
        }

        if (activeEffect === 'vignette') {
          const gradient = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width/1.2);
          gradient.addColorStop(0, 'transparent');
          gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }

        if (activeEffect === 'glitch' && Math.random() > 0.8) {
          ctx.fillStyle = `rgba(255, 0, 255, 0.2)`;
          ctx.fillRect(Math.random() * width, Math.random() * height, width/2, 2);
          ctx.fillStyle = `rgba(0, 255, 255, 0.2)`;
          ctx.fillRect(Math.random() * width, Math.random() * height, width/2, 2);
        }

        // AR Overlays (Static for now)
        if (showOverlay) {
          ctx.fillStyle = 'white';
          ctx.font = '800 24px Inter';
          ctx.textAlign = 'center';
          ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
          ctx.shadowBlur = 10;
          ctx.fillText('VIBE CHECK', width / 2, 40);
          
          // Draw "AR" Frame
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 2;
          ctx.strokeRect(30, 30, width - 60, height - 60);
        }
      }
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [activeEffect, showOverlay]);

  const effects: { id: Effect; icon: any; label: string }[] = [
    { id: 'none', icon: X, label: 'None' },
    { id: 'sepia', icon: Sparkles, label: 'Vintage' },
    { id: 'grayscale', icon: Ghost, label: 'Noir' },
    { id: 'hue-rotate', icon: Wand2, label: 'Trippy' },
    { id: 'invert', icon: Ghost, label: 'Ghost' },
    { id: 'mirror', icon: Move, label: 'Mirror' },
    { id: 'vignette', icon: Sparkles, label: 'Cinema' },
    { id: 'glitch', icon: Zap, label: 'Glitch' },
    { id: 'pixelate', icon: Zap, label: 'Pixel' },
    { id: 'posterize', icon: Sparkles, label: 'Comic' },
    { id: 'bloom', icon: Wand2, label: 'Bloom' },
  ];

  const cycleEffect = (dir: 'next' | 'prev') => {
    const currentIndex = effects.findIndex(e => e.id === activeEffect);
    let nextIndex;
    if (dir === 'next') {
      nextIndex = (currentIndex + 1) % effects.length;
    } else {
      nextIndex = (currentIndex - 1 + effects.length) % effects.length;
    }
    setActiveEffect(effects[nextIndex].id);
  };

  return (
    <motion.div 
      drag={!isMinimized}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        width: isMinimized ? 80 : 200,
        height: isMinimized ? 80 : 200,
      }}
      className={cn(
        "fixed bottom-24 right-20 z-50 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-zinc-900 group transition-all duration-300",
        isMinimized ? "rounded-full" : "rounded-3xl"
      )}
    >
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="w-full h-full object-cover"
        onClick={() => setIsMinimized(!isMinimized)}
      />

      <AnimatePresence>
        {!isMinimized && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none"
          >
            <div className="flex justify-between items-start pointer-events-auto">
              <button 
                onClick={() => setShowOverlay(!showOverlay)}
                className="bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white"
              >
                <Sparkles size={14} />
              </button>
              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-bold text-white bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest">
                   {effects.find(e => e.id === activeEffect)?.label}
                 </span>
              </div>
              <button 
                onClick={onClose}
                className="bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white/80 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="absolute inset-y-0 left-0 flex items-center px-1 pointer-events-auto">
              <button 
                onClick={() => cycleEffect('prev')}
                className="bg-black/20 hover:bg-black/40 p-1 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            <div className="absolute inset-y-0 right-0 flex items-center px-1 pointer-events-auto">
              <button 
                onClick={() => cycleEffect('next')}
                className="bg-black/20 hover:bg-black/40 p-1 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide pointer-events-auto relative z-10">
              {effects.map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => setActiveEffect(effect.id)}
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    activeEffect === effect.id 
                      ? "bg-purple-500 text-white scale-110 shadow-lg shadow-purple-500/50" 
                      : "bg-black/40 text-white/60 hover:text-white"
                  )}
                  title={effect.label}
                >
                  <effect.icon size={14} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none rounded-[inherit]" />
    </motion.div>
  );
}
