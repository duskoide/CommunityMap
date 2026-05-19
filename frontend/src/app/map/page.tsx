import { SiteHeader } from "@/components/layout/site-header";
import { PublicMap } from "@/components/map/public-map";

export default function MapPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--background)] p-3 sm:p-5">
        <PublicMap />
      </main>
    </>
  );
}
