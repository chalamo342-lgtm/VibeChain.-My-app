import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Music,
  Plus,
  GitBranch,
  X,
  Link as ChainIcon,
  Video as VideoIcon,
  Brain,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';
import { signInWithGoogle } from '@/src/lib/firebase';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import VibeCameraOverlay from './VibeCameraOverlay';
import ChainGraph from '../chains/ChainGraph';

interface VideoItemProps {
  video: any;
  mode?: 'vibe' | 'learning';
  stepIndex?: number;
}

const VideoItem: React.FC<VideoItemProps> = ({ video, mode = 'vibe', stepIndex = 1 }) => {
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showVibeCamera, setShowVibeCamera] = useState(false);
  const [chainNodes, setChainNodes] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current?.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const fetchChain = async () => {
    if (!video.rootId && !video.parentId) {
      setChainNodes([video]);
      return;
    }
    const rootId = video.rootId || video.parentId || video.id;
    const q = query(
      collection(db, 'videos'),
      where('rootId', '==', rootId),
      orderBy('createdAt', 'asc')
    );
    try {
      const snapshot = await getDocs(q);
      setChainNodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    }
  };

  const togglePlay = () => {
    if (playing) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setPlaying(!playing);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Sign in to like videos');
      return;
    }
    setLiked(!liked);
  };

  const navigateToProfile = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    navigate(`/profile/${profileId}`);
  };

  const isLesson = video.category === 'Learning' || video.hasStructuredContent;

  return (
    <div className="video-item h-full w-full relative bg-zinc-950 flex items-center justify-center">
      <video
        ref={videoRef}
        src={video.videoURL}
        className={cn(
          "h-full w-full object-cover transition-all duration-700",
          mode === 'learning' ? "opacity-90 grayscale-[0.2]" : ""
        )}
        loop
        playsInline
        onClick={togglePlay}
      />

      {/* Learning Mode Overlay */}
      <AnimatePresence>
        {mode === 'learning' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-[5]"
          >
            {/* Structured Lesson Header */}
            <div className="absolute top-32 left-0 right-0 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-500/20 px-3 py-1.5 rounded-xl border border-pink-500/30 backdrop-blur-md">
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Lesson Step {stepIndex}</span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div 
                        key={i} 
                        className={cn(
                          "w-4 h-1 rounded-full transition-all duration-500",
                          i <= stepIndex ? "bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" : "bg-white/10"
                        )} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Metadata overlays */}
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute left-6 top-1/2 -translate-y-1/2 max-w-[200px] space-y-4"
            >
              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="flex items-center space-x-2 mb-2 text-pink-400">
                  <Brain size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Key Takeaway</span>
                </div>
                <p className="text-xs text-zinc-300 font-bold leading-tight">
                  {video.keyInsight || "Master this specific technique to unlock the next level of the vibe chain."}
                </p>
              </div>

              <div className="bg-black/60 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <div className="flex items-center space-x-2 mb-2 text-purple-400">
                  <Zap size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Quick Tip</span>
                </div>
                <p className="text-xs text-zinc-300 font-bold leading-tight italic">
                  "Consistency is the vibration's secret ingredient."
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play Overlay */}
      <AnimatePresence>
        {!playing && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-black/20 backdrop-blur-sm p-6 rounded-full">
              <Plus className="text-white fill-white rotate-45" size={48} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar */}
      <div className="absolute right-3 bottom-24 flex flex-col items-center space-y-6">
        <div className="relative">
          <div 
            onClick={(e) => navigateToProfile(e, video.userId)}
            className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-zinc-800 cursor-pointer active:scale-95 transition-transform"
          >
            <img src={video.userPhotoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${video.userId}`} alt={video.username} />
          </div>
          <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-500 rounded-full p-0.5 text-white shadow-lg">
            <Plus size={14} />
          </button>
        </div>

        <button onClick={handleLike} className="flex flex-col items-center group">
          <div className={cn(
            "p-2 rounded-full transition-transform active:scale-125",
            liked ? "text-pink-500" : "text-white"
          )}>
            <Heart className={cn(liked && "fill-current")} size={32} />
          </div>
          <span className="text-xs font-semibold">{video.likeCount || 0}</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="p-2 text-white">
            <MessageCircle size={32} />
          </div>
          <span className="text-xs font-semibold">{video.commentCount || 0}</span>
        </button>

        <Sheet>
          <SheetTrigger asChild>
            <button onClick={fetchChain} className="flex flex-col items-center">
              <div className="p-2 text-white">
                <ChainIcon size={32} className={cn(video.parentId && "text-purple-400")} />
              </div>
              <span className="text-xs font-semibold">Chain</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh] bg-zinc-950 border-zinc-900 rounded-t-3xl p-0">
            <div className="p-6 h-full flex flex-col">
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center space-x-2 text-white">
                  <GitBranch className="text-purple-500" />
                  <span>Chain Timeline</span>
                </SheetTitle>
              </SheetHeader>
              
              <div className="flex-1 overflow-x-auto overflow-y-hidden relative min-h-[400px]">
                {chainNodes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
                    <ChainIcon size={48} className="opacity-20" />
                    <p>Building the vibe chain...</p>
                  </div>
                ) : (
                  <ChainGraph nodes={chainNodes} activeId={video.id} />
                )}
              </div>
              
              <button 
                onClick={() => navigate(`/upload?parentId=${video.id}`)}
                className="mt-6 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 active:scale-95 transition-transform"
              >
                <Plus size={20} />
                <span>Join this Chain</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        <button className="flex flex-col items-center">
          <div className="p-2 text-white">
            <Share2 size={32} />
          </div>
          <span className="text-xs font-semibold">{video.shareCount || 0}</span>
        </button>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowVibeCamera(!showVibeCamera);
          }} 
          className={cn(
            "flex flex-col items-center transition-all",
            showVibeCamera ? "text-purple-400 scale-110" : "text-white opacity-80"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl relative overflow-hidden",
            showVibeCamera ? "bg-purple-500/20" : "bg-transparent"
          )}>
            <VideoIcon size={32} />
            {showVibeCamera && (
              <motion.div 
                layoutId="vibe-indicator"
                className="absolute inset-0 bg-purple-500/10 animate-pulse" 
              />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">Vibe</span>
        </button>
      </div>

      {/* Vibe Camera Overlay */}
      {showVibeCamera && (
        <VibeCameraOverlay onClose={() => setShowVibeCamera(false)} />
      )}

      {/* Bottom Info */}
      <div className="absolute left-0 right-16 bottom-20 p-4 space-y-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
        <div className="max-w-md">
          <h3 
            onClick={(e) => navigateToProfile(e, video.userId)}
            className="font-black text-xl italic tracking-tighter uppercase text-white cursor-pointer hover:neon-text transition-colors w-fit"
          >
            @{video.username}
          </h3>
          <p className="text-sm line-clamp-2 mt-1 text-zinc-200 font-medium leading-snug drop-shadow-md">
            {video.caption}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center border border-white/5">
            <Music size={12} className="mr-2 text-pink-400 animate-pulse" />
            <div className="overflow-hidden w-32">
              <div className="animate-marquee whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-zinc-300">
                {video.musicName || 'Original Sound - VibeChain'}
              </div>
            </div>
          </div>
        </div>

        {/* Continue Chain Button */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/upload?parentId=${video.id}`);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-violet-500/20 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-violet-500/30 backdrop-blur-xl rounded-full px-5 py-2.5 border border-white/20 text-xs font-bold transition-all group overflow-hidden relative shadow-lg shadow-purple-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 opacity-0 group-hover:opacity-10 transition-opacity" />
          <ChainIcon size={18} className="text-pink-400 group-hover:rotate-12 transition-transform" />
          <span className="bg-gradient-to-r from-pink-200 to-violet-200 bg-clip-text text-transparent italic uppercase tracking-wider">Continue this chain</span>
        </motion.button>
      </div>

      {/* Floating Status */}
      {video.viewCount > 1000 && (
        <div className="absolute top-24 left-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center space-x-2 shadow-xl">
          <div className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-white shadow-pink-500/50">Viral Vibration</span>
        </div>
      )}

      {/* Rotating Disc */}
      <div className="absolute right-4 bottom-22">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-white/10 animate-spin-slow overflow-hidden shadow-2xl relative group">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img src={video.thumbnailURL || `https://picsum.photos/seed/${video.id}/100/100`} className="relative z-0" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoItem;

