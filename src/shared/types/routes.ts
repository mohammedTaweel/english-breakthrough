/**
 * Centralized route definitions.
 * Importing `ROUTES.today` is safer than scattering string literals.
 */
export const ROUTES = {
  root: '/',
  auth: '/auth',
  onboarding: '/onboarding',
  today: '/today',
  training: '/training',
  phrases: '/phrases',
  progress: '/progress',
  session: '/session/:scenarioId',
} as const;

export type RouteKey = keyof typeof ROUTES;
