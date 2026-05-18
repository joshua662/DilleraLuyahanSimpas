import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { loadGoogleMaps } from "../../utils/googleMaps";
import { fetchAddressSuggestions, getGoogleMapsApiKey, type AddressSuggestion } from "../../utils/addressSuggest";
import { BUSINESS } from "../../utils/constants";

export interface AddressValue {
  address: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  value: string;
  onChange: (data: AddressValue) => void;
  placeholder?: string;
  error?: string;
}

const AddressAutocomplete = ({
  value,
  onChange,
  placeholder = "Start typing your address…",
  error,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const apiKey = getGoogleMapsApiKey();
  const [googleReady, setGoogleReady] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const useNominatim = !apiKey || googleFailed;
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!apiKey || !inputRef.current) return;

    let cancelled = false;

    void loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return;

        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "ph" },
          fields: ["formatted_address", "geometry", "name"],
          types: ["address"],
        });

        autocomplete.setBounds(
          new window.google.maps.LatLngBounds(
            new window.google.maps.LatLng(BUSINESS.coordinates.lat - 0.15, BUSINESS.coordinates.lng - 0.15),
            new window.google.maps.LatLng(BUSINESS.coordinates.lat + 0.15, BUSINESS.coordinates.lng + 0.15)
          )
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const address = place.formatted_address || place.name || inputRef.current?.value || "";
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          onChangeRef.current({ address, latitude: lat, longitude: lng });
          setOpen(false);
          setSuggestions([]);
        });

        autocompleteRef.current = autocomplete;
        setGoogleReady(true);
      })
      .catch(() => {
        if (!cancelled) setGoogleFailed(true);
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [apiKey]);

  const runSearch = useCallback((text: string) => {
    if (!useNominatim || text.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    void fetchAddressSuggestions(text)
      .then((list) => {
        setSuggestions(list);
        setOpen(list.length > 0);
        setHighlight(-1);
      })
      .finally(() => setLoading(false));
  }, [useNominatim]);

  const pickSuggestion = (item: AddressSuggestion) => {
    onChange(item);
    setOpen(false);
    setSuggestions([]);
    setHighlight(-1);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleInputChange = (text: string) => {
    onChange({ address: text });
    if (!useNominatim) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(text), 350);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      pickSuggestion(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="space-y-1 relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-sky pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (useNominatim && suggestions.length) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 rounded-xl border border-border dark:border-slate-600 bg-surface dark:bg-slate-900 focus:ring-2 focus:ring-sky outline-none"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted animate-spin" />
        )}

        {open && suggestions.length > 0 && (
          <ul
            className="absolute z-50 left-0 right-0 top-full mt-1 max-h-56 overflow-y-auto rounded-xl border border-border dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg"
            role="listbox"
          >
            {suggestions.map((item, i) => (
              <li key={`${item.address}-${i}`} role="option" aria-selected={highlight === i}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickSuggestion(item)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-sky-light dark:hover:bg-sky/10 border-b border-border/50 dark:border-slate-700 last:border-0 ${
                    highlight === i ? "bg-sky-light dark:bg-sky/20" : ""
                  }`}
                >
                  {item.address}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted">
        {googleReady
          ? "Pick an address from Google suggestions"
          : useNominatim
            ? "Type 3+ characters — pick a suggestion from the list"
            : "Loading address suggestions…"}
      </p>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default AddressAutocomplete;
