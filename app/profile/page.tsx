export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-slate-900">Profile</h1>

      <div className="card overflow-hidden">
        <div className="flex flex-col items-center border-b border-slate-200 bg-slate-50/50 px-6 py-10">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
            GD
          </div>
          <p className="text-xl font-bold text-slate-900">GeoDocs User</p>
          <p className="text-slate-600">user@geodocs.com</p>
        </div>

        <ul className="divide-y divide-slate-200">
          {['Edit Profile', 'Settings', 'Help & Support', 'About'].map((label) => (
            <li key={label}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-6 py-4 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <span>{label}</span>
                <span className="text-primary">›</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="flex w-full items-center justify-between px-6 py-4 text-left font-semibold text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
