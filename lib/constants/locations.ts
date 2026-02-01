export const COUNTRIES = [
  { value: "ethiopia", label: "Ethiopia" },
  { value: "kenya", label: "Kenya" },
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "south-africa", label: "South Africa" },
  { value: "tanzania", label: "Tanzania" },
  { value: "uganda", label: "Uganda" },
] as const;

/** E.164 country calling code (no +). Used to enforce phone prefix per country. */
export const COUNTRY_PHONE_CODES: Record<string, string> = {
  ethiopia: "251",
  kenya: "254",
  nigeria: "234",
  ghana: "233",
  "south-africa": "27",
  tanzania: "255",
  uganda: "256",
};

/** Approximate [lat, lng] for map center by city label (e.g. "Nairobi"). */
export const CITY_COORDINATES: Record<string, [number, number]> = {
  "Addis Ababa": [9.032, 38.747],
  "Dire Dawa": [9.593, 41.866],
  Mekelle: [13.496, 39.475],
  Nairobi: [-1.292, 36.822],
  Mombasa: [-4.044, 39.668],
  Kisumu: [-0.102, 34.762],
  Nakuru: [-0.303, 36.08],
  Lagos: [6.524, 3.379],
  Abuja: [9.076, 7.398],
  Kano: [12.002, 8.592],
  Ibadan: [7.377, 3.947],
  Accra: [5.603, -0.187],
  Kumasi: [6.689, -1.624],
  Tamale: [9.404, -0.843],
  Johannesburg: [-26.205, 28.04],
  "Cape Town": [-33.925, 18.424],
  Durban: [-29.859, 31.029],
  "Dar es Salaam": [-6.793, 39.208],
  Dodoma: [-6.163, 35.752],
  Mwanza: [-2.517, 32.9],
  Kampala: [0.347, 32.582],
  Entebbe: [0.056, 32.437],
  Gulu: [2.775, 32.299],
};

export const CITIES_BY_COUNTRY: Record<string, { value: string; label: string }[]> = {
  ethiopia: [
    { value: "addis-ababa", label: "Addis Ababa" },
    { value: "dire-dawa", label: "Dire Dawa" },
    { value: "mekelle", label: "Mekelle" },
  ],
  kenya: [
    { value: "nairobi", label: "Nairobi" },
    { value: "mombasa", label: "Mombasa" },
    { value: "kisumu", label: "Kisumu" },
    { value: "nakuru", label: "Nakuru" },
  ],
  nigeria: [
    { value: "lagos", label: "Lagos" },
    { value: "abuja", label: "Abuja" },
    { value: "kano", label: "Kano" },
    { value: "ibadan", label: "Ibadan" },
  ],
  ghana: [
    { value: "accra", label: "Accra" },
    { value: "kumasi", label: "Kumasi" },
    { value: "tamale", label: "Tamale" },
  ],
  "south-africa": [
    { value: "johannesburg", label: "Johannesburg" },
    { value: "cape-town", label: "Cape Town" },
    { value: "durban", label: "Durban" },
  ],
  tanzania: [
    { value: "dar-es-salaam", label: "Dar es Salaam" },
    { value: "dodoma", label: "Dodoma" },
    { value: "mwanza", label: "Mwanza" },
  ],
  uganda: [
    { value: "kampala", label: "Kampala" },
    { value: "entebbe", label: "Entebbe" },
    { value: "gulu", label: "Gulu" },
  ],
};

export function getCitiesForCountry(countryValue: string) {
  return CITIES_BY_COUNTRY[countryValue] ?? [];
}

export function getCountryPhoneCode(countryValue: string): string {
  return COUNTRY_PHONE_CODES[countryValue] ?? "254";
}

export function getCityCenter(cityLabel: string): [number, number] | null {
  const coords = CITY_COORDINATES[cityLabel];
  return coords ?? null;
}
