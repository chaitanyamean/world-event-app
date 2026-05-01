interface POC {
  name: string;
  mobile: string;
}

export default function POCCard({ poc }: { poc: POC | null }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-5" style={{ border: '1px solid #D1E8DF' }}>
      <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#2D6A4F' }}>
        📞 Point of Contact
      </h2>
      {poc ? (
        <dl className="space-y-2 text-sm">
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Name</dt><dd className="text-gray-800 font-medium">{poc.name}</dd></div>
          <div><dt className="text-xs text-gray-400 uppercase tracking-wide">Mobile</dt><dd className="text-gray-700">{poc.mobile}</dd></div>
        </dl>
      ) : (
        <p className="text-sm text-gray-400 italic">Not Assigned</p>
      )}
    </div>
  );
}
