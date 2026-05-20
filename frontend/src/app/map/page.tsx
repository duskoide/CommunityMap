import { AppHeader } from "@/components/layout/app-header";
import { PublicMap } from "@/components/map/public-map";
import { getReports } from "@/lib/api";

export default async function MapPage() {
  const reports = await getReports();

  return (
    <>
      <AppHeader />
      <main className="bg-[var(--background)] p-3 sm:p-5">
        <PublicMap initialReports={reports} />
      </main>
    </>
  );
}
