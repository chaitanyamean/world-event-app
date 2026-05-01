interface Cab {
  driverName: string;
  driverMobile: string;
  vehicleNumber: string;
  pickupTime?: string;
  pickupLocation?: string;
  dropLocation?: string;
}

export default function CabCard({ cab }: { cab: Cab | null }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5" style={{ border: '1px solid #D1E8DF' }}>
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#2D6A4F' }}>
        🚕 Cab Details
      </h2>
      {cab ? (
        <dl className="space-y-2 text-sm">
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Driver</dt><dd className="text-gray-800 font-medium">{cab.driverName}</dd></div>
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Mobile</dt><dd className="text-gray-700">{cab.driverMobile}</dd></div>
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Vehicle</dt><dd className="text-gray-700">{cab.vehicleNumber}</dd></div>
          {cab.pickupTime && <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Pickup Time</dt><dd className="text-gray-700">{cab.pickupTime}</dd></div>}
          {cab.pickupLocation && <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Pickup Location</dt><dd className="text-gray-700">{cab.pickupLocation}</dd></div>}
          {cab.dropLocation && <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Drop Location</dt><dd className="text-gray-700">{cab.dropLocation}</dd></div>}
        </dl>
      ) : (
        <p className="text-sm text-gray-400 italic">Not Assigned</p>
      )}
    </div>
  );
}
