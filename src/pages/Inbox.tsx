import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Bell, UserPlus, Heart, MessageSquare, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

export default function Inbox() {
  const [activeTab, setActiveTab] = useState('messages');
  const navigate = useNavigate();

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Header Tabs */}
      <div className="flex border-b border-zinc-900">
        <button 
          onClick={() => setActiveTab('messages')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-4 relative",
            activeTab === 'messages' ? "text-white" : "text-zinc-500"
          )}
        >
          <MessageCircle size={20} />
          <span className="text-sm font-bold">Messages</span>
          {activeTab === 'messages' && <motion.div layoutId="tab-inbox" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={cn(
            "flex-1 flex items-center justify-center space-x-2 py-4 relative",
            activeTab === 'notifications' ? "text-white" : "text-zinc-500"
          )}
        >
          <Bell size={20} />
          <span className="text-sm font-bold">Notifications</span>
          {activeTab === 'notifications' && <motion.div layoutId="tab-inbox" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'messages' ? (
          <div className="divide-y divide-zinc-900">
            {[
              { user: 'vibe_master', text: 'Yo! Check the new chain.', time: '4h', unread: true },
              { user: 'creative_mind', text: 'That collab was sick!', time: '1d', unread: false },
              { user: 'story_teller', text: 'Can we do a part 2?', time: '2d', unread: false },
            ].map((msg, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/chat/${msg.user}`)}
                className="flex items-center p-4 hover:bg-zinc-950 transition-colors cursor-pointer group"
              >
                <div className="relative shrink-0">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/profile/${msg.user}`);
                    }}
                    className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 mr-4 border border-zinc-800 group-hover:scale-105 transition-transform cursor-pointer"
                  >
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user}`} alt={msg.user} />
                  </div>
                  {msg.unread && (
                    <div className="absolute top-0 right-4 w-3.5 h-3.5 bg-pink-500 rounded-full border-4 border-black" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${msg.user}`);
                      }}
                      className="font-bold text-white tracking-tight hover:underline cursor-pointer"
                    >
                      @{msg.user}
                    </p>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase">{msg.time}</span>
                  </div>
                  <p className={cn(
                    "text-sm mt-1 truncate",
                    msg.unread ? "text-white font-medium" : "text-zinc-500"
                  )}>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {[
              { type: 'follow', user: 'alex_vibes', time: '2m' },
              { type: 'like', user: 'sarah.m', time: '15m', video: true },
              { type: 'comment', user: 'jake_chain', time: '1h', text: 'Love this vibe!! 🔥', video: true },
              { type: 'follow', user: 'mira_waves', time: '3h' },
            ].map((notif, i) => (
              <div 
                key={i} 
                onClick={() => navigate(`/profile/${notif.user}`)}
                className="flex items-center p-4 hover:bg-zinc-950 transition-colors border-b border-zinc-950 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 mr-4 shrink-0 transition-transform group-active:scale-95">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.user}`} alt={notif.user} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-bold text-white group-hover:underline">@{notif.user}</span>
                    <span className="text-zinc-400 mx-1">
                      {notif.type === 'follow' ? 'started following you' : 
                       notif.type === 'like' ? 'liked your vibration' : 
                       'commented: ' + notif.text}
                    </span>
                    <span className="text-zinc-600 text-[10px] font-medium tracking-tight uppercase">{notif.time}</span>
                  </p>
                </div>
                {notif.video ? (
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg ml-4 overflow-hidden border border-zinc-900 shrink-0">
                    <img src={`https://picsum.photos/seed/${i}/100/100`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-lg shadow-pink-500/10 transition-transform active:scale-95">Follow</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
