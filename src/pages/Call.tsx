import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  RotateCw, 
  Maximize2,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useAuth } from '@/src/hooks/useAuth';
import { 
  listenToCall, 
  updateCallSignaling, 
  endCall as endCallService,
  addIceCandidate,
  CallSession
} from '@/src/services/callService';

export default function Call() {
  const { userId: otherUserId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const callId = searchParams.get('callId');
  const type = searchParams.get('type') || 'voice';
  const role = searchParams.get('role') || 'receiver'; // 'caller' or 'receiver'

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(type === 'voice');
  const [callDuration, setCallDuration] = useState(0);
  const [status, setStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!user || !callId) return;

    const setupCall = async () => {
      // 1. Get Local Stream
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: type === 'video',
          audio: true
        });
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        // 2. Setup PeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        peerConnection.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
          setStatus('connected');
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addIceCandidate(callId, role as 'caller' | 'receiver', event.candidate.toJSON());
          }
        };

        // 3. Signaling Logic
        if (role === 'caller') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await updateCallSignaling(callId, { offer });
        }

        // 4. Listen for changes
        const unsubscribe = listenToCall(callId, async (call) => {
          if (call.status === 'ended') {
            handleEndCall(false);
            return;
          }

          if (role === 'receiver' && call.offer && !pc.localDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateCallSignaling(callId, { answer, status: 'accepted' });
          }

          if (role === 'caller' && call.answer && !pc.remoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(call.answer));
          }

          // Add ICE candidates
          const remoteCandidates = role === 'caller' ? call.receiverCandidates : call.callerCandidates;
          if (remoteCandidates) {
            // Simplified: in a real app, track which ones are already added
          }
        });

        return unsubscribe;
      } catch (err) {
        console.error("Failed to setup call:", err);
      }
    };

    const cleanup = setupCall();
    return () => {
      cleanup.then(unsub => unsub?.());
      localStream.current?.getTracks().forEach(t => t.stop());
      peerConnection.current?.close();
    };
  }, [user, callId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'connected') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async (notifyService = true) => {
    setStatus('ended');
    if (notifyService && callId) {
      await endCallService(callId);
    }
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-between text-white pb-20 pt-12 overflow-hidden font-sans">
      {/* Remote Video (Full Screen) */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        <video 
          ref={remoteVideoRef}
          autoPlay 
          playsInline
          className={cn(
            "w-full h-full object-cover transition-opacity duration-1000",
            status === 'connected' ? "opacity-40 blur-sm" : "opacity-0"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/60 pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Profile */}
        <motion.div 
          layout
          className="relative"
        >
          <div className={cn(
            "w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-violet-500 transition-all duration-700",
            status === 'calling' ? "animate-pulse scale-110" : ""
          )}>
            <div className="w-full h-full rounded-full bg-zinc-950 p-1">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`} 
                alt="" 
                className={cn(
                  "w-full h-full rounded-full object-cover",
                  status === 'calling' && "animate-pulse"
                )}
              />
            </div>
          </div>
          
          {status === 'calling' && (
            <div className="absolute inset-0 -z-10 bg-purple-500/20 rounded-full blur-2xl animate-ping" />
          )}
        </motion.div>

        <div className="mt-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mb-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">End-to-End Encrypted</span>
          </motion.div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter neon-text drop-shadow-[0_0_15px_rgba(188,19,254,0.4)]">
            @{otherUserId}
          </h2>
          <p className="text-zinc-500 font-medium tracking-[0.3em] uppercase text-[10px] mt-3">
            {status === 'calling' ? 'Requesting Vibration...' : status === 'connected' ? 'Connected • ' + formatTime(callDuration) : 'Vibe Ended'}
          </p>
        </div>
      </div>

      {/* Local Video Preview */}
      <AnimatePresence>
        {type === 'video' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            className="absolute top-12 right-6 w-32 aspect-[9/14] bg-zinc-900 rounded-3xl border-2 border-white/10 overflow-hidden shadow-2xl z-20 group cursor-pointer"
          >
            <video 
              ref={localVideoRef}
              autoPlay 
              muted 
              playsInline
              className={cn(
                "w-full h-full object-cover",
                isVideoOff && "hidden"
              )}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                 <VideoOff className="text-zinc-600" size={32} />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <RotateCw className="text-white" size={24} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls Container */}
      <div className="relative z-10 w-full max-w-sm px-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "flex flex-col items-center space-y-2 p-5 rounded-[2.5rem] transition-all duration-300",
              isMuted ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "glass-dark text-white hover:bg-white/10"
            )}
          >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Mute</span>
          </button>

          <button 
            onClick={() => handleEndCall()}
            className="flex flex-col items-center justify-center p-5 rounded-[2.5rem] bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.3)] active:scale-90 transition-transform"
          >
            <PhoneOff size={32} strokeWidth={2.5} />
          </button>

          {type === 'voice' ? (
            <button className="flex flex-col items-center space-y-2 p-5 rounded-[2.5rem] glass-dark text-white hover:bg-white/10">
              <Volume2 size={24} />
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Speaker</span>
            </button>
          ) : (
            <button 
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={cn(
                "flex flex-col items-center space-y-2 p-5 rounded-[2.5rem] transition-all duration-300",
                isVideoOff ? "bg-zinc-800 text-white" : "glass-dark text-white hover:bg-white/10"
              )}
            >
              {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Video</span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-center space-y-6">
           <button className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-zinc-500 hover:text-white transition-all hover:bg-white/10">
             <RotateCw size={14} className="animate-spin-slow" />
             <span className="text-[9px] font-black uppercase tracking-[0.3em]">Flip to Back</span>
           </button>
           
           <div className="flex items-center space-x-8 text-zinc-600">
              <Maximize2 size={18} className="cursor-pointer hover:text-white" />
              <div className="h-4 w-px bg-zinc-800" />
              <div className="flex items-center space-x-1">
                <div className="w-1 h-3 bg-green-500 rounded-full" />
                <div className="w-1 h-2 bg-green-500 rounded-full opacity-60" />
                <div className="w-1 h-1 bg-green-500 rounded-full opacity-30" />
                <span className="text-[8px] font-bold uppercase ml-2">HD Stable</span>
              </div>
           </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}
