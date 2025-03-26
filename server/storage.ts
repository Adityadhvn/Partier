import {
  users,
  events,
  ticketTypes,
  performers,
  tickets,
  User,
  Event,
  TicketType,
  Performer,
  Ticket,
  InsertUser,
  InsertEvent,
  InsertTicketType,
  InsertPerformer,
  InsertTicket
} from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getFeaturedEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Ticket type operations
  getTicketTypesByEvent(eventId: number): Promise<TicketType[]>;
  getTicketType(id: number): Promise<TicketType | undefined>;
  createTicketType(ticketType: InsertTicketType): Promise<TicketType>;
  updateTicketType(id: number, ticketType: Partial<InsertTicketType>): Promise<TicketType | undefined>;
  
  // Performer operations
  getPerformersByEvent(eventId: number): Promise<Performer[]>;
  createPerformer(performer: InsertPerformer): Promise<Performer>;
  
  // Ticket operations
  getTicketsByUser(userId: number): Promise<Ticket[]>;
  getTicketsByEvent(eventId: number): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  getTicketByReference(referenceNumber: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  
  // Organizer operations
  getEventsByOrganizer(organizerId: number): Promise<Event[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private ticketTypes: Map<number, TicketType>;
  private performers: Map<number, Performer>;
  private tickets: Map<number, Ticket>;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private ticketTypeIdCounter: number;
  private performerIdCounter: number;
  private ticketIdCounter: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.ticketTypes = new Map();
    this.performers = new Map();
    this.tickets = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.ticketTypeIdCounter = 1;
    this.performerIdCounter = 1;
    this.ticketIdCounter = 1;
    
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getFeaturedEvents(): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.featured);
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Ticket type operations
  async getTicketTypesByEvent(eventId: number): Promise<TicketType[]> {
    return Array.from(this.ticketTypes.values()).filter(
      ticketType => ticketType.eventId === eventId
    );
  }
  
  async getTicketType(id: number): Promise<TicketType | undefined> {
    return this.ticketTypes.get(id);
  }
  
  async createTicketType(insertTicketType: InsertTicketType): Promise<TicketType> {
    const id = this.ticketTypeIdCounter++;
    const ticketType: TicketType = { ...insertTicketType, id };
    this.ticketTypes.set(id, ticketType);
    return ticketType;
  }
  
  async updateTicketType(id: number, ticketTypeUpdate: Partial<InsertTicketType>): Promise<TicketType | undefined> {
    const ticketType = this.ticketTypes.get(id);
    if (!ticketType) return undefined;
    
    const updatedTicketType = { ...ticketType, ...ticketTypeUpdate };
    this.ticketTypes.set(id, updatedTicketType);
    return updatedTicketType;
  }
  
  // Performer operations
  async getPerformersByEvent(eventId: number): Promise<Performer[]> {
    return Array.from(this.performers.values()).filter(
      performer => performer.eventId === eventId
    );
  }
  
  async createPerformer(insertPerformer: InsertPerformer): Promise<Performer> {
    const id = this.performerIdCounter++;
    const performer: Performer = { ...insertPerformer, id };
    this.performers.set(id, performer);
    return performer;
  }
  
  // Ticket operations
  async getTicketsByUser(userId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      ticket => ticket.userId === userId
    );
  }
  
  async getTicketsByEvent(eventId: number): Promise<Ticket[]> {
    return Array.from(this.tickets.values()).filter(
      ticket => ticket.eventId === eventId
    );
  }
  
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.get(id);
  }
  
  async getTicketByReference(referenceNumber: string): Promise<Ticket | undefined> {
    return Array.from(this.tickets.values()).find(
      ticket => ticket.referenceNumber === referenceNumber
    );
  }
  
  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.ticketIdCounter++;
    const ticket: Ticket = { 
      ...insertTicket, 
      id,
      purchaseDate: new Date()
    };
    this.tickets.set(id, ticket);
    return ticket;
  }
  
  // Organizer operations
  async getEventsByOrganizer(organizerId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      event => event.organizedById === organizerId
    );
  }
  
  // Seed with initial demo data
  private seedData() {
    // Create sample users
    const user1: User = {
      id: this.userIdCounter++,
      username: "johnsmith",
      password: "password123", // In a real app this would be hashed
      email: "john@example.com",
      fullName: "John Smith",
      isOrganizer: false,
    };
    
    const user2: User = {
      id: this.userIdCounter++,
      username: "eventorganizer",
      password: "password123", // In a real app this would be hashed
      email: "organizer@example.com",
      fullName: "Event Organizer",
      isOrganizer: true,
    };
    
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    
    // Create sample events
    const event1: Event = {
      id: this.eventIdCounter++,
      title: "Neon Dreams Festival",
      description: "Join us for a night of electronic music and visual spectacles at the Neon Dreams Festival. Featuring top DJs and performers from around the world, immersive light shows, and unforgettable experiences. This is the summer's most anticipated electronic music event with multiple stages and genres.",
      imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      date: new Date("2023-06-10T20:00:00"),
      location: "Warehouse District",
      address: "123 Main St",
      organizedById: user2.id,
      featured: true,
      tags: ["Electronic", "Festival", "DJ", "Live Music"],
    };
    
    const event2: Event = {
      id: this.eventIdCounter++,
      title: "Techno Underground",
      description: "Experience the best underground techno scene with internationally acclaimed DJs in an intimate venue.",
      imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      date: new Date("2023-06-15T22:00:00"),
      location: "Pulse Club",
      address: "456 Club Ave",
      organizedById: user2.id,
      featured: true,
      tags: ["Techno", "Underground", "DJ"],
    };
    
    const event3: Event = {
      id: this.eventIdCounter++,
      title: "Summer Bass Nights",
      description: "Feel the rhythm of summer with deep bass music all night long.",
      imageUrl: "https://images.unsplash.com/photo-1642207193107-490688c031f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      date: new Date("2023-06-20T21:00:00"),
      location: "Echo Lounge",
      address: "789 Sound Blvd",
      organizedById: user2.id,
      featured: false,
      tags: ["Bass", "Electronic", "Summer"],
    };
    
    const event4: Event = {
      id: this.eventIdCounter++,
      title: "Retro Wave Party",
      description: "Celebrate the sounds of the 80s and 90s with a night of retro electronic music.",
      imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      date: new Date("2023-06-22T22:00:00"),
      location: "Neon Club",
      address: "101 Retro Road",
      organizedById: user2.id,
      featured: false,
      tags: ["Retro", "Electronic", "Party"],
    };
    
    const event5: Event = {
      id: this.eventIdCounter++,
      title: "House Music Showcase",
      description: "Discover the latest trends in house music with talented local and international DJs.",
      imageUrl: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80",
      date: new Date("2023-06-25T20:00:00"),
      location: "Rhythm Hall",
      address: "202 Beat Street",
      organizedById: user2.id,
      featured: false,
      tags: ["House", "Electronic", "DJ"],
    };
    
    this.events.set(event1.id, event1);
    this.events.set(event2.id, event2);
    this.events.set(event3.id, event3);
    this.events.set(event4.id, event4);
    this.events.set(event5.id, event5);
    
    // Create sample ticket types
    const ticketType1: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event1.id,
      name: "General Admission",
      description: "Access to all areas except VIP",
      price: "45.00",
      available: 200,
    };
    
    const ticketType2: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event1.id,
      name: "VIP Access",
      description: "Premium viewing areas & complimentary drinks",
      price: "95.00",
      available: 50,
    };
    
    const ticketType3: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event1.id,
      name: "Early Entry",
      description: "Enter 1 hour before general admission",
      price: "65.00",
      available: 100,
    };
    
    const ticketType4: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event2.id,
      name: "Standard Entry",
      description: "Regular club access",
      price: "30.00",
      available: 150,
    };
    
    const ticketType5: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event3.id,
      name: "General Admission",
      description: "Basic entry to the event",
      price: "25.00",
      available: 100,
    };
    
    const ticketType6: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event4.id,
      name: "Standard Entry",
      description: "Regular club access",
      price: "30.00",
      available: 120,
    };
    
    const ticketType7: TicketType = {
      id: this.ticketTypeIdCounter++,
      eventId: event5.id,
      name: "General Admission",
      description: "Basic entry to the event",
      price: "35.00",
      available: 150,
    };
    
    this.ticketTypes.set(ticketType1.id, ticketType1);
    this.ticketTypes.set(ticketType2.id, ticketType2);
    this.ticketTypes.set(ticketType3.id, ticketType3);
    this.ticketTypes.set(ticketType4.id, ticketType4);
    this.ticketTypes.set(ticketType5.id, ticketType5);
    this.ticketTypes.set(ticketType6.id, ticketType6);
    this.ticketTypes.set(ticketType7.id, ticketType7);
    
    // Create sample performers
    const performer1: Performer = {
      id: this.performerIdCounter++,
      eventId: event1.id,
      name: "DJ Pulse",
      imageUrl: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1772&q=80",
      time: "10:00 PM",
      isHeadliner: true,
    };
    
    const performer2: Performer = {
      id: this.performerIdCounter++,
      eventId: event1.id,
      name: "Electra",
      imageUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80",
      time: "9:00 PM",
      isHeadliner: false,
    };
    
    const performer3: Performer = {
      id: this.performerIdCounter++,
      eventId: event1.id,
      name: "Synthesize",
      imageUrl: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
      time: "8:00 PM",
      isHeadliner: false,
    };
    
    this.performers.set(performer1.id, performer1);
    this.performers.set(performer2.id, performer2);
    this.performers.set(performer3.id, performer3);
    
    // Create a sample ticket
    const ticket1: Ticket = {
      id: this.ticketIdCounter++,
      userId: user1.id,
      eventId: event1.id,
      ticketTypeId: ticketType1.id,
      quantity: 1,
      totalPrice: "53.50", // Price + fees
      purchaseDate: new Date("2023-06-02T14:30:00"),
      referenceNumber: "NEO-1234567890",
      paymentDetails: {
        method: "Credit Card",
        last4: "4242",
        subtotal: "45.00",
        serviceFee: "5.00",
        tax: "3.50"
      },
    };
    
    this.tickets.set(ticket1.id, ticket1);
  }
}

export const storage = new MemStorage();
