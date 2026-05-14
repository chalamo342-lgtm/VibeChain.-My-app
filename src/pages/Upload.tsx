import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  Upload as UploadIcon, 
  X, 
  Check,
  Video as VideoIcon,
  RotateCcw,
  Zap,
  Link as ChainIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { storage, db, auth, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/src/hooks/useAuth';

export default function Upload() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parentVideo, setParentVideo] = useState<any | null>(null);
  
  const [searchParams] = useSearchParams();
  const parentId = searchParams.get('parentId');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (parentId) {
      const fetchParent = async () => {
        const docRef = doc(db, 'videos', parentId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setParentVideo(docSnap.data());
        }
      };
      fetchParent();
    }
  }, [parentId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error('Video must be under 50MB');
        return;
      }
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      if (!caption && parentVideo) {
        setCaption(`Replying to @${parentVideo.username} #vibe #chain`);
      }
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error('Please sign in to upload');
      return;
    }
    if (!videoFile) return;

    setUploading(true);
    const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}-${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error(error);
        toast.error('Upload failed');
        setUploading(false);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        
        const videoData = {
          userId: user.uid,
          username: user.email?.split('@')[0] || 'anonymous',
          userPhotoURL: user.photoURL || '',
          videoURL: downloadUrl,
          thumbnailURL: '', // Initial thumbnail
          musicName: 'Original Sound',
          caption,
          parentId: parentId || null,
          rootId: parentVideo?.rootId || parentId || null,
          chainId: parentVideo?.chainId || parentId || null,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          viewCount: 0,
          createdAt: serverTimestamp(),
        };

        try {
          await addDoc(collection(db, 'videos'), videoData);
          toast.success(parentId ? 'Chain extended!' : 'Vibe shared!');
          navigate('/');
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, 'videos');
        }
      }
    );
  };

  return (
    <div className="h-full bg-zinc-950 flex flex-col p-4">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400">
          <X size={24} />
        </button>
        <h1 className="text-xl font-bold">New Vibe</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto space-y-6">
        {/* Parent Video Context */}
        {parentVideo && (
          <div className="flex items-center p-3 bg-zinc-900 border border-zinc-800 rounded-2xl mx-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-800 mr-3">
              <video src={parentVideo.videoURL} className="w-full h-full object-cover" muted />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-zinc-500 font-medium">Continuing Chain by</p>
              <p className="text-sm font-bold truncate">@{parentVideo.username}</p>
            </div>
            <ChainIcon size={18} className="text-purple-500 ml-2" />
          </div>
        )}

        {/* Preview Container */}
        <div className="aspect-[9/16] w-full max-w-sm mx-auto bg-zinc-900 rounded-3xl overflow-hidden relative border border-zinc-800 shadow-2xl">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              className="h-full w-full object-cover" 
              controls 
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-zinc-500">
              <div className="p-6 rounded-full bg-zinc-800 border-2 border-dashed border-zinc-700 animate-pulse">
                <VideoIcon size={48} />
              </div>
              <p className="font-medium">No video selected</p>
              <p className="text-xs text-center px-8">Vertical (9:16) videos look best.</p>
            </div>
          )}

          {videoUrl && !uploading && (
            <button 
              onClick={() => { setVideoFile(null); setVideoUrl(null); }}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-full text-white"
            >
              <RotateCcw size={20} />
            </button>
          )}
        </div>

        {/* Inputs */}
        <div className="space-y-4 px-4">
          <textarea
            placeholder="Write a caption... #vibe #trending"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-shadow h-24 resize-none"
          />

          {!videoUrl ? (
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col items-center justify-center space-y-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <Camera size={28} className="text-pink-500" />
                <span className="text-sm font-medium">Record</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  capture="user" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
              <label className="flex flex-col items-center justify-center space-y-2 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl cursor-pointer hover:bg-zinc-800 transition-colors">
                <UploadIcon size={28} className="text-purple-500" />
                <span className="text-sm font-medium">Browse</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleUpload}
              disabled={uploading}
              className="w-full h-14 bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50"
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Uploading {Math.round(progress)}%</span>
                </div>
              ) : (
                <>
                  <Zap size={20} className="fill-current" />
                  <span>Share Vibration</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
