import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <section className="max-w-3xl text-center space-y-8">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Go Vay AI
          </p>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Học, chơi và phân tích cờ vây bằng AI
          </h1>

          <p className="text-neutral-400 text-lg">
            Một nền tảng giúp người mới học cờ vây từ cơ bản đến nâng cao,
            chơi với người khác, đấu với máy và phân tích lại từng ván cờ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/play"
            className="rounded-full bg-amber-400 px-8 py-3 text-black font-semibold hover:bg-amber-300 transition"
          >
            Chơi thử bàn cờ
          </Link>

          <Link
            href="#"
            className="rounded-full border border-white/20 px-8 py-3 font-semibold hover:bg-white/10 transition"
          >
            Xem lộ trình học
          </Link>
        </div>
      </section>
    </main>
  );
}