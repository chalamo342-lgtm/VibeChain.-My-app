import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/src/hooks/useAuth';
import { listenForIncomingCalls, updateCallSignaling, CallSession } from '@/src/services/callService';
import { useNavigate } from 'react-router-dom';

export default function CallOverlay() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = listenForIncomingCalls(user.uid, (call) => {
      setIncomingCall(call);
      // Play ringing sound logic here
    });

    return () => unsubscribe();
  }, [user]);

  const handleAccept = () => {
    if (!incomingCall) return;
    updateCallSignaling(incomingCall.id, { status: 'accepted' });
    navigate(`/call/${incomingCall.callerId}?type=${incomingCall.type}&role=receiver&callId=${incomingCall.id}`);
    setIncomingCall(null);
  };

  const handleDecline = () => {
    if (!incomingCall) return;
    updateCallSignaling(incomingCall.id, { status: 'declined' });
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-50 bg-zinc-900 border border-white/20 rounded-[2.5rem] p-6 shadow-2xl flex items-center justify-between"
      >
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 p-0.5 animate-pulse">
            <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${incomingCall.callerId}`} alt="" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-pink-500 tracking-widest mb-1">Incoming {incomingCall.type} Call</p>
            <h3 className="text-white font-black italic uppercase tracking-tighter">@{incomingCall.callerName}</h3>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDecline}
            className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center border border-red-500/30 active:scale-95 transition-transform"
          >
            <PhoneOff size={20} />
          </button>
          <button 
            onClick={handleAccept}
            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
          >
            <Phone size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
