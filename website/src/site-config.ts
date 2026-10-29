// Swap this single configuration file when adapting the site to another roofer.
// Whop injects the business account ID at runtime; configure real plan IDs before selling.
export const site = {
  name: 'Boomerang Roofing',
  hero: 'Roof repair, replacement, and inspections from a local crew that treats your home with care.',
  area: 'USA',
  phone: '[Your phone number]',
  email: 'hello@example.com',
  accountId: '',
  leadProductId: '',
  invoiceProductId: '',
  heroVideo: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4',
  checkoutUrl: '#contact',
  reviewPrompts: [
    'Replace with a real customer quote about communication and care.',
    'Replace with a verified review for a recent repair or replacement.',
    'Replace with a customer-approved quote about the finished project.',
  ],
} as const

export const services = [
  { key: 'repair', kicker: 'REPAIR', title: 'Roof repair', description: 'Track down leaks, storm damage, and worn details. Get a practical repair plan that protects the rest of your roof.' },
  { key: 'replacement', kicker: 'REPLACEMENT', title: 'Roof replacement', description: 'When patching is no longer the right answer, plan a full replacement with materials and timing explained up front.' },
  { key: 'inspection', kicker: 'INSPECTION', title: 'Roof inspection', description: 'A closer look at shingles, flashing, ventilation, and drainage, followed by a clear written condition report.' },
] as const

export const plans = {
  inspection: { name: 'Roof inspection', price: 149, id: '' },
  deposit: { name: 'Project deposit', price: 500, id: '' },
  flat: { name: 'Leak repair visit', price: 299, description: 'template example price; define covered work', id: '' },
} as const
