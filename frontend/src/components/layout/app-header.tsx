import { safeGetCurrentUser } from "@/lib/api";
import { SiteHeader } from "./site-header";

export async function AppHeader({ dark = false }: { dark?: boolean }) {
  const currentUser = await safeGetCurrentUser();

  return <SiteHeader dark={dark} currentUser={currentUser} />;
}
