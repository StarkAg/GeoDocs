import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Ribil',
  description: 'How Ribil handles your information.',
};

const LAST_UPDATED = '29 May 2026';
const CONTACT_EMAIL = 'dsomvanshi@in.sycomp.com';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10">
        <p className="text-sm font-medium text-emerald-600">Legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
      </header>

      <div className="prose prose-slate max-w-none space-y-8 text-[15px] leading-relaxed text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
          <p>
            Ribil (&quot;the app&quot;, &quot;we&quot;, &quot;us&quot;) provides public Karnataka land
            records, village maps, and property documents. We respect your privacy and collect as
            little information as possible to make the app work.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Information we collect</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Search and location queries</strong> you type (district, taluk, hobli,
              village, survey number). These are sent to the Karnataka government&apos;s public land
              records system to fetch the document you requested.
            </li>
            <li>
              <strong>Documents you save locally</strong> on your device. These stay on your
              device and are not uploaded to us.
            </li>
            <li>
              <strong>Basic technical information</strong> automatically sent by your browser or
              device, such as IP address, device type, and timestamps. We use this only to
              operate the service, prevent abuse, and debug issues.
            </li>
          </ul>
          <p>
            We do <strong>not</strong> collect your name, phone number, contacts, photos,
            precise GPS location, microphone, or any biometric data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">How we use information</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>To fetch and display the public land record you searched for.</li>
            <li>To keep the service running reliably and to prevent automated abuse.</li>
            <li>To improve the app based on aggregate, non-identifying usage patterns.</li>
          </ul>
          <p>We do not sell or rent your information to anyone.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Third-party services</h2>
          <p>
            To deliver land records and maps, Ribil communicates with the Karnataka government&apos;s
            public land records system (landrecords.karnataka.gov.in) through a proxy hosted on
            Cloudflare. Cloudflare may receive standard request metadata (IP, user agent, URL)
            to deliver and protect the service. See{' '}
            <a
              className="text-emerald-600 hover:text-emerald-700"
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cloudflare&apos;s privacy policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Data storage and retention</h2>
          <p>
            Search queries and technical logs are retained only as long as needed to operate the
            service (typically 30 days) and then deleted or anonymized. Documents you save are
            stored on your own device until you delete them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Children</h2>
          <p>
            Ribil is not directed at children under 13 and we do not knowingly collect personal
            information from them. If you believe a child has provided us with personal data,
            contact us and we will delete it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Your rights</h2>
          <p>
            You can stop using the app at any time and delete locally saved documents from
            within the app. If you want us to delete or disclose any information we hold about
            you, email us at the address below and we will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Security</h2>
          <p>
            Communication with Ribil is encrypted in transit using HTTPS. No system is perfectly
            secure, but we use reasonable measures to protect the data we handle.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be reflected on
            this page along with a new &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">Contact</h2>
          <p>
            Questions about this policy or your data? Email{' '}
            <a
              className="text-emerald-600 hover:text-emerald-700"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
