import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          GeoDocs
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Geographic Documents — Karnataka land records & village maps
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/documents"
          className="card flex flex-col p-6 transition hover:shadow-md hover:border-primary/30"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">Documents</h2>
          <p className="mt-2 flex-1 text-sm text-slate-600">
            View and manage property documents and village maps
          </p>
          <span className="mt-4 text-sm font-medium text-primary">Open →</span>
        </Link>

        <Link
          href="/map"
          className="card flex flex-col p-6 transition hover:shadow-md hover:border-primary/30"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">Map View</h2>
          <p className="mt-2 flex-1 text-sm text-slate-600">
            View property locations on the map
          </p>
          <span className="mt-4 text-sm font-medium text-primary">Open →</span>
        </Link>

        <Link
          href="/search"
          className="card flex flex-col p-6 transition hover:shadow-md hover:border-primary/30"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">Village Search</h2>
          <p className="mt-2 flex-1 text-sm text-slate-600">
            Search by district, taluk, hobli & village to get PDF
          </p>
          <span className="mt-4 text-sm font-medium text-primary">Open →</span>
        </Link>

        <Link
          href="/profile"
          className="card flex flex-col p-6 transition hover:shadow-md hover:border-primary/30 sm:col-span-2 lg:col-span-1"
        >
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
          <p className="mt-2 flex-1 text-sm text-slate-600">
            Account settings and preferences
          </p>
          <span className="mt-4 text-sm font-medium text-primary">Open →</span>
        </Link>
      </div>
    </div>
  );
}
