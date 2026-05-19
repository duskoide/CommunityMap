"use client";

import { ArrowRight, ChevronDown, MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export function HeroScene() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[var(--asphalt)] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_24_38_/_18%),rgb(7_24_38_/_24%)_45%,rgb(7_24_38_/_76%))]" />
        <div className="map-grid absolute inset-x-0 top-0 h-[78%] opacity-70" />
        <div className="absolute inset-x-[-8%] bottom-[-8%] h-[52%] rotate-[-2deg] road-texture shadow-[0_-20px_80px_rgb(7_24_38_/_45%)]" />
        <div className="absolute left-[56%] top-[20%] hidden h-52 w-80 rounded-[40%] border border-white/28 md:block" />
        <RouteLayer />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h1 className="max-w-[13ch] text-5xl font-black leading-[1.03] tracking-normal sm:text-6xl lg:text-7xl">
            Peta Kerawanan Jalan Real-Time
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/82 sm:text-lg">
            Laporkan titik jalan bermasalah, lihat kondisi sekitar, dan bantu
            petugas menentukan prioritas perbaikan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/report" className="min-h-12 px-5">
              Laporkan Jalan Sekarang
              <ArrowRight className="size-4" />
            </ButtonLink>
          </div>
        </div>

        <div className="pointer-events-none absolute right-4 top-[18%] hidden w-[420px] lg:block">
          <div className="rounded-lg border border-white/18 bg-white/12 p-4 shadow-[0_28px_80px_rgb(0_0_0_/_30%)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/75">
                Layer Peta & Rute
              </span>
              <span className="rounded-md bg-[var(--amber)] px-2 py-1 text-xs font-bold text-[var(--asphalt)]">
                Live
              </span>
            </div>
            <div className="relative h-60 overflow-hidden rounded-md bg-white/90">
              <div className="map-grid absolute inset-0 opacity-70" />
              <div className="absolute left-10 top-16 h-1 w-48 rotate-[-15deg] rounded-full bg-[var(--teal)]" />
              <div className="absolute left-32 top-28 h-1 w-36 rotate-[28deg] rounded-full bg-[var(--amber)]" />
              <FloatingPin className="left-16 top-11" color="var(--danger)" />
              <FloatingPin className="right-20 top-20" color="var(--amber)" />
              <FloatingPin className="bottom-12 left-40" color="var(--blue)" />
              <FloatingPin className="bottom-20 right-12" color="var(--green)" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-xs font-semibold text-white/72">
        <ChevronDown className="size-4 animate-bounce" />
        Scroll untuk melihat lebih lanjut
      </div>
    </section>
  );
}

function FloatingPin({ className, color }: { className: string; color: string }) {
  return (
    <span
      className={`absolute flex size-10 items-center justify-center rounded-full text-white shadow-[0_12px_30px_rgb(7_24_38_/_28%)] ${className}`}
      style={{ background: color }}
    >
      <MapPin className="size-5" />
    </span>
  );
}

function RouteLayer() {
  const pins = [
    ["left-[58%] top-[31%]", "var(--danger)"],
    ["left-[69%] top-[43%]", "var(--amber)"],
    ["left-[76%] top-[61%]", "var(--blue)"],
    ["left-[83%] top-[36%]", "var(--green)"],
  ] as const;

  return (
    <div className="absolute inset-0 hidden md:block">
      <svg
        className="absolute left-[54%] top-[24%] h-[42%] w-[36%]"
        viewBox="0 0 500 360"
        fill="none"
      >
        <path
          d="M34 78 C128 34 152 158 234 138 C322 116 305 254 452 238"
          stroke="#0f8e84"
          strokeWidth="6"
          strokeDasharray="18 16"
          strokeLinecap="round"
        />
        <path
          d="M115 282 C172 214 250 284 314 208 C356 160 393 180 462 96"
          stroke="#f5c518"
          strokeWidth="5"
          strokeDasharray="12 15"
          strokeLinecap="round"
        />
      </svg>
      {pins.map(([className, color]) => (
        <FloatingPin key={className} className={className} color={color} />
      ))}
    </div>
  );
}
