export default function MapPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Map View</h1>
      <div className="card flex min-h-[400px] flex-col items-center justify-center p-8">
        <div className="mb-4 rounded-full bg-primary/10 p-4">
          <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <p className="text-center text-slate-600">
          Map integration can be added here (e.g. Mapbox, Leaflet, or Google Maps).
        </p>
        <p className="mt-2 text-center text-sm text-slate-500">
          Use Documents or Village Search to fetch location-based PDFs.
        </p>
      </div>
    </div>
  );
}
