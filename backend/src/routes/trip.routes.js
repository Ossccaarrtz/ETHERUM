import express from 'express';
import { 
  createTrip, 
  getAllTrips, 
  getActiveTripsRoute, 
  getTripByIdRoute,
  checkDriverStatus,
  completeTrip 
} from '../controllers/trip.controller.js';

const router = express.Router();

/**
 * POST /api/trips
 * Create a new trip
 */
router.post('/', createTrip);

/**
 * GET /api/trips
 * Get all trips
 */
router.get('/', getAllTrips);

/**
 * GET /api/trips/active
 * Get all active trips
 */
router.get('/active', getActiveTripsRoute);

/**
 * PUT /api/trips/:tripId/complete
 * Complete a trip (mark as delivered)
 */
router.put('/:tripId/complete', completeTrip);

/**
 * GET /api/trips/driver/:driverName/status
 * Check if driver is on a trip
 */
router.get('/driver/:driverName/status', checkDriverStatus);

/**
 * GET /api/trips/:tripId
 * Get trip by ID
 */
router.get('/:tripId', getTripByIdRoute);

export default router;

