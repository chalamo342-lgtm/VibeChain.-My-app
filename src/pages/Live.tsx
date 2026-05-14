import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Users, 
  X, 
  Send,
  Zap,
  Sparkles,
  Radio
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';

interface Message {
  id: string;
  text: string;
  userId: string;
  username: string;
  createdAt: any;
}

interface Reaction {
  id: string;
  x: number;
  y: number;
  color: string;
}

export default function Live() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [viewerCount, setViewerCount] = useState(124);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streamId) return;

    const q = query(
      collection(db, 'liveStreams', streamId, 'chat'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `liveStreams/${streamId}/chat`);
    });

    return () => unsubscribe();
  }, [streamId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !streamId) return;

    await addDoc(collection(db, 'liveStreams', streamId, 'chat'), {
      text: newMessage,
      userId: user.uid,
      username: user.displayName || user.email?.split('@')[0],
      createdAt: serverTimestamp()
    });

    setNewMessage('');
  };

  const addReaction = () => {
    const colors = ['#ec4899', '#a855f7', '#6366f1', '#14b8a6', '#f59e0b'];
    const newReaction = {
      id: Math.random().toString(),
      x: Math.random() * 60 - 30, // center offset
      y: 0,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setReactions(prev => [...prev.slice(-20), newReaction]);
    
    if (streamId) {
      updateDoc(doc(db, 'liveStreams', streamId), {
        likes: increment(1)
      });
    }
  };

  return (
    <div className="h-screen w-full bg-black relative overflow-hidden font-sans">
      {/* Background Video Simulator */}
      <div className="absolute inset-0 bg-zinc-950">
        <video 
          src="https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-his-laptop-34444-large.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3 bg-black/40 backdrop-blur-md rounded-full pl-1 pr-4 py-1 border border-white/10">
          <div className="w-8 h-8 rounded-full border border-pink-500/50 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=streamer" alt="" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-black uppercase text-white">@code_vibe</span>
              <div className="bg-pink-500 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white flex items-center">
                <Radio size={8} className="mr-1 animate-pulse" />
                Live
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold tracking-tighter">Chain Learning: Web Dev Basics</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/10">
            <Users size={12} className="text-zinc-400" />
            <span className="text-xs font-black text-white">{viewerCount}</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Reaction Stream */}
      <div className="absolute right-4 bottom-32 h-64 w-20 pointer-events-none z-10 flex flex-col justify-end items-center">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.div
              key={r.id}
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -300, opacity: 0, scale: 1.5, x: r.x }}
              exit={{ opacity: 0 }}
              onAnimationComplete={() => setReactions(prev => prev.filter(item => item.id !== r.id))}
              className="absolute bottom-0"
            >
              <Heart fill={r.color} color={r.color} size={24} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chat Area */}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black to-transparent z-20">
        <div className="max-h-[300px] overflow-y-auto space-y-3 mb-4 scrollbar-hide scroll-smooth">
          {messages.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={msg.id} 
              className="flex items-start space-x-2"
            >
              <div className="bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-2xl rounded-tl-none border border-white/5 max-w-[80%]">
                <span className="text-[10px] font-black text-pink-400 uppercase tracking-tighter block mb-1">@{msg.username}</span>
                <p className="text-xs text-zinc-200 leading-snug">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="flex items-center space-x-3">
          <form onSubmit={sendMessage} className="flex-1 relative group">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Say something vibe..."
              className="w-full bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-pink-400 transition-colors"
            >
              <Send size={18} />
            </button>
          </form>

          <button 
            onClick={addReaction}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 active:scale-90 transition-transform"
          >
            <Heart size={24} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-52 flex flex-col space-y-4 z-20">
        <button className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
          <Zap size={20} className="text-amber-400" />
        </button>
        <button className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10">
          <Sparkles size={20} className="text-pink-400" />
        </button>
      </div>
    </div>
  );
}
