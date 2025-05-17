import { timeEntries, type TimeEntry, type InsertTimeEntry, admins, type Admin, type InsertAdmin } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, like } from "drizzle-orm";

export interface IStorage {
  // Time entries
  getAllTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntriesByName(name: string): Promise<TimeEntry[]>;
  getTimeEntriesByDate(date: Date): Promise<TimeEntry[]>;
  getTimeEntriesByNameAndDate(name: string, date: Date): Promise<TimeEntry[]>;
  createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry>;
  
  // Admin authentication
  validateAdmin(username: string, password: string): Promise<boolean>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  // Time entries
  async getAllTimeEntries(): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries);
  }

  async getTimeEntriesByName(name: string): Promise<TimeEntry[]> {
    const normalizedName = name.toLowerCase();
    return await db.select().from(timeEntries)
      .where(like(timeEntries.name, `%${normalizedName}%`));
  }

  async getTimeEntriesByDate(date: Date): Promise<TimeEntry[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db.select().from(timeEntries)
      .where(and(
        gte(timeEntries.timestamp, startDate),
        lte(timeEntries.timestamp, endDate)
      ));
  }

  async getTimeEntriesByNameAndDate(name: string, date: Date): Promise<TimeEntry[]> {
    const normalizedName = name.toLowerCase();
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return await db.select().from(timeEntries)
      .where(and(
        like(timeEntries.name, `%${normalizedName}%`),
        gte(timeEntries.timestamp, startDate),
        lte(timeEntries.timestamp, endDate)
      ));
  }

  async createTimeEntry(entry: InsertTimeEntry): Promise<TimeEntry> {
    const result = await db.insert(timeEntries).values(entry).returning();
    return result[0];
  }
  
  // Admin authentication
  async validateAdmin(username: string, password: string): Promise<boolean> {
    const admin = await db.select().from(admins)
      .where(and(
        eq(admins.username, username),
        eq(admins.password, password)
      ));
    
    return admin.length > 0;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const result = await db.insert(admins).values(admin).returning();
    return result[0];
  }
}

// Comment out the MemStorage class as we're not using it anymore
export class MemStorage implements IStorage {
  private timeEntries: Map<number, TimeEntry>;
  private admins: Map<number, Admin>;
  private timeEntryId: number;
  private adminId: number;

  constructor() {
    this.timeEntries = new Map();
    this.admins = new Map();
    this.timeEntryId = 1;
    this.adminId = 1;
    
    // Create a default admin account
    this.createAdmin({
      username: "admin",
      password: "admin123",
    });
  }

  async getAllTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values());
  }

  async getTimeEntriesByName(name: string): Promise<TimeEntry[]> {
    const normalizedName = name.toLowerCase();
    return Array.from(this.timeEntries.values())
      .filter((entry) => entry.name.toLowerCase().includes(normalizedName));
  }

  async getTimeEntriesByDate(date: Date): Promise<TimeEntry[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return Array.from(this.timeEntries.values())
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= startDate && entryDate <= endDate;
      });
  }

  async getTimeEntriesByNameAndDate(name: string, date: Date): Promise<TimeEntry[]> {
    const normalizedName = name.toLowerCase();
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    return Array.from(this.timeEntries.values())
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        return entry.name.toLowerCase().includes(normalizedName) &&
               entryDate >= startDate && entryDate <= endDate;
      });
  }

  async createTimeEntry(insertEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.timeEntryId++;
    // Make sure we have a timestamp and isDriver values when creating entries
    const entry: TimeEntry = {
      ...insertEntry,
      id,
      timestamp: insertEntry.timestamp || new Date(),
      isDriver: insertEntry.isDriver !== undefined ? insertEntry.isDriver : false
    };
    this.timeEntries.set(id, entry);
    return entry;
  }

  async validateAdmin(username: string, password: string): Promise<boolean> {
    const admin = Array.from(this.admins.values())
      .find((admin) => admin.username === username && admin.password === password);
    
    return !!admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.adminId++;
    const admin: Admin = {
      ...insertAdmin,
      id,
    };
    this.admins.set(id, admin);
    return admin;
  }
}

// Initialize a default admin when using the database for the first time
const initializeDefaultAdmin = async () => {
  const dbStorage = new DatabaseStorage();
  try {
    // Check if we have any admins
    const allAdmins = await db.select().from(admins);
    if (allAdmins.length === 0) {
      // Create default admin
      await dbStorage.createAdmin({
        username: "admin",
        password: "admin123"
      });
      console.log("Default admin created");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
};

// Switch from memory storage to database storage
export const storage = new DatabaseStorage();

// Initialize the default admin
initializeDefaultAdmin();
