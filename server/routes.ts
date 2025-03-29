import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertUserSchema, insertEventSchema, insertTicketTypeSchema, insertPerformerSchema, insertTicketSchema } from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import * as ExcelJS from 'exceljs';
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

// Middleware to ensure user is a super admin
function ensureSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user.isSuperAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden - Requires super admin role" });
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

  // Export routes
  app.get("/api/export/users", ensureOrganizer, async (req, res) => {
    try {
      // Create a directory for exports if it doesn't exist
      const exportDir = path.resolve('./exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Get all users
      const users = Array.from((await storage.getUsers()) || []);
      
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }

      // Create Excel workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');
      
      // Add columns
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Username', key: 'username', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Full Name', key: 'fullName', width: 30 },
        { header: 'Is Organizer', key: 'isOrganizer', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 20 }
      ];
      
      // Add rows
      users.forEach(user => {
        const userData = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          isOrganizer: user.isOrganizer ? 'Yes' : 'No',
          createdAt: 'N/A' // User type doesn't have createdAt, but we can include it for the export
        };
        worksheet.addRow(userData);
      });
      
      // Apply styles
      worksheet.getRow(1).font = { bold: true };
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `users_export_${timestamp}.xlsx`;
      const filePath = path.join(exportDir, filename);
      
      // Save workbook
      await workbook.xlsx.writeFile(filePath);
      
      // Send file
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        
        // Delete file after sending
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ message: "Failed to export users", error });
    }
  });

  app.get("/api/export/tickets", ensureOrganizer, async (req, res) => {
    try {
      // Create a directory for exports if it doesn't exist
      const exportDir = path.resolve('./exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Get all tickets
      const tickets = Array.from((await storage.getAllTickets()) || []);
      
      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ message: "No tickets found" });
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `ticket_sales_${timestamp}.csv`;
      const filePath = path.join(exportDir, filename);
      
      // Setup CSV writer
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'id', title: 'ID' },
          { id: 'referenceNumber', title: 'Reference Number' },
          { id: 'userId', title: 'User ID' },
          { id: 'userName', title: 'User Name' },
          { id: 'eventId', title: 'Event ID' },
          { id: 'eventName', title: 'Event Name' },
          { id: 'ticketTypeId', title: 'Ticket Type ID' },
          { id: 'ticketTypeName', title: 'Ticket Type' },
          { id: 'price', title: 'Price' },
          { id: 'purchaseDate', title: 'Purchase Date' },
          { id: 'status', title: 'Status' }
        ]
      });
      
      // Fetch related data for each ticket
      const csvRecords = await Promise.all(tickets.map(async (ticket) => {
        const user = await storage.getUser(ticket.userId);
        const event = await storage.getEvent(ticket.eventId);
        const ticketType = await storage.getTicketType(ticket.ticketTypeId);
        
        return {
          id: ticket.id,
          referenceNumber: ticket.referenceNumber,
          userId: ticket.userId,
          userName: user ? user.fullName : 'Unknown User',
          eventId: ticket.eventId,
          eventName: event ? event.title : 'Unknown Event',
          ticketTypeId: ticket.ticketTypeId,
          ticketTypeName: ticketType ? ticketType.name : 'Unknown Ticket Type',
          price: ticketType ? `$${ticketType.price}` : 'N/A',
          purchaseDate: ticket.purchaseDate ? new Date(ticket.purchaseDate).toLocaleString() : 'N/A',
          status: 'Issued' // Since Ticket type doesn't have status, defaulting to 'Issued'
        };
      }));
      
      // Write to CSV file
      await csvWriter.writeRecords(csvRecords);
      
      // Send file
      res.download(filePath, filename, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }
        
        // Delete file after sending
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error("Error exporting tickets:", error);
      res.status(500).json({ message: "Failed to export tickets", error });
    }
  });

  // Super Admin routes for managing organizer access
  app.get("/api/users", ensureSuperAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });

  // Update user organizer status
  app.put("/api/users/:id/organizer-status", ensureSuperAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const { isOrganizer } = req.body;
      
      if (typeof isOrganizer !== 'boolean') {
        return res.status(400).json({ message: "isOrganizer must be a boolean value" });
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the user with the new organizer status
      const updatedUser = await storage.updateUser(userId, { isOrganizer });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }
      
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update organizer status", error });
    }
  });

  return httpServer;
}
