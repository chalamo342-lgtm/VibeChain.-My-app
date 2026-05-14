import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  TrendingUp, 
  Coins, 
  BarChart3, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/src/lib/utils';

export default function AdsDashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(1240);
  const [earnings, setEarnings] = useState(42.50);

  const stats = [
    { label: 'Video Views', value: '42.5k', icon: BarChart3, color: 'text-blue-400' },
    { label: 'New Followers', value: '+142', icon: TrendingUp, color: 'text-green-400' },
    { label: 'Cloud Points', value: '850', icon: Zap, color: 'text-amber-400' },
  ];

  const packages = [
    { id: 'bronze', label: 'Starter Boost', cost: 100, reach: '1,000 extra vibes', color: 'from-orange-500 to-amber-700' },
    { id: 'silver', label: 'Pro Vibe', cost: 500, reach: '6,000 extra vibes', color: 'from-zinc-300 to-zinc-500' },
    { id: 'gold', label: 'Viral Chain', cost: 2000, reach: '30,000 extra vibes', color: 'from-amber-400 to-yellow-600' },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans">
      {/* Header */}
      <div className="p-6 bg-gradient-to-b from-purple-900/20 to-transparent">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Creator Hub</h1>
        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Monetize your knowledge</p>
      </div>

      <div className="px-6 space-y-8">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-pink-500 to-purple-600 p-8 shadow-2xl shadow-purple-500/20">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Total Balance</p>
                <div className="flex items-center space-x-2">
                  <Coins className="text-amber-300" />
                  <span className="text-4xl font-black italic">{balance.toLocaleString()} VibeCoins</span>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10">
                <ShieldCheck className="text-white" />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button className="flex-1 bg-white text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-transform">
                Withdraw
              </button>
              <button className="flex-1 bg-black/20 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 active:scale-95 transition-transform">
                Earn More
              </button>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-zinc-900/50 border border-white/5 p-4 rounded-3xl">
              <s.icon size={16} className={cn("mb-2", s.color)} />
              <p className="text-xs font-black italic">{s.value}</p>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Boost Content */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black italic uppercase italic">Chain Boosters</h2>
            <Sparkles size={16} className="text-pink-500" />
          </div>
          
          <div className="space-y-3">
            {packages.map((p) => (
              <div 
                key={p.id}
                className="bg-zinc-900/50 border border-white/5 p-5 rounded-[2rem] flex items-center justify-between group hover:border-white/20 transition-all hover:bg-zinc-800/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg", p.color)}>
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black italic text-sm text-white uppercase">{p.label}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 tracking-tight">{p.reach}</p>
                  </div>
                </div>
                <button className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest group-hover:bg-white group-hover:text-black transition-all">
                  {p.cost} VC
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analytics */}
        <div className="p-6 bg-zinc-900/30 rounded-[2.5rem] border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-widest italic">Live Revenue</h2>
            <ArrowUpRight size={14} className="text-green-400" />
          </div>
          
          <div className="h-24 flex items-end justify-between px-2">
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1 }}
                className="w-4 bg-gradient-to-t from-purple-500/20 to-purple-500 rounded-t-full"
              />
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-zinc-600">Last 7 Days</p>
              <p className="text-xl font-black italic">+ ${earnings.toFixed(2)}</p>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-pink-400">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
