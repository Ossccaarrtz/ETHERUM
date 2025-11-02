import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Storage Service
 * Manages local records in db/records.json
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, '../../db');
const DB_PATH = path.join(DB_DIR, 'records.json');

/**
 * Initialize database file if not exists or is corrupted
 */
function initDB() {
  try {
    // Create db directory if it doesn't exist
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
      console.log('📁 Created db directory');
    }

    // Check if file exists and is valid
    if (fs.existsSync(DB_PATH)) {
      try {
        const content = fs.readFileSync(DB_PATH, 'utf-8').trim();
        
        // If file is empty or invalid, recreate it
        if (!content || content === '') {
          throw new Error('Empty file');
        }
        
        // Try to parse to validate JSON
        JSON.parse(content);
        
      } catch (parseError) {
        console.warn('⚠️  records.json is corrupted, recreating...');
        fs.writeFileSync(DB_PATH, JSON.stringify({ records: [] }, null, 2));
        console.log('✅ Database file recreated');
      }
    } else {
      // Create new file
      fs.writeFileSync(DB_PATH, JSON.stringify({ records: [] }, null, 2));
      console.log('✅ Database file created');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    // Force create valid JSON
    fs.writeFileSync(DB_PATH, JSON.stringify({ records: [] }, null, 2));
  }
}

/**
 * Read all records from database
 * @returns {Array} - Array of evidence records
 */
export function readRecords() {
  try {
    initDB();
    const data = fs.readFileSync(DB_PATH, 'utf-8').trim();
    
    // Handle empty file
    if (!data) {
      return [];
    }
    
    const parsed = JSON.parse(data);
    return parsed.records || [];
    
  } catch (error) {
    console.error('Error reading records:', error);
    // Reinitialize and return empty array
    initDB();
    return [];
  }
}

/**
 * Save a new evidence record
 * @param {Object} record - Evidence record object
 * @returns {Object} - Saved record with id
 */
export function saveRecord(record) {
  try {
    const records = readRecords();
    
    const newRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...record,
      createdAt: new Date().toISOString(),
    };
    
    records.push(newRecord);
    
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ records }, null, 2)
    );
    
    console.log(`✅ Record saved with ID: ${newRecord.id}`);
    return newRecord;
    
  } catch (error) {
    console.error('Error saving record:', error);
    throw new Error(`Failed to save record: ${error.message}`);
  }
}

/**
 * Find record by plate and timestamp
 * @param {string} plate - Vehicle plate
 * @param {number} timestamp - Unix timestamp
 * @returns {Object|null} - Found record or null
 */
export function findRecord(plate, timestamp) {
  try {
    const records = readRecords();
    return records.find(
      r => r.plate === plate && r.timestamp === timestamp
    ) || null;
  } catch (error) {
    console.error('Error finding record:', error);
    return null;
  }
}

/**
 * Get all records for a specific plate
 * @param {string} plate - Vehicle plate
 * @returns {Array} - Array of records
 */
export function getRecordsByPlate(plate) {
  try {
    const records = readRecords();
    // Case-insensitive search and also try with normalized plate (uppercase, trimmed)
    const normalizedPlate = plate.trim().toUpperCase();
    return records.filter(r => {
      const recordPlate = r.plate ? r.plate.trim().toUpperCase() : '';
      return recordPlate === normalizedPlate || r.plate === plate;
    });
  } catch (error) {
    console.error('Error getting records by plate:', error);
    return [];
  }
}

/**
 * Get all records
 * @returns {Array} - All records
 */
export function getAllRecords() {
  return readRecords();
}

/**
 * Find record by recordId (the blockchain recordId, not the local id)
 * @param {string} recordId - Record ID in format PLATE-TIMESTAMP
 * @returns {Object|null} - Found record or null
 */
export function findRecordByRecordId(recordId) {
  try {
    const records = readRecords();
    return records.find(r => r.recordId === recordId) || null;
  } catch (error) {
    console.error('Error finding record by recordId:', error);
    return null;
  }
}

/**
 * Delete record by ID
 * @param {string} id - Record ID
 * @returns {boolean} - Success status
 */
export function deleteRecord(id) {
  try {
    const records = readRecords();
    const filtered = records.filter(r => r.id !== id);
    
    if (filtered.length === records.length) {
      return false; // Record not found
    }
    
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify({ records: filtered }, null, 2)
    );
    
    console.log(`🗑️  Record deleted: ${id}`);
    return true;
    
  } catch (error) {
    console.error('Error deleting record:', error);
    return false;
  }
}
