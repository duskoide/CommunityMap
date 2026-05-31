"use client";

import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  LocateFixed,
  MapPin,
  Plus,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Map, MapControls, MapMarker } from "@/components/ui/map";
import { categories } from "@/features/reports/catalog";
import { createReport, uploadAsset } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ReportCategorySlug } from "@/types/community-map";

const steps = ["Informasi", "Lokasi", "Tinjau & Kirim"];
export function ReportForm() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<ReportCategorySlug>("pothole");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("Jl. Ahmad Yani No. 45, Jakarta Pusat");
  const [district, setDistrict] = useState("Jakarta Pusat");
  const [latitude, setLatitude] = useState("-6.1817");
  const [longitude, setLongitude] = useState("106.8663");
  const [mapViewport, setMapViewport] = useState({
    latitude: -6.1817,
    longitude: 106.8663,
    zoom: 14,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"error" | "success">("error");
  const [pending, startTransition] = useTransition();
  const [locating, setLocating] = useState(false);

  interface NominatimSuggestion {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address?: {
      city?: string;
      county?: string;
      town?: string;
      village?: string;
      suburb?: string;
      state_district?: string;
    };
  }

  const [addressSuggestions, setAddressSuggestions] = useState<NominatimSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search for address
  useEffect(() => {
    if (!address || address.length < 4 || !showSuggestions) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            address
          )}&format=jsonv2&addressdetails=1&limit=5&countrycodes=id`,
          { headers: { Accept: "application/json" } }
        );
        if (response.ok) {
          const data = await response.json();
          setAddressSuggestions(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [address, showSuggestions]);

  function updateCoordinates(nextLatitude: number, nextLongitude: number) {
    setLatitude(nextLatitude.toFixed(6));
    setLongitude(nextLongitude.toFixed(6));
    setMapViewport((current) => ({
      ...current,
      latitude: nextLatitude,
      longitude: nextLongitude,
    }));
  }

  function handleFileChange(file: File | null) {
    setSelectedFile(file);
    if (file) setFeedback(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function resolveAddress(latitudeValue: string, longitudeValue: string) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitudeValue}&lon=${longitudeValue}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Gagal menerjemahkan koordinat menjadi alamat.");
    }

    const payload = (await response.json()) as {
      display_name?: string;
      address?: {
        road?: string;
        suburb?: string;
        village?: string;
        city?: string;
        county?: string;
        town?: string;
        state_district?: string;
      };
    };

    const nextAddress = payload.display_name;
    const parts = [];
    if (payload.address?.village) parts.push(payload.address.village);
    if (payload.address?.suburb) parts.push(payload.address.suburb);
    
    // Use city/county as fallback if village/suburb is missing
    if (parts.length === 0) {
      if (payload.address?.city) parts.push(payload.address.city);
      else if (payload.address?.county) parts.push(payload.address.county);
      else if (payload.address?.town) parts.push(payload.address.town);
      else if (payload.address?.state_district) parts.push(payload.address.state_district);
    }
    
    const nextDistrict = parts.length > 0 ? parts.join(", ") : undefined;

    if (nextAddress) {
      setAddress(nextAddress);
      setShowSuggestions(false);
    }

    if (nextDistrict) {
      setDistrict(nextDistrict);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setFeedbackTone("error");
      setFeedback("Browser ini tidak mendukung GPS lokasi.");
      return;
    }

    setLocating(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextLatitude = position.coords.latitude.toFixed(6);
        const nextLongitude = position.coords.longitude.toFixed(6);

        updateCoordinates(Number(nextLatitude), Number(nextLongitude));
        setAddress(`Koordinat GPS ${nextLatitude}, ${nextLongitude}`);
        setDistrict("Lokasi GPS");

        try {
          await resolveAddress(nextLatitude, nextLongitude);
          setShowSuggestions(false);
          setFeedbackTone("success");
          setFeedback("Lokasi berhasil diambil dari GPS dan alamat terisi otomatis.");
        } catch {
          setFeedbackTone("error");
          setFeedback(
            "Koordinat GPS berhasil diambil, tapi alamat lengkap belum ketemu. Kamu masih bisa edit manual.",
          );
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin GPS di browser untuk mengisi otomatis."
            : "Lokasi tidak bisa diambil sekarang. Coba lagi atau isi manual.";

        setFeedback(message);
        setFeedbackTone("error");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  if (submittedId) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[rgb(59_167_101_/_12%)] text-[var(--green)]">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-black">Laporan diterima</h1>
        <p className="mt-3 text-[var(--muted)]">
          Laporan baru sudah tersimpan di backend dengan ID <strong>{submittedId}</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={() => {
              setSubmittedId(null);
              setFeedback(null);
            }}
            variant="secondary"
          >
            Buat Laporan Lagi
          </Button>
          <Button onClick={() => window.location.assign("/history")}>
            Lihat Riwayat
          </Button>
        </div>
      </Card>
    );
  }

  const markerLatitude = Number.isFinite(Number(latitude))
    ? Number(latitude)
    : mapViewport.latitude;
  const markerLongitude = Number.isFinite(Number(longitude))
    ? Number(longitude)
    : mapViewport.longitude;

  return (
    <Card className="mx-auto max-w-5xl overflow-hidden">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <div className="flex items-center justify-center gap-3">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                  index <= step
                    ? "bg-[var(--teal)] text-white"
                    : "bg-[var(--surface-strong)] text-[var(--muted)]",
                )}
              >
                {index + 1}
              </span>
              <span className="hidden text-sm font-semibold text-[var(--muted)] sm:block">
                {label}
              </span>
              {index < steps.length - 1 && (
                <span className="h-px w-8 bg-[var(--border)] sm:w-16" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {feedback && (
          <div
            className={cn(
              "mb-5 rounded-lg px-4 py-3 text-sm",
              feedbackTone === "success"
                ? "border border-[rgb(59_167_101_/_24%)] bg-[rgb(59_167_101_/_10%)] text-[var(--green)]"
                : "border border-[rgb(239_59_45_/_24%)] bg-[rgb(239_59_45_/_8%)] text-[var(--danger)]",
            )}
          >
            {feedback}
          </div>
        )}

        {step === 0 && (
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <section>
              <h1 className="text-2xl font-black">Pilih Kategori</h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Pilih jenis masalah jalan yang paling sesuai dengan kondisi di
                lapangan.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categories.map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => setCategory(item.slug)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-4 text-left transition",
                      category === item.slug
                        ? "border-[var(--teal)] bg-[rgb(0_107_98_/_8%)]"
                        : "border-[var(--border)] bg-white hover:border-[var(--teal)]",
                    )}
                  >
                    <CategoryIcon slug={item.slug} />
                    <span className="text-sm font-bold">{item.name}</span>
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <h2 className="text-sm font-bold">Unggah Foto</h2>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Unggah minimal satu foto asli dari lokasi agar petugas dapat
                  memverifikasi kondisi jalan.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_120px]">
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-strong)] p-4 text-center transition hover:border-[var(--teal)]">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(event) =>
                        handleFileChange(event.target.files?.[0] || null)
                      }
                    />
                    <Camera className="size-6 text-[var(--muted)]" />
                    <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                      {selectedFile ? selectedFile.name : "Pilih foto laporan"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      JPG, PNG, WebP, atau GIF hingga 5MB
                    </p>
                  </label>
                  <div className="relative min-h-28 overflow-hidden rounded-lg border border-[var(--border)] bg-white">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Pratinjau foto laporan"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-28 items-center justify-center text-[var(--muted)]">
                        <Plus className="size-5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-sm font-bold">Informasi Laporan</h2>
              <div className="mt-3 flex flex-col gap-4">
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Judul Singkat
                  <input
                    className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                    placeholder="Contoh: Lubang besar di tengah jalan"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Deskripsi Lengkap
                  <textarea
                    className="min-h-[120px] rounded-md border border-[var(--border)] p-3 text-sm outline-none focus:border-[var(--teal)]"
                    placeholder="Jelaskan kondisi secara detail, seperti bahayanya, patokan lokasi, dsb..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                </label>
              </div>
            </section>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
            <section>
              <h1 className="text-2xl font-black">Tentukan Lokasi</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Gunakan GPS untuk lokasi otomatis atau geser pin pada peta
                untuk menandai titik masalah secara manual.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Button className="justify-start" onClick={useCurrentLocation} disabled={locating}>
                  <LocateFixed className="size-4" />
                  {locating ? "Mengambil Lokasi..." : "Gunakan Lokasi Saat Ini"}
                </Button>
                <p className="text-xs text-[var(--muted)]">
                  Saat diizinkan browser, tombol ini akan mengisi latitude,
                  longitude, dan mencoba menebak alamat terdekat secara otomatis.
                </p>
                <div className="relative flex flex-col gap-2 text-sm font-semibold">
                  Alamat Perkiraan
                  <input
                    className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                    value={address}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onChange={(event) => {
                      setAddress(event.target.value);
                      setShowSuggestions(true);
                    }}
                    placeholder="Contoh: Ciledug atau Institut Teknologi"
                  />
                  {showSuggestions && (isSearchingAddress || addressSuggestions.length > 0) && (
                    <div className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-md border border-[var(--border)] bg-white shadow-lg">
                      {isSearchingAddress ? (
                        <div className="px-3 py-3 text-xs text-[var(--muted)]">Mencari...</div>
                      ) : (
                        <ul className="max-h-60 overflow-y-auto">
                          {addressSuggestions.map((suggestion) => (
                            <li key={suggestion.place_id}>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-[rgb(0_107_98_/_8%)]"
                                onMouseDown={(e) => {
                                  // Use onMouseDown instead of onClick to fire before input onBlur
                                  e.preventDefault();
                                  const lat = Number(suggestion.lat);
                                  const lon = Number(suggestion.lon);
                                  
                                  const dparts = [];
                                  if (suggestion.address?.village) dparts.push(suggestion.address.village);
                                  if (suggestion.address?.suburb) dparts.push(suggestion.address.suburb);
                                  if (dparts.length === 0) {
                                    if (suggestion.address?.city) dparts.push(suggestion.address.city);
                                    else if (suggestion.address?.county) dparts.push(suggestion.address.county);
                                    else if (suggestion.address?.town) dparts.push(suggestion.address.town);
                                    else if (suggestion.address?.state_district) dparts.push(suggestion.address.state_district);
                                  }
                                  const nextDistrict = dparts.length > 0 ? dparts.join(", ") : "Lokasi GPS";
                                  
                                  setAddress(suggestion.display_name);
                                  setDistrict(nextDistrict);
                                  updateCoordinates(lat, lon);
                                  setShowSuggestions(false);
                                }}
                              >
                                {suggestion.display_name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <label className="flex flex-col gap-2 text-sm font-semibold">
                  Wilayah / Kota
                  <input
                    className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Latitude
                    <input
                      className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold">
                    Longitude
                    <input
                      className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--teal)]"
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                    />
                  </label>
                </div>
              </div>
            </section>
            <div className="relative min-h-[360px] overflow-hidden rounded-lg border border-[var(--border)] bg-white">
              <Map
                viewport={mapViewport}
                onViewportChange={setMapViewport}
                onMapClick={({ latitude: lat, longitude: lon }) => {
                  updateCoordinates(lat, lon);
                  setAddress(`Pin manual ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
                }}
                className="h-[420px] w-full"
              >
                <MapControls position="top-right" />
                <MapMarker
                  latitude={markerLatitude}
                  longitude={markerLongitude}
                  draggable
                  onDragEnd={({ latitude: lat, longitude: lon }) => {
                    updateCoordinates(lat, lon);
                    setAddress(`Pin manual ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
                  }}
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-[0_20px_40px_rgb(239_59_45_/_30%)]">
                  <MapPin className="size-6" />
                </span>
                </MapMarker>
              </Map>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-2xl font-black">Tinjau & Kirim</h1>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <ReviewItem
                label="Kategori"
                value={categories.find((item) => item.slug === category)?.name || "Lainnya"}
              />
              <ReviewItem label="Lokasi" value={address} />
              <ReviewItem label="Status Awal" value="Baru" />
            </div>
            <div className="mt-5 rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-4">
              <p className="text-sm font-bold">{title || "Judul laporan"}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {description || "Deskripsi laporan akan muncul di sini."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between border-t border-[var(--border)] px-5 py-4">
        <Button
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          <ArrowLeft className="size-4" />
          Batal
        </Button>
        <Button
          disabled={pending}
          onClick={() => {
            if (step < 2) {
              if (step === 0 && !selectedFile) {
                setFeedbackTone("error");
                setFeedback("Foto laporan wajib diunggah sebelum menentukan lokasi.");
                return;
              }
              setStep((current) => current + 1);
              return;
            }

            setFeedback(null);
            setFeedbackTone("error");
            startTransition(async () => {
              try {
                if (!selectedFile) {
                  setFeedbackTone("error");
                  setFeedback("Foto laporan wajib diunggah.");
                  return;
                }
                const uploaded = await uploadAsset({
                  file: selectedFile,
                  purpose: "report",
                  alt: title,
                });
                const created = await createReport({
                  categorySlug: category,
                  title,
                  description,
                  address,
                  district,
                  latitude: Number(latitude),
                  longitude: Number(longitude),
                  imageUrl: uploaded.imageUrl,
                  imageAlt: uploaded.alt,
                  storageKey: uploaded.storageKey,
                });

                setSubmittedId(created.id);
              } catch (error) {
                setFeedbackTone("error");
                setFeedback(
                  error instanceof Error
                    ? error.message
                    : "Gagal mengirim laporan.",
                );
              }
            });
          }}
        >
          {step === 2 ? (pending ? "Mengirim..." : "Kirim Laporan") : "Selanjutnya"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </Card>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-xs font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-sm font-bold">{value}</p>
    </div>
  );
}
