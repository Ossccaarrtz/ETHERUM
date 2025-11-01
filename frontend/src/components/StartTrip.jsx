// src/components/StartTrip.jsx
import { useState } from "react";

export default function StartTrip({ onStart }) {
  const [tripId] = useState(() => "trip_" + Math.floor(Math.random() * 99999));

  return (
    <div className="bg-white border border-ct-border rounded-xl p-8 max-w-md mx-auto text-center">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Start New Trip</h2>
      <p className="text-sm text-slate-600 mb-6">
        This will register a new secure chain-of-custody session.
      </p>

      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500">Trip ID</div>
        <div className="font-mono text-lg text-ct-blue">{tripId}</div>
      </div>

      <button className="btn-primary w-full" onClick={() => onStart(tripId)}>
        Start Trip
      </button>
    </div>
  );
}
