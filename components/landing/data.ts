// Content model for the Ribil desktop marketing homepage.
// Karnataka-first catalog modelled on mypatta.in's structure.

export type DocCategory = 'rtc-ec' | 'maps' | 'tax';

export interface DocItem {
  label: string;
  sub: string; // Kannada label
  category: DocCategory;
  href: string;
}

export const states = [
  'Karnataka',
  'Andhra Pradesh',
  'Tamil Nadu',
  'Telangana',
  'Kerala',
  'Maharashtra',
  'Madhya Pradesh',
  'Gujarat',
  'Delhi',
];

export const documents: DocItem[] = [
  { label: 'RTC / Pahani', sub: 'ಪಹಣಿ (ಆರ್‌ಟಿಸಿ)', category: 'rtc-ec', href: '/documents' },
  { label: 'Signed RTC / Certified RTC', sub: 'ಸಹಿ ಮಾಡಿದ ಪಹಣಿ', category: 'rtc-ec', href: '/documents' },
  { label: 'Mutation Register (MR)', sub: 'ಮ್ಯುಟೇಶನ್ ರಿಜಿಸ್ಟರ್', category: 'rtc-ec', href: '/documents' },
  { label: 'Sale Deed (Certified Copy)', sub: 'ಕ್ರಯಪತ್ರ ನಕಲು', category: 'rtc-ec', href: '/documents' },
  { label: 'Encumbrance Certificate (EC)', sub: 'ಋಣಭಾರ ಪ್ರಮಾಣಪತ್ರ', category: 'rtc-ec', href: '/documents' },
  { label: 'Khata Certificate', sub: 'ಖಾತಾ ಪ್ರಮಾಣಪತ್ರ', category: 'rtc-ec', href: '/documents' },
  { label: 'Khata Extract', sub: 'ಖಾತಾ ಉತ್ತಾರ', category: 'rtc-ec', href: '/documents' },
  { label: 'Genealogy Tree (Vamshavruksha)', sub: 'ವಂಶವೃಕ್ಷ', category: 'rtc-ec', href: '/documents' },
  { label: 'Village Map', sub: 'ಗ್ರಾಮ ನಕ್ಷೆ', category: 'maps', href: '/documents/village-map' },
  { label: 'Survey Map (Tippani)', sub: 'ಟಿಪ್ಪಣಿ / ಸರ್ವೆ ನಕ್ಷೆ', category: 'maps', href: '/documents' },
  { label: 'Akarband', sub: 'ಆಕಾರ್‌ಬಂದ್', category: 'maps', href: '/documents' },
  { label: 'Atlas / Hissa Map', sub: 'ಹಿಸ್ಸಾ ನಕ್ಷೆ', category: 'maps', href: '/documents' },
  { label: '11E Sketch', sub: '11ಇ ಸ್ಕೆಚ್', category: 'maps', href: '/documents' },
  { label: 'Land Conversion Order', sub: 'ಭೂ ಪರಿವರ್ತನೆ ಆದೇಶ', category: 'maps', href: '/documents' },
  { label: 'Property Tax Receipt', sub: 'ಆಸ್ತಿ ತೆರಿಗೆ ರಸೀದಿ', category: 'tax', href: '/documents' },
  { label: 'Khata Amalgamation', sub: 'ಖಾತಾ ವಿಲೀನ', category: 'tax', href: '/documents' },
];

export const docTabs: { id: 'all' | DocCategory; label: string }[] = [
  { id: 'all', label: 'All Documents' },
  { id: 'rtc-ec', label: 'RTC / EC Documents' },
  { id: 'maps', label: 'Property / Land Maps' },
  { id: 'tax', label: 'Tax Receipts' },
];

export const trending = ['RTC / Pahani', 'Encumbrance Certificate (EC)', 'Village Map'];

export interface NavGroup {
  title: string;
  items: { label: string; sub?: string; href: string }[];
}

export const productMenu: NavGroup[] = [
  {
    title: 'Land Records',
    items: [
      { label: 'RTC / Pahani', sub: 'Record of rights', href: '/documents' },
      { label: 'Signed / Certified RTC', sub: 'Digitally signed', href: '/documents' },
      { label: 'Mutation Register', sub: 'Khata transfer', href: '/documents' },
      { label: 'Encumbrance Certificate', sub: 'EC search', href: '/documents' },
      { label: 'Khata Certificate & Extract', sub: 'BBMP / Panchayat', href: '/documents' },
      { label: 'Genealogy Tree', sub: 'Vamshavruksha', href: '/documents' },
    ],
  },
  {
    title: 'Maps & Sketches',
    items: [
      { label: 'Village Map', sub: 'Survey boundary layout', href: '/documents/village-map' },
      { label: 'Survey Map / Tippani', sub: 'Coordinates & area', href: '/documents' },
      { label: 'Akarband', sub: 'Survey register', href: '/documents' },
      { label: 'Atlas / Hissa Map', sub: 'Sub-division map', href: '/documents' },
      { label: '11E Sketch', sub: 'Splitting of survey no.', href: '/documents' },
    ],
  },
  {
    title: 'Deeds & Tax',
    items: [
      { label: 'Sale Deed Copy', sub: 'Certified copy', href: '/documents' },
      { label: 'Property Tax Receipt', sub: 'Latest paid receipt', href: '/documents' },
      { label: 'Land Conversion Order', sub: 'DC conversion', href: '/documents' },
      { label: 'Khata Amalgamation', sub: 'Merge khatas', href: '/documents' },
    ],
  },
];

export const servicesMenu: NavGroup[] = [
  {
    title: 'Expert Services',
    items: [
      { label: 'Consult Expert', sub: 'For property issues', href: '/account' },
      { label: 'Consult Lawyer', sub: 'For property disputes', href: '/account' },
      { label: 'Verify Property', sub: 'Before buying', href: '/account' },
      { label: 'Legal Opinion', sub: 'Before buying', href: '/account' },
      { label: 'Property Search By Name', sub: 'Document retrieval', href: '/account' },
    ],
  },
  {
    title: 'Property Utilities',
    items: [
      { label: 'Find Your SRO', sub: 'Sub-registrar office', href: '/account' },
      { label: 'Guideline Value', sub: 'Govt. valuation', href: '/account' },
      { label: 'Stamp Duty Calculator', sub: 'Estimate charges', href: '/account' },
      { label: 'Rental Agreement', sub: 'e-Stamp & register', href: '/account' },
      { label: 'Registration Service', sub: 'End-to-end support', href: '/account' },
    ],
  },
];

export interface ServiceCard {
  title: string;
  icon: string; // path under /landing
  prompts: string[];
  cta: string;
  tone: string; // gradient classes
}

export const serviceCards: ServiceCard[] = [
  {
    title: 'Property Verification',
    icon: '/landing/property-verification-icon.png',
    prompts: ['Unsure About Legal Documents?', 'Want a Clear Title Check?', 'Buying Property Remotely?', 'Worried About Property Fraud?'],
    cta: 'Get Property Verified',
    tone: 'from-amber-50 to-amber-100/60',
  },
  {
    title: 'Expert Consultation',
    icon: '/landing/expert-consultation-icon.png',
    prompts: ['Need Expert Advice?', 'Facing Property Issues?', 'Want Legal Clarity?', 'Looking for Quick Resolution?'],
    cta: 'Consult with our Expert',
    tone: 'from-sky-50 to-sky-100/60',
  },
  {
    title: 'Legal Opinion',
    icon: '/landing/legal-opinion-icons.png',
    prompts: ['Want to Verify Chain of Documents?', 'Need a Loan?', 'Selling a Property?', 'Inherited a Property?'],
    cta: 'Get a Legal Opinion',
    tone: 'from-violet-50 to-violet-100/60',
  },
  {
    title: 'Consult a Lawyer',
    icon: '/landing/lawer-consultation-icon.png',
    prompts: ['Facing a Property Dispute?', 'Boundary Disagreement?', 'Encroachment Issue?', 'Need Court Guidance?'],
    cta: 'Talk to a Lawyer',
    tone: 'from-emerald-50 to-emerald-100/60',
  },
];

export interface Testimonial {
  title: string;
  body: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    title: 'Saved Me from a Scam',
    body: "Ribil's thorough property review uncovered a suspicious double registration on a home I was about to purchase, preventing me from falling into a fraudulent deal.",
    name: 'Gangadhar Naidu',
    role: 'Investor, Bengaluru',
  },
  {
    title: 'Trusted Property Deals',
    body: 'I nearly bought a disputed property through a broker, but Ribil was a game changer, showing me a clear-title check at a fair price. Highly recommended for anyone buying land.',
    name: 'Krishnamurthy',
    role: 'Property Buyer, Mysuru',
  },
  {
    title: 'Lightning-Fast Service',
    body: 'Excellent experience! Received my RTC and EC within a minute of payment. Reliable service, prompt support, and a truly trustworthy app for all property needs.',
    name: 'M. Avesh',
    role: 'Property Buyer, Hubballi',
  },
  {
    title: 'Perfect for Professionals',
    body: 'Ribil is an excellent platform for quick access to land and property documents. Easy, affordable, and a must-have for every real estate professional in Karnataka.',
    name: 'Mohan',
    role: 'Real Estate Consultant, Bengaluru',
  },
  {
    title: 'Quick and Hassle-Free',
    body: 'Very satisfied with Ribil! Got my village map and survey documents instantly without any hassle. Simple, fast, and highly useful for every landowner.',
    name: 'Siva Krishna',
    role: 'Landowner, Ballari',
  },
];

export const stats = [
  { value: '4.8', label: 'Playstore rating' },
  { value: '7 Lakh+', label: 'Happy customers' },
  { value: '20,000+', label: 'User consultations' },
  { value: '1 Crore+', label: 'Document searches' },
];

export const trustBadges = [
  { src: '/landing/startup-india.png', alt: 'Startup India', group: 'Recognized by' },
  { src: '/landing/mca-india.png', alt: 'Ministry of Corporate Affairs', group: 'Registered with' },
  { src: '/landing/digilocker-india.png', alt: 'DigiLocker', group: 'Partnered with' },
];

export const socials = [
  { src: '/landing/facebook.svg', alt: 'Facebook', href: '#' },
  { src: '/landing/instagram.svg', alt: 'Instagram', href: '#' },
  { src: '/landing/twitter.svg', alt: 'Twitter', href: '#' },
  { src: '/landing/linkedin.svg', alt: 'LinkedIn', href: '#' },
  { src: '/landing/youtube.svg', alt: 'YouTube', href: '#' },
];
