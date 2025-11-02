// src/components/StartTrip.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const DRIVERS = [
  "José Luis Ramírez Ortega",
  "Miguel Ángel Torres Mendoza",
  "Carlos Eduardo García Pineda",
  "Juan Manuel López Hernández",
  "Ricardo Antonio Flores Aguilar",
];

const DESTINATIONS = [
  "Centro de Distribucion Los Angeles, CA",
  "Centro de Distribucion Phoenix, AZ",
  "Centro de Distribucion Dallas, TX",
  "Centro de Distribucion Houston, TX",
  "Centro de Distribucion Atlanta, GA",
  "Centro de Distribucion Chicago, IL",
  "Centro de Distribucion Memphis, TN",
  "Centro de Distribucion Jacksonville, FL",
  "Centro de Distribucion Denver, CO",
  "Centro de Distribucion Columbus, OH",
];

const TRUCKS = [
  "TRUCK-001",
  "TRUCK-002",
  "TRUCK-003",
  "TRUCK-004",
  "TRUCK-005",
];

const ORIGIN = "Centro de Distribucion MTY NL";

export default function StartTrip({ onStart }) {
  const [driver, setDriver] = useState("");
  const [destination, setDestination] = useState("");
  const [truck, setTruck] = useState("");
  const [availableDrivers, setAvailableDrivers] = useState(DRIVERS);
  const [loading, setLoading] = useState(false);
  const [checkingDrivers, setCheckingDrivers] = useState(true);
  const [error, setError] = useState(null);

  // Check which drivers are available (not on a trip)
  useEffect(() => {
    const checkAvailableDrivers = async () => {
      try {
        setCheckingDrivers(true);
        const response = await axios.get("/api/trips/active");
        
        if (response.data.success) {
          const activeTrips = response.data.trips || [];
          const activeDrivers = activeTrips.map(trip => trip.driver);
          
          // Filter out drivers who are on active trips
          const available = DRIVERS.filter(d => !activeDrivers.includes(d));
          setAvailableDrivers(available);
        }
      } catch (err) {
        console.error("Error checking driver availability:", err);
        // On error, show all drivers but warn user
        setAvailableDrivers(DRIVERS);
      } finally {
        setCheckingDrivers(false);
      }
    };

    checkAvailableDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!driver || !destination || !truck) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/trips", {
        driver,
        destination,
        truck,
        origin: ORIGIN,
      });

      if (response.data.success) {
        const trip = response.data.trip;
        onStart(trip.id);
      } else {
        setError(response.data.error || "Error al crear el viaje");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Error al crear el viaje";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-ct-border rounded-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Start New Trip</h2>
        <p className="text-sm text-slate-600">
          This will register a new secure chain-of-custody session.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Origin (read-only) */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Punto de Origen
          </label>
          <input
            type="text"
            value={ORIGIN}
            disabled
            className="input bg-slate-50 text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* Driver Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Chofer <span className="text-red-500">*</span>
          </label>
          {checkingDrivers ? (
            <div className="input bg-slate-50 text-slate-500 text-center">
              Verificando disponibilidad...
            </div>
          ) : (
            <select
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
              className="input"
              required
            >
              <option value="">Selecciona un chofer</option>
              {availableDrivers.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          )}
          {availableDrivers.length === 0 && !checkingDrivers && (
            <p className="text-xs text-red-600 mt-1">
              Todos los choferes están en viaje activo
            </p>
          )}
        </div>

        {/* Destination Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Destino <span className="text-red-500">*</span>
          </label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input"
            required
          >
            <option value="">Selecciona un destino</option>
            {DESTINATIONS.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>

        {/* Truck Selection */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Camión <span className="text-red-500">*</span>
          </label>
          <select
            value={truck}
            onChange={(e) => setTruck(e.target.value)}
            className="input"
            required
          >
            <option value="">Selecciona un camión</option>
            {TRUCKS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || checkingDrivers || availableDrivers.length === 0}
          className="btn-primary w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creando viaje...
            </span>
          ) : (
            "Start Trip"
          )}
        </button>
      </form>
    </div>
  );
}
