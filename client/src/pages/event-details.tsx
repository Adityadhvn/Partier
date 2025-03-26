import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Event, Performer, TicketType } from "@shared/schema";
import { ArrowLeft, Share, Calendar, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: event, isLoading: eventLoading } = useQuery<Event>({
    queryKey: [`/api/events/${id}`],
  });

  const { data: performers, isLoading: performersLoading } = useQuery<Performer[]>({
    queryKey: [`/api/events/${id}/performers`],
  });

  const { data: ticketTypes, isLoading: ticketTypesLoading } = useQuery<TicketType[]>({
    queryKey: [`/api/events/${id}/ticket-types`],
  });

  const handleBackClick = () => {
    navigate("/");
  };

  const handleBuyTickets = () => {
    navigate(`/ticket/purchase/${id}`);
  };

  if (eventLoading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return <div className="flex-1 p-4">Event not found</div>;
  }

  const lowestPrice = ticketTypes?.reduce((min, ticket) => {
    const price = parseFloat(ticket.price);
    return price < min ? price : min;
  }, Infinity) || 0;

  return (
    <div className="h-full flex flex-col pb-24">
      {/* Event Header Image and Back button */}
      <div className="relative h-64">
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
        
        <Button 
          size="icon"
          variant="outline"
          className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/50 border-0"
          onClick={handleBackClick}
        >
          <ArrowLeft className="text-white h-5 w-5" />
        </Button>
        
        <Button 
          size="icon"
          variant="outline"
          className="absolute top-12 right-4 w-10 h-10 rounded-full bg-black/50 border-0"
        >
          <Share className="text-white h-5 w-5" />
        </Button>
      </div>
      
      {/* Event Details */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 -mt-12 relative z-10">
        <div className="bg-neutral-800 rounded-xl p-5">
          <Badge className="bg-[#FF3D00] hover:bg-[#FF3D00] px-2 py-1 rounded text-xs font-medium inline-block">
            {event.featured ? 'FEATURED' : 'EVENT'}
          </Badge>
          <h1 className="font-display font-bold text-2xl mt-2 text-white">{event.title}</h1>
          
          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-secondary">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-neutral-400 text-sm">Date & Time</p>
                <p className="text-white font-medium">
                  {format(new Date(event.date), 'EEEE, MMMM d, yyyy • h:mm a')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-secondary">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-neutral-400 text-sm">Location</p>
                <p className="text-white font-medium">{event.location}, {event.address}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-secondary">
                <Ticket className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-neutral-400 text-sm">Ticket Price</p>
                <p className="text-white font-medium">
                  Starting from ${lowestPrice.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Description */}
        <div className="mt-6">
          <h2 className="font-display font-semibold text-xl text-white mb-2">About This Event</h2>
          <p className="text-neutral-300 leading-relaxed">
            {event.description}
          </p>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <Badge 
                key={index}
                variant="outline" 
                className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-sm border-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Line Up */}
        {performersLoading ? (
          <div className="mt-6">
            <h2 className="font-display font-semibold text-xl text-white mb-3">Line Up</h2>
            <PerformerSkeleton />
            <PerformerSkeleton />
            <PerformerSkeleton />
          </div>
        ) : performers && performers.length > 0 ? (
          <div className="mt-6">
            <h2 className="font-display font-semibold text-xl text-white mb-3">Line Up</h2>
            <div className="space-y-4">
              {performers.map((performer) => (
                <div key={performer.id} className="flex items-center">
                  <img 
                    src={performer.imageUrl} 
                    alt={performer.name} 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-white font-medium">{performer.name}</p>
                    <p className="text-neutral-400 text-sm">
                      {performer.isHeadliner ? 'Headliner • ' : ''}{performer.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      
      {/* Ticket Purchase Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 max-w-md mx-auto z-10 mb-16">
        <Button 
          className="w-full bg-primary hover:bg-primary-light text-white font-medium py-3 rounded-xl transition-colors"
          onClick={handleBuyTickets}
        >
          Buy Tickets - From ${lowestPrice.toFixed(2)}
        </Button>
      </div>
    </div>
  );
}

function EventDetailsSkeleton() {
  return (
    <div className="h-full flex flex-col">
      <div className="relative h-64">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="flex-1 px-4 -mt-12 relative z-10">
        <div className="bg-neutral-800 rounded-xl p-5">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-8 w-4/5 mb-4" />
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
            
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-40" />
              </div>
            </div>
            
            <div className="flex items-center">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-5 w-36" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-4" />
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-neutral-900 border-t border-neutral-800 max-w-md mx-auto z-10 mb-16">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

function PerformerSkeleton() {
  return (
    <div className="flex items-center mb-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="ml-3">
        <Skeleton className="h-5 w-32 mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
