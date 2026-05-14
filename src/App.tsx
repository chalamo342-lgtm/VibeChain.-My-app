import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/src/hooks/useAuth';
import MobileNav from '@/src/components/layout/MobileNav';
import Home from '@/src/pages/Home';
import Explore from '@/src/pages/Explore';
import Upload from '@/src/pages/Upload';
import Inbox from '@/src/pages/Inbox';
import ChatDetail from '@/src/pages/ChatDetail';
import Call from '@/src/pages/Call';
import Profile from '@/src/pages/Profile';
import Live from '@/src/pages/Live';
import AdsDashboard from '@/src/pages/AdsDashboard';
import CallOverlay from '@/src/components/layout/CallOverlay';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col h-full bg-black">
          <main className="flex-1 overflow-hidden relative pb-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/chat/:userId" element={<ChatDetail />} />
              <Route path="/call/:userId" element={<Call />} />
              <Route path="/live/:streamId" element={<Live />} />
              <Route path="/ads" element={<AdsDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
            </Routes>
            <CallOverlay />
          </main>
          <MobileNav />
        </div>
        <Toaster position="top-center" expand={false} richColors theme="dark" />
      </AuthProvider>
    </Router>
  );
}
