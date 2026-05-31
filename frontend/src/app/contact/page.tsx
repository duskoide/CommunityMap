import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-black text-[var(--asphalt)]">Kontak Kami</h1>
          <p className="mt-4 text-[var(--muted)]">Punya pertanyaan, kritik, atau saran? Hubungi kami lewat kontak di bawah.</p>
          
          <Card className="mt-10 p-8 text-left">
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg font-bold">Email</h3>
                <p className="mt-1 text-[var(--muted)]">support@communitymap.example.com</p>
              </div>
              <div>
                <h3 className="text-lg font-bold">Alamat</h3>
                <p className="mt-1 text-[var(--muted)]">
                  Jl. Teknologi No. 1<br />
                  Jakarta, Indonesia 12345
                </p>
              </div>
              <div>
                <h3 className="text-lg font-bold">Telepon</h3>
                <p className="mt-1 text-[var(--muted)]">+62 812-3456-7890</p>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
