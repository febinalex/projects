import { type User, type InsertUser, type Theater, type InsertTheater, type Screen, type InsertScreen, type Review, type InsertReview } from "@shared/schema";
import { randomUUID } from "crypto";
import { parseKMLData } from "./kml-parser";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getTheaters(): Promise<Theater[]>;
  getTheatersByDistrict(district: string): Promise<Theater[]>;
  getTheater(id: string): Promise<Theater | undefined>;
  createTheater(theater: InsertTheater): Promise<Theater>;
  updateTheater(id: string, theater: Partial<Theater>): Promise<Theater | undefined>;
  
  getScreens(theaterId: string): Promise<Screen[]>;
  createScreen(screen: InsertScreen): Promise<Screen>;
  
  getReviews(theaterId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateTheaterRating(theaterId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private theaters: Map<string, Theater>;
  private screens: Map<string, Screen>;
  private reviews: Map<string, Review>;

  constructor() {
    this.users = new Map();
    this.theaters = new Map();
    this.screens = new Map();
    this.reviews = new Map();
    this.loadRealTheaterData();
  }

  private loadRealTheaterData() {
    try {
      const theaterDataList = parseKMLData();
      console.log(`Loading ${theaterDataList.length} theaters from KML data...`);
      
      for (const theaterData of theaterDataList) {
        const theaterId = randomUUID();
        
        // Calculate total capacity
        const totalCapacity = theaterData.screens.reduce((sum, screen) => sum + screen.capacity, 0);
        
        // Create theater record
        const theater: Theater = {
          id: theaterId,
          name: theaterData.name,
          district: theaterData.district,
          contact: theaterData.contact || null,
          website: theaterData.website || null,
          bookingUrl: theaterData.bookingUrl || null,
          totalScreens: theaterData.screens.length,
          totalCapacity,
          latitude: theaterData.latitude,
          longitude: theaterData.longitude,
          description: `${theaterData.name} is located in ${theaterData.district}, Kerala. It features ${theaterData.screens.length} screen${theaterData.screens.length > 1 ? 's' : ''} with a total capacity of ${totalCapacity} seats.`,
          averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating between 3-5
          totalReviews: Math.floor(Math.random() * 150) + 10,
          createdAt: new Date(),
        };
        
        this.theaters.set(theaterId, theater);
        
        // Create screen records
        for (const screenData of theaterData.screens) {
          const screen: Screen = {
            id: randomUUID(),
            theaterId,
            screenNumber: screenData.screenNumber,
            capacity: screenData.capacity,
            screenType: screenData.screenType || null,
            seatClasses: screenData.seatClasses,
          };
          
          this.screens.set(screen.id, screen);
        }
      }
      
      console.log(`Successfully loaded ${this.theaters.size} theaters and ${this.screens.size} screens`);
    } catch (error) {
      console.error('Failed to load real theater data:', error);
      console.log('Loading with sample data as fallback...');
      this.loadSampleData();
    }
  }

  private loadSampleData() {
    // Fallback sample data in case KML parsing fails
    const sampleTheater: Theater = {
      id: randomUUID(),
      name: 'Sample Cinema',
      district: 'Thiruvananthapuram',
      contact: '0471-SAMPLE',
      website: null,
      bookingUrl: null,
      totalScreens: 1,
      totalCapacity: 200,
      latitude: 8.5241,
      longitude: 76.9366,
      description: 'Sample theater for fallback',
      averageRating: 4.0,
      totalReviews: 25,
      createdAt: new Date(),
    };
    
    this.theaters.set(sampleTheater.id, sampleTheater);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTheaters(): Promise<Theater[]> {
    return Array.from(this.theaters.values());
  }

  async getTheatersByDistrict(district: string): Promise<Theater[]> {
    return Array.from(this.theaters.values()).filter(
      theater => theater.district.toLowerCase().includes(district.toLowerCase())
    );
  }

  async getTheater(id: string): Promise<Theater | undefined> {
    return this.theaters.get(id);
  }

  async createTheater(insertTheater: InsertTheater): Promise<Theater> {
    const id = randomUUID();
    const theater: Theater = {
      ...insertTheater,
      id,
      averageRating: 0,
      totalReviews: 0,
      createdAt: new Date(),
    };
    this.theaters.set(id, theater);
    return theater;
  }

  async updateTheater(id: string, updates: Partial<Theater>): Promise<Theater | undefined> {
    const theater = this.theaters.get(id);
    if (!theater) return undefined;

    const updatedTheater = { ...theater, ...updates };
    this.theaters.set(id, updatedTheater);
    return updatedTheater;
  }

  async getScreens(theaterId: string): Promise<Screen[]> {
    return Array.from(this.screens.values()).filter(
      screen => screen.theaterId === theaterId
    );
  }

  async createScreen(insertScreen: InsertScreen): Promise<Screen> {
    const id = randomUUID();
    const screen: Screen = { ...insertScreen, id };
    this.screens.set(id, screen);
    return screen;
  }

  async getReviews(theaterId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      review => review.theaterId === theaterId
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    await this.updateTheaterRating(insertReview.theaterId);
    return review;
  }

  async updateTheaterRating(theaterId: string): Promise<void> {
    const theater = this.theaters.get(theaterId);
    if (!theater) return;

    const reviews = await this.getReviews(theaterId);
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

    await this.updateTheater(theaterId, {
      averageRating,
      totalReviews: reviews.length,
    });
  }
}

export const storage = new MemStorage();