import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { getReports } from "@/lib/api";

export default async function AdminPage() {
  const reports = await getReports();

  return <AdminDashboard initialReports={reports} />;
}
