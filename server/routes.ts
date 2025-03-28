import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertUserSchema, insertEventSchema, insertTicketTypeSchema, insertPerformerSchema, insertTicketSchema } from "@shared/schema";
import { randomUUID } from "crypto";

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
}

// Middleware to ensure user is an organizer
function ensureOrganizer(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.isOrganizer) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Requires organizer role" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup passport authentication
  setupAuth(app);
  
  // Auth routes are now handled by passport in setupAuth
  // The following Auth routes are setup by passport:
  // - POST /api/register (user registration)
  // - POST /api/login (user login)
  // - POST /api/logout (user logout)
  // - GET /api/user (get current user)
  
  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events", error });
    }
  });
  
  app.get("/api/events/featured", async (req, res) => {
    try {
      const featuredEvents = await storage.getFeaturedEvents();
      res.status(200).json(featuredEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured events", error });
    }
  });
  
  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(200).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event", error });
    }
  });
  
  app.post("/api/events", ensureOrganizer, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data", error });
    }
  });
  
  app.put("/api/events/:id", ensureOrganizer, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const eventUpdate = req.body;
      const updatedEvent = await storage.updateEvent(eventId, eventUpdate);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(200).json(updatedEvent);
    } catch (error) {
      res.status(400).json({ message: "Failed to update event", error });
    }
  });
  
  app.delete("/api/events/:id", ensureOrganizer, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const deleted = await storage.deleteEvent(eventId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event", error });
    }
  });
  
  app.get("/api/events/:id/ticket-types", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const ticketTypes = await storage.getTicketTypesByEvent(eventId);
      res.status(200).json(ticketTypes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket types", error });
    }
  });
  
  app.post("/api/ticket-types", ensureOrganizer, async (req, res) => {
    try {
      const ticketTypeData = insertTicketTypeSchema.parse(req.body);
      const ticketType = await storage.createTicketType(ticketTypeData);
      res.status(201).json(ticketType);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket type data", error });
    }
  });
  
  app.put("/api/ticket-types/:id", ensureOrganizer, async (req, res) => {
    try {
      const ticketTypeId = parseInt(req.params.id);
      
      if (isNaN(ticketTypeId)) {
        return res.status(400).json({ message: "Invalid ticket type ID" });
      }
      
      const ticketTypeUpdate = req.body;
      const updatedTicketType = await storage.updateTicketType(ticketTypeId, ticketTypeUpdate);
      
      if (!updatedTicketType) {
        return res.status(404).json({ message: "Ticket type not found" });
      }
      
      res.status(200).json(updatedTicketType);
    } catch (error) {
      res.status(400).json({ message: "Failed to update ticket type", error });
    }
  });
  
  app.get("/api/events/:id/performers", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const performers = await storage.getPerformersByEvent(eventId);
      res.status(200).json(performers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch performers", error });
    }
  });
  
  app.post("/api/performers", ensureOrganizer, async (req, res) => {
    try {
      const performerData = insertPerformerSchema.parse(req.body);
      const performer = await storage.createPerformer(performerData);
      res.status(201).json(performer);
    } catch (error) {
      res.status(400).json({ message: "Invalid performer data", error });
    }
  });
  
  // Ticket routes
  app.get("/api/tickets/user/:userId", ensureAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const tickets = await storage.getTicketsByUser(userId);
      res.status(200).json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets", error });
    }
  });
  
  app.get("/api/tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket", error });
    }
  });
  
  app.get("/api/tickets/reference/:reference", async (req, res) => {
    try {
      const reference = req.params.reference;
      const ticket = await storage.getTicketByReference(reference);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.status(200).json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket", error });
    }
  });
  
  app.post("/api/tickets", ensureAuthenticated, async (req, res) => {
    try {
      // Generate a unique 5-digit reference number
      const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
      const referenceNumber = `TIX${randomDigits}`;
      
      // Add the reference number to the ticket data
      const ticketData = {
        ...req.body,
        referenceNumber,
      };
      
      // Validate the ticket data
      const validatedTicketData = insertTicketSchema.parse(ticketData);
      
      // Create the ticket
      const ticket = await storage.createTicket(validatedTicketData);
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ message: "Invalid ticket data", error });
    }
  });
  
  // Organizer routes
  app.get("/api/organizer/:id/events", ensureOrganizer, async (req, res) => {
    try {
      const organizerId = parseInt(req.params.id);
      
      if (isNaN(organizerId)) {
        return res.status(400).json({ message: "Invalid organizer ID" });
      }
      
      const events = await storage.getEventsByOrganizer(organizerId);
      res.status(200).json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch organizer events", error });
    }
  });

  return httpServer;
}
