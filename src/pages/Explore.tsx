import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, TrendingUp, Users, Flame, Zap, GraduationCap, GitBranch, Share2 } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

export default function Explore() {
  const [trending, setTrending] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const qT = query(
        collection(db, 'videos'),
        orderBy('viewCount', 'desc'),
        limit(6)
      );
      const snapshotT = await getDocs(qT);
      setTrending(snapshotT.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Simulating fetching 'structured' lessons
      setLessons(snapshotT.docs.slice(0, 3).map(doc => ({ id: doc.id, ...doc.data(), chainLength: 12, category: 'Tech' })));
    };
    fetchData();
  }, []);

  return (
    <div className="h-full bg-black overflow-y-auto px-4 py-4 space-y-6 pb-24 font-sans">
      {/* Search Bar */}
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <input 
          type="text"
          placeholder="Search knowledge or vibe-chains"
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl h-12 pl-12 pr-4 text-xs font-bold font-black italic uppercase tracking-widest focus:ring-2 focus:ring-pink-500 outline-none transition-shadow"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Banner */}
      <div className="aspect-[21/9] w-full rounded-[2.5rem] bg-gradient-to-br from-pink-600 via-purple-600 to-violet-600 p-8 flex flex-col justify-end relative overflow-hidden shadow-2xl shadow-purple-500/20">
        <div className="absolute top-4 right-4 opacity-20">
          <Zap size={64} className="fill-white" />
        </div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Knowledge Hub</h2>
        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Master a new skill in 15s chains</p>
      </div>

      {/* Categories */}
      <div className="flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {[
          { icon: GraduationCap, label: 'Learning', color: 'text-pink-400', bg: 'bg-pink-500/10' },
          { icon: GitBranch, label: 'Chains', color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: TrendingUp, label: 'Viral', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: Zap, label: 'Quick Vibes', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((cat) => (
          <button key={cat.label} className={cn(
            "shrink-0 flex items-center space-x-2 border border-white/5 px-5 py-3 rounded-2xl transition-all hover:bg-zinc-800/50 active:scale-95",
            cat.bg
          )}>
            <cat.icon size={16} className={cat.color} />
            <span className="text-xs font-black uppercase tracking-widest">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Lessons Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black italic text-lg uppercase tracking-tight">Structured Lessons</h3>
          <button className="text-[10px] text-pink-500 font-black uppercase tracking-widest">See all</button>
        </div>
        
        <div className="space-y-4">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 flex space-x-6 group hover:border-white/20 transition-all cursor-pointer">
              <div className="w-24 h-32 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 relative">
                <video src={lesson.videoURL} className="w-full h-full object-cover opacity-60" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Share2 size={14} />
                  </div>
                </div>
              </div>
              <div className="flex-1 py-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] font-black text-pink-500 bg-pink-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest border border-pink-500/20">{lesson.category}</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">{lesson.chainLength} Steps</span>
                  </div>
                  <h4 className="text-lg font-black italic uppercase text-white leading-tight mb-2 group-hover:text-pink-400 transition-colors">Mastering {lesson.category} in 5 Days</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Contribution by @{lesson.username} & 8 others</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users size={12} className="text-zinc-500" />
                    <span className="text-[10px] font-black italic text-zinc-500">4.2k active learners</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Trending Now</h3>
          <button className="text-sm text-pink-500 font-semibold">See all</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {trending.map((v) => (
            <motion.div 
              whileTap={{ scale: 0.98 }}
              key={v.id} 
              className="aspect-[9/12] bg-zinc-900 rounded-2xl relative overflow-hidden group shadow-lg cursor-pointer"
              onClick={() => navigate('/')} // Navigate to feed for now
            >
              <video 
                src={v.videoURL} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <p 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${v.userId}`);
                  }}
                  className="text-xs font-bold line-clamp-1 hover:underline"
                >
                  @{v.username}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center text-[10px] text-zinc-400">
                    <TrendingUp size={10} className="mr-1" />
                    <span>{v.viewCount || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {trending.length === 0 && Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[9/12] bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}

