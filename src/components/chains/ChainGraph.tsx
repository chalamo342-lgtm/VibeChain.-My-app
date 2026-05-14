import React from 'react';
import { motion } from 'motion/react';
import { GitBranch, User, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ChainNode {
  id: string;
  userId: string;
  username: string;
  caption: string;
  thumbnailURL?: string;
  parentId?: string;
}

interface ChainGraphProps {
  nodes: ChainNode[];
  activeId?: string;
}

export default function ChainGraph({ nodes, activeId }: ChainGraphProps) {
  const navigate = useNavigate();

  // Simple layout logic: horizontal for now
  const nodeWidth = 180;
  const nodeHeight = 100;
  const gapX = 100;

  return (
    <div className="relative w-full overflow-x-auto py-12 scrollbar-hide">
      <div 
        className="flex space-x-12 px-12 min-w-max h-[400px] items-center relative"
      >
        <svg 
          className="absolute inset-0 pointer-events-none" 
          style={{ width: '200%', height: '100%' }}
        >
          <defs>
            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          {nodes.map((node, i) => {
            if (i === 0) return null;
            return (
              <motion.line
                key={`line-${node.id}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.4 }}
                x1={i * (nodeWidth + gapX) - gapX + nodeWidth/2}
                y1="50%"
                x2={i * (nodeWidth + gapX) + nodeWidth/2}
                y2="50%"
                stroke="url(#neonGradient)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          })}
        </svg>

        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(`/video/${node.id}`)}
            className={cn(
              "relative group cursor-pointer",
              activeId === node.id ? "z-20" : "z-10"
            )}
            style={{ width: nodeWidth }}
          >
            <div className={cn(
              "bg-zinc-900 border-2 rounded-2xl p-4 transition-all duration-300 relative overflow-hidden",
              activeId === node.id 
                ? "border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)] scale-110" 
                : "border-zinc-800 hover:border-purple-500/50"
            )}>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${node.userId}`} alt={node.username} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase text-zinc-500">Node #{i + 1}</p>
                  <p className="font-bold text-xs text-white truncate truncate">@{node.username}</p>
                </div>
              </div>

              <p className="text-[10px] text-zinc-400 line-clamp-2 italic leading-relaxed mb-3">
                "{node.caption}"
              </p>

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {[1, 2].map(dot => (
                    <div key={dot} className="w-1 h-1 rounded-full bg-zinc-700" />
                  ))}
                </div>
                <Zap size={10} className="text-pink-500 animate-pulse" />
              </div>

              {/* Connector dots */}
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-950 border-2 border-pink-500" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-950 border-2 border-purple-500" />
            </div>

            {activeId === node.id && (
              <motion.div 
                layoutId="active-indicator"
                className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl -z-10 blur-xl opacity-20"
              />
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center space-x-8 px-12">
        <div className="flex items-center space-x-2">
          <GitBranch size={16} className="text-pink-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Chain Length: {nodes.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <User size={16} className="text-purple-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Contributors: {new Set(nodes.map(n => n.userId)).size}</span>
        </div>
      </div>
    </div>
  );
}
