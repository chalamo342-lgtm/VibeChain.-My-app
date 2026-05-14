import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import VideoItem from '@/src/components/feed/VideoItem';
import { Loader2, Sparkles, Brain, Zap, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { summarizeVideo, SummaryResult } from '@/src/services/geminiService';

export default function Home() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFeed, setActiveFeed] = useState<'foryou' | 'following'>('foryou');
  const [mode, setMode] = useState<'vibe' | 'learning'>('vibe');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    const vq = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc'),
      limit(15)
    );

    const aq = query(
      collection(db, 'ads'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(vq, async (snapshot) => {
      const videoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      try {
        const adSnapshot = await getDocs(aq);
        const adData = adSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isAd: true
        }));

        const combined: any[] = [];
        videoData.forEach((v, i) => {
          combined.push(v);
          if ((i + 1) % 3 === 0 && adData[Math.floor(i / 3)]) {
            combined.push(adData[Math.floor(i / 3)]);
          }
        });
        setVideos(combined);
      } catch (e) {
        setVideos(videoData);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeFeed]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex);
      setSummary(null);
    }
  };

  const getAISummary = async () => {
    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) return;
    
    setIsSummarizing(true);
    const result = await summarizeVideo(currentVideo.caption, currentVideo.username);
    setSummary(result);
    setIsSummarizing(false);
  };

  return (
    <div className="h-full relative flex flex-col bg-black">
      {/* Mode Switcher */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
        <div className="flex bg-black/40 backdrop-blur-xl rounded-full p-1 border border-white/10 shadow-2xl">
          <button 
            onClick={() => setMode('vibe')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2",
              mode === 'vibe' ? "bg-white text-black" : "text-white/60 hover:text-white"
            )}
          >
            <Zap size={10} />
            <span>Vibe</span>
          </button>
          <button 
            onClick={() => setMode('learning')}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2",
              mode === 'learning' ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white" : "text-white/60 hover:text-white"
            )}
          >
            <Brain size={10} />
            <span>Learning</span>
          </button>
        </div>
      </div>

      {/* AI Assistant Button (Learning Mode Only) */}
      <AnimatePresence>
        {mode === 'learning' && !summary && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={getAISummary}
            disabled={isSummarizing}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-purple-500/40 border border-white/20 group"
          >
            {isSummarizing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Sparkles className="group-hover:rotate-12 transition-transform" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full bg-white/20"
                />
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Summary Sidebar */}
      <AnimatePresence>
        {summary && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute inset-y-0 right-0 w-80 bg-black/60 backdrop-blur-3xl z-[60] border-l border-white/10 p-8 flex flex-col pt-24"
          >
            <button 
              onClick={() => setSummary(null)}
              className="absolute top-8 right-8 text-zinc-500 hover:text-white"
            >
              <X />
            </button>

            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-pink-500/20 p-2 rounded-xl">
                <GraduationCap className="text-pink-500" size={24} />
              </div>
              <div>
                <h3 className="text-sm font-black italic uppercase text-white">Smart Lesson</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">AI Generated Insight</p>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 scrollbar-hide">
              <div>
                <p className="text-[10px] font-black text-purple-400 uppercase mb-2">Topic</p>
                <h4 className="text-lg font-black italic text-white uppercase">{summary.topic}</h4>
              </div>

              <div>
                <p className="text-[10px] font-black text-purple-400 uppercase mb-2">Summary</p>
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">{summary.summary}</p>
              </div>

              <div>
                <p className="text-[10px] font-black text-purple-400 uppercase mb-3">Key Outcomes</p>
                <div className="space-y-2">
                  {summary.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start space-x-3 bg-white/5 p-3 rounded-2xl border border-white/5">
                      <div className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-[10px] font-black text-pink-500 shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-xs text-zinc-400 font-bold leading-snug">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-95 transition-transform">
                Explore Full Chain
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Tabs */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setActiveFeed('following')}
            className={cn(
              "text-lg font-bold transition-all",
              activeFeed === 'following' ? "text-white scale-110" : "text-white/60 hover:text-white/80"
            )}
          >
            Following
          </button>
          <div className="w-px h-4 bg-white/20" />
          <button 
            onClick={() => setActiveFeed('foryou')}
            className={cn(
              "text-lg font-bold transition-all relative",
              activeFeed === 'foryou' ? "text-white scale-110" : "text-white/60 hover:text-white/80"
            )}
          >
            For You
            {activeFeed === 'foryou' && (
              <motion.div 
                layoutId="activeFeed"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <div className="absolute inset-0 blur-xl bg-purple-500/20 rounded-full animate-pulse" />
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center space-y-4 px-8 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
            <Loader2 className="text-zinc-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold">No vibes yet</h2>
          <p className="text-zinc-400">Be the first to start a chain and keep the vibe going!</p>
        </div>
      ) : (
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto video-container snap-y snap-mandatory scroll-smooth"
        >
          {videos.map((video, index) => (
            <VideoItem 
              key={video.id} 
              video={video} 
              mode={mode} 
              stepIndex={index + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
