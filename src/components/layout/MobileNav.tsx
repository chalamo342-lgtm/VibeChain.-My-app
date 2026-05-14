import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageCircle, 
  User
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Explore', path: '/explore' },
  { icon: PlusSquare, label: 'Upload', path: '/upload', primary: true },
  { icon: MessageCircle, label: 'Inbox', path: '/inbox' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-black border-t border-zinc-800 flex items-center justify-around px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center space-y-1 w-full h-full transition-colors",
              isActive ? "text-white" : "text-zinc-500",
              item.primary && "relative -top-2"
            )}
          >
            <div className={cn(
              "p-1 rounded-lg",
              item.primary && "bg-gradient-to-br from-pink-500 via-purple-500 to-violet-500 text-white p-2 shadow-lg shadow-purple-500/20"
            )}>
              <Icon size={item.primary ? 28 : 24} />
            </div>
            {!item.primary && <span className="text-[10px] font-medium">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
