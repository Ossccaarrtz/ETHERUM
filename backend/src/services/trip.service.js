import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Trip Storage Service
 * Manages local trips in db/trips.json
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, '../../db');
const TRIPS_PATH = path.join(DB_DIR, 'trips.json');

/**
 * Initialize trips database file if not exists or is corrupted
 */
function initTripsDB() {
  try {
    // Create db directory if it doesn't exist
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('📁 Created db directory');
    }

    // Check if file exists and is valid
    if (fs.existsSync(TRIPS_PATH)) {
      try {
        const content = fs.readFileSync(TRIPS_PATH, 'utf-8').trim();
        
        // If file is empty or invalid, recreate it
        if (!content || content === '') {
          throw new Error('Empty file');
        }
        
        // Try to parse to validate JSON
        JSON.parse(content);
        
      } catch (parseError) {
        console.warn('⚠️  trips.json is corrupted, recreating...');
        fs.writeFileSync(TRIPS_PATH, JSON.stringify({ trips: [] }, null, 2));
        console.log('✅ Trips database file recreated');
      }
    } else {
      // Create new file
      fs.writeFileSync(TRIPS_PATH, JSON.stringify({ trips: [] }, null, 2));
      console.log('✅ Trips database file created');
    }
  } catch (error) {
    console.error('Error initializing trips database:', error);
    // Force create valid JSON
    fs.writeFileSync(TRIPS_PATH, JSON.stringify({ trips: [] }, null, 2));
  }
}

/**
 * Read all trips from database
 * @returns {Array} - Array of trip records
 */
export function readTrips() {
  try {
    initTripsDB();
    const data = fs.readFileSync(TRIPS_PATH, 'utf-8').trim();
    
    // Handle empty file
    if (!data) {
      return [];
    }
    
    const parsed = JSON.parse(data);
    return parsed.trips || [];
    
  } catch (error) {
    console.error('Error reading trips:', error);
    // Reinitialize and return empty array
    initTripsDB();
    return [];
  }
}

/**
 * Save a new trip
 * @param {Object} trip - Trip object
 * @returns {Object} - Saved trip with id
 */
export function saveTrip(trip) {
  try {
    const trips = readTrips();
    
    const newTrip = {
      id: `trip_${Date.now()}_${Math.floor(Math.random() * 99999)}`,
      ...trip,
      createdAt: new Date().toISOString(),
      status: 'active', // active, completed
    };
    
    trips.push(newTrip);
    
    fs.writeFileSync(
      TRIPS_PATH,
      JSON.stringify({ trips }, null, 2)
    );
    
    console.log(`✅ Trip saved with ID: ${newTrip.id}`);
    return newTrip;
    
  } catch (error) {
    console.error('Error saving trip:', error);
    throw new Error(`Failed to save trip: ${error.message}`);
  }
}

/**
 * Get active trips (trips that haven't been completed)
 * @returns {Array} - Array of active trips
 */
export function getActiveTrips() {
  try {
    const trips = readTrips();
    return trips.filter(t => t.status === 'active');
  } catch (error) {
    console.error('Error getting active trips:', error);
    return [];
  }
}

/**
 * Get active trip by driver name
 * @param {string} driverName - Driver name
 * @returns {Object|null} - Active trip for driver or null
 */
export function getActiveTripByDriver(driverName) {
  try {
    const activeTrips = getActiveTrips();
    return activeTrips.find(t => t.driver === driverName) || null;
  } catch (error) {
    console.error('Error getting active trip by driver:', error);
    return null;
  }
}

/**
 * Check if a driver is already on a trip
 * @param {string} driverName - Driver name
 * @returns {boolean} - True if driver has active trip
 */
export function isDriverOnTrip(driverName) {
  return getActiveTripByDriver(driverName) !== null;
}

/**
 * Get trip by ID
 * @param {string} tripId - Trip ID
 * @returns {Object|null} - Found trip or null
 */
export function getTripById(tripId) {
  try {
    const trips = readTrips();
    return trips.find(t => t.id === tripId) || null;
  } catch (error) {
    console.error('Error getting trip by ID:', error);
    return null;
  }
}

/**
 * Update trip status
 * @param {string} tripId - Trip ID
 * @param {string} status - New status (active, completed)
 * @returns {Object|null} - Updated trip or null
 */
export function updateTripStatus(tripId, status) {
  try {
    const trips = readTrips();
    const tripIndex = trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) {
      return null;
    }
    
    trips[tripIndex].status = status;
    trips[tripIndex].updatedAt = new Date().toISOString();
    
    fs.writeFileSync(
      TRIPS_PATH,
      JSON.stringify({ trips }, null, 2)
    );
    
    console.log(`✅ Trip ${tripId} status updated to ${status}`);
    return trips[tripIndex];
    
  } catch (error) {
    console.error('Error updating trip status:', error);
    return null;
  }
}


