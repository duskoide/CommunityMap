import { AppHeader } from "@/components/layout/app-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card } from "@/components/ui/card";
import Image from "next/image";

const team = [
  {
    name: "Arghawisesa D. Arham",
    title: "UI/UX & Frontend Engineer",
    about: "Argha adalah mahasiswa Teknik Informatika ITB 2024 yang pada project ini berfokus pada keindahan visual dan kenyamanan pengguna. Sebagai UI/UX dan Frontend Engineer, Argha bertanggung jawab merancang antarmuka yang intuitif sekaligus mentransformasikannya menjadi kode yang responsif, interaktif, dan estetis.",
    image: "/argha.jpg"
  },
  {
    name: "Rafi Putra Nugraha",
    title: "Cloud Engineer & Project Manager",
    about: "Rafi adalah mahasiswa Sistem dan Teknologi Informasi ITB 2024 yang pada project ini menjembatani manajemen proyek dan teknologi. Mengemban peran sebagai PM dan Cloud Engineer, Rafi bertugas memastikan proyek berjalan tepat waktu serta merancang infrastruktur cloud yang efisien, aman, dan siap menghadapi pertumbuhan skala sistem.",
    image: "/rafipn.jpg"
  },
  {
    name: "Nashiruddin Akram",
    title: "Backend & QA Engineer",
    about: "Akram adalah mahasiswa Teknik Informatika ITB 2024 yang pada project ini menjaga performa dan keandalan sistem di balik layar. Sebagai Backend dan QA Engineer, Nashiruddin bertanggung jawab membangun arsitektur server serta API yang kokoh, sekaligus memastikan aplikasi bebas dari bug melalui pengujian yang ketat.",
    image: "/akram.jpg"
  },
];

export default function AboutPage() {
  return (
    <>
      <AppHeader />
      <main className="min-h-screen bg-[var(--background)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-black text-center text-[var(--asphalt)]">Tentang Kami</h1>
          
          <Card className="mt-10 p-8">
            <h2 className="text-2xl font-bold">Tentang Aplikasi</h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              CommunityMap adalah platform crowdsourcing yang dirancang untuk menghubungkan warga dengan pemerintah daerah secara real-time. Kami percaya bahwa infrastruktur publik yang baik bermula dari komunikasi yang transparan. Melalui peta interaktif, setiap laporan jalan rusak divisualisasikan dengan jelas agar petugas dapat menentukan prioritas perbaikan dengan cepat dan akurat.
            </p>
          </Card>

          <div className="mt-16">
            <h2 className="text-3xl font-black text-center text-[var(--asphalt)]">Orang di Balik CommunityMap</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {team.map((person, i) => (
                <Card key={i} className="flex flex-col items-center p-6 text-center">
                  <div className="relative size-32 overflow-hidden rounded-full border-4 border-[var(--surface-strong)] bg-gray-100">
                    <Image src={person.image} alt={person.name} fill className="object-cover" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{person.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-[var(--teal)]">{person.title}</p>
                  <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed">
                    {person.about}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
