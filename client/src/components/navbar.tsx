import { useLocation } from "wouter";
import { Compass, CalendarDays, Ticket, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  // Mock user data - in a real app, this would come from auth context
  const user = {
    name: "Aditya Dhawan",
  };

  return (
    <div className="fixed top-0 left-0 right-0 max-w-md mx-auto z-10">
      {/* Premium top navigation bar with gold accents */}
      <nav className="bg-gradient-to-b from-black to-neutral-900 border-b border-neutral-800 py-4 px-6">
        <div className="flex justify-between items-center">
          {/* Logo area */}
          <div className="text-[37px] italic text-primary font-bold font-[Magnolia]">
            Partier
          </div>

          {/* Central premium navigation buttons */}
          <div className="flex space-x-1">
            <PremiumNavButton
              label="Discover"
              path="/"
              isActive={isActive("/")}
            />
            <PremiumNavButton
              label="Events"
              path="/events"
              isActive={isActive("/events")}
            />
            <PremiumNavButton
              label="Tickets"
              path="/tickets"
              isActive={isActive("/tickets")}
            />
          </div>

          {/* Profile avatar */}
          <Avatar
            className="h-9 w-9 bg-gradient-to-br from-primary to-amber-400 cursor-pointer border-2 border-amber-600 shadow-lg hover:shadow-amber-900/20 transition-all"
            onClick={() => navigate("/profile")}
          >
            <AvatarFallback className="text-[20px] font-[Magnolia] text-[#F1C232] font-semibold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </div>
  );
}

interface PremiumNavButtonProps {
  label: string;
  path: string;
  isActive: boolean;
}

function PremiumNavButton({ label, path, isActive }: PremiumNavButtonProps) {
  const [, navigate] = useLocation();

  return (
    <button
      onClick={() => navigate(path)}
      className={`
        px-3 py-1.5 rounded-full text-sm font-medium transition-all
        ${
          isActive
            ? "bg-gradient-to-r from-primary/90 to-amber-600/90 text-black shadow-lg shadow-amber-900/30"
            : "bg-black/50 text-neutral-400 hover:bg-black hover:text-neutral-300 backdrop-blur-sm border border-neutral-800"
        }
      `}
    >
      {label}
    </button>
  );
}
