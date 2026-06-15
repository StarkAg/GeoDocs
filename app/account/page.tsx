'use client';

import { useEffect, useState } from 'react';
import { getDistricts } from '@/src/data/karnatakaLocations';

const accountActions = [
  {
    label: 'Saved locations',
    value: '0',
    icon: 'M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.25L6 21V4.75z',
  },
  {
    label: 'Downloads',
    value: '0',
    icon: 'M12 3v10m0 0l4-4m-4 4L8 9m-3 9h14',
  },
  {
    label: 'Districts',
    value: '',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
  },
];

const manageItems = [
  {
    label: 'My Orders',
    icon: 'M3 3h2l.4 2M7 13h9.5a2 2 0 001.9-1.37L20 7H6.2M7 13L5.4 5M7 13l-1 5h11M9 21a.5.5 0 100-1 .5.5 0 000 1zm7 0a.5.5 0 100-1 .5.5 0 000 1z',
  },
  {
    label: 'Saved Docs',
    icon: 'M6 4.75A2.75 2.75 0 018.75 2h6.5A2.75 2.75 0 0118 4.75V21l-6-3.25L6 21V4.75z',
  },
];

const supportItems = [
  {
    label: 'Help & Support',
    icon: 'M8.25 9a3.75 3.75 0 117.1 1.7c-.57 1.08-1.85 1.55-2.53 2.24-.45.46-.57.86-.57 1.56M12 18h.01',
  },
  {
    label: 'Request New Document',
    icon: 'M9 12h6m-3-3v6m-6.75 5.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z',
  },
];

export default function AccountPage() {
  const [districtCount, setDistrictCount] = useState(0);

  useEffect(() => {
    setDistrictCount(getDistricts().length);
  }, []);

  return (
    <div className="mx-auto max-w-2xl pb-28 sm:px-6 sm:py-10">
      <div className="bg-[#232326] px-4 pb-7 pt-8 text-white sm:rounded-[2rem]">
        <div className="mb-7 flex items-center justify-between">
          <button className="rounded-full p-2 text-white/80">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="rounded-full p-2 text-white/80">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.65-1.65a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ffc400] text-2xl font-bold text-slate-950">
            R
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">RIBIL User</p>
            <p className="text-sm text-white/70">Karnataka Land Records Explorer</p>
          </div>
        </div>
      </div>

      <div className="px-4">
      <div className="-mt-5 grid grid-cols-3 gap-3">
        {accountActions.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
            </div>
            <p className="text-lg font-bold text-slate-900">{item.label === 'Districts' ? districtCount : item.value}</p>
            <p className="text-[11px] font-medium text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <Section title="Manage" items={manageItems} />
      <Section title="Support" items={supportItems} />
      <FollowUs />
      <Section
        title="Others"
        items={[
          { label: 'Invite Your Friends', icon: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z' },
          { label: 'Terms Of Use', icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25v-5.25z' },
          { label: 'Delete Account', icon: 'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0' },
          { label: 'Privacy Policy', icon: 'M12 3.75l7.5 3v5.25c0 4.35-3.1 8.42-7.5 9.75-4.4-1.33-7.5-5.4-7.5-9.75V6.75l7.5-3z' },
          { label: 'End User License Agreement', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Logout', icon: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3-3h-9m9 0l-3-3m3 3l-3 3' },
        ]}
      />

      <p className="mt-8 px-2 text-xs leading-5 text-slate-500">Disclaimer: RIBIL is not government-affiliated. We do not represent any government entities that provide the data.</p>
      <p className="mt-5 text-center text-xs text-slate-400">Version: 1.0.0</p>
      </div>
    </div>
  );
}

const socials = [
  {
    label: 'Instagram',
    color: 'text-pink-600',
    icon: 'M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zm0 2A3.5 3.5 0 004 7.5v9A3.5 3.5 0 007.5 20h9a3.5 3.5 0 003.5-3.5v-9A3.5 3.5 0 0016.5 4h-9zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.5-2.75a.75.75 0 110 1.5.75.75 0 010-1.5z',
  },
  {
    label: 'Facebook',
    color: 'text-blue-600',
    icon: 'M22 12a10 10 0 10-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0022 12z',
  },
  {
    label: 'Youtube',
    color: 'text-red-600',
    icon: 'M23 7.5a3 3 0 00-2.1-2.13C19.08 5 12 5 12 5s-7.08 0-8.9.37A3 3 0 001 7.5 31 31 0 00.75 12 31 31 0 001 16.5a3 3 0 002.1 2.13C4.92 19 12 19 12 19s7.08 0 8.9-.37A3 3 0 0023 16.5 31 31 0 0023.25 12 31 31 0 0023 7.5zM9.75 15.25v-6.5l5.5 3.25-5.5 3.25z',
  },
];

function FollowUs() {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-xs font-semibold text-slate-500">Follow Us</h2>
      <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white p-4 shadow-sm">
        {socials.map((s) => (
          <button key={s.label} className="flex flex-col items-center gap-2">
            <svg className={`h-8 w-8 ${s.color}`} fill="currentColor" viewBox="0 0 24 24">
              <path d={s.icon} />
            </svg>
            <span className="text-xs font-semibold text-slate-700">{s.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: { label: string; icon: string }[];
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 px-1 text-xs font-semibold text-slate-500">{title}</h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm">
        {items.map((item) => (
          <button key={item.label} className="flex w-full items-center gap-3 px-4 py-4 text-left text-sm font-semibold text-slate-700">
            <svg className="h-5 w-5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className="min-w-0 flex-1">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
