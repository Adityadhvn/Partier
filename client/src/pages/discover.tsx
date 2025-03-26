import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Event } from "@shared/schema";

export default function Discover() {
  const [, navigate] = useLocation();
  const [activeCategory, setActiveCategory] = useState("All Events");

  const { data: featuredEvents, isLoading: featuredLoading } = useQuery<Event[]>({
    queryKey: ["/api/events/featured"],
  });

  const { data: allEvents, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const categories = ["All Events", "Nightlife", "Live Music", "DJ Sets", "Festivals"];

  const filteredEvents = allEvents?.filter(event => {
    if (activeCategory === "All Events") return true;
    return event.tags.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col pb-20">
      {/* Header */}
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Discover</h1>
            <p className="text-neutral-400 text-sm">Find and book the best events</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-neutral-800 border-0">
              <Search className="text-neutral-400 h-5 w-5" />
            </Button>
            <Button size="icon" variant="outline" className="rounded-full h-10 w-10 bg-neutral-800 border-0">
              <Bell className="text-neutral-400 h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="mt-4 flex space-x-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={activeCategory === category ? "default" : "outline"} 
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeCategory === category 
                  ? "bg-primary text-white" 
                  : "bg-neutral-800 text-neutral-300 border-0"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 pb-20 overflow-y-auto">
        {/* Featured Events */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-xl text-white">Featured Events</h2>
            <Button variant="link" className="text-secondary text-sm font-medium p-0">
              See all
            </Button>
          </div>
          
          <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
            <div className="flex space-x-4">
              {featuredLoading ? (
                <>
                  <FeaturedEventSkeleton />
                  <FeaturedEventSkeleton />
                </>
              ) : (
                featuredEvents?.map((event) => (
                  <FeaturedEventCard 
                    key={event.id} 
                    event={event} 
                    onClick={() => navigate(`/event/${event.id}`)} 
                  />
                ))
              )}
            </div>
          </div>
        </section>
        
        {/* Trending Now */}
        <section className="mb-8">
          <h2 className="font-display font-semibold text-xl text-white mb-4">Trending Now</h2>
          
          {eventsLoading ? (
            <>
              <EventCardSkeleton />
              <EventCardSkeleton />
              <EventCardSkeleton />
            </>
          ) : (
            filteredEvents?.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onGetTickets={() => navigate(`/ticket/purchase/${event.id}`)}
                onClick={() => navigate(`/event/${event.id}`)}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

interface FeaturedEventCardProps {
  event: Event;
  onClick: () => void;
}

function FeaturedEventCard({ event, onClick }: FeaturedEventCardProps) {
  return (
    <div 
      className="relative min-w-[280px] h-48 rounded-xl overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <img 
        src={event.imageUrl} 
        alt={event.title} 
        className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
        <Badge className="bg-[#FF3D00] hover:bg-[#FF3D00] px-2 py-1 rounded text-xs font-medium inline-block w-fit mb-2">
          {event.featured ? 'FEATURED' : 'HOT'}
        </Badge>
        <h3 className="font-display font-semibold text-white">{event.title}</h3>
        <div className="flex items-center mt-1 text-sm text-neutral-300">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{format(new Date(event.date), 'MMMM d, h:mm a')}</span>
        </div>
        <div className="flex items-center mt-1 text-sm text-neutral-300">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{event.location}</span>
        </div>
      </div>
    </div>
  );
}

interface EventCardProps {
  event: Event;
  onGetTickets: () => void;
  onClick: () => void;
}

function EventCard({ event, onGetTickets, onClick }: EventCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    onClick();
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGetTickets();
  };

  // Find the lowest price ticket for this event
  const price = "25.00"; // In a real app, this would come from the API

  return (
    <div className="bg-neutral-800 rounded-xl p-4 mb-4 flex cursor-pointer" onClick={handleClick}>
      <img 
        src={event.imageUrl} 
        alt={event.title} 
        className="h-24 w-24 rounded-lg object-cover"
      />
      <div className="ml-4 flex-1">
        <h3 className="font-display font-semibold text-white">{event.title}</h3>
        <div className="flex items-center mt-1 text-sm text-neutral-400">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{format(new Date(event.date), 'MMMM d, h:mm a')}</span>
        </div>
        <div className="flex items-center mt-1 text-sm text-neutral-400">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{event.location}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-white font-medium">${price}</span>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary-light text-white text-sm py-1 px-3 rounded-full font-medium transition-colors h-8"
            onClick={handleButtonClick}
          >
            Get Tickets
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeaturedEventSkeleton() {
  return (
    <div className="relative min-w-[280px] h-48 rounded-xl overflow-hidden">
      <Skeleton className="w-full h-full" />
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="bg-neutral-800 rounded-xl p-4 mb-4 flex">
      <Skeleton className="h-24 w-24 rounded-lg" />
      <div className="ml-4 flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-2/3 mb-2" />
        <div className="flex justify-between items-center mt-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}
