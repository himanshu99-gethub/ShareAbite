import { useState, useRef, useEffect, useCallback } from "react";
import { X, MapPin, UtensilsCrossed, Package, Clock, Image, Loader2, Navigation, Phone } from "lucide-react";
import { toast } from "sonner";

// Leaflet loaded via CDN in __root.tsx
declare const L: any;

// ─── Standalone Map Picker Component ────────────────────────────────────────
// Separate component so its own useEffect([]) runs AFTER the div is mounted.
interface MapPickerInnerProps {
  initLat: number;
  initLng: number;
  onSelect: (lat: number, lng: number) => void;
}

function MapPickerInner({ initLat, initLng, onSelect }: MapPickerInnerProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Stable callback so we don't recreate marker on every parent re-render
  const onSelectRef = useRef(onSelect);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    if (!divRef.current) return;
    if (typeof L === "undefined") {
      console.error("Leaflet (L) not loaded yet");
      return;
    }

    // Create map
    const map = L.map(divRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([initLat, initLng], initLat !== 20.5937 ? 15 : 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Pin icon
    const pinIcon = () =>
      L.divIcon({
        html: `<div style="width:32px;height:32px;border-radius:50%;background:#48864b;border:3px solid white;box-shadow:0 3px 12px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font-size:15px;">📍</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        className: "",
      });

    // Show initial marker if we have a real location
    if (initLat !== 20.5937) {
      markerRef.current = L.marker([initLat, initLng], { icon: pinIcon() })
        .addTo(map)
        .bindPopup("<strong style='font-family:system-ui'>Aapki location</strong>")
        .openPopup();
    }

    // Click to place/move marker
    map.on("click", async (e: any) => {
      const { lat, lng } = e.latlng;

      if (markerRef.current) markerRef.current.remove();
      markerRef.current = L.marker([lat, lng], { icon: pinIcon() })
        .addTo(map)
        .bindPopup("<strong style='font-family:system-ui'>Pickup Location</strong>")
        .openPopup();

      onSelectRef.current(lat, lng);

      // Reverse geocode
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        // Pass address data via a custom event so parent can fill fields
        const evt = new CustomEvent("map-geocode", { detail: data.address ?? {} });
        window.dispatchEvent(evt);
      } catch {
        // ignore
      }
    });

    mapRef.current = map;

    // MUST call invalidateSize after mount so Leaflet knows the real dimensions
    setTimeout(() => {
      map.invalidateSize(true);
    }, 50);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty deps — run once on mount

  return (
    <div
      ref={divRef}
      style={{
        height: "260px",
        width: "100%",
        display: "block",
        position: "relative",
        zIndex: 0,
        background: "#e8f4e8",
      }}
    />
  );
}
// ────────────────────────────────────────────────────────────────────────────

interface NewDonationFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  donorId: string;
}

export function NewDonationForm({ open, onClose, onCreated, donorId }: NewDonationFormProps) {
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [contactPhone, setContactPhone] = useState("");
  const [windowStart, setWindowStart] = useState("");
  const [windowEnd, setWindowEnd] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Listen for reverse geocode results from map clicks
  useEffect(() => {
    const handler = (e: Event) => {
      const addr = (e as CustomEvent).detail;
      if (!addr) return;
      if (addr.road || addr.suburb)
        setStreet([addr.road, addr.suburb].filter(Boolean).join(", "));
      if (addr.city || addr.town || addr.county || addr.state_district)
        setCity(addr.city || addr.town || addr.county || addr.state_district || "");
      if (addr.postcode) setPincode(addr.postcode);
    };
    window.addEventListener("map-geocode", handler);
    return () => window.removeEventListener("map-geocode", handler);
  }, []);

  if (!open) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`
          );
          const data = await res.json();
          if (data.address) {
            const addr = data.address;
            if (addr.road || addr.suburb)
              setStreet([addr.road, addr.suburb].filter(Boolean).join(", "));
            if (addr.city || addr.town || addr.county || addr.state_district)
              setCity(addr.city || addr.town || addr.county || addr.state_district || "");
            if (addr.postcode) setPincode(addr.postcode);
          }
        } catch { /* ignore */ }
        setIsGeolocating(false);
        toast.success("Location detected ✅");
      },
      () => {
        setIsGeolocating(false);
        toast.error("Could not get your location");
      }
    );
  };

  const handleMapSelect = useCallback((lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAddress = [houseNo.trim(), street.trim(), city.trim(), pincode.trim()].filter(Boolean).join(", ");

    if (!foodType || !quantity || !finalAddress || !windowStart || !windowEnd) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!latitude || !longitude) {
      toast.error("Please select your location on the map or use Live Location");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Please enter your contact phone number");
      return;
    }
    if (new Date(windowEnd) <= new Date(windowStart)) {
      toast.error("Pickup end time must be after start time");
      return;
    }
    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      let photoUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${donorId}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("donation-photos")
          .upload(path, photoFile, { upsert: false });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from("donation-photos").getPublicUrl(path);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("donations").insert({
        donor_id: donorId,
        food_type: foodType.trim(),
        quantity: quantity.trim(),
        description: description.trim() || null,
        photo_url: photoUrl,
        pickup_address: finalAddress,
        latitude,
        longitude,
        contact_phone: contactPhone.trim(),
        pickup_window_start: new Date(windowStart).toISOString(),
        pickup_window_end: new Date(windowEnd).toISOString(),
        status: "available",
      } as any);

      if (error) throw error;
      toast.success("Donation listed successfully! 🎉");
      onCreated();
      onClose();
      // Reset
      setFoodType(""); setQuantity(""); setDescription("");
      setHouseNo(""); setStreet(""); setCity(""); setPincode("");
      setLatitude(null); setLongitude(null); setWindowStart(""); setWindowEnd("");
      setPhotoFile(null); setPhotoPreview(null); setContactPhone("");
      setShowMapPicker(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create donation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-4 sm:pt-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[96vh] overflow-y-auto animate-spring-up flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border/50 px-5 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="font-bold text-lg text-foreground leading-tight">New Donation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Share your surplus food with those who need it</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted/60 text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">

            {/* LEFT COLUMN */}
            <div className="space-y-3">
              {/* Food Type & Quantity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">
                    <span className="flex items-center gap-1"><UtensilsCrossed className="w-3.5 h-3.5 text-primary" /> Food Type *</span>
                  </label>
                  <input
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    placeholder="e.g. Rice, Bread"
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">
                    <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5 text-primary" /> Quantity *</span>
                  </label>
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 5 kg, 30 boxes"
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any allergens, dietary info, or other details..."
                  rows={1}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                />
              </div>

              {/* Contact Phone */}
              <div>
                <label className="block text-[13px] font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-primary" /> Contact Number *</span>
                </label>
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  type="tel"
                  required
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              {/* Pickup Location */}
              <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                <label className="block text-[13px] font-semibold text-foreground mb-2">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-primary" /> Pickup Location & Address *</span>
                </label>

                <div className="space-y-2.5">
                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleGeolocate}
                      disabled={isGeolocating}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        latitude && longitude
                          ? "border-emerald-500/20 bg-emerald-50 text-emerald-700"
                          : "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                      }`}
                    >
                      {isGeolocating ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting...</>
                      ) : (
                        <><Navigation className="w-3.5 h-3.5" /> Live Location</>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMapPicker((v) => !v)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border-2 text-xs font-bold transition-all ${
                        showMapPicker
                          ? "border-blue-500/30 bg-blue-50 text-blue-700"
                          : "border-blue-500/20 bg-blue-50/50 text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {showMapPicker ? "Hide Map" : "Map se Chunen"}
                    </button>
                  </div>

                  {/* Location status */}
                  {latitude && longitude && (
                    <p className="text-[10px] text-emerald-600 font-medium text-center bg-emerald-50 py-1 rounded-lg border border-emerald-100">
                      ✅ Location set: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                    </p>
                  )}

                  {/* Map Picker — rendered as separate component so useEffect([]) fires on mount */}
                  {showMapPicker && (
                    <div className="rounded-xl border border-blue-200 shadow-sm" style={{ overflow: "hidden" }}>
                      <div className="bg-blue-50 px-3 py-1.5 text-[11px] text-blue-600 font-medium border-b border-blue-100">
                        🗺️ Map par tap karein apni location select karne ke liye
                      </div>
                      <MapPickerInner
                        initLat={latitude ?? 20.5937}
                        initLng={longitude ?? 78.9629}
                        onSelect={handleMapSelect}
                      />
                    </div>
                  )}

                  {/* Address fields */}
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Detailed Address
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        placeholder="House/Shop No *"
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <input
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Street/Area *"
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City *"
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <input
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pincode *"
                        required
                        className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-[12px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-3 flex flex-col">
              {/* Pickup Window */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> From *</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={windowStart}
                    onChange={(e) => setWindowStart(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-foreground mb-1">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-primary" /> Until *</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={windowEnd}
                    onChange={(e) => setWindowEnd(e.target.value)}
                    required
                    className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              {/* Photo */}
              <div className="flex-1">
                <label className="block text-[13px] font-semibold text-foreground mb-1">
                  <span className="flex items-center gap-1"><Image className="w-3.5 h-3.5 text-primary" /> Photo (optional)</span>
                </label>
                <input type="file" ref={fileRef} accept="image/*" onChange={handlePhotoChange} className="hidden" />
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden h-16 border border-border/60">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-12 rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-all"
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-[11px] font-medium">Click to add a photo</span>
                  </button>
                )}
              </div>

              {/* Submit */}
              <div className="mt-auto pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Listing donation…
                    </span>
                  ) : (
                    "List Donation 🎉"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
