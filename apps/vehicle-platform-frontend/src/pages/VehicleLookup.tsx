import { useState } from 'react';
import { useVehicleLookup } from '../hooks/useVehicleLookup';

export default function VehicleLookup() {
  const [identifier, setIdentifier] = useState('');
  const { lookup, loading, error, report } = useVehicleLookup();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Vehicle Lookup</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter VIN or plate"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={() => lookup(identifier)}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          disabled={loading || !identifier}
        >
          {loading ? 'Searching...' : 'Lookup'}
        </button>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      {report && (
        <div className="mt-4 bg-white/5 p-4 rounded">
          <h3 className="text-lg font-medium">{report.make} {report.model} ({report.year})</h3>
          <p className="text-sm text-muted-foreground">VIN: {report.vin} | Plate: {report.plate}</p>
          <pre className="mt-2 text-sm bg-black/10 p-2 rounded overflow-auto">{JSON.stringify(report, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
