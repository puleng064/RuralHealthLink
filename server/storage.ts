import { users, appointments, symptoms, contacts, type User, type InsertUser, type Appointment, type InsertAppointment, type Symptom, type InsertSymptom, type Contact, type InsertContact } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getAllAppointments(): Promise<Appointment[]>;

  // Symptom methods
  getSymptom(id: number): Promise<Symptom | undefined>;
  getSymptomsByUserId(userId: number): Promise<Symptom[]>;
  createSymptom(symptom: InsertSymptom): Promise<Symptom>;
  updateSymptom(id: number, updates: Partial<Symptom>): Promise<Symptom | undefined>;
  deleteSymptom(id: number): Promise<boolean>;
  getAllSymptoms(): Promise<Symptom[]>;

  // Contact methods
  createContact(contact: InsertContact): Promise<Contact>;
  getAllContacts(): Promise<Contact[]>;
  deleteContact(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private appointments: Map<number, Appointment>;
  private symptoms: Map<number, Symptom>;
  private contacts: Map<number, Contact>;
  private currentUserId: number;
  private currentAppointmentId: number;
  private currentSymptomId: number;
  private currentContactId: number;

  constructor() {
    this.users = new Map();
    this.appointments = new Map();
    this.symptoms = new Map();
    this.contacts = new Map();
    this.currentUserId = 1;
    this.currentAppointmentId = 1;
    this.currentSymptomId = 1;
    this.currentContactId = 1;

    // Create default admin user
    const adminUser: User = {
      id: this.currentUserId++,
      username: "admin",
      email: "admin@ruralhealthtracker.com",
      password: "admin123",
      firstName: "Admin",
      lastName: "User",
      gender: "Other",
      dateOfBirth: "1990-01-01",
      isAdmin: true,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      isAdmin: false 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId,
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      status: "scheduled",
      createdAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  // Symptom methods
  async getSymptom(id: number): Promise<Symptom | undefined> {
    return this.symptoms.get(id);
  }

  async getSymptomsByUserId(userId: number): Promise<Symptom[]> {
    return Array.from(this.symptoms.values()).filter(
      (symptom) => symptom.userId === userId,
    );
  }

  async createSymptom(insertSymptom: InsertSymptom): Promise<Symptom> {
    const id = this.currentSymptomId++;
    const symptom: Symptom = { 
      id,
      userId: insertSymptom.userId,
      dateTime: insertSymptom.dateTime,
      category: insertSymptom.category,
      description: insertSymptom.description,
      severity: insertSymptom.severity,
      notes: insertSymptom.notes || null,
      createdAt: new Date() 
    };
    this.symptoms.set(id, symptom);
    return symptom;
  }

  async updateSymptom(id: number, updates: Partial<Symptom>): Promise<Symptom | undefined> {
    const symptom = this.symptoms.get(id);
    if (!symptom) return undefined;
    
    const updatedSymptom = { ...symptom, ...updates };
    this.symptoms.set(id, updatedSymptom);
    return updatedSymptom;
  }

  async deleteSymptom(id: number): Promise<boolean> {
    return this.symptoms.delete(id);
  }

  async getAllSymptoms(): Promise<Symptom[]> {
    return Array.from(this.symptoms.values());
  }

  // Contact methods
  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const contact: Contact = { 
      ...insertContact, 
      id, 
      createdAt: new Date() 
    };
    this.contacts.set(id, contact);
    return contact;
  }

  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }
}

export const storage = new MemStorage();
