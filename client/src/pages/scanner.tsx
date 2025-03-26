import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, XCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Ticket, Event, TicketType } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function Scanner() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(true);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");

  const { data: ticket, isLoading: ticketLoading } = useQuery<Ticket>({
    queryKey: scannedCode ? [`/api/tickets/reference/${scannedCode}`] : null,
    enabled: !!scannedCode,
    retry: false,
    onSuccess: () => {
      setValidationStatus("success");
      toast({
        title: "Valid Ticket",
        description: "The ticket has been successfully validated.",
        variant: "default",
      });
      // Play success sound
      const audio = new Audio("/assets/success.mp3");
      audio.play().catch(() => {}); // Catch and ignore errors if audio can't play
    },
    onError: () => {
      setValidationStatus("error");
      toast({
        title: "Invalid Ticket",
        description: "This ticket could not be validated. Please try again.",
        variant: "destructive",
      });
      // Play error sound
      const audio = new Audio("/assets/error.mp3");
      audio.play().catch(() => {}); // Catch and ignore errors if audio can't play
    }
  });

  const { data: event } = useQuery<Event>({
    queryKey: ticket ? [`/api/events/${ticket.eventId}`] : null,
    enabled: !!ticket
  });

  const { data: ticketType } = useQuery<TicketType>({
    queryKey: ticket ? [`/api/ticket-types/${ticket.ticketTypeId}`] : null,
    enabled: !!ticket
  });

  // Reset validation status when scanning again
  useEffect(() => {
    if (scanning) {
      setValidationStatus("idle");
      setScannedCode(null);
    }
  }, [scanning]);

  const handleScan = (result: any) => {
    if (result?.text && scanning) {
      setScannedCode(result.text);
      setScanning(false);
    }
  };

  const handleScanAgain = () => {
    setScanning(true);
  };

  const handleBackClick = () => {
    navigate("/profile");
  };

  return (
    <div className="flex-1 flex flex-col pb-20">
      <header className="px-4 pt-12 pb-4 bg-neutral-900 sticky top-0 z-10 flex items-center">
        <Button 
          size="icon"
          variant="outline"
          className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center mr-4 border-0"
          onClick={handleBackClick}
        >
          <ArrowLeft className="text-white h-5 w-5" />
        </Button>
        <h1 className="font-display font-bold text-xl text-white">Scan Tickets</h1>
      </header>

      <main className="flex-1 px-4 flex flex-col items-center">
        {scanning ? (
          <>
            <div className="mt-8 mb-4 text-center">
              <h2 className="font-display font-semibold text-lg text-white mb-2">Scan QR Code</h2>
              <p className="text-neutral-400 text-sm">
                Position the QR code within the frame to validate the ticket
              </p>
            </div>

            <div className="w-full max-w-xs mx-auto aspect-square relative mb-8 overflow-hidden rounded-xl border-2 border-dashed border-neutral-500">
              <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800">
                <QrCode className="w-16 h-16 text-neutral-400 mb-4" />
                <input 
                  type="text" 
                  placeholder="Enter ticket code (e.g., TIX-ABCDEF-123456)"
                  className="bg-neutral-700 border-0 text-white p-2 rounded w-4/5"
                  value={scannedCode || ''}
                  onChange={(e) => setScannedCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && scannedCode) {
                      setScanning(false);
                    }
                  }}
                />
                <Button 
                  className="mt-3 bg-primary hover:bg-primary-light text-white"
                  onClick={() => {
                    if (scannedCode) setScanning(false);
                  }}
                >
                  Validate
                </Button>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary"></div>
                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary"></div>
              </div>
            </div>

            <p className="text-sm text-neutral-400 text-center">
              Make sure the entire QR code is visible and well-lit
            </p>
          </>
        ) : (
          <div className="w-full py-8 flex flex-col items-center">
            {validationStatus === "success" && ticket && event && ticketType ? (
              <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                  </div>
                </div>
                
                <h2 className="text-xl font-display font-semibold text-white text-center mb-6">
                  Ticket Validated
                </h2>
                
                <div className="bg-neutral-800 rounded-xl overflow-hidden mb-6">
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-white">{event.title}</h3>
                    <p className="text-neutral-400 text-sm">
                      {format(new Date(event.date), 'MMMM d, yyyy • h:mm a')}
                    </p>
                    <p className="text-neutral-400 text-sm">{event.location}</p>
                  </div>
                  
                  <div className="p-4 border-t border-neutral-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-neutral-400 text-sm">Ticket Type</p>
                        <p className="text-white font-medium">{ticketType.name}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Quantity</p>
                        <p className="text-white font-medium">{ticket.quantity}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Reference</p>
                        <p className="text-white font-medium">#{ticket.referenceNumber}</p>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm">Purchase Date</p>
                        <p className="text-white font-medium">
                          {format(new Date(ticket.purchaseDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : validationStatus === "error" ? (
              <div className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-500" />
                  </div>
                </div>
                
                <h2 className="text-xl font-display font-semibold text-white text-center mb-2">
                  Invalid Ticket
                </h2>
                
                <p className="text-neutral-400 text-center mb-6">
                  This ticket could not be validated. It may be invalid, already used, or for a different event.
                </p>
                
                <div className="bg-neutral-800 rounded-xl p-4 mb-6">
                  <p className="text-neutral-400 text-sm mb-1">Scanned Code:</p>
                  <p className="text-white font-mono text-sm break-all">{scannedCode}</p>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            <Button 
              className="mt-6 bg-primary hover:bg-primary-light text-white font-medium py-3 px-6 rounded-full"
              onClick={handleScanAgain}
            >
              Scan Another Ticket
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
