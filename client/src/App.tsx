import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Discover from "@/pages/discover";
import EventDetails from "@/pages/event-details";
import TicketPurchase from "@/pages/ticket-purchase";
import TicketConfirmation from "@/pages/ticket-confirmation";
import Events from "@/pages/events";
import Tickets from "@/pages/tickets";
import Profile from "@/pages/profile";
import Scanner from "@/pages/scanner";
import CreateEvent from "@/pages/create-event";
import Navbar from "@/components/navbar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/events" component={Events} />
      <Route path="/event/:id" component={EventDetails} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/ticket/purchase/:eventId" component={TicketPurchase} />
      <Route path="/ticket/confirmation/:referenceNumber" component={TicketConfirmation} />
      <Route path="/profile" component={Profile} />
      <Route path="/scanner" component={Scanner} />
      <Route path="/create-event" component={CreateEvent} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen max-w-md mx-auto relative bg-neutral-900 text-neutral-50">
        <Navbar />
        <div className="pt-16">
          <Router />
        </div>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
