// Swap this single configuration file when adapting the site to another roofer.
// Whop injects the business account ID at runtime; configure real plan IDs before selling.
export const site = {
  name: 'Boomerang Roofing',
  hero: 'Roof repair, replacement, and inspections from a local crew that treats your home with care.',
  area: 'Denver metro area, Colorado, USA',
  phone: '(303) 555-0147 (demo number)',
  email: 'thangenabil@gmail.com',
  accountId: 'biz_i7AWdtROMztPLW',
  leadProductId: 'prod_qlAtWqkVzmYze',
  invoiceProductId: 'prod_qlAtWqkVzmYze',
  heroVideo: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260715_090628_7052d8a6-a094-4341-a4a2-ad58493a67a9.mp4',
  checkoutUrl: '#contact',
} as const

export const services = [
  { key: 'repair', kicker: 'REPAIR', title: 'Roof repair', description: 'Track down leaks, storm damage, and worn details. Get a practical repair plan that protects the rest of your roof.' },
  { key: 'replacement', kicker: 'REPLACEMENT', title: 'Roof replacement', description: 'When patching is no longer the right answer, plan a full replacement with materials and timing explained up front.' },
  { key: 'inspection', kicker: 'INSPECTION', title: 'Roof inspection', description: 'A closer look at shingles, flashing, ventilation, and drainage, followed by a clear written condition report.' },
] as const

export const plans = {
  inspection: { name: 'Roof inspection', price: 149, id: 'plan_OSx3AsLPE0dFZ' },
  deposit: { name: 'Project deposit', price: 500, id: 'plan_icqTxoMo6e35c' },
  flat: { name: 'Leak repair visit', price: 299, description: 'Flat-rate leak repair visit. Confirm covered work and exclusions before booking.', id: 'plan_KIjflGrjbykJC' },
} as const
