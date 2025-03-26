import { useLocation } from "wouter";
import { 
  Compass, 
  CalendarDays, 
  Ticket, 
  User 
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-800 border-t border-neutral-700 max-w-md mx-auto z-10">
      <div className="flex justify-around items-center h-16 px-4 pb-safe">
        <NavItem 
          icon={<Compass className="h-5 w-5" />} 
          label="Discover" 
          path="/" 
          isActive={isActive('/')} 
        />
        <NavItem 
          icon={<CalendarDays className="h-5 w-5" />} 
          label="Events" 
          path="/events" 
          isActive={isActive('/events')} 
        />
        <NavItem 
          icon={<Ticket className="h-5 w-5" />} 
          label="Tickets" 
          path="/tickets" 
          isActive={isActive('/tickets')} 
        />
        <NavItem 
          icon={<User className="h-5 w-5" />} 
          label="Profile" 
          path="/profile" 
          isActive={isActive('/profile')} 
        />
      </div>
    </nav>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

function NavItem({ icon, label, path, isActive }: NavItemProps) {
  const [, navigate] = useLocation();

  return (
    <button 
      onClick={() => navigate(path)}
      className={`flex flex-col items-center ${isActive ? 'text-primary' : 'text-neutral-500'}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
