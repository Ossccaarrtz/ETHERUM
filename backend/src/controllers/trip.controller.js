import { saveTrip, readTrips, getActiveTrips, isDriverOnTrip, getTripById, updateTripStatus } from '../services/trip.service.js';

/**
 * Trip Controller
 * Handles trip creation and management
 */

/**
 * POST /api/trips
 * Create a new trip
 */
export async function createTrip(req, res) {
  try {
    const { driver, destination, truck, origin } = req.body;

    // Validate required fields
    if (!driver || !driver.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Driver name is required',
      });
    }

    if (!destination || !destination.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Destination is required',
      });
    }

    if (!truck || !truck.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Truck is required',
      });
    }

    // Check if driver is already on a trip
    if (isDriverOnTrip(driver)) {
      return res.status(400).json({
        success: false,
        error: `El chofer ${driver} ya está en un viaje activo`,
      });
    }

    // Create trip with origin (default or provided)
    const tripData = {
      driver: driver.trim(),
      destination: destination.trim(),
      truck: truck.trim(),
      origin: origin?.trim() || 'Centro de Distribucion MTY NL',
    };

    const trip = saveTrip(tripData);

    console.log(`✅ New trip created: ${trip.id} - Driver: ${trip.driver}`);

    return res.status(201).json({
      success: true,
      trip,
    });

  } catch (error) {
    console.error('❌ Create trip error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create trip',
    });
  }
}

/**
 * GET /api/trips
 * Get all trips
 */
export async function getAllTrips(req, res) {
  try {
    const trips = readTrips();
    
    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });

  } catch (error) {
    console.error('❌ Get trips error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get trips',
    });
  }
}

/**
 * GET /api/trips/active
 * Get all active trips
 */
export async function getActiveTripsRoute(req, res) {
  try {
    const activeTrips = getActiveTrips();
    
    return res.status(200).json({
      success: true,
      count: activeTrips.length,
      trips: activeTrips,
    });

  } catch (error) {
    console.error('❌ Get active trips error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get active trips',
    });
  }
}

/**
 * GET /api/trips/:tripId
 * Get trip by ID
 */
export async function getTripByIdRoute(req, res) {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
    }

    const trip = getTripById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    return res.status(200).json({
      success: true,
      trip,
    });

  } catch (error) {
    console.error('❌ Get trip error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get trip',
    });
  }
}

/**
 * GET /api/trips/driver/:driverName/status
 * Check if driver is on a trip
 */
export async function checkDriverStatus(req, res) {
  try {
    const { driverName } = req.params;

    if (!driverName) {
      return res.status(400).json({
        success: false,
        error: 'Driver name is required',
      });
    }

    const isOnTrip = isDriverOnTrip(driverName);

    return res.status(200).json({
      success: true,
      driver: driverName,
      isOnTrip,
    });

  } catch (error) {
    console.error('❌ Check driver status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to check driver status',
    });
  }
}

/**
 * PUT /api/trips/:tripId/complete
 * Complete a trip (mark as delivered)
 */
export async function completeTrip(req, res) {
  try {
    const { tripId } = req.params;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        error: 'Trip ID is required',
      });
    }

    const trip = getTripById(tripId);

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found',
      });
    }

    if (trip.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Trip is already completed',
      });
    }

    const updatedTrip = updateTripStatus(tripId, 'completed');

    if (!updatedTrip) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update trip status',
      });
    }

    console.log(`✅ Trip ${tripId} marked as completed. Driver ${trip.driver} is now available.`);

    return res.status(200).json({
      success: true,
      trip: updatedTrip,
      message: `Viaje completado. El chofer ${trip.driver} está disponible nuevamente.`,
    });

  } catch (error) {
    console.error('❌ Complete trip error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to complete trip',
    });
  }
}

