import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, logout, signInWithGoogle, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { useAuth } from '@/src/hooks/useAuth';
import { 
  Settings, 
  Grid, 
  Heart, 
  Lock, 
  UserPlus, 
  MessageCircle,
  Phone,
  Video,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Button } from '@/components/ui/button';
import { startCall } from '@/src/services/callService';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, profile: myProfile, loading: authLoading } = useAuth();
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('videos');
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !userId || userId === user?.uid;
  const currentProfile = isOwnProfile ? myProfile : targetProfile;
  const displayUid = userId || user?.uid;

  const handleStartCall = async (type: 'voice' | 'video') => {
    if (!user || !currentProfile || !displayUid) return;
    try {
      const callId = await startCall(user.uid, myProfile?.username || 'user', displayUid, type);
      navigate(`/call/${displayUid}?type=${type}&role=caller&callId=${callId}`);
    } catch (error) {
      console.error("Failed to start call:", error);
    }
  };

  useEffect(() => {
    if (!displayUid) {
      if (!authLoading) setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch profile if it's not the own profile
    if (!isOwnProfile) {
      const fetchProfile = async () => {
        try {
          const profileDoc = await getDoc(doc(db, 'users', userId));
          if (profileDoc.exists()) {
            setTargetProfile(profileDoc.data());
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${userId}`);
        }
      };
      fetchProfile();
    }

    // Fetch videos
    const q = query(
      collection(db, 'videos'),
      where('userId', '==', displayUid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUserVideos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [displayUid, userId, isOwnProfile, authLoading]);

  if (authLoading || (loading && displayUid)) {
    return (
      <div className="h-full flex items-center justify-center bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
      </div>
    );
  }

  if (!user && !userId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-center bg-black">
        <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-xl">
          <UserPlus size={48} className="text-zinc-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Join the VibeChain</h2>
          <p className="text-zinc-400 mt-2">Sign in to share vibes, build chains, and follow creators.</p>
        </div>
        <Button 
          variant="default"
          size="lg"
          className="w-full h-14 rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all font-bold text-lg active:scale-95 shadow-lg shadow-white/5"
          onClick={() => signInWithGoogle()}
        >
          Continue with Google
        </Button>
      </div>
    );
  }

  if (!currentProfile && userId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-black">
        <p className="text-zinc-500">User not found</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="h-full bg-black overflow-y-auto pb-20">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 sticky top-0 bg-black/80 backdrop-blur-xl z-20 border-b border-white/5">
        <div className="flex items-center space-x-2">
          {!isOwnProfile && (
            <button onClick={() => navigate(-1)} className="p-1 -ml-1">
              <ChevronLeft size={24} />
            </button>
          )}
          <h1 className="text-sm font-black tracking-tight uppercase italic neon-text">@{currentProfile?.username}</h1>
        </div>
        <div className="flex items-center space-x-1">
          {isOwnProfile ? (
            <>
              <button className="p-2 text-zinc-400 hover:text-white transition-colors"><Settings size={20} /></button>
              <button onClick={() => logout()} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
            </>
          ) : (
            <button className="p-2 text-zinc-400 hover:text-white transition-colors"><Settings size={20} /></button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 pt-8 pb-6 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group"
        >
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-violet-500 shadow-2xl shadow-purple-500/20">
            <div className="w-full h-full rounded-full bg-black p-1">
              <img 
                src={currentProfile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUid}`} 
                className="w-full h-full rounded-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                alt={currentProfile?.displayName}
              />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-zinc-900 border-2 border-black flex items-center justify-center text-purple-500 shadow-xl">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          </div>
        </motion.div>

        <div className="text-center mt-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{currentProfile?.displayName}</h2>
          <p className="text-zinc-500 text-xs font-medium tracking-wide mt-2 px-8 leading-relaxed">
            {currentProfile?.bio || 'Building vibrations one chain at a time.'}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-10 mt-8">
          <div className="text-center group cursor-pointer">
            <div className="font-black text-xl text-white group-hover:scale-110 transition-transform">{currentProfile?.followingCount || 0}</div>
            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Following</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="font-black text-xl text-white group-hover:scale-110 transition-transform">{currentProfile?.followerCount || 0}</div>
            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Followers</div>
          </div>
          <div className="text-center group cursor-pointer">
            <div className="font-black text-xl text-white group-hover:scale-110 transition-transform">{currentProfile?.likeCount || 0}</div>
            <div className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Likes</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full mt-10">
          {isOwnProfile ? (
            <>
              <Button className="flex-1 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
                Edit Profile
              </Button>
              <Button className="flex-1 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
                Share Profile
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-[2] h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg shadow-purple-500/20 active:scale-95 transition-all">
                Follow
              </Button>
              <Button 
                onClick={() => handleStartCall('voice')}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Phone size={18} />
              </Button>
              <Button 
                onClick={() => handleStartCall('video')}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <Video size={18} />
              </Button>
              <Button 
                onClick={() => navigate(`/chat/${currentProfile?.username}`)}
                className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 text-zinc-300 hover:text-white transition-all active:scale-95"
              >
                <MessageCircle size={18} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 bg-black/95 backdrop-blur-md z-20 border-b border-white/5">
        <div className="flex">
          {[
            { id: 'videos', icon: Grid },
            { id: 'liked', icon: Heart },
            { id: 'private', icon: Lock }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex justify-center py-4 relative transition-colors",
                activeTab === tab.id ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              )}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active_tab" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_-2px_10px_rgba(236,72,153,0.5)]" 
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      {activeTab === 'videos' ? (
        <div className="grid grid-cols-3 gap-[2px] mt-[2px] px-[2px]">
          {userVideos.map((video) => (
            <motion.div 
              key={video.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-[3/4] bg-zinc-900 relative group overflow-hidden cursor-pointer"
            >
              <video 
                src={video.videoURL} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-2 left-2 flex items-center space-x-1.5 text-white/90 text-[10px] font-black uppercase tracking-tighter drop-shadow-md">
                <Video size={10} strokeWidth={3} />
                <span>{video.viewCount || 0}</span>
              </div>
            </motion.div>
          ))}
          {userVideos.length === 0 && (
            <div className="col-span-3 py-32 flex flex-col items-center justify-center text-zinc-700 space-y-4">
              <div className="w-16 h-16 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                <Video size={24} strokeWidth={1.5} className="opacity-40" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">No vibrations yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center text-zinc-700">
           <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Content Locked</p>
        </div>
      )}
    </div>
  );
}

