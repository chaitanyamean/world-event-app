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
        <div className="space-y-3">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Name</dt>
              <dd className="text-gray-800 font-medium">{poc.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-400 uppercase tracking-wide">Mobile</dt>
              <dd className="text-gray-700">{poc.mobile}</dd>
            </div>
          </dl>
          <a
            href={`tel:${poc.mobile}`}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition active:opacity-80"
            style={{ backgroundColor: '#2D6A4F' }}
            aria-label={`Call ${poc.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
            </svg>
            Call {poc.name}
          </a>
        </div>
      ) : (
        <p className="text-sm text-gray-400 italic">Not Assigned</p>
      )}
    </div>
  );
}
