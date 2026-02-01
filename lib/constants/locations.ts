export const COUNTRIES = [
  { value: "ethiopia", label: "Ethiopia" },
  { value: "kenya", label: "Kenya" },
  { value: "nigeria", label: "Nigeria" },
  { value: "ghana", label: "Ghana" },
  { value: "south-africa", label: "South Africa" },
  { value: "tanzania", label: "Tanzania" },
  { value: "uganda", label: "Uganda" },
] as const;

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
