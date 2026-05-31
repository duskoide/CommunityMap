import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-black text-center text-[var(--asphalt)]">Kebijakan Privasi</h1>
          
          <Card className="mt-10 p-8">
            <div className="prose prose-sm md:prose-base prose-slate max-w-none text-[var(--muted)]">
              <p>Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
              
              <h2 className="text-xl font-bold text-[var(--asphalt)] mt-6 mb-3">1. Informasi yang Kami Kumpulkan</h2>
              <p className="mb-4">
                Saat Anda menggunakan CommunityMap, kami dapat mengumpulkan informasi seperti lokasi GPS, alamat IP, email, dan foto yang Anda unggah untuk melaporkan masalah infrastruktur.
              </p>

              <h2 className="text-xl font-bold text-[var(--asphalt)] mt-6 mb-3">2. Penggunaan Informasi</h2>
              <p className="mb-4">
                Informasi yang kami kumpulkan digunakan secara eksklusif untuk memetakan laporan, memverifikasi masalah jalan, dan menyediakan pembaruan status perbaikan kepada Anda dan publik.
              </p>

              <h2 className="text-xl font-bold text-[var(--asphalt)] mt-6 mb-3">3. Keamanan Data</h2>
              <p className="mb-4">
                Kami berkomitmen untuk menjaga keamanan data Anda. Kami menggunakan langkah-langkah keamanan teknis yang wajar untuk mencegah akses, penggunaan, atau pengungkapan yang tidak sah atas informasi pribadi Anda.
              </p>

              <h2 className="text-xl font-bold text-[var(--asphalt)] mt-6 mb-3">4. Berbagi Informasi</h2>
              <p className="mb-4">
                Laporan kerusakan jalan dan foto yang Anda unggah akan ditampilkan secara publik di peta kami untuk kepentingan masyarakat luas. Informasi akun pribadi (seperti alamat email) tidak akan dibagikan ke pihak ketiga tanpa izin Anda.
              </p>

              <h2 className="text-xl font-bold text-[var(--asphalt)] mt-6 mb-3">5. Hubungi Kami</h2>
              <p>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui halaman Kontak.
              </p>
            </div>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
