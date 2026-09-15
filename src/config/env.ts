/**
 * Frontend env config — values come from `.env` at dev/build time.
 * Client-safe vars must use the NEXT_PUBLIC_ prefix.
 */
export const env = {
  backendInternalUrl:
    process.env.MARKOS_BACKEND_INTERNAL_URL ?? 'http://localhost:3008',
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME ?? 'Markos',
  loginHeroImage:
    process.env.NEXT_PUBLIC_LOGIN_HERO_IMAGE ?? '/images/login-hero.jpg',
} as const;
