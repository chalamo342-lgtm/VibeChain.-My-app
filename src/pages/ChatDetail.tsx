import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Mic, 
  Send,
  MoreVertical,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';

export default function ChatDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mock data for demo
  const [messages] = useState([
    { id: '1', senderId: 'other', text: 'Yo! That last chain was fire 🔥', time: '10:30 AM' },
    { id: '2', senderId: 'me', text: 'Thanks! Let\'s collab soon?', time: '10:32 AM' },
    { id: '3', senderId: 'other', text: 'Definitely. I have some ideas for a new story chain.', time: '10:33 AM' },
  ]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage('');
    // Real app would write to Firestore collection 'chats/{id}/messages'
  };

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-900 bg-black/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/inbox')} className="p-1 -ml-1 text-zinc-400">
            <ChevronLeft size={28} />
          </button>
          <div 
            onClick={() => navigate(`/profile/${userId}`)}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden group-active:scale-95 transition-transform">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="" />
            </div>
            <div>
              <p className="font-bold text-sm leading-none group-hover:underline">@{userId}</p>
              <p className="text-[10px] text-green-500 font-medium mt-1">Active now</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button 
            onClick={() => navigate(`/call/${userId}?type=voice`)}
            className="p-2 text-zinc-300 hover:bg-zinc-900 rounded-full transition-colors"
          >
            <Phone size={22} />
          </button>
          <button 
            onClick={() => navigate(`/call/${userId}?type=video`)}
            className="p-2 text-zinc-300 hover:bg-zinc-900 rounded-full transition-colors"
          >
            <Video size={22} />
          </button>
          <button className="p-2 text-zinc-300">
            <Info size={22} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-800 mb-3">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`} alt="" />
          </div>
          <h3 className="font-bold text-xl">@{userId}</h3>
          <p className="text-zinc-500 text-sm">VibeChain Creator • 12k followers</p>
          <button 
            onClick={() => navigate(`/profile/${userId}`)}
            className="mt-4 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold hover:bg-zinc-800 transition-colors active:scale-95"
          >
            View Profile
          </button>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[80%]",
              isMe ? "ml-auto items-end" : "mr-auto items-start"
            )}>
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                isMe 
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-br-none" 
                  : "bg-zinc-800 text-zinc-100 rounded-bl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] text-zinc-600 mt-1 px-1">{msg.time}</span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 bg-black">
        <div className="flex items-end space-x-2">
          <div className="flex-1 min-h-[44px] bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center px-2 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
            <button className="p-2 text-zinc-500 hover:text-white transition-colors">
              <ImageIcon size={22} />
            </button>
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Send message..."
              className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-sm max-h-32 resize-none"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            />
            <button className="p-2 text-zinc-500 hover:text-white transition-colors">
              <Mic size={22} />
            </button>
          </div>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center transition-all",
              message.trim() 
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/20" 
                : "bg-zinc-900 text-zinc-600"
            )}
          >
            <Send size={20} className={cn(message.trim() && "translate-x-0.5 -translate-y-0.5")} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
