import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix des icônes par défaut (Leaflet ne les résout pas bien avec les bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface RegisterMapProps {
  lat: number | null;
  lng: number | null;
  onMapClick: (lat: number, lng: number) => void;
}

// Centre par défaut : Dakar (à ajuster si tu veux un autre pays par défaut)
const DEFAULT_LAT = 14.7167;
const DEFAULT_LNG = -17.4677;

export default function RegisterMap({ lat, lng, onMapClick }: RegisterMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialisation une seule fois
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const startLat = lat ?? DEFAULT_LAT;
    const startLng = lng ?? DEFAULT_LNG;

    const map = L.map(containerRef.current).setView([startLat, startLng], lat !== null ? 15 : 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    if (lat !== null && lng !== null) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }

    map.on('click', (e: L.LeafletMouseEvent) => {
      const newLat = e.latlng.lat;
      const newLng = e.latlng.lng;
      if (markerRef.current) markerRef.current.setLatLng([newLat, newLng]);
      else markerRef.current = L.marker([newLat, newLng]).addTo(map);
      onMapClick(newLat, newLng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync quand le parent change lat/lng (ex : bouton géolocalisation)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || lat === null || lng === null) return;
    map.setView([lat, lng], Math.max(map.getZoom(), 15));
    if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
    else markerRef.current = L.marker([lat, lng]).addTo(map);
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="h-[320px] w-full rounded-lg overflow-hidden border border-[var(--em-border)]"
      aria-label="Carte de localisation du siège"
    />
  );
}