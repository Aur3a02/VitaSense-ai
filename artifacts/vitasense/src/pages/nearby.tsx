import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Clock, Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface Hospital {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  distance?: number;
  address?: string;
  phone?: string;
  openingHours?: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Nearby() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number } | null>(null);
  const [searched, setSearched] = useState(false);

  const findHospitals = () => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setUserLoc({ lat, lon });
        try {
          const radius = 5000;
          const query = `
            [out:json][timeout:25];
            (
              node["amenity"="hospital"](around:${radius},${lat},${lon});
              node["amenity"="clinic"](around:${radius},${lat},${lon});
              node["amenity"="doctors"](around:${radius},${lat},${lon});
              node["amenity"="pharmacy"](around:${radius},${lat},${lon});
              way["amenity"="hospital"](around:${radius},${lat},${lon});
            );
            out center 20;
          `;
          const resp = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            body: query,
          });
          const data = await resp.json();

          const results: Hospital[] = (data.elements || [])
            .map((el: Record<string, unknown>) => {
              const tags = (el.tags || {}) as Record<string, string>;
              const elLat = typeof el.lat === "number" ? el.lat : (el.center as Record<string, number>)?.lat;
              const elLon = typeof el.lon === "number" ? el.lon : (el.center as Record<string, number>)?.lon;
              if (!elLat || !elLon) return null;
              return {
                id: el.id,
                name: tags.name || "Healthcare Facility",
                type: tags.amenity || "hospital",
                lat: elLat,
                lon: elLon,
                distance: haversine(lat, lon, elLat, elLon),
                address: [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", "),
                phone: tags.phone || tags["contact:phone"],
                openingHours: tags.opening_hours,
              };
            })
            .filter(Boolean)
            .sort((a: Hospital, b: Hospital) => (a.distance ?? 99) - (b.distance ?? 99))
            .slice(0, 15);

          setHospitals(results);
          setSearched(true);
        } catch {
          setError("Failed to fetch nearby facilities. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError("Location access denied. Please allow location access in your browser and try again.");
        } else {
          setError("Unable to get your location. Please try again.");
        }
      },
      { timeout: 10000 }
    );
  };

  const getDirections = (h: Hospital) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`;
    window.open(url, "_blank");
  };

  const typeLabel: Record<string, string> = {
    hospital: "Hospital",
    clinic: "Clinic",
    doctors: "Doctor",
    pharmacy: "Pharmacy",
  };

  const typeColor: Record<string, string> = {
    hospital: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    clinic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    doctors: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    pharmacy: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  };

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-1">Nearby Healthcare</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Find hospitals, clinics, and pharmacies near your current location.
        </p>

        {!searched && (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="h-16 w-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Find Care Near You</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              We'll use your location to find the nearest hospitals, clinics, and pharmacies within 5 km.
            </p>
            <Button onClick={findHospitals} disabled={loading} size="lg">
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Navigation className="h-4 w-4 mr-2" />}
              {loading ? "Searching..." : "Find Nearby Facilities"}
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive mb-4">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {searched && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {hospitals.length} facilities found within 5 km
              </p>
              <Button variant="outline" size="sm" onClick={findHospitals} disabled={loading}>
                {loading ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Navigation className="h-3 w-3 mr-1" />}
                Refresh
              </Button>
            </div>

            {hospitals.length === 0 && !loading ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No healthcare facilities found within 5 km of your location.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {hospitals.map((h) => (
                  <Card key={h.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-foreground truncate">{h.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[h.type] ?? typeColor.hospital}`}>
                              {typeLabel[h.type] ?? "Facility"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            {h.distance !== undefined && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {h.distance < 1
                                  ? `${Math.round(h.distance * 1000)} m away`
                                  : `${h.distance.toFixed(1)} km away`}
                              </span>
                            )}
                            {h.address && (
                              <span className="truncate">{h.address}</span>
                            )}
                            {h.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {h.phone}
                              </span>
                            )}
                            {h.openingHours && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {h.openingHours}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => getDirections(h)}
                          className="shrink-0"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Directions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {userLoc && (
                  <div className="text-center pt-2">
                    <a
                      href={`https://www.google.com/maps/search/hospital/@${userLoc.lat},${userLoc.lon},14z`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Open full map view →
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
