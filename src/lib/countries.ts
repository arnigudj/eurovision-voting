export interface Country {
  name: string;
  code: string;              // ISO 3166-1 alpha-2
  autoFinalist?: boolean;    // true if Big Five; optional if false
}

export const COUNTRIES:Country[] = [
  { name: "Albania", code: "AL" },
  { name: "Armenia", code: "AM" },
  { name: "Australia", code: "AU" },
  { name: "Austria", code: "AT" },
  { name: "Azerbaijan", code: "AZ" },
  { name: "Belgium", code: "BE" },
  { name: "Croatia", code: "HR" },
  { name: "Cyprus", code: "CY" },
  { name: "Czechia", code: "CZ" },
  { name: "Denmark", code: "DK" },
  { name: "Estonia", code: "EE" },
  { name: "Finland", code: "FI" },
  { name: "France", code: "FR", autoFinalist: true },
  { name: "Georgia", code: "GE" },
  { name: "Germany", code: "DE", autoFinalist: true },
  { name: "Greece", code: "GR" },
  { name: "Iceland", code: "IS" },
  { name: "Ireland", code: "IE" },
  { name: "Israel", code: "IL" },
  { name: "Italy", code: "IT", autoFinalist: true },
  { name: "Latvia", code: "LV" },
  { name: "Lithuania", code: "LT" },
  { name: "Luxembourg", code: "LU" },
  { name: "Malta", code: "MT" },
  { name: "Montenegro", code: "ME" },
  { name: "Netherlands", code: "NL" },
  { name: "Norway", code: "NO" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "San Marino", code: "SM" },
  { name: "Serbia", code: "RS" },
  { name: "Slovenia", code: "SI" },
  { name: "Spain", code: "ES", autoFinalist: true },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Ukraine", code: "UA" },
  { name: "United Kingdom", code: "GB", autoFinalist: true },
];

export const AUTO_FINALISTS = COUNTRIES.filter(c => c.autoFinalist).map(c => c.code);

/**
 * Get the country name from the ISO 3166-1 alpha-2 code.
 * @param code - The ISO 3166-1 alpha-2 code of the country.
 * @returns The name of the country, or the code if not found.
 */
export function getCountryName(code: string): string {
  const country = COUNTRIES.find(c => c.code === code);
  return country ? country.name : code;
}

