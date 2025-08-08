import { readFileSync } from 'fs';
import { Theater, Screen } from '@shared/schema';
import { randomUUID } from 'crypto';

export interface TheaterData {
  name: string;
  district: string;
  contact?: string;
  website?: string;
  bookingUrl?: string;
  latitude: number;
  longitude: number;
  screens: ScreenData[];
}

export interface ScreenData {
  screenNumber: number;
  capacity: number;
  screenType?: string;
  seatClasses: {
    className: string;
    seatCount: number;
    price: number;
  }[];
}

export function parseKMLData(): TheaterData[] {
  const kmlContent = readFileSync('attached_assets/Kerala Theater List.kml_1754654150742.xml', 'utf-8');
  const theaters: TheaterData[] = [];
  
  // Extract all Placemark sections
  const placemarkRegex = /<Placemark>(.*?)<\/Placemark>/gs;
  const placemarks = kmlContent.match(placemarkRegex) || [];
  
  for (const placemark of placemarks) {
    try {
      const theater = parseTheaterFromPlacemark(placemark);
      if (theater) {
        theaters.push(theater);
      }
    } catch (error) {
      console.error('Error parsing theater:', error);
    }
  }
  
  return theaters;
}

function parseTheaterFromPlacemark(placemark: string): TheaterData | null {
  try {
    // Extract name
    const nameMatch = placemark.match(/<name>(.*?)<\/name>/s);
    if (!nameMatch) return null;
    
    const name = nameMatch[1].trim().replace(/\n/g, ' ');
    
    // Extract coordinates
    const coordinatesMatch = placemark.match(/<coordinates>\s*([\d.-]+),([\d.-]+),[\d.-]+\s*<\/coordinates>/s);
    if (!coordinatesMatch) return null;
    
    const longitude = parseFloat(coordinatesMatch[1]);
    const latitude = parseFloat(coordinatesMatch[2]);
    
    // Extract district
    const districtMatch = placemark.match(/<Data name="District">\s*<value>(.*?)<\/value>/s);
    if (!districtMatch) return null;
    
    const district = districtMatch[1].trim();
    
    // Extract contact
    const contactMatch = placemark.match(/<Data name="Contact">\s*<value>(.*?)<\/value>/s);
    const contact = contactMatch ? contactMatch[1].trim() : undefined;
    
    // Extract website
    const websiteMatch = placemark.match(/<Data name="Website">\s*<value>(.*?)<\/value>/s);
    const website = websiteMatch && websiteMatch[1].trim() ? websiteMatch[1].trim() : undefined;
    
    // Extract booking site
    const bookingMatch = placemark.match(/<Data name="Booking Site">\s*<value>(.*?)<\/value>/s);
    let bookingUrl = undefined;
    if (bookingMatch && bookingMatch[1].trim()) {
      const urlMatch = bookingMatch[1].match(/https?:\/\/[^\s]+/);
      bookingUrl = urlMatch ? urlMatch[0] : undefined;
    }
    
    // Extract screen data
    const screens: ScreenData[] = [];
    for (let i = 1; i <= 12; i++) {
      const screenMatch = placemark.match(new RegExp(`<Data name="Screen ${i}"[^>]*>\\s*<value>(.*?)<\\/value>`, 's'));
      if (screenMatch && screenMatch[1].trim()) {
        const screenData = parseScreenData(i, screenMatch[1]);
        if (screenData) {
          screens.push(screenData);
        }
      }
    }
    
    if (screens.length === 0) {
      // Create a default screen if no screen data found
      screens.push({
        screenNumber: 1,
        capacity: 100,
        seatClasses: [{ className: 'General', seatCount: 100, price: 100 }]
      });
    }
    
    return {
      name,
      district,
      contact,
      website,
      bookingUrl,
      latitude,
      longitude,
      screens
    };
  } catch (error) {
    console.error('Error parsing placemark:', error);
    return null;
  }
}

function parseScreenData(screenNumber: number, screenText: string): ScreenData | null {
  if (!screenText.trim()) return null;
  
  const lines = screenText.split('\n').map(line => line.trim()).filter(line => line);
  if (lines.length === 0) return null;
  
  let capacity = 0;
  let screenType: string | undefined;
  const seatClasses: { className: string; seatCount: number; price: number; }[] = [];
  
  for (const line of lines) {
    // Parse capacity
    const capacityMatch = line.match(/Capacity\s*:\s*(\d+)/i);
    if (capacityMatch) {
      capacity = parseInt(capacityMatch[1]);
      continue;
    }
    
    // Parse screen type (4K Atmos, 2K, etc.)
    if (line.match(/4K|2K|Atmos|IMAX|Dolby/i) && !line.includes('₹') && !line.includes(':')) {
      screenType = line;
      continue;
    }
    
    // Parse seat classes with pricing
    const seatMatch = line.match(/([^:]+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?\s*₹/);
    if (seatMatch) {
      const className = seatMatch[1].trim();
      const seatCount = seatMatch[2] ? parseInt(seatMatch[2]) : 0;
      const price = seatMatch[3] ? parseInt(seatMatch[3]) : (seatMatch[2] ? parseInt(seatMatch[2]) : 100);
      
      seatClasses.push({
        className,
        seatCount: seatCount || Math.floor(capacity * 0.5), // Default to half capacity if no count
        price
      });
    }
  }
  
  // If no seat classes found, create a default one
  if (seatClasses.length === 0 && capacity > 0) {
    seatClasses.push({
      className: 'General',
      seatCount: capacity,
      price: 100
    });
  }
  
  // Adjust seat counts if they don't match capacity
  if (capacity > 0 && seatClasses.length > 0) {
    const totalSeats = seatClasses.reduce((sum, cls) => sum + cls.seatCount, 0);
    if (totalSeats !== capacity) {
      // Proportionally adjust seat counts
      const ratio = capacity / totalSeats;
      seatClasses.forEach(cls => {
        cls.seatCount = Math.round(cls.seatCount * ratio);
      });
    }
  }
  
  return {
    screenNumber,
    capacity: capacity || seatClasses.reduce((sum, cls) => sum + cls.seatCount, 0),
    screenType,
    seatClasses
  };
}