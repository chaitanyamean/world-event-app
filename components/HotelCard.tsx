interface Hotel {
  hotelName: string;
  address: string;
  checkInDate?: string | null;
  checkOutDate?: string | null;
  roomNumber?: string | null;
}

export default function HotelCard({ hotel }: { hotel: Hotel | null }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5" style={{ border: '1px solid #D1E8DF' }}>
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#2D6A4F' }}>
        🏨 Hotel Details
      </h2>
      {hotel ? (
        <dl className="space-y-2 text-sm">
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Hotel</dt><dd className="text-gray-800 font-medium">{hotel.hotelName}</dd></div>
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Address</dt><dd className="text-gray-700">{hotel.address}</dd></div>
          {hotel.checkInDate && (
            <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Check-in</dt><dd className="text-gray-700">{new Date(hotel.checkInDate).toLocaleDateString()}</dd></div>
          )}
          {hotel.checkOutDate && (
            <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Check-out</dt><dd className="text-gray-700">{new Date(hotel.checkOutDate).toLocaleDateString()}</dd></div>
          )}
          {hotel.roomNumber && (
            <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Room</dt><dd className="text-gray-700">{hotel.roomNumber}</dd></div>
          )}
        </dl>
      ) : (
        <p className="text-sm text-gray-400 italic">Not Assigned</p>
      )}
    </div>
  );
}
