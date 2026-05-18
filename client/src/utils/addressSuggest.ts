import { BUSINESS } from "./constants";

export interface AddressSuggestion {
  address: string;
  latitude?: number;
  longitude?: number;
}

/** OpenStreetMap Nominatim — free address suggestions (Philippines, biased near shop) */
export async function fetchAddressSuggestions(query: string): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "ph");
  url.searchParams.set("limit", "8");
  url.searchParams.set("addressdetails", "0");
  const { lat, lng } = BUSINESS.coordinates;
  url.searchParams.set("viewbox", `${lng - 0.25},${lat + 0.15},${lng + 0.25},${lat - 0.15}`);
  url.searchParams.set("bounded", "0");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];

  return data.map((item) => ({
    address: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
  }));
}

export function getGoogleMapsApiKey(): string | undefined {
  const raw = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.includes("your_google") || trimmed.length < 20) return undefined;
  return trimmed;
}
