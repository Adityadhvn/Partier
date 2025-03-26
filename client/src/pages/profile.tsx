import { useState } from "react";
import { useLocation } from "wouter";
import { User, Lock, CreditCard, Heart, Bell, Settings, LogOut, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  
  // Mock user data - in a real app, this would come from auth context
  const user = {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    isOrganizer: false
  };
  
  const handleCreateEventClick = () => {
    navigate("/create-event");
  };
  
  const handleScannerClick = () => {
    navigate("/scanner");
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // In a real app, this would clear auth state
  };

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10">
        <h1 className="font-display font-bold text-2xl text-white">Profile</h1>
      </header>

      <main className="flex-1 px-4">
        {/* User Info */}
        <div className="mt-4 mb-6">
          <div className="flex items-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white text-xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h2 className="font-display font-semibold text-xl text-white">{user.name}</h2>
              <p className="text-neutral-400">{user.email}</p>
            </div>
          </div>
        </div>
        
        {/* Organizer Options (conditionally shown) */}
        {user.isOrganizer && (
          <div className="mb-6">
            <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">Organizer Options</h3>
            <div className="bg-neutral-800 rounded-xl overflow-hidden">
              <button 
                className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white"
                onClick={handleCreateEventClick}
              >
                <div className="flex items-center">
                  <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <CreditCard className="h-4 w-4 text-secondary" />
                  </span>
                  <span>Create New Event</span>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              </button>
              
              <button 
                className="w-full py-4 px-4 flex items-center justify-between text-white"
                onClick={handleScannerClick}
              >
                <div className="flex items-center">
                  <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
                      <polyline points="4 8 4 4 8 4"></polyline>
                      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                      <line x1="4" y1="12" x2="20" y2="12"></line>
                      <polyline points="16 4 20 4 20 8"></polyline>
                      <polyline points="4 16 4 20 8 20"></polyline>
                      <polyline points="16 20 20 20 20 16"></polyline>
                    </svg>
                  </span>
                  <span>Scan Tickets</span>
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-500" />
              </button>
            </div>
          </div>
        )}
        
        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">Account Settings</h3>
          <div className="bg-neutral-800 rounded-xl overflow-hidden">
            <button className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <User className="h-4 w-4 text-secondary" />
                </span>
                <span>Personal Information</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
            
            <button className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Lock className="h-4 w-4 text-secondary" />
                </span>
                <span>Security</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
            
            <button className="w-full py-4 px-4 flex items-center justify-between text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="h-4 w-4 text-secondary" />
                </span>
                <span>Payment Methods</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>
        
        {/* Preferences */}
        <div className="mb-6">
          <h3 className="font-medium text-neutral-400 uppercase text-sm mb-3">Preferences</h3>
          <div className="bg-neutral-800 rounded-xl overflow-hidden">
            <button className="w-full py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Heart className="h-4 w-4 text-secondary" />
                </span>
                <span>Favorite Events</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
            
            <div className="py-4 px-4 flex items-center justify-between border-b border-neutral-700 text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Bell className="h-4 w-4 text-secondary" />
                </span>
                <span>Notifications</span>
              </div>
              <Switch 
                checked={notifications} 
                onCheckedChange={setNotifications} 
                className="data-[state=checked]:bg-primary"
              />
            </div>
            
            <button className="w-full py-4 px-4 flex items-center justify-between text-white">
              <div className="flex items-center">
                <span className="bg-neutral-700 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <Settings className="h-4 w-4 text-secondary" />
                </span>
                <span>App Settings</span>
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-500" />
            </button>
          </div>
        </div>
        
        {/* Logout */}
        <Button 
          variant="outline"
          className="w-full py-4 mt-4 bg-neutral-800 border-0 text-red-500 font-medium"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </main>
    </div>
  );
}
