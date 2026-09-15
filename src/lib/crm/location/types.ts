export const LOCATION_COMPONENTS = [
  'city',
  'state',
  'country',
  'region',
] as const;

export const DEFAULT_LOCATION_COMPONENTS: LocationComponent[] = [
  ...LOCATION_COMPONENTS,
];

export type LocationComponent = (typeof LOCATION_COMPONENTS)[number];

export type LocationInputMode = 'api' | 'manual';

export interface LocationValue {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  region?: string | null;
}

export type FieldStoredValue =
  | string
  | number
  | string[]
  | null
  | LocationValue;

export function emptyLocationValue(): LocationValue {
  return {
    city: null,
    state: null,
    country: null,
    region: null,
  };
}

export function isLocationValue(value: unknown): value is LocationValue {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return Object.keys(record).every(
    (key) =>
      LOCATION_COMPONENTS.includes(key as LocationComponent) &&
      (record[key] === null ||
        record[key] === undefined ||
        typeof record[key] === 'string'),
  );
}

export function normalizeLocationComponents(
  components: LocationComponent[] | undefined,
): LocationComponent[] {
  const unique = new Set<LocationComponent>();

  for (const component of components ?? []) {
    if (LOCATION_COMPONENTS.includes(component)) {
      unique.add(component);
    }
  }

  return LOCATION_COMPONENTS.filter((component) => unique.has(component));
}

export function normalizeLocationInputMode(
  mode: LocationInputMode | undefined,
): LocationInputMode {
  return mode === 'manual' ? 'manual' : 'api';
}

export function buildLocationDisplayLabel(
  value: LocationValue,
  components: LocationComponent[],
): string {
  return components
    .map((component) => value[component]?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join(', ');
}

export function formatLocationDisplayValue(value: LocationValue): string {
  return buildLocationDisplayLabel(value, [...LOCATION_COMPONENTS]);
}

export function isEmptyLocationValue(value: LocationValue): boolean {
  return !(
    value.city?.trim() ||
    value.state?.trim() ||
    value.country?.trim() ||
    value.region?.trim()
  );
}

export const LOCATION_COMPONENT_LABELS: Record<LocationComponent, string> = {
  city: 'City',
  state: 'State',
  country: 'Country',
  region: 'Region',
};
