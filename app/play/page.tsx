import GoBoard from "@/components/goban/GoBoard";
import Link from "next/link";

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-neutral-400 hover:text-white">
            ← Trang chủ
          </Link>

          <p className="text-sm text-neutral-500">MVP 1: Basic Go Board</p>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <GoBoard />
        </section>
      </div>
    </main>
  );
}