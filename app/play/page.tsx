import PlayModeSelector from "@/components/play/PlayModeSelector";

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <PlayModeSelector />
      </div>
    </main>
  );
}