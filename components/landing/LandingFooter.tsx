'use client';

import Link from 'next/link';
import Image from 'next/image';
import { socials } from './data';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            RIBIL<span className="text-amber-500">.</span>
          </span>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            India&apos;s trusted platform for Karnataka land records, village maps and property title verification.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {socials.map((s) => (
              <a key={s.alt} href={s.href} aria-label={s.alt} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 shadow-sm transition hover:bg-amber-500">
                <Image src={s.src} alt={s.alt} width={16} height={16} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Contact Us</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><a href="tel:+919177458818" className="hover:text-slate-900">+91 91774 58818</a></li>
            <li><a href="mailto:harshag954@gmail.com" className="hover:text-slate-900">harshag954@gmail.com</a></li>
            <li><Link href="/account" className="font-semibold text-amber-600 hover:text-amber-700">Get in touch →</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Legal</p>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/privacy" className="hover:text-slate-900">Privacy policy</Link></li>
            <li><Link href="/privacy" className="hover:text-slate-900">Terms of use</Link></li>
            <li><Link href="/privacy" className="hover:text-slate-900">License agreement</Link></li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Address</p>
          <address className="space-y-1 text-sm not-italic text-slate-600">
            <p className="font-semibold text-slate-700">Ribil</p>
            <p>Karnataka, India</p>
            <p>ribil.co</p>
          </address>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:px-6 lg:px-8">
          <p>Copyright © 2023–2025 Ribil. All Rights Reserved.</p>
          <p>Made for landowners across Karnataka.</p>
        </div>
      </div>
    </footer>
  );
}
